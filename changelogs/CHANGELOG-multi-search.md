# Multi-Provider Parallel Web Search

Users can now activate multiple search providers simultaneously. Results from all active providers are fetched in parallel, deduplicated by URL, and combined for the LLM to analyze.

---

## Changes

### Multi-Provider State (`ai-web-search.js`)
- Replaced single `activeProvider` string with `activeProviders` Set
- Stored as JSON array in localStorage (backward-compat with old string format)
- New `toggleProvider()`, `isProviderActive()`, `getActiveProviders()` APIs
- Minimum one provider enforced (DuckDuckGo re-activates if last is toggled off)

### Parallel Search (`ai-web-search.js`)
- New `performMultiSearch()` fires all active providers via `Promise.all()`
- Results deduplicated by normalized URL
- Each result tagged with `source` (provider name, e.g. "DuckDuckGo", "Wikipedia")

### Grouped LLM Context (`ai-web-search.js`)
- `formatResultsForLLM()` now groups results under `[Web Search Results — ProviderName]` headers
- Helps the LLM weigh and cite information from different sources

### Checkbox Pill UI (`modal-templates.js`, `ai-panel.css`)
- Replaced `<select>` dropdown with toggleable checkbox pills
- Each provider shows as a compact chip with icon (DDG, Brave, Serper, Tavily, Google, Wiki, Wikidata)
- API-key providers have inline 🔑 buttons that open the key dialog
- Active pills highlighted with green accent border/background

### Chat Integration (`ai-chat.js`)
- `initSearchUI()` rewired for checkbox `change` events with `syncPillState()`
- Search call updated from `performSearch()` → `performMultiSearch()`
- Thinking block shows source badge per result when multiple providers contribute

---

## Files Changed

| File | Type |
|------|------|
| `js/ai-web-search.js` | Multi-provider state, parallel search, grouped formatting |
| `js/modal-templates.js` | Checkbox pill UI for provider selection |
| `js/ai-chat.js` | Multi-select UI logic, performMultiSearch call, source badges |
| `css/ai-panel.css` | Pill styles, source badge styles |
