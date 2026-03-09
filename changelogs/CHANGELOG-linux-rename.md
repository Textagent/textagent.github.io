# Linux Toolbar Rename + Demo Video Fix

- Renamed toolbar button from "Terminal" to "Linux" in formatting toolbar
- Updated help-mode entry name from "Linux Terminal / Compile & Run" to "Linux"
- Fixed Piston→Judge0 CE reference in help-mode description
- Replaced corrupt 11KB demo video with proper 3.5MB recording

---

## Summary
Renamed the toolbar button label from "Terminal" to "Linux" across the UI and help system, and replaced the corrupt demo video.

---

## 1. Toolbar Button Rename
**Files:** `index.html`
**What:** Changed the formatting toolbar button text from "🐧 Terminal" to "🐧 Linux" and updated title attributes.
**Impact:** The button now reads "Linux" instead of "Terminal", matching the broader Compile & Run capability.

## 2. Help Mode Update
**Files:** `js/help-mode.js`
**What:** Renamed help entry from "Linux Terminal / Compile & Run" to "Linux", fixed Piston→Judge0 CE reference.
**Impact:** Help popover now shows correct name and API reference.

## 3. Demo Video
**Files:** `public/assets/demos/18_compile_run.webp`
**What:** Replaced corrupt 11KB recording with proper 3.5MB demo showing C++ compilation and execution.
**Impact:** Demo video now plays correctly in README.

---

## Files Changed (3 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +3 −3 | Toolbar button rename |
| `js/help-mode.js` | +2 −2 | Help entry rename |
| `public/assets/demos/18_compile_run.webp` | binary | Demo video replacement |
