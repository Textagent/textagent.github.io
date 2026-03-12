#!/usr/bin/env node
/**
 * Bundle just-bash for browser use.
 * Stubs out all node:* built-ins with empty/noop modules
 * so the bundle can run in a browser without errors.
 */
import * as esbuild from 'esbuild';

// Plugin to replace node: built-ins with browser-safe stubs
const nodeStubPlugin = {
    name: 'node-stub',
    setup(build) {
        // Match all node: imports
        build.onResolve({ filter: /^node:/ }, args => ({
            path: args.path,
            namespace: 'node-stub'
        }));

        // Return a stub module for each
        build.onLoad({ filter: /.*/, namespace: 'node-stub' }, args => {
            const mod = args.path.replace('node:', '');

            // zlib needs .constants and gunzipSync/gzipSync stubs
            if (mod === 'zlib') {
                return {
                    contents: `
                        export const constants = {};
                        export function gunzipSync(buf) { return buf; }
                        export function gzipSync(buf) { return buf; }
                        export function deflateSync(buf) { return buf; }
                        export function inflateSync(buf) { return buf; }
                        export default { constants, gunzipSync, gzipSync, deflateSync, inflateSync };
                    `,
                    loader: 'js'
                };
            }

            // dns - used by turndown or other deps
            if (mod === 'dns') {
                return {
                    contents: `
                        export function resolve() {}
                        export function lookup(h, cb) { if (cb) cb(null, '127.0.0.1', 4); }
                        export const promises = { resolve: async () => ({}) };
                        export default { resolve, lookup, promises };
                    `,
                    loader: 'js'
                };
            }

            // Generic stub for all other node: modules
            return {
                contents: `export default {}; export const __esModule = true;`,
                loader: 'js'
            };
        });
    }
};

// Create a process shim file for injection
import { writeFileSync, unlinkSync } from 'node:fs';
const processShimPath = 'js/vendor/_process-shim.mjs';
writeFileSync(processShimPath, `
export var process = globalThis.process || {
    env: { NODE_ENV: 'production' },
    cwd: () => '/',
    chdir: () => {},
    platform: 'browser',
    arch: 'wasm',
    version: 'v0.0.0',
    versions: {},
    stdout: { write: () => {}, isTTY: false },
    stderr: { write: () => {}, isTTY: false },
    stdin: { isTTY: false },
    argv: [],
    pid: 1,
    exit: () => {},
    on: () => {},
    off: () => {},
    nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0),
    umask: () => 0,
    hrtime: () => [0, 0],
};
if (!globalThis.process) globalThis.process = process;
`);

await esbuild.build({
    entryPoints: ['node_modules/just-bash/dist/bundle/browser.js'],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    outfile: 'js/vendor/just-bash.browser.js',
    minify: true,
    mainFields: ['browser', 'module', 'main'],
    plugins: [nodeStubPlugin],
    inject: [processShimPath],
    define: {
        'process.env.NODE_ENV': '"production"',
    },
    logLevel: 'info',
});

// Clean up temp shim file
unlinkSync(processShimPath);

console.log('✅ just-bash browser bundle created successfully');
