# Connector AI Pipeline — Live Data Integration

- New `🔌 My Connectors` system for plugging third-party data sources into the AI assistant
- Hacker News connector fetches top stories with full URLs, author metadata, self-post body text, and top community comments
- Connector toggle in AI panel header for quick enable/disable with green active indicator
- Unified fetch pipeline: connector data and web search run in parallel via `Promise.all`
- Grounding instruction header ("LIVE DATA...Answer using this data as your primary source") prepended to context
- Fixed: Gemma 4 E4B worker completely discarded `context` parameter — only `userPrompt` was used in the messages array
- Fixed: Context now injected as `context + "\n\n---\nUser question: " + userText` so model sees data before the question
- Fixed: Gemma 4 system prompt enhanced with "data is real and live" instruction when context is provided
- Context trimmed to 6000 chars in Gemma 4 worker to prevent WebGPU OOM on E4B quant
- Updated Gemma 4 context window comment to match actual 128K spec (was incorrectly listed as 8192)
- Fixed: Clicking the connector label in the AI header accidentally toggled the checkbox off via event bubbling (`e.preventDefault()` added)
- Fixed: `hasActiveConnectors()` decoupled from DOM checkbox — now reads directly from `localStorage`
- Auto-repair: connected-but-paused connectors automatically re-enabled on page load (fixes state corruption from label-click bug)
- Default HN story count reduced from 10 to 5 for compact context suitable for local models
- Connector modal with grid view, detail view, connect/disconnect flow, and per-connector config fields
- Connectors CSS with glassmorphic modal design, dark mode support, and responsive layout
- Connector state persisted in `localStorage` with `ta-connector-` prefix per connector
- Connector registry (`REGISTRY`) supports extensible connector types (HN, Slack, Notion, GitHub, Confluence stubs)

---

## Summary

Adds a complete "My Connectors" data source system to the AI assistant and fixes a critical bug where the Gemma 4 E4B worker silently discarded all injected context, causing the model to respond with "I don't have real-time access" even when 20KB of live Hacker News data was successfully fetched and passed to the worker. The fix ensures context is prepended to the user's question in the Gemma 4 message array, the system prompt instructs the model to use the provided data, and context is trimmed to 6000 chars to stay within WebGPU memory limits.

---

## 1. Connectors System (`js/connectors.js`, `css/connectors.css`)
**Files:** `js/connectors.js`, `css/connectors.css`, `index.html`, `js/modal-templates.js`, `src/main.js`, `js/ai-assistant.js`
**What:** New modular connector framework with a registry of data sources, modal UI for connecting/configuring, and `getActiveContext()` API that aggregates data from all enabled connectors. Hacker News connector implemented with full story fetching (titles, URLs, authors, body text, top comments).
**Impact:** The AI assistant can now answer questions from live third-party data instead of only training knowledge. Users connect data sources via a visual modal and the data is automatically injected into AI prompts.

## 2. AI Pipeline Unification (`js/ai-chat.js`)
**Files:** `js/ai-chat.js`
**What:** Refactored `sendChatMessage` to use `Promise.all([connectorPromise, searchPromise])` for parallel context fetching. `buildFinalContext()` merges connector and search data with a grounding instruction header. Context is always injected regardless of whether web search is enabled.
**Impact:** Eliminates the prior bug where enabling web search caused connector data to be dropped. Both sources now run in parallel for minimum latency.

## 3. Gemma 4 Context Injection Fix (`public/ai-worker-gemma4.js`)
**Files:** `public/ai-worker-gemma4.js`
**What:** Fixed the root cause — the `context` parameter was completely ignored in the `generate()` function. Only `userPrompt` was used to build the messages array. Now, when context is provided, it's prepended to create `fullUserText = context + "\n\n---\nUser question: " + userText`. System prompt enhanced with grounding instruction. Context trimmed to 6000 chars for WebGPU safety. Updated context window comment from 8192 to actual 128K.
**Impact:** Gemma 4 E4B now reads and uses injected context (connectors, web search, document QA) instead of claiming "I don't have real-time access."

## 4. State Management Bug Fixes (`js/connectors.js`)
**Files:** `js/connectors.js`
**What:** Fixed label click toggling checkbox via `e.preventDefault()`; decoupled `hasActiveConnectors()` from DOM state; added auto-repair logic in `refreshAiStrip()` to re-enable connectors that were corrupted to `enabled: false`.
**Impact:** Connectors stay reliably enabled after being connected. No more "Paused" state appearing unexpectedly.

---

## Files Changed (8 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/connectors.js` | +977 | New: Connector framework, registry, HN fetcher, modal UI |
| `css/connectors.css` | +380 | New: Connector modal glassmorphic styles |
| `js/ai-chat.js` | +47 −38 | Unified parallel fetch pipeline with grounding |
| `public/ai-worker-gemma4.js` | +20 −7 | Context injection fix, trimming, system prompt |
| `index.html` | +11 | Connector modal template, CSS/JS imports |
| `js/modal-templates.js` | +43 | Connector modal HTML template |
| `js/ai-assistant.js` | +26 | Connector toggle in AI panel header |
| `src/main.js` | +9 | Module registration for connectors |
