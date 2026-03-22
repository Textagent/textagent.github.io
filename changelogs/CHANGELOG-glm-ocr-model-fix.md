# CHANGELOG — GLM-OCR Model Download Fix

## 2026-03-23

Fixed GLM-OCR model failing to download — `AutoModelForImageTextToText` could not resolve the `glm_ocr` model type.

### Root Cause
Transformers.js `4.0.0-next.7` did not include a mapping for the `glm_ocr` model type declared in the model's `config.json`. The library downloaded `config.json`, encountered `model_type: "glm_ocr"`, and failed before fetching any ONNX weight files. Support for `glm_ocr` was added in `4.0.0-next.8`.

### Changes

- **`ai-worker-glm-ocr.js`** + **`public/ai-worker-glm-ocr.js`** (both copies):
  - Upgraded Transformers.js from `4.0.0-next.7` → `4.0.0-next.8`

### Verification
- Confirmed `glm_ocr` has **zero** occurrences in `next.7` bundle and **multiple** occurrences in `next.8` bundle
- Both HuggingFace repos verified accessible: `textagent/GLM-OCR-ONNX` and `onnx-community/GLM-OCR-ONNX`
