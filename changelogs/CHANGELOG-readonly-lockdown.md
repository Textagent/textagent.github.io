# Read-Only Mode UI Lockdown

**Date:** 2026-03-18

## Summary

Enforces true read-only mode when viewing shared documents. Previously only the textarea was made read-only via the HTML `readOnly` attribute, but all toolbar buttons (formatting, tags, templates, etc.) remained fully functional and could modify content programmatically. Now all editing UI is visually disabled and functionally blocked.

## Changes

### styles.css
- Added `body.editor-readonly` CSS rules targeting all editing buttons (`.fmt-btn`, tag buttons, QAB write controls, find/replace, dropzone)
- Disabled buttons show `opacity: 0.35`, `cursor: not-allowed`, and `user-select: none` with `!important`

### js/cloud-share.js
- `showSharedBanner()`: adds `editor-readonly` class to `<body>` alongside `readOnly = true`
- `hideSharedBanner()`: removes `editor-readonly` class alongside `readOnly = false`
- Added capturing click interceptor for disabled buttons — shows "🔒 Read-only mode — editing is disabled" toast

### js/editor-features.js
- Added `if (M.markdownEditor.readOnly) return;` guard to 7 core functions:
  - `wrapSelection()`, `insertAtCursor()`, `insertLinePrefix()` (formatting)
  - `replaceOne()`, `replaceAll()` (find & replace)
  - Image paste handler
  - Keyboard shortcut handler (Ctrl+B, Ctrl+I, Ctrl+K)

### js/app-init.js
- Added read-only guard to `handleDrop()` (drag & drop file import)
- Added read-only guard to file input change handler

## What remains enabled in read-only mode
- View mode switching, theme toggle, zen/focus mode
- Export (MD, HTML, PDF, LLM Memory)
- Copy markdown, scrolling, AI panel browsing
