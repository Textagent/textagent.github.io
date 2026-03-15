// ============================================
// tts-worker.js — Kokoro 82M v1.0 Text-to-Speech WebWorker
// Runs textagent/Kokoro-82M-v1.0-ONNX via kokoro-js
// off the main thread for jank-free speech synthesis.
// Supports 9 languages with voice auto-selection.
//
// NOTE: We bypass KokoroTTS.from_pretrained() because it internally
// calls StyleTextToSpeech2Model.from_pretrained() which requires
// preprocessor_config.json — a file that doesn't exist in any
// Kokoro ONNX repo (textagent, onnx-community, or upstream hexgrad).
// Instead we load model + tokenizer separately and construct
// KokoroTTS(model, tokenizer) directly.
// ============================================
import { env, StyleTextToSpeech2Model, AutoTokenizer } from '@huggingface/transformers';

// Model host — downloads ONNX models from textagent HuggingFace org
const MODEL_HOST = 'https://huggingface.co';
const MODEL_ORG_FALLBACK = 'onnx-community';
env.remoteHost = MODEL_HOST;

import { KokoroTTS } from 'kokoro-js';

let tts = null;

// Voice map: language code → default voice ID
// Kokoro-82M-v1.0 ONNX includes 54 voices across 9 language groups
const VOICE_MAP = {
    // American English
    'en':    'af_bella',      // American Female (default)
    'en-us': 'af_bella',
    'english': 'af_bella',
    'english (us)': 'af_bella',
    // British English
    'en-gb': 'bf_emma',       // British Female
    'english (uk)': 'bf_emma',
    // Japanese
    'ja':    'jf_alpha',      // Japanese Female
    'japanese': 'jf_alpha',
    // Mandarin Chinese
    'zh':    'zf_xiaobei',    // Chinese Female
    'zh-cn': 'zf_xiaobei',
    'chinese': 'zf_xiaobei',
    'chinese (mandarin)': 'zf_xiaobei',
    // Spanish
    'es':    'ef_dora',       // Spanish Female
    'spanish': 'ef_dora',
    // French
    'fr':    'ff_siwis',      // French Female
    'french': 'ff_siwis',
    // Hindi
    'hi':    'hf_alpha',      // Hindi Female
    'hindi': 'hf_alpha',
    // Italian
    'it':    'if_sara',       // Italian Female
    'italian': 'if_sara',
    // Brazilian Portuguese
    'pt':    'pf_dora',       // Portuguese Female
    'pt-br': 'pf_dora',
    'portuguese': 'pf_dora',
};

/**
 * Load model + tokenizer separately, then construct KokoroTTS directly.
 * This avoids the preprocessor_config.json fetch that fails in
 * KokoroTTS.from_pretrained() → StyleTextToSpeech2Model.from_pretrained().
 */
async function loadKokoroManual(modelId, progressCb) {
    const model = await StyleTextToSpeech2Model.from_pretrained(modelId, {
        dtype: 'q8',
        progress_callback: progressCb,
    });
    const tokenizer = await AutoTokenizer.from_pretrained(modelId, {
        progress_callback: progressCb,
    });
    return new KokoroTTS(model, tokenizer);
}

self.addEventListener('message', async (e) => {
    const { type, text, voice, lang } = e.data;

    if (type === 'init') {
        try {
            self.postMessage({
                type: 'status',
                status: 'loading',
                message: '🔊 Downloading Kokoro TTS model (~80 MB)…',
            });

            let modelId = 'textagent/Kokoro-82M-v1.0-ONNX';

            const progressCb = (progress) => {
                if (progress.status === 'progress') {
                    self.postMessage({
                        type: 'progress',
                        file: progress.file,
                        loaded: progress.loaded,
                        total: progress.total,
                        percent: Math.round((progress.loaded / progress.total) * 100),
                        source: modelId,
                    });
                } else if (progress.status === 'initiate') {
                    self.postMessage({
                        type: 'status',
                        status: 'loading',
                        message: `Loading ${progress.file || 'model'}...`,
                        source: modelId,
                        loadingPhase: 'initiate',
                    });
                } else if (progress.status === 'done') {
                    self.postMessage({
                        type: 'status',
                        status: 'loading',
                        message: `Loaded ${progress.file || 'model'} ✓`,
                        source: modelId,
                        loadingPhase: 'done',
                    });
                }
            };

            // Try textagent org first, fall back to onnx-community
            try {
                tts = await loadKokoroManual(modelId, progressCb);
            } catch (primaryErr) {
                console.warn(`textagent model failed: ${primaryErr.message}. Falling back to ${MODEL_ORG_FALLBACK}…`);
                self.postMessage({
                    type: 'status',
                    status: 'loading',
                    message: `⚠️ Falling back to ${MODEL_ORG_FALLBACK} models…`,
                });
                modelId = modelId.replace('textagent/', MODEL_ORG_FALLBACK + '/');
                tts = await loadKokoroManual(modelId, progressCb);
            }

            // ── Patch kokoro-js for multi-language support ──────────────
            // kokoro-js hardcodes an English-only voice registry (Object.freeze'd)
            // and _validate_voice() throws for non-English voice IDs.
            // Override _validate_voice() to accept all 54 voices across 9 languages.
            // The method returns the first char of the voice ID, which kokoro-js uses
            // to select the phonemizer language (a=en-us, b=en-gb, j=ja, z=zh, etc.)
            const ALL_VOICE_IDS = new Set([
                // American English (a)
                'af', 'af_alloy', 'af_aoede', 'af_bella', 'af_heart', 'af_jessica',
                'af_kore', 'af_nicole', 'af_nova', 'af_river', 'af_sarah', 'af_sky',
                'am_adam', 'am_echo', 'am_eric', 'am_fenrir', 'am_liam',
                'am_michael', 'am_onyx', 'am_puck', 'am_santa',
                // British English (b)
                'bf_alice', 'bf_emma', 'bf_isabella', 'bf_lily',
                'bm_daniel', 'bm_fable', 'bm_george', 'bm_lewis',
                // Japanese (j)
                'jf_alpha', 'jf_gongitsune', 'jf_nezumi', 'jf_tebukuro', 'jm_kumo',
                // Mandarin Chinese (z)
                'zf_xiaobei', 'zf_xiaoni', 'zf_xiaoxiao', 'zf_xiaoyi',
                'zm_yunjian', 'zm_yunxi', 'zm_yunxia', 'zm_yunyang',
                // Spanish (e)
                'ef_dora', 'em_alex', 'em_santa',
                // French (f)
                'ff_siwis',
                // Hindi (h)
                'hf_alpha', 'hf_beta', 'hm_omega', 'hm_psi',
                // Italian (i)
                'if_sara', 'im_nicola',
                // Brazilian Portuguese (p)
                'pf_dora', 'pm_alex', 'pm_santa',
            ]);

            tts._validate_voice = function(voice) {
                if (!ALL_VOICE_IDS.has(voice)) {
                    throw new Error(`Voice "${voice}" not found. Should be one of: ${[...ALL_VOICE_IDS].join(', ')}.`);
                }
                return voice.at(0); // Language prefix char for phonemizer
            };
            console.log(`[TTS] Patched _validate_voice for ${ALL_VOICE_IDS.size} voices (9 languages)`);

            // Get available voices (send the full registry)
            let voices = {};
            try {
                voices = tts.voices || {};
            } catch (_) {}

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

            console.log(`[TTS Worker] 📝 Speak request received — text="${text.substring(0, 60)}…" (${text.length} chars)`);
            console.log(`[TTS Worker] 🎙 Voice: ${selectedVoice} | Language: ${lang || 'default'}`);

            // Notify main thread that synthesis is starting
            self.postMessage({
                type: 'status',
                status: 'loading',
                message: `🔊 Synthesizing speech (${text.length} chars)…`,
                loadingPhase: 'synthesizing',
            });

            const synthStart = performance.now();

            const audio = await tts.generate(text, {
                voice: selectedVoice,
            });

            const synthTime = ((performance.now() - synthStart) / 1000).toFixed(2);

            // kokoro-js returns: { audio: Float32Array, sampling_rate: number }
            const audioData = audio.audio;
            const sampleRate = audio.sampling_rate || 24000;
            const duration = (audioData.length / sampleRate).toFixed(1);

            console.log(`[TTS Worker] ✅ Synthesis complete — ${duration}s of audio at ${sampleRate} Hz (took ${synthTime}s)`);

            self.postMessage({
                type: 'audio',
                data: audioData,
                sampleRate,
            }, [audioData.buffer]);  // Transfer buffer for zero-copy
        } catch (err) {
            console.error(`[TTS Worker] ❌ Synthesis failed:`, err.message || String(err));
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
