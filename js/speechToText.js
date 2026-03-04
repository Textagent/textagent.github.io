// ============================================
// speechToText.js — Voice Dictation with Markdown Commands
// Uses the Web Speech API (zero dependencies)
// ============================================
(function () {
    'use strict';

    const M = window.MDView;
    if (!M) { console.warn('speechToText: MDView not found'); return; }

    // ── Feature Detection ──────────────────────────
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('speechToText: Web Speech API not supported in this browser');
        // Hide mic buttons if API unavailable
        document.querySelectorAll('#speech-to-text-btn, #mobile-speech-btn').forEach(b => b.style.display = 'none');
        return;
    }

    // ── State ──────────────────────────────────────
    let recognition = null;
    let isListening = false;
    let lastResultTime = Date.now();
    let pauseTimer = null;
    const PAUSE_THRESHOLD = 3000; // ms — auto paragraph after 3s silence
    const STORAGE_LANG_KEY = 'mdview-speech-lang';

    // ── Supported Languages ────────────────────────
    const LANGUAGES = [
        { code: 'en-US', label: 'English (US)', short: 'EN' },
        { code: 'en-GB', label: 'English (UK)', short: 'EN' },
        { code: 'es-ES', label: 'Español', short: 'ES' },
        { code: 'fr-FR', label: 'Français', short: 'FR' },
        { code: 'de-DE', label: 'Deutsch', short: 'DE' },
        { code: 'it-IT', label: 'Italiano', short: 'IT' },
        { code: 'pt-BR', label: 'Português (BR)', short: 'PT' },
        { code: 'ru-RU', label: 'Русский', short: 'RU' },
        { code: 'zh-CN', label: '中文 (简体)', short: '中' },
        { code: 'ja-JP', label: '日本語', short: 'JP' },
        { code: 'ko-KR', label: '한국어', short: 'KO' },
        { code: 'ar-SA', label: 'العربية', short: 'AR' },
        { code: 'hi-IN', label: 'हिन्दी', short: 'HI' },
        { code: 'bn-IN', label: 'বাংলা', short: 'BN' },
    ];

    let currentLang = localStorage.getItem(STORAGE_LANG_KEY) || 'en-US';

    // ── Voice-to-Markdown Replacements ─────────────
    function applyMarkdownCommands(text) {
        const replacements = [
            // Headings
            [/\bnew heading\b/gi, '\n# '],
            [/\bheading one\b/gi, '\n# '],
            [/\bheading two\b/gi, '\n## '],
            [/\bsub heading\b/gi, '\n## '],
            [/\bheading three\b/gi, '\n### '],
            [/\bheading four\b/gi, '\n#### '],
            // Formatting (wrapping)
            [/\bbold\b\s+(.+?)\s+\bend bold\b/gi, '**$1**'],
            [/\bitalic\b\s+(.+?)\s+\bend italic\b/gi, '*$1*'],
            [/\bcode\b\s+(.+?)\s+\bend code\b/gi, '`$1`'],
            // Structure
            [/\bnew line\b/gi, '\n'],
            [/\bnew paragraph\b/gi, '\n\n'],
            [/\bbullet point\b/gi, '\n- '],
            [/\bdash point\b/gi, '\n- '],
            [/\bnumbered list\b/gi, '\n1. '],
            [/\bnumber list\b/gi, '\n1. '],
            [/\btask list\b/gi, '\n- [ ] '],
            [/\bcheck list\b/gi, '\n- [ ] '],
            [/\bblock quote\b/gi, '\n> '],
            [/\bhorizontal rule\b/gi, '\n\n---\n\n'],
            [/\bcode block\b/gi, '\n```\n'],
            [/\bend block\b/gi, '\n```\n'],
            // Punctuation
            [/\bperiod\b/gi, '.'],
            [/\bfull stop\b/gi, '.'],
            [/\bcomma\b/gi, ','],
            [/\bquestion mark\b/gi, '?'],
            [/\bexclamation mark\b/gi, '!'],
            [/\bexclamation point\b/gi, '!'],
            [/\bcolon\b/gi, ':'],
            [/\bsemicolon\b/gi, ';'],
            [/\bsemi colon\b/gi, ';'],
            [/\bopen parenthesis\b/gi, '('],
            [/\bclose parenthesis\b/gi, ')'],
            [/\bhyphen\b/gi, '-'],
            [/\bdash\b/gi, ' — '],
        ];

        let result = text;
        for (const [pattern, replacement] of replacements) {
            result = result.replace(pattern, replacement);
        }
        return result;
    }

    // ── Auto-Capitalize ───────────────────────────
    function autoCapitalize(text) {
        // Capitalize after sentence-ending punctuation
        return text.replace(/([.!?]\s+)([a-z])/g, (_, p, ch) => p + ch.toUpperCase());
    }

    // ── Insert Text at Cursor ─────────────────────
    function insertAtCursor(text) {
        const editor = M.markdownEditor;
        if (!editor) return;

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const before = editor.value.substring(0, start);
        const after = editor.value.substring(end);

        editor.value = before + text + after;
        const newPos = start + text.length;
        editor.selectionStart = editor.selectionEnd = newPos;

        // Trigger preview update
        editor.dispatchEvent(new Event('input'));
        // Scroll cursor into view
        editor.blur();
        editor.focus();
    }

    // ── DOM References ────────────────────────────
    const micBtn = document.getElementById('speech-to-text-btn');
    const mobileMicBtn = document.getElementById('mobile-speech-btn');
    const statusBar = document.getElementById('speech-status-bar');
    const interimText = document.getElementById('speech-interim-text');
    const langLabel = document.getElementById('speech-lang-label');
    const langBtn = document.getElementById('speech-lang-btn');
    const stopBtn = document.getElementById('speech-stop-btn');

    // ── Language Dropdown ─────────────────────────
    let langDropdown = null;

    function createLangDropdown() {
        if (langDropdown) { langDropdown.remove(); }
        langDropdown = document.createElement('div');
        langDropdown.className = 'speech-lang-dropdown';
        langDropdown.innerHTML = LANGUAGES.map(l =>
            `<button class="speech-lang-option${l.code === currentLang ? ' active' : ''}" data-lang="${l.code}">
                <span class="speech-lang-short">${l.short}</span>
                <span>${l.label}</span>
            </button>`
        ).join('');
        langDropdown.addEventListener('click', (e) => {
            const opt = e.target.closest('.speech-lang-option');
            if (!opt) return;
            currentLang = opt.dataset.lang;
            localStorage.setItem(STORAGE_LANG_KEY, currentLang);
            const langObj = LANGUAGES.find(l => l.code === currentLang);
            if (langLabel) langLabel.textContent = langObj ? langObj.short : currentLang.split('-')[0].toUpperCase();
            closeLangDropdown();
            // Restart recognition with new language
            if (isListening) {
                stopListening();
                setTimeout(() => startListening(), 300);
            }
        });
        statusBar.appendChild(langDropdown);
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', closeLangOnOutsideClick, { once: true });
        }, 50);
    }

    function closeLangOnOutsideClick(e) {
        if (langDropdown && !langDropdown.contains(e.target) && e.target !== langBtn) {
            closeLangDropdown();
        }
    }

    function closeLangDropdown() {
        if (langDropdown) { langDropdown.remove(); langDropdown = null; }
    }

    // ── Recognition Setup ─────────────────────────
    function createRecognition() {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = currentLang;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            console.log('🎤 Speech recognition started');
            isListening = true;
            lastResultTime = Date.now();
            updateUI(true);
            startPauseDetection();
        };

        recognition.onresult = (event) => {
            lastResultTime = Date.now();
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            // Show interim text in status bar
            if (interimText) {
                interimText.textContent = interimTranscript || '';
            }

            // Process and insert final text
            if (finalTranscript) {
                let processed = applyMarkdownCommands(finalTranscript);
                processed = autoCapitalize(processed);
                insertAtCursor(processed);
                if (interimText) interimText.textContent = '';
            }
        };

        recognition.onerror = (event) => {
            console.warn('🎤 Speech recognition error:', event.error);
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                showToast('Microphone access denied. Please allow microphone permissions.', 'error');
                stopListening();
            } else if (event.error === 'no-speech') {
                // Ignore — just means silence
            } else if (event.error === 'network') {
                showToast('Speech recognition requires an internet connection (Chrome).', 'error');
                stopListening();
            } else if (event.error === 'aborted') {
                // Normal stop, ignore
            }
        };

        recognition.onend = () => {
            console.log('🎤 Speech recognition ended');
            // Auto-restart if still supposed to be listening (browser stops after silence)
            if (isListening) {
                try {
                    recognition.lang = currentLang;
                    recognition.start();
                } catch (e) {
                    console.warn('🎤 Could not restart:', e);
                    stopListening();
                }
            }
        };
    }

    // ── Pause Detection (auto paragraph) ──────────
    function startPauseDetection() {
        stopPauseDetection();
        pauseTimer = setInterval(() => {
            if (!isListening) { stopPauseDetection(); return; }
            const elapsed = Date.now() - lastResultTime;
            if (elapsed >= PAUSE_THRESHOLD) {
                // Check if we already have trailing newlines
                const editor = M.markdownEditor;
                if (editor && !editor.value.endsWith('\n\n') && editor.value.length > 0) {
                    insertAtCursor('\n\n');
                }
                lastResultTime = Date.now(); // Reset to avoid repeating
            }
        }, 1000);
    }

    function stopPauseDetection() {
        if (pauseTimer) { clearInterval(pauseTimer); pauseTimer = null; }
    }

    // ── Start / Stop ──────────────────────────────
    function startListening() {
        if (isListening) return;
        if (!recognition) createRecognition();
        recognition.lang = currentLang;
        try {
            recognition.start();
        } catch (e) {
            console.warn('🎤 Start failed:', e);
            // Recreate and retry
            createRecognition();
            try { recognition.start(); } catch (e2) {
                showToast('Could not start voice dictation.', 'error');
            }
        }
    }

    function stopListening() {
        isListening = false;
        stopPauseDetection();
        closeLangDropdown();
        if (recognition) {
            try { recognition.stop(); } catch (e) { /* ignore */ }
        }
        updateUI(false);
        if (interimText) interimText.textContent = '';
    }

    function toggleListening() {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }

    // ── UI Updates ────────────────────────────────
    function updateUI(active) {
        // Toolbar mic button
        if (micBtn) {
            micBtn.classList.toggle('speech-active', active);
            micBtn.innerHTML = active
                ? '<i class="bi bi-mic-fill"></i>'
                : '<i class="bi bi-mic"></i>';
            micBtn.title = active ? 'Stop Dictation' : 'Voice Dictation (Speech to Text)';
        }
        // Mobile button
        if (mobileMicBtn) {
            mobileMicBtn.classList.toggle('speech-active', active);
            if (active) {
                mobileMicBtn.innerHTML = '<i class="bi bi-mic-fill me-2"></i> Stop Dictation';
            } else {
                mobileMicBtn.innerHTML = '<i class="bi bi-mic me-2"></i> Voice Dictation';
            }
        }
        // Status bar
        if (statusBar) {
            statusBar.style.display = active ? 'flex' : 'none';
        }
        // Lang label
        if (langLabel) {
            const langObj = LANGUAGES.find(l => l.code === currentLang);
            langLabel.textContent = langObj ? langObj.short : currentLang.split('-')[0].toUpperCase();
        }
    }

    // ── Toast Helper ──────────────────────────────
    function showToast(message, type) {
        // Use existing toast if available, otherwise create a simple one
        const existing = document.querySelector('.speech-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `speech-toast speech-toast-${type || 'info'}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('speech-toast-show'));
        setTimeout(() => {
            toast.classList.remove('speech-toast-show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ── Event Listeners ───────────────────────────
    if (micBtn) micBtn.addEventListener('click', toggleListening);
    if (mobileMicBtn) mobileMicBtn.addEventListener('click', () => {
        toggleListening();
        // Close mobile menu
        if (M.mobileMenuPanel) M.mobileMenuPanel.classList.remove('show');
        if (M.mobileMenuOverlay) M.mobileMenuOverlay.classList.remove('show');
    });
    if (langBtn) langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (langDropdown) { closeLangDropdown(); }
        else { createLangDropdown(); }
    });
    if (stopBtn) stopBtn.addEventListener('click', stopListening);

    // Keyboard shortcut: Ctrl+Shift+V to toggle
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'V') {
            e.preventDefault();
            toggleListening();
        }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (isListening) stopListening();
    });

    // ── Expose to MDView ──────────────────────────
    M.speechToText = {
        start: startListening,
        stop: stopListening,
        toggle: toggleListening,
        isListening: () => isListening,
    };

    console.log('🎤 speechToText module loaded');
})();
