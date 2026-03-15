# CHANGELOG — Session & File Management Fixes

**Date:** 2026-03-16

## Summary

Comprehensive audit and fix of TextAgent's file management, cloud session, and disk workspace code. Resolved 12 bugs across session state management, disk file I/O paths, and cloud auto-save behavior.

## Changes

### Cloud Session & URL Hash Fixes (`js/cloud-share.js`)

- **Fixed:** Cloud auto-save no longer overwrites all files to the same Firebase doc — added `resetCloudForFileSwitch()` to unbind cloud doc on file switch
- **Fixed:** Boot-sequence content flicker — deferred localStorage restore when a share hash is present, eliminating restore → shared overwrite double render
- **Fixed:** Autosave disk write now uses `writeFileToPath()` instead of flat `writeFile()` for correct subdirectory writes

### File Switching & Shared Doc Cleanup (`js/workspace.js`)

- **Fixed:** `wsCreateFile()`, `wsOpenFile()`, and `openDiskFile()` now call `clearCloudSession()` when leaving a shared doc, preventing stale `#id=...&k=...` URLs
- **Fixed:** All three file-switch paths call `resetCloudForFileSwitch()` so each workspace file gets its own independent cloud doc
- **Fixed:** `getFileContentAsync()` uses `readFileFromPath()` for correct subdirectory file reads
- **Fixed:** `setFileContent()` uses `writeFileToPath()` for correct subdirectory disk writes
- **Fixed:** `removeFileContent()` uses `deleteFileFromPath()` for correct subdirectory file deletes
- **Fixed:** `wsConnectFolder()`, `wsReconnectFolder()`, `wsRefreshFromDisk()` all use `readFileFromPath()` for initial file loads
- **Fixed:** `wsDisconnectFolder()` now calls `clearCloudSession()` to stop the cloud timer
- **Fixed:** `setFileContent()` shows a user-facing toast when localStorage quota is exceeded instead of silently failing

### Disk Reconnection UX (`js/disk-workspace.js`)

- **Improved:** Replaced auto-dismissing toast with a persistent amber "Reconnect" sidebar banner when folder permission expires
- **Added:** Clickable "Reconnect" button in sidebar that triggers `requestPermission()` directly

### Reconnect Banner Styling (`css/workspace.css`)

- **Added:** CSS for `.ws-reconnect-notice` and `.ws-reconnect-btn` (amber-themed persistent banner)

### Collaborative Editing Plan (`upgradePlan/collaborative-editing.md`)

- **Added:** Implementation plan for future real-time collaborative editing using Yjs + WebRTC + CodeMirror 6

## Files Modified

- `js/workspace.js` — 8 bug fixes across file CRUD, disk I/O, and cloud session management
- `js/cloud-share.js` — 3 bug fixes + new `resetCloudForFileSwitch()` API
- `js/disk-workspace.js` — Persistent reconnect banner replacing transient toast
- `css/workspace.css` — Reconnect banner styles

## Files Added

- `upgradePlan/collaborative-editing.md` — Future collab editing implementation plan
