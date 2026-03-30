// ============================================
// rec-studio.js — Recording Studio v3 for TextAgent
// Inspired by record.addy.ie
// Canvas compositing, AudioContext mixing,
// teleprompter, camera shape toggle (circle/square)
// ============================================
(function (M) {
    'use strict';

    // =========================================
    // CONSTANTS
    // =========================================
    var MIME_PRIORITY = [
        'video/mp4;codecs=h264,aac', 'video/mp4;codecs=avc1', 'video/mp4',
        'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'
    ];

    var RESOLUTION_MAP = {
        '720p': { width: 1280, height: 720 },
        '1080p': { width: 1920, height: 1080 }
    };

    // =========================================
    // STATE
    // =========================================
    var state = {
        mode: 'screen_camera',
        status: 'idle',
        screenStream: null,
        cameraStream: null,
        micStream: null,
        compositeCanvas: null,
        compositeCtx: null,
        compositeAnimId: null,
        audioContext: null,
        recorder: null,
        chunks: [],
        blob: null,
        blobUrl: null,
        elapsed: 0,
        timerInterval: null,
        supportedMime: null,
        cameraShape: 'circle', // circle | square
        pipPosition: { x: null, y: null },
        devices: { video: [], audio: [] },
        teleprompter: {
            text: '',
            scrolling: false,
            speed: 2,
            fontSize: 18,
            scrollPos: 0,
            animId: null
        }
    };

    var els = {};

    // =========================================
    // BUILD UI
    // =========================================
    function buildUI() {
        if (document.getElementById('rec-overlay')) return;
        var o = document.createElement('div');
        o.id = 'rec-overlay';
        o.className = 'rec-overlay';
        o.innerHTML = panelHTML();
        document.body.appendChild(o);
        cacheEls(o);
        wireEvents();
    }

    // SVG icons matching record.addy.ie's thin line-art style
    var IC = {
        screen: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
        screenCam: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="18" height="12" rx="2"/><line x1="7" y1="19" x2="15" y2="19"/><line x1="11" y1="15" x2="11" y2="19"/><rect x="16" y="10" width="7" height="5" rx="1" fill="currentColor" opacity="0.15"/><rect x="16" y="10" width="7" height="5" rx="1"/></svg>',
        camera: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/></svg>',
        pen: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
        share: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>',
        teleprompter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></svg>',
        shape: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>',
        mic: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
        camSmall: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>'
    };

    function panelHTML() {
        return '' +
        // Floating close button (always visible)
        '<button class="rec-close-btn" id="rec-close" style="position:absolute;top:12px;right:16px;z-index:30">✕</button>' +
        // Top bar (shown only during recording)
        '<div class="rec-topbar" id="rec-topbar">' +
            '<div class="rec-topbar-title">' +
                '<span class="rec-live-dot" id="rec-live-dot"></span>' +
                '⏺ REC' +
            '</div>' +
            '<div class="rec-topbar-right">' +
                '<span class="rec-topbar-timer" id="rec-top-timer">00:00</span>' +
            '</div>' +
        '</div>' +

        // Canvas area
        '<div class="rec-canvas-area" id="rec-canvas-area">' +
            // Preview frame (screen/camera)
            '<div class="rec-preview-frame" id="rec-preview-frame">' +
                '<video id="rec-preview-vid" autoplay muted playsinline style="display:none"></video>' +
                '<canvas id="rec-composite-canvas" style="display:none"></canvas>' +
                '<div class="rec-placeholder" id="rec-placeholder">' +
                    '<h3>Record your screen</h3>' +
                    '<button class="rec-share-btn" id="rec-share-btn">' + IC.share + ' Share screen</button>' +
                '</div>' +
                '<div class="rec-pip" id="rec-pip"><video id="rec-pip-vid" autoplay muted playsinline></video></div>' +
                '<div class="rec-countdown" id="rec-countdown"><span class="rec-countdown-num" id="rec-countdown-num">3</span></div>' +
                '<div class="rec-timer-badge" id="rec-timer-badge"><span class="rec-timer-dot" id="rec-timer-dot"></span><span id="rec-timer-text">00:00</span></div>' +
                // Mode selector floating pill
                '<div class="rec-mode-bar" id="rec-mode-bar">' +
                    '<button class="rec-mode-item" data-mode="screen"><span class="rec-mode-icon">' + IC.screen + '</span>Screen only</button>' +
                    '<button class="rec-mode-item active" data-mode="screen_camera"><span class="rec-mode-icon">' + IC.screenCam + '</span>Screen and camera</button>' +
                    '<button class="rec-mode-item" data-mode="camera"><span class="rec-mode-icon">' + IC.camera + '</span>Camera only</button>' +
                    '<button class="rec-mode-item" data-mode="whiteboard"><span class="rec-mode-icon">' + IC.pen + '</span>Whiteboard</button>' +
                '</div>' +
            '</div>' +

            // Whiteboard
            '<div class="rec-whiteboard" id="rec-whiteboard">' +
                '<div class="rec-wb-toolbar">' +
                    '<button class="rec-wb-btn active" data-wb="pen">✏️ Pen</button>' +
                    '<button class="rec-wb-btn" data-wb="eraser">🧹 Eraser</button>' +
                    '<button class="rec-wb-btn" data-wb="line">📏 Line</button>' +
                    '<button class="rec-wb-btn" data-wb="rect">▬ Rect</button>' +
                    '<button class="rec-wb-btn" data-wb="circle">⬤ Circle</button>' +
                    '<input type="color" id="rec-wb-color" class="rec-wb-color" value="#ffffff" title="Color">' +
                    '<input type="range" id="rec-wb-size" class="rec-wb-size" min="1" max="20" value="3" title="Size">' +
                    '<button class="rec-wb-btn" id="rec-wb-clear">🗑️ Clear</button>' +
                '</div>' +
                '<div class="rec-wb-canvas-wrap"><canvas id="rec-wb-canvas" width="1280" height="720"></canvas></div>' +
                // Mode bar inside whiteboard area
                '<div class="rec-mode-bar">' +
                    '<button class="rec-mode-item" data-mode="screen"><span class="rec-mode-icon">' + IC.screen + '</span>Screen only</button>' +
                    '<button class="rec-mode-item" data-mode="screen_camera"><span class="rec-mode-icon">' + IC.screenCam + '</span>Screen + Cam</button>' +
                    '<button class="rec-mode-item" data-mode="camera"><span class="rec-mode-icon">' + IC.camera + '</span>Camera only</button>' +
                    '<button class="rec-mode-item active" data-mode="whiteboard"><span class="rec-mode-icon">' + IC.pen + '</span>Whiteboard</button>' +
                '</div>' +
            '</div>' +

            // Playback
            '<div class="rec-playback" id="rec-playback">' +
                '<div class="rec-playback-video" id="rec-playback-video"></div>' +
                '<div class="rec-playback-meta" id="rec-playback-meta"></div>' +
            '</div>' +

            // Teleprompter
            '<div class="rec-teleprompter" id="rec-teleprompter">' +
                '<div class="rec-tp-header">' +
                    '<span class="rec-tp-title">📝 Teleprompter</span>' +
                    '<div class="rec-tp-controls">' +
                        '<button class="rec-tp-btn" id="rec-tp-slower" title="Decrease font size">A−</button>' +
                        '<span class="rec-tp-speed" id="rec-tp-speed">18px</span>' +
                        '<button class="rec-tp-btn" id="rec-tp-faster" title="Increase font size">A+</button>' +
                        '<span class="rec-tp-divider"></span>' +
                        '<button class="rec-tp-btn" id="rec-tp-speed-down" title="Slower scroll">◁</button>' +
                        '<span class="rec-tp-speed" id="rec-tp-speed-label">2x</span>' +
                        '<button class="rec-tp-btn" id="rec-tp-speed-up" title="Faster scroll">▷</button>' +
                        '<button class="rec-tp-btn" id="rec-tp-play" title="Start scrolling">▶</button>' +
                        '<button class="rec-tp-btn" id="rec-tp-fade" title="Toggle transparency"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
                        '<button class="rec-tp-btn" id="rec-tp-close" title="Close">✕</button>' +
                    '</div>' +
                '</div>' +
                '<div class="rec-tp-text" id="rec-tp-edit">' +
                    '<textarea id="rec-tp-textarea" placeholder="Type or paste your script here..."></textarea>' +
                '</div>' +
                '<div class="rec-tp-scroll-container" id="rec-tp-scroll">' +
                    '<div class="rec-tp-scroll-content" id="rec-tp-scroll-content"></div>' +
                '</div>' +
            '</div>' +
        '</div>' +

        // Bottom bar
        '<div class="rec-bottom-bar" id="rec-bottom-bar">' +
            '<button class="rec-action-btn" id="rec-btn-pause" style="display:none">⏸ Pause</button>' +
            '<button class="rec-record-btn" id="rec-btn-record" title="Record"><span class="rec-record-inner"></span></button>' +
            '<button class="rec-action-btn" id="rec-btn-stop" style="display:none">⏹ Stop</button>' +
            // Footer controls (right) — SVG line-art icons matching record.addy.ie
            '<div class="rec-footer-controls">' +
                '<div style="position:relative">' +
                    '<button class="rec-footer-btn" id="rec-btn-teleprompter" title="Teleprompter">' + IC.teleprompter + '<span class="rec-footer-caret">▾</span></button>' +
                '</div>' +
                '<div style="position:relative">' +
                    '<button class="rec-footer-btn" id="rec-btn-shape" title="Camera shape">' + IC.shape + '<span class="rec-footer-caret">▾</span></button>' +
                '</div>' +
                '<div style="position:relative">' +
                    '<button class="rec-footer-btn" id="rec-btn-mic" title="Microphone">' + IC.mic + '<span class="rec-footer-caret">▾</span></button>' +
                    '<div class="rec-dropdown" id="rec-mic-dropdown"></div>' +
                '</div>' +
                '<div style="position:relative">' +
                    '<button class="rec-footer-btn" id="rec-btn-cam" title="Camera">' + IC.camSmall + '<span class="rec-footer-caret">▾</span></button>' +
                    '<div class="rec-dropdown" id="rec-cam-dropdown"></div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function cacheEls(o) {
        els.overlay = o;
        els.closeBtn = o.querySelector('#rec-close');
        els.liveDot = o.querySelector('#rec-live-dot');
        els.topTimer = o.querySelector('#rec-top-timer');
        els.canvasArea = o.querySelector('#rec-canvas-area');
        els.previewFrame = o.querySelector('#rec-preview-frame');
        els.previewVid = o.querySelector('#rec-preview-vid');
        els.compositeCanvas = o.querySelector('#rec-composite-canvas');
        els.placeholder = o.querySelector('#rec-placeholder');
        els.shareBtn = o.querySelector('#rec-share-btn');
        els.pip = o.querySelector('#rec-pip');
        els.pipVid = o.querySelector('#rec-pip-vid');
        els.countdown = o.querySelector('#rec-countdown');
        els.countdownNum = o.querySelector('#rec-countdown-num');
        els.timerBadge = o.querySelector('#rec-timer-badge');
        els.timerDot = o.querySelector('#rec-timer-dot');
        els.timerText = o.querySelector('#rec-timer-text');
        els.modeBar = o.querySelector('#rec-mode-bar');
        els.modeItems = o.querySelectorAll('.rec-mode-item');
        els.whiteboard = o.querySelector('#rec-whiteboard');
        els.wbCanvas = o.querySelector('#rec-wb-canvas');
        els.wbToolBtns = o.querySelectorAll('.rec-wb-btn[data-wb]');
        els.wbClear = o.querySelector('#rec-wb-clear');
        els.wbColor = o.querySelector('#rec-wb-color');
        els.wbSize = o.querySelector('#rec-wb-size');
        els.playback = o.querySelector('#rec-playback');
        els.playbackVideo = o.querySelector('#rec-playback-video');
        els.playbackMeta = o.querySelector('#rec-playback-meta');
        els.btnRecord = o.querySelector('#rec-btn-record');
        els.btnPause = o.querySelector('#rec-btn-pause');
        els.btnStop = o.querySelector('#rec-btn-stop');
        els.btnTeleprompter = o.querySelector('#rec-btn-teleprompter');
        els.btnShape = o.querySelector('#rec-btn-shape');
        els.btnMic = o.querySelector('#rec-btn-mic');
        els.btnCam = o.querySelector('#rec-btn-cam');
        els.micDropdown = o.querySelector('#rec-mic-dropdown');
        els.camDropdown = o.querySelector('#rec-cam-dropdown');
        els.teleprompter = o.querySelector('#rec-teleprompter');
        els.tpTextarea = o.querySelector('#rec-tp-textarea');
        els.tpEdit = o.querySelector('#rec-tp-edit');
        els.tpScroll = o.querySelector('#rec-tp-scroll');
        els.tpScrollContent = o.querySelector('#rec-tp-scroll-content');
        els.tpPlay = o.querySelector('#rec-tp-play');
        els.tpClose = o.querySelector('#rec-tp-close');
        els.tpSlower = o.querySelector('#rec-tp-slower');
        els.tpFaster = o.querySelector('#rec-tp-faster');
        els.tpSpeed = o.querySelector('#rec-tp-speed');
    }

    // =========================================
    // EVENTS
    // =========================================
    function wireEvents() {
        els.closeBtn.addEventListener('click', close);
        els.shareBtn.addEventListener('click', function () { startRecording(); });
        els.btnRecord.addEventListener('click', startRecording);
        els.btnPause.addEventListener('click', togglePause);
        els.btnStop.addEventListener('click', stopRecording);

        // Mode switching
        els.modeItems.forEach(function (item) {
            item.addEventListener('click', function () {
                if (state.status === 'recording' || state.status === 'paused') return;
                els.modeItems.forEach(function (m) { m.classList.remove('active'); });
                // Activate all items with same mode
                els.overlay.querySelectorAll('.rec-mode-item[data-mode="' + item.dataset.mode + '"]')
                    .forEach(function (m) { m.classList.add('active'); });
                setMode(item.dataset.mode);
            });
        });

        // Shape toggle — preserve caret, use SVG icons
        var shapeCircle = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/></svg>';
        var shapeSquare = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>';
        els.btnShape.addEventListener('click', function () {
            state.cameraShape = state.cameraShape === 'circle' ? 'square' : 'circle';
            els.pip.classList.toggle('shape-circle', state.cameraShape === 'circle');
            els.pip.classList.toggle('shape-square', state.cameraShape === 'square');
            els.btnShape.innerHTML = (state.cameraShape === 'circle' ? shapeCircle : shapeSquare) + '<span class="rec-footer-caret">▾</span>';
        });

        // Teleprompter
        els.btnTeleprompter.addEventListener('click', function () {
            els.teleprompter.classList.toggle('open');
            els.btnTeleprompter.classList.toggle('active', els.teleprompter.classList.contains('open'));
        });
        els.tpClose.addEventListener('click', function () {
            els.teleprompter.classList.remove('open');
            els.btnTeleprompter.classList.remove('active');
            stopTeleprompter();
        });
        els.tpPlay.addEventListener('click', toggleTeleprompter);

        // Font size controls
        function updateFontSize() {
            var sz = state.teleprompter.fontSize + 'px';
            els.tpSpeed.textContent = sz;
            els.tpTextarea.style.fontSize = sz;
            els.tpScrollContent.style.fontSize = sz;
        }
        els.tpSlower.addEventListener('click', function () {
            state.teleprompter.fontSize = Math.max(10, state.teleprompter.fontSize - 2);
            updateFontSize();
        });
        els.tpFaster.addEventListener('click', function () {
            state.teleprompter.fontSize = Math.min(48, state.teleprompter.fontSize + 2);
            updateFontSize();
        });

        // Speed controls
        var tpSpeedLabel = els.overlay.querySelector('#rec-tp-speed-label');
        els.overlay.querySelector('#rec-tp-speed-down').addEventListener('click', function () {
            state.teleprompter.speed = Math.max(0.5, state.teleprompter.speed - 0.5);
            tpSpeedLabel.textContent = state.teleprompter.speed + 'x';
        });
        els.overlay.querySelector('#rec-tp-speed-up').addEventListener('click', function () {
            state.teleprompter.speed = Math.min(5, state.teleprompter.speed + 0.5);
            tpSpeedLabel.textContent = state.teleprompter.speed + 'x';
        });

        // Teleprompter fade toggle — cycles: opaque → semi → very transparent
        var tpFadeBtn = els.overlay.querySelector('#rec-tp-fade');
        var tpFadeLevel = 0; // 0=opaque, 1=semi, 2=very transparent
        tpFadeBtn.addEventListener('click', function () {
            tpFadeLevel = (tpFadeLevel + 1) % 3;
            els.teleprompter.classList.remove('fade-1', 'fade-2');
            if (tpFadeLevel === 1) els.teleprompter.classList.add('fade-1');
            if (tpFadeLevel === 2) els.teleprompter.classList.add('fade-2');
            tpFadeBtn.classList.toggle('active', tpFadeLevel > 0);
        });

        // Teleprompter drag-to-move (header is the handle)
        (function initTpDrag() {
            var tp = els.teleprompter;
            var header = tp.querySelector('.rec-tp-header');
            var isDragging = false;
            var startX, startY, startLeft, startTop;

            header.addEventListener('mousedown', function (e) {
                if (e.target.closest('.rec-tp-btn')) return; // don't drag when clicking controls
                isDragging = true;
                // Remove CSS transform centering on first drag
                var rect = tp.getBoundingClientRect();
                tp.style.transform = 'none';
                tp.style.left = rect.left + 'px';
                tp.style.top = rect.top + 'px';
                tp.style.bottom = 'auto';
                tp.style.right = 'auto';
                startX = e.clientX;
                startY = e.clientY;
                startLeft = rect.left;
                startTop = rect.top;
                document.body.style.userSelect = 'none';
                e.preventDefault();
            });

            document.addEventListener('mousemove', function (e) {
                if (!isDragging) return;
                var dx = e.clientX - startX;
                var dy = e.clientY - startY;
                var newLeft = Math.max(0, Math.min(window.innerWidth - 100, startLeft + dx));
                var newTop = Math.max(0, Math.min(window.innerHeight - 60, startTop + dy));
                tp.style.left = newLeft + 'px';
                tp.style.top = newTop + 'px';
            });

            document.addEventListener('mouseup', function () {
                if (isDragging) {
                    isDragging = false;
                    document.body.style.userSelect = '';
                }
            });

            // Touch support for mobile drag
            header.addEventListener('touchstart', function (e) {
                if (e.target.closest('.rec-tp-btn')) return;
                isDragging = true;
                var touch = e.touches[0];
                var rect = tp.getBoundingClientRect();
                tp.style.transform = 'none';
                tp.style.left = rect.left + 'px';
                tp.style.top = rect.top + 'px';
                tp.style.bottom = 'auto';
                tp.style.right = 'auto';
                startX = touch.clientX;
                startY = touch.clientY;
                startLeft = rect.left;
                startTop = rect.top;
            }, { passive: true });

            document.addEventListener('touchmove', function (e) {
                if (!isDragging) return;
                var touch = e.touches[0];
                var dx = touch.clientX - startX;
                var dy = touch.clientY - startY;
                var newLeft = Math.max(0, Math.min(window.innerWidth - 100, startLeft + dx));
                var newTop = Math.max(0, Math.min(window.innerHeight - 60, startTop + dy));
                tp.style.left = newLeft + 'px';
                tp.style.top = newTop + 'px';
            }, { passive: true });

            document.addEventListener('touchend', function () {
                isDragging = false;
            });
        })();

        // Mic/Camera dropdowns
        els.btnMic.addEventListener('click', function () { toggleDropdown(els.micDropdown); populateMicDropdown(); });
        els.btnCam.addEventListener('click', function () { toggleDropdown(els.camDropdown); populateCamDropdown(); });

        // Close dropdowns on outside click
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.rec-footer-btn') && !e.target.closest('.rec-dropdown')) {
                els.micDropdown.classList.remove('open');
                els.camDropdown.classList.remove('open');
            }
        });

        // Whiteboard
        els.wbToolBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                els.wbToolBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                wbState.tool = btn.dataset.wb;
            });
        });
        els.wbColor.addEventListener('input', function () { wbState.color = this.value; });
        els.wbSize.addEventListener('input', function () { wbState.size = parseInt(this.value); });
        els.wbClear.addEventListener('click', wbClear);

        var wc = els.wbCanvas;
        wc.addEventListener('mousedown', wbDown);
        wc.addEventListener('mousemove', wbMove);
        wc.addEventListener('mouseup', wbUp);
        wc.addEventListener('mouseleave', wbUp);
        wc.addEventListener('touchstart', function (e) { e.preventDefault(); wbDown(e.touches[0]); });
        wc.addEventListener('touchmove', function (e) { e.preventDefault(); wbMove(e.touches[0]); });
        wc.addEventListener('touchend', function (e) { e.preventDefault(); wbUp(); });

        // PiP dragging
        makeDraggable(els.pip);

        // Set initial shape
        els.pip.classList.add('shape-circle');
    }

    // =========================================
    // DROPDOWNS
    // =========================================
    function toggleDropdown(el) {
        var isOpen = el.classList.contains('open');
        els.micDropdown.classList.remove('open');
        els.camDropdown.classList.remove('open');
        if (!isOpen) el.classList.add('open');
    }

    async function populateMicDropdown() {
        try {
            var devices = await navigator.mediaDevices.enumerateDevices();
            var mics = devices.filter(function (d) { return d.kind === 'audioinput'; });
            state.devices.audio = mics;
            els.micDropdown.innerHTML = mics.map(function (d, i) {
                return '<button class="rec-dropdown-item" data-id="' + d.deviceId + '">' +
                    (d.label || 'Microphone ' + (i + 1)) + '</button>';
            }).join('');
            els.micDropdown.querySelectorAll('.rec-dropdown-item').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    els.micDropdown.classList.remove('open');
                    showToast('🎤 ' + btn.textContent, 'info');
                });
            });
        } catch (e) { els.micDropdown.innerHTML = '<div class="rec-dropdown-item">No mics found</div>'; }
    }

    async function populateCamDropdown() {
        try {
            var devices = await navigator.mediaDevices.enumerateDevices();
            var cams = devices.filter(function (d) { return d.kind === 'videoinput'; });
            state.devices.video = cams;
            els.camDropdown.innerHTML = cams.map(function (d, i) {
                return '<button class="rec-dropdown-item" data-id="' + d.deviceId + '">' +
                    (d.label || 'Camera ' + (i + 1)) + '</button>';
            }).join('');
            els.camDropdown.querySelectorAll('.rec-dropdown-item').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    els.camDropdown.classList.remove('open');
                    showToast('📷 ' + btn.textContent, 'info');
                });
            });
        } catch (e) { els.camDropdown.innerHTML = '<div class="rec-dropdown-item">No cameras found</div>'; }
    }

    // =========================================
    // MODE
    // =========================================
    function setMode(mode) {
        state.mode = mode;
        resetState();

        var isWB = mode === 'whiteboard';
        els.previewFrame.style.display = isWB ? 'none' : '';
        els.whiteboard.classList.toggle('visible', isWB);
        els.playback.classList.remove('visible');
        els.pip.classList.remove('visible');

        var placeholders = {
            'screen': ['Record your screen', IC.share + ' Share screen'],
            'screen_camera': ['Record your screen', IC.share + ' Share screen'],
            'camera': ['Record yourself', IC.camera + ' Start camera'],
            'whiteboard': ['', '']
        };
        var p = placeholders[mode] || placeholders.screen;
        els.placeholder.innerHTML = '<h3>' + p[0] + '</h3><button class="rec-share-btn" id="rec-share-btn">' + p[1] + '</button>';
        els.placeholder.style.display = '';
        els.previewVid.style.display = 'none';
        els.compositeCanvas.style.display = 'none';

        // Re-wire share button
        var newShareBtn = els.overlay.querySelector('#rec-share-btn');
        if (newShareBtn) newShareBtn.addEventListener('click', startRecording);
    }

    // =========================================
    // STREAM ACQUISITION
    // =========================================
    async function getScreen() {
        return await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: 'always', maxWidth: 1920, maxHeight: 1080, maxFrameRate: 30 },
            audio: true
        });
    }

    async function getCamera() {
        var res = RESOLUTION_MAP['720p'];
        return await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: res.width }, height: { ideal: res.height }, frameRate: { ideal: 30 } },
            audio: false
        });
    }

    async function getMic() {
        return await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48000 },
            video: false
        });
    }

    // =========================================
    // AUDIO MIXING
    // =========================================
    function mixAudio(streams) {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var dest = ctx.createMediaStreamDestination();
        streams.forEach(function (s) {
            if (s && s.getAudioTracks().length > 0) {
                var src = ctx.createMediaStreamSource(new MediaStream([s.getAudioTracks()[0]]));
                var gain = ctx.createGain();
                gain.gain.value = 1.0;
                src.connect(gain).connect(dest);
            }
        });
        state.audioContext = ctx;
        return dest.stream;
    }

    // =========================================
    // CANVAS COMPOSITING
    // =========================================
    function setupCanvas(w, h) {
        var c = els.compositeCanvas;
        c.width = w || 1280;
        c.height = h || 720;
        c.style.display = '';
        state.compositeCanvas = c;
        state.compositeCtx = c.getContext('2d');
        return c;
    }

    function startComposite() {
        var ctx = state.compositeCtx;
        var canvas = state.compositeCanvas;
        var screenVid = els.previewVid;
        var pipVid = els.pipVid;
        var isCircle = function () { return state.cameraShape === 'circle'; };

        function render() {
            if (state.status !== 'recording' && state.status !== 'paused' && state.status !== 'countdown') return;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Screen layer
            if (state.screenStream && screenVid.videoWidth > 0) {
                var sw = screenVid.videoWidth, sh = screenVid.videoHeight;
                var scale = Math.min(canvas.width / sw, canvas.height / sh);
                var dw = sw * scale, dh = sh * scale;
                var dx = (canvas.width - dw) / 2, dy = (canvas.height - dh) / 2;
                ctx.drawImage(screenVid, dx, dy, dw, dh);
            }

            // Camera PiP layer
            if (state.cameraStream && pipVid.videoWidth > 0) {
                var pipSize = canvas.width * 0.2;
                var wrapRect = els.previewFrame.getBoundingClientRect();
                var pipRect = els.pip.getBoundingClientRect();
                var relX = ((pipRect.left - wrapRect.left) / wrapRect.width) * canvas.width;
                var relY = ((pipRect.top - wrapRect.top) / wrapRect.height) * canvas.height;
                relX = Math.max(0, Math.min(relX, canvas.width - pipSize));
                relY = Math.max(0, Math.min(relY, canvas.height - pipSize));

                ctx.save();
                ctx.beginPath();
                if (isCircle()) {
                    ctx.arc(relX + pipSize / 2, relY + pipSize / 2, pipSize / 2, 0, Math.PI * 2);
                } else {
                    var r = 14;
                    ctx.moveTo(relX + r, relY);
                    ctx.lineTo(relX + pipSize - r, relY);
                    ctx.quadraticCurveTo(relX + pipSize, relY, relX + pipSize, relY + r);
                    ctx.lineTo(relX + pipSize, relY + pipSize - r);
                    ctx.quadraticCurveTo(relX + pipSize, relY + pipSize, relX + pipSize - r, relY + pipSize);
                    ctx.lineTo(relX + r, relY + pipSize);
                    ctx.quadraticCurveTo(relX, relY + pipSize, relX, relY + pipSize - r);
                    ctx.lineTo(relX, relY + r);
                    ctx.quadraticCurveTo(relX, relY, relX + r, relY);
                }
                ctx.closePath();
                ctx.clip();

                // Mirror
                ctx.translate(relX + pipSize, relY);
                ctx.scale(-1, 1);
                ctx.drawImage(pipVid, 0, 0, pipSize, pipSize);
                ctx.restore();

                // Border
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                if (isCircle()) {
                    ctx.arc(relX + pipSize / 2, relY + pipSize / 2, pipSize / 2, 0, Math.PI * 2);
                } else {
                    var r2 = 14;
                    ctx.moveTo(relX + r2, relY);
                    ctx.lineTo(relX + pipSize - r2, relY);
                    ctx.quadraticCurveTo(relX + pipSize, relY, relX + pipSize, relY + r2);
                    ctx.lineTo(relX + pipSize, relY + pipSize - r2);
                    ctx.quadraticCurveTo(relX + pipSize, relY + pipSize, relX + pipSize - r2, relY + pipSize);
                    ctx.lineTo(relX + r2, relY + pipSize);
                    ctx.quadraticCurveTo(relX, relY + pipSize, relX, relY + pipSize - r2);
                    ctx.lineTo(relX, relY + r2);
                    ctx.quadraticCurveTo(relX, relY, relX + r2, relY);
                }
                ctx.closePath();
                ctx.stroke();
            }

            state.compositeAnimId = requestAnimationFrame(render);
        }
        state.compositeAnimId = requestAnimationFrame(render);
    }

    // =========================================
    // TELEPROMPTER
    // =========================================
    function toggleTeleprompter() {
        if (state.teleprompter.scrolling) {
            stopTeleprompter();
        } else {
            startTeleprompter();
        }
    }

    function startTeleprompter() {
        var text = els.tpTextarea.value.trim();
        if (!text) { showToast('📝 Type your script first', 'info'); return; }

        state.teleprompter.text = text;
        state.teleprompter.scrolling = true;
        state.teleprompter.scrollPos = 0;
        els.tpScrollContent.textContent = text;
        els.tpScrollContent.style.transform = '';
        els.tpEdit.style.display = 'none';
        els.tpScroll.style.display = 'block';
        els.tpPlay.textContent = '⏸';

        // Small delay to let DOM layout settle before measuring heights
        requestAnimationFrame(function () {
            function scroll() {
                if (!state.teleprompter.scrolling) return;
                state.teleprompter.scrollPos += state.teleprompter.speed * 0.5;
                els.tpScrollContent.style.transform = 'translateY(-' + state.teleprompter.scrollPos + 'px)';

                // Check if scrolled past end
                var contentH = els.tpScrollContent.scrollHeight || els.tpScrollContent.offsetHeight;
                var containerH = els.tpScroll.clientHeight || els.tpScroll.offsetHeight;
                if (contentH > 0 && containerH > 0 && state.teleprompter.scrollPos > contentH + 40) {
                    stopTeleprompter();
                    return;
                }
                state.teleprompter.animId = requestAnimationFrame(scroll);
            }
            state.teleprompter.animId = requestAnimationFrame(scroll);
        });
    }

    function stopTeleprompter() {
        state.teleprompter.scrolling = false;
        if (state.teleprompter.animId) cancelAnimationFrame(state.teleprompter.animId);
        els.tpEdit.style.display = '';
        els.tpScroll.style.display = 'none';
        els.tpPlay.textContent = '▶';
        els.tpScrollContent.style.transform = '';
    }

    // =========================================
    // RECORDING
    // =========================================
    async function startRecording() {
        if (state.status === 'stopped') resetState();

        try {
            var audioStreams = [];

            // Screen
            if (state.mode === 'screen' || state.mode === 'screen_camera') {
                try {
                    state.screenStream = await getScreen();
                } catch (e) {
                    if (e.name === 'NotAllowedError') {
                        showPermissionsHelp('screen');
                        if (state.mode === 'screen_camera') {
                            showToast('💡 Screen denied — switching to camera only', 'info');
                            state.mode = 'camera';
                            els.modeItems.forEach(function (m) { m.classList.toggle('active', m.dataset.mode === 'camera'); });
                        } else return;
                    } else throw e;
                }
                if (state.screenStream) {
                    els.previewVid.srcObject = state.screenStream;
                    els.previewVid.style.display = '';
                    els.placeholder.style.display = 'none';
                    if (state.screenStream.getAudioTracks().length > 0) audioStreams.push(state.screenStream);
                    state.screenStream.getVideoTracks()[0].addEventListener('ended', function () {
                        if (state.status === 'recording' || state.status === 'paused') stopRecording();
                    });
                }
            }

            // Camera
            if (state.mode === 'camera' || state.mode === 'screen_camera') {
                try {
                    state.cameraStream = await getCamera();
                } catch (e) {
                    if (e.name === 'NotAllowedError') { showPermissionsHelp('camera'); if (!state.screenStream) return; }
                    else if (e.name === 'NotFoundError') { showToast('📷 No camera found', 'error'); if (!state.screenStream) return; }
                    else throw e;
                }
                if (state.cameraStream) {
                    if (state.mode === 'camera') {
                        els.previewVid.srcObject = state.cameraStream;
                        els.previewVid.style.display = '';
                        els.previewVid.style.transform = 'scaleX(-1)';
                        els.placeholder.style.display = 'none';
                    } else if (state.mode === 'screen_camera') {
                        els.pipVid.srcObject = state.cameraStream;
                        els.pip.classList.add('visible');
                    }
                }
            }

            // Mic
            try {
                state.micStream = await getMic();
                audioStreams.push(state.micStream);
            } catch (e) {
                showToast('🎤 No mic — recording without audio', 'info');
            }

            // Whiteboard
            if (state.mode === 'whiteboard') {
                state.screenStream = els.wbCanvas.captureStream(25);
            }

            if (!state.screenStream && !state.cameraStream) {
                showToast('⚠️ No streams. Grant permissions and retry.', 'error');
                return;
            }

            // Countdown
            await runCountdown();

            // Build final stream
            var finalStream = new MediaStream();

            if (state.mode === 'screen_camera' && state.screenStream && state.cameraStream) {
                var w = state.screenStream.getVideoTracks()[0].getSettings().width || 1280;
                var h = state.screenStream.getVideoTracks()[0].getSettings().height || 720;
                setupCanvas(w, h);
                startComposite();
                state.compositeCanvas.captureStream(25).getVideoTracks().forEach(function (t) { finalStream.addTrack(t); });
            } else if (state.mode === 'whiteboard') {
                state.screenStream.getVideoTracks().forEach(function (t) { finalStream.addTrack(t); });
            } else if (state.screenStream) {
                state.screenStream.getVideoTracks().forEach(function (t) { finalStream.addTrack(t); });
            } else if (state.cameraStream) {
                state.cameraStream.getVideoTracks().forEach(function (t) { finalStream.addTrack(t); });
            }

            if (audioStreams.length > 0) {
                mixAudio(audioStreams).getAudioTracks().forEach(function (t) { finalStream.addTrack(t); });
            }

            var mime = getSupportedMime();
            state.recorder = new MediaRecorder(finalStream, mime ? { mimeType: mime } : {});
            state.chunks = [];
            state.recorder.ondataavailable = function (e) { if (e.data.size > 0) state.chunks.push(e.data); };
            state.recorder.onstop = onRecorderStop;
            state.recorder.start(1000);

            state.status = 'recording';
            els.liveDot.classList.add('on');
            els.btnRecord.classList.add('is-recording');
            startTimer();
            updateUI();
            showToast('⏺ Recording started', 'info');

        } catch (err) {
            console.error('[RecStudio] Failed:', err);
            showToast('⚠️ ' + err.message, 'error');
            cleanupStreams();
        }
    }

    // =========================================
    // COUNTDOWN
    // =========================================
    function runCountdown() {
        return new Promise(function (resolve) {
            state.status = 'countdown';
            var c = 3;
            els.countdown.classList.add('active');
            els.countdownNum.textContent = c;
            var iv = setInterval(function () {
                c--;
                if (c <= 0) { clearInterval(iv); els.countdown.classList.remove('active'); resolve(); }
                else {
                    els.countdownNum.textContent = c;
                    els.countdownNum.style.animation = 'none';
                    void els.countdownNum.offsetWidth;
                    els.countdownNum.style.animation = '';
                }
            }, 1000);
        });
    }

    // =========================================
    // PAUSE / STOP
    // =========================================
    function togglePause() {
        if (state.status === 'recording') {
            state.recorder && state.recorder.pause();
            state.status = 'paused';
            clearInterval(state.timerInterval);
            els.timerDot.classList.add('paused');
            els.btnPause.textContent = '▶ Resume';
        } else if (state.status === 'paused') {
            state.recorder && state.recorder.resume();
            state.status = 'recording';
            startTimer();
            els.timerDot.classList.remove('paused');
            els.btnPause.textContent = '⏸ Pause';
        }
    }

    function stopRecording() {
        state.status = 'stopped';
        clearInterval(state.timerInterval);
        if (state.compositeAnimId) cancelAnimationFrame(state.compositeAnimId);
        if (state.recorder && state.recorder.state !== 'inactive') state.recorder.stop();
        els.liveDot.classList.remove('on');
        els.btnRecord.classList.remove('is-recording');
        cleanupStreams();
        updateUI();
    }

    function onRecorderStop() {
        var mime = getSupportedMime() || 'video/webm';
        state.blob = new Blob(state.chunks, { type: mime });
        state.blobUrl = URL.createObjectURL(state.blob);
        showPlayback();
        showToast('✅ Recording complete!', 'success');
    }

    // =========================================
    // PLAYBACK
    // =========================================
    function showPlayback() {
        var ext = (getSupportedMime() || '').indexOf('mp4') !== -1 ? 'mp4' : 'webm';
        var fname = state.mode + '-recording.' + ext;
        var size = formatSize(state.blob.size);
        var dur = formatTime(state.elapsed);

        els.previewFrame.style.display = 'none';
        els.whiteboard.classList.remove('visible');
        els.timerBadge.classList.remove('on');

        els.playbackVideo.innerHTML = '<video controls autoplay src="' + state.blobUrl + '"></video>';
        els.playbackMeta.innerHTML =
            '<span style="color:rgba(255,255,255,0.4);font-size:0.82rem">' + dur + ' • ' + size + '</span>' +
            '<button class="rec-dl-btn" id="rec-dl">📥 Download (' + size + ')</button>' +
            '<button class="rec-again-btn" id="rec-again">🔄 Record Again</button>';

        els.playback.classList.add('visible');

        document.getElementById('rec-dl').addEventListener('click', function () {
            var a = document.createElement('a'); a.href = state.blobUrl; a.download = fname;
            document.body.appendChild(a); a.click(); a.remove();
            showToast('📥 Download started', 'success');
        });
        document.getElementById('rec-again').addEventListener('click', function () {
            els.playback.classList.remove('visible');
            els.previewFrame.style.display = '';
            setMode(state.mode);
        });
    }

    // =========================================
    // TIMER
    // =========================================
    function startTimer() {
        els.timerBadge.classList.add('on');
        els.topTimer.classList.add('on');
        state.timerInterval = setInterval(function () {
            state.elapsed++;
            var t = formatTime(state.elapsed);
            els.timerText.textContent = t;
            els.topTimer.textContent = t;
        }, 1000);
    }

    function formatTime(s) {
        var m = Math.floor(s / 60), sec = s % 60;
        return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function formatSize(b) {
        if (b < 1024) return b + ' B';
        if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
        return (b / 1048576).toFixed(1) + ' MB';
    }

    // =========================================
    // UI UPDATES
    // =========================================
    function updateUI() {
        var s = state.status;
        var isRec = s === 'recording' || s === 'paused';
        els.btnRecord.style.display = (s === 'idle' || s === 'stopped') ? '' : 'none';
        els.btnPause.style.display = isRec ? '' : 'none';
        els.btnStop.style.display = isRec ? '' : 'none';
        // Show topbar only during recording
        var topbar = els.overlay.querySelector('#rec-topbar');
        if (topbar) topbar.classList.toggle('on', isRec);
        els.modeItems.forEach(function (m) {
            m.style.pointerEvents = (isRec || s === 'countdown') ? 'none' : '';
            m.style.opacity = (isRec || s === 'countdown') ? '0.35' : '';
        });
    }

    function getSupportedMime() {
        if (state.supportedMime) return state.supportedMime;
        for (var i = 0; i < MIME_PRIORITY.length; i++) {
            if (MediaRecorder.isTypeSupported(MIME_PRIORITY[i])) { state.supportedMime = MIME_PRIORITY[i]; return state.supportedMime; }
        }
        state.supportedMime = ''; return '';
    }

    // =========================================
    // CLEANUP
    // =========================================
    function cleanupStreams() {
        [state.screenStream, state.cameraStream, state.micStream].forEach(function (s) {
            if (s) s.getTracks().forEach(function (t) { t.stop(); });
        });
        state.screenStream = null; state.cameraStream = null; state.micStream = null;
        els.previewVid.srcObject = null; els.previewVid.style.transform = '';
        els.pipVid.srcObject = null; els.pip.classList.remove('visible');
        if (state.audioContext) { state.audioContext.close().catch(function () {}); state.audioContext = null; }
        if (state.compositeAnimId) { cancelAnimationFrame(state.compositeAnimId); state.compositeAnimId = null; }
    }

    function resetState() {
        cleanupStreams();
        clearInterval(state.timerInterval);
        if (state.blobUrl) URL.revokeObjectURL(state.blobUrl);
        state.recorder = null; state.chunks = []; state.blob = null; state.blobUrl = null;
        state.elapsed = 0; state.status = 'idle';
        els.timerBadge.classList.remove('on'); els.topTimer.classList.remove('on');
        els.timerText.textContent = '00:00'; els.topTimer.textContent = '00:00';
        els.countdown.classList.remove('active');
        els.playback.classList.remove('visible');
        els.liveDot.classList.remove('on');
        els.btnRecord.classList.remove('is-recording');
        els.btnPause.textContent = '⏸ Pause';
        updateUI();
    }

    // =========================================
    // DRAGGABLE PiP
    // =========================================
    function makeDraggable(el) {
        var sx, sy, ol, ot;
        function down(e) {
            e.preventDefault();
            var ev = e.touches ? e.touches[0] : e;
            var r = el.getBoundingClientRect();
            sx = ev.clientX; sy = ev.clientY; ol = r.left; ot = r.top;
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
            document.addEventListener('touchmove', move, { passive: false });
            document.addEventListener('touchend', up);
        }
        function move(e) {
            e.preventDefault();
            var ev = e.touches ? e.touches[0] : e;
            var pr = el.parentElement.getBoundingClientRect();
            var nl = Math.max(0, Math.min(ol + ev.clientX - sx - pr.left, pr.width - el.offsetWidth));
            var nt = Math.max(0, Math.min(ot + ev.clientY - sy - pr.top, pr.height - el.offsetHeight));
            el.style.left = nl + 'px'; el.style.top = nt + 'px';
            el.style.right = 'auto'; el.style.bottom = 'auto';
        }
        function up() {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', up);
        }
        el.addEventListener('mousedown', down);
        el.addEventListener('touchstart', down, { passive: false });
    }

    // =========================================
    // PERMISSIONS HELP
    // =========================================
    function showPermissionsHelp(type) {
        var isMac = /Mac/i.test(navigator.userAgent);
        var browser = /Chrome/i.test(navigator.userAgent) ? 'Google Chrome' : /Safari/i.test(navigator.userAgent) ? 'Safari' : 'your browser';
        var title = type === 'screen' ? '🖥️ Screen Recording Permission' : '📷 Camera Permission';
        var steps = '';
        if (isMac && type === 'screen') {
            steps = '<p style="margin:0 0 12px;opacity:0.7">macOS needs system-level screen recording permission.</p>' +
                '<ol style="margin:0;padding-left:20px;line-height:1.8">' +
                '<li>Open <b>System Settings → Privacy & Security</b></li>' +
                '<li>Click <b>Screen Recording</b></li>' +
                '<li>Toggle ON for <b>' + browser + '</b></li>' +
                '<li><b>Restart ' + browser + '</b></li></ol>';
        } else {
            steps = '<p style="margin:0 0 12px;opacity:0.7">Permission was denied.</p>' +
                '<ol style="margin:0;padding-left:20px;line-height:1.8">' +
                '<li>Click 🔒 in the address bar</li><li>Set to <b>Allow</b></li><li>Reload</li></ol>';
        }
        var m = document.createElement('div');
        m.style.cssText = 'position:fixed;inset:0;z-index:100001;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)';
        m.innerHTML = '<div style="background:#1c1d1e;border:1px solid rgba(255,255,255,0.08);border-radius:16px;max-width:480px;width:90%;padding:24px;color:#e6edf3">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;font-weight:700">' +
            '<span>' + title + '</span><button onclick="this.closest(\'div[style]\').parentElement.remove()" style="background:none;border:none;color:#8b949e;font-size:1.2rem;cursor:pointer">✕</button></div>' +
            steps +
            '<div style="display:flex;gap:8px;margin-top:18px;justify-content:flex-end">' +
            '<button class="rec-perm-retry" style="background:#ff5065;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.85rem">🔄 Retry</button></div></div>';
        document.body.appendChild(m);
        m.addEventListener('click', function (e) { if (e.target === m) m.remove(); });
        m.querySelector('.rec-perm-retry').addEventListener('click', function () { m.remove(); startRecording(); });
    }

    // =========================================
    // WHITEBOARD
    // =========================================
    var wbState = { tool: 'pen', color: '#ffffff', size: 3, drawing: false, strokes: [], current: null, shapeStart: null };

    function wbPos(e) {
        var c = els.wbCanvas, r = c.getBoundingClientRect();
        return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
    }
    function wbDown(e) {
        wbState.drawing = true;
        var p = wbPos(e), isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (wbState.tool === 'pen' || wbState.tool === 'eraser') {
            wbState.current = { tool: wbState.tool, color: wbState.tool === 'eraser' ? (isLight ? '#fff' : '#1a1a2e') : wbState.color, size: wbState.tool === 'eraser' ? wbState.size * 4 : wbState.size, points: [p] };
        } else { wbState.shapeStart = p; }
    }
    function wbMove(e) {
        if (!wbState.drawing) return;
        var p = wbPos(e);
        if (wbState.tool === 'pen' || wbState.tool === 'eraser') { if (wbState.current) { wbState.current.points.push(p); wbRedraw(); } }
        else { wbRedraw(); wbShapePreview(p); }
    }
    function wbUp(e) {
        if (!wbState.drawing) return;
        wbState.drawing = false;
        if (wbState.tool === 'pen' || wbState.tool === 'eraser') {
            if (wbState.current && wbState.current.points.length > 1) wbState.strokes.push(wbState.current);
            wbState.current = null;
        } else if (wbState.shapeStart && e) {
            wbState.strokes.push({ tool: wbState.tool, color: wbState.color, size: wbState.size, start: wbState.shapeStart, end: wbPos(e) });
            wbState.shapeStart = null;
        }
        wbRedraw();
    }
    function wbRedraw() {
        var c = els.wbCanvas, ctx = c.getContext('2d'), isLight = document.documentElement.getAttribute('data-theme') === 'light';
        ctx.fillStyle = isLight ? '#fff' : '#1a1a2e';
        ctx.fillRect(0, 0, c.width, c.height);
        wbState.strokes.forEach(function (s) { wbDrawStroke(ctx, s); });
        if (wbState.current) wbDrawStroke(ctx, wbState.current);
    }
    function wbDrawStroke(ctx, s) {
        ctx.strokeStyle = s.color; ctx.lineWidth = s.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (s.points) {
            ctx.beginPath(); ctx.moveTo(s.points[0].x, s.points[0].y);
            for (var i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
            ctx.stroke();
        } else if (s.start && s.end) wbShape(ctx, s.tool, s.start, s.end, s.color, s.size);
    }
    function wbShape(ctx, tool, a, b, color, size) {
        ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.beginPath();
        if (tool === 'line') { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
        else if (tool === 'rect') { ctx.rect(a.x, a.y, b.x - a.x, b.y - a.y); }
        else if (tool === 'circle') { ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2); }
        ctx.stroke();
    }
    function wbShapePreview(p) { if (wbState.shapeStart) wbShape(els.wbCanvas.getContext('2d'), wbState.tool, wbState.shapeStart, p, wbState.color, wbState.size); }
    function wbClear() { wbState.strokes = []; wbState.current = null; wbRedraw(); showToast('🗑️ Board cleared', 'info'); }

    // =========================================
    // OPEN / CLOSE
    // =========================================
    function open() {
        buildUI();
        els.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setMode(state.mode);
    }

    function close() {
        if (state.status === 'recording' || state.status === 'paused') {
            if (!confirm('Recording in progress. Stop and close?')) return;
            stopRecording();
        }
        stopTeleprompter();
        cleanupStreams();
        if (els.overlay) els.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showToast(msg, type) {
        if (M.showToast) M.showToast(msg, type);
        else console.log('[RecStudio] ' + msg);
    }

    // =========================================
    // PUBLIC API
    // =========================================
    M.openRecStudio = open;
    M.closeRecStudio = close;
    if (M.registerFormattingAction) M.registerFormattingAction('rec-studio', open);
    M._recStudio = { open: open, close: close, getState: function () { return state; } };

})(window.MDView);
