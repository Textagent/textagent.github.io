/**
 * AI Worker — Google Imagen 4 Ultra (Image Generation)
 * Uses the same Gemini API key. 25 requests/day on free tier.
 *
 * Message interface:
 *   IN:  { type: 'setApiKey', apiKey }
 *   IN:  { type: 'load' }                         → validates key
 *   IN:  { type: 'generate-image', prompt, aspectRatio, messageId }
 *   OUT: { type: 'loaded', device: 'IMAGEN' }
 *   OUT: { type: 'image-complete', imageBase64, prompt, messageId }
 *   OUT: { type: 'image-error', message, messageId }
 */

const IMAGEN_MODEL = 'imagen-4.0-ultra-generate-001';
const IMAGEN_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

let apiKey = null;

async function validateApiKey() {
    if (!apiKey) {
        self.postMessage({ type: 'error', message: 'No API key provided.' });
        return;
    }
    try {
        self.postMessage({ type: 'status', message: 'Validating Gemini API key for Imagen...' });
        const response = await fetch(IMAGEN_BASE, {
            headers: { 'x-goog-api-key': apiKey },
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
        }
        self.postMessage({ type: 'loaded', device: 'IMAGEN' });
    } catch (error) {
        self.postMessage({ type: 'error', message: `API key validation failed: ${error.message}` });
    }
}

async function generateImage(prompt, aspectRatio, messageId) {
    if (!apiKey) {
        self.postMessage({ type: 'image-error', message: 'API key not set.', messageId });
        return;
    }
    if (!prompt || !prompt.trim()) {
        self.postMessage({ type: 'image-error', message: 'Please enter a prompt.', messageId });
        return;
    }

    try {
        self.postMessage({ type: 'status', message: 'Generating image with Imagen 4 Ultra...' });

        const requestBody = {
            instances: [{ prompt: prompt.trim() }],
            parameters: {
                sampleCount: 1,
                aspectRatio: aspectRatio || '1:1',
            },
        };

        const url = `${IMAGEN_BASE}/${IMAGEN_MODEL}:predict`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            if (response.status === 429) throw new Error('Rate limit reached (25/day). Please wait.');
            if (response.status === 400) throw new Error(err.error?.message || 'Invalid request. Try a different prompt.');
            if (response.status === 403) throw new Error(err.error?.message || 'API key not authorized for Imagen.');
            throw new Error(err.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const prediction = data.predictions?.[0];

        if (!prediction || !prediction.bytesBase64Encoded) {
            // Imagen may block content for safety reasons
            const reason = prediction?.raiFilteredReason || 'Image was filtered by safety settings.';
            throw new Error(reason);
        }

        self.postMessage({
            type: 'image-complete',
            imageBase64: prediction.bytesBase64Encoded,
            mimeType: prediction.mimeType || 'image/png',
            prompt: prompt.trim(),
            messageId,
        });
    } catch (error) {
        self.postMessage({ type: 'image-error', message: `Image generation failed: ${error.message}`, messageId });
    }
}

self.addEventListener('message', async (event) => {
    const { type, messageId } = event.data;
    switch (type) {
        case 'setApiKey': apiKey = event.data.apiKey; break;
        case 'load': await validateApiKey(); break;
        case 'generate-image':
            await generateImage(event.data.prompt, event.data.aspectRatio, messageId);
            break;
        case 'ping': self.postMessage({ type: 'pong' }); break;
    }
});
