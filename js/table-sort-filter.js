// ============================================
// table-sort-filter.js — Sort, Filter, Search for Tables
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
    // SORT
    // ================================
    function addSortFeature(table, toolbar, state) {
        var btn = mkBtn('bi-sort-alpha-down', 'Sort', 'Sort columns');
        toolbar.appendChild(btn);

        btn.addEventListener('click', function () {
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
        if (!table.querySelector('thead') && rows.length > 0) {
            rows = rows.slice(1);
        }

        rows.sort(function (a, b) {
            var aCell = a.querySelectorAll('td, th')[colIdx];
            var bCell = b.querySelectorAll('td, th')[colIdx];
            if (!aCell || !bCell) return 0;
            var aVal = aCell.textContent.trim();
            var bVal = bCell.textContent.trim();

            if (isNumeric(aVal) && isNumeric(bVal)) {
                return asc ? parseNum(aVal) - parseNum(bVal) : parseNum(bVal) - parseNum(aVal);
            }
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

    // --- Register on M._table for late binding from addTableToolbars ---
    _t.addSortFeature = addSortFeature;
    _t.addHeaderClickSort = addHeaderClickSort;
    _t.addFilterFeature = addFilterFeature;
    _t.addSearchFeature = addSearchFeature;

})(window.MDView);
