# Open File From Disk — Single-File Disk Linking

- Added **"Open File"** button (📄⬆, `ws-open-file`) to the workspace sidebar header, next to "Open Folder" — opens a single file from disk via `showOpenFilePicker` and keeps it **linked** so edits autosave back to that exact file, independently of folder/disk-workspace mode
- New single-file handle API in `disk-workspace.js`: `openSingleFile`, `linkSingleFile`, `hasSingleFile`, `writeSingleFile`, `unlinkSingleFile`, `unlinkAllSingleFiles`, `restoreSingleFiles`; handles persisted to IndexedDB (`file:<id>` keys) so links survive page reloads
- New `M.wsOpenDiskFile()` in `workspace.js` — reads the picked file into a new workspace entry, links its handle, dedupes the display name, and marks it manually-named so auto-naming can't rename the linked file
- Button auto-hides in browsers without the File System Access API (same constraint as "Open Folder"); Chromium-only
- **Fixed (critical):** edits to a linked file never reached disk — the per-keystroke autosave path (`cloud-share.js` → `saveToLocalStorage`) only had a folder-mode disk branch and never called `writeSingleFile`. Added a single-file write-back branch (checked before the folder branch) plus a `pagehide`/`beforeunload` flush so the last keystrokes before reload/close still land on disk
- **Fixed (major):** picked handle was read-only — `openSingleFile` now requests `readwrite` permission within the original click gesture, so autosave writes don't prompt out-of-context or silently fail
- **Fixed (major):** `writeSingleFile` had no serialization — added a per-id write queue so rapid edits/switches can't land out of order and corrupt the file
- **Fixed (major):** deleting a linked file no longer routes through the folder delete (could `removeEntry` a same-named file inside a connected folder); renaming a linked file no longer writes/deletes inside the connected folder; deleting the *last* file no longer truncates the linked disk file to empty
- **Fixed (major):** connecting/reconnecting a folder now unlinks single-file handles instead of orphaning them in IndexedDB
- **Fixed (minor):** open no longer performs a redundant identical-content write (mtime bump); orphaned IndexedDB handles are pruned on load; persistence failure surfaces a warning; renaming a linked non-`.md` file (`.txt`/`.log`) preserves its extension; opening a local disk file no longer auto-publishes a new encrypted cloud copy

---

## Summary

Added an "Open File" action so users can open a single file from disk and have their edits autosave straight back to it — without connecting an entire folder. The single-file handle is held in memory and persisted to IndexedDB, so the link survives reloads. The feature also coexists safely with the existing folder-backed workspace: a deep multi-agent review surfaced one critical defect (edits never actually reached disk because autosave runs through a different code path than the one originally hooked) and a cluster of data-integrity bugs where the single-file path collided with folder mode and could destroy unrelated real files. All are fixed and verified.

---

## 1. Single-File Open Button & UI
**Files:** `index.html`, `js/disk-workspace.js`
**What:** Added the `ws-open-file` button to the sidebar header. `disk.updateUI()` shows it whenever `showOpenFilePicker` is supported (independent of folder connection); `disk.wireUI()` binds it to `M.wsOpenDiskFile`.
**Impact:** Users get a discoverable, folder-free way to open and edit a single file from disk.

## 2. Single-File Handle API
**Files:** `js/disk-workspace.js`
**What:** `openSingleFile()` opens via `showOpenFilePicker` and requests `readwrite` permission in-gesture; `linkSingleFile()`/`unlinkSingleFile()`/`unlinkAllSingleFiles()` manage the `id → FileSystemFileHandle` map and its IndexedDB persistence; `writeSingleFile()` writes back through a per-id serialized queue with lazy permission re-request; `restoreSingleFiles(validIds)` repopulates handles on load and prunes orphans.
**Impact:** Edits to a linked file write back to the exact on-disk file, in order, across reloads — and stale handles don't accumulate.

## 3. Open Flow & Workspace Integration
**Files:** `js/workspace.js`
**What:** `M.wsOpenDiskFile()` saves the current doc, creates a deduped workspace entry, links the handle, and caches content to localStorage directly (no redundant disk echo). `setFileContent`/`removeFileContent` route through the single-file path; `performDelete`, `wsDeleteFile`, `wsRenameFile`, and the inline rename are all guarded so single-linked files never trigger folder-mode I/O. `wsConnectFolder`/`wsReconnectFolder` unlink all single files before rebuilding the workspace.
**Impact:** The single-file feature coexists with folder mode without deleting, truncating, or misrouting real files.

## 4. Critical Fix: Edits Now Autosave to Disk
**Files:** `js/cloud-share.js`
**What:** The real per-keystroke autosave (`input` → `debouncedAutosave` → `saveToLocalStorage`) only wrote to disk in folder mode. Added a single-file branch (checked before the folder branch) calling `writeSingleFile`, with a clear "⚠️ Not saved to disk" indicator on failure, plus a `pagehide`/`beforeunload` flush of any pending debounced save. Also suppressed first-time encrypted cloud publication for single-linked files.
**Impact:** Typing into an opened file now actually persists to that file on disk — the feature's core promise.

---

## Testing

- Verified live (browser preview): keystroke autosave writes to the linked file; write serialization preserves order under slow I/O; open performs zero redundant writes; delete/rename guards behave; permission requested on open.
- `disk-workspace.spec.js` Playwright suite: 30 passing, no regressions (the single pre-existing modal-click flake is unrelated and fails identically on baseline).
- ESLint: no new errors/warnings on changed files.
