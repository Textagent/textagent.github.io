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

        // Remove XML-style thinking blocks: <thinking>...</thinking>
        text = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

        // Remove "Thinking Process:" sections and everything before the actual content
        // These patterns catch common reasoning dumps
        var thinkingPatterns = [
            /^[\s\S]*?Thinking Process:[\s\S]*?(?=^#|\n#)/m,
            /^[\s\S]*?Analyze the Request:[\s\S]*?(?=^#|\n#)/m,
            /^[\s\S]*?Drafting the Content:[\s\S]*?(?=^#|\n#)/m,
        ];
        for (var i = 0; i < thinkingPatterns.length; i++) {
            text = text.replace(thinkingPatterns[i], '');
        }

        // Remove repetitive "Wait, looking at the instruction" loops
        text = text.replace(/(?:Wait,.*?(?:looking|the instruction).*?\n)+/gi, '');

        // Remove leading/trailing whitespace
        text = text.trim();

        // If after cleanup the text starts with a reasoning line (no markdown heading),
        // try to find the first heading and use content from there
        if (text && !text.startsWith('#') && !text.startsWith('*') && !text.startsWith('-')) {
            var headingMatch = text.match(/\n(#{1,6}\s)/);
            if (headingMatch) {
                var headingIdx = text.indexOf(headingMatch[0]);
                // Only strip preamble if there's substantial content after the heading
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

        // Ensure worker is initialized
        if (!provider.getWorker() || !provider.isLoaded()) {
            await new Promise(function (resolve, reject) {
                M.initCloudWorker(imageModelId, function () { resolve(); });
                // Timeout after 10s
                setTimeout(function () { reject(new Error('Worker init timeout')); }, 10000);
            });
        }

        // Send generate-image request and wait for response
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
        var blocks = parseDocgenBlocks(text);
        if (blockIndex >= blocks.length) return;
        replaceBlockByTag(blocks[blockIndex].fullMatch, blocks[blockIndex].prompt);
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
                if (decision === 'reject' && placeholderCard) {
                    // Rebuild this specific placeholder card instead of re-rendering everything
                    // This preserves other concurrent review panels
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
                    // Replace review card with rendered accepted content directly in the DOM
                    // This preserves other concurrent review panels
                    var acceptedWrapper = document.createElement('div');
                    acceptedWrapper.className = 'ai-accepted-content';
                    try {
                        acceptedWrapper.innerHTML = marked.parse(generatedText);
                    } catch (_) {
                        acceptedWrapper.textContent = generatedText;
                    }
                    reviewCard.parentNode.replaceChild(acceptedWrapper, reviewCard);
                } else {
                    // regenerate — rebuild placeholder card inline (preserves other reviews)
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
            var modelIds = Object.keys(models).filter(function (id) {
                return !models[id].isImageModel; // hide image models from this panel
            });
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

        if (activeBlockOps.has(blockIndex)) {
            showToast('This block is already being generated.', 'warning');
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

        // Show loading state on the placeholder card
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
            activeBlockOps.add(blockIndex);
            setCardLoading(true);
            showToast('🪄 Generating...', 'info');

            try {
                var result;
                if (block.type === 'Image') {
                    // Route Image blocks to image generation
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

                activeBlockOps.delete(blockIndex);
                setCardLoading(false);

                // Clean up thinking artifacts from output
                result = cleanGeneratedOutput(result);

                // Show review panel and wait for user decision
                decision = await showReviewPanel(blockIndex, result, block);

                if (decision === 'accept') {
                    // Use fullMatch text to find and replace (index-independent)
                    replaceBlockByTag(block.fullMatch, result);
                    // Cancel debounced re-render if other review panels are still active
                    var activeReviews = document.querySelectorAll('.ai-inline-review');
                    if (activeReviews.length > 0) {
                        clearTimeout(M.markdownRenderTimeout);
                    }
                    showToast('✅ Accepted!', 'success');
                    return result;
                } else if (decision === 'reject') {
                    showToast('Discarded — tag kept.', 'info');
                    return null;
                }
                // 'regenerate' → loops back

            } catch (err) {
                activeBlockOps.delete(blockIndex);
                setCardLoading(false);

                // If model not ready, handle appropriately
                if (err.message && err.message.indexOf('AI model not ready') !== -1) {
                    var selectedModelId = perCardModel || (M.getCurrentAiModel ? M.getCurrentAiModel() : null);
                    var models = window.AI_MODELS || {};
                    var modelCfg = selectedModelId ? models[selectedModelId] : null;

                    if (modelCfg && modelCfg.isLocal) {
                        // Local model (e.g. Qwen) — offer to download right here
                        var downloadConfirmed = await showLocalModelDownloadPrompt(modelCfg);
                        if (downloadConfirmed) {
                            showToast('⬇️ Downloading model... This may take a moment. Try generating again once loaded.', 'info');
                        }
                    } else if (selectedModelId && M.showApiKeyModal) {
                        // Cloud model — needs API key
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
    // AGENT FLOW — sequential step execution with context chaining
    // ==============================================

    async function generateAgentFlow(blockIndex) {
        var text = M.markdownEditor.value;
        var blocks = parseDocgenBlocks(text);
        if (blockIndex >= blocks.length) return;

        var block = blocks[blockIndex];
        if (block.type !== 'Agent') {
            // Delegate to normal generation
            return generateAndReview(blockIndex);
        }

        if (activeBlockOps.has(blockIndex)) {
            showToast('This agent flow is already running.', 'warning');
            return;
        }

        // Per-card model selection
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

        var steps = block.steps || [];
        if (steps.length === 0) {
            showToast('No steps found in this Agent block.', 'warning');
            return;
        }

        // Check which search provider is selected on this card
        var searchSelect = document.querySelector('.ai-agent-search-select[data-ai-index="' + blockIndex + '"]');
        var searchProvider = searchSelect ? searchSelect.value : 'off';
        var useSearch = searchProvider !== 'off';

        activeBlockOps.add(blockIndex);
        showToast('🔗 Running agent flow (' + steps.length + ' steps)...', 'info');

        // Update step status indicators in the preview card
        var agentCard = document.querySelector('.ai-agent-card[data-ai-index="' + blockIndex + '"]');
        function updateStepStatus(stepIdx, status) {
            if (!agentCard) return;
            var stepEls = agentCard.querySelectorAll('.ai-agent-step');
            if (stepIdx < stepEls.length) {
                var statusEl = stepEls[stepIdx].querySelector('.ai-agent-step-status');
                if (statusEl) {
                    statusEl.textContent = status === 'running' ? '⏳' : status === 'done' ? '✅' : status === 'error' ? '❌' : '⏸';
                }
                stepEls[stepIdx].classList.toggle('ai-step-active', status === 'running');
                stepEls[stepIdx].classList.toggle('ai-step-done', status === 'done');
                stepEls[stepIdx].classList.toggle('ai-step-error', status === 'error');
            }
        }

        // Change header label to 'Running...'
        if (agentCard) {
            var label = agentCard.querySelector('.ai-placeholder-label');
            if (label) {
                label.dataset.originalText = label.textContent;
                label.textContent = 'Running...';
            }
            agentCard.classList.add('ai-card-loading');
        }

        var accumulatedContext = '';
        var allOutputs = [];
        var failed = false;

        for (var i = 0; i < steps.length; i++) {
            updateStepStatus(i, 'running');

            var stepPrompt = 'Step ' + steps[i].number + ': ' + steps[i].description;

            // Web search for this step if enabled
            var searchContext = '';
            if (useSearch && M.webSearch) {
                try {
                    var searchResults = await M.webSearch.performSearch(steps[i].description, 3, searchProvider);
                    searchContext = M.webSearch.formatResultsForLLM(searchResults);
                } catch (_) { /* search failed, continue without */ }
            }

            if (accumulatedContext || searchContext) {
                stepPrompt += '\n\n';
                if (searchContext) stepPrompt += '[Web Search Results]\n' + searchContext + '\n\n';
                if (accumulatedContext) stepPrompt += 'Previous output (use as context):\n' + accumulatedContext;
            }

            try {
                var result = await M.requestAiTask({
                    taskType: 'generate',
                    context: accumulatedContext.substring(0, 4000),
                    userPrompt: 'You are executing a multi-step workflow. '
                        + stepPrompt + '\n\n'
                        + 'Write ONLY the content for this step. Do not include metacommentary.',
                    enableThinking: false,
                    silent: true
                });

                result = cleanGeneratedOutput(result);
                accumulatedContext = result;
                allOutputs.push('### Step ' + steps[i].number + ': ' + steps[i].description + '\n\n' + result);
                updateStepStatus(i, 'done');

            } catch (err) {
                updateStepStatus(i, 'error');
                showToast('❌ Step ' + steps[i].number + ' failed: ' + (err.message || 'Unknown error'), 'error');
                failed = true;
                break;
            }
        }

        activeBlockOps.delete(blockIndex);

        // Restore header label
        if (agentCard) {
            agentCard.classList.remove('ai-card-loading');
            var lbl = agentCard.querySelector('.ai-placeholder-label');
            if (lbl && lbl.dataset.originalText) lbl.textContent = lbl.dataset.originalText;
        }

        if (failed) {
            return null;
        }

        // Combine all step outputs
        var combinedOutput = allOutputs.join('\n\n---\n\n');

        // Show review panel for the combined result
        var decision = await showReviewPanel(blockIndex, combinedOutput, block);

        if (decision === 'accept') {
            replaceBlockByTag(block.fullMatch, combinedOutput);
            showToast('✅ Agent flow complete!', 'success');
            return combinedOutput;
        } else if (decision === 'reject') {
            showToast('Discarded — tag kept.', 'info');
            return null;
        } else if (decision === 'regenerate') {
            // Re-run the entire flow
            return generateAgentFlow(blockIndex);
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

        if (activeBlockOps.size > 0) {
            showToast('An operation is already in progress.', 'warning');
            return;
        }

        var fillBtn = document.getElementById('docgen-fill-btn');
        if (fillBtn) fillBtn.classList.add('fmt-fill-active');

        var filled = 0;
        var total = blocks.length;
        var skipCount = 0; // How many blocks at the start to skip (rejected ones)

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

            // Skip past rejected blocks (they stay in text at the front)
            if (skipCount >= currentBlocks.length) break; // All remaining are skipped

            // Generate and show review for the next unprocessed block
            var result = await generateAndReview(skipCount);
            if (result !== null) {
                // Accepted — block was removed from text, so skipCount stays same
                // (next block shifts down to the same index)
                filled++;
            } else {
                // Rejected — block stays in text, skip past it next time
                skipCount++;
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

    // Prompt user to download local model (e.g. Qwen) right from the generation flow
    function showLocalModelDownloadPrompt(modelCfg) {
        return new Promise(function (resolve) {
            var modelName = modelCfg.dropdownName || modelCfg.label || 'Local AI Model';

            var overlay = document.createElement('div');
            overlay.className = 'ai-review-overlay';
            overlay.id = 'ai-download-overlay';

            var panel = document.createElement('div');
            panel.className = 'ai-review-panel ai-review-panel-compact';
            panel.innerHTML =
                '<div class="ai-review-header">'
                + '<span class="ai-review-title">⬇️ Download ' + modelName + '</span>'
                + '</div>'
                + '<div class="ai-review-prompt">'
                + '<strong>' + modelName + '</strong> needs a one-time <strong>~500 MB</strong> download to run locally in your browser.'
                + '<br><br>Once downloaded, it runs 100% privately — no API key needed.'
                + '</div>'
                + '<div class="ai-review-actions">'
                + '<button class="ai-review-btn ai-review-accept" id="ai-dl-yes"><i class="bi bi-download"></i> Download</button>'
                + '<button class="ai-review-btn ai-review-reject" id="ai-dl-no">Cancel</button>'
                + '</div>';

            overlay.appendChild(panel);
            document.body.appendChild(overlay);

            var resolved = false;
            function finish(result) {
                if (resolved) return;
                resolved = true;
                overlay.remove();
                resolve(result);
            }

            document.getElementById('ai-dl-yes').addEventListener('click', function () {
                // Start the download
                localStorage.setItem('md-viewer-ai-consented', 'true');
                if (M.initLocalAiWorker) M.initLocalAiWorker();
                finish(true);
            });

            document.getElementById('ai-dl-no').addEventListener('click', function () {
                finish(false);
            });

            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) finish(false);
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
    M.registerFormattingAction('image-tag', function () { insertDocgenTag('Image'); });
    M.registerFormattingAction('agent-tag', function () { insertDocgenTag('Agent'); });
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
