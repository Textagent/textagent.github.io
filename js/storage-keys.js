// ============================================
// storage-keys.js — Single source of truth for all localStorage key strings
// ============================================
(function () {
    'use strict';

    var M = window.MDView = window.MDView || {};

    M.KEYS = {
        // --- App Theme ---
        THEME: 'markdown-viewer-theme',
        PREVIEW_THEME: 'md-viewer-preview-theme',

        // --- Auto-Save ---
        AUTOSAVE: 'md-viewer-autosave',
        AUTOSAVE_TIME: 'md-viewer-autosave-time',

        // --- Cloud Sync ---
        CLOUD_DOC_ID: 'md-viewer-cloud-doc-id',
        CLOUD_ENC_KEY: 'md-viewer-cloud-enc-key',
        CLOUD_WRITE_TOKEN: 'md-viewer-cloud-write-token',

        // --- Workspace ---
        WORKSPACE: 'mdview-workspace',
        FILE_PREFIX: 'mdview-file-',
        SIDEBAR_OPEN: 'mdview-sidebar-open',

        // --- Editor ---
        WORD_WRAP: 'md-viewer-word-wrap',
        STATS_OPEN: 'mdview-stats-open',

        // --- AI Assistant ---
        AI_MODEL: 'md-viewer-ai-model',
        AI_PANEL_WIDTH: 'md-viewer-ai-panel-width',
        AI_CONSENTED: 'md-viewer-ai-consented',
        AI_CONSENTED_PREFIX: 'md-viewer-ai-consented-',

        // --- API Keys (per AI/Search provider) ---
        API_KEY_GROQ: 'md-viewer-groq-key',
        API_KEY_GEMINI: 'md-viewer-gemini-key',
        API_KEY_OPENROUTER: 'md-viewer-openrouter-key',
        API_KEY_BRAVE: 'md-viewer-brave-api-key',
        API_KEY_SERPER: 'md-viewer-serper-api-key',
        API_KEY_TAVILY: 'md-viewer-tavily-api-key',
        API_KEY_GOOGLE_CSE: 'md-viewer-google-cse-key',
        API_KEY_HF: 'md-viewer-hf-key',

        // --- Speech ---
        SPEECH_LANG: 'mdview-speech-lang',
        STT_CONSENTED: 'mdview-stt-consented',

        // --- Web Search ---
        SEARCH_ENABLED: 'md-viewer-search-enabled',
        SEARCH_PROVIDER: 'md-viewer-search-provider',

        // --- Email to Self ---
        EMAIL_SELF: 'textagent-email-self',

        // --- Disk Workspace ---
        DISK_MODE: 'textagent-disk-mode',

        // --- Context Memory ---
        MEMORY_DB: 'textagent-memory-db',

        // --- Agent Execution (Cloud) ---
        GITHUB_TOKEN: 'textagent-github-token',
        GITHUB_USER: 'textagent-github-user',
        AGENT_PROVIDER: 'textagent-agent-provider',
        AGENT_CODESPACE_ID: 'textagent-agent-codespace',
        AGENT_CUSTOM_URL: 'textagent-agent-custom-url',
    };
})();
