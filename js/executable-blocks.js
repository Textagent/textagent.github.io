// ============================================
// executable-blocks.js — Bash + Math Executable Blocks
// ============================================
(function (M) {
    'use strict';

    // --- Shared HTML escape helper ---
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
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

    // ========================================
    // EXECUTABLE MATH BLOCKS (math.js)
    // ========================================

    M.addMathBlockToolbars = function () {
        M.markdownPreview.querySelectorAll('.executable-math-container').forEach(function (container) {
            if (container.querySelector('.code-block-toolbar')) return;

            var toolbar = document.createElement('div');
            toolbar.className = 'code-block-toolbar';
            toolbar.setAttribute('aria-label', 'Math block actions');

            var btnEval = document.createElement('button');
            btnEval.className = 'code-toolbar-btn math-eval-btn';
            btnEval.title = 'Evaluate math expression';
            btnEval.setAttribute('aria-label', 'Evaluate math');
            btnEval.innerHTML = '<i class="bi bi-play-fill"></i> Evaluate';
            btnEval.addEventListener('click', function () { evaluateMathBlock(container, btnEval); });

            var btnCopy = document.createElement('button');
            btnCopy.className = 'code-toolbar-btn code-copy-btn';
            btnCopy.title = 'Copy expression';
            btnCopy.setAttribute('aria-label', 'Copy expression');
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

            toolbar.appendChild(btnEval);
            toolbar.appendChild(btnCopy);
            container.insertBefore(toolbar, container.firstChild);
        });
    };

    function evaluateMathBlock(container, btnEval) {
        var codeEl = container.querySelector('code');
        if (!codeEl) return;
        var code = codeEl.textContent.trim();

        var outputEl = container.querySelector('.code-output');
        if (!outputEl) {
            outputEl = document.createElement('div');
            outputEl.className = 'code-output math-output';
            container.appendChild(outputEl);
        }

        if (typeof math === 'undefined') {
            outputEl.innerHTML = '<span class="code-output-error">⏳ math.js is still loading. Please try again.</span>';
            outputEl.style.display = 'block';
            return;
        }

        btnEval.disabled = true;
        btnEval.innerHTML = '<i class="bi bi-hourglass-split"></i> Computing...';
        outputEl.style.display = 'block';

        try {
            var lines = code.split('\n').filter(function (l) { return l.trim() !== '' && !l.trim().startsWith('//'); });
            var scope = {};
            var results = [];

            for (var i = 0; i < lines.length; i++) {
                try {
                    var result = math.evaluate(lines[i].trim(), scope);
                    if (result !== undefined) {
                        var formatted;
                        if (typeof result === 'object' && result.entries) { formatted = math.format(result, { precision: 10 }); }
                        else if (typeof result === 'number') { formatted = math.format(result, { precision: 10 }); }
                        else if (typeof result === 'function') { formatted = '(function defined)'; }
                        else { formatted = String(result); }
                        results.push({ expr: lines[i].trim(), value: formatted });
                    }
                } catch (lineErr) {
                    results.push({ expr: lines[i].trim(), value: '❌ ' + lineErr.message, isError: true });
                }
            }

            var outputHtml = '';
            if (results.length === 1) {
                var r = results[0];
                if (r.isError) { outputHtml = '<span class="code-output-error">' + escapeHtml(r.value) + '</span>'; }
                else { outputHtml = '<span class="math-result-label">Result:</span> <span class="math-result-value">' + escapeHtml(r.value) + '</span>'; }
            } else {
                for (var j = 0; j < results.length; j++) {
                    var item = results[j];
                    if (item.isError) {
                        outputHtml += '<div class="math-result-line"><span class="math-result-expr">' + escapeHtml(item.expr) + '</span> <span class="code-output-error">→ ' + escapeHtml(item.value) + '</span></div>';
                    } else {
                        outputHtml += '<div class="math-result-line"><span class="math-result-expr">' + escapeHtml(item.expr) + '</span> <span class="math-result-arrow">→</span> <span class="math-result-value">' + escapeHtml(item.value) + '</span></div>';
                    }
                }
            }

            if (results.length === 0) outputHtml = '<span class="code-output-muted">(no result)</span>';
            outputEl.innerHTML = outputHtml;
        } catch (err) {
            outputEl.innerHTML = '<span class="code-output-error">Error: ' + escapeHtml(err.message) + '</span>';
        } finally {
            btnEval.disabled = false;
            btnEval.innerHTML = '<i class="bi bi-play-fill"></i> Evaluate';
        }
    }

})(window.MDView);
