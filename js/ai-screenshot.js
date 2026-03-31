// ============================================
// ai-screenshot.js — Screenshot → AI Chat
// Captures the page or screen, injects image into
// the AI chat as an attachment, opens the panel,
// and auto-sends for immediate AI analysis.
// ============================================
(function (M) {
    'use strict';

    // ---- State ----
    var _busy = false;

    // ---- Self-heal: inject button HTML if modal-templates.js was cached ----
    // This runs at module-load time (Phase 3d) — #ai-file-input is already in DOM
    (function injectButtonIfMissing() {
        if (document.getElementById('ai-screenshot-btn')) return; // already there
        var attachInput = document.getElementById('ai-file-input');
        if (!attachInput) return; // AI panel not ready — skip
        var wrapper = document.createElement('div');
        wrapper.className = 'ai-screenshot-wrapper';
        wrapper.style.cssText = 'position:relative; display:inline-flex; align-items:center;';
        wrapper.innerHTML =
            '<button id="ai-screenshot-btn" class="ai-attach-button ai-screenshot-btn" title="Screenshot to AI" type="button">' +
            '  <i class="bi bi-camera"></i>' +
            '</button>' +
            '<div id="ai-screenshot-menu" class="ai-screenshot-menu" style="display:none; position:absolute; bottom:calc(100% + 6px); left:0; z-index:9999; background:#1e2030; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:4px; min-width:160px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">' +
            '  <button id="ai-screenshot-page" class="ai-screenshot-item" type="button" style="display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px; background:none; border:none; color:#e0e0e0; cursor:pointer; border-radius:6px; font-size:13px;"><i class="bi bi-window"></i><span>Capture Page</span></button>' +
            '  <button id="ai-screenshot-screen" class="ai-screenshot-item" type="button" style="display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px; background:none; border:none; color:#e0e0e0; cursor:pointer; border-radius:6px; font-size:13px;"><i class="bi bi-display"></i><span>Capture Screen</span></button>' +
            '  <button id="ai-screenshot-upload" class="ai-screenshot-item" type="button" style="display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px; background:none; border:none; color:#e0e0e0; cursor:pointer; border-radius:6px; font-size:13px;"><i class="bi bi-image"></i><span>Upload Image</span></button>' +
            '</div>' +
            '<input type="file" id="ai-screenshot-file-input" accept="image/*" style="display:none" />';
        attachInput.insertAdjacentElement('afterend', wrapper);
        console.log('[Screenshot] Button injected (cache-heal)');
    })();

    // ---- Event delegation — works regardless of when panel HTML renders ----
    document.addEventListener('click', function (e) {
        // Toggle camera dropdown
        if (e.target.closest('#ai-screenshot-btn')) {
            e.stopPropagation();
            var menu = document.getElementById('ai-screenshot-menu');
            if (menu) {
                var isOpen = menu.style.display !== 'none';
                menu.style.display = isOpen ? 'none' : 'block';
                menu.classList.toggle('active', !isOpen);
            }
            return;
        }

        // Close dropdown on outside click
        if (!e.target.closest('#ai-screenshot-menu') && !e.target.closest('#ai-screenshot-btn')) {
            var menu2 = document.getElementById('ai-screenshot-menu');
            if (menu2) { menu2.style.display = 'none'; menu2.classList.remove('active'); }
        }

        // Capture Page
        if (e.target.closest('#ai-screenshot-page')) {
            var menu3 = document.getElementById('ai-screenshot-menu');
            if (menu3) { menu3.style.display = 'none'; menu3.classList.remove('active'); }
            capturePageScreenshot();
            return;
        }

        // Capture Screen
        if (e.target.closest('#ai-screenshot-screen')) {
            var menu4 = document.getElementById('ai-screenshot-menu');
            if (menu4) { menu4.style.display = 'none'; menu4.classList.remove('active'); }
            captureScreenScreenshot();
            return;
        }

        // Upload Image
        if (e.target.closest('#ai-screenshot-upload')) {
            var menu5 = document.getElementById('ai-screenshot-menu');
            if (menu5) { menu5.style.display = 'none'; menu5.classList.remove('active'); }
            var input = document.getElementById('ai-screenshot-file-input');
            if (input) input.click();
            return;
        }
    });

    // File upload handler (also wired via delegation on change)
    document.addEventListener('change', function (e) {
        if (e.target.id === 'ai-screenshot-file-input') {
            var files = e.target.files;
            if (files && files.length > 0) {
                var file = files[0];
                if (file.type.startsWith('image/')) {
                    var reader = new FileReader();
                    reader.onload = function (ev) {
                        injectAndSend(ev.target.result, file.type, file.name);
                    };
                    reader.readAsDataURL(file);
                }
            }
            e.target.value = '';
        }
    });

    // ============================================
    // CAPTURE: PAGE (html2canvas)
    // ============================================
    async function capturePageScreenshot() {
        if (_busy) return;
        _busy = true;

        showFlash('Capturing page…');

        try {
            var html2canvas = await window.getHtml2canvas();

            // Hide the AI panel temporarily for a clean shot
            var aiPanel = document.getElementById('ai-panel');
            var wasOpen = aiPanel && aiPanel.classList.contains('ai-panel-open');
            if (wasOpen) aiPanel.classList.remove('ai-panel-open');

            await delay(300); // wait for panel close animation

            var canvas = await html2canvas(document.body, {
                useCORS: true,
                allowTaint: true,
                scale: Math.min(window.devicePixelRatio || 1, 2),
                logging: false,
                backgroundColor: null,
                ignoreElements: function (el) {
                    return el.id === 'ai-panel' ||
                        el.id === 'ai-panel-overlay' ||
                        el.classList.contains('ai-consent-modal') ||
                        el.classList.contains('toast-container') ||
                        el.id === 'ai-screenshot-flash';
                }
            });

            // Restore panel
            if (wasOpen && aiPanel) aiPanel.classList.add('ai-panel-open');

            hideFlash();
            _busy = false;
            injectAndSend(canvas.toDataURL('image/png'), 'image/png', 'page-screenshot.png');

        } catch (err) {
            hideFlash();
            _busy = false;
            if (M.showToast) M.showToast('📷 Page capture failed: ' + err.message, 'error');
            console.error('[Screenshot] Page capture error:', err);
        }
    }

    // ============================================
    // CAPTURE: SCREEN (getDisplayMedia → single frame)
    // ============================================
    async function captureScreenScreenshot() {
        if (_busy) return;
        _busy = true;

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                _busy = false;
                if (M.showToast) M.showToast('📷 Screen capture not supported in this browser', 'error');
                return;
            }

            showFlash('Select a window or tab to capture…');

            var stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: false
            });

            hideFlash();
            showFlash('Capturing…');

            var track = stream.getVideoTracks()[0];
            var settings = track.getSettings();
            var video = document.createElement('video');
            video.srcObject = stream;
            video.muted = true;
            video.autoplay = true;
            video.playsInline = true;

            // MUST be in the DOM for the browser decoder to render real frames
            video.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
            document.body.appendChild(video);

            // Wait for metadata then start playback
            await new Promise(function (resolve) {
                video.onloadedmetadata = function () { video.play().then(resolve).catch(resolve); };
            });

            // Wait for timeupdate — this fires ONLY when real frame data is flowing
            // Much more reliable than requestAnimationFrame alone
            await new Promise(function (resolve) {
                var resolved = false;
                function done() { if (!resolved) { resolved = true; resolve(); } }
                video.ontimeupdate = done;
                // Fallback: if timeupdate never fires (some browsers), wait 800ms
                setTimeout(done, 800);
            });

            // Wait 2 additional frames so the frame buffer is fully ready
            await new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); });

            // Determine canvas size — prefer settings, fall back to video dimensions
            var w = (settings.width  && settings.width  > 0) ? settings.width  : video.videoWidth  || 1280;
            var h = (settings.height && settings.height > 0) ? settings.height : video.videoHeight || 720;

            var canvas = document.createElement('canvas');
            canvas.width  = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(video, 0, 0, w, h);

            // Stop stream AFTER capturing the frame
            stream.getTracks().forEach(function (t) { t.stop(); });
            video.remove();

            hideFlash();
            _busy = false;
            injectAndSend(canvas.toDataURL('image/png'), 'image/png', 'screen-screenshot.png');

        } catch (err) {
            hideFlash();
            _busy = false;
            if (err.name === 'NotAllowedError') {
                if (M.showToast) M.showToast('📷 Screen capture cancelled', 'info');
            } else {
                if (M.showToast) M.showToast('📷 Screen capture failed: ' + err.message, 'error');
                console.error('[Screenshot] Screen capture error:', err);
            }
        }
    }


    // ============================================
    // INJECT IMAGE + OPEN PANEL + AUTO-SEND
    // ============================================
    function injectAndSend(dataUrl, mimeType, fileName) {
        var _ai = M._ai;
        if (!_ai) {
            if (M.showToast) M.showToast('AI module not ready — try again in a moment', 'warning');
            return;
        }

        // Warn (but don't block) if the current model doesn't support vision
        var modelCfg = _ai.models && _ai.currentModel ? _ai.models[_ai.currentModel] : null;
        var hasVision = modelCfg && modelCfg.supportsVision;
        if (!hasVision) {
            if (M.showToast) M.showToast(
                '⚠️ Switch to a vision model (Gemini, Groq, Claude, etc.) for best results',
                'warning'
            );
        }

        // Build a synthetic File from the dataUrl and inject it
        var file = buildFile(dataUrl, mimeType, fileName);

        // Clear old attachments then add our screenshot
        if (_ai.clearAttachments) _ai.clearAttachments();
        if (_ai.addFilesToPending) _ai.addFilesToPending([file]);

        // Open the AI panel using the published API from ai-assistant.js
        if (M.openAiPanel) {
            M.openAiPanel();
        }

        // Auto-send after panel animation completes
        setTimeout(function () {
            var aiInput = document.getElementById('ai-input');
            var aiSendBtn = document.getElementById('ai-send-btn');
            if (aiInput && aiSendBtn) {
                aiInput.value = 'What do you see in this screenshot? Describe it in detail.';
                // Trigger resize for the textarea
                aiInput.dispatchEvent(new Event('input', { bubbles: true }));
                aiSendBtn.click();
            }
        }, 400);
    }

    // ---- Build a synthetic File from a data URL ----
    function buildFile(dataUrl, mimeType, fileName) {
        var parts = dataUrl.split(',');
        var byteString = atob(parts[1]);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        var blob = new Blob([ab], { type: mimeType });
        return new File([blob], fileName || 'screenshot.png', { type: mimeType });
    }

    // ============================================
    // FLASH OVERLAY  (full-screen feedback)
    // ============================================
    var flashEl = null;

    function showFlash(message) {
        if (!flashEl) {
            flashEl = document.createElement('div');
            flashEl.id = 'ai-screenshot-flash';
            flashEl.className = 'ai-screenshot-flash';
            document.body.appendChild(flashEl);
        }
        flashEl.innerHTML =
            '<div class="ai-screenshot-flash-inner">' +
            '  <i class="bi bi-camera"></i>' +
            '  <span>' + message + '</span>' +
            '</div>';
        requestAnimationFrame(function () { flashEl.classList.add('active'); });
    }

    function hideFlash() {
        if (flashEl) flashEl.classList.remove('active');
    }

    function delay(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    // ---- Expose publicly for external callers ----
    M.capturePageScreenshot = capturePageScreenshot;
    M.captureScreenScreenshot = captureScreenScreenshot;

})(window.MDView);
