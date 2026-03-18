// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Help Mode Tests
 *
 * Verifies the interactive Help Mode overlay:
 * toggling, popovers, keyboard shortcuts, and demo panel.
 */
test.describe('Help Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView && w.MDView.toggleHelpMode;
        }, { timeout: 15000 });
    });

    test('help button exists in the header', async ({ page }) => {
        const helpBtn = page.locator('#help-mode-btn');
        await expect(helpBtn).toBeVisible();
    });

    test('toggleHelpMode function is exposed on M', async ({ page }) => {
        const result = await page.evaluate(() => {
            return typeof /** @type {any} */ (window).MDView.toggleHelpMode;
        });
        expect(result).toBe('function');
    });

    test('clicking help button toggles help-mode-active on body', async ({ page }) => {
        const helpBtn = page.locator('#help-mode-btn');
        await helpBtn.click();
        await page.waitForTimeout(300);

        const hasClass = await page.evaluate(() =>
            document.body.classList.contains('help-mode-active')
        );
        expect(hasClass).toBe(true);

        // Click again to toggle off
        await helpBtn.click();
        await page.waitForTimeout(300);
        const hasClassAfter = await page.evaluate(() =>
            document.body.classList.contains('help-mode-active')
        );
        expect(hasClassAfter).toBe(false);
    });

    test('clicking a button in help mode shows popover', async ({ page }) => {
        // Enter help mode
        await page.locator('#help-mode-btn').click();
        await page.waitForTimeout(300);

        // Click the Bold button (should show help popover)
        const boldBtn = page.locator('[data-action="bold"]');
        await boldBtn.click();
        await page.waitForTimeout(500);

        const popover = page.locator('.help-popover');
        await expect(popover).toBeVisible();

        // Verify popover has title and description
        const title = popover.locator('.help-popover-title');
        await expect(title).toHaveText('Bold');
        const desc = popover.locator('.help-popover-desc');
        await expect(desc).toContainText('bold');
    });

    test('popover shows keyboard shortcut when available', async ({ page }) => {
        await page.locator('#help-mode-btn').click();
        await page.waitForTimeout(300);

        // Click Bold — has Ctrl+B shortcut
        await page.locator('[data-action="bold"]').click();
        await page.waitForTimeout(500);

        const shortcut = page.locator('.help-popover .help-popover-shortcut');
        await expect(shortcut).toBeVisible();
        await expect(shortcut).toContainText('Ctrl');
    });

    test('popover has Watch Demo button', async ({ page }) => {
        await page.locator('#help-mode-btn').click();
        await page.waitForTimeout(300);

        await page.locator('[data-action="bold"]').click();
        await page.waitForTimeout(500);

        const watchBtn = page.locator('.help-popover .help-popover-watch-demo');
        await expect(watchBtn).toBeVisible();
        await expect(watchBtn).toContainText('Watch Demo');
    });

    test('Escape key exits help mode', async ({ page }) => {
        await page.locator('#help-mode-btn').click();
        await page.waitForTimeout(300);

        // Verify help mode is on
        let isActive = await page.evaluate(() =>
            document.body.classList.contains('help-mode-active')
        );
        expect(isActive).toBe(true);

        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);

        isActive = await page.evaluate(() =>
            document.body.classList.contains('help-mode-active')
        );
        expect(isActive).toBe(false);
    });

    test('help mode intercepts button clicks (prevents default)', async ({ page }) => {
        // Clear editor first
        await page.locator('#markdown-editor').fill('');
        await page.waitForTimeout(200);

        // Enter help mode
        await page.locator('#help-mode-btn').click();
        await page.waitForTimeout(300);

        // Click Bold button in help mode — should NOT insert bold markers
        await page.locator('#markdown-editor').click();
        await page.waitForTimeout(100);
        await page.locator('[data-action="bold"]').click();
        await page.waitForTimeout(500);

        const editorValue = await page.locator('#markdown-editor').inputValue();
        // In help mode, the action should be intercepted — no bold markers inserted
        expect(editorValue).toBe('');
    });
});
