// ============================================
// toast.js — Centralized Toast Notification System
// ============================================
(function (M) {
    'use strict';

    var toastEl = null;
    var toastTimeout = null;
    var ICON_MAP = {
        error: 'bi bi-exclamation-triangle-fill',
        warning: 'bi bi-exclamation-circle-fill',
        success: 'bi bi-check-circle-fill',
        info: 'bi bi-info-circle-fill'
    };

    function ensureToastEl() {
        if (toastEl) return toastEl;
        toastEl = document.createElement('div');
        toastEl.className = 'app-toast';
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.style.display = 'none';
        document.body.appendChild(toastEl);
        return toastEl;
    }

    /**
     * Display a toast notification.
     * @param {string} message — text to show
     * @param {'error'|'warning'|'info'|'success'} [type='info']
     */
    M.showToast = function (message, type) {
        type = type || 'info';
        var el = ensureToastEl();

        // Build content with icon
        var iconClass = ICON_MAP[type] || ICON_MAP.info;
        el.innerHTML = '<i class="' + iconClass + ' app-toast-icon"></i><span>' +
            message.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';

        el.className = 'app-toast app-toast-' + type + ' app-toast-show';
        el.style.display = 'flex';

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(function () {
            el.classList.remove('app-toast-show');
            el.classList.add('app-toast-hide');
            // Remove from DOM flow after animation
            setTimeout(function () {
                el.style.display = 'none';
                el.classList.remove('app-toast-hide');
            }, 300);
        }, (type === 'error' || type === 'warning') ? 5000 : 3000);
    };

})(window.MDView);
