# CHANGELOG — Draw AI Diagram Refactor

## Summary
Refactored AI diagram generation for `{{Draw:}}` tags to match the established pattern of Image Generate and GitHub Tools cards. Removed the duplicate in-iframe AI bar from `excalidraw-embed.html` and added a robust JSON repair pipeline for better local model compatibility.

## Changes

### AI Generate UI Refactored (`js/draw-docgen.js`, `css/draw-docgen.css`)
- **Always-visible prompt bar** in the card header with model selector dropdown + 🚀 Generate button
- Model selector built using `buildModelOpts()` matching the `git-docgen.js` pattern
- AI generation uses per-card model selection with pre-flight checks:
  - Auto-loads local models from cache
  - Prompts for API keys on cloud models
  - Temporarily switches to selected model during generation
- Supports both **Excalidraw** and **Mermaid** diagram AI generation
- New `repairJson()` function handles common LLM JSON mistakes:
  - Trailing commas, stray quotes after numbers/booleans
  - Missing commas between properties
  - Truncated JSON (auto-closes brackets)
  - Individual object extraction as last resort
- Excalidraw `@taskType: excalidraw_diagram` with cheat sheet prompt
- Mermaid `@taskType: generate` with Mermaid code generation prompt

### Excalidraw Embed Cleanup (`public/excalidraw-embed.html`)
- Removed duplicate AI generation bar (CSS, HTML, JS) — ~300 lines removed
- Removed `EXCALIDRAW_CHEAT_SHEET` constant (now only in parent controller)
- Removed `generateDiagram()` function, event listeners, and `set-api-key` handler
- Removed `_aiApiKey` state variable

### AI Worker Updates (`public/ai-worker.js`, `public/ai-worker-gemini.js`, `public/ai-worker-common.js`)
- Added `excalidraw_diagram` task type with dedicated Excalidraw cheat sheet system prompt
- 16384 token max for diagram generation tasks
- Cheat sheet includes element types, colors, rules, and labeled shape pattern

### Test Updates (`tests/feature/draw-docgen.spec.js`)
- Updated 4 AI tests from iframe-based (`#ai-bar`) to parent card (`.draw-ai-prompt-section`)
- Tests now verify: prompt section visible, prompt input placeholder, Generate button, model selector
- All 23 tests pass

### Regression Tests (`tests/regression/regression-recent.spec.js`)
- Added regression tests for recent bug fixes

## Files Modified
- `js/draw-docgen.js` — AI generate refactor + JSON repair pipeline
- `css/draw-docgen.css` — Model selector styles
- `public/excalidraw-embed.html` — Removed duplicate AI bar
- `public/ai-worker.js` — Excalidraw diagram task type
- `public/ai-worker-gemini.js` — Excalidraw diagram task type
- `public/ai-worker-common.js` — Excalidraw diagram task type
- `tests/feature/draw-docgen.spec.js` — Updated AI tests
- `tests/regression/regression-recent.spec.js` — New regression tests
- `styles.css` — Minor style updates
