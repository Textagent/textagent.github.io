# CHANGELOG — AI Variable Controls UI

## 🔗 AI Variable Controls (`@var` / `@input`)

### Summary
Added a unified 🔗 Vars button to AI and Agent card headers that opens
a combined dropdown panel for managing output variables (`@var:`) and
input variables (`@input:`). This enables users to chain AI blocks
together, passing data from one block to the next via named variables.

### Changes

#### `js/ai-docgen.js`
- Added parsing for `@var:` and `@input:` directives in both AI and Agent card rendering
- Stripped `@var:` and `@input:` lines from displayed prompt text
- Added unified 🔗 Vars toggle button to card header toolbar (replaces two separate buttons)
- Added combined `ai-vars-panel` dropdown with two sections:
  - 📤 Output Variable — text input for naming the block's output
  - 📥 Input Variables — checkbox list of available variables from other blocks
- Input variable picker scans declared `@var:` names from other blocks (not just runtime vars)
- Declared variables show as "declared" layer with "(not yet run)" preview
- Added `updateVarsToggleBadge()` helper for real-time badge updates
- Event handlers for var input (blur/Enter sync), clear button, and checkbox changes

#### `js/ai-docgen-generate.js`
- Modified AI generation to inject selected input variables into the prompt context
- Variables resolved from `M._vars` at generation time and prepended to the user prompt

#### `css/ai-docgen.css`
- Added ~230 lines of CSS for the unified 🔗 Vars toggle button and combined panel
- Styled output variable input, clear button, section labels, and dividers
- Styled input variable checkboxes, layer badges, value previews, wildcard option
- Light theme overrides for all new elements
- Cyan accent (#06b6d4) for output section, violet accent (#8b5cf6) for input section

#### `js/doc-vars-panel.js`
- Document Variables Panel now scans `parseDocgenBlocks` for declared `@var:` names
- Added "⏳ Pending Vars" section for variables declared but not yet executed
- `renderVarRow()` updated to show "PENDING" badge for declared variables

### Impact
- Enables visual, no-syntax-required variable chaining between AI blocks
- Doc Variables Panel shows full pipeline visibility (pending + runtime + manual vars)
- No breaking changes — existing `@var:` / `@input:` markdown syntax still works
