// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Unit tests for js/video-player.js — Video URL detection,
 * HTML builders, and embed grid rendering.
 */
test.describe('Video Player Module', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000); // wait for module loading
    });

    // ── URL Detection ────────────────────────────────────────────────

    test('isVideoUrl detects common video extensions', async ({ page }) => {
        const results = await page.evaluate(() => ({
            mp4: window.MDView.isVideoUrl('https://example.com/video.mp4'),
            webm: window.MDView.isVideoUrl('https://example.com/video.webm'),
            ogg: window.MDView.isVideoUrl('https://example.com/video.ogg'),
            mov: window.MDView.isVideoUrl('https://example.com/video.mov'),
            mkv: window.MDView.isVideoUrl('https://example.com/video.mkv'),
            queryStr: window.MDView.isVideoUrl('https://example.com/video.mp4?token=abc'),
            notVideo: window.MDView.isVideoUrl('https://example.com/image.png'),
            empty: window.MDView.isVideoUrl(''),
            nullVal: window.MDView.isVideoUrl(null),
        }));
        expect(results.mp4).toBe(true);
        expect(results.webm).toBe(true);
        expect(results.ogg).toBe(true);
        expect(results.mov).toBe(true);
        expect(results.mkv).toBe(true);
        expect(results.queryStr).toBe(true);
        expect(results.notVideo).toBe(false);
        expect(results.empty).toBe(false);
        expect(results.nullVal).toBe(false);
    });

    test('isYouTubeUrl matches YouTube URL formats', async ({ page }) => {
        const results = await page.evaluate(() => ({
            watch: window.MDView.isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
            embed: window.MDView.isYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ'),
            shorts: window.MDView.isYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ'),
            shortUrl: window.MDView.isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ'),
            notYt: window.MDView.isYouTubeUrl('https://vimeo.com/123456'),
            empty: window.MDView.isYouTubeUrl(''),
            nullVal: window.MDView.isYouTubeUrl(null),
        }));
        expect(results.watch).toBe(true);
        expect(results.embed).toBe(true);
        expect(results.shorts).toBe(true);
        expect(results.shortUrl).toBe(true);
        expect(results.notYt).toBe(false);
        expect(results.empty).toBe(false);
        expect(results.nullVal).toBe(false);
    });

    test('isVimeoUrl matches Vimeo URL format', async ({ page }) => {
        const results = await page.evaluate(() => ({
            vimeo: window.MDView.isVimeoUrl('https://vimeo.com/123456789'),
            notVimeo: window.MDView.isVimeoUrl('https://youtube.com/watch?v=abc'),
            empty: window.MDView.isVimeoUrl(''),
        }));
        expect(results.vimeo).toBe(true);
        expect(results.notVimeo).toBe(false);
        expect(results.empty).toBe(false);
    });

    // ── HTML Builders ────────────────────────────────────────────────

    test('buildVideoPlayerHtml returns valid video HTML', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildVideoPlayerHtml('https://example.com/test.mp4', 'Test Video')
        );
        expect(html).toContain('video-player-container');
        expect(html).toContain('<video');
        expect(html).toContain('controls');
        expect(html).toContain('test.mp4');
        expect(html).toContain('Test Video');
        expect(html).toContain('MP4');
    });

    test('buildYouTubeEmbedHtml returns privacy-enhanced iframe', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildYouTubeEmbedHtml('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'My Video')
        );
        expect(html).toContain('youtube-nocookie.com');
        expect(html).toContain('dQw4w9WgXcQ');
        expect(html).toContain('My Video');
        expect(html).toContain('YouTube');
        expect(html).toContain('iframe');
    });

    test('buildYouTubeEmbedHtml returns null for non-YouTube URL', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildYouTubeEmbedHtml('https://example.com/page', 'Title')
        );
        expect(html).toBeNull();
    });

    test('buildVimeoEmbedHtml returns Vimeo iframe', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildVimeoEmbedHtml('https://vimeo.com/123456789', 'Vimeo Clip')
        );
        expect(html).toContain('player.vimeo.com');
        expect(html).toContain('123456789');
        expect(html).toContain('Vimeo Clip');
        expect(html).toContain('Vimeo');
    });

    test('buildVimeoEmbedHtml returns null for non-Vimeo URL', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildVimeoEmbedHtml('https://example.com', 'Title')
        );
        expect(html).toBeNull();
    });

    // ── Embed Grid ───────────────────────────────────────────────────

    test('buildEmbedGridHtml parses cols and height parameters', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildEmbedGridHtml(
                'https://example.com "Example Site"',
                'cols=2 height=300'
            )
        );
        expect(html).toContain('embed-grid');
        expect(html).toContain('data-cols="2"');
        expect(html).toContain('repeat(2, 1fr)');
        expect(html).toContain('height:300px');
    });

    test('buildEmbedGridHtml clamps cols to 1–4 range', async ({ page }) => {
        const results = await page.evaluate(() => ({
            overMax: window.MDView.buildEmbedGridHtml('https://a.com\nhttps://b.com', 'cols=10'),
            underMin: window.MDView.buildEmbedGridHtml('https://a.com', 'cols=0'),
        }));
        expect(results.overMax).toContain('data-cols="4"');
        expect(results.underMin).toContain('data-cols="1"');
    });

    test('buildEmbedGridHtml returns empty for empty content', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildEmbedGridHtml('', 'cols=2')
        );
        expect(html).toBe('');
    });

    test('buildEmbedGridHtml handles YouTube URL in grid', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildEmbedGridHtml(
                'https://www.youtube.com/watch?v=dQw4w9WgXcQ "Rick Astley"',
                'cols=1'
            )
        );
        expect(html).toContain('youtube-nocookie.com');
        expect(html).toContain('Rick Astley');
    });

    test('buildEmbedGridHtml handles website URL with link card', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildEmbedGridHtml(
                'https://github.com "GitHub"',
                'cols=1'
            )
        );
        expect(html).toContain('embed-link-card');
        expect(html).toContain('GitHub');
        expect(html).toContain('github.com');
    });

    // ── HTML escaping ────────────────────────────────────────────────

    test('buildVideoPlayerHtml escapes HTML in src and alt', async ({ page }) => {
        const html = await page.evaluate(() =>
            window.MDView.buildVideoPlayerHtml(
                'https://example.com/vid.mp4?a=1&b=2',
                'Test <script>alert(1)</script>'
            )
        );
        expect(html).not.toContain('<script>');
        expect(html).toContain('&amp;');
    });
});
