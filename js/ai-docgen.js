// ============================================
// ai-docgen.js — AI Document Generator (Tag-Based)
// Insert {{AI: ...}} / {{Think: ...}} markers, render preview cards,
// generate with REVIEW step — user must Accept/Reject/Regenerate
// ============================================
(function (M) {
    'use strict';

    // --- State ---
    var isDocgenRunning = false;
    var abortRequested = false;
    var pendingReview = null;      // { blockIndex, result, block, resolve, reject }
    var fillAllQueue = null;       // { remaining, filled, total, prevSections }

    // ==============================================
    // TAGGING — wrap selection with {{AI:}} or {{Think:}}
    // ==============================================
    function insertDocgenTag(type) {
        var placeholder = type === 'Think'
            ? 'describe what to analyze or reason through'
            : 'describe what to generate';
        M.wrapSelectionWith('{{' + type + ': ', '}}', placeholder);
    }

    // ==============================================
    // PARSING — find all tagged blocks in markdown
    // ==============================================

    function getFencedRanges(text) {
        var ranges = [];
        var match;
        var re = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1\s*$/gm;
        while ((match = re.exec(text)) !== null) {
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
        var re = /\{\{(AI|Think):\s*([\s\S]*?)\}\}/g;
        var match;
        while ((match = re.exec(markdown)) !== null) {
            if (!isInsideFence(match.index, fencedRanges)) {
                blocks.push({
                    type: match[1],
                    prompt: match[2].trim(),
                    start: match.index,
                    end: match.index + match[0].length,
                    fullMatch: match[0]
                });
            }
        }
        return blocks;
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
        var re = /\{\{(AI|Think):\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        // Build model options for per-card selector
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

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);

            var type = match[1];
            var prompt = match[2].trim();
            var icon = type === 'Think' ? '🧠' : '✨';
            var label = type === 'Think' ? 'Think' : 'AI Generate';

            result += '<div class="ai-placeholder-card" data-ai-type="' + type + '" data-ai-index="' + blockIndex + '">'
                + '<div class="ai-placeholder-header">'
                + '<span class="ai-placeholder-icon">' + icon + '</span>'
                + '<span class="ai-placeholder-label">' + label + '</span>'
                + '<div class="ai-placeholder-actions">'
                + '<select class="ai-card-model-select" data-ai-index="' + blockIndex + '" title="Model for this generation">'
                + modelOptionsHtml
                + '</select>'
                + '<button class="ai-placeholder-btn ai-fill-one" data-ai-index="' + blockIndex + '" title="Generate this block">▶</button>'
                + '<button class="ai-placeholder-btn ai-remove-tag" data-ai-index="' + blockIndex + '" title="Remove tag">✕</button>'
                + '</div>'
                + '</div>'
                + '<div class="ai-placeholder-prompt">' + escapeHtml(prompt) + '</div>'
                + '</div>';

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
                generateAndReview(idx);
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
    }

    // ==============================================
    // PROMPT BUILDING
    // ==============================================

    function buildPrompt(block, prevSections) {
        var base = block.type === 'Think'
            ? 'Reason step by step through the following topic, then write polished markdown content.\n\n'
            : 'Write well-formatted markdown content for this section.\n\n';

        var instructions = 'Instructions:\n' + block.prompt + '\n\n';

        var context = '';
        if (prevSections) {
            context = 'Previous sections of this document (for context — do not repeat them):\n\n'
                + prevSections.substring(0, 3000) + '\n\n---\n\n';
        }

        return base + instructions + context
            + 'Write ONLY the markdown content. Do not include explanations about what you wrote.';
    }

    // ==============================================
    // EDITOR HELPERS
    // ==============================================

    function replaceBlockInEditor(blockIndex, replacement) {
        var text = M.markdownEditor.value;
        var blocks = parseDocgenBlocks(text);
        if (blockIndex >= blocks.length) return;

        var block = blocks[blockIndex];
        var before = text.substring(0, block.start);
        var after = text.substring(block.end);

        var newText = before + replacement.trim() + after;
        M.markdownEditor.value = newText;
        M.markdownEditor.dispatchEvent(new Event('input'));
    }

    function removeDocgenTag(blockIndex) {
        var text = M.markdownEditor.value;
        var blocks = parseDocgenBlocks(text);
        if (blockIndex >= blocks.length) return;
        replaceBlockInEditor(blockIndex, blocks[blockIndex].prompt);
    }

    // ==============================================
    // REVIEW PANEL — shows generated content for approval
    // ==============================================

    function showReviewPanel(blockIndex, generatedText, block) {
        return new Promise(function (resolve) {
            // Find the placeholder card in the preview for this block
            var previewPane = document.getElementById('preview-pane')
                || document.querySelector('.preview-pane')
                || document.querySelector('#preview');
            if (!previewPane) {
                // Fallback: just accept automatically
                resolve('accept');
                return;
            }

            var placeholderCard = previewPane.querySelector(
                '.ai-placeholder-card[data-ai-index="' + blockIndex + '"]'
            );

            // Build inline review card
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

            // Render markdown content
            var contentEl = reviewCard.querySelector('.ai-inline-review-content');
            try {
                contentEl.innerHTML = marked.parse(generatedText);
            } catch (_) {
                contentEl.textContent = generatedText;
            }

            // Replace placeholder card or append at end
            if (placeholderCard) {
                placeholderCard.parentNode.replaceChild(reviewCard, placeholderCard);
            } else {
                previewPane.appendChild(reviewCard);
            }

            // Scroll into view
            reviewCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Wire up buttons
            var resolved = false;
            function handleDecision(decision) {
                if (resolved) return;
                resolved = true;
                resolve(decision);
                // Remove the review card and force re-render to restore placeholder
                reviewCard.remove();
                if (decision === 'reject' || decision === 'regenerate') {
                    // Re-render preview to show the placeholder card again
                    if (M.renderMarkdown) M.renderMarkdown();
                }
            }

            reviewCard.querySelector('.ai-review-accept').addEventListener('click', function () {
                handleDecision('accept');
            });
            reviewCard.querySelector('.ai-review-regenerate').addEventListener('click', function () {
                reviewCard.remove();
                // Restore placeholder while regenerating
                if (placeholderCard) {
                    // We need to re-render, so just let the loop handle it
                }
                handleDecision('regenerate');
            });
            reviewCard.querySelector('.ai-review-reject').addEventListener('click', function () {
                handleDecision('reject');
            });
        });
    }

    function dismissReviewPanel() {
        // Clean up any lingering inline reviews
        document.querySelectorAll('.ai-inline-review').forEach(function (el) {
            el.remove();
        });
        // Also clean up any modal overlays from setup popup
        var existing = document.getElementById('ai-review-overlay');
        if (existing) existing.remove();
        pendingReview = null;
    }

    // ==============================================
    // AI MODEL PANEL — right-side sliding, selectable
    // ==============================================

    function showAiSetupPopup() {
        return new Promise(function (resolve) {
            closeSetupPanel();

            var models = window.AI_MODELS || {};
            var modelIds = Object.keys(models);
            var currentModel = M.getCurrentAiModel ? M.getCurrentAiModel() : modelIds[0];
            var selectedId = currentModel || modelIds[0];

            // Overlay
            var overlay = document.createElement('div');
            overlay.className = 'ai-setup-overlay';
            overlay.id = 'ai-setup-overlay';

            // Right-side sliding panel
            var panel = document.createElement('div');
            panel.className = 'ai-setup-slide-panel';
            panel.id = 'ai-setup-slide-panel';

            var cardsHtml = '';
            modelIds.forEach(function (id, idx) {
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

            // Trigger slide-in
            void panel.offsetWidth;
            panel.classList.add('ai-setup-slide-open');
            overlay.classList.add('active');

            // Selection logic
            function selectCard(modelId) {
                selectedId = modelId;
                panel.querySelectorAll('.ai-setup-card').forEach(function (card) {
                    var isMatch = card.dataset.modelId === modelId;
                    card.classList.toggle('selected', isMatch);
                    card.querySelector('.ai-setup-radio').classList.toggle('active', isMatch);
                });
            }

            // Click cards to select
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

            // Use Selected button
            document.getElementById('ai-setup-use').addEventListener('click', function () {
                M.switchToModel(selectedId);
                var provider = M.getCloudProviders()[selectedId];
                if (provider && !provider.getKey()) {
                    M.showApiKeyModal(selectedId);
                }
                finish(selectedId);
            });

            // Close button
            document.getElementById('ai-setup-close').addEventListener('click', function () {
                finish(null);
            });

            // Overlay click closes
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
        var blocks = parseDocgenBlocks(text);
        if (blockIndex >= blocks.length) return;

        if (isDocgenRunning) {
            showToast('Another operation is in progress.', 'warning');
            return;
        }

        // Per-card model selection: read the dropdown, switch model if different
        var originalModel = M.getCurrentAiModel ? M.getCurrentAiModel() : null;
        var cardSelect = document.querySelector('.ai-card-model-select[data-ai-index="' + blockIndex + '"]');
        var perCardModel = cardSelect ? cardSelect.value : null;
        if (perCardModel && perCardModel !== originalModel && M.switchToModel) {
            M.switchToModel(perCardModel);
            // If cloud model needs API key, prompt for it
            var provider = M.getCloudProviders ? M.getCloudProviders()[perCardModel] : null;
            if (provider && !provider.getKey()) {
                M.showApiKeyModal(perCardModel);
                // Restore original model since user hasn't provided key yet
                if (originalModel) M.switchToModel(originalModel);
                return;
            }
        }

        var block = blocks[blockIndex];
        var prevContent = text.substring(0, block.start);
        var decision = 'regenerate';

        while (decision === 'regenerate') {
            isDocgenRunning = true;
            showToast('🪄 Generating...', 'info');

            try {
                var result = await M.requestAiTask({
                    taskType: 'generate',
                    context: prevContent.substring(Math.max(0, prevContent.length - 3000)),
                    userPrompt: buildPrompt(block, prevContent),
                    enableThinking: block.type === 'Think',
                    silent: true
                });

                isDocgenRunning = false;

                // Show review panel and wait for user decision
                decision = await showReviewPanel(blockIndex, result, block);

                if (decision === 'accept') {
                    // Re-parse to get fresh offsets
                    replaceBlockInEditor(blockIndex, result);
                    showToast('✅ Accepted!', 'success');
                    return result;
                } else if (decision === 'reject') {
                    showToast('Discarded — tag kept.', 'info');
                    return null;
                }
                // 'regenerate' → loops back

            } catch (err) {
                isDocgenRunning = false;

                // If model not ready, show API key modal directly (model already selected in card)
                if (err.message && err.message.indexOf('AI model not ready') !== -1) {
                    var selectedModelId = perCardModel || (M.getCurrentAiModel ? M.getCurrentAiModel() : null);
                    if (selectedModelId && M.showApiKeyModal) {
                        M.showApiKeyModal(selectedModelId);
                        showToast('Please enter your API key, then try again.', 'info');
                    } else {
                        showToast('❌ No model selected. Use the Model button to pick one.', 'error');
                    }
                    return null;
                }

                showToast('❌ ' + (err.message || 'Generation failed.'), 'error');
                return null;
            }
        }
    }

    // ==============================================
    // FILL ALL — sequential with review at each step
    // ==============================================

    async function fillAllDocgenBlocks() {
        var text = M.markdownEditor.value;
        var blocks = parseDocgenBlocks(text);

        if (blocks.length === 0) {
            showToast('No {{AI:}} or {{Think:}} blocks found. Select text and click AI or Think to tag sections.', 'warning');
            return;
        }

        if (isDocgenRunning) {
            showToast('An operation is already in progress.', 'warning');
            return;
        }

        var fillBtn = document.getElementById('docgen-fill-btn');
        if (fillBtn) fillBtn.classList.add('fmt-fill-active');

        var filled = 0;
        var total = blocks.length;

        for (var i = 0; i < total; i++) {
            if (abortRequested) {
                showToast('⏹ Stopped. ' + filled + ' of ' + total + ' blocks processed.', 'warning');
                break;
            }

            showProgressToast(i + 1, total);

            // Re-parse to get current positions
            var currentText = M.markdownEditor.value;
            var currentBlocks = parseDocgenBlocks(currentText);
            if (currentBlocks.length === 0) break;

            // Generate and show review for the FIRST remaining block
            var result = await generateAndReview(0);
            if (result !== null) {
                filled++;
            } else {
                // User rejected — skip this block, try next one
                // But since we didn't replace, the block is still there.
                // Ask the user: continue with remaining blocks?
                var continueDecision = await showContinuePrompt(i + 1, total);
                if (!continueDecision) break;
            }
        }

        if (filled === total) {
            showToast('✅ Done! All ' + filled + ' section' + (filled !== 1 ? 's' : '') + ' accepted.', 'success');
        } else if (filled > 0) {
            showToast('✅ ' + filled + ' of ' + total + ' sections accepted.', 'info');
        }

        abortRequested = false;
        if (fillBtn) fillBtn.classList.remove('fmt-fill-active');
        hideProgressToast();
    }

    function showContinuePrompt(current, total) {
        return new Promise(function (resolve) {
            var overlay = document.createElement('div');
            overlay.className = 'ai-review-overlay';
            overlay.id = 'ai-review-overlay';

            var panel = document.createElement('div');
            panel.className = 'ai-review-panel ai-review-panel-compact';
            panel.innerHTML =
                '<div class="ai-review-header">'
                + '<span class="ai-review-title">Block rejected</span>'
                + '</div>'
                + '<div class="ai-review-prompt">Block ' + current + ' of ' + total + ' was rejected. Continue with remaining blocks?</div>'
                + '<div class="ai-review-actions">'
                + '<button class="ai-review-btn ai-review-accept" id="ai-cont-yes">Continue</button>'
                + '<button class="ai-review-btn ai-review-reject" id="ai-cont-no">Stop</button>'
                + '</div>';

            overlay.appendChild(panel);
            document.body.appendChild(overlay);

            document.getElementById('ai-cont-yes').addEventListener('click', function () {
                overlay.remove();
                resolve(true);
            });
            document.getElementById('ai-cont-no').addEventListener('click', function () {
                overlay.remove();
                resolve(false);
            });
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) { overlay.remove(); resolve(false); }
            });
        });
    }

    // ==============================================
    // TOAST / PROGRESS UI
    // ==============================================

    var toastEl = null;
    var toastTimeout = null;

    function ensureToastEl() {
        if (toastEl) return toastEl;
        toastEl = document.createElement('div');
        toastEl.className = 'ai-docgen-toast';
        toastEl.style.display = 'none';
        document.body.appendChild(toastEl);
        return toastEl;
    }

    function showToast(message, type) {
        var el = ensureToastEl();
        el.textContent = message;
        el.className = 'ai-docgen-toast ai-docgen-toast-' + (type || 'info');
        el.style.display = 'flex';
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(function () {
            el.style.display = 'none';
        }, type === 'error' || type === 'warning' ? 5000 : 3000);
    }

    function showProgressToast(current, total) {
        var el = ensureToastEl();
        var pct = Math.round((current / total) * 100);
        el.innerHTML = '<span>🪄 Generating ' + current + ' of ' + total + '...</span>'
            + '<div class="ai-docgen-progress-bar"><div class="ai-docgen-progress-fill" style="width:' + pct + '%"></div></div>';
        el.className = 'ai-docgen-toast ai-docgen-toast-info';
        el.style.display = 'flex';
        clearTimeout(toastTimeout);
    }

    function hideProgressToast() {
        if (toastEl) {
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(function () {
                if (toastEl) toastEl.style.display = 'none';
            }, 2000);
        }
    }

    // ==============================================
    // REGISTER TOOLBAR ACTIONS
    // ==============================================

    M.registerFormattingAction('ai-tag', function () { insertDocgenTag('AI'); });
    M.registerFormattingAction('think-tag', function () { insertDocgenTag('Think'); });
    M.registerFormattingAction('fill-all', function () { fillAllDocgenBlocks(); });

    // Toolbar button for model selection panel
    var modelSelectBtn = document.getElementById('ai-model-select-btn');
    if (modelSelectBtn) {
        modelSelectBtn.addEventListener('click', function () {
            showAiSetupPopup();
        });
    }

    // ==============================================
    // EXPOSE FOR RENDERER
    // ==============================================

    M.transformDocgenMarkdown = transformDocgenMarkdown;
    M.bindDocgenPreviewActions = bindDocgenPreviewActions;
    M.parseDocgenBlocks = parseDocgenBlocks;
    M.openModelSelector = showAiSetupPopup;

})(window.MDView);
