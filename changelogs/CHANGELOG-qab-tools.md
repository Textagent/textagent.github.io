# QAB Tools Dropdown Reorganization

- Moved TOC button from standalone QAB button into Tools dropdown
- Moved Copy Markdown button from standalone QAB button into Tools dropdown
- Moved Open Issues link from standalone QAB button into Tools dropdown
- Added dividers in Tools dropdown to separate groups (TOC/Copy | Presentation/Zen/WordWrap/Focus/Voice | Theme | Open Issues)

---

## Summary
Reorganized the Quick Action Bar (collapsed header) to reduce button clutter by moving TOC, Copy, and Open Issues into the Tools dropdown.

---

## 1. QAB Button Consolidation
**Files:** `index.html`
**What:** Removed `qab-toc`, `qab-copy`, and Open Issues as standalone QAB buttons. Added them as dropdown items inside the Tools dropdown with appropriate dividers and icons.
**Impact:** Cleaner collapsed header with fewer buttons; TOC, Copy, and Open Issues are still accessible via Tools dropdown.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +12 −14 | QAB layout reorganization |
