# Fix: Annotation Thread Panel Renders With Empty Overlay Box

- Fixed the annotation Q&A panel opening with its content squeezed to the left and a large empty white box covering the right portion
- Root cause: the right-side Threads dock was created and left visible (320px wide) even when no thread was docked, painting an invisible overlay over every floating panel. Dock visibility was managed via inconsistent inline `display` styles.
- Fix: the dock is now `display:none` by default in CSS and shown only via `body.ai-tag-dock-open`, which is added exclusively when a panel is actually docked (and removed when the dock empties)
- Also: messages area sizes to content (`flex:0 1 auto`) instead of growing to fill an oversized panel; floating-panel positioning now hard-clamps to the viewport on all four edges; removed `backdrop-filter: blur()` (compositing artifacts on a fixed/draggable element) for a solid background; mobile panel height floored (`min-height`, `max-height:70vh`) instead of a collapsing `60vh`

---

## Summary

A regression in the new reading-companion thread panels: an empty dock element overlaid the right side of every floating Q&A panel, clipping the conversation into a narrow left strip. The dock is now hidden unless it actually holds a docked thread, and several panel-sizing/positioning robustness fixes were made. Verified at desktop resolution via Playwright (the live preview iframe is 1px tall and can't validate layout heights).

---

## Testing
- Verified at 1280×800 via Playwright: panel renders full-width with header/toolbar/messages/input visible; hit-test at the previously-empty region now returns a message element, not the dock; docking still reflows the document (1280 → 960) and shows the dock only when used.
- Smoke suite 22/22; build clean.
