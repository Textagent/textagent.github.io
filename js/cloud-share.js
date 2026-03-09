// ============================================
// cloud-share.js — Firebase, Encryption, Share Flow, Auto-Save
// ============================================
(function (M) {
    'use strict';

    var SHARE_BASE_URL = 'https://textagent.github.io/';
    M.SHARE_BASE_URL = SHARE_BASE_URL;

    // --- Firebase Config ---
    var firebaseConfig = {
        apiKey: 'AIzaSyC_5pgtZ-mZvHmIUH9X7MkObPwDLw8nyfw',
        authDomain: 'mdview-share.firebaseapp.com',
        projectId: 'mdview-share',
        storageBucket: 'mdview-share.firebasestorage.app',
        messagingSenderId: '866669616957',
        appId: '1:866669616957:web:47dd3ed6048fa8ba1faf54'
    };
    var firebaseApp = firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
    M.db = db;

    // --- Compression Helpers ---
    function compressData(text) {
        return pako.gzip(new TextEncoder().encode(text));
    }
    function decompressData(compressedData) {
        return new TextDecoder().decode(pako.ungzip(compressedData));
    }
    M.compressData = compressData;
    M.decompressData = decompressData;

    // --- Encryption Helpers ---
    async function generateEncryptionKey() {
        return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    }
    async function encryptData(key, data) {
        var iv = crypto.getRandomValues(new Uint8Array(12));
        var encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, data);
        var result = new Uint8Array(iv.length + encrypted.byteLength);
        result.set(iv);
        result.set(new Uint8Array(encrypted), iv.length);
        return result;
    }
    async function decryptData(key, packedData) {
        var iv = packedData.slice(0, 12);
        var ciphertext = packedData.slice(12);
        return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ciphertext));
    }
    M.generateEncryptionKey = generateEncryptionKey;
    M.encryptData = encryptData;
    M.decryptData = decryptData;

    // --- Base64 URL Helpers ---
    function uint8ArrayToBase64Url(data) {
        var binary = '';
        data.forEach(function (b) { binary += String.fromCharCode(b); });
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    function base64UrlToUint8Array(base64url) {
        var base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
        var padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
        var binary = atob(padded);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }
    async function keyToBase64Url(key) {
        var exported = await crypto.subtle.exportKey('raw', key);
        return uint8ArrayToBase64Url(new Uint8Array(exported));
    }
    async function base64UrlToKey(base64url) {
        return crypto.subtle.importKey('raw', base64UrlToUint8Array(base64url), { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    }
    M.uint8ArrayToBase64Url = uint8ArrayToBase64Url;
    M.base64UrlToUint8Array = base64UrlToUint8Array;
    M.keyToBase64Url = keyToBase64Url;
    M.base64UrlToKey = base64UrlToKey;

    // --- PBKDF2 Passphrase Key Derivation ---
    async function deriveKeyFromPassphrase(passphrase, salt) {
        var enc = new TextEncoder();
        var keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }
    M.deriveKeyFromPassphrase = deriveKeyFromPassphrase;

    // ========================================
    // AUTO-SAVE TO LOCALSTORAGE
    // ========================================
    var AUTOSAVE_KEY = M.KEYS.AUTOSAVE;
    var AUTOSAVE_TIME_KEY = M.KEYS.AUTOSAVE_TIME;
    var AUTOSAVE_DELAY = 1000;
    var autosaveTimeout = null;
    var autosaveIndicator = document.getElementById('autosave-indicator');
    var autosaveText = document.getElementById('autosave-text');

    function saveToLocalStorage() {
        try {
            // Per-file save: use workspace active file ID if available
            if (M.wsActiveFileId) {
                localStorage.setItem(M.KEYS.FILE_PREFIX + M.wsActiveFileId, M.markdownEditor.value);
            } else {
                localStorage.setItem(AUTOSAVE_KEY, M.markdownEditor.value);
            }
            localStorage.setItem(AUTOSAVE_TIME_KEY, Date.now().toString());
            showAutosaveIndicator();
        } catch (e) { console.warn('Auto-save failed:', e); }
    }
    function showAutosaveIndicator() {
        if (autosaveIndicator) { autosaveIndicator.style.display = 'flex'; autosaveText.textContent = 'Saved'; }
    }
    function restoreFromLocalStorage() {
        var hash = window.location.hash;
        if (hash && (hash.includes('d=') || hash.includes('id=')) && hash.includes('k=')) return false;
        // Per-file restore: use workspace active file ID if available
        var saved;
        if (M.wsActiveFileId) {
            saved = localStorage.getItem(M.KEYS.FILE_PREFIX + M.wsActiveFileId);
        } else {
            saved = localStorage.getItem(AUTOSAVE_KEY);
        }
        if (saved && saved.trim()) {
            M.markdownEditor.value = saved;
            var savedTime = localStorage.getItem(AUTOSAVE_TIME_KEY);
            if (savedTime) {
                var elapsed = Date.now() - parseInt(savedTime);
                var seconds = Math.floor(elapsed / 1000);
                if (seconds < 60) autosaveText.textContent = 'Saved ' + seconds + 's ago';
                else if (seconds < 3600) autosaveText.textContent = 'Saved ' + Math.floor(seconds / 60) + 'm ago';
                else autosaveText.textContent = 'Saved ' + Math.floor(seconds / 3600) + 'h ago';
                autosaveIndicator.style.display = 'flex';
            }
            return true;
        }
        return false;
    }

    // ========================================
    // CLOUD AUTO-SAVE TO FIREBASE
    // ========================================
    var CLOUD_SAVE_INTERVAL = 60000;
    var CLOUD_DOC_KEY = M.KEYS.CLOUD_DOC_ID;
    var CLOUD_KEY_KEY = M.KEYS.CLOUD_ENC_KEY;
    var CLOUD_WT_KEY = M.KEYS.CLOUD_WRITE_TOKEN;
    var cloudSaveTimer = null;
    var cloudSaveDirty = false;
    var lastCloudContent = '';

    // Generate a random write-token for Firestore document ownership
    function generateWriteToken() {
        var arr = crypto.getRandomValues(new Uint8Array(24));
        return Array.from(arr, function (b) { return b.toString(36); }).join('').substring(0, 32);
    }

    function scheduleCloudSave() {
        cloudSaveDirty = true;
        if (!cloudSaveTimer) cloudSaveTimer = setInterval(cloudAutoSave, CLOUD_SAVE_INTERVAL);
    }

    async function cloudAutoSave() {
        if (!cloudSaveDirty) return;
        if (M.isViewingSharedDoc) return;
        var content = M.markdownEditor.value;
        if (!content.trim() || content === lastCloudContent) { cloudSaveDirty = false; return; }
        if (M.markdownEditor.readOnly) return;
        var hash = window.location.hash;
        if (hash && (hash.includes('id=') || hash.includes('d=')) && !localStorage.getItem(CLOUD_DOC_KEY)) return;
        try {
            var compressed = compressData(content);
            var key;
            var savedKeyStr = localStorage.getItem(CLOUD_KEY_KEY);
            if (savedKeyStr) { key = await base64UrlToKey(savedKeyStr); key = await crypto.subtle.importKey('raw', base64UrlToUint8Array(savedKeyStr), { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']); }
            else { key = await generateEncryptionKey(); localStorage.setItem(CLOUD_KEY_KEY, await keyToBase64Url(key)); }
            var encrypted = await encryptData(key, compressed);
            var dataString = uint8ArrayToBase64Url(encrypted);
            var keyString = await keyToBase64Url(key);
            var existingDocId = localStorage.getItem(CLOUD_DOC_KEY);
            if (existingDocId) {
                var wt = localStorage.getItem(CLOUD_WT_KEY) || '';
                await db.collection('shares').doc(existingDocId).set({ d: dataString, t: Date.now(), wt: wt });
            } else {
                var wt = generateWriteToken();
                var docRef = await db.collection('shares').add({ d: dataString, t: Date.now(), wt: wt });
                localStorage.setItem(CLOUD_DOC_KEY, docRef.id);
                localStorage.setItem(CLOUD_WT_KEY, wt);
            }
            var docId = existingDocId || localStorage.getItem(CLOUD_DOC_KEY);
            var shareUrl = '#id=' + docId + '&k=' + keyString;
            if (window.location.hash !== shareUrl) history.replaceState(null, '', shareUrl);
            lastCloudContent = content; cloudSaveDirty = false;
            if (autosaveText) {
                autosaveText.textContent = '☁️ Synced';
                setTimeout(function () { if (autosaveText.textContent === '☁️ Synced') autosaveText.textContent = 'Saved'; }, 3000);
            }
            console.log('☁️ Cloud auto-saved to Firebase:', docId);
        } catch (e) { console.warn('Cloud auto-save failed:', e); }
    }

    function debouncedAutosave() {
        clearTimeout(autosaveTimeout);
        autosaveTimeout = setTimeout(saveToLocalStorage, AUTOSAVE_DELAY);
        scheduleCloudSave();
    }
    M.markdownEditor.addEventListener('input', debouncedAutosave);

    // ========================================
    // SHARE FLOW
    // ========================================
    var lastSharePassphrase = '';
    var isSecureShareMode = false;

    M.shareMarkdown = function () {
        var markdownContent = M.markdownEditor.value;
        if (!markdownContent.trim()) { M.showToast('Nothing to share — the editor is empty.', 'warning'); return; }
        openShareOptionsModal();
    };

    async function doQuickShare() {
        var markdownContent = M.markdownEditor.value;
        var compressed = compressData(markdownContent);
        var key = await generateEncryptionKey();
        var encrypted = await encryptData(key, compressed);
        var dataString = uint8ArrayToBase64Url(encrypted);
        var keyString = await keyToBase64Url(key);
        var shareUrl;
        try {
            var wt = generateWriteToken();
            var docRef = await db.collection('shares').add({ d: dataString, t: Date.now(), wt: wt });
            shareUrl = SHARE_BASE_URL + '#id=' + docRef.id + '&k=' + keyString;
        } catch (fbError) {
            console.warn('Firebase unavailable, using URL fallback:', fbError);
            shareUrl = SHARE_BASE_URL + '#d=' + dataString + '&k=' + keyString;
            if (shareUrl.length > 65000) throw new Error('Content too large to share. Try a smaller document.');
        }
        return shareUrl;
    }

    async function doSecureShare(passphrase) {
        var markdownContent = M.markdownEditor.value;
        var compressed = compressData(markdownContent);
        var salt = crypto.getRandomValues(new Uint8Array(16));
        var key = await deriveKeyFromPassphrase(passphrase, salt);
        var encrypted = await encryptData(key, compressed);
        var dataString = uint8ArrayToBase64Url(encrypted);
        var saltString = uint8ArrayToBase64Url(salt);
        var wt = generateWriteToken();
        var docRef = await db.collection('shares').add({ d: dataString, salt: saltString, secure: true, t: Date.now(), wt: wt });
        return SHARE_BASE_URL + '#id=' + docRef.id + '&secure=1';
    }

    // ========================================
    // LOAD SHARED MARKDOWN
    // ========================================
    var pendingSecureDoc = null; // { dataString, saltString, docId }

    M.loadSharedMarkdown = async function () {
        var hash = window.location.hash.substring(1);
        if (!hash) return;
        var params = new URLSearchParams(hash);
        var docId = params.get('id');
        var inlineData = params.get('d');
        var keyString = params.get('k');
        var isSecure = params.get('secure') === '1';

        // Secure share: no key in URL, passphrase needed
        if (isSecure && docId && !keyString) {
            try {
                M.markdownPreview.innerHTML = '<div style="padding: 40px; text-align: center; opacity: 0.6;"><i class="bi bi-shield-lock"></i> Loading protected document...</div>';
                M.setViewMode('split');
                var doc = await db.collection('shares').doc(docId).get();
                if (!doc.exists) throw new Error('Shared document not found.');
                var data = doc.data();
                pendingSecureDoc = { dataString: data.d, saltString: data.salt, docId: docId };
                showPassphrasePrompt();
            } catch (error) {
                console.error('Failed to load secure shared markdown:', error);
                M.markdownPreview.innerHTML = '<div style="padding: 40px; text-align: center;"><h3 style="color: var(--color-danger-fg);"><i class="bi bi-shield-exclamation"></i> Document Not Found</h3><p style="opacity: 0.7;">The shared document may have been deleted or the link is invalid.</p></div>';
                M.setViewMode('split');
            }
            return;
        }

        // Quick share: key in URL
        if (!keyString || (!docId && !inlineData)) return;
        try {
            M.markdownPreview.innerHTML = '<div style="padding: 40px; text-align: center; opacity: 0.6;"><i class="bi bi-lock"></i> Decrypting shared content...</div>';
            M.setViewMode('split');
            var dataString;
            if (docId) {
                var doc = await db.collection('shares').doc(docId).get();
                if (!doc.exists) throw new Error('Shared document not found.');
                dataString = doc.data().d;
            } else { dataString = inlineData; }
            var encrypted = base64UrlToUint8Array(dataString);
            var key = await base64UrlToKey(keyString);
            var compressed = await decryptData(key, encrypted);
            var markdownContent = decompressData(compressed);
            M.markdownEditor.value = markdownContent;
            M.renderMarkdown();
            M.setViewMode('split');
            M.isViewingSharedDoc = true;
            showSharedBanner();
        } catch (error) {
            console.error('Failed to load shared markdown:', error);
            M.markdownPreview.innerHTML = '<div style="padding: 40px; text-align: center;"><h3 style="color: var(--color-danger-fg);"><i class="bi bi-shield-exclamation"></i> Decryption Failed</h3><p style="opacity: 0.7;">The link may be invalid or the document may not exist.</p><p style="font-size: 13px; opacity: 0.5;"></p></div>';
            M.markdownPreview.querySelector('p:last-child').textContent = error.message;
            M.setViewMode('split');
        }
    };

    async function unlockSecureDoc(passphrase) {
        if (!pendingSecureDoc) return;
        try {
            var salt = base64UrlToUint8Array(pendingSecureDoc.saltString);
            var key = await deriveKeyFromPassphrase(passphrase, salt);
            var encrypted = base64UrlToUint8Array(pendingSecureDoc.dataString);
            var compressed = await decryptData(key, encrypted);
            var markdownContent = decompressData(compressed);
            hidePassphrasePrompt();
            M.markdownEditor.value = markdownContent;
            M.renderMarkdown();
            M.setViewMode('split');
            M.isViewingSharedDoc = true;
            showSharedBanner();
            pendingSecureDoc = null;
        } catch (e) {
            throw new Error('Wrong passphrase. Please try again.');
        }
    }

    // --- Shared View Banner ---
    function showSharedBanner() {
        var banner = document.getElementById('shared-view-banner');
        banner.style.display = 'block';
        document.body.classList.add('shared-view-active');
        M.markdownEditor.readOnly = true;
    }
    function hideSharedBanner() {
        var banner = document.getElementById('shared-view-banner');
        banner.style.display = 'none';
        document.body.classList.remove('shared-view-active');
        M.markdownEditor.readOnly = false;
    }
    document.getElementById('shared-banner-edit').addEventListener('click', function () {
        hideSharedBanner();
        // Clear shared state so edits create a NEW document, not overwrite the original
        M.isViewingSharedDoc = false;
        localStorage.removeItem(CLOUD_DOC_KEY);
        localStorage.removeItem(CLOUD_KEY_KEY);
        localStorage.removeItem(CLOUD_WT_KEY);
        window.history.replaceState({}, document.title, window.location.pathname);
        M.setViewMode('split');
    });
    document.getElementById('shared-banner-close').addEventListener('click', function () {
        hideSharedBanner();
        M.isViewingSharedDoc = false;
        localStorage.removeItem(CLOUD_DOC_KEY);
        localStorage.removeItem(CLOUD_KEY_KEY);
        localStorage.removeItem(CLOUD_WT_KEY);
        window.history.replaceState({}, document.title, window.location.pathname);
    });

    // --- Share Options Modal ---
    var shareOptionsModal = document.getElementById('share-options-modal');
    var shareSecureSection = document.getElementById('share-secure-section');
    var shareDescQuick = document.getElementById('share-desc-quick');
    var sharePassInput = document.getElementById('share-passphrase-input');
    var sharePassConfirm = document.getElementById('share-passphrase-confirm');
    var sharePassError = document.getElementById('share-passphrase-error');

    function openShareOptionsModal() {
        isSecureShareMode = false;
        sharePassInput.value = '';
        sharePassConfirm.value = '';
        sharePassError.style.display = 'none';
        shareSecureSection.style.display = 'none';
        shareDescQuick.style.display = '';
        document.getElementById('share-mode-quick').classList.add('active');
        document.getElementById('share-mode-secure').classList.remove('active');
        shareOptionsModal.classList.add('active');
        document.getElementById('share-do-share').disabled = false;
        document.getElementById('share-do-share').innerHTML = '<i class="bi bi-share me-1"></i> Share';
    }

    function closeShareOptionsModal() {
        shareOptionsModal.classList.remove('active');
    }

    // Mode toggle
    document.querySelectorAll('.share-mode-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.share-mode-btn').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var mode = btn.dataset.mode;
            isSecureShareMode = (mode === 'secure');
            shareSecureSection.style.display = isSecureShareMode ? '' : 'none';
            shareDescQuick.style.display = isSecureShareMode ? 'none' : '';
            sharePassError.style.display = 'none';
            if (isSecureShareMode) setTimeout(function () { sharePassInput.focus(); }, 100);
        });
    });

    // Close handlers
    document.getElementById('share-options-close').addEventListener('click', closeShareOptionsModal);
    document.getElementById('share-options-cancel').addEventListener('click', closeShareOptionsModal);
    shareOptionsModal.addEventListener('click', function (e) { if (e.target === shareOptionsModal) closeShareOptionsModal(); });

    // Password visibility toggle
    function wirePassToggle(toggleId, inputId) {
        var toggle = document.getElementById(toggleId);
        if (!toggle) return;
        toggle.addEventListener('click', function () {
            var inp = document.getElementById(inputId);
            var isPassword = inp.type === 'password';
            inp.type = isPassword ? 'text' : 'password';
            toggle.querySelector('i').className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
        });
    }
    wirePassToggle('share-pass-toggle', 'share-passphrase-input');
    wirePassToggle('passphrase-unlock-toggle', 'passphrase-unlock-input');

    // Do share button
    document.getElementById('share-do-share').addEventListener('click', async function () {
        var btn = this;
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Sharing...';
        sharePassError.style.display = 'none';
        try {
            var shareUrl;
            if (isSecureShareMode) {
                var pass = sharePassInput.value;
                var passConfirm = sharePassConfirm.value;
                if (!pass || pass.length < 8) {
                    sharePassError.textContent = 'Passphrase must be at least 8 characters.';
                    sharePassError.style.display = '';
                    btn.disabled = false;
                    btn.innerHTML = '<i class="bi bi-share me-1"></i> Share';
                    return;
                }
                if (pass !== passConfirm) {
                    sharePassError.textContent = 'Passphrases do not match.';
                    sharePassError.style.display = '';
                    btn.disabled = false;
                    btn.innerHTML = '<i class="bi bi-share me-1"></i> Share';
                    return;
                }
                lastSharePassphrase = pass;
                shareUrl = await doSecureShare(pass);
            } else {
                lastSharePassphrase = '';
                shareUrl = await doQuickShare();
            }
            closeShareOptionsModal();
            showShareResult(shareUrl, isSecureShareMode);
        } catch (error) {
            console.error('Share failed:', error);
            sharePassError.textContent = 'Share failed: ' + error.message;
            sharePassError.style.display = '';
        }
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-share me-1"></i> Share';
    });

    // --- Share Result Modal ---
    var shareResultModal = document.getElementById('share-result-modal');
    function showShareResult(url, isSecure) {
        document.getElementById('share-link-input').value = url;
        var desc = document.getElementById('share-result-desc');
        var note = document.getElementById('share-result-note');
        var dlSection = document.getElementById('share-download-section');
        if (isSecure) {
            desc.innerHTML = '<i class="bi bi-shield-lock me-1"></i> Passphrase-protected. The link alone cannot decrypt the content.';
            note.innerHTML = '<i class="bi bi-info-circle me-1"></i>No key material is in the URL — only the passphrase holder can open this.';
            dlSection.style.display = '';
        } else {
            desc.innerHTML = '<i class="bi bi-shield-lock me-1"></i> Content is encrypted. Only this link can unlock it.';
            note.innerHTML = '<i class="bi bi-info-circle me-1"></i>The decryption key is in the URL fragment — it\'s never sent to any server.';
            dlSection.style.display = 'none';
        }
        shareResultModal.classList.add('active');
    }
    M.closeShareResultModal = function () { shareResultModal.classList.remove('active'); };
    document.getElementById('share-result-close').addEventListener('click', M.closeShareResultModal);
    shareResultModal.addEventListener('click', function (e) { if (e.target === shareResultModal) M.closeShareResultModal(); });
    document.getElementById('copy-share-link').addEventListener('click', async function () {
        var linkInput = document.getElementById('share-link-input');
        var btn = this;
        try { await navigator.clipboard.writeText(linkInput.value); btn.innerHTML = '<i class="bi bi-check-lg"></i>'; }
        catch (e) { linkInput.select(); document.execCommand('copy'); btn.innerHTML = '<i class="bi bi-check-lg"></i>'; }
        setTimeout(function () { btn.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
    });

    // --- Download Credentials ---
    document.getElementById('share-download-credentials').addEventListener('click', function () {
        var url = document.getElementById('share-link-input').value;
        var pass = lastSharePassphrase;
        // Extract heading from markdown
        var content = M.markdownEditor.value;
        var heading = 'untitled';
        var headingMatch = content.match(/^#+\s+(.+)/m);
        if (headingMatch) heading = headingMatch[1].trim();
        // Sanitize filename
        var safeName = heading.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 50);
        var filename = 'textagent-' + safeName + '.txt';
        var fileContent = '===================================\n';
        fileContent += '  TextAgent — Secure Share Credentials\n';
        fileContent += '===================================\n\n';
        fileContent += 'Document: ' + heading + '\n';
        fileContent += 'Created:  ' + new Date().toISOString() + '\n\n';
        fileContent += '-----------------------------------\n';
        fileContent += 'URL:\n' + url + '\n\n';
        fileContent += 'Passphrase:\n' + pass + '\n';
        fileContent += '-----------------------------------\n\n';
        fileContent += 'IMPORTANT:\n';
        fileContent += '• Share the URL and passphrase SEPARATELY for maximum security.\n';
        fileContent += '• Anyone with both the URL and passphrase can view the document.\n';
        fileContent += '• Delete this file after sharing the credentials.\n';
        var blob = new Blob([fileContent], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    });

    // --- Email to Self ---
    var EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx-xyiD2820PQ36aaH4ucp3Yh67PwOC7icTHCtW6Hr6yOEgFntOkzfHrNTs7sXasWL74g/exec';
    var emailInput = document.getElementById('share-email-input');
    var emailSubjectInput = document.getElementById('share-email-subject');
    var emailSendBtn = document.getElementById('share-email-send');
    var emailStatus = document.getElementById('share-email-status');

    // Restore last-used email
    var savedEmail = localStorage.getItem(M.KEYS.EMAIL_SELF);
    if (savedEmail && emailInput) emailInput.value = savedEmail;

    if (emailSendBtn) emailSendBtn.addEventListener('click', async function () {
        var email = emailInput.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailInput.classList.add('shake');
            emailInput.focus();
            setTimeout(function () { emailInput.classList.remove('shake'); }, 500);
            return;
        }

        // Persist email for next time
        try { localStorage.setItem(M.KEYS.EMAIL_SELF, email); } catch (e) { /* ignore */ }

        var shareUrl = document.getElementById('share-link-input').value;
        var content = M.markdownEditor.value;

        // Extract heading for fallback subject
        var heading = 'Untitled Document';
        var headingMatch = content.match(/^#+\s+(.+)/m);
        if (headingMatch) heading = headingMatch[1].trim();

        // Use custom subject if provided, otherwise auto-generate
        var customSubject = emailSubjectInput ? emailSubjectInput.value.trim() : '';
        var subject = customSubject || ('TextAgent: ' + heading);

        // Show loading state
        var btn = emailSendBtn;
        var origHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Sending...';
        if (emailStatus) { emailStatus.textContent = ''; emailStatus.className = 'share-email-status'; }

        try {
            // Google Apps Script redirects (302) without CORS headers,
            // so we use no-cors mode. The response is opaque (can't read body),
            // but the email is sent server-side regardless.
            await fetch(EMAIL_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({
                    email: email,
                    subject: subject,
                    title: heading,
                    content: content,
                    shareLink: shareUrl
                })
            });
            // If fetch didn't throw, the request reached Google's servers
            btn.innerHTML = '<i class="bi bi-check-lg"></i>';
            if (emailStatus) {
                emailStatus.textContent = '✅ Email sent! Check your inbox.';
                emailStatus.className = 'share-email-status share-email-success';
            }
            setTimeout(function () { btn.innerHTML = origHTML; btn.disabled = false; }, 3000);
        } catch (error) {
            console.error('Email send failed:', error);
            btn.innerHTML = '<i class="bi bi-x-lg"></i>';
            if (emailStatus) {
                emailStatus.textContent = '❌ ' + (error.message || 'Failed to send. Try again.');
                emailStatus.className = 'share-email-status share-email-error';
            }
            setTimeout(function () { btn.innerHTML = origHTML; btn.disabled = false; }, 3000);
        }
    });

    // --- Passphrase Prompt Modal ---
    var passphrasePromptModal = document.getElementById('passphrase-prompt-modal');
    var passphraseUnlockInput = document.getElementById('passphrase-unlock-input');
    var passphraseUnlockError = document.getElementById('passphrase-unlock-error');

    function showPassphrasePrompt() {
        passphraseUnlockInput.value = '';
        passphraseUnlockError.style.display = 'none';
        passphrasePromptModal.classList.add('active');
        setTimeout(function () { passphraseUnlockInput.focus(); }, 150);
    }

    function hidePassphrasePrompt() {
        passphrasePromptModal.classList.remove('active');
    }

    document.getElementById('passphrase-unlock-btn').addEventListener('click', async function () {
        var btn = this;
        var pass = passphraseUnlockInput.value;
        if (!pass) {
            passphraseUnlockError.textContent = 'Please enter the passphrase.';
            passphraseUnlockError.style.display = '';
            return;
        }
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Decrypting...';
        passphraseUnlockError.style.display = 'none';
        try {
            await unlockSecureDoc(pass);
        } catch (e) {
            passphraseUnlockError.textContent = e.message || 'Decryption failed. Wrong passphrase?';
            passphraseUnlockError.style.display = '';
        }
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-unlock me-1"></i> Unlock';
    });

    // Enter key to unlock
    passphraseUnlockInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') document.getElementById('passphrase-unlock-btn').click();
    });

    // Escape to close share modals
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (shareOptionsModal.classList.contains('active')) closeShareOptionsModal();
            if (shareResultModal.classList.contains('active')) M.closeShareResultModal();
        }
    });

    // --- New Document Button ---
    var newDocBtn = document.getElementById('new-document-btn');
    if (newDocBtn) {
        newDocBtn.addEventListener('click', function () {
            if (M.wsCreateFile) {
                M.wsCreateFile();
            } else {
                window.open(window.location.pathname, '_blank');
            }
        });
    }

    // --- Restore Auto-Saved Content or Load Default ---
    var wasRestored = restoreFromLocalStorage();
    if (wasRestored) {
        M.renderMarkdown();
    } else if (!window.location.hash || (!window.location.hash.includes('d=') && !window.location.hash.includes('id='))) {
        // No autosave and no share link — load Feature Showcase as default
        if (M.getDefaultContent) {
            M.markdownEditor.value = M.getDefaultContent();
            M.renderMarkdown();
        }
    }

})(window.MDView);
