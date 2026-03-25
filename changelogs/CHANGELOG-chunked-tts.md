# Chunked Kokoro TTS — Large Text Support

- Removed 1000-character hard truncation for Kokoro TTS input
- Added sentence-boundary text chunking in `tts-worker.js` (~500 chars/chunk via `.!?` + whitespace, paragraph breaks, or word boundaries)
- Kokoro now synthesizes each chunk sequentially and concatenates audio, enabling synthesis of arbitrarily long text
- Added `chunk-progress` worker message and toast notifications ("Synthesizing chunk 3/12…") for real-time feedback during large text synthesis
- Short texts (< 500 chars) still processed as a single chunk with zero overhead

---

## Summary

Kokoro TTS previously truncated text to 1000 characters and synthesized in a single blocking `tts.generate()` call, which was slow and discarded most content for large inputs. This change implements sentence-boundary chunking in the worker, enabling synthesis of arbitrarily long text with real-time progress feedback.

---

## 1. Chunked Synthesis in Worker
**Files:** `js/tts-worker.js`
**What:** Added `splitIntoChunks(text, maxLen)` utility that splits text at sentence boundaries (`.!?` + whitespace), paragraph breaks (`\n\n`), or word boundaries, capping each chunk at ~500 chars. The `speak` handler now iterates over chunks, synthesizes each sequentially, sends `chunk-progress` messages, and concatenates all `Float32Array` audio segments into a single result.
**Impact:** Long stories (5000+ chars) are processed as ~10 fast chunks instead of one slow blocking call. The worker→main-thread contract is unchanged (single `audio` event with combined result), so all downstream consumers (play, save, RunAll) work without modification.

## 2. Removed Truncation + Added Progress Display
**Files:** `js/textToSpeech.js`
**What:** Removed the `maxLen = 1000` hard truncation in `speak()`. Added a `chunk-progress` message handler in the worker event listener that displays per-chunk toast notifications.
**Impact:** Users now hear the full text instead of only the first 1000 characters, and see "Synthesizing chunk 3/12…" progress feedback during long synthesis.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/tts-worker.js` | +90 −15 | Chunked synthesis + splitIntoChunks utility |
| `js/textToSpeech.js` | +7 −6 | Remove truncation, add chunk-progress handler |
