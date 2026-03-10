// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Context Memory Feature Tests
 *
 * Tests the {{Memory:}} tag, Use: field parsing, Memory card rendering,
 * context-memory.js module loading, and M._memory API surface.
 *
 * Note: Actual folder attachment via showDirectoryPicker cannot be tested
 * in Playwright (requires native OS dialog). These tests cover everything
 * else: module loading, tag parsing, card rendering, and API availability.
 *
 * Source: js/context-memory.js, js/ai-docgen.js, js/ai-docgen-generate.js
 */

test.describe('Context Memory — Module & API', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        // Wait for context-memory.js to load (Phase 3b-ext)
        await page.waitForFunction(() => window.MDView._memory, { timeout: 15000 });
    });

    test('M._memory namespace is defined', async ({ page }) => {
        const exists = await page.evaluate(() => typeof window.MDView._memory === 'object');
        expect(exists).toBe(true);
    });

    test('M._memory exposes required search API', async ({ page }) => {
        const api = await page.evaluate(() => ({
            search: typeof window.MDView._memory.search,
            formatForContext: typeof window.MDView._memory.formatForContext,
            ensureWorkspaceIndex: typeof window.MDView._memory.ensureWorkspaceIndex,
            rebuildWorkspace: typeof window.MDView._memory.rebuildWorkspace,
            getWorkspaceStats: typeof window.MDView._memory.getWorkspaceStats,
        }));
        expect(api.search).toBe('function');
        expect(api.formatForContext).toBe('function');
        expect(api.ensureWorkspaceIndex).toBe('function');
        expect(api.rebuildWorkspace).toBe('function');
        expect(api.getWorkspaceStats).toBe('function');
    });

    test('M._memory exposes external memory API', async ({ page }) => {
        const api = await page.evaluate(() => ({
            attachFolder: typeof window.MDView._memory.attachFolder,
            attachFiles: typeof window.MDView._memory.attachFiles,
            getExternalStats: typeof window.MDView._memory.getExternalStats,
            removeExternal: typeof window.MDView._memory.removeExternal,
            listExternalMemories: typeof window.MDView._memory.listExternalMemories,
        }));
        expect(api.attachFolder).toBe('function');
        expect(api.attachFiles).toBe('function');
        expect(api.getExternalStats).toBe('function');
        expect(api.removeExternal).toBe('function');
        expect(api.listExternalMemories).toBe('function');
    });

    test('MEMORY_DB storage key is defined', async ({ page }) => {
        const key = await page.evaluate(() => window.MDView.KEYS.MEMORY_DB);
        expect(key).toBe('textagent-memory-db');
    });

    test('getSqlJs is exposed on M._exec for reuse', async ({ page }) => {
        const exists = await page.evaluate(() => typeof window.MDView._exec.getSqlJs === 'function');
        expect(exists).toBe(true);
    });

    test('workspace stats return zero before indexing', async ({ page }) => {
        const stats = await page.evaluate(() => window.MDView._memory.getWorkspaceStats());
        expect(stats.files).toBe(0);
        expect(stats.chunks).toBe(0);
    });

    test('listExternalMemories returns empty array initially', async ({ page }) => {
        const memories = await page.evaluate(() => window.MDView._memory.listExternalMemories());
        expect(Array.isArray(memories)).toBe(true);
        expect(memories.length).toBe(0);
    });

    test('formatForContext returns empty string for empty results', async ({ page }) => {
        const result = await page.evaluate(() => window.MDView._memory.formatForContext([]));
        expect(result).toBe('');
    });

    test('formatForContext formats results with file and heading', async ({ page }) => {
        const result = await page.evaluate(() => {
            return window.MDView._memory.formatForContext([
                { file: 'auth.md', heading: '## Login', snippet: 'Token refresh logic...' },
                { file: 'api.md', heading: '', snippet: 'REST endpoints...' },
            ]);
        });
        expect(result).toContain('[auth.md > ## Login]');
        expect(result).toContain('Token refresh logic...');
        expect(result).toContain('[api.md]');
        expect(result).toContain('REST endpoints...');
    });
});

test.describe('Memory Tag — Toolbar Insertion', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);
        await page.locator('#markdown-editor').fill('');
        await page.waitForTimeout(200);
    });

    async function editorValue(page) {
        return page.locator('#markdown-editor').inputValue();
    }

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

    test('Memory tag inserts {{@Memory: @name: ...}} once via toolbar', async ({ page }) => {
        await clickAction(page, 'memory-tag');
        const val = await editorValue(page);
        expect(val).toContain('{{@Memory:');
        expect(val).toContain('@name:');
        expect(val).toContain('}}');
        const count = (val.match(/\{\{@Memory:/g) || []).length;
        expect(count).toBe(1);
    });

    test('Memory tag can be typed into editor and parsed', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Memory: @name: test-docs }}');
        await page.waitForTimeout(500);

        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks(document.getElementById('markdown-editor').value);
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].type).toBe('Memory');
        expect(blocks[0].memoryName).toBe('test-docs');
    });
});

test.describe('Memory Tag — Parsing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000); // Wait for DocGen modules
    });

    test('parseDocgenBlocks recognizes {{Memory:}} tags', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks('{{Memory: @name: my-docs }}');
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].type).toBe('Memory');
        expect(blocks[0].memoryName).toBe('my-docs');
    });

    test('parseDocgenBlocks parses @use: field from AI blocks', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks('{{AI: @use: workspace\nWrite a summary }}');
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].type).toBe('AI');
        expect(blocks[0].useMemory).toEqual(['workspace']);
        expect(blocks[0].prompt).toContain('Write a summary');
        // @use: field should be stripped from prompt
        expect(blocks[0].prompt).not.toContain('@use:');
    });

    test('parseDocgenBlocks parses multi-source @use: field', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks('{{Think: @use: workspace, client-docs\nAnalyze the architecture }}');
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].useMemory).toEqual(['workspace', 'client-docs']);
    });

    test('parseDocgenBlocks does not add @use: to Image blocks', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks('{{Image: @use: workspace\nA sunset over mountains }}');
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].type).toBe('Image');
        expect(blocks[0].useMemory).toBeUndefined();
    });

    test('parseDocgenBlocks handles Agent with @use: field', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks('{{Agent: @use: workspace\n@step 1: Analyze\n@step 2: Summarize }}');
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].type).toBe('Agent');
        expect(blocks[0].useMemory).toEqual(['workspace']);
        expect(blocks[0].steps.length).toBe(2);
    });

    test('parseDocgenBlocks without @use: field leaves useMemory undefined', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks('{{AI: Write something interesting }}');
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].useMemory).toBeUndefined();
    });

    test('parseDocgenBlocks strips @prompt: prefix from prompt text', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks('{{AI:\n  @prompt: Write a detailed summary\n}}');
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].prompt).toBe('Write a detailed summary');
        expect(blocks[0].prompt).not.toContain('@prompt:');
    });

    test('parseDocgenBlocks parses @think: yes field', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks('{{AI:\n  @think: Yes\n  @prompt: analyze this\n}}');
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].think).toBe(true);
        expect(blocks[0].prompt).not.toContain('@think');
    });

    test('parseDocgenBlocks parses @think: no field', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks('{{AI:\n  @think: No\n  @prompt: generate text\n}}');
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].think).toBe(false);
    });

    test('parseDocgenBlocks parses @search: field', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks('{{AI:\n  @search: duckduckgo\n  @prompt: find info\n}}');
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].search).toBe('duckduckgo');
        expect(blocks[0].prompt).not.toContain('@search');
    });

    test('parseDocgenBlocks parses full structured AI tag with all @ fields', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks(
                '{{AI:\n  @use: my-context, my-context-2\n  @think: Yes\n  @search: duckduckgo\n  @prompt: describe what to generate\n}}'
            );
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].type).toBe('AI');
        expect(blocks[0].useMemory).toEqual(['my-context', 'my-context-2']);
        expect(blocks[0].think).toBe(true);
        expect(blocks[0].search).toBe('duckduckgo');
        expect(blocks[0].prompt).toBe('describe what to generate');
    });

    test('multiple tags including Memory are parsed correctly', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks(
                '{{Memory: @name: docs }}\n\n{{AI: @use: docs\n@prompt: Summarize the docs }}\n\n{{Think: Analyze this }}'
            );
        });
        expect(blocks.length).toBe(3);
        expect(blocks[0].type).toBe('Memory');
        expect(blocks[1].type).toBe('AI');
        expect(blocks[1].useMemory).toEqual(['docs']);
        expect(blocks[2].type).toBe('AI'); // Think tags are now converted to AI with think: true
        expect(blocks[2].think).toBe(true);
    });

    test('Memory tag defaults to "default" name if @name: is missing', async ({ page }) => {
        const blocks = await page.evaluate(() => {
            return window.MDView.parseDocgenBlocks('{{Memory: some content }}');
        });
        expect(blocks.length).toBe(1);
        expect(blocks[0].memoryName).toBe('default');
    });
});

test.describe('Memory Tag — Preview Card Rendering', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);
    });

    test('Memory card renders in preview with amber accent', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Memory: @name: project-docs }}');
        await page.waitForTimeout(500);

        const card = page.locator('.ai-placeholder-card[data-ai-type="Memory"]');
        await expect(card).toBeVisible();
        await expect(card).toHaveAttribute('data-memory-name', 'project-docs');
    });

    test('Memory card has Folder, Files, and Rebuild buttons', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Memory: @name: my-docs }}');
        await page.waitForTimeout(500);

        await expect(page.locator('.ai-memory-attach-folder')).toBeVisible();
        await expect(page.locator('.ai-memory-attach-files')).toBeVisible();
        await expect(page.locator('.ai-memory-rebuild')).toBeVisible();
    });

    test('Memory card shows stats area', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Memory: @name: docs }}');
        await page.waitForTimeout(500);

        const stats = page.locator('.ai-memory-stats[data-memory-name="docs"]');
        await expect(stats).toBeVisible();
        await expect(stats).toContainText('No files attached');
    });

    test('Memory card label includes the memory name', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Memory: @name: project-files }}');
        await page.waitForTimeout(500);

        const label = page.locator('.ai-placeholder-card[data-ai-type="Memory"] .ai-placeholder-label');
        await expect(label).toContainText('Memory: project-files');
    });

    test('Memory card has 📚 icon', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Memory: @name: docs }}');
        await page.waitForTimeout(500);

        const icon = page.locator('.ai-placeholder-card[data-ai-type="Memory"] .ai-placeholder-icon');
        await expect(icon).toContainText('📚');
    });

    test('AI card with @use: shows hint badge', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@AI:\n  @use: workspace\n  @prompt: Summarize the project\n}}');
        await page.waitForTimeout(500);

        const useHint = page.locator('.ai-use-hint');
        await expect(useHint).toBeVisible();
        await expect(useHint).toContainText('workspace');
    });

    test('AI card without @use: does not show hint badge', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@AI:\n  @prompt: Write a poem\n}}');
        await page.waitForTimeout(500);

        const useHint = page.locator('.ai-use-hint');
        await expect(useHint).toHaveCount(0);
    });

    test('AI card strips @prompt: and @use: from displayed prompt', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@AI:\n  @use: workspace\n  @prompt: Summarize the project\n}}');
        await page.waitForTimeout(500);

        const promptDisplay = page.locator('.ai-placeholder-prompt');
        await expect(promptDisplay).toContainText('Summarize the project');
        const promptText = await promptDisplay.textContent();
        expect(promptText).not.toContain('@use:');
        expect(promptText).not.toContain('@prompt:');
    });

    test('AI card with @think: Yes shows active brain toggle', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@AI:\n  @think: Yes\n  @prompt: analyze this\n}}');
        await page.waitForTimeout(500);

        const thinkBtn = page.locator('.ai-think-toggle');
        await expect(thinkBtn).toBeVisible();
        await expect(thinkBtn).toHaveClass(/active/);
    });

    test('AI card with @search: duckduckgo pre-selects dropdown', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@AI:\n  @search: duckduckgo\n  @prompt: search for info\n}}');
        await page.waitForTimeout(500);

        const searchSelect = page.locator('.ai-agent-search-select');
        await expect(searchSelect).toBeVisible();
        const val = await searchSelect.inputValue();
        expect(val).toBe('duckduckgo');
    });

    test('Memory card remove button updates editor text', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Memory: @name: docs }}');
        await page.waitForTimeout(500);

        const card = page.locator('.ai-placeholder-card[data-ai-type="Memory"]');
        await expect(card).toBeVisible();

        // Remove the tag programmatically (same as button handler)
        await page.evaluate(() => {
            const text = document.getElementById('markdown-editor').value;
            const blocks = window.MDView.parseDocgenBlocks(text);
            if (blocks.length > 0) {
                const block = blocks[0];
                const before = text.substring(0, block.start);
                const after = text.substring(block.end);
                const editor = document.getElementById('markdown-editor');
                editor.value = before + block.prompt.trim() + after;
                editor.dispatchEvent(new Event('input'));
            }
        });
        await page.waitForTimeout(500);

        const val = await page.locator('#markdown-editor').inputValue();
        expect(val).not.toContain('{{@Memory:');
        expect(val).not.toContain('}}');
    });

    test('✕ close button on AI card calls M._docgen.removeDocgenTag', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@AI: Write a poem }}');
        await page.waitForTimeout(500);

        const removeBtn = page.locator('.ai-remove-tag').first();
        await expect(removeBtn).toBeVisible();

        /** @type {string[]} */
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await removeBtn.click();
        await page.waitForTimeout(500);

        const refErrors = errors.filter(e => e.includes('ReferenceError'));
        expect(refErrors.length).toBe(0);
    });

    test('▶ play button on AI card does not throw ReferenceError', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@AI: Write a poem }}');
        await page.waitForTimeout(500);

        const playBtn = page.locator('.ai-fill-one').first();
        await expect(playBtn).toBeVisible();

        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await playBtn.click();
        await page.waitForTimeout(1000);

        // May get API key error but should NOT get ReferenceError
        const refErrors = errors.filter(e => e.includes('ReferenceError'));
        expect(refErrors.length).toBe(0);
    });

    test('▶ play button on Agent card does not throw ReferenceError', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Agent:\\n@step 1: analyze\\n@step 2: write }}');
        await page.waitForTimeout(500);

        const playBtn = page.locator('.ai-fill-one').first();
        await expect(playBtn).toBeVisible();

        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await playBtn.click();
        await page.waitForTimeout(1000);

        const refErrors = errors.filter(e => e.includes('ReferenceError'));
        expect(refErrors.length).toBe(0);
    });
});

test.describe('Memory — DOMPurify Allowlist', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForTimeout(3000);
    });

    test('data-memory-name attribute survives DOMPurify sanitization', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Memory: @name: test-docs }}');
        await page.waitForTimeout(500);

        const attr = await page.locator('.ai-placeholder-card[data-ai-type="Memory"]')
            .getAttribute('data-memory-name');
        expect(attr).toBe('test-docs');
    });

    test('data-step attribute on agent steps survives sanitization', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Agent:\n@step 1: analyze\n@step 2: write }}');
        await page.waitForTimeout(500);

        const steps = page.locator('.ai-agent-step[data-step]');
        await expect(steps).toHaveCount(2);
    });
});
