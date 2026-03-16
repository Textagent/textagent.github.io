# CHANGELOG — HuggingFace Image Generation + Game Gen Improvements

**Date:** 2026-03-16

## 🖼️ HuggingFace Image Generation (SDXL + FLUX.1)

Integrated **Stable Diffusion XL** and **FLUX.1 Schnell** as new image generation models via the free HuggingFace Inference API, alongside existing Imagen 4 Ultra and Nano Banana 2.

### New Files
- `public/ai-worker-hf-image.js` — Web Worker for HuggingFace Inference API image generation (supports both SDXL and FLUX.1 via `workerModelId`)

### Modified Files
- `js/storage-keys.js` — Added `API_KEY_HF` storage key for HuggingFace tokens
- `js/ai-models.js` — Registered `hf-sdxl` (Stable Diffusion XL) and `hf-flux` (FLUX.1 Schnell) as cloud-image models
- `js/ai-docgen.js` — Default Image tag model changed from `imagen-ultra` to `hf-sdxl` (free tier)
- `js/ai-docgen-generate.js` — Image generation fallback updated to `hf-sdxl`; images now stored in memory registry with short `gen-img:` IDs instead of inline base64
- `js/ai-image.js` — Added ⬇ **Save** button for downloading generated images as PNG; fallback model updated to `hf-sdxl`; images use short `gen-img:` placeholder IDs in editor
- `js/renderer.js` — Custom image renderer resolves `gen-img:` URLs from in-memory registry to actual data URIs
- `js/run-requirements.js` — Updated specialized models list and Image fallback to `hf-sdxl`
- `tests/feature/model-tag.spec.js` — Updated Image tag default model test to expect `hf-sdxl`

### Deleted Files
- `image-gen-test.html` — Removed comparison test page (no longer needed)

## 🎮 Game Generation Improvements

- `js/ai-assistant.js` — Added `maxTokensOverride` parameter to `requestAiTask()` API
- `public/ai-worker.js` — `generate()` now accepts `maxTokensOverride` to override default token limits
- `public/ai-worker-groq.js`, `public/ai-worker-gemini.js`, `public/ai-worker-lfm.js`, `public/ai-worker-openrouter.js` — Same `maxTokensOverride` support
- `js/game-docgen.js` — Fixed prompt parsing regexes for single-line tags; improved HTML fence extraction; added debug logging; uses `maxTokensOverride: 4096` for game generation
