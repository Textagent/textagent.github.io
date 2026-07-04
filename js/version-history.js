// ============================================
// version-history.js — Local Version History
// Automatic snapshots of every workspace file into an IndexedDB ring buffer,
// with a history panel (timeline + line diff) and one-click restore.
//
// Capture policy (checked on every autosave via M.versionHistory.onSave):
//   • first save of a file            → snapshot
//   • ≥ SNAP_INTERVAL since last snap → snapshot
//   • ≥ SNAP_DELTA chars changed      → snapshot (even inside the interval)
// A safety snapshot of the CURRENT content is always taken before a restore,
// so restores are themselves undoable.
//
// Storage: IndexedDB 'textagent-history', split into two stores so that
// listing/pruning never deserializes document bodies (review finding):
//   meta    { id (auto), fileId, name, ts, size, label? }   — tiny records
//   content { id, content }                                 — loaded on demand
// Ring caps: MAX_PER_FILE + MAX_FILE_BYTES per file, MAX_TOTAL overall.
// Documents larger than SKIP_ABOVE are never snapshotted (quota safety).
// ============================================
(function (M) {
    'use strict';
    if (!M) return;

    // --- Tunables ---
    var SNAP_INTERVAL = 3 * 60 * 1000;   // min ms between time-based snapshots
    var SNAP_DELTA = 400;                // char delta that forces a snapshot
    var MAX_PER_FILE = 50;               // snapshots kept per file
    var MAX_FILE_BYTES = 25 * 1024 * 1024; // per-file content budget (chars)
    var MAX_TOTAL = 400;                 // snapshots kept across all files
    var SKIP_ABOVE = 5 * 1024 * 1024;    // never snapshot docs larger than this
    var DIFF_MAX_CELLS = 4e6;            // LCS DP guard (rows*cols)
    var DIFF_CONTEXT = 3;                // unchanged lines shown around changes
    var DIFF_MAX_ROWS = 4000;            // hard cap on rendered diff rows

    // --- IndexedDB (meta + content stores) ---
    var DB_NAME = 'textagent-history';
    var META = 'meta';
    var CONTENT = 'content';

    function openDB() {
        return new Promise(function (resolve, reject) {
            var req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = function () {
                var db = req.result;
                if (!db.objectStoreNames.contains(META)) {
                    var meta = db.createObjectStore(META, { keyPath: 'id', autoIncrement: true });
                    meta.createIndex('byFile', 'fileId', { unique: false });
                    meta.createIndex('byTs', 'ts', { unique: false });
                }
                if (!db.objectStoreNames.contains(CONTENT)) {
                    db.createObjectStore(CONTENT, { keyPath: 'id' });
                }
            };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
        });
    }

    function addSnapshot(rec, content) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var t = db.transaction([META, CONTENT], 'readwrite');
                var addReq = t.objectStore(META).add(rec);
                addReq.onsuccess = function () {
                    t.objectStore(CONTENT).add({ id: addReq.result, content: content });
                };
                t.oncomplete = function () { resolve(addReq.result); };
                t.onerror = function () { reject(t.error); };
            });
        });
    }

    // Meta-only listing — never touches document bodies. Newest first.
    function listMeta(fileId) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var t = db.transaction(META, 'readonly');
                var idx = t.objectStore(META).index('byFile');
                var out = [];
                var cur = idx.openCursor(IDBKeyRange.only(fileId));
                cur.onsuccess = function () {
                    var c = cur.result;
                    if (c) { out.push(c.value); c.continue(); }
                    else { out.sort(function (a, b) { return b.ts - a.ts; }); resolve(out); }
                };
                cur.onerror = function () { reject(cur.error); };
            });
        });
    }

    function getContent(id) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var t = db.transaction(CONTENT, 'readonly');
                var req = t.objectStore(CONTENT).get(id);
                req.onsuccess = function () { resolve(req.result ? req.result.content : null); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    function deleteIds(ids) {
        if (!ids.length) return Promise.resolve();
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var t = db.transaction([META, CONTENT], 'readwrite');
                ids.forEach(function (id) {
                    t.objectStore(META).delete(id);
                    t.objectStore(CONTENT).delete(id);
                });
                t.oncomplete = function () { resolve(); };
                t.onerror = function () { reject(t.error); };
            });
        });
    }

    // Prune using meta only: count cap + per-file byte budget + global cap.
    function prune(fileId) {
        return listMeta(fileId).then(function (list) {
            var drop = [];
            var bytes = 0;
            list.forEach(function (m, i) {
                bytes += m.size || 0;
                if (i >= MAX_PER_FILE || bytes > MAX_FILE_BYTES) drop.push(m.id);
            });
            return deleteIds(drop);
        }).then(function () {
            return openDB().then(function (db) {
                return new Promise(function (resolve) {
                    var t = db.transaction(META, 'readonly');
                    var store = t.objectStore(META);
                    var countReq = store.count();
                    countReq.onsuccess = function () {
                        var over = countReq.result - MAX_TOTAL;
                        if (over <= 0) { resolve([]); return; }
                        var ids = [];
                        var cur = store.index('byTs').openCursor(); // oldest first
                        cur.onsuccess = function () {
                            var c = cur.result;
                            if (c && ids.length < over) { ids.push(c.value.id); c.continue(); }
                            else resolve(ids);
                        };
                        cur.onerror = function () { resolve([]); };
                    };
                    countReq.onerror = function () { resolve([]); };
                });
            }).then(deleteIds);
        }).catch(function (e) { console.warn('[history] prune failed:', e); });
    }

    // --- Capture policy ---
    var last = {};      // fileId -> { ts, content }
    var loading = {};
    var warnedBig = {};

    function fileName(fileId) {
        var f = M._wsFindFileById ? M._wsFindFileById(fileId) : null;
        return f ? f.name : (fileId === '__default__' ? 'Document' : fileId);
    }

    function shouldSnapshot(fileId, content) {
        var l = last[fileId];
        if (!l) return true;
        if (content === l.content) return false;
        if (Date.now() - l.ts >= SNAP_INTERVAL) return true;
        if (Math.abs(content.length - l.content.length) >= SNAP_DELTA) return true;
        return false;
    }

    function snapshot(fileId, content, label) {
        var rec = {
            fileId: fileId,
            name: fileName(fileId),
            ts: Date.now(),
            size: content.length,
            label: label || ''
        };
        last[fileId] = { ts: rec.ts, content: content };
        return addSnapshot(rec, content).then(function () { return prune(fileId); })
            .catch(function (e) { console.warn('[history] snapshot failed:', e); });
    }

    function onSave(fileId, content) {
        if (typeof content !== 'string' || content.trim() === '') return;
        fileId = fileId || '__default__';
        if (content.length > SKIP_ABOVE) {
            if (!warnedBig[fileId]) {
                warnedBig[fileId] = true;
                console.warn('[history] document too large for version history (>5 MB):', fileId);
            }
            return;
        }
        if (last[fileId]) {
            if (shouldSnapshot(fileId, content)) snapshot(fileId, content);
            return;
        }
        if (loading[fileId]) return;
        loading[fileId] = true;
        // Lazy baseline: newest meta record + its content (one body read, once per file per session)
        listMeta(fileId).then(function (list) {
            if (list.length === 0) return null;
            return getContent(list[0].id).then(function (c) {
                if (c != null) last[fileId] = { ts: list[0].ts, content: c };
            });
        }).then(function () {
            if (shouldSnapshot(fileId, content)) snapshot(fileId, content);
        }).catch(function () {
            snapshot(fileId, content);
        }).then(function () { loading[fileId] = false; });
    }

    // --- Line diff (prefix/suffix trim + LCS on the middle) ---
    function diffLines(oldText, newText) {
        var a = oldText.split('\n');
        var b = newText.split('\n');
        var start = 0;
        while (start < a.length && start < b.length && a[start] === b[start]) start++;
        var endA = a.length, endB = b.length;
        while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }

        var head = a.slice(0, start).map(function (l) { return { type: 'same', line: l }; });
        var tail = a.slice(endA).map(function (l) { return { type: 'same', line: l }; });
        var midA = a.slice(start, endA);
        var midB = b.slice(start, endB);

        var mid;
        if (midA.length * midB.length > DIFF_MAX_CELLS) {
            mid = midA.map(function (l) { return { type: 'del', line: l }; })
                .concat(midB.map(function (l) { return { type: 'add', line: l }; }));
        } else {
            mid = lcsDiff(midA, midB);
        }
        return head.concat(mid, tail);
    }

    function lcsDiff(a, b) {
        var n = a.length, m = b.length;
        if (n === 0) return b.map(function (l) { return { type: 'add', line: l }; });
        if (m === 0) return a.map(function (l) { return { type: 'del', line: l }; });
        var dp = new Array(n + 1);
        for (var i = 0; i <= n; i++) dp[i] = new Int32Array(m + 1);
        for (i = 1; i <= n; i++) {
            for (var j = 1; j <= m; j++) {
                dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1
                    : Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        var out = [];
        i = n; var jj = m;
        while (i > 0 && jj > 0) {
            if (a[i - 1] === b[jj - 1]) { out.push({ type: 'same', line: a[i - 1] }); i--; jj--; }
            else if (dp[i - 1][jj] >= dp[i][jj - 1]) { out.push({ type: 'del', line: a[i - 1] }); i--; }
            else { out.push({ type: 'add', line: b[jj - 1] }); jj--; }
        }
        while (i > 0) { out.push({ type: 'del', line: a[i - 1] }); i--; }
        while (jj > 0) { out.push({ type: 'add', line: b[jj - 1] }); jj--; }
        return out.reverse();
    }

    // Collapse long unchanged runs to context lines and cap total rendered rows,
    // so a snapshot of a huge document can never freeze the tab (review finding).
    function renderableDiff(d) {
        var rows = [];
        var i = 0;
        var truncated = false;
        while (i < d.length) {
            if (d[i].type !== 'same') { rows.push(d[i]); i++; }
            else {
                var runStart = i;
                while (i < d.length && d[i].type === 'same') i++;
                var runLen = i - runStart;
                if (runLen <= DIFF_CONTEXT * 2 + 1) {
                    for (var k = runStart; k < i; k++) rows.push(d[k]);
                } else {
                    var headEnd = runStart === 0 ? runStart : runStart + DIFF_CONTEXT;
                    var tailStart = i === d.length ? i : i - DIFF_CONTEXT;
                    for (k = runStart; k < headEnd; k++) rows.push(d[k]);
                    rows.push({ type: 'skip', line: (tailStart - headEnd) + ' unchanged lines' });
                    for (k = tailStart; k < i; k++) rows.push(d[k]);
                }
            }
            if (rows.length > DIFF_MAX_ROWS) { truncated = true; break; }
        }
        if (truncated) rows.push({ type: 'skip', line: 'diff truncated — too many changes to display' });
        return rows;
    }

    // --- Authoritative current content (async — review finding) ---
    // localStorage is only a cache in disk mode; read the real source of truth.
    function currentContentFor(fileId) {
        if (fileId === (M.wsActiveFileId || '__default__')) {
            return Promise.resolve(M.markdownEditor.value);
        }
        if (M._disk && M._disk.hasSingleFile && M._disk.hasSingleFile(fileId) && M._disk.readSingleFile) {
            return M._disk.readSingleFile(fileId).then(function (c) {
                return c != null ? c : (localStorage.getItem(M.KEYS.FILE_PREFIX + fileId) || '');
            });
        }
        if (M.wsDiskMode && M._disk && M._disk.isConnected && M._disk.isConnected()) {
            var f = M._wsFindFileById ? M._wsFindFileById(fileId) : null;
            if (f) {
                return M._disk.readFileFromPath(f.name).then(function (c) {
                    return c || (localStorage.getItem(M.KEYS.FILE_PREFIX + fileId) || '');
                });
            }
        }
        return Promise.resolve(localStorage.getItem(M.KEYS.FILE_PREFIX + fileId) || '');
    }

    // --- Panel UI ---
    var panelEl = null;

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : s;
        return d.innerHTML;
    }

    function timeAgo(ts) {
        var s = Math.floor((Date.now() - ts) / 1000);
        if (s < 60) return 'just now';
        var m = Math.floor(s / 60);
        if (m < 60) return m + 'm ago';
        var h = Math.floor(m / 60);
        if (h < 24) return h + 'h ago';
        var d = Math.floor(h / 24);
        if (d < 7) return d + 'd ago';
        return new Date(ts).toLocaleDateString();
    }

    function closePanel() {
        if (panelEl) { panelEl.remove(); panelEl = null; }
    }

    function openPanel(fileId, displayName) {
        fileId = fileId || M.wsActiveFileId || '__default__';
        displayName = displayName || fileName(fileId);
        closePanel();

        var overlay = document.createElement('div');
        overlay.className = 'vh-overlay';
        overlay.innerHTML =
            '<div class="vh-panel" role="dialog" aria-label="Version history">' +
            '<div class="vh-header">' +
            '<span class="vh-title"><i class="bi bi-clock-history"></i> History — ' + esc(displayName) + '</span>' +
            '<button class="vh-close" title="Close"><i class="bi bi-x-lg"></i></button>' +
            '</div>' +
            '<div class="vh-body">' +
            '<div class="vh-list"><div class="vh-empty">Loading…</div></div>' +
            '<div class="vh-preview"><div class="vh-empty">Select a version to compare it with the current document.</div></div>' +
            '</div>' +
            '</div>';
        document.body.appendChild(overlay);
        panelEl = overlay;

        overlay.addEventListener('click', function (e) { if (e.target === overlay) closePanel(); });
        overlay.querySelector('.vh-close').addEventListener('click', closePanel);

        var listEl = overlay.querySelector('.vh-list');
        var prevEl = overlay.querySelector('.vh-preview');

        listMeta(fileId).then(function (snaps) {
            if (!panelEl) return;
            if (snaps.length === 0) {
                listEl.innerHTML = '<div class="vh-empty">No versions yet.<br>Snapshots are captured automatically as you edit.</div>';
                return;
            }
            listEl.innerHTML = '';
            snaps.forEach(function (s, i) {
                var prev = snaps[i + 1];
                var deltaTxt = '';
                if (prev) {
                    var d = s.size - prev.size;
                    deltaTxt = d === 0 ? '±0' : (d > 0 ? '+' + d : String(d));
                }
                var item = document.createElement('button');
                item.className = 'vh-item';
                item.innerHTML =
                    '<span class="vh-item-time">' + esc(timeAgo(s.ts)) + (s.label ? ' · ' + esc(s.label) : '') + '</span>' +
                    '<span class="vh-item-meta">' + new Date(s.ts).toLocaleString() + ' · ' + s.size + ' chars' +
                    (deltaTxt ? ' · <span class="vh-delta">' + esc(deltaTxt) + '</span>' : '') + '</span>';
                item.addEventListener('click', function () {
                    listEl.querySelectorAll('.vh-item').forEach(function (el) { el.classList.remove('active'); });
                    item.classList.add('active');
                    prevEl.innerHTML = '<div class="vh-empty">Loading…</div>';
                    Promise.all([getContent(s.id), currentContentFor(fileId)]).then(function (res) {
                        if (!panelEl) return;
                        if (res[0] == null) {
                            prevEl.innerHTML = '<div class="vh-empty">Snapshot content missing.</div>';
                            return;
                        }
                        showSnapshot(fileId, s, res[0], res[1], prevEl);
                    }).catch(function (e) {
                        prevEl.innerHTML = '<div class="vh-empty">Failed to load: ' + esc(e.message) + '</div>';
                    });
                });
                listEl.appendChild(item);
            });
        }).catch(function (e) {
            listEl.innerHTML = '<div class="vh-empty">Failed to load history: ' + esc(e.message) + '</div>';
        });
    }

    function showSnapshot(fileId, meta, snapContent, current, prevEl) {
        var d = diffLines(snapContent, current);
        var adds = 0, dels = 0;
        d.forEach(function (r) { if (r.type === 'add') adds++; else if (r.type === 'del') dels++; });
        var rows = renderableDiff(d);

        var html =
            '<div class="vh-preview-bar">' +
            '<span class="vh-diffstat">vs current: <span class="vh-add">+' + adds + '</span> <span class="vh-del">−' + dels + '</span></span>' +
            '<span class="vh-actions">' +
            '<button class="vh-btn vh-copy" title="Copy this version to clipboard"><i class="bi bi-clipboard"></i> Copy</button>' +
            '<button class="vh-btn vh-restore" title="Restore this version"><i class="bi bi-arrow-counterclockwise"></i> Restore</button>' +
            '</span></div>' +
            '<div class="vh-diff">';
        rows.forEach(function (r) {
            if (r.type === 'skip') {
                html += '<div class="vh-line vh-line-skip"><span class="vh-sign">⋯</span>' + esc(r.line) + '</div>';
                return;
            }
            var cls = r.type === 'add' ? 'vh-line-add' : r.type === 'del' ? 'vh-line-del' : 'vh-line-same';
            var sign = r.type === 'add' ? '+' : r.type === 'del' ? '−' : ' ';
            html += '<div class="vh-line ' + cls + '"><span class="vh-sign">' + sign + '</span>' + esc(r.line) + '</div>';
        });
        html += '</div>';
        prevEl.innerHTML = html;

        prevEl.querySelector('.vh-copy').addEventListener('click', function () {
            navigator.clipboard.writeText(snapContent).then(function () {
                if (M.showToast) M.showToast('📋 Version copied to clipboard', 'success');
            });
        });
        prevEl.querySelector('.vh-restore').addEventListener('click', function () {
            restore(fileId, meta, snapContent, current);
        });
    }

    function restore(fileId, meta, snapContent, current) {
        // Safety snapshot of the authoritative current content, so the restore is undoable.
        var p = current && current.trim() && current !== snapContent
            ? snapshot(fileId, current, 'before restore')
            : Promise.resolve();

        p.then(function () {
            var isActive = fileId === (M.wsActiveFileId || '__default__');
            if (isActive) {
                M.markdownEditor.value = snapContent;
                if (M.wsSaveCurrent) M.wsSaveCurrent();      // routes to localStorage + disk paths
                if (M.renderMarkdown) M.renderMarkdown();
                if (M.updateDocumentStats) M.updateDocumentStats();
                return true;
            }
            // Non-active file: persist explicitly and report honestly (review finding —
            // a swallowed quota error must not produce a success toast).
            var persisted = false;
            try {
                localStorage.setItem(M.KEYS.FILE_PREFIX + fileId, snapContent);
                persisted = true;
            } catch (_) { /* quota — disk paths below may still succeed */ }

            if (M._disk && M._disk.hasSingleFile && M._disk.hasSingleFile(fileId)) {
                return M._disk.writeSingleFile(fileId, snapContent).then(function (ok) {
                    return persisted || ok === true;
                }).catch(function () { return persisted; });
            }
            if (M.wsDiskMode && M._disk && M._disk.isConnected && M._disk.isConnected()) {
                var f = M._wsFindFileById ? M._wsFindFileById(fileId) : null;
                if (f) {
                    return M._disk.writeFileToPath(f.name, snapContent).then(function () {
                        return true;
                    }).catch(function () { return persisted; });
                }
            }
            return persisted;
        }).then(function (ok) {
            if (ok) {
                last[fileId] = { ts: Date.now(), content: snapContent };
                closePanel();
                if (M.showToast) M.showToast('🕐 Restored version from ' + new Date(meta.ts).toLocaleString(), 'success');
            } else {
                if (M.showToast) M.showToast('❌ Restore failed — storage is full. Free space and try again.', 'error');
            }
        });
    }

    // Purge all history for a deleted file (review finding: "Delete cannot be
    // undone" should not leave recoverable content behind, and orphans would
    // evict live history via the global cap).
    function deleteFileHistory(fileId) {
        delete last[fileId];
        return listMeta(fileId).then(function (list) {
            return deleteIds(list.map(function (m) { return m.id; }));
        }).catch(function (e) { console.warn('[history] purge failed:', e); });
    }

    // --- Expose ---
    M.versionHistory = {
        onSave: onSave,
        open: openPanel,
        close: closePanel,
        snapshotNow: function (label) {
            var id = M.wsActiveFileId || '__default__';
            return snapshot(id, M.markdownEditor.value, label || 'manual');
        },
        deleteFileHistory: deleteFileHistory,
        // test hooks
        _list: listMeta,
        _getContent: getContent,
        _diff: diffLines
    };

})(window.MDView);
