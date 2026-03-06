# CHANGELOG — MDview

All changes to MDview, in reverse chronological order.

---

## 2026-03-06

### fix: header/QAB brand toggle alignment + file drop handler
- Unified brand toggle (`chevron + MDview`) at same far-left position in both header and QAB
- Fixed file drop: `handleDrop` called undefined `M.getFileExtension`/`M.SUPPORTED_EXTENSIONS`
- Body-level drop handler now catches files in all modes (header open or QAB)
- Simplified `handleDrop` to delegate to `M.importFile()` which has its own validation
- **Files:** `index.html`, `css/header.css`, `css/view-mode.css`, `js/app-init.js`

### fix: dropzone close button not clickable in compact layout
- Fixed close button z-index and click target in the compact single-line dropzone
- **Files:** `css/header.css`, `styles.css`

### feat: premium UI redesign — ghost buttons, pill view mode, collapsible stats, monochrome AI button
- Ghost-style borderless toolbar buttons with hover lift and subtle shadow
- Pill-shaped segmented control for view mode (Editor, Split, Preview, PPT)
- Compact single-line dropzone, saves ~30px vertical space
- Collapsible stats pill bar with localStorage persistence
- Monochrome AI button (replaces purple gradient)
- Rounded dropdown menus with 10px radius and 24px shadow
- **Files:** `css/header.css`, `css/view-mode.css`, `css/editor.css`, `css/formatting.css`, `css/ai-panel.css`, `styles.css`, `index.html`, `js/app-init.js`

### feat: add Tables template category + update Feature Showcase & README
- Added 5 complex table templates under new "Tables" category
- Updated Feature Showcase and README to reflect recent changes
- **Files:** `js/templates/tables.js`, `js/templates.js`, `index.html`, `README.md`

### fix: improve empty cells visibility in table tools
- Fixed styling for empty cells in the spreadsheet-like table toolbar
- **Files:** `css/table-tools.css`

### feat: add interactive spreadsheet toolbar for markdown tables
- Table editing toolbar with add/delete row/column, alignment, sorting
- Click-to-edit cells in preview mode
- **Files:** `js/table-tools.js`, `css/table-tools.css`, `index.html`

### ci: enforce changelog file with every code commit
- Added pre-commit hook and GitHub Actions workflow to require CHANGELOG-*.md in every commit
- **Files:** `.githooks/pre-commit`, `.github/workflows/changelog-check.yml`

### perf: 12 optimizations for 2-5x faster load and smoother typing
- Lazy-load Mammoth, Turndown, SheetJS libraries
- Deferred non-critical module loading
- Throttled per-keystroke rendering to 150ms
- Optimized Vite code splitting
- **Files:** `js/app-init.js`, `js/file-converters.js`, `js/renderer.js`, `vite.config.js`

### fix: theme persistence + pin exact dependency versions
- Fixed white→dark flash (FOUC) on page reload
- Consistent `markdown-viewer-theme` localStorage key
- Pinned all npm dependencies to exact versions
- **Files:** `js/app-core.js`, `package.json`

### fix: prevent white→dark flash on page reload (FOUC)
- Added inline theme script to set dark mode before CSS loads
- **Files:** `index.html`, `js/app-core.js`

---

## 2026-03-05

### feat: Vite build pipeline for GitHub Pages
- Adopted Vite for frontend asset bundling
- Updated Docker build process and GitHub Actions deployment
- **Files:** `vite.config.js`, `package.json`, `Dockerfile`, `.github/workflows/`

### feat: upgrade Gemini AI to 3.1 Flash Lite + Quiz templates + html-autorun
- Upgraded Gemini model references to 3.1 Flash Lite
- Added Quiz template category with html-autorun support
- Auto-run and code-hiding for HTML blocks
- **Files:** `js/ai-models.js`, `js/renderer.js`, `js/templates/quiz.js`

### refactor: centralize AI model config into js/ai-models.js
- Single source of truth for all AI model configurations
- **Files:** `js/ai-models.js`, `index.html`, `js/app-core.js`

### feat: AI context menu + inline progress bar + passphrase sharing
- Enhanced AI context menu with column layout and writing assistance actions
- Added inline AI status bar with progress UI
- Added passphrase protection for sharing
- **Files:** `js/ai-panel.js`, `css/ai-panel.css`, `js/cloud-share.js`, `index.html`

### feat: secure sharing with passphrase protection
- Share options modal with Quick Share and Secure Share modes
- PBKDF2 key derivation from user passphrase
- Download credentials as .txt file
- **Files:** `js/cloud-share.js`, `index.html`, `css/modals.css`

### refactor: extract markdown templates into individual files
- Split monolithic templates.js into category-based files
- **Files:** `js/templates/*.js`, `js/templates.js`, `index.html`

### feat: executable JavaScript and SQL code blocks
- Run/copy toolbars and output display for JS and SQL
- **Files:** `js/executable-blocks.js`, `css/executable-blocks.css`

### feat: Python (Pyodide) and HTML (iframe) sandbox
- Sandboxed execution for Python and HTML code blocks
- New Python Playground template
- **Files:** `js/executable-blocks.js`, `js/renderer.js`, `js/templates/coding.js`

### feat: executable HTML and Python code blocks
- Sandboxed preview/execution with associated toolbars and styling
- **Files:** `js/executable-blocks.js`, `css/executable-blocks.css`

### docs: update README with voice, math, AI writing, presentation, sharing, security
- Comprehensive README update covering all recent features
- **Files:** `README.md`

### feat: add Unsplash image backgrounds to 5 PPT templates
- Showcase background image feature in presentation templates
- **Files:** `js/templates/ppt.js`

### feat: presentation theme previews + LaTeX evaluation enhancements
- New presentation theme preview images
- LaTeX block evaluation with reserved constant handling
- **Files:** `js/renderer.js`, `css/presentation.css`

### fix: make shared links read-only, prevent overwrites on Edit Copy
- Shared documents protected from edits
- Edit Copy creates local fork instead of overwriting
- **Files:** `js/cloud-share.js`

### feat: add 15 new PPT templates + fix background rendering
- 15 new presentation templates across various themes
- Fixed background image rendering in slides
- **Files:** `js/templates/ppt.js`, `js/renderer.js`

### feat: PPT template category with 3 initial templates
- Added new PPT category to template system
- **Files:** `js/templates/ppt.js`, `js/templates.js`

### feat: LaTeX display math evaluation + enhanced presentation mode
- Display math evaluation with result display
- New layouts, transitions, speaker notes, and overview grid for presentations
- **Files:** `js/renderer.js`, `css/presentation.css`, `js/presentation.js`

### feat: default content loading + feature showcase template
- Application loads Feature Showcase as default content
- Enhanced showcase with executable blocks and voice dictation demos
- **Files:** `js/app-init.js`, `js/templates/documentation.js`

### feat: speech-to-text dictation with voice-to-markdown commands
- Voice dictation with markdown formatting commands
- **Files:** `js/speech-to-text.js`, `css/speech.css`, `index.html`

### Security hardening
- SRI hashes, XSS fixes, ReDoS protection, API key encryption, Firestore rules
- **Files:** `index.html`, `js/app-core.js`, `js/cloud-share.js`, `firestore.rules`

---

## 2026-03-04

### refactor: split script.js into 13 modular files
- Monolithic script.js broken into focused modules
- **Files:** `js/*.js`

### feat: add 6 new templates (Coding + Maths categories)
- Interactive bash and math block templates
- **Files:** `js/templates.js`

### feat: executable math blocks with math.js
- In-preview evaluation and result display for LaTeX math
- **Files:** `js/renderer.js`, `js/math-eval.js`

### feat: Markdown → LLM Memory converter
- Convert markdown documents to LLM-consumable memory format
- **Files:** `js/memory.js`, `index.html`

### feat: executable bash code blocks
- Run and copy buttons using just-bash library
- **Files:** `js/executable-blocks.js`, `index.html`

### feat: integrate Gemini, Groq, OpenRouter AI + file format converters
- Multi-provider AI integration
- File converters for DOCX, XLSX, CSV, HTML, JSON, XML, PDF
- **Files:** `js/ai-panel.js`, `js/file-converters.js`, `index.html`

### feat: non-blocking AI panel, resizable layout, multi-model selector
- Three-column resizable layout
- AI panel no longer blocks editor
- **Files:** `js/ai-panel.js`, `css/ai-panel.css`, `index.html`

### feat: cloud auto-save to Firebase every 60s
- Persistent URL with automatic saving
- **Files:** `js/cloud-share.js`

### feat: AI context menu on editor and preview pane
- AI actions on text selection in both panes
- **Files:** `js/ai-panel.js`

### feat: AI Assistant integration
- Local Qwen 3.5 0.8B model via Transformers.js
- Consent dialog, summarize, polish, chat features
- **Files:** `js/ai-panel.js`, `js/ai-worker.js`, `index.html`

### feat: PlantUML support, word wrap toggle, focus mode
- PlantUML diagram rendering
- Editor word wrap toggle
- Focus mode for distraction-free writing
- **Files:** `js/renderer.js`, `js/app-init.js`, `index.html`

### feat: add Firebase Firestore for short share URLs
- Cloud-based short URL generation for sharing
- **Files:** `js/cloud-share.js`, `index.html`

### feat: add 14 new features
- Formatting toolbar, find & replace, TOC, auto-save, zen mode, slides
- Callouts, footnotes, anchor links, image paste, preview themes
- **Files:** `js/app-init.js`, `index.html`, `styles.css`

### Rebrand: Markdown Viewer → MDview
- Updated branding across all files
- **Files:** `index.html`, `README.md`, `manifest.json`

### docs: comprehensive README rewrite
- MDview branding, feature tables, organized tech stack
- **Files:** `README.md`

---

## 2026-03-03

### Initial commit: Markdown Viewer with encrypted sharing
- Core markdown editor with split view (editor + preview)
- Encrypted cloud sharing via Firebase
- Mermaid diagram support, LaTeX math rendering
- GitHub-style markdown preview
- **Files:** Initial codebase
