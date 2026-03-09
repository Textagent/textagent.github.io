// ============================================
// coding-blocks.js — Coding Tag Insertion Buttons
// + Overflow dropdown toggle for tag groups
// ============================================
(function (M) {
    'use strict';

    // --- Coding block templates ---
    var CODING_TEMPLATES = {
        'coding-bash': '```bash\n# Your bash commands\necho "Hello, World!"\n```\n',
        'coding-math': '```math\nx^2 + 2*x + 1\n```\n',
        'coding-python': '```python\n# Your Python code\nprint("Hello, World!")\n```\n',
        'coding-html': '```html\n<!-- Your HTML -->\n<h3>Hello, World!</h3>\n<p>Edit this HTML and click <strong>Preview</strong> to see it rendered.</p>\n```\n',
        'coding-js': '```javascript\n// Your JavaScript\nconsole.log("Hello, World!");\n```\n',
        'coding-sql': '```sql\nCREATE TABLE greetings (id INTEGER PRIMARY KEY, message TEXT);\nINSERT INTO greetings VALUES (1, \'Hello, World!\');\nSELECT * FROM greetings;\n```\n'
    };

    Object.keys(CODING_TEMPLATES).forEach(function (action) {
        M.registerFormattingAction(action, function () {
            M.insertAtCursor('\n' + CODING_TEMPLATES[action]);
        });
    });

    // --- Overflow "…" toggle for AI Tags / Coding groups ---
    document.querySelectorAll('.fmt-group-more-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var overflow = btn.closest('.fmt-group-overflow');
            var wasOpen = overflow.classList.contains('open');

            // Close all other open dropdowns first
            document.querySelectorAll('.fmt-group-overflow.open').forEach(function (el) {
                el.classList.remove('open');
            });

            if (!wasOpen) overflow.classList.add('open');
        });
    });

    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.fmt-group-overflow')) {
            document.querySelectorAll('.fmt-group-overflow.open').forEach(function (el) {
                el.classList.remove('open');
            });
        }
    });

    // Close dropdown after any dropdown button is clicked.
    // NOTE: The formatting action itself is already fired by editor-features.js
    // which binds ALL .fmt-btn[data-action] elements. We only handle closing here.
    document.querySelectorAll('.fmt-group-dropdown .fmt-btn[data-action]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var overflow = btn.closest('.fmt-group-overflow');
            if (overflow) overflow.classList.remove('open');
        });
    });

})(window.MDView);
