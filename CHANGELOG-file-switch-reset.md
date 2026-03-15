# File-Switch State Reset — Bug Fixes

- Fixed: Run All button stays in "Stop" mode when switching to another .md file while execution is running
- Fixed: Document variables from one file leak into another file's variable panel on file switch
- Added `resetFileSessionState()` helper in `workspace.js` — aborts running execution, force-resets `_running` flag, resets Run All button to default, removes progress bar, clears runtime + manual variables, clears `__API_VARS`, clears SQLite exec context
- Added `forceReset()` to exec-controller for immediate hard-reset of internal state (`_running`, `_currentRun`, abort flags)
- Wired `resetFileSessionState()` into both `wsOpenFile()` and `openDiskFile()` file-switch paths

---

## Summary
When switching between .md files, the Run All execution state and document variables were not reset, causing stale UI (Stop button persisting) and stale data (previous file's variables showing in the new file). Both `wsOpenFile()` and `openDiskFile()` now perform a full session cleanup on file switch.

---

## 1. File-Switch Session Reset
**Files:** `js/workspace.js`
**What:** New `resetFileSessionState()` function (L37-70) called from both `wsOpenFile()` (L636) and `openDiskFile()` (L389). It: (1) calls `abort()` + `forceReset()` on the exec-controller, (2) resets the `#run-all-btn` DOM (removes `fmt-run-active` class, restores innerHTML and title, nulls `onclick`), (3) removes the `.exec-progress-bar` element, (4) calls `clearRuntime()` + `clearManual()` on `M._vars`, (5) clears `window.__API_VARS`, (6) clears the SQLite exec context.
**Impact:** Run All button always shows "▶ Run All" on a fresh file; variable panel starts empty for new files; progress bar is removed on switch.

## 2. Exec-Controller Force Reset
**Files:** `js/exec-controller.js`
**What:** New `forceReset()` function (L1026-1031) immediately sets `_running = false`, `_currentRun = null`, and abort flags. Exposed via `M._execController.forceReset`.
**Impact:** Unlike `abort()` (which only sets `_abortRequested` and waits for the loop to exit), `forceReset()` provides an immediate hard-reset needed when switching files where the execution loop may be blocked awaiting a Promise.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/workspace.js` | +44 | New `resetFileSessionState()` helper + wired into `wsOpenFile()` and `openDiskFile()` |
| `js/exec-controller.js` | +12 | New `forceReset()` function + exposed in `M._execController` API |
