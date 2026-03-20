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
const TIMEOUT_MS = 120 * 1000;      // 120s command timeout
const IDLE_STOP_MS = 10 * 60 * 1000; // Auto-stop containers after 10 min idle
const CONTAINER_PREFIX = 'textagent-agent-';
const IMAGE_PREFIX = 'textagent/';

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
        return false;
    }
}

/** Check if a Docker image exists */
function imageExists(agentType) {
    try {
        const result = execSync(`docker images -q ${IMAGE_PREFIX}${agentType}`, { encoding: 'utf8', timeout: 5000 });
        return result.trim().length > 0;
    } catch (e) {
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
        return result.trim() === 'true';
    } catch (e) {
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

    // Start container
    console.log(`[Docker] 🚀 Starting container ${containerName}...`);
    try {
        execSync(
            `docker run -d --name ${containerName} ${IMAGE_PREFIX}${agentType}`,
            { encoding: 'utf8', timeout: 30000 }
        );
        containers[agentType] = containerName;
        console.log(`[Docker] ✅ Container ${containerName} started`);
        return containerName;
    } catch (e) {
        throw new Error(`Failed to start container for "${agentType}": ${(e.stderr || e.message).substring(0, 300)}`);
    }
}

/** Execute a command inside a running container */
function dockerExec(containerName, command, timeoutMs) {
    return new Promise((resolve, reject) => {
        const safeCmd = command.replace(/'/g, "'\\''");
        const fullCmd = `docker exec ${containerName} bash -c '${safeCmd}'`;

        exec(fullCmd, {
            timeout: timeoutMs,
            maxBuffer: MAX_OUTPUT,
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

/** Stop a container */
function stopContainer(agentType) {
    const containerName = containers[agentType];
    if (!containerName) return;

    try {
        execSync(`docker stop ${containerName}`, { timeout: 15000, stdio: 'ignore' });
        execSync(`docker rm ${containerName}`, { timeout: 5000, stdio: 'ignore' });
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

    // Exec endpoint
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
            let parsed;
            try {
                parsed = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
            }

            const command = parsed.command;
            const agentType = (parsed.agentType || '').trim().toLowerCase();

            if (!command || typeof command !== 'string') {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing "command" field' }));
                return;
            }

            // Block dangerous patterns
            const blocked = [/rm\s+-rf\s+\/(?!\w)/i, /mkfs/i, /dd\s+if=/i, /:(){ :|:& };:/];
            for (const pattern of blocked) {
                if (pattern.test(command)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Command blocked for safety' }));
                    return;
                }
            }

            console.log(`[exec] ${new Date().toISOString()} agent=${agentType || 'host'} — ${command.substring(0, 120)}`);

            try {
                let result;

                if (agentType) {
                    // ── Docker execution path ──
                    if (!isDockerAvailable()) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: 'Docker is not available. Please install Docker Desktop and start it.',
                            stdout: '',
                            stderr: 'Docker is not running on this machine.',
                            exitCode: 1
                        }));
                        return;
                    }

                    // Validate agent type (only allow alphanumeric + hyphen)
                    if (!/^[a-z0-9-]+$/.test(agentType)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid agent type. Use lowercase letters, numbers, hyphens only.' }));
                        return;
                    }

                    // Check Dockerfile exists
                    const agentDir = path.join(__dirname, 'agents', agentType);
                    if (!fs.existsSync(path.join(agentDir, 'Dockerfile'))) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: `Unknown agent type "${agentType}". No Dockerfile found at agents/${agentType}/Dockerfile` }));
                        return;
                    }

                    // Ensure container is running (builds image + starts if needed)
                    const containerName = ensureContainer(agentType);

                    // Execute inside container
                    result = await dockerExec(containerName, command, TIMEOUT_MS);

                    // Reset idle timer
                    resetIdleTimer(agentType);
                } else {
                    // ── Host execution (no agent type specified) ──
                    result = await hostExec(command, TIMEOUT_MS);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (err) {
                console.error('[exec] Error:', err.message);
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
