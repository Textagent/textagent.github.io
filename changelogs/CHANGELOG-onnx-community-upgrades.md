# ONNX-Community Model Upgrades — Kokoro WebGPU, Moonshine STT, SmolVLM, transformers.js v4

- **Kokoro TTS now runs on WebGPU** when available (with WASM fallback) — fixes the CPU-only 5–15 s/chunk bottleneck; Kokoro v1.0 does ~10 s of speech in ~1 s on GPU. The worker probes WebGPU, loads fp32 on GPU / q8 on WASM, and falls back to WASM if the GPU load fails
- **Moonshine added as a fast English STT engine** (`onnx-community/moonshine-base-ONNX`, MIT) — a new `moonshine` worker tier in `speech-worker.js` plus a "🌙 Moonshine (EN)" option in the `{{@STT:}}` card engine selector; English-only, non-Whisper, so it skips the Whisper streamer/language path and the textagent→onnx-community org fallback
- **SmolVLM lightweight vision models registered** (`onnx-community/SmolVLM-256M/500M-Instruct-ONNX`) with a new `public/ai-worker-smolvlm.js` worker — a ~270–500 MB image-text-to-text alternative to Gemma 4 Vision (~2–4 GB) / Florence-2 for captioning & visual Q&A on low-end devices
- **transformers.js upgraded v3.8.1 → v4.2.0** — the in-browser ML runtime for every local model worker; v4 brings a C++-rewritten WebGPU runtime, ~200 architectures, 53% smaller bundles, and 10× faster builds. Verified: Kokoro TTS, Whisper/Voxtral STT, and OCR all work against v4 (kokoro-js declares a v3 peer dep, but the APIs it uses are unchanged — confirmed by a live end-to-end TTS synthesis)
- Added `M.speechToText.setWhisperTier('moonshine'|'tiny'|'turbo'|null)` to route the WASM worker to a specific tier (resets the worker so the next start reloads)

---

## Summary

A batch of upgrades sourced from the `onnx-community` HuggingFace org, each filtered for browser-runnability (small, permissive, transformers.js-compatible). The headline win is WebGPU acceleration for Kokoro TTS — the audit's #1 audio bottleneck — applied to a model already shipped. Moonshine adds a fast real-time English STT engine; SmolVLM adds a tiny vision option; and the underlying transformers.js runtime is brought to v4, benefiting every local model. The v4 bump was verified with a live Kokoro synthesis (not just a green test suite) because kokoro-js only officially declares v3 support.

---

## 1. Kokoro TTS WebGPU Acceleration
**Files:** `js/tts-worker.js`
**What:** Added `detectWebGPU()` and reworked `loadKokoroManual()` to load on `device:'webgpu'` (fp32) when an adapter is available, falling back to `wasm` (q8) if WebGPU is missing or the GPU load throws. The worker reports its device in the ready message ("Kokoro TTS ready (GPU)").
**Impact:** Multi-speaker/podcast synthesis that took 5–15 s/chunk on CPU now runs at roughly real-time on WebGPU devices.

## 2. Moonshine Fast-English STT
**Files:** `js/speech-worker.js`, `js/speechToText.js`, `js/ai-docgen.js`
**What:** Added a `moonshine` entry to the worker's `TIERS` map (onnx-community, MIT, English-only, no org fallback). The transcribe path is tier-aware: Moonshine does a plain one-shot transcription (no `WhisperTextStreamer`, no `language` option — it's not a Whisper model). Surfaced as a 4th engine in the `{{@STT:}}` card, routed via a new `setWhisperTier()` API. Builds on the low-end Whisper tier added in the prior STT PR.
**Impact:** A fast, real-time English STT engine for users who want speed over multilingual coverage.

## 3. SmolVLM Lightweight Vision
**Files:** `js/ai-models.js`, `public/ai-worker-smolvlm.js` (new)
**What:** Registered `smolvlm-256m` and `smolvlm-500m` model entries (`HuggingFaceTB/SmolVLM-256M-Instruct` / `-500M-Instruct`) and added a dedicated worker mirroring the gemma4 worker's message protocol (setModelId/load/generate/process/ping), using `AutoModelForImageTextToText` + `AutoProcessor` with WebGPU/WASM auto-selection and streaming tokens. SmolVLM ships as three ONNX components, so the worker passes a per-component dtype map (`embed_tokens` fp16, `vision_encoder`/`decoder_model_merged` q4) rather than a single dtype string.
**Impact:** Image captioning and visual Q&A on devices that can't fit the multi-GB Gemma 4 Vision models.
**Verified:** loaded the 256M model on WebGPU in-browser and captioned a test image end-to-end ("The image displays a red circle…") — confirms the vision encoder + decoder pipeline runs.

## 4. transformers.js v4 Upgrade
**Files:** `package.json`, `package-lock.json` (+ all workers importing `@huggingface/transformers`: tts/voxtral/speech/florence/docling/glm-ocr)
**What:** Bumped `@huggingface/transformers` `^3.8.1` → `^4.2.0`. The import paths and APIs the workers use (`pipeline`, `env`, `AutoTokenizer`, `AutoProcessor`, `StyleTextToSpeech2Model`, `Tensor`, `WhisperTextStreamer`) are unchanged across the major. (The CDN-loaded Gemma 4 vision worker was already on v4.0.1.)
**Impact:** Smaller bundle, faster builds, improved WebGPU runtime for every local model.

---

## Testing

- Vite build: clean on v4.
- Playwright: **434 passed** (full smoke + feature suite) on v4, plus TTS/STT/speech suites green. Updated the STT engine-selector test (3 → 4 options) for the new Moonshine entry.
- **Live runtime verification (the important one):** drove a real Kokoro synthesis in the browser against v4 — model downloaded, loaded its 54-voice list, and `speakAsync(...)` resolved with `hasAudio: true`. Confirms kokoro-js works on v4 despite its v3 peer-dep declaration.
- ESLint: no new errors on changed files.
