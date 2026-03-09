// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Share Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.shareMarkdown);

        // Type content so the share button doesn't alert "empty"
        await page.locator('#markdown-editor').fill('# Share Test\n\nContent to share.');
        await page.waitForTimeout(300);
    });

    test('quick-share opens the share options modal', async ({ page }) => {
        // Call shareMarkdown directly (avoids viewport-dependent button visibility)
        await page.evaluate(() => window.MDView.shareMarkdown());

        // Verify the share options modal is visible (class "active" is added)
        const shareModal = page.locator('#share-options-modal');
        await expect(shareModal).toHaveClass(/active/, { timeout: 3000 });

        // Verify Quick Share mode is active by default
        const quickBtn = page.locator('#share-mode-quick');
        await expect(quickBtn).toHaveClass(/active/);

        // The "Share" button should be enabled
        const shareDoBtn = page.locator('#share-do-share');
        await expect(shareDoBtn).toBeEnabled();
    });

    test('share options modal can be closed via cancel', async ({ page }) => {
        await page.evaluate(() => window.MDView.shareMarkdown());
        await expect(page.locator('#share-options-modal')).toHaveClass(/active/, { timeout: 3000 });

        // Click cancel
        await page.locator('#share-options-cancel').click();
        await expect(page.locator('#share-options-modal')).not.toHaveClass(/active/);
    });

    test('can switch to secure share mode', async ({ page }) => {
        await page.evaluate(() => window.MDView.shareMarkdown());
        await expect(page.locator('#share-options-modal')).toHaveClass(/active/, { timeout: 3000 });

        // Switch to secure mode
        await page.locator('#share-mode-secure').click();
        await expect(page.locator('#share-mode-secure')).toHaveClass(/active/);

        // Secure section should be visible
        await expect(page.locator('#share-secure-section')).toBeVisible();
    });
});
