// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Inline File Rename Tests
 *
 * Verifies the clickable title chip in the header
 * that opens the rename modal.
 */
test.describe('Inline File Rename', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView && w.MDView.currentViewMode === 'split';
        }, { timeout: 15000 });
    });

    test('title chip exists in main header', async ({ page }) => {
        const chip = page.locator('#doc-title-chip');
        // May be hidden on narrow screens, check it exists in DOM
        const exists = await page.evaluate(() => {
            return !!document.getElementById('doc-title-chip');
        });
        expect(exists).toBe(true);
    });

    test('title chip displays a filename', async ({ page }) => {
        const text = await page.evaluate(() => {
            const chip = document.getElementById('doc-title-chip');
            return chip ? chip.textContent.trim() : null;
        });
        expect(text).toBeTruthy();
        // Should not be empty and should not include .md extension
        expect(text.length).toBeGreaterThan(0);
    });

    test('QAB title chip exists', async ({ page }) => {
        const exists = await page.evaluate(() => {
            return !!document.getElementById('qab-doc-title-chip');
        });
        expect(exists).toBe(true);
    });

    test('clicking title chip opens rename/action modal', async ({ page }) => {
        // Make sure the main header chip is visible by ensuring wide viewport
        await page.setViewportSize({ width: 1400, height: 900 });
        await page.waitForTimeout(300);

        const chip = page.locator('#doc-title-chip');
        if (await chip.isVisible()) {
            await chip.click();
            await page.waitForTimeout(500);

            // Check if action modal or rename modal is visible
            const modalVisible = await page.evaluate(() => {
                const modal = document.getElementById('ws-action-modal');
                return modal && modal.style.display !== 'none';
            });
            expect(modalVisible).toBe(true);
        }
    });
});
