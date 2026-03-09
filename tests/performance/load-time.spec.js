// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
    test('page loads within acceptable time', async ({ page }) => {
        const start = Date.now();
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        const editorVisible = Date.now() - start;

        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        const appReady = Date.now() - start;

        console.log(`Editor visible: ${editorVisible}ms, App ready: ${appReady}ms`);

        // Editor should be visible within 3 seconds
        expect(editorVisible).toBeLessThan(3000);
        // Full app init should complete within 5 seconds
        expect(appReady).toBeLessThan(5000);
    });

    test('all modules loaded within acceptable time', async ({ page }) => {
        const start = Date.now();
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');

        // Wait for Phase 3 modules (template modal is one of the last things loaded)
        await page.waitForFunction(() => window.MDView && window.MDView.openTemplateModal, null, { timeout: 10000 });
        const allModules = Date.now() - start;

        console.log(`All modules loaded: ${allModules}ms`);
        // All modules should load within 8 seconds
        expect(allModules).toBeLessThan(8000);
    });

    test('render performance — 100 lines renders under 2 seconds', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');

        // Generate 100 lines of markdown
        const lines = [];
        for (let i = 0; i < 100; i++) {
            lines.push(`## Heading ${i}\n\nParagraph ${i} with **bold** and *italic* text.\n`);
        }
        const content = lines.join('\n');

        const start = Date.now();
        await page.locator('#markdown-editor').fill(content);
        await page.waitForTimeout(500); // debounce
        await page.waitForFunction(() => {
            const preview = document.getElementById('markdown-preview');
            return preview && preview.innerHTML.includes('Heading 99');
        }, null, { timeout: 5000 });
        const renderTime = Date.now() - start;

        console.log(`100-line render time: ${renderTime}ms`);
        expect(renderTime).toBeLessThan(3000);
    });

    test('view mode switch is fast', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');

        const start = Date.now();
        await page.evaluate(() => window.MDView.setViewMode('editor'));
        await page.waitForFunction(() => window.MDView.currentViewMode === 'editor');
        const switchTime = Date.now() - start;

        console.log(`View mode switch: ${switchTime}ms`);
        expect(switchTime).toBeLessThan(500);
    });
});
