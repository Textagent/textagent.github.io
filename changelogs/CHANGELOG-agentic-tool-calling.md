# Agentic Tool Calling — Smart AI Context Pipeline

- Implemented agentic tool calling for Groq cloud models (two-pass generation loop)
- Model dynamically decides which tools to call (Search, Weather, HN, GitHub, Slack) based on query intent
- Added `buildToolDefinitions()` to register enabled connectors as OpenAI-format tools
- Added `executeToolCall()` and `handleToolCalls()` for parallel tool execution with Pass 2 synthesis
- Groq worker updated: non-streaming tool detection, `tool_calls` message type, `rawMessages` for Pass 2
- `sendToAi()` extended with `tools` and `rawMessages` parameters (7 args)
- Added `extractLocationFromQuery()` for smart city extraction from natural language queries
- Fixed geocoding: was sending full sentence ("what is the temp on new delhi") to API, now extracts "new delhi"
- Added `queryNeedsConnectors()` relevance filter — general queries skip connector injection entirely
- Fixed: "what is algebra?" with connectors ON → no longer says "I only have Tokyo data"
- Fixed: grounding header changed from "do not rely on training knowledge" to allowing general knowledge when data is irrelevant
- Softened grounding instruction to "answer from data when relevant, from knowledge when not"
- Exposed `getConfig`, `getToken`, `fetchWeatherDirect`, `fetchHNDirect`, etc. on `M.connectors` namespace
- Added model-aware context budgets: 4K chars for local WebGPU, 30K for non-tool-calling cloud
- Fixed duplicate typing indicator between Pass 1 and Pass 2
- Improved WebGPU buffer overflow: user-friendly error message for GPU memory errors
- Added model-size-aware context limits in local worker (0.8B→4K, 2B→8K, 4B+→32K)

---

## Summary

Transitioned the AI assistant from a "firehose" architecture (inject all connector data for every query) to an **agentic tool-calling** system where cloud models (Groq) dynamically decide which data sources to query, and local models receive a **query-relevance filter** that prevents irrelevant connector data from polluting general knowledge answers.

---

## 1. Agentic Tool Calling (Cloud — Groq)
**Files:** `js/ai-chat.js`, `public/ai-worker-groq.js`, `js/ai-assistant.js`
**What:** Cloud models now receive tool definitions (OpenAI format) and decide whether to call them. Tools execute in parallel on the main thread, results are fed back for a second generation pass.
**Impact:** "What is algebra?" on Groq → zero unnecessary API calls. "Weather in Paris?" → model calls only `get_weather`. Reduces latency, saves API tokens, eliminates noise.

## 2. Query-Relevance Filter (Local Models)
**Files:** `js/ai-chat.js`
**What:** Added `queryNeedsConnectors()` that checks for weather/news/GitHub/Slack keywords before injecting connector data. General knowledge queries ("what is algebra?", "write a poem") skip connector fetch entirely.
**Impact:** Local models no longer refuse general questions when connectors are enabled. Previously, the model would say "I only have Tokyo data" for any non-weather query.

## 3. Smart Location Extraction
**Files:** `js/connectors.js`
**What:** Added `extractLocationFromQuery()` with 5 extraction strategies (preposition patterns, weather patterns, capitalized words, filler filtering) to extract city names from natural language queries before geocoding.
**Impact:** "what is the temp in new delhi" → extracts "new delhi" → geocodes correctly. Was sending full sentence to API which failed.

## 4. Softened Grounding Header
**Files:** `js/ai-chat.js`
**What:** Changed from "Do not rely on your training knowledge" to "If the user asks about something unrelated to this data, answer from your general knowledge."
**Impact:** Models can now answer general questions even when connector data is present in context, while still prioritizing live data for relevant queries.

## 5. Connector API Exposure
**Files:** `js/connectors.js`
**What:** Exposed `getConfig`, `getToken`, `fetchWeatherDirect`, `fetchHNDirect`, `fetchGitHubDirect`, `fetchSlackDirect` on the `M.connectors` namespace for on-demand tool execution.
**Impact:** Tool calling system can invoke individual connectors directly without going through the firehose pipeline.

## 6. WebGPU Error Handling
**Files:** `public/ai-worker.js`
**What:** Translates GPU buffer errors (`mapAsync`, `Invalid Buffer`, `GPUBuffer`) into user-friendly messages. Added model-size-aware context limits (0.8B→4K, 2B→8K, 4B+→32K chars).
**Impact:** Users see actionable error messages instead of cryptic GPU errors. Smaller models no longer crash on large context.

---

## Files Changed (5 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-chat.js` | +329 −3 | Tool definitions, execution, relevance filter, grounding fix |
| `js/connectors.js` | +180 −8 | Location extraction, geocoding fix, API exposure |
| `public/ai-worker-groq.js` | +60 −3 | Tool calling support, non-streaming path, Pass 2 |
| `js/ai-assistant.js` | +26 −2 | sendToAi 7 params, tool_calls handler |
| `public/ai-worker.js` | +17 −1 | GPU error messages, model-aware context limits |
