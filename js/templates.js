// ============================================
// templates.js — Template Picker Data + Modal Logic
// ============================================
(function (M) {
  'use strict';

  const MARKDOWN_TEMPLATES = [
    {
      name: 'Feature Showcase',
      category: 'documentation',
      icon: 'bi-stars',
      description: 'Explore every MDview feature: AI, diagrams, math, code, presentations, and more',
      content: '# 🚀 Welcome to MDview\n\n' +
        '> Your all-in-one Markdown editor with live preview, AI assistance, executable code, and powerful export options — **100% client-side, zero tracking.**\n\n' +
        '---\n\n' +
        '## ✨ All Features at a Glance\n\n' +
        '| Category | Features |\n' +
        '|:---------|:---------|\n' +
        '| **Editing** | Live Preview · Sync Scrolling · Find & Replace (Regex) · Zen Mode · Word Wrap Toggle |\n' +
        '| **Rendering** | GitHub Styling · Syntax Highlighting (180+ langs) · LaTeX Math · Mermaid Diagrams · Emoji |\n' +
        '| **AI** | Built-in AI Assistant — Local Qwen 3.5 + Cloud: Gemini, Groq, OpenRouter |\n' +
        '| **Voice** | 🎤 Speech-to-Text dictation with Markdown voice commands (multi-language) |\n' +
        '| **Code** | ▶ Bash · ▶ Math · 🐍 Python · 🌐 HTML Sandbox · ⚡ JavaScript · 🗄️ SQL (SQLite) |\n' +
        '| **Import** | MD · DOCX · XLSX · CSV · HTML · JSON · XML · PDF |\n' +
        '| **Export** | Markdown · HTML · PDF · LLM Memory Format |\n' +
        '| **Sharing** | ☁️ End-to-end encrypted cloud sharing via Firebase |\n' +
        '| **Extras** | Presentation Mode (PPT) · Preview Themes · Dark Mode · Templates (19+) |\n\n' +
        '---\n\n' +
        '## 💻 Six Executable Languages\n\n' +
        'MDview can **run code directly in the preview** — no server needed! All execution happens in the browser via WebAssembly or sandboxed iframes.\n\n' +
        '| Language | Runtime | Button |\n' +
        '|:---------|:--------|:-------|\n' +
        '| **Bash** | [just-bash](https://justbash.dev/) (WASM) | ▶ Run |\n' +
        '| **Math** | [math.js](https://mathjs.org/) | ▶ Evaluate |\n' +
        '| **Python** | [Pyodide](https://pyodide.org/) (WASM CPython) | ▶ Run |\n' +
        '| **HTML** | Sandboxed iframe | ▶ Preview |\n' +
        '| **JavaScript** | Sandboxed iframe | ▶ Run |\n' +
        '| **SQL** | [sql.js](https://sql.js.org/) (SQLite WASM) | ▶ Run |\n\n' +
        '---\n\n' +
        '## 🖥️ Executable Bash Blocks\n\n' +
        'Run bash commands **directly in the preview** — powered by [just-bash](https://justbash.dev/).\n' +
        'Hover over any bash code block and click **▶ Run**:\n\n' +
        '```bash\n' +
        'echo "Hello from MDview! 🎉"\n' +
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
        'print(f"Top scorer: {max(data, key=lambda d: d[\'score\'])[\'name\']}")\n' +
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
        '<button onclick="document.getElementById(\'c\').textContent = ++n">Click me!</button>\n' +
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
        'Tables persist across blocks on the same page, so you can CREATE in one block and SELECT in the next!\n\n' +
        '```sql\n' +
        'CREATE TABLE IF NOT EXISTS demo (id INTEGER PRIMARY KEY, name TEXT, score REAL);\n' +
        'INSERT INTO demo VALUES (1, \'Alice\', 95.5), (2, \'Bob\', 87.3), (3, \'Carol\', 92.1);\n' +
        'SELECT name, score FROM demo ORDER BY score DESC;\n' +
        '```\n\n' +
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
        'pie title MDview Usage\n' +
        '    "Code Docs" : 30\n' +
        '    "Notes" : 25\n' +
        '    "Blog Posts" : 20\n' +
        '    "Presentations" : 15\n' +
        '    "AI Writing" : 10\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🤖 AI Assistant\n\n' +
        'Open the AI panel and chat with **multiple models** — local or cloud:\n\n' +
        '| Model | Type | Speed |\n' +
        '|:------|:-----|:------|\n' +
        '| **Qwen 3.5** | 🏠 Local (runs in browser) | ⚡ Fast |\n' +
        '| **Gemini 2.0 Flash** | ☁️ Cloud (free tier) | 🚀 Very Fast |\n' +
        '| **Llama 3.3 70B** | ☁️ Cloud via OpenRouter | 🧠 Powerful |\n' +
        '| **Llama via Groq** | ☁️ Cloud via Groq | ⚡ Ultra Fast |\n\n' +
        '**AI Capabilities:**\n' +
        '- 📝 Summarize documents (agent-style chunked processing)\n' +
        '- ✍️ Improve writing style and grammar\n' +
        '- 🌐 Translate to any language\n' +
        '- 💬 Chat about your content with full context\n' +
        '- 🧠 Thinking mode for detailed step-by-step analysis\n' +
        '- 📋 Insert AI responses directly into the editor\n\n' +
        '> [!TIP]\n' +
        '> Click the **🤖 AI** button in the toolbar to open the assistant panel. API keys are encrypted in localStorage.\n\n' +
        '---\n\n' +
        '## 🎤 Voice Dictation (Speech-to-Text)\n\n' +
        'Dictate your markdown hands-free with **voice commands**:\n\n' +
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
        'Convert your markdown into **shareable LLM memory format** for use with AI tools:\n\n' +
        '- **Standard** — Clean structured format\n' +
        '- **System Prompt** — Ready for ChatGPT/Claude system messages\n' +
        '- **OpenAI** — JSON format for OpenAI API\n' +
        '- **Raw** — Plain text extraction\n\n' +
        'Includes metadata, token count, and one-click copy/download.\n\n' +
        '> [!TIP]\n' +
        '> Find "Export as LLM Memory" in the **Export** dropdown menu.\n\n' +
        '---\n\n' +
        '## 🎯 Presentation Mode (PPT)\n\n' +
        'Turn your markdown into a **slideshow presentation**!\n\n' +
        '- Each `---` horizontal rule creates a new slide\n' +
        '- Navigate with ← → arrow keys or on-screen controls\n' +
        '- Full-screen presentation with clean styling\n' +
        '- Perfect for meetings, demos, and teaching\n\n' +
        '> [!TIP]\n' +
        '> Click the **📊 Presentation** icon in the toolbar to start your slideshow.\n\n' +
        '---\n\n' +
        '## ☁️ Cloud Save & Encrypted Sharing\n\n' +
        '**Auto-save** to localStorage every second. **Cloud sync** to Firebase with end-to-end AES-256-GCM encryption:\n\n' +
        '1. Click **Share** → generates an encrypted link\n' +
        '2. Content is compressed (pako gzip) and encrypted client-side\n' +
        '3. Only the link holder with the key can decrypt\n' +
        '4. No one (not even the server) can read your content\n\n' +
        '> [!NOTE]\n' +
        '> Your encryption key is in the URL hash (`#k=...`) and is **never** sent to the server.\n\n' +
        '---\n\n' +
        '## 📁 Smart File Import\n\n' +
        'Drag & drop or click **Import** to convert from **8 formats**:\n\n' +
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
        '## 😀 Emoji Support\n\n' +
        'Use GitHub-style emoji shortcodes:\n\n' +
        ':rocket: :star: :heart: :fire: :tada: :sparkles: :zap: :bulb: :memo: :pushpin:\n\n' +
        'Or just paste Unicode emoji directly: 🎉 🚀 ⭐ 🔥 💡 ✅ 🎯 🧠\n\n' +
        '---\n\n' +
        '## 📝 Text Formatting\n\n' +
        '**Bold**, *italic*, ***bold italic***, ~~strikethrough~~\n\n' +
        '<mark>Highlighted text</mark> and <u>underlined text</u>\n\n' +
        'Chemical formulas: H<sub>2</sub>O, CO<sub>2</sub> · Math: x<sup>2</sup>, e<sup>iπ</sup>\n\n' +
        '### Tables\n\n' +
        '| Feature | Shortcut | Description |\n' +
        '|:--------|:---------|:------------|\n' +
        '| Bold | <kbd>Ctrl</kbd>+<kbd>B</kbd> | **Bold text** |\n' +
        '| Italic | <kbd>Ctrl</kbd>+<kbd>I</kbd> | *Italic text* |\n' +
        '| Save | <kbd>Ctrl</kbd>+<kbd>S</kbd> | Export as .md |\n' +
        '| Find | <kbd>Ctrl</kbd>+<kbd>F</kbd> | Find & Replace |\n' +
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
        '## 📋 Task Lists & Checklists\n\n' +
        '- [x] Live preview with GitHub styling\n' +
        '- [x] Syntax highlighting for 180+ languages\n' +
        '- [x] LaTeX math rendering (KaTeX)\n' +
        '- [x] Mermaid diagrams with zoom/pan\n' +
        '- [x] AI Assistant — 4 models (local + cloud)\n' +
        '- [x] Voice dictation with markdown commands\n' +
        '- [x] Executable bash & math blocks\n' +
        '- [x] Python sandbox (Pyodide WASM)\n' +
        '- [x] HTML sandbox (iframe preview)\n' +
        '- [x] LLM Memory export (4 formats)\n' +
        '- [x] Presentation mode (slideshow)\n' +
        '- [x] Encrypted cloud sharing (Firebase)\n' +
        '- [x] Multi-format file import (8 types)\n' +
        '- [x] Dark mode & Zen mode\n' +
        '- [x] Find & Replace with regex\n' +
        '- [x] Word count & reading time\n' +
        '- [x] Preview themes\n' +
        '- [x] Word wrap toggle\n' +
        '- [x] Emoji shortcodes\n' +
        '- [x] PDF export\n' +
        '- [x] 19+ templates\n' +
        '- [ ] Your feature suggestion here!\n\n' +
        '---\n\n' +
        '## 🌙 Editor Customization\n\n' +
        '- **Dark Mode** — Toggle with the 🌙 moon icon\n' +
        '- **Zen Mode** — Distraction-free writing (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>)\n' +
        '- **Preview Themes** — Switch between GitHub, classic, and other preview styles\n' +
        '- **Word Wrap** — Toggle editor line wrapping\n' +
        '- **Sync Scrolling** — Editor and preview scroll together\n' +
        '- **Split / Editor / Preview** — Choose your view mode\n\n' +
        '---\n\n' +
        '## 🛡️ Security & Privacy\n\n' +
        '- **100% Client-Side** — No server processing, no data collection\n' +
        '- **AES-256-GCM Encryption** — Shared links are end-to-end encrypted\n' +
        '- **Encrypted API Keys** — AI provider keys are encrypted in localStorage\n' +
        '- **No Tracking** — Zero analytics, zero cookies, zero telemetry\n' +
        '- **Open Source** — Fully transparent, inspect every line of code\n'
    },
    {
      name: 'README',
      category: 'documentation',
      icon: 'bi-book',
      description: 'Standard project README with badges, install, usage, and contributing sections',
      content: `# Project Name

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

> A brief description of what this project does and who it's for.

## ✨ Features

- **Feature 1** — Description of feature one
- **Feature 2** — Description of feature two
- **Feature 3** — Description of feature three

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/project-name.git

# Navigate to the project directory
cd project-name

# Install dependencies
npm install
\`\`\`

## 🚀 Usage

\`\`\`javascript
const project = require('project-name');

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

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Author** — [@yourname](https://github.com/yourname)
- **Email** — your.email@example.com
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
      name: 'Meeting Notes',
      category: 'project',
      icon: 'bi-people',
      description: 'Structured meeting notes with attendees, agenda, decisions, and action items',
      content: `# Meeting Notes

**Date:** $(date)
**Time:** 10:00 AM — 11:00 AM
**Location:** Conference Room / Zoom
**Facilitator:** [Name]

## Attendees

- [ ] Person 1 — Role
- [ ] Person 2 — Role
- [ ] Person 3 — Role

---

## Agenda

1. Review of previous action items (5 min)
2. Topic A — [Owner] (15 min)
3. Topic B — [Owner] (15 min)
4. Topic C — [Owner] (10 min)
5. Open discussion (10 min)
6. Next steps & wrap-up (5 min)

---

## Discussion Notes

### Topic A
- Key point discussed
- Decisions made
- Open questions

### Topic B
- Key point discussed
- Decisions made

### Topic C
- Key point discussed
- Concerns raised

---

## Decisions Made

| # | Decision | Owner | Deadline |
|---|----------|-------|----------|
| 1 | Decision description | Person | Date |
| 2 | Decision description | Person | Date |

## Action Items

- [ ] **Person 1:** Action description — *Due: Date*
- [ ] **Person 2:** Action description — *Due: Date*
- [ ] **Person 3:** Action description — *Due: Date*

---

**Next Meeting:** [Date & Time]
`
    },
    {
      name: 'Project Proposal',
      category: 'project',
      icon: 'bi-lightbulb',
      description: 'Comprehensive project proposal with objectives, timeline, and budget',
      content: `# Project Proposal: [Project Name]

**Prepared by:** [Your Name]
**Date:** $(date)
**Version:** 1.0

---

## Executive Summary

A brief overview of the project, its goals, and expected outcomes (2-3 sentences).

## Problem Statement

Describe the problem or opportunity this project addresses. Include relevant data or metrics.

## Objectives

1. **Primary Objective** — Description
2. **Secondary Objective** — Description
3. **Tertiary Objective** — Description

## Proposed Solution

Detailed description of the proposed solution and approach.

### Key Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Feature 1 | Description | High |
| Feature 2 | Description | Medium |
| Feature 3 | Description | Low |

## Timeline

\`\`\`mermaid
gantt
  title Project Timeline
  dateFormat  YYYY-MM-DD
  section Phase 1
  Research & Planning  :a1, 2024-01-01, 14d
  Design               :a2, after a1, 14d
  section Phase 2
  Development          :a3, after a2, 30d
  Testing              :a4, after a3, 14d
  section Phase 3
  Deployment           :a5, after a4, 7d
  Review               :a6, after a5, 7d
\`\`\`

## Budget Estimate

| Item | Cost | Notes |
|------|------|-------|
| Development | $X,XXX | Description |
| Infrastructure | $X,XXX | Description |
| Testing | $X,XXX | Description |
| **Total** | **$XX,XXX** | |

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Risk 1 | High | Medium | Mitigation strategy |
| Risk 2 | Medium | Low | Mitigation strategy |

## Success Metrics

- **Metric 1:** Target value
- **Metric 2:** Target value
- **Metric 3:** Target value

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Sponsor | | | |
| Technical Lead | | | |
| Stakeholder | | | |
`
    },
    {
      name: 'Sprint Planning',
      category: 'project',
      icon: 'bi-kanban',
      description: 'Agile sprint planning document with user stories and task breakdown',
      content: `# Sprint Planning — Sprint [#]

**Sprint Duration:** [Start Date] → [End Date]
**Sprint Goal:** [One-sentence goal]
**Team Velocity:** [X] story points

---

## Sprint Backlog

### 🔴 High Priority

#### US-001: [User Story Title]
> As a [user type], I want [action] so that [benefit].

- **Points:** 5
- **Assignee:** [Name]
- Tasks:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

#### US-002: [User Story Title]
> As a [user type], I want [action] so that [benefit].

- **Points:** 3
- **Assignee:** [Name]
- Tasks:
- [ ] Task 1
- [ ] Task 2

### 🟡 Medium Priority

#### US-003: [User Story Title]
> As a [user type], I want [action] so that [benefit].

- **Points:** 2
- **Assignee:** [Name]
- Tasks:
- [ ] Task 1
- [ ] Task 2

### 🟢 Low Priority

#### US-004: [User Story Title]
- **Points:** 1
- **Assignee:** [Name]
- Tasks:
- [ ] Task 1

---

## Capacity

| Team Member | Available Days | Capacity (pts) |
|-------------|---------------|----------------|
| Person 1 | 10 | 8 |
| Person 2 | 8 | 6 |
| Person 3 | 10 | 8 |
| **Total** | | **22** |

## Risks & Blockers

- ⚠️ Risk/blocker description — *Mitigation plan*

## Definition of Done

- [ ] Code reviewed and approved
- [ ] Unit tests passing (>80% coverage)
- [ ] Documentation updated
- [ ] QA verified
- [ ] Deployed to staging
`
    },
    {
      name: 'Bug Report',
      category: 'technical',
      icon: 'bi-bug',
      description: 'Detailed bug report with reproduction steps and environment info',
      content: `# Bug Report

**Title:** [Brief description of the bug]
**Severity:** 🔴 Critical / 🟠 Major / 🟡 Minor / 🟢 Trivial
**Reporter:** [Your Name]
**Date:** $(date)
**Status:** Open

---

## Description

A clear and concise description of what the bug is.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

A clear description of what you expected to happen.

## Actual Behavior

A clear description of what actually happened.

## Screenshots / Recordings

_If applicable, add screenshots or screen recordings to help explain the problem._

## Environment

| Property | Value |
|----------|-------|
| OS | macOS 14.2 / Windows 11 / Ubuntu 22.04 |
| Browser | Chrome 120 / Firefox 121 / Safari 17 |
| App Version | 1.2.0 |
| Device | Desktop / Mobile |
| Screen Size | 1920x1080 |

## Console Errors

\`\`\`
Paste any relevant console errors here
\`\`\`

## Additional Context

Add any other context about the problem here. Include:
- Frequency (always, sometimes, rare)
- Workaround if any
- Related issues

---

## Resolution

**Fixed in:** [Version / PR #]
**Root Cause:**
**Fix Description:**
`
    },
    {
      name: 'Technical Spec',
      category: 'technical',
      icon: 'bi-diagram-3',
      description: 'Technical specification document with architecture and implementation details',
      content: `# Technical Specification

**Feature:** [Feature Name]
**Author:** [Your Name]
**Date:** $(date)
**Status:** Draft / In Review / Approved

---

## Overview

Brief description of the feature and its purpose.

## Background & Motivation

Why is this feature needed? What problem does it solve?

## Goals & Non-Goals

### Goals
- Goal 1
- Goal 2

### Non-Goals
- Non-goal 1 (explicitly out of scope)

## Architecture

\`\`\`mermaid
flowchart TD
  A[Client] --> B[API Gateway]
  B --> C[Service Layer]
  C --> D[Database]
  C --> E[Cache]
  C --> F[External API]
\`\`\`

## Detailed Design

### Data Model

\`\`\`sql
CREATE TABLE example (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  status      VARCHAR(50) DEFAULT 'active',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
\`\`\`

### API Design

#### \`POST /api/v1/resource\`

**Request:**
\`\`\`json
{
"name": "string",
"config": {}
}
\`\`\`

**Response:** \`201 Created\`

### Error Handling

| Error Case | Handling Strategy |
|------------|-------------------|
| Invalid input | Return 400 with validation errors |
| Not found | Return 404 |
| Rate limited | Return 429 with retry-after header |

## Testing Strategy

- **Unit Tests:** Core logic and data transformations
- **Integration Tests:** API endpoints and database operations
- **E2E Tests:** Critical user flows

## Rollout Plan

1. **Phase 1:** Internal testing (1 week)
2. **Phase 2:** Beta rollout to 10% of users
3. **Phase 3:** Full rollout

## Open Questions

- [ ] Question 1?
- [ ] Question 2?
`
    },
    {
      name: 'Code Review',
      category: 'technical',
      icon: 'bi-git',
      description: 'Code review checklist and feedback template',
      content: `# Code Review

**PR:** #[number] — [PR Title]
**Author:** @[username]
**Reviewer:** @[username]
**Date:** $(date)

---

## Summary

Brief description of what this PR does.

## Review Checklist

### Correctness
- [ ] Code does what the PR description says
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs

### Code Quality
- [ ] Code is readable and well-organized
- [ ] Functions/methods are appropriately sized
- [ ] Variable names are descriptive
- [ ] No unnecessary complexity
- [ ] DRY principle followed

### Testing
- [ ] Unit tests added/updated
- [ ] Tests cover edge cases
- [ ] All tests passing
- [ ] Test coverage maintained or improved

### Security
- [ ] No hardcoded secrets or credentials
- [ ] Input validation in place
- [ ] No SQL injection vulnerabilities
- [ ] XSS prevention applied

### Performance
- [ ] No N+1 queries
- [ ] Appropriate caching used
- [ ] No memory leaks
- [ ] Database indexes considered

---

## Feedback

### 🟢 What's Good
- Positive feedback point 1
- Positive feedback point 2

### 🟡 Suggestions
- **File:Line** — Suggestion description
- **File:Line** — Suggestion description

### 🔴 Must Fix
- **File:Line** — Issue description
- **File:Line** — Issue description

---

**Verdict:** ✅ Approve / 🔄 Request Changes / ❌ Reject
`
    },
    {
      name: 'Blog Post',
      category: 'creative',
      icon: 'bi-pencil-square',
      description: 'Blog post template with title, sections, and call-to-action',
      content: `# [Blog Post Title: Make It Catchy and SEO-Friendly]

*Published on $(date) · X min read*

![Cover Image](https://via.placeholder.com/800x400)

---

> **TL;DR:** A one-sentence summary of the key takeaway from this post.

## Introduction

Hook the reader with a compelling opening. State the problem or question this post addresses. Preview what they'll learn.

## The Problem

Describe the challenge or situation your readers face. Use relatable examples.

## The Solution

### Step 1: [First Key Point]

Explain the first step or concept. Include examples:

\`\`\`javascript
// Code example if applicable
function example() {
return "Hello, World!";
}
\`\`\`

### Step 2: [Second Key Point]

Continue with the next step or concept.

> 💡 **Pro Tip:** Share an insider tip that adds extra value.

### Step 3: [Third Key Point]

Wrap up the main content with the final step or concept.

## Results / Key Takeaways

- **Takeaway 1** — Brief explanation
- **Takeaway 2** — Brief explanation
- **Takeaway 3** — Brief explanation

## Conclusion

Summarize what was covered. Reinforce the main message. End with a forward-looking statement.

---

**What do you think?** Share your thoughts in the comments below.

*If you found this helpful, consider sharing it with others who might benefit! 🚀*

---

**Tags:** #topic1 #topic2 #topic3
`
    },
    {
      name: 'Newsletter',
      category: 'creative',
      icon: 'bi-envelope-paper',
      description: 'Newsletter template with sections for updates, highlights, and links',
      content: `# 📬 [Newsletter Name] — Issue #[X]

*$(date)*

---

Hey there! 👋

Welcome to this week's edition of **[Newsletter Name]**. Here's what's new:

---

## 🔥 This Week's Highlight

### [Main Story Title]

A brief summary of the main story or update. This should be the most important or exciting thing you want to share this week.

[Read more →](https://example.com/article)

---

## 📰 News & Updates

### 1. [Update Title]
Brief summary of the first update. Keep it to 2-3 sentences.

### 2. [Update Title]
Brief summary of the second update.

### 3. [Update Title]
Brief summary of the third update.

---

## 🛠️ Tool / Resource of the Week

**[Tool Name](https://example.com)** — A brief description of why this tool is useful and who it's for.

---

## 💡 Tip of the Week

> [A practical tip, quote, or piece of advice relevant to your audience]

---

## 📊 Quick Stats

| Metric | This Week | Last Week | Change |
|--------|-----------|-----------|--------|
| Stat 1 | 1,234 | 1,100 | +12% |
| Stat 2 | 567 | 590 | -4% |

---

## 📅 Upcoming Events

- **[Event Name]** — [Date] — [Brief description]
- **[Event Name]** — [Date] — [Brief description]

---

## 🔗 Worth Reading

- [Article Title](https://example.com) — Source
- [Article Title](https://example.com) — Source
- [Article Title](https://example.com) — Source

---

That's all for this week! See you next time. ✌️

*— [Your Name]*

---

*[Unsubscribe](https://example.com/unsubscribe) · [View in browser](https://example.com/newsletter/1)*
`
    },
    {
      name: 'Resume / CV',
      category: 'creative',
      icon: 'bi-person-badge',
      description: 'Professional resume template with experience, skills, and education',
      content: `# [Your Full Name]

**[Your Title / Role]**

📍 [City, Country] · 📧 [email@example.com] · 🔗 [linkedin.com/in/yourname](https://linkedin.com/in/yourname) · 💻 [github.com/yourname](https://github.com/yourname)

---

## Summary

A concise 2-3 sentence professional summary highlighting your key strengths, experience level, and what you bring to the table.

---

## Experience

### **Senior Software Engineer** — [Company Name]
*Jan 2022 — Present · City, Country*

- Led development of [feature/project] that improved [metric] by X%
- Architected and deployed [system] serving [X] million requests/day
- Mentored team of [X] junior engineers, improving code review velocity by X%
- **Tech Stack:** TypeScript, React, Node.js, PostgreSQL, AWS

### **Software Engineer** — [Company Name]
*Jun 2019 — Dec 2021 · City, Country*

- Built [feature] from scratch, reducing [process] time by X%
- Implemented CI/CD pipeline, cutting deployment time from hours to minutes
- Collaborated with product team to define technical requirements
- **Tech Stack:** Python, Django, React, Docker

### **Junior Developer** — [Company Name]
*Aug 2017 — May 2019 · City, Country*

- Developed and maintained [X] microservices
- Wrote comprehensive unit and integration tests (95%+ coverage)
- **Tech Stack:** Java, Spring Boot, MySQL

---

## Skills

| Category | Technologies |
|----------|-------------|
| **Languages** | TypeScript, Python, Java, Go |
| **Frontend** | React, Next.js, Vue.js, HTML/CSS |
| **Backend** | Node.js, Django, Spring Boot |
| **Databases** | PostgreSQL, MongoDB, Redis |
| **DevOps** | Docker, Kubernetes, AWS, CI/CD |
| **Tools** | Git, Jira, Figma, VS Code |

---

## Education

### **B.S. Computer Science** — [University Name]
*2013 — 2017 · GPA: 3.8/4.0*

- Relevant Coursework: Data Structures, Algorithms, Distributed Systems, Machine Learning

---

## Certifications

- **AWS Solutions Architect — Associate** (2023)
- **Google Cloud Professional Data Engineer** (2022)

---

## Projects

### **[Project Name](https://github.com/yourname/project)**
Brief description of the project, what problem it solves, and technologies used.

### **[Project Name](https://github.com/yourname/project)**
Brief description of the project.
`
    },
    {
      name: 'Bash Scripting',
      category: 'coding',
      icon: 'bi-terminal',
      description: 'Learn bash basics with runnable examples — variables, loops, and text processing',
      content: `# 🖥️ Bash Scripting — Interactive Tutorial

> Click **▶ Run** on any code block below to execute it live in your browser.
> Powered by [just-bash](https://justbash.dev/) — a sandboxed bash environment.

---

## 1. Variables & String Operations

Bash variables don't need type declarations. Use \`$VAR\` or \`\${VAR}\` to reference them.

\`\`\`bash
NAME="World"
GREETING="Hello, $NAME!"
echo "$GREETING"
echo "Length of NAME: \${#NAME}"
echo "Uppercase: \${NAME^^}"
\`\`\`

**What this does:**
- Assigns a string to \`NAME\`
- Uses string interpolation with \`$\`
- \`\${#VAR}\` gives the string length
- \`\${VAR^^}\` converts to uppercase

---

## 2. Conditionals

Bash uses \`if / elif / else / fi\` for branching. Use \`[[ ]]\` for modern test syntax.

\`\`\`bash
SCORE=85

if [[ $SCORE -ge 90 ]]; then
GRADE="A"
elif [[ $SCORE -ge 80 ]]; then
GRADE="B"
elif [[ $SCORE -ge 70 ]]; then
GRADE="C"
else
GRADE="F"
fi

echo "Score: $SCORE → Grade: $GRADE"
\`\`\`

**Operators:** \`-eq\` (equal), \`-ne\` (not equal), \`-gt\` (greater), \`-lt\` (less), \`-ge\` (≥), \`-le\` (≤)

---

## 3. Loops

### For Loop — iterating over a range

\`\`\`bash
echo "Counting to 5:"
for i in 1 2 3 4 5; do
echo "  → $i"
done

echo ""
echo "Fruits:"
for fruit in apple banana cherry; do
echo "  🍎 $fruit"
done
\`\`\`

### While Loop — FizzBuzz

\`\`\`bash
i=1
while [[ $i -le 20 ]]; do
if [[ $((i % 15)) -eq 0 ]]; then
  echo "$i: FizzBuzz"
elif [[ $((i % 3)) -eq 0 ]]; then
  echo "$i: Fizz"
elif [[ $((i % 5)) -eq 0 ]]; then
  echo "$i: Buzz"
else
  echo "$i"
fi
((i++))
done
\`\`\`

---

## 4. Functions

Bash functions can take arguments via \`$1\`, \`$2\`, etc.

\`\`\`bash
greet() {
local name="$1"
local time="$2"
echo "Good $time, $name! 👋"
}

greet "Alice" "morning"
greet "Bob" "evening"
\`\`\`

---

## 5. Text Processing with Pipes

Bash excels at chaining commands with \`|\` (pipe).

\`\`\`bash
# Create sample data
echo -e "banana\napple\ncherry\napple\nbanana\nbanana" > /tmp/fruits.txt

echo "=== Raw data ==="
cat /tmp/fruits.txt

echo ""
echo "=== Sorted unique with count ==="
sort /tmp/fruits.txt | uniq -c | sort -rn

echo ""
echo "=== Lines containing 'an' ==="
grep "an" /tmp/fruits.txt
\`\`\`

**Pipeline explained:**
1. \`sort\` — alphabetize lines
2. \`uniq -c\` — count consecutive duplicates
3. \`sort -rn\` — sort numerically in reverse (most frequent first)
4. \`grep\` — filter lines matching a pattern
`
    },
    {
      name: 'Data Processing',
      category: 'coding',
      icon: 'bi-database',
      description: 'CLI data manipulation — CSV parsing, JSON processing, and text transforms',
      content: `# 📊 Data Processing — CLI Toolkit

> Run each block to see real output. All commands execute in a sandboxed bash shell.

---

## 1. CSV Processing

Parse and analyze CSV data using standard Unix tools.

\`\`\`bash
# Create a sample CSV dataset
cat > /tmp/sales.csv << 'EOF'
name,region,q1,q2,q3,q4
Alice,North,1200,1500,1800,2100
Bob,South,900,1100,1300,1600
Carol,North,1500,1400,1700,1900
Dave,South,800,950,1100,1250
Eve,West,2000,2200,2500,2800
EOF

echo "=== Raw CSV ==="
cat /tmp/sales.csv

echo ""
echo "=== Header ==="
head -1 /tmp/sales.csv

echo ""
echo "=== Data rows (no header) ==="
tail -n +2 /tmp/sales.csv
\`\`\`

### Extracting Columns

\`\`\`bash
echo "=== Names and Regions ==="
tail -n +2 /tmp/sales.csv | cut -d',' -f1,2

echo ""
echo "=== Sorted by Q1 revenue (descending) ==="
tail -n +2 /tmp/sales.csv | sort -t',' -k3 -nr | head -5
\`\`\`

---

## 2. Text Transforms with awk

\`awk\` is a powerful text-processing language built into Unix.

\`\`\`bash
# Calculate total annual sales per person
echo "=== Annual Totals ==="
echo "Name | Region | Annual Total"
echo "-----|--------|-------------"
tail -n +2 /tmp/sales.csv | awk -F',' '{
total = $3 + $4 + $5 + $6
printf "%-6s | %-6s | $%d\n", $1, $2, total
}'
\`\`\`

### Filtering with awk

\`\`\`bash
# Find people with Q4 > 1800
echo "=== High Q4 Performers (Q4 > 1800) ==="
tail -n +2 /tmp/sales.csv | awk -F',' '$6 > 1800 { printf "%s: $%d\n", $1, $6 }'
\`\`\`

---

## 3. sed — Stream Editor

\`sed\` transforms text line-by-line using pattern matching.

\`\`\`bash
# Text transformations
TEXT="The quick brown fox jumps over the lazy dog"

echo "Original: $TEXT"
echo "Replace fox→cat: $(echo "$TEXT" | sed 's/fox/cat/')"
echo "Replace all spaces with underscores: $(echo "$TEXT" | sed 's/ /_/g')"
echo "Delete 'the' (case-insensitive): $(echo "$TEXT" | sed 's/[Tt]he //g')"
\`\`\`

---

## 4. Working with JSON (using bash)

Parse simple JSON structures with bash string tools.

\`\`\`bash
# Create JSON-like data and process it
cat > /tmp/users.txt << 'EOF'
{"name": "Alice", "age": 30, "role": "engineer"}
{"name": "Bob", "age": 25, "role": "designer"}
{"name": "Carol", "age": 35, "role": "engineer"}
{"name": "Dave", "age": 28, "role": "manager"}
EOF

echo "=== All Users ==="
cat /tmp/users.txt

echo ""
echo "=== Engineers Only ==="
grep '"engineer"' /tmp/users.txt

echo ""
echo "=== Names ==="
grep -o '"name": "[^"]*"' /tmp/users.txt | cut -d'"' -f4
\`\`\`

---

## 5. Generating Reports

\`\`\`bash
echo "╔══════════════════════════════════╗"
echo "║     SALES SUMMARY REPORT        ║"
echo "╠══════════════════════════════════╣"

# Count by region
echo "║                                  ║"
echo "║ Employees by Region:             ║"
tail -n +2 /tmp/sales.csv | cut -d',' -f2 | sort | uniq -c | while read count region; do
printf "║   %-8s: %d                    ║\n" "$region" "$count"
done

echo "║                                  ║"
echo "╚══════════════════════════════════╝"
\`\`\`
`
    },
    {
      name: 'DevOps Snippets',
      category: 'coding',
      icon: 'bi-gear',
      description: 'Common DevOps commands — system info, disk usage, networking, and process management',
      content: `# ⚙️ DevOps Snippets — Quick Reference

> Runnable bash snippets for common operations tasks.
> These run in a sandboxed environment — safe to experiment!

---

## 1. System Information

\`\`\`bash
echo "=== System Overview ==="
echo "Hostname: $(hostname 2>/dev/null || echo 'sandbox')"
echo "Shell: $SHELL"
echo "User: $(whoami 2>/dev/null || echo 'sandbox-user')"
echo "Date: $(date)"
echo "Uptime: $(uptime 2>/dev/null || echo 'N/A')"
\`\`\`

---

## 2. Working with Environment Variables

\`\`\`bash
# Set and display env vars
export APP_NAME="MyApp"
export APP_ENV="production"
export APP_PORT=8080
export DB_HOST="db.example.com"

echo "=== Application Config ==="
env | grep "^APP_" | sort

echo ""
echo "=== Formatted ==="
for var in APP_NAME APP_ENV APP_PORT DB_HOST; do
printf "  %-12s = %s\n" "$var" "\${!var}"
done
\`\`\`

**Tip:** \`\${!var}\` is bash indirect expansion — it gets the value of the variable whose *name* is stored in \`$var\`.

---

## 3. File System Operations

\`\`\`bash
# Create a project structure
mkdir -p /tmp/myproject/{src,tests,docs,config}

# Create some files
echo '#!/bin/bash' > /tmp/myproject/src/main.sh
echo '# Tests' > /tmp/myproject/tests/test_main.sh
echo '# README' > /tmp/myproject/docs/README.md
echo 'PORT=3000' > /tmp/myproject/config/app.env

echo "=== Project Structure ==="
find /tmp/myproject -type f | sort | while read f; do
size=$(wc -c < "$f")
printf "  %-45s %4d bytes\n" "$f" "$size"
done

echo ""
echo "=== Directory Summary ==="
echo "Files: $(find /tmp/myproject -type f | wc -l)"
echo "Dirs:  $(find /tmp/myproject -type d | wc -l)"
\`\`\`

---

## 4. Log Processing

\`\`\`bash
# Generate sample log entries
cat > /tmp/app.log << 'EOF'
2024-01-15 10:23:01 [INFO] Server started on port 8080
2024-01-15 10:23:05 [INFO] Database connected
2024-01-15 10:24:12 [WARN] Slow query detected (2.3s)
2024-01-15 10:25:30 [ERROR] Connection timeout to redis:6379
2024-01-15 10:25:31 [INFO] Retrying connection...
2024-01-15 10:25:33 [INFO] Redis reconnected
2024-01-15 10:30:45 [ERROR] Out of memory: heap limit reached
2024-01-15 10:30:46 [WARN] GC pause exceeded 500ms
2024-01-15 10:31:00 [INFO] Memory recovered after GC
EOF

echo "=== Log Level Summary ==="
grep -oP '\[\K[A-Z]+' /tmp/app.log 2>/dev/null || grep -o '\[.*\]' /tmp/app.log | tr -d '[]' | sort | uniq -c | sort -rn

echo ""
echo "=== Errors Only ==="
grep "ERROR" /tmp/app.log

echo ""
echo "=== Timeline ==="
awk '{print $2, $3}' /tmp/app.log
\`\`\`

---

## 5. Useful One-Liners

\`\`\`bash
echo "=== Generate a random password ==="
cat /dev/urandom 2>/dev/null | tr -dc 'A-Za-z0-9!@#$%' | head -c 20 || echo "$(date +%s | sha256sum 2>/dev/null || echo $RANDOM$RANDOM | md5sum 2>/dev/null || echo "FallbackPass_$RANDOM")" | head -c 20
echo ""

echo ""
echo "=== Count lines of code in a project ==="
find /tmp/myproject -name '*.sh' -o -name '*.md' -o -name '*.env' | xargs wc -l 2>/dev/null

echo ""
echo "=== Quick math ==="
echo "2^10 = $((2**10))"
echo "Hex FF = $((16#FF))"
echo "Octal 77 = $((8#77))"
\`\`\`
`
    },
    {
      name: 'Algebra & Calculus',
      category: 'maths',
      icon: 'bi-calculator',
      description: 'Fundamental algebra and calculus with step-by-step evaluations',
      content: `# 📐 Algebra & Calculus — Interactive Math

> Click **▶ Evaluate** on any math block to compute it live.
> Powered by [math.js](https://mathjs.org/) — a comprehensive math library.

---

## 1. Basic Arithmetic & Expressions

math.js handles operator precedence, parentheses, and large numbers.

\`\`\`math
2 + 3 * 4
(2 + 3) * 4
2 ^ 10
sqrt(144)
abs(-42)
\`\`\`

**Explanation:**
- \`2 + 3 * 4\` → multiplication first: 2 + 12 = **14**
- \`(2 + 3) * 4\` → parentheses first: 5 × 4 = **20**
- \`2 ^ 10\` → 2 raised to the 10th power = **1024**
- \`sqrt(144)\` → square root = **12**

---

## 2. Variables & Algebra

Variables persist across lines within the same block.

\`\`\`math
x = 5
y = 3
x^2 + y^2
sqrt(x^2 + y^2)
\`\`\`

**Pythagorean theorem:** Given sides x=5 and y=3, the hypotenuse is \`√(25 + 9) = √34 ≈ 5.83\`

### Quadratic Formula

For $ax^2 + bx + c = 0$, the roots are $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

\`\`\`math
a = 1
b = -5
c = 6
// Discriminant
D = b^2 - 4*a*c
// Roots
x1 = (-b + sqrt(D)) / (2*a)
x2 = (-b - sqrt(D)) / (2*a)
\`\`\`

**Result:** The equation $x^2 - 5x + 6 = 0$ has roots **x = 3** and **x = 2**

---

## 3. Trigonometry

\`\`\`math
// Angles in radians
sin(pi / 6)
cos(pi / 3)
tan(pi / 4)
// Convert degrees to radians
45 * (pi / 180)
sin(45 * pi / 180)
\`\`\`

**Key values:**
- sin(30°) = sin(π/6) = **0.5**
- cos(60°) = cos(π/3) = **0.5**
- tan(45°) = tan(π/4) = **1**

---

## 4. Logarithms & Exponentials

\`\`\`math
// Natural log
log(e)
log(e^3)
// Base-10 log
log10(1000)
log10(50)
// Exponential
exp(1)
exp(0)
\`\`\`

**Explanation:**
- \`log(e)\` = ln(e) = **1** (natural log)
- \`log10(1000)\` = **3** (since 10³ = 1000)
- \`exp(1)\` = e¹ ≈ **2.718** (Euler's number)

---

## 5. Calculus Concepts

While math.js doesn't do symbolic calculus, we can approximate **derivatives** and compute **summations**:

### Numerical Derivative

Approximate f'(x) using the limit definition: $f'(x) \\approx \\frac{f(x+h) - f(x-h)}{2h}$

\`\`\`math
// f(x) = x^3 at x = 2
// Exact derivative: f'(x) = 3x^2 = 12
h = 0.0001
f_plus = (2 + h)^3
f_minus = (2 - h)^3
derivative = (f_plus - f_minus) / (2 * h)
\`\`\`

**Result:** The numerical derivative of x³ at x=2 ≈ **12** (exact: 3·2² = 12 ✓)

### Summation (Σ)

$$\\sum_{k=1}^{100} k = \\frac{100 \\times 101}{2} = 5050$$

\`\`\`math
// Sum of 1 to 100
sum(1:100)
// Verify with formula
100 * 101 / 2
\`\`\`
`
    },
    {
      name: 'Statistics & Probability',
      category: 'maths',
      icon: 'bi-bar-chart-line',
      description: 'Statistical computations — mean, standard deviation, combinations, and distributions',
      content: `# 📊 Statistics & Probability

> Click **▶ Evaluate** to compute each block. Variables carry over within a block.

---

## 1. Descriptive Statistics

### Central Tendency

\`\`\`math
data = [85, 90, 78, 92, 88, 76, 95, 89, 84, 91]
mean(data)
median(data)
min(data)
max(data)
\`\`\`

**Interpretation:**
- **Mean** = average of all values
- **Median** = middle value when sorted (robust to outliers)

### Spread & Variability

\`\`\`math
data = [85, 90, 78, 92, 88, 76, 95, 89, 84, 91]
// Variance
variance(data)
// Standard deviation
std(data)
// Range
max(data) - min(data)
\`\`\`

**Explanation:**
- **Variance** σ² = average of squared deviations from the mean
- **Std Dev** σ = √variance — measures spread in same units as data
- **Range** = max − min — simplest measure of spread

---

## 2. Combinatorics

Counting arrangements and selections.

### Factorials & Permutations

\`\`\`math
// Factorial: n!
factorial(5)
factorial(10)
// Permutations: P(n,r) = n! / (n-r)!
// "How many ways to arrange 3 items from 5?"
factorial(5) / factorial(5 - 3)
\`\`\`

### Combinations

$$C(n, r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}$$

\`\`\`math
// Combinations: C(n,r) = n! / (r! * (n-r)!)
// "How many ways to choose 3 items from 10?"
combinations(10, 3)
// Lottery: choose 6 from 49
combinations(49, 6)
\`\`\`

**Lottery odds:** Choosing 6 numbers from 49 → **13,983,816** possible combinations. That's roughly 1 in 14 million!

---

## 3. Probability

### Basic Probability Calculations

\`\`\`math
// Probability of rolling a 6 on a fair die
p_six = 1/6
// Probability of NOT rolling a 6
p_not_six = 1 - p_six
// Probability of rolling a 6 at least once in 4 rolls
p_at_least_one = 1 - (5/6)^4
\`\`\`

**Explanation:**
- P(at least one 6 in 4 rolls) = 1 − P(no 6 in any roll) = 1 − (5/6)⁴ ≈ **51.8%**

### Expected Value

\`\`\`math
// Fair coin: +$10 for heads, -$6 for tails
// E[X] = Σ(value × probability)
E_coin = 10 * 0.5 + (-6) * 0.5
// Weighted die: sides 1-6 with double chance for 6
// Total probability weight: 5*1 + 1*2 = 7
E_die = (1+2+3+4+5) * (1/7) + 6 * (2/7)
\`\`\`

---

## 4. Sequences & Series

### Geometric Series

$$S = a \\cdot \\frac{1 - r^n}{1 - r}$$

\`\`\`math
// Geometric series: a=2, r=3, n=5 terms
a = 2
r = 3
n = 5
S = a * (1 - r^n) / (1 - r)
// Verify by summing terms: 2 + 6 + 18 + 54 + 162
2 + 6 + 18 + 54 + 162
\`\`\`

### Compound Interest

$$A = P \\left(1 + \\frac{r}{n}\\right)^{nt}$$

\`\`\`math
// $1000 at 5% annual interest, compounded monthly, for 10 years
P = 1000
r = 0.05
n = 12
t = 10
A = P * (1 + r/n)^(n*t)
\`\`\`

**Result:** \\$1,000 grows to ≈ **\\$1,647** over 10 years at 5% compounded monthly.

---

## 5. Normal Distribution (Z-scores)

\`\`\`math
// Student scores: mean = 75, std = 10
// A student scored 92. What's their z-score?
mu = 75
sigma = 10
score = 92
z = (score - mu) / sigma
// How many std deviations above the mean?
\`\`\`

**Interpretation:** A z-score of **1.7** means the student scored 1.7 standard deviations above the mean — roughly in the **top 5%**.
`
    },
    {
      name: 'Linear Algebra',
      category: 'maths',
      icon: 'bi-grid-3x3',
      description: 'Matrix operations — multiplication, determinants, inverses, and transforms',
      content: `# 🔢 Linear Algebra — Matrix Operations

> Click **▶ Evaluate** to compute. math.js has full matrix support!

---

## 1. Creating Matrices

\`\`\`math
// 2×2 matrix
A = [[1, 2], [3, 4]]
A
// 3×3 identity matrix
I = identity(3)
I
\`\`\`

**Notation:** Matrices are written as arrays of rows: \`[[row1], [row2], ...]\`

---

## 2. Matrix Arithmetic

\`\`\`math
A = [[1, 2], [3, 4]]
B = [[5, 6], [7, 8]]
// Addition
add(A, B)
// Scalar multiplication
multiply(3, A)
// Element-wise multiplication
dotMultiply(A, B)
\`\`\`

### Matrix Multiplication

\`\`\`math
A = [[1, 2], [3, 4]]
B = [[5, 6], [7, 8]]
// Matrix product (A × B)
multiply(A, B)
\`\`\`

**How it works:**
$$AB = \\begin{bmatrix} 1 \\cdot 5 + 2 \\cdot 7 & 1 \\cdot 6 + 2 \\cdot 8 \\\\ 3 \\cdot 5 + 4 \\cdot 7 & 3 \\cdot 6 + 4 \\cdot 8 \\end{bmatrix} = \\begin{bmatrix} 19 & 22 \\\\ 43 & 50 \\end{bmatrix}$$

---

## 3. Determinant & Inverse

\`\`\`math
A = [[1, 2], [3, 4]]
// Determinant
det(A)
// Inverse
inv(A)
// Verify: A × A⁻¹ = I
multiply(A, inv(A))
\`\`\`

**Explanation:**
- det([[a,b],[c,d]]) = ad − bc = (1)(4) − (2)(3) = **−2**
- A matrix is invertible if and only if det ≠ 0
- A × A⁻¹ always equals the identity matrix

---

## 4. Transpose & Trace

\`\`\`math
A = [[1, 2, 3], [4, 5, 6]]
// Transpose: flip rows and columns
transpose(A)
// Trace: sum of diagonal elements (square matrix)
B = [[1, 2], [3, 4]]
trace(B)
\`\`\`

**Properties:**
- Transpose of a 2×3 matrix gives a 3×2 matrix
- Trace(B) = 1 + 4 = **5** (sum of main diagonal)

---

## 5. Solving Linear Systems

Solve Ax = b:

$$\\begin{cases} 2x + y = 5 \\\\ x + 3y = 10 \\end{cases}$$

\`\`\`math
// Coefficient matrix A and constants vector b
A = [[2, 1], [1, 3]]
b = [5, 10]
// Solve for x: x = A⁻¹b
x = multiply(inv(A), b)
\`\`\`

**Solution:** x = **1**, y = **3**

**Verification:** 2(1) + 3 = 5 ✓ and 1 + 3(3) = 10 ✓

---

## 6. Eigenvalues

\`\`\`math
A = [[4, 1], [2, 3]]
eigs(A).values
\`\`\`

**Eigenvalues** of a matrix A are scalars λ where Av = λv for some non-zero vector v. They reveal important properties like stability, growth rates, and principal directions.

---

## 7. Vector Operations

\`\`\`math
u = [3, 4]
v = [1, 2]
// Dot product
dot(u, v)
// Cross product (3D)
a = [1, 0, 0]
b = [0, 1, 0]
cross(a, b)
// Vector norm (length)
norm(u)
\`\`\`

**Key results:**
- Dot product: 3·1 + 4·2 = **11**
- Cross product of x̂ and ŷ unit vectors = **ẑ** = [0, 0, 1]
- Norm of [3,4]: √(9+16) = **5**
`
    },
    {
      name: 'Geist — Tech Pitch',
      category: 'ppt',
      icon: 'bi-easel',
      description: 'Clean Vercel-inspired tech presentation — cover slide, features, architecture, and closing',
      content: 'layout: cover\n\n# Build Faster, Ship Smarter\n\nA modern approach to developer productivity\n\n<!-- Welcome everyone. Today I\'ll walk you through our vision for the next generation of developer tools. -->\n\n---\n\n# The Problem\n\n- **80%** of developer time is spent on repetitive tasks\n- Context switching kills flow state\n- Toolchains are fragmented and complex\n- Deployment pipelines are still painful\n\n> "The best tool is the one you don\'t notice."\n\n<!-- Key insight: developers want to build, not configure. Every minute spent on tooling is a minute not spent on the product. -->\n\n---\n\n# Our Solution\n\n| Feature | Before | After |\n|:--------|:-------|:------|\n| Build Time | 45 seconds | **2.3 seconds** |\n| Deploy | 12 steps | **`git push`** |\n| Config | 200 LOC | **Zero-config** |\n| Preview | Manual | **Automatic** |\n\n> [!TIP]\n> Framework-agnostic. Works with React, Vue, Svelte, and more.\n\n---\n\nlayout: center\n\n# Architecture\n\n```mermaid\nflowchart LR\n    A[Developer] --> B[Git Push]\n    B --> C{Build System}\n    C --> D[Edge Network]\n    C --> E[Serverless Functions]\n    D --> F[Global CDN]\n    E --> F\n    F --> G[Users Worldwide]\n```\n\n---\n\n# Traction & Metrics\n\n- 🚀 **50K+** projects deployed\n- ⚡ **99.99%** uptime SLA\n- 🌍 **200ms** average response time globally\n- 💜 **4.9/5** developer satisfaction score\n\n---\n\nlayout: cover\n\n# Let\'s Build Together\n\n**Start free** → Scale when ready\n\nQuestions?\n\n<!-- Thank you for your time. I\'m happy to take any questions. -->'
    },
    {
      name: 'Startup Pitch Deck',
      category: 'ppt',
      icon: 'bi-rocket-takeoff',
      description: 'Classic pitch deck — problem, solution, market, business model, team, and ask',
      content: 'layout: cover\n\n# Acme AI\n\nIntelligent automation for the modern enterprise\n\n*Series A — Confidential*\n\n<!-- Good morning. I\'m excited to share what we\'re building at Acme AI. -->\n\n---\n\n# The Problem\n\n- Enterprises spend **$3.4T annually** on manual data processing\n- 67% of knowledge workers do repetitive tasks daily\n- Existing RPA tools are brittle and expensive\n- AI adoption remains slow due to integration complexity\n\n> "We\'re drowning in data but starving for insights."\n> — Fortune 500 CTO\n\n<!-- This is a massive market pain that hasn\'t been solved properly. -->\n\n---\n\n# Our Solution\n\n**AI-native workflow automation** that learns from your team.\n\n- 🧠 **Learns** — Watches how experts work, builds models\n- ⚡ **Automates** — Takes over repetitive decisions with 99.2% accuracy\n- 🔗 **Integrates** — Plugs into Slack, Jira, Salesforce, SAP, and 200+ tools\n- 📊 **Reports** — Real-time dashboards on time and cost savings\n\n> [!IMPORTANT]\n> No-code setup. Your team is productive in days, not months.\n\n---\n\n# Market Opportunity\n\n| Segment | TAM | SAM | SOM |\n|:--------|:----|:----|:----|\n| Enterprise AI | $150B | $25B | $2.5B |\n| Process Automation | $12B | $4B | $800M |\n| **Combined** | **$162B** | **$29B** | **$3.3B** |\n\n*Growing at 34% CAGR (2024–2030)*\n\n---\n\n# Business Model\n\n```mermaid\nflowchart TD\n    A[Free Tier] -->|Convert 12%| B[Team Plan $49/mo]\n    B -->|Expand 8%| C[Enterprise Custom]\n    C --> D[Annual Contracts]\n    D --> E[120% NDR]\n```\n\n**Unit Economics:**\n- CAC: $1,200 → LTV: $18,000\n- LTV/CAC Ratio: **15x**\n- Gross Margin: **82%**\n\n---\n\n# Traction\n\n- 📈 **$2.4M ARR** (3x YoY growth)\n- 🏢 **120 enterprise customers** including 3 Fortune 500\n- 🔄 **120% net dollar retention**\n- 👥 **Team of 28** from Google, Meta, and McKinsey\n\n---\n\nlayout: cover\n\n# The Ask\n\n**Raising $15M Series A** to:\n\n- Scale engineering team (ML + platform)\n- Expand to EU market\n- Achieve $10M ARR by Q4 2026\n\n*Contact: founders@acme-ai.com*\n\n<!-- We\'d love to have you on this journey. Let\'s talk. -->'
    },
    {
      name: 'Team Retrospective',
      category: 'ppt',
      icon: 'bi-people',
      description: 'Sprint retro slides — wins, challenges, learnings, and action items',
      content: 'layout: cover\n\n# Sprint 24 Retrospective\n\nTeam Phoenix · $(date)\n\n---\n\n# 🎉 What Went Well\n\n- Shipped the new onboarding flow — **+23% activation**\n- Zero P0 incidents this sprint\n- Pair programming sessions boosted code review speed\n- Design-engineering handoff process is smoother\n\n> "Best sprint we\'ve had in Q1" — Team sentiment survey\n\n<!-- Let\'s celebrate these wins before diving into improvements. -->\n\n---\n\n# 😤 What Didn\'t Go Well\n\n- Payment integration took 3x the estimated time\n- Flaky E2E tests blocked deploys twice\n- Stakeholder requirements changed mid-sprint\n- Too many meetings on Wednesday (5 hours!)\n\n> [!WARNING]\n> We need to address the test flakiness — it\'s eroding team trust in CI.\n\n---\n\n# 📊 Sprint Metrics\n\n| Metric | Target | Actual | Status |\n|:-------|:-------|:-------|:-------|\n| Story Points | 34 | **31** | 🟡 91% |\n| Bug Fix Rate | 90% | **95%** | 🟢 Exceeded |\n| PR Review Time | <4h | **3.2h** | 🟢 On target |\n| Deploy Frequency | Daily | **1.8/day** | 🟢 Exceeded |\n| Test Coverage | 80% | **78%** | 🟡 Close |\n\n---\n\n# 💡 Key Learnings\n\n1. **Break down payment stories smaller** — anything touching external APIs needs a spike first\n2. **Quarantine flaky tests** — don\'t let them block the main pipeline\n3. **"No Meeting Wednesday"** — protect deep work time\n4. **Async standups** work well for distributed team members\n\n---\n\n# ✅ Action Items\n\n- [ ] **@alice** — Create test stability dashboard by Friday\n- [ ] **@bob** — Spike on payment provider SDK v3 migration\n- [ ] **@carol** — Propose "No Meeting Wednesday" policy to leadership\n- [ ] **@dave** — Set up async standup bot in Slack\n- [ ] **@team** — Review and groom backlog before Sprint 25 planning\n\n---\n\nlayout: center\n\n# Thank You! 🙌\n\nLet\'s make Sprint 25 even better.\n\n**Next planning session:** Monday 10:00 AM\n\n<!-- Great retrospective everyone. See you at planning! -->'
    },
    {
      name: 'Dracula — Dev Talk',
      category: 'ppt',
      icon: 'bi-moon-stars',
      description: 'Dark developer-focused theme inspired by Dracula — ideal for code-heavy tech talks',
      preview: 'assets/ppt-previews/dracula.png',
      content: 'layout: cover\nbackground: #282a36\n\n# Building a Modern CLI Tool\n\nFrom zero to npm publish in 30 minutes\n\n<!-- Hey everyone! Today I\'ll show you how to build and publish a CLI tool that developers will actually love using. -- >\n\n-- -\n\n# Why CLIs Matter\n\n - 🖥️ ** 73 %** of developers prefer CLI over GUI for dev tasks\n - ⚡ Faster iteration — no mouse, no menus\n - 🔗 Composable — pipe, chain, automate\n - 📦 Easy to distribute via npm / pip / brew\n\n > \"Any sufficiently advanced CLI is indistinguishable from magic.\"\n\n<!-- Think about it: git, docker, kubectl — the most important tools are CLIs. -->\n\n---\n\n# Architecture\n\n```mermaid\nflowchart TD\n    A[CLI Entry Point] --> B[Argument Parser]\n    B --> C{Command Router}\n    C --> D[init]\n    C --> E[build]\n    C --> F[deploy]\n    D --> G[Template Engine]\n    E --> H[Bundler]\n    F --> I[Cloud API]\n    G --> J[Output]\n    H --> J\n    I --> J\n```\n\n<!-- The architecture is simple: parse args, route to the right command, execute. -->\n\n---\n\n# The Code\n\n```javascript\nimport { program } from \'commander\';\nimport chalk from \'chalk\';\nimport ora from \'ora\';\n\nprogram\n  .name(\'mycli\')\n  .version(\'1.0.0\')\n  .description(\'A blazing fast project scaffolder\');\n\nprogram\n  .command(\'init <name>\')\n  .description(\'Create a new project\')\n  .option(\'-t, --template <type>\', \'template\', \'default\')\n  .action(async (name, opts) => {\n    const spinner = ora(\'Creating project...\').start();\n    await scaffold(name, opts.template);\n    spinner.succeed(chalk.green(`${name} created!`));\n  });\n\nprogram.parse();\n```\n\n<!-- Commander.js for parsing, chalk for colors, ora for spinners. The holy trinity. -->\n\n---\n\n# Testing Your CLI\n\n```bash\n# Unit test the arg parser\nnpm test\n\n# Integration test\necho \"Testing init command...\"\nnode ./bin/mycli init my-project --template react\nls my-project/\n\n# Verify output\necho \"✓ Package.json exists\"\ntest -f my-project/package.json && echo \"PASS\" || echo \"FAIL\"\n```\n\n---\n\n# Publishing to npm\n\n| Step | Command | Time |\n|:-----|:--------|:-----|\n| Login | `npm login` | 10s |\n| Dry run | `npm publish --dry-run` | 5s |\n| Publish | `npm publish` | 30s |\n| Verify | `npx mycli --version` | 5s |\n\n> [!TIP]\n> Always do a dry run first. Always.\n\n---\n\nlayout: cover\nbackground: #282a36\n\n# Ship It 🚀\n\n```bash\nnpm publish && echo \"You\'re live!\"\n```\n\n<!-- Thanks everyone! The repo is open source — link in the slides. -->'
    },
    {
      name: 'Academic — Research',
      category: 'ppt',
      icon: 'bi-mortarboard',
      description: 'Scholarly presentation with LaTeX equations, citations, and structured methodology',
      preview: 'assets/ppt-previews/academic.png',
      content: 'layout: cover\n\n# Attention Mechanisms in Neural Machine Translation\n\nDr. Sarah Chen · Department of Computer Science\n\n*International Conference on NLP — $(date)*\n\n<!-- Thank you for having me. Today I\'ll present our findings on improved attention mechanisms for low - resource language pairs. -- >\n\n-- -\n\n# Motivation\n\n - Standard transformer attention scales as $O(n ^ 2)$ with sequence length\n - Low - resource languages lack parallel corpora for fine - tuning\n - Current approaches require 100K + sentence pairs\n - Our method achieves comparable BLEU with ** 10x less data **\n\n > [!NOTE]\n > This work extends Vaswani et al. (2017) with sparse attention patterns.\n\n < !--The key insight is that not all attention heads are equally important for every language pair. -- >\n\n-- -\n\n# Methodology\n\n## Model Architecture\n\nWe modify the multi - head attention mechanism: \n\n$$\\\\text{ Attention } (Q, K, V) = \\\\text{ softmax } \\\\left(\\\\frac{ QK^ T}{ \\\\sqrt{ d_k }} + M_{ \\\\text{ sparse }}\\\\right)V$$\n\nwhere $M_{ \\\\text{ sparse } }$ is a learned binary mask that prunes low - utility attention connections.\n\n### Training Procedure\n\n1.Pre - train on high - resource pair(EN - DE, 4.5M sentences) \n2.Learn sparse masks via Gumbel - Softmax relaxation\n3.Transfer and fine - tune on target low - resource pair\n4.Evaluate on held - out test set(BLEU, chrF++) \n\n-- -\n\n# Results\n\n | Language Pair | Baseline BLEU | Our BLEU | Data Used |\n |: -------------|: -------------|: ---------|: ----------|\n | EN → NE | 12.4 | ** 18.7 ** | 15K |\n | EN → SI | 14.1 | ** 21.3 ** | 22K |\n | EN → MY | 8.9 | ** 15.6 ** | 8K |\n | EN → KM | 10.2 | ** 17.1 ** | 12K |\n\n * All improvements statistically significant(p < 0.01, bootstrap resampling) *\n\n < !--Notice the consistent improvement across all four low - resource pairs.The gains are largest when data is most scarce. -- >\n\n-- -\n\n# Ablation Study\n\n```mermaid\nxychart-beta\n    title \"BLEU Score vs Training Data Size (EN→NE)\"\n    x-axis [1K, 5K, 10K, 15K, 25K, 50K]\n    y-axis \"BLEU Score\" 0 --> 25\n    line [4.2, 9.8, 14.5, 18.7, 20.1, 21.3]\n    line [3.1, 6.4, 9.2, 12.4, 16.8, 19.5]\n```\n\nKey findings from the ablation: \n - Sparse attention most effective in ** low - data regime ** (< 15K) \n - Mask transfer from high - resource pairs adds + 2.3 BLEU on average\n - Diminishing returns beyond 50K sentence pairs\n\n-- -\n\n# Conclusion & Future Work\n\n### Contributions\n - Novel sparse attention transfer method for NMT\n - State - of - the - art on 4 low - resource benchmarks\n - Open - source implementation available\n\n### Future Directions\n - Extend to multilingual(many - to - many) settings\n - Apply to speech translation\n - Investigate curriculum learning for mask training\n\n > ** References:**\n > Vaswani et al.\"Attention is All You Need\" (NeurIPS 2017)\n> Chen et al. \"Sparse Attention for Low-Resource NMT\" (Our paper, 2025)\n\n---\n\nlayout: center\n\n# Thank You\n\n📧 s.chen@university.edu · 🐙 github.com/sparse-attn\n\n*Questions?*'
    },
    {
      name: 'Unicorn — Workshop',
      category: 'ppt',
      icon: 'bi-palette',
      description: 'Vibrant and colorful creative workshop slides with interactive exercises',
      preview: 'assets/ppt-previews/unicorn.png',
      content: 'layout: cover\nbackground: linear-gradient(135deg, #667eea 0%, #764ba2 100%)\n\n# 🦄 Design Sprint Workshop\n\nFrom idea to prototype in 5 days\n\n<!-- Welcome everyone! This workshop will take you through the Google Ventures design sprint process. -->\n\n---\n\n# What is a Design Sprint?\n\n> A **5-day process** for answering critical business questions through design, prototyping, and testing.\n\n| Day | Focus | Output |\n|:----|:------|:-------|\n| 🗺️ Mon | **Map** | Problem map & target |\n| ✏️ Tue | **Sketch** | Solution sketches |\n| ⭐ Wed | **Decide** | Storyboard |\n| 🔨 Thu | **Prototype** | Realistic facade |\n| 🧪 Fri | **Test** | User feedback |\n\n*From: Jake Knapp, \"Sprint\" (2016)*\n\n---\n\n# Day 1: Map the Problem\n\n```mermaid\nflowchart LR\n    A[User Discovers Product] --> B[Signs Up]\n    B --> C[Onboarding]\n    C --> D{Aha Moment?}\n    D -->|Yes| E[Active User]\n    D -->|No| F[Churns]\n    F --> G[Lost Revenue]\n    E --> H[Refers Friends]\n```\n\n### Your Turn! 🎯\n\n- [ ] List the **long-term goal** for your product\n- [ ] Map the **customer journey** from discovery to value\n- [ ] Identify the **biggest risk** — that\'s your sprint target\n\n-- -\n\n# Day 2: Sketch Solutions\n\n### The \"Crazy 8s\" Exercise\n\n1. Fold paper into **8 panels**\n2. Set timer for **8 minutes**\n3. Sketch **one idea per panel** (1 min each)\n4. No judgment — quantity over quality!\n5. Pick your **top 2** to refine\n\n> [!TIP]\n> Steal ideas shamelessly! The best designs remix existing patterns.\n\n### Lightning Demos\n\n- 🛒 **Shopify** — Frictionless checkout\n- 🎵 **Spotify** — Personalized onboarding\n- 📱 **Duolingo** — Gamified progression\n- ✈️ **Airbnb** — Trust through photography\n\n---\n\n# Day 3: Decide\n\n### Voting Protocol\n\n1. **Gallery walk** — Review all sketches silently (10 min)\n2. **Dot vote** — Each person gets 3 dots 🔴🔴🔴\n3. **Speed critique** — 3 min per top idea\n4. **Supervote** — Decision-maker picks the winner ⭐\n\n### Build the Storyboard\n\n| Panel | Scene | Notes |\n|:------|:------|:------|\n| 1 | User opens app | First impression |\n| 2 | Onboarding flow | 3 steps max |\n| 3 | Core action | The magic moment |\n| 4 | Success state | Delight! 🎉 |\n| 5 | Share / Invite | Growth loop |\n\n---\n\n# Day 4 & 5: Prototype & Test\n\n### Prototype Tools\n- **Figma** — High-fidelity screens\n- **Keynote** — Clickable prototype\n- **Paper** — Low-fi is fine too!\n\n### User Testing Script\n1. \"Tell me about a time when...\" (context)\n2. \"What do you think this does?\" (first impression)\n3. \"Try to [complete the task]\" (observation)\n4. \"What was confusing?\" (feedback)\n5. \"How likely would you use this?\" (1-10 scale)\n\n> [!IMPORTANT]\n> Test with **5 users** — that catches 85% of usability issues.\n\n---\n\nlayout: cover\nbackground: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)\n\n# Go Build Something Amazing! 🚀\n\n*\"The biggest risk is not taking any risk.\"*\n— Mark Zuckerberg'
    },
    {
      name: 'Mint — Product Update',
      category: 'ppt',
      icon: 'bi-box-seam',
      description: 'Fresh and clean product update presentation with roadmap and metrics',
      preview: 'assets/ppt-previews/mint.png',
      content: 'layout: cover\n\n# Product Update — Q1 2025\n\nWhat we shipped, what we learned, what\'s next\n\n < !--Hi team! Here\'s our quarterly product review covering key launches, metrics, and the roadmap ahead. -->\n\n---\n\n# Q1 Highlights\n\n🎯 **3 major launches** · 📈 **+47% MAU** · 🐛 **-62% P0 bugs**\n\n| Launch | Date | Impact |\n|:-------|:-----|:-------|\n| Real-time collaboration | Jan 15 | +34% session time |\n| Advanced filters | Feb 2 | +28% search conversion |\n| Mobile app v2.0 | Mar 10 | 4.8★ App Store rating |\n\n> [!TIP]\n> Real-time collab drove the highest engagement increase we\'ve ever seen.\n\n < !--Each launch exceeded our initial targets.Let me walk through the details. -- >\n\n-- -\n\n# Key Metrics\n\n | Metric | Q4 2024 | Q1 2025 | Change |\n |: -------|: --------|: --------|: -------|\n | MAU | 124K | ** 182K ** | +47 % 📈 |\n | DAU / MAU | 31 % | ** 38 %** | +7pp |\n | NPS | 42 | ** 51 ** | +9 |\n | Churn | 5.2 % | ** 3.8 %** | -1.4pp ✅ |\n | ARPU | $12.40 | ** $14.80 ** | +19 % |\n | Revenue | $1.54M | ** $2.69M ** | +75 % 🚀 |\n\n-- -\n\n# User Funnel\n\n```mermaid\nflowchart TD\n    A[\"Visitors\n    892K\"] --> B[\"Sign-ups\n    45K (5.0%)\"]\n    B --> C[\"Activated\n    31K (69%)\"]\n    C --> D[\"Week 1 Retained\n    22K (71%)\"]\n    D --> E[\"Converted to Paid\n    4.2K (19%)\"]\n    E --> F[\"Monthly Active Paid\n    3.8K (90% retention)\"]\n```\n\n ** Focus areas:** Activation(69 % → target 80 %) and trial - to - paid conversion(19 % → target 25 %) \n\n-- -\n\n# What We Learned\n\n### ✅ What Worked\n - ** In - app onboarding tour ** — +15 % activation\n - ** Weekly digest emails ** — 2.3x re - engagement\n - ** Community Slack channel ** — Organic word - of - mouth\n\n### ❌ What Didn\'t\n- Push notifications — 78% opt-out rate\n- Gamification badges — No measurable retention impact\n- Annual plan discount — Cannibalized monthly revenue\n\n> [!WARNING]\n> Gamification without value = gimmick. Users saw right through it.\n\n---\n\n# Q2 Roadmap\n\n| Priority | Feature | Target | Owner |\n|:---------|:--------|:-------|:------|\n| P0 | API v2 with webhooks | Apr 30 | @backend |\n| P0 | Enterprise SSO (SAML) | May 15 | @security |\n| P1 | Dashboard builder | Jun 1 | @frontend |\n| P1 | Bulk import/export | Jun 15 | @data |\n| P2 | Dark mode | Jun 30 | @design |\n\n---\n\nlayout: center\n\n# Let\'s Build Q2 Together 🌱\n\n ** OKR planning session:** Next Tuesday, 2 PM\n\n < !--Thanks everyone! Please review the detailed metrics doc I shared and come to planning with your team\'s input. -->'
    },
    {
      name: 'Nord — Engineering Review',
      category: 'ppt',
      icon: 'bi-snow',
      description: 'Cool Nordic-inspired engineering review with system diagrams and incident postmortems',
      preview: 'assets/ppt-previews/nord.png',
      content: 'layout: cover\nbackground: #2e3440\n\n# Engineering Review — Q1 2025\n\nPlatform Team · $(date)\n\n<!-- Let\'s review our engineering health, incidents, and infrastructure improvements. -- >\n\n-- -\n\n# System Health Dashboard\n\n | Service | Uptime | P50 Latency | P99 Latency | Error Rate |\n |: --------|: -------|: ------------|: ------------|: -----------|\n | API Gateway | ** 99.97 %** | 12ms | 89ms | 0.02 % |\n | Auth Service | ** 99.99 %** | 8ms | 45ms | 0.01 % |\n | Data Pipeline | ** 99.91 %** | 340ms | 2.1s | 0.08 % |\n | Search | ** 99.95 %** | 28ms | 180ms | 0.04 % |\n | CDN / Static | ** 99.99 %** | 4ms | 22ms | 0.00 % |\n\n > [!NOTE]\n > Data Pipeline P99 remains elevated.Migration to streaming architecture in progress.\n\n-- -\n\n# Incident Postmortem\n\n### Feb 14 — Database Connection Pool Exhaustion\n\n```mermaid\ntimeline\n    title Incident Timeline (UTC)\n    14:02 : Alert fired - connection pool at 95%\n    14:05 : On-call paged\n    14:12 : Root cause identified - leaked connections from batch job\n    14:18 : Batch job killed, pool recovering\n    14:25 : All connections restored\n    14:30 : All clear declared\n```\n\n ** Duration:** 28 minutes · ** Impact:** 340 failed requests · ** Severity:** P1\n\n ** Root Cause:** A new batch migration job opened connections without proper `finally` cleanup blocks.\n\n ** Action Items:**\n - [x] Add connection pool monitoring alert at 80 % threshold\n - [x] Enforce connection cleanup via linter rule\n - [] Implement connection pool circuit breaker\n\n-- -\n\n# Architecture Improvements\n\n```mermaid\nflowchart LR\n    subgraph Before\n    A1[Monolith API] --> B1[(PostgreSQL)]\n    A1 --> C1[Redis Cache]\n    end\n    subgraph After\n    A2[API Gateway] --> D[Auth µService]\n    A2 --> E[Data µService]\n    A2 --> F[Search µService]\n    D --> B2[(PostgreSQL)]\n    E --> B2\n    E --> G[(ClickHouse)]\n    F --> H[Elasticsearch]\n    D --> C2[Redis]\n    end\n```\n\n ** Completed in Q1:**\n - ✅ Extracted Auth service(Go → 3x faster) \n - ✅ Migrated analytics to ClickHouse(100x query speedup) \n - 🔄 Search migration 60 % complete\n\n-- -\n\n# Technical Debt Scorecard\n\n | Category | Q4 Score | Q1 Score | Trend |\n |: ---------|: ---------|: ---------|: ------|\n | Test Coverage | 72 % | ** 78 %** | 📈 |\n | Dependency Freshness | 64 % | ** 81 %** | 📈 |\n | Code Duplication | 8.2 % | ** 6.1 %** | 📈 |\n | Build Time | 4.2 min | ** 2.8 min ** | 📈 |\n | Open Sec Advisories | 12 | ** 3 ** | 📈 |\n\n-- -\n\n# Q2 Engineering Priorities\n\n1. ** Complete search migration ** — Target: sub - 50ms P99\n2. ** Streaming data pipeline ** — Replace batch ETL with Kafka\n3. ** Observability v2 ** — OpenTelemetry traces end - to - end\n4. ** Zero - downtime deploys ** — Blue / green with automated canary\n5. ** SOC 2 Type II ** — Complete audit by June\n\n-- -\n\nlayout: cover\nbackground: #2e3440\n\n# Questions ?\n\n * Detailed dashboards: grafana.internal / engineering * '
    },
    {
      name: 'Takahashi — Lightning Talk',
      category: 'ppt',
      icon: 'bi-lightning',
      description: 'Bold, minimal Takahashi-style with one big idea per slide — perfect for 5-minute talks',
      preview: 'assets/ppt-previews/takahashi.png',
      content: 'layout: center\n\n# **Stop Writing**\n# **Documentation** 📄\n\n<!-- Provocative title to grab attention. We\'ll reframe this. -- >\n\n-- -\n\nlayout: center\n\n#(that nobody reads) \n\n-- -\n\nlayout: center\n\n# ** The Average **\n# ** Dev Doc **\n# has a ** 12 %**\n# read rate 📉\n\n-- -\n\nlayout: center\n\n# So what works ?\n\n-- -\n\nlayout: center\n\n# ** 1. README **\n# that runs ▶️\n\nExecutable examples > static text\n\n < !--If your README has a \"Run this\" button, people will actually try it. -->\n\n---\n\nlayout: center\n\n# **2. Error messages**\n# ARE docs 💡\n\n```\n✗ Port 3000 already in use\n→ Run: lsof -i :3000 | kill\n```\n\n---\n\nlayout: center\n\n# **3. Types**\n# never lie 🔒\n\n`function send(to: Email, body: string)`\n\nis worth 100 lines of jsdoc\n\n---\n\nlayout: center\n\n# **4. Record**\n# a 2-min Loom 🎥\n\n> Shows context that text can\'t\n\n---\n\nlayout: center\n\n# **Write less.**\n# **Show more.**\n# **Automate the rest.**\n\n---\n\nlayout: center\n\n# Thanks! 🙏\n\n*@yourhandle · 5 min lightning talk*'
    },
    {
      name: 'Excalidraw — Design',
      category: 'ppt',
      icon: 'bi-pencil',
      description: 'Hand-drawn sketch aesthetic for design thinking and brainstorming sessions',
      preview: 'assets/ppt-previews/excalidraw.png',
      content: 'layout: cover\n\n# 🎨 Design Thinking Workshop\n\nHuman-centered problem solving\n\n<!-- Today we\'ll use the design thinking framework to tackle a real user problem.Keep your Post - its handy! -- >\n\n-- -\n\n# The 5 Phases\n\n```mermaid\nflowchart LR\n    A[\"🎯 Empathize\"] --> B[\"📝 Define\"]\n    B --> C[\"💡 Ideate\"]\n    C --> D[\"🔨 Prototype\"]\n    D --> E[\"🧪 Test\"]\n    E -.->|Iterate| A\n```\n\n > \"Design thinking is not about aesthetics.\n> It\'s about solving real problems for real people.\"\n\n<!-- The loop at the end is key — you always go back and refine. -->\n\n---\n\n# Phase 1: Empathize 🎯\n\n### User Interview Guide\n\n| Question | Purpose |\n|:---------|:--------|\n| \"Walk me through your day...\" | Context |\n| \"When was the last time you felt frustrated by...\" | Pain points |\n| \"Show me how you currently...\" | Behavior observation |\n| \"If you had a magic wand...\" | Unmet needs |\n| \"What workarounds do you use?\" | Hidden solutions |\n\n### Exercise (15 min)\n- [ ] Pair up with a partner\n- [ ] Interview them about their **morning routine**\n- [ ] Write **3 observations** on Post-its\n- [ ] Write **3 emotions** you noticed\n\n---\n\n# Phase 2: Define 📝\n\n### How Might We (HMW) Statements\n\nTransform insights into actionable questions:\n\n- ❌ \"Users don\'t like the checkout flow\"\n- ✅ \"**HMW** make checkout feel as fast as a single click?\"\n\n- ❌ \"Onboarding is confusing\"\n- ✅ \"**HMW** help new users feel successful in their first 2 minutes?\"\n\n> [!TIP]\n> A good HMW is **broad enough** to allow creative solutions but **narrow enough** to be actionable.\n\n---\n\n# Phase 3: Ideate 💡\n\n### Crazy 8s Exercise\n\n1. **Fold** a sheet of paper into 8 panels\n2. **Set timer** for 8 minutes\n3. **Sketch** one idea per panel (1 min each!)\n4. **No words** — drawings only ✏️\n5. **No judgment** — wild ideas welcome 🦄\n\n### Dot Voting\n\n- Everyone gets **3 red dots** 🔴🔴🔴\n- Vote on your **favorite ideas** (not your own!)\n- Top voted ideas move to prototyping\n\n---\n\n# Phase 4 & 5: Prototype & Test\n\n### Prototype Fidelity Ladder\n\n| Level | Tool | Time | Best For |\n|:------|:-----|:-----|:---------|\n| 📄 Paper | Pen + Paper | 30 min | Early concepts |\n| 🖥️ Lo-fi | Figma wireframes | 2 hours | Flow testing |\n| 🎨 Hi-fi | Figma + prototype | 1 day | Usability testing |\n| 💻 Code | HTML/CSS | 2 days | Technical validation |\n\n### Test Protocol\n\n> \"I\'m testing the **design**, not testing **you**.\n> There are no wrong answers.\"\n\n---\n\nlayout: center\n\n# Now It\'s Your Turn! 🚀\n\n**Pick a real problem. Design a solution. Test it today.**\n\n<!-- Remember: done is better than perfect. Ship something and learn! -->'
    },
    {
      name: 'Frankfurt — Business QBR',
      category: 'ppt',
      icon: 'bi-graph-up-arrow',
      description: 'Professional quarterly business review inspired by Beamer Frankfurt theme',
      preview: 'assets/ppt-previews/nord.png',
      content: 'layout: cover\n\n# Q1 2025 Business Review\n\nAcme Corp · Board of Directors\n\n*Confidential — $(date)*\n\n<!-- Good morning, board members. I\'ll walk through our Q1 performance, strategic initiatives, and outlook. -- >\n\n-- -\n\n# Executive Summary\n\n | KPI | Target | Actual | Status |\n |: ----|: -------|: -------|: -------|\n | Revenue | $8.5M | ** $9.2M ** | 🟢 +8 % |\n | Gross Margin | 68 % | ** 71 %** | 🟢 +3pp |\
| Customer Count | 850 | ** 912 ** | 🟢 +7 % |\n | NDR | 115 % | ** 122 %** | 🟢 +7pp |\n | CAC Payback | 14 mo | ** 11 mo ** | 🟢 -3 mo |\n | Burn Multiple | 1.5x | ** 1.2x ** | 🟢 Improving |\n\n > ** Bottom line:** Beat targets across all key metrics.Runway extended to 24 months.\n\n < !--Strong quarter.The efficiency improvements are particularly exciting. -- >\n\n-- -\n\n# Revenue Breakdown\n\n```mermaid\npie title Revenue by Segment\n    \"Enterprise\" : 52\n    \"Mid-Market\" : 28\n    \"SMB\" : 15\n    \"Self-Serve\" : 5\n```\n\n### Commentary\n - Enterprise grew ** +34 % QoQ ** — 3 new $100K + contracts\n - Mid - Market stable with healthy expansion revenue\n - SMB churn remains elevated at 6.2 % (action plan on slide 5) \n - Self - serve launched Feb 1 — early traction encouraging\n\n-- -\n\n# Customer Acquisition\n\n | Channel | Spend | Customers | CAC | LTV / CAC |\n |: --------|: ------|: ----------|: ----|: --------|\n | Organic / SEO | $45K | 142 | $317 | ** 22x ** |\n | Paid Search | $180K | 89 | $2,022 | ** 7x ** |\
| Outbound Sales | $320K | 45 | $7, 111 | ** 12x ** |\n | Partnerships | $60K | 38 | $1, 579 | ** 9x ** |\n | Events | $95K | 24 | $3, 958 | ** 5x ** |\n\n > [!IMPORTANT]\n > Organic is our best channel.Increasing content investment by 40 % in Q2.\n\n-- -\n\n# Strategic Initiatives\n\n```mermaid\ngantt\n    title Q2-Q3 Roadmap\n    dateFormat  YYYY-MM-DD\n    section Product\n    API v2 Launch       :2025-04-01, 30d\n    Enterprise SSO      :2025-04-15, 45d\n    Analytics Dashboard :2025-05-15, 60d\n    section Go-to-Market\n    EMEA Expansion      :2025-04-01, 90d\n    Partner Program 2.0 :2025-05-01, 60d\n    section Engineering\n    SOC 2 Type II       :2025-04-01, 90d\n    Performance Overhaul:2025-05-01, 45d\n```\n\n-- -\n\n# Financial Outlook\n\n | Metric | Q1 Actual | Q2 Forecast | FY Target |\n |: -------|: ----------|: ------------|: ----------|\n | Revenue | $9.2M | ** $10.8M ** | $45M |\n | ARR | $36.8M | ** $43.2M ** | $52M + |\
| Gross Margin | 71 % | ** 72 %** | 72 % |\n | OpEx | $7.4M | ** $7.8M ** | $32M |\n | EBITDA | -$1.2M | ** -$0.8M ** | Break - even |\n\n > Tracking to reach ** EBITDA break-even by Q4 ** — ahead of original plan by one quarter.\n\n-- -\n\nlayout: cover\n\n# Discussion & Q & A\n\n * Appendix materials available in the board portal *\n\n < !--I\'m happy to dive deeper into any area. The full data room has been updated with supporting materials. -->'
    },
    {
      name: 'SaaS Product Launch',
      category: 'ppt',
      icon: 'bi-megaphone',
      description: 'Go-to-market launch deck with pricing tiers, competitive analysis, and adoption funnel',
      content: 'layout: cover\nbackground: https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80\n\n# 🚀 Introducing FlowBoard\n\nThe project management tool your team actually wants to use\n\n*Product Launch — $(date)*\n\n<!-- Welcome everyone. Today marks the official launch of FlowBoard. Let me show you why this changes everything. -->\n\n---\n\n# The Market Gap\n\n- **74%** of teams use 3+ tools to manage one project\n- Average PM spends **4.5 hours/week** on status updates\n- Existing tools are built for managers, not makers\n- Remote teams need async-first collaboration\n\n> \"I spend more time updating Jira than actually building.\"\n> — Senior Engineer, Series B startup\n\n<!-- This is a real quote from our user research. It resonated across 200+ interviews. -->\n\n---\n\n# Our Solution\n\n```mermaid\nflowchart LR\n    A[\"📝 Write\"] --> B[\"🔄 Track\"]\n    B --> C[\"📊 Report\"]\n    C --> D[\"🤖 Automate\"]\n    D --> A\n```\n\n**FlowBoard unifies docs, tasks, and reporting in one workspace.**\n\n- 📝 **Docs** — Write specs, RFCs, and notes collaboratively\n- 🔄 **Boards** — Kanban, timeline, and list views\n- 📊 **Dashboards** — Auto-generated from your workflow\n- 🤖 **AI Copilot** — Draft updates, summarize threads, assign tasks\n\n> [!TIP]\n> No setup wizard. Import from Jira, Asana, or Linear in 2 clicks.\n\n---\n\n# Pricing\n\n| Plan | Price | Users | Features |\n|:-----|:------|:------|:---------|\n| **Starter** | Free | Up to 5 | Boards, Docs, 5GB storage |\n| **Team** | $12/user/mo | Unlimited | + AI Copilot, Integrations |\n| **Business** | $24/user/mo | Unlimited | + SSO, Audit Log, SLA |\
| **Enterprise** | Custom | Unlimited | + Dedicated Support, On-prem |\n\n> [!NOTE]\n> All plans include unlimited projects and a 14-day free trial of Business.\n\n---\n\n# Competitive Landscape\n\n| Capability | FlowBoard | Jira | Notion | Linear |\n|:-----------|:---------:|:----:|:------:|:------:|\n| Docs + Tasks unified | ✅ | ❌ | 🟡 | ❌ |\n| AI-powered updates | ✅ | ❌ | 🟡 | ❌ |\
| Sub-100ms UI | ✅ | ❌ | ❌ | ✅ |\n| Free tier | ✅ | ✅ | ✅ | ✅ |\
| Self-hosted option | ✅ | ✅ | ❌ | ❌ |\n\n---\n\n# Go-to-Market Strategy\n\n```mermaid\nflowchart TD\n    A[\"Product Hunt Launch\"] --> B[\"Dev Influencer Program\"]\n    B --> C[\"Content Marketing\"]\n    C --> D[\"Community-Led Growth\"]\n    D --> E[\"Enterprise Sales Team\"]\n    A --> F[\"Free Tier Virality\"]\n    F --> D\n```\n\n**Phase 1** (Month 1–3): PLG — free tier + community\n**Phase 2** (Month 4–6): Content + partnerships\n**Phase 3** (Month 7+): Enterprise outbound sales\n\n---\n\nlayout: cover\nbackground: linear-gradient(135deg, #302b63 0%, #24243e 100%)\n\n# Let\'s Launch 🚀\n\n**Try it free** → flowboard.app\n\nQuestions?\n\n<!-- Thank you! We\'re live today. Sign up at flowboard.app and let us know what you think. -->'
    },
    {
      name: 'OKR Planning',
      category: 'ppt',
      icon: 'bi-bullseye',
      description: 'Quarterly OKR alignment deck with objectives, key results, and scoring rubrics',
      content: 'layout: cover\nbackground: #1a1a2e\n\n# Q2 2025 OKR Planning\n\nEngineering Organization · $(date)\n\n<!-- Let\'s align on our Q2 objectives. Remember: OKRs are about outcomes, not outputs. -->\n\n---\n\n# Q1 OKR Scorecard\n\n| Objective | Key Result | Target | Actual | Score |\n|:----------|:-----------|:-------|:-------|:------|\n| Improve reliability | Reduce P0 incidents | ≤2/quarter | **1** | 🟢 1.0 |\
| Improve reliability | Achieve 99.95% uptime | 99.95% | **99.97%** | 🟢 0.9 |\
| Accelerate delivery | Reduce cycle time | <5 days | **4.2 days** | 🟢 0.8 |\
| Accelerate delivery | Ship 12 features | 12 | **9** | 🟡 0.6 |\
| Developer experience | DORA metrics dashboard | Launch | **Launched** | 🟢 1.0 |\
| Developer experience | Onboarding < 2 days | 2 days | **2.5 days** | 🟡 0.5 |\n\n**Average Score: 0.80** — Strong quarter. Feature velocity needs attention.\n\n<!-- We hit 0.8 average which is in the sweet spot. If we\'re always at 1.0, our goals aren\'t ambitious enough. -->\n\n---\n\n# Q2 Objective 1: Scale for Growth\n\n> **Handle 10x traffic without degradation**\n\n| # | Key Result | Metric | Owner |\n|:--|:-----------|:-------|:------|\n| KR1 | Auto-scaling handles 50K req/s | Load test | @platform |\
| KR2 | P99 latency < 200ms at peak | APM dashboard | @backend |\
| KR3 | Database read replicas in 2 regions | Infra deployed | @data |\n\n```mermaid\nflowchart LR\n    A[\"Current: 5K rps\"] -->|Q2 Target| B[\"50K rps\"]\n    B --> C[\"Auto-scale\"]\n    B --> D[\"Read replicas\"]\n    B --> E[\"Edge caching\"]\n```\n\n---\n\n# Q2 Objective 2: Ship AI Features\n\n> **Deliver AI-powered workflows to 50% of users**\n\n| # | Key Result | Metric | Owner |\n|:--|:-----------|:-------|:------|\n| KR1 | Launch AI summarization GA | Feature flag 100% | @ml-team |\
| KR2 | 40% weekly active usage of AI features | Analytics | @product |\
| KR3 | Response time < 2s for AI queries | P95 latency | @ml-infra |\n\n> [!IMPORTANT]\n> AI features must have graceful fallbacks. If the model is down, the app must still work.\n\n---\n\n# Q2 Objective 3: Reduce Tech Debt\n\n> **Improve codebase health to accelerate future velocity**\n\n- [ ] Migrate 80% of services to TypeScript strict mode\n- [ ] Eliminate all critical security advisories (currently 7)\n- [ ] Reduce build time from 4.2min to under 2min\n- [ ] Achieve 85% test coverage on core modules\n\n---\n\nlayout: center\n\n# OKR Scoring Guide\n\n| Score | Meaning | Color |\n|:------|:--------|:------|\n| **0.0–0.3** | Failed to make progress | 🔴 |\
| **0.4–0.6** | Made progress but fell short | 🟡 |\
| **0.7–1.0** | Delivered — stretch goal hit | 🟢 |\n\n> *\"0.7 is the sweet spot. If you always score 1.0, you\'re sandbagging.\"*\n\n---\n\nlayout: cover\nbackground: #1a1a2e\n\n# Let\'s Commit & Execute 🎯\n\nOKR check-in: **Mid-quarter review May 15**\n\n<!-- Remember to cascade these to your team OKRs by Friday. Reach out if you need help. -->'
    },
    {
      name: 'System Design Review',
      category: 'ppt',
      icon: 'bi-diagram-3',
      description: 'Architecture review with system diagrams, sequence flows, trade-offs, and capacity planning',
      content: 'layout: cover\nbackground: #0d1117\ntransition: fade\n\n# System Design Review\n\nNotification Service v2\n\nPlatform Engineering · $(date)\n\n<!-- Today we\'re reviewing the design for the new notification service. This replaces the current polling-based system. -->\n\n---\n\ntransition: fade\n\n# Current Architecture — Problems\n\n```mermaid\nflowchart TD\n    A[App Server] -->|Poll every 30s| B[(MySQL)]\n    B --> C[Notification Worker]\n    C -->|HTTP POST| D[Email Provider]\n    C -->|HTTP POST| E[Push Provider]\n    C -->|HTTP POST| F[SMS Provider]\n```\n\n**Pain Points:**\n- ⏱️ 30s polling = delayed notifications\n- 🔥 Database under constant read pressure\n- 💀 Worker is a single point of failure\n- 📊 No delivery tracking or retry logic\n\n---\n\ntransition: fade\n\n# Proposed Architecture\n\n```mermaid\nflowchart TD\n    A[\"API Gateway\"] --> B[\"Event Bus (Kafka)\"]\n    B --> C[\"Router Service\"]\n    C --> D[\"Email Worker Pool\"]\n    C --> E[\"Push Worker Pool\"]\n    C --> F[\"SMS Worker Pool\"]\n    D --> G[\"SES\"]\n    E --> H[\"FCM / APNs\"]\n    F --> I[\"Twilio\"]\n    D --> J[(\"DynamoDB\\nDelivery Log\")]\n    E --> J\n    F --> J\n    C --> K[\"Dead Letter Queue\"]\n    K -->|Manual review| C\n```\n\n---\n\n# Message Flow\n\n```mermaid\nsequenceDiagram\n    participant App as Application\n    participant Kafka as Event Bus\n    participant Router as Router\n    participant Worker as Email Worker\n    participant SES as AWS SES\n    participant DB as Delivery Log\n\n    App->>Kafka: PublishEvent(user_signup)\n    Kafka->>Router: Consume event\n    Router->>Router: Match notification rules\n    Router->>Worker: Dispatch email job\n    Worker->>SES: Send email\n    SES-->>Worker: 200 OK\n    Worker->>DB: Log delivery success\n    Worker-->>Router: ACK\n```\n\n<!-- The key improvement is the event-driven design. No more polling. -->\n\n---\n\n# Trade-offs\n\n| Decision | Chose | Over | Rationale |\n|:---------|:------|:-----|:----------|\n| Message bus | Kafka | RabbitMQ | Higher throughput, replay capability |\
| Storage | DynamoDB | PostgreSQL | Schema-less delivery logs, auto-scaling |\
| Infra | ECS Fargate | EC2 | No server management, auto-scaling |\
| Retry | Exponential backoff | Fixed interval | Prevents thundering herd |\n\n> [!WARNING]\n> Kafka adds operational complexity. Team will need training.\n\n---\n\n# Capacity Planning\n\n| Metric | Current | Year 1 | Year 2 |\n|:-------|:--------|:-------|:-------|\n| Events/day | 500K | 5M | 25M |\
| Kafka partitions | — | 12 | 48 |\
| Worker instances | 2 | 8 | 20 |\
| Storage (monthly) | 10 GB | 100 GB | 500 GB |\
| Estimated cost/mo | $200 | $1,800 | $4,500 |\n\n---\n\nlayout: center\n\n# Decision Needed\n\n> **Approve this design?** Estimated 6-week implementation.\n\n- [ ] Architecture approved\n- [ ] Kafka training scheduled\n- [ ] Budget approved ($1,800/mo)\n- [ ] Migration plan reviewed\n\n<!-- We need sign-off today to hit the Q3 deadline. -->'
    },
    {
      name: 'Employee Onboarding',
      category: 'ppt',
      icon: 'bi-person-badge',
      description: 'New hire onboarding deck with team intro, tools setup, first-week checklist, and culture guide',
      content: 'layout: cover\nbackground: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)\n\n# Welcome to the Team! 🎉\n\nNew Hire Onboarding Guide\n\n<!-- Welcome! We\'re so excited to have you. This deck will guide you through your first week. -->\n\n---\n\n# Your First Week\n\n| Day | Focus | Key Activity |\n|:----|:------|:-------------|\n| **Mon** | Setup | Laptop, accounts, dev environment |\
| **Tue** | Learn | Architecture overview, codebase tour |\
| **Wed** | Connect | Meet your team, 1:1s with leads |\
| **Thu** | Build | First PR — a small starter task |\
| **Fri** | Reflect | Onboarding retro, Q&A with manager |\n\n> [!TIP]\n> Don\'t try to learn everything at once. Focus on getting your environment running on Day 1.\n\n---\n\n# Tools & Access\n\n```mermaid\nflowchart LR\n    A[\"💻 GitHub\"] --> B[\"🔄 CI/CD\"]\n    B --> C[\"☁️ AWS\"]\n    A --> D[\"💬 Slack\"]\n    A --> E[\"📋 Linear\"]\n    A --> F[\"📖 Notion\"]\n```\n\n| Tool | Purpose | Access |\n|:-----|:--------|:-------|\n| GitHub | Code repos | IT will invite you |\
| Slack | Communication | Join #engineering, #random |\
| Linear | Task tracking | Ask your manager |\
| Notion | Documentation | Auto-access via SSO |\
| AWS Console | Cloud infra | Request via IT ticket |\
| Figma | Design specs | View-only access |\n\n---\n\n# Development Setup Checklist\n\n- [ ] Clone the monorepo: `git clone git@github.com:company/main.git`\n- [ ] Install dependencies: `npm install`\n- [ ] Copy `.env.example` to `.env.local`\n- [ ] Start the dev server: `npm run dev`\n- [ ] Run the test suite: `npm test`\n- [ ] Create a branch: `git checkout -b onboarding/your-name`\n- [ ] Make a small change and open your first PR!\n\n> [!IMPORTANT]\n> If anything in the setup fails, don\'t spend more than 15 minutes — ask in #dev-help on Slack.\n\n---\n\n# Team Structure\n\n```mermaid\nflowchart TD\n    A[\"VP Engineering\"] --> B[\"Platform Lead\"]\n    A --> C[\"Product Lead\"]\n    A --> D[\"ML Lead\"]\n    B --> E[\"You! 👋\"]\n    B --> F[\"Backend Engineers\"]\n    C --> G[\"Frontend Engineers\"]\n    D --> H[\"Data Scientists\"]\n```\n\n**Your Onboarding Buddy:** Ask them anything — no question is too basic!\n\n---\n\n# Our Engineering Values\n\n1. 🚢 **Ship early, iterate often** — Perfect is the enemy of good\n2. 📖 **Write it down** — If it\'s not documented, it didn\'t happen\n3. 🤝 **Review generously** — PR reviews are learning opportunities\n4. 🔔 **Own your alerts** — If you build it, you monitor it\n5. 🌱 **Grow together** — Mentor, pair program, share knowledge\n\n---\n\nlayout: cover\nbackground: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)\n\n# You\'ve Got This! 💪\n\nQuestions? Reach out to your buddy or manager anytime.\n\n*We\'re glad you\'re here.*'
    },
    {
      name: 'Project Kickoff',
      category: 'ppt',
      icon: 'bi-flag',
      description: 'Project kickoff with goals, RACI matrix, timeline, risks, and communication plan',
      content: 'layout: cover\nbackground: #1b1b3a\n\n# Project Phoenix — Kickoff\n\nPayment Platform Migration\n\n$(date)\n\n<!-- Welcome to the kickoff for Project Phoenix. This is our most important Q2 initiative. -->\n\n---\n\n# Project Overview\n\n**Goal:** Migrate from legacy payment processor to Stripe, reducing transaction fees by 40% and enabling global payments.\n\n| Attribute | Detail |\n|:----------|:-------|\n| **Sponsor** | CTO |\
| **Tech Lead** | @sarah |\
| **Duration** | 10 weeks |\
| **Team Size** | 6 engineers |\
| **Budget** | $85,000 |\
| **Go-Live** | June 30, 2025 |\n\n> [!CAUTION]\n> Zero-downtime migration required. No payment disruption during cutover.\n\n---\n\n# Timeline\n\n```mermaid\ngantt\n    title Project Phoenix — Timeline\n    dateFormat YYYY-MM-DD\n    section Design\n    API Design & Review    :2025-04-14, 7d\n    Data Migration Plan    :2025-04-18, 5d\n    section Build\n    Stripe Integration     :2025-04-25, 14d\n    Webhook Handlers       :2025-05-02, 10d\n    Billing Portal UI      :2025-05-09, 12d\n    section Test\n    Integration Testing    :2025-05-23, 10d\n    Load Testing           :2025-06-02, 5d\n    section Launch\n    Shadow Mode (1%)       :2025-06-09, 7d\n    Gradual Rollout        :2025-06-16, 10d\n    Full Cutover           :2025-06-27, 3d\n```\n\n---\n\n# RACI Matrix\n\n| Task | @sarah | @mike | @lisa | @dev-team | @finance |\n|:-----|:------:|:-----:|:-----:|:---------:|:--------:|\
| API Design | **R** | C | I | A | I |\
| Stripe Setup | A | **R** | I | C | C |\
| Data Migration | A | C | **R** | C | I |\
| Testing | A | **R** | **R** | **R** | I |\
| Go-Live Decision | **R** | C | C | I | A |\n\n*R = Responsible · A = Accountable · C = Consulted · I = Informed*\n\n---\n\n# Risk Register\n\n| Risk | Likelihood | Impact | Mitigation |\n|:-----|:----------:|:------:|:-----------|\
| Data loss during migration | Low | 🔴 Critical | Dual-write pattern + rollback plan |\
| Stripe API rate limits | Medium | 🟡 High | Implement queue + exponential backoff |\
| Currency conversion errors | Medium | 🟡 High | Extensive test suite for 15 currencies |\
| Timeline slip | Medium | 🟡 Medium | Weekly milestone check-ins |\
| Team availability (PTO) | Low | 🟡 Medium | Cross-train on critical paths |\n\n---\n\n# Communication Plan\n\n| Cadence | Meeting | Audience | Owner |\n|:--------|:--------|:---------|:------|\
| Daily | Standup (async) | Dev team | @sarah |\
| Weekly | Progress review | Stakeholders | @sarah |\
| Bi-weekly | Steering committee | Leadership | CTO |\
| Ad-hoc | War room | On-call | @mike |\n\n**Channels:** #project-phoenix (Slack) · Phoenix board (Linear)\n\n---\n\nlayout: cover\nbackground: #1b1b3a\n\n# Let\'s Build! 🔥\n\n**First milestone:** API design review — April 21\n\n<!-- Thanks everyone. Let\'s make this happen. First pull request by end of this week. -->'
    },
    {
      name: 'Investor Update',
      category: 'ppt',
      icon: 'bi-currency-dollar',
      description: 'Monthly investor update with financials, burn rate, key wins, and asks',
      content: 'layout: cover\nbackground: https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80\n\n# Investor Update — March 2025\n\nAcme AI · Monthly Report\n\n*Confidential*\n\n<!-- Hi everyone. Here\'s our March update. TL;DR: strong month. -->\n\n---\n\n# Key Highlights\n\n- 🚀 **$320K MRR** (+18% MoM)\n- 🏢 Signed **2 enterprise logos** (Fortune 1000)\n- 👥 Team grew to **32** (hired 3 engineers)\n- 🔬 Launched AI copilot beta — **68% adoption** in first week\n\n> [!TIP]\n> The AI copilot is our fastest-adopted feature ever. Early signal for upsell.\n\n---\n\n# Financial Summary\n\n| Metric | Feb | Mar | MoM |\n|:-------|:----|:----|:----|\n| MRR | $271K | **$320K** | +18% |\n| ARR (Run Rate) | $3.25M | **$3.84M** | +18% |\n| Gross Margin | 74% | **76%** | +2pp |\n| Net Burn | $180K | **$165K** | -8% |\n| Runway | 19 mo | **21 mo** | +2 mo |\n| Customers | 78 | **84** | +6 |\n\n---\n\n# Revenue by Segment\n\n```mermaid\npie title MRR Breakdown — March 2025\n    \"Enterprise\" : 42\n    \"Mid-Market\" : 35\n    \"SMB\" : 18\n    \"Self-Serve\" : 5\n```\n\n**Enterprise** now 42% of MRR — up from 28% last quarter.\n\n---\n\n# Product & Engineering\n\n| Shipped | Impact |\n|:--------|:-------|\n| AI Copilot (beta) | 68% adoption, +22% task completion |\n| Bulk Import API | Unblocked 3 enterprise deals |\n| SOC 2 Type II | Audit complete — certificate received |\n\n**Coming in April:**\n- SSO (SAML/OIDC) — required for 5 pipeline deals\n- Advanced analytics dashboard\n- Mobile app v1\n\n---\n\n# Asks for Investors\n\n1. **Intros wanted:** CISO contacts at healthcare companies\n2. **Hiring:** Referring senior ML engineers (2 open roles)\n3. **Feedback:** Review updated pitch deck for Series A prep\n\n---\n\nlayout: cover\nbackground: linear-gradient(135deg, #141e30 0%, #243b55 100%)\n\n# Thank You 🙏\n\n*Next update: April 15*\n\n<!-- As always, happy to jump on a call if you want to dig deeper into anything. -->'
    },
    {
      name: 'Marketing Campaign Brief',
      category: 'ppt',
      icon: 'bi-badge-ad',
      description: 'Campaign brief with audience personas, channel strategy, timeline, and success metrics',
      content: 'layout: cover\nbackground: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)\n\n# 🎯 Campaign Brief\n\nSpring Product Launch — \"Unlock Your Flow\"\n\n*Marketing Team · $(date)*\n\n<!-- Let\'s walk through the campaign strategy for our spring launch. -->\n\n---\n\n# Campaign Overview\n\n| Attribute | Detail |\n|:----------|:-------|\n| **Campaign Name** | Unlock Your Flow |\n| **Objective** | Drive 5,000 trial signups |\n| **Budget** | $120,000 |\n| **Duration** | 6 weeks (Apr 14 – May 25) |\n| **Target** | Engineering leaders at 100-1000 person companies |\n\n---\n\n# Audience Personas\n\n| Persona | Title | Pain Point | Message |\n|:--------|:------|:-----------|:--------|\n| 🧑‍💻 **Dev Dana** | Sr. Engineer | Too many tools, context switching | \"One workspace for everything\" |\n| 📊 **Manager Mike** | Eng Manager | No visibility into team progress | \"Dashboards that build themselves\" |\n| 🏢 **VP Vanessa** | VP Engineering | Scaling processes for growth | \"Enterprise-ready from day one\" |\n\n---\n\n# Channel Strategy\n\n```mermaid\nflowchart TD\n    A[\"Awareness\"] --> B[\"Consideration\"]\n    B --> C[\"Trial Signup\"]\n    C --> D[\"Activation\"]\n    A --> E[\"LinkedIn Ads\"]\n    A --> F[\"Dev Blog Posts\"]\n    B --> G[\"Webinar Series\"]\n    B --> H[\"Case Studies\"]\n    C --> I[\"Landing Page\"]\n    C --> J[\"Email Nurture\"]\n    D --> K[\"In-App Onboarding\"]\n```\n\n---\n\n# Budget Allocation\n\n| Channel | Budget | Expected Leads | CPL |\n|:--------|:-------|:---------------|:----|\n| LinkedIn Ads | $45K | 2,200 | $20 |\n| Google Search | $30K | 1,500 | $20 |\n| Content / SEO | $15K | 800 | $19 |\n| Webinars | $10K | 300 | $33 |\n| Influencer | $15K | 600 | $25 |\n| Events | $5K | 100 | $50 |\n| **Total** | **$120K** | **5,500** | **$22** |\n\n---\n\n# Success Metrics\n\n| KPI | Target | Measurement |\n|:----|:-------|:------------|\n| Trial signups | 5,000 | Analytics |\n| Activation rate | 40% | Product |\n| Cost per lead | <$25 | Marketing |\n| Brand mentions | +200% | Social listening |\n| Webinar attendance | 500 | Zoom |\n\n---\n\nlayout: cover\nbackground: linear-gradient(135deg, #3f5efb 0%, #fc466b 100%)\n\n# Let\'s Make Noise! 📣\n\n**Launch date:** April 14\n\n<!-- Creative assets due by April 7. Let\'s sync on final copy this week. -->'
    },
    {
      name: 'Incident Postmortem',
      category: 'ppt',
      icon: 'bi-exclamation-triangle',
      description: 'Blameless postmortem with timeline, root cause analysis, impact assessment, and action items',
      content: 'layout: cover\nbackground: #1a1a1a\n\n# 🔴 Incident Postmortem\n\nPayment Processing Outage — March 12, 2025\n\n**Severity: P0** · Duration: 47 minutes\n\n<!-- This is a blameless postmortem. We focus on systems, not individuals. -->\n\n---\n\n# Impact Summary\n\n| Metric | Value |\n|:-------|:------|\n| **Duration** | 47 minutes (14:03 – 14:50 UTC) |\n| **Users Affected** | ~12,400 |\n| **Failed Transactions** | 834 |\n| **Revenue Impact** | ~$28,000 |\n| **SLA Violation** | Yes — breached 99.95% monthly target |\n\n> [!CAUTION]\n> This is our first P0 in 2025. We need to treat this seriously.\n\n---\n\n# Incident Timeline\n\n```mermaid\ntimeline\n    title Incident Timeline (UTC)\n    14:03 : Payment success rate drops to 12%\n    14:05 : PagerDuty alert fires\n    14:07 : On-call acknowledges, begins investigation\n    14:12 : Root cause identified - expired TLS cert on payment gateway\n    14:18 : Certificate rotation initiated\n    14:32 : New cert deployed to production\n    14:38 : Payment success rate recovering\n    14:50 : All systems nominal, all-clear declared\n```\n\n---\n\n# Root Cause Analysis\n\n```mermaid\nflowchart TD\n    A[\"Payment Failures\"] --> B[\"TLS Handshake Errors\"]\n    B --> C[\"Expired Certificate\"]\n    C --> D[\"Auto-renewal failed\"]\n    D --> E[\"Cert manager pod OOMKilled\"]\n    E --> F[\"Memory limit too low\"]\n    E --> G[\"No alert on pod restarts\"]\n```\n\n**Root Cause:** The cert-manager pod was repeatedly OOMKilled due to a memory limit of 64MB (should be 256MB). This prevented automatic certificate renewal.\n\n**Contributing Factor:** No alerting on cert-manager pod health or certificate expiry.\n\n---\n\n# What Went Well\n\n- ✅ PagerDuty alert fired within 2 minutes\n- ✅ On-call responded in under 5 minutes\n- ✅ Root cause identified quickly (5 min)\n- ✅ Customer support sent proactive notice\n- ✅ No data loss or corruption\n\n# What Went Poorly\n\n- ❌ No monitoring on certificate expiry dates\n- ❌ No alert on cert-manager pod health\n- ❌ Certificate rotation took 20 minutes (manual process)\n- ❌ Runbook was outdated\n\n---\n\n# Action Items\n\n| Priority | Action | Owner | Due |\n|:---------|:-------|:------|:----|\n| 🔴 P0 | Increase cert-manager memory to 256MB | @platform | Done ✅ |\n| 🔴 P0 | Add cert expiry alert (7-day warning) | @sre | Mar 15 |\n| 🟡 P1 | Add pod restart alerting for critical pods | @sre | Mar 22 |\n| 🟡 P1 | Automate cert rotation runbook | @platform | Mar 29 |\n| 🟢 P2 | Quarterly cert audit process | @security | Apr 15 |\n\n---\n\nlayout: center\n\n# Lessons Learned\n\n> *\"The system worked as designed — our design was wrong.\"*\n\n**Key takeaway:** Monitor the monitors. Automation that isn\'t monitored is a ticking time bomb.\n\n<!-- Thanks for attending. Let\'s make sure this doesn\'t happen again. -->'
    },
    {
      name: 'ML Model Review',
      category: 'ppt',
      icon: 'bi-robot',
      description: 'Machine learning model review with metrics, confusion matrix, experiments, and deployment plan',
      content: 'layout: cover\nbackground: linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d1b69 100%)\n\n# 🤖 ML Model Review\n\nChurn Prediction Model v3\n\nData Science Team · $(date)\n\n<!-- Today we\'re reviewing the updated churn prediction model. Key improvement: we added behavioral features. -->\n\n---\n\n# Problem Statement\n\n**Goal:** Predict customer churn 30 days in advance to enable proactive retention.\n\n- Current model (v2) has **72% precision** and **65% recall**\n- False negatives cost ~$2,400 per churned customer\n- False positives trigger unnecessary outreach (wastes CSM time)\n\n$$\\text{F1} = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$\n\n> [!IMPORTANT]\n> Target: F1 > 0.80 to justify deployment.\n\n---\n\n# Feature Engineering\n\n| Feature Group | Features | Importance |\n|:-------------|:---------|:----------|\n| **Usage** | DAU, session duration, feature adoption | 🟢 High |\n| **Billing** | Payment failures, plan changes, overages | 🟢 High |\n| **Support** | Ticket count, CSAT scores, response time | 🟡 Medium |\n| **Behavioral** (NEW) | Login frequency trend, feature drop-off | 🟢 High |\n| **Firmographic** | Company size, industry, tenure | 🟡 Medium |\n\n**Key Insight:** The behavioral features (login trend + feature drop-off) added **+8% recall**.\n\n---\n\n# Model Comparison\n\n| Model | Precision | Recall | F1 | AUC-ROC |\n|:------|:---------:|:------:|:--:|:-------:|\n| v2 — Logistic Regression | 0.72 | 0.65 | 0.68 | 0.78 |\n| v3a — Random Forest | 0.79 | 0.74 | 0.76 | 0.84 |\n| v3b — XGBoost | 0.81 | 0.77 | 0.79 | 0.87 |\n| **v3c — XGBoost + Behavioral** | **0.84** | **0.81** | **0.82** | **0.91** |\n\n> ✅ v3c exceeds our F1 > 0.80 target.\n\n---\n\n# Error Analysis\n\n### Confusion Matrix (v3c, test set n=2,400)\n\n| | Predicted: Stay | Predicted: Churn |\n|:--|:-:|:-:|\n| **Actual: Stay** | 1,680 (TN) | 120 (FP) |\n| **Actual: Churn** | 114 (FN) | 486 (TP) |\n\n**False Negative Analysis:**\n- 62% were annual plan customers (less usage signal)\n- 28% churned due to acquisition (unpredictable)\n- 10% had sudden churn triggers (billing dispute)\n\n---\n\n# Deployment Plan\n\n```mermaid\nflowchart LR\n    A[\"Model Registry\"] --> B[\"Shadow Mode (1 week)\"]\n    B --> C[\"A/B Test (2 weeks)\"]\n    C --> D{\"Metrics OK?\"}\n    D -->|Yes| E[\"Full Rollout\"]\n    D -->|No| F[\"Rollback & Iterate\"]\n    E --> G[\"Monitor & Retrain Monthly\"]\n```\n\n| Phase | Duration | Success Criteria |\n|:------|:---------|:-----------------|\n| Shadow | 1 week | Predictions match offline metrics |\n| A/B Test | 2 weeks | +15% retention in treatment group |\n| Full Rollout | Ongoing | F1 > 0.78 on live data |\n\n---\n\nlayout: cover\nbackground: linear-gradient(135deg, #1a1a3e 0%, #2d1b69 100%)\n\n# Ready for Shadow Deployment 🚀\n\n**Approval needed from:** Product + Engineering leads\n\n<!-- We\'re confident in v3c. Shadow mode starts Monday if approved today. -->'
    },
    {
      name: 'Company All-Hands',
      category: 'ppt',
      icon: 'bi-building',
      description: 'Company-wide all-hands with mission update, wins, metrics, hiring, and Q&A',
      content: 'layout: cover\nbackground: https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80\n\n# 🏢 All-Hands Meeting\n\nMarch 2025\n\n<!-- Welcome everyone! Thanks for joining. Let\'s celebrate our wins and look ahead. -->\n\n---\n\n# Company Snapshot\n\n| Metric | Value |\n|:-------|:------|\n| **Team Size** | 86 people across 12 countries |\n| **ARR** | $4.2M (+140% YoY) |\n| **Customers** | 340+ companies |\n| **NPS** | 62 (+8 from last quarter) |\n| **Runway** | 22 months |\n\n> *\"We\'re building something special. The numbers prove it.\"* — CEO\n\n---\n\n# 🎉 Wins This Month\n\n- 🏆 **Signed our largest deal ever** — $180K ACV with TechCorp\n- 🚀 **Launched AI Copilot** — 68% adoption in week 1\n- 📱 **Mobile app hit 4.8★** on App Store\n- 🎓 **2 team members promoted** — congrats @alice and @bob!\n- 🌍 **Opened Berlin office** — 4 hires starting next month\n\n---\n\n# Department Updates\n\n| Team | Highlight | Next Month |\n|:-----|:----------|:-----------|\n| 🛠️ **Engineering** | Shipped 14 features, 99.97% uptime | Platform v2, SOC 2 |\n| 📈 **Sales** | 120% of quota, 3 enterprise logos | EMEA expansion |\n| 🎨 **Design** | New design system launched | Mobile redesign |\n| 🤝 **Customer Success** | NPS 62, churn down 1.4pp | Onboarding automation |\n| 👥 **People** | 8 new hires, 92% eNPS | Berlin office setup |\n\n---\n\n# We\'re Hiring!\n\n| Role | Team | Location |\n|:-----|:-----|:---------|\n| Senior Backend Engineer | Platform | Remote |\n| ML Engineer | Data Science | Remote |\n| Enterprise AE | Sales | New York |\n| Product Designer | Design | Berlin |\n| DevRel Engineer | Marketing | Remote |\n\n> [!TIP]\n> Referral bonus: **$5,000** for any successful hire. Share with your network!\n\n---\n\n# Values Spotlight 🌟\n\nThis month\'s **\"Ship It\" Award** goes to:\n\n> **@carol** — Built the entire AI Copilot integration in 3 weeks, including tests, docs, and a migration script. Shipped on time with zero P0s.\n\n*\"Carol embodied our value of ownership. She didn\'t just build a feature — she shipped a product.\"* — CTO\n\n---\n\nlayout: cover\nbackground: linear-gradient(135deg, #928dab 0%, #1f1c2c 100%)\n\n# Q&A Time 🎤\n\nAsk anything — Slido code: **#allhands**\n\n*Thank you for everything you do!*\n\n<!-- Open floor for questions. Use Slido or raise your hand. -->'
    },
    {
      name: 'Product Roadmap',
      category: 'ppt',
      icon: 'bi-map',
      description: 'Product roadmap with themes, timeline, prioritization framework, and dependency map',
      content: 'layout: cover\nbackground: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)\n\n# 🗺️ Product Roadmap\n\nH2 2025 — Building for Scale\n\n*Product Team · $(date)*\n\n<!-- Let\'s walk through our H2 roadmap. Focus: enterprise readiness and platform expansion. -->\n\n---\n\n# Strategic Themes\n\n| Theme | Goal | Impact |\n|:------|:-----|:-------|\n| 🏢 **Enterprise Ready** | SSO, audit logs, SOC 2 | Unlock $500K+ deals |\n| 🤖 **AI Everywhere** | Copilot in every workflow | +30% user productivity |\n| 🌍 **Global Scale** | Multi-region, i18n | EMEA + APAC markets |\n| ⚡ **Performance** | Sub-100ms P99 | Best-in-class UX |\n\n---\n\n# H2 Timeline\n\n```mermaid\ngantt\n    title H2 2025 Roadmap\n    dateFormat YYYY-MM-DD\n    section Enterprise\n    SSO (SAML/OIDC)     :2025-07-01, 30d\n    Audit Log            :2025-07-15, 21d\n    Role-Based Access    :2025-08-15, 28d\n    section AI\n    Copilot GA           :2025-07-01, 14d\n    Smart Suggestions    :2025-08-01, 35d\n    Auto Reports         :2025-09-15, 28d\n    section Platform\n    EU Region Deploy     :2025-07-15, 21d\n    Internationalization  :2025-08-01, 42d\n    API v2               :2025-09-01, 35d\n    section Performance\n    Edge Caching         :2025-07-01, 21d\n    DB Optimization      :2025-08-15, 28d\n```\n\n---\n\n# Prioritization Framework\n\n| Feature | Impact | Effort | Revenue Signal | Priority |\n|:--------|:------:|:------:|:--------------:|:--------:|\n| SSO | 🟢 High | Medium | 5 blocked deals | **P0** |\n| Copilot GA | 🟢 High | Low | Top feature request | **P0** |\n| EU Region | 🟢 High | High | GDPR requirement | **P0** |\n| Audit Log | 🟡 Med | Low | Enterprise table stakes | **P1** |\n| API v2 | 🟡 Med | High | Developer platform play | **P1** |\n| Auto Reports | 🟡 Med | Medium | Upsell opportunity | **P2** |\n\n> [!NOTE]\n> P0 items are committed. P1 items are planned. P2 items are stretch goals.\n\n---\n\n# Dependencies\n\n```mermaid\nflowchart TD\n    A[\"SSO\"] --> B[\"Role-Based Access\"]\n    C[\"EU Region\"] --> D[\"Internationalization\"]\n    E[\"Copilot GA\"] --> F[\"Smart Suggestions\"]\n    F --> G[\"Auto Reports\"]\n    A --> H[\"Audit Log\"]\n    C --> I[\"API v2\"]\n```\n\n> [!WARNING]\n> SSO is a critical dependency — any delay cascades to RBAC and Audit Log.\n\n---\n\nlayout: cover\nbackground: linear-gradient(135deg, #203a43 0%, #2c5364 100%)\n\n# Ship, Measure, Iterate 🚀\n\n**Next review:** Mid-quarter check-in August 15\n\n<!-- Let\'s lock in the P0 commitments today. Feedback welcome async in #product-roadmap. -->'
    },
    {
      name: 'API Documentation Talk',
      category: 'ppt',
      icon: 'bi-plug',
      description: 'API overview talk with endpoint tables, sequence diagrams, auth flow, and code examples',
      content: 'layout: cover\nbackground: #0d1117\n\n# 🔌 API v2 Overview\n\nIntegration Guide for Partners\n\n*Developer Relations · $(date)*\n\n<!-- Welcome to the API v2 walkthrough. Everything you need to integrate. -->\n\n---\n\n# What\'s New in v2\n\n- ✅ RESTful design with consistent resource naming\n- ✅ Webhook support for real-time events\n- ✅ Rate limiting with clear headers\n- ✅ Pagination via cursor-based tokens\n- ✅ Full OpenAPI 3.0 spec available\n\n> [!TIP]\n> v1 endpoints are deprecated but will work until December 2025.\n\n---\n\n# Authentication\n\n```mermaid\nsequenceDiagram\n    participant App as Your App\n    participant Auth as Auth Server\n    participant API as API v2\n\n    App->>Auth: POST /oauth/token (client_id, secret)\n    Auth-->>App: { access_token, expires_in }\n    App->>API: GET /v2/projects (Bearer token)\n    API-->>App: { data: [...] }\n```\n\n**Auth Methods:**\n| Method | Use Case |\n|:-------|:---------|\n| OAuth 2.0 | Server-to-server integrations |\n| API Key | Testing and personal scripts |\n| JWT | Webhook verification |\n\n---\n\n# Core Endpoints\n\n| Method | Endpoint | Description |\n|:-------|:---------|:------------|\n| `GET` | `/v2/projects` | List all projects |\n| `POST` | `/v2/projects` | Create a project |\n| `GET` | `/v2/projects/:id` | Get project details |\n| `PATCH` | `/v2/projects/:id` | Update a project |\n| `DELETE` | `/v2/projects/:id` | Delete a project |\n| `GET` | `/v2/projects/:id/tasks` | List tasks in project |\n| `POST` | `/v2/projects/:id/tasks` | Create a task |\n\n---\n\n# Code Example\n\n```javascript\n// List all projects with pagination\nconst response = await fetch(\"https://api.example.com/v2/projects?limit=20\", {\n  headers: {\n    \"Authorization\": `Bearer ${ACCESS_TOKEN}`,\n    \"Content-Type\": \"application/json\"\n  }\n});\n\nconst { data, pagination } = await response.json();\nconsole.log(`Found ${pagination.total} projects`);\ndata.forEach(p => console.log(`  ${p.name} (${p.status})`));\n\n// Get next page\nif (pagination.next_cursor) {\n  const nextPage = await fetch(\n    `https://api.example.com/v2/projects?cursor=${pagination.next_cursor}`\n  );\n}\n```\n\n---\n\n# Rate Limits & Errors\n\n| Plan | Rate Limit | Burst |\n|:-----|:-----------|:------|\n| Free | 100 req/min | 20 |\n| Team | 1,000 req/min | 100 |\n| Enterprise | 10,000 req/min | 500 |\n\n**Error Response Format:**\n```javascript\n{\n  \"error\": {\n    \"code\": \"rate_limit_exceeded\",\n    \"message\": \"Too many requests\",\n    \"retry_after\": 30\n  }\n}\n```\n\n> [!IMPORTANT]\n> Always check `X-RateLimit-Remaining` and `Retry-After` headers.\n\n---\n\nlayout: center\n\n# Start Building Today 🛠️\n\n**Docs:** docs.example.com/v2\n\n**Sandbox:** sandbox.example.com\n\n**Support:** api-support@example.com\n\n<!-- Check out our SDKs on GitHub — we have official libraries for JS, Python, Go, and Ruby. -->'
    },
    {
      name: 'Customer Case Study',
      category: 'ppt',
      icon: 'bi-trophy',
      description: 'Customer success story with before/after metrics, testimonials, and implementation journey',
      content: 'layout: cover\nbackground: https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80\n\n# 🏆 Customer Success Story\n\nHow TechCorp Reduced Churn by 34%\n\n*Customer Success Team · $(date)*\n\n<!-- This is our strongest case study yet. TechCorp is now our biggest reference customer. -->\n\n---\n\n# Customer Profile\n\n| Attribute | Detail |\n|:----------|:-------|\n| **Company** | TechCorp Inc. |\n| **Industry** | B2B SaaS |\n| **Size** | 450 employees |\n| **Users** | 120 seats |\n| **Plan** | Enterprise |\n| **Contract** | $180K ACV |\n\n> *\"We evaluated 6 tools. Only yours understood that PMs and engineers need the same workspace.\"*\n> — VP Product, TechCorp\n\n---\n\n# The Challenge\n\n- 📉 **Customer churn at 8.5%** quarterly (industry avg: 5%)\n- 🔄 Teams using **4 different tools** that didn\'t integrate\n- ⏱️ Managers spent **6+ hours/week** on status reporting\n- 📊 No single source of truth for project health\n- 🤷 Couldn\'t identify at-risk customers until too late\n\n---\n\n# The Solution\n\n```mermaid\nflowchart LR\n    A[\"Before: 4 Tools\"] --> B[\"After: 1 Platform\"]\n    B --> C[\"Unified Workspace\"]\n    B --> D[\"AI Dashboards\"]\n    B --> E[\"Auto Alerts\"]\n    C --> F[\"Docs + Tasks + Chat\"]\n    D --> G[\"Health Scores\"]\n    E --> H[\"Churn Prediction\"]\n```\n\n**Implementation:** 3 weeks from kickoff to full rollout\n\n---\n\n# Results — Before & After\n\n| Metric | Before | After | Change |\n|:-------|:-------|:------|:-------|\n| Quarterly Churn | 8.5% | **5.6%** | -34% 📉 |\n| Status Reporting | 6 hrs/wk | **45 min/wk** | -88% ⏱️ |\n| Tool Licenses | $42K/yr | **$28K/yr** | -33% 💰 |\n| CSAT Score | 72 | **89** | +24% 📈 |\n| Time to Onboard New PM | 2 weeks | **3 days** | -79% 🚀 |\n\n> [!NOTE]\n> ROI achieved in under 4 months. Annual savings of $14K in tool costs alone.\n\n---\n\nlayout: center\n\n# Customer Testimonial\n\n> *\"This platform replaced Jira, Confluence, Notion, and half our Slack channels. Our team actually enjoys using it — and that\'s the first time I\'ve said that about a PM tool.\"*\n>\n> **— Sarah Kim, VP Product, TechCorp**\n\n---\n\nlayout: cover\nbackground: linear-gradient(135deg, #b21f1f 0%, #fdbb2d 100%)\n\n# Want Similar Results?\n\n**Book a demo** → sales@example.com\n\n*See the full case study: example.com/customers/techcorp*\n\n<!-- We can share the full ROI calculator with any prospect interested in a similar implementation. -->'
    },
    {
      name: 'Security Briefing',
      category: 'ppt',
      icon: 'bi-shield-check',
      description: 'Security posture review with threat matrix, compliance status, and remediation priorities',
      content: 'layout: cover\nbackground: #0a0a0a\n\n# 🛡️ Security Posture Review\n\nQ1 2025 · Confidential\n\n*Information Security Team · $(date)*\n\n<!-- This briefing covers our security posture, recent incidents, and compliance status. -->\n\n---\n\n# Security Dashboard\n\n| Category | Status | Trend |\n|:---------|:------:|:------|\n| Vulnerability Management | 🟢 Green | Improving |\n| Endpoint Protection | 🟢 Green | Stable |\n| Identity & Access | 🟡 Yellow | Action needed |\n| Data Protection | 🟢 Green | Stable |\n| Incident Response | 🟢 Green | Improving |\n| Compliance | 🟡 Yellow | In progress |\n\n---\n\n# Vulnerability Summary\n\n| Severity | Open | Fixed (Q1) | MTTR |\n|:---------|:-----|:-----------|:-----|\n| 🔴 Critical | 0 | 4 | 2 days |\n| 🟠 High | 3 | 12 | 5 days |\n| 🟡 Medium | 8 | 24 | 14 days |\n| 🔵 Low | 15 | 31 | 30 days |\n\n> [!IMPORTANT]\n> Zero critical vulnerabilities open. The 3 high-severity items are patched but awaiting deployment.\n\n---\n\n# Compliance Status\n\n| Framework | Status | Next Milestone |\n|:----------|:------:|:---------------|\n| SOC 2 Type II | ✅ Certified | Annual renewal Dec 2025 |\n| GDPR | ✅ Compliant | DPA review Q3 |\n| HIPAA | 🔄 In Progress | BAA ready June 2025 |\n| ISO 27001 | 📋 Planned | Audit start Q4 2025 |\n| PCI DSS | ❌ Not Required | N/A |\n\n---\n\n# Threat Landscape\n\n```mermaid\nflowchart TD\n    A[\"Threat Vectors\"] --> B[\"Phishing\"]\n    A --> C[\"Supply Chain\"]\n    A --> D[\"Credential Stuffing\"]\n    A --> E[\"API Abuse\"]\n    B --> F[\"Mitigated: MFA + Training\"]\n    C --> G[\"Mitigated: SCA + SBOM\"]\n    D --> H[\"Mitigated: Rate Limiting + WAF\"]\n    E --> I[\"Monitoring: API Gateway Logs\"]\n```\n\n**Q1 Incidents:** 2 phishing attempts (blocked), 1 dependency vulnerability (patched in 4 hours)\n\n---\n\n# Action Items\n\n| Priority | Action | Owner | Due |\n|:---------|:-------|:------|:----|\n| 🔴 P0 | Deploy 3 high-severity patches | @devops | This week |\n| 🔴 P0 | Enable MFA for all service accounts | @iam | Apr 15 |\n| 🟡 P1 | Complete HIPAA BAA template | @legal | Jun 30 |\n| 🟡 P1 | Implement SBOM generation in CI | @platform | May 15 |\n| 🟢 P2 | Security awareness training refresh | @people | Q2 |\n\n> [!CAUTION]\n> Service account MFA is overdue. This is a critical gap in our IAM posture.\n\n---\n\nlayout: cover\nbackground: #0a0a0a\n\n# Security is Everyone\'s Job 🔐\n\n**Report issues:** security@example.com\n\n<!-- Questions? The security team holds office hours every Thursday at 3 PM. -->'
    },
    {
      name: 'Hackathon Demo Day',
      category: 'ppt',
      icon: 'bi-trophy-fill',
      description: 'Hackathon demo day with project showcases, judging criteria, voting, and awards',
      content: 'layout: cover\nbackground: https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80\n\n# 🏆 Hackathon Demo Day!\n\nSpring 2025 · 48 Hours of Building\n\n*12 Teams · 48 Hackers · Unlimited Coffee ☕*\n\n<!-- Welcome to Demo Day! 12 teams, 48 hours, and some incredible projects. Let\'s see what you built! -->\n\n---\n\n# Judging Criteria\n\n| Criterion | Weight | Description |\n|:----------|:------:|:------------|\n| 🎯 **Impact** | 30% | Does it solve a real problem? |\n| 💡 **Innovation** | 25% | Is the approach creative or novel? |\n| 🛠️ **Technical** | 25% | How well is it built? |\n| 🎨 **Design** | 10% | Is it polished and usable? |\n| 🎤 **Demo** | 10% | Is the presentation clear and compelling? |\n\n> Each team gets **3 minutes** to demo + **2 minutes** for Q&A.\n\n---\n\n# Team Lineup\n\n| # | Team | Project | Tech |\n|:--|:-----|:--------|:-----|\n| 1 | 🦊 FoxForce | AI Code Reviewer | GPT-4 + GitHub API |\n| 2 | 🚀 LaunchPad | One-Click Staging | Terraform + K8s |\n| 3 | 🎵 SoundWave | Meeting Summarizer | Whisper + LLM |\n| 4 | 🌿 GreenCode | Carbon-Aware CI | Cloud Carbon API |\n| 5 | 🔮 Crystal | Predictive Alerting | Time Series ML |\n| 6 | 🎮 PixelPush | Gamified Onboarding | React + Badges |\n\n*...and 6 more amazing teams!*\n\n---\n\n# Demo Flow\n\n```mermaid\nflowchart LR\n    A[\"Teams 1-4\\n(12 min)\"] --> B[\"☕ Break\\n(5 min)\"]\n    B --> C[\"Teams 5-8\\n(12 min)\"]\n    C --> D[\"☕ Break\\n(5 min)\"]\n    D --> E[\"Teams 9-12\\n(12 min)\"]\n    E --> F[\"🗳️ Voting\\n(10 min)\"]\n    F --> G[\"🏆 Awards!\"]\n```\n\n---\n\n# Prizes\n\n| Place | Prize | Perk |\n|:------|:------|:-----|\n| 🥇 **1st Place** | $3,000 + Trophy | Project gets roadmap slot |\n| 🥈 **2nd Place** | $1,500 | Extra PTO day |\n| 🥉 **3rd Place** | $750 | Swag box |\n| 🌟 **People\'s Choice** | $500 | Bragging rights |\n| 💡 **Most Innovative** | $500 | Innovation lab access |\n\n> [!TIP]\n> Vote for People\'s Choice on Slido: **#hackathon2025**\n\n---\n\nlayout: center\n\n# Time to Vote! 🗳️\n\nScan the QR code or go to **slido.com/hackathon2025**\n\n*Results announced in 15 minutes!*\n\n---\n\nlayout: cover\nbackground: linear-gradient(135deg, #f5af19 0%, #f12711 100%)\n\n# Congratulations to ALL Teams! 🎉\n\n48 hours of pure creativity and engineering excellence.\n\n*See you at the next hackathon!*\n\n<!-- Incredible work from everyone. The energy this week was unmatched. -->'
    },
    {
      name: 'Python Playground',
      category: 'coding',
      icon: 'bi-filetype-py',
      description: 'Interactive Python examples — algorithms, data processing, and math — runnable in the browser via Pyodide',
      content: '# 🐍 Python Playground\n\n' +
        '> Run Python code **directly in your browser** — no install required!\n' +
        '> Powered by [Pyodide](https://pyodide.org/) (CPython compiled to WebAssembly).\n\n' +
        '> [!TIP]\n' +
        '> Hover over any code block and click **▶ Run** to execute. The first run downloads the Python runtime (~11 MB, cached afterwards).\n\n' +
        '---\n\n' +
        '## 🔢 Math & Constants\n\n' +
        '```python\n' +
        'import math\n\n' +
        'print(f"π  = {math.pi:.15f}")\n' +
        'print(f"e  = {math.e:.15f}")\n' +
        'print(f"τ  = {math.tau:.15f}")\n' +
        'print(f"φ  = {(1 + 5**0.5) / 2:.15f}  (golden ratio)")\n' +
        'print()\n' +
        'print(f"100! = {math.factorial(100)}")\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🧮 Algorithms\n\n' +
        '```python\n' +
        '# Fibonacci — iterative\n' +
        'def fib(n):\n' +
        '    a, b = 0, 1\n' +
        '    for _ in range(n):\n' +
        '        a, b = b, a + b\n' +
        '    return a\n\n' +
        'print("Fibonacci sequence:")\n' +
        'for i in range(1, 16):\n' +
        '    print(f"  fib({i:2d}) = {fib(i)}")\n' +
        '```\n\n' +
        '```python\n' +
        '# Sieve of Eratosthenes\n' +
        'def primes_up_to(n):\n' +
        '    sieve = [True] * (n + 1)\n' +
        '    sieve[0] = sieve[1] = False\n' +
        '    for i in range(2, int(n**0.5) + 1):\n' +
        '        if sieve[i]:\n' +
        '            for j in range(i*i, n + 1, i):\n' +
        '                sieve[j] = False\n' +
        '    return [i for i, v in enumerate(sieve) if v]\n\n' +
        'p = primes_up_to(100)\n' +
        'print(f"Primes up to 100 ({len(p)} total):")\n' +
        'print(p)\n' +
        '```\n\n' +
        '```python\n' +
        '# Sorting algorithms comparison\n' +
        'import random, time\n\n' +
        'def bubble_sort(arr):\n' +
        '    a = arr[:]\n' +
        '    for i in range(len(a)):\n' +
        '        for j in range(len(a) - i - 1):\n' +
        '            if a[j] > a[j+1]:\n' +
        '                a[j], a[j+1] = a[j+1], a[j]\n' +
        '    return a\n\n' +
        'data = [random.randint(1, 1000) for _ in range(500)]\n\n' +
        't1 = time.time()\n' +
        'bubble_sort(data)\n' +
        'bubble_time = time.time() - t1\n\n' +
        't2 = time.time()\n' +
        'sorted(data)\n' +
        'builtin_time = time.time() - t2\n\n' +
        'print(f"Bubble sort (500 items): {bubble_time*1000:.1f} ms")\n' +
        'print(f"Built-in sort:          {builtin_time*1000:.3f} ms")\n' +
        'print(f"Built-in is {bubble_time/builtin_time:.0f}x faster!")\n' +
        '```\n\n' +
        '---\n\n' +
        '## 📊 Data Processing\n\n' +
        '```python\n' +
        '# JSON data analysis\n' +
        'import json\n\n' +
        'students = [\n' +
        '    {"name": "Alice",   "grade": "A",  "score": 95},\n' +
        '    {"name": "Bob",     "grade": "B+", "score": 88},\n' +
        '    {"name": "Carol",   "grade": "A-", "score": 92},\n' +
        '    {"name": "David",   "grade": "B",  "score": 85},\n' +
        '    {"name": "Eve",     "grade": "A+", "score": 98},\n' +
        '    {"name": "Frank",   "grade": "C+", "score": 78},\n' +
        ']\n\n' +
        'scores = [s["score"] for s in students]\n' +
        'avg = sum(scores) / len(scores)\n' +
        'top = max(students, key=lambda s: s["score"])\n\n' +
        'print(f"Students:  {len(students)}")\n' +
        'print(f"Average:   {avg:.1f}")\n' +
        'print(f"Highest:   {top[\'name\']} ({top[\'score\']})")\n' +
        'print(f"Lowest:    {min(scores)}")\n' +
        'print(f"Std Dev:   {(sum((s - avg)**2 for s in scores) / len(scores))**0.5:.2f}")\n' +
        'print()\n' +
        'print("Leaderboard:")\n' +
        'for i, s in enumerate(sorted(students, key=lambda x: -x["score"]), 1):\n' +
        '    medal = ["🥇", "🥈", "🥉"][i-1] if i <= 3 else "  "\n' +
        '    print(f"  {medal} {s[\'name\']: <8} {s[\'grade\']: <3} {s[\'score\']: >3}")\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🎨 String Art\n\n' +
        '```python\n' +
        '# ASCII art generator\n' +
        'import math\n\n' +
        'width, height = 60, 20\n\n' +
        'for y in range(height):\n' +
        '    row = ""\n' +
        '    for x in range(width):\n' +
        '        nx = (x / width - 0.5) * 4\n' +
        '        ny = (y / height - 0.5) * 2\n' +
        '        val = math.sin(nx * 2) * math.cos(ny * 3) + math.sin(nx * ny)\n' +
        '        chars = " .:-=+*#%@"\n' +
        '        idx = int((val + 2) / 4 * (len(chars) - 1))\n' +
        '        idx = max(0, min(len(chars) - 1, idx))\n' +
        '        row += chars[idx]\n' +
        '    print(row)\n' +
        '```\n'
    },
    {
      name: 'HTML Playground',
      category: 'coding',
      icon: 'bi-filetype-html',
      description: 'Interactive HTML/CSS/JS demos — animations, interactive widgets, and canvas drawing — live in the preview',
      content: '# 🌐 HTML Playground\n\n' +
        '> Preview HTML, CSS, and JavaScript **live in your browser** — rendered inside a secure, sandboxed `<iframe>`.\n\n' +
        '> [!TIP]\n' +
        '> Hover over any code block and click **▶ Preview** to see it rendered. Click again to close.\n\n' +
        '---\n\n' +
        '## 🎨 CSS Animation\n\n' +
        '```html\n' +
        '<style>\n' +
        '  body { font-family: system-ui; text-align: center; padding: 20px; margin: 0;\n' +
        '         background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: #fff; }\n' +
        '  .orbit { position: relative; width: 200px; height: 200px; margin: 20px auto; }\n' +
        '  .planet { width: 20px; height: 20px; border-radius: 50%;\n' +
        '            position: absolute; top: 50%; left: 50%; margin: -10px;\n' +
        '            animation: orbit 3s linear infinite; }\n' +
        '  .planet:nth-child(1) { background: #667eea; animation-duration: 2s; }\n' +
        '  .planet:nth-child(2) { background: #f093fb; animation-duration: 3s; animation-delay: -1s; }\n' +
        '  .planet:nth-child(3) { background: #4facfe; animation-duration: 4s; animation-delay: -2s; }\n' +
        '  .sun { width: 40px; height: 40px; background: #ffd700; border-radius: 50%;\n' +
        '         position: absolute; top: 50%; left: 50%; margin: -20px;\n' +
        '         box-shadow: 0 0 30px #ffd700; }\n' +
        '  @keyframes orbit {\n' +
        '    from { transform: rotate(0deg) translateX(80px) rotate(0deg); }\n' +
        '    to   { transform: rotate(360deg) translateX(80px) rotate(-360deg); }\n' +
        '  }\n' +
        '</style>\n' +
        '<h3>🌌 Solar System</h3>\n' +
        '<div class="orbit">\n' +
        '  <div class="sun"></div>\n' +
        '  <div class="planet"></div>\n' +
        '  <div class="planet"></div>\n' +
        '  <div class="planet"></div>\n' +
        '</div>\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🖱️ Interactive Counter\n\n' +
        '```html\n' +
        '<style>\n' +
        '  body { font-family: system-ui; text-align: center; padding: 30px; }\n' +
        '  .counter { font-size: 48px; font-weight: bold; color: #667eea; margin: 20px; }\n' +
        '  button { padding: 12px 24px; font-size: 18px; border: none; border-radius: 8px;\n' +
        '           cursor: pointer; margin: 5px; transition: transform 0.1s; }\n' +
        '  button:active { transform: scale(0.95); }\n' +
        '  .minus { background: #f47067; color: #fff; }\n' +
        '  .plus  { background: #238636; color: #fff; }\n' +
        '  .reset { background: #6f42c1; color: #fff; }\n' +
        '</style>\n' +
        '<div class="counter" id="count">0</div>\n' +
        '<button class="minus" onclick="update(-1)">− 1</button>\n' +
        '<button class="reset" onclick="n=0;update(0)">Reset</button>\n' +
        '<button class="plus" onclick="update(1)">+ 1</button>\n' +
        '<script>\n' +
        '  let n = 0;\n' +
        '  function update(d) { n += d; document.getElementById("count").textContent = n; }\n' +
        '</script>\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🎨 Canvas Drawing\n\n' +
        '```html\n' +
        '<style>\n' +
        '  body { font-family: system-ui; text-align: center; padding: 10px; margin: 0; }\n' +
        '  canvas { border: 2px solid #ddd; border-radius: 8px; cursor: crosshair; display: block; margin: 10px auto; }\n' +
        '  .controls { margin: 10px; }\n' +
        '  button { padding: 8px 16px; margin: 4px; border: none; border-radius: 6px; cursor: pointer; }\n' +
        '  .color-btn { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #ccc; cursor: pointer; }\n' +
        '  .color-btn.active { border-color: #333; box-shadow: 0 0 4px rgba(0,0,0,0.3); }\n' +
        '</style>\n' +
        '<h3>🖌️ Draw Something!</h3>\n' +
        '<div class="controls">\n' +
        '  <button class="color-btn active" style="background:#333" onclick="setColor(this,\'#333\')"></button>\n' +
        '  <button class="color-btn" style="background:#f47067" onclick="setColor(this,\'#f47067\')"></button>\n' +
        '  <button class="color-btn" style="background:#238636" onclick="setColor(this,\'#238636\')"></button>\n' +
        '  <button class="color-btn" style="background:#667eea" onclick="setColor(this,\'#667eea\')"></button>\n' +
        '  <button class="color-btn" style="background:#ffd700" onclick="setColor(this,\'#ffd700\')"></button>\n' +
        '  <button onclick="ctx.clearRect(0,0,cv.width,cv.height)" style="background:#eee">Clear</button>\n' +
        '</div>\n' +
        '<canvas id="cv" width="400" height="250"></canvas>\n' +
        '<script>\n' +
        '  const cv = document.getElementById("cv");\n' +
        '  const ctx = cv.getContext("2d");\n' +
        '  let drawing = false, color = "#333";\n' +
        '  ctx.lineWidth = 3; ctx.lineCap = "round";\n' +
        '  function setColor(btn, c) { color = c; ctx.strokeStyle = c;\n' +
        '    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));\n' +
        '    btn.classList.add("active"); }\n' +
        '  cv.addEventListener("mousedown", e => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });\n' +
        '  cv.addEventListener("mousemove", e => { if (drawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } });\n' +
        '  cv.addEventListener("mouseup", () => drawing = false);\n' +
        '  cv.addEventListener("mouseleave", () => drawing = false);\n' +
        '</script>\n' +
        '```\n\n' +
        '---\n\n' +
        '## ⏱️ Stopwatch\n\n' +
        '```html\n' +
        '<style>\n' +
        '  body { font-family: \'SF Mono\', monospace; text-align: center; padding: 30px;\n' +
        '         background: #1b1f23; color: #c9d1d9; }\n' +
        '  .time { font-size: 56px; letter-spacing: 4px; margin: 20px; color: #58a6ff; }\n' +
        '  button { padding: 10px 24px; font-size: 16px; border: none; border-radius: 8px;\n' +
        '           cursor: pointer; margin: 5px; color: #fff; }\n' +
        '  .start { background: #238636; }\n' +
        '  .stop  { background: #f47067; }\n' +
        '  .reset { background: #6f42c1; }\n' +
        '</style>\n' +
        '<div class="time" id="display">00:00.00</div>\n' +
        '<button class="start" onclick="start()">Start</button>\n' +
        '<button class="stop" onclick="stop()">Stop</button>\n' +
        '<button class="reset" onclick="reset()">Reset</button>\n' +
        '<script>\n' +
        '  let t = 0, timer = null;\n' +
        '  function fmt(ms) { let s=Math.floor(ms/1000), m=Math.floor(s/60);\n' +
        '    return `${String(m).padStart(2,"0")}:${String(s%60).padStart(2,"0")}.${String(Math.floor(ms%1000/10)).padStart(2,"0")}`; }\n' +
        '  function start() { if(!timer) { let s=Date.now()-t; timer=setInterval(()=>{t=Date.now()-s;document.getElementById("display").textContent=fmt(t)},10); } }\n' +
        '  function stop() { clearInterval(timer); timer=null; }\n' +
        '  function reset() { stop(); t=0; document.getElementById("display").textContent="00:00.00"; }\n' +
        '</script>\n' +
        '```\n'
    },
    {
      name: 'Bash Scripting',
      category: 'coding',
      icon: 'bi-terminal',
      description: 'Executable bash examples — file operations, text processing, loops, and system commands',
      content: '# 🖥️ Bash Scripting Playground\n\n' +
        '> Run bash commands **directly in the browser** — powered by [just-bash](https://justbash.dev/) (WASM).\n\n' +
        '> [!TIP]\n' +
        '> Hover over any code block and click **▶ Run** to execute.\n\n' +
        '---\n\n' +
        '## 📝 Basics\n\n' +
        '```bash\n' +
        'echo "Hello from bash! 🎉"\n' +
        'echo "Today is $(date +%A), $(date +%B\\ %d,\\ %Y)"\n' +
        'echo "Shell: $SHELL"\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🔁 Loops & Logic\n\n' +
        '```bash\n' +
        '# Counting loop\n' +
        'for i in $(seq 1 5); do\n' +
        '  echo "Count: $i"\n' +
        'done\n' +
        '```\n\n' +
        '```bash\n' +
        '# FizzBuzz in bash\n' +
        'for i in $(seq 1 20); do\n' +
        '  if   [ $((i % 15)) -eq 0 ]; then echo "$i: FizzBuzz"\n' +
        '  elif [ $((i % 3))  -eq 0 ]; then echo "$i: Fizz"\n' +
        '  elif [ $((i % 5))  -eq 0 ]; then echo "$i: Buzz"\n' +
        '  else echo "$i"\n' +
        '  fi\n' +
        'done\n' +
        '```\n\n' +
        '---\n\n' +
        '## 📊 Text Processing\n\n' +
        '```bash\n' +
        '# Create sample data and process it\n' +
        'echo -e "Name,Score\\nAlice,95\\nBob,87\\nCarol,92\\nDave,78\\nEve,98" > /tmp/data.csv\n' +
        'echo "=== Student Scores ==="\n' +
        'cat /tmp/data.csv\n' +
        'echo ""\n' +
        'echo "Top scorer:"\n' +
        'sort -t, -k2 -n -r /tmp/data.csv | head -2 | tail -1\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🔧 Functions\n\n' +
        '```bash\n' +
        '# Bash function\n' +
        'greet() {\n' +
        '  local name="$1"\n' +
        '  echo "Hello, $name! Welcome to bash scripting."\n' +
        '}\n\n' +
        'greet "World"\n' +
        'greet "MDview"\n' +
        'greet "$(whoami)"\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🎨 ASCII Art\n\n' +
        '```bash\n' +
        '# Draw a box\n' +
        'msg="MDview Bash Sandbox"\n' +
        'len=${#msg}\n' +
        'border=$(printf "%0.s─" $(seq 1 $((len + 2))))\n' +
        'echo "┌${border}┐"\n' +
        'echo "│ ${msg} │"\n' +
        'echo "└${border}┘"\n' +
        '```\n'
    },
    {
      name: 'JavaScript Sandbox',
      category: 'coding',
      icon: 'bi-filetype-js',
      description: 'Executable JavaScript examples — algorithms, DOM-free computations, and functional programming',
      content: '# ⚡ JavaScript Sandbox\n\n' +
        '> Run JavaScript **directly in the browser** with full console.log capture.\n\n' +
        '> [!TIP]\n' +
        '> Hover over any code block and click **▶ Run** to execute. Output from `console.log`, `console.warn`, and `console.error` is captured and displayed.\n\n' +
        '---\n\n' +
        '## 🔢 Basics\n\n' +
        '```javascript\n' +
        'console.log("Hello from JavaScript!");\n' +
        'console.log("2 + 2 =", 2 + 2);\n' +
        'console.log("Type of null:", typeof null);\n' +
        'console.log("0.1 + 0.2 =", 0.1 + 0.2);\n' +
        'console.log("NaN === NaN?", NaN === NaN);\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🧮 Algorithms\n\n' +
        '```javascript\n' +
        '// Fibonacci with memoization\n' +
        'function fib(n, memo = {}) {\n' +
        '  if (n <= 1) return n;\n' +
        '  if (memo[n]) return memo[n];\n' +
        '  return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n' +
        '}\n\n' +
        'for (let i = 1; i <= 15; i++) {\n' +
        '  console.log(`fib(${i}) = ${fib(i)}`);\n' +
        '}\n' +
        '```\n\n' +
        '```javascript\n' +
        '// Array methods showcase\n' +
        'const data = [5, 12, 8, 130, 44, 3, 91, 17];\n\n' +
        'console.log("Original:", data);\n' +
        'console.log("Sorted:", [...data].sort((a, b) => a - b));\n' +
        'console.log("Sum:", data.reduce((a, b) => a + b, 0));\n' +
        'console.log("Average:", (data.reduce((a, b) => a + b) / data.length).toFixed(1));\n' +
        'console.log("Even:", data.filter(n => n % 2 === 0));\n' +
        'console.log("Doubled:", data.map(n => n * 2));\n' +
        'console.log("Any > 100?", data.some(n => n > 100));\n' +
        '```\n\n' +
        '---\n\n' +
        '## 📦 Objects & JSON\n\n' +
        '```javascript\n' +
        'const users = [\n' +
        '  { name: "Alice", age: 28, role: "engineer" },\n' +
        '  { name: "Bob", age: 32, role: "designer" },\n' +
        '  { name: "Carol", age: 25, role: "engineer" },\n' +
        '  { name: "Dave", age: 35, role: "manager" },\n' +
        '];\n\n' +
        'const engineers = users.filter(u => u.role === "engineer");\n' +
        'const avgAge = users.reduce((s, u) => s + u.age, 0) / users.length;\n' +
        'const byRole = Object.groupBy?.(users, u => u.role) \n' +
        '  || users.reduce((g, u) => ({...g, [u.role]: [...(g[u.role]||[]), u]}), {});\n\n' +
        'console.log("Engineers:", engineers.map(u => u.name));\n' +
        'console.log("Average age:", avgAge);\n' +
        'console.log("Grouped by role:", byRole);\n' +
        '```\n\n' +
        '---\n\n' +
        '## ⏱️ Async & Promises\n\n' +
        '```javascript\n' +
        '// Promise chain\n' +
        'const delay = ms => new Promise(r => setTimeout(r, ms));\n\n' +
        'console.log("Start");\n\n' +
        'Promise.resolve()\n' +
        '  .then(() => { console.log("Step 1: Processing..."); })\n' +
        '  .then(() => { console.log("Step 2: Analyzing..."); })\n' +
        '  .then(() => {\n' +
        '    const result = Array.from({length: 10}, (_, i) => i * i);\n' +
        '    console.log("Step 3: Results:", result);\n' +
        '  })\n' +
        '  .then(() => console.log("Done! ✅"));\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🎨 String Art\n\n' +
        '```javascript\n' +
        '// Generate a pattern\n' +
        'for (let i = 1; i <= 9; i += 2) {\n' +
        '  const spaces = " ".repeat((9 - i) / 2);\n' +
        '  const stars = "★".repeat(i);\n' +
        '  console.log(spaces + stars);\n' +
        '}\n' +
        'for (let i = 7; i >= 1; i -= 2) {\n' +
        '  const spaces = " ".repeat((9 - i) / 2);\n' +
        '  const stars = "★".repeat(i);\n' +
        '  console.log(spaces + stars);\n' +
        '}\n' +
        '```\n'
    },
    {
      name: 'HTML + JavaScript',
      category: 'coding',
      icon: 'bi-window-stack',
      description: 'Interactive HTML/CSS/JS demos — games, widgets, and visual experiments you can preview live',
      content: '# 🌐 HTML + JavaScript Interactive\n\n' +
        '> Build interactive web demos with HTML, CSS, and JavaScript — all rendered live in a sandboxed iframe.\n\n' +
        '> [!TIP]\n' +
        '> Hover and click **▶ Preview** to render. Each block is a self-contained mini web page.\n\n' +
        '---\n\n' +
        '## 🎯 Click Game\n\n' +
        '```html\n' +
        '<style>\n' +
        '  body { font-family: system-ui; text-align: center; padding: 20px;\n' +
        '         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; margin: 0; }\n' +
        '  .target { width: 50px; height: 50px; background: #ff6b6b; border-radius: 50%;\n' +
        '            position: absolute; cursor: pointer; transition: transform 0.1s;\n' +
        '            box-shadow: 0 4px 15px rgba(0,0,0,0.3); }\n' +
        '  .target:hover { transform: scale(1.1); }\n' +
        '  #score { font-size: 36px; font-weight: bold; }\n' +
        '  #timer { font-size: 18px; opacity: 0.8; }\n' +
        '</style>\n' +
        '<div id="score">Score: 0</div>\n' +
        '<div id="timer">Click the circles! 10s</div>\n' +
        '<div id="area" style="position:relative;height:200px"></div>\n' +
        '<button onclick="startGame()" style="padding:10px 24px;font-size:16px;border:none;border-radius:8px;cursor:pointer;background:#ffd700;color:#333;font-weight:bold">Start!</button>\n' +
        '<script>\n' +
        '  let score=0, timer=null, timeLeft=10;\n' +
        '  function spawn() { let a=document.getElementById("area"); let d=document.createElement("div");\n' +
        '    d.className="target"; d.style.left=Math.random()*(a.offsetWidth-50)+"px";\n' +
        '    d.style.top=Math.random()*(a.offsetHeight-50)+"px";\n' +
        '    d.onclick=function(){score++;document.getElementById("score").textContent="Score: "+score;this.remove();spawn()};\n' +
        '    a.innerHTML="";a.appendChild(d); }\n' +
        '  function startGame() { score=0;timeLeft=10;document.getElementById("score").textContent="Score: 0";spawn();\n' +
        '    clearInterval(timer);timer=setInterval(()=>{timeLeft--;\n' +
        '      document.getElementById("timer").textContent="Time: "+timeLeft+"s";\n' +
        '      if(timeLeft<=0){clearInterval(timer);document.getElementById("area").innerHTML="";\n' +
        '        document.getElementById("timer").textContent="Game Over! Score: "+score}},1000); }\n' +
        '</script>\n' +
        '```\n\n' +
        '---\n\n' +
        '## 📊 Live Chart\n\n' +
        '```html\n' +
        '<style>\n' +
        '  body { font-family: system-ui; padding: 20px; margin: 0; }\n' +
        '  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 150px; padding: 0 20px; }\n' +
        '  .bar { flex: 1; background: linear-gradient(to top, #667eea, #764ba2);\n' +
        '         border-radius: 4px 4px 0 0; transition: height 0.5s ease; min-width: 30px;\n' +
        '         display: flex; align-items: flex-start; justify-content: center;\n' +
        '         color: #fff; font-size: 12px; font-weight: bold; padding-top: 4px; }\n' +
        '  .labels { display: flex; gap: 8px; padding: 4px 20px; }\n' +
        '  .labels span { flex: 1; text-align: center; font-size: 12px; color: #666; min-width: 30px; }\n' +
        '  button { padding: 8px 20px; border: none; border-radius: 6px; cursor: pointer;\n' +
        '           background: #667eea; color: #fff; font-size: 14px; margin-top: 10px; }\n' +
        '</style>\n' +
        '<h3 style="text-align:center;margin:0 0 10px">📊 Random Data</h3>\n' +
        '<div class="bar-chart" id="chart"></div>\n' +
        '<div class="labels" id="labels"></div>\n' +
        '<div style="text-align:center"><button onclick="randomize()">🔄 Randomize</button></div>\n' +
        '<script>\n' +
        '  const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];\n' +
        '  function randomize(){let c=document.getElementById("chart"),l=document.getElementById("labels");\n' +
        '    c.innerHTML="";l.innerHTML="";\n' +
        '    days.forEach(d=>{let v=20+Math.random()*80;\n' +
        '      c.innerHTML+=`<div class="bar" style="height:${v}%">${Math.round(v)}</div>`;\n' +
        '      l.innerHTML+=`<span>${d}</span>`});}\n' +
        '  randomize();\n' +
        '</script>\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🎨 Gradient Generator\n\n' +
        '```html\n' +
        '<style>\n' +
        '  body { font-family: system-ui; padding: 20px; margin: 0; text-align: center; }\n' +
        '  #preview { height: 120px; border-radius: 12px; margin: 15px 0;\n' +
        '             display: flex; align-items: center; justify-content: center;\n' +
        '             color: #fff; font-size: 14px; text-shadow: 0 1px 3px rgba(0,0,0,0.3); }\n' +
        '  .controls { display: flex; gap: 10px; justify-content: center; align-items: center; flex-wrap: wrap; }\n' +
        '  input[type=color] { width: 50px; height: 35px; border: none; cursor: pointer; border-radius: 6px; }\n' +
        '  select, button { padding: 8px 12px; border-radius: 6px; border: 1px solid #ddd; font-size: 14px; }\n' +
        '  button { background: #333; color: #fff; border: none; cursor: pointer; }\n' +
        '  code { background: #f0f0f0; padding: 6px 12px; border-radius: 6px; font-size: 13px; display: inline-block; margin-top: 10px; }\n' +
        '</style>\n' +
        '<h3>🎨 CSS Gradient Generator</h3>\n' +
        '<div class="controls">\n' +
        '  <input type="color" id="c1" value="#667eea" onchange="update()">\n' +
        '  <input type="color" id="c2" value="#764ba2" onchange="update()">\n' +
        '  <select id="dir" onchange="update()">\n' +
        '    <option value="to right">→</option><option value="to left">←</option>\n' +
        '    <option value="to bottom">↓</option><option value="to top">↑</option>\n' +
        '    <option value="135deg" selected>↘</option><option value="45deg">↗</option>\n' +
        '  </select>\n' +
        '  <button onclick="navigator.clipboard.writeText(document.getElementById(\'css\').textContent)">📋 Copy CSS</button>\n' +
        '</div>\n' +
        '<div id="preview"></div>\n' +
        '<code id="css"></code>\n' +
        '<script>\n' +
        '  function update(){ let g=`linear-gradient(${document.getElementById("dir").value}, ${document.getElementById("c1").value}, ${document.getElementById("c2").value})`;\n' +
        '    document.getElementById("preview").style.background=g;\n' +
        '    document.getElementById("css").textContent=`background: ${g};`;\n' +
        '    document.getElementById("preview").textContent=g; }\n' +
        '  update();\n' +
        '</script>\n' +
        '```\n'
    },
    {
      name: 'SQL Playground',
      category: 'coding',
      icon: 'bi-database',
      description: 'Interactive SQL tutorial with CREATE, INSERT, SELECT, JOIN, and aggregate queries on in-memory SQLite',
      content: '# 🗄️ SQL Playground\n\n' +
        '> Run SQL queries on an **in-memory SQLite database** — powered by [sql.js](https://sql.js.org/).\n\n' +
        '> [!TIP]\n' +
        '> Tables persist across blocks on the same page. Run blocks in order to build up your database!\n\n' +
        '> [!NOTE]\n' +
        '> The database resets when you reload the page.\n\n' +
        '---\n\n' +
        '## 📋 Create Tables\n\n' +
        '```sql\n' +
        'CREATE TABLE IF NOT EXISTS employees (\n' +
        '  id INTEGER PRIMARY KEY,\n' +
        '  name TEXT NOT NULL,\n' +
        '  department TEXT,\n' +
        '  salary REAL,\n' +
        '  hire_date TEXT\n' +
        ');\n\n' +
        'CREATE TABLE IF NOT EXISTS departments (\n' +
        '  name TEXT PRIMARY KEY,\n' +
        '  budget REAL,\n' +
        '  location TEXT\n' +
        ')\n' +
        '```\n\n' +
        '---\n\n' +
        '## 📝 Insert Data\n\n' +
        '```sql\n' +
        'INSERT OR REPLACE INTO departments VALUES\n' +
        '  (\'Engineering\', 500000, \'Floor 3\'),\n' +
        '  (\'Marketing\',   200000, \'Floor 2\'),\n' +
        '  (\'Sales\',       300000, \'Floor 1\'),\n' +
        '  (\'HR\',          150000, \'Floor 2\');\n\n' +
        'INSERT OR REPLACE INTO employees VALUES\n' +
        '  (1, \'Alice\',   \'Engineering\', 95000, \'2022-03-15\'),\n' +
        '  (2, \'Bob\',     \'Marketing\',   72000, \'2021-07-01\'),\n' +
        '  (3, \'Carol\',   \'Engineering\', 102000,\'2020-01-10\'),\n' +
        '  (4, \'Dave\',    \'Sales\',       68000, \'2023-06-20\'),\n' +
        '  (5, \'Eve\',     \'Engineering\', 115000,\'2019-11-05\'),\n' +
        '  (6, \'Frank\',   \'HR\',          65000, \'2022-09-12\'),\n' +
        '  (7, \'Grace\',   \'Marketing\',   78000, \'2021-03-28\'),\n' +
        '  (8, \'Hank\',    \'Sales\',       71000, \'2020-08-14\')\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🔍 Basic Queries\n\n' +
        '```sql\n' +
        'SELECT * FROM employees ORDER BY salary DESC\n' +
        '```\n\n' +
        '```sql\n' +
        'SELECT * FROM employees WHERE department = \'Engineering\' ORDER BY hire_date\n' +
        '```\n\n' +
        '---\n\n' +
        '## 📊 Aggregates & GROUP BY\n\n' +
        '```sql\n' +
        'SELECT \n' +
        '  department,\n' +
        '  COUNT(*) as headcount,\n' +
        '  ROUND(AVG(salary), 0) as avg_salary,\n' +
        '  MIN(salary) as min_salary,\n' +
        '  MAX(salary) as max_salary\n' +
        'FROM employees\n' +
        'GROUP BY department\n' +
        'ORDER BY avg_salary DESC\n' +
        '```\n\n' +
        '---\n\n' +
        '## 🔗 JOINs\n\n' +
        '```sql\n' +
        'SELECT \n' +
        '  e.name,\n' +
        '  e.department,\n' +
        '  e.salary,\n' +
        '  d.budget,\n' +
        '  d.location,\n' +
        '  ROUND(e.salary * 100.0 / d.budget, 1) as pct_of_budget\n' +
        'FROM employees e\n' +
        'JOIN departments d ON e.department = d.name\n' +
        'ORDER BY pct_of_budget DESC\n' +
        '```\n'
    },
  ];

  // --- Template Modal Logic ---
  const templateModal = document.getElementById('template-modal');
  const templateGrid = document.getElementById('template-grid');
  const templateSearchInput = document.getElementById('template-search-input');
  const templateCategories = document.getElementById('template-categories');
  const templateEmpty = document.getElementById('template-empty');
  const templateCloseBtn = document.getElementById('template-modal-close');
  const templateBtn = document.getElementById('template-btn');
  const mobileTemplateBtn = document.getElementById('mobile-template-btn');

  let activeTemplateCategory = 'all';

  function getCategoryIconClass(category) {
    switch (category) {
      case 'documentation': return 'doc';
      case 'project': return 'project';
      case 'technical': return 'technical';
      case 'creative': return 'creative';
      case 'coding': return 'technical';
      case 'maths': return 'doc';
      case 'ppt': return 'creative';
      default: return 'doc';
    }
  }

  function getCategoryIcon(category) {
    switch (category) {
      case 'documentation': return 'bi-book';
      case 'project': return 'bi-clipboard-check';
      case 'technical': return 'bi-cpu';
      case 'creative': return 'bi-brush';
      case 'coding': return 'bi-terminal';
      case 'maths': return 'bi-calculator';
      case 'ppt': return 'bi-easel';
      default: return 'bi-file-earmark';
    }
  }

  function renderTemplateCards(templates) {
    templateGrid.innerHTML = '';
    if (templates.length === 0) {
      templateGrid.style.display = 'none';
      templateEmpty.style.display = 'flex';
      return;
    }
    templateGrid.style.display = 'grid';
    templateEmpty.style.display = 'none';

    templates.forEach((tpl, idx) => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.setAttribute('data-template-index', String(idx));
      card.setAttribute('title', 'Click to use this template');

      const preview = tpl.content.trim().split('\n').slice(0, 4).join('\n');

      card.innerHTML = `
      <div class="template-card-icon ${getCategoryIconClass(tpl.category)}">
        <i class="bi ${tpl.icon || getCategoryIcon(tpl.category)}"></i>
      </div>
      <div class="template-card-name">${tpl.name}</div>
      <div class="template-card-desc">${tpl.description}</div>
      <span class="template-card-tag ${tpl.category}">${tpl.category}</span>
      <div class="template-card-preview">${preview.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    `;

      templateGrid.appendChild(card);
    });
  }

  // Use event delegation on the grid for reliable click handling
  let _filteredTemplates = MARKDOWN_TEMPLATES;

  function filterTemplates() {
    const query = templateSearchInput.value.toLowerCase().trim();
    const category = activeTemplateCategory;

    _filteredTemplates = MARKDOWN_TEMPLATES.filter(tpl => {
      const matchCategory = category === 'all' || tpl.category === category;
      if (!matchCategory) return false;
      if (!query) return true;

      return tpl.name.toLowerCase().includes(query) ||
        tpl.description.toLowerCase().includes(query) ||
        tpl.category.toLowerCase().includes(query) ||
        tpl.content.toLowerCase().includes(query);
    });

    renderTemplateCards(_filteredTemplates);
  }

  // Event delegation: handle clicks on any template card
  if (templateGrid) {
    templateGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.template-card');
      if (!card) return;
      const idx = parseInt(card.getAttribute('data-template-index'), 10);
      if (isNaN(idx) || idx < 0 || idx >= _filteredTemplates.length) return;
      selectTemplate(_filteredTemplates[idx]);
    });
  }

  function selectTemplate(tpl) {
    // Replace $(date) placeholders with current date
    const today = new Date().toISOString().split('T')[0];
    const content = tpl.content.replace(/\$\(date\)/g, today);

    M.markdownEditor.value = content;
    M.renderMarkdown();
    closeTemplateModal();

    // Scroll editor to top
    M.markdownEditor.scrollTop = 0;
  }

  function openTemplateModal() {
    templateSearchInput.value = '';
    activeTemplateCategory = 'all';

    // Reset category buttons
    templateCategories.querySelectorAll('.template-cat-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === 'all');
    });

    renderTemplateCards(MARKDOWN_TEMPLATES);
    templateModal.style.display = 'flex';
    setTimeout(() => templateSearchInput.focus(), 100);
  }

  function closeTemplateModal() {
    templateModal.style.display = 'none';
  }

  // Wire up open/close
  if (templateBtn) {
    templateBtn.addEventListener('click', openTemplateModal);
  }
  if (mobileTemplateBtn) {
    mobileTemplateBtn.addEventListener('click', () => {
      M.closeMobileMenu();
      openTemplateModal();
    });
  }
  if (templateCloseBtn) {
    templateCloseBtn.addEventListener('click', closeTemplateModal);
  }

  // Close on overlay click
  if (templateModal) {
    templateModal.addEventListener('click', (e) => {
      if (e.target === templateModal) closeTemplateModal();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && templateModal && templateModal.style.display !== 'none') {
      closeTemplateModal();
    }
  });

  // Search input
  if (templateSearchInput) {
    templateSearchInput.addEventListener('input', filterTemplates);
  }

  // Category tabs
  if (templateCategories) {
    templateCategories.addEventListener('click', (e) => {
      const btn = e.target.closest('.template-cat-btn');
      if (!btn) return;

      activeTemplateCategory = btn.dataset.category;
      templateCategories.querySelectorAll('.template-cat-btn').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
      filterTemplates();
    });
  }


  // Expose for other modules
  M.openTemplateModal = openTemplateModal;
  M.closeTemplateModal = closeTemplateModal;
  M.getDefaultContent = function () { return MARKDOWN_TEMPLATES[0].content; };

})(window.MDView);
