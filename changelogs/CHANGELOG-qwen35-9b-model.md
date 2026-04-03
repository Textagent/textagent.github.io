# Qwen 3.5 9B Local Model — Add XL Multimodal Option

- Added Qwen 3.5 XL (9B) as a new local multimodal model (`qwen-local-9b`)
- Model source: `textagent/Qwen3.5-9B-Onnx` on HuggingFace (~16 GB download)
- Supports vision (image-text-to-text architecture with vision encoder)
- Marked as `requiresHighEnd` due to large model size
- Placed after 4B variant to maintain logical size progression (0.8B → 2B → 4B → 9B)

---

## Summary
Adds the Qwen 3.5 9B ONNX model to the local model roster, giving users with high-end hardware access to the largest and most capable Qwen 3.5 variant directly in-browser.

---

## 1. Qwen 3.5 XL (9B) Model Entry
**Files:** `js/ai-models.js`
**What:** Added a new `qwen-local-9b` entry in `AI_MODELS` with model ID `textagent/Qwen3.5-9B-Onnx`, category `local-multimodal`, `supportsVision: true`, `requiresHighEnd: true`, and `~16 GB` download size.
**Impact:** Users with sufficient hardware (VRAM/RAM) can now select Qwen 3.5 9B from the model dropdown for the highest-quality local multimodal inference, including text and image understanding.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-models.js` | +16 | New model entry |
