// @ts-check
import { test, expect } from '@playwright/test';

test.describe('File Export', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.setViewMode);

        // Type content into the editor
        await page.locator('#markdown-editor').fill('# Export Test\n\nHello **world**.');
        // Wait for autosave / render
        await page.waitForTimeout(500);
    });

    test('exports markdown as .md file', async ({ page }) => {
        // Listen for the download event BEFORE clicking
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

        // Directly click the export button (it's a <button> inside a dropdown)
        // First open the dropdown
        await page.locator('#exportDropdown').click();
        await page.waitForTimeout(300);
        await page.locator('#export-md').click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.md$/);
    });

    test('exports HTML file', async ({ page }) => {
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

        await page.locator('#exportDropdown').click();
        await page.waitForTimeout(300);
        await page.locator('#export-html').click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.html$/);
    });
});
