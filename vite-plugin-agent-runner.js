/**
 * vite-plugin-agent-runner.js — Vite dev server middleware
 *
 * Embeds the agent-runner Docker exec API directly into the Vite dev server
 * so that `npm run dev` automatically serves both the website AND the
 * /api/exec endpoint — zero separate server needed.
 *
 * Endpoints added:
 *   POST /api/exec   { command, agentType?, context? }
 *   GET  /health
 */
import { exec, execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname_plugin = dirname(fileURLToPath(import.meta.url));

const MAX_OUTPUT = 64 * 1024;
const TIMEOUT_MS = 120 * 1000;
const IDLE_STOP_MS = 10 * 60 * 1000;
const CONTAINER_PREFIX = 'textagent-agent-';
const IMAGE_PREFIX = 'textagent/';

const AGENT_CLI_MAP = {
    openclaw: {
        bin: 'openclaw',
        buildCmd: (message) => {
            return ['openclaw', 'agent', '--message', JSON.stringify(message), '--json', '--timeout', '90'].join(' ');
        }
    },
    openfang: {
        bin: 'openfang',
        buildCmd: (message) => {
            return ['openfang', 'agent', '--message', JSON.stringify(message), '--json', '--timeout', '90'].join(' ');
        }
    }
};

const FORWARDED_ENV_KEYS = [
    'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_API_KEY',
    'GOOGLE_GENERATIVE_AI_API_KEY', 'GROQ_API_KEY', 'MISTRAL_API_KEY',
    'TOGETHER_API_KEY', 'OPENROUTER_API_KEY', 'DEEPSEEK_API_KEY', 'XAI_API_KEY'
];

const containers = {};
const idleTimers = {};

function log(...args) {
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`[AgentRunner ${ts}]`, ...args);
}

function isDockerAvailable() {
    try { execSync('docker info', { stdio: 'ignore', timeout: 5000 }); return true; }
    catch { return false; }
}

function imageExists(agentType) {
    try {
        return execSync(`docker images -q ${IMAGE_PREFIX}${agentType}`, { encoding: 'utf8', timeout: 5000 }).trim().length > 0;
    } catch { return false; }
}

function buildImage(agentType) {
    const agentDir = join(__dirname_plugin, 'agent-runner', 'agents', agentType);
    if (!existsSync(join(agentDir, 'Dockerfile'))) throw new Error(`No Dockerfile for "${agentType}"`);

    log(`🔨 Building image ${IMAGE_PREFIX}${agentType}...`);
    execSync(`docker build -t ${IMAGE_PREFIX}${agentType} ${agentDir}`, {
        encoding: 'utf8', timeout: 300000, stdio: ['pipe', 'pipe', 'pipe']
    });
    log(`✅ Image ${IMAGE_PREFIX}${agentType} built`);
}

function isContainerRunning(name) {
    try {
        return execSync(`docker inspect -f '{{.State.Running}}' ${name} 2>/dev/null`, { encoding: 'utf8', timeout: 5000 }).trim() === 'true';
    } catch { return false; }
}

function ensureContainer(agentType) {
    const name = CONTAINER_PREFIX + agentType;
    if (isContainerRunning(name)) { containers[agentType] = name; return name; }

    try { execSync(`docker rm -f ${name} 2>/dev/null`, { stdio: 'ignore', timeout: 5000 }); } catch {}

    if (!imageExists(agentType)) buildImage(agentType);

    const envFlags = FORWARDED_ENV_KEYS.filter(k => process.env[k]).map(k => `-e ${k}=${process.env[k]}`).join(' ');
    log(`🚀 Starting container ${name}...`);
    execSync(`docker run -d --name ${name} ${envFlags} ${IMAGE_PREFIX}${agentType}`, { encoding: 'utf8', timeout: 30000 });
    containers[agentType] = name;
    log(`✅ Container ${name} started`);
    return name;
}

function dockerExec(containerName, command, timeoutMs) {
    return new Promise((resolve) => {
        const safeCmd = command.replace(/'/g, "'\\''");
        exec(`docker exec ${containerName} bash -c '${safeCmd}'`, {
            timeout: timeoutMs, maxBuffer: MAX_OUTPUT, env: { ...process.env, TERM: 'dumb' }
        }, (error, stdout, stderr) => {
            resolve({
                stdout: (stdout || '').substring(0, MAX_OUTPUT),
                stderr: (stderr || '').substring(0, MAX_OUTPUT),
                exitCode: error ? (error.code || 1) : 0
            });
        });
    });
}

function stopContainer(agentType) {
    const name = containers[agentType];
    if (!name) return;
    try { execSync(`docker stop ${name}`, { timeout: 15000, stdio: 'ignore' }); } catch {}
    try { execSync(`docker rm ${name}`, { timeout: 5000, stdio: 'ignore' }); } catch {}
    delete containers[agentType]; delete idleTimers[agentType];
}

function resetIdleTimer(agentType) {
    if (idleTimers[agentType]) clearTimeout(idleTimers[agentType]);
    idleTimers[agentType] = setTimeout(() => { log(`⏰ Idle timeout for ${agentType}`); stopContainer(agentType); }, IDLE_STOP_MS);
}

function hostExec(command, timeoutMs) {
    return new Promise((resolve) => {
        exec(command, { timeout: timeoutMs, maxBuffer: MAX_OUTPUT, env: { ...process.env, TERM: 'dumb' } },
            (error, stdout, stderr) => {
                resolve({ stdout: (stdout || '').substring(0, MAX_OUTPUT), stderr: (stderr || '').substring(0, MAX_OUTPUT), exitCode: error ? (error.code || 1) : 0 });
            });
    });
}

// ── Vite Plugin ──

export default function agentRunnerPlugin() {
    return {
        name: 'agent-runner',
        configureServer(server) {
            const agentDir = join(__dirname_plugin, 'agent-runner', 'agents');
            const agents = existsSync(agentDir) ? readdirSync(agentDir).filter(d => existsSync(join(agentDir, d, 'Dockerfile'))) : [];
            const docker = isDockerAvailable();
            log(`🐳 Docker: ${docker ? 'available' : '⚠ NOT AVAILABLE'}`);
            log(`📂 Agents: ${agents.join(', ') || 'none'}`);

            // Health check
            server.middlewares.use('/health', (req, res) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), docker, activeAgents: Object.keys(containers) }));
            });

            // Exec endpoint
            server.middlewares.use('/api/exec', (req, res) => {
                if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
                if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }

                let body = '';
                req.on('data', chunk => { body += chunk; if (body.length > 1024 * 1024) { res.writeHead(413); res.end('Too large'); req.destroy(); } });
                req.on('end', async () => {
                    log('📨 POST /api/exec');
                    let parsed;
                    try { parsed = JSON.parse(body); } catch { res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' })); return; }

                    const command = parsed.command;
                    const agentType = (parsed.agentType || '').trim().toLowerCase();

                    if (!command || typeof command !== 'string') { res.writeHead(400); res.end(JSON.stringify({ error: 'Missing "command"' })); return; }

                    // Safety checks
                    const blocked = [/rm\s+-rf\s+\/(?!\w)/i, /mkfs/i, /dd\s+if=/i, /:(){ :|:& };:/];
                    for (const p of blocked) { if (p.test(command)) { res.writeHead(403); res.end(JSON.stringify({ error: 'Command blocked' })); return; } }

                    try {
                        let result;
                        if (agentType) {
                            if (!isDockerAvailable()) {
                                res.setHeader('Content-Type', 'application/json');
                                res.writeHead(500);
                                res.end(JSON.stringify({ error: 'Docker not available. Install Docker Desktop.', stdout: '', stderr: 'Docker not running', exitCode: 1 }));
                                return;
                            }
                            if (!/^[a-z0-9-]+$/.test(agentType)) { res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid agent type' })); return; }

                            const dockerfile = join(__dirname_plugin, 'agent-runner', 'agents', agentType, 'Dockerfile');
                            if (!existsSync(dockerfile)) { res.writeHead(404); res.end(JSON.stringify({ error: `Unknown agent "${agentType}"` })); return; }

                            const containerName = ensureContainer(agentType);
                            const agentCli = AGENT_CLI_MAP[agentType];
                            let execCommand;

                            if (agentCli) {
                                let msg = command;
                                if (parsed.context) msg = 'Context from previous steps:\n' + parsed.context.substring(0, 3000) + '\n\nCurrent task: ' + command;
                                execCommand = agentCli.buildCmd(msg);
                                log(`🤖 ${agentCli.bin} CLI: ${execCommand.substring(0, 200)}`);
                            } else {
                                execCommand = command;
                            }

                            const rawResult = await dockerExec(containerName, execCommand, TIMEOUT_MS);

                            if (agentCli && rawResult.stdout) {
                                try {
                                    const resp = JSON.parse(rawResult.stdout);
                                    const reply = resp.reply || resp.text || resp.message || resp.output || rawResult.stdout;
                                    result = { stdout: typeof reply === 'string' ? reply : JSON.stringify(reply, null, 2), stderr: rawResult.stderr, exitCode: rawResult.exitCode };
                                } catch { result = rawResult; }
                            } else { result = rawResult; }

                            resetIdleTimer(agentType);
                        } else {
                            result = await hostExec(command, TIMEOUT_MS);
                        }

                        log(`📤 Response sent — exit=${result.exitCode}`);
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(result));
                    } catch (err) {
                        log(`❌ ${err.message}`);
                        res.setHeader('Content-Type', 'application/json');
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: err.message, stdout: '', stderr: err.message, exitCode: 1 }));
                    }
                });
            });

            // Cleanup on server close
            server.httpServer?.on('close', () => { Object.keys(containers).forEach(stopContainer); });
        }
    };
}
