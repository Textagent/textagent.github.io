// ============================================
// voxtral-worker.js — Voxtral Mini 3B ASR WebWorker (WebGPU)
// Primary speech-to-text engine on WebGPU-capable devices.
// Uses VoxtralForConditionalGeneration + VoxtralProcessor
// from @huggingface/transformers for in-browser transcription.
// 13 languages · streaming output · ~2.7 GB (q4)
// ============================================
import {
    VoxtralForConditionalGeneration,
    VoxtralProcessor,
    TextStreamer,
} from '@huggingface/transformers';

const MODEL_PRIMARY = 'textagent/Voxtral-Mini-3B-2507-ONNX';
const MODEL_FALLBACK = 'onnx-community/Voxtral-Mini-3B-2507-ONNX';

let processor = null;
let model = null;

self.addEventListener('message', async (e) => {
    const { type } = e.data;

    // ── Init: load model + processor ────────────────
    if (type === 'init') {
        try {
            self.postMessage({
                type: 'status',
                status: 'loading',
                message: '🚀 Downloading Voxtral Mini 3B (WebGPU)…',
            });

            const progressCallback = (progress) => {
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
                    self.postMessage({ type: 'progress-done', file: progress.file, source: modelId, loadingPhase: 'done' });
                }
            };

            // Try primary org (textagent), fall back to onnx-community
            let modelId = MODEL_PRIMARY;
            try {
                processor = await VoxtralProcessor.from_pretrained(modelId, {
                    progress_callback: progressCallback,
                });

                model = await VoxtralForConditionalGeneration.from_pretrained(modelId, {
                    dtype: {
                        embed_tokens: 'q4',              // ~252 MB — lightweight lookup
                        audio_encoder: 'q4',              // ~440 MB — audio feature extraction
                        decoder_model_merged: 'q4f16',    // ~2.0 GB — main decoder
                    },
                    device: {
                        embed_tokens: 'wasm',             // Lookup table — WASM is fine
                        audio_encoder: 'webgpu',          // Heavy — needs GPU
                        decoder_model_merged: 'webgpu',   // Heavy — needs GPU
                    },
                    progress_callback: progressCallback,
                });
            } catch (primaryErr) {
                console.warn(`textagent model failed: ${primaryErr.message}. Falling back to onnx-community…`);
                self.postMessage({ type: 'status', status: 'loading', message: '⚠️ Falling back to onnx-community models…' });
                modelId = MODEL_FALLBACK;

                processor = await VoxtralProcessor.from_pretrained(modelId, {
                    progress_callback: progressCallback,
                });

                model = await VoxtralForConditionalGeneration.from_pretrained(modelId, {
                    dtype: {
                        embed_tokens: 'q4',
                        audio_encoder: 'q4',
                        decoder_model_merged: 'q4f16',
                    },
                    device: {
                        embed_tokens: 'wasm',
                        audio_encoder: 'webgpu',
                        decoder_model_merged: 'webgpu',
                    },
                    progress_callback: progressCallback,
                });
            }

            self.postMessage({
                type: 'status',
                status: 'ready',
                message: 'Voxtral ready',
                device: 'GPU (WebGPU)',
                model: 'Voxtral Mini 3B',
            });
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message || String(err) });
        }
        return;
    }

    // ── Transcribe: audio → text ────────────────────
    if (type === 'transcribe') {
        if (!processor || !model) {
            self.postMessage({ type: 'error', message: 'Model not loaded yet' });
            return;
        }
        try {
            const audio = e.data.audio;
            const lang = e.data.lang || 'en';

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

            // Build Voxtral conversation format
            const conversation = [
                {
                    role: 'user',
                    content: [
                        { type: 'audio' },
                        { type: 'text', text: `lang:${lang} [TRANSCRIBE]` },
                    ],
                },
            ];

            const text = processor.apply_chat_template(conversation, { tokenize: false });
            const inputs = await processor(text, normalizedAudio);

            // Stream tokens for real-time partial feedback
            let output = '';
            const streamer = new TextStreamer(processor.tokenizer, {
                skip_special_tokens: true,
                skip_prompt: true,
                callback_function: (token) => {
                    output += token;
                    self.postMessage({ type: 'partial', text: output });
                },
            });

            await model.generate({
                ...inputs,
                max_new_tokens: 4096,
                streamer,
            });

            self.postMessage({ type: 'result', text: output.trim() });
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message || String(err) });
        }
        return;
    }
});
