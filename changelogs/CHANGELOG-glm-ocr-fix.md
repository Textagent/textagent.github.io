# GLM-OCR External Data Fix — Model Now Loads in Browser

**Date:** 2026-03-23

## Summary

Fixed GLM-OCR model loading failure (`Module.MountedFiles is not available`) by augmenting
the model's `config.json` with missing q4f16 external data entries at load time.

## Root Cause

The upstream `config.json` on HuggingFace lists `use_external_data_format` mappings for
base and fp16 ONNX variants but **not** for q4f16 quantized variants. When Transformers.js
loaded the q4f16 model, it didn't know the weights were in external `.onnx_data` files,
so ONNX Runtime tried to use `Module.MountedFiles` (which doesn't exist in browsers).

`transformers.js@4.0.0-next.8` already has `use_external_data_format` support (from
PR #1212) — it just wasn't being triggered for q4f16 due to the missing config entries.

## Changes

### Modified Files
- `ai-worker-glm-ocr.js` — Fetch upstream config, merge q4f16/q4/quantized entries
  into `use_external_data_format`, pass combined config to `from_pretrained`
- `public/ai-worker-glm-ocr.js` — Synced copy

### What Changed
- Before calling `AutoModelForImageTextToText.from_pretrained()`, the worker now:
  1. Fetches the model's `config.json` from HuggingFace
  2. Adds q4f16, q4, and quantized `.onnx` files to `use_external_data_format`
  3. Passes the augmented config as the `config` option
- Removed previous monkey-patch attempt (onnxruntime-web 1.19.x doesn't support
  the `externalData` session option)
- Kept WebGPU guard for clear error when WebGPU is unavailable
- Kept fallback to `onnx-community/` mirror
