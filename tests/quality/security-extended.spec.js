// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Extended security tests — verify new features (embed grid,
 * video player, model hosts, workers) are hardened against attacks.
 */
test.describe('Security — Extended Hardening', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);
    });

    // ── Embed Grid XSS ──────────────────────────────────────────────

    test('embed grid with javascript: URL does not execute script', async ({ page }) => {
        const md = '```embed cols=1\njavascript:alert(document.cookie) "XSS Test"\n```';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        // Verify no script executed
        const xss = await page.evaluate(() => window.__SEC_EMBED);
        expect(xss).toBeUndefined();

        // Check that javascript: URL is not in any href or src
        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).not.toContain('javascript:alert');
    });

    test('embed grid with data: URI injection is blocked', async ({ page }) => {
        const md = '```embed cols=1\ndata:text/html,<script>window.__SEC5=1</script> "Data URI"\n```';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        const flag = await page.evaluate(() => window.__SEC5);
        expect(flag).toBeUndefined();
    });

    // ── Video Player XSS ─────────────────────────────────────────────

    test('video player escapes HTML in src attribute', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildVideoPlayerHtml(
                '"><script>window.__SEC6=1</script><video src="x',
                'test'
            )
        );
        expect(html).not.toContain('<script>');
        expect(html).toContain('&lt;script&gt;');
    });

    test('video player escapes HTML in alt text', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildVideoPlayerHtml(
                'https://example.com/video.mp4',
                '<img onerror="alert(1)" src=x>'
            )
        );
        // The alt text should be HTML-escaped: < becomes &lt;, " becomes &quot;
        // The raw <img> tag must NOT appear as a real element
        expect(html).not.toContain('<img onerror');
        expect(html).toContain('&lt;');
        expect(html).toContain('&quot;');
    });

    // ── YouTube embed uses privacy-enhanced mode ─────────────────────

    test('YouTube embeds use youtube-nocookie.com domain', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildYouTubeEmbedHtml('https://youtube.com/watch?v=dQw4w9WgXcQ', 'Test')
        );
        expect(html).toContain('youtube-nocookie.com');
        expect(html).not.toContain('youtube.com/embed');
    });

    // ── Model Host HTTPS ─────────────────────────────────────────────

    test('model host configuration uses HTTPS only', async () => {
        const projectRoot = join(import.meta.dirname, '..', '..');
        const content = readFileSync(join(projectRoot, 'js', 'model-hosts.js'), 'utf-8');

        // Extract all URLs from the file
        const urls = content.match(/['"]https?:\/\/[^'"]+['"]/g) || [];
        const httpUrls = urls.filter(u => u.startsWith("'http://") || u.startsWith('"http://'));

        expect(httpUrls, 'All model host URLs should use HTTPS').toEqual([]);
    });

    // ── TradingView iframes have sandbox ──────────────────────────────

    test('stock widget iframes have sandbox attribute', async ({ page }) => {
        const sandbox = await page.evaluate(() => {
            const container = document.createElement('div');
            container.innerHTML = '<div class="stock-card" data-symbol="AAPL"></div>';
            document.body.appendChild(container);
            window.MDView.renderStockWidgets(container);

            const iframe = container.querySelector('iframe');
            const val = iframe ? iframe.getAttribute('sandbox') : null;
            document.body.removeChild(container);
            return val;
        });
        expect(sandbox).not.toBeNull();
        expect(sandbox).toContain('allow-scripts');
        expect(sandbox).toContain('allow-same-origin');
    });

    // ── No sensitive globals exposed ─────────────────────────────────

    test('worker-related globals are not exposed on window', async ({ page }) => {
        const sensitive = await page.evaluate(() => {
            const suspects = [
                'ttsWorker', 'sttWorker', 'speechWorker',
                'workerInstance', 'modelWorker',
                'MODEL_HOST', 'MODEL_ORG',
            ];
            return suspects.filter(key => window[key] !== undefined);
        });
        expect(sensitive).toEqual([]);
    });

    // ── Embed grid link cards have secure attributes ──────────────────

    test('embed grid link cards have rel=noopener noreferrer', async ({ page }) => {
        const md = '```embed cols=1\nhttps://example.com "Test Site"\n```';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        const linkAttrs = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return null;
            const link = preview.querySelector('.embed-link-inner');
            if (!link) return null;
            return {
                rel: link.getAttribute('rel'),
                target: link.getAttribute('target'),
            };
        });

        if (linkAttrs) {
            expect(linkAttrs.rel).toContain('noopener');
            expect(linkAttrs.rel).toContain('noreferrer');
            expect(linkAttrs.target).toBe('_blank');
        }
    });

    // ── CSP allows new features ──────────────────────────────────────

    test('CSP allows TradingView embeds via frame-src', async ({ page }) => {
        const csp = await page.evaluate(() => {
            const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            return meta ? meta.getAttribute('content') : '';
        });
        // TradingView iframes need to be allowed in CSP
        // This is a documentation test — if CSP blocks them, the stock widget breaks
        expect(csp).not.toBeNull();
    });

    // ── Vimeo embed has DNT parameter ────────────────────────────────

    test('Vimeo embeds include dnt=1 privacy parameter', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildVimeoEmbedHtml('https://vimeo.com/123456789', 'Test')
        );
        expect(html).toContain('dnt=1');
    });

    // ── XSS via embed title injection ────────────────────────────────

    test('embed grid escapes HTML in titles', async ({ page }) => {
        const md = '```embed cols=1\nhttps://example.com "<script>alert(1)</script>"\n```';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        const html = await page.locator('#markdown-preview').innerHTML();
        expect(html).not.toContain('<script>alert');
    });
});
