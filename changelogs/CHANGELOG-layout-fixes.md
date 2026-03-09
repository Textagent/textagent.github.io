# Layout & UI Fixes

## Changes

### 1. Fix right-side content clipping when sidebars are open
- **Root cause**: `applyPaneWidths()` in `js/ui-panels.js` set `flex: 0 0 calc(50% - 4px)` on editor/preview panes — `flex-shrink: 0` prevented panes from shrinking when sidebar (220px) + TOC (240px) consumed horizontal space
- **Fix**: Changed to `flex: 1 1 calc(50% - 4px)` so panes properly shrink
- Also added `min-width: 0` on both panes and `overflow-x: hidden` on preview pane in `css/editor.css`

### 2. TOC toggle button active state
- `toggleTOC()` and `closeTOC()` in `js/ui-panels.js` now toggle `.active` class on the button
- Added blue accent color (`var(--accent-color)`) for `#toc-toggle.active` and `#workspace-toggle.active` in `css/workspace.css`, matching the word wrap / focus mode button style

### 3. Dropzone file format text invisible in dark mode
- The "MD, DOCX, XLSX, CSV, HTML, JSON, XML, PDF" text used Bootstrap's `text-muted` class with hardcoded gray (#6c757d)
- Replaced with `color: var(--text-color)` at 55% opacity so it adapts to both themes

## Files Modified
- `js/ui-panels.js` — flex-shrink fix + TOC active class
- `css/editor.css` — min-width: 0, overflow-x: hidden, removed explicit width from .markdown-body
- `css/workspace.css` — blue accent active state for sidebar/TOC toggles
- `index.html` — dark-mode-safe dropzone format text
