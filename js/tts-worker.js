// ============================================
// tts-worker.js — Kokoro 82M v1.0 Text-to-Speech WebWorker
// Runs textagent/Kokoro-82M-v1.0-ONNX via kokoro-js
// off the main thread for jank-free speech synthesis.
// Supports 9 languages with voice auto-selection.
const TTS_WORKER_VERSION = '20260415a';
console.log(`[TTS Worker] 🚀 Module loaded — version ${TTS_WORKER_VERSION}, time: ${new Date().toISOString()}`);
//
// NOTE: We bypass KokoroTTS.from_pretrained() because it internally
// calls StyleTextToSpeech2Model.from_pretrained() which requires
// preprocessor_config.json — a file that doesn't exist in any
// Kokoro ONNX repo (textagent, onnx-community, or upstream hexgrad).
// Instead we load model + tokenizer separately and construct
// KokoroTTS(model, tokenizer) directly.
// ============================================
import { env, StyleTextToSpeech2Model, AutoTokenizer, Tensor } from '@huggingface/transformers';

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
 * Split text into chunks at sentence boundaries for efficient synthesis.
 * Each chunk is ≤ maxLen chars. Splits at sentence-ending punctuation
 * (.!?) followed by whitespace, or paragraph breaks. Falls back to
 * splitting at the last space if no sentence boundary is found.
 */
function splitIntoChunks(text, maxLen = 500) {
    if (!text || text.length <= maxLen) return [text];

    const chunks = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= maxLen) {
            chunks.push(remaining.trim());
            break;
        }

        // Look for sentence-ending punctuation followed by whitespace within maxLen
        let splitIdx = -1;
        for (let i = maxLen; i >= Math.floor(maxLen * 0.3); i--) {
            const ch = remaining[i - 1];
            const next = remaining[i] || '';
            if ((ch === '.' || ch === '!' || ch === '?') && /\s/.test(next)) {
                splitIdx = i;
                break;
            }
        }

        // Fallback: split at paragraph break (\n\n)
        if (splitIdx === -1) {
            const paraIdx = remaining.lastIndexOf('\n\n', maxLen);
            if (paraIdx > Math.floor(maxLen * 0.3)) {
                splitIdx = paraIdx + 1; // include one newline in current chunk
            }
        }

        // Fallback: split at last space within maxLen
        if (splitIdx === -1) {
            const spaceIdx = remaining.lastIndexOf(' ', maxLen);
            if (spaceIdx > Math.floor(maxLen * 0.3)) {
                splitIdx = spaceIdx + 1;
            }
        }

        // Last resort: hard split at maxLen
        if (splitIdx === -1) {
            splitIdx = maxLen;
        }

        const chunk = remaining.substring(0, splitIdx).trim();
        if (chunk) chunks.push(chunk);
        remaining = remaining.substring(splitIdx).trim();
    }

    return chunks.filter(c => c.length > 0);
}

// Track which device the loaded model is running on (for status reporting).
let ttsDevice = 'wasm';

// Probe WebGPU availability inside the worker.
async function detectWebGPU() {
    try {
        if (typeof navigator === 'undefined' || !navigator.gpu) return false;
        const adapter = await navigator.gpu.requestAdapter();
        return !!adapter;
    } catch (_) {
        return false;
    }
}

/**
 * Load model + tokenizer separately, then construct KokoroTTS directly.
 * This avoids the preprocessor_config.json fetch that fails in
 * KokoroTTS.from_pretrained() → StyleTextToSpeech2Model.from_pretrained().
 *
 * Runs on WebGPU when available (Kokoro v1.0 supports it — ~10s of speech in
 * ~1s vs 5–15s/chunk on CPU/WASM), falling back to WASM if WebGPU is missing
 * or the GPU load fails at runtime. WebGPU prefers fp32 weights; WASM uses q8.
 */
async function loadKokoroManual(modelId, progressCb) {
    const useGPU = await detectWebGPU();

    async function build(device, dtype) {
        const model = await StyleTextToSpeech2Model.from_pretrained(modelId, {
            dtype,
            device,
            progress_callback: progressCb,
        });
        const tokenizer = await AutoTokenizer.from_pretrained(modelId, {
            progress_callback: progressCb,
        });
        ttsDevice = device;
        return new KokoroTTS(model, tokenizer);
    }

    if (useGPU) {
        try {
            return await build('webgpu', 'fp32');
        } catch (gpuErr) {
            console.warn('[TTS Worker] WebGPU load failed, falling back to WASM:', gpuErr);
        }
    }
    return await build('wasm', 'q8');
}

/**
 * Multi-speaker synthesis — extracted as a standalone function so it can be
 * called from BOTH the 'init' handler (bundled segments) and the 'speak-multi'
 * handler. This avoids the Web Worker message delivery bug where a second
 * postMessage is silently dropped after an async init handler completes.
 */
async function processMultiSegments(segments) {
    const _wt = () => `[TTS Worker +${(performance.now() / 1000).toFixed(1)}s]`;

    console.log(`${_wt()} 🎙 ===== processMultiSegments START =====`);
    console.log(`${_wt()} tts instance: ${!!tts}, segments: ${segments.length}`);

    if (!tts) {
        console.error(`${_wt()} ❌ TTS model is null — aborting`);
        self.postMessage({ type: 'error', message: 'TTS model not loaded yet' });
        return;
    }

    segments.forEach((s, i) => {
        console.log(`${_wt()}   [${i}] voice=${s.voice}, speaker=${s.speaker}, chars=${(s.text||'').length}, text="${(s.text||'').substring(0, 60)}…"`);
    });

    let heartbeat;
    try {
        self.postMessage({
            type: 'status',
            status: 'loading',
            message: `🎙 Synthesizing ${segments.length} speaker segments…`,
            loadingPhase: 'synthesizing',
        });

        const synthStart = performance.now();
        const audioSegments = [];
        let sampleRate = 24000;

        // Small silence gap between speakers (~0.3s)
        const silenceGap = new Float32Array(Math.floor(sampleRate * 0.35));

        // Heartbeat logger every 10s
        let heartbeatCount = 0;
        heartbeat = setInterval(() => {
            heartbeatCount++;
            const elapsed = ((performance.now() - synthStart) / 1000).toFixed(0);
            console.log(`${_wt()} 💓 HEARTBEAT #${heartbeatCount}: ${elapsed}s elapsed, ${audioSegments.length} chunks done`);
            self.postMessage({
                type: 'chunk-progress',
                current: audioSegments.length,
                total: segments.length,
                message: `💓 Still synthesizing… ${elapsed}s elapsed`,
            });
        }, 10000);

        // ── Pre-fetch all unique voice files before synthesis ──
        const uniqueVoices = [...new Set(segments.map(s => s.voice || VOICE_MAP['en']))];
        console.log(`${_wt()} 📥 Pre-fetching ${uniqueVoices.length} voice files: ${uniqueVoices.join(', ')}`);
        self.postMessage({
            type: 'chunk-progress', current: 0, total: segments.length,
            message: `📥 Pre-loading ${uniqueVoices.length} voice${uniqueVoices.length > 1 ? 's' : ''}…`,
        });

        for (const v of uniqueVoices) {
            try {
                console.log(`${_wt()} 📥 Pre-fetching voice: ${v}`);
                const testResult = await tts.generate("test", { voice: v });
                console.log(`${_wt()} ✅ Voice ${v} ready (test: ${testResult?.audio?.length || 0} samples)`);
            } catch (voiceErr) {
                console.error(`${_wt()} ❌ Voice ${v} pre-fetch FAILED: ${voiceErr.message}`);
                self.postMessage({
                    type: 'chunk-progress', current: 0, total: segments.length,
                    message: `⚠️ Voice ${v} failed: ${voiceErr.message}`,
                });
            }
            await new Promise(r => setTimeout(r, 0)); // yield
        }

        console.log(`${_wt()} ✅ All voices pre-fetched. Starting synthesis…`);
        self.postMessage({
            type: 'chunk-progress', current: 0, total: segments.length,
            message: `✅ Voices loaded. Starting synthesis…`,
        });
        await new Promise(r => setTimeout(r, 10)); // yield

        for (let si = 0; si < segments.length; si++) {
            const seg = segments[si];
            const segVoice = seg.voice || VOICE_MAP['en'];
            const segText = (seg.text || '').trim();
            if (!segText) { console.warn(`${_wt()} ⏭ Segment ${si+1} — EMPTY, skipping`); continue; }

            const segStart = performance.now();
            console.log(`${_wt()} ──── SEGMENT ${si+1}/${segments.length} START ────`);
            console.log(`${_wt()}   voice: ${segVoice}, speaker: ${seg.speaker || '?'}, ${segText.length} chars`);

            self.postMessage({
                type: 'chunk-progress', current: si+1, total: segments.length,
                message: `🎙 Speaker ${si+1}/${segments.length}: ${seg.speaker || segVoice}…`,
            });
            await new Promise(r => setTimeout(r, 0)); // yield so postMessage flushes

            const subChunks = splitIntoChunks(segText, 500);
            console.log(`${_wt()}   ${subChunks.length} sub-chunk(s)`);

            for (let ci = 0; ci < subChunks.length; ci++) {
                const chunk = subChunks[ci];
                const chunkStart = performance.now();
                const elapsed = ((chunkStart - synthStart) / 1000).toFixed(1);

                console.log(`${_wt()}   🔊 chunk ${ci+1}/${subChunks.length} (${chunk.length} chars) — calling tts.generate()… [${elapsed}s]`);
                self.postMessage({
                    type: 'chunk-progress', current: si+1, total: segments.length,
                    message: `🎙 Speaker ${si+1}/${segments.length}${subChunks.length > 1 ? ' chunk '+(ci+1)+'/'+subChunks.length : ''} — synthesizing… ${elapsed}s`,
                });
                await new Promise(r => setTimeout(r, 0)); // yield before WASM

                let audio;
                try {
                    audio = await Promise.race([
                        tts.generate(chunk, { voice: segVoice }),
                        new Promise((_, rej) => setTimeout(() => rej(new Error(`Timeout >90s: seg ${si+1} chunk ${ci+1}`)), 90000)),
                    ]);
                } catch (chunkErr) {
                    console.error(`${_wt()}   ❌ chunk ${ci+1} FAILED: ${chunkErr.message}`);
                    self.postMessage({
                        type: 'chunk-progress', current: si+1, total: segments.length,
                        message: `❌ Speaker ${si+1} chunk ${ci+1} failed: ${chunkErr.message}`,
                    });
                    continue; // skip failed chunk
                }

                const chunkTime = ((performance.now() - chunkStart) / 1000).toFixed(2);
                console.log(`${_wt()}   ✅ chunk ${ci+1}/${subChunks.length} done in ${chunkTime}s — ${audio?.audio?.length || 0} samples`);

                sampleRate = audio.sampling_rate || 24000;
                audioSegments.push(audio.audio);

                self.postMessage({
                    type: 'chunk-progress', current: si+1, total: segments.length,
                    message: `✅ Speaker ${si+1}/${segments.length}${subChunks.length > 1 ? ' chunk '+(ci+1) : ''} done — ${((performance.now() - synthStart)/1000).toFixed(0)}s`,
                });
                await new Promise(r => setTimeout(r, 0)); // yield after WASM
            }

            console.log(`${_wt()} ──── SEGMENT ${si+1}/${segments.length} COMPLETE in ${((performance.now()-segStart)/1000).toFixed(2)}s ────`);
            if (si < segments.length - 1) audioSegments.push(silenceGap);
        }

        clearInterval(heartbeat);

        if (audioSegments.length === 0) {
            throw new Error('No audio segments produced — all chunks failed or were empty');
        }

        console.log(`${_wt()} 🔗 Concatenating ${audioSegments.length} audio pieces…`);
        const totalLength = audioSegments.reduce((sum, seg) => sum + seg.length, 0);
        const audioData = new Float32Array(totalLength);
        let offset = 0;
        for (const seg of audioSegments) { audioData.set(seg, offset); offset += seg.length; }

        const synthTime = ((performance.now() - synthStart) / 1000).toFixed(2);
        const duration = (audioData.length / sampleRate).toFixed(1);

        console.log(`${_wt()} ✅ ===== processMultiSegments COMPLETE =====`);
        console.log(`${_wt()}   ${duration}s audio, ${totalLength} samples, synthesized in ${synthTime}s`);

        self.postMessage({ type: 'audio', data: audioData, sampleRate }, [audioData.buffer]);
        console.log(`${_wt()}   ✅ 'audio' posted to main thread`);
    } catch (err) {
        if (heartbeat) clearInterval(heartbeat);
        console.error(`${_wt()} ❌ processMultiSegments FAILED: ${err.message}`);
        console.error(`${_wt()}   Stack:`, err.stack || '(no stack)');
        self.postMessage({ type: 'error', message: err.message || String(err) });
    }
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

            // ── Patch generate_from_ids for robust Tensor construction ─────────
            // kokoro-js (v1.2.1) has issues loading non-English voice files from onnx-community
            // and passing proper style/speed tensors to our textagent model signature.
            const voiceCache = new Map();
            tts.generate_from_ids = async function(input_ids, { voice = 'af_heart', speed = 1 } = {}) {
                if (!voiceCache.has(voice)) {
                    // Fetch voice binary from our fallback org or primary org
                    const voiceUrl = `https://huggingface.co/${modelId}/resolve/main/voices/${voice}.bin`;
                    try {
                        let res = await fetch(voiceUrl);
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        const buf = await res.arrayBuffer();
                        voiceCache.set(voice, new Float32Array(buf));
                    } catch (err) {
                        console.warn(`[TTS] Failed to fetch voice ${voice} from ${modelId}, falling back to onnx-community:`, err);
                        const fallbackUrl = `https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/${voice}.bin`;
                        let res = await fetch(fallbackUrl);
                        if (!res.ok) throw new Error(`HTTP ${res.status} fetching fallback voice`);
                        const buf = await res.arrayBuffer();
                        voiceCache.set(voice, new Float32Array(buf));
                    }
                }

                const styleFloat32 = voiceCache.get(voice);
                const l = 256 * Math.min(Math.max(input_ids.dims.at(-1) - 2, 0), 509);
                const styleSlice = styleFloat32.slice(l, l + 256);

                const inputs = {
                    input_ids: input_ids,
                    style: new Tensor('float32', styleSlice, [1, 256]),
                    speed: new Tensor('float32', [speed], [1])
                };

                const { waveform } = await this.model(inputs);
                return { audio: waveform.data, sampling_rate: 24000 };
            };
            console.log(`[TTS] Patched generate_from_ids to pass explicit style and speed tensors`);

            // Get available voices (send the full registry)
            let voices = {};
            try {
                voices = tts.voices || {};
            } catch (_) {}

            self.postMessage({
                type: 'status',
                status: 'ready',
                message: ttsDevice === 'webgpu' ? '🔊 Kokoro TTS ready (GPU)' : '🔊 Kokoro TTS ready',
                device: ttsDevice,
                voices,
            });

            // ── KEY FIX: If segments were bundled with init, process them NOW ──
            // This runs in the SAME event handler execution as init, avoiding
            // the issue where a separate speak-multi message is silently dropped.
            if (e.data.pendingSegments && e.data.pendingSegments.length > 0) {
                console.log(`[TTS] 🎙 Init includes ${e.data.pendingSegments.length} bundled segments — processing inline`);
                await processMultiSegments(e.data.pendingSegments);
            }
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

            // Split text into manageable chunks for efficient synthesis
            const chunks = splitIntoChunks(text, 500);
            const totalChunks = chunks.length;

            console.log(`[TTS Worker] 📦 Split into ${totalChunks} chunk(s)`);

            // Notify main thread that synthesis is starting
            self.postMessage({
                type: 'status',
                status: 'loading',
                message: totalChunks > 1
                    ? `🔊 Synthesizing speech (${text.length} chars, ${totalChunks} chunks)…`
                    : `🔊 Synthesizing speech (${text.length} chars)…`,
                loadingPhase: 'synthesizing',
            });

            const synthStart = performance.now();
            const audioSegments = [];
            let sampleRate = 24000;

            for (let ci = 0; ci < totalChunks; ci++) {
                const chunk = chunks[ci];
                console.log(`[TTS Worker] 🔄 Chunk ${ci + 1}/${totalChunks} (${chunk.length} chars): "${chunk.substring(0, 50)}…"`);

                if (totalChunks > 1) {
                    self.postMessage({
                        type: 'chunk-progress',
                        current: ci + 1,
                        total: totalChunks,
                        message: `🔊 Synthesizing chunk ${ci + 1}/${totalChunks}…`,
                    });
                }

                const audio = await tts.generate(chunk, {
                    voice: selectedVoice,
                });

                sampleRate = audio.sampling_rate || 24000;
                audioSegments.push(audio.audio);
            }

            // Concatenate all audio segments into a single Float32Array
            const totalLength = audioSegments.reduce((sum, seg) => sum + seg.length, 0);
            const audioData = new Float32Array(totalLength);
            let offset = 0;
            for (const seg of audioSegments) {
                audioData.set(seg, offset);
                offset += seg.length;
            }

            const synthTime = ((performance.now() - synthStart) / 1000).toFixed(2);
            const duration = (audioData.length / sampleRate).toFixed(1);

            console.log(`[TTS Worker] ✅ Synthesis complete — ${duration}s of audio at ${sampleRate} Hz (took ${synthTime}s, ${totalChunks} chunks)`);

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

    // ── Multi-speaker synthesis ──────────────────────────
    // Receives segments: [{text, voice}, ...] and synthesizes each
    // with the specified voice, then concatenates into a single buffer.
    if (type === 'speak-multi') {
        // ACK + delegate to shared function
        self.postMessage({
            type: 'speak-multi-ack',
            message: 'Worker received speak-multi message',
            timestamp: performance.now(),
        });
        const segments = e.data.segments;
        if (!segments || !segments.length) {
            self.postMessage({ type: 'error', message: 'No segments provided' });
            return;
        }
        await processMultiSegments(segments);
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
