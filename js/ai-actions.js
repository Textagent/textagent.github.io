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
                M.openAiPanel();
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
                M.openAiPanel();
                return;
            }
            if (!_ai.panelOpen) M.openAiPanel();

            var textBeforeCursor = markdownEditor.value.substring(0, markdownEditor.selectionStart);
            if (textBeforeCursor.trim()) {
                _ai.sendToAi('autocomplete', textBeforeCursor, null);
            }
        }
    });

    // --- Context Menu (on text selection in editor OR preview) ---
    var contextMenuTimeout = null;
    var savedContextText = '';

    // Editor text selection
    markdownEditor.addEventListener('mouseup', function (e) {
        clearTimeout(contextMenuTimeout);
        contextMenuTimeout = setTimeout(function () {
            var selectedText = markdownEditor.value.substring(
                markdownEditor.selectionStart,
                markdownEditor.selectionEnd
            );

            var isReady = _ai.isCurrentModelReady();
            if (selectedText && selectedText.length > 2 && isReady) {
                savedContextText = selectedText;
                aiContextMenu.style.left = Math.min(e.clientX, window.innerWidth - 180) + 'px';
                aiContextMenu.style.top = Math.min(e.clientY - 10, window.innerHeight - 250) + 'px';
                aiContextMenu.style.display = 'flex';
            } else {
                aiContextMenu.style.display = 'none';
            }
        }, 300);
    });

    // Preview pane text selection
    if (previewPane) {
        previewPane.addEventListener('mouseup', function (e) {
            clearTimeout(contextMenuTimeout);
            contextMenuTimeout = setTimeout(function () {
                var selection = window.getSelection();
                var selectedText = selection ? selection.toString().trim() : '';

                var isReady = _ai.isCurrentModelReady();
                if (selectedText && selectedText.length > 2 && isReady) {
                    savedContextText = selectedText;
                    aiContextMenu.style.left = Math.min(e.clientX, window.innerWidth - 180) + 'px';
                    aiContextMenu.style.top = Math.min(e.clientY - 10, window.innerHeight - 250) + 'px';
                    aiContextMenu.style.display = 'flex';
                } else {
                    aiContextMenu.style.display = 'none';
                }
            }, 300);
        });
    }

    // Hide context menu on click elsewhere
    document.addEventListener('mousedown', function (e) {
        if (aiContextMenu && aiContextMenu.style.display !== 'none' && !aiContextMenu.contains(e.target)) {
            aiContextMenu.style.display = 'none';
        }
    });

    // Context menu actions
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

    var ctxBtns = aiContextMenu.querySelectorAll('.ai-ctx-btn');
    ctxBtns.forEach(function (btn) {
        btn.addEventListener('mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var action = this.dataset.action;
            if (action) {
                setTimeout(function () { handleContextAction(action); }, 0);
            }
        });
    });

})(window.MDView);
