// ============================================
// ai-docgen-generate.js — Generation Flow, Review Panel, Agent Flow
// Extracted from ai-docgen.js for modularity
// ============================================
(function (M) {
    'use strict';

    var _dg = M._docgen;

    // Helper: read multi-select search providers from card pills
    function getCardSearchProviders(blockIndex) {
        var panel = document.querySelector('.ai-search-pills-panel[data-ai-index="' + blockIndex + '"]');
        if (!panel) return [];
        var providers = [];
        panel.querySelectorAll('.ai-card-search-check:checked').forEach(function (cb) {
            providers.push(cb.value);
        });
        return providers;
    }

    // ==============================================
    // MODEL READINESS — ensure model is loaded before generation
    // ==============================================

    /**
     * Check if the current AI model is ready. If not, trigger loading
     * (consent dialog for local models, API key modal for cloud models)
     * and return false so the caller can bail out gracefully.
     */
    function ensureModelReady(perCardModel) {
        var currentModel = perCardModel || (M.getCurrentAiModel ? M.getCurrentAiModel() : null);
        if (!currentModel) {
            M.showToast('No AI model selected. Open the AI panel to choose a model.', 'warning');
            return false;
        }

        // Check if model is ready
        if (M.isCurrentModelReady && M.isCurrentModelReady()) {
            return true;
        }

        // Local model — trigger download/consent flow
        if (M._ai && M._ai.isLocalModel && M._ai.isLocalModel(currentModel)) {
            var ls = M._ai.getLocalState(currentModel);
            var consentKey = M.KEYS.AI_CONSENTED_PREFIX + currentModel;
            var hasConsent = localStorage.getItem(consentKey)
                || (currentModel === 'qwen-local' && localStorage.getItem(M.KEYS.AI_CONSENTED));

            if (!ls.loaded && !ls.worker) {
                if (hasConsent) {
                    // Auto-load from cache
                    M._ai.initAiWorker(currentModel);
                    M.showToast('⏳ Loading model from cache — please try again in a moment.', 'info');
                } else {
                    // Show standalone download popup (no need to open AI panel)
                    if (M.showModelDownloadPopup) M.showModelDownloadPopup(currentModel);
                    M.showToast('📥 Please download the AI model first.', 'info');
                }
                return false;
            }

            if (!ls.loaded && ls.worker) {
                M.showToast('⏳ Model is still loading — please wait and try again.', 'info');
                return false;
            }
        }

        // Cloud model — trigger API key or connection
        var providers = M.getCloudProviders ? M.getCloudProviders() : {};
        var cloudProvider = providers[currentModel];
        if (cloudProvider) {
            if (!cloudProvider.getKey()) {
                M.showApiKeyModal(currentModel);
                return false;
            }
            if (!cloudProvider.isLoaded()) {
                if (!cloudProvider.getWorker()) {
                    M.initCloudWorker(currentModel);
                }
                M.showToast('⏳ Connecting to cloud model — please try again in a moment.', 'info');
                return false;
            }
        }

        // Fallback: model not recognized or not ready
        M.showToast('AI model not ready. Please open the AI panel and select a model.', 'warning');
        return false;
    }

    /**
     * Async version that auto-triggers model loading and waits for ready.
     * Checks M._execAborted each iteration so the Stop button works.
     * Fails fast if model is not actually loading.
     */
    async function ensureModelReadyAsync(perCardModel, timeoutMs) {
        timeoutMs = timeoutMs || 60000; // 60s default
        var currentModel = perCardModel || (M.getCurrentAiModel ? M.getCurrentAiModel() : null);

        // No model selected — show setup popup
        if (!currentModel) {
            var selectedModelId = await showAiSetupPopup();
            if (!selectedModelId) throw new Error('No AI model selected. Generation cancelled.');
            currentModel = selectedModelId;
        }

        // Already ready — fast path
        if (M.isCurrentModelReady && M.isCurrentModelReady()) return true;

        // Local model — auto-trigger loading
        if (M._ai && M._ai.isLocalModel && M._ai.isLocalModel(currentModel)) {
            var ls = M._ai.getLocalState(currentModel);
            var consentKey = M.KEYS.AI_CONSENTED_PREFIX + currentModel;
            var hasConsent = localStorage.getItem(consentKey)
                || (currentModel === 'qwen-local' && localStorage.getItem(M.KEYS.AI_CONSENTED));

            if (!ls.loaded && !ls.worker) {
                if (hasConsent) {
                    M._ai.initAiWorker(currentModel);
                    console.log('[RunAll] ⏳ Auto-loading local model:', currentModel);
                    M.showToast('⏳ Auto-loading AI model — please wait…', 'info');
                } else {
                    // No consent — can't auto-load, show popup and fail fast
                    if (M.showModelDownloadPopup) M.showModelDownloadPopup(currentModel);
                    throw new Error('AI model needs to be downloaded first. Please accept the download and try again.');
                }
            }
        }

        // Cloud model — auto-init worker
        var providers = M.getCloudProviders ? M.getCloudProviders() : {};
        var cloudProvider = providers[currentModel];
        if (cloudProvider) {
            if (!cloudProvider.getKey()) {
                M.showApiKeyModal(currentModel);
                throw new Error('API key required for ' + currentModel + '. Please enter your key and try again.');
            }
            if (!cloudProvider.isLoaded() && !cloudProvider.getWorker()) {
                M.initCloudWorker(currentModel);
                console.log('[RunAll] ⏳ Connecting to cloud model:', currentModel);
            }
        }

        // Poll until ready, abort, or timeout
        var start = Date.now();
        var pollCount = 0;
        while (Date.now() - start < timeoutMs) {
            // Check abort flag each iteration
            if (M._execAborted) {
                console.log('[RunAll] ⏹ Model loading aborted by user');
                throw new Error('Execution stopped by user.');
            }

            if (M.isCurrentModelReady && M.isCurrentModelReady()) {
                console.log('[RunAll] ✅ Model ready after ' + ((Date.now() - start) / 1000).toFixed(1) + 's');
                M.showToast('✅ AI model ready!', 'success');
                return true;
            }
            if (M._ai && M._ai.getLocalState) {
                var lsNow = M._ai.getLocalState(currentModel);
                if (lsNow && lsNow.loaded) {
                    console.log('[RunAll] ✅ Model ready after ' + ((Date.now() - start) / 1000).toFixed(1) + 's');
                    M.showToast('✅ AI model ready!', 'success');
                    return true;
                }
                // If no worker started after 5s, fail fast (nothing is loading)
                if (!lsNow.worker && pollCount > 5) {
                    throw new Error('AI model failed to start loading. Please check model configuration.');
                }
            }
            pollCount++;
            await new Promise(function (r) { setTimeout(r, 1000); });
        }

        throw new Error('AI model did not become ready within ' + (timeoutMs / 1000) + 's. Please try again.');
    }

    // ==============================================
    // PROMPT BUILDING
    // ==============================================

    function buildPrompt(block, prevSections, memoryContext, hasImages, varsContext) {
        var base;
        if (hasImages) {
            base = 'You are an expert analyst with vision capabilities. '
                + 'Analyze the attached image(s) and write well-formatted markdown content based on your analysis.\n\n'
                + 'When describing images, be specific about visual details, text content, data, or structure you observe.\n\n';
        } else if (block.type === 'Think') {
            base = 'You are a thoughtful writer. Think carefully about the topic, then produce polished markdown content.\n\n'
                + 'IMPORTANT: Output ONLY the final polished markdown content. Do NOT include your thinking process, '
                + 'reasoning steps, analysis, or any text like "Thinking Process:" or "Drafting:". '
                + 'Just write the final, high-quality markdown article directly.\n\n';
        } else {
            base = 'You are an expert writer. Write well-formatted, high-quality markdown content for this section.\n\n';
        }

        // Inject document variables selected via @input:
        var varsSection = '';
        if (varsContext) {
            varsSection = varsContext + '\n'
                + 'Use the above document variables to inform your response as relevant.\n\n';
        }

        var retrieval = '';
        if (memoryContext) {
            retrieval = '### RELEVANT CONTEXT FROM ATTACHED DOCUMENTS ###\n'
                + memoryContext + '\n---\n\n'
                + 'Use the above context to inform your response. Cite file names when relevant.\n\n';
        }

        var instructions = 'Topic/Instructions:\n' + block.prompt + '\n\n';

        var context = '';
        if (prevSections) {
            context = 'Previous sections of this document (for context — do not repeat them):\n\n'
                + prevSections.substring(0, 3000) + '\n\n---\n\n';
        }

        return base + varsSection + retrieval + instructions + context
            + 'Write ONLY the markdown content. Do not include any meta-commentary, explanations, '
            + 'thinking process, or notes about what you wrote. Start directly with the content.';
    }

    // ==============================================
    // OCR PROMPT BUILDING
    // ==============================================

    function buildOcrPrompt(block) {
        var mode = block.ocrMode || 'text';
        var userHint = block.prompt ? ('\nAdditional user instructions: ' + block.prompt + '\n') : '';

        if (mode === 'svg') {
            return 'You are an expert at interpreting visual graphics and converting them into SVG code.\n\n'
                + 'Analyze the attached image carefully. Convert any charts, diagrams, flowcharts, logos, '
                + 'chemical formulas, or structured graphics into clean, well-structured SVG code.\n\n'
                + 'REQUIREMENTS:\n'
                + '- Preserve the layout, colors, shapes, labels, and text from the original image.\n'
                + '- Use semantic SVG elements (rect, circle, path, text, line, polyline, polygon, g).\n'
                + '- Make the SVG responsive with viewBox attribute.\n'
                + '- Include all visible text as <text> elements.\n'
                + '- Use clean, readable SVG code with proper indentation.\n\n'
                + userHint
                + 'Output ONLY the raw SVG code wrapped in a markdown ```svg code fence. '
                + 'Do NOT include any explanations, descriptions, or commentary outside the code fence.';
        }

        // Text mode (default)
        return 'You are an expert OCR system and document analyst.\n\n'
            + 'Analyze the attached image(s) and extract ALL text content with high fidelity.\n\n'
            + 'REQUIREMENTS:\n'
            + '- Preserve the original document structure: headings, paragraphs, lists, tables.\n'
            + '- Convert tables to Markdown table syntax with proper alignment.\n'
            + '- Preserve any formatting (bold, italic) where detectable.\n'
            + '- For multi-column layouts, transcribe left-to-right, top-to-bottom.\n'
            + '- Maintain the original reading order.\n'
            + '- For handwritten text, do your best to accurately transcribe every word.\n'
            + '- Support ALL languages and scripts (CJK, Arabic, Devanagari, etc.).\n\n'
            + userHint
            + 'Output ONLY the extracted text as clean, well-formatted Markdown. '
            + 'Do NOT describe the image or add any commentary.';
    }

    // ==============================================
    // TRANSLATE PROMPT BUILDING
    // ==============================================

    // Language name → ISO code map for TTS voice selection
    var LANG_CODE_MAP = {
        'japanese': 'ja', 'korean': 'ko', 'chinese': 'zh',
        'french': 'fr', 'german': 'de', 'italian': 'it',
        'spanish': 'es', 'portuguese': 'pt', 'hindi': 'hi',
        'english': 'en',
    };

    function buildTranslatePrompt(block) {
        var targetLang = block.targetLang || 'Japanese';
        return 'You are a professional translator with native fluency in ' + targetLang + '.\n\n'
            + 'Translate the following text into ' + targetLang + ':\n\n'
            + '---\n' + block.prompt + '\n---\n\n'
            + 'REQUIREMENTS:\n'
            + '- Provide a natural, idiomatic translation (not word-for-word).\n'
            + '- Preserve the original formatting and structure.\n'
            + '- If the text contains technical terms, translate them appropriately.\n'
            + '- After the translation, add a pronunciation guide on the next line.\n'
            + '- For non-Latin scripts (Japanese, Korean, Chinese, Hindi, etc.), include romanization/transliteration in parentheses.\n\n'
            + 'Format your response as:\n'
            + '**' + targetLang + ':** [translated text]\n\n'
            + '**Pronunciation:** [romanization or phonetic guide]\n\n'
            + '**Literal meaning:** [word-by-word breakdown if helpful]\n\n'
            + 'Do NOT include any other commentary, explanations, or meta-text.';
    }

    // ==============================================
    // AUTO-DISCOVER MEMORY SOURCES FROM DOCUMENT
    // ==============================================

    /**
     * Scans the document for {{Memory:}} tags and returns their names.
     * Used as fallback when an AI/Think/Agent tag has no explicit Use: field.
     */
    function discoverMemorySources(editorText) {
        var sources = [];
        var memRegex = /\{\{Memory:[^}]*Name:\s*([^\s}]+)/gi;
        var match;
        while ((match = memRegex.exec(editorText)) !== null) {
            var name = match[1].replace(/[,}]/g, '').trim();
            if (name && sources.indexOf(name) === -1) sources.push(name);
        }
        return sources;
    }

    // Strip thinking/reasoning artifacts from generated output
    function cleanGeneratedOutput(text) {
        if (!text) return text;

        text = text.replace(/<(?:think|thinking|thought)>[\s\S]*?<\/(?:think|thinking|thought)>/gi, '');
        text = text.replace(/<(?:think|thinking|thought)>[\s\S]*$/gi, '');
        var closeMatch = text.match(/<\/(?:think|thinking|thought)>/i);
        if (closeMatch) { text = text.substring(text.indexOf(closeMatch[0]) + closeMatch[0].length); }

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
        var imageModelId = modelId || 'hf-sdxl';
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
                    // Store image in registry with short ID for clean editor text
                    var dataUri = 'data:' + mime + ';base64,' + data.imageBase64;
                    if (!M._genImages) M._genImages = {};
                    var genId = Math.random().toString(36).substring(2, 10);
                    M._genImages[genId] = dataUri;
                    var md = '![' + block.prompt.substring(0, 60) + '](gen-img:' + genId + ')';
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

            // Group models by category
            var CATEGORY_ORDER = [
                { key: 'local-multimodal', label: 'Local · Multimodal', icon: 'bi bi-pc-display', desc: 'Text + Vision · Runs in your browser' },
                { key: 'local-thinking', label: 'Local · Thinking', icon: 'bi bi-lightbulb', desc: 'Chain-of-thought reasoning · Runs in your browser' },
                { key: 'local-speech', label: 'Local · Speech', icon: 'bi bi-soundwave', desc: 'TTS & STT · Runs in your browser' },
                { key: 'local-document', label: 'Local · Document', icon: 'bi bi-file-earmark-text', desc: 'Document OCR & parsing · Runs in your browser' },
                { key: 'cloud-text', label: 'Cloud · Text', icon: 'bi bi-cloud', desc: 'Powerful cloud models · API key required' },
                { key: 'cloud-image', label: 'Cloud · Image', icon: 'bi bi-image', desc: 'Image generation · API key required' },
            ];

            var grouped = {};
            modelIds.forEach(function (id) {
                var cat = models[id].category || 'cloud-text';
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(id);
            });

            var cardsHtml = '';
            CATEGORY_ORDER.forEach(function (cat) {
                var ids = grouped[cat.key];
                if (!ids || ids.length === 0) return;

                cardsHtml += '<div class="ai-setup-group">'
                    + '<div class="ai-setup-group-header">'
                    + '<i class="' + cat.icon + ' ai-setup-group-icon"></i>'
                    + '<div class="ai-setup-group-text">'
                    + '<span class="ai-setup-group-label">' + cat.label + '</span>'
                    + '<span class="ai-setup-group-desc">' + cat.desc + '</span>'
                    + '</div>'
                    + '</div>'
                    + '<div class="ai-setup-group-cards">';

                ids.forEach(function (id) {
                    var m = models[id];
                    var desc = m.dropdownDesc || '';
                    var isSelected = id === selectedId;

                    // Status badge for local models / API key button for cloud models
                    var statusBadge = '';
                    var keyButton = '';
                    if (m.isLocal) {
                        var consentKey = (window.MDView && window.MDView.KEYS ? window.MDView.KEYS.AI_CONSENTED_PREFIX : 'ai-consented-') + id;
                        var isDownloaded = localStorage.getItem(consentKey);
                        statusBadge = isDownloaded
                            ? '<span class="ai-setup-badge ai-setup-badge-ready"><i class="bi bi-check-circle-fill"></i> Downloaded</span>'
                            : '<span class="ai-setup-badge ai-setup-badge-download"><i class="bi bi-download"></i> ' + (m.downloadSize || 'Download') + '</span>';
                    } else if (m.keyStorageKey) {
                        // Cloud model — show API key status and a button to enter/change key
                        var providers = M.getCloudProviders ? M.getCloudProviders() : {};
                        var hasKey = providers[id] && providers[id].getKey();
                        keyButton = '<button class="ai-setup-key-btn" data-key-model="' + id + '" title="' + (hasKey ? 'Change API Key' : 'Enter API Key') + '">'
                            + '<i class="bi bi-key' + (hasKey ? '-fill' : '') + '"></i>'
                            + '</button>';
                        statusBadge = hasKey
                            ? '<span class="ai-setup-badge ai-setup-badge-ready"><i class="bi bi-check-circle-fill"></i> Key Set</span>'
                            : '<span class="ai-setup-badge ai-setup-badge-download"><i class="bi bi-key"></i> Key Required</span>';
                    }

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
                        + keyButton
                        + (statusBadge ? '<div class="ai-setup-card-status">' + statusBadge + '</div>' : '')
                        + '</div>';
                });

                cardsHtml += '</div></div>';
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
                card.addEventListener('click', function (e) {
                    // Don't select model if clicking the key button
                    if (e.target.closest('.ai-setup-key-btn')) return;
                    selectCard(this.dataset.modelId);
                });
            });

            // API key buttons for cloud models
            panel.querySelectorAll('.ai-setup-key-btn').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var modelId = this.dataset.keyModel;
                    if (modelId && M.showApiKeyModal) {
                        M.showApiKeyModal(modelId);
                    }
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
                var selectedModel = models[selectedId];
                M.switchToModel(selectedId);

                // Cloud model — check for API key
                var provider = M.getCloudProviders()[selectedId];
                if (provider && !provider.getKey()) {
                    M.showApiKeyModal(selectedId);
                }

                // Local model — trigger download with approval if not yet downloaded
                if (selectedModel && selectedModel.isLocal) {
                    if (M.showModelDownloadPopup) {
                        M.showModelDownloadPopup(selectedId);
                    }
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
        }

        // Ensure model is loaded (trigger download/consent/API key if needed)
        if (!ensureModelReady(perCardModel || originalModel)) {
            if (perCardModel && originalModel && perCardModel !== originalModel) {
                M.switchToModel(originalModel);
            }
            return;
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
                // Read uploaded images for this block
                var uploads = _dg.blockUploads.get(blockIndex) || [];
                var workerAttachments = uploads.map(function (u) {
                    return { type: 'image', data: u.data, mimeType: u.mimeType, name: u.name };
                });

                if (block.type === 'Image') {
                    result = await generateImageForBlock(block, perCardModel);
                } else if (block.type === 'OCR') {
                    // OCR requires at least one image
                    if (workerAttachments.length === 0) {
                        throw new Error('Please attach at least one image to the OCR block before running.');
                    }
                    // Check if current model is a specialized doc model (e.g. Granite Docling)
                    var currentModelId = M.getCurrentAiModel ? M.getCurrentAiModel() : null;
                    var modelsCfg = window.AI_MODELS || {};
                    var isDocModel = currentModelId && modelsCfg[currentModelId] && modelsCfg[currentModelId].isDocModel;

                    result = await M.requestAiTask({
                        taskType: 'generate',
                        context: isDocModel ? (block.ocrMode || 'text') : '',
                        userPrompt: buildOcrPrompt(block),
                        enableThinking: false,
                        silent: true,
                        attachments: workerAttachments
                    });
                } else if (block.type === 'Translate') {
                    // Read target lang from the card's dropdown (may have been changed)
                    var langSelect = document.querySelector('.ai-translate-lang-select[data-ai-index="' + blockIndex + '"]');
                    if (langSelect) block.targetLang = langSelect.value;
                    result = await M.requestAiTask({
                        taskType: 'generate',
                        context: '',
                        userPrompt: buildTranslatePrompt(block),
                        enableThinking: false,
                        silent: true
                    });
                } else {
                    // Resolve @input: vars from M._vars
                    var varsContext = '';
                    if (block.inputVars && M._vars) {
                        var hasInputOptOut = block.inputVars.indexOf('none') !== -1;
                        if (!hasInputOptOut) {
                            varsContext = M._vars.formatForPrompt(block.inputVars);
                        }
                    }

                    // Retrieve memory context: explicit Use: field or auto-discover from document
                    // Use: none explicitly disables all memory for this block
                    var memoryContext = '';
                    var hasOptOut = block.useMemory && block.useMemory.indexOf('none') !== -1;
                    if (!hasOptOut) {
                        var memorySources = (block.useMemory && block.useMemory.length > 0)
                            ? block.useMemory
                            : discoverMemorySources(text);
                        if (memorySources.length > 0 && M._memory) {
                            try {
                                var chunks = await M._memory.search(memorySources, block.prompt, 5);
                                memoryContext = M._memory.formatForContext(chunks);
                            } catch (memErr) {
                                console.warn('Memory search failed:', memErr);
                            }
                        }
                    }

                    // Read per-card multi-select search providers and perform web search if enabled
                    var cardSearchProviders = getCardSearchProviders(blockIndex);
                    var searchContext = '';
                    if (cardSearchProviders.length > 0 && M.webSearch) {
                        try {
                            var searchResults = await M.webSearch.performMultiSearch(block.prompt, 5, cardSearchProviders);
                            searchContext = M.webSearch.formatResultsForLLM(searchResults);
                        } catch (_) { /* search failed, proceed without */ }
                    }

                    var hasImages = workerAttachments.length > 0;
                    var userPrompt = buildPrompt(block, prevContent, memoryContext, hasImages, varsContext);
                    if (searchContext) {
                        userPrompt = 'Web research results:\n' + searchContext + '\n\nUse the above search results to inform your response. Cite sources when relevant.\n\n' + userPrompt;
                    }

                    var useThinking = block.type === 'Think' || block.think;
                    result = await M.requestAiTask({
                        taskType: 'generate',
                        context: prevContent.substring(Math.max(0, prevContent.length - 3000)),
                        userPrompt: userPrompt,
                        enableThinking: useThinking,
                        silent: true,
                        attachments: workerAttachments
                    });

                    // When Think is ON, refine: pass the result back and ask the model to enrich it
                    if (useThinking) {
                        var draft = cleanGeneratedOutput(result);
                        console.log('[DocGen Think] 🧠 Refining output (' + draft.length + ' chars)...');
                        var refinePrompt = 'Here is a draft response:\n\n' + draft + '\n\n'
                            + 'Improve this content by adding important details, examples, or missing information. '
                            + 'Keep the same structure and tone. Output the complete improved version.';
                        result = await M.requestAiTask({
                            taskType: 'generate',
                            context: draft.substring(0, 2000),
                            userPrompt: refinePrompt,
                            enableThinking: false,
                            silent: true,
                            attachments: []
                        });
                        console.log('[DocGen Think] 🧠 Refinement done (' + cleanGeneratedOutput(result).length + ' chars)');
                    }
                }

                _dg.activeBlockOps.delete(blockIndex);
                setCardLoading(false);

                if (block.type === 'Image') {
                    replaceBlockByTag(block.fullMatch, result);
                    _dg.showToast('🖼️ Image generated!', 'success');
                    decision = 'done';
                } else if (block.type === 'OCR') {
                    var ocrCleaned = cleanGeneratedOutput(result);
                    // For SVG mode, ensure the output is in a svg code fence
                    if (block.ocrMode === 'svg' && ocrCleaned && !ocrCleaned.includes('```svg')) {
                        // If the model returned raw SVG, wrap it
                        if (ocrCleaned.trim().startsWith('<svg') || ocrCleaned.trim().startsWith('<?xml')) {
                            ocrCleaned = '```svg\n' + ocrCleaned.trim() + '\n```';
                        }
                    }
                    decision = await showReviewPanel(blockIndex, ocrCleaned, block);
                    if (decision === 'accept') {
                        replaceBlockByTag(block.fullMatch, ocrCleaned);
                        _dg.showToast('🔍 OCR scan accepted!', 'success');
                    } else if (decision === 'reject') {
                        _dg.showToast('❌ Rejected', 'info');
                    }
                } else if (block.type === 'Translate') {
                    var transCleaned = cleanGeneratedOutput(result);
                    decision = await showReviewPanel(blockIndex, transCleaned, block);
                    if (decision === 'accept') {
                        // Extract just the translated text for the TTS block
                        // Strip markdown formatting, bold labels, and find the first real text line
                        var ttsLines = transCleaned.split('\n')
                            .map(function (l) {
                                return l.trim()
                                    .replace(/^\*\*[^*]+\*\*[：:]?\s*/g, '')  // Strip **Label:** prefix
                                    .replace(/\([^)]*\)/g, '')                 // Strip (romanization)
                                    .trim();
                            })
                            .filter(function (l) {
                                if (l.length < 2) return false;
                                if (/^-{3,}$/.test(l)) return false;  // Skip --- separators
                                if (/^\*{3,}$/.test(l)) return false; // Skip *** separators
                                return true;
                            });
                        var ttsText = ttsLines.length > 0 ? ttsLines[0] : transCleaned.trim();

                        var targetLang = block.targetLang || 'Japanese';

                        // If @var: is set, store the translation into the Vars system
                        if (block.varName) {
                            if (M._vars) {
                                M._vars.setRuntime(block.varName, ttsText);
                            } else {
                                if (!window.__API_VARS) window.__API_VARS = {};
                                window.__API_VARS[block.varName] = ttsText;
                            }
                            console.log('[DocGen] Set variable $(' + block.varName + ') = "' + ttsText.substring(0, 50) + '…"');
                        }

                        // Insert translated text + a connected TTS block for audio playback
                        var replacement = transCleaned;
                        // Only auto-insert TTS block if no @var: was set (user uses $(var) manually)
                        if (!block.varName) {
                            replacement += '\n\n{{@TTS:\n  @prompt: ' + ttsText + '\n  @lang: ' + targetLang + '\n}}';
                        }
                        replaceBlockByTag(block.fullMatch, replacement);
                        _dg.showToast('🌐 Translation accepted!' + (block.varName ? ' Stored in $(' + block.varName + ')' : ' TTS card added below.'), 'success');
                    } else if (decision === 'reject') {
                        _dg.showToast('❌ Rejected', 'info');
                    }
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
        }

        // Ensure model is loaded (trigger download/consent/API key if needed)
        if (!ensureModelReady(perCardModel || originalModel)) {
            if (perCardModel && originalModel && perCardModel !== originalModel) {
                M.switchToModel(originalModel);
            }
            return;
        }

        var cardSearchProviders = getCardSearchProviders(blockIndex);

        _dg.activeBlockOps.add(blockIndex);
        var agentCard = document.querySelector('.ai-placeholder-card[data-ai-index="' + blockIndex + '"]');
        if (agentCard) agentCard.classList.add('ai-card-loading');

        var stepEls = agentCard ? agentCard.querySelectorAll('.ai-agent-step') : [];
        function updateStepStatus(stepIdx, status) {
            if (stepIdx < stepEls.length) {
                var statusEl = stepEls[stepIdx].querySelector('.ai-agent-step-status');
                if (statusEl) {
                    if (status === 'running') statusEl.textContent = '⏳';
                    else if (status === 'reasoning') statusEl.textContent = '🤔';
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

        // Check if Think mode is enabled for this Agent card
        var thinkToggle = agentCard ? agentCard.querySelector('.ai-think-toggle') : null;
        var useThinking = thinkToggle && thinkToggle.classList.contains('active');

        for (var i = 0; i < steps.length; i++) {
            updateStepStatus(i, 'running');

            var stepPrompt = 'You are an expert writer. This is step ' + steps[i].number
                + ' of ' + steps.length + ' in a multi-step writing flow.\n\n';

            if (cardSearchProviders.length > 0 && M.webSearch) {
                try {
                    var searchResults = await M.webSearch.performMultiSearch(steps[i].description, 5, cardSearchProviders);
                    var searchContext = M.webSearch.formatResultsForLLM(searchResults);
                    stepPrompt += 'Web research results:\n' + searchContext + '\n\n';
                } catch (_) { /* search failed, proceed without */ }
            }

            stepPrompt += 'Task: ' + steps[i].description + '\n\n';

            // Resolve @input: vars from M._vars for Agent Flow steps
            if (block.inputVars && M._vars) {
                var agentInputOptOut = block.inputVars.indexOf('none') !== -1;
                if (!agentInputOptOut) {
                    var agentVarsCtx = M._vars.formatForPrompt(block.inputVars);
                    if (agentVarsCtx) {
                        stepPrompt += agentVarsCtx + '\n';
                    }
                }
            }

            // Retrieve memory context: explicit Use: field or auto-discover from document
            // Use: none explicitly disables all memory for this block
            var agentHasOptOut = block.useMemory && block.useMemory.indexOf('none') !== -1;
            if (!agentHasOptOut) {
                var agentMemorySources = (block.useMemory && block.useMemory.length > 0)
                    ? block.useMemory
                    : discoverMemorySources(text);
                if (agentMemorySources.length > 0 && M._memory) {
                    try {
                        var memChunks = await M._memory.search(agentMemorySources, steps[i].description, 3);
                        var memCtx = M._memory.formatForContext(memChunks);
                        if (memCtx) {
                            stepPrompt += '### RELEVANT CONTEXT FROM ATTACHED DOCUMENTS ###\n' + memCtx + '\n---\n\n';
                        }
                    } catch (_) { /* memory search failed, proceed without */ }
                }
            }

            if (accumulatedContext) {
                stepPrompt += 'Previous steps produced:\n' + accumulatedContext.substring(0, 3000) + '\n\n';
            }
            if (docContext) {
                stepPrompt += 'Document context:\n' + docContext.substring(Math.max(0, docContext.length - 2000)) + '\n\n';
            }
            stepPrompt += 'Write ONLY the markdown content for this step. Do not include meta-commentary.';

            // Read uploaded images for Agent block
            var agentUploads = _dg.blockUploads.get(blockIndex) || [];
            var agentAttachments = agentUploads.map(function (u) {
                return { type: 'image', data: u.data, mimeType: u.mimeType, name: u.name };
            });

            if (agentAttachments.length > 0 && i === 0) {
                stepPrompt += 'You have vision capabilities. Analyze the attached image(s) as part of this step.\n\n';
            }

            try {
                var result = await M.requestAiTask({
                    taskType: 'generate',
                    context: accumulatedContext || docContext.substring(Math.max(0, docContext.length - 2000)),
                    userPrompt: stepPrompt,
                    enableThinking: useThinking,
                    silent: true,
                    attachments: agentAttachments
                });

                // When Think is ON, refine each step's output
                if (useThinking) {
                    var draft = cleanGeneratedOutput(result);
                    console.log('[Agent Think] 🧠 Step ' + steps[i].number + ' refining (' + draft.length + ' chars)...');
                    var refinePrompt = 'Here is a draft for step ' + steps[i].number + ':\n\n' + draft + '\n\n'
                        + 'Improve this content by adding important details, examples, or missing information. '
                        + 'Keep the same structure and tone. Output the complete improved version.';
                    result = await M.requestAiTask({
                        taskType: 'generate',
                        context: draft.substring(0, 2000),
                        userPrompt: refinePrompt,
                        enableThinking: false,
                        silent: true,
                        attachments: []
                    });
                    console.log('[Agent Think] 🧠 Step ' + steps[i].number + ' refined (' + cleanGeneratedOutput(result).length + ' chars)');
                }

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

    // --- Register runtime adapters for exec-controller (auto-accept mode) ---

    // Shared helper: find the parsed block matching a scanned block descriptor
    function findParsedBlock(block) {
        var text = M.markdownEditor.value;
        var parsedBlocks = M.parseDocgenBlocks(text);
        for (var i = 0; i < parsedBlocks.length; i++) {
            if (parsedBlocks[i].fullMatch === block._fullMatch) {
                return parsedBlocks[i];
            }
        }
        return null;
    }

    // Shared helper: resolve @input vars for a block
    function resolveInputVars(parsedBlock) {
        if (!parsedBlock.inputVars || !M._vars) return '';
        if (parsedBlock.inputVars.indexOf('none') !== -1) return '';
        return M._vars.formatForPrompt(parsedBlock.inputVars) || '';
    }

    // Shared helper: resolve @use memory context for a block
    async function resolveMemoryContext(parsedBlock, text) {
        if (!M._memory) return '';
        var hasOptOut = parsedBlock.useMemory && parsedBlock.useMemory.indexOf('none') !== -1;
        if (hasOptOut) return '';
        var sources = (parsedBlock.useMemory && parsedBlock.useMemory.length > 0)
            ? parsedBlock.useMemory
            : discoverMemorySources(text);
        if (sources.length === 0) return '';
        try {
            var chunks = await M._memory.search(sources, parsedBlock.prompt, 5);
            return M._memory.formatForContext(chunks) || '';
        } catch (_) { return ''; }
    }

    // Shared helper: resolve @search web search for a block
    async function resolveSearchContext(parsedBlock) {
        if (!M.webSearch) return '';
        var providers = parsedBlock.search || [];
        if (providers.length === 0) return '';
        try {
            var results = await M.webSearch.performMultiSearch(parsedBlock.prompt, 5, providers);
            return M.webSearch.formatResultsForLLM(results) || '';
        } catch (_) { return ''; }
    }

    // ── docgen-ai adapter — AI / Think blocks ──
    var docgenAiAdapter = {
        execute: async function (source, block) {
            await ensureModelReadyAsync();

            var text = M.markdownEditor.value;
            var blockStart = block.position || 0;
            var prevContent = text.substring(0, blockStart);
            var parsedBlock = findParsedBlock(block);
            if (!parsedBlock) parsedBlock = { type: 'AI', prompt: source };

            // Resolve @input, @use, @search
            var varsContext = resolveInputVars(parsedBlock);
            var memoryContext = await resolveMemoryContext(parsedBlock, text);
            var searchContext = await resolveSearchContext(parsedBlock);

            var userPrompt = buildPrompt(parsedBlock, prevContent, memoryContext, false, varsContext);
            if (searchContext) {
                userPrompt = 'Web research results:\n' + searchContext
                    + '\n\nUse the above search results to inform your response. Cite sources when relevant.\n\n'
                    + userPrompt;
            }

            var useThinking = parsedBlock.type === 'Think' || parsedBlock.think;
            var result = await M.requestAiTask({
                taskType: 'generate',
                context: prevContent.substring(Math.max(0, prevContent.length - 3000)),
                userPrompt: userPrompt,
                enableThinking: useThinking,
                silent: true
            });

            // Think refinement pass
            if (useThinking) {
                var draft = cleanGeneratedOutput(result);
                var refinePrompt = 'Here is a draft response:\n\n' + draft + '\n\n'
                    + 'Improve this content by adding important details, examples, or missing information. '
                    + 'Keep the same structure and tone. Output the complete improved version.';
                result = await M.requestAiTask({
                    taskType: 'generate',
                    context: draft.substring(0, 2000),
                    userPrompt: refinePrompt,
                    enableThinking: false,
                    silent: true,
                    attachments: []
                });
            }

            var cleaned = cleanGeneratedOutput(result);
            if (block._fullMatch) replaceBlockByTag(block._fullMatch, cleaned);
            return cleaned;
        }
    };

    // ── docgen-image adapter — Image generation ──
    var docgenImageAdapter = {
        execute: function (source, block) {
            var parsedBlock = findParsedBlock(block);
            if (!parsedBlock) parsedBlock = { type: 'Image', prompt: source };

            return generateImageForBlock(parsedBlock).then(function (result) {
                if (block._fullMatch) replaceBlockByTag(block._fullMatch, result);
                return result;
            });
        }
    };

    // ── docgen-agent adapter — Agent multi-step flow (full parity) ──
    var docgenAgentAdapter = {
        execute: async function (source, block) {
            await ensureModelReadyAsync();

            var text = M.markdownEditor.value;
            var parsedBlock = findParsedBlock(block);
            if (!parsedBlock || !parsedBlock.steps || parsedBlock.steps.length === 0) {
                throw new Error('No agent steps found');
            }

            var steps = parsedBlock.steps;
            var docContext = text.substring(0, parsedBlock.start);
            var accumulatedContext = '';
            var allResults = [];
            var useThinking = parsedBlock.think || parsedBlock.type === 'Think';

            for (var s = 0; s < steps.length; s++) {
                var stepPrompt = 'You are an expert writer. This is step ' + steps[s].number
                    + ' of ' + steps.length + ' in a multi-step writing flow.\n\n';

                // @search: web search per step
                var stepSearchCtx = await resolveSearchContext(parsedBlock);
                if (stepSearchCtx) {
                    stepPrompt += 'Web research results:\n' + stepSearchCtx + '\n\n';
                }

                stepPrompt += 'Task: ' + steps[s].description + '\n\n';

                // @input: resolve vars
                var stepVarsCtx = resolveInputVars(parsedBlock);
                if (stepVarsCtx) stepPrompt += stepVarsCtx + '\n';

                // @use: memory context
                var stepMemCtx = await resolveMemoryContext(parsedBlock, text);
                if (stepMemCtx) {
                    stepPrompt += '### RELEVANT CONTEXT FROM ATTACHED DOCUMENTS ###\n' + stepMemCtx + '\n---\n\n';
                }

                if (accumulatedContext) {
                    stepPrompt += 'Previous steps produced:\n' + accumulatedContext.substring(0, 3000) + '\n\n';
                }
                if (docContext) {
                    stepPrompt += 'Document context:\n' + docContext.substring(Math.max(0, docContext.length - 2000)) + '\n\n';
                }
                stepPrompt += 'Write ONLY the markdown content for this step. Do not include meta-commentary.';

                var stepResult = await M.requestAiTask({
                    taskType: 'generate',
                    context: accumulatedContext || docContext.substring(Math.max(0, docContext.length - 2000)),
                    userPrompt: stepPrompt,
                    enableThinking: useThinking,
                    silent: true
                });

                // Think refinement pass per step
                if (useThinking) {
                    var draft = cleanGeneratedOutput(stepResult);
                    var refinePrompt = 'Here is a draft for step ' + steps[s].number + ':\n\n' + draft + '\n\n'
                        + 'Improve this content by adding important details, examples, or missing information. '
                        + 'Keep the same structure and tone. Output the complete improved version.';
                    stepResult = await M.requestAiTask({
                        taskType: 'generate',
                        context: draft.substring(0, 2000),
                        userPrompt: refinePrompt,
                        enableThinking: false,
                        silent: true,
                        attachments: []
                    });
                }

                var cleaned = cleanGeneratedOutput(stepResult);
                accumulatedContext += '\n\n' + cleaned;
                allResults.push(cleaned);
            }

            var combinedResult = allResults.join('\n\n');
            if (block._fullMatch) replaceBlockByTag(block._fullMatch, combinedResult);
            return combinedResult;
        }
    };

    // ── docgen-translate adapter — AI translation ──
    var docgenTranslateAdapter = {
        execute: async function (source, block) {
            await ensureModelReadyAsync();

            var parsedBlock = findParsedBlock(block);
            if (!parsedBlock) parsedBlock = { type: 'Translate', prompt: source };

            // Resolve @input vars (the text to translate may come from a previous block)
            if (parsedBlock.inputVars && M._vars) {
                var hasOptOut = parsedBlock.inputVars.indexOf('none') !== -1;
                if (!hasOptOut) {
                    // Replace $(varName) in the prompt
                    parsedBlock.prompt = M._vars.resolveText(parsedBlock.prompt || '');
                }
            }

            var result = await M.requestAiTask({
                taskType: 'generate',
                context: '',
                userPrompt: buildTranslatePrompt(parsedBlock),
                enableThinking: false,
                silent: true
            });

            var cleaned = cleanGeneratedOutput(result);

            // Store @var if declared
            if (parsedBlock.varName && M._vars) {
                // Extract clean text for var (strip markdown formatting)
                var ttsLines = cleaned.split('\n').map(function (l) {
                    return l.trim()
                        .replace(/^\*\*[^*]+\*\*[：:]?\s*/g, '')
                        .replace(/\([^)]*\)/g, '')
                        .trim();
                }).filter(function (l) {
                    return l.length >= 2 && !/^-{3,}$/.test(l) && !/^\*{3,}$/.test(l);
                });
                var cleanText = ttsLines.length > 0 ? ttsLines[0] : cleaned.trim();
                M._vars.setRuntime(parsedBlock.varName, cleanText);
                console.log('[DocGen RunAll] Set $(' + parsedBlock.varName + ') from Translate');
            }

            if (block._fullMatch) replaceBlockByTag(block._fullMatch, cleaned);
            return cleaned;
        }
    };

    // ── docgen-tts adapter — Text-to-Speech playback ──
    var docgenTtsAdapter = {
        execute: async function (source, block) {
            var parsedBlock = findParsedBlock(block);
            if (!parsedBlock) parsedBlock = { type: 'TTS', prompt: source };

            var ttsText = parsedBlock.prompt || '';
            // Resolve $(varName) references
            ttsText = M._vars ? M._vars.resolveText(ttsText) : ttsText;
            ttsText = ttsText.trim();

            if (!ttsText) {
                console.log('[DocGen RunAll] TTS skipped — no text to speak');
                return '(TTS: no text to speak)';
            }

            var lang = (parsedBlock.targetLang || 'English').toLowerCase();

            if (M.tts && M.tts.speakAsync) {
                console.log('[DocGen RunAll] TTS playing: "' + ttsText.substring(0, 60) + '…" lang=' + lang);
                await M.tts.speakAsync(ttsText, null, lang);
                return '🔊 TTS: "' + ttsText.substring(0, 60) + '…"';
            } else if (M.tts && M.tts.speak) {
                // Fallback: fire-and-forget
                M.tts.speak(ttsText, null, lang);
                await new Promise(function (r) { setTimeout(r, 2000); }); // wait a bit
                return '🔊 TTS: "' + ttsText.substring(0, 60) + '…"';
            }

            return '⚠ TTS engine not loaded';
        }
    };

    // ── docgen-ocr adapter — Image OCR recognition ──
    var docgenOcrAdapter = {
        execute: async function (source, block) {
            await ensureModelReadyAsync();

            var parsedBlock = findParsedBlock(block);
            if (!parsedBlock) parsedBlock = { type: 'OCR', prompt: source };

            // Check for attached images
            var blockIdx = block._blockIndex;
            var uploads = _dg.blockUploads.get(blockIdx) || [];
            if (uploads.length === 0) {
                throw new Error('OCR requires at least one image. Attach an image to the OCR block first.');
            }

            var attachments = uploads.map(function (u) {
                return { type: 'image', data: u.data, mimeType: u.mimeType, name: u.name };
            });

            // Check if current model is a doc model
            var currentModelId = M.getCurrentAiModel ? M.getCurrentAiModel() : null;
            var modelsCfg = window.AI_MODELS || {};
            var isDocModel = currentModelId && modelsCfg[currentModelId] && modelsCfg[currentModelId].isDocModel;

            var result = await M.requestAiTask({
                taskType: 'generate',
                context: isDocModel ? (parsedBlock.ocrMode || 'text') : '',
                userPrompt: buildOcrPrompt(parsedBlock),
                enableThinking: false,
                silent: true,
                attachments: attachments
            });

            var cleaned = cleanGeneratedOutput(result);

            // SVG mode: ensure output is in an svg code fence
            if (parsedBlock.ocrMode === 'svg' && cleaned && !cleaned.includes('```svg')) {
                if (cleaned.trim().startsWith('<svg') || cleaned.trim().startsWith('<?xml')) {
                    cleaned = '```svg\n' + cleaned.trim() + '\n```';
                }
            }

            // Store @var if declared
            if (parsedBlock.varName && M._vars) {
                M._vars.setRuntime(parsedBlock.varName, cleaned);
                console.log('[DocGen RunAll] Set $(' + parsedBlock.varName + ') from OCR');
            }

            if (block._fullMatch) replaceBlockByTag(block._fullMatch, cleaned);
            return cleaned;
        }
    };

    if (M._execRegistry) {
        M._execRegistry.registerRuntime('docgen-ai', docgenAiAdapter);
        M._execRegistry.registerRuntime('docgen-image', docgenImageAdapter);
        M._execRegistry.registerRuntime('docgen-agent', docgenAgentAdapter);
        M._execRegistry.registerRuntime('docgen-translate', docgenTranslateAdapter);
        M._execRegistry.registerRuntime('docgen-tts', docgenTtsAdapter);
        M._execRegistry.registerRuntime('docgen-ocr', docgenOcrAdapter);
    } else {
        if (!M._pendingRuntimeAdapters) M._pendingRuntimeAdapters = [];
        M._pendingRuntimeAdapters.push({ key: 'docgen-ai', adapter: docgenAiAdapter });
        M._pendingRuntimeAdapters.push({ key: 'docgen-image', adapter: docgenImageAdapter });
        M._pendingRuntimeAdapters.push({ key: 'docgen-agent', adapter: docgenAgentAdapter });
        M._pendingRuntimeAdapters.push({ key: 'docgen-translate', adapter: docgenTranslateAdapter });
        M._pendingRuntimeAdapters.push({ key: 'docgen-tts', adapter: docgenTtsAdapter });
        M._pendingRuntimeAdapters.push({ key: 'docgen-ocr', adapter: docgenOcrAdapter });
    }

})(window.MDView);

