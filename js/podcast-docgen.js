// ============================================
// podcast-docgen.js — {{@Podcast:}} Tag Component
// AI-powered podcast generator with web search
// research, multi-speaker script, Kokoro TTS.
// ============================================
(function (M) {
    'use strict';

    // ==============================================
    // CONSTANTS
    // ==============================================
    var PODCAST_TAG_RE = /\{\{@?Podcast:\s*([\s\S]*?)\}\}/g;

    var SPEAKER_VOICES = {
        1: [{ name: 'Host', voice: 'af_bella', label: '🎤 Host' }],
        2: [
            { name: 'Host', voice: 'af_bella', label: '🎤 Host (♀)' },
            { name: 'Guest', voice: 'am_adam', label: '🎙 Guest (♂)' }
        ],
        3: [
            { name: 'Host', voice: 'af_bella', label: '🎤 Host (♀)' },
            { name: 'Expert', voice: 'am_adam', label: '🎙 Expert (♂)' },
            { name: 'Analyst', voice: 'bf_emma', label: '🗣 Analyst (♀)' }
        ],
        4: [
            { name: 'Host', voice: 'af_bella', label: '🎤 Host (♀)' },
            { name: 'Expert1', voice: 'am_adam', label: '🎙 Expert1 (♂)' },
            { name: 'Expert2', voice: 'bf_emma', label: '🗣 Expert2 (♀)' },
            { name: 'Expert3', voice: 'bm_daniel', label: '💬 Expert3 (♂)' }
        ]
    };

    var STYLES = {
        debate: { name: 'Debate', emoji: '⚔️', desc: 'Two sides argue different viewpoints' },
        interview: { name: 'Interview', emoji: '🎤', desc: 'Host interviews a guest expert' },
        conversational: { name: 'Chat', emoji: '💬', desc: 'Casual, friendly discussion' },
        lecture: { name: 'Lecture', emoji: '🎓', desc: 'Single speaker educational talk' },
        storytelling: { name: 'Story', emoji: '📖', desc: 'Narrative-driven exploration' }
    };

    // Store generated podcast data per block index
    var generatedPodcasts = new Map();

    // ==============================================
    // HELPERS
    // ==============================================
    function esc(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getFencedRanges(md) {
        var ranges = [];
        var re = /(^|\n)(```+|~~~+)/g;
        var m, openIdx = -1;
        while ((m = re.exec(md)) !== null) {
            if (openIdx === -1) { openIdx = m.index; }
            else { ranges.push([openIdx, re.lastIndex]); openIdx = -1; }
        }
        var inlineRe = /`([^`\n]+)`/g;
        while ((m = inlineRe.exec(md)) !== null) {
            ranges.push([m.index, m.index + m[0].length]);
        }
        return ranges;
    }

    function isInsideFence(idx, ranges) {
        for (var i = 0; i < ranges.length; i++) {
            if (idx >= ranges[i][0] && idx < ranges[i][1]) return true;
        }
        return false;
    }

    /**
     * Strip markdown formatting from text so TTS doesn't read asterisks, etc.
     */
    function stripMarkdown(text) {
        return text
            // Remove bold/italic markers
            .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/___(.+?)___/g, '$1')
            .replace(/__(.+?)__/g, '$1')
            .replace(/_(.+?)_/g, '$1')
            // Remove headers
            .replace(/^#{1,6}\s+/gm, '')
            // Remove markdown links [text](url) -> text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Remove inline code backticks
            .replace(/`([^`]+)`/g, '$1')
            // Remove strikethrough
            .replace(/~~(.+?)~~/g, '$1')
            // Remove markdown tables (pipe-delimited rows)
            .replace(/^\|.*\|$/gm, '')
            .replace(/^[-|:]+$/gm, '')
            // Remove blockquote markers
            .replace(/^>\s*/gm, '')
            // Remove bullet markers
            .replace(/^[\*\-\+]\s+/gm, '')
            .replace(/^\d+\.\s+/gm, '')
            // Clean up extra whitespace
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    /**
     * Create a WAV blob from Float32Array audio data.
     */
    function createWavBlob(data, sampleRate) {
        var numChannels = 1;
        var bitsPerSample = 16;
        var byteRate = sampleRate * numChannels * bitsPerSample / 8;
        var blockAlign = numChannels * bitsPerSample / 8;
        var dataSize = data.length * blockAlign;
        var buffer = new ArrayBuffer(44 + dataSize);
        var view = new DataView(buffer);

        function writeStr(offset, str) {
            for (var i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
        }

        writeStr(0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        writeStr(8, 'WAVE');
        writeStr(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);
        writeStr(36, 'data');
        view.setUint32(40, dataSize, true);

        // Float32 -> Int16
        var offset = 44;
        for (var i = 0; i < data.length; i++) {
            var s = Math.max(-1, Math.min(1, data[i]));
            var v = s < 0 ? s * 0x8000 : s * 0x7FFF;
            view.setInt16(offset, v, true);
            offset += 2;
        }
        return new Blob([buffer], { type: 'audio/wav' });
    }

    /**
     * Parse a script with [SpeakerName] markers into segments.
     * Strips markdown from each segment text.
     */
    function parseScript(script, speakerCount) {
        var speakers = SPEAKER_VOICES[speakerCount] || SPEAKER_VOICES[2];
        var speakersMap = {};
        speakers.forEach(function (s) { speakersMap[s.name] = s.voice; });

        var segments = [];
        var regex = /\[([^\]]+)\]\s*/g;
        var lastIdx = 0;
        var lastSpeaker = null;
        var match;

        while ((match = regex.exec(script)) !== null) {
            if (lastSpeaker !== null && match.index > lastIdx) {
                var text = stripMarkdown(script.substring(lastIdx, match.index));
                if (text && text.length > 5) {
                    segments.push({
                        speaker: lastSpeaker,
                        voice: speakersMap[lastSpeaker] || speakers[0].voice,
                        text: text
                    });
                }
            }
            lastSpeaker = match[1];
            lastIdx = match.index + match[0].length;
        }
        // Last segment
        if (lastSpeaker !== null && lastIdx < script.length) {
            var lastText = stripMarkdown(script.substring(lastIdx));
            if (lastText && lastText.length > 5) {
                segments.push({
                    speaker: lastSpeaker,
                    voice: speakersMap[lastSpeaker] || speakers[0].voice,
                    text: lastText
                });
            }
        }

        // If no markers found, treat entire text as single speaker
        if (segments.length === 0 && script.trim()) {
            segments.push({
                speaker: speakers[0].name,
                voice: speakers[0].voice,
                text: stripMarkdown(script)
            });
        }

        return segments;
    }

    // ==============================================
    // SYSTEM PROMPT for script generation
    // ==============================================
    function buildSystemPrompt(style, speakerCount, topic) {
        var speakers = SPEAKER_VOICES[speakerCount] || SPEAKER_VOICES[2];
        var speakerNames = speakers.map(function (s) { return s.name; });

        var styleGuide = '';
        switch (style) {
            case 'debate':
                styleGuide = 'Create a debate where speakers hold different viewpoints and challenge each other respectfully. Include rebuttals and counter-arguments.';
                break;
            case 'interview':
                styleGuide = 'Create an interview format where the Host asks thoughtful questions and the Guest provides detailed, expert answers with real-world examples.';
                break;
            case 'lecture':
                styleGuide = 'Create an engaging educational lecture with a single speaker. Use rhetorical questions, analogies, and clear explanations.';
                break;
            case 'storytelling':
                styleGuide = 'Create a narrative-driven exploration. Weave facts into a compelling story with vivid descriptions and dramatic pacing.';
                break;
            default:
                styleGuide = 'Create a casual, friendly conversation between the speakers. They build on each other\'s points naturally.';
        }

        return 'You are a professional podcast scriptwriter. Generate a SPOKEN conversation script.\n\n' +
'CRITICAL FORMAT RULES — FOLLOW EXACTLY:\n' +
'1. Start EVERY speaker turn on a new line with the speaker name in square brackets: ' + speakerNames.map(function(n) { return '[' + n + ']'; }).join(', ') + '\n' +
'2. Write ONLY spoken dialogue — NO markdown, NO bold (**), NO italic (*), NO headers (#), NO bullet points, NO tables, NO links\n' +
'3. Each speaker turn should be 2-3 natural spoken sentences\n' +
'4. Use natural speech: contractions (don\'t, it\'s, we\'re), filler words (well, you know, actually, right)\n' +
'5. Include reactions: "That\'s fascinating!", "Exactly!", "Wait, really?", "Hmm, good point"\n' +
'6. Start with a brief intro, end with a brief outro\n' +
'7. KEEP IT SHORT: 6-8 total speaker turns, about 300-500 words total. This is a SHORT podcast clip, not a long episode.\n' +
'8. NEVER use formatting characters: no *, no #, no |, no `, no -, no > at line starts\n\n' +
'STYLE: ' + styleGuide + '\n\n' +
'SPEAKER ROLES:\n' +
speakers.map(function(s, i) {
    if (speakerCount === 1) return '- [' + s.name + ']: The presenter/lecturer';
    if (i === 0) return '- [' + s.name + ']: The host who guides the conversation, asks questions';
    return '- [' + s.name + ']: A knowledgeable guest with unique insights and opinions';
}).join('\n') + '\n\n' +
'EXAMPLE FORMAT (follow this exactly):\n' +
'[' + speakerNames[0] + '] Welcome everyone to the show! Today we\'re diving into a really exciting topic.\n' +
(speakerCount > 1 ? '[' + speakerNames[1] + '] Thanks for having me! I\'m really looking forward to this discussion.\n' : '') +
'[' + speakerNames[0] + '] So let\'s jump right in. Tell us about...\n\n' +
'Output ONLY the script. Start directly with [' + speakerNames[0] + '].';
    }

    // ==============================================
    // TRANSFORM — convert {{Podcast:}} tags to card HTML
    // ==============================================
    function transformPodcastMarkdown(markdown) {
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?Podcast:\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        // Build model dropdown
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
            var body = match[1].trim();

            // Parse fields
            var topicMatch = body.match(/(?:^|\s)(?:@topic|Topic):\s*(.+?)(?=\s+@|\s*$)/mi);
            var speakerMatch = body.match(/(?:^|\s)(?:@speakers|Speakers):\s*(\d+)(?=\s+@|\s*$)/mi);
            var styleMatch = body.match(/(?:^|\s)(?:@style|Style):\s*(\S+)(?=\s+@|\s*$)/mi);
            var searchMatch = body.match(/(?:^|\s)(?:@search|Search):\s*(\S+)(?=\s+@|\s*$)/mi);
            var modelMatch = body.match(/(?:^|\s)(?:@model|Model):\s*(\S+)(?=\s+@|\s*$)/mi);
            var textMatch = body.match(/(?:^|\s)(?:@text|Text):\s*([\s\S]+?)(?=\s+@|\s*$)/mi);

            var topic = topicMatch ? topicMatch[1].trim() : '';
            var speakerCount = speakerMatch ? Math.min(4, Math.max(1, parseInt(speakerMatch[1], 10))) : 2;
            var style = styleMatch ? styleMatch[1].trim().toLowerCase() : 'conversational';
            if (!STYLES[style]) style = 'conversational';
            var enableSearch = searchMatch ? searchMatch[1].trim().toLowerCase() !== 'no' : true;
            var blockModelId = modelMatch ? modelMatch[1].trim() : null;
            if (blockModelId && !models[blockModelId]) blockModelId = null;
            var textContent = textMatch ? textMatch[1].trim() : '';

            // If no explicit @topic, use remaining body as topic
            if (!topic && !textContent) {
                topic = body
                    .replace(/(?:^|\s)@(?:speakers|style|search|model|text|topic):\s*[^\n@]*/gmi, '')
                    .trim();
            }

            var displayTopic = topic || textContent.substring(0, 100) || 'Custom Podcast';

            // Check if we already have a generated podcast
            var hasPodcast = generatedPodcasts.has(blockIndex);

            // Speaker pills
            var speakerPills = '';
            [1, 2, 3, 4].forEach(function (n) {
                var active = n === speakerCount ? ' active' : '';
                speakerPills += '<button class="ai-podcast-pill' + active + '" data-speakers="' + n + '" data-podcast-index="' + blockIndex + '">' + n + '</button>';
            });

            // Style pills
            var stylePills = '';
            Object.keys(STYLES).forEach(function (key) {
                var s = STYLES[key];
                var active = key === style ? ' active' : '';
                stylePills += '<button class="ai-podcast-pill' + active + '" data-style="' + key + '" data-podcast-index="' + blockIndex + '" title="' + esc(s.desc) + '">' + s.emoji + ' ' + s.name + '</button>';
            });

            var cardModelOpts = buildModelOpts(blockModelId);

            result += '<div class="ai-podcast-card" data-podcast-index="' + blockIndex + '" data-speakers="' + speakerCount + '" data-style="' + style + '" data-search="' + (enableSearch ? 'yes' : 'no') + '">'
                // Header
                + '<div class="ai-podcast-header">'
                + '<span class="ai-podcast-icon">🎙️</span>'
                + '<span class="ai-podcast-label">Podcast Generator</span>'
                + '<div class="ai-podcast-actions">'
                + '<select class="ai-podcast-model-select" data-podcast-index="' + blockIndex + '" title="AI model for script writing">' + cardModelOpts + '</select>'
                + '<button class="ai-podcast-btn ai-podcast-generate" data-podcast-index="' + blockIndex + '">▶ Generate</button>'
                + '<button class="ai-podcast-btn ai-podcast-regenerate" data-podcast-index="' + blockIndex + '" title="Regenerate"' + (hasPodcast ? '' : ' style="display:none"') + '>🔄</button>'
                + '<button class="ai-podcast-btn ai-podcast-remove" data-podcast-index="' + blockIndex + '" title="Remove tag">✕</button>'
                + '</div></div>'
                // Pills
                + '<div class="ai-podcast-pills">'
                + '<div class="ai-podcast-pill-group"><span class="ai-podcast-pill-label">Speakers</span>' + speakerPills + '</div>'
                + '<div class="ai-podcast-pill-group"><span class="ai-podcast-pill-label">Style</span>' + stylePills + '</div>'
                + '</div>'
                // Search toggle
                + '<label class="ai-podcast-search-toggle" data-podcast-index="' + blockIndex + '">'
                + '<input type="checkbox"' + (enableSearch ? ' checked' : '') + ' data-podcast-index="' + blockIndex + '"> 🔍 Web search for research'
                + '</label>'
                // Prompt
                + '<div class="ai-podcast-prompt">'
                + '<textarea class="ai-podcast-prompt-input" data-podcast-index="' + blockIndex + '" placeholder="Enter topic, paste text, or describe what the podcast should cover…" rows="2">' + esc(topic || textContent) + '</textarea>'
                + '</div>'
                // Generating overlay with progress
                + '<div class="ai-podcast-generating" data-podcast-index="' + blockIndex + '">'
                + '<div class="ai-podcast-progress-bar"><div class="ai-podcast-progress-fill" data-podcast-index="' + blockIndex + '"></div></div>'
                + '<div class="ai-podcast-gen-phases" data-podcast-index="' + blockIndex + '">'
                + '<div class="ai-podcast-phase" data-phase="research"><span class="phase-icon">🔍</span> Research</div>'
                + '<div class="ai-podcast-phase" data-phase="script"><span class="phase-icon">✍️</span> Script</div>'
                + '<div class="ai-podcast-phase" data-phase="audio"><span class="phase-icon">🔊</span> Audio</div>'
                + '<div class="ai-podcast-phase" data-phase="done"><span class="phase-icon">✅</span> Done</div>'
                + '</div>'
                + '<div class="ai-podcast-gen-text">Preparing…</div>'
                + '<div class="ai-podcast-gen-phase"></div>'
                + '</div>'
                // Player (hidden until generated)
                + '<div class="ai-podcast-player" data-podcast-index="' + blockIndex + '"></div>'
                // Transcript (hidden until generated)
                + '<div class="ai-podcast-transcript-container" data-podcast-index="' + blockIndex + '"></div>'
                + '</div>';

            blockIndex++;
            lastIndex = match.index + match[0].length;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // BIND — wire up card interactivity
    // ==============================================
    function bindPodcastPreviewActions(container) {
        // ▶ Generate
        container.querySelectorAll('.ai-podcast-generate').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.podcastIndex, 10);
                generatePodcast(idx, container);
            });
        });

        // 🔄 Regenerate
        container.querySelectorAll('.ai-podcast-regenerate').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.podcastIndex, 10);
                generatePodcast(idx, container);
            });
        });

        // ✕ Remove
        container.querySelectorAll('.ai-podcast-remove').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.podcastIndex, 10);
                removePodcastTag(idx);
            });
        });

        // Speaker pills
        container.querySelectorAll('.ai-podcast-pill[data-speakers]').forEach(function (pill) {
            pill.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.podcastIndex, 10);
                var count = parseInt(this.dataset.speakers, 10);
                var card = container.querySelector('.ai-podcast-card[data-podcast-index="' + idx + '"]');
                if (card) {
                    card.dataset.speakers = count;
                    card.querySelectorAll('.ai-podcast-pill[data-speakers]').forEach(function (p) { p.classList.remove('active'); });
                    this.classList.add('active');
                }
            });
        });

        // Style pills
        container.querySelectorAll('.ai-podcast-pill[data-style]').forEach(function (pill) {
            pill.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.podcastIndex, 10);
                var style = this.dataset.style;
                var card = container.querySelector('.ai-podcast-card[data-podcast-index="' + idx + '"]');
                if (card) {
                    card.dataset.style = style;
                    card.querySelectorAll('.ai-podcast-pill[data-style]').forEach(function (p) { p.classList.remove('active'); });
                    this.classList.add('active');
                }
            });
        });

        // Prompt auto-resize
        container.querySelectorAll('.ai-podcast-prompt-input').forEach(function (ta) {
            ta.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        });

        // Restore generated podcasts
        generatedPodcasts.forEach(function (data, idx) {
            var card = container.querySelector('.ai-podcast-card[data-podcast-index="' + idx + '"]');
            if (card && data.audioBlob) {
                renderPlayer(card, idx, data);
            }
        });
    }

    // ==============================================
    // PROGRESS HELPERS
    // ==============================================
    function setPhase(card, phase, message, detail) {
        var genOverlay = card.querySelector('.ai-podcast-generating');
        var genText = card.querySelector('.ai-podcast-gen-text');
        var genPhase = card.querySelector('.ai-podcast-gen-phase');

        if (genText) genText.textContent = message || '';
        if (genPhase) genPhase.textContent = detail || '';

        // Highlight the active phase in the progress bar
        card.querySelectorAll('.ai-podcast-phase').forEach(function (el) {
            el.classList.remove('active', 'done');
        });

        var phases = ['research', 'script', 'audio', 'done'];
        var activeIdx = phases.indexOf(phase);
        card.querySelectorAll('.ai-podcast-phase').forEach(function (el, i) {
            if (i < activeIdx) el.classList.add('done');
            if (i === activeIdx) el.classList.add('active');
        });

        // Update progress bar fill
        var fill = card.querySelector('.ai-podcast-progress-fill');
        if (fill) {
            var pct = phase === 'research' ? 15 : phase === 'script' ? 40 : phase === 'audio' ? 70 : 100;
            fill.style.width = pct + '%';
        }
    }

    function setProgressDetail(card, detail) {
        var genPhase = card.querySelector('.ai-podcast-gen-phase');
        if (genPhase) genPhase.textContent = detail;
    }

    // ==============================================
    // GENERATE — full pipeline
    // ==============================================
    async function generatePodcast(blockIndex, container) {
        var card = container.querySelector('.ai-podcast-card[data-podcast-index="' + blockIndex + '"]');
        if (!card) return;

        var promptArea = card.querySelector('.ai-podcast-prompt-input');
        var topic = promptArea ? promptArea.value.trim() : '';
        if (!topic) {
            M.showToast && M.showToast('⚠️ Please enter a topic for the podcast.', 'warning');
            return;
        }

        var speakerCount = parseInt(card.dataset.speakers, 10) || 2;
        var style = card.dataset.style || 'conversational';
        var searchCheckbox = card.querySelector('.ai-podcast-search-toggle input[type="checkbox"]');
        var enableSearch = searchCheckbox ? searchCheckbox.checked : true;

        // Get model
        var cardSelect = card.querySelector('.ai-podcast-model-select');
        var perCardModel = cardSelect ? cardSelect.value : null;
        var originalModel = M.getCurrentAiModel ? M.getCurrentAiModel() : null;
        if (perCardModel && perCardModel !== originalModel && M.switchToModel) {
            M.switchToModel(perCardModel);
        }

        // Show generating overlay
        var genOverlay = card.querySelector('.ai-podcast-generating');
        genOverlay.classList.add('active');
        card.classList.add('loading');

        var genBtn = card.querySelector('.ai-podcast-generate');
        if (genBtn) { genBtn.disabled = true; genBtn.textContent = '⏳ Generating…'; }

        // Hide player if regenerating
        var playerEl = card.querySelector('.ai-podcast-player');
        if (playerEl) playerEl.classList.remove('active');

        try {
            // ── Phase 1: Research ──
            var searchContext = '';
            setPhase(card, 'research', '🔍 Researching topic…', 'Searching the web for current information');

            if (enableSearch && M.webSearch) {
                console.log('[Podcast] 🔍 Researching: "' + topic + '"');

                try {
                    var searchResults = await M.webSearch.performMultiSearch(topic, 5);
                    if (searchResults && searchResults.length > 0) {
                        searchContext = M.webSearch.formatResultsForLLM(searchResults);
                        setProgressDetail(card, '✅ Found ' + searchResults.length + ' sources');
                        console.log('[Podcast] 📄 Got ' + searchResults.length + ' search results');
                    } else {
                        setProgressDetail(card, 'No results — generating from AI knowledge');
                    }
                } catch (searchErr) {
                    console.warn('[Podcast] Search failed:', searchErr.message);
                    setProgressDetail(card, 'Search unavailable — using AI knowledge');
                }

                await new Promise(function (r) { setTimeout(r, 500); }); // Brief pause for UI
            } else {
                setProgressDetail(card, enableSearch ? 'Web search not configured' : 'Search disabled');
                await new Promise(function (r) { setTimeout(r, 300); });
            }

            // ── Phase 2: Generate Script ──
            setPhase(card, 'script', '✍️ Writing podcast script…', speakerCount + ' speakers · ' + STYLES[style].name + ' style');

            var systemPrompt = buildSystemPrompt(style, speakerCount, topic);
            var userPrompt = 'Create a podcast script about: ' + topic;
            if (searchContext) {
                userPrompt += '\n\nUse these research findings — cite specific facts, data, and examples (but DO NOT use any markdown formatting):\n\n' + searchContext;
            }

            console.log('[Podcast] ✍️ Generating script…');

            // Ensure model is ready (handles both local and cloud/API models)
            async function ensureModelReady() {
                if (M.isCurrentModelReady && M.isCurrentModelReady()) return true;

                var currentModel = M.getCurrentAiModel ? M.getCurrentAiModel() : null;
                if (!currentModel) {
                    // No model selected — try to find any ready model
                    return await tryFallbackModel();
                }

                console.log('[Podcast] Model "' + currentModel + '" not ready, attempting to load...');
                setProgressDetail(card, 'Loading AI model "' + currentModel + '"…');

                // Trigger the appropriate loader
                if (M._ai && M._ai.isLocalModel && M._ai.isLocalModel(currentModel)) {
                    if (M.showModelDownloadPopup) M.showModelDownloadPopup(currentModel);
                } else if (M._ai && M._ai.CLOUD_PROVIDERS && M._ai.CLOUD_PROVIDERS[currentModel]) {
                    var provider = M._ai.CLOUD_PROVIDERS[currentModel];
                    if (!provider.getKey || !provider.getKey()) {
                        if (M.showApiKeyModal) M.showApiKeyModal(currentModel);
                    } else if (M._ai.initCloudWorker) {
                        M._ai.initCloudWorker(currentModel);
                    }
                }

                // Poll for readiness (up to 15 seconds)
                for (var i = 0; i < 30; i++) {
                    await new Promise(function (r) { setTimeout(r, 500); });
                    if (M.isCurrentModelReady && M.isCurrentModelReady()) {
                        console.log('[Podcast] Model ready after ' + ((i + 1) * 0.5) + 's');
                        return true;
                    }
                }

                // Primary model failed — try fallback
                console.log('[Podcast] Primary model not ready, searching for fallback…');
                return await tryFallbackModel();
            }

            // Scan all models to find one that's ready
            async function tryFallbackModel() {
                var models = window.AI_MODELS || {};
                var modelIds = Object.keys(models);

                // First pass: find a cloud model with API key configured
                for (var i = 0; i < modelIds.length; i++) {
                    var id = modelIds[i];
                    var m = models[id];
                    if (m.isImageModel || m.isTtsModel || m.isSttModel) continue;

                    if (M._ai && M._ai.CLOUD_PROVIDERS && M._ai.CLOUD_PROVIDERS[id]) {
                        var provider = M._ai.CLOUD_PROVIDERS[id];
                        if (provider.getKey && provider.getKey()) {
                            console.log('[Podcast] Found cloud model with key: ' + id);
                            setProgressDetail(card, 'Switching to ' + (m.dropdownName || m.label || id) + '…');
                            if (M.switchToModel) M.switchToModel(id);

                            // Init cloud worker and wait
                            if (M._ai.initCloudWorker) M._ai.initCloudWorker(id);
                            for (var j = 0; j < 20; j++) {
                                await new Promise(function (r) { setTimeout(r, 500); });
                                if (M.isCurrentModelReady && M.isCurrentModelReady()) {
                                    M.showToast && M.showToast('🔄 Using ' + (m.dropdownName || m.label || id) + ' for podcast', 'info');
                                    return true;
                                }
                            }
                        }
                    }
                }

                // Second pass: any model that's already loaded
                for (var i = 0; i < modelIds.length; i++) {
                    var id = modelIds[i];
                    var m = models[id];
                    if (m.isImageModel || m.isTtsModel || m.isSttModel) continue;
                    if (M.switchToModel) M.switchToModel(id);
                    await new Promise(function (r) { setTimeout(r, 300); });
                    if (M.isCurrentModelReady && M.isCurrentModelReady()) {
                        M.showToast && M.showToast('🔄 Using ' + (m.dropdownName || m.label || id) + ' for podcast', 'info');
                        return true;
                    }
                }

                return false;
            }

            var modelReady = await ensureModelReady();
            if (!modelReady) {
                throw new Error('No AI model available. Please load a model first (click AI button in toolbar) or add an API key for a cloud model in Settings.');
            }

            var scriptText = '';
            try {
                scriptText = await M.requestAiTask({
                    taskType: 'generate',
                    context: systemPrompt,
                    userPrompt: userPrompt,
                    enableThinking: false,
                    silent: true,
                    maxTokensOverride: 2048
                });
            } catch (aiErr) {
                throw new Error('AI script generation failed: ' + (aiErr.message || String(aiErr)));
            }

            // Clean up — strip markdown fences, headers, extra formatting
            scriptText = scriptText
                .replace(/^```[\s\S]*?\n/, '')
                .replace(/\n```$/, '')
                .trim();

            // Ensure we have [Speaker] markers
            var hasMarkers = /\[[A-Z][a-zA-Z0-9_]*\]/.test(scriptText);
            if (!hasMarkers && speakerCount > 1) {
                console.warn('[Podcast] ⚠️ No [Speaker] markers found — AI output may be wrong format. Attempting to salvage...');
                // Try to inject markers by splitting paragraphs
                var paragraphs = scriptText.split(/\n\n+/);
                var speakers = SPEAKER_VOICES[speakerCount];
                scriptText = paragraphs.map(function (p, i) {
                    var speaker = speakers[i % speakers.length];
                    return '[' + speaker.name + '] ' + stripMarkdown(p.trim());
                }).filter(function (p) { return p.length > 15; }).join('\n\n');
            }

            console.log('[Podcast] 📜 Script generated: ' + scriptText.length + ' chars');
            setProgressDetail(card, 'Script ready — ' + scriptText.length + ' chars');

            // ── Phase 3: Synthesize Audio ──
            setPhase(card, 'audio', '🔊 Synthesizing audio…', 'Loading Kokoro TTS engine…');

            var segments = parseScript(scriptText, speakerCount);

            // Merge consecutive same-speaker segments to reduce TTS calls
            var mergedSegments = [];
            segments.forEach(function(seg) {
                if (mergedSegments.length > 0 && mergedSegments[mergedSegments.length - 1].speaker === seg.speaker) {
                    mergedSegments[mergedSegments.length - 1].text += ' ' + seg.text;
                } else {
                    mergedSegments.push({ speaker: seg.speaker, voice: seg.voice, text: seg.text });
                }
            });
            segments = mergedSegments;

            // Cap at 10 segments max to keep synthesis time reasonable
            if (segments.length > 10) {
                console.warn('[Podcast] ⚠️ Too many segments (' + segments.length + '), trimming to 10');
                segments = segments.slice(0, 10);
            }

            var uniqueSpeakers = [...new Set(segments.map(function(s) { return s.speaker; }))];
            setProgressDetail(card, segments.length + ' segments · ' + uniqueSpeakers.length + ' voice' + (uniqueSpeakers.length > 1 ? 's' : ''));

            var _pt = function() { return '[Podcast +' + ((Date.now() - _podcastStartTime) / 1000).toFixed(1) + 's]'; };
            var _podcastStartTime = Date.now();

            console.log(_pt() + ' 🔊 Synthesizing ' + segments.length + ' segments with ' + uniqueSpeakers.length + ' voices');
            console.log(_pt() + ' Segments:');
            segments.forEach(function(s, i) {
                console.log(_pt() + '   [' + i + '] speaker=' + s.speaker + ' voice=' + s.voice + ' chars=' + (s.text || '').length + ' text="' + (s.text || '').substring(0, 50) + '…"');
            });

            console.log(_pt() + ' 🔍 M.tts exists: ' + !!M.tts);
            console.log(_pt() + ' 🔍 M.tts.speakMultiAsync exists: ' + !!(M.tts && M.tts.speakMultiAsync));
            console.log(_pt() + ' 🔍 M.tts.isKokoroReady: ' + (M.tts && M.tts.isKokoroReady ? M.tts.isKokoroReady() : 'N/A'));
            console.log(_pt() + ' 🔍 M.tts.isKokoroLoading: ' + (M.tts && M.tts.isKokoroLoading ? M.tts.isKokoroLoading() : 'N/A'));
            console.log(_pt() + ' 🔍 M.tts.isGenerating: ' + (M.tts && M.tts.isGenerating ? M.tts.isGenerating() : 'N/A'));

            var audioData = null;

            if (M.tts && M.tts.speakMultiAsync) {
                console.log(_pt() + ' 🎬 Calling M.tts.speakMultiAsync()…');

                // Start a timer that shows elapsed time even if worker messages don't arrive
                var synthStartTime = Date.now();
                var lastProgressMsg = segments.length + ' segments · synthesizing…';
                var progressTimer = setInterval(function() {
                    var elapsed = Math.floor((Date.now() - synthStartTime) / 1000);
                    var min = Math.floor(elapsed / 60);
                    var sec = elapsed % 60;
                    var timeStr = min > 0 ? min + 'm ' + sec + 's' : sec + 's';
                    setProgressDetail(card, lastProgressMsg + ' (' + timeStr + ' elapsed)');
                    // Also log to console every 15s
                    if (elapsed % 15 === 0 && elapsed > 0) {
                        console.log(_pt() + ' ⏱ Still waiting for speakMultiAsync… ' + timeStr + ' elapsed, last progress: ' + lastProgressMsg);
                    }
                }, 5000);

                try {
                    // Multi-speaker async synthesis with progress callback
                    audioData = await M.tts.speakMultiAsync(segments, function(progressMsg) {
                        console.log(_pt() + ' 📊 TTS progress: ' + progressMsg);
                        lastProgressMsg = progressMsg;
                        setProgressDetail(card, progressMsg);
                        // Update progress bar within audio phase (70-95%)
                        var chunkMatch = progressMsg.match(/(\d+)\/(\d+)/);
                        if (chunkMatch) {
                            var fill = card.querySelector('.ai-podcast-progress-fill');
                            if (fill) {
                                var chunkPct = parseInt(chunkMatch[1], 10) / parseInt(chunkMatch[2], 10);
                                fill.style.width = (70 + chunkPct * 25) + '%';
                            }
                        }
                    });

                    var synthElapsed = ((Date.now() - synthStartTime) / 1000).toFixed(1);
                    console.log(_pt() + ' ✅ speakMultiAsync resolved after ' + synthElapsed + 's');
                    console.log(_pt() + ' 🔍 audioData: ' + (audioData ? 'exists' : 'NULL') + ', data: ' + (audioData?.data?.length || 0) + ' samples, sampleRate: ' + (audioData?.sampleRate || 'N/A'));
                } catch (synthErr) {
                    console.error(_pt() + ' ❌ speakMultiAsync REJECTED:', synthErr.message || String(synthErr));
                    throw synthErr;
                }

                clearInterval(progressTimer);
            } else {
                console.error(_pt() + ' ❌ TTS engine NOT available — M.tts=' + !!M.tts + ', speakMultiAsync=' + !!(M.tts && M.tts.speakMultiAsync));
                throw new Error('TTS engine not available — Kokoro TTS required for podcast generation');
            }

            if (!audioData || !audioData.data) {
                console.error(_pt() + ' ❌ No audio data returned — audioData=' + JSON.stringify(audioData));
                throw new Error('Audio synthesis failed — no audio data returned');
            }

            // Create WAV blob
            console.log(_pt() + ' 🔧 Creating WAV blob from ' + audioData.data.length + ' samples…');
            var wavBlob = createWavBlob(audioData.data, audioData.sampleRate || 24000);
            var duration = audioData.data.length / (audioData.sampleRate || 24000);

            console.log(_pt() + ' ✅ Audio ready: ' + duration.toFixed(1) + 's, ' + (wavBlob.size / 1024).toFixed(0) + ' KB');

            // ── Phase 4: Done ──
            setPhase(card, 'done', '✅ Podcast ready!', formatTime(duration) + ' · ' + (wavBlob.size / 1024 / 1024).toFixed(1) + ' MB');

            // Store result
            var podcastData = {
                script: scriptText,
                audioBlob: wavBlob,
                audioUrl: URL.createObjectURL(wavBlob),
                duration: duration,
                segments: segments,
                topic: topic,
                speakerCount: speakerCount,
                style: style,
                timestamp: Date.now()
            };
            generatedPodcasts.set(blockIndex, podcastData);

            await new Promise(function (r) { setTimeout(r, 800); }); // Brief pause to show "Done"

            // Dismiss overlay
            genOverlay.classList.remove('active');
            card.classList.remove('loading');
            if (genBtn) { genBtn.disabled = false; genBtn.textContent = '▶ Generate'; }

            // Show regenerate
            var regenBtn = card.querySelector('.ai-podcast-regenerate');
            if (regenBtn) regenBtn.style.display = '';

            // Render player
            renderPlayer(card, blockIndex, podcastData);

            // Save to podcast marketplace if available
            saveToPodcastMarketplace(podcastData);

            M.showToast && M.showToast('🎙️ Podcast generated! ' + formatTime(duration) + ' of audio', 'success');

        } catch (err) {
            console.error('[Podcast] ❌ Generation failed:', err);
            genOverlay.classList.remove('active');
            card.classList.remove('loading');
            if (genBtn) { genBtn.disabled = false; genBtn.textContent = '▶ Generate'; }
            M.showToast && M.showToast('❌ ' + (err.message || String(err)), 'error');

            // Restore model if we switched
            if (perCardModel && originalModel && perCardModel !== originalModel && M.switchToModel) {
                M.switchToModel(originalModel);
            }
        }
    }

    // ==============================================
    // SAVE TO PODCAST MARKETPLACE
    // ==============================================
    function saveToPodcastMarketplace(podcastData) {
        try {
            // Read existing saved podcasts
            var saved = [];
            try {
                var raw = localStorage.getItem('textagent_saved_podcasts');
                if (raw) saved = JSON.parse(raw);
            } catch (_) {}

            // Convert WAV blob to base64 for persistence
            var reader = new FileReader();
            reader.onload = function () {
                var base64Audio = reader.result; // data:audio/wav;base64,...
                var entry = {
                    id: 'usr_' + Date.now(),
                    title: podcastData.topic.substring(0, 60),
                    topic: podcastData.topic,
                    script: podcastData.script,
                    audioBase64: base64Audio,
                    duration: formatTime(podcastData.duration),
                    speakerCount: podcastData.speakerCount,
                    style: podcastData.style,
                    timestamp: podcastData.timestamp
                };

                saved.unshift(entry); // newest first
                // Keep only 10 most recent
                if (saved.length > 10) saved = saved.slice(0, 10);

                try {
                    localStorage.setItem('textagent_saved_podcasts', JSON.stringify(saved));
                    console.log('[Podcast] 💾 Saved to library: "' + entry.title + '"');
                } catch (storageErr) {
                    // Likely quota exceeded — base64 audio is large
                    console.warn('[Podcast] Storage full — podcast not saved to library:', storageErr.message);
                    // Try saving without audio (just script)
                    entry.audioBase64 = null;
                    entry.audioTooLarge = true;
                    saved[0] = entry;
                    try {
                        localStorage.setItem('textagent_saved_podcasts', JSON.stringify(saved));
                    } catch (_) {}
                }
            };
            reader.readAsDataURL(podcastData.audioBlob);
        } catch (err) {
            console.warn('[Podcast] Could not save to marketplace:', err.message);
        }
    }

    // ==============================================
    // RENDER PLAYER — inline audio + transcript
    // ==============================================
    function renderPlayer(card, blockIndex, data) {
        var playerEl = card.querySelector('.ai-podcast-player');
        if (!playerEl) return;

        var durationStr = formatTime(data.duration);
        var speakersInfo = SPEAKER_VOICES[data.speakerCount] || SPEAKER_VOICES[2];
        var usedSpeakers = [...new Set(data.segments.map(function(s) { return s.speaker; }))];
        var badges = speakersInfo
            .filter(function(s) { return usedSpeakers.indexOf(s.name) !== -1; })
            .map(function (s) {
                return '<span class="ai-podcast-speaker-badge">' + s.label + '</span>';
            }).join(' ');

        playerEl.innerHTML =
            '<div class="ai-podcast-audio-row">'
            + '<audio controls preload="auto" src="' + data.audioUrl + '"></audio>'
            + '<button class="ai-podcast-download-btn" data-podcast-index="' + blockIndex + '" title="Download WAV">📥 Download</button>'
            + '<button class="ai-podcast-share-btn" data-podcast-index="' + blockIndex + '" title="Copy shareable data">📋 Share</button>'
            + '</div>'
            + '<div class="ai-podcast-player-meta">'
            + '<span>⏱ ' + durationStr + '</span>'
            + '<span>•</span>'
            + '<span>' + data.segments.length + ' segments</span>'
            + '<span>•</span>'
            + badges
            + '</div>';

        playerEl.classList.add('active');

        // Download button
        playerEl.querySelector('.ai-podcast-download-btn').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            downloadPodcast(blockIndex);
        });

        // Share button — copies the script + audio data URL
        playerEl.querySelector('.ai-podcast-share-btn').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            sharePodcast(blockIndex);
        });

        // Render transcript
        var transcriptEl = card.querySelector('.ai-podcast-transcript-container');
        if (transcriptEl) {
            var highlightedScript = data.script.replace(/\[([^\]]+)\]/g, '<span class="ai-podcast-script-speaker">[$1]</span>');
            transcriptEl.innerHTML =
                '<details class="ai-podcast-transcript" open>'
                + '<summary>📝 View Script (' + data.segments.length + ' segments)</summary>'
                + '<div class="ai-podcast-script-text">' + highlightedScript + '</div>'
                + '</details>';
        }
    }

    function formatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function downloadPodcast(blockIndex) {
        var data = generatedPodcasts.get(blockIndex);
        if (!data || !data.audioBlob) {
            M.showToast && M.showToast('No audio to download', 'warning');
            return;
        }

        var filename = 'podcast-' + (data.topic || 'untitled')
            .replace(/[^a-z0-9]+/gi, '-')
            .substring(0, 40)
            .toLowerCase() + '.wav';

        var a = document.createElement('a');
        a.href = data.audioUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        M.showToast && M.showToast('📥 Downloaded: ' + filename, 'success');
    }

    function sharePodcast(blockIndex) {
        var data = generatedPodcasts.get(blockIndex);
        if (!data) {
            M.showToast && M.showToast('No podcast to share', 'warning');
            return;
        }

        // Copy the script to clipboard (shareable text)
        var shareText = '🎙️ Podcast: ' + data.topic + '\n'
            + '⏱ Duration: ' + formatTime(data.duration) + '\n'
            + '👥 Speakers: ' + data.speakerCount + ' · Style: ' + data.style + '\n\n'
            + '--- SCRIPT ---\n\n'
            + data.script;

        navigator.clipboard.writeText(shareText).then(function () {
            M.showToast && M.showToast('📋 Podcast script copied to clipboard!', 'success');
        }).catch(function () {
            M.showToast && M.showToast('❌ Could not copy to clipboard', 'error');
        });
    }

    // ==============================================
    // REMOVE TAG from editor
    // ==============================================
    function removePodcastTag(blockIndex) {
        var text = M.markdownEditor.value;
        var re = /\{\{@?Podcast:\s*([\s\S]*?)\}\}/g;
        var match, idx = 0;
        while ((match = re.exec(text)) !== null) {
            if (idx === blockIndex) {
                M.markdownEditor.value = text.substring(0, match.index) + text.substring(match.index + match[0].length);
                if (M.debouncedRender) M.debouncedRender();
                generatedPodcasts.delete(blockIndex);
                return;
            }
            idx++;
        }
    }

    // ==============================================
    // EXPOSE on M
    // ==============================================
    M.transformPodcastMarkdown = transformPodcastMarkdown;
    M.bindPodcastPreviewActions = bindPodcastPreviewActions;

})(window.MDView);
