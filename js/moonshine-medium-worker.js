// ============================================
// moonshine-medium-worker.js — Moonshine Medium Streaming ASR
// Uses onnxruntime-web directly with 3-model architecture:
//   encoder → decoder → decoder_with_past (KV cache)
// Model: Mazino0/moonshine-streaming-medium-onnx
//
// Features:
//   - WebGPU acceleration with WASM fallback
//   - True streaming: sends partial results as tokens are decoded
//   - Cached encoder states for multi-turn follow-ups
// ============================================
import * as ort from 'onnxruntime-web';

const HF_BASE = 'https://huggingface.co/Mazino0/moonshine-streaming-medium-onnx/resolve/main';
const MODEL_FILES = {
    encoder: 'encoder_model_int8.onnx',
    decoder: 'decoder_model_int8.onnx',
    decoderPast: 'decoder_with_past_model_int8.onnx',
    tokenizer: 'tokenizer.json',
};

const BOS_TOKEN = 1;
const EOS_TOKEN = 2;
const MAX_TOKENS = 256;
const STREAMING_INTERVAL = 3; // send partial result every N tokens

let encoder = null;
let decoder = null;
let decoderPast = null;
let tokenizer = null;
let activeDevice = 'wasm'; // track which backend is active

// ── Model Download ──────────────────────────
async function downloadFile(filename, label) {
    const url = `${HF_BASE}/${filename}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download ${filename}: ${response.status}`);

    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (contentLength > 0) {
            self.postMessage({
                type: 'progress',
                file: label,
                loaded,
                total: contentLength,
                percent: Math.round((loaded / contentLength) * 100),
            });
        }
    }

    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
    }
    return combined.buffer;
}

// ── Tokenizer (minimal BPE decoder from tokenizer.json) ──
function loadTokenizerFromJSON(json) {
    const vocab = json.model?.vocab || {};
    const idToToken = {};
    for (const [token, id] of Object.entries(vocab)) {
        idToToken[id] = token;
    }

    if (json.added_tokens) {
        for (const t of json.added_tokens) {
            idToToken[t.id] = t.content;
        }
    }

    return {
        decode(ids) {
            let text = '';
            for (const id of ids) {
                if (id === BOS_TOKEN || id === EOS_TOKEN) continue;
                const token = idToToken[id] || '';
                text += token.replace(/▁/g, ' ');
            }
            return text.replace(/^\s+/, '');
        }
    };
}

// ── Detect best execution provider ──────────
async function detectBestProvider() {
    // Try WebGPU first (15-30x faster than WASM)
    if (typeof navigator !== 'undefined' && navigator.gpu) {
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
                console.log('🚀 WebGPU available — using GPU acceleration');
                return 'webgpu';
            }
        } catch (e) {
            console.warn('WebGPU check failed:', e);
        }
    }
    console.log('⚙️ Using WASM backend');
    return 'wasm';
}

// ── Model Initialization ────────────────────
async function initModel() {
    try {
        self.postMessage({ type: 'status', status: 'loading', message: '🧠 Initializing Moonshine Medium speech engine…' });

        // Configure ONNX Runtime
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/';
        ort.env.wasm.numThreads = 1;

        // Detect best backend
        activeDevice = await detectBestProvider();
        const providers = activeDevice === 'webgpu' ? ['webgpu', 'wasm'] : ['wasm'];
        const deviceLabel = activeDevice === 'webgpu' ? '🚀 GPU (WebGPU)' : '⚙️ CPU (WASM)';

        self.postMessage({
            type: 'status',
            status: 'loading',
            message: `🧠 Detected: ${deviceLabel} — downloading model files…`,
        });

        // Download and create sessions with detailed progress
        const sessionOpts = {
            executionProviders: providers,
            graphOptimizationLevel: 'all',
        };

        // Step 1/4: Tokenizer (~small)
        self.postMessage({ type: 'status', status: 'loading', message: '📥 [1/4] Downloading tokenizer…' });
        const tokenizerBuffer = await downloadFile(MODEL_FILES.tokenizer, 'tokenizer');
        const tokenizerJSON = JSON.parse(new TextDecoder().decode(tokenizerBuffer));
        tokenizer = loadTokenizerFromJSON(tokenizerJSON);
        self.postMessage({ type: 'status', status: 'loading', message: '✅ [1/4] Tokenizer ready' });

        // Step 2/4: Encoder (~largest file)
        self.postMessage({ type: 'status', status: 'loading', message: '📥 [2/4] Downloading audio encoder…' });
        const encoderBuffer = await downloadFile(MODEL_FILES.encoder, 'encoder');
        self.postMessage({ type: 'status', status: 'loading', message: '⏳ [2/4] Initializing encoder…' });
        encoder = await ort.InferenceSession.create(encoderBuffer, sessionOpts);
        self.postMessage({ type: 'status', status: 'loading', message: '✅ [2/4] Encoder ready' });

        // Step 3/4: Decoder
        self.postMessage({ type: 'status', status: 'loading', message: '📥 [3/4] Downloading text decoder…' });
        const decoderBuffer = await downloadFile(MODEL_FILES.decoder, 'decoder');
        self.postMessage({ type: 'status', status: 'loading', message: '⏳ [3/4] Initializing decoder…' });
        decoder = await ort.InferenceSession.create(decoderBuffer, sessionOpts);
        self.postMessage({ type: 'status', status: 'loading', message: '✅ [3/4] Decoder ready' });

        // Step 4/4: Decoder with past (KV cache)
        self.postMessage({ type: 'status', status: 'loading', message: '📥 [4/4] Downloading streaming decoder…' });
        const decoderPastBuffer = await downloadFile(MODEL_FILES.decoderPast, 'decoder_past');
        self.postMessage({ type: 'status', status: 'loading', message: '⏳ [4/4] Initializing streaming decoder…' });
        decoderPast = await ort.InferenceSession.create(decoderPastBuffer, sessionOpts);
        self.postMessage({ type: 'status', status: 'loading', message: '✅ [4/4] Streaming decoder ready' });

        self.postMessage({
            type: 'status',
            status: 'ready',
            message: `🧠 Moonshine Medium ready (${deviceLabel})`,
            device: activeDevice,
        });
    } catch (err) {
        self.postMessage({ type: 'error', message: err.message || String(err) });
    }
}

// ── Build KV Cache Name Mapping ─────────────
// Maps decoder_with_past INPUT names → decoder OUTPUT names (first step)
// and decoder_with_past INPUT names → decoder_with_past OUTPUT names (subsequent steps)
let kvMappingFirstStep = null;  // pastInputName → decoderOutputName
let kvMappingSubsequent = null; // pastInputName → decoderPastOutputName

function buildKVMappings() {
    // Get all KV-related input names for decoder_with_past
    const pastKVInputNames = decoderPast.inputNames.filter(
        n => n !== 'decoder_input_ids' && n !== 'encoder_hidden_states'
    );
    const decoderOutputNameSet = new Set(decoder.outputNames);
    const decoderPastOutputNameSet = new Set(decoderPast.outputNames);

    console.log('🔧 Decoder output names:', decoder.outputNames);
    console.log('🔧 DecoderPast input names:', decoderPast.inputNames);
    console.log('🔧 DecoderPast output names:', decoderPast.outputNames);
    console.log('🔧 KV input names needed:', pastKVInputNames);

    // Build first-step mapping: pastInputName → which decoder output to use
    kvMappingFirstStep = {};
    for (const inputName of pastKVInputNames) {
        // Try various transformations to find matching decoder output
        const candidates = [
            inputName,                                          // exact match
            inputName.replace('_orig', ''),                     // remove _orig suffix
            inputName.replace('past_', 'present_'),             // past_ → present_
            inputName.replace('past_', 'present_').replace('_orig', ''), // both
            inputName.replace(/_orig$/, ''),                    // regex remove _orig
        ];
        let found = false;
        for (const cand of candidates) {
            if (decoderOutputNameSet.has(cand)) {
                kvMappingFirstStep[inputName] = cand;
                found = true;
                break;
            }
        }
        if (!found) {
            console.warn(`🔧 No decoder output found for pastInput: ${inputName}, tried:`, candidates);
        }
    }

    // Build subsequent-step mapping: pastInputName → which decoderPast output to use
    kvMappingSubsequent = {};
    for (const inputName of pastKVInputNames) {
        const candidates = [
            inputName,
            inputName.replace('_orig', ''),
            inputName.replace('past_', 'present_'),
            inputName.replace('past_', 'present_').replace('_orig', ''),
        ];
        let found = false;
        for (const cand of candidates) {
            if (decoderPastOutputNameSet.has(cand)) {
                kvMappingSubsequent[inputName] = cand;
                found = true;
                break;
            }
        }
        if (!found) {
            console.warn(`🔧 No decoderPast output found for pastInput: ${inputName}, tried:`, candidates);
        }
    }

    console.log('🔧 First-step mapping:', kvMappingFirstStep);
    console.log('🔧 Subsequent mapping:', kvMappingSubsequent);
}

// ── Transcribe Audio (with streaming partial results) ──
async function transcribe(audioFloat32) {
    if (!encoder || !decoder || !decoderPast || !tokenizer) {
        self.postMessage({ type: 'error', message: 'Model not loaded yet' });
        return;
    }

    try {
        // Normalize audio
        let normalizedAudio = audioFloat32;
        let maxVal = 0;
        for (let i = 0; i < audioFloat32.length; i++) {
            const abs = Math.abs(audioFloat32[i]);
            if (abs > maxVal) maxVal = abs;
        }
        if (maxVal > 0 && maxVal < 0.5) {
            normalizedAudio = new Float32Array(audioFloat32.length);
            const gain = 0.9 / maxVal;
            for (let i = 0; i < audioFloat32.length; i++) {
                normalizedAudio[i] = audioFloat32[i] * gain;
            }
        }

        // Step 1: Encode audio
        const FRAME_SIZE = 80;
        const paddedLength = Math.ceil(normalizedAudio.length / FRAME_SIZE) * FRAME_SIZE;
        let paddedAudio = normalizedAudio;
        if (paddedLength !== normalizedAudio.length) {
            paddedAudio = new Float32Array(paddedLength);
            paddedAudio.set(normalizedAudio);
        }

        const audioTensor = new ort.Tensor('float32', paddedAudio, [1, paddedAudio.length]);
        const maskData = new BigInt64Array(paddedAudio.length).fill(1n);
        for (let i = normalizedAudio.length; i < paddedLength; i++) {
            maskData[i] = 0n;
        }
        const maskTensor = new ort.Tensor('int64', maskData, [1, paddedAudio.length]);

        const encResult = await encoder.run({
            input_values: audioTensor,
            attention_mask: maskTensor,
        });
        const encOut = encResult[encoder.outputNames[0]];

        // Step 2: First decode step (BOS token)
        const bosIds = new BigInt64Array([BigInt(BOS_TOKEN)]);
        const bosTensor = new ort.Tensor('int64', bosIds, [1, 1]);

        const firstResult = await decoder.run({
            decoder_input_ids: bosTensor,
            encoder_hidden_states: encOut,
        });

        const logits = firstResult[decoder.outputNames[0]];
        const vocabSize = logits.dims[logits.dims.length - 1];
        let firstTokenId = argmax(logits.data, 0, vocabSize);

        // Build KV cache mappings on first use
        if (!kvMappingFirstStep) {
            buildKVMappings();
        }

        // Build initial KV cache from first decoder outputs
        let kvCache = {};
        for (const [pastInputName, decoderOutName] of Object.entries(kvMappingFirstStep)) {
            if (firstResult[decoderOutName]) {
                kvCache[pastInputName] = firstResult[decoderOutName];
            } else {
                console.warn(`🔧 Missing decoder output: ${decoderOutName} for input: ${pastInputName}`);
            }
        }

        // Step 3: Autoregressive decoding with KV cache + streaming
        const tokens = [firstTokenId];
        let currentTokenId = firstTokenId;

        while (currentTokenId !== EOS_TOKEN && tokens.length < MAX_TOKENS) {
            const inputIds = new BigInt64Array([BigInt(currentTokenId)]);
            const inputTensor = new ort.Tensor('int64', inputIds, [1, 1]);

            const feeds = {
                decoder_input_ids: inputTensor,
                encoder_hidden_states: encOut,
                ...kvCache,
            };

            const pastResult = await decoderPast.run(feeds);

            const nextLogits = pastResult[decoderPast.outputNames[0]];
            const nextVocabSize = nextLogits.dims[nextLogits.dims.length - 1];
            currentTokenId = argmax(nextLogits.data, 0, nextVocabSize);
            tokens.push(currentTokenId);

            // Update KV cache using subsequent mapping
            kvCache = {};
            for (const [pastInputName, pastOutName] of Object.entries(kvMappingSubsequent)) {
                if (pastResult[pastOutName]) {
                    kvCache[pastInputName] = pastResult[pastOutName];
                }
            }

            // STREAMING: Send partial result every N tokens
            if (tokens.length % STREAMING_INTERVAL === 0 && currentTokenId !== EOS_TOKEN) {
                const partialText = tokenizer.decode(tokens);
                self.postMessage({ type: 'partial', text: partialText });
            }
        }

        // Final result
        const text = tokenizer.decode(tokens);
        self.postMessage({ type: 'result', text });
    } catch (err) {
        self.postMessage({ type: 'error', message: err.message || String(err) });
    }
}

// ── Utilities ───────────────────────────────
function argmax(data, offset, length) {
    let maxIdx = 0;
    let maxVal = -Infinity;
    for (let i = 0; i < length; i++) {
        const val = data[offset + i];
        if (val > maxVal) {
            maxVal = val;
            maxIdx = i;
        }
    }
    return maxIdx;
}

// ── Message Handler ─────────────────────────
self.addEventListener('message', async (e) => {
    const { type, audio } = e.data;

    if (type === 'init') {
        await initModel();
        return;
    }

    if (type === 'transcribe') {
        await transcribe(audio);
        return;
    }
});
