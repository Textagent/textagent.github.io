// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tools → Calculator template — end-to-end behavioural tests.
 *
 * The calculator is shipped as a single `html-autorun` block inside the
 * Tools template. We load the template content into the editor, wait for
 * the renderer to mount it as a sandboxed iframe, then drive the buttons
 * from inside that iframe and assert on the two-line display + history
 * side panel.
 */

const EDITOR_SELECTOR = '#markdown-editor';

test.describe('Tools — Calculator template', () => {
    test.setTimeout(60_000);

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector(EDITOR_SELECTOR, { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView
                && typeof w.MDView.openTemplateModal === 'function'
                && Array.isArray(w.__MDV_TEMPLATES_TOOLS)
                && w.__MDV_TEMPLATES_TOOLS.length > 0;
        }, null, { timeout: 20_000 });

        // Inject the Calculator template directly into the editor — sidesteps
        // the "discard current content?" confirm modal that the UI flow uses.
        await page.evaluate(() => {
            const w = /** @type {any} */ (window);
            const tpl = w.__MDV_TEMPLATES_TOOLS[0];
            const editor = /** @type {HTMLTextAreaElement} */ (
                document.getElementById('markdown-editor')
            );
            editor.value = tpl.content;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            if (w.MDView && typeof w.MDView.renderMarkdown === 'function') {
                w.MDView.renderMarkdown();
            }
        });

        // Wait for the html-autorun iframe to mount and its script to wire up.
        await page.waitForFunction(() => {
            const iframe = /** @type {HTMLIFrameElement|null} */ (
                document.querySelector('.executable-html-container[data-autorun] iframe')
            );
            if (!iframe || !iframe.contentDocument) return false;
            return !!iframe.contentDocument.getElementById('result-line')
                && !!iframe.contentDocument.querySelector('button[data-num="7"]');
        }, null, { timeout: 15_000 });
    });

    /** Helper: run a sequence of button selectors inside the calculator iframe
     *  and return the {top, bot} display state after the last click.
     */
    async function press(page, ...selectors) {
        return await page.evaluate((sels) => {
            const iframe = /** @type {HTMLIFrameElement} */ (
                document.querySelector('.executable-html-container[data-autorun] iframe')
            );
            const idoc = /** @type {Document} */ (iframe.contentDocument);
            for (const s of sels) {
                const btn = /** @type {HTMLButtonElement} */ (idoc.querySelector(s));
                btn.click();
            }
            return {
                top: /** @type {HTMLElement} */ (idoc.getElementById('expr-line')).textContent,
                bot: /** @type {HTMLElement} */ (idoc.getElementById('result-line')).textContent,
            };
        }, selectors);
    }

    async function clearAll(page) {
        await page.evaluate(() => {
            const iframe = /** @type {HTMLIFrameElement} */ (
                document.querySelector('.executable-html-container[data-autorun] iframe')
            );
            const idoc = /** @type {Document} */ (iframe.contentDocument);
            /** @type {HTMLButtonElement} */ (idoc.querySelector('button[data-act="clear"]')).click();
            const clr = idoc.getElementById('clear-h');
            if (clr) /** @type {HTMLButtonElement} */ (clr).click();
        });
    }

    test('chains operands but only collapses to result on =', async ({ page }) => {
        await clearAll(page);
        // 33 + 43 + 56 + 10 =
        const out = await press(page,
            'button[data-num="3"]', 'button[data-num="3"]',
            'button[data-op="+"]',
            'button[data-num="4"]', 'button[data-num="3"]',
            'button[data-op="+"]',
            'button[data-num="5"]', 'button[data-num="6"]',
            'button[data-op="+"]',
            'button[data-num="1"]', 'button[data-num="0"]',
            'button[data-act="eq"]',
        );
        expect(out.bot).toBe('142');
        expect(out.top).toBe('33+43+56+10 =');
    });

    test('BODMAS: multiplication binds tighter than addition', async ({ page }) => {
        await clearAll(page);
        // 2 + 3 * 4 = 14 (not 20)
        const out = await press(page,
            'button[data-num="2"]', 'button[data-op="+"]',
            'button[data-num="3"]', 'button[data-op="*"]',
            'button[data-num="4"]', 'button[data-act="eq"]',
        );
        expect(out.bot).toBe('14');
    });

    test('BODMAS: brackets override precedence', async ({ page }) => {
        await clearAll(page);
        // (2 + 3) * 4 = 20
        const out = await press(page,
            'button[data-bracket="("]',
            'button[data-num="2"]', 'button[data-op="+"]', 'button[data-num="3"]',
            'button[data-bracket=")"]',
            'button[data-op="*"]', 'button[data-num="4"]',
            'button[data-act="eq"]',
        );
        expect(out.bot).toBe('20');
    });

    test('BODMAS: power outranks multiplication', async ({ page }) => {
        await clearAll(page);
        // 3 * 2 ^ 3 = 24, not (3*2)^3 = 216
        const out = await press(page,
            'button[data-num="3"]', 'button[data-op="*"]',
            'button[data-num="2"]', 'button[data-op="^"]',
            'button[data-num="3"]', 'button[data-act="eq"]',
        );
        expect(out.bot).toBe('24');
    });

    test('paste evaluates a full BODMAS expression', async ({ page }) => {
        await clearAll(page);
        const out = await page.evaluate(() => {
            const iframe = /** @type {HTMLIFrameElement} */ (
                document.querySelector('.executable-html-container[data-autorun] iframe')
            );
            const idoc = /** @type {Document} */ (iframe.contentDocument);
            const win = /** @type {Window} */ (iframe.contentWindow);
            const resultLine = /** @type {HTMLElement} */ (idoc.getElementById('result-line'));
            const ev = new win.Event('paste', { bubbles: true, cancelable: true });
            Object.defineProperty(ev, 'clipboardData', {
                value: { getData: () => '(2+3)^2*4' },
            });
            resultLine.dispatchEvent(ev);
            return {
                top: /** @type {HTMLElement} */ (idoc.getElementById('expr-line')).textContent,
                bot: resultLine.textContent,
            };
        });
        expect(out.bot).toBe('100');
    });

    test('paste rejects unsafe input (no eval injection)', async ({ page }) => {
        await clearAll(page);
        const bot = await page.evaluate(() => {
            const iframe = /** @type {HTMLIFrameElement} */ (
                document.querySelector('.executable-html-container[data-autorun] iframe')
            );
            const idoc = /** @type {Document} */ (iframe.contentDocument);
            const win = /** @type {Window} */ (iframe.contentWindow);
            const resultLine = /** @type {HTMLElement} */ (idoc.getElementById('result-line'));
            const ev = new win.Event('paste', { bubbles: true, cancelable: true });
            Object.defineProperty(ev, 'clipboardData', {
                value: { getData: () => 'alert(1)' },
            });
            resultLine.dispatchEvent(ev);
            return resultLine.textContent;
        });
        expect(bot).toBe('Error');
    });

    test('editing the expression line re-evaluates and updates the result', async ({ page }) => {
        await clearAll(page);
        // First build (2+3)^2*4 = 100
        await press(page,
            'button[data-bracket="("]',
            'button[data-num="2"]', 'button[data-op="+"]', 'button[data-num="3"]',
            'button[data-bracket=")"]',
            'button[data-op="^"]', 'button[data-num="2"]',
            'button[data-op="*"]', 'button[data-num="4"]',
            'button[data-act="eq"]',
        );

        // Edit the small expression line to 100/(4+1) and blur — bottom should become 20
        const after = await page.evaluate(() => {
            const iframe = /** @type {HTMLIFrameElement} */ (
                document.querySelector('.executable-html-container[data-autorun] iframe')
            );
            const idoc = /** @type {Document} */ (iframe.contentDocument);
            const win = /** @type {Window} */ (iframe.contentWindow);
            const expr = /** @type {HTMLElement} */ (idoc.getElementById('expr-line'));
            expr.focus();
            expr.textContent = '100/(4+1)';
            expr.dispatchEvent(new win.FocusEvent('blur', { bubbles: true }));
            return {
                top: expr.textContent,
                bot: /** @type {HTMLElement} */ (idoc.getElementById('result-line')).textContent,
            };
        });
        expect(after.top).toBe('100/(4+1) =');
        expect(after.bot).toBe('20');
    });

    test('editing a history row re-evaluates and pushes result back to display', async ({ page }) => {
        await clearAll(page);
        // Build 7 * 8 = 56 so we have one history row
        await press(page,
            'button[data-num="7"]', 'button[data-op="*"]', 'button[data-num="8"]',
            'button[data-act="eq"]',
        );

        // Edit the row's expression to "9*9" and confirm the display becomes 81
        const after = await page.evaluate(() => {
            const iframe = /** @type {HTMLIFrameElement} */ (
                document.querySelector('.executable-html-container[data-autorun] iframe')
            );
            const idoc = /** @type {Document} */ (iframe.contentDocument);
            const win = /** @type {Window} */ (iframe.contentWindow);
            const row = /** @type {HTMLElement} */ (idoc.querySelector('#hist-list .row'));
            const exprCell = /** @type {HTMLElement} */ (row.querySelector('.expr'));
            exprCell.focus();
            exprCell.textContent = '9*9';
            exprCell.dispatchEvent(new win.FocusEvent('blur', { bubbles: true }));
            return /** @type {HTMLElement} */ (idoc.getElementById('result-line')).textContent;
        });
        expect(after).toBe('81');
    });

    test('backspace cancels a pending operator', async ({ page }) => {
        await clearAll(page);
        // Press 5, then + — pending operator, display shows 5
        await press(page, 'button[data-num="5"]', 'button[data-op="+"]');
        // Press ⌫ — operator should be cancelled, display back to 5 with no chain
        const out = await press(page, 'button[data-act="back"]');
        expect(out.bot).toBe('5');
        expect(out.top).toBe('');
    });

    test('AC clears state and history (button-driven Clear)', async ({ page }) => {
        await clearAll(page);
        await press(page,
            'button[data-num="2"]', 'button[data-op="+"]', 'button[data-num="3"]',
            'button[data-act="eq"]',
        );
        await page.evaluate(() => {
            const iframe = /** @type {HTMLIFrameElement} */ (
                document.querySelector('.executable-html-container[data-autorun] iframe')
            );
            const idoc = /** @type {Document} */ (iframe.contentDocument);
            /** @type {HTMLButtonElement} */ (idoc.querySelector('button[data-act="clear"]')).click();
        });
        const state = await page.evaluate(() => {
            const iframe = /** @type {HTMLIFrameElement} */ (
                document.querySelector('.executable-html-container[data-autorun] iframe')
            );
            const idoc = /** @type {Document} */ (iframe.contentDocument);
            return {
                top: /** @type {HTMLElement} */ (idoc.getElementById('expr-line')).textContent,
                bot: /** @type {HTMLElement} */ (idoc.getElementById('result-line')).textContent,
            };
        });
        expect(state.bot).toBe('0');
        expect(state.top).toBe('');
    });
});
