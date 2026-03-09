// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Toolbar Tag Button Insertion Tests
 *
 * Verifies that every tag insertion button in the formatting toolbar
 * inserts the correct template into the editor — exactly once, not nested.
 */
test.describe('Toolbar Tag Insertion', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        // Clear editor
        await page.locator('#markdown-editor').fill('');
        await page.waitForTimeout(200);
    });

    // ─── Helper: get editor value ───
    async function editorValue(page) {
        return page.locator('#markdown-editor').inputValue();
    }

    // ─── Helper: click a data-action button (may need overflow open first) ───
    async function clickAction(page, action) {
        // Focus the editor first — wrapSelectionWith/insertAtCursor need it
        await page.locator('#markdown-editor').click();
        await page.waitForTimeout(100);

        const btn = page.locator(`.fmt-btn[data-action="${action}"]`);
        // If the button is inside a dropdown, open the overflow first
        const isVisible = await btn.isVisible();
        if (!isVisible) {
            // Find the parent overflow and click the "…" button
            const overflow = page.locator(`.fmt-group-overflow:has(.fmt-btn[data-action="${action}"])`);
            await overflow.locator('.fmt-group-more-btn').click();
            await page.waitForTimeout(100);
        }
        await btn.click();
        await page.waitForTimeout(200);
    }

    // ═══════════════════════════════════════════
    // AI TAGS GROUP
    // ═══════════════════════════════════════════

    test('AI tag inserts {{AI: ...}} once', async ({ page }) => {
        await clickAction(page, 'ai-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{AI:');
        expect(val).toContain('}}');
        // Must not be nested
        const count = (val.match(/\{\{AI:/g) || []).length;
        expect(count).toBe(1);
    });

    test('Think tag inserts {{Think: ...}} once', async ({ page }) => {
        await clickAction(page, 'think-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{Think:');
        expect(val).toContain('}}');
        const count = (val.match(/\{\{Think:/g) || []).length;
        expect(count).toBe(1);
    });

    test('Image tag inserts {{Image: ...}} once (from dropdown)', async ({ page }) => {
        await clickAction(page, 'image-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{Image:');
        expect(val).toContain('}}');
        const count = (val.match(/\{\{Image:/g) || []).length;
        expect(count).toBe(1);
    });

    test('Agent tag inserts {{Agent: ...}} once (from dropdown)', async ({ page }) => {
        await clickAction(page, 'agent-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{Agent:');
        expect(val).toContain('Step 1:');
        expect(val).toContain('Step 2:');
        expect(val).toContain('}}');
        // Critical: must not be nested/doubled
        const count = (val.match(/\{\{Agent:/g) || []).length;
        expect(count).toBe(1);
    });

    // ═══════════════════════════════════════════
    // API GROUP
    // ═══════════════════════════════════════════

    test('API GET tag inserts {{API: ...}} with GET method', async ({ page }) => {
        await clickAction(page, 'api-get-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{API:');
        expect(val).toMatch(/Method:\s*GET/i);
        expect(val).toContain('}}');
    });

    test('API POST tag inserts {{API: ...}} with POST method', async ({ page }) => {
        await clickAction(page, 'api-post-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{API:');
        expect(val).toMatch(/Method:\s*POST/i);
        expect(val).toContain('}}');
    });

    // ═══════════════════════════════════════════
    // LINUX GROUP
    // ═══════════════════════════════════════════

    test('Linux tag inserts {{Linux: ...}} once', async ({ page }) => {
        await clickAction(page, 'linux-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{Linux:');
        expect(val).toContain('}}');
        const count = (val.match(/\{\{Linux:/g) || []).length;
        expect(count).toBe(1);
    });

    test('C++ tag inserts {{Linux: Language: cpp ...}} once', async ({ page }) => {
        await clickAction(page, 'linux-cpp-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{Linux:');
        expect(val).toMatch(/Language:\s*cpp/);
        expect(val).toContain('}}');
        const count = (val.match(/\{\{Linux:/g) || []).length;
        expect(count).toBe(1);
    });

    test('Rust tag inserts {{Linux: Language: rust ...}} once (from dropdown)', async ({ page }) => {
        await clickAction(page, 'linux-rust-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{Linux:');
        expect(val).toMatch(/Language:\s*rust/);
        expect(val).toContain('fn main()');
        expect(val).toContain('}}');
        const count = (val.match(/\{\{Linux:/g) || []).length;
        expect(count).toBe(1);
    });

    test('Go tag inserts {{Linux: Language: go ...}} once (from dropdown)', async ({ page }) => {
        await clickAction(page, 'linux-go-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{Linux:');
        expect(val).toMatch(/Language:\s*go/);
        expect(val).toContain('func main()');
        expect(val).toContain('}}');
        const count = (val.match(/\{\{Linux:/g) || []).length;
        expect(count).toBe(1);
    });

    test('Java tag inserts {{Linux: Language: java ...}} once (from dropdown)', async ({ page }) => {
        await clickAction(page, 'linux-java-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{Linux:');
        expect(val).toMatch(/Language:\s*java/);
        expect(val).toContain('}}');
        const count = (val.match(/\{\{Linux:/g) || []).length;
        expect(count).toBe(1);
    });

    // ═══════════════════════════════════════════
    // CODING GROUP
    // ═══════════════════════════════════════════

    test('Bash coding block inserts ```bash``` fence', async ({ page }) => {
        await clickAction(page, 'coding-bash');
        const val = await editorValue(page);
        expect(val).toContain('```bash');
        expect(val).toContain('echo');
    });

    test('Math coding block inserts ```math``` fence', async ({ page }) => {
        await clickAction(page, 'coding-math');
        const val = await editorValue(page);
        expect(val).toContain('```math');
    });

    test('Python coding block inserts ```python``` fence (from dropdown)', async ({ page }) => {
        await clickAction(page, 'coding-python');
        const val = await editorValue(page);
        expect(val).toContain('```python');
        expect(val).toContain('print');
    });

    test('HTML coding block inserts ```html``` fence (from dropdown)', async ({ page }) => {
        await clickAction(page, 'coding-html');
        const val = await editorValue(page);
        expect(val).toContain('```html');
    });

    test('JS coding block inserts ```javascript``` fence (from dropdown)', async ({ page }) => {
        await clickAction(page, 'coding-js');
        const val = await editorValue(page);
        expect(val).toContain('```javascript');
        expect(val).toContain('console.log');
    });

    test('SQL coding block inserts ```sql``` fence (from dropdown)', async ({ page }) => {
        await clickAction(page, 'coding-sql');
        const val = await editorValue(page);
        expect(val).toContain('```sql');
        expect(val).toContain('SELECT');
    });

    // ═══════════════════════════════════════════
    // OVERFLOW DROPDOWN BEHAVIOR
    // ═══════════════════════════════════════════

    test('overflow dropdown closes after selecting an action', async ({ page }) => {
        // Open the AI Tags overflow
        const aiOverflow = page.locator('.fmt-ai-group .fmt-group-overflow');
        await aiOverflow.locator('.fmt-group-more-btn').click();
        await page.waitForTimeout(100);
        expect(await aiOverflow.getAttribute('class')).toContain('open');

        // Click Agent — should close dropdown
        await page.locator('.fmt-btn[data-action="agent-tag"]').click();
        await page.waitForTimeout(200);
        expect(await aiOverflow.getAttribute('class')).not.toContain('open');
    });

    test('clicking outside closes overflow dropdown', async ({ page }) => {
        const aiOverflow = page.locator('.fmt-ai-group .fmt-group-overflow');
        await aiOverflow.locator('.fmt-group-more-btn').click();
        await page.waitForTimeout(100);
        expect(await aiOverflow.getAttribute('class')).toContain('open');

        // Click on editor (outside)
        await page.locator('#markdown-editor').click();
        await page.waitForTimeout(200);
        expect(await aiOverflow.getAttribute('class')).not.toContain('open');
    });
});
