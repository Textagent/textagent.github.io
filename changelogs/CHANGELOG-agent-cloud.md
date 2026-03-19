# Agent Cloud Execution — GitHub Codespaces Integration

- Added GitHub Device Flow OAuth module (`github-auth.js`) for zero-redirect, no-backend authentication
- Added Codespaces API adapter (`agent-cloud.js`) for creating, executing commands on, and managing ephemeral Codespaces
- Added GitHub auth modal to `modal-templates.js` reusing existing `ai-consent-modal` layout classes
- Added `@cloud: yes/no` field parsing in `ai-docgen.js` (alongside existing `@think:`, `@search:` fields)
- Added ☁️ cloud toggle button to Agent Flow card header (gated: opens GitHub auth if not signed in)
- Added cloud execution branch in `ai-docgen-generate.js` — routes Agent Flow steps to Codespaces when `@cloud: yes`
- Added Phase 3k module loading in `src/main.js` (after Draw Component)
- Added 5 new localStorage keys: `GITHUB_TOKEN`, `GITHUB_USER`, `AGENT_PROVIDER`, `AGENT_CODESPACE_ID`, `AGENT_CUSTOM_URL`
- Added CSS for cloud toggle active state, GitHub device code display, and spin animation
- Added 20 Playwright tests covering storage keys, auth modal, module APIs, `@cloud:` parsing, and toggle UI

---

## Summary

Integrates external agent execution (OpenClaw/OpenFang) via GitHub Codespaces into TextAgent's existing Agent Flow system. Users click ☁️ on any Agent card to route step execution to a free cloud Codespace instead of the local LLM. Authentication uses GitHub's Device Flow (no backend needed). Requires a GitHub OAuth App Client ID and a template repository to be configured before use.

---

## 1. GitHub Device Flow OAuth
**Files:** `js/github-auth.js` (NEW), `js/modal-templates.js`
**What:** IIFE module implementing GitHub's Device Flow: request device code → user enters code at github.com → poll for token → store in localStorage. Modal HTML injected via `modal-templates.js` reusing `ai-consent-modal` / `ai-apikey-content` classes.
**Impact:** Users can sign into GitHub directly from TextAgent without any backend, redirect URL, or client secret. Works from any origin including `file://`.

## 2. Codespaces API Adapter
**Files:** `js/agent-cloud.js` (NEW)
**What:** IIFE module exposing `M.agentCloud` with `run()`, `stop()`, `cleanup()`, `listRunning()`, `getStatus()`. Creates or reuses ephemeral Codespaces, executes commands via the template repo's HTTP API, auto-stops after 5 min idle. Includes custom endpoint fallback for E2B/Daytona.
**Impact:** Agent Flow steps can now execute arbitrary commands on cloud infrastructure instead of being limited to local LLM text generation.

## 3. Agent Flow `@cloud:` Field + Toggle
**Files:** `js/ai-docgen.js`, `js/ai-docgen-generate.js`
**What:** 3 edits to `ai-docgen.js`: regex parsing for `@cloud: yes/no`, ☁️ button in Agent card header, click handler that gates on auth. 1 edit to `ai-docgen-generate.js`: cloud execution branch in `generateAgentFlow()` that calls `M.agentCloud.run()` when `block.cloud` is true.
**Impact:** Users can toggle cloud execution per Agent card. The `@cloud: yes` directive persists in the markdown tag text.

## 4. Module Loading & Storage
**Files:** `src/main.js`, `js/storage-keys.js`
**What:** Added Phase 3k (`github-auth.js` + `agent-cloud.js`) after the Draw Component in the dynamic import chain. Added 5 new `textagent-*` prefixed keys to the central key registry.
**Impact:** Modules load automatically in correct dependency order. Settings persist across sessions.

## 5. CSS Styling
**Files:** `css/ai-docgen.css`
**What:** Cloud toggle `.active` state (blue accent), GitHub device code display (monospace, large, selectable), device flow instructions, spin animation for waiting indicator.
**Impact:** Consistent visual styling with existing think/search toggles. Dark and light theme support.

## 6. Automated Tests
**Files:** `tests/feature/agent-cloud.spec.js` (NEW)
**What:** 20 Playwright tests: storage key presence, GitHub auth modal DOM/visibility, `githubAuth` module API surface, `agentCloud` module API surface, `@cloud:` field parsing (yes/no/default/stripping), cloud toggle rendering and auth gate.
**Impact:** Full regression coverage for the new feature. All 20 tests pass.

---

## Files Changed (10 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/github-auth.js` | +215 | New — GitHub Device Flow OAuth |
| `js/agent-cloud.js` | +270 | New — Codespaces API adapter |
| `tests/feature/agent-cloud.spec.js` | +295 | New — 20 Playwright tests |
| `js/modal-templates.js` | +50 | GitHub auth modal HTML |
| `js/ai-docgen.js` | +30 | @cloud: parsing, ☁️ toggle, handler |
| `js/ai-docgen-generate.js` | +17 | Cloud execution branch |
| `js/storage-keys.js` | +7 | 5 agent execution keys |
| `src/main.js` | +4 | Phase 3k loading |
| `css/ai-docgen.css` | +76 | Cloud toggle + device code CSS |
| `changelogs/CHANGELOG-agent-cloud.md` | +57 | This changelog |
