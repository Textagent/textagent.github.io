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
            desc: 'Clear the editor and start with a fresh, empty document.',
            shortcut: null,
            demo: 'assets/demos/01_privacy_hero.webp'
        },
        '#template-btn, #qab-template, #mobile-template-btn': {
            name: 'Templates',
            desc: 'Browse 81+ professionally designed templates across 11 categories — AI, Documentation, Coding, Maths, PPT, Quiz, Tables, and more.',
            shortcut: null,
            demo: 'assets/demos/03_templates_gallery.webp'
        },
        '#toggle-sync, #mobile-toggle-sync': {
            name: 'Sync Scrolling',
            desc: 'Link the editor and preview panels so they scroll together. Keeps your writing position in sync with the rendered output.',
            shortcut: 'Ctrl+Shift+S',
            demo: null
        },
        '#toc-toggle, #qab-toc': {
            name: 'Table of Contents',
            desc: 'Toggle an auto-generated sidebar showing all headings in your document. Click any heading to jump to that section.',
            shortcut: null,
            demo: null
        },
        '#import-button, #qab-import, #mobile-import-button': {
            name: 'Import File',
            desc: 'Import files in 8 formats — MD, DOCX, XLSX, CSV, HTML, JSON, XML, PDF. All converted to Markdown client-side.',
            shortcut: null,
            demo: 'assets/demos/08_import_export.webp'
        },
        '#exportDropdown': {
            name: 'Export',
            desc: 'Export your document as Markdown (.md), self-contained HTML, smart PDF with page breaks, or LLM Memory format.',
            shortcut: null,
            demo: 'assets/demos/08_import_export.webp'
        },
        '#copy-markdown-button, #qab-copy, #mobile-copy-markdown': {
            name: 'Copy Markdown',
            desc: 'Copy the raw Markdown source text to your clipboard.',
            shortcut: null,
            demo: null
        },
        '#share-button, #qab-share, #mobile-share-button': {
            name: 'Encrypted Share',
            desc: 'Share your document via an encrypted link. Content is compressed and encrypted client-side with AES-256-GCM. Optional passphrase protection.',
            shortcut: null,
            demo: 'assets/demos/09_encrypted_sharing.webp'
        },
        '#ai-toggle-button, #qab-ai, #mobile-ai-button': {
            name: 'AI Assistant',
            desc: 'Open the AI panel to chat, summarize, expand, rephrase, fix grammar, explain, or simplify — with 4 model options (Local Qwen, Gemini, Groq, OpenRouter).',
            shortcut: null,
            demo: 'assets/demos/02_ai_assistant.webp'
        },
        '#ai-model-select-btn, #qab-model': {
            name: 'AI Model Selector',
            desc: 'Switch between AI models — Local Qwen 3.5 (private, runs in browser), Gemini Flash, Groq Llama 70B, or OpenRouter auto-routing.',
            shortcut: null,
            demo: 'assets/demos/02_ai_assistant.webp'
        },
        '#present-button, #qab-present': {
            name: 'Presentation Mode',
            desc: 'Turn your Markdown into a slideshow! Add --- separators for slides, then navigate with arrow keys. Supports speaker notes, overview grid, and 20+ PPT templates.',
            shortcut: null,
            demo: 'assets/demos/05_presentation_mode.webp'
        },
        '#word-wrap-toggle': {
            name: 'Word Wrap',
            desc: 'Toggle line wrapping in the editor. When off, long lines scroll horizontally.',
            shortcut: null,
            demo: null
        },
        '#focus-mode-toggle': {
            name: 'Focus Mode',
            desc: 'Dim surrounding paragraphs to help you concentrate on the current one. Great for deep writing sessions.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '#zen-mode-button': {
            name: 'Zen Mode',
            desc: 'Enter distraction-free fullscreen writing. Just you and your words — no toolbar, no preview, no distractions.',
            shortcut: 'Ctrl+Shift+Z',
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '#speech-to-text-btn, #mobile-speech-btn': {
            name: 'Voice Dictation',
            desc: 'Dictate Markdown hands-free with speech-to-text. Supports voice commands like "new line", "bold", "heading", "bullet", and more. Multi-language support.',
            shortcut: null,
            demo: null
        },
        '#themePickerDropdown': {
            name: 'Preview Theme',
            desc: 'Switch the preview pane between 6 themes — GitHub, GitLab, Notion, Dracula, Solarized, and Evergreen. Each has light and dark variants.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '#theme-toggle, #mobile-theme-toggle': {
            name: 'Dark Mode',
            desc: 'Toggle between light and dark mode. Your preference is saved to localStorage.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '#stats-toggle': {
            name: 'Document Stats',
            desc: 'Show reading time, word count, and character count for your document.',
            shortcut: null,
            demo: null
        },

        // ─── Formatting Toolbar ───
        '[data-action="undo"]': {
            name: 'Undo',
            desc: 'Undo the last edit in the editor.',
            shortcut: 'Ctrl+Z',
            demo: null
        },
        '[data-action="redo"]': {
            name: 'Redo',
            desc: 'Redo the last undone edit.',
            shortcut: 'Ctrl+Y',
            demo: null
        },
        '[data-action="bold"]': {
            name: 'Bold',
            desc: 'Wrap selected text in **bold** markers. If nothing is selected, inserts a bold placeholder.',
            shortcut: 'Ctrl+B',
            demo: null
        },
        '[data-action="italic"]': {
            name: 'Italic',
            desc: 'Wrap selected text in *italic* markers.',
            shortcut: 'Ctrl+I',
            demo: null
        },
        '[data-action="strikethrough"]': {
            name: 'Strikethrough',
            desc: 'Wrap selected text in ~~strikethrough~~ markers.',
            shortcut: null,
            demo: null
        },
        '[data-action="heading"]': {
            name: 'Heading',
            desc: 'Insert a # heading. Repeated clicks cycle through ## and ### levels.',
            shortcut: null,
            demo: null
        },
        '[data-action="link"]': {
            name: 'Link',
            desc: 'Insert a Markdown link [text](url). If text is selected, it becomes the link text.',
            shortcut: 'Ctrl+K',
            demo: null
        },
        '[data-action="image"]': {
            name: 'Image',
            desc: 'Insert a Markdown image ![alt](url). You can also paste images from clipboard.',
            shortcut: null,
            demo: null
        },
        '[data-action="code"]': {
            name: 'Inline Code',
            desc: 'Wrap selected text in `backticks` for inline code formatting.',
            shortcut: null,
            demo: null
        },
        '[data-action="codeblock"]': {
            name: 'Code Block',
            desc: 'Insert a fenced code block with triple backticks. Add a language tag for syntax highlighting. Supports 6 executable languages — Bash, Math, Python, HTML, JS, SQL — all running in-browser.',
            shortcut: null,
            demo: 'assets/demos/04_code_execution.webp'
        },
        '[data-action="ul"]': {
            name: 'Bullet List',
            desc: 'Insert an unordered list item with a - prefix.',
            shortcut: null,
            demo: null
        },
        '[data-action="ol"]': {
            name: 'Numbered List',
            desc: 'Insert an ordered list item with a number prefix.',
            shortcut: null,
            demo: null
        },
        '[data-action="tasklist"]': {
            name: 'Task List',
            desc: 'Insert a checkbox task item — - [ ] for unchecked, - [x] for checked. Renders as interactive checkboxes in the preview.',
            shortcut: null,
            demo: null
        },
        '[data-action="quote"]': {
            name: 'Blockquote',
            desc: 'Insert a > blockquote. Supports GitHub-style alerts: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > [!CAUTION].',
            shortcut: null,
            demo: null
        },
        '[data-action="hr"]': {
            name: 'Horizontal Rule',
            desc: 'Insert a --- horizontal rule. Also used as a slide separator in Presentation Mode.',
            shortcut: null,
            demo: 'assets/demos/05_presentation_mode.webp'
        },
        '[data-action="table"]': {
            name: 'Insert Table',
            desc: 'Insert a Markdown table template. Rendered tables get interactive spreadsheet tools — sort, filter, stats, charts, and inline editing.',
            shortcut: null,
            demo: 'assets/demos/06_table_tools.webp'
        },

        // ─── AI Tags ───
        '[data-action="ai-tag"]': {
            name: 'AI Generate Tag',
            desc: 'Wrap text in {{AI: ...}} — when you click Fill, AI generates content based on your prompt. Great for automated document creation.',
            shortcut: null,
            demo: 'assets/demos/02_ai_assistant.webp'
        },
        '[data-action="think-tag"]': {
            name: 'AI Think Tag',
            desc: 'Wrap text in {{Think: ...}} — AI uses deep reasoning mode to analyze and respond with step-by-step thinking.',
            shortcut: null,
            demo: 'assets/demos/02_ai_assistant.webp'
        },
        '[data-action="image-tag"]': {
            name: 'AI Image Tag',
            desc: 'Wrap text in {{Image: ...}} — AI generates an image from your text description using Gemini Imagen.',
            shortcut: null,
            demo: 'assets/demos/02_ai_assistant.webp'
        },
        '#docgen-fill-btn': {
            name: 'Fill All AI Blocks',
            desc: 'Process all {{AI:}}, {{Think:}}, and {{Image:}} tags in the document. Each block generates independently and can be accepted, rejected, or regenerated.',
            shortcut: null,
            demo: 'assets/demos/02_ai_assistant.webp'
        },
        '#apply-vars-btn': {
            name: 'Template Variables',
            desc: 'Apply $(varName) variable substitutions. If no variable block exists, auto-detects variables in your text and creates a table for you to fill in.',
            shortcut: null,
            demo: 'assets/demos/03_templates_gallery.webp'
        },

        // ─── View Mode Buttons ───
        '[data-mode="editor"]': {
            name: 'Editor Only',
            desc: 'Show only the editor pane — full width for writing.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '[data-mode="split"]': {
            name: 'Split View',
            desc: 'Show editor and preview side by side. Drag the divider to resize.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '[data-mode="preview"]': {
            name: 'Preview Only',
            desc: 'Show only the rendered preview — perfect for reading and reviewing.',
            shortcut: null,
            demo: 'assets/demos/07_writing_modes.webp'
        },
        '[data-mode="ppt"]': {
            name: 'Presentation View',
            desc: 'Enter slideshow mode — each --- separator creates a new slide. Navigate with arrow keys.',
            shortcut: null,
            demo: 'assets/demos/05_presentation_mode.webp'
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

        popover.innerHTML = `
            <div class="help-popover-header">
                <span class="help-popover-title">${data.name}</span>
                <button class="help-popover-close" title="Close"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="help-popover-body">
                <p class="help-popover-desc">${data.desc}</p>
                ${shortcutHtml}
                ${demoButtonHtml}
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
