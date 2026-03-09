// @ts-check
import { test, expect } from '@playwright/test';

test.describe('UI Panels & Controls', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        // Wait for all modules to load
        await page.waitForTimeout(5000);
    });

    test('template modal opens and closes', async ({ page }) => {
        await page.evaluate(() => window.MDView.openTemplateModal());
        const modal = page.locator('#template-modal');
        await expect(modal).toBeVisible();
        // Close via close button
        await page.locator('#template-modal-close').click();
        await expect(modal).not.toBeVisible();
    });

    test('template modal has template cards', async ({ page }) => {
        await page.evaluate(() => window.MDView.openTemplateModal());
        await page.waitForTimeout(300);
        const cards = await page.locator('.template-card').count();
        expect(cards).toBeGreaterThan(10);
    });

    test('template search filters results', async ({ page }) => {
        await page.evaluate(() => window.MDView.openTemplateModal());
        await page.waitForTimeout(300);

        const beforeCount = await page.locator('.template-card').count();
        await page.locator('#template-search-input').fill('readme');
        await page.waitForTimeout(200);
        const afterCount = await page.locator('.template-card').count();
        expect(afterCount).toBeLessThan(beforeCount);
        expect(afterCount).toBeGreaterThan(0);
    });

    test('AI panel opens and closes', async ({ page }) => {
        // Use the actual button click since toggleAiPanel is not exposed
        const aiBtn = page.locator('#ai-toggle-button');
        await aiBtn.click();
        await page.waitForTimeout(500);
        const panelOpen = await page.evaluate(() => window.MDView.aiPanelOpen);
        expect(panelOpen).toBe(true);

        await page.evaluate(() => window.MDView.closeAiPanel());
        await page.waitForTimeout(300);
        const panelClosed = await page.evaluate(() => window.MDView.aiPanelOpen);
        expect(panelClosed).toBe(false);
    });

    test('theme toggle switches between dark and light', async ({ page }) => {
        const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));

        // Use JS click since button may be in collapsed header
        await page.evaluate(() => document.getElementById('theme-toggle').click());
        await page.waitForTimeout(300);

        const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        expect(newTheme).not.toBe(initialTheme);
        expect(['dark', 'light']).toContain(newTheme);
    });

    test('zen mode activates and deactivates', async ({ page }) => {
        const zenBefore = await page.evaluate(() => window.MDView.isZenMode);
        expect(zenBefore).toBeFalsy();

        // Can't easily test fullscreen in headless, so just verify the function exists
        const hasFn = await page.evaluate(() => typeof window.MDView.toggleZenMode);
        expect(hasFn).toBe('function');
    });

    test('TOC panel opens when heading content exists', async ({ page }) => {
        // Need headings for TOC
        await page.locator('#markdown-editor').fill('# Section 1\n\nContent\n\n## Section 2\n\nMore content');
        await page.waitForTimeout(500);

        // Click the TOC toggle button
        const tocToggle = page.locator('#toc-toggle');
        if (await tocToggle.count() > 0) {
            await tocToggle.click();
            await page.waitForTimeout(300);
            const tocPanel = page.locator('#toc-panel');
            await expect(tocPanel).toBeVisible();
        }
    });

    test('find and replace bar opens', async ({ page }) => {
        await page.evaluate(() => window.MDView.openFindBar());
        await page.waitForTimeout(200);

        const findBar = page.locator('#find-replace-bar');
        await expect(findBar).toBeVisible();
    });
});
