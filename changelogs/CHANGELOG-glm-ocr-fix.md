# GLM-OCR Graceful Error Handling

**Date:** 2026-03-23

## Summary

Added graceful error handling for the GLM-OCR model when it fails to load due to an
incompatibility between `transformers.js@4.0.0-next.8` (the only version supporting the
`glm_ocr` model type) and its bundled `onnxruntime-web@1.19.x` which cannot load external
`.onnx_data` weight files in the browser.

## Problem

- GLM-OCR's quantized weights (`q4f16`) are stored in external `.onnx_data` files
- ONNX Runtime Web requires explicit `externalData` session options to load these files
  in the browser (confirmed by official ONNX Runtime docs)
- `transformers.js@4.0.0-next.8` does not pass `externalData` options to `InferenceSession.create()`
- This caused a cryptic `Module.MountedFiles is not available` error on every page load

## Changes

### Modified Files
- `ai-worker-glm-ocr.js` — Added WebGPU guard + `MountedFiles` / `external data file`
  error detection with a clear user-facing message
- `public/ai-worker-glm-ocr.js` — Synced copy

### What Changed
- **WebGPU guard:** If WebGPU is unavailable, the worker now returns a clear error
  suggesting Granite Docling or Florence-2 as alternatives
- **External data error detection:** Catches the specific `MountedFiles` / `external data file`
  error pattern from ONNX Runtime and shows a user-friendly message:
  > "GLM-OCR is temporarily unavailable — the model's quantized weights require a newer
  > ONNX Runtime version that isn't yet compatible with this library."
- **Prevents fallback retry:** The old code would fail on `textagent/GLM-OCR-ONNX`, then
  retry on `onnx-community/GLM-OCR-ONNX` with the same result. Now it detects the error
  immediately and stops
- **Clears consent flag:** The error response triggers consent cleanup in `ai-assistant.js`,
  preventing stuck retry loops on page reload

## Resolution Path

The model will work automatically once `transformers.js` v4 stable releases with
`onnxruntime-web ≥ 1.22` and adds `externalData` session option plumbing. At that point,
only the `TRANSFORMERS_URL` version string needs updating.
