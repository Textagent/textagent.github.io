// ============================================
// exec-math.js — Math.js + LaTeX/Nerdamer Executable Blocks
// Extracted from executable-blocks.js
// ============================================
(function (M) {
    'use strict';

    var escapeHtml = M._exec.escapeHtml;

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

    async function evaluateMathBlock(container, btnEval) {
        var codeEl = container.querySelector('code');
        if (!codeEl) return;
        var code = codeEl.textContent.trim();

        var outputEl = container.querySelector('.code-output');
        if (!outputEl) {
            outputEl = document.createElement('div');
            outputEl.className = 'code-output math-output';
            container.appendChild(outputEl);
        }

        outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-hourglass-split"></i> Loading math engine...</span>';
        outputEl.style.display = 'block';

        var mathLib;
        try {
            mathLib = await window.getMathjs();
        } catch (loadErr) {
            outputEl.innerHTML = '<span class="code-output-error">Failed to load math.js: ' + escapeHtml(loadErr.message) + '</span>';
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
                    var result = mathLib.evaluate(lines[i].trim(), scope);
                    if (result !== undefined) {
                        var formatted;
                        if (typeof result === 'object' && result.entries) { formatted = mathLib.format(result, { precision: 10 }); }
                        else if (typeof result === 'number') { formatted = mathLib.format(result, { precision: 10 }); }
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
            if (mjxEl.parentElement && mjxEl.parentElement.classList.contains('latex-eval-container')) return;
            if (mjxEl.closest('.executable-math-container')) return;

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

    var NERDAMER_RESERVED_CONSTANTS = {
        'E': 'Euler\'s number (e ≈ 2.718)',
        'I': 'imaginary unit (i)',
        'PI': 'π (≈ 3.14159)'
    };

    function handleReservedConstants(partLatex) {
        var found = [];
        Object.keys(NERDAMER_RESERVED_CONSTANTS).forEach(function (key) {
            var re = new RegExp('(?<![a-zA-Z0-9_\\\\])' + key + '(?![a-zA-Z0-9_])', 'g');
            if (re.test(partLatex)) {
                found.push({ symbol: key, description: NERDAMER_RESERVED_CONSTANTS[key] });
                re.lastIndex = 0;
                partLatex = partLatex.replace(re, key + '_v');
            }
        });
        return { cleaned: partLatex, found: found };
    }

    function restoreReservedNames(text) {
        Object.keys(NERDAMER_RESERVED_CONSTANTS).forEach(function (key) {
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

        var unsupported = [];
        if (/\\lim\b/.test(latex)) unsupported.push('limits (\\lim)');
        if (/\\int\b/.test(latex)) unsupported.push('integrals (\\int)');
        if (/\\partial\b/.test(latex)) unsupported.push('partial derivatives (∂)');
        if (/\\nabla\b/.test(latex)) unsupported.push('nabla (∇)');
        if (/\\infty\b/.test(latex)) unsupported.push('infinity (∞)');
        if (/\\(iint|iiint|oint)\b/.test(latex)) unsupported.push('multi/surface integrals');
        if (/\\prod\b/.test(latex)) unsupported.push('products (∏)');

        var latexParts = [latex];
        if (latex.includes('=') && !latex.includes('\\neq') && !latex.includes('\\leq') && !latex.includes('\\geq')) {
            latexParts = latex.split('=').map(function (p) { return p.trim(); }).filter(function (p) { return p.length > 0; });
        }

        var evaluated = false;
        var lastError = '';
        var allReservedFound = [];

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

                var reserved = handleReservedConstants(partLatex);
                partLatex = reserved.cleaned;
                reserved.found.forEach(function (f) {
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

})(window.MDView);
