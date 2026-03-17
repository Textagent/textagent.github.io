// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests for GLM-OCR model registry entry.
 * Verifies the model configuration in AI_MODELS.
 */
test.describe('GLM-OCR Model Registry', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);
    });

    test('AI_MODELS contains glm-ocr entry', async ({ page }) => {
        const exists = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return 'glm-ocr' in models;
        });
        expect(exists).toBe(true);
    });

    test('glm-ocr is marked as local model', async ({ page }) => {
        const isLocal = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['glm-ocr'] ? models['glm-ocr'].isLocal : false;
        });
        expect(isLocal).toBe(true);
    });

    test('glm-ocr is marked as doc model', async ({ page }) => {
        const isDocModel = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['glm-ocr'] ? models['glm-ocr'].isDocModel : false;
        });
        expect(isDocModel).toBe(true);
    });

    test('glm-ocr localModelId points to textagent org', async ({ page }) => {
        const modelId = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['glm-ocr'] ? models['glm-ocr'].localModelId : '';
        });
        expect(modelId).toBe('textagent/GLM-OCR-ONNX');
    });

    test('glm-ocr workerFile is ai-worker-glm-ocr.js', async ({ page }) => {
        const workerFile = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['glm-ocr'] ? models['glm-ocr'].workerFile : '';
        });
        expect(workerFile).toBe('ai-worker-glm-ocr.js');
    });

    test('glm-ocr has downloadSize defined', async ({ page }) => {
        const size = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['glm-ocr'] ? models['glm-ocr'].downloadSize : '';
        });
        expect(size).toBeTruthy();
        expect(size).toContain('MB');
    });

    test('glm-ocr requires WebGPU', async ({ page }) => {
        const requiresWebGPU = await page.evaluate(() => {
            const models = window.AI_MODELS || {};
            return models['glm-ocr'] ? models['glm-ocr'].requiresWebGPU : false;
        });
        expect(requiresWebGPU).toBe(true);
    });
});
