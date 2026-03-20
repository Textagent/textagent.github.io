// ============================================
// modal-templates.js — Inject modal HTML into the page
// Extracted from index.html to reduce its size.
// ============================================
(function () {
    'use strict';

    const modalHTML = `    <!-- Shared View Banner (full bar — auto-hides after 4s) -->
    <div id="shared-view-banner" class="shared-view-banner" style="display: none;">
        <div class="shared-banner-content">
            <i class="bi bi-lock-fill me-2"></i>
            <span>Viewing shared markdown (read-only)</span>
            <button id="shared-banner-edit" class="shared-banner-btn" title="Edit a copy">
                <i class="bi bi-pencil me-1"></i> Edit Copy
            </button>
            <button id="shared-banner-close" class="shared-banner-btn" title="Close">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
    </div>

    <!-- Shared View Pill (collapsed indicator — always visible while viewing shared doc) -->
    <div id="shared-view-pill" class="shared-view-pill" style="display: none;" title="Viewing shared document (read-only) — click to edit">
        <i class="bi bi-lock-fill"></i>
        <span>Read-only</span>
    </div>


    <!-- Share Options Modal (Quick / Secure) -->
    <div id="share-options-modal" class="share-modal" role="dialog" aria-modal="true" aria-label="Share Options">
        <div class="share-modal-content">
            <div class="share-modal-header">
                <h5><i class="bi bi-share me-2"></i>Share Document</h5>
                <button class="share-modal-close" id="share-options-close" title="Close" aria-label="Close">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <div class="share-modal-body">
                <!-- Share Mode Toggle -->
                <div class="share-mode-toggle">
                    <button class="share-mode-btn active" data-mode="quick" id="share-mode-quick">
                        <i class="bi bi-link-45deg"></i> Quick Share
                    </button>
                    <button class="share-mode-btn" data-mode="secure" id="share-mode-secure">
                        <i class="bi bi-shield-lock"></i> Secure Share
                    </button>
                </div>

                <!-- Quick share description -->
                <p class="share-modal-desc" id="share-desc-quick">
                    <i class="bi bi-info-circle me-1"></i>
                    Link contains the encryption key — anyone with the link can view.
                </p>

                <!-- Secure share description + passphrase input -->
                <div id="share-secure-section" style="display:none">
                    <p class="share-modal-desc">
                        <i class="bi bi-shield-check me-1"></i>
                        Content is protected by a password. The link alone cannot decrypt it.
                    </p>
                    <div class="share-form-group">
                        <label for="share-passphrase-input">Password</label>
                        <div class="share-passphrase-wrapper">
                            <input type="password" id="share-passphrase-input" placeholder="Enter a strong password"
                                autocomplete="off" />
                            <button type="button" class="share-pass-toggle" id="share-pass-toggle" title="Show/Hide">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                        <small>Choose something memorable. You'll need to share this separately.</small>
                    </div>
                    <div class="share-form-group">
                        <label for="share-passphrase-confirm">Confirm Password</label>
                        <input type="password" id="share-passphrase-confirm" placeholder="Re-enter password"
                            autocomplete="off" />
                    </div>
                    <div id="share-passphrase-error" class="share-error" style="display:none"></div>
                </div>

                <!-- View Mode Lock (optional) -->
                <div class="share-view-lock-section">
                    <label class="share-view-lock-label"><i class="bi bi-eye me-1"></i> Open in view mode</label>
                    <div class="share-view-lock-pills">
                        <button class="share-view-pill active" data-view="" title="Default (split editor/preview)">Default</button>
                        <button class="share-view-pill" data-view="preview" title="Preview only — no editor"><i class="bi bi-eye me-1"></i>Preview</button>
                        <button class="share-view-pill" data-view="ppt" title="Presentation slides"><i class="bi bi-easel me-1"></i>PPT</button>
                    </div>
                    <small class="share-view-lock-hint">Recipients will only see the selected view and cannot switch modes.</small>
                </div>

                <!-- Previously Shared Versions -->
                <div id="share-versions-section" class="share-versions-section" style="display:none">
                    <label class="share-view-lock-label"><i class="bi bi-clock-history me-1"></i> Previously Shared</label>
                    <div id="share-versions-list" class="share-versions-list"></div>
                </div>
            </div>
            <div class="share-modal-footer">
                <button class="share-btn-secondary" id="share-options-cancel">Cancel</button>
                <button class="share-btn-primary" id="share-do-share">
                    <i class="bi bi-share me-1"></i> Share
                </button>
            </div>
        </div>
    </div>

    <!-- Share Result Modal -->
    <div id="share-result-modal" class="share-modal" role="dialog" aria-modal="true" aria-label="Share Link">
        <div class="share-modal-content share-result-content">
            <div class="share-modal-header">
                <h5><i class="bi bi-check-circle me-2" style="color:#2ea043"></i>Link Generated</h5>
                <button class="share-modal-close" id="share-result-close" title="Close" aria-label="Close">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <div class="share-modal-body">
                <p class="share-modal-desc" id="share-result-desc"><i class="bi bi-shield-lock me-1"></i> Content is
                    encrypted. Only this link
                    can unlock it.</p>
                <div class="share-link-container">
                    <input type="text" id="share-link-input" readonly>
                    <button id="copy-share-link" class="share-btn-primary" title="Copy link">
                        <i class="bi bi-clipboard"></i>
                    </button>
                </div>
                <small class="share-link-note" id="share-result-note"><i class="bi bi-info-circle me-1"></i>The
                    decryption key is in the URL
                    fragment — it's never sent to any server.</small>
                <!-- Download credentials (visible only for secure share) -->
                <div id="share-download-section" style="display:none">
                    <div class="share-credentials-actions">
                        <button class="share-btn-download" id="share-download-credentials">
                            <i class="bi bi-download me-1"></i> Download Credentials (.txt)
                        </button>
                        <button class="share-btn-copy-all" id="share-copy-credentials" title="Copy link and passphrase to clipboard">
                            <i class="bi bi-clipboard me-1"></i> Copy Credentials
                        </button>
                    </div>
                        <small class="share-link-note"><i class="bi bi-exclamation-triangle me-1"></i>Send the password
                        separately from the link for maximum security.</small>
                </div>
                <!-- Email to Self section -->
                <div id="share-email-section">
                    <div class="share-email-header"><i class="bi bi-envelope me-1"></i> Email to Self</div>
                    <input type="email" id="share-email-input" class="share-email-field" placeholder="your@email.com" autocomplete="email" />
                    <input type="text" id="share-email-subject" class="share-email-field" placeholder="Subject (optional)" />
                    <input type="text" id="share-email-website" class="share-email-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
                    <div class="share-email-row">
                        <button class="share-btn-primary" id="share-email-send" title="Send link & file to your email">
                            <i class="bi bi-send me-1"></i> Send
                        </button>
                    </div>
                    <small class="share-link-note" id="share-email-note"><i class="bi bi-info-circle me-1"></i>Sends the share link
                        and .md file directly to your inbox.</small>
                    <div id="share-email-status" class="share-email-status"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Passphrase Prompt Modal (for opening secure links) -->
    <div id="passphrase-prompt-modal" class="share-modal" role="dialog" aria-modal="true" aria-label="Enter Passphrase">
        <div class="share-modal-content passphrase-prompt-content">
            <div class="passphrase-prompt-icon">
                <i class="bi bi-shield-lock-fill"></i>
            </div>
            <h5 class="passphrase-prompt-title">This document is protected</h5>
            <p class="passphrase-prompt-desc">Enter the password to unlock and view this shared document.</p>
            <div class="share-form-group">
                <div class="share-passphrase-wrapper">
                    <input type="password" id="passphrase-unlock-input" placeholder="Enter password"
                        autocomplete="off" />
                    <button type="button" class="share-pass-toggle" id="passphrase-unlock-toggle" title="Show/Hide">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            </div>
            <div id="passphrase-unlock-error" class="share-error" style="display:none"></div>
            <div class="passphrase-prompt-actions">
                <button class="share-btn-primary passphrase-unlock-btn" id="passphrase-unlock-btn">
                    <i class="bi bi-unlock me-1"></i> Unlock
                </button>
            </div>
        </div>
    </div>

    <!-- AI Assistant Panel -->
    <div id="ai-panel" class="ai-panel" style="display:none">
        <div id="ai-resize-divider" class="ai-resize-divider" title="Drag to resize AI panel"></div>
        <div class="ai-panel-header">
            <div class="ai-panel-title">
                <i class="bi bi-stars"></i>
                <span>AI Assistant</span>
                <span class="ai-badge" id="ai-model-badge">Qwen 3.5 · Local</span>
            </div>
            <div class="ai-panel-controls">
                <label class="ai-search-toggle" title="Toggle Web Search">
                    <input type="checkbox" id="ai-search-toggle">
                    <span class="ai-search-slider"></span>
                    <i class="bi bi-globe-americas"></i>
                    <span class="ai-search-label">Search</span>
                </label>
                <button class="ai-panel-btn" id="ai-clear-chat" title="Clear chat"><i class="bi bi-trash3"></i></button>
                <button class="ai-panel-btn" id="ai-panel-close" title="Close"><i class="bi bi-x-lg"></i></button>
            </div>
        </div>

        <div class="ai-search-provider-bar" id="ai-search-provider-bar" style="display:none">
            <div class="ai-search-provider-pills" id="ai-search-provider-pills">
                <label class="ai-provider-pill" data-provider="duckduckgo" title="DuckDuckGo Instant Answers · Entity lookups · Free · No API key">
                    <input type="checkbox" class="ai-provider-check" value="duckduckgo"><span class="ai-provider-pill-label"><i class="bi bi-search"></i> DDG</span>
                </label>
                <label class="ai-provider-pill" data-provider="brave" title="Brave Search · Free tier · 2,000/month">
                    <input type="checkbox" class="ai-provider-check" value="brave"><span class="ai-provider-pill-label"><i class="bi bi-shield-check"></i> Brave</span>
                    <button class="ai-provider-key-btn" data-provider="brave" title="API key"><i class="bi bi-key"></i></button>
                </label>
                <label class="ai-provider-pill" data-provider="serper" title="Serper.dev · Free tier · 2,500 queries">
                    <input type="checkbox" class="ai-provider-check" value="serper"><span class="ai-provider-pill-label"><i class="bi bi-globe2"></i> Serper</span>
                    <button class="ai-provider-key-btn" data-provider="serper" title="API key"><i class="bi bi-key"></i></button>
                </label>
                <label class="ai-provider-pill" data-provider="tavily" title="Tavily · AI-optimized · 1,000/month free">
                    <input type="checkbox" class="ai-provider-check" value="tavily"><span class="ai-provider-pill-label"><i class="bi bi-robot"></i> Tavily</span>
                    <button class="ai-provider-key-btn" data-provider="tavily" title="API key"><i class="bi bi-key"></i></button>
                </label>
                <label class="ai-provider-pill" data-provider="google_cse" title="Google CSE · 100/day free">
                    <input type="checkbox" class="ai-provider-check" value="google_cse"><span class="ai-provider-pill-label"><i class="bi bi-google"></i> Google</span>
                    <button class="ai-provider-key-btn" data-provider="google_cse" title="API key"><i class="bi bi-key"></i></button>
                </label>
                <label class="ai-provider-pill" data-provider="wikipedia" title="Wikipedia · Free encyclopedia">
                    <input type="checkbox" class="ai-provider-check" value="wikipedia"><span class="ai-provider-pill-label"><i class="bi bi-book"></i> Wiki</span>
                </label>
                <label class="ai-provider-pill" data-provider="wikidata" title="Wikidata · Free structured knowledge">
                    <input type="checkbox" class="ai-provider-check" value="wikidata"><span class="ai-provider-pill-label"><i class="bi bi-diagram-3"></i> Wikidata</span>
                </label>
            </div>
        </div>

        <div class="ai-quick-actions" id="ai-quick-actions">
            <button class="ai-action-chip" data-action="summarize" title="Summarize selected text">
                <i class="bi bi-card-text"></i> Summarize
            </button>
            <button class="ai-action-chip" data-action="expand" title="Expand selected text">
                <i class="bi bi-arrows-angle-expand"></i> Expand
            </button>
            <button class="ai-action-chip" data-action="rephrase" title="Rephrase selected text">
                <i class="bi bi-arrow-repeat"></i> Rephrase
            </button>
            <button class="ai-action-chip" data-action="grammar" title="Fix grammar">
                <i class="bi bi-spellcheck"></i> Fix Grammar
            </button>
            <button class="ai-action-chip" data-action="explain" title="Explain selected text">
                <i class="bi bi-lightbulb"></i> Explain
            </button>
            <button class="ai-action-chip" data-action="simplify" title="Simplify selected text">
                <i class="bi bi-funnel"></i> Simplify
            </button>
            <button class="ai-action-chip" data-action="autocomplete" title="Auto-complete from cursor">
                <i class="bi bi-lightning"></i> Complete
            </button>
            <button class="ai-action-chip" data-action="markdown" title="Generate markdown">
                <i class="bi bi-markdown"></i> Markdown
            </button>
            <button class="ai-action-chip ai-chip-writing" data-action="polish" title="Polish writing">
                <i class="bi bi-brush"></i> Polish
            </button>
            <button class="ai-action-chip ai-chip-writing" data-action="formalize" title="Make text more formal">
                <i class="bi bi-mortarboard"></i> Formalize
            </button>
            <button class="ai-action-chip ai-chip-writing" data-action="elaborate" title="Add more detail">
                <i class="bi bi-textarea-resize"></i> Elaborate
            </button>
            <button class="ai-action-chip ai-chip-writing" data-action="shorten" title="Make text more concise">
                <i class="bi bi-scissors"></i> Shorten
            </button>
        </div>

        <div class="ai-chat-area" id="ai-chat-area">
            <div class="ai-welcome-message">
                <div class="ai-welcome-icon"><i class="bi bi-stars"></i></div>
                <h5>AI Assistant</h5>
                <p>Switch models below · Local or Cloud</p>
                <div class="ai-welcome-tips">
                    <div class="ai-tip"><i class="bi bi-cursor-text"></i> Select text + use quick actions</div>
                    <div class="ai-tip"><i class="bi bi-chat-dots"></i> Ask questions about your document</div>
                    <div class="ai-tip"><i class="bi bi-keyboard"></i> <kbd>Ctrl</kbd>+<kbd>Space</kbd> for
                        auto-complete</div>
                </div>
            </div>
        </div>

        <div class="ai-input-area">
            <div class="ai-model-selector">
                <button class="ai-model-btn" id="ai-model-btn" title="Switch AI model">
                    <span class="ai-model-btn-icon"><i class="bi bi-pc-display" id="ai-model-btn-icon"></i></span>
                    <span id="ai-model-label">Qwen 3.5 · Local</span>
                    <i class="bi bi-chevron-up ai-model-chevron"></i>
                </button>
                <div class="ai-model-dropdown" id="ai-model-dropdown">
                    <!-- Built dynamically from js/ai-models.js -->
                </div>
            </div>
            <div class="ai-attachments-strip" id="ai-attachments-strip" style="display:none"></div>
            <div class="ai-input-wrapper">
                <button id="ai-attach-btn" class="ai-attach-button" title="Attach files or images" type="button">
                    <i class="bi bi-paperclip"></i>
                </button>
                <input type="file" id="ai-file-input" multiple accept="image/*,.txt,.md,.csv,.json,.pdf,.xml,.yaml,.yml,.log,.js,.ts,.py,.html,.css" style="display:none" />
                <textarea id="ai-input" placeholder="Ask AI anything... (e.g. 'Write a README intro')"
                    rows="1"></textarea>
                <button id="ai-send-btn" class="ai-send-button" title="Send">
                    <i class="bi bi-send-fill"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- AI Panel Overlay (mobile) -->
    <div id="ai-panel-overlay" class="ai-panel-overlay"></div>

    <!-- AI Consent / Download Dialog -->
    <div id="ai-consent-modal" class="ai-consent-modal" style="display:none">
        <div class="ai-consent-content">
            <div class="ai-consent-header">
                <div class="ai-consent-icon"><i class="bi bi-stars"></i></div>
                <h4>Enable AI Assistant</h4>
                <p>Powered by <strong>Qwen 3.5 Small</strong> — runs 100% locally in your browser</p>
            </div>
            <div class="ai-consent-body">
                <div class="ai-consent-info">
                    <div class="ai-consent-row">
                        <i class="bi bi-download"></i>
                        <div>
                            <strong>One-time download: ~500 MB</strong>
                            <small>Cached in your browser for instant loading next time</small>
                        </div>
                    </div>
                    <div class="ai-consent-row">
                        <i class="bi bi-shield-lock"></i>
                        <div>
                            <strong>100% Private</strong>
                            <small>No data ever leaves your browser — all AI runs locally</small>
                        </div>
                    </div>
                    <div class="ai-consent-row" id="ai-consent-device-row">
                        <i class="bi bi-gpu-card"></i>
                        <div>
                            <strong id="ai-device-label">Checking GPU support...</strong>
                            <small id="ai-device-detail">WebGPU provides fastest inference</small>
                        </div>
                    </div>
                </div>

                <!-- Progress section (hidden until download starts) -->
                <div id="ai-download-progress" class="ai-download-progress" style="display:none">
                    <div class="ai-progress-status" id="ai-progress-status">Initializing...</div>
                    <div class="ai-progress-source" id="ai-progress-source" style="display:none"></div>
                    <div class="ai-progress-bar-container">
                        <div class="ai-progress-bar" id="ai-progress-bar" style="width:0%"></div>
                    </div>
                    <div class="ai-progress-detail" id="ai-progress-detail"></div>
                </div>
            </div>
            <div class="ai-consent-footer">
                <button id="ai-consent-delete" class="ai-consent-btn ai-consent-btn-danger" style="display:none"
                    title="Delete cached model files from your browser">
                    <i class="bi bi-trash3 me-1"></i> Delete Model
                </button>
                <button id="ai-consent-cancel" class="ai-consent-btn ai-consent-btn-secondary">Cancel</button>
                <button id="ai-consent-download" class="ai-consent-btn ai-consent-btn-primary">
                    <i class="bi bi-download me-1"></i> Download & Enable AI
                </button>
            </div>
        </div>
    </div>

    <!-- Cloud API Key Dialog (shared by Groq / Gemini / OpenRouter) -->
    <div id="ai-apikey-modal" class="ai-consent-modal" style="display:none">
        <div class="ai-consent-content ai-apikey-content">
            <div class="ai-consent-header">
                <div class="ai-consent-icon"><i class="bi bi-cloud" id="ai-apikey-icon"></i></div>
                <h4 id="ai-apikey-title">Connect to Cloud AI</h4>
                <p id="ai-apikey-desc">Enter your free API key</p>
            </div>
            <div class="ai-consent-body">
                <div class="ai-apikey-input-group">
                    <label for="ai-groq-key-input">API Key</label>
                    <input type="password" id="ai-groq-key-input" class="ai-apikey-input"
                        placeholder="sk_xxxxxxxxxxxxxxxxxxxx" autocomplete="off" spellcheck="false" />
                    <small class="ai-apikey-hint">
                        <i class="bi bi-info-circle"></i>
                        Get your free key at <a id="ai-apikey-link" href="#" target="_blank"
                            rel="noopener noreferrer">provider console</a>
                    </small>
                </div>
                <div id="ai-apikey-error" class="ai-apikey-error" style="display:none"></div>
            </div>
            <div class="ai-consent-footer">
                <button id="ai-apikey-cancel" class="ai-consent-btn ai-consent-btn-secondary">Cancel</button>
                <button id="ai-apikey-save" class="ai-consent-btn ai-consent-btn-primary">
                    <i class="bi bi-check-lg me-1"></i> Connect
                </button>
            </div>
        </div>
    </div>

    <!-- AI Editor Context Menu -->
    <div id="ai-context-menu" class="ai-context-menu" style="display:none">
        <div class="ai-ctx-col">
            <button class="ai-ctx-btn" data-action="summarize"><i class="bi bi-card-text"></i> Summarize</button>
            <button class="ai-ctx-btn" data-action="explain"><i class="bi bi-lightbulb"></i> Explain</button>
            <button class="ai-ctx-btn" data-action="simplify"><i class="bi bi-funnel"></i> Simplify</button>
            <button class="ai-ctx-btn" data-action="rephrase"><i class="bi bi-arrow-repeat"></i> Rephrase</button>
            <button class="ai-ctx-btn" data-action="grammar"><i class="bi bi-spellcheck"></i> Fix Grammar</button>
            <button class="ai-ctx-btn" data-action="expand"><i class="bi bi-arrows-angle-expand"></i> Expand</button>
        </div>
        <div class="ai-ctx-col ai-ctx-col-writing">
            <button class="ai-ctx-btn" data-action="polish"><i class="bi bi-brush"></i> Polish</button>
            <button class="ai-ctx-btn" data-action="formalize"><i class="bi bi-mortarboard"></i> Formalize</button>
            <button class="ai-ctx-btn" data-action="elaborate"><i class="bi bi-textarea-resize"></i> Elaborate</button>
            <button class="ai-ctx-btn" data-action="shorten"><i class="bi bi-scissors"></i> Shorten</button>
        </div>
    </div>

    <!-- AI Image Generation Modal -->
    <div id="ai-image-modal" class="ai-consent-modal" style="display:none">
        <div class="ai-consent-content ai-image-modal-content">
            <div class="ai-consent-header">
                <div class="ai-consent-icon" style="background:linear-gradient(135deg,#8b5cf6,#a855f7)"><i class="bi bi-image"></i></div>
                <h4>Generate Image</h4>
                <p>Powered by <strong>Imagen 4 Ultra</strong> · Google</p>
            </div>
            <div class="ai-consent-body">
                <div class="ai-image-form">
                    <div class="ai-image-field">
                        <label for="ai-image-prompt">Describe your image</label>
                        <textarea id="ai-image-prompt" class="ai-image-prompt-input" rows="3" placeholder="A futuristic city at sunset with flying cars and neon lights..."></textarea>
                    </div>
                    <div class="ai-image-field">
                        <label>Aspect Ratio</label>
                        <div class="ai-image-aspect-pills">
                            <button class="ai-aspect-pill active" data-ratio="1:1" title="Square">1:1</button>
                            <button class="ai-aspect-pill" data-ratio="16:9" title="Landscape wide">16:9</button>
                            <button class="ai-aspect-pill" data-ratio="9:16" title="Portrait tall">9:16</button>
                            <button class="ai-aspect-pill" data-ratio="4:3" title="Landscape">4:3</button>
                            <button class="ai-aspect-pill" data-ratio="3:4" title="Portrait">3:4</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="ai-consent-footer">
                <button id="ai-image-cancel" class="ai-consent-btn ai-consent-btn-secondary">Cancel</button>
                <button id="ai-image-generate" class="ai-consent-btn ai-consent-btn-primary" style="background:linear-gradient(135deg,#8b5cf6,#a855f7)">
                    <i class="bi bi-stars me-1"></i> Generate
                </button>
            </div>
        </div>
    </div>

    <!-- File Conversion Progress Overlay -->
    <div id="conversion-overlay" class="conversion-overlay" style="display:none">
        <div class="conversion-modal">
            <div class="conversion-spinner"></div>
            <h5 id="conversion-title">Converting...</h5>
            <p id="conversion-detail" class="conversion-detail">Processing your file</p>
        </div>
    </div>

    <!-- LLM Memory Converter Modal -->
    <div id="memory-modal" class="memory-modal" style="display:none">
        <div class="memory-modal-content">
            <div class="memory-modal-header">
                <div class="memory-header-left">
                    <div class="memory-logo">
                        <i class="bi bi-cpu"></i>
                    </div>
                    <div>
                        <h4>md→memory</h4>
                        <p class="memory-subtitle">convert markdown into portable LLM context</p>
                    </div>
                </div>
                <div class="memory-header-right">
                    <div class="memory-stats">
                        <span id="memory-word-count">0 words</span>
                        <span id="memory-token-count">~0 tokens</span>
                        <span id="memory-section-count">0 sections</span>
                        <span id="memory-size-label" class="memory-size-compact">compact</span>
                    </div>
                    <button class="memory-close-btn" id="memory-modal-close" title="Close">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </div>

            <!-- Tabs -->
            <div class="memory-tabs">
                <button class="memory-tab active" data-tab="config"><i class="bi bi-sliders"></i> Configure</button>
                <button class="memory-tab" data-tab="output"><i class="bi bi-code-square"></i> Output</button>
                <button class="memory-tab" data-tab="share"><i class="bi bi-share"></i> Share</button>
            </div>

            <div class="memory-body">
                <!-- CONFIG TAB -->
                <div class="memory-tab-content active" id="memory-tab-config">
                    <div class="memory-section">
                        <label class="memory-label">Memory Format</label>
                        <div class="memory-template-grid">
                            <button class="memory-template-btn active" data-template="xml">
                                <strong>XML</strong>
                                <small>Structured tags — ideal for Claude, system prompts</small>
                            </button>
                            <button class="memory-template-btn" data-template="json">
                                <strong>JSON</strong>
                                <small>Structured JSON — easy to parse and inject via API</small>
                            </button>
                            <button class="memory-template-btn" data-template="compact">
                                <strong>Compact JSON</strong>
                                <small>Minified — saves tokens for large contexts</small>
                            </button>
                            <button class="memory-template-btn" data-template="markdown">
                                <strong>Markdown</strong>
                                <small>Clean markdown — universal, works with any LLM</small>
                            </button>
                            <button class="memory-template-btn" data-template="plaintext">
                                <strong>Plain Text</strong>
                                <small>No formatting — simple, readable text</small>
                            </button>
                        </div>
                    </div>
                    <div class="memory-section">
                        <label class="memory-label">Metadata (Optional)</label>
                        <div class="memory-meta-grid">
                            <div class="memory-field">
                                <label>Title</label>
                                <input type="text" id="memory-meta-title" placeholder="Memory title">
                            </div>
                            <div class="memory-field">
                                <label>Author</label>
                                <input type="text" id="memory-meta-author" placeholder="Your name">
                            </div>
                            <div class="memory-field">
                                <label>Tags</label>
                                <input type="text" id="memory-meta-tags" placeholder="ai, project, context">
                            </div>
                        </div>
                        <div class="memory-field memory-field-full">
                            <label>Summary</label>
                            <textarea id="memory-meta-summary"
                                placeholder="Brief summary of this context for the LLM..." rows="2"></textarea>
                        </div>
                    </div>
                </div>

                <!-- OUTPUT TAB -->
                <div class="memory-tab-content" id="memory-tab-output">
                    <div class="memory-output-header">
                        <span class="memory-output-label" id="memory-output-label">Generated Memory · Standard
                            Memory</span>
                        <button class="memory-copy-btn" id="memory-copy-output"><i class="bi bi-clipboard"></i> Copy
                            All</button>
                    </div>
                    <pre class="memory-output-pre" id="memory-output-pre"></pre>
                </div>

                <!-- SHARE TAB -->
                <div class="memory-tab-content" id="memory-tab-share">
                    <div class="memory-share-card">
                        <div class="memory-share-icon"><i class="bi bi-download"></i></div>
                        <div>
                            <strong>Download</strong>
                            <small>Save as file, upload to any LLM</small>
                        </div>
                        <div class="memory-share-actions">
                            <button class="memory-action-btn" id="memory-download-md">.md</button>
                            <button class="memory-action-btn" id="memory-download-txt">.txt</button>
                        </div>
                    </div>

                    <div class="memory-share-card">
                        <div class="memory-share-icon"><i class="bi bi-clipboard"></i></div>
                        <div>
                            <strong>Copy as Prompt Block</strong>
                            <small>Paste directly into system prompt or custom instructions</small>
                        </div>
                        <div class="memory-share-actions">
                            <button class="memory-action-btn" id="memory-copy-block"><i class="bi bi-clipboard"></i>
                                Copy</button>
                        </div>
                    </div>

                    <div class="memory-share-card">
                        <div class="memory-share-icon"><i class="bi bi-link-45deg"></i></div>
                        <div>
                            <strong>Share as Link</strong>
                            <small>Encrypted short link — opens in TextAgent</small>
                        </div>
                        <div class="memory-share-actions">
                            <button class="memory-action-btn" id="memory-gen-link">Generate Link</button>
                        </div>
                    </div>
                    <div id="memory-share-result" style="display:none"></div>

                    <div class="memory-share-card memory-api-card">
                        <div class="memory-share-icon"><i class="bi bi-code-slash"></i></div>
                        <div>
                            <strong>API Integration</strong>
                            <small>Inject memory via API calls to any LLM provider</small>
                        </div>
                        <div class="memory-share-actions">
                            <button class="memory-action-btn" id="memory-toggle-api">Show Code</button>
                        </div>
                    </div>
                    <pre class="memory-api-example" id="memory-api-example" style="display:none">// Fetch and inject memory into any LLM call
const memoryResponse = await fetch(MEMORY_URL);
const memoryText = await memoryResponse.text();

// Use with Anthropic
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
  body: JSON.stringify({
    model: "claude-sonnet-4-5-20250929",
    system: memoryText,
    messages: [{ role: "user", content: "..." }],
    max_tokens: 1024
  })
});

// Use with OpenAI
const chatResponse = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: memoryText },
    { role: "user", content: "..." }
  ]
});</pre>
                </div>
            </div>
        </div>
    </div>

    <!-- Template Picker Modal -->
    <div id="template-modal" class="template-modal" style="display:none">
        <div class="template-modal-content">
            <div class="template-modal-header">
                <div class="template-header-left">
                    <div class="template-logo"><i class="bi bi-columns-gap"></i></div>
                    <div>
                        <h4>Templates</h4>
                        <p class="template-subtitle">Start with a professionally structured template</p>
                    </div>
                </div>
                <button class="template-close-btn" id="template-modal-close" title="Close">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <div class="template-search-bar">
                <i class="bi bi-search template-search-icon"></i>
                <input type="text" id="template-search-input" placeholder="Search templates..." autocomplete="off" />
            </div>
            <div class="template-categories" id="template-categories">
                <div class="template-cat-pills">
                    <button class="template-cat-btn active" data-category="all">All</button>
                    <button class="template-cat-btn" data-category="ai">AI</button>
                    <button class="template-cat-btn" data-category="agents">Agents</button>
                    <button class="template-cat-btn" data-category="documentation">Documentation</button>
                    <button class="template-cat-btn" data-category="project">Project</button>
                    <button class="template-cat-btn" data-category="technical">Technical</button>
                    <button class="template-cat-btn" data-category="creative">Creative</button>
                    <button class="template-cat-btn" data-category="coding">Coding</button>
                    <button class="template-cat-btn" data-category="maths">Maths</button>
                    <button class="template-cat-btn" data-category="ppt">PPT</button>
                    <button class="template-cat-btn" data-category="quiz">Quiz</button>
                    <button class="template-cat-btn" data-category="tables">Tables</button>
                    <button class="template-cat-btn" data-category="finance">Finance</button>
                    <button class="template-cat-btn" data-category="games">Games</button>
                    <button class="template-cat-btn" data-category="skills">Skills</button>
                </div>
            </div>
            <div class="template-grid" id="template-grid"></div>
            <div class="template-empty" id="template-empty" style="display:none">
                <i class="bi bi-search"></i>
                <p>No templates match your search</p>
            </div>
        </div>
    </div>

    <!-- GitHub Auth Dialog (for Agent Cloud Execution) -->
    <div id="github-auth-modal" class="ai-consent-modal" style="display:none">
        <div class="ai-consent-content ai-apikey-content">
            <div class="ai-consent-header">
                <div class="ai-consent-icon" style="background:#24292e"><i class="bi bi-github"></i></div>
                <h4>Connect GitHub</h4>
                <p>Sign in to use free Codespaces for agent execution</p>
            </div>
            <div class="ai-consent-body">
                <div class="ai-apikey-input-group">
                    <div id="github-auth-info">
                        <div class="ai-consent-row">
                            <i class="bi bi-cloud"></i>
                            <div>
                                <strong>120 free core-hours/month</strong>
                                <small>Every GitHub account includes free Codespaces quota</small>
                            </div>
                        </div>
                        <div class="ai-consent-row">
                            <i class="bi bi-shield-lock"></i>
                            <div>
                                <strong>Runs on YOUR account</strong>
                                <small>TextAgent only creates disposable Codespaces under your login</small>
                            </div>
                        </div>
                    </div>
                    <div id="github-device-code-section" style="display:none">
                        <p class="github-device-instructions">Open <a id="github-verify-link" href="https://github.com/login/device" target="_blank" rel="noopener noreferrer">github.com/login/device</a> and enter this code:</p>
                        <div id="github-device-code" class="github-device-code"></div>
                        <p class="github-device-waiting"><i class="bi bi-arrow-repeat ai-spin"></i> Waiting for authorization…</p>
                    </div>
                    <div id="github-auth-connected" style="display:none">
                        <div class="github-user-info">
                            <i class="bi bi-check-circle-fill" style="color:#2ea043;font-size:1.2rem"></i>
                            <span>Connected as <strong id="github-username"></strong></span>
                            <button id="github-disconnect" class="ai-consent-btn ai-consent-btn-danger" style="font-size:0.75rem;padding:4px 10px">Disconnect</button>
                        </div>
                    </div>
                </div>

                <!-- Agent Execution Settings -->
                <div class="agent-settings-section" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color,#30363d)">
                    <div style="font-weight:700;font-size:13px;margin-bottom:8px;color:var(--text-color)"><i class="bi bi-gear me-1"></i>Agent Execution</div>
                    <div class="agent-provider-group" style="display:flex;flex-direction:column;gap:6px">
                        <label class="agent-provider-option" style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--text-color)">
                            <input type="radio" name="agent-provider" value="codespaces" class="agent-provider-radio">
                            <i class="bi bi-cloud" style="opacity:0.6"></i>
                            <span><strong>GitHub Codespaces</strong> <small style="opacity:0.5">— free cloud sandbox</small></span>
                        </label>
                        <label class="agent-provider-option" style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--text-color)">
                            <input type="radio" name="agent-provider" value="local" class="agent-provider-radio">
                            <i class="bi bi-hdd" style="opacity:0.6"></i>
                            <span><strong>Local Docker</strong> <small style="opacity:0.5">— localhost:8080 (requires Docker)</small></span>
                        </label>
                        <label class="agent-provider-option" style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--text-color)">
                            <input type="radio" name="agent-provider" value="custom" class="agent-provider-radio">
                            <i class="bi bi-link-45deg" style="opacity:0.6"></i>
                            <span><strong>Custom Endpoint</strong> <small style="opacity:0.5">— self-hosted / E2B / Daytona</small></span>
                        </label>
                    </div>
                    <div id="agent-custom-url-group" style="display:none;margin-top:8px">
                        <input type="url" id="agent-custom-url-input" class="ai-apikey-input" placeholder="https://your-server.com/api/exec" style="width:100%;font-size:13px">
                    </div>
                </div>

                <div id="github-auth-error" class="ai-apikey-error" style="display:none"></div>
            </div>
            <div class="ai-consent-footer">
                <button id="github-auth-cancel" class="ai-consent-btn ai-consent-btn-secondary">Cancel</button>
                <button id="github-auth-connect" class="ai-consent-btn ai-consent-btn-primary" style="background:#24292e">
                    <i class="bi bi-github me-1"></i> Sign in with GitHub
                </button>
            </div>
        </div>
    </div>
`;

    // Inject before the script tags at the end of body
    const container = document.createElement('div');
    container.innerHTML = modalHTML;
    while (container.firstChild) {
        document.body.appendChild(container.firstChild);
    }
})();
