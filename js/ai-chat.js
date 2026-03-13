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
    var aiAttachBtn = document.getElementById('ai-attach-btn');
    var aiFileInput = document.getElementById('ai-file-input');
    var aiAttachmentsStrip = document.getElementById('ai-attachments-strip');

    // --- File Attachment State ---
    var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    var MAX_ATTACHMENTS = 5;
    var pendingAttachments = []; // Array of { file, type: 'image'|'file', dataUrl, mimeType, name }

    // --- Conversation Memory ---
    // Tracks {role:'user'|'assistant', content:string} pairs for multi-turn context.
    // Capped at MAX_HISTORY_TURNS recent turns (user+assistant = 2 messages per turn).
    var MAX_HISTORY_TURNS = 10;
    var chatHistory = [];

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

    // Strip thinking/reasoning artifacts from AI responses
    function cleanThinkingArtifacts(text) {
        if (!text) return text;

        // 1. Remove <think>...</think>, <thinking>...</thinking>, <thought>...</thought> blocks
        text = text.replace(/<(?:think|thinking|thought)>[\s\S]*?<\/(?:think|thinking|thought)>/gi, '');

        // 1b. Remove unclosed <think> blocks (model still streaming or forgot to close)
        text = text.replace(/<(?:think|thinking|thought)>[\s\S]*$/gi, '');

        // 1c. Remove orphaned closing tags + all content before them
        // (opener was already stripped in previous stream chunk, content before tag is thinking residue)
        // Use indexOf to avoid catastrophic regex backtracking
        var closeTagMatch = text.match(/<\/(?:think|thinking|thought)>/i);
        if (closeTagMatch) {
            text = text.substring(text.indexOf(closeTagMatch[0]) + closeTagMatch[0].length);
        }

        // 2. Remove reasoning header blocks (content up to next heading)
        var reasoningHeaders = [
            /^[\s\S]*?(?:Thinking Process|Analyze the Request|Drafting the Content|Analysis|My Approach):[\s\S]*?(?=\n#{1,6}\s)/m,
        ];
        for (var i = 0; i < reasoningHeaders.length; i++) {
            text = text.replace(reasoningHeaders[i], '');
        }

        // 3. Remove italicized meta-commentary lines
        text = text.replace(/^\s*\*(?:mental note|double-check|planning|imagines|checks|biggest worry|checks mental|planning tone|thinks|notices|decides|last thought)[^*]*\*\s*$/gim, '');

        // 4. Remove multi-line reasoning blocks:
        //    Lines starting with internal-monologue patterns — these are chain-of-thought
        var lines = text.split('\n');
        var cleaned = [];
        var inReasoningBlock = false;
        var reasoningStartPatterns = /^\s*(?:Let me (?:analyze|check|think|consider|look|first|start|review|clarify|see|also)|I (?:should|need to|must|can see|see |notice|remember|'ll |will |can |want to )|I'(?:ll|m|ve|d) (?:provide|explain|start|give|break|cover|structure|outline|keep|now|also|include|note|mention|use|add|format|write|create|make|summarize|describe|present|walk|help)|Actually,|Hmm,?|Wait,|Okay,? (?:so|let|I |the user|structuring|planning|right)|The (?:user |context |instructions? |question )|First,? I|But (?:this is|wait|the)|Since (?:they|the|I)|So (?:the|I should|let me)|Oh right!|Did I |Will do:|If they|Must (?:stress|clarify|mention)|Should (?:I |start|mention)|- (?:Don't |Should |Must |Better |Add |End |Keep )|thinks about|notices |decides on|double-checks|last thought)/i;
        var contentPatterns = /^\s*(?:#{1,6}\s|[-*+]\s(?!Don't |Should |Must |Better )|\d+\.\s|>\s|\||\$\$|```|!\[|<[a-z]|The Black|##|In |A |An |\*\*)/;

        for (var j = 0; j < lines.length; j++) {
            var line = lines[j];
            var trimmedLine = line.trim();

            // Skip empty lines during reasoning blocks
            if (inReasoningBlock && trimmedLine === '') {
                continue;
            }

            // Detect reasoning start
            if (reasoningStartPatterns.test(trimmedLine) && !contentPatterns.test(trimmedLine)) {
                inReasoningBlock = true;
                continue;
            }

            // Exit reasoning block when we hit real content (heading, list, bold start, etc.)
            if (inReasoningBlock) {
                if (contentPatterns.test(trimmedLine) || /^\*\*[^*]+\*\*/.test(trimmedLine)) {
                    inReasoningBlock = false;
                    cleaned.push(line);
                }
                // Otherwise skip the line (still in reasoning)
                continue;
            }

            cleaned.push(line);
        }

        // 4b. Strip trailing reasoning/planning outlines from end of response
        // These are planning lists or reasoning sentences that appear after the main content
        while (cleaned.length > 0) {
            var lastLine = cleaned[cleaned.length - 1].trim();
            if (lastLine === '') {
                cleaned.pop();
                continue;
            }
            // Trailing reasoning indicators: planning outlines, incomplete sentences, meta-commentary
            if (/^(?:\d+\.\s*$|\d+\.\s*(?:What |How |Why |The |Its |Key |Basic |Practical |Brief )|I'(?:ll|m|ve|d) |I (?:should|need to|will|can|want|'ll )|(?:Let me|Based on|In this|From this|Here'?s|The document|This (?:is |covers|explains|includes|provides))\s)/i.test(lastLine)) {
                cleaned.pop();
                continue;
            }
            break;
        }

        text = cleaned.join('\n');

        // 5. Collapse excessive blank lines left after stripping
        text = text.replace(/\n{3,}/g, '\n\n');
        return text.trim();
    }

    // --- Chat Messages ---
    function addUserMessage(text, attachments) {
        var welcome = aiChatArea.querySelector('.ai-welcome-message');
        if (welcome) welcome.remove();

        var attachHtml = '';
        if (attachments && attachments.length > 0) {
            attachHtml = '<div class="ai-msg-attachments">';
            attachments.forEach(function (att) {
                if (att.type === 'image') {
                    attachHtml += '<img src="' + att.dataUrl + '" alt="' + escapeHtml(att.name) + '" />';
                } else {
                    attachHtml += '<span class="ai-msg-attach-file"><i class="bi bi-file-earmark-text"></i> ' + escapeHtml(att.name) + '</span>';
                }
            });
            attachHtml += '</div>';
        }

        var msg = document.createElement('div');
        msg.className = 'ai-message ai-message-user';
        msg.innerHTML = '<span class="ai-msg-label">You</span>\n<div class="ai-msg-bubble">' + attachHtml + escapeHtml(text) + '</div>';
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
    var _lastSearchQuery = null;

    /**
     * Create a collapsible "Thinking" block in the chat area.
     * Shows an animated "Searching…" state immediately, then gets populated with results.
     * Returns the block element so the caller can update it later.
     */
    function createSearchThinkingBlock(query) {
        var queryLabel = query ? escapeHtml(query) : 'web';
        var block = document.createElement('div');
        block.className = 'ai-thinking-block';
        block.id = 'ai-thinking-block-active';
        block.innerHTML =
            '<details class="ai-search-details" open>' +
            '<summary><i class="bi bi-globe-americas ai-thinking-spin"></i> Searching: ' + queryLabel +
            ' <span class="ai-search-count">…</span></summary>' +
            '<div class="ai-search-results-list"><div class="ai-thinking-searching">' +
            '<i class="bi bi-arrow-clockwise ai-thinking-spin"></i> Searching the web…</div></div>' +
            '</details>';
        aiChatArea.appendChild(block);
        aiChatArea.scrollTop = aiChatArea.scrollHeight;
        return block;
    }

    /**
     * Update the thinking block with actual search results (or a "no results" message).
     */
    function populateSearchThinkingBlock(results, query) {
        var block = document.getElementById('ai-thinking-block-active');
        if (!block) return;
        block.removeAttribute('id');

        var queryLabel = query ? escapeHtml(query) : 'web';
        var count = results ? results.length : 0;

        var detailsInner = '';
        if (count > 0) {
            results.forEach(function (r) {
                var domain = '';
                try { domain = new URL(r.url).hostname.replace('www.', ''); } catch (_) { domain = r.url; }
                detailsInner += '<div class="ai-search-result-item">' +
                    '<div class="ai-search-result-title">' +
                    '<a href="' + escapeHtml(r.url) + '" target="_blank" rel="noopener">' + escapeHtml(r.title || domain) + '</a>' +
                    '</div>' +
                    (r.snippet ? '<div class="ai-search-result-snippet">' + escapeHtml(r.snippet).substring(0, 200) + '</div>' : '') +
                    '<div class="ai-search-result-url">' + escapeHtml(domain) + '</div>' +
                    '</div>';
            });
        } else {
            detailsInner = '<div class="ai-thinking-no-results"><i class="bi bi-info-circle"></i> No search results found — answering from model knowledge.</div>';
        }

        // Source pills
        var pillsHtml = '';
        if (count > 0) {
            pillsHtml = '<div class="ai-source-citations">';
            var seen = new Set();
            results.forEach(function (r) {
                try {
                    var domain = new URL(r.url).hostname.replace('www.', '');
                    if (!seen.has(domain)) {
                        seen.add(domain);
                        pillsHtml += '<a class="ai-source-link" href="' + r.url + '" target="_blank" rel="noopener">' +
                            '<i class="bi bi-link-45deg"></i>' + domain + '</a>';
                    }
                } catch (_) { /* invalid url */ }
            });
            pillsHtml += '</div>';
        }

        block.innerHTML =
            '<details class="ai-search-details">' +
            '<summary><i class="bi bi-globe-americas"></i> Search: ' + queryLabel +
            ' <span class="ai-search-count">' + count + ' result' + (count !== 1 ? 's' : '') + '</span></summary>' +
            '<div class="ai-search-results-list">' + detailsInner + '</div>' +
            '</details>' +
            pillsHtml;
    }

    function addAiMessage(text, messageId) {
        removeTypingIndicator();
        var searchInd = aiChatArea.querySelector('.ai-search-indicator');
        if (searchInd) searchInd.remove();
        var welcome = aiChatArea.querySelector('.ai-welcome-message');
        if (welcome) welcome.remove();

        var msg = document.createElement('div');
        msg.className = 'ai-message ai-message-ai';

        var formattedText = formatAiResponse(cleanThinkingArtifacts(text));

        // Search details are now rendered in the thinking block above — no inline citations needed

        msg.innerHTML = '<span class="ai-msg-label">AI</span>\n' +
            '<div class="ai-msg-bubble">' + formattedText + '</div>\n' +
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
        // Record assistant reply in conversation history
        pushHistory('assistant', text);
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
        bubble.innerHTML = formatAiResponse(cleanThinkingArtifacts(bubble._rawText));
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
                bubble.innerHTML = formatAiResponse(cleanThinkingArtifacts(text));
            }
            msgEl.removeAttribute('id');

            // Search details are now rendered in the thinking block above — no inline duplication needed

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
        // Record assistant reply in conversation history
        pushHistory('assistant', text);
        aiChatArea.scrollTop = aiChatArea.scrollHeight;
    }

    // --- Replay pending message ---
    function replayPendingMessage() {
        var pending = _ai.pendingMessage;
        if (!pending) return;
        _ai.pendingMessage = null;
        _ai.sendToAi(pending.taskType, pending.context, pending.userPrompt, pending.attachments, pending.chatHistory);
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

    // --- Conversation History Helpers ---
    function pushHistory(role, content) {
        chatHistory.push({ role: role, content: content });
        // Cap at MAX_HISTORY_TURNS turns (each turn = user + assistant = 2 messages)
        while (chatHistory.length > MAX_HISTORY_TURNS * 2) {
            chatHistory.shift();
        }
    }

    /**
     * Build a context-aware search query for follow-up questions.
     * Uses the LLM to rewrite the query into a self-contained search query
     * when conversation history is available and the model is ready.
     * Falls back to keyword-extraction heuristic if the model is busy/unavailable.
     *
     * @param {string} rawText - The user's raw follow-up question
     * @returns {Promise<string>} The refined search query
     */
    function refineSearchQuery(rawText) {
        // No history → use the raw query as-is (first message)
        if (chatHistory.length === 0) return Promise.resolve(rawText);

        // Build a conversation summary for the LLM to understand context
        var recentMsgs = chatHistory.slice(-4);
        var conversationContext = recentMsgs.map(function (m) {
            return (m.role === 'user' ? 'User' : 'AI') + ': ' + m.content.substring(0, 200);
        }).join('\n');

        // If the model is ready and not generating, use it to refine the query
        if (M.isCurrentModelReady && M.isCurrentModelReady() && !M.isAiGenerating()) {
            var refinePrompt =
                'Given this conversation:\n' + conversationContext +
                '\n\nThe user now asks: "' + rawText + '"' +
                '\n\nRewrite this as a single, self-contained web search query that includes the specific topic/entity from the conversation. ' +
                'Output ONLY the search query text, nothing else. Keep it under 10 words.';

            return M.requestAiTask({
                taskType: 'generate',
                context: null,
                userPrompt: refinePrompt,
                enableThinking: false,
                silent: true
            }).then(function (refined) {
                // Clean up: strip quotes, thinking artifacts, extra whitespace
                var cleaned = refined.replace(/^["'\s]+|["'\s]+$/g, '').trim();
                // Sanity check: if the model returned gibberish or too-long text, fall back
                if (cleaned.length < 3 || cleaned.length > 150 || cleaned.split('\n').length > 2) {
                    return fallbackQueryEnrichment(rawText, recentMsgs);
                }
                console.log('[AI Chat] Refined search query:', cleaned);
                return cleaned;
            }).catch(function () {
                return fallbackQueryEnrichment(rawText, recentMsgs);
            });
        }

        // Fallback: keyword-based enrichment (model not ready)
        return Promise.resolve(fallbackQueryEnrichment(rawText, recentMsgs));
    }

    /**
     * Fallback: extract key nouns/entities from recent messages and prepend to query.
     */
    function fallbackQueryEnrichment(rawText, recentMsgs) {
        // Extract likely topic keywords from the first user message and assistant reply
        var topicWords = [];
        recentMsgs.forEach(function (m) {
            // Grab capitalized words (likely proper nouns/entities)
            var caps = m.content.match(/\b[A-Z][a-z]{2,}\b/g);
            if (caps) topicWords = topicWords.concat(caps);
        });
        // Deduplicate and take top 3
        var unique = [];
        var seen = {};
        topicWords.forEach(function (w) {
            var lw = w.toLowerCase();
            if (!seen[lw] && lw !== 'the' && lw !== 'this' && lw !== 'that') {
                seen[lw] = true;
                unique.push(w);
            }
        });
        var prefix = unique.slice(0, 3).join(' ');
        return prefix ? (prefix + ' ' + rawText) : rawText;
    }

    function sendChatMessage() {
        var text = aiInput.value.trim();
        var attachments = pendingAttachments.slice(); // snapshot
        if ((!text && attachments.length === 0) || _ai.isGenerating) return;

        aiInput.value = '';
        aiInput.style.height = 'auto';
        clearAttachments();
        addUserMessage(text || '(file attached)', attachments);

        // Record user message in conversation history
        pushHistory('user', text || '(file attached)');

        // If current model is an image model, route to image generation
        var currentModelCfg = _ai.models[_ai.currentModel];
        if (currentModelCfg && currentModelCfg.isImageModel) {
            M.generateImage(text, _ai.selectedAspectRatio);
            return;
        }

        // Build attachment data for workers: { type, mimeType, data (base64 without prefix), name }
        var workerAttachments = attachments.map(function (att) {
            // Strip data URL prefix to get raw base64
            var base64 = att.dataUrl.split(',')[1] || '';
            return { type: att.type, mimeType: att.mimeType, data: base64, name: att.name, textContent: att.textContent || null };
        });

        // Snapshot of history to pass to the worker (exclude the just-pushed user msg)
        var historySnapshot = chatHistory.slice(0, -1);

        var editorContent = markdownEditor.value;
        var isQuestion = /^(what|who|where|when|why|how|is |are |do |does |can |could |would |should |explain|tell me|describe)/i.test(text);

        // Web search integration
        if (M.webSearch && M.webSearch.isSearchEnabled()) {
            // Show the thinking block immediately with a "Searching…" spinner
            createSearchThinkingBlock(text);

            // Refine the search query using the LLM (async — may use the model)
            refineSearchQuery(text).then(function (searchQuery) {
                return M.webSearch.performSearch(searchQuery).then(function (results) {
                    var searchContext = M.webSearch.formatResultsForLLM(results);

                    // Populate the thinking block with actual results (or "no results" msg)
                    populateSearchThinkingBlock(results, text);

                    var context = searchContext;
                    if (editorContent.trim()) {
                        context = searchContext + '\n\n[Document Content]\n' + editorContent;
                    }

                    _ai.sendToAi(editorContent.trim() ? 'qa' : 'generate', context || null, text, workerAttachments, historySnapshot);
                });
            }).catch(function (err) {
                // Populate thinking block with "no results" state
                populateSearchThinkingBlock([], text);

                if (isQuestion && editorContent.trim()) {
                    _ai.sendToAi('qa', editorContent, text, workerAttachments, historySnapshot);
                } else {
                    _ai.sendToAi('generate', null, text, workerAttachments, historySnapshot);
                }
            });
            return;
        }

        if (isQuestion && editorContent.trim()) {
            _ai.sendToAi('qa', editorContent, text, workerAttachments, historySnapshot);
        } else {
            _ai.sendToAi('generate', null, text, workerAttachments, historySnapshot);
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
            // Clear conversation history so follow-up context resets
            chatHistory = [];
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

    // ========================================
    // FILE ATTACHMENT HANDLING
    // ========================================

    function isImageMime(mime) {
        return /^image\/(png|jpe?g|gif|webp|svg\+xml|bmp)$/i.test(mime);
    }

    function getFileIcon(name) {
        var ext = (name.split('.').pop() || '').toLowerCase();
        var icons = {
            pdf: 'bi-file-earmark-pdf', json: 'bi-filetype-json', csv: 'bi-filetype-csv',
            xml: 'bi-filetype-xml', html: 'bi-filetype-html', css: 'bi-filetype-css',
            js: 'bi-filetype-js', ts: 'bi-filetype-tsx', py: 'bi-filetype-py',
            md: 'bi-filetype-md', yaml: 'bi-filetype-yml', yml: 'bi-filetype-yml',
            txt: 'bi-file-earmark-text', log: 'bi-file-earmark-text'
        };
        return icons[ext] || 'bi-file-earmark';
    }

    function addFilesToPending(files) {
        for (var i = 0; i < files.length; i++) {
            if (pendingAttachments.length >= MAX_ATTACHMENTS) {
                _ai.handleAiError('Maximum ' + MAX_ATTACHMENTS + ' attachments allowed.', null);
                break;
            }
            var file = files[i];
            if (file.size > MAX_FILE_SIZE) {
                _ai.handleAiError('File "' + file.name + '" exceeds 10 MB limit.', null);
                continue;
            }
            (function (f) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var isImg = isImageMime(f.type);
                    var att = {
                        file: f,
                        type: isImg ? 'image' : 'file',
                        dataUrl: e.target.result,
                        mimeType: f.type || 'application/octet-stream',
                        name: f.name,
                        textContent: null
                    };
                    // For text-based files, also read as text for local models
                    if (!isImg) {
                        var textReader = new FileReader();
                        textReader.onload = function (te) {
                            att.textContent = te.target.result;
                            pendingAttachments.push(att);
                            renderAttachmentsStrip();
                        };
                        textReader.readAsText(f);
                    } else {
                        pendingAttachments.push(att);
                        renderAttachmentsStrip();
                    }
                };
                reader.readAsDataURL(f);
            })(file);
        }
    }

    function removeAttachment(index) {
        pendingAttachments.splice(index, 1);
        renderAttachmentsStrip();
    }

    function clearAttachments() {
        pendingAttachments = [];
        if (aiAttachmentsStrip) {
            aiAttachmentsStrip.innerHTML = '';
            aiAttachmentsStrip.style.display = 'none';
        }
        if (aiFileInput) aiFileInput.value = '';
    }

    function renderAttachmentsStrip() {
        if (!aiAttachmentsStrip) return;
        if (pendingAttachments.length === 0) {
            aiAttachmentsStrip.innerHTML = '';
            aiAttachmentsStrip.style.display = 'none';
            return;
        }
        aiAttachmentsStrip.style.display = 'flex';
        aiAttachmentsStrip.innerHTML = '';
        pendingAttachments.forEach(function (att, idx) {
            if (att.type === 'image') {
                var thumb = document.createElement('div');
                thumb.className = 'ai-attach-thumb';
                thumb.innerHTML = '<img src="' + att.dataUrl + '" alt="' + escapeHtml(att.name) + '" />' +
                    '<button class="ai-attach-remove" title="Remove" data-idx="' + idx + '"><i class="bi bi-x"></i></button>';
                aiAttachmentsStrip.appendChild(thumb);
            } else {
                var chip = document.createElement('div');
                chip.className = 'ai-attach-file-chip';
                chip.innerHTML = '<i class="bi ' + getFileIcon(att.name) + '"></i>' +
                    '<span class="ai-attach-filename">' + escapeHtml(att.name) + '</span>' +
                    '<button class="ai-attach-remove" title="Remove" data-idx="' + idx + '"><i class="bi bi-x"></i></button>';
                aiAttachmentsStrip.appendChild(chip);
            }
        });
        // Wire remove buttons
        aiAttachmentsStrip.querySelectorAll('.ai-attach-remove').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                removeAttachment(parseInt(this.dataset.idx, 10));
            });
        });
    }

    // --- Attach Button ---
    if (aiAttachBtn && aiFileInput) {
        aiAttachBtn.addEventListener('click', function () {
            aiFileInput.click();
        });
        aiFileInput.addEventListener('change', function () {
            if (aiFileInput.files && aiFileInput.files.length > 0) {
                addFilesToPending(aiFileInput.files);
                aiFileInput.value = ''; // reset so same file can be re-selected
            }
        });
    }

    // --- Drag & Drop on chat area ---
    if (aiChatArea) {
        aiChatArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
            aiChatArea.classList.add('ai-drag-over');
        });
        aiChatArea.addEventListener('dragleave', function (e) {
            e.preventDefault();
            e.stopPropagation();
            aiChatArea.classList.remove('ai-drag-over');
        });
        aiChatArea.addEventListener('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
            aiChatArea.classList.remove('ai-drag-over');
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                addFilesToPending(e.dataTransfer.files);
            }
        });
    }

    // --- Clipboard Paste (images) ---
    if (aiInput) {
        aiInput.addEventListener('paste', function (e) {
            var items = e.clipboardData && e.clipboardData.items;
            if (!items) return;
            var imageFiles = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image/') === 0) {
                    var blob = items[i].getAsFile();
                    if (blob) imageFiles.push(blob);
                }
            }
            if (imageFiles.length > 0) {
                e.preventDefault();
                addFilesToPending(imageFiles);
            }
        });
    }

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
    _ai.addFilesToPending = addFilesToPending;
    _ai.clearAttachments = clearAttachments;
    Object.defineProperty(_ai, 'savedSelection', {
        get: function () { return savedSelection; },
        set: function (v) { savedSelection = v; }
    });
    Object.defineProperty(_ai, 'pendingAttachments', {
        get: function () { return pendingAttachments; }
    });

})(window.MDView);
