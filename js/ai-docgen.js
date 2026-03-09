// ============================================
// ai-docgen.js — AI Document Generator (Tag-Based)
// Insert {{AI: ...}} / {{Think: ...}} markers, render preview cards,
// generate with REVIEW step — user must Accept/Reject/Regenerate
// ============================================
(function (M) {
    'use strict';

    // --- State ---
    var activeBlockOps = new Set(); // Track which block indices are currently generating
    var abortRequested = false;
    var pendingReview = null;      // { blockIndex, result, block, resolve, reject }
    var fillAllQueue = null;       // { remaining, filled, total, prevSections }

    // ==============================================
    // TAGGING — wrap selection with {{AI:}}, {{Think:}}, or {{Image:}}
    // ==============================================
    function insertDocgenTag(type) {
        if (type === 'Agent') {
            M.wrapSelectionWith('{{Agent:\n  Step 1: ', '\n  Step 2: describe the next step\n}}', 'describe this step');
            return;
        }

        var placeholder = type === 'Think'
            ? 'describe what to analyze or reason through'
            : type === 'Image'
                ? 'describe the image to generate'
                : 'describe what to generate';
        M.wrapSelectionWith('{{' + type + ': ', '}}', placeholder);
    }

    // ==============================================
    // PARSING — find all tagged blocks in markdown
    // ==============================================

    function getFencedRanges(text) {
        var ranges = [];
        var match;
        // Fenced code blocks (``` or ~~~)
        var re = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1\s*$/gm;
        while ((match = re.exec(text)) !== null) {
            ranges.push({ start: match.index, end: match.index + match[0].length });
        }
        // Inline code spans (`...`)
        var inlineRe = /`([^`\n]+)`/g;
        while ((match = inlineRe.exec(text)) !== null) {
            ranges.push({ start: match.index, end: match.index + match[0].length });
        }
        return ranges;
    }

    function isInsideFence(pos, fencedRanges) {
        for (var i = 0; i < fencedRanges.length; i++) {
            if (pos >= fencedRanges[i].start && pos < fencedRanges[i].end) return true;
        }
        return false;
    }

    function parseDocgenBlocks(markdown) {
        var blocks = [];
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{(AI|Think|Image|Agent):\s*([\s\S]*?)\}\}/g;
        var match;
        while ((match = re.exec(markdown)) !== null) {
            if (!isInsideFence(match.index, fencedRanges)) {
                var block = {
                    type: match[1],
                    prompt: match[2].trim(),
                    start: match.index,
                    end: match.index + match[0].length,
                    fullMatch: match[0]
                };
                // Parse Agent steps
                if (block.type === 'Agent') {
                    block.steps = parseAgentSteps(block.prompt);
                }

                blocks.push(block);
            }
        }
        return blocks;
    }

    // Parse "Step N: description" lines from an Agent block prompt
    function parseAgentSteps(prompt) {
        var steps = [];
        var lines = prompt.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            var stepMatch = line.match(/^Step\s*(\d+)\s*:\s*(.+)/i);
            if (stepMatch) {
                steps.push({
                    number: parseInt(stepMatch[1], 10),
                    description: stepMatch[2].trim()
                });
            }
        }
        // If no "Step N:" pattern found, treat each non-empty line as a step
        if (steps.length === 0) {
            var num = 1;
            for (var j = 0; j < lines.length; j++) {
                var l = lines[j].trim();
                if (l) {
                    steps.push({ number: num++, description: l });
                }
            }
        }
        return steps;
    }



    // ==============================================
    // PREVIEW — transform markers into placeholder HTML
    // ==============================================

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function transformDocgenMarkdown(markdown) {
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{(AI|Think|Image|Agent):\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        // Build model options for per-card selector
        var models = window.AI_MODELS || {};
        var modelIds = Object.keys(models);
        var currentModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : modelIds[0]) || modelIds[0];

        // Separate text and image model options
        var textModelOptionsHtml = '';
        var imageModelOptionsHtml = '';
        modelIds.forEach(function (id) {
            var m = models[id];
            var name = m.dropdownName || m.label || id;
            if (m.isImageModel) {
                var sel = id === 'imagen-ultra' ? ' selected' : '';
                imageModelOptionsHtml += '<option value="' + id + '"' + sel + '>' + name + '</option>';
            } else {
                var sel = id === currentModel ? ' selected' : '';
                textModelOptionsHtml += '<option value="' + id + '"' + sel + '>' + name + '</option>';
            }
        });
        var modelOptionsHtml = textModelOptionsHtml;

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);

            var type = match[1];
            var prompt = match[2].trim();
            var icon = type === 'Think' ? '🧠' : type === 'Image' ? '🖼️' : type === 'Agent' ? '🔗' : '✨';
            var label = type === 'Think' ? 'Think' : type === 'Image' ? 'Image Generate' : type === 'Agent' ? 'Agent Flow' : 'AI Generate';
            var cardModelOpts = type === 'Image' ? imageModelOptionsHtml : modelOptionsHtml;

            if (type === 'Agent') {
                // Render pipeline card for Agent blocks
                var steps = parseAgentSteps(prompt);
                var stepsHtml = '';
                for (var s = 0; s < steps.length; s++) {
                    stepsHtml += '<div class="ai-agent-step" data-step="' + steps[s].number + '">'
                        + '<span class="ai-agent-step-num">&#9312;</span>'.replace('&#9312;', '\u2460'.codePointAt(0) <= 9471 ? String.fromCodePoint(0x245F + steps[s].number) : steps[s].number + '.')
                        + '<span class="ai-agent-step-desc">' + escapeHtml(steps[s].description) + '</span>'
                        + '<span class="ai-agent-step-status">⏸</span>'
                        + '</div>';
                    if (s < steps.length - 1) {
                        stepsHtml += '<div class="ai-agent-step-arrow">↓</div>';
                    }
                }

                // Build search provider options for the card
                var searchOpts = '<option value="off">🔍 Off</option>'
                    + '<option value="duckduckgo">🦆 DuckDuckGo</option>'
                    + '<option value="brave">🦁 Brave</option>'
                    + '<option value="serper">🔎 Serper</option>';

                result += '<div class="ai-placeholder-card ai-agent-card" data-ai-type="Agent" data-ai-index="' + blockIndex + '">'
                    + '<div class="ai-placeholder-header">'
                    + '<span class="ai-placeholder-icon">' + icon + '</span>'
                    + '<span class="ai-placeholder-label">' + label + '</span>'
                    + '<div class="ai-placeholder-actions">'
                    + '<select class="ai-agent-search-select" data-ai-index="' + blockIndex + '" title="Search provider">' + searchOpts + '</select>'
                    + '<select class="ai-card-model-select" data-ai-index="' + blockIndex + '" title="Model for this flow">' + cardModelOpts + '</select>'
                    + '<button class="ai-placeholder-btn ai-fill-one" data-ai-index="' + blockIndex + '" title="Run this agent flow">▶</button>'
                    + '<button class="ai-placeholder-btn ai-remove-tag" data-ai-index="' + blockIndex + '" title="Remove tag">✕</button>'
                    + '</div></div>'
                    + '<div class="ai-agent-steps">' + stepsHtml + '</div>'
                    + '</div>';
            } else {
                result += '<div class="ai-placeholder-card" data-ai-type="' + type + '" data-ai-index="' + blockIndex + '">'
                    + '<div class="ai-placeholder-header">'
                    + '<span class="ai-placeholder-icon">' + icon + '</span>'
                    + '<span class="ai-placeholder-label">' + label + '</span>'
                    + '<div class="ai-placeholder-actions">'
                    + '<select class="ai-card-model-select" data-ai-index="' + blockIndex + '" title="Model for this generation">' + cardModelOpts + '</select>'
                    + '<button class="ai-placeholder-btn ai-fill-one" data-ai-index="' + blockIndex + '" title="Generate this block">▶</button>'
                    + '<button class="ai-placeholder-btn ai-remove-tag" data-ai-index="' + blockIndex + '" title="Remove tag">✕</button>'
                    + '</div></div>'
                    + '<div class="ai-placeholder-prompt">' + escapeHtml(prompt) + '</div>'
                    + '</div>';
            }

            blockIndex++;
            lastIndex = match.index + match[0].length;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // PREVIEW ACTIONS — bind preview card buttons
    // ==============================================

    function bindDocgenPreviewActions(container) {
        container.querySelectorAll('.ai-fill-one').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                // Check if this is an Agent block
                var card = this.closest('.ai-placeholder-card');
                if (card && card.dataset.aiType === 'Agent') {
                    generateAgentFlow(idx);
                } else {
                    generateAndReview(idx);
                }
            });
        });

        container.querySelectorAll('.ai-remove-tag').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                removeDocgenTag(idx);
            });
        });

        // API key prompt when selecting a search provider that requires one
        container.querySelectorAll('.ai-agent-search-select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                var providerId = this.value;
                if (!M.webSearch || providerId === 'off' || providerId === 'duckduckgo') return;

                var p = M.webSearch.PROVIDERS[providerId];
                if (!p || !p.requiresKey) return;

                // Check if key exists already
                var existingKey = M.webSearch.getProviderKey(providerId);
                if (existingKey) return; // already configured

                // Prompt for key using existing API key modal
                var selectEl = this;
                var modal = document.getElementById('ai-apikey-modal');
                var titleEl = document.getElementById('ai-apikey-title');
                var descEl = document.getElementById('ai-apikey-desc');
                var inputEl = document.getElementById('ai-groq-key-input');
                var linkEl = document.getElementById('ai-apikey-link');
                var iconEl = document.getElementById('ai-apikey-icon');
                var errorEl = document.getElementById('ai-apikey-error');

                if (!modal || !inputEl) {
                    selectEl.value = 'off';
                    return;
                }

                if (titleEl) titleEl.textContent = p.dialogTitle || 'API Key';
                if (descEl) descEl.textContent = p.dialogDesc || 'Enter your API key';
                if (iconEl) iconEl.className = p.icon || 'bi bi-key';
                if (linkEl) {
                    linkEl.href = p.dialogLink || '#';
                    linkEl.textContent = p.dialogLinkText || 'Get API key';
                }
                inputEl.value = '';
                inputEl.placeholder = p.dialogPlaceholder || 'API key...';
                if (errorEl) errorEl.style.display = 'none';
                modal.style.display = 'flex';

                var saveBtn = document.getElementById('ai-apikey-save');
                var cancelBtn = document.getElementById('ai-apikey-cancel');
                function onSave() {
                    var key = inputEl.value.trim();
                    if (key) {
                        M.webSearch.setProviderKey(providerId, key);
                    } else {
                        selectEl.value = 'off';
                    }
                    modal.style.display = 'none';
                    cleanup();
                }
                function onCancel() {
                    selectEl.value = 'off';
                    modal.style.display = 'none';
                    cleanup();
                }
                function cleanup() {
                    saveBtn.removeEventListener('click', onSave);
                    cancelBtn.removeEventListener('click', onCancel);
                }
                saveBtn.addEventListener('click', onSave, { once: true });
                cancelBtn.addEventListener('click', onCancel, { once: true });
            });
        });
    }

    // ==============================================
    // M._docgen — Internal namespace for cross-module access
    // Used by ai-docgen-generate.js and ai-docgen-ui.js
    // ==============================================
    M._docgen = {
        activeBlockOps: activeBlockOps,
        get abortRequested() { return abortRequested; },
        set abortRequested(v) { abortRequested = v; },
        get pendingReview() { return pendingReview; },
        set pendingReview(v) { pendingReview = v; },
        get fillAllQueue() { return fillAllQueue; },
        set fillAllQueue(v) { fillAllQueue = v; },
        parseDocgenBlocks: parseDocgenBlocks,
        escapeHtml: escapeHtml,
    };

    // ==============================================
    // REGISTER TOOLBAR ACTIONS (tag insertion)
    // ==============================================
    M.registerFormattingAction('ai-tag', function () { insertDocgenTag('AI'); });
    M.registerFormattingAction('think-tag', function () { insertDocgenTag('Think'); });
    M.registerFormattingAction('image-tag', function () { insertDocgenTag('Image'); });
    M.registerFormattingAction('agent-tag', function () { insertDocgenTag('Agent'); });

    // ==============================================
    // EXPOSE FOR RENDERER
    // ==============================================
    M.transformDocgenMarkdown = transformDocgenMarkdown;
    M.bindDocgenPreviewActions = bindDocgenPreviewActions;
    M.parseDocgenBlocks = parseDocgenBlocks;

})(window.MDView);
