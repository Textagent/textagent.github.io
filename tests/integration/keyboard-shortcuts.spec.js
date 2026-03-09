// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
    });

    test('Ctrl+S triggers MD export download', async ({ page }) => {
        await page.locator('#markdown-editor').fill('# Shortcut Test');
        await page.waitForTimeout(300);

        const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
        await page.locator('#markdown-editor').press('Control+s');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.md$/);
    });

    test('Ctrl+F opens find bar when editor is focused', async ({ page }) => {
        await page.locator('#markdown-editor').click();
        await page.locator('#markdown-editor').press('Control+f');
        await page.waitForTimeout(300);

        const findBar = page.locator('#find-replace-bar');
        await expect(findBar).toBeVisible();
    });

    test('Escape closes overlays', async ({ page }) => {
        // Open find bar first
        await page.waitForFunction(() => window.MDView && window.MDView.openFindBar);
        await page.evaluate(() => window.MDView.openFindBar());
        await expect(page.locator('#find-replace-bar')).toBeVisible();

        // Press Escape to close
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);

        // Find bar should be closed (or hidden)
        const display = await page.locator('#find-replace-bar').evaluate(el => el.style.display);
        expect(display).toBe('none');
    });
});
