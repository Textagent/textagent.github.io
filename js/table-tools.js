// ============================================
// table-tools.js — Spreadsheet-like Table Toolbar
// ============================================
(function (M) {
    'use strict';

    // --- Helpers ---
    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function getTableData(table) {
        var headers = [];
        var rows = [];
        var thEls = table.querySelectorAll('thead th, thead td');
        if (thEls.length === 0) {
            var firstRow = table.querySelector('tr');
            if (firstRow) thEls = firstRow.querySelectorAll('th, td');
        }
        thEls.forEach(function (th) {
            // Strip sort indicator icons (⇅▲▼) that the toolbar appends
            var text = th.textContent.trim().replace(/[⇅▲▼]/g, '').trim();
            headers.push(text);
        });

        var bodyRows = table.querySelectorAll('tbody tr');
        if (bodyRows.length === 0) {
            var allRows = table.querySelectorAll('tr');
            bodyRows = Array.prototype.slice.call(allRows, 1);
        }
        bodyRows.forEach(function (tr) {
            var cells = [];
            tr.querySelectorAll('td, th').forEach(function (td) {
                cells.push(td.textContent.trim());
            });
            rows.push({ cells: cells, el: tr });
        });

        return { headers: headers, rows: rows };
    }

    function isNumeric(val) {
        if (val === '') return false;
        return !isNaN(parseFloat(val)) && isFinite(val.replace(/,/g, ''));
    }

    function parseNum(val) {
        return parseFloat(val.replace(/,/g, ''));
    }

    // ================================
    // Main: Add Table Toolbars
    // ================================
    M.addTableToolbars = function () {
        var tables = M.markdownPreview.querySelectorAll('.markdown-body > table, .markdown-body table');
        var seen = new Set();

        tables.forEach(function (table) {
            if (seen.has(table)) return;
            seen.add(table);
            // Skip if already wrapped
            if (table.parentElement && table.parentElement.classList.contains('table-tools-container')) return;
            // Skip tiny tables (1 row or less)
            if (table.querySelectorAll('tr').length < 2) return;

            // Wrap table
            var container = document.createElement('div');
            container.className = 'table-tools-container';
            table.parentNode.insertBefore(container, table);

            // Toolbar
            var toolbar = document.createElement('div');
            toolbar.className = 'table-tools-toolbar';
            toolbar.setAttribute('aria-label', 'Table tools');
            container.appendChild(toolbar);

            // Move table into container
            container.appendChild(table);

            // State
            var state = {
                sortCol: -1,
                sortAsc: true,
                filterPanel: null,
                searchPanel: null,
                statsPanel: null,
                chartPanel: null,
                originalRows: null
            };

            // --- Sort Button ---
            addSortFeature(table, toolbar, state);

            addSep(toolbar);

            // --- Filter Button ---
            addFilterFeature(table, toolbar, container, state);

            // --- Search Button ---
            addSearchFeature(table, toolbar, container, state);

            addSep(toolbar);

            // --- Stats Button ---
            addStatsFeature(table, toolbar, container, state);

            // --- Chart Button ---
            addChartFeature(table, toolbar, container, state);

            addSep(toolbar);

            // --- Add Row ---
            addRowFeature(table, toolbar);

            // --- Add Column ---
            addColFeature(table, toolbar);

            addSep(toolbar);

            // --- Copy CSV ---
            addCopyCSV(table, toolbar);

            // --- Copy MD ---
            addCopyMD(table, toolbar);

            // --- Download CSV ---
            addDownloadCSV(table, toolbar);

            // Row count badge
            var data = getTableData(table);
            var badge = document.createElement('span');
            badge.className = 'tt-row-badge';
            badge.textContent = data.rows.length + ' rows';
            toolbar.appendChild(badge);

            // Make headers clickable for sort
            addHeaderClickSort(table, state);

            // Make cells editable (double-click to edit)
            makeCellsEditable(table);
        });
    };

    function addSep(toolbar) {
        var sep = document.createElement('span');
        sep.className = 'tt-separator';
        toolbar.appendChild(sep);
    }

    // ================================
    // INLINE CELL EDITING
    // ================================
    function makeCellsEditable(table) {
        var cells = table.querySelectorAll('td');
        cells.forEach(function (cell) {
            cell.classList.add('tt-editable-cell');
            // Mark empty cells with placeholder
            if (cell.textContent.trim() === '' || cell.textContent.trim() === '···') {
                cell.classList.add('tt-empty-cell');
                cell.setAttribute('data-placeholder', 'click to edit');
                if (cell.textContent.trim() === '') cell.textContent = '···';
            }
            cell.addEventListener('dblclick', function (e) {
                e.stopPropagation();
                if (cell.getAttribute('contenteditable') === 'true') return;
                startCellEdit(table, cell);
            });
        });
    }

    function startCellEdit(table, cell) {
        var isPlaceholder = cell.classList.contains('tt-empty-cell');
        var originalText = isPlaceholder ? '' : cell.textContent.trim();
        cell.classList.remove('tt-empty-cell');
        if (isPlaceholder) cell.textContent = '';
        cell.setAttribute('contenteditable', 'true');
        cell.classList.add('tt-editing');
        cell.focus();

        // Select all text
        var range = document.createRange();
        range.selectNodeContents(cell);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        function commitEdit() {
            cell.setAttribute('contenteditable', 'false');
            cell.classList.remove('tt-editing');
            var newText = cell.textContent.trim();
            if (newText !== originalText) {
                syncCellToEditor(table, cell, newText);
            }
        }

        cell.addEventListener('blur', commitEdit, { once: true });
        cell.addEventListener('keydown', function handler(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                cell.removeEventListener('keydown', handler);
                commitEdit();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                cell.textContent = originalText;
                cell.removeEventListener('keydown', handler);
                cell.setAttribute('contenteditable', 'false');
                cell.classList.remove('tt-editing');
            }
        });
    }

    function syncCellToEditor(table, cell) {
        // Find which row and column this cell is in
        var row = cell.parentElement;
        var tbody = table.querySelector('tbody') || table;
        var allRows = Array.from(tbody.querySelectorAll('tr'));
        var headerRow = table.querySelector('thead tr');
        var rowIdx = allRows.indexOf(row);
        // Account for header offset: markdown row 0 = header, row 1 = separator, row 2+ = data
        var mdRowIdx = headerRow ? rowIdx + 2 : rowIdx + 2;

        var cellIdx = Array.from(row.children).indexOf(cell);

        var data = getTableData(table);
        var markdown = M.markdownEditor.value;
        var tableText = getMarkdownTable(markdown, data);
        if (!tableText) return;

        var lines = tableText.split('\n');
        if (mdRowIdx < lines.length) {
            var lineCells = lines[mdRowIdx].split('|').filter(function (c, i, arr) {
                return i > 0 && i < arr.length - 1; // skip empty first/last from pipe split
            });
            if (cellIdx < lineCells.length) {
                lineCells[cellIdx] = ' ' + cell.textContent.trim() + ' ';
                lines[mdRowIdx] = '|' + lineCells.join('|') + '|';
                M.markdownEditor.value = markdown.replace(tableText, lines.join('\n'));
                // Don't re-render — the cell is already showing the new value
                showToast('Cell updated');
            }
        }
    }

    // ================================
    // SORT
    // ================================
    function addSortFeature(table, toolbar, state) {
        var btn = mkBtn('bi-sort-alpha-down', 'Sort', 'Sort columns');
        toolbar.appendChild(btn);

        btn.addEventListener('click', function () {
            // Cycle through columns
            var data = getTableData(table);
            if (data.headers.length === 0) return;

            state.sortCol = (state.sortCol + 1) % data.headers.length;
            state.sortAsc = true;
            sortTable(table, state.sortCol, state.sortAsc);
            updateSortIcons(table, state.sortCol, state.sortAsc);
        });
    }

    function addHeaderClickSort(table, state) {
        var ths = table.querySelectorAll('th');
        ths.forEach(function (th, idx) {
            // Add sort icon
            var icon = document.createElement('span');
            icon.className = 'tt-sort-icon';
            icon.textContent = '⇅';
            th.appendChild(icon);

            th.addEventListener('click', function () {
                if (state.sortCol === idx) {
                    state.sortAsc = !state.sortAsc;
                } else {
                    state.sortCol = idx;
                    state.sortAsc = true;
                }
                sortTable(table, state.sortCol, state.sortAsc);
                updateSortIcons(table, state.sortCol, state.sortAsc);
            });
        });
    }

    function sortTable(table, colIdx, asc) {
        var tbody = table.querySelector('tbody') || table;
        var rows = Array.from(tbody.querySelectorAll('tr'));
        // Skip header row if no tbody
        if (!table.querySelector('thead') && rows.length > 0) {
            rows = rows.slice(1);
        }

        rows.sort(function (a, b) {
            var aCell = a.querySelectorAll('td, th')[colIdx];
            var bCell = b.querySelectorAll('td, th')[colIdx];
            if (!aCell || !bCell) return 0;
            var aVal = aCell.textContent.trim();
            var bVal = bCell.textContent.trim();

            // Numeric sort
            if (isNumeric(aVal) && isNumeric(bVal)) {
                return asc ? parseNum(aVal) - parseNum(bVal) : parseNum(bVal) - parseNum(aVal);
            }
            // String sort
            var cmp = aVal.localeCompare(bVal, undefined, { sensitivity: 'base' });
            return asc ? cmp : -cmp;
        });

        rows.forEach(function (row) { tbody.appendChild(row); });
    }

    function updateSortIcons(table, activeCol, asc) {
        var ths = table.querySelectorAll('th');
        ths.forEach(function (th, idx) {
            var icon = th.querySelector('.tt-sort-icon');
            if (!icon) return;
            if (idx === activeCol) {
                icon.textContent = asc ? '▲' : '▼';
                icon.classList.add('tt-sort-active');
            } else {
                icon.textContent = '⇅';
                icon.classList.remove('tt-sort-active');
            }
        });
    }

    // ================================
    // FILTER
    // ================================
    function addFilterFeature(table, toolbar, container, state) {
        var btn = mkBtn('bi-funnel', 'Filter', 'Filter rows');
        toolbar.appendChild(btn);

        btn.addEventListener('click', function () {
            if (state.filterPanel) {
                state.filterPanel.classList.toggle('tt-visible');
                btn.classList.toggle('tt-active');
                container.classList.toggle('tt-panel-open');
                return;
            }

            var data = getTableData(table);
            var panel = document.createElement('div');
            panel.className = 'tt-filter-panel tt-visible';
            state.filterPanel = panel;
            btn.classList.add('tt-active');
            container.classList.add('tt-panel-open');

            data.headers.forEach(function (header, idx) {
                var input = document.createElement('input');
                input.className = 'tt-filter-input';
                input.type = 'text';
                input.placeholder = header;
                input.setAttribute('data-col', idx);
                input.addEventListener('input', function () {
                    filterRows(table, panel);
                });
                panel.appendChild(input);
            });

            var clearBtn = document.createElement('button');
            clearBtn.className = 'tt-filter-clear';
            clearBtn.textContent = '✕ Clear';
            clearBtn.addEventListener('click', function () {
                panel.querySelectorAll('.tt-filter-input').forEach(function (inp) {
                    inp.value = '';
                });
                filterRows(table, panel);
            });
            panel.appendChild(clearBtn);

            // Insert after toolbar
            toolbar.insertAdjacentElement('afterend', panel);
        });
    }

    function filterRows(table, panel) {
        var inputs = panel.querySelectorAll('.tt-filter-input');
        var filters = [];
        inputs.forEach(function (inp) {
            filters.push({
                col: parseInt(inp.getAttribute('data-col')),
                val: inp.value.toLowerCase().trim()
            });
        });

        var tbody = table.querySelector('tbody') || table;
        var rows = tbody.querySelectorAll('tr');
        var startIdx = table.querySelector('thead') ? 0 : 1;

        for (var i = startIdx; i < rows.length; i++) {
            var cells = rows[i].querySelectorAll('td, th');
            var show = true;
            for (var f = 0; f < filters.length; f++) {
                if (filters[f].val && cells[filters[f].col]) {
                    var cellText = cells[filters[f].col].textContent.toLowerCase().trim();
                    if (cellText.indexOf(filters[f].val) === -1) {
                        show = false;
                        break;
                    }
                }
            }
            rows[i].classList.toggle('tt-row-hidden', !show);
        }
    }

    // ================================
    // SEARCH
    // ================================
    function addSearchFeature(table, toolbar, container, state) {
        var btn = mkBtn('bi-search', 'Search', 'Search table');
        toolbar.appendChild(btn);

        btn.addEventListener('click', function () {
            if (state.searchPanel) {
                state.searchPanel.classList.toggle('tt-visible');
                btn.classList.toggle('tt-active');
                container.classList.toggle('tt-panel-open');
                if (!state.searchPanel.classList.contains('tt-visible')) {
                    clearSearch(table);
                }
                return;
            }

            var panel = document.createElement('div');
            panel.className = 'tt-search-panel tt-visible';
            state.searchPanel = panel;
            btn.classList.add('tt-active');
            container.classList.add('tt-panel-open');

            var input = document.createElement('input');
            input.className = 'tt-search-input';
            input.type = 'text';
            input.placeholder = 'Search across all cells...';
            panel.appendChild(input);

            var countSpan = document.createElement('span');
            countSpan.className = 'tt-search-count';
            countSpan.textContent = '';
            panel.appendChild(countSpan);

            input.addEventListener('input', function () {
                var query = input.value.trim();
                if (!query) {
                    clearSearch(table);
                    countSpan.textContent = '';
                    return;
                }
                var count = highlightSearch(table, query);
                countSpan.textContent = count + ' match' + (count !== 1 ? 'es' : '');
            });

            toolbar.insertAdjacentElement('afterend', panel);
            setTimeout(function () { input.focus(); }, 50);
        });
    }

    function highlightSearch(table, query) {
        clearSearch(table);
        var count = 0;
        var lower = query.toLowerCase();
        var cells = table.querySelectorAll('td, th');
        cells.forEach(function (cell) {
            // Skip sort icons
            var sortIcon = cell.querySelector('.tt-sort-icon');
            var sortIconText = sortIcon ? sortIcon.textContent : '';

            var text = cell.textContent;
            if (sortIcon) text = text.replace(sortIconText, '');

            var idx = text.toLowerCase().indexOf(lower);
            if (idx === -1) return;

            count++;
            var before = text.substring(0, idx);
            var match = text.substring(idx, idx + query.length);
            var after = text.substring(idx + query.length);

            cell.innerHTML = '';
            cell.appendChild(document.createTextNode(before));
            var mark = document.createElement('span');
            mark.className = 'tt-highlight';
            mark.textContent = match;
            cell.appendChild(mark);
            cell.appendChild(document.createTextNode(after));
            if (sortIcon) cell.appendChild(sortIcon);
        });
        return count;
    }

    function clearSearch(table) {
        var highlights = table.querySelectorAll('.tt-highlight');
        highlights.forEach(function (mark) {
            var parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }

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
                // Count unique values for text columns
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

        // Count row
        html += '<tr><td>Count</td>';
        stats.forEach(function (s) { html += '<td>' + s.count + '</td>'; });
        html += '</tr>';

        // Check if any numeric
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

        // Unique row
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

            // Controls
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

            draw(); // initial
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

        // Y-axis
        ctx.strokeStyle = isDark ? '#30363d' : '#d0d7de';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, H - padding.bottom);
        ctx.lineTo(W - padding.right, H - padding.bottom);
        ctx.stroke();

        // Grid lines
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

        // Bars
        values.forEach(function (v, i) {
            var x = padding.left + gap * i + (gap - barW) / 2;
            var barH = (v / maxVal) * chartH;
            var y = padding.top + chartH - barH;

            // Gradient bar
            var grad = ctx.createLinearGradient(x, y, x, y + barH);
            var col = barColors[i % barColors.length];
            grad.addColorStop(0, col);
            grad.addColorStop(1, col + '99');
            ctx.fillStyle = grad;

            // Rounded top
            var r = Math.min(4, barW / 2);
            ctx.beginPath();
            ctx.moveTo(x, y + barH);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.lineTo(x + barW - r, y);
            ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
            ctx.lineTo(x + barW, y + barH);
            ctx.closePath();
            ctx.fill();

            // Value on top
            ctx.fillStyle = textColor;
            ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(v % 1 === 0 ? v.toString() : v.toFixed(1), x + barW / 2, y - 4);

            // Label below
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

    // ================================
    // ADD ROW
    // ================================
    function addRowFeature(table, toolbar) {
        var btn = mkBtn('bi-plus-square', '+ Row', 'Add a new row');
        toolbar.appendChild(btn);

        btn.addEventListener('click', function () {
            var data = getTableData(table);
            if (data.headers.length === 0) return;

            // Find table in editor markdown and append a row
            var markdown = M.markdownEditor.value;
            var tableText = getMarkdownTable(markdown, data);
            if (!tableText) {
                showToast('Could not locate table in editor');
                return;
            }

            var emptyRow = '| ' + data.headers.map(function () { return '···'; }).join(' | ') + ' |';
            var newTableText = tableText + '\n' + emptyRow;
            M.markdownEditor.value = markdown.replace(tableText, newTableText);
            M.renderMarkdown();
            showToast('Row added — double-click cells to edit');
        });
    }

    // ================================
    // ADD COLUMN
    // ================================
    function addColFeature(table, toolbar) {
        var btn = mkBtn('bi-plus-square-dotted', '+ Col', 'Add a new column');
        toolbar.appendChild(btn);

        btn.addEventListener('click', function () {
            var data = getTableData(table);
            if (data.headers.length === 0) return;

            var markdown = M.markdownEditor.value;
            var tableText = getMarkdownTable(markdown, data);
            if (!tableText) {
                showToast('Could not locate table in editor');
                return;
            }

            var colName = 'Column ' + (data.headers.length + 1);
            var lines = tableText.split('\n');
            var newLines = lines.map(function (line, idx) {
                if (idx === 0) return line + ' ' + colName + ' |';
                if (idx === 1) return line + ' --- |';
                return line + '  |';
            });
            M.markdownEditor.value = markdown.replace(tableText, newLines.join('\n'));
            M.renderMarkdown();
            showToast('Column "' + colName + '" added');
        });
    }

    // ================================
    // COPY CSV
    // ================================
    function addCopyCSV(table, toolbar) {
        var btn = mkBtn('bi-filetype-csv', 'CSV', 'Copy as CSV');
        toolbar.appendChild(btn);

        btn.addEventListener('click', function () {
            var csv = tableToCSV(table);
            navigator.clipboard.writeText(csv).then(function () {
                showBtnFeedback(btn, '✓ Copied');
            }).catch(function () {
                showBtnFeedback(btn, '✕ Failed');
            });
        });
    }

    // ================================
    // COPY MARKDOWN
    // ================================
    function addCopyMD(table, toolbar) {
        var btn = mkBtn('bi-markdown', 'MD', 'Copy as Markdown');
        toolbar.appendChild(btn);

        btn.addEventListener('click', function () {
            var md = tableToMarkdown(table);
            navigator.clipboard.writeText(md).then(function () {
                showBtnFeedback(btn, '✓ Copied');
            }).catch(function () {
                showBtnFeedback(btn, '✕ Failed');
            });
        });
    }

    // ================================
    // DOWNLOAD CSV
    // ================================
    function addDownloadCSV(table, toolbar) {
        var btn = mkBtn('bi-download', 'Download', 'Download as CSV');
        toolbar.appendChild(btn);

        btn.addEventListener('click', function () {
            var csv = tableToCSV(table);
            var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'table-export.csv';
            a.click();
            URL.revokeObjectURL(url);
            showBtnFeedback(btn, '✓ Saved');
        });
    }

    // ================================
    // Utility Functions
    // ================================
    function mkBtn(icon, label, title) {
        var btn = document.createElement('button');
        btn.className = 'tt-btn';
        btn.title = title || label;
        btn.innerHTML = '<i class="bi ' + icon + '"></i> <span>' + label + '</span>';
        return btn;
    }

    function showBtnFeedback(btn, text) {
        var original = btn.innerHTML;
        btn.innerHTML = '<span>' + text + '</span>';
        setTimeout(function () { btn.innerHTML = original; }, 1500);
    }

    function showToast(msg) {
        var existing = document.querySelector('.tt-toast');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.className = 'tt-toast';
        toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:8px 18px;background:#1f2328;color:#fff;border-radius:8px;font-size:13px;z-index:9999;opacity:0;transition:opacity .3s';
        toast.textContent = msg;
        document.body.appendChild(toast);
        requestAnimationFrame(function () { toast.style.opacity = '1'; });
        setTimeout(function () {
            toast.style.opacity = '0';
            setTimeout(function () { toast.remove(); }, 300);
        }, 2000);
    }

    function tableToCSV(table) {
        var data = getTableData(table);
        var lines = [];
        lines.push(data.headers.map(csvEscape).join(','));
        data.rows.forEach(function (row) {
            lines.push(row.cells.map(csvEscape).join(','));
        });
        return lines.join('\n');
    }

    function csvEscape(val) {
        if (val.indexOf(',') !== -1 || val.indexOf('"') !== -1 || val.indexOf('\n') !== -1) {
            return '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
    }

    function tableToMarkdown(table) {
        var data = getTableData(table);
        var lines = [];
        // Header
        lines.push('| ' + data.headers.join(' | ') + ' |');
        // Separator
        lines.push('| ' + data.headers.map(function () { return '---'; }).join(' | ') + ' |');
        // Rows
        data.rows.forEach(function (row) {
            lines.push('| ' + row.cells.join(' | ') + ' |');
        });
        return lines.join('\n');
    }

    function getMarkdownTable(markdown, data) {
        // Find a markdown table that matches the current table headers
        var lines = markdown.split('\n');

        // Normalize header names for comparison
        var headerNames = data.headers.map(function (h) {
            return h.trim().toLowerCase();
        });

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.indexOf('|') === -1) continue;

            // Parse pipe-separated cells from this line
            var cells = line.split('|')
                .map(function (c) { return c.trim().toLowerCase(); })
                .filter(function (c) { return c !== ''; });

            // Check if all header names are present in cells
            if (cells.length >= headerNames.length) {
                var allMatch = headerNames.every(function (h) {
                    return cells.indexOf(h) !== -1;
                });

                if (allMatch) {
                    // Find the end of the table
                    var start = i;
                    var end = i;
                    for (var j = i + 1; j < lines.length; j++) {
                        if (lines[j].trim().indexOf('|') === 0 || lines[j].trim().indexOf('-') === 0) {
                            end = j;
                        } else {
                            break;
                        }
                    }
                    return lines.slice(start, end + 1).join('\n');
                }
            }
        }
        return null;
    }

})(window.MDView);
