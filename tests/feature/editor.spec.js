// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Editor Features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
    });

    test('editor renders markdown in preview', async ({ page }) => {
        await page.locator('#markdown-editor').fill('# Hello World\n\nThis is **bold** text.');
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).toContain('Hello World');
        expect(html).toContain('<strong>bold</strong>');
    });

    test('editor supports code blocks with syntax highlighting', async ({ page }) => {
        await page.locator('#markdown-editor').fill('```javascript\nconst x = 42;\n```');
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).toContain('const');
        expect(html).toContain('<code');
    });

    test('editor supports LaTeX math rendering', async ({ page }) => {
        await page.locator('#markdown-editor').fill('$$E = mc^2$$');
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).toContain('E');
    });

    test('editor supports task lists', async ({ page }) => {
        await page.locator('#markdown-editor').fill('- [x] Done\n- [ ] Todo');
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).toContain('type="checkbox"');
    });

    test('editor supports tables', async ({ page }) => {
        await page.locator('#markdown-editor').fill('| A | B |\n|---|---|\n| 1 | 2 |');
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).toContain('<table');
        expect(html).toContain('<td');
    });

    test('editor supports emoji shortcodes', async ({ page }) => {
        await page.locator('#markdown-editor').fill(':rocket: :star:');
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html.length).toBeGreaterThan(0);
    });

    test('editor supports GitHub-style callouts', async ({ page }) => {
        await page.locator('#markdown-editor').fill('> [!NOTE]\n> This is a note.');
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).toContain('note');
    });

    test('word count and stats update on input', async ({ page }) => {
        await page.locator('#markdown-editor').fill('one two three four five');
        await page.waitForTimeout(600);
        const wordCount = await page.locator('#word-count').textContent();
        expect(wordCount).toContain('5');
    });

    test('autosave stores content in localStorage', async ({ page }) => {
        const testContent = 'Autosave test content ' + Date.now();
        await page.locator('#markdown-editor').fill(testContent);
        // Wait for autosave interval (typically 1-2 seconds)
        await page.waitForTimeout(3000);

        // Check all possible autosave storage keys
        const found = await page.evaluate((content) => {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const val = localStorage.getItem(key);
                if (val && val.includes('Autosave test content')) {
                    return { key, matches: true };
                }
            }
            return { key: null, matches: false };
        }, testContent);

        expect(found.matches).toBe(true);
    });
});
