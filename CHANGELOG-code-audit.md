# Code Audit Fixes — Security, Consistency & Deduplication

- Sandboxed `jsAdapter` in `exec-sandbox.js` — "Run All" JS execution now runs inside a `sandbox='allow-scripts'` iframe instead of raw `eval()` on the main thread
- Fixed: `mirror-models.sh` still referenced `onnx-community` model IDs instead of `textagent`
- Fixed: `mirror-models.sh` Kokoro TTS model version mismatch (v1.0 → v1.1-zh)
- Fixed: `mirror-models.sh` still contained GitLab references from pre-migration era
- Fixed: `speech-worker.js` hardcoded `language: 'en'` for Whisper — now accepts language from `speechToText.js`
- Extracted shared `TOKEN_LIMITS` and `buildMessages()` into new `ai-worker-common.js` module
- Updated `ai-worker.js`, `ai-worker-groq.js`, `ai-worker-openrouter.js` to import from shared module
- Cloud workers now load as ES modules (`{ type: 'module' }`) in `ai-assistant.js`

---

## Summary

Comprehensive code audit identified 4 bugs and 3 code inconsistencies across the codebase. This commit fixes all 7 issues: a critical security gap in the JS execution adapter, model hosting migration gaps in the mirror script, a hardcoded language bug in the speech engine, and code duplication across the three AI worker files.

---

## 1. Security Fix — Sandboxed JS Adapter
**Files:** `js/exec-sandbox.js`
**What:** The `jsAdapter` used by "Run All" was running `eval(source)` directly on the main thread, giving user code access to `document`, `localStorage`, and the full DOM. Replaced with an iframe-based sandbox using `sandbox='allow-scripts'`, matching the interactive JS runner's security model. Added a 5-second timeout and message-based result passing.
**Impact:** User-authored JavaScript in "Run All" mode is now properly sandboxed — it cannot access the host page's DOM, localStorage, or cookies.

## 2. Mirror Script — Model ID Migration
**Files:** `scripts/mirror-models.sh`
**What:** All 6 `MODEL=` lines updated from `onnx-community/*` to `textagent/*`, Kokoro TTS updated from `v1.0-ONNX` to `v1.1-zh-ONNX`, and all GitLab references removed. Script now outputs generic self-hosting instructions.
**Impact:** Running the mirror script now downloads from the correct HuggingFace organization and produces a directory structure compatible with the runtime URL scheme.

## 3. Speech Language Forwarding
**Files:** `js/speech-worker.js`, `js/speechToText.js`
**What:** Whisper worker's `language` parameter was hardcoded to `'en'`. Now accepts a `lang` field in the `transcribe` message, and `speechToText.js` forwards `currentLang.split('-')[0]` (e.g., `'ja'`, `'zh'`, `'en'`).
**Impact:** Non-English speech-to-text now works correctly — Whisper uses the user's selected language instead of always transcribing as English.

## 4. Shared Worker Module
**Files:** `ai-worker-common.js` (new), `ai-worker.js`, `ai-worker-groq.js`, `ai-worker-openrouter.js`, `js/ai-assistant.js`
**What:** Extracted duplicated `TOKEN_LIMITS` object and `buildMessages()` function into a new shared ES module (`ai-worker-common.js`). All three workers now import from it. The shared `buildMessages()` accepts `opts.contextLimit` and `opts.autocompleteLimit` so local (1500/2500) and cloud (4000/6000) workers can customize. Cloud workers updated to load with `{ type: 'module' }`.
**Impact:** System prompts and token limits are now defined in one place. Changes to prompts or limits only need to happen once instead of in 3 separate files.

---

## Files Changed (9 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `ai-worker-common.js` | +105 | New shared module (TOKEN_LIMITS + buildMessages) |
| `scripts/mirror-models.sh` | +131 −131 | Model ID migration + GitLab removal |
| `js/exec-sandbox.js` | +50 −20 | Sandboxed jsAdapter |
| `js/speech-worker.js` | +3 −1 | Accept language parameter |
| `js/speechToText.js` | +1 −1 | Forward language to worker |
| `ai-worker.js` | +4 −70 | Import from shared module |
| `ai-worker-groq.js` | +4 −70 | Import from shared module |
| `ai-worker-openrouter.js` | +4 −35 | Import from shared module |
| `js/ai-assistant.js` | +1 −1 | Cloud workers use `{ type: 'module' }` |
