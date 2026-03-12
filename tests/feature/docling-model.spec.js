// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests for Granite Docling model registry and worker configuration.
 * Verifies migration to textagent org and model config.
 */
test.describe('Docling Model Registry', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);
    });

    test('AI_MODELS contains granite-docling entry', async ({ page }) => {
        const exists = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return 'granite-docling' in models;
        });
        expect(exists).toBe(true);
    });

    test('granite-docling localModelId points to textagent org', async ({ page }) => {
        const modelId = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['granite-docling'] ? models['granite-docling'].localModelId : '';
        });
        expect(modelId).toBe('textagent/granite-docling-258M-ONNX');
    });

    test('granite-docling is marked as doc model', async ({ page }) => {
        const isDocModel = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['granite-docling'] ? models['granite-docling'].isDocModel : false;
        });
        expect(isDocModel).toBe(true);
    });

    test('granite-docling workerFile is ai-worker-docling.js', async ({ page }) => {
        const workerFile = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['granite-docling'] ? models['granite-docling'].workerFile : '';
        });
        expect(workerFile).toBe('ai-worker-docling.js');
    });

    test('granite-docling has isLocal set to true', async ({ page }) => {
        const isLocal = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['granite-docling'] ? models['granite-docling'].isLocal : false;
        });
        expect(isLocal).toBe(true);
    });
});
