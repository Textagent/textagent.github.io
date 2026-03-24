# Fix: View-Mode Button Tooltips

## Changes
- Added missing `title` attributes to header view-mode buttons (Split, Preview, PPT, Page)
- Replaced span-based CSS tooltip with `::after` pseudo-element tooltip using `content: attr(title)`
- Added explicit `color: var(--text-color)` to prevent tooltip text from being invisible due to color inheritance from active button state

## Root Cause
The `<span>` elements inside view-mode buttons were being stripped from the DOM at runtime, causing the old `:hover>span` CSS tooltip to render as an empty white box.

## Files Modified
- `index.html` — added `title` attributes to 4 view-mode buttons
- `css/view-mode.css` — replaced span-based tooltip with `::after` pseudo-element approach
