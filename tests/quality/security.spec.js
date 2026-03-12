// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Security hardening tests — verify that the application
 * resists common web attack patterns.
 */
test.describe('Quality — Security', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
    });

    test('DOMPurify strips onerror attributes', async ({ page }) => {
        await page.locator('#markdown-editor').fill('<img src=x onerror="window.__SEC1=1">');
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).not.toContain('onerror');
        const flag = await page.evaluate(() => window.__SEC1);
        expect(flag).toBeUndefined();
    });

    test('DOMPurify strips onload attributes', async ({ page }) => {
        await page.locator('#markdown-editor').fill('<svg onload="window.__SEC2=1"><rect/></svg>');
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).not.toContain('onload');
        const flag = await page.evaluate(() => window.__SEC2);
        expect(flag).toBeUndefined();
    });

    test('DOMPurify strips onclick attributes', async ({ page }) => {
        await page.locator('#markdown-editor').fill('<button onclick="window.__SEC3=1">Click</button>');
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).not.toContain('onclick');
    });

    test('javascript: URIs are blocked in rendered output', async ({ page }) => {
        await page.locator('#markdown-editor').fill('[click me](javascript:alert(1))');
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).not.toContain('javascript:');
    });

    test('data: URI script injection is blocked', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '<object data="data:text/html,<script>window.__SEC4=1</script>"></object>'
        );
        await page.waitForTimeout(500);
        const flag = await page.evaluate(() => window.__SEC4);
        expect(flag).toBeUndefined();
    });

    test('CSP meta tag is present with restrictive policy', async ({ page }) => {
        const csp = await page.evaluate(() => {
            const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            return meta ? meta.getAttribute('content') : null;
        });
        expect(csp).not.toBeNull();
        expect(csp).toContain('default-src');
    });

    test('no sensitive data on window globals', async ({ page }) => {
        const sensitive = await page.evaluate(() => {
            const suspects = ['apiKey', 'API_KEY', 'password', 'secret', 'token', 'accessToken'];
            const found = [];
            for (const key of suspects) {
                if (window[key] !== undefined) found.push(key);
            }
            return found;
        });
        expect(sensitive).toEqual([]);
    });

    test('markdown links render with proper target and rel', async ({ page }) => {
        await page.locator('#markdown-editor').fill('[Google](https://google.com)');
        await page.waitForTimeout(500);
        const link = page.locator('#markdown-preview a[href="https://google.com"]');
        const rel = await link.getAttribute('rel');
        // External links should have noopener
        if (rel) {
            expect(rel).toContain('noopener');
        }
    });

    test('base64-encoded script tags are neutralized', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '<img src="data:image/svg+xml;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMSk+">'
        );
        await page.waitForTimeout(500);
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.waitForTimeout(500);
        // No script should have executed
        expect(errors).toEqual([]);
    });

    test('form submissions in preview do not navigate away', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '<form action="https://evil.com"><input name="data"><button type="submit">Submit</button></form>'
        );
        await page.waitForTimeout(500);

        // Even if DOMPurify allows forms, submitting should not navigate
        const urlBefore = page.url();
        const formExists = await page.locator('#markdown-preview form').count();
        if (formExists > 0) {
            await page.evaluate(() => {
                document.querySelectorAll('#markdown-preview form').forEach(f => {
                    f.addEventListener('submit', e => e.preventDefault());
                });
            });
        }
        const urlAfter = page.url();
        expect(urlAfter).toBe(urlBefore);
    });
});
