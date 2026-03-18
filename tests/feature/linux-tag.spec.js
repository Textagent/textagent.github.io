// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Linux Tag Tests
 *
 * Verifies parsing, config extraction, and rendering of {{Linux:}} tags.
 */
test.describe('Linux Tag ({{Linux:}})', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView &&
                w.MDView.parseLinuxBlocks &&
                w.MDView.parseLinuxConfig &&
                w.MDView.transformLinuxMarkdown;
        }, { timeout: 15000 });
    });

    // ═══════════════════════════════════════════
    // PARSING TESTS
    // ═══════════════════════════════════════════

    test('parseLinuxBlocks extracts Linux blocks from markdown', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '# Title\n\n{{Linux:\n  Packages: curl, vim\n}}\n\nText.';
            const blocks = /** @type {any} */ (window).MDView.parseLinuxBlocks(md);
            return {
                count: blocks.length,
                type: blocks[0]?.type,
            };
        });
        expect(result.count).toBe(1);
        expect(result.type).toBe('Linux');
    });

    test('parseLinuxConfig extracts Packages for terminal mode', async ({ page }) => {
        const result = await page.evaluate(() => {
            const prompt = 'Packages: curl, vim, htop';
            return /** @type {any} */ (window).MDView.parseLinuxConfig(prompt);
        });
        expect(result.packages).toContain('curl');
        expect(result.packages).toContain('vim');
        expect(result.packages).toContain('htop');
        expect(result.language).toBe('');
        expect(result.script).toBe('');
    });

    test('parseLinuxConfig extracts Language and Script for compile mode', async ({ page }) => {
        const result = await page.evaluate(() => {
            const prompt = 'Language: cpp\nScript: |\n    #include <iostream>\n    int main() {\n        std::cout << "Hi";\n        return 0;\n    }';
            return /** @type {any} */ (window).MDView.parseLinuxConfig(prompt);
        });
        expect(result.language).toBe('cpp');
        expect(result.script).toContain('#include');
        expect(result.script).toContain('int main()');
    });

    test('parseLinuxConfig extracts Stdin field', async ({ page }) => {
        const result = await page.evaluate(() => {
            const prompt = 'Language: python\nScript: |\n    x = input()\n    print(x)\nStdin: hello';
            return /** @type {any} */ (window).MDView.parseLinuxConfig(prompt);
        });
        expect(result.stdin).toBe('hello');
    });

    test('Linux blocks inside fenced code blocks are ignored', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '```\n{{Linux:\n  Packages: curl\n}}\n```';
            return /** @type {any} */ (window).MDView.parseLinuxBlocks(md).length;
        });
        expect(result).toBe(0);
    });

    // ═══════════════════════════════════════════
    // RENDERING TESTS
    // ═══════════════════════════════════════════

    test('terminal mode renders card with Launch button', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '{{Linux:\n  Packages: curl, vim\n}}';
            return /** @type {any} */ (window).MDView.transformLinuxMarkdown(md);
        });
        expect(result).toContain('linux-terminal-card');
        expect(result).toContain('Launch');
        expect(result).toContain('curl');
        expect(result).toContain('vim');
    });

    test('script mode renders card with language badge and Run button', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '{{Linux:\n  Language: cpp\n  Script: |\n    #include <iostream>\n    int main() { return 0; }\n}}';
            return /** @type {any} */ (window).MDView.transformLinuxMarkdown(md);
        });
        expect(result).toContain('linux-script-card');
        expect(result).toContain('C++');
        expect(result).toContain('▶ Run');
    });

    test('Linux cards render in preview', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Linux:\n  Packages: git\n}}');
        await page.waitForTimeout(800);

        const cardCount = await page.evaluate(() => {
            return document.querySelectorAll('#markdown-preview .linux-terminal-card').length;
        });
        expect(cardCount).toBe(1);
    });
});
