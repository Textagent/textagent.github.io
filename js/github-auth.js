// ============================================
// github-auth.js — GitHub Device Flow OAuth
// No backend needed, no redirect, works from any origin.
// ============================================
(function (M) {
    'use strict';

    // ── GitHub OAuth App Client ID ──
    // Register at github.com/settings/developers → OAuth Apps
    // Scopes: codespace (manage user's Codespaces)
    var CLIENT_ID = 'REPLACE_WITH_YOUR_CLIENT_ID';

    // ── CORS proxy ──
    // GitHub's token endpoint doesn't support CORS from browsers.
    // This lightweight proxy forwards POST requests:
    //   https://github.com/nicfit/cors-anywhere  or  self-hosted
    var CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

    // Device Flow endpoints
    var DEVICE_CODE_URL = 'https://github.com/login/device/code';
    var TOKEN_URL = 'https://github.com/login/oauth/access_token';
    var USER_API = 'https://api.github.com/user';

    var POLL_INTERVAL = 5000; // 5s between polls (GitHub minimum)
    var pollTimer = null;

    // ── Public API ──
    M.githubAuth = {
        isAuthenticated: function () {
            return !!localStorage.getItem(M.KEYS.GITHUB_TOKEN);
        },

        getToken: function () {
            return localStorage.getItem(M.KEYS.GITHUB_TOKEN);
        },

        getUser: function () {
            return localStorage.getItem(M.KEYS.GITHUB_USER);
        },

        logout: function () {
            localStorage.removeItem(M.KEYS.GITHUB_TOKEN);
            localStorage.removeItem(M.KEYS.GITHUB_USER);
            localStorage.removeItem(M.KEYS.AGENT_CODESPACE_ID);
            updateModalUI();
            if (M.showToast) M.showToast('🐙 GitHub disconnected', 'info');
        },

        // Start Device Flow login
        login: async function () {
            var errorEl = document.getElementById('github-auth-error');
            var deviceSection = document.getElementById('github-device-code-section');
            var codeEl = document.getElementById('github-device-code');
            var verifyLink = document.getElementById('github-verify-link');
            var connectBtn = document.getElementById('github-auth-connect');

            if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
            if (connectBtn) connectBtn.disabled = true;

            try {
                // Step 1: Request device code
                var codeRes = await fetch(CORS_PROXY + DEVICE_CODE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        client_id: CLIENT_ID,
                        scope: 'codespace'
                    })
                });

                if (!codeRes.ok) throw new Error('Failed to request device code (HTTP ' + codeRes.status + ')');
                var codeData = await codeRes.json();

                if (!codeData.user_code || !codeData.device_code) {
                    throw new Error(codeData.error_description || 'Invalid device code response');
                }

                // Step 2: Show user code
                if (codeEl) codeEl.textContent = codeData.user_code;
                if (verifyLink) verifyLink.href = codeData.verification_uri || 'https://github.com/login/device';
                if (deviceSection) deviceSection.style.display = '';

                // Step 3: Poll for user to authorize
                var interval = (codeData.interval || 5) * 1000;
                if (interval < POLL_INTERVAL) interval = POLL_INTERVAL;
                var expiresAt = Date.now() + (codeData.expires_in || 900) * 1000;

                clearInterval(pollTimer);
                pollTimer = setInterval(async function () {
                    if (Date.now() > expiresAt) {
                        clearInterval(pollTimer);
                        showError('Code expired. Please try again.');
                        resetUI();
                        return;
                    }

                    try {
                        var tokenRes = await fetch(CORS_PROXY + TOKEN_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                client_id: CLIENT_ID,
                                device_code: codeData.device_code,
                                grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
                            })
                        });

                        var tokenData = await tokenRes.json();

                        if (tokenData.access_token) {
                            // Success!
                            clearInterval(pollTimer);
                            localStorage.setItem(M.KEYS.GITHUB_TOKEN, tokenData.access_token);

                            // Fetch username
                            try {
                                var userRes = await fetch(USER_API, {
                                    headers: { 'Authorization': 'Bearer ' + tokenData.access_token }
                                });
                                var userData = await userRes.json();
                                if (userData.login) {
                                    localStorage.setItem(M.KEYS.GITHUB_USER, userData.login);
                                }
                            } catch (_) { /* username fetch failed, non-critical */ }

                            updateModalUI();
                            resetUI();
                            if (M.showToast) M.showToast('✅ GitHub connected as ' + (M.githubAuth.getUser() || 'user'), 'success');
                        } else if (tokenData.error === 'authorization_pending') {
                            // Still waiting — continue polling
                        } else if (tokenData.error === 'slow_down') {
                            // GitHub wants us to slow down
                            interval += 5000;
                        } else if (tokenData.error === 'expired_token') {
                            clearInterval(pollTimer);
                            showError('Code expired. Please try again.');
                            resetUI();
                        } else if (tokenData.error === 'access_denied') {
                            clearInterval(pollTimer);
                            showError('Authorization denied by user.');
                            resetUI();
                        } else {
                            clearInterval(pollTimer);
                            showError(tokenData.error_description || tokenData.error || 'Unknown error');
                            resetUI();
                        }
                    } catch (pollErr) {
                        // Network error during poll — don't stop, try again next interval
                        console.warn('[GitHub Auth] Poll error:', pollErr);
                    }
                }, interval);

            } catch (err) {
                showError(err.message || 'Login failed');
                resetUI();
            }
        },

        showAuthModal: function () {
            var modal = document.getElementById('github-auth-modal');
            if (modal) {
                updateModalUI();
                modal.style.display = 'flex';
            }
        },

        hideAuthModal: function () {
            var modal = document.getElementById('github-auth-modal');
            if (modal) modal.style.display = 'none';
            clearInterval(pollTimer);
            resetUI();
        }
    };

    // ── Internal helpers ──

    function showError(msg) {
        var el = document.getElementById('github-auth-error');
        if (el) { el.textContent = msg; el.style.display = ''; }
    }

    function resetUI() {
        var connectBtn = document.getElementById('github-auth-connect');
        var deviceSection = document.getElementById('github-device-code-section');
        if (connectBtn) connectBtn.disabled = false;
        if (deviceSection) deviceSection.style.display = 'none';
    }

    function updateModalUI() {
        var isAuthed = M.githubAuth.isAuthenticated();
        var infoEl = document.getElementById('github-auth-info');
        var connectedEl = document.getElementById('github-auth-connected');
        var connectBtn = document.getElementById('github-auth-connect');
        var usernameEl = document.getElementById('github-username');

        if (isAuthed) {
            if (infoEl) infoEl.style.display = 'none';
            if (connectedEl) connectedEl.style.display = '';
            if (connectBtn) connectBtn.style.display = 'none';
            if (usernameEl) usernameEl.textContent = M.githubAuth.getUser() || 'Connected';
        } else {
            if (infoEl) infoEl.style.display = '';
            if (connectedEl) connectedEl.style.display = 'none';
            if (connectBtn) connectBtn.style.display = '';
        }
    }

    // ── Wire modal buttons ──
    document.addEventListener('click', function (e) {
        if (e.target.id === 'github-auth-connect' || e.target.closest('#github-auth-connect')) {
            e.preventDefault();
            M.githubAuth.login();
        }
        if (e.target.id === 'github-auth-cancel' || e.target.closest('#github-auth-cancel')) {
            e.preventDefault();
            M.githubAuth.hideAuthModal();
        }
        if (e.target.id === 'github-disconnect' || e.target.closest('#github-disconnect')) {
            e.preventDefault();
            M.githubAuth.logout();
        }
        // Close on backdrop click
        if (e.target.id === 'github-auth-modal') {
            M.githubAuth.hideAuthModal();
        }
    });

})(window.MDView = window.MDView || {});
