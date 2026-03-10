# Toolbar Overflow Dropdowns, Linux Group Expansion & Template Icon Refresh

- Added Coding tag group to toolbar with 🐚 Bash + 🔢 Math inline and `…` overflow dropdown for Python, HTML, JS, SQL
- Collapsed AI Tags group to AI + Think + `…` (Image, Agent, Fill)
- Expanded Linux group with 🐧 Linux + 🔷 C++ inline and `…` overflow dropdown for Rust, Go, Java
- Registered C++, Rust, Go, Java formatting actions in `linux-docgen.js` with starter code templates
- Added `.fmt-linux-group` CSS with green-accented border and inline-flex layout
- Updated Template button icon from `bi-file-earmark-richtext` to `bi-columns-gap` across header, mobile menu, QAB, and modal header
- Replaced 11 generic `bi-cpu` coding template icons with language-specific Bootstrap Icons

---

## Summary
Enhanced the formatting toolbar with an overflow dropdown pattern for compact display, expanded the Linux tag group to support C++/Rust/Go/Java compiled languages, and refreshed template icons for better visual distinction.

---

## 1. Toolbar Overflow Dropdown Pattern
**Files:** `index.html`, `css/ai-docgen.css`, `js/coding-blocks.js`, `src/main.js`
**What:** Restructured AI Tags, Linux, and Coding groups to show 2 inline buttons + `…` overflow dropdown. Added CSS for dropdown positioning and JS click handler with event delegation. Imported `coding-blocks.js` in Phase 3b of `main.js`.
**Impact:** Toolbar is more compact while retaining all actions; consistent UX pattern across all 3 groups.

## 2. Linux Group Expansion
**Files:** `index.html`, `js/linux-docgen.js`, `css/linux-terminal.css`
**What:** Added C++, Rust, Go, Java buttons to the Linux group with overflow dropdown. Registered 4 new `M.registerFormattingAction` entries that insert `{{Linux:}}` tags with language-specific starter code. Added `.fmt-linux-group` CSS with `display: inline-flex` and green accent border.
**Impact:** Users can now insert C++, Rust, Go, and Java compile-and-run tags directly from the toolbar.

## 3. Template Icon Refresh
**Files:** `index.html`, `js/modal-templates.js`, `js/templates/coding.js`
**What:** Changed main Template button icon from `bi-file-earmark-richtext` to `bi-columns-gap` (layout grid) in 4 locations. Replaced 11 generic `bi-cpu` icons on coding templates with language-specific icons (bi-braces, bi-gem, bi-cup-hot, etc.).
**Impact:** Template picker is visually distinctive with each coding template having a unique, recognizable icon.

---

## Files Changed (8 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +30 −15 | Restructured toolbar groups, updated template icons |
| `css/ai-docgen.css` | +15 | Overflow dropdown CSS |
| `css/linux-terminal.css` | +18 | Linux group container CSS |
| `js/coding-blocks.js` | +51 | NEW — overflow dropdown JS handler |
| `js/linux-docgen.js` | +40 | C++, Rust, Go, Java formatting actions |
| `js/modal-templates.js` | +1 −1 | Modal header icon update |
| `js/templates/coding.js` | +11 −11 | Language-specific template icons |
| `src/main.js` | +1 | Import coding-blocks.js |
