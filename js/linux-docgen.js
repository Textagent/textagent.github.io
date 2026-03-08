// ============================================
// linux-docgen.js — {{Linux:}} Tag Component
// Embeds a full Linux terminal (WebVM) in the document
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
    // GLOBAL STATE
    // ==============================================

    var webvmWindow = null; // Reference to the opened WebVM window

    // ==============================================
    // TAGGING — insert {{Linux:}} templates
    // ==============================================

    function insertLinuxTag() {
        M.wrapSelectionWith('{{Linux:\n  Packages: ', '\n}}', 'curl, vim, htop');
    }

    // ==============================================
    // PARSING — extract Linux blocks from markdown
    // ==============================================

    function parseLinuxConfig(prompt) {
        var config = { packages: [] };
        var lines = prompt.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            var pkgMatch = line.match(/^Packages:\s*(.+)/i);
            if (pkgMatch) {
                config.packages = pkgMatch[1].split(/[,\s]+/).map(function (p) { return p.trim(); }).filter(Boolean);
                continue;
            }
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
        container.querySelectorAll('.linux-launch').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.linuxIndex, 10);
                launchLinuxTerminal(idx);
            });
        });

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
    // REGISTER TOOLBAR ACTIONS
    // ==============================================

    M.registerFormattingAction('linux-tag', function () { insertLinuxTag(); });

    // ==============================================
    // EXPOSE HOOKS for renderer.js
    // ==============================================

    M.transformLinuxMarkdown = transformLinuxMarkdown;
    M.bindLinuxPreviewActions = bindLinuxPreviewActions;
    M.parseLinuxConfig = parseLinuxConfig;
    M.parseLinuxBlocks = parseLinuxBlocks;

})(window.MDView);
