// ============================================
// link-analytics.js — Global link & document analytics via Firestore
//
// Tracks across ALL users/sessions:
//   • Link clicks  → link_clicks/{urlFingerprint}  { url, clicks, lastClicked }
//   • Doc views    → link_clicks/views_{docId}     { views: increment }
//   • Likes        → link_clicks/likes_{docId}     { likes: increment } — realtime
//   • Live readers → link_clicks/presence_{docId}/readers/{sessionId} { lastSeen }
//
// No localStorage as source-of-truth. Firestore is the single source.
// localStorage is only used as a fast-render display cache (stale-while-revalidate).
// ============================================
(function (M) {
    'use strict';

    // ----------------------------------------
    // Session identity (ephemeral, memory-only)
    // ----------------------------------------
    var SESSION_ID = (function () {
        var arr = crypto.getRandomValues(new Uint8Array(8));
        return Array.from(arr, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    })();

    // ----------------------------------------
    // Constants
    // ----------------------------------------
    var COLLECTION_CLICKS  = 'link_clicks';
    var PRESENCE_TTL_MS    = 60000;   // readers inactive >60s are "gone"
    var HEARTBEAT_MS       = 20000;   // send heartbeat every 20s
    var LS_CACHE_KEY       = 'textagent-la-cache'; // display cache only

    // ----------------------------------------
    // Helpers
    // ----------------------------------------
    function getDb() { return M.db || null; }

    // SHA-256 → 24-hex fingerprint of a URL (used as Firestore doc ID)
    async function urlFingerprint(href) {
        var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(href));
        return Array.from(new Uint8Array(buf)).slice(0, 12)
            .map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    // Local display cache helpers (stale-while-revalidate for badges)
    function cacheLoad() {
        try { return JSON.parse(localStorage.getItem(LS_CACHE_KEY) || '{}'); } catch (e) { return {}; }
    }
    function cacheSave(obj) {
        try { localStorage.setItem(LS_CACHE_KEY, JSON.stringify(obj)); } catch (e) {}
    }

    // ----------------------------------------
    // CLICK TRACKING — increment in Firestore
    // ----------------------------------------
    async function recordClick(href) {
        var db = getDb();
        if (!db) return;
        try {
            var docId = await urlFingerprint(href);
            await db.collection(COLLECTION_CLICKS).doc(docId).set({
                url: href,
                clicks: firebase.firestore.FieldValue.increment(1),
                lastClicked: Date.now(),
            }, { merge: true });
        } catch (e) {
            console.warn('[LinkAnalytics] click write failed:', e);
        }
    }

    // ----------------------------------------
    // DOCUMENT VIEW TRACKING — once per session
    // ----------------------------------------
    var _viewRecorded = false;
    function recordDocView(shareDocId) {
        if (_viewRecorded || !shareDocId) return;
        _viewRecorded = true;
        var db = getDb();
        if (!db) return;
        // Store in link_clicks/views_{docId} to avoid touching protected shares rules
        db.collection(COLLECTION_CLICKS).doc('views_' + shareDocId).set({
            docId: shareDocId,
            views: firebase.firestore.FieldValue.increment(1),
            lastViewed: Date.now(),
        }, { merge: true }).catch(function (e) {
            console.warn('[LinkAnalytics] view write failed:', e);
        });
    }

    // ----------------------------------------
    // LIVE PRESENCE — heartbeat pattern
    // ----------------------------------------
    var _presenceRef    = null;
    var _heartbeatTimer = null;
    var _presenceUnsub  = null;
    var _liveCount      = 0;

    function startPresence(shareDocId) {
        if (!shareDocId || !getDb()) return;
        stopPresence(); // clean up any old session

        var presenceId = 'presence_' + shareDocId;
        _presenceRef = getDb().collection(COLLECTION_CLICKS).doc(presenceId)
            .collection('readers').doc(SESSION_ID);

        function heartbeat() {
            if (_presenceRef) {
                _presenceRef.set({ lastSeen: Date.now() }, { merge: true })
                    .catch(function () {});
            }
        }

        heartbeat(); // immediate write
        _heartbeatTimer = setInterval(heartbeat, HEARTBEAT_MS);

        // Remove presence on page unload
        window.addEventListener('beforeunload', stopPresence);

        // Real-time listener for reader count
        var readersRef = getDb().collection(COLLECTION_CLICKS).doc(presenceId).collection('readers');
        _presenceUnsub = readersRef.onSnapshot(function (snap) {
            var now = Date.now();
            var active = 0;
            snap.forEach(function (doc) {
                var d = doc.data();
                if (d.lastSeen && (now - d.lastSeen) < PRESENCE_TTL_MS) active++;
            });
            _liveCount = active;
            updateLiveCounterUI(active);
        }, function (e) {
            console.warn('[LinkAnalytics] presence listener error:', e);
        });
    }

    function stopPresence() {
        if (_heartbeatTimer) { clearInterval(_heartbeatTimer); _heartbeatTimer = null; }
        if (_presenceRef) {
            _presenceRef.delete().catch(function () {});
            _presenceRef = null;
        }
        if (_presenceUnsub) { _presenceUnsub(); _presenceUnsub = null; }
    }

    function updateLiveCounterUI(count) {
        var el = document.getElementById('la-live-count');
        if (!el) return;
        el.textContent = count;
        var parent = el.closest('.la-live-pill');
        if (parent) {
            parent.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // ----------------------------------------
    // LIKE BUTTON — floating widget in preview
    // ----------------------------------------
    var _hasLiked   = false; // session-only dedup (memory)
    var _likeUnsub  = null;
    var _likeDocKey = null;

    function getLikeDocKey() {
        // Uses shared doc ID if on a shared doc, otherwise a hash of the page origin
        var docId = getSharedDocId();
        return docId ? 'likes_' + docId : 'likes_local';
    }

    async function recordLike() {
        if (_hasLiked) return;
        _hasLiked = true;
        var db = getDb();
        if (!db) return;
        var key = getLikeDocKey();
        try {
            await db.collection(COLLECTION_CLICKS).doc(key).set({
                likes: firebase.firestore.FieldValue.increment(1),
                lastLiked: Date.now(),
            }, { merge: true });
        } catch (e) {
            _hasLiked = false; // allow retry on error
            console.warn('[LinkAnalytics] like write failed:', e);
        }
    }

    function startLikeListener(key) {
        if (_likeUnsub) { _likeUnsub(); _likeUnsub = null; }
        var db = getDb();
        if (!db || !key) return;
        _likeDocKey = key;
        _likeUnsub = db.collection(COLLECTION_CLICKS).doc(key)
            .onSnapshot(function (snap) {
                var count = snap.exists ? (snap.data().likes || 0) : 0;
                updateLikeUI(count);
            }, function (e) {
                console.warn('[LinkAnalytics] like listener error:', e);
            });
    }

    function updateLikeUI(count) {
        var countEl = document.getElementById('la-like-count');
        var btn     = document.getElementById('la-like-btn');
        if (countEl) countEl.textContent = count > 0 ? count : '';
        if (btn && _hasLiked) btn.classList.add('la-liked');
        // Also update analytics panel if open
        var panelCount = document.getElementById('la-panel-likes');
        if (panelCount) panelCount.textContent = count;
    }

    function injectLikeButton() {
        if (document.getElementById('la-like-widget')) return;
        var preview = M.markdownPreview;
        if (!preview) return;

        var widget = document.createElement('div');
        widget.id  = 'la-like-widget';
        widget.className = 'la-like-widget';
        widget.innerHTML =
            '<button id="la-like-btn" class="la-like-btn" title="Like this document">' +
            '  <span class="la-like-icon">👍</span>' +
            '  <span id="la-like-count" class="la-like-count"></span>' +
            '</button>';

        // Place widget relative to the preview pane container
        var pane = preview.closest('.preview-pane') || preview.parentElement;
        if (pane) {
            pane.style.position = 'relative';
            pane.appendChild(widget);
        }

        document.getElementById('la-like-btn').addEventListener('click', function () {
            if (_hasLiked) return;
            recordLike();
            // Bump animation, then fade out the whole widget
            this.classList.add('la-liked', 'la-like-bump');
            var widget = document.getElementById('la-like-widget');
            setTimeout(function () {
                if (widget) widget.classList.add('la-like-done');
                setTimeout(function () {
                    if (widget) widget.style.display = 'none';
                }, 400);
            }, 400);
        });

        // Start realtime listener for like count
        var key = getLikeDocKey();
        startLikeListener(key);
    }

    // ----------------------------------------
    // PANEL — fetch all links from Firestore
    // ----------------------------------------
    async function fetchClickData() {
        var db = getDb();
        if (!db) return [];
        try {
            var snap = await db.collection(COLLECTION_CLICKS)
                .where('url', '>', '') // only docs that have a url field (skip presence & views docs)
                .orderBy('url')
                .get();
            var results = [];
            snap.forEach(function (doc) {
                var d = doc.data();
                if (d.url && d.clicks) results.push(d);
            });
            results.sort(function (a, b) { return (b.clicks || 0) - (a.clicks || 0); });

            // Update display cache
            var cache = {};
            results.forEach(function (r) { cache[r.url] = r.clicks; });
            cacheSave(cache);
            return results;
        } catch (e) {
            console.warn('[LinkAnalytics] fetch failed:', e);
            // Fall back to display cache
            return Object.entries(cacheLoad())
                .map(function (kv) { return { url: kv[0], clicks: kv[1] }; })
                .sort(function (a, b) { return b.clicks - a.clicks; });
        }
    }

    // Fetch view count for a specific shared doc
    async function fetchDocViews(shareDocId) {
        var db = getDb();
        if (!db || !shareDocId) return null;
        try {
            var snap = await db.collection(COLLECTION_CLICKS).doc('views_' + shareDocId).get();
            return snap.exists ? (snap.data().views || 0) : 0;
        } catch (e) { return null; }
    }

    // ----------------------------------------
    // BADGE INJECTION on preview links
    // ----------------------------------------
    M.addLinkClickBadges = function (container) {
        if (!container) return;
        var cache = cacheLoad();

        container.querySelectorAll('a[href]').forEach(function (link) {
            if (link.classList.contains('heading-anchor')) return;
            if (link.classList.contains('footnote-ref')) return;
            if (link.classList.contains('footnote-backref')) return;
            if (link.dataset.laTracked) return;
            link.dataset.laTracked = '1';

            var href = link.getAttribute('href');
            if (!href || href.startsWith('#')) return;

            // Badge — seeded from cache, updated after Firestore read
            var badge = document.createElement('span');
            badge.className = 'la-badge';
            var cached = cache[href] || 0;
            if (cached > 0) { badge.textContent = cached; badge.title = cached + ' global clicks'; }
            link.dataset.laBadgeHref = href;
            link.insertAdjacentElement('afterend', badge);

            // Click handler
            link.addEventListener('click', function () {
                var cur = parseInt(badge.textContent) || 0;
                var next = cur + 1;
                badge.textContent = next;
                badge.title = next + ' global clicks';
                badge.classList.add('la-badge-bump');
                setTimeout(function () { badge.classList.remove('la-badge-bump'); }, 350);
                recordClick(href);
            });
        });

        // Background refresh badges from Firestore
        fetchClickData().then(function (entries) {
            entries.forEach(function (entry) {
                container.querySelectorAll('a[data-la-badge-href="' + CSS.escape(entry.url) + '"]').forEach(function (link) {
                    var badge = link.nextElementSibling;
                    if (badge && badge.classList.contains('la-badge')) {
                        badge.textContent = entry.clicks > 0 ? entry.clicks : '';
                        badge.title = entry.clicks + ' global clicks';
                    }
                });
            });
        });
    };

    // ----------------------------------------
    // PANEL HTML
    // ----------------------------------------
    function buildPanelHTML() {
        return [
            '<div id="la-panel" class="la-panel" role="dialog" aria-label="Link Analytics" style="display:none">',
            '  <div class="la-panel-header">',
            '    <div class="la-panel-title">',
            '      <i class="bi bi-bar-chart-line-fill"></i> Link Analytics',
            '      <span class="la-live-pill" id="la-live-pill" style="display:none">',
            '        <span class="la-live-dot"></span>',
            '        <span id="la-live-count">0</span> reading now',
            '      </span>',
            '    </div>',
            '    <div class="la-panel-actions">',
            '      <button id="la-refresh-btn" class="la-action-btn" title="Refresh from Firestore"><i class="bi bi-arrow-clockwise"></i></button>',
            '      <button id="la-close-btn" class="la-action-btn" title="Close"><i class="bi bi-x-lg"></i></button>',
            '    </div>',
            '  </div>',
            '  <div class="la-panel-body">',
            '    <div id="la-list-container"><div class="la-loading"><i class="bi bi-arrow-clockwise la-spin"></i> Fetching from Firestore…</div></div>',
            '  </div>',
            '</div>',
            '<div id="la-panel-overlay" class="la-panel-overlay" style="display:none"></div>',
        ].join('\n');
    }

    async function renderList() {
        var container = document.getElementById('la-list-container');
        if (!container) return;
        container.innerHTML = '<div class="la-loading"><i class="bi bi-arrow-clockwise la-spin"></i> Fetching from Firestore…</div>';

        // Fetch link clicks + doc views in parallel
        var sharedDocId = getSharedDocId();
        var [entries, docViews] = await Promise.all([
            fetchClickData(),
            sharedDocId ? fetchDocViews(sharedDocId) : Promise.resolve(null),
        ]);

        var docSummaryHtml = '';
        if (sharedDocId) {
            var liveStr = _liveCount > 0
                ? '<span class="la-doc-stat la-doc-live"><span class="la-live-dot la-dot-sm"></span>' + _liveCount + ' reading now</span>'
                : '';
            var viewStr = docViews !== null
                ? '<span class="la-doc-stat"><i class="bi bi-eye"></i> ' + docViews + ' total open' + (docViews !== 1 ? 's' : '') + '</span>'
                : '';
            if (liveStr || viewStr) {
                docSummaryHtml = '<div class="la-doc-summary">' + viewStr + liveStr + '</div>';
            }
        }

        if (!entries.length) {
            container.innerHTML =
                docSummaryHtml +
                '<div class="la-empty">' +
                '  <i class="bi bi-cursor-fill la-empty-icon"></i>' +
                '  <p>No link clicks recorded yet.</p>' +
                '  <p class="la-empty-hint">Click any link in the preview. Counts are shared across <strong>all users</strong> </p>' +
                '</div>';
            return;
        }

        var maxClicks = entries[0].clicks;
        var totalClicks = entries.reduce(function (s, e) { return s + (e.clicks || 0); }, 0);

        var html = docSummaryHtml + '<div class="la-stats-meta">' +
            '<i class="bi bi-globe2"></i> ' + entries.length + ' link' + (entries.length !== 1 ? 's' : '') +
            ' &nbsp;·&nbsp; <strong>' + totalClicks + '</strong> total clicks across all users' +
            '</div><ol class="la-list">';

        entries.forEach(function (entry, idx) {
            var href = entry.url || '';
            var count = entry.clicks || 0;
            var pct = maxClicks > 0 ? Math.round((count / maxClicks) * 100) : 0;
            var display = href.length > 60 ? href.substring(0, 57) + '…' : href;
            var rankCls = idx === 0 ? 'la-rank-1' : idx === 1 ? 'la-rank-2' : idx === 2 ? 'la-rank-3' : '';
            var timeHtml = entry.lastClicked
                ? '<span class="la-item-time">Last clicked ' + new Date(entry.lastClicked).toLocaleDateString() + '</span>'
                : '';

            html += '<li class="la-item ' + rankCls + '">' +
                '<div class="la-item-top">' +
                '  <span class="la-item-rank">' + (idx + 1) + '</span>' +
                '  <a class="la-item-href" href="' + href + '" target="_blank" rel="noopener noreferrer" title="' + href + '">' + display + '</a>' +
                '  <span class="la-item-count">' + count + '<span class="la-item-label"> click' + (count !== 1 ? 's' : '') + '</span></span>' +
                '</div>' +
                '<div class="la-bar-track"><div class="la-bar-fill" style="width:' + pct + '%"></div></div>' +
                (timeHtml ? '<div class="la-item-meta">' + timeHtml + '</div>' : '') +
                '</li>';
        });

        container.innerHTML = html + '</ol>';

        // Update live counter display
        updateLiveCounterUI(_liveCount);
    }

    // ----------------------------------------
    // Open / Close
    // ----------------------------------------
    function openPanel() {
        var panel   = document.getElementById('la-panel');
        var overlay = document.getElementById('la-panel-overlay');
        if (!panel) return;
        panel.style.display = 'flex';
        overlay.style.display = 'block';
        requestAnimationFrame(function () { panel.classList.add('la-panel-open'); });
        renderList();
    }

    function closePanel() {
        var panel   = document.getElementById('la-panel');
        var overlay = document.getElementById('la-panel-overlay');
        if (!panel) return;
        panel.classList.remove('la-panel-open');
        setTimeout(function () {
            panel.style.display = 'none';
            overlay.style.display = 'none';
        }, 280);
    }

    // ----------------------------------------
    // Toolbar button injection
    // ----------------------------------------
    function injectToolbarButton() {
        var statsPill = document.querySelector('.stats-pill-wrapper');
        if (!statsPill || document.getElementById('la-toolbar-btn')) return;

        var btn = document.createElement('button');
        btn.id = 'la-toolbar-btn';
        btn.className = 'tool-button la-toolbar-btn d-none d-xl-flex';
        btn.title = 'Link Analytics — global clicks, views & live readers (Firestore)';
        btn.innerHTML = '<i class="bi bi-bar-chart-line-fill"></i>';
        statsPill.insertAdjacentElement('afterend', btn);
        btn.addEventListener('click', openPanel);
    }

    // ----------------------------------------
    // Detect active shared doc from URL hash
    // ----------------------------------------
    function getSharedDocId() {
        var hash = window.location.hash.substring(1);
        if (!hash) return null;
        var params = new URLSearchParams(hash);
        return params.get('s') || params.get('id') || null;
    }

    // ----------------------------------------
    // Init
    // ----------------------------------------
    function init() {
        // Inject panel + overlay into DOM
        var tmp = document.createElement('div');
        tmp.innerHTML = buildPanelHTML();
        while (tmp.firstChild) document.body.appendChild(tmp.firstChild);

        var closeBtn   = document.getElementById('la-close-btn');
        var refreshBtn = document.getElementById('la-refresh-btn');
        var overlay    = document.getElementById('la-panel-overlay');

        if (closeBtn)   closeBtn.addEventListener('click', closePanel);
        if (overlay)    overlay.addEventListener('click', closePanel);
        if (refreshBtn) refreshBtn.addEventListener('click', function () {
            renderList();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                var p = document.getElementById('la-panel');
                if (p && p.style.display !== 'none') closePanel();
            }
        });

        // Start presence + like tracking if on a shared doc
        var sharedDocId = getSharedDocId();
        if (sharedDocId) {
            recordDocView(sharedDocId);
            startPresence(sharedDocId);
        }

        // Hook into renderMarkdown post-processing
        var _origRender = M.renderMarkdown;
        M.renderMarkdown = async function () {
            await _origRender.call(M);
            if (M.markdownPreview) {
                M.addLinkClickBadges(M.markdownPreview);
                injectLikeButton();
            }
        };

        // Also hook into loadSharedMarkdown to catch doc ID from URL after navigation
        var _origLoad = M.loadSharedMarkdown;
        if (_origLoad) {
            M.loadSharedMarkdown = async function () {
                await _origLoad.call(M);
                var docId = getSharedDocId();
                if (docId) {
                    recordDocView(docId);
                    startPresence(docId);
                    // Restart like listener for new doc
                    startLikeListener(getLikeDocKey());
                }
            };
        }

        if (M.markdownPreview) {
            M.addLinkClickBadges(M.markdownPreview);
            injectLikeButton();
        }
        injectToolbarButton();
    }

    // Robust init: poll until M.markdownPreview is available (it may not exist yet when module loads)
    function waitForPreview(attempt) {
        attempt = attempt || 0;
        if (M.markdownPreview && M.renderMarkdown && M.db) {
            init();
        } else if (attempt < 100) { // up to 10s
            setTimeout(function () { waitForPreview(attempt + 1); }, 100);
        } else {
            console.warn('[LinkAnalytics] Timed out waiting for M.markdownPreview');
        }
    }

    waitForPreview();

    // Public API
    M.linkAnalytics = {
        open:  openPanel,
        close: closePanel,
        refresh: renderList,
        getLiveCount: function () { return _liveCount; },
        like: recordLike,
    };

})(window.MDView);
