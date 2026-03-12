// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Regression tests for just-bash loading and execution.
 *
 * These tests verify that the vendored just-bash browser bundle loads
 * without 404, CSP, or runtime errors (node:zlib, process, etc.).
 *
 * Regression:
 *   - esm.sh 404 for just-bash@2 (CDN build failure)
 *   - node:zlib / node:dns CSP violations from un-stubbed Node builtins
 *   - "process is not defined" from missing process global shim
 */

const EDITOR_SELECTOR = '#markdown-editor';

test.describe('just-bash — Loading & Execution Regression', () => {
    test.setTimeout(60_000);

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector(EDITOR_SELECTOR, { state: 'visible' });
    });

    test('just-bash vendor bundle loads without console errors', async ({ page }) => {
        // Collect console errors during page load
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        // Collect network failures for the vendor bundle
        const failedRequests = [];
        page.on('requestfailed', req => {
            if (req.url().includes('just-bash')) {
                failedRequests.push(`${req.url()} — ${req.failure()?.errorText}`);
            }
        });

        // Wait for just-bash-ready event (fires on successful load)
        const bashReady = await page.waitForFunction(
            () => !!window.JustBash,
            { timeout: 30_000 },
        ).catch(() => null);

        // Verify no 404s for just-bash
        expect(failedRequests, 'just-bash vendor bundle should not 404').toHaveLength(0);

        // Verify no console errors related to just-bash, node:*, or CSP
        const bashErrors = consoleErrors.filter(
            e => /just-bash|node:zlib|node:dns|process is not defined|Content Security Policy/i.test(e)
        );
        expect(bashErrors, 'No just-bash related console errors').toHaveLength(0);

        // Verify JustBash is available
        expect(bashReady, 'window.JustBash should be defined').not.toBeNull();

        // Verify the success log was emitted
        const loaded = await page.evaluate(() => !!window.JustBash);
        expect(loaded).toBe(true);
    });

    test('bash code block executes echo command without errors', async ({ page }) => {
        // Wait for just-bash to be ready
        await page.waitForFunction(() => !!window.JustBash, { timeout: 30_000 });

        const md = [
            '```bash',
            'echo "just-bash works!"',
            '```',
        ].join('\n');

        await page.locator(EDITOR_SELECTOR).fill(md);
        await page.waitForTimeout(1500);

        const container = page.locator('.executable-code-container').first();
        await expect(container).toBeVisible();

        // Click Run
        await container.hover();
        const runBtn = container.locator('.code-run-btn');
        await runBtn.waitFor({ state: 'visible', timeout: 10_000 });
        await runBtn.click();

        const output = container.locator('.code-output');
        await expect(output).toBeVisible({ timeout: 30_000 });

        // Should contain expected output, not "process is not defined"
        await expect(output).toContainText('just-bash works!', { timeout: 15_000 });

        // No error spans
        const errorSpan = container.locator('.code-output-error');
        await expect(errorSpan).toHaveCount(0);
    });

    test('bash code block runs variable expansion and pipes', async ({ page }) => {
        await page.waitForFunction(() => !!window.JustBash, { timeout: 30_000 });

        const md = [
            '```bash',
            'NAME="TextAgent"',
            'echo "Hello from $NAME" | tr a-z A-Z',
            '```',
        ].join('\n');

        await page.locator(EDITOR_SELECTOR).fill(md);
        await page.waitForTimeout(1500);

        const container = page.locator('.executable-code-container').first();
        await expect(container).toBeVisible();

        await container.hover();
        const runBtn = container.locator('.code-run-btn');
        await runBtn.waitFor({ state: 'visible', timeout: 10_000 });
        await runBtn.click();

        const output = container.locator('.code-output');
        await expect(output).toBeVisible({ timeout: 30_000 });
        await expect(output).toContainText('HELLO FROM TEXTAGENT', { timeout: 15_000 });

        const errorSpan = container.locator('.code-output-error');
        await expect(errorSpan).toHaveCount(0);
    });
});
