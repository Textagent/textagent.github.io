/**
 * AI Worker — Groq Cloud API (Llama 3.3 70B)
 * Handles Groq REST API calls with SSE streaming.
 *
 * Same message interface as ai-worker.js (Qwen local):
 *   IN:  { type: 'load' }          → validates API key
 *   IN:  { type: 'generate', taskType, context, userPrompt, messageId, enableThinking }
 *   IN:  { type: 'setApiKey', apiKey }
 *   IN:  { type: 'ping' }
 *
 *   OUT: { type: 'loaded' }
 *   OUT: { type: 'token', token, messageId }     → streaming tokens
 *   OUT: { type: 'complete', text, messageId }
 *   OUT: { type: 'error', message, messageId }
 *   OUT: { type: 'status', message }
 *   OUT: { type: 'pong' }
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS_URL = 'https://api.groq.com/openai/v1/models';
const MODEL_ID = 'llama-3.3-70b-versatile';

import { TOKEN_LIMITS, buildMessages as _buildMessages } from './ai-worker-common.js';

let apiKey = null;

/**
 * Validate the API key by fetching the models list
 */
async function validateApiKey() {
    if (!apiKey) {
        self.postMessage({
            type: 'error',
            message: 'No API key provided. Please enter your Groq API key.',
        });
        return;
    }

    try {
        self.postMessage({
            type: 'status',
            message: 'Validating Groq API key...',
        });

        const response = await fetch(GROQ_MODELS_URL, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
            throw new Error(`Invalid API key: ${errorMsg}`);
        }

        self.postMessage({
            type: 'loaded',
            device: 'GROQ',
        });
    } catch (error) {
        self.postMessage({
            type: 'error',
            message: `API key validation failed: ${error.message}`,
        });
    }
}

/**
 * Generate text via Groq API with SSE streaming
 */
async function generate(taskType, context, userPrompt, messageId, enableThinking = false, attachments = [], chatHistory = [], maxTokensOverride = 0) {
    if (!apiKey) {
        self.postMessage({
            type: 'error',
            message: 'API key not set. Please enter your Groq API key.',
            messageId,
        });
        return;
    }

    try {
        const messages = buildMessages(taskType, context, userPrompt, chatHistory);

        // If there are image attachments, convert the last user message to multipart content
        if (attachments && attachments.length > 0) {
            const lastUserMsg = messages[messages.length - 1];
            if (lastUserMsg && lastUserMsg.role === 'user') {
                const parts = [{ type: 'text', text: lastUserMsg.content }];
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

        let maxTokens = maxTokensOverride || TOKEN_LIMITS[taskType] || 512;
        if (enableThinking) maxTokens = Math.max(maxTokens * 2, 1024);

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: messages,
                max_tokens: maxTokens,
                stream: true,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || `HTTP ${response.status}`;

            // Special handling for rate limits
            if (response.status === 429) {
                throw new Error('Rate limit reached. Please wait a moment and try again.');
            }
            // Auth errors
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your Groq API key.');
            }
            throw new Error(errorMsg);
        }

        // Read the SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE lines
            const lines = buffer.split('\n');
            // Keep the last potentially incomplete line in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;

                const data = trimmed.slice(6); // Remove 'data: ' prefix
                if (data === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) {
                        fullText += delta;
                        // Send token for real-time streaming
                        self.postMessage({
                            type: 'token',
                            token: delta,
                            messageId,
                        });
                    }
                } catch (e) {
                    // Skip malformed JSON chunks
                }
            }
        }

        self.postMessage({
            type: 'complete',
            text: fullText.trim(),
            messageId,
        });
    } catch (error) {
        self.postMessage({
            type: 'error',
            message: `Generation failed: ${error.message}`,
            messageId,
        });
    }
}

/**
 * Build chat messages array based on task type
 * (Same logic as ai-worker.js)
 */
// Cloud worker: larger context limits than local worker
function buildMessages(taskType, context, userPrompt, chatHistory) {
    const contextLimit = taskType === 'summarize' || taskType === 'grammar' ? 4000 : 6000;
    return _buildMessages(taskType, context, userPrompt, { contextLimit, autocompleteLimit: 2000, chatHistory });
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { type, taskType, context, userPrompt, messageId, enableThinking, attachments, chatHistory } = event.data;

    switch (type) {
        case 'setApiKey':
            apiKey = event.data.apiKey;
            break;
        case 'load':
            await validateApiKey();
            break;
        case 'generate':
            await generate(taskType, context, userPrompt, messageId, enableThinking, attachments, chatHistory, event.data.maxTokensOverride || 0);
            break;
        case 'ping':
            self.postMessage({ type: 'pong' });
            break;
        default:
            console.warn('Groq Worker: Unknown message type:', type);
    }
});
