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
        removeTypingIndicator(); // Prevent duplicates (e.g. tool calling Pass 1 → Pass 2)
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
    function createSearchThinkingBlock(query, isRewriting) {
        var queryLabel = query ? escapeHtml(query) : 'web';
        var block = document.createElement('div');
        block.className = 'ai-thinking-block';
        block.id = 'ai-thinking-block-active';

        var statusIcon = isRewriting ? 'bi-stars' : 'bi-globe-americas';
        var statusText = isRewriting ? '✨ Rewriting query…' : 'Searching the web…';
        var headerText = isRewriting
            ? '<i class="bi bi-stars ai-thinking-spin"></i> Rewriting: ' + queryLabel
            : '<i class="bi bi-globe-americas ai-thinking-spin"></i> Searching: ' + queryLabel;

        block.innerHTML =
            '<details class="ai-search-details" open>' +
            '<summary>' + headerText +
            ' <span class="ai-search-count">…</span></summary>' +
            '<div class="ai-search-results-list"><div class="ai-thinking-searching">' +
            '<i class="bi bi-arrow-clockwise ai-thinking-spin"></i> ' + statusText + '</div></div>' +
            '</details>';
        aiChatArea.appendChild(block);
        aiChatArea.scrollTop = aiChatArea.scrollHeight;
        return block;
    }

    /**
     * Update the thinking block's summary to show a rewritten search query.
     * Called after refineSearchQuery() resolves with a different query.
     */
    function updateThinkingBlockQuery(rewrittenQuery) {
        var block = document.getElementById('ai-thinking-block-active');
        if (!block) return;

        // Update summary to show searching with rewritten query
        var summary = block.querySelector('summary');
        if (summary) {
            var queryLabel = escapeHtml(rewrittenQuery);
            summary.innerHTML =
                '<i class="bi bi-globe-americas ai-thinking-spin"></i> Searching: ' + queryLabel +
                ' <span class="ai-search-rewritten">(rewritten)</span>' +
                ' <span class="ai-search-count">…</span>';
        }

        // Update inner status text from "Rewriting" to "Searching"
        var statusDiv = block.querySelector('.ai-thinking-searching');
        if (statusDiv) {
            statusDiv.innerHTML = '<i class="bi bi-arrow-clockwise ai-thinking-spin"></i> Searching the web…';
        }
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
                var sourceBadge = r.source ? '<span class="ai-search-result-source">' + escapeHtml(r.source) + '</span>' : '';
                detailsInner += '<div class="ai-search-result-item">' +
                    '<div class="ai-search-result-title">' +
                    '<a href="' + escapeHtml(r.url) + '" target="_blank" rel="noopener">' + escapeHtml(r.title || domain) + '</a>' +
                    sourceBadge +
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
        if (M.pretextResize) { M.pretextResize(aiInput, 120); return; }
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
     * Rewrite a search query for better web search results.
     * Works for BOTH first messages and follow-ups:
     * - First messages: strips conversational fluff, extracts key search terms
     * - Follow-ups: adds conversation context to make query self-contained
     * Uses LLM when available, falls back to heuristic keyword extraction.
     *
     * @param {string} rawText - The user's raw question
     * @returns {Promise<string>} The optimized search query
     */
    function refineSearchQuery(rawText) {
        var hasHistory = chatHistory.length > 0;
        var recentMsgs = hasHistory ? chatHistory.slice(-4) : [];

        // If the model is ready and not generating, use LLM to rewrite
        if (M.isCurrentModelReady && M.isCurrentModelReady() && !M.isAiGenerating()) {
            var refinePrompt;

            if (hasHistory) {
                // Follow-up: include conversation context
                var conversationContext = recentMsgs.map(function (m) {
                    return (m.role === 'user' ? 'User' : 'AI') + ': ' + m.content.substring(0, 200);
                }).join('\n');

                refinePrompt =
                    'Given this conversation:\n' + conversationContext +
                    '\n\nThe user now asks: "' + rawText + '"' +
                    '\n\nRewrite this as a single, self-contained web search query that includes the specific topic/entity from the conversation. ' +
                    'Remove conversational fluff. Output ONLY the search query, nothing else. Keep it under 10 words.';
            } else {
                // First message: optimize for search
                refinePrompt =
                    'Rewrite this user question as a concise web search query.\n' +
                    'Remove filler words like "what is", "can you", "tell me about", "please explain".\n' +
                    'Keep technical terms, proper nouns, and specific keywords.\n' +
                    'Output ONLY the search query, nothing else. Keep it under 10 words.\n\n' +
                    'User question: "' + rawText + '"';
            }

            return M.requestAiTask({
                taskType: 'generate',
                context: null,
                userPrompt: refinePrompt,
                enableThinking: false,
                silent: true
            }).then(function (refined) {
                // Clean up: strip quotes, thinking artifacts, extra whitespace
                var cleaned = refined.replace(/^["'\s]+|["'\s]+$/g, '').trim();
                // Remove common LLM chattiness
                cleaned = cleaned.replace(/^(?:search query:|here is|here's|query:)\s*/i, '').trim();
                // Sanity check: if the model returned gibberish or too-long text, fall back
                if (cleaned.length < 3 || cleaned.length > 150 || cleaned.split('\n').length > 2) {
                    return hasHistory
                        ? fallbackQueryEnrichment(rawText, recentMsgs)
                        : heuristicQueryOptimize(rawText);
                }
                console.log('[AI Chat] Rewritten search query:', JSON.stringify(rawText), '→', JSON.stringify(cleaned));
                return cleaned;
            }).catch(function () {
                return hasHistory
                    ? fallbackQueryEnrichment(rawText, recentMsgs)
                    : heuristicQueryOptimize(rawText);
            });
        }

        // Fallback: heuristic optimization (model not ready)
        if (hasHistory) {
            return Promise.resolve(fallbackQueryEnrichment(rawText, recentMsgs));
        }
        return Promise.resolve(heuristicQueryOptimize(rawText));
    }

    /**
     * Heuristic query optimizer for first messages (no LLM needed).
     * Strips conversational fluff, extracts key search terms.
     */
    function heuristicQueryOptimize(rawText) {
        var query = rawText;

        // 1. Preserve quoted phrases (user explicitly wants these)
        var quotedPhrases = [];
        query = query.replace(/"([^"]+)"/g, function (_, phrase) {
            quotedPhrases.push(phrase);
            return '';
        });

        // 2. Strip common conversational prefixes
        var prefixPatterns = [
            /^(?:what (?:is|are|was|were|does|do|did)\s+)/i,
            /^(?:who (?:is|are|was|were)\s+)/i,
            /^(?:how (?:to|do|does|can|could|would|should|is|are)\s+)/i,
            /^(?:can you|could you|would you|please|tell me|explain|describe|show me|help me)\s+(?:(?:about|with|how|what|the)\s+)?/i,
            /^(?:i (?:want|need|would like) to (?:know|understand|learn|find out)\s+(?:about|how|what|why)?\s*)/i,
            /^(?:i'm (?:looking for|trying to|wondering)\s+(?:about|how|what|why)?\s*)/i,
        ];
        for (var i = 0; i < prefixPatterns.length; i++) {
            var before = query;
            query = query.replace(prefixPatterns[i], '');
            if (query !== before) break; // only strip one prefix
        }

        // 3. Strip trailing filler
        query = query.replace(/[?.!]+$/, '').trim();
        query = query.replace(/\s+(?:please|thanks|thank you|for me)$/i, '').trim();

        // 4. Re-insert quoted phrases at the front
        if (quotedPhrases.length > 0) {
            query = quotedPhrases.join(' ') + (query ? ' ' + query : '');
        }

        // 5. Collapse whitespace
        query = query.replace(/\s+/g, ' ').trim();

        // 6. If the result is too short or unchanged, return original
        if (query.length < 3) return rawText;

        // 7. Log only if we actually changed it
        if (query !== rawText) {
            console.log('[AI Chat] Heuristic query rewrite:', JSON.stringify(rawText), '→', JSON.stringify(query));
        }
        return query;
    }

    /**
     * Fallback for follow-ups: extract key nouns/entities from recent messages and prepend to query.
     */
    function fallbackQueryEnrichment(rawText, recentMsgs) {
        // Start with heuristic optimization of the raw query
        var optimized = heuristicQueryOptimize(rawText);

        // Extract likely topic keywords from recent conversation
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
        return prefix ? (prefix + ' ' + optimized) : optimized;
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

        // ── Determine model type ──
        var _isLocal = _ai.isLocalModel && _ai.isLocalModel(_ai.currentModel);
        var _isCloud = !_isLocal;

        // Check if the current cloud model supports tool calling (OpenAI-compatible API)
        // Groq uses the OpenAI-compatible API format with native tool calling support
        var _supportsToolCalling = _isCloud && (
            (_ai.currentModel || '').indexOf('groq') === 0
        );

        // ══════════════════════════════════════════════════════════════════
        // PATH A: Cloud model with Tool Calling (Groq)
        // The model decides which tools to call based on the user's query.
        // Toggles (Search ON/OFF, Connectors ON/OFF) control tool AVAILABILITY.
        // ══════════════════════════════════════════════════════════════════
        if (_supportsToolCalling) {
            var tools = buildToolDefinitions();

            // If tools are available, let the model decide — no firehose
            if (tools.length > 0) {
                // Include editor content as context if present
                var editorContext = editorContent.trim()
                    ? '[Document Content]\n' + editorContent.substring(0, 8000)
                    : null;

                _ai.sendToAi(
                    editorContext ? 'qa' : 'generate',
                    editorContext,
                    text,
                    workerAttachments,
                    historySnapshot,
                    tools  // Pass tool definitions to the worker
                );
                return;
            }

            // No tools available (search off, connectors off) — direct generation
            if (isQuestion && editorContent.trim()) {
                _ai.sendToAi('qa', editorContent, text, workerAttachments, historySnapshot);
            } else {
                _ai.sendToAi('generate', null, text, workerAttachments, historySnapshot);
            }
            return;
        }

        // ══════════════════════════════════════════════════════════════════
        // PATH B: Firehose fallback (Local models + cloud without tool calling)
        // Fetch all enabled connectors + search, bundle into context, send.
        // ══════════════════════════════════════════════════════════════════
        var CONTEXT_BUDGET = _isLocal ? 4000 : 30000;  // local WebGPU tight budget vs cloud

        function buildFinalContext(connectorCtx, searchContext) {
            var parts = [];
            var budgetRemaining = CONTEXT_BUDGET;

            // Priority 1: search results (user explicitly toggled search on)
            if (searchContext) {
                var truncSearch = searchContext.substring(0, Math.min(searchContext.length, Math.floor(budgetRemaining * 0.5)));
                parts.push('[Web Search Results]\n' + truncSearch);
                budgetRemaining -= truncSearch.length;
            }

            // Priority 2: connector data (may be very large — HN stories + comments)
            if (connectorCtx && budgetRemaining > 200) {
                var connectorBudget = Math.min(connectorCtx.length, Math.floor(budgetRemaining * 0.5));
                parts.push(connectorCtx.substring(0, connectorBudget));
                budgetRemaining -= connectorBudget;
            }

            // Priority 3: editor/document content
            if (editorContent.trim() && budgetRemaining > 200) {
                parts.push('[Document Content]\n' + editorContent.substring(0, budgetRemaining));
            }

            if (parts.length === 0) return null;
            // Grounding header — tells the model to USE the data when relevant,
            // but still allows answering general questions from its own knowledge.
            var header = 'The following is LIVE DATA fetched right now. Use this data to answer the user\'s question when it is relevant. If the user asks about topics covered by this data (weather, news, etc.), answer from the data. If the user asks about something unrelated to this data, answer from your general knowledge.\n\n';
            return header + parts.join('\n\n');
        }

        // --- Query-relevance check for connector injection ---
        // Only inject connector data if the query seems related to what connectors provide.
        // This prevents "what is algebra?" from being polluted with weather+HN data.
        function queryNeedsConnectors(q) {
            if (!q) return false;
            var lower = q.toLowerCase();
            // Weather-related keywords
            var weatherWords = ['weather', 'temperature', 'temp', 'forecast', 'rain', 'snow', 'wind', 'humid', 'hot', 'cold', 'warm', 'celsius', 'fahrenheit', 'climate', 'sunny', 'cloudy'];
            // News/HN-related keywords
            var newsWords = ['news', 'hacker news', 'hackernews', 'top stories', 'trending', 'latest', 'headlines', 'tech news', 'startup'];
            // GitHub-related keywords
            var ghWords = ['github', 'issues', 'pull request', 'commits', 'repository', 'repo', 'pr', 'merge'];
            // Slack-related keywords
            var slackWords = ['slack', 'messages', 'channel', 'team chat'];
            // General data-seeking queries
            var dataWords = ['what is happening', 'update', 'current', 'right now', 'today', 'live'];
            var allKeywords = weatherWords.concat(newsWords, ghWords, slackWords, dataWords);

            for (var i = 0; i < allKeywords.length; i++) {
                if (lower.indexOf(allKeywords[i]) !== -1) return true;
            }
            return false;
        }

        // Fetch connector data + web search in parallel
        var _hasConnectors = M.connectors && M.connectors.hasActiveConnectors();
        var _queryRelevant = queryNeedsConnectors(text);

        // Only inject connector data when the query is relevant to connector topics
        var connectorPromise = (_hasConnectors && _queryRelevant)
            ? M.connectors.getActiveContext(text).catch(function () { return null; })
            : Promise.resolve(null);

        if (M.webSearch && M.webSearch.isSearchEnabled()) {
            var willRewrite = M.isCurrentModelReady && M.isCurrentModelReady() && !M.isAiGenerating();
            createSearchThinkingBlock(text, willRewrite);

            var searchPromise = refineSearchQuery(text).then(function (searchQuery) {
                if (searchQuery !== text) updateThinkingBlockQuery(searchQuery);
                return M.webSearch.performMultiSearch(searchQuery).then(function (results) {
                    populateSearchThinkingBlock(results, searchQuery);
                    return M.webSearch.formatResultsForLLM(results);
                });
            }).catch(function () {
                populateSearchThinkingBlock([], text);
                return null;
            });

            Promise.all([connectorPromise, searchPromise]).then(function (results) {
                var connectorCtx = results[0];
                var searchCtx    = results[1];
                var context = buildFinalContext(connectorCtx, searchCtx);
                _ai.sendToAi(context ? 'qa' : 'generate', context || null, text, workerAttachments, historySnapshot);
            });
            return;
        }

        // No web search — connector only (or neither)
        connectorPromise.then(function (connectorCtx) {
            var context = buildFinalContext(connectorCtx, null);
            if (context) {
                _ai.sendToAi('qa', context, text, workerAttachments, historySnapshot);
            } else if (isQuestion && editorContent.trim()) {
                _ai.sendToAi('qa', editorContent, text, workerAttachments, historySnapshot);
            } else {
                _ai.sendToAi('generate', null, text, workerAttachments, historySnapshot);
            }
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // Tool Definitions — built from enabled toggles + connectors
    // These are passed to cloud model APIs via the 'tools' param.
    // The MODEL decides which tools to call (or none at all).
    // ══════════════════════════════════════════════════════════════════
    function buildToolDefinitions() {
        var tools = [];

        // Web Search tool — available when search toggle is ON
        if (M.webSearch && M.webSearch.isSearchEnabled()) {
            tools.push({
                type: 'function',
                function: {
                    name: 'web_search',
                    description: 'Search the web for current information, recent events, news, facts, or anything you are unsure about',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: { type: 'string', description: 'The search query' }
                        },
                        required: ['query']
                    }
                }
            });
        }

        // Connector tools — each enabled connector becomes a tool
        if (M.connectors) {
            if (M.connectors.isEnabled('openmeteo')) {
                tools.push({
                    type: 'function',
                    function: {
                        name: 'get_weather',
                        description: 'Get current weather conditions and forecast for any city in the world',
                        parameters: {
                            type: 'object',
                            properties: {
                                city: { type: 'string', description: 'City name, e.g. "New Delhi", "Paris", "Tokyo"' }
                            },
                            required: ['city']
                        }
                    }
                });
            }

            if (M.connectors.isEnabled('hackernews')) {
                tools.push({
                    type: 'function',
                    function: {
                        name: 'get_tech_news',
                        description: 'Get top stories from Hacker News (tech and startup news)',
                        parameters: {
                            type: 'object',
                            properties: {
                                count: { type: 'number', description: 'Number of stories to fetch (1-10, default 3)' }
                            }
                        }
                    }
                });
            }

            if (M.connectors.isEnabled('github')) {
                tools.push({
                    type: 'function',
                    function: {
                        name: 'get_github',
                        description: 'Get recent GitHub issues, pull requests, and commits',
                        parameters: {
                            type: 'object',
                            properties: {
                                repo: { type: 'string', description: 'Repository name (optional)' }
                            }
                        }
                    }
                });
            }

            if (M.connectors.isEnabled('slack')) {
                tools.push({
                    type: 'function',
                    function: {
                        name: 'get_slack',
                        description: 'Get recent Slack messages from connected channels',
                        parameters: {
                            type: 'object',
                            properties: {}
                        }
                    }
                });
            }
        }

        return tools;
    }

    // ══════════════════════════════════════════════════════════════════
    // Tool Execution — runs the actual API calls for each tool_call
    // ══════════════════════════════════════════════════════════════════
    function executeToolCall(call) {
        var args = {};
        try { args = JSON.parse(call.function.arguments); } catch (e) { /* empty args */ }

        switch (call.function.name) {
            case 'web_search':
                if (!M.webSearch) return Promise.resolve('[Search unavailable]');
                return M.webSearch.performMultiSearch(args.query || '').then(function (results) {
                    return M.webSearch.formatResultsForLLM(results);
                }).catch(function () { return '[Search failed]'; });

            case 'get_weather':
                if (!M.connectors) return Promise.resolve('[Weather unavailable]');
                var weatherConfig = M.connectors.getConfig('openmeteo') || {};
                // Override city with model's chosen city
                var cityConfig = Object.assign({}, weatherConfig, { city: args.city || weatherConfig.city || 'Tokyo' });
                // Use geocoding to resolve city → lat/lon
                return fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(args.city || 'Tokyo') + '&count=1&language=en')
                    .then(function (r) { return r.json(); })
                    .then(function (geo) {
                        if (geo.results && geo.results.length > 0) {
                            cityConfig.lat = geo.results[0].latitude;
                            cityConfig.lon = geo.results[0].longitude;
                            cityConfig.city = geo.results[0].name + (geo.results[0].country ? ', ' + geo.results[0].country : '');
                        }
                        // Fetch weather with resolved coordinates
                        return M.connectors.fetchWeatherDirect(cityConfig);
                    }).catch(function () { return '[Weather fetch failed]'; });

            case 'get_tech_news':
                if (!M.connectors) return Promise.resolve('[HN unavailable]');
                var hnConfig = M.connectors.getConfig('hackernews') || {};
                hnConfig.count = args.count || hnConfig.count || 3;
                return M.connectors.fetchHNDirect(hnConfig).catch(function () { return '[HN fetch failed]'; });

            case 'get_github':
                if (!M.connectors) return Promise.resolve('[GitHub unavailable]');
                var ghToken = M.connectors.getToken('github');
                var ghConfig = M.connectors.getConfig('github') || {};
                return M.connectors.fetchGitHubDirect(ghToken, ghConfig).catch(function () { return '[GitHub fetch failed]'; });

            case 'get_slack':
                if (!M.connectors) return Promise.resolve('[Slack unavailable]');
                var slackToken = M.connectors.getToken('slack');
                var slackConfig = M.connectors.getConfig('slack') || {};
                return M.connectors.fetchSlackDirect(slackToken, slackConfig).catch(function () { return '[Slack fetch failed]'; });

            default:
                return Promise.resolve('[Unknown tool: ' + call.function.name + ']');
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // Handle Tool Calls — called when the worker reports tool_calls
    // Executes tools in parallel, then sends results back for Pass 2
    // ══════════════════════════════════════════════════════════════════
    function handleToolCalls(toolCalls, assistantMessage, conversationMessages, messageId) {
        // Show tool execution feedback in UI
        var toolNames = toolCalls.map(function (tc) { return tc.function.name; });
        console.log('[AI Chat] Model requested tools:', toolNames);

        // Show a status indicator
        var statusParts = toolNames.map(function (name) {
            switch (name) {
                case 'web_search': return '🔍 Searching web...';
                case 'get_weather': return '☁️ Fetching weather...';
                case 'get_tech_news': return '📰 Fetching news...';
                case 'get_github': return '🐙 Fetching GitHub data...';
                case 'get_slack': return '💬 Fetching Slack messages...';
                default: return '⚡ Calling ' + name + '...';
            }
        });
        if (typeof M.showToast === 'function') {
            M.showToast(statusParts.join('  '), 'info', 3000);
        }

        // Execute all tool calls in parallel
        var toolPromises = toolCalls.map(function (tc) {
            return executeToolCall(tc).then(function (result) {
                return { id: tc.id, name: tc.function.name, result: result };
            });
        });

        Promise.all(toolPromises).then(function (results) {
            // Build the updated conversation with tool results
            var updatedMessages = conversationMessages.slice();

            // Add the assistant's tool_call message
            updatedMessages.push({
                role: 'assistant',
                content: assistantMessage.content || null,
                tool_calls: toolCalls
            });

            // Add each tool result
            results.forEach(function (r) {
                updatedMessages.push({
                    role: 'tool',
                    tool_call_id: r.id,
                    content: typeof r.result === 'string' ? r.result : JSON.stringify(r.result)
                });
            });

            // Reset generating state so sendToAi can fire Pass 2
            _ai.isGenerating = false;

            // Pass 2: send the full conversation (with tool results) back to the model
            // No tools this time — just generate the final answer
            _ai.sendToAi('qa', null, null, null, null, null, updatedMessages);
        }).catch(function (err) {
            console.error('[AI Chat] Tool execution failed:', err);
            _ai.isGenerating = false;
            _ai.handleAiError('Tool execution failed: ' + err.message, messageId);
        });
    }

    // Wire handleToolCalls onto M._ai for the worker bridge in ai-assistant.js
    M._ai.handleToolCalls = handleToolCalls;

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

    // --- Web Search Toggle & Provider Selector (multi-select pills) ---
    (function initSearchUI() {
        var searchToggle = document.getElementById('ai-search-toggle');
        var providerBar = document.getElementById('ai-search-provider-bar');
        var pillContainer = document.getElementById('ai-search-provider-pills');
        if (!searchToggle || !M.webSearch) return;

        searchToggle.checked = M.webSearch.isSearchEnabled();
        if (searchToggle.checked && providerBar) {
            providerBar.style.display = '';
            providerBar.classList.add('ai-mobile-show');
        }

        // Sync checkbox state from saved providers
        function syncPillState() {
            if (!pillContainer) return;
            var checks = pillContainer.querySelectorAll('.ai-provider-check');
            checks.forEach(function (cb) {
                cb.checked = M.webSearch.isProviderActive(cb.value);
                var pill = cb.closest('.ai-provider-pill');
                if (pill) pill.classList.toggle('active', cb.checked);
            });
        }
        syncPillState();

        searchToggle.addEventListener('change', function () {
            M.webSearch.setSearchEnabled(searchToggle.checked);
            if (providerBar) {
                providerBar.style.display = searchToggle.checked ? '' : 'none';
                // On mobile, CSS uses !important to hide — use class to override
                providerBar.classList.toggle('ai-mobile-show', searchToggle.checked);
            }
        });

        // Checkbox toggle handler
        if (pillContainer) {
            pillContainer.addEventListener('change', function (e) {
                var cb = e.target;
                if (!cb.classList.contains('ai-provider-check')) return;
                M.webSearch.toggleProvider(cb.value);
                syncPillState(); // re-sync in case duckduckgo was force-activated
            });

            // Per-pill API key buttons
            pillContainer.addEventListener('click', function (e) {
                var keyBtn = e.target.closest('.ai-provider-key-btn');
                if (!keyBtn) return;
                e.preventDefault();
                e.stopPropagation();

                var providerId = keyBtn.getAttribute('data-provider');
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

    // --- Unified Attach Button (merged attach + screenshot) ---
    if (aiAttachBtn) {
        aiAttachBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var menu = document.getElementById('ai-attach-menu');
            if (menu) {
                var isOpen = menu.classList.contains('active');
                menu.style.display = isOpen ? 'none' : 'flex';
                menu.classList.toggle('active', !isOpen);
            }
        });
    }

    // "Attach File" menu item opens file picker
    document.addEventListener('click', function (e) {
        if (e.target.closest('#ai-attach-file-item')) {
            var menu = document.getElementById('ai-attach-menu');
            if (menu) { menu.style.display = 'none'; menu.classList.remove('active'); }
            if (aiFileInput) aiFileInput.click();
            return;
        }
        // Close menu on outside click (but not if clicking the toggle button itself)
        if (!e.target.closest('#ai-attach-menu') && !e.target.closest('#ai-attach-btn')) {
            var menu2 = document.getElementById('ai-attach-menu');
            if (menu2) { menu2.style.display = 'none'; menu2.classList.remove('active'); }
        }
    });

    if (aiFileInput) {
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
