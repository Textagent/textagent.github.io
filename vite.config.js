import { defineConfig } from 'vite';
import { resolve } from 'path';
import agentRunnerPlugin from './vite-plugin-agent-runner.js';

export default defineConfig({
    root: '.',
    publicDir: 'public',

    plugins: [
        agentRunnerPlugin()
    ],

    build: {
        outDir: 'dist',
        emptyOutDir: true,
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
