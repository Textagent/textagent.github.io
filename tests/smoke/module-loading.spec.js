// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Module Loading', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        // Wait for all Phase 3 modules to finish loading
        await page.waitForTimeout(5000);
    });

    test('no page errors during module loading', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(5000);
        expect(errors).toEqual([]);
    });

    test('Phase 1 core functions are defined', async ({ page }) => {
        const check = await page.evaluate(() => ({
            MDView: typeof window.MDView,
            KEYS: typeof window.MDView.KEYS,
            PRODUCT: typeof window.MDView.PRODUCT,
            showToast: typeof window.MDView.showToast,
            renderMarkdown: typeof window.MDView.renderMarkdown,
        }));
        expect(check.MDView).toBe('object');
        expect(check.KEYS).toBe('object');
        expect(check.PRODUCT).toBe('object');
        expect(check.showToast).toBe('function');
        expect(check.renderMarkdown).toBe('function');
    });

    test('Phase 2 critical UI functions are defined', async ({ page }) => {
        const check = await page.evaluate(() => ({
            setViewMode: typeof window.MDView.setViewMode,
            importFile: typeof window.MDView.importFile,
            shareMarkdown: typeof window.MDView.shareMarkdown,
            openFindBar: typeof window.MDView.openFindBar,
            toggleSyncScrolling: typeof window.MDView.toggleSyncScrolling,
        }));
        expect(check.setViewMode).toBe('function');
        expect(check.importFile).toBe('function');
        expect(check.shareMarkdown).toBe('function');
        expect(check.openFindBar).toBe('function');
        expect(check.toggleSyncScrolling).toBe('function');
    });

    test('Phase 3 feature functions are defined', async ({ page }) => {
        const check = await page.evaluate(() => ({
            openTemplateModal: typeof window.MDView.openTemplateModal,
            openAiPanel: typeof window.MDView.openAiPanel,
            closeAiPanel: typeof window.MDView.closeAiPanel,
            attachDemoBadges: typeof window.MDView.attachDemoBadges,
            toggleZenMode: typeof window.MDView.toggleZenMode,
        }));
        expect(check.openTemplateModal).toBe('function');
        expect(check.openAiPanel).toBe('function');
        expect(check.closeAiPanel).toBe('function');
        expect(check.attachDemoBadges).toBe('function');
        expect(check.toggleZenMode).toBe('function');
    });

    test('AI_MODELS registry is populated', async ({ page }) => {
        const modelCount = await page.evaluate(() => Object.keys(window.AI_MODELS || {}).length);
        expect(modelCount).toBeGreaterThanOrEqual(5);
    });
});
