# Changelog — OpenRouter Model Expansion

**Date:** 2026-03-16

## Added

Added 8 new cloud AI models via OpenRouter to `js/ai-models.js`:

| Model | OpenRouter ID |
|---|---|
| Gemini 3.1 Pro Preview | `google/gemini-3.1-pro-preview` |
| GPT-5.4 | `openai/gpt-5.4` |
| GPT-5.3 Codex | `openai/gpt-5.3-codex` |
| Claude Opus 4.6 | `anthropic/claude-opus-4.6` |
| Claude Sonnet 4.6 | `anthropic/claude-sonnet-4.6` |
| GPT-5.2 | `openai/gpt-5.2` |
| MiniMax M2.5 | `minimax/minimax-m2.5` |
| Step 3.5 Flash (Free) | `stepfun/step-3.5-flash:free` |

All models share the existing OpenRouter API key and `ai-worker-openrouter.js` worker.

### Files Modified

- `js/ai-models.js` — 168 lines added (8 new model entries)
