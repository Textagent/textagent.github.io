# CHANGELOG — AI Diagram Generation + Test Coverage

## AI Diagram Generation (Draw DocGen)
- Added AI-powered diagram generation to `{{Draw:}}` cards — users can describe a diagram in natural language and generate Excalidraw JSON via LLM
- New `.draw-ai-prompt-section` with text input, model selector dropdown, and 🚀 Generate button
- `js/draw-docgen.js`: ~400 lines of new logic including `repairJson()` for LLM output cleanup, `@model:` field parsing, Excalidraw element rendering pipeline, and cancel/retry support
- `css/draw-docgen.css`: 133 lines of new CSS for AI prompt row, generate button, model selector, status bar, and dark mode
- `public/ai-worker-common.js`: added `excalidraw_diagram: 16384` token limit and `EXCALIDRAW_CHEAT_SHEET` const (Excalidraw element schema reference for LLM context)
- `public/ai-worker-gemini.js` and `public/ai-worker.js`: registered `excalidraw_diagram` task type
- `public/excalidraw-embed.html`: added `set-api-key` postMessage handler for forwarding Gemini key to embed
- `styles.css`: minor CSS import fix

## Comprehensive Test Coverage
- **NEW** `tests/feature/draw-docgen.spec.js` — 22 tests covering module loading, tag parsing, card rendering, tool pills, Mermaid editor, AI prompt section, AI Generate button, model selector, toolbar integration, and error safety
- **NEW** `tests/feature/readonly-mode.spec.js` — 7 tests covering CSS lockdown enforcement, JS guards (insertAtCursor, paste, keyboard), and opacity verification
- **NEW** `tests/feature/excalidraw-library.spec.js` — 8 tests covering asset serving, JSON validity, embed page structure, and 29+ library file count
- **UPDATED** `tests/regression/regression-recent.spec.js` — 5 new regression pins: GLM-OCR model entry, Draw tag card rendering, readonly CSS opacity lockdown, Excalidraw embed page accessibility

## Files Modified
- `js/draw-docgen.js` (+397 lines)
- `css/draw-docgen.css` (+133 lines)
- `public/ai-worker-common.js` (+51 lines)
- `public/ai-worker-gemini.js` (+2 lines)
- `public/ai-worker.js` (+2 lines)
- `public/excalidraw-embed.html` (+6 lines)
- `styles.css` (+1 line)
- `tests/regression/regression-recent.spec.js` (+61 lines)
- `tests/feature/draw-docgen.spec.js` (NEW, 271 lines)
- `tests/feature/readonly-mode.spec.js` (NEW, 160 lines)
- `tests/feature/excalidraw-library.spec.js` (NEW, 115 lines)

## Test Results
All 52 tests pass (44s, Chromium via Playwright)
