// ============================================
// ai-docgen-generate.js — Generation Flow, Review Panel, Agent Flow
// Extracted from ai-docgen.js for modularity
// ============================================
(function (M) {
    'use strict';

    var _dg = M._docgen;

    // ==============================================
    // PROMPT BUILDING
    // ==============================================

    function buildPrompt(block, prevSections) {
        var base = block.type === 'Think'
            ? 'You are a thoughtful writer. Think carefully about the topic, then produce polished markdown content.\n\n'
            + 'IMPORTANT: Output ONLY the final polished markdown content. Do NOT include your thinking process, '
            + 'reasoning steps, analysis, or any text like "Thinking Process:" or "Drafting:". '
            + 'Just write the final, high-quality markdown article directly.\n\n'
            : 'You are an expert writer. Write well-formatted, high-quality markdown content for this section.\n\n';

        var instructions = 'Topic/Instructions:\n' + block.prompt + '\n\n';

        var context = '';
        if (prevSections) {
            context = 'Previous sections of this document (for context — do not repeat them):\n\n'
                + prevSections.substring(0, 3000) + '\n\n---\n\n';
        }

        return base + instructions + context
            + 'Write ONLY the markdown content. Do not include any meta-commentary, explanations, '
            + 'thinking process, or notes about what you wrote. Start directly with the content.';
    }

    // Strip thinking/reasoning artifacts from generated output
    function cleanGeneratedOutput(text) {
        if (!text) return text;

        text = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

        var thinkingPatterns = [
            /^[\s\S]*?Thinking Process:[\s\S]*?(?=^#|\n#)/m,
            /^[\s\S]*?Analyze the Request:[\s\S]*?(?=^#|\n#)/m,
            /^[\s\S]*?Drafting the Content:[\s\S]*?(?=^#|\n#)/m,
        ];
        for (var i = 0; i < thinkingPatterns.length; i++) {
            text = text.replace(thinkingPatterns[i], '');
        }

        text = text.replace(/(?:Wait,.*?(?:looking|the instruction).*?\n)+/gi, '');
        text = text.trim();

        if (text && !text.startsWith('#') && !text.startsWith('*') && !text.startsWith('-')) {
            var headingMatch = text.match(/\n(#{1,6}\s)/);
            if (headingMatch) {
                var headingIdx = text.indexOf(headingMatch[0]);
                var afterHeading = text.substring(headingIdx + 1);
                if (afterHeading.length > text.length * 0.3) {
                    text = afterHeading;
                }
            }
        }

        return text.trim();
    }

    // ==============================================
    // EDITOR HELPERS
    // ==============================================

    function replaceBlockByTag(fullMatchText, replacement) {
        var text = M.markdownEditor.value;
        var idx = text.indexOf(fullMatchText);
        if (idx === -1) return;
        var before = text.substring(0, idx);
        var after = text.substring(idx + fullMatchText.length);
        var newText = before + replacement.trim() + after;
        M.markdownEditor.value = newText;
        M.markdownEditor.dispatchEvent(new Event('input'));
    }

    // Generate image for an {{Image:}} block via the image worker
    async function generateImageForBlock(block, modelId) {
        var imageModelId = modelId || 'imagen-ultra';
        var providers = M.getCloudProviders ? M.getCloudProviders() : {};
        var provider = providers[imageModelId];

        if (!provider) {
            throw new Error('Image model "' + imageModelId + '" not configured. Please select an image model.');
        }

        if (!provider.getKey()) {
            M.showApiKeyModal(imageModelId);
            throw new Error('API key required for image generation. Please enter your Gemini API key.');
        }

        if (!provider.getWorker() || !provider.isLoaded()) {
            await new Promise(function (resolve, reject) {
                M.initCloudWorker(imageModelId, function () { resolve(); });
                setTimeout(function () { reject(new Error('Worker init timeout')); }, 10000);
            });
        }

        return new Promise(function (resolve, reject) {
            var worker = provider.getWorker();
            if (!worker) { reject(new Error('Image worker not available')); return; }

            function onMessage(e) {
                var data = e.data;
                if (data.type === 'image-complete') {
                    worker.removeEventListener('message', onMessage);
                    var mime = data.mimeType || 'image/png';
                    var md = '![' + block.prompt.substring(0, 60) + '](data:' + mime + ';base64,' + data.imageBase64 + ')';
                    resolve(md);
                } else if (data.type === 'image-error') {
                    worker.removeEventListener('message', onMessage);
                    reject(new Error(data.message || 'Image generation failed'));
                }
            }

            worker.addEventListener('message', onMessage);
            worker.postMessage({
                type: 'generate-image',
                prompt: block.prompt,
                aspectRatio: '1:1',
                messageId: Date.now(),
            });
        });
    }

    function removeDocgenTag(blockIndex) {
        var text = M.markdownEditor.value;
        var blocks = M.parseDocgenBlocks(text);
        if (blockIndex >= blocks.length) return;
        replaceBlockByTag(blocks[blockIndex].fullMatch, blocks[blockIndex].prompt);
    }

    // ==============================================
    // REVIEW PANEL — shows generated content for approval
    // ==============================================

    function showReviewPanel(blockIndex, generatedText, block) {
        return new Promise(function (resolve) {
            var previewPane = document.getElementById('preview-pane')
                || document.querySelector('.preview-pane')
                || document.querySelector('#preview');
            if (!previewPane) {
                resolve('accept');
                return;
            }

            var placeholderCard = previewPane.querySelector(
                '.ai-placeholder-card[data-ai-index="' + blockIndex + '"]'
            );

            var reviewCard = document.createElement('div');
            reviewCard.className = 'ai-inline-review';
            reviewCard.dataset.aiType = block.type;

            var icon = block.type === 'Think' ? '🧠' : '✨';
            var typeLabel = block.type === 'Think' ? 'Think' : 'AI Generate';

            reviewCard.innerHTML =
                '<div class="ai-inline-review-header">'
                + '<span class="ai-inline-review-label">' + icon + ' ' + typeLabel + ' — Review</span>'
                + '</div>'
                + '<div class="ai-inline-review-content"></div>'
                + '<div class="ai-inline-review-actions">'
                + '<button class="ai-review-btn ai-review-accept" title="Accept and replace the tag">Accept</button>'
                + '<button class="ai-review-btn ai-review-regenerate" title="Generate again">Regenerate</button>'
                + '<button class="ai-review-btn ai-review-reject" title="Discard and keep the tag">Reject</button>'
                + '</div>';

            var contentEl = reviewCard.querySelector('.ai-inline-review-content');
            try {
                contentEl.innerHTML = marked.parse(generatedText);
            } catch (_) {
                contentEl.textContent = generatedText;
            }

            if (placeholderCard) {
                placeholderCard.parentNode.replaceChild(reviewCard, placeholderCard);
            } else {
                previewPane.appendChild(reviewCard);
            }

            reviewCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

            var resolved = false;
            function handleDecision(decision) {
                if (resolved) return;
                resolved = true;
                resolve(decision);
                if (decision === 'reject' && placeholderCard) {
                    var models = window.AI_MODELS || {};
                    var modelIds = Object.keys(models);
                    var currentModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : modelIds[0]) || modelIds[0];
                    var modelOptionsHtml = '';
                    modelIds.forEach(function (id) {
                        var m = models[id];
                        var name = m.dropdownName || m.label || id;
                        var sel = id === currentModel ? ' selected' : '';
                        modelOptionsHtml += '<option value="' + id + '"' + sel + '>' + name + '</option>';
                    });
                    var newCard = document.createElement('div');
                    newCard.className = 'ai-placeholder-card';
                    newCard.dataset.aiType = block.type;
                    newCard.dataset.aiIndex = blockIndex;
                    var icon = block.type === 'Think' ? '🧠' : '✨';
                    var label = block.type === 'Think' ? 'Think' : 'AI Generate';
                    newCard.innerHTML =
                        '<div class="ai-placeholder-header">'
                        + '<span class="ai-placeholder-icon">' + icon + '</span>'
                        + '<span class="ai-placeholder-label">' + label + '</span>'
                        + '<div class="ai-placeholder-actions">'
                        + '<select class="ai-card-model-select" data-ai-index="' + blockIndex + '" title="Model for this generation">' + modelOptionsHtml + '</select>'
                        + '<button class="ai-placeholder-btn ai-fill-one" data-ai-index="' + blockIndex + '" title="Generate this block">▶</button>'
                        + '<button class="ai-placeholder-btn ai-remove-tag" data-ai-index="' + blockIndex + '" title="Remove tag">✕</button>'
                        + '</div></div>'
                        + '<div class="ai-placeholder-prompt">' + block.prompt + '</div>';
                    reviewCard.parentNode.replaceChild(newCard, reviewCard);
                    M.bindDocgenPreviewActions(newCard.parentNode);
                } else if (decision === 'accept') {
                    var acceptedWrapper = document.createElement('div');
                    acceptedWrapper.className = 'ai-accepted-content';
                    try {
                        acceptedWrapper.innerHTML = marked.parse(generatedText);
                    } catch (_) {
                        acceptedWrapper.textContent = generatedText;
                    }
                    reviewCard.parentNode.replaceChild(acceptedWrapper, reviewCard);
                } else {
                    var newCard2 = document.createElement('div');
                    newCard2.className = 'ai-placeholder-card ai-card-loading';
                    newCard2.dataset.aiType = block.type;
                    newCard2.dataset.aiIndex = blockIndex;
                    var icon2 = block.type === 'Think' ? '🧠' : '✨';
                    var label2 = block.type === 'Think' ? 'Think' : 'AI Generate';
                    newCard2.innerHTML =
                        '<div class="ai-placeholder-header">'
                        + '<span class="ai-placeholder-icon">' + icon2 + '</span>'
                        + '<span class="ai-placeholder-label">Regenerating...</span>'
                        + '</div>'
                        + '<div class="ai-placeholder-prompt">' + block.prompt + '</div>';
                    reviewCard.parentNode.replaceChild(newCard2, reviewCard);
                }
            }

            reviewCard.querySelector('.ai-review-accept').addEventListener('click', function () {
                handleDecision('accept');
            });
            reviewCard.querySelector('.ai-review-regenerate').addEventListener('click', function () {
                reviewCard.remove();
                handleDecision('regenerate');
            });
            reviewCard.querySelector('.ai-review-reject').addEventListener('click', function () {
                handleDecision('reject');
            });
        });
    }

    function dismissReviewPanel() {
        document.querySelectorAll('.ai-inline-review').forEach(function (el) {
            el.remove();
        });
        var existing = document.getElementById('ai-review-overlay');
        if (existing) existing.remove();
        _dg.pendingReview = null;
    }

    // ==============================================
    // AI MODEL PANEL — right-side sliding, selectable
    // ==============================================

    function showAiSetupPopup() {
        return new Promise(function (resolve) {
            closeSetupPanel();

            var models = window.AI_MODELS || {};
            var modelIds = Object.keys(models).filter(function (id) {
                return !models[id].isImageModel;
            });
            var currentModel = M.getCurrentAiModel ? M.getCurrentAiModel() : modelIds[0];
            var selectedId = currentModel || modelIds[0];

            var overlay = document.createElement('div');
            overlay.className = 'ai-setup-overlay';
            overlay.id = 'ai-setup-overlay';

            var panel = document.createElement('div');
            panel.className = 'ai-setup-slide-panel';
            panel.id = 'ai-setup-slide-panel';

            var cardsHtml = '';
            modelIds.forEach(function (id) {
                var m = models[id];
                var desc = m.dropdownDesc || '';
                var isSelected = id === selectedId;
                cardsHtml += '<div class="ai-setup-card' + (isSelected ? ' selected' : '') + '" data-model-id="' + id + '">'
                    + '<div class="ai-setup-card-radio">'
                    + '<span class="ai-setup-radio' + (isSelected ? ' active' : '') + '"></span>'
                    + '</div>'
                    + '<div class="ai-setup-card-info">'
                    + '<i class="' + (m.icon || 'bi bi-cpu') + ' ai-setup-card-icon"></i>'
                    + '<div>'
                    + '<div class="ai-setup-card-name">' + (m.dropdownName || m.label) + '</div>'
                    + '<div class="ai-setup-card-desc">' + desc + '</div>'
                    + '</div>'
                    + '</div>'
                    + '</div>';
            });

            panel.innerHTML =
                '<div class="ai-setup-slide-header">'
                + '<span class="ai-setup-slide-title">Select AI Model</span>'
                + '<button class="ai-setup-slide-close" id="ai-setup-close" title="Close"><i class="bi bi-x-lg"></i></button>'
                + '</div>'
                + '<div class="ai-setup-slide-desc">Pick a model for this generation. Cloud models need a free API key.</div>'
                + '<div class="ai-setup-cards">' + cardsHtml + '</div>'
                + '<div class="ai-setup-slide-footer">'
                + '<button class="ai-setup-use-btn" id="ai-setup-use">Use Selected</button>'
                + '</div>';

            document.body.appendChild(overlay);
            document.body.appendChild(panel);

            void panel.offsetWidth;
            panel.classList.add('ai-setup-slide-open');
            overlay.classList.add('active');

            function selectCard(modelId) {
                selectedId = modelId;
                panel.querySelectorAll('.ai-setup-card').forEach(function (card) {
                    var isMatch = card.dataset.modelId === modelId;
                    card.classList.toggle('selected', isMatch);
                    card.querySelector('.ai-setup-radio').classList.toggle('active', isMatch);
                });
            }

            panel.querySelectorAll('.ai-setup-card').forEach(function (card) {
                card.addEventListener('click', function () {
                    selectCard(this.dataset.modelId);
                });
            });

            var resolved = false;
            function finish(result) {
                if (resolved) return;
                resolved = true;
                closeSetupPanel();
                resolve(result);
            }

            document.getElementById('ai-setup-use').addEventListener('click', function () {
                M.switchToModel(selectedId);
                var provider = M.getCloudProviders()[selectedId];
                if (provider && !provider.getKey()) {
                    M.showApiKeyModal(selectedId);
                }
                finish(selectedId);
            });

            document.getElementById('ai-setup-close').addEventListener('click', function () {
                finish(null);
            });

            overlay.addEventListener('click', function () {
                finish(null);
            });
        });
    }

    function closeSetupPanel() {
        var panel = document.getElementById('ai-setup-slide-panel');
        var overlay = document.getElementById('ai-setup-overlay');
        if (panel) {
            panel.classList.remove('ai-setup-slide-open');
            setTimeout(function () { if (panel.parentNode) panel.remove(); }, 300);
        }
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(function () { if (overlay.parentNode) overlay.remove(); }, 300);
        }
    }

    // ==============================================
    // GENERATE → REVIEW FLOW
    // ==============================================

    async function generateAndReview(blockIndex) {
        var text = M.markdownEditor.value;
        var blocks = M.parseDocgenBlocks(text);
        if (blockIndex >= blocks.length) return;

        if (_dg.activeBlockOps.has(blockIndex)) {
            _dg.showToast('This block is already being generated.', 'warning');
            return;
        }

        var originalModel = M.getCurrentAiModel ? M.getCurrentAiModel() : null;
        var cardSelect = document.querySelector('.ai-card-model-select[data-ai-index="' + blockIndex + '"]');
        var perCardModel = cardSelect ? cardSelect.value : null;
        if (perCardModel && perCardModel !== originalModel && M.switchToModel) {
            M.switchToModel(perCardModel);
            var provider = M.getCloudProviders ? M.getCloudProviders()[perCardModel] : null;
            if (provider && !provider.getKey()) {
                M.showApiKeyModal(perCardModel);
                if (originalModel) M.switchToModel(originalModel);
                return;
            }
        }

        var block = blocks[blockIndex];
        var prevContent = text.substring(0, block.start);
        var decision = 'regenerate';

        var loadingCard = document.querySelector('.ai-placeholder-card[data-ai-index="' + blockIndex + '"]');
        function setCardLoading(loading) {
            if (!loadingCard) return;
            if (loading) {
                loadingCard.classList.add('ai-card-loading');
                var label = loadingCard.querySelector('.ai-placeholder-label');
                if (label) label.dataset.originalText = label.textContent;
                if (label) label.textContent = 'Generating...';
            } else {
                loadingCard.classList.remove('ai-card-loading');
                var label = loadingCard.querySelector('.ai-placeholder-label');
                if (label && label.dataset.originalText) label.textContent = label.dataset.originalText;
            }
        }

        while (decision === 'regenerate') {
            _dg.activeBlockOps.add(blockIndex);
            setCardLoading(true);
            _dg.showToast('🪄 Generating...', 'info');

            try {
                var result;
                if (block.type === 'Image') {
                    result = await generateImageForBlock(block, perCardModel);
                } else {
                    result = await M.requestAiTask({
                        taskType: 'generate',
                        context: prevContent.substring(Math.max(0, prevContent.length - 3000)),
                        userPrompt: buildPrompt(block, prevContent),
                        enableThinking: block.type === 'Think',
                        silent: true
                    });
                }

                _dg.activeBlockOps.delete(blockIndex);
                setCardLoading(false);

                if (block.type === 'Image') {
                    replaceBlockByTag(block.fullMatch, result);
                    _dg.showToast('🖼️ Image generated!', 'success');
                    decision = 'done';
                } else {
                    var cleaned = cleanGeneratedOutput(result);
                    decision = await showReviewPanel(blockIndex, cleaned, block);

                    if (decision === 'accept') {
                        replaceBlockByTag(block.fullMatch, cleaned);
                        _dg.showToast('✅ Accepted!', 'success');
                    } else if (decision === 'reject') {
                        _dg.showToast('❌ Rejected', 'info');
                    }
                }
            } catch (err) {
                _dg.activeBlockOps.delete(blockIndex);
                setCardLoading(false);
                _dg.showToast('❌ ' + (err.message || 'Generation failed'), 'error');
                decision = 'done';
            }
        }

        if (originalModel && perCardModel && perCardModel !== originalModel && M.switchToModel) {
            M.switchToModel(originalModel);
        }
    }

    // ==============================================
    // AGENT FLOW — sequential step execution with context chaining
    // ==============================================

    async function generateAgentFlow(blockIndex) {
        var text = M.markdownEditor.value;
        var blocks = M.parseDocgenBlocks(text);
        if (blockIndex >= blocks.length) return;
        var block = blocks[blockIndex];
        if (block.type !== 'Agent' || !block.steps || block.steps.length === 0) return;

        if (_dg.activeBlockOps.has(blockIndex)) {
            _dg.showToast('This agent flow is already running.', 'warning');
            return;
        }

        var originalModel = M.getCurrentAiModel ? M.getCurrentAiModel() : null;
        var cardSelect = document.querySelector('.ai-card-model-select[data-ai-index="' + blockIndex + '"]');
        var perCardModel = cardSelect ? cardSelect.value : null;
        if (perCardModel && perCardModel !== originalModel && M.switchToModel) {
            M.switchToModel(perCardModel);
            var provider = M.getCloudProviders ? M.getCloudProviders()[perCardModel] : null;
            if (provider && !provider.getKey()) {
                M.showApiKeyModal(perCardModel);
                if (originalModel) M.switchToModel(originalModel);
                return;
            }
        }

        var searchSelect = document.querySelector('.ai-agent-search-select[data-ai-index="' + blockIndex + '"]');
        var searchProvider = searchSelect ? searchSelect.value : 'off';

        _dg.activeBlockOps.add(blockIndex);
        var agentCard = document.querySelector('.ai-placeholder-card[data-ai-index="' + blockIndex + '"]');
        if (agentCard) agentCard.classList.add('ai-card-loading');

        var stepEls = agentCard ? agentCard.querySelectorAll('.ai-agent-step') : [];
        function updateStepStatus(stepIdx, status) {
            if (stepIdx < stepEls.length) {
                var statusEl = stepEls[stepIdx].querySelector('.ai-agent-step-status');
                if (statusEl) {
                    if (status === 'running') statusEl.textContent = '⏳';
                    else if (status === 'done') statusEl.textContent = '✅';
                    else if (status === 'error') statusEl.textContent = '❌';
                    else statusEl.textContent = '⏸';
                }
                if (status === 'running') stepEls[stepIdx].classList.add('ai-step-active');
                else stepEls[stepIdx].classList.remove('ai-step-active');
            }
        }

        var steps = block.steps;
        var accumulatedContext = '';
        var allResults = [];
        var docContext = text.substring(0, block.start);

        for (var i = 0; i < steps.length; i++) {
            updateStepStatus(i, 'running');

            var stepPrompt = 'You are an expert writer. This is step ' + steps[i].number
                + ' of ' + steps.length + ' in a multi-step writing flow.\n\n';

            if (searchProvider !== 'off' && M.webSearch) {
                try {
                    var searchResults = await M.webSearch.performSearch(steps[i].description);
                    var searchContext = M.webSearch.formatResultsForLLM(searchResults);
                    stepPrompt += 'Web research results:\n' + searchContext + '\n\n';
                } catch (_) { /* search failed, proceed without */ }
            }

            stepPrompt += 'Task: ' + steps[i].description + '\n\n';
            if (accumulatedContext) {
                stepPrompt += 'Previous steps produced:\n' + accumulatedContext.substring(0, 3000) + '\n\n';
            }
            if (docContext) {
                stepPrompt += 'Document context:\n' + docContext.substring(Math.max(0, docContext.length - 2000)) + '\n\n';
            }
            stepPrompt += 'Write ONLY the markdown content for this step. Do not include meta-commentary.';

            try {
                var result = await M.requestAiTask({
                    taskType: 'generate',
                    context: accumulatedContext || docContext.substring(Math.max(0, docContext.length - 2000)),
                    userPrompt: stepPrompt,
                    enableThinking: false,
                    silent: true
                });

                var cleaned = cleanGeneratedOutput(result);
                accumulatedContext += '\n\n' + cleaned;
                allResults.push(cleaned);
                updateStepStatus(i, 'done');
            } catch (err) {
                updateStepStatus(i, 'error');
                _dg.showToast('❌ Step ' + steps[i].number + ' failed: ' + (err.message || 'Generation failed'), 'error');
                _dg.activeBlockOps.delete(blockIndex);
                if (agentCard) agentCard.classList.remove('ai-card-loading');
                if (originalModel && perCardModel && perCardModel !== originalModel && M.switchToModel) {
                    M.switchToModel(originalModel);
                }
                return;
            }
        }

        _dg.activeBlockOps.delete(blockIndex);
        if (agentCard) agentCard.classList.remove('ai-card-loading');

        var combinedResult = allResults.join('\n\n');

        var previewPane = document.getElementById('preview-pane')
            || document.querySelector('.preview-pane')
            || document.querySelector('#preview');

        if (previewPane) {
            var reviewCard = document.createElement('div');
            reviewCard.className = 'ai-inline-review';
            reviewCard.dataset.aiType = 'Agent';
            reviewCard.innerHTML =
                '<div class="ai-inline-review-header">'
                + '<span class="ai-inline-review-label">🔗 Agent Flow — Review (' + steps.length + ' steps)</span>'
                + '</div>'
                + '<div class="ai-inline-review-content"></div>'
                + '<div class="ai-inline-review-actions">'
                + '<button class="ai-review-btn ai-review-accept">Accept All</button>'
                + '<button class="ai-review-btn ai-review-reject">Reject</button>'
                + '</div>';

            var contentEl = reviewCard.querySelector('.ai-inline-review-content');
            try {
                contentEl.innerHTML = marked.parse(combinedResult);
            } catch (_) {
                contentEl.textContent = combinedResult;
            }

            if (agentCard && agentCard.parentNode) {
                agentCard.parentNode.replaceChild(reviewCard, agentCard);
            } else {
                previewPane.appendChild(reviewCard);
            }

            reviewCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

            reviewCard.querySelector('.ai-review-accept').addEventListener('click', function () {
                replaceBlockByTag(block.fullMatch, combinedResult);
                _dg.showToast('✅ Agent flow accepted!', 'success');
                var accepted = document.createElement('div');
                accepted.className = 'ai-accepted-content';
                try { accepted.innerHTML = marked.parse(combinedResult); } catch (_) { accepted.textContent = combinedResult; }
                reviewCard.parentNode.replaceChild(accepted, reviewCard);
            });

            reviewCard.querySelector('.ai-review-reject').addEventListener('click', function () {
                _dg.showToast('❌ Agent flow rejected', 'info');
                M.markdownEditor.dispatchEvent(new Event('input'));
            });
        } else {
            replaceBlockByTag(block.fullMatch, combinedResult);
            _dg.showToast('✅ Agent flow complete!', 'success');
        }

        if (originalModel && perCardModel && perCardModel !== originalModel && M.switchToModel) {
            M.switchToModel(originalModel);
        }
    }

    // --- Expose on M._docgen for cross-module access ---
    _dg.buildPrompt = buildPrompt;
    _dg.cleanGeneratedOutput = cleanGeneratedOutput;
    _dg.replaceBlockByTag = replaceBlockByTag;
    _dg.generateImageForBlock = generateImageForBlock;
    _dg.removeDocgenTag = removeDocgenTag;
    _dg.showReviewPanel = showReviewPanel;
    _dg.dismissReviewPanel = dismissReviewPanel;
    _dg.showAiSetupPopup = showAiSetupPopup;
    _dg.closeSetupPanel = closeSetupPanel;
    _dg.generateAndReview = generateAndReview;
    _dg.generateAgentFlow = generateAgentFlow;

    // Re-expose on M for external callers
    M.openModelSelector = showAiSetupPopup;

})(window.MDView);
