# CHANGELOG — AI Document Generator

## feat: AI Document Generator with inline review flow

### What Changed
Added an AI-powered document generation feature using inline `{{AI: ...}}` and `{{Think: ...}}` tags. Users tag sections in the editor, preview shows interactive placeholder cards, and generated content appears inline for review with Accept/Reject/Regenerate controls.

### Key Features
- **Inline tags**: `{{AI: prompt}}` and `{{Think: prompt}}` markers in the editor
- **Preview placeholder cards**: Styled cards with ▶ Generate and ✕ Remove buttons
- **Inline review flow**: AI-generated content renders in the preview pane (not a popup) with Accept/Reject/Regenerate buttons
- **Model setup popup**: Compact model picker shown when no AI model is configured, with one-click Connect buttons that open the API key modal
- **Fill All**: Sequential generation across all tagged blocks with per-block review
- **AI-fillable templates**: Blog Post, Product Launch, Technical Report, Meeting Notes
- **Toolbar buttons**: AI, Think, Fill (text-only, no icons) in the formatting bar

### Files Added
- `js/ai-docgen.js` — Core module: tag parsing, placeholder rendering, review flow, setup popup
- `css/ai-docgen.css` — Styles for toolbar buttons, placeholder cards, inline review, setup popup, toast notifications

### Files Modified
- `index.html` — AI/Think/Fill toolbar buttons
- `js/ai-assistant.js` — Added `M.requestAiTask()` API + exposed model management functions
- `js/editor-features.js` — Exposed `M.registerFormattingAction()` and `M.wrapSelectionWith()`
- `js/renderer.js` — Preprocess hook for AI tags + DOMPurify attribute allowlist
- `src/main.js` — CSS import + module load order
- `js/templates/creative.js` — Blog Post (AI Fill) template
- `js/templates/project.js` — Product Launch (AI Fill) template
- `js/templates/technical.js` — Technical Report (AI Fill) template
- `js/templates/documentation.js` — Meeting Notes (AI Fill) template
