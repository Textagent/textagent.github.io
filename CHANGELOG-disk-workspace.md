# Disk-Backed Workspace — Folder Storage via File System Access API

- Added `js/disk-workspace.js` — new module for File System Access API integration (folder picker, file I/O, IndexedDB handle persistence, auto-reconnect)
- Modified `js/workspace.js` — dual-mode storage (localStorage + disk); 4 new public methods: `wsConnectFolder`, `wsDisconnectFolder`, `wsRefreshFromDisk`, `wsReconnectFolder`
- Modified `js/cloud-share.js` — autosave routes to disk when in folder mode; shows "💾 Saved to disk" indicator
- Added `DISK_MODE` storage key to `js/storage-keys.js`
- Added "Open Folder" button to sidebar header and disk status/controls footer in `index.html`
- Added `.ws-disk-controls`, `.ws-disk-status`, `.ws-disk-btn` CSS styles in `css/workspace.css`
- Wired `disk-workspace.js` import in `src/main.js` (Phase 1, right after `workspace.js`)
- Added 22 new Playwright tests in `tests/feature/disk-workspace.spec.js` (module API, UI elements, workspace sidebar behavior)

---

## Summary
Add a "folder on disk" storage mode alongside the existing localStorage mode. Users can connect a local folder via the File System Access API, and TextAgent will read/write `.md` files directly to disk. The feature integrates into the existing File Tree sidebar with an "Open Folder" button, a connected status footer, and refresh/disconnect controls. Chromium-only; hidden in unsupported browsers.

---

## 1. New Disk Workspace Module
**Files:** `js/disk-workspace.js`
**What:** Created a new single-responsibility module (~280 lines) that owns all File System Access API interactions. Exposes `M._disk` namespace with methods for folder picking, file read/write/delete/rename, manifest management, IndexedDB-based handle persistence, UI control wiring, and auto-reconnection on page load.
**Impact:** Users can connect a local folder and have their `.md` files saved directly to disk, enabling Git compatibility, easy backups, and real files on disk.

## 2. Dual-Mode Workspace Storage
**Files:** `js/workspace.js`
**What:** Added a `diskMode` flag and converted all storage functions (`saveWorkspace`, `loadWorkspace`, `getFileContent`, `setFileContent`, `removeFileContent`) to delegate to either localStorage or `M._disk.*` based on the active mode. Added `getFileContentAsync()` for disk reads. All file operations (create, open, rename, delete) now handle both backends. Exposed 4 new public methods and 2 internal helpers.
**Impact:** The workspace layer transparently switches between localStorage and disk storage. Existing localStorage behavior is untouched when `diskMode === false`.

## 3. Disk-Aware Autosave
**Files:** `js/cloud-share.js`
**What:** In `saveToLocalStorage()`, added a branch that writes to the disk file via `M._disk.writeFile()` when in folder-backed mode. The autosave indicator shows "💾 Saved to disk" instead of "Saved". `showAutosaveIndicator()` now accepts an optional message parameter.
**Impact:** Typing in the editor auto-saves to the actual `.md` file on disk via the existing debounce mechanism.

## 4. Sidebar UI Controls
**Files:** `index.html`, `css/workspace.css`
**What:** Added an "Open Folder" button (`#ws-open-folder`) to the sidebar header actions. Added a disk controls footer (`#ws-disk-controls`) with connected status badge, folder name display, refresh, reconnect, and disconnect buttons. All hidden by default and shown via JS when File System Access API is supported. Added 70 lines of CSS for the footer bar, status badge, action buttons, and red-tinted disconnect button.
**Impact:** Users see the folder controls directly inside the existing File Tree sidebar — no new UI surfaces or modals needed.

## 5. Module Loading & Storage Keys
**Files:** `src/main.js`, `js/storage-keys.js`
**What:** Added `disk-workspace.js` import right after `workspace.js` in Phase 1. Added `DISK_MODE: 'textagent-disk-mode'` storage key.
**Impact:** The disk module is available before `cloud-share.js` wires autosave.

## 6. Test Suite
**Files:** `tests/feature/disk-workspace.spec.js`
**What:** 22 new Playwright tests across 3 describe blocks: Module & API (7 tests — namespace, methods, feature detection, initial state), UI Elements (5 tests — button presence, visibility, footer state), Workspace Sidebar Core Behavior (10 tests — toggle, create, rename, delete, persist, page title, sidebar state).
**Impact:** Full coverage of the testable aspects; actual File System Access API calls require manual testing.

---

## Files Changed (8 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/disk-workspace.js` | +280 | New module — File System Access API |
| `js/workspace.js` | +180 −10 | Dual-mode storage wrappers |
| `js/cloud-share.js` | +16 −2 | Disk autosave routing |
| `js/storage-keys.js` | +3 | DISK_MODE key |
| `index.html` | +20 | Sidebar controls HTML |
| `css/workspace.css` | +70 | Disk controls styling |
| `src/main.js` | +1 | Module import |
| `tests/feature/disk-workspace.spec.js` | +265 | 22 Playwright tests |
