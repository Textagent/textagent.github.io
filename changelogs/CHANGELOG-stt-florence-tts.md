# STT Tag Block, Florence-2 Model, TTS Download & Docling Upgrades

- New `{{@STT:...}}` tag block for Speech-to-Text dictation in DocGen preview cards
- STT card with engine selector (Whisper V3 Turbo / Voxtral Mini 3B / Web Speech API), 11-language picker, Record/Stop/Insert/Clear buttons
- STT toolbar button (🎤 STT) added to AI tags group in `index.html`
- 206 lines of STT card CSS in `tts.css` (amber accent, recording pulse animation, dark mode)
- Added Florence-2 (230M) vision OCR & captioning model to `ai-models.js` (`textagent/Florence-2-base-ft`)
- New `ai-worker-florence.js` and `public/ai-worker-florence.js` worker files (244 lines each)
- Florence-2 added to `mirror-models.sh` download script
- TTS WAV download: `downloadAudio()` + `hasAudio()` API, float32→WAV encoder, ⬇ Save button on TTS cards
- PDF-to-image OCR renderer: `renderPdfToImages()` loads pdf.js dynamically, renders pages at 2x scale as PNG for OCR
- OCR upload button tooltip updated to "Upload image or PDF for OCR"
- Granite Docling model ID migrated from `onnx-community/` to `textagent/` with automatic fallback
- Docling worker: fp16 `embed_tokens` dtype, `doImageSplitting` default changed to `true`
- Docling worker: degeneration loop guard stops after 50 repeated tokens
- Docling worker: raw base64 → data URL reconstruction for image uploads
- Docling worker: OCR mode forwarding from card (text/svg) to `outputFormat`
- Fixed: `ai-worker.js` Qwen3 text-only models use `AutoTokenizer` instead of `AutoProcessor` (no `preprocessor_config.json`)
- Fixed: `ai-docgen-generate.js` forwards OCR card mode to doc-model workers via `context` field

---

## Summary

This commit adds the `{{@STT:}}` document tag for in-preview speech-to-text dictation, introduces the Florence-2 (230M) vision model as a second local OCR option alongside Granite Docling, adds TTS audio download as WAV, and delivers several Docling worker improvements including org migration, degeneration guards, and PDF OCR support.

---

## 1. STT Tag Block — Speech-to-Text in DocGen
**Files:** `js/ai-docgen.js`, `css/tts.css`, `index.html`
**What:** New `{{@STT:...}}` tag type added to the DocGen parser and renderer. The STT card includes an engine selector dropdown (Whisper V3 Turbo WASM, Voxtral Mini 3B WebGPU, Web Speech API browser), a language picker (11 languages), Record/Stop buttons with pulse animation during recording, and Insert/Clear buttons for the transcription result. The `parseDocgenBlocks` regex was updated to include `STT`. Toolbar button `🎤 STT` added to the AI tags group.
**Impact:** Users can now dictate text directly within DocGen preview cards using `{{@STT:...}}` tags, with choice of engine and language — matching the existing TTS card pattern but for input instead of output.

## 2. Florence-2 Vision OCR Model
**Files:** `js/ai-models.js`, `ai-worker-florence.js` (new), `public/ai-worker-florence.js` (new), `scripts/mirror-models.sh`
**What:** Added Florence-2 base-ft (230 MB) as a new local vision model for OCR and captioning. New worker files handle model loading via Transformers.js with WebGPU/WASM fallback and `textagent/Florence-2-base-ft` model ID. Mirror script updated with Florence-2 ONNX file list.
**Impact:** Users now have a second, lighter local OCR model option (230 MB vs 500 MB for Docling) with captioning capabilities.

## 3. TTS WAV Download
**Files:** `js/textToSpeech.js`
**What:** Added `float32ToWav()` encoder that converts Kokoro's Float32Array audio output to a valid WAV file with proper RIFF headers. New `downloadAudio()` function creates a blob URL, triggers browser download as `tts-audio-{timestamp}.wav`, and shows toast feedback. `hasAudio()` exposes state check. TTS card in `ai-docgen.js` renders a ⬇ Save button.
**Impact:** Users can now save TTS-generated speech as WAV files for offline use, sharing, or further editing.

## 4. PDF-to-Image OCR Renderer
**Files:** `js/ai-docgen.js`
**What:** New `renderPdfToImages()` function dynamically imports pdf.js, renders each PDF page to a canvas at 2x scale, extracts PNG base64, and stores in `blockUploads` map. Respects `MAX_UPLOADS_PER_BLOCK` (3 pages). Shows toast when PDF has more pages than the limit.
**Impact:** OCR blocks now accept PDF files in addition to images — pdf.js renders pages as high-quality images for the OCR models to process.

## 5. Docling Worker Upgrades
**Files:** `ai-worker-docling.js`, `public/ai-worker-docling.js`
**What:** Model ID changed to `textagent/granite-docling-258M-ONNX` with `onnx-community/` fallback on load failure. dtype updated to `fp16` for `embed_tokens` (smaller download). `doImageSplitting` default changed from `false` to `true` for better accuracy. Added degeneration loop guard: if the same token repeats 50+ times, streaming stops. Raw base64 image data (from uploads) now reconstructed to proper `data:` URL before `load_image()`. `processDocument` accepts `mimeType` parameter. OCR mode from card forwarded via `context` field to select `outputFormat`.
**Impact:** More robust document OCR with smaller downloads, better accuracy from image splitting, and no more infinite token loops.

## 6. Qwen3 Tokenizer Fix
**Files:** `ai-worker.js`, `public/ai-worker.js`
**What:** Text-only Qwen3 models lack `preprocessor_config.json`, causing `AutoProcessor.from_pretrained()` to fail. Added `AutoTokenizer` import and conditional loading: Qwen3 models use `AutoTokenizer` wrapped in a `{ tokenizer }` object for API compatibility with the rest of the code.
**Impact:** Qwen3 text-only models now load correctly without crashing on missing processor config.

## 7. OCR Mode Forwarding
**Files:** `js/ai-docgen-generate.js`
**What:** When the current model is a doc model (`isDocModel: true`), the OCR card's mode (text/svg) is forwarded as the `context` field to the worker, which maps it to the appropriate `outputFormat` for Docling.
**Impact:** OCR mode selection (Text vs Markdown) now works correctly with specialized document models.

---

## Files Changed (13 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-docgen.js` | +347 −6 | STT tag block + PDF OCR renderer |
| `css/tts.css` | +206 | STT card CSS + TTS download button |
| `js/textToSpeech.js` | +65 | WAV download API |
| `ai-worker-docling.js` | +134 −89 | Fallback, fp16, degeneration guard |
| `public/ai-worker-docling.js` | +134 −89 | Mirror of above |
| `js/ai-models.js` | +18 −1 | Florence-2 entry + Docling ID fix |
| `ai-worker.js` | +21 −3 | Qwen3 tokenizer fix |
| `public/ai-worker.js` | +21 −3 | Mirror of above |
| `scripts/mirror-models.sh` | +19 −4 | Florence-2 + Docling fp16 files |
| `index.html` | +2 | STT toolbar button |
| `js/ai-docgen-generate.js` | +7 −1 | OCR mode forwarding |
| `ai-worker-florence.js` | +244 | New Florence-2 worker |
| `public/ai-worker-florence.js` | +244 | Mirror of above |
