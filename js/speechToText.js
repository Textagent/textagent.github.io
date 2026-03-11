// ============================================
// speechToText.js — Dual-Engine Voice Dictation
// Engine 1: Web Speech API (real-time, multi-language)
// Engine 2: Whisper Large V3 Turbo ONNX (offline, cross-browser)
// Engine 3: AI refinement (optional, via connected LLM)
// Consensus layer merges results for best quality.
// ============================================
(function () {
    'use strict';

    const M = window.MDView;
    if (!M) { console.warn('speechToText: MDView not found'); return; }

    // ── Feature Detection ──────────────────────────
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasWebSpeech = !!SpeechRecognition;

    // ── State ──────────────────────────────────────
    let isListening = false;
    let lastInsertTime = Date.now();
    let pauseTimer = null;
    const PAUSE_THRESHOLD = 3000;
    const STORAGE_LANG_KEY = M.KEYS.SPEECH_LANG;

    // Web Speech API state
    let recognition = null;
    let wsaFinalText = '';        // latest final from Web Speech API
    let wsaInterimText = '';      // latest interim

    // Whisper worker state
    let worker = null;
    let modelReady = false;
    let modelLoading = false;
    let whisperText = '';          // latest result from Whisper

    // Audio capture for Whisper (runs in parallel with Web Speech API)
    let audioContext = null;
    let mediaStream = null;
    let sourceNode = null;
    let processorNode = null;
    const TARGET_SAMPLE_RATE = 16000;

    // VAD state
    let vadBuffer = [];
    let vadBufferLength = 0;
    let isSpeaking = false;
    let silenceFrames = 0;
    const VAD_SPEECH_THRESHOLD = 0.008;
    const VAD_SILENCE_THRESHOLD = 0.004;
    const VAD_SILENCE_FRAMES = 5;
    const VAD_MIN_SPEECH_SAMPLES = 4800;
    const VAD_MAX_SPEECH_SAMPLES = TARGET_SAMPLE_RATE * 15;
    let whisperTranscribing = false;

    // Consensus state
    let pendingWSA = null;        // { text, timestamp }
    let pendingWhisper = null;    // { text, timestamp }
    let consensusTimer = null;
    const CONSENSUS_WAIT_MS = 2000; // wait up to 2s for second engine

    // AI refinement
    let aiRefineEnabled = true;  // Auto-punctuation/capitalization via LLM (on by default)

    // ── Supported Languages (Web Speech API) ──────
    const LANGUAGES = [
        { code: 'en-US', label: 'English (US)', short: 'EN' },
        { code: 'en-GB', label: 'English (UK)', short: 'EN' },
        { code: 'es-ES', label: 'Español', short: 'ES' },
        { code: 'fr-FR', label: 'Français', short: 'FR' },
        { code: 'de-DE', label: 'Deutsch', short: 'DE' },
        { code: 'it-IT', label: 'Italiano', short: 'IT' },
        { code: 'pt-BR', label: 'Português (BR)', short: 'PT' },
        { code: 'ru-RU', label: 'Русский', short: 'RU' },
        { code: 'zh-CN', label: '中文 (简体)', short: '中' },
        { code: 'ja-JP', label: '日本語', short: 'JP' },
        { code: 'ko-KR', label: '한국어', short: 'KO' },
        { code: 'ar-SA', label: 'العربية', short: 'AR' },
        { code: 'hi-IN', label: 'हिन्दी', short: 'HI' },
        { code: 'bn-IN', label: 'বাংলা', short: 'BN' },
    ];

    let currentLang = localStorage.getItem(STORAGE_LANG_KEY) || 'en-US';

    // ── Voice-to-Markdown Replacements ─────────────
    // Multi-word patterns are processed first to prevent partial matches.
    // Multiple natural aliases for each command improve ASR recognition.
    function applyMarkdownCommands(text) {
        const replacements = [
            // ── Headings (natural phrases first, "hash" as fallback) ──
            [/\b(?:heading four|heading 4|make heading 4|h4)\b/gi, '\n#### '],
            [/\b(?:heading three|heading 3|make heading 3|h3)\b/gi, '\n### '],
            [/\b(?:heading two|heading 2|sub ?heading|make heading 2|h2)\b/gi, '\n## '],
            [/\b(?:heading one|heading 1|new heading|make heading|main heading|title|h1)\b/gi, '\n# '],
            // "hash" fallback (process multi-hash first)
            [/\bhash hash hash hash\b/gi, '\n#### '],
            [/\bhash hash hash\b/gi, '\n### '],
            [/\bhash hash\b/gi, '\n## '],
            [/\bhash\b/gi, '\n# '],

            // ── Formatting (with natural start/end pairs) ──
            [/\b(?:bold|make bold)\b\s+(.+?)\s+\b(?:end bold|stop bold|unbold)\b/gi, '**$1**'],
            [/\b(?:italic|italics|make italic)\b\s+(.+?)\s+\b(?:end italic|stop italic)\b/gi, '*$1*'],
            [/\b(?:code|inline code)\b\s+(.+?)\s+\b(?:end code|stop code)\b/gi, '`$1`'],
            [/\b(?:strikethrough|strike through|cross out)\b\s+(.+?)\s+\b(?:end strikethrough|end strike|stop strike)\b/gi, '~~$1~~'],
            [/\b(?:highlight|mark)\b\s+(.+?)\s+\b(?:end highlight|end mark|stop highlight)\b/gi, '==$1=='],

            // ── Structure ──
            [/\b(?:new line|line break|next line|enter)\b/gi, '\n'],
            [/\b(?:new paragraph|next paragraph|paragraph break|double enter)\b/gi, '\n\n'],
            [/\b(?:bullet point|bullet|dash point|list item|add bullet)\b/gi, '\n- '],
            [/\b(?:numbered list|number list|ordered list|add number)\b/gi, '\n1. '],
            [/\b(?:task list|check list|checkbox|to do|todo item|add task)\b/gi, '\n- [ ] '],
            [/\b(?:block quote|quote|quotation|add quote)\b/gi, '\n> '],
            [/\b(?:horizontal rule|divider|separator|line across|draw line)\b/gi, '\n\n---\n\n'],
            [/\b(?:code block|start code|begin code)\b/gi, '\n```\n'],
            [/\b(?:end block|end code block|stop code|close code)\b/gi, '\n```\n'],

            // ── Links & media ──
            [/\b(?:add link|insert link|make link)\s+(.+?)\b/gi, '[$1](url)'],
            [/\b(?:add image|insert image)\s+(.+?)\b/gi, '![$1](url)'],

            // ── Table ──
            [/\b(?:add table|insert table|make table|create table)\b/gi, '\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| | | |\n'],

            // ── Punctuation (natural phrases) ──
            [/\b(?:period|full stop|dot)\b/gi, '.'],
            [/\b(?:comma|pause)\b/gi, ','],
            [/\b(?:question mark)\b/gi, '?'],
            [/\b(?:exclamation mark|exclamation point|bang)\b/gi, '!'],
            [/\b(?:colon)\b/gi, ':'],
            [/\b(?:semicolon|semi colon)\b/gi, ';'],
            [/\b(?:open parenthesis|left parenthesis|open paren|open bracket)\b/gi, '('],
            [/\b(?:close parenthesis|right parenthesis|close paren|close bracket)\b/gi, ')'],
            [/\b(?:ellipsis|dot dot dot|three dots)\b/gi, '…'],
            [/\b(?:ampersand|and sign)\b/gi, '&'],
            [/\b(?:at sign|at symbol)\b/gi, '@'],
            [/\b(?:hyphen)\b/gi, '-'],
            [/\b(?:em dash|long dash|dash)\b/gi, ' — '],
            [/\b(?:open quote|begin quote|start quote)\b/gi, '"'],
            [/\b(?:close quote|end quote|stop quote)\b/gi, '"'],

            // ── Editing commands ──
            [/\b(?:undo|undo that|take that back)\b/gi, ''],  // handled separately
            [/\b(?:delete that|remove that|erase that)\b/gi, ''],  // handled separately
        ];
        let result = text;

        // Check for editing commands first (these affect the editor, not text)
        if (/\b(?:undo|undo that|take that back)\b/gi.test(result)) {
            const editor = M.markdownEditor;
            if (editor) document.execCommand('undo');
            return '';
        }
        if (/\b(?:delete that|remove that|erase that)\b/gi.test(result)) {
            return '';  // discard the text
        }

        for (const [pattern, replacement] of replacements) {
            result = result.replace(pattern, replacement);
        }
        return result;
    }

    function autoCapitalize(text) {
        return text.replace(/([.!?]\s+)([a-z])/g, (_, p, ch) => p + ch.toUpperCase());
    }

    function isHallucination(text) {
        const cleaned = text.toLowerCase().replace(/[^a-z\s]/g, '').trim();
        if (cleaned.length < 3) return true;

        // Reject very long outputs (likely hallucination)
        const words = cleaned.split(/\s+/);
        if (words.length > 100) return true;

        // Reject if excessive non-ASCII characters (garbage multilingual output)
        const nonAsciiRatio = (text.replace(/[\x20-\x7E]/g, '').length) / text.length;
        if (text.length > 20 && nonAsciiRatio > 0.3) return true;

        const bad = new Set([
            'you', 'the', 'a', 'i', 'uh', 'um', 'ah', 'oh',
            'thank you', 'thanks for watching', 'subscribe',
            'like and subscribe', 'goodbye', 'bye', 'see you',
        ]);
        if (bad.has(cleaned)) return true;
        if (words.length > 2 && new Set(words).size === 1) return true;
        return false;
    }

    function insertAtCursor(text) {
        const editor = M.markdownEditor;
        if (!editor) return;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const before = editor.value.substring(0, start);
        const after = editor.value.substring(end);
        editor.value = before + text + after;
        const newPos = start + text.length;
        editor.selectionStart = editor.selectionEnd = newPos;
        editor.dispatchEvent(new Event('input'));
        editor.blur();
        editor.focus();
    }

    // ── DOM References ────────────────────────────
    const micBtn = document.getElementById('speech-to-text-btn');
    const mobileMicBtn = document.getElementById('mobile-speech-btn');
    const statusBar = document.getElementById('speech-status-bar');
    const interimText = document.getElementById('speech-interim-text');
    const stopBtn = document.getElementById('speech-stop-btn');
    const helpBtn = document.getElementById('speech-help-btn');
    const langLabel = document.getElementById('speech-lang-label');
    const langBtn = document.getElementById('speech-lang-btn');

    // ── Language Dropdown ─────────────────────────
    let langDropdown = null;

    function updateLangLabel() {
        const lang = LANGUAGES.find(l => l.code === currentLang);
        if (langLabel) langLabel.textContent = lang ? lang.short : 'EN';
    }

    function showLangDropdown() {
        if (langDropdown) { hideLangDropdown(); return; }
        langDropdown = document.createElement('div');
        langDropdown.className = 'speech-lang-dropdown';

        for (const lang of LANGUAGES) {
            const btn = document.createElement('button');
            btn.className = 'speech-lang-option' + (lang.code === currentLang ? ' active' : '');
            btn.innerHTML = `<span class="speech-lang-short">${lang.short}</span> ${lang.label}`;
            btn.addEventListener('click', () => {
                currentLang = lang.code;
                localStorage.setItem(STORAGE_LANG_KEY, currentLang);
                updateLangLabel();
                hideLangDropdown();
                // If listening, restart Web Speech API with new language
                if (isListening && recognition) {
                    recognition.lang = currentLang;
                    try { recognition.stop(); } catch (_) {}
                    // Will auto-restart via onend handler
                }
            });
            langDropdown.appendChild(btn);
        }

        statusBar.appendChild(langDropdown);

        const close = (e) => {
            if (langDropdown && !langDropdown.contains(e.target) && e.target !== langBtn) {
                hideLangDropdown();
                document.removeEventListener('click', close);
            }
        };
        setTimeout(() => document.addEventListener('click', close), 10);
    }

    function hideLangDropdown() {
        if (langDropdown) { langDropdown.remove(); langDropdown = null; }
    }

    // ── Voice Commands Cheat Sheet ────────────────
    let cheatSheetEl = null;

    function buildCheatSheet() {
        const commands = [
            {
                cat: 'Headings', items: [
                    ['"heading one" / "title"', '# Heading'],
                    ['"heading two" / "subheading"', '## Sub Heading'],
                    ['"heading three"', '### Heading 3'],
                    ['"heading four"', '#### Heading 4'],
                ]
            },
            {
                cat: 'Formatting', items: [
                    ['"bold ... end bold"', '**text**'],
                    ['"italic ... end italic"', '*text*'],
                    ['"code ... end code"', '`text`'],
                    ['"strikethrough ... end strike"', '~~text~~'],
                    ['"highlight ... end highlight"', '==text=='],
                ]
            },
            {
                cat: 'Structure', items: [
                    ['"new line" / "enter"', '↵ line break'],
                    ['"new paragraph"', '↵↵ paragraph'],
                    ['"bullet" / "bullet point"', '- list item'],
                    ['"numbered list"', '1. list item'],
                    ['"task list" / "to do"', '- [ ] todo'],
                    ['"block quote" / "quote"', '> quote'],
                    ['"code block" / "end block"', '``` fenced block'],
                    ['"divider" / "separator"', '--- rule'],
                    ['"add table"', '| table |'],
                ]
            },
            {
                cat: 'Punctuation', items: [
                    ['"period" / "full stop"', '.'],
                    ['"comma"', ','],
                    ['"question mark"', '?'],
                    ['"exclamation mark"', '!'],
                    ['"colon" / "semicolon"', ': ;'],
                    ['"open/close quote"', '" "'],
                    ['"ellipsis" / "three dots"', '…'],
                    ['"dash"', '—'],
                ]
            },
            {
                cat: 'Editing', items: [
                    ['"undo" / "take that back"', '↩ undo'],
                    ['"delete that"', '🗑 remove'],
                ]
            },
        ];

        let html = `<div class="speech-cheat-header">
            <span><i class="bi bi-mic-fill"></i> Voice Commands</span>
            <button class="speech-cheat-close" id="speech-cheat-close" title="Close"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="speech-cheat-body">`;

        for (const group of commands) {
            html += `<div class="speech-cheat-group">
                <div class="speech-cheat-cat">${group.cat}</div>`;
            for (const [say, insert] of group.items) {
                html += `<div class="speech-cheat-row">
                    <span class="speech-cheat-say">${say}</span>
                    <span class="speech-cheat-arrow">→</span>
                    <span class="speech-cheat-insert">${insert}</span>
                </div>`;
            }
            html += '</div>';
        }

        html += `</div>
        <div class="speech-cheat-footer">
            <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> to toggle mic · 3s pause = new paragraph
            <br><small style="opacity:0.7">Dual Engine: 🌐 Web Speech + 🧠 Whisper V3 Turbo</small>
        </div>`;

        return html;
    }

    function showCheatSheet() {
        if (cheatSheetEl) return;
        cheatSheetEl = document.createElement('div');
        cheatSheetEl.className = 'speech-cheat-popup';
        cheatSheetEl.innerHTML = buildCheatSheet();
        document.body.appendChild(cheatSheetEl);
        requestAnimationFrame(() => cheatSheetEl.classList.add('speech-cheat-show'));
        cheatSheetEl.querySelector('#speech-cheat-close').addEventListener('click', hideCheatSheet);
    }

    function hideCheatSheet() {
        if (!cheatSheetEl) return;
        cheatSheetEl.classList.remove('speech-cheat-show');
        setTimeout(() => {
            if (cheatSheetEl) { cheatSheetEl.remove(); cheatSheetEl = null; }
        }, 250);
    }

    // ══════════════════════════════════════════════
    // ENGINE 1: Web Speech API
    // ══════════════════════════════════════════════
    function createRecognition() {
        if (!hasWebSpeech) return null;

        const r = new SpeechRecognition();
        r.continuous = true;
        r.interimResults = true;
        r.lang = currentLang;
        r.maxAlternatives = 1;

        r.onresult = (event) => {
            let interim = '';
            let finalText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalText += transcript;
                } else {
                    interim += transcript;
                }
            }

            // Show interim text immediately (fast feedback)
            wsaInterimText = interim;
            if (interimText && interim) {
                interimText.textContent = interim;
            }

            // On final result, submit to consensus
            if (finalText) {
                wsaFinalText = finalText;
                console.log('🌐 Web Speech final:', JSON.stringify(finalText));
                submitToConsensus('wsa', finalText);
            }
        };

        r.onerror = (event) => {
            if (event.error === 'no-speech') return; // normal
            if (event.error === 'aborted') return;   // user stopped
            console.warn('🌐 Web Speech error:', event.error);
        };

        r.onend = () => {
            // Auto-restart if still listening
            if (isListening && recognition) {
                try { recognition.start(); } catch (_) {}
            }
        };

        return r;
    }

    function startWebSpeech() {
        if (!hasWebSpeech) return;
        recognition = createRecognition();
        if (recognition) {
            try { recognition.start(); console.log('🌐 Web Speech API started'); }
            catch (_) {}
        }
    }

    function stopWebSpeech() {
        if (recognition) {
            try { recognition.stop(); } catch (_) {}
            recognition = null;
        }
    }

    // ══════════════════════════════════════════════
    // ENGINE 2: Whisper Large V3 Turbo ONNX (WebWorker)
    // ══════════════════════════════════════════════
    function initWorker() {
        if (worker) return;
        const workerURL = new URL('./speech-worker.js', import.meta.url);
        worker = new Worker(workerURL, { type: 'module' });

        worker.addEventListener('message', (e) => {
            const { type } = e.data;

            if (type === 'status') {
                if (e.data.status === 'loading') {
                    modelLoading = true;
                    modelReady = false;
                    updateEngineIndicator();
                    if (interimText) interimText.textContent = e.data.message;
                } else if (e.data.status === 'ready') {
                    modelLoading = false;
                    modelReady = true;
                    updateEngineIndicator();
                    const device = e.data.device || 'wasm';
                    console.log(`🧠 Whisper V3 Turbo loaded and ready (${device})`);
                    if (interimText) interimText.textContent = e.data.message || '🧠 Model ready';
                    // Brief flash of ready message, then switch to listening
                    setTimeout(() => {
                        if (isListening && interimText) interimText.textContent = '🎤 Listening…';
                    }, 1500);
                    if (isListening) startAudioCapture();
                }
            }

            if (type === 'progress') {
                const file = e.data.file || 'model';
                const percent = e.data.percent || 0;
                const loadedMB = e.data.loaded ? (e.data.loaded / 1024 / 1024).toFixed(1) : '?';
                const totalMB = e.data.total ? (e.data.total / 1024 / 1024).toFixed(1) : '?';
                if (interimText) {
                    interimText.textContent = `📥 ${file}: ${loadedMB}/${totalMB} MB (${percent}%)`;
                }
            }

            if (type === 'result') {
                whisperTranscribing = false;
                const text = (e.data.text || '').trim();
                console.log('🧠 Whisper result:', JSON.stringify(text));
                if (text && !isHallucination(text)) {
                    whisperText = text;
                    submitToConsensus('whisper', text);
                }
            }

            if (type === 'error') {
                whisperTranscribing = false;
                console.warn('🧠 Whisper error:', e.data.message);
                if (modelLoading) {
                    modelLoading = false;
                    M.showToast('Failed to load speech model: ' + e.data.message, 'error');
                }
            }

            // Streaming partial results — show as interim text for real-time feedback
            if (type === 'partial') {
                const partialText = (e.data.text || '').trim();
                if (partialText && interimText) {
                    interimText.textContent = '🧠 ' + partialText;
                }
            }
        });
    }

    // ── Audio Capture for Whisper ──────────────
    async function startAudioCapture() {
        try {
            // If we already have a stream from Web Speech API, reuse it
            // Otherwise get a new one
            if (!mediaStream) {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        channelCount: 1,
                        sampleRate: TARGET_SAMPLE_RATE,
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });
            }

            audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: TARGET_SAMPLE_RATE,
            });

            sourceNode = audioContext.createMediaStreamSource(mediaStream);
            const bufferSize = 4096;
            processorNode = audioContext.createScriptProcessor(bufferSize, 1, 1);

            vadBuffer = [];
            vadBufferLength = 0;
            isSpeaking = false;
            silenceFrames = 0;

            processorNode.onaudioprocess = (e) => {
                if (!isListening || !modelReady) return;

                const inputData = e.inputBuffer.getChannelData(0);
                const resampled = resampleIfNeeded(inputData, audioContext.sampleRate, TARGET_SAMPLE_RATE);
                const rms = computeRMS(resampled);

                if (!isSpeaking) {
                    if (rms > VAD_SPEECH_THRESHOLD) {
                        isSpeaking = true;
                        silenceFrames = 0;
                        vadBuffer = [new Float32Array(resampled)];
                        vadBufferLength = resampled.length;
                    }
                } else {
                    vadBuffer.push(new Float32Array(resampled));
                    vadBufferLength += resampled.length;

                    if (rms < VAD_SILENCE_THRESHOLD) {
                        silenceFrames++;
                    } else {
                        silenceFrames = 0;
                    }

                    const speechEnded = silenceFrames >= VAD_SILENCE_FRAMES;
                    const maxReached = vadBufferLength >= VAD_MAX_SPEECH_SAMPLES;

                    if (speechEnded || maxReached) {
                        const trimmedLength = speechEnded
                            ? Math.max(vadBufferLength - (silenceFrames * resampled.length), VAD_MIN_SPEECH_SAMPLES)
                            : vadBufferLength;

                        if (trimmedLength >= VAD_MIN_SPEECH_SAMPLES && !whisperTranscribing) {
                            const combined = combineBuffers(vadBuffer, trimmedLength);
                            whisperTranscribing = true;
                            worker.postMessage({ type: 'transcribe', audio: combined, lang: currentLang.split('-')[0] }, [combined.buffer]);
                        }

                        vadBuffer = [];
                        vadBufferLength = 0;
                        isSpeaking = false;
                        silenceFrames = 0;
                    }
                }
            };

            sourceNode.connect(processorNode);
            processorNode.connect(audioContext.destination);
            console.log('🧠 Audio capture started at', audioContext.sampleRate, 'Hz');
        } catch (err) {
            console.warn('🧠 Audio capture failed:', err);
        }
    }

    function stopAudioCapture() {
        vadBuffer = [];
        vadBufferLength = 0;
        isSpeaking = false;
        silenceFrames = 0;

        if (processorNode) { processorNode.disconnect(); processorNode = null; }
        if (sourceNode) { sourceNode.disconnect(); sourceNode = null; }
        if (audioContext) { audioContext.close().catch(() => {}); audioContext = null; }
        if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
    }

    // ── Audio Utilities ──────────────────────────
    function combineBuffers(buffers, totalLength) {
        const combined = new Float32Array(totalLength);
        let offset = 0;
        for (const buf of buffers) {
            const toCopy = Math.min(buf.length, totalLength - offset);
            combined.set(buf.subarray(0, toCopy), offset);
            offset += toCopy;
            if (offset >= totalLength) break;
        }
        return combined;
    }

    function computeRMS(samples) {
        let sum = 0;
        for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
        return Math.sqrt(sum / samples.length);
    }

    function resampleIfNeeded(inputData, fromRate, toRate) {
        if (fromRate === toRate) return inputData;
        const ratio = fromRate / toRate;
        const newLength = Math.round(inputData.length / ratio);
        const output = new Float32Array(newLength);
        for (let i = 0; i < newLength; i++) {
            const srcIndex = i * ratio;
            const low = Math.floor(srcIndex);
            const high = Math.min(low + 1, inputData.length - 1);
            const frac = srcIndex - low;
            output[i] = inputData[low] * (1 - frac) + inputData[high] * frac;
        }
        return output;
    }

    // ══════════════════════════════════════════════
    // CONSENSUS ENGINE — merges both results
    // ══════════════════════════════════════════════
    function submitToConsensus(source, text) {
        const now = Date.now();

        if (source === 'wsa') {
            pendingWSA = { text, timestamp: now };
        } else if (source === 'whisper') {
            pendingWhisper = { text, timestamp: now };
        }

        // If both are available within the window, resolve immediately
        if (pendingWSA && pendingWhisper) {
            if (consensusTimer) { clearTimeout(consensusTimer); consensusTimer = null; }
            resolveConsensus();
            return;
        }

        // Otherwise wait for the other engine
        if (!consensusTimer) {
            consensusTimer = setTimeout(() => {
                consensusTimer = null;
                resolveConsensus();
            }, CONSENSUS_WAIT_MS);
        }
    }

    function resolveConsensus() {
        const wsaResult = pendingWSA ? pendingWSA.text : null;
        const moonResult = pendingWhisper ? pendingWhisper.text : null;

        // Clear pending
        pendingWSA = null;
        pendingWhisper = null;

        let bestText = '';

        if (wsaResult && moonResult) {
            // Both available — pick best
            bestText = pickBestResult(wsaResult, moonResult);
            console.log('🎯 Consensus (both):', JSON.stringify(bestText));
        } else if (wsaResult) {
            bestText = wsaResult;
            console.log('🎯 Consensus (WSA only):', JSON.stringify(bestText));
        } else if (moonResult) {
            bestText = moonResult;
            console.log('🎯 Consensus (Whisper only):', JSON.stringify(bestText));
        }

        if (!bestText || bestText.trim().length === 0) return;

        // Optionally refine with AI, then insert
        processAndInsert(bestText.trim());
    }

    function pickBestResult(wsaText, moonText) {
        // Scoring heuristic:
        // - Prefer longer result (more content captured)
        // - Penalize very short results
        // - Prefer results with punctuation
        // - Prefer results with proper capitalization
        const wsaScore = scoreText(wsaText);
        const moonScore = scoreText(moonText);

        console.log(`🎯 WSA score: ${wsaScore} | Whisper score: ${moonScore}`);

        // If scores are close (within 2 points), prefer Web Speech API
        // because it has native language support and better real-time quality
        if (Math.abs(wsaScore - moonScore) <= 2) return wsaText;

        return wsaScore >= moonScore ? wsaText : moonText;
    }

    function scoreText(text) {
        if (!text) return 0;
        let score = 0;

        // Word count (more words = more content captured)
        const words = text.trim().split(/\s+/);
        score += Math.min(words.length, 20); // cap at 20

        // Has punctuation
        if (/[.!?,;:]/.test(text)) score += 3;

        // Has proper capitalization
        if (/^[A-Z]/.test(text.trim())) score += 2;

        // Penalize very short text
        if (text.trim().length < 5) score -= 5;

        // Penalize if it looks like a hallucination
        if (isHallucination(text)) score -= 10;

        // Bonus for having mixed case (more natural)
        if (/[a-z]/.test(text) && /[A-Z]/.test(text)) score += 1;

        return score;
    }

    // ══════════════════════════════════════════════
    // ENGINE 3: AI Refinement (optional)
    // ══════════════════════════════════════════════
    async function processAndInsert(rawText) {
        let finalText = rawText;
        console.log('📝 processAndInsert called with:', JSON.stringify(rawText));

        try {
            // Try AI refinement if enabled and LLM is ready
            if (aiRefineEnabled && M.requestAiTask && M.isCurrentModelReady && M.isCurrentModelReady()) {
                try {
                    if (interimText) interimText.textContent = '✨ AI refining…';
                    // Race AI refinement against a 5-second timeout to prevent blocking
                    const refined = await Promise.race([
                        M.requestAiTask({
                            taskType: 'generate',
                            context: '',
                            userPrompt: `Clean up this speech-to-text transcription. Fix punctuation, capitalization, and grammar only. Do NOT change the meaning, remove words, or add new content. Return ONLY the cleaned text, nothing else:\n\n"${rawText}"`,
                            enableThinking: false,
                            silent: true,
                        }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('AI refinement timed out')), 5000)),
                    ]);
                    if (refined && refined.trim().length > 0) {
                        finalText = refined.trim().replace(/^["']|["']$/g, '');
                        console.log('✨ AI refined:', JSON.stringify(finalText));
                    } else {
                        finalText = addBasicPunctuation(rawText);
                    }
                } catch (err) {
                    console.warn('✨ AI refinement failed, using built-in punctuation:', err.message);
                    finalText = addBasicPunctuation(rawText);
                }
            } else {
                // Fallback: built-in punctuation when no LLM available
                finalText = addBasicPunctuation(rawText);
            }
        } catch (outerErr) {
            // Absolute safety net — always insert something
            console.error('📝 processAndInsert outer error:', outerErr);
            finalText = addBasicPunctuation(rawText);
        }

        // Apply voice commands and insert — this MUST always execute
        let processed = applyMarkdownCommands(finalText);
        processed = autoCapitalize(processed);
        console.log('📝 Inserting into editor:', JSON.stringify(processed));
        insertAtCursor(processed + ' ');
        lastInsertTime = Date.now();
        if (interimText) interimText.textContent = '🎤 Listening…';
    }

    /**
     * Built-in punctuation and capitalization for when no LLM is available.
     * Adds sentence-ending periods and capitalizes first letters.
     */
    function addBasicPunctuation(text) {
        if (!text || text.trim().length === 0) return text;
        let result = text.trim();

        // Capitalize first letter
        result = result.charAt(0).toUpperCase() + result.slice(1);

        // Add period at end if missing punctuation
        if (!/[.!?;:,]$/.test(result)) {
            result += '.';
        }

        return result;
    }

    // ── Pause Detection (auto paragraph) ──────────
    function startPauseDetection() {
        stopPauseDetection();
        pauseTimer = setInterval(() => {
            if (!isListening) { stopPauseDetection(); return; }
            const elapsed = Date.now() - lastInsertTime;
            if (elapsed >= PAUSE_THRESHOLD) {
                const editor = M.markdownEditor;
                if (editor && !editor.value.endsWith('\n\n') && editor.value.length > 0) {
                    insertAtCursor('\n\n');
                }
                lastInsertTime = Date.now();
            }
        }, 1000);
    }

    function stopPauseDetection() {
        if (pauseTimer) { clearInterval(pauseTimer); pauseTimer = null; }
    }

    // ── Engine Indicator ──────────────────────────
    function updateEngineIndicator() {
        const parts = [];
        if (hasWebSpeech) parts.push('🌐');
        if (modelReady) parts.push('🧠');
        else if (modelLoading) parts.push('⏳');
        if (aiRefineEnabled) parts.push('✨');

        if (langLabel) {
            const lang = LANGUAGES.find(l => l.code === currentLang);
            langLabel.textContent = lang ? lang.short : 'EN';
            langLabel.title = parts.join(' ') + ' · ' + (lang ? lang.label : 'English');
        }
    }

    // ── Start / Stop ──────────────────────────────
    function startListening() {
        if (isListening) return;
        isListening = true;
        lastInsertTime = Date.now();

        // Reset consensus
        pendingWSA = null;
        pendingWhisper = null;

        updateUI(true);
        startPauseDetection();

        // Start Engine 1: Web Speech API
        startWebSpeech();

        // Start Engine 2: Whisper (init worker + load model if needed)
        initWorker();
        if (!modelReady && !modelLoading) {
            worker.postMessage({ type: 'init' });
        } else if (modelReady) {
            startAudioCapture();
        }
        // If loading, startAudioCapture() will be called when 'ready' fires

        updateEngineIndicator();

        if (interimText) interimText.textContent = '🎤 Listening…';
    }

    function stopListening() {
        isListening = false;
        stopPauseDetection();
        hideCheatSheet();
        hideLangDropdown();

        // Stop both engines
        stopWebSpeech();
        stopAudioCapture();

        // Flush any pending consensus
        if (pendingWSA || pendingWhisper) {
            if (consensusTimer) { clearTimeout(consensusTimer); consensusTimer = null; }
            resolveConsensus();
        }

        updateUI(false);
        if (interimText) interimText.textContent = '';
    }

    function toggleListening() {
        if (isListening) stopListening();
        else startListening();
    }

    // ── UI Updates ────────────────────────────────
    function updateUI(active) {
        if (micBtn) {
            micBtn.classList.toggle('speech-active', active);
            micBtn.innerHTML = active ? '<i class="bi bi-mic-fill"></i>' : '<i class="bi bi-mic"></i>';
            micBtn.title = active ? 'Stop Dictation' : 'Voice Dictation (Speech to Text)';
        }
        if (mobileMicBtn) {
            mobileMicBtn.classList.toggle('speech-active', active);
            mobileMicBtn.innerHTML = active
                ? '<i class="bi bi-mic-fill me-2"></i> Stop Dictation'
                : '<i class="bi bi-mic me-2"></i> Voice Dictation';
        }
        if (statusBar) statusBar.style.display = active ? 'flex' : 'none';
        if (active) showCheatSheet();
    }

    // ── Event Listeners ───────────────────────────
    if (micBtn) micBtn.addEventListener('click', toggleListening);
    if (mobileMicBtn) mobileMicBtn.addEventListener('click', () => {
        toggleListening();
        if (M.mobileMenuPanel) M.mobileMenuPanel.classList.remove('show');
        if (M.mobileMenuOverlay) M.mobileMenuOverlay.classList.remove('show');
    });
    if (langBtn) {
        langBtn.title = 'Change language';
        langBtn.innerHTML = '<i class="bi bi-globe2"></i>';
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showLangDropdown();
        });
    }
    if (stopBtn) stopBtn.addEventListener('click', stopListening);
    if (helpBtn) helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (cheatSheetEl) hideCheatSheet();
        else showCheatSheet();
    });

    // Keyboard shortcut: Ctrl+Shift+V
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'V') {
            e.preventDefault();
            toggleListening();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (isListening) stopListening();
    });

    // ── Initial Lang Label ────────────────────────
    updateLangLabel();

    // ── Expose to MDView ──────────────────────────
    M.speechToText = {
        start: startListening,
        stop: stopListening,
        toggle: toggleListening,
        isListening: () => isListening,
        setAiRefine: (enabled) => { aiRefineEnabled = enabled; updateEngineIndicator(); },
        getEngines: () => ({
            webSpeech: hasWebSpeech,
            whisper: modelReady,
            aiRefine: aiRefineEnabled,
        }),
    };

    console.log(`🎤 speechToText loaded — Dual Engine [Web Speech: ${hasWebSpeech ? '✓' : '✗'}, Whisper V3 Turbo: pending]`);
})();
