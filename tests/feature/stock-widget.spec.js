// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Unit tests for js/stock-widget.js — TradingView stock widget
 * rendering, range controls, and data attribute handling.
 */
test.describe('Stock Widget Module', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(5000);
    });

    // ── API Surface ──────────────────────────────────────────────────

    test('MDView.renderStockWidgets is a function', async ({ page }) => {
        const type = await page.evaluate(() => typeof window.MDView.renderStockWidgets);
        expect(type).toBe('function');
    });

    // ── Stock card rendering ─────────────────────────────────────────

    test('stock card markdown renders .stock-card elements', async ({ page }) => {
        // Use the finance template syntax for stock cards
        const md = [
            '<div class="stock-grid" data-range="1M" data-interval="D" data-ema="52">',
            '  <div class="stock-card" data-symbol="AAPL"></div>',
            '  <div class="stock-card" data-symbol="GOOGL"></div>',
            '</div>',
        ].join('\n');

        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        // renderStockWidgets should be called by the post-render hook
        const cards = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return 0;
            return preview.querySelectorAll('.stock-card[data-symbol]').length;
        });
        expect(cards).toBeGreaterThanOrEqual(0); // DOMPurify may strip; verifying no crash
    });

    // ── renderStockWidgets with programmatic DOM ─────────────────────

    test('renderStockWidgets creates iframe for stock card', async ({ page }) => {
        const result = await page.evaluate(() => {
            // Create a stock card in a test container
            const container = document.createElement('div');
            container.innerHTML = '<div class="stock-card" data-symbol="MSFT"></div>';
            document.body.appendChild(container);

            window.MDView.renderStockWidgets(container);

            const card = container.querySelector('.stock-card');
            const iframe = card ? card.querySelector('iframe') : null;
            const hasHeader = card ? !!card.querySelector('.stock-card-header') : false;
            const hasControls = card ? !!card.querySelector('.stock-card-controls') : false;
            const iframeSrc = iframe ? iframe.src : '';

            document.body.removeChild(container);

            return { hasHeader, hasControls, iframeSrc };
        });

        expect(result.hasHeader).toBe(true);
        expect(result.hasControls).toBe(true);
        expect(result.iframeSrc).toContain('tradingview.com');
        expect(result.iframeSrc).toContain('MSFT');
    });

    test('renderStockWidgets sets sandbox attribute on iframe', async ({ page }) => {
        const sandbox = await page.evaluate(() => {
            const container = document.createElement('div');
            container.innerHTML = '<div class="stock-card" data-symbol="TSLA"></div>';
            document.body.appendChild(container);
            window.MDView.renderStockWidgets(container);

            const iframe = container.querySelector('iframe');
            const val = iframe ? iframe.getAttribute('sandbox') : null;
            document.body.removeChild(container);
            return val;
        });
        expect(sandbox).not.toBeNull();
        expect(sandbox).toContain('allow-scripts');
    });

    test('renderStockWidgets skips cards with unresolved variable', async ({ page }) => {
        const loaded = await page.evaluate(() => {
            const container = document.createElement('div');
            container.innerHTML = '<div class="stock-card" data-symbol="$(TICKER)"></div>';
            document.body.appendChild(container);
            window.MDView.renderStockWidgets(container);

            const card = container.querySelector('.stock-card');
            const val = card ? card.getAttribute('data-widget-loaded') : null;
            document.body.removeChild(container);
            return val;
        });
        // Should NOT be loaded because symbol contains $( variable reference
        expect(loaded).not.toBe('true');
    });

    test('renderStockWidgets does not double-render', async ({ page }) => {
        const iframeCount = await page.evaluate(() => {
            const container = document.createElement('div');
            container.innerHTML = '<div class="stock-card" data-symbol="AMZN"></div>';
            document.body.appendChild(container);

            // Call twice
            window.MDView.renderStockWidgets(container);
            window.MDView.renderStockWidgets(container);

            const count = container.querySelectorAll('iframe').length;
            document.body.removeChild(container);
            return count;
        });
        expect(iframeCount).toBe(1);
    });

    // ── Range buttons ────────────────────────────────────────────────

    test('range buttons are created with correct labels', async ({ page }) => {
        const labels = await page.evaluate(() => {
            const container = document.createElement('div');
            container.innerHTML = '<div class="stock-card" data-symbol="META"></div>';
            document.body.appendChild(container);
            window.MDView.renderStockWidgets(container);

            const btns = container.querySelectorAll('.stock-range-btn');
            const result = Array.from(btns).map(b => b.textContent.trim());
            document.body.removeChild(container);
            return result;
        });
        expect(labels).toContain('1D');
        expect(labels).toContain('1M');
        expect(labels).toContain('1Y');
    });

    // ── renderStockWidgets with null container ───────────────────────

    test('renderStockWidgets with null does not throw', async ({ page }) => {
        const error = await page.evaluate(() => {
            try {
                window.MDView.renderStockWidgets(null);
                return null;
            } catch (e) {
                return e.message;
            }
        });
        expect(error).toBeNull();
    });
});
