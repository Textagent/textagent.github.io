/**
 * AI Worker — Google Gemini 3.1 Flash Lite (Free tier)
 * 15 RPM, 1500 req/day, 1M tokens/min
 *
 * Same message interface as other workers.
 * Gemini uses a different API format than OpenAI, so we translate.
 *
 * Uses shared TOKEN_LIMITS and buildMessages() from ai-worker-common.js
 * to avoid duplicating system prompts and context limits.
 */

const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

import { TOKEN_LIMITS, buildMessages as _buildMessages } from './ai-worker-common.js';

let apiKey = null;

async function validateApiKey() {
    if (!apiKey) {
        self.postMessage({ type: 'error', message: 'No API key provided.' });
        return;
    }
    try {
        self.postMessage({ type: 'status', message: 'Validating Gemini API key...' });
        const response = await fetch(GEMINI_BASE, {
            headers: { 'x-goog-api-key': apiKey },
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
        }
        self.postMessage({ type: 'loaded', device: 'GEMINI' });
    } catch (error) {
        self.postMessage({ type: 'error', message: `API key validation failed: ${error.message}` });
    }
}

async function generate(taskType, context, userPrompt, messageId, enableThinking = false, attachments = [], chatHistory = [], maxTokensOverride = 0) {
    if (!apiKey) {
        self.postMessage({ type: 'error', message: 'API key not set.', messageId });
        return;
    }
    try {
        // Use shared buildMessages — cloud defaults (128K context)
        const messages = buildMessages(taskType, context, userPrompt, chatHistory);
        let maxTokens = maxTokensOverride || TOKEN_LIMITS[taskType] || 512;
        if (enableThinking) maxTokens = Math.max(maxTokens * 2, 1024);

        // Convert OpenAI-style messages to Gemini format
        const systemInstruction = messages.find(m => m.role === 'system');
        const userMessages = messages.filter(m => m.role !== 'system');

        const requestBody = {
            contents: userMessages.map(m => {
                const parts = [{ text: m.content }];
                // For the last user message, add image attachments as inlineData parts
                if (m.role === 'user' && attachments && attachments.length > 0) {
                    attachments.forEach(att => {
                        if (att.type === 'image' && att.data) {
                            parts.push({
                                inlineData: {
                                    mimeType: att.mimeType || 'image/png',
                                    data: att.data
                                }
                            });
                        } else if (att.type === 'file' && att.textContent) {
                            // Append text file content as additional context
                            parts[0].text += '\n\n[Attached File: ' + (att.name || 'file') + ']\n' + att.textContent;
                        }
                    });
                }
                return {
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: parts,
                };
            }),
            generationConfig: {
                maxOutputTokens: maxTokens,
                temperature: 0.7,
            },
        };

        if (systemInstruction) {
            requestBody.systemInstruction = {
                parts: [{ text: systemInstruction.content }],
            };
        }

        // Use streaming endpoint
        const url = `${GEMINI_BASE}/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            if (response.status === 429) throw new Error('Rate limit reached. Please wait.');
            if (response.status === 400 || response.status === 403) {
                throw new Error(err.error?.message || 'Invalid API key or request.');
            }
            throw new Error(err.error?.message || `HTTP ${response.status}`);
        }

        // Read SSE stream — Gemini format differs from OpenAI
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
                    // Gemini SSE format: candidates[0].content.parts[0].text
                    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        fullText += text;
                        self.postMessage({ type: 'token', token: text, messageId });
                    }
                } catch (e) { /* skip */ }
            }
        }
        self.postMessage({ type: 'complete', text: fullText.trim(), messageId });
    } catch (error) {
        self.postMessage({ type: 'error', message: `Generation failed: ${error.message}`, messageId });
    }
}

// Cloud worker: use common defaults (128K context for Gemini's 1M token window)
function buildMessages(taskType, context, userPrompt, chatHistory) {
    return _buildMessages(taskType, context, userPrompt, { autocompleteLimit: 2000, chatHistory });
}

self.addEventListener('message', async (event) => {
    const { type, taskType, context, userPrompt, messageId, enableThinking, attachments, chatHistory } = event.data;
    switch (type) {
        case 'setApiKey': apiKey = event.data.apiKey; break;
        case 'load': await validateApiKey(); break;
        case 'generate': await generate(taskType, context, userPrompt, messageId, enableThinking, attachments, chatHistory, event.data.maxTokensOverride || 0); break;
        case 'ping': self.postMessage({ type: 'pong' }); break;
    }
});
