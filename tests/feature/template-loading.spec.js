// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Template Loading Tests
 *
 * Verifies the template modal, categories, search, and card rendering.
 * The template button (#template-btn) lives inside a d-xl-flex header section,
 * so we use M.openTemplateModal() JS API for reliable testing.
 */
test.describe('Template System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView && typeof w.MDView.openTemplateModal === 'function';
        }, { timeout: 15000 });
    });

    test('template button exists in DOM', async ({ page }) => {
        const exists = await page.evaluate(() => !!document.getElementById('template-btn'));
        expect(exists).toBe(true);
    });

    test('openTemplateModal opens the template modal', async ({ page }) => {
        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.openTemplateModal();
        });
        await page.waitForTimeout(500);

        const isVisible = await page.evaluate(() => {
            const modal = document.getElementById('template-modal');
            return modal && modal.style.display !== 'none';
        });
        expect(isVisible).toBe(true);
    });

    test('template modal has category tabs', async ({ page }) => {
        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.openTemplateModal();
        });
        await page.waitForTimeout(500);

        const categoryCount = await page.evaluate(() => {
            return document.querySelectorAll('#template-categories .template-cat-btn').length;
        });
        // Should have at least 14 category buttons (all + 13 categories)
        expect(categoryCount).toBeGreaterThanOrEqual(14);
    });

    test('template modal has search input', async ({ page }) => {
        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.openTemplateModal();
        });
        await page.waitForTimeout(500);

        const hasInput = await page.evaluate(() => {
            const el = document.getElementById('template-search-input');
            return el && el.offsetParent !== null;
        });
        expect(hasInput).toBe(true);
    });

    test('template cards are rendered (All category)', async ({ page }) => {
        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.openTemplateModal();
        });
        await page.waitForTimeout(500);

        const cardCount = await page.evaluate(() => {
            return document.querySelectorAll('#template-modal .template-card').length;
        });
        // Should have at least 100 templates total
        expect(cardCount).toBeGreaterThanOrEqual(100);
    });

    test('search input filters templates by name', async ({ page }) => {
        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.openTemplateModal();
        });
        await page.waitForTimeout(500);

        const initialCount = await page.evaluate(() => {
            return document.querySelectorAll('#template-modal .template-card').length;
        });

        // Type a search term
        await page.evaluate(() => {
            const input = /** @type {HTMLInputElement} */ (document.getElementById('template-search-input'));
            input.value = 'Python';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.waitForTimeout(500);

        const filteredCount = await page.evaluate(() => {
            return document.querySelectorAll('#template-modal .template-card').length;
        });

        expect(filteredCount).toBeLessThan(initialCount);
        expect(filteredCount).toBeGreaterThanOrEqual(1);
    });

    test('closeTemplateModal closes the modal', async ({ page }) => {
        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.openTemplateModal();
        });
        await page.waitForTimeout(500);

        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.closeTemplateModal();
        });
        await page.waitForTimeout(300);

        const isHidden = await page.evaluate(() => {
            const modal = document.getElementById('template-modal');
            return modal && modal.style.display === 'none';
        });
        expect(isHidden).toBe(true);
    });
});
