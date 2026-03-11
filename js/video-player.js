// ============================================
// video-player.js — Video Player Integration
// Lazy-loads Video.js v10 Web Components for
// enhanced playback in markdown preview.
// ============================================
(function (M) {
    'use strict';

    // Video.js v10 loading state
    let vjsLoaded = false;
    let vjsLoading = false;
    let vjsLoadPromise = null;

    // Video file extension detection
    const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|ogv|mov|m4v|avi|mkv)(\?.*)?$/i;

    // YouTube URL patterns
    const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i;

    // Vimeo URL patterns
    const VIMEO_REGEX = /(?:vimeo\.com\/)(\d+)/i;

    /**
     * Check if a URL points to a video file
     */
    M.isVideoUrl = function (url) {
        if (!url) return false;
        return VIDEO_EXTENSIONS.test(url);
    };

    /**
     * Check if a URL is a YouTube video
     */
    M.isYouTubeUrl = function (url) {
        if (!url) return false;
        return YOUTUBE_REGEX.test(url);
    };

    /**
     * Check if a URL is a Vimeo video
     */
    M.isVimeoUrl = function (url) {
        if (!url) return false;
        return VIMEO_REGEX.test(url);
    };

    /**
     * Extract YouTube video ID
     */
    function getYouTubeId(url) {
        const match = url.match(YOUTUBE_REGEX);
        return match ? match[1] : null;
    }

    /**
     * Extract Vimeo video ID
     */
    function getVimeoId(url) {
        const match = url.match(VIMEO_REGEX);
        return match ? match[1] : null;
    }

    /**
     * Get file extension from URL for the format badge
     */
    function getVideoFormat(url) {
        const match = url.match(/\.(\w+)(\?.*)?$/);
        return match ? match[1].toUpperCase() : 'VIDEO';
    }

    /**
     * Escape HTML entities
     */
    function escHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /**
     * Build HTML for a direct video file
     */
    M.buildVideoPlayerHtml = function (src, alt) {
        const escapedSrc = escHtml(src);
        const escapedAlt = escHtml(alt || '');
        const format = getVideoFormat(src);
        const caption = alt || src.split('/').pop().split('?')[0];

        return `<div class="video-player-container" data-video-src="${escapedSrc}">` +
            `<div class="video-player-aspect">` +
                `<div class="video-player-loading"><div class="spinner"></div></div>` +
                `<video controls preload="metadata" playsinline title="${escapedAlt}">` +
                    `<source src="${escapedSrc}" />` +
                    `Your browser does not support the video tag.` +
                `</video>` +
            `</div>` +
            `<div class="video-player-caption">` +
                `<span class="vp-icon">▶</span>` +
                `<span class="vp-label">${escHtml(caption)}</span>` +
                `<span class="vp-format">${format}</span>` +
            `</div>` +
        `</div>`;
    };

    /**
     * Build HTML for a YouTube embed
     */
    M.buildYouTubeEmbedHtml = function (url, alt) {
        const videoId = getYouTubeId(url);
        if (!videoId) return null;
        const caption = alt || 'YouTube Video';

        return `<div class="video-player-container video-embed-container">` +
            `<div class="video-player-aspect">` +
                `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}" ` +
                    `title="${escHtml(caption)}" ` +
                    `frameborder="0" ` +
                    `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
                    `referrerpolicy="strict-origin-when-cross-origin" ` +
                    `allowfullscreen>` +
                `</iframe>` +
            `</div>` +
            `<div class="video-player-caption">` +
                `<span class="vp-icon">▶</span>` +
                `<span class="vp-label">${escHtml(caption)}</span>` +
                `<span class="vp-format">YouTube</span>` +
            `</div>` +
        `</div>`;
    };

    /**
     * Build HTML for a Vimeo embed
     */
    M.buildVimeoEmbedHtml = function (url, alt) {
        const videoId = getVimeoId(url);
        if (!videoId) return null;
        const caption = alt || 'Vimeo Video';

        return `<div class="video-player-container video-embed-container">` +
            `<div class="video-player-aspect">` +
                `<iframe src="https://player.vimeo.com/video/${videoId}?dnt=1" ` +
                    `title="${escHtml(caption)}" ` +
                    `frameborder="0" ` +
                    `allow="autoplay; fullscreen; picture-in-picture" ` +
                    `allowfullscreen>` +
                `</iframe>` +
            `</div>` +
            `<div class="video-player-caption">` +
                `<span class="vp-icon">▶</span>` +
                `<span class="vp-label">${escHtml(caption)}</span>` +
                `<span class="vp-format">Vimeo</span>` +
            `</div>` +
        `</div>`;
    };

    /**
     * Attempt to lazy-load Video.js v10 and upgrade native <video> elements
     * to Video.js Web Components for enhanced playback.
     */
    function loadVideoJs() {
        if (vjsLoaded) return Promise.resolve(true);
        if (vjsLoading) return vjsLoadPromise;

        vjsLoading = true;
        vjsLoadPromise = new Promise(function (resolve) {
            // Load Video.js v10 CSS
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://vjs.zencdn.net/v10/video-js.css';
            document.head.appendChild(link);

            // Load Video.js v10 script
            var script = document.createElement('script');
            script.src = 'https://vjs.zencdn.net/v10/video.min.js';
            script.onload = function () {
                vjsLoaded = true;
                console.log('Video.js v10 loaded successfully');
                resolve(true);
            };
            script.onerror = function () {
                console.warn('Video.js v10 failed to load — using native <video> fallback');
                vjsLoading = false;
                resolve(false);
            };
            document.head.appendChild(script);
        });

        return vjsLoadPromise;
    }

    /**
     * Initialize video players in a container.
     * Marks containers as loaded and attempts Video.js upgrade.
     */
    M.initVideoPlayers = function (container) {
        if (!container) return;

        var videoContainers = container.querySelectorAll('.video-player-container:not(.vp-initialized)');
        if (videoContainers.length === 0) return;

        videoContainers.forEach(function (vc) {
            vc.classList.add('vp-initialized');

            // Mark as loaded once the native video can play
            var video = vc.querySelector('video');
            if (video) {
                var markLoaded = function () {
                    vc.classList.add('vp-loaded');
                };

                video.addEventListener('loadedmetadata', markLoaded);
                video.addEventListener('canplay', markLoaded);
                video.addEventListener('error', markLoaded); // hide spinner on error too

                // If already loaded (cached)
                if (video.readyState >= 1) markLoaded();
            } else {
                // iframe embeds — mark loaded immediately
                vc.classList.add('vp-loaded');
            }
        });

        // Try to upgrade to Video.js v10 (non-blocking)
        var directVideoContainers = container.querySelectorAll('.video-player-container[data-video-src]:not(.vp-upgraded)');
        if (directVideoContainers.length > 0) {
            loadVideoJs().then(function (loaded) {
                if (!loaded) return;
                directVideoContainers.forEach(function (vc) {
                    try {
                        vc.classList.add('vp-upgraded');
                        var video = vc.querySelector('video');
                        if (video && window.videojs) {
                            window.videojs(video, {
                                controls: true,
                                preload: 'metadata',
                                fluid: true,
                                responsive: true
                            });
                        }
                    } catch (e) {
                        console.warn('Video.js upgrade failed for element:', e);
                    }
                });
            });
        }
    };

    // =========================================
    // Embed Grid — ```embed cols=2 height=400
    // =========================================

    /**
     * Extract domain from a URL for display
     */
    function getDomain(url) {
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch (_) {
            return url;
        }
    }

    /**
     * Determine the type badge for an embed item
     */
    function getEmbedTypeBadge(url) {
        if (M.isVideoUrl(url)) return getVideoFormat(url);
        if (M.isYouTubeUrl(url)) return 'YouTube';
        if (M.isVimeoUrl(url)) return 'Vimeo';
        return 'WEB';
    }

    /**
     * Build a single embed cell (iframe for web, video for media)
     */
    function buildEmbedCell(url, title, height) {
        var hStyle = height ? ` style="height:${height}px"` : '';

        // Video file — native <video>
        if (M.isVideoUrl(url)) {
            var format = getVideoFormat(url);
            return `<div class="embed-cell">` +
                `<div class="embed-cell-content"${hStyle}>` +
                    `<video controls preload="metadata" playsinline src="${escHtml(url)}"></video>` +
                `</div>` +
                `<div class="embed-cell-caption">` +
                    `<span class="vp-icon">▶</span>` +
                    `<span class="vp-label">${escHtml(title)}</span>` +
                    `<span class="vp-format">${format}</span>` +
                `</div>` +
            `</div>`;
        }

        // YouTube
        if (M.isYouTubeUrl(url)) {
            var ytId = getYouTubeId(url);
            return `<div class="embed-cell">` +
                `<div class="embed-cell-content"${hStyle}>` +
                    `<iframe src="https://www.youtube-nocookie.com/embed/${ytId}" ` +
                        `title="${escHtml(title)}" frameborder="0" ` +
                        `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
                        `referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` +
                `</div>` +
                `<div class="embed-cell-caption">` +
                    `<span class="vp-icon">▶</span>` +
                    `<span class="vp-label">${escHtml(title)}</span>` +
                    `<span class="vp-format">YouTube</span>` +
                `</div>` +
            `</div>`;
        }

        // Vimeo
        if (M.isVimeoUrl(url)) {
            var vmId = getVimeoId(url);
            return `<div class="embed-cell">` +
                `<div class="embed-cell-content"${hStyle}>` +
                    `<iframe src="https://player.vimeo.com/video/${vmId}?dnt=1" ` +
                        `title="${escHtml(title)}" frameborder="0" ` +
                        `allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>` +
                `</div>` +
                `<div class="embed-cell-caption">` +
                    `<span class="vp-icon">▶</span>` +
                    `<span class="vp-label">${escHtml(title)}</span>` +
                    `<span class="vp-format">Vimeo</span>` +
                `</div>` +
            `</div>`;
        }

        // Website — link preview card (most sites block iframes via X-Frame-Options)
        var domain = getDomain(url);
        var favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
        return `<div class="embed-cell">` +
            `<div class="embed-cell-content embed-link-card"${hStyle}>` +
                `<a href="${escHtml(url)}" target="_blank" rel="noopener noreferrer" class="embed-link-inner">` +
                    `<img class="embed-link-favicon" src="${favicon}" alt="" width="48" height="48" />` +
                    `<div class="embed-link-info">` +
                        `<div class="embed-link-title">${escHtml(title)}</div>` +
                        `<div class="embed-link-domain">${escHtml(domain)}</div>` +
                    `</div>` +
                    `<span class="embed-link-open">Open ↗</span>` +
                `</a>` +
            `</div>` +
            `<div class="embed-cell-caption">` +
                `<span class="vp-icon">🌐</span>` +
                `<span class="vp-label">${escHtml(title)}</span>` +
                `<span class="vp-format">WEB</span>` +
            `</div>` +
        `</div>`;
    }

    /**
     * Build the full embed grid HTML from code block content.
     * @param {string} code  - The lines inside the code block
     * @param {string} params - Everything after "embed" on the language line
     */
    M.buildEmbedGridHtml = function (code, params) {
        // Parse params: cols=N  height=N
        var colsMatch = params.match(/cols\s*=\s*(\d+)/i);
        var heightMatch = params.match(/height\s*=\s*(\d+)/i);
        var cols = colsMatch ? parseInt(colsMatch[1], 10) : 1;
        var height = heightMatch ? parseInt(heightMatch[1], 10) : 400;

        // Parse lines: URL "optional title"
        var lines = code.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
        if (lines.length === 0) return '';

        var items = lines.map(function (line) {
            // Match: URL "title" or URL 'title' or just URL
            var m = line.match(/^(\S+)\s+["'](.+?)["']\s*$/) ||
                    line.match(/^(\S+)\s+(.+?)\s*$/) ||
                    line.match(/^(\S+)\s*$/);
            if (!m) return null;
            var url = m[1];
            var title = m[2] || getDomain(url);
            return { url: url, title: title };
        }).filter(Boolean);

        if (items.length === 0) return '';

        // Clamp cols
        if (cols > 4) cols = 4;
        if (cols < 1) cols = 1;

        // Build grid
        var gridStyle = `grid-template-columns: repeat(${cols}, 1fr)`;
        var cells = items.map(function (item) {
            return buildEmbedCell(item.url, item.title, height);
        }).join('\n');

        return `<div class="embed-grid" style="${gridStyle}" data-cols="${cols}">` +
            cells +
        `</div>`;
    };

})(window.MDView);
