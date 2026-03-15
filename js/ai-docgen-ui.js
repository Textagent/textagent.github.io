// ============================================
// ai-docgen-ui.js — Fill All, Toast/Progress, Local Model Prompt
// Extracted from ai-docgen.js for modularity
// ============================================
(function (M) {
    'use strict';

    var _dg = M._docgen;

    // ==============================================
    // TOAST / PROGRESS UI
    // ==============================================

    var toastEl = null;
    var toastTimeout = null;

    function ensureToastEl() {
        if (toastEl) return toastEl;
        toastEl = document.createElement('div');
        toastEl.className = 'ai-docgen-toast';
        toastEl.style.display = 'none';
        document.body.appendChild(toastEl);
        return toastEl;
    }

    function showToast(message, type) {
        var el = ensureToastEl();
        el.textContent = message;
        el.className = 'ai-docgen-toast ai-docgen-toast-' + (type || 'info');
        el.style.display = 'flex';
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(function () {
            el.style.display = 'none';
        }, type === 'error' || type === 'warning' ? 5000 : 3000);
    }

    function showProgressToast(current, total) {
        var el = ensureToastEl();
        var pct = Math.round((current / total) * 100);
        el.innerHTML = '<span>🪄 Generating ' + current + ' of ' + total + '...</span>'
            + '<div class="ai-docgen-progress-bar"><div class="ai-docgen-progress-fill" style="width:' + pct + '%"></div></div>';
        el.className = 'ai-docgen-toast ai-docgen-toast-info';
        el.style.display = 'flex';
        clearTimeout(toastTimeout);
    }

    function hideProgressToast() {
        if (toastEl) {
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(function () {
                if (toastEl) toastEl.style.display = 'none';
            }, 2000);
        }
    }

    // ==============================================
    // FILL ALL — sequential with review at each step
    // ==============================================

    async function fillAllDocgenBlocks() {
        var text = M.markdownEditor.value;
        var blocks = M.parseDocgenBlocks(text);

        if (blocks.length === 0) {
            showToast('No {{AI:}}, {{Image:}}, or {{Agent:}} blocks found. Tag sections first.', 'warning');
            return;
        }

        if (_dg.activeBlockOps.size > 0) {
            showToast('An operation is already in progress.', 'warning');
            return;
        }

        var fillBtn = document.getElementById('docgen-fill-btn');
        if (fillBtn) fillBtn.classList.add('fmt-fill-active');

        var filled = 0;
        var total = blocks.length;
        var skipCount = 0;

        for (var i = 0; i < total; i++) {
            if (_dg.abortRequested) {
                showToast('⏹ Stopped. ' + filled + ' of ' + total + ' blocks processed.', 'warning');
                break;
            }

            showProgressToast(i + 1, total);

            var currentText = M.markdownEditor.value;
            var currentBlocks = M.parseDocgenBlocks(currentText);
            if (currentBlocks.length === 0) break;

            if (skipCount >= currentBlocks.length) break;

            var result = await _dg.generateAndReview(skipCount);
            if (result !== null) {
                filled++;
            } else {
                skipCount++;
            }
        }

        if (filled === total) {
            showToast('✅ Done! All ' + filled + ' section' + (filled !== 1 ? 's' : '') + ' accepted.', 'success');
        } else if (filled > 0) {
            showToast('✅ ' + filled + ' of ' + total + ' sections accepted.', 'info');
        }

        _dg.abortRequested = false;
        if (fillBtn) fillBtn.classList.remove('fmt-fill-active');
        hideProgressToast();
    }

    function showContinuePrompt(current, total) {
        return new Promise(function (resolve) {
            var overlay = document.createElement('div');
            overlay.className = 'ai-review-overlay';
            overlay.id = 'ai-review-overlay';

            var panel = document.createElement('div');
            panel.className = 'ai-review-panel ai-review-panel-compact';
            panel.innerHTML =
                '<div class="ai-review-header">'
                + '<span class="ai-review-title">Block rejected</span>'
                + '</div>'
                + '<div class="ai-review-prompt">Block ' + current + ' of ' + total + ' was rejected. Continue with remaining blocks?</div>'
                + '<div class="ai-review-actions">'
                + '<button class="ai-review-btn ai-review-accept" id="ai-cont-yes">Continue</button>'
                + '<button class="ai-review-btn ai-review-reject" id="ai-cont-no">Stop</button>'
                + '</div>';

            overlay.appendChild(panel);
            document.body.appendChild(overlay);

            document.getElementById('ai-cont-yes').addEventListener('click', function () {
                overlay.remove();
                resolve(true);
            });
            document.getElementById('ai-cont-no').addEventListener('click', function () {
                overlay.remove();
                resolve(false);
            });
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) { overlay.remove(); resolve(false); }
            });
        });
    }

    // Prompt user to download local model right from the generation flow
    function showLocalModelDownloadPrompt(modelCfg) {
        return new Promise(function (resolve) {
            var modelName = modelCfg.dropdownName || modelCfg.label || 'Local AI Model';

            var overlay = document.createElement('div');
            overlay.className = 'ai-review-overlay';
            overlay.id = 'ai-download-overlay';

            var panel = document.createElement('div');
            panel.className = 'ai-review-panel ai-review-panel-compact';
            panel.innerHTML =
                '<div class="ai-review-header">'
                + '<span class="ai-review-title">⬇️ Download ' + modelName + '</span>'
                + '</div>'
                + '<div class="ai-review-prompt">'
                + '<strong>' + modelName + '</strong> needs a one-time <strong>~500 MB</strong> download to run locally in your browser.'
                + '<br><br>Once downloaded, it runs 100% privately — no API key needed.'
                + '</div>'
                + '<div class="ai-review-actions">'
                + '<button class="ai-review-btn ai-review-accept" id="ai-dl-yes"><i class="bi bi-download"></i> Download</button>'
                + '<button class="ai-review-btn ai-review-reject" id="ai-dl-no">Cancel</button>'
                + '</div>';

            overlay.appendChild(panel);
            document.body.appendChild(overlay);

            var resolved = false;
            function finish(result) {
                if (resolved) return;
                resolved = true;
                overlay.remove();
                resolve(result);
            }

            document.getElementById('ai-dl-yes').addEventListener('click', function () {
                var currentModel = M.getCurrentAiModel ? M.getCurrentAiModel() : 'qwen-local';
                localStorage.setItem(M.KEYS.AI_CONSENTED_PREFIX + currentModel, 'true');
                localStorage.setItem(M.KEYS.AI_CONSENTED, 'true');
                if (M.initLocalAiWorker) M.initLocalAiWorker(currentModel);
                finish(true);
            });

            document.getElementById('ai-dl-no').addEventListener('click', function () {
                finish(false);
            });

            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) finish(false);
            });
        });
    }

    // ==============================================
    // REGISTER TOOLBAR ACTIONS & EXPOSE
    // ==============================================

    M.registerFormattingAction('fill-all', function () { fillAllDocgenBlocks(); });

    var modelSelectBtn = document.getElementById('ai-model-select-btn');
    if (modelSelectBtn) {
        modelSelectBtn.addEventListener('click', function () {
            _dg.showAiSetupPopup();
        });
    }

    // Expose toast for other modules
    M._showToast = function (msg, type) { M.showToast(msg, type); };
    _dg.showToast = showToast;
    _dg.showProgressToast = showProgressToast;
    _dg.hideProgressToast = hideProgressToast;
    _dg.fillAllDocgenBlocks = fillAllDocgenBlocks;
    _dg.showContinuePrompt = showContinuePrompt;
    _dg.showLocalModelDownloadPrompt = showLocalModelDownloadPrompt;

})(window.MDView);
