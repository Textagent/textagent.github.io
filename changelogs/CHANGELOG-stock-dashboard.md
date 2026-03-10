# CHANGELOG — Stock Dashboard

## Feature: Finance Template Category with Live TradingView Charts

### New Files
- `js/templates/finance.js` — 3 finance templates (Stock Watchlist, Crypto Tracker, Market Overview) with configurable chart variables
- `js/stock-widget.js` — TradingView Advanced Chart widget renderer with 52-period EMA overlay
- `css/stock-widget.css` — Responsive grid layout, card styling, range/EMA toggle buttons

### Modified Files
- `js/templates.js` — Dynamic `data-var-prefix` grid expansion engine; stores original template for re-apply; preserves `@variables` block after ⚡ Vars
- `js/modal-templates.js` — Finance category tab registration
- `src/main.js` — Imports for finance templates, stock-widget JS/CSS
- `js/renderer.js` — DOMPurify: added `data-range`, `data-interval`, `data-ema` to allowed attributes; post-render hook for stock widgets
- `index.html` — CSP `frame-src` for TradingView embeds
- `README.md` — Finance Dashboard feature row, template count 103→106, test count 151→179, release notes entry

### What Changed
- **Dynamic grid**: `data-var-prefix` attribute on `<div class="stock-grid">` generates one `stock-card` per non-empty variable (e.g., `cname1=AAPL`, `cname2=TSLA` → 2 cards)
- **Configurable charts**: `chartRange`, `chartInterval`, `emaPeriod` variables passed as `data-range`, `data-interval`, `data-ema` attributes
- **EMA overlay**: 52-period Exponential Moving Average with interactive 52D/52W/52M toggle buttons
- **Range toggle**: 1M/1Y/3Y range buttons reload TradingView iframe
- **Persistent variables**: `@variables` block preserved after applying, enabling re-editing and re-applying
- **Re-apply from source**: Original template content stored on load; every ⚡ Vars click resolves from source template (not already-resolved content)
- **API tag**: Uses correct `{{API: URL: ... Method: GET Variable: ...}}` multi-line format
- **JS code block**: Dynamically reads `$(cname*)` variables to generate grid HTML + summary table

### Tests
- 179 Playwright tests pass (0 failures)
