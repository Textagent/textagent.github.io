// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Integration tests — video/embed markdown syntax renders
 * correctly in the preview panel through the full render pipeline.
 */
test.describe('Video & Embed Rendering Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);
    });

    test('embed code block renders embed grid in preview', async ({ page }) => {
        const md = '```embed cols=2 height=300\nhttps://github.com "GitHub"\nhttps://example.com "Example"\n```';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        const grid = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return null;
            const el = preview.querySelector('.embed-grid');
            if (!el) return null;
            return {
                cols: el.getAttribute('data-cols'),
                cellCount: el.querySelectorAll('.embed-cell').length,
            };
        });

        expect(grid).not.toBeNull();
        expect(grid.cols).toBe('2');
        expect(grid.cellCount).toBe(2);
    });

    test('embed grid with YouTube URL renders iframe', async ({ page }) => {
        const md = '```embed cols=1\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ "Test Video"\n```';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        const hasIframe = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return false;
            const grid = preview.querySelector('.embed-grid');
            if (!grid) return false;
            const iframe = grid.querySelector('iframe');
            return iframe && iframe.src.includes('youtube-nocookie.com');
        });
        expect(hasIframe).toBe(true);
    });

    test('video URL in markdown image syntax renders video player', async ({ page }) => {
        // The renderer should detect .mp4 URLs in image syntax
        const md = '![My Video](https://example.com/sample.mp4)';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        const result = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return { hasContainer: false, hasVideo: false };
            const container = preview.querySelector('.video-player-container');
            const video = preview.querySelector('video');
            return {
                hasContainer: !!container,
                hasVideo: !!video,
            };
        });
        // The renderer should convert it to a video player
        expect(result.hasContainer || result.hasVideo).toBe(true);
    });

    test('mixed embed types render together in grid', async ({ page }) => {
        const md = [
            '```embed cols=2 height=350',
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ "YouTube"',
            'https://github.com "GitHub"',
            '```',
        ].join('\n');

        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        const cells = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return [];
            const grid = preview.querySelector('.embed-grid');
            if (!grid) return [];
            return Array.from(grid.querySelectorAll('.embed-cell')).map(cell => {
                const iframe = cell.querySelector('iframe');
                const linkCard = cell.querySelector('.embed-link-card');
                return {
                    type: iframe ? 'iframe' : linkCard ? 'link-card' : 'other',
                };
            });
        });

        expect(cells.length).toBe(2);
        expect(cells[0].type).toBe('iframe');
        expect(cells[1].type).toBe('link-card');
    });

    test('embed code block with no valid URLs renders nothing', async ({ page }) => {
        const md = '```embed cols=2\n\n\n```';
        await page.locator('#markdown-editor').fill(md);
        await page.waitForTimeout(2000);

        const hasGrid = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            return preview ? !!preview.querySelector('.embed-grid') : false;
        });
        expect(hasGrid).toBe(false);
    });
});
