// ============================================
// whisper-worker.js — Whisper Large V3 Turbo ASR WebWorker
// Runs textagent/whisper-large-v3-turbo via @huggingface/transformers
// off the main thread for jank-free transcription.
// WER ~7.7% (batched) — significant upgrade over Moonshine Base (~9.66%)
// ============================================
import { pipeline, env } from '@huggingface/transformers';

// Model host — downloads ONNX models from textagent HuggingFace org
const MODEL_HOST = 'https://huggingface.co';
const MODEL_ORG_FALLBACK = 'onnx-community';
env.remoteHost = MODEL_HOST;

let transcriber = null;

self.addEventListener('message', async (e) => {
    const { type, audio } = e.data;

    if (type === 'init') {
        try {
            // Detect best available device
            let device = 'wasm';
            let dtype = 'q8';
            if (typeof navigator !== 'undefined' && navigator.gpu) {
                try {
                    const adapter = await navigator.gpu.requestAdapter();
                    if (adapter) {
                        device = 'webgpu';
                        dtype = 'fp16';  // WebGPU works best with fp16
                        self.postMessage({ type: 'status', status: 'loading', message: '🚀 WebGPU available — using GPU acceleration' });
                    }
                } catch (_) { /* fall through to WASM */ }
            }
            if (device === 'wasm') {
                self.postMessage({ type: 'status', status: 'loading', message: '⏳ Downloading Whisper Large V3 Turbo…' });
            }

            const pipelineOpts = {
                dtype,
                device,
                progress_callback: (progress) => {
                    if (progress.status === 'progress') {
                        self.postMessage({
                            type: 'progress',
                            file: progress.file,
                            loaded: progress.loaded,
                            total: progress.total,
                            percent: Math.round((progress.loaded / progress.total) * 100),
                        });
                    } else if (progress.status === 'done') {
                        self.postMessage({ type: 'progress-done', file: progress.file });
                    }
                },
            };

            // Try primary org (textagent), fall back to onnx-community
            let whisperModelId = 'textagent/whisper-large-v3-turbo';
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
                message: 'Model ready',
                device: device === 'webgpu' ? 'GPU (WebGPU)' : 'CPU (WASM)',
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

            const result = await transcriber(normalizedAudio, {
                language: 'en',
                return_timestamps: false,
            });
            self.postMessage({ type: 'result', text: result.text });
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message || String(err) });
        }
        return;
    }
});
