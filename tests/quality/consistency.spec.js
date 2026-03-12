// @ts-check
import { test, expect } from '@playwright/test';

/**
 * UI & state consistency tests — ensure visual and functional
 * elements behave predictably across user interactions.
 */
test.describe('Quality — UI Consistency', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
    });

    test('dark mode toggle updates data-theme attribute', async ({ page }) => {
        // Toggle via JS since button may be hidden in headless viewport overflow
        const theme0 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        await page.evaluate(() => document.getElementById('theme-toggle').click());
        await page.waitForTimeout(300);

        const theme1 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        await page.evaluate(() => document.getElementById('theme-toggle').click());
        await page.waitForTimeout(300);

        const theme2 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        // The two clicks should have toggled between themes
        expect(theme1).not.toBe(theme0);
        expect(theme2).toBe(theme0);
    });

    test('theme persists in localStorage', async ({ page }) => {
        await page.evaluate(() => document.getElementById('theme-toggle').click());
        await page.waitForTimeout(300);

        const stored = await page.evaluate(() => {
            const K = window.MDView.KEYS;
            return localStorage.getItem(K.THEME);
        });
        expect(stored).not.toBeNull();
    });

    test('word count updates on every input', async ({ page }) => {
        const editor = page.locator('#markdown-editor');

        await editor.fill('one');
        await page.waitForTimeout(600);
        const count1 = await page.locator('#word-count').textContent();

        await editor.fill('one two three');
        await page.waitForTimeout(600);
        const count2 = await page.locator('#word-count').textContent();

        // count2 should have more words than count1
        const n1 = parseInt(count1.match(/\d+/)?.[0] || '0');
        const n2 = parseInt(count2.match(/\d+/)?.[0] || '0');
        expect(n2).toBeGreaterThan(n1);
    });

    test('toolbar buttons have title or aria-label', async ({ page }) => {
        const missingLabels = await page.evaluate(() => {
            const toolbar = document.querySelector('.toolbar, #main-toolbar, nav');
            if (!toolbar) return [];
            const btns = toolbar.querySelectorAll('button');
            const missing = [];
            btns.forEach(btn => {
                const hasTitle = !!btn.getAttribute('title');
                const hasAriaLabel = !!btn.getAttribute('aria-label');
                const hasText = btn.textContent.trim().length > 0;
                if (!hasTitle && !hasAriaLabel && !hasText) {
                    missing.push(btn.id || btn.className || 'unnamed-btn');
                }
            });
            return missing;
        });
        expect(missingLabels).toEqual([]);
    });

    test('modal open/close does not leak backdrop', async ({ page }) => {
        // Wait for Phase 3 modules to load
        await page.waitForTimeout(5000);

        // Open template modal
        const hasTemplateBtn = await page.evaluate(() => typeof window.MDView.openTemplateModal === 'function');
        if (!hasTemplateBtn) {
            test.skip();
            return;
        }

        await page.evaluate(() => window.MDView.openTemplateModal());
        await page.waitForTimeout(500);

        // Close modal (ESC or close button)
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // No lingering modal backdrops
        const backdrops = await page.locator('.modal-backdrop').count();
        expect(backdrops).toBe(0);
    });

    test('toast notification appears and auto-dismisses', async ({ page }) => {
        await page.evaluate(() => window.MDView.showToast('Test toast message'));
        await page.waitForTimeout(200);

        // Toast should be visible
        const toast = page.locator('.toast, [role="alert"]');
        await expect(toast.first()).toBeVisible({ timeout: 2000 });

        // Wait for auto-dismiss (typically 3-5 seconds)
        await page.waitForTimeout(6000);
        const visibleCount = await page.evaluate(() => {
            const toasts = document.querySelectorAll('.toast.show, .toast:not(.hide)');
            return toasts.length;
        });
        expect(visibleCount).toBe(0);
    });

    test('find bar opens and closes cleanly', async ({ page }) => {
        // Open find bar via JS (Ctrl+F is intercepted by browser in headless mode)
        await page.evaluate(() => window.MDView.openFindBar());
        await page.waitForTimeout(500);

        const findBar = page.locator('#find-replace-bar');
        await expect(findBar).toBeVisible();

        // Close find bar
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);

        const display = await findBar.evaluate(el => window.getComputedStyle(el).display);
        expect(display).toBe('none');
    });

    test('responsive layout — all three viewports work', async ({ page }) => {
        const viewports = [
            { width: 1920, height: 1080, name: 'desktop' },
            { width: 768, height: 1024, name: 'tablet' },
            { width: 375, height: 812, name: 'mobile' },
        ];

        for (const vp of viewports) {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.waitForTimeout(300);

            const editor = page.locator('#markdown-editor');
            await expect(editor).toBeAttached();
            console.log(`${vp.name} (${vp.width}x${vp.height}): editor attached ✓`);
        }
    });

    test('zen mode toggle works and reverts', async ({ page }) => {
        await page.waitForTimeout(5000); // wait for phase 3

        const hasZen = await page.evaluate(() => typeof window.MDView.toggleZenMode === 'function');
        if (!hasZen) {
            test.skip();
            return;
        }

        // Enter zen mode
        await page.evaluate(() => window.MDView.toggleZenMode());
        await page.waitForTimeout(300);

        // Exit zen mode
        await page.evaluate(() => window.MDView.toggleZenMode());
        await page.waitForTimeout(300);

        // Editor should still be functional
        await page.locator('#markdown-editor').fill('After zen mode');
        await page.waitForTimeout(500);
        const preview = page.locator('#markdown-preview');
        await expect(preview).toContainText('After zen mode');
    });
});
