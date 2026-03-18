// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Table Tools Tests
 *
 * Verifies the spreadsheet-like table toolbar that appears
 * on rendered markdown tables in the preview pane.
 */
test.describe('Table Spreadsheet Tools', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView && w.MDView.addTableToolbars;
        }, { timeout: 15000 });
    });

    /** Insert a markdown table into the editor and wait for render */
    async function insertTable(page) {
        const md = [
            '| Name | Age | City |',
            '|------|-----|------|',
            '| Alice | 30 | Tokyo |',
            '| Bob | 25 | London |',
            '| Carol | 35 | Paris |',
        ].join('\n');
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(800);
    }

    test('addTableToolbars function exists on M', async ({ page }) => {
        const result = await page.evaluate(() => {
            return typeof /** @type {any} */ (window).MDView.addTableToolbars;
        });
        expect(result).toBe('function');
    });

    test('rendering a table wraps it in table-tools-container', async ({ page }) => {
        await insertTable(page);

        const containerCount = await page.evaluate(() => {
            return document.querySelectorAll('#markdown-preview .table-tools-container').length;
        });
        expect(containerCount).toBeGreaterThanOrEqual(1);
    });

    test('table toolbar has expected buttons', async ({ page }) => {
        await insertTable(page);

        const buttons = await page.evaluate(() => {
            const toolbar = document.querySelector('#markdown-preview .table-tools-toolbar');
            if (!toolbar) return [];
            return Array.from(toolbar.querySelectorAll('.tt-btn')).map(btn => btn.title || btn.textContent.trim());
        });
        // Should have sort, filter, search, stats, chart, +row, +col, csv, md, download
        expect(buttons.length).toBeGreaterThanOrEqual(6);
    });

    test('row count badge shows correct count', async ({ page }) => {
        await insertTable(page);

        const badgeText = await page.evaluate(() => {
            const badge = document.querySelector('#markdown-preview .tt-row-badge');
            return badge ? badge.textContent : null;
        });
        expect(badgeText).toBeTruthy();
        expect(badgeText).toContain('3'); // 3 data rows
    });

    test('table cells have tt-editable-cell class', async ({ page }) => {
        await insertTable(page);

        const editableCells = await page.evaluate(() => {
            return document.querySelectorAll('#markdown-preview td.tt-editable-cell').length;
        });
        // 3 rows × 3 columns = 9 cells
        expect(editableCells).toBe(9);
    });

    test('tiny tables (< 2 rows) do not get toolbar', async ({ page }) => {
        // Single-row table (just header)
        await page.locator('#markdown-editor').fill('| Col |\n|---|\n');
        await page.waitForTimeout(800);

        const containerCount = await page.evaluate(() => {
            return document.querySelectorAll('#markdown-preview .table-tools-container').length;
        });
        expect(containerCount).toBe(0);
    });
});
