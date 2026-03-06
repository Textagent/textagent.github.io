# CHANGELOG — UI Redesign

---

## 2026-03-06 — Header/QAB Brand Toggle & File Drop Fix

### Header & QAB Brand Toggle Alignment
- Moved collapse/expand toggle to far-left of both header and QAB
- Both views now show `chevron + MDview` as a unified brand toggle button
- Header: `▲ MDview` (collapse) | QAB: `▼ MDview` (expand)
- Pixel-aligned both toggles to same horizontal position (~1-2px tolerance)
- Added shared `.brand-label`, `.header-brand-toggle`, `.qab-brand-toggle` CSS classes
- Overrode Bootstrap `container-fluid` left padding on header to match QAB position

### File Drop Fix
- **Root cause 1**: `handleDrop()` referenced `M.getFileExtension()` and `M.SUPPORTED_EXTENSIONS` — local variables in `file-converters.js`, never exposed on `M`. Silent TypeError.
- **Root cause 2**: Body-level drop handler only fired when dropzone was hidden (QAB mode); drops on editor/preview were silently lost when header was open.
- **Fix**: Simplified `handleDrop()` to call `M.importFile()` directly. Removed display-check from body drop handler.

**Files:** `index.html`, `css/header.css`, `css/view-mode.css`, `js/app-init.js`

---

## 2026-03-05 — Premium, Clean, Simple

- Ghost-style borderless toolbar buttons with hover lift and subtle shadow
- Pill-shaped segmented control for view mode (Editor, Split, Preview, PPT)
- Active view button uses blue accent fill instead of border highlight
- Non-editor view labels hidden by default, shown as tooltip on hover
- Compact single-line dropzone (was two-line padded box), saves ~30px vertical space
- Supported file formats moved inline on the same line
- Collapsible stats pill bar — click ⓘ to expand/collapse reading time, word count, chars
- Stats toggle state persisted in localStorage across page reloads
- Slim ghost formatting buttons with opacity transitions and hover lift
- Semi-transparent separators between formatting groups
- Editor pane uses subtle box-shadow separator instead of hard border-right
- Scrollbar tracks made transparent with rounded thumb
- Monochrome AI button — black in light mode, white in dark mode (replaces purple gradient)
- Purple pulsing glow animation removed
- Active AI state uses theme accent color
- Rounded dropdown menus with 10px radius and 24px shadow
- Dropdown items get inner radius and hover transitions
- Polished mobile menu with backdrop blur overlay
- All changes are CSS-only — zero JavaScript logic changes, all features preserved

### Detailed Changes

1. **Ghost-Style Toolbar Buttons** (`css/header.css`, `styles.css`) — Borderless ghost-style with hover lift and shadow
2. **Pill-Shaped View Mode Control** (`css/view-mode.css`) — Rounded pill container with blue accent active fill
3. **Compact Single-Line Dropzone** (`index.html`, `styles.css`, `css/header.css`) — Slim bar, saves ~30px vertical
4. **Collapsible Stats Pill Bar** (`index.html`, `css/header.css`, `js/app-init.js`) — Toggle ⓘ, persisted in localStorage
5. **Ghost Formatting Toolbar** (`css/formatting.css`) — Consistent ghost style with opacity transitions
6. **Editor Pane Shadow Separator** (`css/editor.css`, `styles.css`) — Soft box-shadow instead of hard border
7. **Monochrome AI Button** (`css/header.css`, `css/ai-panel.css`, `styles.css`) — Black/white, no purple gradient
8. **Rounded Dropdown Menus** (`css/header.css`, `styles.css`) — 10px radius, 24px shadow, hover transitions

**Files changed:** `css/header.css`, `css/view-mode.css`, `css/editor.css`, `css/formatting.css`, `css/ai-panel.css`, `styles.css`, `index.html`, `js/app-init.js`
