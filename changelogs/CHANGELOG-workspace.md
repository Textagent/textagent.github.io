# Workspace Sidebar — Multi-File Support

- Added sidebar file tree with create, rename, duplicate, and delete file operations
- Per-file localStorage persistence via `mdview-file-{id}` keys
- Keyboard shortcut `Ctrl+B` to toggle workspace sidebar
- Right-click context menu on files (rename, duplicate, delete)
- Active file highlighting with visual indicators
- "New" button now creates files in workspace instead of opening new tabs
- Escape key closes workspace sidebar in the unified handler
- Added workspace toggle button to the toolbar (folder icon)

---

## Summary
Introduced a multi-file workspace sidebar that allows users to manage multiple markdown documents within a single browser tab. Files are stored in localStorage with per-file keys, and the sidebar supports full CRUD operations with a context menu.

---

## 1. Workspace Sidebar UI
**Files:** `index.html`, `css/workspace.css`
**What:** Added HTML structure for the workspace sidebar (`<aside>` with file list, header, context menu) and 238 lines of CSS for layout, styling, and responsive behavior
**Impact:** Users can now see and manage multiple files in a sidebar panel, similar to VS Code's file explorer

## 2. Workspace Logic
**Files:** `js/workspace.js`
**What:** New 433-line module implementing file CRUD (create, rename, duplicate, delete), active file tracking, per-file content save/restore, context menu handling, and sidebar toggle
**Impact:** Full multi-file workflow — switch between documents, manage files, and persist each file's content independently

## 3. Per-File Persistence
**Files:** `js/cloud-share.js`
**What:** Modified `saveToLocalStorage()` and `restoreFromLocalStorage()` to use per-file keys (`mdview-file-{id}`) when workspace is active, falling back to the legacy single-key approach
**Impact:** Each workspace file's content is saved and restored independently

## 4. Keyboard Shortcuts & Escape Handling
**Files:** `js/app-init.js`
**What:** Added `Ctrl+B` shortcut to toggle workspace sidebar; added workspace sidebar to the unified Escape key handler
**Impact:** Quick keyboard access to the file tree and consistent Escape-to-close behavior

## 5. Module Loading
**Files:** `src/main.js`
**What:** Added imports for `css/workspace.css` and `js/workspace.js` to the module loading pipeline
**Impact:** Workspace feature loads automatically with the app

## 6. README & Template Updates
**Files:** `README.md`, `js/templates/documentation.js`
**What:** Added release note entry; updated Extras feature description in both README and Feature Showcase template
**Impact:** Documentation reflects the new workspace feature

---

## Files Changed (8 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +26 −0 | Sidebar HTML + toolbar button |
| `css/workspace.css` | +238 (new) | Sidebar styling |
| `js/workspace.js` | +433 (new) | Workspace logic |
| `js/cloud-share.js` | +20 −3 | Per-file persistence |
| `js/app-init.js` | +6 −0 | Keyboard shortcuts |
| `src/main.js` | +2 −0 | Module imports |
| `README.md` | +2 −1 | Release notes + feature update |
| `js/templates/documentation.js` | +1 −1 | Feature template update |
