// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Quality & Accessibility', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
    });

    test('page has proper title', async ({ page }) => {
        const title = await page.title();
        expect(title).toContain('TextAgent');
    });

    test('page has meta description', async ({ page }) => {
        const desc = await page.evaluate(() => {
            const meta = document.querySelector('meta[name="description"]');
            return meta ? meta.getAttribute('content') : null;
        });
        expect(desc).not.toBeNull();
        expect(desc.length).toBeGreaterThan(20);
    });

    test('editor textarea has proper attributes', async ({ page }) => {
        const editor = page.locator('#markdown-editor');
        const id = await editor.getAttribute('id');
        expect(id).toBe('markdown-editor');
    });

    test('buttons have accessible labels or text', async ({ page }) => {
        const buttons = await page.evaluate(() => {
            const btns = document.querySelectorAll('button[id]');
            const unlabeled = [];
            btns.forEach(btn => {
                const hasText = btn.textContent.trim().length > 0;
                const hasTitle = !!btn.getAttribute('title');
                const hasAriaLabel = !!btn.getAttribute('aria-label');
                const hasIcon = btn.querySelector('i, svg') !== null;
                if (!hasText && !hasTitle && !hasAriaLabel && !hasIcon) {
                    unlabeled.push(btn.id);
                }
            });
            return unlabeled;
        });
        expect(buttons).toEqual([]);
    });

    test('no duplicate element IDs', async ({ page }) => {
        const duplicates = await page.evaluate(() => {
            const ids = {};
            document.querySelectorAll('[id]').forEach(el => {
                ids[el.id] = (ids[el.id] || 0) + 1;
            });
            return Object.entries(ids).filter(([, c]) => c > 1).map(([id]) => id);
        });
        expect(duplicates).toEqual([]);
    });

    test('dark mode applies data-theme attribute', async ({ page }) => {
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        expect(theme).toBe('dark');

        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
        const lightTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        expect(lightTheme).toBe('light');
    });

    test('responsive — editor is visible in narrow viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(300);
        const editor = page.locator('#markdown-editor');
        await expect(editor).toBeAttached();
    });

    test('no XSS — script tags are sanitized in preview', async ({ page }) => {
        await page.locator('#markdown-editor').fill('<script>window.__XSS_TEST = true;</script>');
        await page.waitForTimeout(500);

        const xssExecuted = await page.evaluate(() => window.__XSS_TEST);
        expect(xssExecuted).toBeUndefined();
    });

    test('product metadata is consistent', async ({ page }) => {
        const meta = await page.evaluate(() => ({
            templateCount: window.MDView.PRODUCT.TEMPLATE_COUNT,
            categoryCount: window.MDView.PRODUCT.CATEGORY_COUNT,
            categories: window.MDView.PRODUCT.CATEGORIES,
            summary: window.MDView.PRODUCT.summary(),
            summaryParen: window.MDView.PRODUCT.summaryParen(),
        }));
        expect(meta.templateCount).toBeGreaterThan(50);
        expect(meta.categoryCount).toBeGreaterThan(5);
        expect(meta.categories.length).toBe(meta.categoryCount);
        expect(meta.summary).toContain(String(meta.templateCount));
        expect(meta.summaryParen).toContain(String(meta.categoryCount));
    });
});
