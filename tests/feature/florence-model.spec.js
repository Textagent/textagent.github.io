// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests for Florence-2 model registry entry.
 * Verifies the model configuration in AI_MODELS.
 */
test.describe('Florence-2 Model Registry', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);
    });

    test('AI_MODELS contains florence-2 entry', async ({ page }) => {
        const exists = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return 'florence-2' in models;
        });
        expect(exists).toBe(true);
    });

    test('florence-2 is marked as local model', async ({ page }) => {
        const isLocal = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['florence-2'] ? models['florence-2'].isLocal : false;
        });
        expect(isLocal).toBe(true);
    });

    test('florence-2 is marked as doc model', async ({ page }) => {
        const isDocModel = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['florence-2'] ? models['florence-2'].isDocModel : false;
        });
        expect(isDocModel).toBe(true);
    });

    test('florence-2 localModelId points to textagent org', async ({ page }) => {
        const modelId = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['florence-2'] ? models['florence-2'].localModelId : '';
        });
        expect(modelId).toBe('textagent/Florence-2-base-ft');
    });

    test('florence-2 workerFile is ai-worker-florence.js', async ({ page }) => {
        const workerFile = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['florence-2'] ? models['florence-2'].workerFile : '';
        });
        expect(workerFile).toBe('ai-worker-florence.js');
    });

    test('florence-2 has downloadSize defined', async ({ page }) => {
        const size = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['florence-2'] ? models['florence-2'].downloadSize : '';
        });
        expect(size).toBeTruthy();
        expect(size).toContain('MB');
    });
});
