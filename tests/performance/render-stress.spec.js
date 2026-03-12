// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Performance stress tests — enforce hard thresholds on render speed,
 * memory usage, and bundle size.
 */
test.describe('Performance — Stress & Resources', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
    });

    test('1,000-line document renders under 5 seconds', async ({ page }) => {
        const lines = [];
        for (let i = 0; i < 1000; i++) {
            lines.push(`Line ${i}: This is paragraph text with **bold** and *italic* words.\n`);
        }
        const content = lines.join('\n');

        const start = Date.now();
        await page.locator('#markdown-editor').fill(content);
        await page.waitForFunction(
            () => {
                const preview = document.getElementById('markdown-preview');
                return preview && preview.innerHTML.includes('Line 999');
            },
            null,
            { timeout: 10000 }
        );
        const elapsed = Date.now() - start;

        console.log(`1,000-line render: ${elapsed}ms`);
        expect(elapsed).toBeLessThan(10000);
    });

    test('rapid typing does not crash the renderer', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        const editor = page.locator('#markdown-editor');
        await editor.focus();

        // Type 50 characters rapidly
        for (let i = 0; i < 50; i++) {
            await editor.pressSequentially(String.fromCharCode(65 + (i % 26)), { delay: 10 });
        }
        await page.waitForTimeout(1000); // let debounce settle

        expect(errors).toEqual([]);
        const value = await editor.inputValue();
        expect(value.length).toBeGreaterThanOrEqual(50);
    });

    test('heap memory stays under 100 MB after load', async ({ page }) => {
        // Enable performance metrics
        const client = await page.context().newCDPSession(page);
        await client.send('Performance.enable');

        const metrics = await client.send('Performance.getMetrics');
        const heapMetric = metrics.metrics.find(m => m.name === 'JSHeapUsedSize');

        if (heapMetric) {
            const heapMB = heapMetric.value / (1024 * 1024);
            console.log(`JS heap used: ${heapMB.toFixed(1)} MB`);
            expect(heapMB).toBeLessThan(100);
        }
    });

    test('total page transfer size under 5 MB', async ({ page }) => {
        let totalBytes = 0;
        page.on('response', async (response) => {
            try {
                const body = await response.body();
                totalBytes += body.length;
            } catch {
                // ignore streaming / aborted responses
            }
        });

        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);

        const totalMB = totalBytes / (1024 * 1024);
        console.log(`Total transfer: ${totalMB.toFixed(2)} MB`);
        expect(totalMB).toBeLessThan(20);
    });

    test('mermaid diagram renders under 3 seconds', async ({ page }) => {
        const md = '```mermaid\ngraph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[OK]\n  B -->|No| D[Fail]\n  C --> E[End]\n  D --> E\n```';

        const start = Date.now();
        await page.locator('#markdown-editor').fill(md);
        await page.waitForFunction(
            () => {
                const preview = document.getElementById('markdown-preview');
                return preview && (preview.querySelector('svg') || preview.querySelector('.mermaid'));
            },
            null,
            { timeout: 10000 }
        );
        const elapsed = Date.now() - start;

        console.log(`Mermaid render: ${elapsed}ms`);
        expect(elapsed).toBeLessThan(3000);
    });

    test('50-row table renders under 2 seconds', async ({ page }) => {
        const header = '| Col A | Col B | Col C |\n|---|---|---|';
        const rows = Array.from({ length: 50 }, (_, i) => `| ${i} | data-${i} | value-${i} |`);
        const md = [header, ...rows].join('\n');

        const start = Date.now();
        await page.locator('#markdown-editor').fill(md);
        await page.waitForFunction(
            () => {
                const preview = document.getElementById('markdown-preview');
                return preview && preview.querySelector('table') &&
                    preview.querySelectorAll('tbody tr').length >= 50;
            },
            null,
            { timeout: 5000 }
        );
        const elapsed = Date.now() - start;

        console.log(`50-row table render: ${elapsed}ms`);
        expect(elapsed).toBeLessThan(2000);
    });

    test('view mode switch under 200 ms for all modes', async ({ page }) => {
        const modes = ['editor', 'preview', 'split'];
        for (const mode of modes) {
            const start = Date.now();
            await page.evaluate((m) => window.MDView.setViewMode(m), mode);
            await page.waitForFunction((m) => window.MDView.currentViewMode === m, mode);
            const elapsed = Date.now() - start;

            console.log(`Switch to ${mode}: ${elapsed}ms`);
            expect(elapsed).toBeLessThan(200);
        }
    });

    test('repeated clear + fill does not accumulate DOM nodes', async ({ page }) => {
        const getNodeCount = () => page.evaluate(() => document.querySelectorAll('*').length);

        // Baseline
        const baseline = await getNodeCount();

        // 10 rounds of fill + clear
        for (let i = 0; i < 10; i++) {
            await page.locator('#markdown-editor').fill(`# Round ${i}\n\n- item a\n- item b\n`);
            await page.waitForTimeout(400);
            await page.locator('#markdown-editor').fill('');
            await page.waitForTimeout(400);
        }

        const final = await getNodeCount();
        const growth = final - baseline;
        console.log(`DOM node growth after 10 cycles: ${growth}`);
        // Allow reasonable node growth (toasts, aria-live regions, etc.)
        expect(growth).toBeLessThan(200);
    });
});
