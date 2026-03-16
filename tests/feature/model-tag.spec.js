// @ts-check
import { test, expect } from '@playwright/test';

/**
 * @model Tag Field Tests
 *
 * Verifies that the @model: metadata field is correctly inserted,
 * parsed, rendered in dropdowns, and synced back to editor text.
 */
test.describe('@model Tag Field', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView && w.MDView.currentViewMode === 'split';
        });
        // Wait for Phase 3 lazy loading
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView &&
                w.MDView.formattingActions &&
                w.MDView.formattingActions['ai-tag'];
        });
        await page.locator('#markdown-editor').fill('');
        await page.waitForTimeout(200);
    });

    /** @param {import('@playwright/test').Page} page */
    async function editorValue(page) {
        return page.locator('#markdown-editor').inputValue();
    }

    /**
     * @param {import('@playwright/test').Page} page
     * @param {string} action
     */
    async function clickAction(page, action) {
        await page.locator('#markdown-editor').click();
        await page.waitForTimeout(100);
        const btn = page.locator(`.fmt-btn[data-action="${action}"]`);
        const isVisible = await btn.isVisible();
        if (!isVisible) {
            const overflow = page.locator(`.fmt-group-overflow:has(.fmt-btn[data-action="${action}"])`);
            await overflow.locator('.fmt-group-more-btn').click();
            await page.waitForTimeout(100);
        }
        await btn.click();
        await page.waitForTimeout(200);
    }

    // ═══════════════════════════════════════════
    // TAG INSERTION — @model: defaults
    // ═══════════════════════════════════════════

    test('AI tag includes @model: field', async ({ page }) => {
        await clickAction(page, 'ai-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{@AI:');
        expect(val).toMatch(/@model:\s*\S+/);
    });

    test('Image tag includes @model: hf-sdxl', async ({ page }) => {
        await clickAction(page, 'image-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{@Image:');
        expect(val).toMatch(/@model:\s*hf-sdxl/);
    });

    test('Agent tag includes @model: field', async ({ page }) => {
        await clickAction(page, 'agent-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{@Agent:');
        expect(val).toMatch(/@model:\s*\S+/);
    });

    test('STT tag includes @model: voxtral-stt', async ({ page }) => {
        await clickAction(page, 'stt-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{@STT:');
        expect(val).toMatch(/@model:\s*voxtral-stt/);
    });

    // ═══════════════════════════════════════════
    // PARSING — @model: renders card with dropdown
    // ═══════════════════════════════════════════

    test('OCR tag with @model: renders card with model dropdown', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@OCR:\n  @model: granite-docling\n  @mode: text\n  @prompt: extract table\n}}'
        );
        await page.waitForTimeout(500);

        const card = page.locator('.ai-placeholder-card[data-ai-type="OCR"]');
        await expect(card).toBeVisible();

        const select = card.locator('.ai-card-model-select');
        await expect(select).toBeVisible();
    });

    test('AI tag with @model: renders card with model dropdown', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@AI:\n  @model: qwen-local\n  @prompt: write a haiku\n}}'
        );
        await page.waitForTimeout(500);

        const card = page.locator('.ai-placeholder-card[data-ai-type="AI"]');
        await expect(card).toBeVisible();

        const select = card.locator('.ai-card-model-select');
        await expect(select).toBeVisible();
    });

    test('@model: value is pre-selected in model dropdown', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@AI:\n  @model: qwen-local\n  @prompt: test\n}}'
        );
        await page.waitForTimeout(500);

        const select = page.locator('.ai-card-model-select[data-ai-index="0"]');
        const selectedValue = await select.inputValue();
        expect(selectedValue).toBe('qwen-local');
    });

    test('@model: with invalid model falls back to default', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@AI:\n  @model: nonexistent-model-xyz\n  @prompt: test\n}}'
        );
        await page.waitForTimeout(500);

        const card = page.locator('.ai-placeholder-card[data-ai-type="AI"]');
        await expect(card).toBeVisible();

        // Should render without error — dropdown shows default model, not the invalid one
        const select = card.locator('.ai-card-model-select');
        const selectedValue = await select.inputValue();
        expect(selectedValue).not.toBe('nonexistent-model-xyz');
    });

    // ═══════════════════════════════════════════
    // DISPLAY — @model: not shown in card text
    // ═══════════════════════════════════════════

    test('@model: is not displayed in card prompt text', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@AI:\n  @model: qwen-local\n  @prompt: write something nice\n}}'
        );
        await page.waitForTimeout(500);

        const card = page.locator('.ai-placeholder-card[data-ai-type="AI"]');
        const cardText = await card.textContent();
        expect(cardText).not.toContain('@model:');
        expect(cardText).not.toContain('qwen-local');
    });

    // ═══════════════════════════════════════════
    // SYNC — dropdown change updates @model: in editor
    // ═══════════════════════════════════════════

    test('changing model dropdown syncs @model: to editor', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@AI:\n  @model: qwen-local\n  @prompt: test\n}}'
        );
        await page.waitForTimeout(500);

        // Find all available options in the dropdown
        const select = page.locator('.ai-card-model-select[data-ai-index="0"]');
        const options = await select.locator('option:not([disabled])').allInnerTexts();
        expect(options.length).toBeGreaterThan(1);

        // Pick a different model
        const otherOption = await select.locator('option:not([disabled]):not([selected])').first();
        const otherValue = await otherOption.getAttribute('value');
        if (otherValue) {
            await select.selectOption(otherValue);
            await page.waitForTimeout(300);

            const val = await editorValue(page);
            expect(val).toContain('@model: ' + otherValue);
            // Original model should be replaced, not duplicated
            const modelCount = (val.match(/@model:/g) || []).length;
            expect(modelCount).toBe(1);
        }
    });

    // ═══════════════════════════════════════════
    // BACKWARD COMPATIBILITY — tags without @model: work
    // ═══════════════════════════════════════════

    test('tag without @model: renders correctly (backward compat)', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@AI:\n  @prompt: hello world\n}}'
        );
        await page.waitForTimeout(500);

        const card = page.locator('.ai-placeholder-card[data-ai-type="AI"]');
        await expect(card).toBeVisible();

        // Dropdown should exist and have a selected value (the current default)
        const select = card.locator('.ai-card-model-select');
        await expect(select).toBeVisible();
        const selectedValue = await select.inputValue();
        expect(selectedValue).toBeTruthy();
    });

    test('OCR tag without @model: renders correctly', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@OCR:\n  @mode: text\n  @prompt: scan this\n}}'
        );
        await page.waitForTimeout(500);

        const card = page.locator('.ai-placeholder-card[data-ai-type="OCR"]');
        await expect(card).toBeVisible();
    });

    // ═══════════════════════════════════════════
    // MODEL REGISTRY VALIDATION
    // ═══════════════════════════════════════════

    test('model dropdown shows all registered models', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@AI:\n  @model: qwen-local\n  @prompt: test\n}}'
        );
        await page.waitForTimeout(500);

        const select = page.locator('.ai-card-model-select[data-ai-index="0"]');
        const options = await select.locator('option:not([disabled])').count();
        // Should have multiple models
        expect(options).toBeGreaterThanOrEqual(3);
    });
});
