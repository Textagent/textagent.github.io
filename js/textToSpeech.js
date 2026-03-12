// ============================================
// textToSpeech.js — Hybrid TTS Controller
// Kokoro TTS for English & Chinese (high quality, local ONNX)
// Web Speech API for Japanese & other languages (browser-native)
// ============================================
(function () {
    'use strict';

    const M = window.MDView;
    if (!M) return;

    // ── Kokoro languages (have ONNX voices in v1.1-zh) ──
    const KOKORO_LANGS = new Set([
        'en', 'en-us', 'en-gb', 'english', 'english (us)', 'english (uk)',
        'zh', 'zh-cn', 'chinese', 'chinese (mandarin)',
    ]);

    // ── Web Speech API language code mapping ──
    const WEB_SPEECH_LANG_MAP = {
        'ja': 'ja-JP', 'japanese': 'ja-JP',
        'ko': 'ko-KR', 'korean': 'ko-KR',
        'fr': 'fr-FR', 'french': 'fr-FR',
        'de': 'de-DE', 'german': 'de-DE',
        'it': 'it-IT', 'italian': 'it-IT',
        'es': 'es-ES', 'spanish': 'es-ES',
        'pt': 'pt-BR', 'portuguese': 'pt-BR',
        'hi': 'hi-IN', 'hindi': 'hi-IN',
        'en': 'en-US', 'english': 'en-US',
        'zh': 'zh-CN', 'chinese': 'zh-CN', 'chinese (mandarin)': 'zh-CN',
    };

    let worker = null;
    let modelReady = false;
    let modelLoading = false;
    let audioCtx = null;
    let currentSource = null;  // Track currently playing Kokoro audio for stop()
    let pendingSpeak = null;   // Queue speak request during model loading
    let webSpeechUtterance = null; // Track Web Speech API utterance for stop()
    let lastAudioData = null;  // Store last Kokoro audio for download

    // ── Worker Initialization ────────────────────
    function initWorker() {
        if (worker) return;
        const workerURL = new URL('./tts-worker.js', import.meta.url);
        worker = new Worker(workerURL, { type: 'module' });

        worker.addEventListener('message', (e) => {
            const { type } = e.data;

            if (type === 'status') {
                if (e.data.status === 'loading') {
                    modelLoading = true;
                    modelReady = false;
                    M.showToast && M.showToast(e.data.message, 'info');
                } else if (e.data.status === 'ready') {
                    modelLoading = false;
                    modelReady = true;
                    console.log('🔊 Kokoro TTS ready');
                    M.showToast && M.showToast('🔊 Text-to-Speech ready', 'success');

                    // If there was a pending speak request, execute it now
                    if (pendingSpeak) {
                        const { text, voice, lang } = pendingSpeak;
                        pendingSpeak = null;
                        speak(text, voice, lang);
                    }
                }
            }

            if (type === 'progress') {
                const percent = e.data.percent || 0;
                const loadedMB = e.data.loaded ? (e.data.loaded / 1024 / 1024).toFixed(1) : '?';
                const totalMB = e.data.total ? (e.data.total / 1024 / 1024).toFixed(1) : '?';
                console.log(`🔊 TTS download: ${loadedMB}/${totalMB} MB (${percent}%)`);
            }

            if (type === 'audio') {
                lastAudioData = { data: e.data.data, sampleRate: e.data.sampleRate };
                playAudio(e.data.data, e.data.sampleRate);
            }

            if (type === 'error') {
                console.warn('🔊 TTS error:', e.data.message);
                if (modelLoading) {
                    modelLoading = false;
                    M.showToast && M.showToast('TTS model failed: ' + e.data.message, 'error');
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

        const buffer = audioCtx.createBuffer(1, float32Data.length, sampleRate);
        buffer.copyToChannel(float32Data, 0);

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => {
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
        console.log(`🔊 Web Speech: speaking "${text.substring(0, 40)}…" in ${bcp47Lang}`);
    }

    function stopAudio() {
        // Stop Kokoro audio
        if (currentSource) {
            try { currentSource.stop(); } catch (_) { /* already stopped */ }
            currentSource = null;
        }
        // Stop Web Speech
        if (webSpeechUtterance || ('speechSynthesis' in window && window.speechSynthesis.speaking)) {
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
     * - English/Chinese → Kokoro TTS (local ONNX, high quality)
     * - Japanese & others → Web Speech API (browser-native)
     * @param {string} text - Text to synthesize
     * @param {string} [voice] - Voice ID (e.g., 'af_bella'). Auto-selected by lang if omitted.
     * @param {string} [lang] - Language code or name (e.g., 'en', 'ja', 'japanese').
     */
    function speak(text, voice, lang) {
        if (!text || text.trim().length === 0) return;

        const langKey = (lang || 'en').toLowerCase();

        // Route: Kokoro for English/Chinese, Web Speech for everything else
        if (KOKORO_LANGS.has(langKey)) {
            // ── Kokoro Path ──
            const maxLen = 1000;
            if (text.length > maxLen) {
                text = text.substring(0, maxLen);
            }

            if (!worker) {
                initWorker();
                modelLoading = true;
                pendingSpeak = { text, voice, lang };
                worker.postMessage({ type: 'init' });
                return;
            }

            if (!modelReady) {
                pendingSpeak = { text, voice, lang };
                if (!modelLoading) {
                    modelLoading = true;
                    worker.postMessage({ type: 'init' });
                }
                return;
            }

            worker.postMessage({ type: 'speak', text, voice, lang });
        } else {
            // ── Web Speech API Path ──
            console.log(`🔊 Language "${langKey}" → using Web Speech API`);
            speakWithWebSpeech(text, langKey);
        }
    }

    function stop() {
        stopAudio();
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
        isReady,
        isSpeaking,
        downloadAudio,
        hasAudio,
    };

    console.log('🔊 textToSpeech module loaded (Hybrid: Kokoro + Web Speech API)');
})();
