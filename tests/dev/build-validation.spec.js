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

    test('no CSP violations on page load', async ({ page }) => {
        /** @type {string[]} */
        const cspViolations = [];

        // CSP blocks surface as console warnings (not JS errors)
        page.on('console', msg => {
            if (msg.type() === 'warning' || msg.type() === 'error') {
                const text = msg.text();
                if (text.includes('Content Security Policy') || text.includes('CSP')) {
                    cspViolations.push(text);
                }
            }
        });

        // Also catch network requests blocked by CSP
        page.on('requestfailed', req => {
            const failure = req.failure();
            if (failure && failure.errorText.includes('net::ERR_BLOCKED_BY_CSP')) {
                cspViolations.push(`CSP blocked: ${req.url()}`);
            }
        });

        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(5000);

        expect(cspViolations, 'CSP violations detected — update img-src / script-src / connect-src in index.html').toEqual([]);
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
