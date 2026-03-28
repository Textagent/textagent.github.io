# Context Window Optimization — 21× Cloud Context Increase

- Cloud AI workers (Groq, OpenRouter, Gemini) context limit raised from 6K to 128K chars (21× increase)
- Gemini worker context limit raised from 32K to 128K chars (4× increase)
- Chat history per-message limit raised from 4K to 8K chars across all cloud workers
- Gemini worker migrated to shared `ai-worker-common.js` module (eliminated ~80 lines of duplicate system prompts)
- Local Qwen worker (0.8B/2B/4B) kept at 32K chars — within proven safe zone for small model hybrid architecture
- LFM 1.2B worker kept at 2.5K chars — appropriate for model capacity
- Added JSDoc context limit tier documentation to `ai-worker-common.js`

---

## Summary

Cloud AI workers were severely underutilizing their models' native context windows — Groq and OpenRouter sent only 6K chars (~1.5K tokens) to models supporting 128K–1M tokens. This fix raises cloud limits by 21× while keeping local model limits unchanged to prevent quality degradation from the Qwen 3.5 hybrid GDN architecture.

---

## 1. Cloud Context Limits — 21× Increase
**Files:** `public/ai-worker-common.js`, `public/ai-worker-groq.js`, `public/ai-worker-openrouter.js`
**What:** Removed hardcoded 6K character context limit overrides in Groq and OpenRouter workers. Raised common defaults from 32K/16K to 128K/64K chars. Cloud workers now pass full document context to models that can handle it.
**Impact:** Users sending large documents to cloud models (GPT-5.4, Claude, Llama 3.3 70B, Qwen 35B) will get dramatically better responses since the AI can now see the full document instead of a truncated 6K-char fragment.

## 2. Gemini Worker DRY Migration
**Files:** `public/ai-worker-gemini.js`
**What:** Replaced Gemini's own inline `buildMessages()` and duplicate system prompts with imports from `ai-worker-common.js`. Eliminated ~80 lines of duplicated code. Gemini-specific API translation (contents/parts format, systemInstruction, SSE streaming) preserved intact.
**Impact:** Single source of truth for system prompts and context limits. Gemini context raised from 32K to 128K (4× increase for its 1M-token model). Future prompt changes automatically apply to Gemini.

## 3. Chat History Expansion
**Files:** `public/ai-worker-common.js`
**What:** Raised per-message chat history limit from 4,000 to 8,000 characters.
**Impact:** Cloud models retain 2× more context per conversation turn, improving multi-turn chat coherence.

## 4. Local Workers Unchanged (By Design)
**Files:** None changed
**What:** Qwen local (32K chars) and LFM (2.5K chars) limits deliberately preserved. Research shows Qwen 3.5's hybrid Gated DeltaNet architecture degrades beyond 25-50K tokens for 0.8B-4B models. Existing degenerate output circuit breaker (`presence_penalty: 2.0`, `no_repeat_ngram_size: 6`, unique-word ratio monitoring) continues protecting against garbage output.
**Impact:** No regression in local model quality. Small models stay in their proven safe operating zone.

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `public/ai-worker-common.js` | +8 −3 | Raised defaults to 128K/64K context, 8K history |
| `public/ai-worker-groq.js` | +2 −3 | Removed 6K context limit override |
| `public/ai-worker-openrouter.js` | +2 −3 | Removed 6K context limit override |
| `public/ai-worker-gemini.js` | +15 −73 | Migrated to common module, deleted duplicate prompts |
