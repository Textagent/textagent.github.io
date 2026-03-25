# Form CSS Customization

## What was changed
Added the ability to apply custom CSS styling to `@Form` blocks using a dedicated `@field : css | "css string"` definition.

**Example usage:**
```markdown
{{@Form: Custom Theme Form
  @field: css | --bg-primary: #ffffff; --bg-secondary: #f8fafc; --text-primary: #0f172a; --border-color: #cbd5e1;
  @field: name | text | Your name | required
  @field: email | email | your@email.com | required
}}
```

## Why it was changed
This allows users to customize the appearance (like background color, text color, borders, etc.) of a specific form without having to write global injected CSS or use external stylesheets. By overriding the internal CSS variables (`--bg-primary`, `--bg-secondary`, `--text-primary`, `--border-color`), users can theme the entire form, including inputs and labels, simply and reliably.

## Files modified
- `js/form-docgen.js`: Modified `parseFormBlocks` to extract `@field: css` and applied it as an inline style string to the `.form-dg-card` container. Handles CSS strings with and without pipes `|` properly.

