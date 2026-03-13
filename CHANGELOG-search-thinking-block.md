# Search Thinking Block — Collapsible Search Results Before AI Response

- Search results now appear in a collapsible "thinking" `<details>` block before the AI response streams
- Thinking block shows immediately with a spinning "Searching…" indicator when search is triggered
- Block populates with actual results (title, snippet, URL) or "No results found" message when search completes
- Source citation pills displayed below the thinking block for quick access to sources
- Removed duplicate inline search details from AI response bubbles (`addAiMessage`, `handleGroqComplete`)
- Fixed: duplicate user message ("YOU" bubble shown twice) when search is enabled — `sendToAi()` dedup check now uses `querySelectorAll` instead of broken `:last-of-type` CSS pseudo-class
- Added `.ai-thinking-block` CSS with green-accented border, slide-in animation, dark mode support
- Added `.ai-thinking-spin` CSS keyframe animation for the search-in-progress spinner
- Added `.ai-thinking-searching` and `.ai-thinking-no-results` styled states

---

## Summary

Refactors the AI chat search flow to show web search results in a collapsible "thinking" block **before** the AI generates its response, providing a transparent agent-like workflow. Also fixes a duplicate user message bug caused by a broken DOM dedup check in `sendToAi()`.

---

## 1. Two-Phase Search Thinking Block
**Files:** `js/ai-chat.js`
**What:** Replaced the old single-shot `renderSearchThinkingBlock()` with a two-phase system: `createSearchThinkingBlock(query)` shows a collapsible block with an animated spinner immediately when search starts, then `populateSearchThinkingBlock(results, query)` fills it with actual results or a "no results" fallback message when the search promise resolves/rejects. The old `ai-search-indicator` element is no longer used — the thinking block replaces it entirely.
**Impact:** Users see immediate visual feedback that search is running, and always see the thinking block regardless of whether DDG returns results.

## 2. Removed Duplicate Search Details from AI Responses
**Files:** `js/ai-chat.js`
**What:** Removed inline search result rendering from `addAiMessage()` and `handleGroqComplete()`, which previously duplicated the search details inside the AI message bubble.
**Impact:** Search results appear only once (in the thinking block above), not twice.

## 3. Fixed Duplicate User Message
**Files:** `js/ai-assistant.js`
**What:** The `sendToAi()` function checked for existing user messages using `.ai-message-user:last-of-type`, which is a CSS pseudo-class that matches the last element of a given tag type (`div`), not the last element with a class. When the thinking block `div` was inserted between the user message and sendToAi's check, the dedup always failed. Fixed by using `querySelectorAll('.ai-message-user .ai-msg-bubble')` and comparing the last element's text content.
**Impact:** User query now appears exactly once in the chat.

## 4. Thinking Block CSS
**Files:** `css/ai-panel.css`
**What:** Added `.ai-thinking-block` container with green-accented border and fade-in animation, `.ai-thinking-spin` rotation keyframe for the search spinner, `.ai-thinking-searching` for the loading state, and `.ai-thinking-no-results` for the empty state with amber info icon. Dark mode variants included.
**Impact:** Consistent, polished visual treatment matching the existing AI panel design.

---

## Files Changed (3 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-chat.js` | +217 −48 | Two-phase thinking block, removed inline search duplication |
| `js/ai-assistant.js` | +4 −3 | Fixed user message dedup check |
| `css/ai-panel.css` | +194 −0 | Thinking block styles, spinner, no-results state |
