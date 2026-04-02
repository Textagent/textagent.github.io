// ============================================
// annotate-docgen.js — {{Annotate:}} Tag Component
// Canvas-based annotation overlay on images, URLs, or plain text
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
        if (M._showToast) M._showToast(msg, type);
        else if (M.showToast) M.showToast(msg, type);
        else console.log('[Annotate] ' + msg);
    }

    // ==============================================
    // CONSTANTS
    // ==============================================

    var STORAGE_PREFIX = 'textagent-annotate-';
    var TOOLS = ['pen', 'highlight', 'arrow', 'eraser'];
    var TOOL_ICONS = { pen: '✏️', highlight: '🖍️', arrow: '➡️', eraser: '🧹' };
    var TOOL_LABELS = { pen: 'Pen', highlight: 'Highlight', arrow: 'Arrow', eraser: 'Eraser' };
    var COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#000000'];
    var COLOR_NAMES = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Black'];

    // ==============================================
    // GLOBAL STATE
    // ==============================================

    var annotationState = new Map();

    // ==============================================
    // PERSISTENCE
    // ==============================================

    function saveAnnotations(blockIndex, strokes) {
        try {
            localStorage.setItem(STORAGE_PREFIX + blockIndex, JSON.stringify(strokes));
        } catch (e) { console.warn('[Annotate] localStorage save failed:', e); }
    }

    function loadAnnotations(blockIndex) {
        try {
            var stored = localStorage.getItem(STORAGE_PREFIX + blockIndex);
            return stored ? JSON.parse(stored) : [];
        } catch (e) { return []; }
    }

    function getState(blockIndex, textBody) {
        if (!annotationState.has(blockIndex)) {
            annotationState.set(blockIndex, {
                strokes: loadAnnotations(blockIndex),
                activeTool: 'pen',
                activeColor: '#ef4444',
                lineWidth: 3,
                undoStack: [],
                drawing: false,
                currentStroke: null,
                textBody: textBody || null
            });
        }
        return annotationState.get(blockIndex);
    }

    // ==============================================
    // PARSING
    // ==============================================

    function parseAnnotateBlock(raw) {
        var srcMatch  = raw.match(/(?:^|\n)\s*@source:\s*(.+?)(?:\s*$|\s*\n)/m);
        var textMatch = raw.match(/(?:^|\n)\s*@text:\s*([\s\S]+?)(?=\s*@|\s*$)/m);
        var source    = srcMatch  ? srcMatch[1].trim()  : null;
        var textBody  = textMatch ? textMatch[1].trim()  : null;
        var title = raw
            .replace(/(?:^|\n)\s*@source:\s*.+?(?:\s*$|\s*\n)/m, '')
            .replace(/(?:^|\n)\s*@text:\s*[\s\S]+$/m, '')
            .trim() || 'Untitled';
        return { title: title, source: source, textBody: textBody };
    }

    // ==============================================
    // CARD HTML
    // ==============================================

    function buildCardHtml(blockIndex, title, source, textBody) {
        var swatchesHtml = COLORS.map(function (c, i) {
            return '<button class="ann-color-swatch" data-ann-index="' + blockIndex
                + '" data-color="' + c + '" title="' + COLOR_NAMES[i]
                + '" style="background:' + c + '"></button>';
        }).join('');

        var toolsHtml = TOOLS.map(function (t) {
            return '<button class="ann-tool-btn' + (t === 'pen' ? ' active' : '')
                + '" data-ann-index="' + blockIndex + '" data-tool="' + t
                + '" title="' + TOOL_LABELS[t] + '">' + TOOL_ICONS[t] + '</button>';
        }).join('');

        // Source area
        var sourceHtml;
        if (textBody) {
            // @text: mode — text rendered on canvas with scanline reflow
            // Store in BOTH data-text (attribute) AND as element textContent
            // textContent always survives DOMPurify; data-text is now also whitelisted
            sourceHtml = '<div class="ann-source-text-reflow" data-ann-index="' + blockIndex
                + '" data-text="' + escapeHtml(textBody) + '">'
                + '<span class="ann-reflow-text" aria-hidden="true">' + escapeHtml(textBody) + '</span>'
                + '</div>';
        } else if (source && /\.(png|jpe?g|gif|webp|svg)$/i.test(source)) {
            // Image — no crossorigin to allow external images (CORS-safe)
            sourceHtml = '<img class="ann-source-img" data-ann-index="' + blockIndex
                + '" src="' + escapeHtml(source) + '" alt="' + escapeHtml(title) + '">';
        } else if (source && /^https?:\/\//i.test(source)) {
            sourceHtml = '<iframe class="ann-source-iframe" src="' + escapeHtml(source)
                + '" sandbox="allow-scripts allow-same-origin" loading="lazy"></iframe>';
        } else if (source) {
            sourceHtml = '<div class="ann-source-text"><p>' + escapeHtml(source) + '</p></div>';
        } else {
            sourceHtml = '<div class="ann-source-placeholder"><span>Draw freely on blank canvas ✏️</span></div>';
        }

        return '<div class="ann-card" data-ann-index="' + blockIndex + '">'
            // Header
            + '<div class="ann-header">'
            + '<span class="ann-icon">📝</span>'
            + '<span class="ann-label">Annotate</span>'
            + (title !== 'Untitled' ? '<span class="ann-title">' + escapeHtml(title) + '</span>' : '')
            + '<div class="ann-actions">'
            + '<button class="ann-action-btn ann-undo-btn" data-ann-index="' + blockIndex + '" title="Undo last stroke">↩ Undo</button>'
            + '<button class="ann-action-btn ann-clear-btn" data-ann-index="' + blockIndex + '" title="Clear all strokes">🗑 Clear</button>'
            + '<button class="ann-action-btn ann-export-btn" data-ann-index="' + blockIndex + '" title="Download as PNG">📥 PNG</button>'
            + '<button class="ann-action-btn ann-present-btn" data-ann-index="' + blockIndex + '" title="Switch to reading/drawing mode — hides editor, annotation stays live">📖 Present</button>'
            + '<button class="ann-action-btn ann-remove-btn" data-ann-index="' + blockIndex + '" title="Remove tag">✕</button>'
            + '</div></div>'
            // Toolbar
            + '<div class="ann-toolbar" data-ann-index="' + blockIndex + '">'
            + '<div class="ann-tools">' + toolsHtml + '</div>'
            + '<div class="ann-size-row">'
            + '<label class="ann-size-label">Size</label>'
            + '<input type="range" class="ann-size-slider" data-ann-index="' + blockIndex + '" min="1" max="20" value="3">'
            + '<span class="ann-size-val" data-ann-index="' + blockIndex + '">3</span>'
            + '</div>'
            + '<div class="ann-colors">' + swatchesHtml + '</div>'
            + '</div>'
            // Canvas area
            + '<div class="ann-canvas-wrap" data-ann-index="' + blockIndex + '">'
            + sourceHtml
            + '<canvas class="ann-canvas" data-ann-index="' + blockIndex + '"></canvas>'
            + '</div>'
            // Status
            + '<div class="ann-statusbar" data-ann-index="' + blockIndex + '">'
            + '<span class="ann-stroke-count">Draw on the canvas above</span>'
            + '</div>'
            + '</div>';
    }

    // ==============================================
    // TRANSFORM — replaces {{Annotate:}} with card HTML
    // ==============================================

    function transformAnnotateMarkdown(markdown) {
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?Annotate:\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;
            result += markdown.substring(lastIndex, match.index);
            var parsed = parseAnnotateBlock(match[1]);
            result += buildCardHtml(blockIndex, parsed.title, parsed.source, parsed.textBody);
            lastIndex = match.index + match[0].length;
            blockIndex++;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // CANVAS ENGINE
    // ==============================================

    function initCanvas(blockIndex, container) {
        var wrap = container.querySelector('.ann-canvas-wrap[data-ann-index="' + blockIndex + '"]');
        var canvas = container.querySelector('.ann-canvas[data-ann-index="' + blockIndex + '"]');
        if (!canvas || !wrap || canvas._annInit) return;
        canvas._annInit = true;

        // Detect text-reflow mode — read from textContent first (survives DOMPurify),
        // fall back to data-text attribute (now also whitelisted)
        var reflowEl = wrap.querySelector('.ann-source-text-reflow[data-ann-index="' + blockIndex + '"]');
        var textBody = null;
        if (reflowEl) {
            // Primary: read from hidden span's textContent — always survives sanitization
            var textSpan = reflowEl.querySelector('.ann-reflow-text');
            if (textSpan && textSpan.textContent.trim()) {
                textBody = textSpan.textContent.trim();
            } else if (reflowEl.dataset.text && reflowEl.dataset.text.trim()) {
                // Fallback: data-text attribute (whitelisted in DOMPurify now)
                textBody = reflowEl.dataset.text.trim();
            }
        }

        var state = getState(blockIndex, textBody);
        if (textBody) state.textBody = textBody;
        var ctx = canvas.getContext('2d');

        // Mark wrap for Pretext reflow badge
        if (textBody) wrap.setAttribute('data-reflow', 'true');

        function resizeCanvas() {
            var w = wrap.offsetWidth || 640;
            var h;
            if (reflowEl) {
                // @text: mode — use reflowEl height (min 320)
                h = Math.max(reflowEl.offsetHeight || 320, 320);
            } else {
                var sourceEl = wrap.querySelector('.ann-source-img, .ann-source-iframe, .ann-source-text, .ann-source-placeholder');
                h = sourceEl ? (sourceEl.offsetHeight || 320) : 320;
                if (h < 80) h = 320;
            }
            canvas.width = w;
            canvas.height = h;
            redrawAll(ctx, state, canvas);
        }

        var sourceImg = wrap.querySelector('.ann-source-img');
        if (sourceImg) {
            if (sourceImg.complete && sourceImg.naturalWidth > 0) {
                setTimeout(resizeCanvas, 0);
            } else {
                sourceImg.addEventListener('load', resizeCanvas, { once: true });
                sourceImg.addEventListener('error', resizeCanvas, { once: true });
            }
        } else {
            setTimeout(resizeCanvas, 100);
        }

        canvas.style.cursor = 'crosshair';

        canvas.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            canvas.setPointerCapture(e.pointerId);
            var r = canvas.getBoundingClientRect();
            var scaleX = canvas.width / r.width;
            var scaleY = canvas.height / r.height;
            var x = (e.clientX - r.left) * scaleX;
            var y = (e.clientY - r.top) * scaleY;
            state.drawing = true;
            var tool = state.activeTool, color = state.activeColor, width = state.lineWidth;
            if (tool === 'eraser') {
                state.currentStroke = { tool: 'eraser', points: [{ x: x, y: y }], width: width * 4 };
            } else if (tool === 'highlight') {
                state.currentStroke = { tool: 'highlight', points: [{ x: x, y: y }], color: color, width: width * 6 };
            } else if (tool === 'arrow') {
                state.currentStroke = { tool: 'arrow', start: { x: x, y: y }, end: { x: x, y: y }, color: color, width: width };
            } else {
                state.currentStroke = { tool: 'pen', points: [{ x: x, y: y }], color: color, width: width };
            }
        });

        canvas.addEventListener('pointermove', function (e) {
            if (!state.drawing || !state.currentStroke) return;
            e.preventDefault();
            var r = canvas.getBoundingClientRect();
            var scaleX = canvas.width / r.width;
            var scaleY = canvas.height / r.height;
            var x = (e.clientX - r.left) * scaleX;
            var y = (e.clientY - r.top) * scaleY;
            if (state.currentStroke.tool === 'arrow') {
                state.currentStroke.end = { x: x, y: y };
            } else {
                state.currentStroke.points.push({ x: x, y: y });
            }
            redrawAll(ctx, state, canvas);
            drawStroke(ctx, state.currentStroke);
        });

        canvas.addEventListener('pointerup', function () {
            if (!state.drawing || !state.currentStroke) return;
            state.drawing = false;
            state.strokes.push(state.currentStroke);
            state.currentStroke = null;
            saveAnnotations(blockIndex, state.strokes);
            updateStatus(blockIndex, container, state.strokes.length);
        });

        canvas.addEventListener('pointercancel', function () {
            state.drawing = false;
            state.currentStroke = null;
        });

        // Restore saved annotations
        if (state.strokes.length > 0) {
            setTimeout(function () {
                resizeCanvas();
                updateStatus(blockIndex, container, state.strokes.length);
            }, 200);
        }
    }

    function drawStroke(ctx, stroke) {
        if (!stroke) return;
        ctx.save();
        if (stroke.tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.lineWidth = stroke.width;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            drawPath(ctx, stroke.points);
        } else if (stroke.tool === 'highlight') {
            ctx.globalCompositeOperation = 'multiply';
            ctx.globalAlpha = 0.38;
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            drawPath(ctx, stroke.points);
        } else if (stroke.tool === 'arrow') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = stroke.color;
            ctx.fillStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = 'round';
            var s = stroke.start, e = stroke.end;
            ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(e.x, e.y); ctx.stroke();
            var angle = Math.atan2(e.y - s.y, e.x - s.x);
            var hs = Math.max(stroke.width * 4, 12);
            ctx.beginPath();
            ctx.moveTo(e.x, e.y);
            ctx.lineTo(e.x - hs * Math.cos(angle - Math.PI / 6), e.y - hs * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(e.x - hs * Math.cos(angle + Math.PI / 6), e.y - hs * Math.sin(angle + Math.PI / 6));
            ctx.closePath(); ctx.fill();
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            drawPath(ctx, stroke.points);
        }
        ctx.restore();
    }

    function drawPath(ctx, points) {
        if (!points || points.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
            var p = points[i - 1], q = points[i];
            ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
    }

    // ==============================================
    // SCANLINE REFLOW TEXT ENGINE
    // ==============================================

    var REFLOW_FONT_SIZE = 13.5;
    var REFLOW_LINE_H    = REFLOW_FONT_SIZE * 1.78;
    var REFLOW_FONT      = REFLOW_FONT_SIZE + 'px Inter, system-ui, sans-serif';
    var REFLOW_COLOR     = '#1a2b3c';
    var REFLOW_PAD       = 14;
    var REFLOW_MASK_EXP  = 5;

    // Build offscreen mask from strokes — reads pixel alpha per scanline
    function buildReflowMask(w, h, strokes, currentStroke) {
        var mc = document.createElement('canvas');
        mc.width = w; mc.height = h;
        var mx = mc.getContext('2d');
        var all = currentStroke ? strokes.concat([currentStroke]) : strokes;
        all.forEach(function(s) {
            var pts = s.points;
            if (!pts || pts.length < 2) return;
            mx.save();
            mx.strokeStyle = 'rgba(0,0,0,1)';
            mx.lineWidth   = (s.width || 3) + REFLOW_MASK_EXP * 2;
            mx.lineCap = 'round'; mx.lineJoin = 'round';
            mx.beginPath();
            pts.forEach(function(p, i) { i === 0 ? mx.moveTo(p.x, p.y) : mx.lineTo(p.x, p.y); });
            mx.stroke();
            mx.restore();
        });
        return mx;
    }

    function getFreeIntervals(maskCtx, y, w) {
        var scanY = Math.max(0, Math.min(Math.round(y - REFLOW_LINE_H * 0.3), maskCtx.canvas.height - 1));
        var pixels = maskCtx.getImageData(0, scanY, w, 1).data;
        var intervals = [], inFree = false, start = REFLOW_PAD;
        for (var x = REFLOW_PAD; x <= w - REFLOW_PAD; x++) {
            var occ = pixels[x * 4 + 3] > 20;
            if (!occ && !inFree) { inFree = true; start = x; }
            else if (occ && inFree) {
                inFree = false;
                if (x - start > 12) intervals.push({ x: start, w: x - start });
            }
        }
        if (inFree && (w - REFLOW_PAD - start) > 12) intervals.push({ x: start, w: w - REFLOW_PAD - start });
        return intervals;
    }

    function reflowText(ctx, text, w, h, strokes, currentStroke) {
        ctx.font = REFLOW_FONT;
        var SPACE = ctx.measureText(' ').width;
        var words = text.trim().split(/\s+/).filter(Boolean);
        var mw = words.map(function(wd) { return { word: wd, width: ctx.measureText(wd).width }; });

        var maskCtx = (strokes.length > 0 || currentStroke)
            ? buildReflowMask(w, h, strokes, currentStroke)
            : null;

        var lines = [], wi = 0, y = REFLOW_PAD + REFLOW_LINE_H, safety = 0;

        while (wi < mw.length && y < h - REFLOW_PAD && safety++ < 8000) {
            var intervals = maskCtx ? getFreeIntervals(maskCtx, y, w)
                : [{ x: REFLOW_PAD, w: w - REFLOW_PAD * 2 }];

            if (!intervals.length) { y += REFLOW_LINE_H * 0.5; continue; }

            var placements = [], intIdx = 0;
            var ix = intervals[0].x, spaceLeft = intervals[0].w, first = true;

            while (wi < mw.length && intIdx < intervals.length) {
                var needed = first ? mw[wi].width : SPACE + mw[wi].width;
                if (needed <= spaceLeft) {
                    placements.push({ word: mw[wi].word, x: first ? ix : ix + SPACE });
                    ix += needed; spaceLeft -= needed; first = false; wi++;
                } else {
                    intIdx++;
                    if (intIdx < intervals.length) { ix = intervals[intIdx].x; spaceLeft = intervals[intIdx].w; first = true; }
                }
            }
            if (placements.length) lines.push({ placements: placements, y: y });
            y += REFLOW_LINE_H;
        }

        // Draw
        ctx.font = REFLOW_FONT;
        ctx.fillStyle = REFLOW_COLOR;
        ctx.textBaseline = 'alphabetic';
        lines.forEach(function(line) {
            line.placements.forEach(function(p) { ctx.fillText(p.word, p.x, line.y); });
        });
    }

    function redrawAll(ctx, state, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // If text-reflow mode: render text first then strokes on top
        if (state.textBody) {
            ctx.fillStyle = '#f0faf5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            reflowText(ctx, state.textBody, canvas.width, canvas.height,
                state.strokes, state.currentStroke);
        }
        state.strokes.forEach(function (s) { drawStroke(ctx, s); });
        if (state.currentStroke) drawStroke(ctx, state.currentStroke);
    }

    function updateStatus(blockIndex, container, count) {
        var el = container.querySelector('.ann-stroke-count[data-ann-index="' + blockIndex + '"]') ||
            container.querySelector('.ann-statusbar[data-ann-index="' + blockIndex + '"] .ann-stroke-count');
        if (el) el.textContent = count + ' stroke' + (count !== 1 ? 's' : '') + ' — saved';
    }

    // ==============================================
    // EXPORT
    // ==============================================

    function exportPng(blockIndex, container, insertMd) {
        var wrap   = container.querySelector('.ann-canvas-wrap[data-ann-index="' + blockIndex + '"]');
        var canvas = container.querySelector('.ann-canvas[data-ann-index="' + blockIndex + '"]');
        if (!canvas) return;

        var offscreen = document.createElement('canvas');
        offscreen.width  = canvas.width;
        offscreen.height = canvas.height;
        var octx = offscreen.getContext('2d');

        // White background always (safe — never read pixel data from cross-origin img)
        octx.fillStyle = '#ffffff';
        octx.fillRect(0, 0, offscreen.width, offscreen.height);

        // Try to composite source image — may throw SecurityError for cross-origin images
        var sourceImg = wrap ? wrap.querySelector('.ann-source-img') : null;
        if (sourceImg && sourceImg.complete && sourceImg.naturalWidth > 0) {
            try {
                octx.drawImage(sourceImg, 0, 0, offscreen.width, offscreen.height);
            } catch (e) {
                // Cross-origin tainted canvas — we skip the background image but keep annotations
                octx.fillStyle = '#f9fafb';
                octx.fillRect(0, 0, offscreen.width, offscreen.height);
                octx.fillStyle = '#6b7280';
                octx.font = '12px Inter, system-ui, sans-serif';
                octx.textAlign = 'center';
                octx.fillText('(source image protected by CORS — annotations only)', offscreen.width / 2, offscreen.height / 2);
                octx.textAlign = 'left';
            }
        }

        // Draw annotation strokes on top
        octx.drawImage(canvas, 0, 0);

        var dataUrl;
        try {
            dataUrl = offscreen.toDataURL('image/png');
        } catch(e) {
            showToast('Cannot export — image is cross-origin protected. Annotations-only export.', 'error');
            // Re-try with strokes-only canvas
            var fallback = document.createElement('canvas');
            fallback.width = canvas.width; fallback.height = canvas.height;
            var fctx = fallback.getContext('2d');
            fctx.fillStyle = '#f9fafb'; fctx.fillRect(0, 0, fallback.width, fallback.height);
            fctx.drawImage(canvas, 0, 0);
            dataUrl = fallback.toDataURL('image/png');
        }

        if (insertMd) {
            var titleEl = container.querySelector('.ann-title');
            var alt = titleEl ? titleEl.textContent.trim() : 'Annotation';

            // Store in gen-img registry (DOMPurify strips data: URLs directly)
            // This is the same pattern draw-docgen.js uses for image insertion
            if (!M._genImages) M._genImages = {};
            var genId = 'ann-' + Math.random().toString(36).substring(2, 10);
            M._genImages[genId] = dataUrl;
            var snippet = '\n\n![' + alt + '](gen-img:' + genId + ')\n\n';

            if (M.insertAtCursor) {
                M.insertAtCursor(snippet);
            } else if (M.markdownEditor) {
                var editor = M.markdownEditor;
                var pos = editor.selectionStart || editor.value.length;
                editor.value = editor.value.substring(0, pos) + snippet + editor.value.substring(pos);
                editor.selectionStart = editor.selectionEnd = pos + snippet.length;
                editor.dispatchEvent(new Event('input', { bubbles: true }));
            }
            showToast('Annotation inserted ✅', 'success');
        } else {
            var a = document.createElement('a');
            a.href = dataUrl;
            a.download = 'annotation-' + blockIndex + '.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('PNG downloaded ✅', 'success');
        }
    }

    // ==============================================
    // BIND PREVIEW ACTIONS — called by renderer.js after each render
    // ==============================================

    function bindAnnotatePreviewActions(container) {
        container.querySelectorAll('.ann-card').forEach(function (card) {
            if (card._annBound) return;
            card._annBound = true;
            var idx = parseInt(card.dataset.annIndex, 10);

            // Tool buttons
            card.querySelectorAll('.ann-tool-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var tool = this.dataset.tool;
                    getState(idx).activeTool = tool;
                    var canvas = card.querySelector('.ann-canvas');
                    if (canvas) canvas.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
                    card.querySelectorAll('.ann-tool-btn').forEach(function (b) {
                        b.classList.toggle('active', b.dataset.tool === tool);
                    });
                });
            });

            // Color swatches
            card.querySelectorAll('.ann-color-swatch').forEach(function (swatch) {
                swatch.addEventListener('click', function () {
                    getState(idx).activeColor = this.dataset.color;
                    card.querySelectorAll('.ann-color-swatch').forEach(function (s) {
                        s.classList.toggle('active', s.dataset.color === swatch.dataset.color);
                    });
                });
            });

            // Size slider
            var slider = card.querySelector('.ann-size-slider');
            if (slider) {
                slider.addEventListener('input', function () {
                    var v = parseInt(this.value, 10);
                    getState(idx).lineWidth = v;
                    var val = card.querySelector('.ann-size-val');
                    if (val) val.textContent = v;
                });
            }

            // Undo
            var undoBtn = card.querySelector('.ann-undo-btn');
            if (undoBtn) {
                undoBtn.addEventListener('click', function () {
                    var state = getState(idx);
                    if (!state.strokes.length) return;
                    state.undoStack.push(state.strokes.pop());
                    saveAnnotations(idx, state.strokes);
                    var canvas = card.querySelector('.ann-canvas');
                    if (canvas) redrawAll(canvas.getContext('2d'), state, canvas);
                    updateStatus(idx, card, state.strokes.length);
                });
            }

            // Clear — no confirm(), just clear and re-render
            var clearBtn = card.querySelector('.ann-clear-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', function () {
                    var state = getState(idx);
                    if (!state.strokes.length) return;
                    // Save to undo stack before wiping
                    state.undoStack = state.undoStack.concat(state.strokes.slice());
                    state.strokes = [];
                    saveAnnotations(idx, []);
                    var canvas = card.querySelector('.ann-canvas');
                    if (canvas) redrawAll(canvas.getContext('2d'), state, canvas);
                    updateStatus(idx, card, 0);
                    showToast('Cleared — use Undo to restore', 'info');
                });
            }

            // Export PNG
            var exportBtn = card.querySelector('.ann-export-btn');
            if (exportBtn) exportBtn.addEventListener('click', function () { exportPng(idx, card, false); });

            // Present — switch to preview-only mode (like html-autorun)
            // The annotation card stays fully interactive for drawing while reading
            var presentBtn = card.querySelector('.ann-present-btn');
            if (presentBtn) {
                presentBtn.addEventListener('click', function () {
                    if (M.setViewMode) {
                        M.setViewMode('preview');
                        showToast('Reading mode — draw freely on the canvas 🎨', 'success');
                    } else {
                        // Fallback: manually hide the editor pane
                        var editorPane = document.querySelector('.editor-pane');
                        var previewPane = document.querySelector('.preview-pane');
                        if (editorPane) editorPane.style.display = 'none';
                        if (previewPane) { previewPane.style.width = '100%'; previewPane.style.flex = '1'; }
                        showToast('Reading mode — draw freely on the canvas 🎨', 'success');
                    }
                    // Scroll the annotation card into view
                    setTimeout(function() { card.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 200);
                });
            }

            // Remove tag
            var removeBtn = card.querySelector('.ann-remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', function () {
                    showToast('Remove the {{Annotate:}} tag from your markdown', 'info');
                });
            }

            // Init canvas
            initCanvas(idx, card);
        });
    }

    // ==============================================
    // INSERT TAG HELPER
    // ==============================================

    function insertAnnotateTag() {
        if (M.wrapSelectionWith) {
            M.wrapSelectionWith('{{Annotate: ', '}}', 'My Notes\n  @source: https://example.com/image.png');
        }
    }

    // ==============================================
    // EXPOSE HOOKS — same pattern as draw-docgen.js
    // ==============================================

    M.transformAnnotateMarkdown = transformAnnotateMarkdown;
    M.bindAnnotatePreviewActions = bindAnnotatePreviewActions;

    // Register toolbar button
    if (M.registerFormattingAction) {
        M.registerFormattingAction('annotate-tag', function () { insertAnnotateTag(); });
    }

    console.log('[TextAgent] ✅ annotate-docgen.js loaded');

})(window.MDView = window.MDView || {});
