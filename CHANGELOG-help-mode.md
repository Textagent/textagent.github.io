# Help Mode + Bug Fixes

## New Features

### Interactive Help Mode
- Added ❓ Help pill button in left header (near TextAgent branding)
- Teal gradient pill styled like Demo badges
- Clicking activates "learning mode" — all toolbar buttons get teal ring highlights
- Clicking any highlighted button shows a popover with:
  - Feature name and description
  - Keyboard shortcut (if applicable)
  - ▶ **Watch Demo** button (for features with demo videos)
- Demo videos play in a **50% screen dark panel** with:
  - Fullscreen expand/collapse toggle (⛶ icon)
  - Esc key: exits fullscreen first, then closes panel
- All 9 product demo videos mapped to ~35 toolbar buttons:
  - `01_privacy_hero.webp` → New Document
  - `02_ai_assistant.webp` → AI Assistant, AI Model, AI/Think/Image tags, Fill
  - `03_templates_gallery.webp` → Templates, Vars
  - `04_code_execution.webp` → Code Block
  - `05_presentation_mode.webp` → Presentation, PPT View, HR
  - `06_table_tools.webp` → Insert Table
  - `07_writing_modes.webp` → Focus, Zen, Theme, Dark Mode, View Modes
  - `08_import_export.webp` → Import, Export
  - `09_encrypted_sharing.webp` → Encrypted Share
- "Try it →" button exits help mode and triggers the action

## Bug Fixes

### AI Document Tags Rendering
- Fixed `getFencedRanges()` in `ai-docgen.js` to also detect inline backtick code spans
- `{{AI: prompt}}` text inside <code>backticks</code> is no longer parsed as real AI tags
- Feature Showcase template now renders the AI Document Tags table correctly

## Files Changed

| File | Change |
|------|--------|
| `js/help-mode.js` | **NEW** — Help Mode module (HELP_DATA registry, toggle, popover, demo panel) |
| `css/help-mode.css` | **NEW** — Teal pill, button rings, popover, 50% demo panel, fullscreen |
| `index.html` | Help pill button in left header section |
| `src/main.js` | CSS + JS dynamic imports for help-mode |
| `js/ai-docgen.js` | Inline backtick exclusion in `getFencedRanges()` |
| `README.md` | Help Mode in Features table + Release Notes entry |
| `js/templates/documentation.js` | Help Mode row in Feature Showcase template |
