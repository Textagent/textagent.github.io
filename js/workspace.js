// ============================================
// workspace.js — Multi-File Workspace Manager (localStorage-backed)
// ============================================
(function (M) {
    'use strict';

    var WORKSPACE_KEY = 'mdview-workspace';
    var FILE_PREFIX = 'mdview-file-';
    var OLD_AUTOSAVE_KEY = 'md-viewer-autosave';
    var OLD_AUTOSAVE_TIME_KEY = 'md-viewer-autosave-time';

    // --- Workspace State ---
    var workspace = null;  // { files: [...], activeFileId: string }
    var sidebarOpen = false;

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

    function setFileContent(id, content) {
        try {
            localStorage.setItem(FILE_PREFIX + id, content);
        } catch (e) { console.warn('File save failed:', e); }
    }

    function removeFileContent(id) {
        localStorage.removeItem(FILE_PREFIX + id);
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
        hideContextMenu();
        if (!contextMenuTargetId) return;
        var file = findFileById(contextMenuTargetId);
        if (!file) return;
        startInlineRename(contextMenuTargetId);
    });

    if (ctxDelete) ctxDelete.addEventListener('click', function (e) {
        e.stopPropagation();
        hideContextMenu();
        if (contextMenuTargetId) M.wsDeleteFile(contextMenuTargetId);
    });

    if (ctxDuplicate) ctxDuplicate.addEventListener('click', function (e) {
        e.stopPropagation();
        hideContextMenu();
        if (!contextMenuTargetId) return;
        var srcFile = findFileById(contextMenuTargetId);
        if (!srcFile) return;
        var content = getFileContent(contextMenuTargetId);
        var id = generateId();
        var name = srcFile.name.replace(/\.md$/i, '') + ' (copy).md';
        workspace.files.push({ id: id, name: name, createdAt: Date.now() });
        setFileContent(id, content);
        saveWorkspace();
        M.wsOpenFile(id);
    });

    // --- Inline rename ---
    function startInlineRename(fileId) {
        var li = fileList.querySelector('[data-file-id="' + fileId + '"]');
        if (!li) return;
        var nameSpan = li.querySelector('.ws-file-name');
        if (!nameSpan) return;
        var file = findFileById(fileId);
        if (!file) return;

        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'ws-rename-input';
        input.value = file.name;
        nameSpan.replaceWith(input);
        input.focus();
        // Select name without extension
        var dotIdx = file.name.lastIndexOf('.');
        if (dotIdx > 0) input.setSelectionRange(0, dotIdx);
        else input.select();

        function commitRename() {
            var newName = input.value.trim();
            if (!newName) newName = file.name;
            if (!newName.endsWith('.md')) newName += '.md';
            file.name = newName;
            saveWorkspace();
            renderFileList();
        }

        input.addEventListener('blur', commitRename);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
            if (e.key === 'Escape') { input.value = file.name; input.blur(); }
        });
    }

    // --- Public API ---

    M.wsActiveFileId = null;

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
        // Load content
        var content = getFileContent(id);
        M.markdownEditor.value = content;
        M.renderMarkdown();
        if (M.updateDocumentStats) M.updateDocumentStats();
        renderFileList();
        updatePageTitle(file.name);
    };

    M.wsRenameFile = function (id, newName) {
        var file = findFileById(id);
        if (!file) return;
        if (!newName || !newName.trim()) return;
        newName = newName.trim();
        if (!newName.endsWith('.md')) newName += '.md';
        file.name = newName;
        saveWorkspace();
        renderFileList();
        if (id === workspace.activeFileId) updatePageTitle(newName);
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
        if (!confirm('Delete "' + (findFileById(id) || {}).name + '"? This cannot be undone.')) return;
        var idx = -1;
        for (var i = 0; i < workspace.files.length; i++) {
            if (workspace.files[i].id === id) { idx = i; break; }
        }
        if (idx < 0) return;
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
    };

    M.wsSaveCurrent = function () {
        if (!workspace || !workspace.activeFileId) return;
        setFileContent(workspace.activeFileId, M.markdownEditor.value);
    };

    M.wsGetFiles = function () {
        return workspace ? workspace.files.slice() : [];
    };

    M.wsToggleSidebar = function () {
        sidebarOpen = !sidebarOpen;
        if (sidebar) {
            sidebar.classList.toggle('open', sidebarOpen);
            document.body.classList.toggle('workspace-sidebar-open', sidebarOpen);
        }
        if (toggleBtn) toggleBtn.classList.toggle('active', sidebarOpen);
        // Save preference
        localStorage.setItem('mdview-sidebar-open', sidebarOpen ? 'true' : 'false');
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
    if (localStorage.getItem('mdview-sidebar-open') === 'true') {
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

})(window.MDView);
