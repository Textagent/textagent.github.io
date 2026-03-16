/**
 * AI Worker — OpenRouter API (Free models)
 * Uses meta-llama/llama-3.3-70b-instruct:free by default
 *
 * Same message interface as other workers:
 *   IN:  { type: 'load' }
 *   IN:  { type: 'generate', taskType, context, userPrompt, messageId, enableThinking }
 *   IN:  { type: 'setApiKey', apiKey }
 *   IN:  { type: 'ping' }
 *
 *   OUT: { type: 'loaded' }
 *   OUT: { type: 'token', token, messageId }
 *   OUT: { type: 'complete', text, messageId }
 *   OUT: { type: 'error', message, messageId }
 *   OUT: { type: 'status', message }
 *   OUT: { type: 'pong' }
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';
let modelId = 'openrouter/auto';

import { TOKEN_LIMITS, buildMessages as _buildMessages } from './ai-worker-common.js';

let apiKey = null;

async function validateApiKey() {
    if (!apiKey) {
        self.postMessage({ type: 'error', message: 'No API key provided.' });
        return;
    }
    try {
        self.postMessage({ type: 'status', message: 'Validating OpenRouter API key...' });
        const response = await fetch(OPENROUTER_MODELS_URL, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
        }
        self.postMessage({ type: 'loaded', device: 'OPENROUTER' });
    } catch (error) {
        self.postMessage({ type: 'error', message: `API key validation failed: ${error.message}` });
    }
}

const MAX_RETRIES = 2;
const RETRY_STATUS_CODES = [500, 502, 503, 429];

async function generate(taskType, context, userPrompt, messageId, enableThinking = false, attachments = [], chatHistory = [], maxTokensOverride = 0) {
    if (!apiKey) {
        self.postMessage({ type: 'error', message: 'API key not set.', messageId });
        return;
    }
    try {
        const messages = buildMessages(taskType, context, userPrompt, chatHistory);
        let maxTokens = maxTokensOverride || TOKEN_LIMITS[taskType] || 512;
        if (enableThinking) maxTokens = Math.max(maxTokens * 2, 1024);

        // If there are image attachments, convert the last user message to multipart content
        if (attachments && attachments.length > 0) {
            const lastUserMsg = messages[messages.length - 1];
            if (lastUserMsg && lastUserMsg.role === 'user') {
                const parts = [{ type: 'text', text: typeof lastUserMsg.content === 'string' ? lastUserMsg.content : '' }];
                attachments.forEach(att => {
                    if (att.type === 'image' && att.data) {
                        parts.push({
                            type: 'image_url',
                            image_url: { url: 'data:' + (att.mimeType || 'image/png') + ';base64,' + att.data }
                        });
                    } else if (att.type === 'file' && att.textContent) {
                        parts[0].text += '\n\n[Attached File: ' + (att.name || 'file') + ']\n' + att.textContent;
                    }
                });
                lastUserMsg.content = parts;
            }
        }

        const requestBody = JSON.stringify({
            model: modelId,
            messages,
            max_tokens: maxTokens,
            stream: true,
            temperature: 0.7,
        });

        // Retry loop for transient errors
        let response;
        let lastError;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                response = await fetch(OPENROUTER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://textagent.github.io',
                        'X-Title': 'TextAgent',
                    },
                    body: requestBody,
                });

                if (response.ok) break; // Success — exit retry loop

                const err = await response.json().catch(() => ({}));
                const errMsg = err.error?.message || response.statusText || `HTTP ${response.status}`;

                // Non-retryable errors — fail immediately
                if (response.status === 401) throw new Error(`Invalid API key for ${modelId}.`);
                if (!RETRY_STATUS_CODES.includes(response.status)) {
                    throw new Error(`${modelId}: ${errMsg} (HTTP ${response.status})`);
                }

                // Retryable error — log and backoff
                lastError = new Error(`${modelId}: ${errMsg} (HTTP ${response.status})`);
                if (attempt < MAX_RETRIES) {
                    const delayMs = (attempt + 1) * 1000; // 1s, 2s
                    console.warn(`[OpenRouter] ${modelId} returned ${response.status}, retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`);
                    await new Promise(r => setTimeout(r, delayMs));
                }
            } catch (fetchErr) {
                // Network errors are also retryable
                if (fetchErr.message?.includes('Invalid API key')) throw fetchErr;
                if (fetchErr.message?.includes(modelId)) throw fetchErr; // Already formatted
                lastError = fetchErr;
                if (attempt < MAX_RETRIES) {
                    const delayMs = (attempt + 1) * 1000;
                    console.warn(`[OpenRouter] Network error for ${modelId}, retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES}):`, fetchErr.message);
                    await new Promise(r => setTimeout(r, delayMs));
                }
            }
        }

        // If we exhausted retries without a successful response
        if (!response || !response.ok) {
            throw lastError || new Error(`${modelId}: Server error after ${MAX_RETRIES + 1} attempts. Try a different model.`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;
                const data = trimmed.slice(6);
                if (data === '[DONE]') continue;
                try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) {
                        fullText += delta;
                        self.postMessage({ type: 'token', token: delta, messageId });
                    }
                } catch (e) { /* skip */ }
            }
        }
        self.postMessage({ type: 'complete', text: fullText.trim(), messageId });
    } catch (error) {
        self.postMessage({ type: 'error', message: `Generation failed: ${error.message}`, messageId });
    }
}

// Cloud worker: larger context limits
function buildMessages(taskType, context, userPrompt, chatHistory) {
    const contextLimit = taskType === 'summarize' || taskType === 'grammar' ? 4000 : 6000;
    return _buildMessages(taskType, context, userPrompt, { contextLimit, autocompleteLimit: 2000, chatHistory });
}

self.addEventListener('message', async (event) => {
    const { type, taskType, context, userPrompt, messageId, enableThinking, attachments, chatHistory } = event.data;
    switch (type) {
        case 'setApiKey': apiKey = event.data.apiKey; break;
        case 'setModelId': modelId = event.data.modelId; break;
        case 'load': await validateApiKey(); break;
        case 'generate': await generate(taskType, context, userPrompt, messageId, enableThinking, attachments, chatHistory, event.data.maxTokensOverride || 0); break;
        case 'ping': self.postMessage({ type: 'pong' }); break;
    }
});
