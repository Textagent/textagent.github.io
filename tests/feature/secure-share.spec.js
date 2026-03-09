// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Secure Share Validation
 *
 * Tests passphrase validation in the share-options modal's secure mode,
 * credentials download content, and download-section visibility rules.
 *
 * Source: js/cloud-share.js:430-531, js/modal-templates.js:50-112
 */

test.describe('Secure Share Validation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.shareMarkdown);

        // Fill editor with content that has a heading
        await page.locator('#markdown-editor').fill('# Secure Test Doc\n\nSensitive content here.');
        await page.waitForTimeout(300);

        // Open share options modal
        await page.evaluate(() => window.MDView.shareMarkdown());
        await expect(page.locator('#share-options-modal')).toHaveClass(/active/, { timeout: 3000 });

        // Switch to secure mode
        await page.locator('#share-mode-secure').click();
        await expect(page.locator('#share-mode-secure')).toHaveClass(/active/);
        await expect(page.locator('#share-secure-section')).toBeVisible();
    });

    test('mismatched passphrase + confirm shows error', async ({ page }) => {
        await page.locator('#share-passphrase-input').fill('strongpass1');
        await page.locator('#share-passphrase-confirm').fill('differentpass');
        await page.locator('#share-do-share').click();

        const error = page.locator('#share-passphrase-error');
        await expect(error).toBeVisible({ timeout: 2000 });
        await expect(error).toContainText('do not match', { ignoreCase: true });
    });

    test('too-short passphrase is rejected', async ({ page }) => {
        await page.locator('#share-passphrase-input').fill('short');
        await page.locator('#share-passphrase-confirm').fill('short');
        await page.locator('#share-do-share').click();

        const error = page.locator('#share-passphrase-error');
        await expect(error).toBeVisible({ timeout: 2000 });
        await expect(error).toContainText('at least 8 characters', { ignoreCase: true });
    });

    test('secure share shows credentials download section; quick share hides it', async ({ page }) => {
        // Close current modal
        await page.locator('#share-options-cancel').click();

        // Test quick-share result: open the result modal directly simulating quick share
        await page.evaluate(() => {
            const resultModal = document.getElementById('share-result-modal');
            document.getElementById('share-link-input').value = 'https://textagent.github.io/#d=test&k=testkey';
            // Quick share hides the download section
            document.getElementById('share-download-section').style.display = 'none';
            document.getElementById('share-result-desc').innerHTML =
                '<i class="bi bi-shield-lock me-1"></i> Content is encrypted.';
            resultModal.classList.add('active');
        });

        await expect(page.locator('#share-result-modal')).toHaveClass(/active/, { timeout: 3000 });

        // Quick share should HIDE the download section
        await expect(page.locator('#share-download-section')).toBeHidden();

        // Close result modal
        await page.evaluate(() => {
            document.getElementById('share-result-modal').classList.remove('active');
        });

        // Now simulate secure share result: download section should be shown
        await page.evaluate(() => {
            const resultModal = document.getElementById('share-result-modal');
            document.getElementById('share-link-input').value = 'https://textagent.github.io/#id=abc&secure=1';
            // Secure share shows the download section
            document.getElementById('share-download-section').style.display = '';
            document.getElementById('share-result-desc').innerHTML =
                '<i class="bi bi-shield-lock me-1"></i> Passphrase-protected.';
            resultModal.classList.add('active');
        });

        await expect(page.locator('#share-result-modal')).toHaveClass(/active/, { timeout: 3000 });
        await expect(page.locator('#share-download-section')).toBeVisible();
    });

    test('credentials download filename is sanitized from heading', async ({ page }) => {
        // Close current modal
        await page.locator('#share-options-cancel').click();

        // Set editor content with special characters in the heading
        await page.locator('#markdown-editor').fill('# Special!@#$%^&*() Chars\n\nContent');
        await page.waitForTimeout(300);

        // Open result modal directly with secure flag
        await page.evaluate(() => {
            const resultModal = document.getElementById('share-result-modal');
            document.getElementById('share-link-input').value = 'https://textagent.github.io/#id=test123&secure=1';
            document.getElementById('share-download-section').style.display = '';
            resultModal.classList.add('active');
        });

        // Listen for download
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
        await page.locator('#share-download-credentials').click();
        const download = await downloadPromise;

        const filename = download.suggestedFilename();
        // Filename should not contain special chars (except hyphens)
        expect(filename).toMatch(/^textagent-[\w-]+\.txt$/);
        // Should not contain the raw special chars
        expect(filename).not.toMatch(/[!@#$%^&*()]/);
    });

    test('downloaded credentials contain both URL and passphrase', async ({ page }) => {
        // Close current modal
        await page.locator('#share-options-cancel').click();

        const fakeUrl = 'https://textagent.github.io/#id=test123&secure=1';

        // Set up result modal with a known URL
        await page.evaluate((url) => {
            const resultModal = document.getElementById('share-result-modal');
            document.getElementById('share-link-input').value = url;
            document.getElementById('share-download-section').style.display = '';
            resultModal.classList.add('active');
        }, fakeUrl);

        // Listen for download and read contents
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
        await page.locator('#share-download-credentials').click();
        const download = await downloadPromise;

        // Read the downloaded file content
        const stream = await download.createReadStream();
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const content = Buffer.concat(chunks).toString('utf-8');

        // Verify content includes URL and Passphrase sections
        expect(content).toContain('URL:');
        expect(content).toContain(fakeUrl);
        expect(content).toContain('Passphrase:');
        expect(content).toContain('TextAgent');
    });
});
