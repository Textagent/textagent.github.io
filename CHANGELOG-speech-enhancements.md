# Speech-to-Text Enhancements — Dual-Engine Voice Dictation Upgrade

- Upgraded to **dual-engine ASR**: Web Speech API + Moonshine Base ONNX with consensus scoring
- Added **auto-punctuation by default** — AI refinement (`aiRefineEnabled = true`) with 5-second timeout
- Built-in **punctuation fallback** (capitalize + period) when no LLM is loaded
- Added **streaming partial results** handler — shows `🧠 {text}` in status bar during decoding
- Expanded voice commands from ~25 to **50+ patterns** with natural ASR-friendly phrases
- Added **"heading one"/"title"** as primary heading commands (more reliable than "hash")
- New formatting commands: **strikethrough**, **highlight** (start/end pairs)
- New structure commands: **"add table"**, **"add link"**, **"add image"**, **"divider"**
- New editing commands: **"undo"/"take that back"**, **"delete that"/"remove that"**
- New punctuation: **"ellipsis"**, **"open/close quote"**, **"at sign"**, **"bang"**
- Added **stronger hallucination filter**: 100-word max, 30%+ non-ASCII rejection
- Improved **model loading progress**: step-by-step [1/4]…[4/4] with file sizes in MB
- Added `onnxruntime-web` dependency and Moonshine Medium worker (experimental, kept as reference)
- Fixed: WASM loading error by pointing `ort.env.wasm.wasmPaths` to jsDelivr CDN
- Fixed: AI refinement blocking text insertion (added `Promise.race` 5s timeout + double safety net)
- Updated cheat sheet to show natural phrases as primary commands
- Updated voice dictation feature description in README

---

## Summary

Enhanced the speech-to-text system with auto-punctuation, expanded voice commands with natural ASR-friendly phrases, stronger hallucination filtering, and streaming partial result display. The dual-engine consensus approach (Web Speech API + Moonshine Base ONNX) is retained with improved reliability.

---

## 1. Auto-Punctuation & AI Refinement
**Files:** `js/speechToText.js`
**What:** Enabled `aiRefineEnabled = true` by default. When a Qwen model is loaded, speech text is sent through the LLM for punctuation, capitalization, and grammar cleanup. Added `Promise.race` with 5-second timeout to prevent AI refinement from blocking text insertion. Added `addBasicPunctuation()` fallback that capitalizes first letter and adds period when no LLM is available.
**Impact:** Every speech segment is now properly punctuated and capitalized, either through LLM refinement or built-in rules.

## 2. Expanded Voice Commands
**Files:** `js/speechToText.js`
**What:** Rewrote `applyMarkdownCommands()` with 50+ regex patterns organized by category (headings, formatting, structure, links/media, table, punctuation, editing). Added natural ASR-friendly aliases for every command: "heading one"/"title" instead of just "hash", "bullet"/"add bullet" instead of just "bullet point", "undo"/"take that back" for undo, "delete that" to discard text. Multi-word patterns processed before single-word to prevent partial matches.
**Impact:** Voice commands are significantly more reliable — ASR engines recognize natural phrases like "heading one" far better than "hash".

## 3. Stronger Hallucination Filter
**Files:** `js/speechToText.js`
**What:** Enhanced `isHallucination()` to reject outputs with >100 words (likely gibberish) and outputs where >30% of characters are non-ASCII (garbage multilingual hallucination).
**Impact:** Prevents garbage model outputs from being inserted into the editor.

## 4. Streaming Partial Results
**Files:** `js/speechToText.js`, `js/moonshine-medium-worker.js`
**What:** Added handler for `'partial'` message type from worker — displays `🧠 {text}` in the status bar as tokens are decoded. Worker sends partial results every 3 tokens during autoregressive decoding.
**Impact:** Users see real-time feedback of what the model is transcribing (when a streaming-capable model is used).

## 5. Model Loading Progress
**Files:** `js/speechToText.js`, `js/moonshine-medium-worker.js`
**What:** Progress messages now show step numbers [1/4]…[4/4], download vs. initialization phases, device info (GPU/CPU), and file sizes in MB. Worker reports detected execution provider (WebGPU/WASM) on ready.
**Impact:** Users see exactly what's happening during the ~300MB model download process.

## 6. Moonshine Medium Worker (Experimental)
**Files:** `js/moonshine-medium-worker.js` [NEW], `package.json`
**What:** Created custom ONNX Runtime worker for Moonshine Medium Streaming model with 3-model architecture (encoder, decoder, decoder_with_past), KV cache management, WebGPU auto-detection with WASM fallback. Added `onnxruntime-web` dependency. The community model (`Mazino0/moonshine-streaming-medium-onnx`) produced garbage output, so the system uses proven Moonshine Base via Transformers.js pipeline.
**Impact:** Worker is architecturally complete and kept as reference for when a reliable medium ONNX model becomes available.

---

## Files Changed (5 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/speechToText.js` | +120 −50 | Auto-punctuation, expanded voice commands, hallucination filter, streaming handler |
| `js/moonshine-medium-worker.js` | +349 | New custom ONNX Runtime worker (experimental reference) |
| `js/moonshine-worker.js` | +0 −0 | Existing Moonshine Base worker (unchanged, re-added to git) |
| `package.json` | +1 | Added `onnxruntime-web` dependency |
| `README.md` | +2 −2 | Updated voice dictation description and release notes |
