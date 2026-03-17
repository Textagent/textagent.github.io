// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests for Draw DocGen — {{Draw:}} tag rendering and interactions.
 * Covers tag parsing, card rendering, tool pills, Mermaid editor,
 * and Excalidraw/Mermaid UI toggle.
 */
test.describe('Draw DocGen — {{Draw:}} Tag', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        // Wait for Phase 3j draw-docgen lazy module to load
        await page.waitForFunction(
            () => window.MDView && typeof window.MDView.transformDrawMarkdown === 'function',
            { timeout: 15000 }
        );
    });

    // ── Module Loading ──────────────────────────────────────

    test('transformDrawMarkdown is registered on MDView', async ({ page }) => {
        const exists = await page.evaluate(() =>
            typeof window.MDView.transformDrawMarkdown === 'function'
        );
        expect(exists).toBe(true);
    });

    test('bindDrawPreviewActions is registered on MDView', async ({ page }) => {
        const exists = await page.evaluate(() =>
            typeof window.MDView.bindDrawPreviewActions === 'function'
        );
        expect(exists).toBe(true);
    });

    test('parseDrawBlocks is registered on MDView', async ({ page }) => {
        const exists = await page.evaluate(() =>
            typeof window.MDView.parseDrawBlocks === 'function'
        );
        expect(exists).toBe(true);
    });

    // ── Tag Parsing ─────────────────────────────────────────

    test('parseDrawBlocks returns correct block count', async ({ page }) => {
        const count = await page.evaluate(() => {
            const md = '{{Draw: diagram-1}}\n\nSome text\n\n{{Draw: diagram-2}}';
            return window.MDView.parseDrawBlocks(md).length;
        });
        expect(count).toBe(2);
    });

    test('parseDrawBlocks ignores Draw tags inside code fences', async ({ page }) => {
        const count = await page.evaluate(() => {
            const md = '```\n{{Draw: should-be-ignored}}\n```\n\n{{Draw: real-tag}}';
            return window.MDView.parseDrawBlocks(md).length;
        });
        expect(count).toBe(1);
    });

    test('parseDrawBlocks ignores Draw tags inside inline code', async ({ page }) => {
        const count = await page.evaluate(() => {
            const md = 'Use `{{Draw: inline}}` for diagrams\n\n{{Draw: real}}';
            return window.MDView.parseDrawBlocks(md).length;
        });
        expect(count).toBe(1);
    });

    // ── Card Rendering ──────────────────────────────────────

    test('Draw tag renders a .draw-docgen-card in preview', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: test-diagram}}');
        await page.waitForTimeout(2000);

        const hasCard = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            return preview ? !!preview.querySelector('.draw-docgen-card') : false;
        });
        expect(hasCard).toBe(true);
    });

    test('Draw card has tool pills for Excalidraw and Mermaid', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: tools-test}}');
        await page.waitForTimeout(2000);

        const pills = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return { count: 0, labels: [] };
            const btns = preview.querySelectorAll('.draw-tool-pill');
            return {
                count: btns.length,
                labels: Array.from(btns).map(b => b.textContent.trim()),
            };
        });
        expect(pills.count).toBe(2);
        expect(pills.labels).toContain('🎨 Excalidraw');
        expect(pills.labels).toContain('📊 Mermaid');
    });

    test('Draw card defaults to Excalidraw tool', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: default-tool}}');
        await page.waitForTimeout(2000);

        const tool = await page.evaluate(() => {
            const card = document.querySelector('.draw-docgen-card');
            return card ? card.dataset.drawTool : '';
        });
        expect(tool).toBe('excalidraw');
    });

    test('Draw card with @tool: mermaid defaults to Mermaid', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: mermaid-test\n  @tool: mermaid\n}}');
        await page.waitForTimeout(2000);

        const tool = await page.evaluate(() => {
            const card = document.querySelector('.draw-docgen-card');
            return card ? card.dataset.drawTool : '';
        });
        expect(tool).toBe('mermaid');
    });

    test('Draw card has Open button for Excalidraw', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: open-btn}}');
        await page.waitForTimeout(2000);

        const hasOpen = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            return preview ? !!preview.querySelector('.draw-docgen-open') : false;
        });
        expect(hasOpen).toBe(true);
    });

    test('Draw card has Remove button', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: remove-btn}}');
        await page.waitForTimeout(2000);

        const hasRemove = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            return preview ? !!preview.querySelector('.draw-docgen-remove') : false;
        });
        expect(hasRemove).toBe(true);
    });

    test('Draw card shows AI prompt section', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: hint-test}}');
        await page.waitForTimeout(2000);

        const hasPrompt = await page.evaluate(() => {
            const section = document.querySelector('.draw-ai-prompt-section');
            return section ? section.style.display !== 'none' : false;
        });
        expect(hasPrompt).toBe(true);
    });

    // ── Mermaid Editor ──────────────────────────────────────

    test('Mermaid mode shows textarea editor', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: mermaid-editor\n  @tool: mermaid\n}}');
        await page.waitForTimeout(2000);

        const hasTextarea = await page.evaluate(() => {
            const ta = document.querySelector('.draw-mermaid-input');
            return ta ? ta.tagName === 'TEXTAREA' : false;
        });
        expect(hasTextarea).toBe(true);
    });

    test('Mermaid editor has Render and Insert buttons', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: mermaid-btns\n  @tool: mermaid\n}}');
        await page.waitForTimeout(2000);

        const btns = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return { render: false, insert: false };
            return {
                render: !!preview.querySelector('.draw-mermaid-render'),
                insert: !!preview.querySelector('.draw-mermaid-insert'),
            };
        });
        expect(btns.render).toBe(true);
        expect(btns.insert).toBe(true);
    });

    test('Mermaid textarea has default content', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: mermaid-default\n  @tool: mermaid\n}}');
        await page.waitForTimeout(2000);

        const content = await page.evaluate(() => {
            const ta = document.querySelector('.draw-mermaid-input');
            return ta ? ta.value : '';
        });
        expect(content).toContain('graph TD');
    });

    // ── Multiple Cards ──────────────────────────────────────

    test('multiple Draw tags render separate cards', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: first}}\n\n{{Draw: second}}\n\n{{Draw: third}}');
        await page.waitForTimeout(2000);

        const count = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            return preview ? preview.querySelectorAll('.draw-docgen-card').length : 0;
        });
        expect(count).toBe(3);
    });

    // ── No page errors ──────────────────────────────────────

    test('Draw tag renders without page errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.locator('#markdown-editor').fill('{{Draw: no-errors}}');
        await page.waitForTimeout(2000);

        expect(errors).toEqual([]);
    });

    // ── Toolbar button ──────────────────────────────────────

    test('draw-tag toolbar action is registered', async ({ page }) => {
        const exists = await page.evaluate(() =>
            window.MDView.formattingActions && 'draw-tag' in window.MDView.formattingActions
        );
        expect(exists).toBe(true);
    });

    // ── AI Diagram Generation ───────────────────────────────

    test('Draw card contains AI prompt section', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: ai-test}}');
        await page.waitForTimeout(2000);

        const hasPromptSection = await page.evaluate(() => {
            const section = document.querySelector('.draw-ai-prompt-section');
            return section ? section.style.display !== 'none' : false;
        });
        expect(hasPromptSection).toBe(true);
    });

    test('Draw card AI prompt input is visible', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: ai-prompt}}');
        await page.waitForTimeout(2000);

        const promptInput = page.locator('.draw-ai-prompt-input');
        await expect(promptInput).toBeVisible();
        const placeholder = await promptInput.getAttribute('placeholder');
        expect(placeholder).toContain('Describe your diagram');
    });

    test('Draw card has AI Generate button', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: ai-btn}}');
        await page.waitForTimeout(2000);

        const genBtn = page.locator('.draw-ai-generate-btn');
        await expect(genBtn).toBeVisible();
        const text = await genBtn.textContent();
        expect(text).toContain('Generate');
    });

    test('Draw card has model selector dropdown', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: ai-model}}');
        await page.waitForTimeout(2000);

        const modelSelect = page.locator('.draw-ai-model-select');
        await expect(modelSelect).toBeVisible();
    });
});
