// ============================================
// ai-assistant.js — AI Panel Core, Model Management, Worker Lifecycle
// Chat UI → ai-chat.js | Actions → ai-actions.js | Image → ai-image.js
// ============================================
(function (M) {
  'use strict';

  // --- Local aliases for shared MDView globals ---
  const markdownEditor = M.markdownEditor;
  const closeMobileMenu = M.closeMobileMenu || function () { };
  const previewPane = M.previewPane;

  // ========================================
  // AI ASSISTANT — Multi-model: Qwen 3.5 (local) + Groq Llama 3.3 70B (cloud)
  // ========================================

  const aiPanel = document.getElementById('ai-panel');
  const aiPanelOverlay = document.getElementById('ai-panel-overlay');
  const aiToggleBtn = document.getElementById('ai-toggle-button');
  const mobileAiBtn = document.getElementById('mobile-ai-button');
  const aiPanelCloseBtn = document.getElementById('ai-panel-close');
  const aiClearChatBtn = document.getElementById('ai-clear-chat');
  const aiChatArea = document.getElementById('ai-chat-area');
  const aiInput = document.getElementById('ai-input');
  const aiSendBtn = document.getElementById('ai-send-btn');
  const aiConsentModal = document.getElementById('ai-consent-modal');
  const aiConsentCancel = document.getElementById('ai-consent-cancel');
  const aiConsentDownload = document.getElementById('ai-consent-download');
  const aiProgressSection = document.getElementById('ai-download-progress');
  const aiProgressBar = document.getElementById('ai-progress-bar');
  const aiProgressStatus = document.getElementById('ai-progress-status');
  const aiProgressDetail = document.getElementById('ai-progress-detail');
  const aiDeviceLabel = document.getElementById('ai-device-label');
  const aiDeviceDetail = document.getElementById('ai-device-detail');
  const aiContextMenu = document.getElementById('ai-context-menu');
  const aiModelBadge = document.getElementById('ai-model-badge');
  const aiModelBtn = document.getElementById('ai-model-btn');
  const aiModelLabel = document.getElementById('ai-model-label');
  const aiModelBtnIcon = document.getElementById('ai-model-btn-icon');
  const aiModelDropdown = document.getElementById('ai-model-dropdown');
  const aiModelSelector = aiModelBtn ? aiModelBtn.closest('.ai-model-selector') : null;
  const aiApikeyModal = document.getElementById('ai-apikey-modal');
  const aiApikeyCancel = document.getElementById('ai-apikey-cancel');
  const aiApikeySave = document.getElementById('ai-apikey-save');
  const aiGroqKeyInput = document.getElementById('ai-groq-key-input');
  const aiApikeyError = document.getElementById('ai-apikey-error');

  // --- Per-model local worker state ---
  // Map of modelId -> { worker, loaded }
  const localWorkers = {};

  function isLocalModel(id) {
    const cfg = _models[id];
    return cfg && cfg.isLocal;
  }
  function getLocalState(id) {
    if (!localWorkers[id]) localWorkers[id] = { worker: null, loaded: false };
    return localWorkers[id];
  }

  let aiIsGenerating = false;
  let aiMessageIdCounter = 0;
  let aiPanelOpen = false;
  let currentAiModel = localStorage.getItem(M.KEYS.AI_MODEL) || 'qwen-local';
  let streamingMessageId = null;
  let pendingProviderForKey = null; // Which provider the API key modal is open for
  let pendingAiMessage = null; // Queued message to send after model loads

  // --- Build CLOUD_PROVIDERS dynamically from the central AI_MODELS config ---
  const _models = window.AI_MODELS || {};
  const CLOUD_PROVIDERS = {};
  Object.keys(_models).forEach(id => {
    const cfg = _models[id];
    if (cfg.isLocal) return; // skip local models — handled separately
    // Per-provider runtime state (kept in closure)
    const _state = {
      key: localStorage.getItem(cfg.keyStorageKey) || null,
      worker: null,
      loaded: false,
    };
    CLOUD_PROVIDERS[id] = Object.assign({}, cfg, {
      getKey: () => _state.key,
      setKey: (k) => { _state.key = k; },
      getWorker: () => _state.worker,
      setWorker: (w) => { _state.worker = w; },
      isLoaded: () => _state.loaded,
      setLoaded: (v) => { _state.loaded = v; },
    });
  });

  // Unified helpers
  function getActiveWorker() {
    if (isLocalModel(currentAiModel)) {
      const ls = getLocalState(currentAiModel);
      return ls.worker;
    }
    const p = CLOUD_PROVIDERS[currentAiModel];
    return p ? p.getWorker() : null;
  }
  function isCurrentModelReady() {
    if (isLocalModel(currentAiModel)) {
      const ls = getLocalState(currentAiModel);
      return ls.loaded;
    }
    const p = CLOUD_PROVIDERS[currentAiModel];
    return p ? p.isLoaded() : false;
  }

  // --- Check WebGPU on page load (for consent dialog) ---
  (async function checkGPU() {
    if (navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          aiDeviceLabel.textContent = 'WebGPU Available ✓';
          aiDeviceDetail.textContent = 'Fast GPU-accelerated inference';
          return;
        }
      } catch (e) { /* fall through */ }
    }
    aiDeviceLabel.textContent = 'WebGPU Not Available';
    aiDeviceDetail.textContent = 'Will use WASM (slower but functional)';
  })();

  // --- Initialize model selector UI on load ---
  function initModelSelectorUI() {
    buildModelDropdown();
    updateModelUI(currentAiModel);
  }

  // Build dropdown buttons dynamically from AI_MODELS
  function buildModelDropdown() {
    if (!aiModelDropdown) return;
    aiModelDropdown.innerHTML = '';
    Object.keys(_models).forEach(id => {
      const cfg = _models[id];
      if (cfg.isImageModel) return; // image models only in per-card selectors
      const btn = document.createElement('button');
      btn.className = 'ai-model-option' + (id === currentAiModel ? ' active' : '');
      btn.dataset.model = id;
      btn.innerHTML = `<i class="${cfg.icon}"></i><div><strong>${cfg.dropdownName}</strong><small>${cfg.dropdownDesc}</small></div>`;
      btn.addEventListener('click', () => {
        aiModelSelector.classList.remove('open');
        if (id === currentAiModel) return;
        const provider = CLOUD_PROVIDERS[id];
        if (provider) {
          if (!provider.getKey()) { showApiKeyModal(id); return; }
          switchToModel(id);
        } else if (cfg.requiresHighEnd) {
          // Show warning before switching to high-end local models
          showHighEndWarning(id, () => switchToModel(id));
        } else {
          switchToModel(id);  // local model
        }
      });
      aiModelDropdown.appendChild(btn);
    });
  }
  initModelSelectorUI();

  function updateModelUI(mid) {
    const cfg = _models[mid];
    if (cfg) {
      if (aiModelLabel) aiModelLabel.textContent = cfg.label;
      if (aiModelBtnIcon) { aiModelBtnIcon.className = cfg.icon; }
      if (aiModelBadge) aiModelBadge.textContent = cfg.badge;
    }
  }

  // --- Model Selector Dropdown ---
  if (aiModelBtn) {
    aiModelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      aiModelSelector.classList.toggle('open');
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (aiModelSelector && !aiModelSelector.contains(e.target)) {
      aiModelSelector.classList.remove('open');
    }
  });

  function switchToModel(modelId) {
    currentAiModel = modelId;
    localStorage.setItem(M.KEYS.AI_MODEL, modelId);
    updateModelUI(modelId);

    // Update active option
    if (aiModelDropdown) {
      aiModelDropdown.querySelectorAll('.ai-model-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.model === modelId);
      });
    }

    if (isLocalModel(modelId)) {
      const ls = getLocalState(modelId);
      const consentKey = M.KEYS.AI_CONSENTED_PREFIX + modelId;
      if (!ls.loaded && !ls.worker) {
        if (localStorage.getItem(consentKey)) {
          initAiWorker(modelId);
          addAiStatusBar('loading', 'Loading cached model...');
        } else {
          const cfg = _models[modelId];
          addAiStatusBar('loading', `${cfg.dropdownName} not loaded — click AI button to download`);
        }
      } else if (ls.loaded) {
        const cfg = _models[modelId];
        addAiStatusBar('ready', cfg.statusReady);
      }
    } else {
      const provider = CLOUD_PROVIDERS[modelId];
      if (provider) {
        if (!provider.isLoaded() && !provider.getWorker()) {
          initCloudWorker(modelId);
        }
        if (provider.isLoaded()) {
          addAiStatusBar('ready', provider.statusReady);
        }
      }
    }
  }

  // --- API Key Modal (shared by all cloud providers) ---
  const aiApikeyTitle = document.getElementById('ai-apikey-title');
  const aiApikeyDesc = document.getElementById('ai-apikey-desc');
  const aiApikeyIcon = document.getElementById('ai-apikey-icon');
  const aiApikeyLink = document.getElementById('ai-apikey-link');

  function showApiKeyModal(providerId) {
    pendingProviderForKey = providerId;
    const provider = CLOUD_PROVIDERS[providerId];
    if (!provider) return;

    // Update dialog with provider-specific info
    if (aiApikeyTitle) aiApikeyTitle.textContent = provider.dialogTitle;
    if (aiApikeyDesc) aiApikeyDesc.innerHTML = provider.dialogDesc;
    if (aiApikeyIcon) aiApikeyIcon.className = provider.dialogIcon;
    if (aiApikeyLink) {
      aiApikeyLink.href = provider.dialogLink;
      aiApikeyLink.textContent = provider.dialogLinkText;
    }
    aiGroqKeyInput.placeholder = provider.dialogPlaceholder;
    aiGroqKeyInput.value = provider.getKey() || '';

    aiApikeyModal.style.display = 'flex';
    aiApikeyError.style.display = 'none';
    aiApikeySave.disabled = false;
    aiApikeySave.innerHTML = '<i class="bi bi-check-lg me-1"></i> Connect';
    setTimeout(() => aiGroqKeyInput.focus(), 100);
  }

  function hideApiKeyModal() {
    aiApikeyModal.style.display = 'none';
    pendingProviderForKey = null;
  }

  if (aiApikeyCancel) aiApikeyCancel.addEventListener('click', hideApiKeyModal);
  if (aiApikeyModal) {
    aiApikeyModal.addEventListener('click', (e) => {
      if (e.target === aiApikeyModal) hideApiKeyModal();
    });
  }

  if (aiApikeySave) {
    aiApikeySave.addEventListener('click', () => {
      const key = aiGroqKeyInput.value.trim();
      const providerId = pendingProviderForKey;
      const provider = CLOUD_PROVIDERS[providerId];
      if (!key || !provider) {
        aiApikeyError.textContent = 'Please enter your API key.';
        aiApikeyError.style.display = 'block';
        return;
      }

      aiApikeySave.disabled = true;
      aiApikeySave.innerHTML = '<span class="ai-status-spinner"></span> Validating...';
      aiApikeyError.style.display = 'none';

      // Save key
      provider.setKey(key);
      localStorage.setItem(provider.keyStorageKey, key);

      // Init worker to validate key
      initCloudWorker(providerId, () => {
        hideApiKeyModal();
        switchToModel(providerId);
      }, (errorMsg) => {
        aiApikeySave.disabled = false;
        aiApikeySave.innerHTML = '<i class="bi bi-check-lg me-1"></i> Connect';
        aiApikeyError.textContent = errorMsg;
        aiApikeyError.style.display = 'block';
        provider.setKey(null);
        localStorage.removeItem(provider.keyStorageKey);
      });
    });
  }

  // Handle Enter key in API key input
  if (aiGroqKeyInput) {
    aiGroqKeyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        aiApikeySave.click();
      }
    });
  }

  // --- Panel Toggle ---
  function openAiPanel() {
    // Always open the panel first — never block with a consent/download dialog
    aiPanel.style.display = 'flex';
    aiPanelOverlay.classList.add('active');
    void aiPanel.offsetWidth;
    aiPanel.classList.add('ai-panel-open');
    aiToggleBtn.classList.add('ai-active');
    aiPanelOpen = true;
    document.body.classList.add('ai-panel-active');
    aiInput.focus();

    // Then handle model loading in the background
    if (isLocalModel(currentAiModel)) {
      const ls = getLocalState(currentAiModel);
      const consentKey = M.KEYS.AI_CONSENTED_PREFIX + currentAiModel;
      if (!ls.loaded && !ls.worker) {
        if (localStorage.getItem(consentKey)) {
          // Model was previously downloaded — auto-load from cache
          initAiWorker(currentAiModel);
          addAiStatusBar('loading', 'Loading cached model...');
        }
        // Otherwise do nothing — user can pick a cloud model or send a message
        // to trigger the consent dialog
      }
      return;
    }

    // Any cloud model — check if ready
    const cloudProvider = CLOUD_PROVIDERS[currentAiModel];
    if (cloudProvider && !cloudProvider.isLoaded() && !cloudProvider.getWorker()) {
      if (!cloudProvider.getKey()) {
        showApiKeyModal(currentAiModel);
        return;
      }
      initCloudWorker(currentAiModel);
    }
  }

  function closeAiPanel() {
    aiPanel.classList.remove('ai-panel-open');
    aiPanelOverlay.classList.remove('active');
    aiToggleBtn.classList.remove('ai-active');
    aiPanelOpen = false;
    document.body.classList.remove('ai-panel-active');
    setTimeout(() => {
      if (!aiPanelOpen) aiPanel.style.display = 'none';
    }, 300);
  }

  function toggleAiPanel() {
    if (aiPanelOpen) closeAiPanel();
    else openAiPanel();
  }

  if (aiToggleBtn) aiToggleBtn.addEventListener('click', toggleAiPanel);
  if (mobileAiBtn) mobileAiBtn.addEventListener('click', () => {
    closeMobileMenu();
    toggleAiPanel();
  });
  if (aiPanelCloseBtn) aiPanelCloseBtn.addEventListener('click', closeAiPanel);
  // Overlay is pass-through — panel closes via the X button only

  // --- AI Panel Resize (drag left edge) ---
  const aiResizeDivider = document.getElementById('ai-resize-divider');

  // Restore saved width
  const savedAiWidth = localStorage.getItem(M.KEYS.AI_PANEL_WIDTH);
  if (savedAiWidth) {
    const w = parseInt(savedAiWidth, 10);
    if (w >= 250 && w <= window.innerWidth * 0.6) {
      document.documentElement.style.setProperty('--ai-panel-width', w + 'px');
    }
  }

  if (aiResizeDivider) {
    let aiResizing = false;
    let aiResizeStartX = 0;
    let aiResizeStartWidth = 0;

    function startAiResize(e) {
      e.preventDefault();
      aiResizing = true;
      aiResizeStartX = e.clientX || e.touches[0].clientX;
      aiResizeStartWidth = aiPanel.offsetWidth;
      aiResizeDivider.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleAiResize);
      document.addEventListener('mouseup', stopAiResize);
      document.addEventListener('touchmove', handleAiResize, { passive: false });
      document.addEventListener('touchend', stopAiResize);
    }

    function handleAiResize(e) {
      if (!aiResizing) return;
      e.preventDefault();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      if (clientX == null) return;
      const delta = aiResizeStartX - clientX;
      const newWidth = Math.min(Math.max(aiResizeStartWidth + delta, 250), window.innerWidth * 0.6);
      document.documentElement.style.setProperty('--ai-panel-width', newWidth + 'px');
    }

    function stopAiResize() {
      if (!aiResizing) return;
      aiResizing = false;
      aiResizeDivider.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleAiResize);
      document.removeEventListener('mouseup', stopAiResize);
      document.removeEventListener('touchmove', handleAiResize);
      document.removeEventListener('touchend', stopAiResize);
      // Persist width
      const currentWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ai-panel-width'));
      if (currentWidth) localStorage.setItem(M.KEYS.AI_PANEL_WIDTH, currentWidth);
    }

    aiResizeDivider.addEventListener('mousedown', startAiResize);
    aiResizeDivider.addEventListener('touchstart', startAiResize, { passive: false });
  }

  // --- Consent Dialog (standalone popup — works without AI panel) ---
  let _consentTargetModel = null; // which model the consent dialog is for

  function showAiConsentDialog(modelId) {
    modelId = modelId || currentAiModel;
    _consentTargetModel = modelId;
    const cfg = _models[modelId];
    const modelName = (cfg && cfg.dropdownName) || 'Qwen 3.5';
    const dlSize = (cfg && cfg.downloadSize) || '~500 MB';

    // Update dialog content dynamically
    const titleEl = aiConsentModal.querySelector('.ai-consent-header h4');
    const descEl = aiConsentModal.querySelector('.ai-consent-header p');
    const sizeEl = aiConsentModal.querySelector('.ai-consent-info .ai-consent-row:first-child strong');
    if (titleEl) titleEl.textContent = 'Enable AI \u2014 ' + modelName;
    if (descEl) descEl.innerHTML = 'Powered by <strong>' + modelName + '</strong> \u2014 runs 100% locally in your browser';
    if (sizeEl) sizeEl.textContent = 'One-time download: ' + dlSize;

    aiConsentModal.style.display = 'flex';
    aiProgressSection.style.display = 'none';
    aiConsentDownload.disabled = false;
    aiConsentDownload.innerHTML = '<i class="bi bi-download me-1"></i> Download & Enable AI';
  }

  function hideAiConsentDialog() {
    aiConsentModal.style.display = 'none';
    _consentTargetModel = null;
  }

  aiConsentCancel.addEventListener('click', hideAiConsentDialog);
  aiConsentModal.addEventListener('click', (e) => {
    if (e.target === aiConsentModal) hideAiConsentDialog();
  });

  aiConsentDownload.addEventListener('click', () => {
    const targetModel = _consentTargetModel || currentAiModel;
    aiConsentDownload.disabled = true;
    aiConsentDownload.innerHTML = '<span class="ai-status-spinner"></span> Loading...';
    aiProgressSection.style.display = 'block';
    localStorage.setItem(M.KEYS.AI_CONSENTED_PREFIX + targetModel, 'true');
    if (targetModel === 'qwen-local') localStorage.setItem(M.KEYS.AI_CONSENTED, 'true');
    initAiWorker(targetModel);
  });

  // --- High-end device warning for 4B model ---
  function showHighEndWarning(modelId, onConfirm) {
    const cfg = _models[modelId];
    const overlay = document.createElement('div');
    overlay.className = 'ai-highend-warning-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10001;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = `
      <div style="background:var(--color-canvas-default,#0d1117);border:1px solid var(--color-border-default,#30363d);border-radius:12px;padding:24px;max-width:420px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.4)">
        <h3 style="margin:0 0 12px;color:var(--color-fg-default,#e6edf3);font-size:1.1rem">
          <i class="bi bi-exclamation-triangle" style="color:#f0b429;margin-right:6px"></i>
          High-End Device Recommended
        </h3>
        <p style="color:var(--color-fg-muted,#8b949e);font-size:0.9rem;margin:0 0 8px;line-height:1.5">
          <strong>${cfg.dropdownName}</strong> requires a <strong>${cfg.downloadSize}</strong> download
          and <strong>8 GB+ GPU VRAM</strong>.
        </p>
        <p style="color:var(--color-fg-muted,#8b949e);font-size:0.85rem;margin:0 0 16px;line-height:1.4">
          This model may not run well on phones, tablets, or older laptops. For most devices,
          the <strong>0.8B</strong> or <strong>2B</strong> model is recommended.
        </p>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="highend-cancel" style="background:transparent;color:var(--color-fg-muted,#8b949e);border:1px solid var(--color-border-default,#30363d);border-radius:6px;padding:6px 16px;cursor:pointer;font-size:0.85rem">Cancel</button>
          <button id="highend-continue" style="background:var(--color-accent-emphasis,#2f81f7);color:#fff;border:none;border-radius:6px;padding:6px 16px;cursor:pointer;font-size:0.85rem;font-weight:500"><i class="bi bi-check-lg me-1"></i>Continue Anyway</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#highend-cancel').addEventListener('click', () => {
      overlay.remove();
    });
    overlay.querySelector('#highend-continue').addEventListener('click', () => {
      overlay.remove();
      if (onConfirm) onConfirm();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  // --- Worker Lifecycle for Local Models ---
  function initAiWorker(modelId) {
    modelId = modelId || 'qwen-local';
    const ls = getLocalState(modelId);
    if (ls.worker) return;

    const cfg = _models[modelId];
    const localModelOnnxId = (cfg && cfg.localModelId) || 'textagent/Qwen3.5-0.8B-ONNX';
    const modelLabel = (cfg && cfg.label) || 'Qwen 3.5';

    const workerPath = (cfg && cfg.workerFile) || 'ai-worker.js';
    const worker = new Worker(workerPath, { type: 'module' });
    ls.worker = worker;

    // Send model ID before loading
    worker.postMessage({ type: 'setModelId', modelId: localModelOnnxId, modelLabel: modelLabel, architecture: cfg && cfg.architecture, dtype: cfg && cfg.dtype });

    // Track download progress per file
    const fileProgress = {};

    worker.addEventListener('message', (e) => {
      const msg = e.data;

      switch (msg.type) {
        case 'progress': {
          // Track per-file progress
          fileProgress[msg.file] = {
            loaded: msg.loaded || 0,
            total: msg.total || 0,
            progress: msg.progress || 0
          };

          // Throttle DOM updates to prevent dialog shaking
          if (!initAiWorker._progressThrottle) {
            initAiWorker._progressThrottle = true;
            requestAnimationFrame(() => {
              // Calculate overall progress
              let totalLoaded = 0, totalSize = 0;
              Object.values(fileProgress).forEach(fp => {
                totalLoaded += fp.loaded;
                totalSize += fp.total;
              });
              const overallPercent = totalSize > 0 ? Math.round((totalLoaded / totalSize) * 100) : 0;

              // Update consent modal progress (if visible)
              if (aiProgressBar) aiProgressBar.style.width = overallPercent + '%';
              if (aiProgressStatus) aiProgressStatus.textContent = `Downloading model... ${overallPercent}%`;

              const mbLoaded = (totalLoaded / 1024 / 1024).toFixed(1);
              const mbTotal = (totalSize / 1024 / 1024).toFixed(1);
              if (aiProgressDetail) aiProgressDetail.textContent = `${mbLoaded} MB / ${mbTotal} MB`;

              // Also update inline progress in AI panel
              const dlLabel = (cfg && cfg.dropdownName) || 'Qwen 3.5';
              updateAiInlineProgress(overallPercent, `Downloading ${dlLabel}... ${overallPercent}%`, `${mbLoaded} / ${mbTotal} MB`);

              setTimeout(() => { initAiWorker._progressThrottle = false; }, 200);
            });
          }
          break;
        }

        case 'status':
          if (aiProgressStatus) aiProgressStatus.textContent = msg.message;
          // Also show status in the inline panel bar
          addAiStatusBar('loading', msg.message);
          break;

        case 'loaded':
          ls.loaded = true;
          // Remember consent so we skip the dialog next time
          localStorage.setItem(M.KEYS.AI_CONSENTED_PREFIX + modelId, 'true');
          // Backward compat: also set the old key for qwen-local
          if (modelId === 'qwen-local') localStorage.setItem(M.KEYS.AI_CONSENTED, 'true');
          hideAiConsentDialog();
          // Don't force the AI panel open — the user may be downloading
          // from a DocGen card, context menu, or toolbar action.
          // Add a status bar — show current model name
          if (currentAiModel === modelId) {
            const readyLabel = (cfg && cfg.statusReady) || 'Qwen 3.5 · Local';
            addAiStatusBar('ready', `${readyLabel} (${msg.device.toUpperCase()})`);
          }
          aiInput.focus();
          // Replay any queued message that was waiting for the model to load
          M._ai.replayPendingMessage();
          break;

        case 'complete':
          M._ai.handleAiResponse(msg.text, msg.messageId);
          break;

        case 'error':
          if (!ls.loaded) {
            // Clear consent so user gets the dialog again
            localStorage.removeItem(M.KEYS.AI_CONSENTED_PREFIX + modelId);
            if (modelId === 'qwen-local') localStorage.removeItem(M.KEYS.AI_CONSENTED);
            // Model failed to load — show error in consent dialog and allow retry
            if (aiConsentModal.style.display === 'flex') {
              aiProgressStatus.textContent = '❌ ' + msg.message;
              aiProgressBar.style.width = '0%';
              aiProgressBar.style.background = '#f87171';
              aiConsentDownload.disabled = false;
              aiConsentDownload.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i> Retry Download';
            } else {
              // Was auto-loading from cache — show error in panel
              M._ai.addAiStatusBar('error', msg.message);
            }
            // Reset worker so user can retry
            if (ls.worker) { ls.worker.terminate(); ls.worker = null; }
          } else {
            M._ai.handleAiError(msg.message, msg.messageId);
          }
          break;
      }
    });

    // Handle worker-level crashes (network failure, script error, etc.)
    worker.addEventListener('error', (e) => {
      console.error('AI Worker error:', e);
      ls.loaded = false;
      if (ls.worker) { ls.worker.terminate(); ls.worker = null; }
      // If consent dialog is open, show error there
      if (aiConsentModal.style.display === 'flex') {
        aiProgressStatus.textContent = '❌ Worker failed to initialize. Check your connection and retry.';
        aiProgressBar.style.width = '0%';
        aiConsentDownload.disabled = false;
        aiConsentDownload.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i> Retry Download';
      } else {
        // Panel is open but model died — show re-download notice
        addAiStatusBar('error', 'Model unavailable — click AI button to re-download');
      }
    });

    worker.postMessage({ type: 'load' });
  }

  // --- Groq Worker Lifecycle ---
  // --- Generic Cloud Worker Initializer (works for any provider) ---
  function initCloudWorker(providerId, onSuccess, onError) {
    const provider = CLOUD_PROVIDERS[providerId];
    if (!provider) return;

    if (provider.getWorker()) {
      if (provider.isLoaded()) {
        if (onSuccess) onSuccess();
        return;
      }
    }

    // Terminate existing worker if re-initializing
    if (provider.getWorker()) { provider.getWorker().terminate(); provider.setWorker(null); }
    provider.setLoaded(false);

    const worker = new Worker(provider.workerFile, { type: 'module' });
    provider.setWorker(worker);

    worker.addEventListener('message', (e) => {
      const msg = e.data;

      switch (msg.type) {
        case 'status':
          addAiStatusBar('loading', msg.message);
          break;

        case 'loaded':
          provider.setLoaded(true);
          if (currentAiModel === providerId) {
            addAiStatusBar('ready', provider.statusReady);
          }
          if (onSuccess) { onSuccess(); onSuccess = null; }
          // Replay any queued message that was waiting for this cloud model
          M._ai.replayPendingMessage();
          break;

        case 'token':
          M._ai.handleStreamingToken(msg.token, msg.messageId);
          break;

        case 'complete':
          M._ai.handleGroqComplete(msg.text, msg.messageId);
          break;

        case 'image-complete':
          M._ai.handleImageComplete(msg.imageBase64, msg.mimeType, msg.prompt, msg.messageId);
          break;

        case 'image-error':
          M._ai.handleAiError(msg.message, msg.messageId);
          break;

        case 'error':
          if (!provider.isLoaded()) {
            if (onError) { onError(msg.message); onError = null; }
            else { addAiStatusBar('error', msg.message); }
            if (provider.getWorker()) { provider.getWorker().terminate(); provider.setWorker(null); }
            if (msg.message.includes('Invalid API key') || msg.message.includes('API key')) {
              provider.setKey(null);
              localStorage.removeItem(provider.keyStorageKey);
            }
          } else {
            M._ai.handleAiError(msg.message, msg.messageId);
          }
          break;
      }
    });

    worker.addEventListener('error', (e) => {
      console.error(`${providerId} worker error:`, e);
      provider.setLoaded(false);
      if (provider.getWorker()) { provider.getWorker().terminate(); provider.setWorker(null); }
      const errorMsg = `${provider.dialogTitle.replace('Connect to ', '')} worker failed to initialize.`;
      if (onError) { onError(errorMsg); onError = null; }
      else { addAiStatusBar('error', errorMsg); }
    });

    // Send API key, optional model override, and load
    worker.postMessage({ type: 'setApiKey', apiKey: provider.getKey() });
    if (provider.workerModelId) {
      worker.postMessage({ type: 'setModelId', modelId: provider.workerModelId });
    }
    worker.postMessage({ type: 'load' });
  }

  // --- Send to AI (routes to active model's worker) ---

  // --- Status Bar ---
  function addAiStatusBar(status, text) {
    // Remove existing status bar
    const existing = aiPanel.querySelector('.ai-status-bar');
    if (existing) existing.remove();

    const bar = document.createElement('div');
    bar.className = 'ai-status-bar';
    bar.innerHTML = `<span class="ai-status-dot ${status}"></span> ${text}`;

    // Insert after header
    const header = aiPanel.querySelector('.ai-panel-header');
    header.insertAdjacentElement('afterend', bar);
  }

  // Show inline consent bar for Qwen download (falls through to popup)
  function showInlineDownloadConsent(modelId) {
    modelId = modelId || currentAiModel;
    // Use the standalone popup instead of inline bar
    showAiConsentDialog(modelId);
  }

  /**
   * Public API: show the standalone model download popup.
   * Can be called from anywhere (DocGen, context menu, toolbar, etc.)
   * without opening the AI sidebar.
   */
  function showModelDownloadPopup(modelId) {
    modelId = modelId || currentAiModel;
    const cfg = _models[modelId];
    if (!cfg || !cfg.isLocal) return;

    const ls = getLocalState(modelId);
    if (ls.loaded) return; // already loaded, nothing to do

    const consentKey = M.KEYS.AI_CONSENTED_PREFIX + modelId;
    const hasConsent = localStorage.getItem(consentKey)
      || (modelId === 'qwen-local' && localStorage.getItem(M.KEYS.AI_CONSENTED));

    if (hasConsent) {
      // Already consented — just load from cache
      if (!ls.worker) {
        initAiWorker(modelId);
      }
      return;
    }

    // Show the consent popup (works without AI panel open)
    if (cfg.requiresHighEnd) {
      showHighEndWarning(modelId, () => showAiConsentDialog(modelId));
    } else {
      showAiConsentDialog(modelId);
    }
  }

  // Show or update an inline download progress bar in the AI panel
  function updateAiInlineProgress(percent, statusText, detailText) {
    let bar = aiPanel.querySelector('.ai-status-bar.downloading');
    if (!bar) {
      // Remove any existing non-download status bar
      const existing = aiPanel.querySelector('.ai-status-bar');
      if (existing) existing.remove();

      bar = document.createElement('div');
      bar.className = 'ai-status-bar downloading';
      bar.innerHTML = `
        <div class="ai-status-text">
          <span class="ai-download-status"><span class="ai-status-spinner"></span> ${statusText}</span>
          <span class="ai-download-detail">${detailText}</span>
        </div>
        <div class="ai-inline-progress">
          <div class="ai-inline-progress-fill" style="width: ${percent}%"></div>
        </div>
      `;
      const header = aiPanel.querySelector('.ai-panel-header');
      header.insertAdjacentElement('afterend', bar);
    } else {
      const fill = bar.querySelector('.ai-inline-progress-fill');
      const statusEl = bar.querySelector('.ai-download-status');
      const detailEl = bar.querySelector('.ai-download-detail');
      if (fill) fill.style.width = percent + '%';
      if (statusEl) statusEl.innerHTML = `<span class="ai-status-spinner"></span> ${statusText}`;
      if (detailEl) detailEl.textContent = detailText;
    }
  }

  function sendToAi(taskType, context, userPrompt, attachments) {
    // If a local model is selected but not loaded yet, show inline consent before downloading
    if (isLocalModel(currentAiModel)) {
      const ls = getLocalState(currentAiModel);
      const consentKey = M.KEYS.AI_CONSENTED_PREFIX + currentAiModel;
      const hasConsent = localStorage.getItem(consentKey) || (currentAiModel === 'qwen-local' && localStorage.getItem(M.KEYS.AI_CONSENTED));

      if (!ls.loaded && !ls.worker) {
        pendingAiMessage = { taskType, context, userPrompt, attachments };
        if (hasConsent) {
          initAiWorker(currentAiModel);
          addAiStatusBar('loading', 'Loading cached model — your message will be sent automatically...');
        } else {
          const cfg = _models[currentAiModel];
          if (cfg && cfg.requiresHighEnd) {
            showHighEndWarning(currentAiModel, () => {
              showInlineDownloadConsent(currentAiModel);
            });
          } else {
            showInlineDownloadConsent(currentAiModel);
          }
        }
        return;
      }

      if (!ls.loaded && ls.worker) {
        pendingAiMessage = { taskType, context, userPrompt, attachments };
        addAiStatusBar('loading', 'Model still loading — your message will be sent automatically...');
        return;
      }
    }

    const cloudProvider = CLOUD_PROVIDERS[currentAiModel];
    if (cloudProvider && !cloudProvider.isLoaded()) {
      pendingAiMessage = { taskType, context, userPrompt, attachments };
      if (!cloudProvider.getWorker()) {
        if (!cloudProvider.getKey()) {
          showApiKeyModal(currentAiModel);
          return;
        }
        initCloudWorker(currentAiModel);
      }
      addAiStatusBar('loading', 'Connecting to cloud model — your message will be sent automatically...');
      return;
    }

    const activeWorker = getActiveWorker();
    const isReady = isCurrentModelReady();

    if (!isReady || !activeWorker) {
      addAiStatusBar('error', 'Model not ready. Please select a model or check your API key.');
      return;
    }
    if (aiIsGenerating) return;

    aiIsGenerating = true;
    aiSendBtn.disabled = true;
    const messageId = ++aiMessageIdCounter;
    streamingMessageId = messageId;

    const thinkingToggle = document.getElementById('ai-thinking-toggle');
    const enableThinking = thinkingToggle ? thinkingToggle.checked : false;

    // Show user message in chat (if not already shown)
    const displayText = userPrompt || `[${taskType}] ${context ? context.substring(0, 80) + '...' : ''}`;
    if (!document.querySelector('.ai-message-user:last-child') ||
      aiChatArea.lastElementChild?.querySelector('.ai-msg-bubble')?.textContent !== displayText) {
      M._ai.addUserMessage(displayText);
    }
    M._ai.addTypingIndicator();

    activeWorker.postMessage({
      type: 'generate',
      taskType,
      context,
      userPrompt,
      messageId,
      enableThinking,
      attachments: attachments || []
    });
  }

  // =============================================
  // M._ai — Internal namespace for cross-module access
  // Used by ai-chat.js, ai-actions.js, ai-image.js
  // =============================================
  M._ai = {};
  Object.defineProperties(M._ai, {
    isGenerating: {
      get: function () { return aiIsGenerating; },
      set: function (v) { aiIsGenerating = v; }
    },
    messageIdCounter: {
      get: function () { return aiMessageIdCounter; },
      set: function (v) { aiMessageIdCounter = v; }
    },
    streamingMessageId: {
      get: function () { return streamingMessageId; },
      set: function (v) { streamingMessageId = v; }
    },
    pendingMessage: {
      get: function () { return pendingAiMessage; },
      set: function (v) { pendingAiMessage = v; }
    },
    currentModel: {
      get: function () { return currentAiModel; }
    },
    panelOpen: {
      get: function () { return aiPanelOpen; },
      set: function (v) { aiPanelOpen = v; }
    }
  });
  M._ai.CLOUD_PROVIDERS = CLOUD_PROVIDERS;
  M._ai.models = _models;
  M._ai.isLocalModel = isLocalModel;
  M._ai.getLocalState = getLocalState;
  M._ai.getActiveWorker = getActiveWorker;
  M._ai.isCurrentModelReady = isCurrentModelReady;
  M._ai.addAiStatusBar = addAiStatusBar;
  M._ai.showInlineDownloadConsent = showInlineDownloadConsent;
  M._ai.updateAiInlineProgress = updateAiInlineProgress;
  M._ai.showHighEndWarning = showHighEndWarning;
  M._ai.showModelDownloadPopup = showModelDownloadPopup;
  M._ai.initAiWorker = initAiWorker;
  M._ai.initCloudWorker = initCloudWorker;
  M._ai.showApiKeyModal = showApiKeyModal;
  M._ai.hideApiKeyModal = hideApiKeyModal;
  M._ai.sendToAi = sendToAi;

  // --- Expose for other modules ---
  M.aiPanelOpen = false;
  Object.defineProperty(M, "aiPanelOpen", {
    get: function () { return aiPanelOpen; },
    set: function (v) { aiPanelOpen = v; }
  });
  M.openAiPanel = openAiPanel;
  M.closeAiPanel = closeAiPanel;
  M.hideAiConsentDialog = typeof hideAiConsentDialog !== "undefined" ? hideAiConsentDialog : function () { };
  M.hideApiKeyModal = typeof hideApiKeyModal !== "undefined" ? hideApiKeyModal : function () { };
  M.showModelDownloadPopup = showModelDownloadPopup;

  // ===========================================================
  // Public AI Request API — for non-chat modules (e.g. ai-docgen)
  // ===========================================================
  M.requestAiTask = function ({ taskType, context, userPrompt, enableThinking, onToken, silent, attachments }) {
    return new Promise(function (resolve, reject) {
      // Block if another generation is in progress
      if (aiIsGenerating) {
        return reject(new Error('Another AI generation is already in progress.'));
      }

      var activeWorker = getActiveWorker();
      var isReady = isCurrentModelReady();

      if (!isReady || !activeWorker) {
        return reject(new Error('AI model not ready. Please select a model or check your API key.'));
      }

      aiIsGenerating = true;
      if (aiSendBtn) aiSendBtn.disabled = true;

      var messageId = ++aiMessageIdCounter;
      var accumulated = '';
      var finished = false;

      function onWorkerMessage(e) {
        var msg = e.data;
        if (msg.messageId !== messageId) return; // not ours

        switch (msg.type) {
          case 'token':
            accumulated += msg.token;
            if (onToken) {
              try { onToken(msg.token, accumulated); } catch (_) { /* ignore callback errors */ }
            }
            break;

          case 'complete':
            cleanup();
            resolve(msg.text || accumulated);
            break;

          case 'error':
            cleanup();
            reject(new Error(msg.message || 'AI generation failed.'));
            break;
        }
      }

      function cleanup() {
        if (finished) return;
        finished = true;
        aiIsGenerating = false;
        if (aiSendBtn) aiSendBtn.disabled = false;
        activeWorker.removeEventListener('message', onWorkerMessage);
      }

      activeWorker.addEventListener('message', onWorkerMessage);

      activeWorker.postMessage({
        type: 'generate',
        taskType: taskType || 'generate',
        context: context || '',
        userPrompt: userPrompt || '',
        messageId: messageId,
        enableThinking: !!enableThinking,
        attachments: attachments || []
      });
    });
  };

  M.isAiGenerating = function () { return aiIsGenerating; };

  // Expose model management for docgen setup flow
  M.showApiKeyModal = showApiKeyModal;
  M.switchToModel = switchToModel;
  M.getCloudProviders = function () { return CLOUD_PROVIDERS; };
  M.getCurrentAiModel = function () { return currentAiModel; };
  M.isCurrentModelReady = isCurrentModelReady;
  M.initLocalAiWorker = function (modelId) { showModelDownloadPopup(modelId || currentAiModel); };
  M.initCloudWorker = initCloudWorker;

})(window.MDView);
