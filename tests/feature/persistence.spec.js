// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Persistence / Storage-Key Behavior
 *
 * Tests that user settings actually persist across page reloads
 * by writing to localStorage, reloading, and asserting the UI
 * reflects the stored value.
 *
 * Source: js/storage-keys.js, js/app-init.js, js/ui-panels.js, js/editor-features.js
 */

test.describe('Persistence / Storage-Key Behavior', () => {
    test('theme persists after reload', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.KEYS);

        // Get initial theme
        const initialTheme = await page.evaluate(
            () => document.documentElement.getAttribute('data-theme')
        );

        // Toggle via direct state change (button may be hidden in collapsed header)
        const newTheme = initialTheme === 'dark' ? 'light' : 'dark';
        await page.evaluate((theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(window.MDView.KEYS.THEME, theme);
            window.MDView.isDarkMode = theme === 'dark';
        }, newTheme);

        // Verify localStorage
        const savedTheme = await page.evaluate(
            () => localStorage.getItem(window.MDView.KEYS.THEME)
        );
        expect(savedTheme).toBe(newTheme);

        // Reload and verify the theme persists
        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });

        const themeAfterReload = await page.evaluate(
            () => document.documentElement.getAttribute('data-theme')
        );
        expect(themeAfterReload).toBe(newTheme);
    });

    test('preview theme persists after reload', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.KEYS);

        // Set a specific preview theme via localStorage + DOM
        await page.evaluate(() => {
            localStorage.setItem(window.MDView.KEYS.PREVIEW_THEME, 'dracula');
            document.documentElement.setAttribute('data-preview-theme', 'dracula');
        });

        // Reload and wait for ui-panels.js to apply the preview theme from localStorage
        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        // ui-panels.js reads PREVIEW_THEME and sets data-preview-theme on documentElement
        await page.waitForFunction(
            () => document.documentElement.getAttribute('data-preview-theme') === 'dracula',
            { timeout: 15000 }
        );

        const previewTheme = await page.evaluate(
            () => document.documentElement.getAttribute('data-preview-theme')
        );
        expect(previewTheme).toBe('dracula');

        const storedTheme = await page.evaluate(
            () => localStorage.getItem(window.MDView.KEYS.PREVIEW_THEME)
        );
        expect(storedTheme).toBe('dracula');
    });

    test('stats pill expanded state persists after reload', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.KEYS);

        // Set localStorage BEFORE reload so app-init.js picks it up on load
        await page.evaluate(() => {
            localStorage.setItem(window.MDView.KEYS.STATS_OPEN, 'true');
        });

        // Reload — app-init.js should restore the expanded class from localStorage
        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');

        // Verify the stats container has the expanded class
        const isExpanded = await page.evaluate(() => {
            const el = document.getElementById('stats-container');
            return el ? el.classList.contains('expanded') : false;
        });
        expect(isExpanded).toBe(true);
    });

    test('word-wrap setting persists after reload', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.KEYS);

        // Set word-wrap to OFF in localStorage, then reload to let editor-features.js pick it up
        await page.evaluate(() => {
            localStorage.setItem(window.MDView.KEYS.WORD_WRAP, 'false');
        });

        // Reload — editor-features.js reads WORD_WRAP and applies .no-wrap
        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        // Wait for editor-features.js to apply the no-wrap class based on localStorage
        await page.waitForFunction(
            () => document.getElementById('markdown-editor').classList.contains('no-wrap'),
            { timeout: 15000 }
        );

        const hasNoWrap = await page.evaluate(
            () => document.getElementById('markdown-editor').classList.contains('no-wrap')
        );
        expect(hasNoWrap).toBe(true);

        // Now set back to ON, reload, and verify no-wrap is removed
        await page.evaluate(() => {
            localStorage.setItem(window.MDView.KEYS.WORD_WRAP, 'true');
        });

        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        // Wait for editor-features.js to run and NOT add no-wrap
        await page.waitForFunction(
            () => {
                const btn = document.getElementById('word-wrap-toggle');
                return btn && btn.title && btn.title.includes('Word Wrap');
            },
            { timeout: 15000 }
        );

        const hasNoWrapAfter = await page.evaluate(
            () => document.getElementById('markdown-editor').classList.contains('no-wrap')
        );
        expect(hasNoWrapAfter).toBe(false);
    });

    test('saved email for share flow persists after reload', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.KEYS);

        // Save an email via localStorage
        await page.evaluate(() => {
            localStorage.setItem(window.MDView.KEYS.EMAIL_SELF, 'persist@example.com');
        });

        // Reload the page — cloud-share.js reads EMAIL_SELF and pre-fills the input
        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        // Wait for modals to be injected by modal-templates.js
        await page.waitForSelector('#share-result-modal', { state: 'attached', timeout: 15000 });
        // Wait for cloud-share.js to run (it reads EMAIL_SELF and populates the input)
        await page.waitForFunction(() => window.MDView && window.MDView.shareMarkdown);

        // Verify localStorage still has the value
        const storedEmail = await page.evaluate(
            () => localStorage.getItem(window.MDView.KEYS.EMAIL_SELF)
        );
        expect(storedEmail).toBe('persist@example.com');

        // Open the share result modal to verify the input is pre-filled
        await page.evaluate(() => {
            document.getElementById('share-result-modal').classList.add('active');
        });

        const emailInput = page.locator('#share-email-input');
        await expect(emailInput).toHaveValue('persist@example.com');
    });
});
