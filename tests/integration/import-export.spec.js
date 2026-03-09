// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Import → Edit → Export Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
    });

    test('import MD → verify render → export MD', async ({ page }) => {
        const content = '# Integration Test\n\nParagraph with **bold**.';
        await page.evaluate((c) => {
            const file = new File([c], 'test.md', { type: 'text/markdown' });
            window.MDView.importFile(file);
        }, content);

        await page.waitForFunction(() => {
            const ed = document.getElementById('markdown-editor');
            return ed && ed.value.includes('Integration Test');
        }, null, { timeout: 5000 });

        // Verify preview renders correctly
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).toContain('Integration Test');
        expect(html).toContain('<strong>bold</strong>');

        // Export and verify download
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        await page.locator('#exportDropdown').click();
        await page.waitForTimeout(300);
        await page.locator('#export-md').click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.md$/);
    });

    test('import CSV → verify table render', async ({ page }) => {
        const csv = 'Name,Score\nAlice,95\nBob,87';
        await page.evaluate((c) => {
            const file = new File([c], 'data.csv', { type: 'text/csv' });
            window.MDView.importFile(file);
        }, csv);

        await page.waitForFunction(() => {
            const ed = document.getElementById('markdown-editor');
            return ed && ed.value.includes('Name') && ed.value.includes('|');
        }, null, { timeout: 5000 });

        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).toContain('<table');
        expect(html).toContain('Alice');
        expect(html).toContain('95');
    });

    test('import HTML → verify markdown conversion', async ({ page }) => {
        const html = '<h1>HTML Import</h1><p>This is <strong>bold</strong>.</p>';
        await page.evaluate((c) => {
            const file = new File([c], 'page.html', { type: 'text/html' });
            window.MDView.importFile(file);
        }, html);

        await page.waitForFunction(() => {
            const ed = document.getElementById('markdown-editor');
            return ed && ed.value.includes('HTML Import');
        }, null, { timeout: 5000 });

        const editorValue = await page.locator('#markdown-editor').inputValue();
        expect(editorValue).toContain('HTML Import');
    });

    test('share flow → opens share modal', async ({ page }) => {
        await page.locator('#markdown-editor').fill('# Share Integration Test');
        await page.waitForTimeout(300);

        await page.waitForFunction(() => window.MDView && window.MDView.shareMarkdown);
        await page.evaluate(() => window.MDView.shareMarkdown());

        const modal = page.locator('#share-options-modal');
        await expect(modal).toHaveClass(/active/, { timeout: 3000 });
    });

    test('template load → renders in preview', async ({ page }) => {
        await page.waitForFunction(() => window.MDView && window.MDView.openTemplateModal);
        await page.evaluate(() => window.MDView.openTemplateModal());
        await page.waitForTimeout(500);

        // Click the first template card
        const firstCard = page.locator('.template-card').first();
        await firstCard.click();
        await page.waitForTimeout(500);

        // Verify editor has content and preview rendered
        const editorValue = await page.locator('#markdown-editor').inputValue();
        expect(editorValue.length).toBeGreaterThan(50);

        const previewHtml = await page.locator('#markdown-preview').innerHTML();
        expect(previewHtml.length).toBeGreaterThan(50);
    });
});
