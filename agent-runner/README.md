# TextAgent Agent Runner

Ephemeral execution environment for external AI agents (OpenClaw, OpenFang) via [TextAgent](https://textagent.github.io).

## How It Works

### Cloud Mode (`@cloud: yes`)
1. TextAgent creates a GitHub Codespace from this template repo
2. The devcontainer runs `scripts/setup.sh` → installs agents + starts the exec API
3. TextAgent sends commands via `POST /api/exec` → agents execute → results stream back

### Local Mode (`@cloud: no` + `@agenttype: openclaw`)
1. User runs `node server.js` locally
2. On first request with `agentType`, the server:
   - **Builds a Docker image** from `agents/<type>/Dockerfile`
   - **Starts a container** with all dependencies pre-installed
   - **Executes commands** inside the container via `docker exec`
3. Containers auto-stop after 10 minutes of idle
4. On next request, the **existing container is reused** (no rebuild)

```
TextAgent                 server.js                Docker
   │                         │                       │
   │─POST {command,          │                       │
   │  agentType:"openclaw"}─▶│                       │
   │                         │─docker build ─────────▶│ (first time only)
   │                         │─docker run ──────────▶│ (if not running)
   │                         │─docker exec command──▶│
   │                         │◀──── stdout/stderr ───│
   │◀── {stdout,stderr,     │                       │
   │     exitCode} ──────────│                       │
```

## Prerequisites

- **Docker Desktop** — [Install](https://docs.docker.com/get-docker/)
- **Node.js 18+** — [Install](https://nodejs.org/)

## Quick Start (Local)

```bash
git clone https://github.com/textagent/agent-runner.git
cd agent-runner
node server.js
```

Output:
```
🚀 TextAgent Agent Runner listening on port 8080
🐳 Docker: available
📂 Agents: openclaw, openfang
```

Then in TextAgent, write:
```markdown
{{@Agent:
  @cloud: no
  @agenttype: openclaw
  1. List installed Python packages
  2. Run the agent on sample data
}}
```

## API

### `POST /api/exec`

```json
{
  "command": "python -c 'print(\"hello from agent\")'",
  "agentType": "openclaw",
  "context": ""
}
```

**Response:**
```json
{
  "stdout": "hello from agent\n",
  "stderr": "",
  "exitCode": 0
}
```

- If `agentType` is specified → runs inside a Docker container
- If `agentType` is empty → runs directly on the host

### `GET /health`

```json
{
  "status": "ok",
  "uptime": 123.45,
  "docker": true,
  "activeAgents": ["openclaw"]
}
```

## Adding a New Agent

1. Create `agents/<name>/Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/<org>/<agent>.git /app/<name>
RUN pip install -r /app/<name>/requirements.txt
CMD ["tail", "-f", "/dev/null"]
```

2. Create `agents/<name>/requirements.txt` with Python deps

3. The server auto-discovers agents with Dockerfiles on startup

## Structure

```
agent-runner/
├── .devcontainer/
│   └── devcontainer.json     ← Codespaces config
├── agents/
│   ├── openclaw/
│   │   ├── Dockerfile        ← Python 3.11 + OpenClaw deps
│   │   └── requirements.txt
│   └── openfang/
│       ├── Dockerfile        ← Python 3.11 + OpenFang deps
│       └── requirements.txt
├── scripts/
│   └── setup.sh              ← Post-create setup (Codespaces)
├── server.js                 ← Exec API with Docker lifecycle
├── package.json
├── requirements.txt          ← Shared Python deps
└── README.md
```

## Security

- Commands blocked: `rm -rf /`, `mkfs`, `dd if=`, fork bombs
- Agent type validated: alphanumeric + hyphens only
- Each agent runs in an **isolated Docker container**
- 120s timeout per command, 64 KB max output
- Containers auto-stop after 10 min idle
- Graceful cleanup on SIGINT/SIGTERM

## License

MIT
