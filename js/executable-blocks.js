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

    // Nerdamer reserved constants that collide with common variable names
    var NERDAMER_RESERVED_CONSTANTS = {
        'E': 'Euler\'s number (e ≈ 2.718)',
        'I': 'imaginary unit (i)',
        'PI': 'π (≈ 3.14159)'
    };

    /**
     * Detect standalone reserved-constant letters in a LaTeX part.
     * Returns { cleaned, found } where `cleaned` has the letters replaced
     * with Nerdamer-safe placeholders and `found` lists which constants
     * were detected (for the info note).
     */
    function handleReservedConstants(partLatex) {
        var found = [];

        // For each reserved constant, check if it appears as a standalone
        // identifier (not part of a longer word / command).
        // We replace it with a prefixed version so Nerdamer treats it as a
        // plain variable, e.g. E → E_v, I → I_v
        Object.keys(NERDAMER_RESERVED_CONSTANTS).forEach(function (key) {
            // Match the key as a standalone token: not preceded/followed by a
            // letter, digit, underscore, or backslash (LaTeX command).
            var re = new RegExp('(?<![a-zA-Z0-9_\\\\])' + key + '(?![a-zA-Z0-9_])', 'g');
            if (re.test(partLatex)) {
                found.push({ symbol: key, description: NERDAMER_RESERVED_CONSTANTS[key] });
                // Reset lastIndex after test()
                re.lastIndex = 0;
                partLatex = partLatex.replace(re, key + '_v');
            }
        });

        return { cleaned: partLatex, found: found };
    }

    /**
     * Undo the placeholder renaming in result text so the user sees the
     * original variable names.
     */
    function restoreReservedNames(text) {
        Object.keys(NERDAMER_RESERVED_CONSTANTS).forEach(function (key) {
            // Handle both plain text (E_v) and LaTeX subscript (E_{v})
            text = text.split(key + '_{v}').join(key);
            text = text.split(key + '_v').join(key);
        });
        return text;
    }

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

        // Detect unsupported constructs before trying nerdamer
        var unsupported = [];
        if (/\\lim\b/.test(latex)) unsupported.push('limits (\\lim)');
        if (/\\int\b/.test(latex)) unsupported.push('integrals (\\int)');
        if (/\\partial\b/.test(latex)) unsupported.push('partial derivatives (∂)');
        if (/\\nabla\b/.test(latex)) unsupported.push('nabla (∇)');
        if (/\\infty\b/.test(latex)) unsupported.push('infinity (∞)');
        if (/\\(iint|iiint|oint)\b/.test(latex)) unsupported.push('multi/surface integrals');
        if (/\\prod\b/.test(latex)) unsupported.push('products (∏)');

        // If equation has = sign, try to evaluate each side
        var latexParts = [latex];
        if (latex.includes('=') && !latex.includes('\\neq') && !latex.includes('\\leq') && !latex.includes('\\geq')) {
            latexParts = latex.split('=').map(function (p) { return p.trim(); }).filter(function (p) { return p.length > 0; });
        }

        var evaluated = false;
        var lastError = '';
        var allReservedFound = [];   // collect across all parts

        for (var pi = 0; pi < latexParts.length && !evaluated; pi++) {
            try {
                var partLatex = latexParts[pi]
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

                if (!partLatex) continue;

                // Detect & rename reserved constants so Nerdamer treats them as variables
                var reserved = handleReservedConstants(partLatex);
                partLatex = reserved.cleaned;
                reserved.found.forEach(function (f) {
                    // Avoid duplicates across parts
                    if (!allReservedFound.some(function (a) { return a.symbol === f.symbol; })) {
                        allReservedFound.push(f);
                    }
                });

                var expr = nerdamer.convertFromLaTeX(partLatex);
                var resultText;
                var resultType;

                try {
                    var numResult = expr.evaluate();
                    var numStr = numResult.text('decimals');

                    if (/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(numStr) || numStr === 'Infinity' || numStr === '-Infinity') {
                        var num = parseFloat(numStr);
                        if (Number.isInteger(num) && Math.abs(num) < 1e15) {
                            resultText = num.toString();
                        } else {
                            resultText = parseFloat(num.toPrecision(10)).toString();
                        }
                        resultType = 'numeric';
                    } else {
                        resultText = numStr;
                        resultType = 'symbolic';
                    }
                } catch (evalErr) {
                    resultText = expr.text();
                    resultType = 'symbolic';
                }

                // Restore original variable names in the output
                resultText = restoreReservedNames(resultText);

                var resultLatex = '';
                try {
                    resultLatex = expr.toTeX();
                    resultLatex = restoreReservedNames(resultLatex);
                } catch (e) { /* ignore */ }

                var html = '';
                var sideLabel = latexParts.length > 1 ? (pi === 0 ? 'LHS' : 'RHS') + ' → ' : '';

                if (resultType === 'numeric') {
                    html = '<span class="math-result-label">' + sideLabel + 'Result:</span> <span class="math-result-value latex-result-numeric">' + escapeHtml(resultText) + '</span>';
                } else {
                    html = '<span class="math-result-label">' + sideLabel + 'Simplified:</span> <span class="math-result-value latex-result-symbolic">' + escapeHtml(resultText) + '</span>';
                }

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
                evaluated = true;
            } catch (partErr) {
                lastError = partErr.message || String(partErr);
            }
        }

        // If reserved constants were detected, append an info note
        if (evaluated && allReservedFound.length > 0) {
            var noteItems = allReservedFound.map(function (f) {
                return '<b>' + escapeHtml(f.symbol) + '</b> is a Nerdamer reserved constant (' + escapeHtml(f.description) + ')';
            }).join('; ');
            var noteEl = document.createElement('div');
            noteEl.className = 'latex-reserved-note';
            noteEl.innerHTML = '<i class="bi bi-info-circle"></i> ' + noteItems + ' — treated as a variable here.';
            outputEl.appendChild(noteEl);
        }

        if (!evaluated) {
            // Show a friendly error
            if (unsupported.length > 0) {
                outputEl.innerHTML = '<span class="code-output-muted"><i class="bi bi-info-circle"></i> This expression uses ' +
                    escapeHtml(unsupported.join(', ')) +
                    ' — which cannot be evaluated numerically.</span>';
            } else {
                outputEl.innerHTML = '<span class="code-output-muted"><i class="bi bi-info-circle"></i> This expression contains notation that Nerdamer cannot evaluate.</span>';
            }
        }

        btnEval.disabled = false;
        btnEval.innerHTML = '<i class="bi bi-calculator"></i> Evaluate';
    }

    // ========================================
    // EXECUTABLE HTML BLOCKS (iframe sandbox)
    // ========================================

    M.addHtmlBlockToolbars = function () {
        M.markdownPreview.querySelectorAll('.executable-html-container').forEach(function (container) {
            if (container.querySelector('.code-block-toolbar')) return;

            var toolbar = document.createElement('div');
            toolbar.className = 'code-block-toolbar';
            toolbar.setAttribute('aria-label', 'HTML sandbox actions');

            var btnPreview = document.createElement('button');
            btnPreview.className = 'code-toolbar-btn html-preview-btn';
            btnPreview.title = 'Preview in sandboxed iframe';
            btnPreview.setAttribute('aria-label', 'Preview HTML');
            btnPreview.innerHTML = '<i class="bi bi-play-fill"></i> Preview';
            btnPreview.addEventListener('click', function () { previewHtmlBlock(container, btnPreview); });

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

            toolbar.appendChild(btnPreview);
            toolbar.appendChild(btnCopy);
            container.insertBefore(toolbar, container.firstChild);
        });
    };

    function previewHtmlBlock(container, btnPreview) {
        var codeEl = container.querySelector('code');
        if (!codeEl) return;
        var code = codeEl.textContent;

        // Toggle: if preview is already visible, close it
        var existingOutput = container.querySelector('.html-preview-output');
        if (existingOutput && existingOutput.style.display === 'block') {
            existingOutput.style.display = 'none';
            btnPreview.innerHTML = '<i class="bi bi-play-fill"></i> Preview';
            return;
        }

        var outputEl = existingOutput;
        if (!outputEl) {
            outputEl = document.createElement('div');
            outputEl.className = 'html-preview-output';
            container.appendChild(outputEl);
        }

        // Create sandboxed iframe
        outputEl.innerHTML = '';
        var iframe = document.createElement('iframe');
        iframe.className = 'html-preview-frame';
        iframe.setAttribute('sandbox', 'allow-scripts');
        iframe.setAttribute('loading', 'lazy');
        iframe.srcdoc = code;
        outputEl.appendChild(iframe);
        outputEl.style.display = 'block';

        // Auto-resize iframe to content height after load
        iframe.addEventListener('load', function () {
            try {
                var doc = iframe.contentDocument || iframe.contentWindow.document;
                var height = Math.min(doc.body.scrollHeight + 20, 500);
                iframe.style.height = Math.max(height, 60) + 'px';
            } catch (e) {
                iframe.style.height = '200px';
            }
        });

        btnPreview.innerHTML = '<i class="bi bi-eye-slash"></i> Close';
    }

    // ========================================
    // EXECUTABLE PYTHON BLOCKS (Pyodide WASM)
    // ========================================

    var _pyodideInstance = null;
    var _pyodideLoading = false;
    var _pyodideCallbacks = [];

    function getPyodide(onReady, onProgress) {
        if (_pyodideInstance) { onReady(_pyodideInstance); return; }
        _pyodideCallbacks.push(onReady);
        if (_pyodideLoading) return;
        _pyodideLoading = true;

        if (onProgress) onProgress('Loading Python runtime (~11 MB)...');

        // Load Pyodide script dynamically
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.onload = function () {
            if (onProgress) onProgress('Initializing Python...');
            window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
            }).then(function (pyodide) {
                _pyodideInstance = pyodide;
                _pyodideLoading = false;
                // Setup stdout/stderr capture
                pyodide.runPython([
                    'import sys',
                    'from io import StringIO',
                    ''
                ].join('\n'));
                var cbs = _pyodideCallbacks.splice(0);
                cbs.forEach(function (cb) { cb(pyodide); });
            }).catch(function (err) {
                _pyodideLoading = false;
                console.error('Pyodide load failed:', err);
                var cbs = _pyodideCallbacks.splice(0);
                cbs.forEach(function (cb) { cb(null, err); });
            });
        };
        script.onerror = function () {
            _pyodideLoading = false;
            var cbs = _pyodideCallbacks.splice(0);
            cbs.forEach(function (cb) { cb(null, new Error('Failed to load Pyodide CDN script')); });
        };
        document.head.appendChild(script);
    }

    M.addPythonBlockToolbars = function () {
        M.markdownPreview.querySelectorAll('.executable-python-container').forEach(function (container) {
            if (container.querySelector('.code-block-toolbar')) return;

            var toolbar = document.createElement('div');
            toolbar.className = 'code-block-toolbar';
            toolbar.setAttribute('aria-label', 'Python sandbox actions');

            var btnRun = document.createElement('button');
            btnRun.className = 'code-toolbar-btn python-run-btn';
            btnRun.title = 'Run in Python sandbox (Pyodide)';
            btnRun.setAttribute('aria-label', 'Run Python');
            btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
            btnRun.addEventListener('click', function () { executePythonBlock(container, btnRun); });

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

    function executePythonBlock(container, btnRun) {
        var codeEl = container.querySelector('code');
        if (!codeEl) return;
        var code = codeEl.textContent;

        var outputEl = container.querySelector('.code-output');
        if (!outputEl) {
            outputEl = document.createElement('div');
            outputEl.className = 'code-output python-output';
            container.appendChild(outputEl);
        }

        btnRun.disabled = true;
        btnRun.innerHTML = '<i class="bi bi-hourglass-split"></i> Loading...';
        outputEl.style.display = 'block';
        outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> Loading Python runtime...</span>';

        getPyodide(function (pyodide, err) {
            if (!pyodide || err) {
                outputEl.innerHTML = '<span class="code-output-error">Failed to load Python: ' + escapeHtml((err && err.message) || 'Unknown error') + '</span>';
                btnRun.disabled = false;
                btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
                return;
            }

            btnRun.innerHTML = '<i class="bi bi-hourglass-split"></i> Running...';
            outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> Executing...</span>';

            // Use setTimeout so UI updates before blocking execution
            setTimeout(function () {
                try {
                    // Redirect stdout/stderr
                    pyodide.runPython('sys.stdout = StringIO()\nsys.stderr = StringIO()');

                    // Check if code uses matplotlib
                    var usesMpl = /\bimport\s+matplotlib\b|\bfrom\s+matplotlib\b|\bplt\.\b/.test(code);
                    if (usesMpl) {
                        try {
                            pyodide.runPython("import micropip");
                            // matplotlib is pre-bundled in Pyodide, just need to set backend
                            pyodide.runPython("import matplotlib\nmatplotlib.use('AGG')");
                        } catch (e) { /* ignore - matplotlib may already be loaded */ }
                    }

                    pyodide.runPython(code);

                    var stdout = pyodide.runPython('sys.stdout.getvalue()');
                    var stderr = pyodide.runPython('sys.stderr.getvalue()');

                    var outputHtml = '';

                    // Check for matplotlib figures
                    if (usesMpl) {
                        try {
                            pyodide.runPython([
                                'import matplotlib.pyplot as _plt',
                                'import base64 as _b64',
                                'from io import BytesIO as _BytesIO',
                                '_mdv_figs = []',
                                'for _fig_num in _plt.get_fignums():',
                                '    _buf = _BytesIO()',
                                '    _plt.figure(_fig_num).savefig(_buf, format="png", dpi=100, bbox_inches="tight")',
                                '    _buf.seek(0)',
                                '    _mdv_figs.append(_b64.b64encode(_buf.read()).decode())',
                                '    _buf.close()',
                                '_plt.close("all")'
                            ].join('\n'));
                            var figs = pyodide.runPython('_mdv_figs').toJs();
                            if (figs && figs.length > 0) {
                                for (var fi = 0; fi < figs.length; fi++) {
                                    outputHtml += '<div class="python-plot"><img src="data:image/png;base64,' + figs[fi] + '" alt="Plot ' + (fi + 1) + '"></div>';
                                }
                            }
                        } catch (plotErr) {
                            console.warn('matplotlib capture failed:', plotErr);
                        }
                    }

                    if (stdout) outputHtml += '<span class="code-output-stdout">' + escapeHtml(stdout) + '</span>';
                    if (stderr) outputHtml += '<span class="code-output-stderr">' + escapeHtml(stderr) + '</span>';
                    if (!stdout && !stderr && !outputHtml) outputHtml = '<span class="code-output-muted">(no output)</span>';
                    outputEl.innerHTML = outputHtml;
                } catch (runErr) {
                    var errMsg = runErr.message || String(runErr);
                    // Clean up Pyodide traceback noise
                    var cleanErr = errMsg.replace(/^[\s\S]*?(Traceback)/, '$1').replace(/PythonError:\s*/, '');
                    outputEl.innerHTML = '<span class="code-output-stderr">' + escapeHtml(cleanErr || errMsg) + '</span>';
                } finally {
                    btnRun.disabled = false;
                    btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
                }
            }, 50);
        }, function (msg) {
            outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> ' + escapeHtml(msg) + '</span>';
        });
    }
    // ========================================
    // EXECUTABLE JAVASCRIPT BLOCKS (iframe sandbox)
    // ========================================

    M.addJsBlockToolbars = function () {
        M.markdownPreview.querySelectorAll('.executable-js-container').forEach(function (container) {
            if (container.querySelector('.code-block-toolbar')) return;

            var toolbar = document.createElement('div');
            toolbar.className = 'code-block-toolbar';
            toolbar.setAttribute('aria-label', 'JavaScript sandbox actions');

            var btnRun = document.createElement('button');
            btnRun.className = 'code-toolbar-btn js-run-btn';
            btnRun.title = 'Run in sandboxed JavaScript';
            btnRun.setAttribute('aria-label', 'Run JavaScript');
            btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
            btnRun.addEventListener('click', function () { executeJsBlock(container, btnRun); });

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

    function executeJsBlock(container, btnRun) {
        var codeEl = container.querySelector('code');
        if (!codeEl) return;
        var code = codeEl.textContent;

        var outputEl = container.querySelector('.code-output');
        if (!outputEl) {
            outputEl = document.createElement('div');
            outputEl.className = 'code-output js-output';
            container.appendChild(outputEl);
        }

        btnRun.disabled = true;
        btnRun.innerHTML = '<i class="bi bi-hourglass-split"></i> Running...';
        outputEl.style.display = 'block';
        outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> Executing...</span>';

        // Execute in sandboxed iframe to capture console output
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.setAttribute('sandbox', 'allow-scripts');
        document.body.appendChild(iframe);

        // Build the script that captures console output and posts it back
        var wrappedCode = '<!DOCTYPE html><html><body><script>' +
            'var __logs = [];' +
            'var __origConsole = {log: console.log, warn: console.warn, error: console.error, info: console.info};' +
            'function __fmt(a) { return Array.from(a).map(function(v) {' +
            '  if (v === null) return "null";' +
            '  if (v === undefined) return "undefined";' +
            '  if (typeof v === "object") try { return JSON.stringify(v, null, 2); } catch(e) { return String(v); }' +
            '  return String(v);' +
            '}).join(" "); }' +
            'console.log = function() { __logs.push({t:"log", m:__fmt(arguments)}); };' +
            'console.warn = function() { __logs.push({t:"warn", m:__fmt(arguments)}); };' +
            'console.error = function() { __logs.push({t:"error", m:__fmt(arguments)}); };' +
            'console.info = function() { __logs.push({t:"log", m:__fmt(arguments)}); };' +
            'try {' +
            '  var __result = eval(' + JSON.stringify(code) + ');' +
            '  if (__result !== undefined && !__logs.length) __logs.push({t:"log", m:String(__result)});' +
            '  parent.postMessage({type:"js-result", logs:__logs}, "*");' +
            '} catch(e) {' +
            '  parent.postMessage({type:"js-result", logs:__logs, error:e.message}, "*");' +
            '}' +
            '<\/script></body></html>';

        var timeout = setTimeout(function () {
            cleanup();
            outputEl.innerHTML = '<span class="code-output-error">Execution timed out (5s limit)</span>';
            btnRun.disabled = false;
            btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
        }, 5000);

        function cleanup() {
            clearTimeout(timeout);
            window.removeEventListener('message', handler);
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }

        function handler(e) {
            if (!e.data || e.data.type !== 'js-result') return;
            cleanup();

            var logs = e.data.logs || [];
            var html = '';

            for (var i = 0; i < logs.length; i++) {
                var cls = logs[i].t === 'error' ? 'code-output-stderr' :
                    logs[i].t === 'warn' ? 'code-output-warn' : 'code-output-stdout';
                var prefix = logs[i].t === 'warn' ? '⚠ ' : logs[i].t === 'error' ? '✖ ' : '';
                html += '<span class="' + cls + '">' + prefix + escapeHtml(logs[i].m) + '\n</span>';
            }

            if (e.data.error) {
                html += '<span class="code-output-stderr">✖ ' + escapeHtml(e.data.error) + '</span>';
            }

            if (!html) html = '<span class="code-output-muted">(no output)</span>';
            outputEl.innerHTML = html;
            btnRun.disabled = false;
            btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
        }

        window.addEventListener('message', handler);
        iframe.srcdoc = wrappedCode;
    }

    // ========================================
    // EXECUTABLE SQL BLOCKS (sql.js / SQLite WASM)
    // ========================================

    var _sqlJsInstance = null;
    var _sqlJsLoading = false;
    var _sqlJsCallbacks = [];
    var _sqlDb = null;

    function getSqlJs(onReady, onProgress) {
        if (_sqlJsInstance) { onReady(_sqlJsInstance); return; }
        _sqlJsCallbacks.push(onReady);
        if (_sqlJsLoading) return;
        _sqlJsLoading = true;

        if (onProgress) onProgress('Loading SQLite runtime...');

        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js';
        script.onload = function () {
            if (onProgress) onProgress('Initializing SQLite...');
            window.initSqlJs({
                locateFile: function (file) {
                    return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + file;
                }
            }).then(function (SQL) {
                _sqlJsInstance = SQL;
                _sqlJsLoading = false;
                if (!_sqlDb) _sqlDb = new SQL.Database();
                var cbs = _sqlJsCallbacks.splice(0);
                cbs.forEach(function (cb) { cb(SQL); });
            }).catch(function (err) {
                _sqlJsLoading = false;
                console.error('sql.js load failed:', err);
                var cbs = _sqlJsCallbacks.splice(0);
                cbs.forEach(function (cb) { cb(null, err); });
            });
        };
        script.onerror = function () {
            _sqlJsLoading = false;
            var cbs = _sqlJsCallbacks.splice(0);
            cbs.forEach(function (cb) { cb(null, new Error('Failed to load sql.js CDN script')); });
        };
        document.head.appendChild(script);
    }

    M.addSqlBlockToolbars = function () {
        M.markdownPreview.querySelectorAll('.executable-sql-container').forEach(function (container) {
            if (container.querySelector('.code-block-toolbar')) return;

            var toolbar = document.createElement('div');
            toolbar.className = 'code-block-toolbar';
            toolbar.setAttribute('aria-label', 'SQL sandbox actions');

            var btnRun = document.createElement('button');
            btnRun.className = 'code-toolbar-btn sql-run-btn';
            btnRun.title = 'Run SQL in SQLite sandbox';
            btnRun.setAttribute('aria-label', 'Run SQL');
            btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
            btnRun.addEventListener('click', function () { executeSqlBlock(container, btnRun); });

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

    function executeSqlBlock(container, btnRun) {
        var codeEl = container.querySelector('code');
        if (!codeEl) return;
        var code = codeEl.textContent;

        var outputEl = container.querySelector('.code-output');
        if (!outputEl) {
            outputEl = document.createElement('div');
            outputEl.className = 'code-output sql-output';
            container.appendChild(outputEl);
        }

        btnRun.disabled = true;
        btnRun.innerHTML = '<i class="bi bi-hourglass-split"></i> Loading...';
        outputEl.style.display = 'block';
        outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> Loading SQLite...</span>';

        getSqlJs(function (SQL, err) {
            if (!SQL || err) {
                outputEl.innerHTML = '<span class="code-output-error">Failed to load SQLite: ' + escapeHtml((err && err.message) || 'Unknown error') + '</span>';
                btnRun.disabled = false;
                btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
                return;
            }

            btnRun.innerHTML = '<i class="bi bi-hourglass-split"></i> Running...';
            outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> Executing...</span>';

            setTimeout(function () {
                try {
                    if (!_sqlDb) _sqlDb = new SQL.Database();

                    // Split by semicolons and run each statement
                    var statements = code.split(';').map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
                    var html = '';
                    var rowsAffected = 0;

                    for (var si = 0; si < statements.length; si++) {
                        var stmt = statements[si];
                        try {
                            var results = _sqlDb.exec(stmt);
                            if (results.length > 0) {
                                for (var ri = 0; ri < results.length; ri++) {
                                    var res = results[ri];
                                    // Build HTML table
                                    html += '<div class="sql-result-table-wrap"><table class="sql-result-table">';
                                    html += '<thead><tr>';
                                    for (var ci = 0; ci < res.columns.length; ci++) {
                                        html += '<th>' + escapeHtml(res.columns[ci]) + '</th>';
                                    }
                                    html += '</tr></thead><tbody>';
                                    for (var vi = 0; vi < res.values.length; vi++) {
                                        html += '<tr>';
                                        for (var vci = 0; vci < res.values[vi].length; vci++) {
                                            var val = res.values[vi][vci];
                                            html += '<td>' + escapeHtml(val === null ? 'NULL' : String(val)) + '</td>';
                                        }
                                        html += '</tr>';
                                    }
                                    html += '</tbody></table>';
                                    html += '<div class="sql-row-count">' + res.values.length + ' row' + (res.values.length !== 1 ? 's' : '') + '</div></div>';
                                }
                            } else {
                                // DML statements (INSERT, UPDATE, DELETE, CREATE)
                                var changes = _sqlDb.getRowsModified();
                                if (changes > 0) rowsAffected += changes;
                            }
                        } catch (stmtErr) {
                            html += '<span class="code-output-stderr">✖ ' + escapeHtml(stmtErr.message) + '</span>\n';
                        }
                    }

                    if (!html && rowsAffected > 0) {
                        html = '<span class="code-output-stdout">✓ ' + rowsAffected + ' row' + (rowsAffected !== 1 ? 's' : '') + ' affected</span>';
                    } else if (!html) {
                        html = '<span class="code-output-muted">(no output)</span>';
                    }

                    outputEl.innerHTML = html;
                } catch (runErr) {
                    outputEl.innerHTML = '<span class="code-output-stderr">✖ ' + escapeHtml(runErr.message) + '</span>';
                } finally {
                    btnRun.disabled = false;
                    btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
                }
            }, 50);
        }, function (msg) {
            outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> ' + escapeHtml(msg) + '</span>';
        });
    }

})(window.MDView);
