/**
 * AI Worker — Google Gemini 2.0 Flash (Free tier)
 * 15 RPM, 1500 req/day, 1M tokens/min
 *
 * Same message interface as other workers.
 * Gemini uses a different API format than OpenAI, so we translate.
 */

const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const TOKEN_LIMITS = {
    summarize: 256, expand: 512, rephrase: 384, grammar: 384,
    polish: 384, formalize: 384, elaborate: 512, shorten: 256,
    autocomplete: 128, generate: 512, markdown: 512, explain: 384,
    simplify: 384, qa: 384, chat: 512,
};

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

async function generate(taskType, context, userPrompt, messageId, enableThinking = false) {
    if (!apiKey) {
        self.postMessage({ type: 'error', message: 'API key not set.', messageId });
        return;
    }
    try {
        const messages = buildMessages(taskType, context, userPrompt);
        let maxTokens = TOKEN_LIMITS[taskType] || 512;
        if (enableThinking) maxTokens = Math.max(maxTokens * 2, 1024);

        // Convert OpenAI-style messages to Gemini format
        const systemInstruction = messages.find(m => m.role === 'system');
        const userMessages = messages.filter(m => m.role !== 'system');

        const requestBody = {
            contents: userMessages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            })),
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

function buildMessages(taskType, context, userPrompt) {
    const systemPrompts = {
        summarize: 'You are a helpful assistant. Summarize the following text concisely while keeping the key points. Be brief. Output in markdown format.',
        expand: 'You are a helpful writing assistant. Expand the following text with more details, examples, and explanations. Keep the same tone and style. Output in markdown format.',
        rephrase: 'You are a helpful writing assistant. Rephrase the following text to improve clarity and readability while preserving the meaning. Output in markdown format.',
        grammar: 'You are a helpful writing assistant. Fix any grammar, spelling, and punctuation errors in the following text. Only output the corrected text, nothing else.',
        autocomplete: 'You are a helpful writing assistant. Continue writing the text naturally. Only output the continuation, do not repeat the existing text. Write 1-2 sentences.',
        generate: 'You are a helpful content generation assistant. Generate content based on the user\'s request. Output in well-formatted markdown.',
        markdown: 'You are a markdown expert. Generate well-formatted markdown content based on the user\'s request. Use headings, lists, tables, code blocks, and other markdown features as appropriate.',
        explain: 'You are a helpful assistant. Explain the following text in simple, easy-to-understand terms. Be concise. Output in markdown format.',
        simplify: 'You are a helpful writing assistant. Simplify the following text to make it easier to understand. Use shorter sentences and simpler words. Output in markdown format.',
        polish: 'You are a skilled writing editor. Polish the following text to improve flow, word choice, and overall quality while preserving the meaning and tone. Only output the polished text.',
        formalize: 'You are a professional writing assistant. Rewrite the following text in a more formal, professional tone suitable for business or academic contexts. Only output the formalized text.',
        elaborate: 'You are a helpful writing assistant. Elaborate on the following text by adding more details, examples, and explanations to make it more comprehensive. Output in markdown format.',
        shorten: 'You are a concise writing editor. Shorten the following text while preserving all key information. Remove redundancy and use fewer words. Only output the shortened text.',
        qa: 'You are a helpful assistant. Answer the user\'s question based on the provided document context. Be concise. If the answer cannot be found in the context, say so.',
        chat: 'You are a helpful AI assistant integrated into a Markdown editor. Help the user with writing, editing, and formatting tasks. Be concise. Output in markdown format.',
    };
    const systemMessage = systemPrompts[taskType] || systemPrompts.chat;
    const messages = [{ role: 'system', content: systemMessage }];
    const contextLimit = taskType === 'summarize' || taskType === 'grammar' ? 4000 : 8000;

    if (context && (taskType === 'qa' || taskType === 'explain' || taskType === 'simplify')) {
        messages.push({ role: 'user', content: `Context:\n\`\`\`\n${context.substring(0, contextLimit)}\n\`\`\`\n\n${userPrompt || 'Please process this text.'}` });
    } else if (context && ['summarize', 'expand', 'rephrase', 'grammar', 'polish', 'formalize', 'elaborate', 'shorten'].includes(taskType)) {
        messages.push({ role: 'user', content: context.substring(0, contextLimit) });
    } else if (context && taskType === 'autocomplete') {
        messages.push({ role: 'user', content: `Continue this text:\n${context.substring(Math.max(0, context.length - 2000))}` });
    } else {
        messages.push({ role: 'user', content: userPrompt || context || 'Hello!' });
    }
    return messages;
}

self.addEventListener('message', async (event) => {
    const { type, taskType, context, userPrompt, messageId, enableThinking } = event.data;
    switch (type) {
        case 'setApiKey': apiKey = event.data.apiKey; break;
        case 'load': await validateApiKey(); break;
        case 'generate': await generate(taskType, context, userPrompt, messageId, enableThinking); break;
        case 'ping': self.postMessage({ type: 'pong' }); break;
    }
});
