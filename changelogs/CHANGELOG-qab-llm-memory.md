# QAB Export — Add Missing LLM Memory Option

- Added LLM Memory option to the Quick Action Bar (QAB) Export dropdown
- Wired QAB LLM Memory button to delegate to the main `export-llm-memory` button
- Fixed: QAB Export dropdown was missing LLM Memory while the main header Export dropdown had it

---

## Summary
The Quick Action Bar (QAB) Export dropdown was missing the LLM Memory option that existed in the main header Export dropdown. Added the missing menu item and wired it to the existing LLM Memory converter modal.

---

## 1. QAB Export Dropdown — LLM Memory Item
**Files:** `index.html`
**What:** Added a dropdown divider and "LLM Memory" button (with `bi-braces` icon) to the QAB Export dropdown menu, matching the main header's Export dropdown structure.
**Impact:** Users can now access LLM Memory export from the collapsed Quick Action Bar, not just the full header.

## 2. QAB LLM Memory Button Wiring
**Files:** `js/app-init.js`
**What:** Added event listener for `qab-export-llm-memory` that delegates click to the main `export-llm-memory` button, consistent with how the other QAB export buttons (MD, HTML, PDF) are wired.
**Impact:** Clicking LLM Memory in the QAB Export dropdown opens the LLM Memory converter modal.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +3 −0 | Added LLM Memory item to QAB Export dropdown |
| `js/app-init.js` | +4 −0 | Wired QAB LLM Memory button click handler |
