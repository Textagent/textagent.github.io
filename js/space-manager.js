// ============================================
// space-manager.js — Spaces: Personal Document Hubs
// ============================================
(function (M) {
    'use strict';

    var SPACES_KEY = M.KEYS.SPACES;
    var db = M.db;
    var EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby4lYdtiRaVoRvAQg_4Nvf9zJkZOcrCCbkj2AkGiDPK8Ep18LQ2m-m-c2b2szVLuQTfDA/exec';

    // --- Local State ---
    function getMySpaces() {
        try {
            return JSON.parse(localStorage.getItem(SPACES_KEY) || '{}');
        } catch (e) { return {}; }
    }

    function saveMySpaces(spaces) {
        try {
            localStorage.setItem(SPACES_KEY, JSON.stringify(spaces));
        } catch (e) { console.warn('Spaces save failed:', e); }
    }

    function isMySpace(slug) {
        var spaces = getMySpaces();
        return !!spaces[slug];
    }

    // --- Write Token Generation (reuse pattern from cloud-share) ---
    function generateWriteToken() {
        var arr = crypto.getRandomValues(new Uint8Array(24));
        return Array.from(arr, function (b) { return b.toString(36); }).join('').substring(0, 32);
    }

    // --- Hash email for privacy ---
    async function hashEmail(email) {
        var normalized = email.trim().toLowerCase();
        var encoder = new TextEncoder();
        var data = encoder.encode(normalized);
        var hashBuffer = await crypto.subtle.digest('SHA-256', data);
        var hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    // --- Email Access Key to User ---
    async function emailAccessKey(email, spaceName, spaceSlug, accessKey) {
        var spaceUrl = (M.SHARE_BASE_URL || 'https://textagent.github.io/') + '#space=' + spaceSlug;
        await fetch(EMAIL_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                email: email,
                subject: 'TextAgent Space: ' + spaceName + ' — Your Access Key',
                title: 'Space Access Key',
                content:
                    '# Your TextAgent Space\n\n' +
                    '**Space:** ' + spaceName + '\n\n' +
                    '**Space URL:** ' + spaceUrl + '\n\n' +
                    '---\n\n' +
                    '## 🔑 Your Access Key\n\n' +
                    '```\n' + accessKey + '\n```\n\n' +
                    '**Keep this key safe!** You need it to manage your space from other devices.\n\n' +
                    '### How to recover your space:\n' +
                    '1. Open TextAgent → click 📚 Spaces\n' +
                    '2. Click "Recover Space"\n' +
                    '3. Enter the Space URL slug: `' + spaceSlug + '`\n' +
                    '4. Enter your Access Key above\n',
                shareLink: spaceUrl
            })
        });
    }

    // --- CRUD Operations ---
    async function createSpace(name, slug, description, owner, email) {
        if (!name || !name.trim()) throw new Error('Space name is required.');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid email is required.');
        slug = slug || generateSlug(name);
        var result = M.validateSlug(slug);
        if (!result.valid && result.error) throw new Error(result.error);
        slug = result.slug || slug;

        // Check if slug exists
        var existing = await db.collection('spaces').doc(slug).get();
        if (existing.exists) throw new Error('This space name is already taken. Please choose another.');

        var wt = generateWriteToken();
        var eh = await hashEmail(email);

        var docData = {
            name: name.trim(),
            items: [],
            wt: wt,
            eh: eh,
            t: Date.now()
        };
        if (description && description.trim()) docData.description = description.trim();
        if (owner && owner.trim()) docData.owner = owner.trim();

        await db.collection('spaces').doc(slug).set(docData);

        // Save to localStorage
        var spaces = getMySpaces();
        spaces[slug] = { wt: wt, name: name.trim(), t: Date.now() };
        saveMySpaces(spaces);

        // Persist email for convenience
        try { localStorage.setItem(M.KEYS.EMAIL_SELF, email); } catch (e) { /* ignore */ }

        // Email the access key
        try {
            await emailAccessKey(email, name.trim(), slug, wt);
        } catch (e) {
            console.warn('Failed to email access key:', e);
        }

        return { slug: slug, wt: wt };
    }

    function generateSlug(name) {
        return name.trim().toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50);
    }

    // --- Recover Space with Access Key ---
    async function recoverSpace(slug, accessKey) {
        if (!slug || !slug.trim()) throw new Error('Space URL slug is required.');
        if (!accessKey || !accessKey.trim()) throw new Error('Access key is required.');

        slug = slug.trim().toLowerCase();
        accessKey = accessKey.trim();

        var doc = await db.collection('spaces').doc(slug).get();
        if (!doc.exists) throw new Error('Space "' + slug + '" not found.');
        var data = doc.data();

        if (data.wt !== accessKey) throw new Error('Invalid access key. Check the email we sent you.');

        // Access key matches — store in localStorage
        var spaces = getMySpaces();
        spaces[slug] = { wt: accessKey, name: data.name, t: Date.now() };
        saveMySpaces(spaces);

        return data;
    }

    async function addItemToSpace(slug, shareId, title) {
        var spaces = getMySpaces();
        if (!spaces[slug]) throw new Error('You do not own this space.');
        var wt = spaces[slug].wt;

        var doc = await db.collection('spaces').doc(slug).get();
        if (!doc.exists) throw new Error('Space not found.');
        var data = doc.data();

        if (data.items.length >= 50) throw new Error('Space is full (max 50 items).');

        // Avoid duplicates
        for (var i = 0; i < data.items.length; i++) {
            if (data.items[i].id === shareId) {
                if (M.showToast) M.showToast('Already in this space.', 'info');
                return;
            }
        }

        data.items.push({
            id: shareId,
            title: title || 'Untitled',
            added: Date.now()
        });
        data.t = Date.now();
        data.wt = wt;

        await db.collection('spaces').doc(slug).set(data);
        if (M.showToast) M.showToast('✅ Added to ' + spaces[slug].name, 'success');
    }

    async function removeItemFromSpace(slug, index) {
        var spaces = getMySpaces();
        if (!spaces[slug]) throw new Error('You do not own this space.');
        var wt = spaces[slug].wt;

        var doc = await db.collection('spaces').doc(slug).get();
        if (!doc.exists) throw new Error('Space not found.');
        var data = doc.data();

        if (index < 0 || index >= data.items.length) return;
        data.items.splice(index, 1);
        data.t = Date.now();
        data.wt = wt;

        await db.collection('spaces').doc(slug).set(data);
    }

    async function updateSpace(slug, fields) {
        var spaces = getMySpaces();
        if (!spaces[slug]) throw new Error('You do not own this space.');
        var wt = spaces[slug].wt;

        var doc = await db.collection('spaces').doc(slug).get();
        if (!doc.exists) throw new Error('Space not found.');
        var data = doc.data();

        if (fields.name) { data.name = fields.name.trim(); spaces[slug].name = data.name; }
        if (fields.description !== undefined) data.description = fields.description.trim();
        if (fields.owner !== undefined) data.owner = fields.owner.trim();
        data.t = Date.now();
        data.wt = wt;

        await db.collection('spaces').doc(slug).set(data);
        saveMySpaces(spaces);
    }

    async function loadSpace(slug) {
        var doc = await db.collection('spaces').doc(slug).get();
        if (!doc.exists) return null;
        return doc.data();
    }

    // --- Hub Page Rendering ---
    function renderSpaceHub(data, slug) {
        var isOwner = isMySpace(slug);
        var preview = document.getElementById('markdown-preview');
        if (!preview) return;

        var SHARE_BASE = M.SHARE_BASE_URL || 'https://textagent.github.io/';

        var html = '<div class="space-hub">';

        // Header
        html += '<div class="space-hub-header">';
        html += '<div class="space-hub-icon"><i class="bi bi-collection-fill"></i></div>';
        html += '<h1 class="space-hub-title">' + escapeHtml(data.name) + '</h1>';
        if (data.description) {
            html += '<p class="space-hub-desc">' + escapeHtml(data.description) + '</p>';
        }
        if (data.owner) {
            html += '<div class="space-hub-owner"><i class="bi bi-person-circle me-1"></i>' + escapeHtml(data.owner) + '</div>';
        }
        html += '<div class="space-hub-meta">' + data.items.length + ' document' + (data.items.length !== 1 ? 's' : '') + '</div>';
        html += '</div>';

        // Items grid
        if (data.items.length === 0) {
            html += '<div class="space-hub-empty">';
            html += '<i class="bi bi-inbox" style="font-size:3rem;opacity:0.3"></i>';
            html += '<p>This space is empty</p>';
            if (isOwner) html += '<p style="font-size:13px;opacity:0.5">Share a document and add it to this space.</p>';
            html += '</div>';
        } else {
            html += '<div class="space-hub-grid">';
            data.items.forEach(function (item, idx) {
                var docUrl = SHARE_BASE + '#s=' + item.id;
                var added = item.added ? new Date(item.added) : null;
                var timeStr = added ? added.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';

                html += '<a href="' + docUrl + '" class="space-hub-card" target="_blank" rel="noopener">';
                html += '<div class="space-hub-card-icon"><i class="bi bi-file-earmark-text"></i></div>';
                html += '<div class="space-hub-card-body">';
                html += '<div class="space-hub-card-title">' + escapeHtml(item.title) + '</div>';
                if (timeStr) html += '<div class="space-hub-card-time"><i class="bi bi-clock me-1"></i>' + timeStr + '</div>';
                html += '</div>';
                html += '<div class="space-hub-card-arrow"><i class="bi bi-arrow-right"></i></div>';
                html += '</a>';
            });
            html += '</div>';
        }

        // Footer
        html += '<div class="space-hub-footer">';
        html += '<span>Powered by <strong>TextAgent</strong></span>';
        if (isOwner) {
            html += ' · <button class="space-hub-manage-btn" id="space-hub-manage-btn">Manage Space</button>';
        }
        html += '</div>';

        html += '</div>';

        preview.innerHTML = html;
        M.setViewMode('preview');
        M.isViewingSharedDoc = true;
        document.title = data.name + ' — TextAgent Space';

        // Hide header for cleaner look
        if (M.setHeaderLevel) M.setHeaderLevel(2);

        // Wire manage button
        if (isOwner) {
            var manageBtn = document.getElementById('space-hub-manage-btn');
            if (manageBtn) {
                manageBtn.addEventListener('click', function () {
                    openSpacesModal(slug);
                });
            }
        }
    }

    // --- Spaces Modal ---
    var currentEditSlug = null;

    function openSpacesModal(editSlug) {
        var modal = document.getElementById('spaces-modal');
        if (!modal) return;
        modal.classList.add('active');
        currentEditSlug = null;
        if (editSlug) {
            showSpaceEditor(editSlug);
        } else {
            showSpacesList();
        }
    }

    function closeSpacesModal() {
        var modal = document.getElementById('spaces-modal');
        if (modal) modal.classList.remove('active');
        currentEditSlug = null;
    }

    function showSpacesList() {
        var listView = document.getElementById('spaces-list-view');
        var editorView = document.getElementById('spaces-editor-view');
        var createView = document.getElementById('spaces-create-view');
        var recoverView = document.getElementById('spaces-recover-view');
        if (listView) listView.style.display = '';
        if (editorView) editorView.style.display = 'none';
        if (createView) createView.style.display = 'none';
        if (recoverView) recoverView.style.display = 'none';

        var list = document.getElementById('spaces-list');
        if (!list) return;

        var spaces = getMySpaces();
        var slugs = Object.keys(spaces);

        if (slugs.length === 0) {
            list.innerHTML = '<div class="spaces-empty"><i class="bi bi-collection" style="font-size:2rem;opacity:0.3"></i><p>No spaces yet</p><p style="font-size:13px;opacity:0.5">Create one to start organizing your shared documents.</p></div>';
            return;
        }

        // Sort by most recent
        slugs.sort(function (a, b) { return (spaces[b].t || 0) - (spaces[a].t || 0); });

        list.innerHTML = '';
        slugs.forEach(function (slug) {
            var s = spaces[slug];
            var row = document.createElement('div');
            row.className = 'spaces-list-row';
            row.innerHTML =
                '<div class="spaces-list-info">' +
                    '<div class="spaces-list-name"><i class="bi bi-collection me-2"></i>' + escapeHtml(s.name) + '</div>' +
                    '<div class="spaces-list-slug">#space=' + escapeHtml(slug) + '</div>' +
                '</div>' +
                '<div class="spaces-list-actions">' +
                    '<button class="spaces-list-btn" data-action="copy" title="Copy space URL"><i class="bi bi-clipboard"></i></button>' +
                    '<button class="spaces-list-btn" data-action="edit" title="Edit space"><i class="bi bi-pencil"></i></button>' +
                    '<button class="spaces-list-btn spaces-list-delete" data-action="delete" title="Remove from list"><i class="bi bi-trash3"></i></button>' +
                '</div>';

            row.querySelector('[data-action="copy"]').addEventListener('click', function (e) {
                e.stopPropagation();
                var url = (M.SHARE_BASE_URL || 'https://textagent.github.io/') + '#space=' + slug;
                navigator.clipboard.writeText(url).then(function () {
                    if (M.showToast) M.showToast('Space URL copied!', 'success');
                });
            });
            row.querySelector('[data-action="edit"]').addEventListener('click', function (e) {
                e.stopPropagation();
                showSpaceEditor(slug);
            });
            row.querySelector('[data-action="delete"]').addEventListener('click', function (e) {
                e.stopPropagation();
                var spaces = getMySpaces();
                delete spaces[slug];
                saveMySpaces(spaces);
                showSpacesList();
            });
            row.addEventListener('click', function () {
                showSpaceEditor(slug);
            });

            list.appendChild(row);
        });
    }

    async function showSpaceEditor(slug) {
        currentEditSlug = slug;
        var listView = document.getElementById('spaces-list-view');
        var editorView = document.getElementById('spaces-editor-view');
        var createView = document.getElementById('spaces-create-view');
        var recoverView = document.getElementById('spaces-recover-view');
        if (listView) listView.style.display = 'none';
        if (editorView) editorView.style.display = '';
        if (createView) createView.style.display = 'none';
        if (recoverView) recoverView.style.display = 'none';

        var titleEl = document.getElementById('spaces-editor-title');
        var itemsList = document.getElementById('spaces-editor-items');
        if (!titleEl || !itemsList) return;

        titleEl.textContent = 'Loading...';
        itemsList.innerHTML = '<div style="text-align:center;padding:20px;opacity:0.5"><i class="bi bi-hourglass-split"></i> Loading...</div>';

        try {
            var data = await loadSpace(slug);
            if (!data) {
                titleEl.textContent = 'Space not found';
                itemsList.innerHTML = '';
                return;
            }

            titleEl.textContent = data.name;
            renderEditorItems(data, slug);
        } catch (e) {
            titleEl.textContent = 'Error loading space';
            itemsList.innerHTML = '<div style="color:var(--color-danger-fg)">' + escapeHtml(e.message) + '</div>';
        }
    }

    function renderEditorItems(data, slug) {
        var itemsList = document.getElementById('spaces-editor-items');
        if (!itemsList) return;

        if (data.items.length === 0) {
            itemsList.innerHTML = '<div class="spaces-empty" style="padding:20px"><p>No documents in this space yet</p></div>';
            return;
        }

        itemsList.innerHTML = '';
        data.items.forEach(function (item, idx) {
            var row = document.createElement('div');
            row.className = 'spaces-editor-item';
            var added = item.added ? new Date(item.added) : null;
            var timeStr = added ? added.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
            row.innerHTML =
                '<span class="spaces-editor-item-num">' + (idx + 1) + '</span>' +
                '<div class="spaces-editor-item-info">' +
                    '<span class="spaces-editor-item-title">' + escapeHtml(item.title) + '</span>' +
                    '<span class="spaces-editor-item-time">' + timeStr + '</span>' +
                '</div>' +
                '<button class="spaces-list-btn spaces-list-delete" data-idx="' + idx + '" title="Remove"><i class="bi bi-x-lg"></i></button>';

            row.querySelector('.spaces-list-delete').addEventListener('click', async function (e) {
                e.stopPropagation();
                try {
                    await removeItemFromSpace(slug, idx);
                    showSpaceEditor(slug);
                } catch (err) {
                    if (M.showToast) M.showToast('Failed: ' + err.message, 'error');
                }
            });

            itemsList.appendChild(row);
        });
    }

    function showCreateView() {
        var listView = document.getElementById('spaces-list-view');
        var editorView = document.getElementById('spaces-editor-view');
        var createView = document.getElementById('spaces-create-view');
        var recoverView = document.getElementById('spaces-recover-view');
        if (listView) listView.style.display = 'none';
        if (editorView) editorView.style.display = 'none';
        if (createView) createView.style.display = '';
        if (recoverView) recoverView.style.display = 'none';

        var nameInput = document.getElementById('spaces-create-name');
        var descInput = document.getElementById('spaces-create-desc');
        var slugInput = document.getElementById('spaces-create-slug');
        var ownerInput = document.getElementById('spaces-create-owner');
        var emailInput = document.getElementById('spaces-create-email');
        var errorEl = document.getElementById('spaces-create-error');
        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
        if (slugInput) slugInput.value = '';
        if (ownerInput) ownerInput.value = '';
        if (errorEl) errorEl.style.display = 'none';
        // Pre-fill email from localStorage
        var savedEmail = '';
        try { savedEmail = localStorage.getItem(M.KEYS.EMAIL_SELF) || ''; } catch (e) { /* ignore */ }
        if (emailInput) emailInput.value = savedEmail;
        setTimeout(function () { if (nameInput) nameInput.focus(); }, 100);
    }

    function showRecoverView() {
        var listView = document.getElementById('spaces-list-view');
        var editorView = document.getElementById('spaces-editor-view');
        var createView = document.getElementById('spaces-create-view');
        var recoverView = document.getElementById('spaces-recover-view');
        if (listView) listView.style.display = 'none';
        if (editorView) editorView.style.display = 'none';
        if (createView) createView.style.display = 'none';
        if (recoverView) recoverView.style.display = '';

        var slugInput = document.getElementById('spaces-recover-slug');
        var keyInput = document.getElementById('spaces-recover-key');
        var errorEl = document.getElementById('spaces-recover-error');
        if (slugInput) slugInput.value = '';
        if (keyInput) keyInput.value = '';
        if (errorEl) errorEl.style.display = 'none';
        setTimeout(function () { if (slugInput) slugInput.focus(); }, 100);
    }

    // --- Wire Modal Events ---
    function wireModalEvents() {
        // Close
        var closeBtn = document.getElementById('spaces-modal-close');
        var modal = document.getElementById('spaces-modal');
        if (closeBtn) closeBtn.addEventListener('click', closeSpacesModal);
        if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeSpacesModal(); });

        // Create button
        var newBtn = document.getElementById('spaces-new-btn');
        if (newBtn) newBtn.addEventListener('click', showCreateView);

        // Recover button
        var recoverBtn = document.getElementById('spaces-recover-btn');
        if (recoverBtn) recoverBtn.addEventListener('click', showRecoverView);

        // Back buttons
        document.querySelectorAll('.spaces-back-btn').forEach(function (btn) {
            btn.addEventListener('click', showSpacesList);
        });

        // Create form submit
        var createBtn = document.getElementById('spaces-create-submit');
        if (createBtn) createBtn.addEventListener('click', async function () {
            var nameInput = document.getElementById('spaces-create-name');
            var descInput = document.getElementById('spaces-create-desc');
            var slugInput = document.getElementById('spaces-create-slug');
            var ownerInput = document.getElementById('spaces-create-owner');
            var emailInput = document.getElementById('spaces-create-email');
            var errorEl = document.getElementById('spaces-create-error');
            var btn = this;

            var name = nameInput ? nameInput.value.trim() : '';
            var desc = descInput ? descInput.value.trim() : '';
            var slug = slugInput ? slugInput.value.trim() : '';
            var owner = ownerInput ? ownerInput.value.trim() : '';
            var email = emailInput ? emailInput.value.trim() : '';

            if (!name) {
                if (errorEl) { errorEl.textContent = 'Name is required.'; errorEl.style.display = ''; }
                return;
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                if (errorEl) { errorEl.textContent = 'A valid email is required. Your access key will be sent here.'; errorEl.style.display = ''; }
                if (emailInput) emailInput.focus();
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Creating...';
            if (errorEl) errorEl.style.display = 'none';

            try {
                var result = await createSpace(name, slug || undefined, desc, owner, email);
                if (M.showToast) M.showToast('✅ Space created! Access key sent to ' + email, 'success');
                showSpaceEditor(result.slug);
            } catch (e) {
                if (errorEl) { errorEl.textContent = e.message; errorEl.style.display = ''; }
            }

            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-plus-lg me-1"></i>Create Space';
        });

        // Recover form submit
        var recoverSubmitBtn = document.getElementById('spaces-recover-submit');
        if (recoverSubmitBtn) recoverSubmitBtn.addEventListener('click', async function () {
            var slugInput = document.getElementById('spaces-recover-slug');
            var keyInput = document.getElementById('spaces-recover-key');
            var errorEl = document.getElementById('spaces-recover-error');
            var btn = this;

            var slug = slugInput ? slugInput.value.trim() : '';
            var key = keyInput ? keyInput.value.trim() : '';

            if (!slug) {
                if (errorEl) { errorEl.textContent = 'Space URL slug is required.'; errorEl.style.display = ''; }
                return;
            }
            if (!key) {
                if (errorEl) { errorEl.textContent = 'Access key is required. Check the email we sent when you created this space.'; errorEl.style.display = ''; }
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Recovering...';
            if (errorEl) errorEl.style.display = 'none';

            try {
                var data = await recoverSpace(slug, key);
                if (M.showToast) M.showToast('✅ Space "' + data.name + '" recovered!', 'success');
                showSpaceEditor(slug);
            } catch (e) {
                if (errorEl) { errorEl.textContent = e.message; errorEl.style.display = ''; }
            }

            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-key me-1"></i>Recover Space';
        });

        // Add current doc button
        var addDocBtn = document.getElementById('spaces-add-current-btn');
        if (addDocBtn) addDocBtn.addEventListener('click', async function () {
            if (!currentEditSlug) return;
            var content = M.markdownEditor.value;
            if (!content.trim()) {
                if (M.showToast) M.showToast('Editor is empty.', 'warning');
                return;
            }
            var btn = this;
            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Sharing & adding...';

            try {
                // Share the current doc first
                var shareResult = await M.createCompactShare(content);
                var title = 'Untitled';
                var headingMatch = content.match(/^#+\s+(.+)/m);
                if (headingMatch) title = headingMatch[1].trim().substring(0, 60);

                await addItemToSpace(currentEditSlug, shareResult.id, title);
                showSpaceEditor(currentEditSlug);
            } catch (e) {
                if (M.showToast) M.showToast('Failed: ' + e.message, 'error');
            }

            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-plus-lg me-1"></i>Add Current Doc';
        });

        // Add by link button
        var addLinkBtn = document.getElementById('spaces-add-link-btn');
        if (addLinkBtn) addLinkBtn.addEventListener('click', async function () {
            if (!currentEditSlug) return;
            var linkInput = document.getElementById('spaces-add-link-input');
            var titleInput = document.getElementById('spaces-add-link-title');
            if (!linkInput) return;
            var link = linkInput.value.trim();
            var title = titleInput ? titleInput.value.trim() : 'Untitled';

            // Extract share ID from link
            var shareId = '';
            var match = link.match(/#s=([^&]+)/);
            if (match) shareId = match[1];
            else if (/^[a-z0-9]{5,}$/i.test(link)) shareId = link; // bare ID

            if (!shareId) {
                if (M.showToast) M.showToast('Invalid share link. Use a TextAgent share URL or ID.', 'warning');
                return;
            }

            try {
                await addItemToSpace(currentEditSlug, shareId, title || 'Untitled');
                if (linkInput) linkInput.value = '';
                if (titleInput) titleInput.value = '';
                showSpaceEditor(currentEditSlug);
            } catch (e) {
                if (M.showToast) M.showToast('Failed: ' + e.message, 'error');
            }
        });

        // Toolbar buttons
        ['spaces-btn', 'mobile-spaces-btn', 'qab-spaces'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', function () {
                openSpacesModal();
                // Close mobile menu if open
                var mobilePanel = document.getElementById('mobile-menu-panel');
                if (mobilePanel && mobilePanel.classList.contains('open')) {
                    mobilePanel.classList.remove('open');
                    var overlay = document.getElementById('mobile-menu-overlay');
                    if (overlay) overlay.style.display = 'none';
                }
            });
        });

        // "Add to Space" in share result modal
        var shareAddBtn = document.getElementById('share-add-space-btn');
        if (shareAddBtn) shareAddBtn.addEventListener('click', async function () {
            var picker = document.getElementById('share-space-picker');
            if (!picker || !picker.value) return;
            var slug = picker.value;
            var shareUrl = document.getElementById('share-link-input').value;
            var shareId = '';
            var match = shareUrl.match(/#s=([^&]+)/);
            if (match) shareId = match[1];
            if (!shareId) return;

            var title = 'Untitled';
            var content = M.markdownEditor.value;
            var headingMatch = content.match(/^#+\s+(.+)/m);
            if (headingMatch) title = headingMatch[1].trim().substring(0, 60);

            try {
                await addItemToSpace(slug, shareId, title);
            } catch (e) {
                if (M.showToast) M.showToast('Failed: ' + e.message, 'error');
            }
        });

        // Escape to close
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                var modal = document.getElementById('spaces-modal');
                if (modal && modal.classList.contains('active')) closeSpacesModal();
            }
        });
    }

    // --- Populate "Add to Space" picker in Share Result ---
    function populateShareSpacePicker() {
        var section = document.getElementById('share-add-to-space');
        var picker = document.getElementById('share-space-picker');
        if (!section || !picker) return;

        var spaces = getMySpaces();
        var slugs = Object.keys(spaces);
        if (slugs.length === 0) {
            section.style.display = 'none';
            return;
        }

        picker.innerHTML = '';
        slugs.forEach(function (slug) {
            var opt = document.createElement('option');
            opt.value = slug;
            opt.textContent = spaces[slug].name;
            picker.appendChild(opt);
        });
        section.style.display = '';
    }

    // --- HTML Escape ---
    function escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // --- Initialize on DOM ready ---
    setTimeout(function () {
        wireModalEvents();
    }, 100);

    // --- Expose API ---
    M.createSpace = createSpace;
    M.addItemToSpace = addItemToSpace;
    M.removeItemFromSpace = removeItemFromSpace;
    M.updateSpace = updateSpace;
    M.loadSpace = loadSpace;
    M.getMySpaces = getMySpaces;
    M.isMySpace = isMySpace;
    M.renderSpaceHub = renderSpaceHub;
    M.openSpacesModal = openSpacesModal;
    M.closeSpacesModal = closeSpacesModal;
    M.populateShareSpacePicker = populateShareSpacePicker;
    M.recoverSpace = recoverSpace;

})(window.MDView);
