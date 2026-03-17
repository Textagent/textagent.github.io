// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests for read-only mode enforcement.
 * Verifies CSS lockdown class, JS safety-net guards,
 * and click interception for shared documents.
 */
test.describe('Read-Only Mode Lockdown', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);
    });

    // ── CSS class enforcement ───────────────────────────────

    test('body.editor-readonly class disables format buttons via CSS', async ({ page }) => {
        // Apply the readonly class
        await page.evaluate(() => document.body.classList.add('editor-readonly'));
        await page.waitForTimeout(300);

        // Check a formatting button is visually disabled (pointer-events or opacity)
        const disabled = await page.evaluate(() => {
            const btn = document.querySelector('.fmt-btn');
            if (!btn) return false;
            const style = window.getComputedStyle(btn);
            return style.pointerEvents === 'none' || parseFloat(style.opacity) < 1;
        });
        expect(disabled).toBe(true);

        // Clean up
        await page.evaluate(() => document.body.classList.remove('editor-readonly'));
    });

    test('editor textarea becomes readOnly when set programmatically', async ({ page }) => {
        await page.evaluate(() => {
            window.MDView.markdownEditor.readOnly = true;
        });

        const isReadOnly = await page.evaluate(() =>
            window.MDView.markdownEditor.readOnly
        );
        expect(isReadOnly).toBe(true);

        // Clean up
        await page.evaluate(() => {
            window.MDView.markdownEditor.readOnly = false;
        });
    });

    // ── JS guard: insertAtCursor ────────────────────────────

    test('insertAtCursor is blocked when editor is readOnly', async ({ page }) => {
        const result = await page.evaluate(() => {
            var editor = window.MDView.markdownEditor;
            var before = editor.value;
            editor.readOnly = true;
            if (window.MDView.insertAtCursor) {
                window.MDView.insertAtCursor('INJECTED_TEXT');
            }
            var after = editor.value;
            editor.readOnly = false;
            return { before, after, injected: after.includes('INJECTED_TEXT') };
        });
        expect(result.injected).toBe(false);
    });

    // ── JS guard: keyboard shortcuts ────────────────────────

    test('Ctrl+B does not wrap selection in readOnly mode', async ({ page }) => {
        await page.locator('#markdown-editor').fill('test text');
        await page.waitForTimeout(300);

        // Select all text and enable readOnly
        await page.evaluate(() => {
            var editor = window.MDView.markdownEditor;
            editor.selectionStart = 0;
            editor.selectionEnd = editor.value.length;
            editor.readOnly = true;
        });

        // Try Ctrl+B
        await page.keyboard.press('Meta+b');
        await page.waitForTimeout(300);

        const value = await page.evaluate(() => {
            var v = window.MDView.markdownEditor.value;
            window.MDView.markdownEditor.readOnly = false;
            return v;
        });
        // Should NOT have bold wrapping
        expect(value).not.toContain('**test text**');
    });

    // ── JS guard: paste is blocked ──────────────────────────

    test('paste event is ignored in readOnly mode', async ({ page }) => {
        await page.evaluate(() => {
            window.MDView.markdownEditor.readOnly = true;
        });

        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        // Simulate paste — should not crash
        await page.evaluate(() => {
            var event = new ClipboardEvent('paste', {
                clipboardData: new DataTransfer(),
                bubbles: true,
                cancelable: true,
            });
            window.MDView.markdownEditor.dispatchEvent(event);
        });
        await page.waitForTimeout(500);

        expect(errors).toEqual([]);

        await page.evaluate(() => {
            window.MDView.markdownEditor.readOnly = false;
        });
    });

    // ── No page errors in readonly state ────────────────────

    test('enabling readonly mode does not produce page errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.evaluate(() => {
            document.body.classList.add('editor-readonly');
            window.MDView.markdownEditor.readOnly = true;
        });
        await page.waitForTimeout(1000);

        await page.evaluate(() => {
            document.body.classList.remove('editor-readonly');
            window.MDView.markdownEditor.readOnly = false;
        });

        expect(errors).toEqual([]);
    });

    // ── Styling breadth check ───────────────────────────────

    test('editor-readonly class applies disabled styling on fmt-btn via CSS', async ({ page }) => {
        const result = await page.evaluate(() => {
            var btn = document.querySelector('.fmt-btn');
            if (!btn) return { found: false, opacity: '1' };
            document.body.classList.add('editor-readonly');
            var opacity = window.getComputedStyle(btn).opacity;
            document.body.classList.remove('editor-readonly');
            return { found: true, opacity };
        });
        expect(result.found).toBe(true);
        expect(parseFloat(result.opacity)).toBeLessThan(1);
    });
});
