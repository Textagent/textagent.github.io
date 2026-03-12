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

        // Default: render as plain text (bash, python, js, etc.)
        outputEl.innerHTML = '<span class="code-output-stdout">' + escapeHtml(resultStr) + '</span>';
    }

    // ========================================
    // Run All
    // ========================================

    async function runAll(options) {
        if (_running) {
            if (M.showToast) M.showToast('Execution already in progress.', 'warning');
            return;
        }

        options = options || {};
        _running = true;
        _abortRequested = false;

        // Ensure SQLite is ready
        await new Promise(function (resolve) {
            if (M._execContext && M._execContext.ensureReady) {
                M._execContext.ensureReady(function () { resolve(); });
            } else {
                resolve();
            }
        });

        // Clear previous results
        if (M._execContext) M._execContext.clear();

        // Scan document for all executable blocks
        var markdown = M.markdownEditor ? M.markdownEditor.value : '';
        var blocks = M._execRegistry.scanDocument(markdown);

        if (blocks.length === 0) {
            if (M.showToast) M.showToast('No executable blocks found in the document.', 'warning');
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

        emit('exec:start', { total: blocks.length });
        updateRunAllButton(true);
        showProgress(0, blocks.length);

        for (var i = 0; i < blocks.length; i++) {
            if (_abortRequested) {
                emit('exec:abort', { completed: _currentRun.completed, total: blocks.length });
                break;
            }

            var block = blocks[i];
            _currentRun.current = i;

            // Skip blocks without a registered runtime
            if (!M._execRegistry.getRuntime(block.runtimeKey)) {
                continue;
            }

            emit('exec:block-start', { block: block, index: i, total: blocks.length });
            updateBlockStatus(block, 'running');
            showProgress(i + 1, blocks.length, block);

            try {
                var result = await executeBlock(block);
                block.result = result;
                updateBlockStatus(block, 'done');
                renderBlockOutput(block, result, null);
                _currentRun.completed++;
                emit('exec:block-done', { block: block, result: result, index: i });
            } catch (err) {
                block.result = null;
                block.error = err;
                updateBlockStatus(block, 'error');
                renderBlockOutput(block, null, err);
                _currentRun.errors++;
                emit('exec:block-error', { block: block, error: err, index: i });
                console.error('[ExecController] Block error:', block.id, err);
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

        if (M.showToast) M.showToast(summary, _currentRun.errors > 0 ? 'warning' : 'success');

        emit('exec:done', {
            completed: _currentRun.completed,
            total: blocks.length,
            errors: _currentRun.errors,
            elapsed: elapsed
        });

        _running = false;
        _abortRequested = false;
        _currentRun = null;
        updateRunAllButton(false);
        hideProgress();
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
        if (M.showToast) M.showToast('⏹ Stopping execution...', 'info');
    }

    // ========================================
    // Progress UI
    // ========================================

    var _progressEl = null;

    function showProgress(current, total, block) {
        if (!_progressEl) {
            _progressEl = document.createElement('div');
            _progressEl.className = 'exec-progress-bar';
            _progressEl.innerHTML = '<div class="exec-progress-text"></div><div class="exec-progress-track"><div class="exec-progress-fill"></div></div><button class="exec-abort-btn" title="Stop execution">⏹</button>';
            _progressEl.querySelector('.exec-abort-btn').addEventListener('click', abort);
            document.body.appendChild(_progressEl);
        }

        var pct = total > 0 ? Math.round((current / total) * 100) : 0;
        var text = '⚡ Running ' + current + ' of ' + total;
        if (block) text += ' — ' + block.runtimeKey;

        _progressEl.querySelector('.exec-progress-text').textContent = text;
        _progressEl.querySelector('.exec-progress-fill').style.width = pct + '%';
        _progressEl.style.display = 'flex';
    }

    function hideProgress() {
        if (_progressEl) {
            setTimeout(function () {
                if (_progressEl) _progressEl.style.display = 'none';
            }, 2000);
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
