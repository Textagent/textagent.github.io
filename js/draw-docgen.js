// ============================================
// draw-docgen.js — {{Draw:}} Tag Component
// Embeds Excalidraw whiteboard OR Mermaid diagram editor
// Standalone module — remove this file + its CSS + loader line to disable
// ============================================
(function (M) {
    'use strict';

    // ==============================================
    // HELPERS
    // ==============================================

    function escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
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
        else if (M.showToast) { M.showToast(msg, type); }
        else { console.log('[Draw] ' + msg); }
    }

    // ==============================================
    // CONSTANTS
    // ==============================================

    var TOOL_LABELS = {
        excalidraw: 'Excalidraw',
        mermaid: 'Mermaid'
    };

    var DEFAULT_MERMAID = 'graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Result 1]\n    B -->|No| D[Result 2]\n    C --> E[End]\n    D --> E';

    // ==============================================
    // GLOBAL STATE
    // ==============================================

    // Store drawing scene data per block index (survives re-renders)
    var drawingData = new Map();

    // Store mermaid source per block index
    var mermaidSource = new Map();

    // Store localStorage key prefix
    var STORAGE_PREFIX = 'textagent-draw-';

    // Track active iframes to set up message listeners only once
    var activeIframes = new Map();

    // ==============================================
    // PERSISTENCE — save/load from localStorage
    // ==============================================

    function saveDrawing(blockIndex, sceneData) {
        drawingData.set(blockIndex, sceneData);
        try {
            localStorage.setItem(STORAGE_PREFIX + blockIndex, JSON.stringify(sceneData));
        } catch (e) {
            console.warn('[Draw] localStorage save failed:', e);
        }
    }

    function loadDrawing(blockIndex) {
        if (drawingData.has(blockIndex)) return drawingData.get(blockIndex);
        try {
            var stored = localStorage.getItem(STORAGE_PREFIX + blockIndex);
            if (stored) {
                var parsed = JSON.parse(stored);
                drawingData.set(blockIndex, parsed);
                return parsed;
            }
        } catch (e) {
            console.warn('[Draw] localStorage load failed:', e);
        }
        return null;
    }

    function saveMermaidSource(blockIndex, src) {
        mermaidSource.set(blockIndex, src);
        try {
            localStorage.setItem(STORAGE_PREFIX + 'mermaid-' + blockIndex, src);
        } catch (e) { /* ignore */ }
    }

    function loadMermaidSource(blockIndex) {
        if (mermaidSource.has(blockIndex)) return mermaidSource.get(blockIndex);
        try {
            var stored = localStorage.getItem(STORAGE_PREFIX + 'mermaid-' + blockIndex);
            if (stored) {
                mermaidSource.set(blockIndex, stored);
                return stored;
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    // ==============================================
    // TAGGING — insert {{Draw:}} template
    // ==============================================

    function insertDrawTag() {
        M.wrapSelectionWith('{{Draw: ', '}}', 'my-diagram');
    }

    // ==============================================
    // PARSING — extract Draw blocks from markdown
    // ==============================================

    function parseDrawBlocks(markdown) {
        var blocks = [];
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?Draw:\s*([\s\S]*?)\}\}/g;
        var match;
        while ((match = re.exec(markdown)) !== null) {
            if (!isInsideFence(match.index, fencedRanges)) {
                blocks.push({
                    type: 'Draw',
                    prompt: match[1].trim(),
                    start: match.index,
                    end: match.index + match[0].length,
                    fullMatch: match[0]
                });
            }
        }
        return blocks;
    }

    // ==============================================
    // RENDERING — transform {{Draw:}} tags into cards
    // ==============================================

    function transformDrawMarkdown(markdown) {
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?Draw:\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);

            var prompt = match[1].trim();

            // Parse @tool: field (excalidraw or mermaid)
            var toolMatch = prompt.match(/(?:^|\s)(?:@tool|Tool):\s*(\S+)/mi);
            var drawTool = toolMatch ? toolMatch[1].trim().toLowerCase() : 'excalidraw';
            if (!TOOL_LABELS[drawTool]) drawTool = 'excalidraw';

            // Strip metadata fields for display name
            var diagramName = prompt
                .replace(/(?:^|\s)(?:@tool|Tool):\s*\S+/mi, '')
                .trim() || 'Untitled';

            // Check state
            var hasData = drawingData.has(blockIndex) || !!loadDrawing(blockIndex);
            var hasMermaid = mermaidSource.has(blockIndex) || !!loadMermaidSource(blockIndex);
            var isOpen = activeIframes.has(blockIndex);
            var statusHtml = isOpen ? ' <span class="draw-docgen-status">● Active</span>' : '';
            var openLabel = isOpen ? '🖥️ Focus' : (hasData ? '✏️ Edit' : '▶ Open');

            // Tool pills
            var pillsHtml = '<div class="draw-tool-pills" data-draw-index="' + blockIndex + '">'
                + '<button class="draw-tool-pill' + (drawTool === 'excalidraw' ? ' active' : '') + '" data-tool="excalidraw" data-draw-index="' + blockIndex + '">🎨 Excalidraw</button>'
                + '<button class="draw-tool-pill' + (drawTool === 'mermaid' ? ' active' : '') + '" data-tool="mermaid" data-draw-index="' + blockIndex + '">📊 Mermaid</button>'
                + '</div>';

            // Mermaid editor area (shown only in mermaid mode)
            var mermaidSrc = loadMermaidSource(blockIndex) || DEFAULT_MERMAID;
            var mermaidEditorHtml = '<div class="draw-mermaid-editor" data-draw-index="' + blockIndex + '"' + (drawTool !== 'mermaid' ? ' style="display:none"' : '') + '>'
                + '<textarea class="draw-mermaid-input" data-draw-index="' + blockIndex + '" placeholder="Enter Mermaid diagram code…" rows="6" spellcheck="false">' + escapeHtml(mermaidSrc) + '</textarea>'
                + '<div class="draw-mermaid-actions">'
                + '<button class="draw-docgen-btn draw-mermaid-render" data-draw-index="' + blockIndex + '" title="Render diagram">▶ Render</button>'
                + '<button class="draw-docgen-btn draw-mermaid-insert" data-draw-index="' + blockIndex + '" title="Insert as Mermaid code block in editor">📋 Insert</button>'
                + '</div>'
                + '<div class="draw-mermaid-preview" data-draw-index="' + blockIndex + '"></div>'
                + '</div>';

            result += '<div class="draw-docgen-card" data-draw-index="' + blockIndex + '" data-draw-tool="' + escapeHtml(drawTool) + '">'
                + '<div class="draw-docgen-header">'
                + '<span class="draw-docgen-icon">' + (drawTool === 'mermaid' ? '📊' : '🎨') + '</span>'
                + '<span class="draw-docgen-label">' + TOOL_LABELS[drawTool] + statusHtml + '</span>'
                + (diagramName !== 'Untitled' ? '<span class="draw-docgen-name">' + escapeHtml(diagramName) + '</span>' : '')
                + '<div class="draw-docgen-actions">'
                + (drawTool === 'excalidraw'
                    ? '<button class="draw-docgen-btn draw-docgen-open" data-draw-index="' + blockIndex + '" title="Open Excalidraw whiteboard">' + openLabel + '</button>'
                      + '<button class="draw-docgen-btn draw-docgen-insert-img" data-draw-index="' + blockIndex + '" title="Insert diagram as image in markdown"' + (hasData || isOpen ? '' : ' style="display:none"') + '>📋 Insert</button>'
                      + '<button class="draw-docgen-btn draw-docgen-export-png" data-draw-index="' + blockIndex + '" title="Download as PNG"' + (hasData ? '' : ' style="display:none"') + '>📥 PNG</button>'
                      + '<button class="draw-docgen-btn draw-docgen-export-svg" data-draw-index="' + blockIndex + '" title="Download as SVG"' + (hasData ? '' : ' style="display:none"') + '>📥 SVG</button>'
                      + '<button class="draw-docgen-btn draw-docgen-fullscreen" data-draw-index="' + blockIndex + '" title="Fullscreen"' + (isOpen ? '' : ' style="display:none"') + '>⛶</button>'
                      + '<button class="draw-docgen-btn draw-docgen-close" data-draw-index="' + blockIndex + '" title="Close Excalidraw"' + (isOpen ? '' : ' style="display:none"') + '>⏹ Close</button>'
                    : '')
                + '<button class="draw-docgen-btn draw-docgen-remove" data-draw-index="' + blockIndex + '" title="Remove tag">✕</button>'
                + '</div></div>'
                + pillsHtml
                + mermaidEditorHtml
                + '<div class="draw-docgen-preview" data-draw-index="' + blockIndex + '"'
                + (drawTool === 'excalidraw' && isOpen ? '' : ' style="display:none"') + '></div>'
                + (drawTool === 'excalidraw' && !isOpen && !hasData ? '<div class="draw-docgen-info"><small>💡 Click <strong>Open</strong> to launch Excalidraw whiteboard — draw diagrams, wireframes, and sketches inline in your document</small></div>' : '')
                + '</div>';

            lastIndex = match.index + match[0].length;
            blockIndex++;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // EXCALIDRAW IFRAME — create and manage
    // ==============================================

    function createExcalidrawIframe(blockIndex, container) {
        var preview = container.querySelector('.draw-docgen-preview[data-draw-index="' + blockIndex + '"]');
        if (!preview) return;

        // If iframe already exists, just focus
        if (preview.querySelector('.draw-docgen-iframe')) {
            preview.style.display = '';
            return;
        }

        // Build Excalidraw HTML to embed in blob iframe
        var savedData = loadDrawing(blockIndex);

        // Use self-hosted embed page — avoids esm.sh/CSP/React issues
        var iframe = document.createElement('iframe');
        iframe.className = 'draw-docgen-iframe';
        iframe.src = '/excalidraw-embed.html';
        iframe.setAttribute('allow', 'clipboard-read; clipboard-write');

        // Send saved scene data once iframe is ready
        iframe.addEventListener('load', function () {
            iframe.contentWindow.postMessage({ type: 'set-draw-index', drawIndex: blockIndex }, '*');
            if (savedData) {
                iframe.contentWindow.postMessage({ type: 'load-scene', drawIndex: blockIndex, data: savedData }, '*');
            }
        });

        preview.innerHTML = '';
        preview.style.display = '';
        preview.appendChild(iframe);

        activeIframes.set(blockIndex, iframe);

        // Show all action buttons, update open label, hide info hint
        var card = preview.closest('.draw-docgen-card');
        if (card) {
            var closeBtn = card.querySelector('.draw-docgen-close');
            var fullscreenBtn = card.querySelector('.draw-docgen-fullscreen');
            var openBtn = card.querySelector('.draw-docgen-open');
            var insertBtn = card.querySelector('.draw-docgen-insert-img');
            var pngBtn = card.querySelector('.draw-docgen-export-png');
            var svgBtn = card.querySelector('.draw-docgen-export-svg');
            var info = card.querySelector('.draw-docgen-info');
            if (closeBtn) closeBtn.style.display = '';
            if (fullscreenBtn) fullscreenBtn.style.display = '';
            if (insertBtn) insertBtn.style.display = '';
            if (pngBtn) pngBtn.style.display = '';
            if (svgBtn) svgBtn.style.display = '';
            if (openBtn) openBtn.textContent = '🖥️ Focus';
            if (info) info.style.display = 'none';
        }

        showToast('🎨 Excalidraw whiteboard opened!', 'success');
    }

    function closeExcalidraw(blockIndex) {
        var iframe = activeIframes.get(blockIndex);
        if (iframe) {
            iframe.remove();
            activeIframes.delete(blockIndex);
        }
        M.renderMarkdown();
        showToast('Excalidraw closed.', 'info');
    }

    // ==============================================
    // MERMAID — render diagram inline
    // ==============================================

    async function renderMermaidDiagram(blockIndex, container) {
        var textarea = container.querySelector('.draw-mermaid-input[data-draw-index="' + blockIndex + '"]');
        var previewDiv = container.querySelector('.draw-mermaid-preview[data-draw-index="' + blockIndex + '"]');
        if (!textarea || !previewDiv) return;

        var src = textarea.value.trim();
        if (!src) {
            showToast('⚠️ Enter Mermaid diagram code first.', 'warning');
            return;
        }

        saveMermaidSource(blockIndex, src);

        try {
            var mermaidLib = await window.getMermaid();
            if (M.initMermaid) await M.initMermaid();

            var uniqueId = 'draw-mermaid-' + blockIndex + '-' + Math.random().toString(36).substr(2, 6);
            previewDiv.innerHTML = '<div class="mermaid" id="' + uniqueId + '">' + escapeHtml(src) + '</div>';

            await mermaidLib.run({ nodes: [previewDiv.querySelector('.mermaid')], suppressErrors: true });

            // Add mermaid toolbars if available
            if (M.addMermaidToolbars) M.addMermaidToolbars();

            showToast('📊 Mermaid diagram rendered!', 'success');
        } catch (e) {
            previewDiv.innerHTML = '<div style="color:#ef4444;padding:8px;font-size:0.82rem">❌ Mermaid error: ' + escapeHtml(e.message) + '</div>';
            console.warn('[Draw] Mermaid render error:', e);
        }
    }

    function insertMermaidAsCodeBlock(blockIndex, container) {
        var textarea = container.querySelector('.draw-mermaid-input[data-draw-index="' + blockIndex + '"]');
        if (!textarea) return;

        var src = textarea.value.trim();
        if (!src) {
            showToast('⚠️ Enter Mermaid diagram code first.', 'warning');
            return;
        }

        // Insert as ```mermaid code block at cursor
        var codeBlock = '\n```mermaid\n' + src + '\n```\n';
        if (M.insertAtCursor) {
            M.insertAtCursor(codeBlock);
        } else {
            var editor = M.markdownEditor;
            var pos = editor.selectionStart;
            editor.value = editor.value.substring(0, pos) + codeBlock + editor.value.substring(pos);
        }
        M.renderMarkdown();
        showToast('📊 Mermaid code block inserted in editor!', 'success');
    }

    // ==============================================
    // MESSAGE LISTENER — receive data from iframe
    // ==============================================

    var _messageListenerAdded = false;
    function ensureMessageListener() {
        if (_messageListenerAdded) return;
        _messageListenerAdded = true;

        window.addEventListener('message', function (e) {
            if (!e.data || typeof e.data !== 'object') return;

            if (e.data.type === 'excalidraw-change') {
                var idx = e.data.drawIndex;
                if (typeof idx === 'number' && e.data.data) {
                    saveDrawing(idx, e.data.data);
                    var card = document.querySelector('.draw-docgen-card[data-draw-index="' + idx + '"]');
                    if (card) {
                        var pngBtn = card.querySelector('.draw-docgen-export-png');
                        var svgBtn = card.querySelector('.draw-docgen-export-svg');
                        var insertBtn = card.querySelector('.draw-docgen-insert-img');
                        if (pngBtn) pngBtn.style.display = '';
                        if (svgBtn) svgBtn.style.display = '';
                        if (insertBtn) insertBtn.style.display = '';
                    }
                }
            }

            if (e.data.type === 'export-result') {
                if (_pendingInsertIndex >= 0) {
                    insertDrawingIntoMarkdown(e.data);
                } else {
                    handleExportResult(e.data);
                }
            }

            if (e.data.type === 'export-error') {
                showToast('❌ Export failed: ' + e.data.message, 'error');
            }
        });
    }

    // ==============================================
    // INSERT — embed diagram as image in markdown
    // ==============================================

    var _pendingInsertIndex = -1;

    function insertDrawingIntoMarkdown(data) {
        if (data.format === 'png' && data.data) {
            var blockIndex = _pendingInsertIndex;

            // Store image in registry with short ID (same pattern as {{Image:}} tag)
            if (!M._genImages) M._genImages = {};
            var genId = 'draw-' + Math.random().toString(36).substring(2, 10);
            M._genImages[genId] = data.data;
            var imgMarkdown = '\n![Excalidraw diagram](gen-img:' + genId + ')\n';

            // Replace the {{Draw:}} tag with the image
            var text = M.markdownEditor.value;
            var blocks = parseDrawBlocks(text);
            if (blockIndex >= 0 && blockIndex < blocks.length) {
                var block = blocks[blockIndex];
                var before = text.substring(0, block.start);
                var after = text.substring(block.end);
                if (after.charAt(0) === '\n') after = after.substring(1);
                M.markdownEditor.value = before + imgMarkdown + after;
            } else {
                // Fallback: insert at cursor if block not found
                if (M.insertAtCursor) {
                    M.insertAtCursor(imgMarkdown);
                } else {
                    var editor = M.markdownEditor;
                    var pos = editor.selectionStart;
                    editor.value = editor.value.substring(0, pos) + imgMarkdown + editor.value.substring(pos);
                }
            }

            // Close the iframe and clean up
            if (activeIframes.has(blockIndex)) {
                var iframe = activeIframes.get(blockIndex);
                if (iframe) iframe.remove();
                activeIframes.delete(blockIndex);
            }
            drawingData.delete(blockIndex);

            _pendingInsertIndex = -1;
            M.renderMarkdown();
            showToast('📋 Diagram inserted into markdown!', 'success');
        }
    }

    function requestInsert(blockIndex) {
        var iframe = activeIframes.get(blockIndex);
        if (iframe && iframe.contentWindow) {
            _pendingInsertIndex = blockIndex;
            iframe.contentWindow.postMessage({ type: 'export-request', format: 'png' }, '*');
        } else {
            showToast('⚠️ Open the whiteboard first, then click Insert.', 'warning');
        }
    }

    // ==============================================
    // EXPORT — PNG and SVG
    // ==============================================

    function handleExportResult(data) {
        if (data.format === 'png' && data.data) {
            downloadDataUrl(data.data, 'excalidraw-drawing.png');
            showToast('📥 PNG exported!', 'success');
        } else if (data.format === 'svg' && data.data) {
            var blob = new Blob([data.data], { type: 'image/svg+xml' });
            var url = URL.createObjectURL(blob);
            downloadDataUrl(url, 'excalidraw-drawing.svg');
            setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
            showToast('📥 SVG exported!', 'success');
        }
    }

    function downloadDataUrl(url, filename) {
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    function requestExport(blockIndex, format) {
        var iframe = activeIframes.get(blockIndex);
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'export-request', format: format }, '*');
        } else {
            var data = loadDrawing(blockIndex);
            if (!data || !data.elements || data.elements.length === 0) {
                showToast('⚠️ No drawing data to export. Open the whiteboard first.', 'warning');
                return;
            }
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            downloadDataUrl(url, 'excalidraw-drawing.excalidraw');
            URL.revokeObjectURL(url);
            showToast('📥 Exported as .excalidraw file (open Excalidraw to export PNG/SVG)', 'success');
        }
    }

    // ==============================================
    // TOOL PILL SYNC — update @tool: field in editor
    // ==============================================

    function syncToolToEditor(blockIndex, newTool) {
        var text = M.markdownEditor.value;
        var blocks = parseDrawBlocks(text);
        if (blockIndex >= blocks.length) return;

        var block = blocks[blockIndex];
        var inner = text.substring(block.start, block.end);

        var toolRe = /(?:^|\s)(?:@tool|Tool):\s*\S+/mi;
        var updated;
        if (toolRe.test(inner)) {
            updated = inner.replace(toolRe, '\n  @tool: ' + newTool);
        } else {
            // Insert @tool: after the tag opening
            updated = inner.replace(/\{\{@?Draw:\s*/, '{{Draw:\n  @tool: ' + newTool + '\n  ');
        }

        M.markdownEditor.value = text.substring(0, block.start) + updated + text.substring(block.end);
    }

    // ==============================================
    // PREVIEW ACTIONS — bind card buttons
    // ==============================================

    function bindDrawPreviewActions(container) {
        ensureMessageListener();

        // Tool pills (Excalidraw / Mermaid toggle)
        container.querySelectorAll('.draw-tool-pill').forEach(function (pill) {
            pill.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.drawIndex, 10);
                var newTool = this.dataset.tool;

                // Update visual pills
                var pillContainer = this.parentNode;
                pillContainer.querySelectorAll('.draw-tool-pill').forEach(function (p) {
                    p.classList.remove('active');
                });
                this.classList.add('active');

                // Update card data
                var card = this.closest('.draw-docgen-card');
                if (card) {
                    card.dataset.drawTool = newTool;
                    var labelEl = card.querySelector('.draw-docgen-label');
                    var iconEl = card.querySelector('.draw-docgen-icon');
                    if (labelEl) labelEl.childNodes[0].textContent = TOOL_LABELS[newTool];
                    if (iconEl) iconEl.textContent = newTool === 'mermaid' ? '📊' : '🎨';

                    // Toggle sections visibility
                    var excalidrawPreview = card.querySelector('.draw-docgen-preview');
                    var mermaidEditor = card.querySelector('.draw-mermaid-editor');
                    var openBtn = card.querySelector('.draw-docgen-open');
                    var pngBtn = card.querySelector('.draw-docgen-export-png');
                    var svgBtn = card.querySelector('.draw-docgen-export-svg');
                    var fullscreenBtn = card.querySelector('.draw-docgen-fullscreen');
                    var closeBtn = card.querySelector('.draw-docgen-close');
                    var info = card.querySelector('.draw-docgen-info');

                    if (newTool === 'mermaid') {
                        if (excalidrawPreview) excalidrawPreview.style.display = 'none';
                        if (mermaidEditor) mermaidEditor.style.display = '';
                        if (openBtn) openBtn.style.display = 'none';
                        if (pngBtn) pngBtn.style.display = 'none';
                        if (svgBtn) svgBtn.style.display = 'none';
                        if (fullscreenBtn) fullscreenBtn.style.display = 'none';
                        if (closeBtn) closeBtn.style.display = 'none';
                        if (info) info.style.display = 'none';
                    } else {
                        if (mermaidEditor) mermaidEditor.style.display = 'none';
                        if (openBtn) openBtn.style.display = '';
                        if (info && !activeIframes.has(idx) && !drawingData.has(idx)) {
                            info.style.display = '';
                        }
                    }
                }

                // Sync @tool: field in editor
                syncToolToEditor(idx, newTool);
            });
        });

        // ▶ Open / Focus (Excalidraw)
        container.querySelectorAll('.draw-docgen-open').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.drawIndex, 10);
                if (activeIframes.has(idx)) {
                    var iframe = activeIframes.get(idx);
                    if (iframe) iframe.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
                createExcalidrawIframe(idx, container);
            });
        });

        // ⏹ Close (Excalidraw)
        container.querySelectorAll('.draw-docgen-close').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                closeExcalidraw(parseInt(this.dataset.drawIndex, 10));
            });
        });

        // 📋 Insert as image in markdown
        container.querySelectorAll('.draw-docgen-insert-img').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                requestInsert(parseInt(this.dataset.drawIndex, 10));
            });
        });

        // 📥 Export PNG
        container.querySelectorAll('.draw-docgen-export-png').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                requestExport(parseInt(this.dataset.drawIndex, 10), 'png');
            });
        });

        // 📥 Export SVG
        container.querySelectorAll('.draw-docgen-export-svg').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                requestExport(parseInt(this.dataset.drawIndex, 10), 'svg');
            });
        });

        // ⛶ Fullscreen
        container.querySelectorAll('.draw-docgen-fullscreen').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var iframe = activeIframes.get(parseInt(this.dataset.drawIndex, 10));
                if (iframe && iframe.requestFullscreen) iframe.requestFullscreen();
            });
        });

        // ✕ Remove tag
        container.querySelectorAll('.draw-docgen-remove').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.drawIndex, 10);
                if (activeIframes.has(idx)) {
                    var iframe = activeIframes.get(idx);
                    if (iframe) iframe.remove();
                    activeIframes.delete(idx);
                }
                var text = M.markdownEditor.value;
                var blocks = parseDrawBlocks(text);
                if (idx < blocks.length) {
                    var block = blocks[idx];
                    var before = text.substring(0, block.start);
                    var after = text.substring(block.end);
                    if (after.charAt(0) === '\n') after = after.substring(1);
                    M.markdownEditor.value = before + after;
                    M.renderMarkdown();
                    showToast('Draw tag removed.', 'info');
                }
            });
        });

        // ▶ Render Mermaid
        container.querySelectorAll('.draw-mermaid-render').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                renderMermaidDiagram(parseInt(this.dataset.drawIndex, 10), container);
            });
        });

        // 📋 Insert Mermaid as code block
        container.querySelectorAll('.draw-mermaid-insert').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                insertMermaidAsCodeBlock(parseInt(this.dataset.drawIndex, 10), container);
            });
        });

        // Auto-save mermaid textarea on input
        container.querySelectorAll('.draw-mermaid-input').forEach(function (ta) {
            var timer = null;
            ta.addEventListener('input', function () {
                var self = this;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    saveMermaidSource(parseInt(self.dataset.drawIndex, 10), self.value);
                }, 500);
            });
            // Auto-resize
            ta.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
        });

        // Re-attach existing iframes that survived re-render
        activeIframes.forEach(function (iframe, idx) {
            var preview = container.querySelector('.draw-docgen-preview[data-draw-index="' + idx + '"]');
            if (preview && !preview.querySelector('.draw-docgen-iframe')) {
                preview.style.display = '';
                preview.appendChild(iframe);
            }
        });

        // Auto-render mermaid previews that have saved source
        container.querySelectorAll('.draw-mermaid-preview').forEach(function (previewDiv) {
            var idx = parseInt(previewDiv.dataset.drawIndex, 10);
            var card = previewDiv.closest('.draw-docgen-card');
            if (card && card.dataset.drawTool === 'mermaid' && loadMermaidSource(idx)) {
                renderMermaidDiagram(idx, container);
            }
        });
    }

    // ==============================================
    // REGISTER TOOLBAR ACTIONS
    // ==============================================

    if (M.registerFormattingAction) {
        M.registerFormattingAction('draw-tag', function () { insertDrawTag(); });
    }

    // ==============================================
    // EXPOSE HOOKS for renderer.js
    // ==============================================

    M.transformDrawMarkdown = transformDrawMarkdown;
    M.bindDrawPreviewActions = bindDrawPreviewActions;
    M.parseDrawBlocks = parseDrawBlocks;

})(window.MDView);
