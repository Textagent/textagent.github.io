// ============================================
// linux-docgen.js — {{Linux:}} Tag Component
// Embeds a full Linux terminal (WebVM) OR compiles/runs
// code via Piston API (C++, Rust, Go, etc.)
// ============================================
(function (M) {
    'use strict';

    // ==============================================
    // HELPERS
    // ==============================================

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function getFencedRanges(md) {
        var ranges = [];
        var re = /^(`{3,}|~{3,}).*$/gm;
        var m, open = null;
        while ((m = re.exec(md)) !== null) {
            if (!open) { open = { start: m.index, fence: m[1] }; }
            else if (m[1].charAt(0) === open.fence.charAt(0) && m[1].length >= open.fence.length) {
                ranges.push({ start: open.start, end: m.index + m[0].length });
                open = null;
            }
        }
        // Inline code spans (`...`)
        var inlineRe = /`([^`\n]+)`/g;
        while ((m = inlineRe.exec(md)) !== null) {
            ranges.push({ start: m.index, end: m.index + m[0].length });
        }
        return ranges;
    }

    function isInsideFence(pos, fencedRanges) {
        for (var i = 0; i < fencedRanges.length; i++) {
            if (pos >= fencedRanges[i].start && pos < fencedRanges[i].end) return true;
        }
        return false;
    }

    function showToast(msg, type) {
        if (M._showToast) { M._showToast(msg, type); }
        else { console.log('[Linux] ' + msg); }
    }

    // ==============================================
    // CONFIGURATION — Judge0 CE API
    // ==============================================

    var JUDGE0_API_URL = 'https://ce.judge0.com';

    // Language display names, file extensions, and Judge0 language IDs
    var LANG_META = {
        'c': { name: 'C', ext: 'c', icon: '🔵', color: '#555555', judge0Id: 103 },
        'cpp': { name: 'C++', ext: 'cpp', icon: '🔷', color: '#00599C', judge0Id: 105 },
        'c++': { name: 'C++', ext: 'cpp', icon: '🔷', color: '#00599C', judge0Id: 105 },
        'rust': { name: 'Rust', ext: 'rs', icon: '🦀', color: '#CE422B', judge0Id: 108 },
        'go': { name: 'Go', ext: 'go', icon: '🐹', color: '#00ADD8', judge0Id: 107 },
        'golang': { name: 'Go', ext: 'go', icon: '🐹', color: '#00ADD8', judge0Id: 107 },
        'java': { name: 'Java', ext: 'java', icon: '☕', color: '#B07219', judge0Id: 91 },
        'python': { name: 'Python', ext: 'py', icon: '🐍', color: '#3572A5', judge0Id: 100 },
        'python3': { name: 'Python', ext: 'py', icon: '🐍', color: '#3572A5', judge0Id: 100 },
        'py': { name: 'Python', ext: 'py', icon: '🐍', color: '#3572A5', judge0Id: 100 },
        'typescript': { name: 'TypeScript', ext: 'ts', icon: '📘', color: '#3178C6', judge0Id: 101 },
        'ts': { name: 'TypeScript', ext: 'ts', icon: '📘', color: '#3178C6', judge0Id: 101 },
        'javascript': { name: 'JavaScript', ext: 'js', icon: '⚡', color: '#F7DF1E', judge0Id: 102 },
        'js': { name: 'JavaScript', ext: 'js', icon: '⚡', color: '#F7DF1E', judge0Id: 102 },
        'ruby': { name: 'Ruby', ext: 'rb', icon: '💎', color: '#CC342D', judge0Id: 72 },
        'swift': { name: 'Swift', ext: 'swift', icon: '🐦', color: '#F05138', judge0Id: 83 },
        'kotlin': { name: 'Kotlin', ext: 'kt', icon: '🟣', color: '#A97BFF', judge0Id: 111 },
        'haskell': { name: 'Haskell', ext: 'hs', icon: '🟪', color: '#5e5086', judge0Id: 61 },
        'lua': { name: 'Lua', ext: 'lua', icon: '🌙', color: '#000080', judge0Id: 64 },
        'perl': { name: 'Perl', ext: 'pl', icon: '🐪', color: '#39457E', judge0Id: 85 },
        'php': { name: 'PHP', ext: 'php', icon: '🐘', color: '#4F5D95', judge0Id: 98 },
        'r': { name: 'R', ext: 'r', icon: '📊', color: '#276DC3', judge0Id: 99 },
        'bash': { name: 'Bash', ext: 'sh', icon: '🖥️', color: '#4EAA25', judge0Id: 46 },
        'sh': { name: 'Bash', ext: 'sh', icon: '🖥️', color: '#4EAA25', judge0Id: 46 },
        'csharp': { name: 'C#', ext: 'cs', icon: '🟢', color: '#178600', judge0Id: 51 },
        'dart': { name: 'Dart', ext: 'dart', icon: '🎯', color: '#0175C2', judge0Id: 90 },
        'scala': { name: 'Scala', ext: 'scala', icon: '🔴', color: '#DC322F', judge0Id: 112 },
    };

    // ==============================================
    // GLOBAL STATE
    // ==============================================

    var webvmWindow = null; // Reference to the opened WebVM window

    // ==============================================
    // TAGGING — insert {{Linux:}} templates
    // ==============================================

    function insertLinuxTag() {
        M.wrapSelectionWith('{{Linux:\n  Packages: ', '\n}}', 'curl, vim, htop');
    }

    function insertLinuxScriptTag() {
        M.wrapSelectionWith('{{Linux:\n  Language: cpp\n  Script: |\n    ', '\n}}',
            '#include <iostream>\n    int main() {\n        std::cout << "Hello from C++!" << std::endl;\n        return 0;\n    }');
    }

    // ==============================================
    // PARSING — extract Linux blocks from markdown
    // ==============================================

    function parseLinuxConfig(prompt) {
        var config = { packages: [], language: '', script: '', stdin: '' };
        var lines = prompt.split('\n');
        var inScript = false;
        var scriptLines = [];
        var scriptIndent = 0;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.trim();

            // If we're collecting script lines
            if (inScript) {
                // Check if this line is a new top-level field (not indented enough)
                var fieldMatch = trimmed.match(/^(Packages|Language|Stdin):\s*/i);
                if (fieldMatch && line.search(/\S/) <= scriptIndent) {
                    inScript = false;
                    // Fall through to process this line as a field
                } else {
                    // Remove the common indent prefix
                    var deindented = line;
                    if (scriptIndent > 0) {
                        var leadingSpaces = line.match(/^(\s*)/)[1].length;
                        deindented = leadingSpaces >= scriptIndent
                            ? line.substring(scriptIndent)
                            : line.trimStart();
                    }
                    scriptLines.push(deindented);
                    continue;
                }
            }

            var pkgMatch = trimmed.match(/^Packages:\s*(.+)/i);
            if (pkgMatch) {
                config.packages = pkgMatch[1].split(/[,\s]+/).map(function (p) { return p.trim(); }).filter(Boolean);
                continue;
            }

            var langMatch = trimmed.match(/^Language:\s*(.+)/i);
            if (langMatch) {
                config.language = langMatch[1].trim().toLowerCase();
                continue;
            }

            var stdinMatch = trimmed.match(/^Stdin:\s*(.+)/i);
            if (stdinMatch) {
                config.stdin = stdinMatch[1].trim();
                continue;
            }

            var scriptMatch = trimmed.match(/^Script:\s*\|?\s*$/i);
            if (scriptMatch) {
                inScript = true;
                // Determine the indent of the next line
                if (i + 1 < lines.length) {
                    var nextLine = lines[i + 1];
                    scriptIndent = nextLine.match(/^(\s*)/)[1].length;
                }
                continue;
            }

            // Single-line script
            var scriptInlineMatch = trimmed.match(/^Script:\s*(.+)/i);
            if (scriptInlineMatch && !scriptInlineMatch[1].startsWith('|')) {
                config.script = scriptInlineMatch[1];
                continue;
            }
        }

        if (scriptLines.length > 0) {
            config.script = scriptLines.join('\n');
        }

        return config;
    }

    function parseLinuxBlocks(markdown) {
        var blocks = [];
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{Linux:\s*([\s\S]*?)\}\}/g;
        var match;
        while ((match = re.exec(markdown)) !== null) {
            if (!isInsideFence(match.index, fencedRanges)) {
                var block = {
                    type: 'Linux',
                    prompt: match[1].trim(),
                    start: match.index,
                    end: match.index + match[0].length,
                    fullMatch: match[0],
                    linuxConfig: parseLinuxConfig(match[1].trim())
                };
                blocks.push(block);
            }
        }
        return blocks;
    }

    // ==============================================
    // RENDERING — transform {{Linux:}} tags into cards
    // ==============================================

    function transformLinuxMarkdown(markdown) {
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{Linux:\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);

            var prompt = match[1].trim();
            var cfg = parseLinuxConfig(prompt);

            var isScriptMode = cfg.language && cfg.script;

            if (isScriptMode) {
                // ---- SCRIPT / COMPILE MODE ----
                var meta = LANG_META[cfg.language] || { name: cfg.language.toUpperCase(), ext: cfg.language, icon: '📄', color: '#6e7681' };

                // Language badge
                var langBadge = '<span class="linux-lang-badge" style="background:' + meta.color + '20;color:' + meta.color + ';border-color:' + meta.color + '40">'
                    + meta.icon + ' ' + escapeHtml(meta.name) + '</span>';

                // Script code preview (first 8 lines + ellipsis)
                var scriptPreviewLines = cfg.script.split('\n');
                var truncated = scriptPreviewLines.length > 8;
                var previewCode = scriptPreviewLines.slice(0, 8).join('\n');
                if (truncated) previewCode += '\n// ... (' + (scriptPreviewLines.length - 8) + ' more lines)';

                result += '<div class="ai-placeholder-card linux-terminal-card linux-script-card" data-ai-type="Linux" data-linux-index="' + blockIndex + '" data-linux-lang="' + escapeHtml(cfg.language) + '">'
                    + '<div class="ai-placeholder-header">'
                    + '<span class="ai-placeholder-icon">🐧</span>'
                    + '<span class="ai-placeholder-label">Linux — Compile & Run ' + langBadge + '</span>'
                    + '<div class="ai-placeholder-actions">'
                    + '<button class="ai-placeholder-btn linux-run-script" data-linux-index="' + blockIndex + '" title="Compile & Run">▶ Run</button>'
                    + '<button class="ai-placeholder-btn linux-remove-tag" data-linux-index="' + blockIndex + '" title="Remove tag">✕</button>'
                    + '</div></div>'
                    + '<div class="linux-script-area"><pre><code>' + escapeHtml(previewCode) + '</code></pre></div>'
                    + '<div class="linux-run-output" id="linux-output-' + blockIndex + '" style="display:none"></div>'
                    + '</div>';

            } else {
                // ---- TERMINAL MODE (existing behavior) ----
                // Package badges
                var pkgHtml = '';
                if (cfg.packages.length > 0) {
                    pkgHtml = '<div class="linux-packages">';
                    for (var p = 0; p < cfg.packages.length; p++) {
                        pkgHtml += '<span class="linux-pkg-badge">' + escapeHtml(cfg.packages[p]) + '</span>';
                    }
                    pkgHtml += '</div>';
                }

                // Check if window is still open
                var isRunning = webvmWindow && !webvmWindow.closed;
                var statusLabel = isRunning ? ' <span class="linux-status-running">● Running</span>' : '';
                var btnLabel = isRunning ? '🖥️ Focus' : '▶ Launch';

                result += '<div class="ai-placeholder-card linux-terminal-card" data-ai-type="Linux" data-linux-index="' + blockIndex + '">'
                    + '<div class="ai-placeholder-header">'
                    + '<span class="ai-placeholder-icon">🐧</span>'
                    + '<span class="ai-placeholder-label">Linux Terminal' + statusLabel + '</span>'
                    + '<div class="ai-placeholder-actions">'
                    + '<button class="ai-placeholder-btn linux-launch" data-linux-index="' + blockIndex + '" title="Open Linux Terminal">' + btnLabel + '</button>'
                    + '<button class="ai-placeholder-btn linux-remove-tag" data-linux-index="' + blockIndex + '" title="Remove tag">✕</button>'
                    + '</div></div>'
                    + pkgHtml
                    + '<div class="linux-info"><small>💡 Opens WebVM in a new window — full Debian Linux with keyboard, networking, and persistence</small></div>'
                    + '</div>';
            }

            lastIndex = match.index + match[0].length;
            blockIndex++;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // PREVIEW ACTIONS — bind Linux card buttons
    // ==============================================

    function bindLinuxPreviewActions(container) {
        // --- Launch terminal buttons (existing) ---
        container.querySelectorAll('.linux-launch').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.linuxIndex, 10);
                launchLinuxTerminal(idx);
            });
        });

        // --- Run script buttons (NEW) ---
        container.querySelectorAll('.linux-run-script').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.linuxIndex, 10);
                executeCode(idx, this);
            });
        });

        // --- Remove tag buttons ---
        container.querySelectorAll('.linux-remove-tag').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.linuxIndex, 10);
                var text = M.markdownEditor.value;
                var blocks = parseLinuxBlocks(text);
                if (idx < blocks.length) {
                    var block = blocks[idx];
                    var before = text.substring(0, block.start);
                    var after = text.substring(block.end);
                    if (after.charAt(0) === '\n') after = after.substring(1);
                    M.markdownEditor.value = before + after;
                    M.renderMarkdown();
                    showToast('Linux tag removed.', 'info');
                }
            });
        });
    }

    // ==============================================
    // LAUNCH — open WebVM in a new window
    // ==============================================

    function launchLinuxTerminal(blockIndex) {
        // If window is already open, just focus it
        if (webvmWindow && !webvmWindow.closed) {
            webvmWindow.focus();
            showToast('🐧 Focused existing Linux terminal window.', 'info');
            return;
        }

        // Open WebVM in a new window
        var width = Math.min(1200, screen.width - 100);
        var height = Math.min(700, screen.height - 150);
        var left = Math.round((screen.width - width) / 2);
        var top = Math.round((screen.height - height) / 2);

        webvmWindow = window.open(
            'https://webvm.io',
            'webvm_terminal',
            'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top +
            ',menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes'
        );

        if (!webvmWindow) {
            showToast('❌ Pop-up blocked! Please allow pop-ups for this site.', 'error');
            return;
        }

        // Update card status
        M.renderMarkdown();

        // Monitor when the window is closed
        var checkInterval = setInterval(function () {
            if (webvmWindow && webvmWindow.closed) {
                webvmWindow = null;
                clearInterval(checkInterval);
                M.renderMarkdown(); // Update card status
                showToast('Linux terminal window closed.', 'info');
            }
        }, 2000);

        showToast('🐧 Linux terminal opened in new window!', 'success');
    }

    // ==============================================
    // EXECUTE — compile & run via Judge0 CE API
    // ==============================================

    function executeCode(blockIndex, btnRun) {
        var text = M.markdownEditor.value;
        var blocks = parseLinuxBlocks(text);
        if (blockIndex >= blocks.length) return;

        var cfg = blocks[blockIndex].linuxConfig;
        if (!cfg.language || !cfg.script) {
            showToast('❌ Missing Language or Script in this Linux tag.', 'error');
            return;
        }

        // Find the output container in the DOM
        var outputEl = document.getElementById('linux-output-' + blockIndex);
        if (!outputEl) {
            var card = document.querySelector('.linux-script-card[data-linux-index="' + blockIndex + '"]');
            if (card) { outputEl = card.querySelector('.linux-run-output'); }
        }
        if (!outputEl) return;

        // Look up Judge0 language ID
        var meta = LANG_META[cfg.language];
        if (!meta || !meta.judge0Id) {
            outputEl.style.display = 'block';
            outputEl.innerHTML = '<div class="linux-output-error">❌ Unsupported language: ' + escapeHtml(cfg.language) + '</div>';
            return;
        }

        // UI: show loading
        btnRun.disabled = true;
        btnRun.textContent = '⏳ Compiling...';
        outputEl.style.display = 'block';
        outputEl.innerHTML = '<div class="linux-output-loading"><i class="bi bi-arrow-repeat spin"></i> Compiling & running via Judge0 CE...</div>';

        var apiUrl = (M.judge0ApiUrl || JUDGE0_API_URL) + '/submissions?base64_encoded=false&wait=true';

        var payload = {
            language_id: meta.judge0Id,
            source_code: cfg.script,
            stdin: cfg.stdin || ''
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(function (res) {
                if (!res.ok) {
                    return res.text().then(function (t) {
                        throw new Error('HTTP ' + res.status + ': ' + t);
                    });
                }
                return res.json();
            })
            .then(function (data) {
                var html = '';

                // Status descriptions from Judge0
                // id=3: Accepted, id=5: Time Limit Exceeded, id=6: Compilation Error, etc.
                var statusId = data.status && data.status.id;
                var statusDesc = data.status && data.status.description;

                // Compilation error (status id = 6)
                if (statusId === 6 && data.compile_output) {
                    html += '<div class="linux-compile-section">'
                        + '<div class="linux-output-label">❌ Compilation Error</div>'
                        + '<pre class="linux-output-stderr">' + escapeHtml(data.compile_output) + '</pre>'
                        + '</div>';
                    outputEl.innerHTML = html;
                    btnRun.disabled = false;
                    btnRun.textContent = '▶ Run';
                    return;
                }

                // Runtime error (status id = 11) or other errors
                if (statusId >= 7 && statusId <= 14) {
                    if (data.stderr) {
                        html += '<div class="linux-run-section">'
                            + '<div class="linux-output-label">⚠️ ' + escapeHtml(statusDesc || 'Error') + '</div>'
                            + '<pre class="linux-output-stderr">' + escapeHtml(data.stderr) + '</pre>'
                            + '</div>';
                    } else if (data.message) {
                        html += '<div class="linux-output-error">⚠️ ' + escapeHtml(data.message) + '</div>';
                    } else {
                        html += '<div class="linux-output-error">⚠️ ' + escapeHtml(statusDesc || 'Execution error') + '</div>';
                    }
                }

                // Standard output
                if (data.stdout) {
                    html += '<div class="linux-run-section">'
                        + '<div class="linux-output-label">📤 Output</div>'
                        + '<pre class="linux-output-stdout">' + escapeHtml(data.stdout) + '</pre>'
                        + '</div>';
                }

                // Stderr (may also appear on successful runs as warnings)
                if (data.stderr && statusId < 7) {
                    html += '<div class="linux-run-section">'
                        + '<div class="linux-output-label">⚠️ Stderr</div>'
                        + '<pre class="linux-output-stderr">' + escapeHtml(data.stderr) + '</pre>'
                        + '</div>';
                }

                // Compile output (warnings from successful compilations)
                if (data.compile_output && statusId !== 6) {
                    html += '<div class="linux-compile-section">'
                        + '<div class="linux-output-label">⚙️ Compiler</div>'
                        + '<pre class="linux-output-stderr">' + escapeHtml(data.compile_output) + '</pre>'
                        + '</div>';
                }

                // Execution stats
                if (data.time || data.memory) {
                    var stats = '⏱️ ';
                    if (data.time) stats += data.time + 's';
                    if (data.time && data.memory) stats += ' · ';
                    if (data.memory) stats += Math.round(data.memory / 1024) + ' KB';
                    html += '<div class="linux-output-stats">' + stats + '</div>';
                }

                if (!html) {
                    html = '<div class="linux-output-muted">(no output)</div>';
                }

                outputEl.innerHTML = html;
            })
            .catch(function (err) {
                outputEl.innerHTML = '<div class="linux-output-error">❌ ' + escapeHtml(err.message) + '</div>';
            })
            .finally(function () {
                btnRun.disabled = false;
                btnRun.textContent = '▶ Run';
            });
    }

    // ==============================================
    // REGISTER TOOLBAR ACTIONS
    // ==============================================

    M.registerFormattingAction('linux-tag', function () { insertLinuxTag(); });
    M.registerFormattingAction('linux-script-tag', function () { insertLinuxScriptTag(); });

    // Language-specific script tags
    M.registerFormattingAction('linux-cpp-tag', function () {
        M.insertAtCursor('\n{{Linux:\n  Language: cpp\n  Script: |\n    #include <iostream>\n    int main() {\n        std::cout << "Hello from C++!" << std::endl;\n        return 0;\n    }\n}}\n');
    });

    M.registerFormattingAction('linux-rust-tag', function () {
        M.insertAtCursor('\n{{Linux:\n  Language: rust\n  Script: |\n    fn main() {\n        println!("Hello from Rust!");\n    }\n}}\n');
    });

    M.registerFormattingAction('linux-go-tag', function () {
        M.insertAtCursor('\n{{Linux:\n  Language: go\n  Script: |\n    package main\n    import "fmt"\n    func main() {\n        fmt.Println("Hello from Go!")\n    }\n}}\n');
    });

    M.registerFormattingAction('linux-java-tag', function () {
        M.insertAtCursor('\n{{Linux:\n  Language: java\n  Script: |\n    public class Main {\n        public static void main(String[] args) {\n            System.out.println("Hello from Java!");\n        }\n    }\n}}\n');
    });

    // ==============================================
    // EXPOSE HOOKS for renderer.js
    // ==============================================

    M.transformLinuxMarkdown = transformLinuxMarkdown;
    M.bindLinuxPreviewActions = bindLinuxPreviewActions;
    M.parseLinuxConfig = parseLinuxConfig;
    M.parseLinuxBlocks = parseLinuxBlocks;

    // --- Register runtime adapter for exec-controller ---
    var linuxAdapter = {
        execute: function (source, block) {
            var parsedBlocks = parseLinuxBlocks(M.markdownEditor.value);
            var parsedBlock = null;
            for (var i = 0; i < parsedBlocks.length; i++) {
                if (parsedBlocks[i].fullMatch === block._fullMatch) {
                    parsedBlock = parsedBlocks[i];
                    break;
                }
            }
            var cfg = parsedBlock ? parsedBlock.linuxConfig : parseLinuxConfig(source);
            if (!cfg || !cfg.language || !cfg.script) {
                return Promise.reject(new Error('Missing Language or Script'));
            }

            var meta = LANG_META[cfg.language];
            if (!meta || !meta.judge0Id) {
                return Promise.reject(new Error('Unsupported language: ' + cfg.language));
            }

            var apiUrl = (M.judge0ApiUrl || JUDGE0_API_URL) + '/submissions?base64_encoded=false&wait=true';
            var payload = {
                language_id: meta.judge0Id,
                source_code: cfg.script,
                stdin: cfg.stdin || ''
            };

            return fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(function (res) {
                if (!res.ok) {
                    return res.text().then(function (t) {
                        throw new Error('HTTP ' + res.status + ': ' + t);
                    });
                }
                return res.json();
            })
            .then(function (data) {
                var output = '';
                if (data.compile_output && data.status && data.status.id === 6) {
                    return 'Compilation Error:\n' + data.compile_output;
                }
                if (data.stdout) output += data.stdout;
                if (data.stderr) output += (output ? '\n' : '') + data.stderr;
                if (data.compile_output && data.status && data.status.id !== 6) {
                    output += (output ? '\n' : '') + 'Compiler: ' + data.compile_output;
                }
                return output || '(no output)';
            });
        }
    };

    if (M._execRegistry) {
        M._execRegistry.registerRuntime('linux-script', linuxAdapter);
    } else {
        if (!M._pendingRuntimeAdapters) M._pendingRuntimeAdapters = [];
        M._pendingRuntimeAdapters.push({ key: 'linux-script', adapter: linuxAdapter });
    }

})(window.MDView);
