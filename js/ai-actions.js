// ============================================
// ai-actions.js — Quick Action Chips, Context Menu, Ctrl+Space
// Extracted from ai-assistant.js for modularity
// ============================================
(function (M) {
    'use strict';

    var _ai = M._ai;
    var markdownEditor = M.markdownEditor;
    var previewPane = M.previewPane;

    // --- DOM elements ---
    var aiInput = document.getElementById('ai-input');
    var aiContextMenu = document.getElementById('ai-context-menu');
    var aiPanel = document.getElementById('ai-panel');
    var aiPanelOverlay = document.getElementById('ai-panel-overlay');
    var aiToggleBtn = document.getElementById('ai-toggle-button');

    // --- Quick Action Chips ---
    document.querySelectorAll('.ai-action-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
            var action = this.dataset.action;
            var savedSelection = _ai.savedSelection || { start: 0, end: 0 };
            // Check editor selection first, then preview selection
            var selectedText = markdownEditor.value.substring(savedSelection.start, savedSelection.end);
            if (!selectedText) {
                var sel = window.getSelection();
                selectedText = sel ? sel.toString().trim() : '';
            }
            var editorContent = markdownEditor.value;

            var isReady = _ai.isCurrentModelReady();
            if (!isReady) {
                if (M.showModelDownloadPopup) M.showModelDownloadPopup();
                return;
            }

            // Ensure panel is open
            if (!_ai.panelOpen) M.openAiPanel();

            switch (action) {
                case 'summarize':
                case 'expand':
                case 'rephrase':
                case 'grammar':
                case 'polish':
                case 'formalize':
                case 'elaborate':
                case 'shorten': {
                    if (!editorContent.trim() && !selectedText.trim()) {
                        _ai.addAiMessage('Please add some text in the editor first.');
                        return;
                    }
                    if (selectedText) {
                        _ai.addAiMessage('Using selected text (' + selectedText.length + ' chars)', 'user');
                        _ai.sendToAi(action, selectedText, null);
                    } else if (editorContent.length > 1500) {
                        _ai.processDocumentInChunks(action, editorContent);
                    } else {
                        _ai.addAiMessage('Using entire document (' + editorContent.length + ' chars)', 'user');
                        _ai.sendToAi(action, editorContent, null);
                    }
                    break;
                }
                case 'explain':
                case 'simplify':
                    if (!selectedText) {
                        _ai.addAiMessage('Please select some text in the editor to explain or simplify.');
                        return;
                    }
                    _ai.sendToAi(action, selectedText, 'Please ' + action + ' this text.');
                    break;
                case 'autocomplete': {
                    var textBeforeCursor = editorContent.substring(0, savedSelection.start);
                    if (!textBeforeCursor.trim()) {
                        _ai.addAiMessage('Place your cursor after some text in the editor to auto-complete.');
                        return;
                    }
                    _ai.sendToAi('autocomplete', textBeforeCursor, null);
                    break;
                }
                case 'markdown':
                    aiInput.placeholder = 'Describe what markdown to generate...';
                    aiInput.focus();
                    break;
            }
        });
    });

    // --- Ctrl+Space for Auto-Complete ---
    markdownEditor.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
            e.preventDefault();
            var isReady = _ai.isCurrentModelReady();
            if (!isReady) {
                if (M.showModelDownloadPopup) M.showModelDownloadPopup();
                return;
            }
            if (!_ai.panelOpen) M.openAiPanel();

            var textBeforeCursor = markdownEditor.value.substring(0, markdownEditor.selectionStart);
            if (textBeforeCursor.trim()) {
                _ai.sendToAi('autocomplete', textBeforeCursor, null);
            }
        }
    });

    // --- Unified Selection Menu (2-step trigger) ---
    // Step 1: mouseup → tiny ✨ pill at selection edge (non-intrusive, auto-hides 3s)
    // Step 2: click pill → pane-aware context menu (editor = writing tools, preview = study tools)
    var contextMenuTimeout = null;
    var savedContextText = '';
    var selectionTrigger = null;

    function createTrigger() {
        if (selectionTrigger) return selectionTrigger;
        selectionTrigger = document.createElement('button');
        selectionTrigger.id = 'ai-selection-trigger';
        selectionTrigger.className = 'ai-selection-trigger';
        selectionTrigger.innerHTML = '<i class="bi bi-stars"></i>';
        selectionTrigger.title = 'AI Actions & Annotations';
        document.body.appendChild(selectionTrigger);
        return selectionTrigger;
    }

    function showSelectionTrigger(e, selectedText, isPreview) {
        if (!selectedText || selectedText.length < 3) { hideSelectionTrigger(); return; }

        var trigger = createTrigger();
        trigger.style.left = Math.min(e.clientX + 8, window.innerWidth - 40) + 'px';
        trigger.style.top = Math.min(e.clientY - 16, window.innerHeight - 40) + 'px';
        trigger.style.display = 'flex';
        trigger.className = 'ai-selection-trigger ai-trigger-appear';
        trigger._text = selectedText;
        trigger._isPreview = isPreview;
        trigger._pos = { x: e.clientX, y: e.clientY };

        // Auto-hide after 3 seconds
        clearTimeout(trigger._timer);
        trigger._timer = setTimeout(hideSelectionTrigger, 3000);

        // Click → expand context menu
        trigger.onclick = function (ev) {
            ev.stopPropagation();
            clearTimeout(trigger._timer);
            hideSelectionTrigger();
            showContextMenu(trigger._pos, trigger._text, trigger._isPreview);
        };
    }

    function hideSelectionTrigger() {
        if (selectionTrigger) selectionTrigger.style.display = 'none';
    }

    function showContextMenu(pos, selectedText, isPreview) {
        savedContextText = selectedText;

        // Show/hide pane-specific sections
        var editorSection = aiContextMenu.querySelector('.ai-ctx-editor-section');
        var annotateSection = aiContextMenu.querySelector('.ai-ctx-annotate-section');
        if (editorSection) editorSection.style.display = isPreview ? 'none' : '';
        if (annotateSection) annotateSection.style.display = isPreview ? '' : 'none';

        var menuWidth = isPreview ? 260 : 280;
        var menuHeight = isPreview ? 200 : 280;
        aiContextMenu.style.left = Math.min(pos.x, window.innerWidth - menuWidth) + 'px';
        aiContextMenu.style.top = Math.min(pos.y - 10, window.innerHeight - menuHeight) + 'px';
        aiContextMenu.style.display = 'flex';
    }

    // Editor text selection → trigger pill
    markdownEditor.addEventListener('mouseup', function (e) {
        clearTimeout(contextMenuTimeout);
        contextMenuTimeout = setTimeout(function () {
            var selectedText = markdownEditor.value.substring(
                markdownEditor.selectionStart,
                markdownEditor.selectionEnd
            );
            showSelectionTrigger(e, selectedText, false);
        }, 300);
    });

    // Preview pane text selection → trigger pill
    if (previewPane) {
        previewPane.addEventListener('mouseup', function (e) {
            // Don't trigger on pill clicks or thread panel
            if (e.target.closest('.ai-tag-pill') || e.target.closest('.ai-tag-thread-panel')) return;
            clearTimeout(contextMenuTimeout);
            contextMenuTimeout = setTimeout(function () {
                var selection = window.getSelection();
                var selectedText = selection ? selection.toString().trim() : '';
                showSelectionTrigger(e, selectedText, true);
            }, 300);
        });
    }

    // Hide context menu on click elsewhere
    document.addEventListener('mousedown', function (e) {
        if (aiContextMenu && aiContextMenu.style.display !== 'none' && !aiContextMenu.contains(e.target)) {
            aiContextMenu.style.display = 'none';
        }
        // Also hide trigger if clicking elsewhere
        if (selectionTrigger && selectionTrigger.style.display !== 'none' && e.target !== selectionTrigger && !selectionTrigger.contains(e.target)) {
            hideSelectionTrigger();
        }
    });

    // Context menu: editor AI actions → AI panel
    function handleContextAction(action) {
        clearTimeout(contextMenuTimeout);
        aiContextMenu.style.display = 'none';

        if (!savedContextText) return;

        // Open panel if needed
        if (!_ai.panelOpen) {
            aiPanel.style.display = 'flex';
            aiPanelOverlay.classList.add('active');
            void aiPanel.offsetWidth;
            aiPanel.classList.add('ai-panel-open');
            aiToggleBtn.classList.add('ai-active');
            _ai.panelOpen = true;
            document.body.classList.add('ai-panel-active');
        }

        if (['summarize', 'expand', 'rephrase', 'grammar', 'explain', 'simplify', 'polish', 'formalize', 'elaborate', 'shorten'].includes(action)) {
            _ai.sendToAi(action, savedContextText, null);
        } else {
            _ai.sendToAi(action, savedContextText, 'Please ' + action + ' this text.');
        }
    }

    // Bind editor section buttons (writing tools → AI panel)
    var editorBtns = aiContextMenu.querySelectorAll('.ai-ctx-editor-section .ai-ctx-btn');
    editorBtns.forEach(function (btn) {
        btn.addEventListener('mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var action = this.dataset.action;
            if (action) {
                setTimeout(function () { handleContextAction(action); }, 0);
            }
        });
    });

    // Bind annotate section buttons (study tools → inline pills)
    var annotateBtns = aiContextMenu.querySelectorAll('.ai-ctx-annotate');
    annotateBtns.forEach(function (btn) {
        btn.addEventListener('mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var action = this.dataset.action;
            aiContextMenu.style.display = 'none';
            if (action && M.handleAiTagAction) {
                setTimeout(function () { M.handleAiTagAction(action, savedContextText); }, 0);
            }
        });
    });

})(window.MDView);
