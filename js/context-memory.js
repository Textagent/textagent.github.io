// ============================================
// context-memory.js — Workspace Intelligence + External Memory
// SQLite FTS5 + Embedding-powered hybrid search for AI tags
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

    // --- Embedding / Semantic Search State ---
    var _embeddingWorker = null;
    var _embeddingReady = false;
    var _embeddingCallbacks = {}; // id → { resolve, reject }
    var _embeddingIdCounter = 0;
    var _vectorStores = {}; // sourceName → [{ file, heading, content, vector }]

    function initEmbeddingWorker() {
        if (_embeddingWorker) return Promise.resolve(_embeddingReady);

        return new Promise(function (resolve) {
            try {
                _embeddingWorker = new Worker('/embedding-worker.js', { type: 'module' });
            } catch (e) {
                // Fallback for environments where /embedding-worker.js isn't at root
                try {
                    _embeddingWorker = new Worker('./embedding-worker.js', { type: 'module' });
                } catch (e2) {
                    console.warn('Failed to create embedding worker:', e2);
                    resolve(false);
                    return;
                }
            }

            _embeddingWorker.addEventListener('message', function (event) {
                var msg = event.data;
                switch (msg.type) {
                    case 'loaded':
                        _embeddingReady = true;
                        console.log('[Memory] Embedding model loaded (' + (msg.device || 'unknown') + ')');
                        resolve(true);
                        break;
                    case 'embeddings':
                        if (msg.id !== undefined && _embeddingCallbacks[msg.id]) {
                            _embeddingCallbacks[msg.id].resolve(msg.vectors);
                            delete _embeddingCallbacks[msg.id];
                        }
                        break;
                    case 'error':
                        console.warn('[Memory] Embedding error:', msg.message);
                        if (msg.id !== undefined && _embeddingCallbacks[msg.id]) {
                            _embeddingCallbacks[msg.id].reject(new Error(msg.message));
                            delete _embeddingCallbacks[msg.id];
                        }
                        if (!_embeddingReady) resolve(false);
                        break;
                    case 'status':
                        console.log('[Memory]', msg.message);
                        break;
                }
            });

            _embeddingWorker.addEventListener('error', function (e) {
                console.warn('[Memory] Embedding worker error:', e.message);
                if (!_embeddingReady) resolve(false);
            });

            _embeddingWorker.postMessage({ type: 'load' });
        });
    }

    function embedTexts(texts) {
        if (!_embeddingWorker || !_embeddingReady) {
            return Promise.reject(new Error('Embedding model not ready'));
        }
        var id = ++_embeddingIdCounter;
        return new Promise(function (resolve, reject) {
            _embeddingCallbacks[id] = { resolve: resolve, reject: reject };
            _embeddingWorker.postMessage({ type: 'embed', texts: texts, id: id });
            // Timeout after 60s
            setTimeout(function () {
                if (_embeddingCallbacks[id]) {
                    _embeddingCallbacks[id].reject(new Error('Embedding timeout'));
                    delete _embeddingCallbacks[id];
                }
            }, 60000);
        });
    }

    function cosineSim(a, b) {
        var dot = 0;
        for (var i = 0; i < a.length; i++) dot += a[i] * b[i];
        return dot; // vectors are pre-normalized
    }

    function semanticSearch(sourceName, queryVector, maxResults) {
        var store = _vectorStores[sourceName];
        if (!store || store.length === 0) return [];

        var scored = [];
        for (var i = 0; i < store.length; i++) {
            scored.push({
                file: store[i].file,
                heading: store[i].heading,
                snippet: store[i].content.substring(0, 200),
                score: cosineSim(queryVector, store[i].vector)
            });
        }
        scored.sort(function (a, b) { return b.score - a.score; });
        return scored.slice(0, maxResults);
    }

    function mergeResults(ftsHits, semanticHits, maxResults) {
        // Build a map keyed by file+snippet for deduplication
        var merged = {};

        // FTS5 hits: rank is negative (lower = better), normalize to 0..1
        var ftsMaxRank = 1;
        for (var i = 0; i < ftsHits.length; i++) {
            var absRank = Math.abs(ftsHits[i].rank || 0);
            if (absRank > ftsMaxRank) ftsMaxRank = absRank;
        }
        for (var j = 0; j < ftsHits.length; j++) {
            var fh = ftsHits[j];
            var key = fh.file + '::' + (fh.snippet || '').substring(0, 80);
            merged[key] = {
                file: fh.file,
                heading: fh.heading,
                snippet: fh.snippet,
                ftsScore: Math.abs(fh.rank || 0) / ftsMaxRank,
                semScore: 0
            };
        }

        // Semantic hits
        for (var k = 0; k < semanticHits.length; k++) {
            var sh = semanticHits[k];
            var key2 = sh.file + '::' + (sh.snippet || '').substring(0, 80);
            if (merged[key2]) {
                merged[key2].semScore = sh.score;
            } else {
                merged[key2] = {
                    file: sh.file,
                    heading: sh.heading,
                    snippet: sh.snippet,
                    ftsScore: 0,
                    semScore: sh.score
                };
            }
        }

        // Weighted combination: 0.4 keyword + 0.6 semantic
        var results = Object.keys(merged).map(function (k) {
            var m = merged[k];
            m.combinedScore = 0.4 * m.ftsScore + 0.6 * m.semScore;
            // Use a negative rank for backward compatibility with sort order
            m.rank = -m.combinedScore;
            return m;
        });

        results.sort(function (a, b) { return b.combinedScore - a.combinedScore; });
        return results.slice(0, maxResults);
    }

    // --- Vector persistence helpers ---
    function saveVectors(sourceName) {
        var store = _vectorStores[sourceName];
        if (!store || store.length === 0) return Promise.resolve();

        // Serialize: store metadata + flat Float32Array of all vectors
        var dim = store[0].vector.length;
        var meta = store.map(function (v) {
            return { file: v.file, heading: v.heading, content: v.content.substring(0, 300) };
        });
        var flatVectors = new Float32Array(store.length * dim);
        for (var i = 0; i < store.length; i++) {
            flatVectors.set(store[i].vector, i * dim);
        }

        var blob = {
            dim: dim,
            count: store.length,
            meta: meta,
            vectors: flatVectors.buffer
        };

        return idbSetBlob('vectors-' + sourceName, blob);
    }

    function loadVectors(sourceName) {
        return idbGetBlob('vectors-' + sourceName).then(function (blob) {
            if (!blob || !blob.vectors || !blob.meta) return false;

            var dim = blob.dim;
            var count = blob.count;
            var flatVectors = new Float32Array(blob.vectors);
            var store = [];

            for (var i = 0; i < count; i++) {
                var start = i * dim;
                store.push({
                    file: blob.meta[i].file,
                    heading: blob.meta[i].heading,
                    content: blob.meta[i].content,
                    vector: Array.from(flatVectors.subarray(start, start + dim))
                });
            }

            _vectorStores[sourceName] = store;
            return true;
        }).catch(function () { return false; });
    }

    function deleteVectors(sourceName) {
        delete _vectorStores[sourceName];
        return idbDeleteBlob('vectors-' + sourceName);
    }

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

    function indexFile(db, fileName, content, sourceName) {
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

        // Embed chunks for semantic search (async, non-blocking)
        if (_embeddingReady && sourceName) {
            var texts = chunks.map(function (c) { return c.content; });
            embedTexts(texts).then(function (vectors) {
                // Remove old vectors for this file
                if (!_vectorStores[sourceName]) _vectorStores[sourceName] = [];
                _vectorStores[sourceName] = _vectorStores[sourceName].filter(function (v) {
                    return v.file !== fileName;
                });
                // Add new vectors
                for (var j = 0; j < chunks.length; j++) {
                    _vectorStores[sourceName].push({
                        file: chunks[j].file,
                        heading: chunks[j].heading,
                        content: chunks[j].content,
                        vector: vectors[j]
                    });
                }
                // Persist vectors
                saveVectors(sourceName).catch(function (e) {
                    console.warn('[Memory] Failed to save vectors:', e);
                });
            }).catch(function (e) {
                console.warn('[Memory] Embedding failed for', fileName, ':', e.message);
            });
        }

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

            var count = indexFile(_workspaceDb, fileName, content, 'workspace');
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
                    // Text-based + convertible binary formats
                    var TEXT_EXTS = ['md', 'markdown', 'txt', 'json', 'csv', 'html', 'xml', 'yaml', 'yml', 'js', 'py', 'css', 'ts', 'tsx', 'jsx', 'log'];
                    var BINARY_EXTS = ['docx', 'xlsx', 'xls', 'numbers', 'pdf'];
                    if (TEXT_EXTS.indexOf(ext) < 0 && BINARY_EXTS.indexOf(ext) < 0) continue;

                    try {
                        var file = await entry.getFile();
                        var content;
                        // Use file converters for binary formats
                        if (BINARY_EXTS.indexOf(ext) >= 0 && window.MDView && window.MDView.convertFileToMarkdown) {
                            content = await window.MDView.convertFileToMarkdown(file);
                            if (!content) content = await file.text(); // fallback
                        } else {
                            content = await file.text();
                        }
                        var filePath = path ? path + '/' + entry.name : entry.name;
                        var count = indexFile(db, filePath, content, name);
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
                var content;
                var ext = file.name.split('.').pop().toLowerCase();
                var BINARY_EXTS = ['docx', 'xlsx', 'xls', 'numbers', 'pdf'];
                // Use file converters for binary formats
                if (BINARY_EXTS.indexOf(ext) >= 0 && window.MDView && window.MDView.convertFileToMarkdown) {
                    content = await window.MDView.convertFileToMarkdown(file);
                    if (!content) content = await file.text();
                } else {
                    content = await file.text();
                }
                var count = indexFile(db, file.name, content, name);
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

    function searchDb(db, query, maxResults, sourceName) {
        maxResults = maxResults || 5;
        if (!db) return [];

        // 1. FTS5 keyword search (existing)
        var ftsHits = [];
        try {
            var results = db.exec(
                "SELECT file, heading, snippet(chunks, 2, '»', '«', '...', 40), rank " +
                "FROM chunks WHERE chunks MATCH ? ORDER BY rank LIMIT ?",
                [query, maxResults]
            );
            if (results.length > 0) {
                ftsHits = results[0].values.map(function (row) {
                    return { file: row[0], heading: row[1], snippet: row[2], rank: row[3] };
                });
            }
        } catch (e) {
            // FTS5 not available — fallback LIKE search
            try {
                var terms = query.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 2; });
                if (terms.length > 0) {
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
                        ftsHits = fallback[0].values.map(function (row) {
                            return { file: row[0], heading: row[1], snippet: row[2], rank: 0 };
                        });
                    }
                }
            } catch (e2) {
                console.warn('Memory search fallback failed:', e2);
            }
        }

        // 2. If no semantic search available, return FTS-only
        if (!_embeddingReady || !sourceName || !_vectorStores[sourceName] || _vectorStores[sourceName].length === 0) {
            return ftsHits;
        }

        // 3. Semantic search will be performed by caller (async)
        // Store ftsHits on a temporary property so the async caller can merge
        ftsHits._sourceName = sourceName;
        return ftsHits;
    }

    // Search across multiple sources (hybrid: FTS5 + semantic)
    async function search(sources, query, maxResults) {
        if (!sources || sources.length === 0) return [];
        maxResults = maxResults || 5;

        // Compute query embedding if semantic search is available
        var queryVector = null;
        if (_embeddingReady) {
            try {
                var vectors = await embedTexts([query]);
                queryVector = vectors[0];
            } catch (_) { /* proceed without semantic */ }
        }

        var allResults = [];

        for (var i = 0; i < sources.length; i++) {
            var src = sources[i].trim().toLowerCase();
            var db = null;
            var sourceName = src;

            if (src === 'workspace') {
                await ensureWorkspaceIndex(false);
                db = _workspaceDb;
            } else {
                db = await loadExternalMemory(src);
                sourceName = src;
            }

            if (!db) continue;

            // Load vectors from IndexedDB if not in memory yet
            if (_embeddingReady && !_vectorStores[sourceName]) {
                await loadVectors(sourceName);
            }

            // FTS5 keyword search
            var ftsHits = searchDb(db, query, maxResults, sourceName);

            // Semantic search (if available)
            if (queryVector && _vectorStores[sourceName] && _vectorStores[sourceName].length > 0) {
                var semHits = semanticSearch(sourceName, queryVector, maxResults);
                var merged = mergeResults(ftsHits, semHits, maxResults);
                allResults = allResults.concat(merged);
            } else {
                allResults = allResults.concat(ftsHits);
            }
        }

        // Sort by combined score (rank is negative combined score) and limit
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
        await deleteVectors(name);
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

    /**
     * Return all available memory source names.
     * @param {string[]} docMemoryNames — names from {{Memory:}} tags in the document
     * @returns {Promise<{name:string, origin:string}[]>}
     */
    memory.listAllSources = async function (docMemoryNames) {
        var sources = [{ name: 'workspace', origin: 'built-in' }];
        // From document {{Memory:}} tags
        (docMemoryNames || []).forEach(function (n) {
            if (n && n !== 'workspace') sources.push({ name: n, origin: 'document' });
        });
        // From IndexedDB (previously attached external memories)
        try {
            var extNames = await memory.listExternalMemories();
            extNames.forEach(function (n) {
                // Avoid duplicates
                if (!sources.some(function (s) { return s.name === n; })) {
                    sources.push({ name: n, origin: 'stored' });
                }
            });
        } catch (_) { /* ignore */ }
        return sources;
    };

    // --- Semantic Search API ---

    /**
     * Enable semantic (embedding-based) search.
     * Downloads the embedding model (~23MB) in a background worker.
     * @returns {Promise<boolean>} true if model loaded successfully
     */
    memory.enableSemanticSearch = function () {
        return initEmbeddingWorker();
    };

    /**
     * Get current embedding/semantic search status.
     * @returns {{ ready: boolean, modelSize: string, chunksEmbedded: number }}
     */
    memory.getEmbeddingStatus = function () {
        var totalChunks = 0;
        Object.keys(_vectorStores).forEach(function (k) {
            totalChunks += _vectorStores[k].length;
        });
        return {
            ready: _embeddingReady,
            modelSize: '~150MB',
            chunksEmbedded: totalChunks
        };
    };

    /**
     * Re-embed all chunks for a source (e.g., after enabling semantic search).
     * @param {string} sourceName — 'workspace' or external name
     * @returns {Promise<number>} number of chunks embedded
     */
    memory.reembedSource = async function (sourceName) {
        if (!_embeddingReady) throw new Error('Embedding model not loaded');

        var db = sourceName === 'workspace' ? _workspaceDb : (_externalDbs[sourceName] || await loadExternalMemory(sourceName));
        if (!db) return 0;

        // Read all chunks from SQLite
        var allChunks = [];
        try {
            var rows = db.exec('SELECT file, heading, content FROM chunks');
            if (rows.length > 0) {
                allChunks = rows[0].values.map(function (row) {
                    return { file: row[0], heading: row[1], content: row[2] };
                });
            }
        } catch (_) { return 0; }

        if (allChunks.length === 0) return 0;

        // Embed in batches
        var BATCH = 32;
        _vectorStores[sourceName] = [];

        for (var i = 0; i < allChunks.length; i += BATCH) {
            var batch = allChunks.slice(i, i + BATCH);
            var texts = batch.map(function (c) { return c.content; });
            try {
                var vectors = await embedTexts(texts);
                for (var j = 0; j < batch.length; j++) {
                    _vectorStores[sourceName].push({
                        file: batch[j].file,
                        heading: batch[j].heading,
                        content: batch[j].content,
                        vector: vectors[j]
                    });
                }
            } catch (e) {
                console.warn('[Memory] Batch embedding failed:', e.message);
            }
        }

        await saveVectors(sourceName);
        return _vectorStores[sourceName].length;
    };

    // Expose
    M._memory = memory;

})(window.MDView);
