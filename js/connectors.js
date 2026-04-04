// ============================================
// connectors.js — My Connectors: Third-party Data Sources for AI
// Connects Slack, GitHub, Notion, Linear to the AI Assistant & DocGen tags
// ============================================
(function (M) {
    'use strict';

    // --- Storage Key Prefix ---
    var STORAGE_PREFIX = 'ta-connector-';

    // --- Connector Registry ---
    var REGISTRY = {
        slack: {
            id: 'slack',
            name: 'Slack',
            description: 'Pull recent channel messages into AI context',
            icon: 'bi-slack',
            color: '#4A154B',
            gradient: 'linear-gradient(135deg, #4A154B 0%, #7B2F7E 100%)',
            authType: 'token',
            tokenKey: 'xoxp-... or xoxb-...',
            tokenLabel: 'Slack OAuth Token',
            tokenHint: 'Get from api.slack.com → Your Apps → OAuth & Permissions',
            tokenLink: 'https://api.slack.com/apps',
            tokenPlaceholder: 'xoxp-...',
            configFields: [
                { key: 'channel', label: 'Channel ID', placeholder: 'C0123456789', hint: 'Find in Slack: Right-click channel → View channel details → copy ID at bottom' }
            ],
            testEndpoint: 'https://slack.com/api/auth.test',
            testHeaders: function (token) { return { 'Authorization': 'Bearer ' + token }; },
        },
        github: {
            id: 'github',
            name: 'GitHub',
            description: 'Surface open issues, PRs, and commits',
            icon: 'bi-github',
            color: '#24292e',
            gradient: 'linear-gradient(135deg, #24292e 0%, #404448 100%)',
            authType: 'token',
            tokenKey: 'ghp_...',
            tokenLabel: 'Personal Access Token',
            tokenHint: 'Settings → Developer settings → Personal access tokens → Tokens (classic)',
            tokenLink: 'https://github.com/settings/tokens',
            tokenPlaceholder: 'ghp_...',
            configFields: [
                { key: 'repo', label: 'Repository', placeholder: 'owner/repo', hint: 'e.g. octocat/hello-world' }
            ],
            testEndpoint: 'https://api.github.com/user',
            testHeaders: function (token) { return { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json' }; },
        },
        notion: {
            id: 'notion',
            name: 'Notion',
            description: 'Query databases and page content',
            icon: 'bi-journal-text',
            color: '#000000',
            gradient: 'linear-gradient(135deg, #1a1a1a 0%, #3d3d3d 100%)',
            authType: 'token',
            tokenKey: 'ntn_...',
            tokenLabel: 'Notion Integration Secret',
            tokenHint: 'notion.so/my-integrations → New Integration → Copy secret',
            tokenLink: 'https://www.notion.so/my-integrations',
            tokenPlaceholder: 'ntn_...',
            configFields: [
                { key: 'database_id', label: 'Database ID', placeholder: '32-char ID from Notion URL', hint: 'Open database → Share → Copy link → extract the ID from URL' }
            ],
            testEndpoint: 'https://api.notion.com/v1/users/me',
            testHeaders: function (token) { return { 'Authorization': 'Bearer ' + token, 'Notion-Version': '2022-06-28' }; },
            corsProxy: true, // Notion blocks CORS — use proxy hint
            comingSoon: true,
        },
        linear: {
            id: 'linear',
            name: 'Linear',
            description: 'View assigned issues and sprint status',
            icon: 'bi-layers',
            color: '#5E6AD2',
            gradient: 'linear-gradient(135deg, #5E6AD2 0%, #7B8AE8 100%)',
            authType: 'token',
            tokenKey: 'lin_api_...',
            tokenLabel: 'Linear API Key',
            tokenHint: 'Settings → API → Personal API keys → Create key',
            tokenLink: 'https://linear.app/settings/api',
            tokenPlaceholder: 'lin_api_...',
            configFields: [],
            testEndpoint: 'https://api.linear.app/graphql',
            testMethod: 'POST',
            testBody: JSON.stringify({ query: '{ viewer { id name email } }' }),
            testHeaders: function (token) { return { 'Authorization': token, 'Content-Type': 'application/json' }; },
        },
        jira: {
            id: 'jira',
            name: 'Jira',
            description: 'Pull active sprint issues and comments',
            icon: 'bi-kanban',
            color: '#0052CC',
            gradient: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
            authType: 'token',
            tokenLabel: 'Jira API Token',
            tokenHint: 'id.atlassian.com/manage-profile/security/api-tokens',
            tokenLink: 'https://id.atlassian.com/manage-profile/security/api-tokens',
            tokenPlaceholder: 'ATATT3...',
            configFields: [
                { key: 'domain', label: 'Jira Domain', placeholder: 'yourteam.atlassian.net', hint: 'Your Jira Cloud domain without https://' },
                { key: 'email', label: 'Account Email', placeholder: 'you@company.com', hint: 'Your Atlassian account email' },
                { key: 'project', label: 'Project Key', placeholder: 'PROJ', hint: 'The project key shown in issue IDs like PROJ-123' }
            ],
        },
        google_drive: {
            id: 'google_drive',
            name: 'Google Drive',
            description: 'Search Docs, Sheets, and Drive files',
            icon: 'bi-google',
            color: '#4285F4',
            gradient: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
            authType: 'token',
            tokenLabel: 'API Key (or OAuth Token)',
            tokenHint: 'For full access, use a Google OAuth token. Get a basic API key at console.cloud.google.com',
            tokenLink: 'https://console.cloud.google.com/apis/credentials',
            tokenPlaceholder: 'AIza... or ya29...',
            configFields: [
                { key: 'query', label: 'Search Query', placeholder: 'e.g. meeting notes Q1', hint: 'Pre-set a search query to always pull from this source' }
            ],
            comingSoon: true,
        },

        // ----- FREE / KEYLESS CONNECTORS (no signup needed) -----
        hackernews: {
            id: 'hackernews',
            name: 'Hacker News',
            description: 'Top tech stories with comments — no API key needed',
            icon: 'bi-fire',
            color: '#FF6600',
            gradient: 'linear-gradient(135deg, #FF6600 0%, #FF8C00 100%)',
            authType: 'none',  // no token required
            badge: 'Free · No key',
            configFields: [
                { key: 'count', label: 'Number of stories', placeholder: '5', hint: 'How many top stories to pull (1-20). Default: 5.' },
                { key: 'comments', label: 'Include top comments', placeholder: 'true', hint: 'Set to "false" to skip fetching comments (faster, less context).' }
            ],
        },
        openmeteo: {
            id: 'openmeteo',
            name: 'Weather',
            description: 'Live weather via Open-Meteo — no API key needed',
            icon: 'bi-cloud-sun',
            color: '#0EA5E9',
            gradient: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
            authType: 'none',
            badge: 'Free · No key',
            configFields: [
                { key: 'city', label: 'City name', placeholder: 'Tokyo', hint: 'Name of your city (appears in weather report header)' },
                { key: 'lat', label: 'Latitude', placeholder: '35.6762', hint: 'Your city latitude (e.g. Tokyo: 35.6762, NYC: 40.7128, London: 51.5074)' },
                { key: 'lon', label: 'Longitude', placeholder: '139.6503', hint: 'Your city longitude (e.g. Tokyo: 139.6503, NYC: -74.0060, London: -0.1278)' }
            ],
        },
    };

    // --- State Management ---
    function getConnectorState(id) {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_PREFIX + id) || 'null');
        } catch (e) { return null; }
    }

    function saveConnectorState(id, state) {
        try {
            local.setItem(STORAGE_PREFIX + id, JSON.stringify(state));
        } catch (e) { console.warn('Connectors: save failed', e); }
    }

    function getToken(id) {
        var state = getConnectorState(id);
        return state ? state.token : null;
    }

    function getConfig(id) {
        var state = getConnectorState(id);
        return (state && state.config) ? state.config : {};
    }

    function isConnected(id) {
        var state = getConnectorState(id);
        // Keyless connectors use token='KEYLESS'
        return !!(state && state.connected && (state.token || (REGISTRY[id] && REGISTRY[id].authType === 'none')));
    }

    function isEnabled(id) {
        var state = getConnectorState(id);
        return !!(state && state.connected && state.enabled !== false && (state.token || (REGISTRY[id] && REGISTRY[id].authType === 'none')));
    }

    function hasActiveConnectors() {
        // Reads from localStorage state only — not affected by DOM checkbox
        return Object.keys(REGISTRY).some(function (id) { return isEnabled(id); });
    }

    // --- Data Fetching ---

    async function fetchSlackContext(token, config) {
        var channelId = config.channel;
        if (!channelId) return '[Slack] No channel configured.';

        try {
            var resp = await fetch('https://slack.com/api/conversations.history?channel=' + encodeURIComponent(channelId) + '&limit=15', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            var data = await resp.json();
            if (!data.ok) return '[Slack] Error: ' + data.error;
            var lines = (data.messages || []).reverse().map(function (m) {
                var user = m.username || m.user || 'User';
                var text = (m.text || '').substring(0, 300);
                return '• ' + user + ': ' + text;
            });
            return '[Slack Channel ' + channelId + ']\n' + lines.join('\n');
        } catch (e) {
            return '[Slack] Failed to fetch: ' + e.message;
        }
    }

    async function fetchGitHubContext(token, config) {
        var repo = config.repo;
        if (!repo) return '[GitHub] No repository configured.';
        var headers = { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json' };

        try {
            // Fetch open issues and PRs
            var [issuesResp, prsResp] = await Promise.all([
                fetch('https://api.github.com/repos/' + repo + '/issues?state=open&per_page=8&sort=updated', { headers: headers }),
                fetch('https://api.github.com/repos/' + repo + '/pulls?state=open&per_page=5&sort=updated', { headers: headers })
            ]);
            var issues = await issuesResp.json();
            var prs = await prsResp.json();

            if (!Array.isArray(issues)) return '[GitHub] Could not access repo: ' + repo;

            var lines = ['[GitHub — ' + repo + ']'];
            if (issues.length > 0) {
                lines.push('Open Issues:');
                issues.slice(0, 8).forEach(function (issue) {
                    if (!issue.pull_request) {
                        lines.push('  • #' + issue.number + ': ' + issue.title + (issue.assignees && issue.assignees.length ? ' [@' + issue.assignees[0].login + ']' : ''));
                    }
                });
            }
            if (Array.isArray(prs) && prs.length > 0) {
                lines.push('Open PRs:');
                prs.slice(0, 5).forEach(function (pr) {
                    lines.push('  • PR #' + pr.number + ': ' + pr.title + ' (by @' + pr.user.login + ')');
                });
            }
            return lines.join('\n');
        } catch (e) {
            return '[GitHub] Failed to fetch: ' + e.message;
        }
    }

    async function fetchNotionContext(token, config) {
        var dbId = config.database_id;
        if (!dbId) return '[Notion] No database ID configured.';
        // Notion blocks CORS — warn user
        return '[Notion] Note: Notion API blocks browser requests due to CORS. To use Notion context, copy your data and paste it into the editor directly, or use a CORS proxy. Token is saved for future use.';
    }

    async function fetchLinearContext(token) {
        var query = `{
            viewer {
                assignedIssues(filter: { state: { type: { nin: ["completed", "cancelled"] } } }, first: 10) {
                    nodes {
                        identifier
                        title
                        priority
                        state { name }
                        team { name }
                    }
                }
            }
        }`;
        try {
            var resp = await fetch('https://api.linear.app/graphql', {
                method: 'POST',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });
            var data = await resp.json();
            var issues = (data.data && data.data.viewer && data.data.viewer.assignedIssues && data.data.viewer.assignedIssues.nodes) || [];
            if (issues.length === 0) return '[Linear] No active issues assigned to you.';
            var lines = ['[Linear — Assigned Issues]'];
            issues.forEach(function (issue) {
                var prio = ['', '🔴 Urgent', '🟠 High', '🟡 Medium', '🔵 Low'][issue.priority] || '';
                lines.push('  • ' + issue.identifier + ': ' + issue.title + ' [' + issue.state.name + ']' + (prio ? ' ' + prio : ''));
            });
            return lines.join('\n');
        } catch (e) {
            return '[Linear] Failed to fetch: ' + e.message;
        }
    }

    async function fetchJiraContext(token, config) {
        var domain = config.domain;
        var email = config.email;
        var project = config.project;
        if (!domain || !email || !project) return '[Jira] Missing configuration (domain, email, or project).';
        var auth = btoa(email + ':' + token);
        var jql = encodeURIComponent('project = ' + project + ' AND assignee = currentUser() AND sprint in openSprints() ORDER BY updated DESC');
        try {
            var resp = await fetch('https://' + domain + '/rest/api/3/search?jql=' + jql + '&maxResults=10&fields=summary,status,priority', {
                headers: { 'Authorization': 'Basic ' + auth, 'Accept': 'application/json' }
            });
            var data = await resp.json();
            if (!data.issues) return '[Jira] Could not fetch issues.';
            var lines = ['[Jira — ' + project + ' Sprint]'];
            data.issues.forEach(function (issue) {
                var status = issue.fields.status ? issue.fields.status.name : '';
                var priority = issue.fields.priority ? issue.fields.priority.name : '';
                lines.push('  • ' + issue.key + ': ' + issue.fields.summary + ' [' + status + '] [' + priority + ']');
            });
            return lines.join('\n');
        } catch (e) {
            return '[Jira] Failed to fetch: ' + e.message;
        }
    }

    async function fetchGoogleDriveContext(token, config) {
        var query = config.query || 'type:document';
        try {
            var resp = await fetch('https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent(query) + '&pageSize=8&fields=files(name,mimeType,modifiedTime,webViewLink)', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            var data = await resp.json();
            if (!data.files) return '[Google Drive] Could not access Drive.';
            var lines = ['[Google Drive — Recent Files]'];
            data.files.forEach(function (f) {
                var typeIcon = f.mimeType === 'application/vnd.google-apps.document' ? '📄' :
                    f.mimeType === 'application/vnd.google-apps.spreadsheet' ? '📊' :
                    f.mimeType === 'application/vnd.google-apps.presentation' ? '📊' : '📁';
                lines.push('  • ' + typeIcon + ' ' + f.name + ' (' + new Date(f.modifiedTime).toLocaleDateString() + ')');
            });
            return lines.join('\n');
        } catch (e) {
            return '[Google Drive] Failed to fetch: ' + e.message;
        }
    }

    // Strip HTML tags from HN's self-post text field
    function stripHtml(html) {
        if (!html) return '';
        return html
            .replace(/<p>/gi, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, '$2 ($1)')
            .replace(/<[^>]+>/g, '')
            .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"')
            .trim();
    }

    async function fetchHackerNewsContext(config) {
        var count = Math.min(20, Math.max(1, parseInt(config.count) || 5));
        var includeComments = config.comments !== 'false'; // fetch top comments by default
        try {
            var resp = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
            var ids = await resp.json();
            var topIds = ids.slice(0, count);

            // Fetch full item details for each story
            var stories = await Promise.all(topIds.map(function (id) {
                return fetch('https://hacker-news.firebaseio.com/v0/item/' + id + '.json')
                    .then(function (r) { return r.json(); })
                    .catch(function () { return null; });
            }));

            // Optionally fetch top 2 comments per story for richer context
            var commentFetches = [];
            if (includeComments) {
                stories.forEach(function (s) {
                    if (!s || !s.kids || s.kids.length === 0) { commentFetches.push(Promise.resolve([])); return; }
                    var topKids = s.kids.slice(0, 3);
                    commentFetches.push(Promise.all(topKids.map(function (kid) {
                        return fetch('https://hacker-news.firebaseio.com/v0/item/' + kid + '.json')
                            .then(function (r) { return r.json(); })
                            .catch(function () { return null; });
                    })));
                });
            }
            var allComments = includeComments ? await Promise.all(commentFetches) : stories.map(function () { return []; });

            var lines = ['[Hacker News — Top ' + count + ' Stories with Context]',
                         'Fetched: ' + new Date().toUTCString(), ''];

            stories.forEach(function (s, i) {
                if (!s) return;
                var storyComments = allComments[i] || [];

                lines.push('---');
                lines.push('Story #' + (i + 1) + ': ' + s.title);
                lines.push('Source: ' + (s.url || 'https://news.ycombinator.com/item?id=' + s.id));
                lines.push('Score: ▲' + (s.score || 0) + ' | Comments: ' + (s.descendants || 0) + ' | By: ' + (s.by || 'unknown'));

                // Self-post body text (Ask HN, Show HN, etc.)
                if (s.text) {
                    var bodyText = stripHtml(s.text);
                    if (bodyText.length > 600) bodyText = bodyText.substring(0, 600) + '...';
                    lines.push('Post content: ' + bodyText);
                }

                // Top community comments (these often summarize or critique the article)
                var validComments = storyComments.filter(function (c) { return c && c.text && !c.deleted && !c.dead; });
                if (validComments.length > 0) {
                    lines.push('Top community comments:');
                    validComments.forEach(function (c) {
                        var commentText = stripHtml(c.text || '');
                        if (commentText.length > 300) commentText = commentText.substring(0, 300) + '...';
                        lines.push('  > [' + (c.by || '?') + ']: ' + commentText);
                    });
                }
                lines.push('');
            });

            return lines.join('\n');
        } catch (e) {
            return '[Hacker News] Failed to fetch: ' + e.message;
        }
    }

    /**
     * Extract a location/city name from a natural language query.
     * Examples:
     *   "what is the temp on new delhi"  → "new delhi"
     *   "weather in Paris"               → "Paris"
     *   "temperature of Tokyo"           → "Tokyo"
     *   "how's the weather for London?"  → "London"
     *   "New York forecast"              → "New York"
     */
    function extractLocationFromQuery(query) {
        if (!query) return null;
        var q = query.trim();

        // Strategy 1: Preposition-based extraction — most reliable
        // Match "in/of/for/at/on + location" at end of query
        var prepMatch = q.match(/\b(?:in|of|for|at|on|near)\s+([A-Za-z][A-Za-z\s.''-]{1,40}?)\s*[?.!]*$/i);
        if (prepMatch) {
            var loc = prepMatch[1].trim().replace(/[?.!]+$/, '').trim();
            // Filter out common non-location words
            if (loc && !/^(the|this|that|my|your|our|today|tomorrow|now|here|there)$/i.test(loc)) {
                return loc;
            }
        }

        // Strategy 2: "weather [city]" or "[city] weather" pattern
        var weatherMatch = q.match(/\bweather\s+(?:in\s+|of\s+|for\s+|at\s+)?([A-Za-z][A-Za-z\s.''-]{1,40}?)(?:\s*[?.!]*$)/i);
        if (weatherMatch) return weatherMatch[1].trim();
        var weatherMatch2 = q.match(/^([A-Za-z][A-Za-z\s.''-]{1,40}?)\s+weather/i);
        if (weatherMatch2) return weatherMatch2[1].trim();

        // Strategy 3: "temp/temperature [city]" pattern
        var tempMatch = q.match(/\b(?:temp|temperature|forecast|climate)\s+(?:in\s+|of\s+|for\s+|at\s+|on\s+)?([A-Za-z][A-Za-z\s.''-]{1,40}?)(?:\s*[?.!]*$)/i);
        if (tempMatch) return tempMatch[1].trim();

        // Strategy 4: Detect capitalized multi-word sequences (likely proper nouns)
        // e.g. "tell me about New Delhi" → "New Delhi"
        var capsMatches = q.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g);
        if (capsMatches) {
            // Filter out common English words that happen to be capitalized at sentence start
            var stopWords = ['What', 'How', 'Tell', 'Show', 'Please', 'Can', 'Could', 'Would', 'The', 'Is', 'Are', 'Get', 'Fetch'];
            var locations = capsMatches.filter(function (m) {
                return stopWords.indexOf(m.split(' ')[0]) === -1;
            });
            if (locations.length > 0) {
                // Return the longest match (more likely to be "New Delhi" vs "New")
                locations.sort(function (a, b) { return b.length - a.length; });
                return locations[0];
            }
        }

        // Strategy 5: Take the last 2-3 meaningful words (often the location)
        var words = q.replace(/[?.!,]+/g, '').trim().split(/\s+/);
        var filler = ['what', 'is', 'the', 'temp', 'temperature', 'weather', 'how', 'whats', "what's", 'of', 'in', 'for', 'at', 'on', 'tell', 'me', 'about', 'get', 'show', 'please', 'give', 'check', 'current', 'right', 'now', 'today', 'forecast'];
        var meaningful = words.filter(function (w) { return filler.indexOf(w.toLowerCase()) === -1 && w.length > 1; });
        if (meaningful.length > 0 && meaningful.length <= 4) {
            return meaningful.join(' ');
        }

        return null; // Could not extract location — will use default city
    }

    async function fetchWeatherContext(config, query) {
        var lat = parseFloat(config.lat) || 35.6762;  // default Tokyo
        var lon = parseFloat(config.lon) || 139.6503;
        var city = config.city || 'Tokyo';

        // --- Query-aware geocoding ---
        // Extract the likely location name from the user's query, then geocode.
        // Open-Meteo's geocoding API expects a place name, NOT a full sentence.
        if (query) {
            try {
                var locationGuess = extractLocationFromQuery(query);
                if (locationGuess) {
                    var geoResp = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(locationGuess) + '&count=1&language=en');
                    var geoData = await geoResp.json();
                    if (geoData.results && geoData.results.length > 0) {
                        var geo = geoData.results[0];
                        lat = geo.latitude;
                        lon = geo.longitude;
                        city = geo.name + (geo.country ? ', ' + geo.country : '');
                        console.log('[Weather] Geocoded "' + locationGuess + '" → ' + city + ' (' + lat + ',' + lon + ')');
                    } else {
                        console.log('[Weather] Geocoding found no results for "' + locationGuess + '", using default: ' + city);
                    }
                }
            } catch (geoErr) {
                console.warn('[Weather] Geocoding failed:', geoErr.message);
                // Fall through to default city
            }
        }

        try {
            var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
                '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m' +
                '&hourly=temperature_2m&forecast_days=1&timezone=auto';
            var resp = await fetch(url);
            var data = await resp.json();
            var cur = data.current || {};
            var wmo = {
                0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
                45:'Fog', 48:'Icy fog', 51:'Light drizzle', 53:'Drizzle', 55:'Heavy drizzle',
                61:'Slight rain', 63:'Rain', 65:'Heavy rain', 71:'Slight snow', 73:'Snow', 75:'Heavy snow',
                80:'Rain showers', 81:'Rain showers', 82:'Violent rain showers',
                95:'Thunderstorm', 96:'Thunderstorm with hail', 99:'Thunderstorm with heavy hail'
            };
            var condition = wmo[cur.weather_code] || ('Code ' + cur.weather_code);
            var fetchTime = new Date().toUTCString();
            var lines = [
                '[Live Weather Report — ' + city + ' (via Open-Meteo API)]',
                'Fetched: ' + fetchTime,
                'Location: ' + city + ' (lat:' + lat + ', lon:' + lon + ')',
                '',
                'Current Conditions:',
                '  Weather: ' + condition,
                '  Temperature: ' + cur.temperature_2m + '°C (feels like ' + cur.apparent_temperature + '°C)',
                '  Humidity: ' + cur.relative_humidity_2m + '%',
                '  Wind Speed: ' + cur.wind_speed_10m + ' km/h',
                '  Precipitation: ' + cur.precipitation + ' mm',
            ];
            // Add hourly forecast if available
            if (data.hourly && data.hourly.temperature_2m) {
                lines.push('');
                lines.push('Hourly Forecast (next 24h):');
                var hours = data.hourly.time || [];
                var temps = data.hourly.temperature_2m || [];
                for (var i = 0; i < Math.min(hours.length, 24); i += 3) {
                    var hr = hours[i] ? hours[i].split('T')[1] || hours[i] : '??';
                    lines.push('  ' + hr + ' → ' + temps[i] + '°C');
                }
            }
            return lines.join('\n');
        } catch (e) {
            return '[Weather] Failed to fetch: ' + e.message;
        }
    }


    // --- Get Combined Context from All Enabled Connectors ---
    async function getActiveContext(query) {
        var parts = [];
        var promises = [];
        var enabledIds = [];

        Object.keys(REGISTRY).forEach(function (id) {
            if (!isEnabled(id)) return;
            enabledIds.push(id);
            var token = getToken(id);
            var config = getConfig(id);

            var fetchPromise;
            switch (id) {
                case 'slack': fetchPromise = fetchSlackContext(token, config); break;
                case 'github': fetchPromise = fetchGitHubContext(token, config); break;
                case 'notion': fetchPromise = fetchNotionContext(token, config); break;
                case 'linear': fetchPromise = fetchLinearContext(token); break;
                case 'jira': fetchPromise = fetchJiraContext(token, config); break;
                case 'google_drive': fetchPromise = fetchGoogleDriveContext(token, config); break;
                case 'hackernews': fetchPromise = fetchHackerNewsContext(config); break;
                case 'openmeteo': fetchPromise = fetchWeatherContext(config, query); break;
                default: fetchPromise = Promise.resolve(null);
            }

            promises.push(fetchPromise.catch(function (e) {
                console.error('[Connectors] Fetch failed for', id, ':', e.message);
                return null;
            }));
        });

        console.log('[Connectors] Enabled connectors:', enabledIds);
        var results = await Promise.all(promises);

        // Collect non-null results with their IDs
        var contextParts = [];
        results.forEach(function (r, i) {
            console.log('[Connectors] Result', enabledIds[i], ':', r ? r.substring(0, 100) : 'NULL');
            if (r) contextParts.push({ id: enabledIds[i], text: r });
        });

        if (contextParts.length === 0) return null;

        // Sort shortest first so smaller connectors (Weather) survive truncation
        // when the chat layer applies its context budget
        contextParts.sort(function (a, b) { return a.text.length - b.text.length; });

        // Cap each connector's contribution so all sources get fair representation
        var PER_CONNECTOR_CAP = 2000;
        var cappedParts = contextParts.map(function (p) {
            return p.text.length > PER_CONNECTOR_CAP
                ? p.text.substring(0, PER_CONNECTOR_CAP) + '\n[... truncated]'
                : p.text;
        });

        return '--- Connected Data Sources ---\n' + cappedParts.join('\n\n') + '\n--- End Connected Data ---';
    }

    // --- Validate Token via Test Endpoint ---
    async function testConnection(id, token) {
        var def = REGISTRY[id];
        if (!def || !def.testEndpoint) return { ok: true, user: 'Connected' };

        var method = def.testMethod || 'GET';
        var body = def.testBody || undefined;
        var headers = def.testHeaders ? def.testHeaders(token) : {};

        var resp = await fetch(def.testEndpoint, { method: method, headers: headers, body: body });
        var data = await resp.json();

        // Parse user info per connector
        if (id === 'slack') {
            if (!data.ok) throw new Error(data.error || 'Invalid token');
            return { ok: true, user: data.user || data.team };
        } else if (id === 'github') {
            if (!resp.ok) throw new Error('Invalid token');
            return { ok: true, user: data.login };
        } else if (id === 'linear') {
            var viewer = data && data.data && data.data.viewer;
            if (!viewer) throw new Error('Invalid token');
            return { ok: true, user: viewer.name };
        } else if (id === 'notion') {
            if (!resp.ok) throw new Error(data.message || 'Invalid token');
            return { ok: true, user: (data.name || data.id || 'Connected') };
        } else {
            if (!resp.ok) throw new Error('Invalid token');
            return { ok: true, user: 'Connected' };
        }
    }

    // =========================================================
    // CONNECTOR MODAL UI
    // =========================================================

    var _currentDetailId = null; // Which connector is in detail view

    function openConnectorsModal() {
        var modal = document.getElementById('connectors-modal');
        if (!modal) return;
        modal.classList.add('active');
        renderConnectorGrid();
    }

    function closeConnectorsModal() {
        var modal = document.getElementById('connectors-modal');
        if (modal) modal.classList.remove('active');
        _currentDetailId = null;
    }

    function renderConnectorGrid() {
        var gridView = document.getElementById('connectors-grid-view');
        var detailView = document.getElementById('connectors-detail-view');
        if (gridView) gridView.style.display = '';
        if (detailView) detailView.style.display = 'none';

        var grid = document.getElementById('connectors-grid');
        if (!grid) return;

        // Update active count badge
        var activeCount = Object.keys(REGISTRY).filter(function (id) { return isConnected(id); }).length;
        var badge = document.getElementById('connectors-active-badge');
        if (badge) {
            badge.textContent = activeCount > 0 ? activeCount + ' connected' : 'None connected';
            badge.style.opacity = activeCount > 0 ? '1' : '0.5';
        }

        grid.innerHTML = '';
        Object.keys(REGISTRY).forEach(function (id) {
            var def = REGISTRY[id];
            var connected = isConnected(id);
            var enabled = isEnabled(id);
            var state = getConnectorState(id);
            var userName = (state && state.userName) ? state.userName : '';

            var card = document.createElement('div');
            card.className = 'connector-card' + (connected ? ' connector-card-connected' : '');
            card.innerHTML =
                '<div class="connector-card-header" style="background:' + def.gradient + '">' +
                    '<i class="bi ' + def.icon + ' connector-card-icon"></i>' +
                    (connected ? '<span class="connector-status-dot connector-status-on"></span>' :
                        '<span class="connector-status-dot connector-status-off"></span>') +
                '</div>' +
                '<div class="connector-card-body">' +
                    '<div class="connector-card-name">' + def.name + '</div>' +
                    '<div class="connector-card-desc">' + def.description + '</div>' +
                    (def.authType === 'none' ? '<span class="connector-free-badge">⚡ Free · No key</span>' : '') +
                    (userName ? '<div class="connector-card-user"><i class="bi bi-person-circle me-1"></i>' + escapeHtml(userName) + '</div>' : '') +
                '</div>' +
                '<div class="connector-card-footer">' +
                    (def.comingSoon && !connected ?
                        '<span class="connector-coming-soon-badge">Coming Soon</span>' :
                    connected ?
                        '<label class="connector-toggle" title="' + (enabled ? 'Disable' : 'Enable') + ' context injection">' +
                            '<input type="checkbox" class="connector-enable-check" data-id="' + id + '"' + (enabled ? ' checked' : '') + '>' +
                            '<span class="connector-toggle-slider"></span>' +
                            '<span class="connector-toggle-label">' + (enabled ? 'Active' : 'Paused') + '</span>' +
                        '</label>' +
                        '<button class="connector-manage-btn" data-id="' + id + '"><i class="bi bi-gear"></i></button>' :
                        '<button class="connector-connect-btn" data-id="' + id + '">Connect</button>'
                    ) +
                '</div>';

            card.addEventListener('click', function (e) {
                // Don't open detail on toggle or manage btn
                if (e.target.closest('.connector-toggle') || e.target.closest('.connector-manage-btn') || e.target.closest('.connector-connect-btn')) return;
                if (connected) openConnectorDetail(id);
                else openConnectorDetail(id);
            });

            grid.appendChild(card);
        });

        // Wire connect buttons
        grid.querySelectorAll('.connector-connect-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                openConnectorDetail(btn.dataset.id);
            });
        });

        // Wire manage buttons
        grid.querySelectorAll('.connector-manage-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                openConnectorDetail(btn.dataset.id);
            });
        });

        // Wire enable toggles
        grid.querySelectorAll('.connector-enable-check').forEach(function (chk) {
            chk.addEventListener('change', function (e) {
                e.stopPropagation();
                var id = chk.dataset.id;
                var state = getConnectorState(id) || {};
                state.enabled = chk.checked;
                localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(state));
                renderConnectorGrid();
                if (M.showToast) {
                    M.showToast((chk.checked ? '✅ ' : '⏸ ') + REGISTRY[id].name + ' context ' + (chk.checked ? 'enabled' : 'paused'), 'success');
                }
            });
        });

        // Sync the AI panel strip whenever the grid re-renders
        refreshAiStrip();
    }

    function openConnectorDetail(id) {
        _currentDetailId = id;
        var def = REGISTRY[id];
        var connected = isConnected(id);
        var state = getConnectorState(id) || {};
        var config = state.config || {};

        var gridView = document.getElementById('connectors-grid-view');
        var detailView = document.getElementById('connectors-detail-view');
        if (gridView) gridView.style.display = 'none';
        if (detailView) detailView.style.display = '';

        var detailContent = document.getElementById('connectors-detail-content');
        if (!detailContent) return;

        var isKeyless = def.authType === 'none';

        // Config fields HTML
        var configHtml = '';
        if (def.configFields && def.configFields.length > 0) {
            configHtml = '<div class="connector-detail-section"><div class="connector-detail-section-title">Configuration</div>';
            def.configFields.forEach(function (field) {
                configHtml +=
                    '<div class="connector-form-group">' +
                        '<label>' + field.label + '</label>' +
                        '<input type="text" class="connector-config-input" data-field="' + field.key + '" placeholder="' + (field.placeholder || '') + '" value="' + escapeHtml(config[field.key] || '') + '">' +
                        (field.hint ? '<small>' + field.hint + '</small>' : '') +
                    '</div>';
            });
            configHtml += '</div>';
        }

        // Build token section — hidden for keyless connectors
        // GitHub gets an extra Device Flow OAuth option at top
        var githubDeviceHtml = '';
        if (id === 'github' && M.githubAuth && M.githubAuth.isAuthenticated()) {
            var ghUser = M.githubAuth.getUser() || 'Connected';
            var ghToken = M.githubAuth.getToken();
            // Pre-fill token field from existing GitHub auth
            state.token = state.token || ghToken;
            githubDeviceHtml =
                '<div class="connector-oauth-section">' +
                    '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:rgba(46,160,67,0.08);border:1px solid rgba(46,160,67,0.3);border-radius:10px;font-size:13px;">' +
                        '<i class="bi bi-check-circle-fill" style="color:#2ea043"></i>' +
                        '<span>Already signed in to GitHub as <strong>@' + escapeHtml(ghUser) + '</strong></span>' +
                        '<button id="connector-use-gh-token" class="connector-btn-primary" style="padding:4px 12px;font-size:12px;margin-left:auto">Use this account</button>' +
                    '</div>' +
                    '<div class="connector-oauth-divider">or enter a Personal Access Token manually</div>' +
                '</div>';
        } else if (id === 'github') {
            githubDeviceHtml =
                '<div class="connector-oauth-section">' +
                    '<small style="display:block;margin-bottom:8px;color:var(--text-color);opacity:0.6;"><i class="bi bi-info-circle me-1"></i>For public repos, a token is optional (leave blank). For private repos, enter a PAT or use the Agent Cloud GitHub login.</small>' +
                '</div>';
        }

        var tokenSectionHtml = isKeyless
            ? '<div class="connector-keyless-notice"><i class="bi bi-unlock-fill me-2"></i><strong>No API key required</strong> — this connector is completely free and works instantly.</div>'
            : githubDeviceHtml +
              '<div class="connector-detail-section">' +
                '<div class="connector-detail-section-title">' + def.tokenLabel + '</div>' +
                '<div class="connector-form-group">' +
                    '<input type="password" id="connector-token-input" class="connector-token-input" placeholder="' + (def.tokenPlaceholder || '') + '" value="' + escapeHtml(state.token && state.token !== 'KEYLESS' ? state.token : '') + '" autocomplete="off" spellcheck="false">' +
                    '<small><i class="bi bi-info-circle me-1"></i>' + def.tokenHint + ' — <a href="' + def.tokenLink + '" target="_blank" rel="noopener">Get token</a></small>' +
                '</div>' +
              '</div>';

        detailContent.innerHTML =
            '<div class="connector-detail-header" style="background:' + def.gradient + '">' +
                '<div class="connector-detail-icon"><i class="bi ' + def.icon + '"></i></div>' +
                '<div class="connector-detail-info">' +
                    '<div class="connector-detail-name">' + def.name + '</div>' +
                    '<div class="connector-detail-desc">' + def.description + '</div>' +
                '</div>' +
                (connected ? '<span class="connector-detail-badge">✓ Connected</span>' : '<span class="connector-detail-badge connector-detail-badge-off">' + (isKeyless ? 'Free · No key' : 'Not connected') + '</span>') +
            '</div>' +
            '<div class="connector-detail-body">' +
                tokenSectionHtml +
                configHtml +
                '<div id="connector-detail-error" class="connector-error" style="display:none"></div>' +
                '<div id="connector-detail-status" class="connector-status-msg" style="display:none"></div>' +
            '</div>' +
            '<div class="connector-detail-footer">' +
                (connected ?
                    '<button class="connector-btn-danger" id="connector-disconnect-btn"><i class="bi bi-plug-fill me-1"></i>Disconnect</button>' :
                    '<span></span>'
                ) +
                '<button class="connector-btn-primary" id="connector-save-btn">' +
                    '<i class="bi bi-check-lg me-1"></i>' + (connected ? 'Update' : (isKeyless ? '⚡ Enable' : 'Connect')) +
                '</button>' +
            '</div>';

        // Wire save/connect
        var saveBtn = detailContent.querySelector('#connector-save-btn');
        if (saveBtn) saveBtn.addEventListener('click', function () { saveConnector(id); });

        // Wire disconnect
        var discBtn = detailContent.querySelector('#connector-disconnect-btn');
        if (discBtn) discBtn.addEventListener('click', function () { disconnectConnector(id); });

        // Wire "Use this account" GitHub OAuth shortcut
        var useGhBtn = detailContent.querySelector('#connector-use-gh-token');
        if (useGhBtn && M.githubAuth) {
            useGhBtn.addEventListener('click', function () {
                var ghToken = M.githubAuth.getToken();
                var ghUser = M.githubAuth.getUser();
                if (!ghToken) return;
                var existingState = getConnectorState(id) || {};
                var config = {};
                document.querySelectorAll('.connector-config-input').forEach(function (inp) {
                    config[inp.dataset.field] = inp.value.trim();
                });
                var newState = Object.assign({}, existingState, {
                    token: ghToken,
                    config: config,
                    connected: true,
                    enabled: true,
                    userName: '@' + ghUser,
                    connectedAt: Date.now()
                });
                localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(newState));
                if (M.showToast) M.showToast('✅ GitHub connected as @' + ghUser, 'success');
                renderConnectorGrid();
                openConnectorDetail(id);
            });
        }
    }

    async function saveConnector(id) {
        var def = REGISTRY[id];
        var saveBtn = document.getElementById('connector-save-btn');
        var errorEl = document.getElementById('connector-detail-error');
        var statusEl = document.getElementById('connector-detail-status');

        var token = (document.getElementById('connector-token-input') || {}).value || '';
        token = token.trim();

        var def = REGISTRY[id];
        var isKeyless = def && def.authType === 'none';

        if (!isKeyless && !token) {
            if (errorEl) { errorEl.textContent = 'Please enter your ' + def.tokenLabel + '.'; errorEl.style.display = ''; }
            return;
        }
        if (isKeyless) token = 'KEYLESS';

        // Collect config fields
        var config = {};
        document.querySelectorAll('.connector-config-input').forEach(function (inp) {
            config[inp.dataset.field] = inp.value.trim();
        });

        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="connector-spin"></span> Connecting...';
        }
        if (errorEl) errorEl.style.display = 'none';
        if (statusEl) statusEl.style.display = 'none';

        try {
            var result = { ok: true, user: 'Connected' };

            // Test connection if endpoint defined (skip for Notion/Jira/Google/keyless due to CORS or no auth)
            if (!isKeyless && def.testEndpoint && id !== 'notion' && id !== 'jira' && id !== 'google_drive') {
                result = await testConnection(id, token);
            }
            if (isKeyless) result = { ok: true, user: 'Active' };

            // Save state
            var existingState = getConnectorState(id) || {};
            var newState = Object.assign({}, existingState, {
                token: token,
                config: config,
                connected: true,
                enabled: true,
                userName: result.user || '',
                connectedAt: Date.now()
            });
            localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(newState));

            if (statusEl) {
                statusEl.innerHTML = '<i class="bi bi-check-circle me-1" style="color:#2ea043"></i>Connected' + (result.user ? ' as <strong>' + escapeHtml(String(result.user)) + '</strong>' : '') + '!';
                statusEl.style.display = '';
            }

            if (M.showToast) M.showToast('✅ ' + def.name + ' connected!', 'success');

            setTimeout(function () { renderConnectorGrid(); openConnectorDetail(id); }, 800);

        } catch (e) {
            if (errorEl) { errorEl.textContent = 'Connection failed: ' + e.message; errorEl.style.display = ''; }
        }

        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>' + (isConnected(id) ? 'Update' : 'Connect');
        }
    }

    function disconnectConnector(id) {
        localStorage.removeItem(STORAGE_PREFIX + id);
        if (M.showToast) M.showToast('🔌 ' + REGISTRY[id].name + ' disconnected', 'info');
        renderConnectorGrid();
        var gridView = document.getElementById('connectors-grid-view');
        var detailView = document.getElementById('connectors-detail-view');
        if (gridView) gridView.style.display = '';
        if (detailView) detailView.style.display = 'none';
    }

    // Wire modal events
    function wireModalEvents() {
        ['connectors-btn', 'mobile-connectors-btn', 'qab-connectors'].forEach(function (btnId) {
            var btn = document.getElementById(btnId);
            if (btn) btn.addEventListener('click', function () {
                openConnectorsModal();
                var mobilePanel = document.getElementById('mobile-menu-panel');
                if (mobilePanel && mobilePanel.classList.contains('open')) {
                    mobilePanel.classList.remove('open');
                    var overlay = document.getElementById('mobile-menu-overlay');
                    if (overlay) overlay.style.display = 'none';
                }
            });
        });

        var closeBtn = document.getElementById('connectors-modal-close');
        if (closeBtn) closeBtn.addEventListener('click', closeConnectorsModal);

        var modal = document.getElementById('connectors-modal');
        if (modal) modal.addEventListener('click', function (e) {
            if (e.target === modal) closeConnectorsModal();
        });

        var backBtn = document.getElementById('connectors-detail-back');
        if (backBtn) backBtn.addEventListener('click', function () {
            renderConnectorGrid();
            var gridView = document.getElementById('connectors-grid-view');
            var detailView = document.getElementById('connectors-detail-view');
            if (gridView) gridView.style.display = '';
            if (detailView) detailView.style.display = 'none';
        });
    }

    // --- Helpers ---
    function escapeHtml(text) {
        var d = document.createElement('div');
        d.textContent = String(text);
        return d.innerHTML;
    }

    // --- AI Panel Connector Header Toggle ---
    // Shows/hides the connector toggle label next to the Search button
    // and wires the checkbox to enable/disable all active connectors at once.
    function refreshAiStrip() {
        var toggleLabel = document.getElementById('ai-connector-toggle-label');
        var toggleCheck = document.getElementById('ai-connector-toggle');
        var toggleText  = document.getElementById('ai-connector-toggle-label-text');
        if (!toggleLabel) return;

        var activeIds = Object.keys(REGISTRY).filter(function (id) { return isConnected(id); });
        var enabledIds = Object.keys(REGISTRY).filter(function (id) { return isEnabled(id); });

        if (activeIds.length === 0) {
            // No connected connectors at all — hide the toggle
            toggleLabel.style.display = 'none';
            return;
        }

        // Show toggle — reflect enabled (not just connected) state
        toggleLabel.style.display = '';
        if (toggleCheck) toggleCheck.checked = enabledIds.length > 0;
        if (toggleText) {
            if (enabledIds.length === 0) {
                // All paused — show "Paused" so the user knows context injection is off
                toggleText.textContent = activeIds.length + ' Paused';
            } else if (enabledIds.length === 1) {
                toggleText.textContent = REGISTRY[enabledIds[0]].name;
            } else {
                toggleText.textContent = enabledIds.length + ' Connectors';
            }
        }

        // Wire checkbox to pause/resume all connected connectors
        if (toggleCheck && !toggleCheck._connectorWired) {
            toggleCheck._connectorWired = true;
            toggleCheck.addEventListener('change', function () {
                var checked = toggleCheck.checked;
                var connectedNow = Object.keys(REGISTRY).filter(function (id) { return isConnected(id); });
                connectedNow.forEach(function (id) {
                    var state = getConnectorState(id) || {};
                    state.enabled = checked;
                    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(state));
                });
                // Re-sync the label text immediately
                refreshAiStrip();
                if (M.showToast) {
                    M.showToast(checked ? '⚡ Connector context enabled' : '⏸ Connector context paused', 'info');
                }
            });
        }
    }

    // --- Public API ---
    M.connectors = {
        openModal: openConnectorsModal,
        closeModal: closeConnectorsModal,
        isConnected: isConnected,
        isEnabled: isEnabled,
        hasActiveConnectors: hasActiveConnectors,
        getActiveContext: getActiveContext,
        refreshAiStrip: refreshAiStrip,
        REGISTRY: REGISTRY,
        // Exposed for tool calling — ai-chat.js calls these directly
        getConfig: getConfig,
        getToken: getToken,
        fetchWeatherDirect: function (config) { return fetchWeatherContext(config); },
        fetchHNDirect: function (config) { return fetchHackerNewsContext(config); },
        fetchGitHubDirect: function (token, config) { return fetchGitHubContext(token, config); },
        fetchSlackDirect: function (token, config) { return fetchSlackContext(token, config); },
    };

    // --- Auto-Connect Free Connectors ---
    // On first-ever visit, automatically connect keyless connectors (HN, Weather)
    // so users get live data immediately without any manual setup.
    function autoConnectFreeConnectors() {
        Object.keys(REGISTRY).forEach(function (id) {
            var def = REGISTRY[id];
            if (def.authType !== 'none') return;        // only keyless
            if (def.comingSoon) return;                  // skip stubs
            var existing = getConnectorState(id);
            if (existing) return;                        // user already interacted
            // First-ever visit — auto-connect with sensible defaults.
            // Use lean config for HN to keep context small for local models.
            var defaultConfig = {};
            if (id === 'hackernews') {
                defaultConfig = { count: '3', comments: 'false' };
            }
            var state = {
                token: 'KEYLESS',
                config: defaultConfig,
                connected: true,
                enabled: true,
                userName: 'Active',
                connectedAt: Date.now()
            };
            localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(state));
            console.log('[Connectors] Auto-connected free connector:', def.name);
        });
    }

    // --- Init ---
    function init() {
        autoConnectFreeConnectors();
        wireModalEvents();
        refreshAiStrip();

        // Clicking the plug icon/text opens the modal.
        // Clicking the slider/switch toggles the checkbox (pause/resume).
        var toggleLabel = document.getElementById('ai-connector-toggle-label');
        if (toggleLabel) {
            toggleLabel.addEventListener('click', function (e) {
                // Direct checkbox click: let it toggle naturally
                if (e.target.tagName === 'INPUT') return;
                // Click on the slider switch: toggle the checkbox
                if (e.target.classList.contains('ai-search-slider')) {
                    e.preventDefault();
                    var chk = document.getElementById('ai-connector-toggle');
                    if (chk) {
                        chk.checked = !chk.checked;
                        chk.dispatchEvent(new Event('change'));
                    }
                    return;
                }
                // Click on text/icon: open the connector modal
                e.preventDefault();
                openConnectorsModal();
            });
        }
    }

    document.addEventListener('DOMContentLoaded', init);
    if (document.readyState !== 'loading') {
        init();
    }

})(window.MDView || (window.MDView = {}));
