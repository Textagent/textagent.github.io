# Search Providers — Tavily, Google CSE, Wikipedia, Wikidata

- Added Tavily search provider (AI-optimized, POST API, `include_answer` for AI summary, 1,000/month free)
- Added Google Custom Search Engine (CSE) provider (GET API, key:cx format, 100/day free, 429 quota error handling)
- Added Wikipedia API provider (free, no API key, MediaWiki `action=query` search with HTML tag stripping)
- Added Wikidata API provider (free, no API key, `wbsearchentities` endpoint for structured knowledge)
- Added `API_KEY_TAVILY` and `API_KEY_GOOGLE_CSE` localStorage key constants to `storage-keys.js`
- Updated search provider dropdowns in 3 locations in `ai-docgen.js` (Agent card, AI card, generic)
- Updated AI panel search provider dropdown in `modal-templates.js` with 4 new options
- Updated API key prompt guard to skip key modal for `wikipedia` and `wikidata` (free providers)
- Updated Agent Flow help description in `help-mode.js` to list all 7 providers

---

## Summary

Expands the web search system from 3 providers (DuckDuckGo, Brave, Serper) to 7 by adding Tavily (AI-optimized results with AI summary), Google Custom Search Engine (official Google results), Wikipedia (free encyclopedia search), and Wikidata (structured knowledge base). All search functions follow the existing `{title, url, snippet}` result format. Wikipedia and Wikidata are free with no API key; Tavily and Google CSE require keys stored via the existing API key modal.

---

## 1. Search Engine Core — 4 New Provider Functions
**Files:** `js/ai-web-search.js`
**What:** Added 4 provider config objects to `PROVIDERS` and 4 `async` search functions: `searchTavily()` (POST to `api.tavily.com/search` with `include_answer: true`), `searchGoogleCSE()` (GET to `googleapis.com/customsearch/v1` with `key:cx` splitting), `searchWikipedia()` (GET to `en.wikipedia.org/w/api.php` with HTML tag stripping from snippets), `searchWikidata()` (GET to `wikidata.org/w/api.php` with `wbsearchentities`). Updated `performSearch()` switch with 4 new cases.
**Impact:** 7 search providers now available. Tavily is recommended for AI agents — it returns clean, summarized results optimized for LLM context injection.

## 2. Storage Keys
**Files:** `js/storage-keys.js`
**What:** Added `API_KEY_TAVILY: 'md-viewer-tavily-api-key'` and `API_KEY_GOOGLE_CSE: 'md-viewer-google-cse-key'` constants.
**Impact:** API keys for Tavily and Google CSE persist in localStorage following the existing pattern.

## 3. Dropdown Options — 3 Locations
**Files:** `js/ai-docgen.js`
**What:** Added 4 new `<option>` entries (🤖 Tavily, 🔍 Google CSE, 📖 Wikipedia, 📊 Wikidata) to Agent card search dropdown (~line 548), AI card search dropdown (~line 799), and updated the API key prompt guard (~line 1818) to skip key prompts for `wikipedia` and `wikidata`.
**Impact:** Users can select the new providers from any AI or Agent card in the preview.

## 4. AI Panel Provider Bar
**Files:** `js/modal-templates.js`
**What:** Added 4 new `<option>` entries to `#ai-search-provider-select` dropdown.
**Impact:** New providers appear in the global AI panel search selector.

## 5. Help Text
**Files:** `js/help-mode.js`
**What:** Updated Agent Flow help description to list all 7 providers.
**Impact:** Help mode accurately documents available search providers.

---

## Files Changed (5 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-web-search.js` | +185 −2 | 4 new provider configs + search functions |
| `js/storage-keys.js` | +2 −0 | Tavily + Google CSE key constants |
| `js/ai-docgen.js` | +9 −3 | 4 new options in 3 dropdowns + key guard |
| `js/modal-templates.js` | +4 −0 | AI panel dropdown options |
| `js/help-mode.js` | +1 −1 | Help text update |
