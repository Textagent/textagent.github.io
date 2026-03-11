// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Execution Engine', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        // Wait for all modules including exec-registry and exec-controller
        await page.waitForTimeout(5000);
    });

    test('exec engine modules are loaded', async ({ page }) => {
        const check = await page.evaluate(() => ({
            registry: typeof window.MDView._execRegistry,
            context: typeof window.MDView._execContext,
            controller: typeof window.MDView._execController,
        }));
        expect(check.registry).toBe('object');
        expect(check.context).toBe('object');
        expect(check.controller).toBe('object');
    });

    test('registry exposes required functions', async ({ page }) => {
        const fns = await page.evaluate(() => ({
            scanDocument: typeof window.MDView._execRegistry.scanDocument,
            registerRuntime: typeof window.MDView._execRegistry.registerRuntime,
            getRuntime: typeof window.MDView._execRegistry.getRuntime,
            makeBlockId: typeof window.MDView._execRegistry.makeBlockId,
            fnv1a: typeof window.MDView._execRegistry.fnv1a,
        }));
        expect(fns.scanDocument).toBe('function');
        expect(fns.registerRuntime).toBe('function');
        expect(fns.getRuntime).toBe('function');
        expect(fns.makeBlockId).toBe('function');
        expect(fns.fnv1a).toBe('function');
    });

    test('controller exposes required functions', async ({ page }) => {
        const fns = await page.evaluate(() => ({
            runAll: typeof window.MDView._execController.runAll,
            runSingle: typeof window.MDView._execController.runSingle,
            abort: typeof window.MDView._execController.abort,
            isRunning: typeof window.MDView._execController.isRunning,
            on: typeof window.MDView._execController.on,
        }));
        expect(fns.runAll).toBe('function');
        expect(fns.runSingle).toBe('function');
        expect(fns.abort).toBe('function');
        expect(fns.isRunning).toBe('function');
        expect(fns.on).toBe('function');
    });

    test('context exposes required functions', async ({ page }) => {
        const fns = await page.evaluate(() => ({
            set: typeof window.MDView._execContext.set,
            get: typeof window.MDView._execContext.get,
            clear: typeof window.MDView._execContext.clear,
            resolveReferences: typeof window.MDView._execContext.resolveReferences,
            ensureReady: typeof window.MDView._execContext.ensureReady,
        }));
        expect(fns.set).toBe('function');
        expect(fns.get).toBe('function');
        expect(fns.clear).toBe('function');
        expect(fns.resolveReferences).toBe('function');
        expect(fns.ensureReady).toBe('function');
    });

    test('registry scans math code block', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            var md = '# Test\n\n```math\n2 + 3\n```\n';
            return window.MDView._execRegistry.scanDocument(md);
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].type).toBe('code');
        expect(blocks[0].runtimeKey).toBe('math');
        expect(blocks[0].source).toBe('2 + 3');
    });

    test('registry scans multiple block types', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            var md = '```math\n1+1\n```\n\n```python\nprint("hi")\n```\n\n```sql\nSELECT 1\n```\n';
            return window.MDView._execRegistry.scanDocument(md);
        });
        expect(blocks.length).toBe(3);
        expect(blocks[0].runtimeKey).toBe('math');
        expect(blocks[1].runtimeKey).toBe('python');
        expect(blocks[2].runtimeKey).toBe('sql');
    });

    test('stable IDs for same content', async ({ page }) => {
        const result = await page.evaluate(() => {
            var md = '```math\n2 + 3\n```\n';
            var scan1 = window.MDView._execRegistry.scanDocument(md);
            var scan2 = window.MDView._execRegistry.scanDocument(md);
            return { id1: scan1[0].id, id2: scan2[0].id };
        });
        expect(result.id1).toBe(result.id2);
    });

    test('IDs change when content changes', async ({ page }) => {
        const result = await page.evaluate(() => {
            var id1 = window.MDView._execRegistry.scanDocument('```math\n2+3\n```')[0].id;
            var id2 = window.MDView._execRegistry.scanDocument('```math\n5+5\n```')[0].id;
            return { id1, id2 };
        });
        expect(result.id1).not.toBe(result.id2);
    });

    test('Run All button exists', async ({ page }) => {
        const btn = page.locator('#run-all-btn');
        await expect(btn).toBeVisible();
        await expect(btn).toHaveAttribute('data-action', 'run-all');
    });

    test('runtime adapters are registered', async ({ page }) => {
        const registered = await page.evaluate(() => {
            var reg = window.MDView._execRegistry;
            return {
                bash: !!reg.getRuntime('bash'),
                math: !!reg.getRuntime('math'),
                python: !!reg.getRuntime('python'),
                html: !!reg.getRuntime('html'),
                javascript: !!reg.getRuntime('javascript'),
                sql: !!reg.getRuntime('sql'),
            };
        });
        expect(registered.bash).toBe(true);
        expect(registered.math).toBe(true);
        expect(registered.python).toBe(true);
        expect(registered.html).toBe(true);
        expect(registered.javascript).toBe(true);
        expect(registered.sql).toBe(true);
    });

    test('controller reports not running initially', async ({ page }) => {
        const running = await page.evaluate(() => window.MDView._execController.isRunning());
        expect(running).toBe(false);
    });

    test('Run All with math block produces output', async ({ page }) => {
        // Type a math block
        await page.locator('#markdown-editor').fill('```math\n2 + 3\n```');
        // Wait for render
        await page.waitForTimeout(1000);

        // Verify the math block appears in preview
        const mathContainer = page.locator('.executable-math-container');
        await expect(mathContainer).toBeVisible();

        // Click Run All
        await page.locator('#run-all-btn').click();

        // Wait for execution to complete
        await page.waitForTimeout(3000);

        // Verify controller is no longer running
        const running = await page.evaluate(() => window.MDView._execController.isRunning());
        expect(running).toBe(false);
    });
});
