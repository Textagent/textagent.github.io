# Mobile Toolbar Overflow Fix — Scrollable QAB & formatting toolbar

- Added `overflow-x: hidden` on `html` and `body` to prevent horizontal page scroll on mobile
- Quick Action Bar (QAB) made horizontally scrollable at ≤1199px instead of overflowing
- Formatting toolbar made horizontally scrollable at ≤767px with hidden scrollbar
- Header collapse button hidden at ≤1199px (QAB disabled at sub-desktop widths)
- GitHub link and Help pill hidden at ≤767px for compact mobile header
- Header container constrained with `max-width: 100vw` and `overflow-x: hidden`
- Updated README release notes with mobile toolbar fix entry
- Updated README Extras feature description to mention scrollable toolbars
- Updated Feature Showcase template Extras row in `documentation.js`

---

## Summary
Fixed the mobile toolbar overflow issue where the Quick Action Bar and formatting toolbar buttons extended beyond the viewport, causing unwanted horizontal page scroll on mobile devices. Toolbars now use contained horizontal scrolling.

---

## 1. Page-Level Overflow Containment
**Files:** `css/base.css`
**What:** Added `overflow-x: hidden` to both `html` and `body` elements
**Impact:** Prevents the entire page from scrolling horizontally on any device, eliminating the core visible symptom

## 2. Quick Action Bar Mobile Scrolling
**Files:** `css/header.css`
**What:** At `max-width: 1199px`, replaced the QAB's default flex layout with `overflow-x: auto`, `flex-wrap: nowrap`, hidden scrollbar (webkit + Firefox), and `flex-shrink: 0` on all child elements
**Impact:** All QAB buttons are accessible via horizontal swipe without pushing the page width beyond the viewport

## 3. Formatting Toolbar Mobile Scrolling
**Files:** `css/formatting.css`
**What:** At `max-width: 767px`, changed from `flex-wrap: wrap` to `flex-wrap: nowrap` with `overflow-x: auto` and hidden scrollbar; all buttons set to `flex-shrink: 0`
**Impact:** Formatting toolbar buttons are swipeable on mobile instead of wrapping into multiple rows or overflowing the page

## 4. Header Tightening for Phones
**Files:** `css/header.css`
**What:** At `max-width: 767px`, hid the GitHub link and Help pill, reduced header padding, and tightened brand toggle spacing
**Impact:** More space for essential header elements on narrow phone screens

## 5. README & Template Updates
**Files:** `README.md`, `js/templates/documentation.js`
**What:** Added release note entry for the mobile fix; updated Extras feature description in both README and Feature Showcase template
**Impact:** Documentation accurately reflects the scrollable toolbar mobile UX

---

## Files Changed (5 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `css/base.css` | +5 −0 | Overflow containment |
| `css/header.css` | +40 −5 | QAB scroll + header tightening |
| `css/formatting.css` | +25 −5 | Formatting toolbar scroll |
| `README.md` | +2 −1 | Release notes + feature update |
| `js/templates/documentation.js` | +1 −1 | Feature template update |
