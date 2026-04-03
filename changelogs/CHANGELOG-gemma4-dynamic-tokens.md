# feat: Gemma4 dynamic token limits + circuit breaker (mirrors Qwen worker)

- TOKEN_LIMITS map keyed by taskType: chat/generate/research=8192, explain/qa/expand/elaborate=4096, summarize/rephrase/grammar/translate=2048, autocomplete=512
- Degenerate-output circuit breaker: monitors unique-word ratio every 40 tokens, aborts if ratio<0.30, trims to last coherent sentence
- Priority chain: maxTokensOverride → TOKEN_LIMITS[taskType] → options.maxTokens → 4096 fallback
- Thinking mode doubles the token budget (min 4096)
