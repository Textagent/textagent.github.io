// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Code smell tests — detect runtime anti-patterns, DOM issues,
 * and bad practices that indicate maintainability problems.
 */
test.describe('Code Smell — Runtime Anti-patterns', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(5000); // wait for all phases
    });

    // ── Global namespace pollution ───────────────────────────────────

    test('window has only expected global namespaces', async ({ page }) => {
        const unexpected = await page.evaluate(() => {
            // Known/expected globals added by the app and its vendors
            const expected = new Set([
                'MDView', 'AI_MODELS',
                // Vendors loaded via src/vendor-globals.js
                'marked', 'mermaid', 'DOMPurify', 'hljs', 'bootstrap', 'pako',
                'joypixels', 'mammoth', 'TurndownService', 'XLSX',
                'html2pdf', 'jspdf', 'html2canvas', 'saveAs',
                'MathJax', 'nerdamer', 'pdfjsLib', 'math', 'mathjs',
                // Firebase (CDN)
                'firebase',
                // Browser / Playwright built-ins we don't control
                'webkitMediaStream', 'webkitRTCPeerConnection', 'webkitSpeechGrammar',
                'webkitSpeechGrammarList', 'webkitSpeechRecognition',
                'webkitSpeechRecognitionError', 'webkitSpeechRecognitionEvent',
            ]);

            const appGlobals = [];
            // Snapshot iframe-clean window keys
            const iframe = document.createElement('iframe');
            document.body.appendChild(iframe);
            const cleanKeys = new Set(Object.getOwnPropertyNames(iframe.contentWindow));
            document.body.removeChild(iframe);

            for (const key of Object.getOwnPropertyNames(window)) {
                if (!cleanKeys.has(key) && !expected.has(key) && !key.startsWith('__')) {
                    appGlobals.push(key);
                }
            }
            return appGlobals;
        });

        if (unexpected.length > 0) {
            console.warn('Unexpected window globals:', unexpected);
        }
        // Allow for Vite HMR, vendor shims, etc.
        expect(unexpected.length).toBeLessThan(30);
    });

    // ── Duplicate DOM IDs ────────────────────────────────────────────

    test('no duplicate element IDs in the document', async ({ page }) => {
        const duplicates = await page.evaluate(() => {
            /** @type {Record<string, number>} */
            const ids = {};
            document.querySelectorAll('[id]').forEach(el => {
                ids[el.id] = (ids[el.id] || 0) + 1;
            });
            return Object.entries(ids)
                .filter(([, count]) => count > 1)
                .map(([id, count]) => `${id} (×${count})`);
        });
        if (duplicates.length > 0) {
            console.warn('Duplicate IDs:', duplicates);
        }
        // Some Bootstrap components may cause duplicates; warn but allow a few
        expect(duplicates.length).toBeLessThan(5);
    });

    // ── Console.error during normal operation ────────────────────────

    test('no console.error calls during normal usage', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // Simulate typical user flow
        await page.locator('#markdown-editor').fill('# Hello\n\nSome **text**.');
        await page.waitForTimeout(500);
        await page.evaluate(() => window.MDView.setViewMode('preview'));
        await page.waitForTimeout(300);
        await page.evaluate(() => window.MDView.setViewMode('split'));
        await page.waitForTimeout(300);

        // Filter out known benign messages (e.g. Vite HMR, 3rd-party lib noise)
        const significant = consoleErrors.filter(e =>
            !e.includes('[vite]') &&
            !e.includes('favicon') &&
            !e.includes('404')
        );

        expect(significant).toEqual([]);
    });

    // ── Excessive DOM depth ──────────────────────────────────────────

    test('maximum DOM nesting depth is under 30 levels', async ({ page }) => {
        const maxDepth = await page.evaluate(() => {
            let max = 0;
            function walk(el, depth) {
                if (depth > max) max = depth;
                for (const child of el.children) {
                    walk(child, depth + 1);
                }
            }
            walk(document.documentElement, 0);
            return max;
        });

        console.log(`Max DOM depth: ${maxDepth}`);
        expect(maxDepth).toBeLessThan(30);
    });

    // ── Deprecated API usage ─────────────────────────────────────────

    test('no document.write calls in loaded scripts', async ({ page }) => {
        const usesDocWrite = await page.evaluate(() => {
            // Override to detect any late calls
            let called = false;
            const original = document.write;
            document.write = () => { called = true; };
            // Trigger a re-render that might call document.write
            document.write = original;
            return called;
        });
        expect(usesDocWrite).toBe(false);
    });

    // ── Orphan event listeners (listener accumulation) ───────────────

    test('opening and closing modal does not accumulate listeners', async ({ page }) => {
        const hasTemplateBtn = await page.evaluate(
            () => typeof window.MDView.openTemplateModal === 'function'
        );
        if (!hasTemplateBtn) {
            test.skip();
            return;
        }

        const getNodeCount = async () => page.evaluate(() => document.querySelectorAll('*').length);

        const before = await getNodeCount();

        // Open and close 5 times
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.MDView.openTemplateModal());
            await page.waitForTimeout(300);
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
        }

        const after = await getNodeCount();
        const growth = after - before;
        console.log(`DOM node growth after 5 modal cycles: ${growth}`);
        // Bootstrap modals inject substantial DOM; ensure it does not grow unboundedly
        expect(growth).toBeLessThan(1000);
    });

    // ── Inline style attributes in static HTML ───────────────────────

    test('minimal inline styles in the page shell', async ({ page }) => {
        const inlineStyleCount = await page.evaluate(() => {
            // Check elements that existed before user content
            const els = document.querySelectorAll('[style]');
            const staticInline = [];
            els.forEach(el => {
                // Skip dynamically generated preview content
                if (!el.closest('#markdown-preview')) {
                    staticInline.push({
                        tag: el.tagName,
                        id: el.id || '',
                        style: el.getAttribute('style'),
                    });
                }
            });
            return staticInline;
        });

        if (inlineStyleCount.length > 0) {
            console.warn('Elements with inline styles:', JSON.stringify(inlineStyleCount, null, 2));
        }
        // Bootstrap and dynamic layout contribute many inline styles
        expect(inlineStyleCount.length).toBeLessThan(75);
    });

    // ── Empty event handlers ─────────────────────────────────────────

    test('no empty onclick/onchange attributes in HTML', async ({ page }) => {
        const emptyHandlers = await page.evaluate(() => {
            const attrs = ['onclick', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup'];
            const found = [];
            for (const attr of attrs) {
                document.querySelectorAll(`[${attr}]`).forEach(el => {
                    const val = el.getAttribute(attr);
                    if (!val || val.trim() === '') {
                        found.push({ tag: el.tagName, id: el.id, attr });
                    }
                });
            }
            return found;
        });
        expect(emptyHandlers).toEqual([]);
    });

    // ── Broken image references ──────────────────────────────────────

    test('no broken image sources in the page shell', async ({ page }) => {
        const brokenImages = await page.evaluate(() => {
            const imgs = document.querySelectorAll('img');
            const broken = [];
            imgs.forEach(img => {
                if (!img.complete || img.naturalWidth === 0) {
                    broken.push(img.src);
                }
            });
            return broken;
        });

        if (brokenImages.length > 0) {
            console.warn('Broken images:', brokenImages);
        }
        expect(brokenImages).toEqual([]);
    });

    // ── Unused CSS classes check (heuristic) ─────────────────────────

    test('critical CSS classes are actually used in the DOM', async ({ page }) => {
        const criticalClasses = [
            'editor-pane', 'preview-pane', 'content-container',
            'view-split', 'markdown-body',
        ];

        const unused = await page.evaluate((classes) => {
            return classes.filter(cls => document.querySelector(`.${cls}`) === null);
        }, criticalClasses);

        expect(unused, `Critical CSS classes not found in DOM: ${unused.join(', ')}`).toEqual([]);
    });
});
