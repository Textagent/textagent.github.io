// ============================================
// ai-chat.js — AI Chat Messaging, Streaming, Send Logic
// Extracted from ai-assistant.js for modularity
// ============================================
(function (M) {
    'use strict';

    var _ai = M._ai;
    var markdownEditor = M.markdownEditor;

    // --- DOM elements ---
    var aiChatArea = document.getElementById('ai-chat-area');
    var aiInput = document.getElementById('ai-input');
    var aiSendBtn = document.getElementById('ai-send-btn');
    var aiClearChatBtn = document.getElementById('ai-clear-chat');
    var aiPanel = document.getElementById('ai-panel');

    // --- Helpers ---
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatAiResponse(text) {
        var html = escapeHtml(text);
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        html = html.replace(/\n/g, '<br>');
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['pre', 'code', 'strong', 'em', 'br'],
            ALLOWED_ATTR: []
        });
    }

    // --- Chat Messages ---
    function addUserMessage(text) {
        var welcome = aiChatArea.querySelector('.ai-welcome-message');
        if (welcome) welcome.remove();

        var msg = document.createElement('div');
        msg.className = 'ai-message ai-message-user';
        msg.innerHTML = '<span class="ai-msg-label">You</span>\n<div class="ai-msg-bubble">' + escapeHtml(text) + '</div>';
        aiChatArea.appendChild(msg);
        aiChatArea.scrollTop = aiChatArea.scrollHeight;
    }

    function addTypingIndicator() {
        var indicator = document.createElement('div');
        indicator.className = 'ai-message ai-message-ai';
        indicator.id = 'ai-typing';
        indicator.innerHTML = '<span class="ai-msg-label">AI</span>\n' +
            '<div class="ai-typing-indicator">\n' +
            '  <span class="ai-typing-dot"></span>\n' +
            '  <span class="ai-typing-dot"></span>\n' +
            '  <span class="ai-typing-dot"></span>\n' +
            '</div>';
        aiChatArea.appendChild(indicator);
        aiChatArea.scrollTop = aiChatArea.scrollHeight;
    }

    function removeTypingIndicator() {
        var indicator = document.getElementById('ai-typing');
        if (indicator) indicator.remove();
    }

    // Track last search results for citation rendering
    var _lastSearchResults = null;

    function addAiMessage(text, messageId) {
        removeTypingIndicator();
        var searchInd = aiChatArea.querySelector('.ai-search-indicator');
        if (searchInd) searchInd.remove();
        var welcome = aiChatArea.querySelector('.ai-welcome-message');
        if (welcome) welcome.remove();

        var msg = document.createElement('div');
        msg.className = 'ai-message ai-message-ai';

        var formattedText = formatAiResponse(text);

        // Build source citations
        var citationsHtml = '';
        if (_lastSearchResults && _lastSearchResults.length > 0) {
            citationsHtml = '<div class="ai-source-citations">';
            var seen = new Set();
            _lastSearchResults.forEach(function (r) {
                try {
                    var domain = new URL(r.url).hostname.replace('www.', '');
                    if (!seen.has(domain)) {
                        seen.add(domain);
                        citationsHtml += '<a class="ai-source-link" href="' + r.url + '" target="_blank" rel="noopener">' +
                            '<i class="bi bi-link-45deg"></i>' + domain + '</a>';
                    }
                } catch (_) { /* invalid url */ }
            });
            citationsHtml += '</div>';
            _lastSearchResults = null;
        }

        msg.innerHTML = '<span class="ai-msg-label">AI</span>\n' +
            '<div class="ai-msg-bubble">' + formattedText + '</div>\n' +
            citationsHtml + '\n' +
            '<div class="ai-msg-actions">\n' +
            '  <button class="ai-msg-action-btn" data-action="insert" data-text="' + encodeURIComponent(text) + '" title="Insert into editor">\n' +
            '    <i class="bi bi-box-arrow-in-down"></i> Insert\n' +
            '  </button>\n' +
            '  <button class="ai-msg-action-btn" data-action="copy" data-text="' + encodeURIComponent(text) + '" title="Copy to clipboard">\n' +
            '    <i class="bi bi-clipboard"></i> Copy\n' +
            '  </button>\n' +
            '  <button class="ai-msg-action-btn" data-action="replace" data-text="' + encodeURIComponent(text) + '" title="Replace selected text">\n' +
            '    <i class="bi bi-arrow-left-right"></i> Replace\n' +
            '  </button>\n' +
            '</div>';

        aiChatArea.appendChild(msg);
        aiChatArea.scrollTop = aiChatArea.scrollHeight;

        msg.querySelectorAll('.ai-msg-action-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var action = this.dataset.action;
                var rawText = decodeURIComponent(this.dataset.text);
                handleAiAction(action, rawText, this);
            });
        });
    }

    function handleAiAction(action, text, btn) {
        switch (action) {
            case 'insert': {
                var pos = markdownEditor.selectionStart;
                var before = markdownEditor.value.substring(0, pos);
                var after = markdownEditor.value.substring(pos);
                markdownEditor.value = before + '\n' + text + '\n' + after;
                markdownEditor.dispatchEvent(new Event('input'));
                btn.innerHTML = '<i class="bi bi-check-lg"></i> Inserted';
                setTimeout(function () { btn.innerHTML = '<i class="bi bi-box-arrow-in-down"></i> Insert'; }, 1500);
                break;
            }
            case 'copy': {
                navigator.clipboard.writeText(text).then(function () {
                    btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied';
                    setTimeout(function () { btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy'; }, 1500);
                });
                break;
            }
            case 'replace': {
                var start = markdownEditor.selectionStart;
                var end = markdownEditor.selectionEnd;
                if (start === end) {
                    handleAiAction('insert', text, btn);
                    return;
                }
                markdownEditor.value = markdownEditor.value.substring(0, start) + text + markdownEditor.value.substring(end);
                markdownEditor.dispatchEvent(new Event('input'));
                btn.innerHTML = '<i class="bi bi-check-lg"></i> Replaced';
                setTimeout(function () { btn.innerHTML = '<i class="bi bi-arrow-left-right"></i> Replace'; }, 1500);
                break;
            }
        }
    }

    function handleAiResponse(text, messageId) {
        _ai.isGenerating = false;
        if (aiSendBtn) aiSendBtn.disabled = false;
        addAiMessage(text, messageId);
    }

    function handleAiError(message, messageId) {
        _ai.isGenerating = false;
        if (aiSendBtn) aiSendBtn.disabled = false;
        removeTypingIndicator();

        var msg = document.createElement('div');
        msg.className = 'ai-message ai-message-ai';
        msg.innerHTML = '<span class="ai-msg-label">AI</span>\n' +
            '<div class="ai-msg-bubble" style="border-color: var(--color-danger-fg); color: var(--color-danger-fg);">\n' +
            '  <i class="bi bi-exclamation-triangle"></i> ' + escapeHtml(message) + '\n' +
            '</div>';
        aiChatArea.appendChild(msg);
        aiChatArea.scrollTop = aiChatArea.scrollHeight;
    }

    // --- Streaming Token Handling ---
    function handleStreamingToken(token, messageId) {
        var bubble = document.getElementById('ai-streaming-bubble-' + messageId);

        if (!bubble) {
            removeTypingIndicator();
            var welcome = aiChatArea.querySelector('.ai-welcome-message');
            if (welcome) welcome.remove();

            var msg = document.createElement('div');
            msg.className = 'ai-message ai-message-ai';
            msg.id = 'ai-streaming-msg-' + messageId;
            msg.innerHTML = '<span class="ai-msg-label">AI</span>\n' +
                '<div class="ai-msg-bubble" id="ai-streaming-bubble-' + messageId + '"></div>';
            aiChatArea.appendChild(msg);
            bubble = document.getElementById('ai-streaming-bubble-' + messageId);
        }

        if (!bubble._rawText) bubble._rawText = '';
        bubble._rawText += token;
        bubble.innerHTML = formatAiResponse(bubble._rawText);
        aiChatArea.scrollTop = aiChatArea.scrollHeight;
    }

    function handleGroqComplete(text, messageId) {
        _ai.isGenerating = false;
        if (aiSendBtn) aiSendBtn.disabled = false;
        _ai.streamingMessageId = null;

        var msgEl = document.getElementById('ai-streaming-msg-' + messageId);
        if (msgEl) {
            var bubble = document.getElementById('ai-streaming-bubble-' + messageId);
            if (bubble) {
                bubble.removeAttribute('id');
                bubble.innerHTML = formatAiResponse(text);
            }
            msgEl.removeAttribute('id');

            var actions = document.createElement('div');
            actions.className = 'ai-msg-actions';
            actions.innerHTML =
                '<button class="ai-msg-action-btn" data-action="insert" data-text="' + encodeURIComponent(text) + '" title="Insert into editor">\n' +
                '  <i class="bi bi-box-arrow-in-down"></i> Insert\n' +
                '</button>\n' +
                '<button class="ai-msg-action-btn" data-action="copy" data-text="' + encodeURIComponent(text) + '" title="Copy to clipboard">\n' +
                '  <i class="bi bi-clipboard"></i> Copy\n' +
                '</button>\n' +
                '<button class="ai-msg-action-btn" data-action="replace" data-text="' + encodeURIComponent(text) + '" title="Replace selected text">\n' +
                '  <i class="bi bi-arrow-left-right"></i> Replace\n' +
                '</button>';
            msgEl.appendChild(actions);

            actions.querySelectorAll('.ai-msg-action-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var action = this.dataset.action;
                    var rawText = decodeURIComponent(this.dataset.text);
                    handleAiAction(action, rawText, this);
                });
            });
        } else {
            removeTypingIndicator();
            addAiMessage(text, messageId);
        }
        aiChatArea.scrollTop = aiChatArea.scrollHeight;
    }

    // --- Replay pending message ---
    function replayPendingMessage() {
        var pending = _ai.pendingMessage;
        if (!pending) return;
        _ai.pendingMessage = null;
        _ai.sendToAi(pending.taskType, pending.context, pending.userPrompt);
    }

    // --- Chat Input ---
    aiInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    aiInput.addEventListener('input', function () {
        aiInput.style.height = 'auto';
        aiInput.style.height = Math.min(aiInput.scrollHeight, 120) + 'px';
    });

    aiSendBtn.addEventListener('click', sendChatMessage);

    function sendChatMessage() {
        var text = aiInput.value.trim();
        if (!text || _ai.isGenerating) return;

        aiInput.value = '';
        aiInput.style.height = 'auto';
        addUserMessage(text);

        // If current model is an image model, route to image generation
        var currentModelCfg = _ai.models[_ai.currentModel];
        if (currentModelCfg && currentModelCfg.isImageModel) {
            M.generateImage(text, _ai.selectedAspectRatio);
            return;
        }

        var editorContent = markdownEditor.value;
        var isQuestion = /^(what|who|where|when|why|how|is |are |do |does |can |could |would |should |explain|tell me|describe)/i.test(text);

        // Web search integration
        if (M.webSearch && M.webSearch.isSearchEnabled()) {
            var searchIndicator = document.createElement('div');
            searchIndicator.className = 'ai-search-indicator';
            searchIndicator.innerHTML = '<i class="bi bi-globe-americas"></i> Searching the web...';
            aiChatArea.appendChild(searchIndicator);
            aiChatArea.scrollTop = aiChatArea.scrollHeight;

            M.webSearch.performSearch(text).then(function (results) {
                var searchContext = M.webSearch.formatResultsForLLM(results);
                _lastSearchResults = results;

                var ind = aiChatArea.querySelector('.ai-search-indicator');
                if (ind) ind.remove();

                var context = searchContext;
                if (isQuestion && editorContent.trim()) {
                    context = searchContext + '\n\n[Document Content]\n' + editorContent;
                }

                _ai.sendToAi(isQuestion && editorContent.trim() ? 'qa' : 'generate', context || null, text);
            }).catch(function () {
                var ind = aiChatArea.querySelector('.ai-search-indicator');
                if (ind) ind.remove();
                if (isQuestion && editorContent.trim()) {
                    _ai.sendToAi('qa', editorContent, text);
                } else {
                    _ai.sendToAi('generate', null, text);
                }
            });
            return;
        }

        if (isQuestion && editorContent.trim()) {
            _ai.sendToAi('qa', editorContent, text);
        } else {
            _ai.sendToAi('generate', null, text);
        }
    }

    // --- Track editor selection ---
    var savedSelection = { start: 0, end: 0 };
    markdownEditor.addEventListener('select', function () {
        savedSelection = { start: markdownEditor.selectionStart, end: markdownEditor.selectionEnd };
    });
    markdownEditor.addEventListener('click', function () {
        savedSelection = { start: markdownEditor.selectionStart, end: markdownEditor.selectionEnd };
    });
    markdownEditor.addEventListener('keyup', function () {
        savedSelection = { start: markdownEditor.selectionStart, end: markdownEditor.selectionEnd };
    });

    // --- Smart Chunking ---
    function getSmartChunk(fullText, cursorPos) {
        if (!fullText.trim()) return '';
        var CHUNK_SIZE = 1500;
        if (fullText.length <= CHUNK_SIZE) return fullText;
        var start = Math.max(0, cursorPos - Math.floor(CHUNK_SIZE / 2));
        var end = Math.min(fullText.length, start + CHUNK_SIZE);
        if (start > 0) {
            var paraBreak = fullText.lastIndexOf('\n\n', start + 100);
            if (paraBreak > start - 200 && paraBreak > 0) start = paraBreak + 2;
        }
        if (end < fullText.length) {
            var paraBreak2 = fullText.indexOf('\n\n', end - 100);
            if (paraBreak2 > 0 && paraBreak2 < end + 200) end = paraBreak2;
        }
        return fullText.substring(start, end);
    }

    function splitIntoChunks(text, chunkSize) {
        chunkSize = chunkSize || 1500;
        if (text.length <= chunkSize) return [text];
        var chunks = [];
        var start = 0;
        while (start < text.length) {
            var end = Math.min(start + chunkSize, text.length);
            if (end < text.length) {
                var lastNewline = text.lastIndexOf('\n', end);
                if (lastNewline > start + chunkSize * 0.5) end = lastNewline + 1;
            }
            chunks.push(text.substring(start, end));
            start = end;
        }
        return chunks;
    }

    function processDocumentInChunks(action, fullText) {
        var chunks = splitIntoChunks(fullText);
        var total = chunks.length;
        var current = 0;
        var processedResults = [];

        var progressMsg = document.createElement('div');
        progressMsg.className = 'ai-message ai-message-ai';
        progressMsg.id = 'ai-chunk-progress';
        progressMsg.innerHTML = '<span class="ai-msg-label">AI</span>\n' +
            '<div class="ai-msg-bubble">\n' +
            '  <div class="ai-chunk-progress">\n' +
            '    <i class="bi bi-gear-wide-connected"></i>\n' +
            '    Processing document in ' + total + ' chunks...\n' +
            '    <div class="ai-chunk-bar"><div class="ai-chunk-fill" style="width: 0%"></div></div>\n' +
            '    <span class="ai-chunk-status">Chunk 1/' + total + '</span>\n' +
            '  </div>\n' +
            '</div>';
        aiChatArea.appendChild(progressMsg);
        aiChatArea.scrollTop = aiChatArea.scrollHeight;

        function processNextChunk() {
            if (current >= total) {
                // All done — combine results
                var combined = processedResults.join('\n\n');
                var prog = document.getElementById('ai-chunk-progress');
                if (prog) prog.remove();
                addAiMessage(combined);
                return;
            }

            var chunk = chunks[current];
            var statusEl = progressMsg.querySelector('.ai-chunk-status');
            var fillEl = progressMsg.querySelector('.ai-chunk-fill');
            if (statusEl) statusEl.textContent = 'Chunk ' + (current + 1) + '/' + total;
            if (fillEl) fillEl.style.width = Math.round((current / total) * 100) + '%';

            var worker = _ai.getActiveWorker();
            if (!worker || !_ai.isCurrentModelReady()) {
                var prog2 = document.getElementById('ai-chunk-progress');
                if (prog2) prog2.remove();
                handleAiError('Model not ready during chunk processing.', null);
                return;
            }

            _ai.isGenerating = true;
            if (aiSendBtn) aiSendBtn.disabled = true;
            _ai.messageIdCounter = _ai.messageIdCounter + 1;
            var messageId = _ai.messageIdCounter;

            function chunkHandler(e) {
                var msg = e.data;
                if (msg.messageId !== messageId) return;

                if (msg.type === 'complete' || msg.type === 'token') {
                    if (msg.type === 'complete') {
                        worker.removeEventListener('message', chunkHandler);
                        _ai.isGenerating = false;
                        if (aiSendBtn) aiSendBtn.disabled = false;
                        processedResults.push(msg.text);
                        current++;
                        processNextChunk();
                    }
                } else if (msg.type === 'error') {
                    worker.removeEventListener('message', chunkHandler);
                    _ai.isGenerating = false;
                    if (aiSendBtn) aiSendBtn.disabled = false;
                    var prog3 = document.getElementById('ai-chunk-progress');
                    if (prog3) prog3.remove();
                    handleAiError(msg.message || 'Chunk processing failed.', messageId);
                }
            }

            worker.addEventListener('message', chunkHandler);
            worker.postMessage({
                type: 'generate',
                taskType: action,
                context: chunk,
                userPrompt: null,
                messageId: messageId,
                enableThinking: false
            });
        }

        processNextChunk();
    }

    // --- Clear Chat ---
    if (aiClearChatBtn) {
        aiClearChatBtn.addEventListener('click', function () {
            aiChatArea.innerHTML =
                '<div class="ai-welcome-message">\n' +
                '  <div class="ai-welcome-icon"><i class="bi bi-stars"></i></div>\n' +
                '  <h5>AI Assistant</h5>\n' +
                '  <p>Switch models below · Local or Cloud</p>\n' +
                '  <div class="ai-welcome-tips">\n' +
                '    <div class="ai-tip"><i class="bi bi-cursor-text"></i> Select text + use quick actions</div>\n' +
                '    <div class="ai-tip"><i class="bi bi-chat-dots"></i> Ask questions about your document</div>\n' +
                '    <div class="ai-tip"><i class="bi bi-keyboard"></i> <kbd>Ctrl</kbd>+<kbd>Space</kbd> for auto-complete</div>\n' +
                '  </div>\n' +
                '</div>';
        });
    }

    // --- Web Search Toggle & Provider Selector ---
    (function initSearchUI() {
        var searchToggle = document.getElementById('ai-search-toggle');
        var providerBar = document.getElementById('ai-search-provider-bar');
        var providerSelect = document.getElementById('ai-search-provider-select');
        var keyBtn = document.getElementById('ai-search-key-btn');
        if (!searchToggle || !M.webSearch) return;

        searchToggle.checked = M.webSearch.isSearchEnabled();
        if (searchToggle.checked && providerBar) providerBar.style.display = '';
        if (providerSelect) providerSelect.value = M.webSearch.getActiveProvider();
        updateKeyBtnVisibility();

        searchToggle.addEventListener('change', function () {
            M.webSearch.setSearchEnabled(searchToggle.checked);
            if (providerBar) providerBar.style.display = searchToggle.checked ? '' : 'none';
        });

        if (providerSelect) {
            providerSelect.addEventListener('change', function () {
                M.webSearch.setActiveProvider(providerSelect.value);
                updateKeyBtnVisibility();
            });
        }

        function updateKeyBtnVisibility() {
            if (!keyBtn) return;
            var p = M.webSearch.PROVIDERS[M.webSearch.getActiveProvider()];
            keyBtn.style.display = (p && p.requiresKey) ? '' : 'none';
        }

        if (keyBtn) {
            keyBtn.addEventListener('click', function () {
                var providerId = M.webSearch.getActiveProvider();
                var p = M.webSearch.PROVIDERS[providerId];
                if (!p || !p.requiresKey) return;

                var modal = document.getElementById('ai-apikey-modal');
                var titleEl = document.getElementById('ai-apikey-title');
                var descEl = document.getElementById('ai-apikey-desc');
                var inputEl = document.getElementById('ai-groq-key-input');
                var linkEl = document.getElementById('ai-apikey-link');
                var iconEl = document.getElementById('ai-apikey-icon');
                var errorEl = document.getElementById('ai-apikey-error');

                if (modal && titleEl && inputEl) {
                    titleEl.textContent = p.dialogTitle || 'API Key';
                    if (descEl) descEl.textContent = p.dialogDesc || 'Enter your API key';
                    if (iconEl) iconEl.className = p.icon || 'bi bi-key';
                    if (linkEl) {
                        linkEl.href = p.dialogLink || '#';
                        linkEl.textContent = p.dialogLinkText || 'Get API key';
                    }
                    inputEl.value = M.webSearch.getProviderKey(providerId);
                    inputEl.placeholder = p.dialogPlaceholder || 'API key...';
                    if (errorEl) errorEl.style.display = 'none';
                    modal.style.display = 'flex';

                    var saveBtn = document.getElementById('ai-apikey-save');
                    var cancelBtn = document.getElementById('ai-apikey-cancel');
                    var onSave = function () {
                        M.webSearch.setProviderKey(providerId, inputEl.value.trim());
                        modal.style.display = 'none';
                        cleanup();
                    };
                    var onCancel = function () {
                        modal.style.display = 'none';
                        cleanup();
                    };
                    function cleanup() {
                        saveBtn.removeEventListener('click', onSave);
                        cancelBtn.removeEventListener('click', onCancel);
                    }
                    saveBtn.addEventListener('click', onSave, { once: true });
                    cancelBtn.addEventListener('click', onCancel, { once: true });
                }
            });
        }
    })();

    // --- Register on M._ai for cross-module access ---
    _ai.escapeHtml = escapeHtml;
    _ai.formatAiResponse = formatAiResponse;
    _ai.addUserMessage = addUserMessage;
    _ai.addTypingIndicator = addTypingIndicator;
    _ai.removeTypingIndicator = removeTypingIndicator;
    _ai.addAiMessage = addAiMessage;
    _ai.handleAiAction = handleAiAction;
    _ai.handleAiResponse = handleAiResponse;
    _ai.handleAiError = handleAiError;
    _ai.handleStreamingToken = handleStreamingToken;
    _ai.handleGroqComplete = handleGroqComplete;
    _ai.replayPendingMessage = replayPendingMessage;
    _ai.processDocumentInChunks = processDocumentInChunks;
    _ai.sendChatMessage = sendChatMessage;
    Object.defineProperty(_ai, 'savedSelection', {
        get: function () { return savedSelection; },
        set: function (v) { savedSelection = v; }
    });

})(window.MDView);
