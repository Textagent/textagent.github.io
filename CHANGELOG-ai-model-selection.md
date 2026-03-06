# CHANGELOG — AI Model Selection & Per-Generation Model Picker

## Summary
Added per-generation model selection to AI placeholder cards, refined toolbar/QAB integration, and fixed rendering bugs.

## Changes

### Per-Generation Model Selector
- Each AI placeholder card now has a compact model dropdown in the header
- Users can select a different model per generation (defaults to the globally selected model)
- Clicking ▶ uses the card's selected model instead of always using the global one
- If the selected model needs an API key, prompts directly (no longer opens the full model sidebar)

### Toolbar & QAB Integration
- AI Model button (CPU icon) placed in the main toolbar after the AI button
- Added "Model" button to the QAB (Quick Access Bar) so it's accessible when the header is collapsed
- Wired QAB Model button to delegate to the main toolbar's model selector

### Icon Update
- Replaced 🤖 robot emoji with ✨ sparkles on AI placeholder cards and review panels

### Bug Fixes
- **DOMPurify stripping interactive elements**: Added `button`, `select`, `option` to allowed tags and `value`, `title`, `selected`, `data-model-id` to allowed attributes in `renderer.js`
- **Reject not re-rendering**: After rejecting a generation, the preview now triggers a full re-render to properly restore the placeholder card with its model dropdown and buttons

## Files Modified
- `index.html` — Toolbar and QAB button placement
- `js/ai-docgen.js` — Per-card model dropdown, generation flow, reject fix, icon update
- `js/app-init.js` — QAB Model button click handler
- `js/renderer.js` — DOMPurify allowed tags/attrs
- `css/ai-docgen.css` — Compact model selector dropdown styling
