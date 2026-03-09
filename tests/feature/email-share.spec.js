// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Email-to-Self Flow
 *
 * Tests the email section inside the share-result modal
 * (js/cloud-share.js:533-606, js/modal-templates.js:113-126).
 *
 * Strategy: We open the share-result modal directly via DOM manipulation
 * (bypassing the full share flow which requires Firebase). Then we interact
 * with the email UI section within that modal.
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/**';

test.describe('Email-to-Self Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.shareMarkdown);

        // Fill editor with content that has a heading
        await page.locator('#markdown-editor').fill('# Test Heading\n\nBody content for email test.');
        await page.waitForTimeout(400);

        // Open share result modal directly with a fake URL (bypass Firebase)
        await page.evaluate(() => {
            const resultModal = document.getElementById('share-result-modal');
            document.getElementById('share-link-input').value = 'https://textagent.github.io/#d=fakedata&k=fakekey';
            document.getElementById('share-download-section').style.display = 'none';
            resultModal.classList.add('active');
        });
        await expect(page.locator('#share-result-modal')).toHaveClass(/active/, { timeout: 3000 });
    });

    test('invalid email shows validation feedback (shake)', async ({ page }) => {
        // Leave email empty and click send
        await page.locator('#share-email-input').fill('');
        await page.locator('#share-email-send').click();

        // The input should get the 'shake' class
        await expect(page.locator('#share-email-input')).toHaveClass(/shake/, { timeout: 1000 });
    });

    test('invalid email format shows validation feedback', async ({ page }) => {
        await page.locator('#share-email-input').fill('not-an-email');
        await page.locator('#share-email-send').click();

        // Should still show shake (regex validation rejects it)
        await expect(page.locator('#share-email-input')).toHaveClass(/shake/, { timeout: 1000 });
    });

    test('custom subject is used when provided', async ({ page }) => {
        let capturedBody = null;

        // Intercept Apps Script POST
        await page.route(APPS_SCRIPT_URL, async route => {
            const request = route.request();
            capturedBody = JSON.parse(request.postData() || '{}');
            await route.fulfill({ status: 200, body: 'ok' });
        });

        await page.locator('#share-email-input').fill('test@example.com');
        await page.locator('#share-email-subject').fill('My Custom Subject');
        await page.locator('#share-email-send').click();

        // Wait for fetch to fire
        await page.waitForTimeout(1000);
        expect(capturedBody).not.toBeNull();
        expect(capturedBody.subject).toBe('My Custom Subject');
    });

    test('empty subject falls back to TextAgent: <heading>', async ({ page }) => {
        let capturedBody = null;

        await page.route(APPS_SCRIPT_URL, async route => {
            capturedBody = JSON.parse(route.request().postData() || '{}');
            await route.fulfill({ status: 200, body: 'ok' });
        });

        await page.locator('#share-email-input').fill('test@example.com');
        await page.locator('#share-email-subject').fill('');
        await page.locator('#share-email-send').click();

        await page.waitForTimeout(1000);
        expect(capturedBody).not.toBeNull();
        expect(capturedBody.subject).toMatch(/^TextAgent:/);
        expect(capturedBody.subject).toContain('Test Heading');
    });

    test('button enters loading state, disables, then re-enables', async ({ page }) => {
        // Use a delayed route to observe the loading state
        await page.route(APPS_SCRIPT_URL, async route => {
            await new Promise(r => setTimeout(r, 500));
            await route.fulfill({ status: 200, body: 'ok' });
        });

        await page.locator('#share-email-input').fill('test@example.com');
        const btn = page.locator('#share-email-send');

        await btn.click();

        // Button should be disabled and show loading text
        await expect(btn).toBeDisabled({ timeout: 2000 });
        const btnText = await btn.innerHTML();
        expect(btnText).toContain('Sending');

        // After resolution, button should re-enable
        await expect(btn).toBeEnabled({ timeout: 5000 });
    });

    test('success status is shown on successful fetch', async ({ page }) => {
        await page.route(APPS_SCRIPT_URL, async route => {
            await route.fulfill({ status: 200, body: 'ok' });
        });

        await page.locator('#share-email-input').fill('test@example.com');
        await page.locator('#share-email-send').click();

        const status = page.locator('#share-email-status');
        await expect(status).toContainText('✅', { timeout: 5000 });
        await expect(status).toHaveClass(/share-email-success/);
    });

    test('error status is shown when fetch throws', async ({ page }) => {
        await page.route(APPS_SCRIPT_URL, async route => {
            await route.abort('failed');
        });

        await page.locator('#share-email-input').fill('test@example.com');
        await page.locator('#share-email-send').click();

        const status = page.locator('#share-email-status');
        await expect(status).toContainText('❌', { timeout: 5000 });
        await expect(status).toHaveClass(/share-email-error/);
    });

    test('email is restored from localStorage on reopen', async ({ page }) => {
        // Save email via localStorage key
        await page.evaluate(() => {
            localStorage.setItem(window.MDView.KEYS.EMAIL_SELF, 'saved@example.com');
        });

        // Reload the page
        await page.reload();
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.shareMarkdown);

        // Open result modal to see email section
        await page.evaluate(() => {
            const resultModal = document.getElementById('share-result-modal');
            resultModal.classList.add('active');
        });

        const emailInput = page.locator('#share-email-input');
        await expect(emailInput).toHaveValue('saved@example.com');
    });
});
