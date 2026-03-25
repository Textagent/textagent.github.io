// ============================================
// form-engine.js — Form Response Collection & Viewer
// ============================================
(function (M) {
    'use strict';

    // HTML escape helper to prevent XSS
    function escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ─── FORM SUBMISSION HANDLER ──────────────────────
    // Listens for postMessage from html-autorun sandbox iframes
    // when a form is submitted.
    window.addEventListener('message', async function (event) {
        if (!event.data || event.data.type !== 'textagent-form-submit') return;

        var formData = event.data.data;
        if (!formData || typeof formData !== 'object') return;

        // Get current shared document context
        var hash = window.location.hash.substring(1);
        if (!hash) {
            showFormToast('📋 Form data captured (not shared — share to enable response collection)', 'info');
            console.log('Form response (local):', formData);
            return;
        }

        var params = new URLSearchParams(hash);
        var formId = params.get('s') || params.get('id');
        if (!formId) {
            showFormToast('📋 Form data captured locally', 'info');
            console.log('Form response (local):', formData);
            return;
        }

        try {
            // Get the encryption key from the shared document
            var doc = await M.db.collection('shares').doc(formId).get();
            if (!doc.exists) throw new Error('Form document not found.');
            var docData = doc.data();

            var keyString = docData.k || params.get('k');
            if (!keyString) {
                showFormToast('⚠️ Could not submit — form encryption key not found.', 'error');
                return;
            }

            // Encrypt the response with the same key
            var key = await M.base64UrlToKey(keyString);
            // Re-import as encrypt-capable key
            var rawKey = M.base64UrlToUint8Array(keyString);
            var encKey = await crypto.subtle.importKey('raw', rawKey,
                { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);

            var jsonStr = JSON.stringify(formData);
            var compressed = M.compressData(jsonStr);
            var encrypted = await M.encryptData(encKey, compressed);
            var dataString = M.uint8ArrayToBase64Url(encrypted);

            // Write to Firestore responses subcollection
            await M.db.collection('shares').doc(formId)
                .collection('responses').add({
                    d: dataString,
                    t: Date.now()
                });

            showFormToast('✅ Response submitted successfully!', 'success');
        } catch (error) {
            console.error('Form submission error:', error);
            showFormToast('⚠️ Could not save response: ' + error.message, 'error');
        }
    });

    // (storeResponsePlain removed — all responses are now encrypted)

    // ─── RESPONSE VIEWER ─────────────────────────────
    async function loadFormResponses() {
        var hash = window.location.hash.substring(1);
        if (!hash) { showFormToast('No shared form found', 'warning'); return; }

        var params = new URLSearchParams(hash);
        var formId = params.get('s') || params.get('id');
        if (!formId) { showFormToast('No form ID found', 'warning'); return; }

        try {
            // Get the key
            var doc = await M.db.collection('shares').doc(formId).get();
            if (!doc.exists) throw new Error('Form not found.');
            var docData = doc.data();
            var keyString = docData.k || params.get('k');

            // Fetch all responses
            var snapshot = await M.db.collection('shares').doc(formId)
                .collection('responses').orderBy('t', 'desc').get();

            if (snapshot.empty) {
                showResponseModal([], formId);
                return;
            }

            var responses = [];
            for (var i = 0; i < snapshot.docs.length; i++) {
                var respDoc = snapshot.docs[i];
                var respData = respDoc.data();
                try {
                    if (keyString && respData.d && respData.d.length > 100) {
                        // Encrypted response — decrypt
                        var rawKey = M.base64UrlToUint8Array(keyString);
                        var decKey = await crypto.subtle.importKey('raw', rawKey,
                            { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
                        var encrypted = M.base64UrlToUint8Array(respData.d);
                        var compressed = await M.decryptData(decKey, encrypted);
                        var jsonStr = M.decompressData(compressed);
                        var parsed = JSON.parse(jsonStr);
                        parsed._id = respDoc.id;
                        parsed._timestamp = respData.t;
                        responses.push(parsed);
                    } else {
                        // Plain response
                        var parsed = JSON.parse(respData.d);
                        parsed._id = respDoc.id;
                        parsed._timestamp = respData.t;
                        responses.push(parsed);
                    }
                } catch (decErr) {
                    console.warn('Failed to decrypt response:', decErr);
                    responses.push({ _error: 'Decryption failed', _id: respDoc.id, _timestamp: respData.t });
                }
            }

            showResponseModal(responses, formId);
        } catch (error) {
            console.error('Load responses error:', error);
            showFormToast('⚠️ Could not load responses: ' + error.message, 'error');
        }
    }

    // ─── RESPONSE MODAL ──────────────────────────────
    function showResponseModal(responses, formId) {
        // Remove existing modal
        var old = document.getElementById('form-responses-modal');
        if (old) old.remove();

        var overlay = document.createElement('div');
        overlay.id = 'form-responses-modal';
        overlay.className = 'form-resp-overlay';

        // Determine columns from ALL responses (handles schema changes over time)
        var hiddenKeys = { _id: 1, _timestamp: 1, _error: 1, formIndex: 1, formTitle: 1, submitted: 1 };
        var columnSet = {};
        var columns = [];
        responses.forEach(function (resp) {
            Object.keys(resp).forEach(function (k) {
                if (!hiddenKeys[k] && k.charAt(0) !== '_' && !columnSet[k]) {
                    columnSet[k] = true;
                    columns.push(k);
                }
            });
        });

        // Extract form title from responses or DOM
        var formTitle = '';
        for (var ft = 0; ft < responses.length; ft++) {
            if (responses[ft]._formTitle || responses[ft].formTitle) {
                formTitle = responses[ft]._formTitle || responses[ft].formTitle;
                break;
            }
        }
        if (!formTitle) {
            var titleEl = document.querySelector('.form-dg-title');
            if (titleEl) formTitle = titleEl.textContent.trim();
        }

        var html = '<div class="form-resp-card">';
        html += '<div class="form-resp-header">';
        html += '<h2>📊 ' + (formTitle ? escapeHtml(formTitle) + ' — ' : 'Form ') + 'Responses <span class="form-resp-count">' + responses.length + '</span></h2>';
        html += '<div class="form-resp-actions">';
        html += '<button class="form-resp-btn form-resp-csv" id="form-resp-csv">📥 CSV</button>';
        html += '<button class="form-resp-btn form-resp-json" id="form-resp-json">📥 JSON</button>';
        html += '<button class="form-resp-btn form-resp-close" id="form-resp-close">✕ Close</button>';
        html += '</div></div>';

        if (responses.length === 0) {
            html += '<div class="form-resp-empty"><div class="form-resp-empty-icon">📭</div>';
            html += '<p>No responses yet</p><p class="form-resp-empty-sub">Share your form link to start collecting responses.</p></div>';
        } else {
            html += '<div class="form-resp-table-wrap"><table class="form-resp-table">';
            html += '<thead><tr><th>#</th>';
            columns.forEach(function (col) {
                var label = col.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
                html += '<th>' + label + '</th>';
            });
            html += '<th>Submitted</th></tr></thead><tbody>';
            responses.forEach(function (resp, idx) {
                html += '<tr>';
                html += '<td>' + (idx + 1) + '</td>';
                columns.forEach(function (col) {
                    var val = resp[col] || '';
                    // Truncate long values and escape HTML to prevent XSS
                    var safe = escapeHtml(val);
                    var display = safe.length > 60 ? safe.substring(0, 60) + '…' : safe;
                    html += '<td title="' + escapeHtml(val) + '">' + display + '</td>';
                });
                // Timestamp
                var date = resp._timestamp ? new Date(resp._timestamp) : null;
                var timeStr = date ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                html += '<td>' + timeStr + '</td>';
                html += '</tr>';
            });
            html += '</tbody></table></div>';
        }

        html += '</div>';
        overlay.innerHTML = html;
        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('active'); });

        // Close handlers
        function closeModal() {
            overlay.classList.remove('active');
            setTimeout(function () { overlay.remove(); }, 200);
            document.removeEventListener('keydown', escHandler);
        }
        function escHandler(e) { if (e.key === 'Escape') closeModal(); }
        document.addEventListener('keydown', escHandler);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
        document.getElementById('form-resp-close').addEventListener('click', closeModal);

        // CSV Export
        document.getElementById('form-resp-csv').addEventListener('click', function () {
            if (responses.length === 0) return;
            var csvCols = columns.concat(['submitted']);
            var csv = csvCols.join(',') + '\n';
            responses.forEach(function (resp) {
                var row = columns.map(function (col) {
                    var val = String(resp[col] || '').replace(/"/g, '""');
                    return '"' + val + '"';
                });
                var date = resp._timestamp ? new Date(resp._timestamp).toISOString() : '';
                row.push('"' + date + '"');
                csv += row.join(',') + '\n';
            });
            downloadFile(csv, 'form-responses.csv', 'text/csv');
        });

        // JSON Export
        document.getElementById('form-resp-json').addEventListener('click', function () {
            if (responses.length === 0) return;
            var clean = responses.map(function (r) {
                var obj = {};
                columns.forEach(function (c) { obj[c] = r[c] || ''; });
                obj.submitted = r._timestamp ? new Date(r._timestamp).toISOString() : '';
                return obj;
            });
            downloadFile(JSON.stringify(clean, null, 2), 'form-responses.json', 'application/json');
        });
    }

    function downloadFile(content, filename, type) {
        var blob = new Blob([content], { type: type });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ─── TOAST HELPER ────────────────────────────────
    function showFormToast(msg, type) {
        if (M.showToast) {
            M.showToast(msg, type || 'info');
        } else {
            console.log('[Form]', msg);
        }
    }

    // ─── DETECT IN-FORM RESPONSES BUTTON CLICKS ──────
    // Delegated handler for the responses button rendered inside the form card
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.form-dg-responses-btn');
        if (btn) {
            e.preventDefault();
            loadFormResponses();
        }
    });

    // Also check on page load for shared docs with forms (legacy fallback)
    setTimeout(function () {
        // Expose hasForm detection for other modules
        var preview = document.getElementById('markdown-preview');
        if (preview && M.formResponseKey) {
            var hasForm = preview.querySelector('[data-textagent-form]') ||
                preview.querySelector('iframe') ||
                (M.markdownEditor && /\{\{@?Form:/i.test(M.markdownEditor.value));
            if (hasForm) M._hasFormContent = true;
        }
    }, 2000);

    // Expose for other modules
    M.loadFormResponses = loadFormResponses;

})(window.MDView);
