# Action Modal & Disk UI Polish

## Reusable Action Modal
- Unified `showActionModal()` replaces native `confirm()` and inline rename
- **Rename**: modal with editable input field, auto-selects filename sans extension, Enter submits
- **Duplicate**: confirmation modal with blue Duplicate button
- **Delete**: confirmation modal with red destructive Delete button
- Escape cancels, click-outside dismisses

## Disk Controls
- Header-only refresh ↻ and disconnect ✕ buttons (footer bar removed)
- Reconnect-on-load uses toast instead of removed footer prompt
- Cleaned `disk-workspace.js` of all stale footer references

## Bug Fixes
- Same-name rename guard: prevents no-op renames with "Name unchanged." toast
- Duplicate tree auto-refresh: `loadDiskTree()` now chains after `writeFileToPath()` completes

## Tests
- 9 new Playwright tests (111 total): action modal DOM, context menu buttons, delete modal show/cancel/ok flows, rename same-name guard
