// ============================================
// table-analytics.js — Stats + Chart for Tables
// Extracted from table-tools.js
// ============================================
(function (M) {
    'use strict';

    var _t = M._table;
    var escapeHtml = _t.escapeHtml;
    var getTableData = _t.getTableData;
    var isNumeric = _t.isNumeric;
    var parseNum = _t.parseNum;
    var mkBtn = _t.mkBtn;

    // ================================
    // STATS
    // ================================
    function addStatsFeature(table, toolbar, container, state) {
        var btn = mkBtn('bi-bar-chart-line', 'Σ Stats', 'Column statistics');
        toolbar.appendChild(btn);

        btn.addEventListener('click', function () {
            if (state.statsPanel) {
                state.statsPanel.classList.toggle('tt-visible');
                btn.classList.toggle('tt-active');
                container.classList.toggle('tt-panel-open');
                return;
            }

            var data = getTableData(table);
            var panel = document.createElement('div');
            panel.className = 'tt-stats-panel tt-visible';
            state.statsPanel = panel;
            btn.classList.add('tt-active');
            container.classList.add('tt-panel-open');

            var stats = computeStats(data);
            panel.innerHTML = renderStatsTable(data.headers, stats);
            container.appendChild(panel);
        });
    }

    function computeStats(data) {
        var cols = data.headers.length;
        var stats = [];
        for (var c = 0; c < cols; c++) {
            var nums = [];
            var count = 0;
            data.rows.forEach(function (row) {
                count++;
                if (row.cells[c] !== undefined && isNumeric(row.cells[c])) {
                    nums.push(parseNum(row.cells[c]));
                }
            });

            if (nums.length > 0) {
                var sum = nums.reduce(function (a, b) { return a + b; }, 0);
                var avg = sum / nums.length;
                var min = Math.min.apply(null, nums);
                var max = Math.max.apply(null, nums);
                stats.push({
                    type: 'numeric',
                    count: count,
                    numCount: nums.length,
                    sum: Math.round(sum * 100) / 100,
                    avg: Math.round(avg * 100) / 100,
                    min: min,
                    max: max
                });
            } else {
                var uniq = new Set();
                data.rows.forEach(function (row) {
                    if (row.cells[c] !== undefined) uniq.add(row.cells[c]);
                });
                stats.push({
                    type: 'text',
                    count: count,
                    unique: uniq.size
                });
            }
        }
        return stats;
    }

    function renderStatsTable(headers, stats) {
        var html = '<table class="tt-stats-table"><thead><tr><th>Metric</th>';
        headers.forEach(function (h) { html += '<th>' + escapeHtml(h) + '</th>'; });
        html += '</tr></thead><tbody>';

        html += '<tr><td>Count</td>';
        stats.forEach(function (s) { html += '<td>' + s.count + '</td>'; });
        html += '</tr>';

        var hasNumeric = stats.some(function (s) { return s.type === 'numeric'; });

        if (hasNumeric) {
            var metrics = [
                { label: 'Sum', key: 'sum' },
                { label: 'Average', key: 'avg' },
                { label: 'Min', key: 'min' },
                { label: 'Max', key: 'max' }
            ];
            metrics.forEach(function (m) {
                html += '<tr><td>' + m.label + '</td>';
                stats.forEach(function (s) {
                    html += '<td>' + (s.type === 'numeric' ? s[m.key] : '—') + '</td>';
                });
                html += '</tr>';
            });
        }

        html += '<tr><td>Unique</td>';
        stats.forEach(function (s) {
            html += '<td>' + (s.type === 'text' ? s.unique : s.numCount) + '</td>';
        });
        html += '</tr>';

        html += '</tbody></table>';
        return html;
    }

    // ================================
    // CHART
    // ================================
    function addChartFeature(table, toolbar, container, state) {
        var btn = mkBtn('bi-graph-up', 'Chart', 'Quick chart');
        toolbar.appendChild(btn);

        btn.addEventListener('click', function () {
            if (state.chartPanel) {
                state.chartPanel.classList.toggle('tt-visible');
                btn.classList.toggle('tt-active');
                container.classList.toggle('tt-panel-open');
                return;
            }

            var data = getTableData(table);
            var panel = document.createElement('div');
            panel.className = 'tt-chart-panel tt-visible';
            state.chartPanel = panel;
            btn.classList.add('tt-active');
            container.classList.add('tt-panel-open');

            var controls = document.createElement('div');
            controls.className = 'tt-chart-controls';

            var labelLabel = document.createElement('span');
            labelLabel.textContent = 'Label: ';
            labelLabel.style.fontSize = '12px';
            controls.appendChild(labelLabel);

            var labelSelect = document.createElement('select');
            labelSelect.className = 'tt-chart-select';
            data.headers.forEach(function (h, i) {
                var opt = document.createElement('option');
                opt.value = i;
                opt.textContent = h;
                labelSelect.appendChild(opt);
            });
            controls.appendChild(labelSelect);

            var valLabel = document.createElement('span');
            valLabel.textContent = ' Value: ';
            valLabel.style.fontSize = '12px';
            controls.appendChild(valLabel);

            var valSelect = document.createElement('select');
            valSelect.className = 'tt-chart-select';
            data.headers.forEach(function (h, i) {
                var opt = document.createElement('option');
                opt.value = i;
                opt.textContent = h;
                if (i === 1) opt.selected = true;
                valSelect.appendChild(opt);
            });
            controls.appendChild(valSelect);

            var drawBtn = document.createElement('button');
            drawBtn.className = 'tt-btn';
            drawBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> <span>Draw</span>';
            controls.appendChild(drawBtn);

            panel.appendChild(controls);

            var canvas = document.createElement('canvas');
            canvas.width = 500;
            canvas.height = 260;
            panel.appendChild(canvas);

            container.appendChild(panel);

            function draw() {
                var labelIdx = parseInt(labelSelect.value);
                var valIdx = parseInt(valSelect.value);
                drawBarChart(canvas, data, labelIdx, valIdx);
            }

            drawBtn.addEventListener('click', draw);
            labelSelect.addEventListener('change', draw);
            valSelect.addEventListener('change', draw);

            draw();
        });
    }

    function drawBarChart(canvas, data, labelIdx, valIdx) {
        var ctx = canvas.getContext('2d');
        var W = canvas.width;
        var H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        var labels = [];
        var values = [];
        data.rows.forEach(function (row) {
            var label = row.cells[labelIdx] || '';
            var val = row.cells[valIdx] || '0';
            labels.push(label.length > 12 ? label.substring(0, 10) + '…' : label);
            values.push(isNumeric(val) ? parseNum(val) : 0);
        });

        if (values.length === 0) return;

        var maxVal = Math.max.apply(null, values.map(Math.abs));
        if (maxVal === 0) maxVal = 1;

        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        var textColor = isDark ? '#c9d1d9' : '#1f2328';
        var barColors = ['#0969da', '#2da44e', '#cf222e', '#8250df', '#bf8700', '#0550ae', '#1a7f37', '#a40e26'];

        var padding = { top: 20, right: 20, bottom: 50, left: 60 };
        var chartW = W - padding.left - padding.right;
        var chartH = H - padding.top - padding.bottom;
        var barW = Math.min(chartW / values.length * 0.7, 50);
        var gap = chartW / values.length;

        ctx.strokeStyle = isDark ? '#30363d' : '#d0d7de';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, H - padding.bottom);
        ctx.lineTo(W - padding.right, H - padding.bottom);
        ctx.stroke();

        ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'right';
        for (var g = 0; g <= 4; g++) {
            var y = padding.top + (chartH * (1 - g / 4));
            var val = (maxVal * g / 4);
            ctx.fillText(val % 1 === 0 ? val.toString() : val.toFixed(1), padding.left - 6, y + 3);
            if (g > 0) {
                ctx.save();
                ctx.strokeStyle = isDark ? 'rgba(48,54,61,0.5)' : 'rgba(208,215,222,0.5)';
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(W - padding.right, y);
                ctx.stroke();
                ctx.restore();
            }
        }

        values.forEach(function (v, i) {
            var x = padding.left + gap * i + (gap - barW) / 2;
            var barH = (v / maxVal) * chartH;
            var by = padding.top + chartH - barH;

            var grad = ctx.createLinearGradient(x, by, x, by + barH);
            var col = barColors[i % barColors.length];
            grad.addColorStop(0, col);
            grad.addColorStop(1, col + '99');
            ctx.fillStyle = grad;

            var r = Math.min(4, barW / 2);
            ctx.beginPath();
            ctx.moveTo(x, by + barH);
            ctx.lineTo(x, by + r);
            ctx.quadraticCurveTo(x, by, x + r, by);
            ctx.lineTo(x + barW - r, by);
            ctx.quadraticCurveTo(x + barW, by, x + barW, by + r);
            ctx.lineTo(x + barW, by + barH);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = textColor;
            ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(v % 1 === 0 ? v.toString() : v.toFixed(1), x + barW / 2, by - 4);

            ctx.save();
            ctx.translate(x + barW / 2, H - padding.bottom + 10);
            ctx.rotate(-0.4);
            ctx.fillStyle = textColor;
            ctx.textAlign = 'right';
            ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText(labels[i], 0, 0);
            ctx.restore();
        });
    }

    // --- Register on M._table for late binding from addTableToolbars ---
    _t.addStatsFeature = addStatsFeature;
    _t.addChartFeature = addChartFeature;

})(window.MDView);
