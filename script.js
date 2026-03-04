document.addEventListener("DOMContentLoaded", function () {
  let markdownRenderTimeout = null;
  const RENDER_DELAY = 100;
  let syncScrollingEnabled = true;
  let isEditorScrolling = false;
  let isPreviewScrolling = false;
  let scrollSyncTimeout = null;
  const SCROLL_SYNC_DELAY = 10;

  // View Mode State - Story 1.1
  let currentViewMode = 'split'; // 'editor', 'split', or 'preview'

  const markdownEditor = document.getElementById("markdown-editor");
  const markdownPreview = document.getElementById("markdown-preview");
  const themeToggle = document.getElementById("theme-toggle");
  const importButton = document.getElementById("import-button");
  const fileInput = document.getElementById("file-input");
  const exportMd = document.getElementById("export-md");
  const exportHtml = document.getElementById("export-html");
  const exportPdf = document.getElementById("export-pdf");
  const copyMarkdownButton = document.getElementById("copy-markdown-button");
  const dropzone = document.getElementById("dropzone");
  const closeDropzoneBtn = document.getElementById("close-dropzone");
  const toggleSyncButton = document.getElementById("toggle-sync");
  const editorPane = markdownEditor; // same element, alias for scroll sync
  const previewPane = document.querySelector(".preview-pane");
  const readingTimeElement = document.getElementById("reading-time");
  const wordCountElement = document.getElementById("word-count");
  const charCountElement = document.getElementById("char-count");

  // View Mode Elements - Story 1.1
  const contentContainer = document.querySelector(".content-container");
  const viewModeButtons = document.querySelectorAll(".view-mode-btn");

  // Mobile View Mode Elements - Story 1.4
  const mobileViewModeButtons = document.querySelectorAll(".mobile-view-mode-btn");

  // Resize Divider Elements - Story 1.3
  const resizeDivider = document.querySelector(".resize-divider");
  const editorPaneElement = document.querySelector(".editor-pane");
  const previewPaneElement = document.querySelector(".preview-pane");
  let isResizing = false;
  let editorWidthPercent = 50; // Default 50%
  const MIN_PANE_PERCENT = 20; // Minimum 20% width

  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenuPanel = document.getElementById("mobile-menu-panel");
  const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
  const mobileCloseMenu = document.getElementById("close-mobile-menu");
  const mobileReadingTime = document.getElementById("mobile-reading-time");
  const mobileWordCount = document.getElementById("mobile-word-count");
  const mobileCharCount = document.getElementById("mobile-char-count");
  const mobileToggleSync = document.getElementById("mobile-toggle-sync");
  const mobileImportBtn = document.getElementById("mobile-import-button");
  const mobileExportMd = document.getElementById("mobile-export-md");
  const mobileExportHtml = document.getElementById("mobile-export-html");
  const mobileExportPdf = document.getElementById("mobile-export-pdf");
  const mobileCopyMarkdown = document.getElementById("mobile-copy-markdown");
  const mobileThemeToggle = document.getElementById("mobile-theme-toggle");

  // Check saved theme preference, then fall back to OS preference
  const savedTheme = localStorage.getItem('markdown-viewer-theme');
  const prefersDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (prefersDarkMode ? "dark" : "light");

  document.documentElement.setAttribute("data-theme", initialTheme);

  themeToggle.innerHTML = initialTheme === "dark"
    ? '<i class="bi bi-sun"></i>'
    : '<i class="bi bi-moon"></i>';

  const initMermaid = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const mermaidTheme = currentTheme === "dark" ? "dark" : "default";

    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      securityLevel: 'strict',
      flowchart: { useMaxWidth: true, htmlLabels: true },
      fontSize: 16
    });
  };

  try {
    initMermaid();
  } catch (e) {
    console.warn("Mermaid initialization failed:", e);
  }

  const markedOptions = {
    gfm: true,
    breaks: false,
    pedantic: false,
    smartypants: false,
    xhtml: false,
    headerIds: true,
    mangle: false,
  };

  const renderer = new marked.Renderer();
  renderer.code = function (code, language) {
    if (language === 'mermaid') {
      const uniqueId = 'mermaid-diagram-' + Math.random().toString(36).substr(2, 9);
      return `<div class="mermaid-container"><div class="mermaid" id="${uniqueId}">${code}</div></div>`;
    }

    // Detect executable bash/sh/shell code blocks
    const isExecutable = ['bash', 'sh', 'shell'].includes((language || '').toLowerCase());
    const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
    const highlightedCode = hljs.highlight(code, {
      language: isExecutable ? 'bash' : validLanguage,
    }).value;

    if (isExecutable) {
      return `<div class="executable-code-container" data-lang="${language}"><pre><code class="hljs bash">${highlightedCode}</code></pre></div>`;
    }
    return `<pre><code class="hljs ${validLanguage}">${highlightedCode}</code></pre>`;
  };

  marked.setOptions({
    ...markedOptions,
    renderer: renderer,
    highlight: function (code, language) {
      if (language === 'mermaid') return code;
      const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
      return hljs.highlight(code, { language: validLanguage }).value;
    },
  });

  const sampleMarkdown = `# Welcome to Markdown Viewer

## ✨ Key Features
- **Live Preview** with GitHub styling
- **Smart Import/Export** (MD, HTML, PDF)
- **Mermaid Diagrams** for visual documentation
- **LaTeX Math Support** for scientific notation
- **Emoji Support** 😄 👍 🎉

## 💻 Code with Syntax Highlighting
\`\`\`javascript
  function renderMarkdown() {
    const markdown = markdownEditor.value;
    const html = marked.parse(markdown);
    const sanitizedHtml = DOMPurify.sanitize(html);
    markdownPreview.innerHTML = sanitizedHtml;
    
    // Apply syntax highlighting to code blocks
    markdownPreview.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
  }
\`\`\`

## 🧮 Mathematical Expressions
Write complex formulas with LaTeX syntax:

Inline equation: $$E = mc^2$$

Display equations:
$$\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

$$\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}$$

## 📊 Mermaid Diagrams
Create powerful visualizations directly in markdown:

\`\`\`mermaid
flowchart LR
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    C --> E[Deploy]
    D --> B
\`\`\`

### Sequence Diagram Example
\`\`\`mermaid
sequenceDiagram
    User->>Editor: Type markdown
    Editor->>Preview: Render content
    User->>Editor: Make changes
    Editor->>Preview: Update rendering
    User->>Export: Save as PDF
\`\`\`

## 📋 Task Management
- [x] Create responsive layout
- [x] Implement live preview with GitHub styling
- [x] Add syntax highlighting for code blocks
- [x] Support math expressions with LaTeX
- [x] Enable mermaid diagrams

## 🆚 Feature Comparison

| Feature                  | Markdown Viewer (Ours) | Other Markdown Editors  |
|:-------------------------|:----------------------:|:-----------------------:|
| Live Preview             | ✅ GitHub-Styled       | ✅                     |
| Sync Scrolling           | ✅ Two-way             | 🔄 Partial/None        |
| Mermaid Support          | ✅                     | ❌/Limited             |
| LaTeX Math Rendering     | ✅                     | ❌/Limited             |

### 📝 Multi-row Headers Support

<table>
  <thead>
    <tr>
      <th rowspan="2">Document Type</th>
      <th colspan="2">Support</th>
    </tr>
    <tr>
      <th>Markdown Viewer (Ours)</th>
      <th>Other Markdown Editors</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Technical Docs</td>
      <td>Full + Diagrams</td>
      <td>Limited/Basic</td>
    </tr>
    <tr>
      <td>Research Notes</td>
      <td>Full + Math</td>
      <td>Partial</td>
    </tr>
    <tr>
      <td>Developer Guides</td>
      <td>Full + Export Options</td>
      <td>Basic</td>
    </tr>
  </tbody>
</table>

## 📝 Text Formatting Examples

### Text Formatting

Text can be formatted in various ways for ~~strikethrough~~, **bold**, *italic*, or ***bold italic***.

For highlighting important information, use <mark>highlighted text</mark> or add <u>underlines</u> where appropriate.

### Superscript and Subscript

Chemical formulas: H<sub>2</sub>O, CO<sub>2</sub>  
Mathematical notation: x<sup>2</sup>, e<sup>iπ</sup>

### Keyboard Keys

Press <kbd>Ctrl</kbd> + <kbd>B</kbd> for bold text.

### Abbreviations

<abbr title="Graphical User Interface">GUI</abbr>  
<abbr title="Application Programming Interface">API</abbr>

### Text Alignment

<div style="text-align: center">
Centered text for headings or important notices
</div>

<div style="text-align: right">
Right-aligned text (for dates, signatures, etc.)
</div>

### **Lists**

Create bullet points:
* Item 1
* Item 2
  * Nested item
    * Nested further

### **Links and Images**

Add a [link](https://github.com/ijbo/mdView) to important resources.

Embed an image:
![Markdown Logo](https://example.com/logo.png)

### **Blockquotes**

Quote someone famous:
> "The best way to predict the future is to invent it." - Alan Kay

---

## 🛡️ Security Note

This is a fully client-side application. Your content never leaves your browser and stays secure on your device.

## 🖥️ Executable Code Blocks

Run bash commands directly in the preview — powered by [just-bash](https://justbash.dev/). Hover over any bash code block and click **▶ Run**.

\`\`\`bash
echo "Hello from just-bash! 🎉"
\`\`\`

\`\`\`bash
seq 1 5 | sort -r | tr '\\n' ' '
\`\`\`

\`\`\`bash
echo '{"users": ["Alice", "Bob", "Charlie"]}' | jq '.users | length'
\`\`\`
`;

  markdownEditor.value = sampleMarkdown;

  function renderMarkdown() {
    try {
      const markdown = markdownEditor.value;
      const html = marked.parse(markdown);
      const sanitizedHtml = DOMPurify.sanitize(html, {
        ADD_TAGS: ['mjx-container'],
        ADD_ATTR: ['id', 'class', 'data-lang']
      });
      markdownPreview.innerHTML = sanitizedHtml;

      markdownPreview.querySelectorAll("pre code").forEach((block) => {
        try {
          if (!block.classList.contains('mermaid')) {
            hljs.highlightElement(block);
          }
        } catch (e) {
          console.warn("Syntax highlighting failed for a code block:", e);
        }
      });

      processEmojis(markdownPreview);

      // Feature 15: Add anchor links to headings
      addHeadingAnchors(markdownPreview);

      // Feature 14: Process callouts/admonitions
      processCallouts(markdownPreview);

      // Feature 13: Process footnotes
      processFootnotes(markdownPreview, markdown);

      // Feature 4: Rebuild TOC
      const _tocPanel = document.getElementById('toc-panel');
      if (_tocPanel && _tocPanel.style.display !== 'none' && typeof buildTOC === 'function') {
        buildTOC();
      }

      try {
        const mermaidNodes = markdownPreview.querySelectorAll('.mermaid');
        if (mermaidNodes.length > 0) {
          mermaid.run({ nodes: mermaidNodes, suppressErrors: true })
            .then(() => addMermaidToolbars())
            .catch((e) => {
              console.warn("Mermaid rendering failed:", e);
              addMermaidToolbars();
            });
        }
      } catch (e) {
        console.warn("Mermaid rendering failed:", e);
      }

      // Feature 25: Render PlantUML diagrams
      renderPlantUML(markdownPreview);

      // Executable code blocks (just-bash)
      addCodeBlockToolbars();

      if (window.MathJax) {
        try {
          MathJax.typesetPromise([markdownPreview]).catch((err) => {
            console.warn('MathJax typesetting failed:', err);
          });
        } catch (e) {
          console.warn("MathJax rendering failed:", e);
        }
      }

      updateDocumentStats();
    } catch (e) {
      console.error("Markdown rendering failed:", e);
      markdownPreview.textContent = '';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'alert alert-danger';
      const strong = document.createElement('strong');
      strong.textContent = 'Error rendering markdown: ';
      errorDiv.appendChild(strong);
      errorDiv.appendChild(document.createTextNode(e.message));
      const pre = document.createElement('pre');
      pre.textContent = markdownEditor.value;
      markdownPreview.appendChild(errorDiv);
      markdownPreview.appendChild(pre);
    }
  }

  // ============================================
  // File Format Converters (MarkItDown-inspired)
  // ============================================

  const SUPPORTED_EXTENSIONS = {
    md: 'markdown', markdown: 'markdown',
    docx: 'docx',
    xlsx: 'xlsx', xls: 'xlsx',
    csv: 'csv',
    html: 'html', htm: 'html',
    json: 'json',
    xml: 'xml',
    pdf: 'pdf'
  };

  const conversionOverlay = document.getElementById('conversion-overlay');
  const conversionTitle = document.getElementById('conversion-title');
  const conversionDetail = document.getElementById('conversion-detail');

  function showConversionOverlay(title, detail) {
    conversionTitle.textContent = title || 'Converting...';
    conversionDetail.textContent = detail || 'Processing your file';
    conversionOverlay.style.display = 'flex';
  }

  function hideConversionOverlay() {
    conversionOverlay.style.display = 'none';
  }

  function showConversionToast(message) {
    const toast = document.createElement('div');
    toast.className = 'conversion-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function getFileExtension(filename) {
    return (filename.split('.').pop() || '').toLowerCase();
  }

  async function importFile(file) {
    const ext = getFileExtension(file.name);
    const type = SUPPORTED_EXTENSIONS[ext];

    if (!type) {
      alert(`Unsupported file format: .${ext}\n\nSupported: MD, DOCX, XLSX, CSV, HTML, JSON, XML, PDF`);
      return;
    }

    if (type === 'markdown') {
      importMarkdownFile(file);
      return;
    }

    showConversionOverlay(`Converting ${file.name}`, `${ext.toUpperCase()} \u2192 Markdown`);

    try {
      let markdown;
      switch (type) {
        case 'docx': markdown = await convertDocxToMarkdown(file); break;
        case 'xlsx': markdown = await convertXlsxToMarkdown(file); break;
        case 'csv': markdown = await convertCsvToMarkdown(file); break;
        case 'html': markdown = await convertHtmlToMarkdown(file); break;
        case 'json': markdown = await convertJsonToMarkdown(file); break;
        case 'xml': markdown = await convertXmlToMarkdown(file); break;
        case 'pdf': markdown = await convertPdfToMarkdown(file); break;
        default:
          throw new Error(`No converter found for type: ${type}`);
      }

      markdownEditor.value = markdown;
      renderMarkdown();
      dropzone.style.display = 'none';
      showConversionToast(`\u2713 Converted ${file.name} to Markdown`);
    } catch (err) {
      console.error('File conversion failed:', err);
      alert(`Failed to convert ${file.name}:\n${err.message}`);
    } finally {
      hideConversionOverlay();
    }
  }

  function importMarkdownFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      markdownEditor.value = e.target.result;
      renderMarkdown();
      dropzone.style.display = "none";
    };
    reader.readAsText(file);
  }

  // --- DOCX Converter (Mammoth.js + Turndown.js) ---
  async function convertDocxToMarkdown(file) {
    if (typeof mammoth === 'undefined') throw new Error('Mammoth.js library not loaded');
    if (typeof TurndownService === 'undefined') throw new Error('Turndown.js library not loaded');

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    if (result.messages && result.messages.length > 0) {
      console.warn('Mammoth warnings:', result.messages);
    }

    const turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '*'
    });

    // Improve table conversion
    turndown.addRule('tables', {
      filter: 'table',
      replacement: function (content, node) {
        return htmlTableToMarkdown(node);
      }
    });

    const markdown = turndown.turndown(result.value);
    const header = `> *Converted from: ${file.name}*\n\n---\n\n`;
    return header + markdown;
  }

  // --- XLSX/XLS Converter (SheetJS) ---
  async function convertXlsxToMarkdown(file) {
    if (typeof XLSX === 'undefined') throw new Error('SheetJS (XLSX) library not loaded');

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let markdown = `> *Converted from: ${file.name}*\n\n`;

    workbook.SheetNames.forEach((sheetName, idx) => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (jsonData.length === 0) return;

      if (workbook.SheetNames.length > 1) {
        markdown += `## Sheet: ${sheetName}\n\n`;
      }

      markdown += arrayToMarkdownTable(jsonData) + '\n\n';
    });

    return markdown;
  }

  // --- CSV Converter (native) ---
  async function convertCsvToMarkdown(file) {
    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length === 0) return `> *Empty CSV file: ${file.name}*`;

    let markdown = `> *Converted from: ${file.name}*\n\n`;
    markdown += arrayToMarkdownTable(rows);
    return markdown;
  }

  // --- HTML Converter (Turndown.js) ---
  async function convertHtmlToMarkdown(file) {
    if (typeof TurndownService === 'undefined') throw new Error('Turndown.js library not loaded');

    const html = await file.text();
    const turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '*'
    });

    // Extract body content if full HTML document
    let content = html;
    const bodyRegex = new RegExp('<body[^>]*>([\\s\\S]*?)<\\/body>', 'i');
    const bodyMatch = html.match(bodyRegex);
    if (bodyMatch) {
      content = bodyMatch[1];
    }

    const markdown = turndown.turndown(content);
    const header = `> *Converted from: ${file.name}*\n\n---\n\n`;
    return header + markdown;
  }

  // --- JSON Converter (native) ---
  async function convertJsonToMarkdown(file) {
    const text = await file.text();
    let formatted;
    try {
      const parsed = JSON.parse(text);
      formatted = JSON.stringify(parsed, null, 2);
    } catch (e) {
      formatted = text; // Show raw if invalid JSON
    }

    return `> *Converted from: ${file.name}*\n\n\`\`\`json\n${formatted}\n\`\`\``;
  }

  // --- XML Converter (native) ---
  async function convertXmlToMarkdown(file) {
    const text = await file.text();
    let formatted = text;
    try {
      // Pretty-print XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const errors = xmlDoc.getElementsByTagName('parsererror');
      if (errors.length === 0) {
        const serializer = new XMLSerializer();
        formatted = serializer.serializeToString(xmlDoc);
        // Basic indentation
        formatted = formatted.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
      }
    } catch (e) {
      // Use raw text on error
    }

    return `> *Converted from: ${file.name}*\n\n\`\`\`xml\n${formatted}\n\`\`\``;
  }

  // --- PDF Converter (pdf.js) ---
  async function convertPdfToMarkdown(file) {
    // pdf.js is loaded as ESM module; check window.pdfjsLib
    let pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) {
      // Try to dynamically import
      try {
        const mod = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
        pdfjsLib = mod;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
      } catch (e) {
        throw new Error('PDF.js library could not be loaded. PDF conversion requires a modern browser.');
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let markdown = `> *Converted from: ${file.name} (${pdf.numPages} pages)*\n\n---\n\n`;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');

      if (pdf.numPages > 1) {
        markdown += `## Page ${i}\n\n`;
      }
      markdown += pageText.trim() + '\n\n';
    }

    return markdown;
  }

  // ============================================
  // Converter Utility Functions
  // ============================================

  function arrayToMarkdownTable(rows) {
    if (!rows || rows.length === 0) return '';

    // First row as headers
    const headers = rows[0].map(h => String(h).trim() || ' ');
    const separator = headers.map(() => '---');
    const dataRows = rows.slice(1);

    let table = `| ${headers.join(' | ')} |\n`;
    table += `| ${separator.join(' | ')} |\n`;

    for (const row of dataRows) {
      const cells = headers.map((_, i) => {
        const val = row[i] !== undefined ? String(row[i]).trim() : '';
        return val.replace(/\|/g, '\\|'); // Escape pipes
      });
      table += `| ${cells.join(' | ')} |\n`;
    }

    return table;
  }

  function parseCsv(text) {
    const rows = [];
    let current = '';
    let inQuotes = false;
    const result = [];

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"' && text[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current);
          current = '';
        } else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
          result.push(current);
          rows.push(result.slice());
          result.length = 0;
          current = '';
          if (ch === '\r') i++;
        } else {
          current += ch;
        }
      }
    }
    if (current || result.length > 0) {
      result.push(current);
      rows.push(result);
    }

    return rows;
  }

  function htmlTableToMarkdown(tableNode) {
    const rows = [];
    const trs = tableNode.querySelectorAll('tr');
    trs.forEach(tr => {
      const cells = [];
      tr.querySelectorAll('th, td').forEach(cell => {
        cells.push(cell.textContent.trim().replace(/\|/g, '\\|'));
      });
      rows.push(cells);
    });

    if (rows.length === 0) return '';
    return arrayToMarkdownTable(rows);
  }

  // ============================================
  // End File Format Converters
  // ============================================

  function processEmojis(element) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      let parent = node.parentNode;
      let isInCode = false;
      while (parent && parent !== element) {
        if (parent.tagName === 'PRE' || parent.tagName === 'CODE') {
          isInCode = true;
          break;
        }
        parent = parent.parentNode;
      }

      if (!isInCode && node.nodeValue.includes(':')) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(textNode => {
      const text = textNode.nodeValue;
      const emojiRegex = /:([\w+-]+):/g;

      let match;
      let lastIndex = 0;
      let result = '';
      let hasEmoji = false;

      while ((match = emojiRegex.exec(text)) !== null) {
        const shortcode = match[1];
        const emoji = joypixels.shortnameToUnicode(`:${shortcode}:`);

        if (emoji !== `:${shortcode}:`) { // If conversion was successful
          hasEmoji = true;
          result += text.substring(lastIndex, match.index) + emoji;
          lastIndex = emojiRegex.lastIndex;
        } else {
          result += text.substring(lastIndex, emojiRegex.lastIndex);
          lastIndex = emojiRegex.lastIndex;
        }
      }

      if (hasEmoji) {
        result += text.substring(lastIndex);
        const span = document.createElement('span');
        span.textContent = result;
        textNode.parentNode.replaceChild(span, textNode);
      }
    });
  }

  function debouncedRender() {
    clearTimeout(markdownRenderTimeout);
    markdownRenderTimeout = setTimeout(renderMarkdown, RENDER_DELAY);
  }

  function updateDocumentStats() {
    const text = markdownEditor.value;

    const charCount = text.length;
    charCountElement.textContent = charCount.toLocaleString();

    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    wordCountElement.textContent = wordCount.toLocaleString();

    const readingTimeMinutes = Math.ceil(wordCount / 200);
    readingTimeElement.textContent = readingTimeMinutes;
  }

  function syncEditorToPreview() {
    if (!syncScrollingEnabled || isPreviewScrolling) return;
    const editorScrollable = editorPane.scrollHeight - editorPane.clientHeight;
    if (editorScrollable <= 0) return;

    isEditorScrolling = true;
    clearTimeout(scrollSyncTimeout);

    scrollSyncTimeout = setTimeout(() => {
      const editorScrollRatio = editorPane.scrollTop / editorScrollable;
      const previewScrollable = previewPane.scrollHeight - previewPane.clientHeight;
      const previewScrollPosition = previewScrollable * editorScrollRatio;

      if (!isNaN(previewScrollPosition) && isFinite(previewScrollPosition)) {
        previewPane.scrollTop = previewScrollPosition;
      }

      setTimeout(() => {
        isEditorScrolling = false;
      }, 50);
    }, SCROLL_SYNC_DELAY);
  }

  function syncPreviewToEditor() {
    if (!syncScrollingEnabled || isEditorScrolling) return;
    const previewScrollable = previewPane.scrollHeight - previewPane.clientHeight;
    if (previewScrollable <= 0) return;

    isPreviewScrolling = true;
    clearTimeout(scrollSyncTimeout);

    scrollSyncTimeout = setTimeout(() => {
      const previewScrollRatio = previewPane.scrollTop / previewScrollable;
      const editorScrollable = editorPane.scrollHeight - editorPane.clientHeight;
      const editorScrollPosition = editorScrollable * previewScrollRatio;

      if (!isNaN(editorScrollPosition) && isFinite(editorScrollPosition)) {
        editorPane.scrollTop = editorScrollPosition;
      }

      setTimeout(() => {
        isPreviewScrolling = false;
      }, 50);
    }, SCROLL_SYNC_DELAY);
  }

  function toggleSyncScrolling() {
    syncScrollingEnabled = !syncScrollingEnabled;
    if (syncScrollingEnabled) {
      toggleSyncButton.innerHTML = '<i class="bi bi-link"></i>';
      toggleSyncButton.classList.add("sync-enabled");
      toggleSyncButton.classList.remove("sync-disabled");
    } else {
      toggleSyncButton.innerHTML = '<i class="bi bi-link-45deg"></i>';
      toggleSyncButton.classList.add("sync-disabled");
      toggleSyncButton.classList.remove("sync-enabled");
    }
  }

  // View Mode Functions - Story 1.1 & 1.2
  function setViewMode(mode) {
    if (mode === currentViewMode) return;

    const previousMode = currentViewMode;
    currentViewMode = mode;

    // Update content container class
    contentContainer.classList.remove('view-editor-only', 'view-preview-only', 'view-split');
    contentContainer.classList.add('view-' + (mode === 'editor' ? 'editor-only' : mode === 'preview' ? 'preview-only' : 'split'));

    // Update button active states (desktop)
    viewModeButtons.forEach(btn => {
      const btnMode = btn.getAttribute('data-mode');
      if (btnMode === mode) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // Story 1.4: Update mobile button active states
    mobileViewModeButtons.forEach(btn => {
      const btnMode = btn.getAttribute('data-mode');
      if (btnMode === mode) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // Story 1.2: Show/hide sync toggle based on view mode
    updateSyncToggleVisibility(mode);

    // Story 1.3: Handle pane widths when switching modes
    if (mode === 'split') {
      // Restore preserved pane widths when entering split mode
      applyPaneWidths();
    } else if (previousMode === 'split') {
      // Reset pane widths when leaving split mode
      resetPaneWidths();
    }

    // Re-render markdown when switching to a view that includes preview
    if (mode === 'split' || mode === 'preview') {
      renderMarkdown();
    }
  }

  // Story 1.2: Update sync toggle visibility
  function updateSyncToggleVisibility(mode) {
    const isSplitView = mode === 'split';

    // Desktop sync toggle
    if (toggleSyncButton) {
      toggleSyncButton.style.display = isSplitView ? '' : 'none';
      toggleSyncButton.setAttribute('aria-hidden', !isSplitView);
    }

    // Mobile sync toggle
    if (mobileToggleSync) {
      mobileToggleSync.style.display = isSplitView ? '' : 'none';
      mobileToggleSync.setAttribute('aria-hidden', !isSplitView);
    }
  }

  // Story 1.3: Resize Divider Functions
  function initResizer() {
    if (!resizeDivider) return;

    resizeDivider.addEventListener('mousedown', startResize);
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);

    // Touch support for tablets (though disabled via CSS, keeping for future)
    resizeDivider.addEventListener('touchstart', startResizeTouch);
    document.addEventListener('touchmove', handleResizeTouch);
    document.addEventListener('touchend', stopResize);

    // Keyboard support for accessibility (#21)
    resizeDivider.addEventListener('keydown', function (e) {
      if (currentViewMode !== 'split') return;
      const step = 2; // 2% per keypress
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        editorWidthPercent = Math.max(MIN_PANE_PERCENT, editorWidthPercent - step);
        applyPaneWidths();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        editorWidthPercent = Math.min(100 - MIN_PANE_PERCENT, editorWidthPercent + step);
        applyPaneWidths();
      }
    });
  }

  function startResize(e) {
    if (currentViewMode !== 'split') return;
    e.preventDefault();
    isResizing = true;
    resizeDivider.classList.add('dragging');
    document.body.classList.add('resizing');
  }

  function startResizeTouch(e) {
    if (currentViewMode !== 'split') return;
    e.preventDefault();
    isResizing = true;
    resizeDivider.classList.add('dragging');
    document.body.classList.add('resizing');
  }

  function handleResize(e) {
    if (!isResizing) return;

    const containerRect = contentContainer.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;

    // Calculate percentage
    let newEditorPercent = (mouseX / containerWidth) * 100;

    // Enforce minimum pane widths
    newEditorPercent = Math.max(MIN_PANE_PERCENT, Math.min(100 - MIN_PANE_PERCENT, newEditorPercent));

    editorWidthPercent = newEditorPercent;
    applyPaneWidths();
  }

  function handleResizeTouch(e) {
    if (!isResizing || !e.touches[0]) return;

    const containerRect = contentContainer.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const touchX = e.touches[0].clientX - containerRect.left;

    let newEditorPercent = (touchX / containerWidth) * 100;
    newEditorPercent = Math.max(MIN_PANE_PERCENT, Math.min(100 - MIN_PANE_PERCENT, newEditorPercent));

    editorWidthPercent = newEditorPercent;
    applyPaneWidths();
  }

  function stopResize() {
    if (!isResizing) return;
    isResizing = false;
    resizeDivider.classList.remove('dragging');
    document.body.classList.remove('resizing');
  }

  function applyPaneWidths() {
    if (currentViewMode !== 'split') return;

    const previewPercent = 100 - editorWidthPercent;
    editorPaneElement.style.flex = `0 0 calc(${editorWidthPercent}% - 4px)`;
    previewPaneElement.style.flex = `0 0 calc(${previewPercent}% - 4px)`;
  }

  function resetPaneWidths() {
    editorPaneElement.style.flex = '';
    previewPaneElement.style.flex = '';
  }

  function openMobileMenu() {
    mobileMenuPanel.classList.add("active");
    mobileMenuOverlay.classList.add("active");
  }
  function closeMobileMenu() {
    mobileMenuPanel.classList.remove("active");
    mobileMenuOverlay.classList.remove("active");
  }
  mobileMenuToggle.addEventListener("click", openMobileMenu);
  mobileCloseMenu.addEventListener("click", closeMobileMenu);
  mobileMenuOverlay.addEventListener("click", closeMobileMenu);

  function updateMobileStats() {
    mobileCharCount.textContent = charCountElement.textContent;
    mobileWordCount.textContent = wordCountElement.textContent;
    mobileReadingTime.textContent = readingTimeElement.textContent;
  }

  // Wrap updateDocumentStats to also update mobile stats
  const origUpdateStats = updateDocumentStats;
  updateDocumentStats = function () {
    origUpdateStats.call(this);
    updateMobileStats();
  };

  mobileToggleSync.addEventListener("click", () => {
    toggleSyncScrolling();
    if (syncScrollingEnabled) {
      mobileToggleSync.innerHTML = '<i class="bi bi-link me-2"></i> Sync On';
      mobileToggleSync.classList.add("sync-enabled");
      mobileToggleSync.classList.remove("sync-disabled");
    } else {
      mobileToggleSync.innerHTML = '<i class="bi bi-link-45deg me-2"></i> Sync Off';
      mobileToggleSync.classList.add("sync-disabled");
      mobileToggleSync.classList.remove("sync-enabled");
    }
  });
  mobileImportBtn.addEventListener("click", () => fileInput.click());
  mobileExportMd.addEventListener("click", () => exportMd.click());
  mobileExportHtml.addEventListener("click", () => exportHtml.click());
  mobileExportPdf.addEventListener("click", () => exportPdf.click());
  mobileCopyMarkdown.addEventListener("click", () => copyMarkdownButton.click());
  mobileThemeToggle.addEventListener("click", () => {
    themeToggle.click();
    const currentTheme = document.documentElement.getAttribute("data-theme");
    mobileThemeToggle.innerHTML = currentTheme === "dark"
      ? '<i class="bi bi-sun me-2"></i> Light Mode'
      : '<i class="bi bi-moon me-2"></i> Dark Mode';
  });

  renderMarkdown();
  updateMobileStats();

  // Initialize view mode - Story 1.1
  contentContainer.classList.add('view-split');

  // Initialize resizer - Story 1.3
  initResizer();

  // View Mode Button Event Listeners - Story 1.1
  viewModeButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const mode = this.getAttribute('data-mode');
      setViewMode(mode);
    });
  });

  // Story 1.4: Mobile View Mode Button Event Listeners
  mobileViewModeButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const mode = this.getAttribute('data-mode');
      setViewMode(mode);
      closeMobileMenu();
    });
  });

  markdownEditor.addEventListener("input", debouncedRender);

  // Tab key handler to insert indentation instead of moving focus
  // Escape key releases focus so keyboard-only users aren't trapped (#20)
  markdownEditor.addEventListener("keydown", function (e) {
    if (e.key === 'Escape') {
      this.blur();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();

      const start = this.selectionStart;
      const end = this.selectionEnd;
      const value = this.value;

      // Insert 2 spaces
      const indent = '  '; // 2 spaces

      // Update textarea value
      this.value = value.substring(0, start) + indent + value.substring(end);

      // Update cursor position
      this.selectionStart = this.selectionEnd = start + indent.length;

      // Trigger input event to update preview
      this.dispatchEvent(new Event('input'));
    }
  });

  editorPane.addEventListener("scroll", syncEditorToPreview);
  previewPane.addEventListener("scroll", syncPreviewToEditor);
  toggleSyncButton.addEventListener("click", toggleSyncScrolling);
  themeToggle.addEventListener("click", function () {
    const theme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem('markdown-viewer-theme', theme);

    if (theme === "dark") {
      themeToggle.innerHTML = '<i class="bi bi-sun"></i>';
    } else {
      themeToggle.innerHTML = '<i class="bi bi-moon"></i>';
    }

    // Reinitialize mermaid with new theme
    initMermaid();
    renderMarkdown();
  });

  importButton.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      importFile(file);
    }
    this.value = "";
  });

  exportMd.addEventListener("click", function () {
    try {
      const blob = new Blob([markdownEditor.value], {
        type: "text/markdown;charset=utf-8",
      });
      saveAs(blob, "document.md");
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed: " + e.message);
    }
  });

  exportHtml.addEventListener("click", function () {
    try {
      const markdown = markdownEditor.value;
      const html = marked.parse(markdown);
      const sanitizedHtml = DOMPurify.sanitize(html, {
        ADD_TAGS: ['mjx-container'],
        ADD_ATTR: ['id', 'class']
      });
      const isDarkTheme =
        document.documentElement.getAttribute("data-theme") === "dark";
      const cssTheme = isDarkTheme
        ? "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.3.0/github-markdown-dark.min.css"
        : "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.3.0/github-markdown.min.css";
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <link rel="stylesheet" href="${cssTheme}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${isDarkTheme ? "github-dark" : "github"
        }.min.css">
  <style>
      body {
          background-color: ${isDarkTheme ? "#0d1117" : "#ffffff"};
          color: ${isDarkTheme ? "#c9d1d9" : "#24292e"};
      }
      .markdown-body {
          box-sizing: border-box;
          min-width: 200px;
          max-width: 980px;
          margin: 0 auto;
          padding: 45px;
          background-color: ${isDarkTheme ? "#0d1117" : "#ffffff"};
          color: ${isDarkTheme ? "#c9d1d9" : "#24292e"};
      }
      @media (max-width: 767px) {
          .markdown-body {
              padding: 15px;
          }
      }
  </style>
</head>
<body>
  <article class="markdown-body">
      ${sanitizedHtml}
  </article>
</body>
</html>`;
      const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
      saveAs(blob, "document.html");
    } catch (e) {
      console.error("HTML export failed:", e);
      alert("HTML export failed: " + e.message);
    }
  });

  // ============================================
  // Page-Break Detection Functions (Story 1.1)
  // ============================================

  // Page configuration constants for A4 PDF export
  const PAGE_CONFIG = {
    a4Width: 210,           // mm
    a4Height: 297,          // mm
    margin: 15,             // mm each side
    contentWidth: 180,      // 210 - 30 (margins)
    contentHeight: 267,     // 297 - 30 (margins)
    windowWidth: 1000,      // html2canvas config
    scale: 2                // html2canvas scale factor
  };

  /**
   * Task 1: Identifies all graphic elements that may need page-break handling
   * @param {HTMLElement} container - The container element to search within
   * @returns {Array} Array of {element, type} objects
   */
  function identifyGraphicElements(container) {
    const graphics = [];

    // Query for images
    container.querySelectorAll('img').forEach(el => {
      graphics.push({ element: el, type: 'img' });
    });

    // Query for SVGs (Mermaid diagrams)
    container.querySelectorAll('svg').forEach(el => {
      graphics.push({ element: el, type: 'svg' });
    });

    // Query for pre elements (code blocks)
    container.querySelectorAll('pre').forEach(el => {
      graphics.push({ element: el, type: 'pre' });
    });

    // Query for tables
    container.querySelectorAll('table').forEach(el => {
      graphics.push({ element: el, type: 'table' });
    });

    return graphics;
  }

  /**
   * Task 2: Calculates element positions relative to the container
   * @param {Array} elements - Array of {element, type} objects
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array with position data added
   */
  function calculateElementPositions(elements, container) {
    const containerRect = container.getBoundingClientRect();

    return elements.map(item => {
      const rect = item.element.getBoundingClientRect();
      const top = rect.top - containerRect.top;
      const height = rect.height;
      const bottom = top + height;

      return {
        element: item.element,
        type: item.type,
        top: top,
        height: height,
        bottom: bottom
      };
    });
  }

  /**
   * Task 3: Calculates page boundary positions
   * @param {number} totalHeight - Total height of content in pixels
   * @param {number} elementWidth - Actual width of the rendered element in pixels
   * @param {Object} pageConfig - Page configuration object
   * @returns {Array} Array of y-coordinates where pages end
   */
  function calculatePageBoundaries(totalHeight, elementWidth, pageConfig) {
    // Calculate pixel height per page based on the element's actual width
    // This must match how PDF pagination will split the canvas
    // The aspect ratio of content area determines page height relative to width
    const aspectRatio = pageConfig.contentHeight / pageConfig.contentWidth;
    const pageHeightPx = elementWidth * aspectRatio;

    const boundaries = [];
    let y = pageHeightPx;

    while (y < totalHeight) {
      boundaries.push(y);
      y += pageHeightPx;
    }

    return { boundaries, pageHeightPx };
  }

  /**
   * Task 4: Detects which elements would be split across page boundaries
   * @param {Array} elements - Array of elements with position data
   * @param {Array} pageBoundaries - Array of page break y-coordinates
   * @returns {Array} Array of split elements with additional split info
   */
  function detectSplitElements(elements, pageBoundaries) {
    // Handle edge case: empty elements array
    if (!elements || elements.length === 0) {
      return [];
    }

    // Handle edge case: no page boundaries (single page)
    if (!pageBoundaries || pageBoundaries.length === 0) {
      return [];
    }

    const splitElements = [];

    for (const item of elements) {
      // Find which page the element starts on
      let startPage = 0;
      for (let i = 0; i < pageBoundaries.length; i++) {
        if (item.top >= pageBoundaries[i]) {
          startPage = i + 1;
        } else {
          break;
        }
      }

      // Find which page the element ends on
      let endPage = 0;
      for (let i = 0; i < pageBoundaries.length; i++) {
        if (item.bottom > pageBoundaries[i]) {
          endPage = i + 1;
        } else {
          break;
        }
      }

      // Element is split if it spans multiple pages
      if (endPage > startPage) {
        // Calculate overflow amount (how much crosses into next page)
        const boundaryY = pageBoundaries[startPage] || pageBoundaries[0];
        const overflowAmount = item.bottom - boundaryY;

        splitElements.push({
          element: item.element,
          type: item.type,
          top: item.top,
          height: item.height,
          splitPageIndex: startPage,
          overflowAmount: overflowAmount
        });
      }
    }

    return splitElements;
  }

  /**
   * Task 5: Main entry point for analyzing graphics for page breaks
   * @param {HTMLElement} tempElement - The rendered content container
   * @returns {Object} Analysis result with totalElements, splitElements, pageCount
   */
  function analyzeGraphicsForPageBreaks(tempElement) {
    try {
      // Step 1: Identify all graphic elements
      const graphics = identifyGraphicElements(tempElement);

      // Step 2: Calculate positions for each element
      const elementsWithPositions = calculateElementPositions(graphics, tempElement);

      // Step 3: Calculate page boundaries using the element's ACTUAL width
      const totalHeight = tempElement.scrollHeight;
      const elementWidth = tempElement.offsetWidth;
      const { boundaries: pageBoundaries, pageHeightPx } = calculatePageBoundaries(
        totalHeight,
        elementWidth,
        PAGE_CONFIG
      );

      // Step 4: Detect split elements
      const splitElements = detectSplitElements(elementsWithPositions, pageBoundaries);

      // Calculate page count
      const pageCount = pageBoundaries.length + 1;

      return {
        totalElements: graphics.length,
        splitElements: splitElements,
        pageCount: pageCount,
        pageBoundaries: pageBoundaries,
        pageHeightPx: pageHeightPx
      };
    } catch (error) {
      console.error('Page-break analysis failed:', error);
      return {
        totalElements: 0,
        splitElements: [],
        pageCount: 1,
        pageBoundaries: [],
        pageHeightPx: 0
      };
    }
  }

  // ============================================
  // End Page-Break Detection Functions
  // ============================================

  // ============================================
  // Page-Break Insertion Functions (Story 1.2)
  // ============================================

  // Threshold for whitespace optimization (30% of page height)
  const PAGE_BREAK_THRESHOLD = 0.3;

  /**
   * Task 3: Categorizes split elements by whether they fit on a single page
   * @param {Array} splitElements - Array of split elements from detection
   * @param {number} pageHeightPx - Page height in pixels
   * @returns {Object} { fittingElements, oversizedElements }
   */
  function categorizeBySize(splitElements, pageHeightPx) {
    const fittingElements = [];
    const oversizedElements = [];

    for (const item of splitElements) {
      if (item.height <= pageHeightPx) {
        fittingElements.push(item);
      } else {
        oversizedElements.push(item);
      }
    }

    return { fittingElements, oversizedElements };
  }

  /**
   * Task 1: Inserts page breaks by adjusting margins for fitting elements
   * @param {Array} fittingElements - Elements that fit on a single page
   * @param {number} pageHeightPx - Page height in pixels
   */
  function insertPageBreaks(fittingElements, pageHeightPx) {
    for (const item of fittingElements) {
      // Calculate where the current page ends
      const currentPageBottom = (item.splitPageIndex + 1) * pageHeightPx;

      // Calculate remaining space on current page
      const remainingSpace = currentPageBottom - item.top;
      const remainingRatio = remainingSpace / pageHeightPx;

      // Task 4: Whitespace optimization
      // If remaining space is more than threshold and element almost fits, skip
      // (Will be handled by Story 1.3 scaling instead)
      if (remainingRatio > PAGE_BREAK_THRESHOLD) {
        const scaledHeight = item.height * 0.9; // 90% scale
        if (scaledHeight <= remainingSpace) {
          continue;
        }
      }

      // Calculate margin needed to push element to next page
      const marginNeeded = currentPageBottom - item.top + 5; // 5px buffer

      // Determine which element to apply margin to
      // For SVG elements (Mermaid diagrams), apply to parent container for proper layout
      let targetElement = item.element;
      if (item.type === 'svg' && item.element.parentElement) {
        targetElement = item.element.parentElement;
      }

      // Apply margin to push element to next page
      const currentMargin = parseFloat(targetElement.style.marginTop) || 0;
      targetElement.style.marginTop = `${currentMargin + marginNeeded}px`;
    }
  }

  /**
   * Task 2: Applies page breaks with cascading adjustment handling
   * @param {HTMLElement} tempElement - The rendered content container
   * @param {Object} pageConfig - Page configuration object (unused, kept for API compatibility)
   * @param {number} maxIterations - Maximum iterations to prevent infinite loops
   * @returns {Object} Final analysis result
   */
  function applyPageBreaksWithCascade(tempElement, pageConfig, maxIterations = 10) {
    let iteration = 0;
    let analysis;
    let previousSplitCount = -1;

    do {
      // Re-analyze after each adjustment
      analysis = analyzeGraphicsForPageBreaks(tempElement);

      // Use pageHeightPx from analysis (calculated from actual element width)
      const pageHeightPx = analysis.pageHeightPx;

      // Categorize elements by size
      const { fittingElements, oversizedElements } = categorizeBySize(
        analysis.splitElements,
        pageHeightPx
      );

      // Store oversized elements for Story 1.3
      analysis.oversizedElements = oversizedElements;

      // If no fitting elements need adjustment, we're done
      if (fittingElements.length === 0) {
        break;
      }

      // Check if we're making progress (prevent infinite loops)
      if (fittingElements.length === previousSplitCount) {
        console.warn('Page-break adjustment not making progress, stopping');
        break;
      }
      previousSplitCount = fittingElements.length;

      // Apply page breaks to fitting elements
      insertPageBreaks(fittingElements, pageHeightPx);
      iteration++;

    } while (iteration < maxIterations);

    if (iteration >= maxIterations) {
      console.warn('Page-break stabilization reached max iterations:', maxIterations);
    }

    return analysis;
  }

  // ============================================
  // End Page-Break Insertion Functions
  // ============================================

  // ============================================
  // Oversized Graphics Scaling Functions (Story 1.3)
  // ============================================

  // Minimum scale factor to maintain readability (50%)
  const MIN_SCALE_FACTOR = 0.5;

  /**
   * Task 1 & 2: Calculates scale factor with minimum enforcement
   * @param {number} elementHeight - Original height of element in pixels
   * @param {number} availableHeight - Available page height in pixels
   * @param {number} buffer - Small buffer to prevent edge overflow
   * @returns {Object} { scaleFactor, wasClampedToMin }
   */
  function calculateScaleFactor(elementHeight, availableHeight, buffer = 5) {
    const targetHeight = availableHeight - buffer;
    let scaleFactor = targetHeight / elementHeight;
    let wasClampedToMin = false;

    // Enforce minimum scale for readability
    if (scaleFactor < MIN_SCALE_FACTOR) {
      console.warn(
        `Warning: Large graphic requires ${(scaleFactor * 100).toFixed(0)}% scaling. ` +
        `Clamping to minimum ${MIN_SCALE_FACTOR * 100}%. Content may be cut off.`
      );
      scaleFactor = MIN_SCALE_FACTOR;
      wasClampedToMin = true;
    }

    return { scaleFactor, wasClampedToMin };
  }

  /**
   * Task 3: Applies CSS transform scaling to an element
   * @param {HTMLElement} element - The element to scale
   * @param {number} scaleFactor - Scale factor (0.5 = 50%)
   * @param {string} elementType - Type of element (svg, pre, img, table)
   */
  function applyGraphicScaling(element, scaleFactor, elementType) {
    // Get original dimensions before transform
    const originalHeight = element.offsetHeight;

    // Task 4: Handle SVG elements (Mermaid diagrams)
    if (elementType === 'svg') {
      // Remove max-width constraint that may interfere
      element.style.maxWidth = 'none';
    }

    // Apply CSS transform
    element.style.transform = `scale(${scaleFactor})`;
    element.style.transformOrigin = 'top left';

    // Calculate margin adjustment to collapse visual space
    const scaledHeight = originalHeight * scaleFactor;
    const marginAdjustment = originalHeight - scaledHeight;

    // Apply negative margin to pull subsequent content up
    element.style.marginBottom = `-${marginAdjustment}px`;
  }

  /**
   * Task 6: Handles all oversized elements by applying appropriate scaling
   * @param {Array} oversizedElements - Array of oversized element data
   * @param {number} pageHeightPx - Page height in pixels
   */
  function handleOversizedElements(oversizedElements, pageHeightPx) {
    if (!oversizedElements || oversizedElements.length === 0) {
      return;
    }

    let scaledCount = 0;
    let clampedCount = 0;

    for (const item of oversizedElements) {
      // Calculate required scale factor
      const { scaleFactor, wasClampedToMin } = calculateScaleFactor(
        item.height,
        pageHeightPx
      );

      // Apply scaling to the element
      applyGraphicScaling(item.element, scaleFactor, item.type);

      scaledCount++;
      if (wasClampedToMin) {
        clampedCount++;
      }
    }

    console.log('Oversized graphics scaling complete:', {
      totalScaled: scaledCount,
      clampedToMinimum: clampedCount
    });
  }

  // ============================================
  // End Oversized Graphics Scaling Functions
  // ============================================

  exportPdf.addEventListener("click", async function () {
    let progressContainer = null;
    let tempElement = null;
    try {
      const originalText = exportPdf.innerHTML;
      exportPdf.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating...';
      exportPdf.disabled = true;

      progressContainer = document.createElement('div');
      progressContainer.style.position = 'fixed';
      progressContainer.style.top = '50%';
      progressContainer.style.left = '50%';
      progressContainer.style.transform = 'translate(-50%, -50%)';
      progressContainer.style.padding = '15px 20px';
      progressContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      progressContainer.style.color = 'white';
      progressContainer.style.borderRadius = '5px';
      progressContainer.style.zIndex = '9999';
      progressContainer.style.textAlign = 'center';

      const statusText = document.createElement('div');
      statusText.textContent = 'Generating PDF...';
      progressContainer.appendChild(statusText);
      document.body.appendChild(progressContainer);

      const markdown = markdownEditor.value;
      const html = marked.parse(markdown);
      const sanitizedHtml = DOMPurify.sanitize(html, {
        ADD_TAGS: ['mjx-container', 'svg', 'path', 'g', 'marker', 'defs', 'pattern', 'clipPath'],
        ADD_ATTR: ['id', 'class', 'style', 'viewBox', 'd', 'fill', 'stroke', 'transform', 'marker-end', 'marker-start']
      });

      tempElement = document.createElement("div");
      tempElement.className = "markdown-body pdf-export";
      tempElement.innerHTML = sanitizedHtml;
      tempElement.style.padding = "20px";
      tempElement.style.width = "210mm";
      tempElement.style.margin = "0 auto";
      tempElement.style.fontSize = "14px";
      tempElement.style.position = "fixed";
      tempElement.style.left = "-9999px";
      tempElement.style.top = "0";

      const currentTheme = document.documentElement.getAttribute("data-theme");
      tempElement.style.backgroundColor = currentTheme === "dark" ? "#0d1117" : "#ffffff";
      tempElement.style.color = currentTheme === "dark" ? "#c9d1d9" : "#24292e";

      document.body.appendChild(tempElement);

      await new Promise(resolve => setTimeout(resolve, 200));

      try {
        await mermaid.run({
          nodes: tempElement.querySelectorAll('.mermaid'),
          suppressErrors: true
        });
      } catch (mermaidError) {
        console.warn("Mermaid rendering issue:", mermaidError);
      }

      if (window.MathJax) {
        try {
          await MathJax.typesetPromise([tempElement]);
        } catch (mathJaxError) {
          console.warn("MathJax rendering issue:", mathJaxError);
        }

        // Hide MathJax assistive elements that cause duplicate text in PDF
        // These are screen reader elements that html2canvas captures as visible
        // Use multiple CSS properties to ensure html2canvas doesn't render them
        const assistiveElements = tempElement.querySelectorAll('mjx-assistive-mml');
        assistiveElements.forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.position = 'absolute';
          el.style.width = '0';
          el.style.height = '0';
          el.style.overflow = 'hidden';
          el.remove(); // Remove entirely from DOM
        });

        // Also hide any MathJax script elements that might contain source
        const mathScripts = tempElement.querySelectorAll('script[type*="math"], script[type*="tex"]');
        mathScripts.forEach(el => el.remove());
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Analyze and apply page-breaks for graphics (Story 1.1 + 1.2)
      const pageBreakAnalysis = applyPageBreaksWithCascade(tempElement, PAGE_CONFIG);

      // Scale oversized graphics that can't fit on a single page (Story 1.3)
      if (pageBreakAnalysis.oversizedElements && pageBreakAnalysis.pageHeightPx) {
        handleOversizedElements(pageBreakAnalysis.oversizedElements, pageBreakAnalysis.pageHeightPx);
      }

      const pdfOptions = {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        hotfixes: ["px_scaling"]
      };

      const pdf = new jspdf.jsPDF(pdfOptions);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: 1000,
        windowHeight: tempElement.scrollHeight
      });

      const scaleFactor = canvas.width / contentWidth;
      const imgHeight = canvas.height / scaleFactor;
      const pagesCount = Math.ceil(imgHeight / (pageHeight - margin * 2));

      for (let page = 0; page < pagesCount; page++) {
        if (page > 0) pdf.addPage();

        const sourceY = page * (pageHeight - margin * 2) * scaleFactor;
        const sourceHeight = Math.min(canvas.height - sourceY, (pageHeight - margin * 2) * scaleFactor);
        const destHeight = sourceHeight / scaleFactor;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;

        const ctx = pageCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);

        const imgData = pageCanvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, destHeight);
      }

      pdf.save("document.pdf");

      statusText.textContent = 'Download successful!';
      setTimeout(() => {
        document.body.removeChild(progressContainer);
      }, 1500);

      document.body.removeChild(tempElement);
      exportPdf.innerHTML = originalText;
      exportPdf.disabled = false;

    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF export failed: " + error.message);
      exportPdf.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Export';
      exportPdf.disabled = false;

      // Clean up progress overlay and temp element reliably
      if (progressContainer && progressContainer.parentNode) {
        progressContainer.parentNode.removeChild(progressContainer);
      }
      if (tempElement && tempElement.parentNode) {
        tempElement.parentNode.removeChild(tempElement);
      }
    }
  });

  copyMarkdownButton.addEventListener("click", function () {
    try {
      const markdownText = markdownEditor.value;
      copyToClipboard(markdownText);
    } catch (e) {
      console.error("Copy failed:", e);
      alert("Failed to copy Markdown: " + e.message);
    }
  });

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showCopiedMessage();
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) {
          showCopiedMessage();
        } else {
          throw new Error("Copy command was unsuccessful");
        }
      }
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Failed to copy Markdown: " + err.message);
    }
  }

  function showCopiedMessage() {
    const originalText = copyMarkdownButton.innerHTML;
    copyMarkdownButton.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';

    setTimeout(() => {
      copyMarkdownButton.innerHTML = originalText;
    }, 2000);
  }

  const dropEvents = ["dragenter", "dragover", "dragleave", "drop"];

  dropEvents.forEach((eventName) => {
    dropzone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    dropzone.classList.add("active");
  }

  function unhighlight() {
    dropzone.classList.remove("active");
  }

  dropzone.addEventListener("drop", handleDrop, false);
  dropzone.addEventListener("click", function (e) {
    if (e.target !== closeDropzoneBtn && !closeDropzoneBtn.contains(e.target)) {
      fileInput.click();
    }
  });
  closeDropzoneBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    dropzone.style.display = "none";
  });

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      const file = files[0];
      const ext = getFileExtension(file.name);
      if (SUPPORTED_EXTENSIONS[ext]) {
        importFile(file);
      } else {
        alert(`Unsupported file format: .${ext}\n\nSupported: MD, DOCX, XLSX, CSV, HTML, JSON, XML, PDF`);
      }
    }
  }

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      exportMd.click();
    }
    // Story 1.2: Only allow sync toggle shortcut when in split view
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
      e.preventDefault();
      if (currentViewMode === 'split') {
        toggleSyncScrolling();
      }
    }
    // Mermaid modal escape is handled by the unified Escape handler below
  });

  // ========================================
  // MERMAID DIAGRAM TOOLBAR
  // ========================================

  /**
   * Serialises an SVG element to a data URL suitable for use as an image source.
   * Inline styles and dimensions are preserved so the PNG matches the rendered diagram.
   */
  function svgToDataUrl(svgEl) {
    const clone = svgEl.cloneNode(true);
    // Ensure explicit width/height so the canvas has the right dimensions
    const bbox = svgEl.getBoundingClientRect();
    if (!clone.getAttribute('width')) clone.setAttribute('width', Math.round(bbox.width));
    if (!clone.getAttribute('height')) clone.setAttribute('height', Math.round(bbox.height));
    const serialized = new XMLSerializer().serializeToString(clone);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serialized);
  }

  /**
   * Renders an SVG element onto a canvas and resolves with the canvas.
   */
  function svgToCanvas(svgEl) {
    return new Promise((resolve, reject) => {
      const bbox = svgEl.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      const width = Math.max(Math.round(bbox.width), 1);
      const height = Math.max(Math.round(bbox.height), 1);

      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);

      // Fill background matching current theme using the CSS variable value
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-color').trim() || '#ffffff';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, width, height); resolve(canvas); };
      img.onerror = reject;
      img.src = svgToDataUrl(svgEl);
    });
  }

  /** Downloads the diagram in the given container as a PNG file. */
  async function downloadMermaidPng(container, btn) {
    const svgEl = container.querySelector('svg');
    if (!svgEl) return;
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    try {
      const canvas = await svgToCanvas(svgEl);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagram-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        btn.innerHTML = '<i class="bi bi-check-lg"></i>';
        setTimeout(() => { btn.innerHTML = original; }, 1500);
      }, 'image/png');
    } catch (e) {
      console.error('Mermaid PNG export failed:', e);
      btn.innerHTML = original;
    }
  }

  /** Copies the diagram in the given container as a PNG image to the clipboard. */
  async function copyMermaidImage(container, btn) {
    const svgEl = container.querySelector('svg');
    if (!svgEl) return;
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    try {
      const canvas = await svgToCanvas(svgEl);
      canvas.toBlob(async blob => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
        } catch (clipErr) {
          console.error('Clipboard write failed:', clipErr);
          btn.innerHTML = '<i class="bi bi-x-lg"></i>';
        }
        setTimeout(() => { btn.innerHTML = original; }, 1800);
      }, 'image/png');
    } catch (e) {
      console.error('Mermaid copy failed:', e);
      btn.innerHTML = original;
    }
  }

  /** Downloads the SVG source of a diagram. */
  function downloadMermaidSvg(container, btn) {
    const svgEl = container.querySelector('svg');
    if (!svgEl) return;
    const clone = svgEl.cloneNode(true);
    const serialized = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([serialized], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-lg"></i>';
    setTimeout(() => { btn.innerHTML = original; }, 1500);
  }

  // ---- Zoom modal state ----
  let modalZoomScale = 1;
  let modalPanX = 0;
  let modalPanY = 0;
  let modalIsDragging = false;
  let modalDragStart = { x: 0, y: 0 };
  let modalCurrentSvgEl = null;

  const mermaidZoomModal = document.getElementById('mermaid-zoom-modal');
  const mermaidModalDiagram = document.getElementById('mermaid-modal-diagram');

  function applyModalTransform() {
    if (modalCurrentSvgEl) {
      modalCurrentSvgEl.style.transform =
        `translate(${modalPanX}px, ${modalPanY}px) scale(${modalZoomScale})`;
    }
  }

  function closeMermaidModal() {
    if (!mermaidZoomModal.classList.contains('active')) return;
    mermaidZoomModal.classList.remove('active');
    mermaidModalDiagram.innerHTML = '';
    modalCurrentSvgEl = null;
    modalZoomScale = 1;
    modalPanX = 0;
    modalPanY = 0;
  }

  /** Opens the zoom modal with the SVG from the given container. */
  function openMermaidZoomModal(container) {
    const svgEl = container.querySelector('svg');
    if (!svgEl) return;

    mermaidModalDiagram.innerHTML = '';
    modalZoomScale = 1;
    modalPanX = 0;
    modalPanY = 0;

    const svgClone = svgEl.cloneNode(true);
    // Remove fixed dimensions so it sizes naturally inside the modal
    svgClone.removeAttribute('width');
    svgClone.removeAttribute('height');
    svgClone.style.width = 'auto';
    svgClone.style.height = 'auto';
    svgClone.style.maxWidth = '80vw';
    svgClone.style.maxHeight = '60vh';
    svgClone.style.transformOrigin = 'center';
    mermaidModalDiagram.appendChild(svgClone);
    modalCurrentSvgEl = svgClone;

    mermaidZoomModal.classList.add('active');
  }

  // Modal close button
  document.getElementById('mermaid-modal-close').addEventListener('click', closeMermaidModal);
  // Click backdrop to close
  mermaidZoomModal.addEventListener('click', function (e) {
    if (e.target === mermaidZoomModal) closeMermaidModal();
  });

  // Zoom controls
  document.getElementById('mermaid-modal-zoom-in').addEventListener('click', () => {
    modalZoomScale = Math.min(modalZoomScale + 0.25, 10);
    applyModalTransform();
  });
  document.getElementById('mermaid-modal-zoom-out').addEventListener('click', () => {
    modalZoomScale = Math.max(modalZoomScale - 0.25, 0.1);
    applyModalTransform();
  });
  document.getElementById('mermaid-modal-zoom-reset').addEventListener('click', () => {
    modalZoomScale = 1; modalPanX = 0; modalPanY = 0;
    applyModalTransform();
  });

  // Mouse-wheel zoom inside modal
  mermaidModalDiagram.addEventListener('wheel', function (e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    modalZoomScale = Math.min(Math.max(modalZoomScale + delta, 0.1), 10);
    applyModalTransform();
  }, { passive: false });

  // Drag to pan inside modal
  mermaidModalDiagram.addEventListener('mousedown', function (e) {
    modalIsDragging = true;
    modalDragStart = { x: e.clientX - modalPanX, y: e.clientY - modalPanY };
    mermaidModalDiagram.classList.add('dragging');
  });
  document.addEventListener('mousemove', function (e) {
    if (!modalIsDragging) return;
    modalPanX = e.clientX - modalDragStart.x;
    modalPanY = e.clientY - modalDragStart.y;
    applyModalTransform();
  });
  document.addEventListener('mouseup', function () {
    if (modalIsDragging) {
      modalIsDragging = false;
      mermaidModalDiagram.classList.remove('dragging');
    }
  });

  // Modal download buttons (operate on the currently displayed SVG)
  document.getElementById('mermaid-modal-download-png').addEventListener('click', async function () {
    if (!modalCurrentSvgEl) return;
    const btn = this;
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    try {
      // Use the original SVG (with dimensions) for proper PNG rendering
      const canvas = await svgToCanvas(modalCurrentSvgEl);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `diagram-${Date.now()}.png`; a.click();
        URL.revokeObjectURL(url);
        btn.innerHTML = '<i class="bi bi-check-lg"></i>';
        setTimeout(() => { btn.innerHTML = original; }, 1500);
      }, 'image/png');
    } catch (e) {
      console.error('Modal PNG export failed:', e);
      btn.innerHTML = original;
    }
  });

  document.getElementById('mermaid-modal-copy').addEventListener('click', async function () {
    if (!modalCurrentSvgEl) return;
    const btn = this;
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    try {
      const canvas = await svgToCanvas(modalCurrentSvgEl);
      canvas.toBlob(async blob => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
        } catch (clipErr) {
          console.error('Clipboard write failed:', clipErr);
          btn.innerHTML = '<i class="bi bi-x-lg"></i>';
        }
        setTimeout(() => { btn.innerHTML = original; }, 1800);
      }, 'image/png');
    } catch (e) {
      console.error('Modal copy failed:', e);
      btn.innerHTML = original;
    }
  });

  document.getElementById('mermaid-modal-download-svg').addEventListener('click', function () {
    if (!modalCurrentSvgEl) return;
    const serialized = new XMLSerializer().serializeToString(modalCurrentSvgEl);
    const blob = new Blob([serialized], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `diagram-${Date.now()}.svg`; a.click();
    URL.revokeObjectURL(url);
  });

  /**
   * Adds the hover toolbar to every rendered Mermaid container.
   * Safe to call multiple times – existing toolbars are not duplicated.
   */
  function addMermaidToolbars() {
    markdownPreview.querySelectorAll('.mermaid-container').forEach(container => {
      if (container.querySelector('.mermaid-toolbar')) return; // already added
      const svgEl = container.querySelector('svg');
      if (!svgEl) return; // diagram not yet rendered

      const toolbar = document.createElement('div');
      toolbar.className = 'mermaid-toolbar';
      toolbar.setAttribute('aria-label', 'Diagram actions');

      const btnZoom = document.createElement('button');
      btnZoom.className = 'mermaid-toolbar-btn';
      btnZoom.title = 'Zoom diagram';
      btnZoom.setAttribute('aria-label', 'Zoom diagram');
      btnZoom.innerHTML = '<i class="bi bi-arrows-fullscreen"></i>';
      btnZoom.addEventListener('click', () => openMermaidZoomModal(container));

      const btnPng = document.createElement('button');
      btnPng.className = 'mermaid-toolbar-btn';
      btnPng.title = 'Download PNG';
      btnPng.setAttribute('aria-label', 'Download PNG');
      btnPng.innerHTML = '<i class="bi bi-file-image"></i> PNG';
      btnPng.addEventListener('click', () => downloadMermaidPng(container, btnPng));

      const btnCopy = document.createElement('button');
      btnCopy.className = 'mermaid-toolbar-btn';
      btnCopy.title = 'Copy image to clipboard';
      btnCopy.setAttribute('aria-label', 'Copy image to clipboard');
      btnCopy.innerHTML = '<i class="bi bi-clipboard-image"></i> Copy';
      btnCopy.addEventListener('click', () => copyMermaidImage(container, btnCopy));

      const btnSvg = document.createElement('button');
      btnSvg.className = 'mermaid-toolbar-btn';
      btnSvg.title = 'Download SVG';
      btnSvg.setAttribute('aria-label', 'Download SVG');
      btnSvg.innerHTML = '<i class="bi bi-filetype-svg"></i> SVG';
      btnSvg.addEventListener('click', () => downloadMermaidSvg(container, btnSvg));

      toolbar.appendChild(btnZoom);
      toolbar.appendChild(btnCopy);
      toolbar.appendChild(btnPng);
      toolbar.appendChild(btnSvg);
      container.appendChild(toolbar);
    });
  }

  // ========================================
  // EXECUTABLE CODE BLOCKS (just-bash)
  // ========================================

  let _sharedBashInstance = null;
  let _justBashReady = !!window.JustBash;

  if (!_justBashReady) {
    window.addEventListener('just-bash-ready', () => { _justBashReady = true; }, { once: true });
  }

  function getSharedBash() {
    if (!_justBashReady || !window.JustBash) return null;
    if (!_sharedBashInstance) {
      _sharedBashInstance = new window.JustBash();
    }
    return _sharedBashInstance;
  }

  /**
   * Adds Run and Copy toolbar buttons to every executable code block container.
   * Safe to call multiple times — existing toolbars are not duplicated.
   */
  function addCodeBlockToolbars() {
    markdownPreview.querySelectorAll('.executable-code-container').forEach(container => {
      if (container.querySelector('.code-block-toolbar')) return; // already added

      const toolbar = document.createElement('div');
      toolbar.className = 'code-block-toolbar';
      toolbar.setAttribute('aria-label', 'Code block actions');

      // Run button
      const btnRun = document.createElement('button');
      btnRun.className = 'code-toolbar-btn code-run-btn';
      btnRun.title = 'Run in sandboxed bash';
      btnRun.setAttribute('aria-label', 'Run code');
      btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
      btnRun.addEventListener('click', () => executeCodeBlock(container, btnRun));

      // Copy button
      const btnCopy = document.createElement('button');
      btnCopy.className = 'code-toolbar-btn code-copy-btn';
      btnCopy.title = 'Copy code';
      btnCopy.setAttribute('aria-label', 'Copy code');
      btnCopy.innerHTML = '<i class="bi bi-clipboard"></i>';
      btnCopy.addEventListener('click', () => {
        const codeEl = container.querySelector('code');
        if (!codeEl) return;
        navigator.clipboard.writeText(codeEl.textContent).then(() => {
          btnCopy.innerHTML = '<i class="bi bi-check-lg"></i>';
          setTimeout(() => { btnCopy.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
        }).catch(() => {
          btnCopy.innerHTML = '<i class="bi bi-x-lg"></i>';
          setTimeout(() => { btnCopy.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
        });
      });

      toolbar.appendChild(btnRun);
      toolbar.appendChild(btnCopy);
      container.insertBefore(toolbar, container.firstChild);
    });
  }

  /**
   * Executes the code inside an executable-code-container using just-bash.
   */
  async function executeCodeBlock(container, btnRun) {
    const codeEl = container.querySelector('code');
    if (!codeEl) return;
    const code = codeEl.textContent;

    // Create or find the output container
    let outputEl = container.querySelector('.code-output');
    if (!outputEl) {
      outputEl = document.createElement('div');
      outputEl.className = 'code-output';
      container.appendChild(outputEl);
    }

    // Check if just-bash is loaded
    if (!_justBashReady || !window.JustBash) {
      outputEl.innerHTML = '<span class="code-output-error">⏳ just-bash is still loading. Please try again in a moment.</span>';
      outputEl.style.display = 'block';
      return;
    }

    // Show loading state
    btnRun.disabled = true;
    btnRun.innerHTML = '<i class="bi bi-hourglass-split"></i> Running...';
    outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> Executing...</span>';
    outputEl.style.display = 'block';

    try {
      const bash = getSharedBash();
      const result = await bash.exec(code);

      let outputHtml = '';
      if (result.stdout) {
        outputHtml += '<span class="code-output-stdout">' + escapeHtml(result.stdout) + '</span>';
      }
      if (result.stderr) {
        outputHtml += '<span class="code-output-stderr">' + escapeHtml(result.stderr) + '</span>';
      }
      if (!result.stdout && !result.stderr) {
        outputHtml = '<span class="code-output-muted">(no output)</span>';
      }

      // Exit code indicator
      if (result.exitCode !== 0) {
        outputHtml += '<span class="code-output-exit">Exit code: ' + result.exitCode + '</span>';
      }

      outputEl.innerHTML = outputHtml;
    } catch (err) {
      outputEl.innerHTML = '<span class="code-output-error">Error: ' + escapeHtml(err.message) + '</span>';
    } finally {
      btnRun.disabled = false;
      btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
    }
  }

  // Helper to escape HTML in output
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ========================================
  // FEATURE 15: HEADING ANCHOR LINKS
  // ========================================

  function addHeadingAnchors(container) {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const usedIds = new Set();
    headings.forEach(heading => {
      if (heading.querySelector('.heading-anchor')) return;
      let id = heading.id;
      if (!id) {
        id = heading.textContent.trim().toLowerCase()
          .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      }
      // Deduplicate IDs
      let uniqueId = id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = id + '-' + counter;
        counter++;
      }
      usedIds.add(uniqueId);
      heading.id = uniqueId;

      const anchor = document.createElement('a');
      anchor.className = 'heading-anchor';
      anchor.href = '#' + uniqueId;
      anchor.textContent = '🔗';
      anchor.setAttribute('aria-label', 'Link to ' + heading.textContent);
      heading.prepend(anchor);
    });
  }

  // ========================================
  // FEATURE 14: CALLOUTS / ADMONITIONS
  // ========================================

  const CALLOUT_CONFIG = {
    NOTE: { icon: 'bi-info-circle-fill', cls: 'note' },
    TIP: { icon: 'bi-lightbulb-fill', cls: 'tip' },
    IMPORTANT: { icon: 'bi-exclamation-diamond-fill', cls: 'important' },
    WARNING: { icon: 'bi-exclamation-triangle-fill', cls: 'warning' },
    CAUTION: { icon: 'bi-x-octagon-fill', cls: 'caution' }
  };

  function processCallouts(container) {
    const blockquotes = container.querySelectorAll('blockquote');
    blockquotes.forEach(bq => {
      const firstP = bq.querySelector('p');
      if (!firstP) return;
      const text = firstP.innerHTML;
      const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i);
      if (!match) return;

      const type = match[1].toUpperCase();
      const config = CALLOUT_CONFIG[type];
      if (!config) return;

      // Remove the [!TYPE] prefix from the first paragraph
      firstP.innerHTML = text.replace(match[0], '');

      // Build callout div
      const callout = document.createElement('div');
      callout.className = `markdown-callout callout-${config.cls}`;

      const title = document.createElement('div');
      title.className = 'callout-title';
      title.innerHTML = `<i class="bi ${config.icon}"></i> ${type.charAt(0) + type.slice(1).toLowerCase()}`;
      callout.appendChild(title);

      // Move blockquote children into callout
      while (bq.firstChild) {
        callout.appendChild(bq.firstChild);
      }
      bq.replaceWith(callout);
    });
  }

  // ========================================
  // FEATURE 13: FOOTNOTES
  // ========================================

  function processFootnotes(container, rawMarkdown) {
    // Find footnote definitions: [^id]: content
    const defRegex = /^\[\^(\w+)\]:\s*(.+)$/gm;
    const definitions = {};
    let defMatch;
    while ((defMatch = defRegex.exec(rawMarkdown)) !== null) {
      definitions[defMatch[1]] = defMatch[2];
    }

    if (Object.keys(definitions).length === 0) return;

    // Find and replace footnote references [^id] in the rendered HTML
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.includes('[^')) {
        let parent = node.parentNode;
        let isInCode = false;
        while (parent && parent !== container) {
          if (parent.tagName === 'PRE' || parent.tagName === 'CODE') { isInCode = true; break; }
          parent = parent.parentNode;
        }
        if (!isInCode) textNodes.push(node);
      }
    }

    let footnoteIndex = 0;
    const usedFootnotes = [];
    const usedFootnoteIds = new Set();

    textNodes.forEach(textNode => {
      const text = textNode.nodeValue;
      const refRegex = /\[\^(\w+)\]/g;
      let match;
      let lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let hasRefs = false;

      while ((match = refRegex.exec(text)) !== null) {
        const id = match[1];
        if (!definitions[id]) continue;
        hasRefs = true;
        // Only assign a new index if this footnote hasn't been used yet
        let fnIndex;
        if (usedFootnoteIds.has(id)) {
          fnIndex = usedFootnotes.find(fn => fn.id === id).index;
        } else {
          footnoteIndex++;
          fnIndex = footnoteIndex;
          usedFootnoteIds.add(id);
          usedFootnotes.push({ id, index: fnIndex, content: definitions[id] });
        }

        // Text before the reference
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
        }

        // Create superscript link
        const sup = document.createElement('a');
        sup.className = 'footnote-ref';
        sup.href = '#fn-' + id;
        sup.id = 'fnref-' + id + '-' + fnIndex;
        sup.textContent = '[' + fnIndex + ']';
        sup.title = definitions[id];
        fragment.appendChild(sup);

        lastIndex = refRegex.lastIndex;
      }

      if (hasRefs) {
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
        textNode.parentNode.replaceChild(fragment, textNode);
      }
    });

    // Remove footnote definition paragraphs from the rendered output
    container.querySelectorAll('p').forEach(p => {
      if (/^\[\^\w+\]:\s*.+/.test(p.textContent.trim())) {
        p.remove();
      }
    });

    // Append footnotes section
    if (usedFootnotes.length > 0) {
      const section = document.createElement('section');
      section.className = 'footnotes-section';
      section.innerHTML = '<div class="footnote-title">Footnotes</div>';
      usedFootnotes.forEach(fn => {
        const item = document.createElement('div');
        item.className = 'footnote-item';
        item.id = 'fn-' + fn.id;
        item.innerHTML = `<span class="footnote-number">${fn.index}.</span>
          <span>${fn.content} <a class="footnote-backref" href="#fnref-${fn.id}" title="Back to reference">↩</a></span>`;
        section.appendChild(item);
      });
      container.appendChild(section);
    }
  }

  // ========================================
  // FEATURE 5: AUTO-SAVE TO LOCALSTORAGE
  // ========================================

  const AUTOSAVE_KEY = 'md-viewer-autosave';
  const AUTOSAVE_TIME_KEY = 'md-viewer-autosave-time';
  const AUTOSAVE_DELAY = 1000;
  let autosaveTimeout = null;
  const autosaveIndicator = document.getElementById('autosave-indicator');
  const autosaveText = document.getElementById('autosave-text');

  function saveToLocalStorage() {
    try {
      localStorage.setItem(AUTOSAVE_KEY, markdownEditor.value);
      localStorage.setItem(AUTOSAVE_TIME_KEY, Date.now().toString());
      showAutosaveIndicator();
    } catch (e) {
      console.warn('Auto-save failed:', e);
    }
  }

  function showAutosaveIndicator() {
    if (autosaveIndicator) {
      autosaveIndicator.style.display = 'flex';
      autosaveText.textContent = 'Saved';
    }
  }

  function restoreFromLocalStorage() {
    // Don't restore if loading a shared document (URL or Firebase)
    const hash = window.location.hash;
    if (hash && (hash.includes('d=') || hash.includes('id=')) && hash.includes('k=')) return false;

    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved && saved.trim()) {
      markdownEditor.value = saved;
      const savedTime = localStorage.getItem(AUTOSAVE_TIME_KEY);
      if (savedTime) {
        const elapsed = Date.now() - parseInt(savedTime);
        const seconds = Math.floor(elapsed / 1000);
        if (seconds < 60) autosaveText.textContent = `Saved ${seconds}s ago`;
        else if (seconds < 3600) autosaveText.textContent = `Saved ${Math.floor(seconds / 60)}m ago`;
        else autosaveText.textContent = `Saved ${Math.floor(seconds / 3600)}h ago`;
        autosaveIndicator.style.display = 'flex';
      }
      return true;
    }
    return false;
  }

  function debouncedAutosave() {
    clearTimeout(autosaveTimeout);
    autosaveTimeout = setTimeout(saveToLocalStorage, AUTOSAVE_DELAY);
    // Also schedule cloud save
    scheduleCloudSave();
  }

  // Hook autosave into editor input
  markdownEditor.addEventListener('input', debouncedAutosave);

  // ========================================
  // FEATURE 5b: CLOUD AUTO-SAVE TO FIREBASE
  // ========================================

  const CLOUD_SAVE_INTERVAL = 60000; // 60 seconds
  const CLOUD_DOC_KEY = 'md-viewer-cloud-doc-id';
  const CLOUD_KEY_KEY = 'md-viewer-cloud-enc-key';
  let cloudSaveTimer = null;
  let cloudSaveDirty = false;
  let lastCloudContent = '';

  function scheduleCloudSave() {
    cloudSaveDirty = true;
    if (!cloudSaveTimer) {
      cloudSaveTimer = setInterval(cloudAutoSave, CLOUD_SAVE_INTERVAL);
    }
  }

  async function cloudAutoSave() {
    // Skip if no changes, no db, editor empty, or viewing a shared doc
    if (!cloudSaveDirty || typeof db === 'undefined') return;
    const content = markdownEditor.value;
    if (!content.trim() || content === lastCloudContent) {
      cloudSaveDirty = false;
      return;
    }

    // Don't cloud-save if in read-only shared-view mode
    if (markdownEditor.readOnly) return;

    // Don't cloud-save if we're just viewing someone else's shared content
    const hash = window.location.hash;
    if (hash && (hash.includes('id=') || hash.includes('d=')) && !localStorage.getItem(CLOUD_DOC_KEY)) return;

    try {
      // Compress & encrypt
      const compressed = compressData(content);

      // Reuse existing key or generate new one
      let key;
      const savedKeyStr = localStorage.getItem(CLOUD_KEY_KEY);
      if (savedKeyStr) {
        key = await base64UrlToKey(savedKeyStr);
      } else {
        key = await generateEncryptionKey();
        const keyStr = await keyToBase64Url(key);
        localStorage.setItem(CLOUD_KEY_KEY, keyStr);
      }

      const encrypted = await encryptData(key, compressed);
      const dataString = uint8ArrayToBase64Url(encrypted);
      const keyString = await keyToBase64Url(key);

      // Reuse existing doc or create new one
      const existingDocId = localStorage.getItem(CLOUD_DOC_KEY);

      if (existingDocId) {
        // Update existing doc
        await db.collection('shares').doc(existingDocId).set({
          d: dataString,
          t: Date.now()
        });
      } else {
        // Create new doc
        const docRef = await db.collection('shares').add({
          d: dataString,
          t: Date.now()
        });
        localStorage.setItem(CLOUD_DOC_KEY, docRef.id);
      }

      // Update browser URL (preserves the same link)
      const docId = existingDocId || localStorage.getItem(CLOUD_DOC_KEY);
      const shareUrl = `#id=${docId}&k=${keyString}`;
      if (window.location.hash !== shareUrl) {
        history.replaceState(null, '', shareUrl);
      }

      lastCloudContent = content;
      cloudSaveDirty = false;

      // Update indicator
      if (autosaveText) {
        autosaveText.textContent = '☁️ Synced';
        setTimeout(() => {
          if (autosaveText.textContent === '☁️ Synced') {
            autosaveText.textContent = 'Saved';
          }
        }, 3000);
      }

      console.log('☁️ Cloud auto-saved to Firebase:', docId);

    } catch (e) {
      console.warn('Cloud auto-save failed:', e);
      // Silently fail — local save is still active
    }
  }

  // ========================================
  // FEATURE 12: IMAGE PASTE FROM CLIPBOARD
  // ========================================

  markdownEditor.addEventListener('paste', function (e) {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image/') === 0) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = function (event) {
          const base64 = event.target.result;
          const markdown = `![pasted image](${base64})`;
          insertAtCursor(markdown);
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
  });

  // ========================================
  // FEATURE 3: FORMATTING TOOLBAR HELPERS
  // ========================================

  function wrapSelection(before, after, placeholder) {
    const start = markdownEditor.selectionStart;
    const end = markdownEditor.selectionEnd;
    const text = markdownEditor.value;
    const selected = text.substring(start, end) || placeholder || '';

    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    markdownEditor.value = newText;

    // Position cursor: select the placeholder or place after
    if (start === end && placeholder) {
      markdownEditor.selectionStart = start + before.length;
      markdownEditor.selectionEnd = start + before.length + placeholder.length;
    } else {
      markdownEditor.selectionStart = start + before.length;
      markdownEditor.selectionEnd = start + before.length + selected.length;
    }

    markdownEditor.focus();
    markdownEditor.dispatchEvent(new Event('input'));
  }

  function insertAtCursor(text) {
    const start = markdownEditor.selectionStart;
    const end = markdownEditor.selectionEnd;
    const value = markdownEditor.value;

    markdownEditor.value = value.substring(0, start) + text + value.substring(end);
    markdownEditor.selectionStart = markdownEditor.selectionEnd = start + text.length;
    markdownEditor.focus();
    markdownEditor.dispatchEvent(new Event('input'));
  }

  function insertLinePrefix(prefix, placeholder) {
    const start = markdownEditor.selectionStart;
    const end = markdownEditor.selectionEnd;
    const text = markdownEditor.value;

    // Find the beginning of the current line
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = text.indexOf('\n', end);
    const actualEnd = lineEnd === -1 ? text.length : lineEnd;
    const selectedLines = text.substring(lineStart, actualEnd);

    // Add prefix to each line
    const prefixed = selectedLines.split('\n').map(line => prefix + line).join('\n');
    markdownEditor.value = text.substring(0, lineStart) + prefixed + text.substring(actualEnd);

    markdownEditor.selectionStart = lineStart;
    markdownEditor.selectionEnd = lineStart + prefixed.length;
    markdownEditor.focus();
    markdownEditor.dispatchEvent(new Event('input'));
  }

  // --- Custom Undo/Redo Stack (replaces deprecated document.execCommand) ---
  const undoStack = [];
  const redoStack = [];
  const MAX_UNDO_HISTORY = 100;
  let lastUndoSnapshot = markdownEditor.value;

  function pushUndoState() {
    const currentValue = markdownEditor.value;
    if (currentValue === lastUndoSnapshot) return;
    undoStack.push(lastUndoSnapshot);
    if (undoStack.length > MAX_UNDO_HISTORY) undoStack.shift();
    redoStack.length = 0; // Clear redo on new edit
    lastUndoSnapshot = currentValue;
  }

  function performUndo() {
    if (undoStack.length === 0) return;
    redoStack.push(markdownEditor.value);
    const prev = undoStack.pop();
    markdownEditor.value = prev;
    lastUndoSnapshot = prev;
    markdownEditor.dispatchEvent(new Event('input'));
  }

  function performRedo() {
    if (redoStack.length === 0) return;
    undoStack.push(markdownEditor.value);
    const next = redoStack.pop();
    markdownEditor.value = next;
    lastUndoSnapshot = next;
    markdownEditor.dispatchEvent(new Event('input'));
  }

  // Capture undo state on each input
  markdownEditor.addEventListener('input', pushUndoState);

  // Formatting toolbar action handler
  const FORMATTING_ACTIONS = {
    bold: () => wrapSelection('**', '**', 'bold text'),
    italic: () => wrapSelection('*', '*', 'italic text'),
    strikethrough: () => wrapSelection('~~', '~~', 'strikethrough'),
    heading: () => insertLinePrefix('## ', ''),
    link: () => wrapSelection('[', '](url)', 'link text'),
    image: () => insertAtCursor('![alt text](image-url)'),
    code: () => wrapSelection('`', '`', 'code'),
    codeblock: () => wrapSelection('\n```\n', '\n```\n', 'code block'),
    ul: () => insertLinePrefix('- ', ''),
    ol: () => insertLinePrefix('1. ', ''),
    tasklist: () => insertLinePrefix('- [ ] ', ''),
    quote: () => insertLinePrefix('> ', ''),
    hr: () => insertAtCursor('\n---\n'),
    table: () => insertAtCursor('\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n'),
    undo: () => { markdownEditor.focus(); performUndo(); },
    redo: () => { markdownEditor.focus(); performRedo(); }
  };

  // Wire up formatting toolbar buttons
  document.querySelectorAll('.fmt-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const action = this.getAttribute('data-action');
      if (FORMATTING_ACTIONS[action]) {
        FORMATTING_ACTIONS[action]();
      }
    });
  });

  // ========================================
  // FEATURE 3: KEYBOARD SHORTCUTS
  // ========================================

  markdownEditor.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey || e.metaKey)) return;

    if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      if (e.shiftKey) {
        performRedo();
      } else {
        performUndo();
      }
    } else if (e.key === 'y' || e.key === 'Y') {
      e.preventDefault();
      performRedo();
    } else if (e.key === 'b' || e.key === 'B') {
      e.preventDefault();
      FORMATTING_ACTIONS.bold();
    } else if (e.key === 'i' || e.key === 'I') {
      e.preventDefault();
      FORMATTING_ACTIONS.italic();
    } else if (e.key === 'k' || e.key === 'K') {
      e.preventDefault();
      if (e.shiftKey) {
        FORMATTING_ACTIONS.image();
      } else {
        FORMATTING_ACTIONS.link();
      }
    }
  });

  // ========================================
  // FEATURE 1: FIND & REPLACE
  // ========================================

  const findReplaceBar = document.getElementById('find-replace-bar');
  const findInput = document.getElementById('find-input');
  const replaceInput = document.getElementById('replace-input');
  const findRegexToggle = document.getElementById('find-regex-toggle');
  const findMatchCount = document.getElementById('find-match-count');
  const findPrevBtn = document.getElementById('find-prev');
  const findNextBtn = document.getElementById('find-next');
  const replaceOneBtn = document.getElementById('replace-one');
  const replaceAllBtn = document.getElementById('replace-all');
  const findCloseBtn = document.getElementById('find-close');

  let findMatches = [];
  let findCurrentIndex = -1;
  let findRegexMode = false;

  function openFindBar() {
    findReplaceBar.style.display = 'block';
    findInput.focus();
    const selected = markdownEditor.value.substring(markdownEditor.selectionStart, markdownEditor.selectionEnd);
    if (selected) findInput.value = selected;
    performFind();
  }

  function closeFindBar() {
    findReplaceBar.style.display = 'none';
    findMatches = [];
    findCurrentIndex = -1;
    findMatchCount.textContent = '0 results';
    markdownEditor.focus();
  }

  function performFind() {
    const query = findInput.value;
    if (!query) {
      findMatches = [];
      findCurrentIndex = -1;
      findMatchCount.textContent = '0 results';
      return;
    }

    const text = markdownEditor.value;
    findMatches = [];

    try {
      if (findRegexMode) {
        // Safety: test regex with a small string first to detect catastrophic backtracking
        const regex = new RegExp(query, 'gi');
        // Quick sanity test — abort if this tiny match takes too long
        const testStr = text.substring(0, Math.min(text.length, 1000));
        regex.exec(testStr);
        // Reset regex state and run on full text
        regex.lastIndex = 0;
        let m;
        while ((m = regex.exec(text)) !== null) {
          findMatches.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
          if (m[0].length === 0) { regex.lastIndex++; } // Prevent infinite loop on zero-length matches
          if (findMatches.length > 10000) break;
        }
      } else {
        const lowerQuery = query.toLowerCase();
        const lowerText = text.toLowerCase();
        let pos = 0;
        while ((pos = lowerText.indexOf(lowerQuery, pos)) !== -1) {
          findMatches.push({ start: pos, end: pos + query.length, text: text.substring(pos, pos + query.length) });
          pos += query.length;
          if (findMatches.length > 10000) break;
        }
      }
    } catch (e) {
      findMatchCount.textContent = 'Invalid regex';
      return;
    }

    findMatchCount.textContent = findMatches.length + ' result' + (findMatches.length !== 1 ? 's' : '');

    if (findMatches.length > 0) {
      // Find closest match to cursor
      const cursor = markdownEditor.selectionStart;
      findCurrentIndex = 0;
      for (let i = 0; i < findMatches.length; i++) {
        if (findMatches[i].start >= cursor) { findCurrentIndex = i; break; }
      }
      selectMatch(findCurrentIndex);
    } else {
      findCurrentIndex = -1;
    }
  }

  function selectMatch(index) {
    if (index < 0 || index >= findMatches.length) return;
    findCurrentIndex = index;
    const match = findMatches[index];
    markdownEditor.focus();
    markdownEditor.setSelectionRange(match.start, match.end);

    // Scroll to selection
    const lineHeight = parseInt(getComputedStyle(markdownEditor).lineHeight) || 20;
    const linesBefore = markdownEditor.value.substring(0, match.start).split('\n').length;
    markdownEditor.scrollTop = Math.max(0, (linesBefore - 3) * lineHeight);

    findMatchCount.textContent = `${index + 1} / ${findMatches.length}`;
  }

  function findNext() {
    if (findMatches.length === 0) return;
    selectMatch((findCurrentIndex + 1) % findMatches.length);
  }

  function findPrev() {
    if (findMatches.length === 0) return;
    selectMatch((findCurrentIndex - 1 + findMatches.length) % findMatches.length);
  }

  function replaceOne() {
    if (findCurrentIndex < 0 || findCurrentIndex >= findMatches.length) return;
    const match = findMatches[findCurrentIndex];
    const text = markdownEditor.value;
    markdownEditor.value = text.substring(0, match.start) + replaceInput.value + text.substring(match.end);
    markdownEditor.dispatchEvent(new Event('input'));
    performFind();
  }

  function escapeRegExpChars(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function replaceAll() {
    const query = findInput.value;
    const replacement = replaceInput.value;
    if (!query) return;

    let text = markdownEditor.value;
    try {
      if (findRegexMode) {
        text = text.replace(new RegExp(query, 'gi'), replacement);
      } else {
        // Use case-insensitive replace to match the case-insensitive find
        text = text.replace(new RegExp(escapeRegExpChars(query), 'gi'), replacement);
      }
    } catch (e) { return; }

    markdownEditor.value = text;
    markdownEditor.dispatchEvent(new Event('input'));
    performFind();
  }

  // Wire up find & replace events
  findInput.addEventListener('input', performFind);
  findNextBtn.addEventListener('click', findNext);
  findPrevBtn.addEventListener('click', findPrev);
  replaceOneBtn.addEventListener('click', replaceOne);
  replaceAllBtn.addEventListener('click', replaceAll);
  findCloseBtn.addEventListener('click', closeFindBar);

  findRegexToggle.addEventListener('click', function () {
    findRegexMode = !findRegexMode;
    this.classList.toggle('active', findRegexMode);
    performFind();
  });

  findInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) findPrev(); else findNext();
    }
    if (e.key === 'Escape') closeFindBar();
  });

  replaceInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeFindBar();
  });

  // ========================================
  // FEATURE 4: TABLE OF CONTENTS
  // ========================================

  const tocPanelEl = document.getElementById('toc-panel');
  const tocNavEl = document.getElementById('toc-nav');
  const tocToggleBtn = document.getElementById('toc-toggle');
  const tocCloseBtn = document.getElementById('toc-close');
  let tocObserver = null;

  function buildTOC() {
    if (!tocNavEl) return;
    tocNavEl.innerHTML = '';
    const headings = markdownPreview.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      tocNavEl.innerHTML = '<div style="padding:12px;font-size:13px;opacity:0.6">No headings found</div>';
      return;
    }

    headings.forEach((heading, i) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (!heading.id) {
        heading.id = 'heading-' + i;
      }

      const item = document.createElement('a');
      item.className = 'toc-item';
      item.setAttribute('data-level', level);
      item.textContent = heading.textContent.replace('🔗', '').trim();
      item.href = '#' + heading.id;
      item.addEventListener('click', function (e) {
        e.preventDefault();
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      tocNavEl.appendChild(item);
    });

    // Set up IntersectionObserver for active heading tracking
    if (tocObserver) tocObserver.disconnect();
    tocObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocNavEl.querySelectorAll('.toc-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { root: previewPane, rootMargin: '0px 0px -80% 0px', threshold: 0 });

    headings.forEach(h => tocObserver.observe(h));
  }

  function toggleTOC() {
    const isVisible = tocPanelEl.style.display !== 'none';
    tocPanelEl.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) buildTOC();
  }

  if (tocToggleBtn) tocToggleBtn.addEventListener('click', toggleTOC);
  if (tocCloseBtn) tocCloseBtn.addEventListener('click', () => { tocPanelEl.style.display = 'none'; });

  // ========================================
  // FEATURE 9: ZEN MODE
  // ========================================

  const zenModeBtn = document.getElementById('zen-mode-button');
  const zenExitHint = document.getElementById('zen-exit-hint');
  let isZenMode = false;

  function toggleZenMode() {
    isZenMode = !isZenMode;
    document.body.classList.toggle('zen-mode', isZenMode);
    // In preview mode, use a different zen class so preview pane stays visible
    document.body.classList.toggle('zen-mode-preview', isZenMode && currentViewMode === 'preview');

    if (isZenMode) {
      // Close AI panel if open
      if (aiPanelOpen) closeAiPanel();
      zenExitHint.style.display = 'block';
      setTimeout(() => { zenExitHint.style.display = 'none'; }, 4000);
      try { document.documentElement.requestFullscreen(); } catch (e) { /* ignore */ }
    } else {
      document.body.classList.remove('zen-mode-preview');
      zenExitHint.style.display = 'none';
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { /* ignore */ }
    }
  }

  if (zenModeBtn) zenModeBtn.addEventListener('click', toggleZenMode);

  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && isZenMode) {
      isZenMode = false;
      document.body.classList.remove('zen-mode');
      document.body.classList.remove('zen-mode-preview');
      zenExitHint.style.display = 'none';
    }
  });

  // ========================================
  // FEATURE 11: SLIDE / PRESENTATION MODE
  // ========================================

  const slideContainer = document.getElementById('slide-container');
  const slideBody = document.getElementById('slide-body');
  const slideCounter = document.getElementById('slide-counter');
  const slidePrevBtn = document.getElementById('slide-prev');
  const slideNextBtn = document.getElementById('slide-next');
  const slideExitBtn = document.getElementById('slide-exit');
  const presentBtn = document.getElementById('present-button');
  let slides = [];
  let currentSlide = 0;

  function parseSlides(markdown) {
    // Split on horizontal rules (--- or *** or ___ on their own line)
    return markdown.split(/\n(?:---|\*\*\*|___)\n/).map(s => s.trim()).filter(s => s.length > 0);
  }

  function renderSlide(index) {
    if (index < 0 || index >= slides.length) return;
    currentSlide = index;
    const html = marked.parse(slides[index]);
    const sanitized = DOMPurify.sanitize(html, {
      ADD_TAGS: ['mjx-container'],
      ADD_ATTR: ['id', 'class']
    });
    slideBody.innerHTML = sanitized;
    processEmojis(slideBody);
    addHeadingAnchors(slideBody);
    processCallouts(slideBody);

    // Render mermaid if present
    const mermaidNodes = slideBody.querySelectorAll('.mermaid');
    if (mermaidNodes.length > 0) {
      try { mermaid.run({ nodes: mermaidNodes, suppressErrors: true }); } catch (e) { }
    }

    // Render MathJax if present
    if (window.MathJax) {
      try { MathJax.typesetPromise([slideBody]); } catch (e) { }
    }

    slideCounter.textContent = (index + 1) + ' / ' + slides.length;
    slidePrevBtn.disabled = index === 0;
    slideNextBtn.disabled = index === slides.length - 1;
  }

  function startPresentation() {
    const md = markdownEditor.value;
    slides = parseSlides(md);
    if (slides.length === 0) {
      alert('No slides found. Use --- (horizontal rule) to separate slides.');
      return;
    }
    currentSlide = 0;
    slideContainer.style.display = 'flex';
    renderSlide(0);
    try { document.documentElement.requestFullscreen(); } catch (e) { /* ignore */ }
  }

  function exitPresentation() {
    slideContainer.style.display = 'none';
    slides = [];
    currentSlide = 0;
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { /* ignore */ }
  }

  if (presentBtn) presentBtn.addEventListener('click', startPresentation);
  if (slideExitBtn) slideExitBtn.addEventListener('click', exitPresentation);
  if (slidePrevBtn) slidePrevBtn.addEventListener('click', () => renderSlide(currentSlide - 1));
  if (slideNextBtn) slideNextBtn.addEventListener('click', () => renderSlide(currentSlide + 1));

  // Keyboard nav for slides
  document.addEventListener('keydown', function (e) {
    if (slideContainer.style.display === 'none') return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      renderSlide(currentSlide + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      renderSlide(currentSlide - 1);
    }
    // Escape for presentation is handled by the unified Escape handler below
  });

  // Handle fullscreen exit while in presentation mode
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && slideContainer.style.display !== 'none') {
      exitPresentation();
    }
  });

  // ========================================
  // FEATURE 16: CUSTOM PREVIEW THEMES
  // ========================================

  const savedPreviewTheme = localStorage.getItem('md-viewer-preview-theme') || 'github';
  document.documentElement.setAttribute('data-preview-theme', savedPreviewTheme);

  // Mark the active theme in the dropdown
  function updateThemeDropdown(themeName) {
    document.querySelectorAll('.theme-option').forEach(opt => {
      opt.classList.toggle('active-theme', opt.getAttribute('data-theme-name') === themeName);
    });
  }
  updateThemeDropdown(savedPreviewTheme);

  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', function () {
      const themeName = this.getAttribute('data-theme-name');
      document.documentElement.setAttribute('data-preview-theme', themeName);
      localStorage.setItem('md-viewer-preview-theme', themeName);
      updateThemeDropdown(themeName);
      renderMarkdown(); // Re-render to apply theme-specific styles
    });
  });

  // ========================================
  // FEATURE 5: RESTORE AUTO-SAVED CONTENT
  // ========================================

  // Restore auto-saved content (overrides sample if available)
  const wasRestored = restoreFromLocalStorage();
  if (wasRestored) {
    renderMarkdown();
  }

  // ========================================
  // FIND & REPLACE KEYBOARD SHORTCUT
  // ========================================

  // Override Ctrl+F to open custom find bar when editor is focused
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
      // Only intercept if editor has focus or find bar is already open
      if (document.activeElement === markdownEditor || findReplaceBar.style.display === 'block') {
        e.preventDefault();
        openFindBar();
      }
    }
    // Escape handling for find bar and zen mode is done by the unified Escape handler
  });

  // ========================================
  // FEATURE 25: PLANTUML SUPPORT
  // ========================================

  const PLANTUML_SERVER = 'https://www.plantuml.com/plantuml/svg/';

  /**
   * Encode PlantUML text using the deflate+base64 encoding expected by the
   * public PlantUML server. This produces the compact ~SoWkIImg... token.
   */
  function plantumlEncode(text) {
    // Use pako (already loaded for sharing) to deflate
    const data = pako.deflateRaw(new TextEncoder().encode(text), { level: 9, to: 'string' });
    return plantumlBase64Encode(data);
  }

  function plantumlBase64Encode(data) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
    let result = '';
    for (let i = 0; i < data.length; i += 3) {
      const b1 = data.charCodeAt(i) & 0xFF;
      const b2 = i + 1 < data.length ? data.charCodeAt(i + 1) & 0xFF : 0;
      const b3 = i + 2 < data.length ? data.charCodeAt(i + 2) & 0xFF : 0;
      result += chars.charAt(b1 >> 2);
      result += chars.charAt(((b1 & 0x3) << 4) | (b2 >> 4));
      result += chars.charAt(((b2 & 0xF) << 2) | (b3 >> 6));
      result += chars.charAt(b3 & 0x3F);
    }
    return result;
  }

  function renderPlantUML(container) {
    // Find code blocks with 'plantuml' language class
    const codeBlocks = container.querySelectorAll('pre code.language-plantuml, pre code.hljs.language-plantuml');
    codeBlocks.forEach(codeEl => {
      const pre = codeEl.parentElement;
      if (pre._plantumlProcessed) return;
      pre._plantumlProcessed = true;

      const source = codeEl.textContent.trim();
      if (!source) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'plantuml-container plantuml-loading';

      try {
        const encoded = plantumlEncode(source);
        const imgUrl = PLANTUML_SERVER + encoded;

        const img = document.createElement('img');
        img.alt = 'PlantUML Diagram';
        img.src = imgUrl;
        img.onload = () => { wrapper.classList.remove('plantuml-loading'); };
        img.onerror = () => {
          wrapper.classList.remove('plantuml-loading');
          wrapper.classList.add('plantuml-error');
          wrapper.textContent = 'Failed to render PlantUML diagram';
        };
        wrapper.appendChild(img);
      } catch (e) {
        wrapper.classList.remove('plantuml-loading');
        wrapper.classList.add('plantuml-error');
        wrapper.textContent = 'PlantUML encoding error: ' + e.message;
      }

      pre.replaceWith(wrapper);
    });
  }

  // ========================================
  // FEATURE 26: WORD WRAP TOGGLE
  // ========================================

  const wordWrapBtn = document.getElementById('word-wrap-toggle');
  let wordWrapEnabled = localStorage.getItem('md-viewer-word-wrap') !== 'false'; // default ON

  function applyWordWrap() {
    if (wordWrapEnabled) {
      markdownEditor.classList.remove('no-wrap');
      wordWrapBtn.classList.remove('wrap-active');
      wordWrapBtn.title = 'Word Wrap: On (click to disable)';
    } else {
      markdownEditor.classList.add('no-wrap');
      wordWrapBtn.classList.add('wrap-active');
      wordWrapBtn.title = 'Word Wrap: Off (click to enable)';
    }
  }

  applyWordWrap();

  wordWrapBtn.addEventListener('click', function () {
    wordWrapEnabled = !wordWrapEnabled;
    localStorage.setItem('md-viewer-word-wrap', wordWrapEnabled.toString());
    applyWordWrap();
  });

  // ========================================
  // FEATURE 27: FOCUS MODE
  // ========================================

  const focusModeBtn = document.getElementById('focus-mode-toggle');
  let focusModeEnabled = false;

  function getCurrentParagraphRange() {
    const text = markdownEditor.value;
    const cursor = markdownEditor.selectionStart;

    // Find paragraph boundaries (separated by blank lines)
    let start = text.lastIndexOf('\n\n', cursor - 1);
    start = start === -1 ? 0 : start + 2;

    let end = text.indexOf('\n\n', cursor);
    end = end === -1 ? text.length : end;

    return { start, end };
  }

  function applyFocusMode() {
    if (!focusModeEnabled) {
      document.body.classList.remove('focus-mode');
      focusModeBtn.classList.remove('focus-active');
      focusModeBtn.title = 'Focus Mode: Off';
      markdownEditor.style.color = '';
      // Remove the highlight overlay if any
      const overlay = document.getElementById('focus-overlay');
      if (overlay) overlay.remove();
      return;
    }

    document.body.classList.add('focus-mode');
    focusModeBtn.classList.add('focus-active');
    focusModeBtn.title = 'Focus Mode: On (click to disable)';
    updateFocusHighlight();
  }

  function updateFocusHighlight() {
    if (!focusModeEnabled) return;

    const range = getCurrentParagraphRange();
    const text = markdownEditor.value;

    // Dim everything except the current paragraph by using a trick:
    // Set the textarea text to dim, and use a highlight overlay for the active paragraph
    const computedStyle = getComputedStyle(markdownEditor);
    const textColor = computedStyle.color;

    // Create or update the focus highlight
    // We simply change the opacity of text via the textarea's color
    markdownEditor.style.color = 'rgba(128, 128, 128, 0.35)';

    // Use the textarea's native selection highlight to show the active paragraph
    // But that conflicts with actual selection, so instead we'll use a simple approach:
    // Show a subtle background behind the active line area
    // For simplicity and reliability: we'll briefly highlight by scrolling to and selecting the paragraph text

    // Better approach: use text-shadow to make the active paragraph visible
    // This works by setting the main text color to dim and computing a text-shadow
    // that effectively "re-colors" just the active paragraph... but that's complex.

    // Simplest reliable approach: use CSS variable with the cursor line
    const linesBeforeCursor = text.substring(0, range.start).split('\n').length;
    const linesInParagraph = text.substring(range.start, range.end).split('\n').length;
    const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;

    let overlay = document.getElementById('focus-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'focus-overlay';
      overlay.style.cssText = `
        position: absolute;
        pointer-events: none;
        background-color: rgba(88, 166, 255, 0.06);
        border-left: 2px solid var(--accent-color);
        transition: top 0.1s ease, height 0.1s ease;
        z-index: 1;
      `;
      // Insert overlay into editor pane
      const editorPane = markdownEditor.closest('.editor-pane');
      if (editorPane) {
        editorPane.style.position = 'relative';
        editorPane.appendChild(overlay);
      }
    }

    const top = paddingTop + (linesBeforeCursor - 1) * lineHeight - markdownEditor.scrollTop;
    overlay.style.top = Math.max(0, top) + 'px';
    overlay.style.height = (linesInParagraph * lineHeight) + 'px';
    overlay.style.left = '0';
    overlay.style.right = '0';
  }

  focusModeBtn.addEventListener('click', function () {
    focusModeEnabled = !focusModeEnabled;
    applyFocusMode();
  });

  // Update focus highlight on cursor movement
  markdownEditor.addEventListener('click', updateFocusHighlight);
  markdownEditor.addEventListener('keyup', function (e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace', 'Delete'].includes(e.key)) {
      updateFocusHighlight();
    }
  });
  markdownEditor.addEventListener('scroll', updateFocusHighlight);

  // ========================================
  // ENCRYPTED SHARING VIA FIREBASE + URL FALLBACK
  // ========================================

  const SHARE_BASE_URL = 'https://markdownview.github.io/';

  // --- Firebase Config (public-safe keys) ---
  const firebaseConfig = {
    apiKey: 'AIzaSyC_5pgtZ-mZvHmIUH9X7MkObPwDLw8nyfw',
    authDomain: 'mdview-share.firebaseapp.com',
    projectId: 'mdview-share',
    storageBucket: 'mdview-share.firebasestorage.app',
    messagingSenderId: '866669616957',
    appId: '1:866669616957:web:47dd3ed6048fa8ba1faf54'
  };
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // --- Compression Helpers ---

  function compressData(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    return pako.gzip(data);
  }

  function decompressData(compressedData) {
    const decompressed = pako.ungzip(compressedData);
    const decoder = new TextDecoder();
    return decoder.decode(decompressed);
  }

  // --- Encryption Helpers (AES-256-GCM via Web Crypto API) ---

  async function generateEncryptionKey() {
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,  // extractable
      ['encrypt', 'decrypt']
    );
  }

  async function encryptData(key, data) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    // Pack: [12-byte IV][encrypted data]
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);
    return result;
  }

  async function decryptData(key, packedData) {
    const iv = packedData.slice(0, 12);
    const ciphertext = packedData.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );
    return new Uint8Array(decrypted);
  }

  // --- Base64 URL-safe helpers ---

  function uint8ArrayToBase64Url(data) {
    let binary = '';
    data.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function base64UrlToUint8Array(base64url) {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  async function keyToBase64Url(key) {
    const exported = await crypto.subtle.exportKey('raw', key);
    return uint8ArrayToBase64Url(new Uint8Array(exported));
  }

  async function base64UrlToKey(base64url) {
    const bytes = base64UrlToUint8Array(base64url);
    return crypto.subtle.importKey(
      'raw',
      bytes,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
  }

  // --- Share Flow (Firebase + URL fallback) ---

  async function shareMarkdown() {
    const shareButton = document.getElementById('share-button');
    const originalText = shareButton.innerHTML;

    try {
      const markdownContent = markdownEditor.value;
      if (!markdownContent.trim()) {
        alert('Nothing to share — the editor is empty.');
        return;
      }

      // Show progress
      shareButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Sharing...';
      shareButton.disabled = true;

      // Step 1: Compress
      const compressed = compressData(markdownContent);

      // Step 2: Generate encryption key
      const key = await generateEncryptionKey();

      // Step 3: Encrypt
      const encrypted = await encryptData(key, compressed);

      // Step 4: Encode data and key to base64url
      const dataString = uint8ArrayToBase64Url(encrypted);
      const keyString = await keyToBase64Url(key);

      let shareUrl;

      // Step 5: Try to store in Firebase for short URL
      try {
        const docRef = await db.collection('shares').add({
          d: dataString,
          t: Date.now()
        });
        // Short URL with Firebase doc ID
        shareUrl = `${SHARE_BASE_URL}#id=${docRef.id}&k=${keyString}`;
      } catch (fbError) {
        console.warn('Firebase unavailable, using URL fallback:', fbError);
        // Fallback: put data directly in URL
        shareUrl = `${SHARE_BASE_URL}#d=${dataString}&k=${keyString}`;
        if (shareUrl.length > 65000) {
          throw new Error('Content too large to share. Try a smaller document.');
        }
      }

      // Step 6: Show share result
      showShareResult(shareUrl);

      shareButton.innerHTML = '<i class="bi bi-check-lg"></i> Shared!';
      setTimeout(() => { shareButton.innerHTML = originalText; }, 2000);
      shareButton.disabled = false;

    } catch (error) {
      console.error('Share failed:', error);
      alert('Share failed: ' + error.message);
      shareButton.innerHTML = originalText;
      shareButton.disabled = false;
    }
  }

  // --- Load Shared Flow (Firebase or URL fragment) ---

  async function loadSharedMarkdown() {
    const hash = window.location.hash.substring(1); // Remove leading #
    if (!hash) return;

    // Parse fragment parameters
    const params = new URLSearchParams(hash);
    const docId = params.get('id');     // Firebase doc ID (short URL)
    const inlineData = params.get('d'); // Inline data (URL fallback)
    const keyString = params.get('k');

    if (!keyString || (!docId && !inlineData)) return;

    try {
      // Show loading state
      markdownPreview.innerHTML = '<div style="padding: 40px; text-align: center; opacity: 0.6;"><i class="bi bi-lock"></i> Decrypting shared content...</div>';
      setViewMode('preview');

      let dataString;

      if (docId) {
        // Firebase mode: fetch encrypted data by doc ID
        const doc = await db.collection('shares').doc(docId).get();
        if (!doc.exists) throw new Error('Shared document not found.');
        dataString = doc.data().d;
      } else {
        // URL fallback mode: data is inline
        dataString = inlineData;
      }

      // Step 1: Decode data from base64url
      const encrypted = base64UrlToUint8Array(dataString);

      // Step 2: Import decryption key
      const key = await base64UrlToKey(keyString);

      // Step 3: Decrypt
      const compressed = await decryptData(key, encrypted);

      // Step 4: Decompress
      const markdownContent = decompressData(compressed);

      // Step 5: Display in editor + preview
      markdownEditor.value = markdownContent;
      renderMarkdown();

      // Step 6: Show read-only banner and switch to preview mode
      setViewMode('preview');
      showSharedBanner();

    } catch (error) {
      console.error('Failed to load shared markdown:', error);
      markdownPreview.innerHTML = `<div style="padding: 40px; text-align: center;">
        <h3 style="color: var(--color-danger-fg);">
          <i class="bi bi-shield-exclamation"></i> Decryption Failed
        </h3>
        <p style="opacity: 0.7;">The link may be invalid or the document may not exist.</p>
        <p style="font-size: 13px; opacity: 0.5;">${error.message}</p>
      </div>`;
      setViewMode('preview');
    }
  }

  // --- Shared View Banner ---

  function showSharedBanner() {
    const banner = document.getElementById('shared-view-banner');
    banner.style.display = 'block';
    document.body.classList.add('shared-view-active');
    markdownEditor.readOnly = true;
  }

  function hideSharedBanner() {
    const banner = document.getElementById('shared-view-banner');
    banner.style.display = 'none';
    document.body.classList.remove('shared-view-active');
    markdownEditor.readOnly = false;
  }

  // Banner buttons
  document.getElementById('shared-banner-edit').addEventListener('click', function () {
    hideSharedBanner();
    // Clear URL params to prevent re-loading shared content
    window.history.replaceState({}, document.title, window.location.pathname);
    setViewMode('split');
  });

  document.getElementById('shared-banner-close').addEventListener('click', function () {
    hideSharedBanner();
    window.history.replaceState({}, document.title, window.location.pathname);
  });


  // --- Share Result Modal ---

  const shareResultModal = document.getElementById('share-result-modal');

  // --- Share Result Modal ---

  function showShareResult(url) {
    document.getElementById('share-link-input').value = url;
    shareResultModal.classList.add('active');
  }

  function closeShareResultModal() {
    shareResultModal.classList.remove('active');
  }

  document.getElementById('share-result-close').addEventListener('click', closeShareResultModal);
  shareResultModal.addEventListener('click', function (e) {
    if (e.target === shareResultModal) closeShareResultModal();
  });

  document.getElementById('copy-share-link').addEventListener('click', async function () {
    const linkInput = document.getElementById('share-link-input');
    const btn = this;
    try {
      await navigator.clipboard.writeText(linkInput.value);
      btn.innerHTML = '<i class="bi bi-check-lg"></i>';
      setTimeout(() => { btn.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
    } catch (e) {
      linkInput.select();
      document.execCommand('copy');
      btn.innerHTML = '<i class="bi bi-check-lg"></i>';
      setTimeout(() => { btn.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
    }
  });

  // --- Wire Up Share Buttons ---

  // --- New Document Button ---
  const newDocBtn = document.getElementById('new-document-btn');
  if (newDocBtn) {
    newDocBtn.addEventListener('click', () => {
      // Open a fresh blank instance in a new tab
      window.open(window.location.pathname, '_blank');
    });
  }

  // ========================================
  // TEMPLATE PICKER
  // ========================================

  const MARKDOWN_TEMPLATES = [
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
      default: return 'doc';
    }
  }

  function getCategoryIcon(category) {
    switch (category) {
      case 'documentation': return 'bi-book';
      case 'project': return 'bi-clipboard-check';
      case 'technical': return 'bi-cpu';
      case 'creative': return 'bi-brush';
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
      card.setAttribute('data-template-index', idx);
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

      card.addEventListener('click', () => selectTemplate(tpl));
      templateGrid.appendChild(card);
    });
  }

  function filterTemplates() {
    const query = templateSearchInput.value.toLowerCase().trim();
    const category = activeTemplateCategory;

    const filtered = MARKDOWN_TEMPLATES.filter(tpl => {
      const matchCategory = category === 'all' || tpl.category === category;
      if (!matchCategory) return false;
      if (!query) return true;

      return tpl.name.toLowerCase().includes(query) ||
        tpl.description.toLowerCase().includes(query) ||
        tpl.category.toLowerCase().includes(query) ||
        tpl.content.toLowerCase().includes(query);
    });

    renderTemplateCards(filtered);
  }

  function selectTemplate(tpl) {
    const editorContent = markdownEditor.value.trim();

    if (editorContent.length > 0) {
      if (!confirm('This will replace your current editor content with the template. Continue?')) {
        return;
      }
    }

    // Replace $(date) placeholders with current date
    const today = new Date().toISOString().split('T')[0];
    const content = tpl.content.replace(/\$\(date\)/g, today);

    markdownEditor.value = content;
    renderMarkdown();
    closeTemplateModal();

    // Scroll editor to top
    markdownEditor.scrollTop = 0;
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
      closeMobileMenu();
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


  document.getElementById('share-button').addEventListener('click', shareMarkdown);
  document.getElementById('mobile-share-button').addEventListener('click', function () {
    closeMobileMenu();
    shareMarkdown();
  });

  // --- Auto-load shared content on page load ---
  loadSharedMarkdown();

  // ========================================
  // AI ASSISTANT — Multi-model: Qwen 3.5 (local) + Groq Llama 3.3 70B (cloud)
  // ========================================

  const aiPanel = document.getElementById('ai-panel');
  const aiPanelOverlay = document.getElementById('ai-panel-overlay');
  const aiToggleBtn = document.getElementById('ai-toggle-button');
  const mobileAiBtn = document.getElementById('mobile-ai-button');
  const aiPanelCloseBtn = document.getElementById('ai-panel-close');
  const aiClearChatBtn = document.getElementById('ai-clear-chat');
  const aiChatArea = document.getElementById('ai-chat-area');
  const aiInput = document.getElementById('ai-input');
  const aiSendBtn = document.getElementById('ai-send-btn');
  const aiConsentModal = document.getElementById('ai-consent-modal');
  const aiConsentCancel = document.getElementById('ai-consent-cancel');
  const aiConsentDownload = document.getElementById('ai-consent-download');
  const aiProgressSection = document.getElementById('ai-download-progress');
  const aiProgressBar = document.getElementById('ai-progress-bar');
  const aiProgressStatus = document.getElementById('ai-progress-status');
  const aiProgressDetail = document.getElementById('ai-progress-detail');
  const aiDeviceLabel = document.getElementById('ai-device-label');
  const aiDeviceDetail = document.getElementById('ai-device-detail');
  const aiContextMenu = document.getElementById('ai-context-menu');
  const aiModelBadge = document.getElementById('ai-model-badge');
  const aiModelBtn = document.getElementById('ai-model-btn');
  const aiModelLabel = document.getElementById('ai-model-label');
  const aiModelBtnIcon = document.getElementById('ai-model-btn-icon');
  const aiModelDropdown = document.getElementById('ai-model-dropdown');
  const aiModelSelector = aiModelBtn ? aiModelBtn.closest('.ai-model-selector') : null;
  const aiApikeyModal = document.getElementById('ai-apikey-modal');
  const aiApikeyCancel = document.getElementById('ai-apikey-cancel');
  const aiApikeySave = document.getElementById('ai-apikey-save');
  const aiGroqKeyInput = document.getElementById('ai-groq-key-input');
  const aiApikeyError = document.getElementById('ai-apikey-error');

  let aiWorker = null;       // Qwen local worker
  let groqWorker = null;     // Groq cloud worker
  let openrouterWorker = null; // OpenRouter cloud worker
  let geminiWorker = null;   // Gemini cloud worker
  let aiModelLoaded = false; // Qwen loaded flag
  let groqModelLoaded = false;
  let openrouterModelLoaded = false;
  let geminiModelLoaded = false;
  let aiIsGenerating = false;
  let aiMessageIdCounter = 0;
  let aiPanelOpen = false;
  let currentAiModel = localStorage.getItem('md-viewer-ai-model') || 'qwen-local';
  let groqApiKey = localStorage.getItem('md-viewer-groq-key') || null;
  let openrouterApiKey = localStorage.getItem('md-viewer-openrouter-key') || null;
  let geminiApiKey = localStorage.getItem('md-viewer-gemini-key') || null;
  let streamingMessageId = null;
  let pendingProviderForKey = null; // Which provider the API key modal is open for

  // Provider configuration map
  const CLOUD_PROVIDERS = {
    'groq-llama': {
      label: 'Llama 3.3 · Groq',
      badge: 'Llama 3.3 · Groq',
      icon: 'bi bi-cloud',
      statusReady: 'Llama 3.3 70B · Groq Cloud',
      workerFile: 'ai-worker-groq.js',
      keyStorageKey: 'md-viewer-groq-key',
      dialogTitle: 'Connect to Groq',
      dialogDesc: 'Enter your free API key to use <strong>Llama 3.3 70B</strong>',
      dialogPlaceholder: 'gsk_xxxxxxxxxxxxxxxxxxxx',
      dialogLink: 'https://console.groq.com/keys',
      dialogLinkText: 'console.groq.com/keys',
      dialogIcon: 'bi bi-cloud',
      getKey: () => groqApiKey,
      setKey: (k) => { groqApiKey = k; },
      getWorker: () => groqWorker,
      setWorker: (w) => { groqWorker = w; },
      isLoaded: () => groqModelLoaded,
      setLoaded: (v) => { groqModelLoaded = v; },
    },
    'gemini-flash': {
      label: 'Gemini 2.0 · Google',
      badge: 'Gemini 2.0 · Google',
      icon: 'bi bi-google',
      statusReady: 'Gemini 2.0 Flash · Google',
      workerFile: 'ai-worker-gemini.js',
      keyStorageKey: 'md-viewer-gemini-key',
      dialogTitle: 'Connect to Gemini',
      dialogDesc: 'Enter your free API key to use <strong>Gemini 2.0 Flash</strong>',
      dialogPlaceholder: 'AIzaSy_xxxxxxxxxxxxxxxxxxxxx',
      dialogLink: 'https://aistudio.google.com/apikey',
      dialogLinkText: 'aistudio.google.com/apikey',
      dialogIcon: 'bi bi-google',
      getKey: () => geminiApiKey,
      setKey: (k) => { geminiApiKey = k; },
      getWorker: () => geminiWorker,
      setWorker: (w) => { geminiWorker = w; },
      isLoaded: () => geminiModelLoaded,
      setLoaded: (v) => { geminiModelLoaded = v; },
    },
    'openrouter-free': {
      label: 'Auto · OpenRouter',
      badge: 'Auto · OpenRouter',
      icon: 'bi bi-globe2',
      statusReady: 'Auto Model · OpenRouter',
      workerFile: 'ai-worker-openrouter.js',
      keyStorageKey: 'md-viewer-openrouter-key',
      dialogTitle: 'Connect to OpenRouter',
      dialogDesc: 'Enter your free API key for <strong>300+ AI models</strong>',
      dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
      dialogLink: 'https://openrouter.ai/keys',
      dialogLinkText: 'openrouter.ai/keys',
      dialogIcon: 'bi bi-globe2',
      getKey: () => openrouterApiKey,
      setKey: (k) => { openrouterApiKey = k; },
      getWorker: () => openrouterWorker,
      setWorker: (w) => { openrouterWorker = w; },
      isLoaded: () => openrouterModelLoaded,
      setLoaded: (v) => { openrouterModelLoaded = v; },
    },
  };

  // Unified helpers
  function getActiveWorker() {
    if (currentAiModel === 'qwen-local') return aiWorker;
    const p = CLOUD_PROVIDERS[currentAiModel];
    return p ? p.getWorker() : null;
  }
  function isCurrentModelReady() {
    if (currentAiModel === 'qwen-local') return aiModelLoaded;
    const p = CLOUD_PROVIDERS[currentAiModel];
    return p ? p.isLoaded() : false;
  }

  // --- Check WebGPU on page load (for consent dialog) ---
  (async function checkGPU() {
    if (navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          aiDeviceLabel.textContent = 'WebGPU Available ✓';
          aiDeviceDetail.textContent = 'Fast GPU-accelerated inference';
          return;
        }
      } catch (e) { /* fall through */ }
    }
    aiDeviceLabel.textContent = 'WebGPU Not Available';
    aiDeviceDetail.textContent = 'Will use WASM (slower but functional)';
  })();

  // --- Initialize model selector UI on load ---
  function initModelSelectorUI() {
    // Restore last selected model
    updateModelUI(currentAiModel);
    // Mark the correct option as active
    if (aiModelDropdown) {
      aiModelDropdown.querySelectorAll('.ai-model-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.model === currentAiModel);
      });
    }
  }
  initModelSelectorUI();

  function updateModelUI(modelId) {
    const p = CLOUD_PROVIDERS[modelId];
    if (p) {
      if (aiModelLabel) aiModelLabel.textContent = p.label;
      if (aiModelBtnIcon) { aiModelBtnIcon.className = p.icon; }
      if (aiModelBadge) aiModelBadge.textContent = p.badge;
    } else {
      if (aiModelLabel) aiModelLabel.textContent = 'Qwen 3.5 · Local';
      if (aiModelBtnIcon) { aiModelBtnIcon.className = 'bi bi-pc-display'; }
      if (aiModelBadge) aiModelBadge.textContent = 'Qwen 3.5 · Local';
    }
  }

  // --- Model Selector Dropdown ---
  if (aiModelBtn) {
    aiModelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      aiModelSelector.classList.toggle('open');
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (aiModelSelector && !aiModelSelector.contains(e.target)) {
      aiModelSelector.classList.remove('open');
    }
  });

  // Model option click
  if (aiModelDropdown) {
    aiModelDropdown.querySelectorAll('.ai-model-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const model = opt.dataset.model;
        aiModelSelector.classList.remove('open');
        if (model === currentAiModel) return;

        const provider = CLOUD_PROVIDERS[model];
        if (provider) {
          // Cloud model — need API key
          if (!provider.getKey()) {
            showApiKeyModal(model);
            return;
          }
          switchToModel(model);
        } else {
          // Qwen local
          switchToModel('qwen-local');
        }
      });
    });
  }

  function switchToModel(modelId) {
    currentAiModel = modelId;
    localStorage.setItem('md-viewer-ai-model', modelId);
    updateModelUI(modelId);

    // Update active option
    if (aiModelDropdown) {
      aiModelDropdown.querySelectorAll('.ai-model-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.model === modelId);
      });
    }

    const provider = CLOUD_PROVIDERS[modelId];
    if (provider) {
      if (!provider.isLoaded() && !provider.getWorker()) {
        initCloudWorker(modelId);
      }
      if (provider.isLoaded()) {
        addAiStatusBar('ready', provider.statusReady);
      }
    } else {
      // Qwen local
      if (!aiModelLoaded && !aiWorker) {
        if (localStorage.getItem('md-viewer-ai-consented')) {
          initAiWorker();
          addAiStatusBar('loading', 'Loading cached model...');
        } else {
          addAiStatusBar('loading', 'Qwen not loaded — click AI button to download');
        }
      } else if (aiModelLoaded) {
        addAiStatusBar('ready', 'Qwen 3.5 · Local');
      }
    }
  }

  // --- API Key Modal (shared by all cloud providers) ---
  const aiApikeyTitle = document.getElementById('ai-apikey-title');
  const aiApikeyDesc = document.getElementById('ai-apikey-desc');
  const aiApikeyIcon = document.getElementById('ai-apikey-icon');
  const aiApikeyLink = document.getElementById('ai-apikey-link');

  function showApiKeyModal(providerId) {
    pendingProviderForKey = providerId;
    const provider = CLOUD_PROVIDERS[providerId];
    if (!provider) return;

    // Update dialog with provider-specific info
    if (aiApikeyTitle) aiApikeyTitle.textContent = provider.dialogTitle;
    if (aiApikeyDesc) aiApikeyDesc.innerHTML = provider.dialogDesc;
    if (aiApikeyIcon) aiApikeyIcon.className = provider.dialogIcon;
    if (aiApikeyLink) {
      aiApikeyLink.href = provider.dialogLink;
      aiApikeyLink.textContent = provider.dialogLinkText;
    }
    aiGroqKeyInput.placeholder = provider.dialogPlaceholder;
    aiGroqKeyInput.value = provider.getKey() || '';

    aiApikeyModal.style.display = 'flex';
    aiApikeyError.style.display = 'none';
    aiApikeySave.disabled = false;
    aiApikeySave.innerHTML = '<i class="bi bi-check-lg me-1"></i> Connect';
    setTimeout(() => aiGroqKeyInput.focus(), 100);
  }

  function hideApiKeyModal() {
    aiApikeyModal.style.display = 'none';
    pendingProviderForKey = null;
  }

  if (aiApikeyCancel) aiApikeyCancel.addEventListener('click', hideApiKeyModal);
  if (aiApikeyModal) {
    aiApikeyModal.addEventListener('click', (e) => {
      if (e.target === aiApikeyModal) hideApiKeyModal();
    });
  }

  if (aiApikeySave) {
    aiApikeySave.addEventListener('click', () => {
      const key = aiGroqKeyInput.value.trim();
      const providerId = pendingProviderForKey;
      const provider = CLOUD_PROVIDERS[providerId];
      if (!key || !provider) {
        aiApikeyError.textContent = 'Please enter your API key.';
        aiApikeyError.style.display = 'block';
        return;
      }

      aiApikeySave.disabled = true;
      aiApikeySave.innerHTML = '<span class="ai-status-spinner"></span> Validating...';
      aiApikeyError.style.display = 'none';

      // Save key
      provider.setKey(key);
      localStorage.setItem(provider.keyStorageKey, key);

      // Init worker to validate key
      initCloudWorker(providerId, () => {
        hideApiKeyModal();
        switchToModel(providerId);
        if (!aiPanelOpen) openAiPanel();
      }, (errorMsg) => {
        aiApikeySave.disabled = false;
        aiApikeySave.innerHTML = '<i class="bi bi-check-lg me-1"></i> Connect';
        aiApikeyError.textContent = errorMsg;
        aiApikeyError.style.display = 'block';
        provider.setKey(null);
        localStorage.removeItem(provider.keyStorageKey);
      });
    });
  }

  // Handle Enter key in API key input
  if (aiGroqKeyInput) {
    aiGroqKeyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        aiApikeySave.click();
      }
    });
  }

  // --- Panel Toggle ---
  function openAiPanel() {
    // Always open the panel first — never block with a consent/download dialog
    aiPanel.style.display = 'flex';
    aiPanelOverlay.classList.add('active');
    void aiPanel.offsetWidth;
    aiPanel.classList.add('ai-panel-open');
    aiToggleBtn.classList.add('ai-active');
    aiPanelOpen = true;
    document.body.classList.add('ai-panel-active');
    aiInput.focus();

    // Then handle model loading in the background
    if (currentAiModel === 'qwen-local' && !aiModelLoaded && !aiWorker) {
      if (localStorage.getItem('md-viewer-ai-consented')) {
        // Model was previously downloaded — auto-load from cache
        initAiWorker();
        addAiStatusBar('loading', 'Loading cached model...');
      }
      // Otherwise do nothing — user can pick a cloud model or send a message
      // to trigger the consent dialog
      return;
    }

    // Any cloud model — check if ready
    const cloudProvider = CLOUD_PROVIDERS[currentAiModel];
    if (cloudProvider && !cloudProvider.isLoaded() && !cloudProvider.getWorker()) {
      if (!cloudProvider.getKey()) {
        showApiKeyModal(currentAiModel);
        return;
      }
      initCloudWorker(currentAiModel);
    }
  }

  function closeAiPanel() {
    aiPanel.classList.remove('ai-panel-open');
    aiPanelOverlay.classList.remove('active');
    aiToggleBtn.classList.remove('ai-active');
    aiPanelOpen = false;
    document.body.classList.remove('ai-panel-active');
    setTimeout(() => {
      if (!aiPanelOpen) aiPanel.style.display = 'none';
    }, 300);
  }

  function toggleAiPanel() {
    if (aiPanelOpen) closeAiPanel();
    else openAiPanel();
  }

  if (aiToggleBtn) aiToggleBtn.addEventListener('click', toggleAiPanel);
  if (mobileAiBtn) mobileAiBtn.addEventListener('click', () => {
    closeMobileMenu();
    toggleAiPanel();
  });
  if (aiPanelCloseBtn) aiPanelCloseBtn.addEventListener('click', closeAiPanel);
  // Overlay is pass-through — panel closes via the X button only

  // --- AI Panel Resize (drag left edge) ---
  const aiResizeDivider = document.getElementById('ai-resize-divider');

  // Restore saved width
  const savedAiWidth = localStorage.getItem('md-viewer-ai-panel-width');
  if (savedAiWidth) {
    const w = parseInt(savedAiWidth, 10);
    if (w >= 250 && w <= window.innerWidth * 0.6) {
      document.documentElement.style.setProperty('--ai-panel-width', w + 'px');
    }
  }

  if (aiResizeDivider) {
    let aiResizing = false;
    let aiResizeStartX = 0;
    let aiResizeStartWidth = 0;

    function startAiResize(e) {
      e.preventDefault();
      aiResizing = true;
      aiResizeStartX = e.clientX || e.touches[0].clientX;
      aiResizeStartWidth = aiPanel.offsetWidth;
      aiResizeDivider.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleAiResize);
      document.addEventListener('mouseup', stopAiResize);
      document.addEventListener('touchmove', handleAiResize, { passive: false });
      document.addEventListener('touchend', stopAiResize);
    }

    function handleAiResize(e) {
      if (!aiResizing) return;
      e.preventDefault();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      if (clientX == null) return;
      const delta = aiResizeStartX - clientX;
      const newWidth = Math.min(Math.max(aiResizeStartWidth + delta, 250), window.innerWidth * 0.6);
      document.documentElement.style.setProperty('--ai-panel-width', newWidth + 'px');
    }

    function stopAiResize() {
      if (!aiResizing) return;
      aiResizing = false;
      aiResizeDivider.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleAiResize);
      document.removeEventListener('mouseup', stopAiResize);
      document.removeEventListener('touchmove', handleAiResize);
      document.removeEventListener('touchend', stopAiResize);
      // Persist width
      const currentWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ai-panel-width'));
      if (currentWidth) localStorage.setItem('md-viewer-ai-panel-width', currentWidth);
    }

    aiResizeDivider.addEventListener('mousedown', startAiResize);
    aiResizeDivider.addEventListener('touchstart', startAiResize, { passive: false });
  }

  // --- Consent Dialog ---
  function showAiConsentDialog() {
    aiConsentModal.style.display = 'flex';
    aiProgressSection.style.display = 'none';
    aiConsentDownload.disabled = false;
    aiConsentDownload.innerHTML = '<i class="bi bi-download me-1"></i> Download & Enable AI';
  }

  function hideAiConsentDialog() {
    aiConsentModal.style.display = 'none';
  }

  aiConsentCancel.addEventListener('click', hideAiConsentDialog);
  aiConsentModal.addEventListener('click', (e) => {
    if (e.target === aiConsentModal) hideAiConsentDialog();
  });

  aiConsentDownload.addEventListener('click', () => {
    aiConsentDownload.disabled = true;
    aiConsentDownload.innerHTML = '<span class="ai-status-spinner"></span> Loading...';
    aiProgressSection.style.display = 'block';
    initAiWorker();
  });

  // --- Worker Lifecycle ---
  function initAiWorker() {
    if (aiWorker) return;

    aiWorker = new Worker('ai-worker.js', { type: 'module' });

    // Track download progress per file
    const fileProgress = {};

    aiWorker.addEventListener('message', (e) => {
      const msg = e.data;

      switch (msg.type) {
        case 'progress': {
          // Track per-file progress
          fileProgress[msg.file] = {
            loaded: msg.loaded || 0,
            total: msg.total || 0,
            progress: msg.progress || 0
          };

          // Throttle DOM updates to prevent dialog shaking
          if (!initAiWorker._progressThrottle) {
            initAiWorker._progressThrottle = true;
            requestAnimationFrame(() => {
              // Calculate overall progress
              let totalLoaded = 0, totalSize = 0;
              Object.values(fileProgress).forEach(fp => {
                totalLoaded += fp.loaded;
                totalSize += fp.total;
              });
              const overallPercent = totalSize > 0 ? Math.round((totalLoaded / totalSize) * 100) : 0;

              aiProgressBar.style.width = overallPercent + '%';
              aiProgressStatus.textContent = `Downloading model... ${overallPercent}%`;

              const mbLoaded = (totalLoaded / 1024 / 1024).toFixed(1);
              const mbTotal = (totalSize / 1024 / 1024).toFixed(1);
              aiProgressDetail.textContent = `${mbLoaded} MB / ${mbTotal} MB`;

              setTimeout(() => { initAiWorker._progressThrottle = false; }, 200);
            });
          }
          break;
        }

        case 'status':
          aiProgressStatus.textContent = msg.message;
          break;

        case 'loaded':
          aiModelLoaded = true;
          // Remember consent so we skip the dialog next time
          localStorage.setItem('md-viewer-ai-consented', 'true');
          hideAiConsentDialog();
          // Open the panel if not already open
          if (!aiPanelOpen) {
            aiPanel.style.display = 'flex';
            aiPanelOverlay.classList.add('active');
            void aiPanel.offsetWidth;
            aiPanel.classList.add('ai-panel-open');
            aiToggleBtn.classList.add('ai-active');
            aiPanelOpen = true;
            document.body.classList.add('ai-panel-active');
          }
          // Add a status bar — show current model name
          if (currentAiModel === 'qwen-local') {
            addAiStatusBar('ready', `Qwen 3.5 · Local (${msg.device.toUpperCase()})`);
          }
          aiInput.focus();
          break;

        case 'complete':
          handleAiResponse(msg.text, msg.messageId);
          break;

        case 'error':
          if (!aiModelLoaded) {
            // Clear consent so user gets the dialog again
            localStorage.removeItem('md-viewer-ai-consented');
            // Model failed to load — show error in consent dialog and allow retry
            if (aiConsentModal.style.display === 'flex') {
              aiProgressStatus.textContent = '❌ ' + msg.message;
              aiProgressBar.style.width = '0%';
              aiProgressBar.style.background = '#f87171';
              aiConsentDownload.disabled = false;
              aiConsentDownload.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i> Retry Download';
            } else {
              // Was auto-loading from cache — show error in panel
              addAiStatusBar('error', msg.message);
            }
            // Reset worker so user can retry
            if (aiWorker) { aiWorker.terminate(); aiWorker = null; }
          } else {
            handleAiError(msg.message, msg.messageId);
          }
          break;
      }
    });

    // Handle worker-level crashes (network failure, script error, etc.)
    aiWorker.addEventListener('error', (e) => {
      console.error('AI Worker error:', e);
      aiModelLoaded = false;
      if (aiWorker) { aiWorker.terminate(); aiWorker = null; }
      // If consent dialog is open, show error there
      if (aiConsentModal.style.display === 'flex') {
        aiProgressStatus.textContent = '❌ Worker failed to initialize. Check your connection and retry.';
        aiProgressBar.style.width = '0%';
        aiConsentDownload.disabled = false;
        aiConsentDownload.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i> Retry Download';
      } else {
        // Panel is open but model died — show re-download notice
        addAiStatusBar('error', 'Model unavailable — click AI button to re-download');
        aiModelLoaded = false;
      }
    });

    aiWorker.postMessage({ type: 'load' });
  }

  // --- Groq Worker Lifecycle ---
  // --- Generic Cloud Worker Initializer (works for any provider) ---
  function initCloudWorker(providerId, onSuccess, onError) {
    const provider = CLOUD_PROVIDERS[providerId];
    if (!provider) return;

    if (provider.getWorker()) {
      if (provider.isLoaded()) {
        if (onSuccess) onSuccess();
        return;
      }
    }

    // Terminate existing worker if re-initializing
    if (provider.getWorker()) { provider.getWorker().terminate(); provider.setWorker(null); }
    provider.setLoaded(false);

    const worker = new Worker(provider.workerFile);
    provider.setWorker(worker);

    worker.addEventListener('message', (e) => {
      const msg = e.data;

      switch (msg.type) {
        case 'status':
          addAiStatusBar('loading', msg.message);
          break;

        case 'loaded':
          provider.setLoaded(true);
          if (currentAiModel === providerId) {
            addAiStatusBar('ready', provider.statusReady);
          }
          if (onSuccess) { onSuccess(); onSuccess = null; }
          break;

        case 'token':
          handleStreamingToken(msg.token, msg.messageId);
          break;

        case 'complete':
          handleGroqComplete(msg.text, msg.messageId);
          break;

        case 'error':
          if (!provider.isLoaded()) {
            if (onError) { onError(msg.message); onError = null; }
            else { addAiStatusBar('error', msg.message); }
            if (provider.getWorker()) { provider.getWorker().terminate(); provider.setWorker(null); }
            if (msg.message.includes('Invalid API key') || msg.message.includes('API key')) {
              provider.setKey(null);
              localStorage.removeItem(provider.keyStorageKey);
            }
          } else {
            handleAiError(msg.message, msg.messageId);
          }
          break;
      }
    });

    worker.addEventListener('error', (e) => {
      console.error(`${providerId} worker error:`, e);
      provider.setLoaded(false);
      if (provider.getWorker()) { provider.getWorker().terminate(); provider.setWorker(null); }
      const errorMsg = `${provider.dialogTitle.replace('Connect to ', '')} worker failed to initialize.`;
      if (onError) { onError(errorMsg); onError = null; }
      else { addAiStatusBar('error', errorMsg); }
    });

    // Send API key and load
    worker.postMessage({ type: 'setApiKey', apiKey: provider.getKey() });
    worker.postMessage({ type: 'load' });
  }

  // --- Streaming Token Handling ---
  function handleStreamingToken(token, messageId) {
    // Find or create the streaming bubble
    let bubble = document.getElementById('ai-streaming-bubble-' + messageId);

    if (!bubble) {
      // First token — replace typing indicator with an empty AI bubble
      removeTypingIndicator();

      // Remove welcome message
      const welcome = aiChatArea.querySelector('.ai-welcome-message');
      if (welcome) welcome.remove();

      const msg = document.createElement('div');
      msg.className = 'ai-message ai-message-ai';
      msg.id = 'ai-streaming-msg-' + messageId;
      msg.innerHTML = `
        <span class="ai-msg-label">AI</span>
        <div class="ai-msg-bubble" id="ai-streaming-bubble-${messageId}"></div>
      `;
      aiChatArea.appendChild(msg);
      bubble = document.getElementById('ai-streaming-bubble-' + messageId);
    }

    // Append token text (accumulate raw text, then format)
    if (!bubble._rawText) bubble._rawText = '';
    bubble._rawText += token;
    bubble.innerHTML = formatAiResponse(bubble._rawText);

    // Auto-scroll
    aiChatArea.scrollTop = aiChatArea.scrollHeight;
  }

  function handleGroqComplete(text, messageId) {
    aiIsGenerating = false;
    aiSendBtn.disabled = false;
    streamingMessageId = null;

    // Find the streaming message and add action buttons
    const msgEl = document.getElementById('ai-streaming-msg-' + messageId);
    if (msgEl) {
      // Remove the streaming IDs (no longer needed)
      const bubble = document.getElementById('ai-streaming-bubble-' + messageId);
      if (bubble) {
        bubble.removeAttribute('id');
        bubble.innerHTML = formatAiResponse(text);
      }
      msgEl.removeAttribute('id');

      // Add action buttons
      const actions = document.createElement('div');
      actions.className = 'ai-msg-actions';
      actions.innerHTML = `
        <button class="ai-msg-action-btn" data-action="insert" data-text="${encodeURIComponent(text)}" title="Insert into editor">
          <i class="bi bi-box-arrow-in-down"></i> Insert
        </button>
        <button class="ai-msg-action-btn" data-action="copy" data-text="${encodeURIComponent(text)}" title="Copy to clipboard">
          <i class="bi bi-clipboard"></i> Copy
        </button>
        <button class="ai-msg-action-btn" data-action="replace" data-text="${encodeURIComponent(text)}" title="Replace selected text">
          <i class="bi bi-arrow-left-right"></i> Replace
        </button>
      `;
      msgEl.appendChild(actions);

      // Wire up action buttons
      actions.querySelectorAll('.ai-msg-action-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          const action = this.dataset.action;
          const rawText = decodeURIComponent(this.dataset.text);
          handleAiAction(action, rawText, this);
        });
      });
    } else {
      // Fallback if no streaming element found
      removeTypingIndicator();
      addAiMessage(text, messageId);
    }
    aiChatArea.scrollTop = aiChatArea.scrollHeight;
  }

  // --- Status Bar ---
  function addAiStatusBar(status, text) {
    // Remove existing status bar
    const existing = aiPanel.querySelector('.ai-status-bar');
    if (existing) existing.remove();

    const bar = document.createElement('div');
    bar.className = 'ai-status-bar';
    bar.innerHTML = `<span class="ai-status-dot ${status}"></span> ${text}`;

    // Insert after header
    const header = aiPanel.querySelector('.ai-panel-header');
    header.insertAdjacentElement('afterend', bar);
  }

  // --- Chat Messages ---
  function addUserMessage(text) {
    // Remove welcome message
    const welcome = aiChatArea.querySelector('.ai-welcome-message');
    if (welcome) welcome.remove();

    const msg = document.createElement('div');
    msg.className = 'ai-message ai-message-user';
    msg.innerHTML = `
      <span class="ai-msg-label">You</span>
      <div class="ai-msg-bubble">${escapeHtml(text)}</div>
    `;
    aiChatArea.appendChild(msg);
    aiChatArea.scrollTop = aiChatArea.scrollHeight;
  }

  function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'ai-message ai-message-ai';
    indicator.id = 'ai-typing';
    indicator.innerHTML = `
      <span class="ai-msg-label">AI</span>
      <div class="ai-typing-indicator">
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
      </div>
    `;
    aiChatArea.appendChild(indicator);
    aiChatArea.scrollTop = aiChatArea.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('ai-typing');
    if (indicator) indicator.remove();
  }

  function addAiMessage(text, messageId) {
    removeTypingIndicator();

    // Remove welcome message
    const welcome = aiChatArea.querySelector('.ai-welcome-message');
    if (welcome) welcome.remove();

    const msg = document.createElement('div');
    msg.className = 'ai-message ai-message-ai';

    // Simple markdown-to-html for AI response (basic formatting)
    const formattedText = formatAiResponse(text);

    msg.innerHTML = `
      <span class="ai-msg-label">AI</span>
      <div class="ai-msg-bubble">${formattedText}</div>
      <div class="ai-msg-actions">
        <button class="ai-msg-action-btn" data-action="insert" data-text="${encodeURIComponent(text)}" title="Insert into editor">
          <i class="bi bi-box-arrow-in-down"></i> Insert
        </button>
        <button class="ai-msg-action-btn" data-action="copy" data-text="${encodeURIComponent(text)}" title="Copy to clipboard">
          <i class="bi bi-clipboard"></i> Copy
        </button>
        <button class="ai-msg-action-btn" data-action="replace" data-text="${encodeURIComponent(text)}" title="Replace selected text">
          <i class="bi bi-arrow-left-right"></i> Replace
        </button>
      </div>
    `;

    aiChatArea.appendChild(msg);
    aiChatArea.scrollTop = aiChatArea.scrollHeight;

    // Wire up action buttons
    msg.querySelectorAll('.ai-msg-action-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const action = this.dataset.action;
        const rawText = decodeURIComponent(this.dataset.text);
        handleAiAction(action, rawText, this);
      });
    });
  }

  function handleAiAction(action, text, btn) {
    switch (action) {
      case 'insert': {
        const pos = markdownEditor.selectionStart;
        const before = markdownEditor.value.substring(0, pos);
        const after = markdownEditor.value.substring(pos);
        markdownEditor.value = before + '\n' + text + '\n' + after;
        markdownEditor.dispatchEvent(new Event('input'));
        btn.innerHTML = '<i class="bi bi-check-lg"></i> Inserted';
        setTimeout(() => { btn.innerHTML = '<i class="bi bi-box-arrow-in-down"></i> Insert'; }, 1500);
        break;
      }
      case 'copy': {
        navigator.clipboard.writeText(text).then(() => {
          btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied';
          setTimeout(() => { btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy'; }, 1500);
        });
        break;
      }
      case 'replace': {
        const start = markdownEditor.selectionStart;
        const end = markdownEditor.selectionEnd;
        if (start === end) {
          // No selection, insert instead
          handleAiAction('insert', text, btn);
          return;
        }
        markdownEditor.value = markdownEditor.value.substring(0, start) + text + markdownEditor.value.substring(end);
        markdownEditor.dispatchEvent(new Event('input'));
        btn.innerHTML = '<i class="bi bi-check-lg"></i> Replaced';
        setTimeout(() => { btn.innerHTML = '<i class="bi bi-arrow-left-right"></i> Replace'; }, 1500);
        break;
      }
    }
  }

  function handleAiResponse(text, messageId) {
    aiIsGenerating = false;
    aiSendBtn.disabled = false;
    addAiMessage(text, messageId);
  }

  function handleAiError(message, messageId) {
    aiIsGenerating = false;
    aiSendBtn.disabled = false;
    removeTypingIndicator();

    const msg = document.createElement('div');
    msg.className = 'ai-message ai-message-ai';
    msg.innerHTML = `
      <span class="ai-msg-label">AI</span>
      <div class="ai-msg-bubble" style="border-color: var(--color-danger-fg); color: var(--color-danger-fg);">
        <i class="bi bi-exclamation-triangle"></i> ${escapeHtml(message)}
      </div>
    `;
    aiChatArea.appendChild(msg);
    aiChatArea.scrollTop = aiChatArea.scrollHeight;
  }

  function formatAiResponse(text) {
    // Basic markdown formatting for AI responses
    let html = escapeHtml(text);

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    // Sanitize the final output to prevent any XSS
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['pre', 'code', 'strong', 'em', 'br'],
      ALLOWED_ATTR: []
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --- Send to AI (routes to active model's worker) ---
  function sendToAi(taskType, context, userPrompt) {
    // If Qwen is selected but not loaded yet, trigger consent/download
    if (currentAiModel === 'qwen-local' && !aiModelLoaded && !aiWorker) {
      if (localStorage.getItem('md-viewer-ai-consented')) {
        initAiWorker();
        addAiStatusBar('loading', 'Loading cached model...');
      } else {
        showAiConsentDialog();
      }
      return;
    }

    // If a cloud model is selected but not ready, prompt for API key
    const cloudProvider = CLOUD_PROVIDERS[currentAiModel];
    if (cloudProvider && !cloudProvider.isLoaded() && !cloudProvider.getWorker()) {
      if (!cloudProvider.getKey()) {
        showApiKeyModal(currentAiModel);
        return;
      }
      initCloudWorker(currentAiModel);
      return;
    }

    const activeWorker = getActiveWorker();
    const isReady = isCurrentModelReady();

    if (!isReady || !activeWorker) return;
    if (aiIsGenerating) return;

    aiIsGenerating = true;
    aiSendBtn.disabled = true;
    const messageId = ++aiMessageIdCounter;
    streamingMessageId = messageId;

    // Check thinking mode toggle
    const thinkingToggle = document.getElementById('ai-thinking-toggle');
    const enableThinking = thinkingToggle ? thinkingToggle.checked : false;

    // Show user message in chat
    const displayText = userPrompt || `[${taskType}] ${context ? context.substring(0, 80) + '...' : ''}`;
    addUserMessage(displayText);
    addTypingIndicator();

    activeWorker.postMessage({
      type: 'generate',
      taskType,
      context,
      userPrompt,
      messageId,
      enableThinking
    });
  }

  // --- Chat Input ---
  aiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });

  // Auto-resize textarea
  aiInput.addEventListener('input', () => {
    aiInput.style.height = 'auto';
    aiInput.style.height = Math.min(aiInput.scrollHeight, 120) + 'px';
  });

  aiSendBtn.addEventListener('click', sendChatMessage);

  function sendChatMessage() {
    const text = aiInput.value.trim();
    if (!text || aiIsGenerating) return;

    aiInput.value = '';
    aiInput.style.height = 'auto';

    // Detect if it's a Q&A about the document or a generation request
    const editorContent = markdownEditor.value;
    const isQuestion = /^(what|who|where|when|why|how|is |are |do |does |can |could |would |should |explain|tell me|describe)/i.test(text);

    if (isQuestion && editorContent.trim()) {
      sendToAi('qa', editorContent, text);
    } else {
      sendToAi('generate', null, text);
    }
  }

  // --- Track editor selection so it persists when focus moves to AI panel ---
  let savedSelection = { start: 0, end: 0 };
  markdownEditor.addEventListener('select', () => {
    savedSelection = { start: markdownEditor.selectionStart, end: markdownEditor.selectionEnd };
  });
  markdownEditor.addEventListener('click', () => {
    savedSelection = { start: markdownEditor.selectionStart, end: markdownEditor.selectionEnd };
  });
  markdownEditor.addEventListener('keyup', () => {
    savedSelection = { start: markdownEditor.selectionStart, end: markdownEditor.selectionEnd };
  });

  /**
   * Get a smart text chunk around cursor when no text is selected.
   * Takes ~1500 chars around the cursor position to avoid overloading the model.
   */
  function getSmartChunk(fullText, cursorPos) {
    if (!fullText.trim()) return '';
    const CHUNK_SIZE = 1500;
    if (fullText.length <= CHUNK_SIZE) return fullText;
    let start = Math.max(0, cursorPos - Math.floor(CHUNK_SIZE / 2));
    let end = Math.min(fullText.length, start + CHUNK_SIZE);
    // Snap start to a paragraph boundary (double newline) if possible
    if (start > 0) {
      const paraBreak = fullText.lastIndexOf('\n\n', start + 100);
      if (paraBreak > start - 200 && paraBreak > 0) start = paraBreak + 2;
    }
    // Snap end to a paragraph boundary if possible
    if (end < fullText.length) {
      const paraBreak = fullText.indexOf('\n\n', end - 100);
      if (paraBreak > 0 && paraBreak < end + 200) end = paraBreak;
    }
    return fullText.substring(start, end);
  }

  /**
   * Split text into chunks of ~CHUNK_SIZE characters, breaking at newlines when possible.
   */
  function splitIntoChunks(text, chunkSize = 1500) {
    if (text.length <= chunkSize) return [text];
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      let end = Math.min(start + chunkSize, text.length);
      // Try to break at a newline
      if (end < text.length) {
        const lastNewline = text.lastIndexOf('\n', end);
        if (lastNewline > start + chunkSize * 0.5) end = lastNewline + 1;
      }
      chunks.push(text.substring(start, end));
      start = end;
    }
    return chunks;
  }

  /**
   * Process document in chunks like an agent — step by step, with progress.
   * Returns a promise that resolves when done.
   */
  function processDocumentInChunks(action, fullText) {
    const chunks = splitIntoChunks(fullText);
    const totalChunks = chunks.length;

    addAiMessage(`📄 Processing entire document (${fullText.length} chars) in ${totalChunks} chunk${totalChunks > 1 ? 's' : ''}...`, 'user');

    let chunkIndex = 0;
    const chunkResults = [];

    function processNextChunk() {
      if (chunkIndex >= totalChunks) {
        // All chunks processed — combine results
        if (action === 'summarize' && totalChunks > 1) {
          // Final summary pass: combine chunk summaries
          addAiMessage(`🔗 Combining ${totalChunks} chunk summaries into final summary...`);
          const combined = chunkResults.map((r, i) => `### Part ${i + 1}\n${r}`).join('\n\n');
          sendToAi('summarize', combined, 'Combine these section summaries into one concise final summary.');
        } else if (totalChunks > 1) {
          // For other actions, show combined results
          const combined = chunkResults.join('\n\n---\n\n');
          removeTypingIndicator();
          addAiMessage(combined);
          aiIsGenerating = false;
          aiSendBtn.disabled = false;
        }
        return;
      }

      const chunkNum = chunkIndex + 1;
      addAiMessage(`⏳ Processing chunk ${chunkNum}/${totalChunks}...`);

      aiIsGenerating = true;
      aiSendBtn.disabled = true;
      const messageId = ++aiMessageIdCounter;

      // Check thinking toggle
      const thinkingToggle = document.getElementById('ai-thinking-toggle');
      const enableThinking = thinkingToggle ? thinkingToggle.checked : false;

      // Route to correct worker
      const activeWorker = getActiveWorker();

      // Set up one-time listener for this chunk's response
      const chunkHandler = (e) => {
        const msg = e.data;
        if (msg.messageId !== messageId) return;

        if (msg.type === 'complete') {
          activeWorker.removeEventListener('message', chunkHandler);
          chunkResults.push(msg.text);
          removeTypingIndicator();
          // Show intermediate result
          addAiMessage(`✅ Chunk ${chunkNum}/${totalChunks}: ${msg.text.substring(0, 100)}...`);
          addTypingIndicator();
          chunkIndex++;
          aiIsGenerating = false;
          // Process next chunk after a small delay
          setTimeout(processNextChunk, 100);
        } else if (msg.type === 'error') {
          activeWorker.removeEventListener('message', chunkHandler);
          removeTypingIndicator();
          addAiMessage(`❌ Error on chunk ${chunkNum}: ${msg.message}`);
          aiIsGenerating = false;
          aiSendBtn.disabled = false;
        }
      };
      activeWorker.addEventListener('message', chunkHandler);
      addTypingIndicator();

      activeWorker.postMessage({
        type: 'generate',
        taskType: action,
        context: chunks[chunkIndex],
        userPrompt: null,
        messageId,
        enableThinking
      });
    }

    processNextChunk();
  }

  // --- Quick Action Chips ---
  document.querySelectorAll('.ai-action-chip').forEach(chip => {
    chip.addEventListener('click', function () {
      const action = this.dataset.action;
      // Check editor selection first, then preview selection
      let selectedText = markdownEditor.value.substring(savedSelection.start, savedSelection.end);
      if (!selectedText) {
        const sel = window.getSelection();
        selectedText = sel ? sel.toString().trim() : '';
      }
      const editorContent = markdownEditor.value;

      const isCurrentModelReady2 = isCurrentModelReady();
      if (!isCurrentModelReady2) {
        openAiPanel();
        return;
      }

      // Ensure panel is open
      if (!aiPanelOpen) openAiPanel();

      switch (action) {
        case 'summarize':
        case 'expand':
        case 'rephrase':
        case 'grammar': {
          if (!editorContent.trim() && !selectedText.trim()) {
            addAiMessage('Please add some text in the editor first.');
            return;
          }
          if (selectedText) {
            // Selected text — process directly
            addAiMessage(`Using selected text (${selectedText.length} chars)`, 'user');
            sendToAi(action, selectedText, null);
          } else if (editorContent.length > 1500) {
            // Large document — agent-style chunked processing
            processDocumentInChunks(action, editorContent);
          } else {
            // Small document — process all at once
            addAiMessage(`Using entire document (${editorContent.length} chars)`, 'user');
            sendToAi(action, editorContent, null);
          }
          break;
        }
        case 'explain':
        case 'simplify':
          if (!selectedText) {
            addAiMessage('Please select some text in the editor to explain or simplify.');
            return;
          }
          sendToAi(action, selectedText, `Please ${action} this text.`);
          break;
        case 'autocomplete': {
          const textBeforeCursor = editorContent.substring(0, savedSelection.start);
          if (!textBeforeCursor.trim()) {
            addAiMessage('Place your cursor after some text in the editor to auto-complete.');
            return;
          }
          sendToAi('autocomplete', textBeforeCursor, null);
          break;
        }
        case 'markdown':
          // Focus the input for user to type their request
          aiInput.placeholder = 'Describe what markdown to generate...';
          aiInput.focus();
          break;
      }
    });
  });

  // --- Ctrl+Space for Auto-Complete ---
  markdownEditor.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
      e.preventDefault();
      const isCurrentReady = isCurrentModelReady();
      if (!isCurrentReady) {
        openAiPanel();
        return;
      }
      if (!aiPanelOpen) openAiPanel();

      const textBeforeCursor = markdownEditor.value.substring(0, markdownEditor.selectionStart);
      if (textBeforeCursor.trim()) {
        sendToAi('autocomplete', textBeforeCursor, null);
      }
    }
  });

  // --- Context Menu (on text selection in editor OR preview) ---
  let contextMenuTimeout = null;
  let savedContextText = ''; // Stores selected text from either pane

  // Editor text selection
  markdownEditor.addEventListener('mouseup', (e) => {
    clearTimeout(contextMenuTimeout);
    contextMenuTimeout = setTimeout(() => {
      const selectedText = markdownEditor.value.substring(
        markdownEditor.selectionStart,
        markdownEditor.selectionEnd
      );

      const isEditorCtxReady = isCurrentModelReady();
      if (selectedText && selectedText.length > 2 && isEditorCtxReady) {
        savedContextText = selectedText;
        aiContextMenu.style.left = Math.min(e.clientX, window.innerWidth - 180) + 'px';
        aiContextMenu.style.top = Math.min(e.clientY - 10, window.innerHeight - 250) + 'px';
        aiContextMenu.style.display = 'flex';
      } else {
        aiContextMenu.style.display = 'none';
      }
    }, 300);
  });

  // Preview pane text selection
  if (previewPane) {
    previewPane.addEventListener('mouseup', (e) => {
      clearTimeout(contextMenuTimeout);
      contextMenuTimeout = setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString().trim() : '';

        const isCurrentReady3 = isCurrentModelReady();
        if (selectedText && selectedText.length > 2 && isCurrentReady3) {
          savedContextText = selectedText;
          aiContextMenu.style.left = Math.min(e.clientX, window.innerWidth - 180) + 'px';
          aiContextMenu.style.top = Math.min(e.clientY - 10, window.innerHeight - 250) + 'px';
          aiContextMenu.style.display = 'flex';
        } else {
          aiContextMenu.style.display = 'none';
        }
      }, 300);
    });
  }

  // Hide context menu on click elsewhere
  document.addEventListener('mousedown', (e) => {
    if (!aiContextMenu.contains(e.target)) {
      aiContextMenu.style.display = 'none';
    }
  });

  // Context menu actions — uses savedContextText from either pane
  aiContextMenu.querySelectorAll('.ai-ctx-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const action = this.dataset.action;
      aiContextMenu.style.display = 'none';

      if (!savedContextText) return;

      // Open panel if needed
      if (!aiPanelOpen) {
        aiPanel.style.display = 'flex';
        aiPanelOverlay.classList.add('active');
        void aiPanel.offsetWidth;
        aiPanel.classList.add('ai-panel-open');
        aiToggleBtn.classList.add('ai-active');
        aiPanelOpen = true;
      }

      if (['summarize', 'expand', 'rephrase', 'grammar'].includes(action)) {
        sendToAi(action, savedContextText, null);
      } else {
        sendToAi(action, savedContextText, `Please ${action} this text.`);
      }
    });
  });

  // --- Clear Chat ---
  if (aiClearChatBtn) {
    aiClearChatBtn.addEventListener('click', () => {
      aiChatArea.innerHTML = `
        <div class="ai-welcome-message">
          <div class="ai-welcome-icon"><i class="bi bi-stars"></i></div>
          <h5>AI Assistant</h5>
          <p>Switch models below · Local or Cloud</p>
          <div class="ai-welcome-tips">
            <div class="ai-tip"><i class="bi bi-cursor-text"></i> Select text + use quick actions</div>
            <div class="ai-tip"><i class="bi bi-chat-dots"></i> Ask questions about your document</div>
            <div class="ai-tip"><i class="bi bi-keyboard"></i> <kbd>Ctrl</kbd>+<kbd>Space</kbd> for auto-complete</div>
          </div>
        </div>
      `;
    });
  }

  // ==============================================
  // LLM MEMORY CONVERTER
  // ==============================================

  const MEMORY_TEMPLATES = {
    standard: {
      name: "Standard Memory",
      prefix: "<context>\n<memory_document>\n",
      suffix: "\n</memory_document>\n</context>",
      sectionWrap: (title, content) => `<section name="${title}">\n${content}\n</section>`,
    },
    system: {
      name: "System Prompt Block",
      prefix: "<user_context>\nThe following is structured memory about the user and their projects:\n\n",
      suffix: "\n</user_context>",
      sectionWrap: (title, content) => `## ${title}\n${content}\n`,
    },
    openai: {
      name: "OpenAI Custom Instructions",
      prefix: "# About Me & My Projects\n\n",
      suffix: "",
      sectionWrap: (title, content) => `## ${title}\n${content}\n`,
    },
    raw: {
      name: "Raw Structured",
      prefix: "---BEGIN CONTEXT---\n",
      suffix: "\n---END CONTEXT---",
      sectionWrap: (title, content) => `[${title.toUpperCase()}]\n${content}\n`,
    },
  };

  function parseMarkdownToSections(md) {
    const lines = md.split("\n");
    const sections = [];
    let currentSection = null;
    let currentContent = [];
    for (const line of lines) {
      const h1 = line.match(/^#\s+(.+)/);
      const h2 = line.match(/^##\s+(.+)/);
      if (h1 || h2) {
        if (currentSection) {
          sections.push({ title: currentSection, content: currentContent.join("\n").trim() });
        }
        currentSection = (h1 || h2)[1];
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    if (currentSection) {
      sections.push({ title: currentSection, content: currentContent.join("\n").trim() });
    }
    return sections;
  }

  function generateMemoryOutput(md, templateKey, meta) {
    const t = MEMORY_TEMPLATES[templateKey];
    const sections = parseMarkdownToSections(md);
    let output = t.prefix;

    if (meta.title || meta.author || meta.tags) {
      let metaBlock = "<metadata>\n";
      if (meta.title) metaBlock += `  title: ${meta.title}\n`;
      if (meta.author) metaBlock += `  author: ${meta.author}\n`;
      if (meta.tags) metaBlock += `  tags: ${meta.tags}\n`;
      metaBlock += `  generated: ${new Date().toISOString().split("T")[0]}\n`;
      metaBlock += `  format: llm-memory-v1\n`;
      metaBlock += "</metadata>\n\n";
      output += metaBlock;
    }

    if (meta.summary) {
      output += `<summary>\n${meta.summary}\n</summary>\n\n`;
    }

    for (const sec of sections) {
      if (sec.content) {
        output += t.sectionWrap(sec.title, sec.content) + "\n";
      }
    }

    output += t.suffix;
    return output.trim();
  }

  // --- Memory Modal UI ---
  const memoryModal = document.getElementById('memory-modal');
  const memoryCloseBtn = document.getElementById('memory-modal-close');
  const memoryOutputPre = document.getElementById('memory-output-pre');
  const memoryOutputLabel = document.getElementById('memory-output-label');
  const memoryCopyOutputBtn = document.getElementById('memory-copy-output');
  const memoryCopyBlockBtn = document.getElementById('memory-copy-block');
  const memoryDownloadMd = document.getElementById('memory-download-md');
  const memoryDownloadTxt = document.getElementById('memory-download-txt');
  const memoryGenLink = document.getElementById('memory-gen-link');
  const memoryShareResult = document.getElementById('memory-share-result');
  const memoryToggleApi = document.getElementById('memory-toggle-api');
  const memoryApiExample = document.getElementById('memory-api-example');

  let memoryTemplate = 'standard';
  let memoryModalOpen = false;

  function getMemoryMeta() {
    return {
      title: document.getElementById('memory-meta-title').value.trim(),
      author: document.getElementById('memory-meta-author').value.trim(),
      tags: document.getElementById('memory-meta-tags').value.trim(),
      summary: document.getElementById('memory-meta-summary').value.trim(),
    };
  }

  function getCurrentMemoryOutput() {
    return generateMemoryOutput(markdownEditor.value, memoryTemplate, getMemoryMeta());
  }

  function updateMemoryStats() {
    const md = markdownEditor.value;
    const output = getCurrentMemoryOutput();
    const wordCount = md.split(/\s+/).filter(Boolean).length;
    const tokenEstimate = Math.round(output.split(/\s+/).filter(Boolean).length * 1.3);
    const sectionCount = parseMarkdownToSections(md).length;

    document.getElementById('memory-word-count').textContent = wordCount + ' words';
    document.getElementById('memory-token-count').textContent = '~' + tokenEstimate + ' tokens';
    document.getElementById('memory-section-count').textContent = sectionCount + ' sections';

    const sizeLabel = document.getElementById('memory-size-label');
    if (tokenEstimate < 2000) {
      sizeLabel.textContent = 'compact';
      sizeLabel.className = 'memory-size-compact';
    } else if (tokenEstimate < 8000) {
      sizeLabel.textContent = 'medium';
      sizeLabel.className = 'memory-size-medium';
    } else {
      sizeLabel.textContent = 'large';
      sizeLabel.className = 'memory-size-large';
    }
  }

  function refreshMemoryOutput() {
    const output = getCurrentMemoryOutput();
    memoryOutputPre.textContent = output;
    memoryOutputLabel.textContent = 'Generated Memory · ' + MEMORY_TEMPLATES[memoryTemplate].name;
    updateMemoryStats();
  }

  function openMemoryModal() {
    memoryModal.style.display = 'flex';
    memoryModalOpen = true;
    refreshMemoryOutput();
  }

  function closeMemoryModal() {
    memoryModal.style.display = 'none';
    memoryModalOpen = false;
  }

  // Open from export dropdown
  const exportLlmBtn = document.getElementById('export-llm-memory');
  if (exportLlmBtn) {
    exportLlmBtn.addEventListener('click', openMemoryModal);
  }
  const mobileExportLlm = document.getElementById('mobile-export-llm-memory');
  if (mobileExportLlm) {
    mobileExportLlm.addEventListener('click', () => {
      // Close mobile menu
      const mobilePanel = document.getElementById('mobile-menu-panel');
      const mobileOverlay = document.getElementById('mobile-menu-overlay');
      if (mobilePanel) mobilePanel.classList.remove('show');
      if (mobileOverlay) mobileOverlay.classList.remove('show');
      openMemoryModal();
    });
  }

  // Close
  memoryCloseBtn.addEventListener('click', closeMemoryModal);
  memoryModal.addEventListener('click', (e) => {
    if (e.target === memoryModal) closeMemoryModal();
  });

  // Tabs
  document.querySelectorAll('.memory-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.memory-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.memory-tab-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const tabId = 'memory-tab-' + this.dataset.tab;
      document.getElementById(tabId).classList.add('active');

      if (this.dataset.tab === 'output' || this.dataset.tab === 'share') {
        refreshMemoryOutput();
      }
    });
  });

  // Template selection
  document.querySelectorAll('.memory-template-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.memory-template-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      memoryTemplate = this.dataset.template;
      refreshMemoryOutput();
    });
  });

  // Metadata fields → live refresh
  ['memory-meta-title', 'memory-meta-author', 'memory-meta-tags', 'memory-meta-summary'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', refreshMemoryOutput);
  });

  // Copy helpers
  function memoryCopyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const origHtml = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = origHtml;
      }, 2000);
    }).catch(() => { });
  }

  memoryCopyOutputBtn.addEventListener('click', () => {
    memoryCopyText(getCurrentMemoryOutput(), memoryCopyOutputBtn);
  });

  memoryCopyBlockBtn.addEventListener('click', () => {
    memoryCopyText(getCurrentMemoryOutput(), memoryCopyBlockBtn);
  });

  // Download
  function memoryDownload(ext) {
    const output = getCurrentMemoryOutput();
    const meta = getMemoryMeta();
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memory-${meta.title || "context"}-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  memoryDownloadMd.addEventListener('click', () => memoryDownload('md'));
  memoryDownloadTxt.addEventListener('click', () => memoryDownload('txt'));

  // Generate shareable link
  memoryGenLink.addEventListener('click', () => {
    const output = getCurrentMemoryOutput();
    try {
      const encoded = btoa(unescape(encodeURIComponent(output)));
      if (encoded.length > 8000) {
        memoryShareResult.style.display = 'block';
        memoryShareResult.className = 'error';
        memoryShareResult.innerHTML = 'Content too large for URL encoding. Use download or copy instead.';
      } else {
        const dataUrl = `data:text/plain;base64,${encoded}`;
        memoryShareResult.style.display = 'flex';
        memoryShareResult.className = 'success';
        memoryShareResult.innerHTML = `<input readonly value="${dataUrl}"><button class="memory-action-btn" id="memory-copy-link"><i class="bi bi-clipboard"></i> Copy</button>`;
        document.getElementById('memory-copy-link').addEventListener('click', function () {
          memoryCopyText(dataUrl, this);
        });
      }
    } catch {
      memoryShareResult.style.display = 'block';
      memoryShareResult.className = 'error';
      memoryShareResult.innerHTML = 'Failed to encode content.';
    }
  });

  // API example toggle
  memoryToggleApi.addEventListener('click', () => {
    const showing = memoryApiExample.style.display !== 'none';
    memoryApiExample.style.display = showing ? 'none' : 'block';
    memoryToggleApi.textContent = showing ? 'Show Code' : 'Hide Code';
  });

  // --- Unified Escape Key Handler (priority-based, topmost overlay wins) ---
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    // Priority 0: Memory modal
    if (memoryModalOpen) {
      closeMemoryModal();
      return;
    }
    // Priority 0b: API key modal
    if (aiApikeyModal && aiApikeyModal.style.display === 'flex') {
      hideApiKeyModal();
      return;
    }
    // Priority 1: AI consent modal (topmost dialog)
    if (aiConsentModal.style.display === 'flex') {
      hideAiConsentDialog();
      return;
    }
    // Priority 2: Mermaid zoom modal
    if (mermaidZoomModal.classList.contains('active')) {
      closeMermaidModal();
      return;
    }
    // Priority 3: Presentation mode
    if (slideContainer.style.display !== 'none') {
      exitPresentation();
      return;
    }
    // Priority 4: Share result modal
    if (shareResultModal.classList.contains('active')) {
      closeShareResultModal();
      return;
    }
    // Priority 5: AI panel
    if (aiPanelOpen) {
      closeAiPanel();
      return;
    }
    // Priority 6: Find/Replace bar
    if (findReplaceBar.style.display === 'block') {
      closeFindBar();
      return;
    }
    // Priority 7: Zen mode
    if (isZenMode) {
      toggleZenMode();
      return;
    }
  });

});