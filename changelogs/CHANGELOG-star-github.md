# Star on GitHub Button — Header CTA

- Added ⭐ **Star on GitHub** pill button next to the Issues button in the header-left section
- Star button uses gold/amber gradient (`#d97706` → `#f59e0b`) to visually distinguish from teal Help/Issues pills
- Dark mode variant uses brighter gold tones (`#f59e0b` → `#fbbf24`)
- Links to `https://github.com/Textagent/textagent.github.io` in new tab
- Uses `bi-star-fill` Bootstrap icon
- Fixed: Issues button inline styles overriding `.help-mode-pill` CSS (removed cramped `font-size:0.55rem`, `max-width:3.2rem`)
- Both Issues and Star buttons now render as proper full-size pills matching the Help button

---

## Summary
Added a ⭐ Star on GitHub pill button in the header next to the Issues button, with a distinct gold/amber gradient accent to encourage repository starring. Also fixed the existing Issues button which had inline styles preventing proper pill rendering.

---

## 1. Star on GitHub Button
**Files:** `index.html`, `css/help-mode.css`
**What:** Added `<a>` element with `help-mode-pill star-github-pill` classes linking to the GitHub repo. Created `.star-github-pill` CSS class with gold gradient and dark mode variants.
**Impact:** Users see a visually prominent gold ⭐ Star button in the header, encouraging GitHub engagement directly from the app.

## 2. Issues Button Fix
**Files:** `index.html`
**What:** Removed overly restrictive inline styles (`font-size:0.55rem`, `padding:2px 6px`, `max-width:3.2rem`) that were shrinking the Issues button into a tiny link instead of a proper pill.
**Impact:** Issues button now renders at full pill size, matching the Help button's appearance.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +9 −5 | Added Star button, fixed Issues button inline styles |
| `css/help-mode.css` | +18 −0 | Added `.star-github-pill` gold accent CSS with dark mode |
