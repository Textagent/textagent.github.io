# CHANGELOG — OpenClaw/OpenFang Docker Integration

**Date**: 2026-03-20

## Summary

Wired up OpenClaw and OpenFang Docker agents for real end-to-end execution from TextAgent's Agent Flow (`{{@Agent: @agenttype: openclaw ...}}`).

## Changes

- **Dockerfiles rewritten** — Replaced Python 3.12 placeholder images with Node.js 22 + npm-installed `openclaw`/`openfang` packages
- **Native CLI invocation** — `agent-runner/server.js` now wraps step descriptions in `openclaw agent --message "..." --json` (or `openfang agent`) instead of running them as raw shell commands
- **API key forwarding** — Host environment API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, etc.) are automatically forwarded into Docker containers via `-e` flags
- **Structured response parsing** — Agent JSON responses are parsed to extract reply text; falls back to raw stdout if parsing fails
- **Context chaining** — Previous step output is prepended to the agent message for multi-step flows
- **Setup script updated** — Removed stale `git clone` and `pip install` commands; added API key reminder and auto-discovery of agent Dockerfiles

## Files Changed

| File | Change |
|------|--------|
| `agent-runner/agents/openclaw/Dockerfile` | Python → Node.js 22 + `npm install -g openclaw@latest` |
| `agent-runner/agents/openfang/Dockerfile` | Python → Node.js 22 + `npm install -g openfang@latest` |
| `agent-runner/agents/openclaw/requirements.txt` | Cleared (Node.js-based, not Python) |
| `agent-runner/agents/openfang/requirements.txt` | Cleared (Node.js-based, not Python) |
| `agent-runner/server.js` | Added `AGENT_CLI_MAP`, `FORWARDED_ENV_KEYS`, native CLI invocation, JSON response parsing |
| `agent-runner/scripts/setup.sh` | Removed git clone/pip; added API key guidance |
