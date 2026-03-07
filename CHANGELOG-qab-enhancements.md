# QAB Enhancements & AI Panel Overlap Fix

- Added File Tree button to Quick Action Bar (compact header) — delegates to workspace-toggle
- Added Help button to QAB — delegates to help-mode-btn
- Added collapsible Tools dropdown to QAB containing: Presentation, Zen Mode, Word Wrap, Focus Mode, Voice Dictation, Dark Mode (with sun/moon icon toggle), Preview Theme picker (with checkmarks)
- Dark Mode in Tools dropdown updates icon between sun/moon and label between "Dark Mode"/"Light Mode"
- Preview Theme in Tools dropdown shows all 6 themes (GitHub, GitLab, Notion, Dracula, Solarized, Evergreen) as a collapsible section with checkmarks
- Fixed: AI panel overlap — header toolbar stays full-width when AI panel opens; content area receives margin-right instead of shrinking the entire app-container
- Fixed: Dark Mode and Preview Theme buttons now work directly instead of delegating to hidden header buttons
- Updated README release notes with 2 new entries
- Updated Features at a Glance table with QAB details
- Updated Feature Showcase template in documentation.js

---

## Summary
Enhanced the Quick Action Bar (compact header mode) with missing buttons and a consolidated Tools dropdown, and fixed the AI panel toolbar overlap issue by keeping the header full-width.

---

## 1. QAB File Tree, Help & Tools Dropdown
**Files:** `index.html`, `js/app-init.js`
**What:** Added qab-files (File Tree), qab-help (Help), and a Tools dropdown containing Presentation, Zen, Word Wrap, Focus, Voice Dictation, Dark Mode, and Preview Theme. Each button delegates to its corresponding header button or implements functionality directly when the header is hidden.
**Impact:** All features are now accessible from the compact header view without needing to expand the full header.

## 2. Dark Mode Icon Toggle
**Files:** `index.html`, `js/app-init.js`
**What:** Added `id="qab-theme-icon"` and `id="qab-theme-label"` to the Dark Mode dropdown item. JS handler toggles icon class (bi-moon ↔ bi-sun-fill) and label text ("Dark Mode" ↔ "Light Mode"). Icon is also synced on page init.
**Impact:** Users can see the current theme state at a glance in the Tools dropdown.

## 3. Collapsible Preview Theme Picker
**Files:** `index.html`, `js/app-init.js`
**What:** Replaced flat theme list with a "Preview Theme ▸" toggle button that shows/hides all 6 theme options. Chevron rotates between right/down. Each theme has a checkmark indicating active selection. `stopPropagation` prevents dropdown from closing when toggling.
**Impact:** Theme selection is clean and doesn't clutter the Tools dropdown when not needed.

## 4. AI Panel Overlap Fix
**Files:** `css/base.css`, `css/ai-panel.css`
**What:** Changed `body.ai-panel-active .app-container` rule from width-based shrinking to applying `margin-right: var(--ai-panel-width)` to sub-header elements only. AI panel overlays the header via z-index (1050 vs 100).
**Impact:** Header toolbar stays full-width and slides behind the AI panel naturally, preventing icon compression and overlap.

## 5. README & Template Updates
**Files:** `README.md`, `js/templates/documentation.js`
**What:** Added 2 new release note entries. Updated Extras row in Features table. Updated Feature Showcase template with QAB details and 2 new task list items.
**Impact:** Documentation reflects all current features accurately.

---

## Files Changed (5 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +59 −2 | QAB buttons, Tools dropdown with themes |
| `js/app-init.js` | +100 −2 | Event handlers for all new QAB buttons |
| `css/base.css` | +12 −2 | AI panel margin-right for sub-header elements |
| `css/ai-panel.css` | +9 −2 | Mobile responsive margin-right reset |
| `README.md` | +63 | Release notes, Features table update |
| `js/templates/documentation.js` | +4 −2 | Feature Showcase template updates |
