# Exec Engine, Kokoro TTS, OCR, Model Hosts & Templates

- Added **"Run All" button** to the formatting toolbar — executes every code/tag block in document order
- Built **Block Registry** (`exec-registry.js`) with FNV-1a content-hash stable IDs and central adapter discovery
- Built **Execution Controller** (`exec-controller.js`) with progress bar, abort support, per-block status badges (pending/running/done/error), and event emitter
- Added **SQLite-backed shared context store** (`_exec_results` table) — blocks can write results, downstream blocks read them via `$(blockId)` references or SQL queries
- Registered **11 runtime adapters**: `bash`, `math`, `python`, `html`, `javascript`, `sql`, `docgen-ai`, `docgen-image`, `docgen-agent`, `api`, `linux-script`
- DocGen adapters (AI/Image/Agent) use **auto-accept mode** during Run All — skip review panel, replace tag with generated content directly
- API adapter **auto-accepts** fetch results — replaces `{{API:}}` tag with response markdown
- Linux adapter submits code to **Judge0 CE** API directly and returns stdout/stderr
- Added **deferred adapter queue** (`M._pendingRuntimeAdapters`) to handle module loading order
- Added `css/exec-engine.css` — Run All button (green gradient), fixed-bottom progress bar, per-block status badges
- Added **Kokoro TTS hybrid engine** (`textToSpeech.js`) — English/Chinese via Kokoro 82M ONNX, Japanese & others via Web Speech API fallback
- Added **TTS WebWorker** (`tts-worker.js`) — runs `kokoro-js` off main thread for jank-free synthesis; voice auto-selection by language
- Added `css/tts.css` — TTS button styling, loading states, speaker icon animations
- Added **model-hosts.js** — configurable model hosting with `MODEL_HOST_FALLBACK` (HuggingFace) for automatic fallback when primary mirror fails
- Updated **ai-worker.js** — architecture-aware model loading (`qwen3` vs `qwen3_5`), per-component dtype config, `setModelId` accepts `architecture` and `dtype` params, automatic fallback to HuggingFace on primary host failure
- Added **Kokoro TTS** entry to `ai-models.js` — `kokoro-tts` with `isTtsModel: true` flag, ~80 MB download
- Added `supportsVision: true` to Qwen 3.5 Flash, Qwen 3.5 35B-A3B, and DeepSeek V3.2 cloud models
- Added **OCR tag type** to DocGen — `{{@OCR:}}` tag with amber-accented card, Qwen model default, OCR mode pills (Text/Math/Table), image upload with `@upload:` sync
- Added **OCR card CSS** (`ai-docgen.css`) — amber color scheme, mode pill selector, dark/light theme support
- Added `data-ocr-mode`, `data-mode`, `data-upload-index` to DOMPurify allowlist
- Deleted `js/moonshine-medium-worker.js` — replaced by unified `speech-worker.js`
- Updated `speech-worker.js` — accepts `MODEL_ARCH` and `MODEL_DTYPE` configuration for flexible model loading
- Added **Language Learning template** (`agents.js`) — multilingual lesson generator with vocabulary, dialogue, grammar, quiz, TTS pronunciation tips
- Fixed: SQLite-compatible SQL in **Technical template** — replaced `SERIAL`/`VARCHAR`/`NOW()` with `INTEGER`/`TEXT`/`datetime('now')`
- Updated **Documentation template** — added Run All notebook section, updated test count to 191
- Added `scripts/mirror-models.sh` — shell script for self-hosting ONNX models on GitLab
- Updated `package.json` — added `kokoro-js` dependency
- Added `public/assets/demos/25_run_all.png` — Run All demo screenshot
- Added **Run All** entry to Help Mode (`help-mode.js`)
- Added **Run All** entry to Feature Demos (`feature-demos.js`)
- Added **12 Playwright tests** for the execution engine (`tests/feature/exec-engine.spec.js`)
- All 191 existing tests pass with zero regressions

---

## Summary

This release adds three major features: (1) a unified "Run All" notebook engine that executes every code block, AI tag, API call, and Linux compile in document order with visual progress tracking; (2) a hybrid Kokoro TTS engine for high-quality text-to-speech in English, Chinese, and 10+ languages via Web Speech API fallback; and (3) an OCR tag type for image-to-text extraction. Supporting changes include configurable model hosting with automatic fallback, architecture-aware AI worker loading, vision support flags on cloud models, and an updated template library.

---

## 1. Block Registry
**Files:** `js/exec-registry.js` [NEW]
**What:** Central registry that scans the document for all executable blocks (fenced code blocks + DocGen/API/Linux tags). Assigns stable content-hash-based IDs using FNV-1a hashing. Maintains ordered block list and maps blocks to their runtime adapters. Drains a pending adapter queue (`M._pendingRuntimeAdapters`) on init.
**Impact:** Every block type is discoverable and addressable by a stable ID, enabling the controller to orchestrate execution.

## 2. Execution Controller
**Files:** `js/exec-controller.js` [NEW]
**What:** Orchestrates "Run All" — scans via registry, executes sequentially, resolves `$(blockId)` cross-references, manages progress bar (fixed bottom), per-block status badges, and abort flow. Emits lifecycle events.
**Impact:** One-click execution of entire document with visual progress tracking and abort capability.

## 3. SQLite Context Store
**Files:** `js/exec-sandbox.js`
**What:** Auto-creates `_exec_results` table in the existing sql.js instance. Each block's output is stored as key-value pair. SQL blocks can natively query previous results. Added HTML, JS, and SQL runtime adapters.
**Impact:** Blocks share data within a single Run All session.

## 4. DocGen Runtime Adapters (Auto-Accept)
**Files:** `js/ai-docgen-generate.js`
**What:** Registered `docgen-ai`, `docgen-image`, and `docgen-agent` adapters. During Run All, AI/Image/Agent blocks auto-replace the tag with generated content directly.
**Impact:** AI/Image/Agent tags execute during Run All without manual review.

## 5. API & Linux Runtime Adapters
**Files:** `js/api-docgen.js`, `js/linux-docgen.js`
**What:** API adapter parses config, executes `fetch()`, auto-replaces `{{API:}}` tag. Linux adapter submits to Judge0 CE.
**Impact:** API calls and compiled code participate in Run All.

## 6. Code Runtime Adapters
**Files:** `js/executable-blocks.js`, `js/exec-math.js`, `js/exec-python.js`
**What:** Registered `bash`, `math`, and `python` adapters wrapping existing execution logic.
**Impact:** All 6 in-browser code runtimes participate in Run All.

## 7. Kokoro TTS Hybrid Engine
**Files:** `js/textToSpeech.js` [NEW], `js/tts-worker.js` [NEW], `css/tts.css` [NEW]
**What:** Hybrid text-to-speech using Kokoro 82M v1.1-zh ONNX for English/Chinese (high quality, off-thread via WebWorker) and Web Speech API for Japanese and all other languages. Audio playback via AudioContext with proper cleanup. Voice auto-selection by language code.
**Impact:** Pronunciation preview on any text in preview — hover and click 🔊 to hear it spoken.

## 8. Model Hosting & AI Worker Architecture
**Files:** `js/model-hosts.js` [NEW], `ai-worker.js`, `public/ai-worker.js`
**What:** Configurable model hosting with `MODEL_HOST_FALLBACK` to HuggingFace. AI worker now accepts `architecture` (qwen3 vs qwen3_5) and `dtype` params for flexible model loading. Automatic fallback on primary host failure.
**Impact:** Models can be self-hosted with transparent fallback; supports both text-only and vision model architectures.

## 9. OCR Tag Type
**Files:** `js/ai-docgen.js`, `css/ai-docgen.css`, `js/renderer.js`
**What:** New `{{@OCR:}}` tag with amber-accented card, OCR mode pills (Text/Math/Table), image upload with `@upload:` sync back to editor. Qwen model default. DOMPurify allowlist expanded.
**Impact:** Extract text from images directly in markdown documents.

## 10. Vision Support & Model Registry
**Files:** `js/ai-models.js`
**What:** Added `supportsVision: true` to Qwen 3.5 Flash, 35B-A3B, and DeepSeek V3.2. Added `kokoro-tts` model entry with `isTtsModel: true` flag.
**Impact:** Vision-capable models shown in image/OCR card selectors; TTS model discoverable in model registry.

## 11. Templates & Documentation
**Files:** `js/templates/agents.js`, `js/templates/ai.js`, `js/templates/documentation.js`, `js/templates/technical.js`
**What:** New Language Learning template with vocabulary, dialogue, grammar, quiz, and TTS pronunciation tips. SQLite-compatible SQL in Technical template. Documentation template updated with Run All section and test count.
**Impact:** Better template coverage; SQL templates now actually run in the SQLite sandbox.

## 12. Infrastructure
**Files:** `scripts/mirror-models.sh` [NEW], `js/speech-worker.js`, `index.html`, `src/main.js`, `package.json`
**What:** Model mirroring shell script for self-hosting ONNX models. Speech worker accepts architecture/dtype config. New modules loaded in Phase 3b. `kokoro-js` dependency added. Moonshine medium worker deleted.
**Impact:** Self-hosting option for air-gapped deployments; cleaner speech module architecture.

---

## Files Changed (38 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/exec-registry.js` | +239 | New: Block scanner, adapter registry, FNV-1a IDs |
| `js/exec-controller.js` | +383 | New: Run All orchestration, progress UI, abort |
| `js/textToSpeech.js` | +251 | New: Hybrid TTS engine (Kokoro + Web Speech) |
| `js/tts-worker.js` | +136 | New: Kokoro TTS WebWorker |
| `js/model-hosts.js` | +19 | New: Configurable model hosting with fallback |
| `css/exec-engine.css` | +146 | New: Run All button, progress bar, status badges |
| `css/tts.css` | +178 | New: TTS button styling, animations |
| `tests/feature/exec-engine.spec.js` | +161 | New: 12 Playwright tests |
| `scripts/mirror-models.sh` | +130 | New: ONNX model mirroring script |
| `public/assets/demos/25_run_all.png` | — | New: Run All demo screenshot |
| `js/ai-docgen-generate.js` | +280 | DocGen auto-accept adapters |
| `js/ai-docgen.js` | +377 −5 | OCR tag type, block scanner exports |
| `js/exec-sandbox.js` | +179 | SQLite context store, HTML/JS/SQL adapters |
| `ai-worker.js` | +126 −86 | Architecture-aware model loading, fallback |
| `public/ai-worker.js` | +126 −86 | Mirror of ai-worker.js |
| `css/ai-docgen.css` | +114 | OCR card styling, mode pills |
| `js/templates/agents.js` | +160 −118 | Language Learning template |
| `js/templates/ai.js` | +121 | TTS pronunciation tips in templates |
| `js/api-docgen.js` | +77 | API runtime adapter |
| `js/linux-docgen.js` | +63 | Linux runtime adapter |
| `js/speech-worker.js` | +61 −36 | Architecture/dtype config |
| `js/ai-models.js` | +39 | Vision flags, Kokoro TTS entry |
| `js/exec-math.js` | +33 | Math adapter |
| `js/exec-python.js` | +32 | Python adapter |
| `js/executable-blocks.js` | +22 | Bash adapter |
| `js/templates/documentation.js` | +20 −3 | Run All docs, test count update |
| `js/model-hosts.js` | +19 | Model hosting config |
| `package-lock.json` | +17 | kokoro-js dependency |
| `js/templates/technical.js` | +16 −10 | SQLite-compatible SQL |
| `index.html` | +11 | Run All button, TTS module |
| `src/main.js` | +7 | Module loading |
| `js/help-mode.js` | +6 | Run All help entry |
| `js/renderer.js` | +3 −1 | DOMPurify attr expansion |
| `js/ai-assistant.js` | +2 −2 | Minor fix |
| `js/feature-demos.js` | +1 | Run All demo entry |
| `package.json` | +1 | kokoro-js dependency |
| `README.md` | +5 −3 | Release notes (pre-existing) |
| `js/moonshine-medium-worker.js` | −393 | Deleted: replaced by speech-worker |
