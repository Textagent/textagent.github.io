// ============================================
// help-mode.js — Interactive Help Mode
// Toggle ❓ to learn what every button does.
// ============================================
(function (M) {
    'use strict';

    // ── Help Data Registry ──
    // Maps CSS selectors → { name, desc, shortcut, demo }
    const HELP_DATA = {
        // ─── Header Toolbar ───
        '#new-document-btn, #qab-new': {
            name: 'New Document',
            desc: 'Start fresh — clears the editor for a brand new document.',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '#template-btn, #qab-template, #mobile-template-btn': {
            name: 'Templates',
            desc: 'Pick from ready-made templates — ' + M.PRODUCT.categoryList() + '. Jump-start any project in seconds.',
            shortcut: null,
            demo: 'assets/demos/03_templates_gallery.webp'
        },
        '#toggle-sync, #mobile-toggle-sync': {
            name: 'Sync Scrolling',
            desc: 'Keep editor and preview scrolling in lockstep so you always see what you\'re writing.',
            shortcut: 'Ctrl+Shift+S',
            demo: 'assets/demos/12_sync_scrolling.webp'
        },
        '#toc-toggle, #qab-toc': {
            name: 'Table of Contents',
            desc: 'Auto-generated heading sidebar — click any heading to jump straight to it.',
            shortcut: null,
            demo: 'assets/demos/13_table_of_contents.webp'
        },
        '#qab-more': {
            name: 'Upload / Import',
            desc: 'Drag-and-drop or browse files — supports MD, DOCX, XLSX, CSV, HTML, JSON, XML, and PDF. Converts everything to Markdown client-side.',
            shortcut: null,
            demo: 'assets/demos/08_import_export.webp'
        },
        '#exportDropdown': {
            name: 'Export',
            desc: 'Save your work as Markdown, self-contained HTML, smart PDF with page breaks, or LLM Memory format.',
            shortcut: null,
            demo: 'assets/demos/08_import_export.webp'
        },
        '#copy-markdown-button, #qab-copy, #mobile-copy-markdown': {
            name: 'Copy Markdown',
            desc: 'Copy the raw Markdown source to your clipboard — ready to paste anywhere.',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '#share-button, #qab-share, #mobile-share-button': {
            name: 'Encrypted Share',
            desc: 'Generate a zero-knowledge encrypted link (AES-256-GCM). Add a password for extra security, or email the link and .md file to yourself.',
            shortcut: null,
            demo: 'assets/demos/22_email_to_self.webp'
        },
        '#ai-toggle-button, #qab-ai, #mobile-ai-button': {
            name: 'AI Assistant',
            desc: 'Chat, summarize, expand, rephrase, fix grammar, or simplify text. Choose from Local Qwen, Gemini, Groq, or OpenRouter models.',
            shortcut: null,
            demo: 'assets/demos/02_ai_assistant.webp'
        },
        '#ai-model-select-btn, #qab-model': {
            name: 'AI Model Selector',
            desc: 'Switch AI models — Qwen 3.5 (100% private, runs locally), Gemini Flash, Groq Llama 70B, or OpenRouter auto-routing.',
            shortcut: null,
            demo: 'assets/demos/11_ai_model_selector.webp'
        },
        '#present-button, #qab-present': {
            name: 'Presentation Mode',
            desc: 'Turn Markdown into slides! Use --- as separators, navigate with arrow keys. 20+ themes, speaker notes, and overview grid included.',
            shortcut: null,
            demo: 'assets/demos/05_presentation_mode.webp'
        },
        '#word-wrap-toggle': {
            name: 'Word Wrap',
            desc: 'Toggle line wrapping — when off, long lines scroll horizontally instead.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '#focus-mode-toggle': {
            name: 'Focus Mode',
            desc: 'Dims everything except the paragraph you\'re writing — perfect for deep-focus sessions.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '#zen-mode-button': {
            name: 'Zen Mode',
            desc: 'Distraction-free fullscreen writing. Just you and your words — no toolbar, no preview.',
            shortcut: 'Ctrl+Shift+Z',
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '#speech-to-text-btn, #mobile-speech-btn': {
            name: 'Voice Dictation',
            desc: 'Write hands-free — dictate Markdown with voice commands like "new line", "bold", "heading". Multi-language supported.',
            shortcut: null,
            demo: 'assets/demos/14_voice_dictation.webp'
        },
        '#themePickerDropdown': {
            name: 'Preview Theme',
            desc: 'Choose from 6 preview themes — GitHub, GitLab, Notion, Dracula, Solarized, or Evergreen. Each supports light and dark variants.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '#theme-toggle, #mobile-theme-toggle': {
            name: 'Dark Mode',
            desc: 'Switch between light and dark mode. Your preference is remembered automatically.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '#stats-toggle': {
            name: 'Document Stats',
            desc: 'See reading time, word count, and character count at a glance.',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },

        // ─── Formatting Toolbar ───
        '[data-action="undo"]': {
            name: 'Undo',
            desc: 'Undo your last edit.',
            shortcut: 'Ctrl+Z',
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="redo"]': {
            name: 'Redo',
            desc: 'Redo the last undone edit.',
            shortcut: 'Ctrl+Y',
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="bold"]': {
            name: 'Bold',
            desc: 'Make selected text **bold**. Inserts a placeholder if nothing is selected.',
            shortcut: 'Ctrl+B',
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="italic"]': {
            name: 'Italic',
            desc: 'Make selected text *italic*.',
            shortcut: 'Ctrl+I',
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="strikethrough"]': {
            name: 'Strikethrough',
            desc: 'Apply ~~strikethrough~~ to selected text.',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="heading"]': {
            name: 'Heading',
            desc: 'Add a heading — click again to cycle through H1 → H2 → H3 levels.',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="link"]': {
            name: 'Link',
            desc: 'Insert [text](url). Selected text becomes the link text automatically.',
            shortcut: 'Ctrl+K',
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="image"]': {
            name: 'Image',
            desc: 'Insert ![alt](url) — or just paste an image from your clipboard.',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="code"]': {
            name: 'Inline Code',
            desc: 'Wrap text in `backticks` for inline code.',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="codeblock"]': {
            name: 'Code Block',
            desc: 'Insert a fenced code block with syntax highlighting. Run code live in 7 languages — Bash, Math, Python, HTML, React JSX, JS, and SQL.',
            shortcut: null,
            demo: 'assets/demos/04_code_execution.webp'
        },
        '[data-action="ul"]': {
            name: 'Bullet List',
            desc: 'Insert an unordered list item (- prefix).',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="ol"]': {
            name: 'Numbered List',
            desc: 'Insert an ordered list item (1. prefix).',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="tasklist"]': {
            name: 'Task List',
            desc: 'Add interactive checkboxes — - [ ] unchecked, - [x] checked. Clickable in the preview.',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="quote"]': {
            name: 'Blockquote',
            desc: 'Insert a > blockquote. Also supports GitHub alerts: [!NOTE], [!TIP], [!WARNING], [!IMPORTANT], [!CAUTION].',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="hr"]': {
            name: 'Horizontal Rule',
            desc: 'Insert --- as a divider. Also used as a slide separator in Presentation Mode.',
            shortcut: null,
            demo: 'assets/demos/05_presentation_mode.webp'
        },
        '[data-action="table"]': {
            name: 'Insert Table',
            desc: 'Add a Markdown table — rendered tables get spreadsheet tools: sort, filter, stats, charts, and inline editing.',
            shortcut: null,
            demo: 'assets/demos/06_table_tools.webp'
        },
        '[data-action="clear-all"]': {
            name: 'Clear All Text',
            desc: 'Erase all editor content (with confirmation). Undo with Ctrl+Z if needed.',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },
        '[data-action="clear-selection"]': {
            name: 'Clear Selected Text',
            desc: 'Delete only the selected text (with a preview prompt). Undo with Ctrl+Z.',
            shortcut: null,
            demo: 'assets/demos/10_formatting_toolbar.webp'
        },

        // ─── AI Tags ───
        '[data-action="ai-tag"]': {
            name: 'AI Generate Tag',
            desc: 'Add {{AI: prompt}} — click Fill and AI writes the content for you. Ideal for automating entire documents.',
            shortcut: null,
            demo: 'assets/demos/15_ai_doc_tags.webp',
            faq: [
                { q: 'Basic AI generation', code: '{{@AI:\n  @prompt: Write a summary of quantum computing\n}}' },
                { q: 'Store output in a variable', code: '{{@AI:\n  @var: story\n  @prompt: Create a short children\'s story\n}}' },
                { q: 'Pipe AI output → TTS', code: '{{@AI:\n  @var: story\n  @prompt: Create a story for children\n}}\n\n{{@TTS:\n  @model: kokoro-tts\n  @prompt: $(story)\n  @lang: English\n}}' },
                { q: 'Chain AI blocks with @input', code: '{{@AI:\n  @var: draft\n  @prompt: Write a blog post about AI\n}}\n\n{{@AI:\n  @input: draft\n  @prompt: Polish and improve this text:\n$(draft)\n}}' }
            ],
            templates: ['AI Business Proposal', 'AI Research Paper', 'AI SWOT Analysis', 'Blog Post (AI Fill)']
        },
        '[data-action="think-tag"]': {
            name: 'AI Think Tag',
            desc: 'Add {{AI: @think: Yes …}} — engages deep reasoning mode for step-by-step analysis.',
            shortcut: null,
            demo: 'assets/demos/15_ai_doc_tags.webp',
            faq: [
                { q: 'Deep reasoning with Think', code: '{{@AI:\n  @think: yes\n  @prompt: Analyze the pros and cons of\nremote work vs office work\n}}' },
                { q: 'Think + variable chaining', code: '{{@AI:\n  @var: analysis\n  @think: yes\n  @prompt: Perform a SWOT analysis\nfor a coffee shop business\n}}\n\n{{@AI:\n  @input: analysis\n  @prompt: Summarize the key takeaways:\n$(analysis)\n}}' }
            ],
            templates: ['AI Technical RFC', 'AI Stock Research Report', 'AI Investment Thesis']
        },
        '[data-action="image-tag"]': {
            name: 'AI Image Tag',
            desc: 'Add {{Image: description}} — generates images from text using Gemini Imagen.',
            shortcut: null,
            demo: 'assets/demos/15_ai_doc_tags.webp'
        },
        '[data-action="agent-tag"]': {
            name: 'Agent Flow Tag',
            desc: 'Build multi-step AI pipelines — each step\'s output feeds into the next. Pair with web search (DuckDuckGo, Brave, Tavily, etc.) for research workflows.',
            shortcut: null,
            demo: 'assets/demos/17_agent_flow.webp',
            faq: [
                { q: 'Multi-step pipeline', code: '{{@Agent:\n  @step 1: Research the history of AI\n  @step 2: Identify 5 key milestones\n  @step 3: Write a timeline summary\n}}' },
                { q: 'Agent + web search', code: '{{@Agent:\n  @search: duckduckgo\n  @var: research\n  @step 1: Search for latest AI news\n  @step 2: Summarize top 3 findings\n  @step 3: Write a brief newsletter\n}}' },
                { q: 'Agent to TTS audio report', code: '{{@Agent:\n  @var: report\n  @step 1: Analyze climate change data\n  @step 2: Create an executive summary\n}}\n\n{{@TTS:\n  @model: kokoro-tts\n  @prompt: $(report)\n  @lang: English\n}}' }
            ],
            templates: ['AI Global Briefing Generator', 'AI Research Agent']
        },
        '[data-action="api-get-tag"]': {
            name: 'API GET Tag',
            desc: 'Fetch data from any URL. Store the response in a variable with $(api_varName) for reuse.',
            shortcut: null,
            demo: 'assets/demos/24_api_linux_tags.png',
            faq: [
                { q: 'Fetch weather data', code: '{{@API:\n  Method: GET\n  URL: https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=139.76&current_weather=true\n  Variable: weather\n}}' },
                { q: 'API → AI analysis', code: '{{@API:\n  Method: GET\n  URL: https://api.example.com/data\n  Variable: api_data\n}}\n\n{{@AI:\n  @input: api_data\n  @prompt: Analyze this data:\n$(api_data)\n}}' }
            ]
        },
        '[data-action="api-post-tag"]': {
            name: 'API POST Tag',
            desc: 'Send POST requests with custom headers and JSON body. Store the response for downstream use.',
            shortcut: null,
            demo: 'assets/demos/24_api_linux_tags.png',
            faq: [
                { q: 'POST with JSON body', code: '{{@API:\n  Method: POST\n  URL: https://api.example.com/submit\n  Headers: Content-Type: application/json\n  Body: {"name": "TextAgent", "action": "test"}\n  Variable: response\n}}' }
            ]
        },
        '[data-action="memory-tag"]': {
            name: 'Memory Tag',
            desc: 'Index your workspace files with SQLite FTS5 full-text search. AI tags can auto-retrieve relevant context via the @use: field.',
            shortcut: null,
            demo: 'assets/demos/20_context_memory.webp',
            faq: [
                { q: 'Index workspace files', code: '{{@Memory: Index all workspace files}}' },
                { q: 'AI with memory context', code: '{{@AI:\n  @use: memory\n  @prompt: Based on my project files,\nwrite a README for this project\n}}' }
            ]
        },
        '[data-action="ocr-tag"]': {
            name: 'OCR Scan Tag',
            desc: 'Extract text from images as Markdown, or convert diagrams to SVG. Upload an image, choose mode, and hit ▶.',
            shortcut: null,
            demo: 'assets/demos/15_ai_doc_tags.webp',
            faq: [
                { q: 'OCR → AI analysis', code: '{{@OCR:\n  @var: scanned_text\n  @prompt: Upload an image to extract text\n}}\n\n{{@AI:\n  @input: scanned_text\n  @prompt: Summarize this document:\n$(scanned_text)\n}}' }
            ]
        },
        '[data-action="linux-tag"]': {
            name: 'Linux Terminal',
            desc: 'Launch a full Debian VM in-browser (WebVM), or compile & run C++, Rust, Go, Java and 25+ languages via Judge0 CE.',
            shortcut: null,
            demo: 'assets/demos/24_api_linux_tags.png'
        },
        '[data-action="linux-cpp-tag"]': {
            name: 'C++ Compile & Run',
            desc: 'Compile and run C++ code via Judge0 CE — see output, execution time, and memory stats inline.',
            shortcut: null,
            demo: 'assets/demos/18_compile_run.webp'
        },
        '[data-action="linux-rust-tag"]': {
            name: 'Rust Compile & Run',
            desc: 'Compile and run Rust code via Judge0 CE with inline output.',
            shortcut: null,
            demo: 'assets/demos/18_compile_run.webp'
        },
        '[data-action="linux-go-tag"]': {
            name: 'Go Compile & Run',
            desc: 'Compile and run Go code via Judge0 CE with inline output.',
            shortcut: null,
            demo: 'assets/demos/18_compile_run.webp'
        },
        '[data-action="linux-java-tag"]': {
            name: 'Java Compile & Run',
            desc: 'Compile and run Java code via Judge0 CE with inline output.',
            shortcut: null,
            demo: 'assets/demos/18_compile_run.webp'
        },
        // ─── Coding Blocks ───
        '[data-action="coding-bash"]': {
            name: 'Bash Code Block',
            desc: 'Run Bash scripts right in the browser via just-bash — no server needed.',
            shortcut: null,
            demo: 'assets/demos/04_code_execution.webp'
        },
        '[data-action="coding-math"]': {
            name: 'Math Code Block',
            desc: 'Evaluate math expressions — algebra, calculus, and trigonometry powered by Nerdamer.',
            shortcut: null,
            demo: 'assets/demos/04_code_execution.webp'
        },
        '[data-action="coding-python"]': {
            name: 'Python Code Block',
            desc: 'Run Python in-browser via Pyodide (CPython in WASM). Full stdout/stderr capture and matplotlib charting.',
            shortcut: null,
            demo: 'assets/demos/04_code_execution.webp'
        },
        '[data-action="coding-html"]': {
            name: 'HTML Code Block',
            desc: 'Live HTML/CSS/JS preview in a sandboxed iframe. Use html-autorun to show only the rendered output.',
            shortcut: null,
            demo: 'assets/demos/04_code_execution.webp'
        },
        '[data-action="coding-js"]': {
            name: 'JavaScript Code Block',
            desc: 'Execute JS in a sandboxed iframe — captures console.log, warn, and error output inline.',
            shortcut: null,
            demo: 'assets/demos/04_code_execution.webp'
        },
        '[data-action="coding-sql"]': {
            name: 'SQL Code Block',
            desc: 'Query an in-memory SQLite database (sql.js WASM). Tables persist across blocks with formatted output.',
            shortcut: null,
            demo: 'assets/demos/04_code_execution.webp'
        },
        '[data-action="coding-jsx"]': {
            name: 'React JSX Live Block',
            desc: 'Write interactive React components with live preview. Auto-detects and loads Recharts, Tailwind CSS, Lucide icons, Framer Motion, and 10+ libraries from CDN. Uses Babel for in-browser JSX transpilation.',
            shortcut: null,
            demo: 'assets/demos/04_code_execution.webp',
            faq: [
                { q: 'Simple counter component', code: '```jsx-autorun\nimport { useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return <div style={{padding:24}}>\n    <h2>Count: {count}</h2>\n    <button onClick={() => setCount(c=>c+1)}>+1</button>\n  </div>;\n}\n```' },
                { q: 'Chart with Recharts', code: '```jsx-autorun\nimport { LineChart, Line, XAxis, YAxis } from "recharts";\nconst data = [{x:"Jan",v:10},{x:"Feb",v:25},{x:"Mar",v:18}];\nfunction App() {\n  return <LineChart width={400} height={250} data={data}>\n    <XAxis dataKey="x"/><Line dataKey="v"/>\n  </LineChart>;\n}\n```' },
                { q: 'Styled with Tailwind CSS', code: '```jsx-autorun\nfunction App() {\n  return <div className="flex flex-col items-center gap-4 p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl">\n    <h1 className="text-3xl font-bold">Tailwind + React</h1>\n    <p className="opacity-80">Auto-detected from className patterns</p>\n  </div>;\n}\n```' }
            ]
        },
        '#docgen-fill-btn': {
            name: 'Fill All AI Blocks',
            desc: 'Process every {{AI:}}, {{Image:}}, {{Agent:}}, and {{API:}} tag at once. Accept, reject, or regenerate each result.',
            shortcut: null,
            demo: 'assets/demos/15_ai_doc_tags.webp',
            faq: [
                { q: 'Fill sequential blocks', code: '{{@AI:\n  @var: outline\n  @prompt: Create an outline for a blog\n}}\n\n{{@AI:\n  @input: outline\n  @prompt: Write the full blog:\n$(outline)\n}}\n\nClick ✨ Fill to run all blocks in order.' }
            ]
        },
        '#apply-vars-btn': {
            name: 'Template Variables',
            desc: 'Replace all $(varName) placeholders. Auto-detects variables and creates a fill-in table if none exists.',
            shortcut: null,
            demo: 'assets/demos/16_template_variables.webp',
            faq: [
                { q: 'Define and use variables', code: '<!-- @variables -->\n| Variable | Value |\n|----------|-------|\n| name     | Alice |\n| topic    | AI    |\n<!-- @/variables -->\n\n# Report for $(name)\nTopic: $(topic)' },
                { q: '@var stores AI output', code: '{{@AI:\n  @var: result\n  @prompt: Generate a greeting\n}}\n\nThe AI said: $(result)' }
            ],
            templates: ['AI Global Briefing Generator', 'AI Language Tutor', 'Stock Watchlist']
        },

        // ─── Workspace ───
        '#qab-files': {
            name: 'File Tree',
            desc: 'Manage your workspace — create, rename, duplicate, or delete files. Supports browser storage and native disk via File System Access API.',
            shortcut: 'Ctrl+B',
            demo: 'assets/demos/19_workspace_sidebar.webp'
        },

        // ─── View Mode Buttons ───
        '[data-mode="editor"]': {
            name: 'Editor Only',
            desc: 'Full-width editor — maximum space for writing.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '[data-mode="split"]': {
            name: 'Split View',
            desc: 'Editor and preview side by side. Drag the divider to resize.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '[data-mode="preview"]': {
            name: 'Preview Only',
            desc: 'Full-width rendered preview — ideal for reading and reviewing.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '[data-mode="ppt"]': {
            name: 'Presentation View',
            desc: 'Slideshow mode — each --- separator creates a slide. Navigate with arrow keys.',
            shortcut: null,
            demo: 'assets/demos/05_presentation_mode.webp'
        },
        '[data-mode="page"]': {
            name: 'Page View (A4)',
            desc: 'Paginated A4 layout with headers, footers, and page numbers. Print-ready preview that exports beautifully to PDF.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },

        // ─── Draw, Git & Tools Tags ───
        '[data-action="draw-tag"]': {
            name: 'Draw / Whiteboard',
            desc: 'Embed an Excalidraw whiteboard or Mermaid diagram. Freehand draw, add shapes, text, and use AI-assisted diagramming.',
            shortcut: null,
            demo: 'assets/demos/30_draw_excalidraw.webp',
            faq: [
                { q: 'Embed a whiteboard', code: '{{@Draw: Open a blank Excalidraw canvas}}' },
                { q: 'AI-generated Mermaid diagram', code: '{{@Draw:\n  @prompt: Create a flowchart showing\n  user login → auth check →\n  dashboard or error page\n}}' }
            ]
        },
        '[data-action="git-tag"]': {
            name: 'GitHub Analysis',
            desc: 'Analyze any GitHub repo — pulls metadata, README, file tree, and generates a structured summary.',
            shortcut: null,
            demo: 'assets/demos/24_api_linux_tags.png',
            faq: [
                { q: 'Analyze a GitHub repo', code: '{{@Git: https://github.com/facebook/react}}' }
            ]
        },
        '[data-action="tools-scrape-tag"]': {
            name: 'Web Scrape',
            desc: 'Extract content from any URL and convert it to clean, readable Markdown.',
            shortcut: null,
            demo: 'assets/demos/24_api_linux_tags.png',
            faq: [
                { q: 'Scrape URL → AI summary', code: '{{@Scrape:\n  @var: page_content\n  @url: https://example.com/article\n}}\n\n{{@AI:\n  @input: page_content\n  @prompt: Summarize this article:\n$(page_content)\n}}' }
            ]
        },
        '[data-action="tools-search-tag"]': {
            name: 'Web Search',
            desc: 'Run a web search query — results come back as Markdown with titles, snippets, and links.',
            shortcut: null,
            demo: 'assets/demos/24_api_linux_tags.png',
            faq: [
                { q: 'Search → AI analysis', code: '{{@Search:\n  @var: results\n  @query: latest AI breakthroughs 2025\n}}\n\n{{@AI:\n  @input: results\n  @prompt: Analyze these search results\nand write a summary:\n$(results)\n}}' }
            ]
        },

        // ─── Additional AI Tags ───
        '[data-action="translate-tag"]': {
            name: 'Translate',
            desc: 'Translate text between languages with optional audio output.',
            shortcut: null,
            demo: 'assets/demos/15_ai_doc_tags.webp',
            faq: [
                { q: 'Translate to Japanese', code: '{{@Translate:\n  @lang: Japanese\n  @prompt: Hello, how are you?\nWhere is the train station?\n}}' },
                { q: 'AI → Translate → TTS chain', code: '{{@AI:\n  @var: phrases\n  @prompt: Generate 5 essential travel\nphrases for visiting France\n}}\n\n{{@Translate:\n  @input: phrases\n  @var: french\n  @lang: French\n  @prompt: $(phrases)\n}}\n\n{{@TTS:\n  @model: kokoro-tts\n  @input: french\n  @lang: French\n  @prompt: $(french)\n}}' }
            ],
            templates: ['AI Language Tutor', 'AI Global Briefing Generator']
        },
        '[data-action="tts-tag"]': {
            name: 'Text-to-Speech',
            desc: 'Convert text to natural speech using the Kokoro TTS engine. Generates an inline audio player.',
            shortcut: null,
            demo: 'assets/demos/28_text_to_speech.webp',
            faq: [
                { q: 'Basic text-to-speech', code: '{{@TTS:\n  @model: kokoro-tts\n  @prompt: Hello, welcome to TextAgent!\n  @lang: English\n}}' },
                { q: 'Speak AI-generated story', code: '{{@AI:\n  @var: story\n  @prompt: Create a story for children\n}}\n\n{{@TTS:\n  @model: kokoro-tts\n  @prompt: $(story)\n  @lang: English\n}}' },
                { q: 'Using @input dependency', code: '{{@AI:\n  @var: story\n  @prompt: Create a story for children\n}}\n\n{{@TTS:\n  @model: kokoro-tts\n  @input: story\n  @prompt: $(story)\n  @lang: English\n}}' }
            ],
            templates: ['AI Language Tutor', 'AI Global Briefing Generator']
        },
        '[data-action="stt-tag"]': {
            name: 'Speech-to-Text',
            desc: 'Upload audio and get a text transcription — great for meeting notes and interviews.',
            shortcut: null,
            demo: 'assets/demos/14_voice_dictation.webp',
            faq: [
                { q: 'Transcribe audio → AI summary', code: '{{@STT:\n  @var: transcript\n  @prompt: Upload an audio file to transcribe\n}}\n\n{{@AI:\n  @input: transcript\n  @prompt: Summarize these meeting notes:\n$(transcript)\n}}' }
            ]
        },
        '[data-action="game-tag"]': {
            name: 'Game Builder',
            desc: 'Generate interactive games with AI — supports Three.js, Canvas, and P5.js. Pick a preset or describe your own game.',
            shortcut: null,
            demo: 'assets/demos/26_game_builder.webp',
            faq: [
                { q: 'Instant preset game', code: '{{@Game: @preset: pong}}' },
                { q: 'Custom AI game', code: '{{@Game:\n  Create a space invaders game with\n  neon colors and particle effects\n}}' }
            ],
            templates: ['Platform Skills Reference']
        },
        '[data-action="podcast-tag"]': {
            name: 'Podcast Generator',
            desc: 'Generate AI-powered podcasts from any topic — researches via web search, writes a multi-speaker script, and synthesizes audio with Kokoro TTS. Supports 1-4 speakers with distinct voices.',
            shortcut: null,
            demo: null,
            faq: [
                { q: 'Quick podcast on a topic', code: '{{@Podcast: @topic: The future of AI agents}}' },
                { q: 'Debate with 2 speakers', code: '{{@Podcast:\n  @topic: Should AI replace human teachers?\n  @speakers: 2\n  @style: debate\n  @search: yes\n}}' },
                { q: 'Single speaker lecture', code: '{{@Podcast:\n  @topic: Introduction to quantum computing\n  @speakers: 1\n  @style: lecture\n}}' }
            ]
        },
        '[data-action="form-tag"]': {
            name: 'Interactive Form',
            desc: 'Build forms in Markdown with {{Form:}} — 14 field types including text, email, select, stars, NPS, slider, and yes/no. Share with dual links: a respondent fill link and a creator-only response viewer. All responses are AES-256-GCM encrypted.',
            shortcut: null,
            demo: 'assets/demos/32_form_sharing.webp',
            faq: [
                { q: 'Contact form', code: '{{@Form: Contact Us\n  @field: Name | text | required\n  @field: Email | email | required\n  @field: Message | textarea | required\n  @field: Rating | stars\n}}' }
            ],
            templates: ['Contact Form', 'Survey Form', 'RSVP Form', 'Feedback Form']
        },

        // ─── Media Embedding ───
        '[data-action="media-video"]': {
            name: 'Video Player',
            desc: 'Embed MP4, WebM, or other HTML5 video with full playback controls.',
            shortcut: null,
            demo: 'assets/demos/31_media_embedding.webp'
        },
        '[data-action="media-embed-grid"]': {
            name: 'Embed Grid',
            desc: 'Display multiple videos, iframes, or media items in a responsive grid layout.',
            shortcut: null,
            demo: 'assets/demos/31_media_embedding.webp'
        },
        '[data-action="media-youtube"]': {
            name: 'YouTube Video',
            desc: 'Paste a YouTube URL to embed the video with an inline player.',
            shortcut: null,
            demo: 'assets/demos/31_media_embedding.webp'
        },
        '[data-action="rec-studio"]': {
            name: 'Recording Studio',
            desc: 'Record your screen, camera, or whiteboard directly in the browser. Supports PiP, pause/resume, device selection, countdown, and local download — fully client-side, no backend needed.',
            shortcut: null,
            demo: null
        },

        // ─── Additional Coding & Execution ───
        '[data-action="coding-latex"]': {
            name: 'LaTeX Block',
            desc: 'Render beautiful math equations and formulas with KaTeX — fast, high-quality typesetting.',
            shortcut: null,
            demo: 'assets/demos/04_code_execution.webp'
        },
        '#run-all-btn': {
            name: 'Run All',
            desc: 'Execute every code block in document order — Bash, Python, JS, React JSX, SQL, Math, HTML, and compiled languages. Notebook-style inline results.',
            shortcut: null,
            demo: 'assets/demos/25_run_all.png',
            faq: [
                { q: 'Capture code output in variable', code: '```javascript @var: result\nconsole.log("Hello from JS!");\n```\n\nUse $(result) in subsequent blocks.' },
                { q: 'Full pipeline: Vars → AI → TTS', code: 'Click ⚡ Vars to apply variables,\nthen ⚡ Run All to execute:\n\n1. AI blocks generate content\n2. Variables store outputs via @var\n3. TTS blocks speak $(varName) aloud\n4. All blocks run in document order' }
            ]
        },

        // ─── Additional Header & QAB Buttons ───
        '#workspace-toggle': {
            name: 'File Tree',
            desc: 'Manage your workspace — create, rename, duplicate, or delete files. Supports browser storage and native disk via File System Access API.',
            shortcut: 'Ctrl+B',
            demo: 'assets/demos/19_workspace_sidebar.webp'
        },
        '#qab-agents': {
            name: 'Agent Containers',
            desc: 'Run autonomous AI agents — each container has its own context, model selection, and execution flow.',
            shortcut: null,
            demo: 'assets/demos/17_agent_flow.webp'
        },
        '#qab-search': {
            name: 'Find & Replace',
            desc: 'Search with plain text or regex, navigate matches, and replace one or all occurrences.',
            shortcut: 'Ctrl+F',
            demo: 'assets/demos/10_formatting_toolbar.webp'
        }
    };

    // ── State ──
    let helpModeActive = false;
    let currentPopover = null;
    let demoPanel = null;
    let helpBtn = null;

    // ── Find help data for a button ──
    function findHelpForElement(el) {
        for (const [selectorGroup, data] of Object.entries(HELP_DATA)) {
            const selectors = selectorGroup.split(',').map(s => s.trim());
            for (const sel of selectors) {
                if (el.matches(sel) || el.closest(sel)) {
                    return data;
                }
            }
        }
        return null;
    }

    // ── Toggle Help Mode ──
    function toggleHelpMode() {
        helpModeActive = !helpModeActive;
        document.body.classList.toggle('help-mode-active', helpModeActive);
        if (helpBtn) helpBtn.classList.toggle('help-toggle-on', helpModeActive);
        if (!helpModeActive) {
            hideHelpPopover();
            hideDemoPanel();
        }
    }

    // ── Hide Popover ──
    function hideHelpPopover() {
        if (currentPopover) {
            currentPopover.classList.remove('visible');
            setTimeout(() => {
                if (currentPopover && !currentPopover.classList.contains('visible')) {
                    currentPopover.remove();
                    currentPopover = null;
                }
            }, 200);
        }
    }

    // ── Hide Demo Panel ──
    function hideDemoPanel() {
        if (demoPanel) {
            demoPanel.classList.remove('visible');
            setTimeout(() => {
                if (demoPanel && !demoPanel.classList.contains('visible')) {
                    demoPanel.remove();
                    demoPanel = null;
                }
            }, 300);
        }
    }

    // ── Show Demo Panel (50% screen, expandable to fullscreen) ──
    function showDemoPanel(demoSrc, title) {
        hideDemoPanel();

        const panel = document.createElement('div');
        panel.className = 'help-demo-panel';
        panel.innerHTML = `
            <div class="help-demo-panel-header">
                <span class="help-demo-panel-title">${title}</span>
                <div class="help-demo-panel-controls">
                    <button class="help-demo-panel-expand" title="Toggle fullscreen"><i class="bi bi-arrows-fullscreen"></i></button>
                    <button class="help-demo-panel-close" title="Close demo"><i class="bi bi-x-lg"></i></button>
                </div>
            </div>
            <div class="help-demo-panel-body">
                <img src="${demoSrc}" alt="${title}" />
            </div>
        `;

        document.body.appendChild(panel);
        demoPanel = panel;

        // Animate in
        requestAnimationFrame(() => panel.classList.add('visible'));

        // Close
        panel.querySelector('.help-demo-panel-close').addEventListener('click', hideDemoPanel);

        // Fullscreen toggle
        panel.querySelector('.help-demo-panel-expand').addEventListener('click', () => {
            panel.classList.toggle('fullscreen');
            const icon = panel.querySelector('.help-demo-panel-expand i');
            if (panel.classList.contains('fullscreen')) {
                icon.className = 'bi bi-fullscreen-exit';
            } else {
                icon.className = 'bi bi-arrows-fullscreen';
            }
        });

        // Esc closes
        const escHandler = (e) => {
            if (e.key === 'Escape' && demoPanel) {
                if (demoPanel.classList.contains('fullscreen')) {
                    demoPanel.classList.remove('fullscreen');
                    const icon = demoPanel.querySelector('.help-demo-panel-expand i');
                    if (icon) icon.className = 'bi bi-arrows-fullscreen';
                } else {
                    hideDemoPanel();
                    document.removeEventListener('keydown', escHandler);
                }
                e.stopPropagation();
            }
        };
        document.addEventListener('keydown', escHandler, true);
    }

    // ── Escape HTML for safe display ──
    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ── Build FAQ HTML (examples only) ──
    function buildFaqHtml(faqItems) {
        if (!faqItems || !faqItems.length) return '';
        let items = '';
        faqItems.forEach((item, i) => {
            items += `
                <div class="help-faq-item">
                    <div class="help-faq-label">${i + 1}. ${escapeHtml(item.q)}</div>
                    <div class="help-faq-code-wrap">
                        <pre class="help-faq-code">${escapeHtml(item.code)}</pre>
                        <button class="help-faq-copy" title="Copy to clipboard" data-faq-idx="${i}"><i class="bi bi-clipboard"></i></button>
                    </div>
                </div>`;
        });
        return `
            <div class="help-popover-faq">
                <button class="help-faq-toggle">
                    <i class="bi bi-book"></i> Examples
                    <i class="bi bi-chevron-down help-faq-chevron"></i>
                </button>
                <div class="help-faq-content">${items}</div>
            </div>`;
    }

    // ── Build Templates HTML (separate section) ──
    function buildTemplatesHtml(templateNames) {
        if (!templateNames || !templateNames.length) return '';
        const chips = templateNames.map(name =>
            `<button class="help-template-chip" data-template-name="${escapeHtml(name)}" title="Open ${escapeHtml(name)} template"><i class="bi bi-file-earmark-text"></i> ${escapeHtml(name)}</button>`
        ).join('');
        return `
            <div class="help-popover-templates">
                <button class="help-templates-toggle">
                    <i class="bi bi-grid"></i> Templates
                    <i class="bi bi-chevron-down help-faq-chevron"></i>
                </button>
                <div class="help-templates-content">
                    <div class="help-template-chips">${chips}</div>
                </div>
            </div>`;
    }

    // ── Show Help Popover ──
    function showHelpPopover(anchorEl, data) {
        hideHelpPopover();

        const popover = document.createElement('div');
        popover.className = 'help-popover';

        // Demo: show a "▶ Watch Demo" button instead of inline video
        let demoButtonHtml = '';
        if (data.demo) {
            demoButtonHtml = `<button class="help-popover-watch-demo"><i class="bi bi-play-circle-fill"></i> Watch Demo</button>`;
        }

        let shortcutHtml = '';
        if (data.shortcut) {
            const keys = data.shortcut.split('+').map(k => `<kbd>${k}</kbd>`).join(' + ');
            shortcutHtml = `<div class="help-popover-shortcut">${keys}</div>`;
        }

        // FAQ section (examples)
        const faqHtml = buildFaqHtml(data.faq);
        // Templates section (separate)
        const templatesHtml = buildTemplatesHtml(data.templates);

        popover.innerHTML = `
            <div class="help-popover-header">
                <span class="help-popover-title">${data.name}</span>
                <button class="help-popover-close" title="Close"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="help-popover-body">
                <p class="help-popover-desc">${data.desc}</p>
                ${shortcutHtml}
                ${demoButtonHtml}
                ${faqHtml}
                ${templatesHtml}
            </div>
            <div class="help-popover-footer">
                <button class="help-popover-try">Try it →</button>
                <button class="help-popover-dismiss">Close</button>
            </div>
        `;

        document.body.appendChild(popover);
        currentPopover = popover;

        // Position popover near the anchor
        positionPopover(popover, anchorEl);

        // Animate in
        requestAnimationFrame(() => popover.classList.add('visible'));

        // Close button
        popover.querySelector('.help-popover-close').addEventListener('click', hideHelpPopover);
        popover.querySelector('.help-popover-dismiss').addEventListener('click', hideHelpPopover);

        // "Watch Demo" button opens the 50% demo panel
        const watchBtn = popover.querySelector('.help-popover-watch-demo');
        if (watchBtn) {
            watchBtn.addEventListener('click', () => {
                showDemoPanel(data.demo, data.name);
            });
        }

        // FAQ toggle (expand/collapse)
        const faqToggle = popover.querySelector('.help-faq-toggle');
        if (faqToggle) {
            faqToggle.addEventListener('click', () => {
                const faqSection = popover.querySelector('.help-popover-faq');
                faqSection.classList.toggle('expanded');
                setTimeout(() => positionPopover(popover, anchorEl), 50);
            });
        }

        // Templates toggle (expand/collapse) — independent from FAQ
        const templatesToggle = popover.querySelector('.help-templates-toggle');
        if (templatesToggle) {
            templatesToggle.addEventListener('click', () => {
                const tplSection = popover.querySelector('.help-popover-templates');
                tplSection.classList.toggle('expanded');
                setTimeout(() => positionPopover(popover, anchorEl), 50);
            });
        }

        // FAQ copy buttons
        popover.querySelectorAll('.help-faq-copy').forEach((btn) => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-faq-idx'), 10);
                const code = data.faq[idx].code;
                navigator.clipboard.writeText(code).then(() => {
                    btn.innerHTML = '<i class="bi bi-check2"></i>';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.innerHTML = '<i class="bi bi-clipboard"></i>';
                        btn.classList.remove('copied');
                    }, 1500);
                });
            });
        });

        // Template chip clicks — find template by name and load it
        popover.querySelectorAll('.help-template-chip').forEach((chip) => {
            chip.addEventListener('click', () => {
                const name = chip.getAttribute('data-template-name');
                const M = window.MDView;
                if (!M || !M.MARKDOWN_TEMPLATES || !M.selectTemplate) return;
                const tpl = M.MARKDOWN_TEMPLATES.find(t => t.name === name);
                if (!tpl) return;
                hideDemoPanel();
                hideHelpPopover();
                if (helpModeActive) toggleHelpMode();
                setTimeout(() => M.selectTemplate(tpl), 100);
            });
        });

        // "Try it →" — exit help mode and trigger the button
        popover.querySelector('.help-popover-try').addEventListener('click', () => {
            hideDemoPanel();
            hideHelpPopover();
            toggleHelpMode(); // exit help mode
            // Small delay so help mode CSS clears before action fires
            setTimeout(() => anchorEl.click(), 100);
        });
    }

    // ── Position popover relative to anchor ──
    function positionPopover(popover, anchor) {
        const rect = anchor.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Default: below the button, horizontally centered
        let top = rect.bottom + 8;
        let left = rect.left + rect.width / 2;

        // Temporarily make visible to measure
        popover.style.visibility = 'hidden';
        popover.style.display = 'block';
        const pw = popover.offsetWidth;
        const ph = popover.offsetHeight;

        // Horizontally center, but keep within viewport
        left = left - pw / 2;
        left = Math.max(8, Math.min(left, vw - pw - 8));

        // If not enough space below, position above
        if (top + ph > vh - 8) {
            top = rect.top - ph - 8;
        }
        // If still offscreen (above), clamp
        if (top < 8) top = 8;

        popover.style.top = top + 'px';
        popover.style.left = left + 'px';
        popover.style.visibility = '';
    }

    // ── Intercept clicks in help mode ──
    function interceptClick(e) {
        if (!helpModeActive) return;

        // Don't intercept clicks on the help button itself, popover elements, demo panel, or demo modal
        if (e.target.closest('#help-mode-btn') ||
            e.target.closest('.help-popover') ||
            e.target.closest('.help-demo-panel') ||
            e.target.closest('.demo-modal-overlay')) return;

        // Find the closest button ancestor
        const btn = e.target.closest('button, .tool-button, .fmt-btn, .qab-btn, .view-mode-btn, .mobile-menu-item, .mobile-view-mode-btn, .qab-view-btn, .dropdown-toggle');
        if (!btn) {
            // Clicked non-button area — just dismiss popover
            hideHelpPopover();
            return;
        }

        const data = findHelpForElement(btn);
        if (data) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            showHelpPopover(btn, data);
        }
    }

    // ── Init ──
    function init() {
        helpBtn = document.getElementById('help-mode-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleHelpMode();
            });
        }

        // Intercept all clicks during help mode (capture phase to run before other handlers)
        document.addEventListener('click', interceptClick, true);

        // Esc key exits help mode
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && helpModeActive) {
                if (demoPanel) return; // let demo panel handle its own Esc
                if (currentPopover) {
                    hideHelpPopover();
                } else {
                    toggleHelpMode();
                }
            }
        });
    }

    // Run init after DOM is ready (module executes after DOM via Vite dynamic import)
    init();

    // Expose for other modules
    M.toggleHelpMode = toggleHelpMode;

})(window.MDView);
