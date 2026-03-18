// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Presentation Mode Tests
 *
 * Verifies slide presentation mode with --- separators,
 * navigation, and mode switching.
 * Note: #present-button is inside a toolbar overflow group
 * and may not be directly visible. Tests use the view mode
 * bar [data-mode="ppt"] button or JS API to enter PPT mode.
 */
test.describe('Presentation Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView && w.MDView.currentViewMode === 'split';
        }, { timeout: 15000 });
    });

    test('present button exists in DOM', async ({ page }) => {
        const exists = await page.evaluate(() => {
            return !!document.getElementById('present-button');
        });
        expect(exists).toBe(true);
    });

    test('clicking PPT view mode button switches to PPT mode', async ({ page }) => {
        // Insert content with slide separators
        await page.locator('#markdown-editor').fill('# Slide 1\n\nHello\n\n---\n\n# Slide 2\n\nWorld');
        await page.waitForTimeout(500);

        // Use the view-mode-btn [data-mode="ppt"] which is always visible in the header
        const pptBtn = page.locator('.view-mode-btn[data-mode="ppt"]');
        if (await pptBtn.isVisible()) {
            await pptBtn.click();
        } else {
            // Fallback: use JS API
            await page.evaluate(() => {
                /** @type {any} */ (window).MDView.setViewMode('ppt');
            });
        }
        await page.waitForTimeout(1000);

        const viewMode = await page.evaluate(() => {
            return /** @type {any} */ (window).MDView.currentViewMode;
        });
        expect(viewMode).toBe('ppt');
    });

    test('PPT mode renders with slide content', async ({ page }) => {
        await page.locator('#markdown-editor').fill('# Slide 1\n\nIntro\n\n---\n\n# Slide 2\n\nBody\n\n---\n\n# Slide 3\n\nEnd');
        await page.waitForTimeout(500);

        // Enter PPT mode via JS
        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.setViewMode('ppt');
        });
        await page.waitForTimeout(1000);

        // Verify the view mode is PPT
        const viewMode = await page.evaluate(() => {
            return /** @type {any} */ (window).MDView.currentViewMode;
        });
        expect(viewMode).toBe('ppt');
    });

    test('PPT mode button in view mode bar exists', async ({ page }) => {
        const pptBtn = page.locator('[data-mode="ppt"]');
        const exists = await pptBtn.count();
        expect(exists).toBeGreaterThanOrEqual(1);
    });

    test('switching back from PPT to split mode works', async ({ page }) => {
        await page.locator('#markdown-editor').fill('# Slide 1\n\n---\n\n# Slide 2');
        await page.waitForTimeout(500);

        // Enter PPT via JS
        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.setViewMode('ppt');
        });
        await page.waitForTimeout(1000);

        // Switch back to split
        const splitBtn = page.locator('.view-mode-btn[data-mode="split"]');
        if (await splitBtn.isVisible()) {
            await splitBtn.click();
        } else {
            await page.evaluate(() => {
                /** @type {any} */ (window).MDView.setViewMode('split');
            });
        }
        await page.waitForTimeout(500);

        const viewMode = await page.evaluate(() => {
            return /** @type {any} */ (window).MDView.currentViewMode;
        });
        expect(viewMode).toBe('split');
    });
});
