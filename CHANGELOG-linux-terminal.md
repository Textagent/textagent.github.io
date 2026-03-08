# CHANGELOG — Linux Terminal Tag

## 2026-03-08

### Added
- **`{{Linux:}}` tag** — new markdown tag that opens a full Debian Linux terminal (WebVM) in a new browser window
  - `Packages:` field for specifying packages to install, rendered as visual package badges
  - Toolbar 🐧 Terminal button inserts the tag template
  - Card renders with launch/focus button and running status indicator
  - WebVM opens in a centered popup window with full keyboard support
  - Session persistence via IndexedDB across page reloads

### New Files
- `js/linux-docgen.js` — Core component: parsing, transformation, binding, and launch logic
- `css/linux-terminal.css` — Card, badge, status, and toolbar button styles

### Modified Files
- `js/renderer.js` — Added `transformLinuxMarkdown` to transform chain and `bindLinuxPreviewActions` to post-render actions; updated DOMPurify whitelist for `data-linux-index`
- `src/main.js` — CSS import (`linux-terminal.css`) and dynamic module import (`linux-docgen.js`)
- `index.html` — CSP `frame-src` updated for `webvm.io`; toolbar 🐧 Terminal button added
- `js/help-mode.js` — Help entry for Linux Terminal toolbar button
- `js/templates/coding.js` — Linux Terminal coding template
- `js/templates/documentation.js` — Feature Showcase updated with Linux Terminal
- `README.md` — Features table, technologies, and release notes updated
