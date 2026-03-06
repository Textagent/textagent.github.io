# UI Redesign — Premium, Clean, Simple

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

---

## Summary
Complete visual refresh of the MDview interface. CSS-only redesign (no JavaScript logic changes) that modernizes the toolbar, view controls, and stats display while preserving all existing features.

---

## 1. Ghost-Style Toolbar Buttons
**Files:** `css/header.css`, `styles.css`
**What:** Toolbar buttons changed from bordered boxes (`border: 1px solid`) to borderless ghost-style (`background: transparent; border: transparent`).
**Impact:** Cleaner, less cluttered header. Buttons only reveal themselves on hover with a subtle lift (`translateY(-1px)`) and shadow. Reduces visual noise significantly.

## 2. Pill-Shaped View Mode Control
**Files:** `css/view-mode.css`
**What:** View mode buttons (Editor, Split, Preview, PPT) wrapped in a rounded pill container (`border-radius: 100px`) with a shared background. Active button now uses blue accent fill instead of a border highlight.
**Impact:** Instantly recognizable segmented control pattern. Active mode is clearer at a glance. Non-editor labels hidden by default, shown as tooltip on hover.

## 3. Compact Single-Line Dropzone
**Files:** `index.html`, `styles.css`, `css/header.css`
**What:** Dropzone reduced from 2-line padded box (`padding: 20px`) to a slim single-line bar (`padding: 10px 20px`). Supported formats moved inline.
**Impact:** Saves ~30px of vertical space. Less visual dominance while remaining fully functional for drag-and-drop.

## 4. Collapsible Stats Pill Bar
**Files:** `index.html`, `css/header.css`, `js/app-init.js`
**What:** Stats (reading time, word count, chars, autosave) moved from always-visible inline items to a collapsible pill. Toggle ⓘ button expands/collapses with a smooth `max-width` CSS animation. State saved in `localStorage('mdview-stats-open')`.
**Impact:** Header becomes much cleaner when collapsed. Users who want stats can expand on demand. Persists across page reloads.

## 5. Ghost Formatting Toolbar
**Files:** `css/formatting.css`
**What:** Format buttons (Bold, Italic, etc.) changed to transparent ghost-style with hover lift and opacity transitions. Separators made semi-transparent.
**Impact:** Consistent design language with the header toolbar. Less visual clutter above the editor.

## 6. Editor Pane Shadow Separator
**Files:** `css/editor.css`, `styles.css`
**What:** Hard `border-right: 1px solid` between editor and preview replaced with subtle `box-shadow: 1px 0 0`. Scrollbar tracks made transparent with rounded thumb.
**Impact:** Softer visual division between panes. Scrollbars feel more integrated.

## 7. Monochrome AI Button
**Files:** `css/header.css`, `css/ai-panel.css`, `styles.css`
**What:** AI sparkle button changed from purple gradient (`linear-gradient #667eea → #764ba2`) to monochrome: black (`#1a1a2e`) in light mode, white in dark mode. Purple pulsing animation (`aiPulse`) removed.
**Impact:** AI button now blends with the overall monochrome design while still standing out as a pill shape. Active state uses the theme accent color.

## 8. Rounded Dropdown Menus
**Files:** `css/header.css`, `styles.css`
**What:** Dropdown menus updated with `border-radius: 10px`, inner item radius `6px`, and `box-shadow: 0 8px 24px`. Items get padding and hover transitions.
**Impact:** Menus feel modern and polished instead of flat/boxy.

---

## Files Changed (9 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `css/header.css` | +280 −120 | Rewritten — ghost buttons, stats pill, dropzone, mobile menu |
| `css/view-mode.css` | +8 −8 | Pill container, responsive class updates |
| `css/editor.css` | +6 −4 | Shadow separator, scrollbar polish |
| `css/formatting.css` | +12 −8 | Ghost format buttons, opacity transitions |
| `css/ai-panel.css` | +18 −22 | Monochrome AI button, removed purple gradient |
| `styles.css` | +30 −28 | Synced duplicates: toolbar, dropzone, AI button, tooltips |
| `index.html` | +16 −8 | Stats pill HTML, compact dropzone markup |
| `js/app-init.js` | +17 −0 | Stats toggle wiring with localStorage |
| `CHANGELOG-ui-redesign.md` | NEW | This file |
