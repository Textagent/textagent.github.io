// ============================================
// coding-blocks.js — Coding Tag Insertion Buttons
// + Overflow dropdown toggle for tag groups
// ============================================
(function (M) {
    'use strict';

    // --- Coding block templates ---
    var CODING_TEMPLATES = {
        'coding-bash': '```bash\n# Your bash commands\necho "Hello, World!"\n```\n',
        'coding-math': '```math\nx = 5\nx^2 + 2*x + 1\n```\n',
        'coding-python': '```python\n# Your Python code\nprint("Hello, World!")\n```\n',
        'coding-html': '```html\n<!-- Your HTML -->\n<h3>Hello, World!</h3>\n<p>Edit this HTML and click <strong>Preview</strong> to see it rendered.</p>\n```\n',
        'coding-js': '```javascript\n// Your JavaScript\nconsole.log("Hello, World!");\n```\n',
        'coding-sql': '```sql\nCREATE TABLE IF NOT EXISTS greetings (id INTEGER PRIMARY KEY, message TEXT);\nINSERT INTO greetings VALUES (1, \'Hello, World!\');\nSELECT * FROM greetings;\n```\n',
        'coding-latex': '$$\n\\frac{\\sqrt{2025} + \\sqrt{3025}}{\\sqrt{25}}\n$$\n'
    };

    Object.keys(CODING_TEMPLATES).forEach(function (action) {
        M.registerFormattingAction(action, function () {
            M.insertAtCursor('\n' + CODING_TEMPLATES[action]);
        });
    });

    // --- Media block templates ---
    var MEDIA_TEMPLATES = {
        'media-video': '![My Video](https://www.w3schools.com/html/mov_bbb.mp4)\n',
        'media-youtube': '![YouTube Video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)\n',
        'media-embed-grid': '```embed cols=2 height=350\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ "YouTube Video"\nhttps://www.w3schools.com/html/mov_bbb.mp4 "Sample Video"\nhttps://wikipedia.org "Wikipedia"\nhttps://github.com "GitHub"\n```\n'
    };

    Object.keys(MEDIA_TEMPLATES).forEach(function (action) {
        M.registerFormattingAction(action, function () {
            M.insertAtCursor('\n' + MEDIA_TEMPLATES[action]);
        });
    });

    // --- Helper: check if we're in mobile layout ---
    function isMobileToolbar() {
        return window.innerWidth <= 767;
    }

    // --- Helper: position dropdown using fixed coords on mobile ---
    function positionDropdownFixed(overflow) {
        var dropdown = overflow.querySelector('.fmt-group-dropdown');
        if (!dropdown) return;
        if (!isMobileToolbar()) {
            // Desktop: clear any inline fixed styles, rely on CSS absolute positioning
            dropdown.style.position = '';
            dropdown.style.top = '';
            dropdown.style.left = '';
            dropdown.style.right = '';
            dropdown.style.transform = '';
            dropdown.style.display = '';
            return;
        }
        
        // Mobile: move to body to escape all clipping containers and transforms
        document.body.appendChild(dropdown);
        
        var group = overflow.parentElement;
        var groupRect = group ? group.getBoundingClientRect() : overflow.getBoundingClientRect();
        
        dropdown.style.position = 'fixed';
        dropdown.style.animation = 'none'; // prevent CSS transform animations from breaking fixed positioning
        dropdown.style.display = 'flex'; // override none since it's outside .open parent
        dropdown.style.top = (groupRect.bottom + 4) + 'px';
        dropdown.style.transform = 'none';
        
        // Center horizontally on the group, but clamp to viewport
        var dropW = dropdown.offsetWidth || 140;
        var centerX = groupRect.left + groupRect.width / 2 - dropW / 2;
        var maxX = window.innerWidth - dropW - 8;
        
        dropdown.style.left = Math.max(8, Math.min(centerX, maxX)) + 'px';
        dropdown.style.right = 'auto';
        
        // Store reference to parent so we can restore it on close
        dropdown.dataset.parentOverflowId = overflow.id || (overflow.id = 'fmt-overflow-' + Math.random().toString(36).substr(2, 9));
    }

    // --- Helper: clear fixed positioning on close ---
    function clearDropdownFixed(overflow) {
        // Find dropdown either inside overflow OR in body if it was moved
        var overflowId = overflow.id;
        var dropdown = overflow.querySelector('.fmt-group-dropdown');
        if (!dropdown && overflowId) {
            dropdown = document.querySelector('.fmt-group-dropdown[data-parent-overflow-id="' + overflowId + '"]');
            if (dropdown) {
                // Move it back to original parent
                overflow.appendChild(dropdown);
            }
        }
        if (!dropdown) return;
        
        dropdown.style.position = '';
        dropdown.style.top = '';
        dropdown.style.left = '';
        dropdown.style.right = '';
        dropdown.style.transform = '';
        dropdown.style.animation = '';
        dropdown.style.display = '';
        delete dropdown.dataset.parentOverflowId;
    }

    // --- Safe Close Helper ---
    // Closes dropdowns and returns them to toolbar
    function closeAllDropdowns() {
        var openDropdowns = document.querySelectorAll('.fmt-group-overflow.open');
        openDropdowns.forEach(function (el) {
            el.classList.remove('open');
            clearDropdownFixed(el);
        });
    }

    // --- Overflow "…" toggle for AI Tags / Coding groups ---
    var lastTouchTime = 0;
    document.querySelectorAll('.fmt-group-more-btn').forEach(function (btn) {
        // Use touchend + click for reliable mobile handling
        function handleToggle(e) {
            e.preventDefault();
            e.stopPropagation();
            var overflow = btn.closest('.fmt-group-overflow');
            var wasOpen = overflow.classList.contains('open');

            // Close all other open dropdowns first safely
            closeAllDropdowns();

            if (!wasOpen) {
                overflow.classList.add('open');
                positionDropdownFixed(overflow);
            }
        }
        btn.addEventListener('touchend', function (e) {
            e.preventDefault();
            e.stopPropagation();
            lastTouchTime = Date.now();
            handleToggle(e);
        });
        btn.addEventListener('click', function (e) {
            // Skip if touchend just handled this (prevents double-toggle on mobile)
            if (Date.now() - lastTouchTime < 400) return;
            handleToggle(e);
        });
    });

    // Close dropdown on outside click / touch
    function handleOutsideClose(e) {
        if (!e.target.closest('.fmt-group-overflow') && !e.target.closest('.fmt-group-dropdown')) {
            closeAllDropdowns();
        }
    }
    document.addEventListener('click', handleOutsideClose);
    document.addEventListener('touchend', handleOutsideClose);

    // Close dropdown after any dropdown button is clicked/tapped.
    document.querySelectorAll('.fmt-group-dropdown .fmt-btn[data-action]').forEach(function (btn) {
        function handleClose() {
            closeAllDropdowns();
        }
        btn.addEventListener('click', handleClose);
        btn.addEventListener('touchend', function (e) {
            e.stopPropagation();
            handleClose();
        });
    });

})(window.MDView);
