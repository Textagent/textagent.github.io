// ============================================
// agent-cloud.js — Codespaces API Adapter
// Create, run commands on, and manage ephemeral
// GitHub Codespaces for external agent execution.
// ============================================
(function (M) {
    'use strict';

    var API_BASE = 'https://api.github.com';
    var TEMPLATE_REPO = 'textagent/agent-runner';   // Pre-configured with OpenClaw/OpenFang
    var IDLE_TIMEOUT_MS = 5 * 60 * 1000;            // Auto-stop after 5 min idle
    var CODESPACE_PREFIX = 'textagent-';             // Naming prefix for cleanup
    var idleTimer = null;

    // ── Public API ──
    M.agentCloud = {

        /** Check if cloud execution is available (user authenticated + provider set) */
        isAvailable: function () {
            return M.githubAuth && M.githubAuth.isAuthenticated() &&
                M.agentCloud.getProvider() === 'codespaces';
        },

        /** Get configured provider: 'codespaces' | 'custom' | '' */
        getProvider: function () {
            return localStorage.getItem(M.KEYS.AGENT_PROVIDER) || '';
        },

        /** Set provider */
        setProvider: function (name) {
            localStorage.setItem(M.KEYS.AGENT_PROVIDER, name || '');
        },

        /**
         * Execute a command on a Codespace.
         * Creates or reuses an existing Codespace, runs the command,
         * and returns the output.
         *
         * @param {string} command - Shell command to execute
         * @param {Object} [opts] - Options
         * @param {string} [opts.prevOutput] - Previous step output for context
         * @param {number} [opts.timeout=60000] - Timeout in ms
         * @param {boolean} [opts.forceLocal] - Skip GitHub auth, use local endpoint
         * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
         */
        run: async function (command, opts) {
            opts = opts || {};

            var provider = M.agentCloud.getProvider() || 'local';
            console.log('%c[AgentCloud] ▶ run()', 'color: #58a6ff; font-weight: bold',
                '| provider=' + provider,
                '| agent=' + (opts.agentType || 'none'),
                '| forceLocal=' + !!opts.forceLocal,
                '| cmd=' + command.substring(0, 80));

            // Local agent execution (no GitHub auth needed)
            if (opts.forceLocal) {
                console.log('[AgentCloud] → Using LOCAL Docker endpoint');
                return runCustomEndpoint(command, opts);
            }

            var token = M.githubAuth.getToken();
            if (!token) throw new Error('Not authenticated with GitHub. Please sign in first.');

            var provider = M.agentCloud.getProvider();

            // Custom endpoint fallback
            if (provider === 'custom') {
                return runCustomEndpoint(command, opts);
            }

            // GitHub Codespaces flow
            var codespaceName = await getOrCreateCodespace(token);

            // Execute command
            var result = await executeInCodespace(token, codespaceName, command, opts.timeout || 60000);

            // Reset idle timer
            clearTimeout(idleTimer);
            idleTimer = setTimeout(function () {
                M.agentCloud.stop(codespaceName).catch(function (e) {
                    console.warn('[AgentCloud] Auto-stop failed:', e);
                });
            }, IDLE_TIMEOUT_MS);

            return result;
        },

        /** Stop a specific Codespace */
        stop: async function (codespaceName) {
            var token = M.githubAuth.getToken();
            if (!token || !codespaceName) return;

            try {
                await apiFetch(token, '/user/codespaces/' + codespaceName + '/stop', {
                    method: 'POST'
                });
                console.log('[AgentCloud] Stopped codespace:', codespaceName);
                localStorage.removeItem(M.KEYS.AGENT_CODESPACE_ID);
            } catch (err) {
                console.warn('[AgentCloud] Stop failed:', err);
            }
        },

        /** List running Codespaces (TextAgent-created ones) */
        listRunning: async function () {
            var token = M.githubAuth.getToken();
            if (!token) return [];

            var data = await apiFetch(token, '/user/codespaces');
            return (data.codespaces || []).filter(function (cs) {
                return cs.display_name && cs.display_name.indexOf(CODESPACE_PREFIX) === 0;
            });
        },

        /** Stop all TextAgent Codespaces */
        cleanup: async function () {
            var running = await M.agentCloud.listRunning();
            var promises = running.map(function (cs) {
                return M.agentCloud.stop(cs.name);
            });
            await Promise.all(promises);
            if (M.showToast) M.showToast('☁️ All agent environments stopped', 'info');
        },

        /** Get status info for display */
        getStatus: function () {
            var csId = localStorage.getItem(M.KEYS.AGENT_CODESPACE_ID);
            return {
                provider: M.agentCloud.getProvider(),
                hasToken: M.githubAuth && M.githubAuth.isAuthenticated(),
                activeCodespace: csId || null,
                username: M.githubAuth ? M.githubAuth.getUser() : null
            };
        }
    };

    // ── GitHub API helpers ──

    async function apiFetch(token, path, opts) {
        opts = opts || {};
        var url = API_BASE + path;
        var headers = {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };
        if (opts.body) headers['Content-Type'] = 'application/json';

        var res = await fetch(url, {
            method: opts.method || 'GET',
            headers: headers,
            body: opts.body ? JSON.stringify(opts.body) : undefined
        });

        if (!res.ok) {
            var errBody = '';
            try { errBody = await res.text(); } catch (_) {}
            throw new Error('GitHub API ' + res.status + ': ' + errBody.substring(0, 200));
        }

        // Some endpoints return 202/204 with no body
        if (res.status === 204 || res.status === 202) return {};
        return res.json();
    }

    /** Find an existing idle Codespace or create a new one */
    async function getOrCreateCodespace(token) {
        // Check for cached codespace name
        var cached = localStorage.getItem(M.KEYS.AGENT_CODESPACE_ID);
        if (cached) {
            try {
                var cs = await apiFetch(token, '/user/codespaces/' + cached);
                if (cs.state === 'Available') {
                    console.log('[AgentCloud] Reusing active codespace:', cached);
                    return cached;
                }
                if (cs.state === 'Shutdown') {
                    // Restart it
                    await apiFetch(token, '/user/codespaces/' + cached + '/start', { method: 'POST' });
                    await waitForCodespaceReady(token, cached);
                    return cached;
                }
                if (cs.state === 'Starting' || cs.state === 'Rebuilding') {
                    await waitForCodespaceReady(token, cached);
                    return cached;
                }
            } catch (err) {
                // Codespace not found or error — create new
                console.warn('[AgentCloud] Cached codespace unavailable:', err.message);
                localStorage.removeItem(M.KEYS.AGENT_CODESPACE_ID);
            }
        }

        // Look for any existing TextAgent codespace
        var running = await M.agentCloud.listRunning();
        for (var i = 0; i < running.length; i++) {
            if (running[i].state === 'Available') {
                localStorage.setItem(M.KEYS.AGENT_CODESPACE_ID, running[i].name);
                return running[i].name;
            }
        }

        // Create new Codespace from template
        if (M.showToast) M.showToast('☁️ Creating cloud environment…', 'info');

        var newCs = await apiFetch(token, '/user/codespaces', {
            method: 'POST',
            body: {
                repository_id: null,
                ref: null,
                location: 'EastUs',
                machine: 'basicLinux32gb',
                display_name: CODESPACE_PREFIX + Date.now(),
                // Use template repo
                repository: TEMPLATE_REPO,
                idle_timeout_minutes: 5
            }
        });

        if (!newCs.name) throw new Error('Failed to create Codespace');
        localStorage.setItem(M.KEYS.AGENT_CODESPACE_ID, newCs.name);

        await waitForCodespaceReady(token, newCs.name);
        console.log('[AgentCloud] Created codespace:', newCs.name);

        return newCs.name;
    }

    /** Poll until Codespace is ready */
    async function waitForCodespaceReady(token, name, maxWaitMs) {
        maxWaitMs = maxWaitMs || 120000; // 2 minute max
        var start = Date.now();

        while (Date.now() - start < maxWaitMs) {
            var cs = await apiFetch(token, '/user/codespaces/' + name);
            if (cs.state === 'Available') return;
            if (cs.state === 'Failed') throw new Error('Codespace failed to start');

            // Wait 3 seconds before next check
            await new Promise(function (r) { setTimeout(r, 3000); });
        }

        throw new Error('Codespace startup timed out after ' + Math.round(maxWaitMs / 1000) + 's');
    }

    /** Execute a command in a running Codespace */
    async function executeInCodespace(token, name, command, timeoutMs) {
        // Use the Codespaces exec API
        // POST /user/codespaces/{name}/machines is not exec — use REST API
        // The actual exec typically goes through the Codespace's VS Code Server or SSH
        // For now, we use a simplified approach via the REST API

        // Note: GitHub's REST API doesn't have a direct "exec" endpoint.
        // In production, this would use the VS Code Remote SSH tunnel or
        // the Codespace's built-in terminal API.
        // For this implementation, we use a webhook/custom endpoint approach:
        // The agent-runner template repo includes a simple HTTP server that
        // accepts commands and returns output.

        var cs = await apiFetch(token, '/user/codespaces/' + name);
        if (!cs.web_url) throw new Error('Codespace has no web URL — it may still be starting');

        // The agent-runner template exposes a simple API at port 8080
        var execUrl = cs.web_url.replace(/\/$/, '') + '/api/exec';

        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, timeoutMs);

        try {
            var res = await fetch(execUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ command: command }),
                signal: controller.signal
            });

            clearTimeout(timer);

            if (!res.ok) {
                var errText = await res.text();
                throw new Error('Exec failed (' + res.status + '): ' + errText.substring(0, 200));
            }

            return await res.json();
        } catch (err) {
            clearTimeout(timer);
            if (err.name === 'AbortError') {
                throw new Error('Command timed out after ' + Math.round(timeoutMs / 1000) + 's');
            }
            throw err;
        }
    }

    /** Custom/local endpoint (Docker-backed, E2B, Daytona, self-hosted) */
    async function runCustomEndpoint(command, opts) {
        var url = localStorage.getItem(M.KEYS.AGENT_CUSTOM_URL) || (window.location.origin + '/api/exec');
        var baseUrl = url.replace(/\/api\/exec$/, '');

        // ── Health check: auto-detect if server is running ──
        var serverReady = await checkServerHealth(baseUrl);
        if (!serverReady) {
            // Try to auto-start the server
            var started = await tryAutoStartServer(baseUrl);
            if (!started) {
                throw new Error(
                    'Agent runner is not running.\n\n' +
                    'Start it with:\n  cd agent-runner && node server.js\n\n' +
                    'Then click ▶ Run again.'
                );
            }
        }

        console.log('%c[AgentCloud] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3fb950; font-weight: bold');
        console.log('%c[AgentCloud] 📨 Sending request to agent runner', 'color: #3fb950');
        console.log('[AgentCloud]    URL:', url);
        console.log('[AgentCloud]    Agent:', opts.agentType || '(none)');
        console.log('[AgentCloud]    Command:', command.substring(0, 200));
        console.log('[AgentCloud]    Context:', opts.prevOutput ? opts.prevOutput.length + ' chars' : '(none)');

        var startTime = performance.now();

        var res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                command: command,
                agentType: opts.agentType || '',
                context: opts.prevOutput || ''
            })
        });

        var elapsed = Math.round(performance.now() - startTime);

        if (!res.ok) {
            var errBody = '';
            try { errBody = await res.text(); } catch (_) {}
            console.error('[AgentCloud] ❌ Error ' + res.status + ' after ' + elapsed + 'ms:', errBody.substring(0, 200));
            console.log('%c[AgentCloud] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #f85149; font-weight: bold');
            throw new Error('Agent exec error (' + res.status + '): ' + errBody.substring(0, 200));
        }

        var result = await res.json();
        console.log('%c[AgentCloud] ✅ Response received in ' + elapsed + 'ms', 'color: #3fb950');
        console.log('[AgentCloud]    Exit code:', result.exitCode);
        console.log('[AgentCloud]    Stdout:', (result.stdout || '').substring(0, 300) || '(empty)');
        if (result.stderr) console.warn('[AgentCloud]    Stderr:', result.stderr.substring(0, 300));
        console.log('%c[AgentCloud] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3fb950; font-weight: bold');

        return result;
    }

    /** Quick health check — returns true if server responds */
    async function checkServerHealth(baseUrl) {
        try {
            var res = await fetch(baseUrl + '/health', {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            return res.ok;
        } catch (_) {
            return false;
        }
    }

    /** Try to auto-start the agent-runner server */
    async function tryAutoStartServer(baseUrl) {
        console.log('[AgentCloud] 🚀 Agent runner not detected — attempting auto-start...');

        if (M.showToast) {
            M.showToast('🚀 Starting agent runner...', 'info');
        }

        // Try spawning via the native Neutralino API (desktop app)
        if (window.Neutralino && Neutralino.os && Neutralino.os.execCommand) {
            try {
                Neutralino.os.execCommand('cd agent-runner && node server.js &', { background: true });
                // Wait for server to come up
                return await waitForServer(baseUrl, 15000);
            } catch (e) {
                console.warn('[AgentCloud] Neutralino exec failed:', e);
            }
        }

        // If running in a Codespace / Gitpod / devcontainer, try fetch to terminal API
        // This is a fallback for environments that support it

        // Show helpful error with command
        if (M.showToast) {
            M.showToast(
                '⚠️ Agent runner not running — run: cd agent-runner && node server.js',
                'warning',
                8000
            );
        }

        // Give a brief moment in case it was just starting up
        return await waitForServer(baseUrl, 5000);
    }

    /** Poll for server readiness */
    async function waitForServer(baseUrl, maxWaitMs) {
        var start = Date.now();
        while (Date.now() - start < maxWaitMs) {
            var ready = await checkServerHealth(baseUrl);
            if (ready) {
                console.log('[AgentCloud] ✅ Agent runner is ready');
                if (M.showToast) M.showToast('✅ Agent runner connected', 'info');
                return true;
            }
            await new Promise(function (r) { setTimeout(r, 1000); });
        }
        return false;
    }

})(window.MDView = window.MDView || {});
