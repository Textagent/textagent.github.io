// @ts-check
import { test, expect } from '@playwright/test';

/**
 * API Tag Tests
 *
 * Verifies parsing, config extraction, and rendering of {{API:}} tags.
 */
test.describe('API Tag ({{API:}})', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView &&
                w.MDView.parseApiBlocks &&
                w.MDView.parseApiConfig &&
                w.MDView.transformApiMarkdown;
        }, { timeout: 15000 });
    });

    // ═══════════════════════════════════════════
    // PARSING TESTS
    // ═══════════════════════════════════════════

    test('parseApiBlocks extracts API blocks from markdown', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '# Title\n\n{{API:\n  URL: https://httpbin.org/get\n  Method: GET\n  Variable: result1\n}}\n\nSome text.';
            const blocks = /** @type {any} */ (window).MDView.parseApiBlocks(md);
            return {
                count: blocks.length,
                type: blocks[0]?.type,
                prompt: blocks[0]?.prompt,
            };
        });
        expect(result.count).toBe(1);
        expect(result.type).toBe('API');
        expect(result.prompt).toContain('URL:');
    });

    test('parseApiConfig extracts URL, Method, Headers, Body, Variable', async ({ page }) => {
        const result = await page.evaluate(() => {
            const prompt = 'URL: https://httpbin.org/post\nMethod: POST\nHeaders: Content-Type: application/json\nBody: {"key": "value"}\nVariable: postResult';
            return /** @type {any} */ (window).MDView.parseApiConfig(prompt);
        });
        expect(result.url).toBe('https://httpbin.org/post');
        expect(result.method).toBe('POST');
        expect(result.headers['Content-Type']).toBe('application/json');
        expect(result.body).toBe('{"key": "value"}');
        expect(result.variable).toBe('postResult');
    });

    test('parseApiConfig defaults to GET when method not specified', async ({ page }) => {
        const result = await page.evaluate(() => {
            const prompt = 'URL: https://example.com/api';
            return /** @type {any} */ (window).MDView.parseApiConfig(prompt);
        });
        expect(result.method).toBe('GET');
    });

    test('API blocks inside fenced code blocks are ignored', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '```\n{{API:\n  URL: https://example.com\n  Method: GET\n}}\n```';
            const blocks = /** @type {any} */ (window).MDView.parseApiBlocks(md);
            return blocks.length;
        });
        expect(result).toBe(0);
    });

    test('multiple API blocks are parsed correctly', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '{{API:\n  URL: https://api1.com\n  Method: GET\n}}\n\n{{API:\n  URL: https://api2.com\n  Method: POST\n}}';
            const blocks = /** @type {any} */ (window).MDView.parseApiBlocks(md);
            return {
                count: blocks.length,
                url1: blocks[0]?.apiConfig?.url,
                url2: blocks[1]?.apiConfig?.url,
                method1: blocks[0]?.apiConfig?.method,
                method2: blocks[1]?.apiConfig?.method,
            };
        });
        expect(result.count).toBe(2);
        expect(result.url1).toBe('https://api1.com');
        expect(result.url2).toBe('https://api2.com');
        expect(result.method1).toBe('GET');
        expect(result.method2).toBe('POST');
    });

    // ═══════════════════════════════════════════
    // RENDERING TESTS
    // ═══════════════════════════════════════════

    test('transformApiMarkdown renders API card with method badge and URL', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '{{API:\n  URL: https://httpbin.org/get\n  Method: GET\n  Variable: myResult\n}}';
            return /** @type {any} */ (window).MDView.transformApiMarkdown(md);
        });
        expect(result).toContain('ai-api-card');
        expect(result).toContain('GET');
        expect(result).toContain('httpbin.org/get');
        expect(result).toContain('$(api_myResult)');
    });

    test('API card renders in preview when editor has API tag', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{API:\n  URL: https://httpbin.org/get\n  Method: GET\n}}');
        await page.waitForTimeout(800);

        const cardCount = await page.evaluate(() => {
            return document.querySelectorAll('#markdown-preview .ai-api-card').length;
        });
        expect(cardCount).toBe(1);
    });
});
