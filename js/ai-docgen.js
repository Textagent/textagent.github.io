// ============================================
// ai-docgen.js — AI Document Generator (Tag-Based)
// Insert {{AI: ...}} / {{Think: ...}} markers, render preview cards,
// generate with REVIEW step — user must Accept/Reject/Regenerate
// ============================================
(function (M) {
    'use strict';

    // --- State ---
    var activeBlockOps = new Set(); // Track which block indices are currently generating
    var abortRequested = false;
    var pendingReview = null;      // { blockIndex, result, block, resolve, reject }
    var fillAllQueue = null;       // { remaining, filled, total, prevSections }
    var blockUploads = new Map();  // blockIndex → [{ data: base64, mimeType, name }]  (image attachments)
    var MAX_UPLOADS_PER_BLOCK = 3;

    // ==============================================
    // PDF → IMAGE RENDERER — for OCR on PDF files
    // Uses pdf.js to render each page to a canvas image
    // ==============================================
    async function renderPdfToImages(file, blockIdx, existingCount) {
        // Load pdf.js
        var pdfjsLib = window.pdfjsLib;
        if (!pdfjsLib) {
            try {
                var mod = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
                pdfjsLib = mod;
            } catch (e) {
                throw new Error('PDF.js could not be loaded. PDF import requires a modern browser.');
            }
        }
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
        }

        var arrayBuffer = await file.arrayBuffer();
        var pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        var pageNames = [];
        var maxPages = Math.min(pdf.numPages, MAX_UPLOADS_PER_BLOCK - existingCount);
        if (maxPages <= 0) return pageNames;

        if (pdf.numPages > maxPages) {
            M.showToast('📄 PDF has ' + pdf.numPages + ' pages — processing first ' + maxPages, 'info');
        }

        for (var i = 1; i <= maxPages; i++) {
            var page = await pdf.getPage(i);
            // Render at 2x scale for better OCR accuracy
            var viewport = page.getViewport({ scale: 2.0 });
            var canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            var ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;

            // Extract as PNG base64
            var dataUrl = canvas.toDataURL('image/png');
            var base64 = dataUrl.split(',')[1];
            var pageName = file.name + ' (page ' + i + ')';

            if (!blockUploads.has(blockIdx)) blockUploads.set(blockIdx, []);
            blockUploads.get(blockIdx).push({ data: base64, mimeType: 'image/png', name: pageName });
            pageNames.push(pageName);
        }

        return pageNames;
    }


    // ==============================================
    // TAGGING — wrap selection with {{AI:}}, {{Image:}}, etc.
    // ==============================================
    function insertDocgenTag(type) {
        if (type === 'Agent') {
            var agentDefaultModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : '') || '';
            M.wrapSelectionWith('{{@Agent:\n  @model: ' + (agentDefaultModel || 'qwen-local') + '\n  @cloud: no\n  @step 1: ', '\n  @step 2: describe the next step\n}}', 'describe this step');
            return;
        }
        if (type === 'Memory') {
            // Auto-generate unique Memory ID, avoiding duplicates in the document
            var editorText = M.markdownEditor ? M.markdownEditor.value : '';
            var existingNames = [];
            var nameRe = /\{\{Memory:[^}]*@name:\s*([^\s}]+)/gi;
            var nm;
            while ((nm = nameRe.exec(editorText)) !== null) {
                existingNames.push(nm[1].replace(/[,}]/g, '').trim().toLowerCase());
            }
            var memId;
            do {
                memId = 'mem-' + Math.random().toString(36).substring(2, 7);
            } while (existingNames.indexOf(memId) !== -1);
            M.wrapSelectionWith('{{@Memory:\n  @name: ', '\n}}', memId);
            return;
        }
        if (type === 'OCR') {
            M.wrapSelectionWith('{{@OCR:\n  @model: granite-docling\n  @mode: text\n  @prompt: ', '\n}}', 'describe what to extract from the image');
            return;
        }
        if (type === 'Translate') {
            var trDefaultModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : '') || '';
            M.wrapSelectionWith('{{@Translate:\n  @model: ' + (trDefaultModel || 'gemini-flash') + '\n  @prompt: ', '\n  @lang: Japanese\n}}', 'text to translate');
            return;
        }
        if (type === 'TTS') {
            M.wrapSelectionWith('{{@TTS:\n  @model: kokoro-tts\n  @prompt: ', '\n  @lang: English\n}}', 'text to speak aloud');
            return;
        }
        if (type === 'STT') {
            M.wrapSelectionWith('{{@STT:\n  @model: voxtral-stt\n  @lang: ', '\n}}', 'en-US');
            return;
        }

        var placeholder = type === 'Image'
            ? 'describe the image to generate'
            : 'describe what to generate';
        if (type === 'AI') {
            var aiDefaultModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : '') || '';
            M.wrapSelectionWith('{{@AI:\n  @model: ' + (aiDefaultModel || 'qwen-local') + '\n  @prompt: ', '\n}}', placeholder);
        } else if (type === 'Image') {
            M.wrapSelectionWith('{{@Image:\n  @model: hf-sdxl\n  @prompt: ', '\n}}', placeholder);
        } else {
            M.wrapSelectionWith('{{@' + type + ': ', '}}', placeholder);
        }
    }

    // ==============================================
    // PARSING — find all tagged blocks in markdown
    // ==============================================

    function getFencedRanges(text) {
        var ranges = [];
        var match;
        // Fenced code blocks (``` or ~~~)
        var re = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1\s*$/gm;
        while ((match = re.exec(text)) !== null) {
            ranges.push({ start: match.index, end: match.index + match[0].length });
        }
        // Inline code spans (`...`)
        var inlineRe = /`([^`\n]+)`/g;
        while ((match = inlineRe.exec(text)) !== null) {
            ranges.push({ start: match.index, end: match.index + match[0].length });
        }
        return ranges;
    }

    function isInsideFence(pos, fencedRanges) {
        for (var i = 0; i < fencedRanges.length; i++) {
            if (pos >= fencedRanges[i].start && pos < fencedRanges[i].end) return true;
        }
        return false;
    }

    function parseDocgenBlocks(markdown) {
        var blocks = [];
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?(AI|Image|Agent|Memory|OCR|Translate|TTS|STT):\s*([\s\S]*?)\}\}/g;
        var match;
        while ((match = re.exec(markdown)) !== null) {
            if (!isInsideFence(match.index, fencedRanges)) {
                var block = {
                    type: match[1],
                    prompt: match[2].trim(),
                    start: match.index,
                    end: match.index + match[0].length,
                    fullMatch: match[0]
                };
                // Parse Agent steps
                if (block.type === 'Agent') {
                    block.steps = parseAgentSteps(block.prompt);
                }

                // Parse @mode: field for OCR blocks
                if (block.type === 'OCR') {
                    var modeMatch = block.prompt.match(/^\s*(?:@mode|Mode):\s*(text|svg)$/mi);
                    block.ocrMode = modeMatch ? modeMatch[1].toLowerCase() : 'text';
                    block.prompt = block.prompt.replace(/^\s*(?:@mode|Mode):\s*\S+$/mi, '').trim();
                }
                // Parse @lang: field for Translate blocks
                if (block.type === 'Translate' || block.type === 'TTS') {
                    var langMatch = block.prompt.match(/^\s*(?:@lang|Lang):\s*(.+)$/mi);
                    block.targetLang = langMatch ? langMatch[1].trim() : (block.type === 'TTS' ? 'English' : 'Japanese');
                    block.prompt = block.prompt.replace(/^\s*(?:@lang|Lang):\s*.+$/mi, '').trim();
                }
                // Parse @model: field — persists the selected model for this block
                var modelMatch = block.prompt.match(/^\s*(?:@model|Model):\s*(\S+)$/mi);
                if (modelMatch) {
                    var modelVal = modelMatch[1].trim();
                    // Only keep if the model exists in the registry
                    if (window.AI_MODELS && window.AI_MODELS[modelVal]) {
                        block.model = modelVal;
                    }
                    block.prompt = block.prompt.replace(modelMatch[0], '').trim();
                }
                // Parse @var: field — allows blocks to store output into a named variable
                var varMatch = block.prompt.match(/^\s*(?:@var|Var):\s*(\S+)$/mi);
                if (varMatch) {
                    block.varName = varMatch[1].trim();
                    block.prompt = block.prompt.replace(varMatch[0], '').trim();
                }
                // Parse @use, @think, @search, @prompt fields
                if (block.type !== 'Image' && block.type !== 'Memory') {
                    var useMatch = block.prompt.match(/^\s*(?:@use|Use):\s*(.+)$/m);
                    if (useMatch) {
                        block.useMemory = useMatch[1].split(',').map(function (s) { return s.trim(); });
                        block.prompt = block.prompt.replace(useMatch[0], '').trim();
                    }
                    // Parse @think: yes/no field
                    var thinkMatch = block.prompt.match(/^\s*(?:@think|Think):\s*(yes|no)$/mi);
                    if (thinkMatch) {
                        block.think = thinkMatch[1].toLowerCase() === 'yes';
                        block.prompt = block.prompt.replace(thinkMatch[0], '').trim();
                    } else if (block.think === undefined) {
                        block.think = false;
                    }
                    // Parse @cloud: yes/no field — route step execution to cloud compute
                    var cloudMatch = block.prompt.match(/^\s*(?:@cloud|Cloud):\s*(yes|no)$/mi);
                    if (cloudMatch) {
                        block.cloud = cloudMatch[1].toLowerCase() === 'yes';
                        block.prompt = block.prompt.replace(cloudMatch[0], '').trim();
                    } else if (block.cloud === undefined) {
                        block.cloud = false;
                    }
                    // Parse @agenttype: field — which external agent to run (e.g. openclaw, openfang)
                    var agentTypeMatch = block.prompt.match(/^\s*(?:@agenttype|agenttype):\s*(\S+)$/mi);
                    if (agentTypeMatch) {
                        block.agentType = agentTypeMatch[1].trim().toLowerCase();
                        block.prompt = block.prompt.replace(agentTypeMatch[0], '').trim();
                    }
                    // Parse @search: field (supports comma-separated multi-provider)
                    var searchMatch = block.prompt.match(/^\s*(?:@search|Search):\s*(.+)$/mi);
                    if (searchMatch) {
                        block.searchProviders = searchMatch[1].split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
                        block.prompt = block.prompt.replace(searchMatch[0], '').trim();
                    }
                    // Parse @input: field — selects which Doc Vars to inject from M._vars
                    var inputMatch = block.prompt.match(/^\s*(?:@input|Input):\s*(.+)$/mi);
                    if (inputMatch) {
                        block.inputVars = inputMatch[1].split(',').map(function (s) { return s.trim(); });
                        block.prompt = block.prompt.replace(inputMatch[0], '').trim();
                    }
                    // Separate description (bare text) from @prompt: (actual AI instruction)
                    var promptMatch = block.prompt.match(/^\s*(?:@prompt|Prompt):\s*(.*)$/m);
                    if (promptMatch) {
                        // Extract @prompt: value as the real prompt
                        var realPrompt = promptMatch[1].trim();
                        // Everything else (minus metadata fields) is description
                        var desc = block.prompt.replace(promptMatch[0], '').trim();
                        // Strip @step lines from description
                        desc = desc.replace(/^\s*(?:@step|Step)\s*\d+\s*:.+$/gmi, '').trim();
                        block.description = desc;
                        block.prompt = realPrompt;
                        block.hasPromptField = true;
                    } else {
                        block.description = '';
                        block.hasPromptField = false;
                    }
                }
                // Parse @upload: fields (works for AI, Image, Agent)
                if (block.type !== 'Memory') {
                    block.uploads = [];
                    var uploadRe = /^\s*@upload:\s*(.+)$/gmi;
                    var um;
                    while ((um = uploadRe.exec(block.prompt)) !== null) {
                        block.uploads.push(um[1].trim());
                    }
                    // Strip all @upload lines from prompt
                    block.prompt = block.prompt.replace(/^\s*@upload:\s*.+$/gmi, '').trim();
                }
                // Parse Memory block fields
                if (block.type === 'Memory') {
                    var nameMatch = block.prompt.match(/^(?:@name|Name):\s*(.+)$/m);
                    block.memoryName = nameMatch ? nameMatch[1].trim() : 'default';
                }

                blocks.push(block);
            }
        }
        return blocks;
    }

    // Parse "Step N: description" lines from an Agent block prompt
    function parseAgentSteps(prompt) {
        var steps = [];
        var lines = prompt.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            var stepMatch = line.match(/^(?:@step|Step)\s*(\d+)\s*:\s*(.+)/i);
            if (stepMatch) {
                steps.push({
                    number: parseInt(stepMatch[1], 10),
                    description: stepMatch[2].trim()
                });
            }
        }
        // If no "Step N:" pattern found, treat each non-empty line as a step
        if (steps.length === 0) {
            var num = 1;
            for (var j = 0; j < lines.length; j++) {
                var l = lines[j].trim();
                if (l) {
                    steps.push({ number: num++, description: l });
                }
            }
        }
        return steps;
    }



    // ==============================================
    // PREVIEW — transform markers into placeholder HTML
    // ==============================================

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    // Deduplicate Memory tag names in-place in the editor text
    var _dedupInProgress = false;
    function deduplicateMemoryNames(markdown) {
        if (_dedupInProgress) return markdown;
        var fenced = getFencedRanges(markdown);
        var tagRe = /\{\{@?Memory:\s*([\s\S]*?)\}\}/g;
        var nameRe = /^(?:@name|Name):\s*(.+)$/m;
        var seen = {};
        var replacements = []; // { start, end, oldName, newName }
        var m;

        while ((m = tagRe.exec(markdown)) !== null) {
            if (isInsideFence(m.index, fenced)) continue;
            var body = m[1];
            var nm = body.match(nameRe);
            if (!nm) continue;
            var rawName = nm[1].trim();
            var lc = rawName.toLowerCase();

            if (seen[lc]) {
                seen[lc]++;
                var newName = rawName + '-' + seen[lc];
                // Calculate position of name within the full match
                var nameStart = m.index + m[0].indexOf(nm[0]) + nm[0].indexOf(nm[1]);
                replacements.push({
                    start: nameStart,
                    end: nameStart + nm[1].length,
                    oldName: nm[1],
                    newName: newName
                });
            } else {
                seen[lc] = 1;
            }
        }

        if (replacements.length === 0) return markdown;

        // Apply replacements in reverse order to preserve positions
        var updated = markdown;
        for (var i = replacements.length - 1; i >= 0; i--) {
            var r = replacements[i];
            updated = updated.substring(0, r.start) + r.newName + updated.substring(r.end);
        }

        // Update editor text (debounced to avoid re-trigger)
        if (M.markdownEditor && M.markdownEditor.value === markdown) {
            _dedupInProgress = true;
            var sel = { start: M.markdownEditor.selectionStart, end: M.markdownEditor.selectionEnd };
            M.markdownEditor.value = updated;
            M.markdownEditor.selectionStart = sel.start;
            M.markdownEditor.selectionEnd = sel.end;
            setTimeout(function () { _dedupInProgress = false; }, 100);
        }

        return updated;
    }

    function transformDocgenMarkdown(markdown) {
        // Auto-rename duplicate Memory names in editor + input
        markdown = deduplicateMemoryNames(markdown);
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?(AI|Image|Agent|Memory|OCR|Translate|TTS|STT):\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        // Build model options for per-card selector
        var models = window.AI_MODELS || {};
        var modelIds = Object.keys(models);
        var currentModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : modelIds[0]) || modelIds[0];

        // Build model dropdown HTML with a specific model pre-selected
        // Shows ALL models in the registry; selectedModelId controls which is pre-selected
        function buildModelOptionsHtml(selectedModelId, cardType) {
            var textOpts = '';
            var imageOpts = '';
            var allOpts = '';
            var selId = selectedModelId || currentModel;
            modelIds.forEach(function (id) {
                var m = models[id];
                var name = m.dropdownName || m.label || id;
                var sel = id === selId ? ' selected' : '';
                if (m.isImageModel) {
                    imageOpts += '<option value="' + id + '"' + sel + '>' + name + '</option>';
                } else if (!m.isTtsModel && !m.isSttModel) {
                    textOpts += '<option value="' + id + '"' + sel + '>' + name + '</option>';
                }
                // Build a combined list for TTS/STT cards that shows all models
                allOpts += '<option value="' + id + '"' + sel + '>' + name + '</option>';
            });
            if (cardType === 'Image') {
                return imageOpts + (textOpts ? '<option disabled>──── Vision ────</option>' + textOpts : '');
            }
            return textOpts;
        }

        // Build multi-select search provider pills HTML for a card
        var SEARCH_PILL_CONFIG = [
            { id: 'duckduckgo', icon: '🦆', label: 'DDG', title: 'DuckDuckGo · Free · No API key' },
            { id: 'brave', icon: '🦁', label: 'Brave', title: 'Brave Search · 2,000/month free', hasKey: true },
            { id: 'serper', icon: '🔎', label: 'Serper', title: 'Serper.dev · 2,500 queries free', hasKey: true },
            { id: 'tavily', icon: '🤖', label: 'Tavily', title: 'Tavily · AI-optimized · 1,000/month free', hasKey: true },
            { id: 'google_cse', icon: '🔍', label: 'Google', title: 'Google CSE · 100/day free', hasKey: true },
            { id: 'wikipedia', icon: '📖', label: 'Wiki', title: 'Wikipedia · Free encyclopedia' },
            { id: 'wikidata', icon: '📊', label: 'Wikidata', title: 'Wikidata · Free structured data' },
        ];

        function buildSearchPillsHtml(blockIndex, activeProviders) {
            var html = '<div class="ai-search-pills-panel" data-ai-index="' + blockIndex + '" style="display:none">'
                + '<div class="ai-search-pills-row">';
            SEARCH_PILL_CONFIG.forEach(function (p) {
                var isActive = activeProviders.indexOf(p.id) !== -1;
                html += '<label class="ai-card-search-pill' + (isActive ? ' active' : '') + '" data-provider="' + p.id + '" title="' + p.title + '">'
                    + '<input type="checkbox" class="ai-card-search-check" value="' + p.id + '" data-ai-index="' + blockIndex + '"' + (isActive ? ' checked' : '') + '>'
                    + '<span class="ai-card-search-pill-label">' + p.icon + ' ' + p.label + '</span>'
                    + '</label>';
            });
            html += '</div></div>';
            return html;
        }

        var seenMemoryNames = {}; // Track used Memory names for dedup

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);

            var type = match[1];
            var prompt = match[2].trim();
            var thinkFieldMatch = prompt.match(/^(?:@think|Think):\s*(yes|no)$/mi);
            var hasThink = thinkFieldMatch ? thinkFieldMatch[1].toLowerCase() === 'yes' : false;
            var cloudFieldMatch = prompt.match(/^(?:@cloud|Cloud):\s*(yes|no)$/mi);
            var hasCloud = cloudFieldMatch ? cloudFieldMatch[1].toLowerCase() === 'yes' : false;
            var agentTypeMatch = prompt.match(/^(?:@agenttype|agenttype):\s*(\S+)$/mi);
            var agentTypeName = agentTypeMatch ? agentTypeMatch[1].trim() : '';
            var icon = type === 'STT' ? '🎤' : type === 'TTS' ? '🔊' : type === 'Translate' ? '🌐' : type === 'OCR' ? '🔍' : type === 'Image' ? '🖼️' : type === 'Agent' ? '🔗' : type === 'Memory' ? '📚' : '✨';
            var label = type === 'STT' ? 'Speech to Text' : type === 'TTS' ? 'Text to Speech' : type === 'Translate' ? 'Translate' : type === 'OCR' ? 'OCR Scan' : type === 'Image' ? 'Image Generate' : type === 'Agent' ? 'Agent Flow' : type === 'Memory' ? 'Memory' : 'AI Generate';
            var agentTypeBadge = (type === 'Agent' && agentTypeName) ? '<span class="ai-agenttype-badge" title="External agent: ' + escapeHtml(agentTypeName) + '">' + escapeHtml(agentTypeName) + '</span>' : '';
            var cloudBadge = (type === 'Agent') ? '<span class="ai-cloud-badge' + (hasCloud ? ' cloud-enabled' : ' cloud-disabled') + '" title="' + (hasCloud ? 'Runs on GitHub Codespaces' : 'Runs locally via Docker') + '">' + (hasCloud ? '☁️ Cloud' : '🖥️ Local') + '</span>' : '';

            // Parse @model: from the raw prompt to determine which model to pre-select
            var blockModelMatch = prompt.match(/^\s*(?:@model|Model):\s*(\S+)$/mi);
            var blockModelId = blockModelMatch ? blockModelMatch[1].trim() : null;
            // Validate against registry — only use if the model exists
            if (blockModelId && !(models[blockModelId])) blockModelId = null;
            // Strip @model: from display prompt
            prompt = prompt.replace(/^\s*(?:@model|Model):\s*\S+$/mi, '').trim();
            // Strip @cloud: and @agenttype: from display prompt (shown via toggle/badge instead)
            prompt = prompt.replace(/^\s*(?:@cloud|Cloud):\s*(?:yes|no)$/mi, '').trim();
            prompt = prompt.replace(/^\s*(?:@agenttype|agenttype):\s*\S+$/mi, '').trim();
            var cardModelOpts = buildModelOptionsHtml(blockModelId, type);

            if (type === 'Memory') {
                // Parse Memory fields
                var nameMatch = prompt.match(/^@name:\s*(.+)$/m);
                var rawName = nameMatch ? nameMatch[1].trim() : '';
                // Auto-generate ID if no name provided
                if (!rawName) rawName = 'mem-' + Math.random().toString(36).substring(2, 7);
                var memoryName = rawName;
                var isDuplicate = false;

                // Deduplicate: if name already used, auto-suffix
                if (seenMemoryNames[memoryName.toLowerCase()]) {
                    var count = seenMemoryNames[memoryName.toLowerCase()] + 1;
                    seenMemoryNames[memoryName.toLowerCase()] = count;
                    memoryName = rawName + '-' + count;
                    isDuplicate = true;
                } else {
                    seenMemoryNames[memoryName.toLowerCase()] = 1;
                }

                var escapedName = escapeHtml(memoryName);
                var dupWarning = isDuplicate ? ' <small style="color:#ef4444">⚠ renamed</small>' : '';

                result += '<div class="ai-placeholder-card" data-ai-type="Memory" data-ai-index="' + blockIndex + '" data-memory-name="' + escapedName + '">'
                    + '<div class="ai-placeholder-header">'
                    + '<span class="ai-placeholder-icon">' + icon + '</span>'
                    + '<span class="ai-placeholder-label">Memory: ' + escapedName + dupWarning + '</span>'
                    + '<div class="ai-placeholder-actions">'
                    + '<button class="ai-placeholder-btn ai-memory-attach-folder" data-memory-name="' + escapedName + '" title="Attach folder">📂 Folder</button>'
                    + '<button class="ai-placeholder-btn ai-memory-attach-files" data-memory-name="' + escapedName + '" title="Attach files">📄 Files</button>'
                    + '<button class="ai-placeholder-btn ai-memory-rebuild" data-memory-name="' + escapedName + '" title="Rebuild index">🔄</button>'
                    + '<button class="ai-placeholder-btn ai-remove-tag" data-ai-index="' + blockIndex + '" title="Remove tag">✕</button>'
                    + '</div></div>'
                    + '<div class="ai-memory-stats" data-memory-name="' + escapedName + '">No files attached</div>'
                    + '</div>';
            } else if (type === 'OCR') {
                // OCR card — specialized for image-to-text / image-to-SVG
                var ocrModeMatch = prompt.match(/^\s*(?:@mode|Mode):\s*(text|svg)$/mi);
                var ocrMode = ocrModeMatch ? ocrModeMatch[1].toLowerCase() : 'text';
                var ocrDisplayText = prompt.replace(/^\s*(?:@mode|Mode):\s*\S+$/mi, '').trim();
                // Strip metadata fields from display
                ocrDisplayText = ocrDisplayText.replace(/^\s*(?:@think|Think):\s*(yes|no)$/mi, '').trim();
                ocrDisplayText = ocrDisplayText.replace(/^\s*(?:@search|Search):\s*\S+$/mi, '').trim();
                ocrDisplayText = ocrDisplayText.replace(/^\s*@upload:\s*.+$/gmi, '').trim();
                ocrDisplayText = ocrDisplayText.replace(/^\s*(?:@model|Model):\s*\S+$/mi, '').trim();

                // Separate description from @prompt:
                var ocrHasPromptField = /^\s*(?:@prompt|Prompt):\s*/m.test(ocrDisplayText);
                var ocrPromptMatch = ocrDisplayText.match(/^\s*(?:@prompt|Prompt):\s*(.*)$/m);
                var ocrPromptValue = ocrPromptMatch ? ocrPromptMatch[1].trim() : '';
                var ocrDescText = ocrHasPromptField
                    ? ocrDisplayText.replace(ocrPromptMatch[0], '').trim()
                    : ocrDisplayText;

                // Build upload thumbnail strip
                var ocrUploadThumbs = '';
                var ocrExistingUploads = blockUploads.get(blockIndex);
                if (ocrExistingUploads && ocrExistingUploads.length > 0) {
                    ocrUploadThumbs = '<div class="ai-card-uploads" data-ai-index="' + blockIndex + '">';
                    ocrExistingUploads.forEach(function (u, ui) {
                        ocrUploadThumbs += '<div class="ai-card-upload-thumb"><img src="data:' + u.mimeType + ';base64,' + u.data + '" alt="' + escapeHtml(u.name) + '">'
                            + '<button class="ai-card-upload-remove" data-ai-index="' + blockIndex + '" data-upload-index="' + ui + '" title="Remove">✕</button></div>';
                    });
                    ocrUploadThumbs += '</div>';
                }

                // Mode pills (Text / SVG toggle)
                var modePillsHtml = '<div class="ai-ocr-mode-pills" data-ai-index="' + blockIndex + '">'
                    + '<button class="ai-ocr-mode-pill' + (ocrMode === 'text' ? ' active' : '') + '" data-mode="text" data-ai-index="' + blockIndex + '" title="Extract text as Markdown">📝 Text</button>'
                    + '<button class="ai-ocr-mode-pill' + (ocrMode === 'svg' ? ' active' : '') + '" data-mode="svg" data-ai-index="' + blockIndex + '" title="Convert diagram/chart to SVG">🎨 SVG</button>'
                    + '</div>';

                result += '<div class="ai-placeholder-card ai-ocr-card" data-ai-type="OCR" data-ai-index="' + blockIndex + '" data-ocr-mode="' + ocrMode + '">'
                    + '<div class="ai-placeholder-header">'
                    + '<span class="ai-placeholder-icon">' + icon + '</span>'
                    + '<span class="ai-placeholder-label">' + label + '</span>'
                    + '<div class="ai-placeholder-actions">'
                    + '<button class="ai-placeholder-btn ai-upload-btn" data-ai-index="' + blockIndex + '" title="Upload image or PDF for OCR">📎</button>'
                    + '<select class="ai-card-model-select" data-ai-index="' + blockIndex + '" title="Model for OCR">'
                    + cardModelOpts + '</select>'
                    + '<button class="ai-placeholder-btn ai-fill-one" data-ai-index="' + blockIndex + '" title="Run OCR scan">▶</button>'
                    + '<button class="ai-placeholder-btn ai-remove-tag" data-ai-index="' + blockIndex + '" title="Remove tag">✕</button>'
                    + '</div></div>'
                    + modePillsHtml
                    + ocrUploadThumbs
                    + (ocrDescText ? '<div class="ai-placeholder-prompt ai-placeholder-prompt-static">' + escapeHtml(ocrDescText) + '</div>' : '')
                    + (ocrHasPromptField
                        ? '<div class="ai-placeholder-prompt"><textarea class="ai-card-prompt-input" data-ai-index="' + blockIndex + '" placeholder="Optional: describe what to extract…" rows="2">' + escapeHtml(ocrPromptValue) + '</textarea></div>'
                        : '')
                    + '</div>';
            } else if (type === 'Agent') {
                // Render pipeline card for Agent blocks
                var steps = parseAgentSteps(prompt);
                var stepsHtml = '';
                for (var s = 0; s < steps.length; s++) {
                    stepsHtml += '<div class="ai-agent-step" data-step="' + steps[s].number + '">'
                        + '<span class="ai-agent-step-num">&#9312;</span>'.replace('&#9312;', '\u2460'.codePointAt(0) <= 9471 ? String.fromCodePoint(0x245F + steps[s].number) : steps[s].number + '.')
                        + '<input class="ai-agent-step-input" data-ai-index="' + blockIndex + '" data-step-num="' + steps[s].number + '" value="' + escapeHtml(steps[s].description) + '" placeholder="Step description…">'
                        + '<span class="ai-agent-step-status">⏸</span>'
                        + '</div>';
                    if (s < steps.length - 1) {
                        stepsHtml += '<div class="ai-agent-step-arrow">↓</div>';
                    }
                }

                // @use: hint for Agent
                var agentUseMatch = prompt.match(/^\s*(?:@use|Use):\s*(.+)$/m);
                var agentUseHint = agentUseMatch ? '<span class="ai-use-hint">📚 ' + escapeHtml(agentUseMatch[1]) + '</span>' : '';

                // Parse @search field for Agent (comma-separated multi-provider)
                var agentSearchMatch = prompt.match(/^\s*(?:@search|Search):\s*(.+)$/mi);
                var agentActiveSearch = agentSearchMatch
                    ? agentSearchMatch[1].split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean)
                    : [];
                var agentSearchPillsHtml = buildSearchPillsHtml(blockIndex, agentActiveSearch);

                // Parse @var: field for Agent card
                var agentVarMatch = prompt.match(/^\s*(?:@var|Var):\s*(\S+)$/mi);
                var agentVarName = agentVarMatch ? agentVarMatch[1].trim() : '';

                // Parse @input: field for Agent card
                var agentInputMatch = prompt.match(/^\s*(?:@input|Input):\s*(.+)$/mi);
                var agentActiveInputs = agentInputMatch
                    ? agentInputMatch[1].split(',').map(function (s) { return s.trim(); }).filter(Boolean)
                    : [];

                // Build upload thumbnail strip for Agent card
                var agentUploadThumbs = '';
                var agentUploads = blockUploads.get(blockIndex);
                if (agentUploads && agentUploads.length > 0) {
                    agentUploadThumbs = '<div class="ai-card-uploads" data-ai-index="' + blockIndex + '">';
                    agentUploads.forEach(function (u, ui) {
                        agentUploadThumbs += '<div class="ai-card-upload-thumb"><img src="data:' + u.mimeType + ';base64,' + u.data + '" alt="' + escapeHtml(u.name) + '">'
                            + '<button class="ai-card-upload-remove" data-ai-index="' + blockIndex + '" data-upload-index="' + ui + '" title="Remove">✕</button></div>';
                    });
                    agentUploadThumbs += '</div>';
                }

                result += '<div class="ai-placeholder-card ai-agent-card" data-ai-type="Agent" data-ai-index="' + blockIndex + '">'
                    + '<div class="ai-placeholder-header">'
                    + '<span class="ai-placeholder-icon">' + icon + '</span>'
                    + '<span class="ai-placeholder-label">' + label + agentTypeBadge + cloudBadge + '</span>'
                    + '<select class="ai-agenttype-select" data-ai-index="' + blockIndex + '" title="Select agent type"><option value=""' + (!agentTypeName ? ' selected' : '') + '>No Agent</option><option value="openclaw"' + (agentTypeName === 'openclaw' ? ' selected' : '') + '>openclaw</option><option value="openfang"' + (agentTypeName === 'openfang' ? ' selected' : '') + '>openfang</option></select>'
                    + agentUseHint
                    + '<div class="ai-placeholder-actions">'
                    + '<button class="ai-placeholder-btn ai-upload-btn" data-ai-index="' + blockIndex + '" title="Upload image for vision analysis">📎</button>'
                    + '<button class="ai-placeholder-btn ai-memory-select-btn" data-ai-index="' + blockIndex + '" title="Select memory sources">📚</button>'
                    + '<button class="ai-placeholder-btn ai-think-toggle' + (hasThink ? ' active' : '') + '" data-ai-index="' + blockIndex + '" title="Toggle thinking mode">🧠</button>'
                    + '<button class="ai-placeholder-btn ai-cloud-toggle' + (hasCloud ? ' active' : '') + '" data-ai-index="' + blockIndex + '" title="Run on cloud (GitHub Codespaces)">☁️</button>'
                    + '<button class="ai-placeholder-btn ai-search-multi-btn' + (agentActiveSearch.length > 0 ? ' active' : '') + '" data-ai-index="' + blockIndex + '" title="Search engines">🔍' + (agentActiveSearch.length > 0 ? ' ' + agentActiveSearch.length : '') + '</button>'
                    + '<button class="ai-placeholder-btn ai-vars-toggle' + (agentVarName || agentActiveInputs.length > 0 ? ' active' : '') + '" data-ai-index="' + blockIndex + '" title="Variables — set output name and select input variables">🔗' + (agentVarName ? ' ' + escapeHtml(agentVarName) : '') + (agentActiveInputs.length > 0 ? ' +' + agentActiveInputs.length : '') + '</button>'
                    + '<select class="ai-card-model-select" data-ai-index="' + blockIndex + '" title="Model for this flow">' + cardModelOpts + '</select>'
                    + '<button class="ai-placeholder-btn ai-fill-one" data-ai-index="' + blockIndex + '" title="Run this agent flow">▶</button>'
                    + '<button class="ai-placeholder-btn ai-remove-tag" data-ai-index="' + blockIndex + '" title="Remove tag">✕</button>'
                    + '</div></div>'
                    + agentUploadThumbs
                    + '<div class="ai-memory-dropdown" data-ai-index="' + blockIndex + '" style="display:none">'
                    + '<div class="ai-memory-dropdown-header">📚 Memory Sources</div>'
                    + '<div class="ai-memory-source-list" data-ai-index="' + blockIndex + '"><span class="ai-memory-loading">Loading…</span></div>'
                    + '<div class="ai-memory-dropdown-attach">'
                    + '<button class="ai-placeholder-btn ai-memory-quick-folder" data-ai-index="' + blockIndex + '" title="Attach folder">📂 Folder</button>'
                    + '<button class="ai-placeholder-btn ai-memory-quick-files" data-ai-index="' + blockIndex + '" title="Attach files">📄 Files</button>'
                    + '</div>'
                    + '</div>'
                    + agentSearchPillsHtml
                    + '<div class="ai-vars-panel" data-ai-index="' + blockIndex + '" style="display:none">'
                    + '<div class="ai-vars-section">'
                    + '<div class="ai-vars-section-label">📤 Output Variable</div>'
                    + '<div class="ai-var-panel-row">'
                    + '<input class="ai-var-input" data-ai-index="' + blockIndex + '" type="text" placeholder="Variable name, e.g. my_result" value="' + escapeHtml(agentVarName) + '" spellcheck="false">'
                    + '<button class="ai-var-clear" data-ai-index="' + blockIndex + '" title="Clear">✕</button>'
                    + '</div>'
                    + '</div>'
                    + '<div class="ai-vars-section ai-vars-input-section">'
                    + '<div class="ai-vars-section-label">📥 Input Variables</div>'
                    + '<div class="ai-input-var-list" data-ai-index="' + blockIndex + '"></div>'
                    + '</div>'
                    + '</div>'
                    + '<div class="ai-agent-steps">' + stepsHtml + '</div>'
                    + '</div>';
            } else if (type === 'Translate') {
                // Translate card — specialized for text translation + TTS
                var translateDisplayText = prompt;
                translateDisplayText = translateDisplayText.replace(/^\s*(?:@lang|Lang):\s*.+$/mi, '').trim();
                translateDisplayText = translateDisplayText.replace(/^\s*(?:@var|Var):\s*\S+$/mi, '').trim();
                translateDisplayText = translateDisplayText.replace(/^\s*(?:@input|Input):\s*.+$/mi, '').trim();
                translateDisplayText = translateDisplayText.replace(/^\s*@upload:\s*.+$/gmi, '').trim();
                translateDisplayText = translateDisplayText.replace(/^\s*(?:@model|Model):\s*\S+$/mi, '').trim();

                var translateHasPrompt = /^\s*(?:@prompt|Prompt):\s*/m.test(translateDisplayText);
                var translatePromptMatch = translateDisplayText.match(/^\s*(?:@prompt|Prompt):\s*(.*)$/m);
                var translatePromptVal = translatePromptMatch ? translatePromptMatch[1].trim() : '';
                var translateDescText = translateHasPrompt
                    ? translateDisplayText.replace(translatePromptMatch[0], '').trim()
                    : translateDisplayText;
                // Strip @lang from description (already shown in dropdown)
                translateDescText = translateDescText.replace(/^\s*(?:@lang|Lang):\s*.+$/mi, '').trim();

                // Parse @lang from raw prompt (before stripping)
                var langFieldMatch = prompt.match(/^\s*(?:@lang|Lang):\s*(.+)$/mi);
                var currentLang = langFieldMatch ? langFieldMatch[1].trim() : 'Japanese';

                // Language dropdown options
                var langOptions = [
                    { code: 'ja', name: 'Japanese' },
                    { code: 'ko', name: 'Korean' },
                    { code: 'zh', name: 'Chinese' },
                    { code: 'fr', name: 'French' },
                    { code: 'de', name: 'German' },
                    { code: 'it', name: 'Italian' },
                    { code: 'es', name: 'Spanish' },
                    { code: 'pt', name: 'Portuguese' },
                    { code: 'hi', name: 'Hindi' },
                    { code: 'en', name: 'English' },
                ];
                var langSelectHtml = '<select class="ai-translate-lang-select" data-ai-index="' + blockIndex + '" title="Target language">';
                langOptions.forEach(function (lo) {
                    var sel = lo.name.toLowerCase() === currentLang.toLowerCase() ? ' selected' : '';
                    langSelectHtml += '<option value="' + lo.name + '" data-lang-code="' + lo.code + '"' + sel + '>' + lo.name + '</option>';
                });
                langSelectHtml += '</select>';

                result += '<div class="ai-placeholder-card ai-translate-card" data-ai-type="Translate" data-ai-index="' + blockIndex + '" data-target-lang="' + escapeHtml(currentLang) + '">'
                    + '<div class="ai-placeholder-header">'
                    + '<span class="ai-placeholder-icon">' + icon + '</span>'
                    + '<span class="ai-placeholder-label">' + label + '</span>'
                    + '<div class="ai-placeholder-actions">'
                    + langSelectHtml
                    + '<select class="ai-card-model-select" data-ai-index="' + blockIndex + '" title="Model for translation">' + cardModelOpts + '</select>'
                    + '<button class="ai-placeholder-btn ai-fill-one" data-ai-index="' + blockIndex + '" title="Translate">▶</button>'
                    + '<button class="ai-placeholder-btn ai-remove-tag" data-ai-index="' + blockIndex + '" title="Remove tag">✕</button>'
                    + '</div></div>'
                    + (translateDescText ? '<div class="ai-placeholder-prompt ai-placeholder-prompt-static">' + escapeHtml(translateDescText) + '</div>' : '')
                    + (translateHasPrompt
                        ? '<div class="ai-placeholder-prompt"><textarea class="ai-card-prompt-input" data-ai-index="' + blockIndex + '" placeholder="Enter text to translate\u2026" rows="2">' + escapeHtml(translatePromptVal) + '</textarea></div>'
                        : '')
                    + '</div>';
            } else if (type === 'TTS') {
                // TTS card — direct text-to-speech playback via Kokoro
                var ttsDisplayText = prompt;
                ttsDisplayText = ttsDisplayText.replace(/^\s*(?:@lang|Lang):\s*.+$/mi, '').trim();
                ttsDisplayText = ttsDisplayText.replace(/^\s*(?:@var|Var):\s*\S+$/mi, '').trim();
                ttsDisplayText = ttsDisplayText.replace(/^\s*(?:@input|Input):\s*.+$/mi, '').trim();
                ttsDisplayText = ttsDisplayText.replace(/^\s*(?:@model|Model):\s*\S+$/mi, '').trim();

                var ttsHasPrompt = /^\s*(?:@prompt|Prompt):\s*/m.test(ttsDisplayText);
                var ttsPromptMatch = ttsDisplayText.match(/^\s*(?:@prompt|Prompt):\s*(.*)$/m);
                var ttsPromptVal = ttsPromptMatch ? ttsPromptMatch[1].trim() : '';
                // Resolve $(varName) from the Vars system at render time
                ttsPromptVal = M._vars ? M._vars.resolveText(ttsPromptVal) : ttsPromptVal;
                var ttsDescText = ttsHasPrompt
                    ? ttsDisplayText.replace(ttsPromptMatch[0], '').trim()
                    : ttsDisplayText;
                ttsDescText = ttsDescText.replace(/^\s*(?:@lang|Lang):\s*.+$/mi, '').trim();

                // Parse @lang
                var ttsLangMatch = prompt.match(/^\s*(?:@lang|Lang):\s*(.+)$/mi);
                var ttsCurrentLang = ttsLangMatch ? ttsLangMatch[1].trim() : 'English';

                // Language dropdown — Kokoro for 9 languages, Web Speech API for Korean/German
                var ttsLangOptions = [
                    { code: 'en', name: 'English' },
                    { code: 'en-us', name: 'English (US)' },
                    { code: 'en-gb', name: 'English (UK)' },
                    { code: 'zh', name: 'Chinese (Mandarin)' },
                    { code: 'ja', name: 'Japanese' },
                    { code: 'ko', name: 'Korean' },
                    { code: 'fr', name: 'French' },
                    { code: 'de', name: 'German' },
                    { code: 'it', name: 'Italian' },
                    { code: 'es', name: 'Spanish' },
                    { code: 'pt', name: 'Portuguese' },
                    { code: 'hi', name: 'Hindi' },
                ];
                var ttsLangHtml = '<select class="ai-translate-lang-select ai-tts-lang-select" data-ai-index="' + blockIndex + '" title="Voice language">';
                ttsLangOptions.forEach(function (lo) {
                    var sel = lo.name.toLowerCase() === ttsCurrentLang.toLowerCase() ? ' selected' : '';
                    ttsLangHtml += '<option value="' + lo.name + '" data-lang-code="' + lo.code + '"' + sel + '>' + lo.name + '</option>';
                });
                ttsLangHtml += '</select>';

                result += '<div class="ai-placeholder-card ai-tts-card" data-ai-type="TTS" data-ai-index="' + blockIndex + '" data-target-lang="' + escapeHtml(ttsCurrentLang) + '">'
                    + '<div class="ai-placeholder-header">'
                    + '<span class="ai-placeholder-icon">' + icon + '</span>'
                    + '<span class="ai-placeholder-label">' + label + '</span>'
                    + '<span class="ai-tts-model-badge">Kokoro TTS</span>'
                    + '<div class="ai-placeholder-actions">'
                    + ttsLangHtml
                    + '<button class="ai-placeholder-btn ai-fill-one ai-tts-run" data-ai-index="' + blockIndex + '" title="Generate audio">▶ Run</button>'
                    + '<button class="ai-placeholder-btn ai-tts-play-toggle" data-ai-index="' + blockIndex + '" title="Play / Stop audio">▷ Play</button>'
                    + '<button class="ai-placeholder-btn ai-tts-download" data-ai-index="' + blockIndex + '" title="Download audio as WAV">⬇ Save</button>'
                    + '<button class="ai-placeholder-btn ai-remove-tag" data-ai-index="' + blockIndex + '" title="Remove tag">✕</button>'
                    + '</div></div>'
                    + (ttsDescText ? '<div class="ai-placeholder-prompt ai-placeholder-prompt-static">' + escapeHtml(ttsDescText) + '</div>' : '')
                    + (ttsHasPrompt
                        ? '<div class="ai-placeholder-prompt"><textarea class="ai-card-prompt-input" data-ai-index="' + blockIndex + '" placeholder="Enter text to speak aloud\u2026" rows="2">' + escapeHtml(ttsPromptVal) + '</textarea></div>'
                        : '')
                    + '</div>';
            } else if (type === 'STT') {
                // STT card — Speech-to-Text via Voxtral/Whisper/Web Speech API
                var sttDisplayText = prompt;
                sttDisplayText = sttDisplayText.replace(/^\s*(?:@lang|Lang):\s*.+$/mi, '').trim();
                sttDisplayText = sttDisplayText.replace(/^\s*(?:@engine|Engine):\s*.+$/mi, '').trim();
                sttDisplayText = sttDisplayText.replace(/^\s*(?:@var|Var):\s*\S+$/mi, '').trim();
                sttDisplayText = sttDisplayText.replace(/^\s*(?:@input|Input):\s*.+$/mi, '').trim();
                sttDisplayText = sttDisplayText.replace(/^\s*(?:@model|Model):\s*\S+$/mi, '').trim();

                // Parse @lang
                var sttLangMatch = prompt.match(/^\s*(?:@lang|Lang):\s*(.+)$/mi);
                var sttCurrentLang = sttLangMatch ? sttLangMatch[1].trim() : 'en-US';

                // Parse @engine (whisper | voxtral | webspeech)
                var sttEngineMatch = prompt.match(/^\s*(?:@engine|Engine):\s*(.+)$/mi);
                var sttEngines = M.speechToText && M.speechToText.getEngines ? M.speechToText.getEngines() : {};
                var sttDefaultEngine = sttEngines.webGPU ? 'voxtral' : 'whisper';
                var sttSelectedEngine = sttEngineMatch ? sttEngineMatch[1].trim().toLowerCase() : sttDefaultEngine;

                // Engine selector dropdown
                var sttEngineOptions = [
                    { id: 'whisper', name: '🧠 Whisper V3 Turbo', desc: 'WASM · Offline' },
                    { id: 'voxtral', name: '🚀 Voxtral Mini 3B', desc: 'WebGPU · Offline' },
                    { id: 'webspeech', name: '🌐 Web Speech API', desc: 'Browser · Online' },
                ];
                var sttEngineHtml = '<select class="ai-stt-engine-select" data-ai-index="' + blockIndex + '" title="STT Engine">';
                sttEngineOptions.forEach(function (eo) {
                    var sel = eo.id === sttSelectedEngine ? ' selected' : '';
                    sttEngineHtml += '<option value="' + eo.id + '"' + sel + '>' + eo.name + '</option>';
                });
                sttEngineHtml += '</select>';

                // Language dropdown
                var sttLangOptions = [
                    { code: 'en-US', name: 'English (US)' },
                    { code: 'en-GB', name: 'English (UK)' },
                    { code: 'ja-JP', name: 'Japanese' },
                    { code: 'ko-KR', name: 'Korean' },
                    { code: 'zh-CN', name: 'Chinese' },
                    { code: 'fr-FR', name: 'French' },
                    { code: 'de-DE', name: 'German' },
                    { code: 'it-IT', name: 'Italian' },
                    { code: 'es-ES', name: 'Spanish' },
                    { code: 'pt-BR', name: 'Portuguese' },
                    { code: 'hi-IN', name: 'Hindi' },
                ];
                var sttLangHtml = '<select class="ai-translate-lang-select ai-stt-lang-select" data-ai-index="' + blockIndex + '" title="Recording language">';
                sttLangOptions.forEach(function (lo) {
                    var sel = lo.code === sttCurrentLang ? ' selected' : '';
                    sttLangHtml += '<option value="' + lo.code + '"' + sel + '>' + lo.name + '</option>';
                });
                sttLangHtml += '</select>';

                result += '<div class="ai-placeholder-card ai-stt-card" data-ai-type="STT" data-ai-index="' + blockIndex + '" data-stt-lang="' + escapeHtml(sttCurrentLang) + '" data-stt-engine="' + escapeHtml(sttSelectedEngine) + '">'
                    + '<div class="ai-placeholder-header">'
                    + '<span class="ai-placeholder-icon">' + icon + '</span>'
                    + '<span class="ai-placeholder-label">' + label + '</span>'
                    + '<div class="ai-placeholder-actions">'
                    + sttEngineHtml
                    + sttLangHtml
                    + '<button class="ai-placeholder-btn ai-stt-record" data-ai-index="' + blockIndex + '" title="Start recording">🎙️ Record</button>'
                    + '<button class="ai-placeholder-btn ai-stt-stop" data-ai-index="' + blockIndex + '" title="Stop recording" style="display:none">■ Stop</button>'
                    + '<button class="ai-placeholder-btn ai-remove-tag" data-ai-index="' + blockIndex + '" title="Remove tag">✕</button>'
                    + '</div></div>'
                    + (sttDisplayText ? '<div class="ai-placeholder-prompt ai-placeholder-prompt-static">' + escapeHtml(sttDisplayText) + '</div>' : '')
                    + '<div class="ai-stt-result" data-ai-index="' + blockIndex + '" style="display:none">'
                    + '<div class="ai-stt-result-text"></div>'
                    + '<div class="ai-stt-result-actions">'
                    + '<button class="ai-placeholder-btn ai-stt-insert" data-ai-index="' + blockIndex + '" title="Insert transcription into document">📋 Insert</button>'
                    + '<button class="ai-placeholder-btn ai-stt-clear" data-ai-index="' + blockIndex + '" title="Clear result">🗑 Clear</button>'
                    + '</div>'
                    + '</div>'
                    + '</div>';
            } else {
                // Extract @use and strip @ fields from display
                var useMatch = prompt.match(/^\s*(?:@use|Use):\s*(.+)$/m);
                var useHint = useMatch ? '<span class="ai-use-hint">📚 ' + escapeHtml(useMatch[1]) + '</span>' : '';
                var displayText = useMatch ? prompt.replace(useMatch[0], '').trim() : prompt;
                // Strip metadata fields from display
                displayText = displayText.replace(/^\s*(?:@think|Think):\s*(yes|no)$/mi, '').trim();
                displayText = displayText.replace(/^\s*(?:@search|Search):\s*\S+$/mi, '').trim();
                displayText = displayText.replace(/^\s*@upload:\s*.+$/gmi, '').trim();
                displayText = displayText.replace(/^\s*(?:@model|Model):\s*\S+$/mi, '').trim();
                displayText = displayText.replace(/^\s*(?:@var|Var):\s*\S+$/mi, '').trim();
                displayText = displayText.replace(/^\s*(?:@input|Input):\s*.+$/mi, '').trim();

                // Separate description (bare text) from @prompt: (editable)
                var hasPromptField = /^\s*(?:@prompt|Prompt):\s*/m.test(displayText);
                var promptFieldMatch = displayText.match(/^\s*(?:@prompt|Prompt):\s*(.*)$/m);
                var promptValue = promptFieldMatch ? promptFieldMatch[1].trim() : '';
                var descriptionText = hasPromptField
                    ? displayText.replace(promptFieldMatch[0], '').trim()
                    : displayText;

                // Parse @search field for AI card (comma-separated multi-provider)
                var searchFieldMatch = prompt.match(/^(?:@search|Search):\s*(.+)$/mi);
                var aiActiveSearch = searchFieldMatch
                    ? searchFieldMatch[1].split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean)
                    : [];
                var aiSearchPillsHtml = buildSearchPillsHtml(blockIndex, aiActiveSearch);

                // Parse @var: field for AI card
                var aiVarMatch = prompt.match(/^\s*(?:@var|Var):\s*(\S+)$/mi);
                var aiVarName = aiVarMatch ? aiVarMatch[1].trim() : '';

                // Parse @input: field for AI card
                var aiInputMatch = prompt.match(/^\s*(?:@input|Input):\s*(.+)$/mi);
                var aiActiveInputs = aiInputMatch
                    ? aiInputMatch[1].split(',').map(function (s) { return s.trim(); }).filter(Boolean)
                    : [];

                // Build upload thumbnail strip if images are already attached
                var uploadThumbs = '';
                var existingUploads = blockUploads.get(blockIndex);
                if (existingUploads && existingUploads.length > 0) {
                    uploadThumbs = '<div class="ai-card-uploads" data-ai-index="' + blockIndex + '">';
                    existingUploads.forEach(function (u, ui) {
                        uploadThumbs += '<div class="ai-card-upload-thumb"><img src="data:' + u.mimeType + ';base64,' + u.data + '" alt="' + escapeHtml(u.name) + '">'
                            + '<button class="ai-card-upload-remove" data-ai-index="' + blockIndex + '" data-upload-index="' + ui + '" title="Remove">✕</button></div>';
                    });
                    uploadThumbs += '</div>';
                }

                result += '<div class="ai-placeholder-card" data-ai-type="' + type + '" data-ai-index="' + blockIndex + '">'
                    + '<div class="ai-placeholder-header">'
                    + '<span class="ai-placeholder-icon">' + icon + '</span>'
                    + '<span class="ai-placeholder-label">' + label + '</span>'
                    + useHint
                    + '<div class="ai-placeholder-actions">'
                    + '<button class="ai-placeholder-btn ai-upload-btn" data-ai-index="' + blockIndex + '" title="Upload image for vision analysis">📎</button>'
                    + '<button class="ai-placeholder-btn ai-memory-select-btn" data-ai-index="' + blockIndex + '" title="Select memory sources">📚</button>'
                    + '<button class="ai-placeholder-btn ai-think-toggle' + (hasThink ? ' active' : '') + '" data-ai-index="' + blockIndex + '" title="Toggle thinking mode">🧠</button>'
                    + '<button class="ai-placeholder-btn ai-search-multi-btn' + (aiActiveSearch.length > 0 ? ' active' : '') + '" data-ai-index="' + blockIndex + '" title="Search engines">🔍' + (aiActiveSearch.length > 0 ? ' ' + aiActiveSearch.length : '') + '</button>'
                    + '<button class="ai-placeholder-btn ai-vars-toggle' + (aiVarName || aiActiveInputs.length > 0 ? ' active' : '') + '" data-ai-index="' + blockIndex + '" title="Variables — set output name and select input variables">🔗' + (aiVarName ? ' ' + escapeHtml(aiVarName) : '') + (aiActiveInputs.length > 0 ? ' +' + aiActiveInputs.length : '') + '</button>'
                    + '<select class="ai-card-model-select" data-ai-index="' + blockIndex + '" title="Model for this generation">' + cardModelOpts + '</select>'
                    + '<button class="ai-placeholder-btn ai-fill-one" data-ai-index="' + blockIndex + '" title="Generate this block">▶</button>'
                    + '<button class="ai-placeholder-btn ai-remove-tag" data-ai-index="' + blockIndex + '" title="Remove tag">✕</button>'
                    + '</div></div>'
                    + uploadThumbs
                    + '<div class="ai-memory-dropdown" data-ai-index="' + blockIndex + '" style="display:none">'
                    + '<div class="ai-memory-dropdown-header">📚 Memory Sources</div>'
                    + '<div class="ai-memory-source-list" data-ai-index="' + blockIndex + '"><span class="ai-memory-loading">Loading…</span></div>'
                    + '<div class="ai-memory-dropdown-attach">'
                    + '<button class="ai-placeholder-btn ai-memory-quick-folder" data-ai-index="' + blockIndex + '" title="Attach folder">📂 Folder</button>'
                    + '<button class="ai-placeholder-btn ai-memory-quick-files" data-ai-index="' + blockIndex + '" title="Attach files">📄 Files</button>'
                    + '</div>'
                    + '</div>'
                    + aiSearchPillsHtml
                    + '<div class="ai-vars-panel" data-ai-index="' + blockIndex + '" style="display:none">'
                    + '<div class="ai-vars-section">'
                    + '<div class="ai-vars-section-label">📤 Output Variable</div>'
                    + '<div class="ai-var-panel-row">'
                    + '<input class="ai-var-input" data-ai-index="' + blockIndex + '" type="text" placeholder="Variable name, e.g. my_result" value="' + escapeHtml(aiVarName) + '" spellcheck="false">'
                    + '<button class="ai-var-clear" data-ai-index="' + blockIndex + '" title="Clear">✕</button>'
                    + '</div>'
                    + '</div>'
                    + '<div class="ai-vars-section ai-vars-input-section">'
                    + '<div class="ai-vars-section-label">📥 Input Variables</div>'
                    + '<div class="ai-input-var-list" data-ai-index="' + blockIndex + '"></div>'
                    + '</div>'
                    + '</div>'
                    + (descriptionText ? '<div class="ai-placeholder-prompt ai-placeholder-prompt-static">' + escapeHtml(descriptionText) + '</div>' : '')
                    + (hasPromptField
                        ? '<div class="ai-placeholder-prompt"><textarea class="ai-card-prompt-input" data-ai-index="' + blockIndex + '" placeholder="Enter prompt for AI\u2026" rows="2">' + escapeHtml(promptValue) + '</textarea></div>'
                        : '')
                    + '</div>';
            }

            blockIndex++;
            lastIndex = match.index + match[0].length;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // PREVIEW ACTIONS — bind preview card buttons
    // ==============================================

    function bindDocgenPreviewActions(container) {
        container.querySelectorAll('.ai-fill-one').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                // Check if this is an Agent block
                var card = this.closest('.ai-placeholder-card');
                if (card && card.dataset.aiType === 'Agent') {
                    M._docgen.generateAgentFlow(idx);
                } else if (card && card.dataset.aiType === 'TTS') {
                    // TTS Run: generate audio without playing
                    var ttsBlocks = M.parseDocgenBlocks(M.markdownEditor.value);
                    if (idx < ttsBlocks.length) {
                        var ttsBlock = ttsBlocks[idx];
                        var ttsText = ttsBlock.prompt || '';
                        ttsText = M._vars ? M._vars.resolveText(ttsText) : ttsText;
                        ttsText = ttsText.trim();
                        var ttsPromptArea = card.querySelector('.ai-card-prompt-input');
                        if (ttsPromptArea && ttsPromptArea.value.trim()) {
                            var resolvedPrompt = M._vars
                                ? M._vars.resolveText(ttsPromptArea.value.trim())
                                : ttsPromptArea.value.trim();
                            if (resolvedPrompt) ttsText = resolvedPrompt;
                        }
                        var ttsLangSel = card.querySelector('.ai-tts-lang-select');
                        var ttsLangName = ttsLangSel ? ttsLangSel.value : 'English';
                        var ttsLangCode = ttsLangName.toLowerCase();

                        if (!ttsText) {
                            console.warn('[TTS] ⚠ Run clicked but no text to speak');
                            M.showToast('⚠️ No text to speak — make sure the prompt has content.', 'warning');
                        } else if (!M.tts) {
                            console.warn('[TTS] ⚠ TTS engine not loaded yet');
                            M.showToast('🔊 TTS engine loading — please try again in a moment.', 'info');
                        } else if (M.tts && M.tts.generate) {
                            console.log('[TTS] ▶ Run clicked — generating audio for: "' + ttsText.substring(0, 80) + '…" (' + ttsText.length + ' chars), lang=' + ttsLangName);

                            // — Enter generating state: disable all card buttons —
                            var runBtn = card.querySelector('.ai-tts-run');
                            var playBtn = card.querySelector('.ai-tts-play-toggle');
                            var saveBtn = card.querySelector('.ai-tts-download');
                            var langSel = card.querySelector('.ai-tts-lang-select');
                            var removeBtn = card.querySelector('.ai-remove-tag');

                            if (runBtn) { runBtn.disabled = true; runBtn.textContent = '⏳ Generating…'; }
                            if (playBtn) playBtn.disabled = true;
                            if (saveBtn) saveBtn.disabled = true;
                            if (langSel) langSel.disabled = true;
                            if (removeBtn) removeBtn.disabled = true;
                            card.classList.add('ai-tts-generating');

                            // Register callback to restore buttons when done
                            M.tts.onGenerateComplete(function (result, error) {
                                if (runBtn) { runBtn.disabled = false; runBtn.textContent = '▶ Run'; }
                                if (playBtn) playBtn.disabled = false;
                                if (saveBtn) saveBtn.disabled = false;
                                if (langSel) langSel.disabled = false;
                                if (removeBtn) removeBtn.disabled = false;
                                card.classList.remove('ai-tts-generating');

                                if (error) {
                                    console.error('[TTS] ❌ Generation failed:', error);
                                    M.showToast('❌ TTS generation failed: ' + error, 'error');
                                } else if (result && result.webSpeech) {
                                    console.log('[TTS] ✅ Web Speech API playback complete');
                                    M.showToast('✅ Spoken via Web Speech API (no downloadable audio for this language)', 'success');
                                } else {
                                    console.log('[TTS] ✅ Generation complete — ' + result.duration.toFixed(1) + 's of audio at ' + result.sampleRate + ' Hz');
                                    M.showToast('✅ Audio generated! Click Play to listen.', 'success');
                                }
                            });

                            M.tts.generate(ttsText, null, ttsLangCode);
                            M.showToast('🔧 Generating audio…', 'info');
                        }
                    }
                } else {
                    M._docgen.generateAndReview(idx);
                }
            });
        });

        container.querySelectorAll('.ai-remove-tag').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                M._docgen.removeDocgenTag(idx);
            });
        });

        // TTS Play/Stop toggle button — single button that switches between Play and Stop
        container.querySelectorAll('.ai-tts-play-toggle').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var card = this.closest('.ai-tts-card');
                var isPlaying = this.classList.contains('ai-tts-playing');

                if (isPlaying) {
                    // Currently playing → Stop
                    console.log('[TTS] ⏹ Stop clicked — stopping audio playback');
                    if (M.tts && M.tts.stop) M.tts.stop();
                    this.classList.remove('ai-tts-playing');
                    this.textContent = '▷ Play';
                    this.title = 'Play audio';
                    if (card) card.classList.remove('ai-tts-speaking');
                } else {
                    // Not playing → Play (if audio exists)
                    if (!M.tts || !M.tts.hasAudio || !M.tts.hasAudio()) {
                        console.log('[TTS] ⚠ Play clicked but no audio generated yet');
                        M.showToast && M.showToast('⚠️ No audio generated yet. Click Run first.', 'warning');
                        return;
                    }
                    console.log('[TTS] ▶ Play clicked — playing stored audio');
                    if (M.tts && M.tts.playLastAudio) {
                        M.tts.playLastAudio();
                    }
                    this.classList.add('ai-tts-playing');
                    this.textContent = '■ Stop';
                    this.title = 'Stop audio';
                    if (card) card.classList.add('ai-tts-speaking');

                    // Auto-reset to Play state when audio finishes naturally
                    var toggleBtn = this;
                    var checkFinished = setInterval(function () {
                        if (!M.tts || !M.tts.isSpeaking || !M.tts.isSpeaking()) {
                            clearInterval(checkFinished);
                            toggleBtn.classList.remove('ai-tts-playing');
                            toggleBtn.textContent = '▷ Play';
                            toggleBtn.title = 'Play audio';
                            if (card) card.classList.remove('ai-tts-speaking');
                            console.log('[TTS] ⏹ Playback finished — button reset to Play');
                        }
                    }, 300);
                }
            });
        });

        // STT record button — start recording via mic (card mode)
        container.querySelectorAll('.ai-stt-record').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var card = this.closest('.ai-stt-card');
                if (!card) return;
                var idx = parseInt(this.dataset.aiIndex, 10);
                var langSel = card.querySelector('.ai-stt-lang-select');
                var lang = langSel ? langSel.value : 'en-US';

                // Check mic permissions and start recording
                if (!M.speechToText) {
                    M.showToast && M.showToast('🎤 Speech-to-Text engine not loaded yet.', 'warning');
                    return;
                }

                // Switch button state
                this.style.display = 'none';
                var stopBtn = card.querySelector('.ai-stt-stop');
                if (stopBtn) stopBtn.style.display = '';
                card.classList.add('ai-stt-recording');

                // Show live status in result area
                var resultDiv = card.querySelector('.ai-stt-result');
                var resultText = card.querySelector('.ai-stt-result-text');
                if (resultDiv) resultDiv.style.display = '';
                if (resultText) {
                    resultText.innerHTML = '<span class="stt-interim">Listening… speak now</span>';
                }

                // Accumulated transcription for this recording session
                var accumulated = '';
                var lastChunkNorm = ''; // normalized last chunk for dedup

                // Start in card mode — text routes to the card, not the editor
                M.speechToText.startForCard(
                    // onText — final transcription chunk (deduped across engines)
                    function (text) {
                        if (!text || !text.trim()) return;
                        var chunk = text.trim();

                        // Dedup: only skip if one text contains the other (same speech from 2nd engine)
                        var normalizedChunk = chunk.toLowerCase().replace(/[^\w\s]/g, '').trim();
                        if (lastChunkNorm && normalizedChunk) {
                            if (lastChunkNorm.includes(normalizedChunk) || normalizedChunk.includes(lastChunkNorm)) {
                                console.log('🎤 STT card: skipping duplicate chunk', JSON.stringify(chunk));
                                return;
                            }
                        }

                        lastChunkNorm = normalizedChunk;
                        accumulated += (accumulated ? ' ' : '') + chunk;
                        if (resultText) {
                            resultText.textContent = accumulated;
                        }
                    },
                    // onInterim — live interim/partial text
                    function (interim) {
                        if (!resultText) return;
                        if (!interim) {
                            // Interim cleared — show accumulated or listening status
                            resultText.innerHTML = accumulated
                                ? accumulated
                                : '<span class="stt-interim">Listening… speak now</span>';
                        } else {
                            // Show accumulated + current interim preview
                            resultText.innerHTML = accumulated
                                ? accumulated + ' <span class="stt-interim">' + escapeHtml(interim) + '</span>'
                                : '<span class="stt-interim">' + escapeHtml(interim) + '</span>';
                        }
                    }
                );

                M.showToast && M.showToast('🎤 Recording started — speak now', 'info');
            });
        });

        // STT stop button — stop recording (card mode)
        container.querySelectorAll('.ai-stt-stop').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var card = this.closest('.ai-stt-card');
                if (!card) return;

                // Stop the STT engine in card mode
                if (M.speechToText && M.speechToText.isListening()) {
                    M.speechToText.stopForCard();
                }

                // Switch button state
                this.style.display = 'none';
                var recordBtn = card.querySelector('.ai-stt-record');
                if (recordBtn) recordBtn.style.display = '';
                card.classList.remove('ai-stt-recording');

                // Finalize the result area
                var resultText = card.querySelector('.ai-stt-result-text');
                if (resultText) {
                    // Strip any remaining interim spans to reveal final text
                    var interimSpans = resultText.querySelectorAll('.stt-interim');
                    interimSpans.forEach(function (s) { s.remove(); });
                    var finalText = resultText.textContent.trim();
                    if (!finalText) {
                        resultText.textContent = '(No speech detected — try again)';
                    } else {
                        resultText.textContent = finalText;
                    }
                }

                M.showToast && M.showToast('🎤 Recording stopped', 'info');
            });
        });

        // STT insert button — insert transcription replacing the tag
        container.querySelectorAll('.ai-stt-insert').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                var card = this.closest('.ai-stt-card');
                var resultText = card ? card.querySelector('.ai-stt-result-text') : null;
                var text = resultText ? resultText.textContent.trim() : '';

                // Don't insert status messages
                if (!text || text.startsWith('🎤') || text.startsWith('⏳') || text.startsWith('(')) {
                    M.showToast && M.showToast('⚠️ No transcription to insert.', 'warning');
                    return;
                }

                // Replace the STT tag with the transcribed text
                var editorText = M.markdownEditor ? M.markdownEditor.value : '';
                var blocks = M.parseDocgenBlocks(editorText);
                if (idx < blocks.length) {
                    var block = blocks[idx];
                    M.markdownEditor.value = editorText.substring(0, block.start) + text + editorText.substring(block.end);
                    M.markdownEditor.dispatchEvent(new Event('input'));
                    M.showToast && M.showToast('📋 Transcription inserted', 'success');
                }
            });
        });

        // STT clear button — clear result
        container.querySelectorAll('.ai-stt-clear').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var card = this.closest('.ai-stt-card');
                var resultDiv = card ? card.querySelector('.ai-stt-result') : null;
                var resultText = card ? card.querySelector('.ai-stt-result-text') : null;
                if (resultText) resultText.textContent = '';
                if (resultDiv) resultDiv.style.display = 'none';
            });
        });

        // TTS download button — download last generated audio as WAV
        container.querySelectorAll('.ai-tts-download').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (M.tts && M.tts.downloadAudio) {
                    M.tts.downloadAudio();
                } else {
                    M.showToast && M.showToast('⚠️ TTS engine not loaded.', 'warning');
                }
            });
        });

        // Model selector change — trigger download consent + sync @model: to editor
        container.querySelectorAll('.ai-card-model-select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                var modelId = this.value;
                if (!modelId) return;
                var models = window.AI_MODELS || {};
                var modelInfo = models[modelId];
                if (!modelId) return;

                // For local models, check if downloaded and trigger consent/download if needed
                if (modelInfo && modelInfo.isLocal && M._ai && M._ai.isLocalModel && M._ai.isLocalModel(modelId)) {
                    var ls = M._ai.getLocalState(modelId);
                    if (!ls.loaded && !ls.worker) {
                        var consentKey = M.KEYS.AI_CONSENTED_PREFIX + modelId;
                        var hasConsent = localStorage.getItem(consentKey)
                            || (modelId === 'qwen-local' && localStorage.getItem(M.KEYS.AI_CONSENTED));
                        if (hasConsent) {
                            M._ai.initAiWorker(modelId);
                            M.showToast('⏳ Loading ' + (modelInfo.dropdownName || modelInfo.label) + ' from cache…', 'info');
                        } else {
                            if (M.showModelDownloadPopup) M.showModelDownloadPopup(modelId);
                            M.showToast('📥 Please download ' + (modelInfo.dropdownName || modelInfo.label) + ' first.', 'info');
                        }
                    }
                }

                // For cloud models, check API key
                var providers = M.getCloudProviders ? M.getCloudProviders() : {};
                var cloudProvider = providers[modelId];
                if (cloudProvider && !cloudProvider.getKey()) {
                    M.showApiKeyModal(modelId);
                }

                // Sync @model: field in editor tag text
                var idx = parseInt(this.dataset.aiIndex, 10);
                var text = M.markdownEditor ? M.markdownEditor.value : '';
                var blocks = parseDocgenBlocks(text);
                if (idx < blocks.length) {
                    var block = blocks[idx];
                    var tagContent = text.substring(block.start, block.end);
                    var modelRe = /^(\s*)(?:@model|Model):\s*\S+$/mi;
                    var newTagContent;
                    if (modelRe.test(tagContent)) {
                        newTagContent = tagContent.replace(modelRe, '$1@model: ' + modelId);
                    } else {
                        // Insert @model after the tag opener (first line)
                        var colonIdx = tagContent.indexOf(':');
                        newTagContent = tagContent.substring(0, colonIdx + 1)
                            + '\n  @model: ' + modelId
                            + tagContent.substring(colonIdx + 1);
                    }
                    M.markdownEditor.value = text.substring(0, block.start) + newTagContent + text.substring(block.end);
                }
            });
        });

        // Upload button — 📎 opens file picker for image/PDF attachments
        container.querySelectorAll('.ai-upload-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                var existing = blockUploads.get(idx) || [];
                if (existing.length >= MAX_UPLOADS_PER_BLOCK) {
                    M.showToast('Maximum ' + MAX_UPLOADS_PER_BLOCK + ' images per block.', 'warning');
                    return;
                }
                // Check if this is an OCR card — if so, also accept PDFs
                var card = this.closest('.ai-placeholder-card');
                var isOcr = card && card.dataset.aiType === 'OCR';
                var input = document.createElement('input');
                input.type = 'file';
                input.accept = isOcr ? 'image/*,application/pdf' : 'image/*';
                input.multiple = true;
                input.addEventListener('change', function () {
                    var files = Array.from(input.files || []);
                    var remaining = MAX_UPLOADS_PER_BLOCK - existing.length;
                    files = files.slice(0, remaining);

                    // Separate PDFs from images
                    var pdfFiles = files.filter(function (f) { return f.type === 'application/pdf'; });
                    var imageFiles = files.filter(function (f) { return f.type !== 'application/pdf'; });

                    var allNames = [];
                    var totalExpected = imageFiles.length + pdfFiles.length;
                    var totalProcessed = 0;

                    function checkDone() {
                        totalProcessed++;
                        if (totalProcessed === totalExpected) {
                            addUploadFieldsToBlock(idx, allNames);
                            var count = (blockUploads.get(idx) || []).length - existing.length;
                            M.showToast('📎 ' + count + ' page(s) attached', 'success');
                        }
                    }

                    // Process image files normally
                    imageFiles.forEach(function (file) {
                        var reader = new FileReader();
                        reader.onload = function () {
                            var dataUrl = reader.result;
                            var base64 = dataUrl.split(',')[1];
                            var mimeType = file.type || 'image/png';
                            if (!blockUploads.has(idx)) blockUploads.set(idx, []);
                            blockUploads.get(idx).push({ data: base64, mimeType: mimeType, name: file.name });
                            allNames.push(file.name);
                            checkDone();
                        };
                        reader.readAsDataURL(file);
                    });

                    // Process PDF files — render each page to image via pdf.js
                    pdfFiles.forEach(function (file) {
                        renderPdfToImages(file, idx, existing.length).then(function (pageNames) {
                            allNames = allNames.concat(pageNames);
                            checkDone();
                        }).catch(function (err) {
                            M.showToast('❌ PDF error: ' + err.message, 'error');
                            checkDone();
                        });
                    });

                    // If no files at all, do nothing
                    if (totalExpected === 0) return;
                });
                input.click();
            });
        });

        // Upload thumbnail remove — ✕ on individual thumbnails
        container.querySelectorAll('.ai-card-upload-remove').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                var uploadIdx = parseInt(this.dataset.uploadIndex, 10);
                var uploads = blockUploads.get(idx);
                if (uploads) {
                    var removedName = uploads[uploadIdx].name;
                    uploads.splice(uploadIdx, 1);
                    if (uploads.length === 0) blockUploads.delete(idx);
                    // Remove the @upload: line from tag text
                    removeUploadFieldFromBlock(idx, removedName);
                }
            });
        });

        // Prompt textarea — sync edits back to editor tag text
        container.querySelectorAll('.ai-card-prompt-input').forEach(function (ta) {
            var debounceTimer = null;
            ta.addEventListener('input', function () {
                var self = this;
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function () {
                    var idx = parseInt(self.dataset.aiIndex, 10);
                    updateBlockPromptText(idx, self.value);
                }, 300);
            });
            // Auto-resize textarea height
            ta.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
            // Set initial height
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
        });

        // Translate language selector — sync @lang: field to editor text
        container.querySelectorAll('.ai-translate-lang-select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                var idx = parseInt(this.dataset.aiIndex, 10);
                var newLang = this.value;
                // Update data attribute on card
                var card = this.closest('.ai-translate-card');
                if (card) card.dataset.targetLang = newLang;
                // Sync @lang: field in editor tag text
                var text = M.markdownEditor ? M.markdownEditor.value : '';
                var blocks = parseDocgenBlocks(text);
                if (idx < blocks.length) {
                    var block = blocks[idx];
                    var tagContent = text.substring(block.start, block.end);
                    var langRe = /^(\s*)(?:@lang|Lang):\s*.+$/mi;
                    var newTagContent;
                    if (langRe.test(tagContent)) {
                        newTagContent = tagContent.replace(langRe, '$1@lang: ' + newLang);
                    } else {
                        // Insert @lang before closing }}
                        var closingIdx = tagContent.lastIndexOf('}}');
                        newTagContent = tagContent.substring(0, closingIdx)
                            + '  @lang: ' + newLang + '\n'
                            + tagContent.substring(closingIdx);
                    }
                    M.markdownEditor.value = text.substring(0, block.start) + newTagContent + text.substring(block.end);
                }
            });
        });

        // STT engine selector — sync @engine: field to editor text
        container.querySelectorAll('.ai-stt-engine-select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                var idx = parseInt(this.dataset.aiIndex, 10);
                var newEngine = this.value;
                // Update data attribute on card
                var card = this.closest('.ai-stt-card');
                if (card) card.dataset.sttEngine = newEngine;
                // Sync @engine: field in editor tag text
                var text = M.markdownEditor ? M.markdownEditor.value : '';
                var blocks = parseDocgenBlocks(text);
                if (idx < blocks.length) {
                    var block = blocks[idx];
                    var tagContent = text.substring(block.start, block.end);
                    var engineRe = /^(\s*)(?:@engine|Engine):\s*.+$/mi;
                    var newTagContent;
                    if (engineRe.test(tagContent)) {
                        newTagContent = tagContent.replace(engineRe, '$1@engine: ' + newEngine);
                    } else {
                        // Insert @engine before closing }}
                        var closingIdx = tagContent.lastIndexOf('}}');
                        newTagContent = tagContent.substring(0, closingIdx)
                            + '  @engine: ' + newEngine + '\n'
                            + tagContent.substring(closingIdx);
                    }
                    M.markdownEditor.value = text.substring(0, block.start) + newTagContent + text.substring(block.end);
                }
            });
        });

        // Agent step input — sync edits back to @step lines in editor
        container.querySelectorAll('.ai-agent-step-input').forEach(function (inp) {
            var debounceTimer = null;
            inp.addEventListener('input', function () {
                var self = this;
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function () {
                    var idx = parseInt(self.dataset.aiIndex, 10);
                    var stepNum = parseInt(self.dataset.stepNum, 10);
                    updateBlockStepText(idx, stepNum, self.value);
                }, 300);
            });
        });

        // OCR mode pills — toggle text/svg mode
        container.querySelectorAll('.ai-ocr-mode-pill').forEach(function (pill) {
            pill.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                var newMode = this.dataset.mode;
                // Update visual state
                var pillContainer = this.parentNode;
                pillContainer.querySelectorAll('.ai-ocr-mode-pill').forEach(function (p) {
                    p.classList.remove('active');
                });
                this.classList.add('active');
                // Update data attribute on card
                var card = this.closest('.ai-ocr-card');
                if (card) card.dataset.ocrMode = newMode;
                // Sync @mode: field in editor tag text
                var text = M.markdownEditor ? M.markdownEditor.value : '';
                var blocks = parseDocgenBlocks(text);
                if (idx < blocks.length) {
                    var block = blocks[idx];
                    var tagContent = text.substring(block.start, block.end);
                    // Replace or insert @mode: directive
                    var modeRe = /^(\s*)(?:@mode|Mode):\s*\S+$/mi;
                    var newTagContent;
                    if (modeRe.test(tagContent)) {
                        newTagContent = tagContent.replace(modeRe, '$1@mode: ' + newMode);
                    } else {
                        // Insert @mode after the tag opener
                        var colonIdx = tagContent.indexOf(':');
                        newTagContent = tagContent.substring(0, colonIdx + 1)
                            + '\n  @mode: ' + newMode
                            + tagContent.substring(colonIdx + 1);
                    }
                    M.markdownEditor.value = text.substring(0, block.start) + newTagContent + text.substring(block.end);
                }
            });
        });

        // Memory card — Attach Folder
        container.querySelectorAll('.ai-memory-attach-folder').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var name = this.dataset.memoryName;
                if (!M._memory) { M.showToast('Memory engine not loaded yet.', 'warning'); return; }
                btn.disabled = true;
                btn.textContent = '⏳ Scanning...';
                M._memory.attachFolder(name).then(function (info) {
                    M.showToast('📚 Indexed ' + info.chunkCount + ' chunks from "' + info.folderName + '"', 'success');
                    var statsEl = container.querySelector('.ai-memory-stats[data-memory-name="' + name + '"]');
                    if (statsEl) statsEl.textContent = '📂 ' + info.folderName + ' — ' + info.chunkCount + ' chunks';
                }).catch(function (err) {
                    if (err.name !== 'AbortError') M.showToast('Failed: ' + err.message, 'error');
                }).finally(function () {
                    btn.disabled = false;
                    btn.textContent = '📂 Folder';
                });
            });
        });

        // Memory card — Attach Files
        container.querySelectorAll('.ai-memory-attach-files').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var name = this.dataset.memoryName;
                if (!M._memory) { M.showToast('Memory engine not loaded yet.', 'warning'); return; }
                btn.disabled = true;
                btn.textContent = '⏳ Reading...';
                M._memory.attachFiles(name).then(function (info) {
                    M.showToast('📚 Added ' + info.addedChunks + ' chunks', 'success');
                    M._memory.getExternalStats(name).then(function (stats) {
                        var statsEl = container.querySelector('.ai-memory-stats[data-memory-name="' + name + '"]');
                        if (statsEl) statsEl.textContent = stats.files + ' files — ' + stats.chunks + ' chunks';
                    });
                }).catch(function (err) {
                    if (err.name !== 'AbortError') M.showToast('Failed: ' + err.message, 'error');
                }).finally(function () {
                    btn.disabled = false;
                    btn.textContent = '📄 Files';
                });
            });
        });

        // Memory card — Rebuild
        container.querySelectorAll('.ai-memory-rebuild').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var name = this.dataset.memoryName;
                if (!M._memory) { M.showToast('Memory engine not loaded yet.', 'warning'); return; }
                btn.disabled = true;
                btn.textContent = '⏳';
                // Rebuild workspace or external
                var promise = (name === 'workspace') ? M._memory.rebuildWorkspace() : M._memory.attachFolder(name);
                promise.then(function () {
                    M.showToast('🔄 Memory "' + name + '" rebuilt', 'success');
                }).catch(function (err) {
                    if (err.name !== 'AbortError') M.showToast('Rebuild failed: ' + err.message, 'error');
                }).finally(function () {
                    btn.disabled = false;
                    btn.textContent = '🔄';
                });
            });
        });

        // Load stats for existing Memory cards
        container.querySelectorAll('.ai-memory-stats').forEach(function (statsEl) {
            var name = statsEl.dataset.memoryName;
            if (!M._memory || !name) return;
            M._memory.getExternalStats(name).then(function (stats) {
                if (stats.files > 0) {
                    statsEl.textContent = stats.files + ' files — ' + stats.chunks + ' chunks';
                }
            }).catch(function () { /* ignore */ });
        });

        // ==============================================
        // MEMORY SELECTOR — dropdown on AI/Think/Agent cards
        // ==============================================

        // Helper: get document {{Memory:}} tag names from editor
        function getDocMemoryNames() {
            var text = M.markdownEditor ? M.markdownEditor.value : '';
            var names = [];
            var re = /\{\{@?Memory:[^}]*(?:@name|Name):\s*([^\s}]+)/gi;
            var m;
            while ((m = re.exec(text)) !== null) {
                var n = m[1].replace(/[,}]/g, '').trim();
                if (n && names.indexOf(n) === -1) names.push(n);
            }
            return names;
        }

        // ==============================================
        // FIELD SYNC — update @think:/@search: in editor text
        // ==============================================

        // --- Upload field helpers — write/remove @upload: lines in tag text ---

        // Flag to suppress re-render when prompt textarea writes to editor
        var _promptSyncInProgress = false;

        function updateBlockPromptText(blockIndex, newPromptText) {
            var text = M.markdownEditor ? M.markdownEditor.value : '';
            var blocks = parseDocgenBlocks(text);
            if (blockIndex >= blocks.length) return;
            var block = blocks[blockIndex];

            var tagContent = text.substring(block.start, block.end);
            var innerStart = tagContent.indexOf(':') + 1;
            var innerEnd = tagContent.lastIndexOf('}}');
            var inner = tagContent.substring(innerStart, innerEnd);

            // Collect metadata lines to preserve (excluding @prompt — we'll rewrite it)
            var metaLines = [];
            var lines = inner.split('\n');
            for (var i = 0; i < lines.length; i++) {
                var trimmed = lines[i].trim();
                if (/^@(think|search|upload|use|name|step|mode)\s*:/i.test(trimmed)
                    || /^(Think|Search|Use|Name|Step|Mode)\s*\d*\s*:/i.test(trimmed)) {
                    metaLines.push(trimmed);
                }
            }

            // Rebuild: metadata lines + @prompt: new text
            var newInner = metaLines.join('\n  ');
            if (newPromptText.trim()) {
                var promptLine = '@prompt: ' + newPromptText.trim();
                newInner = newInner ? newInner + '\n  ' + promptLine : promptLine;
            }

            var tagType = block.type;
            var newTag = '{{@' + tagType + ':\n  ' + newInner.trim() + '\n}}';

            _promptSyncInProgress = true;
            var cursorPos = M.markdownEditor.selectionStart;
            M.markdownEditor.value = text.substring(0, block.start) + newTag + text.substring(block.end);
            // Don't dispatch input event — would cause re-render and lose textarea focus
            setTimeout(function () { _promptSyncInProgress = false; }, 50);
        }

        function updateBlockStepText(blockIndex, stepNumber, newDescription) {
            var text = M.markdownEditor ? M.markdownEditor.value : '';
            var blocks = parseDocgenBlocks(text);
            if (blockIndex >= blocks.length) return;
            var block = blocks[blockIndex];

            var tagContent = text.substring(block.start, block.end);
            var innerStart = tagContent.indexOf(':') + 1;
            var innerEnd = tagContent.lastIndexOf('}}');
            var inner = tagContent.substring(innerStart, innerEnd);

            // Replace the specific @step line
            var stepRe = new RegExp('^(\\s*(?:@step|Step)\\s*' + stepNumber + '\\s*:\\s*)(.+)$', 'mi');
            inner = inner.replace(stepRe, '$1' + newDescription.trim());

            var newTag = '{{@' + block.type + ':\n  ' + inner.trim() + '\n}}';

            _promptSyncInProgress = true;
            M.markdownEditor.value = text.substring(0, block.start) + newTag + text.substring(block.end);
            setTimeout(function () { _promptSyncInProgress = false; }, 50);
        }

        function addUploadFieldsToBlock(blockIndex, fileNames) {
            var text = M.markdownEditor ? M.markdownEditor.value : '';
            var blocks = parseDocgenBlocks(text);
            if (blockIndex >= blocks.length) return;
            var block = blocks[blockIndex];

            var tagContent = text.substring(block.start, block.end);
            var innerStart = tagContent.indexOf(':') + 1;
            var innerEnd = tagContent.lastIndexOf('}}');
            var inner = tagContent.substring(innerStart, innerEnd).trim();

            // Add @upload: lines at the top
            var uploadLines = fileNames.map(function (n) { return '@upload: ' + n; }).join('\n  ');
            inner = uploadLines + '\n  ' + inner;

            var tagType = block.type === 'AI' && block.think ? 'AI' : block.type;
            var newTag = '{{@' + tagType + ':\n  ' + inner.trim() + '\n}}';
            M.markdownEditor.value = text.substring(0, block.start) + newTag + text.substring(block.end);
            if (M.markdownEditor) M.markdownEditor.dispatchEvent(new Event('input'));
        }

        function removeUploadFieldFromBlock(blockIndex, fileName) {
            var text = M.markdownEditor ? M.markdownEditor.value : '';
            var blocks = parseDocgenBlocks(text);
            if (blockIndex >= blocks.length) return;
            var block = blocks[blockIndex];

            var tagContent = text.substring(block.start, block.end);
            var innerStart = tagContent.indexOf(':') + 1;
            var innerEnd = tagContent.lastIndexOf('}}');
            var inner = tagContent.substring(innerStart, innerEnd);

            // Remove the specific @upload: line matching the filename
            var escapedName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            var lineRe = new RegExp('^\\s*@upload:\\s*' + escapedName + '\\s*$', 'mi');
            inner = inner.replace(lineRe, '').trim();

            var tagType = block.type === 'AI' && block.think ? 'AI' : block.type;
            var newTag = '{{@' + tagType + ':\n  ' + inner.trim() + '\n}}';
            M.markdownEditor.value = text.substring(0, block.start) + newTag + text.substring(block.end);
            if (M.markdownEditor) M.markdownEditor.dispatchEvent(new Event('input'));
        }

        function updateBlockField(blockIndex, fieldName, value) {
            var text = M.markdownEditor ? M.markdownEditor.value : '';
            var blocks = parseDocgenBlocks(text);
            if (blockIndex >= blocks.length) return;
            var block = blocks[blockIndex];

            var tagContent = text.substring(block.start, block.end);
            var innerStart = tagContent.indexOf(':') + 1;
            var innerEnd = tagContent.lastIndexOf('}}');
            var inner = tagContent.substring(innerStart, innerEnd);

            // Remove existing field line (including leading whitespace/indentation)
            var fieldRe = new RegExp('^\\s*' + fieldName + ':\\s*.+$', 'mi');
            inner = inner.replace(fieldRe, '').trim();

            // Add new field (if value is not empty/off)
            // For @cloud, always keep the field (even when 'no') so the badge renders
            var keepField = value && value !== 'off' && (fieldName === '@cloud' || value !== 'no');
            if (keepField) {
                inner = fieldName + ': ' + value + '\n  ' + inner;
            }

            var tagType = block.type;
            var newTag = '{{@' + tagType + ':\n  ' + inner.trim() + '\n}}';
            M.markdownEditor.value = text.substring(0, block.start) + newTag + text.substring(block.end);
            if (M.markdownEditor) M.markdownEditor.dispatchEvent(new Event('input'));
        }

        // Think toggle — 🧠 button
        container.querySelectorAll('.ai-think-toggle').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                var isActive = this.classList.toggle('active');
                updateBlockField(idx, '@think', isActive ? 'Yes' : 'No');
            });
        });

        // Cloud toggle — ☁️ button (Agent cards only)
        container.querySelectorAll('.ai-cloud-toggle').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                var isActive = this.classList.toggle('active');
                // Gate: require GitHub auth when enabling cloud
                if (isActive && M.agentCloud && !M.agentCloud.isAvailable()) {
                    if (M.githubAuth && !M.githubAuth.isAuthenticated()) {
                        M.githubAuth.showAuthModal();
                        this.classList.remove('active');
                        return;
                    }
                }
                updateBlockField(idx, '@cloud', isActive ? 'yes' : 'no');
            });
        });

        // Agent type selector — dropdown on Agent card
        container.querySelectorAll('.ai-agenttype-select').forEach(function (sel) {
            sel.addEventListener('change', function (e) {
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                updateBlockField(idx, '@agenttype', this.value || '');
            });
        });

        // Search toggle — 🔍 multi-select button shows/hides pill panel
        container.querySelectorAll('.ai-search-multi-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = this.dataset.aiIndex;
                var panel = container.querySelector('.ai-search-pills-panel[data-ai-index="' + idx + '"]');
                if (panel) {
                    var isVisible = panel.style.display !== 'none';
                    panel.style.display = isVisible ? 'none' : '';
                }
            });
        });

        // Search pill checkbox change — sync to editor @search: field
        container.querySelectorAll('.ai-card-search-check').forEach(function (cb) {
            cb.addEventListener('change', function () {
                var idx = parseInt(this.dataset.aiIndex, 10);
                var panel = container.querySelector('.ai-search-pills-panel[data-ai-index="' + idx + '"]');
                if (!panel) return;
                // Collect all checked providers
                var checked = [];
                panel.querySelectorAll('.ai-card-search-check:checked').forEach(function (c) {
                    checked.push(c.value);
                });
                // Update pill active states
                panel.querySelectorAll('.ai-card-search-pill').forEach(function (pill) {
                    var pid = pill.dataset.provider;
                    pill.classList.toggle('active', checked.indexOf(pid) !== -1);
                });
                // Update the toggle button badge
                var btn = container.querySelector('.ai-search-multi-btn[data-ai-index="' + idx + '"]');
                if (btn) {
                    btn.textContent = '🔍' + (checked.length > 0 ? ' ' + checked.length : '');
                    btn.classList.toggle('active', checked.length > 0);
                }
                // Sync to editor — @search: as comma-separated or remove if empty
                updateBlockField(idx, '@search', checked.length > 0 ? checked.join(', ') : '');
            });
        });

        // 🔗 Vars toggle — unified button shows/hides combined vars panel
        container.querySelectorAll('.ai-vars-toggle').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = this.dataset.aiIndex;
                var panel = container.querySelector('.ai-vars-panel[data-ai-index="' + idx + '"]');
                if (panel) {
                    var isVisible = panel.style.display !== 'none';
                    if (!isVisible) {
                        // Focus the output var input
                        var varInput = panel.querySelector('.ai-var-input');
                        if (varInput) setTimeout(function () { varInput.focus(); }, 50);

                        // Populate input variables list
                        var listEl = panel.querySelector('.ai-input-var-list');
                        if (listEl) {
                            // Merge: runtime/manual vars + declared @var: from other blocks
                            var allVars = M._vars ? M._vars.list() : {};
                            var text = M.markdownEditor ? M.markdownEditor.value : '';
                            var blocks = parseDocgenBlocks(text);
                            var blockIdx = parseInt(idx, 10);
                            var currentInputs = (blockIdx < blocks.length && blocks[blockIdx].inputVars) || [];

                            // Scan all blocks for declared @var: names (from other blocks)
                            for (var bi = 0; bi < blocks.length; bi++) {
                                if (bi === blockIdx) continue; // skip self
                                var declaredVar = blocks[bi].varName;
                                if (declaredVar && !allVars[declaredVar]) {
                                    allVars[declaredVar] = { value: '', layer: 'declared' };
                                }
                            }

                            var varNames = Object.keys(allVars);

                            if (varNames.length === 0) {
                                listEl.innerHTML = '<span class="ai-input-empty">No variables available yet. Use <code>@var:</code> on other blocks or <code>Variable:</code> on API tags.</span>';
                            } else {
                                var html = '';
                                varNames.forEach(function (name) {
                                    var info = allVars[name];
                                    var checked = currentInputs.indexOf(name) !== -1 ? ' checked' : '';
                                    var preview = info.layer === 'declared'
                                        ? '(not yet run)'
                                        : String(info.value || '').substring(0, 60);
                                    if (info.layer !== 'declared' && String(info.value || '').length > 60) preview += '…';
                                    html += '<label class="ai-input-checkbox-item">'
                                        + '<input type="checkbox" class="ai-input-var-check" value="' + escapeHtml(name) + '" data-ai-index="' + idx + '"' + checked + '>'
                                        + '<span class="ai-input-var-name">' + escapeHtml(name) + '</span>'
                                        + '<span class="ai-input-var-layer">' + info.layer + '</span>'
                                        + '<span class="ai-input-var-preview">' + escapeHtml(preview) + '</span>'
                                        + '</label>';
                                });
                                var wildChecked = currentInputs.indexOf('*') !== -1 ? ' checked' : '';
                                html += '<label class="ai-input-checkbox-item ai-input-wildcard">'
                                    + '<input type="checkbox" class="ai-input-var-check" value="*" data-ai-index="' + idx + '"' + wildChecked + '>'
                                    + '<span class="ai-input-var-name">* (all variables)</span>'
                                    + '</label>';
                                listEl.innerHTML = html;

                                // Bind checkbox change handlers
                                listEl.querySelectorAll('.ai-input-var-check').forEach(function (cb) {
                                    cb.addEventListener('change', function () {
                                        var cbIdx = parseInt(this.dataset.aiIndex, 10);
                                        var list = listEl.querySelectorAll('.ai-input-var-check:checked');
                                        var selected = [];
                                        list.forEach(function (c) { selected.push(c.value); });
                                        updateBlockField(cbIdx, '@input', selected.length > 0 ? selected.join(', ') : '');
                                        // Update toggle button badge
                                        updateVarsToggleBadge(container, cbIdx);
                                    });
                                });
                            }
                        }
                    }
                    panel.style.display = isVisible ? 'none' : '';
                }
            });
        });

        // Helper: update the 🔗 Vars button badge text
        function updateVarsToggleBadge(container, idx) {
            var text = M.markdownEditor ? M.markdownEditor.value : '';
            var blocks = parseDocgenBlocks(text);
            if (idx >= blocks.length) return;
            var block = blocks[idx];
            var varName = block.varName || '';
            var inputCount = block.inputVars ? block.inputVars.length : 0;
            var toggle = container.querySelector('.ai-vars-toggle[data-ai-index="' + idx + '"]');
            if (toggle) {
                var label = '🔗';
                if (varName) label += ' ' + varName;
                if (inputCount > 0) label += ' +' + inputCount;
                toggle.textContent = label;
                toggle.classList.toggle('active', !!(varName || inputCount));
            }
        }

        // @var input — blur or Enter syncs variable name to editor
        container.querySelectorAll('.ai-var-input').forEach(function (input) {
            function syncVar() {
                var idx = parseInt(input.dataset.aiIndex, 10);
                var val = input.value.trim().replace(/\s+/g, '_');
                input.value = val;
                updateBlockField(idx, '@var', val);
                updateVarsToggleBadge(container, idx);
            }
            input.addEventListener('blur', syncVar);
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    syncVar();
                }
            });
        });

        // @var clear — ✕ button clears the variable name
        container.querySelectorAll('.ai-var-clear').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                var panel = this.closest('.ai-vars-panel');
                var input = panel ? panel.querySelector('.ai-var-input') : null;
                if (input) input.value = '';
                updateBlockField(idx, '@var', '');
                updateVarsToggleBadge(container, idx);
            });
        });

        // Helper: get current @use: sources for a block
        function getBlockUseSources(blockIndex) {
            var text = M.markdownEditor ? M.markdownEditor.value : '';
            var blocks = parseDocgenBlocks(text);
            if (blockIndex < blocks.length && blocks[blockIndex].useMemory) {
                return blocks[blockIndex].useMemory;
            }
            return [];
        }

        // Helper: update the @use: field in the editor for a block
        function updateBlockUseField(blockIndex, selectedSources) {
            var text = M.markdownEditor ? M.markdownEditor.value : '';
            var blocks = parseDocgenBlocks(text);
            if (blockIndex >= blocks.length) return;
            var block = blocks[blockIndex];

            // Build the new @use: line
            var useLine = selectedSources.length > 0 ? '@use: ' + selectedSources.join(', ') : '';

            // Get the raw tag content
            var tagContent = text.substring(block.start, block.end);
            var innerStart = tagContent.indexOf(':') + 1;
            var innerEnd = tagContent.lastIndexOf('}}');
            var inner = tagContent.substring(innerStart, innerEnd).trim();

            // Remove existing @use: line
            inner = inner.replace(/^@use:\s*.+$/m, '').trim();

            // Check if @prompt: keyword is present
            var hasPromptKey = /^@prompt:\s*/m.test(inner);

            // Rebuild tag with proper structure
            var tagType = block.type;
            var newTag;
            if (useLine && hasPromptKey) {
                // Multi-line: @use + @prompt
                newTag = '{{@' + tagType + ':\n  ' + useLine + '\n  ' + inner + '\n}}';
            } else if (useLine) {
                // @use + bare prompt
                newTag = '{{@' + tagType + ': ' + useLine + '\n' + inner + ' }}';
            } else {
                newTag = '{{@' + tagType + ': ' + inner + ' }}';
            }

            M.markdownEditor.value = text.substring(0, block.start) + newTag + text.substring(block.end);

            // Update the @use: hint badge on the card
            var card = container.querySelector('.ai-placeholder-card[data-ai-index="' + blockIndex + '"]');
            if (card) {
                var hintEl = card.querySelector('.ai-use-hint');
                if (selectedSources.length > 0) {
                    if (!hintEl) {
                        hintEl = document.createElement('span');
                        hintEl.className = 'ai-use-hint';
                        var label = card.querySelector('.ai-placeholder-label');
                        if (label) label.after(hintEl);
                    }
                    hintEl.textContent = '📚 ' + selectedSources.join(', ');
                } else if (hintEl) {
                    hintEl.remove();
                }
            }
        }

        // Toggle memory selector dropdown
        container.querySelectorAll('.ai-memory-select-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                var dropdown = container.querySelector('.ai-memory-dropdown[data-ai-index="' + idx + '"]');
                if (!dropdown) return;

                var isOpen = dropdown.style.display !== 'none';
                // Close all open dropdowns first
                container.querySelectorAll('.ai-memory-dropdown').forEach(function (d) { d.style.display = 'none'; });

                if (isOpen) return;

                dropdown.style.display = 'block';

                // Populate sources
                var listEl = dropdown.querySelector('.ai-memory-source-list');
                if (!listEl) return;
                listEl.innerHTML = '<span class="ai-memory-loading">Loading…</span>';

                var currentSources = getBlockUseSources(idx);
                var docNames = getDocMemoryNames();

                if (!M._memory || !M._memory.listAllSources) {
                    // Fallback: show workspace + doc Memory tags even without M._memory
                    var fallbackHtml = '<label class="ai-memory-checkbox-item">'
                        + '<input type="checkbox" value="workspace" ' + (currentSources.indexOf('workspace') !== -1 ? 'checked' : '') + '> workspace</label>';
                    docNames.forEach(function (dn) {
                        var ck = currentSources.indexOf(dn) !== -1 ? ' checked' : '';
                        fallbackHtml += '<label class="ai-memory-checkbox-item">'
                            + '<input type="checkbox" value="' + escapeHtml(dn) + '"' + ck + '> '
                            + escapeHtml(dn) + ' <small class="ai-mem-badge">doc</small></label>';
                    });
                    listEl.innerHTML = fallbackHtml;
                    // Bind checkbox changes for fallback
                    listEl.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
                        cb.addEventListener('change', function () {
                            var selected = [];
                            listEl.querySelectorAll('input[type="checkbox"]:checked').forEach(function (c) {
                                selected.push(c.value);
                            });
                            updateBlockUseField(idx, selected);
                        });
                    });
                    return;
                }

                M._memory.listAllSources(docNames).then(function (sources) {
                    var html = '';
                    sources.forEach(function (src) {
                        var checked = currentSources.indexOf(src.name) !== -1 ? ' checked' : '';
                        var badge = src.origin === 'document' ? ' <small class="ai-mem-badge">doc</small>'
                            : src.origin === 'stored' ? ' <small class="ai-mem-badge">saved</small>' : '';
                        html += '<label class="ai-memory-checkbox-item">'
                            + '<input type="checkbox" value="' + escapeHtml(src.name) + '"' + checked + '> '
                            + escapeHtml(src.name) + badge + '</label>';
                    });
                    listEl.innerHTML = html || '<span class="ai-memory-loading">No sources available</span>';

                    // Bind checkbox changes
                    listEl.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
                        cb.addEventListener('change', function () {
                            var selected = [];
                            listEl.querySelectorAll('input[type="checkbox"]:checked').forEach(function (c) {
                                selected.push(c.value);
                            });
                            updateBlockUseField(idx, selected);
                        });
                    });
                });
            });
        });

        // Close dropdown on outside click (skip during attach operations)
        var _memoryAttaching = false;
        document.addEventListener('click', function (e) {
            if (_memoryAttaching) return;
            if (!e.target.closest('.ai-memory-dropdown') && !e.target.closest('.ai-memory-select-btn')) {
                container.querySelectorAll('.ai-memory-dropdown').forEach(function (d) { d.style.display = 'none'; });
            }
        });

        // Quick-attach Folder from AI/Agent card — auto-names from folder
        container.querySelectorAll('.ai-memory-quick-folder').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                if (!M._memory) { M.showToast('Memory engine not loaded yet.', 'warning'); return; }

                // Use a temp name — will be replaced with actual folder name
                var tempName = 'folder-' + Date.now();

                btn.disabled = true;
                btn.textContent = '⏳ Scanning...';
                _memoryAttaching = true;
                M._memory.attachFolder(tempName).then(function (info) {
                    // Rename to actual folder name (sanitized)
                    var name = info.folderName.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9\-_]/g, '');
                    if (!name) name = tempName;

                    M.showToast('📚 Indexed ' + info.chunkCount + ' chunks from "' + info.folderName + '"', 'success');
                    // Add to checked sources
                    var current = getBlockUseSources(idx);
                    if (current.indexOf(name) === -1) current.push(name);
                    updateBlockUseField(idx, current);
                    // Refresh dropdown
                    var selBtn = container.querySelector('.ai-memory-select-btn[data-ai-index="' + idx + '"]');
                    if (selBtn) selBtn.click();
                }).catch(function (err) {
                    if (err.name !== 'AbortError') M.showToast('Failed: ' + err.message, 'error');
                }).finally(function () {
                    _memoryAttaching = false;
                    btn.disabled = false;
                    btn.textContent = '📂 Folder';
                });
            });
        });

        // Quick-attach Files from AI/Agent card — auto-names
        container.querySelectorAll('.ai-memory-quick-files').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.aiIndex, 10);
                if (!M._memory) { M.showToast('Memory engine not loaded yet.', 'warning'); return; }

                var name = 'files-' + Math.random().toString(36).substring(2, 7);

                btn.disabled = true;
                btn.textContent = '⏳ Reading...';
                _memoryAttaching = true;
                M._memory.attachFiles(name).then(function (info) {
                    M.showToast('📚 Added ' + info.addedChunks + ' chunks', 'success');
                    var current = getBlockUseSources(idx);
                    if (current.indexOf(name) === -1) current.push(name);
                    updateBlockUseField(idx, current);
                    var selBtn = container.querySelector('.ai-memory-select-btn[data-ai-index="' + idx + '"]');
                    if (selBtn) selBtn.click();
                }).catch(function (err) {
                    if (err.name !== 'AbortError') M.showToast('Failed: ' + err.message, 'error');
                }).finally(function () {
                    _memoryAttaching = false;
                    btn.disabled = false;
                    btn.textContent = '📄 Files';
                });
            });
        });

        // API key prompt when selecting a search provider that requires one (from pill checkboxes)
        container.querySelectorAll('.ai-card-search-check').forEach(function (cb) {
            cb.addEventListener('change', function () {
                if (!this.checked) return; // only prompt on activation
                var providerId = this.value;
                if (!M.webSearch || providerId === 'duckduckgo' || providerId === 'wikipedia' || providerId === 'wikidata') return;

                var p = M.webSearch.PROVIDERS[providerId];
                if (!p || !p.requiresKey) return;

                // Check if key exists already
                var existingKey = M.webSearch.getProviderKey(providerId);
                if (existingKey) return; // already configured

                // Prompt for key using existing API key modal
                var checkboxEl = this;
                var modal = document.getElementById('ai-apikey-modal');
                var titleEl = document.getElementById('ai-apikey-title');
                var descEl = document.getElementById('ai-apikey-desc');
                var inputEl = document.getElementById('ai-groq-key-input');
                var linkEl = document.getElementById('ai-apikey-link');
                var iconEl = document.getElementById('ai-apikey-icon');
                var errorEl = document.getElementById('ai-apikey-error');

                if (!modal || !inputEl) {
                    checkboxEl.checked = false;
                    checkboxEl.dispatchEvent(new Event('change', { bubbles: true }));
                    return;
                }

                if (titleEl) titleEl.textContent = p.dialogTitle || 'API Key';
                if (descEl) descEl.textContent = p.dialogDesc || 'Enter your API key';
                if (iconEl) iconEl.className = p.icon || 'bi bi-key';
                if (linkEl) {
                    linkEl.href = p.dialogLink || '#';
                    linkEl.textContent = p.dialogLinkText || 'Get API key';
                }
                inputEl.value = '';
                inputEl.placeholder = p.dialogPlaceholder || 'API key...';
                if (errorEl) errorEl.style.display = 'none';
                modal.style.display = 'flex';

                var saveBtn = document.getElementById('ai-apikey-save');
                var cancelBtn = document.getElementById('ai-apikey-cancel');
                function onSave() {
                    var key = inputEl.value.trim();
                    if (key) {
                        M.webSearch.setProviderKey(providerId, key);
                    } else {
                        checkboxEl.checked = false;
                        checkboxEl.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    modal.style.display = 'none';
                    cleanup();
                }
                function onCancel() {
                    checkboxEl.checked = false;
                    checkboxEl.dispatchEvent(new Event('change', { bubbles: true }));
                    modal.style.display = 'none';
                    cleanup();
                }
                function cleanup() {
                    saveBtn.removeEventListener('click', onSave);
                    cancelBtn.removeEventListener('click', onCancel);
                }
                saveBtn.addEventListener('click', onSave, { once: true });
                cancelBtn.addEventListener('click', onCancel, { once: true });
            });
        });
    }

    // ==============================================
    // M._docgen — Internal namespace for cross-module access
    // Used by ai-docgen-generate.js and ai-docgen-ui.js
    // ==============================================
    M._docgen = {
        activeBlockOps: activeBlockOps,
        blockUploads: blockUploads,
        MAX_UPLOADS_PER_BLOCK: MAX_UPLOADS_PER_BLOCK,
        get abortRequested() { return abortRequested; },
        set abortRequested(v) { abortRequested = v; },
        get pendingReview() { return pendingReview; },
        set pendingReview(v) { pendingReview = v; },
        get fillAllQueue() { return fillAllQueue; },
        set fillAllQueue(v) { fillAllQueue = v; },
        parseDocgenBlocks: parseDocgenBlocks,
        escapeHtml: escapeHtml,
    };

    // ==============================================
    // REGISTER TOOLBAR ACTIONS (tag insertion)
    // ==============================================
    M.registerFormattingAction('ai-tag', function () { insertDocgenTag('AI'); });
    M.registerFormattingAction('think-tag', function () { insertDocgenTag('AI'); }); // Think is now a toggle on AI cards
    M.registerFormattingAction('image-tag', function () { insertDocgenTag('Image'); });
    M.registerFormattingAction('agent-tag', function () { insertDocgenTag('Agent'); });
    M.registerFormattingAction('memory-tag', function () { insertDocgenTag('Memory'); });
    M.registerFormattingAction('ocr-tag', function () { insertDocgenTag('OCR'); });
    M.registerFormattingAction('translate-tag', function () { insertDocgenTag('Translate'); });
    M.registerFormattingAction('tts-tag', function () { insertDocgenTag('TTS'); });
    M.registerFormattingAction('stt-tag', function () { insertDocgenTag('STT'); });

    // ==============================================
    // EXPOSE FOR RENDERER
    // ==============================================
    M.transformDocgenMarkdown = transformDocgenMarkdown;
    M.bindDocgenPreviewActions = bindDocgenPreviewActions;
    M.parseDocgenBlocks = parseDocgenBlocks;

    // Trigger re-render now that docgen is loaded.
    // The initial render (phase 2) happens before this module loads (phase 3e),
    // so tags display as raw text until we re-render here.
    if (M.markdownEditor) {
        M.markdownEditor.dispatchEvent(new Event('input'));
    }

})(window.MDView);
