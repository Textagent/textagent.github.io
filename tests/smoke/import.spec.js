// @ts-check
import { test, expect } from '@playwright/test';

test.describe('File Import', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for app to fully initialize
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.importFile);
    });

    test('imports a .md file and populates the editor', async ({ page }) => {
        const testContent = '# Smoke Test\n\nThis is a **smoke test** for import.';

        // Call importFile directly with a constructed File object
        await page.evaluate((content) => {
            const file = new File([content], 'test-import.md', { type: 'text/markdown' });
            window.MDView.importFile(file);
        }, testContent);

        // Wait for the FileReader to process the file
        await page.waitForFunction(
            (expected) => {
                const editor = document.getElementById('markdown-editor');
                return editor && editor.value.includes(expected);
            },
            '# Smoke Test',
            { timeout: 5000 }
        );

        const editorValue = await page.locator('#markdown-editor').inputValue();
        expect(editorValue).toContain('# Smoke Test');
        expect(editorValue).toContain('**smoke test**');
    });

    test('imports a .csv file and converts to markdown table', async ({ page }) => {
        const csvContent = 'Name,Age,City\nAlice,30,NYC\nBob,25,LA';

        // Call importFile directly with a constructed CSV File object
        await page.evaluate((content) => {
            const file = new File([content], 'test-import.csv', { type: 'text/csv' });
            window.MDView.importFile(file);
        }, csvContent);

        // Wait for conversion to complete
        await page.waitForFunction(
            () => {
                const editor = document.getElementById('markdown-editor');
                return editor && editor.value.includes('Name') && editor.value.includes('|');
            },
            null,
            { timeout: 5000 }
        );

        const editorValue = await page.locator('#markdown-editor').inputValue();
        expect(editorValue).toContain('Name');
        expect(editorValue).toContain('Alice');
        expect(editorValue).toContain('|');
    });
});
