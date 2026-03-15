// ============================================
// disk-workspace.js — File System Access API integration
// ============================================
(function (M) {
    'use strict';

    // --- Feature Detection ---
    var supported = typeof window.showDirectoryPicker === 'function';

    // --- IndexedDB helpers for storing FileSystemDirectoryHandle ---
    var DB_NAME = 'textagent-disk';
    var DB_STORE = 'handles';
    var DB_KEY = 'root';

    function openDB() {
        return new Promise(function (resolve, reject) {
            var req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = function () {
                var db = req.result;
                if (!db.objectStoreNames.contains(DB_STORE)) {
                    db.createObjectStore(DB_STORE);
                }
            };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
        });
    }

    function idbGet(key) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB_STORE, 'readonly');
                var store = tx.objectStore(DB_STORE);
                var req = store.get(key);
                req.onsuccess = function () { resolve(req.result); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    function idbSet(key, value) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB_STORE, 'readwrite');
                var store = tx.objectStore(DB_STORE);
                var req = store.put(value, key);
                req.onsuccess = function () { resolve(); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    function idbDelete(key) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB_STORE, 'readwrite');
                var store = tx.objectStore(DB_STORE);
                var req = store.delete(key);
                req.onsuccess = function () { resolve(); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    // --- State ---
    var dirHandle = null;   // FileSystemDirectoryHandle
    var textagentDir = null; // .textagent sub-directory handle

    // --- Public API ---
    var disk = {};

    disk.isSupported = function () { return supported; };

    disk.isConnected = function () { return !!dirHandle; };

    disk.getFolderName = function () {
        return dirHandle ? dirHandle.name : '';
    };

    // Prompt user to pick a folder
    disk.pickFolder = async function () {
        if (!supported) throw new Error('File System Access API not supported');
        var handle = await window.showDirectoryPicker({ mode: 'readwrite' });
        dirHandle = handle;
        // Ensure .textagent/ subdirectory exists
        textagentDir = await dirHandle.getDirectoryHandle('.textagent', { create: true });
        // Persist handle for reconnection
        await idbSet(DB_KEY, dirHandle);
        localStorage.setItem(M.KEYS.DISK_MODE, 'true');
        return dirHandle;
    };

    // Try to reconnect to a previously stored handle
    disk.reconnect = async function () {
        if (!supported) return false;
        try {
            var stored = await idbGet(DB_KEY);
            if (!stored) return false;
            // Check/request permission
            var perm = await stored.queryPermission({ mode: 'readwrite' });
            if (perm === 'granted') {
                dirHandle = stored;
                textagentDir = await dirHandle.getDirectoryHandle('.textagent', { create: true });
                return true;
            }
            // Need to request — this requires a user gesture, so we return
            // a special value that the UI can act on
            return 'needs-permission';
        } catch (e) {
            console.warn('Disk reconnect failed:', e);
            return false;
        }
    };

    // Request permission on stored handle (must be called from user gesture)
    disk.requestPermission = async function () {
        if (!supported) return false;
        try {
            var stored = await idbGet(DB_KEY);
            if (!stored) return false;
            var perm = await stored.requestPermission({ mode: 'readwrite' });
            if (perm === 'granted') {
                dirHandle = stored;
                textagentDir = await dirHandle.getDirectoryHandle('.textagent', { create: true });
                return true;
            }
            return false;
        } catch (e) {
            console.warn('Permission request failed:', e);
            return false;
        }
    };

    // Disconnect — clear handle, revert to localStorage
    disk.disconnect = async function () {
        dirHandle = null;
        textagentDir = null;
        await idbDelete(DB_KEY);
        localStorage.removeItem(M.KEYS.DISK_MODE);
    };

    // --- Manifest (workspace.json) ---
    disk.loadManifest = async function () {
        if (!textagentDir) return null;
        try {
            var fileHandle = await textagentDir.getFileHandle('workspace.json');
            var file = await fileHandle.getFile();
            var text = await file.text();
            return JSON.parse(text);
        } catch (e) {
            // File doesn't exist yet
            return null;
        }
    };

    disk.saveManifest = async function (workspace) {
        if (!textagentDir) return;
        var fileHandle = await textagentDir.getFileHandle('workspace.json', { create: true });
        var writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(workspace, null, 2));
        await writable.close();
    };

    // --- File I/O ---
    disk.readFile = async function (name) {
        if (!dirHandle) return '';
        try {
            var fileHandle = await dirHandle.getFileHandle(name);
            var file = await fileHandle.getFile();
            return await file.text();
        } catch (e) {
            return '';
        }
    };

    disk.writeFile = async function (name, content) {
        if (!dirHandle) return;
        var fileHandle = await dirHandle.getFileHandle(name, { create: true });
        var writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
    };

    disk.deleteFile = async function (name) {
        if (!dirHandle) return;
        try {
            await dirHandle.removeEntry(name);
        } catch (e) {
            console.warn('Failed to delete file on disk:', name, e);
        }
    };

    disk.renameFile = async function (oldName, newName) {
        if (!dirHandle) return;
        try {
            // Read old file, write new, delete old
            var content = await disk.readFile(oldName);
            await disk.writeFile(newName, content);
            await disk.deleteFile(oldName);
        } catch (e) {
            console.warn('Failed to rename file on disk:', oldName, '→', newName, e);
        }
    };

    // Scan the root folder for .md files (flat — backwards compat)
    disk.scanForMdFiles = async function () {
        if (!dirHandle) return [];
        var files = [];
        for await (var entry of dirHandle.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.md')) {
                files.push(entry.name);
            }
        }
        files.sort(function (a, b) { return a.localeCompare(b); });
        return files;
    };

    // --- Recursive directory scan (tree view) ---
    // Returns: [{ name, kind: 'file'|'directory', path, children: [] }]
    // Sorted: folders first (alphabetic), then files (alphabetic)
    disk.scanDirectory = async function (handle, parentPath, maxDepth) {
        if (!handle) handle = dirHandle;
        if (!handle) return [];
        if (parentPath === undefined) parentPath = '';
        if (maxDepth === undefined) maxDepth = 5;
        if (maxDepth <= 0) return [];

        var folders = [];
        var files = [];

        for await (var entry of handle.values()) {
            var entryPath = parentPath ? parentPath + '/' + entry.name : entry.name;
            if (entry.kind === 'directory') {
                // Skip hidden/system directories
                if (entry.name.startsWith('.')) continue;
                var children = await disk.scanDirectory(entry, entryPath, maxDepth - 1);
                folders.push({ name: entry.name, kind: 'directory', path: entryPath, children: children });
            } else if (entry.kind === 'file') {
                files.push({ name: entry.name, kind: 'file', path: entryPath, children: [] });
            }
        }

        folders.sort(function (a, b) { return a.name.localeCompare(b.name); });
        files.sort(function (a, b) { return a.name.localeCompare(b.name); });
        return folders.concat(files);
    };

    // --- Path-based file I/O (for files in subdirectories) ---
    // Resolve a relative path like "notes/ideas" into a directory handle
    async function getSubdirHandle(relativePath, create) {
        if (!dirHandle) return null;
        var parts = relativePath.split('/').filter(function (p) { return p; });
        var current = dirHandle;
        for (var i = 0; i < parts.length; i++) {
            current = await current.getDirectoryHandle(parts[i], { create: !!create });
        }
        return current;
    }

    disk.readFileFromPath = async function (relativePath) {
        if (!dirHandle) return '';
        try {
            var parts = relativePath.split('/');
            var fileName = parts.pop();
            var parentDir = parts.length > 0 ? await getSubdirHandle(parts.join('/')) : dirHandle;
            var fileHandle = await parentDir.getFileHandle(fileName);
            var file = await fileHandle.getFile();
            return await file.text();
        } catch (e) {
            return '';
        }
    };

    disk.writeFileToPath = async function (relativePath, content) {
        if (!dirHandle) return;
        var parts = relativePath.split('/');
        var fileName = parts.pop();
        var parentDir = parts.length > 0 ? await getSubdirHandle(parts.join('/'), true) : dirHandle;
        var fileHandle = await parentDir.getFileHandle(fileName, { create: true });
        var writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
    };

    disk.deleteFileFromPath = async function (relativePath) {
        if (!dirHandle) return;
        try {
            var parts = relativePath.split('/');
            var fileName = parts.pop();
            var parentDir = parts.length > 0 ? await getSubdirHandle(parts.join('/')) : dirHandle;
            await parentDir.removeEntry(fileName);
        } catch (e) {
            console.warn('Failed to delete:', relativePath, e);
        }
    };

    disk.renameFileInPath = async function (oldPath, newPath) {
        if (!dirHandle) return;
        try {
            var content = await disk.readFileFromPath(oldPath);
            await disk.writeFileToPath(newPath, content);
            await disk.deleteFileFromPath(oldPath);
        } catch (e) {
            console.warn('Failed to rename:', oldPath, '→', newPath, e);
        }
    };

    // --- UI Controls ---
    // Show/hide disk-specific UI elements based on support & connection state
    disk.updateUI = function () {
        var openFolderBtn = document.getElementById('ws-open-folder');
        var headerRefresh = document.getElementById('ws-header-refresh');
        var headerDisconnect = document.getElementById('ws-header-disconnect');

        if (!supported) {
            if (openFolderBtn) openFolderBtn.style.display = 'none';
            if (headerRefresh) headerRefresh.style.display = 'none';
            if (headerDisconnect) headerDisconnect.style.display = 'none';
            return;
        }

        if (dirHandle) {
            // Connected state — hide open folder, show header controls
            if (openFolderBtn) openFolderBtn.style.display = 'none';
            if (headerRefresh) headerRefresh.style.display = '';
            if (headerDisconnect) headerDisconnect.style.display = '';
        } else {
            // Disconnected state — show open folder, hide header controls
            if (openFolderBtn) openFolderBtn.style.display = '';
            if (headerRefresh) headerRefresh.style.display = 'none';
            if (headerDisconnect) headerDisconnect.style.display = 'none';
        }
    };

    // Wire button event listeners
    disk.wireUI = function () {
        var openFolderBtn = document.getElementById('ws-open-folder');
        var headerRefresh = document.getElementById('ws-header-refresh');
        var headerDisconnect = document.getElementById('ws-header-disconnect');
        var headerTitle = document.getElementById('ws-header-title');

        if (openFolderBtn) {
            openFolderBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (M.wsConnectFolder) M.wsConnectFolder();
            });
        }

        if (headerTitle) {
            headerTitle.addEventListener('click', function (e) {
                e.stopPropagation();
                if (M.wsConnectFolder) M.wsConnectFolder();
            });
        }

        if (headerDisconnect) {
            headerDisconnect.addEventListener('click', function (e) {
                e.stopPropagation();
                if (M.wsDisconnectFolder) M.wsDisconnectFolder();
            });
        }

        if (headerRefresh) {
            headerRefresh.addEventListener('click', function (e) {
                e.stopPropagation();
                if (M.wsRefreshFromDisk) M.wsRefreshFromDisk();
            });
        }
    };

    // --- Init ---
    disk.wireUI();
    disk.updateUI();

    // Attempt reconnection on load if disk mode was previously active
    if (supported && localStorage.getItem(M.KEYS.DISK_MODE) === 'true') {
        disk.reconnect().then(function (result) {
            if (result === true) {
                // Successfully reconnected — load workspace from disk
                if (M.wsReconnectFolder) M.wsReconnectFolder();
            } else if (result === 'needs-permission') {
                // Show a persistent notice in the sidebar instead of a transient toast
                var sidebar = document.getElementById('workspace-sidebar');
                if (sidebar) {
                    var notice = document.createElement('div');
                    notice.className = 'ws-reconnect-notice';
                    notice.innerHTML =
                        '<i class="bi bi-folder-symlink"></i> ' +
                        '<span>Folder access expired. </span>' +
                        '<button id="ws-reconnect-btn" class="ws-reconnect-btn">Reconnect</button>';
                    sidebar.insertBefore(notice, sidebar.querySelector('.ws-file-list'));
                    document.getElementById('ws-reconnect-btn').addEventListener('click', function () {
                        disk.requestPermission().then(function (granted) {
                            if (granted) {
                                notice.remove();
                                if (M.wsReconnectFolder) M.wsReconnectFolder();
                            } else {
                                M.showToast('Permission denied. Try using Open Folder instead.', 'warning');
                            }
                        });
                    });
                }
            }
        });
    }

    // Expose
    M._disk = disk;

})(window.MDView);
