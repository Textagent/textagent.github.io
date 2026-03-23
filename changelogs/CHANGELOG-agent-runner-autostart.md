# Agent Runner Auto-Start Fix

Eliminated the manual `cd agent-runner && node server.js` step for local agent execution during development.

## Problem

When using `@cloud: no` agent execution locally, users had to manually start the standalone agent-runner server on port 8080. This was confusing because the Vite plugin (`vite-plugin-agent-runner.js`) already embeds the full agent-runner API into the Vite dev server — no separate process needed.

**Root cause:** `github-auth.js` hardcoded `http://localhost:8080/api/exec` into localStorage when provider was set to `local`, bypassing the Vite plugin entirely.

## Changes

| File | Change |
|------|--------|
| `js/github-auth.js` | Removed hardcoded `localhost:8080` URL; now clears custom URL so `agent-cloud.js` defaults to `window.location.origin` (the Vite dev server) |
| `package.json` | Simplified `"dev"` script to just `"vite"` — removed redundant background `agent-runner/server.js` spawn |

## Impact

- `npm run dev` now serves the agent API automatically via the Vite plugin — zero manual steps
- The standalone `dev:agent` script is preserved for production/standalone use
- All 24 agent-cloud Playwright tests pass

## Files Changed (2)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/github-auth.js` | ~3 | Modified — removed hardcoded port 8080 URL |
| `package.json` | ~1 | Modified — simplified dev script |
