// ============================================
// chart-docgen.js — {{Chart:}} DocGen Tag Module
// Declarative chart definitions in markdown
// Also supports @type: echart with raw JS code
// Uses ECharts for rendering
// ============================================
(function (M) {
    'use strict';

    // ==============================================
    // FENCED RANGE DETECTION (standard DocGen pattern)
    // ==============================================
    function getFencedRanges(text) {
        var ranges = [];
        var match;
        var re = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1\s*$/gm;
        while ((match = re.exec(text)) !== null) {
            ranges.push({ start: match.index, end: match.index + match[0].length });
        }
        var inlineRe = /`([^`\n]+)`/g;
        while ((match = inlineRe.exec(text)) !== null) {
            ranges.push({ start: match.index, end: match.index + match[0].length });
        }
        return ranges;
    }

    function isInsideFence(pos, fencedRanges) {
        for (var i = 0; i < fencedRanges.length; i++) {
            if (pos >= fencedRanges[i].start && pos < fencedRanges[i].end) return true;
        }
        return false;
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ==============================================
    // DEFAULT PALETTE — vibrant dark-mode colors
    // ==============================================
    var DEFAULT_COLORS = [
        '#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4',
        '#a855f7', '#ef4444', '#14b8a6', '#f97316', '#8b5cf6'
    ];

    // ==============================================
    // SERIES TYPE CATALOG — for the Add Series picker
    // ==============================================
    var SERIES_CATALOG = [
        { type: 'bar',     icon: '📊', label: 'Bar Series',    template: 'Series Name | 10, 20, 30, 40, 50' },
        { type: 'line',    icon: '📈', label: 'Line Series',   template: 'Series Name | 10, 20, 30, 40, 50' },
        { type: 'pie',     icon: '🍩', label: 'Pie Data',      template: 'Category A=30, Category B=50, Category C=20' },
        { type: 'scatter', icon: '🔵', label: 'Scatter Data',  template: 'Series Name | [10,20],[30,40],[50,60]' },
    ];

    // ==============================================
    // PARSING — find {{Chart:}} blocks
    // ==============================================
    // Brace-balanced scanner: find {{Chart: ... }} respecting nested braces in @code
    function findChartBlocks(markdown) {
        var results = [];
        var searchStart = 0;
        while (true) {
            // Find next {{Chart: or {{@Chart:
            var idx = -1, tagLen = 0;
            var lo = markdown.toLowerCase();
            var i1 = lo.indexOf('{{chart:', searchStart);
            var i2 = lo.indexOf('{{@chart:', searchStart);
            if (i1 === -1 && i2 === -1) break;
            if (i1 === -1) { idx = i2; tagLen = 9; }
            else if (i2 === -1) { idx = i1; tagLen = 8; }
            else if (i1 <= i2) { idx = i1; tagLen = 8; }
            else { idx = i2; tagLen = 9; }

            // Scan forward from after the opening {{ tracking brace depth.
            // We start with depth = 2 (for the two opening braces).
            var depth = 2;
            var pos = idx + tagLen;
            var found = false;
            while (pos < markdown.length) {
                var ch = markdown[pos];
                if (ch === '{') { depth++; }
                else if (ch === '}') {
                    depth--;
                    if (depth === 0) {
                        // pos is at the final }, so the block is markdown[idx .. pos]
                        var fullMatch = markdown.substring(idx, pos + 1);
                        // Extract body between the opening tag and closing }}
                        var bodyStart = idx + tagLen;
                        var bodyEnd = pos - 1; // exclude the closing }}
                        var body = markdown.substring(bodyStart, bodyEnd).trim();
                        results.push({ start: idx, end: pos + 1, fullMatch: fullMatch, body: body });
                        found = true;
                        break;
                    }
                }
                pos++;
            }
            searchStart = found ? (pos + 1) : (idx + tagLen);
        }
        return results;
    }

    function parseChartBlocks(markdown) {
        var blocks = [];
        var fencedRanges = getFencedRanges(markdown);
        var rawBlocks = findChartBlocks(markdown);

        for (var bi = 0; bi < rawBlocks.length; bi++) {
            var rb = rawBlocks[bi];
            if (isInsideFence(rb.start, fencedRanges)) continue;
            var body = rb.body;
            var lines = body.split('\n');

            var config = {
                title: '', type: 'bar', height: 400,
                xAxis: [], series: [], data: [],
                colors: [], smooth: false, stack: false,
                legend: true, area: false,
                code: '' // raw JS code for @type: echart
            };

            var inCodeBlock = false;
            var codeLines = [];
            var braceDepth = 0;

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var trimmed = line.trim();
                if (!trimmed && !inCodeBlock) continue;

                // Detect @code: { start — brace-delimited code block
                if (!inCodeBlock && trimmed.match(/^@code\s*:/i)) {
                    inCodeBlock = true;
                    var afterColon = trimmed.replace(/^@code\s*:/i, '').trim();
                    // Count opening brace on same line
                    if (afterColon.indexOf('{') !== -1) {
                        braceDepth = 1;
                        var afterBrace = afterColon.substring(afterColon.indexOf('{') + 1);
                        if (afterBrace.trim()) codeLines.push(afterBrace);
                    }
                    continue;
                }
                if (inCodeBlock) {
                    // Track brace depth — skip braces inside strings and comments
                    for (var ci = 0; ci < line.length; ci++) {
                        var ch = line[ci];
                        // Skip string literals
                        if (ch === '"' || ch === "'" || ch === '`') {
                            var quote = ch;
                            ci++;
                            while (ci < line.length && line[ci] !== quote) {
                                if (line[ci] === '\\') ci++; // skip escaped char
                                ci++;
                            }
                            continue;
                        }
                        // Skip // line comments
                        if (ch === '/' && ci + 1 < line.length && line[ci + 1] === '/') break;
                        // Skip /* block comments */ (single-line only)
                        if (ch === '/' && ci + 1 < line.length && line[ci + 1] === '*') {
                            ci += 2;
                            while (ci < line.length - 1 && !(line[ci] === '*' && line[ci + 1] === '/')) ci++;
                            ci++; // skip past /
                            continue;
                        }
                        if (ch === '{') braceDepth++;
                        else if (ch === '}') braceDepth--;
                    }
                    if (braceDepth <= 0) {
                        // Closing brace found — capture content before it
                        var lastBrace = line.lastIndexOf('}');
                        if (lastBrace > 0) codeLines.push(line.substring(0, lastBrace));
                        inCodeBlock = false;
                    } else {
                        codeLines.push(line);
                    }
                    continue;
                }

                var mm;
                if ((mm = trimmed.match(/^@type:\s*(.+)/i)))    { config.type   = mm[1].trim().toLowerCase(); continue; }
                if ((mm = trimmed.match(/^@title:\s*(.+)/i)))   { config.title  = mm[1].trim(); continue; }
                if ((mm = trimmed.match(/^@height:\s*(\d+)/i))) { config.height = parseInt(mm[1]); continue; }
                if ((mm = trimmed.match(/^@smooth:\s*(.+)/i)))  { config.smooth = mm[1].trim().toLowerCase() === 'true'; continue; }
                if ((mm = trimmed.match(/^@stack:\s*(.+)/i)))   { config.stack  = mm[1].trim().toLowerCase() === 'true'; continue; }
                if ((mm = trimmed.match(/^@area:\s*(.+)/i)))    { config.area   = mm[1].trim().toLowerCase() === 'true'; continue; }
                if ((mm = trimmed.match(/^@legend:\s*(.+)/i)))  { config.legend = mm[1].trim().toLowerCase() !== 'false'; continue; }
                if ((mm = trimmed.match(/^@xAxis:\s*(.+)/i)))   { config.xAxis  = mm[1].split(',').map(function(s){ return s.trim(); }); continue; }
                if ((mm = trimmed.match(/^@color:\s*(.+)/i)))   { config.colors = mm[1].split(',').map(function(s){ return s.trim(); }); continue; }
                if ((mm = trimmed.match(/^@series:\s*(.+)/i)))  {
                    var parts = mm[1].split('|');
                    config.series.push({
                        name: parts[0].trim(),
                        values: parts[1] ? parts[1].split(',').map(function(s){ return parseFloat(s.trim()); }) : []
                    });
                    continue;
                }
                if ((mm = trimmed.match(/^@data:\s*(.+)/i))) {
                    config.data = mm[1].split(',').map(function(s) {
                        var kv = s.split('=');
                        return { name: (kv[0] || '').trim(), value: parseFloat(kv[1]) || 0 };
                    });
                    continue;
                }
                // First non-@ line = title
                if (!config.title && !trimmed.startsWith('@')) config.title = trimmed;
            }

            // Store accumulated code
            if (codeLines.length > 0) {
                config.code = codeLines.join('\n');
            }

            blocks.push({
                config: config,
                start: rb.start,
                end: rb.end,
                fullMatch: rb.fullMatch
            });
        }
        return blocks;
    }

    // ==============================================
    // BUILD ECHARTS OPTION — from parsed config
    // ==============================================
    function buildEChartsOption(cfg) {
        var colors = cfg.colors.length > 0 ? cfg.colors : DEFAULT_COLORS;
        var option = { backgroundColor: 'transparent' };

        if (cfg.title) {
            option.title = { text: cfg.title, left: 'center', textStyle: { color: '#e2e8f0' } };
        }

        option.tooltip = { trigger: cfg.type === 'pie' ? 'item' : 'axis' };

        if (cfg.legend && (cfg.series.length > 1 || cfg.type === 'pie')) {
            option.legend = { bottom: '5%', textStyle: { color: '#94a3b8' } };
        }

        var type = cfg.type;

        // ── Pie / Doughnut ──
        if (type === 'pie') {
            var pieData = cfg.data.length > 0 ? cfg.data : cfg.series.map(function(s, i) {
                return { name: s.name, value: s.values[0] || 0 };
            });
            pieData.forEach(function(d, i) {
                d.itemStyle = { color: colors[i % colors.length] };
            });
            option.tooltip = { trigger: 'item', formatter: '{b}: {c} ({d}%)' };
            option.series = [{
                type: 'pie', radius: ['40%', '70%'],
                itemStyle: { borderRadius: 10, borderColor: '#1e293b', borderWidth: 3 },
                label: { color: '#e2e8f0' },
                data: pieData
            }];
            return option;
        }

        // ── Gauge ──
        if (type === 'gauge') {
            var gaugeVal = cfg.data.length > 0 ? cfg.data[0].value : (cfg.series[0] ? cfg.series[0].values[0] : 75);
            var gaugeName = cfg.data.length > 0 ? cfg.data[0].name : (cfg.series[0] ? cfg.series[0].name : 'Score');
            option.series = [{
                type: 'gauge', startAngle: 200, endAngle: -20, min: 0, max: 100,
                itemStyle: { color: colors[0] },
                progress: { show: true, width: 20, itemStyle: { color: colors[0] } },
                pointer: { show: false },
                axisLine: { lineStyle: { width: 20, color: [[1, '#334155']] } },
                axisTick: { show: false }, splitLine: { show: false },
                axisLabel: { color: '#94a3b8', fontSize: 12, distance: -40 },
                title: { show: true, offsetCenter: [0, '40%'], fontSize: 16, color: '#e2e8f0' },
                detail: {
                    valueAnimation: true, fontSize: 40, fontWeight: 'bold',
                    color: colors[0], offsetCenter: [0, '-5%'], formatter: '{value}%'
                },
                data: [{ value: gaugeVal, name: gaugeName }]
            }];
            return option;
        }

        // ── Radar ──
        if (type === 'radar') {
            var radarInd = cfg.xAxis.length > 0 ? cfg.xAxis : (cfg.data.length > 0 ? cfg.data.map(function(d){ return d.name; }) : []);
            option.radar = {
                indicator: radarInd.map(function(name) { return { name: name, max: 100 }; }),
                axisName: { color: '#94a3b8' },
                splitArea: { areaStyle: { color: ['rgba(99,102,241,0.05)', 'rgba(99,102,241,0.1)'] } }
            };
            option.series = [{
                type: 'radar',
                data: cfg.series.length > 0
                    ? cfg.series.map(function(s, i) {
                        return {
                            value: s.values, name: s.name,
                            areaStyle: { color: colors[i % colors.length] + '4D' },
                            lineStyle: { color: colors[i % colors.length] },
                            itemStyle: { color: colors[i % colors.length] }
                        };
                    })
                    : [{ value: cfg.data.map(function(d){ return d.value; }), name: cfg.title || 'Data',
                        areaStyle: { color: colors[0] + '4D' },
                        lineStyle: { color: colors[0] }, itemStyle: { color: colors[0] } }]
            }];
            return option;
        }

        // ── Scatter ──
        if (type === 'scatter') {
            option.xAxis = { axisLabel: { color: '#94a3b8' } };
            option.yAxis = { axisLabel: { color: '#94a3b8' } };
            option.series = cfg.series.map(function(s, i) {
                return {
                    type: 'scatter', name: s.name, symbolSize: 12,
                    itemStyle: { color: colors[i % colors.length] },
                    data: s.values.length > 0 ? chunkPairs(s.values) : []
                };
            });
            return option;
        }

        // ── Heatmap ──
        if (type === 'heatmap') {
            option.xAxis = { type: 'category', data: cfg.xAxis, axisLabel: { color: '#94a3b8' } };
            var yLabels = cfg.series.map(function(s) { return s.name; });
            option.yAxis = { type: 'category', data: yLabels, axisLabel: { color: '#94a3b8' } };
            var heatData = [];
            cfg.series.forEach(function(s, yi) {
                s.values.forEach(function(v, xi) { heatData.push([xi, yi, v]); });
            });
            var maxVal = Math.max.apply(null, heatData.map(function(d) { return d[2]; }));
            option.visualMap = {
                min: 0, max: maxVal || 20, calculable: true,
                orient: 'horizontal', left: 'center', bottom: '5%',
                inRange: { color: ['#1e293b', colors[0], colors[1] || '#c084fc'] },
                textStyle: { color: '#94a3b8' }
            };
            option.series = [{
                type: 'heatmap', data: heatData,
                label: { show: true, color: '#e2e8f0' }
            }];
            return option;
        }

        // ── Bar / Line (default) ──
        option.xAxis = {
            type: 'category', data: cfg.xAxis,
            axisLabel: { color: '#94a3b8' }
        };
        option.yAxis = { type: 'value', axisLabel: { color: '#94a3b8' } };

        option.series = cfg.series.map(function(s, i) {
            var ser = {
                type: type === 'line' ? 'line' : 'bar',
                name: s.name,
                data: s.values,
                itemStyle: { color: colors[i % colors.length] }
            };
            if (type === 'bar') {
                ser.itemStyle.borderRadius = [4, 4, 0, 0];
            }
            if (cfg.smooth) ser.smooth = true;
            if (cfg.stack)  ser.stack = 'total';
            if (cfg.area === true) {
                ser.areaStyle = {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: colors[i % colors.length] + '66' },
                            { offset: 1, color: colors[i % colors.length] + '05' }
                        ]
                    }
                };
            }
            return ser;
        });

        return option;
    }

    // Helper: chunk flat array into [x,y] pairs
    function chunkPairs(arr) {
        var result = [];
        for (var i = 0; i < arr.length - 1; i += 2) {
            result.push([arr[i], arr[i + 1]]);
        }
        return result;
    }

    // ==============================================
    // STRIP TYPESCRIPT — remove TS annotations for eval
    // ==============================================
    function stripTypeScript(code) {
        return code
            // Remove import statements
            .replace(/^\s*import\s+.*?;?\s*$/gm, '')
            // Remove 'as const' / 'as Type'
            .replace(/\bas\s+(?:const|readonly|[A-Z]\w*)\b/g, '')
            // Remove generic parameters <T>, <T extends X>, Map<string, number[]>
            .replace(/<[A-Z][\w,\s\[\]|&]*>/g, '')
            // Remove type annotations only after let/const/var declarations: const x: Type = ...
            .replace(/(\b(?:let|const|var)\s+\w+)\s*:\s*(?:string|number|boolean|void|any|never|null|undefined|Map|Set|Array|Record|SeriesOption|EChartsOption)[\w\[\]|<>,\s]*(?=\s*=)/g, '$1')
            // Remove function return type annotations: ): Type =>
            .replace(/\)\s*:\s*[A-Z]\w*(?:\[\])*\s*(?==>|\{)/g, ')')
            // Remove parameter type annotations: (param: Type)
            .replace(/(\w+)\s*:\s*(?:string|number|boolean|any|[A-Z]\w*)(?:\[\])*(?=[,\)\s])/g, '$1')
            // Remove standalone type annotations like ': number[]' left over
            .replace(/:\s*\w+\[\]/g, '')
            .trim();
    }

    // ==============================================
    // EXECUTE ECHART CODE — safely run JS to get option
    // ==============================================
    function executeEChartCode(code) {
        var cleanCode = stripTypeScript(code);
        // Wrap in a function that returns `option`
        var wrappedCode = '(function() {\n'
            + 'var option = {};\n'
            + cleanCode + '\n'
            + 'return option;\n'
            + '})();';
        try {
            var result = eval(wrappedCode);
            if (result && typeof result === 'object') return result;
            return null;
        } catch (e) {
            console.warn('[Chart DocGen] Code execution error:', e.message);
            return null;
        }
    }

    // ==============================================
    // TRANSFORM — replace tags with rendered chart HTML
    // ==============================================
    // Parse a single chart body string into a config object (shared helper)
    function parseConfigFromBody(body) {
        var lines = body.split('\n');
        var config = {
            title: '', type: 'bar', height: 400,
            xAxis: [], series: [], data: [],
            colors: [], smooth: false, stack: false,
            legend: true, area: false,
            code: '' // raw JS code for @type: echart
        };

        var inCodeBlock = false;
        var codeLines = [];
        var braceDepth = 0;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.trim();
            if (!trimmed && !inCodeBlock) continue;

            // Detect @code: { start — brace-delimited code block
            if (!inCodeBlock && trimmed.match(/^@code\s*:/i)) {
                inCodeBlock = true;
                var afterColon = trimmed.replace(/^@code\s*:/i, '').trim();
                if (afterColon.indexOf('{') !== -1) {
                    braceDepth = 1;
                    var afterBrace = afterColon.substring(afterColon.indexOf('{') + 1);
                    if (afterBrace.trim()) codeLines.push(afterBrace);
                }
                continue;
            }
            if (inCodeBlock) {
                // Track brace depth — skip braces inside strings and comments
                for (var ci = 0; ci < line.length; ci++) {
                    var ch = line[ci];
                    if (ch === '"' || ch === "'" || ch === '`') {
                        var quote = ch;
                        ci++;
                        while (ci < line.length && line[ci] !== quote) {
                            if (line[ci] === '\\') ci++;
                            ci++;
                        }
                        continue;
                    }
                    if (ch === '/' && ci + 1 < line.length && line[ci + 1] === '/') break;
                    if (ch === '/' && ci + 1 < line.length && line[ci + 1] === '*') {
                        ci += 2;
                        while (ci < line.length - 1 && !(line[ci] === '*' && line[ci + 1] === '/')) ci++;
                        ci++;
                        continue;
                    }
                    if (ch === '{') braceDepth++;
                    else if (ch === '}') braceDepth--;
                }
                if (braceDepth <= 0) {
                    var lastBrace = line.lastIndexOf('}');
                    if (lastBrace > 0) codeLines.push(line.substring(0, lastBrace));
                    inCodeBlock = false;
                } else {
                    codeLines.push(line);
                }
                continue;
            }

            var mm;
            if ((mm = trimmed.match(/^@type:\s*(.+)/i)))    { config.type   = mm[1].trim().toLowerCase(); continue; }
            if ((mm = trimmed.match(/^@title:\s*(.+)/i)))   { config.title  = mm[1].trim(); continue; }
            if ((mm = trimmed.match(/^@height:\s*(\d+)/i))) { config.height = parseInt(mm[1]); continue; }
            if ((mm = trimmed.match(/^@smooth:\s*(.+)/i)))  { config.smooth = mm[1].trim().toLowerCase() === 'true'; continue; }
            if ((mm = trimmed.match(/^@stack:\s*(.+)/i)))   { config.stack  = mm[1].trim().toLowerCase() === 'true'; continue; }
            if ((mm = trimmed.match(/^@area:\s*(.+)/i)))    { config.area   = mm[1].trim().toLowerCase() === 'true'; continue; }
            if ((mm = trimmed.match(/^@legend:\s*(.+)/i)))  { config.legend = mm[1].trim().toLowerCase() !== 'false'; continue; }
            if ((mm = trimmed.match(/^@xAxis:\s*(.+)/i)))   { config.xAxis  = mm[1].split(',').map(function(s){ return s.trim(); }); continue; }
            if ((mm = trimmed.match(/^@color:\s*(.+)/i)))   { config.colors = mm[1].split(',').map(function(s){ return s.trim(); }); continue; }
            if ((mm = trimmed.match(/^@series:\s*(.+)/i)))  {
                var parts = mm[1].split('|');
                config.series.push({
                    name: parts[0].trim(),
                    values: parts[1] ? parts[1].split(',').map(function(s){ return parseFloat(s.trim()); }) : []
                });
                continue;
            }
            if ((mm = trimmed.match(/^@data:\s*(.+)/i))) {
                config.data = mm[1].split(',').map(function(s) {
                    var kv = s.split('=');
                    return { name: (kv[0] || '').trim(), value: parseFloat(kv[1]) || 0 };
                });
                continue;
            }
            // First non-@ line = title
            if (!config.title && !trimmed.startsWith('@')) config.title = trimmed;
        }

        if (codeLines.length > 0) {
            config.code = codeLines.join('\n');
        }
        return config;
    }

    function transformChartMarkdown(markdown) {
        var fencedRanges = getFencedRanges(markdown);
        var rawBlocks = findChartBlocks(markdown);
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;

        for (var ri = 0; ri < rawBlocks.length; ri++) {
            var rb = rawBlocks[ri];
            if (isInsideFence(rb.start, fencedRanges)) continue;

            result += markdown.substring(lastIndex, rb.start);

            // Parse config directly from extracted body (avoids re-parsing fullMatch)
            var cfg = parseConfigFromBody(rb.body);
            if (!cfg) { lastIndex = rb.end; continue; }

            var isCodeMode = (cfg.type === 'echart' || cfg.type === 'echarts') && cfg.code;
            var encoded = '';
            var encodedCode = '';
            var uniqueId = 'chart-dg-' + Math.random().toString(36).substr(2, 9);

            if (isCodeMode) {
                // For code mode: store the raw code for execution at bind time
                encodedCode = btoa(unescape(encodeURIComponent(cfg.code)));
            } else {
                // For declarative mode: build option JSON
                var optionJson;
                try {
                    optionJson = JSON.stringify(buildEChartsOption(cfg));
                } catch (e) {
                    optionJson = '{}';
                }
                encoded = btoa(unescape(encodeURIComponent(optionJson)));
            }

            var badgeLabel = isCodeMode ? 'ECharts Code' : escapeHtml(cfg.type);
            var seriesBadge = !isCodeMode && cfg.series.length > 0
                ? '<span class="chart-dg-series-badge">' + cfg.series.length + ' series</span>'
                : (isCodeMode ? '<span class="chart-dg-series-badge">JS</span>' : '');

            var html = '<div class="chart-dg-card" data-chart-index="' + blockIndex + '">'
                + '<div class="chart-dg-header">'
                + '<span class="chart-dg-icon">📊</span>'
                + '<span class="chart-dg-title">' + escapeHtml(cfg.title || 'Chart') + '</span>'
                + '<div class="chart-dg-badges">'
                + '<span class="chart-dg-type-badge">' + badgeLabel + '</span>'
                + seriesBadge
                + '</div>'
                + '<div class="chart-dg-actions">'
                + (!M.isFormFillMode ? '<button class="chart-dg-remove" data-chart-index="' + blockIndex + '" title="Remove chart tag">✕</button>' : '')
                + '</div>'
                + '</div>'
                + '<div class="echarts-container" id="' + uniqueId + '"'
                + (encoded ? ' data-echarts-option="' + encoded + '"' : '')
                + (encodedCode ? ' data-echarts-code="' + encodedCode + '"' : '')
                + '>'
                + '<div class="echarts-chart" style="width:100%;height:' + cfg.height + 'px;"></div>'
                + '</div>'
                + (!M.isFormFillMode && !isCodeMode ? '<div class="chart-dg-add-wrap" data-chart-index="' + blockIndex + '">'
                    + '<button class="chart-dg-add-btn" data-chart-index="' + blockIndex + '" type="button">➕ Add Series</button>'
                    + '<div class="chart-dg-add-dropdown" data-chart-index="' + blockIndex + '" style="display:none">'
                    + SERIES_CATALOG.map(function(c) {
                        return '<button class="chart-dg-add-option" data-series-type="' + c.type + '" data-series-template="' + escapeHtml(c.template) + '" data-chart-index="' + blockIndex + '" type="button">'
                            + '<span class="chart-dg-add-icon">' + c.icon + '</span>'
                            + '<span class="chart-dg-add-label">' + escapeHtml(c.label) + '</span>'
                            + '</button>';
                    }).join('')
                    + '</div>'
                    + '</div>' : '')
                + '</div>';

            result += html;
            lastIndex = rb.end;
            blockIndex++;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // BIND — attach event listeners to rendered charts
    // ==============================================
    function bindChartPreviewActions(container) {
        // Remove button
        container.querySelectorAll('.chart-dg-remove').forEach(function(btn) {
            if (btn._chartRemoveBound) return;
            btn._chartRemoveBound = true;
            btn.addEventListener('click', function() {
                var blocks = parseChartBlocks(M.markdownEditor.value);
                var idx = parseInt(btn.getAttribute('data-chart-index'));
                if (blocks[idx]) {
                    var text = M.markdownEditor.value;
                    M.markdownEditor.value = text.substring(0, blocks[idx].start) + text.substring(blocks[idx].end);
                    M.debouncedRender();
                }
            });
        });

        // Add Series toggle
        container.querySelectorAll('.chart-dg-add-btn').forEach(function(btn) {
            if (btn._chartAddBound) return;
            btn._chartAddBound = true;
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var idx = btn.getAttribute('data-chart-index');
                var dropdown = container.querySelector('.chart-dg-add-dropdown[data-chart-index="' + idx + '"]');
                if (!dropdown) return;
                container.querySelectorAll('.chart-dg-add-dropdown').forEach(function(d) {
                    if (d !== dropdown) d.style.display = 'none';
                });
                dropdown.style.display = dropdown.style.display === 'none' ? 'grid' : 'none';
            });
        });

        // Add Series option click
        container.querySelectorAll('.chart-dg-add-option').forEach(function(opt) {
            if (opt._chartOptBound) return;
            opt._chartOptBound = true;
            opt.addEventListener('click', function() {
                var idx = parseInt(opt.getAttribute('data-chart-index'));
                var template = opt.getAttribute('data-series-template');
                var seriesType = opt.getAttribute('data-series-type');
                var blocks = parseChartBlocks(M.markdownEditor.value);
                if (!blocks[idx]) return;

                var text = M.markdownEditor.value;
                // Find the closing }} by scanning backward from block end
                var insertPos = text.lastIndexOf('}}', blocks[idx].end - 1);
                if (insertPos < blocks[idx].start) return; // safety
                var newLine;
                if (seriesType === 'pie') {
                    newLine = '  @data: ' + template + '\n';
                } else {
                    newLine = '  @series: ' + template + '\n';
                }
                M.markdownEditor.value = text.substring(0, insertPos) + newLine + text.substring(insertPos);
                M.debouncedRender();
            });
        });

        // Close dropdown on outside click
        if (!container._chartDropCloseHandler) {
            container._chartDropCloseHandler = true;
            document.addEventListener('click', function() {
                container.querySelectorAll('.chart-dg-add-dropdown').forEach(function(d) {
                    d.style.display = 'none';
                });
            });
        }
    }

    // ==============================================
    // TAG INSERTION — from toolbar
    // ==============================================
    function insertChartTag() {
        M.wrapSelectionWith(
            '{{Chart: My Chart\n  @type: bar\n  @xAxis: Jan, Feb, Mar, Apr, May, Jun\n  @series: Revenue | 120, 200, 150, 280, 190, 340\n  @series: Profit | 40, 80, 60, 120, 70, 180\n  @color: #6366f1, #22c55e\n',
            '}}',
            ''
        );
    }

    // ==============================================
    // EXPOSE TO MDView
    // ==============================================
    M.transformChartMarkdown = transformChartMarkdown;
    M.bindChartPreviewActions = bindChartPreviewActions;
    M.parseChartBlocks = parseChartBlocks;
    M.executeEChartCode = executeEChartCode;

    // Register toolbar action
    M.registerFormattingAction('chart-tag', function () { insertChartTag(); });

    // Wire QAB Tools dropdown item
    var qabChartBtn = document.getElementById('qab-chart');
    if (qabChartBtn) {
        qabChartBtn.addEventListener('click', function () { insertChartTag(); });
    }

})(window.MDView);
