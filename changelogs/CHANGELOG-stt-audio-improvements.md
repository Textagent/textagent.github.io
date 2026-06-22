# Speech-to-Text Improvements — Low-End Tier, Streaming & Reliability Fixes

- Added a **low-end device tier** to the Whisper (WASM) fallback: on low-RAM / few-core devices (`navigator.deviceMemory ≤ 4 GB` or `hardwareConcurrency ≤ 4`), `speech-worker.js` now loads **multilingual `whisper-tiny`** (~75 MB, q4) instead of `whisper-large-v3-turbo` (~800 MB) — giving working dictation on Chromebooks / older phones that previously couldn't load any STT model
- Used **multilingual `whisper-tiny`, not `tiny.en`** — the 14-language support is preserved on exactly the devices that fall back to it
- Added **streaming partial results** to the Whisper path via `WhisperTextStreamer` — interim text now appears as tokens decode instead of a blank field until the final result (closes the UX-parity gap with Voxtral, which already streamed)
- **Fixed (race):** WebGPU detection was async + fire-and-forget, so `sttModelName` and the engine indicator could show a stale value before detection resolved; added a `webGPUResolved` flag, a post-detection indicator refresh, and a public `M.speechToText.ready()` that resolves once the engine choice is final
- **Fixed (silent failure):** the neural engine's microphone (`getUserMedia` in `startAudioCapture`) is opened separately from the Web Speech API's internal stream; on mobile the second request can be denied while Web Speech keeps working, previously failing silently — it now cleans up partial state and surfaces a toast + interim message ("using Web Speech only"), distinguishing permission-denied from other failures
- Consent popup now reflects the chosen tier (shows "~75 MB / Whisper Tiny" on low-end devices instead of always "~800 MB")

---

## Summary

The WASM speech-to-text fallback previously hard-loaded the ~800 MB Whisper-Large-V3-Turbo model with one-shot (non-streaming) results and no path for low-end devices. This adds a device-capability-aware tier that loads a ~75 MB multilingual Whisper-Tiny on constrained hardware, streams partial transcriptions as they decode, and fixes two reliability issues found in an audit: a WebGPU-detection race that could surface the wrong engine name, and a silent microphone failure on mobile that left users believing the neural engine was running when only Web Speech was.

---

## 1. Low-End STT Tier
**Files:** `js/speech-worker.js`, `js/speechToText.js`
**What:** Added a `TIERS` map (`turbo` → whisper-large-v3-turbo q8; `tiny` → whisper-tiny q4) and a `pickTier()` device probe in the worker, mirrored by `pickWhisperTier()` on the main thread. The caller passes a `tier` hint in the `init` message (only for the WASM/Whisper path; Voxtral/WebGPU ignores it). Unknown devices (non-Chromium, no `deviceMemory`) safely default to `turbo` so capable machines are never downgraded.
**Impact:** Devices with ≤4 GB RAM or ≤4 cores get a ~75 MB model that actually loads and runs, instead of failing on the 800 MB download.

## 2. Whisper Streaming
**Files:** `js/speech-worker.js`
**What:** Wrapped transcription in a `WhisperTextStreamer` (transformers.js 3.8.1) whose `callback_function` posts `partial` messages as text decodes. The main thread already had a `partial` handler that renders interim text. Falls back to one-shot if the streamer can't be constructed.
**Impact:** Live interim feedback during transcription instead of a blank field for the duration of the clip.

## 3. WebGPU-Detection Race Fix
**Files:** `js/speechToText.js`
**What:** Added `webGPUResolved`; the detection IIFE now refreshes the engine indicator on completion, and a new `M.speechToText.ready()` resolves once `webGPUPromise` settles. `getEngines()` exposes `webGPUResolved`.
**Impact:** UI/API never report a stale STT engine while detection is mid-flight. (Worker selection was already correctly gated on `webGPUPromise`.)

## 4. Silent Microphone Failure Fix
**Files:** `js/speechToText.js`
**What:** `startAudioCapture`'s catch block now disconnects partial audio nodes, stops the stream, and shows a toast + interim message instead of only `console.warn`. Detects `NotAllowedError` / `NotFoundError` / `SecurityError` for a clearer "couldn't access the mic" message.
**Impact:** Users are told when the higher-quality engine isn't running, instead of silently getting only Web Speech.

---

## Testing

- Vite build compiles clean (validates the `WhisperTextStreamer` import and all module syntax).
- `stt-tag.spec.js` + `speech-commands.spec.js`: 22/22 passing, no regressions.
- Verified live: `ready()` resolves with the final engine; tier heuristic correct across boundary cases (≤4 GB → tiny, unknown → turbo).
