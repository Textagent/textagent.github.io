// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Editor Features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView && w.MDView.currentViewMode === 'split';
        });
    });

    test('editor renders markdown in preview', async ({ page }) => {
        await page.locator('#markdown-editor').fill('# Hello World\n\nThis is **bold** text.');
        const preview = page.locator('#markdown-preview');
        await expect(preview).toContainText('Hello World');
        await expect(preview.locator('strong')).toHaveText('bold');
    });

    test('editor supports code blocks with syntax highlighting', async ({ page }) => {
        await page.locator('#markdown-editor').fill('```javascript\nconst x = 42;\n```');
        const preview = page.locator('#markdown-preview');
        await expect(preview).toContainText('const');
        await expect(preview.locator('code')).toBeVisible({ timeout: 10000 });
    });

    test('editor supports LaTeX math rendering', async ({ page }) => {
        await page.locator('#markdown-editor').fill('$$E = mc^2$$');
        const preview = page.locator('#markdown-preview');
        await expect(preview.locator('mjx-container, .math')).toBeVisible({ timeout: 10000 });
    });

    test('editor supports task lists', async ({ page }) => {
        await page.locator('#markdown-editor').fill('- [x] Done\n- [ ] Todo');
        const preview = page.locator('#markdown-preview');
        await expect(preview.locator('input[type="checkbox"]')).toHaveCount(2, { timeout: 10000 });
    });

    test('editor supports tables', async ({ page }) => {
        await page.locator('#markdown-editor').fill('| A | B |\n|---|---|\n| 1 | 2 |');
        const preview = page.locator('#markdown-preview');
        await expect(preview.locator('table')).toBeVisible({ timeout: 10000 });
        await expect(preview.locator('td')).toHaveCount(2);
    });

    test('editor supports emoji shortcodes', async ({ page }) => {
        await page.locator('#markdown-editor').fill(':rocket: :star:');
        const preview = page.locator('#markdown-preview');
        await expect(preview).toContainText('🚀', { timeout: 10000 });
        await expect(preview).toContainText('⭐', { timeout: 10000 });
    });

    test('editor supports GitHub-style callouts', async ({ page }) => {
        await page.locator('#markdown-editor').fill('> [!NOTE]\n> This is a note.');
        const preview = page.locator('#markdown-preview');
        await expect(preview.locator('.markdown-callout.callout-note')).toBeVisible({ timeout: 10000 });
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
