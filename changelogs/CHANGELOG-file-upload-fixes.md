# CHANGELOG — File Upload Fixes

**Date:** 2026-03-12

## Summary

Fixed critical bugs in the file import pipeline (DOCX, XLSX, CSV, HTML, JSON, XML, PDF) that prevented non-MD file uploads from working. Improvements informed by [Microsoft MarkItDown](https://github.com/microsoft/markitdown) converter patterns.

## Changes

### `index.html`
- **Added missing `#conversion-overlay` HTML element** — `file-converters.js` referenced `#conversion-overlay`, `#conversion-title`, and `#conversion-detail` elements that did not exist, causing all non-MD imports to crash with `TypeError`. Uses existing CSS from `modals.css` (`.conversion-modal`, `.conversion-spinner`, `.conversion-detail`).

### `js/file-converters.js`
- **Null-safe overlay functions** — `showConversionOverlay()` and `hideConversionOverlay()` now guard against null elements
- **HTML converter strips `<script>`/`<style>` tags** — Uses `DOMParser` + `querySelectorAll` to remove dangerous tags before Turndown conversion (adopted from MarkItDown's `_html_converter.py`)
- **XML pretty-print regex** — Added missing `g` (global) flag so all `><` pairs get newlines, not just the first occurrence
- **PDF `workerSrc` always initialized** — `GlobalWorkerOptions.workerSrc` is now set after obtaining `pdfjsLib` regardless of whether it was loaded via CDN or dynamic import (fixed `No "GlobalWorkerOptions.workerSrc" specified` error)
- **Dropzone stays visible after import** — Removed `M.dropzone.style.display = 'none'` from both MD and non-MD import paths so the upload area remains accessible for additional imports

## Files Modified
- `index.html` — +9 lines (conversion overlay element)
- `js/file-converters.js` — 6 fixes across overlay, HTML, XML, PDF, and dropzone logic
