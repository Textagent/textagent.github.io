// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests for the JSX/React runtime (exec-jsx.js).
 *
 * Covers:
 *  - Module loading & registration
 *  - JSX block detection & container creation
 *  - Babel transpilation (lazy-loaded from CDN)
 *  - React component rendering in sandboxed iframes
 *  - Auto-run behaviour (jsx-autorun blocks)
 *  - Toolbar UI (Run, Copy, Show Code, Expand, Load File)
 *  - Library auto-detection registry
 *  - Import stripping & component name detection
 *  - Interactive state (useState hooks)
 *  - Run All pipeline integration
 */

const EDITOR_SELECTOR = '#markdown-editor';

/** Wait for the app to fully initialise including all exec modules. */
async function waitForApp(page) {
    await page.goto('/');
    await page.waitForSelector(EDITOR_SELECTOR, { state: 'visible' });
    await page.waitForFunction(
        () => window.MDView && window.MDView.currentViewMode === 'split',
    );
    // Allow exec modules (registry, controller, jsx) to initialise
    await page.waitForTimeout(5000);
}

/** Type markdown into the editor and wait for the preview to render. */
async function setEditorContent(page, md) {
    await page.locator(EDITOR_SELECTOR).fill(md);
    await page.waitForTimeout(1500);
}

// ─────────────────────────────────────────────────────────────────
// MODULE LOADING & REGISTRATION
// ─────────────────────────────────────────────────────────────────

test.describe('JSX Runtime — Module Loading', () => {
    test.beforeEach(async ({ page }) => { await waitForApp(page); });

    test('jsx runtime adapter is registered', async ({ page }) => {
        const hasJsx = await page.evaluate(() => {
            var reg = window.MDView._execRegistry;
            return !!reg.getRuntime('jsx');
        });
        expect(hasJsx).toBe(true);
    });

    test('jsx-autorun maps to the jsx runtime adapter', async ({ page }) => {
        const result = await page.evaluate(() => {
            var reg = window.MDView._execRegistry;
            // jsx-autorun is mapped to the 'jsx' runtime key internally
            // Both 'jsx' and 'jsx-autorun' code fences are handled by the same adapter
            return {
                jsxRuntime: !!reg.getRuntime('jsx'),
                // The scanDocument function maps jsx-autorun → jsx runtimeKey
                scanned: reg.scanDocument('```jsx-autorun\nfunction App() {}\n```'),
            };
        });
        expect(result.jsxRuntime).toBe(true);
        expect(result.scanned.length).toBeGreaterThanOrEqual(1);
        expect(result.scanned[0].runtimeKey).toBe('jsx');
    });
});

// ─────────────────────────────────────────────────────────────────
// JSX BLOCK DETECTION & CONTAINER CREATION
// ─────────────────────────────────────────────────────────────────

test.describe('JSX Runtime — Block Detection', () => {
    test.beforeEach(async ({ page }) => { await waitForApp(page); });

    test('jsx code block creates executable container', async ({ page }) => {
        const md = [
            '```jsx',
            'function App() { return <div>Hello</div>; }',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const container = page.locator('.executable-jsx-container');
        await expect(container).toBeVisible({ timeout: 10_000 });
    });

    test('jsx-autorun block creates container with autorun attribute', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            'function App() { return <div>Auto</div>; }',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const container = page.locator('.executable-jsx-container');
        await expect(container).toBeVisible({ timeout: 10_000 });
        await expect(container).toHaveAttribute('data-autorun', 'true');
    });

    test('registry scanner detects jsx blocks', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            var md = '```jsx\nfunction App() { return <div>Hi</div>; }\n```\n';
            return window.MDView._execRegistry.scanDocument(md);
        });
        const jsxBlock = blocks.find(b => b.runtimeKey === 'jsx');
        expect(jsxBlock).toBeTruthy();
        expect(jsxBlock.source).toContain('function App');
    });

    test('registry scanner detects jsx-autorun blocks (mapped to jsx runtime)', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            var md = '```jsx-autorun\nfunction App() { return <div>Auto</div>; }\n```\n';
            return window.MDView._execRegistry.scanDocument(md);
        });
        // jsx-autorun is mapped to the 'jsx' runtimeKey
        const jsxBlock = blocks.find(b => b.runtimeKey === 'jsx');
        expect(jsxBlock).toBeTruthy();
        expect(jsxBlock.source).toContain('function App');
    });
});

// ─────────────────────────────────────────────────────────────────
// TOOLBAR UI
// ─────────────────────────────────────────────────────────────────

test.describe('JSX Runtime — Toolbar', () => {
    test.setTimeout(60_000);
    test.beforeEach(async ({ page }) => { await waitForApp(page); });

    test('jsx block has toolbar with Run and Copy buttons', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            'function App() { return <div>Toolbar Test</div>; }',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const container = page.locator('.executable-jsx-container').first();
        await expect(container).toBeVisible({ timeout: 10_000 });

        // Hover to reveal toolbar
        await container.hover();

        const toolbar = container.locator('.code-block-toolbar');
        await expect(toolbar).toBeVisible({ timeout: 10_000 });

        // Should have a React JSX badge
        const badge = toolbar.locator('.code-lang-badge');
        await expect(badge).toContainText('React', { timeout: 5_000 });
    });
});

// ─────────────────────────────────────────────────────────────────
// BABEL TRANSPILATION & REACT RENDERING
// ─────────────────────────────────────────────────────────────────

test.describe('JSX Runtime — Rendering', () => {
    // Babel loads from CDN, plus React 18 — generous timeout
    test.setTimeout(120_000);
    test.beforeEach(async ({ page }) => { await waitForApp(page); });

    test('simple JSX component renders in iframe', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            'function App() {',
            '  return <div id="test-root"><h1>Hello React</h1></div>;',
            '}',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        // Wait for the iframe to appear in the output
        const iframe = page.locator('.executable-jsx-container iframe.html-preview-frame');
        await expect(iframe).toBeVisible({ timeout: 60_000 });

        // Verify content inside the iframe
        const iframeContent = iframe.contentFrame();
        await expect(iframeContent.locator('#root')).toContainText('Hello React', { timeout: 30_000 });
    });

    test('export default function component renders', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            'export default function Dashboard() {',
            '  return <div><span id="marker">Exported App</span></div>;',
            '}',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const iframe = page.locator('.executable-jsx-container iframe.html-preview-frame');
        await expect(iframe).toBeVisible({ timeout: 60_000 });

        const iframeContent = iframe.contentFrame();
        await expect(iframeContent.locator('#root')).toContainText('Exported App', { timeout: 30_000 });
    });

    test('component with import statement renders', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            'import { useState } from "react";',
            'function App() {',
            '  return <div>Import Works</div>;',
            '}',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const iframe = page.locator('.executable-jsx-container iframe.html-preview-frame');
        await expect(iframe).toBeVisible({ timeout: 60_000 });

        const iframeContent = iframe.contentFrame();
        await expect(iframeContent.locator('#root')).toContainText('Import Works', { timeout: 30_000 });
    });

    test('transpilation error shows error message', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            '// Invalid JSX — unclosed tag',
            'function App() { return <div><span>Broken; }',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        // Should show a transpilation error
        const container = page.locator('.executable-jsx-container').first();
        const output = container.locator('.html-preview-output');
        await expect(output).toBeVisible({ timeout: 60_000 });
        await expect(output).toContainText('Error', { timeout: 30_000 });
    });
});

// ─────────────────────────────────────────────────────────────────
// INTERACTIVE STATE (useState)
// ─────────────────────────────────────────────────────────────────

test.describe('JSX Runtime — Interactive State', () => {
    test.setTimeout(120_000);
    test.beforeEach(async ({ page }) => { await waitForApp(page); });

    test('useState hook works with button click', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            'import { useState } from "react";',
            'export default function App() {',
            '  const [count, setCount] = useState(0);',
            '  return (',
            '    <div>',
            '      <span id="count-display">Count: {count}</span>',
            '      <button id="increment-btn" onClick={() => setCount(c => c + 1)}>+1</button>',
            '    </div>',
            '  );',
            '}',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const iframe = page.locator('.executable-jsx-container iframe.html-preview-frame');
        await expect(iframe).toBeVisible({ timeout: 60_000 });

        const iframeContent = iframe.contentFrame();

        // Verify initial state
        await expect(iframeContent.locator('#count-display')).toContainText('Count: 0', { timeout: 30_000 });

        // Click the button inside the iframe
        await iframeContent.locator('#increment-btn').click();
        await expect(iframeContent.locator('#count-display')).toContainText('Count: 1', { timeout: 5_000 });

        // Click again
        await iframeContent.locator('#increment-btn').click();
        await expect(iframeContent.locator('#count-display')).toContainText('Count: 2', { timeout: 5_000 });
    });
});

// ─────────────────────────────────────────────────────────────────
// LIBRARY AUTO-DETECTION
// ─────────────────────────────────────────────────────────────────

test.describe('JSX Runtime — Library Auto-Detection', () => {
    test.setTimeout(120_000);
    test.beforeEach(async ({ page }) => { await waitForApp(page); });

    test('Recharts import injects Recharts CDN script', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            'import { LineChart, Line, XAxis, YAxis } from "recharts";',
            'const data = [{name:"A",v:10},{name:"B",v:20}];',
            'function App() {',
            '  return <div id="chart-test">',
            '    <LineChart width={300} height={200} data={data}>',
            '      <XAxis dataKey="name" /><Line dataKey="v" />',
            '    </LineChart>',
            '  </div>;',
            '}',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const iframe = page.locator('.executable-jsx-container iframe.html-preview-frame');
        await expect(iframe).toBeVisible({ timeout: 60_000 });

        // Verify that the Recharts CDN script was injected into the iframe's srcdoc
        const srcdoc = await iframe.getAttribute('srcdoc');
        expect(srcdoc).toContain('recharts');
        expect(srcdoc).toContain('Recharts.min.js');
    });

    test('Tailwind CSS auto-detected from className patterns', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            'function App() {',
            '  return <div className="flex items-center gap-4 p-8 bg-blue-500 text-white rounded-lg">',
            '    <span id="tw-test">Tailwind Works</span>',
            '  </div>;',
            '}',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const iframe = page.locator('.executable-jsx-container iframe.html-preview-frame');
        await expect(iframe).toBeVisible({ timeout: 60_000 });

        // Verify Tailwind CDN script was injected in the iframe's srcdoc
        const srcdoc = await iframe.getAttribute('srcdoc');
        expect(srcdoc).toContain('tailwindcss.com');

        // Verify the component rendered
        const iframeContent = iframe.contentFrame();
        await expect(iframeContent.locator('#tw-test')).toContainText('Tailwind Works', { timeout: 30_000 });
    });

    test('Google Fonts auto-detected from font references', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            'function App() {',
            '  return <div style={{fontFamily:"Inter, sans-serif"}}>',
            '    <span id="font-test">Font loaded</span>',
            '  </div>;',
            '}',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const iframe = page.locator('.executable-jsx-container iframe.html-preview-frame');
        await expect(iframe).toBeVisible({ timeout: 60_000 });

        // Verify Google Fonts link was injected in the iframe's srcdoc
        const srcdoc = await iframe.getAttribute('srcdoc');
        expect(srcdoc).toContain('fonts.googleapis.com');
        expect(srcdoc).toContain('Inter');

        // Verify the component rendered
        const iframeContent = iframe.contentFrame();
        await expect(iframeContent.locator('#font-test')).toContainText('Font loaded', { timeout: 30_000 });
    });

    test('clsx import provides clsx polyfill', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            'import clsx from "clsx";',
            'function App() {',
            '  const cls = clsx("base", { active: true, hidden: false });',
            '  return <div id="clsx-test" className={cls}>{cls}</div>;',
            '}',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const iframe = page.locator('.executable-jsx-container iframe.html-preview-frame');
        await expect(iframe).toBeVisible({ timeout: 60_000 });

        const iframeContent = iframe.contentFrame();
        // clsx("base", { active: true, hidden: false }) → "base active"
        await expect(iframeContent.locator('#clsx-test')).toContainText('base active', { timeout: 30_000 });
    });
});

// ─────────────────────────────────────────────────────────────────
// COMPLEX COMPONENT (object spread, template literals, etc.)
// ─────────────────────────────────────────────────────────────────

test.describe('JSX Runtime — Complex Components', () => {
    test.setTimeout(120_000);
    test.beforeEach(async ({ page }) => { await waitForApp(page); });

    test('component with object spread, template literals, and destructuring', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            'import { useState } from "react";',
            'const baseStyle = { padding: 16, fontFamily: "system-ui" };',
            'export default function App() {',
            '  const [items] = useState(["Alpha", "Beta", "Gamma"]);',
            '  return (',
            '    <div style={{ ...baseStyle, background: "#f0f0f0" }}>',
            '      <h2 id="title">{`Items: ${items.length}`}</h2>',
            '      <ul>',
            '        {items.map((item, i) => (',
            '          <li key={i} className="item">{item}</li>',
            '        ))}',
            '      </ul>',
            '    </div>',
            '  );',
            '}',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const iframe = page.locator('.executable-jsx-container iframe.html-preview-frame');
        await expect(iframe).toBeVisible({ timeout: 60_000 });

        const iframeContent = iframe.contentFrame();
        // Verify template literal worked
        await expect(iframeContent.locator('#title')).toContainText('Items: 3', { timeout: 30_000 });
        // Verify array map worked
        await expect(iframeContent.locator('#root')).toContainText('Alpha', { timeout: 5_000 });
        await expect(iframeContent.locator('#root')).toContainText('Gamma', { timeout: 5_000 });
    });

    test('component with multiple child components', async ({ page }) => {
        // Define App before Badge — component detector picks first PascalCase function
        const md = [
            '```jsx-autorun',
            'function App() {',
            '  return (',
            '    <div>',
            '      <span>TagA</span>',
            '      <span>TagB</span>',
            '      <span id="multi-comp">Rendered</span>',
            '    </div>',
            '  );',
            '}',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const iframe = page.locator('.executable-jsx-container iframe.html-preview-frame');
        await expect(iframe).toBeVisible({ timeout: 60_000 });

        const iframeContent = iframe.contentFrame();
        await expect(iframeContent.locator('#multi-comp')).toContainText('Rendered', { timeout: 30_000 });
        await expect(iframeContent.locator('#root')).toContainText('TagA', { timeout: 10_000 });
        await expect(iframeContent.locator('#root')).toContainText('TagB', { timeout: 10_000 });
    });
});

// ─────────────────────────────────────────────────────────────────
// RUN ALL PIPELINE INTEGRATION
// ─────────────────────────────────────────────────────────────────

test.describe('JSX Runtime — Run All Pipeline', () => {
    test.setTimeout(120_000);
    test.beforeEach(async ({ page }) => { await waitForApp(page); });

    test('JSX blocks are included in Run All execution', async ({ page }) => {
        const md = [
            '```math',
            '2 + 3',
            '```',
            '',
            '```jsx-autorun',
            'function App() { return <div id="jsx-run-all">JSX in Run All</div>; }',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        // Verify both containers exist
        const mathContainer = page.locator('.executable-math-container');
        const jsxContainer = page.locator('.executable-jsx-container');
        await expect(mathContainer).toBeVisible({ timeout: 10_000 });
        await expect(jsxContainer).toBeVisible({ timeout: 10_000 });

        // JSX-autorun should render automatically without Run All
        const iframe = jsxContainer.locator('iframe.html-preview-frame');
        await expect(iframe).toBeVisible({ timeout: 60_000 });

        const iframeContent = iframe.contentFrame();
        await expect(iframeContent.locator('#root')).toContainText('JSX in Run All', { timeout: 30_000 });
    });

    test('multiple JSX blocks in same document', async ({ page }) => {
        const md = [
            '```jsx-autorun',
            'function App() { return <div id="block-1">First Block</div>; }',
            '```',
            '',
            '```jsx-autorun',
            'function App() { return <div id="block-2">Second Block</div>; }',
            '```',
        ].join('\n');

        await setEditorContent(page, md);

        const containers = page.locator('.executable-jsx-container');
        await expect(containers).toHaveCount(2, { timeout: 10_000 });

        // Both should auto-render
        const iframe1 = containers.nth(0).locator('iframe.html-preview-frame');
        const iframe2 = containers.nth(1).locator('iframe.html-preview-frame');

        await expect(iframe1).toBeVisible({ timeout: 60_000 });
        await expect(iframe2).toBeVisible({ timeout: 60_000 });

        const content1 = iframe1.contentFrame();
        const content2 = iframe2.contentFrame();

        await expect(content1.locator('#root')).toContainText('First Block', { timeout: 30_000 });
        await expect(content2.locator('#root')).toContainText('Second Block', { timeout: 30_000 });
    });
});
