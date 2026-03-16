// ============================================
// run-requirements.js — 6-Pass Run Requirements Compiler
// Performs preflight analysis of all executable blocks
// before Run All execution.
// ============================================
(function (M) {
    'use strict';

    // =========================================
    // Pass 1: SCAN — identify all executable blocks
    // =========================================
    function scanBlocks(markdown) {
        if (!M._execRegistry) return [];
        return M._execRegistry.scanDocument(markdown);
    }

    // =========================================
    // Pass 2: ENRICH — extract metadata from parsed blocks
    // (already done by exec-registry scanner with enriched metadata)
    // This pass normalizes and augments block descriptors.
    // =========================================
    function enrichBlocks(blocks) {
        // Assign sequential index for display
        for (var i = 0; i < blocks.length; i++) {
            blocks[i]._seqIndex = i + 1;

            // Normalize type display name
            var b = blocks[i];
            if (b.type === 'docgen') {
                b._displayType = capitalizeType(b.lang);
                // Mark Think blocks explicitly
                if (b.think || b.lang === 'think') {
                    b._displayType = 'AI (Think)';
                }
                if (b.lang === 'agent' && b.steps) {
                    b._displayType = 'Agent (' + b.steps.length + ' steps)';
                }
            } else if (b.type === 'code') {
                b._displayType = capitalizeType(b.lang);
            } else if (b.type === 'api') {
                b._displayType = 'API';
            } else if (b.type === 'linux') {
                b._displayType = 'Linux';
            } else {
                b._displayType = b.type || 'Unknown';
            }

            // Compute a human-readable label
            if (!b.blockLabel || b.blockLabel === b.lang) {
                b.blockLabel = b._displayType + ' #' + b._seqIndex;
            }
        }
        return blocks;
    }

    function capitalizeType(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // =========================================
    // Pass 3: RESOLVE — check adapter existence & effective model
    // =========================================
    function resolveBlocks(blocks) {
        var models = window.AI_MODELS || {};
        var currentModel = M.getCurrentAiModel ? M.getCurrentAiModel() : 'qwen-local';

        for (var i = 0; i < blocks.length; i++) {
            var b = blocks[i];

            // Check runtime adapter availability
            var hasRuntime = M._execRegistry && M._execRegistry.getRuntime(b.runtimeKey);
            b._hasAdapter = !!hasRuntime;

            // Determine support level
            if (!hasRuntime) {
                b._support = 'none';
            } else if (b.type === 'docgen' && (b.lang === 'stt')) {
                b._support = 'excluded'; // STT is interactive-only
            } else {
                b._support = 'full';
            }

            // Resolve effective model for docgen blocks
            if (b.type === 'docgen') {
                if (b.lang === 'tts') {
                    b._effectiveModel = 'kokoro-tts';
                } else if (b.lang === 'stt') {
                    b._effectiveModel = 'voxtral-stt';
                } else if (b.lang === 'ocr') {
                    b._effectiveModel = b.model || 'granite-docling';
                } else if (b.lang === 'image') {
                    b._effectiveModel = b.model || 'hf-sdxl';
                } else {
                    // For AI/Agent/Translate — need a text model, not TTS/OCR/STT/Image
                    var fallbackModel = currentModel;
                    // If current model is a specialized non-text model, fall back to qwen-local
                    var specializedModels = ['kokoro-tts', 'voxtral-stt', 'whisper-stt', 'granite-docling', 'florence-ocr', 'imagen-ultra', 'hf-sdxl', 'hf-flux'];
                    if (specializedModels.indexOf(fallbackModel) !== -1) {
                        fallbackModel = 'qwen-local';
                    }
                    b._effectiveModel = b.model || fallbackModel;
                }
            } else {
                b._effectiveModel = null; // code/api/linux don't use AI models
            }

            // Resolve model metadata
            if (b._effectiveModel && models[b._effectiveModel]) {
                var m = models[b._effectiveModel];
                b._modelLabel = m.label || b._effectiveModel;
                b._modelIsLocal = !!m.isLocal;
                b._modelSize = m.downloadSize || null;
            } else if (b._effectiveModel) {
                b._modelLabel = b._effectiveModel;
                b._modelIsLocal = false;
                b._modelSize = null;
            }

            // Detect features enabled
            b._features = [];
            if (b.search && b.search.length > 0) b._features.push('🔍 search');
            if (b.think) b._features.push('🧠 think');
            if (b.inputVars && b.inputVars.length > 0) b._features.push('📥 input');
            if (b.useMemory && b.useMemory.length > 0 && b.useMemory[0] !== 'none') b._features.push('📎 memory');
            if (b.targetLang) b._features.push('🌐 ' + b.targetLang);
            if (b.lang === 'tts') b._features.push('🔊 audio');
            if (b.lang === 'ocr') b._features.push('🔍 scan');
        }
        return blocks;
    }

    // =========================================
    // Pass 4: VALIDATE — check variable dependencies
    // =========================================
    function validateBlocks(blocks, markdown) {
        var errors = [];
        var warnings = [];
        var varGraph = {};      // varName → { producer: blockIndex, consumers: [] }

        // Gather all existing vars (manual, runtime, declared) from M._vars
        var knownVars = {};
        if (M._vars && M._vars.list) {
            var allVars = M._vars.list();
            Object.keys(allVars).forEach(function (k) {
                knownVars[k] = true;
            });
        }
        // Also parse the <!-- @variables --> block from the markdown directly
        var varBlockMatch = markdown.match(/<!--\s*@variables\s*-->\s*\n([\s\S]*?)<!--\s*@\/variables\s*-->/);
        if (varBlockMatch) {
            var rows = varBlockMatch[1].trim().split('\n');
            for (var vi = 0; vi < rows.length; vi++) {
                var row = rows[vi].trim();
                if (!row.startsWith('|')) continue;
                if (row.indexOf('Variable') !== -1 && row.indexOf('Value') !== -1) continue;
                if (/^\|[\s\-|]+\|$/.test(row)) continue;
                var cells = row.split('|').map(function (c) { return c.trim(); }).filter(function (c) { return c !== ''; });
                if (cells.length >= 2 && cells[0] && !/^-+$/.test(cells[0])) {
                    knownVars[cells[0]] = true;
                }
            }
        }

        // Global auto-vars that are always available
        var globalVars = { date: 1, time: 1, year: 1, month: 1, day: 1, timestamp: 1, uuid: 1 };

        // Build producer map
        for (var i = 0; i < blocks.length; i++) {
            var b = blocks[i];
            if (b.varName) {
                if (varGraph[b.varName]) {
                    warnings.push({
                        type: 'shadow',
                        blockIndex: i,
                        varName: b.varName,
                        message: 'Variable $(' + b.varName + ') is produced by both Block #'
                            + varGraph[b.varName].producer + ' and Block #' + (i + 1)
                            + ' — later value will shadow earlier one.'
                    });
                }
                varGraph[b.varName] = { producer: i + 1, consumers: [] };
            }
        }

        // Check consumers
        for (var j = 0; j < blocks.length; j++) {
            var b2 = blocks[j];
            var explicitInputs = (b2.inputVars || []).slice(); // from @input — explicit deps
            var implicitRefs = []; // from $(varName) in source — template vars

            // Scan $(varName) references in source text
            var srcVarRe = /\$\(([^)]+)\)/g;
            var srcMatch;
            while ((srcMatch = srcVarRe.exec(b2.source || '')) !== null) {
                var refName = srcMatch[1];
                if (explicitInputs.indexOf(refName) === -1 && implicitRefs.indexOf(refName) === -1) {
                    implicitRefs.push(refName);
                }
            }

            var allReads = explicitInputs.concat(implicitRefs);

            for (var r = 0; r < allReads.length; r++) {
                var varName = allReads[r];
                if (varName === 'none') continue;
                if (globalVars[varName]) continue;
                if (knownVars[varName]) continue;

                // Try runtime resolution — M._vars.get() checks all layers
                if (M._vars && M._vars.get && M._vars.get(varName) !== null) {
                    knownVars[varName] = true;
                    continue;
                }

                var isExplicit = explicitInputs.indexOf(varName) !== -1;

                if (!varGraph[varName]) {
                    // No block produces this var — it may come from manual/document variables
                    warnings.push({
                        type: isExplicit ? 'missing_input_producer' : 'unresolved_template_var',
                        blockIndex: j,
                        varName: varName,
                        message: isExplicit
                            ? 'Block #' + (j + 1) + ' uses @input: ' + varName + ' — ensure $(' + varName + ') is defined before running.'
                            : '$(' + varName + ') in Block #' + (j + 1) + ' — ensure this variable is defined before running.'
                    });
                } else {
                    varGraph[varName].consumers.push(j + 1);
                    if (varGraph[varName].producer > j + 1) {
                        errors.push({
                            type: 'out_of_order',
                            blockIndex: j,
                            varName: varName,
                            message: 'Block #' + (j + 1) + ' reads $(' + varName + ') before Block #'
                                + varGraph[varName].producer + ' produces it.'
                        });
                    }
                }
            }

            b2._reads = allReads.filter(function (v) { return v !== 'none'; });
        }

        // Check for blocks without adapters
        for (var k = 0; k < blocks.length; k++) {
            if (!blocks[k]._hasAdapter) {
                errors.push({
                    type: 'no_adapter',
                    blockIndex: k,
                    message: 'Block #' + (k + 1) + ' (' + blocks[k]._displayType
                        + ') has no runtime adapter — will be skipped.'
                });
            }
        }

        return { errors: errors, warnings: warnings, varGraph: varGraph };
    }

    // =========================================
    // Pass 5: MODEL PLAN — check cache status
    // =========================================
    function planModels(blocks) {
        var models = window.AI_MODELS || {};
        var neededModels = {};

        for (var i = 0; i < blocks.length; i++) {
            var b = blocks[i];
            if (!b._effectiveModel || !b._hasAdapter) continue;
            if (!neededModels[b._effectiveModel]) {
                neededModels[b._effectiveModel] = {
                    id: b._effectiveModel,
                    label: b._modelLabel || b._effectiveModel,
                    isLocal: b._modelIsLocal,
                    size: b._modelSize,
                    usedBy: [],
                    cached: false,
                    keySet: false
                };
            }
            neededModels[b._effectiveModel].usedBy.push(i + 1);
        }

        // Check cache/key status
        Object.keys(neededModels).forEach(function (modelId) {
            var m = neededModels[modelId];
            var cfg = models[modelId];
            if (!cfg) return;

            if (cfg.isLocal) {
                // Check if model has been downloaded (consent key exists)
                var consentKeyPrefix = (M.KEYS && M.KEYS.AI_CONSENTED_PREFIX) || 'ai-consented-';
                var consentKey = consentKeyPrefix + modelId;
                m.cached = !!localStorage.getItem(consentKey);
                // Special case for legacy qwen-local key
                if (modelId === 'qwen-local' && !m.cached) {
                    m.cached = !!localStorage.getItem('ai-model-consented');
                }
                m.keySet = true; // local models don't need keys
            } else if (cfg.keyStorageKey) {
                // Cloud model — check for API key
                m.keySet = !!localStorage.getItem(cfg.keyStorageKey);
                m.cached = true; // cloud models don't need downloads
            }
        });

        return neededModels;
    }

    // =========================================
    // Pass 6: SUMMARIZE — generate execution summary
    // =========================================
    function summarize(blocks, validation, modelPlan) {
        var total = blocks.length;
        var runnable = 0;
        var skipped = 0;
        var excluded = 0;
        var needsDownload = [];
        var needsKey = [];

        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i]._support === 'none') skipped++;
            else if (blocks[i]._support === 'excluded') excluded++;
            else runnable++;
        }

        Object.keys(modelPlan).forEach(function (id) {
            var m = modelPlan[id];
            if (m.isLocal && !m.cached) needsDownload.push(m);
            if (!m.isLocal && !m.keySet) needsKey.push(m);
        });

        return {
            total: total,
            runnable: runnable,
            skipped: skipped,
            excluded: excluded,
            hasErrors: validation.errors.length > 0,
            hasWarnings: validation.warnings.length > 0,
            needsDownload: needsDownload,
            needsKey: needsKey,
            canRunAll: runnable > 0 && needsDownload.length === 0 && needsKey.length === 0
        };
    }

    // =========================================
    // Main: compileRequirements()
    // =========================================
    function compileRequirements(markdown) {
        if (!markdown) markdown = M.markdownEditor ? M.markdownEditor.value : '';

        // Pass 1: Scan
        var blocks = scanBlocks(markdown);

        // Pass 2: Enrich
        enrichBlocks(blocks);

        // Pass 3: Resolve
        resolveBlocks(blocks);

        // Pass 4: Validate
        var validation = validateBlocks(blocks, markdown);

        // Pass 5: Model plan
        var modelPlan = planModels(blocks);

        // Pass 6: Summarize
        var summary = summarize(blocks, validation, modelPlan);

        return {
            blocks: blocks,
            vars: validation.varGraph,
            errors: validation.errors,
            warnings: validation.warnings,
            models: modelPlan,
            summary: summary
        };
    }

    // Expose on M
    M.compileRequirements = compileRequirements;

    console.log('📋 run-requirements.js loaded');

})(window.MDView);
