// ============================================
// tools-docgen.js — {{Tools:}} Tag Component
// Web Scrape (Jina Reader) + Web Search (Jina Search)
// Standalone module — remove this file + its CSS + loader line to disable
// ============================================
(function (M) {
    'use strict';

    // ==============================================
    // CONSTANTS
    // ==============================================
    var TOOLS_TAG_RE = /\{\{@?Tools:\s*([\s\S]*?)\}\}/g;
    var JINA_READER_URL = 'https://r.jina.ai/';
    var JINA_SEARCH_URL = 'https://s.jina.ai/';
    var KEY_STORAGE = M.KEYS ? M.KEYS.API_KEY_JINA : 'textagent-jina-api-key';

    var ACTIONS = [
        { id: 'scrape', icon: '🔗', label: 'Scrape' },
        { id: 'search', icon: '🔍', label: 'Search' },
    ];

    // State: generated results per block
    var generatedResults = new Map();

    // Flag: suppress re-render while user is typing in the card input
    var _inputFocused = false;

    // ==============================================
    // HELPERS
    // ==============================================
    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getFencedRanges(md) {
        var ranges = [];
        var re = /(^|\n)(```+|~~~+)/g;
        var m, openIdx = -1;
        while ((m = re.exec(md)) !== null) {
            if (openIdx === -1) { openIdx = m.index; }
            else { ranges.push([openIdx, re.lastIndex]); openIdx = -1; }
        }
        // Inline code spans
        var inlineRe = /`([^`\n]+)`/g;
        while ((m = inlineRe.exec(md)) !== null) {
            ranges.push([m.index, m.index + m[0].length]);
        }
        return ranges;
    }

    function isInsideFence(idx, ranges) {
        for (var i = 0; i < ranges.length; i++) {
            if (idx >= ranges[i][0] && idx < ranges[i][1]) return true;
        }
        return false;
    }

    // ==============================================
    // JINA API KEY
    // ==============================================
    function getJinaKey() {
        return localStorage.getItem(KEY_STORAGE) || '';
    }

    function setJinaKey(key) {
        if (key) {
            localStorage.setItem(KEY_STORAGE, key);
        } else {
            localStorage.removeItem(KEY_STORAGE);
        }
    }

    // ==============================================
    // JINA KEY MODAL
    // ==============================================
    function showKeyModal(callback) {
        var old = document.getElementById('tools-key-modal');
        if (old) old.remove();

        var overlay = document.createElement('div');
        overlay.id = 'tools-key-modal';
        overlay.className = 'tools-key-overlay';
        overlay.innerHTML =
            '<div class="tools-key-dialog">' +
            '<div class="tools-key-header">' +
            '<span>🔑 Jina API Key</span>' +
            '<button class="tools-key-close" title="Close">✕</button>' +
            '</div>' +
            '<div class="tools-key-body">' +
            '<p>Enter your Jina API key for higher rate limits (500 RPM vs 20 RPM without key). The key is stored locally in your browser.</p>' +
            '<p>Get a free key at <a href="https://jina.ai/api-dashboard/key-manager" target="_blank" rel="noopener">jina.ai/api-dashboard</a></p>' +
            '<input type="password" class="tools-key-input" id="tools-key-input" placeholder="jina_xxxxxxxxxxxxxxxxxxxx" value="' + escapeHtml(getJinaKey()) + '" />' +
            '</div>' +
            '<div class="tools-key-actions">' +
            '<button class="tools-btn" id="tools-key-clear">Clear Key</button>' +
            '<button class="tools-btn" id="tools-key-skip">Skip (no key)</button>' +
            '<button class="tools-btn tools-run" id="tools-key-save">Save Key</button>' +
            '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('active'); });

        function close() {
            overlay.classList.remove('active');
            setTimeout(function () { overlay.remove(); }, 200);
        }

        overlay.querySelector('.tools-key-close').addEventListener('click', close);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

        overlay.querySelector('#tools-key-save').addEventListener('click', function () {
            var val = overlay.querySelector('#tools-key-input').value.trim();
            if (val) setJinaKey(val);
            close();
            if (callback) callback(val);
        });

        overlay.querySelector('#tools-key-skip').addEventListener('click', function () {
            close();
            if (callback) callback('');
        });

        overlay.querySelector('#tools-key-clear').addEventListener('click', function () {
            setJinaKey('');
            overlay.querySelector('#tools-key-input').value = '';
            if (M.showToast) M.showToast('🔑 Jina API key cleared', 'info');
        });

        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler, true); }
        }, true);

        setTimeout(function () { overlay.querySelector('#tools-key-input').focus(); }, 100);
    }

    // ==============================================
    // TAG INSERTION
    // ==============================================
    function insertToolsScrapeTag() {
        M.wrapSelectionWith('{{@Tools:\n  @scrape: ', '\n}}', 'https://example.com');
    }

    function insertToolsSearchTag() {
        M.wrapSelectionWith('{{@Tools:\n  @search: ', '\n}}', 'your search query');
    }

    // ==============================================
    // TRANSFORM — convert {{Tools:}} tags to card HTML
    // ==============================================
    function transformToolsMarkdown(markdown) {
        // Skip transform while user is actively typing in a card input
        if (_inputFocused) return markdown;

        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?Tools:\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);
            var prompt = match[1].trim();

            // Detect mode: @scrape: or @search:
            var scrapeMatch = prompt.match(/^(?:@scrape|Scrape):\s*(.*)/mi);
            var searchMatch = prompt.match(/^(?:@search|Search):\s*(.*)/mi);

            var action = scrapeMatch ? 'scrape' : (searchMatch ? 'search' : 'scrape');
            var inputValue = '';
            if (scrapeMatch) {
                inputValue = scrapeMatch[1].trim();
            } else if (searchMatch) {
                inputValue = searchMatch[1].trim();
            }

            var hasKey = !!getJinaKey();

            // Action pills
            var pillsHtml = '<div class="tools-action-pills" data-tools-index="' + blockIndex + '">';
            ACTIONS.forEach(function (a) {
                var cls = a.id === action ? ' active' : '';
                pillsHtml += '<button class="tools-action-pill' + cls + '" data-action="' + a.id + '" data-tools-index="' + blockIndex + '">' + a.icon + ' ' + a.label + '</button>';
            });
            pillsHtml += '</div>';

            // Has result?
            var hasResult = generatedResults.has(blockIndex);
            var resultHtml = '';
            if (hasResult) {
                var savedResult = generatedResults.get(blockIndex);
                resultHtml = '<div class="tools-result" data-tools-index="' + blockIndex + '">'
                    + '<div class="tools-result-content">' + savedResult.html + '</div>'
                    + '<div class="tools-result-actions">'
                    + '<button class="tools-btn tools-reject" data-tools-index="' + blockIndex + '">✕ Reject</button>'
                    + '<button class="tools-btn tools-accept" data-tools-index="' + blockIndex + '">✓ Accept</button>'
                    + '<button class="tools-btn" data-tools-index="' + blockIndex + '" data-tools-copy>📋 Copy</button>'
                    + '</div></div>';
            }

            var placeholderText = action === 'search'
                ? 'Enter search query…'
                : 'Enter URL(s) to scrape (comma-separated)…';

            result += '<div class="tools-card" data-tools-index="' + blockIndex + '" data-tools-action="' + escapeHtml(action) + '">'
                + '<div class="tools-header">'
                + '<span class="tools-icon">🛠️</span>'
                + '<span class="tools-label">Web Tools</span>'
                + '<div class="tools-actions">'
                + '<button class="tools-btn tools-key-btn" data-tools-index="' + blockIndex + '" title="' + (hasKey ? 'Change Jina API key' : 'Set Jina API key') + '">🔑' + (hasKey ? ' ✓' : '') + '</button>'
                + '<button class="tools-btn tools-run" data-tools-index="' + blockIndex + '" title="Run">▶ Run</button>'
                + '<button class="tools-btn tools-remove" data-tools-index="' + blockIndex + '" title="Remove tag">✕</button>'
                + '</div></div>'
                + pillsHtml
                + (!hasKey ? '<div class="tools-key-hint">💡 <a class="tools-set-key" data-tools-index="' + blockIndex + '">Add a Jina API key</a> for higher rate limits (500 RPM vs 20 RPM).</div>' : '')
                + '<div class="tools-input-area">'
                + '<textarea class="tools-input" data-tools-index="' + blockIndex + '" placeholder="' + placeholderText + '" rows="2">' + escapeHtml(inputValue) + '</textarea>'
                + '</div>'
                + resultHtml
                + '</div>';

            blockIndex++;
            lastIndex = match.index + match[0].length;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // SYNC — update editor text when card fields change
    // ==============================================
    function syncFieldToEditor(blockIndex, fieldName, value) {
        var text = M.markdownEditor.value;
        var re = /\{\{@?Tools:\s*([\s\S]*?)\}\}/g;
        var match, idx = 0;
        while ((match = re.exec(text)) !== null) {
            if (idx === blockIndex) {
                var body = match[1];
                var fieldRe = new RegExp('(^|\\n)(\\s*(?:' + fieldName.replace('@', '@?') + '|' + fieldName.replace('@', '') + '):\\s*)(.*)', 'mi');
                var fm = body.match(fieldRe);
                var newBody;
                if (fm) {
                    newBody = body.replace(fieldRe, '$1$2' + value);
                } else {
                    newBody = body.trimEnd() + '\n  ' + fieldName + ': ' + value;
                }
                var newTag = '{{@Tools:\n' + newBody.replace(/^\s*\n/, '') + '\n}}';
                var newText = text.substring(0, match.index) + newTag + text.substring(match.index + match[0].length);
                M.markdownEditor.value = newText;
                // Silently save — do NOT dispatch 'input' which would re-render
                // and destroy the textarea the user is typing in.
                // Trigger autosave only.
                if (M.triggerAutoSave) M.triggerAutoSave();
                return;
            }
            idx++;
        }
    }

    function switchAction(blockIndex, newAction) {
        var text = M.markdownEditor.value;
        var re = /\{\{@?Tools:\s*([\s\S]*?)\}\}/g;
        var match, idx = 0;
        while ((match = re.exec(text)) !== null) {
            if (idx === blockIndex) {
                var body = match[1];
                // Get the current value from either @scrape: or @search:
                var currentScrape = body.match(/^(?:@scrape|Scrape):\s*(.*)/mi);
                var currentSearch = body.match(/^(?:@search|Search):\s*(.*)/mi);
                var currentValue = '';
                if (currentScrape) currentValue = currentScrape[1].trim();
                if (currentSearch) currentValue = currentSearch[1].trim();

                // Remove old field
                var newBody = body
                    .replace(/^\s*(?:@scrape|Scrape):\s*.*/mi, '')
                    .replace(/^\s*(?:@search|Search):\s*.*/mi, '')
                    .replace(/^\s*\n/, '')
                    .trim();

                // Add new field
                var fieldName = newAction === 'search' ? '@search' : '@scrape';
                newBody = fieldName + ': ' + currentValue + (newBody ? '\n  ' + newBody : '');

                var newTag = '{{@Tools:\n  ' + newBody + '\n}}';
                var newText = text.substring(0, match.index) + newTag + text.substring(match.index + match[0].length);
                M.markdownEditor.value = newText;
                M.markdownEditor.dispatchEvent(new Event('input'));
                M.renderMarkdown();
                return;
            }
            idx++;
        }
    }

    // ==============================================
    // BIND — wire up card buttons after render
    // ==============================================
    function bindToolsPreviewActions(container) {
        // ▶ Run
        container.querySelectorAll('.tools-run').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.toolsIndex, 10);
                runTools(idx, container);
            });
        });

        // 🔑 Key button
        container.querySelectorAll('.tools-key-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                showKeyModal(function () {
                    M.renderMarkdown();
                });
            });
        });

        // Key hint link
        container.querySelectorAll('.tools-set-key').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                showKeyModal(function () {
                    M.renderMarkdown();
                });
            });
        });

        // ✕ Remove tag
        container.querySelectorAll('.tools-remove').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.toolsIndex, 10);
                removeToolsTag(idx);
            });
        });

        // Action pills (Scrape / Search toggle)
        container.querySelectorAll('.tools-action-pill').forEach(function (pill) {
            pill.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.toolsIndex, 10);
                var newAction = this.dataset.action;
                switchAction(idx, newAction);
            });
        });

        // Input textarea sync (debounced) — with focus tracking to prevent re-render loop
        container.querySelectorAll('.tools-input').forEach(function (ta) {
            var timer = null;
            ta.addEventListener('focus', function () { _inputFocused = true; });
            ta.addEventListener('blur', function () {
                _inputFocused = false;
                // Final sync on blur — update editor and re-render once
                var self = this;
                clearTimeout(timer);
                var idx = parseInt(self.dataset.toolsIndex, 10);
                var card = self.closest('.tools-card');
                var action = card ? card.dataset.toolsAction : 'scrape';
                var fieldName = action === 'search' ? '@search' : '@scrape';
                syncFieldToEditor(idx, fieldName, self.value.trim());
                M.debouncedRender();
            });
            ta.addEventListener('input', function () {
                var self = this;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    var idx = parseInt(self.dataset.toolsIndex, 10);
                    var card = self.closest('.tools-card');
                    var action = card ? card.dataset.toolsAction : 'scrape';
                    var fieldName = action === 'search' ? '@search' : '@scrape';
                    syncFieldToEditor(idx, fieldName, self.value.trim());
                }, 800);
            });
            // Auto-resize
            ta.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
        });

        // Accept
        container.querySelectorAll('.tools-accept').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.toolsIndex, 10);
                acceptResult(idx);
            });
        });

        // Reject
        container.querySelectorAll('.tools-reject').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.toolsIndex, 10);
                generatedResults.delete(idx);
                M.renderMarkdown();
            });
        });

        // Copy
        container.querySelectorAll('[data-tools-copy]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.toolsIndex, 10);
                var r = generatedResults.get(idx);
                if (r && r.raw) {
                    navigator.clipboard.writeText(r.raw).then(function () {
                        btn.textContent = '✅ Copied';
                        setTimeout(function () { btn.textContent = '📋 Copy'; }, 1500);
                    });
                }
            });
        });
    }

    // ==============================================
    // RUN — Execute scrape or search via Jina
    // ==============================================
    async function runTools(blockIndex, container) {
        var card = container.querySelector('.tools-card[data-tools-index="' + blockIndex + '"]');
        if (!card) return;

        var action = card.dataset.toolsAction || 'scrape';
        var inputEl = card.querySelector('.tools-input');
        var inputValue = inputEl ? inputEl.value.trim() : '';

        if (!inputValue) {
            if (M.showToast) M.showToast('⚠️ Please enter ' + (action === 'search' ? 'a search query' : 'URL(s) to scrape'), 'warning');
            return;
        }

        // UI: loading state
        var runBtn = card.querySelector('.tools-run');
        var labelEl = card.querySelector('.tools-label');
        if (runBtn) { runBtn.disabled = true; runBtn.textContent = '⏳ Working…'; }
        if (labelEl) { labelEl.dataset.origText = labelEl.textContent; }
        card.classList.add('tools-loading');

        var apiKey = getJinaKey();
        var headers = {
            'Accept': 'application/json',
        };
        if (apiKey) {
            headers['Authorization'] = 'Bearer ' + apiKey;
        }

        try {
            var markdown = '';

            if (action === 'scrape') {
                // Scrape: fetch each URL via r.jina.ai
                var urls = inputValue.split(',').map(function (u) { return u.trim(); }).filter(Boolean);
                if (urls.length === 0) throw new Error('No URLs provided.');

                if (runBtn) runBtn.textContent = '⏳ Scraping ' + urls.length + ' URL(s)…';
                if (labelEl) labelEl.textContent = 'Scraping…';

                var results = [];
                for (var i = 0; i < urls.length; i++) {
                    var url = urls[i];
                    // Ensure URL has protocol
                    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

                    try {
                        if (runBtn) runBtn.textContent = '⏳ Scraping ' + (i + 1) + '/' + urls.length + '…';
                        var response = await fetch(JINA_READER_URL + url, {
                            headers: headers,
                            signal: AbortSignal.timeout(30000),
                        });

                        if (!response.ok) {
                            results.push('## ❌ Error: ' + url + '\n\nHTTP ' + response.status + ': ' + response.statusText + '\n');
                            continue;
                        }

                        var contentType = response.headers.get('content-type') || '';
                        var body;
                        if (contentType.includes('application/json')) {
                            var json = await response.json();
                            body = json.data && json.data.content ? json.data.content : JSON.stringify(json, null, 2);
                        } else {
                            body = await response.text();
                        }

                        if (urls.length > 1) {
                            results.push('## 📄 ' + url + '\n\n' + body.trim() + '\n');
                        } else {
                            results.push(body.trim());
                        }
                    } catch (fetchErr) {
                        results.push('## ❌ Error: ' + url + '\n\n' + fetchErr.message + '\n');
                    }
                }

                markdown = results.join('\n\n---\n\n');
            } else {
                // Search: query via s.jina.ai
                if (runBtn) runBtn.textContent = '⏳ Searching…';
                if (labelEl) labelEl.textContent = 'Searching…';

                var searchUrl = JINA_SEARCH_URL + encodeURIComponent(inputValue);
                var response = await fetch(searchUrl, {
                    headers: headers,
                    signal: AbortSignal.timeout(15000),
                });

                if (!response.ok) {
                    throw new Error('Jina Search failed: HTTP ' + response.status);
                }

                var contentType = response.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    var json = await response.json();
                    // Parse JSON search results into markdown
                    if (json.data && Array.isArray(json.data)) {
                        var searchResults = json.data.map(function (item, idx) {
                            return '### ' + (idx + 1) + '. ' + (item.title || 'Result') + '\n\n'
                                + (item.content || item.description || '') + '\n\n'
                                + '🔗 [' + (item.url || '') + '](' + (item.url || '') + ')\n';
                        });
                        markdown = '# 🔍 Search Results: ' + inputValue + '\n\n' + searchResults.join('\n---\n\n');
                    } else if (json.data && json.data.content) {
                        markdown = json.data.content;
                    } else {
                        markdown = '```json\n' + JSON.stringify(json, null, 2) + '\n```';
                    }
                } else {
                    markdown = await response.text();
                }
            }

            // Render result as HTML for preview
            var resultHtml = '';
            try {
                resultHtml = marked.parse(markdown);
                resultHtml = DOMPurify.sanitize(resultHtml);
            } catch (e) {
                resultHtml = '<pre>' + escapeHtml(markdown) + '</pre>';
            }

            // Store result
            generatedResults.set(blockIndex, {
                raw: markdown,
                html: resultHtml,
            });

            if (M.showToast) M.showToast('✅ ' + (action === 'search' ? 'Search' : 'Scrape') + ' complete!', 'success');

        } catch (err) {
            console.error('[Tools] Error:', err);
            if (M.showToast) M.showToast('❌ ' + err.message, 'error');
        } finally {
            // Reset UI
            if (runBtn) { runBtn.disabled = false; runBtn.textContent = '▶ Run'; }
            if (labelEl && labelEl.dataset.origText) { labelEl.textContent = labelEl.dataset.origText; }
            card.classList.remove('tools-loading');
        }

        // Re-render to show result
        M.renderMarkdown();
    }

    // ==============================================
    // ACCEPT / REMOVE
    // ==============================================
    function acceptResult(blockIndex) {
        var r = generatedResults.get(blockIndex);
        if (!r || !r.raw) return;

        var text = M.markdownEditor.value;
        var re = /\{\{@?Tools:\s*([\s\S]*?)\}\}/g;
        var match, idx = 0;
        while ((match = re.exec(text)) !== null) {
            if (idx === blockIndex) {
                // Replace the tag with the scraped/searched content
                var before = text.substring(0, match.index);
                var after = text.substring(match.index + match[0].length);
                M.markdownEditor.value = before + r.raw + after;
                M.markdownEditor.dispatchEvent(new Event('input'));
                generatedResults.delete(blockIndex);
                M.renderMarkdown();
                return;
            }
            idx++;
        }
    }

    function removeToolsTag(blockIndex) {
        var text = M.markdownEditor.value;
        var re = /\{\{@?Tools:\s*([\s\S]*?)\}\}/g;
        var match, idx = 0;
        while ((match = re.exec(text)) !== null) {
            if (idx === blockIndex) {
                var newText = text.substring(0, match.index) + text.substring(match.index + match[0].length);
                M.markdownEditor.value = newText.trim();
                M.markdownEditor.dispatchEvent(new Event('input'));
                generatedResults.delete(blockIndex);
                M.renderMarkdown();
                return;
            }
            idx++;
        }
    }

    // ==============================================
    // EXPOSE MODULE
    // ==============================================
    M.transformToolsMarkdown = transformToolsMarkdown;
    M.bindToolsPreviewActions = bindToolsPreviewActions;

    // Register formatting actions
    if (M.registerFormattingAction) {
        M.registerFormattingAction('tools-scrape-tag', insertToolsScrapeTag);
        M.registerFormattingAction('tools-search-tag', insertToolsSearchTag);
    }

})(window.MDView);
