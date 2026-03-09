# File Decomposition — Refactor

- Split `ai-assistant.js` (2026→1033 lines) into 4 modules: core, `ai-chat.js`, `ai-actions.js`, `ai-image.js`
- Split `ai-docgen.js` (1314→347 lines) into 3 modules: core, `ai-docgen-generate.js`, `ai-docgen-ui.js`
- Split `executable-blocks.js` (1136→114 lines) into 4 modules: core bash, `exec-math.js`, `exec-python.js`, `exec-sandbox.js`
- Split `table-tools.js` (1017→475 lines) into 3 modules: core, `table-sort-filter.js`, `table-analytics.js`
- Added internal namespaces (`M._ai`, `M._docgen`, `M._exec`, `M._table`) for cross-module state sharing
- Updated `src/main.js` with phased dynamic imports (Phase 2 → Phase 2.5 for dependent sub-modules)

---

## Summary
Split 4 large JavaScript files (~5,500 total lines) into 14 focused modules to improve maintainability and isolate regressions by feature/service. Each module is encapsulated in an IIFE and uses internal namespaces for cross-module communication.

---

## 1. AI Assistant Decomposition
**Files:** `js/ai-assistant.js`, `js/ai-chat.js`, `js/ai-actions.js`, `js/ai-image.js`
**What:** Extracted chat UI/messaging/streaming to `ai-chat.js`, quick action chips/context menu/autocomplete to `ai-actions.js`, and image generation to `ai-image.js`. Core retains AI panel logic, model management, and worker lifecycle. Shared state via `M._ai`.
**Impact:** Regression in chat, actions, or image gen no longer risks breaking core AI panel initialization.

## 2. AI DocGen Decomposition
**Files:** `js/ai-docgen.js`, `js/ai-docgen-generate.js`, `js/ai-docgen-ui.js`
**What:** Extracted generation/review/agent flow logic to `ai-docgen-generate.js` and fill-all/toast/progress UI to `ai-docgen-ui.js`. Core retains tag parsing and preview rendering. Shared state via `M._docgen`.
**Impact:** Generation prompts and UI components can be modified independently of tag parsing.

## 3. Executable Blocks Decomposition
**Files:** `js/executable-blocks.js`, `js/exec-math.js`, `js/exec-python.js`, `js/exec-sandbox.js`
**What:** Extracted Math.js/LaTeX/Nerdamer to `exec-math.js`, Python/Pyodide to `exec-python.js`, and HTML/JS/SQL sandboxes to `exec-sandbox.js`. Core retains Bash execution + shared `escapeHtml` via `M._exec`.
**Impact:** Each language runtime is now independently maintainable; adding new languages requires only a new file.

## 4. Table Tools Decomposition
**Files:** `js/table-tools.js`, `js/table-sort-filter.js`, `js/table-analytics.js`
**What:** Extracted sort/filter/search to `table-sort-filter.js` and stats/chart to `table-analytics.js`. Core retains toolbar setup, cell editing, row/col CRUD, and export. Late-binding via `M._table`.
**Impact:** Sort/filter and analytics features can be modified without touching core table rendering.

## 5. Import Loading Phases
**Files:** `src/main.js`
**What:** Added Phase 2.5 for sub-modules that depend on Phase 2 namespaces (`M._exec`, `M._table`). All 10 new modules loaded in parallel within their respective phases.
**Impact:** Correct dependency ordering ensures namespace objects exist before sub-modules access them.

---

## Files Changed (15 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-assistant.js` | −993 | Trimmed core (extracted chat, actions, image) |
| `js/ai-chat.js` | +430 | NEW — Chat UI, messaging, streaming |
| `js/ai-actions.js` | +190 | NEW — Quick actions, context menu, autocomplete |
| `js/ai-image.js` | +220 | NEW — Image generation |
| `js/ai-docgen.js` | −967 | Trimmed core (extracted generation, UI) |
| `js/ai-docgen-generate.js` | +470 | NEW — Generation, review, agent flow |
| `js/ai-docgen-ui.js` | +200 | NEW — Fill-all, toast, download prompts |
| `js/executable-blocks.js` | −1022 | Trimmed core (extracted math, python, sandbox) |
| `js/exec-math.js` | +300 | NEW — Math.js + LaTeX/Nerdamer |
| `js/exec-python.js` | +170 | NEW — Python/Pyodide WASM |
| `js/exec-sandbox.js` | +320 | NEW — HTML, JS, SQL sandboxes |
| `js/table-tools.js` | −542 | Trimmed core (extracted sort/filter, analytics) |
| `js/table-sort-filter.js` | +255 | NEW — Sort, filter, search |
| `js/table-analytics.js` | +296 | NEW — Stats + bar chart |
| `src/main.js` | +9 | Added Phase 2.5 imports |
