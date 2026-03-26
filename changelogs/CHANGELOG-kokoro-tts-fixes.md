- Patched `generate_from_ids` in the TTS worker to explicitly construct `style` and `speed` Tensors
- Added fallback voice file fetching from `onnx-community` if primary `textagent` org is missing the voice binary
- Fixed Kokoro-JS `v1.2.1` compatibility issues with non-English voice files

---

## Summary
The TTS worker now manually patches the Kokoro-JS `generate_from_ids` function to bypass internal tensor construction bugs, ensuring robust model execution specifically for non-English voices.

---

## 1. Kokoro Tensor Construction Patch
**Files:** `js/tts-worker.js`
**What:** Manually sliced the `styleFloat32` array and constructed the `style` (`[1, 256]`) and `speed` (`[1]`) Tensors to match the exact ONNX model signature expected by the textagent fork.
**Impact:** Prevents runtime shape errors when generating audio across different languages and execution environments.

## 2. Voice File Fallback Mechanism
**Files:** `js/tts-worker.js`
**What:** Implemented a `try/catch` fetch block in the voice cache loader. If the voice binary is not found in the primary `textagent` org repository, it automatically falls back to fetching from `onnx-community`.
**Impact:** Ensures all 54 Kokoro voices can be successfully loaded and utilized even if the primary HuggingFace repository experiences synchronization or availability issues.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/tts-worker.js` | +38 −1 | Fix |
