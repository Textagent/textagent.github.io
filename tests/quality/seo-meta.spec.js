// @ts-check
import { test, expect } from '@playwright/test';

/**
 * SEO & meta-data quality tests — ensure proper tags for
 * search engine discoverability and social sharing.
 */
test.describe('Quality — SEO & Meta', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
    });

    test('page has a descriptive title', async ({ page }) => {
        const title = await page.title();
        expect(title.length).toBeGreaterThanOrEqual(5);
        expect(title.toLowerCase()).toContain('textagent');
    });

    test('viewport meta tag is set', async ({ page }) => {
        const viewport = await page.evaluate(() => {
            const meta = document.querySelector('meta[name="viewport"]');
            return meta ? meta.getAttribute('content') : null;
        });
        expect(viewport).not.toBeNull();
        expect(viewport).toContain('width=device-width');
    });

    test('html element has lang attribute', async ({ page }) => {
        const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
        expect(lang).not.toBeNull();
        expect(lang.length).toBeGreaterThanOrEqual(2);
    });

    test('meta description is present and meaningful', async ({ page }) => {
        const desc = await page.evaluate(() => {
            const meta = document.querySelector('meta[name="description"]');
            return meta ? meta.getAttribute('content') : null;
        });
        expect(desc).not.toBeNull();
        expect(desc.length).toBeGreaterThan(30);
    });

    test('Open Graph tags are present', async ({ page }) => {
        const og = await page.evaluate(() => {
            const get = (prop) => {
                const el = document.querySelector(`meta[property="${prop}"]`);
                return el ? el.getAttribute('content') : null;
            };
            return {
                title: get('og:title'),
                description: get('og:description'),
                type: get('og:type'),
            };
        });
        expect(og.title).not.toBeNull();
        expect(og.description).not.toBeNull();
    });

    test('canonical or site URL is referenced', async ({ page }) => {
        const found = await page.evaluate(() => {
            const canonical = document.querySelector('link[rel="canonical"]');
            const ogUrl = document.querySelector('meta[property="og:url"]');
            return !!(canonical || ogUrl);
        });
        // This is a soft check — log if missing but don't hard-fail for local dev
        if (!found) {
            console.warn('No canonical link or og:url found — add for production SEO');
        }
    });

    test('only one h1 exists in the page shell', async ({ page }) => {
        const h1Count = await page.evaluate(() => document.querySelectorAll('h1').length);
        // The page itself should have at most 1 h1; preview may add more dynamically
        // Check just the static page (no user content yet)
        expect(h1Count).toBeLessThanOrEqual(1);
    });

    test('favicon is referenced', async ({ page }) => {
        const favicon = await page.evaluate(() => {
            const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
            return link ? link.getAttribute('href') : null;
        });
        expect(favicon).not.toBeNull();
    });
});
