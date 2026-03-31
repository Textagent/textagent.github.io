# OpenClaw is Now Live on TextAgent 🦀

**Date**: 2026-03-31

## What We Shipped

TextAgent's Agent Flow now has native, end-to-end integration with **OpenClaw** — running inside isolated Docker containers with full API key forwarding, multi-step context chaining, and structured JSON response parsing. Write a pipeline in your document, point it at OpenClaw, and execute it locally or in the cloud.

---

## How It Works

### The Syntax

In any TextAgent document, drop an Agent Flow block:

```markdown
{{@Agent:
  @cloud: no
  @agenttype: openclaw
  1. Research the latest trends in llm compression
  2. Summarize the findings as a comparison table
  3. Write a blog post draft from the summary
}}
```

Hit ▶ Run, and TextAgent:

1. **Checks Docker** — if Docker Desktop is running, proceeds immediately
2. **Builds the OpenClaw image** (first-time only, ~30 seconds) from `agents/openclaw/Dockerfile` using Node.js 22 + `npm install -g openclaw@latest`
3. **Starts a persistent container** — reused across all steps so you don't pay build cost twice
4. **Invokes the native OpenClaw CLI** per step:
   ```
   openclaw agent --session-id textagent-openclaw --local --message "..." --json --timeout 300
   ```
5. **Parses the structured JSON response** — extracts `.reply`, `.text`, `.message`, `.output`, or `.payloads[0].text` depending on what OpenClaw returns
6. **Chains context** — each step's output is automatically prepended as context for the next step
7. **Auto-stops the container** after 10 minutes of idle

### Cloud Mode

Flip `@cloud: yes` and the same pipeline runs on a free **GitHub Codespace** — no local Docker required. TextAgent provisions the Codespace via GitHub Device Flow (no backend, OAuth only), forwards your agent steps over `POST /api/exec`, and streams results back in real time.

---

## What Changed in the Code

### `agent-runner/agents/openclaw/Dockerfile`
Replaced the Python 3.12 placeholder with a real Node.js 22 image that installs OpenClaw via npm:

```dockerfile
FROM node:22-slim
WORKDIR /app
RUN npm install -g openclaw@latest
CMD ["tail", "-f", "/dev/null"]
```

### `agent-runner/server.js` — `AGENT_CLI_MAP`

The server now has a first-class concept of *known agents* that get native CLI invocation instead of raw shell execution:

```js
const AGENT_CLI_MAP = {
    'openclaw': {
        bin: 'openclaw',
        buildCmd: (message, context) => {
            const parts = [
                'openclaw', 'agent',
                '--session-id', 'textagent-openclaw',
                '--local',
                '--message', JSON.stringify(message),
                '--json',
                '--timeout', '300'
            ];
            return parts.join(' ');
        }
    },
    // openfang → daemon-based REST at 127.0.0.1:50051
};
```

### API Key Forwarding

All major provider keys are auto-forwarded from the host environment into the Docker container so OpenClaw can reach any LLM backend:

```js
const FORWARDED_ENV_KEYS = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_API_KEY',
    'GROQ_API_KEY',
    'MISTRAL_API_KEY',
    'TOGETHER_API_KEY',
    'OPENROUTER_API_KEY',
    'DEEPSEEK_API_KEY',
    'XAI_API_KEY',
];
```

### Structured Response Parsing

OpenClaw returns JSON. The server extracts the human-readable reply intelligently:

```js
const replyText =
    agentResponse.choices?.[0]?.message?.content  // OpenAI-compatible
    || agentResponse.payloads?.[0]?.text           // OpenClaw payloads
    || agentResponse.reply
    || agentResponse.text
    || agentResponse.message
    || agentResponse.output
    || rawResult.stdout;                           // Fallback to raw
```

### Security Boundaries

Every OpenClaw execution runs **inside a Docker container**, not on the host:

- Dangerous commands blocked (`rm -rf /`, `mkfs`, `dd if=`, fork bombs)
- Agent type sanitized (alphanumeric + hyphens only)
- 360-second timeout per command
- 64 KB output cap per stream
- Containers auto-removed on idle or SIGTERM

---

## Try It Now

1. Install [Docker Desktop](https://docs.docker.com/get-docker/)
2. Clone the agent runner:
   ```bash
   git clone https://github.com/textagent/agent-runner.git
   cd agent-runner
   node server.js
   ```
3. Open [TextAgent](https://textagent.github.io), paste an Agent Flow block with `@agenttype: openclaw`, and click ▶

---

## Files Changed

| File | Change |
|------|--------|
| `agent-runner/agents/openclaw/Dockerfile` | Python 3.12 → Node.js 22 + `npm install -g openclaw@latest` |
| `agent-runner/agents/openfang/Dockerfile` | Python 3.12 → Node.js 22 + `npm install -g openfang@latest` |
| `agent-runner/agents/openclaw/requirements.txt` | Cleared (Node.js-based) |
| `agent-runner/agents/openfang/requirements.txt` | Cleared (Node.js-based) |
| `agent-runner/server.js` | `AGENT_CLI_MAP`, `FORWARDED_ENV_KEYS`, native CLI invocation, JSON response parsing, idle timer |
| `agent-runner/scripts/setup.sh` | Removed git clone/pip; added API key guidance |
