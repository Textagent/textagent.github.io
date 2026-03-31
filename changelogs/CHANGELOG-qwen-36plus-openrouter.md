# Qwen 3.6 Plus Preview — Add OpenRouter Free Model

- Added `qwen/qwen3.6-plus-preview:free` as a new cloud model (`openrouter-qwen-36plus`) via OpenRouter
- Model appears in the AI model dropdown as "Qwen 3.6 Plus Preview" with "Alibaba · Free · via OpenRouter" description
- Uses the existing `ai-worker-openrouter.js` and shares the OpenRouter API key

---

## Summary
Adds Qwen 3.6 Plus Preview (free tier) from Alibaba via OpenRouter as a selectable AI model in TextAgent, grouped alongside the existing Qwen cloud models.

---

## 1. Qwen 3.6 Plus Preview Model Entry
**Files:** `js/ai-models.js`
**What:** Added a new `'openrouter-qwen-36plus'` entry in `window.AI_MODELS` with `workerModelId: 'qwen/qwen3.6-plus-preview:free'`, reusing `ai-worker-openrouter.js` and the shared OpenRouter API key. Positioned after the existing Qwen 3.5 35B-A3B entry.
**Impact:** Users see "Qwen 3.6 Plus Preview" in the model selector dropdown under the OpenRouter / Alibaba group. No additional API key or worker code required — the model is free on OpenRouter.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-models.js` | +21 | New model entry |
