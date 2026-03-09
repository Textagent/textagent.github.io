// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Disk Workspace Feature Tests
 *
 * Tests the disk workspace module loading, UI elements, API surface,
 * and workspace sidebar integration. Note: actual folder I/O cannot
 * be tested in Playwright because showDirectoryPicker requires a
 * native OS dialog and user-granted permission.
 *
 * Source: js/disk-workspace.js, js/workspace.js, index.html
 */

test.describe('Disk Workspace — Module & API', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        // Wait for disk-workspace.js to load (Phase 1, right after workspace.js)
        await page.waitForFunction(() => window.MDView._disk, { timeout: 10000 });
    });

    test('M._disk namespace is defined with required methods', async ({ page }) => {
        const api = await page.evaluate(() => ({
            isSupported: typeof window.MDView._disk.isSupported,
            isConnected: typeof window.MDView._disk.isConnected,
            pickFolder: typeof window.MDView._disk.pickFolder,
            reconnect: typeof window.MDView._disk.reconnect,
            disconnect: typeof window.MDView._disk.disconnect,
            loadManifest: typeof window.MDView._disk.loadManifest,
            saveManifest: typeof window.MDView._disk.saveManifest,
            readFile: typeof window.MDView._disk.readFile,
            writeFile: typeof window.MDView._disk.writeFile,
            deleteFile: typeof window.MDView._disk.deleteFile,
            renameFile: typeof window.MDView._disk.renameFile,
            scanForMdFiles: typeof window.MDView._disk.scanForMdFiles,
            updateUI: typeof window.MDView._disk.updateUI,
            wireUI: typeof window.MDView._disk.wireUI,
            getFolderName: typeof window.MDView._disk.getFolderName,
            requestPermission: typeof window.MDView._disk.requestPermission,
        }));
        for (const [key, value] of Object.entries(api)) {
            expect(value, `M._disk.${key} should be a function`).toBe('function');
        }
    });

    test('File System Access API is detected in Chromium', async ({ page }) => {
        const supported = await page.evaluate(() => window.MDView._disk.isSupported());
        // Playwright uses Chromium by default, which supports showDirectoryPicker
        expect(supported).toBe(true);
    });

    test('starts in disconnected state', async ({ page }) => {
        const connected = await page.evaluate(() => window.MDView._disk.isConnected());
        expect(connected).toBe(false);

        const folderName = await page.evaluate(() => window.MDView._disk.getFolderName());
        expect(folderName).toBe('');
    });

    test('M.wsDiskMode is false by default', async ({ page }) => {
        const diskMode = await page.evaluate(() => window.MDView.wsDiskMode);
        expect(diskMode).toBe(false);
    });

    test('DISK_MODE storage key is defined', async ({ page }) => {
        const key = await page.evaluate(() => window.MDView.KEYS.DISK_MODE);
        expect(key).toBe('textagent-disk-mode');
    });

    test('disk workspace public API functions are defined on MDView', async ({ page }) => {
        const api = await page.evaluate(() => ({
            wsConnectFolder: typeof window.MDView.wsConnectFolder,
            wsDisconnectFolder: typeof window.MDView.wsDisconnectFolder,
            wsRefreshFromDisk: typeof window.MDView.wsRefreshFromDisk,
            wsReconnectFolder: typeof window.MDView.wsReconnectFolder,
        }));
        expect(api.wsConnectFolder).toBe('function');
        expect(api.wsDisconnectFolder).toBe('function');
        expect(api.wsRefreshFromDisk).toBe('function');
        expect(api.wsReconnectFolder).toBe('function');
    });
});

test.describe('Disk Workspace — UI Elements', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView._disk, { timeout: 10000 });
    });

    test('Open Folder button exists in sidebar header', async ({ page }) => {
        const btn = page.locator('#ws-open-folder');
        await expect(btn).toBeAttached();
    });

    test('Open Folder button is visible when API is supported', async ({ page }) => {
        const supported = await page.evaluate(() => window.MDView._disk.isSupported());
        const btn = page.locator('#ws-open-folder');

        if (supported) {
            // In Chromium, button should be visible (display != none)
            const display = await btn.evaluate(el => getComputedStyle(el).display);
            expect(display).not.toBe('none');
        }
    });

    test('header disk controls are hidden when disconnected', async ({ page }) => {
        const refreshBtn = page.locator('#ws-header-refresh');
        const disconnectBtn = page.locator('#ws-header-disconnect');
        await expect(refreshBtn).toBeAttached();
        await expect(refreshBtn).toBeHidden();
        await expect(disconnectBtn).toBeAttached();
        await expect(disconnectBtn).toBeHidden();
    });

    test('header disk control buttons exist in the DOM', async ({ page }) => {
        await expect(page.locator('#ws-header-refresh')).toBeAttached();
        await expect(page.locator('#ws-header-disconnect')).toBeAttached();
    });
});

test.describe('Workspace Sidebar — Core Behavior', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => window.MDView && window.MDView.currentViewMode === 'split');
        await page.waitForFunction(() => window.MDView._disk, { timeout: 10000 });
    });

    test('sidebar opens and closes via toggle', async ({ page }) => {
        // Initially closed
        const isOpenBefore = await page.evaluate(() => window.MDView.wsIsSidebarOpen());
        expect(isOpenBefore).toBe(false);

        // Open
        await page.evaluate(() => window.MDView.wsToggleSidebar());
        const isOpenAfter = await page.evaluate(() => window.MDView.wsIsSidebarOpen());
        expect(isOpenAfter).toBe(true);

        // Sidebar element should have 'open' class
        const sidebar = page.locator('#workspace-sidebar');
        await expect(sidebar).toHaveClass(/open/);

        // Close
        await page.evaluate(() => window.MDView.wsCloseSidebar());
        const isOpenFinal = await page.evaluate(() => window.MDView.wsIsSidebarOpen());
        expect(isOpenFinal).toBe(false);
    });

    test('workspace has at least one file on startup', async ({ page }) => {
        const files = await page.evaluate(() => window.MDView.wsGetFiles());
        expect(files.length).toBeGreaterThanOrEqual(1);
    });

    test('wsActiveFileId is set on startup', async ({ page }) => {
        const activeId = await page.evaluate(() => window.MDView.wsActiveFileId);
        expect(activeId).toBeTruthy();
        expect(typeof activeId).toBe('string');
    });

    test('creating a new file adds it to the workspace', async ({ page }) => {
        const beforeCount = await page.evaluate(() => window.MDView.wsGetFiles().length);
        await page.evaluate(() => window.MDView.wsCreateFile('Test Document.md'));
        const afterCount = await page.evaluate(() => window.MDView.wsGetFiles().length);
        expect(afterCount).toBe(beforeCount + 1);

        // New file should be the active file
        const files = await page.evaluate(() => window.MDView.wsGetFiles());
        const newFile = files.find(f => f.name === 'Test Document.md');
        expect(newFile).toBeTruthy();
    });

    test('creating a file with duplicate name auto-deduplicates', async ({ page }) => {
        await page.evaluate(() => window.MDView.wsCreateFile('Duplicate.md'));
        await page.evaluate(() => window.MDView.wsCreateFile('Duplicate.md'));
        const files = await page.evaluate(() => window.MDView.wsGetFiles());
        const dupes = files.filter(f => f.name.startsWith('Duplicate'));
        expect(dupes.length).toBe(2);
        // Second one should be "Duplicate 2.md"
        expect(dupes.some(f => f.name === 'Duplicate 2.md')).toBe(true);
    });

    test('file rename updates the file name', async ({ page }) => {
        const files = await page.evaluate(() => window.MDView.wsGetFiles());
        const firstId = files[0].id;
        await page.evaluate(id => window.MDView.wsRenameFile(id, 'Renamed File.md'), firstId);

        const updatedFiles = await page.evaluate(() => window.MDView.wsGetFiles());
        const renamed = updatedFiles.find(f => f.id === firstId);
        expect(renamed.name).toBe('Renamed File.md');
    });

    test('file rename adds .md extension if missing', async ({ page }) => {
        const files = await page.evaluate(() => window.MDView.wsGetFiles());
        const firstId = files[0].id;
        await page.evaluate(id => window.MDView.wsRenameFile(id, 'No Extension'), firstId);

        const updatedFiles = await page.evaluate(() => window.MDView.wsGetFiles());
        const renamed = updatedFiles.find(f => f.id === firstId);
        expect(renamed.name).toBe('No Extension.md');
    });

    test('deleting the last file clears it instead of removing', async ({ page }) => {
        // Ensure only one file
        const files = await page.evaluate(() => window.MDView.wsGetFiles());
        if (files.length > 1) {
            // Delete extras first (use confirm override)
            for (let i = 1; i < files.length; i++) {
                await page.evaluate(id => {
                    window.confirm = () => true;
                    window.MDView.wsDeleteFile(id);
                }, files[i].id);
            }
        }

        // Now try to delete the last one — should clear content, not remove
        const lastFiles = await page.evaluate(() => window.MDView.wsGetFiles());
        expect(lastFiles.length).toBe(1);

        await page.evaluate(id => window.MDView.wsDeleteFile(id), lastFiles[0].id);

        const afterFiles = await page.evaluate(() => window.MDView.wsGetFiles());
        expect(afterFiles.length).toBe(1); // Still 1 file
    });

    test('wsSaveCurrent persists editor content to localStorage', async ({ page }) => {
        const activeId = await page.evaluate(() => window.MDView.wsActiveFileId);

        // Type something in the editor
        await page.locator('#markdown-editor').fill('# Persistence Test');
        await page.evaluate(() => window.MDView.wsSaveCurrent());

        // Check localStorage
        const saved = await page.evaluate(id => {
            return localStorage.getItem(window.MDView.KEYS.FILE_PREFIX + id);
        }, activeId);
        expect(saved).toBe('# Persistence Test');
    });

    test('page title updates to reflect active file name', async ({ page }) => {
        await page.evaluate(() => window.MDView.wsCreateFile('Title Test.md'));
        const title = await page.title();
        expect(title).toContain('Title Test');
        expect(title).toContain('TextAgent');
    });

    test('sidebar open state persists in localStorage', async ({ page }) => {
        await page.evaluate(() => window.MDView.wsToggleSidebar());
        const stored = await page.evaluate(
            () => localStorage.getItem(window.MDView.KEYS.SIDEBAR_OPEN)
        );
        expect(stored).toBe('true');

        await page.evaluate(() => window.MDView.wsToggleSidebar());
        const storedAfter = await page.evaluate(
            () => localStorage.getItem(window.MDView.KEYS.SIDEBAR_OPEN)
        );
        expect(storedAfter).toBe('false');
    });
});
