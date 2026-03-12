// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Performance tests — module initialization timing,
 * complex render performance for new features.
 */
test.describe('Performance — Module Init & Complex Render', () => {
    test('TTS module loaded within 8s of page load', async ({ page }) => {
        const start = Date.now();
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.tts, null, { timeout: 8000 });
        const elapsed = Date.now() - start;

        console.log(`TTS module loaded: ${elapsed}ms`);
        expect(elapsed).toBeLessThan(8000);
    });

    test('STT module functions exist within 8s', async ({ page }) => {
        const start = Date.now();
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        // STT exposes stt object or at least the mic button exists
        await page.waitForFunction(
            () => document.getElementById('speech-to-text-btn') !== null,
            null,
            { timeout: 8000 }
        );
        const elapsed = Date.now() - start;

        console.log(`STT module loaded: ${elapsed}ms`);
        expect(elapsed).toBeLessThan(8000);
    });

    test('video player module functions exist within 5s', async ({ page }) => {
        const start = Date.now();
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(
            () => window.MDView && typeof window.MDView.isVideoUrl === 'function',
            null,
            { timeout: 5000 }
        );
        const elapsed = Date.now() - start;

        console.log(`Video player module loaded: ${elapsed}ms`);
        expect(elapsed).toBeLessThan(5000);
    });

    test('stock widget module loaded within 5s', async ({ page }) => {
        const start = Date.now();
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(
            () => window.MDView && typeof window.MDView.renderStockWidgets === 'function',
            null,
            { timeout: 5000 }
        );
        const elapsed = Date.now() - start;

        console.log(`Stock widget module loaded: ${elapsed}ms`);
        expect(elapsed).toBeLessThan(5000);
    });

    test('file converter module loaded within 5s', async ({ page }) => {
        const start = Date.now();
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(
            () => window.MDView && typeof window.MDView.importFile === 'function',
            null,
            { timeout: 5000 }
        );
        const elapsed = Date.now() - start;

        console.log(`File converter module loaded: ${elapsed}ms`);
        expect(elapsed).toBeLessThan(5000);
    });

    test('complex markdown (headings + code + table + mermaid) renders under 5s', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');

        const complexMd = [
            '# Complex Document',
            '',
            '## Section 1: Code',
            '```javascript',
            'function hello() { console.log("world"); }',
            '```',
            '',
            '## Section 2: Table',
            '| Name | Score | Grade |',
            '|------|-------|-------|',
            ...Array.from({ length: 20 }, (_, i) => `| Student ${i} | ${90 - i} | ${i < 5 ? 'A' : 'B'} |`),
            '',
            '## Section 3: Mermaid',
            '```mermaid',
            'graph TD',
            '  A[Start] --> B{Check}',
            '  B -->|Yes| C[Process]',
            '  B -->|No| D[Skip]',
            '  C --> E[End]',
            '  D --> E',
            '```',
            '',
            '## Section 4: Math',
            '```math',
            '42 * 7 + 3',
            '```',
            '',
            '## Section 5: Lists',
            ...Array.from({ length: 20 }, (_, i) => `- Item ${i} with **bold** and *italic*`),
        ].join('\n');

        const start = Date.now();
        await page.locator('#markdown-editor').fill(complexMd);
        await page.waitForFunction(
            () => {
                const preview = document.getElementById('markdown-preview');
                return preview && preview.innerHTML.includes('Complex Document') &&
                    preview.querySelector('table') !== null;
            },
            null,
            { timeout: 10000 }
        );
        const elapsed = Date.now() - start;

        console.log(`Complex markdown render: ${elapsed}ms`);
        expect(elapsed).toBeLessThan(5000);
    });

    test('embed grid render performance under 3s', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');

        const embedMd = [
            '```embed cols=2 height=200',
            'https://github.com "GitHub"',
            'https://stackoverflow.com "Stack Overflow"',
            'https://developer.mozilla.org "MDN"',
            'https://nodejs.org "Node.js"',
            '```',
        ].join('\n');

        const start = Date.now();
        await page.locator('#markdown-editor').fill(embedMd);
        await page.waitForFunction(
            () => {
                const preview = document.getElementById('markdown-preview');
                return preview && preview.querySelector('.embed-grid') !== null;
            },
            null,
            { timeout: 5000 }
        );
        const elapsed = Date.now() - start;

        console.log(`Embed grid render: ${elapsed}ms`);
        expect(elapsed).toBeLessThan(3000);
    });
});
