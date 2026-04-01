// ============================================
// renderer.js — Marked Renderer, renderMarkdown, Emojis, Stats
// ============================================
(function (M) {
    'use strict';

    // --- Custom Renderer ---
    const renderer = new marked.Renderer();
    renderer.code = function (code, language) {
        // Strip @var: annotation from language string (e.g. "javascript @var: result")
        var varName = '';
        if (language) {
            var varMatch = language.match(/@var:\s*(\S+)/);
            if (varMatch) {
                varName = varMatch[1];
                language = language.replace(varMatch[0], '').trim();
            }
        }
        var varAttr = varName ? ` data-var-name="${varName}"` : '';

        if (language === 'mermaid') {
            const uniqueId = 'mermaid-diagram-' + Math.random().toString(36).substr(2, 9);
            return `<div class="mermaid-container"><div class="mermaid" id="${uniqueId}">${code}</div></div>`;
        }

        // ECharts: render JSON option as interactive chart
        if (language === 'echarts') {
            const uniqueId = 'echarts-' + Math.random().toString(36).substr(2, 9);
            const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const encoded = btoa(unescape(encodeURIComponent(code)));
            return `<div class="echarts-container" id="${uniqueId}" data-echarts-option="${encoded}">` +
                `<div class="echarts-chart" style="width:100%;height:400px;"></div>` +
                `<details class="echarts-source"><summary>📊 Chart Source (JSON)</summary>` +
                `<pre><code class="hljs json">${escapedCode}</code></pre></details></div>`;
        }

        // Detect embed grid code blocks
        // Syntax: ```embed cols=2 height=400
        //         https://example.com "My Site"
        //         https://youtube.com/watch?v=xyz "Video"
        //         ```
        const embedMatch = (language || '').match(/^embed(?:\s+(.*))?$/i);
        if (embedMatch) {
            return M.buildEmbedGridHtml ? M.buildEmbedGridHtml(code, embedMatch[1] || '') : '';
        }

        // Detect executable math code blocks
        if ((language || '').toLowerCase() === 'math') {
            const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<div class="executable-math-container"${varAttr}><pre><code class="hljs math-expr">${escapedCode}</code></pre></div>`;
        }

        // Detect executable HTML code blocks (web sandbox)
        // html-autorun: auto-runs and hides source code (great for quizzes, widgets)
        const htmlLang = (language || '').toLowerCase();
        if (htmlLang === 'html' || htmlLang === 'html-autorun') {
            const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const autorun = htmlLang === 'html-autorun' ? ' data-autorun="true"' : '';
            return `<div class="executable-html-container"${autorun}${varAttr}><pre><code class="hljs html">${escapedCode}</code></pre></div>`;
        }

        // Detect executable Python code blocks (Pyodide sandbox)
        const langLower = (language || '').toLowerCase();
        if (langLower === 'python' || langLower === 'py') {
            const highlightedPy = hljs.highlight(code, { language: 'python' }).value;
            return `<div class="executable-python-container"${varAttr}><pre><code class="hljs python">${highlightedPy}</code></pre></div>`;
        }

        // Detect executable JavaScript code blocks
        if (langLower === 'javascript' || langLower === 'js') {
            const highlightedJs = hljs.highlight(code, { language: 'javascript' }).value;
            return `<div class="executable-js-container"${varAttr}><pre><code class="hljs javascript">${highlightedJs}</code></pre></div>`;
        }

        // Detect executable SQL code blocks
        if (langLower === 'sql') {
            const highlightedSql = hljs.highlight(code, { language: 'sql' }).value;
            return `<div class="executable-sql-container"${varAttr}><pre><code class="hljs sql">${highlightedSql}</code></pre></div>`;
        }

        // Detect executable bash/sh/shell code blocks
        const isExecutable = ['bash', 'sh', 'shell'].includes(langLower);
        const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
        const highlightedCode = hljs.highlight(code, {
            language: isExecutable ? 'bash' : validLanguage,
        }).value;

        if (isExecutable) {
            return `<div class="executable-code-container" data-lang="${language}"${varAttr}><pre><code class="hljs bash">${highlightedCode}</code></pre></div>`;
        }
        return `<pre><code class="hljs ${validLanguage}">${highlightedCode}</code></pre>`;
    };

    // --- Video-aware image renderer ---
    // Intercept ![alt](url) for video files, YouTube, and Vimeo URLs.
    // Falls through to a normal <img> for everything else.
    const defaultImageRenderer = renderer.image;
    renderer.image = function (href, title, text) {
        // Normalize: marked v9+ may pass an object {href, title, text}
        if (typeof href === 'object' && href !== null) {
            title = href.title;
            text = href.text;
            href = href.href;
        }
        if (M.isVideoUrl && M.isVideoUrl(href)) {
            return M.buildVideoPlayerHtml(href, text || title);
        }
        if (M.isYouTubeUrl && M.isYouTubeUrl(href)) {
            return M.buildYouTubeEmbedHtml(href, text || title);
        }
        if (M.isVimeoUrl && M.isVimeoUrl(href)) {
            return M.buildVimeoEmbedHtml(href, text || title);
        }
        // Default image rendering — resolve gen-img: references first
        if (href && href.startsWith('gen-img:')) {
            var genId = href.substring(8); // strip "gen-img:"
            var registry = window.MDView && window.MDView._genImages;
            if (registry && registry[genId]) {
                href = registry[genId];
            }
        }
        var out = `<img src="${href}" alt="${text || ''}"` +
            (title ? ` title="${title}"` : '') + '>';
        return out;
    };

    marked.setOptions({
        ...M.markedOptions,
        renderer: renderer,
        highlight: function (code, language) {
            if (language === 'mermaid' || language === 'echarts') return code;
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

    // --- Shared Rendering Pipeline ---
    // Renders the current markdown into a given container element.
    // Performs all transforms, parsing, sanitization, and DOM post-processing
    // so that exports produce the same HTML as the live preview.
    M.renderMarkdownToContainer = function (container) {
        var markdown = M.markdownEditor.value;
        // DocGen: preprocess markers into placeholder HTML before rendering
        var markdownForRender = M.transformDocgenMarkdown
            ? M.transformDocgenMarkdown(markdown)
            : markdown;
        // Chain API tag transform (independent component)
        var apiMarkdown = M.transformApiMarkdown
            ? M.transformApiMarkdown(markdownForRender)
            : markdownForRender;
        // Chain Linux tag transform
        var linuxMarkdown = M.transformLinuxMarkdown
            ? M.transformLinuxMarkdown(apiMarkdown)
            : apiMarkdown;
        // Chain Game tag transform
        var gameMarkdown = M.transformGameMarkdown
            ? M.transformGameMarkdown(linuxMarkdown)
            : linuxMarkdown;
        // Chain Git tag transform
        var gitMarkdown = M.transformGitMarkdown
            ? M.transformGitMarkdown(gameMarkdown)
            : gameMarkdown;
        // Chain Draw tag transform (Excalidraw + Mermaid)
        var drawMarkdown = M.transformDrawMarkdown
            ? M.transformDrawMarkdown(gitMarkdown)
            : gitMarkdown;
        // Chain Tools tag transform (Web Scrape & Search)
        var toolsMarkdown = M.transformToolsMarkdown
            ? M.transformToolsMarkdown(drawMarkdown)
            : drawMarkdown;
        // Chain Form tag transform
        var formMarkdown = M.transformFormMarkdown
            ? M.transformFormMarkdown(toolsMarkdown)
            : toolsMarkdown;
        // Chain Quiz tag transform
        var finalMarkdown = M.transformQuizMarkdown
            ? M.transformQuizMarkdown(formMarkdown)
            : formMarkdown;
        var chartMarkdown = M.transformChartMarkdown
            ? M.transformChartMarkdown(finalMarkdown)
            : finalMarkdown;
        // Chain AI Tag transform (annotation pills)
        var aiTagMarkdown = M.transformAiTagMarkdown
            ? M.transformAiTagMarkdown(chartMarkdown)
            : chartMarkdown;
        // Chain Research Loop transform
        var researchMarkdown = M.transformResearchMarkdown
            ? M.transformResearchMarkdown(aiTagMarkdown)
            : aiTagMarkdown;
        // Convert <!-- pagebreak --> comments into visible div markers
        researchMarkdown = researchMarkdown.replace(
            /<!--\s*pagebreak\s*-->/gi,
            '\n<div class="page-break-marker" data-pagebreak="true"></div>\n'
        );
        var html = marked.parse(researchMarkdown);
        var sanitizedHtml = DOMPurify.sanitize(html, {
            ADD_TAGS: ['mjx-container', 'button', 'select', 'option', 'video', 'source', 'iframe', 'video-player', 'video-skin'],
            ADD_ATTR: ['id', 'class', 'data-lang', 'data-autorun', 'data-ai-type', 'data-ai-index', 'data-ai-block', 'data-api-index', 'data-linux-index', 'data-linux-lang', 'value', 'title', 'selected', 'data-model-id', 'data-memory-name', 'data-step', 'data-symbol', 'data-widget-loaded', 'data-var-prefix', 'data-range', 'data-interval', 'data-ema', 'data-video-src', 'controls', 'preload', 'playsinline', 'src', 'srcdoc', 'type', 'slot', 'poster', 'allow', 'allowfullscreen', 'frameborder', 'referrerpolicy', 'sandbox', 'loading', 'data-cols', 'target', 'rel', 'width', 'height', 'data-ocr-mode', 'data-mode', 'data-upload-index', 'data-var-name', 'data-game-index', 'data-game-engine', 'data-engine', 'data-git-index', 'data-git-action', 'data-git-repo', 'data-git-copy', 'data-action', 'data-pagebreak', 'data-draw-index', 'data-draw-tool', 'data-tool', 'data-skill', 'spellcheck', 'rows', 'data-tools-index', 'data-tools-action', 'data-tools-copy', 'data-form-index', 'data-name', 'novalidate', 'min', 'max', 'placeholder', 'for', 'data-quiz-index', 'data-bi', 'data-q', 'data-val', 'data-correct', 'data-goto', 'data-right', 'data-pair', 'data-pi', 'data-item', 'data-label', 'data-q-type', 'data-q-template', 'draggable', 'disabled', 'data-field', 'required', 'data-echarts-option', 'data-echarts-code', 'data-rendered', 'data-chart-index', 'data-series-type', 'data-series-template', 'data-tag-id', 'data-tag-type', 'data-tag-color', 'data-tag-count', 'data-tag-anchor', 'data-tag-label', 'data-tag-data', 'data-research-index']
        });
        container.innerHTML = sanitizedHtml;

        // Note: hljs.highlight() is already called in renderer.code() during
        // marked.parse(). No need for a second hljs.highlightElement() pass.

        M.processEmojis(container);

        // Feature 15: Add anchor links to headings
        if (M.addHeadingAnchors) M.addHeadingAnchors(container);

        // Feature 14: Process callouts/admonitions
        if (M.processCallouts) M.processCallouts(container);

        // Feature 13: Process footnotes
        if (M.processFootnotes) M.processFootnotes(container, markdown);
    };

    // --- Render Markdown (live preview) ---
    M.renderMarkdown = async function () {
        try {
            // Core rendering shared with exports
            M.renderMarkdownToContainer(M.markdownPreview);

            // Feature 4: Rebuild TOC
            const _tocPanel = document.getElementById('toc-panel');
            if (_tocPanel && _tocPanel.style.display !== 'none' && typeof M.buildTOC === 'function') {
                M.buildTOC();
            }

            try {
                const mermaidNodes = M.markdownPreview.querySelectorAll('.mermaid');
                if (mermaidNodes.length > 0) {
                    const mermaidLib = await window.getMermaid();
                    await M.initMermaid();
                    mermaidLib.run({ nodes: mermaidNodes, suppressErrors: true })
                        .then(function () { if (M.addMermaidToolbars) M.addMermaidToolbars(); })
                        .catch(function (e) {
                            console.warn("Mermaid rendering failed:", e);
                            if (M.addMermaidToolbars) M.addMermaidToolbars();
                        });
                }
            } catch (e) {
                console.warn("Mermaid rendering failed:", e);
            }

            // ECharts: render chart containers
            try {
                // Dispose old ECharts instances to prevent memory leak
                if (M._activeCharts) {
                    M._activeCharts.forEach(function(c) {
                        try { c.dispose(); } catch(e) {}
                    });
                }
                M._activeCharts = [];
                const echartsNodes = M.markdownPreview.querySelectorAll('.echarts-container');
                if (echartsNodes.length > 0) {
                    const ec = await window.getECharts();
                    echartsNodes.forEach(function (node) {
                        const chartDiv = node.querySelector('.echarts-chart');
                        if (!chartDiv || chartDiv.dataset.rendered) return;
                        chartDiv.dataset.rendered = 'true'; // Mark early to prevent re-entry
                        try {
                            if (node.dataset.echartsCode) {
                                // Code mode: execute JS to get option
                                var code = decodeURIComponent(escape(atob(node.dataset.echartsCode)));
                                // Detect advanced mode: code uses registerMap, fetch, $.get, or myChart
                                var needsAdvanced = /registerMap|fetch\s*\(|\$\.(get|post|ajax)\s*\(|myChart\s*\./i.test(code);
                                if (needsAdvanced) {
                                    // Advanced async mode: give code access to echarts lib & chart instance
                                    var chart = ec.init(chartDiv, 'dark');
                                    M._activeCharts.push(chart);
                                    new ResizeObserver(function () { chart.resize(); }).observe(chartDiv);
                                    // Build async execution context
                                    var asyncCode = '(async function(echarts, myChart, chartDom) {\n'
                                        + code + '\n'
                                        + '})';
                                    try {
                                        var asyncFn = eval(asyncCode);
                                        asyncFn(ec, chart, chartDiv).catch(function(err) {
                                            console.warn('[Chart DocGen] Async code error:', err.message);
                                            chartDiv.textContent = '⚠️ ECharts async error: ' + err.message;
                                            chartDiv.style.color = '#f87171';
                                            chartDiv.style.padding = '16px';
                                        });
                                    } catch (e2) {
                                        chartDiv.textContent = '⚠️ ECharts code error: ' + e2.message;
                                        chartDiv.style.color = '#f87171';
                                        chartDiv.style.padding = '16px';
                                    }
                                } else {
                                    // Simple sync mode: just extract option
                                    var option = null;
                                    if (M.executeEChartCode) {
                                        option = M.executeEChartCode(code);
                                    }
                                    if (!option) {
                                        chartDiv.textContent = '⚠️ ECharts code error: could not produce option';
                                        chartDiv.style.color = '#f87171';
                                        chartDiv.style.padding = '16px';
                                        return;
                                    }
                                    if (!option.backgroundColor) option.backgroundColor = 'transparent';
                                    var chart = ec.init(chartDiv, 'dark');
                                    M._activeCharts.push(chart);
                                    chart.setOption(option);
                                    new ResizeObserver(function () { chart.resize(); }).observe(chartDiv);
                                }
                            } else if (node.dataset.echartsOption) {
                                // Declarative mode: parse JSON option
                                const json = decodeURIComponent(escape(atob(node.dataset.echartsOption)));
                                var option = JSON.parse(json);
                                if (!option.backgroundColor) option.backgroundColor = 'transparent';
                                const chart = ec.init(chartDiv, 'dark');
                                M._activeCharts.push(chart);
                                chart.setOption(option);
                                new ResizeObserver(function () { chart.resize(); }).observe(chartDiv);
                            }
                        } catch (e) {
                            chartDiv.textContent = '⚠️ ECharts error: ' + e.message;
                            chartDiv.style.color = '#f87171';
                            chartDiv.style.padding = '16px';
                        }
                    });
                }
            } catch (e) {
                console.warn('ECharts rendering failed:', e);
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

            // Add copy button to ALL code blocks that don't already have a toolbar
            M.markdownPreview.querySelectorAll('pre').forEach(function (pre) {
                // Skip if inside an executable container (already has toolbar)
                if (pre.closest('.executable-code-container, .executable-math-container, .executable-html-container, .executable-python-container, .executable-js-container, .executable-sql-container')) return;
                // Skip if already has a copy button
                if (pre.querySelector('.pre-copy-btn')) return;

                var btn = document.createElement('button');
                btn.className = 'pre-copy-btn';
                btn.textContent = '📋';
                btn.title = 'Copy to clipboard';
                btn.addEventListener('click', function () {
                    var code = pre.querySelector('code');
                    var text = code ? code.textContent : pre.textContent;
                    navigator.clipboard.writeText(text).then(function () {
                        btn.textContent = '✅';
                        setTimeout(function () { btn.textContent = '📋'; }, 1500);
                    }).catch(function () {
                        btn.textContent = '❌';
                        setTimeout(function () { btn.textContent = '📋'; }, 1500);
                    });
                });
                pre.appendChild(btn);
            });

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

            // Game: bind Game Builder card actions
            if (M.bindGamePreviewActions) M.bindGamePreviewActions(M.markdownPreview);

            // Git: bind GitHub Tools card actions
            if (M.bindGitPreviewActions) M.bindGitPreviewActions(M.markdownPreview);

            // Draw: bind Excalidraw/Mermaid card actions
            if (M.bindDrawPreviewActions) M.bindDrawPreviewActions(M.markdownPreview);

            // Tools: bind Web Scrape/Search card actions
            if (M.bindToolsPreviewActions) M.bindToolsPreviewActions(M.markdownPreview);

            // Forms: bind form submission handlers
            if (M.bindFormPreviewActions) M.bindFormPreviewActions(M.markdownPreview);

            // Quiz: bind quiz card action handlers
            if (M.bindQuizPreviewActions) M.bindQuizPreviewActions(M.markdownPreview);

            // Charts: bind chart card action handlers
            if (M.bindChartPreviewActions) M.bindChartPreviewActions(M.markdownPreview);

            // AI Tags: bind pill click handlers
            if (M.bindAiTagPreviewActions) M.bindAiTagPreviewActions(M.markdownPreview);

            // Research: bind research loop card actions
            if (M.bindResearchPreviewActions) M.bindResearchPreviewActions(M.markdownPreview);

            // Finance: render TradingView stock widgets
            if (M.renderStockWidgets) M.renderStockWidgets(M.markdownPreview);

            // Video: initialize video players (Video.js v10 + native fallback)
            if (M.initVideoPlayers) M.initVideoPlayers(M.markdownPreview);


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
