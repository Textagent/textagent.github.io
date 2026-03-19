# External Agent Execution via GitHub Codespaces

Run OpenClaw/OpenFang on free GitHub Codespaces, orchestrated via TextAgent's Agent Flow.

## User Review Required

> [!IMPORTANT]
> **GitHub OAuth App required.** Register at `github.com/settings/developers` → OAuth Apps. Set callback URL to `http://127.0.0.1:*` for local dev. The Client ID is committed to source (same pattern as Firebase config in `cloud-share.js`).

> [!IMPORTANT]
> **Template repository needed.** A public repo (e.g., `textagent/agent-runner`) with a devcontainer that pre-installs OpenClaw. This is a one-time GitHub setup, not part of this code change.

---

## Proposed Changes

### Storage Keys

#### [MODIFY] [storage-keys.js](file:///Users/jyotibose/textagent.github.io/js/storage-keys.js)

Add new keys following the existing `textagent-*` prefix convention:

```diff
         // --- Context Memory ---
         MEMORY_DB: 'textagent-memory-db',
+
+        // --- Agent Execution (Cloud) ---
+        GITHUB_TOKEN: 'textagent-github-token',
+        GITHUB_USER: 'textagent-github-user',
+        AGENT_PROVIDER: 'textagent-agent-provider',       // 'codespaces' | 'custom' | ''
+        AGENT_CODESPACE_ID: 'textagent-agent-codespace',  // reuse idle codespace
+        AGENT_CUSTOM_URL: 'textagent-agent-custom-url',
     };
```

---

### Modal HTML

#### [MODIFY] [modal-templates.js](file:///Users/jyotibose/textagent.github.io/js/modal-templates.js)

Append a new modal to the `modalHTML` template string (same pattern as AI API Key modal):

```html
<!-- GitHub Auth Dialog (for Agent Execution) -->
<div id="github-auth-modal" class="ai-consent-modal" style="display:none">
  <div class="ai-consent-content ai-apikey-content">
    <div class="ai-consent-header">
      <div class="ai-consent-icon" style="background:#24292e">
        <i class="bi bi-github"></i>
      </div>
      <h4>Connect GitHub</h4>
      <p>Sign in to use free Codespaces for agent execution</p>
    </div>
    <div class="ai-consent-body">
      <div class="ai-apikey-input-group">
        <div id="github-auth-status">
          <p>Each GitHub account gets <strong>120 free core-hours/month</strong> of Codespaces.</p>
        </div>
        <div id="github-device-code-section" style="display:none">
          <label>Enter this code at <a id="github-verify-link" href="#" target="_blank">github.com/login/device</a>:</label>
          <div id="github-device-code" class="github-device-code"></div>
        </div>
        <div id="github-auth-connected" style="display:none">
          <div class="github-user-info">
            <i class="bi bi-check-circle" style="color:#2ea043"></i>
            <span id="github-username"></span>
            <button id="github-disconnect" class="ai-consent-btn ai-consent-btn-danger" style="font-size:0.8rem">Disconnect</button>
          </div>
        </div>
      </div>
      <div id="github-auth-error" class="ai-apikey-error" style="display:none"></div>
    </div>
    <div class="ai-consent-footer">
      <button id="github-auth-cancel" class="ai-consent-btn ai-consent-btn-secondary">Cancel</button>
      <button id="github-auth-connect" class="ai-consent-btn ai-consent-btn-primary">
        <i class="bi bi-github me-1"></i> Sign in with GitHub
      </button>
    </div>
  </div>
</div>
```

Uses existing `ai-consent-modal` / `ai-apikey-content` CSS classes — no new styling needed.

---

### GitHub OAuth Module

#### [NEW] [github-auth.js](file:///Users/jyotibose/textagent.github.io/js/github-auth.js)

IIFE module following the project convention:

```javascript
(function (M) {
  'use strict';
  
  const CLIENT_ID = 'Ov23li...';  // GitHub OAuth App Client ID
  
  M.githubAuth = {
    isAuthenticated() { return !!localStorage.getItem(M.KEYS.GITHUB_TOKEN); },
    getToken()        { return localStorage.getItem(M.KEYS.GITHUB_TOKEN); },
    getUser()         { return localStorage.getItem(M.KEYS.GITHUB_USER); },
    
    // GitHub Device Flow — no backend, no redirect, works from any origin
    async login() { /* POST device/code → poll grant → store token */ },
    logout()      { /* clear token + user from localStorage */ },
    
    showAuthModal()   { /* display #github-auth-modal */ },
    hideAuthModal()   { /* hide modal */ },
  };
})(window.MDView);
```

**Uses GitHub Device Flow** (not PKCE) because:
- No redirect URL needed (works on `file://`, `localhost`, any domain)
- No client secret needed
- Same UX as `gh auth login` CLI

---

### Codespaces API Adapter

#### [NEW] [agent-cloud.js](file:///Users/jyotibose/textagent.github.io/js/agent-cloud.js)

IIFE module exposing `M.agentCloud`:

```javascript
(function (M) {
  'use strict';
  
  const TEMPLATE_REPO = 'textagent/agent-runner';
  const IDLE_TIMEOUT_MS = 5 * 60 * 1000;  // auto-stop after 5 min idle
  
  M.agentCloud = {
    isAvailable()  { return M.githubAuth.isAuthenticated(); },
    getProvider()  { return localStorage.getItem(M.KEYS.AGENT_PROVIDER) || ''; },
    
    // Create or reuse Codespace → run command → return stdout
    async run(command, opts) {
      // 1. GET /user/codespaces — find idle TextAgent codespace
      // 2. If none: POST /user/codespaces — create from TEMPLATE_REPO  
      // 3. Wait for state === 'Available'
      // 4. POST /user/codespaces/{name}/start (if suspended)
      // 5. Execute command via Codespace exec API
      // 6. Return { stdout, stderr, exitCode }
      // 7. Set idle timer → auto-stop after IDLE_TIMEOUT_MS
    },
    
    async stop(codespaceName) { /* POST /user/codespaces/{name}/stop */ },
    async cleanup()           { /* stop all textagent-* codespaces */ },
  };
})(window.MDView);
```

---

### Agent Flow Tag Extension

#### [MODIFY] [ai-docgen.js](file:///Users/jyotibose/textagent.github.io/js/ai-docgen.js)

**1. Add `@cloud:` field parsing** in `parseDocgenBlocks()` (alongside existing `@think:`, `@search:`, `@model:` parsing):

```diff
 // Parse @think: yes/no field
 var thinkMatch = block.prompt.match(/^\s*(?:@think|Think):\s*(yes|no)$/mi);
 ...
+// Parse @cloud: yes/no field — route step execution to cloud compute
+var cloudMatch = block.prompt.match(/^\s*(?:@cloud|Cloud):\s*(yes|no)$/mi);
+if (cloudMatch) {
+    block.cloud = cloudMatch[1].toLowerCase() === 'yes';
+    block.prompt = block.prompt.replace(cloudMatch[0], '').trim();
+} else {
+    block.cloud = false;
+}
```

**2. Add cloud toggle button** to Agent card header in `transformDocgenMarkdown()` (alongside existing 🧠 think toggle):

```diff
 + '<button class="ai-placeholder-btn ai-think-toggle...">🧠</button>'
++ '<button class="ai-placeholder-btn ai-cloud-toggle' + (hasCloud ? ' active' : '') + '" data-ai-index="' + blockIndex + '" title="Run on cloud (GitHub Codespaces)">☁️</button>'
 + '<button class="ai-placeholder-btn ai-search-multi-btn...">🔍</button>'
```

**3. Add cloud toggle handler** in `bindDocgenPreviewActions()` (same pattern as think toggle):

```javascript
container.querySelectorAll('.ai-cloud-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var idx = parseInt(this.dataset.aiIndex, 10);
        var isActive = this.classList.toggle('active');
        if (isActive && !M.agentCloud.isAvailable()) {
            M.githubAuth.showAuthModal();
            this.classList.remove('active');
            return;
        }
        updateBlockField(idx, '@cloud', isActive ? 'yes' : 'no');
    });
});
```

---

### Agent Flow Execution

#### [MODIFY] [ai-docgen-generate.js](file:///Users/jyotibose/textagent.github.io/js/ai-docgen-generate.js)

In the `generateAgentFlow()` function, add a cloud execution branch per step:

```javascript
// Before sending step to LLM, check if @cloud: yes
if (block.cloud && M.agentCloud && M.agentCloud.isAvailable()) {
    stepResult = await M.agentCloud.run(stepDescription, {
        prevOutput: previousStepOutput,
        timeout: 60000,
    });
} else {
    // Existing LLM execution path
    stepResult = await requestAiTask(stepPrompt, ...);
}
```

---

### Module Loading

#### [MODIFY] [main.js](file:///Users/jyotibose/textagent.github.io/src/main.js)

Add new Phase 3k after Draw Component (3j):

```diff
     // 3j: Draw Component
     await import('../js/draw-docgen.js');
+
+    // 3k: Agent Cloud Execution (depends on M.KEYS from storage-keys)
+    await import('../js/github-auth.js');
+    await import('../js/agent-cloud.js');
 }
```

---

### CSS

#### [MODIFY] [ai-docgen.css](file:///Users/jyotibose/textagent.github.io/css/ai-docgen.css)

Minimal additions (~20 lines):

```css
/* Cloud toggle — reuses existing .ai-think-toggle pattern */
.ai-cloud-toggle.active { background: rgba(56, 139, 253, 0.2); color: #58a6ff; }

/* GitHub Device Code display */
.github-device-code { font-family: monospace; font-size: 1.8rem; letter-spacing: 0.3em;
  text-align: center; padding: 16px; background: rgba(110,118,129,0.1);
  border-radius: 8px; margin: 12px 0; user-select: all; }
.github-user-info { display: flex; align-items: center; gap: 8px; }
```

---

## Verification Plan

### Automated Tests

#### [NEW] [agent-cloud.spec.js](file:///Users/jyotibose/textagent.github.io/tests/feature/agent-cloud.spec.js)

```bash
npx playwright test tests/feature/agent-cloud.spec.js --headed
```

| Test | What it verifies |
|:-----|:-----------------|
| GitHub auth modal renders | `#github-auth-modal` exists in DOM |
| Cloud toggle on Agent card | Agent tag with `@cloud: yes` renders ☁️ button with `.active` class |
| Cloud toggle sync to editor | Clicking ☁️ writes `@cloud: yes` into the editor tag text |
| `@cloud:` field parsing | `parseDocgenBlocks()` sets `block.cloud = true` |
| Provider key persistence | `M.KEYS.AGENT_PROVIDER` is saved/restored from localStorage |
| Auth gate | Clicking ☁️ without GitHub token opens auth modal |

### Manual Verification

1. Register test GitHub OAuth App → paste Client ID
2. Click ☁️ on Agent card → complete Device Flow → verify username appears
3. Run Agent Flow with `@cloud: yes` → verify Codespace creation + command execution
4. Refresh page → verify token persistence
