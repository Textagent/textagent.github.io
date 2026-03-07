# Feature Demo Badges — Watch Demos from Preview Pane

- Added ▶ Demo badges to Feature Showcase headings in the preview pane
- 9 feature sections mapped to 9 existing animated `.webp` demo videos
- Clicking a badge opens a fullscreen modal with the matching demo video
- Modal supports close via Escape, ✕ button, and click-outside
- Right-click + D shortcut on headings also opens the demo modal
- Teal gradient badge with hover glow animation, dark mode support
- Responsive styling for mobile (smaller badge, wider modal)
- New module loaded in Phase 2 (parallel) via Vite dynamic import

---

## Summary

Added a discoverable demo video system to the Feature Showcase. Each feature heading with a matching demo gets a teal ▶ Demo badge that opens a fullscreen animated video modal. Also supports a right-click + D keyboard shortcut.

---

## 1. Feature Demos Module
**Files:** `js/feature-demos.js`
**What:** New ~120 line module containing DEMO_MAP (keyword-to-video mapping for 9 features), `attachDemoBadges()` (scans h2 headings and injects clickable badges), `openDemoModal()`/`closeDemoModal()` (fullscreen overlay with animated `.webp`), and a right-click + D shortcut listener.
**Impact:** Users can now instantly watch demo videos for any feature directly from the preview pane, making features more discoverable and the Feature Showcase interactive.

## 2. Demo Badge & Modal Styling
**Files:** `css/feature-demos.css`
**What:** ~130 lines of CSS for `.demo-badge` (teal gradient pill, hover glow, scale animation), `.demo-modal-overlay` (fixed dark backdrop with blur), `.demo-modal-content` (centered container with entrance animation), `.demo-modal-close` (circular close button), dark mode variants, and responsive breakpoints.
**Impact:** Premium, polished visual presentation matching the app's existing design language.

## 3. Renderer Hook
**Files:** `js/renderer.js`
**What:** Added `M.attachDemoBadges(M.markdownPreview)` call after table tools in the `renderMarkdown()` post-render pipeline.
**Impact:** Demo badges are automatically injected every time the preview is re-rendered.

## 4. Vite Module Loading
**Files:** `src/main.js`
**What:** Added `import '../css/feature-demos.css'` to CSS imports and `import('../js/feature-demos.js')` to Phase 2 parallel loading.
**Impact:** Module loads alongside other independent features without blocking startup.

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/feature-demos.js` | +120 | New module — demo map, badges, modal, shortcut |
| `css/feature-demos.css` | +130 | New styles — badge, modal, dark mode, responsive |
| `js/renderer.js` | +3 | Post-render hook for badge injection |
| `src/main.js` | +2 | CSS + JS imports |
