# Agent Container Management Panel

- Added floating `📦 Agent Containers` panel in header toolbar showing running Docker containers with status, uptime, and model info
- Added backend API endpoints (`GET /api/agents/status`, `POST /api/agents/stop`) to both `server.js` and `vite-plugin-agent-runner.js`
- Added frontend status/stop methods to `agent-cloud.js` (`getLocalStatus`, `stopLocalAgent`, `stopAllLocalAgents`)
- Status endpoint uses live `docker ps` scan instead of in-memory map — containers show up regardless of which server (8080/8877) started them
- Stop action uses `docker rm -f` for instant container termination (was `docker stop` + `docker rm` with ~10s delay)
- Added daemon readiness wait for OpenFang — polls port 50051 after container start to prevent first-run "connection refused" errors
- Added startup container scan — detects already-running `textagent-agent-*` containers on server restart
- Badge count on toolbar button auto-refreshes every 15 seconds
- Panel auto-refreshes every 5 seconds while open
- Stop All button to terminate all running agent containers at once

---

## Summary

Adds a real-time Docker container management panel to the TextAgent UI. Users can monitor running agent containers (OpenClaw, OpenFang) and stop them instantly from the toolbar. The panel uses live Docker inspection to always show accurate state, even across server restarts and multiple server processes.

---

## Files Changed (7 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/agent-panel.js` | +207 | New — Agent panel UI component |
| `css/agent-panel.css` | +140 | New — Panel styles (dark/light mode) |
| `js/agent-cloud.js` | +55 | Added status/stop API methods |
| `agent-runner/server.js` | +60 | Added status/stop endpoints, startup scan, readiness wait, instant stop |
| `vite-plugin-agent-runner.js` | +50 | Added status/stop middleware, startup scan, readiness wait, instant stop |
| `src/main.js` | +2 | Wired panel CSS and JS imports |
| `changelogs/CHANGELOG-agent-panel.md` | +30 | This changelog |
