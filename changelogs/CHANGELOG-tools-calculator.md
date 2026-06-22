# Tools Category — iOS-Style BODMAS Calculator

- Added new **Tools** template category with `bi-tools` icon and `technical` color group
- Added `Calculator` template — iOS-style BODMAS calculator rendered as an `html-autorun` block
- Two-line display: small dim expression line above, large result line below (matches iOS Calculator)
- Both lines are editable: click either line to edit, press Enter or blur to re-evaluate
- Live running total: while typing operands, the result line shows the partial chain evaluated so far
- Full BODMAS support with visible buttons: `(`, `)`, `xʸ` (power), `÷`, `×`, `−`, `+`, `.`, `±`, `%`, `AC`, `⌫`, `=`
- History side panel lists every calculation as `expr = result`; both cells editable, edits re-evaluate live
- `↩` button on each history row sends that row's result back to the main display
- Latest history-row edit propagates back to the calculator's main display automatically
- Paste support: paste a number or full expression (`12*7+3`, `(2+3)^2*4`, `1,234.5`) into the result line; auto-evaluated
- Unicode operator normalization: `×`, `÷`, `−` and comma-separated numbers normalised before evaluation
- Strict allowlist evaluator (`safeEval`): only `0-9 . + - * / ( ) ^` accepted; `^` translated to JS `**` for right-associative precedence
- No `eval()` / identifiers / property access — attempts like `alert(1)` are rejected as `Error`
- Backspace is operator-aware: cancels a pending operator if the last press was an operator, otherwise removes one character
- Keyboard support: digits, `.`, `+ - * / ^ ( )`, `Backspace`, `Enter`/`=`, `Escape`
- Service-worker round-trip safe: HTML entity strings in the embedded script are built via `String.fromCharCode(38)` so they survive `<pre><code>.textContent` extraction by the renderer
- Added Playwright assertion that the Tools category pill exists and the Calculator card appears under it

---

## Summary
Added a new **Tools** template category with a working iOS-style calculator as its first template. The calculator is a single `html-autorun` block — markdown ships the source, the existing renderer auto-executes it in a sandboxed iframe. Full BODMAS precedence (brackets, exponent, division/multiplication, addition/subtraction) via a strict regex-allowlist `safeEval`. Editable expression line, editable history rows, and a live-evaluating running total on the result line, all mirroring iOS Calculator behaviour.

---

## 1. Tools Template Module
**Files:** `js/templates/tools.js` (new, 475 lines)
**What:** A new template file registering `window.__MDV_TEMPLATES_TOOLS` with one template (`Calculator`). The entire calculator — CSS for the iOS rounded-button look, two-line display markup, button grid, BODMAS evaluator, chain state machine, history panel, paste/keyboard/edit handlers — is embedded as a single `html-autorun` code fence inside a template literal. The existing renderer (`js/renderer.js`) handles auto-execution; no new infrastructure required.
**Impact:** Users open the Templates modal → click **Tools** → click **Calculator** and the editor loads a doc that renders a live calculator in the preview pane.

## 2. Template System Registration
**Files:** `js/templates.js`, `js/modal-templates.js`, `src/main.js`
**What:**
- `templates.js` — appended `window.__MDV_TEMPLATES_TOOLS` to the `MARKDOWN_TEMPLATES` concatenation; mapped `tools` category to `technical` color group and `bi-tools` Bootstrap icon (in both `getCategoryIconClass()` and `getCategoryIcon()`).
- `modal-templates.js` — added the `<button data-category="tools">Tools</button>` pill to the category bar.
- `src/main.js` — added `import('../js/templates/tools.js')` to the Phase 3c parallel template-loading `Promise.all`.
**Impact:** "Tools" appears in the category bar of the Templates modal with a wrench-and-screwdriver icon, and the Calculator card shows up there (and under "All").

## 3. BODMAS Evaluator
**Files:** `js/templates/tools.js`
**What:** Inside the iframe sandbox, `safeEval(expr)` enforces a strict allowlist `^[-+*/().\d^]+$` and rejects runs of more than two of `+`, `/`, or `^`. The `^` operator is translated to JavaScript's `**` before evaluation, preserving right-associative exponent precedence (`2^3^2 = 512`, not `64`). The evaluator runs the sanitised string inside an inner `Function('"use strict";return (' + src + ')')()` and discards any non-finite result. Divide-by-zero and overflow produce `Error` on the display, never `Infinity` or `NaN`.
**Impact:** Operator precedence is correct out of the box (`2 + 3 * 4 = 14`, `3 * 2 ^ 3 = 24`, `(2+3)^2 * 4 = 100`, `((1+2)*(3+4))^2 = 441`) without writing a precedence parser.

## 4. iOS-Style Two-Line Display
**Files:** `js/templates/tools.js`
**What:** The display is a flex column containing a 18px dim `expr-line` and a 56px bright `result-line`. `show()` writes both based on state:
- typing an operand → top: chain so far, bottom: current operand
- pending after an operator → top: chain with trailing op, bottom: live running total (partial `safeEval` of the chain so far)
- after `=` → top: `"<expr> ="` from the just-pushed history entry, bottom: result
Both `<div>`s are `contenteditable`, with paste/Enter/blur handlers that call `applyPasted()` or `commitExprEdit()` respectively. The expression line strips a trailing `= ` before re-evaluating, so users can edit `(2+3)^2*4 =` directly into `100/(4+1)` and get `20`.
**Impact:** Looks and behaves like the iOS Calculator app, but every value remains editable — the expression line, the result line, and every row in the history side panel.

## 5. History Side Panel with Live Re-evaluation
**Files:** `js/templates/tools.js`
**What:** Each completed calculation (whether via `=`, paste, or expression-line edit) appends an entry to a `history` array. `renderHistory()` paints rows in newest-first order; each row has a `contenteditable` `.expr` and `.res` cell plus a `↩` "send to display" button. A capturing `blur` listener on the history list re-evaluates the row when its `.expr` changes (or trusts the manually-edited `.res`), then — if the edited row is the latest — pushes the new result back to the main display. The `clear-h` button empties the history. Adjacent duplicates are merged to avoid noise.
**Impact:** Full edit history with two-way data flow: change a step you took half an hour ago and the current result updates accordingly.

## 6. Renderer Round-Trip Hardening
**Files:** `js/templates/tools.js`
**What:** The renderer reads the `html-autorun` source via `codeEl.textContent` from the `<pre><code>` it built during markdown parsing. Any HTML entities written as literals in the source (`&amp;`, `&lt;`, `&quot;`, `&#39;`) get decoded back to `&`, `<`, `"`, `'` during extraction, corrupting the embedded `escapeHtml` function. The fix builds those entity strings dynamically at runtime: `var amp = String.fromCharCode(38) + 'amp;'` etc. These survive the `textContent` round-trip intact.
**Impact:** Prevents a silent syntax-error class that would break any template embedding JS with literal HTML-entity strings.

## 7. Tests
**Files:** `tests/feature/template-loading.spec.js`
**What:** Added a new Playwright case `tools category pill exists and Calculator template loads` that opens the template modal via `M.openTemplateModal()`, asserts the `data-category="tools"` pill exists, clicks it, and verifies at least one card matching `/Calculator/i` appears in the filtered grid.
**Impact:** Catches future regressions of the Tools category registration (e.g. dropped from `concat`, missing pill button, missing template import in `main.js`).

---

## Files Changed (5 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/templates/tools.js` | +475 | New: iOS-style BODMAS calculator template (`html-autorun` block) |
| `tests/feature/template-loading.spec.js` | +26 | Playwright: Tools pill + Calculator card |
| `js/templates.js` | +4 −1 | `MDV_TEMPLATES_TOOLS` concat + icon/color mapping for `tools` |
| `js/modal-templates.js` | +1 | `<button data-category="tools">Tools</button>` pill |
| `src/main.js` | +1 | `import('../js/templates/tools.js')` in Phase 3c |
