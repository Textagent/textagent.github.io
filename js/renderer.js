// ============================================
// renderer.js — Marked Renderer, renderMarkdown, Emojis, Stats
// ============================================
(function (M) {
    'use strict';

    // --- Custom Renderer ---
    const renderer = new marked.Renderer();
    renderer.code = function (code, language) {
        if (language === 'mermaid') {
            const uniqueId = 'mermaid-diagram-' + Math.random().toString(36).substr(2, 9);
            return `<div class="mermaid-container"><div class="mermaid" id="${uniqueId}">${code}</div></div>`;
        }

        // Detect executable math code blocks
        if ((language || '').toLowerCase() === 'math') {
            const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<div class="executable-math-container"><pre><code class="hljs math-expr">${escapedCode}</code></pre></div>`;
        }

        // Detect executable HTML code blocks (web sandbox)
        // html-autorun: auto-runs and hides source code (great for quizzes, widgets)
        const htmlLang = (language || '').toLowerCase();
        if (htmlLang === 'html' || htmlLang === 'html-autorun') {
            const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const autorun = htmlLang === 'html-autorun' ? ' data-autorun="true"' : '';
            return `<div class="executable-html-container"${autorun}><pre><code class="hljs html">${escapedCode}</code></pre></div>`;
        }

        // Detect executable Python code blocks (Pyodide sandbox)
        const langLower = (language || '').toLowerCase();
        if (langLower === 'python' || langLower === 'py') {
            const highlightedPy = hljs.highlight(code, { language: 'python' }).value;
            return `<div class="executable-python-container"><pre><code class="hljs python">${highlightedPy}</code></pre></div>`;
        }

        // Detect executable JavaScript code blocks
        if (langLower === 'javascript' || langLower === 'js') {
            const highlightedJs = hljs.highlight(code, { language: 'javascript' }).value;
            return `<div class="executable-js-container"><pre><code class="hljs javascript">${highlightedJs}</code></pre></div>`;
        }

        // Detect executable SQL code blocks
        if (langLower === 'sql') {
            const highlightedSql = hljs.highlight(code, { language: 'sql' }).value;
            return `<div class="executable-sql-container"><pre><code class="hljs sql">${highlightedSql}</code></pre></div>`;
        }

        // Detect executable bash/sh/shell code blocks
        const isExecutable = ['bash', 'sh', 'shell'].includes(langLower);
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
        ...M.markedOptions,
        renderer: renderer,
        highlight: function (code, language) {
            if (language === 'mermaid') return code;
            const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
            return hljs.highlight(code, { language: validLanguage }).value;
        },
    });

    // --- Emoji Processing ---
    M.processEmojis = function (element) {
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

        textNodes.forEach(function (textNode) {
            const text = textNode.nodeValue;
            const emojiRegex = /:([\w+-]+):/g;

            let match;
            let lastIndex = 0;
            let result = '';
            let hasEmoji = false;

            while ((match = emojiRegex.exec(text)) !== null) {
                const shortcode = match[1];
                const emoji = joypixels.shortnameToUnicode(`:${shortcode}:`);

                if (emoji !== `:${shortcode}:`) {
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
    };

    // --- Render Markdown ---
    M.renderMarkdown = function () {
        try {
            const markdown = M.markdownEditor.value;
            // DocGen: preprocess markers into placeholder HTML before rendering
            const markdownForRender = M.transformDocgenMarkdown
                ? M.transformDocgenMarkdown(markdown)
                : markdown;
            // Chain API tag transform (independent component)
            const apiMarkdown = M.transformApiMarkdown
                ? M.transformApiMarkdown(markdownForRender)
                : markdownForRender;
            // Chain Linux tag transform
            const finalMarkdown = M.transformLinuxMarkdown
                ? M.transformLinuxMarkdown(apiMarkdown)
                : apiMarkdown;
            const html = marked.parse(finalMarkdown);
            const sanitizedHtml = DOMPurify.sanitize(html, {
                ADD_TAGS: ['mjx-container', 'button', 'select', 'option'],
                ADD_ATTR: ['id', 'class', 'data-lang', 'data-autorun', 'data-ai-type', 'data-ai-index', 'data-ai-block', 'data-api-index', 'data-linux-index', 'value', 'title', 'selected', 'data-model-id']
            });
            M.markdownPreview.innerHTML = sanitizedHtml;

            // Note: hljs.highlight() is already called in renderer.code() during
            // marked.parse(). No need for a second hljs.highlightElement() pass.

            M.processEmojis(M.markdownPreview);

            // Feature 15: Add anchor links to headings
            if (M.addHeadingAnchors) M.addHeadingAnchors(M.markdownPreview);

            // Feature 14: Process callouts/admonitions
            if (M.processCallouts) M.processCallouts(M.markdownPreview);

            // Feature 13: Process footnotes
            if (M.processFootnotes) M.processFootnotes(M.markdownPreview, markdown);

            // Feature 4: Rebuild TOC
            const _tocPanel = document.getElementById('toc-panel');
            if (_tocPanel && _tocPanel.style.display !== 'none' && typeof M.buildTOC === 'function') {
                M.buildTOC();
            }

            try {
                const mermaidNodes = M.markdownPreview.querySelectorAll('.mermaid');
                if (mermaidNodes.length > 0) {
                    mermaid.run({ nodes: mermaidNodes, suppressErrors: true })
                        .then(function () { if (M.addMermaidToolbars) M.addMermaidToolbars(); })
                        .catch(function (e) {
                            console.warn("Mermaid rendering failed:", e);
                            if (M.addMermaidToolbars) M.addMermaidToolbars();
                        });
                }
            } catch (e) {
                console.warn("Mermaid rendering failed:", e);
            }

            // Feature 25: Render PlantUML diagrams
            if (M.renderPlantUML) M.renderPlantUML(M.markdownPreview);

            // Executable code blocks (just-bash), math, HTML, Python, JS, SQL sandboxes
            if (M.addCodeBlockToolbars) M.addCodeBlockToolbars();
            if (M.addMathBlockToolbars) M.addMathBlockToolbars();
            if (M.addHtmlBlockToolbars) M.addHtmlBlockToolbars();
            if (M.addPythonBlockToolbars) M.addPythonBlockToolbars();
            if (M.addJsBlockToolbars) M.addJsBlockToolbars();
            if (M.addSqlBlockToolbars) M.addSqlBlockToolbars();

            // Table spreadsheet tools (sort, filter, stats, chart, etc.)
            if (M.addTableToolbars) M.addTableToolbars();

            // Feature demo badges (▶ Demo buttons on Feature Showcase headings)
            if (M.attachDemoBadges) M.attachDemoBadges(M.markdownPreview);

            // DocGen: bind preview placeholder card actions
            if (M.bindDocgenPreviewActions) M.bindDocgenPreviewActions(M.markdownPreview);

            // API: bind API card actions (independent component)
            if (M.bindApiPreviewActions) M.bindApiPreviewActions(M.markdownPreview);

            // Linux: bind Linux terminal card actions
            if (M.bindLinuxPreviewActions) M.bindLinuxPreviewActions(M.markdownPreview);

            if (window.MathJax) {
                try {
                    MathJax.typesetPromise([M.markdownPreview]).then(function () {
                        if (M.addLatexEvalToolbars) M.addLatexEvalToolbars();
                    }).catch(function (err) {
                        console.warn('MathJax typesetting failed:', err);
                    });
                } catch (e) {
                    console.warn("MathJax rendering failed:", e);
                }
            }

            M.updateDocumentStats();
        } catch (e) {
            console.error("Markdown rendering failed:", e);
            M.markdownPreview.textContent = '';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            const strong = document.createElement('strong');
            strong.textContent = 'Error rendering markdown: ';
            errorDiv.appendChild(strong);
            errorDiv.appendChild(document.createTextNode(e.message));
            const pre = document.createElement('pre');
            pre.textContent = M.markdownEditor.value;
            M.markdownPreview.appendChild(errorDiv);
            M.markdownPreview.appendChild(pre);
        }
    };

    // --- Debounced Render ---
    M.debouncedRender = function () {
        clearTimeout(M.markdownRenderTimeout);
        M.markdownRenderTimeout = setTimeout(M.renderMarkdown, M.RENDER_DELAY);
    };

    // --- Document Stats ---
    M.updateDocumentStats = function () {
        const text = M.markdownEditor.value;

        const charCount = text.length;
        M.charCountElement.textContent = charCount.toLocaleString();

        const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
        M.wordCountElement.textContent = wordCount.toLocaleString();

        const readingTimeMinutes = Math.ceil(wordCount / 200);
        M.readingTimeElement.textContent = readingTimeMinutes;
    };
})(window.MDView);
