# CHANGELOG — LFM 1.2B Thinking Model Fix

## Summary
Fixed the LFM 1.2B Thinking (Liquid AI) local model — it was completely non-functional due to multiple issues in the worker and main thread handler.

## Changes

### `public/ai-worker-lfm.js`
- **Upgraded ONNX Runtime Web** from v1.22.0 → v1.24.3 — old version crashed with WASM errors on LFM's hybrid SSM+Transformer operators
- **Fixed HEAD_DIM constant** from 256 → 64 (= hidden_size 2048 ÷ 32 attention heads) — wrong value caused KV cache shape mismatch during inference
- **Replaced greedy decoding with temperature sampling** — top-k=40, temp=0.7 produces more detailed responses instead of ultra-terse one-liners
- **Increased minimum token budget** to 2048 (4096 for thinking mode) — LFM always generates `<think>` reasoning which consumes tokens before the answer
- **Added detail prompt hint** for chat/generate/qa/explain tasks to encourage comprehensive responses
- **Fixed error handling** — ONNX Runtime throws raw WASM memory pointers (numbers) instead of Error objects; now safely extracts error messages with `String()` fallback
- **Improved download status message** — shows "Downloading LFM 1.2B Thinking weights — this may take a few minutes..." instead of misleading "Downloading model_q4.onnx..."

### `js/ai-assistant.js`
- **Added missing `case 'token'` handler** in the local worker message listener — streaming tokens from LFM (and Qwen) were silently dropped
- **Changed `complete` handler** from `handleAiResponse` → `handleGroqComplete` — prevents duplicate response bubbles when streaming tokens are followed by a complete message

## Files Modified
- `public/ai-worker-lfm.js` — 7 fixes
- `js/ai-assistant.js` — 2 fixes
