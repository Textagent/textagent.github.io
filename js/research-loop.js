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

    /**
     * Ensure AI model is loaded and ready before starting the research loop.
     * Auto-triggers local model download consent or cloud API key prompt.
     * Polls until ready or times out after 120s.
     */
    async function ensureResearchModelReady(modelId) {
        var currentModel = modelId || (M.getCurrentAiModel ? M.getCurrentAiModel() : null);
        if (!currentModel) {
            throw new Error('No AI model selected. Please choose a model from the dropdown.');
        }

        // Already ready — fast path
        if (M.isCurrentModelReady && M.isCurrentModelReady()) return true;

        // Switch to the target model first
        if (M.switchToModel) M.switchToModel(currentModel);

        // Local model — auto-trigger loading
        if (M._ai && M._ai.isLocalModel && M._ai.isLocalModel(currentModel)) {
            var ls = M._ai.getLocalState(currentModel);
            var consentKey = (M.KEYS && M.KEYS.AI_CONSENTED_PREFIX)
                ? M.KEYS.AI_CONSENTED_PREFIX + currentModel
                : 'ai-consented-' + currentModel;
            var hasConsent = localStorage.getItem(consentKey)
                || (currentModel === 'qwen-local' && localStorage.getItem('ai-consented'));

            if (!ls.loaded && !ls.worker) {
                if (hasConsent) {
                    M._ai.initAiWorker(currentModel);
                    showToast('⏳ Loading AI model from cache...', 'info');
                } else {
                    // Show download popup
                    if (M.showModelDownloadPopup) M.showModelDownloadPopup(currentModel);
                    throw new Error('AI model needs to be downloaded first. Please accept the download and click Start again.');
                }
            }
        }

        // Cloud model — trigger API key or worker
        var providers = M.getCloudProviders ? M.getCloudProviders() : {};
        var cloudProvider = providers[currentModel];
        if (cloudProvider) {
            if (!cloudProvider.getKey()) {
                if (M.showApiKeyModal) M.showApiKeyModal(currentModel);
                throw new Error('API key required for ' + currentModel + '. Please enter your key and click Start again.');
            }
            if (!cloudProvider.isLoaded() && !cloudProvider.getWorker()) {
                if (M.initCloudWorker) M.initCloudWorker(currentModel);
                showToast('⏳ Connecting to cloud model...', 'info');
            }
        }

        // Poll until ready (120s timeout)
        var start = Date.now();
        var timeoutMs = 120000;
        while (Date.now() - start < timeoutMs) {
            // Check if ready
            if (M.isCurrentModelReady && M.isCurrentModelReady()) {
                showToast('✅ AI model ready!', 'success');
                return true;
            }
            // Also check local state directly
            if (M._ai && M._ai.getLocalState) {
                var lsNow = M._ai.getLocalState(currentModel);
                if (lsNow && lsNow.loaded) {
                    showToast('✅ AI model ready!', 'success');
                    return true;
                }
            }
            await new Promise(function (r) { setTimeout(r, 1000); });
        }

        throw new Error('AI model did not become ready within 120s. Please try again.');
    }

    // ==============================================
    // STATE
    // ==============================================

    var _activeLoops = new Map();  // blockIndex → { abort: false, history: [], bestCode, bestMetric }

    // ==============================================
    // CARD RENDERING
    // ==============================================

    // Search provider pill config (matches ai-docgen.js)
    var RESEARCH_SEARCH_PILLS = [
        { id: 'duckduckgo', icon: '🦆', label: 'DDG', title: 'DuckDuckGo · Free · No API key' },
        { id: 'brave', icon: '🦁', label: 'Brave', title: 'Brave Search · 2,000/month free' },
        { id: 'serper', icon: '🔎', label: 'Serper', title: 'Serper.dev · 2,500 queries free' },
        { id: 'tavily', icon: '🤖', label: 'Tavily', title: 'Tavily · AI-optimized · 1,000/month free' },
        { id: 'google_cse', icon: '🔍', label: 'Google', title: 'Google CSE · 100/day free' },
        { id: 'wikipedia', icon: '📖', label: 'Wiki', title: 'Wikipedia · Free encyclopedia' },
    ];

    function buildResearchSearchPillsHtml(blockIndex, activeProvider) {
        var html = '<div class="research-search-pills-panel" data-research-index="' + blockIndex + '" style="display:none">'
            + '<div class="research-search-pills-row">';
        RESEARCH_SEARCH_PILLS.forEach(function (p) {
            var isActive = activeProvider === p.id;
            // Check if this provider requires an API key and if one is configured
            var keyIndicator = '';
            if (M.webSearch && M.webSearch.PROVIDERS && M.webSearch.PROVIDERS[p.id] && M.webSearch.PROVIDERS[p.id].requiresKey) {
                var hasKey = M.webSearch.getProviderKey && M.webSearch.getProviderKey(p.id);
                keyIndicator = hasKey
                    ? ' <span class="research-key-ok" title="API key configured">🔑</span>'
                    : ' <span class="research-key-missing" title="API key required — click to configure">⚠️</span>';
            }
            html += '<label class="ai-card-search-pill' + (isActive ? ' active' : '') + '" data-provider="' + p.id + '" title="' + p.title + '">'
                + '<input type="checkbox" class="research-search-check" value="' + p.id + '" data-research-index="' + blockIndex + '"' + (isActive ? ' checked' : '') + '>'
                + '<span class="ai-card-search-pill-label">' + p.icon + ' ' + p.label + keyIndicator + '</span>'
                + '</label>';
        });
        html += '</div></div>';
        return html;
    }

    function getResearchSearchProviders(container, blockIndex) {
        var panel = container.querySelector('.research-search-pills-panel[data-research-index="' + blockIndex + '"]');
        if (!panel) return [];
        var providers = [];
        panel.querySelectorAll('.research-search-check:checked').forEach(function (cb) {
            providers.push(cb.value);
        });
        return providers;
    }

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

            var searchMatch = trimmed.match(/^@search\s*:\s*(.+)/i);
            if (searchMatch) { config.search = searchMatch[1].trim().toLowerCase(); continue; }

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

            // Code preview (full code, CSS handles overflow)
            var codePreview = cfg.code || '(no code provided)';

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
                + '<button class="research-btn research-search-toggle' + (cfg.search && cfg.search !== 'no' ? ' active' : '') + '" data-research-index="' + blockIndex + '" title="Search engines">🔍</button>'
                + '<button class="research-btn research-btn-start" data-research-index="' + blockIndex + '" title="Start experiment loop">▶ Start</button>'
                + '<button class="research-btn research-btn-stop" data-research-index="' + blockIndex + '" title="Stop experiment loop">⏹ Stop</button>'
                + '<button class="research-btn" data-research-index="' + blockIndex + '" data-action="remove" title="Remove tag">✕</button>'
                + '</div></div>'

                + buildResearchSearchPillsHtml(blockIndex, cfg.search && cfg.search !== 'no' && cfg.search !== 'yes' ? cfg.search : '')

                + '<div class="research-info">'
                + '<div class="research-goal"><strong>Goal:</strong> ' + escapeHtml(cfg.goal || 'No goal specified') + '</div>'
                + '<div class="research-config-row">'
                + '<span class="research-config-badge">🐍 Python (Pyodide)</span>'
                + '<span class="research-config-badge">📊 ' + escapeHtml(cfg.metric) + ' (' + dirArrow + ')</span>'
                + '<span class="research-config-badge">🔄 Max ' + cfg.maxIterations + ' iterations</span>'
                + (cfg.search && cfg.search !== 'no' ? '<span class="research-config-badge research-search-active">🔍 Search: ' + escapeHtml(cfg.search) + '</span>' : '')
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

            html += '<tr class="' + (isBest ? 'research-row-best' : '') + ' research-row-expandable" data-research-row="' + i + '">'
                + '<td>' + h.iteration + '</td>'
                + '<td>' + metricDisplay + '</td>'
                + '<td><span class="research-delta ' + deltaClass + '">' + delta + '</span></td>'
                + '<td><span class="research-badge ' + badgeClass + '">' + statusIcon + ' ' + h.status + '</span></td>'
                + '<td title="Click to expand prompt">' + escapeHtml(h.description || '') + '</td>'
                + '</tr>';

            // Expandable prompt row — extract only the PROMPT text, not the full scorer code
            if (h.code) {
                var promptText = '';
                var promptMatch = h.code.match(/PROMPT\s*=\s*={0,0}"""([\s\S]*?)"""/);
                if (!promptMatch) promptMatch = h.code.match(/PROMPT\s*=\s*'''([\s\S]*?)'''/);
                if (!promptMatch) promptMatch = h.code.match(/PROMPT\s*=\s*"([\s\S]*?)(?<!\\)"/);
                if (promptMatch) {
                    promptText = promptMatch[1].trim();
                } else {
                    // Fallback: show first 40 lines of code
                    promptText = h.code.split('\n').slice(0, 40).join('\n');
                }
                var escapedPrompt = escapeHtml(promptText);
                html += '<tr class="research-code-row" data-research-code-row="' + i + '" style="display:none;">'
                    + '<td colspan="5">'
                    + '<div class="research-prompt-expand">'
                    + '<div class="research-prompt-expand-header">'
                    + '<span class="research-prompt-expand-label">✨ Optimized Prompt — Score: ' + metricDisplay + '</span>'
                    + '<button class="research-btn research-prompt-copy-btn" data-prompt-idx="' + i + '" title="Copy prompt to clipboard">📋 Copy</button>'
                    + '</div>'
                    + '<pre class="research-prompt-text" data-prompt-idx="' + i + '">' + escapedPrompt + '</pre>'
                    + '</div>'
                    + '</td>'
                    + '</tr>';
            }
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

    function buildResearchPrompt(cfg, currentCode, history, searchContext) {
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

        var prompt = 'You are an autonomous research agent optimizing Python code.\n\n'
            + 'GOAL: ' + cfg.goal + '\n\n'
            + 'CURRENT BEST CODE:\n```python\n' + currentCode + '\n```\n\n'
            + 'METRIC: ' + cfg.metric + ' (' + cfg.direction + ' is better)\n'
            + 'Current best: ' + (history.length > 0 && history[history.length - 1] ? history[0].metric : 'unknown') + '\n\n'
            + 'EXPERIMENT HISTORY:\n' + historyText + '\n'
            + strategyHint + '\n'
            + 'Suggest ONE targeted modification to improve the metric.\n'
            + 'FORMAT YOUR RESPONSE EXACTLY LIKE THIS:\n'
            + 'DESCRIPTION: <one-line summary of what you changed>\n'
            + '```python\n<complete modified code>\n```\n\n'
            + 'Rules:\n'
            + '- Start with DESCRIPTION: line explaining your change\n'
            + '- Then the complete modified Python code in a python code fence\n'
            + '- Make incremental, specific changes\n'
            + '- The code MUST be valid Python\n'
            + '- Do NOT modify the test harness — only the code block';

        // Inject web search results if available
        if (searchContext) {
            prompt = 'WEB RESEARCH RESULTS:\n' + searchContext + '\n\nUse the above research to inform your approach. Cite techniques from the search results when applicable.\n\n' + prompt;
        }

        return prompt;
    }

    function extractCodeFromAiResponse(text) {
        // Try to extract from code fences first
        var fenceMatch = text.match(/```(?:python)?\s*\n([\s\S]*?)\n```/);
        if (fenceMatch) return fenceMatch[1].trim();

        // Otherwise use the raw text (strip leading/trailing whitespace)
        // But remove any DESCRIPTION: line at the top
        var cleaned = text.replace(/^DESCRIPTION:.*\n?/im, '').trim();
        return cleaned;
    }

    /**
     * Extract a description from the AI's full response text.
     * Checks: DESCRIPTION: line > text before code fence > # comment in code > fallback.
     */
    function extractDescriptionFromAiResponse(fullResponse, code, iter) {
        // 1. Look for explicit DESCRIPTION: line
        var descLine = fullResponse.match(/DESCRIPTION:\s*(.+)/i);
        if (descLine && descLine[1].trim().length > 5) {
            return descLine[1].trim().substring(0, 120);
        }

        // 2. Look for text before the code fence (AI explanation)
        var beforeFence = fullResponse.split(/```/)[0].trim();
        if (beforeFence.length > 10 && beforeFence.length < 200) {
            // Clean up common prefixes
            var cleaned = beforeFence
                .replace(/^(here'?s?|i'?ve?|the|my|this)\s+(is\s+)?(the\s+)?(modified|updated|new|improved)?\s*/i, '')
                .replace(/^(code|version|modification|change):?\s*/i, '')
                .trim();
            if (cleaned.length > 5) return cleaned.substring(0, 120);
        }

        // 3. Look for # comment at top of code
        if (code) {
            var commentMatch = code.match(/^#\s*(.+)/m);
            if (commentMatch && commentMatch[1].trim().length > 3) {
                return commentMatch[1].trim().substring(0, 120);
            }
        }

        // 4. Fallback
        return 'AI modification #' + iter;
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

        // ── Ensure AI model is ready before starting ──
        showToast('⏳ Checking AI model readiness...', 'info');
        try {
            await ensureResearchModelReady(selectedModel);
        } catch (modelErr) {
            showToast('❌ ' + modelErr.message, 'error');
            return;
        }

        // Switch to the selected model
        if (selectedModel && M.switchToModel) {
            M.switchToModel(selectedModel);
        }

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
                // ── Read search providers from UI or fall back to @search field ──
                var searchProviders = getResearchSearchProviders(document, blockIndex);
                var searchContext = '';
                if (searchProviders.length > 0 && M.webSearch) {
                    try {
                        updateStatus(blockIndex, '🔍 Searching the web...', state.bestMetric);
                        var searchQuery = cfg.goal + ' python ' + cfg.metric + ' optimization';
                        var lastThreeLoop = state.history.slice(-3);
                        var recentFailsLoop = lastThreeLoop.filter(function (h) { return h.status === 'discard' || h.status === 'crash'; }).length;
                        if (recentFailsLoop >= 3) {
                            searchQuery = cfg.goal + ' alternative algorithm python';
                        }
                        var searchResults = await M.webSearch.performMultiSearch(searchQuery, 3, searchProviders);
                        searchContext = M.webSearch.formatResultsForLLM(searchResults);
                        console.log('[Research] 🔍 Web search returned', searchResults.length, 'results from', searchProviders.join(', '));
                    } catch (_searchErr) {
                        console.warn('[Research] Search failed:', _searchErr);
                    }
                } else if (cfg.search && cfg.search !== 'no' && M.webSearch) {
                    try {
                        var searchQuery = cfg.goal + ' python ' + cfg.metric + ' optimization';
                        // After 3 consecutive failures, search for different approaches
                        var lastThreeLoop = state.history.slice(-3);
                        var recentFailsLoop = lastThreeLoop.filter(function (h) { return h.status === 'discard' || h.status === 'crash'; }).length;
                        if (recentFailsLoop >= 3) {
                            searchQuery = cfg.goal + ' alternative algorithm python';
                        }
                        var searchProvider = cfg.search === 'yes' ? 'duckduckgo' : cfg.search;
                        var searchResults = await M.webSearch.performMultiSearch(searchQuery, 3, [searchProvider]);
                        searchContext = M.webSearch.formatResultsForLLM(searchResults);
                        console.log('[Research] 🔍 Web search returned', searchResults.length, 'results');
                    } catch (_searchErr) {
                        console.warn('[Research] Search failed:', _searchErr);
                    }
                }

                updateStatus(blockIndex, '🧠 AI suggesting experiment #' + iter + '...', state.bestMetric);

                // Ask AI for a code modification
                var aiPrompt = buildResearchPrompt(cfg, state.bestCode, state.history, searchContext);
                var aiResponse;
                try {
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

                // Extract description from AI response text (not just code comments)
                var description = extractDescriptionFromAiResponse(aiResponse, newCode, iter);

                // Execute the new code
                updateStatus(blockIndex, '🐍 Running experiment #' + iter + '...', state.bestMetric);

                var experimentOutput;
                try {
                    experimentOutput = await executeExperiment(newCode, cfg.test);
                } catch (execErr) {
                    // Robust error message extraction
                    var errMsg = '';
                    if (typeof execErr === 'string') {
                        errMsg = execErr;
                    } else if (execErr && execErr.message) {
                        errMsg = execErr.message;
                    } else if (execErr && execErr.stderr) {
                        errMsg = execErr.stderr;
                    } else if (execErr && typeof execErr.toString === 'function') {
                        errMsg = execErr.toString();
                    } else {
                        errMsg = String(execErr || 'Unknown runtime error');
                    }
                    if (!errMsg || errMsg === '[object Object]') errMsg = 'Code execution failed';
                    // Extract last meaningful line (often the actual error)
                    var errLines = errMsg.trim().split('\n');
                    var lastLine = errLines[errLines.length - 1] || errMsg;
                    state.history.push({
                        iteration: iter,
                        code: newCode,
                        metric: null,
                        status: 'crash',
                        description: 'Runtime: ' + lastLine.substring(0, 100),
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

        // Row click → expand/collapse prompt
        container.querySelectorAll('.research-row-expandable').forEach(function (row) {
            row.addEventListener('click', function () {
                var rowIdx = this.dataset.researchRow;
                var codeRow = this.parentNode.querySelector('[data-research-code-row="' + rowIdx + '"]');
                if (codeRow) {
                    var isVisible = codeRow.style.display !== 'none';
                    codeRow.style.display = isVisible ? 'none' : 'table-row';
                    this.classList.toggle('research-row-expanded', !isVisible);
                }
            });

        // Copy prompt button
        container.querySelectorAll('.research-prompt-copy-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = this.dataset.promptIdx;
                var pre = container.querySelector('.research-prompt-text[data-prompt-idx="' + idx + '"]');
                if (pre) {
                    navigator.clipboard.writeText(pre.textContent).then(function () {
                        btn.textContent = '✅ Copied!';
                        setTimeout(function () { btn.textContent = '📋 Copy'; }, 2000);
                    }).catch(function () {
                        btn.textContent = '❌ Failed';
                        setTimeout(function () { btn.textContent = '📋 Copy'; }, 2000);
                    });
                }
            });
        });
            row.style.cursor = 'pointer';
        });

        // 🔍 Search toggle — show/hide search pills panel
        container.querySelectorAll('.research-search-toggle').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = this.dataset.researchIndex;
                var panel = container.querySelector('.research-search-pills-panel[data-research-index="' + idx + '"]');
                if (panel) {
                    var isVisible = panel.style.display !== 'none';
                    panel.style.display = isVisible ? 'none' : '';
                }
            });
        });

        // Search pill checkbox change — update toggle button active state + prompt for API key
        container.querySelectorAll('.research-search-check').forEach(function (cb) {
            cb.addEventListener('change', function () {
                var checkboxEl = this;
                var providerId = checkboxEl.value;
                var idx = checkboxEl.dataset.researchIndex;
                var panel = container.querySelector('.research-search-pills-panel[data-research-index="' + idx + '"]');
                if (!panel) return;

                // If checking a provider that requires an API key, prompt for it
                if (checkboxEl.checked && M.webSearch && M.webSearch.PROVIDERS && M.webSearch.PROVIDERS[providerId]) {
                    var provCfg = M.webSearch.PROVIDERS[providerId];
                    if (provCfg.requiresKey) {
                        var existingKey = M.webSearch.getProviderKey(providerId);
                        if (!existingKey) {
                            // Show prompt for API key
                            var key = window.prompt(
                                (provCfg.dialogTitle || ('API Key for ' + provCfg.name)) + '\n\n'
                                + (provCfg.dialogDesc || 'Enter your API key:') + '\n\n'
                                + 'Get your key at: ' + (provCfg.dialogLink || ''),
                                ''
                            );
                            if (key && key.trim()) {
                                M.webSearch.setProviderKey(providerId, key.trim());
                                showToast('🔑 ' + provCfg.name + ' API key saved!', 'success');
                                // Update the key indicator icon
                                var pill = checkboxEl.closest('.ai-card-search-pill');
                                if (pill) {
                                    var missingIcon = pill.querySelector('.research-key-missing');
                                    if (missingIcon) {
                                        missingIcon.className = 'research-key-ok';
                                        missingIcon.title = 'API key configured';
                                        missingIcon.textContent = '🔑';
                                    }
                                }
                            } else {
                                // No key entered — uncheck
                                checkboxEl.checked = false;
                                showToast('⚠️ ' + provCfg.name + ' requires an API key', 'warning');
                            }
                        }
                    }
                }

                // Update pill active class
                var pill = checkboxEl.closest('.ai-card-search-pill');
                if (pill) pill.classList.toggle('active', checkboxEl.checked);
                // Count checked
                var count = panel.querySelectorAll('.research-search-check:checked').length;
                // Update toggle button
                var toggleBtn = container.querySelector('.research-search-toggle[data-research-index="' + idx + '"]');
                if (toggleBtn) {
                    toggleBtn.classList.toggle('active', count > 0);
                    toggleBtn.textContent = count > 0 ? '🔍 ' + count : '🔍';
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
