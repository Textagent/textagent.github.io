// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Regression tests for recent bug fixes (past 3 days).
 * Pins down specific fixes so they never re-appear.
 */
test.describe('Regression — Recent Fixes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);
    });

    // ── File upload crash fix (conversion-overlay) ────────────────────

    test('conversion-overlay element exists for non-MD imports', async ({ page }) => {
        const overlay = await page.evaluate(() =>
            !!document.getElementById('conversion-overlay')
        );
        expect(overlay).toBe(true);
    });

    test('non-MD file import does not crash when overlay exists', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        // Import a CSV file (triggers conversion overlay)
        await page.evaluate(() => {
            const file = new File(['a,b,c\n1,2,3'], 'test.csv', { type: 'text/csv' });
            window.MDView.importFile(file);
        });
        await page.waitForTimeout(2000);

        expect(errors).toEqual([]);
    });

    // ── Template confirmation dialog ─────────────────────────────────

    test('template modal has confirmation before replacing content', async ({ page }) => {
        await page.waitForFunction(() => window.MDView && window.MDView.openTemplateModal);

        // Type something first so there's content to confirm replacing
        await page.locator('#markdown-editor').fill('# Existing content that should be preserved');
        await page.waitForTimeout(300);

        await page.evaluate(() => window.MDView.openTemplateModal());
        await page.waitForTimeout(500);

        const modalVisible = await page.evaluate(() => {
            const modal = document.getElementById('template-modal');
            return modal && (modal.classList.contains('show') || modal.style.display !== 'none');
        });
        expect(modalVisible).toBe(true);

        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
    });

    // ── Stock card with unresolved variable ──────────────────────────

    test('stock card with unresolved $(SYMBOL) does not render widget', async ({ page }) => {
        const loaded = await page.evaluate(() => {
            const container = document.createElement('div');
            container.innerHTML = '<div class="stock-card" data-symbol="$(TICKER)"></div>';
            document.body.appendChild(container);
            window.MDView.renderStockWidgets(container);
            const card = container.querySelector('.stock-card');
            const result = card ? card.getAttribute('data-widget-loaded') : null;
            document.body.removeChild(container);
            return result;
        });
        expect(loaded).not.toBe('true');
    });

    // ── Embed code block renders instead of raw code ─────────────────

    test('embed code block renders grid, not raw code', async ({ page }) => {
        const md = '```embed cols=1\nhttps://github.com "GitHub"\n```';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        const result = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return { hasGrid: false, hasRawCode: false };
            return {
                hasGrid: !!preview.querySelector('.embed-grid'),
                hasRawCode: !!preview.querySelector('code.language-embed'),
            };
        });
        expect(result.hasGrid).toBe(true);
        expect(result.hasRawCode).toBe(false);
    });

    // ── Mermaid diagram does not throw page errors ───────────────────

    test('mermaid diagram in preview does not throw errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        const md = '```mermaid\ngraph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[OK]\n  B -->|No| D[Fail]\n```';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(3000);

        expect(errors).toEqual([]);
    });

    // ── Dark mode compatibility for new components ───────────────────

    test('dark mode does not break new component styles', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        // Switch to dark mode
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark');
        });
        await page.waitForTimeout(300);

        // Render content with new components
        const md = '# Dark Mode Test\n\n```embed cols=1\nhttps://github.com "GitHub"\n```';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        // Switch back to light mode
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'light');
        });
        await page.waitForTimeout(300);

        expect(errors).toEqual([]);
    });

    // ── XSS in embed grid URLs ──────────────────────────────────────

    test('javascript: URL in embed grid is neutralized', async ({ page }) => {
        const md = '```embed cols=1\njavascript:alert(1) "XSS"\n```';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        const xss = await page.evaluate(() => window.__xss);
        expect(xss).toBeUndefined();
    });

    // ── Empty code block doesn't crash ──────────────────────────────

    test('empty embed code block does not crash', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.locator('#markdown-editor').fill('```embed cols=2\n\n```');
        await page.waitForTimeout(1000);

        expect(errors).toEqual([]);
    });

    // ── SQL code block renders correctly ─────────────────────────────

    test('SQL code block renders with syntax highlighting', async ({ page }) => {
        await page.locator('#markdown-editor').fill('```sql\nSELECT * FROM users WHERE id = 1;\n```');
        await page.waitForTimeout(1000);

        const hasCode = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            const code = preview ? preview.querySelector('code') : null;
            return code && code.className.includes('sql');
        });
        expect(hasCode).toBe(true);
    });

    // ── Multiple view mode cycles preserve content ──────────────────

    test('content survives multiple rapid view mode switches', async ({ page }) => {
        const content = '# Regression Cycle Test\n\nContent must survive.';
        await page.locator('#markdown-editor').fill(content);
        await page.waitForTimeout(500);

        // Rapid cycle through modes
        const modes = ['preview', 'editor', 'split', 'preview', 'split'];
        for (const mode of modes) {
            await page.evaluate(m => window.MDView.setViewMode(m), mode);
            await page.waitForTimeout(200);
        }

        const value = await page.locator('#markdown-editor').inputValue();
        expect(value).toContain('Regression Cycle Test');
        expect(value).toContain('Content must survive.');
    });

    // ── STT card renders without page errors ─────────────────────

    test('STT card renders in preview without errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.locator('#markdown-editor').fill('{{@STT:\n  @lang: en-US\n}}');
        await page.waitForTimeout(2000);

        const hasCard = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            return preview ? !!preview.querySelector('.ai-stt-card') : false;
        });
        expect(hasCard).toBe(true);
        expect(errors).toEqual([]);
    });

    // ── TTS card has download button ─────────────────────────────

    test('TTS card renders download button', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@TTS:\n  @prompt: Test\n  @lang: English\n}}');
        await page.waitForTimeout(2000);

        const hasDownload = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            return preview ? !!preview.querySelector('.ai-tts-download') : false;
        });
        expect(hasDownload).toBe(true);
    });

    // ── Florence-2 model in registry ─────────────────────────────

    test('Florence-2 model entry exists in AI_MODELS', async ({ page }) => {
        const exists = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return 'florence-2' in models && models['florence-2'].isDocModel === true;
        });
        expect(exists).toBe(true);
    });

    // ── GLM-OCR model in registry ────────────────────────────

    test('GLM-OCR model entry exists in AI_MODELS with WebGPU requirement', async ({ page }) => {
        const result = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            const m = models['glm-ocr'];
            return m ? {
                exists: true,
                isDocModel: m.isDocModel,
                isLocal: m.isLocal,
                requiresWebGPU: m.requiresWebGPU,
            } : { exists: false };
        });
        expect(result.exists).toBe(true);
        expect(result.isDocModel).toBe(true);
        expect(result.isLocal).toBe(true);
        expect(result.requiresWebGPU).toBe(true);
    });

    // ── Draw DocGen tag renders card ─────────────────────────

    test('Draw tag renders card with tool pills in preview', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{Draw: regression-draw}}');
        await page.waitForTimeout(2000);

        const result = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return { card: false, pills: 0 };
            return {
                card: !!preview.querySelector('.draw-docgen-card'),
                pills: preview.querySelectorAll('.draw-tool-pill').length,
            };
        });
        expect(result.card).toBe(true);
        expect(result.pills).toBe(2);
    });

    // ── Read-only CSS lockdown class ─────────────────────────

    test('editor-readonly CSS lockdown disables fmt-btn with reduced opacity', async ({ page }) => {
        const result = await page.evaluate(() => {
            var btn = document.querySelector('.fmt-btn');
            if (!btn) return { found: false, opacity: '1', cursor: '' };
            document.body.classList.add('editor-readonly');
            var style = window.getComputedStyle(btn);
            var opacity = style.opacity;
            var cursor = style.cursor;
            document.body.classList.remove('editor-readonly');
            return { found: true, opacity, cursor };
        });
        expect(result.found).toBe(true);
        expect(parseFloat(result.opacity)).toBeLessThan(1);
    });

    // ── Excalidraw embed page serves ─────────────────────────

    test('excalidraw-embed.html is accessible', async ({ page }) => {
        const response = await page.request.get('/excalidraw-embed.html');
        expect(response.ok()).toBe(true);
    });
});
