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

        // Build model dropdown options (same pattern as git-docgen)
        var models = window.AI_MODELS || {};
        var modelIds = Object.keys(models);
        var currentModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : modelIds[0]) || modelIds[0];

        function buildModelOpts(selectedId) {
            var selId = selectedId || currentModel;
            var opts = '';
            modelIds.forEach(function (id) {
                var m = models[id];
                if (m.isImageModel || m.isTtsModel || m.isSttModel) return;
                var name = m.dropdownName || m.label || id;
                var sel = id === selId ? ' selected' : '';
                opts += '<option value="' + id + '"' + sel + '>' + name + '</option>';
            });
            return opts;
        }

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);

            var prompt = match[1].trim();

            // Parse @tool: field (excalidraw or mermaid)
            var toolMatch = prompt.match(/(?:^|\s)(?:@tool|Tool):\s*(\S+)/mi);
            var drawTool = toolMatch ? toolMatch[1].trim().toLowerCase() : 'excalidraw';
            if (!TOOL_LABELS[drawTool]) drawTool = 'excalidraw';

            // Parse @model: field
            var modelMatch = prompt.match(/(?:^|\s)(?:@model|Model):\s*(\S+)/mi);
            var blockModelId = modelMatch ? modelMatch[1].trim() : null;
            if (blockModelId && models[blockModelId]) { /* valid */ } else { blockModelId = null; }
            var cardModelOpts = buildModelOpts(blockModelId);

            // Strip metadata fields for display name
            var diagramName = prompt
                .replace(/(?:^|\s)(?:@tool|Tool):\s*\S+/mi, '')
                .replace(/(?:^|\s)(?:@model|Model):\s*\S+/mi, '')
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
                // AI prompt section — always visible
                + '<div class="draw-ai-prompt-section" data-draw-index="' + blockIndex + '">'
                + '<div class="draw-ai-prompt-row">'
                + '<input type="text" class="draw-ai-prompt-input" data-draw-index="' + blockIndex + '" placeholder="Describe your diagram… e.g. microservices architecture with API gateway" spellcheck="false">'
                + '<select class="draw-ai-model-select" data-draw-index="' + blockIndex + '" title="Model for diagram generation">' + cardModelOpts + '</select>'
                + '<button class="draw-docgen-btn draw-ai-generate-btn" data-draw-index="' + blockIndex + '" title="Generate diagram with AI">🚀 Generate</button>'
                + '<button class="draw-docgen-btn draw-ai-cancel-btn" data-draw-index="' + blockIndex + '" title="Cancel generation" style="display:none">✕</button>'
                + '</div>'
                + '<div class="draw-ai-status" data-draw-index="' + blockIndex + '" style="display:none"></div>'
                + '</div>'
                + pillsHtml
                + mermaidEditorHtml
                + '<div class="draw-docgen-preview" data-draw-index="' + blockIndex + '"'
                + (drawTool === 'excalidraw' && isOpen ? '' : ' style="display:none"') + '></div>'
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
            iframe.contentWindow.postMessage({ type: 'set-draw-index', drawIndex: blockIndex }, window.location.origin);
            if (savedData) {
                iframe.contentWindow.postMessage({ type: 'load-scene', drawIndex: blockIndex, data: savedData }, window.location.origin);
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
            if (e.origin !== window.location.origin) return;
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
            iframe.contentWindow.postMessage({ type: 'export-request', format: 'png' }, window.location.origin);
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
            iframe.contentWindow.postMessage({ type: 'export-request', format: format }, window.location.origin);
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
    // AI DIAGRAM GENERATION — LLM → Excalidraw JSON
    // ==============================================

    /**
     * Attempt to repair common LLM JSON mistakes.
     * Handles: trailing commas, stray quotes after numbers/booleans,
     * missing commas, truncated JSON, unescaped chars.
     */
    function repairJson(raw) {
        var s = raw;
        // Remove trailing commas before } or ]
        s = s.replace(/,\s*([}\]])/g, '$1');
        // Fix stray quote after number: "key":123" → "key":123
        s = s.replace(/:(\s*-?\d+(?:\.\d+)?)"(\s*[,}\]])/g, ':$1$2');
        // Fix stray quote after boolean/null
        s = s.replace(/:(\s*(?:true|false|null))"(\s*[,}\]])/g, ':$1$2');
        // Fix missing comma between properties: }"key" → },"key"  or ]"key" → ],"key"
        s = s.replace(/([}\]])\s*"/g, function (m, bracket) {
            // Only add comma if followed by a key pattern
            return bracket + ',"';
        });
        // But fix the false positive at the very end: },"  at end-of-string without a following key
        // Actually the above is fine for arrays of objects
        // Fix missing comma between } and {
        s = s.replace(/\}\s*\{/g, '},{');
        // Remove any BOM or zero-width chars
        s = s.replace(/[\uFEFF\u200B-\u200D\u2060]/g, '');
        // Handle truncated JSON — close open brackets
        var opens = 0, closeBraces = 0;
        for (var i = 0; i < s.length; i++) {
            if (s[i] === '[') opens++;
            if (s[i] === ']') opens--;
            if (s[i] === '{') closeBraces++;
            if (s[i] === '}') closeBraces--;
        }
        // If truncated mid-value, try to close gracefully
        if (opens > 0 || closeBraces > 0) {
            // Remove any trailing partial key-value pair
            s = s.replace(/,?\s*"[^"]*"?\s*:?\s*"?[^"{}[\]]*$/, '');
            // Close remaining open braces/brackets
            while (closeBraces > 0) { s += '}'; closeBraces--; }
            while (opens > 0) { s += ']'; opens--; }
        }
        return s;
    }

    /**
     * Parse Excalidraw element JSON from LLM response.
     * Handles: raw JSON array, markdown code fences, JSON embedded in text.
     * Includes JSON repair for common LLM mistakes.
     */
    function parseExcalidrawJson(text) {
        if (!text) return null;
        // 1. Strip markdown code fences
        var stripped = text.replace(/```(?:json)?\s*\n?/gi, '').replace(/```\s*$/gi, '').trim();

        // Helper: extract elements from parsed result
        function extractElements(parsed) {
            if (Array.isArray(parsed)) return parsed.filter(function (el) { return el && el.type; });
            if (parsed && Array.isArray(parsed.elements)) return parsed.elements.filter(function (el) { return el && el.type; });
            return null;
        }

        // 2. Try direct parse
        try {
            var result = extractElements(JSON.parse(stripped));
            if (result && result.length > 0) return result;
        } catch (e) { /* continue */ }

        // 3. Extract JSON array from text (find first [ ... ])
        var arrMatch = stripped.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrMatch) {
            try {
                var result2 = extractElements(JSON.parse(arrMatch[0]));
                if (result2 && result2.length > 0) return result2;
            } catch (e) { /* continue to repair */ }
        }

        // 4. Try JSON repair on the full text
        var toRepair = arrMatch ? arrMatch[0] : stripped;
        var repaired = repairJson(toRepair);
        try {
            var result3 = extractElements(JSON.parse(repaired));
            if (result3 && result3.length > 0) return result3;
        } catch (e) { /* continue */ }

        // 5. Last resort: extract individual JSON objects and build array
        var objPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
        var objects = [];
        var objMatch;
        while ((objMatch = objPattern.exec(stripped)) !== null) {
            try {
                var obj = JSON.parse(repairJson(objMatch[0]));
                if (obj && obj.type) objects.push(obj);
            } catch (e) { /* skip malformed object */ }
        }
        if (objects.length > 0) return objects;

        return null;
    }

    /**
     * Generate an Excalidraw diagram using the AI assistant.
     * Sends the prompt with taskType 'excalidraw_diagram', parses JSON,
     * opens the Excalidraw iframe, and posts the elements.
     * Uses per-card model selection (same pattern as git-docgen).
     */
    async function generateExcalidrawDiagram(blockIndex, prompt, container, drawTool) {
        if (!M.requestAiTask) {
            showToast('⚠️ AI assistant not available. Please load an AI model first.', 'warning');
            return;
        }

        // Get per-card model selection
        var card = container.querySelector('.draw-docgen-card[data-draw-index="' + blockIndex + '"]');
        var cardSelect = card ? card.querySelector('.draw-ai-model-select') : null;
        var perCardModel = cardSelect ? cardSelect.value : null;
        var originalModel = M.getCurrentAiModel ? M.getCurrentAiModel() : null;

        // Pre-flight: check model is ready (same pattern as git-docgen)
        var models = window.AI_MODELS || {};
        var checkModelId = perCardModel || originalModel;
        var modelInfo = checkModelId ? models[checkModelId] : null;
        if (modelInfo) {
            if (modelInfo.isLocal) {
                if (M._ai && M._ai.getLocalState) {
                    var ls = M._ai.getLocalState(checkModelId);
                    if (!ls.loaded && !ls.worker) {
                        var consentKey = M.KEYS && M.KEYS.AI_CONSENTED_PREFIX
                            ? M.KEYS.AI_CONSENTED_PREFIX + checkModelId : null;
                        var hasConsent = consentKey && localStorage.getItem(consentKey);
                        if (hasConsent && M._ai.initAiWorker) {
                            showToast('⏳ Loading "' + (modelInfo.label || checkModelId) + '" from cache…', 'info');
                            M._ai.initAiWorker(checkModelId);
                            var waited = 0;
                            while (waited < 60000) {
                                await new Promise(function (r) { setTimeout(r, 500); });
                                waited += 500;
                                ls = M._ai.getLocalState(checkModelId);
                                if (ls.loaded) break;
                            }
                            if (!ls.loaded) {
                                showToast('⚠️ Model is still loading. Please wait and try again.', 'warning');
                                return;
                            }
                        } else {
                            if (M.showModelDownloadPopup) {
                                M.showModelDownloadPopup(checkModelId);
                            } else {
                                showToast('⚠️ Local model needs to be downloaded first.', 'warning');
                            }
                            return;
                        }
                    }
                }
            } else {
                var providers = M.getCloudProviders ? M.getCloudProviders() : {};
                var provider = providers[checkModelId];
                if (provider && !provider.getKey()) {
                    showToast('🔑 Please set your API key for "' + (modelInfo.label || checkModelId) + '" first.', 'warning');
                    if (M.showApiKeyModal) M.showApiKeyModal(checkModelId);
                    return;
                }
            }
        }

        // Temporarily switch model if needed
        if (perCardModel && perCardModel !== originalModel && M.switchToModel) {
            M.switchToModel(perCardModel);
        }

        var statusEl = container.querySelector('.draw-ai-status[data-draw-index="' + blockIndex + '"]');
        var genBtn = container.querySelector('.draw-ai-generate-btn[data-draw-index="' + blockIndex + '"]');
        var cancelBtn = container.querySelector('.draw-ai-cancel-btn[data-draw-index="' + blockIndex + '"]');
        var promptInput = container.querySelector('.draw-ai-prompt-input[data-draw-index="' + blockIndex + '"]');

        // Show generating status
        if (statusEl) {
            statusEl.style.display = '';
            statusEl.innerHTML = '<span class="draw-ai-spinner"></span> Generating diagram…';
        }
        if (genBtn) { genBtn.disabled = true; genBtn.textContent = '⏳ Generating…'; }
        if (cancelBtn) cancelBtn.style.display = '';
        if (promptInput) promptInput.disabled = true;

        // Determine task type based on current draw tool
        var currentTool = drawTool || (card ? card.dataset.drawTool : 'excalidraw');
        var taskType = currentTool === 'mermaid' ? 'generate' : 'excalidraw_diagram';
        var aiPrompt = currentTool === 'mermaid'
            ? 'Generate Mermaid diagram code for: ' + prompt + '\n\nOutput ONLY the Mermaid code, no markdown fences, no explanation. Start directly with the diagram type (graph, flowchart, sequenceDiagram, classDiagram, etc).'
            : 'Generate an Excalidraw diagram for: ' + prompt;

        try {
            var result = await M.requestAiTask({
                taskType: taskType,
                context: null,
                userPrompt: aiPrompt,
                enableThinking: false,
                maxTokensOverride: 16384,
                onToken: function (token, accumulated) {
                    if (statusEl) {
                        var charCount = accumulated.length;
                        statusEl.innerHTML = '<span class="draw-ai-spinner"></span> Generating… (' + charCount + ' chars)';
                    }
                }
            });

            if (currentTool === 'mermaid') {
                // Mermaid mode: put generated code into the textarea
                var mermaidCode = result.replace(/```(?:mermaid)?\s*\n?/gi, '').replace(/```\s*$/gi, '').trim();
                var textarea = container.querySelector('.draw-mermaid-input[data-draw-index="' + blockIndex + '"]');
                if (textarea) {
                    textarea.value = mermaidCode;
                    textarea.style.height = 'auto';
                    textarea.style.height = textarea.scrollHeight + 'px';
                }
                saveMermaidSource(blockIndex, mermaidCode);
                if (statusEl) {
                    statusEl.innerHTML = '✅ Mermaid code generated!';
                    setTimeout(function () { statusEl.style.display = 'none'; }, 3000);
                }
                showToast('🤖 Mermaid diagram code generated!', 'success');
                // Auto-render
                var renderBtn = container.querySelector('.draw-mermaid-render[data-draw-index="' + blockIndex + '"]');
                if (renderBtn) setTimeout(function () { renderBtn.click(); }, 300);
            } else {
                // Excalidraw mode: parse JSON and load into iframe
                var elements = parseExcalidrawJson(result);
                if (!elements || elements.length === 0) {
                    if (statusEl) {
                        statusEl.innerHTML = '❌ Failed to parse diagram JSON. LLM response:<pre style="font-size:0.75rem;max-height:120px;overflow:auto;margin-top:4px;padding:6px;background:var(--color-canvas-subtle,#161b22);border-radius:4px">' + escapeHtml(result.substring(0, 500)) + '</pre>';
                    }
                    showToast('❌ Could not parse Excalidraw elements from AI response.', 'error');
                    return;
                }

                var sceneData = { elements: elements, appState: { viewBackgroundColor: '#ffffff' } };
                saveDrawing(blockIndex, sceneData);

                if (!activeIframes.has(blockIndex)) {
                    createExcalidrawIframe(blockIndex, container);
                }

                var iframe = activeIframes.get(blockIndex);
                if (iframe && iframe.contentWindow) {
                    setTimeout(function () {
                        iframe.contentWindow.postMessage({
                            type: 'load-scene',
                            drawIndex: blockIndex,
                            data: sceneData
                        }, window.location.origin);
                    }, 1500);
                }

                if (statusEl) {
                    statusEl.innerHTML = '✅ Generated ' + elements.length + ' elements!';
                    setTimeout(function () { statusEl.style.display = 'none'; }, 3000);
                }
                showToast('🤖 AI diagram generated with ' + elements.length + ' elements!', 'success');
            }

        } catch (err) {
            if (statusEl) {
                statusEl.innerHTML = '❌ ' + escapeHtml(err.message);
            }
            showToast('❌ AI generation failed: ' + err.message, 'error');
        } finally {
            if (genBtn) { genBtn.disabled = false; genBtn.textContent = '🚀 Generate'; }
            if (cancelBtn) cancelBtn.style.display = 'none';
            if (promptInput) promptInput.disabled = false;
            // Restore original model
            if (perCardModel && originalModel && perCardModel !== originalModel && M.switchToModel) {
                M.switchToModel(originalModel);
            }
        }
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

        // 🚀 AI Generate button
        container.querySelectorAll('.draw-ai-generate-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.drawIndex, 10);
                var input = container.querySelector('.draw-ai-prompt-input[data-draw-index="' + idx + '"]');
                var prompt = input ? input.value.trim() : '';
                if (!prompt) {
                    showToast('⚠️ Enter a diagram description first.', 'warning');
                    if (input) input.focus();
                    return;
                }
                generateExcalidrawDiagram(idx, prompt, container);
            });
        });

        // ✕ AI Cancel button (shown during generation)
        container.querySelectorAll('.draw-ai-cancel-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                // Cancel hides the status — generation still completes but status is dismissed
                var idx = parseInt(this.dataset.drawIndex, 10);
                var statusEl = container.querySelector('.draw-ai-status[data-draw-index="' + idx + '"]');
                if (statusEl) statusEl.style.display = 'none';
                this.style.display = 'none';
            });
        });

        // Model selector — auto-load local models / prompt for API keys
        container.querySelectorAll('.draw-ai-model-select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                var modelId = this.value;
                if (!modelId) return;
                var models = window.AI_MODELS || {};
                var modelInfo = models[modelId];

                if (modelInfo && modelInfo.isLocal && M._ai && M._ai.isLocalModel && M._ai.isLocalModel(modelId)) {
                    var ls = M._ai.getLocalState(modelId);
                    if (!ls.loaded && !ls.worker) {
                        var consentKey = M.KEYS.AI_CONSENTED_PREFIX + modelId;
                        var hasConsent = localStorage.getItem(consentKey);
                        if (hasConsent) {
                            M._ai.initAiWorker(modelId);
                        } else if (M.showModelDownloadPopup) {
                            M.showModelDownloadPopup(modelId);
                        }
                    }
                }

                var providers = M.getCloudProviders ? M.getCloudProviders() : {};
                var cloudProvider = providers[modelId];
                if (cloudProvider && !cloudProvider.getKey()) {
                    M.showApiKeyModal(modelId);
                }
            });
        });

        // Enter key in AI prompt input
        container.querySelectorAll('.draw-ai-prompt-input').forEach(function (input) {
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    var idx = parseInt(this.dataset.drawIndex, 10);
                    var genBtn = container.querySelector('.draw-ai-generate-btn[data-draw-index="' + idx + '"]');
                    if (genBtn) genBtn.click();
                }
            });
            // Prevent editor from capturing input events
            input.addEventListener('keydown', function (e) { e.stopPropagation(); });
            input.addEventListener('keyup', function (e) { e.stopPropagation(); });
            input.addEventListener('keypress', function (e) { e.stopPropagation(); });
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
    M.generateExcalidrawDiagram = generateExcalidrawDiagram;
    M.parseExcalidrawJson = parseExcalidrawJson;

})(window.MDView);
