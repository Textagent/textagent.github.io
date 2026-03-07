# Multi-Size Local Qwen Models

## Summary
Added Qwen 3.5 Medium (2B) and Large (4B) as local model options alongside existing Small (0.8B). Each model runs in its own Web Worker with independent consent tracking. The 4B model shows a high-end device warning before download.

## Changes

### Modified Files
- **js/ai-models.js** — Added `qwen-local-2b` and `qwen-local-4b` entries with `localModelId`, `downloadSize`, `requiresHighEnd` properties; renamed 0.8B dropdown label for clarity
- **ai-worker.js** — Made `MODEL_ID` configurable via `setModelId` message (defaults to 0.8B for backward compatibility); added `MODEL_LABEL` for dynamic status messages
- **public/ai-worker.js** — Synced with root `ai-worker.js`
- **js/ai-assistant.js** — Replaced single `aiWorker`/`aiModelLoaded` with per-model `localWorkers` map; added `isLocalModel()`/`getLocalState()` helpers; parameterized `initAiWorker(modelId)` to send `setModelId` before load; added `showHighEndWarning()` popup for 4B; updated `switchToModel`, `sendToAi`, `showInlineDownloadConsent`, dropdown builder, and consent dialog for multi-local model support; per-model localStorage consent keys
- **README.md** — Updated features table, AI section (3 local + cloud), technology table, demo description, and added release note
- **js/templates/documentation.js** — Updated Feature Showcase template with 3 local model sizes in AI section and task list
