# Run All Engine, Preflight Dialog, TTS & Model Loading — 2026-03-15

## Summary

Major overhaul of the Run All execution engine, preflight dialog, TTS card UX, and AI model loading for automated execution. 17 files modified, 2228 insertions, 223 deletions.

## Changes

### Run All — Pre-Execution Model Loading
- **Pre-flight model readiness check**: Before executing any blocks, `executeBlocks()` now collects all required models (AI + TTS), checks their readiness, and auto-triggers loading. Waits for each model to become ready before starting the block loop.
- **Kokoro TTS pre-loading**: Detects `kokoro-tts` as a separate model type. Triggers `M.tts.initKokoro()`, polls `M.tts.isKokoroReady()` with 180s timeout (Kokoro is 121 MB).
- **AI model auto-loading**: For local AI models (qwen-local, etc.), checks consent, auto-triggers `switchToModel()` or `initAiWorker()`, and polls `getLocalState()` until loaded.
- **Cloud model handling**: Checks API key, shows key modal if needed, auto-initializes cloud worker.
- **Abort-aware polling**: All model loading loops check `_abortRequested` each second so the Stop button works during model loading.

### Run All — Detailed Console Logging
- **Session start log**: `console.group` with `console.table` showing all blocks (#, Type, Lang, Var, Model, Input, Think, Label).
- **Per-block log**: Collapsible groups with label, runtime, model, output var, input vars with resolution status (✅ resolved / ⚠ empty), think mode, search, memory, language.
- **Timing**: Per-block elapsed time, overall execution time.
- **Variable tracking**: Shows stored variable values after each block and final variable summary at end.
- **Error logging**: Error message, stack trace, and elapsed time on failure.
- **Completion summary**: `console.table` of all block timings with status and errors.

### Run All — Stop Button Fix
- **`M._execAborted` flag**: Exposed on `M` for cross-module abort checking. Set on abort, cleared on start/completion.
- **`ensureModelReadyAsync()` abort check**: Now checks `M._execAborted` each poll iteration instead of blocking for up to 120s.
- **Fail-fast on missing consent/API key**: Instead of polling forever, immediately throws with a clear error message.
- **Fail-fast on no worker**: If no AI worker starts within 5s, throws immediately.

### Run All — AI Model Fallback
- **`run-requirements.js`**: Fixed effective model resolution for AI/Agent/Translate blocks. Now correctly defaults to `qwen-local` instead of potentially using `kokoro-tts` or other specialized models.

### Preflight Dialog
- **Compact layout**: Widened dialog to 960px, reduced font sizes (0.76rem), tightened padding (4-8px), added text-overflow ellipsis on block names.
- **`run-preflight.css`**: New stylesheet for the preflight dialog with optimized column widths for all 8 columns (#, Block Name, Type, Output Var, Model, Features, Reads, Status).
- **Model accuracy**: AI/Agent/Translate blocks now correctly show their text model (e.g., Qwen 3.5) instead of the last-used model (e.g., Kokoro TTS).

### TTS Card UX — Separate Run/Play/Save Buttons
- **▶ Run button**: Generates audio via Kokoro TTS (synthesize + store), does NOT auto-play.
- **▷ Play button**: Replays the last generated audio without re-synthesizing.
- **💾 Save button**: Downloads the last generated audio as WAV (unchanged).
- **`generate()` function**: New `M.tts.generate()` method — sets `_generateOnly` flag, sends text to TTS worker, stores audio without playing.
- **`playLastAudio()` function**: New `M.tts.playLastAudio()` method — replays stored audio from `lastAudioData`.
- **TTS module API expansion**: Added `isKokoroReady()`, `isKokoroLoading()`, `initKokoro()` to `M.tts` for external status checking and loading.

### `waitForModelReady()` Enhancement
- Now checks `M.tts.isKokoroReady()` for `kokoro-tts` model ID, in addition to AI local state and `isCurrentModelReady()`.

### `flushPendingRender()` (User-added)
- New helper function that flushes any debounced `renderMarkdown()` before applying status badges, ensuring badges appear on the final DOM.

### Templates
- Fixed `agents.js` template to use valid JS syntax (escaped template literals inside string concatenation).
- Fixed Vite import analysis error in `agents.js` by escaping `{{@AI:` syntax inside JS strings.

## Files Modified
- `css/run-preflight.css` — NEW: Compact preflight dialog styles
- `js/run-requirements.js` — NEW: Block scanning, model resolution, requirements analysis
- `js/exec-controller.js` — Pre-execution model check, logging, abort flag, TTS model switching, flushPendingRender
- `js/ai-docgen-generate.js` — ensureModelReadyAsync rewrite with abort check and fail-fast
- `js/ai-docgen.js` — TTS card buttons split (Run/Play/Save), click handlers
- `js/textToSpeech.js` — generate(), playLastAudio(), isKokoroReady/Loading(), initKokoro, _generateOnly flag
- `js/tts-worker.js` — TTS worker improvements
- `js/doc-vars-panel.js` — Variable panel enhancements
- `js/exec-registry.js` — Block registry updates
- `js/ai-assistant.js` — AI assistant refinements
- `js/templates/agents.js` — Template syntax fix
- `js/templates/ai.js` — Template updates
- `js/templates/creative.js` — Template updates
- `js/templates/documentation.js` — Template updates
- `js/templates/project.js` — Template updates
- `js/templates/technical.js` — Template updates
- `src/main.js` — Module loading updates
