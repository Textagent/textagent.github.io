// ============================================
// ai-tags.js — AI Annotation Layers
// Transform, parse, serialize, pills, thread panel, AI context
// ============================================
(function (M) {
    'use strict';

    // --- Constants ---
    var TAG_REGEX = /<!--\s*@ai-tag:\s*([\s\S]*?)-->/g;
    var TAG_REGEX_SINGLE = /<!--\s*@ai-tag:\s*([\s\S]*?)-->/;
    var TYPE_COLORS = {
        qa: 'blue', highlight: 'yellow', note: 'green',
        define: 'purple', label: 'gray', disagree: 'red'
    };
    var TYPE_ICONS = {
        qa: '💬', highlight: '⭐', note: '📝',
        define: '📖', label: '🏷️', disagree: '❌'
    };
    var LABEL_OPTIONS = ['key concept', 'review later', 'exam', 'confusing', 'important', 'todo'];

    // --- State ---
    var activeThreadPanel = null;
    var activeThreadOverlay = null;
    var activePromptOverlay = null;
    var threadPanelTagData = null;
    var threadPanelStreaming = false;
    var threadSearchEnabled = false;
    var threadAttachments = [];

    // ========================================
    // PARSING & SERIALIZATION
    // ========================================

    function generateTagId() {
        var arr = crypto.getRandomValues(new Uint8Array(4));
        return 'ann_' + Array.from(arr, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    /**
     * Parse a single @ai-tag comment body into structured data.
     * @param {string} body - Everything between <!-- @ai-tag: ... -->
     * @returns {object} { id, type, color, ts, anchor, thread[], label, text }
     */
    function parseAiTag(body) {
        var lines = body.split('\n');
        var firstLine = lines[0] || '';

        // Parse metadata from first line
        var id = extractAttr(firstLine, 'id') || generateTagId();
        var type = extractAttr(firstLine, 'type') || 'highlight';
        var color = extractAttr(firstLine, 'color') || TYPE_COLORS[type] || 'blue';
        var ts = extractAttr(firstLine, 'ts') || Date.now().toString();
        var label = extractAttr(firstLine, 'label') || '';

        // Parse anchor
        var anchor = '';
        var contentStart = 1;
        for (var i = 1; i < lines.length; i++) {
            if (lines[i].trim().startsWith('@anchor:')) {
                anchor = lines[i].trim().substring('@anchor:'.length).trim();
                contentStart = i + 1;
                break;
            }
        }

        // Parse thread (Q:/A:) or text content
        var thread = [];
        var text = '';
        var term = '';
        var def = '';
        var summary = '';
        var currentRole = null;
        var currentContent = '';

        for (var j = contentStart; j < lines.length; j++) {
            var line = lines[j];
            var trimmed = line.trim();

            if (type === 'qa') {
                if (trimmed.startsWith('Q: ') || trimmed.startsWith('Q:')) {
                    if (currentRole) {
                        thread.push({ role: currentRole, content: currentContent.trim() });
                    }
                    currentRole = 'user';
                    currentContent = trimmed.substring(trimmed.indexOf(':') + 1).trim();
                } else if (trimmed.startsWith('A: ') || trimmed.startsWith('A:')) {
                    if (currentRole) {
                        thread.push({ role: currentRole, content: currentContent.trim() });
                    }
                    currentRole = 'assistant';
                    currentContent = trimmed.substring(trimmed.indexOf(':') + 1).trim();
                } else if (currentRole) {
                    currentContent += '\n' + line;
                }
            } else if (type === 'define') {
                if (trimmed.startsWith('TERM:')) {
                    term = trimmed.substring(5).trim();
                } else if (trimmed.startsWith('DEF:')) {
                    def = trimmed.substring(4).trim();
                } else if (def) {
                    def += '\n' + line;
                }
            } else {
                text += (text ? '\n' : '') + line;
            }
        }
        // Flush last Q/A
        if (currentRole) {
            thread.push({ role: currentRole, content: currentContent.trim() });
        }

        return {
            id: id, type: type, color: color, ts: ts,
            anchor: anchor, thread: thread, label: label,
            text: text.trim(), term: term, def: def.trim(), summary: summary
        };
    }

    function extractAttr(line, name) {
        var regex = new RegExp(name + '="([^"]*)"');
        var match = line.match(regex);
        return match ? match[1] : '';
    }

    /**
     * Serialize tag data back to <!-- @ai-tag: ... --> comment.
     */
    function serializeAiTag(data) {
        var meta = 'id="' + data.id + '" type="' + data.type + '" color="' + data.color + '" ts="' + data.ts + '"';
        if (data.label) meta += ' label="' + data.label + '"';

        var lines = ['<!-- @ai-tag: ' + meta];

        if (data.anchor) {
            lines.push('@anchor: ' + data.anchor);
        }

        if (data.type === 'qa' && data.thread && data.thread.length > 0) {
            data.thread.forEach(function (turn) {
                var prefix = turn.role === 'user' ? 'Q: ' : 'A: ';
                lines.push(prefix + turn.content);
            });
        } else if (data.type === 'define' && data.term) {
            lines.push('TERM: ' + data.term);
            lines.push('DEF: ' + data.def);
        } else if (data.text) {
            lines.push(data.text);
        }

        lines.push('-->');
        return lines.join('\n');
    }

    // ========================================
    // TRANSFORM: Markdown → Pill Anchor Divs
    // ========================================

    /**
     * Replace <!-- @ai-tag: ... --> comments with pill anchor divs.
     * Called in the renderer.js transform chain.
     */
    M.transformAiTagMarkdown = function (md) {
        return md.replace(TAG_REGEX, function (match, body) {
            var tag = parseAiTag(body);
            var count = tag.type === 'qa' ? Math.floor(tag.thread.length / 2) : 0;
            var icon = TYPE_ICONS[tag.type] || '📌';
            var pillLabel = '';

            switch (tag.type) {
                case 'qa': pillLabel = icon + ' ' + (count || '?'); break;
                case 'highlight': pillLabel = icon; break;
                case 'note': pillLabel = icon + ' Note'; break;
                case 'define': pillLabel = icon + ' Defined'; break;
                case 'label': pillLabel = icon + ' ' + (tag.label || 'tag'); break;
                case 'disagree': pillLabel = icon + ' Verify'; break;
                default: pillLabel = icon;
            }

            // Encode thread data as base64 for the DOM attribute
            var threadB64 = '';
            try { threadB64 = btoa(unescape(encodeURIComponent(JSON.stringify(tag)))); } catch (_e) { /* ignore */ }

            return '<span class="ai-tag-pill-anchor" ' +
                'data-tag-id="' + escapeAttr(tag.id) + '" ' +
                'data-tag-type="' + escapeAttr(tag.type) + '" ' +
                'data-tag-color="' + escapeAttr(tag.color) + '" ' +
                'data-tag-count="' + count + '" ' +
                'data-tag-anchor="' + escapeAttr(tag.anchor) + '" ' +
                'data-tag-label="' + escapeAttr(pillLabel) + '" ' +
                'data-tag-data="' + threadB64 + '"' +
                '></span>';
        });
    };

    function escapeAttr(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ========================================
    // BIND: Inject pill DOM + click handlers
    // ========================================

    M.bindAiTagPreviewActions = function (container) {
        var anchors = container.querySelectorAll('.ai-tag-pill-anchor');
        anchors.forEach(function (anchor) {
            if (anchor._aiTagBound) return;
            anchor._aiTagBound = true;

            var type = anchor.dataset.tagType;
            var color = anchor.dataset.tagColor || TYPE_COLORS[type] || 'blue';
            var label = anchor.dataset.tagLabel || '';

            // Create pill element
            var pill = document.createElement('span');
            pill.className = 'ai-tag-pill ai-tag-pill--' + color;
            pill.textContent = label;
            pill.title = 'Click to view annotation';
            pill.dataset.tagId = anchor.dataset.tagId;
            pill.setAttribute('role', 'button');
            pill.setAttribute('tabindex', '0');

            pill.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                handlePillClick(anchor, pill);
            });

            // Insert pill after anchor
            anchor.appendChild(pill);
        });
    };

    /**
     * Shared pill click handler — decodes tag data and opens the appropriate panel.
     */
    function handlePillClick(anchor, pill) {
        var tagDataStr = anchor.dataset.tagData;
        if (!tagDataStr) {
            console.warn('[AI Tags] No tag data on anchor:', anchor);
            return;
        }
        try {
            var tagData = JSON.parse(decodeURIComponent(escape(atob(tagDataStr))));
            if (tagData.type === 'qa') {
                openThreadPanel(tagData, pill);
            } else {
                openViewPanel(tagData, pill);
            }
        } catch (err) {
            console.warn('[AI Tags] Failed to decode tag data:', err);
        }
    }

    /**
     * Delegated click handler on the preview pane.
     * Catches clicks on .ai-tag-pill elements even if they were added dynamically.
     * This is the belt-and-suspenders approach: individual pill handlers + delegation.
     */
    if (M.markdownPreview) {
        M.markdownPreview.addEventListener('click', function (e) {
            var pill = e.target.closest('.ai-tag-pill');
            if (!pill) return;
            e.preventDefault();
            e.stopPropagation();
            var anchor = pill.closest('.ai-tag-pill-anchor');
            if (anchor) {
                handlePillClick(anchor, pill);
            }
        });
    }

    // ========================================
    // EDITOR OPERATIONS
    // ========================================

    /**
     * Strip markdown formatting to get plain text for matching.
     */
    function stripMarkdown(text) {
        return (text || '')
            .replace(/\*\*([^*]+)\*\*/g, '$1')       // bold
            .replace(/\*([^*]+)\*/g, '$1')             // italic
            .replace(/__([^_]+)__/g, '$1')              // bold underscore
            .replace(/_([^_]+)_/g, '$1')                // italic underscore
            .replace(/~~([^~]+)~~/g, '$1')              // strikethrough
            .replace(/`([^`]+)`/g, '$1')                // inline code
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // links [text](url)
            .replace(/!\[([^\]]*?)\]\([^)]+\)/g, '$1') // images
            .replace(/^#{1,6}\s*/gm, '')                // headings
            .replace(/^[\*\-\+]\s+/gm, '')              // unordered lists
            .replace(/^\d+\.\s+/gm, '')                 // ordered lists
            .replace(/^>\s*/gm, '')                      // blockquotes
            .trim();
    }

    /**
     * Determine the structural block boundary that contains a given character
     * offset.  A "block" is defined as a contiguous group of non-blank lines
     * (a paragraph, list, heading, blockquote, or table).
     *
     * Returns the character offset AFTER the block's trailing newline(s),
     * i.e. the safe insertion point where a tag comment won't break the
     * surrounding markdown syntax.
     */
    function findBlockEnd(content, offset) {
        var lines = content.split('\n');
        var charPos = 0;
        var anchorLineIdx = -1;

        // 1. Find the line index that contains `offset`
        for (var i = 0; i < lines.length; i++) {
            var lineEnd = charPos + lines[i].length; // does NOT include the \n
            if (offset >= charPos && offset <= lineEnd) {
                anchorLineIdx = i;
                break;
            }
            charPos += lines[i].length + 1; // +1 for the \n
        }
        if (anchorLineIdx === -1) anchorLineIdx = lines.length - 1;

        // 2. Walk forward past all contiguous non-blank lines that belong to
        //    the same structural block (paragraph, list, blockquote, table, etc.)
        var blockEndLineIdx = anchorLineIdx;
        for (var j = anchorLineIdx + 1; j < lines.length; j++) {
            if (lines[j].trim() === '') break;           // blank line = block boundary
            blockEndLineIdx = j;
        }

        // 3. Compute character offset after the last line of the block
        var insertPos = 0;
        for (var k = 0; k <= blockEndLineIdx; k++) {
            insertPos += lines[k].length + 1;
        }
        // Clamp to content length
        if (insertPos > content.length) insertPos = content.length;

        return insertPos;
    }

    function insertTagIntoEditor(tagComment, anchorText) {
        var editor = M.markdownEditor;
        var content = editor.value;

        // Strategy: find anchor text in the raw markdown
        // The anchorText comes from the preview (rendered HTML), so it might not
        // match the raw markdown that contains **bold**, [links](url), etc.

        var anchorIndex = -1;

        // 1. Direct match
        anchorIndex = content.indexOf(anchorText);

        // 2. Try shorter prefixes (50, 30, 20 chars) for partial matches
        if (anchorIndex === -1 && anchorText.length > 50) {
            anchorIndex = content.indexOf(anchorText.substring(0, 50));
        }
        if (anchorIndex === -1 && anchorText.length > 30) {
            anchorIndex = content.indexOf(anchorText.substring(0, 30));
        }
        if (anchorIndex === -1 && anchorText.length > 20) {
            anchorIndex = content.indexOf(anchorText.substring(0, 20));
        }

        // 3. Try first significant words (for formatted text)
        if (anchorIndex === -1) {
            var words = anchorText.split(/\s+/).filter(function (w) { return w.length > 3; });
            if (words.length >= 2) {
                // Try to find a line containing the first 2-3 significant words
                var searchPhrase = words.slice(0, Math.min(3, words.length)).join('.*?');
                try {
                    var lineRegex = new RegExp(searchPhrase, 'i');
                    var lines = content.split('\n');
                    var charCount = 0;
                    for (var i = 0; i < lines.length; i++) {
                        var stripped = stripMarkdown(lines[i]);
                        if (lineRegex.test(stripped)) {
                            anchorIndex = charCount;
                            break;
                        }
                        charCount += lines[i].length + 1; // +1 for newline
                    }
                } catch (_e) { /* regex error, skip */ }
            }
        }

        // 4. Try matching stripped markdown against stripped anchor
        if (anchorIndex === -1) {
            var strippedAnchor = stripMarkdown(anchorText).substring(0, 40);
            if (strippedAnchor.length > 5) {
                var lines2 = content.split('\n');
                var charCount2 = 0;
                for (var j = 0; j < lines2.length; j++) {
                    var stripped2 = stripMarkdown(lines2[j]);
                    if (stripped2.indexOf(strippedAnchor) !== -1) {
                        anchorIndex = charCount2;
                        break;
                    }
                    charCount2 += lines2[j].length + 1;
                }
            }
        }

        if (anchorIndex !== -1) {
            // Find the end of the structural block (paragraph / list / table /
            // heading) that contains the anchor.  This prevents us from
            // splitting a list, table, or multi-line paragraph with the
            // inserted HTML comment.
            var insertPos = findBlockEnd(content, anchorIndex);

            var before = content.substring(0, insertPos);
            var after  = content.substring(insertPos);

            // Ensure exactly one blank line before and after the tag comment
            // so it doesn't merge with surrounding blocks.
            var trailingNewlines = before.length - before.replace(/\n+$/, '').length;
            var leadingNewlines  = after.length - after.replace(/^\n+/, '').length;

            var padBefore = trailingNewlines >= 2 ? '' : '\n'.repeat(2 - trailingNewlines);
            var padAfter  = leadingNewlines  >= 2 ? '' : '\n'.repeat(2 - leadingNewlines);

            editor.value = before + padBefore + tagComment + padAfter + after;
        } else {
            // Last resort: append at end. This is bad UX but prevents data loss.
            editor.value = content + '\n\n' + tagComment + '\n';
        }

        editor.dispatchEvent(new Event('input'));
    }

    function updateTagInEditor(tagId, newComment) {
        var editor = M.markdownEditor;
        var content = editor.value;
        // Find existing tag by ID
        var regex = new RegExp('<!--\\s*@ai-tag:\\s*[^]*?id="' + tagId + '"[^]*?-->', 'g');
        var match = regex.exec(content);
        if (match) {
            editor.value = content.substring(0, match.index) + newComment + content.substring(match.index + match[0].length);
            editor.dispatchEvent(new Event('input'));
        }
    }

    function removeTagFromEditor(tagId) {
        var editor = M.markdownEditor;
        var content = editor.value;
        var regex = new RegExp('\\n*<!--\\s*@ai-tag:\\s*[^]*?id="' + tagId + '"[^]*?-->\\n*', 'g');
        editor.value = content.replace(regex, '\n\n');
        editor.dispatchEvent(new Event('input'));
        if (M.renderMarkdown) M.renderMarkdown();
    }

    // ========================================
    // ACTION HANDLER (from context menu)
    // ========================================

    M.handleAiTagAction = function (action, selectedText) {
        // Check if document is readonly (shared doc without Study Copy)
        if (M.isViewingSharedDoc && M.markdownEditor.readOnly) {
            if (M.showToast) M.showToast('📝 Create a Study Copy first to annotate', 'warning');
            return;
        }

        switch (action) {
            case 'deep-dive':
                openThreadPanel({
                    id: generateTagId(), type: 'qa', color: 'blue',
                    ts: Date.now().toString(), anchor: selectedText,
                    thread: [], label: '', text: '', _isNew: true
                }, null);
                break;

            case 'highlight':
                createInstantTag('highlight', 'yellow', selectedText);
                break;

            case 'add-note':
                showNotePrompt(selectedText);
                break;

            case 'define':
                createDefineTag(selectedText);
                break;

            case 'add-label':
                showLabelPicker(selectedText);
                break;

            case 'disagree':
                showDisagreePrompt(selectedText);
                break;
        }
    };

    // ========================================
    // INSTANT TAGS (highlight, etc.)
    // ========================================

    function createInstantTag(type, color, anchorText) {
        var tag = {
            id: generateTagId(), type: type, color: color,
            ts: Date.now().toString(), anchor: anchorText,
            thread: [], label: '', text: ''
        };
        insertTagIntoEditor(serializeAiTag(tag), anchorText);
        if (M.renderMarkdown) M.renderMarkdown();
        if (M.showToast) M.showToast(TYPE_ICONS[type] + ' Annotation added', 'success');
    }

    // ========================================
    // DEFINE TAG (AI one-shot)
    // ========================================

    function createDefineTag(selectedText) {
        if (!M.isCurrentModelReady || !M.isCurrentModelReady()) {
            var modelId = M.getCurrentAiModel ? M.getCurrentAiModel() : '';
            if (modelId && M.switchToModel) {
                if (M.showToast) M.showToast('⏳ Loading AI model for Define...', 'info');
                M.switchToModel(modelId);
                var retryCount = 0;
                var retryTimer = setInterval(function () {
                    retryCount++;
                    if (M.isCurrentModelReady && M.isCurrentModelReady()) {
                        clearInterval(retryTimer);
                        createDefineTag(selectedText);
                    } else if (retryCount >= 60) {
                        clearInterval(retryTimer);
                        if (M.showToast) M.showToast('❌ Model failed to load', 'error');
                    }
                }, 2000);
            } else {
                if (M.showToast) M.showToast('🔒 Select and load an AI model first', 'warning');
            }
            return;
        }

        var tag = {
            id: generateTagId(), type: 'define', color: 'purple',
            ts: Date.now().toString(), anchor: selectedText,
            thread: [], label: '', text: '', term: selectedText, def: ''
        };

        // Show a temporary "defining..." toast
        if (M.showToast) M.showToast('📖 Defining "' + selectedText.substring(0, 40) + '"...', 'info');

        var fullDoc = M.markdownEditor.value.replace(TAG_REGEX, '').trim();
        var context = '[Full Document]\n' + fullDoc +
            '\n\n[Selected Term]\n"' + selectedText + '"';

        M.requestAiTask({
            taskType: 'generate',
            context: context,
            userPrompt: 'Define this term concisely in 1-2 sentences, based on the document context. Output only the definition, nothing else.',
            enableThinking: false,
            silent: true
        }).then(function (definition) {
            tag.def = definition.trim();
            insertTagIntoEditor(serializeAiTag(tag), selectedText);
            if (M.renderMarkdown) M.renderMarkdown();
            if (M.showToast) M.showToast('📖 Definition saved', 'success');
        }).catch(function (err) {
            if (M.showToast) M.showToast('❌ Define failed: ' + err.message, 'error');
        });
    }

    // ========================================
    // PROMPTS: Note, Label, Disagree
    // ========================================

    function showNotePrompt(anchorText) {
        showPrompt({
            title: '📝 Add Note',
            anchor: anchorText,
            placeholder: 'Your note about this passage...',
            inputType: 'textarea',
            onSave: function (text) {
                var tag = {
                    id: generateTagId(), type: 'note', color: 'green',
                    ts: Date.now().toString(), anchor: anchorText,
                    thread: [], label: '', text: text
                };
                insertTagIntoEditor(serializeAiTag(tag), anchorText);
                if (M.renderMarkdown) M.renderMarkdown();
                if (M.showToast) M.showToast('📝 Note added', 'success');
            }
        });
    }

    function showDisagreePrompt(anchorText) {
        showPrompt({
            title: '❌ Mark as Incorrect',
            anchor: anchorText,
            placeholder: 'Why do you disagree? (optional)',
            inputType: 'textarea',
            onSave: function (text) {
                var tag = {
                    id: generateTagId(), type: 'disagree', color: 'red',
                    ts: Date.now().toString(), anchor: anchorText,
                    thread: [], label: '', text: text || 'Needs verification'
                };
                insertTagIntoEditor(serializeAiTag(tag), anchorText);
                if (M.renderMarkdown) M.renderMarkdown();
                if (M.showToast) M.showToast('❌ Marked for verification', 'success');
            }
        });
    }

    function showLabelPicker(anchorText) {
        closePrompt();
        var overlay = document.createElement('div');
        overlay.className = 'ai-tag-prompt-overlay';
        var card = document.createElement('div');
        card.className = 'ai-tag-prompt-card';

        var selectedLabel = '';
        card.innerHTML =
            '<h4>🏷️ Add Label</h4>' +
            '<div class="ai-tag-prompt-anchor">"' + escapeHtml(anchorText.substring(0, 80)) + '"</div>' +
            '<div class="ai-tag-label-pills">' +
            LABEL_OPTIONS.map(function (l) {
                return '<button class="ai-tag-label-pill" data-label="' + escapeAttr(l) + '">' + escapeHtml(l) + '</button>';
            }).join('') +
            '</div>' +
            '<div class="ai-tag-prompt-actions">' +
            '<button class="ai-tag-prompt-btn ai-tag-prompt-btn--cancel">Cancel</button>' +
            '<button class="ai-tag-prompt-btn ai-tag-prompt-btn--save" disabled>Add Label</button>' +
            '</div>';

        overlay.appendChild(card);
        document.body.appendChild(overlay);
        activePromptOverlay = overlay;

        var saveBtn = card.querySelector('.ai-tag-prompt-btn--save');
        card.querySelectorAll('.ai-tag-label-pill').forEach(function (pill) {
            pill.addEventListener('click', function () {
                card.querySelectorAll('.ai-tag-label-pill').forEach(function (p) { p.classList.remove('active'); });
                pill.classList.add('active');
                selectedLabel = pill.dataset.label;
                saveBtn.disabled = false;
            });
        });

        card.querySelector('.ai-tag-prompt-btn--cancel').addEventListener('click', closePrompt);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) closePrompt(); });

        saveBtn.addEventListener('click', function () {
            if (!selectedLabel) return;
            closePrompt();
            var tag = {
                id: generateTagId(), type: 'label', color: 'gray',
                ts: Date.now().toString(), anchor: anchorText,
                thread: [], label: selectedLabel, text: ''
            };
            insertTagIntoEditor(serializeAiTag(tag), anchorText);
            if (M.renderMarkdown) M.renderMarkdown();
            if (M.showToast) M.showToast('🏷️ Labeled: ' + selectedLabel, 'success');
        });
    }

    function showPrompt(opts) {
        closePrompt();
        var overlay = document.createElement('div');
        overlay.className = 'ai-tag-prompt-overlay';
        var card = document.createElement('div');
        card.className = 'ai-tag-prompt-card';

        var inputHtml = opts.inputType === 'textarea'
            ? '<textarea rows="3" placeholder="' + escapeAttr(opts.placeholder || '') + '"></textarea>'
            : '<input type="text" placeholder="' + escapeAttr(opts.placeholder || '') + '" />';

        card.innerHTML =
            '<h4>' + opts.title + '</h4>' +
            '<div class="ai-tag-prompt-anchor">"' + escapeHtml((opts.anchor || '').substring(0, 80)) + '"</div>' +
            inputHtml +
            '<div class="ai-tag-prompt-actions">' +
            '<button class="ai-tag-prompt-btn ai-tag-prompt-btn--cancel">Cancel</button>' +
            '<button class="ai-tag-prompt-btn ai-tag-prompt-btn--save">Save</button>' +
            '</div>';

        overlay.appendChild(card);
        document.body.appendChild(overlay);
        activePromptOverlay = overlay;

        var input = card.querySelector('textarea, input');
        setTimeout(function () { input.focus(); }, 100);

        card.querySelector('.ai-tag-prompt-btn--cancel').addEventListener('click', closePrompt);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) closePrompt(); });

        card.querySelector('.ai-tag-prompt-btn--save').addEventListener('click', function () {
            var val = input.value.trim();
            closePrompt();
            if (opts.onSave) opts.onSave(val);
        });

        // Enter to save (for single-line inputs)
        if (opts.inputType !== 'textarea') {
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') { e.preventDefault(); card.querySelector('.ai-tag-prompt-btn--save').click(); }
            });
        }
    }

    function closePrompt() {
        if (activePromptOverlay) {
            activePromptOverlay.remove();
            activePromptOverlay = null;
        }
    }

    // ========================================
    // VIEW PANEL (non-QA tags: note, define, etc.)
    // ========================================

    function openViewPanel(tagData, anchorEl) {
        closeThreadPanel();
        var panel = document.createElement('div');
        panel.className = 'ai-tag-thread-panel';

        var contentHtml = '';
        switch (tagData.type) {
            case 'highlight':
                contentHtml = '<div class="ai-tag-thread-msg ai-tag-thread-msg--ai"><span class="ai-tag-msg-label">Highlighted</span>Marked as important</div>';
                break;
            case 'note':
                contentHtml = '<div class="ai-tag-thread-msg ai-tag-thread-msg--ai"><span class="ai-tag-msg-label">Note</span>' + escapeHtml(tagData.text) + '</div>';
                break;
            case 'define':
                contentHtml = '<div class="ai-tag-thread-msg ai-tag-thread-msg--ai"><span class="ai-tag-msg-label">Definition: ' + escapeHtml(tagData.term) + '</span>' + escapeHtml(tagData.def) + '</div>';
                break;
            case 'label':
                contentHtml = '<div class="ai-tag-thread-msg ai-tag-thread-msg--ai"><span class="ai-tag-msg-label">Label</span>' + escapeHtml(tagData.label) + '</div>';
                break;
            case 'disagree':
                contentHtml = '<div class="ai-tag-thread-msg ai-tag-thread-msg--ai"><span class="ai-tag-msg-label">Disagreement</span>' + escapeHtml(tagData.text) + '</div>';
                break;
        }

        panel.innerHTML =
            '<div class="ai-tag-thread-header">' +
            '<div class="ai-tag-thread-anchor">' + escapeHtml((tagData.anchor || '').substring(0, 120)) + '</div>' +
            '<button class="ai-tag-thread-close" title="Close"><i class="bi bi-x-lg"></i></button>' +
            '</div>' +
            '<div class="ai-tag-thread-messages">' + contentHtml + '</div>' +
            '<div style="padding:8px 14px;display:flex;justify-content:flex-end">' +
            '<button class="ai-tag-thread-delete"><i class="bi bi-trash3"></i> Remove annotation</button>' +
            '</div>';

        positionPanel(panel, anchorEl);
        createOverlay();
        document.body.appendChild(panel);
        activeThreadPanel = panel;
        threadPanelTagData = tagData;

        panel.querySelector('.ai-tag-thread-close').addEventListener('click', closeThreadPanel);
        panel.querySelector('.ai-tag-thread-delete').addEventListener('click', function () {
            removeTagFromEditor(tagData.id);
            closeThreadPanel();
            if (M.showToast) M.showToast('🗑️ Annotation removed', 'success');
        });
    }

    // ========================================
    // THREAD PANEL (Deep Dive Q&A)
    // ========================================

    function openThreadPanel(tagData, anchorEl) {
        closeThreadPanel();
        threadPanelTagData = tagData;
        threadSearchEnabled = false;
        threadAttachments = [];

        var panel = document.createElement('div');
        panel.className = 'ai-tag-thread-panel';

        // Build model options
        var models = window.AI_MODELS || {};
        var currentModel = M.getCurrentAiModel ? M.getCurrentAiModel() : '';
        var modelOptionsHtml = '';
        Object.keys(models).forEach(function (id) {
            var cfg = models[id];
            if (cfg.isImageModel || cfg.isTtsModel || cfg.isSttModel) return;
            var selected = id === currentModel ? ' selected' : '';
            modelOptionsHtml += '<option value="' + id + '"' + selected + '>' + cfg.label + '</option>';
        });

        // Build thread messages HTML
        var messagesHtml = '';
        if (tagData.thread && tagData.thread.length > 0) {
            tagData.thread.forEach(function (turn) {
                var cls = turn.role === 'user' ? 'ai-tag-thread-msg--user' : 'ai-tag-thread-msg--ai';
                var lbl = turn.role === 'user' ? 'You' : 'AI';
                messagesHtml += '<div class="ai-tag-thread-msg ' + cls + '"><span class="ai-tag-msg-label">' + lbl + '</span>' + escapeHtml(turn.content) + '</div>';
            });
        } else {
            messagesHtml = '<div style="text-align:center;color:#6e7681;font-size:12px;padding:20px 0"><i class="bi bi-stars" style="font-size:18px;display:block;margin-bottom:6px"></i>Ask anything about this passage</div>';
        }

        panel.innerHTML =
            '<div class="ai-tag-thread-header">' +
            '<div class="ai-tag-thread-anchor">' + escapeHtml((tagData.anchor || '').substring(0, 120)) + '</div>' +
            '<button class="ai-tag-thread-close" title="Close"><i class="bi bi-x-lg"></i></button>' +
            '</div>' +
            '<div class="ai-tag-thread-toolbar">' +
            '<select class="ai-tag-model-select" title="AI Model">' + modelOptionsHtml + '</select>' +
            '<button class="ai-tag-search-toggle" title="Toggle Web Search"><i class="bi bi-globe-americas"></i> Search</button>' +
            '<button class="ai-tag-attach-btn" title="Attach files"><i class="bi bi-paperclip"></i></button>' +
            '<input type="file" class="ai-tag-attach-input" multiple accept="image/*,.txt,.md,.csv,.json,.pdf" style="display:none" />' +
            '</div>' +
            '<div class="ai-tag-thread-messages">' + messagesHtml + '</div>' +
            '<div class="ai-tag-thread-input">' +
            '<textarea rows="1" placeholder="Ask follow-up..."></textarea>' +
            '<button class="ai-tag-thread-send" title="Send"><i class="bi bi-send-fill"></i></button>' +
            '</div>' +
            '<div style="padding:4px 14px 8px;display:flex;justify-content:flex-end">' +
            '<button class="ai-tag-thread-delete"><i class="bi bi-trash3"></i> Remove</button>' +
            '</div>';

        positionPanel(panel, anchorEl);
        createOverlay();
        document.body.appendChild(panel);
        activeThreadPanel = panel;

        // Scroll to bottom
        var messagesArea = panel.querySelector('.ai-tag-thread-messages');
        messagesArea.scrollTop = messagesArea.scrollHeight;

        // Event handlers
        panel.querySelector('.ai-tag-thread-close').addEventListener('click', function () {
            saveAndCloseThread();
        });
        panel.querySelector('.ai-tag-thread-delete').addEventListener('click', function () {
            removeTagFromEditor(tagData.id);
            closeThreadPanel();
            if (M.showToast) M.showToast('🗑️ Annotation removed', 'success');
        });

        // Model selector
        var modelSelect = panel.querySelector('.ai-tag-model-select');
        modelSelect.addEventListener('change', function () {
            if (M.switchToModel) M.switchToModel(this.value);
        });

        // Search toggle
        var searchBtn = panel.querySelector('.ai-tag-search-toggle');
        searchBtn.addEventListener('click', function () {
            // Check if web search is actually configured
            if (!M.webSearch || !M.webSearch.isSearchEnabled || !M.webSearch.isSearchEnabled()) {
                if (M.showToast) M.showToast('🔍 Web Search not configured — set up a search API key in the AI panel first', 'warning');
                return;
            }
            threadSearchEnabled = !threadSearchEnabled;
            searchBtn.classList.toggle('active', threadSearchEnabled);
            if (M.showToast) M.showToast(threadSearchEnabled ? '🌐 Web Search enabled for this conversation' : '🌐 Web Search disabled', 'info');
        });

        // Attach
        var attachBtn = panel.querySelector('.ai-tag-attach-btn');
        var attachInput = panel.querySelector('.ai-tag-attach-input');
        attachBtn.addEventListener('click', function () { attachInput.click(); });
        attachInput.addEventListener('change', function () {
            threadAttachments = [];
            Array.from(this.files).forEach(function (file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    threadAttachments.push({
                        type: file.type.startsWith('image/') ? 'image' : 'file',
                        mimeType: file.type, name: file.name,
                        data: e.target.result.split(',')[1] || ''
                    });
                };
                reader.readAsDataURL(file);
            });
            if (M.showToast) M.showToast('📎 ' + this.files.length + ' file(s) attached', 'success');
        });

        // Send
        var textarea = panel.querySelector('.ai-tag-thread-input textarea');
        var sendBtn = panel.querySelector('.ai-tag-thread-send');

        sendBtn.addEventListener('click', function () { sendThreadMessage(textarea); });
        textarea.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendThreadMessage(textarea);
            }
        });
        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 80) + 'px';
        });

        setTimeout(function () { textarea.focus(); }, 150);
    }

    function sendThreadMessage(textarea) {
        var text = textarea.value.trim();
        if (!text || threadPanelStreaming) return;
        if (!M.isCurrentModelReady || !M.isCurrentModelReady()) {
            // Auto-load the selected model instead of just showing a toast
            var modelId = M.getCurrentAiModel ? M.getCurrentAiModel() : '';
            if (modelId && M.switchToModel) {
                if (M.showToast) M.showToast('⏳ Loading AI model — your question will be sent automatically', 'info');
                M.switchToModel(modelId);
                // Poll for readiness and auto-retry
                var retryCount = 0;
                var maxRetries = 60; // 60 × 2s = 120s max wait
                var retryTimer = setInterval(function () {
                    retryCount++;
                    if (M.isCurrentModelReady && M.isCurrentModelReady()) {
                        clearInterval(retryTimer);
                        // Re-set the text in case user typed more while waiting
                        if (!textarea.value.trim()) textarea.value = text;
                        sendThreadMessage(textarea);
                    } else if (retryCount >= maxRetries) {
                        clearInterval(retryTimer);
                        if (M.showToast) M.showToast('❌ Model failed to load. Try switching models.', 'error');
                    }
                }, 2000);
            } else {
                if (M.showToast) M.showToast('🔒 Select and load an AI model first', 'warning');
            }
            return;
        }

        var tagData = threadPanelTagData;
        if (!tagData) return;

        textarea.value = '';
        textarea.style.height = 'auto';

        var messagesArea = activeThreadPanel.querySelector('.ai-tag-thread-messages');

        // Remove welcome message if present
        var welcome = messagesArea.querySelector('div[style*="text-align:center"]');
        if (welcome) welcome.remove();

        // Add user message
        var userMsg = document.createElement('div');
        userMsg.className = 'ai-tag-thread-msg ai-tag-thread-msg--user';
        userMsg.innerHTML = '<span class="ai-tag-msg-label">You</span>' + escapeHtml(text);
        messagesArea.appendChild(userMsg);

        // Add AI streaming bubble
        var aiMsg = document.createElement('div');
        aiMsg.className = 'ai-tag-thread-msg ai-tag-thread-msg--ai ai-tag-thread-msg--streaming';
        aiMsg.innerHTML = '<span class="ai-tag-msg-label">AI</span>';
        messagesArea.appendChild(aiMsg);
        messagesArea.scrollTop = messagesArea.scrollHeight;

        threadPanelStreaming = true;
        var sendBtn = activeThreadPanel.querySelector('.ai-tag-thread-send');
        if (sendBtn) sendBtn.disabled = true;

        // Build context
        var contextPromise;
        if (threadSearchEnabled && M.webSearch && M.webSearch.isSearchEnabled && M.webSearch.isSearchEnabled()) {
            contextPromise = M.webSearch.performMultiSearch(text).then(function (results) {
                return buildTagContext(tagData, results);
            }).catch(function () {
                return buildTagContext(tagData, null);
            });
        } else {
            contextPromise = Promise.resolve(buildTagContext(tagData, null));
        }

        contextPromise.then(function (context) {
            return M.requestAiTask({
                taskType: 'qa',
                context: context,
                userPrompt: text,
                enableThinking: false,
                onToken: function (token, accumulated) {
                    if (!activeThreadPanel) return;
                    aiMsg.innerHTML = '<span class="ai-tag-msg-label">AI</span>' + escapeHtml(accumulated);
                    messagesArea.scrollTop = messagesArea.scrollHeight;
                },
                attachments: threadAttachments
            });
        }).then(function (fullResponse) {
            threadPanelStreaming = false;
            if (sendBtn) sendBtn.disabled = false;
            aiMsg.classList.remove('ai-tag-thread-msg--streaming');
            aiMsg.innerHTML = '<span class="ai-tag-msg-label">AI</span>' + escapeHtml(fullResponse);

            // Update tag data
            tagData.thread.push({ role: 'user', content: text });
            tagData.thread.push({ role: 'assistant', content: fullResponse });

            // Save to editor
            if (tagData._isNew) {
                delete tagData._isNew;
                insertTagIntoEditor(serializeAiTag(tagData), tagData.anchor);
            } else {
                updateTagInEditor(tagData.id, serializeAiTag(tagData));
            }
            // Don't re-render here — it would destroy the panel
        }).catch(function (err) {
            threadPanelStreaming = false;
            if (sendBtn) sendBtn.disabled = false;
            aiMsg.classList.remove('ai-tag-thread-msg--streaming');
            aiMsg.innerHTML = '<span class="ai-tag-msg-label">AI</span><span style="color:#f87171">Error: ' + escapeHtml(err.message) + '</span>';
        });
    }

    function buildTagContext(tagData, searchResults) {
        var fullDoc = M.markdownEditor.value;
        var cleanDoc = fullDoc.replace(TAG_REGEX, '').trim();
        var anchor = tagData.anchor || '';

        // Extract ~10-15% of the document centered around the selected passage
        var surroundingContext = '';
        if (anchor && cleanDoc.length > 0) {
            var anchorIdx = cleanDoc.indexOf(anchor);
            if (anchorIdx === -1) {
                // Fuzzy match: try first 30 chars of anchor
                var shortAnchor = anchor.substring(0, 30);
                anchorIdx = cleanDoc.indexOf(shortAnchor);
            }
            if (anchorIdx !== -1) {
                var windowSize = Math.max(Math.floor(cleanDoc.length * 0.12), 500); // ~12% or min 500 chars
                var start = Math.max(0, anchorIdx - windowSize);
                var end = Math.min(cleanDoc.length, anchorIdx + anchor.length + windowSize);
                // Snap to paragraph boundaries
                if (start > 0) {
                    var paraStart = cleanDoc.lastIndexOf('\n\n', start);
                    if (paraStart !== -1 && paraStart > start - 200) start = paraStart + 2;
                }
                if (end < cleanDoc.length) {
                    var paraEnd = cleanDoc.indexOf('\n\n', end);
                    if (paraEnd !== -1 && paraEnd < end + 200) end = paraEnd;
                }
                surroundingContext = cleanDoc.substring(start, end).trim();
                if (start > 0) surroundingContext = '...\n' + surroundingContext;
                if (end < cleanDoc.length) surroundingContext = surroundingContext + '\n...';
            } else {
                // Anchor not found — fall back to full doc (capped)
                surroundingContext = cleanDoc.substring(0, 4000);
            }
        } else {
            surroundingContext = cleanDoc.substring(0, 4000);
        }

        var context = '[Document Context]\n' + surroundingContext +
            '\n\n[Selected Passage]\n"' + anchor + '"';

        if (searchResults && searchResults.length > 0 && M.webSearch && M.webSearch.formatResultsForLLM) {
            context += '\n\n[Web Search Results]\n' + M.webSearch.formatResultsForLLM(searchResults);
        }

        if (tagData.thread && tagData.thread.length > 0) {
            context += '\n\n[Previous Discussion on this passage]';
            tagData.thread.forEach(function (turn) {
                context += '\n' + (turn.role === 'user' ? 'Q' : 'A') + ': ' + turn.content;
            });
        }

        return context;
    }

    function saveAndCloseThread() {
        if (threadPanelTagData && threadPanelTagData.thread && threadPanelTagData.thread.length > 0) {
            // Already saved incrementally in sendThreadMessage
        }
        closeThreadPanel();
        if (M.renderMarkdown) M.renderMarkdown();
    }

    // ========================================
    // PANEL POSITIONING & OVERLAY
    // ========================================

    function positionPanel(panel, anchorEl) {
        if (anchorEl) {
            var rect = anchorEl.getBoundingClientRect();
            var panelWidth = 400;
            var panelHeight = 520;
            var left = Math.min(rect.right + 8, window.innerWidth - panelWidth - 16);
            var top = Math.min(rect.top - 20, window.innerHeight - panelHeight - 16);
            if (left < 16) left = 16;
            if (top < 16) top = 16;
            panel.style.left = left + 'px';
            panel.style.top = top + 'px';
        } else {
            // Center on screen
            panel.style.left = Math.max(16, (window.innerWidth - 400) / 2) + 'px';
            panel.style.top = Math.max(16, (window.innerHeight - 520) / 2) + 'px';
        }
    }

    function createOverlay() {
        closeOverlay();
        var overlay = document.createElement('div');
        overlay.className = 'ai-tag-thread-overlay';
        overlay.addEventListener('click', function () {
            saveAndCloseThread();
        });
        document.body.appendChild(overlay);
        activeThreadOverlay = overlay;
    }

    function closeOverlay() {
        if (activeThreadOverlay) {
            activeThreadOverlay.remove();
            activeThreadOverlay = null;
        }
    }

    function closeThreadPanel() {
        if (activeThreadPanel) {
            activeThreadPanel.remove();
            activeThreadPanel = null;
        }
        closeOverlay();
        threadPanelTagData = null;
        threadPanelStreaming = false;
        threadAttachments = [];
    }

    // ========================================
    // HELPERS
    // ========================================

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

})(window.MDView);
