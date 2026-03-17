# CHANGELOG — GLM-OCR Transformers.js Compatibility Fix

## 2026-03-18

Fixed `Unknown image_processor_type: 'Glm46VImageProcessor'` error that prevented GLM-OCR model from loading.

### Root Cause
Transformers.js `4.0.0-next.6` did not include support for the `Glm46VImageProcessor` class required by the GLM-OCR ONNX model. Support was added in [PR #1582](https://github.com/huggingface/transformers.js/pull/1582).

### Changes

- **`ai-worker-glm-ocr.js`** + **`public/ai-worker-glm-ocr.js`** (both copies):
  - Upgraded Transformers.js from `4.0.0-next.6` → `4.0.0-next.7`
  - Switched model class from `AutoModelForVision2Seq` → `AutoModelForImageTextToText`
  - Fixed processor call: `processor(text, image, { add_special_tokens: false })` (was `processor(text, [image], { do_image_splitting })`)
