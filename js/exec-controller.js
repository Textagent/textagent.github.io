// ============================================
// exec-controller.js — Document Execution Controller
// Orchestrates top-to-bottom execution of all
// executable blocks in the document.
// ============================================
(function (M) {
    'use strict';

    var _running = false;
    var _abortRequested = false;
    var _currentRun = null; // { blocks, current, total, startTime }

    function escapeHtml(str) {
        var d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    // ========================================
    // Event emitter (simple)
    // ========================================
    var _listeners = {};

    function on(event, fn) {
        if (!_listeners[event]) _listeners[event] = [];
        _listeners[event].push(fn);
    }

    function off(event, fn) {
        if (!_listeners[event]) return;
        _listeners[event] = _listeners[event].filter(function (f) { return f !== fn; });
    }

    function emit(event, data) {
        if (!_listeners[event]) return;
        _listeners[event].forEach(function (fn) {
            try { fn(data); } catch (e) { console.error('[ExecController] event handler error:', e); }
        });
    }

    // ========================================
    // Runtime Dispatch
    // ========================================

    /**
     * Execute a single block using its registered runtime adapter.
     * Returns a Promise that resolves to the result string or null on error.
     */
    function executeBlock(block) {
        var registry = M._execRegistry;
        if (!registry) return Promise.reject(new Error('Registry not loaded'));

        var runtime = registry.getRuntime(block.runtimeKey);
        if (!runtime) {
            console.warn('[ExecController] No runtime for:', block.runtimeKey);
            return Promise.resolve(null);
        }

        // Resolve cross-block references (except for SQL blocks — they query directly)
        var source = block.source;
        if (block.runtimeKey !== 'sql' && M._execContext) {
            source = M._execContext.resolveReferences(source);
        }

        return runtime.execute(source, block).then(function (result) {
            // Store result in context
            if (M._execContext && result !== null && result !== undefined) {
                var resultStr = typeof result === 'string' ? result : JSON.stringify(result);
                M._execContext.set(block.id, 'output', resultStr);
            }
            // Store in named vars if @var: annotation present
            if (block.varName && M._vars && result !== null && result !== undefined) {
                var varValue = typeof result === 'string' ? result : JSON.stringify(result);
                M._vars.setRuntime(block.varName, varValue);
                console.log('[ExecController] Set variable $(' + block.varName + ') = "' + varValue.substring(0, 50) + '"');
            }
            return result;
        });
    }

    // ========================================
    // Find DOM container for a code block
    // ========================================

    function findBlockContainer(block) {
        var preview = M.markdownPreview;
        if (!preview) return null;

        if (block.type === 'code') {
            var containerClass = mapLangToContainer(block.lang);
            var containers = preview.querySelectorAll('.' + containerClass);

            // Find by matching order — count how many code blocks of this type
            // appear before this one in the document
            var codeBlocks = M._execRegistry.scanDocument(M.markdownEditor.value).filter(function (b) {
                return b.type === 'code' && mapLangToContainer(b.lang) === containerClass;
            });
            var idx = 0;
            for (var i = 0; i < codeBlocks.length; i++) {
                if (codeBlocks[i].id === block.id) { idx = i; break; }
            }
            return containers[idx] || null;
        }

        // DocGen, API, Linux blocks use data attributes
        if (block.type === 'docgen') {
            return preview.querySelector('.ai-placeholder-card[data-ai-index="' + block._blockIndex + '"]');
        }
        if (block.type === 'api') {
            return preview.querySelector('.ai-api-card[data-api-index="' + block._blockIndex + '"]');
        }
        if (block.type === 'linux') {
            return preview.querySelector('.linux-script-card[data-linux-index="' + block._blockIndex + '"]');
        }

        return null;
    }

    function mapLangToContainer(lang) {
        switch (lang) {
            case 'bash': case 'sh': case 'shell': return 'executable-code-container';
            case 'math': return 'executable-math-container';
            case 'python': case 'py': return 'executable-python-container';
            case 'html': case 'html-autorun': return 'executable-html-container';
            case 'javascript': case 'js': return 'executable-js-container';
            case 'sql': return 'executable-sql-container';
            default: return null;
        }
    }

    // ========================================
    // Status Badge Management
    // ========================================

    function updateBlockStatus(block, status) {
        block.status = status;
        var container = findBlockContainer(block);
        if (!container) return;

        // Remove existing status badge
        var existing = container.querySelector('.exec-status-badge');
        if (existing) existing.remove();

        // Add new badge
        var badge = document.createElement('span');
        badge.className = 'exec-status-badge exec-status-' + status;
        switch (status) {
            case 'running':
                badge.innerHTML = '<i class="bi bi-hourglass-split"></i> Running';
                break;
            case 'done':
                badge.innerHTML = '<i class="bi bi-check-circle-fill"></i> Done';
                break;
            case 'error':
                badge.innerHTML = '<i class="bi bi-x-circle-fill"></i> Error';
                break;
            default: // pending
                badge.innerHTML = '<i class="bi bi-pause-circle"></i> Pending';
                break;
        }

        // Insert badge at top of container
        var toolbar = container.querySelector('.code-block-toolbar, .ai-placeholder-header');
        if (toolbar) {
            toolbar.appendChild(badge);
        } else {
            container.insertBefore(badge, container.firstChild);
        }
    }

    /**
     * If a debounced renderMarkdown() is pending, flush it immediately
     * and wait for the DOM to settle, so that status badges are applied
     * to the freshly-rendered DOM rather than a stale one about to be replaced.
     */
    function flushPendingRender() {
        if (M.markdownRenderTimeout) {
            clearTimeout(M.markdownRenderTimeout);
            M.markdownRenderTimeout = null;
            M.renderMarkdown();
        }
        // Wait one frame for the DOM to settle after render
        return new Promise(function (r) { requestAnimationFrame(r); });
    }

    /**
     * Re-stamp status badges and update stale _blockIndex values after DOM re-render.
     * After each block's adapter replaces its tag in the editor, renderMarkdown()
     * re-indexes remaining cards. _blockIndex on remaining blocks becomes stale.
     */
    function reapplyAllStatuses(blocks, lastCompletedIdx) {
        // Re-scan the current editor to get fresh block indices
        var freshBlocks = M._execRegistry ? M._execRegistry.scanDocument(M.markdownEditor.value) : [];

        // Update _blockIndex for remaining unexecuted blocks
        for (var j = lastCompletedIdx + 1; j < blocks.length; j++) {
            var b = blocks[j];
            if (!b._fullMatch) continue;
            for (var k = 0; k < freshBlocks.length; k++) {
                if (freshBlocks[k]._fullMatch === b._fullMatch) {
                    b._blockIndex = freshBlocks[k]._blockIndex;
                    break;
                }
            }
        }

        // Re-apply status badges for completed blocks (they may have been removed by re-render)
        // Note: completed blocks' tags are already replaced with output, so their containers
        // no longer exist as AI cards — this is fine, updateBlockStatus just does nothing.
        for (var j2 = 0; j2 <= lastCompletedIdx && j2 < blocks.length; j2++) {
            var b2 = blocks[j2];
            if (b2.error) {
                updateBlockStatus(b2, 'error');
            } else if (b2.result !== undefined && b2.result !== null) {
                updateBlockStatus(b2, 'done');
            }
        }
    }

    // ========================================
    // Render block output into the DOM
    // ========================================

    function renderBlockOutput(block, result, error) {
        var container = findBlockContainer(block);
        if (!container) return;

        var escapeHtml = M._exec && M._exec.escapeHtml ? M._exec.escapeHtml : function (s) {
            var d = document.createElement('div'); d.textContent = s; return d.innerHTML;
        };

        var outputEl = container.querySelector('.code-output');
        if (!outputEl) {
            outputEl = document.createElement('div');
            outputEl.className = 'code-output';
            container.appendChild(outputEl);
        }
        outputEl.style.display = 'block';

        if (error) {
            outputEl.innerHTML = '<span class="code-output-error">✖ ' + escapeHtml(error.message || String(error)) + '</span>';
            return;
        }

        if (result === null || result === undefined) {
            outputEl.innerHTML = '<span class="code-output-muted">(no output)</span>';
            return;
        }

        var resultStr = typeof result === 'string' ? result : JSON.stringify(result);

        // For SQL blocks with tabular output, render as a formatted table
        if (block.runtimeKey === 'sql' && resultStr.indexOf(' | ') !== -1) {
            var sqlLines = resultStr.split('\n');
            var html = '<div class="sql-result-table-wrap"><table class="sql-result-table">';
            for (var li = 0; li < sqlLines.length; li++) {
                var line = sqlLines[li];
                if (/^-+(\s*\|\s*-+)*$/.test(line)) continue; // skip separator rows
                if (/^\d+ row\(s\)$/.test(line)) {
                    html += '</table><div class="sql-row-count">' + escapeHtml(line) + '</div></div>';
                    continue;
                }
                var cells = line.split(' | ');
                var tag = li === 0 ? 'th' : 'td';
                html += '<tr>';
                for (var ci = 0; ci < cells.length; ci++) {
                    html += '<' + tag + '>' + escapeHtml(cells[ci]) + '</' + tag + '>';
                }
                html += '</tr>';
            }
            html += '</table></div>';
            outputEl.innerHTML = html;
            return;
        }

        // For math blocks, render with expression → result formatting
        if (block.runtimeKey === 'math' && resultStr.indexOf('→') !== -1) {
            var mathLines = resultStr.split('\n');
            var mathHtml = '';
            for (var mi = 0; mi < mathLines.length; mi++) {
                var parts = mathLines[mi].split(' → ');
                if (parts.length === 2) {
                    var isErr = parts[1].indexOf('❌') === 0;
                    if (isErr) {
                        mathHtml += '<div class="math-result-line"><span class="math-result-expr">' + escapeHtml(parts[0]) + '</span> <span class="code-output-error">→ ' + escapeHtml(parts[1]) + '</span></div>';
                    } else {
                        mathHtml += '<div class="math-result-line"><span class="math-result-expr">' + escapeHtml(parts[0]) + '</span> <span class="math-result-arrow">→</span> <span class="math-result-value">' + escapeHtml(parts[1]) + '</span></div>';
                    }
                } else {
                    mathHtml += '<div>' + escapeHtml(mathLines[mi]) + '</div>';
                }
            }
            outputEl.innerHTML = mathHtml || '<span class="code-output-muted">(no result)</span>';
            return;
        }

        // For API blocks, render with copy button and JSON formatting
        if (block.runtimeKey === 'api') {
            var copyBtnHtml = '<div style="margin-bottom:6px;text-align:right;">'
                + '<button class="api-copy-output-btn" title="Copy response" style="background:rgba(88,166,255,0.1);border:1px solid #58a6ff;color:#58a6ff;cursor:pointer;padding:2px 8px;border-radius:4px;font-size:11px;">📋 Copy</button>'
                + '</div>';
            var jsonHtml = '<pre style="margin:0;white-space:pre-wrap;word-break:break-word;"><code>'
                + escapeHtml(resultStr) + '</code></pre>';
            outputEl.innerHTML = copyBtnHtml + jsonHtml;

            // Bind copy
            var cpBtn = outputEl.querySelector('.api-copy-output-btn');
            if (cpBtn) {
                cpBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    navigator.clipboard.writeText(resultStr).then(function () {
                        cpBtn.textContent = '✅ Copied!';
                        setTimeout(function () { cpBtn.textContent = '📋 Copy'; }, 1500);
                    }).catch(function () {
                        cpBtn.textContent = '❌ Failed';
                        setTimeout(function () { cpBtn.textContent = '📋 Copy'; }, 1500);
                    });
                });
            }

            // Syntax highlight
            var cEl = outputEl.querySelector('pre code');
            if (cEl && window.hljs) {
                cEl.classList.add('language-json');
                window.hljs.highlightElement(cEl);
            }
            return;
        }

        // Default: render as plain text (bash, python, js, etc.)
        outputEl.innerHTML = '<span class="code-output-stdout">' + escapeHtml(resultStr) + '</span>';
    }

    // ========================================
    // Run All — with Preflight Compilation
    // ========================================

    async function runAll(options) {
        if (_running) {
            if (M.showToast) M.showToast('Execution already in progress.', 'warning');
            return;
        }

        options = options || {};

        // Ensure SQLite is ready
        await new Promise(function (resolve) {
            if (M._execContext && M._execContext.ensureReady) {
                M._execContext.ensureReady(function () { resolve(); });
            } else {
                resolve();
            }
        });

        // Run the compiler
        var markdown = M.markdownEditor ? M.markdownEditor.value : '';
        var compiled = M.compileRequirements ? M.compileRequirements(markdown) : null;

        if (!compiled || compiled.blocks.length === 0) {
            if (M.showToast) M.showToast('No executable blocks found in the document.', 'warning');
            return;
        }

        // If skipPreflight option is set, execute directly
        if (options.skipPreflight) {
            return executeBlocks(compiled.blocks, options);
        }

        // Show preflight dialog
        var userAction = await showPreflightDialog(compiled);

        if (userAction === 'cancel') return;

        if (userAction === 'download-all') {
            // Download all missing models, then run
            await downloadMissingModels(compiled.models);
            // Re-compile after downloads
            compiled = M.compileRequirements(markdown);
        }

        // Filter blocks based on user action
        var blocksToRun = compiled.blocks;
        if (userAction === 'run-available') {
            blocksToRun = blocksToRun.filter(function (b) {
                return b._hasAdapter && b._support === 'full';
            });
        }

        return executeBlocks(blocksToRun, options);
    }

    // ========================================
    // Preflight Dialog
    // ========================================

    function showPreflightDialog(compiled) {
        return new Promise(function (resolve) {
            var overlay = document.createElement('div');
            overlay.className = 'preflight-overlay';
            overlay.innerHTML = buildPreflightHtml(compiled);
            document.body.appendChild(overlay);

            function close(action) {
                overlay.remove();
                resolve(action);
            }

            // Button handlers
            overlay.querySelector('.preflight-close-btn').addEventListener('click', function () { close('cancel'); });
            overlay.querySelector('.preflight-btn-cancel').addEventListener('click', function () { close('cancel'); });

            var runAvailBtn = overlay.querySelector('.preflight-btn-run-available');
            if (runAvailBtn) {
                runAvailBtn.addEventListener('click', function () { close('run-available'); });
            }

            var runAllBtn = overlay.querySelector('.preflight-btn-run');
            if (runAllBtn) {
                runAllBtn.addEventListener('click', function () { close('run-all'); });
            }

            var downloadBtn = overlay.querySelector('.preflight-btn-download');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', function () { close('download-all'); });
            }

            // Close on overlay click
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) close('cancel');
            });

            // Close on Escape
            function onEsc(e) {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', onEsc);
                    close('cancel');
                }
            }
            document.addEventListener('keydown', onEsc);
        });
    }

    function buildPreflightHtml(compiled) {
        var s = compiled.summary;
        var blocks = compiled.blocks;
        var models = compiled.models;

        var html = '<div class="preflight-dialog">';

        // Header
        html += '<div class="preflight-header">'
            + '<h3><i class="bi bi-lightning-charge-fill"></i> Run All — Preflight Check</h3>'
            + '<button class="preflight-close-btn" title="Close"><i class="bi bi-x-lg"></i></button>'
            + '</div>';

        // Body
        html += '<div class="preflight-body">';

        // Stats
        html += '<div class="preflight-stats">'
            + '<div class="preflight-stat"><div class="preflight-stat-value">' + s.total + '</div><div class="preflight-stat-label">Total blocks</div></div>'
            + '<div class="preflight-stat"><div class="preflight-stat-value">' + s.runnable + '</div><div class="preflight-stat-label">Runnable</div></div>';
        if (s.skipped > 0) {
            html += '<div class="preflight-stat"><div class="preflight-stat-value">' + s.skipped + '</div><div class="preflight-stat-label">Skipped</div></div>';
        }
        if (s.needsDownload.length > 0) {
            html += '<div class="preflight-stat"><div class="preflight-stat-value">' + s.needsDownload.length + '</div><div class="preflight-stat-label">Need download</div></div>';
        }
        html += '</div>';

        // Summary table
        html += '<div class="preflight-table-wrap"><table class="preflight-table">'
            + '<thead><tr>'
            + '<th>#</th><th>Block Name</th><th>Type</th><th>Output Var</th>'
            + '<th>Model</th><th>Features</th><th>Reads</th><th>Status</th>'
            + '</tr></thead><tbody>';

        for (var i = 0; i < blocks.length; i++) {
            var b = blocks[i];
            var statusClass = 'ready';
            var statusText = '🟢 Ready';

            if (!b._hasAdapter) {
                statusClass = 'missing';
                statusText = '❌ No adapter';
            } else if (b._support === 'excluded') {
                statusClass = 'excluded';
                statusText = '⏭ Excluded';
            } else if (b._effectiveModel && models[b._effectiveModel] && !models[b._effectiveModel].cached) {
                statusClass = 'download';
                statusText = '⬇ Download';
            } else if (b._effectiveModel && models[b._effectiveModel] && !models[b._effectiveModel].keySet) {
                statusClass = 'missing';
                statusText = '🔑 Key needed';
            }

            var varHtml = b.varName
                ? '<span class="preflight-var">$(' + escapeHtml(b.varName) + ')</span>'
                : '<span style="color:#484f58">—</span>';

            var modelHtml = b._modelLabel
                ? '<span class="preflight-model">' + escapeHtml(b._modelLabel) + '</span>'
                : '<span style="color:#484f58">—</span>';

            var featuresHtml = '';
            if (b._features && b._features.length > 0) {
                featuresHtml = '<div class="preflight-features">';
                for (var f = 0; f < b._features.length; f++) {
                    featuresHtml += '<span class="preflight-feature-pill">' + b._features[f] + '</span>';
                }
                featuresHtml += '</div>';
            } else {
                featuresHtml = '<span style="color:#484f58">—</span>';
            }

            var readsHtml = '';
            if (b._reads && b._reads.length > 0) {
                readsHtml = '<div class="preflight-reads">';
                for (var r = 0; r < b._reads.length; r++) {
                    readsHtml += '<span class="preflight-var">$(' + escapeHtml(b._reads[r]) + ')</span>';
                }
                readsHtml += '</div>';
            } else {
                readsHtml = '<span style="color:#484f58">—</span>';
            }

            html += '<tr>'
                + '<td>' + b._seqIndex + '</td>'
                + '<td>' + escapeHtml(b.blockLabel) + '</td>'
                + '<td>' + escapeHtml(b._displayType) + '</td>'
                + '<td>' + varHtml + '</td>'
                + '<td>' + modelHtml + '</td>'
                + '<td>' + featuresHtml + '</td>'
                + '<td>' + readsHtml + '</td>'
                + '<td><span class="preflight-status preflight-status-' + statusClass + '">' + statusText + '</span></td>'
                + '</tr>';
        }

        html += '</tbody></table></div>';

        // Errors
        if (compiled.errors.length > 0) {
            html += '<div class="preflight-section-header"><i class="bi bi-exclamation-triangle-fill" style="color:#f85149"></i> Errors</div>';
            html += '<ul class="preflight-error-list">';
            for (var e = 0; e < compiled.errors.length; e++) {
                html += '<li class="preflight-error-item">' + escapeHtml(compiled.errors[e].message) + '</li>';
            }
            html += '</ul>';
        }

        // Warnings
        if (compiled.warnings.length > 0) {
            html += '<div class="preflight-section-header"><i class="bi bi-exclamation-circle-fill" style="color:#d29922"></i> Warnings</div>';
            html += '<ul class="preflight-warning-list">';
            for (var w = 0; w < compiled.warnings.length; w++) {
                html += '<li class="preflight-warning-item">' + escapeHtml(compiled.warnings[w].message) + '</li>';
            }
            html += '</ul>';
        }

        // Model downloads needed
        if (s.needsDownload.length > 0) {
            html += '<div class="preflight-model-section">'
                + '<div class="preflight-section-header"><i class="bi bi-cloud-download" style="color:#d29922"></i> Models need download</div>';
            for (var d = 0; d < s.needsDownload.length; d++) {
                var m = s.needsDownload[d];
                html += '<div class="preflight-model-row">'
                    + '<span class="preflight-model-name">' + escapeHtml(m.label) + '</span>'
                    + (m.size ? '<span class="preflight-model-size">' + escapeHtml(m.size) + '</span>' : '')
                    + '</div>';
            }
            html += '</div>';
        }

        html += '</div>'; // end body

        // Footer with action buttons
        html += '<div class="preflight-footer">';
        html += '<button class="preflight-btn preflight-btn-cancel"><i class="bi bi-x-lg"></i> Cancel</button>';

        if (s.needsDownload.length > 0) {
            html += '<button class="preflight-btn preflight-btn-download"><i class="bi bi-cloud-download"></i> Download All</button>';
            if (s.runnable > 0 && s.runnable > s.needsDownload.length) {
                html += '<button class="preflight-btn preflight-btn-run-available"><i class="bi bi-play-circle"></i> Run '
                    + (s.runnable - s.needsDownload.reduce(function (c, m) { return c + m.usedBy.length; }, 0))
                    + ' Available</button>';
            }
        }

        html += '<button class="preflight-btn preflight-btn-run"><i class="bi bi-play-fill"></i> Run All (' + s.runnable + ')</button>';
        html += '</div>';

        html += '</div>'; // end dialog
        return html;
    }

    // ========================================
    // Download Missing Models
    // ========================================

    async function downloadMissingModels(modelPlan) {
        var toDownload = Object.keys(modelPlan).filter(function (id) {
            var m = modelPlan[id];
            return m.isLocal && !m.cached;
        });

        for (var i = 0; i < toDownload.length; i++) {
            var modelId = toDownload[i];
            if (M.showToast) M.showToast('📥 Downloading ' + modelPlan[modelId].label + '...', 'info');

            // Use existing switchToModel + wait for load
            if (M.switchToModel) M.switchToModel(modelId);

            // Wait for model to become ready
            await waitForModelReady(modelId, 120000); // 2 min timeout
        }
    }

    function waitForModelReady(modelId, timeout) {
        timeout = timeout || 60000;
        return new Promise(function (resolve) {
            var start = Date.now();
            var check = setInterval(function () {
                var isReady = false;
                // Kokoro TTS — check TTS module state
                if (modelId === 'kokoro-tts' && M.tts && M.tts.isKokoroReady) {
                    isReady = M.tts.isKokoroReady();
                }
                // AI local models
                if (!isReady && M._ai && M._ai.getLocalState) {
                    var ls = M._ai.getLocalState(modelId);
                    isReady = ls && ls.loaded;
                }
                if (!isReady && M.isCurrentModelReady) {
                    isReady = M.isCurrentModelReady();
                }
                if (isReady || Date.now() - start > timeout) {
                    clearInterval(check);
                    resolve(isReady);
                }
            }, 500);
        });
    }

    // ========================================
    // Execute Blocks (core loop)
    // ========================================

    async function executeBlocks(blocks, options) {
        options = options || {};
        _running = true;
        _abortRequested = false;
        M._execAborted = false; // expose for cross-module abort checks

        // Clear previous results
        if (M._execContext) M._execContext.clear();
        if (M._vars && M._vars.clearRuntime) M._vars.clearRuntime();

        if (blocks.length === 0) {
            console.log('[RunAll] ⚠ No executable blocks found.');
            if (M.showToast) M.showToast('No executable blocks to run.', 'warning');
            _running = false;
            return;
        }

        _currentRun = {
            blocks: blocks,
            current: 0,
            total: blocks.length,
            startTime: Date.now(),
            completed: 0,
            errors: 0
        };

        // ── Detailed session start log ──
        console.group('[RunAll] ⚡ Starting execution — ' + blocks.length + ' blocks');
        console.log('[RunAll] 🕐 Start time:', new Date().toLocaleTimeString());
        console.table(blocks.map(function (b, idx) {
            return {
                '#': idx + 1,
                Type: b._displayType || b.runtimeKey || b.type,
                Lang: b.lang || '—',
                Var: b.varName || '—',
                Model: b._effectiveModel || '—',
                Input: (b.inputVars && b.inputVars.length) ? b.inputVars.join(', ') : '—',
                Think: b.think ? '✓' : '—',
                Label: (b.blockLabel || '').substring(0, 50)
            };
        }));
        console.groupEnd();

        emit('exec:start', { total: blocks.length });
        updateRunAllButton(true);
        showProgress(0, blocks.length);
        appendLog('⚡', 'Starting execution — ' + blocks.length + ' blocks');
        appendLog('🕐', 'Start time: ' + new Date().toLocaleTimeString());

        var currentModelId = M.getCurrentAiModel ? M.getCurrentAiModel() : null;
        console.log('[RunAll] 🤖 Current AI model:', currentModelId || '(none)');
        appendLog('🤖', 'Current AI model: ' + (currentModelId || '(none)'));

        // ── Pre-execution: ensure all required models are ready ──
        var requiredModels = {};
        for (var p = 0; p < blocks.length; p++) {
            var bm = blocks[p]._effectiveModel;
            if (bm && !requiredModels[bm]) requiredModels[bm] = [];
            if (bm) requiredModels[bm].push(p + 1);
        }
        var modelIds = Object.keys(requiredModels);
        console.log('[RunAll] 📦 Required models:', modelIds.join(', '));
        appendLog('📦', 'Required models: ' + modelIds.join(', '));

        for (var mi = 0; mi < modelIds.length; mi++) {
            var modelId = modelIds[mi];
            if (_abortRequested) break;

            // ── Kokoro TTS — separate from AI models ──
            if (modelId === 'kokoro-tts') {
                if (M.tts && M.tts.isKokoroReady && M.tts.isKokoroReady()) {
                    console.log('[RunAll] ✅ Kokoro TTS ready');
                    appendLog('✅', 'Kokoro TTS ready');
                    continue;
                }
                // Trigger Kokoro loading
                console.log('[RunAll] ⏳ Loading Kokoro TTS (121 MB)…');
                appendLog('⏳', 'Loading Kokoro TTS (121 MB)…');
                if (M.tts && M.tts.initKokoro) M.tts.initKokoro();
                M.showToast('⏳ Loading Kokoro TTS — please wait…', 'info');
                // Wait up to 3 min for TTS model download
                var ttsStart = Date.now();
                while (Date.now() - ttsStart < 180000) {
                    if (_abortRequested) break;
                    if (M.tts && M.tts.isKokoroReady && M.tts.isKokoroReady()) {
                        console.log('[RunAll] ✅ Kokoro TTS ready (' + ((Date.now() - ttsStart) / 1000).toFixed(1) + 's)');
                        appendLog('✅', 'Kokoro TTS ready (' + ((Date.now() - ttsStart) / 1000).toFixed(1) + 's)', 'success');
                        M.showToast('✅ Kokoro TTS ready!', 'success');
                        break;
                    }
                    await new Promise(function (r) { setTimeout(r, 1000); });
                }
                continue;
            }

            // ── AI / Cloud models ──
            // Check if already ready
            var isReady = false;
            if (M._ai && M._ai.getLocalState) {
                var mls = M._ai.getLocalState(modelId);
                isReady = mls && mls.loaded;
            }
            if (!isReady && M.isCurrentModelReady && M.isCurrentModelReady() && currentModelId === modelId) {
                isReady = true;
            }
            // Check cloud models
            var cloudProviders = M.getCloudProviders ? M.getCloudProviders() : {};
            if (!isReady && cloudProviders[modelId] && cloudProviders[modelId].isLoaded()) {
                isReady = true;
            }
            if (isReady) {
                console.log('[RunAll] ✅ Model ready:', modelId);
                appendLog('✅', 'Model ready: ' + modelId, 'success');
                continue;
            }

            // Model not ready — auto-trigger loading
            console.log('[RunAll] ⏳ Model not ready, triggering load:', modelId);
            appendLog('⏳', 'Loading model: ' + modelId + '…');

            if (M._ai && M._ai.isLocalModel && M._ai.isLocalModel(modelId)) {
                var mls2 = M._ai.getLocalState(modelId);
                var consentKey = M.KEYS.AI_CONSENTED_PREFIX + modelId;
                var hasConsent = localStorage.getItem(consentKey)
                    || (modelId === 'qwen-local' && localStorage.getItem(M.KEYS.AI_CONSENTED));

                if (!mls2.loaded && !mls2.worker) {
                    if (hasConsent) {
                        // Auto-load from cache
                        if (M.switchToModel) M.switchToModel(modelId);
                        else if (M._ai.initAiWorker) M._ai.initAiWorker(modelId);
                        M.showToast('⏳ Loading ' + modelId + '…', 'info');
                    } else {
                        // Need consent — show download popup
                        if (M.showModelDownloadPopup) M.showModelDownloadPopup(modelId);
                        M.showToast('📥 ' + modelId + ' requires download. Please accept to continue.', 'warning');
                    }
                } else if (!mls2.loaded && mls2.worker) {
                    M.showToast('⏳ ' + modelId + ' is loading…', 'info');
                }

                // Wait for model to become ready (up to 60s)
                var mStart = Date.now();
                while (Date.now() - mStart < 60000) {
                    if (_abortRequested) {
                        console.log('[RunAll] ⏹ Aborted during model loading');
                        break;
                    }
                    var mlsCheck = M._ai.getLocalState(modelId);
                    if (mlsCheck && mlsCheck.loaded) {
                        console.log('[RunAll] ✅ Model loaded:', modelId, '(' + ((Date.now() - mStart) / 1000).toFixed(1) + 's)');
                        appendLog('✅', 'Model loaded: ' + modelId + ' (' + ((Date.now() - mStart) / 1000).toFixed(1) + 's)', 'success');
                        M.showToast('✅ ' + modelId + ' ready!', 'success');
                        break;
                    }
                    await new Promise(function (r) { setTimeout(r, 1000); });
                }
            } else if (cloudProviders[modelId]) {
                var cp = cloudProviders[modelId];
                if (!cp.getKey()) {
                    M.showApiKeyModal(modelId);
                    M.showToast('🔑 API key needed for ' + modelId, 'warning');
                    // Wait briefly for key entry
                    await new Promise(function (r) { setTimeout(r, 3000); });
                }
                if (!cp.isLoaded() && !cp.getWorker()) {
                    M.initCloudWorker(modelId);
                    await new Promise(function (r) { setTimeout(r, 2000); });
                }
            }
        }

        if (_abortRequested) {
            console.log('[RunAll] ⏹ Aborted during pre-flight model loading');
            _running = false;
            _abortRequested = false;
            M._execAborted = false;
            updateRunAllButton(false);
            hideProgress();
            return;
        }

        // Track per-block timings
        var _blockTimings = [];

        for (var i = 0; i < blocks.length; i++) {
            if (_abortRequested) {
                console.warn('[RunAll] ⏹ Aborted by user after block #' + i);
                emit('exec:abort', { completed: _currentRun.completed, total: blocks.length });
                break;
            }

            var block = blocks[i];
            _currentRun.current = i;

            // Skip blocks without a registered runtime
            if (!M._execRegistry.getRuntime(block.runtimeKey)) {
                console.log('[RunAll] ⏭ Block #' + (i + 1) + ' skipped — no runtime for: ' + block.runtimeKey);
                appendLog('⏭', 'Block #' + (i + 1) + ' skipped — no runtime for: ' + block.runtimeKey, 'warn');
                _blockTimings.push({ index: i + 1, status: 'skipped', elapsed: '—' });
                continue;
            }

            // Model switching: if this block needs a different model, switch
            if (block._effectiveModel && block._effectiveModel !== currentModelId && M.switchToModel) {
                console.log('[RunAll] 🔄 Switching model: ' + currentModelId + ' → ' + block._effectiveModel);
                M.switchToModel(block._effectiveModel);
                var modelReady = await waitForModelReady(block._effectiveModel, 60000);
                console.log('[RunAll] 🔄 Model switch ' + (modelReady ? '✅ ready' : '❌ timeout') + ': ' + block._effectiveModel);
                currentModelId = block._effectiveModel;
            }

            // ── Per-block start log ──
            var blockType = block._displayType || block.runtimeKey;
            var blockLabel = (block.blockLabel || block.source || '').substring(0, 60);
            console.group('[RunAll] ▶ Block #' + (i + 1) + '/' + blocks.length + ' — ' + blockType);
            appendLog('▶', 'Block #' + (i + 1) + '/' + blocks.length + ' — ' + blockType + (blockLabel ? ' — ' + blockLabel : ''));
            console.log('  📝 Label:', blockLabel);
            console.log('  🔧 Runtime:', block.runtimeKey);
            console.log('  🤖 Model:', block._effectiveModel || '(default)');
            if (block.varName) console.log('  📤 Output var: $(' + block.varName + ')');
            if (block.inputVars && block.inputVars.length) {
                var inputValues = {};
                block.inputVars.forEach(function (v) {
                    inputValues[v] = M._vars && M._vars.get ? (M._vars.get(v) ? '✅ resolved (' + String(M._vars.get(v)).substring(0, 80) + '…)' : '⚠ empty') : '?';
                });
                console.log('  📥 Input vars:', inputValues);
            }
            if (block.think) console.log('  🧠 Think mode: enabled');
            if (block.search && block.search.length) console.log('  🔍 Search:', block.search.join(', '));
            if (block.useMemory && block.useMemory.length && block.useMemory[0] !== 'none') console.log('  📎 Memory:', block.useMemory.join(', '));
            if (block.targetLang) console.log('  🌐 Language:', block.targetLang);

            emit('exec:block-start', { block: block, index: i, total: blocks.length });
            showProgress(i + 1, blocks.length, block);

            // Flush any pending debounced render so the badge is applied to the final DOM
            await flushPendingRender();
            updateBlockStatus(block, 'running');

            var blockStart = Date.now();

            try {
                var result = await executeBlock(block);
                block.result = result;
                _currentRun.completed++;
                var blockElapsed = ((Date.now() - blockStart) / 1000).toFixed(2);

                console.log('  ✅ Done in ' + blockElapsed + 's');
                appendLog('✅', 'Block #' + (i + 1) + ' done in ' + blockElapsed + 's' + (block.varName ? ' → $(' + block.varName + ')' : ''), 'success');
                if (block.varName && M._vars && M._vars.get) {
                    var stored = M._vars.get(block.varName);
                    console.log('  📤 $(' + block.varName + ') = ' + (stored ? String(stored).substring(0, 120) + (String(stored).length > 120 ? '…' : '') : '(empty)'));
                }
                if (typeof result === 'string' && result.length > 0) {
                    console.log('  📄 Result preview: ' + result.substring(0, 150) + (result.length > 150 ? '…' : ''));
                }
                console.groupEnd(); // close block group

                _blockTimings.push({ index: i + 1, type: blockType, status: '✅', elapsed: blockElapsed + 's' });

                emit('exec:block-done', { block: block, result: result, index: i });

                // After adapter runs, the DOM may have been rebuilt via renderMarkdown().
                // Flush any pending render then re-apply all status badges.
                await flushPendingRender();
                reapplyAllStatuses(blocks, i);
                renderBlockOutput(block, result, null);
            } catch (err) {
                block.result = null;
                block.error = err;
                _currentRun.errors++;
                var blockElapsed2 = ((Date.now() - blockStart) / 1000).toFixed(2);

                console.error('  ❌ Error after ' + blockElapsed2 + 's:', err.message || err);
                appendLog('❌', 'Block #' + (i + 1) + ' error: ' + (err.message || String(err)).substring(0, 120), 'error');
                console.error('  Stack:', err.stack || '(no stack)');
                console.groupEnd(); // close block group

                _blockTimings.push({ index: i + 1, type: blockType, status: '❌', elapsed: blockElapsed2 + 's', error: (err.message || String(err)).substring(0, 100) });

                emit('exec:block-error', { block: block, error: err, index: i });

                await new Promise(function (r) { requestAnimationFrame(r); });
                reapplyAllStatuses(blocks, i);
                renderBlockOutput(block, null, err);
                // Continue to next block (non-fatal)
            }
        }

        var elapsed = ((Date.now() - _currentRun.startTime) / 1000).toFixed(1);
        var summary = '✅ ' + _currentRun.completed + ' of ' + blocks.length + ' blocks executed';
        if (_currentRun.errors > 0) summary += ' (' + _currentRun.errors + ' errors)';
        summary += ' in ' + elapsed + 's';

        if (_abortRequested) {
            summary = '⏹ Stopped. ' + _currentRun.completed + ' of ' + blocks.length + ' blocks executed';
        }

        // ── Final summary log ──
        console.group('[RunAll] 🏁 Execution complete');
        console.log('[RunAll] ' + summary);
        appendLog('🏁', summary, _currentRun.errors > 0 ? 'warn' : 'success');
        console.log('[RunAll] 🕐 End time:', new Date().toLocaleTimeString());
        console.table(_blockTimings);
        if (M._vars && M._vars.list) {
            var finalVars = M._vars.list();
            var varSummary = {};
            Object.keys(finalVars).forEach(function (k) {
                varSummary[k] = String(finalVars[k]).substring(0, 80) + (String(finalVars[k]).length > 80 ? '…' : '');
            });
            console.log('[RunAll] 📦 Final variables:', varSummary);
        }
        console.groupEnd();

        if (M.showToast) M.showToast(summary, _currentRun.errors > 0 ? 'warning' : 'success');

        emit('exec:done', {
            completed: _currentRun.completed,
            total: blocks.length,
            errors: _currentRun.errors,
            elapsed: elapsed
        });

        _running = false;
        _abortRequested = false;
        M._execAborted = false;
        updateRunAllButton(false);
        hideProgress();
        _currentRun = null;
    }

    // ========================================
    // Run Single
    // ========================================

    async function runSingle(blockId) {
        var markdown = M.markdownEditor ? M.markdownEditor.value : '';
        var blocks = M._execRegistry.scanDocument(markdown);
        var block = null;
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i].id === blockId) { block = blocks[i]; break; }
        }
        if (!block) {
            if (M.showToast) M.showToast('Block not found: ' + blockId, 'error');
            return null;
        }

        updateBlockStatus(block, 'running');
        try {
            var result = await executeBlock(block);
            updateBlockStatus(block, 'done');
            return result;
        } catch (err) {
            updateBlockStatus(block, 'error');
            console.error('[ExecController] Block error:', blockId, err);
            return null;
        }
    }

    // ========================================
    // Abort
    // ========================================

    function abort() {
        if (!_running) return;
        _abortRequested = true;
        M._execAborted = true; // expose for cross-module abort checks
        console.log('[RunAll] ⏹ Stop requested by user');
        if (M.showToast) M.showToast('⏹ Stopping execution...', 'info');
    }

    // ========================================
    // Progress UI + Log Panel
    // ========================================

    var _progressEl = null;
    var _logEntries = [];
    var _logStartTime = 0;
    var _logPanelOpen = false;

    /**
     * Append a log entry to the in-memory buffer and, if the panel is open, to the DOM.
     * @param {string} icon  — emoji icon
     * @param {string} msg   — log message text
     * @param {string} [cls] — 'success' | 'error' | 'warn' (optional CSS class)
     */
    function appendLog(icon, msg, cls) {
        var elapsed = _logStartTime ? ((Date.now() - _logStartTime) / 1000).toFixed(1) : '0.0';
        var entry = { icon: icon, msg: msg, cls: cls || '', ts: '+' + elapsed + 's' };
        _logEntries.push(entry);

        // Update the log count badge
        if (_progressEl) {
            var countEl = _progressEl.querySelector('.exec-log-count');
            if (countEl) countEl.textContent = _logEntries.length;
        }

        // If panel is visible, append DOM node
        if (_logPanelOpen && _progressEl) {
            var scroll = _progressEl.querySelector('.exec-log-scroll');
            if (scroll) {
                scroll.appendChild(buildLogEntryEl(entry));
                scroll.scrollTop = scroll.scrollHeight;
            }
        }
    }

    function buildLogEntryEl(entry) {
        var div = document.createElement('div');
        div.className = 'exec-log-entry' + (entry.cls ? ' ' + entry.cls : '');
        div.innerHTML = '<span class="exec-log-ts">' + escapeHtml(entry.ts) + '</span>'
            + '<span class="exec-log-icon">' + entry.icon + '</span>'
            + '<span class="exec-log-msg">' + escapeHtml(entry.msg) + '</span>';
        return div;
    }

    function toggleLogPanel() {
        if (!_progressEl) return;
        var panel = _progressEl.querySelector('.exec-log-panel');
        var toggle = _progressEl.querySelector('.exec-log-toggle');
        if (!panel) return;

        _logPanelOpen = !_logPanelOpen;

        if (_logPanelOpen) {
            // Populate panel with all entries
            var scroll = panel.querySelector('.exec-log-scroll');
            if (scroll) {
                scroll.innerHTML = '';
                for (var i = 0; i < _logEntries.length; i++) {
                    scroll.appendChild(buildLogEntryEl(_logEntries[i]));
                }
                // Scroll to bottom after DOM update
                requestAnimationFrame(function () { scroll.scrollTop = scroll.scrollHeight; });
            }
            panel.classList.add('open');
            if (toggle) toggle.classList.add('open');
        } else {
            panel.classList.remove('open');
            if (toggle) toggle.classList.remove('open');
        }
    }

    function showProgress(current, total, block) {
        if (!_progressEl) {
            _logStartTime = Date.now();
            _logEntries = [];
            _logPanelOpen = false;

            _progressEl = document.createElement('div');
            _progressEl.className = 'exec-progress-bar';
            _progressEl.innerHTML = ''
                + '<div class="exec-log-panel"><div class="exec-log-scroll"></div></div>'
                + '<div class="exec-progress-row">'
                +   '<div class="exec-progress-text"></div>'
                +   '<div class="exec-progress-track"><div class="exec-progress-fill"></div></div>'
                +   '<button class="exec-log-toggle" title="Show execution logs">Logs <span class="exec-log-count">0</span></button>'
                +   '<button class="exec-abort-btn" title="Stop execution">⏹</button>'
                + '</div>';
            _progressEl.querySelector('.exec-abort-btn').addEventListener('click', abort);
            _progressEl.querySelector('.exec-log-toggle').addEventListener('click', toggleLogPanel);
            document.body.appendChild(_progressEl);
        }

        var pct = total > 0 ? Math.round((current / total) * 100) : 0;
        var text = '⚡ Running ' + current + ' of ' + total;
        if (block) {
            var label = block._displayType || block.runtimeKey;
            text += ' — ' + label;
        }

        _progressEl.querySelector('.exec-progress-text').textContent = text;
        _progressEl.querySelector('.exec-progress-fill').style.width = pct + '%';
        _progressEl.style.display = 'flex';
    }

    function hideProgress() {
        if (_progressEl) {
            // Show completion state briefly
            var textEl = _progressEl.querySelector('.exec-progress-text');
            var fillEl = _progressEl.querySelector('.exec-progress-fill');
            if (textEl && _currentRun) {
                var doneText = '✅ Done — ' + _currentRun.completed + '/' + _currentRun.total + ' blocks';
                if (_currentRun.errors > 0) doneText = '⚠ Done — ' + _currentRun.errors + ' error(s)';
                textEl.textContent = doneText;
            }
            if (fillEl) fillEl.style.width = '100%';

            setTimeout(function () {
                if (_progressEl) {
                    _progressEl.style.display = 'none';
                    _progressEl.remove();
                    _progressEl = null;
                    _logPanelOpen = false;
                }
            }, 4000);
        }
    }

    // ========================================
    // Run All Button State
    // ========================================

    function updateRunAllButton(running) {
        var btn = document.getElementById('run-all-btn');
        if (!btn) return;

        if (running) {
            btn.classList.add('fmt-run-active');
            btn.innerHTML = '<i class="bi bi-stop-circle"></i> <span>Stop</span>';
            btn.title = 'Stop execution';
            btn.onclick = abort;
        } else {
            btn.classList.remove('fmt-run-active');
            btn.innerHTML = '<i class="bi bi-play-circle"></i> <span>Run All</span>';
            btn.title = 'Run all executable blocks in document order';
            btn.onclick = null;
        }
    }

    // ========================================
    // Expose
    // ========================================

    M._execController = {
        runAll: runAll,
        runSingle: runSingle,
        abort: abort,
        isRunning: function () { return _running; },
        on: on,
        off: off
    };

    // Register the "run-all" formatting action
    if (M.registerFormattingAction) {
        M.registerFormattingAction('run-all', function () {
            if (_running) {
                abort();
            } else {
                runAll();
            }
        });
    }

})(window.MDView);
