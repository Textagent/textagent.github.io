// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Unit tests for js/file-converters.js — file import converters
 * for MD, CSV, JSON, XML, HTML, and unsupported formats.
 */
test.describe('File Converters Module', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);
    });

    // ── API Surface ──────────────────────────────────────────────────

    test('MDView.importFile is a function', async ({ page }) => {
        const type = await page.evaluate(() => typeof window.MDView.importFile);
        expect(type).toBe('function');
    });

    test('MDView.importMarkdownFile is a function', async ({ page }) => {
        const type = await page.evaluate(() => typeof window.MDView.importMarkdownFile);
        expect(type).toBe('function');
    });

    // ── Markdown Import ──────────────────────────────────────────────

    test('importing a .md file populates editor', async ({ page }) => {
        const content = '# Hello World\n\nThis is a markdown file.';
        await page.evaluate((c) => {
            const file = new File([c], 'test.md', { type: 'text/markdown' });
            window.MDView.importFile(file);
        }, content);

        await page.waitForFunction(() => {
            const ed = document.getElementById('markdown-editor');
            return ed && ed.value.includes('Hello World');
        }, null, { timeout: 5000 });

        const value = await page.locator('#markdown-editor').inputValue();
        expect(value).toContain('Hello World');
        expect(value).toContain('This is a markdown file.');
    });

    // ── CSV Import ───────────────────────────────────────────────────

    test('importing a .csv file produces markdown table', async ({ page }) => {
        const csv = 'Name,Score,Grade\nAlice,95,A\nBob,87,B';
        await page.evaluate((c) => {
            const file = new File([c], 'grades.csv', { type: 'text/csv' });
            window.MDView.importFile(file);
        }, csv);

        await page.waitForFunction(() => {
            const ed = document.getElementById('markdown-editor');
            return ed && ed.value.includes('|') && ed.value.includes('Alice');
        }, null, { timeout: 5000 });

        const value = await page.locator('#markdown-editor').inputValue();
        expect(value).toContain('Name');
        expect(value).toContain('Score');
        expect(value).toContain('Alice');
        expect(value).toContain('95');
        expect(value).toContain('|');
    });

    // ── JSON Import ──────────────────────────────────────────────────

    test('importing a .json file wraps in code block', async ({ page }) => {
        const json = '{"name": "test", "value": 42}';
        await page.evaluate((c) => {
            const file = new File([c], 'data.json', { type: 'application/json' });
            window.MDView.importFile(file);
        }, json);

        await page.waitForFunction(() => {
            const ed = document.getElementById('markdown-editor');
            return ed && ed.value.includes('```json');
        }, null, { timeout: 5000 });

        const value = await page.locator('#markdown-editor').inputValue();
        expect(value).toContain('```json');
        expect(value).toContain('"name"');
        expect(value).toContain('42');
    });

    // ── XML Import ───────────────────────────────────────────────────

    test('importing a .xml file wraps in code block', async ({ page }) => {
        const xml = '<?xml version="1.0"?><root><item>Test</item></root>';
        await page.evaluate((c) => {
            const file = new File([c], 'data.xml', { type: 'text/xml' });
            window.MDView.importFile(file);
        }, xml);

        await page.waitForFunction(() => {
            const ed = document.getElementById('markdown-editor');
            return ed && ed.value.includes('```xml');
        }, null, { timeout: 5000 });

        const value = await page.locator('#markdown-editor').inputValue();
        expect(value).toContain('```xml');
        expect(value).toContain('root');
    });

    // ── HTML Import ──────────────────────────────────────────────────

    test('importing a .html file converts to markdown', async ({ page }) => {
        const html = '<h1>Hello HTML</h1><p>Paragraph with <strong>bold</strong>.</p><script>alert(1)</script>';
        await page.evaluate((c) => {
            const file = new File([c], 'page.html', { type: 'text/html' });
            window.MDView.importFile(file);
        }, html);

        await page.waitForFunction(() => {
            const ed = document.getElementById('markdown-editor');
            return ed && ed.value.includes('Hello HTML');
        }, null, { timeout: 5000 });

        const value = await page.locator('#markdown-editor').inputValue();
        expect(value).toContain('Hello HTML');
        // Script tags should be stripped
        expect(value).not.toContain('<script>');
        expect(value).not.toContain('alert');
    });

    // ── Unsupported Format ───────────────────────────────────────────

    test('unsupported file extension shows error toast', async ({ page }) => {
        const toasts = [];
        await page.evaluate(() => {
            const original = window.MDView.showToast;
            window._capturedToasts = [];
            window.MDView.showToast = function(msg, type) {
                window._capturedToasts.push({ msg, type });
                if (original) original.call(this, msg, type);
            };
        });

        await page.evaluate(() => {
            const file = new File(['binary data'], 'image.bmp', { type: 'image/bmp' });
            window.MDView.importFile(file);
        });

        await page.waitForTimeout(500);

        const captured = await page.evaluate(() => window._capturedToasts);
        const errorToast = captured.find(t => t.type === 'error');
        expect(errorToast).toBeDefined();
        expect(errorToast.msg).toContain('Unsupported');
    });

    // ── Conversion overlay DOM exists ────────────────────────────────

    test('conversion overlay element exists in DOM', async ({ page }) => {
        const els = await page.evaluate(() => ({
            overlay: !!document.getElementById('conversion-overlay'),
            title: !!document.getElementById('conversion-title'),
            detail: !!document.getElementById('conversion-detail'),
        }));
        expect(els.overlay).toBe(true);
        expect(els.title).toBe(true);
        expect(els.detail).toBe(true);
    });
});
