// ============================================
// workspace.js — Multi-File Workspace Manager (localStorage + disk-backed)
// ============================================
(function (M) {
    'use strict';

    var WORKSPACE_KEY = M.KEYS.WORKSPACE;
    var FILE_PREFIX = M.KEYS.FILE_PREFIX;
    var OLD_AUTOSAVE_KEY = M.KEYS.AUTOSAVE;
    var OLD_AUTOSAVE_TIME_KEY = M.KEYS.AUTOSAVE_TIME;

    // --- Workspace State ---
    var workspace = null;  // { files: [...], activeFileId: string }
    var sidebarOpen = false;
    var diskMode = false;  // true when connected to a disk folder
    var diskTreeData = null; // cached directory tree for disk mode
    var expandedFolders = new Set(); // track which folders are expanded
    var activeFilePath = null; // relative path of active file in disk mode

    // --- DOM refs ---
    var sidebar = document.getElementById('workspace-sidebar');
    var fileList = document.getElementById('workspace-file-list');
    var toggleBtn = document.getElementById('workspace-toggle');
    var newFileBtn = document.getElementById('workspace-new-file');
    var contextMenu = document.getElementById('workspace-context-menu');

    // --- Helpers ---
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    }

    function saveWorkspace() {
        try {
            localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
        } catch (e) { console.warn('Workspace save failed:', e); }
        // Also persist to disk manifest when in disk mode
        if (diskMode && M._disk && M._disk.isConnected()) {
            M._disk.saveManifest(workspace).catch(function (e) {
                console.warn('Disk manifest save failed:', e);
            });
        }
    }

    function loadWorkspace() {
        try {
            var raw = localStorage.getItem(WORKSPACE_KEY);
            if (raw) {
                workspace = JSON.parse(raw);
                if (!workspace.files || !Array.isArray(workspace.files)) {
                    workspace = null;
                }
            }
        } catch (e) { workspace = null; }
    }

    function getFileContent(id) {
        return localStorage.getItem(FILE_PREFIX + id) || '';
    }

    // Async version for disk mode
    function getFileContentAsync(id) {
        if (diskMode && M._disk && M._disk.isConnected()) {
            var file = findFileById(id);
            if (file) return M._disk.readFile(file.name);
        }
        return Promise.resolve(getFileContent(id));
    }

    function setFileContent(id, content) {
        try {
            localStorage.setItem(FILE_PREFIX + id, content);
        } catch (e) { console.warn('File save failed:', e); }
        // Also write to disk when in disk mode
        if (diskMode && M._disk && M._disk.isConnected()) {
            var file = findFileById(id);
            if (file) {
                M._disk.writeFile(file.name, content).catch(function (e) {
                    console.warn('Disk file write failed:', e);
                });
            }
        }
    }

    function removeFileContent(id) {
        localStorage.removeItem(FILE_PREFIX + id);
        if (diskMode && M._disk && M._disk.isConnected()) {
            var file = findFileById(id);
            if (file) {
                M._disk.deleteFile(file.name).catch(function (e) {
                    console.warn('Disk file delete failed:', e);
                });
            }
        }
    }

    function findFileById(id) {
        if (!workspace) return null;
        for (var i = 0; i < workspace.files.length; i++) {
            if (workspace.files[i].id === id) return workspace.files[i];
        }
        return null;
    }

    // --- Migration: old single-doc → workspace ---
    function migrateOldAutosave() {
        var oldContent = localStorage.getItem(OLD_AUTOSAVE_KEY);
        if (!oldContent || !oldContent.trim()) return;
        var id = generateId();
        var name = 'Recovered Document.md';
        // Try to extract a name from the first heading
        var headingMatch = oldContent.match(/^#+\s+(.+)/m);
        if (headingMatch) {
            var heading = headingMatch[1].trim().substring(0, 40);
            name = heading.replace(/[^a-zA-Z0-9\s\-_.]/g, '').trim() || name;
            if (!name.endsWith('.md')) name += '.md';
        }
        workspace = {
            files: [{ id: id, name: name, createdAt: Date.now() }],
            activeFileId: id
        };
        setFileContent(id, oldContent);
        saveWorkspace();
        // Clean up old keys
        localStorage.removeItem(OLD_AUTOSAVE_KEY);
        localStorage.removeItem(OLD_AUTOSAVE_TIME_KEY);
    }

    // --- Initialize workspace ---
    function initWorkspace() {
        loadWorkspace();
        if (!workspace) {
            // Check for old autosave data to migrate
            migrateOldAutosave();
        }
        if (!workspace) {
            // Brand new user — create a default file
            var id = generateId();
            workspace = {
                files: [{ id: id, name: 'Untitled.md', createdAt: Date.now() }],
                activeFileId: id
            };
            saveWorkspace();
        }
        // Ensure activeFileId points to a valid file
        if (!findFileById(workspace.activeFileId) && workspace.files.length > 0) {
            workspace.activeFileId = workspace.files[0].id;
            saveWorkspace();
        }
    }

    // --- Render sidebar file list ---
    function renderFileList() {
        if (!fileList) return;

        // Update header label
        var folderLabel = document.getElementById('ws-folder-label');
        if (folderLabel) {
            if (diskMode && M._disk && M._disk.isConnected()) {
                folderLabel.textContent = M._disk.getFolderName();
            } else {
                folderLabel.textContent = 'Files';
            }
        }

        // If in disk mode with tree data, render tree view
        if (diskMode && diskTreeData) {
            renderDiskTreeView();
            return;
        }

        // Default flat rendering
        fileList.innerHTML = '';
        workspace.files.forEach(function (file) {
            var li = document.createElement('li');
            li.className = 'ws-file-item' + (file.id === workspace.activeFileId ? ' active' : '');
            li.setAttribute('data-file-id', file.id);
            li.title = file.name;

            var icon = document.createElement('i');
            icon.className = 'bi bi-file-earmark-text ws-file-icon';

            var nameSpan = document.createElement('span');
            nameSpan.className = 'ws-file-name';
            nameSpan.textContent = file.name;

            li.appendChild(icon);
            li.appendChild(nameSpan);

            // Click to open
            li.addEventListener('click', function (e) {
                if (e.target.closest('.ws-file-actions')) return;
                M.wsOpenFile(file.id);
            });

            // Right-click / context menu
            li.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                showContextMenu(e, file.id);
            });

            fileList.appendChild(li);
        });
    }

    // --- Disk Tree View Rendering ---
    function renderDiskTreeView() {
        if (!fileList) return;
        fileList.innerHTML = '';
        renderTreeNodes(diskTreeData, fileList, 0);
    }

    function renderTreeNodes(entries, parentEl, depth) {
        entries.forEach(function (entry) {
            if (entry.kind === 'directory') {
                renderFolderNode(entry, parentEl, depth);
            } else {
                renderFileNode(entry, parentEl, depth);
            }
        });
    }

    function renderFolderNode(entry, parentEl, depth) {
        var li = document.createElement('li');
        li.className = 'ws-tree-folder';

        var row = document.createElement('div');
        row.className = 'ws-tree-row';
        row.style.paddingLeft = (8 + depth * 16) + 'px';

        var isExpanded = expandedFolders.has(entry.path);

        var chevron = document.createElement('i');
        chevron.className = 'bi ws-tree-chevron ' + (isExpanded ? 'bi-chevron-down' : 'bi-chevron-right');

        var folderIcon = document.createElement('i');
        folderIcon.className = 'bi ' + (isExpanded ? 'bi-folder2-open' : 'bi-folder2') + ' ws-tree-icon';

        var nameSpan = document.createElement('span');
        nameSpan.className = 'ws-tree-name ws-tree-folder-name';
        nameSpan.textContent = entry.name;

        row.appendChild(chevron);
        row.appendChild(folderIcon);
        row.appendChild(nameSpan);

        // Click to expand/collapse
        row.addEventListener('click', function () {
            if (expandedFolders.has(entry.path)) {
                expandedFolders.delete(entry.path);
            } else {
                expandedFolders.add(entry.path);
            }
            renderDiskTreeView();
        });

        li.appendChild(row);

        // Children container
        if (isExpanded && entry.children && entry.children.length > 0) {
            var childUl = document.createElement('ul');
            childUl.className = 'ws-tree-children';
            renderTreeNodes(entry.children, childUl, depth + 1);
            li.appendChild(childUl);
        }

        parentEl.appendChild(li);
    }

    function renderFileNode(entry, parentEl, depth) {
        var li = document.createElement('li');
        var isActive = (activeFilePath === entry.path);
        li.className = 'ws-tree-file' + (isActive ? ' active' : '');
        li.title = entry.path;
        li.setAttribute('data-path', entry.path);

        var row = document.createElement('div');
        row.className = 'ws-tree-row';
        // Extra indent for files to align with folder names (chevron space)
        row.style.paddingLeft = (8 + depth * 16 + 18) + 'px';

        var fileIcon = document.createElement('i');
        var ext = entry.name.split('.').pop().toLowerCase();
        var iconClass = 'bi-file-earmark-text';
        if (ext === 'md') iconClass = 'bi-markdown';
        else if (ext === 'json') iconClass = 'bi-filetype-json';
        else if (ext === 'js') iconClass = 'bi-filetype-js';
        else if (ext === 'css') iconClass = 'bi-filetype-css';
        else if (ext === 'html') iconClass = 'bi-filetype-html';
        else if (ext === 'py') iconClass = 'bi-filetype-py';
        else if (ext === 'yml' || ext === 'yaml') iconClass = 'bi-filetype-yml';
        else if (ext === 'xml') iconClass = 'bi-filetype-xml';
        else if (ext === 'csv') iconClass = 'bi-filetype-csv';
        else if (ext === 'txt') iconClass = 'bi-file-earmark-text';
        else if (ext === 'png' || ext === 'jpg' || ext === 'gif' || ext === 'svg' || ext === 'webp') iconClass = 'bi-file-earmark-image';
        fileIcon.className = 'bi ' + iconClass + ' ws-tree-icon';

        var nameSpan = document.createElement('span');
        nameSpan.className = 'ws-tree-name';
        nameSpan.textContent = entry.name;

        row.appendChild(fileIcon);
        row.appendChild(nameSpan);

        // Click to open file
        row.addEventListener('click', function () {
            openDiskFile(entry);
        });

        // Right-click context menu — find or create workspace entry for this file
        row.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            var wsFile = findFileByName(entry.path) || findFileByName(entry.name);
            // Auto-add to workspace if not found (disk file not yet tracked)
            if (!wsFile) {
                var id = generateId();
                wsFile = { id: id, name: entry.path || entry.name, createdAt: Date.now() };
                workspace.files.push(wsFile);
                saveWorkspace();
            }
            showContextMenu(e, wsFile.id);
        });

        li.appendChild(row);
        parentEl.appendChild(li);
    }

    function findFileByName(name) {
        if (!workspace) return null;
        for (var i = 0; i < workspace.files.length; i++) {
            if (workspace.files[i].name === name) return workspace.files[i];
        }
        return null;
    }

    function openDiskFile(entry) {
        if (!M._disk || !M._disk.isConnected()) return;

        // Save current file
        M.wsSaveCurrent();

        // Check if this file is already in the workspace manifest
        var wsFile = findFileByName(entry.path) || findFileByName(entry.name);
        if (!wsFile) {
            // Add it to the workspace on-the-fly
            var id = generateId();
            wsFile = { id: id, name: entry.path, createdAt: Date.now() };
            workspace.files.push(wsFile);
        }

        workspace.activeFileId = wsFile.id;
        M.wsActiveFileId = wsFile.id;
        activeFilePath = entry.path;
        saveWorkspace();

        // Read from disk using path
        M._disk.readFileFromPath(entry.path).then(function (content) {
            M.markdownEditor.value = content;
            localStorage.setItem(FILE_PREFIX + wsFile.id, content);
            M.renderMarkdown();
            if (M.updateDocumentStats) M.updateDocumentStats();
            renderDiskTreeView();
            updatePageTitle(entry.name);
        });
    }

    // Load disk tree and render
    async function loadDiskTree() {
        if (!M._disk || !M._disk.isConnected()) return;
        diskTreeData = await M._disk.scanDirectory();
        renderFileList();
    }

    // --- Context menu ---
    var contextMenuTargetId = null;

    function showContextMenu(e, fileId) {
        if (!contextMenu) return;
        contextMenuTargetId = fileId;
        contextMenu.style.display = 'block';
        // Position near click
        var sidebarRect = sidebar.getBoundingClientRect();
        var x = e.clientX - sidebarRect.left;
        var y = e.clientY - sidebarRect.top;
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        // Prevent overflow
        setTimeout(function () {
            var menuRect = contextMenu.getBoundingClientRect();
            if (menuRect.bottom > window.innerHeight) {
                contextMenu.style.top = (y - menuRect.height) + 'px';
            }
            if (menuRect.right > sidebarRect.right) {
                contextMenu.style.left = (x - menuRect.width) + 'px';
            }
        }, 0);
    }

    function hideContextMenu() {
        if (contextMenu) contextMenu.style.display = 'none';
        contextMenuTargetId = null;
    }

    // Close context menu on click anywhere
    document.addEventListener('click', function () { hideContextMenu(); });
    document.addEventListener('contextmenu', function (e) {
        if (!e.target.closest('#workspace-sidebar')) hideContextMenu();
    });

    // Context menu actions
    var ctxRename = document.getElementById('ws-ctx-rename');
    var ctxDelete = document.getElementById('ws-ctx-delete');
    var ctxDuplicate = document.getElementById('ws-ctx-duplicate');

    if (ctxRename) ctxRename.addEventListener('click', function (e) {
        e.stopPropagation();
        var targetId = contextMenuTargetId;
        hideContextMenu();
        if (!targetId) return;
        var file = findFileById(targetId);
        if (!file) return;
        startInlineRename(targetId);
    });

    if (ctxDelete) ctxDelete.addEventListener('click', function (e) {
        e.stopPropagation();
        var targetId = contextMenuTargetId;
        hideContextMenu();
        if (targetId) M.wsDeleteFile(targetId);
    });

    if (ctxDuplicate) ctxDuplicate.addEventListener('click', function (e) {
        e.stopPropagation();
        var targetId = contextMenuTargetId;
        hideContextMenu();
        if (!targetId) return;
        var srcFile = findFileById(targetId);
        if (!srcFile) return;
        var content = getFileContent(targetId);
        var id = generateId();
        var name = srcFile.name.replace(/\.md$/i, '') + ' (copy).md';
        workspace.files.push({ id: id, name: name, createdAt: Date.now() });
        setFileContent(id, content);
        saveWorkspace();
        M.wsOpenFile(id);
        // Reload tree so new file shows immediately
        if (diskMode) loadDiskTree();
    });

    // --- Inline rename ---
    function startInlineRename(fileId) {
        var li, nameSpan;
        // In tree mode, find by data-path; in flat mode, find by data-file-id
        if (diskMode && diskTreeData) {
            var file = findFileById(fileId);
            if (!file) return;
            li = fileList.querySelector('[data-path="' + file.name + '"]');
            if (li) nameSpan = li.querySelector('.ws-tree-name');
        } else {
            li = fileList.querySelector('[data-file-id="' + fileId + '"]');
            if (li) nameSpan = li.querySelector('.ws-file-name');
        }
        if (!li || !nameSpan) return;
        var file = findFileById(fileId);
        if (!file) return;

        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'ws-rename-input';
        // Show just the filename for display (not full path)
        var displayName = file.name.split('/').pop();
        input.value = displayName;
        nameSpan.replaceWith(input);
        input.focus();
        // Select name without extension
        var dotIdx = displayName.lastIndexOf('.');
        if (dotIdx > 0) input.setSelectionRange(0, dotIdx);
        else input.select();

        function commitRename() {
            var newName = input.value.trim();
            if (!newName) newName = displayName;
            if (!newName.endsWith('.md')) newName += '.md';
            // Preserve directory prefix for path-based names
            var dirPrefix = file.name.lastIndexOf('/') >= 0
                ? file.name.substring(0, file.name.lastIndexOf('/') + 1) : '';
            file.name = dirPrefix + newName;
            saveWorkspace();
            renderFileList();
            if (diskMode) loadDiskTree();
        }

        input.addEventListener('blur', commitRename);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
            if (e.key === 'Escape') { input.value = displayName; input.blur(); }
        });
    }

    // --- Public API ---

    M.wsActiveFileId = null;
    M.wsDiskMode = false;

    M.wsCreateFile = function (name) {
        // Save current document first
        M.wsSaveCurrent();
        var id = generateId();
        var fileName = name || 'Untitled.md';
        // Deduplicate names
        var baseName = fileName.replace(/\.md$/i, '');
        var counter = 1;
        var existingNames = workspace.files.map(function (f) { return f.name.toLowerCase(); });
        var testName = fileName.toLowerCase();
        while (existingNames.indexOf(testName) >= 0) {
            counter++;
            fileName = baseName + ' ' + counter + '.md';
            testName = fileName.toLowerCase();
        }
        workspace.files.push({ id: id, name: fileName, createdAt: Date.now() });
        workspace.activeFileId = id;
        M.wsActiveFileId = id;
        setFileContent(id, '');
        saveWorkspace();
        // Load empty editor
        M.markdownEditor.value = '';
        M.renderMarkdown();
        if (M.updateDocumentStats) M.updateDocumentStats();
        renderFileList();
        // Open sidebar if not already open to show the new file
        if (!sidebarOpen) M.wsToggleSidebar();
        // Update page title
        updatePageTitle(fileName);
        // Reload tree so new file shows immediately
        if (diskMode) loadDiskTree();
        return id;
    };

    M.wsOpenFile = function (id) {
        if (id === workspace.activeFileId) return;
        var file = findFileById(id);
        if (!file) return;
        // Save current
        M.wsSaveCurrent();
        // Switch
        workspace.activeFileId = id;
        M.wsActiveFileId = id;
        saveWorkspace();
        // Load content (async for disk mode)
        getFileContentAsync(id).then(function (content) {
            M.markdownEditor.value = content;
            M.renderMarkdown();
            if (M.updateDocumentStats) M.updateDocumentStats();
            renderFileList();
            updatePageTitle(file.name);
        });
    };

    M.wsRenameFile = function (id, newName) {
        var file = findFileById(id);
        if (!file) return;
        if (!newName || !newName.trim()) return;
        var oldName = file.name;
        newName = newName.trim();
        if (!newName.endsWith('.md')) newName += '.md';
        // Preserve directory prefix for path-based names
        var dirPrefix = oldName.lastIndexOf('/') >= 0
            ? oldName.substring(0, oldName.lastIndexOf('/') + 1) : '';
        var newFullName = dirPrefix + newName;
        file.name = newFullName;
        saveWorkspace();
        renderFileList();
        if (id === workspace.activeFileId) updatePageTitle(newName);
        // Rename on disk using path-based API, then reload tree
        if (diskMode && M._disk && M._disk.isConnected() && oldName !== newFullName) {
            M._disk.renameFileInPath(oldName, newFullName).then(function () {
                loadDiskTree();
            }).catch(function (e) {
                console.warn('Disk rename failed:', e);
                M.showToast('Rename failed on disk: ' + e.message, 'error');
                loadDiskTree();
            });
        } else if (diskMode) {
            loadDiskTree();
        }
    };

    M.wsDeleteFile = function (id) {
        if (workspace.files.length <= 1) {
            // Don't delete the last file — just clear it
            var file = findFileById(id);
            if (file) {
                M.markdownEditor.value = '';
                setFileContent(id, '');
                M.renderMarkdown();
                if (M.updateDocumentStats) M.updateDocumentStats();
            }
            return;
        }
        var fileToDelete = findFileById(id);
        if (!fileToDelete) return;
        if (!confirm('Delete "' + fileToDelete.name + '"? This cannot be undone.')) return;
        var idx = -1;
        for (var i = 0; i < workspace.files.length; i++) {
            if (workspace.files[i].id === id) { idx = i; break; }
        }
        if (idx < 0) return;
        var deletedName = workspace.files[idx].name;
        workspace.files.splice(idx, 1);
        removeFileContent(id);
        // Switch to nearest neighbor if deleting active file
        if (id === workspace.activeFileId) {
            var newIdx = Math.min(idx, workspace.files.length - 1);
            workspace.activeFileId = workspace.files[newIdx].id;
            M.wsActiveFileId = workspace.activeFileId;
            var content = getFileContent(workspace.activeFileId);
            M.markdownEditor.value = content;
            M.renderMarkdown();
            if (M.updateDocumentStats) M.updateDocumentStats();
            updatePageTitle(workspace.files[newIdx].name);
        }
        saveWorkspace();
        renderFileList();
        // Delete from disk, then reload tree
        if (diskMode && M._disk && M._disk.isConnected()) {
            M._disk.deleteFileFromPath(deletedName).then(function () {
                loadDiskTree();
            }).catch(function (e) {
                console.warn('Disk delete failed:', e);
                M.showToast('Delete failed on disk: ' + e.message, 'error');
                loadDiskTree();
            });
        } else if (diskMode) {
            loadDiskTree();
        }
    };

    M.wsSaveCurrent = function () {
        if (!workspace || !workspace.activeFileId) return;
        setFileContent(workspace.activeFileId, M.markdownEditor.value);
    };

    M.wsGetFiles = function () {
        return workspace ? workspace.files.slice() : [];
    };

    // --- Disk Workspace Integration ---

    M.wsConnectFolder = async function () {
        if (!M._disk || !M._disk.isSupported()) {
            M.showToast('Folder access is not supported in this browser.', 'warning');
            return;
        }
        try {
            // Save current workspace to localStorage before switching
            M.wsSaveCurrent();
            await M._disk.pickFolder();
            diskMode = true;
            M.wsDiskMode = true;

            // Try to load existing manifest
            var manifest = await M._disk.loadManifest();
            if (manifest && manifest.files && manifest.files.length > 0) {
                workspace = manifest;
            } else {
                // Scan folder for .md files
                var mdFiles = await M._disk.scanForMdFiles();
                if (mdFiles.length > 0) {
                    workspace = { files: [], activeFileId: null };
                    for (var i = 0; i < mdFiles.length; i++) {
                        var id = generateId();
                        workspace.files.push({ id: id, name: mdFiles[i], createdAt: Date.now() });
                    }
                    workspace.activeFileId = workspace.files[0].id;
                } else {
                    // Empty folder — create default file
                    var id = generateId();
                    workspace = {
                        files: [{ id: id, name: 'Untitled.md', createdAt: Date.now() }],
                        activeFileId: id
                    };
                    await M._disk.writeFile('Untitled.md', '');
                }
                await M._disk.saveManifest(workspace);
            }

            // Also save to localStorage as cache
            saveWorkspace();
            M.wsActiveFileId = workspace.activeFileId;

            // Load active file content
            var activeFile = findFileById(workspace.activeFileId);
            if (activeFile) {
                var content = await M._disk.readFile(activeFile.name);
                M.markdownEditor.value = content;
                // Cache in localStorage
                localStorage.setItem(FILE_PREFIX + workspace.activeFileId, content);
                M.renderMarkdown();
                if (M.updateDocumentStats) M.updateDocumentStats();
                updatePageTitle(activeFile.name);
            }

            renderFileList();
            M._disk.updateUI();
            // Load full tree for disk mode
            await loadDiskTree();

            if (!sidebarOpen) M.wsToggleSidebar();
            M.showToast('📂 Connected to folder: ' + M._disk.getFolderName(), 'success');
        } catch (e) {
            if (e.name === 'AbortError') return; // User cancelled the picker
            console.error('Connect folder failed:', e);
            M.showToast('Failed to connect folder: ' + e.message, 'error');
        }
    };

    M.wsDisconnectFolder = async function () {
        if (!M._disk) return;
        // Save current to localStorage before disconnecting
        M.wsSaveCurrent();
        await M._disk.disconnect();
        diskMode = false;
        M.wsDiskMode = false;
        diskTreeData = null;
        activeFilePath = null;
        M._disk.updateUI();
        renderFileList();
        M.showToast('Disconnected from folder. Using browser storage.', 'info');
    };

    M.wsRefreshFromDisk = async function () {
        if (!diskMode || !M._disk || !M._disk.isConnected()) return;
        try {
            // Re-scan folder for .md files
            var mdFiles = await M._disk.scanForMdFiles();
            var existingNames = {};
            workspace.files.forEach(function (f) { existingNames[f.name] = f.id; });

            // Add any new files found on disk
            var added = 0;
            for (var i = 0; i < mdFiles.length; i++) {
                if (!existingNames[mdFiles[i]]) {
                    var id = generateId();
                    workspace.files.push({ id: id, name: mdFiles[i], createdAt: Date.now() });
                    added++;
                }
            }

            // Remove files that no longer exist on disk
            var diskSet = {};
            mdFiles.forEach(function (n) { diskSet[n] = true; });
            workspace.files = workspace.files.filter(function (f) { return diskSet[f.name]; });

            // Ensure activeFileId is still valid
            if (!findFileById(workspace.activeFileId) && workspace.files.length > 0) {
                workspace.activeFileId = workspace.files[0].id;
                M.wsActiveFileId = workspace.activeFileId;
            }

            saveWorkspace();
            await M._disk.saveManifest(workspace);

            // Reload active file content from disk
            var activeFile = findFileById(workspace.activeFileId);
            if (activeFile) {
                var content = await M._disk.readFile(activeFile.name);
                M.markdownEditor.value = content;
                localStorage.setItem(FILE_PREFIX + workspace.activeFileId, content);
                M.renderMarkdown();
                if (M.updateDocumentStats) M.updateDocumentStats();
                updatePageTitle(activeFile.name);
            }

            renderFileList();
            // Reload tree view
            await loadDiskTree();
            M.showToast('🔄 Refreshed from disk' + (added > 0 ? ' (' + added + ' new file' + (added > 1 ? 's' : '') + ')' : ''), 'success');
        } catch (e) {
            console.error('Refresh from disk failed:', e);
            M.showToast('Refresh failed: ' + e.message, 'error');
        }
    };

    M.wsReconnectFolder = async function () {
        if (!M._disk || !M._disk.isConnected()) return;
        diskMode = true;
        M.wsDiskMode = true;

        // Load workspace from disk manifest
        var manifest = await M._disk.loadManifest();
        if (manifest && manifest.files && manifest.files.length > 0) {
            workspace = manifest;
        } else {
            var mdFiles = await M._disk.scanForMdFiles();
            if (mdFiles.length > 0) {
                workspace = { files: [], activeFileId: null };
                for (var i = 0; i < mdFiles.length; i++) {
                    var id = generateId();
                    workspace.files.push({ id: id, name: mdFiles[i], createdAt: Date.now() });
                }
                workspace.activeFileId = workspace.files[0].id;
            }
        }

        if (workspace && workspace.activeFileId) {
            M.wsActiveFileId = workspace.activeFileId;
            saveWorkspace();
            var activeFile = findFileById(workspace.activeFileId);
            if (activeFile) {
                var content = await M._disk.readFile(activeFile.name);
                M.markdownEditor.value = content;
                localStorage.setItem(FILE_PREFIX + workspace.activeFileId, content);
                M.renderMarkdown();
                if (M.updateDocumentStats) M.updateDocumentStats();
                updatePageTitle(activeFile.name);
            }
            renderFileList();
            // Load full tree for disk mode
            await loadDiskTree();
        }

        M._disk.updateUI();
    };

    M.wsToggleSidebar = function () {
        sidebarOpen = !sidebarOpen;
        if (sidebar) {
            sidebar.classList.toggle('open', sidebarOpen);
            document.body.classList.toggle('workspace-sidebar-open', sidebarOpen);
        }
        if (toggleBtn) toggleBtn.classList.toggle('active', sidebarOpen);
        // Save preference
        localStorage.setItem(M.KEYS.SIDEBAR_OPEN, sidebarOpen ? 'true' : 'false');
    };

    M.wsCloseSidebar = function () {
        if (sidebarOpen) M.wsToggleSidebar();
    };

    M.wsIsSidebarOpen = function () {
        return sidebarOpen;
    };

    function updatePageTitle(fileName) {
        var base = 'TextAgent';
        if (fileName) document.title = fileName.replace(/\.md$/i, '') + ' — ' + base;
        else document.title = base;
    }

    // --- Sidebar toggle button ---
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () { M.wsToggleSidebar(); });
    }

    // --- Close button in sidebar header ---
    var closeBtn = document.getElementById('workspace-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function () { M.wsCloseSidebar(); });
    }

    // --- New file button in sidebar ---
    if (newFileBtn) {
        newFileBtn.addEventListener('click', function () { M.wsCreateFile(); });
    }

    // --- Initialize ---
    initWorkspace();
    M.wsActiveFileId = workspace.activeFileId;

    // Restore sidebar visibility preference
    if (localStorage.getItem(M.KEYS.SIDEBAR_OPEN) === 'true') {
        sidebarOpen = true;
        if (sidebar) sidebar.classList.add('open');
        document.body.classList.add('workspace-sidebar-open');
        if (toggleBtn) toggleBtn.classList.add('active');
    }

    // Render file list
    renderFileList();

    // Set page title for active file
    var activeFile = findFileById(workspace.activeFileId);
    if (activeFile) updatePageTitle(activeFile.name);

    // Expose for autosave integration (cloud-share.js)
    M._wsGetFileContent = getFileContent;
    M._wsSetFileContent = setFileContent;
    M._wsRenderFileList = renderFileList;
    M._wsFindFileById = findFileById;

})(window.MDView);
