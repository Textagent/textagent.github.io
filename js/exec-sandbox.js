// ============================================
// exec-sandbox.js — HTML, JavaScript, SQL Executable Blocks
// Extracted from executable-blocks.js
// ============================================
(function (M) {
    'use strict';

    var escapeHtml = M._exec.escapeHtml;

    // ========================================
    // EXECUTABLE HTML BLOCKS (iframe sandbox)
    // ========================================

    M.addHtmlBlockToolbars = function () {
        M.markdownPreview.querySelectorAll('.executable-html-container').forEach(function (container) {
            if (container.querySelector('.code-block-toolbar')) return;

            var isAutorun = container.getAttribute('data-autorun') === 'true';

            var toolbar = document.createElement('div');
            toolbar.className = 'code-block-toolbar';
            toolbar.setAttribute('aria-label', 'HTML sandbox actions');

            if (isAutorun) {
                var preEl = container.querySelector('pre');
                if (preEl) preEl.style.display = 'none';

                var btnToggle = document.createElement('button');
                btnToggle.className = 'code-toolbar-btn code-copy-btn';
                btnToggle.title = 'Show / hide source code';
                btnToggle.innerHTML = '<i class="bi bi-code-slash"></i> Show Code';
                btnToggle.addEventListener('click', function () {
                    if (preEl.style.display === 'none') {
                        preEl.style.display = '';
                        btnToggle.innerHTML = '<i class="bi bi-eye-slash"></i> Hide Code';
                    } else {
                        preEl.style.display = 'none';
                        btnToggle.innerHTML = '<i class="bi bi-code-slash"></i> Show Code';
                    }
                });
                toolbar.appendChild(btnToggle);
                container.insertBefore(toolbar, container.firstChild);

                autorunHtmlBlock(container);
            } else {
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
            }
        });
    };

    function autorunHtmlBlock(container) {
        var codeEl = container.querySelector('code');
        if (!codeEl) return;
        var code = codeEl.textContent;

        var outputEl = document.createElement('div');
        outputEl.className = 'html-preview-output';
        container.appendChild(outputEl);

        var iframe = document.createElement('iframe');
        iframe.className = 'html-preview-frame';
        iframe.setAttribute('sandbox', 'allow-scripts');
        iframe.setAttribute('loading', 'lazy');
        iframe.srcdoc = code;
        outputEl.appendChild(iframe);
        outputEl.style.display = 'block';

        iframe.addEventListener('load', function () {
            try {
                var doc = iframe.contentDocument || iframe.contentWindow.document;
                var height = Math.min(doc.body.scrollHeight + 20, 800);
                iframe.style.height = Math.max(height, 60) + 'px';
            } catch (e) {
                iframe.style.height = '400px';
            }
        });
    }

    function previewHtmlBlock(container, btnPreview) {
        var codeEl = container.querySelector('code');
        if (!codeEl) return;
        var code = codeEl.textContent;

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

        outputEl.innerHTML = '';
        var iframe = document.createElement('iframe');
        iframe.className = 'html-preview-frame';
        iframe.setAttribute('sandbox', 'allow-scripts');
        iframe.setAttribute('loading', 'lazy');
        iframe.srcdoc = code;
        outputEl.appendChild(iframe);
        outputEl.style.display = 'block';

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

        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.setAttribute('sandbox', 'allow-scripts');
        document.body.appendChild(iframe);

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
            if (e.source !== iframe.contentWindow) return;
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
