// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Regression tests — pin down fixes for previously-reported bugs
 * so they never reappear.
 */
test.describe('Regression', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
    });

    // ── XSS / Sanitization ────────────────────────────────────────────

    test('XSS — script tags are stripped from preview', async ({ page }) => {
        await page.locator('#markdown-editor').fill('<script>window.__XSS=1</script>');
        await page.waitForTimeout(500);
        const xss = await page.evaluate(() => window.__XSS);
        expect(xss).toBeUndefined();

        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).not.toContain('<script');
    });

    test('XSS — onerror payloads are stripped', async ({ page }) => {
        await page.locator('#markdown-editor').fill('<img src=x onerror="window.__XSS2=1">');
        await page.waitForTimeout(500);
        const xss = await page.evaluate(() => window.__XSS2);
        expect(xss).toBeUndefined();
    });

    test('XSS — iframe injection is blocked', async ({ page }) => {
        await page.locator('#markdown-editor').fill('<iframe src="javascript:alert(1)"></iframe>');
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).not.toContain('javascript:');
    });

    test('XSS — event handler attributes are removed', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '<div onclick="alert(1)" onmouseover="alert(2)">test</div>'
        );
        await page.waitForTimeout(500);
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).not.toContain('onclick');
        expect(html).not.toContain('onmouseover');
    });

    // ── Rendering edge cases ──────────────────────────────────────────

    test('deeply nested list renders without errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        const nested = Array.from({ length: 10 }, (_, i) => '  '.repeat(i) + '- item ' + i).join('\n');
        await page.locator('#markdown-editor').fill(nested);
        await page.waitForTimeout(500);
        const preview = page.locator('#markdown-preview');
        await expect(preview).toContainText('item 9');
        expect(errors).toEqual([]);
    });

    test('empty code block renders without crash', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.locator('#markdown-editor').fill('```\n\n```');
        await page.waitForTimeout(500);
        const codeEl = page.locator('#markdown-preview code');
        await expect(codeEl).toBeAttached();
        expect(errors).toEqual([]);
    });

    test('table with missing cells renders gracefully', async ({ page }) => {
        const md = '| A | B | C |\n|---|---|---|\n| 1 |   |\n| 2 | 3 | 4 |';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(500);
        const table = page.locator('#markdown-preview table');
        await expect(table).toBeVisible();
    });

    test('markdown with only whitespace does not crash', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.locator('#markdown-editor').fill('   \n\n   \t\n');
        await page.waitForTimeout(500);
        expect(errors).toEqual([]);
    });

    // ── View mode content preservation ────────────────────────────────

    test('content survives editor → preview → split round-trip', async ({ page }) => {
        const content = '# Persistence Test\n\nKeep this content.';
        await page.locator('#markdown-editor').fill(content);
        await page.waitForTimeout(500);

        // editor → preview
        await page.evaluate(() => window.MDView.setViewMode('preview'));
        await page.waitForTimeout(300);

        // preview → editor
        await page.evaluate(() => window.MDView.setViewMode('editor'));
        await page.waitForTimeout(300);

        // editor → split
        await page.evaluate(() => window.MDView.setViewMode('split'));
        await page.waitForTimeout(300);

        const value = await page.locator('#markdown-editor').inputValue();
        expect(value).toContain('Persistence Test');
        expect(value).toContain('Keep this content.');
    });

    // ── Autosave ──────────────────────────────────────────────────────

    test('autosave content survives page reload', async ({ page }) => {
        const marker = `regression-reload-${Date.now()}`;
        await page.locator('#markdown-editor').fill(marker);
        // Wait for autosave
        await page.waitForTimeout(3000);

        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(1000);

        const value = await page.locator('#markdown-editor').inputValue();
        expect(value).toContain(marker);
    });

    // ── Emoji rendering ──────────────────────────────────────────────

    test('emoji shortcodes render correctly', async ({ page }) => {
        await page.locator('#markdown-editor').fill(':thumbsup: :heart: :fire:');
        await page.waitForTimeout(500);
        const preview = page.locator('#markdown-preview');
        await expect(preview).toContainText('👍', { timeout: 5000 });
        await expect(preview).toContainText('❤', { timeout: 5000 });
        await expect(preview).toContainText('🔥', { timeout: 5000 });
    });

    // ── Code block language ──────────────────────────────────────────

    test('code block gets correct language class', async ({ page }) => {
        await page.locator('#markdown-editor').fill('```python\nprint("hi")\n```');
        // Wait for highlight.js to process (may take longer than render)
        await page.waitForTimeout(1500);
        const hasLangClass = await page.evaluate(() => {
            const pre = document.querySelector('#markdown-preview pre');
            const code = document.querySelector('#markdown-preview code');
            const preClass = pre ? pre.className : '';
            const codeClass = code ? code.className : '';
            const combined = preClass + ' ' + codeClass;
            // highlight.js may apply class as "language-python", "python", or "hljs language-python"
            return combined.includes('python');
        });
        expect(hasLangClass).toBe(true);
    });

    // ── Export integrity ─────────────────────────────────────────────

    test('copy-markdown copies current editor content', async ({ page }) => {
        const content = '# Export Test\n\nContent to copy.';
        await page.locator('#markdown-editor').fill(content);
        await page.waitForTimeout(500);

        // Grant clipboard permissions
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.locator('#copy-markdown-button').click();
        await page.waitForTimeout(500);

        const clipboard = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboard).toContain('Export Test');
    });

    // ── Callout rendering ────────────────────────────────────────────

    test('GitHub-style callouts render for all types', async ({ page }) => {
        const md = [
            '> [!NOTE]', '> Note text', '',
            '> [!TIP]', '> Tip text', '',
            '> [!WARNING]', '> Warning text', '',
            '> [!CAUTION]', '> Caution text', '',
            '> [!IMPORTANT]', '> Important text',
        ].join('\n');
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(500);

        const preview = page.locator('#markdown-preview');
        await expect(preview.locator('.markdown-callout.callout-note')).toBeVisible({ timeout: 5000 });
        await expect(preview.locator('.markdown-callout.callout-tip')).toBeVisible({ timeout: 5000 });
        await expect(preview.locator('.markdown-callout.callout-warning')).toBeVisible({ timeout: 5000 });
        await expect(preview.locator('.markdown-callout.callout-caution')).toBeVisible({ timeout: 5000 });
        await expect(preview.locator('.markdown-callout.callout-important')).toBeVisible({ timeout: 5000 });
    });

    // ── Word count accuracy ──────────────────────────────────────────

    test('word count is accurate for multi-paragraph input', async ({ page }) => {
        await page.locator('#markdown-editor').fill('one two three\n\nfour five six seven');
        await page.waitForTimeout(600);
        const wordCount = await page.locator('#word-count').textContent();
        expect(wordCount).toContain('7');
    });
});
