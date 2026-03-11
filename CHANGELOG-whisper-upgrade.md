# Whisper V3 Turbo Upgrade — ASR Model Swap & Worker Rename

- Replaced **Moonshine Base** (WER ~9.66%) with **Whisper Large V3 Turbo** (WER ~7.7%) — 20% accuracy improvement
- Added **WebGPU auto-detection** with fp16 precision on GPU, q8 quantized fallback on WASM
- Renamed worker file: `moonshine-worker.js` → `speech-worker.js`
- Renamed all internal references: `moonshineText` → `whisperText`, `moonshineTranscribing` → `whisperTranscribing`, `pendingMoonshine` → `pendingWhisper`
- Updated all console logs, UI strings, and API from "Moonshine" to "Whisper"
- Updated README: features table, demo description, and release notes reflect Whisper V3 Turbo

---

## Summary

Upgraded the speech-to-text ONNX model from Moonshine Base to OpenAI's Whisper Large V3 Turbo via `onnx-community/whisper-large-v3-turbo` (official ONNX conversion). Added WebGPU GPU acceleration with WASM fallback. Renamed worker from `moonshine-worker.js` to `speech-worker.js`.

---

## 1. Model Upgrade
**Files:** `js/speech-worker.js` (renamed from `js/moonshine-worker.js`)
**What:** Changed model ID from `onnx-community/moonshine-base-ONNX` to `onnx-community/whisper-large-v3-turbo`. Added WebGPU detection (`navigator.gpu.requestAdapter()`) — uses fp16 on GPU, q8 on WASM. Reports device type (GPU/CPU) on ready message.
**Impact:** ~20% lower WER (7.7% vs 9.66%), significantly better transcription accuracy. GPU acceleration provides faster inference on supported devices.

## 2. Worker Rename
**Files:** `js/moonshine-worker.js` → `js/speech-worker.js`, `js/speechToText.js`
**What:** Renamed worker file to model-agnostic `speech-worker.js`. Updated `initWorker()` URL reference.
**Impact:** Cleaner naming that doesn't tie the file to a specific model.

## 3. Internal Renames
**Files:** `js/speechToText.js`
**What:** Renamed 30+ internal references from Moonshine to Whisper: variables (`moonshineText` → `whisperText`, `moonshineTranscribing` → `whisperTranscribing`, `pendingMoonshine` → `pendingWhisper`), console logs, UI text ("Moonshine Base" → "Whisper V3 Turbo"), exposed API (`getEngines().moonshine` → `getEngines().whisper`).
**Impact:** Consistent naming throughout the codebase.

---

## Files Changed (3 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/speech-worker.js` | +97 (renamed) | Model swap + WebGPU detection |
| `js/speechToText.js` | +31 −31 | Internal Moonshine → Whisper renames |
| `README.md` | +3 −3 | Features, demo, release notes updated |
