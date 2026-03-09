// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Startup Sequencing / Race-Condition Tests
 *
 * Verifies that key actions work *immediately* once the editor is visible
 * and the relevant function is defined, without extra sleeps.
 * Many existing tests use waitForTimeout(5000); these tests prove that
 * critical features are available much sooner.
 */

test.describe('Startup Sequencing', () => {
    test('share button works immediately after editor visible', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.shareMarkdown);

        // Fill content so share doesn't warn about empty editor
        await page.locator('#markdown-editor').fill('# Quick Start\n\nContent.');

        // Click share right away — no extra sleep
        await page.evaluate(() => window.MDView.shareMarkdown());

        const shareModal = page.locator('#share-options-modal');
        await expect(shareModal).toHaveClass(/active/, { timeout: 3000 });
    });

    test('template modal opens immediately after editor visible', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && typeof window.MDView.openTemplateModal === 'function');

        // Open template modal right away
        await page.evaluate(() => window.MDView.openTemplateModal());

        const modal = page.locator('#template-modal');
        await expect(modal).toBeVisible({ timeout: 3000 });
    });

    test('export buttons are accessible immediately', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.setViewMode);

        // Click export dropdown right away
        const exportDropdown = page.locator('#exportDropdown');
        await exportDropdown.click();
        await page.waitForTimeout(200);

        // Export buttons should be visible and enabled
        const exportMd = page.locator('#export-md');
        const exportHtml = page.locator('#export-html');
        await expect(exportMd).toBeVisible();
        await expect(exportHtml).toBeVisible();
        await expect(exportMd).toBeEnabled();
        await expect(exportHtml).toBeEnabled();
    });

    test('AI panel opens immediately after openAiPanel is defined', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(
            () => window.MDView && typeof window.MDView.openAiPanel === 'function',
            { timeout: 15000 }
        );

        // Click AI toggle right away
        await page.locator('#ai-toggle-button').click();
        await page.waitForTimeout(300);

        const panelOpen = await page.evaluate(() => window.MDView.aiPanelOpen);
        expect(panelOpen).toBe(true);
    });

    test('no pageerror containing "M is not defined" during load', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');

        // Wait a reasonable time for all modules to load
        await page.waitForTimeout(3000);

        const mErrors = errors.filter(msg => /M is not defined/i.test(msg));
        expect(mErrors).toEqual([]);
    });
});
