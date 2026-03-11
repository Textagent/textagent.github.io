# Model Hosting Migration — HuggingFace textagent Org

- All ONNX model IDs changed from `onnx-community/` to `textagent/` namespace
- 7 models duplicated to `textagent` HuggingFace org via `duplicate_repo` API
- `model-hosts.js` simplified: single HuggingFace CDN, org-based primary/fallback
- All workers (`ai-worker.js`, `speech-worker.js`, `tts-worker.js`) updated to use `textagent/` models with `onnx-community/` fallback
- Fixed: removed all GitLab model hosting references from runtime code
- `mirror-models.sh` retained as GitLab backup utility (downloads from `onnx-community`)

---

## Summary
Migrated all ONNX model references from `onnx-community` to a self-owned `textagent` HuggingFace organization. Models are server-side duplicated (not re-uploaded), ensuring identical content. If any `textagent/` model is unavailable, workers automatically fall back to the original `onnx-community/` namespace on the same HuggingFace CDN.

---

## 1. HuggingFace Org Setup
**What:** Created `textagent` organization on HuggingFace Hub; duplicated 7 ONNX models server-side using `huggingface_hub.duplicate_repo()`.
**Impact:** TextAgent now owns its model namespace — insulated from upstream renames/deletions by `onnx-community`.

### Models Duplicated
| Model | Size | URL |
|-------|------|-----|
| Qwen 3.5 0.8B ONNX | ~500 MB | `huggingface.co/textagent/Qwen3.5-0.8B-ONNX` |
| Qwen 3.5 2B ONNX | ~1.2 GB | `huggingface.co/textagent/Qwen3.5-2B-ONNX` |
| Qwen 3.5 4B ONNX | ~2.5 GB | `huggingface.co/textagent/Qwen3.5-4B-ONNX` |
| Qwen 3 4B Thinking ONNX | ~2.5 GB | `huggingface.co/textagent/Qwen3-4B-Thinking-2507-ONNX` |
| Whisper Large V3 Turbo | ~1.5 GB | `huggingface.co/textagent/whisper-large-v3-turbo` |
| Kokoro 82M v1.0 ONNX | ~80 MB | `huggingface.co/textagent/Kokoro-82M-v1.0-ONNX` |
| Kokoro 82M v1.1-zh ONNX | ~80 MB | `huggingface.co/textagent/Kokoro-82M-v1.1-zh-ONNX` |

## 2. Model Hosts Configuration
**Files:** `js/model-hosts.js`
**What:** Replaced GitLab primary + HuggingFace fallback with single HuggingFace CDN; exports `MODEL_HOST`, `MODEL_ORG` (`textagent`), and `MODEL_ORG_FALLBACK` (`onnx-community`).
**Impact:** Simplified host config; no more GitLab dependency for model downloads.

## 3. AI Worker Updates
**Files:** `ai-worker.js`, `public/ai-worker.js`
**What:** Changed `MODEL_HOST` from GitLab to HuggingFace; fallback now swaps model ID prefix from `textagent/` to `onnx-community/` instead of switching hosts.
**Impact:** Workers download models from HuggingFace CDN with automatic namespace fallback.

## 4. Speech Worker Update
**Files:** `js/speech-worker.js`
**What:** Removed GitLab host; Whisper model ID uses `textagent/whisper-large-v3-turbo` with `onnx-community/` fallback on failure.
**Impact:** Speech-to-text downloads from HuggingFace with org-based fallback.

## 5. TTS Worker Update
**Files:** `js/tts-worker.js`
**What:** Removed GitLab comments; model ID changed to `textagent/Kokoro-82M-v1.1-zh-ONNX`.
**Impact:** TTS model downloads from textagent HuggingFace org.

## 6. Model Registry Update
**Files:** `js/ai-models.js`, `js/ai-assistant.js`
**What:** All `localModelId` values changed from `onnx-community/` to `textagent/` prefix.
**Impact:** Model selector dropdown and download flows use textagent namespace.

---

## Files Changed (10 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/model-hosts.js` | +12 −11 | Simplified: HF-only, org-based fallback |
| `ai-worker.js` | +9 −9 | HF host, org-based fallback |
| `public/ai-worker.js` | +9 −9 | Same as above (public copy) |
| `js/speech-worker.js` | +11 −10 | HF host, org-based fallback |
| `js/tts-worker.js` | +3 −6 | Removed GitLab comments |
| `js/ai-models.js` | +5 −5 | Model IDs → textagent/ |
| `js/ai-assistant.js` | +1 −1 | Default model ID → textagent/ |
| `js/ai-actions.js` | +2 −2 | Minor |
| `js/ai-docgen.js` | +2 −2 | Minor |
| `js/ai-docgen-generate.js` | +3 −3 | Minor |
