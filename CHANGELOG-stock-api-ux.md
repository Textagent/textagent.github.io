# Stock Widget & API Response UX — Enhancements

- Added 📋 Copy button to API review panel header for one-click response copying
- Made API review body scrollable (max-height: 400px) for large responses
- Added max-height: 400px + overflow-y: auto to all preview code blocks (`.markdown-body pre`)
- Added hover-visible 📋 copy button to all non-executable code blocks in preview
- Connected `{{API:}}` tag variables to JS sandbox — `$(api_*)` values are auto-injected as parsed JS objects
- Properly escaped API variable injection using `JSON.stringify()` to avoid token errors with newlines/quotes
- Added 1D, 1W, 5Y range buttons to stock chart widget (was: 1M, 1Y, 3Y only)
- Removed broken 52D/52W/52M EMA interval toggle buttons from stock cards
- Replaced broken ticker search (CORS-blocked APIs) with Yahoo Finance/TradingView links
- Updated `chartRange` variable description to include all range options

---

## Summary
Enhanced the stock widget with more chart range options, fixed the ticker search section, and significantly improved the API response UX with copy buttons, scrollable code blocks, and a working API→JS variable pipeline.

---

## 1. API Response Copy & Scroll
**Files:** `js/api-docgen.js`, `css/ai-docgen.css`
**What:** Added a 📋 Copy button to the `showApiReviewPanel()` header. Added `.ai-review-copy-btn` CSS (teal accent, dark/light themes). Made `.ai-review-body` scrollable with max-height: 400px. Inner `pre` blocks capped at 350px.
**Impact:** Users can now copy raw API responses to clipboard and scroll large responses without the panel overflowing.

## 2. Preview Code Block Copy & Scroll
**Files:** `js/renderer.js`, `css/editor.css`
**What:** After all executable toolbars are attached, a new loop adds `.pre-copy-btn` to every `pre` block not inside an executable container. Added `max-height: 400px; overflow-y: auto` to `.markdown-body pre`. Copy button uses `position: sticky` with hover-reveal.
**Impact:** All rendered code blocks (including accepted API responses) are scrollable and have a copy button on hover.

## 3. API → JS Variable Pipeline
**Files:** `js/exec-sandbox.js`
**What:** `executeJsBlock()` now injects `window.__API_VARS` as pre-declared JavaScript variables before sandbox eval. Uses `JSON.parse(JSON.stringify(rawVal))` for JSON responses (creates real objects) and `JSON.stringify(rawVal)` for plain text. Variable names sanitized via regex.
**Impact:** JS code blocks can directly use API response data (e.g., `api_stockData.quotes[0].symbol`) without manual parsing.

## 4. Stock Chart Range Expansion
**Files:** `js/stock-widget.js`
**What:** Expanded the `ranges` array from 3 entries (1M/1Y/3Y) to 6 entries (1D/1W/1M/1Y/3Y/5Y). TradingView intervals: 5min for 1D, 15min for 1W, Daily for 1M/1Y, Weekly for 3Y, Monthly for 5Y. Removed the broken EMA interval buttons (52D/52W/52M).
**Impact:** Users can now view intraday (1D), weekly (1W), and all-time (5Y) charts. Cleaner card controls without broken EMA toggles.

## 5. Ticker Search Cleanup
**Files:** `js/templates/finance.js`
**What:** Removed broken API/bash/Linux search approaches (all CORS-blocked). Replaced with clean markdown section linking to Yahoo Finance Lookup and TradingView Symbol Search. Updated `chartRange` description. Removed unused `searchQuery` variable.
**Impact:** Ticker search is now a simple, reliable link-based approach that always works.

---

## Files Changed (7 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `css/ai-docgen.css` | +40 | API review copy button + scroll styles |
| `css/editor.css` | +35 | Preview code block scroll + copy button |
| `js/api-docgen.js` | +19 −3 | Copy button in review panel header |
| `js/exec-sandbox.js` | +20 −7 | API variable injection into JS sandbox |
| `js/renderer.js` | +25 | Copy button on all non-executable code blocks |
| `js/stock-widget.js` | +3 −31 | Added 1D/1W/5Y ranges, removed EMA buttons |
| `js/templates/finance.js` | +5 −12 | Ticker search cleanup, chartRange desc |
