# Form CSS Customization

## What was changed
Added the ability to apply custom CSS styling to `@Form` blocks using a dedicated `@field : css | "css string"` definition.

## Why it was changed
This allows users to customize the appearance (like background color, text color, borders, etc.) of a specific form without having to write global injected CSS or use external stylesheets, improving the flexibility of the declarative form generation.

## Files modified
- `js/form-docgen.js`: Modified `parseFormBlocks` to extract `@field: css` and applied it as an inline style string to the `.form-dg-card` container. Handles CSS strings with and without pipes `|` properly.
