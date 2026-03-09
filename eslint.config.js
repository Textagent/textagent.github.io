import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
    // Global ignores
    { ignores: ['node_modules/**', 'dist/**', 'public/**', 'desktop-app/**', 'changelogs/**', 'js/templates/**'] },

    // Source files in js/ — IIFE scripts (not ES modules)
    {
        files: ['js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                // Vendor globals set by src/vendor-globals.js
                marked: 'readonly',
                mermaid: 'readonly',
                DOMPurify: 'readonly',
                hljs: 'readonly',
                bootstrap: 'readonly',
                pako: 'readonly',
                joypixels: 'readonly',
                mammoth: 'readonly',
                TurndownService: 'readonly',
                XLSX: 'readonly',
                html2pdf: 'readonly',
                jspdf: 'readonly',
                html2canvas: 'readonly',
                saveAs: 'readonly',
                MathJax: 'readonly',
                nerdamer: 'readonly',
                pdfjsLib: 'readonly',
                math: 'readonly',
                mathjs: 'readonly',
                // Firebase (loaded via CDN)
                firebase: 'readonly',
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-console': 'off',
            'no-prototype-builtins': 'off',
            'no-useless-escape': 'warn',
            'no-empty': ['warn', { allowEmptyCatch: true }],
            'no-redeclare': 'warn',
            'no-throw-literal': 'off',
            'preserve-caught-error': 'off',
        },
    },

    // Web Worker files — scripts with self/importScripts globals
    {
        files: ['ai-worker*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.worker,
                model: 'writable',
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-console': 'off',
            'no-redeclare': 'warn',
        },
    },

    // ES module files (src/, config files)
    {
        files: ['src/**/*.js', 'vite.config.js', 'eslint.config.js', 'playwright.config.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        },
    },

    // Test files — ES modules with Playwright globals
    {
        files: ['tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        },
    },

    // Disable all formatting rules (handled by Prettier)
    prettier,
];
