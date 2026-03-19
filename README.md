# TextAgent

<div align="center">
    <img src="assets/icon.png" alt="TextAgent Logo" width="150px"/>
    <h3>Write with AI Agents — Markdown Editor & Viewer</h3>
    <p>Write, preview, present, and share — all in your browser, 100% client-side</p>
    <a href="https://textagent.github.io/">Live Demo</a> • 
    <a href="#-features-at-a-glance">Features</a> • 
    <a href="#-screenshots">Screenshots</a> • 
    <a href="#-usage">Usage</a> • 
    <a href="#-release-notes">Release Notes</a> • 
    <a href="#-license">License</a>
</div>

## 🚀 Overview

**TextAgent** is a professional, full-featured Markdown editor and preview application that runs entirely in your browser. It provides a GitHub-style rendering experience with a split-screen interface, AI-powered writing assistance, voice dictation, multi-format file import, encrypted sharing, slide presentations, executable code & math blocks, and powerful export options — all without any server-side processing.

**No sign-up. No server. No data leaves your device.**

## ✨ Features at a Glance

| Category | Features |
|:---------|:---------|
| **Editor** | Live preview, split/editor/preview/page modes, sync scrolling, formatting toolbar, find & replace (regex), word wrap toggle, draggable resize divider |
| **Writing Modes** | Zen mode (distraction-free fullscreen), Focus mode (dimmed paragraphs), Dark mode, multiple preview themes (GitHub, GitLab, Notion, Dracula, Solarized, Evergreen) |
| **Rendering** | GitHub-style Markdown, syntax highlighting (180+ languages), LaTeX math (MathJax), Mermaid diagrams (zoom/pan/export), PlantUML diagrams, callout blocks, footnotes, emoji, anchor links |
| **🎬 Media Embedding** | Video playback via `![alt](video.mp4)` image syntax (`.mp4`, `.webm`, `.ogg`, `.mov`, `.m4v`); YouTube/Vimeo embeds auto-detected; `embed` code block for responsive media grids (`cols=1-4`, `height=N`); Video.js v10 lazy-loaded with native `<video>` fallback; website URLs render as rich link preview cards with favicon + "Open ↗" button |
| **🤖 AI Assistant** | 3 local Qwen 3.5 sizes (0.8B / 2B / 4B via WebGPU/WASM), Gemini 3.1 Flash Lite, Groq Llama 3.3 70B, OpenRouter — summarize, expand, rephrase, grammar-fix, explain, simplify, auto-complete; AI writing tags (Polish, Formalize, Elaborate, Shorten, Image); enhanced context menu; per-card model selection; concurrent block generation; inline review with accept/reject/regenerate; AI-powered image generation; **smart model loading UX** — cache vs download detection (📦/⬇️), HuggingFace source location display, delete cached models from browser storage; all models hosted on [`textagent` HuggingFace org](https://huggingface.co/textagent) with automatic fallback |
| **🎤 Voice Dictation** | Dual-engine speech-to-text: **Voxtral Mini 3B** (WebGPU, primary, 13 languages, ~2.7 GB) or **Whisper Large V3 Turbo** (WASM fallback, ~800 MB) with consensus scoring; download consent popup with model info before first use; 50+ Markdown-aware voice commands — natural phrases ("heading one", "bold…end bold", "add table", "undo"); auto-punctuation via AI refinement or built-in fallback; streaming partial results |
| **🔊 Text-to-Speech** | Hybrid Kokoro TTS engine — 9 languages (English, Japanese, Chinese, Spanish, French, Hindi, Italian, Portuguese) via [Kokoro 82M v1.0 ONNX](https://huggingface.co/textagent/Kokoro-82M-v1.0-ONNX) (~80 MB, off-thread WebWorker), Korean, German & others via Web Speech API fallback; TTS card with separate ▶ Run (generate audio) / ▷ Play (replay) / 💾 Save (WAV download) buttons; hover any preview text and click 🔊 to hear pronunciation; voice auto-selection by language |
| **Import** | MD, DOCX, XLSX/XLS, CSV, HTML, JSON, XML, PDF — drag & drop or click to import |
| **Export** | Markdown, self-contained styled HTML, PDF (smart page-breaks, shared rendering pipeline), LLM Memory (5 formats: XML, JSON, Compact JSON, Markdown, Plain Text + shareable link) |
| **Sharing** | AES-256-GCM encrypted sharing via Firebase; read-only shared links with auto-dismiss banner + floating "Read-only" pill indicator, optional password protection — decryption key stays in URL fragment (never sent to server); **view-locked links** (lock recipients to PPT or Preview mode, stored in Firestore to prevent URL tampering); **shared versions tracking** ("Previously Shared" panel with timestamps, view-mode badges, copy/delete actions) |
| **Presentation** | Slide mode using `---` separators, keyboard navigation, multiple layouts & transitions, speaker notes, overview grid, 20+ PPT templates with image backgrounds |
| **Desktop** | Native app via Neutralino.js with system tray and offline support |
| **Code Execution** | 7 languages in-browser: Bash ([just-bash](https://justbash.dev/)), Math (Nerdamer), LaTeX (MathJax + Nerdamer evaluation), Python ([Pyodide](https://pyodide.org/)), HTML (sandboxed iframe, `html-autorun` for widgets/quizzes), JavaScript (sandboxed iframe), SQL ([sql.js](https://sql.js.org/) SQLite) · 25+ compiled languages via [Judge0 CE](https://ce.judge0.com): C, C++, Rust, Go, Java, TypeScript, Kotlin, Scala, Ruby, Swift, Haskell, Dart, C#, and more · **▶ Run All** notebook engine — one-click sequential execution with preflight dialog (block table with model/status), pre-execution model loading (AI + TTS auto-loaded before blocks run), progress bar, abort, per-block status badges, detailed console logging, and SQLite shared context store |
| **Security** | Content Security Policy (CSP), SRI integrity hashes, XSS sanitization (DOMPurify), ReDoS protection, Firestore write-token ownership, API keys via HTTP headers, postMessage origin validation, 8-char password minimum, sandboxed code execution, Cloudflare Turnstile CAPTCHA on email endpoint, automated security scanner (`scripts/security-check.sh`) with pre-commit integration |
| **AI Document Tags** | `{{@AI:}}` text generation (`@think: Yes` for deep reasoning), `{{@Image:}}` image generation (Gemini Imagen), `{{@OCR:}}` image-to-text extraction (Text/Math/Table modes via Granite Docling 258M, Florence-2 230M, or GLM-OCR 1.5B, PDF page rendering via pdf.js), `{{@TTS:}}` text-to-speech playback (Kokoro TTS per card, language selector, ▶ Play / ⬇ Save WAV), `{{@STT:}}` speech-to-text dictation (engine selector: Whisper/Voxtral/Web Speech API, 11 languages, Record/Stop/Insert/Clear), `{{@Translate:}}` translation (target language selector, integrated TTS pronunciation, cloud model routing), `{{@Game:}}` game builder (AI-generated or pre-built, Canvas 2D/Three.js/P5.js, import/export HTML), `{{@Draw:}}` whiteboard (Excalidraw + Mermaid, AI diagram generation with per-card model selector + 🚀 Generate, robust JSON repair for local models, Insert/PNG/SVG export, 📚 Library Browser with 29 bundled packs in 6 categories) — `@` prefix syntax on all tag types + metadata fields (`@name`, `@use`, `@think`, `@search`, `@prompt`, `@step`, `@upload`, `@model`, `@engine`, `@lang`, `@prebuilt`); `@model:` field persists selected model per card with intelligent defaults (OCR→`granite-docling`, TTS→`kokoro-tts`, STT→`voxtral-stt`, Image→`imagen-ultra`); editable `@prompt:` textarea and `@step:` inputs in preview cards; description/prompt separation (bare text = label, `@prompt:` = AI instruction); 📎 image/PDF upload for multimodal vision analysis; per-card model selector with document-portable model persistence, concurrent block operations |
| **🔌 API Calls** | `{{API:}}` REST API integration — GET/POST/PUT/DELETE methods, custom headers, JSON body, response stored in `$(api_varName)` variables; inline review panel; toolbar GET/POST buttons |
| **🔗 Agent Flow** | `{{Agent:}}` multi-step pipeline — define Step 1/2/3, chain outputs, per-card model + search provider selector, live step status indicators (⏳/✅/❌), review combined output; `@cloud: yes` toggle routes execution to GitHub Codespaces (free ephemeral environments) via ☁️ button |
| **🔍 Web Search** | Toggle web search for AI — 7 providers: DuckDuckGo (free), Brave Search, Serper.dev, Tavily (AI-optimized), Google CSE, Wikipedia, Wikidata; search results injected into LLM context; source citations in responses; per-agent-card search provider selector |
| **🎮 Game Builder** | `{{@Game:}}` tag — AI-generated games (Canvas 2D / Three.js / P5.js) or instant pre-built games via `@prebuilt:` field (chess, snake, shooter, pong, breakout, maths quiz, hiragana, kana master); engine selector pills; per-card model picker; CDN URL normalizer for CSP compliance; auto model-ready check before generation; 📋 Import button for pasting/uploading external HTML game code with source viewer; 📥 Export as standalone HTML; ⛶ fullscreen; single-line field parsing; "Games for Kids" template with 8 playable games |
| **🐧 Linux Terminal** | `{{Linux:}}` tag — two modes: (1) Terminal mode opens full Debian Linux ([WebVM](https://webvm.io)) in new window with `Packages:` field; (2) Compile & Run mode (`Language:` + `Script:`) compiles/executes 25+ languages (C++, Rust, Go, Java, Python, TypeScript, Kotlin, Scala…) via [Judge0 CE](https://ce.judge0.com) with inline output, execution time & memory stats |
| **❓ Help Mode** | Interactive learning mode — click ❓ Help to highlight all buttons, click any button for description + keyboard shortcut + animated demo video; 50% screen demo panel with fullscreen expand; 16 dedicated demo videos mapped to every toolbar button |
| **🧠 Context Memory** | `{{@Memory:}}` tag for workspace intelligence — SQLite FTS5 full-text search with heading-aware chunking (~1500 chars/chunk); three storage modes: browser-only (IndexedDB), disk workspace (`.textagent/memory.db`), external folders (IndexedDB); `@use: workspace, my-docs` in AI/Think/Agent tags for multi-source context retrieval; Memory Selector dropdown on AI/Think/Agent cards; amber-accented Memory card with Folder/Files/Rebuild buttons + stats; auto-discovery of workspace files; `Use: none` opt-out; reuses existing sql.js WASM (zero bundle increase) |
| **✉️ Email to Self** | Send documents directly to your inbox from the share modal — email address input with `.md` file attached + share link; powered by Google Apps Script (free, 100 emails/day); Cloudflare Turnstile CAPTCHA verification; dual rate limiting (100/day global + 7/day per recipient); loading state + success/error feedback; email persisted in localStorage; zero third-party dependencies |
| **💾 Disk Workspace** | Folder-backed storage via File System Access API — "Open Folder" in sidebar header; `.md` files read/written directly to disk; `.textagent/workspace.json` manifest; debounced autosave ("💾 Saved to disk" indicator); refresh from disk for external edits; disconnect to revert to localStorage; auto-reconnect on reload via IndexedDB handles; unified action modal for rename/duplicate/delete with confirmation; Chromium-only (hidden in unsupported browsers) |
| **📈 Finance Dashboard** | Stock/crypto/index dashboard templates with live TradingView charts; dynamic grid via `data-var-prefix` (add/remove tickers in `@variables` table, grid auto-adjusts); configurable chart range (`1M`, `12M`, `36M`), interval (`D`, `W`, `M`), and EMA period (default 52); interactive 1M/1Y/3Y range + 52D/52W/52M EMA toggle buttons; `@variables` table persists after ⚡ Vars for re-editing; JS code block generates grid HTML from variables |
| **Extras** | Auto-save (localStorage + cloud), table of contents, image paste, 136+ templates (14 categories: AI, Agents, Coding, Creative, Documentation, Finance, Games, Maths, PPT, Project, Quiz, Skills, Tables, Technical), AI Model Manager template (local model reference with sizes, privacy, and capabilities), template variable substitution (`$(varName)` with auto-detect), table spreadsheet tools (sort, filter, stats, chart, add row/col, inline cell edit, CSV/MD export), content statistics, modular codebase (13+ JS modules), fully responsive mobile UI with scrollable Quick Action Bar (Files, Search, TOC, Share, Copy, Tools, AI, Model, Upload, Help) and formatting toolbar, multi-file workspace sidebar, compact header mode with collapsible Tools dropdown (Presentation, Zen, Word Wrap, Focus, Voice, Dark Mode, Preview Theme), Clear All / Clear Selection buttons (undoable via Ctrl+Z) |
| **Dev Tooling** | ESLint + Prettier (lint, format:check), Playwright test suite — 572 tests across smoke, feature, integration, dev, regression, performance, quality, and security categories (import, export, share, view-mode, editor, email-to-self, secure share, startup timing, export integrity, persistence, module loading, disk workspace, context memory, exec engine, build validation, load-time, accessibility, video player, TTS, STT, file converters, stock widget, embed grid, model registry, model tag, game tag, draw docgen, readonly mode, excalidraw library, help mode, page view, table tools, API tag, Linux tag, template loading, inline rename, presentation, static analysis, code smell, XSS hardening, Florence-2 model, Docling model, GLM-OCR model, TTS download), Firestore rules validation (21 tests), automated security scanner (13 checks, 3 severity tiers), pre-commit changelog + security enforcement, GitHub Actions CI |

## 🤖 AI Assistant

TextAgent includes a built-in AI assistant panel with **three local model sizes** and cloud providers:

| Model | Provider | Type | Speed |
|:------|:---------|:-----|:------|
| **Qwen 3.5 Small (0.8B)** | Local (WebGPU/WASM) | 🔒 Private — no data leaves browser | ⚡ Fast |
| **Qwen 3.5 Medium (2B)** | Local (WebGPU/WASM) | 🔒 Private — smarter, ~1.2 GB | ⚡ Fast |
| **Qwen 3.5 Large (4B)** | Local (WebGPU/WASM) | 🔒 Private — best quality, ~2.5 GB | ⚡ High-end |
| **Gemini 3.1 Flash Lite** | Google (free tier) | ☁️ Cloud — 1M tokens/min | 🚀 Very Fast |
| **Llama 3.3 70B** | Groq (free tier) | ☁️ Cloud — ultra-low latency | ⚡ Ultra Fast |
| **Auto · Best Free** | OpenRouter (free tier) | ☁️ Cloud — multi-model routing | 🧠 Powerful |
| **Kokoro TTS (82M)** | Local (WebWorker) | 🔒 Private — 9 Languages · ~80 MB | 🔊 Speech |
| **Voxtral STT (3B)** | Local (WebGPU) | 🔒 Private — 13 languages · ~2.7 GB | 🎤 Dictation |
| **Granite Docling (258M)** | Local (WebGPU/WASM) | 🔒 Private — document OCR · ~500 MB | 📄 Document |
| **Florence-2 (230M)** | Local (WebGPU/WASM) | 🔒 Private — OCR + captioning · ~230 MB | 📷 Vision |
| **GLM-OCR (1.5B)** | Local (WebGPU) | 🔒 Private — Advanced OCR · ~650 MB | 📷 Advanced OCR |

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
| **HTML** | Self-contained styled HTML with all CSS inlined, theme attributes preserved |
| **PDF** | Smart page-break detection, cascading adjustments, oversized graphic scaling |
| **LLM Memory** | 5 formats: XML, JSON, Compact JSON (token-saving), Markdown, Plain Text — with live token count, metadata, copy/download, and shareable encrypted link |

## 📸 Screenshots

### Split-View Editor — Live Preview
![Split-View Editor with live preview, formatting toolbar, and feature overview](assets/split-view-editor.png)

### AI Writing Assistant — Local & Cloud Models
![AI Assistant panel with model selector, action chips, and three-column layout](assets/ai-assistant.png)

### Templates Gallery — 136+ Templates, 14 Categories
![Templates modal with category tabs, search, and template cards including Games](assets/templates-gallery.png)

### LaTeX Math & Mermaid Diagrams
![Math expressions and interactive Mermaid diagrams with flowchart, sequence, and pie chart](assets/math-mermaid.png)

### Code Execution & Table Spreadsheet Tools
![In-browser SQL execution, interactive table tools with sort, filter, stats, and charts](assets/code-execution-tables.png)

### Presentation Mode — Markdown to Slides
![Slide presentation mode with dark theme and navigation controls](assets/presentation-mode.png)

### Context Memory — Workspace Intelligence
![Context Memory with Memory card, AI Generate card showing project-docs pill, and Agent Flow](assets/context-memory.png)

### Help Mode — Interactive Learning
![Help Mode with Bold popover, keyboard shortcut, and Watch Demo video panel](assets/help-mode.png)

### API Calls & Linux Compile — REST + Code Execution
![API CALL card with GET badge and Linux Compile & Run card with Python fibonacci script](assets/api-linux-tags.png)

### Email to Self — Share to Inbox
![Link Generated modal with encrypted URL and Email to Self section with email input](assets/email-to-self.png)

## 🎬 Feature Demos

> Click any feature below to watch a live demo.

<details open>
<summary><strong>🔒 Privacy-First — No Sign-Up, 100% Client-Side</strong></summary>

**Your data never leaves your browser.** TextAgent runs entirely client-side with no server, no account, and no tracking. Type sensitive content with confidence — even your saved data stays in localStorage on your device.

<img src="public/assets/demos/01_privacy_hero.webp" alt="Privacy-First Demo — no sign-up, live editing, dark mode toggle" width="100%">

</details>

<details open>
<summary><strong>🤖 AI Writing Assistant — Local & Cloud Models</strong></summary>

**Built-in AI with 3 local model sizes + cloud providers** — choose Qwen 3.5 Small (0.8B), Medium (2B), or Large (4B) for fully private local inference, or use cloud models (Gemini, Groq, OpenRouter). High-end device warning before 4B download.

<img src="public/assets/demos/02_ai_assistant.webp" alt="AI Writing Assistant — model selection, action chips, streaming response" width="100%">

</details>

<details open>
<summary><strong>📄 Templates Gallery — 136+ Templates, 14 Categories</strong></summary>

**Start any document in seconds.** Browse 136+ professionally designed templates across 14 categories: AI, Agents, Coding, Creative, Documentation, Finance, Games, Maths, PPT, Project, Quiz, Skills, Tables, and Technical. AI-powered templates include `{{AI:}}` tags for one-click document generation and the Games category features 8 instant pre-built games.

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

**Share securely with AES-256-GCM encryption.** Choose Quick Share (key in URL fragment, never sent to server) or Secure Share with a custom password. Recipients need the password to decrypt — the server never sees your content or keys.

<img src="public/assets/demos/09_encrypted_sharing.webp" alt="Encrypted Sharing — password protection and encrypted link generation" width="100%">

</details>

<details open>
<summary><strong>🛠 Formatting Toolbar — Bold, Lists, Tables & More</strong></summary>

**Full formatting power at your fingertips.** Bold, italic, strikethrough, headings, links, images, code blocks, ordered and unordered lists, tables, and undo/redo — all accessible from the toolbar without memorizing Markdown syntax.

<img src="public/assets/demos/10_formatting_toolbar.webp" alt="Formatting Toolbar — bold, headings, lists, table insertion, and undo/redo" width="100%">

</details>

<details open>
<summary><strong>🤖 AI Model Selector — Choose Your Engine</strong></summary>

**Pick the right model for the job.** Switch between 3 local Qwen sizes (0.8B / 2B / 4B) and cloud providers (Gemini, Groq, OpenRouter) directly from the AI panel. Per-card model selection lets you use different models for different blocks.

<img src="public/assets/demos/11_ai_model_selector.webp" alt="AI Model Selector — switching between local and cloud models" width="100%">

</details>

<details open>
<summary><strong>🔗 Sync Scrolling — Editor & Preview in Lockstep</strong></summary>

**Keep your place effortlessly.** Two-way synchronized scrolling links the editor and preview pane so you always see the rendered output for the line you're editing. Toggle on/off with the link icon.

<img src="public/assets/demos/12_sync_scrolling.webp" alt="Sync Scrolling — editor and preview scrolling together" width="100%">

</details>

<details open>
<summary><strong>📑 Table of Contents — Auto-Generated Navigation</strong></summary>

**Navigate long documents instantly.** A clickable sidebar TOC is auto-generated from your headings. Jump to any section with a single click, and the TOC highlights your current position as you scroll.

<img src="public/assets/demos/13_table_of_contents.webp" alt="Table of Contents — sidebar navigation generated from document headings" width="100%">

</details>

<details open>
<summary><strong>🎤 Voice Dictation — Speak Your Markdown</strong></summary>

**Hands-free writing with Markdown awareness.** Triple-engine ASR combines Web Speech API, Voxtral Mini 3B (WebGPU, primary, 13 languages) or Whisper Large V3 Turbo (WASM fallback) with consensus scoring. Download consent popup shows model size and privacy info before first use. 50+ voice commands with natural phrases — say "heading one" or "title" for H1, "bold text end bold" for **text**, "add table" for a markdown table, "undo" to take it back. Auto-punctuation adds capitalization and periods, with LLM refinement when a model is loaded.

<img src="public/assets/demos/14_voice_dictation.webp" alt="Voice Dictation — speech-to-text with Markdown-aware commands" width="100%">

</details>

<details open>
<summary><strong>🏷️ AI Document Tags — Generate Entire Sections</strong></summary>

**One-click document generation.** Use `{{AI:}}` for text (with `@think: Yes` for deep reasoning) and `{{Image:}}` for AI-generated images. Each tag becomes a card with generate, review, accept/reject, and regenerate controls — all operating independently.

<img src="public/assets/demos/15_ai_doc_tags.webp" alt="AI Document Tags — generating content with AI and Image tags, Think toggle for deep reasoning" width="100%">

</details>

<details open>
<summary><strong>🔀 Template Variables — Dynamic Reusable Documents</strong></summary>

**Templates that adapt to you.** Define `$(varName)` placeholders in any document, click ⚡ Vars to auto-detect them, fill in the generated table, and apply. Built-in globals like `$(date)` and `$(time)` work automatically. 12 templates include variable support.

<img src="public/assets/demos/16_template_variables.webp" alt="Template Variables — auto-detecting variables, filling table, and applying substitutions" width="100%">

</details>

<details open>
<summary><strong>🔗 Agent Flow — Multi-Step AI Pipeline</strong></summary>

**Chain AI steps together.** Write `{{Agent: Step 1: ... Step 2: ...}}` in markdown — a pipeline card renders with numbered steps and connecting arrows. Each step's output feeds into the next. Choose a model and search provider per card. Run, review, and accept/reject the combined output.

<img src="public/assets/demos/17_agent_flow.webp" alt="Agent Flow — multi-step pipeline with search provider and model selection" width="100%">

</details>

<details open>
<summary><strong>🐧 Compile & Run — 25+ Languages via Judge0 CE</strong></summary>

**Compile and execute code inline.** Write `{{Linux:}}` tags with `Language:` and `Script:` fields to compile and run C++, Rust, Go, Java, Python, TypeScript, Kotlin, Scala, and 25+ more languages. Output (stdout, stderr, compile errors) appears inline with execution time and memory stats.

<img src="public/assets/demos/18_compile_run.webp" alt="Compile & Run — C++ and Rust code executing inline with output and stats" width="100%">

</details>

<details open>
<summary><strong>📂 Workspace Sidebar — Multi-File Management</strong></summary>

**Manage multiple files in one workspace.** Toggle the sidebar with the File Tree button to see all your files. Create, rename, duplicate, and delete files via right-click context menu. Each file has independent localStorage persistence. Active file highlighting and smooth switching.

<img src="public/assets/demos/19_workspace_sidebar.webp" alt="Workspace Sidebar — file tree, new file creation, right-click context menu with rename/duplicate/delete" width="100%">

</details>

<details open>
<summary><strong>🧠 Context Memory — Workspace Intelligence</strong></summary>

**Give AI access to your workspace.** Use `{{Memory:}}` tags to index workspace files and external folders with SQLite FTS5 full-text search. Add `Use: workspace` to any AI/Think/Agent tag to auto-retrieve relevant context. Memory Selector dropdown on each card lets you toggle sources. Amber-accented Memory cards show attached files with Folder/Files/Rebuild controls.

<img src="public/assets/demos/20_context_memory.webp" alt="Context Memory — Memory tag indexing, AI card with project-docs context, Agent Flow pipeline" width="100%">

</details>

<details open>
<summary><strong>❓ Help Mode — Interactive Learning</strong></summary>

**Learn every feature instantly.** Click the ❓ Help button to activate learning mode — all buttons get teal ring highlights. Click any button for a popover with feature name, description, keyboard shortcut, and ▶ Watch Demo button. Demo videos play in a 50% screen panel with fullscreen expand. 16 dedicated demo videos mapped to every toolbar button.

<img src="public/assets/demos/21_help_mode.webp" alt="Help Mode — teal button highlights, Bold popover with Ctrl+B shortcut, integrated demo video panel" width="100%">

</details>

<details open>
<summary><strong>✉️ Email to Self — Share to Inbox</strong></summary>

**Send documents directly to your inbox.** After generating a share link, enter your email in the "Email to Self" section — the document is sent with the share link and `.md` file attached. Powered by Google Apps Script (free, 100 emails/day). Email is persisted in localStorage for convenience.

<img src="public/assets/demos/22_email_to_self.webp" alt="Email to Self — share modal with encrypted link and email input for sending document to inbox" width="100%">

</details>

<details open>
<summary><strong>💾 Disk-Backed Workspace — Save to Folder</strong></summary>

**Work directly with files on disk.** Click "Open Folder" to connect a local folder via File System Access API. Files are read/written directly to disk with debounced autosave. Refresh from disk for external changes, disconnect to revert to localStorage, and auto-reconnect on reload. Unified action modal for rename, duplicate, and delete with confirmation.

<img src="public/assets/demos/23_disk_workspace.webp" alt="Disk Workspace — folder tree with refresh/disconnect controls, file switching, and duplicate confirmation modal" width="100%">

</details>

<details open>
<summary><strong>🔌 API Calls & Linux Tags — REST + Compile</strong></summary>

**Call APIs and compile code from Markdown.** Use `{{API:}}` tags for REST API calls (GET/POST/PUT/DELETE) with response stored in variables. Use `{{Linux:}}` tags with `Language:` and `Script:` fields to compile 25+ languages. Toolbar sections provide quick-insert buttons for API (GET/POST) and Linux (🐧 Linux, 🔷 C++) with overflow dropdowns for more languages.

<img src="public/assets/demos/24_api_linux_tags.png" alt="API CALL card with GET badge and Linux Compile & Run card with Python code, toolbar overflow dropdowns" width="100%">

</details>

<details open>
<summary><strong>🏷️ DocGen Preview Editing — Editable Prompts & Steps</strong></summary>

**Edit prompts and steps directly in preview cards.** Use `@prompt:` for editable AI instructions (bare text stays as a static description label), edit `@step:` inputs inline in Agent Flow cards, and attach images with 📎 for multimodal vision analysis. All edits sync back to the editor in real-time.

<img src="public/assets/demos/25_docgen_preview_editing.webp" alt="DocGen Preview Editing — editable @prompt: textarea, Agent step inputs, description/prompt separation" width="100%">

</details>

<details open>
<summary><strong>▶ Run All — Notebook Execution Engine</strong></summary>

**Execute everything with one click.** Run All executes every code block, AI tag, API call, and Linux compile in document order. 11 runtime adapters with a progress bar, per-block status badges (⏳/⚡/✅/❌), abort support, and a SQLite shared context store for cross-block data sharing.

<img src="public/assets/demos/25_run_all.png" alt="Run All — notebook execution with progress bar, block status badges, and sequential execution" width="100%">

</details>

<details open>
<summary><strong>🎮 Game Builder — AI-Generated & Pre-Built Games</strong></summary>

**Build and play games in your markdown.** Use `{{@Game:}}` tags with engine selector (Canvas 2D / Three.js / P5.js) for AI-generated games, or `@prebuilt:` for 8 instant games (chess, snake, shooter, pong, breakout, maths quiz, hiragana, kana master). Import external HTML, export standalone, and go fullscreen.

<img src="public/assets/demos/26_game_builder.webp" alt="Game Builder — pre-built chess game with Three.js engine, model selector, and game controls" width="100%">

</details>

<details open>
<summary><strong>📈 Finance Dashboard — Live TradingView Charts</strong></summary>

**Create live stock dashboards.** Load a Finance template, customize tickers via the `@variables` table, and get a responsive grid of TradingView charts with configurable range (1M/1Y/3Y), interval (D/W/M), and EMA period. Interactive toggle buttons and dynamic grid expansion.

<img src="public/assets/demos/27_finance_dashboard.webp" alt="Finance Dashboard — Stock Watchlist with AAPL, MSFT, GOOGL live TradingView charts and variables table" width="100%">

</details>

<details open>
<summary><strong>🔊 Text-to-Speech — Kokoro TTS Engine</strong></summary>

**Hear any text read aloud.** Use `{{@TTS:}}` tags for per-card text-to-speech with language selector. Powered by Kokoro 82M v1.0 ONNX (~80 MB, WebWorker) for 9 languages, with Web Speech API fallback. Run to generate audio, Play to replay, Save to download as WAV.

<img src="public/assets/demos/28_text_to_speech.webp" alt="Text-to-Speech — TTS card with Kokoro engine, language selector, Run/Play/Save buttons" width="100%">

</details>

<details open>
<summary><strong>📷 OCR — Image to Text Extraction</strong></summary>

**Extract text from images and PDFs.** Use `{{@OCR:}}` tags with three models: Granite Docling 258M, Florence-2 230M, or GLM-OCR 1.5B. Three modes (Text/Math/Table) with 📎 upload for images and PDFs. PDFs rendered page-by-page via pdf.js.

<img src="public/assets/demos/29_ocr_tag.webp" alt="OCR — OCR Scan card with Florence-2 model, Text/SVG mode pills, and upload button" width="100%">

</details>

<details open>
<summary><strong>🎨 Draw — Excalidraw Whiteboard & AI Diagrams</strong></summary>

**Collaborative whiteboard in your markdown.** Use `{{@Draw:}}` tags for an embedded Excalidraw canvas with AI diagram generation (describe a diagram → Generate), Excalidraw/Mermaid tool switcher, Insert/PNG/SVG export, and a 📚 Library Browser with 29 bundled packs (600+ items) across 6 categories.

<img src="public/assets/demos/30_draw_excalidraw.webp" alt="Draw — Excalidraw card with AI prompt, Generate button, model selector, and Excalidraw/Mermaid pills" width="100%">

</details>

<details open>
<summary><strong>🎬 Media Embedding — Video, YouTube & Embed Grid</strong></summary>

**Embed rich media in your markdown.** Use `![alt](video.mp4)` for video playback, paste YouTube/Vimeo URLs for auto-embeds, and create responsive media grids with the `embed` code block (`cols=1-4`, `height=N`). Website URLs render as rich link preview cards with favicon and "Open ↗" button.

<img src="public/assets/demos/31_media_embedding.webp" alt="Media Embedding — YouTube video embed with player controls and responsive embed grid layout" width="100%">

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
| [Transformers.js](https://huggingface.co/docs/transformers.js) | Local AI inference (Qwen 3.5 — 0.8B / 2B / 4B) |
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
| [WebVM](https://webvm.io) | Full Debian Linux terminal (CheerpX x86 emulation) |
| [Judge0 CE](https://ce.judge0.com) | Server-side code execution for 25+ compiled languages |

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

TextAgent has undergone significant evolution since its inception. What started as a simple markdown parser has grown into a full-featured, AI-powered application with 40+ features. By comparing the [current version](https://textagent.github.io/) with the [original version](https://a1b91221.markdownviewer.pages.dev/), you can see the remarkable progress in UI design, performance optimization, and feature implementation.

## 📋 Release Notes

| Date | Commits | Feature / Update |
|------|---------|-----------------:|
| **2026-03-19** | | ☁️ **Agent Cloud Execution** — new `@cloud: yes` field and ☁️ toggle button on Agent Flow cards to route step execution to free GitHub Codespaces; `github-auth.js` Device Flow OAuth module (no backend/redirect needed); `agent-cloud.js` Codespaces API adapter (create/exec/stop/cleanup with idle timeout and custom endpoint fallback); GitHub auth modal reusing `ai-consent-modal` layout; 5 new storage keys; Phase 3k module loading; CSS for cloud toggle + device code UI; [implementation plan](docs/agent-cloud/implementation_plan.md) and [walkthrough](docs/agent-cloud/walkthrough.md); 20 new Playwright tests |
| **2026-03-18** | | 🧪 **Test Coverage Expansion** — 51 new Playwright tests across 8 new spec files for previously untested features: Help Mode (toggle, popover, shortcuts, demo, Escape, click interception), Page View (enter/exit A4, page frames, counter, zoom), Table Tools (container, toolbar, badges, editable cells, tiny table skip), API Tag (parsing, config, fenced block ignore, card rendering), Linux Tag (terminal/script modes, Stdin, fenced ignore, cards), Template System (modal open/close, categories, search, card rendering), Inline Rename (title chip, filename, QAB, modal), Presentation Mode (PPT switching, slide content, view mode bar); total test count 521 → 572 |
| **2026-03-18** | | 🛡️ **Turnstile CSP Fix** — added `https://challenges.cloudflare.com` to CSP `script-src`, `style-src`, `img-src`, and `frame-src` directives to allow Cloudflare Turnstile CAPTCHA widget to fully load and render; changed referrer policy from `no-referrer` to `strict-origin-when-cross-origin` so Turnstile can verify the hostname for CAPTCHA validation |
| **2026-03-18** | | ✏️ **Inline File Rename** — clickable document title chip in header showing active file name (without `.md`); click to open rename modal with name pre-selected; title chip also added to Quick Action Bar (collapsed header) for always-visible rename access; both chips auto-sync on file switch, rename, or create; pencil icon appears on hover; responsive hiding on narrow screens (main header) with QAB always visible |
| **2026-03-18** | | 🎬 **Feature Demo Expansion** — 6 new demo recordings (Game Builder, Finance Dashboard, Text-to-Speech, OCR, Draw/Excalidraw, Media Embedding); demo badges now guarded to only render on Feature Showcase template (prevents false-positive keyword matches on user documents); product metadata updated to 136 templates across 14 categories (was 103/11); Feature Showcase template updated with Draw, Page View, View-Locked Sharing, and Turnstile sections; dev tooling stats updated (572 tests, Firestore validation, security scanner) |
| **2026-03-18** | | 🛡️ **Security Hardening** — postMessage origin validation: replaced all `postMessage(..., '*')` with `window.location.origin` in `draw-docgen.js` (~6 sites) and `excalidraw-embed.html` (~14 sites); added `e.origin` guard on all `message` listeners; removed API key forwarding via postMessage; Firestore rules: new `validView()` helper restricts `view` field to `ppt`/`preview`, added to all three rule branches (create quick/secure, update); Cloudflare Turnstile CAPTCHA integrated into email endpoint with server-side token verification; dual rate limiting (100/day global + 7/day per recipient address); new `scripts/security-check.sh` with 13 automated checks across 3 severity tiers, integrated into pre-commit hook; `tests/firestore/firestore-rules.test.js` with 21 zero-dependency validation tests; `npm run test:firestore` and `npm run security` scripts added |
| **2026-03-18** | | 🚀 **AI Diagram Generation** — natural language → Excalidraw JSON via LLM; new AI prompt section in `{{Draw:}}` cards with text input, model selector dropdown, and 🚀 Generate button; `EXCALIDRAW_CHEAT_SHEET` system prompt teaches LLM the element schema (rectangle, ellipse, diamond, text, arrow, line); `repairJson()` auto-fixes common LLM JSON mistakes (trailing commas, truncated output, missing brackets); `@model:` field in Draw tags for per-card model persistence; cancel/retry support; Gemini API key forwarding to Excalidraw embed; 37 new Playwright tests (22 draw-docgen, 7 readonly-mode, 8 excalidraw-library) + 5 regression pins |
| **2026-03-18** | | 🤖 **Draw AI Diagram Generation** — refactored `{{Draw:}}` AI generation to match Image/Git card pattern: always-visible prompt bar with per-card model selector dropdown + 🚀 Generate button; `excalidraw_diagram` task type with Excalidraw cheat sheet injected into AI workers; robust `repairJson()` pipeline handles common local-model JSON mistakes (trailing commas, stray quotes, truncated output, missing commas); last-resort individual object extraction recovers partial diagrams; removed duplicate ~300-line in-iframe AI bar from `excalidraw-embed.html`; 23 tests pass |
| **2026-03-18** | | 📷 **GLM-OCR Model** — added [GLM-OCR (1.5B)](https://huggingface.co/textagent/GLM-OCR-ONNX) as third local OCR model alongside Granite Docling and Florence-2; `ai-worker-glm-ocr.js` Web Worker using q4f16 quantization (~650 MB, WebGPU required); primary `textagent/GLM-OCR-ONNX` with `onnx-community/GLM-OCR-ONNX` fallback; `glm-ocr` entry in `ai-models.js` with `isDocModel: true`; documentation updated; 7 new Playwright model registry tests |
| **2026-03-18** | | 📚 **Excalidraw Library Browser** — 29 bundled library packs (600+ items) organized in 6 categories (Architecture & System Design, UI/UX & Wireframing, Icons & Logos, Cloud & DevOps, Data & Algorithms, AI/Science & Education) with slide-in Library Browser panel; each library card with name, description, and toggle switch for on-demand loading; real-time search/filter; injected via MutationObserver into Excalidraw's native Library sidebar as "📦 Browse & Add Library Packs" button; libraries include Software Architecture, System Design Components, AWS Icons, Google Icons (139 items), UML/ER, Wireframing, Deep Learning, Math Teacher, Charts, Graphs, and more |
| **2026-03-18** | | 🎨 **Draw DocGen Integration** — full `{{Draw:}}` tag pipeline: `transformDrawMarkdown` + `bindDrawPreviewActions` in renderer, 🎨 Draw toolbar button, `excalidraw.com` added to CSP `frame-src`, `draw-docgen.css` (309-line standalone stylesheet with card UI, tool pills, Mermaid editor, dark mode), `draw-docgen.js` lazy-loaded as Phase 3j; DOMPurify allowlist expanded with `data-draw-index`, `data-draw-tool`, `data-tool`, `data-skill` |
| **2026-03-17** | | 🎨 **Excalidraw Export Fix** — fixed broken Insert/PNG/SVG export buttons (`excalidrawAPI` was `null` due to Excalidraw 0.17+ using `excalidrawAPI` prop instead of `ref`); replaced canvas-scraping with native `exportToBlob`/`exportToSvg` APIs; Insert now replaces `{{Draw:}}` tag with image and closes whiteboard; inserted images use compact `gen-img:` registry (no raw base64 in editor) |
| **2026-03-17** | | 🔒 **View-Locked Sharing & Shared Versions** — sharers can lock recipients to PPT or Preview mode via new pill selector in share modal; view lock stored server-side in Firestore (tamper-proof — stripping `&view=ppt` from URL doesn't bypass); `setViewMode()` guard blocks mode switching; non-matching view buttons visually disabled; "Previously Shared" section in share modal shows past shares per document with timestamps, view-mode badges (PPT/Preview), secure badge, and Copy/Delete buttons; shared versions tracked in localStorage keyed by parent cloud doc ID |
| **2026-03-17** | | 🎨 **Three-Level Header & Read-Only Pill** — new three-level header visibility toggle (Full → Compact QAB → fully Hidden with floating "TextAgent" restore pill at top-center, 35% opacity, hover to reveal); header level persists via `localStorage`; "Read-only" shared-view pill repositioned from top-right to bottom-right corner with upward slide-in animation |
| **2026-03-17** | | 🎨 **Shared Banner Auto-Dismiss UX** — green "Viewing shared markdown (read-only)" banner now auto-hides after 4s with smooth slide-up animation; collapses to a floating green "🔒 Read-only" pill in the top-right corner; clicking the editor or pill re-expands the full banner with Edit Copy/Close buttons (auto-hides again after 5s); dynamic `SHARE_BASE_URL` uses `localhost` in dev and `textagent.github.io` in production |
| **2026-03-17** | | 🚀 **AI Worker Limits Upgrade** — raised all task-specific token limits to industry-standard values (e.g. `chat`/`generate`/`markdown` 512→8192, `expand`/`elaborate` 512→4096, `summarize` 256→2048, `autocomplete` 128→512); unified document context limits to 16K/32K chars across Qwen, Gemini, and Common workers; expanded chat history from 10→30 messages with 8x per-message content (500→4000 chars) |
| **2026-03-16** | | 🐛 **Hiragana Quiz & Kana Master Fix** — fixed Hiragana Quiz showing black screen due to double-escaped `</script>` tag preventing script execution; fixed Kana Master hearts (♥) and celebration emoji (🎌) rendering as literal escape sequences instead of Unicode characters |
| **2026-03-16** | | 🇯🇵 **Japanese Quiz Games & Game Gen Improvements** — 2 new prebuilt games: Hiragana Quiz (`@prebuilt: hiragana`, 12-kana falling-block quiz) and Kana Master (`@prebuilt: kanamaster`, full 46-kana with combos, levels, particles, screen shake); rewritten Canvas 2D/Three.js/P5.js engine prompts with strict completeness rules and 8K-char budget; `normalizeGameCdnUrls()` rewrites AI-generated CDN URLs to CSP-approved sources; `ensureModelReady()` pre-generation check; OpenRouter worker retry logic with exponential backoff for 500/502/503/429; CSP updated with `unpkg.com` and `threejs.org` script sources; prebuilt game count 6→8 |
| **2026-03-16** | | 🐛 **Debug Template Upgrade** — upgraded "Debug This Error" from single-pass AI prompt to 3-phase pipeline (Triage & Classify with 14-pattern common-fix lookup table → Root Cause & Fix with before/after diffs and DO/DON'T rules → Verify & Prevent via Agent multi-step with verification commands, preventive guard code, and related-issue sweep); added `language` and `codeSnippet` variables |
| **2026-03-16** | | 🤖 **5 New Agent Templates** — Performance Profiler (N+1 detection, memory leaks, O(n²) loops, caching strategy), Implementation Planner (feature→phased plan with task breakdown, risk assessment), Git Commit Reviewer (diff→conventional commits, breaking change detection, changelog), Deployment Checklist (stack→CI/CD pipeline, Docker config, rollback plan), Cost-Aware LLM Pipeline (model routing, budget tracking, fallback strategies) |
| **2026-03-16** | | 🎮 **Game Template Fixes** — fixed emoji encoding (HTML entities→native Unicode), wrapped localStorage in try/catch for sandboxed iframes, added Breakout touch events for mobile, removed duplicate code blocks from game template, added `allow-same-origin` to game iframe sandbox, added Canvas 2D arcade game templates (platformer, top-down shooter, rhythm, tile match, tower defense) |
| **2026-03-16** | | 📄 **Page View (A4 Document Mode)** — new split-layout "Page" view mode (editor left, A4 page frames right) with automatic content reflow into 210×297mm page frames; `<!-- pagebreak -->` HTML comment markers force new pages; `page-view.js` reflow engine measures element heights and distributes across pages; `page-view.css` with shadows, page numbers, dark mode, responsive mobile; button added to header/mobile/QAB; `setViewMode()` extended with `view-page` class and enter/exit lifecycle |
| **2026-03-16** | | 🛡️ **Security Scan Upgrade & ECC-Inspired Agents** — upgraded Security Scan from single-pass OWASP checklist to 3-step pipeline (Vulnerability Scan → Attack Simulation → Remediation Plan) with language/framework/scanDepth variables, ❌/✅ code patterns, A-F grading, and pre-deployment checklist; added 5 new ECC-inspired agent templates (TDD Guide, Database Review, Generate E2E Tests, API Design Review, Fix Build Errors) |
| **2026-03-16** | | 🤖 **Agent Templates Tab** — new Agents category with 9 specialized AI agent templates (Plan a Feature, Review My Code, Security Scan, Clean Up Code, Generate Docs, Python Review, Design Architecture, Debug This Error, SQL Optimizer); `bi-robot` icon; category pill in template modal; multi-step Agent pipelines with contextual variables |
| **2026-03-16** | | 📄 **Page View Mode** — new A4-style paginated document preview with `<!-- pagebreak -->` support; `page-view.js` + `page-view.css` modules; `data-pagebreak` renderer support |
| **2026-03-16** | | 📱 **Mobile Layout Gap Fix** — eliminated a massive white gap that appeared between the toolbar and editor/presentation preview on mobile devices (≤1080px) by fixing a CSS flexbox bug where the closed workspace sidebar still consumed vertical height in column mode |
| **2026-03-16** | | 🐛 **File-Switch State Reset** — fixed Run All button staying in "Stop" mode when switching .md files; fixed document variables leaking across files; new `resetFileSessionState()` in `workspace.js` aborts execution, force-resets `_running` flag, clears Run All button/progress bar/variables/exec context on every file switch; new `forceReset()` in `exec-controller.js` for immediate hard-reset of internal state |
| **2026-03-15** | | 🚀 **Run All Engine & TTS UX** — pre-execution model readiness check auto-loads all required models (AI + Kokoro TTS) before block execution starts; detailed `[RunAll]` console logging with `console.table` block summary, per-block timing, variable resolution status (✅/⚠), and completion summary; Stop button now works during model loading via `M._execAborted` cross-module flag; `ensureModelReadyAsync()` rewritten with fail-fast on missing consent/API key; compact preflight dialog (960px, smaller fonts, all 8 columns visible); `waitForModelReady()` handles Kokoro TTS via `M.tts.isKokoroReady()`; TTS card split into 3 buttons: ▶ Run (generate audio only), ▷ Play (replay stored audio), 💾 Save (download WAV); new `M.tts.generate()`, `playLastAudio()`, `isKokoroReady()`, `initKokoro()` APIs; AI model fallback in `run-requirements.js` correctly defaults to text models |
| **2026-03-14** | | 🔗 **AI Variable Controls** — new unified 🔗 Vars button on AI and Agent cards opens combined dropdown with 📤 Output Variable (text input to name the block's result) and 📥 Input Variables (checkbox picker listing declared `@var:` names from other blocks + runtime vars); variable chaining enables multi-block AI pipelines (`@var: research` → `@input: research`); declared variables appear before execution with "declared" badge; Doc Variables Panel (`{•} Vars` toolbar button) now shows ⏳ Pending Vars section for declared-but-unexecuted variables; `@var:` and `@input:` directives stripped from displayed prompt text |
| **2026-03-14** | | 🧠 **Think Mode Refinement & Multi-Select Search** — Think mode (`@think: Yes` / 🧠 toggle) now uses two-pass generation: first generates with thinking enabled, then passes the draft back to the model to add important details, examples, and missing information; removed complex ReAct pattern in favor of simple refinement; multi-select search provider dropdown on AI Generate and Agent Flow cards (checkbox pills, activate multiple engines simultaneously); search results fetched in parallel and merged |
| **2026-03-14** | | 🔑 **API Key Re-entry & Git UX** — fixed bug where incorrect cloud API keys couldn't be re-entered (dropdown re-click now re-shows key modal); "Change API Key" link in error status bar for auth failures; 🔑 key icon button on cloud model cards in DocGen setup panel with "Key Set"/"Key Required" badges; 🐙 Git toolbar button now shows centered confirmation dialog warning that local models have small context windows and cloud models (Groq, Gemini, OpenRouter) are recommended for repo analysis; Git analysis auto-opens API key modal on key/model-not-ready errors |
| **2026-03-13** | | 🔍 **Two-Phase Search UX** — search thinking block now shows a distinct "✨ Rewriting query…" phase with `bi-stars` icon before transitioning to "🌐 Searching the web…"; `createSearchThinkingBlock()` accepts `isRewriting` flag; `updateThinkingBlockQuery()` smoothly transitions inner status text; smart detection skips rewrite phase when model is unavailable or busy |
| **2026-03-13** | | 🔀 **Multi-Provider Parallel Search** — activate multiple search engines simultaneously; results from all active providers fetched in parallel via `Promise.all()`, deduplicated by URL, tagged with source, and grouped by provider for LLM context; new checkbox pill UI replaces single-select dropdown; per-pill 🔑 API key buttons; at least one provider always active; backward-compatible localStorage migration |
| **2026-03-13** | | 💬 **Chat History Memory** — AI chat now maintains conversation context across turns; `chatHistory` array tracks user/assistant messages (10-turn cap); LLM-powered `refineSearchQuery()` rewrites follow-up questions into self-contained web search queries via `M.requestAiTask()`; fallback proper-noun extraction when model is busy; all 5 workers (Qwen, Groq, OpenRouter, Gemini, LFM) inject history between system prompt and user message; "Clear Chat" resets memory; consolidated worker files to `public/` (deleted 6 root-level duplicates that shadowed source in Vite dev) |
| **2026-03-13** | | 🔍 **4 New Search Providers** — added Tavily (AI-optimized, returns clean summarized results for LLM injection, 1,000/mo free), Google Custom Search Engine (official Google results, 100/day free), Wikipedia API (free encyclopedia search), and Wikidata API (free structured knowledge); total providers now 7; updated all dropdown selectors (AI panel, AI cards, Agent cards); Wikipedia/Wikidata skip API key prompt |
| **2026-03-13** | | 🔍 **Search thinking block** — web search results now appear in a collapsible "thinking" `<details>` block *before* the AI response streams; two-phase UX: spinner appears instantly when search starts, populates with results (or "no results") when complete; source citation pills below; removed duplicate inline search details from AI response bubbles; fixed duplicate user message bug in `sendToAi()` dedup check |
| **2026-03-13** | | 📐 **LaTeX coding block** — new `📐 LaTeX` toolbar button in Coding dropdown inserts `$$...$$` display math blocks; default template `\frac{\sqrt{2025} + \sqrt{3025}}{\sqrt{25}}` evaluates to 20 via Nerdamer; MathJax renders in preview; Playwright test added |
| **2026-03-13** | | 🐛 **Run All output fix** — `▶ Run All` now renders output for every block (bash, JS, SQL, math); fixed `findBlockContainer` producing wrong CSS selectors for bash/JS containers; added `renderBlockOutput()` for DOM rendering during Run All; SQL default template changed to `CREATE TABLE IF NOT EXISTS` for idempotent re-runs; math default template now pre-assigns `x = 5` before `x^2 + 2*x + 1` |
| **2026-03-13** | | 📄 **Feature Showcase update** — synced in-app Feature Showcase template with all recent features; added 7 new rows to Features at a Glance table (Media Embedding, TTS, Game Builder, Finance Dashboard, Disk Workspace, Email to Self, Context Memory); 9 new dedicated sections with examples and tips; AI Document Tags table expanded to 9 tag types; AI model table expanded with Kokoro/Voxtral/Docling/Florence-2; Voice Dictation updated to dual-engine; 14 new task list items; Dev Tooling test count updated to 484 |
| **2026-03-13** | `2e0e2ec` | 🎮 **Game Builder** — new `{{@Game:}}` tag for AI-generated and pre-built interactive games in markdown; engine selector pills (Canvas 2D / Three.js / P5.js); `@prebuilt:` field for 6 instant games (chess, snake, shooter, pong, breakout, maths quiz for kids); 📋 Import button to paste or upload external HTML game code with source viewer/editor; 📥 Export as standalone HTML; ⛶ fullscreen mode; `game-prebuilts.js` pre-built HTML library; `game-docgen.js` standalone module; `game-docgen.css` with purple gaming aesthetic and dark mode; single-line field parsing with lookahead regex; "Games for Kids" template category with all 6 pre-built games and syntax reference; `srcdoc` added to DOMPurify whitelist; 🎮 Game toolbar button in AI Tags dropdown |
| **2026-03-12** | `9106fd1` | 🏷️ **@model Tag Field** — new `@model:` metadata field on all AI DocGen tag types (`{{@AI:}}`, `{{@Agent:}}`, `{{@Image:}}`, `{{@OCR:}}`, `{{@TTS:}}`, `{{@STT:}}`, `{{@Translate:}}`); persists selected model in document text for portability; intelligent defaults per tag type (OCR→`granite-docling`, TTS→`kokoro-tts`, STT→`voxtral-stt`, Image→`imagen-ultra`, AI/Agent→current model); dropdown shows all registered models, changing it syncs `@model:` back to editor; validated against `AI_MODELS` registry (invalid IDs silently ignored); fully backward-compatible with existing tags |
| **2026-03-12** | `ef63c42` | 🔧 **Model Loading UX** — smart cache vs download detection in all 7 AI workers (📦 Loading from cache / ⬇️ Downloading from huggingface.co/textagent/...); source location display showing HuggingFace model path during loading; 🗑️ Delete Model button in consent dialog to clear Cache API + OPFS cached files and reset consent; `deleteModelCache()` function exposed on `M._ai`; workers forward Transformers.js `status` field (`initiate`/`progress`/`done`) with `source` and `loadingPhase`; new `.ai-progress-source` info bar and `.ai-consent-btn-danger` styling with dark mode |
| **2026-03-12** | `e46a70d` | 🎤 **STT Tag Block & Florence-2 & TTS Download** — new `{{@STT:...}}` tag block for in-preview speech-to-text dictation with engine selector (Whisper V3 Turbo / Voxtral Mini 3B / Web Speech API), 11-language picker, Record/Stop/Insert/Clear buttons, amber-accented CSS with recording pulse animation; Florence-2 (230M) vision OCR+captioning model added (`textagent/Florence-2-base-ft`); TTS ⬇ Save button with float32→WAV encoder for audio download; PDF-to-image OCR renderer via pdf.js (2x scale, max 3 pages); Granite Docling migrated to `textagent/` with `onnx-community/` fallback, fp16 embed_tokens, degeneration loop guard, raw base64→data URL fix; Qwen3 AutoTokenizer fix for text-only models; OCR mode forwarding to doc-model workers |
| **2026-03-12** | `dbb571c`, `9d8059a` | 🧪 **Comprehensive Test Suite** — 12 new Playwright spec files (108 tests) across 5 categories targeting past 3 days of code changes: **Functional** — unit tests for video player (URL detection, HTML builders, embed grid), TTS engine (API surface, state), speech commands (DOM elements, language selector), file converters (MD/CSV/JSON/XML/HTML import), stock widget (rendering, sandbox, double-render prevention); integration tests for embed grid pipeline and AI_MODELS registry. **Regression** — 12 tests pinning recent bug fixes (file upload crash, template confirmation, stock variable, embed rendering, mermaid stability, dark mode, XSS). **Performance** — module init timing (TTS/STT/video/stock/converter < 5–8s), complex render < 5s, embed grid < 3s. **Static Analysis** — ESLint, file size < 100KB, debugger/eval detection, CSS !important audit, IIFE patterns, worker files, HTTPS enforcement. **Security** — embed grid XSS (javascript:/data: URI), video player HTML escaping, YouTube privacy mode, TradingView sandbox, Vimeo DNT, link security, CSP validation. Total test count: 299 |
| **2026-03-12** | `f7ca256` | 🎤 **Voxtral STT** — [Voxtral Mini 3B](https://huggingface.co/textagent/Voxtral-Mini-3B-2507-ONNX) as primary speech-to-text engine on WebGPU (~2.7 GB, q4, 13 languages, streaming partial output via `TextStreamer`); Whisper Large V3 Turbo as WASM fallback (~800 MB, q8); `voxtral-worker.js` new WebWorker with `VoxtralForConditionalGeneration` + `VoxtralProcessor`; `speechToText.js` WebGPU detection + dual-worker routing; download consent popup (`showSttConsentPopup`) with model name/size/privacy info before first download; `STT_CONSENTED` localStorage key; model duplicated to `textagent/` HuggingFace org with `onnx-community/` fallback |
| **2026-03-12** | `0f58296` | 🛡️ **Code Audit Fixes** — sandboxed `jsAdapter` in `exec-sandbox.js` (was raw `eval()` on main thread, now iframe-sandboxed); `mirror-models.sh` model IDs updated to `textagent`, Kokoro v1.0→v1.1-zh, GitLab refs removed; Whisper speech worker forwarded user's language selection instead of hardcoded English; shared `ai-worker-common.js` module extracts `TOKEN_LIMITS` + `buildMessages()` from 3 workers; cloud workers load as ES modules |
| **2026-03-12** | `591467b` | 🏠 **Model Hosting Migration** — all 7 ONNX models (Qwen 3.5 0.8B/2B/4B, Qwen 3 4B Thinking, Whisper Large V3 Turbo, Kokoro 82M v1.0/v1.1-zh) duplicated to self-owned [`textagent` HuggingFace org](https://huggingface.co/textagent); model IDs updated from `onnx-community/` to `textagent/` across all workers; automatic fallback to `onnx-community/` namespace if textagent models unavailable; GitLab mirror removed from runtime code |
| **2026-03-12** | `7b9f846` | 🔊 **Kokoro TTS** — hybrid text-to-speech engine: 9 languages (English, Japanese, Chinese, Spanish, French, Hindi, Italian, Portuguese) via [Kokoro 82M v1.0 ONNX](https://huggingface.co/textagent/Kokoro-82M-v1.0-ONNX) (~80 MB, off-thread WebWorker via `kokoro-js`), Korean, German & others via Web Speech API fallback; hover preview text → click 🔊 for pronunciation; voice auto-selection by language; `textToSpeech.js` main module + `tts-worker.js` WebWorker + `tts.css` styling; model-hosts.js for configurable hosting with auto-fallback |
| **2026-03-12** | `7b9f846` | 📷 **OCR Tag** — new `{{@OCR:}}` document tag for image-to-text extraction; amber-accented card with mode pills (Text/Math/Table); 📎 image upload with `@upload:` editor sync; Qwen model default; vision-capable model flags (`supportsVision`) on Qwen 3.5 Flash, 35B-A3B, and DeepSeek V3.2 |
| **2026-03-12** | `7b9f846`, `1ec8b90` | 🏗️ **Model Architecture** — ai-worker.js refactored for architecture-aware loading (`qwen3` text-only vs `qwen3_5` vision); `setModelId` accepts `architecture` + `dtype` params; automatic fallback to HuggingFace when primary host fails; `moonshine-medium-worker.js` deleted (replaced by unified `speech-worker.js`); Language Learning template with TTS pronunciation tips; SQLite-compatible SQL in Technical template |
| **2026-03-11** | `7b9f846` | ▶ **Run All Notebook Engine** — one-click `▶ Run All` button executes every code/tag block in document order; 11 runtime adapters (bash, math, python, html, js, sql, docgen-ai, docgen-image, docgen-agent, api, linux-script); Block Registry with FNV-1a stable IDs; Execution Controller with fixed-bottom progress bar, per-block status badges (pending/running/done/error), and abort support; SQLite `_exec_results` context store for cross-block data sharing; DocGen/API adapters use auto-accept mode (skip review panel); Linux adapter submits to Judge0 CE; deferred adapter queue for module loading order; `exec-engine.css` styling; 12 new Playwright tests (191 total) |
| **2026-03-11** | `8442426`, `30520b9` | 🎬 **Video Playback & Embed Grid** — video playback in markdown preview via `![alt](video.mp4)` image syntax with `.mp4/.webm/.ogg/.mov/.m4v` detection; YouTube/Vimeo auto-detected and rendered as privacy-enhanced `<iframe>` embeds; Video.js v10 lazy-loaded from CDN with native `<video>` fallback; new `embed` code block for responsive media grids (`cols=1-4`, `height=N`) auto-detecting video vs website URLs; website URLs render as rich link preview cards (favicon via Google Favicons API, domain, title, "Open ↗" button); dark/light mode styling; CSP updated (`media-src`, `frame-src`, `img-src`, `script-src`, `style-src`); DOMPurify whitelist expanded for video/iframe elements |
| **2026-03-11** | `79ed005`, `b7ca695` | 🏷️ **DocGen Preview Editing** — editable `@prompt:` textarea in AI/Image preview cards (bare text = static description label, `@prompt:` = actual AI instruction sent to model); editable `@step:` inputs in Agent Flow cards with debounced sync back to editor; 📎 image upload button on AI/Image/Agent cards with `@upload: filename` editor sync and thumbnail preview; `ensureModelReady()` helper prevents "AI model not ready" error (handles local download consent + cloud API key prompt); Image card model selector now includes vision/multimodal models with separator; description/prompt separation in parser (`block.description` vs `block.prompt`) |
| **2026-03-11** | `cce3dce`, `1ec8b90` | 🎤 **Speech-to-Text Enhancements** — dual-engine voice dictation (Web Speech API + **Whisper Large V3 Turbo** ONNX, WER ~7.7%) with consensus scoring; WebGPU acceleration (fp16) with WASM (q8) fallback; auto-punctuation enabled by default (AI refinement with 5s timeout + built-in capitalize/period fallback); 50+ voice commands with natural ASR-friendly aliases ("heading one"/"title" for H1, "undo"/"take that back", "add table"/"add link", "strikethrough…end strike", "ellipsis"/"open quote"); stronger hallucination filter (100-word max, non-ASCII rejection); streaming partial result display; improved model loading progress with file sizes |
| **2026-03-10** | `ce6051d` | 📈 **Stock Dashboard** — new Finance template category (3 templates: Stock Watchlist, Crypto Tracker, Market Overview) with live TradingView Advanced Chart widgets and 52-period EMA overlay; dynamic `data-var-prefix` grid engine expands one `stock-card` per non-empty variable; configurable `chartRange`, `chartInterval`, `emaPeriod` via `@variables` table; interactive 1M/1Y/3Y range + 52D/52W/52M EMA toggle buttons; `@variables` block persists after ⚡ Vars for re-editing; JS code block dynamically reads `$(cname*)` variables to generate grid HTML; `data-range`, `data-interval`, `data-ema` forwarded through DOMPurify; 179 Playwright tests pass |
| **2026-03-10** | — | 🛡️ **CSP Fix for Badges** — added `https://img.shields.io` to the `img-src` directive in `index.html` and `nginx.conf` Content-Security-Policy to allow GitHub license and version badges to render correctly; updated legacy domain to `textagent.github.io`. |
| **2026-03-10** | — | 🧪 **Toolbar Tags Tests Fix** — fixed 4 failing Playwright tests in `toolbar-tags.spec.js` by updating expected tag syntaxes to the new `@` prefix format (`{{@AI:}}`, `{{@Image:}}`, `{{@Agent:}}`), removing the deprecated `Think` tag test, and resolving a race condition where the test suite executed too fast by explicitly waiting for Phase 3 lazy-loaded modules (`M.formattingActions`) to register; added JSDoc types to silence TypeScript execution errors. |
| **2026-03-10** | — | 📸 **Help Mode & Feature Demos** — 6 new demo recordings (Workspace Sidebar, Context Memory, Help Mode, Email to Self, Disk Workspace, API & Linux Tags); 4 new README screenshots; 12 new Help Mode button entries (Memory Tag, File Tree, C++/Rust/Go/Java compile, 6 coding block languages); 4 updated help entries with more specific demos; Feature Demos DEMO_MAP expanded 9 → 24 entries; README now has 10 screenshots and 24 feature demos |
| **2026-03-10** | `b40eb1f`…`413a9d9` | 📚 **Context Memory** — `{{@Memory:}}` tag and `@use:` field for workspace intelligence; `js/context-memory.js` module with SQLite FTS5 full-text search (heading-aware chunking, ~1500 chars/chunk); three storage modes: browser-only (IndexedDB blob), disk workspace (`.textagent/memory.db`), external memory (IndexedDB blob); `@use: workspace, my-docs` in AI/Think/Agent tags auto-retrieves relevant context; `@` prefix on all tag types (`{{@AI:}}`, `{{@Agent:}}`, `{{@Memory:}}`, `{{@Image:}}`) and metadata fields (`@name`, `@use`, `@think`, `@search`, `@prompt`, `@step`); re-render on page refresh; backward-compatible with old format; amber-accented Memory card with Folder/Files/Rebuild buttons + stats display; reuses existing sql.js WASM (zero bundle size increase); 40 new Playwright tests (151 total) |
| **2026-03-10** | `33d3e10`…`8d386d5` | 🗂️ **Action Modal & Disk UI Polish** — replaced native `confirm()` and inline rename with unified `showActionModal()` for rename (input field, auto-selects filename), duplicate (blue confirmation), and delete (red destructive); header-only disk controls (refresh ↻, disconnect ✕) replacing footer bar; clickable folder name opens folder picker; same-name rename guard with toast feedback; duplicate tree auto-refresh after disk write; merged CI changelog check into deploy workflow (3→2 workflow runs per push); 10 new Playwright tests (112 total) |
| **2026-03-10** | `f572795`…`eb7f4dd` | 📂 **Disk-Backed Workspace** — new folder storage mode via File System Access API; "Open Folder" button in sidebar header; `.md` files read/written directly to disk; `.textagent/workspace.json` manifest; debounced autosave to disk ("💾 Saved to disk" indicator); refresh from disk for external changes; disconnect to revert to localStorage; auto-reconnect on reload via IndexedDB-stored handles; Chromium-only (hidden in unsupported browsers); 22 new Playwright tests |
| **2026-03-10** | `6444beb` | 🧹 **Clear Text Buttons** — new "Clear" group in formatting toolbar with Clear All (eraser icon) and Clear Selection (backspace icon); custom in-app confirmation modal with smooth animation (replaces flickering native `confirm()`); both undoable via Ctrl+Z; toast feedback; red-accented styling with dark/light theme; Help mode entries |
| **2026-03-09** | `b26e50b` | 🎨 **Template Icon Refresh** — main Template button updated from generic file icon to `bi-columns-gap` layout grid (header, mobile menu, QAB, modal header); 11 coding templates upgraded from generic `bi-cpu` to language-specific icons: C (`bi-braces`), C++ (`bi-braces-asterisk`), Rust (`bi-gear-wide-connected`), Go (`bi-arrow-right-circle`), Java (`bi-cup-hot`), Python Algorithms (`bi-graph-up`), TypeScript (`bi-filetype-tsx`), Ruby (`bi-gem`), Kotlin (`bi-hexagon`), Scala (`bi-diamond`), Compile & Run (`bi-play-circle`) |
| **2026-03-09** | `b26e50b` | 🐧 **Linux Group Expansion** — Linux toolbar group now shows 🐧 Linux + 🔷 C++ inline with `…` overflow dropdown for 🦀 Rust, 🐹 Go, ☕ Java; each inserts a `{{Linux:}}` compile-and-run tag with starter code; `.fmt-linux-group` CSS with green-accented border and `inline-flex` layout |
| **2026-03-09** | `b26e50b` | 💻 **Coding Tag Group** — new toolbar group with 🐚 Bash + 🔢 Math inline and `…` overflow dropdown for 🐍 Python, 🌐 HTML, ⚡ JS, 🗄️ SQL; AI Tags group also collapsed to AI + Think + `…` (Image, Agent, Fill); shared overflow dropdown CSS and JS handler in `coding-blocks.js` |
| **2026-03-09** | `d4ee2b9`, `2afc780` | 🧪 **Test Suite Expansion** — added 28 new Playwright tests across 5 spec files: email-to-self flow (validation, loading state, subject fallback, success/error feedback, localStorage persistence), secure share validation (password mismatch, length check, download-section visibility, filename sanitization, credentials content), startup sequencing (share/template/export/AI working without 5s sleep, no `M is not defined` errors), export content integrity (Markdown exact-match, HTML inline `<style>`, `data-theme`/`data-preview-theme` preservation, rendered vs raw output), persistence (theme, preview theme, stats pill, word-wrap, email survive reload) |
| **2026-03-09** | `b5cb10b`…`c4e9c68` | ✉️ **Email to Self** — share result modal includes "Email to Self" section; enter email → document is sent directly to inbox with share link + `.md` file attached; powered by Google Apps Script (free, 100 emails/day); loading state, success/error feedback; email persisted in localStorage; zero third-party dependencies |
| **2026-03-09** | `aa16645`, `5721a07` | 🔑 **Centralized Storage Keys** — created `js/storage-keys.js` as single source of truth for all ~20 localStorage key strings; replaced scattered raw string literals across 12 JS files with `M.KEYS.*` constants; eliminates storage-key drift bugs (e.g., `mdview-preview-theme` vs `md-viewer-preview-theme`) |
| **2026-03-09** | `ca4cbb6` | 🧩 **File Decomposition** — split 4 largest JS modules (~5,500 lines) into 14 focused files: `ai-assistant.js` → 4 modules (core, chat, actions, image); `ai-docgen.js` → 3 modules (core, generate, ui); `executable-blocks.js` → 4 modules (core bash, math, python, sandbox); `table-tools.js` → 3 modules (core, sort-filter, analytics); internal namespaces (`M._ai`, `M._docgen`, `M._exec`, `M._table`) for cross-module communication; phased dynamic imports in `main.js` |
| **2026-03-09** | `f9850a9` | ⚡ **Bundle Size Reduction** — lazy-loaded mermaid (~518 KB), deferred Phase 2–5 feature modules (AI, exporters, speech, templates, docgen) via `requestIdleCallback`, removed `manualChunks` Vite config; startup bundle reduced from ~4.6 MB to ~1.6 MB (65% reduction); converters, export, math, and mermaid chunks now load on demand |
| **2026-03-09** | `55090ba` | 🛠️ **Quality & Config Alignment** — fixed copy-button selector mismatch (`copy-md-button` → `copy-markdown-button`); unified preview-theme storage key to `md-viewer-preview-theme`; HTML export now self-contained with all CSS inlined + theme attributes; PDF export reuses shared rendering pipeline (`renderMarkdownToContainer`); aligned license to MIT across `package.json`, `LICENSE`, and `README`; unified changelog path to `changelogs/` in pre-commit hook + GitHub Actions; removed duplicate `public/firestore.rules` and `public/nginx.conf`; repaired desktop `prepare.js` (removed stale `script.js` copy) and updated `desktop-app/README.md`; added ESLint, Prettier, and Playwright with 4 smoke tests (import, export, share, view-mode) |
| **2026-03-08** | `a3661c2` | 🐧 **Compile & Run** — `{{Linux:}}` tag now supports `Language:` + `Script:` fields for compiling and executing 25+ languages (C, C++, Rust, Go, Java, Python, TypeScript, Kotlin, Scala, Ruby, Swift, Haskell, Dart, C#, PHP, Lua…) via [Judge0 CE](https://ce.judge0.com); inline output with stdout, stderr, compile errors, execution time & memory stats; 10 new language-specific coding templates |
| **2026-03-08** | `ed2d968` | 🐧 **Linux Terminal** — new `{{Linux:}}` tag opens a full Debian Linux terminal ([WebVM](https://webvm.io)) in a new browser window; `Packages:` field for package reminders with visual badges; persistent sessions via IndexedDB; toolbar 🐧 Terminal button; Linux Terminal coding template; fully independent module (`linux-docgen.js`) |
| **2026-03-08** | `bcca7e8` | 🔌 **API Component** — new standalone `{{API:}}` tag for REST API calls directly in markdown; supports GET/POST/PUT/DELETE methods, custom headers, JSON body, and `Variable:` to store response in `$(api_varName)`; toolbar GET/POST buttons insert templates; API cards render inline with method badge + URL; execute with ▶ button, review response with Accept/Regenerate/Reject; response variables accessible via ⚡ Vars table; fully independent module (`api-docgen.js`) separated from AI component |
| **2026-03-08** | `4981f79`…`222a0f6` | 🏷️ **Template display tags** — AI templates now show `AI` flavor tags; agent templates show `AI · Agent` tags on template cards for quick visual identification of template type |
| **2026-03-08** | `623b831` | 📜 **MIT License** — changed project license from Apache 2.0 to MIT for broader compatibility and simpler terms |
| **2026-03-08** | `31674b5` | 🎨 **New TextAgent icon** — new chalk-style icon replacing the old "M" icon; updated tagline to "Write with AI Agents — Markdown Editor & Viewer" |
| **2026-03-08** | `6facbf4` | ⬇️ **Agent auto-download** — Agent Flow now auto-downloads local AI model with inline progress bar if not already loaded; graceful fallback to cloud models when local model unavailable |
| **2026-03-08** | `d72ebce` | 🤖 **Agent Templates** — 15 complex agent templates in new Agents category: Data Science Pipeline, SQL Database Workshop, Full-Stack App Blueprint, AI Research Agent, DevOps Runbook, Financial Modeling, ML Model Evaluation, API Testing Suite, HTML Dashboard Builder, Competitive Intel, Algorithm Visualizer, System Design Document, Data Cleaning Toolkit, Project Retrospective, Science Lab Notebook; each showcases code, math, SQL, HTML, tables, mermaid, and AI tags |
| **2026-03-08** | `be5c804` | 🔗 **Agent Flow** — new `{{Agent:}}` markdown tag for multi-step AI pipelines; define steps with `Step 1: ...`, `Step 2: ...`; outputs chain sequentially; pipeline card with numbered steps + connecting arrows; per-card model selector + search provider dropdown (DuckDuckGo/Brave/Serper); live status indicators (⏳/✅/❌); API key prompt for paid search providers; combined output review with accept/reject/regenerate |
| **2026-03-08** | `be5c804` | 🔍 **Web Search** — AI assistant can now search the web; toggle search ON in AI panel header; 3 providers: DuckDuckGo (free, default), Brave Search (API key), Serper.dev (API key); search results prepended to LLM context; source citation links below AI responses; per-agent-card search provider selector |
| **2026-03-08** | `75e8d12` | 🧠 **LLM Memory overhaul** — fixed broken data flow (modular refactor regression); replaced generic format options with 5 useful formats: XML (structured tags), JSON (API-ready), Compact JSON (minified, ~60% token savings), Markdown (universal), Plain Text (no formatting); live per-format token count |
| **2026-03-08** | `1942e4e` | 🛠️ **Enhanced Quick Action Bar** — compact header now includes File Tree, Help, and collapsible Tools dropdown (Presentation, Zen Mode, Word Wrap, Focus Mode, Voice Dictation, Dark Mode with sun/moon toggle, Preview Theme picker with checkmarks); header toolbar slides behind AI panel instead of shrinking |
| **2026-03-08** | `1942e4e` | 🐛 **AI panel overlap fix** — header toolbar stays full-width when AI panel opens; sub-header elements (content, dropzone, formatting toolbar) receive `margin-right` to avoid overlap; AI panel overlays naturally via z-index |
| **2026-03-08** | `b835fb3` | 🐛 **AI worker fix** — fixed "Model unavailable" error caused by CSP missing `huggingface.co` in `connect-src` and static ES module import silently crashing the worker; converted to dynamic `import()` with try/catch for graceful error reporting and retry support |
| **2026-03-07** | `a0b6d64` | 🤖 **Multi-size local Qwen models** — added Qwen 3.5 Medium (2B, ~1.2 GB) and Large (4B, ~2.5 GB) alongside existing Small (0.8B); per-model workers with independent consent tracking; high-end device warning popup before 4B download; dynamic model ID via `setModelId` message to shared `ai-worker.js` |
| **2026-03-07** | `8eae1da` | 📂 **Workspace sidebar** — multi-file support with sidebar file tree (`Ctrl+B` toggle); create, rename, duplicate, and delete files; per-file localStorage persistence; right-click context menu; active file highlighting; "New" button creates files in workspace instead of new tabs |
| **2026-03-07** | `0c50d2f` | 📱 **Mobile toolbar overflow fix** — Quick Action Bar and formatting toolbar now horizontally scrollable on mobile/tablet instead of overflowing; `overflow-x: hidden` on page; header collapse disabled at sub-desktop widths; GitHub link and Help pill hidden on phones for compact layout |
| **2026-03-07** | `8d92678` | 🛡️ **Security hardening v2** — Content Security Policy (CSP) with full CDN allowlist; Firestore write-token ownership to prevent anonymous document overwrites; API keys moved from URL query strings to `x-goog-api-key` headers; `postMessage` origin validation for sandboxed iframes; password minimum increased to 8 characters; Firestore rules fixed for secure-share documents |
| **2026-03-07** | `44e8e20` | 🐛 **QAB Export fix** — added missing LLM Memory option to the Quick Action Bar Export dropdown, matching the main header Export menu |
| **2026-03-07** | `39f2e63` | 🎥 **Demo mapping audit** — fixed 10 incorrect Help Mode demo mappings; recorded 6 new dedicated demo videos (AI Model Selector, Sync Scrolling, Table of Contents, Voice Dictation, AI Doc Tags, Template Variables); total demos increased from 10 to 16 |
| **2026-03-07** | `83fce8c` | ❓ **Interactive Help Mode** — teal ❓ Help pill in header activates learning mode; all buttons get teal ring highlights; click any button for popover with feature name, description, keyboard shortcut, and ▶ Watch Demo button; demo videos play in a 50% screen dark panel with fullscreen expand; all 9 product demos mapped to ~35 toolbar buttons; Esc key navigation; AI Document Tags inline-code rendering fix |
| **2026-03-07** | `a3f4263` | ▶ **Feature demo badges** — clickable ▶ Demo badges on Feature Showcase headings open fullscreen animated video modal; 9 features mapped to demo videos; right-click + D shortcut; teal gradient badge with dark mode support |
| **2026-03-07** | `28d07a4`, `a275c28` | 🎬 **Product demo videos** — 9 animated WebP demos added to README (Privacy Hero, AI Assistant, Templates Gallery, Code Execution, Presentation Mode, Table Tools, Writing Modes, Import/Export, Encrypted Sharing) showcasing all key features with feature descriptions |
| **2026-03-07** | `87d664e` | 🔀 **Template variables** — `$(varName)` substitution engine; in-editor variable table with ⚡ Vars button; auto-detect mode (type variables anywhere → click Vars → table generated → fill → apply); 7 built-in globals (`$(date)`, `$(time)`, etc.); 12 templates updated with variable support for instant reusability |
| **2026-03-06** | `76f5b81` | 🤖 **AI templates** — new AI category with 13 AI-powered templates (Business Proposal, Research Paper, PRD, Marketing Copy, Lesson Plan, RFC, Cover Letter, SWOT, Content Calendar, Stock Research, Financial Analysis, Investment Thesis, Portfolio Review); one-click `{{AI:}}` / `{{Think:}}` document generation |
| **2026-03-06** | `70a6cda` | 🐛 **Initial render fix** — fixed preview pane not rendering on first page load by adding forced re-render after app initialization |
| **2026-03-06** | `35d700a`, `c612fdc` | 🖼️ **IMAGE tag support** — new `{{Image: ...}}` AI tag generates images from text prompts via Gemini Imagen; dedicated image model selector per card; AI worker pipelines for image generation |
| **2026-03-06** | `36cab73` | 🏷️ **AI Tags button group** — AI, Think, and Fill toolbar buttons grouped into a visually distinct "AI Tags" cluster with shared styling and separator |
| **2026-03-06** | `c612fdc` | 🎯 **Per-card model selection** — each generated AI card shows a model dropdown to switch models before regenerating; image-specific models filtered into Image tag cards |
| **2026-03-06** | `e28b59a` | 🌿 **Evergreen theme** — new green-toned preview theme with light and dark variants, custom syntax highlighting, code block, and table styling |
| **2026-03-06** | `8745921` | 🧩 **Independent AI block operations** — each `{{AI:}}` / `{{Think:}}` block generates, reviews, accepts, rejects, and regenerates independently; per-block state tracking with concurrent generation; text-based tag replacement (no index shifting bugs) |
| **2026-03-06** | `35d700a` | ⏳ **Generation loading states** — placeholder cards pulse with teal glow and show "Generating..." during AI generation; action buttons dimmed until complete |
| **2026-03-06** | `35d700a` | 🧠 **Think mode cleanup** — improved prompts suppress raw reasoning chains; `cleanGeneratedOutput()` strips `<thinking>` tags, reasoning loops, and meta-commentary from output |
| **2026-03-06** | `35d700a` | ⬇️ **Inline model download** — local models show "Download (~500 MB)" dialog directly in generation flow instead of redirecting to AI panel |
| **2026-03-06** | `e28b59a` | 🔀 **Split view default** — shared documents now open in split view (editor + preview) instead of preview-only mode |
| **2026-03-06** | `69a914b`, `bc688a1` | 📊 **Table spreadsheet tools** — interactive toolbar on every rendered table: Sort, Filter, Search, Stats (Σ), Chart (canvas bar chart), Add Row/Col, Copy CSV/MD, Download CSV, inline cell editing (double-click to edit) |
| **2026-03-06** | `bc688a1` | 📋 **Table templates** — 5 new complex table templates (Sales Dashboard, Project Tracker, Financial Report, Employee Directory, Competitive Analysis) in new Tables category |
| **2026-03-05** | | ⚡ **Performance optimizations** — 2-5x faster load: lazy-loading libraries, optimized rendering, improved build chunking, debounced keystroke processing |
| **2026-03-05** | | 🔧 **Vite build pipeline** — migrated to Vite for development and production builds with GitHub Pages deployment |
| **2026-03-05** | | 🛡️ **Changelog enforcement** — pre-commit hook requires a CHANGELOG-*.md file with every code commit |
| **2026-03-05** | | 🎨 **Toolbar overflow menu** — kebab menu for overflowed toolbar items at narrow widths, theme controls moved into overflow |
| **2026-03-05** | | 🌙 **FOUC fix** — prevent white→dark flash on page reload with inline theme detection script |
| **2026-03-05** | | 🧩 **Quiz templates + html-autorun** — new Quiz category with interactive HTML quizzes that auto-run on render; `html-autorun` code fence hides source and shows output directly |
| **2026-03-05** | | ⚙️ **Centralized AI model config** — all model definitions moved to `js/ai-models.js`; dropdown built dynamically; easy to add new providers |
| **2026-03-05** | | 🔄 **Gemini 3.1 Flash Lite** — upgraded from Gemini 2.0 Flash to Gemini 3.1 Flash Lite for improved performance |
| **2026-03-05** | | 🔐 **Password-protected sharing** — optional password on shared links with unlock modal; share options dialog for link + password vs. open link |
| **2026-03-05** | | 🧠 **Enhanced AI context menu** — column-based layout with writing assistance actions (Polish, Formalize, Elaborate, Shorten) alongside existing quick actions |
| **2026-03-05** | | 📊 **Inline AI progress bar** — model download and connection status shown inline in the AI panel header |
| **2026-03-05** | | 📦 **Template modularization** — split `templates.js` (3080→206 lines) into 7 category-based files under `js/templates/` for maintainability |
| **2026-03-05** | | ⚡ **JavaScript sandbox** — execute JS in sandboxed iframe with `console.log/warn/error` capture and inline output display |
| **2026-03-05** | | 🗄️ **SQL sandbox** — run SQL queries on in-memory SQLite database (sql.js WASM) with formatted table output and persistent tables across blocks |
| **2026-03-05** | | 🐍 **Python sandbox** — run Python code in browser via Pyodide (CPython WASM), with stdout/stderr capture and matplotlib support |
| **2026-03-05** | | 🌐 **HTML sandbox** — live HTML/CSS/JS preview in secure sandboxed iframe with auto-resize |
| **2026-03-05** | | 💻 **6 Coding templates** — Python Playground, HTML Playground, Bash Scripting, JavaScript Sandbox, HTML+JS Interactive, SQL Playground |
| **2026-03-05** | | 🔒 **Read-only shared links** — shared documents are now protected; Edit Copy creates a local fork instead of overwriting the original |
| **2026-03-05** | | 🖼️ **Image backgrounds for PPT templates** — 5 presentation templates with Unsplash image backgrounds |
| **2026-03-05** | | 🧮 **LaTeX evaluation improvements** — reserved constant handling (E, π), unsupported construct detection (limits, integrals, partials) |
| **2026-03-05** | | 🎬 **Enhanced presentation mode** — multiple layouts (title, section, two-column, image), transitions, speaker notes, overview grid |
| **2026-03-05** | | 📊 **20+ PPT templates** — new PPT category with professional slide decks and background rendering |
| **2026-03-05** | | 🎤 **Voice dictation** — speech-to-text with Markdown-aware commands (hash headings, bold, italic, lists, code, links) |
| **2026-03-05** | | 🛡️ **Security hardening** — SRI integrity hashes, XSS fixes, ReDoS protection, encrypted API key storage, Firestore security rules |
| **2026-03-05** | | 🧱 **Codebase modularization** — `script.js` refactored into 13 focused modules for maintainability |
| **2026-03-05** | | 🧮 **Executable math blocks** — evaluate math expressions in preview using Nerdamer (algebra, calculus, trig) |
| **2026-03-05** | | 📚 **6 new templates** — Coding and Maths categories with interactive bash and math blocks |
| **2026-03-05** | | 🎨 **Template UI polish** — category pill tabs, improved card layout, better spacing |
| **2026-03-05** | | ✨ **AI writing tags** — Polish, Formalize, Elaborate, Shorten actions for selected text or full document |
| **2026-03-05** | | 📄 **Feature Showcase as default** — comprehensive showcase loads on first visit |
| **2026-03-04** | `02324cc` | 🏷️ **Rebranded to TextAgent** — new display name across all pages, meta tags, and templates |
| **2026-03-04** | | 🔄 **Non-blocking AI panel** — AI panel opens instantly; Qwen download deferred until first use |
| **2026-03-04** | | 🧩 **Multi-model AI selector** — switch between Qwen (local), Groq Llama 3.3, Gemini, and OpenRouter |
| **2026-03-04** | | 🌐 **Google Gemini** — free-tier Gemini AI model with SSE streaming and 1M tokens/min |
| **2026-03-04** | | 🔀 **OpenRouter AI** — access free auto-routed models via OpenRouter API |
| **2026-03-04** | | 📂 **File format converters** — import DOCX, XLSX/XLS, CSV, HTML, JSON, XML, and PDF |
| **2026-03-04** | | 🖥 **Desktop app** — native desktop version via Neutralino.js with system tray and offline support |
| **2026-03-04** | | 📐 **Resizable AI panel** — three-column layout (Editor ∣ Preview ∣ AI) with draggable resize |
| **2026-03-04** | | ☁️ **Groq Llama 3.3 70B** — cloud AI model via Groq API |
| **2026-03-04** | | 🖥️ **Executable bash blocks** — run bash commands in preview via [just-bash](https://justbash.dev/) |
| **2026-03-04** | | 🤖 **AI Assistant (Qwen 3.5)** — local AI: summarize, expand, rephrase, grammar-check, explain, simplify, auto-complete |
| **2026-03-04** | | 🧠 **AI context menu** — select text, right-click for quick AI actions |
| **2026-03-04** | | ☁️ **Cloud auto-save** — periodic encrypted backup to Firebase Firestore |
| **2026-03-04** | | 🌱 **PlantUML diagrams** — render PlantUML inside Markdown with live preview |
| **2026-03-04** | | 📝 **Word wrap toggle** — switch editor word-wrap on or off |
| **2026-03-04** | | 🎯 **Focus mode** — distraction-free writing with dimmed surrounding paragraphs |
| **2026-03-04** | | 🔥 **Firebase Firestore sharing** — short share URLs via Firestore |
| **2026-03-04** | | 🛠 **Formatting toolbar** — bold, italic, strikethrough, heading, link, image, code, lists, table, undo/redo |
| **2026-03-04** | | 🔍 **Find & Replace** — search and replace with regex support |
| **2026-03-04** | | 📑 **Table of Contents** — auto-generated, clickable sidebar TOC |
| **2026-03-04** | | 💾 **Auto-save** — content saved to localStorage and restored on reload |
| **2026-03-04** | | 🧘 **Zen mode** — minimal full-screen editor view (`Ctrl+Shift+Z`) |
| **2026-03-04** | | 🎞 **Slide presentation** — present Markdown as slides using `---` separators |
| **2026-03-04** | | 📌 **Callout blocks** — `> [!NOTE]`, `> [!WARNING]`, etc. styled |
| **2026-03-04** | | 📝 **Footnotes** — `[^1]` footnote syntax with back-references |
| **2026-03-04** | | ⚓ **Anchor links** — click headings to copy anchor URLs |
| **2026-03-04** | | 🖼 **Image paste** — paste images from clipboard as base64 |
| **2026-03-04** | | 🎨 **Preview themes** — GitHub, GitLab, Notion, Dracula, Solarized |
| **2026-03-04** | | 🖥 **View modes** — Split, Editor-only, Preview-only with draggable divider |
| **2026-03-04** | | 📄 **New document** — one-click button to start fresh |
| **2026-03-04** | | 📱 **Mobile menu** — dedicated responsive sidebar menu |
| **2026-03-04** | | 📑 **Smart PDF export** — page-break detection, cascading adjustments, graphic scaling |
| **2026-03-03** | | 🔐 **Encrypted sharing** — AES-256-GCM encrypted markdown sharing |
| **2026-03-03** | | 🌐 **GitHub Pages deployment** — hosted on `textagent.github.io` |
| **2026-03-03** | | 📖 **README overhaul** — comprehensive docs with screenshots |
| **2026-03-01** | | 🐛 **Mermaid toolbar UX** — copy button label, toolbar order, modal size improvements |
| **2026-02-28** | | ✨ **Code review polish** — rounded dimensions, CSS variable backgrounds |
| **2026-01-10** | | 🔧 **Scroll & toolbar UI** — scroll behavior improvements, toolbar refinements |
| **2025-09-30** | | 📄 **PDF export refactor** — improved PDF generation |
| **2025-05-09** | | 🖨 **PDF rendering fixes** — PDF export bug fixes |
| **2025-05-01** | | 🎨 **New UI & dark mode fixes** — refreshed interface |
| **2024-04-12** | | 📊 **Reading stats** — word count, character count, reading time |
| **2024-04-09** | | 🚀 **Initial commit** — TextAgent project created |

---

<div align="center">
    <p>Created with ❤️ by the <a href="https://github.com/Textagent">TextAgent</a> team</p>
</div>
