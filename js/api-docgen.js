// ============================================
// api-docgen.js — {{API:}} Tag Component
// Independent REST API call blocks (GET / POST / PUT / DELETE)
// ============================================
(function (M) {
    'use strict';

    // ==============================================
    // GLOBAL STORE for API response variables
    // ==============================================
    if (!window.__API_VARS) window.__API_VARS = {};  // legacy compat

    // Active block operations tracker
    var activeApiOps = new Set();

    // ==============================================
    // HELPERS
    // ==============================================

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function getFencedRanges(md) {
        var ranges = [];
        var re = /^(`{3,}|~{3,}).*$/gm;
        var m, open = null;
        while ((m = re.exec(md)) !== null) {
            if (!open) { open = { start: m.index, fence: m[1] }; }
            else if (m[1].charAt(0) === open.fence.charAt(0) && m[1].length >= open.fence.length) {
                ranges.push({ start: open.start, end: m.index + m[0].length });
                open = null;
            }
        }
        // Inline code spans (`...`)
        var inlineRe = /`([^`\n]+)`/g;
        while ((m = inlineRe.exec(md)) !== null) {
            ranges.push({ start: m.index, end: m.index + m[0].length });
        }
        return ranges;
    }

    function isInsideFence(pos, fencedRanges) {
        for (var i = 0; i < fencedRanges.length; i++) {
            if (pos >= fencedRanges[i].start && pos < fencedRanges[i].end) return true;
        }
        return false;
    }

    // Toast helper — delegates to M.showToast or falls back to console
    function showToast(msg, type) {
        if (M._showToast) { M._showToast(msg, type); }
        else { console.log('[API] ' + msg); }
    }

    // ==============================================
    // TAGGING — insert {{API:}} templates
    // ==============================================

    function insertApiTag(method) {
        if (method === 'POST') {
            M.wrapSelectionWith('{{API:\n  URL: ', '\n  Method: POST\n  Headers: Content-Type: application/json\n  Body: {}\n  Variable: postResult\n}}', 'https://api.example.com/data');
        } else {
            M.wrapSelectionWith('{{API:\n  URL: ', '\n  Method: GET\n  Variable: getResult\n}}', 'https://api.example.com/data');
        }
    }

    // ==============================================
    // PARSING — extract API blocks from markdown
    // ==============================================

    function parseApiConfig(prompt) {
        var config = { url: '', method: 'GET', headers: {}, body: '', variable: '' };
        var lines = prompt.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            var urlMatch = line.match(/^URL:\s*(.+)/i);
            if (urlMatch) { config.url = urlMatch[1].trim(); continue; }
            var methodMatch = line.match(/^Method:\s*(GET|POST|PUT|PATCH|DELETE)/i);
            if (methodMatch) { config.method = methodMatch[1].toUpperCase(); continue; }
            var headersMatch = line.match(/^Headers:\s*(.+)/i);
            if (headersMatch) {
                var pairs = headersMatch[1].split(',');
                for (var h = 0; h < pairs.length; h++) {
                    var sep = pairs[h].indexOf(':');
                    if (sep > 0) {
                        config.headers[pairs[h].substring(0, sep).trim()] = pairs[h].substring(sep + 1).trim();
                    }
                }
                continue;
            }
            var bodyMatch = line.match(/^Body:\s*(.+)/i);
            if (bodyMatch) { config.body = bodyMatch[1].trim(); continue; }
            var varMatch = line.match(/^Variable:\s*(\w+)/i);
            if (varMatch) { config.variable = varMatch[1].trim(); continue; }
        }
        return config;
    }

    function parseApiBlocks(markdown) {
        var blocks = [];
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{API:\s*([\s\S]*?)\}\}/g;
        var match;
        while ((match = re.exec(markdown)) !== null) {
            if (!isInsideFence(match.index, fencedRanges)) {
                var block = {
                    type: 'API',
                    prompt: match[1].trim(),
                    start: match.index,
                    end: match.index + match[0].length,
                    fullMatch: match[0],
                    apiConfig: parseApiConfig(match[1].trim())
                };
                blocks.push(block);
            }
        }
        return blocks;
    }

    // ==============================================
    // RENDERING — transform {{API:}} tags into cards
    // ==============================================

    function transformApiMarkdown(markdown) {
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{API:\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);

            var prompt = match[1].trim();
            var apiCfg = parseApiConfig(prompt);
            var methodClass = apiCfg.method === 'POST' ? 'ai-api-method-post' : apiCfg.method === 'PUT' ? 'ai-api-method-put' : apiCfg.method === 'DELETE' ? 'ai-api-method-delete' : 'ai-api-method-get';

            var configHtml = '<div class="ai-api-config">'
                + '<div class="ai-api-config-row"><span class="ai-api-method ' + methodClass + '">' + escapeHtml(apiCfg.method) + '</span> <span class="ai-api-url">' + escapeHtml(apiCfg.url || 'No URL specified') + '</span></div>';
            if (apiCfg.variable) {
                configHtml += '<div class="ai-api-config-row"><span class="ai-api-var-label">→ $(api_' + escapeHtml(apiCfg.variable) + ')</span></div>';
            }
            configHtml += '</div>';

            result += '<div class="ai-placeholder-card ai-api-card" data-ai-type="API" data-api-index="' + blockIndex + '">'
                + '<div class="ai-placeholder-header">'
                + '<span class="ai-placeholder-icon">🔌</span>'
                + '<span class="ai-placeholder-label">API Call</span>'
                + '<div class="ai-placeholder-actions">'
                + '<button class="ai-placeholder-btn api-fill-one" data-api-index="' + blockIndex + '" title="Run this API call">▶</button>'
                + '<button class="ai-placeholder-btn api-remove-tag" data-api-index="' + blockIndex + '" title="Remove tag">✕</button>'
                + '</div></div>'
                + configHtml
                + '</div>';

            lastIndex = match.index + match[0].length;
            blockIndex++;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // PREVIEW ACTIONS — bind API card buttons
    // ==============================================

    function bindApiPreviewActions(container) {
        container.querySelectorAll('.api-fill-one').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.apiIndex, 10);
                executeApiBlock(idx);
            });
        });

        container.querySelectorAll('.api-remove-tag').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.apiIndex, 10);
                var text = M.markdownEditor.value;
                var blocks = parseApiBlocks(text);
                if (idx < blocks.length) {
                    var block = blocks[idx];
                    var before = text.substring(0, block.start);
                    var after = text.substring(block.end);
                    // Trim surrounding whitespace
                    if (after.charAt(0) === '\n') after = after.substring(1);
                    M.markdownEditor.value = before + after;
                    M.renderMarkdown();
                    showToast('API tag removed.', 'info');
                }
            });
        });
    }

    // ==============================================
    // REVIEW PANEL (borrowed from ai-docgen pattern)
    // ==============================================

    function showApiReviewPanel(blockIndex, resultMd, block) {
        return new Promise(function (resolve) {
            var container = M.markdownPreview;

            // Remove any existing review panels
            container.querySelectorAll('.ai-review-panel').forEach(function (p) { p.remove(); });

            var panel = document.createElement('div');
            panel.className = 'ai-review-panel';

            var header = document.createElement('div');
            header.className = 'ai-review-header';

            var headerLabel = document.createElement('span');
            headerLabel.textContent = '🔌 API Response — Review';
            header.appendChild(headerLabel);

            var btnCopyResp = document.createElement('button');
            btnCopyResp.className = 'ai-review-copy-btn';
            btnCopyResp.textContent = '📋 Copy';
            btnCopyResp.title = 'Copy response to clipboard';
            btnCopyResp.addEventListener('click', function () {
                var raw = resultMd.replace(/^[\s\S]*?```[a-z]*\n/, '').replace(/\n```[\s\S]*$/, '');
                navigator.clipboard.writeText(raw).then(function () {
                    btnCopyResp.textContent = '✅ Copied!';
                    setTimeout(function () { btnCopyResp.textContent = '📋 Copy'; }, 1500);
                }).catch(function () {
                    btnCopyResp.textContent = '❌ Failed';
                    setTimeout(function () { btnCopyResp.textContent = '📋 Copy'; }, 1500);
                });
            });
            header.appendChild(btnCopyResp);
            panel.appendChild(header);

            var body = document.createElement('div');
            body.className = 'ai-review-body';

            // Render the result markdown
            try {
                var resultHtml = marked.parse(resultMd);
                body.innerHTML = DOMPurify.sanitize(resultHtml, {
                    ADD_TAGS: ['mjx-container'],
                    ADD_ATTR: ['id', 'class']
                });
                // Syntax highlight code blocks
                body.querySelectorAll('pre code').forEach(function (codeEl) {
                    hljs.highlightElement(codeEl);
                });
            } catch (e) {
                body.textContent = resultMd;
            }
            panel.appendChild(body);

            var footer = document.createElement('div');
            footer.className = 'ai-review-footer';

            var btnAccept = document.createElement('button');
            btnAccept.className = 'ai-review-btn ai-review-accept';
            btnAccept.textContent = 'Accept';
            btnAccept.addEventListener('click', function () {
                panel.remove();
                resolve('accept');
            });

            var btnRegenerate = document.createElement('button');
            btnRegenerate.className = 'ai-review-btn ai-review-regenerate';
            btnRegenerate.textContent = 'Regenerate';
            btnRegenerate.addEventListener('click', function () {
                panel.remove();
                resolve('regenerate');
            });

            var btnReject = document.createElement('button');
            btnReject.className = 'ai-review-btn ai-review-reject';
            btnReject.textContent = 'Reject';
            btnReject.addEventListener('click', function () {
                panel.remove();
                resolve('reject');
            });

            footer.appendChild(btnAccept);
            footer.appendChild(btnRegenerate);
            footer.appendChild(btnReject);
            panel.appendChild(footer);

            // Insert panel right after the API card that triggered it
            var apiCard = container.querySelector('.ai-api-card[data-api-index="' + blockIndex + '"]');
            if (apiCard && apiCard.parentNode) {
                apiCard.parentNode.insertBefore(panel, apiCard.nextSibling);
            } else {
                container.appendChild(panel);
            }

            // Scroll panel into view
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    // ==============================================
    // EXECUTE — make the API call
    // ==============================================

    function replaceApiBlockByTag(fullMatch, replacement) {
        var text = M.markdownEditor.value;
        var idx = text.indexOf(fullMatch);
        if (idx === -1) return;
        M.markdownEditor.value = text.substring(0, idx) + replacement + text.substring(idx + fullMatch.length);
        M.renderMarkdown();
    }

    async function executeApiBlock(blockIndex) {
        var text = M.markdownEditor.value;
        var blocks = parseApiBlocks(text);
        if (blockIndex >= blocks.length) return;

        var block = blocks[blockIndex];

        if (activeApiOps.has(blockIndex)) {
            showToast('This API call is already running.', 'warning');
            return;
        }

        var config = block.apiConfig || parseApiConfig(block.prompt);
        if (!config.url) {
            showToast('❌ No URL specified in the API block.', 'error');
            return;
        }

        activeApiOps.add(blockIndex);

        // Show loading state on card
        var apiCard = document.querySelector('.ai-api-card[data-api-index="' + blockIndex + '"]');
        if (apiCard) {
            apiCard.classList.add('ai-card-loading');
            var lbl = apiCard.querySelector('.ai-placeholder-label');
            if (lbl) { lbl.dataset.originalText = lbl.textContent; lbl.textContent = 'Calling...'; }
        }

        showToast('🔌 Calling ' + config.method + ' ' + config.url.substring(0, 50) + '...', 'info');

        try {
            var fetchOpts = { method: config.method, mode: 'cors' };

            // Set headers
            var hdrs = new Headers();
            var headerKeys = Object.keys(config.headers);
            for (var h = 0; h < headerKeys.length; h++) {
                hdrs.set(headerKeys[h], config.headers[headerKeys[h]]);
            }
            if (headerKeys.length > 0) fetchOpts.headers = hdrs;

            // Set body for non-GET methods
            if (config.method !== 'GET' && config.body) {
                fetchOpts.body = config.body;
                if (!hdrs.has('Content-Type')) {
                    hdrs.set('Content-Type', 'application/json');
                    fetchOpts.headers = hdrs;
                }
            }

            console.log('[API] Fetching:', config.url, fetchOpts);
            var response = await fetch(config.url, fetchOpts);
            var contentType = response.headers.get('content-type') || '';
            var responseText;

            if (contentType.indexOf('json') !== -1) {
                var jsonData = await response.json();
                responseText = JSON.stringify(jsonData, null, 2);
            } else {
                responseText = await response.text();
            }

            // Store in variable if requested
            if (config.variable) {
                if (M._vars) M._vars.setRuntime('api_' + config.variable, responseText);
                window.__API_VARS['api_' + config.variable] = responseText;
            }

            activeApiOps.delete(blockIndex);

            // Restore card state
            if (apiCard) {
                apiCard.classList.remove('ai-card-loading');
                var lbl2 = apiCard.querySelector('.ai-placeholder-label');
                if (lbl2 && lbl2.dataset.originalText) lbl2.textContent = lbl2.dataset.originalText;
            }

            // Build result markdown
            var statusLine = '**' + config.method + '** `' + config.url + '` → **' + response.status + '**';
            var resultMd = statusLine + '\n\n```json\n' + responseText + '\n```';
            if (config.variable) {
                resultMd += '\n\n> Stored in `$(api_' + config.variable + ')`';
            }

            // Show review panel
            var decision = await showApiReviewPanel(blockIndex, resultMd, block);

            if (decision === 'accept') {
                replaceApiBlockByTag(block.fullMatch, resultMd);
                showToast('✅ API response accepted!', 'success');
                return resultMd;
            } else if (decision === 'reject') {
                showToast('Discarded — tag kept.', 'info');
                return null;
            } else if (decision === 'regenerate') {
                return executeApiBlock(blockIndex);
            }

        } catch (err) {
            activeApiOps.delete(blockIndex);
            if (apiCard) {
                apiCard.classList.remove('ai-card-loading');
                var lbl3 = apiCard.querySelector('.ai-placeholder-label');
                if (lbl3 && lbl3.dataset.originalText) lbl3.textContent = lbl3.dataset.originalText;
            }
            showToast('❌ API call failed: ' + (err.message || 'Network error'), 'error');
            return null;
        }
    }

    // ==============================================
    // REGISTER TOOLBAR ACTIONS
    // ==============================================

    M.registerFormattingAction('api-get-tag', function () { insertApiTag('GET'); });
    M.registerFormattingAction('api-post-tag', function () { insertApiTag('POST'); });

    // ==============================================
    // EXPOSE HOOKS for renderer.js
    // ==============================================

    M.transformApiMarkdown = transformApiMarkdown;
    M.bindApiPreviewActions = bindApiPreviewActions;
    M.parseApiConfig = parseApiConfig;
    M.parseApiBlocks = parseApiBlocks;
    M.executeApiBlock = executeApiBlock;

    // --- Register runtime adapter for exec-controller (auto-accept mode) ---
    var apiAdapter = {
        execute: function (source, block) {
            var parsedBlocks = parseApiBlocks(M.markdownEditor.value);
            var parsedBlock = null;
            for (var i = 0; i < parsedBlocks.length; i++) {
                if (parsedBlocks[i].fullMatch === block._fullMatch) {
                    parsedBlock = parsedBlocks[i];
                    break;
                }
            }
            var config = parsedBlock
                ? (parsedBlock.apiConfig || parseApiConfig(parsedBlock.prompt))
                : parseApiConfig(source);

            if (!config.url) {
                return Promise.reject(new Error('No URL specified in the API block'));
            }

            var fetchOpts = { method: config.method, mode: 'cors' };
            var hdrs = new Headers();
            var headerKeys = Object.keys(config.headers);
            for (var h = 0; h < headerKeys.length; h++) {
                hdrs.set(headerKeys[h], config.headers[headerKeys[h]]);
            }
            if (headerKeys.length > 0) fetchOpts.headers = hdrs;
            if (config.method !== 'GET' && config.body) {
                fetchOpts.body = config.body;
                if (!hdrs.has('Content-Type')) {
                    hdrs.set('Content-Type', 'application/json');
                    fetchOpts.headers = hdrs;
                }
            }

            return fetch(config.url, fetchOpts).then(function (response) {
                var contentType = response.headers.get('content-type') || '';
                var dataPromise = contentType.indexOf('json') !== -1
                    ? response.json().then(function (j) { return JSON.stringify(j, null, 2); })
                    : response.text();

                return dataPromise.then(function (responseText) {
                    // Store in variable if requested
                    if (config.variable) {
                        window.__API_VARS = window.__API_VARS || {};
                        if (M._vars) M._vars.setRuntime('api_' + config.variable, responseText);
                        window.__API_VARS['api_' + config.variable] = responseText;
                    }

                    var resultMd = '**' + config.method + '** `' + config.url + '` → **' + response.status + '**'
                        + '\n\n```json\n' + responseText + '\n```';
                    if (config.variable) {
                        resultMd += '\n\n> Stored in `$(api_' + config.variable + ')`';
                    }

                    // Auto-accept: replace tag with result markdown
                    if (block._fullMatch) {
                        var text = M.markdownEditor.value;
                        var idx = text.indexOf(block._fullMatch);
                        if (idx !== -1) {
                            var before = text.substring(0, idx);
                            var after = text.substring(idx + block._fullMatch.length);
                            M.markdownEditor.value = before + resultMd.trim() + after;
                            M.markdownEditor.dispatchEvent(new Event('input'));
                        }
                    }
                    return responseText;
                });
            });
        }
    };

    if (M._execRegistry) {
        M._execRegistry.registerRuntime('api', apiAdapter);
    } else {
        if (!M._pendingRuntimeAdapters) M._pendingRuntimeAdapters = [];
        M._pendingRuntimeAdapters.push({ key: 'api', adapter: apiAdapter });
    }

})(window.MDView);
