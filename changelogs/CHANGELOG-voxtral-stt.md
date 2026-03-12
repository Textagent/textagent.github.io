# CHANGELOG — Voxtral STT Integration

## Date: 2026-03-12

### Summary

Integrated Voxtral Mini 3B as the primary speech-to-text engine on WebGPU-capable devices, keeping Whisper Large V3 Turbo as the WASM fallback for non-WebGPU browsers. Added a download consent popup that informs users of model size, device, and privacy before initiating any model download.

### Changes

#### New Files
- **`js/voxtral-worker.js`** — New WebWorker for Voxtral Mini 3B (WebGPU). Uses `VoxtralForConditionalGeneration` + `VoxtralProcessor` from `@huggingface/transformers` with q4 quantization. Supports streaming partial output via `TextStreamer` for real-time interim text. Primary source: `textagent/Voxtral-Mini-3B-2507-ONNX`, fallback: `onnx-community/`.

#### Modified Files
- **`js/speech-worker.js`** — Simplified to WASM-only Whisper fallback. Removed WebGPU detection logic (now handled by `speechToText.js`). Always uses `device: 'wasm'`, `dtype: 'q8'`.
- **`js/speechToText.js`** — Added WebGPU detection at module load. Dual-worker routing: spawns `voxtral-worker.js` on WebGPU, `speech-worker.js` on WASM. Added download consent popup (`showSttConsentPopup`) that shows model name, size (~2.7 GB / ~800 MB), device (GPU/CPU), and privacy info before download. Consent remembered via `localStorage`. Dynamic engine labels throughout.
- **`js/ai-models.js`** — Added `voxtral-stt` model entry for the models card UI with `requiresWebGPU: true`.
- **`js/storage-keys.js`** — Added `STT_CONSENTED` key for tracking user consent to STT model download.
- **`css/speech.css`** — Added polished consent popup CSS (glassmorphism overlay, info table, gradient download button, responsive mobile layout).
- **`scripts/mirror-models.sh`** — Added `textagent/Voxtral-Mini-3B-2507-ONNX` to the self-hosted mirror list.

### HuggingFace
- Duplicated `onnx-community/Voxtral-Mini-3B-2507-ONNX` → `textagent/Voxtral-Mini-3B-2507-ONNX` on HuggingFace.

### Architecture
- WebGPU detection → Voxtral (q4 WebGPU, ~2.7 GB) as primary
- Non-WebGPU → Whisper V3 Turbo (q8 WASM, ~800 MB) as fallback
- Web Speech API runs immediately on both paths
- Download consent popup shown on first mic click (remembered in localStorage)
