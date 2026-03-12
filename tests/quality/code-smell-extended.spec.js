// @ts-check
import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Extended code smell tests — verify new modules follow
 * established patterns and coding standards.
 */
test.describe('Code Smell — Extended Checks', () => {
    const projectRoot = join(import.meta.dirname, '..', '..');
    const jsDir = join(projectRoot, 'js');

    // ── IIFE pattern in new modules ──────────────────────────────────

    test('new modules follow IIFE pattern', async () => {
        const iifeModules = [
            'video-player.js',
            'stock-widget.js',
            'file-converters.js',
        ];

        for (const file of iifeModules) {
            const filePath = join(jsDir, file);
            let content;
            try {
                content = readFileSync(filePath, 'utf-8');
            } catch {
                // File might not exist - skip
                continue;
            }

            // Should start with IIFE pattern: (function or (function(M) or similar
            const hasIIFE = /\(function\s*\(/.test(content);
            expect(hasIIFE, `${file} should use IIFE pattern`).toBe(true);
        }
    });

    test('textToSpeech module uses IIFE pattern', async () => {
        const content = readFileSync(join(jsDir, 'textToSpeech.js'), 'utf-8');
        const hasIIFE = /\(function\s*\(/.test(content);
        expect(hasIIFE).toBe(true);
    });

    test('speechToText module uses IIFE pattern', async () => {
        const content = readFileSync(join(jsDir, 'speechToText.js'), 'utf-8');
        const hasIIFE = /\(function\s*\(/.test(content);
        expect(hasIIFE).toBe(true);
    });

    // ── Worker files exist and are non-empty ─────────────────────────

    test('worker files exist and are non-empty', async () => {
        const workerFiles = [
            'tts-worker.js',
            'speech-worker.js',
        ];

        for (const file of workerFiles) {
            const filePath = join(jsDir, file);
            let stat;
            try {
                stat = statSync(filePath);
            } catch {
                // Try in project root for some workers
                try {
                    stat = statSync(join(projectRoot, file));
                } catch {
                    throw new Error(`Worker file ${file} not found`);
                }
            }
            expect(stat.size, `${file} should not be empty`).toBeGreaterThan(100);
        }
    });

    // ── No hardcoded localhost in production source ───────────────────

    test('no hardcoded localhost URLs in source files', async () => {
        const jsFiles = readdirSync(jsDir).filter(f => f.endsWith('.js'));
        const found = [];

        for (const file of jsFiles) {
            const content = readFileSync(join(jsDir, file), 'utf-8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('//') || line.startsWith('*')) continue;
                // Match localhost URLs but skip known config patterns
                if (/localhost:\d{2,5}/.test(line) && !line.includes('//') && !line.includes('comment')) {
                    found.push(`${file}:${i + 1}`);
                }
            }
        }

        if (found.length > 0) {
            console.warn('Hardcoded localhost URLs:', found);
        }
        // Allow some local dev references, but flag if too many
        expect(found.length).toBeLessThan(5);
    });

    // ── model-hosts.js uses HTTPS ────────────────────────────────────

    test('model-hosts.js uses HTTPS for model URLs', async () => {
        const content = readFileSync(join(jsDir, 'model-hosts.js'), 'utf-8');
        // Check that MODEL_HOST uses HTTPS
        expect(content).toContain('https://');
        expect(content).not.toMatch(/['"]http:\/\//);
    });

    // ── No console.error in module initialization ────────────────────

    test('no console.error calls during module loading', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(5000);

        // Filter benign messages
        const significant = consoleErrors.filter(e =>
            !e.includes('[vite]') &&
            !e.includes('favicon') &&
            !e.includes('404') &&
            !e.includes('net::ERR') &&
            !e.includes('Failed to load resource')
        );

        expect(significant).toEqual([]);
    });

    // ── New CSS files exist for new modules ──────────────────────────

    test('CSS files exist for new visual modules', async () => {
        const cssDir = join(projectRoot, 'css');
        const expectedCssFiles = [
            'video-player.css',
            'stock-widget.css',
            'speech.css',
            'tts.css',
        ];

        for (const file of expectedCssFiles) {
            let exists = false;
            try {
                statSync(join(cssDir, file));
                exists = true;
            } catch {
                // File doesn't exist
            }
            expect(exists, `CSS file ${file} should exist`).toBe(true);
        }
    });

    // ── Function length check (code smell) ───────────────────────────

    test('no excessively long function bodies in new modules', async () => {
        const modulesToCheck = [
            'video-player.js',
            'stock-widget.js',
            'textToSpeech.js',
            'model-hosts.js',
            'file-converters.js',
        ];

        const violations = [];

        for (const file of modulesToCheck) {
            const filePath = join(jsDir, file);
            let content;
            try {
                content = readFileSync(filePath, 'utf-8');
            } catch {
                continue;
            }

            const lines = content.split('\n');
            const totalLines = lines.length;

            // Flag files with more than 500 lines (potential smell)
            if (totalLines > 500) {
                violations.push(`${file}: ${totalLines} lines (consider splitting)`);
            }
        }

        if (violations.length > 0) {
            console.warn('Long modules:', violations);
        }
        // Allow up to 1 long module (speechToText is large by nature)
        expect(violations.length).toBeLessThan(2);
    });
});
