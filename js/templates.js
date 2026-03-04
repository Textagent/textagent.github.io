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
        '| **Code** | ▶ Executable Bash blocks (just-bash) · ▶ Executable Math blocks (math.js) |\n' +
        '| **Import** | MD · DOCX · XLSX · CSV · HTML · JSON · XML · PDF |\n' +
        '| **Export** | Markdown · HTML · PDF · LLM Memory Format |\n' +
        '| **Sharing** | ☁️ End-to-end encrypted cloud sharing via Firebase |\n' +
        '| **Extras** | Presentation Mode (PPT) · Preview Themes · Dark Mode · Templates (19+) |\n\n' +
        '---\n\n' +
        '## 💻 Code with Syntax Highlighting\n\n' +
        'Supports **180+ languages** via highlight.js. Every code block gets a copy button:\n\n' +
        '```javascript\n' +
        '// JavaScript — Live preview rendering\n' +
        'function renderMarkdown() {\n' +
        '  const html = marked.parse(editor.value);\n' +
        '  preview.innerHTML = DOMPurify.sanitize(html);\n' +
        '  hljs.highlightAll();\n' +
        '}\n' +
        '```\n\n' +
        '```python\n' +
        '# Python — Data processing\n' +
        'import pandas as pd\n\n' +
        'df = pd.read_csv("data.csv")\n' +
        'summary = df.describe()\n' +
        'print(summary.to_markdown())\n' +
        '```\n\n' +
        '```sql\n' +
        '-- SQL — Query example\n' +
        'SELECT users.name, COUNT(orders.id) AS total_orders\n' +
        'FROM users\n' +
        'LEFT JOIN orders ON users.id = orders.user_id\n' +
        'GROUP BY users.name\n' +
        'ORDER BY total_orders DESC;\n' +
        '```\n\n' +
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
    }
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
