// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests for js/version-history.js — local version history:
 * snapshot capture, IndexedDB ring, history panel, line diff, restore.
 */
test.describe('Version History', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && !!window.MDView.versionHistory, null, { timeout: 20000 });
    });

    test('MDView.versionHistory API is exposed', async ({ page }) => {
        const api = await page.evaluate(() => {
            const vh = window.MDView.versionHistory;
            return {
                onSave: typeof vh.onSave,
                open: typeof vh.open,
                close: typeof vh.close,
                snapshotNow: typeof vh.snapshotNow,
                deleteFileHistory: typeof vh.deleteFileHistory,
            };
        });
        expect(api).toEqual({ onSave: 'function', open: 'function', close: 'function', snapshotNow: 'function', deleteFileHistory: 'function' });
    });

    test('deleteFileHistory purges all snapshots for a file', async ({ page }) => {
        const counts = await page.evaluate(async () => {
            const M = window.MDView;
            const id = M.wsActiveFileId || '__default__';
            M.markdownEditor.value = '# Purge test';
            await M.versionHistory.snapshotNow('purge');
            const before = (await M.versionHistory._list(id)).length;
            await M.versionHistory.deleteFileHistory(id);
            const after = (await M.versionHistory._list(id)).length;
            return { before, after };
        });
        expect(counts.before).toBeGreaterThanOrEqual(1);
        expect(counts.after).toBe(0);
    });

    test('snapshotNow stores a snapshot in IndexedDB', async ({ page }) => {
        const count = await page.evaluate(async () => {
            const M = window.MDView;
            M.markdownEditor.value = '# Snapshot test\n\ncontent v1';
            await M.versionHistory.snapshotNow('spec');
            const list = await M.versionHistory._list(M.wsActiveFileId || '__default__');
            return list.filter(s => s.label === 'spec').length;
        });
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('line diff reports adds and deletions correctly', async ({ page }) => {
        const d = await page.evaluate(() => {
            const diff = window.MDView.versionHistory._diff('a\nb\nc', 'a\nB\nc\nd');
            return {
                adds: diff.filter(x => x.type === 'add').length,
                dels: diff.filter(x => x.type === 'del').length,
                sames: diff.filter(x => x.type === 'same').length,
            };
        });
        expect(d).toEqual({ adds: 2, dels: 1, sames: 2 });
    });

    test('history panel opens with snapshot list and closes', async ({ page }) => {
        await page.evaluate(async () => {
            const M = window.MDView;
            M.markdownEditor.value = '# Panel test';
            await M.versionHistory.snapshotNow('panel');
            M.versionHistory.open();
        });
        await expect(page.locator('.vh-panel')).toBeVisible();
        await expect(page.locator('.vh-item').first()).toBeVisible();
        await page.locator('.vh-close').click();
        await expect(page.locator('.vh-panel')).toHaveCount(0);
    });

    test('restore returns the editor to the snapshot content and adds a safety snapshot', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const M = window.MDView;
            const v1 = '# Restore test\n\noriginal line';
            M.markdownEditor.value = v1;
            await M.versionHistory.snapshotNow('r1');
            M.markdownEditor.value = '# Restore test\n\nCHANGED line\nextra line';
            M.versionHistory.open();
            await new Promise(r => setTimeout(r, 500));
            // select the r1 snapshot (newest-first list: find by label via item order is fragile,
            // so click each until the restore target matches)
            const items = document.querySelectorAll('.vh-item');
            items[items.length - 1].scrollIntoView();
            return { items: items.length, v1 };
        });
        expect(result.items).toBeGreaterThanOrEqual(1);

        // Click the item whose label text contains r1, then restore
        await page.locator('.vh-item', { hasText: 'r1' }).first().click();
        await page.locator('.vh-restore').click();
        await page.waitForTimeout(700);

        const after = await page.evaluate(async () => {
            const M = window.MDView;
            const list = await M.versionHistory._list(M.wsActiveFileId || '__default__');
            return {
                editor: M.markdownEditor.value,
                hasSafety: list.some(s => s.label === 'before restore'),
                panelClosed: !document.querySelector('.vh-panel'),
            };
        });
        expect(after.editor).toBe('# Restore test\n\noriginal line');
        expect(after.hasSafety).toBe(true);
        expect(after.panelClosed).toBe(true);
    });

    test('workspace context menu includes a History item', async ({ page }) => {
        const exists = await page.evaluate(() => !!document.getElementById('ws-ctx-history'));
        expect(exists).toBe(true);
    });

    test('onSave dedupes identical content (no snapshot spam)', async ({ page }) => {
        const counts = await page.evaluate(async () => {
            const M = window.MDView;
            const id = M.wsActiveFileId || '__default__';
            M.markdownEditor.value = '# Dedupe test unique 9182';
            await M.versionHistory.snapshotNow('dedupe');
            const before = (await M.versionHistory._list(id)).length;
            // repeated saves with identical content must not add snapshots
            for (let i = 0; i < 5; i++) M.versionHistory.onSave(id, M.markdownEditor.value);
            await new Promise(r => setTimeout(r, 400));
            const after = (await M.versionHistory._list(id)).length;
            return { before, after };
        });
        expect(counts.after).toBe(counts.before);
    });
});
