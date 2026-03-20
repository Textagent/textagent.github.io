// ============================================
// composer.js — Compose Mode (Chat-style Markdown Builder)
// ============================================
(function (M) {
    'use strict';

    // ---- DOM Elements ----
    var overlay = document.getElementById('composer-overlay');
    var blocksContainer = document.getElementById('composer-blocks');
    var inputEl = document.getElementById('composer-input');
    var sendBtn = document.getElementById('composer-send');
    var emptyState = document.getElementById('composer-empty-state');
    var slashMenu = document.getElementById('composer-slash-menu');

    if (!overlay || !inputEl) return;

    var editIndex = -1; // -1 = append mode, >=0 = editing that line index

    // ---- Parse editor content into blocks ----
    function getBlocks() {
        var raw = M.markdownEditor.value;
        if (!raw.trim()) return [];
        // Split on double-newline to get logical blocks
        return raw.split(/\n\n+/).filter(function (b) { return b.trim().length > 0; });
    }

    function setBlocks(blocks) {
        M.markdownEditor.value = blocks.join('\n\n');
        M.markdownEditor.dispatchEvent(new Event('input'));
        // Explicitly re-render preview so compose split-view updates
        if (M.renderMarkdown) M.renderMarkdown();
    }

    // ---- Render block cards ----
    function renderBlocks() {
        // Remove existing block elements
        var existing = blocksContainer.querySelectorAll('.composer-block');
        existing.forEach(function (el) { el.remove(); });

        var blocks = getBlocks();

        if (blocks.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }
        if (emptyState) emptyState.style.display = 'none';

        blocks.forEach(function (text, i) {
            var card = document.createElement('div');
            card.className = 'composer-block';
            if (i === editIndex) card.classList.add('editing');
            // Detect AI/Image/Agent tags
            if (/\{\{(AI|Image|Agent|OCR|Translate|TTS|STT|Game):/.test(text)) {
                card.classList.add('ai-block');
            }
            card.textContent = text;

            // Actions
            var actions = document.createElement('div');
            actions.className = 'composer-block-actions';

            // Move up
            if (i > 0) {
                var upBtn = createActionBtn('bi-arrow-up', 'Move up');
                upBtn.onclick = function (e) { e.stopPropagation(); moveBlock(i, i - 1); };
                actions.appendChild(upBtn);
            }
            // Move down
            if (i < blocks.length - 1) {
                var downBtn = createActionBtn('bi-arrow-down', 'Move down');
                downBtn.onclick = function (e) { e.stopPropagation(); moveBlock(i, i + 1); };
                actions.appendChild(downBtn);
            }
            // Edit
            var editBtn = createActionBtn('bi-pencil', 'Edit');
            editBtn.onclick = function (e) { e.stopPropagation(); startEdit(i); };
            actions.appendChild(editBtn);
            // Delete
            var delBtn = createActionBtn('bi-trash3', 'Delete');
            delBtn.classList.add('delete-btn');
            delBtn.onclick = function (e) { e.stopPropagation(); deleteBlock(i); };
            actions.appendChild(delBtn);

            card.appendChild(actions);
            blocksContainer.appendChild(card);
        });

        // Scroll to bottom
        blocksContainer.scrollTop = blocksContainer.scrollHeight;
    }

    function createActionBtn(iconClass, title) {
        var btn = document.createElement('button');
        btn.className = 'composer-block-btn';
        btn.title = title;
        btn.innerHTML = '<i class="bi ' + iconClass + '"></i>';
        return btn;
    }

    // ---- Block operations ----
    function appendBlock(text) {
        var blocks = getBlocks();
        blocks.push(text);
        setBlocks(blocks);
        renderBlocks();
    }

    function replaceBlock(index, text) {
        var blocks = getBlocks();
        if (index >= 0 && index < blocks.length) {
            blocks[index] = text;
            setBlocks(blocks);
        }
        renderBlocks();
    }

    function deleteBlock(index) {
        var blocks = getBlocks();
        blocks.splice(index, 1);
        if (editIndex === index) { editIndex = -1; inputEl.value = ''; }
        setBlocks(blocks);
        renderBlocks();
    }

    function moveBlock(from, to) {
        var blocks = getBlocks();
        var item = blocks.splice(from, 1)[0];
        blocks.splice(to, 0, item);
        setBlocks(blocks);
        renderBlocks();
    }

    function startEdit(index) {
        var blocks = getBlocks();
        if (index >= 0 && index < blocks.length) {
            editIndex = index;
            inputEl.value = blocks[index];
            inputEl.focus();
            autoResize();
            renderBlocks();
        }
    }

    // ---- Send handler ----
    function send() {
        var text = inputEl.value;
        // Allow sending whitespace-only for intentional blank lines? No — trim.
        if (!text.trim()) return;

        if (editIndex >= 0) {
            replaceBlock(editIndex, text);
            editIndex = -1;
        } else {
            appendBlock(text);
        }

        inputEl.value = '';
        autoResize();
        slashMenu.classList.remove('active');
        inputEl.focus();
    }

    sendBtn.addEventListener('click', send);

    inputEl.addEventListener('keydown', function (e) {
        // Enter sends (Shift+Enter for newline within block)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
        // Escape cancels edit
        if (e.key === 'Escape') {
            slashMenu.classList.remove('active');
            if (editIndex >= 0) {
                editIndex = -1;
                inputEl.value = '';
                autoResize();
                renderBlocks();
            }
        }
    });

    // ---- Auto-resize input ----
    function autoResize() {
        inputEl.style.height = 'auto';
        inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
    }
    inputEl.addEventListener('input', autoResize);

    // ---- Slash menu ----
    inputEl.addEventListener('input', function () {
        if (this.value === '/') {
            slashMenu.classList.add('active');
            filterSlash('');
        } else if (this.value.startsWith('/') && this.value.length > 1) {
            filterSlash(this.value.substring(1).toLowerCase());
        } else {
            slashMenu.classList.remove('active');
        }
    });

    function filterSlash(query) {
        var items = slashMenu.querySelectorAll('.composer-slash-item');
        var anyVisible = false;
        items.forEach(function (item) {
            var label = (item.getAttribute('data-label') || '').toLowerCase();
            var show = !query || label.indexOf(query) >= 0;
            item.style.display = show ? '' : 'none';
            if (show) anyVisible = true;
        });
        if (!anyVisible) slashMenu.classList.remove('active');
    }

    // Slash menu item click
    slashMenu.addEventListener('click', function (e) {
        var item = e.target.closest('.composer-slash-item');
        if (!item) return;
        var insert = item.getAttribute('data-insert');
        var cursorOffset = parseInt(item.getAttribute('data-cursor') || '0');
        inputEl.value = insert;
        slashMenu.classList.remove('active');
        inputEl.focus();
        autoResize();
        if (cursorOffset) {
            var pos = inputEl.value.length + cursorOffset;
            inputEl.setSelectionRange(pos, pos);
        }
    });

    // Close slash menu on outside click
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.composer-input-bar')) {
            slashMenu.classList.remove('active');
        }
    });

    // ---- Chip bar ----
    document.querySelectorAll('.composer-chip[data-prefix]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var prefix = this.getAttribute('data-prefix');
            // If input starts with a different prefix, replace it
            inputEl.value = prefix + inputEl.value.replace(/^(#{1,6}\s|[-*]\s|\d+\.\s|- \[[ x]\]\s|> )/, '');
            inputEl.focus();
            autoResize();
        });
    });

    document.querySelectorAll('.composer-chip[data-wrap]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var w = this.getAttribute('data-wrap');
            var s = inputEl.selectionStart, e = inputEl.selectionEnd;
            var v = inputEl.value;
            if (s !== e) {
                inputEl.value = v.slice(0, s) + w + v.slice(s, e) + w + v.slice(e);
            } else {
                inputEl.value = v + w + w;
                var pos = inputEl.value.length - w.length;
                setTimeout(function () { inputEl.setSelectionRange(pos, pos); }, 0);
            }
            inputEl.focus();
            autoResize();
        });
    });

    document.querySelectorAll('.composer-chip[data-insert]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var insert = this.getAttribute('data-insert');
            var cursorOffset = parseInt(this.getAttribute('data-cursor') || '0');
            inputEl.value = insert;
            inputEl.focus();
            autoResize();
            if (cursorOffset) {
                var pos = inputEl.value.length + cursorOffset;
                inputEl.setSelectionRange(pos, pos);
            }
        });
    });

    // ---- Toggle Compose Mode (floating widget) ----
    var composeActive = false;
    var fab = document.getElementById('composer-fab');
    var closeBtn = document.getElementById('composer-close');
    var expandBtn = document.getElementById('composer-expand');

    // Toggle blocks panel expand/collapse
    if (expandBtn) {
        expandBtn.addEventListener('click', function () {
            overlay.classList.toggle('expanded');
        });
    }

    // ---- Shared position sync: FAB + Panel always move together ----
    function syncPanelToFab() {
        var fr = fab.getBoundingClientRect();
        overlay.style.left = fr.left + 'px';
        overlay.style.bottom = (window.innerHeight - fr.top + 8) + 'px';
        overlay.style.top = 'auto';
        overlay.style.right = 'auto';
    }

    function syncFabToPanel() {
        var pr = overlay.getBoundingClientRect();
        fab.style.left = pr.left + 'px';
        fab.style.top = (pr.bottom + 8) + 'px';
        fab.style.bottom = 'auto';
        fab.style.right = 'auto';
    }

    // ---- Make panel draggable by header (moves FAB too) ----
    var panelHeader = overlay.querySelector('.composer-panel-header');
    if (panelHeader) {
        var panelDragging = false, panelDragged = false;
        var pdStartX, pdStartY, panelStartX, panelStartY;

        panelHeader.addEventListener('mousedown', function (e) {
            if (e.target.closest('button')) return;
            panelDragging = true; panelDragged = false;
            pdStartX = e.clientX; pdStartY = e.clientY;
            var r = overlay.getBoundingClientRect();
            panelStartX = r.left; panelStartY = r.top;
            overlay.style.transition = 'none';
            fab.style.transition = 'none';
        });

        document.addEventListener('mousemove', function (e) {
            if (!panelDragging) return;
            var dx = e.clientX - pdStartX, dy = e.clientY - pdStartY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) panelDragged = true;
            if (!panelDragged) return;
            var nx = Math.max(0, Math.min(window.innerWidth - overlay.offsetWidth, panelStartX + dx));
            var ny = Math.max(0, Math.min(window.innerHeight - overlay.offsetHeight, panelStartY + dy));
            overlay.style.left = nx + 'px';
            overlay.style.top = ny + 'px';
            overlay.style.bottom = 'auto';
            overlay.style.right = 'auto';
            syncFabToPanel();
        });

        document.addEventListener('mouseup', function () {
            if (panelDragging) {
                panelDragging = false;
                overlay.style.transition = '';
                fab.style.transition = '';
            }
        });

        // Touch
        panelHeader.addEventListener('touchstart', function (e) {
            if (e.target.closest('button')) return;
            var t = e.touches[0];
            panelDragging = true; panelDragged = false;
            pdStartX = t.clientX; pdStartY = t.clientY;
            var r = overlay.getBoundingClientRect();
            panelStartX = r.left; panelStartY = r.top;
            overlay.style.transition = 'none';
            fab.style.transition = 'none';
        }, { passive: true });

        document.addEventListener('touchmove', function (e) {
            if (!panelDragging) return;
            var t = e.touches[0];
            var dx = t.clientX - pdStartX, dy = t.clientY - pdStartY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) panelDragged = true;
            if (!panelDragged) return;
            var nx = Math.max(0, Math.min(window.innerWidth - overlay.offsetWidth, panelStartX + dx));
            var ny = Math.max(0, Math.min(window.innerHeight - overlay.offsetHeight, panelStartY + dy));
            overlay.style.left = nx + 'px';
            overlay.style.top = ny + 'px';
            overlay.style.bottom = 'auto';
            overlay.style.right = 'auto';
            syncFabToPanel();
        }, { passive: true });

        document.addEventListener('touchend', function () {
            if (panelDragging) {
                panelDragging = false;
                overlay.style.transition = '';
                fab.style.transition = '';
            }
        });
    }

    function enterCompose() {
        // Block in read-only mode
        if (M.markdownEditor && M.markdownEditor.readOnly) {
            if (M.showToast) M.showToast('🔒 Compose is disabled in read-only mode. Enable editing first.', 'warning');
            return;
        }
        composeActive = true;
        overlay.classList.add('active');
        if (fab) fab.classList.add('active');
        renderBlocks();
        if (M.renderMarkdown) M.renderMarkdown();
        inputEl.focus();
    }

    function exitCompose() {
        composeActive = false;
        overlay.classList.remove('active');
        if (fab) fab.classList.remove('active');
        editIndex = -1;
        slashMenu.classList.remove('active');
    }

    M.enterComposeMode = enterCompose;
    M.exitComposeMode = exitCompose;

    M.toggleComposeMode = function () {
        if (composeActive) exitCompose();
        else enterCompose();
    };

    // Wire FAB — draggable + click toggle
    if (fab) {
        var isDragging = false, wasDragged = false;
        var dragStartX, dragStartY, fabStartX, fabStartY;

        function onDragStart(clientX, clientY) {
            isDragging = true;
            wasDragged = false;
            dragStartX = clientX;
            dragStartY = clientY;
            var rect = fab.getBoundingClientRect();
            fabStartX = rect.left;
            fabStartY = rect.top;
            fab.style.transition = 'none';
            overlay.style.transition = 'none';
        }

        function onDragMove(clientX, clientY) {
            if (!isDragging) return;
            var dx = clientX - dragStartX;
            var dy = clientY - dragStartY;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) wasDragged = true;
            if (!wasDragged) return;
            var newX = fabStartX + dx;
            var newY = fabStartY + dy;
            // Clamp to viewport
            newX = Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, newX));
            newY = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, newY));
            fab.style.left = newX + 'px';
            fab.style.top = newY + 'px';
            fab.style.bottom = 'auto';
            fab.style.right = 'auto';
            // Sync panel if open
            if (composeActive) syncPanelToFab();
        }

        function onDragEnd() {
            isDragging = false;
            fab.style.transition = '';
            overlay.style.transition = '';
        }

        // Mouse events
        fab.addEventListener('mousedown', function (e) {
            if (e.target.closest('#composer-fab-dismiss')) return;
            onDragStart(e.clientX, e.clientY);
        });
        document.addEventListener('mousemove', function (e) { onDragMove(e.clientX, e.clientY); });
        document.addEventListener('mouseup', function () { onDragEnd(); });

        // Touch events
        fab.addEventListener('touchstart', function (e) {
            if (e.target.closest('#composer-fab-dismiss')) return;
            var t = e.touches[0];
            onDragStart(t.clientX, t.clientY);
        }, { passive: true });
        document.addEventListener('touchmove', function (e) {
            if (!isDragging) return;
            var t = e.touches[0];
            onDragMove(t.clientX, t.clientY);
        }, { passive: true });
        document.addEventListener('touchend', function () { onDragEnd(); });

        // Click — only if not dragged
        fab.addEventListener('click', function (e) {
            if (e.target.closest('#composer-fab-dismiss')) return;
            if (wasDragged) { wasDragged = false; return; }
            M.toggleComposeMode();
        });
    }

    // Wire FAB dismiss badge — hides FAB without opening panel
    var fabDismiss = document.getElementById('composer-fab-dismiss');
    if (fabDismiss) {
        fabDismiss.addEventListener('click', function (e) {
            e.stopPropagation();
            exitCompose();
            if (fab) fab.style.display = 'none';
        });
    }

    // Wire close button — hides both panel and FAB (comes back on refresh)
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            exitCompose();
            if (fab) fab.style.display = 'none';
        });
    }

    // Wire QAB Tools > Compose item
    var qabCompose = document.getElementById('qab-compose');
    if (qabCompose) {
        qabCompose.addEventListener('click', function () {
            M.toggleComposeMode();
            // Also show FAB if it was dismissed
            if (fab) fab.style.display = '';
        });
    }

    // Wire QAB view-btn (if present)
    var qabBtn = document.getElementById('qab-compose-toggle');
    if (qabBtn) {
        qabBtn.addEventListener('click', function () {
            M.toggleComposeMode();
        });
    }

    // Listen for editor changes from outside (e.g. template load, import)
    // and re-render blocks if compose mode is active
    M.markdownEditor.addEventListener('input', function () {
        if (overlay.classList.contains('active')) {
            renderBlocks();
        }
    });

})(window.MDView);
