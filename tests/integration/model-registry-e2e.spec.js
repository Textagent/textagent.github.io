// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Integration tests — AI model registry completeness,
 * model host configuration, and cross-module integration.
 */
test.describe('Model Registry & Host Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(5000);
    });

    // ── AI_MODELS registry ───────────────────────────────────────────

    test('AI_MODELS registry contains STT models', async ({ page }) => {
        const hasStt = await page.evaluate(() => {
            const models = window.AI_MODELS;
            if (!models) return false;
            return Object.values(models).some(m =>
                m.isSttModel === true ||
                m.category === 'local-speech' && (m.label || '').toLowerCase().includes('stt')
            );
        });
        expect(hasStt).toBe(true);
    });

    test('AI_MODELS registry contains TTS models', async ({ page }) => {
        const hasTts = await page.evaluate(() => {
            const models = window.AI_MODELS;
            if (!models) return false;
            return Object.values(models).some(m =>
                m.isTtsModel === true ||
                (m.label || '').toLowerCase().includes('tts') ||
                (m.label || '').toLowerCase().includes('kokoro')
            );
        });
        expect(hasTts).toBe(true);
    });

    test('AI_MODELS registry contains LLM models', async ({ page }) => {
        const hasLlm = await page.evaluate(() => {
            const models = window.AI_MODELS;
            if (!models) return false;
            return Object.values(models).some(m =>
                m.category === 'local-multimodal' ||
                m.category === 'local-thinking' ||
                m.category === 'cloud-text' ||
                (m.label || '').toLowerCase().includes('qwen')
            );
        });
        expect(hasLlm).toBe(true);
    });

    test('each AI_MODELS entry has required label field', async ({ page }) => {
        const invalid = await page.evaluate(() => {
            const models = window.AI_MODELS;
            if (!models) return ['AI_MODELS not found'];
            const issues = [];
            for (const [key, model] of Object.entries(models)) {
                if (!model.label) issues.push(`${key}: missing label`);
                if (!model.category) issues.push(`${key}: missing category`);
            }
            return issues;
        });
        if (invalid.length > 0) {
            console.warn('Model registry issues:', invalid);
        }
        expect(invalid.length).toBe(0);
    });

    // ── Model count ──────────────────────────────────────────────────

    test('AI_MODELS has at least 8 models registered', async ({ page }) => {
        const count = await page.evaluate(() =>
            Object.keys(window.AI_MODELS || {}).length
        );
        expect(count).toBeGreaterThanOrEqual(8);
    });

    // ── Model categories ─────────────────────────────────────────────

    test('AI_MODELS has models in local and cloud categories', async ({ page }) => {
        const categories = await page.evaluate(() => {
            const models = window.AI_MODELS;
            if (!models) return [];
            const cats = new Set();
            Object.values(models).forEach(m => {
                if (m.category) cats.add(m.category);
            });
            return Array.from(cats);
        });
        // Should have both local and cloud categories
        const hasLocal = categories.some(c => c.startsWith('local'));
        const hasCloud = categories.some(c => c.startsWith('cloud'));
        expect(hasLocal).toBe(true);
        expect(hasCloud).toBe(true);
    });

    // ── AI Panel integration ─────────────────────────────────────────

    test('AI panel open/close functions exist', async ({ page }) => {
        const fns = await page.evaluate(() => ({
            open: typeof window.MDView.openAiPanel,
            close: typeof window.MDView.closeAiPanel,
        }));
        expect(fns.open).toBe('function');
        expect(fns.close).toBe('function');
    });

    test('AI panel element exists in DOM', async ({ page }) => {
        const exists = await page.evaluate(() =>
            !!document.getElementById('ai-panel')
        );
        expect(exists).toBe(true);
    });
});
