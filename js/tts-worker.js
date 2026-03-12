// ============================================
// tts-worker.js — Kokoro 82M v1.1-zh Text-to-Speech WebWorker
// Runs textagent/Kokoro-82M-v1.1-zh-ONNX via kokoro-js
// off the main thread for jank-free speech synthesis.
// Supports English + Chinese with voice auto-selection.
// ============================================
import { env } from '@huggingface/transformers';

// Model host — downloads ONNX models from textagent HuggingFace org
const MODEL_HOST = 'https://huggingface.co';
env.remoteHost = MODEL_HOST;

import { KokoroTTS } from 'kokoro-js';

let tts = null;

// Voice map: language code → default voice ID
// Kokoro-82M-v1.1-zh ONNX includes English + Chinese voices
const VOICE_MAP = {
    'en':    'af_bella',      // American Female (default)
    'en-us': 'af_bella',
    'en-gb': 'bf_emma',       // British Female
    'english': 'af_bella',
    'english (us)': 'af_bella',
    'english (uk)': 'bf_emma',
    'zh':    'zf_xiaobei',    // Chinese Female
    'zh-cn': 'zf_xiaobei',
    'chinese': 'zf_xiaobei',
    'chinese (mandarin)': 'zf_xiaobei',
};

self.addEventListener('message', async (e) => {
    const { type, text, voice, lang } = e.data;

    if (type === 'init') {
        try {
            self.postMessage({
                type: 'status',
                status: 'loading',
                message: '🔊 Downloading Kokoro TTS model (~80 MB)…',
            });

            const fromPretrainedOpts = {
                dtype: 'q8',  // Best quality-to-size ratio
                progress_callback: (progress) => {
                    if (progress.status === 'progress') {
                        self.postMessage({
                            type: 'progress',
                            file: progress.file,
                            loaded: progress.loaded,
                            total: progress.total,
                            percent: Math.round((progress.loaded / progress.total) * 100),
                            source: 'textagent/Kokoro-82M-v1.1-zh-ONNX',
                        });
                    } else if (progress.status === 'initiate') {
                        self.postMessage({
                            type: 'status',
                            status: 'loading',
                            message: `Loading ${progress.file || 'model'}...`,
                            source: 'textagent/Kokoro-82M-v1.1-zh-ONNX',
                            loadingPhase: 'initiate',
                        });
                    } else if (progress.status === 'done') {
                        self.postMessage({
                            type: 'status',
                            status: 'loading',
                            message: `Loaded ${progress.file || 'model'} ✓`,
                            source: 'textagent/Kokoro-82M-v1.1-zh-ONNX',
                            loadingPhase: 'done',
                        });
                    }
                },
            };

            tts = await KokoroTTS.from_pretrained(
                'textagent/Kokoro-82M-v1.1-zh-ONNX',
                fromPretrainedOpts,
            );

            // Get available voices
            let voices = [];
            try {
                voices = tts.list_voices();
            } catch (_) { /* not all versions support list_voices */ }

            self.postMessage({
                type: 'status',
                status: 'ready',
                message: '🔊 Kokoro TTS ready',
                voices,
            });
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message || String(err) });
        }
        return;
    }

    if (type === 'speak') {
        if (!tts) {
            self.postMessage({ type: 'error', message: 'TTS model not loaded yet' });
            return;
        }
        try {
            // Determine voice: explicit voice > language-based lookup > default
            let selectedVoice = voice
                || (lang && VOICE_MAP[lang.toLowerCase()])
                || VOICE_MAP['en'];

            // Check if voice is actually available; fall back to English if not
            let voiceMap = {};
            try { voiceMap = tts.list_voices() || {}; } catch (_) {}
            const voiceIds = Object.keys(voiceMap);
            if (voiceIds.length > 0 && !voiceIds.includes(selectedVoice)) {
                console.warn(`Voice "${selectedVoice}" not available. Available: ${voiceIds.join(', ')}. Falling back to af_bella.`);
                selectedVoice = 'af_bella';
            }

            const audio = await tts.generate(text, {
                voice: selectedVoice,
            });

            // kokoro-js returns: { audio: Float32Array, sampling_rate: number }
            const audioData = audio.audio;
            const sampleRate = audio.sampling_rate || 24000;

            self.postMessage({
                type: 'audio',
                data: audioData,
                sampleRate,
            }, [audioData.buffer]);  // Transfer buffer for zero-copy
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message || String(err) });
        }
        return;
    }

    if (type === 'list_voices') {
        if (!tts) {
            self.postMessage({ type: 'error', message: 'TTS model not loaded yet' });
            return;
        }
        try {
            const voices = tts.list_voices();
            self.postMessage({ type: 'voices', voices });
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message || String(err) });
        }
        return;
    }
});
