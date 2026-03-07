/**
 * AI Worker — Gemini Native Image Generation (Nano Banana models)
 * Uses the standard Gemini generateContent endpoint with responseModalities: ["IMAGE"]
 * Same API key as Gemini text models.
 *
 * Message interface:
 *   IN:  { type: 'setApiKey', apiKey }
 *   IN:  { type: 'setModelId', modelId }
 *   IN:  { type: 'load' }
 *   IN:  { type: 'generate-image', prompt, aspectRatio, messageId }
 *   IN:  { type: 'generate', taskType, context, userPrompt, messageId }  → routes to image gen
 *   OUT: { type: 'loaded', device: 'GEMINI_IMAGE' }
 *   OUT: { type: 'image-complete', imageBase64, mimeType, prompt, messageId }
 *   OUT: { type: 'image-error', message, messageId }
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
let modelId = 'gemini-3.1-flash-image-preview';
let apiKey = null;

async function validateApiKey() {
    if (!apiKey) {
        self.postMessage({ type: 'error', message: 'No API key provided.' });
        return;
    }
    try {
        self.postMessage({ type: 'status', message: 'Validating Gemini API key for image generation...' });
        const response = await fetch(GEMINI_BASE, {
            headers: { 'x-goog-api-key': apiKey },
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
        }
        self.postMessage({ type: 'loaded', device: 'GEMINI_IMAGE' });
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
        self.postMessage({ type: 'status', message: `Generating image with ${modelId}...` });

        const requestBody = {
            contents: [{
                parts: [{ text: prompt.trim() }],
            }],
            generationConfig: {
                responseModalities: ['IMAGE', 'TEXT'],
            },
        };

        const url = `${GEMINI_BASE}/${modelId}:generateContent`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            if (response.status === 429) throw new Error('Rate limit reached. Please wait.');
            if (response.status === 400) throw new Error(err.error?.message || 'Invalid request. Try a different prompt.');
            if (response.status === 403) throw new Error(err.error?.message || 'API key not authorized for this model.');
            throw new Error(err.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();

        // Look for inline image data in the response
        const parts = data.candidates?.[0]?.content?.parts || [];
        let imageFound = false;

        for (const part of parts) {
            if (part.inlineData) {
                self.postMessage({
                    type: 'image-complete',
                    imageBase64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || 'image/png',
                    prompt: prompt.trim(),
                    messageId,
                });
                imageFound = true;
                break;
            }
        }

        if (!imageFound) {
            // Check if there's a text-only response (model may not support image output)
            const textParts = parts.filter(p => p.text).map(p => p.text).join('');
            if (textParts) {
                throw new Error('Model returned text instead of an image. It may not support image output: ' + textParts.substring(0, 200));
            }
            throw new Error('No image was generated. The request may have been filtered by safety settings.');
        }
    } catch (error) {
        self.postMessage({ type: 'image-error', message: `Image generation failed: ${error.message}`, messageId });
    }
}

self.addEventListener('message', async (event) => {
    const { type, messageId } = event.data;
    switch (type) {
        case 'setApiKey': apiKey = event.data.apiKey; break;
        case 'setModelId': modelId = event.data.modelId; break;
        case 'load': await validateApiKey(); break;
        case 'generate-image':
            await generateImage(event.data.prompt, event.data.aspectRatio, messageId);
            break;
        case 'generate':
            // When used as the active model, regular chat messages become image prompts
            await generateImage(
                event.data.userPrompt || event.data.context || '',
                '1:1',
                messageId
            );
            break;
        case 'ping': self.postMessage({ type: 'pong' }); break;
    }
});
