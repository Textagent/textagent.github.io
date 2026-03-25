# Stock Grid Card Sizing — Custom stock card height and full-width single cards

- Added `data-height` attribute support on `.stock-grid` to customize card heights
- Modified single `.stock-card` to span full width when it is the only child of `.stock-grid`
- Updated CSS variables to use `--stock-card-height` with a fallback of 220px
- Fixed chart iframe to calculate height dynamically based on the custom card height

---

## Summary
Updated the stock widget to support customizable card heights via a new `data-height` attribute on the grid container, and improved the layout for single-card grids to automatically span the full width.

---

## 1. Customizable Card Heights
**Files:** `css/stock-widget.css`, `js/stock-widget.js`
**What:** Added JavaScript logic to read `data-height` from the grid and set `--stock-card-height` CSS variable. Updated CSS to use this variable with `calc()` for the chart container.
**Impact:** Users can now control the vertical size of stock cards directly from the markdown element attributes, allowing for more flexible dashboard layouts.

## 2. Full-Width Single Cards
**Files:** `css/stock-widget.css`
**What:** Added a `:has(.stock-card:only-child)` CSS rule to the grid container to switch to a single column layout.
**Impact:** A single stock ticker will now properly utilize the available horizontal space rather than being artificially constrained to a small grid cell.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `css/stock-widget.css` | +8 −4 | Style changes for custom heights and single-card grid |
| `js/stock-widget.js` | +6 −0 | Logic to apply `data-height` attribute |
