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

async function generate(taskType, context, userPrompt, messageId, enableThinking = false) {
    if (!apiKey) {
        self.postMessage({ type: 'error', message: 'API key not set.', messageId });
        return;
    }
    try {
        const messages = buildMessages(taskType, context, userPrompt);
        let maxTokens = TOKEN_LIMITS[taskType] || 512;
        if (enableThinking) maxTokens = Math.max(maxTokens * 2, 1024);

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://writeagent.github.io',
                'X-Title': 'WriteAgent',
            },
            body: JSON.stringify({
                model: modelId,
                messages,
                max_tokens: maxTokens,
                stream: true,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            if (response.status === 429) throw new Error('Rate limit reached. Please wait.');
            if (response.status === 401) throw new Error('Invalid API key.');
            throw new Error(err.error?.message || `HTTP ${response.status}`);
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
    const contextLimit = taskType === 'summarize' || taskType === 'grammar' ? 4000 : 6000;

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
        case 'setModelId': modelId = event.data.modelId; break;
        case 'load': await validateApiKey(); break;
        case 'generate': await generate(taskType, context, userPrompt, messageId, enableThinking); break;
        case 'ping': self.postMessage({ type: 'pong' }); break;
    }
});
