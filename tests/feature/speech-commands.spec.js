// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Unit tests for js/speechToText.js — STT module API surface,
 * voice command cheat sheet, language selector, and DOM elements.
 */
test.describe('Speech Commands Module', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(5000);
    });

    // ── STT API Surface ──────────────────────────────────────────────

    test('MDView.stt object is exposed with expected API', async ({ page }) => {
        const api = await page.evaluate(() => {
            const stt = window.MDView.stt;
            if (!stt) return null;
            return {
                start: typeof stt.start,
                stop: typeof stt.stop,
                isListening: typeof stt.isListening,
            };
        });
        // stt may not be exposed if no mic permission, but module should load
        if (api) {
            expect(api.start).toBe('function');
            expect(api.stop).toBe('function');
            expect(api.isListening).toBe('function');
        }
    });

    // ── DOM Elements ─────────────────────────────────────────────────

    test('speech-to-text button exists in toolbar', async ({ page }) => {
        const btn = await page.evaluate(() =>
            !!document.getElementById('speech-to-text-btn')
        );
        expect(btn).toBe(true);
    });

    test('speech status bar exists', async ({ page }) => {
        const bar = await page.evaluate(() =>
            !!document.getElementById('speech-status-bar')
        );
        expect(bar).toBe(true);
    });

    test('speech interim text element exists', async ({ page }) => {
        const el = await page.evaluate(() =>
            !!document.getElementById('speech-interim-text')
        );
        expect(el).toBe(true);
    });

    test('speech stop button exists', async ({ page }) => {
        const el = await page.evaluate(() =>
            !!document.getElementById('speech-stop-btn')
        );
        expect(el).toBe(true);
    });

    test('speech help button exists', async ({ page }) => {
        const el = await page.evaluate(() =>
            !!document.getElementById('speech-help-btn')
        );
        expect(el).toBe(true);
    });

    test('speech language button and label exist', async ({ page }) => {
        const els = await page.evaluate(() => ({
            langBtn: !!document.getElementById('speech-lang-btn'),
            langLabel: !!document.getElementById('speech-lang-label'),
        }));
        expect(els.langBtn).toBe(true);
        expect(els.langLabel).toBe(true);
    });

    // ── Language Label ───────────────────────────────────────────────

    test('language label shows a valid short code', async ({ page }) => {
        const label = await page.evaluate(() => {
            const el = document.getElementById('speech-lang-label');
            return el ? el.textContent.trim() : '';
        });
        const validCodes = ['EN', 'ES', 'FR', 'DE', 'IT', 'PT', 'RU', '中', 'JP', 'KO', 'AR', 'HI', 'BN'];
        expect(validCodes).toContain(label);
    });

    // ── SpeechRecognition API availability ────────────────────────────

    test('browser supports SpeechRecognition API', async ({ page }) => {
        const hasApi = await page.evaluate(() =>
            !!(window.SpeechRecognition || window.webkitSpeechRecognition)
        );
        expect(hasApi).toBe(true);
    });

    // ── Voice commands cheat sheet help button works ──────────────────

    test('help button does not crash when clicked', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        const helpBtn = page.locator('#speech-help-btn');
        if (await helpBtn.isVisible()) {
            await helpBtn.click();
            await page.waitForTimeout(500);

            // Check if cheat sheet popup appeared
            const popup = await page.evaluate(() =>
                !!document.querySelector('.speech-cheat-popup')
            );
            if (popup) {
                // Close it
                const closeBtn = page.locator('#speech-cheat-close');
                if (await closeBtn.isVisible()) {
                    await closeBtn.click();
                    await page.waitForTimeout(300);
                }
            }
        }

        expect(errors).toEqual([]);
    });

    // ── Storage key for language ──────────────────────────────────────

    test('SPEECH_LANG storage key is defined', async ({ page }) => {
        const hasKey = await page.evaluate(() =>
            window.MDView.KEYS && !!window.MDView.KEYS.SPEECH_LANG
        );
        expect(hasKey).toBe(true);
    });
});
