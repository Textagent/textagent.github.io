# Media Toolbar Button — Insert Media Tags

- Added Media toolbar button group (▶ Video, 🎬 Embed Grid, ▶ YouTube)
- Rose/pink accent (#f472b6) to differentiate from AI (teal), API (orange), Linux (green), Coding (indigo)
- ▶ Video inserts `![My Video](https://www.w3schools.com/html/mov_bbb.mp4)` example
- 🎬 Embed Grid inserts a 2-column embed grid template with YouTube, video, and website examples
- ▶ YouTube inserts `![YouTube Video](https://www.youtube.com/watch?v=...)` example
- Media actions registered via `M.registerFormattingAction()` in `coding-blocks.js`
- Group uses shared `fmt-coding-group` base styles with `.fmt-media-group` accent override

---

## Summary
Adds a "Media" toolbar button group with three insert actions for video playback and embed grids, following the existing toolbar pattern.

---

## 1. Media Toolbar Buttons
**Files:** `index.html`, `js/coding-blocks.js`
**What:** Added Media button group with `data-action` attributes (media-video, media-embed-grid, media-youtube). Registered templates via `MEDIA_TEMPLATES` object and `M.registerFormattingAction()`.
**Impact:** Users can insert video/embed markdown with one click — no need to remember syntax.

## 2. Media Group Styling
**Files:** `css/ai-docgen.css`
**What:** Rose accent CSS for `.fmt-media-group` and `.fmt-media-btn` with dark/light mode support.
**Impact:** Visual consistency with other toolbar groups (AI=teal, API=orange, Linux=green, Coding=indigo, Media=rose).

---

## Files Changed (3 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +15 | Media button group HTML |
| `js/coding-blocks.js` | +13 | Media template registration |
| `css/ai-docgen.css` | +42 | Media group rose accent CSS |
