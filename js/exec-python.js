// ============================================
// exec-python.js — Python Executable Blocks (Pyodide WASM)
// Extracted from executable-blocks.js
// ============================================
(function (M) {
    'use strict';

    var escapeHtml = M._exec.escapeHtml;

    var _pyodideInstance = null;
    var _pyodideLoading = false;
    var _pyodideCallbacks = [];

    function getPyodide(onReady, onProgress) {
        if (_pyodideInstance) { onReady(_pyodideInstance); return; }
        _pyodideCallbacks.push(onReady);
        if (_pyodideLoading) return;
        _pyodideLoading = true;

        if (onProgress) onProgress('Loading Python runtime (~11 MB)...');

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.onload = function () {
            if (onProgress) onProgress('Initializing Python...');
            window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
            }).then(function (pyodide) {
                _pyodideInstance = pyodide;
                _pyodideLoading = false;
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

            setTimeout(function () {
                try {
                    pyodide.runPython('sys.stdout = StringIO()\nsys.stderr = StringIO()');

                    var usesMpl = /\bimport\s+matplotlib\b|\bfrom\s+matplotlib\b|\bplt\.\b/.test(code);
                    if (usesMpl) {
                        try {
                            pyodide.runPython("import micropip");
                            pyodide.runPython("import matplotlib\nmatplotlib.use('AGG')");
                        } catch (e) { /* ignore */ }
                    }

                    pyodide.runPython(code);

                    var stdout = pyodide.runPython('sys.stdout.getvalue()');
                    var stderr = pyodide.runPython('sys.stderr.getvalue()');

                    var outputHtml = '';

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
                                figs.forEach(function (b64) {
                                    outputHtml += '<div class="python-plot-output"><img src="data:image/png;base64,' + b64 + '" alt="matplotlib plot" style="max-width:100%;border-radius:6px;margin:4px 0" /></div>';
                                });
                            }
                        } catch (e) { /* ignore plot errors */ }
                    }

                    if (stdout) outputHtml += '<span class="code-output-stdout">' + escapeHtml(stdout) + '</span>';
                    if (stderr) outputHtml += '<span class="code-output-stderr">' + escapeHtml(stderr) + '</span>';
                    if (!outputHtml) outputHtml = '<span class="code-output-muted">(no output)</span>';
                    outputEl.innerHTML = outputHtml;
                } catch (runErr) {
                    outputEl.innerHTML = '<span class="code-output-error">Error: ' + escapeHtml(runErr.message) + '</span>';
                } finally {
                    btnRun.disabled = false;
                    btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
                }
            }, 50);
        }, function (msg) {
            outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> ' + escapeHtml(msg) + '</span>';
        });
    }

    // --- Register runtime adapter for exec-controller ---
    var pythonAdapter = {
        execute: function (source) {
            return new Promise(function (resolve, reject) {
                getPyodide(function (pyodide, err) {
                    if (!pyodide || err) {
                        reject(err || new Error('Failed to load Pyodide'));
                        return;
                    }
                    try {
                        pyodide.runPython('sys.stdout = StringIO()\nsys.stderr = StringIO()');
                        pyodide.runPython(source);
                        var stdout = pyodide.runPython('sys.stdout.getvalue()');
                        var stderr = pyodide.runPython('sys.stderr.getvalue()');
                        var output = '';
                        if (stdout) output += stdout;
                        if (stderr) output += (output ? '\n' : '') + stderr;
                        resolve(output || '(no output)');
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        }
    };
    if (M._execRegistry) {
        M._execRegistry.registerRuntime('python', pythonAdapter);
    } else {
        if (!M._pendingRuntimeAdapters) M._pendingRuntimeAdapters = [];
        M._pendingRuntimeAdapters.push({ key: 'python', adapter: pythonAdapter });
    }

})(window.MDView);
