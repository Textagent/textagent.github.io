// ============================================
// ai-assistant.js — AI Panel, Multi-model Support, Chat
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
  let currentAiModel = localStorage.getItem('md-viewer-ai-model') || 'qwen-local';
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
    localStorage.setItem('md-viewer-ai-model', modelId);
    updateModelUI(modelId);

    // Update active option
    if (aiModelDropdown) {
      aiModelDropdown.querySelectorAll('.ai-model-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.model === modelId);
      });
    }

    if (isLocalModel(modelId)) {
      const ls = getLocalState(modelId);
      const consentKey = 'md-viewer-ai-consented-' + modelId;
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
        if (!aiPanelOpen) openAiPanel();
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
      const consentKey = 'md-viewer-ai-consented-' + currentAiModel;
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
  const savedAiWidth = localStorage.getItem('md-viewer-ai-panel-width');
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
      if (currentWidth) localStorage.setItem('md-viewer-ai-panel-width', currentWidth);
    }

    aiResizeDivider.addEventListener('mousedown', startAiResize);
    aiResizeDivider.addEventListener('touchstart', startAiResize, { passive: false });
  }

  // --- Consent Dialog ---
  function showAiConsentDialog() {
    aiConsentModal.style.display = 'flex';
    aiProgressSection.style.display = 'none';
    aiConsentDownload.disabled = false;
    aiConsentDownload.innerHTML = '<i class="bi bi-download me-1"></i> Download & Enable AI';
  }

  function hideAiConsentDialog() {
    aiConsentModal.style.display = 'none';
  }

  aiConsentCancel.addEventListener('click', hideAiConsentDialog);
  aiConsentModal.addEventListener('click', (e) => {
    if (e.target === aiConsentModal) hideAiConsentDialog();
  });

  aiConsentDownload.addEventListener('click', () => {
    aiConsentDownload.disabled = true;
    aiConsentDownload.innerHTML = '<span class="ai-status-spinner"></span> Loading...';
    aiProgressSection.style.display = 'block';
    initAiWorker(currentAiModel);
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
    const localModelOnnxId = (cfg && cfg.localModelId) || 'onnx-community/Qwen3.5-0.8B-ONNX';
    const modelLabel = (cfg && cfg.label) || 'Qwen 3.5';

    const worker = new Worker('ai-worker.js', { type: 'module' });
    ls.worker = worker;

    // Send model ID before loading
    worker.postMessage({ type: 'setModelId', modelId: localModelOnnxId, modelLabel: modelLabel });

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
          localStorage.setItem('md-viewer-ai-consented-' + modelId, 'true');
          // Backward compat: also set the old key for qwen-local
          if (modelId === 'qwen-local') localStorage.setItem('md-viewer-ai-consented', 'true');
          hideAiConsentDialog();
          // Open the panel if not already open
          if (!aiPanelOpen) {
            aiPanel.style.display = 'flex';
            aiPanelOverlay.classList.add('active');
            void aiPanel.offsetWidth;
            aiPanel.classList.add('ai-panel-open');
            aiToggleBtn.classList.add('ai-active');
            aiPanelOpen = true;
            document.body.classList.add('ai-panel-active');
          }
          // Add a status bar — show current model name
          if (currentAiModel === modelId) {
            const readyLabel = (cfg && cfg.statusReady) || 'Qwen 3.5 · Local';
            addAiStatusBar('ready', `${readyLabel} (${msg.device.toUpperCase()})`);
          }
          aiInput.focus();
          // Replay any queued message that was waiting for the model to load
          replayPendingMessage();
          break;

        case 'complete':
          handleAiResponse(msg.text, msg.messageId);
          break;

        case 'error':
          if (!ls.loaded) {
            // Clear consent so user gets the dialog again
            localStorage.removeItem('md-viewer-ai-consented-' + modelId);
            if (modelId === 'qwen-local') localStorage.removeItem('md-viewer-ai-consented');
            // Model failed to load — show error in consent dialog and allow retry
            if (aiConsentModal.style.display === 'flex') {
              aiProgressStatus.textContent = '❌ ' + msg.message;
              aiProgressBar.style.width = '0%';
              aiProgressBar.style.background = '#f87171';
              aiConsentDownload.disabled = false;
              aiConsentDownload.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i> Retry Download';
            } else {
              // Was auto-loading from cache — show error in panel
              addAiStatusBar('error', msg.message);
            }
            // Reset worker so user can retry
            if (ls.worker) { ls.worker.terminate(); ls.worker = null; }
          } else {
            handleAiError(msg.message, msg.messageId);
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

    const worker = new Worker(provider.workerFile);
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
          replayPendingMessage();
          break;

        case 'token':
          handleStreamingToken(msg.token, msg.messageId);
          break;

        case 'complete':
          handleGroqComplete(msg.text, msg.messageId);
          break;

        case 'image-complete':
          handleImageComplete(msg.imageBase64, msg.mimeType, msg.prompt, msg.messageId);
          break;

        case 'image-error':
          handleAiError(msg.message, msg.messageId);
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
            handleAiError(msg.message, msg.messageId);
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

  // --- Streaming Token Handling ---
  function handleStreamingToken(token, messageId) {
    // Find or create the streaming bubble
    let bubble = document.getElementById('ai-streaming-bubble-' + messageId);

    if (!bubble) {
      // First token — replace typing indicator with an empty AI bubble
      removeTypingIndicator();

      // Remove welcome message
      const welcome = aiChatArea.querySelector('.ai-welcome-message');
      if (welcome) welcome.remove();

      const msg = document.createElement('div');
      msg.className = 'ai-message ai-message-ai';
      msg.id = 'ai-streaming-msg-' + messageId;
      msg.innerHTML = `
      <span class="ai-msg-label">AI</span>
      <div class="ai-msg-bubble" id="ai-streaming-bubble-${messageId}"></div>
    `;
      aiChatArea.appendChild(msg);
      bubble = document.getElementById('ai-streaming-bubble-' + messageId);
    }

    // Append token text (accumulate raw text, then format)
    if (!bubble._rawText) bubble._rawText = '';
    bubble._rawText += token;
    bubble.innerHTML = formatAiResponse(bubble._rawText);

    // Auto-scroll
    aiChatArea.scrollTop = aiChatArea.scrollHeight;
  }

  function handleGroqComplete(text, messageId) {
    aiIsGenerating = false;
    aiSendBtn.disabled = false;
    streamingMessageId = null;

    // Find the streaming message and add action buttons
    const msgEl = document.getElementById('ai-streaming-msg-' + messageId);
    if (msgEl) {
      // Remove the streaming IDs (no longer needed)
      const bubble = document.getElementById('ai-streaming-bubble-' + messageId);
      if (bubble) {
        bubble.removeAttribute('id');
        bubble.innerHTML = formatAiResponse(text);
      }
      msgEl.removeAttribute('id');

      // Add action buttons
      const actions = document.createElement('div');
      actions.className = 'ai-msg-actions';
      actions.innerHTML = `
      <button class="ai-msg-action-btn" data-action="insert" data-text="${encodeURIComponent(text)}" title="Insert into editor">
        <i class="bi bi-box-arrow-in-down"></i> Insert
      </button>
      <button class="ai-msg-action-btn" data-action="copy" data-text="${encodeURIComponent(text)}" title="Copy to clipboard">
        <i class="bi bi-clipboard"></i> Copy
      </button>
      <button class="ai-msg-action-btn" data-action="replace" data-text="${encodeURIComponent(text)}" title="Replace selected text">
        <i class="bi bi-arrow-left-right"></i> Replace
      </button>
    `;
      msgEl.appendChild(actions);

      // Wire up action buttons
      actions.querySelectorAll('.ai-msg-action-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          const action = this.dataset.action;
          const rawText = decodeURIComponent(this.dataset.text);
          handleAiAction(action, rawText, this);
        });
      });
    } else {
      // Fallback if no streaming element found
      removeTypingIndicator();
      addAiMessage(text, messageId);
    }
    aiChatArea.scrollTop = aiChatArea.scrollHeight;
  }

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

  // Show inline consent bar for Qwen download (not a popup)
  function showInlineDownloadConsent(modelId) {
    modelId = modelId || currentAiModel;
    const cfg = _models[modelId];
    const modelName = (cfg && cfg.dropdownName) || 'Qwen 3.5';
    const dlSize = (cfg && cfg.downloadSize) || '~500 MB';

    // Remove any existing status bar
    const existing = aiPanel.querySelector('.ai-status-bar');
    if (existing) existing.remove();

    const bar = document.createElement('div');
    bar.className = 'ai-status-bar ai-consent-inline';
    bar.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:8px;flex-wrap:wrap">
        <span style="font-size:0.82rem"><i class="bi bi-download me-1"></i> ${modelName} requires a one-time <strong>${dlSize}</strong> download (runs locally, 100% private)</span>
        <button id="ai-inline-agree-btn" style="
          background:var(--color-accent-emphasis,#2f81f7);color:#fff;border:none;
          border-radius:6px;padding:4px 14px;font-size:0.8rem;cursor:pointer;
          white-space:nowrap;font-weight:500
        "><i class="bi bi-check-lg me-1"></i>Agree &amp; Download</button>
      </div>
    `;

    const header = aiPanel.querySelector('.ai-panel-header');
    header.insertAdjacentElement('afterend', bar);

    // Wire up the agree button
    const agreeBtn = document.getElementById('ai-inline-agree-btn');
    if (agreeBtn) {
      agreeBtn.addEventListener('click', () => {
        localStorage.setItem('md-viewer-ai-consented-' + modelId, 'true');
        if (modelId === 'qwen-local') localStorage.setItem('md-viewer-ai-consented', 'true');
        initAiWorker(modelId);
        addAiStatusBar('loading', `Downloading ${modelName} — your message will be sent automatically...`);
      });
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

  // --- Chat Messages ---
  function addUserMessage(text) {
    // Remove welcome message
    const welcome = aiChatArea.querySelector('.ai-welcome-message');
    if (welcome) welcome.remove();

    const msg = document.createElement('div');
    msg.className = 'ai-message ai-message-user';
    msg.innerHTML = `
    <span class="ai-msg-label">You</span>
    <div class="ai-msg-bubble">${escapeHtml(text)}</div>
  `;
    aiChatArea.appendChild(msg);
    aiChatArea.scrollTop = aiChatArea.scrollHeight;
  }

  function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'ai-message ai-message-ai';
    indicator.id = 'ai-typing';
    indicator.innerHTML = `
    <span class="ai-msg-label">AI</span>
    <div class="ai-typing-indicator">
      <span class="ai-typing-dot"></span>
      <span class="ai-typing-dot"></span>
      <span class="ai-typing-dot"></span>
    </div>
  `;
    aiChatArea.appendChild(indicator);
    aiChatArea.scrollTop = aiChatArea.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('ai-typing');
    if (indicator) indicator.remove();
  }

  // Track last search results for citation rendering
  var _lastSearchResults = null;

  function addAiMessage(text, messageId) {
    removeTypingIndicator();

    // Remove search indicator if present
    const searchInd = aiChatArea.querySelector('.ai-search-indicator');
    if (searchInd) searchInd.remove();

    // Remove welcome message
    const welcome = aiChatArea.querySelector('.ai-welcome-message');
    if (welcome) welcome.remove();

    const msg = document.createElement('div');
    msg.className = 'ai-message ai-message-ai';

    // Simple markdown-to-html for AI response (basic formatting)
    const formattedText = formatAiResponse(text);

    // Build source citations if we have search results
    let citationsHtml = '';
    if (_lastSearchResults && _lastSearchResults.length > 0) {
      citationsHtml = '<div class="ai-source-citations">';
      const seen = new Set();
      _lastSearchResults.forEach(r => {
        try {
          const domain = new URL(r.url).hostname.replace('www.', '');
          if (!seen.has(domain)) {
            seen.add(domain);
            citationsHtml += `<a class="ai-source-link" href="${r.url}" target="_blank" rel="noopener">`
              + `<i class="bi bi-link-45deg"></i>${domain}</a>`;
          }
        } catch (_) { /* invalid url */ }
      });
      citationsHtml += '</div>';
      _lastSearchResults = null;
    }

    msg.innerHTML = `
    <span class="ai-msg-label">AI</span>
    <div class="ai-msg-bubble">${formattedText}</div>
    ${citationsHtml}
    <div class="ai-msg-actions">
      <button class="ai-msg-action-btn" data-action="insert" data-text="${encodeURIComponent(text)}" title="Insert into editor">
        <i class="bi bi-box-arrow-in-down"></i> Insert
      </button>
      <button class="ai-msg-action-btn" data-action="copy" data-text="${encodeURIComponent(text)}" title="Copy to clipboard">
        <i class="bi bi-clipboard"></i> Copy
      </button>
      <button class="ai-msg-action-btn" data-action="replace" data-text="${encodeURIComponent(text)}" title="Replace selected text">
        <i class="bi bi-arrow-left-right"></i> Replace
      </button>
    </div>
  `;

    aiChatArea.appendChild(msg);
    aiChatArea.scrollTop = aiChatArea.scrollHeight;

    // Wire up action buttons
    msg.querySelectorAll('.ai-msg-action-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const action = this.dataset.action;
        const rawText = decodeURIComponent(this.dataset.text);
        handleAiAction(action, rawText, this);
      });
    });
  }

  function handleAiAction(action, text, btn) {
    switch (action) {
      case 'insert': {
        const pos = markdownEditor.selectionStart;
        const before = markdownEditor.value.substring(0, pos);
        const after = markdownEditor.value.substring(pos);
        markdownEditor.value = before + '\n' + text + '\n' + after;
        markdownEditor.dispatchEvent(new Event('input'));
        btn.innerHTML = '<i class="bi bi-check-lg"></i> Inserted';
        setTimeout(() => { btn.innerHTML = '<i class="bi bi-box-arrow-in-down"></i> Insert'; }, 1500);
        break;
      }
      case 'copy': {
        navigator.clipboard.writeText(text).then(() => {
          btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied';
          setTimeout(() => { btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy'; }, 1500);
        });
        break;
      }
      case 'replace': {
        const start = markdownEditor.selectionStart;
        const end = markdownEditor.selectionEnd;
        if (start === end) {
          // No selection, insert instead
          handleAiAction('insert', text, btn);
          return;
        }
        markdownEditor.value = markdownEditor.value.substring(0, start) + text + markdownEditor.value.substring(end);
        markdownEditor.dispatchEvent(new Event('input'));
        btn.innerHTML = '<i class="bi bi-check-lg"></i> Replaced';
        setTimeout(() => { btn.innerHTML = '<i class="bi bi-arrow-left-right"></i> Replace'; }, 1500);
        break;
      }
    }
  }

  function handleAiResponse(text, messageId) {
    aiIsGenerating = false;
    aiSendBtn.disabled = false;
    addAiMessage(text, messageId);
  }

  function handleAiError(message, messageId) {
    aiIsGenerating = false;
    aiSendBtn.disabled = false;
    removeTypingIndicator();

    const msg = document.createElement('div');
    msg.className = 'ai-message ai-message-ai';
    msg.innerHTML = `
    <span class="ai-msg-label">AI</span>
    <div class="ai-msg-bubble" style="border-color: var(--color-danger-fg); color: var(--color-danger-fg);">
      <i class="bi bi-exclamation-triangle"></i> ${escapeHtml(message)}
    </div>
  `;
    aiChatArea.appendChild(msg);
    aiChatArea.scrollTop = aiChatArea.scrollHeight;
  }

  function formatAiResponse(text) {
    // Basic markdown formatting for AI responses
    let html = escapeHtml(text);

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    // Sanitize the final output to prevent any XSS
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['pre', 'code', 'strong', 'em', 'br'],
      ALLOWED_ATTR: []
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --- Replay a queued message after model finishes loading ---
  function replayPendingMessage() {
    if (!pendingAiMessage) return;
    const { taskType, context, userPrompt } = pendingAiMessage;
    pendingAiMessage = null;
    sendToAi(taskType, context, userPrompt);
  }

  // --- Send to AI (routes to active model's worker) ---
  function sendToAi(taskType, context, userPrompt) {
    // If a local model is selected but not loaded yet, show inline consent before downloading
    if (isLocalModel(currentAiModel)) {
      const ls = getLocalState(currentAiModel);
      const consentKey = 'md-viewer-ai-consented-' + currentAiModel;
      // Backward compat for old key
      const hasConsent = localStorage.getItem(consentKey) || (currentAiModel === 'qwen-local' && localStorage.getItem('md-viewer-ai-consented'));

      if (!ls.loaded && !ls.worker) {
        // Queue the message so it auto-sends once the model is loaded
        pendingAiMessage = { taskType, context, userPrompt };

        // If already consented (model cached from before), auto-load from cache
        if (hasConsent) {
          initAiWorker(currentAiModel);
          addAiStatusBar('loading', 'Loading cached model — your message will be sent automatically...');
        } else {
          // For high-end models, show warning first
          const cfg = _models[currentAiModel];
          if (cfg && cfg.requiresHighEnd) {
            showHighEndWarning(currentAiModel, () => {
              showInlineDownloadConsent(currentAiModel);
            });
          } else {
            // Show inline consent bar (not a popup) — user must agree before download
            showInlineDownloadConsent(currentAiModel);
          }
        }
        return;
      }

      // If local model is loading (worker exists but model not ready yet), queue the message
      if (!ls.loaded && ls.worker) {
        pendingAiMessage = { taskType, context, userPrompt };
        addAiStatusBar('loading', 'Model still loading — your message will be sent automatically...');
        return;
      }
    }

    // If a cloud model is selected but not ready, prompt for API key or init
    const cloudProvider = CLOUD_PROVIDERS[currentAiModel];
    if (cloudProvider && !cloudProvider.isLoaded()) {
      // Queue the message so it auto-sends once the cloud worker is ready
      pendingAiMessage = { taskType, context, userPrompt };
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

    // Check thinking mode toggle
    const thinkingToggle = document.getElementById('ai-thinking-toggle');
    const enableThinking = thinkingToggle ? thinkingToggle.checked : false;

    // Show user message in chat (if not already shown by sendChatMessage)
    const displayText = userPrompt || `[${taskType}] ${context ? context.substring(0, 80) + '...' : ''}`;
    // Only add user message if it wasn't already added by the chat input handler
    if (!document.querySelector('.ai-message-user:last-child') ||
      aiChatArea.lastElementChild?.querySelector('.ai-msg-bubble')?.textContent !== displayText) {
      addUserMessage(displayText);
    }
    addTypingIndicator();

    activeWorker.postMessage({
      type: 'generate',
      taskType,
      context,
      userPrompt,
      messageId,
      enableThinking
    });
  }

  // --- Chat Input ---
  aiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });

  // Auto-resize textarea
  aiInput.addEventListener('input', () => {
    aiInput.style.height = 'auto';
    aiInput.style.height = Math.min(aiInput.scrollHeight, 120) + 'px';
  });

  aiSendBtn.addEventListener('click', sendChatMessage);

  function sendChatMessage() {
    const text = aiInput.value.trim();
    if (!text || aiIsGenerating) return;

    // Clear input now — the message will be queued if model isn't ready
    aiInput.value = '';
    aiInput.style.height = 'auto';

    // Show the user's message immediately in chat for feedback
    addUserMessage(text);

    // If current model is an image model, route to image generation
    const currentModelCfg = _models[currentAiModel];
    if (currentModelCfg && currentModelCfg.isImageModel) {
      generateImage(text, selectedAspectRatio);
      return;
    }

    // Detect if it's a Q&A about the document or a generation request
    const editorContent = markdownEditor.value;
    const isQuestion = /^(what|who|where|when|why|how|is |are |do |does |can |could |would |should |explain|tell me|describe)/i.test(text);

    // Web search integration — if search is enabled, search first then augment context
    if (M.webSearch && M.webSearch.isSearchEnabled()) {
      // Show search indicator
      const searchIndicator = document.createElement('div');
      searchIndicator.className = 'ai-search-indicator';
      searchIndicator.innerHTML = '<i class="bi bi-globe-americas"></i> Searching the web...';
      aiChatArea.appendChild(searchIndicator);
      aiChatArea.scrollTop = aiChatArea.scrollHeight;

      M.webSearch.performSearch(text).then(results => {
        const searchContext = M.webSearch.formatResultsForLLM(results);
        _lastSearchResults = results;

        // Remove search indicator (addAiMessage will also remove it, but just in case)
        const ind = aiChatArea.querySelector('.ai-search-indicator');
        if (ind) ind.remove();

        // Combine search results with document context
        let context = searchContext;
        if (isQuestion && editorContent.trim()) {
          context = searchContext + '\n\n[Document Content]\n' + editorContent;
        }

        sendToAi(isQuestion && editorContent.trim() ? 'qa' : 'generate', context || null, text);
      }).catch(() => {
        // Search failed — proceed without search
        const ind = aiChatArea.querySelector('.ai-search-indicator');
        if (ind) ind.remove();
        if (isQuestion && editorContent.trim()) {
          sendToAi('qa', editorContent, text);
        } else {
          sendToAi('generate', null, text);
        }
      });
      return;
    }

    if (isQuestion && editorContent.trim()) {
      sendToAi('qa', editorContent, text);
    } else {
      sendToAi('generate', null, text);
    }
  }

  // --- Track editor selection so it persists when focus moves to AI panel ---
  let savedSelection = { start: 0, end: 0 };
  markdownEditor.addEventListener('select', () => {
    savedSelection = { start: markdownEditor.selectionStart, end: markdownEditor.selectionEnd };
  });
  markdownEditor.addEventListener('click', () => {
    savedSelection = { start: markdownEditor.selectionStart, end: markdownEditor.selectionEnd };
  });
  markdownEditor.addEventListener('keyup', () => {
    savedSelection = { start: markdownEditor.selectionStart, end: markdownEditor.selectionEnd };
  });

  /**
   * Get a smart text chunk around cursor when no text is selected.
   * Takes ~1500 chars around the cursor position to avoid overloading the model.
   */
  function getSmartChunk(fullText, cursorPos) {
    if (!fullText.trim()) return '';
    const CHUNK_SIZE = 1500;
    if (fullText.length <= CHUNK_SIZE) return fullText;
    let start = Math.max(0, cursorPos - Math.floor(CHUNK_SIZE / 2));
    let end = Math.min(fullText.length, start + CHUNK_SIZE);
    // Snap start to a paragraph boundary (double newline) if possible
    if (start > 0) {
      const paraBreak = fullText.lastIndexOf('\n\n', start + 100);
      if (paraBreak > start - 200 && paraBreak > 0) start = paraBreak + 2;
    }
    // Snap end to a paragraph boundary if possible
    if (end < fullText.length) {
      const paraBreak = fullText.indexOf('\n\n', end - 100);
      if (paraBreak > 0 && paraBreak < end + 200) end = paraBreak;
    }
    return fullText.substring(start, end);
  }

  /**
   * Split text into chunks of ~CHUNK_SIZE characters, breaking at newlines when possible.
   */
  function splitIntoChunks(text, chunkSize = 1500) {
    if (text.length <= chunkSize) return [text];
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      let end = Math.min(start + chunkSize, text.length);
      // Try to break at a newline
      if (end < text.length) {
        const lastNewline = text.lastIndexOf('\n', end);
        if (lastNewline > start + chunkSize * 0.5) end = lastNewline + 1;
      }
      chunks.push(text.substring(start, end));
      start = end;
    }
    return chunks;
  }

  /**
   * Process document in chunks like an agent — step by step, with progress.
   * Returns a promise that resolves when done.
   */
  function processDocumentInChunks(action, fullText) {
    const chunks = splitIntoChunks(fullText);
    const totalChunks = chunks.length;

    addAiMessage(`📄 Processing entire document (${fullText.length} chars) in ${totalChunks} chunk${totalChunks > 1 ? 's' : ''}...`, 'user');

    let chunkIndex = 0;
    const chunkResults = [];

    function processNextChunk() {
      if (chunkIndex >= totalChunks) {
        // All chunks processed — combine results
        if (action === 'summarize' && totalChunks > 1) {
          // Final summary pass: combine chunk summaries
          addAiMessage(`🔗 Combining ${totalChunks} chunk summaries into final summary...`);
          const combined = chunkResults.map((r, i) => `### Part ${i + 1}\n${r}`).join('\n\n');
          sendToAi('summarize', combined, 'Combine these section summaries into one concise final summary.');
        } else if (totalChunks > 1) {
          // For other actions, show combined results
          const combined = chunkResults.join('\n\n---\n\n');
          removeTypingIndicator();
          addAiMessage(combined);
          aiIsGenerating = false;
          aiSendBtn.disabled = false;
        }
        return;
      }

      const chunkNum = chunkIndex + 1;
      addAiMessage(`⏳ Processing chunk ${chunkNum}/${totalChunks}...`);

      aiIsGenerating = true;
      aiSendBtn.disabled = true;
      const messageId = ++aiMessageIdCounter;

      // Check thinking toggle
      const thinkingToggle = document.getElementById('ai-thinking-toggle');
      const enableThinking = thinkingToggle ? thinkingToggle.checked : false;

      // Route to correct worker
      const activeWorker = getActiveWorker();

      // Set up one-time listener for this chunk's response
      const chunkHandler = (e) => {
        const msg = e.data;
        if (msg.messageId !== messageId) return;

        if (msg.type === 'complete') {
          activeWorker.removeEventListener('message', chunkHandler);
          chunkResults.push(msg.text);
          removeTypingIndicator();
          // Show intermediate result
          addAiMessage(`✅ Chunk ${chunkNum}/${totalChunks}: ${msg.text.substring(0, 100)}...`);
          addTypingIndicator();
          chunkIndex++;
          aiIsGenerating = false;
          // Process next chunk after a small delay
          setTimeout(processNextChunk, 100);
        } else if (msg.type === 'error') {
          activeWorker.removeEventListener('message', chunkHandler);
          removeTypingIndicator();
          addAiMessage(`❌ Error on chunk ${chunkNum}: ${msg.message}`);
          aiIsGenerating = false;
          aiSendBtn.disabled = false;
        }
      };
      activeWorker.addEventListener('message', chunkHandler);
      addTypingIndicator();

      activeWorker.postMessage({
        type: 'generate',
        taskType: action,
        context: chunks[chunkIndex],
        userPrompt: null,
        messageId,
        enableThinking
      });
    }

    processNextChunk();
  }

  // --- Quick Action Chips ---
  document.querySelectorAll('.ai-action-chip').forEach(chip => {
    chip.addEventListener('click', function () {
      const action = this.dataset.action;
      // Check editor selection first, then preview selection
      let selectedText = markdownEditor.value.substring(savedSelection.start, savedSelection.end);
      if (!selectedText) {
        const sel = window.getSelection();
        selectedText = sel ? sel.toString().trim() : '';
      }
      const editorContent = markdownEditor.value;

      const isCurrentModelReady2 = isCurrentModelReady();
      if (!isCurrentModelReady2) {
        openAiPanel();
        return;
      }

      // Ensure panel is open
      if (!aiPanelOpen) openAiPanel();

      switch (action) {
        case 'summarize':
        case 'expand':
        case 'rephrase':
        case 'grammar':
        case 'polish':
        case 'formalize':
        case 'elaborate':
        case 'shorten': {
          if (!editorContent.trim() && !selectedText.trim()) {
            addAiMessage('Please add some text in the editor first.');
            return;
          }
          if (selectedText) {
            // Selected text — process directly
            addAiMessage(`Using selected text (${selectedText.length} chars)`, 'user');
            sendToAi(action, selectedText, null);
          } else if (editorContent.length > 1500) {
            // Large document — agent-style chunked processing
            processDocumentInChunks(action, editorContent);
          } else {
            // Small document — process all at once
            addAiMessage(`Using entire document (${editorContent.length} chars)`, 'user');
            sendToAi(action, editorContent, null);
          }
          break;
        }
        case 'explain':
        case 'simplify':
          if (!selectedText) {
            addAiMessage('Please select some text in the editor to explain or simplify.');
            return;
          }
          sendToAi(action, selectedText, `Please ${action} this text.`);
          break;
        case 'autocomplete': {
          const textBeforeCursor = editorContent.substring(0, savedSelection.start);
          if (!textBeforeCursor.trim()) {
            addAiMessage('Place your cursor after some text in the editor to auto-complete.');
            return;
          }
          sendToAi('autocomplete', textBeforeCursor, null);
          break;
        }
        case 'markdown':
          // Focus the input for user to type their request
          aiInput.placeholder = 'Describe what markdown to generate...';
          aiInput.focus();
          break;
      }
    });
  });

  // --- Ctrl+Space for Auto-Complete ---
  markdownEditor.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
      e.preventDefault();
      const isCurrentReady = isCurrentModelReady();
      if (!isCurrentReady) {
        openAiPanel();
        return;
      }
      if (!aiPanelOpen) openAiPanel();

      const textBeforeCursor = markdownEditor.value.substring(0, markdownEditor.selectionStart);
      if (textBeforeCursor.trim()) {
        sendToAi('autocomplete', textBeforeCursor, null);
      }
    }
  });

  // --- Context Menu (on text selection in editor OR preview) ---
  let contextMenuTimeout = null;
  let savedContextText = ''; // Stores selected text from either pane

  // Editor text selection
  markdownEditor.addEventListener('mouseup', (e) => {
    clearTimeout(contextMenuTimeout);
    contextMenuTimeout = setTimeout(() => {
      const selectedText = markdownEditor.value.substring(
        markdownEditor.selectionStart,
        markdownEditor.selectionEnd
      );

      const isEditorCtxReady = isCurrentModelReady();
      if (selectedText && selectedText.length > 2 && isEditorCtxReady) {
        savedContextText = selectedText;
        aiContextMenu.style.left = Math.min(e.clientX, window.innerWidth - 180) + 'px';
        aiContextMenu.style.top = Math.min(e.clientY - 10, window.innerHeight - 250) + 'px';
        aiContextMenu.style.display = 'flex';
      } else {
        aiContextMenu.style.display = 'none';
      }
    }, 300);
  });

  // Preview pane text selection
  if (previewPane) {
    previewPane.addEventListener('mouseup', (e) => {
      clearTimeout(contextMenuTimeout);
      contextMenuTimeout = setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString().trim() : '';

        const isCurrentReady3 = isCurrentModelReady();
        if (selectedText && selectedText.length > 2 && isCurrentReady3) {
          savedContextText = selectedText;
          aiContextMenu.style.left = Math.min(e.clientX, window.innerWidth - 180) + 'px';
          aiContextMenu.style.top = Math.min(e.clientY - 10, window.innerHeight - 250) + 'px';
          aiContextMenu.style.display = 'flex';
        } else {
          aiContextMenu.style.display = 'none';
        }
      }, 300);
    });
  }

  // Hide context menu on click elsewhere
  document.addEventListener('mousedown', (e) => {
    if (aiContextMenu && aiContextMenu.style.display !== 'none' && !aiContextMenu.contains(e.target)) {
      aiContextMenu.style.display = 'none';
    }
  });

  // Context menu actions — attach directly to each button
  function handleContextAction(action) {
    clearTimeout(contextMenuTimeout);
    aiContextMenu.style.display = 'none';

    if (!savedContextText) return;

    // Open panel if needed
    if (!aiPanelOpen) {
      aiPanel.style.display = 'flex';
      aiPanelOverlay.classList.add('active');
      void aiPanel.offsetWidth;
      aiPanel.classList.add('ai-panel-open');
      aiToggleBtn.classList.add('ai-active');
      aiPanelOpen = true;
      document.body.classList.add('ai-panel-active');
    }

    if (['summarize', 'expand', 'rephrase', 'grammar', 'explain', 'simplify', 'polish', 'formalize', 'elaborate', 'shorten'].includes(action)) {
      sendToAi(action, savedContextText, null);
    } else {
      sendToAi(action, savedContextText, `Please ${action} this text.`);
    }
  }

  const ctxBtns = aiContextMenu.querySelectorAll('.ai-ctx-btn');
  ctxBtns.forEach(btn => {
    btn.addEventListener('mousedown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const action = this.dataset.action;
      if (action) {
        // Use setTimeout(0) to let event finish before triggering AI
        setTimeout(() => handleContextAction(action), 0);
      }
    });
  });

  // ===========================================================
  // --- AI Image Generation (Imagen 4 Ultra) ---
  // ===========================================================
  const aiImageModal = document.getElementById('ai-image-modal');
  const aiImagePromptInput = document.getElementById('ai-image-prompt');
  const aiImageGenerateBtn = document.getElementById('ai-image-generate');
  const aiImageCancelBtn = document.getElementById('ai-image-cancel');
  let selectedAspectRatio = '1:1';
  let imagenWorker = null;
  let imagenWorkerReady = false;

  // Aspect ratio pill selection
  if (aiImageModal) {
    aiImageModal.querySelectorAll('.ai-aspect-pill').forEach(pill => {
      pill.addEventListener('click', function () {
        aiImageModal.querySelectorAll('.ai-aspect-pill').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        selectedAspectRatio = this.dataset.ratio;
      });
    });
  }

  function showImageModal() {
    if (!aiImageModal) return;
    aiImageModal.style.display = 'flex';
    if (aiImagePromptInput) {
      aiImagePromptInput.value = '';
      aiImagePromptInput.focus();
    }
    if (aiImageGenerateBtn) {
      aiImageGenerateBtn.disabled = false;
      aiImageGenerateBtn.innerHTML = '<i class="bi bi-stars me-1"></i> Generate';
    }
  }

  function hideImageModal() {
    if (aiImageModal) aiImageModal.style.display = 'none';
  }

  if (aiImageCancelBtn) aiImageCancelBtn.addEventListener('click', hideImageModal);
  if (aiImageModal) {
    aiImageModal.addEventListener('click', (e) => {
      if (e.target === aiImageModal) hideImageModal();
    });
  }

  // Initialize or get the Imagen worker (reuses Gemini API key)
  function getImagenWorker() {
    if (imagenWorker && imagenWorkerReady) return imagenWorker;

    const imagenConfig = window.AI_MODELS?.['imagen-ultra'];
    if (!imagenConfig) return null;

    const geminiKey = localStorage.getItem(imagenConfig.keyStorageKey);
    if (!geminiKey) return null;

    if (imagenWorker) { imagenWorker.terminate(); }
    imagenWorker = new Worker(imagenConfig.workerFile);
    imagenWorkerReady = false;

    imagenWorker.addEventListener('message', (e) => {
      const msg = e.data;
      switch (msg.type) {
        case 'loaded':
          imagenWorkerReady = true;
          break;
        case 'image-complete':
          handleImageComplete(msg.imageBase64, msg.mimeType, msg.prompt, msg.messageId);
          break;
        case 'image-error':
          handleAiError(msg.message, msg.messageId);
          aiIsGenerating = false;
          aiSendBtn.disabled = false;
          break;
        case 'error':
          handleAiError(msg.message, msg.messageId);
          break;
      }
    });

    imagenWorker.postMessage({ type: 'setApiKey', apiKey: geminiKey });
    imagenWorker.postMessage({ type: 'load' });
    return imagenWorker;
  }

  // Handle completed image from worker
  function handleImageComplete(imageBase64, mimeType, prompt, messageId) {
    aiIsGenerating = false;
    aiSendBtn.disabled = false;
    removeTypingIndicator();

    const welcome = aiChatArea.querySelector('.ai-welcome-message');
    if (welcome) welcome.remove();

    const dataUri = `data:${mimeType || 'image/png'};base64,${imageBase64}`;
    const mdText = `![${prompt}](${dataUri})`;

    const msg = document.createElement('div');
    msg.className = 'ai-message ai-message-ai';
    msg.innerHTML = `
      <span class="ai-msg-label">AI</span>
      <div class="ai-msg-bubble ai-image-bubble">
        <div class="ai-image-prompt-label"><i class="bi bi-image me-1"></i> ${escapeHtml(prompt)}</div>
        <img src="${dataUri}" alt="${escapeHtml(prompt)}" class="ai-generated-image" />
      </div>
      <div class="ai-msg-actions">
        <button class="ai-msg-action-btn ai-img-insert-btn" title="Insert image into editor">
          <i class="bi bi-box-arrow-in-down"></i> Insert
        </button>
        <button class="ai-msg-action-btn ai-img-copy-btn" title="Copy markdown">
          <i class="bi bi-clipboard"></i> Copy MD
        </button>
      </div>
    `;
    aiChatArea.appendChild(msg);
    aiChatArea.scrollTop = aiChatArea.scrollHeight;

    // Wire up Insert button
    msg.querySelector('.ai-img-insert-btn').addEventListener('click', function () {
      const pos = markdownEditor.selectionStart;
      const before = markdownEditor.value.substring(0, pos);
      const after = markdownEditor.value.substring(pos);
      markdownEditor.value = before + '\n' + mdText + '\n' + after;
      markdownEditor.dispatchEvent(new Event('input'));
      this.innerHTML = '<i class="bi bi-check-lg"></i> Inserted';
      setTimeout(() => { this.innerHTML = '<i class="bi bi-box-arrow-in-down"></i> Insert'; }, 1500);
    });

    // Wire up Copy button
    msg.querySelector('.ai-img-copy-btn').addEventListener('click', function () {
      navigator.clipboard.writeText(mdText).then(() => {
        this.innerHTML = '<i class="bi bi-check-lg"></i> Copied';
        setTimeout(() => { this.innerHTML = '<i class="bi bi-clipboard"></i> Copy MD'; }, 1500);
      });
    });
  }

  // Generate image from prompt — uses the current image model or defaults to imagen-ultra
  function generateImage(prompt, aspectRatio) {
    // Determine which image model to use
    const currentModelCfg = _models[currentAiModel];
    const imageModelId = (currentModelCfg && currentModelCfg.isImageModel) ? currentAiModel : 'imagen-ultra';
    const provider = CLOUD_PROVIDERS[imageModelId];

    if (!provider) {
      addAiStatusBar('error', 'Image model not configured.');
      return;
    }

    if (!provider.getKey()) {
      showApiKeyModal(imageModelId);
      return;
    }

    // Ensure panel is open
    if (!aiPanelOpen) openAiPanel();

    // Init worker if needed
    if (!provider.getWorker() || !provider.isLoaded()) {
      initCloudWorker(imageModelId, () => {
        _doImageGenerate(provider, prompt, aspectRatio);
      });
      return;
    }

    _doImageGenerate(provider, prompt, aspectRatio);
  }

  function _doImageGenerate(provider, prompt, aspectRatio) {
    aiIsGenerating = true;
    aiSendBtn.disabled = true;
    const messageId = ++aiMessageIdCounter;

    // Only add user message if not already shown (sendChatMessage adds it)
    const lastMsg = aiChatArea.querySelector('.ai-message:last-child .ai-msg-bubble');
    const alreadyShown = lastMsg && lastMsg.textContent.includes(prompt);
    if (!alreadyShown) {
      addUserMessage(`🖼️ Generate: ${prompt}`);
    }
    addTypingIndicator();

    provider.getWorker().postMessage({
      type: 'generate-image',
      prompt,
      aspectRatio: aspectRatio || '1:1',
      messageId,
    });
  }

  // Generate button click
  if (aiImageGenerateBtn) {
    aiImageGenerateBtn.addEventListener('click', () => {
      const prompt = aiImagePromptInput ? aiImagePromptInput.value.trim() : '';
      if (!prompt) {
        if (aiImagePromptInput) aiImagePromptInput.focus();
        return;
      }
      hideImageModal();
      generateImage(prompt, selectedAspectRatio);
    });
  }

  // Enter key in image prompt
  if (aiImagePromptInput) {
    aiImagePromptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (aiImageGenerateBtn) aiImageGenerateBtn.click();
      }
    });
  }

  // Handle the generate-image action chip
  const imageChip = document.getElementById('ai-image-chip');
  if (imageChip) {
    imageChip.addEventListener('click', () => {
      const imagenConfig = window.AI_MODELS?.['imagen-ultra'];
      if (!imagenConfig) return;

      const geminiKey = localStorage.getItem(imagenConfig.keyStorageKey);
      if (!geminiKey) {
        // Need API key first — open panel and show key dialog
        if (!aiPanelOpen) openAiPanel();
        showApiKeyModal('imagen-ultra');
        return;
      }
      showImageModal();
    });
  }

  // Expose for external use
  M.generateImage = generateImage;

  // --- Clear Chat ---
  if (aiClearChatBtn) {
    aiClearChatBtn.addEventListener('click', () => {
      aiChatArea.innerHTML = `
      <div class="ai-welcome-message">
        <div class="ai-welcome-icon"><i class="bi bi-stars"></i></div>
        <h5>AI Assistant</h5>
        <p>Switch models below · Local or Cloud</p>
        <div class="ai-welcome-tips">
          <div class="ai-tip"><i class="bi bi-cursor-text"></i> Select text + use quick actions</div>
          <div class="ai-tip"><i class="bi bi-chat-dots"></i> Ask questions about your document</div>
          <div class="ai-tip"><i class="bi bi-keyboard"></i> <kbd>Ctrl</kbd>+<kbd>Space</kbd> for auto-complete</div>
        </div>
      </div>
    `;
    });
  }

  // --- Web Search Toggle & Provider Selector ---
  (function initSearchUI() {
    const searchToggle = document.getElementById('ai-search-toggle');
    const providerBar = document.getElementById('ai-search-provider-bar');
    const providerSelect = document.getElementById('ai-search-provider-select');
    const keyBtn = document.getElementById('ai-search-key-btn');
    if (!searchToggle || !M.webSearch) return;

    // Restore saved state
    searchToggle.checked = M.webSearch.isSearchEnabled();
    if (searchToggle.checked && providerBar) providerBar.style.display = '';
    if (providerSelect) providerSelect.value = M.webSearch.getActiveProvider();
    updateKeyBtnVisibility();

    // Toggle search on/off
    searchToggle.addEventListener('change', () => {
      M.webSearch.setSearchEnabled(searchToggle.checked);
      if (providerBar) providerBar.style.display = searchToggle.checked ? '' : 'none';
    });

    // Switch provider
    if (providerSelect) {
      providerSelect.addEventListener('change', () => {
        M.webSearch.setActiveProvider(providerSelect.value);
        updateKeyBtnVisibility();
      });
    }

    // Show/hide API key button based on whether provider needs a key
    function updateKeyBtnVisibility() {
      if (!keyBtn) return;
      const p = M.webSearch.PROVIDERS[M.webSearch.getActiveProvider()];
      keyBtn.style.display = (p && p.requiresKey) ? '' : 'none';
    }

    // API key button → show a mini prompt
    if (keyBtn) {
      keyBtn.addEventListener('click', () => {
        const providerId = M.webSearch.getActiveProvider();
        const p = M.webSearch.PROVIDERS[providerId];
        if (!p || !p.requiresKey) return;

        // Reuse the existing AI API key modal by adapting its fields
        const modal = document.getElementById('ai-apikey-modal');
        const titleEl = document.getElementById('ai-apikey-title');
        const descEl = document.getElementById('ai-apikey-desc');
        const inputEl = document.getElementById('ai-groq-key-input');
        const linkEl = document.getElementById('ai-apikey-link');
        const iconEl = document.getElementById('ai-apikey-icon');
        const errorEl = document.getElementById('ai-apikey-error');

        if (modal && titleEl && inputEl) {
          titleEl.textContent = p.dialogTitle || 'API Key';
          if (descEl) descEl.textContent = p.dialogDesc || 'Enter your API key';
          if (iconEl) iconEl.className = p.icon || 'bi bi-key';
          if (linkEl) {
            linkEl.href = p.dialogLink || '#';
            linkEl.textContent = p.dialogLinkText || 'Get API key';
          }
          inputEl.value = M.webSearch.getProviderKey(providerId);
          inputEl.placeholder = p.dialogPlaceholder || 'API key...';
          if (errorEl) errorEl.style.display = 'none';
          modal.style.display = 'flex';

          // Override save handler for search provider key
          const saveBtn = document.getElementById('ai-apikey-save');
          const cancelBtn = document.getElementById('ai-apikey-cancel');
          const onSave = () => {
            M.webSearch.setProviderKey(providerId, inputEl.value.trim());
            modal.style.display = 'none';
            cleanup();
          };
          const onCancel = () => {
            modal.style.display = 'none';
            cleanup();
          };
          function cleanup() {
            saveBtn.removeEventListener('click', onSave);
            cancelBtn.removeEventListener('click', onCancel);
          }
          saveBtn.addEventListener('click', onSave, { once: true });
          cancelBtn.addEventListener('click', onCancel, { once: true });
        }
      });
    }
  })();

  // Expose for other modules
  M.aiPanelOpen = false;
  Object.defineProperty(M, "aiPanelOpen", {
    get: function () { return aiPanelOpen; },
    set: function (v) { aiPanelOpen = v; }
  });
  M.openAiPanel = openAiPanel;
  M.closeAiPanel = closeAiPanel;
  M.hideAiConsentDialog = typeof hideAiConsentDialog !== "undefined" ? hideAiConsentDialog : function () { };
  M.hideApiKeyModal = typeof hideApiKeyModal !== "undefined" ? hideApiKeyModal : function () { };

  // ===========================================================
  // Public AI Request API — for non-chat modules (e.g. ai-docgen)
  // ===========================================================
  M.requestAiTask = function ({ taskType, context, userPrompt, enableThinking, onToken, silent }) {
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
        enableThinking: !!enableThinking
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
  M.initLocalAiWorker = function (modelId) { initAiWorker(modelId || currentAiModel); };
  M.initCloudWorker = initCloudWorker;

})(window.MDView);
