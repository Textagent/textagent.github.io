# CHANGELOG — LaTeX Coding Block

## feat: LaTeX coding block in toolbar

Added `📐 LaTeX` button to the Coding toolbar group for quick insertion of LaTeX display math blocks (`$$...$$`).

### Changes

- **`js/coding-blocks.js`** — Added `coding-latex` template that inserts an evaluable LaTeX expression (`$$\frac{\sqrt{2025} + \sqrt{3025}}{\sqrt{25}}$$`, evaluates to 20 via Nerdamer)
- **`index.html`** — Added `📐 LaTeX` button in the Coding group overflow dropdown (after SQL)
- **`tests/feature/toolbar-tags.spec.js`** — Added Playwright test verifying the LaTeX button inserts `$$..$$` display math with `\frac`

### How it works

The LaTeX block uses `$$...$$` display math syntax which is already fully supported:
- **MathJax** renders the expression in the preview pane
- **Nerdamer** evaluates it when the user clicks the "Evaluate" button (from `exec-math.js`)
- No new dependencies or runtime changes required
