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
    // TAGGING — wrap selection with {{AI:}}, {{Image:}}, etc.
    // ==============================================
    function insertDocgenTag(type) {
        if (type === 'Agent') {
            M.wrapSelectionWith('{{@Agent:\n  @step 1: ', '\n  @step 2: describe the next step\n}}', 'describe this step');
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
            M.wrapSelectionWith('{{@OCR:\n  @mode: text\n  @prompt: ', '\n}}', 'describe what to extract from the image');
            return;
        }
        if (type === 'Translate') {
            M.wrapSelectionWith('{{@Translate:\n  @prompt: ', '\n  @lang: Japanese\n}}', 'text to translate');
            return;
        }
        if (type === 'TTS') {
            M.wrapSelectionWith('{{@TTS:\n  @prompt: ', '\n  @lang: English\n}}', 'text to speak aloud');
            return;
        }

        var placeholder = type === 'Image'
            ? 'describe the image to generate'
            : 'describe what to generate';
        if (type === 'AI') {
            M.wrapSelectionWith('{{@AI:\n  @prompt: ', '\n}}', placeholder);
        } else if (type === 'Image') {
            M.wrapSelectionWith('{{@Image: ', '}}', placeholder);
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
        var re = /\{\{@?(AI|Think|Image|Agent|Memory|OCR|Translate|TTS):\s*([\s\S]*?)\}\}/g;
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
                // Backward compat: treat {{Think:}} as {{AI:}} with @think: yes
                if (block.type === 'Think') {
                    block.type = 'AI';
                    block.think = true;
                }
                // Parse @mode: field for OCR blocks
                if (block.type === 'OCR') {
                    var modeMatch = block.prompt.match(/^(?:@mode|Mode):\s*(text|svg)$/mi);
                    block.ocrMode = modeMatch ? modeMatch[1].toLowerCase() : 'text';
                    block.prompt = block.prompt.replace(/^(?:@mode|Mode):\s*\S+$/mi, '').trim();
                }
                // Parse @lang: field for Translate blocks
                if (block.type === 'Translate' || block.type === 'TTS') {
                    var langMatch = block.prompt.match(/^(?:@lang|Lang):\s*(.+)$/mi);
                    block.targetLang = langMatch ? langMatch[1].trim() : (block.type === 'TTS' ? 'English' : 'Japanese');
                    block.prompt = block.prompt.replace(/^(?:@lang|Lang):\s*.+$/mi, '').trim();
                }
                // Parse @var: field — allows blocks to store output into a named variable
                var varMatch = block.prompt.match(/^\s*(?:@var|Var):\s*(\S+)$/mi);
                if (varMatch) {
                    block.varName = varMatch[1].trim();
                    block.prompt = block.prompt.replace(varMatch[0], '').trim();
                }
                // Parse @use, @think, @search, @prompt fields
                if (block.type !== 'Image' && block.type !== 'Memory') {
                    var useMatch = block.prompt.match(/^(?:@use|Use):\s*(.+)$/m);
                    if (useMatch) {
                        block.useMemory = useMatch[1].split(',').map(function (s) { return s.trim(); });
                        block.prompt = block.prompt.replace(useMatch[0], '').trim();
                    }
                    // Parse @think: yes/no field
                    var thinkMatch = block.prompt.match(/^(?:@think|Think):\s*(yes|no)$/mi);
                    if (thinkMatch) {
                        block.think = thinkMatch[1].toLowerCase() === 'yes';
                        block.prompt = block.prompt.replace(thinkMatch[0], '').trim();
                    } else if (block.think === undefined) {
                        block.think = false;
                    }
                    // Parse @search: field
                    var searchMatch = block.prompt.match(/^(?:@search|Search):\s*(\S+)$/mi);
                    if (searchMatch) {
                        block.search = searchMatch[1].toLowerCase();
                        block.prompt = block.prompt.replace(searchMatch[0], '').trim();
                    }
                    // Separate description (bare text) from @prompt: (actual AI instruction)
                    var promptMatch = block.prompt.match(/^(?:@prompt|Prompt):\s*(.*)$/m);
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
        var re = /\{\{@?(AI|Think|Image|Agent|Memory|OCR|Translate|TTS):\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        // Build model options for per-card selector
        var models = window.AI_MODELS || {};
        var modelIds = Object.keys(models);
        var currentModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : modelIds[0]) || modelIds[0];

        // Separate text and image model options
        var textModelOptionsHtml = '';
        var imageModelOptionsHtml = '';
        modelIds.forEach(function (id) {
            var m = models[id];
            var name = m.dropdownName || m.label || id;
            if (m.isImageModel) {
                var sel = id === 'imagen-ultra' ? ' selected' : '';
                imageModelOptionsHtml += '<option value="' + id + '"' + sel + '>' + name + '</option>';
            } else if (!m.isTtsModel) {
                // Exclude TTS-only models from text/translation model selectors
                var sel = id === currentModel ? ' selected' : '';
                textModelOptionsHtml += '<option value="' + id + '"' + sel + '>' + name + '</option>';
            }
        });
        var modelOptionsHtml = textModelOptionsHtml;
        // Image card shows both image generation models AND multimodal text models (for @upload vision analysis)
        var imageCardModelOpts = imageModelOptionsHtml;
        if (textModelOptionsHtml) {
            imageCardModelOpts += '<option disabled>──── Vision ────</option>' + textModelOptionsHtml;
        }
        var seenMemoryNames = {}; // Track used Memory names for dedup

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);

            var type = match[1];
            var prompt = match[2].trim();
            // Backward compat: treat Think as AI with @think: yes
            if (type === 'Think') type = 'AI';
            var thinkFieldMatch = prompt.match(/^(?:@think|Think):\s*(yes|no)$/mi);
            var hasThink = thinkFieldMatch ? thinkFieldMatch[1].toLowerCase() === 'yes' : (match[1] === 'Think');
            var icon = type === 'TTS' ? '🔊' : type === 'Translate' ? '🌐' : type === 'OCR' ? '🔍' : type === 'Image' ? '🖼️' : type === 'Agent' ? '🔗' : type === 'Memory' ? '📚' : '✨';
            var label = type === 'TTS' ? 'Text to Speech' : type === 'Translate' ? 'Translate' : type === 'OCR' ? 'OCR Scan' : type === 'Image' ? 'Image Generate' : type === 'Agent' ? 'Agent Flow' : type === 'Memory' ? 'Memory' : 'AI Generate';
            var cardModelOpts = type === 'Image' ? imageCardModelOpts : modelOptionsHtml;

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
                var ocrModeMatch = prompt.match(/^(?:@mode|Mode):\s*(text|svg)$/mi);
                var ocrMode = ocrModeMatch ? ocrModeMatch[1].toLowerCase() : 'text';
                var ocrDisplayText = prompt.replace(/^(?:@mode|Mode):\s*\S+$/mi, '').trim();
                // Strip metadata fields from display
                ocrDisplayText = ocrDisplayText.replace(/^(?:@think|Think):\s*(yes|no)$/mi, '').trim();
                ocrDisplayText = ocrDisplayText.replace(/^(?:@search|Search):\s*\S+$/mi, '').trim();
                ocrDisplayText = ocrDisplayText.replace(/^\s*@upload:\s*.+$/gmi, '').trim();

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
                    + '<button class="ai-placeholder-btn ai-upload-btn" data-ai-index="' + blockIndex + '" title="Upload image for OCR">📎</button>'
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

                // Build search provider options for the card
                var searchOpts = '<option value="off">🔍 Off</option>'
                    + '<option value="duckduckgo">🦆 DuckDuckGo</option>'
                    + '<option value="brave">🦁 Brave</option>'
                    + '<option value="serper">🔎 Serper</option>';

                // @use: hint for Agent
                var agentUseMatch = prompt.match(/^(?:@use|Use):\s*(.+)$/m);
                var agentUseHint = agentUseMatch ? '<span class="ai-use-hint">📚 ' + escapeHtml(agentUseMatch[1]) + '</span>' : '';

                // Parse @search field for Agent
                var agentSearchMatch = prompt.match(/^(?:@search|Search):\s*(\S+)$/mi);
                var agentSearchVal = agentSearchMatch ? agentSearchMatch[1].toLowerCase() : 'off';
                var searchOpts = '<option value="off"' + (agentSearchVal === 'off' ? ' selected' : '') + '>🔍 Off</option>'
                    + '<option value="duckduckgo"' + (agentSearchVal === 'duckduckgo' ? ' selected' : '') + '>🦆 DuckDuckGo</option>'
                    + '<option value="brave"' + (agentSearchVal === 'brave' ? ' selected' : '') + '>🦁 Brave</option>'
                    + '<option value="serper"' + (agentSearchVal === 'serper' ? ' selected' : '') + '>🔎 Serper</option>';

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
                    + '<span class="ai-placeholder-label">' + label + '</span>'
                    + agentUseHint
                    + '<div class="ai-placeholder-actions">'
                    + '<button class="ai-placeholder-btn ai-upload-btn" data-ai-index="' + blockIndex + '" title="Upload image for vision analysis">📎</button>'
                    + '<button class="ai-placeholder-btn ai-memory-select-btn" data-ai-index="' + blockIndex + '" title="Select memory sources">📚</button>'
                    + '<button class="ai-placeholder-btn ai-think-toggle' + (hasThink ? ' active' : '') + '" data-ai-index="' + blockIndex + '" title="Toggle thinking mode">🧠</button>'
                    + '<select class="ai-agent-search-select" data-ai-index="' + blockIndex + '" title="Search provider">' + searchOpts + '</select>'
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
                    + '<div class="ai-agent-steps">' + stepsHtml + '</div>'
                    + '</div>';
            } else if (type === 'Translate') {
                // Translate card — specialized for text translation + TTS
                var translateDisplayText = prompt;
                translateDisplayText = translateDisplayText.replace(/^\s*(?:@lang|Lang):\s*.+$/mi, '').trim();
                translateDisplayText = translateDisplayText.replace(/^\s*(?:@var|Var):\s*\S+$/mi, '').trim();
                translateDisplayText = translateDisplayText.replace(/^\s*@upload:\s*.+$/gmi, '').trim();

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

                var ttsHasPrompt = /^\s*(?:@prompt|Prompt):\s*/m.test(ttsDisplayText);
                var ttsPromptMatch = ttsDisplayText.match(/^\s*(?:@prompt|Prompt):\s*(.*)$/m);
                var ttsPromptVal = ttsPromptMatch ? ttsPromptMatch[1].trim() : '';
                // Resolve $(varName) from the Vars system at render time
                var ttsApiVars = window.__API_VARS || {};
                ttsPromptVal = ttsPromptVal.replace(/\$\(([^)]+)\)/g, function (full, vn) {
                    return ttsApiVars[vn] || full;  // keep $(var) if not yet set
                });
                var ttsDescText = ttsHasPrompt
                    ? ttsDisplayText.replace(ttsPromptMatch[0], '').trim()
                    : ttsDisplayText;
                ttsDescText = ttsDescText.replace(/^\s*(?:@lang|Lang):\s*.+$/mi, '').trim();

                // Parse @lang
                var ttsLangMatch = prompt.match(/^\s*(?:@lang|Lang):\s*(.+)$/mi);
                var ttsCurrentLang = ttsLangMatch ? ttsLangMatch[1].trim() : 'English';

                // Language dropdown — Kokoro for EN/ZH, Web Speech API for rest
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
                    + '<button class="ai-placeholder-btn ai-fill-one ai-tts-play" data-ai-index="' + blockIndex + '" title="Play audio">▶ Play</button>'
                    + '<button class="ai-placeholder-btn ai-tts-stop" data-ai-index="' + blockIndex + '" title="Stop" style="display:none">■ Stop</button>'
                    + '<button class="ai-placeholder-btn ai-remove-tag" data-ai-index="' + blockIndex + '" title="Remove tag">✕</button>'
                    + '</div></div>'
                    + (ttsDescText ? '<div class="ai-placeholder-prompt ai-placeholder-prompt-static">' + escapeHtml(ttsDescText) + '</div>' : '')
                    + (ttsHasPrompt
                        ? '<div class="ai-placeholder-prompt"><textarea class="ai-card-prompt-input" data-ai-index="' + blockIndex + '" placeholder="Enter text to speak aloud\u2026" rows="2">' + escapeHtml(ttsPromptVal) + '</textarea></div>'
                        : '')
                    + '</div>';
            } else {
                // Extract @use and strip @ fields from display
                var useMatch = prompt.match(/^(?:@use|Use):\s*(.+)$/m);
                var useHint = useMatch ? '<span class="ai-use-hint">📚 ' + escapeHtml(useMatch[1]) + '</span>' : '';
                var displayText = useMatch ? prompt.replace(useMatch[0], '').trim() : prompt;
                // Strip metadata fields from display
                displayText = displayText.replace(/^(?:@think|Think):\s*(yes|no)$/mi, '').trim();
                displayText = displayText.replace(/^(?:@search|Search):\s*\S+$/mi, '').trim();
                displayText = displayText.replace(/^\s*@upload:\s*.+$/gmi, '').trim();

                // Separate description (bare text) from @prompt: (editable)
                var hasPromptField = /^\s*(?:@prompt|Prompt):\s*/m.test(displayText);
                var promptFieldMatch = displayText.match(/^\s*(?:@prompt|Prompt):\s*(.*)$/m);
                var promptValue = promptFieldMatch ? promptFieldMatch[1].trim() : '';
                var descriptionText = hasPromptField
                    ? displayText.replace(promptFieldMatch[0], '').trim()
                    : displayText;

                // Parse @search field for AI card
                var searchFieldMatch = prompt.match(/^(?:@search|Search):\s*(\S+)$/mi);
                var cardSearchVal = searchFieldMatch ? searchFieldMatch[1].toLowerCase() : 'off';
                var aiSearchOpts = '<option value="off"' + (cardSearchVal === 'off' ? ' selected' : '') + '>🔍 Off</option>'
                    + '<option value="duckduckgo"' + (cardSearchVal === 'duckduckgo' ? ' selected' : '') + '>🦆 DuckDuckGo</option>'
                    + '<option value="brave"' + (cardSearchVal === 'brave' ? ' selected' : '') + '>🦁 Brave</option>'
                    + '<option value="serper"' + (cardSearchVal === 'serper' ? ' selected' : '') + '>🔎 Serper</option>';

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
                    + '<select class="ai-agent-search-select" data-ai-index="' + blockIndex + '" title="Search provider">' + aiSearchOpts + '</select>'
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
                    // TTS: play directly — don't go through AI generation
                    var ttsBlocks = M.parseDocgenBlocks(M.markdownEditor.value);
                    if (idx < ttsBlocks.length) {
                        var ttsBlock = ttsBlocks[idx];
                        var ttsText = ttsBlock.prompt || '';
                        // Resolve $(varName) references from the Vars system
                        var apiVars = window.__API_VARS || {};
                        ttsText = ttsText.replace(/\$\(([^)]+)\)/g, function (_, vn) {
                            return apiVars[vn] || '';
                        }).trim();
                        // Also check card textarea for latest user edits
                        var ttsPromptArea = card.querySelector('.ai-card-prompt-input');
                        if (ttsPromptArea && ttsPromptArea.value.trim()) {
                            var resolvedPrompt = ttsPromptArea.value.trim().replace(/\$\(([^)]+)\)/g, function (_, vn) {
                                return apiVars[vn] || '';
                            }).trim();
                            if (resolvedPrompt) ttsText = resolvedPrompt;
                        }
                        var ttsLangSel = card.querySelector('.ai-tts-lang-select');
                        var ttsLangName = ttsLangSel ? ttsLangSel.value : 'English';
                        console.log('[TTS Play] text="' + ttsText.substring(0, 80) + '", lang=' + ttsLangName);
                        // Pass the language name directly — worker VOICE_MAP accepts both codes and names
                        var ttsLangCode = ttsLangName.toLowerCase();
                        if (ttsText && M.tts && M.tts.speak) {
                            // Show stop button
                            var playBtn = card.querySelector('.ai-tts-play');
                            var stopBtn = card.querySelector('.ai-tts-stop');
                            if (playBtn) playBtn.style.display = 'none';
                            if (stopBtn) stopBtn.style.display = '';
                            card.classList.add('ai-tts-speaking');
                            M.tts.speak(ttsText, null, ttsLangCode);
                            M.showToast('🔊 Playing: "' + ttsText.substring(0, 40) + '…"', 'info');
                        } else if (!ttsText) {
                            M.showToast('⚠️ No text to speak — make sure the prompt has content.', 'warning');
                        } else if (!M.tts) {
                            M.showToast('🔊 TTS engine loading — please try again in a moment.', 'info');
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

        // TTS stop button — stop audio playback
        container.querySelectorAll('.ai-tts-stop').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (M.tts && M.tts.stop) M.tts.stop();
                var card = this.closest('.ai-tts-card');
                if (card) {
                    card.classList.remove('ai-tts-speaking');
                    var playBtn = card.querySelector('.ai-tts-play');
                    if (playBtn) playBtn.style.display = '';
                    this.style.display = 'none';
                }
            });
        });

        // Model selector change — trigger download consent for undownloaded local models
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
            });
        });

        // Upload button — 📎 opens file picker for image attachments
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
                var input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.addEventListener('change', function () {
                    var files = Array.from(input.files || []);
                    var remaining = MAX_UPLOADS_PER_BLOCK - existing.length;
                    files = files.slice(0, remaining);
                    var processed = 0;
                    files.forEach(function (file) {
                        var reader = new FileReader();
                        reader.onload = function () {
                            var dataUrl = reader.result;
                            var base64 = dataUrl.split(',')[1];
                            var mimeType = file.type || 'image/png';
                            if (!blockUploads.has(idx)) blockUploads.set(idx, []);
                            blockUploads.get(idx).push({ data: base64, mimeType: mimeType, name: file.name });
                            processed++;
                            if (processed === files.length) {
                                // Write @upload: lines into the tag text
                                addUploadFieldsToBlock(idx, files.map(function (f) { return f.name; }));
                                M.showToast('📎 ' + files.length + ' image(s) attached', 'success');
                            }
                        };
                        reader.readAsDataURL(file);
                    });
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
            var fieldRe = new RegExp('^\\s*' + fieldName + ':\\s*\\S+$', 'mi');
            inner = inner.replace(fieldRe, '').trim();

            // Add new field (if value is not empty/off/no)
            if (value && value !== 'off' && value !== 'no') {
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

        // Search change — sync dropdown to editor text
        container.querySelectorAll('.ai-agent-search-select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                var idx = parseInt(this.dataset.aiIndex, 10);
                var val = this.value;
                updateBlockField(idx, '@search', val === 'off' ? '' : val);
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

        // API key prompt when selecting a search provider that requires one
        container.querySelectorAll('.ai-agent-search-select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                var providerId = this.value;
                if (!M.webSearch || providerId === 'off' || providerId === 'duckduckgo') return;

                var p = M.webSearch.PROVIDERS[providerId];
                if (!p || !p.requiresKey) return;

                // Check if key exists already
                var existingKey = M.webSearch.getProviderKey(providerId);
                if (existingKey) return; // already configured

                // Prompt for key using existing API key modal
                var selectEl = this;
                var modal = document.getElementById('ai-apikey-modal');
                var titleEl = document.getElementById('ai-apikey-title');
                var descEl = document.getElementById('ai-apikey-desc');
                var inputEl = document.getElementById('ai-groq-key-input');
                var linkEl = document.getElementById('ai-apikey-link');
                var iconEl = document.getElementById('ai-apikey-icon');
                var errorEl = document.getElementById('ai-apikey-error');

                if (!modal || !inputEl) {
                    selectEl.value = 'off';
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
                        selectEl.value = 'off';
                    }
                    modal.style.display = 'none';
                    cleanup();
                }
                function onCancel() {
                    selectEl.value = 'off';
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
