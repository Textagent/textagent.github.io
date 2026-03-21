// ============================================
// agent-panel.js — Agent Container Management Panel
// Shows running Docker agent containers and lets
// users stop them from the UI.
// ============================================
(function (M) {
    'use strict';

    var panel = null;
    var pollTimer = null;
    var isOpen = false;

    /** Initialize the agent panel button and dropdown */
    M.agentPanel = {
        init: function () {
            // Insert button into header toolbar (next to AI button)
            var aiBtn = document.getElementById('ai-toggle-button');
            if (!aiBtn) return;

            var btn = document.createElement('button');
            btn.id = 'agent-panel-btn';
            btn.className = 'tool-button agent-panel-toggle';
            btn.title = 'Agent Containers';
            btn.innerHTML = '<i class="bi bi-box"></i> <span class="agent-panel-badge" id="agent-badge" style="display:none">0</span>';
            aiBtn.parentNode.insertBefore(btn, aiBtn);

            // Create floating panel
            panel = document.createElement('div');
            panel.id = 'agent-panel';
            panel.className = 'agent-panel';
            panel.innerHTML =
                '<div class="agent-panel-header">' +
                '  <span class="agent-panel-title"><i class="bi bi-box me-1"></i>Agent Containers</span>' +
                '  <button class="agent-panel-close" id="agent-panel-close"><i class="bi bi-x-lg"></i></button>' +
                '</div>' +
                '<div class="agent-panel-body" id="agent-panel-body">' +
                '  <div class="agent-panel-loading">Checking...</div>' +
                '</div>' +
                '<div class="agent-panel-footer" id="agent-panel-footer" style="display:none">' +
                '  <button class="agent-panel-stop-all" id="agent-stop-all"><i class="bi bi-stop-circle me-1"></i>Stop All</button>' +
                '</div>';
            document.body.appendChild(panel);

            // Event listeners
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                M.agentPanel.toggle();
            });
            document.getElementById('agent-panel-close').addEventListener('click', function () {
                M.agentPanel.close();
            });
            document.getElementById('agent-stop-all').addEventListener('click', async function () {
                this.disabled = true;
                this.textContent = 'Stopping...';
                try {
                    await M.agentCloud.stopAllLocalAgents();
                    await M.agentPanel.refresh();
                } catch (_) {}
                this.disabled = false;
                this.innerHTML = '<i class="bi bi-stop-circle me-1"></i>Stop All';
            });

            // Close on outside click
            document.addEventListener('click', function (e) {
                if (isOpen && panel && !panel.contains(e.target) && e.target.id !== 'agent-panel-btn' && !e.target.closest('#agent-panel-btn')) {
                    M.agentPanel.close();
                }
            });

            // Poll for badge updates every 15s
            setInterval(function () { M.agentPanel.updateBadge(); }, 15000);
            M.agentPanel.updateBadge();
        },

        toggle: function () {
            if (isOpen) {
                M.agentPanel.close();
            } else {
                M.agentPanel.open();
            }
        },

        open: function () {
            if (!panel) return;
            panel.classList.add('open');
            isOpen = true;
            M.agentPanel.refresh();
            // Auto-refresh while open
            pollTimer = setInterval(function () { M.agentPanel.refresh(); }, 5000);
        },

        close: function () {
            if (!panel) return;
            panel.classList.remove('open');
            isOpen = false;
            if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        },

        refresh: async function () {
            if (!M.agentCloud || !M.agentCloud.getLocalStatus) return;

            var body = document.getElementById('agent-panel-body');
            var footer = document.getElementById('agent-panel-footer');
            if (!body) return;

            try {
                var data = await M.agentCloud.getLocalStatus();
                var agents = data.agents || [];
                M.agentPanel._updateBadgeCount(agents.length);

                if (agents.length === 0) {
                    body.innerHTML =
                        '<div class="agent-panel-empty">' +
                        '  <i class="bi bi-box" style="font-size:1.5rem;opacity:0.3"></i>' +
                        '  <div style="margin-top:6px;opacity:0.5;font-size:0.75rem">No agents running</div>' +
                        '  <div style="margin-top:4px;opacity:0.35;font-size:0.65rem">Use {{Agent:...}} in your markdown</div>' +
                        '</div>';
                    footer.style.display = 'none';
                    return;
                }

                var html = '';
                for (var i = 0; i < agents.length; i++) {
                    var a = agents[i];
                    var uptime = a.uptime || a.startedAt || '—';
                    var statusClass = a.status === 'running' ? 'running' : 'stopped';
                    html +=
                        '<div class="agent-card" data-agent="' + a.agentType + '">' +
                        '  <div class="agent-card-top">' +
                        '    <span class="agent-status-dot ' + statusClass + '"></span>' +
                        '    <span class="agent-name">' + a.agentType + '</span>' +
                        '    <button class="agent-stop-btn" data-agent-type="' + a.agentType + '" title="Stop ' + a.agentType + '"><i class="bi bi-stop-circle"></i></button>' +
                        '  </div>' +
                        '  <div class="agent-card-meta">' +
                        '    <span>' + (a.model || 'unknown') + '</span>' +
                        '    <span>' + uptime + '</span>' +
                        '  </div>' +
                        '</div>';
                }
                body.innerHTML = html;
                footer.style.display = agents.length > 0 ? '' : 'none';

                // Attach stop buttons
                body.querySelectorAll('.agent-stop-btn').forEach(function (btn) {
                    btn.addEventListener('click', async function () {
                        var type = this.getAttribute('data-agent-type');
                        this.disabled = true;
                        this.innerHTML = '<i class="bi bi-arrow-repeat spin"></i>';
                        try {
                            await M.agentCloud.stopLocalAgent(type);
                        } catch (_) {}
                        await M.agentPanel.refresh();
                    });
                });
            } catch (e) {
                body.innerHTML = '<div class="agent-panel-empty"><div style="opacity:0.5;font-size:0.75rem">Agent runner offline</div></div>';
                footer.style.display = 'none';
                M.agentPanel._updateBadgeCount(0);
            }
        },

        updateBadge: async function () {
            if (!M.agentCloud || !M.agentCloud.getLocalStatus) return;
            try {
                var data = await M.agentCloud.getLocalStatus();
                M.agentPanel._updateBadgeCount((data.agents || []).length);
            } catch (_) {
                M.agentPanel._updateBadgeCount(0);
            }
        },

        _updateBadgeCount: function (count) {
            var badge = document.getElementById('agent-badge');
            if (!badge) return;
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = '';
            } else {
                badge.style.display = 'none';
            }
        }
    };

    function formatUptime(startedAt) {
        try {
            var start = new Date(startedAt);
            var now = new Date();
            var diffMs = now - start;
            var mins = Math.floor(diffMs / 60000);
            if (mins < 1) return 'just now';
            if (mins < 60) return mins + 'm ago';
            var hrs = Math.floor(mins / 60);
            return hrs + 'h ' + (mins % 60) + 'm';
        } catch (_) {
            return '—';
        }
    }

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { M.agentPanel.init(); });
    } else {
        setTimeout(function () { M.agentPanel.init(); }, 100);
    }

})(window.MDView = window.MDView || {});
