/**
 * Embedding Worker — Sentence Embedding via Transformers.js
 * Loads all-MiniLM-L6-v2 (23MB ONNX) for semantic search in Context Memory.
 *
 * Same pattern as ai-worker.js / ai-worker-groq.js:
 *   IN:  { type: 'load' }                         → loads embedding model
 *   IN:  { type: 'embed', texts: string[], id }    → embed text batch
 *   IN:  { type: 'ping' }
 *
 *   OUT: { type: 'status', message }
 *   OUT: { type: 'loaded' }
 *   OUT: { type: 'embeddings', vectors: number[][], id }
 *   OUT: { type: 'error', message }
 *   OUT: { type: 'pong' }
 */

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.0-next.6";
const MODEL_ID = "textagent/embeddinggemma-300m-ONNX";
const EMBEDDING_DIM = 768; // supports MRL truncation to 512/256/128

let pipeline = null;
let embedder = null;

/**
 * Load the embedding model
 */
async function loadModel() {
    try {
        self.postMessage({ type: 'status', message: 'Loading embedding model...' });

        const transformers = await import(TRANSFORMERS_URL);
        pipeline = transformers.pipeline;

        // Force WASM — WebGPU's SimplifiedLayerNormalization shader fails
        // on many GPU drivers with EmbeddingGemma. WASM + q8 is reliable
        // and fast enough for single-pass embedding (no autoregressive decoding).
        const device = 'wasm';

        self.postMessage({ type: 'status', message: `Loading ${MODEL_ID} (${device})...` });

        embedder = await pipeline('feature-extraction', MODEL_ID, {
            device: device,
            dtype: 'q8',
        });

        self.postMessage({ type: 'loaded', device: device });
    } catch (error) {
        self.postMessage({
            type: 'error',
            message: `Failed to load embedding model: ${error.message}`,
        });
    }
}

/**
 * Embed a batch of texts → normalized 384-dim vectors
 * @param {string[]} texts
 * @param {string|number} id — pass-through ID for matching responses
 */
async function embed(texts, id) {
    if (!embedder) {
        self.postMessage({
            type: 'error',
            message: 'Embedding model not loaded yet.',
            id,
        });
        return;
    }

    try {
        const vectors = [];

        // Process in batches of 32 for GPU throughput
        const BATCH = 32;
        for (let i = 0; i < texts.length; i += BATCH) {
            const batch = texts.slice(i, i + BATCH);
            const output = await embedder(batch, { pooling: 'last_token', normalize: true });

            // output.dims = [batchSize, 384]
            const dims = output.dims;
            const data = output.data; // Float32Array

            for (let j = 0; j < batch.length; j++) {
                const start = j * dims[1];
                const end = start + EMBEDDING_DIM; // use configured dim (MRL truncation)
                const vec = data.slice(start, Math.min(end, start + dims[1]));
                // Re-normalize after truncation (MRL)
                let norm = 0;
                for (let k = 0; k < vec.length; k++) norm += vec[k] * vec[k];
                norm = Math.sqrt(norm) || 1;
                const normalized = new Array(vec.length);
                for (let k = 0; k < vec.length; k++) normalized[k] = vec[k] / norm;
                vectors.push(normalized);
            }
        }

        self.postMessage({ type: 'embeddings', vectors, id });
    } catch (error) {
        self.postMessage({
            type: 'error',
            message: `Embedding failed: ${error.message}`,
            id,
        });
    }
}

// Listen for messages from main thread
self.addEventListener('message', async (event) => {
    const { type } = event.data;

    switch (type) {
        case 'load':
            await loadModel();
            break;
        case 'embed':
            await embed(event.data.texts, event.data.id);
            break;
        case 'ping':
            self.postMessage({ type: 'pong' });
            break;
        default:
            console.warn('Embedding Worker: Unknown message type:', type);
    }
});
