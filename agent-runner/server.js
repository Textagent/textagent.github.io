/**
 * server.js — TextAgent Agent Runner
 *
 * Local exec API with Docker-based agent isolation.
 * When an agentType is specified, the server:
 *   1. Builds a Docker image from agents/<type>/Dockerfile (if not built)
 *   2. Starts a container (or reuses a running one)
 *   3. Runs the command inside the container via `docker exec`
 *   4. Returns { stdout, stderr, exitCode }
 *
 * Without agentType, commands run directly on the host.
 *
 * POST /api/exec { command, agentType?, context? }
 * GET  /health
 */
const http = require('http');
const { exec, execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 8080;
const MAX_OUTPUT = 64 * 1024;       // 64 KB max per stream
const TIMEOUT_MS = 360 * 1000;      // 360s command timeout (allows local model inference)
const IDLE_STOP_MS = 10 * 60 * 1000; // Auto-stop containers after 10 min idle
const CONTAINER_PREFIX = 'textagent-agent-';
const IMAGE_PREFIX = 'textagent/';

// Agent CLI mapping — known agents are invoked via their native CLI
// instead of running the step description as a raw shell command
const AGENT_CLI_MAP = {
    'openclaw': {
        bin: 'openclaw',
        buildCmd: (message, context) => {
            const parts = ['openclaw', 'agent', '--session-id', 'textagent-openclaw', '--local', '--message', JSON.stringify(message), '--json', '--timeout', '300'];
            return parts.join(' ');
        }
    },
    'openfang': {
        bin: 'openfang',
        buildCmd: (message, context) => {
            // OpenFang is daemon-based — use REST API at 127.0.0.1:50051 (started automatically by container CMD)
            const payload = JSON.stringify({model: 'assistant', messages: [{role: 'user', content: message}]});
            return `curl -s -X POST http://127.0.0.1:50051/v1/chat/completions -H 'Content-Type: application/json' -d '${payload.replace(/'/g, "'\\''")}'`;
        }
    }
};

// API keys to forward from host env into agent containers
const FORWARDED_ENV_KEYS = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_API_KEY',
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'GROQ_API_KEY',
    'MISTRAL_API_KEY',
    'TOGETHER_API_KEY',
    'OPENROUTER_API_KEY',
    'DEEPSEEK_API_KEY',
    'XAI_API_KEY'
];

/** Timestamped log helper */
function log(...args) {
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`[${ts}]`, ...args);
}

// Track running containers and idle timers
const containers = {};   // { agentType: containerName }
const idleTimers = {};   // { agentType: timeoutId }

// ── Docker Helpers ──

/** Check if Docker is available */
function isDockerAvailable() {
    try {
        execSync('docker info', { stdio: 'ignore', timeout: 5000 });
        return true;
    } catch (e) {
        log('⚠️  Docker not available:', e.message);
        return false;
    }
}

/** Check if a Docker image exists */
function imageExists(agentType) {
    try {
        const result = execSync(`docker images -q ${IMAGE_PREFIX}${agentType}`, { encoding: 'utf8', timeout: 5000 });
        const exists = result.trim().length > 0;
        log(`🔍 Image ${IMAGE_PREFIX}${agentType}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
        return exists;
    } catch (e) {
        log(`🔍 Image check failed for ${agentType}:`, e.message);
        return false;
    }
}

/** Build Docker image for an agent type */
function buildImage(agentType) {
    const agentDir = path.join(__dirname, 'agents', agentType);
    const dockerfile = path.join(agentDir, 'Dockerfile');

    if (!fs.existsSync(dockerfile)) {
        throw new Error(`No Dockerfile found for agent "${agentType}" at ${agentDir}`);
    }

    console.log(`[Docker] 🔨 Building image ${IMAGE_PREFIX}${agentType}...`);
    try {
        execSync(`docker build -t ${IMAGE_PREFIX}${agentType} ${agentDir}`, {
            encoding: 'utf8',
            timeout: 300000, // 5 min max for build
            stdio: ['pipe', 'pipe', 'pipe']
        });
        console.log(`[Docker] ✅ Image ${IMAGE_PREFIX}${agentType} built successfully`);
        return true;
    } catch (e) {
        console.error(`[Docker] ❌ Build failed for ${agentType}:`, e.stderr || e.message);
        throw new Error(`Docker build failed for "${agentType}": ${(e.stderr || e.message).substring(0, 300)}`);
    }
}

/** Check if a container is running */
function isContainerRunning(containerName) {
    try {
        const result = execSync(
            `docker inspect -f '{{.State.Running}}' ${containerName} 2>/dev/null`,
            { encoding: 'utf8', timeout: 5000 }
        );
        const running = result.trim() === 'true';
        log(`🔍 Container ${containerName}: ${running ? 'RUNNING' : 'NOT RUNNING'}`);
        return running;
    } catch (e) {
        log(`🔍 Container ${containerName}: NOT FOUND`);
        return false;
    }
}

/** Start a container for an agent type (or reuse existing) */
function ensureContainer(agentType) {
    const containerName = CONTAINER_PREFIX + agentType;

    // Already running?
    if (isContainerRunning(containerName)) {
        console.log(`[Docker] ♻️  Reusing container ${containerName}`);
        containers[agentType] = containerName;
        return containerName;
    }

    // Remove stopped container with same name
    try {
        execSync(`docker rm -f ${containerName} 2>/dev/null`, { stdio: 'ignore', timeout: 5000 });
    } catch (e) { /* ignore */ }

    // Build image if needed
    if (!imageExists(agentType)) {
        buildImage(agentType);
    }

    // Build -e flags for API keys from host environment
    const envFlags = FORWARDED_ENV_KEYS
        .filter(k => process.env[k])
        .map(k => `-e ${k}=${process.env[k]}`)
        .join(' ');

    // Start container
    console.log(`[Docker] 🚀 Starting container ${containerName}...`);
    if (envFlags) log(`   Forwarding env keys: ${FORWARDED_ENV_KEYS.filter(k => process.env[k]).join(', ')}`);
    try {
        execSync(
            `docker run -d --name ${containerName} --add-host=host.docker.internal:host-gateway ${envFlags} ${IMAGE_PREFIX}${agentType}`,
            { encoding: 'utf8', timeout: 30000 }
        );
        containers[agentType] = containerName;
        console.log(`[Docker] ✅ Container ${containerName} started`);

        // For daemon-based agents, wait for the daemon to be ready
        if (AGENT_CLI_MAP[agentType] && agentType === 'openfang') {
            console.log(`[Docker] ⏳ Waiting for ${agentType} daemon to boot...`);
            waitForDaemonReady(containerName, 50051, 30000);
        }

        return containerName;
    } catch (e) {
        throw new Error(`Failed to start container for "${agentType}": ${(e.stderr || e.message).substring(0, 300)}`);
    }
}

/** Wait for a daemon port to become ready inside a container */
function waitForDaemonReady(containerName, port, maxWaitMs) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
        try {
            const result = execSync(
                `docker exec ${containerName} curl -sf -o /dev/null http://127.0.0.1:${port}/ 2>/dev/null && echo ready || echo waiting`,
                { encoding: 'utf8', timeout: 5000 }
            ).trim();
            if (result === 'ready') {
                log(`✅ Daemon ready on port ${port} (${Date.now() - start}ms)`);
                return;
            }
        } catch (e) { /* retry */ }
        execSync('sleep 1', { timeout: 2000 });
    }
    log(`⚠️  Daemon readiness timeout after ${maxWaitMs}ms — proceeding anyway`);
}

/** Execute a command inside a running container */
function dockerExec(containerName, command, timeoutMs) {
    return new Promise((resolve, reject) => {
        const safeCmd = command.replace(/'/g, "'\\''");
        const fullCmd = `docker exec ${containerName} bash -c '${safeCmd}'`;

        log(`🏃 Executing in ${containerName}:`);
        log(`   Command: ${command.substring(0, 200)}`);
        log(`   Timeout: ${timeoutMs}ms`);
        const execStart = Date.now();

        exec(fullCmd, {
            timeout: timeoutMs,
            maxBuffer: MAX_OUTPUT,
            env: { ...process.env, TERM: 'dumb' }
        }, (error, stdout, stderr) => {
            const elapsed = Date.now() - execStart;
            const result = {
                stdout: (stdout || '').substring(0, MAX_OUTPUT),
                stderr: (stderr || '').substring(0, MAX_OUTPUT),
                exitCode: error ? (error.code || 1) : 0
            };
            log(`✅ Execution complete in ${elapsed}ms`);
            log(`   exit=${result.exitCode} stdout=${result.stdout.length}B stderr=${result.stderr.length}B`);
            if (result.stdout) log(`   stdout: ${result.stdout.substring(0, 200)}`);
            if (result.stderr) log(`   stderr: ${result.stderr.substring(0, 200)}`);
            resolve(result);
        });
    });
}

/** Stop a container */
function stopContainer(agentType) {
    const containerName = containers[agentType];
    if (!containerName) return;

    try {
        execSync(`docker rm -f ${containerName}`, { timeout: 10000, stdio: 'ignore' });
        console.log(`[Docker] 🛑 Stopped and removed ${containerName}`);
    } catch (e) {
        console.warn(`[Docker] Warning: cleanup failed for ${containerName}:`, e.message);
    }
    delete containers[agentType];
    delete idleTimers[agentType];
}

/** Reset idle timer for an agent — stops container after IDLE_STOP_MS of no activity */
function resetIdleTimer(agentType) {
    if (idleTimers[agentType]) clearTimeout(idleTimers[agentType]);
    idleTimers[agentType] = setTimeout(() => {
        console.log(`[Docker] ⏰ Idle timeout for ${agentType}, stopping container...`);
        stopContainer(agentType);
    }, IDLE_STOP_MS);
}

/** Execute directly on host (no Docker, fallback) */
function hostExec(command, timeoutMs) {
    return new Promise((resolve) => {
        exec(command, {
            timeout: timeoutMs,
            maxBuffer: MAX_OUTPUT,
            cwd: __dirname,
            env: { ...process.env, TERM: 'dumb' }
        }, (error, stdout, stderr) => {
            resolve({
                stdout: (stdout || '').substring(0, MAX_OUTPUT),
                stderr: (stderr || '').substring(0, MAX_OUTPUT),
                exitCode: error ? (error.code || 1) : 0
            });
        });
    });
}

// ── Startup: recover already-running containers ──
try {
    const running = execSync(
        `docker ps --filter "name=${CONTAINER_PREFIX}" --format "{{.Names}}"`,
        { encoding: 'utf8', timeout: 5000 }
    ).trim();
    if (running) {
        running.split('\n').forEach(name => {
            const agentType = name.replace(CONTAINER_PREFIX, '');
            if (agentType) {
                containers[agentType] = name;
                console.log(`[Docker] 🔄 Recovered running container: ${name} (${agentType})`);
            }
        });
    }
} catch (e) { /* ignore scan errors */ }

// ── HTTP Server ──

const server = http.createServer((req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Health check
    if (req.method === 'GET' && req.url === '/health') {
        const docker = isDockerAvailable();
        const activeContainers = Object.keys(containers);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            uptime: process.uptime(),
            docker: docker,
            activeAgents: activeContainers
        }));
        return;
    }

    // ── Agent Status endpoint — scans Docker directly ──
    if (req.method === 'GET' && req.url === '/api/agents/status') {
        const agents = [];
        try {
            const running = execSync(
                `docker ps --filter "name=${CONTAINER_PREFIX}" --format "{{.Names}}|{{.Status}}|{{.CreatedAt}}"`,
                { encoding: 'utf8', timeout: 5000 }
            ).trim();
            if (running) {
                running.split('\n').forEach(line => {
                    const [name, dockerStatus, createdAt] = line.split('|');
                    const agentType = name.replace(CONTAINER_PREFIX, '');
                    if (agentType) {
                        containers[agentType] = name; // sync into in-memory map
                        agents.push({
                            agentType,
                            containerName: name,
                            status: 'running',
                            startedAt: createdAt || null,
                            uptime: dockerStatus || null,
                            model: 'Local Docker'
                        });
                    }
                });
            }
        } catch (e) { /* docker ps failed */ }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ agents, docker: true }));
        return;
    }

    // ── Agent Stop endpoint ──
    if (req.method === 'POST' && req.url === '/api/agents/stop') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            let parsed;
            try { parsed = JSON.parse(body); } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
            }
            const stopped = [];
            if (parsed.all) {
                // Stop all agent containers
                for (const agentType of Object.keys(containers)) {
                    log(`🛑 User requested stop: ${agentType}`);
                    stopContainer(agentType);
                    stopped.push(agentType);
                }
            } else if (parsed.agentType && containers[parsed.agentType]) {
                log(`🛑 User requested stop: ${parsed.agentType}`);
                stopContainer(parsed.agentType);
                stopped.push(parsed.agentType);
            } else if (parsed.agentType) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Agent "${parsed.agentType}" is not running` }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ stopped, remaining: Object.keys(containers) }));
        });
        return;
    }
    if (req.method === 'POST' && req.url === '/api/exec') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
            if (body.length > 1024 * 1024) {
                res.writeHead(413, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Request too large' }));
                req.destroy();
            }
        });

        req.on('end', async () => {
            log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            log('📨 POST /api/exec — Request received');
            log(`   Body size: ${body.length} bytes`);

            let parsed;
            try {
                parsed = JSON.parse(body);
            } catch (e) {
                log('❌ Invalid JSON body');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
            }

            const command = parsed.command;
            const agentType = (parsed.agentType || '').trim().toLowerCase();
            const requestStart = Date.now();

            log(`   agent:   ${agentType || '(none — host mode)'}`);
            log(`   command: ${(command || '').substring(0, 200)}`);
            log(`   context: ${parsed.context ? parsed.context.length + ' chars' : '(none)'}`);

            if (!command || typeof command !== 'string') {
                log('❌ Missing "command" field');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing "command" field' }));
                return;
            }

            // Block dangerous patterns
            const blocked = [/rm\s+-rf\s+\/(?!\w)/i, /mkfs/i, /dd\s+if=/i, /:(){ :|:& };:/];
            for (const pattern of blocked) {
                if (pattern.test(command)) {
                    log('🚫 Command BLOCKED (dangerous pattern)');
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Command blocked for safety' }));
                    return;
                }
            }

            log('✅ Command passed safety checks');

            try {
                let result;

                if (agentType) {
                    // ── Docker execution path ──
                    log('🐳 Docker execution path');

                    log('   Step 1/5: Checking Docker availability...');
                    if (!isDockerAvailable()) {
                        log('❌ Docker NOT available');
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: 'Docker is not available. Please install Docker Desktop and start it.',
                            stdout: '',
                            stderr: 'Docker is not running on this machine.',
                            exitCode: 1
                        }));
                        return;
                    }
                    log('   ✅ Docker is available');

                    // Validate agent type (only allow alphanumeric + hyphen)
                    log('   Step 2/5: Validating agent type...');
                    if (!/^[a-z0-9-]+$/.test(agentType)) {
                        log(`❌ Invalid agent type: "${agentType}"`);
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid agent type. Use lowercase letters, numbers, hyphens only.' }));
                        return;
                    }

                    // Check Dockerfile exists
                    const agentDir = path.join(__dirname, 'agents', agentType);
                    const dockerfilePath = path.join(agentDir, 'Dockerfile');
                    log(`   Step 3/5: Checking Dockerfile at ${dockerfilePath}`);
                    if (!fs.existsSync(dockerfilePath)) {
                        log(`❌ No Dockerfile found for "${agentType}"`);
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: `Unknown agent type "${agentType}". No Dockerfile found at agents/${agentType}/Dockerfile` }));
                        return;
                    }
                    log(`   ✅ Dockerfile found`);

                    // Ensure container is running (builds image + starts if needed)
                    log('   Step 4/5: Ensuring container is running...');
                    const containerName = ensureContainer(agentType);
                    log(`   ✅ Container ready: ${containerName}`);

                    // Step 5/5: Build and execute the agent command
                    // For known agents (openclaw/openfang), wrap in their native CLI
                    // For unknown agents, run as raw shell command
                    const agentCli = AGENT_CLI_MAP[agentType];
                    let execCommand;

                    if (agentCli) {
                        // ── Native CLI invocation ──
                        // Build message: include context from previous steps if available
                        let agentMessage = command;
                        if (parsed.context) {
                            agentMessage = 'Context from previous steps:\n' + parsed.context.substring(0, 3000)
                                + '\n\nCurrent task: ' + command;
                        }
                        execCommand = agentCli.buildCmd(agentMessage, parsed.context || '');
                        log(`   Step 5/5: Invoking ${agentCli.bin} CLI...`);
                        log(`   CLI command: ${execCommand.substring(0, 200)}`);
                    } else {
                        execCommand = command;
                        log('   Step 5/5: Executing raw command (unknown agent type)...');
                    }

                    const rawResult = await dockerExec(containerName, execCommand, TIMEOUT_MS);

                    // For known agents using --json, parse the structured response
                    if (agentCli && rawResult.stdout) {
                        try {
                            const agentResponse = JSON.parse(rawResult.stdout);
                            // Extract the reply text from the agent's JSON response
                            // Supports: OpenClaw format (.reply, .text, .message, .output, .payloads)
                            //           OpenFang/OpenAI format (.choices[0].message.content)
                            const replyText = (agentResponse.choices && agentResponse.choices[0] && agentResponse.choices[0].message && agentResponse.choices[0].message.content)
                                || (agentResponse.payloads && agentResponse.payloads[0] && agentResponse.payloads[0].text)
                                || agentResponse.reply
                                || agentResponse.text
                                || agentResponse.message
                                || agentResponse.output
                                || rawResult.stdout;
                            result = {
                                stdout: typeof replyText === 'string' ? replyText : JSON.stringify(replyText, null, 2),
                                stderr: rawResult.stderr,
                                exitCode: rawResult.exitCode
                            };
                            log(`   🤖 Agent reply: ${result.stdout.substring(0, 200)}`);
                        } catch (parseErr) {
                            // JSON parse failed — use raw output
                            log(`   ⚠️  Agent JSON parse failed, using raw output`);
                            result = rawResult;
                        }
                    } else {
                        result = rawResult;
                    }

                    // Reset idle timer
                    resetIdleTimer(agentType);
                    log(`   ⏱️  Idle timer reset (${IDLE_STOP_MS / 1000}s)`);
                } else {
                    // ── Host execution (no agent type specified) ──
                    log('🖥️  Host execution path (no agent type)');
                    result = await hostExec(command, TIMEOUT_MS);
                }

                const totalMs = Date.now() - requestStart;
                log(`📤 Response sent — ${totalMs}ms total`);
                log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (err) {
                const totalMs = Date.now() - requestStart;
                log(`❌ Error after ${totalMs}ms: ${err.message}`);
                log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: err.message,
                    stdout: '',
                    stderr: err.message,
                    exitCode: 1
                }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. Use POST /api/exec or GET /health' }));
});

// Cleanup on exit
process.on('SIGINT', () => {
    console.log('\n[Docker] 🧹 Cleaning up containers...');
    Object.keys(containers).forEach(stopContainer);
    process.exit(0);
});

process.on('SIGTERM', () => {
    Object.keys(containers).forEach(stopContainer);
    process.exit(0);
});

server.listen(PORT, '0.0.0.0', () => {
    const docker = isDockerAvailable();
    console.log(`🚀 TextAgent Agent Runner listening on port ${PORT}`);
    console.log(`🐳 Docker: ${docker ? 'available' : '⚠ NOT AVAILABLE — install Docker Desktop'}`);
    console.log(`📂 Agents: ${fs.readdirSync(path.join(__dirname, 'agents')).filter(d => {
        return fs.existsSync(path.join(__dirname, 'agents', d, 'Dockerfile'));
    }).join(', ') || 'none'}`);
});
