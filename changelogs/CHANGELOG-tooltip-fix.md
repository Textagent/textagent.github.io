# Fix: Remove duplicate hover tooltips on view mode buttons

## Changes
- Removed `title` attributes from Split, Preview, PPT, and Page view-mode buttons in the header
- These buttons already have a custom CSS tooltip (`:hover>span`) defined in `css/view-mode.css`, so the native browser `title` tooltip was causing a duplicate white tooltip to appear on hover
- The Editor button retains its `title` since it always shows its label text inline

## Files Modified
- `index.html` — removed `title` attrs from 4 view-mode buttons
