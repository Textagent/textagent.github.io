// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Agent Cloud Execution Tests
 *
 * Verifies GitHub auth modal rendering, @cloud: field parsing,
 * cloud toggle UI on Agent cards, and storage key integration.
 */
test.describe('Agent Cloud Execution', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        // Wait for Phase 3k modules (github-auth.js + agent-cloud.js) to finish loading
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView &&
                w.MDView.parseDocgenBlocks &&
                w.MDView.KEYS &&
                w.MDView.KEYS.GITHUB_TOKEN &&
                w.MDView.githubAuth &&
                w.MDView.agentCloud;
        }, { timeout: 20000 });
    });

    // ═══════════════════════════════════════════
    // STORAGE KEY TESTS
    // ═══════════════════════════════════════════

    test('storage keys include agent execution keys', async ({ page }) => {
        const keys = await page.evaluate(() => {
            const K = /** @type {any} */ (window).MDView.KEYS;
            return {
                ghToken: K.GITHUB_TOKEN,
                ghUser: K.GITHUB_USER,
                provider: K.AGENT_PROVIDER,
                codespace: K.AGENT_CODESPACE_ID,
                customUrl: K.AGENT_CUSTOM_URL,
            };
        });
        expect(keys.ghToken).toBe('textagent-github-token');
        expect(keys.ghUser).toBe('textagent-github-user');
        expect(keys.provider).toBe('textagent-agent-provider');
        expect(keys.codespace).toBe('textagent-agent-codespace');
        expect(keys.customUrl).toBe('textagent-agent-custom-url');
    });

    // ═══════════════════════════════════════════
    // GITHUB AUTH MODAL TESTS
    // ═══════════════════════════════════════════

    test('GitHub auth modal exists in DOM', async ({ page }) => {
        const exists = await page.evaluate(() => {
            return !!document.getElementById('github-auth-modal');
        });
        expect(exists).toBe(true);
    });

    test('GitHub auth modal is hidden by default', async ({ page }) => {
        const display = await page.evaluate(() => {
            const modal = document.getElementById('github-auth-modal');
            return modal ? modal.style.display : null;
        });
        expect(display).toBe('none');
    });

    test('GitHub auth modal can be shown via githubAuth.showAuthModal()', async ({ page }) => {
        const display = await page.evaluate(() => {
            const w = /** @type {any} */ (window);
            if (w.MDView.githubAuth && w.MDView.githubAuth.showAuthModal) {
                w.MDView.githubAuth.showAuthModal();
            }
            const modal = document.getElementById('github-auth-modal');
            return modal ? modal.style.display : null;
        });
        expect(display).toBe('flex');
    });

    test('GitHub auth modal has connect and cancel buttons', async ({ page }) => {
        const result = await page.evaluate(() => {
            return {
                connect: !!document.getElementById('github-auth-connect'),
                cancel: !!document.getElementById('github-auth-cancel'),
                disconnect: !!document.getElementById('github-disconnect'),
            };
        });
        expect(result.connect).toBe(true);
        expect(result.cancel).toBe(true);
        expect(result.disconnect).toBe(true);
    });

    // ═══════════════════════════════════════════
    // GITHUB AUTH MODULE TESTS
    // ═══════════════════════════════════════════

    test('githubAuth module is loaded on M', async ({ page }) => {
        const result = await page.evaluate(() => {
            const auth = /** @type {any} */ (window).MDView.githubAuth;
            return {
                exists: !!auth,
                hasLogin: typeof auth?.login === 'function',
                hasLogout: typeof auth?.logout === 'function',
                hasIsAuth: typeof auth?.isAuthenticated === 'function',
                hasGetToken: typeof auth?.getToken === 'function',
                hasShowModal: typeof auth?.showAuthModal === 'function',
            };
        });
        expect(result.exists).toBe(true);
        expect(result.hasLogin).toBe(true);
        expect(result.hasLogout).toBe(true);
        expect(result.hasIsAuth).toBe(true);
        expect(result.hasGetToken).toBe(true);
        expect(result.hasShowModal).toBe(true);
    });

    test('githubAuth.isAuthenticated returns false when no token', async ({ page }) => {
        const isAuth = await page.evaluate(() => {
            localStorage.removeItem('textagent-github-token');
            return /** @type {any} */ (window).MDView.githubAuth.isAuthenticated();
        });
        expect(isAuth).toBe(false);
    });

    test('githubAuth.isAuthenticated returns true when token is set', async ({ page }) => {
        const isAuth = await page.evaluate(() => {
            localStorage.setItem('textagent-github-token', 'test-token-123');
            const result = /** @type {any} */ (window).MDView.githubAuth.isAuthenticated();
            localStorage.removeItem('textagent-github-token');
            return result;
        });
        expect(isAuth).toBe(true);
    });

    test('githubAuth.logout clears token and user', async ({ page }) => {
        const result = await page.evaluate(() => {
            const w = /** @type {any} */ (window);
            localStorage.setItem(w.MDView.KEYS.GITHUB_TOKEN, 'test-token');
            localStorage.setItem(w.MDView.KEYS.GITHUB_USER, 'testuser');
            w.MDView.githubAuth.logout();
            return {
                token: localStorage.getItem(w.MDView.KEYS.GITHUB_TOKEN),
                user: localStorage.getItem(w.MDView.KEYS.GITHUB_USER),
            };
        });
        expect(result.token).toBeNull();
        expect(result.user).toBeNull();
    });

    // ═══════════════════════════════════════════
    // AGENT CLOUD MODULE TESTS
    // ═══════════════════════════════════════════

    test('agentCloud module is loaded on M', async ({ page }) => {
        const result = await page.evaluate(() => {
            const cloud = /** @type {any} */ (window).MDView.agentCloud;
            return {
                exists: !!cloud,
                hasRun: typeof cloud?.run === 'function',
                hasStop: typeof cloud?.stop === 'function',
                hasCleanup: typeof cloud?.cleanup === 'function',
                hasIsAvailable: typeof cloud?.isAvailable === 'function',
                hasGetProvider: typeof cloud?.getProvider === 'function',
                hasSetProvider: typeof cloud?.setProvider === 'function',
            };
        });
        expect(result.exists).toBe(true);
        expect(result.hasRun).toBe(true);
        expect(result.hasStop).toBe(true);
        expect(result.hasCleanup).toBe(true);
        expect(result.hasIsAvailable).toBe(true);
        expect(result.hasGetProvider).toBe(true);
        expect(result.hasSetProvider).toBe(true);
    });

    test('agentCloud.isAvailable returns false when not authenticated', async ({ page }) => {
        const available = await page.evaluate(() => {
            localStorage.removeItem('textagent-github-token');
            return /** @type {any} */ (window).MDView.agentCloud.isAvailable();
        });
        expect(available).toBe(false);
    });

    test('agentCloud.setProvider persists to localStorage', async ({ page }) => {
        const result = await page.evaluate(() => {
            const w = /** @type {any} */ (window);
            w.MDView.agentCloud.setProvider('codespaces');
            const stored = localStorage.getItem(w.MDView.KEYS.AGENT_PROVIDER);
            const getter = w.MDView.agentCloud.getProvider();
            w.MDView.agentCloud.setProvider('');
            return { stored, getter };
        });
        expect(result.stored).toBe('codespaces');
        expect(result.getter).toBe('codespaces');
    });

    // ═══════════════════════════════════════════
    // @cloud: FIELD PARSING TESTS
    // ═══════════════════════════════════════════

    test('parseDocgenBlocks parses @cloud: yes correctly', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '{{@Agent:\n  @cloud: yes\n  1. Research topic\n  2. Write summary\n}}';
            const blocks = /** @type {any} */ (window).MDView.parseDocgenBlocks(md);
            return {
                count: blocks.length,
                type: blocks[0]?.type,
                cloud: blocks[0]?.cloud,
            };
        });
        expect(result.count).toBe(1);
        expect(result.type).toBe('Agent');
        expect(result.cloud).toBe(true);
    });

    test('parseDocgenBlocks parses @cloud: no correctly', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '{{@Agent:\n  @cloud: no\n  1. Research topic\n}}';
            const blocks = /** @type {any} */ (window).MDView.parseDocgenBlocks(md);
            return { cloud: blocks[0]?.cloud };
        });
        expect(result.cloud).toBe(false);
    });

    test('@cloud: field defaults to false when not specified', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '{{@Agent:\n  1. Research topic\n}}';
            const blocks = /** @type {any} */ (window).MDView.parseDocgenBlocks(md);
            return { cloud: blocks[0]?.cloud };
        });
        expect(result.cloud).toBe(false);
    });

    test('@cloud: field is stripped from the prompt', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '{{@Agent:\n  @cloud: yes\n  1. Research topic\n}}';
            const blocks = /** @type {any} */ (window).MDView.parseDocgenBlocks(md);
            return { promptContainsCloud: blocks[0]?.prompt?.includes('@cloud') };
        });
        expect(result.promptContainsCloud).toBe(false);
    });

    // ═══════════════════════════════════════════
    // CLOUD TOGGLE UI TESTS
    // ═══════════════════════════════════════════

    test('Agent card renders cloud toggle button', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Agent:\n  1. Research topic\n  2. Write summary\n}}');
        await page.waitForTimeout(800);

        const hasCloudBtn = await page.evaluate(() => {
            return document.querySelectorAll('#markdown-preview .ai-cloud-toggle').length;
        });
        expect(hasCloudBtn).toBeGreaterThan(0);
    });

    test('Agent card cloud toggle has active class when @cloud: yes', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Agent:\n  @cloud: yes\n  1. Research topic\n}}');
        await page.waitForTimeout(800);

        const isActive = await page.evaluate(() => {
            const btn = document.querySelector('#markdown-preview .ai-cloud-toggle');
            return btn ? btn.classList.contains('active') : false;
        });
        expect(isActive).toBe(true);
    });

    test('Agent card cloud toggle NOT active when @cloud: no', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Agent:\n  @cloud: no\n  1. Research topic\n}}');
        await page.waitForTimeout(800);

        const isActive = await page.evaluate(() => {
            const btn = document.querySelector('#markdown-preview .ai-cloud-toggle');
            return btn ? btn.classList.contains('active') : false;
        });
        expect(isActive).toBe(false);
    });

    test('clicking cloud toggle without auth opens GitHub auth modal', async ({ page }) => {
        // Ensure not authenticated
        await page.evaluate(() => {
            localStorage.removeItem('textagent-github-token');
            localStorage.removeItem('textagent-agent-provider');
        });

        await page.locator('#markdown-editor').fill('{{@Agent:\n  1. Research topic\n}}');
        await page.waitForTimeout(800);

        // Click the cloud toggle
        const cloudBtn = page.locator('#markdown-preview .ai-cloud-toggle').first();
        if (await cloudBtn.count() > 0) {
            await cloudBtn.click();
            await page.waitForTimeout(300);

            // Auth modal should be visible
            const modalDisplay = await page.evaluate(() => {
                const modal = document.getElementById('github-auth-modal');
                return modal ? modal.style.display : 'none';
            });
            expect(modalDisplay).toBe('flex');
        }
    });

    // ═══════════════════════════════════════════
    // @agenttype: FIELD PARSING TESTS
    // ═══════════════════════════════════════════

    test('parseDocgenBlocks parses @agenttype: openclaw correctly', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '{{@Agent:\n  @agenttype: openclaw\n  @cloud: yes\n  1. Run agent\n}}';
            const blocks = /** @type {any} */ (window).MDView.parseDocgenBlocks(md);
            return {
                agentType: blocks[0]?.agentType,
                cloud: blocks[0]?.cloud,
            };
        });
        expect(result.agentType).toBe('openclaw');
        expect(result.cloud).toBe(true);
    });

    test('@agenttype: field is stripped from the prompt', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '{{@Agent:\n  @agenttype: openfang\n  1. Run agent\n}}';
            const blocks = /** @type {any} */ (window).MDView.parseDocgenBlocks(md);
            return { promptContainsAgentType: blocks[0]?.prompt?.includes('@agenttype') };
        });
        expect(result.promptContainsAgentType).toBe(false);
    });

    test('@agenttype: works with @cloud: no for local execution', async ({ page }) => {
        const result = await page.evaluate(() => {
            const md = '{{@Agent:\n  @cloud: no\n  @agenttype: openclaw\n  1. Clone repo\n  2. Run agent\n}}';
            const blocks = /** @type {any} */ (window).MDView.parseDocgenBlocks(md);
            return {
                agentType: blocks[0]?.agentType,
                cloud: blocks[0]?.cloud,
            };
        });
        expect(result.agentType).toBe('openclaw');
        expect(result.cloud).toBe(false);
    });

    test('Agent card shows agenttype badge when @agenttype is set', async ({ page }) => {
        await page.locator('#markdown-editor').fill('{{@Agent:\n  @agenttype: openclaw\n  1. Run agent\n}}');
        await page.waitForTimeout(800);

        const badge = await page.evaluate(() => {
            const el = document.querySelector('#markdown-preview .ai-agenttype-badge');
            return el ? el.textContent.trim() : null;
        });
        expect(badge).toBe('openclaw');
    });
});
