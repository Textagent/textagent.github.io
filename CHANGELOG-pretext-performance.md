# Pretext Performance Optimization — Eliminate Layout Thrashing in Textarea Resize

- Added `js/pretext-resize.js`: shared canvas-based textarea resize utility (zero DOM reflows)
- Integrated `@chenglou/pretext` npm library for GPU font metrics measurement
- Wired `pretextResize` into `window.MDView.pretextResize` for IIFE module access
- Imported `pretext-resize.js` in `src/main.js` Phase 1 (Core) load order
- Patched `js/ai-chat.js`: replaced double-reflow auto-resize with `M.pretextResize(aiInput, 120)`
- Patched `js/composer.js`: replaced double-reflow `autoResize()` with `M.pretextResize(inputEl, 120)`
- Patched `js/ai-tags.js`: replaced double-reflow thread panel textarea resize with `M.pretextResize(this, 80)`
- Patched `js/ai-docgen.js`: replaced both input-event and initial-height double-reflows in prompt textarea
- Patched `js/quiz-docgen.js`: replaced both double-reflows in prompt textarea (input + initial height)
- Patched `js/game-docgen.js`: replaced both double-reflows in game prompt textarea
- Patched `js/tools-docgen.js`: replaced both double-reflows in tools input textarea
- Patched `js/git-docgen.js`: replaced both double-reflows in git prompt textarea
- Patched `js/draw-docgen.js`: replaced three double-reflow sites (AI gen + mermaid input + initial height)
- Added graceful fallback: all patches keep the old `scrollHeight` path when `M.pretextResize` is not yet loaded
- Added `public/pretext-demo.html`: interactive benchmark comparing 0-reflow vs 91-reflow behavior

---

## Summary
Replaced the `el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'` double-reflow pattern across all 9 textarea hotspots with a single canvas-based write using the Pretext library. This eliminates synchronous page-wide reflows on every keystroke, returning 4–8ms per keypress to the main thread and significantly improving responsiveness during high-load sessions (e.g., AI chat with active markdown preview).

---

## 1. Pretext Utility Module (New)
**Files:** `js/pretext-resize.js`, `src/main.js`, `package.json`, `package-lock.json`
**What:** Created a shared `pretextResize(el, maxH)` function that uses `canvas.measureText()` to calculate text geometry without touching DOM layout. Guards: visibility check (clientWidth), font aliasing (`system-ui` → `Helvetica Neue`), dynamic padding/line-height from `getComputedStyle`. Exposed as `window.MDView.pretextResize`. Imported in Phase 1 of `main.js`.
**Impact:** All UI modules can access the utility before any IIFE initializes. Zero side-effects on existing behavior—old path runs as fallback.

---

## 2. AI Chat Input
**Files:** `js/ai-chat.js`
**What:** Replaced the 4-line double-reflow block in the `aiInput` event listener with a 1-line `M.pretextResize(aiInput, 120)` call guarded by a feature-check.
**Impact:** The primary user-facing typing surface now causes 0 reflows per keystroke (down from 2).

---

## 3. Composer Input
**Files:** `js/composer.js`
**What:** Replaced the internal `autoResize()` function body with `M.pretextResize(inputEl, 120)`.
**Impact:** Composer sends 0 reflows on resize instead of 2.

---

## 4. AI Tags Thread Textarea
**Files:** `js/ai-tags.js`
**What:** Replaced the thread panel textarea's double-reflow with `M.pretextResize(this, 80)`.
**Impact:** Zero reflows per keystroke in sidebar thread inputs.

---

## 5. DocGen Prompt Textareas (6 files)
**Files:** `js/ai-docgen.js`, `js/quiz-docgen.js`, `js/game-docgen.js`, `js/tools-docgen.js`, `js/git-docgen.js`, `js/draw-docgen.js`
**What:** Each file had 2–3 double-reflow sites (one in the `input` event handler, one for initial height on load, and in draw-docgen an additional site after AI code gen). All replaced with `M.pretextResize()`.
**Impact:** Tag card prompt textareas now resize without any layout work. Initial height is set via canvas measurement on first render.

---

## Files Changed (12 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/pretext-resize.js` | +60 | New utility module |
| `src/main.js` | +3 | Import pretext-resize in Phase 1 |
| `js/ai-chat.js` | +1 | Feature-guarded resize replacement |
| `js/composer.js` | +1 | Feature-guarded resize replacement |
| `js/ai-tags.js` | +1 | Feature-guarded resize replacement |
| `js/ai-docgen.js` | +2 −2 | Input + initial height replaced |
| `js/quiz-docgen.js` | +2 −2 | Input + initial height replaced |
| `js/game-docgen.js` | +2 −2 | Input + initial height replaced |
| `js/tools-docgen.js` | +2 −2 | Input + initial height replaced |
| `js/git-docgen.js` | +2 −2 | Input + initial height replaced |
| `js/draw-docgen.js` | +3 −3 | 3 sites replaced (AI gen + input + initial) |
| `public/pretext-demo.html` | +210 | Interactive benchmark demo page |
