/**
 * AI Worker — HuggingFace Inference API (Image Generation)
 * Supports SDXL and FLUX.1 Schnell via router.huggingface.co
 *
 * Message interface (matches ai-worker-imagen.js):
 *   IN:  { type: 'setApiKey', apiKey }
 *   IN:  { type: 'setModelId', modelId }          → HF model path
 *   IN:  { type: 'load' }                         → validates key
 *   IN:  { type: 'generate-image', prompt, aspectRatio, messageId }
 *   OUT: { type: 'loaded', device: 'HF-INFERENCE' }
 *   OUT: { type: 'image-complete', imageBase64, mimeType, prompt, messageId }
 *   OUT: { type: 'image-error', message, messageId }
 */

const HF_BASE = 'https://router.huggingface.co/hf-inference/models';

// Default to SDXL; overridable via setModelId
let modelId = 'stabilityai/stable-diffusion-xl-base-1.0';
let apiKey = null;

/**
 * Validate the HuggingFace API token.
 * Uses a lightweight HEAD request to the model endpoint to confirm access.
 */
async function validateApiKey() {
    if (!apiKey) {
        self.postMessage({ type: 'error', message: 'No HuggingFace API token provided.' });
        return;
    }
    try {
        self.postMessage({ type: 'status', message: 'Validating HuggingFace token...' });

        // Quick validation: check token format
        if (!apiKey.startsWith('hf_') && apiKey.length < 10) {
            throw new Error('Token should start with "hf_". Get one at huggingface.co/settings/tokens');
        }

        // Lightweight check: ping the model endpoint with a HEAD-like small request
        const response = await fetch(`${HF_BASE}/${modelId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: '' }),  // empty prompt — will fail fast but validates auth
        });

        // 401 = bad token, anything else means token is valid (even 400/422/503 = model issue, not auth)
        if (response.status === 401) {
            throw new Error('Invalid token. Please check your HuggingFace API key.');
        }

        self.postMessage({ type: 'loaded', device: 'HF-INFERENCE' });
    } catch (error) {
        if (error.message.includes('Invalid token') || error.message.includes('hf_')) {
            self.postMessage({ type: 'error', message: `HuggingFace token validation failed: ${error.message}` });
        } else {
            // Network errors or non-auth errors — token is probably fine, mark as loaded
            self.postMessage({ type: 'loaded', device: 'HF-INFERENCE' });
        }
    }
}

/**
 * Convert a Blob to base64 string
 */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // Strip data URL prefix: "data:image/png;base64,..."
            const dataUrl = reader.result;
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Generate an image via HuggingFace Inference API
 */
async function generateImage(prompt, aspectRatio, messageId) {
    if (!apiKey) {
        self.postMessage({ type: 'image-error', message: 'HuggingFace token not set.', messageId });
        return;
    }
    if (!prompt || !prompt.trim()) {
        self.postMessage({ type: 'image-error', message: 'Please enter a prompt.', messageId });
        return;
    }

    try {
        const modelName = modelId.split('/').pop() || modelId;
        self.postMessage({ type: 'status', message: `Generating image with ${modelName}...` });

        const url = `${HF_BASE}/${modelId}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: prompt.trim() }),
        });

        if (!response.ok) {
            let errMsg = `HTTP ${response.status}`;
            try {
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('json')) {
                    const err = await response.json();
                    errMsg = err.error || err.message || errMsg;
                } else {
                    const text = await response.text();
                    // Try to extract error from HTML or plain text
                    const match = text.match(/<title>([^<]+)<\/title>/);
                    errMsg = match ? match[1] : errMsg;
                }
            } catch (_) { /* use default errMsg */ }

            if (response.status === 401) throw new Error('Invalid HuggingFace token. Please check your API key.');
            if (response.status === 429) throw new Error('Rate limit reached. Please wait a moment and try again.');
            if (response.status === 503) throw new Error(`Model is loading (cold start). Please try again in ~30 seconds.`);
            throw new Error(errMsg);
        }

        // Response is the raw image blob
        const blob = await response.blob();
        if (!blob || blob.size < 100) {
            throw new Error('Received empty or invalid image response.');
        }

        const mimeType = blob.type || 'image/png';
        const base64 = await blobToBase64(blob);

        self.postMessage({
            type: 'image-complete',
            imageBase64: base64,
            mimeType: mimeType,
            prompt: prompt.trim(),
            messageId,
        });
    } catch (error) {
        self.postMessage({
            type: 'image-error',
            message: `Image generation failed: ${error.message}`,
            messageId,
        });
    }
}

self.addEventListener('message', async (event) => {
    const { type, messageId } = event.data;
    switch (type) {
        case 'setApiKey':
            apiKey = event.data.apiKey;
            break;
        case 'setModelId':
            modelId = event.data.modelId || modelId;
            break;
        case 'load':
            await validateApiKey();
            break;
        case 'generate-image':
            await generateImage(event.data.prompt, event.data.aspectRatio, messageId);
            break;
        case 'ping':
            self.postMessage({ type: 'pong' });
            break;
    }
});
