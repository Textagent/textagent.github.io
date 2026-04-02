# Research Loop UX — Bug Fixes & Output Improvements

- Fixed: `@direction: higher/lower` now parsed correctly (previously `maximize`/`minimize` were silently ignored, defaulting to `lower` and discarding all improvements)
- Fixed: `research-loop.js` not loading locally — moved import from Phase 3g to Phase 3b-ext3, added try/catch to prevent silent crash
- Fixed: Table tools toolbar was hijacking the research results table (Sort/Filter/Search/Stats bar appeared, row counts were wrong, pagination broke expand behavior)
- Fixed: Results table `max-height: 350px` was clipping rows — raised to `600px` to show all 16 iterations
- Fixed: Code preview `max-height` reduced from `400px` to `200px` so results table gets adequate vertical space
- Fixed: Clicking a row now shows only the optimized `PROMPT` text, not the full Python scorer code
- Added: Prompt expand panel with `✨ Optimized Prompt — Score: XX` header and `📋 Copy` button on each row
- Added: DOMPurify `ADD_TAGS` expanded to include `input`, `label` — required for search pill checkboxes
- Added: DOMPurify `ADD_ATTR` expanded with `data-research-row`, `data-research-code-row`, `data-provider`, `checked`
- Added: Search pills panel (`🦆 DDG`, `🦁 Brave`, `🔎 Serper`, `🤖 Tavily`, `🔍 Google`, `📖 Wiki`) with API key prompt on first-select
- Added: `@search` config field parsing in `parseResearchConfig`
- Added: `🔍` search toggle button in card header, active state when a provider is selected
- Added: Iframe sandbox height limit raised from `800px` to `5000px` in exec-sandbox for taller HTML output
- Refactored: Code preview in card now shows full code (CSS handles overflow) instead of truncating at 8 lines

---

## Summary
This release fixes the core issues that broke the Research Loop on local dev: the direction parsing bug (discarding all improvements), the silent module load failure, and the table-tools conflict that hid most result rows. It also upgrades the row expand UX to show a clean, copyable optimized prompt instead of raw Python code.

---

## 1. Direction Parsing Bug
**Files:** `js/research-loop.js`
**What:** The `@direction` field only accepted `higher`/`lower` (not `maximize`/`minimize`). Any other value silently defaulted to `lower`, causing the loop to keep the lowest score as "best" and discard every real improvement.
**Impact:** Users running `@direction: higher` saw `Best: 24.39` (baseline) even though iterations scored 85–92. Fix: document that only `higher`/`lower` are valid.

## 2. research-loop.js Not Loading Locally
**Files:** `src/main.js`
**What:** Moved the `research-loop.js` dynamic import from Phase 3g (after all AI modules) to Phase 3b-ext3 (after execution registry), wrapping it in try/catch so failures don't silently halt the load chain.
**Impact:** The Research Card now renders in local dev. The try/catch surfaces load errors as `console.warn` instead of swallowing them entirely.

## 3. Table Tools Conflict
**Files:** `js/table-tools.js`
**What:** Added `if (table.classList.contains('research-results-table')) return;` guard before the toolbar injection loop.
**Impact:** The research results table no longer gets the Sort/Filter/Search/Stats/CSV toolbar. Row expand/collapse and "6 rows" truncation are gone — all 16 experiment rows are visible.

## 4. Results Table Height
**Files:** `css/research-loop.css`
**What:** `.research-results` `max-height` raised from `350px` → `600px`. Code preview default `max-height` reduced from `400px` → `200px`.
**Impact:** All iterations display without scrolling past a clipped boundary. Code preview yields space to the results table.

## 5. Row Expand → Clean Prompt Output
**Files:** `js/research-loop.js`, `css/research-loop.css`
**What:** `buildResultsTableHtml` now parses `PROMPT = """..."""` out of `h.code` via regex, then renders the prompt text inside a styled `.research-prompt-expand` panel instead of the full Python code block. Added a `📋 Copy` button wired via `bindResearchPreviewActions`.
**Impact:** Clicking a row shows only the actionable output (the optimized prompt text), not 100+ lines of scorer boilerplate. One-click copy makes it immediately usable in `{{AI:}}` tags.

## 6. Search Pills & Config
**Files:** `js/research-loop.js`, `css/research-loop.css`, `js/renderer.js`
**What:** Added `RESEARCH_SEARCH_PILLS` provider config, `buildResearchSearchPillsHtml()`, `getResearchSearchProviders()`, `@search` config field parser, and the `🔍` toggle button in the card header. DOMPurify allowlists updated for `input`, `label`, and new `data-*` attributes.
**Impact:** Users can select a search provider directly from the Research card UI, with API key prompts for providers that require keys.

## 7. Exec Sandbox Height
**Files:** `js/exec-sandbox.js`
**What:** iframe auto-resize clamp raised from `800px` → `5000px`.
**Impact:** Tall HTML sandbox outputs (data tables, charts) no longer get clipped.

---

## Files Changed (8 total)

| File | Type | Description |
|------|------|-------------|
| `js/research-loop.js` | feat + fix | Search pills, prompt-only row expand, direction docs, module load phase |
| `css/research-loop.css` | fix + feat | Results height, code preview height, prompt expand panel styles |
| `js/table-tools.js` | fix | Skip research-results-table from toolbar injection |
| `src/main.js` | fix | Move research-loop load to Phase 3b-ext3 with try/catch |
| `js/renderer.js` | feat | DOMPurify ADD_TAGS/ADD_ATTR for input, label, research data attrs |
| `js/exec-sandbox.js` | fix | iframe max height 800 → 5000 |
| `css/code-blocks.css` | chore | Minor style adjustments |
| `index.html` | chore | Minor markup updates |
