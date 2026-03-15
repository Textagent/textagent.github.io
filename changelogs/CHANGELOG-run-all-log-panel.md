# Changelog — Run-All Progress Bar with Log Panel

**Date:** 2026-03-16

## Summary

Added a visible bottom status bar during Run All execution with an expandable
log panel that mirrors the console output, so users get real-time feedback
without opening DevTools.

## Changes

### `css/exec-engine.css`
- Restructured `.exec-progress-bar` to column layout with `.exec-progress-row`
- Added `.exec-log-toggle` button with `.exec-log-count` badge
- Added `.exec-log-panel` (expandable, max-height 300px) and `.exec-log-scroll`
- Added `.exec-log-entry` / `.exec-log-ts` / `.exec-log-icon` / `.exec-log-msg`
- Color-coded entries: `.success` (green), `.error` (red), `.warn` (yellow)
- Light-mode overrides for all new classes

### `js/exec-controller.js`
- Added `_logEntries[]` buffer, `_logStartTime`, `_logPanelOpen` state
- Added `appendLog(icon, msg, cls)` — pushes timestamped entries to buffer
- Added `buildLogEntryEl(entry)` — creates a monospaced log line DOM node
- Added `toggleLogPanel()` — opens/closes log panel, populates on open
- Rewrote `showProgress()` — new DOM with log panel + Logs toggle + abort
- Rewrote `hideProgress()` — shows "Done" summary for 4s, then removes element
- Sprinkled `appendLog()` alongside every `console.log` in `executeBlocks()`
- **Bugfix:** moved `hideProgress()` call before `_currentRun = null` so the
  completion text actually displays

## Files Modified
- `css/exec-engine.css`
- `js/exec-controller.js`
