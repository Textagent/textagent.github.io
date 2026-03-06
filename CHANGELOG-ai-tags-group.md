# CHANGELOG — AI Tags Group

## Summary
Grouped the AI, Think, and Fill buttons in the formatting toolbar into a visual "AI Tags" group to eliminate confusion with the AI Assistant button in the top header.

## Changes

### Modified: `index.html`
- Wrapped the `AI`, `Think`, and `Fill` buttons inside a `<div class="fmt-ai-group">` container
- Added a `<span class="fmt-ai-group-label">AI Tags</span>` floating label

### Modified: `css/ai-docgen.css`
- Added `.fmt-ai-group` styles: inline-flex container with teal border, rounded corners, subtle background
- Added `.fmt-ai-group-label` styles: small uppercase label positioned above the group border
- Added light theme overrides for both classes
