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
        // ── Local: Qwen 3.5 Small (0.8B) ─────────────────────
        'qwen-local': {
            label: 'Qwen 3.5 · Local',
            badge: 'Qwen 3.5 · Local',
            icon: 'bi bi-pc-display',
            statusReady: 'Qwen 3.5 · Local',
            dropdownName: 'Qwen 3.5 Small (0.8B)',
            dropdownDesc: 'Local · Private · ~500 MB download',
            isLocal: true,
            localModelId: 'onnx-community/Qwen3.5-0.8B-ONNX',
            downloadSize: '~500 MB',
        },

        // ── Local: Qwen 3.5 Medium (2B) ──────────────────────
        'qwen-local-2b': {
            label: 'Qwen 3.5 2B · Local',
            badge: 'Qwen 3.5 2B · Local',
            icon: 'bi bi-pc-display',
            statusReady: 'Qwen 3.5 2B · Local',
            dropdownName: 'Qwen 3.5 Medium (2B)',
            dropdownDesc: 'Local · Smarter · ~1.2 GB download',
            isLocal: true,
            localModelId: 'onnx-community/Qwen3.5-2B-ONNX',
            downloadSize: '~1.2 GB',
        },

        // ── Local: Qwen 3.5 Large (4B) ───────────────────────
        'qwen-local-4b': {
            label: 'Qwen 3.5 4B · Local',
            badge: 'Qwen 3.5 4B · Local',
            icon: 'bi bi-pc-display',
            statusReady: 'Qwen 3.5 4B · Local',
            dropdownName: 'Qwen 3.5 Large (4B)',
            dropdownDesc: 'Local · Best quality · ~2.5 GB · High-end',
            isLocal: true,
            localModelId: 'onnx-community/Qwen3.5-4B-ONNX',
            downloadSize: '~2.5 GB',
            requiresHighEnd: true,
        },

        // ── Local: Qwen 3 4B Thinking ────────────────────────
        'qwen3-thinking-4b': {
            label: 'Qwen 3 Thinking · Local',
            badge: 'Qwen 3 Thinking · Local',
            icon: 'bi bi-lightbulb',
            statusReady: 'Qwen 3 4B Thinking · Local',
            dropdownName: 'Qwen 3 Thinking (4B)',
            dropdownDesc: 'Local · Chain-of-thought · ~2.5 GB · High-end',
            isLocal: true,
            localModelId: 'onnx-community/Qwen3-4B-Thinking-2507-ONNX',
            downloadSize: '~2.5 GB',
            requiresHighEnd: true,
            architecture: 'qwen3',
            dtype: 'q4f16',
        },

        // ── Cloud: Groq ────────────────────────────────────────
        'groq-llama': {
            label: 'Llama 3.3 · Groq',
            badge: 'Llama 3.3 · Groq',
            icon: 'bi bi-cloud',
            statusReady: 'Llama 3.3 70B · Groq Cloud',
            workerFile: 'ai-worker-groq.js',
            keyStorageKey: window.MDView.KEYS.API_KEY_GROQ,
            dialogTitle: 'Connect to Groq',
            dialogDesc: 'Enter your free API key to use <strong>Llama 3.3 70B</strong>',
            dialogPlaceholder: 'gsk_xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://console.groq.com/keys',
            dialogLinkText: 'console.groq.com/keys',
            dialogIcon: 'bi bi-cloud',
            dropdownName: 'Llama 3.3 70B',
            dropdownDesc: 'Groq Cloud · Fast · Free tier',
            supportsVision: true,
        },

        // ── Cloud: Google Gemini ───────────────────────────────
        'gemini-flash': {
            label: 'Gemini 3.1 · Google',
            badge: 'Gemini 3.1 · Google',
            icon: 'bi bi-google',
            statusReady: 'Gemini 3.1 Flash Lite · Google',
            workerFile: 'ai-worker-gemini.js',
            keyStorageKey: window.MDView.KEYS.API_KEY_GEMINI,
            dialogTitle: 'Connect to Gemini',
            dialogDesc: 'Enter your free API key to use <strong>Gemini 3.1 Flash Lite</strong>',
            dialogPlaceholder: 'AIzaSy_xxxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://aistudio.google.com/apikey',
            dialogLinkText: 'aistudio.google.com/apikey',
            dialogIcon: 'bi bi-google',
            dropdownName: 'Gemini 3.1 Flash Lite',
            dropdownDesc: 'Google · Fast · Free tier',
            supportsVision: true,
        },

        // ── Cloud: Google Imagen 4 Ultra (Image Generation) ───
        'imagen-ultra': {
            label: 'Imagen 4 Ultra · Google',
            badge: 'Imagen 4 Ultra',
            icon: 'bi bi-image',
            isImageModel: true,
            statusReady: 'Imagen 4 Ultra · Google',
            workerFile: 'ai-worker-imagen.js',
            keyStorageKey: window.MDView.KEYS.API_KEY_GEMINI,
            dialogTitle: 'Connect to Gemini (for Imagen)',
            dialogDesc: 'Enter your Gemini API key to use <strong>Imagen 4 Ultra</strong> image generation',
            dialogPlaceholder: 'AIzaSy_xxxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://aistudio.google.com/apikey',
            dialogLinkText: 'aistudio.google.com/apikey',
            dialogIcon: 'bi bi-image',
            dropdownName: 'Imagen 4 Ultra',
            dropdownDesc: 'Google · Image Generation · 25/day free',
        },

        // ── Cloud: Nano Banana 2 (Gemini 3.1 Flash Image) ─────
        'nano-banana-2': {
            label: 'Nano Banana 2 · Google',
            badge: 'Nano Banana 2',
            icon: 'bi bi-palette',
            isImageModel: true,
            statusReady: 'Nano Banana 2 · Gemini 3.1 Flash Image',
            workerFile: 'ai-worker-gemini-image.js',
            workerModelId: 'gemini-3.1-flash-image-preview',
            keyStorageKey: window.MDView.KEYS.API_KEY_GEMINI,
            dialogTitle: 'Connect to Gemini (for Image Gen)',
            dialogDesc: 'Enter your Gemini API key to use <strong>Nano Banana 2</strong> native image generation',
            dialogPlaceholder: 'AIzaSy_xxxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://aistudio.google.com/apikey',
            dialogLinkText: 'aistudio.google.com/apikey',
            dialogIcon: 'bi bi-palette',
            dropdownName: 'Nano Banana 2',
            dropdownDesc: 'Gemini 3.1 Flash Image · Google',
        },

        // ── Cloud: Grok 4.1 Fast via OpenRouter ───────────────
        'openrouter-grok': {
            label: 'Grok 4.1 Fast · xAI',
            badge: 'Grok 4.1 Fast · xAI',
            icon: 'bi bi-lightning-charge',
            statusReady: 'Grok 4.1 Fast · xAI via OpenRouter',
            workerFile: 'ai-worker-openrouter.js',
            workerModelId: 'x-ai/grok-4.1-fast',         // override model in worker
            keyStorageKey: window.MDView.KEYS.API_KEY_OPENROUTER,     // shares same key
            dialogTitle: 'Connect to OpenRouter',
            dialogDesc: 'Enter your API key to use <strong>Grok 4.1 Fast</strong> via OpenRouter',
            dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://openrouter.ai/keys',
            dialogLinkText: 'openrouter.ai/keys',
            dialogIcon: 'bi bi-lightning-charge',
            dropdownName: 'Grok 4.1 Fast',
            dropdownDesc: 'xAI · via OpenRouter',
            supportsVision: true,
        },

        // ── Cloud: Trinity Large via OpenRouter ────────────────
        'openrouter-trinity': {
            label: 'Trinity Large · Arcee',
            badge: 'Trinity Large · Arcee',
            icon: 'bi bi-stars',
            statusReady: 'Trinity Large · Arcee AI via OpenRouter',
            workerFile: 'ai-worker-openrouter.js',
            workerModelId: 'arcee-ai/trinity-large-preview:free',
            keyStorageKey: window.MDView.KEYS.API_KEY_OPENROUTER,     // shares same key
            dialogTitle: 'Connect to OpenRouter',
            dialogDesc: 'Enter your API key to use <strong>Trinity Large</strong> via OpenRouter',
            dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://openrouter.ai/keys',
            dialogLinkText: 'openrouter.ai/keys',
            dialogIcon: 'bi bi-stars',
            dropdownName: 'Trinity Large',
            dropdownDesc: 'Arcee AI · Free · via OpenRouter',
            supportsVision: true,
        },

        // ── Cloud: GPT-OSS 20B via OpenRouter ─────────────────
        'openrouter-gpt-oss': {
            label: 'GPT-OSS 20B · OpenAI',
            badge: 'GPT-OSS 20B · OpenAI',
            icon: 'bi bi-cpu',
            statusReady: 'GPT-OSS 20B · OpenAI via OpenRouter',
            workerFile: 'ai-worker-openrouter.js',
            workerModelId: 'openai/gpt-oss-20b',
            keyStorageKey: window.MDView.KEYS.API_KEY_OPENROUTER,
            dialogTitle: 'Connect to OpenRouter',
            dialogDesc: 'Enter your API key to use <strong>GPT-OSS 20B</strong> via OpenRouter',
            dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://openrouter.ai/keys',
            dialogLinkText: 'openrouter.ai/keys',
            dialogIcon: 'bi bi-cpu',
            dropdownName: 'GPT-OSS 20B',
            dropdownDesc: 'OpenAI · via OpenRouter',
            supportsVision: true,
        },

        // ── Cloud: Qwen 3.5 Flash via OpenRouter ──────────────
        'openrouter-qwen-flash': {
            label: 'Qwen 3.5 Flash · Alibaba',
            badge: 'Qwen 3.5 Flash · Alibaba',
            icon: 'bi bi-wind',
            statusReady: 'Qwen 3.5 Flash · Alibaba via OpenRouter',
            workerFile: 'ai-worker-openrouter.js',
            workerModelId: 'qwen/qwen3.5-flash-02-23',
            keyStorageKey: window.MDView.KEYS.API_KEY_OPENROUTER,
            dialogTitle: 'Connect to OpenRouter',
            dialogDesc: 'Enter your API key to use <strong>Qwen 3.5 Flash</strong> via OpenRouter',
            dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://openrouter.ai/keys',
            dialogLinkText: 'openrouter.ai/keys',
            dialogIcon: 'bi bi-wind',
            dropdownName: 'Qwen 3.5 Flash',
            dropdownDesc: 'Alibaba · via OpenRouter',
            supportsVision: true,
        },

        // ── Cloud: Qwen 3.5 35B-A3B via OpenRouter ────────────
        'openrouter-qwen-35b': {
            label: 'Qwen 3.5 35B · Alibaba',
            badge: 'Qwen 3.5 35B · Alibaba',
            icon: 'bi bi-wind',
            statusReady: 'Qwen 3.5 35B-A3B · Alibaba via OpenRouter',
            workerFile: 'ai-worker-openrouter.js',
            workerModelId: 'qwen/qwen3.5-35b-a3b',
            keyStorageKey: window.MDView.KEYS.API_KEY_OPENROUTER,
            dialogTitle: 'Connect to OpenRouter',
            dialogDesc: 'Enter your API key to use <strong>Qwen 3.5 35B</strong> via OpenRouter',
            dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://openrouter.ai/keys',
            dialogLinkText: 'openrouter.ai/keys',
            dialogIcon: 'bi bi-wind',
            dropdownName: 'Qwen 3.5 35B-A3B',
            dropdownDesc: 'Alibaba · via OpenRouter',
            supportsVision: true,
        },

        // ── Cloud: DeepSeek V3.2 via OpenRouter ───────────────
        'openrouter-deepseek': {
            label: 'DeepSeek V3.2 · DeepSeek',
            badge: 'DeepSeek V3.2 · DeepSeek',
            icon: 'bi bi-search',
            statusReady: 'DeepSeek V3.2 · DeepSeek via OpenRouter',
            workerFile: 'ai-worker-openrouter.js',
            workerModelId: 'deepseek/deepseek-v3.2',
            keyStorageKey: window.MDView.KEYS.API_KEY_OPENROUTER,
            dialogTitle: 'Connect to OpenRouter',
            dialogDesc: 'Enter your API key to use <strong>DeepSeek V3.2</strong> via OpenRouter',
            dialogPlaceholder: 'sk-or-xxxxxxxxxxxxxxxxxxxx',
            dialogLink: 'https://openrouter.ai/keys',
            dialogLinkText: 'openrouter.ai/keys',
            dialogIcon: 'bi bi-search',
            dropdownName: 'DeepSeek V3.2',
            dropdownDesc: 'DeepSeek · via OpenRouter',
            supportsVision: true,
        },

        // ── Local: Kokoro 82M TTS (Text-to-Speech) ────────────
        'kokoro-tts': {
            label: 'Kokoro TTS · Local',
            badge: 'Kokoro TTS · Local',
            icon: 'bi bi-volume-up',
            statusReady: 'Kokoro 82M TTS · Local',
            dropdownName: 'Kokoro TTS (82M)',
            dropdownDesc: 'Local · Text-to-Speech · English + Chinese + Web Speech fallback · ~80 MB',
            isLocal: true,
            isTtsModel: true,
            localModelId: 'onnx-community/Kokoro-82M-v1.1-zh-ONNX',
            downloadSize: '~80 MB',
        },

    };
})();
