# CHANGELOG — GLM-OCR Model Integration

## Summary

Added **GLM-OCR (1.5B)** as the third local OCR model alongside Granite Docling and Florence-2.

## Changes

### New Files
- **`ai-worker-glm-ocr.js`** — Web Worker for GLM-OCR model (THUDM GLM vision-language model via Transformers.js `AutoModelForVision2Seq`)
  - q4f16 quantization (~650 MB download, requires WebGPU)
  - Primary model: `textagent/GLM-OCR-ONNX`, fallback: `onnx-community/GLM-OCR-ONNX`
  - Supports `setModelId`, `load`, `process`, `generate`, `ping` message types
  - Streaming output with degeneration loop detection
- **`public/ai-worker-glm-ocr.js`** — Public copy of worker for Vite dev server
- **`tests/feature/glm-ocr-model.spec.js`** — 7 Playwright tests for model registry validation

### Modified Files
- **`js/ai-models.js`** — Added `glm-ocr` entry in `local-document` category with `isDocModel: true`, `requiresWebGPU: true`
- **`js/templates/documentation.js`** — Updated 4 locations:
  - Feature summary row: added GLM-OCR to OCR model list
  - Model table: added GLM-OCR (1.5B) row
  - Feature checklist: updated OCR line
  - OCR section: changed "Two models" to "Three models"

## Test Results

- 7 new GLM-OCR model registry tests: **all passed**
- 24 existing model-tag/docling/florence tests: **all passed** (zero regressions)
