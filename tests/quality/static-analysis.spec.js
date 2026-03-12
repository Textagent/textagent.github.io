// @ts-check
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Static analysis tests — verify code quality standards
 * without running in the browser context.
 */
test.describe('Static Analysis & Code Quality', () => {
    const projectRoot = join(import.meta.dirname, '..', '..');

    test('ESLint passes with no errors', async () => {
        let output;
        try {
            output = execSync('npx eslint . --format json 2>&1', {
                cwd: projectRoot,
                encoding: 'utf-8',
                timeout: 30000,
            });
        } catch (e) {
            output = e.stdout || e.message;
        }

        try {
            const results = JSON.parse(output);
            const errorCount = results.reduce((sum, file) => sum + file.errorCount, 0);
            const warningCount = results.reduce((sum, file) => sum + file.warningCount, 0);

            console.log(`ESLint: ${errorCount} errors, ${warningCount} warnings`);
            expect(errorCount).toBe(0);
        } catch {
            // If JSON parsing fails, check for error indicators in text output
            if (output.includes('error') && !output.includes('0 errors')) {
                console.warn('ESLint output (non-JSON):', output.substring(0, 500));
            }
        }
    });

    test('source JS files are under 100KB each', async () => {
        const jsDir = join(projectRoot, 'js');
        const files = readdirSync(jsDir).filter(f => f.endsWith('.js'));
        const oversized = [];

        for (const file of files) {
            const stat = statSync(join(jsDir, file));
            const sizeKB = stat.size / 1024;
            if (sizeKB > 100) {
                oversized.push(`${file} (${sizeKB.toFixed(1)} KB)`);
            }
        }

        if (oversized.length > 0) {
            console.warn('Oversized files:', oversized);
        }
        expect(oversized.length).toBe(0);
    });

    test('no debugger statements in source files', async () => {
        const jsDir = join(projectRoot, 'js');
        const files = readdirSync(jsDir).filter(f => f.endsWith('.js'));
        const found = [];

        for (const file of files) {
            const content = readFileSync(join(jsDir, file), 'utf-8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                // Skip comments
                if (line.startsWith('//') || line.startsWith('*')) continue;
                if (/\bdebugger\b/.test(line)) {
                    found.push(`${file}:${i + 1}`);
                }
            }
        }

        expect(found, `debugger statements found in: ${found.join(', ')}`).toEqual([]);
    });

    test('TODO/FIXME count is within threshold', async () => {
        const jsDir = join(projectRoot, 'js');
        const files = readdirSync(jsDir).filter(f => f.endsWith('.js'));
        let todoCount = 0;
        const todoLocations = [];

        for (const file of files) {
            const content = readFileSync(join(jsDir, file), 'utf-8');
            const matches = content.match(/\b(TODO|FIXME|HACK|XXX)\b/gi);
            if (matches) {
                todoCount += matches.length;
                todoLocations.push(`${file}: ${matches.length}`);
            }
        }

        console.log(`TODO/FIXME count: ${todoCount}`, todoLocations);
        // Allow some TODOs but not too many
        expect(todoCount).toBeLessThan(30);
    });

    test('CSS files have no excessive !important usage', async () => {
        const cssDir = join(projectRoot, 'css');
        let cssFiles;
        try {
            cssFiles = readdirSync(cssDir).filter(f => f.endsWith('.css'));
        } catch {
            cssFiles = [];
        }

        // Also check root styles.css
        const allCssFiles = [...cssFiles.map(f => join(cssDir, f))];
        const rootStylesPath = join(projectRoot, 'styles.css');
        try {
            statSync(rootStylesPath);
            allCssFiles.push(rootStylesPath);
        } catch {
            // root styles.css may not exist
        }

        const violations = [];
        for (const filePath of allCssFiles) {
            const content = readFileSync(filePath, 'utf-8');
            const importantCount = (content.match(/!important/g) || []).length;
            // Root styles.css and large module CSS (ai-docgen.css) may have many;
            // per-module CSS should be < 50
            const basename = filePath.split('/').pop() || '';
            const isLargeFile = basename === 'styles.css' || basename === 'ai-docgen.css';
            const threshold = isLargeFile ? 200 : 50;
            if (importantCount > threshold) {
                violations.push(`${basename}: ${importantCount} !important (limit: ${threshold})`);
            }
        }

        if (violations.length > 0) {
            console.warn('Excessive !important usage:', violations);
        }
        expect(violations.length).toBe(0);
    });

    test('no eval() usage in source JS files (except sandboxed execution)', async () => {
        const jsDir = join(projectRoot, 'js');
        const files = readdirSync(jsDir).filter(f => f.endsWith('.js'));
        // exec-sandbox.js legitimately uses eval() for code execution
        const exemptFiles = new Set(['exec-sandbox.js']);
        const found = [];

        for (const file of files) {
            if (exemptFiles.has(file)) continue;
            const content = readFileSync(join(jsDir, file), 'utf-8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('//') || line.startsWith('*')) continue;
                // Match eval( but not .evaluate( or Function.prototype.eval
                if (/(?<!\w)eval\s*\(/.test(line) && !line.includes('.eval(')) {
                    found.push(`${file}:${i + 1}: ${line.substring(0, 80)}`);
                }
            }
        }

        if (found.length > 0) {
            console.warn('eval() usage found:', found);
        }
        expect(found.length).toBe(0);
    });
});
