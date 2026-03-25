# AI Worker Token & Context Limits Upgrade

- Raised all task-specific token limits to industry-standard values (e.g. `chat` 512→8192, `generate` 512→8192, `expand` 512→4096, `summarize` 256→2048, `autocomplete` 128→512)
- Increased document context limits from 1.5K/2.5K to 16K/32K chars across all 3 workers (Qwen, Gemini, Common)
- Expanded chat history from 10 messages to 30 messages per conversation
- Increased per-message content cap from 500 chars to 4000 chars for richer conversation context
- Applied identical limits to `ai-worker.js` (Qwen local), `ai-worker-gemini.js` (Gemini cloud), and `ai-worker-common.js` (shared module)

---

## Summary
Upgraded AI worker token limits, document context windows, and chat history capacity across all three worker files to leverage the full capability of modern LLMs (Qwen 3.5 supports 256K context, 32K output; Gemini supports 1M context).

---

## 1. Token Limits Upgrade
**Files:** `public/ai-worker-common.js`, `public/ai-worker-gemini.js`, `public/ai-worker.js`
**What:** Raised all 15 task-specific `TOKEN_LIMITS` values from conservative ranges (128–512) to industry-standard ranges (512–8192). For example: `generate`/`markdown`/`chat` raised from 512→8192; `expand`/`elaborate`/`explain`/`qa` raised from 384–512→4096; `summarize`/`rephrase`/`grammar`/`polish`/`formalize`/`simplify` raised from 256–384→2048; `shorten` raised from 256→1024; `autocomplete` raised from 128→512.
**Impact:** AI responses are no longer prematurely truncated. Users get complete, detailed answers instead of cut-off outputs.

## 2. Document Context Window Expansion
**Files:** `public/ai-worker-common.js`, `public/ai-worker-gemini.js`, `public/ai-worker.js`
**What:** Increased `contextLimit` from 1500/2500 chars (common/qwen) and 4000/8000 chars (gemini) to a unified 16000/32000 chars for summarize/grammar vs all other tasks.
**Impact:** AI can now process much larger document sections, enabling better summarization of long documents and more context-aware responses.

## 3. Chat History Expansion
**Files:** `public/ai-worker-common.js`, `public/ai-worker-gemini.js`, `public/ai-worker.js`
**What:** Changed `chatHistory.slice(-10)` to `chatHistory.slice(-30)` and `m.content.substring(0, 500)` to `m.content.substring(0, 4000)` in the `buildMessages()` function across all three workers.
**Impact:** Conversations maintain 3x more history with 8x more content per message, enabling better follow-up responses and multi-turn reasoning.

---

## Files Changed (3 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `public/ai-worker-common.js` | +20 −20 | Token limits, context limits, chat history |
| `public/ai-worker-gemini.js` | +7 −7 | Token limits, context limits, chat history |
| `public/ai-worker.js` | +20 −20 | Token limits, context limits, chat history |
