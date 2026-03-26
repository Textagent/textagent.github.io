// ============================================
// form-engine.js — Form & Quiz Response Collection & Viewer
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

    // ─── QUIZ SUBMISSION HANDLER ─────────────────────
    // Same pattern as forms — encrypts & stores quiz answers in Firestore
    window.addEventListener('message', async function (event) {
        if (!event.data || event.data.type !== 'textagent-quiz-submit') return;

        var quizData = event.data.data;
        if (!quizData || typeof quizData !== 'object') return;

        var hash = window.location.hash.substring(1);
        if (!hash) {
            showFormToast('📋 Quiz answers captured (share document to enable response collection)', 'info');
            console.log('Quiz response (local):', quizData);
            return;
        }

        var params = new URLSearchParams(hash);
        var formId = params.get('s') || params.get('id');
        if (!formId) {
            showFormToast('📋 Quiz answers captured locally', 'info');
            return;
        }

        try {
            var doc = await M.db.collection('shares').doc(formId).get();
            if (!doc.exists) throw new Error('Document not found.');
            var docData = doc.data();
            var keyString = docData.k || params.get('k');
            if (!keyString) { showFormToast('⚠️ Encryption key not found.', 'error'); return; }

            var rawKey = M.base64UrlToUint8Array(keyString);
            var encKey = await crypto.subtle.importKey('raw', rawKey,
                { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);

            var jsonStr = JSON.stringify(quizData);
            var compressed = M.compressData(jsonStr);
            var encrypted = await M.encryptData(encKey, compressed);
            var dataString = M.uint8ArrayToBase64Url(encrypted);

            await M.db.collection('shares').doc(formId)
                .collection('responses').add({
                    d: dataString,
                    t: Date.now()
                });

            showFormToast('✅ Quiz answers submitted! Your teacher will review them.', 'success');
        } catch (error) {
            console.error('Quiz submission error:', error);
            showFormToast('⚠️ Could not save quiz answers: ' + error.message, 'error');
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
                        parsed._type = respData._type || 'form';
                        responses.push(parsed);
                    } else {
                        // Plain response
                        var parsed = JSON.parse(respData.d);
                        parsed._id = respDoc.id;
                        parsed._timestamp = respData.t;
                        parsed._type = respData._type || 'form';
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
        var hiddenKeys = { _id: 1, _timestamp: 1, _error: 1, formIndex: 1, formTitle: 1, submitted: 1, _type: 1, answers: 1 };
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
            var titleEl = document.querySelector('.form-dg-title') || document.querySelector('.quiz-dg-title');
            if (titleEl) formTitle = titleEl.textContent.trim();
        }

        // Check if any quiz responses exist
        var hasQuizResponses = responses.some(function(r) { return r._type === 'quiz' || r.answers; });
        var responseLabel = hasQuizResponses ? 'Quiz Responses' : 'Responses';

        var html = '<div class="form-resp-card">';
        html += '<div class="form-resp-header">';
        html += '<h2>📊 ' + (formTitle ? escapeHtml(formTitle) + ' — ' : '') + responseLabel + ' <span class="form-resp-count">' + responses.length + '</span></h2>';
        html += '<div class="form-resp-actions">';
        html += '<button class="form-resp-btn form-resp-csv" id="form-resp-csv">📥 CSV</button>';
        html += '<button class="form-resp-btn form-resp-json" id="form-resp-json">📥 JSON</button>';
        html += '<button class="form-resp-btn form-resp-close" id="form-resp-close">✕ Close</button>';
        html += '</div></div>';

        if (responses.length === 0) {
            html += '<div class="form-resp-empty"><div class="form-resp-empty-icon">📭</div>';
            html += '<p>No responses yet</p><p class="form-resp-empty-sub">Share your ' + (hasQuizResponses ? 'quiz' : 'form') + ' link to start collecting responses.</p></div>';
        } else if (hasQuizResponses) {
            // Quiz-specific response table — detect if any response has email/id
            var hasEmail = responses.some(function(r){ return r.studentEmail; });
            var hasStudentId = responses.some(function(r){ return r.studentId; });
            html += '<div class="form-resp-table-wrap"><table class="form-resp-table">';
            html += '<thead><tr><th>#</th><th>Student</th>';
            if (hasEmail) html += '<th>Email</th>';
            if (hasStudentId) html += '<th>ID</th>';
            html += '<th>Score</th><th>XP</th><th>Details</th><th>Submitted</th></tr></thead><tbody>';
            responses.forEach(function (resp, idx) {
                var student = resp.studentName || resp.student_name || 'Anonymous ' + (idx + 1);
                var score   = resp.score !== undefined ? resp.score + '/' + (resp.total || '?') : '—';
                var xp      = resp.xp !== undefined ? '⭐ ' + resp.xp : '—';
                var answers  = resp.answers || [];
                var detailSummary = '';
                var detailExpanded = '';
                if (answers.length) {
                    var correct = answers.filter(function(a){return a.correct===true;}).length;
                    var pendingReview = answers.filter(function(a){return (a.correct===null||a.correct===undefined)&&(a.type==='short'||a.type==='fill'||a.type==='essay');}).length;
                    detailSummary = pendingReview > 0
                        ? correct + '/' + (answers.length-pendingReview) + ' correct + ' + pendingReview + ' pending review — click to expand'
                        : correct + '/' + answers.length + ' correct — click to expand';
                    // Build per-question expandable detail
                    detailExpanded = '<div class="quiz-resp-detail" id="quiz-resp-detail-'+idx+'" style="display:none;padding:10px;text-align:left">';
                    answers.forEach(function(a, ai) {
                        var needsReview = (a.correct === null || a.correct === undefined) && (a.type === 'short' || a.type === 'fill' || a.type === 'essay');
                        var icon = a.correct===true ? '✅' : needsReview ? '📝' : a.correct===false ? '❌' : '📝';
                        var borderColor = a.correct===true ? '#22c55e' : needsReview ? '#eab308' : a.correct===false ? '#ef4444' : '#94a3b8';
                        var badge = needsReview ? ' <span style="background:#854d0e;color:#fde68a;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">NEEDS REVIEW</span>' : '';
                        var typeLabel = a.type ? ' <span style="color:#64748b;font-size:11px">['+escapeHtml(a.type)+']</span>' : '';
                        detailExpanded += '<div class="qr-answer-row" data-resp-idx="'+idx+'" data-q-idx="'+ai+'" style="padding:8px 12px;margin:4px 0;border-radius:8px;background:rgba(255,255,255,0.03);border-left:3px solid '+borderColor+'">';
                        detailExpanded += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">';
                        detailExpanded += '<strong class="qr-icon">'+icon+' Q'+(ai+1)+typeLabel+':</strong>';
                        detailExpanded += '<span style="display:flex;gap:4px">';
                        detailExpanded += '<button class="qr-grade-btn" data-resp-idx="'+idx+'" data-q-idx="'+ai+'" data-grade="true" style="padding:3px 10px;border-radius:6px;border:1px solid '+(a.correct===true?'#22c55e':'#334155')+';background:'+(a.correct===true?'#064e3b':'transparent')+';color:'+(a.correct===true?'#6ee7b7':'#94a3b8')+';cursor:pointer;font-size:12px;font-weight:600">✅ Correct</button>';
                        detailExpanded += '<button class="qr-grade-btn" data-resp-idx="'+idx+'" data-q-idx="'+ai+'" data-grade="false" style="padding:3px 10px;border-radius:6px;border:1px solid '+(a.correct===false?'#ef4444':'#334155')+';background:'+(a.correct===false?'#7f1d1d':'transparent')+';color:'+(a.correct===false?'#fca5a5':'#94a3b8')+';cursor:pointer;font-size:12px;font-weight:600">❌ Wrong</button>';
                        detailExpanded += '</span></div>';
                        detailExpanded += ' '+escapeHtml(a.question||'')+badge+'<br>';
                        detailExpanded += '<div style="margin:6px 0;padding:8px 12px;background:rgba(165,180,252,0.08);border-radius:6px;color:#e2e8f0;white-space:pre-wrap;word-break:break-word">'+escapeHtml(a.answer||'—')+'</div>';
                        if(a.correct===false && a.correctAnswer) {
                            detailExpanded += '<span style="color:#86efac;font-size:13px">✓ Expected: '+escapeHtml(a.correctAnswer)+'</span>';
                        }
                        detailExpanded += '</div>';
                    });
                    detailExpanded += '</div>';
                } else {
                    // Flat key/value responses
                    detailSummary = columns.map(function(c){ return escapeHtml(c) + ': ' + escapeHtml(resp[c]||''); }).join(', ');
                    if (detailSummary.length > 80) detailSummary = detailSummary.substring(0,80) + '…';
                }
                var date = resp._timestamp ? new Date(resp._timestamp) : null;
                var timeStr = date ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                html += '<tr' + (answers.length ? ' class="quiz-resp-row" data-detail-idx="'+idx+'" style="cursor:pointer" title="Click to expand"' : '') + '>';
                html += '<td>' + (idx + 1) + '</td>';
                html += '<td>' + escapeHtml(student) + '</td>';
                if (hasEmail) html += '<td>' + escapeHtml(resp.studentEmail || '—') + '</td>';
                if (hasStudentId) html += '<td>' + escapeHtml(resp.studentId || '—') + '</td>';
                html += '<td>' + escapeHtml(score) + '</td>';
                html += '<td>' + escapeHtml(xp) + '</td>';
                html += '<td>' + detailSummary + '</td>';
                html += '<td>' + timeStr + '</td>';
                html += '</tr>';
                if (detailExpanded) {
                    var colSpan = 6 + (hasEmail?1:0) + (hasStudentId?1:0);
                    html += '<tr class="quiz-resp-detail-row" id="quiz-resp-detail-row-'+idx+'" style="display:none"><td colspan="'+colSpan+'">' + detailExpanded + '</td></tr>';
                }
            });
            html += '</tbody></table></div>';
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

        // Click-to-expand quiz response detail rows
        overlay.querySelectorAll('.quiz-resp-row').forEach(function(row) {
            row.addEventListener('click', function() {
                var idx = row.dataset.detailIdx;
                var detailRow = document.getElementById('quiz-resp-detail-row-' + idx);
                var detailDiv = document.getElementById('quiz-resp-detail-' + idx);
                if (detailRow) {
                    var showing = detailRow.style.display !== 'none';
                    detailRow.style.display = showing ? 'none' : '';
                    if (detailDiv) detailDiv.style.display = showing ? 'none' : '';
                }
            });
        });

        // Creator grade toggle: ✅ Correct / ❌ Wrong buttons
        overlay.addEventListener('click', function(e) {
            var btn = e.target.closest('.qr-grade-btn');
            if (!btn) return;
            e.stopPropagation();
            var respIdx = parseInt(btn.dataset.respIdx);
            var qIdx = parseInt(btn.dataset.qIdx);
            var newGrade = btn.dataset.grade === 'true';
            var resp = responses[respIdx];
            if (!resp || !resp.answers || !resp.answers[qIdx]) return;
            var a = resp.answers[qIdx];
            // Toggle: if already the same grade, un-grade back to null
            if (a.correct === newGrade) { a.correct = null; }
            else { a.correct = newGrade; }
            // Recalculate score for this response
            var newCorrect = resp.answers.filter(function(x){return x.correct===true;}).length;
            resp.score = newCorrect;
            // Update the score cell in the table row
            var tableRow = overlay.querySelector('.quiz-resp-row[data-detail-idx="'+respIdx+'"]');
            if (tableRow) {
                var cells = tableRow.querySelectorAll('td');
                // Score cell: column index depends on presence of email/id columns
                var scoreColIdx = 2 + (hasEmail?1:0) + (hasStudentId?1:0);
                if (cells[scoreColIdx]) cells[scoreColIdx].textContent = newCorrect + '/' + (resp.total||resp.answers.length);
                // Update detail summary cell
                var pendingR = resp.answers.filter(function(x){return (x.correct===null||x.correct===undefined)&&(x.type==='short'||x.type==='fill'||x.type==='essay');}).length;
                var summaryIdx = scoreColIdx + 2; // skip XP column
                if (cells[summaryIdx]) {
                    cells[summaryIdx].textContent = pendingR > 0
                        ? newCorrect+'/'+(resp.answers.length-pendingR)+' correct + '+pendingR+' pending review — click to expand'
                        : newCorrect+'/'+resp.answers.length+' correct — click to expand';
                }
            }
            // Re-render this answer row's visuals
            var ansRow = overlay.querySelector('.qr-answer-row[data-resp-idx="'+respIdx+'"][data-q-idx="'+qIdx+'"]');
            if (ansRow) {
                var needsR = (a.correct===null||a.correct===undefined)&&(a.type==='short'||a.type==='fill'||a.type==='essay');
                var newIcon = a.correct===true?'✅':needsR?'📝':a.correct===false?'❌':'📝';
                var newBdr = a.correct===true?'#22c55e':needsR?'#eab308':a.correct===false?'#ef4444':'#94a3b8';
                ansRow.style.borderLeft = '3px solid '+newBdr;
                var iconEl = ansRow.querySelector('.qr-icon');
                if (iconEl) iconEl.firstChild.textContent = newIcon;
                // Update button styles
                ansRow.querySelectorAll('.qr-grade-btn').forEach(function(b){
                    var isCorrectBtn = b.dataset.grade==='true';
                    var isActive = (isCorrectBtn && a.correct===true) || (!isCorrectBtn && a.correct===false);
                    b.style.borderColor = isActive ? (isCorrectBtn?'#22c55e':'#ef4444') : '#334155';
                    b.style.background = isActive ? (isCorrectBtn?'#064e3b':'#7f1d1d') : 'transparent';
                    b.style.color = isActive ? (isCorrectBtn?'#6ee7b7':'#fca5a5') : '#94a3b8';
                });
                // Remove NEEDS REVIEW badge if graded
                if (a.correct !== null && a.correct !== undefined) {
                    var badges = ansRow.querySelectorAll('span');
                    badges.forEach(function(s){ if(s.textContent==='NEEDS REVIEW') s.remove(); });
                }
            }
        });

        // CSV Export
        document.getElementById('form-resp-csv').addEventListener('click', function () {
            if (responses.length === 0) return;
            var csvCols = hasQuizResponses ? ['student','email','id','score','xp','answers','submitted'] : columns.concat(['submitted']);
            var csv = csvCols.join(',') + '\n';
            responses.forEach(function (resp) {
                var row;
                if (hasQuizResponses) {
                    row = [
                        '"' + String(resp.studentName||resp.student_name||'').replace(/"/g,'""') + '"',
                        '"' + String(resp.studentEmail||'').replace(/"/g,'""') + '"',
                        '"' + String(resp.studentId||'').replace(/"/g,'""') + '"',
                        '"' + (resp.score!==undefined ? resp.score+'/'+resp.total : '') + '"',
                        '"' + (resp.xp||'') + '"',
                        '"' + JSON.stringify(resp.answers||[]).replace(/"/g,'""') + '"',
                    ];
                } else {
                    row = columns.map(function (col) {
                        var val = String(resp[col] || '').replace(/"/g, '""');
                        return '"' + val + '"';
                    });
                }
                var date = resp._timestamp ? new Date(resp._timestamp).toISOString() : '';
                row.push('"' + date + '"');
                csv += row.join(',') + '\n';
            });
            downloadFile(csv, (hasQuizResponses?'quiz':'form')+'-responses.csv', 'text/csv');
        });

        // JSON Export
        document.getElementById('form-resp-json').addEventListener('click', function () {
            if (responses.length === 0) return;
            var clean = responses.map(function (r) {
                var obj = {};
                if (hasQuizResponses) {
                    obj.student = r.studentName || r.student_name || '';
                    obj.email = r.studentEmail || '';
                    obj.id = r.studentId || '';
                    obj.score = r.score; obj.total = r.total; obj.xp = r.xp;
                    obj.answers = r.answers || [];
                } else {
                    columns.forEach(function (c) { obj[c] = r[c] || ''; });
                }
                obj.submitted = r._timestamp ? new Date(r._timestamp).toISOString() : '';
                return obj;
            });
            downloadFile(JSON.stringify(clean, null, 2), (hasQuizResponses?'quiz':'form')+'-responses.json', 'application/json');
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
        // Also handle quiz responses button
        var qBtn = e.target.closest('.quiz-dg-responses-btn');
        if (qBtn) {
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
