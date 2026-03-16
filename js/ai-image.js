// ============================================
// ai-image.js — AI Image Generation (Imagen)
// Extracted from ai-assistant.js for modularity
// ============================================
(function (M) {
    'use strict';

    var _ai = M._ai;
    var markdownEditor = M.markdownEditor;

    // --- DOM elements ---
    var aiImageModal = document.getElementById('ai-image-modal');
    var aiImagePromptInput = document.getElementById('ai-image-prompt');
    var aiImageGenerateBtn = document.getElementById('ai-image-generate');
    var aiImageCancelBtn = document.getElementById('ai-image-cancel');
    var aiChatArea = document.getElementById('ai-chat-area');
    var aiSendBtn = document.getElementById('ai-send-btn');

    var selectedAspectRatio = '1:1';
    var imagenWorker = null;
    var imagenWorkerReady = false;

    // --- Aspect ratio pill selection ---
    if (aiImageModal) {
        aiImageModal.querySelectorAll('.ai-aspect-pill').forEach(function (pill) {
            pill.addEventListener('click', function () {
                aiImageModal.querySelectorAll('.ai-aspect-pill').forEach(function (p) { p.classList.remove('active'); });
                this.classList.add('active');
                selectedAspectRatio = this.dataset.ratio;
            });
        });
    }

    function showImageModal() {
        if (!aiImageModal) return;
        aiImageModal.style.display = 'flex';
        if (aiImagePromptInput) {
            aiImagePromptInput.value = '';
            aiImagePromptInput.focus();
        }
        if (aiImageGenerateBtn) {
            aiImageGenerateBtn.disabled = false;
            aiImageGenerateBtn.innerHTML = '<i class="bi bi-stars me-1"></i> Generate';
        }
    }

    function hideImageModal() {
        if (aiImageModal) aiImageModal.style.display = 'none';
    }

    if (aiImageCancelBtn) aiImageCancelBtn.addEventListener('click', hideImageModal);
    if (aiImageModal) {
        aiImageModal.addEventListener('click', function (e) {
            if (e.target === aiImageModal) hideImageModal();
        });
    }

    // --- Initialize or get the Imagen worker (reuses Gemini API key) ---
    function getImagenWorker() {
        if (imagenWorker && imagenWorkerReady) return imagenWorker;

        var imagenConfig = window.AI_MODELS?.['hf-sdxl'];
        if (!imagenConfig) return null;

        var geminiKey = localStorage.getItem(imagenConfig.keyStorageKey);
        if (!geminiKey) return null;

        if (imagenWorker) { imagenWorker.terminate(); }
        imagenWorker = new Worker(imagenConfig.workerFile);
        imagenWorkerReady = false;

        imagenWorker.addEventListener('message', function (e) {
            var msg = e.data;
            switch (msg.type) {
                case 'loaded':
                    imagenWorkerReady = true;
                    break;
                case 'image-complete':
                    handleImageComplete(msg.imageBase64, msg.mimeType, msg.prompt, msg.messageId);
                    break;
                case 'image-error':
                    _ai.handleAiError(msg.message, msg.messageId);
                    _ai.isGenerating = false;
                    if (aiSendBtn) aiSendBtn.disabled = false;
                    break;
                case 'error':
                    _ai.handleAiError(msg.message, msg.messageId);
                    break;
            }
        });

        imagenWorker.postMessage({ type: 'setApiKey', apiKey: geminiKey });
        imagenWorker.postMessage({ type: 'load' });
        return imagenWorker;
    }

    // --- Handle completed image from worker ---
    function handleImageComplete(imageBase64, mimeType, prompt, messageId) {
        _ai.isGenerating = false;
        if (aiSendBtn) aiSendBtn.disabled = false;
        _ai.removeTypingIndicator();

        var welcome = aiChatArea.querySelector('.ai-welcome-message');
        if (welcome) welcome.remove();

        var dataUri = 'data:' + (mimeType || 'image/png') + ';base64,' + imageBase64;

        // Store image in registry with short ID for clean editor text
        if (!M._genImages) M._genImages = {};
        var genId = Math.random().toString(36).substring(2, 10);
        M._genImages[genId] = dataUri;
        var mdText = '![' + prompt + '](gen-img:' + genId + ')';

        var msg = document.createElement('div');
        msg.className = 'ai-message ai-message-ai';
        msg.innerHTML = '\n' +
            '      <span class="ai-msg-label">AI</span>\n' +
            '      <div class="ai-msg-bubble ai-image-bubble">\n' +
            '        <div class="ai-image-prompt-label"><i class="bi bi-image me-1"></i> ' + _ai.escapeHtml(prompt) + '</div>\n' +
            '        <img src="' + dataUri + '" alt="' + _ai.escapeHtml(prompt) + '" class="ai-generated-image" />\n' +
            '      </div>\n' +
            '      <div class="ai-msg-actions">\n' +
            '        <button class="ai-msg-action-btn ai-img-insert-btn" title="Insert image into editor">\n' +
            '          <i class="bi bi-box-arrow-in-down"></i> Insert\n' +
            '        </button>\n' +
            '        <button class="ai-msg-action-btn ai-img-copy-btn" title="Copy markdown">\n' +
            '          <i class="bi bi-clipboard"></i> Copy MD\n' +
            '        </button>\n' +
            '        <button class="ai-msg-action-btn ai-img-save-btn" title="Download image as PNG">\n' +
            '          <i class="bi bi-download"></i> Save\n' +
            '        </button>\n' +
            '      </div>\n';
        aiChatArea.appendChild(msg);
        aiChatArea.scrollTop = aiChatArea.scrollHeight;

        // Wire up Insert button
        msg.querySelector('.ai-img-insert-btn').addEventListener('click', function () {
            var pos = markdownEditor.selectionStart;
            var before = markdownEditor.value.substring(0, pos);
            var after = markdownEditor.value.substring(pos);
            markdownEditor.value = before + '\n' + mdText + '\n' + after;
            markdownEditor.dispatchEvent(new Event('input'));
            this.innerHTML = '<i class="bi bi-check-lg"></i> Inserted';
            var self = this;
            setTimeout(function () { self.innerHTML = '<i class="bi bi-box-arrow-in-down"></i> Insert'; }, 1500);
        });

        // Wire up Copy button
        msg.querySelector('.ai-img-copy-btn').addEventListener('click', function () {
            var self = this;
            navigator.clipboard.writeText(mdText).then(function () {
                self.innerHTML = '<i class="bi bi-check-lg"></i> Copied';
                setTimeout(function () { self.innerHTML = '<i class="bi bi-clipboard"></i> Copy MD'; }, 1500);
            });
        });

        // Wire up Save button — downloads the image as a PNG file
        msg.querySelector('.ai-img-save-btn').addEventListener('click', function () {
            var self = this;
            try {
                var a = document.createElement('a');
                a.href = dataUri;
                // Generate a safe filename from the prompt
                var safeName = prompt.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_').substring(0, 40) || 'generated_image';
                var ext = (mimeType || 'image/png').split('/')[1] || 'png';
                a.download = safeName + '.' + ext;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                self.innerHTML = '<i class="bi bi-check-lg"></i> Saved';
                setTimeout(function () { self.innerHTML = '<i class="bi bi-download"></i> Save'; }, 1500);
            } catch (err) {
                M.showToast('Failed to save image: ' + err.message, 'error');
            }
        });
    }

    // --- Generate image from prompt ---
    function generateImage(prompt, aspectRatio) {
        var currentModel = _ai.currentModel;
        var currentModelCfg = _ai.models[currentModel];
        var imageModelId = (currentModelCfg && currentModelCfg.isImageModel) ? currentModel : 'hf-sdxl';
        var provider = _ai.CLOUD_PROVIDERS[imageModelId];

        if (!provider) {
            _ai.addAiStatusBar('error', 'Image model not configured.');
            return;
        }

        if (!provider.getKey()) {
            _ai.showApiKeyModal(imageModelId);
            return;
        }

        // Ensure panel is open
        if (!_ai.panelOpen) M.openAiPanel();

        // Init worker if needed
        if (!provider.getWorker() || !provider.isLoaded()) {
            _ai.initCloudWorker(imageModelId, function () {
                _doImageGenerate(provider, prompt, aspectRatio);
            });
            return;
        }

        _doImageGenerate(provider, prompt, aspectRatio);
    }

    function _doImageGenerate(provider, prompt, aspectRatio) {
        _ai.isGenerating = true;
        if (aiSendBtn) aiSendBtn.disabled = true;
        _ai.messageIdCounter = _ai.messageIdCounter + 1;
        var messageId = _ai.messageIdCounter;

        // Only add user message if not already shown
        var lastMsg = aiChatArea.querySelector('.ai-message:last-child .ai-msg-bubble');
        var alreadyShown = lastMsg && lastMsg.textContent.includes(prompt);
        if (!alreadyShown) {
            _ai.addUserMessage('🖼️ Generate: ' + prompt);
        }
        _ai.addTypingIndicator();

        provider.getWorker().postMessage({
            type: 'generate-image',
            prompt: prompt,
            aspectRatio: aspectRatio || '1:1',
            messageId: messageId,
        });
    }

    // --- Generate button click ---
    if (aiImageGenerateBtn) {
        aiImageGenerateBtn.addEventListener('click', function () {
            var prompt = aiImagePromptInput ? aiImagePromptInput.value.trim() : '';
            if (!prompt) {
                if (aiImagePromptInput) aiImagePromptInput.focus();
                return;
            }
            hideImageModal();
            generateImage(prompt, selectedAspectRatio);
        });
    }

    // --- Enter key in image prompt ---
    if (aiImagePromptInput) {
        aiImagePromptInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (aiImageGenerateBtn) aiImageGenerateBtn.click();
            }
        });
    }

    // --- Handle the generate-image action chip ---
    var imageChip = document.getElementById('ai-image-chip');
    if (imageChip) {
        imageChip.addEventListener('click', function () {
            var imagenConfig = window.AI_MODELS?.['hf-sdxl'];
            if (!imagenConfig) return;

            var geminiKey = localStorage.getItem(imagenConfig.keyStorageKey);
            if (!geminiKey) {
                if (!_ai.panelOpen) M.openAiPanel();
                _ai.showApiKeyModal('hf-sdxl');
                return;
            }
            showImageModal();
        });
    }

    // --- Expose ---
    M.generateImage = generateImage;
    _ai.handleImageComplete = handleImageComplete;
    _ai.selectedAspectRatio = '1:1';
    Object.defineProperty(_ai, 'selectedAspectRatio', {
        get: function () { return selectedAspectRatio; },
        set: function (v) { selectedAspectRatio = v; }
    });

})(window.MDView);
