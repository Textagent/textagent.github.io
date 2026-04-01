// ============================================
// research-loop.js — {{Research:}} Tag Component
// Autonomous AI-driven experiment loop (Pyodide)
// Inspired by Karpathy's autoresearch
// ============================================
(function (M) {
    'use strict';

    // ==============================================
    // HELPERS
    // ==============================================

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function showToast(msg, type) {
        if (M._showToast) M._showToast(msg, type);
        else console.log('[Research] ' + msg);
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

    // ==============================================
    // STATE
    // ==============================================

    var _activeLoops = new Map();  // blockIndex → { abort: false, history: [], bestCode, bestMetric }

    // ==============================================
    // PARSING
    // ==============================================

    function parseResearchConfig(body) {
        var config = {
            runtime: 'python',
            metric: 'score',
            direction: 'lower',
            maxIterations: 20,
            model: '',
            goal: '',
            code: '',
            test: '',
            timeout: 30
        };

        var lines = body.split('\n');
        var currentField = null;
        var fieldLines = [];
        var fieldIndent = 0;

        function flushField() {
            if (!currentField) return;
            var val = fieldLines.join('\n');
            if (currentField === 'code') config.code = val;
            else if (currentField === 'test') config.test = val;
            currentField = null;
            fieldLines = [];
        }

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.trim();

            // If collecting multiline field
            if (currentField) {
                var fieldMatch = trimmed.match(/^@(\w+)\s*:\s*/i);
                if (fieldMatch && line.search(/\S/) <= fieldIndent) {
                    flushField();
                    // Fall through to process as field
                } else {
                    // Remove common indent
                    var deindented = line;
                    if (fieldIndent > 0) {
                        var leadingSpaces = line.match(/^(\s*)/)[1].length;
                        deindented = leadingSpaces >= fieldIndent
                            ? line.substring(fieldIndent)
                            : line.trimStart();
                    }
                    fieldLines.push(deindented);
                    continue;
                }
            }

            // Parse single-value fields
            var runtimeMatch = trimmed.match(/^@runtime\s*:\s*(.+)/i);
            if (runtimeMatch) { config.runtime = runtimeMatch[1].trim().toLowerCase(); continue; }

            var metricMatch = trimmed.match(/^@metric\s*:\s*(.+)/i);
            if (metricMatch) { config.metric = metricMatch[1].trim(); continue; }

            var dirMatch = trimmed.match(/^@direction\s*:\s*(lower|higher)/i);
            if (dirMatch) { config.direction = dirMatch[1].trim().toLowerCase(); continue; }

            var maxMatch = trimmed.match(/^@max_iterations\s*:\s*(\d+)/i);
            if (maxMatch) { config.maxIterations = parseInt(maxMatch[1], 10); continue; }

            var modelMatch = trimmed.match(/^@model\s*:\s*(.+)/i);
            if (modelMatch) { config.model = modelMatch[1].trim(); continue; }

            var timeoutMatch = trimmed.match(/^@timeout\s*:\s*(\d+)/i);
            if (timeoutMatch) { config.timeout = parseInt(timeoutMatch[1], 10); continue; }

            var goalMatch = trimmed.match(/^@goal\s*:\s*(.+)/i);
            if (goalMatch) { config.goal = goalMatch[1].trim(); continue; }

            // Multiline fields: @code: | and @test: |
            var codeStart = trimmed.match(/^@code\s*:\s*\|?\s*$/i);
            if (codeStart) {
                currentField = 'code';
                fieldLines = [];
                if (i + 1 < lines.length) {
                    fieldIndent = lines[i + 1].match(/^(\s*)/)[1].length;
                }
                continue;
            }

            var testStart = trimmed.match(/^@test\s*:\s*\|?\s*$/i);
            if (testStart) {
                currentField = 'test';
                fieldLines = [];
                if (i + 1 < lines.length) {
                    fieldIndent = lines[i + 1].match(/^(\s*)/)[1].length;
                }
                continue;
            }

            // Single-line code/test (no pipe)
            var codeInline = trimmed.match(/^@code\s*:\s*(.+)/i);
            if (codeInline && !codeInline[1].startsWith('|')) {
                config.code = codeInline[1]; continue;
            }

            var testInline = trimmed.match(/^@test\s*:\s*(.+)/i);
            if (testInline && !testInline[1].startsWith('|')) {
                config.test = testInline[1]; continue;
            }
        }

        flushField();
        return config;
    }

    function parseResearchBlocks(markdown) {
        var blocks = [];
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?Research:\s*([\s\S]*?)\}\}/g;
        var match;
        while ((match = re.exec(markdown)) !== null) {
            if (!isInsideFence(match.index, fencedRanges)) {
                blocks.push({
                    type: 'Research',
                    prompt: match[1].trim(),
                    start: match.index,
                    end: match.index + match[0].length,
                    fullMatch: match[0],
                    config: parseResearchConfig(match[1].trim())
                });
            }
        }
        return blocks;
    }

    // ==============================================
    // RENDERING — transform {{Research:}} into cards
    // ==============================================

    function transformResearchMarkdown(markdown) {
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?Research:\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        // Build model options
        var models = window.AI_MODELS || {};
        var modelIds = Object.keys(models).filter(function (id) {
            return !models[id].isImageModel && !models[id].isTtsModel && !models[id].isSttModel;
        });
        var currentModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : modelIds[0]) || modelIds[0];

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);

            var cfg = parseResearchConfig(match[1].trim());

            // Model dropdown
            var selectedModel = cfg.model || currentModel;
            var modelOpts = '';
            modelIds.forEach(function (id) {
                var m = models[id];
                var name = m.dropdownName || m.label || id;
                var sel = id === selectedModel ? ' selected' : '';
                modelOpts += '<option value="' + id + '"' + sel + '>' + name + '</option>';
            });

            // Direction arrow
            var dirArrow = cfg.direction === 'lower' ? '↓ lower' : '↑ higher';

            // Code preview (first 8 lines)
            var codePreview = cfg.code || '(no code provided)';
            var codeLines = codePreview.split('\n');
            var truncated = codeLines.length > 8;
            codePreview = codeLines.slice(0, 8).join('\n');
            if (truncated) codePreview += '\n# ... (' + (codeLines.length - 8) + ' more lines)';

            // Check if this loop is active
            var isRunning = _activeLoops.has(blockIndex);
            var loopState = _activeLoops.get(blockIndex);

            // Build results table if we have history
            var resultsHtml = '';
            if (loopState && loopState.history.length > 0) {
                resultsHtml = buildResultsTableHtml(loopState);
            }

            // Status bar
            var statusHtml = '';
            if (loopState) {
                var bestVal = loopState.bestMetric !== null ? loopState.bestMetric.toFixed(4) : '—';
                var statusText = loopState.complete
                    ? '✅ Complete — ' + loopState.history.length + ' experiments'
                    : '⏳ Running iteration ' + loopState.iteration + '/' + cfg.maxIterations;
                statusHtml = '<div class="research-status">'
                    + '<span class="research-status-text">' + statusText + '</span>'
                    + '<span class="research-metric-best">Best: ' + bestVal + '</span>'
                    + '</div>';
            }

            // Progress bar
            var progressPct = loopState
                ? Math.min(100, Math.round((loopState.iteration / cfg.maxIterations) * 100))
                : 0;

            result += '<div class="research-card ai-placeholder-card' + (isRunning && !loopState.complete ? ' research-running' : '') + '" data-ai-type="Research" data-research-index="' + blockIndex + '">'
                + '<div class="research-header">'
                + '<span class="research-header-icon">🔬</span>'
                + '<span class="research-header-label">Research Lab</span>'
                + '<div class="research-header-actions">'
                + '<select class="ai-card-model-select" data-research-index="' + blockIndex + '" title="AI Model">' + modelOpts + '</select>'
                + '<button class="research-btn research-btn-start" data-research-index="' + blockIndex + '" title="Start experiment loop">▶ Start</button>'
                + '<button class="research-btn research-btn-stop" data-research-index="' + blockIndex + '" title="Stop experiment loop">⏹ Stop</button>'
                + '<button class="research-btn" data-research-index="' + blockIndex + '" data-action="remove" title="Remove tag">✕</button>'
                + '</div></div>'

                + '<div class="research-info">'
                + '<div class="research-goal"><strong>Goal:</strong> ' + escapeHtml(cfg.goal || 'No goal specified') + '</div>'
                + '<div class="research-config-row">'
                + '<span class="research-config-badge">🐍 Python (Pyodide)</span>'
                + '<span class="research-config-badge">📊 ' + escapeHtml(cfg.metric) + ' (' + dirArrow + ')</span>'
                + '<span class="research-config-badge">🔄 Max ' + cfg.maxIterations + ' iterations</span>'
                + '</div>'
                + '</div>'

                + '<div class="research-code-preview"><pre><code>' + escapeHtml(codePreview) + '</code></pre></div>'

                + '<div class="research-progress"><div class="research-progress-fill" style="width:' + progressPct + '%"></div></div>'

                + statusHtml
                + '<div class="research-results" data-research-index="' + blockIndex + '">' + resultsHtml + '</div>'

                + '</div>';

            lastIndex = match.index + match[0].length;
            blockIndex++;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // RESULTS TABLE HTML
    // ==============================================

    function buildResultsTableHtml(state) {
        if (!state || !state.history || state.history.length === 0) return '';

        var html = '<table class="research-results-table">'
            + '<thead><tr>'
            + '<th>#</th><th>Metric</th><th>Delta</th><th>Status</th><th>Description</th>'
            + '</tr></thead><tbody>';

        for (var i = 0; i < state.history.length; i++) {
            var h = state.history[i];
            var isBest = h.metric === state.bestMetric && h.status !== 'crash' && h.status !== 'discard';
            var delta = '';
            var deltaClass = 'research-delta-neutral';

            if (i > 0 && h.metric !== null && state.history[0].metric !== null) {
                var diff = h.metric - state.history[0].metric;
                var sign = diff >= 0 ? '+' : '';
                delta = sign + diff.toFixed(4);
                if (state.direction === 'lower') {
                    deltaClass = diff < 0 ? 'research-delta-positive' : diff > 0 ? 'research-delta-negative' : 'research-delta-neutral';
                } else {
                    deltaClass = diff > 0 ? 'research-delta-positive' : diff < 0 ? 'research-delta-negative' : 'research-delta-neutral';
                }
            }

            var badgeClass = 'research-badge-' + h.status;
            var metricDisplay = h.metric !== null ? h.metric.toFixed(4) : '—';
            var statusIcon = h.status === 'keep' ? '✅' : h.status === 'discard' ? '🔄' : h.status === 'crash' ? '💥' : h.status === 'baseline' ? '📊' : '⏳';

            html += '<tr class="' + (isBest ? 'research-row-best' : '') + '">'
                + '<td>' + h.iteration + '</td>'
                + '<td>' + metricDisplay + '</td>'
                + '<td><span class="research-delta ' + deltaClass + '">' + delta + '</span></td>'
                + '<td><span class="research-badge ' + badgeClass + '">' + statusIcon + ' ' + h.status + '</span></td>'
                + '<td>' + escapeHtml(h.description || '') + '</td>'
                + '</tr>';
        }

        html += '</tbody></table>';
        return html;
    }

    // ==============================================
    // METRIC EXTRACTION
    // ==============================================

    function extractMetric(stdout) {
        // Parse "METRIC:xxx" from stdout
        var match = stdout.match(/METRIC:([\d.eE+\-]+)/);
        if (match) return parseFloat(match[1]);

        // Fallback: try to parse last numeric line
        var lines = stdout.trim().split('\n');
        for (var i = lines.length - 1; i >= 0; i--) {
            var num = parseFloat(lines[i].trim());
            if (!isNaN(num)) return num;
        }

        return null;
    }

    // ==============================================
    // EXECUTION — Run code in Pyodide
    // ==============================================

    function executeExperiment(code, testCode) {
        var fullSource = code + '\n\n' + testCode;

        // Use the Pyodide runtime adapter from exec-python.js
        if (M._execRegistry && M._execRegistry.getRuntime) {
            var pyAdapter = M._execRegistry.getRuntime('python');
            if (pyAdapter) {
                return pyAdapter.execute(fullSource);
            }
        }

        // Fallback: try the pending adapters or direct M calls
        return new Promise(function (resolve, reject) {
            reject(new Error('Pyodide runtime not available. Make sure Python execution is enabled.'));
        });
    }

    // ==============================================
    // AI PROMPT — Ask AI for code modifications
    // ==============================================

    function buildResearchPrompt(cfg, currentCode, history) {
        var recentHistory = history.slice(-10);
        var historyText = recentHistory.map(function (h) {
            return '#' + h.iteration + ': ' + cfg.metric + '=' + (h.metric !== null ? h.metric.toFixed(4) : 'CRASH')
                + ' [' + h.status + '] — ' + (h.description || 'n/a');
        }).join('\n');

        // Count recent failures to encourage strategy shifts
        var lastThree = history.slice(-3);
        var recentFails = lastThree.filter(function (h) { return h.status === 'discard' || h.status === 'crash'; }).length;
        var strategyHint = recentFails >= 3
            ? '\nIMPORTANT: The last 3 experiments all failed or got worse. Try a COMPLETELY DIFFERENT approach or algorithm.\n'
            : '';

        return 'You are an autonomous research agent optimizing Python code.\n\n'
            + 'GOAL: ' + cfg.goal + '\n\n'
            + 'CURRENT BEST CODE:\n```python\n' + currentCode + '\n```\n\n'
            + 'METRIC: ' + cfg.metric + ' (' + cfg.direction + ' is better)\n'
            + 'Current best: ' + (history.length > 0 && history[history.length - 1] ? history[0].metric : 'unknown') + '\n\n'
            + 'EXPERIMENT HISTORY:\n' + historyText + '\n'
            + strategyHint + '\n'
            + 'Suggest ONE targeted modification to improve the metric.\n'
            + '- Make incremental, specific changes\n'
            + '- Add a brief comment at the top explaining your change\n'
            + '- The code MUST be valid Python\n'
            + '- Do NOT modify the test harness — only the code block\n\n'
            + 'Output ONLY the complete modified Python code. No markdown fences, no explanations outside the code.';
    }

    function extractCodeFromAiResponse(text) {
        // Try to extract from code fences first
        var fenceMatch = text.match(/```(?:python)?\s*\n([\s\S]*?)\n```/);
        if (fenceMatch) return fenceMatch[1].trim();

        // Otherwise use the raw text (strip leading/trailing whitespace)
        return text.trim();
    }

    // ==============================================
    // MAIN LOOP
    // ==============================================

    async function runResearchLoop(blockIndex) {
        if (_activeLoops.has(blockIndex) && !_activeLoops.get(blockIndex).complete) {
            showToast('⚠️ Research loop already running for this block.', 'warning');
            return;
        }

        var text = M.markdownEditor.value;
        var blocks = parseResearchBlocks(text);
        if (blockIndex >= blocks.length) return;

        var cfg = blocks[blockIndex].config;

        if (!cfg.code) {
            showToast('❌ Missing @code block in Research tag.', 'error');
            return;
        }
        if (!cfg.test) {
            showToast('❌ Missing @test block in Research tag.', 'error');
            return;
        }

        // Read model from card's dropdown (user may have changed it)
        var cardModelSelect = document.querySelector('.ai-card-model-select[data-research-index="' + blockIndex + '"]');
        var selectedModel = cardModelSelect ? cardModelSelect.value : cfg.model;

        // Initialize loop state
        var state = {
            abort: false,
            complete: false,
            history: [],
            bestCode: cfg.code,
            bestMetric: null,
            iteration: 0,
            direction: cfg.direction
        };
        _activeLoops.set(blockIndex, state);

        // Update UI to running state
        updateCardUI(blockIndex);
        showToast('🔬 Starting research loop...', 'info');

        try {
            // ── Step 1: Run baseline ──
            console.log('[Research] Running baseline...');
            updateStatus(blockIndex, '⏳ Running baseline...', null);

            var baselineOutput;
            try {
                baselineOutput = await executeExperiment(cfg.code, cfg.test);
            } catch (err) {
                state.history.push({
                    iteration: 0,
                    code: cfg.code,
                    metric: null,
                    status: 'crash',
                    description: 'Baseline crashed: ' + err.message,
                    timestamp: Date.now()
                });
                state.complete = true;
                updateCardUI(blockIndex);
                showToast('❌ Baseline code failed: ' + err.message, 'error');
                return;
            }

            var baselineMetric = extractMetric(baselineOutput);
            if (baselineMetric === null) {
                state.history.push({
                    iteration: 0,
                    code: cfg.code,
                    metric: null,
                    status: 'crash',
                    description: 'Could not extract metric from output. Add print(f"METRIC:{value}") to @test.',
                    timestamp: Date.now()
                });
                state.complete = true;
                updateCardUI(blockIndex);
                showToast('❌ Could not extract METRIC from baseline output. Ensure @test prints METRIC:xxx', 'error');
                return;
            }

            state.bestMetric = baselineMetric;
            state.bestCode = cfg.code;
            state.history.push({
                iteration: 0,
                code: cfg.code,
                metric: baselineMetric,
                status: 'baseline',
                description: 'Baseline',
                timestamp: Date.now()
            });

            console.log('[Research] Baseline metric:', baselineMetric);
            updateCardUI(blockIndex);

            // ── Step 2: Iteration loop ──
            for (var iter = 1; iter <= cfg.maxIterations; iter++) {
                if (state.abort) {
                    console.log('[Research] Aborted by user at iteration', iter);
                    break;
                }

                state.iteration = iter;
                updateStatus(blockIndex, '🧠 AI suggesting experiment #' + iter + '...', state.bestMetric);

                // Ask AI for a code modification
                var aiPrompt = buildResearchPrompt(cfg, state.bestCode, state.history);
                var aiResponse;
                try {
                    // Switch model if needed
                    if (selectedModel && M.switchToModel) {
                        M.switchToModel(selectedModel);
                    }

                    aiResponse = await M.requestAiTask({
                        taskType: 'generate',
                        context: '',
                        userPrompt: aiPrompt,
                        enableThinking: false,
                        silent: true,
                        attachments: []
                    });
                } catch (aiErr) {
                    state.history.push({
                        iteration: iter,
                        code: '',
                        metric: null,
                        status: 'crash',
                        description: 'AI error: ' + aiErr.message,
                        timestamp: Date.now()
                    });
                    updateCardUI(blockIndex);
                    // Continue loop — AI failure shouldn't stop the loop
                    continue;
                }

                if (state.abort) break;

                var newCode = extractCodeFromAiResponse(aiResponse);
                if (!newCode || newCode.length < 5) {
                    state.history.push({
                        iteration: iter,
                        code: newCode || '',
                        metric: null,
                        status: 'crash',
                        description: 'AI returned empty or invalid code',
                        timestamp: Date.now()
                    });
                    updateCardUI(blockIndex);
                    continue;
                }

                // Extract a brief description from the code (first comment line)
                var descMatch = newCode.match(/^#\s*(.+)/m);
                var description = descMatch ? descMatch[1].trim().substring(0, 80) : 'AI modification #' + iter;

                // Execute the new code
                updateStatus(blockIndex, '🐍 Running experiment #' + iter + '...', state.bestMetric);

                var experimentOutput;
                try {
                    experimentOutput = await executeExperiment(newCode, cfg.test);
                } catch (execErr) {
                    state.history.push({
                        iteration: iter,
                        code: newCode,
                        metric: null,
                        status: 'crash',
                        description: 'Runtime error: ' + execErr.message.substring(0, 60),
                        timestamp: Date.now()
                    });
                    updateCardUI(blockIndex);
                    continue;
                }

                if (state.abort) break;

                var newMetric = extractMetric(experimentOutput);
                if (newMetric === null) {
                    state.history.push({
                        iteration: iter,
                        code: newCode,
                        metric: null,
                        status: 'crash',
                        description: 'No METRIC in output',
                        timestamp: Date.now()
                    });
                    updateCardUI(blockIndex);
                    continue;
                }

                // ── Step 3: Keep or discard ──
                var improved = false;
                if (cfg.direction === 'lower') {
                    improved = newMetric < state.bestMetric;
                } else {
                    improved = newMetric > state.bestMetric;
                }

                if (improved) {
                    state.bestMetric = newMetric;
                    state.bestCode = newCode;
                    state.history.push({
                        iteration: iter,
                        code: newCode,
                        metric: newMetric,
                        status: 'keep',
                        description: '✅ ' + description,
                        timestamp: Date.now()
                    });
                    console.log('[Research] #' + iter + ' KEEP: ' + newMetric + ' (improved)');
                } else {
                    state.history.push({
                        iteration: iter,
                        code: newCode,
                        metric: newMetric,
                        status: 'discard',
                        description: '🔄 ' + description,
                        timestamp: Date.now()
                    });
                    console.log('[Research] #' + iter + ' DISCARD: ' + newMetric + ' (not improved)');
                }

                updateCardUI(blockIndex);

                // Brief yield to avoid UI blocking
                await new Promise(function (r) { setTimeout(r, 100); });
            }

        } catch (loopErr) {
            console.error('[Research] Loop error:', loopErr);
            showToast('❌ Research loop error: ' + loopErr.message, 'error');
        }

        // ── Step 4: Complete ──
        state.complete = true;
        state.iteration = Math.min(state.iteration, cfg.maxIterations);
        updateCardUI(blockIndex);

        var keepCount = state.history.filter(function (h) { return h.status === 'keep'; }).length;
        showToast('🔬 Research complete! ' + state.history.length + ' experiments, ' + keepCount + ' improvements. Best: ' + (state.bestMetric !== null ? state.bestMetric.toFixed(4) : '—'), 'success');
    }

    // ==============================================
    // STOP LOOP
    // ==============================================

    function stopResearchLoop(blockIndex) {
        var state = _activeLoops.get(blockIndex);
        if (state) {
            state.abort = true;
            showToast('⏹ Stopping research loop...', 'info');
        }
    }

    // ==============================================
    // UI UPDATES
    // ==============================================

    function updateCardUI(blockIndex) {
        // Re-render the preview (triggers transformResearchMarkdown)
        if (M.renderMarkdown) {
            M.renderMarkdown();
        }
    }

    function updateStatus(blockIndex, text, bestMetric) {
        var statusEl = document.querySelector('.research-card[data-research-index="' + blockIndex + '"] .research-status');
        if (statusEl) {
            statusEl.querySelector('.research-status-text').textContent = text;
            if (bestMetric !== null) {
                var bestEl = statusEl.querySelector('.research-metric-best');
                if (bestEl) bestEl.textContent = 'Best: ' + bestMetric.toFixed(4);
            }
        }

        // Update progress bar
        var state = _activeLoops.get(blockIndex);
        if (state) {
            var blocks = parseResearchBlocks(M.markdownEditor.value);
            var maxIter = blocks[blockIndex] ? blocks[blockIndex].config.maxIterations : 20;
            var pct = Math.min(100, Math.round((state.iteration / maxIter) * 100));
            var progressFill = document.querySelector('.research-card[data-research-index="' + blockIndex + '"] .research-progress-fill');
            if (progressFill) progressFill.style.width = pct + '%';
        }
    }

    // ==============================================
    // PREVIEW ACTIONS — bind card buttons
    // ==============================================

    function bindResearchPreviewActions(container) {
        // Start buttons
        container.querySelectorAll('.research-btn-start').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.researchIndex, 10);
                runResearchLoop(idx);
            });
        });

        // Stop buttons
        container.querySelectorAll('.research-btn-stop').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.researchIndex, 10);
                stopResearchLoop(idx);
            });
        });

        // Remove buttons
        container.querySelectorAll('.research-btn[data-action="remove"]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.researchIndex, 10);
                var text = M.markdownEditor.value;
                var blocks = parseResearchBlocks(text);
                if (idx < blocks.length) {
                    var block = blocks[idx];
                    var before = text.substring(0, block.start);
                    var after = text.substring(block.end);
                    if (after.charAt(0) === '\n') after = after.substring(1);
                    M.markdownEditor.value = before + after;
                    M.renderMarkdown();
                    showToast('Research tag removed.', 'info');
                }
            });
        });
    }

    // ==============================================
    // TOOLBAR ACTION — insert template
    // ==============================================

    M.registerFormattingAction('research-tag', function () {
        M.insertAtCursor('\n{{Research:\n  @runtime: python\n  @metric: execution_time_ms\n  @direction: lower\n  @max_iterations: 20\n  @model: gemini-flash\n\n  @goal: Optimize this algorithm for speed\n\n  @code: |\n    def solve(data):\n        return sorted(data)\n\n  @test: |\n    import time\n    data = list(range(10000, 0, -1))\n    start = time.perf_counter()\n    result = solve(data)\n    elapsed = (time.perf_counter() - start) * 1000\n    assert result == sorted(data), "Incorrect result!"\n    print(f"METRIC:{elapsed:.4f}")\n}}\n');
    });

    // ==============================================
    // EXPOSE HOOKS for renderer.js
    // ==============================================

    M.transformResearchMarkdown = transformResearchMarkdown;
    M.bindResearchPreviewActions = bindResearchPreviewActions;
    M.parseResearchBlocks = parseResearchBlocks;

    // --- Register runtime adapter for exec-controller ---
    var researchAdapter = {
        execute: function (source, block) {
            // Research blocks can't be "Run All" in the normal sense -- they need Start button
            return Promise.resolve('Research loop requires interactive Start. Use the ▶ Start button on the card.');
        }
    };

    if (M._execRegistry) {
        M._execRegistry.registerRuntime('research', researchAdapter);
    } else {
        if (!M._pendingRuntimeAdapters) M._pendingRuntimeAdapters = [];
        M._pendingRuntimeAdapters.push({ key: 'research', adapter: researchAdapter });
    }

})(window.MDView);
