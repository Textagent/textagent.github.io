/**
 * ai-model-storage.js — Download / Upload local AI models for offline use.
 *
 * Download: Fetches model files from HuggingFace → bundles into single ZIP → downloads
 * Upload:  User selects ZIP (or files) → extracts → restores to browser Cache API
 *
 * This enables full offline model usage by letting users keep a disk backup
 * of their AI models that survives browser cache evictions.
 */
(function (M) {
    'use strict';

    const _models = window.AI_MODELS || {};
    const DOWNLOADED_PREFIX = 'ta-model-downloaded-';

    // =========================================================
    //  CRC32 — needed for ZIP file format
    // =========================================================
    var _crc32Table = null;
    function _buildCrc32Table() {
        var t = new Uint32Array(256);
        for (var i = 0; i < 256; i++) {
            var c = i;
            for (var j = 0; j < 8; j++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            }
            t[i] = c;
        }
        return t;
    }
    function crc32(data) {
        if (!_crc32Table) _crc32Table = _buildCrc32Table();
        var crc = 0xFFFFFFFF;
        for (var i = 0; i < data.length; i++) {
            crc = _crc32Table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
        }
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    // =========================================================
    //  ZIP Creator — STORE mode (no compression, ONNX doesn't compress)
    // =========================================================
    /**
     * Create a ZIP file as a Blob from an array of entries.
     * @param {Array<{name: string, data: Uint8Array}>} entries
     * @returns {Blob}
     */
    function createZipBlob(entries) {
        var encoder = new TextEncoder();
        var parts = [];
        var centralDirParts = [];
        var offset = 0;
        var cdSize = 0;

        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            var nameBytes = encoder.encode(entry.name);
            var data = entry.data;
            var fileCrc = crc32(data);

            // Local file header (30 bytes + name)
            var lh = new ArrayBuffer(30);
            var lv = new DataView(lh);
            lv.setUint32(0, 0x04034b50, true);    // local file header signature
            lv.setUint16(4, 20, true);             // version needed (2.0)
            lv.setUint16(6, 0, true);              // general purpose bit flag
            lv.setUint16(8, 0, true);              // compression method (STORE)
            lv.setUint16(10, 0, true);             // last mod time
            lv.setUint16(12, 0, true);             // last mod date
            lv.setUint32(14, fileCrc, true);       // crc-32
            lv.setUint32(18, data.length, true);   // compressed size
            lv.setUint32(22, data.length, true);   // uncompressed size
            lv.setUint16(26, nameBytes.length, true); // file name length
            lv.setUint16(28, 0, true);             // extra field length

            parts.push(new Uint8Array(lh), nameBytes, data);

            // Central directory file header (46 bytes + name)
            var ch = new ArrayBuffer(46);
            var cv = new DataView(ch);
            cv.setUint32(0, 0x02014b50, true);    // central dir signature
            cv.setUint16(4, 20, true);             // version made by
            cv.setUint16(6, 20, true);             // version needed
            cv.setUint16(8, 0, true);              // flags
            cv.setUint16(10, 0, true);             // compression
            cv.setUint16(12, 0, true);             // mod time
            cv.setUint16(14, 0, true);             // mod date
            cv.setUint32(16, fileCrc, true);       // crc-32
            cv.setUint32(20, data.length, true);   // compressed size
            cv.setUint32(24, data.length, true);   // uncompressed size
            cv.setUint16(28, nameBytes.length, true); // name length
            cv.setUint16(30, 0, true);             // extra length
            cv.setUint16(32, 0, true);             // comment length
            cv.setUint16(34, 0, true);             // disk number start
            cv.setUint16(36, 0, true);             // internal file attrs
            cv.setUint32(38, 0, true);             // external file attrs
            cv.setUint32(42, offset, true);        // local header offset

            var cdEntry = new Uint8Array(ch);
            centralDirParts.push(cdEntry, nameBytes);
            cdSize += 46 + nameBytes.length;

            offset += 30 + nameBytes.length + data.length;
        }

        // Append central directory
        for (var j = 0; j < centralDirParts.length; j++) {
            parts.push(centralDirParts[j]);
        }

        // End of central directory record (22 bytes)
        var eocd = new ArrayBuffer(22);
        var ev = new DataView(eocd);
        ev.setUint32(0, 0x06054b50, true);             // EOCD signature
        ev.setUint16(4, 0, true);                       // disk number
        ev.setUint16(6, 0, true);                       // cd start disk
        ev.setUint16(8, entries.length, true);           // cd entries on disk
        ev.setUint16(10, entries.length, true);          // cd entries total
        ev.setUint32(12, cdSize, true);                  // cd size
        ev.setUint32(16, offset, true);                  // cd offset
        ev.setUint16(20, 0, true);                       // comment length
        parts.push(new Uint8Array(eocd));

        return new Blob(parts, { type: 'application/zip' });
    }

    // =========================================================
    //  ZIP Reader — extract files from a ZIP blob
    // =========================================================
    /**
     * Read a ZIP file and extract entries.
     * @param {ArrayBuffer} buffer
     * @returns {Array<{name: string, data: Uint8Array}>}
     */
    function readZipEntries(buffer) {
        var view = new DataView(buffer);
        var entries = [];

        // Find end of central directory
        var eocdOffset = -1;
        for (var i = buffer.byteLength - 22; i >= 0; i--) {
            if (view.getUint32(i, true) === 0x06054b50) {
                eocdOffset = i;
                break;
            }
        }
        if (eocdOffset < 0) throw new Error('Invalid ZIP file — no EOCD found');

        var cdOffset = view.getUint32(eocdOffset + 16, true);
        var cdEntries = view.getUint16(eocdOffset + 10, true);
        var pos = cdOffset;
        var decoder = new TextDecoder();

        for (var e = 0; e < cdEntries; e++) {
            if (view.getUint32(pos, true) !== 0x02014b50) break;

            var nameLen = view.getUint16(pos + 28, true);
            var extraLen = view.getUint16(pos + 30, true);
            var commentLen = view.getUint16(pos + 32, true);
            var localOffset = view.getUint32(pos + 42, true);
            var fileName = decoder.decode(new Uint8Array(buffer, pos + 46, nameLen));

            // Read from local file header
            var localNameLen = view.getUint16(localOffset + 26, true);
            var localExtraLen = view.getUint16(localOffset + 28, true);
            var compSize = view.getUint32(localOffset + 18, true);
            var dataStart = localOffset + 30 + localNameLen + localExtraLen;

            entries.push({
                name: fileName,
                data: new Uint8Array(buffer, dataStart, compSize),
            });

            pos += 46 + nameLen + extraLen + commentLen;
        }

        return entries;
    }

    // =========================================================
    //  Cache helpers
    // =========================================================

    function isFileSystemAccessSupported() {
        return typeof window.showDirectoryPicker === 'function';
    }

    async function getModelCacheEntries(modelId) {
        var cfg = _models[modelId];
        if (!cfg || !cfg.localModelId) return [];
        var localModelId = cfg.localModelId;
        var modelPathSegment = localModelId.replace(/^.*\/\//, '');
        var entries = [];
        try {
            var cacheNames = await caches.keys();
            for (var c = 0; c < cacheNames.length; c++) {
                var cache = await caches.open(cacheNames[c]);
                var requests = await cache.keys();
                for (var r = 0; r < requests.length; r++) {
                    var req = requests[r];
                    if (req.url.includes(modelPathSegment) || req.url.includes(localModelId)) {
                        var response = await cache.match(req);
                        if (response) entries.push({ url: req.url, cacheName: cacheNames[c], response: response });
                    }
                }
            }
        } catch (e) {
            console.warn('[ModelStorage] Cache read error:', e);
        }
        return entries;
    }

    async function getModelCacheSize(modelId) {
        var entries = await getModelCacheEntries(modelId);
        var total = 0;
        for (var i = 0; i < entries.length; i++) {
            try {
                var blob = await entries[i].response.clone().blob();
                total += blob.size;
            } catch (_) {}
        }
        return total;
    }

    async function getModelStorageStatus(modelId) {
        var cfg = _models[modelId];
        if (!cfg || !cfg.isLocal) return 'none';
        if (localStorage.getItem(DOWNLOADED_PREFIX + modelId)) return 'downloaded';
        try {
            var entries = await getModelCacheEntries(modelId);
            if (entries.length > 0) return 'cached';
        } catch (_) {}
        return 'none';
    }

    // =========================================================
    //  DOWNLOAD — Export cached model as a single ZIP file
    // =========================================================

    /**
     * Export a cached model from browser Cache API as a single ZIP file.
     * The model must already be in browser cache (downloaded via Models tab).
     */
    async function downloadModelFromHF(modelId, onProgress) {
        var cfg = _models[modelId];
        if (!cfg || !cfg.localModelId) throw new Error('Invalid model: ' + modelId);
        onProgress = onProgress || function () {};
        var hfModelId = cfg.localModelId;
        var modelName = cfg.dropdownName || cfg.label;

        // 1. Get cached files
        onProgress(0, 'Reading model from browser cache...');
        var cacheEntries = await getModelCacheEntries(modelId);

        if (cacheEntries.length === 0) {
            throw new Error(modelName + ' is not in browser cache.\nSelect it in the Models tab to download it first.');
        }

        // 2. Read each cached file into a ZIP entry
        var zipEntries = [];
        var totalSize = 0;

        for (var i = 0; i < cacheEntries.length; i++) {
            var entry = cacheEntries[i];
            var pct = Math.round(5 + (i / cacheEntries.length) * 70);

            // Extract filename from cache URL
            // URL format: https://huggingface.co/org/model/resolve/main/path/to/file
            var urlPath = '';
            try {
                var u = new URL(entry.url);
                var parts = u.pathname.split('/resolve/main/');
                urlPath = parts.length > 1 ? parts[1] : u.pathname.split('/').pop();
            } catch (_) {
                urlPath = entry.url.split('/').pop() || 'file_' + i;
            }

            onProgress(pct, 'Reading ' + (i + 1) + '/' + cacheEntries.length + ' — ' + urlPath);

            try {
                var blob = await entry.response.clone().blob();
                var arrayBuf = await blob.arrayBuffer();
                var data = new Uint8Array(arrayBuf);

                zipEntries.push({
                    name: urlPath,
                    data: data,
                    url: entry.url, // preserve original cache URL for reimport
                });
                totalSize += data.length;
            } catch (err) {
                console.warn('[ModelStorage] Could not read cached file:', entry.url, err);
            }
        }

        if (zipEntries.length === 0) {
            throw new Error('Could not read any cached files for ' + modelName);
        }

        // 3. Add manifest (for reimport)
        var manifest = {
            version: 1,
            modelId: modelId,
            localModelId: hfModelId,
            modelName: modelName,
            downloadSize: cfg.downloadSize,
            exportDate: new Date().toISOString(),
            fileCount: zipEntries.length,
            files: zipEntries.map(function (e) {
                return { path: e.name, size: e.data.length, url: e.url };
            }),
        };
        var manifestData = new TextEncoder().encode(JSON.stringify(manifest, null, 2));
        zipEntries.unshift({ name: 'manifest.json', data: manifestData });

        // 4. Build ZIP
        onProgress(80, 'Creating ZIP (' + formatBytes(totalSize) + ')...');
        var zipBlob = createZipBlob(zipEntries);

        // 5. Download
        var zipName = hfModelId.replace('/', '--') + '.zip';
        onProgress(95, 'Saving ' + zipName + '...');
        _triggerBlobDownload(zipBlob, zipName);

        // 6. Track
        localStorage.setItem(DOWNLOADED_PREFIX + modelId, JSON.stringify({
            date: manifest.exportDate,
            fileCount: zipEntries.length - 1, // exclude manifest
            totalSize: totalSize,
        }));

        onProgress(100, 'Saved as ' + zipName + ' (' + formatBytes(totalSize) + ')');
        return { success: true, fileCount: zipEntries.length - 1, totalSize: totalSize };
    }

    // =========================================================
    //  UPLOAD — Restore from ZIP or individual files to cache
    // =========================================================

    /**
     * Upload model from a ZIP file (or individual files) to browser Cache API.
     */
    async function uploadModelToCache(modelId, onProgress) {
        var cfg = _models[modelId];
        if (!cfg || !cfg.localModelId) throw new Error('Invalid model: ' + modelId);
        onProgress = onProgress || function () {};
        var hfModelId = cfg.localModelId;

        // 1. Pick file(s)
        onProgress(0, 'Select the model ZIP file...');
        var selectedFiles;
        try {
            selectedFiles = await _pickFiles('.zip,application/zip,application/json,.onnx,.onnx_data,.txt');
        } catch (e) {
            if (e.message === 'cancelled') return { success: false, fileCount: 0, cancelled: true };
            throw e;
        }
        if (!selectedFiles.length) throw new Error('No files selected.');

        var manifest = null;
        var filesToImport = []; // [{name, data, url}]

        // 2. Check if it's a ZIP file
        var firstFile = selectedFiles[0];
        var isZip = firstFile.name.endsWith('.zip') || firstFile.type === 'application/zip';

        if (isZip) {
            onProgress(5, 'Extracting ZIP archive...');
            var zipBuffer = await firstFile.arrayBuffer();
            var zipEntries = readZipEntries(zipBuffer);

            // Find manifest
            for (var z = 0; z < zipEntries.length; z++) {
                if (zipEntries[z].name === 'manifest.json') {
                    try {
                        manifest = JSON.parse(new TextDecoder().decode(zipEntries[z].data));
                    } catch (_) {}
                }
            }

            // Build file list from ZIP entries (skip manifest)
            for (var ze = 0; ze < zipEntries.length; ze++) {
                if (zipEntries[ze].name === 'manifest.json') continue;
                var entryUrl = null;
                if (manifest && manifest.files) {
                    for (var mf = 0; mf < manifest.files.length; mf++) {
                        if (manifest.files[mf].path === zipEntries[ze].name) {
                            entryUrl = manifest.files[mf].url;
                            break;
                        }
                    }
                }
                if (!entryUrl) {
                    entryUrl = 'https://huggingface.co/' + hfModelId + '/resolve/main/' + zipEntries[ze].name;
                }
                filesToImport.push({
                    name: zipEntries[ze].name,
                    data: zipEntries[ze].data,
                    url: entryUrl,
                });
            }
        } else {
            // Individual files fallback
            var modelDirName = hfModelId.replace('/', '--');
            for (var f = 0; f < selectedFiles.length; f++) {
                var sf = selectedFiles[f];
                if (sf.name.endsWith('manifest.json')) {
                    try { manifest = JSON.parse(await sf.text()); } catch (_) {}
                    continue;
                }
                var fileData = new Uint8Array(await sf.arrayBuffer());
                var cacheUrl;
                if (manifest && manifest.files) {
                    var flatName = modelDirName + '__' + sf.name;
                    for (var mfi = 0; mfi < manifest.files.length; mfi++) {
                        var flat = modelDirName + '__' + manifest.files[mfi].path.replace(/\//g, '__');
                        if (flat === sf.name || flat === flatName) {
                            cacheUrl = manifest.files[mfi].url;
                            break;
                        }
                    }
                }
                if (!cacheUrl) {
                    var cleaned = sf.name.replace(modelDirName + '__', '').replace(/__/g, '/');
                    cacheUrl = 'https://huggingface.co/' + hfModelId + '/resolve/main/' + cleaned;
                }
                filesToImport.push({ name: sf.name, data: fileData, url: cacheUrl });
            }
        }

        // Validate manifest model match
        if (manifest && manifest.localModelId && manifest.localModelId !== hfModelId) {
            throw new Error('Wrong model: ZIP contains ' +
                (manifest.modelName || manifest.localModelId) +
                ', expected ' + (cfg.dropdownName || modelId));
        }

        if (!filesToImport.length) throw new Error('No model files found in selection.');

        // 3. Import to Cache API
        var targetCache = await caches.open('transformers-cache');
        var imported = 0;

        for (var fi = 0; fi < filesToImport.length; fi++) {
            var imp = filesToImport[fi];
            var pct = Math.round(10 + (fi / filesToImport.length) * 85);
            onProgress(pct, 'Restoring ' + imp.name + '...');

            try {
                var contentType = 'application/octet-stream';
                if (imp.name.endsWith('.json')) contentType = 'application/json';
                else if (imp.name.endsWith('.txt')) contentType = 'text/plain';

                var response = new Response(imp.data, {
                    status: 200,
                    statusText: 'OK',
                    headers: {
                        'Content-Type': contentType,
                        'Content-Length': imp.data.length.toString(),
                    },
                });
                await targetCache.put(new Request(imp.url), response);
                imported++;
            } catch (err) {
                console.warn('[ModelStorage] Import failed:', imp.name, err);
            }
        }

        if (!imported) throw new Error('No files could be imported.');

        // 4. Set consent flags
        var consentKey = (M.KEYS && M.KEYS.AI_CONSENTED_PREFIX)
            ? M.KEYS.AI_CONSENTED_PREFIX + modelId
            : 'md-viewer-ai-consented-' + modelId;
        localStorage.setItem(consentKey, 'true');
        if (modelId === 'qwen-local' && M.KEYS) {
            localStorage.setItem(M.KEYS.AI_CONSENTED, 'true');
        }

        try {
            if (navigator.storage && navigator.storage.persist) await navigator.storage.persist();
        } catch (_) {}

        onProgress(100, 'Upload complete! ' + imported + ' files restored.');
        return { success: true, fileCount: imported };
    }

    // =========================================================
    //  HELPERS
    // =========================================================

    function _pickFiles(accept) {
        return new Promise(function (resolve, reject) {
            var input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            if (accept) input.accept = accept;
            input.style.display = 'none';
            input.addEventListener('change', function () {
                if (input.files && input.files.length > 0) resolve(Array.from(input.files));
                else reject(new Error('cancelled'));
                document.body.removeChild(input);
            });
            input.addEventListener('cancel', function () {
                reject(new Error('cancelled'));
                document.body.removeChild(input);
            });
            document.body.appendChild(input);
            input.click();
        });
    }

    function _triggerBlobDownload(blob, filename) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    }

    function _delay(ms) {
        return new Promise(function (r) { setTimeout(r, ms); });
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    async function getAllLocalModelStatuses() {
        var results = [];
        for (var id in _models) {
            if (!_models.hasOwnProperty(id)) continue;
            var cfg = _models[id];
            if (!cfg.isLocal) continue;
            var status = await getModelStorageStatus(id);
            var cachedSize = 0;
            if (status === 'cached' || status === 'downloaded') {
                cachedSize = await getModelCacheSize(id);
            }
            var dlRaw = localStorage.getItem(DOWNLOADED_PREFIX + id);
            var downloadInfo = dlRaw ? JSON.parse(dlRaw) : null;
            results.push({ id: id, cfg: cfg, status: status, cachedSize: cachedSize, downloadInfo: downloadInfo });
        }
        return results;
    }

    // Expose API
    if (!M._ai) M._ai = {};
    M._ai.modelStorage = {
        isSupported: function () { return true; },
        downloadFromHF: downloadModelFromHF,
        uploadToCache: uploadModelToCache,
        getStatus: getModelStorageStatus,
        getCacheSize: getModelCacheSize,
        getCacheEntries: getModelCacheEntries,
        getAllStatuses: getAllLocalModelStatuses,
        formatBytes: formatBytes,
        DOWNLOADED_PREFIX: DOWNLOADED_PREFIX,
    };

})(window.MDView || (window.MDView = {}));
