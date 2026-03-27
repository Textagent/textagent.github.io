# ECharts Chart System & Spaces Feature

- New `{{Chart:}}` DocGen tag with 7 declarative chart types (bar, line, pie, scatter, radar, gauge, heatmap) and raw ECharts JS code mode
- Added `chart-docgen.js` (~720 lines) — parser, builder, transformer, and DOM binding for interactive chart cards
- Added `chart-docgen.css` (~130 lines) — card layout, badges, actions, Add Series dropdown, dark mode
- Added `echarts.css` (~40 lines) — base container styling for ECharts instances
- Added ECharts lazy-loader in `vendor-globals.js` (`window.getECharts()` — CDN script injection)
- Added 📊 Chart toolbar button, composer chip, and mobile toolbar integration in `index.html`
- New Charts template category (`bi-bar-chart-line` icon) in template modal and template system
- 11 chart gallery templates: Line, Bar, Pie, Scatter, Sunburst, Treemap, Advanced (Radar/Gauge/Heatmap/Funnel), Sankey, Parallel, Graph — totaling ~4,200 lines of ECharts examples
- Template loading pipeline updated in `src/main.js` and `js/templates.js` to register all chart galleries
- New Spaces feature — personal document hub with email-based ownership and access key recovery
- Added `space-manager.js` (~760 lines) — CRUD, Firestore sync, share integration, hub rendering
- Added `spaces.css` (~540 lines) — modal UI, cards, glassmorphism, dark mode
- Firestore rules updated with `/spaces/{spaceId}` collection (create/update/read with field validation, write-token ownership)
- Spaces modal HTML added to `modal-templates.js` with create/recover/manage views
- Spaces buttons in header toolbar, mobile menu, and QAB in `index.html`
- "Add to Space" picker integrated into share result modal
- Storage key `SPACES` added to `storage-keys.js`
- Space hub routing via `#space=<slug>` in `cloud-share.js`

---

## Summary
Two major features: (1) a complete ECharts `{{Chart:}}` DocGen tag system with declarative chart types, raw JS code mode, 11 gallery templates (~4,200 lines of examples), lazy-loaded ECharts CDN, and full toolbar/composer integration; (2) a Spaces feature providing personal document hubs with Firestore-backed ownership, email access key recovery, share integration, and hub rendering.

---

## 1. ECharts Chart DocGen System
**Files:** `js/chart-docgen.js`, `css/chart-docgen.css`, `css/echarts.css`, `src/vendor-globals.js`, `index.html`, `js/templates.js`, `src/main.js`
**What:** Full `{{Chart:}}` tag pipeline: parser extracts `@type`, `@xAxis`, `@series`, `@code` fields; builder produces ECharts option JSON; transformer converts tags into interactive preview cards with type badges, title, Add Series dropdown, and remove button. ECharts loaded lazily from CDN via `window.getECharts()`. Toolbar 📊 Chart button, composer chip, and mobile toolbar button wired in `index.html`.
**Impact:** Users can create interactive ECharts visualizations using simple declarative syntax or raw JS code directly in markdown documents.

## 2. Chart Gallery Templates
**Files:** `js/templates/charts.js`, `js/templates/charts-line-gallery.js`, `js/templates/charts-bar-gallery.js`, `js/templates/charts-pie-gallery.js`, `js/templates/charts-scatter-gallery.js`, `js/templates/charts-sunburst-gallery.js`, `js/templates/charts-treemap-gallery.js`, `js/templates/charts-advanced-gallery.js`, `js/templates/charts-sankey-gallery.js`, `js/templates/charts-parallel-gallery.js`, `js/templates/charts-graph-gallery.js`
**What:** 11 template files providing copy-paste-ready chart examples spanning all major ECharts visualization types. Each gallery contains 5-25+ variations (basic, styled, stacked, animated, etc.). New `charts` template category registered in `templates.js` with `bi-bar-chart-line` icon.
**Impact:** Comprehensive chart template library enables zero-code chart creation for all common chart types.

## 3. Spaces Feature
**Files:** `js/space-manager.js`, `css/spaces.css`, `js/modal-templates.js`, `js/cloud-share.js`, `js/storage-keys.js`, `firestore.rules`, `index.html`, `src/main.js`
**What:** Personal document hub system with CRUD operations backed by Firestore. Email-based ownership with access key recovery. Spaces modal with create/recover/manage views. "Add to Space" picker in share modal. Space hub rendering via `#space=<slug>` URL routing. Firestore rules enforce field validation, write-token ownership, 50-item limit, and delete protection.
**Impact:** Users can organize and share curated collections of documents as browsable "Space" pages.

---

## Files Changed (20 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/chart-docgen.js` | +720 | New — chart parser/builder/transformer |
| `css/chart-docgen.css` | +129 | New — chart card styling |
| `css/echarts.css` | +38 | New — ECharts container base styling |
| `js/templates/charts.js` | +701 | New — Chart overview templates |
| `js/templates/charts-line-gallery.js` | +498 | New — Line chart gallery |
| `js/templates/charts-bar-gallery.js` | +524 | New — Bar chart gallery |
| `js/templates/charts-pie-gallery.js` | +510 | New — Pie chart gallery |
| `js/templates/charts-scatter-gallery.js` | +464 | New — Scatter chart gallery |
| `js/templates/charts-sunburst-gallery.js` | +312 | New — Sunburst chart gallery |
| `js/templates/charts-treemap-gallery.js` | +314 | New — Treemap chart gallery |
| `js/templates/charts-advanced-gallery.js` | +355 | New — Advanced chart gallery |
| `js/templates/charts-sankey-gallery.js` | +267 | New — Sankey chart gallery |
| `js/templates/charts-parallel-gallery.js` | +153 | New — Parallel chart gallery |
| `js/templates/charts-graph-gallery.js` | +356 | New — Graph chart gallery |
| `js/space-manager.js` | +763 | New — Spaces CRUD & rendering |
| `css/spaces.css` | +544 | New — Spaces modal styling |
| `index.html` | +16 | Modified — toolbar/chip/modal additions |
| `js/templates.js` | +15 | Modified — chart gallery registration |
| `src/main.js` | +21 | Modified — module imports |
| `src/vendor-globals.js` | +12 | Modified — ECharts lazy-loader |
| `js/modal-templates.js` | +116 | Modified — Spaces modal + Charts category |
| `js/cloud-share.js` | +23 | Modified — Space hub routing |
| `js/storage-keys.js` | +3 | Modified — SPACES key |
| `firestore.rules` | +29 | Modified — Spaces collection rules |
