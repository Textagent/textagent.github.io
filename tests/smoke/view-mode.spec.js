// @ts-check
import { test, expect } from '@playwright/test';

test.describe('View Mode Switching', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        // Wait for full app initialization (app-init.js calls setViewMode('split') at the end)
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
    });

    test('default view mode is split', async ({ page }) => {
        // Both editor and preview panes should be visible in split mode
        const editorPane = page.locator('.editor-pane');
        const previewPane = page.locator('.preview-pane');

        await expect(editorPane).toBeVisible();
        await expect(previewPane).toBeVisible();

        // The content container should have view-split class
        await expect(page.locator('.content-container')).toHaveClass(/view-split/);
    });

    test('switching to editor-only mode hides preview', async ({ page }) => {
        // Use JavaScript to call setViewMode directly (avoids viewport-dependent button visibility)
        await page.evaluate(() => window.MDView.setViewMode('editor'));
        await page.waitForTimeout(300);

        // The content container should have the editor-only class
        await expect(page.locator('.content-container')).toHaveClass(/view-editor-only/);

        // Preview pane should be hidden via CSS display:none
        const previewDisplay = await page.locator('.preview-pane').evaluate((el) => {
            return window.getComputedStyle(el).display;
        });
        expect(previewDisplay).toBe('none');
    });

    test('switching to preview-only mode hides editor', async ({ page }) => {
        await page.evaluate(() => window.MDView.setViewMode('preview'));
        await page.waitForTimeout(300);

        await expect(page.locator('.content-container')).toHaveClass(/view-preview-only/);

        const editorDisplay = await page.locator('.editor-pane').evaluate((el) => {
            return window.getComputedStyle(el).display;
        });
        expect(editorDisplay).toBe('none');
    });

    test('switching back to split mode shows both panes', async ({ page }) => {
        // Go to editor-only first
        await page.evaluate(() => window.MDView.setViewMode('editor'));
        await page.waitForTimeout(200);
        await expect(page.locator('.content-container')).toHaveClass(/view-editor-only/);

        // Switch back to split
        await page.evaluate(() => window.MDView.setViewMode('split'));
        await page.waitForTimeout(200);

        await expect(page.locator('.content-container')).toHaveClass(/view-split/);
        await expect(page.locator('.editor-pane')).toBeVisible();
        await expect(page.locator('.preview-pane')).toBeVisible();
    });

    test('typed content renders in preview', async ({ page }) => {
        const testMarkdown = '# Hello World\n\nThis is a **test**.';
        await page.locator('#markdown-editor').fill(testMarkdown);

        // Wait for debounced render (RENDER_DELAY is 300ms)
        await page.waitForTimeout(500);

        const previewHtml = await page.locator('#markdown-preview').innerHTML();
        expect(previewHtml).toContain('Hello World');
        expect(previewHtml).toContain('<strong>test</strong>');
    });
});
