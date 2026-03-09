# VS Code-Style Folder Tree View + Context Menu Fix

- Fixed context menu bug: rename, duplicate, delete now capture target ID before hideContextMenu() clears it
- Added recursive `scanDirectory()` to disk-workspace.js — returns sorted tree (folders first, then files)
- Added path-based file I/O: `readFileFromPath`, `writeFileToPath`, `deleteFileFromPath`, `renameFileInPath`
- Added `getSubdirHandle()` helper to resolve nested directory paths like `notes/ideas`
- Added VS Code-style tree rendering in workspace.js: collapsible folders with chevrons, file-type icons for 12 extensions
- Sidebar header dynamically shows connected folder name (e.g., "my-project") or "Files" when disconnected
- Added `ws-folder-label` span to index.html sidebar header
- Added 80+ lines of tree view CSS: tree rows, folder/file nodes, golden folder icons, active file highlighting, nested children indentation
- Disconnect clears tree state (`diskTreeData`, `activeFilePath`) and reverts to flat localStorage view

---

## Summary
Convert the flat sidebar file list into a recursive, collapsible directory tree when connected to a disk folder (VS Code-style). Also fix a critical context menu bug where rename/duplicate/delete actions silently failed because the target ID was nulled before use.

---

## 1. Context Menu Bug Fix
**Files:** `js/workspace.js`
**What:** All three context menu action handlers (rename, duplicate, delete) called `hideContextMenu()` as the first operation, which set `contextMenuTargetId = null`. The handlers then checked `if (!contextMenuTargetId)` and returned early, making all three actions silently fail. Fixed by capturing the target ID in a local variable before calling `hideContextMenu()`.
**Impact:** Rename, duplicate, and delete now work correctly in both localStorage and disk mode.

## 2. Recursive Directory Scanning
**Files:** `js/disk-workspace.js`
**What:** Added `disk.scanDirectory(handle, parentPath, maxDepth)` that recursively iterates directory entries, builds a tree structure `[{ name, kind, path, children }]`, skips hidden/system directories (`.textagent`, `.git`), and sorts folders-first then files alphabetically. Max depth of 5 prevents infinite recursion.
**Impact:** The sidebar can now display the full folder structure instead of just root-level `.md` files.

## 3. Path-Based File I/O
**Files:** `js/disk-workspace.js`
**What:** Added `readFileFromPath`, `writeFileToPath`, `deleteFileFromPath`, `renameFileInPath` that accept relative paths like `notes/intro.md` and navigate through nested directory handles. Internal `getSubdirHandle()` resolves path segments into `FileSystemDirectoryHandle` chains.
**Impact:** Files in subdirectories can be opened, saved, and managed through the tree view.

## 4. Tree View Rendering
**Files:** `js/workspace.js`
**What:** Added `renderDiskTreeView()`, `renderTreeNodes()`, `renderFolderNode()`, `renderFileNode()`, and `openDiskFile()`. Folder nodes render with rotatable chevrons (▸/▾), golden folder icons, and collapsible nested `<ul>`. File nodes render with file-type-specific icons (12 extensions mapped). An `expandedFolders` Set persists expand state across re-renders. `loadDiskTree()` is called in connect, refresh, and reconnect flows. Disconnect clears tree state.
**Impact:** Users see a VS Code-style collapsible tree when connected to a disk folder.

## 5. HTML & CSS Updates
**Files:** `index.html`, `css/workspace.css`
**What:** Added `ws-folder-label` span in sidebar header for dynamic folder name display. Added 80+ lines of tree CSS: `.ws-tree-folder`, `.ws-tree-file`, `.ws-tree-row`, `.ws-tree-chevron`, `.ws-tree-icon`, `.ws-tree-children`, etc. Folder icons use golden color (#e8a317), active file gets accent-colored border.
**Impact:** Clean, VS Code-style visual appearance for the folder tree.

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/workspace.js` | +175 −8 | Tree rendering, context menu fix |
| `js/disk-workspace.js` | +90 | Recursive scan, path-based I/O |
| `css/workspace.css` | +82 | Tree view styles |
| `index.html` | +1 −1 | Folder label span |
