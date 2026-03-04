// ============================================
// cloud-share.js — Firebase, Encryption, Share Flow, Auto-Save
// ============================================
(function (M) {
    'use strict';

    var SHARE_BASE_URL = 'https://markdownview.github.io/';

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

    // ========================================
    // AUTO-SAVE TO LOCALSTORAGE
    // ========================================
    var AUTOSAVE_KEY = 'md-viewer-autosave';
    var AUTOSAVE_TIME_KEY = 'md-viewer-autosave-time';
    var AUTOSAVE_DELAY = 1000;
    var autosaveTimeout = null;
    var autosaveIndicator = document.getElementById('autosave-indicator');
    var autosaveText = document.getElementById('autosave-text');

    function saveToLocalStorage() {
        try {
            localStorage.setItem(AUTOSAVE_KEY, M.markdownEditor.value);
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
        var saved = localStorage.getItem(AUTOSAVE_KEY);
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
    var CLOUD_DOC_KEY = 'md-viewer-cloud-doc-id';
    var CLOUD_KEY_KEY = 'md-viewer-cloud-enc-key';
    var cloudSaveTimer = null;
    var cloudSaveDirty = false;
    var lastCloudContent = '';

    function scheduleCloudSave() {
        cloudSaveDirty = true;
        if (!cloudSaveTimer) cloudSaveTimer = setInterval(cloudAutoSave, CLOUD_SAVE_INTERVAL);
    }

    async function cloudAutoSave() {
        if (!cloudSaveDirty) return;
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
            if (existingDocId) { await db.collection('shares').doc(existingDocId).set({ d: dataString, t: Date.now() }); }
            else { var docRef = await db.collection('shares').add({ d: dataString, t: Date.now() }); localStorage.setItem(CLOUD_DOC_KEY, docRef.id); }
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
    M.shareMarkdown = async function () {
        var shareButton = document.getElementById('share-button');
        var originalText = shareButton.innerHTML;
        try {
            var markdownContent = M.markdownEditor.value;
            if (!markdownContent.trim()) { alert('Nothing to share — the editor is empty.'); return; }
            shareButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Sharing...'; shareButton.disabled = true;
            var compressed = compressData(markdownContent);
            var key = await generateEncryptionKey();
            var encrypted = await encryptData(key, compressed);
            var dataString = uint8ArrayToBase64Url(encrypted);
            var keyString = await keyToBase64Url(key);
            var shareUrl;
            try {
                var docRef = await db.collection('shares').add({ d: dataString, t: Date.now() });
                shareUrl = SHARE_BASE_URL + '#id=' + docRef.id + '&k=' + keyString;
            } catch (fbError) {
                console.warn('Firebase unavailable, using URL fallback:', fbError);
                shareUrl = SHARE_BASE_URL + '#d=' + dataString + '&k=' + keyString;
                if (shareUrl.length > 65000) throw new Error('Content too large to share. Try a smaller document.');
            }
            showShareResult(shareUrl);
            shareButton.innerHTML = '<i class="bi bi-check-lg"></i> Shared!';
            setTimeout(function () { shareButton.innerHTML = originalText; }, 2000);
            shareButton.disabled = false;
        } catch (error) {
            console.error('Share failed:', error);
            alert('Share failed: ' + error.message);
            shareButton.innerHTML = originalText; shareButton.disabled = false;
        }
    };

    // ========================================
    // LOAD SHARED MARKDOWN
    // ========================================
    M.loadSharedMarkdown = async function () {
        var hash = window.location.hash.substring(1);
        if (!hash) return;
        var params = new URLSearchParams(hash);
        var docId = params.get('id');
        var inlineData = params.get('d');
        var keyString = params.get('k');
        if (!keyString || (!docId && !inlineData)) return;
        try {
            M.markdownPreview.innerHTML = '<div style="padding: 40px; text-align: center; opacity: 0.6;"><i class="bi bi-lock"></i> Decrypting shared content...</div>';
            M.setViewMode('preview');
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
            M.setViewMode('preview');
            showSharedBanner();
        } catch (error) {
            console.error('Failed to load shared markdown:', error);
            M.markdownPreview.innerHTML = '<div style="padding: 40px; text-align: center;"><h3 style="color: var(--color-danger-fg);"><i class="bi bi-shield-exclamation"></i> Decryption Failed</h3><p style="opacity: 0.7;">The link may be invalid or the document may not exist.</p><p style="font-size: 13px; opacity: 0.5;">' + error.message + '</p></div>';
            M.setViewMode('preview');
        }
    };

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
        window.history.replaceState({}, document.title, window.location.pathname);
        M.setViewMode('split');
    });
    document.getElementById('shared-banner-close').addEventListener('click', function () {
        hideSharedBanner();
        window.history.replaceState({}, document.title, window.location.pathname);
    });

    // --- Share Result Modal ---
    var shareResultModal = document.getElementById('share-result-modal');
    function showShareResult(url) {
        document.getElementById('share-link-input').value = url;
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

    // --- New Document Button ---
    var newDocBtn = document.getElementById('new-document-btn');
    if (newDocBtn) {
        newDocBtn.addEventListener('click', function () { window.open(window.location.pathname, '_blank'); });
    }

    // --- Restore Auto-Saved Content ---
    var wasRestored = restoreFromLocalStorage();
    if (wasRestored) M.renderMarkdown();

})(window.MDView);
