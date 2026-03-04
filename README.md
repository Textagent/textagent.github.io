# Markdown Viewer

<div align="center">
    <img src="assets/icon.jpg" alt="Markdown Viewer Logo" width="150px"/>
    <h3>A powerful GitHub-style Markdown rendering tool</h3>
    <p>Fast, secure, and feature-rich - all running in your browser</p>
    <a href="https://markdownview.github.io/">Live Demo</a> • 
    <a href="#-features">Features</a> • 
    <a href="#-screenshots">Screenshots</a> • 
    <a href="#-usage">Usage</a> • 
    <a href="#-release-notes">Release Notes</a> • 
    <a href="#-license">License</a>
</div>

## 🚀 Overview

Markdown Viewer is a professional, full-featured Markdown editor and preview application that runs entirely in your browser. It provides a GitHub-style rendering experience with a clean split-screen interface, allowing you to write Markdown on one side and instantly preview the formatted output on the other.

## ✨ Features

- **GitHub-style Markdown rendering** - See your Markdown exactly as it would appear on GitHub
- **Live preview** - Instantly see changes as you type
- **Syntax highlighting** - Beautiful code highlighting for multiple programming languages
- **LaTeX math support** - Render mathematical equations using LaTeX syntax
- **Mermaid diagrams** - Create diagrams and flowcharts within your Markdown; hover over any diagram to reveal a toolbar for zooming, downloading (PNG/SVG), and copying to clipboard
- **PlantUML diagrams** - Render PlantUML diagrams with live preview via the public PlantUML server
- **Dark mode toggle** - Switch between light and dark themes for comfortable viewing
- **Preview themes** - Multiple preview themes (GitHub, Academic, Solarized)
- **Export options** - Download your content as Markdown, HTML, or PDF
- **Smart PDF export** - Page-break detection, cascading adjustment, and automatic scaling of oversized graphics
- **Import Markdown files** - Drag & drop or select files to open
- **Copy to clipboard** - Quickly copy your Markdown content with one click
- **Sync scrolling** - Keep editor and preview panes aligned (toggleable)
- **View modes** - Split, Editor-only, and Preview-only views with a draggable resize divider
- **Content statistics** - Track word count, character count, and reading time
- **Formatting toolbar** - Bold, italic, heading, list, link, code, table, undo/redo shortcuts above the editor
- **Find & Replace** - Search and replace text inside the editor with regex support (`Ctrl+F`)
- **Table of Contents** - Auto-generated, clickable sidebar TOC from document headings
- **Auto-save** - Content saved to localStorage and restored on reload
- **☁️ Cloud auto-save** - Periodic encrypted backup to Firebase Firestore
- **Zen mode** - Minimal full-screen editor view (`Ctrl+Shift+Z`)
- **Focus mode** - Distraction-free writing with dimmed paragraphs outside the cursor
- **Word wrap toggle** - Switch editor word-wrap on or off
- **Slide presentation** - Present Markdown as slides using `---` separators
- **New document** - One-click button to start a fresh document
- **Callout blocks** - `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, etc. rendered as styled callouts
- **Footnotes** - `[^1]` footnote syntax with back-references
- **Anchor links** - Click headings to copy anchor URLs
- **Image paste** - Paste images from clipboard directly into the editor as base64
- **🤖 AI Assistant** - Qwen 3.5 Small running 100% locally via WebGPU / WASM — summarize, rephrase, expand, grammar-check, explain, simplify, and auto-complete
- **☁️ Groq Cloud AI** - Llama 3.3 70B via Groq API as a fast cloud alternative to the local model
- **🌐 Google Gemini 2.0 Flash** - Free-tier Gemini model with 1 M tokens/min and SSE streaming
- **🔀 OpenRouter** - Access free models (auto-routed) via OpenRouter API
- **Resizable AI panel** - Drag the AI panel edge to resize; three-column layout (Editor | Preview | AI) with independent width control
- **AI context menu** - Select text in the editor or preview and right-click for quick AI actions
- **🖥️ Executable code blocks** - Run bash commands directly in the preview — powered by [just-bash](https://justbash.dev/)
- **📂 File format converters** - Import DOCX, XLSX/XLS, CSV, HTML, JSON, XML, and PDF files — auto-converted to Markdown
- **🖥 Desktop app** - Native desktop version via Neutralino.js with system tray, file-open, and offline support
- **🔐 Encrypted sharing** - Share markdown via Firebase/GitHub with AES-256-GCM encryption; decryption key stays in the URL fragment (never sent to any server)
- **Fully responsive** - Works on desktop and mobile with a dedicated mobile menu
- **Emoji support** - Convert emoji shortcodes into actual emojis
- **100% client-side** - No server processing, ensuring complete privacy and security
- **No sign-up required** - Use instantly without any registration

## 📸 Screenshots

### Code Syntax Highlighting
![Code Syntax Highlighting](assets/code.png)

### Mathematical Expressions Support
![Mathematical Expressions](assets/mathexp.png)

### Mermaid Diagrams
![Mermaid Diagrams](assets/mermaid.png)

### Tables Support
![Tables Support](assets/table.png)

## 📝 Usage

1. **Writing Markdown** - Type or paste Markdown content in the left editor panel
2. **Viewing Output** - See the rendered HTML in the right preview panel
3. **Importing Files** - Click "Import" or drag and drop .md files into the interface
4. **Exporting Content** - Use the "Export" dropdown to download as MD, HTML, or PDF
5. **Toggle Dark Mode** - Click the moon icon to switch between light and dark themes
6. **Toggle Sync Scrolling** - Enable/disable synchronized scrolling between panels
7. **Sharing Markdown** - Click "Share" to compress, encrypt, and store your markdown via Firebase (with GitHub fallback). A unique link with the decryption key is generated for the recipient.
8. **AI Assistant** - Click the ✨ AI button to open the AI panel. The model runs locally in your browser — no data leaves your device.
9. **View Modes** - Switch between Split, Editor-only, and Preview-only views using the toolbar buttons
10. **Zen Mode** - Press `Ctrl+Shift+Z` or click the Zen button for a minimal, full-screen writing experience

### Mermaid Diagram Toolbar

When a Mermaid diagram is rendered, hover over it to reveal a small toolbar with the following actions:

| Button | Action |
|--------|--------|
| ⛶ (arrows) | Open diagram in a zoom/pan modal |
| PNG | Download the diagram as a PNG image |
| 📋 (clipboard) | Copy the diagram image to the clipboard |
| SVG | Download the diagram as an SVG file |

Inside the **zoom modal** you can:
- **Zoom in / out** using the buttons or the mouse wheel
- **Pan** by clicking and dragging the diagram
- **Reset** zoom and position with the Reset button
- **Download PNG or SVG** directly from the modal
- **Close** with the × button or by pressing `Escape`

### Supported Markdown Features

- Headings (# H1, ## H2, etc.)
- **Bold** and *italic* text
- ~~Strikethrough~~
- [Links](https://example.com)
- Images
- Lists (ordered and unordered)
- Tables
- Code blocks with syntax highlighting
- Blockquotes
- Horizontal rules
- Task lists
- LaTeX equations (inline and block)
- Mermaid diagrams
- PlantUML diagrams
- Callout / admonition blocks
- Footnotes
- Emoji shortcodes
- Executable bash code blocks
- And more!

## 🔧 Technologies Used

- HTML5
- CSS3
- JavaScript
- [Bootstrap](https://getbootstrap.com/) - Responsive UI framework
- [Marked.js](https://marked.js.org/) - Markdown parser
- [highlight.js](https://highlightjs.org/) - Syntax highlighting
- [MathJax](https://www.mathjax.org/) - Mathematical expressions
- [Mermaid](https://mermaid-js.github.io/mermaid/) - Diagrams and flowcharts
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML sanitization
- [html2canvas.js](https://github.com/niklasvh/html2canvas) + [jsPDF](https://www.npmjs.com/package/jspdf) - PDF generation
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) - File download handling
- [JoyPixels](https://www.joypixels.com/) - Emoji support
- [pako](https://github.com/nicmart/pako) - Gzip compression for encrypted sharing
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - AES-256-GCM encryption (browser-native)
- [Firebase Firestore](https://firebase.google.com/docs/firestore) - Cloud sharing & auto-save storage
- [Transformers.js](https://huggingface.co/docs/transformers.js) - Local AI inference (Qwen 3.5 Small 0.8B)
- [Groq API](https://groq.com/) - Cloud AI inference (Llama 3.3 70B)
- [Google Gemini API](https://ai.google.dev/) - Cloud AI inference (Gemini 2.0 Flash)
- [OpenRouter API](https://openrouter.ai/) - Multi-model AI routing
- [PlantUML Server](https://www.plantuml.com/) - PlantUML diagram rendering
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) + [Turndown.js](https://github.com/mixmark-io/turndown) - DOCX-to-Markdown conversion
- [SheetJS](https://sheetjs.com/) - XLSX/XLS spreadsheet parsing
- [pdf.js](https://mozilla.github.io/pdf.js/) - Client-side PDF text extraction
- [Neutralino.js](https://neutralino.js.org/) - Lightweight desktop app framework
- [just-bash](https://justbash.dev/) - In-browser bash execution for code blocks

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

The Markdown Viewer has undergone significant evolution since its inception. What started as a simple markdown parser has grown into a full-featured, professional application with multiple advanced capabilities. By comparing the [current version](https://markdownview.github.io/) with the [original version](https://a1b91221.markdownviewer.pages.dev/), you can see the remarkable progress in UI design, performance optimization, and feature implementation.

## 📋 Release Notes

| Date | Feature / Update |
|------|-----------------|
| **2026-03-04** | 🌐 **Google Gemini 2.0 Flash** — free-tier Gemini AI model with SSE streaming and 1 M tokens/min |
| **2026-03-04** | 🔀 **OpenRouter AI** — access free auto-routed models via OpenRouter API |
| **2026-03-04** | 📂 **File format converters** — import DOCX, XLSX/XLS, CSV, HTML, JSON, XML, and PDF; auto-converted to Markdown |
| **2026-03-04** | 🖥 **Desktop app** — native desktop version via Neutralino.js with system tray and offline support |
| **2026-03-04** | 📐 **Resizable AI panel** — three-column layout (Editor ∣ Preview ∣ AI) with draggable resize divider on the AI panel edge; width persisted across sessions |
| **2026-03-04** | ☁️ **Groq Llama 3.3 70B** — cloud AI model via Groq API as a fast alternative to the local Qwen model; model selector to switch between Local and Cloud |
| **2026-03-04** | 🖥️ **Executable bash blocks** — run bash commands directly in the preview powered by [just-bash](https://justbash.dev/); hover over any bash code block and click ▶ Run |
| **2026-03-04** | 🤖 **AI Assistant (Qwen 3.5)** — local AI running via WebGPU/WASM: summarize, expand, rephrase, grammar-check, explain, simplify, auto-complete |
| **2026-03-04** | 🧠 **AI context menu** — select text in editor or preview, right-click for quick AI actions |
| **2026-03-04** | ☁️ **Cloud auto-save** — periodic encrypted backup to Firebase Firestore |
| **2026-03-04** | 🌱 **PlantUML diagrams** — render PlantUML inside Markdown with live preview |
| **2026-03-04** | 📝 **Word wrap toggle** — switch editor word-wrap on or off |
| **2026-03-04** | 🎯 **Focus mode** — distraction-free writing with dimmed surrounding paragraphs |
| **2026-03-04** | 🔥 **Firebase Firestore sharing** — short share URLs via Firestore instead of long encoded strings |
| **2026-03-04** | 🛠 **Formatting toolbar** — bold, italic, strikethrough, heading, link, image, code, lists, table, undo/redo |
| **2026-03-04** | 🔍 **Find & Replace** — search and replace text inside the editor with regex support |
| **2026-03-04** | 📑 **Table of Contents** — auto-generated, clickable sidebar TOC from headings |
| **2026-03-04** | 💾 **Auto-save** — content saved to localStorage and restored on reload |
| **2026-03-04** | 🧘 **Zen mode** — minimal full-screen editor view (`Ctrl+Shift+Z`) |
| **2026-03-04** | 🎞 **Slide presentation** — present Markdown as slides using `---` separators |
| **2026-03-04** | 📌 **Callout blocks** — `> [!NOTE]`, `> [!WARNING]`, etc. rendered as styled callouts |
| **2026-03-04** | 📝 **Footnotes** — `[^1]` footnote syntax with back-references |
| **2026-03-04** | ⚓ **Anchor links** — click headings to copy anchor URLs |
| **2026-03-04** | 🖼 **Image paste** — paste images from clipboard directly into the editor |
| **2026-03-04** | 🎨 **Preview themes** — multiple preview themes (GitHub, Academic, Solarized) |
| **2026-03-04** | 🖥 **View modes** — Split, Editor-only, and Preview-only with draggable resize divider |
| **2026-03-04** | 📄 **New document** — one-click button to start a fresh document |
| **2026-03-04** | 📱 **Mobile menu** — dedicated responsive sidebar menu for mobile devices |
| **2026-03-04** | 📑 **Smart PDF export** — page-break detection, cascading adjustments, oversized graphic scaling |
| **2026-03-03** | 🔐 **Encrypted sharing** — AES-256-GCM encrypted markdown sharing via GitHub |
| **2026-03-03** | 🌐 **GitHub Pages deployment** — hosted on `markdownview.github.io` |
| **2026-03-03** | 📖 **README overhaul** — comprehensive docs with screenshots and usage guide |
| **2026-03-01** | 🐛 **Mermaid toolbar UX** — copy button label, toolbar order, modal size improvements |
| **2026-02-28** | ✨ **Code review polish** — rounded dimensions, CSS variable backgrounds, timestamped filenames |
| **2026-01-10** | 🔧 **Scroll & toolbar UI** — scroll behavior improvements, toolbar refinements, code cleanup |
| **2025-09-30** | 📄 **PDF export refactor** — improved PDF generation and enhanced UI responsiveness |
| **2025-05-09** | 🖨 **PDF rendering fixes** — PDF export bug fixes and rendering improvements |
| **2025-05-01** | 🎨 **New UI & dark mode fixes** — refreshed interface, fixed dark-mode code-block coloring |
| **2024-04-12** | 📊 **Reading stats** — word count, character count, and reading time |
| **2024-04-09** | 🚀 **Initial commit** — Markdown Viewer project created |

---

<div align="center">
    <p>Created with ❤️ by the <a href="https://github.com/markdownview">Markdown Viewer</a> team</p>
</div>
