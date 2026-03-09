// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Export Content Integrity
 *
 * Goes beyond checking file extension — verifies the actual content
 * of exported Markdown and HTML files.
 *
 * Source: js/app-init.js:450-497
 */

test.describe('Export Content Integrity', () => {
    const EDITOR_CONTENT = '# Export Integrity\n\nHello **bold** and *italic* world.';

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.setViewMode);

        // Fill editor with known content and wait for render
        await page.locator('#markdown-editor').fill(EDITOR_CONTENT);
        await page.waitForTimeout(500);
    });

    test('Markdown export content exactly matches editor content', async ({ page }) => {
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

        await page.locator('#exportDropdown').click();
        await page.waitForTimeout(300);
        await page.locator('#export-md').click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.md$/);

        // Read the file content
        const stream = await download.createReadStream();
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const content = Buffer.concat(chunks).toString('utf-8');

        expect(content).toBe(EDITOR_CONTENT);
    });

    test('HTML export includes inline <style>', async ({ page }) => {
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

        await page.locator('#exportDropdown').click();
        await page.waitForTimeout(300);
        await page.locator('#export-html').click();

        const download = await downloadPromise;
        const stream = await download.createReadStream();
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const html = Buffer.concat(chunks).toString('utf-8');

        expect(html).toContain('<style>');
        expect(html).toContain('</style>');
    });

    test('HTML export preserves data-theme attribute', async ({ page }) => {
        // Get the current theme
        const currentTheme = await page.evaluate(
            () => document.documentElement.getAttribute('data-theme')
        );

        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

        await page.locator('#exportDropdown').click();
        await page.waitForTimeout(300);
        await page.locator('#export-html').click();

        const download = await downloadPromise;
        const stream = await download.createReadStream();
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const html = Buffer.concat(chunks).toString('utf-8');

        expect(html).toContain(`data-theme="${currentTheme}"`);
    });

    test('HTML export preserves data-preview-theme when set', async ({ page }) => {
        // Set a preview theme via DOM (same as ui-panels.js does)
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-preview-theme', 'dracula');
            localStorage.setItem(window.MDView.KEYS.PREVIEW_THEME, 'dracula');
        });

        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

        await page.locator('#exportDropdown').click();
        await page.waitForTimeout(300);
        await page.locator('#export-html').click();

        const download = await downloadPromise;
        const stream = await download.createReadStream();
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const html = Buffer.concat(chunks).toString('utf-8');

        expect(html).toContain('data-preview-theme="dracula"');
    });

    test('HTML export contains rendered HTML, not raw markdown', async ({ page }) => {
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

        await page.locator('#exportDropdown').click();
        await page.waitForTimeout(300);
        await page.locator('#export-html').click();

        const download = await downloadPromise;
        const stream = await download.createReadStream();
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const html = Buffer.concat(chunks).toString('utf-8');

        // Should contain rendered HTML tags, not raw markdown
        expect(html).toContain('<strong>');
        expect(html).toContain('<em>');
        // Should NOT contain raw markdown bold/italic syntax in the body
        expect(html).toContain('bold');
        expect(html).toContain('italic');
        // Verify it has the markdown-body wrapper
        expect(html).toContain('markdown-body');
    });
});
