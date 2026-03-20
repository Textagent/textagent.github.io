# Changelog: Agent Execution, Compose Mode & UI Enhancements

**Date:** 2026-03-20

## Agent Execution — `@agenttype` & `@cloud` Support

- **`@agenttype:` field** — Specify external agents (e.g., `openclaw`, `openfang`) for Agent Flow cards
  - Parsed in `ai-docgen.js`, stripped from step display, shown as blue badge on card header
  - Agent type **dropdown selector** added to card header (No Agent / openclaw / openfang)
  - Agent routing handled via `agent-cloud.js` → `server.js` Docker containers
- **`@cloud:` field** — Toggle between cloud (GitHub Codespaces) and local (Docker) execution
  - `@cloud: yes` → green "☁️ Cloud" badge, `@cloud: no` → gray "🖥️ Local" badge
  - Default Agent template now includes `@cloud: no` explicitly
  - `updateBlockField` fixed to preserve `@cloud: no` (was incorrectly stripping `'no'` values)
- **Docker-based local agent runner** (`agent-runner/`)
  - `server.js` — builds Docker images, manages container lifecycle, executes commands via `docker exec`
  - Dockerfiles for `openclaw` and `openfang` agents (Python 3.12)
  - `.devcontainer/devcontainer.json` for GitHub Codespaces (Python 3.12)
- **Agent Execution Settings UI** in GitHub auth modal
  - Provider selector: Codespaces / Local Docker / Custom Endpoint
  - Custom endpoint URL input with localStorage persistence

## Compose Mode — Floating Chat Composer

- **Floating Composer widget** — FAB button + expandable panel (replaces old overlay)
  - Blocks panel with expand/collapse, drag header
  - Chip bar (Format + Tags), slash menu, auto-resizing input
  - "Compose Mode" entry in QAB dropdown menu
- **CSS** — `css/composer.css` fully rewritten for floating panel UX
  - Mobile responsive (full-width panel on small screens)
  - Touch-friendly (always-visible block actions on hover:none)

## UI Polish

- Removed duplicate `title` attribute icons from doc-title chips
- Added extra view mode button spacing

## Files Changed

| File | Change |
|------|--------|
| `js/ai-docgen.js` | `@cloud`/`@agenttype` parsing, stripping, badge rendering, agent type dropdown, default template |
| `js/ai-docgen-generate.js` | Agent execution routing with `agentType` via opts |
| `js/agent-cloud.js` | `agentType` in request body, `forceLocal` option |
| `js/github-auth.js` | Agent execution settings wiring (provider + URL persistence) |
| `js/modal-templates.js` | Agent Execution Settings section in GitHub auth modal |
| `js/composer.js` | [NEW] Floating composer logic |
| `css/composer.css` | [NEW] Floating composer styles |
| `js/ui-panels.js` | Compose view mode support |
| `src/main.js` | Composer CSS + JS imports |
| `css/ai-docgen.css` | Cloud badge, agent type select, agenttype badge styles |
| `css/header.css` | View mode button styling |
| `styles.css` | Compose mode base styles |
| `index.html` | Floating composer HTML, QAB compose entry, doc-title cleanup |
| `agent-runner/` | [NEW] Docker-based local agent execution server |
| `tests/feature/agent-cloud.spec.js` | 24 tests (4 new for @agenttype) |
