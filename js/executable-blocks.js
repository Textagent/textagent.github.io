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

    // ========================================
    // LATEX DISPLAY MATH EVALUATION (Nerdamer)
    // ========================================

    M.addLatexEvalToolbars = function () {
        if (typeof nerdamer === 'undefined') return;

        // Extract display math expressions from raw markdown source
        var markdown = M.markdownEditor.value || '';
        var displayMathRegex = /\$\$([\s\S]*?)\$\$/g;
        var latexSources = [];
        var match;
        while ((match = displayMathRegex.exec(markdown)) !== null) {
            latexSources.push(match[1].trim());
        }

        var mjxElements = M.markdownPreview.querySelectorAll('mjx-container[display="true"]');
        var sourceIndex = 0;

        mjxElements.forEach(function (mjxEl) {
            // Skip if already wrapped
            if (mjxEl.parentElement && mjxEl.parentElement.classList.contains('latex-eval-container')) return;
            // Skip if inside an executable-math-container
            if (mjxEl.closest('.executable-math-container')) return;

            // Get LaTeX source from our extracted list
            var latexSource = (sourceIndex < latexSources.length) ? latexSources[sourceIndex] : '';
            sourceIndex++;

            var wrapper = document.createElement('div');
            wrapper.className = 'latex-eval-container';
            wrapper.setAttribute('data-latex', latexSource);
            mjxEl.parentNode.insertBefore(wrapper, mjxEl);
            wrapper.appendChild(mjxEl);

            var toolbar = document.createElement('div');
            toolbar.className = 'latex-eval-toolbar';
            toolbar.setAttribute('aria-label', 'LaTeX evaluation actions');

            var btnEval = document.createElement('button');
            btnEval.className = 'code-toolbar-btn math-eval-btn';
            btnEval.title = 'Evaluate LaTeX expression';
            btnEval.setAttribute('aria-label', 'Evaluate');
            btnEval.innerHTML = '<i class="bi bi-calculator"></i> Evaluate';
            btnEval.addEventListener('click', function () { evaluateLatexBlock(wrapper, btnEval); });

            var btnCopy = document.createElement('button');
            btnCopy.className = 'code-toolbar-btn code-copy-btn';
            btnCopy.title = 'Copy LaTeX source';
            btnCopy.setAttribute('aria-label', 'Copy LaTeX');
            btnCopy.innerHTML = '<i class="bi bi-clipboard"></i>';
            btnCopy.addEventListener('click', function () {
                var latex = wrapper.getAttribute('data-latex') || '';
                navigator.clipboard.writeText('$$' + latex + '$$').then(function () {
                    btnCopy.innerHTML = '<i class="bi bi-check-lg"></i>';
                    setTimeout(function () { btnCopy.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
                }).catch(function () {
                    btnCopy.innerHTML = '<i class="bi bi-x-lg"></i>';
                    setTimeout(function () { btnCopy.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
                });
            });

            toolbar.appendChild(btnEval);
            toolbar.appendChild(btnCopy);
            wrapper.insertBefore(toolbar, wrapper.firstChild);
        });
    };

    function evaluateLatexBlock(container, btnEval) {
        var latex = container.getAttribute('data-latex') || '';
        if (!latex.trim()) return;


        var outputEl = container.querySelector('.latex-eval-output');
        if (!outputEl) {
            outputEl = document.createElement('div');
            outputEl.className = 'latex-eval-output';
            container.appendChild(outputEl);
        }

        if (typeof nerdamer === 'undefined') {
            outputEl.innerHTML = '<span class="code-output-error">⏳ Nerdamer is still loading. Please try again.</span>';
            outputEl.style.display = 'block';
            return;
        }

        btnEval.disabled = true;
        btnEval.innerHTML = '<i class="bi bi-hourglass-split"></i> Computing...';
        outputEl.style.display = 'block';

        try {
            // Clean up the LaTeX for nerdamer
            var cleanLatex = latex
                .replace(/\\displaystyle\s*/g, '')
                .replace(/\\left\s*/g, '')
                .replace(/\\right\s*/g, '')
                .replace(/\\,/g, '')
                .replace(/\\;/g, '')
                .replace(/\\!/g, '')
                .replace(/\\quad/g, '')
                .replace(/\\qquad/g, '')
                .replace(/\\text\{[^}]*\}/g, '')
                .replace(/\\mathrm\{([^}]*)\}/g, '$1')
                .replace(/\\mathbf\{([^}]*)\}/g, '$1')
                .replace(/\\vec\{([^}]*)\}/g, '$1')
                .replace(/\\overrightarrow\{([^}]*)\}/g, '$1')
                .replace(/\\hat\{([^}]*)\}/g, '$1')
                .replace(/\\bar\{([^}]*)\}/g, '$1')
                .trim();

            // Try to parse and evaluate
            var expr = nerdamer.convertFromLaTeX(cleanLatex);
            var resultText;
            var resultType;

            try {
                // Try numeric evaluation first
                var numResult = expr.evaluate();
                var numStr = numResult.text('decimals');

                // Check if it's actually numeric (not still symbolic)
                if (/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(numStr) || numStr === 'Infinity' || numStr === '-Infinity') {
                    // Format nice numbers
                    var num = parseFloat(numStr);
                    if (Number.isInteger(num) && Math.abs(num) < 1e15) {
                        resultText = num.toString();
                    } else {
                        resultText = parseFloat(num.toPrecision(10)).toString();
                    }
                    resultType = 'numeric';
                } else {
                    // It's still symbolic after evaluate
                    resultText = numStr;
                    resultType = 'symbolic';
                }
            } catch (evalErr) {
                // Numeric evaluation failed, show symbolic form
                resultText = expr.text();
                resultType = 'symbolic';
            }

            // Also get the LaTeX representation of the result
            var resultLatex = '';
            try {
                resultLatex = expr.toTeX();
            } catch (e) { /* ignore */ }

            var html = '';
            if (resultType === 'numeric') {
                html = '<span class="math-result-label">Result:</span> <span class="math-result-value latex-result-numeric">' + escapeHtml(resultText) + '</span>';
            } else {
                html = '<span class="math-result-label">Simplified:</span> <span class="math-result-value latex-result-symbolic">' + escapeHtml(resultText) + '</span>';
            }

            // If we have a LaTeX result, render it with MathJax
            if (resultLatex && resultType === 'symbolic') {
                var latexDisplay = document.createElement('div');
                latexDisplay.className = 'latex-result-rendered';
                latexDisplay.textContent = '$$' + resultLatex + '$$';
                outputEl.innerHTML = html;
                outputEl.appendChild(latexDisplay);
                if (window.MathJax) {
                    MathJax.typesetPromise([latexDisplay]).catch(function () { });
                }
            } else {
                outputEl.innerHTML = html;
            }
        } catch (err) {
            var errMsg = err.message || String(err);
            // Make error messages more user-friendly
            if (errMsg.includes('parse') || errMsg.includes('unexpected') || errMsg.includes('token')) {
                outputEl.innerHTML = '<span class="code-output-error"><i class="bi bi-info-circle"></i> This expression contains notation that cannot be evaluated computationally.</span>';
            } else {
                outputEl.innerHTML = '<span class="code-output-error"><i class="bi bi-exclamation-triangle"></i> ' + escapeHtml(errMsg) + '</span>';
            }
        } finally {
            btnEval.disabled = false;
            btnEval.innerHTML = '<i class="bi bi-calculator"></i> Evaluate';
        }
    }

})(window.MDView);
