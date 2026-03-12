// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Hello-World smoke tests for every executable code-block language.
 * Each test types a minimal "Hello, World!" snippet, clicks the per-block
 * Run button, and asserts that the output area shows the expected text.
 *
 * These act as a permanent canary — if any runtime breaks, this suite
 * will catch it immediately.
 */

const EDITOR_SELECTOR = '#markdown-editor';

/** Helper: hover over a container to reveal the toolbar, then click Run.
 *  Each language uses a different class: code-run-btn, python-run-btn,
 *  js-run-btn, sql-run-btn — so we match any of them.
 */
async function clickRunButton(container) {
    // Hover to reveal the toolbar (it may be hidden by default)
    await container.hover();
    const runBtn = container.locator('.code-run-btn, .python-run-btn, .js-run-btn, .sql-run-btn');
    await runBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await runBtn.click();
}

test.describe('Hello World — Code Block Execution', () => {
    // Give runtimes (Pyodide, sql.js, just-bash) plenty of time to load
    test.setTimeout(120_000);

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector(EDITOR_SELECTOR, { state: 'visible' });
        await page.waitForFunction(
            () => window.MDView && window.MDView.currentViewMode === 'split',
        );
        // Wait for all exec-engine modules + runtimes to initialise
        await page.waitForTimeout(5000);
    });

    // ─── Bash ────────────────────────────────────────────────
    test('bash: echo Hello, World!', async ({ page }) => {
        const md = [
            '```bash',
            '# Your bash commands',
            'echo "Hello, World!"',
            '```',
        ].join('\n');

        await page.locator(EDITOR_SELECTOR).fill(md);
        await page.waitForTimeout(1500);

        const container = page.locator('.executable-code-container').first();
        await expect(container).toBeVisible();

        // Click the per-block Run button
        await clickRunButton(container);

        // Wait for .code-output to appear with content
        const output = container.locator('.code-output');
        await expect(output).toBeVisible({ timeout: 30_000 });
        await expect(output).toContainText('Hello, World!', { timeout: 15_000 });

        // No errors
        const errorSpan = container.locator('.code-output-error');
        await expect(errorSpan).toHaveCount(0);
    });

    // ─── Python ──────────────────────────────────────────────
    test('python: print Hello, World!', async ({ page }) => {
        const md = [
            '```python',
            '# Your Python code',
            'print("Hello, World!")',
            '```',
        ].join('\n');

        await page.locator(EDITOR_SELECTOR).fill(md);
        await page.waitForTimeout(1500);

        const container = page.locator('.executable-python-container').first();
        await expect(container).toBeVisible();

        await clickRunButton(container);

        const output = container.locator('.code-output');
        await expect(output).toBeVisible({ timeout: 60_000 });
        await expect(output).toContainText('Hello, World!', { timeout: 30_000 });

        const errorSpan = container.locator('.code-output-error');
        await expect(errorSpan).toHaveCount(0);
    });

    // ─── JavaScript ──────────────────────────────────────────
    test('javascript: console.log Hello, World!', async ({ page }) => {
        const md = [
            '```javascript',
            '// Your JavaScript',
            'console.log("Hello, World!");',
            '```',
        ].join('\n');

        await page.locator(EDITOR_SELECTOR).fill(md);
        await page.waitForTimeout(1500);

        const container = page.locator('.executable-js-container').first();
        await expect(container).toBeVisible();

        await clickRunButton(container);

        const output = container.locator('.code-output');
        await expect(output).toBeVisible({ timeout: 15_000 });
        await expect(output).toContainText('Hello, World!', { timeout: 10_000 });

        const errorSpan = container.locator('.code-output-error');
        await expect(errorSpan).toHaveCount(0);
    });

    // ─── SQL ─────────────────────────────────────────────────
    test('sql: CREATE, INSERT, SELECT', async ({ page }) => {
        const md = [
            '```sql',
            'CREATE TABLE IF NOT EXISTS greetings (id INTEGER PRIMARY KEY, message TEXT);',
            "INSERT INTO greetings VALUES (1, 'Hello, World!');",
            'SELECT * FROM greetings;',
            '```',
        ].join('\n');

        await page.locator(EDITOR_SELECTOR).fill(md);
        await page.waitForTimeout(1500);

        const container = page.locator('.executable-sql-container').first();
        await expect(container).toBeVisible();

        await clickRunButton(container);

        const output = container.locator('.code-output');
        await expect(output).toBeVisible({ timeout: 30_000 });
        // SQL output renders as a table; assert the data row appears
        await expect(output).toContainText('Hello, World!', { timeout: 15_000 });

        const errorSpan = container.locator('.code-output-error');
        await expect(errorSpan).toHaveCount(0);
    });

    // ─── Combined: all four in one document ──────────────────
    test('all four languages in a single document', async ({ page }) => {
        const md = [
            '```bash',
            'echo "Hello, World!"',
            '```',
            '',
            '```python',
            'print("Hello, World!")',
            '```',
            '',
            '```javascript',
            'console.log("Hello, World!");',
            '```',
            '',
            '```sql',
            'CREATE TABLE IF NOT EXISTS greetings (id INTEGER PRIMARY KEY, message TEXT);',
            "INSERT INTO greetings VALUES (1, 'Hello, World!');",
            'SELECT * FROM greetings;',
            '```',
        ].join('\n');

        await page.locator(EDITOR_SELECTOR).fill(md);
        await page.waitForTimeout(2000);

        // All four containers should render
        const bashContainer   = page.locator('.executable-code-container').first();
        const pythonContainer = page.locator('.executable-python-container').first();
        const jsContainer     = page.locator('.executable-js-container').first();
        const sqlContainer    = page.locator('.executable-sql-container').first();

        await expect(bashContainer).toBeVisible();
        await expect(pythonContainer).toBeVisible();
        await expect(jsContainer).toBeVisible();
        await expect(sqlContainer).toBeVisible();

        // Run each block individually in document order
        await clickRunButton(bashContainer);
        const bashOutput = bashContainer.locator('.code-output');
        await expect(bashOutput).toContainText('Hello, World!', { timeout: 30_000 });

        await clickRunButton(pythonContainer);
        const pythonOutput = pythonContainer.locator('.code-output');
        await expect(pythonOutput).toContainText('Hello, World!', { timeout: 60_000 });

        await clickRunButton(jsContainer);
        const jsOutput = jsContainer.locator('.code-output');
        await expect(jsOutput).toContainText('Hello, World!', { timeout: 15_000 });

        await clickRunButton(sqlContainer);
        const sqlOutput = sqlContainer.locator('.code-output');
        await expect(sqlOutput).toContainText('Hello, World!', { timeout: 30_000 });

        // Zero errors across all containers
        const errors = page.locator('.code-output-error');
        await expect(errors).toHaveCount(0);
    });
});
