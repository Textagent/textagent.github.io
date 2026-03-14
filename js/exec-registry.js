// ============================================
// exec-registry.js — Block Registry & Stable IDs
// Discovers all executable blocks in document,
// assigns stable content-hash IDs, maintains
// ordered execution list.
// ============================================
(function (M) {
    'use strict';

    // FNV-1a 32-bit hash for stable block IDs
    function fnv1a(str) {
        var hash = 0x811c9dc5;
        for (var i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = (hash * 0x01000193) >>> 0;
        }
        return hash;
    }

    // Generate a stable block ID from type + source content
    function makeBlockId(type, source) {
        return type + '-' + fnv1a(source).toString(36);
    }

    // ========================================
    // Runtime Adapter Registry
    // ========================================
    var _runtimes = {};  // runtimeKey → { execute(source, context, container) → Promise<result> }

    function registerRuntime(key, adapter) {
        _runtimes[key] = adapter;
    }

    function getRuntime(key) {
        return _runtimes[key] || null;
    }

    // ========================================
    // Document Scanner
    // ========================================

    // Previous scan result for diffing
    var _prevBlocks = [];
    var _prevBlockMap = {}; // id → block (for preserving execution state)

    /**
     * Scan the markdown text and return an ordered list of ExecBlock descriptors.
     * Each block: { id, type, lang, position, source, runtimeKey, status }
     */
    function scanDocument(markdownText) {
        var blocks = [];
        var seenIds = {};

        // 1. Scan fenced code blocks (bash, math, python, html, js, sql)
        scanCodeBlocks(markdownText, blocks, seenIds);

        // 2. Scan DocGen tags (AI, Image, Agent — skip Memory)
        scanDocgenBlocks(markdownText, blocks, seenIds);

        // 3. Scan API tags
        scanApiBlocks(markdownText, blocks, seenIds);

        // 4. Scan Linux tags (script mode only)
        scanLinuxBlocks(markdownText, blocks, seenIds);

        // Sort by position in document
        blocks.sort(function (a, b) { return a.position - b.position; });

        // Preserve execution state from previous scan
        var newBlockMap = {};
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            var prev = _prevBlockMap[block.id];
            if (prev && prev.status) {
                block.status = prev.status;
                block.result = prev.result;
            }
            newBlockMap[block.id] = block;
        }
        _prevBlocks = blocks;
        _prevBlockMap = newBlockMap;

        return blocks;
    }

    // ---- Code block scanner ----
    function scanCodeBlocks(markdown, blocks, seenIds) {
        // Capture optional @var: annotation after language: ```javascript @var: result
        var re = /^(`{3,})(bash|sh|shell|math|python|py|html|html-autorun|javascript|js|sql)(?:\s+@var:\s*(\S+))?\s*\n([\s\S]*?)^\1\s*$/gm;
        var match;
        while ((match = re.exec(markdown)) !== null) {
            var lang = match[2].toLowerCase();
            var varName = match[3] || null; // optional @var: annotation
            var source = match[4].trim();
            var runtimeKey = mapLangToRuntime(lang);
            if (!runtimeKey) continue;

            var id = makeBlockId(runtimeKey, source);
            // Handle duplicate IDs (same content in multiple blocks)
            if (seenIds[id]) {
                id = id + '-' + Object.keys(seenIds).filter(function (k) { return k.startsWith(id.split('-')[0]); }).length;
            }
            seenIds[id] = true;

            blocks.push({
                id: id,
                type: 'code',
                lang: lang,
                position: match.index,
                source: source,
                runtimeKey: runtimeKey,
                status: 'pending',
                result: null,
                varName: varName  // if set, store result in M._vars
            });
        }
    }

    function mapLangToRuntime(lang) {
        switch (lang) {
            case 'bash': case 'sh': case 'shell': return 'bash';
            case 'math': return 'math';
            case 'python': case 'py': return 'python';
            case 'html': case 'html-autorun': return 'html';
            case 'javascript': case 'js': return 'javascript';
            case 'sql': return 'sql';
            default: return null;
        }
    }

    // ---- DocGen block scanner ----
    function scanDocgenBlocks(markdown, blocks, seenIds) {
        if (!M.parseDocgenBlocks) return;
        var docgenBlocks = M.parseDocgenBlocks(markdown);
        for (var i = 0; i < docgenBlocks.length; i++) {
            var db = docgenBlocks[i];
            if (db.type === 'Memory') continue; // Skip memory blocks — not executable
            var runtimeKey = db.type.toLowerCase(); // 'ai', 'image', 'agent'
            var source = db.prompt || db.fullMatch;
            var id = makeBlockId('docgen-' + runtimeKey, source);
            if (seenIds[id]) {
                id = id + '-' + Object.keys(seenIds).filter(function (k) { return k.startsWith(id.split('-')[0]); }).length;
            }
            seenIds[id] = true;

            blocks.push({
                id: id,
                type: 'docgen',
                lang: runtimeKey,
                position: db.start,
                source: source,
                runtimeKey: 'docgen-' + runtimeKey,
                status: 'pending',
                result: null,
                _blockIndex: i, // index for existing DOM lookup
                _fullMatch: db.fullMatch,
                // Enriched metadata for compiler + adapters
                varName: db.varName || null,
                inputVars: db.inputVars || [],
                model: db.model || null,
                targetLang: db.targetLang || null,
                think: db.think || db.type === 'Think' || false,
                search: db.search || [],
                useMemory: db.useMemory || [],
                blockLabel: db.label || db.prompt && db.prompt.substring(0, 40) || runtimeKey,
                ocrMode: db.ocrMode || null,
                steps: db.steps || null
            });
        }
    }

    // ---- API block scanner ----
    function scanApiBlocks(markdown, blocks, seenIds) {
        if (!M.parseApiBlocks) return;
        var apiBlocks = M.parseApiBlocks(markdown);
        for (var i = 0; i < apiBlocks.length; i++) {
            var ab = apiBlocks[i];
            var source = ab.prompt || ab.fullMatch;
            var id = makeBlockId('api', source);
            if (seenIds[id]) {
                id = id + '-' + Object.keys(seenIds).filter(function (k) { return k.startsWith(id.split('-')[0]); }).length;
            }
            seenIds[id] = true;

            blocks.push({
                id: id,
                type: 'api',
                lang: 'api',
                position: ab.start,
                source: source,
                runtimeKey: 'api',
                status: 'pending',
                result: null,
                _blockIndex: i,
                _fullMatch: ab.fullMatch
            });
        }
    }

    // ---- Linux block scanner ----
    function scanLinuxBlocks(markdown, blocks, seenIds) {
        if (!M.parseLinuxBlocks) return;
        var linuxBlocks = M.parseLinuxBlocks(markdown);
        for (var i = 0; i < linuxBlocks.length; i++) {
            var lb = linuxBlocks[i];
            var cfg = lb.linuxConfig;
            // Only include script/compile blocks, not terminal launch blocks
            if (!cfg || !cfg.language || !cfg.script) continue;

            var source = cfg.script;
            var id = makeBlockId('linux-' + cfg.language, source);
            if (seenIds[id]) {
                id = id + '-' + Object.keys(seenIds).filter(function (k) { return k.startsWith(id.split('-')[0]); }).length;
            }
            seenIds[id] = true;

            blocks.push({
                id: id,
                type: 'linux',
                lang: cfg.language,
                position: lb.start,
                source: source,
                runtimeKey: 'linux-script',
                status: 'pending',
                result: null,
                _blockIndex: i,
                _fullMatch: lb.fullMatch
            });
        }
    }

    // ========================================
    // Expose
    // ========================================

    M._execRegistry = {
        scanDocument: scanDocument,
        registerRuntime: registerRuntime,
        getRuntime: getRuntime,
        makeBlockId: makeBlockId,
        fnv1a: fnv1a
    };

    // Drain any adapters that were queued before this module loaded
    if (M._pendingRuntimeAdapters) {
        for (var i = 0; i < M._pendingRuntimeAdapters.length; i++) {
            var entry = M._pendingRuntimeAdapters[i];
            registerRuntime(entry.key, entry.adapter);
        }
        M._pendingRuntimeAdapters = null;
    }

})(window.MDView);
