// ============================================
// feature-demos.js — Demo Video Badges & Modal
// Adds ▶ Demo badges to Feature Showcase headings
// and opens a fullscreen modal with the demo video.
// ============================================
(function (M) {
    'use strict';

    // ── Demo mapping: heading keyword → video file ──
    // Matching is case-insensitive and checks if the heading text includes the keyword.
    const DEMO_MAP = [
        { keywords: ['security', 'privacy'], video: 'assets/demos/01_privacy_hero.webp', title: 'Privacy-First — No Sign-Up, 100% Client-Side' },
        { keywords: ['ai assistant'], video: 'assets/demos/02_ai_assistant.webp', title: 'AI Writing Assistant — Local & Cloud Models' },
        { keywords: ['task lists', 'checklists'], video: 'assets/demos/03_templates_gallery.webp', title: 'Templates Gallery — ' + window.MDView.PRODUCT.TEMPLATE_COUNT + '+ Templates, ' + window.MDView.PRODUCT.CATEGORY_COUNT + ' Categories' },
        {
            keywords: ['executable languages', 'executable bash', 'python sandbox', 'javascript sandbox', 'sql sandbox', 'html sandbox'],
            video: 'assets/demos/04_code_execution.webp', title: 'Code Execution — Run Python, JS & SQL In-Browser'
        },
        { keywords: ['presentation mode'], video: 'assets/demos/05_presentation_mode.webp', title: 'Presentation Mode — Markdown to Slides' },
        { keywords: ['table spreadsheet', 'table tools'], video: 'assets/demos/06_table_tools.webp', title: 'Table Spreadsheet Tools — Sort, Stats & Charts' },
        { keywords: ['editor customization', 'writing modes'], video: 'assets/demos/07_writing_modes.webp', title: 'Writing Modes & Themes — Zen, Dark & 6 Themes' },
        { keywords: ['file import', 'smart file'], video: 'assets/demos/08_import_export.webp', title: 'Import & Export — 8 Formats In, PDF/HTML Out' },
        { keywords: ['cloud save', 'encrypted sharing'], video: 'assets/demos/09_encrypted_sharing.webp', title: 'Encrypted Sharing — Zero-Knowledge Security' },
    ];

    // ── Modal element (lazily created) ──
    let modalOverlay = null;

    function ensureModal() {
        if (modalOverlay) return;
        modalOverlay = document.createElement('div');
        modalOverlay.className = 'demo-modal-overlay';
        modalOverlay.innerHTML = `
            <div class="demo-modal-content">
                <button class="demo-modal-close" title="Close (Esc)"><i class="bi bi-x-lg"></i></button>
                <div class="demo-modal-title"></div>
                <img class="demo-modal-video" alt="Feature Demo" />
            </div>
        `;
        document.body.appendChild(modalOverlay);

        // Close handlers
        modalOverlay.querySelector('.demo-modal-close').addEventListener('click', closeDemoModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeDemoModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeDemoModal();
            }
        });
    }

    function openDemoModal(videoSrc, title) {
        ensureModal();
        const img = modalOverlay.querySelector('.demo-modal-video');
        const titleEl = modalOverlay.querySelector('.demo-modal-title');
        img.src = videoSrc;
        titleEl.textContent = title;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDemoModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        // Stop loading the image after close
        const img = modalOverlay.querySelector('.demo-modal-video');
        img.src = '';
    }

    // ── Find which demo matches a heading ──
    function findDemo(headingText) {
        const lower = headingText.toLowerCase();
        for (const entry of DEMO_MAP) {
            for (const kw of entry.keywords) {
                if (lower.includes(kw)) return entry;
            }
        }
        return null;
    }

    // ── Attach badges to headings ──
    M.attachDemoBadges = function (previewEl) {
        if (!previewEl) return;
        const headings = previewEl.querySelectorAll('h2');
        headings.forEach((h2) => {
            // Avoid duplicating badges on re-render
            if (h2.querySelector('.demo-badge')) return;

            const demo = findDemo(h2.textContent);
            if (!demo) return;

            const badge = document.createElement('span');
            badge.className = 'demo-badge';
            badge.setAttribute('title', 'Watch demo video');
            badge.setAttribute('data-demo-video', demo.video);
            badge.setAttribute('data-demo-title', demo.title);
            badge.innerHTML = '<i class="bi bi-play-circle"></i> Demo';
            badge.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openDemoModal(demo.video, demo.title);
            });
            h2.appendChild(badge);
        });
    };

    // ── Right-click + D shortcut ──
    // Listen for contextmenu on preview headings that have a demo badge,
    // then listen for 'D' keypress to open the demo.
    let contextTarget = null;

    document.addEventListener('contextmenu', (e) => {
        const h2 = e.target.closest('h2');
        if (!h2) { contextTarget = null; return; }
        const badge = h2.querySelector('.demo-badge');
        if (badge) {
            contextTarget = badge;
        } else {
            contextTarget = null;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'd' || e.key === 'D') {
            if (contextTarget) {
                e.preventDefault();
                const video = contextTarget.getAttribute('data-demo-video');
                const title = contextTarget.getAttribute('data-demo-title');
                if (video) openDemoModal(video, title);
                contextTarget = null;
            }
        }
    });

})(window.MDView);
