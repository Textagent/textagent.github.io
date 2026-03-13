# Chat History Memory — Multi-Turn AI Conversations

- Added `chatHistory` array in `ai-chat.js` to track user/assistant messages (capped at 10 turns / 20 messages)
- `pushHistory()` helper records messages and caps array length
- LLM-powered `refineSearchQuery()` rewrites follow-up questions into self-contained web search queries via `M.requestAiTask()`
- `fallbackQueryEnrichment()` extracts proper nouns from recent messages when model is unavailable
- `sendToAi()` in `ai-assistant.js` now accepts and forwards `chatHistory` to workers via `postMessage`
- `buildMessages()` in `ai-worker-common.js` injects conversation history between system prompt and current user message for conversational task types
- All 5 workers updated to extract and forward `chatHistory` to `buildMessages()`
- "Clear Chat" button resets `chatHistory = []`
- Fixed: `public/` worker files were outdated copies shadowing root source files in Vite dev mode — workers never received history
- Deleted 6 root-level worker duplicates (`ai-worker.js`, `ai-worker-groq.js`, `ai-worker-openrouter.js`, `ai-worker-gemini.js`, `ai-worker-lfm.js`, `ai-worker-common.js`) — `public/` is now the single source of truth

---

## Summary
Implemented persistent conversation memory for the AI chat panel. The AI now maintains context across multiple turns, enabling coherent follow-up questions. Web search queries are intelligently refined by the LLM so that follow-ups like "What is the launch price?" resolve to topic-specific searches (e.g., "Rivian R2 launch price 2026"). Consolidated worker files to eliminate a shadowing bug where `public/` copies silently overrode root source files.

---

## 1. Conversation History Tracking
**Files:** `js/ai-chat.js`
**What:** Added `chatHistory` array with `pushHistory()` helper to record user and assistant messages, capped at 10 turns (20 messages). History is cleared when the user clicks "Clear Chat". History snapshot (excluding the current message) is forwarded to `sendToAi()`.
**Impact:** AI can now reference previous messages in a conversation, enabling coherent multi-turn interactions.

## 2. LLM-Powered Search Query Refinement
**Files:** `js/ai-chat.js`
**What:** Replaced naive string-concatenation `buildSearchQuery()` with async `refineSearchQuery()` that uses `M.requestAiTask()` to ask the model to rewrite follow-up queries into self-contained search queries. Falls back to `fallbackQueryEnrichment()` (proper-noun extraction) when the model is busy.
**Impact:** Follow-up search queries like "What are the new models?" now resolve to "Rivian new models 2026" instead of generic, context-free searches.

## 3. Worker Chat History Pipeline
**Files:** `js/ai-assistant.js`, `public/ai-worker-common.js`, `public/ai-worker-groq.js`, `public/ai-worker-openrouter.js`, `public/ai-worker-gemini.js`, `public/ai-worker-lfm.js`, `public/ai-worker.js`
**What:** `sendToAi()` now accepts `chatHistory` and includes it in `worker.postMessage()`. `buildMessages()` in `ai-worker-common.js` injects recent history (up to 10 messages, 500 char limit) between system prompt and user message for conversational tasks. Workers with inline `buildMessages()` (`ai-worker.js`, `ai-worker-gemini.js`) received equivalent history injection logic.
**Impact:** All AI providers (local Qwen, Groq, OpenRouter, Gemini, LFM) now receive and use conversation context.

## 4. Worker File Consolidation
**Files:** (6 deleted root files)
**What:** Discovered `public/` worker files shadowed root source files in Vite dev mode. Synced all changes to `public/`, then deleted the 6 root-level duplicates. `public/` is now the single source of truth for all worker files.
**Impact:** Eliminates a class of bugs where edits to root workers have no runtime effect.

---

## Files Changed (14 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-chat.js` | +80 −25 | History tracking, LLM query refinement, clear chat |
| `js/ai-assistant.js` | +8 −4 | Forward chatHistory through sendToAi pipeline |
| `public/ai-worker-common.js` | +20 −2 | Inject history in buildMessages (new file in public/) |
| `public/ai-worker-groq.js` | +5 −5 | Extract and forward chatHistory |
| `public/ai-worker-openrouter.js` | +5 −5 | Extract and forward chatHistory |
| `public/ai-worker-lfm.js` | +5 −5 | Extract and forward chatHistory |
| `public/ai-worker.js` | +15 −5 | Extract, forward, and inject chatHistory (inline buildMessages) |
| `public/ai-worker-gemini.js` | +15 −5 | Extract, forward, and inject chatHistory (inline buildMessages) |
| `ai-worker.js` | — | Deleted (root duplicate) |
| `ai-worker-groq.js` | — | Deleted (root duplicate) |
| `ai-worker-openrouter.js` | — | Deleted (root duplicate) |
| `ai-worker-gemini.js` | — | Deleted (root duplicate) |
| `ai-worker-lfm.js` | — | Deleted (root duplicate) |
| `ai-worker-common.js` | — | Deleted (root duplicate) |
