// ============================================
// doc-vars-panel.js — Document Variables Panel UI
// Floating panel showing Document Vars + Runtime Vars
// ============================================
(function (M) {
    'use strict';

    if (!M || !M._vars) return;

    // ========================================
    // DOM scaffold
    // ========================================
    var overlay = document.createElement('div');
    overlay.className = 'doc-vars-overlay';
    document.body.appendChild(overlay);

    var panel = document.createElement('div');
    panel.className = 'doc-vars-panel';
    panel.id = 'doc-vars-panel';
    panel.innerHTML =
        '<div class="dv-header">' +
            '<span class="dv-header-title">' +
                '<i class="bi bi-braces"></i> Document Variables ' +
                '<span class="dv-header-count" id="dv-count">0</span>' +
            '</span>' +
            '<button class="dv-close-btn" id="dv-close" title="Close"><i class="bi bi-x-lg"></i></button>' +
        '</div>' +
        '<div class="dv-body" id="dv-body"></div>' +
        '<div class="dv-footer">' +
            '<button class="dv-add-btn" id="dv-add-manual" title="Add a manual document variable">' +
                '<i class="bi bi-plus-circle"></i> Add Variable' +
            '</button>' +
        '</div>';
    document.body.appendChild(panel);

    // ========================================
    // State
    // ========================================
    var isOpen = false;

    // ========================================
    // Open / Close
    // ========================================
    function open() {
        isOpen = true;
        overlay.classList.add('active');
        panel.classList.add('open');
        refresh();
    }

    function close() {
        isOpen = false;
        overlay.classList.remove('active');
        panel.classList.remove('open');
    }

    function toggle() {
        isOpen ? close() : open();
    }

    // ========================================
    // Render
    // ========================================
    function inferSource(name) {
        if (name.startsWith('api_')) return 'api';
        return 'var';
    }

    function truncate(str, max) {
        if (!str) return '';
        str = String(str);
        return str.length > max ? str.substring(0, max) + '…' : str;
    }

    function escapeHtml(str) {
        var d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function refresh() {
        var body = document.getElementById('dv-body');
        var countEl = document.getElementById('dv-count');
        if (!body) return;

        var allVars = M._vars.list();

        // Also scan AI/Agent blocks for declared @var: names not yet in runtime
        if (M.parseDocgenBlocks && M.markdownEditor) {
            try {
                var blocks = M.parseDocgenBlocks(M.markdownEditor.value);
                for (var b = 0; b < blocks.length; b++) {
                    var declaredVar = blocks[b].varName;
                    if (declaredVar && !allVars[declaredVar]) {
                        allVars[declaredVar] = { value: '(not yet run)', layer: 'declared' };
                    }
                }
            } catch (_) {}
        }

        var keys = Object.keys(allVars);

        var manualVars = [];
        var runtimeVars = [];
        var declaredVars = [];
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (allVars[k].layer === 'manual') {
                manualVars.push({ name: k, value: allVars[k].value, layer: 'manual' });
            } else if (allVars[k].layer === 'declared') {
                declaredVars.push({ name: k, value: allVars[k].value, layer: 'declared' });
            } else {
                runtimeVars.push({ name: k, value: allVars[k].value, layer: 'runtime' });
            }
        }

        countEl.textContent = keys.length;

        if (keys.length === 0) {
            body.innerHTML =
                '<div class="dv-empty">' +
                    '<i class="bi bi-inbox" style="font-size:24px;display:block;margin-bottom:8px"></i>' +
                    'No variables yet.<br>' +
                    '<small>Use <code>Variable:</code> on API tags or <code>@var:</code> on AI tags to create vars.</small>' +
                '</div>';
            return;
        }

        var html = '';

        // Manual vars section
        if (manualVars.length > 0) {
            html += '<div class="dv-section-header manual">' +
                '<i class="bi bi-file-earmark-text"></i> Document Vars ' +
                '<span class="dv-section-badge">' + manualVars.length + '</span></div>';
            for (var m = 0; m < manualVars.length; m++) {
                html += renderVarRow(manualVars[m]);
            }
        }

        // Runtime vars section
        if (runtimeVars.length > 0) {
            if (manualVars.length > 0) html += '<div class="dv-divider"></div>';
            html += '<div class="dv-section-header runtime">' +
                '<i class="bi bi-lightning"></i> Runtime Vars ' +
                '<span class="dv-section-badge">' + runtimeVars.length + '</span></div>';
            for (var r = 0; r < runtimeVars.length; r++) {
                html += renderVarRow(runtimeVars[r]);
            }
        }

        // Declared (pending) vars section — from @var: on AI blocks not yet run
        if (declaredVars.length > 0) {
            if (manualVars.length > 0 || runtimeVars.length > 0) html += '<div class="dv-divider"></div>';
            html += '<div class="dv-section-header declared">' +
                '<i class="bi bi-hourglass-split"></i> Pending Vars ' +
                '<span class="dv-section-badge">' + declaredVars.length + '</span></div>';
            for (var d = 0; d < declaredVars.length; d++) {
                html += renderVarRow(declaredVars[d]);
            }
        }

        body.innerHTML = html;

        // Wire copy buttons
        body.querySelectorAll('.dv-copy-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var varName = this.dataset.varName;
                var val = M._vars.get(varName);
                if (val !== null) {
                    navigator.clipboard.writeText(val).then(function () {
                        if (M._showToast) M._showToast('Copied $(' + varName + ')', 'success');
                    });
                }
            });
        });

        // Wire expand-toggle on values
        body.querySelectorAll('.dv-var-value').forEach(function (el) {
            el.addEventListener('click', function () {
                this.classList.toggle('expanded');
            });
        });

        // Wire delete buttons (manual vars only)
        body.querySelectorAll('.dv-delete-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var varName = this.dataset.varName;
                // For now, just clear from runtime/manual
                // A proper implementation would also update the @variables block
                M._vars.setManual(varName, undefined);
                refresh();
            });
        });
    }

    function renderVarRow(v) {
        var source = v.layer === 'manual' ? 'manual' : v.layer === 'declared' ? 'declared' : inferSource(v.name);
        var sourceLabel = source === 'api' ? 'API' : source === 'manual' ? 'DOC' : source === 'declared' ? 'PENDING' : '@var';
        var displayVal = escapeHtml(truncate(String(v.value), 200));

        return '<div class="dv-var-row">' +
            '<span class="dv-var-name" title="$(' + escapeHtml(v.name) + ')">' + escapeHtml(v.name) + '</span>' +
            '<span class="dv-var-value" title="Click to expand/collapse">' + displayVal + '</span>' +
            '<span class="dv-source-badge ' + source + '">' + sourceLabel + '</span>' +
            '<div class="dv-var-actions">' +
                '<button class="dv-var-action-btn dv-copy-btn" data-var-name="' + escapeHtml(v.name) + '" title="Copy value">' +
                    '<i class="bi bi-clipboard"></i>' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    // ========================================
    // Add manual variable
    // ========================================
    document.getElementById('dv-add-manual').addEventListener('click', function () {
        var name = prompt('Variable name:');
        if (!name || !name.trim()) return;
        name = name.trim().replace(/[^a-zA-Z0-9_]/g, '_');
        var value = prompt('Variable value:');
        if (value === null) return;
        M._vars.setManual(name, value);
        refresh();
    });

    // ========================================
    // Event wiring
    // ========================================
    document.getElementById('dv-close').addEventListener('click', close);
    overlay.addEventListener('click', close);

    // Listen for changes and refresh if panel is open
    M._vars.onChange(function () {
        if (isOpen) refresh();
    });

    // Keyboard shortcut (Escape to close)
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) {
            e.stopPropagation();
            close();
        }
    });

    // ========================================
    // Wire toolbar button
    // ========================================
    // Add a dedicated panel toggle next to existing Vars button
    var existingVarsBtn = document.getElementById('apply-vars-btn');
    if (existingVarsBtn) {
        var panelBtn = document.createElement('button');
        panelBtn.className = 'fmt-btn';
        panelBtn.id = 'doc-vars-panel-btn';
        panelBtn.title = 'Document Variables Panel — view and manage all named variables';
        panelBtn.innerHTML = '<i class="bi bi-table"></i>';
        panelBtn.addEventListener('click', toggle);
        existingVarsBtn.parentNode.insertBefore(panelBtn, existingVarsBtn.nextSibling);
    }

    // Expose
    M._varsPanel = { open: open, close: close, toggle: toggle, refresh: refresh };

})(window.MDView);
