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

    const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
    const highlightedCode = hljs.highlight(code, {
      language: validLanguage,
    }).value;
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

This is a fully client-side application. Your content never leaves your browser and stays secure on your device.`;

  markdownEditor.value = sampleMarkdown;

  function renderMarkdown() {
    try {
      const markdown = markdownEditor.value;
      const html = marked.parse(markdown);
      const sanitizedHtml = DOMPurify.sanitize(html, {
        ADD_TAGS: ['mjx-container'],
        ADD_ATTR: ['id', 'class']
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

  function importMarkdownFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      markdownEditor.value = e.target.result;
      renderMarkdown();
      dropzone.style.display = "none";
    };
    reader.readAsText(file);
  }

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

    isEditorScrolling = true;
    clearTimeout(scrollSyncTimeout);

    scrollSyncTimeout = setTimeout(() => {
      const editorScrollRatio =
        editorPane.scrollTop /
        (editorPane.scrollHeight - editorPane.clientHeight);
      const previewScrollPosition =
        (previewPane.scrollHeight - previewPane.clientHeight) *
        editorScrollRatio;

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

    isPreviewScrolling = true;
    clearTimeout(scrollSyncTimeout);

    scrollSyncTimeout = setTimeout(() => {
      const previewScrollRatio =
        previewPane.scrollTop /
        (previewPane.scrollHeight - previewPane.clientHeight);
      const editorScrollPosition =
        (editorPane.scrollHeight - editorPane.clientHeight) *
        previewScrollRatio;

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
      toggleSyncButton.innerHTML = '<i class="bi bi-link"></i> Sync On';
      toggleSyncButton.classList.add("sync-enabled");
      toggleSyncButton.classList.remove("sync-disabled");
    } else {
      toggleSyncButton.innerHTML = '<i class="bi bi-link-45deg"></i> Sync Off';
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
      importMarkdownFile(file);
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
    try {
      const originalText = exportPdf.innerHTML;
      exportPdf.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating...';
      exportPdf.disabled = true;

      const progressContainer = document.createElement('div');
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

      const tempElement = document.createElement("div");
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

      const progressContainer = document.querySelector('div[style*="position: fixed"][style*="z-index: 9999"]');
      if (progressContainer) {
        document.body.removeChild(progressContainer);
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
      const isMarkdownFile =
        file.type === "text/markdown" ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".markdown");
      if (isMarkdownFile) {
        importMarkdownFile(file);
      } else {
        alert("Please upload a Markdown file (.md or .markdown)");
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
    // Close Mermaid zoom modal with Escape
    if (e.key === "Escape") {
      closeMermaidModal();
    }
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
  // ENCRYPTED SHARING VIA URL
  // ========================================

  const SHARE_BASE_URL = 'https://markdownview.github.io/';

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

  // --- Share Flow (URL-based, no server needed) ---

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

      // Step 5: Build URL with content in fragment (never sent to server)
      const shareUrl = `${SHARE_BASE_URL}#d=${dataString}&k=${keyString}`;

      // Check URL length
      if (shareUrl.length > 65000) {
        throw new Error('Content too large to share via URL. Try sharing a smaller document.');
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

  // --- Load Shared Flow (from URL fragment) ---

  async function loadSharedMarkdown() {
    const hash = window.location.hash.substring(1); // Remove leading #
    if (!hash) return;

    // Parse fragment: #d=<data>&k=<key>
    const params = new URLSearchParams(hash);
    const dataString = params.get('d');
    const keyString = params.get('k');

    if (!dataString || !keyString) return;

    try {
      // Show loading state
      markdownPreview.innerHTML = '<div style="padding: 40px; text-align: center; opacity: 0.6;"><i class="bi bi-lock"></i> Decrypting shared content...</div>';
      setViewMode('preview');

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
        <p style="opacity: 0.7;">The link may be invalid or the key is incorrect.</p>
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

  document.getElementById('share-button').addEventListener('click', shareMarkdown);
  document.getElementById('mobile-share-button').addEventListener('click', function () {
    closeMobileMenu();
    shareMarkdown();
  });

  // --- Auto-load shared content on page load ---
  loadSharedMarkdown();

});