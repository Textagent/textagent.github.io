// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Development Build Validation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
    });

    test('no console errors on page load', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(5000);

        expect(errors).toEqual([]);
    });

    test('no broken local resource references', async ({ page }) => {
        const failedRequests = [];
        page.on('requestfailed', req => {
            const url = req.url();
            const errorText = req.failure()?.errorText || '';
            // Skip external APIs/CDNs and Vite's normal module-reload aborts
            if ((url.includes('localhost') || url.startsWith('/')) && !errorText.includes('ERR_ABORTED')) {
                failedRequests.push({ url, error: errorText });
            }
        });

        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForTimeout(5000);

        expect(failedRequests).toEqual([]);
    });

    test('all critical DOM elements exist', async ({ page }) => {
        const elements = await page.evaluate(() => {
            const ids = [
                'markdown-editor', 'markdown-preview', 'theme-toggle',
                'import-button', 'file-input', 'export-md', 'export-html',
                'export-pdf', 'copy-markdown-button', 'dropzone',
                'share-button', 'template-btn', 'template-modal',
                'ai-panel', 'find-replace-bar',
                'exportDropdown', 'share-options-modal',
            ];
            return ids.map(id => ({ id, exists: !!document.getElementById(id) }));
        });

        for (const el of elements) {
            expect(el.exists, `Element #${el.id} should exist`).toBe(true);
        }
    });

    test('CSP meta tag is present', async ({ page }) => {
        const csp = await page.evaluate(() => {
            const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            return meta ? meta.getAttribute('content') : null;
        });
        expect(csp).not.toBeNull();
        expect(csp).toContain('default-src');
    });

    test('vendor globals are loaded', async ({ page }) => {
        const globals = await page.evaluate(() => ({
            marked: typeof window.marked,
            DOMPurify: typeof window.DOMPurify,
            hljs: typeof window.hljs,
        }));
        expect(globals.marked).not.toBe('undefined');
        expect(globals.DOMPurify).not.toBe('undefined');
        expect(globals.hljs).not.toBe('undefined');
    });

    test('storage keys module provides all expected keys', async ({ page }) => {
        const keys = await page.evaluate(() => {
            const K = window.MDView.KEYS;
            return {
                hasTheme: !!K.THEME,
                hasAutosave: !!K.AUTOSAVE,
                hasPreviewTheme: !!K.PREVIEW_THEME,
            };
        });
        expect(keys.hasTheme).toBe(true);
        expect(keys.hasAutosave).toBe(true);
        expect(keys.hasPreviewTheme).toBe(true);
    });
});
