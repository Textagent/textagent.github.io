// ============================================
// editor-features.js — Formatting, Undo/Redo, Find/Replace, Focus Mode, Word Wrap, Anchors, Callouts, Footnotes
// ============================================
(function (M) {
    'use strict';

    // ========================================
    // HEADING ANCHOR LINKS
    // ========================================
    M.addHeadingAnchors = function (container) {
        var headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        var usedIds = new Set();
        headings.forEach(function (heading) {
            if (heading.querySelector('.heading-anchor')) return;
            var id = heading.id;
            if (!id) {
                id = heading.textContent.trim().toLowerCase()
                    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            }
            var uniqueId = id;
            var counter = 1;
            while (usedIds.has(uniqueId)) { uniqueId = id + '-' + counter; counter++; }
            usedIds.add(uniqueId);
            heading.id = uniqueId;
            var anchor = document.createElement('a');
            anchor.className = 'heading-anchor';
            anchor.href = '#' + uniqueId;
            anchor.textContent = '🔗';
            anchor.setAttribute('aria-label', 'Link to ' + heading.textContent);
            heading.prepend(anchor);
        });
    };

    // ========================================
    // CALLOUTS / ADMONITIONS
    // ========================================
    var CALLOUT_CONFIG = {
        NOTE: { icon: 'bi-info-circle-fill', cls: 'note' },
        TIP: { icon: 'bi-lightbulb-fill', cls: 'tip' },
        IMPORTANT: { icon: 'bi-exclamation-diamond-fill', cls: 'important' },
        WARNING: { icon: 'bi-exclamation-triangle-fill', cls: 'warning' },
        CAUTION: { icon: 'bi-x-octagon-fill', cls: 'caution' }
    };

    M.processCallouts = function (container) {
        var blockquotes = container.querySelectorAll('blockquote');
        blockquotes.forEach(function (bq) {
            var firstP = bq.querySelector('p');
            if (!firstP) return;
            var text = firstP.innerHTML;
            var match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i);
            if (!match) return;
            var type = match[1].toUpperCase();
            var config = CALLOUT_CONFIG[type];
            if (!config) return;
            firstP.innerHTML = text.replace(match[0], '');
            var callout = document.createElement('div');
            callout.className = 'markdown-callout callout-' + config.cls;
            var title = document.createElement('div');
            title.className = 'callout-title';
            title.innerHTML = '<i class="bi ' + config.icon + '"></i> ' + type.charAt(0) + type.slice(1).toLowerCase();
            callout.appendChild(title);
            while (bq.firstChild) { callout.appendChild(bq.firstChild); }
            bq.replaceWith(callout);
        });
    };

    // ========================================
    // FOOTNOTES
    // ========================================
    M.processFootnotes = function (container, rawMarkdown) {
        var defRegex = /^\[\^(\w+)\]:\s*(.+)$/gm;
        var definitions = {};
        var defMatch;
        while ((defMatch = defRegex.exec(rawMarkdown)) !== null) {
            definitions[defMatch[1]] = defMatch[2];
        }
        if (Object.keys(definitions).length === 0) return;

        var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        var textNodes = [];
        var node;
        while ((node = walker.nextNode())) {
            if (node.nodeValue.includes('[^')) {
                var parent = node.parentNode;
                var isInCode = false;
                while (parent && parent !== container) {
                    if (parent.tagName === 'PRE' || parent.tagName === 'CODE') { isInCode = true; break; }
                    parent = parent.parentNode;
                }
                if (!isInCode) textNodes.push(node);
            }
        }

        var footnoteIndex = 0;
        var usedFootnotes = [];
        var usedFootnoteIds = new Set();

        textNodes.forEach(function (textNode) {
            var text = textNode.nodeValue;
            var refRegex = /\[\^(\w+)\]/g;
            var match;
            var lastIndex = 0;
            var fragment = document.createDocumentFragment();
            var hasRefs = false;

            while ((match = refRegex.exec(text)) !== null) {
                var id = match[1];
                if (!definitions[id]) continue;
                hasRefs = true;
                var fnIndex;
                if (usedFootnoteIds.has(id)) {
                    fnIndex = usedFootnotes.find(function (fn) { return fn.id === id; }).index;
                } else {
                    footnoteIndex++;
                    fnIndex = footnoteIndex;
                    usedFootnoteIds.add(id);
                    usedFootnotes.push({ id: id, index: fnIndex, content: definitions[id] });
                }
                if (match.index > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
                }
                var sup = document.createElement('a');
                sup.className = 'footnote-ref';
                sup.href = '#fn-' + id;
                sup.id = 'fnref-' + id + '-' + fnIndex;
                sup.textContent = '[' + fnIndex + ']';
                sup.title = definitions[id];
                fragment.appendChild(sup);
                lastIndex = refRegex.lastIndex;
            }

            if (hasRefs) {
                if (lastIndex < text.length) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                }
                textNode.parentNode.replaceChild(fragment, textNode);
            }
        });

        container.querySelectorAll('p').forEach(function (p) {
            if (/^\[\^\w+\]:\s*.+/.test(p.textContent.trim())) { p.remove(); }
        });

        if (usedFootnotes.length > 0) {
            var section = document.createElement('section');
            section.className = 'footnotes-section';
            section.innerHTML = '<div class="footnote-title">Footnotes</div>';
            usedFootnotes.forEach(function (fn) {
                var item = document.createElement('div');
                item.className = 'footnote-item';
                item.id = 'fn-' + fn.id;
                item.innerHTML = '<span class="footnote-number">' + fn.index + '.</span> <span>' + fn.content + ' <a class="footnote-backref" href="#fnref-' + fn.id + '" title="Back to reference">↩</a></span>';
                section.appendChild(item);
            });
            container.appendChild(section);
        }
    };

    // ========================================
    // IMAGE PASTE FROM CLIPBOARD
    // ========================================
    M.markdownEditor.addEventListener('paste', function (e) {
        var items = e.clipboardData && e.clipboardData.items;
        if (!items) return;
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image/') === 0) {
                e.preventDefault();
                var blob = items[i].getAsFile();
                var reader = new FileReader();
                reader.onload = function (event) {
                    var base64 = event.target.result;
                    insertAtCursor('![pasted image](' + base64 + ')');
                };
                reader.readAsDataURL(blob);
                return;
            }
        }
    });

    // ========================================
    // FORMATTING TOOLBAR HELPERS
    // ========================================
    function wrapSelection(before, after, placeholder) {
        var start = M.markdownEditor.selectionStart;
        var end = M.markdownEditor.selectionEnd;
        var text = M.markdownEditor.value;
        var selected = text.substring(start, end) || placeholder || '';
        var newText = text.substring(0, start) + before + selected + after + text.substring(end);
        M.markdownEditor.value = newText;
        if (start === end && placeholder) {
            M.markdownEditor.selectionStart = start + before.length;
            M.markdownEditor.selectionEnd = start + before.length + placeholder.length;
        } else {
            M.markdownEditor.selectionStart = start + before.length;
            M.markdownEditor.selectionEnd = start + before.length + selected.length;
        }
        M.markdownEditor.focus();
        M.markdownEditor.dispatchEvent(new Event('input'));
    }

    function insertAtCursor(text) {
        var start = M.markdownEditor.selectionStart;
        var end = M.markdownEditor.selectionEnd;
        var value = M.markdownEditor.value;
        M.markdownEditor.value = value.substring(0, start) + text + value.substring(end);
        M.markdownEditor.selectionStart = M.markdownEditor.selectionEnd = start + text.length;
        M.markdownEditor.focus();
        M.markdownEditor.dispatchEvent(new Event('input'));
    }
    M.insertAtCursor = insertAtCursor;

    function insertLinePrefix(prefix) {
        var start = M.markdownEditor.selectionStart;
        var end = M.markdownEditor.selectionEnd;
        var text = M.markdownEditor.value;
        var lineStart = text.lastIndexOf('\n', start - 1) + 1;
        var lineEnd = text.indexOf('\n', end);
        var actualEnd = lineEnd === -1 ? text.length : lineEnd;
        var selectedLines = text.substring(lineStart, actualEnd);
        var prefixed = selectedLines.split('\n').map(function (line) { return prefix + line; }).join('\n');
        M.markdownEditor.value = text.substring(0, lineStart) + prefixed + text.substring(actualEnd);
        M.markdownEditor.selectionStart = lineStart;
        M.markdownEditor.selectionEnd = lineStart + prefixed.length;
        M.markdownEditor.focus();
        M.markdownEditor.dispatchEvent(new Event('input'));
    }

    // --- Custom Undo/Redo Stack ---
    var undoStack = [];
    var redoStack = [];
    var MAX_UNDO_HISTORY = 100;
    var lastUndoSnapshot = M.markdownEditor.value;

    function pushUndoState() {
        var currentValue = M.markdownEditor.value;
        if (currentValue === lastUndoSnapshot) return;
        undoStack.push(lastUndoSnapshot);
        if (undoStack.length > MAX_UNDO_HISTORY) undoStack.shift();
        redoStack.length = 0;
        lastUndoSnapshot = currentValue;
    }

    function performUndo() {
        if (undoStack.length === 0) return;
        redoStack.push(M.markdownEditor.value);
        var prev = undoStack.pop();
        M.markdownEditor.value = prev;
        lastUndoSnapshot = prev;
        M.markdownEditor.dispatchEvent(new Event('input'));
    }

    function performRedo() {
        if (redoStack.length === 0) return;
        undoStack.push(M.markdownEditor.value);
        var next = redoStack.pop();
        M.markdownEditor.value = next;
        lastUndoSnapshot = next;
        M.markdownEditor.dispatchEvent(new Event('input'));
    }

    var _undoDebounceTimer = null;
    M.markdownEditor.addEventListener('input', function () {
        clearTimeout(_undoDebounceTimer);
        _undoDebounceTimer = setTimeout(pushUndoState, 500);
    });

    // --- Formatting toolbar action handler ---
    var FORMATTING_ACTIONS = {
        bold: function () { wrapSelection('**', '**', 'bold text'); },
        italic: function () { wrapSelection('*', '*', 'italic text'); },
        strikethrough: function () { wrapSelection('~~', '~~', 'strikethrough'); },
        heading: function () { insertLinePrefix('## '); },
        link: function () { wrapSelection('[', '](url)', 'link text'); },
        image: function () { insertAtCursor('![alt text](image-url)'); },
        code: function () { wrapSelection('`', '`', 'code'); },
        codeblock: function () { wrapSelection('\n```\n', '\n```\n', 'code block'); },
        ul: function () { insertLinePrefix('- '); },
        ol: function () { insertLinePrefix('1. '); },
        tasklist: function () { insertLinePrefix('- [ ] '); },
        quote: function () { insertLinePrefix('> '); },
        hr: function () { insertAtCursor('\n---\n'); },
        table: function () { insertAtCursor('\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n'); },
        undo: function () { M.markdownEditor.focus(); performUndo(); },
        redo: function () { M.markdownEditor.focus(); performRedo(); }
    };

    document.querySelectorAll('.fmt-btn[data-action]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var action = this.getAttribute('data-action');
            if (FORMATTING_ACTIONS[action]) FORMATTING_ACTIONS[action]();
        });
    });

    // --- Keyboard Shortcuts for Formatting ---
    M.markdownEditor.addEventListener('keydown', function (e) {
        if (!(e.ctrlKey || e.metaKey)) return;
        if (e.key === 'z' || e.key === 'Z') {
            e.preventDefault();
            if (e.shiftKey) performRedo(); else performUndo();
        } else if (e.key === 'y' || e.key === 'Y') {
            e.preventDefault(); performRedo();
        } else if (e.key === 'b' || e.key === 'B') {
            e.preventDefault(); FORMATTING_ACTIONS.bold();
        } else if (e.key === 'i' || e.key === 'I') {
            e.preventDefault(); FORMATTING_ACTIONS.italic();
        } else if (e.key === 'k' || e.key === 'K') {
            e.preventDefault();
            if (e.shiftKey) FORMATTING_ACTIONS.image(); else FORMATTING_ACTIONS.link();
        }
    });

    // ========================================
    // FIND & REPLACE (supports QAB inline + legacy bar)
    // ========================================
    var findReplaceBar = document.getElementById('find-replace-bar');
    var qabFindSection = document.getElementById('qab-find-section');

    // Resolve elements: prefer QAB inline if QAB is visible, else fall back to legacy bar
    function getActiveFindEls() {
        var qab = document.getElementById('quick-action-bar');
        var useQab = qab && qab.style.display !== 'none' && qabFindSection;
        return {
            findInput: document.getElementById(useQab ? 'qab-find-input' : 'find-input'),
            replaceInput: document.getElementById(useQab ? 'qab-replace-input' : 'replace-input'),
            matchCount: document.getElementById(useQab ? 'qab-match-count' : 'find-match-count'),
            regexToggle: document.getElementById(useQab ? 'qab-regex-toggle' : 'find-regex-toggle'),
            prevBtn: document.getElementById(useQab ? 'qab-find-prev' : 'find-prev'),
            nextBtn: document.getElementById(useQab ? 'qab-find-next' : 'find-next'),
            replaceOneBtn: document.getElementById(useQab ? 'qab-replace-one' : 'replace-one'),
            replaceAllBtn: document.getElementById(useQab ? 'qab-replace-all' : 'replace-all'),
            useQab: useQab
        };
    }

    var findMatches = [];
    var findCurrentIndex = -1;
    var findRegexMode = false;

    M.openFindBar = function () {
        var els = getActiveFindEls();
        if (els.useQab) {
            // Show inline find section in QAB
            qabFindSection.style.display = 'flex';
            var searchBtn = document.getElementById('qab-search');
            if (searchBtn) searchBtn.classList.add('qab-active');
        } else {
            findReplaceBar.style.display = 'block';
        }
        els.findInput.focus();
        var selected = M.markdownEditor.value.substring(M.markdownEditor.selectionStart, M.markdownEditor.selectionEnd);
        if (selected) els.findInput.value = selected;
        performFind();
    };

    M.closeFindBar = function () {
        var els = getActiveFindEls();
        if (els.useQab) {
            qabFindSection.style.display = 'none';
            var searchBtn = document.getElementById('qab-search');
            if (searchBtn) searchBtn.classList.remove('qab-active');
        } else {
            findReplaceBar.style.display = 'none';
        }
        findMatches = [];
        findCurrentIndex = -1;
        var mc = els.matchCount;
        if (mc) mc.textContent = '0 results';
        M.markdownEditor.focus();
    };

    function performFind() {
        var els = getActiveFindEls();
        var query = els.findInput ? els.findInput.value : '';
        if (!query) { findMatches = []; findCurrentIndex = -1; if (els.matchCount) els.matchCount.textContent = '0 results'; return; }
        var text = M.markdownEditor.value;
        findMatches = [];
        try {
            if (findRegexMode) {
                var regex = new RegExp(query, 'gi');
                var testStr = text.substring(0, Math.min(text.length, 1000));
                regex.exec(testStr);
                regex.lastIndex = 0;
                var m;
                while ((m = regex.exec(text)) !== null) {
                    findMatches.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
                    if (m[0].length === 0) regex.lastIndex++;
                    if (findMatches.length > 10000) break;
                }
            } else {
                var lowerQuery = query.toLowerCase();
                var lowerText = text.toLowerCase();
                var pos = 0;
                while ((pos = lowerText.indexOf(lowerQuery, pos)) !== -1) {
                    findMatches.push({ start: pos, end: pos + query.length, text: text.substring(pos, pos + query.length) });
                    pos += query.length;
                    if (findMatches.length > 10000) break;
                }
            }
        } catch (e) { if (els.matchCount) els.matchCount.textContent = 'Invalid regex'; return; }
        if (els.matchCount) els.matchCount.textContent = findMatches.length + ' result' + (findMatches.length !== 1 ? 's' : '');
        if (findMatches.length > 0) {
            var cursor = M.markdownEditor.selectionStart;
            findCurrentIndex = 0;
            for (var i = 0; i < findMatches.length; i++) {
                if (findMatches[i].start >= cursor) { findCurrentIndex = i; break; }
            }
            selectMatch(findCurrentIndex);
        } else { findCurrentIndex = -1; }
    }

    function selectMatch(index) {
        if (index < 0 || index >= findMatches.length) return;
        findCurrentIndex = index;
        var match = findMatches[index];
        M.markdownEditor.focus();
        M.markdownEditor.setSelectionRange(match.start, match.end);
        var lineHeight = parseInt(getComputedStyle(M.markdownEditor).lineHeight) || 20;
        var linesBefore = M.markdownEditor.value.substring(0, match.start).split('\n').length;
        M.markdownEditor.scrollTop = Math.max(0, (linesBefore - 3) * lineHeight);
        var els = getActiveFindEls();
        if (els.matchCount) els.matchCount.textContent = (index + 1) + ' / ' + findMatches.length;
    }

    function findNext() { if (findMatches.length === 0) return; selectMatch((findCurrentIndex + 1) % findMatches.length); }
    function findPrev() { if (findMatches.length === 0) return; selectMatch((findCurrentIndex - 1 + findMatches.length) % findMatches.length); }

    function replaceOne() {
        if (findCurrentIndex < 0 || findCurrentIndex >= findMatches.length) return;
        var els = getActiveFindEls();
        var match = findMatches[findCurrentIndex];
        var text = M.markdownEditor.value;
        M.markdownEditor.value = text.substring(0, match.start) + els.replaceInput.value + text.substring(match.end);
        M.markdownEditor.dispatchEvent(new Event('input'));
        performFind();
    }

    function escapeRegExpChars(string) { return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    function replaceAll() {
        var els = getActiveFindEls();
        var query = els.findInput ? els.findInput.value : '';
        var replacement = els.replaceInput ? els.replaceInput.value : '';
        if (!query) return;
        var text = M.markdownEditor.value;
        try {
            if (findRegexMode) { text = text.replace(new RegExp(query, 'gi'), replacement); }
            else { text = text.replace(new RegExp(escapeRegExpChars(query), 'gi'), replacement); }
        } catch (e) { return; }
        M.markdownEditor.value = text;
        M.markdownEditor.dispatchEvent(new Event('input'));
        performFind();
    }

    // Wire up BOTH sets of elements (legacy bar + QAB inline)
    function wireFind(prefix) {
        var fi = document.getElementById(prefix + 'find-input') || document.getElementById(prefix + '-find-input');
        var rt = document.getElementById(prefix + 'regex-toggle') || document.getElementById(prefix + '-regex-toggle');
        var fp = document.getElementById(prefix + 'find-prev') || document.getElementById(prefix + '-find-prev');
        var fn = document.getElementById(prefix + 'find-next') || document.getElementById(prefix + '-find-next');
        var ro = document.getElementById(prefix + 'replace-one') || document.getElementById(prefix + '-replace-one');
        var ra = document.getElementById(prefix + 'replace-all') || document.getElementById(prefix + '-replace-all');
        var ri = document.getElementById(prefix + 'replace-input') || document.getElementById(prefix + '-replace-input');
        if (fi) fi.addEventListener('input', performFind);
        if (fp) fp.addEventListener('click', findPrev);
        if (fn) fn.addEventListener('click', findNext);
        if (ro) ro.addEventListener('click', replaceOne);
        if (ra) ra.addEventListener('click', replaceAll);
        if (rt) rt.addEventListener('click', function () {
            findRegexMode = !findRegexMode;
            // Update both regex toggles
            var t1 = document.getElementById('find-regex-toggle');
            var t2 = document.getElementById('qab-regex-toggle');
            if (t1) t1.classList.toggle('active', findRegexMode);
            if (t2) t2.classList.toggle('active', findRegexMode);
            performFind();
        });
        if (fi) fi.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); if (e.shiftKey) findPrev(); else findNext(); }
            if (e.key === 'Escape') M.closeFindBar();
        });
        if (ri) ri.addEventListener('keydown', function (e) { if (e.key === 'Escape') M.closeFindBar(); });
    }

    // Wire legacy bar elements
    wireFind('find-');
    var findCloseBtn = document.getElementById('find-close');
    if (findCloseBtn) findCloseBtn.addEventListener('click', M.closeFindBar);

    // Wire QAB inline elements
    wireFind('qab-');

    // ========================================
    // WORD WRAP TOGGLE
    // ========================================
    var wordWrapBtn = document.getElementById('word-wrap-toggle');
    var wordWrapEnabled = localStorage.getItem('md-viewer-word-wrap') !== 'false';

    function applyWordWrap() {
        if (wordWrapEnabled) {
            M.markdownEditor.classList.remove('no-wrap');
            wordWrapBtn.classList.remove('wrap-active');
            wordWrapBtn.title = 'Word Wrap: On (click to disable)';
        } else {
            M.markdownEditor.classList.add('no-wrap');
            wordWrapBtn.classList.add('wrap-active');
            wordWrapBtn.title = 'Word Wrap: Off (click to enable)';
        }
    }
    applyWordWrap();
    wordWrapBtn.addEventListener('click', function () {
        wordWrapEnabled = !wordWrapEnabled;
        localStorage.setItem('md-viewer-word-wrap', wordWrapEnabled.toString());
        applyWordWrap();
    });

    // ========================================
    // FOCUS MODE
    // ========================================
    var focusModeBtn = document.getElementById('focus-mode-toggle');
    var focusModeEnabled = false;

    function getCurrentParagraphRange() {
        var text = M.markdownEditor.value;
        var cursor = M.markdownEditor.selectionStart;
        var start = text.lastIndexOf('\n\n', cursor - 1);
        start = start === -1 ? 0 : start + 2;
        var end = text.indexOf('\n\n', cursor);
        end = end === -1 ? text.length : end;
        return { start: start, end: end };
    }

    function applyFocusMode() {
        if (!focusModeEnabled) {
            document.body.classList.remove('focus-mode');
            focusModeBtn.classList.remove('focus-active');
            focusModeBtn.title = 'Focus Mode: Off';
            M.markdownEditor.style.color = '';
            var overlay = document.getElementById('focus-overlay');
            if (overlay) overlay.remove();
            return;
        }
        document.body.classList.add('focus-mode');
        focusModeBtn.classList.add('focus-active');
        focusModeBtn.title = 'Focus Mode: On (click to disable)';
        updateFocusHighlight();
    }

    function updateFocusHighlight() {
        if (!focusModeEnabled) return;
        var range = getCurrentParagraphRange();
        var text = M.markdownEditor.value;
        var computedStyle = getComputedStyle(M.markdownEditor);
        M.markdownEditor.style.color = 'rgba(128, 128, 128, 0.35)';
        var linesBeforeCursor = text.substring(0, range.start).split('\n').length;
        var linesInParagraph = text.substring(range.start, range.end).split('\n').length;
        var lineHeight = parseFloat(computedStyle.lineHeight) || 20;
        var paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        var overlay = document.getElementById('focus-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'focus-overlay';
            overlay.style.cssText = 'position:absolute;pointer-events:none;background-color:rgba(88,166,255,0.06);border-left:2px solid var(--accent-color);transition:top 0.1s ease,height 0.1s ease;z-index:1;';
            var editorPane = M.markdownEditor.closest('.editor-pane');
            if (editorPane) { editorPane.style.position = 'relative'; editorPane.appendChild(overlay); }
        }
        var top = paddingTop + (linesBeforeCursor - 1) * lineHeight - M.markdownEditor.scrollTop;
        overlay.style.top = Math.max(0, top) + 'px';
        overlay.style.height = (linesInParagraph * lineHeight) + 'px';
        overlay.style.left = '0';
        overlay.style.right = '0';
    }

    focusModeBtn.addEventListener('click', function () { focusModeEnabled = !focusModeEnabled; applyFocusMode(); });
    M.markdownEditor.addEventListener('click', updateFocusHighlight);
    M.markdownEditor.addEventListener('keyup', function (e) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace', 'Delete'].includes(e.key)) updateFocusHighlight();
    });
    M.markdownEditor.addEventListener('scroll', updateFocusHighlight);

})(window.MDView);
