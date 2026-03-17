// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests for Excalidraw Library Browser.
 * Verifies that library files are served and the embed page loads.
 */
test.describe('Excalidraw Library Browser', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);
    });

    // ── Library asset serving ───────────────────────────────

    test('excalidraw-embed.html is served', async ({ page }) => {
        const response = await page.request.get('/excalidraw-embed.html');
        expect(response.ok()).toBe(true);
        const text = await response.text();
        expect(text).toContain('Excalidraw');
    });

    test('software-architecture.excalidrawlib asset is accessible', async ({ page }) => {
        const response = await page.request.get('/assets/excalidraw-libs/software-architecture.excalidrawlib');
        expect(response.ok()).toBe(true);
    });

    test('aws-architecture-icons.excalidrawlib asset is accessible', async ({ page }) => {
        const response = await page.request.get('/assets/excalidraw-libs/aws-architecture-icons.excalidrawlib');
        expect(response.ok()).toBe(true);
    });

    test('deep-learning.excalidrawlib asset is accessible', async ({ page }) => {
        const response = await page.request.get('/assets/excalidraw-libs/deep-learning.excalidrawlib');
        expect(response.ok()).toBe(true);
    });

    test('google-icons.excalidrawlib asset is accessible', async ({ page }) => {
        const response = await page.request.get('/assets/excalidraw-libs/google-icons.excalidrawlib');
        expect(response.ok()).toBe(true);
    });

    // ── Library file is valid JSON ──────────────────────────

    test('excalidrawlib files contain valid JSON with libraryItems', async ({ page }) => {
        const result = await page.evaluate(async () => {
            try {
                const res = await fetch('/assets/excalidraw-libs/software-architecture.excalidrawlib');
                const json = await res.json();
                return {
                    hasLibraryItems: Array.isArray(json.libraryItems || json.library),
                    type: json.type || '',
                };
            } catch (e) {
                return { hasLibraryItems: false, type: '', error: e.message };
            }
        });
        expect(result.hasLibraryItems).toBe(true);
    });

    // ── Embed page structure ────────────────────────────────

    test('excalidraw-embed.html contains Library Browser markup', async ({ page }) => {
        const response = await page.request.get('/excalidraw-embed.html');
        const html = await response.text();
        // Should have library browser-related code
        expect(html).toContain('library');
    });

    // ── Multiple library files served ───────────────────────

    test('at least 20 excalidrawlib files are served', async ({ page }) => {
        const count = await page.evaluate(async () => {
            const knownLibs = [
                'algorithms-data-structures', 'architecture-diagram-components',
                'awesome-icons', 'aws-architecture-icons', 'basic-ux-wireframing',
                'charts', 'cloud-design-patterns', 'cloud', 'data-viz', 'database',
                'decision-flow-control', 'deep-learning', 'dev-ops-icons', 'forms',
                'google-icons', 'graphs', 'icons', 'lo-fi-wireframing-kit',
                'math-teacher-library', 'network-topology-icons', 'software-architecture',
                'software-logos', 'stick-figures', 'sticky-notes',
                'system-design-components', 'system-design-template',
                'systems-design-components', 'technology-logos', 'uml-er-diagrams',
            ];
            let ok = 0;
            for (const lib of knownLibs) {
                try {
                    const res = await fetch('/assets/excalidraw-libs/' + lib + '.excalidrawlib', { method: 'HEAD' });
                    if (res.ok) ok++;
                } catch (e) { /* skip */ }
            }
            return ok;
        });
        expect(count).toBeGreaterThanOrEqual(20);
    });
});
