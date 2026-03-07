# MDview

<div align="center">
    <img src="assets/icon.jpg" alt="MDview Logo" width="150px"/>
    <h3>AI-Powered Markdown Editor & Viewer</h3>
    <p>Write, preview, present, and share — all in your browser, 100% client-side</p>
    <a href="https://markdownview.github.io/">Live Demo</a> • 
    <a href="#-features-at-a-glance">Features</a> • 
    <a href="#-screenshots">Screenshots</a> • 
    <a href="#-usage">Usage</a> • 
    <a href="#-release-notes">Release Notes</a> • 
    <a href="#-license">License</a>
</div>

## 🚀 Overview

**MDview** is a professional, full-featured Markdown editor and preview application that runs entirely in your browser. It provides a GitHub-style rendering experience with a split-screen interface, AI-powered writing assistance, voice dictation, multi-format file import, encrypted sharing, slide presentations, executable code & math blocks, and powerful export options — all without any server-side processing.

**No sign-up. No server. No data leaves your device.**

## ✨ Features at a Glance

| Category | Features |
|:---------|:---------|
| **Editor** | Live preview, split/editor/preview modes, sync scrolling, formatting toolbar, find & replace (regex), word wrap toggle, draggable resize divider |
| **Writing Modes** | Zen mode (distraction-free fullscreen), Focus mode (dimmed paragraphs), Dark mode, multiple preview themes (GitHub, GitLab, Notion, Dracula, Solarized, Evergreen) |
| **Rendering** | GitHub-style Markdown, syntax highlighting (180+ languages), LaTeX math (MathJax), Mermaid diagrams (zoom/pan/export), PlantUML diagrams, callout blocks, footnotes, emoji, anchor links |
| **🤖 AI Assistant** | Local Qwen 3.5 (WebGPU/WASM), Gemini 3.1 Flash Lite, Groq Llama 3.3 70B, OpenRouter — summarize, expand, rephrase, grammar-fix, explain, simplify, auto-complete; AI writing tags (Polish, Formalize, Elaborate, Shorten, Image); enhanced context menu; per-card model selection; concurrent block generation; inline review with accept/reject/regenerate; AI-powered image generation |
| **🎤 Voice Dictation** | Speech-to-text with Markdown-aware commands — hash headings, bold, italic, lists, code blocks, links, and more |
| **Import** | MD, DOCX, XLSX/XLS, CSV, HTML, JSON, XML, PDF — drag & drop or click to import |
| **Export** | Markdown, HTML, PDF (smart page-breaks), LLM Memory (4 formats + shareable link) |
| **Sharing** | AES-256-GCM encrypted sharing via Firebase; read-only shared links, optional passphrase protection — decryption key stays in URL fragment (never sent to server) |
| **Presentation** | Slide mode using `---` separators, keyboard navigation, multiple layouts & transitions, speaker notes, overview grid, 20+ PPT templates with image backgrounds |
| **Desktop** | Native app via Neutralino.js with system tray and offline support |
| **Code Execution** | 6 languages in-browser: Bash ([just-bash](https://justbash.dev/)), Math (Nerdamer), Python ([Pyodide](https://pyodide.org/)), HTML (sandboxed iframe, `html-autorun` for widgets/quizzes), JavaScript (sandboxed iframe), SQL ([sql.js](https://sql.js.org/) SQLite) |
| **Security** | Content Security Policy (CSP), SRI integrity hashes, XSS sanitization (DOMPurify), ReDoS protection, Firestore write-token ownership, API keys via HTTP headers, postMessage origin validation, 8-char passphrase minimum, sandboxed code execution |
| **AI Document Tags** | `{{AI:}}` text generation, `{{Think:}}` deep reasoning, `{{Image:}}` image generation (Gemini Imagen) — per-card model selector, concurrent independent block operations |
| **❓ Help Mode** | Interactive learning mode — click ❓ Help to highlight all buttons, click any button for description + keyboard shortcut + animated demo video; 50% screen demo panel with fullscreen expand; 16 dedicated demo videos mapped to every toolbar button |
| **Extras** | Auto-save (localStorage + cloud), table of contents, image paste, 81+ templates (11 categories: AI, Coding, Maths, PPT, Quiz, Tables, Documentation, Project, Technical, Creative, Financial), template variable substitution (`$(varName)` with auto-detect), table spreadsheet tools (sort, filter, stats, chart, add row/col, inline cell edit, CSV/MD export), content statistics, modular codebase (13+ JS modules), fully responsive mobile UI with scrollable Quick Action Bar and formatting toolbar, multi-file workspace sidebar |

## 🤖 AI Assistant

MDview includes a built-in AI assistant panel with **four model options**:

| Model | Provider | Type | Speed |
|:------|:---------|:-----|:------|
| **Qwen 3.5 Small** | Local (WebGPU/WASM) | 🔒 Private — no data leaves browser | ⚡ Fast |
| **Gemini 3.1 Flash Lite** | Google (free tier) | ☁️ Cloud — 1M tokens/min | 🚀 Very Fast |
| **Llama 3.3 70B** | Groq (free tier) | ☁️ Cloud — ultra-low latency | ⚡ Ultra Fast |
| **Auto · Best Free** | OpenRouter (free tier) | ☁️ Cloud — multi-model routing | 🧠 Powerful |

**AI Actions:** Summarize · Expand · Rephrase · Fix Grammar · Explain · Simplify · Auto-complete · Generate Markdown · Polish · Formalize · Elaborate · Shorten

> [!TIP]
> Click the ✨ **AI** button in the toolbar to open the assistant. Select text and right-click for quick AI actions via the context menu.

## 📂 File Import & Conversion

Import files directly — they're auto-converted to Markdown client-side:

| Format | Library | Notes |
|:-------|:--------|:------|
| **DOCX** | Mammoth.js + Turndown.js | Preserves formatting, tables, images |
| **XLSX / XLS** | SheetJS | Multi-sheet support with markdown tables |
| **CSV** | Native parser | Auto-detection of delimiters |
| **HTML** | Turndown.js | Extracts body content from full pages |
| **JSON** | Native | Pretty-printed code block |
| **XML** | Native | Formatted code block |
| **PDF** | pdf.js | Page-by-page text extraction |

## 📤 Export Options

| Format | Details |
|:-------|:--------|
| **Markdown (.md)** | Raw markdown with timestamped filename |
| **HTML** | Self-contained HTML with all styling |
| **PDF** | Smart page-break detection, cascading adjustments, oversized graphic scaling |
| **LLM Memory** | 4 formats: Standard, System Prompt, OpenAI Instructions, Raw — with token count, metadata, copy/download, and shareable encrypted link |

## 📸 Screenshots

### Split-View Editor — Live Preview
![Split-View Editor with live preview, formatting toolbar, and feature overview](assets/split-view-editor.png)

### AI Writing Assistant — Local & Cloud Models
![AI Assistant panel with model selector, action chips, and three-column layout](assets/ai-assistant.png)

### Templates Gallery — 81+ Templates, 11 Categories
![Templates modal with category tabs, search, and template cards](assets/templates-gallery.png)

### LaTeX Math & Mermaid Diagrams
![Math expressions and interactive Mermaid diagrams with flowchart, sequence, and pie chart](assets/math-mermaid.png)

### Code Execution & Table Spreadsheet Tools
![In-browser SQL execution, interactive table tools with sort, filter, stats, and charts](assets/code-execution-tables.png)

### Presentation Mode — Markdown to Slides
![Slide presentation mode with dark theme and navigation controls](assets/presentation-mode.png)

## 🎬 Feature Demos

> Click any feature below to watch a live demo.

<details open>
<summary><strong>🔒 Privacy-First — No Sign-Up, 100% Client-Side</strong></summary>

**Your data never leaves your browser.** MDview runs entirely client-side with no server, no account, and no tracking. Type sensitive content with confidence — even your saved data stays in localStorage on your device.

<img src="public/assets/demos/01_privacy_hero.webp" alt="Privacy-First Demo — no sign-up, live editing, dark mode toggle" width="100%">

</details>

<details open>
<summary><strong>🤖 AI Writing Assistant — Local & Cloud Models</strong></summary>

**Built-in AI with 4 model options** including a fully local Qwen model that never sends data outside your browser. Open the AI panel, choose a model (Gemini, Groq, OpenRouter, or local Qwen), and use quick actions like Summarize, Expand, Rephrase, Fix Grammar, Explain, and Simplify.

<img src="public/assets/demos/02_ai_assistant.webp" alt="AI Writing Assistant — model selection, action chips, streaming response" width="100%">

</details>

<details open>
<summary><strong>📄 Templates Gallery — 81+ Templates, 11 Categories</strong></summary>

**Start any document in seconds.** Browse 81+ professionally designed templates across 11 categories: AI, Documentation, Project, Technical, Creative, Coding, Maths, PPT, Quiz, Tables, and Financial. AI-powered templates include `{{AI:}}` tags for one-click document generation.

<img src="public/assets/demos/03_templates_gallery.webp" alt="Templates Gallery — browsing categories and loading AI Business Proposal template" width="100%">

</details>

<details open>
<summary><strong>💻 Code Execution — Run Python, JS & SQL In-Browser</strong></summary>

**Turn Markdown into an interactive notebook.** Execute code in 6 languages directly in the preview pane — Python (Pyodide), JavaScript, SQL (SQLite), Bash (just-bash), HTML, and Math (Nerdamer). All sandboxed, all client-side.

<img src="public/assets/demos/04_code_execution.webp" alt="Code Execution — Python, JavaScript, and SQL running in-browser with output" width="100%">

</details>

<details open>
<summary><strong>🎬 Presentation Mode — Markdown to Slides</strong></summary>

**Present from your Markdown.** Add `---` separators to create slides, then click Present. Navigate with arrow keys, view speaker notes, switch layouts, and use the overview grid. Choose from 20+ PPT templates with image backgrounds.

<img src="public/assets/demos/05_presentation_mode.webp" alt="Presentation Mode — markdown converted to navigable slides" width="100%">

</details>

<details open>
<summary><strong>📊 Table Spreadsheet Tools — Sort, Stats & Charts</strong></summary>

**Interactive tables with spreadsheet-level power.** Hover over any rendered table to reveal a toolbar with Sort, Filter, Search, Stats (Σ), Chart, Add Row/Col, CSV/MD export, and inline cell editing. Generate bar charts directly from your data.

<img src="public/assets/demos/06_table_tools.webp" alt="Table Tools — sort, column statistics, and bar chart generation" width="100%">

</details>

<details open>
<summary><strong>🎨 Writing Modes & Themes — Zen, Dark & 6 Themes</strong></summary>

**Your perfect writing environment.** Switch between 6 preview themes (GitHub, GitLab, Notion, Dracula, Solarized, Evergreen), toggle dark mode, and enter Zen mode for distraction-free fullscreen writing. Focus mode dims surrounding paragraphs.

<img src="public/assets/demos/07_writing_modes.webp" alt="Writing Modes — switching themes (Dracula, Evergreen, GitHub), dark mode, and Zen mode" width="100%">

</details>

<details open>
<summary><strong>📂 Import & Export — 8 Formats In, PDF/HTML Out</strong></summary>

**Import anything, export everything.** Drag and drop files in 8 formats (MD, DOCX, XLSX, CSV, HTML, JSON, XML, PDF) — all converted to Markdown client-side. Export as Markdown, HTML, or smart PDF with intelligent page breaks.

<img src="public/assets/demos/08_import_export.webp" alt="Import & Export — dropzone with 8 supported formats and export options" width="100%">

</details>

<details open>
<summary><strong>🔐 Encrypted Sharing — Zero-Knowledge Security</strong></summary>

**Share securely with AES-256-GCM encryption.** Choose Quick Share (key in URL fragment, never sent to server) or Secure Share with a custom passphrase. Recipients need the passphrase to decrypt — the server never sees your content or keys.

<img src="public/assets/demos/09_encrypted_sharing.webp" alt="Encrypted Sharing — passphrase protection and encrypted link generation" width="100%">

</details>

## 📝 Usage

| Action | How |
|:-------|:----|
| **Write** | Type or paste Markdown in the left editor panel |
| **Preview** | See live rendered output in the right panel |
| **Import** | Click 📤 Import, drag & drop, or paste — supports MD, DOCX, XLSX, CSV, HTML, JSON, XML, PDF |
| **Export** | Use the ⬇️ Export dropdown → Markdown, HTML, PDF, or LLM Memory |
| **AI Assistant** | Click ✨ AI → choose a model → ask questions or use quick actions |
| **Dark Mode** | Click the 🌙 moon icon |
| **Sync Scroll** | Click the 🔗 link icon to toggle two-way sync |
| **Share** | Click 📤 Share → generates an encrypted Firebase link |
| **Present** | Click 🎬 Presentation → navigate slides with arrow keys |
| **Zen Mode** | Press `Ctrl+Shift+Z` or click the fullscreen icon |
| **Find & Replace** | Press `Ctrl+F` → supports regex |
| **Templates** | Click the 📄 Templates button for starter documents |

### Mermaid Diagram Toolbar

Hover over any Mermaid diagram to reveal a toolbar:

| Button | Action |
|:-------|:-------|
| ⛶ (arrows) | Open diagram in zoom/pan modal |
| PNG | Download as PNG |
| 📋 (clipboard) | Copy image to clipboard |
| SVG | Download as SVG |

### Supported Markdown Syntax

Headings · **Bold** · *Italic* · ~~Strikethrough~~ · Links · Images · Ordered/Unordered Lists · Tables · Code Blocks (180+ languages) · Blockquotes · Horizontal Rules · Task Lists · LaTeX Equations (inline & block) · Mermaid Diagrams · PlantUML Diagrams · Callout Blocks (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`) · Footnotes (`[^1]`) · Emoji Shortcodes · Executable Bash · Python · JavaScript · SQL · HTML Blocks

## 🔧 Technologies

### Core
| Technology | Purpose |
|:-----------|:--------|
| HTML5 / CSS3 / JavaScript | Core stack |
| [Bootstrap](https://getbootstrap.com/) | Responsive UI framework |
| [Marked.js](https://marked.js.org/) | Markdown parser |
| [highlight.js](https://highlightjs.org/) | Syntax highlighting (180+ languages) |
| [DOMPurify](https://github.com/cure53/DOMPurify) | HTML sanitization |

### Rendering
| Technology | Purpose |
|:-----------|:--------|
| [MathJax](https://www.mathjax.org/) | LaTeX math rendering |
| [Mermaid](https://mermaid-js.github.io/mermaid/) | Diagrams & flowcharts |
| [PlantUML Server](https://www.plantuml.com/) | PlantUML diagram rendering |
| [JoyPixels](https://www.joypixels.com/) | Emoji shortcode support |

### AI
| Technology | Purpose |
|:-----------|:--------|
| [Transformers.js](https://huggingface.co/docs/transformers.js) | Local AI inference (Qwen 3.5 Small) |
| [Groq API](https://groq.com/) | Cloud AI (Llama 3.3 70B) |
| [Google Gemini API](https://ai.google.dev/) | Cloud AI (Gemini 3.1 Flash Lite) |
| [OpenRouter API](https://openrouter.ai/) | Multi-model AI routing |

### Export & Import
| Technology | Purpose |
|:-----------|:--------|
| [html2canvas](https://github.com/niklasvh/html2canvas) + [jsPDF](https://www.npmjs.com/package/jspdf) | PDF generation |
| [FileSaver.js](https://github.com/eligrey/FileSaver.js) | File download handling |
| [Mammoth.js](https://github.com/mwilliamson/mammoth.js) + [Turndown.js](https://github.com/mixmark-io/turndown) | DOCX → Markdown |
| [SheetJS](https://sheetjs.com/) | XLSX/XLS parsing |
| [pdf.js](https://mozilla.github.io/pdf.js/) | PDF text extraction |

### Infrastructure
| Technology | Purpose |
|:-----------|:--------|
| [Firebase Firestore](https://firebase.google.com/docs/firestore) | Cloud sharing & auto-save |
| [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) | AES-256-GCM encryption |
| [pako](https://github.com/nicmart/pako) | Gzip compression |
| [Neutralino.js](https://neutralino.js.org/) | Desktop app framework |
| [just-bash](https://justbash.dev/) | In-browser bash execution |
| [Pyodide](https://pyodide.org/) | In-browser Python (CPython via WASM) |
| [sql.js](https://sql.js.org/) | In-browser SQLite (WASM) |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📈 Development Journey

MDview has undergone significant evolution since its inception. What started as a simple markdown parser has grown into a full-featured, AI-powered application with 40+ features. By comparing the [current version](https://markdownview.github.io/) with the [original version](https://a1b91221.markdownviewer.pages.dev/), you can see the remarkable progress in UI design, performance optimization, and feature implementation.

## 📋 Release Notes

| Date | Feature / Update |
|------|-----------------|
| **2026-03-07** | 📂 **Workspace sidebar** — multi-file support with sidebar file tree (`Ctrl+B` toggle); create, rename, duplicate, and delete files; per-file localStorage persistence; right-click context menu; active file highlighting; "New" button creates files in workspace instead of new tabs |
| **2026-03-07** | 📱 **Mobile toolbar overflow fix** — Quick Action Bar and formatting toolbar now horizontally scrollable on mobile/tablet instead of overflowing; `overflow-x: hidden` on page; header collapse disabled at sub-desktop widths; GitHub link and Help pill hidden on phones for compact layout |
| **2026-03-07** | 🛡️ **Security hardening v2** — Content Security Policy (CSP) with full CDN allowlist; Firestore write-token ownership to prevent anonymous document overwrites; API keys moved from URL query strings to `x-goog-api-key` headers; `postMessage` origin validation for sandboxed iframes; passphrase minimum increased to 8 characters; Firestore rules fixed for secure-share documents |
| **2026-03-07** | 🐛 **QAB Export fix** — added missing LLM Memory option to the Quick Action Bar Export dropdown, matching the main header Export menu |
| **2026-03-07** | 🎥 **Demo mapping audit** — fixed 10 incorrect Help Mode demo mappings; recorded 6 new dedicated demo videos (AI Model Selector, Sync Scrolling, Table of Contents, Voice Dictation, AI Doc Tags, Template Variables); total demos increased from 10 to 16 |
| **2026-03-07** | ❓ **Interactive Help Mode** — teal ❓ Help pill in header activates learning mode; all buttons get teal ring highlights; click any button for popover with feature name, description, keyboard shortcut, and ▶ Watch Demo button; demo videos play in a 50% screen dark panel with fullscreen expand; all 9 product demos mapped to ~35 toolbar buttons; Esc key navigation; AI Document Tags inline-code rendering fix |
| **2026-03-07** | ▶ **Feature demo badges** — clickable ▶ Demo badges on Feature Showcase headings open fullscreen animated video modal; 9 features mapped to demo videos; right-click + D shortcut; teal gradient badge with dark mode support |
| **2026-03-07** | 🎬 **Product demo videos** — 9 animated WebP demos added to README (Privacy Hero, AI Assistant, Templates Gallery, Code Execution, Presentation Mode, Table Tools, Writing Modes, Import/Export, Encrypted Sharing) showcasing all key features with feature descriptions |
| **2026-03-07** | 🔀 **Template variables** — `$(varName)` substitution engine; in-editor variable table with ⚡ Vars button; auto-detect mode (type variables anywhere → click Vars → table generated → fill → apply); 7 built-in globals (`$(date)`, `$(time)`, etc.); 12 templates updated with variable support for instant reusability |
| **2026-03-06** | 🤖 **AI templates** — new AI category with 13 AI-powered templates (Business Proposal, Research Paper, PRD, Marketing Copy, Lesson Plan, RFC, Cover Letter, SWOT, Content Calendar, Stock Research, Financial Analysis, Investment Thesis, Portfolio Review); one-click `{{AI:}}` / `{{Think:}}` document generation |
| **2026-03-06** | 🐛 **Initial render fix** — fixed preview pane not rendering on first page load by adding forced re-render after app initialization |
| **2026-03-06** | 🖼️ **IMAGE tag support** — new `{{Image: ...}}` AI tag generates images from text prompts via Gemini Imagen; dedicated image model selector per card; AI worker pipelines for image generation |
| **2026-03-06** | 🏷️ **AI Tags button group** — AI, Think, and Fill toolbar buttons grouped into a visually distinct "AI Tags" cluster with shared styling and separator |
| **2026-03-06** | 🎯 **Per-card model selection** — each generated AI card shows a model dropdown to switch models before regenerating; image-specific models filtered into Image tag cards |
| **2026-03-06** | 🌿 **Evergreen theme** — new green-toned preview theme with light and dark variants, custom syntax highlighting, code block, and table styling |
| **2026-03-06** | 🧩 **Independent AI block operations** — each `{{AI:}}` / `{{Think:}}` block generates, reviews, accepts, rejects, and regenerates independently; per-block state tracking with concurrent generation; text-based tag replacement (no index shifting bugs) |
| **2026-03-06** | ⏳ **Generation loading states** — placeholder cards pulse with teal glow and show "Generating..." during AI generation; action buttons dimmed until complete |
| **2026-03-06** | 🧠 **Think mode cleanup** — improved prompts suppress raw reasoning chains; `cleanGeneratedOutput()` strips `<thinking>` tags, reasoning loops, and meta-commentary from output |
| **2026-03-06** | ⬇️ **Inline model download** — local models show "Download (~500 MB)" dialog directly in generation flow instead of redirecting to AI panel |
| **2026-03-06** | 🔀 **Split view default** — shared documents now open in split view (editor + preview) instead of preview-only mode |
| **2026-03-06** | 📊 **Table spreadsheet tools** — interactive toolbar on every rendered table: Sort, Filter, Search, Stats (Σ), Chart (canvas bar chart), Add Row/Col, Copy CSV/MD, Download CSV, inline cell editing (double-click to edit) |
| **2026-03-06** | 📋 **Table templates** — 5 new complex table templates (Sales Dashboard, Project Tracker, Financial Report, Employee Directory, Competitive Analysis) in new Tables category |
| **2026-03-05** | ⚡ **Performance optimizations** — 2-5x faster load: lazy-loading libraries, optimized rendering, improved build chunking, debounced keystroke processing |
| **2026-03-05** | 🔧 **Vite build pipeline** — migrated to Vite for development and production builds with GitHub Pages deployment |
| **2026-03-05** | 🛡️ **Changelog enforcement** — pre-commit hook requires a CHANGELOG-*.md file with every code commit |
| **2026-03-05** | 🎨 **Toolbar overflow menu** — kebab menu for overflowed toolbar items at narrow widths, theme controls moved into overflow |
| **2026-03-05** | 🌙 **FOUC fix** — prevent white→dark flash on page reload with inline theme detection script |
| **2026-03-05** | 🧩 **Quiz templates + html-autorun** — new Quiz category with interactive HTML quizzes that auto-run on render; `html-autorun` code fence hides source and shows output directly |
| **2026-03-05** | ⚙️ **Centralized AI model config** — all model definitions moved to `js/ai-models.js`; dropdown built dynamically; easy to add new providers |
| **2026-03-05** | 🔄 **Gemini 3.1 Flash Lite** — upgraded from Gemini 2.0 Flash to Gemini 3.1 Flash Lite for improved performance |
| **2026-03-05** | 🔐 **Passphrase-protected sharing** — optional passphrase on shared links with unlock modal; share options dialog for link + passphrase vs. open link |
| **2026-03-05** | 🧠 **Enhanced AI context menu** — column-based layout with writing assistance actions (Polish, Formalize, Elaborate, Shorten) alongside existing quick actions |
| **2026-03-05** | 📊 **Inline AI progress bar** — model download and connection status shown inline in the AI panel header |
| **2026-03-05** | 📦 **Template modularization** — split `templates.js` (3080→206 lines) into 7 category-based files under `js/templates/` for maintainability |
| **2026-03-05** | ⚡ **JavaScript sandbox** — execute JS in sandboxed iframe with `console.log/warn/error` capture and inline output display |
| **2026-03-05** | 🗄️ **SQL sandbox** — run SQL queries on in-memory SQLite database (sql.js WASM) with formatted table output and persistent tables across blocks |
| **2026-03-05** | 🐍 **Python sandbox** — run Python code in browser via Pyodide (CPython WASM), with stdout/stderr capture and matplotlib support |
| **2026-03-05** | 🌐 **HTML sandbox** — live HTML/CSS/JS preview in secure sandboxed iframe with auto-resize |
| **2026-03-05** | 💻 **6 Coding templates** — Python Playground, HTML Playground, Bash Scripting, JavaScript Sandbox, HTML+JS Interactive, SQL Playground |
| **2026-03-05** | 🔒 **Read-only shared links** — shared documents are now protected; Edit Copy creates a local fork instead of overwriting the original |
| **2026-03-05** | 🖼️ **Image backgrounds for PPT templates** — 5 presentation templates with Unsplash image backgrounds |
| **2026-03-05** | 🧮 **LaTeX evaluation improvements** — reserved constant handling (E, π), unsupported construct detection (limits, integrals, partials) |
| **2026-03-05** | 🎬 **Enhanced presentation mode** — multiple layouts (title, section, two-column, image), transitions, speaker notes, overview grid |
| **2026-03-05** | 📊 **20+ PPT templates** — new PPT category with professional slide decks and background rendering |
| **2026-03-05** | 🎤 **Voice dictation** — speech-to-text with Markdown-aware commands (hash headings, bold, italic, lists, code, links) |
| **2026-03-05** | 🛡️ **Security hardening** — SRI integrity hashes, XSS fixes, ReDoS protection, encrypted API key storage, Firestore security rules |
| **2026-03-05** | 🧱 **Codebase modularization** — `script.js` refactored into 13 focused modules for maintainability |
| **2026-03-05** | 🧮 **Executable math blocks** — evaluate math expressions in preview using Nerdamer (algebra, calculus, trig) |
| **2026-03-05** | 📚 **6 new templates** — Coding and Maths categories with interactive bash and math blocks |
| **2026-03-05** | 🎨 **Template UI polish** — category pill tabs, improved card layout, better spacing |
| **2026-03-05** | ✨ **AI writing tags** — Polish, Formalize, Elaborate, Shorten actions for selected text or full document |
| **2026-03-05** | 📄 **Feature Showcase as default** — comprehensive showcase loads on first visit |
| **2026-03-04** | 🏷️ **Rebranded to MDview** — new display name across all pages, meta tags, and templates |
| **2026-03-04** | 🔄 **Non-blocking AI panel** — AI panel opens instantly; Qwen download deferred until first use |
| **2026-03-04** | 🧩 **Multi-model AI selector** — switch between Qwen (local), Groq Llama 3.3, Gemini, and OpenRouter |
| **2026-03-04** | 🌐 **Google Gemini** — free-tier Gemini AI model with SSE streaming and 1M tokens/min |
| **2026-03-04** | 🔀 **OpenRouter AI** — access free auto-routed models via OpenRouter API |
| **2026-03-04** | 📂 **File format converters** — import DOCX, XLSX/XLS, CSV, HTML, JSON, XML, and PDF |
| **2026-03-04** | 🖥 **Desktop app** — native desktop version via Neutralino.js with system tray and offline support |
| **2026-03-04** | 📐 **Resizable AI panel** — three-column layout (Editor ∣ Preview ∣ AI) with draggable resize |
| **2026-03-04** | ☁️ **Groq Llama 3.3 70B** — cloud AI model via Groq API |
| **2026-03-04** | 🖥️ **Executable bash blocks** — run bash commands in preview via [just-bash](https://justbash.dev/) |
| **2026-03-04** | 🤖 **AI Assistant (Qwen 3.5)** — local AI: summarize, expand, rephrase, grammar-check, explain, simplify, auto-complete |
| **2026-03-04** | 🧠 **AI context menu** — select text, right-click for quick AI actions |
| **2026-03-04** | ☁️ **Cloud auto-save** — periodic encrypted backup to Firebase Firestore |
| **2026-03-04** | 🌱 **PlantUML diagrams** — render PlantUML inside Markdown with live preview |
| **2026-03-04** | 📝 **Word wrap toggle** — switch editor word-wrap on or off |
| **2026-03-04** | 🎯 **Focus mode** — distraction-free writing with dimmed surrounding paragraphs |
| **2026-03-04** | 🔥 **Firebase Firestore sharing** — short share URLs via Firestore |
| **2026-03-04** | 🛠 **Formatting toolbar** — bold, italic, strikethrough, heading, link, image, code, lists, table, undo/redo |
| **2026-03-04** | 🔍 **Find & Replace** — search and replace with regex support |
| **2026-03-04** | 📑 **Table of Contents** — auto-generated, clickable sidebar TOC |
| **2026-03-04** | 💾 **Auto-save** — content saved to localStorage and restored on reload |
| **2026-03-04** | 🧘 **Zen mode** — minimal full-screen editor view (`Ctrl+Shift+Z`) |
| **2026-03-04** | 🎞 **Slide presentation** — present Markdown as slides using `---` separators |
| **2026-03-04** | 📌 **Callout blocks** — `> [!NOTE]`, `> [!WARNING]`, etc. styled |
| **2026-03-04** | 📝 **Footnotes** — `[^1]` footnote syntax with back-references |
| **2026-03-04** | ⚓ **Anchor links** — click headings to copy anchor URLs |
| **2026-03-04** | 🖼 **Image paste** — paste images from clipboard as base64 |
| **2026-03-04** | 🎨 **Preview themes** — GitHub, GitLab, Notion, Dracula, Solarized |
| **2026-03-04** | 🖥 **View modes** — Split, Editor-only, Preview-only with draggable divider |
| **2026-03-04** | 📄 **New document** — one-click button to start fresh |
| **2026-03-04** | 📱 **Mobile menu** — dedicated responsive sidebar menu |
| **2026-03-04** | 📑 **Smart PDF export** — page-break detection, cascading adjustments, graphic scaling |
| **2026-03-03** | 🔐 **Encrypted sharing** — AES-256-GCM encrypted markdown sharing |
| **2026-03-03** | 🌐 **GitHub Pages deployment** — hosted on `markdownview.github.io` |
| **2026-03-03** | 📖 **README overhaul** — comprehensive docs with screenshots |
| **2026-03-01** | 🐛 **Mermaid toolbar UX** — copy button label, toolbar order, modal size improvements |
| **2026-02-28** | ✨ **Code review polish** — rounded dimensions, CSS variable backgrounds |
| **2026-01-10** | 🔧 **Scroll & toolbar UI** — scroll behavior improvements, toolbar refinements |
| **2025-09-30** | 📄 **PDF export refactor** — improved PDF generation |
| **2025-05-09** | 🖨 **PDF rendering fixes** — PDF export bug fixes |
| **2025-05-01** | 🎨 **New UI & dark mode fixes** — refreshed interface |
| **2024-04-12** | 📊 **Reading stats** — word count, character count, reading time |
| **2024-04-09** | 🚀 **Initial commit** — MDview project created |

---

<div align="center">
    <p>Created with ❤️ by the <a href="https://github.com/markdownview">MDview</a> team</p>
</div>
