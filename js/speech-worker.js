// ============================================
// speech-worker.js — Whisper ASR WebWorker (WASM fallback)
// Used when WebGPU is NOT available. WebGPU devices use voxtral-worker.js.
// Runs Whisper via @huggingface/transformers off the main thread.
//
// Two tiers (chosen by device capability, or forced by the caller via `tier`):
//   • 'turbo'  → whisper-large-v3-turbo (~800 MB q8, WER ~7.7%) — default
//   • 'tiny'   → whisper-tiny           (~75 MB q4)            — low-end devices
// IMPORTANT: the low-end model is MULTILINGUAL whisper-tiny, NOT tiny.en, so the
// 14-language support is preserved on exactly the devices that fall back to it.
//
// Streaming: a WhisperTextStreamer emits partial text as tokens decode, posted as
// `partial` messages (the main thread renders these as live interim text).
// ============================================
import { pipeline, env, WhisperTextStreamer } from '@huggingface/transformers';

// Model host — downloads ONNX models from textagent HuggingFace org
const MODEL_HOST = 'https://huggingface.co';
const MODEL_ORG_FALLBACK = 'onnx-community';
env.remoteHost = MODEL_HOST;

let transcriber = null;
let activeTier = 'turbo';

// Tier definitions. dtype/model id chosen per tier; both resolve under the
// textagent org first, then fall back to onnx-community.
const TIERS = {
    turbo: { id: 'textagent/whisper-large-v3-turbo', dtype: 'q8', label: 'Whisper V3 Turbo', dlMsg: '⏳ Downloading Whisper Large V3 Turbo (WASM)…' },
    tiny: { id: 'textagent/whisper-tiny', dtype: 'q4', label: 'Whisper Tiny', dlMsg: '⏳ Downloading Whisper Tiny (low-end, WASM)…' },
};

// Decide a tier from device capability when the caller doesn't force one.
// Heuristic: low RAM or few cores → the lightweight model. deviceMemory is in GB
// (Chromium-only; undefined elsewhere, in which case we keep the default turbo).
function pickTier() {
    const mem = typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined;
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined;
    if ((typeof mem === 'number' && mem <= 4) || (typeof cores === 'number' && cores <= 4)) {
        return 'tiny';
    }
    return 'turbo';
}

self.addEventListener('message', async (e) => {
    const { type, audio } = e.data;

    if (type === 'init') {
        try {
            // Caller may force a tier ('tiny' | 'turbo'); otherwise probe the device.
            activeTier = (e.data.tier === 'tiny' || e.data.tier === 'turbo') ? e.data.tier : pickTier();
            const tier = TIERS[activeTier];

            self.postMessage({ type: 'status', status: 'loading', message: tier.dlMsg });

            // whisperModelId is mutated on org fallback; referenced by the progress callback.
            let whisperModelId = tier.id;

            const pipelineOpts = {
                dtype: tier.dtype,
                device: 'wasm',
                progress_callback: (progress) => {
                    if (progress.status === 'progress') {
                        self.postMessage({
                            type: 'progress',
                            file: progress.file,
                            loaded: progress.loaded,
                            total: progress.total,
                            percent: Math.round((progress.loaded / progress.total) * 100),
                            source: whisperModelId,
                        });
                    } else if (progress.status === 'initiate') {
                        self.postMessage({
                            type: 'status',
                            status: 'loading',
                            message: `Loading ${progress.file || 'model'}...`,
                            source: whisperModelId,
                            loadingPhase: 'initiate',
                        });
                    } else if (progress.status === 'done') {
                        self.postMessage({ type: 'progress-done', file: progress.file, source: whisperModelId, loadingPhase: 'done' });
                    }
                },
            };

            // Try primary org (textagent), fall back to onnx-community
            try {
                transcriber = await pipeline(
                    'automatic-speech-recognition',
                    whisperModelId,
                    pipelineOpts,
                );
            } catch (primaryErr) {
                console.warn(`textagent model failed: ${primaryErr.message}. Falling back to onnx-community…`);
                self.postMessage({ type: 'status', status: 'loading', message: '⚠️ Falling back to onnx-community models…' });
                whisperModelId = whisperModelId.replace('textagent/', MODEL_ORG_FALLBACK + '/');
                transcriber = await pipeline(
                    'automatic-speech-recognition',
                    whisperModelId,
                    pipelineOpts,
                );
            }

            self.postMessage({
                type: 'status',
                status: 'ready',
                message: tier.label + ' ready',
                device: 'CPU (WASM)',
                model: tier.label,
                tier: activeTier,
            });
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message || String(err) });
        }
        return;
    }

    if (type === 'transcribe') {
        if (!transcriber) {
            self.postMessage({ type: 'error', message: 'Model not loaded yet' });
            return;
        }
        try {
            // Normalize audio to [-1, 1] range for best model accuracy
            let normalizedAudio = audio;
            let maxVal = 0;
            for (let i = 0; i < audio.length; i++) {
                const abs = Math.abs(audio[i]);
                if (abs > maxVal) maxVal = abs;
            }
            if (maxVal > 0 && maxVal < 0.5) {
                normalizedAudio = new Float32Array(audio.length);
                const gain = 0.9 / maxVal;
                for (let i = 0; i < audio.length; i++) {
                    normalizedAudio[i] = audio[i] * gain;
                }
            }

            // Use language from caller, default to 'en'
            const lang = e.data.lang || 'en';

            // Stream partial text as tokens decode so the user sees live interim
            // results instead of staring at a blank field until the final result.
            // WhisperTextStreamer skips special tokens and only emits readable text.
            let streamed = '';
            let streamer = null;
            try {
                streamer = new WhisperTextStreamer(transcriber.tokenizer, {
                    skip_prompt: true,
                    callback_function: (partial) => {
                        streamed += partial;
                        const t = streamed.trim();
                        if (t) self.postMessage({ type: 'partial', text: t });
                    },
                });
            } catch (_) {
                // If the streamer can't be constructed for any reason, fall back to
                // a plain one-shot transcription below (streamer stays null).
                streamer = null;
            }

            const result = await transcriber(normalizedAudio, {
                language: lang,
                return_timestamps: false,
                streamer: streamer || undefined,
            });
            self.postMessage({ type: 'result', text: result.text });
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message || String(err) });
        }
        return;
    }
});
