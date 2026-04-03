# Gemma 4 Vision Tag — Omni-Modal DocGen Integration

- New `{{@Vision:}}` DocGen tag routes all analysis to Gemma 4 (E2B / E4B) running locally via WebGPU/WASM
- New `ai-worker-gemma4.js` Web Worker using `@huggingface/transformers@4.0.1` with `Gemma4Processor` instantiation
- Primary model `onnx-community/gemma-4-E2B-it-ONNX` with automatic fallback to `textagent/gemma-4-E4B-it-ONNX`
- Vision card UI: 📷 camera capture, 📎 multi-modal upload (image/audio/video), Gemma 4 E2B / E4B model selector, prompt textarea, cyan/blue accent theme
- 👁️ Vision toolbar button added to the AI Tags dropdown (between 🎤 STT and 🎮 Game)
- `registerFormattingAction('vision-tag')` wired to `insertDocgenTag('Vision')` in `ai-docgen.js`
- Vision card render strips all `@model:`, `@upload:`, `@think:`, `@var:` metadata fields before display — only clean prompt text shown in textarea
- Fixed: Vision card showing double `@upload:` and `@prompt:` raw lines — broken regex `\\\\s*` (quadruple-escaped) replaced with correct `\s*`
- Fixed: removed duplicate static text row above textarea that rendered raw `@`-field content
- Fixed: textarea fallback `visionPromptVal || visionDescText` replaced with clean `visionPromptVal` only
- Upload handler (`ai-upload-btn`) now detects Vision card type and sets `accept="image/*,audio/*,video/*"`
- Audio files for Vision cards stored directly as base64 with correct MIME type (`audio/wav` default)
- New `extractVideoFrames(file, blockIdx, numFrames=4)` function: loads video into hidden `<video>` element, seeks to 4 evenly-spaced timestamps (avoiding black frames at 0% and 100%), draws each frame to Canvas at max 1280px wide, stores as JPEG 0.85 quality with `isVideoFrame: true` flag
- Vision generation handler in `ai-docgen-generate.js`: maps `blockUploads` attachments to typed inputs (`image/jpeg`, `audio/*` → direct; `isVideoFrame` → `video_frame` type), switches AI worker to Gemma 4 via `switchToModel`, restores previous model after task completes
- System prompt injected into Gemma 4 worker to prevent "I am a text-based AI" persona response
- Vision card CSS in `ai-docgen.css`: cyan (`#00d4ff`) / deep blue (`#0a1628`) accent palette, modality hint footer, file label chips for audio/video attachments
- Gemma 4 model entries added to `ai-models.js` (`gemma4-e2b`, `gemma4-e4b`) with `isDocModel: true` and `supportsVision: true` flags

---

## Summary

Adds full omni-modal support to TextAgent via a new `{{@Vision:}}` DocGen tag backed by the Gemma 4 multimodal model. Users can upload images, audio files, or videos (auto-extracted into 4 keyframes) and ask Gemma 4 to analyze, describe, or reason about them entirely client-side. Fixes a regex escaping bug that caused raw `@upload:` / `@prompt:` metadata lines to appear twice inside the rendered Vision card.

---

## 1. Gemma 4 Web Worker (`ai-worker-gemma4.js`)
**Files:** `ai-worker-gemma4.js`
**What:** New dedicated Web Worker using `@huggingface/transformers@4.0.1`. Uses `Gemma4Processor` directly (bypasses `AutoProcessor` which lacks `image_processor_type` in config). Loads `onnx-community/gemma-4-E2B-it-ONNX` with fallback to `textagent/gemma-4-E4B-it-ONNX`. Injects a system prompt so Gemma 4 responds as a capable multimodal assistant rather than defaulting to "I am text-only."
**Impact:** Gemma 4 can now be used locally for vision tasks without server-side processing.

---

## 2. Vision Tag Parser & Renderer (`ai-docgen.js`)
**Files:** `js/ai-docgen.js`
**What:** 
- Registered `{{Vision:}}` in the DocGen block parser regex
- Added Vision card renderer in `transformDocgenMarkdown` with correct regex patterns (`\s*` not `\\s*`) that strip `@model:`, `@upload:`, `@think:`, and `@var:` fields before display
- Extracted clean `@prompt:` value shown in a single textarea — no duplicate static text row
- Vision upload button now sets `accept="image/*,audio/*,video/*"` for Vision cards
- Audio files stored as base64; video files dispatched to `extractVideoFrames()`
- New `extractVideoFrames()`: seeks hidden video to 4 evenly-spaced timestamps, captures each frame as JPEG on Canvas, stores with `isVideoFrame: true`
- Registered `vision-tag` formatting action pointing to `insertDocgenTag('Vision')`

**Impact:** The Vision card now renders cleanly with only the prompt textarea visible (no raw metadata pollution). Users can drag a video file onto the upload button and receive 4 representative frames sent to Gemma 4.

---

## 3. Vision Generation Handler (`ai-docgen-generate.js`)
**Files:** `js/ai-docgen-generate.js`
**What:** Added `handleVisionBlock()` that reads `blockUploads` for the block, maps each attachment to a typed input (`image/jpeg` → image, `audio/*` → audio, `isVideoFrame` → `video_frame`), calls `switchToModel('gemma4-e2b')`, dispatches the task, and restores the user's previous model on completion.
**Impact:** Running a Vision block automatically swaps the active model to Gemma 4, runs analysis, then restores the prior model — transparent to the user.

---

## 4. Vision Toolbar Button (`index.html`)
**Files:** `index.html`
**What:** Added `<button class="fmt-btn fmt-vision-btn" data-action="vision-tag">👁️ Vision</button>` to the AI Tags dropdown, positioned between 🎤 STT and 🎮 Game.
**Impact:** One-click insertion of a `{{@Vision:}}` block from the formatting toolbar.

---

## 5. Vision Card Styling (`ai-docgen.css`)
**Files:** `css/ai-docgen.css`
**What:** New `.ai-vision-card` CSS block with cyan/deep-blue accent palette (`--vision-accent: #00d4ff`), modality hint footer row, file label chips for audio/video thumbnails, dark mode variants.
**Impact:** Vision cards are visually distinct from OCR (amber) and AI (teal) cards.

---

## 6. Model Registry (`ai-models.js`)
**Files:** `js/ai-models.js`
**What:** Added `gemma4-e2b` and `gemma4-e4b` entries with `isDocModel: true`, `supportsVision: true`, worker path `ai-worker-gemma4.js`, and display names "Gemma 4 E2B · Local" / "Gemma 4 E4B · Local".
**Impact:** Both Gemma 4 variants appear in the model registry for Vision card selection and standard model switching.

---

## Files Changed (6 total)

| File | Type | Description |
|------|------|-------------|
| `ai-worker-gemma4.js` | NEW | Gemma 4 multimodal Web Worker |
| `js/ai-docgen.js` | MODIFY | Vision tag parser, renderer, video frame extractor, upload handler |
| `js/ai-docgen-generate.js` | MODIFY | Vision generation handler + model switching |
| `css/ai-docgen.css` | MODIFY | Vision card CSS — cyan/blue theme + modality hints |
| `index.html` | MODIFY | 👁️ Vision toolbar button |
| `js/ai-models.js` | MODIFY | gemma4-e2b / gemma4-e4b model registry entries |
