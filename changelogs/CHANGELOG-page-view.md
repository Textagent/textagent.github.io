# Page View — A4 Document Mode

- Added new "Page" view mode (split layout: editor left, A4 page frames right)
- New `css/page-view.css` — A4 page frame styling with shadows, page numbers, zoom levels, dark mode, responsive mobile layout
- New `js/page-view.js` — reflow engine splits rendered markdown into A4-sized page frames using element height measurement
- `<!-- pagebreak -->` HTML comments converted to visible markers that force new page breaks in page view
- Page view header bar with page counter ("X pages"), zoom dropdown (50%–125%), and Export PDF button
- `data-pagebreak` attribute added to DOMPurify whitelist in `renderer.js`
- Page view button added to header, mobile menu, and Quick Action Bar (icon: `bi-file-earmark-richtext`)
- `setViewMode()` in `ui-panels.js` extended with `view-page` CSS class and `enterPageMode()`/`exitPageMode()` lifecycle
- Live reflow: page frames update on editor input (debounced)
- Hidden render container technique for accurate element height measurement before page distribution

---

## Summary

New "Page" view mode that renders markdown as discrete A4-sized page frames in a side-by-side split layout (editor + pages). Writers can see exactly how their content will look on printed pages, with automatic page breaking, manual `<!-- pagebreak -->` markers, zoom control, and one-click PDF export.

---

## 1. Page View CSS
**Files:** `css/page-view.css`
**What:** New stylesheet with `.page-frame` elements sized at 210×297mm (A4), `.page-view-header` bar, `.page-view-scroll` container with dot-grid background, zoom transform rules, page number positioning, dark mode variants, and responsive breakpoints for mobile.
**Impact:** Users see professional A4 page frames with shadows, margins, and page numbers — visually matching printed output.

## 2. Page View Engine
**Files:** `js/page-view.js`
**What:** New module implementing `enterPageMode()`, `exitPageMode()`, and `reflowPages()`. Uses a hidden off-screen container to render markdown via `renderMarkdownToContainer()`, measures each top-level element's height, and distributes them across A4-sized page frame divs based on a ~970px content height per page. Respects `.page-break-marker` elements for forced page breaks.
**Impact:** Content is automatically split into realistic A4 pages in real-time as the user types.

## 3. View Mode Integration
**Files:** `index.html`, `js/ui-panels.js`, `src/main.js`
**What:** Added Page button (`data-mode="page"`) to all three view-mode button groups. Extended `setViewMode()` with `view-page` class and enter/exit lifecycle. Added `#page-view-container` HTML with header bar (counter, zoom, export). Wired CSS/JS imports in `main.js`.
**Impact:** Page view is accessible from all view mode controls and integrates seamlessly with the existing mode switching system.

## 4. Pagebreak Marker Support
**Files:** `js/renderer.js`
**What:** Added regex preprocessing to convert `<!-- pagebreak -->` HTML comments into `<div class="page-break-marker" data-pagebreak="true">` before `marked.parse()`. Added `data-pagebreak` to DOMPurify's `ADD_ATTR` whitelist.
**Impact:** Users can insert `<!-- pagebreak -->` anywhere in their markdown to force a new page in page view and PDF export.

---

## Files Changed (6 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `css/page-view.css` | +185 | New — A4 page frame styling |
| `js/page-view.js` | +195 | New — reflow engine |
| `index.html` | +33 | Page button (3 locations) + container HTML |
| `src/main.js` | +2 | CSS/JS imports |
| `js/ui-panels.js` | +10 −2 | Page mode in setViewMode() |
| `js/renderer.js` | +5 −1 | Pagebreak preprocessor + DOMPurify attr |
