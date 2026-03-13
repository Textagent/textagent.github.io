// ============================================
// git-docgen.js — {{Git:}} Tag Component
// AI-powered GitHub analysis toolkit
// Standalone module — remove this file + its CSS + loader line to disable
// ============================================
(function (M) {
    'use strict';

    // ==============================================
    // CONSTANTS
    // ==============================================
    var GIT_TAG_RE = /\{\{@?Git:\s*([\s\S]*?)\}\}/g;
    var GITHUB_API = 'https://api.github.com';
    var TOKEN_KEY = 'textagent-github-token';
    var MAX_FILES = 50;
    var MAX_BYTES_DEFAULT = 200 * 1024; // 200 KB for cloud models
    var MAX_BYTES_LOCAL  =  10 * 1024; //  10 KB for local ONNX models (strict WASM memory limits)
    var MAX_FILE_BYTES   =   8 * 1024; //   8 KB per file max (truncate larger files)

    // Get context-aware byte limit based on model
    function getMaxBytes(modelId) {
        var models = window.AI_MODELS || {};
        var info = modelId ? models[modelId] : null;
        if (info && info.isLocal) return MAX_BYTES_LOCAL;
        return MAX_BYTES_DEFAULT;
    }

    var ACTIONS = [
        { id: 'docs',         icon: '📄', label: 'Docs' },
        { id: 'bug',          icon: '🐛', label: 'Bug' },
        { id: 'security',     icon: '🔒', label: 'Security' },
        { id: 'testcase',     icon: '🧪', label: 'Tests' },
        { id: 'architecture', icon: '🏗️', label: 'Architecture' },
        { id: 'quality',      icon: '📊', label: 'Quality' },
        { id: 'review',       icon: '👀', label: 'Review' },
        { id: 'changelog',    icon: '📝', label: 'Changelog' },
        { id: 'contributing', icon: '🤝', label: 'Contributing' },
        { id: 'summary',      icon: '📋', label: 'Summary' }
    ];

    var ACTION_PROMPTS = {
        docs: 'You are a technical documentation expert. Analyze the provided repository code and generate comprehensive documentation.\n\nGenerate:\n- Project overview and purpose\n- Installation / setup instructions\n- API documentation for public functions/classes\n- Usage examples with code snippets\n- Configuration options\n\nFormat the output as clean Markdown. Be thorough but concise.',

        bug: 'You are a senior software engineer specializing in bug detection. Analyze the provided repository code for potential bugs.\n\nLook for:\n- Logic errors and off-by-one mistakes\n- Race conditions and concurrency issues\n- Null/undefined reference risks\n- Resource leaks (memory, file handles, connections)\n- Edge cases not handled\n- Error handling gaps\n- Type coercion issues\n\nFor each bug found, provide: location, severity (Critical/High/Medium/Low), description, and suggested fix. Format as Markdown.',

        security: 'You are a cybersecurity expert performing a security audit. Analyze the provided repository code for security vulnerabilities.\n\nCheck for:\n- XSS (Cross-Site Scripting) vulnerabilities\n- SQL/NoSQL injection points\n- CSRF vulnerabilities\n- Insecure deserialization\n- Hardcoded secrets, API keys, or credentials\n- Insecure direct object references\n- Missing input validation/sanitization\n- Insecure dependencies\n- CSP (Content Security Policy) issues\n- Authentication/authorization flaws\n\nFor each finding: severity (Critical/High/Medium/Low), location, description, remediation. Format as Markdown with a summary table.',

        testcase: 'You are a QA engineer and test automation expert. Analyze the provided repository code and generate comprehensive test cases.\n\nGenerate:\n- Unit tests for key functions/methods\n- Edge case tests\n- Integration test suggestions\n- Error path tests\n- Property-based test ideas\n- Mock/stub recommendations\n\nUse the appropriate testing framework for the language. Include the actual test code. Format as Markdown with code blocks.',

        architecture: 'You are a software architect. Analyze the provided repository code and generate an architecture document.\n\nInclude:\n- System overview and high-level design\n- Module/component relationships (include a Mermaid diagram)\n- Data flow description\n- Key design patterns used\n- Dependency graph\n- Entry points and execution flow\n- Scalability considerations\n\nGenerate Mermaid diagrams using ```mermaid code blocks. Format as clean Markdown.',

        quality: 'You are a code quality analyst. Analyze the provided repository code and generate a quality report.\n\nEvaluate:\n- Code complexity (cyclomatic complexity estimates)\n- Code duplication\n- Naming conventions consistency\n- Function/method length\n- Dead code\n- Comment quality and coverage\n- SOLID principles adherence\n- DRY principle violations\n- Error handling patterns\n- Code style consistency\n\nProvide a quality score (A-F) for each category and specific improvement suggestions. Format as Markdown with tables.',

        review: 'You are a senior engineer conducting a thorough code review. Analyze the provided repository code as if reviewing a pull request.\n\nReview aspects:\n- Code correctness and logic\n- Performance concerns\n- Maintainability and readability\n- Error handling\n- API design\n- Naming and conventions\n- Potential improvements\n\nBe constructive and specific. Use diff-style suggestions where applicable. Format as Markdown.',

        changelog: 'You are a technical writer. Analyze the provided repository code and generate a changelog/release notes document.\n\nBased on the code structure and comments, infer:\n- Major features and capabilities\n- API changes\n- Bug fixes (based on error handling patterns)\n- Breaking changes\n- Performance improvements\n- Dependency updates\n\nFormat as a standard CHANGELOG.md using Keep a Changelog format.',

        contributing: 'You are a developer advocate. Analyze the provided repository code and generate a comprehensive CONTRIBUTING.md guide.\n\nInclude:\n- Development environment setup\n- Build and test instructions\n- Code style guidelines (inferred from existing code)\n- Pull request process\n- Issue reporting guidelines\n- Architecture overview for new contributors\n- Key files and their purposes\n\nFormat as Markdown.',

        summary: 'You are a technical analyst. Analyze the provided repository code and generate a concise summary.\n\nCover:\n- Project purpose and goals\n- Technology stack\n- Project structure overview\n- Key features\n- Dependencies\n- Lines of code estimate by language\n- Health indicators (tests, docs, CI)\n\nKeep it concise — this should be a quick overview that fits in ~200 words. Format as Markdown.'
    };

    // ==============================================
    // HELPERS
    // ==============================================
    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getFencedRanges(md) {
        var ranges = [];
        var re = /(^|\n)(```+|~~~+)/g;
        var m, openIdx = -1;
        while ((m = re.exec(md)) !== null) {
            if (openIdx === -1) { openIdx = m.index; }
            else { ranges.push([openIdx, re.lastIndex]); openIdx = -1; }
        }
        return ranges;
    }

    function isInsideFence(idx, ranges) {
        for (var i = 0; i < ranges.length; i++) {
            if (idx >= ranges[i][0] && idx < ranges[i][1]) return true;
        }
        return false;
    }

    // State: generated results per block
    var generatedResults = new Map();

    // ==============================================
    // GITHUB API — fetch repo contents
    // ==============================================
    function getToken() {
        return localStorage.getItem(TOKEN_KEY) || '';
    }

    function setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    // Normalize repo input — accept various formats:
    //   textagent/textagent.github.io
    //   https://github.com/textagent/textagent.github.io
    //   https://github.com/textagent/textagent.github.io/tree/main/js
    //   github.com/textagent/textagent.github.io
    //   https://textagent.github.io/  → textagent/textagent.github.io
    function normalizeRepo(input) {
        if (!input) return '';
        var s = input.trim().replace(/\/+$/, '');

        // Full GitHub URL: https://github.com/owner/repo/...
        var ghMatch = s.match(/(?:https?:\/\/)?github\.com\/([^\/]+)\/([^\/\s#?]+)/i);
        if (ghMatch) return ghMatch[1] + '/' + ghMatch[2].replace(/\.git$/, '');

        // GitHub Pages URL: https://owner.github.io/repo or https://owner.github.io
        var pagesMatch = s.match(/(?:https?:\/\/)?([^\/]+)\.github\.io(?:\/([^\/\s#?]*))?/i);
        if (pagesMatch) {
            var owner = pagesMatch[1];
            var repo = pagesMatch[2];
            // If no repo path, conventions is owner/owner.github.io
            return owner + '/' + (repo || owner + '.github.io');
        }

        // Already owner/repo format
        if (/^[^\/\s]+\/[^\/\s]+$/.test(s)) return s;

        return s;
    }

    async function fetchRepoTree(repo, branch, token) {
        var branchRef = branch || 'main';
        var headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (token) headers['Authorization'] = 'token ' + token;

        // Try the branch, fallback to 'master' if 'main' fails
        var url = GITHUB_API + '/repos/' + repo + '/git/trees/' + branchRef + '?recursive=1';
        var res = await fetch(url, { headers: headers });
        if (!res.ok && branchRef === 'main') {
            // Retry with master
            url = GITHUB_API + '/repos/' + repo + '/git/trees/master?recursive=1';
            res = await fetch(url, { headers: headers });
        }
        if (!res.ok) {
            var errText = await res.text();
            throw new Error('GitHub API ' + res.status + ': ' + errText);
        }
        return res.json();
    }

    async function fetchFileContent(repo, path, branch, token) {
        var ref = branch || 'main';
        // Use raw.githubusercontent.com — no API rate limit!
        var rawUrl = 'https://raw.githubusercontent.com/' + repo + '/' + ref + '/' + path;
        try {
            var res = await fetch(rawUrl);
            if (!res.ok) return null;
            return res.text();
        } catch (e) {
            return null;
        }
    }

    // Source file extensions to fetch
    var SOURCE_EXTS = [
        '.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.go', '.rs', '.java',
        '.c', '.cpp', '.h', '.hpp', '.cs', '.swift', '.kt', '.scala',
        '.php', '.lua', '.sh', '.bash', '.css', '.scss', '.html',
        '.json', '.yaml', '.yml', '.toml', '.xml', '.md', '.txt',
        '.sql', '.r', '.dart', '.vue', '.svelte', '.zig', '.ex', '.exs',
        '.clj', '.hs', '.ml', '.proto', '.graphql', '.tf', '.dockerfile'
    ];

    // Files/dirs to always skip
    var SKIP_PATTERNS = [
        'node_modules/', 'vendor/', 'dist/', 'build/', '.git/',
        '__pycache__/', '.next/', '.nuxt/', 'target/', 'out/',
        'coverage/', '.cache/', '.vscode/', '.idea/',
        'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
        'Gemfile.lock', 'poetry.lock', 'Cargo.lock', 'composer.lock',
        'changelogs/', '.changelog/',
        '.min.js', '.min.css', '.map', '.bundle.js',
        '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
        '.woff', '.woff2', '.ttf', '.eot', '.otf',
        '.mp3', '.mp4', '.wav', '.avi', '.mov',
        '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar',
        '.exe', '.dll', '.so', '.dylib', '.wasm',
        '.pyc', '.class', '.o', '.obj'
    ];

    function shouldSkipFile(path) {
        var lp = path.toLowerCase();
        for (var i = 0; i < SKIP_PATTERNS.length; i++) {
            if (lp.indexOf(SKIP_PATTERNS[i]) !== -1) return true;
        }
        return false;
    }

    function isSourceFile(path) {
        var lp = path.toLowerCase();
        for (var i = 0; i < SOURCE_EXTS.length; i++) {
            if (lp.endsWith(SOURCE_EXTS[i])) return true;
        }
        return false;
    }

    // Smart priority scoring — higher = more important
    function getFilePriority(path) {
        var lp = path.toLowerCase();
        var name = lp.split('/').pop();

        // Priority 1 (100): Project overview files
        if (name === 'readme.md' || name === 'readme.txt' || name === 'readme.rst') return 100;
        if (name === 'package.json' || name === 'cargo.toml' || name === 'pyproject.toml') return 99;
        if (name === 'go.mod' || name === 'gemfile' || name === 'build.gradle') return 98;
        if (name === 'requirements.txt' || name === 'setup.py' || name === 'setup.cfg') return 97;
        if (name === 'tsconfig.json' || name === 'webpack.config.js' || name === 'vite.config.js') return 96;
        if (name === '.env.example' || name === 'docker-compose.yml' || name === 'dockerfile') return 95;
        if (name === 'makefile' || name === 'cmakelists.txt') return 94;

        // Priority 2 (80): Entry points and main files
        if (name.match(/^(main|index|app|server|cli)\./)) return 80;
        if (name.match(/^(mod|lib)\.(rs|py|go|ts|js)$/)) return 79;
        if (lp.match(/^src\/(main|index|app)\./)) return 78;

        // Priority 3 (60): Config and schema files
        if (name.endsWith('.config.js') || name.endsWith('.config.ts')) return 60;
        if (name.endsWith('.schema.json') || name.endsWith('.graphql')) return 59;
        if (name === 'schema.prisma' || name === 'schema.sql') return 58;

        // Priority 4 (40): Source files by depth (shallower = more important)
        var depth = path.split('/').length;
        if (isSourceFile(path)) {
            // Root-level source files are most important
            var depthBonus = Math.max(0, 10 - depth);
            // .md docs get a slight boost, but changelogs get deprioritized
            if (name.indexOf('changelog') !== -1) return 15 + depthBonus;
            if (lp.endsWith('.md')) return 45 + depthBonus;
            return 40 + depthBonus;
        }

        // Priority 5 (20): Test files (useful for testcase action)
        if (lp.indexOf('test') !== -1 || lp.indexOf('spec') !== -1) return 20;

        // Priority 6 (10): Everything else
        return 10;
    }

    async function fetchRepoContents(repo, branch, pathFilter, token, modelId) {
        var maxBytes = getMaxBytes(modelId);
        console.log('[Git] 📐 Context limit: ' + (maxBytes / 1024) + ' KB (model: ' + (modelId || 'default') + ')');
        var tree = await fetchRepoTree(repo, branch, token);
        var entries = tree.tree || [];

        // Filter: skip junk, keep source files
        var sourceFiles = entries.filter(function (e) {
            if (e.type !== 'blob') return false;
            if (shouldSkipFile(e.path)) return false;
            if (!isSourceFile(e.path)) return false;
            if (pathFilter) {
                return e.path.startsWith(pathFilter) || e.path === pathFilter;
            }
            return true;
        });

        // Score and sort by priority (highest first), then by size (smallest first for same priority)
        sourceFiles.forEach(function (e) {
            e._priority = getFilePriority(e.path);
        });
        sourceFiles.sort(function (a, b) {
            if (b._priority !== a._priority) return b._priority - a._priority;
            return (a.size || 0) - (b.size || 0);
        });

        // Cap at MAX_FILES
        sourceFiles = sourceFiles.slice(0, MAX_FILES);

        console.log('[Git] 📋 File priority list (top 15):');
        sourceFiles.slice(0, 15).forEach(function (e, i) {
            console.log('  ' + (i + 1) + '. [P' + e._priority + '] ' + e.path + ' (' + ((e.size || 0) / 1024).toFixed(1) + ' KB)');
        });

        // Fetch file contents in priority order with total size cap
        var totalBytes = 0;
        var results = [];
        var fetchPromises = sourceFiles.map(function (entry) {
            return fetchFileContent(repo, entry.path, branch, token)
                .then(function (content) {
                    if (content && totalBytes < maxBytes) {
                        // Truncate oversized files
                        if (content.length > MAX_FILE_BYTES) {
                            content = content.substring(0, MAX_FILE_BYTES) + '\n\n... [TRUNCATED — file exceeds ' + (MAX_FILE_BYTES / 1024) + ' KB limit] ...';
                        }
                        var bytes = new Blob([content]).size;
                        totalBytes += bytes;
                        results.push({ path: entry.path, content: content, priority: entry._priority });
                    }
                })
                .catch(function () { /* skip failed files */ });
        });

        await Promise.all(fetchPromises);

        // Sort results by priority for context ordering (most important first)
        results.sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });

        console.log('[Git] ✅ Downloaded ' + results.length + ' files, total: ' + (totalBytes / 1024).toFixed(1) + ' KB');
        return results;
    }

    // ==============================================
    // TOKEN MODAL
    // ==============================================
    function showTokenModal(callback) {
        var old = document.getElementById('git-token-modal');
        if (old) old.remove();

        var overlay = document.createElement('div');
        overlay.id = 'git-token-modal';
        overlay.className = 'ai-git-token-overlay';
        overlay.innerHTML =
            '<div class="ai-git-token-dialog">' +
            '<div class="ai-git-token-header">' +
            '<span>🔑 GitHub Token</span>' +
            '<button class="ai-git-token-close" title="Close">✕</button>' +
            '</div>' +
            '<div class="ai-git-token-body">' +
            '<p>Enter a GitHub Personal Access Token to access repositories. The token is stored locally in your browser and never sent to any server except GitHub\'s API.</p>' +
            '<p>Create a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener">github.com/settings/tokens</a> with <code>repo</code> scope (for private repos) or <code>public_repo</code> scope.</p>' +
            '<input type="password" class="ai-git-token-input" id="git-token-input" placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />' +
            '</div>' +
            '<div class="ai-git-token-actions">' +
            '<button class="ai-git-btn" id="git-token-skip">Skip (public only)</button>' +
            '<button class="ai-git-btn ai-git-run" id="git-token-save">Save Token</button>' +
            '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('active'); });

        function close() {
            overlay.classList.remove('active');
            setTimeout(function () { overlay.remove(); }, 200);
        }

        overlay.querySelector('.ai-git-token-close').addEventListener('click', close);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

        overlay.querySelector('#git-token-save').addEventListener('click', function () {
            var val = overlay.querySelector('#git-token-input').value.trim();
            if (val) setToken(val);
            close();
            if (callback) callback(val);
        });

        overlay.querySelector('#git-token-skip').addEventListener('click', function () {
            close();
            if (callback) callback('');
        });

        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler, true); }
        }, true);

        setTimeout(function () { overlay.querySelector('#git-token-input').focus(); }, 100);
    }

    // ==============================================
    // TRANSFORM — convert {{Git:}} tags to card HTML
    // ==============================================
    function transformGitMarkdown(markdown) {
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?Git:\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        // Build model dropdown options
        var models = window.AI_MODELS || {};
        var modelIds = Object.keys(models);
        var currentModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : modelIds[0]) || modelIds[0];

        function buildModelOpts(selectedId) {
            var selId = selectedId || currentModel;
            var opts = '';
            modelIds.forEach(function (id) {
                var m = models[id];
                if (m.isImageModel || m.isTtsModel || m.isSttModel) return;
                var name = m.dropdownName || m.label || id;
                var sel = id === selId ? ' selected' : '';
                opts += '<option value="' + id + '"' + sel + '>' + name + '</option>';
            });
            return opts;
        }

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);
            var prompt = match[1].trim();

            // Parse fields
            var fieldEnd = '(?=\\s+@|\\s*$)';
            var repoMatch = prompt.match(new RegExp('(?:^|\\s)(?:@repo|Repo):\\s*(\\S+)' + fieldEnd, 'mi'));
            var repo = repoMatch ? repoMatch[1].trim() : '';

            var actionMatch = prompt.match(new RegExp('(?:^|\\s)(?:@action|Action):\\s*(\\S+)' + fieldEnd, 'mi'));
            var action = actionMatch ? actionMatch[1].trim().toLowerCase() : 'summary';
            // Validate action
            var validActions = ACTIONS.map(function (a) { return a.id; });
            if (validActions.indexOf(action) === -1) action = 'summary';

            var branchMatch = prompt.match(new RegExp('(?:^|\\s)(?:@branch|Branch):\\s*(\\S+)' + fieldEnd, 'mi'));
            var branch = branchMatch ? branchMatch[1].trim() : '';

            var pathMatch = prompt.match(new RegExp('(?:^|\\s)(?:@path|Path):\\s*(\\S+)' + fieldEnd, 'mi'));
            var pathFilter = pathMatch ? pathMatch[1].trim() : '';

            var modelMatch = prompt.match(new RegExp('(?:^|\\s)(?:@model|Model):\\s*(\\S+)' + fieldEnd, 'mi'));
            var blockModelId = modelMatch ? modelMatch[1].trim() : null;
            if (blockModelId && models[blockModelId]) { /* valid */ } else { blockModelId = null; }

            var cardModelOpts = buildModelOpts(blockModelId);

            // Extract user prompt (strip fields)
            var displayText = prompt;
            ['@repo', 'Repo', '@action', 'Action', '@branch', 'Branch', '@path', 'Path', '@model', 'Model', '@prompt', 'Prompt']
                .forEach(function (f) {
                    displayText = displayText.replace(new RegExp('(?:^|\\s)' + f + ':\\s*\\S+' + fieldEnd, 'mi'), '').trim();
                });

            var promptFieldMatch = prompt.match(/(?:^|\s)(?:@prompt|Prompt):\s*(.*?)$/m);
            var promptVal = promptFieldMatch ? promptFieldMatch[1].trim() : '';

            // Has token?
            var hasToken = !!getToken();

            // Action pills
            var pillsHtml = '<div class="ai-git-action-pills" data-git-index="' + blockIndex + '">';
            ACTIONS.forEach(function (a) {
                var cls = a.id === action ? ' active' : '';
                pillsHtml += '<button class="ai-git-action-pill' + cls + '" data-action="' + a.id + '" data-git-index="' + blockIndex + '">' + a.icon + ' ' + a.label + '</button>';
            });
            pillsHtml += '</div>';

            // Has result?
            var hasResult = generatedResults.has(blockIndex);
            var resultHtml = '';
            if (hasResult) {
                var savedResult = generatedResults.get(blockIndex);
                resultHtml = '<div class="ai-git-result" data-git-index="' + blockIndex + '">'
                    + '<div class="ai-git-result-content">' + savedResult.html + '</div>'
                    + '<div class="ai-git-result-actions">'
                    + '<button class="ai-git-btn ai-git-reject" data-git-index="' + blockIndex + '">✕ Reject</button>'
                    + '<button class="ai-git-btn ai-git-accept" data-git-index="' + blockIndex + '">✓ Accept</button>'
                    + '<button class="ai-git-btn" data-git-index="' + blockIndex + '" data-git-copy>📋 Copy</button>'
                    + '</div></div>';
            }

            result += '<div class="ai-git-card" data-git-index="' + blockIndex + '" data-git-action="' + escapeHtml(action) + '" data-git-repo="' + escapeHtml(repo) + '">'
                + '<div class="ai-git-header">'
                + '<span class="ai-git-icon">🐙</span>'
                + '<span class="ai-git-label">GitHub Tools</span>'
                + (repo ? '<span class="ai-git-repo-badge" title="' + escapeHtml(repo) + '">' + escapeHtml(repo) + '</span>' : '')
                + (branch ? '<span class="ai-git-branch-badge">🌿 ' + escapeHtml(branch) + '</span>' : '')
                + '<div class="ai-git-actions">'
                + '<select class="ai-git-model-select" data-git-index="' + blockIndex + '" title="Model for analysis">' + cardModelOpts + '</select>'
                + '<button class="ai-git-btn ai-git-run" data-git-index="' + blockIndex + '" title="Run analysis">▶ Run</button>'
                + '<button class="ai-git-btn ai-git-token-btn" data-git-index="' + blockIndex + '" title="' + (hasToken ? 'Change GitHub token' : 'Set GitHub token') + '">🔑</button>'
                + '<button class="ai-git-btn ai-git-remove" data-git-index="' + blockIndex + '" title="Remove tag">✕</button>'
                + '</div></div>'
                + pillsHtml
                + (repo ? '<div class="ai-git-info">'
                    + '<span class="ai-git-info-item">📦 ' + escapeHtml(repo) + '</span>'
                    + (branch ? '<span class="ai-git-info-item">🌿 ' + escapeHtml(branch) + '</span>' : '')
                    + (pathFilter ? '<span class="ai-git-info-item">📂 ' + escapeHtml(pathFilter) + '</span>' : '')
                    + '</div>' : '')
                + (!hasToken ? '<div class="ai-git-token-hint">💡 <a class="ai-git-set-token" data-git-index="' + blockIndex + '">Add a GitHub token</a> for private repos & higher rate limits (5,000/hr vs 60/hr).</div>' : '')
                + '<div class="ai-git-prompt"><textarea class="ai-git-prompt-input" data-git-index="' + blockIndex + '" placeholder="Optional: describe what you want to analyze…" rows="2">' + escapeHtml(promptVal) + '</textarea></div>'
                + resultHtml
                + '</div>';

            blockIndex++;
            lastIndex = match.index + match[0].length;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // BIND — wire up card buttons after render
    // ==============================================
    function bindGitPreviewActions(container) {
        // ▶ Run — analyze repo
        container.querySelectorAll('.ai-git-run').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gitIndex, 10);
                runGitAnalysis(idx, container);
            });
        });

        // 🔑 Token button
        container.querySelectorAll('.ai-git-token-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                showTokenModal(function () {
                    M.renderMarkdown();
                });
            });
        });

        // Token hint link
        container.querySelectorAll('.ai-git-set-token').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                showTokenModal(function () {
                    M.renderMarkdown();
                });
            });
        });

        // ✕ Remove tag
        container.querySelectorAll('.ai-git-remove').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gitIndex, 10);
                removeGitTag(idx);
            });
        });

        // Action pills
        container.querySelectorAll('.ai-git-action-pill').forEach(function (pill) {
            pill.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gitIndex, 10);
                var newAction = this.dataset.action;

                // Update visual pills
                var pillContainer = this.parentNode;
                pillContainer.querySelectorAll('.ai-git-action-pill').forEach(function (p) {
                    p.classList.remove('active');
                });
                this.classList.add('active');

                // Update card data
                var card = this.closest('.ai-git-card');
                if (card) card.dataset.gitAction = newAction;

                // Sync to editor
                syncFieldToEditor(idx, '@action', newAction);
            });
        });

        // Model select
        container.querySelectorAll('.ai-git-model-select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                var modelId = this.value;
                if (!modelId) return;
                var models = window.AI_MODELS || {};
                var modelInfo = models[modelId];

                if (modelInfo && modelInfo.isLocal && M._ai && M._ai.isLocalModel && M._ai.isLocalModel(modelId)) {
                    var ls = M._ai.getLocalState(modelId);
                    if (!ls.loaded && !ls.worker) {
                        var consentKey = M.KEYS.AI_CONSENTED_PREFIX + modelId;
                        var hasConsent = localStorage.getItem(consentKey);
                        if (hasConsent) {
                            M._ai.initAiWorker(modelId);
                        } else if (M.showModelDownloadPopup) {
                            M.showModelDownloadPopup(modelId);
                        }
                    }
                }

                var providers = M.getCloudProviders ? M.getCloudProviders() : {};
                var cloudProvider = providers[modelId];
                if (cloudProvider && !cloudProvider.getKey()) {
                    M.showApiKeyModal(modelId);
                }

                syncFieldToEditor(parseInt(this.dataset.gitIndex, 10), '@model', modelId);
            });
        });

        // Prompt input sync
        container.querySelectorAll('.ai-git-prompt-input').forEach(function (ta) {
            var timer = null;
            ta.addEventListener('input', function () {
                var self = this;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    syncFieldToEditor(parseInt(self.dataset.gitIndex, 10), '@prompt', self.value.trim());
                }, 400);
            });
            ta.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
        });

        // Accept button
        container.querySelectorAll('.ai-git-accept').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gitIndex, 10);
                acceptResult(idx);
            });
        });

        // Reject button
        container.querySelectorAll('.ai-git-reject').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gitIndex, 10);
                generatedResults.delete(idx);
                M.renderMarkdown();
            });
        });

        // Copy button
        container.querySelectorAll('[data-git-copy]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.gitIndex, 10);
                var r = generatedResults.get(idx);
                if (r && r.raw) {
                    navigator.clipboard.writeText(r.raw).then(function () {
                        btn.textContent = '✅ Copied';
                        setTimeout(function () { btn.textContent = '📋 Copy'; }, 1500);
                    });
                }
            });
        });
    }

    // ==============================================
    // RUN — AI-powered GitHub analysis
    // ==============================================
    async function runGitAnalysis(blockIndex, container) {
        var text = M.markdownEditor.value;
        var re = /\{\{@?Git:\s*([\s\S]*?)\}\}/g;
        var match, idx = 0;
        var block = null;
        while ((match = re.exec(text)) !== null) {
            if (idx === blockIndex) {
                block = { prompt: match[1].trim(), fullMatch: match[0], start: match.index, end: match.index + match[0].length };
                break;
            }
            idx++;
        }
        if (!block) return;

        // Parse fields from block
        var fieldEnd = '(?=\\s+@|\\s*$)';
        var repoMatch = block.prompt.match(new RegExp('(?:^|\\s)(?:@repo|Repo):\\s*(\\S+)' + fieldEnd, 'mi'));
        var repo = repoMatch ? normalizeRepo(repoMatch[1].trim()) : '';
        if (!repo) {
            M.showToast && M.showToast('⚠️ Please specify @repo: owner/name', 'warning');
            return;
        }

        // Get action from card
        var card = container.querySelector('.ai-git-card[data-git-index="' + blockIndex + '"]');
        var action = card ? (card.dataset.gitAction || 'summary') : 'summary';

        var branchMatch = block.prompt.match(new RegExp('(?:^|\\s)(?:@branch|Branch):\\s*(\\S+)' + fieldEnd, 'mi'));
        var branch = branchMatch ? branchMatch[1].trim() : '';

        var pathMatch = block.prompt.match(new RegExp('(?:^|\\s)(?:@path|Path):\\s*(\\S+)' + fieldEnd, 'mi'));
        var pathFilter = pathMatch ? pathMatch[1].trim() : '';

        // Get selected model
        var cardSelect = card ? card.querySelector('.ai-git-model-select') : null;
        var perCardModel = cardSelect ? cardSelect.value : null;
        var originalModel = M.getCurrentAiModel ? M.getCurrentAiModel() : null;

        // Pre-flight: check model is ready BEFORE fetching repo
        var models = window.AI_MODELS || {};
        var checkModelId = perCardModel || originalModel;
        var modelInfo = checkModelId ? models[checkModelId] : null;
        if (modelInfo) {
            if (modelInfo.isLocal) {
                // Local model — auto-load from cache if previously downloaded
                if (M._ai && M._ai.getLocalState) {
                    var ls = M._ai.getLocalState(checkModelId);
                    if (!ls.loaded && !ls.worker) {
                        var consentKey = M.KEYS && M.KEYS.AI_CONSENTED_PREFIX
                            ? M.KEYS.AI_CONSENTED_PREFIX + checkModelId : null;
                        var hasConsent = consentKey && localStorage.getItem(consentKey);
                        if (hasConsent && M._ai.initAiWorker) {
                            // Auto-init from cache — show loading toast
                            M.showToast && M.showToast('⏳ Loading "' + (modelInfo.label || checkModelId) + '" from cache…', 'info');
                            M._ai.initAiWorker(checkModelId);
                            // Wait for model to become ready (poll every 500ms, max 60s)
                            var waited = 0;
                            while (waited < 60000) {
                                await new Promise(function (r) { setTimeout(r, 500); });
                                waited += 500;
                                ls = M._ai.getLocalState(checkModelId);
                                if (ls.loaded) break;
                            }
                            if (!ls.loaded) {
                                M.showToast && M.showToast('⚠️ Model is still loading. Please wait and try again.', 'warning');
                                return;
                            }
                        } else {
                            // Never downloaded — show download popup or error
                            if (M.showModelDownloadPopup) {
                                M.showModelDownloadPopup(checkModelId);
                            } else {
                                M.showToast && M.showToast('⚠️ Local model "' + (modelInfo.label || checkModelId) + '" needs to be downloaded first. Select it in the AI panel, or choose a cloud model.', 'warning');
                            }
                            return;
                        }
                    }
                }
            } else {
                // Cloud model — must have API key
                var providers = M.getCloudProviders ? M.getCloudProviders() : {};
                var provider = providers[checkModelId];
                if (provider && !provider.getKey()) {
                    M.showToast && M.showToast('🔑 Please set your API key for "' + (modelInfo.label || checkModelId) + '" first.', 'warning');
                    M.showApiKeyModal && M.showApiKeyModal(checkModelId);
                    return;
                }
            }
        }

        if (perCardModel && perCardModel !== originalModel && M.switchToModel) {
            M.switchToModel(perCardModel);
        }

        // Get user prompt
        var promptArea = card ? card.querySelector('.ai-git-prompt-input') : null;
        var userPromptExtra = promptArea ? promptArea.value.trim() : '';

        // Use saved token if available — public repos work without one
        var token = getToken();

        // UI: loading state
        var runBtn = card ? card.querySelector('.ai-git-run') : null;
        var labelEl = card ? card.querySelector('.ai-git-label') : null;
        if (runBtn) { runBtn.disabled = true; runBtn.textContent = '⏳ Fetching…'; }
        if (labelEl) { labelEl.dataset.origText = labelEl.textContent; labelEl.textContent = 'Fetching repo…'; }
        if (card) card.classList.add('ai-git-loading');

        console.log('[Git] 🐙 Starting analysis:', { repo: repo, action: action, branch: branch || 'main', pathFilter: pathFilter || '(all)', model: perCardModel || originalModel, hasToken: !!token });

        try {
            // Step 1: Fetch repo contents
            if (runBtn) runBtn.textContent = '⏳ Fetching…';
            if (labelEl) labelEl.textContent = 'Fetching repo…';

            console.log('[Git] 📡 Fetching file tree from GitHub API…');
            var files = await fetchRepoContents(repo, branch, pathFilter, token, perCardModel || originalModel);
            if (!files || files.length === 0) {
                throw new Error('No source files found in repository. Check repo name and permissions.');
            }
            console.log('[Git] ✅ Fetched ' + files.length + ' files:', files.map(function(f) { return f.path; }));

            // Build context from files
            var context = 'Repository: ' + repo + '\n';
            if (branch) context += 'Branch: ' + branch + '\n';
            if (pathFilter) context += 'Path filter: ' + pathFilter + '\n';
            context += 'Files fetched: ' + files.length + '\n\n';

            var totalChars = 0;
            files.forEach(function (f) {
                context += '=== FILE: ' + f.path + ' ===\n' + f.content + '\n\n';
                totalChars += f.content.length;
            });
            console.log('[Git] 📊 Total context size: ' + (totalChars / 1024).toFixed(1) + ' KB (' + totalChars + ' chars)');

            // Step 2: Send to AI
            if (runBtn) runBtn.textContent = '⏳ Analyzing…';
            if (labelEl) labelEl.textContent = 'AI analyzing…';

            var systemPrompt = ACTION_PROMPTS[action] || ACTION_PROMPTS.summary;
            var fullPrompt = systemPrompt + '\n\n--- REPOSITORY CODE ---\n' + context;
            if (userPromptExtra) {
                fullPrompt += '\n\n--- ADDITIONAL USER INSTRUCTIONS ---\n' + userPromptExtra;
            }

            console.log('[Git] 🤖 Sending to AI model (' + (perCardModel || originalModel) + ')… Prompt size: ' + (fullPrompt.length / 1024).toFixed(1) + ' KB');

            var result = await M.requestAiTask({
                taskType: 'generate',
                context: '',
                userPrompt: fullPrompt,
                enableThinking: false,
                silent: true
            });

            console.log('[Git] ✅ AI response received (' + (result ? result.length : 0) + ' chars)');

            // Render result as HTML via marked
            var resultHtml = '';
            if (typeof marked !== 'undefined') {
                resultHtml = DOMPurify.sanitize(marked.parse(result));
            } else {
                resultHtml = '<pre>' + escapeHtml(result) + '</pre>';
            }

            // Store result
            generatedResults.set(blockIndex, { html: resultHtml, raw: result });

            // Re-render to show result
            M.renderMarkdown();

            var actionLabel = ACTIONS.find(function (a) { return a.id === action; });
            console.log('[Git] 🎉 Analysis complete! Action: ' + (actionLabel ? actionLabel.label : action));
            M.showToast && M.showToast('🐙 ' + (actionLabel ? actionLabel.label : action) + ' analysis complete!', 'success');

        } catch (err) {
            var errMsg = err.message || 'Unknown error';
            // If 401/403 and no token, offer to add one and retry
            if (!token && (errMsg.indexOf('403') !== -1 || errMsg.indexOf('401') !== -1)) {
                M.showToast && M.showToast('🔑 Rate limited or private repo — add a GitHub token to continue.', 'warning');
                await new Promise(function (resolve) {
                    showTokenModal(function (t) {
                        token = t;
                        resolve();
                    });
                });
                if (token) {
                    // Retry with token
                    if (runBtn) { runBtn.disabled = false; runBtn.textContent = '▶ Run'; }
                    if (labelEl && labelEl.dataset.origText) labelEl.textContent = labelEl.dataset.origText;
                    if (card) card.classList.remove('ai-git-loading');
                    return runGitAnalysis(blockIndex, container);
                }
            }
            // If error mentions API key or model not ready, auto-open the API key modal for cloud models
            if (errMsg.indexOf('API key') !== -1 || errMsg.indexOf('model not ready') !== -1) {
                var fixModelId = perCardModel || originalModel;
                var fixProviders = M.getCloudProviders ? M.getCloudProviders() : {};
                if (fixProviders[fixModelId] && M.showApiKeyModal) {
                    M.showApiKeyModal(fixModelId);
                }
            }
            M.showToast && M.showToast('❌ Git analysis failed: ' + errMsg, 'error');
        } finally {
            if (runBtn) { runBtn.disabled = false; runBtn.textContent = '▶ Run'; }
            if (labelEl && labelEl.dataset.origText) labelEl.textContent = labelEl.dataset.origText;
            if (card) card.classList.remove('ai-git-loading');
            if (perCardModel && originalModel && perCardModel !== originalModel && M.switchToModel) {
                M.switchToModel(originalModel);
            }
        }
    }

    // ==============================================
    // ACCEPT — replace tag with result
    // ==============================================
    function acceptResult(blockIndex) {
        var r = generatedResults.get(blockIndex);
        if (!r || !r.raw) return;

        var text = M.markdownEditor.value;
        var re = /\{\{@?Git:\s*([\s\S]*?)\}\}/g;
        var match, idx = 0;
        while ((match = re.exec(text)) !== null) {
            if (idx === blockIndex) {
                M.markdownEditor.value = text.substring(0, match.index)
                    + r.raw
                    + text.substring(match.index + match[0].length);
                M.markdownEditor.dispatchEvent(new Event('input'));
                generatedResults.delete(blockIndex);
                M.showToast && M.showToast('✓ Result accepted and inserted.', 'success');
                return;
            }
            idx++;
        }
    }

    // ==============================================
    // REMOVE — remove tag from editor
    // ==============================================
    function removeGitTag(blockIndex) {
        var text = M.markdownEditor.value;
        var re = /\{\{@?Git:\s*([\s\S]*?)\}\}/g;
        var match, idx = 0;
        while ((match = re.exec(text)) !== null) {
            if (idx === blockIndex) {
                M.markdownEditor.value = text.substring(0, match.index) + text.substring(match.index + match[0].length);
                M.markdownEditor.dispatchEvent(new Event('input'));
                generatedResults.delete(blockIndex);
                return;
            }
            idx++;
        }
    }

    // ==============================================
    // EDITOR SYNC — update fields in editor text
    // ==============================================
    function getGitBlocks(text) {
        var blocks = [];
        var re = /\{\{@?Git:\s*([\s\S]*?)\}\}/g;
        var m;
        while ((m = re.exec(text)) !== null) {
            blocks.push({ start: m.index, end: m.index + m[0].length, content: m[0], inner: m[1] });
        }
        return blocks;
    }

    function syncFieldToEditor(blockIndex, field, value) {
        var text = M.markdownEditor ? M.markdownEditor.value : '';
        var blocks = getGitBlocks(text);
        if (blockIndex >= blocks.length) return;
        var block = blocks[blockIndex];
        var tagContent = block.content;
        var fieldName = field.replace('@', '');
        var fieldRe = new RegExp('^(\\s*)(?:@' + fieldName + '|' + fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + '):\\s*\\S+', 'mi');
        var newTag;
        if (fieldRe.test(tagContent)) {
            newTag = tagContent.replace(fieldRe, '$1@' + fieldName + ': ' + value);
        } else {
            var colonIdx = tagContent.indexOf(':');
            newTag = tagContent.substring(0, colonIdx + 1)
                + '\n  @' + fieldName + ': ' + value
                + tagContent.substring(colonIdx + 1);
        }
        M.markdownEditor.value = text.substring(0, block.start) + newTag + text.substring(block.end);
    }

    // ==============================================
    // TAG INSERTION — toolbar action
    // ==============================================
    function insertGitTag() {
        // Show confirmation dialog — Git analysis needs large context
        var old = document.getElementById('git-context-warning');
        if (old) old.remove();

        var overlay = document.createElement('div');
        overlay.id = 'git-context-warning';
        overlay.className = 'clear-confirm-overlay';
        overlay.innerHTML =
            '<div class="clear-confirm-card">'
            + '<div class="clear-confirm-header" style="color:#f59e0b;background:rgba(245,158,11,0.08);border-bottom-color:rgba(245,158,11,0.15)">'
            + '<i class="bi bi-exclamation-triangle-fill"></i> Git Analysis — Context Window Warning'
            + '</div>'
            + '<div class="clear-confirm-body">'
            + '<p>Git analysis fetches and sends entire repository source code to the AI model. This requires a <strong>large context window</strong>.</p>'
            + '<p>⚠️ <strong>Local models</strong> (Qwen, LFM) have small context windows and may fail or produce incomplete results for bigger repos.</p>'
            + '<p>✅ <strong>Cloud models</strong> (Groq, Gemini, OpenRouter) are recommended for Git analysis.</p>'
            + '</div>'
            + '<div class="clear-confirm-actions">'
            + '<button class="clear-confirm-cancel" id="git-warn-cancel">Cancel</button>'
            + '<button class="clear-confirm-ok" id="git-warn-ok" style="border-color:rgba(245,158,11,0.4);background:rgba(245,158,11,0.15);color:#f59e0b">'
            + '<i class="bi bi-check-lg"></i> Continue'
            + '</button>'
            + '</div>'
            + '</div>';

        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('active'); });

        function close() {
            overlay.classList.remove('active');
            setTimeout(function () { overlay.remove(); }, 200);
        }

        overlay.querySelector('#git-warn-cancel').addEventListener('click', close);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

        overlay.querySelector('#git-warn-ok').addEventListener('click', function () {
            close();
            var defaultModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : '') || 'gemini-flash';
            M.wrapSelectionWith(
                '{{@Git:\n  @repo: ',
                '\n  @action: summary\n  @model: ' + defaultModel + '\n  @prompt: \n}}',
                'owner/repo-name'
            );
        });

        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler, true); }
        }, true);
    }

    // ==============================================
    // EXPOSE ON M — for renderer.js to call
    // ==============================================
    M.transformGitMarkdown = transformGitMarkdown;
    M.bindGitPreviewActions = bindGitPreviewActions;

    // Register toolbar action
    if (M.registerFormattingAction) {
        M.registerFormattingAction('git-tag', insertGitTag);
    }

    // Trigger re-render
    if (M.markdownEditor) {
        M.markdownEditor.dispatchEvent(new Event('input'));
    }

})(window.MDView);
