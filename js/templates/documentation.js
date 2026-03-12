// ============================================
// templates/documentation.js — Documentation Templates
// ============================================
window.__MDV_TEMPLATES_DOCUMENTATION = [
  {
    name: 'Feature Showcase',
    category: 'documentation',
    icon: 'bi-stars',
    description: 'Explore every TextAgent feature: AI, diagrams, math, code, presentations, and more',
    content: '# 🚀 Welcome to TextAgent\n\n' +
      '> Your all-in-one Markdown editor with live preview, AI assistance, executable code, and powerful export options — **100% client-side, zero tracking.**\n\n' +
      '---\n\n' +
      '## ✨ All Features at a Glance\n\n' +
      '| Category | Features |\n' +
      '|:---------|:---------|\n' +
      '| **Editor** | Live preview · Split/Editor/Preview modes · Sync scrolling · Formatting toolbar · Find \\& Replace (regex) · Word wrap toggle · Draggable resize divider · Clear All / Clear Selection buttons |\n' +
      '| **Writing Modes** | Zen mode (distraction-free) · Focus mode (dimmed paragraphs) · Dark mode · 6 preview themes (GitHub, GitLab, Notion, Dracula, Solarized, Evergreen) |\n' +
      '| **Rendering** | GitHub Styling · Syntax Highlighting (180+ langs) · LaTeX Math (MathJax) · Mermaid Diagrams (zoom/pan/export) · PlantUML · Callout blocks · Footnotes · Emoji · Anchor links |\n' +
      '| **🎬 Media Embedding** | Video playback via `![alt](video.mp4)` syntax · YouTube/Vimeo auto-embeds · `embed` code block for responsive media grids (`cols=1-4`, `height=N`) · Video.js v10 with native fallback · Website URLs as rich link preview cards |\n' +
      '| **🤖 AI Assistant** | 3 local Qwen 3.5 sizes (0.8B / 2B / 4B via WebGPU/WASM) · Gemini 3.1 Flash Lite · Groq Llama 3.3 70B · OpenRouter — summarize, expand, rephrase, grammar-fix, explain, simplify, auto-complete; AI writing tags; per-card model selection; smart model loading UX (cache vs download, delete cached models) |\n' +
      '| **🏷️ AI Document Tags** | `{{@AI:}}` text · `{{@Think:}}` reasoning · `{{@Image:}}` images · `{{@Memory:}}` context · `{{@Agent:}}` pipelines · `{{@OCR:}}` image-to-text (Text/Math/Table, Granite Docling, Florence-2) · `{{@TTS:}}` speech · `{{@STT:}}` dictation · `{{@Translate:}}` translation · `{{@Game:}}` game builder — `@model:` per-card persistence · `@upload:` image/PDF · `@prompt:` editable textareas · concurrent blocks |\n' +
      '| **🔌 API Calls** | `{{API:}}` REST API integration — GET/POST/PUT/DELETE · custom headers · JSON body · response stored in `$(api_varName)` · inline review panel · toolbar GET/POST buttons |\n' +
      '| **🔗 Agent Flow** | `{{@Agent:}}` multi-step pipelines — chain @step 1→2→3, output feeds next step · per-card model + search provider selector · live status indicators |\n' +
      '| **🔍 Web Search** | Toggle web search for AI — DuckDuckGo (free) · Brave Search · Serper.dev — search results injected into LLM context · source citations |\n' +
      '| **🐧 Linux Terminal** | `{{Linux:}}` tag — Terminal mode (opens full Debian Linux via WebVM) · Compile \\& Run mode (`Language:` + `Script:`) compiles 25+ languages via Judge0 CE with inline output and execution stats |\n' +
      '| **🔀 Template Variables** | `$(varName)` substitution · 7 built-in globals · Auto-detect mode · ⚡ Vars button |\n' +
      '| **🎤 Voice Dictation** | Dual-engine STT: Voxtral Mini 3B (WebGPU, 13 languages) or Whisper Large V3 Turbo (WASM fallback) with consensus scoring · 50+ Markdown voice commands · Auto-punctuation via AI refinement |\n' +
      '| **🔊 Text-to-Speech** | Hybrid Kokoro TTS — English/Chinese via Kokoro 82M v1.1-zh (~80 MB, WebWorker) · Japanese \\& 10+ languages via Web Speech API · Hover text → 🔊 pronunciation · ⬇ Save as WAV |\n' +
      '| **Code** | ▶ Bash · ▶ Math · 🐍 Python · 🌐 HTML Sandbox (`html-autorun` for widgets/quizzes) · ⚡ JavaScript · 🗄️ SQL (SQLite) · 🐧 Compile \\& Run (25+ languages via Judge0 CE) |\n' +
      '| **Import** | MD · DOCX · XLSX/XLS · CSV · HTML · JSON · XML · PDF — drag \\& drop or click to import |\n' +
      '| **Export** | Markdown · Self-contained styled HTML (all CSS inlined, theme preserved) · PDF (smart page-breaks) · LLM Memory (5 formats + shareable link) |\n' +
      '| **Sharing** | ☁️ AES-256-GCM encrypted sharing via Firebase · Optional passphrase protection · Read-only shared links · ✉️ Email to Self |\n' +
      '| **Presentation** | Slide mode · Multiple layouts \\& transitions · Speaker notes · Overview grid · 20+ PPT templates with image backgrounds |\n' +
      '| **Desktop** | Native app via Neutralino.js with system tray and offline support |\n' +
      '| **🎮 Game Builder** | `{{@Game:}}` tag — AI-generated games (Canvas 2D / Three.js / P5.js) or pre-built via `@prebuilt:` (chess, snake, shooter, pong, breakout, maths quiz) · 📋 Import HTML · 📥 Export standalone · ⛶ Fullscreen |\n' +
      '| **📈 Finance Dashboard** | Stock/crypto/index templates with live TradingView charts · Dynamic grid via `data-var-prefix` · Configurable chart range, interval, EMA period · Interactive toggle buttons |\n' +
      '| **❓ Help Mode** | Interactive learning — click ❓ Help to highlight all buttons · Click any for description + shortcut + ▶ Watch Demo · 50% screen demo panel with fullscreen expand · 16 demo videos |\n' +
      '| **💾 Disk Workspace** | Folder-backed storage via File System Access API · .md files read/written to disk · Autosave with 💾 indicator · Refresh from disk · Auto-reconnect on reload |\n' +
      '| **✉️ Email to Self** | Send documents to inbox from share modal · .md attachment + share link · Google Apps Script (free, 100/day) · Email persisted in localStorage |\n' +
      '| **🧠 Context Memory** | `{{@Memory:}}` tag — SQLite FTS5 full-text search · Heading-aware chunking · Three storage modes (browser, disk, external) · `@use:` field for AI/Think/Agent context retrieval |\n' +
      '| **Extras** | Auto-save (localStorage + cloud) · Table of Contents · Image paste · ' + window.MDView.PRODUCT.summaryParen() + ' · Table spreadsheet tools · Content statistics · Modular codebase · Multi-file workspace sidebar (Ctrl+B) · Compact header with Quick Action Bar |\n' +
      '| **▶ Run All** | One-click notebook execution — runs all code blocks, AI tags, API calls, and Linux compiles in document order · 11 runtime adapters · Progress bar with abort · Per-block status badges · SQLite shared context store |\n' +
      '| **Dev Tooling** | ESLint + Prettier · 484 Playwright tests (smoke, feature, integration, dev, regression, performance, quality, security) · Pre-commit changelog enforcement · GitHub Actions CI |\n\n' +
      '---\n\n' +
      '## 💻 Six Executable Languages\n\n' +
      'TextAgent can **run code directly in the preview** — no server needed! All execution happens in the browser via WebAssembly or sandboxed iframes.\n\n' +
      '| Language | Runtime | Button |\n' +
      '|:---------|:--------|:-------|\n' +
      '| **Bash** | [just-bash](https://justbash.dev/) (WASM) | ▶ Run |\n' +
      '| **Math** | [math.js](https://mathjs.org/) | ▶ Evaluate |\n' +
      '| **Python** | [Pyodide](https://pyodide.org/) (WASM CPython) | ▶ Run |\n' +
      '| **HTML** | Sandboxed iframe | ▶ Preview |\n' +
      '| **JavaScript** | Sandboxed iframe | ▶ Run |\n' +
      '| **SQL** | [sql.js](https://sql.js.org/) (SQLite WASM) | ▶ Run |\n\n' +
      '---\n\n' +
      '## 🐧 Compile \\& Run — 25+ Languages\n\n' +
      'Compile and execute programs in **C++, Rust, Go, Java, Python, TypeScript, Kotlin, Scala**, and more — powered by [Judge0 CE](https://ce.judge0.com).\n\n' +
      '**How it works:**\n' +
      '1. Write a `{{Linux:}}` tag with `Language:` and `Script: |` fields\n' +
      '2. Click **▶ Run** — code is compiled and executed server-side\n' +
      '3. Output (stdout, stderr, compile errors) appears inline with execution time and memory stats\n\n' +
      '```\n' +
      '{{Linux:\n' +
      '  Language: rust\n' +
      '  Script: |\n' +
      '    fn main() {\n' +
      '        println!("Hello from Rust!");\n' +
      '    }\n' +
      '}}\n' +
      '```\n\n' +
      '> [!TIP]\n' +
      '> Check out the **Coding** category in Templates for 10 language-specific Compile \\& Run templates!\n\n' +
      '---\n\n' +
      '## 🖥️ Executable Bash Blocks\n\n' +
      'Run bash commands **directly in the preview** — powered by [just-bash](https://justbash.dev/).\n' +
      'Hover over any bash code block and click **▶ Run**:\n\n' +
      '```bash\n' +
      'echo "Hello from TextAgent! 🎉"\n' +
      '```\n\n' +
      '```bash\n' +
      'echo "Today is $(date +%A), $(date +%B\\ %d,\\ %Y)"\n' +
      '```\n\n' +
      '```bash\n' +
      'for i in 1 2 3 4 5; do echo "Count: $i"; done\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🔢 Executable Math Blocks\n\n' +
      'Evaluate math expressions **right in the preview** — powered by [math.js](https://mathjs.org/).\n' +
      'Hover over a `math` block and click **▶ Evaluate**:\n\n' +
      '```math\n' +
      '2 + 3 * 4\n' +
      'sqrt(144)\n' +
      'sin(pi / 2)\n' +
      'log(1000, 10)\n' +
      '```\n\n' +
      '```math\n' +
      '// Unit conversions\n' +
      '5 inch to cm\n' +
      '100 fahrenheit to celsius\n' +
      '```\n\n' +
      '```math\n' +
      '// Matrix operations\n' +
      'det([1, 2; 3, 4])\n' +
      'inv([1, 2; 3, 4])\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🐍 Python Sandbox\n\n' +
      'Run Python code **directly in the browser** — powered by [Pyodide](https://pyodide.org/) (WebAssembly CPython).\n' +
      'Hover over a `python` block and click **▶ Run** (first run loads ~11 MB runtime, then cached):\n\n' +
      '```python\n' +
      'import math\n\n' +
      'print(f"π = {math.pi:.10f}")\n' +
      'print(f"e = {math.e:.10f}")\n' +
      'print(f"10! = {math.factorial(10)}")\n\n' +
      '# Fibonacci sequence\n' +
      'def fib(n):\n' +
      '    a, b = 0, 1\n' +
      '    for _ in range(n):\n' +
      '        a, b = b, a + b\n' +
      '    return a\n\n' +
      'for i in range(1, 11):\n' +
      '    print(f"fib({i}) = {fib(i)}")\n' +
      '```\n\n' +
      '```python\n' +
      '# Data processing\n' +
      'data = [{"name": "Alice", "score": 95}, {"name": "Bob", "score": 87}, {"name": "Carol", "score": 92}]\n' +
      'avg = sum(d["score"] for d in data) / len(data)\n' +
      'print(f"Average score: {avg:.1f}")\n' +
      "print(f\"Top scorer: {max(data, key=lambda d: d['score'])['name']}\")\n" +
      '```\n\n' +
      '---\n\n' +
      '## 🌐 HTML Sandbox\n\n' +
      'Preview HTML/CSS/JS **live in the browser** — rendered inside a secure, sandboxed `<iframe>`.\n' +
      'Hover over an `html` block and click **▶ Preview** to see it rendered:\n\n' +
      '```html\n' +
      '<style>\n' +
      '  body { font-family: system-ui; text-align: center; padding: 20px; }\n' +
      '  .box { width: 80px; height: 80px; margin: 20px auto;\n' +
      '         background: linear-gradient(135deg, #667eea, #764ba2);\n' +
      '         border-radius: 12px; animation: spin 2s infinite linear; }\n' +
      '  @keyframes spin { to { transform: rotate(360deg); } }\n' +
      '</style>\n' +
      '<h2 style="color: #667eea;">Hello from the Sandbox!</h2>\n' +
      '<div class="box"></div>\n' +
      '<p>This HTML, CSS, and JS runs inside a secure iframe.</p>\n' +
      '```\n\n' +
      '```html\n' +
      "<button onclick=\"document.getElementById('c').textContent = ++n\">Click me!</button>\n" +
      '<p>Count: <span id="c">0</span></p>\n' +
      '<script>let n = 0;</script>\n' +
      '```\n\n' +
      '---\n\n' +
      '## ⚡ JavaScript Sandbox\n\n' +
      'Run JavaScript code with **console.log capture** — output appears inline.\n' +
      'Hover and click **▶ Run**:\n\n' +
      '```javascript\n' +
      '// JavaScript runs in a sandboxed iframe\n' +
      'console.log("Hello from JavaScript!");\n' +
      'console.log("2 + 2 =", 2 + 2);\n\n' +
      'const arr = [5, 3, 8, 1, 9, 2];\n' +
      'console.log("Sorted:", arr.sort((a, b) => a - b));\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🗄️ SQL Sandbox\n\n' +
      'Run SQL queries on an **in-memory SQLite database** — results display as formatted tables.\n' +
      "Tables persist across blocks on the same page, so you can CREATE in one block and SELECT in the next!\n\n" +
      '```sql\n' +
      "CREATE TABLE IF NOT EXISTS demo (id INTEGER PRIMARY KEY, name TEXT, score REAL);\n" +
      "INSERT INTO demo VALUES (1, 'Alice', 95.5), (2, 'Bob', 87.3), (3, 'Carol', 92.1);\n" +
      'SELECT name, score FROM demo ORDER BY score DESC;\n' +
      '```\n\n' +
      '---\n\n' +
      '## ▶ Run All — Notebook Execution\n\n' +
      'Click the **▶ Run All** button to execute every block in your document — code, AI tags, API calls, and Linux compiles — in document order.\n\n' +
      '**How it works:**\n' +
      '1. The **Block Registry** scans the document and discovers all executable blocks\n' +
      '2. The **Execution Controller** runs them sequentially with a progress bar\n' +
      '3. Each block gets a status badge: ⏳ pending → ⚡ running → ✅ done / ❌ error\n' +
      '4. Results are stored in a **SQLite shared context** — downstream blocks can read upstream results\n\n' +
      '**11 Supported Block Types:**\n\n' +
      '| Block Type | Examples |\n' +
      '|:-----------|:---------|\n' +
      '| **Code** | `bash`, `math`, `python`, `html`, `javascript`, `sql` |\n' +
      '| **DocGen** | `{{AI:}}`, `{{Image:}}`, `{{Agent:}}` (auto-accept) |\n' +
      '| **API** | `{{API:}}` — fetches REST API, auto-replaces tag |\n' +
      '| **Linux** | `{{Linux:}}` — compiles via Judge0 CE |\n\n' +
      '> [!TIP]\n' +
      '> AI/Image/Agent tags use **auto-accept** mode during Run All — generated content replaces the tag directly without manual review.\n\n' +
      '---\n\n' +
      '## 🏷️ AI Document Tags\n\n' +
      'Embed AI-powered content generation **directly in your document** using three specialized tags:\n\n' +
      '| Tag | Purpose | Example |\n' +
      '|:----|:--------|:--------|\n' +
      '| `{{AI: prompt}}` | Generate text content | Marketing copy, PRD sections, summaries |\n' +
      '| `{{Think: prompt}}` | Deep reasoning / analysis | Comparisons, evaluations, strategic analysis |\n' +
      '| `{{Image: prompt}}` | Generate images (Gemini Imagen) | Product mockups, illustrations, diagrams |\n' +
      '| `{{Memory: Name: id}}` | Attach local context | Workspace files, external folders |\n\n' +
      '**Key metadata fields:** `@model:` persists selected model per card · `@upload:` attaches images/PDFs for multimodal analysis · `@use: workspace, my-docs` auto-retrieves relevant context from indexed memory sources · `@prompt:` editable AI instruction (bare text = static label) · `@engine:` / `@lang:` / `@prebuilt:` for specialized tags.\n\n' +
      '**How it works:**\n' +
      '1. Write a tag like `{{AI: Write an executive summary for a SaaS product}}`\n' +
      '2. Click **Generate** on the placeholder card (or **Fill All** for all tags)\n' +
      '3. Review the AI output — **Accept**, **Regenerate**, or **Reject**\n' +
      '4. Each card has its own **model selector** — switch models per-block!\n\n' +
      '> [!TIP]\n' +
      '> Check out the **AI** category in Templates for 13 ready-made AI-fillable documents!\n\n' +
      '---\n\n' +
      '## 🔌 API Calls\n\n' +
      'Make **REST API calls directly from your document** using `{{API:}}` tags:\n\n' +
      '```\n' +
      '{{API:\n' +
      '  URL: https://jsonplaceholder.typicode.com/posts/1\n' +
      '  Method: GET\n' +
      '  Variable: getResult\n' +
      '}}\n' +
      '```\n\n' +
      '```\n' +
      '{{API:\n' +
      '  URL: https://reqres.in/api/users\n' +
      '  Method: POST\n' +
      '  Headers: Content-Type: application/json\n' +
      '  Body: {"name":"TextAgent","job":"editor"}\n' +
      '  Variable: postResult\n' +
      '}}\n' +
      '```\n\n' +
      '**How it works:**\n' +
      '1. Use toolbar **GET** / **POST** buttons or type `{{API:}}` manually\n' +
      '2. Specify URL, Method, Headers, Body, and a Variable name\n' +
      '3. Click **▶** on the card to execute — review the response\n' +
      '4. Response stored in `$(api_varName)` — visible in the ⚡ Vars table\n\n' +
      '> [!TIP]\n' +
      '> Use `Variable: myData` to store the API response, then reference it anywhere as `$(api_myData)`.\n\n' +
      '---\n\n' +
      '## 🔗 Agent Flow\n\n' +
      'Create **multi-step AI pipelines** directly in your markdown:\n\n' +
      '```\n' +
      '{{Agent:\n' +
      '  Step 1: Research the latest AI trends\n' +
      '  Step 2: Summarize key findings\n' +
      '  Step 3: Create a comparison table\n' +
      '}}\n' +
      '```\n\n' +
      '**How it works:**\n' +
      '1. Each step runs sequentially — output from Step 1 feeds into Step 2 as context\n' +
      '2. Pick a **model** and **search provider** (DuckDuckGo, Brave, Serper) per card\n' +
      '3. Watch live status indicators: ⏳ running · ✅ done · ❌ error\n' +
      '4. Review the combined output — **Accept**, **Regenerate**, or **Reject**\n\n' +
      '> [!TIP]\n' +
      '> Enable web search on the Agent card to give each step access to fresh web results!\n\n' +
      '---\n\n' +
      '## 🔍 Web Search for AI\n\n' +
      'Toggle **web search** ON in the AI panel header to augment AI responses with live web data:\n\n' +
      '- 🦆 **DuckDuckGo** — Free, no API key needed (default)\n' +
      '- 🦁 **Brave Search** — Free tier, 2,000 queries/month\n' +
      '- 🔎 **Serper.dev** — Free tier, 2,500 queries\n\n' +
      'Search results are prepended to the AI context, and source citation links appear below responses.\n\n' +
      '---\n\n' +
      '## 🔀 Template Variables\n\n' +
      'Create **reusable documents** with the template variable engine:\n\n' +
      '- Type `$(projectName)` or `$(authorName)` anywhere in your document\n' +
      '- Click the **⚡ Vars** button — the system auto-detects all variables\n' +
      '- A variable table appears at the top — fill in your values\n' +
      '- Click **⚡ Vars** again — all occurrences are replaced instantly!\n\n' +
      '**7 Built-in Global Variables** (auto-resolved, no input needed):\n' +
      '`$(date)` · `$(time)` · `$(year)` · `$(month)` · `$(day)` · `$(timestamp)` · `$(uuid)`\n\n' +
      '> [!TIP]\n' +
      '> Many templates come with pre-defined variables. Load one and click ⚡ Vars to customize!\n\n' +
      '---\n\n' +
      '## 📊 Table Spreadsheet Tools\n\n' +
      'Every rendered markdown table gets an **interactive toolbar** on hover — like a mini Excel!\n\n' +
      '| Tool | What it does |\n' +
      '|:-----|:------------|\n' +
      '| **Sort** | Click any column header to sort ascending/descending |\n' +
      '| **Filter** | Per-column text filter to narrow down rows |\n' +
      '| **Search** | Full-text search across all cells with highlighting |\n' +
      '| **Σ Stats** | Sum, Average, Min, Max, Count, Unique per column |\n' +
      '| **Chart** | Generate a canvas bar chart from any column |\n' +
      '| **+ Row / + Col** | One-click — adds new rows or columns to the editor |\n' +
      '| **CSV / MD** | Copy table as CSV or Markdown to clipboard |\n' +
      '| **Download** | Download table as a .csv file |\n' +
      '| **Cell Edit** | Double-click any cell to edit inline, Enter to save |\n\n' +
      'Try it on this sample table — hover to see the toolbar!\n\n' +
      '| Name | Department | Salary | Rating |\n' +
      '|------|-----------|-------:|-------:|\n' +
      '| Alice | Engineering | 125000 | 4.8 |\n' +
      '| Bob | Design | 98000 | 4.5 |\n' +
      '| Carol | Marketing | 105000 | 4.7 |\n' +
      '| David | Sales | 112000 | 4.2 |\n' +
      '| Eve | Engineering | 135000 | 4.9 |\n\n' +
      '> [!TIP]\n' +
      '> Check out the **Tables** category in Templates for 5 complex data tables you can sort, filter, chart, and export!\n\n' +
      '---\n\n' +
      '## 🧮 LaTeX Math Expressions\n\n' +
      'Inline math: $$E = mc^2$$ and $$\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}$$\n\n' +
      'Display equations — **hover to evaluate** with [Nerdamer](https://nerdamer.com) CAS:\n\n' +
      '$$2^{10} + 3 \\times 7$$\n\n' +
      '$$\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n\n' +
      '$$\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}$$\n\n' +
      '$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$\n\n' +
      '---\n\n' +
      '## 📊 Mermaid Diagrams\n\n' +
      'Interactive diagrams with zoom, pan, and fullscreen — click any diagram!\n\n' +
      '**Mermaid Toolbar** — hover any diagram to reveal: ⛶ Zoom/Pan modal · PNG download · 📋 Copy to clipboard · SVG download\n\n' +
      '### Flowchart\n' +
      '```mermaid\n' +
      'flowchart LR\n' +
      '    A[Write Markdown] --> B{Preview OK?}\n' +
      '    B -->|Yes| C[Export]\n' +
      '    B -->|No| D[Edit]\n' +
      '    C --> E[PDF / HTML / MD]\n' +
      '    C --> F[LLM Memory]\n' +
      '    C --> G[Presentation]\n' +
      '    D --> A\n' +
      '```\n\n' +
      '### Sequence Diagram\n' +
      '```mermaid\n' +
      'sequenceDiagram\n' +
      '    User->>Editor: Type markdown\n' +
      '    Editor->>Preview: Live render\n' +
      '    User->>AI Panel: Ask for help\n' +
      '    AI Panel->>Editor: Insert suggestion\n' +
      '    User->>Export: Save as PDF\n' +
      '```\n\n' +
      '### Pie Chart\n' +
      '```mermaid\n' +
      'pie title TextAgent Usage\n' +
      '    "Code Docs" : 30\n' +
      '    "Notes" : 25\n' +
      '    "Blog Posts" : 20\n' +
      '    "Presentations" : 15\n' +
      '    "AI Writing" : 10\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🌱 PlantUML Diagrams\n\n' +
      'Render PlantUML diagrams with live preview — powered by the PlantUML server:\n\n' +
      '```plantuml\n' +
      '@startuml\n' +
      'actor User\n' +
      'User -> TextAgent : Write Markdown\n' +
      'TextAgent -> Preview : Render\n' +
      'Preview -> User : Live feedback\n' +
      '@enduml\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🤖 AI Assistant\n\n' +
      'Open the AI panel and chat with **multiple models** — local or cloud:\n\n' +
      '| Model | Type | Speed |\n' +
      '|:------|:-----|:------|\n' +
      '| **Qwen 3.5 Small (0.8B)** | 🏠 Local (WebGPU/WASM) — ~500 MB | ⚡ Fast |\n' +
      '| **Qwen 3.5 Medium (2B)** | 🏠 Local (WebGPU/WASM) — ~1.2 GB | ⚡ Fast |\n' +
      '| **Qwen 3.5 Large (4B)** | 🏠 Local (WebGPU/WASM) — ~2.5 GB, high-end | ⚡ Best quality |\n' +
      '| **Gemini 3.1 Flash Lite** | ☁️ Cloud (Google free tier) | 🚀 Very Fast |\n' +
      '| **Llama 3.3 70B** | ☁️ Cloud via Groq | ⚡ Ultra Fast |\n' +
      '| **Auto · Best Free** | ☁️ Cloud via OpenRouter | 🧠 Powerful |\n' +
      '| **Kokoro TTS (82M)** | 🏠 Local (WebWorker) — ~80 MB | 🔊 Speech |\n' +
      '| **Voxtral STT (3B)** | 🏠 Local (WebGPU) — ~2.7 GB | 🎤 Dictation |\n' +
      '| **Granite Docling (258M)** | 🏠 Local (WebGPU/WASM) — ~500 MB | 📄 Document OCR |\n' +
      '| **Florence-2 (230M)** | 🏠 Local (WebGPU/WASM) — ~230 MB | 📷 Vision OCR |\n\n' +
      '**AI Capabilities:**\n' +
      '- 📝 Summarize documents (agent-style chunked processing)\n' +
      '- ✍️ Improve writing style and grammar\n' +
      '- 🌐 Translate to any language\n' +
      '- 💬 Chat about your content with full context\n' +
      '- 🧠 Thinking mode for detailed step-by-step analysis\n' +
      '- 📋 Insert AI responses directly into the editor\n' +
      '- ✨ AI Writing Tags: Polish · Formalize · Elaborate · Shorten · Image\n' +
      '- 🎯 Per-card model selection for each generated block\n' +
      '- 🖼️ AI image generation via Gemini Imagen\n' +
      '- 🔗 Agent Flow — multi-step pipelines with chained outputs\n' +
      '- 🔍 Web Search — toggle DuckDuckGo, Brave, or Serper to augment AI responses\n\n' +
      '> [!TIP]\n' +
      '> Click the **🤖 AI** button in the toolbar to open the assistant panel. Select text and right-click for quick AI actions via the enhanced context menu.\n\n' +
      '---\n\n' +
      '## 🎤 Voice Dictation (Speech-to-Text)\n\n' +
      'Dictate your markdown hands-free with **dual-engine speech recognition** — Voxtral Mini 3B (WebGPU, primary, 13 languages, ~2.7 GB) or Whisper Large V3 Turbo (WASM fallback, ~800 MB) with consensus scoring. Download consent popup with model info before first use.\n\n' +
      '| Say this | Gets inserted |\n' +
      '|:---------|:--------------|\n' +
      '| "new line" | Line break |\n' +
      '| "new paragraph" | Double line break |\n' +
      '| "hash" / "hash hash" | `#` / `##` headings |\n' +
      '| "bold \\<text\\>" | `**text**` |\n' +
      '| "italic \\<text\\>" | `*text*` |\n' +
      '| "bullet" | `- ` list item |\n' +
      '| "checkbox" | `- [ ] ` task item |\n' +
      '| "code" | Inline `` ` `` backtick |\n' +
      '| "link \\<url\\>" | `[url](url)` |\n\n' +
      'Supports **multiple languages** — switch via the language picker in the mic menu.\n\n' +
      '> [!TIP]\n' +
      '> Click the **🎤 Microphone** button in the toolbar. Say "help" to see the voice commands cheat sheet.\n\n' +
      '---\n\n' +
      '## 🧠 LLM Memory Export\n\n' +
      'Convert your markdown into **portable LLM context** in 5 formats:\n\n' +
      '- **XML** — Structured tags, ideal for Claude and system prompts\n' +
      '- **JSON** — Structured JSON, easy to parse and inject via API\n' +
      '- **Compact JSON** — Minified with abbreviated keys, saves ~60% tokens\n' +
      '- **Markdown** — Clean markdown, works with any LLM\n' +
      '- **Plain Text** — No formatting, simple readable text\n\n' +
      'Includes metadata, token count, and one-click copy/download.\n\n' +
      '> [!TIP]\n' +
      '> Find "Export as LLM Memory" in the **Export** dropdown menu.\n\n' +
      '---\n\n' +
      '## 🎯 Presentation Mode (PPT)\n\n' +
      'Turn your markdown into a **slideshow presentation**!\n\n' +
      '- Each `---` horizontal rule creates a new slide\n' +
      '- Navigate with ← → arrow keys or on-screen controls\n' +
      '- **Multiple layouts** — title, section, two-column, image\n' +
      '- **Transitions** — smooth slide transitions\n' +
      '- **Speaker notes** — add notes visible only to the presenter\n' +
      '- **Overview grid** — see all slides at a glance\n' +
      '- **20+ PPT templates** with Unsplash image backgrounds\n' +
      '- Full-screen presentation with clean styling\n\n' +
      '> [!TIP]\n' +
      '> Click the **📊 Presentation** icon in the toolbar to start your slideshow.\n\n' +
      '---\n\n' +
      '## ☁️ Cloud Save \\& Encrypted Sharing\n\n' +
      '**Auto-save** to localStorage every second. **Cloud sync** to Firebase with end-to-end AES-256-GCM encryption:\n\n' +
      '1. Click **Share** → generates an encrypted link\n' +
      '2. Content is compressed (pako gzip) and encrypted client-side\n' +
      '3. Only the link holder with the key can decrypt\n' +
      '4. No one (not even the server) can read your content\n\n' +
      '**Additional sharing features:**\n' +
      '- 🔑 **Passphrase protection** — optionally add a passphrase to shared links\n' +
      '- 🔒 **Read-only shared links** — recipients cannot overwrite the original\n' +
      '- ✏️ **Edit Copy** — creates a local fork instead of overwriting\n\n' +
      '> [!NOTE]\n' +
      '> Your encryption key is in the URL hash (`#k=...`) and is **never** sent to the server.\n\n' +
      '---\n\n' +
      '## 📁 Smart File Import\n\n' +
      'Drag \\& drop or click **Import** to convert from **8 formats**:\n\n' +
      '| Format | Description |\n' +
      '|:-------|:------------|\n' +
      '| `.md` | Markdown files |\n' +
      '| `.docx` | Microsoft Word documents |\n' +
      '| `.xlsx` | Excel spreadsheets → Markdown tables |\n' +
      '| `.csv` | CSV data → Markdown tables |\n' +
      '| `.html` | HTML pages → Markdown |\n' +
      '| `.json` | JSON data → formatted code blocks |\n' +
      '| `.xml` | XML documents |\n' +
      '| `.pdf` | PDF text extraction |\n\n' +
      '---\n\n' +
      '## 📝 Text Formatting \\& Markdown Features\n\n' +
      '**Bold**, *italic*, ***bold italic***, ~~strikethrough~~\n\n' +
      '<mark>Highlighted text</mark> and <u>underlined text</u>\n\n' +
      'Chemical formulas: H<sub>2</sub>O, CO<sub>2</sub> · Math: x<sup>2</sup>, e<sup>iπ</sup>\n\n' +
      '### Footnotes\n\n' +
      'TextAgent supports footnotes[^1] with back-references — hover to preview!\n\n' +
      '[^1]: This is a footnote. Click it to jump back.\n\n' +
      '### Anchor Links\n\n' +
      'Click any heading to copy its anchor URL — great for sharing deep links!\n\n' +
      '### Image Paste\n\n' +
      'Paste images directly from your clipboard — they\'re embedded as base64 inline.\n\n' +
      '### Table of Contents\n\n' +
      'Auto-generated clickable sidebar TOC for easy navigation.\n\n' +
      '### Tables\n\n' +
      '| Feature | Shortcut | Description |\n' +
      '|:--------|:---------|:------------|\n' +
      '| Bold | <kbd>Ctrl</kbd>+<kbd>B</kbd> | **Bold text** |\n' +
      '| Italic | <kbd>Ctrl</kbd>+<kbd>I</kbd> | *Italic text* |\n' +
      '| Save | <kbd>Ctrl</kbd>+<kbd>S</kbd> | Export as .md |\n' +
      '| Find | <kbd>Ctrl</kbd>+<kbd>F</kbd> | Find \\& Replace |\n' +
      '| Zen Mode | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> | Distraction-free |\n' +
      '| Sync Scroll | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> | Toggle sync |\n\n' +
      '### Blockquotes\n\n' +
      '> "The best way to predict the future is to invent it." — Alan Kay\n\n' +
      '### GitHub-style Alerts\n\n' +
      '> [!NOTE]\n' +
      '> Useful background information the reader should know.\n\n' +
      '> [!TIP]\n' +
      '> Helpful advice for doing things more efficiently.\n\n' +
      '> [!IMPORTANT]\n' +
      '> Key information users need to know.\n\n' +
      '> [!WARNING]\n' +
      '> Critical information for avoiding problems.\n\n' +
      '> [!CAUTION]\n' +
      '> Negative potential consequences of an action.\n\n' +
      '---\n\n' +
      '## 📋 Task Lists \\& Checklists\n\n' +
      '- [x] Live preview with GitHub styling\n' +
      '- [x] Syntax highlighting for 180+ languages\n' +
      '- [x] LaTeX math rendering (MathJax)\n' +
      '- [x] Mermaid diagrams with zoom/pan/export toolbar\n' +
      '- [x] PlantUML diagram rendering\n' +
      '- [x] AI Assistant — 3 local sizes (0.8B / 2B / 4B) + cloud models\n' +
      '- [x] AI Document Tags (AI, Think, Image, Memory, Agent)\n' +
      '- [x] API Calls — REST API integration with variable storage\n' +
      '- [x] Agent Flow — multi-step AI pipelines with chained outputs\n' +
      '- [x] Web Search — DuckDuckGo, Brave, Serper.dev\n' +
      '- [x] Linux Terminal — full Debian Linux (WebVM) in new window\n' +
      '- [x] Per-card AI model selection\n' +
      '- [x] Template variable engine with auto-detect\n' +
      '- [x] Voice dictation with markdown commands\n' +
      '- [x] Executable bash \\& math blocks\n' +
      '- [x] Python sandbox (Pyodide WASM)\n' +
      '- [x] HTML sandbox (iframe preview)\n' +
      '- [x] JavaScript sandbox\n' +
      '- [x] SQL sandbox (SQLite WASM)\n' +
      '- [x] LLM Memory export (5 formats: XML, JSON, Compact JSON, Markdown, Plain Text)\n' +
      '- [x] Presentation mode with layouts \\& transitions\n' +
      '- [x] Encrypted cloud sharing with passphrase protection\n' +
      '- [x] Read-only shared links\n' +
      '- [x] Multi-format file import (8 types)\n' +
      '- [x] Dark mode, Focus mode \\& Zen mode\n' +
      '- [x] 6 preview themes (GitHub, GitLab, Notion, Dracula, Solarized, Evergreen)\n' +
      '- [x] Find \\& Replace with regex\n' +
      '- [x] Word count \\& reading time\n' +
      '- [x] Word wrap toggle\n' +
      '- [x] Emoji shortcodes\n' +
      '- [x] PDF export with smart page breaks\n' +
      '- [x] ' + window.MDView.PRODUCT.summaryParen() + '\n' +
      '- [x] Table spreadsheet tools (sort, filter, stats, chart)\n' +
      '- [x] Formatting toolbar\n' +
      '- [x] Table of contents\n' +
      '- [x] Image paste from clipboard\n' +
      '- [x] Footnotes \\& anchor links\n' +
      '- [x] Desktop app (Neutralino.js)\n' +
      '- [x] Multi-file workspace sidebar (Ctrl+B)\n' +
      '- [x] Compact header with collapsible Tools dropdown\n' +
      '- [x] Media embedding (video, YouTube, Vimeo, embed grid, link preview cards)\n' +
      '- [x] Text-to-Speech (Kokoro TTS engine + Web Speech API fallback)\n' +
      '- [x] OCR tag — image-to-text (Granite Docling + Florence-2)\n' +
      '- [x] STT tag — in-preview speech-to-text dictation blocks\n' +
      '- [x] Translate tag — translation with TTS pronunciation\n' +
      '- [x] Game Builder — AI-generated \\& pre-built games\n' +
      '- [x] Finance Dashboard — live TradingView charts\n' +
      '- [x] Disk-Backed Workspace (File System Access API)\n' +
      '- [x] Email to Self — share to inbox\n' +
      '- [x] Context Memory — workspace intelligence (SQLite FTS5)\n' +
      '- [x] Run All notebook execution engine\n' +
      '- [x] @model: per-card model persistence\n' +
      '- [x] Smart model loading UX (cache/download detection, delete cached models)\n' +
      '- [x] Dual-engine voice dictation (Voxtral + Whisper)\n' +
      '- [ ] Your feature suggestion here!\n\n' +
      '---\n\n' +
      '## 😀 Emoji Support\n\n' +
      'Use GitHub-style emoji shortcodes:\n\n' +
      ':rocket: :star: :heart: :fire: :tada: :sparkles: :zap: :bulb: :memo: :pushpin:\n\n' +
      'Or just paste Unicode emoji directly: 🎉 🚀 ⭐ 🔥 💡 ✅ 🎯 🧠\n\n' +
      '---\n\n' +
      '## 🌙 Editor Customization\n\n' +
      '- **Dark Mode** — Toggle with the 🌙 moon icon\n' +
      '- **Zen Mode** — Distraction-free writing (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>)\n' +
      '- **Focus Mode** — Dims surrounding paragraphs to keep you focused on current text\n' +
      '- **Preview Themes** — Switch between: GitHub · GitLab · Notion · Dracula · Solarized · Evergreen\n' +
      '- **Word Wrap** — Toggle editor line wrapping\n' +
      '- **Sync Scrolling** — Editor and preview scroll together\n' +
      '- **Split / Editor / Preview** — Choose your view mode with draggable resize divider\n' +
      '- **Formatting Toolbar** — Bold, italic, strikethrough, heading, link, image, code, lists, table, undo/redo\n\n' +
      '---\n\n' +
      '## 🎬 Media Embedding\n\n' +
      'Embed videos and websites directly in your markdown:\n\n' +
      '- **Video playback** — use standard `![alt](video.mp4)` image syntax for `.mp4`, `.webm`, `.ogg`, `.mov`, `.m4v` files\n' +
      '- **YouTube / Vimeo** — paste any YouTube or Vimeo URL and it auto-embeds as a privacy-enhanced iframe\n' +
      '- **Embed grid** — use an `embed` code block with `cols=1-4` and `height=N` for responsive media grids\n' +
      '- **Link previews** — website URLs render as rich link preview cards with favicon, domain, and "Open ↗" button\n' +
      '- **Video.js v10** — lazy-loaded from CDN with native `<video>` fallback\n\n' +
      '---\n\n' +
      '## 🔊 Text-to-Speech (TTS)\n\n' +
      'Hear any text read aloud — hover over preview text and click 🔊:\n\n' +
      '| Engine | Languages | Size |\n' +
      '|:-------|:----------|:-----|\n' +
      '| **Kokoro 82M v1.1-zh** | 🏠 English + Chinese (ONNX, WebWorker) | ~80 MB |\n' +
      '| **Web Speech API** | Japanese \\& 10+ languages (browser fallback) | 0 MB |\n\n' +
      '**Features:** voice auto-selection by language · ⬇ Save button to download generated audio as WAV file · `{{@TTS:}}` tag for per-card TTS playback with language selector\n\n' +
      '---\n\n' +
      '## 📷 OCR — Image to Text\n\n' +
      'Extract text from images and PDFs using the `{{@OCR:}}` tag:\n\n' +
      '- **Three modes:** Text (general OCR), Math (equation extraction), Table (structured data)\n' +
      '- **Two models:** Granite Docling 258M (~500 MB) or Florence-2 230M (~230 MB)\n' +
      '- **📎 Upload** images or PDFs — PDFs rendered page-by-page via pdf.js (2x scale, max 3 pages)\n' +
      '- Results appear inline with accept/reject controls\n\n' +
      '---\n\n' +
      '## 🎤 STT Tag — In-Preview Dictation\n\n' +
      'Add `{{@STT:}}` tags for speech-to-text recording blocks directly in your document:\n\n' +
      '- **Engine selector:** Whisper V3 Turbo / Voxtral Mini 3B / Web Speech API\n' +
      '- **11 languages** with automatic detection\n' +
      '- **Record / Stop / Insert / Clear** buttons with amber-accented UI and recording pulse animation\n' +
      '- Transcribed text inserts directly into the document\n\n' +
      '---\n\n' +
      '## 🌐 Translation\n\n' +
      'Translate text with the `{{@Translate:}}` tag:\n\n' +
      '- **Target language selector** — pick any destination language\n' +
      '- **Integrated TTS** — hear pronunciation of the translated text\n' +
      '- **Cloud model routing** — uses the best available AI model\n\n' +
      '---\n\n' +
      '## 🎮 Game Builder\n\n' +
      'Build and play games directly in your markdown with the `{{@Game:}}` tag:\n\n' +
      '**Two modes:**\n' +
      '1. **AI-generated** — describe a game and pick an engine (Canvas 2D / Three.js / P5.js)\n' +
      '2. **Pre-built** — use `@prebuilt:` for instant games: chess, snake, shooter, pong, breakout, maths quiz\n\n' +
      '**Features:** 📋 Import button for pasting/uploading external HTML game code · 📥 Export as standalone HTML · ⛶ Fullscreen mode · Per-card model picker\n\n' +
      '> [!TIP]\n' +
      '> Check out the **Games** category in Templates for 6 playable pre-built games!\n\n' +
      '---\n\n' +
      '## 📈 Finance Dashboard\n\n' +
      'Create live stock, crypto, and market dashboards with **TradingView charts**:\n\n' +
      '- **Dynamic grid** — add/remove tickers in the `@variables` table, grid auto-adjusts\n' +
      '- **Configurable** — chart range (1M/1Y/3Y), interval (D/W/M), EMA period (52D/52W/52M)\n' +
      '- **Interactive buttons** — toggle range and EMA period in the rendered dashboard\n' +
      '- **Three templates** — Stock Watchlist, Crypto Tracker, Market Overview\n\n' +
      '> [!TIP]\n' +
      '> Check out the **Finance** category in Templates for ready-made dashboards!\n\n' +
      '---\n\n' +
      '## 💾 Disk-Backed Workspace\n\n' +
      'Work directly with files on your local disk via the **File System Access API**:\n\n' +
      '- Click **Open Folder** in the sidebar to connect a local folder\n' +
      '- `.md` files are read/written directly to disk with debounced autosave\n' +
      '- "💾 Saved to disk" indicator confirms writes\n' +
      '- **Refresh from disk** for external edits · **Disconnect** to revert to localStorage\n' +
      '- **Auto-reconnect** on page reload via IndexedDB-stored handles\n' +
      '- Unified action modal for rename/duplicate/delete with confirmation\n\n' +
      '> [!NOTE]\n' +
      '> Disk workspace requires Chromium-based browsers (Chrome, Edge). The button is hidden in unsupported browsers.\n\n' +
      '---\n\n' +
      '## ✉️ Email to Self\n\n' +
      'Send documents directly to your inbox from the **share modal**:\n\n' +
      '1. Generate a share link\n' +
      '2. Enter your email in the "Email to Self" section\n' +
      '3. The document is sent with the share link and `.md` file attached\n\n' +
      'Powered by Google Apps Script (free, 100 emails/day). Your email is saved in localStorage for convenience.\n\n' +
      '---\n\n' +
      '## \ud83d\udee1\ufe0f Security \\& Privacy\n\n' +
      '- **100% Client-Side** \u2014 No server processing, no data collection\n' +
      '- **Content Security Policy** \u2014 CSP meta tag restricts script/resource loading to known CDN origins\n' +
      '- **AES-256-GCM Encryption** \u2014 Shared links are end-to-end encrypted\n' +
      '- **Firestore Ownership Tokens** \u2014 Write-tokens prevent anonymous document overwrites\n' +
      '- **Secure API Key Handling** \u2014 AI provider keys sent via HTTP headers, never in URLs\n' +
      '- **SRI Integrity Hashes** \u2014 All third-party scripts verified\n' +
      '- **XSS Sanitization** \u2014 DOMPurify protects against injection attacks\n' +
      '- **postMessage Validation** \u2014 Origin checks on all sandboxed iframe communication\n' +
      '- **Passphrase Policy** \u2014 Minimum 8-character passphrases for secure sharing\n' +
      '- **No Tracking** \u2014 Zero analytics, zero cookies, zero telemetry\n' +
      '- **Open Source** \u2014 Fully transparent, inspect every line of code\n'
  },
  {
    name: 'README',
    category: 'documentation',
    icon: 'bi-book',
    description: 'Standard project README with badges, install, usage, and contributing sections',
    variables: [
      { name: 'projectName', value: 'my-project', desc: 'Repository / project name' },
      { name: 'authorName', value: 'Your Name', desc: 'Author or maintainer' },
      { name: 'authorGithub', value: 'yourname', desc: 'GitHub username' },
      { name: 'projectDesc', value: 'A brief description of what this project does and who it\'s for.', desc: 'One-line project summary' },
      { name: 'license', value: 'MIT', desc: 'License type (MIT, Apache-2.0, GPL-3.0)' },
    ],
    content: `# $(projectName)

![License](https://img.shields.io/badge/license-$(license)-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

> $(projectDesc)

## ✨ Features

- **Feature 1** — Description of feature one
- **Feature 2** — Description of feature two
- **Feature 3** — Description of feature three

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/$(authorGithub)/$(projectName).git

# Navigate to the project directory
cd $(projectName)

# Install dependencies
npm install
\`\`\`

## 🚀 Usage

\`\`\`javascript
const project = require('$(projectName)');

// Example usage
project.doSomething();
\`\`\`

## 📖 Documentation

For full documentation, visit [docs.example.com](https://docs.example.com).

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the $(license) License — see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Author** — [@$(authorGithub)](https://github.com/$(authorGithub))
- **Email** — $(authorName)@example.com
`
  },
  {
    name: 'API Documentation',
    category: 'documentation',
    icon: 'bi-code-slash',
    description: 'REST API documentation with endpoints, parameters, and response examples',
    content: `# API Documentation

**Base URL:** \`https://api.example.com/v1\`

## Authentication

All API requests require a Bearer token in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

---

## Endpoints

### GET /users

Retrieve a list of users.

**Query Parameters:**

| Parameter | Type     | Required | Description              |
|-----------|----------|----------|--------------------------|
| \`page\`    | integer  | No       | Page number (default: 1) |
| \`limit\`   | integer  | No       | Items per page (max: 100)|
| \`search\`  | string   | No       | Search by name or email  |

**Response:**

\`\`\`json
{
"data": [
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  }
],
"pagination": {
  "page": 1,
  "limit": 20,
  "total": 150
}
}
\`\`\`

### POST /users

Create a new user.

**Request Body:**

\`\`\`json
{
"name": "Jane Doe",
"email": "jane@example.com",
"role": "admin"
}
\`\`\`

**Response:** \`201 Created\`

---

## Error Codes

| Code | Description           |
|------|-----------------------|
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 404  | Not Found             |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |
`
  },
  {
    name: 'Changelog',
    category: 'documentation',
    icon: 'bi-clock-history',
    description: 'Project changelog following Keep a Changelog format',
    content: `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- New feature description

### Changed
- Updated feature description

---

## [1.2.0] — 2024-03-15

### Added
- User authentication via OAuth 2.0
- Dark mode support
- Export to PDF functionality

### Changed
- Improved search algorithm performance by 40%
- Updated dependencies to latest versions

### Fixed
- Fixed memory leak in data processing pipeline
- Resolved timezone handling for international users

---

## [1.1.0] — 2024-02-01

### Added
- Real-time collaboration support
- Markdown preview with syntax highlighting

### Deprecated
- Legacy API v1 endpoints (will be removed in v2.0)

### Security
- Patched XSS vulnerability in user input sanitization

---

## [1.0.0] — 2024-01-01

### Added
- Initial release
- Core feature set
- API documentation
- User onboarding flow
`
  },
  {
    name: 'Meeting Notes (AI Fill)',
    category: 'documentation',
    icon: 'bi-robot',
    description: 'AI-fillable meeting notes — jot rough notes, let AI organize them',
    content: `# Meeting Notes — [Meeting Title]

**Date:** $(date)
**Attendees:** [List names]
**Duration:** [X] minutes

---

## Agenda

1. [Topic 1]
2. [Topic 2]
3. [Topic 3]

## Discussion Notes

Paste or type your rough notes here — as messy as you want:

{{AI: Organize the rough notes above into a clean, structured discussion summary. Group by topic, highlight key points, and use bullet points. Keep the tone professional but concise.}}

## Decisions Made

{{AI: Based on the discussion above, extract and list all decisions that were made. Format as a markdown table with columns: Decision, Owner, Deadline.}}

## Action Items

{{AI: Extract all action items from the discussion. Format as a task list with checkboxes, assignee in bold, description, and due date in italics.}}

## Follow-Up

{{Think: Based on the meeting content, suggest 2-3 follow-up items or topics that should be address in the next meeting. Explain why each is important.}}

---

**Next Meeting:** [Date & Time]
`
  },
];
