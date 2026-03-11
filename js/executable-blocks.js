// ============================================
// executable-blocks.js — Bash + Math Executable Blocks
// ============================================
(function (M) {
    'use strict';

    // --- Shared HTML escape helper ---
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ========================================
    // EXECUTABLE CODE BLOCKS (just-bash)
    // ========================================

    var _sharedBashInstance = null;
    var _justBashReady = !!window.JustBash;

    if (!_justBashReady) {
        window.addEventListener('just-bash-ready', function () { _justBashReady = true; }, { once: true });
    }

    function getSharedBash() {
        if (!_justBashReady || !window.JustBash) return null;
        if (!_sharedBashInstance) { _sharedBashInstance = new window.JustBash(); }
        return _sharedBashInstance;
    }

    M.addCodeBlockToolbars = function () {
        M.markdownPreview.querySelectorAll('.executable-code-container').forEach(function (container) {
            if (container.querySelector('.code-block-toolbar')) return;

            var toolbar = document.createElement('div');
            toolbar.className = 'code-block-toolbar';
            toolbar.setAttribute('aria-label', 'Code block actions');

            var btnRun = document.createElement('button');
            btnRun.className = 'code-toolbar-btn code-run-btn';
            btnRun.title = 'Run in sandboxed bash';
            btnRun.setAttribute('aria-label', 'Run code');
            btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
            btnRun.addEventListener('click', function () { executeCodeBlock(container, btnRun); });

            var btnCopy = document.createElement('button');
            btnCopy.className = 'code-toolbar-btn code-copy-btn';
            btnCopy.title = 'Copy code';
            btnCopy.setAttribute('aria-label', 'Copy code');
            btnCopy.innerHTML = '<i class="bi bi-clipboard"></i>';
            btnCopy.addEventListener('click', function () {
                var codeEl = container.querySelector('code');
                if (!codeEl) return;
                navigator.clipboard.writeText(codeEl.textContent).then(function () {
                    btnCopy.innerHTML = '<i class="bi bi-check-lg"></i>';
                    setTimeout(function () { btnCopy.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
                }).catch(function () {
                    btnCopy.innerHTML = '<i class="bi bi-x-lg"></i>';
                    setTimeout(function () { btnCopy.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
                });
            });

            toolbar.appendChild(btnRun);
            toolbar.appendChild(btnCopy);
            container.insertBefore(toolbar, container.firstChild);
        });
    };

    async function executeCodeBlock(container, btnRun) {
        var codeEl = container.querySelector('code');
        if (!codeEl) return;
        var code = codeEl.textContent;

        var outputEl = container.querySelector('.code-output');
        if (!outputEl) {
            outputEl = document.createElement('div');
            outputEl.className = 'code-output';
            container.appendChild(outputEl);
        }

        if (!_justBashReady || !window.JustBash) {
            outputEl.innerHTML = '<span class="code-output-error">⏳ just-bash is still loading. Please try again in a moment.</span>';
            outputEl.style.display = 'block';
            return;
        }

        btnRun.disabled = true;
        btnRun.innerHTML = '<i class="bi bi-hourglass-split"></i> Running...';
        outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> Executing...</span>';
        outputEl.style.display = 'block';

        try {
            var bash = getSharedBash();
            var result = await bash.exec(code);
            var outputHtml = '';
            if (result.stdout) outputHtml += '<span class="code-output-stdout">' + escapeHtml(result.stdout) + '</span>';
            if (result.stderr) outputHtml += '<span class="code-output-stderr">' + escapeHtml(result.stderr) + '</span>';
            if (!result.stdout && !result.stderr) outputHtml = '<span class="code-output-muted">(no output)</span>';
            if (result.exitCode !== 0) outputHtml += '<span class="code-output-exit">Exit code: ' + result.exitCode + '</span>';
            outputEl.innerHTML = outputHtml;
        } catch (err) {
            outputEl.innerHTML = '<span class="code-output-error">Error: ' + escapeHtml(err.message) + '</span>';
        } finally {
            btnRun.disabled = false;
            btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
        }
    }

    // --- Expose shared helper for extracted modules ---
    M._exec = { escapeHtml: escapeHtml };

    // --- Register runtime adapter for exec-controller ---
    var bashAdapter = {
        execute: function (source) {
            if (!_justBashReady || !window.JustBash) {
                return Promise.reject(new Error('just-bash is still loading'));
            }
            var bash = getSharedBash();
            return bash.exec(source).then(function (result) {
                var output = '';
                if (result.stdout) output += result.stdout;
                if (result.stderr) output += (output ? '\n' : '') + result.stderr;
                return output || '(no output)';
            });
        }
    };
    if (M._execRegistry) {
        M._execRegistry.registerRuntime('bash', bashAdapter);
    } else {
        if (!M._pendingRuntimeAdapters) M._pendingRuntimeAdapters = [];
        M._pendingRuntimeAdapters.push({ key: 'bash', adapter: bashAdapter });
    }

})(window.MDView);
