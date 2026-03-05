import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    publicDir: 'public',

    build: {
        outDir: 'dist',
        emptyOutDir: true,
        // Produce a single JS chunk for simplicity
        rollupOptions: {
            input: resolve(__dirname, 'index.html'),
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
