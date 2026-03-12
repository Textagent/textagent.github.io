// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests for the {{@STT:...}} Speech-to-Text tag block.
 * Verifies toolbar button, tag insertion, card rendering, and UI controls.
 */
test.describe('STT Tag Block', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView && w.MDView.currentViewMode === 'split';
        });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView &&
                w.MDView.formattingActions &&
                w.MDView.formattingActions['stt-tag'];
        });
        await page.locator('#markdown-editor').fill('');
        await page.waitForTimeout(200);
    });

    // ── Toolbar Button ──────────────────────────────────────────

    test('STT toolbar button exists', async ({ page }) => {
        const btn = page.locator('.fmt-btn[data-action="stt-tag"]');
        const exists = await btn.count();
        expect(exists).toBeGreaterThan(0);
    });

    test('STT toolbar button has correct label text', async ({ page }) => {
        const btn = page.locator('.fmt-btn[data-action="stt-tag"]');
        const text = await btn.textContent();
        expect(text).toContain('STT');
    });

    // ── Tag Insertion ───────────────────────────────────────────

    test('clicking STT button inserts {{@STT: ...}} once', async ({ page }) => {
        await page.locator('#markdown-editor').click();
        await page.waitForTimeout(100);

        const btn = page.locator('.fmt-btn[data-action="stt-tag"]');
        const isVisible = await btn.isVisible();
        if (!isVisible) {
            const overflow = page.locator('.fmt-group-overflow:has(.fmt-btn[data-action="stt-tag"])');
            await overflow.locator('.fmt-group-more-btn').click();
            await page.waitForTimeout(100);
        }
        await btn.click();
        await page.waitForTimeout(200);

        const val = await page.locator('#markdown-editor').inputValue();
        expect(val).toContain('{{@STT:');
        expect(val).toContain('}}');
        const count = (val.match(/\{\{@?STT:/g) || []).length;
        expect(count).toBe(1);
    });

    // ── Card Rendering ──────────────────────────────────────────

    test('STT card renders in preview', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@STT:\n  @lang: en-US\n}}');
        await page.waitForTimeout(2000);

        const card = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            return preview ? !!preview.querySelector('.ai-stt-card') : false;
        });
        expect(card).toBe(true);
    });

    test('STT card has engine selector with 3 options', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@STT:\n  @lang: en-US\n}}');
        await page.waitForTimeout(2000);

        const optionCount = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return 0;
            const select = preview.querySelector('.ai-stt-engine-select');
            return select ? select.querySelectorAll('option').length : 0;
        });
        expect(optionCount).toBe(3);
    });

    test('STT card engine options include whisper, voxtral, webspeech', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@STT:\n  @lang: en-US\n}}');
        await page.waitForTimeout(2000);

        const values = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return [];
            const select = preview.querySelector('.ai-stt-engine-select');
            if (!select) return [];
            return Array.from(select.querySelectorAll('option')).map(o => o.value);
        });
        expect(values).toContain('whisper');
        expect(values).toContain('voxtral');
        expect(values).toContain('webspeech');
    });

    test('STT card has language selector with expected languages', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@STT:\n  @lang: en-US\n}}');
        await page.waitForTimeout(2000);

        const langs = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return [];
            const select = preview.querySelector('.ai-stt-lang-select');
            if (!select) return [];
            return Array.from(select.querySelectorAll('option')).map(o => o.value);
        });
        expect(langs).toContain('en-US');
        expect(langs).toContain('ja-JP');
        expect(langs).toContain('ko-KR');
        expect(langs).toContain('fr-FR');
        expect(langs.length).toBeGreaterThanOrEqual(10);
    });

    test('STT card has record button visible and stop hidden', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@STT:\n  @lang: en-US\n}}');
        await page.waitForTimeout(2000);

        const state = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return { record: false, stop: false };
            const record = preview.querySelector('.ai-stt-record');
            const stop = preview.querySelector('.ai-stt-stop');
            return {
                record: record ? record.offsetParent !== null || getComputedStyle(record).display !== 'none' : false,
                stop: stop ? getComputedStyle(stop).display === 'none' : false,
            };
        });
        expect(state.record).toBe(true);
        expect(state.stop).toBe(true);
    });

    test('STT card has remove button', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@STT:\n  @lang: en-US\n}}');
        await page.waitForTimeout(2000);

        const hasRemove = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return false;
            const card = preview.querySelector('.ai-stt-card');
            return card ? !!card.querySelector('.ai-remove-tag') : false;
        });
        expect(hasRemove).toBe(true);
    });

    // ── @lang parsing ───────────────────────────────────────────

    test('STT card respects @lang field', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@STT:\n  @lang: ja-JP\n}}');
        await page.waitForTimeout(2000);

        const selectedLang = await page.evaluate(() => {
            const preview = document.getElementById('markdown-preview');
            if (!preview) return '';
            const card = preview.querySelector('.ai-stt-card');
            return card ? card.getAttribute('data-stt-lang') : '';
        });
        expect(selectedLang).toBe('ja-JP');
    });

    // ── No page errors ──────────────────────────────────────────

    test('STT card renders without page errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.locator('#markdown-editor').fill('{{@STT:\n  @lang: en-US\n}}');
        await page.waitForTimeout(2000);

        expect(errors).toEqual([]);
    });
});
