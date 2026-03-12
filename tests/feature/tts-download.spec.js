// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests for the TTS WAV download feature.
 * Verifies the downloadAudio/hasAudio API and the Save button on TTS cards.
 */
test.describe('TTS Download Feature', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(5000); // wait for all phases
    });

    // ── API Surface ──────────────────────────────────────────────

    test('tts.downloadAudio function is exposed', async ({ page }) => {
        const type = await page.evaluate(() => typeof window.MDView.tts.downloadAudio);
        expect(type).toBe('function');
    });

    test('tts.hasAudio function is exposed', async ({ page }) => {
        const type = await page.evaluate(() => typeof window.MDView.tts.hasAudio);
        expect(type).toBe('function');
    });

    // ── State Checks ─────────────────────────────────────────────

    test('tts.hasAudio returns false when nothing has been played', async ({ page }) => {
        const result = await page.evaluate(() => window.MDView.tts.hasAudio());
        expect(result).toBe(false);
    });

    test('tts.downloadAudio returns false when no audio is available', async ({ page }) => {
        const result = await page.evaluate(() => window.MDView.tts.downloadAudio());
        expect(result).toBe(false);
    });

    // ── TTS Card Save Button ─────────────────────────────────────

    test('TTS card renders ⬇ Save button', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@TTS:\n  @prompt: Hello world\n  @lang: English\n}}');
        await page.waitForTimeout(2000);

        const hasDownloadBtn = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return false;
            return !!preview.querySelector('.ai-tts-download');
        });
        expect(hasDownloadBtn).toBe(true);
    });

    test('TTS download button has correct title', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@TTS:\n  @prompt: Hello world\n  @lang: English\n}}');
        await page.waitForTimeout(2000);

        const title = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return '';
            const btn = preview.querySelector('.ai-tts-download');
            return btn ? btn.getAttribute('title') : '';
        });
        expect(title).toBe('Download audio as WAV');
    });
});
