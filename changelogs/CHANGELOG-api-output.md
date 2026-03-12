# API Tag — Direct Output Rendering + Working URLs

## Changes

### `js/api-docgen.js`
- **Fixed default URLs**: Toolbar GET/POST buttons now insert `httpbin.org` URLs instead of broken `api.example.com`
- **Unique variable names**: Each toolbar insertion generates a unique variable name (e.g., `getResult1`, `postResult2`) via an auto-incrementing counter
- **Direct inline output**: ▶ button renders API response directly below the card in a scrollable `.code-output` div (like Python/Bash), replacing the AI-style accept/reject/regenerate panel
- **Copy button**: 📋 Copy button copies raw JSON response to clipboard with visual feedback
- **Inline error rendering**: Errors display in the output area, not just as toasts
- **Run All adapter**: Removed editor text replacement — API tags stay in the editor and output renders in DOM only

### `js/exec-controller.js`
- Added API-specific rendering in `renderBlockOutput` with JSON syntax highlighting and 📋 Copy button

### `js/templates/documentation.js`
- Updated Feature Showcase API examples to use `httpbin.org` with distinct variable names
- Updated instruction text: "response appears inline" instead of "review the response"

### `css/ai-docgen.css`
- Added `.ai-api-card .code-output` styles with distinct dark background (`#161b22`) for readability
- Added explicit hljs override colors (green keys, blue strings, gold numbers, red literals) for dark mode
- Added proper light theme overrides

## Files Modified
- `js/api-docgen.js`
- `js/exec-controller.js`
- `js/templates/documentation.js`
- `css/ai-docgen.css`
