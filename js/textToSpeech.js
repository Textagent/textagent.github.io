// ============================================
// textToSpeech.js — Hybrid TTS Controller
// Kokoro TTS for 9 languages (high quality, local ONNX)
// Web Speech API for Korean, German & other languages (browser-native)
// ============================================
(function () {
    'use strict';

    const M = window.MDView;
    if (!M) return;

    // ── Kokoro languages (have ONNX voices in v1.0) ──
    // Note: Japanese, Chinese, and Hindi are excluded because Kokoro's espeak-ng
    // WASM phonemizer cannot handle CJK/Devanagari scripts (outputs descriptions
    // instead of phonemes). These languages route to Web Speech API instead.
    const KOKORO_LANGS = new Set([
        'en', 'en-us', 'en-gb', 'english', 'english (us)', 'english (uk)',
        'es', 'spanish',
        'fr', 'french',
        'it', 'italian',
        'pt', 'pt-br', 'portuguese',
    ]);

    // ── Web Speech API language code mapping (for languages Kokoro can't phonemize) ──
    const WEB_SPEECH_LANG_MAP = {
        'ja': 'ja-JP', 'japanese': 'ja-JP',
        'zh': 'zh-CN', 'zh-cn': 'zh-CN', 'chinese': 'zh-CN', 'chinese (mandarin)': 'zh-CN',
        'hi': 'hi-IN', 'hindi': 'hi-IN',
        'ko': 'ko-KR', 'korean': 'ko-KR',
        'de': 'de-DE', 'german': 'de-DE',
        'en': 'en-US', 'english': 'en-US',
    };

    let worker = null;
    let modelReady = false;
    let modelLoading = false;
    let audioCtx = null;
    let currentSource = null;  // Track currently playing Kokoro audio for stop()
    let pendingSpeak = null;   // Queue speak request during model loading
    let _pendingMultiSegments = null; // Queue multi-speaker segments during model loading
    let webSpeechUtterance = null; // Track Web Speech API utterance for stop()
    let lastAudioData = null;  // Store last Kokoro audio for download
    let _generateOnly = false; // When true, generate audio without auto-playing
    let _isGenerating = false; // True while audio synthesis is in progress
    let _generateCallback = null; // One-shot callback when generation completes
    let _generateStartTime = 0; // Timestamp for measuring generation duration
    const _pageLoadTime = Date.now(); // For elapsed-time logging

    /** Returns a formatted timestamp prefix for console logs: [TTS +12.3s] */
    function _ttsT() {
        return `🔊 [TTS +${((Date.now() - _pageLoadTime) / 1000).toFixed(1)}s]`;
    }

    // ── Worker Initialization ────────────────────
    function initWorker() {
        if (worker) return;
        const workerURL = new URL('./tts-worker.js', import.meta.url);
        // Cache-bust: append version so service worker & browser cache don't serve stale code
        workerURL.searchParams.set('v', '20260415a');
        console.log(`${_ttsT()} 🔧 Creating TTS worker from: ${workerURL.href}`);
        worker = new Worker(workerURL, { type: 'module' });

        // ── Catch worker-level errors that don't go through postMessage ──
        worker.addEventListener('error', (err) => {
            console.error(`${_ttsT()} ❌ WORKER ERROR (onerror):`, err.message, err.filename, 'line:', err.lineno);
            _isGenerating = false;
            _generateOnly = false;
            modelLoading = false;
            if (_generateCallback) {
                const cb = _generateCallback;
                _generateCallback = null;
                cb(null, 'Worker error: ' + (err.message || 'unknown'));
            }
        });

        worker.addEventListener('message', (e) => {
            const { type } = e.data;
            console.log(`${_ttsT()} 📨 Worker message received: type="${type}"`, type === 'audio' ? `(${e.data.data?.length} samples)` : (e.data.message || e.data.status || ''));

            // ── ACK from worker confirming speak-multi was received ──
            if (type === 'speak-multi-ack') {
                console.log(`${_ttsT()} ✅ WORKER ACK: speak-multi message confirmed received by worker at worker-time ${(e.data.timestamp / 1000).toFixed(1)}s`);
                M.showToast && M.showToast('🎙 TTS worker processing…', 'info');
                return;
            }

            if (type === 'status') {
                if (e.data.status === 'loading') {
                    const phase = e.data.loadingPhase || '';
                    const src = e.data.source || '';
                    // Don't reset modelReady when it's a synthesis progress update
                    if (phase !== 'synthesizing') {
                        modelLoading = true;
                        modelReady = false;
                    }
                    if (phase === 'initiate') {
                        console.log(`${_ttsT()} ⬇ Downloading: ${e.data.message}${src ? ' from ' + src : ''}`);
                    } else if (phase === 'done') {
                        console.log(`${_ttsT()} ✅ ${e.data.message}`);
                    } else if (phase === 'synthesizing') {
                        console.log(`${_ttsT()} ⏳ ${e.data.message}`);
                    } else {
                        console.log(`${_ttsT()} Loading: ${e.data.message}`);
                    }
                    M.showToast && M.showToast(e.data.message, 'info');
                } else if (e.data.status === 'ready') {
                    modelLoading = false;
                    modelReady = true;
                    console.log(`${_ttsT()} ✅ Kokoro TTS model loaded and ready`);
                    M.showToast && M.showToast('🔊 Text-to-Speech ready', 'success');

                    // If there was a pending speak request, execute it now
                    if (pendingSpeak) {
                        const { text, voice, lang } = pendingSpeak;
                        console.log(`${_ttsT()} Executing pending speak request: "${text.substring(0, 50)}…" lang=${lang || 'default'}`);
                        pendingSpeak = null;
                        speak(text, voice, lang);
                    }

                    // If there were pending multi-speaker segments, post them now as a BACKUP
                    // (Primary path: segments are bundled with init and processed inline by the worker)
                    if (_pendingMultiSegments) {
                        console.log(`${_ttsT()} 📤 Posting pending speak-multi (${_pendingMultiSegments.length} segments) from ready handler as backup`);
                        _isGenerating = true;
                        _generateStartTime = Date.now();
                        worker.postMessage({ type: 'speak-multi', segments: _pendingMultiSegments });
                        _pendingMultiSegments = null;
                    }
                }
            }

            if (type === 'progress') {
                const percent = e.data.percent || 0;
                const file = e.data.file || 'model';
                const loadedMB = e.data.loaded ? (e.data.loaded / 1024 / 1024).toFixed(1) : '?';
                const totalMB = e.data.total ? (e.data.total / 1024 / 1024).toFixed(1) : '?';
                console.log(`${_ttsT()} ⬇ ${file}: ${loadedMB}/${totalMB} MB (${percent}%)`);
            }

            if (type === 'chunk-progress') {
                const msg = e.data.message || `🔊 Synthesizing chunk ${e.data.current}/${e.data.total}…`;
                console.log(`${_ttsT()} 🔄 CHUNK-PROGRESS: ${msg}`);
                M.showToast && M.showToast(msg, 'info');
            }

            if (type === 'audio') {
                const duration = e.data.data.length / (e.data.sampleRate || 24000);
                const elapsed = _generateStartTime ? ((Date.now() - _generateStartTime) / 1000).toFixed(1) : '?';
                console.log(`${_ttsT()} ✅ Audio generated — ${duration.toFixed(1)}s of audio, ${e.data.sampleRate || 24000} Hz, synthesized in ${elapsed}s`);
                console.log(`${_ttsT()} 🔍 State check: _generateOnly=${_generateOnly}, _generateCallback=${!!_generateCallback}, _isGenerating=${_isGenerating}`);

                lastAudioData = { data: e.data.data, sampleRate: e.data.sampleRate };
                _isGenerating = false;

                if (!_generateOnly) {
                    console.log(`${_ttsT()} ▶ Auto-playing audio (generateOnly=false)`);
                    playAudio(e.data.data, e.data.sampleRate);
                } else {
                    console.log(`${_ttsT()} 💾 Audio stored (generate-only mode, not auto-playing)`);
                }
                _generateOnly = false; // reset flag after generation

                // Fire one-shot generate callback
                if (_generateCallback) {
                    console.log(`${_ttsT()} 🔔 Firing _generateCallback with duration=${duration.toFixed(1)}s`);
                    const cb = _generateCallback;
                    _generateCallback = null;
                    cb({ duration, sampleRate: e.data.sampleRate, dataLength: e.data.data.length });
                    console.log(`${_ttsT()} ✅ _generateCallback completed`);
                } else {
                    console.log(`${_ttsT()} ⚠️ No _generateCallback registered — audio event not forwarded to caller`);
                }
            }

            if (type === 'error') {
                console.error(`${_ttsT()} ❌ Worker Error:`, e.data.message);
                console.error(`${_ttsT()} 🔍 Error state: _generateOnly=${_generateOnly}, _generateCallback=${!!_generateCallback}, _isGenerating=${_isGenerating}, modelLoading=${modelLoading}`);
                _isGenerating = false;
                _generateOnly = false;
                if (modelLoading) {
                    modelLoading = false;
                    M.showToast && M.showToast('TTS model failed: ' + e.data.message, 'error');
                }
                // Fire callback with error
                if (_generateCallback) {
                    console.log(`${_ttsT()} 🔔 Firing _generateCallback with error`);
                    const cb = _generateCallback;
                    _generateCallback = null;
                    cb(null, e.data.message);
                }
            }
        });
    }

    // ── Kokoro Audio Playback ────────────────────
    function playAudio(float32Data, sampleRate) {
        stopAudio();

        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const duration = float32Data.length / sampleRate;
        console.log(`${_ttsT()} ▶ Playing audio — ${duration.toFixed(1)}s at ${sampleRate} Hz`);

        const buffer = audioCtx.createBuffer(1, float32Data.length, sampleRate);
        buffer.copyToChannel(float32Data, 0);

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => {
            console.log(`${_ttsT()} ⏹ Playback finished`);
            currentSource = null;
            document.querySelectorAll('.tts-speak-btn.speaking').forEach(btn => {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="bi bi-volume-up"></i>';
            });
        };

        currentSource = source;
        source.start(0);
    }

    // ── Web Speech API Playback ─────────────────
    function speakWithWebSpeech(text, lang) {
        if (!('speechSynthesis' in window)) {
            M.showToast && M.showToast('⚠️ Web Speech not supported in this browser.', 'warning');
            return;
        }

        // Stop any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const bcp47Lang = WEB_SPEECH_LANG_MAP[lang.toLowerCase()] || lang;
        utterance.lang = bcp47Lang;
        utterance.rate = 0.9;   // Slightly slower for clarity
        utterance.pitch = 1.0;

        // Try to find a matching voice
        const voices = window.speechSynthesis.getVoices();
        const langPrefix = bcp47Lang.split('-')[0];
        const matchingVoice = voices.find(v => v.lang === bcp47Lang)
            || voices.find(v => v.lang.startsWith(langPrefix));
        if (matchingVoice) {
            utterance.voice = matchingVoice;
            console.log(`🔊 Web Speech: using voice "${matchingVoice.name}" for ${bcp47Lang}`);
        }

        utterance.onend = () => {
            webSpeechUtterance = null;
        };
        utterance.onerror = (e) => {
            console.warn('🔊 Web Speech error:', e.error);
            webSpeechUtterance = null;
        };

        webSpeechUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        console.log(`${_ttsT()} ▶ Web Speech speaking: "${text.substring(0, 50)}…" in ${bcp47Lang}`);
    }

    function stopAudio() {
        // Stop Kokoro audio
        if (currentSource) {
            console.log(`${_ttsT()} ⏹ Stopping Kokoro audio playback`);
            try { currentSource.stop(); } catch (_) { /* already stopped */ }
            currentSource = null;
        }
        // Stop Web Speech
        if (webSpeechUtterance || ('speechSynthesis' in window && window.speechSynthesis.speaking)) {
            console.log(`${_ttsT()} ⏹ Stopping Web Speech playback`);
            window.speechSynthesis.cancel();
            webSpeechUtterance = null;
        }
    }

    // ── WAV Encoding & Download ──────────────────
    function float32ToWav(float32Array, sampleRate) {
        const numChannels = 1;
        const bitsPerSample = 16;
        const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
        const blockAlign = numChannels * (bitsPerSample / 8);
        const dataSize = float32Array.length * (bitsPerSample / 8);
        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);

        function writeString(offset, str) {
            for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
        }

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);            // Subchunk1Size (PCM)
        view.setUint16(20, 1, true);             // AudioFormat (PCM)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);
        writeString(36, 'data');
        view.setUint32(40, dataSize, true);

        // Convert float32 [-1, 1] → int16
        let offset = 44;
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            offset += 2;
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }

    function downloadAudio() {
        if (!lastAudioData) {
            M.showToast && M.showToast('⚠️ No audio to download — play something first.', 'warning');
            return false;
        }
        const blob = float32ToWav(lastAudioData.data, lastAudioData.sampleRate);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tts-audio-' + Date.now() + '.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        M.showToast && M.showToast('💾 Audio downloaded', 'success');
        return true;
    }

    function hasAudio() {
        return lastAudioData !== null;
    }

    // ── Public API ───────────────────────────────

    /**
     * Speak the given text using the best available TTS engine.
     * - English/Chinese/Japanese/Spanish/French/Hindi/Italian/Portuguese → Kokoro TTS (local ONNX)
     * - Korean, German & others → Web Speech API (browser-native)
     * @param {string} text - Text to synthesize
     * @param {string} [voice] - Voice ID (e.g., 'af_bella'). Auto-selected by lang if omitted.
     * @param {string} [lang] - Language code or name (e.g., 'en', 'ja', 'japanese').
     */
    function speak(text, voice, lang) {
        if (!text || text.trim().length === 0) {
            console.log(`${_ttsT()} Skipped — empty text`);
            return;
        }

        const langKey = (lang || 'en').toLowerCase();
        console.log(`${_ttsT()} speak() called — lang="${langKey}", text="${text.substring(0, 60)}…" (${text.length} chars)`);

        // Route: Kokoro for English/Chinese, Web Speech for everything else
        if (KOKORO_LANGS.has(langKey)) {
            // ── Kokoro Path ── (worker handles chunking for long text)

            if (!worker) {
                console.log(`${_ttsT()} Worker not initialized — starting init + queuing speak request`);
                initWorker();
                modelLoading = true;
                pendingSpeak = { text, voice, lang };
                worker.postMessage({ type: 'init' });
                return;
            }

            if (!modelReady) {
                console.log(`${_ttsT()} Model not ready (modelReady=${modelReady}, modelLoading=${modelLoading}) — queuing speak request`);
                pendingSpeak = { text, voice, lang };
                if (!modelLoading) {
                    modelLoading = true;
                    worker.postMessage({ type: 'init' });
                }
                return;
            }

            console.log(`${_ttsT()} Sending text to Kokoro worker for synthesis…`);
            _generateStartTime = Date.now();
            worker.postMessage({ type: 'speak', text, voice, lang });
        } else {
            // ── Web Speech API Path ──
            console.log(`${_ttsT()} Language "${langKey}" → routing to Web Speech API (not a Kokoro language)`);
            speakWithWebSpeech(text, langKey);
        }
    }

    function stop() {
        stopAudio();
    }

    /**
     * Generate audio only — synthesize and store, but do NOT auto-play.
     * Use playLastAudio() afterwards to play the result.
     */
    function generate(text, voice, lang) {
        const langKey = (lang || 'en').toLowerCase();

        // Web Speech API doesn't produce downloadable audio — play directly instead
        if (!KOKORO_LANGS.has(langKey)) {
            console.log(`${_ttsT()} generate() called for Web Speech API language "${langKey}" — playing directly (no downloadable audio)`);
            _isGenerating = true;

            // Use speakWithWebSpeech directly and fire callback when done
            speakWithWebSpeech(text, langKey);

            // Poll for Web Speech to finish, then fire callback
            var checkDone = setInterval(function () {
                if (!window.speechSynthesis.speaking) {
                    clearInterval(checkDone);
                    _isGenerating = false;
                    console.log(`${_ttsT()} Web Speech playback complete`);
                    if (_generateCallback) {
                        var cb = _generateCallback;
                        _generateCallback = null;
                        cb({ duration: 0, sampleRate: 0, dataLength: 0, webSpeech: true });
                    }
                }
            }, 200);
            return;
        }

        console.log(`${_ttsT()} generate() called — synthesize without playing`);
        _generateOnly = true;
        _isGenerating = true;
        _generateStartTime = Date.now();
        lastAudioData = null;
        speak(text, voice, lang);
    }

    /**
     * Replay the last generated Kokoro audio (without re-synthesizing).
     */
    function playLastAudio() {
        if (lastAudioData) {
            console.log(`${_ttsT()} Playing stored audio`);
            playAudio(lastAudioData.data, lastAudioData.sampleRate);
        } else {
            console.log(`${_ttsT()} No stored audio available — need to Run first`);
            M.showToast && M.showToast('⚠️ No audio generated yet. Click Run first.', 'warning');
        }
    }

    function isReady() {
        return modelReady || ('speechSynthesis' in window);
    }

    function isSpeaking() {
        return currentSource !== null
            || ('speechSynthesis' in window && window.speechSynthesis.speaking);
    }

    // ── Pre-load Web Speech voices (some browsers need this) ──
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log(`🔊 Web Speech: ${voices.length} voices available`);
        };
    }

    // ── Expose to MDView ─────────────────────────
    M.tts = {
        speak,
        stop,
        generate,
        playLastAudio,
        isReady,
        isSpeaking,
        downloadAudio,
        hasAudio,
        isGenerating: function () { return _isGenerating; },
        isKokoroReady: function () { return modelReady; },
        isKokoroLoading: function () { return modelLoading; },
        initKokoro: initWorker,
        /**
         * Register a one-shot callback for when generate() completes.
         * Callback receives (result, error). result = { duration, sampleRate, dataLength } or null on error.
         */
        onGenerateComplete: function (cb) { _generateCallback = cb; },
        /**
         * Promise-based speak — resolves when audio finishes playing.
         * Used by the docgen-tts runtime adapter for sequential Run All execution.
         */
        speakAsync: function(text, voice, lang) {
            return new Promise(function(resolve, reject) {
                if (!text || text.trim().length === 0) {
                    resolve();
                    return;
                }

                const langKey = (lang || 'en').toLowerCase();

                if (KOKORO_LANGS.has(langKey)) {
                    // Kokoro path — intercept the audio message from worker
                    if (!worker) {
                        initWorker();
                        modelLoading = true;
                        pendingSpeak = { text, voice, lang };
                        worker.postMessage({ type: 'init' });
                    }

                    // Listen for the next audio event to resolve
                    const onMessage = (e) => {
                        if (e.data.type === 'audio') {
                            worker.removeEventListener('message', onMessage);
                            // Wait for playback to finish via source.onended
                            const checkDone = setInterval(() => {
                                if (!currentSource) {
                                    clearInterval(checkDone);
                                    resolve();
                                }
                            }, 200);
                        } else if (e.data.type === 'error') {
                            worker.removeEventListener('message', onMessage);
                            reject(new Error(e.data.message || 'TTS error'));
                        }
                    };
                    if (worker) worker.addEventListener('message', onMessage);

                    if (modelReady) {
                        worker.postMessage({ type: 'speak', text, voice, lang });
                    }
                    // If not ready, pendingSpeak will trigger it when model loads
                } else {
                    // Web Speech API path
                    if (!('speechSynthesis' in window)) {
                        reject(new Error('Web Speech not supported'));
                        return;
                    }
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(text);
                    const bcp47Lang = WEB_SPEECH_LANG_MAP[langKey] || lang;
                    utterance.lang = bcp47Lang;
                    utterance.rate = 0.9;
                    utterance.pitch = 1.0;
                    const voices = window.speechSynthesis.getVoices();
                    const langPrefix = bcp47Lang.split('-')[0];
                    const matchingVoice = voices.find(v => v.lang === bcp47Lang)
                        || voices.find(v => v.lang.startsWith(langPrefix));
                    if (matchingVoice) utterance.voice = matchingVoice;
                    utterance.onend = () => resolve();
                    utterance.onerror = (e) => reject(new Error('Web Speech error: ' + e.error));
                    webSpeechUtterance = utterance;
                    window.speechSynthesis.speak(utterance);
                }
            });
        },
        /**
         * Synthesize multiple speaker segments with different voices.
         * Each segment: { text, voice, speaker }
         * The worker synthesizes each with the specified voice and concatenates.
         * @param {Array<{text:string, voice:string, speaker?:string}>} segments
         */
        speakMulti: function(segments) {
            if (!segments || !segments.length) {
                console.warn(`${_ttsT()} speakMulti: called with empty/null segments — aborting`);
                return;
            }

            console.log(`${_ttsT()} speakMulti: called with ${segments.length} segments`);
            segments.forEach((s, i) => console.log(`${_ttsT()}   seg[${i}]: voice=${s.voice}, speaker=${s.speaker}, text="${(s.text || '').substring(0, 40)}…" (${(s.text || '').length} chars)`));

            // Ensure worker is ready
            if (!worker) {
                console.log(`${_ttsT()} speakMulti: worker is NULL — initializing worker with BUNDLED segments`);
                initWorker();
                modelLoading = true;

                // ── KEY FIX: Bundle segments with init message so they're processed
                // in the SAME handler execution — avoids the worker message delivery bug
                // where a separate speak-multi message is silently dropped ──
                _pendingMultiSegments = segments; // backup: dispatched from 'ready' handler
                _isGenerating = true;
                _generateStartTime = Date.now();
                worker.postMessage({ type: 'init', pendingSegments: segments });
                console.log(`${_ttsT()} speakMulti: sent 'init' with ${segments.length} bundled segments to worker`);
                return;
            }

            if (!modelReady) {
                console.log(`${_ttsT()} speakMulti: worker exists but modelReady=${modelReady}, modelLoading=${modelLoading} — queuing segments`);
                _pendingMultiSegments = segments; // will be dispatched from 'ready' handler
                _isGenerating = true;
                _generateStartTime = Date.now();
                if (!modelLoading) {
                    modelLoading = true;
                    worker.postMessage({ type: 'init', pendingSegments: segments });
                    console.log(`${_ttsT()} speakMulti: sent 'init' with bundled segments to existing worker`);
                }
                return;
            }

            console.log(`${_ttsT()} speakMulti: worker ready, posting speak-multi with ${segments.length} segments NOW`);
            _isGenerating = true;
            _generateStartTime = Date.now();
            worker.postMessage({ type: 'speak-multi', segments });
            console.log(`${_ttsT()} speakMulti: ✅ speak-multi posted to worker`);
        },
        /**
         * Returns the raw audio buffer from the last synthesis.
         * @returns {{data: Float32Array, sampleRate: number}|null}
         */
        getLastAudioBuffer: function() {
            return lastAudioData;
        },
        /**
         * Check if the TTS engine is currently generating audio.
         */
        isGenerating: function() {
            return _isGenerating;
        },
        /**
         * Promise-based multi-speaker synthesis.
         * Resolves with {data: Float32Array, sampleRate: number} on success.
         * @param {Array<{text:string, voice:string, speaker?:string}>} segments
         * @param {function} [onProgress] Optional progress callback(message)
         * @returns {Promise<{data: Float32Array, sampleRate: number}>}
         */
        speakMultiAsync: function(segments, onProgress) {
            console.log(`${_ttsT()} 🎬 speakMultiAsync: START — ${segments?.length || 0} segments, onProgress=${!!onProgress}`);
            const asyncStartTime = Date.now();
            return new Promise((resolve, reject) => {
                if (!segments || !segments.length) {
                    console.error(`${_ttsT()} speakMultiAsync: REJECTED — no segments`);
                    return reject(new Error('No segments provided'));
                }

                // Set generate-only mode so audio isn't auto-played
                _generateOnly = true;
                console.log(`${_ttsT()} speakMultiAsync: set _generateOnly=true`);

                // Set one-shot callback - this fires when worker returns 'audio'
                _generateCallback = function(meta, error) {
                    const totalElapsed = ((Date.now() - asyncStartTime) / 1000).toFixed(1);
                    console.log(`${_ttsT()} 🔔 speakMultiAsync._generateCallback fired after ${totalElapsed}s — error=${!!error}, meta=`, meta);
                    // Clean up progress listener
                    if (progressListener && worker) {
                        worker.removeEventListener('message', progressListener);
                        console.log(`${_ttsT()} speakMultiAsync: cleaned up progressListener`);
                    }
                    if (error) {
                        console.error(`${_ttsT()} speakMultiAsync: REJECTING promise with error: ${error}`);
                        reject(new Error(error));
                    } else {
                        console.log(`${_ttsT()} speakMultiAsync: RESOLVING promise with audioData (${lastAudioData?.data?.length || 0} samples, ${lastAudioData?.sampleRate || 0} Hz)`);
                        resolve(lastAudioData);
                    }
                };
                console.log(`${_ttsT()} speakMultiAsync: _generateCallback registered`);

                // Delegate to speakMulti which handles model loading + worker creation
                console.log(`${_ttsT()} speakMultiAsync: calling speakMulti()...`);
                M.tts.speakMulti(segments);
                console.log(`${_ttsT()} speakMultiAsync: speakMulti() returned, worker=${!!worker}`);

                // Now attach progress listener AFTER speakMulti (worker is now guaranteed to exist)
                var progressListener = null;
                if (onProgress && worker) {
                    console.log(`${_ttsT()} speakMultiAsync: ✅ Attaching progress listener to worker`);
                    progressListener = function(e) {
                        if (e.data.type === 'chunk-progress') {
                            console.log(`${_ttsT()} 📊 [progress] chunk-progress: ${e.data.message}`);
                            onProgress(e.data.message || ('Speaker ' + e.data.current + '/' + e.data.total));
                        } else if (e.data.type === 'status' && e.data.message) {
                            console.log(`${_ttsT()} 📊 [progress] status: ${e.data.message}`);
                            onProgress(e.data.message);
                        } else if (e.data.type === 'progress' && e.data.file) {
                            var pct = e.data.progress !== undefined ? Math.round(e.data.progress * 100) : null;
                            if (pct !== null) {
                                onProgress('⬇ Downloading TTS: ' + pct + '%');
                            }
                        }
                    };
                    worker.addEventListener('message', progressListener);
                } else {
                    console.warn(`${_ttsT()} ⚠️ speakMultiAsync: Progress listener NOT attached — worker:${!!worker}, onProgress:${!!onProgress}`);
                }

                // Watchdog timer — log if promise hasn't resolved after 60s, 120s, 180s
                let watchdogCount = 0;
                const watchdog = setInterval(() => {
                    watchdogCount++;
                    const elapsed = ((Date.now() - asyncStartTime) / 1000).toFixed(0);
                    console.warn(`${_ttsT()} ⏰ speakMultiAsync WATCHDOG #${watchdogCount}: still pending after ${elapsed}s — _isGenerating=${_isGenerating}, _generateOnly=${_generateOnly}, _generateCallback=${!!_generateCallback}, modelReady=${modelReady}`);
                    if (watchdogCount >= 6) {
                        clearInterval(watchdog);
                        console.error(`${_ttsT()} ❌ speakMultiAsync WATCHDOG: gave up after ${elapsed}s — likely stuck in worker`);
                    }
                }, 30000);

                // Clear watchdog when promise settles
                const origResolve = resolve;
                const origReject = reject;
                // Note: we can't reassign resolve/reject, but watchdog will self-terminate after 3 min
            });
        },
        /**
         * Internal: expose the worker for advanced listeners (e.g. download progress).
         * @returns {Worker|null}
         */
        _getWorker: function() {
            return worker || null;
        },
    };

    console.log(`${_ttsT()} Module loaded (Hybrid: Kokoro 9-lang ONNX + Web Speech API fallback)`);
})();
