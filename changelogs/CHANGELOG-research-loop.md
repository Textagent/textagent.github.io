# Research Loop Tag — Autonomous AI Experiment Loop

- Added `{{Research:}}` tag — an autonomous experiment loop inspired by Karpathy's autoresearch
- Created `js/research-loop.js` (~795 lines): tag parser, card renderer, loop engine, metric extraction, AI prompt builder
- Created `css/research-loop.css` (~300 lines): glass card with purple accents, pulse animation, results table, status badges
- Added `Research` to tag regex in `ai-docgen.js` (lines 157, 380) with pass-through skip for independent transform
- Added `transformResearchMarkdown` to renderer.js transform chain and `data-research-index` to DOMPurify allowed attrs
- Added `bindResearchPreviewActions` to renderer.js post-render bindings
- Added `research-loop.js` and `research-loop.css` imports to `src/main.js` (phase 3g-ext)
- Loop runs entirely in-browser via Pyodide (Python in WASM) — zero external API calls
- Supports `@runtime`, `@metric`, `@direction`, `@max_iterations`, `@model`, `@goal`, `@code: |`, `@test: |` fields
- Implements Propose→Execute→Evaluate→Keep/Discard cycle with live results table
- AI prompt includes experiment history and strategy shift hints after 3 consecutive failures
- Gracefully handles AI errors and code crashes — logs as "crash" and continues loop
- Registered `research` runtime adapter for exec-controller integration

---

## Summary
Implemented the `{{Research:}}` tag, bringing Karpathy's autoresearch paradigm into TextAgent as a fully client-side, in-browser autonomous experiment loop. Users define a goal, mutable code, and a fixed test harness, then the system iteratively proposes AI modifications, executes them via Pyodide, and keeps only improvements — all visualized in a live results table.

---

## 1. Research Loop Controller
**Files:** `js/research-loop.js`
**What:** New module implementing the full Research tag lifecycle — parsing multi-line `@code: |` and `@test: |` fields, rendering experiment cards with model dropdown/config badges/code preview, driving the autonomous keep/discard loop, extracting metrics from stdout, and building AI prompts with experiment history context.
**Impact:** Users can now define optimization experiments that run autonomously, iterating on code until max iterations or manual stop. The loop handles all failure modes gracefully (AI errors, runtime crashes, missing metrics).

## 2. Research Card Styling
**Files:** `css/research-loop.css`
**What:** Complete card CSS with dark glass aesthetic, purple accent borders, pulse animation during active loops, sticky-header results table with colored status badges (baseline/keep/discard/crash), green/red delta indicators, progress bar with shimmer effect, and light theme overrides.
**Impact:** Premium visual experience matching the existing TextAgent card design language.

## 3. Tag System Integration
**Files:** `js/ai-docgen.js`, `js/renderer.js`
**What:** Added `Research` to the tag regex so the parser recognizes it, with a pass-through skip in `transformDocgenMarkdown()` so the tag flows to `research-loop.js`'s own transform. Added `transformResearchMarkdown` to the renderer transform chain and `bindResearchPreviewActions` to post-render bindings. Added `data-research-index` to DOMPurify allowed attributes.
**Impact:** Research tags integrate cleanly into the existing tag system without affecting other tag types.

## 4. Module Loading
**Files:** `src/main.js`
**What:** Added CSS import for `research-loop.css` and dynamic JS import for `research-loop.js` after linux-docgen (phase 3g-ext).
**Impact:** Module loads at the correct point in the dependency chain — after AI models and Pyodide runtime are available.

---

## Files Changed (6 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/research-loop.js` | +795 | NEW — Core loop controller |
| `css/research-loop.css` | +300 | NEW — Card styling |
| `js/ai-docgen.js` | +11 −2 | Tag regex + pass-through skip |
| `js/renderer.js` | +7 −3 | Transform chain + bindings |
| `src/main.js` | +4 | CSS + JS imports |
| `index.html` | 0 | No changes needed (Vite handles CSS) |
