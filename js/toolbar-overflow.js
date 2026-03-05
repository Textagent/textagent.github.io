/* Toolbar overflow (kebab ⋮) toggle logic */
(function () {
    'use strict';

    const btn = document.getElementById('toolbar-overflow-btn');
    const group = btn ? btn.previousElementSibling : null;
    if (!btn || !group || !group.classList.contains('toolbar-overflow-group')) return;

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        group.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
        if (!group.classList.contains('open')) return;
        if (!group.contains(e.target) && e.target !== btn) {
            group.classList.remove('open');
        }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && group.classList.contains('open')) {
            group.classList.remove('open');
            btn.focus();
        }
    });
})();
