# Clickable Folder Name

- Clicking the folder name/icon in sidebar header opens folder picker
- Added `id="ws-header-title"` with `cursor: pointer` to header title
- Wired click handler in `disk-workspace.js` to trigger `wsConnectFolder()`
- 1 new Playwright test: header title exists with pointer cursor
