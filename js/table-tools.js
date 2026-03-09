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

    // --- M._table namespace — shared helpers for extracted modules ---
    M._table = {
        escapeHtml: escapeHtml,
        getTableData: getTableData,
        isNumeric: isNumeric,
        parseNum: parseNum,
        mkBtn: mkBtn
        // addSortFeature, addFilterFeature, etc. are set by table-sort-filter.js
        // addStatsFeature, addChartFeature are set by table-analytics.js
    };

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

            // --- Sort Button (from table-sort-filter.js) ---
            if (M._table.addSortFeature) M._table.addSortFeature(table, toolbar, state);

            addSep(toolbar);

            // --- Filter Button (from table-sort-filter.js) ---
            if (M._table.addFilterFeature) M._table.addFilterFeature(table, toolbar, container, state);

            // --- Search Button (from table-sort-filter.js) ---
            if (M._table.addSearchFeature) M._table.addSearchFeature(table, toolbar, container, state);

            addSep(toolbar);

            // --- Stats Button (from table-analytics.js) ---
            if (M._table.addStatsFeature) M._table.addStatsFeature(table, toolbar, container, state);

            // --- Chart Button (from table-analytics.js) ---
            if (M._table.addChartFeature) M._table.addChartFeature(table, toolbar, container, state);

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

            // Make headers clickable for sort (from table-sort-filter.js)
            if (M._table.addHeaderClickSort) M._table.addHeaderClickSort(table, state);

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
