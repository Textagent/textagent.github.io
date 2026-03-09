// ============================================
// context-memory.js — Workspace Intelligence + External Memory
// SQLite FTS5-powered local context index for AI tags
// ============================================
(function (M) {
    'use strict';

    // --- IndexedDB helpers for storing SQLite DB blobs ---
    var IDB_NAME = 'textagent-memory';
    var IDB_STORE = 'databases';

    function openMemoryIDB() {
        return new Promise(function (resolve, reject) {
            var req = indexedDB.open(IDB_NAME, 1);
            req.onupgradeneeded = function () {
                var db = req.result;
                if (!db.objectStoreNames.contains(IDB_STORE)) {
                    db.createObjectStore(IDB_STORE);
                }
            };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
        });
    }

    function idbGetBlob(key) {
        return openMemoryIDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(IDB_STORE, 'readonly');
                var req = tx.objectStore(IDB_STORE).get(key);
                req.onsuccess = function () { resolve(req.result || null); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    function idbSetBlob(key, value) {
        return openMemoryIDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).put(value, key);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }

    function idbDeleteBlob(key) {
        return openMemoryIDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).delete(key);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }

    // --- sql.js loading (reuses exec-sandbox.js pattern) ---
    function loadSqlJs() {
        return new Promise(function (resolve, reject) {
            // If exec-sandbox already exposed getSqlJs, reuse it
            if (M._exec && M._exec.getSqlJs) {
                M._exec.getSqlJs(function (SQL, err) {
                    if (err || !SQL) reject(err || new Error('sql.js failed'));
                    else resolve(SQL);
                });
                return;
            }
            // Fallback: load directly
            if (window.initSqlJs) {
                window.initSqlJs({
                    locateFile: function (file) {
                        return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + file;
                    }
                }).then(resolve).catch(reject);
                return;
            }
            var script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js';
            script.onload = function () {
                window.initSqlJs({
                    locateFile: function (file) {
                        return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + file;
                    }
                }).then(resolve).catch(reject);
            };
            script.onerror = function () { reject(new Error('Failed to load sql.js')); };
            document.head.appendChild(script);
        });
    }

    // --- Heading-aware markdown chunker ---
    function chunkMarkdown(content, fileName) {
        var chunks = [];
        var lines = content.split('\n');
        var headingStack = []; // track current heading hierarchy
        var currentChunk = { lines: [], heading: '' };

        function flushChunk() {
            var text = currentChunk.lines.join('\n').trim();
            if (text.length > 0) {
                // Split oversized chunks
                if (text.length > 1500) {
                    var parts = splitText(text, 1500);
                    for (var p = 0; p < parts.length; p++) {
                        chunks.push({
                            file: fileName,
                            heading: currentChunk.heading,
                            content: parts[p]
                        });
                    }
                } else {
                    chunks.push({
                        file: fileName,
                        heading: currentChunk.heading,
                        content: text
                    });
                }
            }
            currentChunk = { lines: [], heading: buildHeadingPath(headingStack) };
        }

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var headingMatch = line.match(/^(#{1,3})\s+(.+)$/);

            if (headingMatch) {
                // Flush previous chunk
                flushChunk();

                var level = headingMatch[1].length;
                var title = headingMatch[2].trim();

                // Update heading stack
                while (headingStack.length >= level) {
                    headingStack.pop();
                }
                headingStack.push({ level: level, title: title });

                currentChunk.heading = buildHeadingPath(headingStack);
                currentChunk.lines.push(line);
            } else {
                currentChunk.lines.push(line);
            }
        }
        // Flush remaining
        flushChunk();

        return chunks;
    }

    function buildHeadingPath(stack) {
        if (stack.length === 0) return '';
        return stack.map(function (h) {
            return '#'.repeat(h.level) + ' ' + h.title;
        }).join(' > ');
    }

    function splitText(text, maxLen) {
        var parts = [];
        var paragraphs = text.split(/\n\n+/);
        var current = '';
        for (var i = 0; i < paragraphs.length; i++) {
            if (current.length + paragraphs[i].length + 2 > maxLen && current.length > 0) {
                parts.push(current.trim());
                current = '';
            }
            current += (current ? '\n\n' : '') + paragraphs[i];
        }
        if (current.trim()) parts.push(current.trim());
        // If a single paragraph is still too long, hard-split
        var result = [];
        for (var j = 0; j < parts.length; j++) {
            if (parts[j].length <= maxLen) {
                result.push(parts[j]);
            } else {
                for (var k = 0; k < parts[j].length; k += maxLen) {
                    result.push(parts[j].substring(k, k + maxLen));
                }
            }
        }
        return result;
    }

    // Chunk plain text files (non-markdown)
    function chunkPlainText(content, fileName) {
        var chunks = [];
        var parts = splitText(content, 1500);
        for (var i = 0; i < parts.length; i++) {
            chunks.push({
                file: fileName,
                heading: '',
                content: parts[i]
            });
        }
        return chunks;
    }

    // --- SQLite FTS5 Database Manager ---
    var _sqlInstance = null; // SQL.js constructor
    var _workspaceDb = null; // workspace memory SQLite DB
    var _externalDbs = {}; // named external memory DBs

    var SCHEMA_SQL = [
        'CREATE TABLE IF NOT EXISTS memory_files (',
        '  name TEXT PRIMARY KEY,',
        '  modified_at INTEGER,',
        '  chunk_count INTEGER',
        ');',
        'CREATE TABLE IF NOT EXISTS memory_meta (',
        '  key TEXT PRIMARY KEY,',
        '  value TEXT',
        ');'
    ].join('\n');

    // FTS5 table — created separately because CREATE VIRTUAL TABLE IF NOT EXISTS
    // is supported in SQLite 3.37+ but sql.js may vary
    var FTS5_SQL = "CREATE VIRTUAL TABLE IF NOT EXISTS chunks USING fts5(file, heading, content, tokenize='porter unicode61');";

    function initDbSchema(db) {
        db.run(SCHEMA_SQL);
        try {
            db.run(FTS5_SQL);
        } catch (e) {
            // FTS5 might not be available in all sql.js builds — fallback to regular table
            console.warn('FTS5 not available, using fallback table:', e.message);
            db.run('CREATE TABLE IF NOT EXISTS chunks (file TEXT, heading TEXT, content TEXT);');
        }
    }

    function createFreshDb() {
        var db = new _sqlInstance.Database();
        initDbSchema(db);
        return db;
    }

    function loadDbFromBytes(bytes) {
        var db = new _sqlInstance.Database(new Uint8Array(bytes));
        return db;
    }

    // --- Persistence ---

    // Save workspace memory DB
    function saveWorkspaceDb() {
        if (!_workspaceDb) return Promise.resolve();

        var bytes = _workspaceDb.export();
        var blob = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

        // Mode 2: disk workspace — write .textagent/memory.db
        if (M.wsDiskMode && M._disk && M._disk.isConnected()) {
            return M._disk.writeFileToPath('.textagent/memory.db',
                new Blob([bytes], { type: 'application/octet-stream' })
            ).catch(function (e) {
                console.warn('Failed to write memory.db to disk, falling back to IndexedDB:', e);
                return idbSetBlob('workspace', blob);
            });
        }

        // Mode 1: browser-only — save to IndexedDB
        return idbSetBlob('workspace', blob);
    }

    // Load workspace memory DB
    function loadWorkspaceDb() {
        if (!_sqlInstance) return Promise.reject(new Error('sql.js not loaded'));

        // Mode 2: disk workspace — try .textagent/memory.db first
        if (M.wsDiskMode && M._disk && M._disk.isConnected()) {
            return M._disk.readFileFromPath('.textagent/memory.db').then(function (data) {
                if (data && data instanceof Blob) {
                    return data.arrayBuffer().then(function (buf) {
                        _workspaceDb = loadDbFromBytes(buf);
                        return true;
                    });
                } else if (data && typeof data === 'string') {
                    // Disk stores as text — no binary, create fresh
                    _workspaceDb = createFreshDb();
                    return false;
                }
                _workspaceDb = createFreshDb();
                return false;
            }).catch(function () {
                // No file on disk — try IndexedDB fallback, then create fresh
                return idbGetBlob('workspace').then(function (blob) {
                    if (blob) {
                        _workspaceDb = loadDbFromBytes(blob);
                        return true;
                    }
                    _workspaceDb = createFreshDb();
                    return false;
                });
            });
        }

        // Mode 1: browser-only — load from IndexedDB
        return idbGetBlob('workspace').then(function (blob) {
            if (blob) {
                _workspaceDb = loadDbFromBytes(blob);
                return true;
            }
            _workspaceDb = createFreshDb();
            return false;
        });
    }

    // --- Workspace indexing ---

    function getIndexedFiles(db) {
        var result = {};
        try {
            var rows = db.exec('SELECT name, modified_at, chunk_count FROM memory_files');
            if (rows.length > 0) {
                rows[0].values.forEach(function (row) {
                    result[row[0]] = { modifiedAt: row[1], chunkCount: row[2] };
                });
            }
        } catch (e) { /* table may not exist yet */ }
        return result;
    }

    function indexFile(db, fileName, content) {
        var ext = fileName.split('.').pop().toLowerCase();
        var chunks;
        if (ext === 'md' || ext === 'markdown') {
            chunks = chunkMarkdown(content, fileName);
        } else {
            chunks = chunkPlainText(content, fileName);
        }

        // Remove old chunks for this file
        db.run("DELETE FROM chunks WHERE file = ?", [fileName]);
        db.run("DELETE FROM memory_files WHERE name = ?", [fileName]);

        // Insert new chunks
        for (var i = 0; i < chunks.length; i++) {
            db.run("INSERT INTO chunks (file, heading, content) VALUES (?, ?, ?)",
                [chunks[i].file, chunks[i].heading, chunks[i].content]);
        }

        // Record file metadata
        db.run("INSERT INTO memory_files (name, modified_at, chunk_count) VALUES (?, ?, ?)",
            [fileName, Date.now(), chunks.length]);

        return chunks.length;
    }

    // Build/rebuild workspace index
    async function ensureWorkspaceIndex(forceRebuild) {
        // Load sql.js if needed
        if (!_sqlInstance) {
            _sqlInstance = await loadSqlJs();
        }

        // Load existing DB
        if (!_workspaceDb) {
            await loadWorkspaceDb();
        }

        // Get list of workspace files
        var wsFiles = M.wsGetFiles ? M.wsGetFiles() : [];
        if (wsFiles.length === 0) return 0;

        var indexed = getIndexedFiles(_workspaceDb);
        var totalChunks = 0;
        var changed = false;

        for (var i = 0; i < wsFiles.length; i++) {
            var file = wsFiles[i];
            var fileName = file.name || file.id;

            // Check if file needs re-indexing
            if (!forceRebuild && indexed[fileName]) {
                totalChunks += indexed[fileName].chunkCount;
                continue;
            }

            // Read file content
            var content = '';
            try {
                if (M._wsGetFileContent) {
                    content = M._wsGetFileContent(file.id) || '';
                }
                if (!content && M.wsGetFileContentAsync) {
                    content = await M.wsGetFileContentAsync(file.id);
                }
            } catch (e) {
                console.warn('Failed to read file for indexing:', fileName, e);
                continue;
            }

            if (!content) continue;

            var count = indexFile(_workspaceDb, fileName, content);
            totalChunks += count;
            changed = true;
        }

        // Clean up files that no longer exist in workspace
        var currentFileNames = {};
        wsFiles.forEach(function (f) { currentFileNames[f.name || f.id] = true; });
        var indexedNames = Object.keys(indexed);
        for (var j = 0; j < indexedNames.length; j++) {
            if (!currentFileNames[indexedNames[j]]) {
                _workspaceDb.run("DELETE FROM chunks WHERE file = ?", [indexedNames[j]]);
                _workspaceDb.run("DELETE FROM memory_files WHERE name = ?", [indexedNames[j]]);
                changed = true;
            }
        }

        // Save if anything changed
        if (changed) {
            await saveWorkspaceDb();
        }

        return totalChunks;
    }

    // --- External Memory management ---

    async function createExternalMemory(name) {
        if (!_sqlInstance) {
            _sqlInstance = await loadSqlJs();
        }
        var db = createFreshDb();
        _externalDbs[name] = db;
        return db;
    }

    async function loadExternalMemory(name) {
        if (_externalDbs[name]) return _externalDbs[name];

        if (!_sqlInstance) {
            _sqlInstance = await loadSqlJs();
        }

        var blob = await idbGetBlob('ext-' + name);
        if (blob) {
            _externalDbs[name] = loadDbFromBytes(blob);
            return _externalDbs[name];
        }
        return null;
    }

    async function saveExternalMemory(name) {
        var db = _externalDbs[name];
        if (!db) return;
        var bytes = db.export();
        var blob = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        await idbSetBlob('ext-' + name, blob);
    }

    async function attachFolder(name) {
        if (typeof window.showDirectoryPicker !== 'function') {
            throw new Error('Folder access not supported in this browser.');
        }

        var dirHandle = await window.showDirectoryPicker({ mode: 'read' });
        var db = _externalDbs[name] || await createExternalMemory(name);

        // Clear existing index
        db.run("DELETE FROM chunks");
        db.run("DELETE FROM memory_files");

        var totalChunks = 0;

        // Recursively read files
        async function processDir(handle, path) {
            for await (var entry of handle.values()) {
                if (entry.kind === 'file') {
                    var ext = entry.name.split('.').pop().toLowerCase();
                    // Only index text-based files
                    if (['md', 'markdown', 'txt', 'json', 'csv', 'html', 'xml', 'yaml', 'yml', 'js', 'py', 'css'].indexOf(ext) < 0) continue;

                    try {
                        var file = await entry.getFile();
                        var content = await file.text();
                        var filePath = path ? path + '/' + entry.name : entry.name;
                        var count = indexFile(db, filePath, content);
                        totalChunks += count;
                    } catch (e) {
                        console.warn('Failed to read:', entry.name, e);
                    }
                } else if (entry.kind === 'directory') {
                    // Skip hidden directories
                    if (entry.name.startsWith('.')) continue;
                    if (entry.name === 'node_modules') continue;
                    var subPath = path ? path + '/' + entry.name : entry.name;
                    await processDir(entry, subPath);
                }
            }
        }

        await processDir(dirHandle, '');

        // Save metadata
        db.run("INSERT OR REPLACE INTO memory_meta (key, value) VALUES ('folderName', ?)", [dirHandle.name]);
        db.run("INSERT OR REPLACE INTO memory_meta (key, value) VALUES ('lastIndexedAt', ?)", [new Date().toISOString()]);

        _externalDbs[name] = db;
        await saveExternalMemory(name);

        return { chunkCount: totalChunks, folderName: dirHandle.name };
    }

    async function attachFiles(name) {
        if (typeof window.showOpenFilePicker !== 'function') {
            throw new Error('File picker not supported in this browser.');
        }

        var fileHandles = await window.showOpenFilePicker({ multiple: true });
        var db = _externalDbs[name] || await createExternalMemory(name);

        var totalChunks = 0;
        for (var i = 0; i < fileHandles.length; i++) {
            var fh = fileHandles[i];
            try {
                var file = await fh.getFile();
                var content = await file.text();
                var count = indexFile(db, file.name, content);
                totalChunks += count;
            } catch (e) {
                console.warn('Failed to read:', fh.name, e);
            }
        }

        db.run("INSERT OR REPLACE INTO memory_meta (key, value) VALUES ('lastIndexedAt', ?)", [new Date().toISOString()]);

        _externalDbs[name] = db;
        await saveExternalMemory(name);

        return { addedChunks: totalChunks };
    }

    // --- Search ---

    function searchDb(db, query, maxResults) {
        maxResults = maxResults || 5;
        if (!db) return [];

        // Try FTS5 MATCH first
        try {
            var results = db.exec(
                "SELECT file, heading, snippet(chunks, 2, '»', '«', '...', 40), rank " +
                "FROM chunks WHERE chunks MATCH ? ORDER BY rank LIMIT ?",
                [query, maxResults]
            );
            if (results.length > 0) {
                return results[0].values.map(function (row) {
                    return { file: row[0], heading: row[1], snippet: row[2], rank: row[3] };
                });
            }
            return [];
        } catch (e) {
            // FTS5 not available — fallback LIKE search
            try {
                var terms = query.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 2; });
                if (terms.length === 0) return [];

                var where = terms.map(function () { return "(LOWER(content) LIKE ? OR LOWER(heading) LIKE ? OR LOWER(file) LIKE ?)"; }).join(' OR ');
                var params = [];
                terms.forEach(function (t) {
                    params.push('%' + t + '%', '%' + t + '%', '%' + t + '%');
                });

                var fallback = db.exec(
                    "SELECT file, heading, SUBSTR(content, 1, 200) as snippet FROM chunks WHERE " + where + " LIMIT ?",
                    params.concat([maxResults])
                );
                if (fallback.length > 0) {
                    return fallback[0].values.map(function (row) {
                        return { file: row[0], heading: row[1], snippet: row[2], rank: 0 };
                    });
                }
            } catch (e2) {
                console.warn('Memory search fallback failed:', e2);
            }
            return [];
        }
    }

    // Search across multiple sources
    async function search(sources, query, maxResults) {
        if (!sources || sources.length === 0) return [];
        maxResults = maxResults || 5;

        var allResults = [];

        for (var i = 0; i < sources.length; i++) {
            var src = sources[i].trim().toLowerCase();

            if (src === 'workspace') {
                // Ensure workspace is indexed
                await ensureWorkspaceIndex(false);
                if (_workspaceDb) {
                    var wsResults = searchDb(_workspaceDb, query, maxResults);
                    allResults = allResults.concat(wsResults);
                }
            } else {
                // External memory
                var extDb = await loadExternalMemory(src);
                if (extDb) {
                    var extResults = searchDb(extDb, query, maxResults);
                    allResults = allResults.concat(extResults);
                }
            }
        }

        // Sort by rank (lower = better for FTS5) and limit
        allResults.sort(function (a, b) { return (a.rank || 0) - (b.rank || 0); });
        return allResults.slice(0, maxResults);
    }

    // Format search results for injection into AI context
    function formatForContext(results) {
        if (!results || results.length === 0) return '';
        return results.map(function (r) {
            var loc = '[' + r.file;
            if (r.heading) loc += ' > ' + r.heading;
            loc += ']';
            return loc + '\n' + (r.snippet || '');
        }).join('\n\n');
    }

    // --- Stats ---

    function getStats(db) {
        if (!db) return { files: 0, chunks: 0 };
        try {
            var fileCount = db.exec('SELECT COUNT(*) FROM memory_files');
            var chunkCount = db.exec('SELECT COUNT(*) FROM chunks');
            return {
                files: fileCount.length > 0 ? fileCount[0].values[0][0] : 0,
                chunks: chunkCount.length > 0 ? chunkCount[0].values[0][0] : 0
            };
        } catch (e) {
            return { files: 0, chunks: 0 };
        }
    }

    async function getWorkspaceStats() {
        if (!_workspaceDb) {
            if (!_sqlInstance) return { files: 0, chunks: 0 };
            await loadWorkspaceDb();
        }
        return getStats(_workspaceDb);
    }

    async function getExternalStats(name) {
        var db = await loadExternalMemory(name);
        return getStats(db);
    }

    // --- Public API ---
    var memory = {};

    memory.search = search;
    memory.formatForContext = formatForContext;
    memory.ensureWorkspaceIndex = ensureWorkspaceIndex;
    memory.attachFolder = attachFolder;
    memory.attachFiles = attachFiles;
    memory.getWorkspaceStats = getWorkspaceStats;
    memory.getExternalStats = getExternalStats;

    memory.removeExternal = async function (name) {
        if (_externalDbs[name]) {
            _externalDbs[name].close();
            delete _externalDbs[name];
        }
        await idbDeleteBlob('ext-' + name);
    };

    memory.listExternalMemories = async function () {
        // Scan IndexedDB for ext- keys
        var db = await openMemoryIDB();
        return new Promise(function (resolve) {
            var tx = db.transaction(IDB_STORE, 'readonly');
            var store = tx.objectStore(IDB_STORE);
            var req = store.getAllKeys();
            req.onsuccess = function () {
                var keys = req.result || [];
                var names = keys
                    .filter(function (k) { return typeof k === 'string' && k.startsWith('ext-'); })
                    .map(function (k) { return k.substring(4); });
                resolve(names);
            };
            req.onerror = function () { resolve([]); };
        });
    };

    memory.rebuildWorkspace = function () {
        return ensureWorkspaceIndex(true);
    };

    // Expose
    M._memory = memory;

})(window.MDView);
