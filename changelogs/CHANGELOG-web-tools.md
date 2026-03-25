# Web Tools Tag — Scrape & Search via Jina API

- Added `{{@Tools:}}` tag system for web scraping and search in markdown
- New `tools-docgen.js` standalone module (Transform + Bind + Run + Accept/Reject/Copy)
- New `tools-docgen.css` with cyan-themed card styling and dark mode support
- Jina Reader API (`r.jina.ai`) integration for URL scraping — returns clean Markdown
- Jina Search API (`s.jina.ai`) integration for web search — returns search results
- API key management via 🔑 modal — stored in localStorage as `API_KEY_JINA`
- Free tier: 20 RPM without key, 500 RPM with free Jina key
- Multi-URL scraping with comma-separated URLs — auto-prepends `https://` for bare domains
- Interactive preview card with Scrape/Search action pills, input textarea, ▶ Run button
- Accept inserts scraped/searched content as Markdown, Reject discards, Copy to clipboard
- Toolbar buttons: 🔗 Scrape and 🔍 Search in new "Tools" group (between Draw and Coding)
- Composer chips: 🔗 Scrape and 🔍 Search added to chip bar
- CSP `connect-src` updated for `r.jina.ai` and `s.jina.ai` domains
- Fixed: textarea re-render loop — input focus tracking prevents card replacement while typing

---

## Summary
New `{{@Tools:}}` tag system for in-document web scraping and search, powered by Jina Reader and Search APIs. Users can scrape website content or search the web directly from markdown, with results rendered inline and insertable via Accept/Reject flow.

---

## 1. Tools DocGen Module
**Files:** `js/tools-docgen.js`
**What:** New standalone IIFE module following the git-docgen.js pattern. Implements tag parsing (`{{@Tools: @scrape: URLs}}` and `{{@Tools: @search: query}}`), Jina API integration (Reader for scrape, Search for queries), API key modal, and Accept/Reject/Copy result flow. Uses `_inputFocused` flag to prevent re-render loop while user types in card textarea.
**Impact:** Users can scrape websites and search the web directly from their markdown documents, with results displayed inline and insertable into the document.

## 2. Card Styling
**Files:** `css/tools-docgen.css`
**What:** 250-line standalone CSS with cyan (#06b6d4) theme matching the brand. Card container, header, action pills, input area, result section, loading spinner, API key modal, and dark mode support.
**Impact:** Consistent visual integration with existing DocGen tags (AI, Git, Draw).

## 3. Storage Key
**Files:** `js/storage-keys.js`
**What:** Added `API_KEY_JINA` to `M.KEYS` constant object.
**Impact:** Jina API key stored in localStorage using the centralized key management pattern.

## 4. Rendering Pipeline Integration
**Files:** `js/renderer.js`
**What:** Added `transformToolsMarkdown` to the transform chain (after Draw, before final render) and `bindToolsPreviewActions` to the bind step. Added `data-tools-index`, `data-tools-action`, `data-tools-copy` to DOMPurify `ADD_ATTR` whitelist.
**Impact:** Tools cards render and become interactive in the preview pane.

## 5. Module Loading
**Files:** `src/main.js`
**What:** Added `tools-docgen.css` import and `tools-docgen.js` dynamic import as Phase 3k (after Draw, before Agent Cloud). Renumbered Agent Cloud to Phase 3l.
**Impact:** Module loaded automatically via Vite's module system.

## 6. UI Integration
**Files:** `index.html`
**What:** Added Tools group to formatting toolbar (🔗 Scrape + 🔍 Search buttons with cyan label), composer chips (🔗 Scrape + 🔍 Search), and CSP `connect-src` for `r.jina.ai` and `s.jina.ai`.
**Impact:** Users can insert Tools tags from toolbar, composer, or type them manually.

---

## Files Changed (6 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/tools-docgen.js` | +630 | New standalone module |
| `css/tools-docgen.css` | +250 | New card styling |
| `js/storage-keys.js` | +1 | Added API_KEY_JINA |
| `js/renderer.js` | +8 −2 | Transform chain + bind + DOMPurify |
| `src/main.js` | +5 −1 | CSS import + module loading |
| `index.html` | +14 −1 | Toolbar, composer, CSP |
