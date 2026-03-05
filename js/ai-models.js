/**
 * js/ai-models.js — Single source of truth for all AI model configurations.
 *
 * Add, remove or edit models HERE and it automatically reflects everywhere:
 *   • Model selector dropdown (built dynamically)
 *   • Status bar labels / badges
 *   • API-key dialog text
 *   • Worker file selection
 *
 * Each entry uses the internal model-id as key (matches data-model in the dropdown).
 */
(function () {
    'use strict';

    window.AI_MODELS = {
        // ── Local ──────────────────────────────────────────────
        'qwen-local': {
            label: 'Qwen 3.5 · Local',
            badge: 'Qwen 3.5 · Local',
            icon: 'bi bi-pc-display',
            statusReady: 'Qwen 3.5 · Local',
            dropdownName: 'Qwen 3.5 Small',
            dropdownDesc: 'Local · Private · No API key needed',
            isLocal: true,
        },

        // ── Cloud: Groq ────────────────────────────────────────
        'groq-llama': {
            label: 'Llama 3.3 · Groq',
            badge: 'Llama 3.3 · Groq',
            icon: 'bi bi-cloud',
            statusReady: 'Llama 3.3 70B · Groq Cloud',
            workerFile: 'ai-worker-groq.js',
            keyStorageKey: 'md-viewer-groq-key',
            dialogTitle: 'Connect to Groq',
            dialogDesc: 'Enter your free API key to use <strong>Llama 3.3 70B</strong>',
            dialogPlaceholder: 'gsk_xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://console.groq.com/keys',
            dialogLinkText: 'console.groq.com/keys',
            dialogIcon: 'bi bi-cloud',
            dropdownName: 'Llama 3.3 70B',
            dropdownDesc: 'Groq Cloud · Fast · Free tier',
        },

        // ── Cloud: Google Gemini ───────────────────────────────
        'gemini-flash': {
            label: 'Gemini 3.1 · Google',
            badge: 'Gemini 3.1 · Google',
            icon: 'bi bi-google',
            statusReady: 'Gemini 3.1 Flash Lite · Google',
            workerFile: 'ai-worker-gemini.js',
            keyStorageKey: 'md-viewer-gemini-key',
            dialogTitle: 'Connect to Gemini',
            dialogDesc: 'Enter your free API key to use <strong>Gemini 3.1 Flash Lite</strong>',
            dialogPlaceholder: 'AIzaSy_xxxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://aistudio.google.com/apikey',
            dialogLinkText: 'aistudio.google.com/apikey',
            dialogIcon: 'bi bi-google',
            dropdownName: 'Gemini 3.1 Flash Lite',
            dropdownDesc: 'Google · Fast · Free tier',
        },


        // ── Cloud: Grok 4.1 Fast via OpenRouter ───────────────
        'openrouter-grok': {
            label: 'Grok 4.1 Fast · xAI',
            badge: 'Grok 4.1 Fast · xAI',
            icon: 'bi bi-lightning-charge',
            statusReady: 'Grok 4.1 Fast · xAI via OpenRouter',
            workerFile: 'ai-worker-openrouter.js',
            workerModelId: 'x-ai/grok-4.1-fast',         // override model in worker
            keyStorageKey: 'md-viewer-openrouter-key',     // shares same key
            dialogTitle: 'Connect to OpenRouter',
            dialogDesc: 'Enter your API key to use <strong>Grok 4.1 Fast</strong> via OpenRouter',
            dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://openrouter.ai/keys',
            dialogLinkText: 'openrouter.ai/keys',
            dialogIcon: 'bi bi-lightning-charge',
            dropdownName: 'Grok 4.1 Fast',
            dropdownDesc: 'xAI · via OpenRouter',
        },

        // ── Cloud: Trinity Large via OpenRouter ────────────────
        'openrouter-trinity': {
            label: 'Trinity Large · Arcee',
            badge: 'Trinity Large · Arcee',
            icon: 'bi bi-stars',
            statusReady: 'Trinity Large · Arcee AI via OpenRouter',
            workerFile: 'ai-worker-openrouter.js',
            workerModelId: 'arcee-ai/trinity-large-preview:free',
            keyStorageKey: 'md-viewer-openrouter-key',     // shares same key
            dialogTitle: 'Connect to OpenRouter',
            dialogDesc: 'Enter your API key to use <strong>Trinity Large</strong> via OpenRouter',
            dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://openrouter.ai/keys',
            dialogLinkText: 'openrouter.ai/keys',
            dialogIcon: 'bi bi-stars',
            dropdownName: 'Trinity Large',
            dropdownDesc: 'Arcee AI · Free · via OpenRouter',
        },

        // ── Cloud: GPT-OSS 20B via OpenRouter ─────────────────
        'openrouter-gpt-oss': {
            label: 'GPT-OSS 20B · OpenAI',
            badge: 'GPT-OSS 20B · OpenAI',
            icon: 'bi bi-cpu',
            statusReady: 'GPT-OSS 20B · OpenAI via OpenRouter',
            workerFile: 'ai-worker-openrouter.js',
            workerModelId: 'openai/gpt-oss-20b',
            keyStorageKey: 'md-viewer-openrouter-key',
            dialogTitle: 'Connect to OpenRouter',
            dialogDesc: 'Enter your API key to use <strong>GPT-OSS 20B</strong> via OpenRouter',
            dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://openrouter.ai/keys',
            dialogLinkText: 'openrouter.ai/keys',
            dialogIcon: 'bi bi-cpu',
            dropdownName: 'GPT-OSS 20B',
            dropdownDesc: 'OpenAI · via OpenRouter',
        },

        // ── Cloud: Qwen 3.5 Flash via OpenRouter ──────────────
        'openrouter-qwen-flash': {
            label: 'Qwen 3.5 Flash · Alibaba',
            badge: 'Qwen 3.5 Flash · Alibaba',
            icon: 'bi bi-wind',
            statusReady: 'Qwen 3.5 Flash · Alibaba via OpenRouter',
            workerFile: 'ai-worker-openrouter.js',
            workerModelId: 'qwen/qwen3.5-flash-02-23',
            keyStorageKey: 'md-viewer-openrouter-key',
            dialogTitle: 'Connect to OpenRouter',
            dialogDesc: 'Enter your API key to use <strong>Qwen 3.5 Flash</strong> via OpenRouter',
            dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://openrouter.ai/keys',
            dialogLinkText: 'openrouter.ai/keys',
            dialogIcon: 'bi bi-wind',
            dropdownName: 'Qwen 3.5 Flash',
            dropdownDesc: 'Alibaba · via OpenRouter',
        },

        // ── Cloud: Qwen 3.5 35B-A3B via OpenRouter ────────────
        'openrouter-qwen-35b': {
            label: 'Qwen 3.5 35B · Alibaba',
            badge: 'Qwen 3.5 35B · Alibaba',
            icon: 'bi bi-wind',
            statusReady: 'Qwen 3.5 35B-A3B · Alibaba via OpenRouter',
            workerFile: 'ai-worker-openrouter.js',
            workerModelId: 'qwen/qwen3.5-35b-a3b',
            keyStorageKey: 'md-viewer-openrouter-key',
            dialogTitle: 'Connect to OpenRouter',
            dialogDesc: 'Enter your API key to use <strong>Qwen 3.5 35B</strong> via OpenRouter',
            dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://openrouter.ai/keys',
            dialogLinkText: 'openrouter.ai/keys',
            dialogIcon: 'bi bi-wind',
            dropdownName: 'Qwen 3.5 35B-A3B',
            dropdownDesc: 'Alibaba · via OpenRouter',
        },

        // ── Cloud: DeepSeek V3.2 via OpenRouter ───────────────
        'openrouter-deepseek': {
            label: 'DeepSeek V3.2 · DeepSeek',
            badge: 'DeepSeek V3.2 · DeepSeek',
            icon: 'bi bi-search',
            statusReady: 'DeepSeek V3.2 · DeepSeek via OpenRouter',
            workerFile: 'ai-worker-openrouter.js',
            workerModelId: 'deepseek/deepseek-v3.2',
            keyStorageKey: 'md-viewer-openrouter-key',
            dialogTitle: 'Connect to OpenRouter',
            dialogDesc: 'Enter your API key to use <strong>DeepSeek V3.2</strong> via OpenRouter',
            dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://openrouter.ai/keys',
            dialogLinkText: 'openrouter.ai/keys',
            dialogIcon: 'bi bi-search',
            dropdownName: 'DeepSeek V3.2',
            dropdownDesc: 'DeepSeek · via OpenRouter',
        },
    };
})();
