# Changelog: TTS Card UX & Multilingual Routing

**Date:** 2026-03-15

## Summary

Major overhaul of the TTS card user experience: merged Play/Stop into a single toggle button, added a generating state that disables all buttons during synthesis, added detailed timestamped console logs, and fixed a critical bug where non-Latin languages (Japanese, Chinese, Hindi) couldn't be phonemized by Kokoro's espeak-ng WASM. These languages now route to Web Speech API for proper pronunciation.

## Changes

### `js/textToSpeech.js` (+146 lines)
- **`_isGenerating` state** — tracks whether audio synthesis is in progress
- **`onGenerateComplete` callback** — one-shot callback for UI to know when generation finishes
- **`_ttsT()` timestamped logs** — every TTS log now shows elapsed time since page load (`🔊 [TTS +12.3s]`)
- **Fixed synthesizing status bug** — `loadingPhase: 'synthesizing'` from worker no longer resets `modelReady=false` (was breaking all subsequent TTS)
- **Moved Japanese, Chinese, Hindi out of `KOKORO_LANGS`** — espeak-ng WASM can't phonemize CJK/Devanagari scripts; routes to Web Speech API instead
- **`generate()` handles Web Speech API** — polls `speechSynthesis.speaking` for completion, fires callback to re-enable UI buttons
- **Added `hi-IN`, `ja-JP` to `WEB_SPEECH_LANG_MAP`** — proper BCP-47 codes for Hindi and Japanese

### `js/tts-worker.js` (+108 lines)
- **Synthesis timing logs** — logs when speak request is received, voice selected, and synthesis duration
- **`loadingPhase: 'synthesizing'` status** — progress message during audio generation

### `js/ai-docgen.js` (+117 lines)
- **Play/Stop → single toggle button** (`ai-tts-play-toggle`) — ▷ Play ↔ ■ Stop with auto-reset on playback finish
- **Run button generating state** — text changes to "⏳ Generating…", all other buttons disabled during synthesis
- **`onGenerateComplete` integration** — restores UI state when generation completes or errors
- **Web Speech API toast** — shows "Spoken via Web Speech API" for non-Kokoro languages

### `css/tts.css` (+59 lines)
- **Play/Stop toggle styles** — purple (Play) ↔ red (Stop) with smooth transitions
- **Generating state animation** — pulsing amber border + disabled button styles
- **Dark mode support** — updated selectors for toggle states

### `js/ai-models.js` (minor)
- Updated Kokoro model description to "9 Languages" and changed model ID from `v1.1-zh-ONNX` to `v1.0-ONNX`

### `js/model-hosts.js` (minor)
- Updated comment reference from `v1.1-zh-ONNX` to `v1.0-ONNX`

### `scripts/mirror-models.sh` (minor)
- Updated mirror script for Kokoro v1.0 model ID

### `README.md` (minor)
- Updated TTS feature description and model table for 9-language Kokoro + Web Speech API hybrid
