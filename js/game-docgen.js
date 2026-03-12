// ============================================
// game-docgen.js — {{Game:}} Tag Component
// Standalone module — remove this file + its CSS + loader line to disable
// ============================================
(function (M) {
    'use strict';

    // ==============================================
    // CONSTANTS
    // ==============================================
    var GAME_TAG_RE = /\{\{@?Game:\s*([\s\S]*?)\}\}/g;
    var GAME_SYSTEM_PROMPTS = {
        threejs: 'You are an expert game developer specializing in Three.js. Generate a COMPLETE, standalone HTML file with an embedded 3D game.\n\nRequirements:\n- Include Three.js from CDN: <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/three.min.js"><\/script>\n- All CSS and JS must be inline (no external files except CDN libraries)\n- The game must be fully playable with keyboard and/or mouse controls\n- Use a full-viewport canvas that fills available space\n- Add a semi-transparent game instructions overlay (auto-hide after 5s)\n- Handle window resize events for responsive gameplay\n- Use requestAnimationFrame for smooth 60fps animation\n- Include score/lives/status HUD overlay\n- Add game over state with restart option\n- Use modern CSS (flexbox/grid, CSS variables for colors)\n- Make the visual style polished with lighting, shadows, or particle effects\n\nReturn ONLY the complete HTML document. Do NOT wrap in markdown code fences.',

        canvas2d: 'You are an expert game developer specializing in HTML5 Canvas 2D games. Generate a COMPLETE, standalone HTML file with an embedded 2D game.\n\nRequirements:\n- Use native HTML5 Canvas API (no external libraries)\n- All CSS and JS must be inline\n- The game must be fully playable with keyboard and/or mouse/touch controls\n- Canvas fills the available viewport\n- Add a semi-transparent game instructions overlay (auto-hide after 5s)\n- Handle window resize to scale the canvas\n- Use requestAnimationFrame for smooth animation\n- Include score/lives/status HUD drawn on canvas or as HTML overlay\n- Add game over state with restart option\n- Use vibrant colors and smooth animations\n- Support both desktop (keyboard) and mobile (touch) input\n\nReturn ONLY the complete HTML document. Do NOT wrap in markdown code fences.',

        p5js: 'You are an expert creative coder specializing in P5.js. Generate a COMPLETE, standalone HTML file with an interactive P5.js sketch or game.\n\nRequirements:\n- Include P5.js from CDN: <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"><\/script>\n- All CSS and JS must be inline (no external files except CDN libraries)\n- Use P5.js setup() and draw() functions properly\n- The sketch must be interactive with keyboard/mouse\n- Canvas fills available space using windowWidth/windowHeight\n- Implement windowResized() for responsive behavior\n- Add creative visual effects (particles, trails, color gradients)\n- Include a brief instruction overlay\n\nReturn ONLY the complete HTML document. Do NOT wrap in markdown code fences.'
    };

    var ENGINE_LABELS = {
        threejs: 'Three.js',
        canvas2d: 'Canvas 2D',
        p5js: 'P5.js'
    };

    // ==============================================
    // HELPERS
    // ==============================================
    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Detect fenced code ranges to avoid processing tags inside code blocks
    function getFencedRanges(md) {
        var ranges = [];
        var re = /(^|\n)(```+|~~~+)/g;
        var m, openIdx = -1;
        while ((m = re.exec(md)) !== null) {
            if (openIdx === -1) {
                openIdx = m.index;
            } else {
                ranges.push([openIdx, re.lastIndex]);
                openIdx = -1;
            }
        }
        return ranges;
    }

    function isInsideFence(idx, ranges) {
        for (var i = 0; i < ranges.length; i++) {
            if (idx >= ranges[i][0] && idx < ranges[i][1]) return true;
        }
        return false;
    }

    // Stores generated game HTML per block index (survives re-renders)
    var generatedGames = new Map();

    // ==============================================
    // TRANSFORM — convert {{Game:}} tags to card HTML
    // ==============================================
    function transformGameMarkdown(markdown) {
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?Game:\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        // Build model dropdown options
        var models = window.AI_MODELS || {};
        var modelIds = Object.keys(models);
        var currentModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : modelIds[0]) || modelIds[0];

        function buildModelOpts(selectedId) {
            var selId = selectedId || currentModel;
            var opts = '';
            modelIds.forEach(function (id) {
                var m = models[id];
                if (m.isImageModel || m.isTtsModel || m.isSttModel) return;
                var name = m.dropdownName || m.label || id;
                var sel = id === selId ? ' selected' : '';
                opts += '<option value="' + id + '"' + sel + '>' + name + '</option>';
            });
            return opts;
        }

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);
            var prompt = match[1].trim();

            // Parse fields — regexes use lookahead to support single-line tags
            // e.g. {{@Game: @engine: canvas2d @prebuilt: chess @prompt: Chess game}}
            var fieldEnd = '(?=\\s+@|\\s*$)';  // next @field or end of text
            var engineMatch = prompt.match(new RegExp('(?:^|\\s)(?:@engine|Engine):\\s*(\\S+)' + fieldEnd, 'mi'));
            var gameEngine = engineMatch ? engineMatch[1].trim().toLowerCase() : 'threejs';
            if (!ENGINE_LABELS[gameEngine]) gameEngine = 'threejs';

            var modelMatch = prompt.match(new RegExp('(?:^|\\s)(?:@model|Model):\\s*(\\S+)' + fieldEnd, 'mi'));
            var blockModelId = modelMatch ? modelMatch[1].trim() : null;
            if (blockModelId && models[blockModelId]) { /* valid */ } else { blockModelId = null; }

            // Check for @prebuilt: field
            var prebuiltMatch = prompt.match(new RegExp('(?:^|\\s)(?:@prebuilt|Prebuilt):\\s*(\\S+)' + fieldEnd, 'mi'));
            var prebuiltId = prebuiltMatch ? prebuiltMatch[1].trim().toLowerCase() : null;
            var prebuilts = window.__GAME_PREBUILTS || {};
            if (prebuiltId && prebuilts[prebuiltId]) {
                // Auto-store for playback
                generatedGames.set(blockIndex, prebuilts[prebuiltId]);
            }

            var cardModelOpts = buildModelOpts(blockModelId);

            // Strip metadata from display
            var displayText = prompt;
            displayText = displayText.replace(new RegExp('(?:^|\\s)(?:@engine|Engine):\\s*\\S+' + fieldEnd, 'mi'), '').trim();
            displayText = displayText.replace(new RegExp('(?:^|\\s)(?:@model|Model):\\s*\\S+' + fieldEnd, 'mi'), '').trim();
            displayText = displayText.replace(new RegExp('(?:^|\\s)(?:@var|Var):\\s*\\S+' + fieldEnd, 'mi'), '').trim();
            displayText = displayText.replace(new RegExp('(?:^|\\s)(?:@prebuilt|Prebuilt):\\s*\\S+' + fieldEnd, 'mi'), '').trim();

            var hasPromptField = /(?:^|\s)(?:@prompt|Prompt):\s*/m.test(displayText);
            var promptFieldMatch = displayText.match(/(?:^|\s)(?:@prompt|Prompt):\s*(.*?)$/m);
            var promptVal = promptFieldMatch ? promptFieldMatch[1].trim() : '';
            var descText = hasPromptField
                ? displayText.replace(promptFieldMatch[0], '').trim()
                : displayText;

            // Engine pills
            var pillsHtml = '<div class="ai-game-engine-pills" data-game-index="' + blockIndex + '">';
            [{ id: 'threejs', name: 'Three.js' }, { id: 'canvas2d', name: 'Canvas 2D' }, { id: 'p5js', name: 'P5.js' }]
                .forEach(function (eo) {
                    var cls = eo.id === gameEngine ? ' active' : '';
                    pillsHtml += '<button class="ai-game-engine-pill' + cls + '" data-engine="' + eo.id + '" data-game-index="' + blockIndex + '">' + eo.name + '</button>';
                });
            pillsHtml += '</div>';

            // Has a previously generated game?
            var hasGame = generatedGames.has(blockIndex);

            result += '<div class="ai-game-card" data-game-index="' + blockIndex + '" data-game-engine="' + escapeHtml(gameEngine) + '">'
                + '<div class="ai-game-header">'
                + '<span class="ai-game-icon">🎮</span>'
                + '<span class="ai-game-label">Game Builder</span>'
                + '<span class="ai-game-engine-badge">' + ENGINE_LABELS[gameEngine] + '</span>'
                + '<div class="ai-game-actions">'
                + '<select class="ai-game-model-select" data-game-index="' + blockIndex + '" title="Model for game generation">' + cardModelOpts + '</select>'
                + '<button class="ai-game-btn ai-game-generate" data-game-index="' + blockIndex + '" title="Generate game with AI">▶ Generate</button>'
                + '<button class="ai-game-btn ai-game-play" data-game-index="' + blockIndex + '" title="Play generated game"' + (hasGame ? '' : ' style="display:none"') + '>▶ Play</button>'
                + '<button class="ai-game-btn ai-game-export" data-game-index="' + blockIndex + '" title="Download as standalone HTML"' + (hasGame ? '' : ' style="display:none"') + '>📥 Export</button>'
                + '<button class="ai-game-btn ai-game-import" data-game-index="' + blockIndex + '" title="Paste your own game HTML code">📋 Import</button>'
                + '<button class="ai-game-btn ai-game-fullscreen" data-game-index="' + blockIndex + '" title="Fullscreen"' + (hasGame ? '' : ' style="display:none"') + '>⛶</button>'
                + '<button class="ai-game-btn ai-game-remove" data-game-index="' + blockIndex + '" title="Remove tag">✕</button>'
                + '</div></div>'
                + pillsHtml
                + (descText ? '<div class="ai-game-desc">' + escapeHtml(descText) + '</div>' : '')
                + (hasPromptField
                    ? '<div class="ai-game-prompt"><textarea class="ai-game-prompt-input" data-game-index="' + blockIndex + '" placeholder="Describe the game you want to build\u2026" rows="3">' + escapeHtml(promptVal) + '</textarea></div>'
                    : '')
                + '<div class="ai-game-preview" data-game-index="' + blockIndex + '"' + (hasGame ? '' : ' style="display:none"') + '></div>'
                + '</div>';

            blockIndex++;
            lastIndex = match.index + match[0].length;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // BIND — wire up card buttons after render
    // ==============================================
    function bindGamePreviewActions(container) {
        // ▶ Generate — call AI to produce game HTML
        container.querySelectorAll('.ai-game-generate').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gameIndex, 10);
                generateGame(idx, container);
            });
        });

        // ▶ Play — render game in iframe
        container.querySelectorAll('.ai-game-play').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gameIndex, 10);
                playGame(idx, container);
            });
        });

        // 📥 Export — download standalone HTML
        container.querySelectorAll('.ai-game-export').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gameIndex, 10);
                exportGame(idx);
            });
        });

        // ⛶ Fullscreen
        container.querySelectorAll('.ai-game-fullscreen').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gameIndex, 10);
                var preview = container.querySelector('.ai-game-preview[data-game-index="' + idx + '"]');
                if (preview) {
                    var iframe = preview.querySelector('iframe');
                    if (iframe && iframe.requestFullscreen) {
                        iframe.requestFullscreen();
                    } else if (preview.requestFullscreen) {
                        preview.requestFullscreen();
                    }
                }
            });
        });

        // 📋 Import — paste own game HTML
        container.querySelectorAll('.ai-game-import').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gameIndex, 10);
                showImportModal(idx, container);
            });
        });

        // ✕ Remove tag
        container.querySelectorAll('.ai-game-remove').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gameIndex, 10);
                removeGameTag(idx);
            });
        });

        // Engine pills
        container.querySelectorAll('.ai-game-engine-pill').forEach(function (pill) {
            pill.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gameIndex, 10);
                var newEngine = this.dataset.engine;

                // Update visual pills
                var pillContainer = this.parentNode;
                pillContainer.querySelectorAll('.ai-game-engine-pill').forEach(function (p) {
                    p.classList.remove('active');
                });
                this.classList.add('active');

                // Update card data
                var card = this.closest('.ai-game-card');
                if (card) {
                    card.dataset.gameEngine = newEngine;
                    var badge = card.querySelector('.ai-game-engine-badge');
                    if (badge) badge.textContent = ENGINE_LABELS[newEngine] || newEngine;
                }

                // Sync @engine: field in editor
                syncEngineToEditor(idx, newEngine);
            });
        });

        // Model select — trigger download/key if needed
        container.querySelectorAll('.ai-game-model-select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                var modelId = this.value;
                if (!modelId) return;
                var models = window.AI_MODELS || {};
                var modelInfo = models[modelId];

                if (modelInfo && modelInfo.isLocal && M._ai && M._ai.isLocalModel && M._ai.isLocalModel(modelId)) {
                    var ls = M._ai.getLocalState(modelId);
                    if (!ls.loaded && !ls.worker) {
                        var consentKey = M.KEYS.AI_CONSENTED_PREFIX + modelId;
                        var hasConsent = localStorage.getItem(consentKey);
                        if (hasConsent) {
                            M._ai.initAiWorker(modelId);
                        } else if (M.showModelDownloadPopup) {
                            M.showModelDownloadPopup(modelId);
                        }
                    }
                }

                var providers = M.getCloudProviders ? M.getCloudProviders() : {};
                var cloudProvider = providers[modelId];
                if (cloudProvider && !cloudProvider.getKey()) {
                    M.showApiKeyModal(modelId);
                }

                // Sync @model: to editor
                syncModelToEditor(parseInt(this.dataset.gameIndex, 10), modelId);
            });
        });

        // Prompt input sync
        container.querySelectorAll('.ai-game-prompt-input').forEach(function (ta) {
            var timer = null;
            ta.addEventListener('input', function () {
                var self = this;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    syncPromptToEditor(parseInt(self.dataset.gameIndex, 10), self.value);
                }, 400);
            });
            // Auto-resize
            ta.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
        });

        // Auto-play any previously generated games
        generatedGames.forEach(function (html, idx) {
            var preview = container.querySelector('.ai-game-preview[data-game-index="' + idx + '"]');
            if (preview && !preview.querySelector('iframe')) {
                renderGameInPreview(preview, html);
            }
        });
    }

    // ==============================================
    // GAME GENERATION — AI produces HTML
    // ==============================================
    async function generateGame(blockIndex, container) {
        var text = M.markdownEditor.value;
        var re = /\{\{@?Game:\s*([\s\S]*?)\}\}/g;
        var match, idx = 0;
        var block = null;
        while ((match = re.exec(text)) !== null) {
            if (idx === blockIndex) {
                block = {
                    type: 'Game',
                    prompt: match[1].trim(),
                    fullMatch: match[0],
                    start: match.index,
                    end: match.index + match[0].length
                };
                break;
            }
            idx++;
        }
        if (!block) return;

        // Get engine from card data
        var card = container.querySelector('.ai-game-card[data-game-index="' + blockIndex + '"]');
        var engine = card ? (card.dataset.gameEngine || 'threejs') : 'threejs';

        // Get selected model from card dropdown
        var cardSelect = card ? card.querySelector('.ai-game-model-select') : null;
        var perCardModel = cardSelect ? cardSelect.value : null;
        var originalModel = M.getCurrentAiModel ? M.getCurrentAiModel() : null;

        if (perCardModel && perCardModel !== originalModel && M.switchToModel) {
            M.switchToModel(perCardModel);
        }

        // Get prompt from textarea (may have been edited)
        var promptArea = card ? card.querySelector('.ai-game-prompt-input') : null;
        var userPrompt = promptArea ? promptArea.value.trim() : '';
        if (!userPrompt) {
            // Fallback to parsed prompt
            userPrompt = block.prompt
                .replace(/^\s*(?:@engine|Engine):\s*\S+$/mi, '')
                .replace(/^\s*(?:@model|Model):\s*\S+$/mi, '')
                .replace(/^\s*(?:@var|Var):\s*\S+$/mi, '')
                .replace(/^\s*(?:@prompt|Prompt):\s*/mi, '')
                .trim();
        }

        if (!userPrompt) {
            M.showToast && M.showToast('⚠️ Please describe the game you want to build.', 'warning');
            if (perCardModel && originalModel && perCardModel !== originalModel && M.switchToModel) {
                M.switchToModel(originalModel);
            }
            return;
        }

        // Show loading state
        var genBtn = card ? card.querySelector('.ai-game-generate') : null;
        var labelEl = card ? card.querySelector('.ai-game-label') : null;
        if (genBtn) { genBtn.disabled = true; genBtn.textContent = '⏳ Generating…'; }
        if (labelEl) { labelEl.dataset.origText = labelEl.textContent; labelEl.textContent = 'Generating…'; }
        if (card) card.classList.add('ai-game-loading');

        var systemPrompt = GAME_SYSTEM_PROMPTS[engine] || GAME_SYSTEM_PROMPTS.threejs;
        var fullPrompt = systemPrompt + '\n\nUser\'s game description:\n' + userPrompt;

        try {
            var result = await M.requestAiTask({
                taskType: 'generate',
                context: '',
                userPrompt: fullPrompt,
                enableThinking: false,
                silent: true
            });

            // Clean: strip markdown fences if present
            var cleaned = result;
            var fenceMatch = cleaned.match(/```(?:html)?\s*\n([\s\S]*?)```/);
            if (fenceMatch) cleaned = fenceMatch[1];
            cleaned = cleaned.trim();

            // Validate — must contain <html or <!DOCTYPE
            if (!cleaned.match(/<(!DOCTYPE|html)/i)) {
                // Try extracting if embedded in other text
                var htmlStart = cleaned.indexOf('<!DOCTYPE');
                if (htmlStart === -1) htmlStart = cleaned.indexOf('<html');
                if (htmlStart === -1) htmlStart = cleaned.indexOf('<HTML');
                if (htmlStart >= 0) {
                    cleaned = cleaned.substring(htmlStart);
                } else {
                    // Wrap in basic HTML shell
                    cleaned = '<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><title>Game</title></head>\n<body>\n' + cleaned + '\n</body>\n</html>';
                }
            }

            // Store and show Play/Export buttons
            generatedGames.set(blockIndex, cleaned);

            var playBtn = card ? card.querySelector('.ai-game-play') : null;
            var exportBtn = card ? card.querySelector('.ai-game-export') : null;
            var fsBtn = card ? card.querySelector('.ai-game-fullscreen') : null;
            if (playBtn) playBtn.style.display = '';
            if (exportBtn) exportBtn.style.display = '';
            if (fsBtn) fsBtn.style.display = '';

            // Auto-play
            playGame(blockIndex, container);

            M.showToast && M.showToast('🎮 Game generated! Click Play to start.', 'success');
        } catch (err) {
            M.showToast && M.showToast('❌ Game generation failed: ' + (err.message || 'Unknown error'), 'error');
        } finally {
            if (genBtn) { genBtn.disabled = false; genBtn.textContent = '▶ Generate'; }
            if (labelEl && labelEl.dataset.origText) labelEl.textContent = labelEl.dataset.origText;
            if (card) card.classList.remove('ai-game-loading');
            if (perCardModel && originalModel && perCardModel !== originalModel && M.switchToModel) {
                M.switchToModel(originalModel);
            }
        }
    }

    // ==============================================
    // PLAY — render game in sandboxed iframe
    // ==============================================
    function playGame(blockIndex, container) {
        var gameHtml = generatedGames.get(blockIndex);
        if (!gameHtml) {
            M.showToast && M.showToast('⚠️ No game generated yet. Click Generate first.', 'warning');
            return;
        }

        var preview = container.querySelector('.ai-game-preview[data-game-index="' + blockIndex + '"]');
        if (!preview) return;

        preview.style.display = '';
        renderGameInPreview(preview, gameHtml);
    }

    function renderGameInPreview(preview, html) {
        preview.innerHTML = '';
        var iframe = document.createElement('iframe');
        iframe.className = 'ai-game-iframe';
        iframe.sandbox = 'allow-scripts';
        iframe.setAttribute('allowfullscreen', '');
        iframe.srcdoc = html;
        preview.appendChild(iframe);
    }

    // ==============================================
    // EXPORT — download as standalone HTML
    // ==============================================
    function exportGame(blockIndex) {
        var gameHtml = generatedGames.get(blockIndex);
        if (!gameHtml) {
            M.showToast && M.showToast('⚠️ No game generated yet.', 'warning');
            return;
        }

        var blob = new Blob([gameHtml], { type: 'text/html' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'game-export-' + Date.now() + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        M.showToast && M.showToast('📥 Game exported as standalone HTML!', 'success');
    }

    // ==============================================
    // REMOVE — remove tag from editor
    // ==============================================
    function removeGameTag(blockIndex) {
        var text = M.markdownEditor.value;
        var re = /\{\{@?Game:\s*([\s\S]*?)\}\}/g;
        var match, idx = 0;
        while ((match = re.exec(text)) !== null) {
            if (idx === blockIndex) {
                M.markdownEditor.value = text.substring(0, match.index) + text.substring(match.index + match[0].length);
                M.markdownEditor.dispatchEvent(new Event('input'));
                generatedGames.delete(blockIndex);
                return;
            }
            idx++;
        }
    }

    // ==============================================
    // EDITOR SYNC — update tag fields in editor text
    // ==============================================
    function getGameBlocks(text) {
        var blocks = [];
        var re = /\{\{@?Game:\s*([\s\S]*?)\}\}/g;
        var m;
        while ((m = re.exec(text)) !== null) {
            blocks.push({ start: m.index, end: m.index + m[0].length, content: m[0], inner: m[1] });
        }
        return blocks;
    }

    function syncEngineToEditor(blockIndex, newEngine) {
        var text = M.markdownEditor ? M.markdownEditor.value : '';
        var blocks = getGameBlocks(text);
        if (blockIndex >= blocks.length) return;
        var block = blocks[blockIndex];
        var tagContent = block.content;
        var engineRe = /^(\s*)(?:@engine|Engine):\s*\S+$/mi;
        var newTag;
        if (engineRe.test(tagContent)) {
            newTag = tagContent.replace(engineRe, '$1@engine: ' + newEngine);
        } else {
            var colonIdx = tagContent.indexOf(':');
            newTag = tagContent.substring(0, colonIdx + 1)
                + '\n  @engine: ' + newEngine
                + tagContent.substring(colonIdx + 1);
        }
        M.markdownEditor.value = text.substring(0, block.start) + newTag + text.substring(block.end);
    }

    function syncModelToEditor(blockIndex, modelId) {
        var text = M.markdownEditor ? M.markdownEditor.value : '';
        var blocks = getGameBlocks(text);
        if (blockIndex >= blocks.length) return;
        var block = blocks[blockIndex];
        var tagContent = block.content;
        var modelRe = /^(\s*)(?:@model|Model):\s*\S+$/mi;
        var newTag;
        if (modelRe.test(tagContent)) {
            newTag = tagContent.replace(modelRe, '$1@model: ' + modelId);
        } else {
            var colonIdx = tagContent.indexOf(':');
            newTag = tagContent.substring(0, colonIdx + 1)
                + '\n  @model: ' + modelId
                + tagContent.substring(colonIdx + 1);
        }
        M.markdownEditor.value = text.substring(0, block.start) + newTag + text.substring(block.end);
    }

    function syncPromptToEditor(blockIndex, newPrompt) {
        var text = M.markdownEditor ? M.markdownEditor.value : '';
        var blocks = getGameBlocks(text);
        if (blockIndex >= blocks.length) return;
        var block = blocks[blockIndex];
        var tagContent = block.content;
        var promptRe = /^(\s*)(?:@prompt|Prompt):\s*(.*)$/mi;
        var newTag;
        if (promptRe.test(tagContent)) {
            newTag = tagContent.replace(promptRe, '$1@prompt: ' + newPrompt.trim());
        } else {
            // Insert before closing }}
            var closingIdx = tagContent.lastIndexOf('}}');
            newTag = tagContent.substring(0, closingIdx)
                + '  @prompt: ' + newPrompt.trim() + '\n'
                + tagContent.substring(closingIdx);
        }
        M.markdownEditor.value = text.substring(0, block.start) + newTag + text.substring(block.end);
    }

    // ==============================================
    // IMPORT — paste external game HTML
    // ==============================================
    function showImportModal(blockIndex, container) {
        // Remove existing modal
        var old = document.getElementById('game-import-modal');
        if (old) old.remove();

        var overlay = document.createElement('div');
        overlay.id = 'game-import-modal';
        overlay.className = 'ai-game-import-overlay';
        overlay.innerHTML =
            '<div class="ai-game-import-dialog">' +
            '<div class="ai-game-import-header">' +
            '<span>📋 Import Game Code</span>' +
            '<button class="ai-game-import-close" title="Close">✕</button>' +
            '</div>' +
            '<div class="ai-game-import-body">' +
            '<p class="ai-game-import-hint">Paste a complete HTML game below, or upload an <code>.html</code> file.</p>' +
            '<textarea class="ai-game-import-code" placeholder="<!DOCTYPE html>\n<html>\n<head>...</head>\n<body>\n  <!-- Your game code here -->\n</body>\n</html>" spellcheck="false"></textarea>' +
            '<div class="ai-game-import-actions">' +
            '<label class="ai-game-btn ai-game-import-file-label" title="Upload .html file">📂 Upload File' +
            '<input type="file" accept=".html,.htm" class="ai-game-import-file" style="display:none">' +
            '</label>' +
            '<button class="ai-game-btn ai-game-import-run" disabled>▶ Run</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('active'); });

        var textarea = overlay.querySelector('.ai-game-import-code');
        var runBtn = overlay.querySelector('.ai-game-import-run');
        var fileInput = overlay.querySelector('.ai-game-import-file');

        // Pre-fill with existing game code (from @prebuilt: or AI generation)
        var existingHtml = generatedGames.get(blockIndex);
        if (existingHtml) {
            textarea.value = existingHtml;
            runBtn.disabled = false;
            overlay.querySelector('.ai-game-import-header span').textContent = '📋 View / Edit Game Code';
            overlay.querySelector('.ai-game-import-hint').textContent = 'This is the current game\u2019s source code. Edit it or paste new code, then click Run.';
        }

        // Enable Run button when there's content
        textarea.addEventListener('input', function () {
            runBtn.disabled = !textarea.value.trim();
        });

        // File upload
        fileInput.addEventListener('change', function () {
            var file = this.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function (e) {
                textarea.value = e.target.result;
                runBtn.disabled = false;
            };
            reader.readAsText(file);
        });

        // Run — store HTML and play
        runBtn.addEventListener('click', function () {
            var html = textarea.value.trim();
            if (!html) return;

            // Wrap in HTML shell if needed
            if (!html.match(/<(!DOCTYPE|html)/i)) {
                html = '<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><title>Game</title></head>\n<body>\n' + html + '\n</body>\n</html>';
            }

            generatedGames.set(blockIndex, html);
            close();

            // Show Play/Export/Fullscreen buttons
            var card = container.querySelector('.ai-game-card[data-game-index="' + blockIndex + '"]');
            if (card) {
                var playBtn = card.querySelector('.ai-game-play');
                var exportBtn = card.querySelector('.ai-game-export');
                var fsBtn = card.querySelector('.ai-game-fullscreen');
                if (playBtn) playBtn.style.display = '';
                if (exportBtn) exportBtn.style.display = '';
                if (fsBtn) fsBtn.style.display = '';
            }

            playGame(blockIndex, container);
            M.showToast && M.showToast('🎮 Game imported and running!', 'success');
        });

        // Close handlers
        function close() {
            overlay.classList.remove('active');
            setTimeout(function () { overlay.remove(); }, 200);
        }
        overlay.querySelector('.ai-game-import-close').addEventListener('click', close);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler, true); }
        }, true);

        // Focus textarea
        setTimeout(function () { textarea.focus(); }, 100);
    }

    // ==============================================
    // TAG INSERTION — toolbar action
    // ==============================================
    function insertGameTag() {
        var defaultModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : '') || 'gemini-flash';
        M.wrapSelectionWith(
            '{{@Game:\n  @model: ' + defaultModel + '\n  @engine: threejs\n  @prompt: ',
            '\n}}',
            'describe the game you want to build'
        );
    }

    // ==============================================
    // EXPOSE ON M — for renderer.js to call
    // ==============================================
    M.transformGameMarkdown = transformGameMarkdown;
    M.bindGamePreviewActions = bindGamePreviewActions;

    // Register toolbar action
    if (M.registerFormattingAction) {
        M.registerFormattingAction('game-tag', insertGameTag);
    }

    // Trigger re-render now that game tags are loaded
    if (M.markdownEditor) {
        M.markdownEditor.dispatchEvent(new Event('input'));
    }

})(window.MDView);
