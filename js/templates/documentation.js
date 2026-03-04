// ============================================
// templates/documentation.js — Documentation Templates
// ============================================
window.__MDV_TEMPLATES_DOCUMENTATION = [
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
];
