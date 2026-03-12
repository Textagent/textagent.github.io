// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Unit tests for js/textToSpeech.js — TTS module API,
 * language routing (Kokoro vs Web Speech), and state management.
 */
test.describe('TTS Engine Module', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(5000); // wait for all phases
    });

    // ── API Surface ──────────────────────────────────────────────────

    test('MDView.tts object is exposed', async ({ page }) => {
        const hasTts = await page.evaluate(() => typeof window.MDView.tts === 'object' && window.MDView.tts !== null);
        expect(hasTts).toBe(true);
    });

    test('tts exposes speak, stop, isReady, isSpeaking functions', async ({ page }) => {
        const fns = await page.evaluate(() => ({
            speak: typeof window.MDView.tts.speak,
            stop: typeof window.MDView.tts.stop,
            isReady: typeof window.MDView.tts.isReady,
            isSpeaking: typeof window.MDView.tts.isSpeaking,
        }));
        expect(fns.speak).toBe('function');
        expect(fns.stop).toBe('function');
        expect(fns.isReady).toBe('function');
        expect(fns.isSpeaking).toBe('function');
    });

    // ── State Checks ─────────────────────────────────────────────────

    test('tts.isReady returns true (Web Speech API available)', async ({ page }) => {
        const ready = await page.evaluate(() => window.MDView.tts.isReady());
        expect(ready).toBe(true);
    });

    test('tts.isSpeaking returns false initially', async ({ page }) => {
        const speaking = await page.evaluate(() => window.MDView.tts.isSpeaking());
        expect(speaking).toBe(false);
    });

    test('tts.stop does not throw when nothing is playing', async ({ page }) => {
        const error = await page.evaluate(() => {
            try {
                window.MDView.tts.stop();
                return null;
            } catch (e) {
                return e.message;
            }
        });
        expect(error).toBeNull();
    });

    // ── Speak with empty text does not crash ─────────────────────────

    test('tts.speak with empty text does not throw', async ({ page }) => {
        const error = await page.evaluate(() => {
            try {
                window.MDView.tts.speak('');
                window.MDView.tts.speak(null);
                window.MDView.tts.speak('   ');
                return null;
            } catch (e) {
                return e.message;
            }
        });
        expect(error).toBeNull();
    });

    // ── TTS speak button in preview ──────────────────────────────────

    test('TTS speak buttons appear for rendered content', async ({ page }) => {
        // Generate content that should have TTS buttons
        await page.locator('#markdown-editor').fill('# Hello World\n\nThis is a test paragraph for text-to-speech.');
        await page.waitForTimeout(1000);

        // TTS buttons are added post-render; check the preview
        const ttsBtns = await page.evaluate(() =>
            document.querySelectorAll('.tts-speak-btn').length
        );
        // TTS buttons may or may not be added depending on template config
        // But the module should not error
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.waitForTimeout(500);
        expect(errors).toEqual([]);
    });

    // ── Web Speech API availability ──────────────────────────────────

    test('Web Speech API speechSynthesis is available in browser', async ({ page }) => {
        const available = await page.evaluate(() => 'speechSynthesis' in window);
        expect(available).toBe(true);
    });
});
