# CHANGELOG — Model Loading UX

**Date:** 2026-03-12

## Summary

Enhanced model loading UX with cache/download status detection, source location display, and model deletion capability.

## Changes

### Workers (7 files)
- Updated `progressCb` / `progress_callback` in all worker files to forward Transformers.js `status` field (`initiate`, `progress`, `done`)
- Added `source` (MODEL_ID) and `loadingPhase` fields to worker messages
- Files: `public/ai-worker.js`, `public/ai-worker-docling.js`, `public/ai-worker-florence.js`, `public/ai-worker-lfm.js`, `js/tts-worker.js`, `js/speech-worker.js`, `js/voxtral-worker.js`

### UI — ai-assistant.js
- **Cache detection**: Tracks `initiate→done` pairs without `progress` bytes to detect cache loads
- **Source display**: Shows `huggingface.co/{model-id}` during loading via `#ai-progress-source`
- **Model deletion**: New `deleteModelCache()` function clears Cache API + OPFS + consent flags
- **Delete button handler**: Wired to consent dialog with toast feedback
- Exposed `deleteModelCache` on `M._ai` for cross-module access

### Modal — modal-templates.js
- Added `#ai-progress-source` element in download progress section
- Added `#ai-consent-delete` danger button in consent dialog footer

### CSS — ai-panel.css + styles.css
- `.ai-progress-source` — subtle monospace info bar with icon
- `.ai-consent-btn-danger` — red delete button with dark mode variants
