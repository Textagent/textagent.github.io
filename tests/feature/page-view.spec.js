// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Page View Mode Tests
 *
 * Verifies the A4 paginated view mode:
 * enter/exit, page frames, counter, zoom, empty state.
 */
test.describe('Page View Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView && w.MDView.enterPageMode && w.MDView.exitPageMode;
        }, { timeout: 15000 });
    });

    test('enterPageMode and exitPageMode functions exist', async ({ page }) => {
        const result = await page.evaluate(() => {
            const M = /** @type {any} */ (window).MDView;
            return {
                hasEnter: typeof M.enterPageMode === 'function',
                hasExit: typeof M.exitPageMode === 'function',
            };
        });
        expect(result.hasEnter).toBe(true);
        expect(result.hasExit).toBe(true);
    });

    test('page-view-container is initially hidden', async ({ page }) => {
        const display = await page.evaluate(() => {
            const el = document.getElementById('page-view-container');
            return el ? getComputedStyle(el).display : 'NOT_FOUND';
        });
        expect(display).toBe('none');
    });

    test('entering page mode shows page-view-container', async ({ page }) => {
        // Put some content first
        await page.locator('#markdown-editor').fill('# Hello World\n\nSome content for page view.');
        await page.waitForTimeout(500);

        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.enterPageMode();
        });
        await page.waitForTimeout(500);

        const display = await page.evaluate(() => {
            const el = document.getElementById('page-view-container');
            return el ? el.style.display : 'NOT_FOUND';
        });
        expect(display).not.toBe('none');
    });

    test('exiting page mode hides page-view-container', async ({ page }) => {
        await page.evaluate(() => {
            const M = /** @type {any} */ (window).MDView;
            M.enterPageMode();
        });
        await page.waitForTimeout(300);

        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.exitPageMode();
        });
        await page.waitForTimeout(300);

        const display = await page.evaluate(() => {
            const el = document.getElementById('page-view-container');
            return el ? el.style.display : 'NOT_FOUND';
        });
        expect(display).toBe('none');
    });

    test('entering page mode with content creates page-frame elements', async ({ page }) => {
        await page.locator('#markdown-editor').fill('# Page 1\n\nContent for the first page.\n\n## Section\n\nMore content here.');
        await page.waitForTimeout(500);

        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.enterPageMode();
        });
        await page.waitForTimeout(500);

        const frameCount = await page.evaluate(() => {
            return document.querySelectorAll('#page-view-scroll .page-frame').length;
        });
        expect(frameCount).toBeGreaterThanOrEqual(1);
    });

    test('page counter displays correct page count', async ({ page }) => {
        await page.locator('#markdown-editor').fill('# Hello\n\nShort content.');
        await page.waitForTimeout(500);

        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.enterPageMode();
        });
        await page.waitForTimeout(500);

        const counterText = await page.evaluate(() => {
            const el = document.getElementById('page-view-counter');
            return el ? el.textContent : null;
        });
        expect(counterText).toBeTruthy();
        expect(counterText).toMatch(/\d+ page/);
    });

    test('zoom control updates data-zoom attribute', async ({ page }) => {
        await page.locator('#markdown-editor').fill('# Test');
        await page.waitForTimeout(300);

        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.enterPageMode();
        });
        await page.waitForTimeout(500);

        // Enter page mode and then check zoom — zoom lives inside page-view-container
        await page.evaluate(() => {
            /** @type {any} */ (window).MDView.enterPageMode();
        });
        await page.waitForTimeout(500);

        const zoomSelect = page.locator('#page-view-zoom');
        if (await zoomSelect.isVisible()) {
            await zoomSelect.selectOption('0.75');
            await page.waitForTimeout(200);

            const zoomVal = await page.evaluate(() => {
                const el = document.getElementById('page-view-scroll');
                return el ? el.getAttribute('data-zoom') : null;
            });
            expect(zoomVal).toBe('0.75');
        }
    });
});
