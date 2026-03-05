import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    publicDir: 'public',

    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(__dirname, 'index.html'),
            output: {
                manualChunks: {
                    core: ['marked', 'dompurify', 'highlight.js', 'bootstrap', 'pako', 'emoji-toolkit'],
                    mermaid: ['mermaid'],
                    math: ['mathjs'],
                    export: ['html2pdf.js', 'jspdf', 'html2canvas', 'file-saver'],
                    converters: ['mammoth', 'turndown', 'xlsx'],
                },
            },
        },
    },

    server: {
        port: 8877,
        open: true,
    },

    preview: {
        port: 4173,
    },
});
