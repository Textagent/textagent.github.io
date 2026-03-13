// ============================================
// ai-web-search.js — Web Search for AI Assistant
// Supports DuckDuckGo (free), Brave Search, Serper.dev,
// Tavily (AI-optimized), Google CSE, Wikipedia, Wikidata
// ============================================
(function (M) {
    'use strict';

    // --- Provider Configuration ---
    const PROVIDERS = {
        duckduckgo: {
            id: 'duckduckgo',
            name: 'DuckDuckGo',
            desc: 'Free · No API key needed',
            icon: 'bi bi-search',
            requiresKey: false,
        },
        brave: {
            id: 'brave',
            name: 'Brave Search',
            desc: 'Free tier · 2,000/month',
            icon: 'bi bi-shield-check',
            requiresKey: true,
            keyStorageKey: M.KEYS.API_KEY_BRAVE,
            dialogTitle: 'Connect to Brave Search',
            dialogDesc: 'Enter your free Brave Search API key for web search.',
            dialogPlaceholder: 'BSA...',
            dialogLink: 'https://brave.com/search/api/',
            dialogLinkText: 'brave.com/search/api',
        },
        serper: {
            id: 'serper',
            name: 'Serper.dev',
            desc: 'Free tier · 2,500 queries',
            icon: 'bi bi-globe2',
            requiresKey: true,
            keyStorageKey: M.KEYS.API_KEY_SERPER,
            dialogTitle: 'Connect to Serper.dev',
            dialogDesc: 'Enter your free Serper.dev API key for Google search results.',
            dialogPlaceholder: 'Your Serper API key...',
            dialogLink: 'https://serper.dev/',
            dialogLinkText: 'serper.dev',
        },
        tavily: {
            id: 'tavily',
            name: 'Tavily',
            desc: 'AI-optimized · 1,000/month free',
            icon: 'bi bi-robot',
            requiresKey: true,
            keyStorageKey: M.KEYS.API_KEY_TAVILY,
            dialogTitle: 'Connect to Tavily',
            dialogDesc: 'Enter your Tavily API key — search results optimized for AI agents.',
            dialogPlaceholder: 'tvly-...',
            dialogLink: 'https://tavily.com/',
            dialogLinkText: 'tavily.com',
        },
        google_cse: {
            id: 'google_cse',
            name: 'Google CSE',
            desc: 'Google results · 100/day free',
            icon: 'bi bi-google',
            requiresKey: true,
            keyStorageKey: M.KEYS.API_KEY_GOOGLE_CSE,
            dialogTitle: 'Connect to Google Custom Search',
            dialogDesc: 'Enter your Google API key and Search Engine ID separated by a colon (key:cx).',
            dialogPlaceholder: 'AIzaSy...:a1b2c3d4e5f...',
            dialogLink: 'https://programmablesearchengine.google.com/',
            dialogLinkText: 'programmablesearchengine.google.com',
        },
        wikipedia: {
            id: 'wikipedia',
            name: 'Wikipedia',
            desc: 'Free · Encyclopedia',
            icon: 'bi bi-book',
            requiresKey: false,
        },
        wikidata: {
            id: 'wikidata',
            name: 'Wikidata',
            desc: 'Free · Structured knowledge',
            icon: 'bi bi-diagram-3',
            requiresKey: false,
        },
    };

    // --- State ---
    let searchEnabled = localStorage.getItem(M.KEYS.SEARCH_ENABLED) === 'true';

    // Multi-provider: stored as JSON array, default to ['duckduckgo']
    var activeProviders;
    try {
        var stored = localStorage.getItem(M.KEYS.SEARCH_PROVIDER);
        // Backward compat: old format was a plain string like 'duckduckgo'
        if (stored && stored.startsWith('[')) {
            activeProviders = new Set(JSON.parse(stored));
        } else if (stored && PROVIDERS[stored]) {
            activeProviders = new Set([stored]);
        } else {
            activeProviders = new Set(['duckduckgo']);
        }
    } catch (_) {
        activeProviders = new Set(['duckduckgo']);
    }

    function persistProviders() {
        localStorage.setItem(M.KEYS.SEARCH_PROVIDER, JSON.stringify(Array.from(activeProviders)));
    }

    // --- Public API ---

    function isSearchEnabled() {
        return searchEnabled;
    }

    function setSearchEnabled(enabled) {
        searchEnabled = !!enabled;
        localStorage.setItem(M.KEYS.SEARCH_ENABLED, searchEnabled ? 'true' : 'false');
    }

    /** Get all active provider IDs as an array. */
    function getActiveProviders() {
        return Array.from(activeProviders);
    }

    /** Backward-compat: returns the first active provider. */
    function getActiveProvider() {
        return getActiveProviders()[0] || 'duckduckgo';
    }

    /** Toggle a single provider on/off. */
    function toggleProvider(providerId) {
        if (!PROVIDERS[providerId]) return;
        if (activeProviders.has(providerId)) {
            activeProviders.delete(providerId);
            // Ensure at least one provider is active
            if (activeProviders.size === 0) activeProviders.add('duckduckgo');
        } else {
            activeProviders.add(providerId);
        }
        persistProviders();
    }

    /** Check if a specific provider is active. */
    function isProviderActive(providerId) {
        return activeProviders.has(providerId);
    }

    /** Replace all active providers (backward compat). */
    function setActiveProvider(providerId) {
        if (PROVIDERS[providerId]) {
            activeProviders = new Set([providerId]);
            persistProviders();
        }
    }

    /**
     * Get the API key for a provider (from localStorage).
     */
    function getProviderKey(providerId) {
        const p = PROVIDERS[providerId];
        return p && p.keyStorageKey ? localStorage.getItem(p.keyStorageKey) || '' : '';
    }

    /**
     * Save the API key for a provider.
     */
    function setProviderKey(providerId, key) {
        const p = PROVIDERS[providerId];
        if (p && p.keyStorageKey) {
            if (key) {
                localStorage.setItem(p.keyStorageKey, key);
            } else {
                localStorage.removeItem(p.keyStorageKey);
            }
        }
    }

    /**
     * Perform a web search using the active provider.
     * Returns an array of {title, url, snippet} objects.
     */
    async function performSearch(query, maxResults = 5, providerOverride) {
        if (!query || !query.trim()) return [];

        const provider = providerOverride || activeProvider;

        try {
            switch (provider) {
                case 'brave':
                    return await searchBrave(query, maxResults);
                case 'serper':
                    return await searchSerper(query, maxResults);
                case 'tavily':
                    return await searchTavily(query, maxResults);
                case 'google_cse':
                    return await searchGoogleCSE(query, maxResults);
                case 'wikipedia':
                    return await searchWikipedia(query, maxResults);
                case 'wikidata':
                    return await searchWikidata(query, maxResults);
                case 'duckduckgo':
                default:
                    return await searchDuckDuckGo(query, maxResults);
            }
        } catch (err) {
            console.warn('Web search failed:', err.message);
            return [];
        }
    }

    /**
     * Run search across ALL active providers in parallel.
     * Deduplicates by URL and tags each result with its source provider.
     * Returns a combined array of {title, url, snippet, source} objects.
     */
    async function performMultiSearch(query, maxResults) {
        maxResults = maxResults || 5;
        if (!query || !query.trim()) return [];

        var providers = getActiveProviders();
        if (providers.length === 0) return [];

        // If only one provider, just use the regular path
        if (providers.length === 1) {
            var results = await performSearch(query, maxResults, providers[0]);
            var providerName = PROVIDERS[providers[0]] ? PROVIDERS[providers[0]].name : providers[0];
            results.forEach(function (r) { r.source = providerName; });
            return results;
        }

        // Fire all providers in parallel
        var promises = providers.map(function (pid) {
            return performSearch(query, maxResults, pid)
                .then(function (results) {
                    var name = PROVIDERS[pid] ? PROVIDERS[pid].name : pid;
                    results.forEach(function (r) { r.source = name; });
                    return results;
                })
                .catch(function (err) {
                    console.warn('Search provider ' + pid + ' failed:', err.message);
                    return [];
                });
        });

        var allResults = await Promise.all(promises);

        // Flatten and deduplicate by URL
        var combined = [];
        var seenUrls = new Set();
        allResults.forEach(function (providerResults) {
            providerResults.forEach(function (r) {
                var normalizedUrl = (r.url || '').replace(/\/$/, '').toLowerCase();
                if (!seenUrls.has(normalizedUrl)) {
                    seenUrls.add(normalizedUrl);
                    combined.push(r);
                }
            });
        });

        return combined;
    }

    /**
     * Format search results into a context string for LLM injection.
     * Groups results by source provider for clarity.
     */
    function formatResultsForLLM(results) {
        if (!results || results.length === 0) return '';

        // Group by source
        var groups = {};
        results.forEach(function (r) {
            var src = r.source || 'Web';
            if (!groups[src]) groups[src] = [];
            groups[src].push(r);
        });

        var context = '';
        var sourceNames = Object.keys(groups);
        sourceNames.forEach(function (src) {
            context += '[Web Search Results — ' + src + ']\n';
            groups[src].forEach(function (r, i) {
                context += (i + 1) + '. ' + r.title + '\n   ' + r.snippet + '\n   Source: ' + r.url + '\n\n';
            });
        });
        return context.trim();
    }

    // --- DuckDuckGo Instant Answer (free, no API key, CORS-enabled) ---
    // NOTE: This is the Instant Answer API — it returns Wikipedia/entity-style
    // results, NOT full web search results. For general web queries it may return
    // nothing. For best coverage, combine DDG with other providers (Tavily, Brave, etc.).
    async function searchDuckDuckGo(query, maxResults) {
        const encoded = encodeURIComponent(query);
        const apiUrl = `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`;
        const response = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error('DuckDuckGo search failed: HTTP ' + response.status);

        const data = await response.json();
        return parseDuckDuckGoJSON(data, query, maxResults);
    }

    function parseDuckDuckGoJSON(data, query, maxResults) {
        const results = [];

        // 1. Abstract (main Wikipedia/entity result)
        if (data.Abstract && data.AbstractURL) {
            results.push({
                title: data.Heading || data.AbstractSource || 'Result',
                url: data.AbstractURL,
                snippet: data.Abstract,
            });
        }

        // 2. Answer (instant answer — e.g. calculations, conversions)
        if (data.Answer) {
            results.push({
                title: 'Instant Answer' + (data.AnswerType ? ' (' + data.AnswerType + ')' : ''),
                url: data.AbstractURL || 'https://duckduckgo.com/?q=' + encodeURIComponent(query),
                snippet: typeof data.Answer === 'string' ? data.Answer : JSON.stringify(data.Answer),
            });
        }

        // 3. Results array (official site links, etc.)
        if (data.Results && Array.isArray(data.Results)) {
            for (let i = 0; i < data.Results.length && results.length < maxResults; i++) {
                var r = data.Results[i];
                if (r.FirstURL && r.Text) {
                    results.push({
                        title: r.Text.substring(0, 120),
                        url: r.FirstURL,
                        snippet: r.Text,
                    });
                }
            }
        }

        // 4. Infobox (structured data — social profiles, key facts)
        if (data.Infobox && data.Infobox.content && Array.isArray(data.Infobox.content)) {
            var infoSnippet = data.Infobox.content
                .filter(function (item) { return item.label && item.value; })
                .slice(0, 5)
                .map(function (item) { return item.label + ': ' + item.value; })
                .join('; ');
            if (infoSnippet && results.length < maxResults) {
                results.push({
                    title: (data.Heading || 'Info') + ' — Key Facts',
                    url: data.AbstractURL || 'https://duckduckgo.com/?q=' + encodeURIComponent(query),
                    snippet: infoSnippet,
                });
            }
        }

        // 5. Definition
        if (data.Definition && data.DefinitionURL && results.length < maxResults) {
            results.push({
                title: 'Definition — ' + (data.DefinitionSource || ''),
                url: data.DefinitionURL,
                snippet: data.Definition,
            });
        }

        // 6. Related topics
        if (data.RelatedTopics) {
            for (let i = 0; i < data.RelatedTopics.length && results.length < maxResults; i++) {
                const topic = data.RelatedTopics[i];
                if (topic.FirstURL && topic.Text) {
                    results.push({
                        title: topic.Text.substring(0, 80),
                        url: topic.FirstURL,
                        snippet: topic.Text,
                    });
                }
                // Sub-topics within groups
                if (topic.Topics) {
                    for (let j = 0; j < topic.Topics.length && results.length < maxResults; j++) {
                        const sub = topic.Topics[j];
                        if (sub.FirstURL && sub.Text) {
                            results.push({
                                title: sub.Text.substring(0, 80),
                                url: sub.FirstURL,
                                snippet: sub.Text,
                            });
                        }
                    }
                }
            }
        }

        // 7. Redirect (DDG sometimes returns a redirect for !bang queries)
        if (data.Redirect && results.length < maxResults) {
            results.push({
                title: 'Redirected result',
                url: data.Redirect,
                snippet: 'DuckDuckGo redirected this query to: ' + data.Redirect,
            });
        }

        return results;
    }

    // --- Brave Search API ---
    async function searchBrave(query, maxResults) {
        const apiKey = getProviderKey('brave');
        if (!apiKey) throw new Error('Brave Search API key not configured.');

        const encoded = encodeURIComponent(query);
        const url = `https://api.search.brave.com/res/v1/web/search?q=${encoded}&count=${maxResults}`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip',
                'X-Subscription-Token': apiKey,
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid Brave Search API key.');
            }
            throw new Error('Brave search failed: HTTP ' + response.status);
        }

        const data = await response.json();
        const results = [];
        if (data.web && data.web.results) {
            data.web.results.slice(0, maxResults).forEach(r => {
                results.push({
                    title: r.title || '',
                    url: r.url || '',
                    snippet: r.description || '',
                });
            });
        }
        return results;
    }

    // --- Serper.dev API ---
    async function searchSerper(query, maxResults) {
        const apiKey = getProviderKey('serper');
        if (!apiKey) throw new Error('Serper.dev API key not configured.');

        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
            },
            body: JSON.stringify({ q: query, num: maxResults }),
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid Serper.dev API key.');
            }
            throw new Error('Serper search failed: HTTP ' + response.status);
        }

        const data = await response.json();
        const results = [];
        if (data.organic) {
            data.organic.slice(0, maxResults).forEach(r => {
                results.push({
                    title: r.title || '',
                    url: r.link || '',
                    snippet: r.snippet || '',
                });
            });
        }
        return results;
    }

    // --- Tavily API (AI-optimized search) ---
    async function searchTavily(query, maxResults) {
        const apiKey = getProviderKey('tavily');
        if (!apiKey) throw new Error('Tavily API key not configured.');

        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                max_results: maxResults,
                include_answer: true,
                search_depth: 'basic',
            }),
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid Tavily API key.');
            }
            throw new Error('Tavily search failed: HTTP ' + response.status);
        }

        const data = await response.json();
        const results = [];

        // Tavily returns a direct AI-generated answer — include as first result
        if (data.answer) {
            results.push({
                title: 'AI Summary',
                url: (data.results && data.results[0] && data.results[0].url) || 'https://tavily.com',
                snippet: data.answer,
            });
        }

        // Individual search results
        if (data.results) {
            data.results.slice(0, maxResults).forEach(r => {
                results.push({
                    title: r.title || '',
                    url: r.url || '',
                    snippet: r.content || '',
                });
            });
        }
        return results.slice(0, maxResults + 1); // +1 for the AI answer
    }

    // --- Google Custom Search Engine (CSE) ---
    async function searchGoogleCSE(query, maxResults) {
        const raw = getProviderKey('google_cse');
        if (!raw) throw new Error('Google CSE API key not configured.');

        // Key format: "apiKey:searchEngineId"
        const parts = raw.split(':');
        if (parts.length < 2) throw new Error('Google CSE key format: API_KEY:SEARCH_ENGINE_ID');
        const apiKey = parts[0].trim();
        const cx = parts.slice(1).join(':').trim();

        const encoded = encodeURIComponent(query);
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encoded}&num=${Math.min(maxResults, 10)}`;

        const response = await fetch(url, { signal: AbortSignal.timeout(8000) });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid Google CSE API key.');
            }
            if (response.status === 429) {
                throw new Error('Google CSE daily quota exceeded (100/day free).');
            }
            throw new Error('Google CSE search failed: HTTP ' + response.status);
        }

        const data = await response.json();
        const results = [];
        if (data.items) {
            data.items.slice(0, maxResults).forEach(r => {
                results.push({
                    title: r.title || '',
                    url: r.link || '',
                    snippet: r.snippet || '',
                });
            });
        }
        return results;
    }

    // --- Wikipedia API (free, no API key) ---
    async function searchWikipedia(query, maxResults) {
        const encoded = encodeURIComponent(query);
        // Use Wikipedia REST API for search + extracts
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&srlimit=${maxResults}&format=json&origin=*&utf8=1`;

        const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error('Wikipedia search failed: HTTP ' + response.status);

        const data = await response.json();
        const results = [];

        if (data.query && data.query.search) {
            data.query.search.slice(0, maxResults).forEach(r => {
                // Strip HTML tags from snippet
                const snippet = (r.snippet || '').replace(/<[^>]*>/g, '');
                results.push({
                    title: r.title || '',
                    url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent((r.title || '').replace(/ /g, '_')),
                    snippet: snippet,
                });
            });
        }
        return results;
    }

    // --- Wikidata API (free, no API key) ---
    async function searchWikidata(query, maxResults) {
        const encoded = encodeURIComponent(query);
        const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encoded}&language=en&limit=${maxResults}&format=json&origin=*`;

        const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error('Wikidata search failed: HTTP ' + response.status);

        const data = await response.json();
        const results = [];

        if (data.search) {
            data.search.slice(0, maxResults).forEach(r => {
                results.push({
                    title: r.label || r.id || '',
                    url: r.concepturi || ('https://www.wikidata.org/wiki/' + r.id),
                    snippet: r.description || ('Wikidata entity: ' + (r.label || r.id)),
                });
            });
        }
        return results;
    }

    // --- Expose Module ---
    M.webSearch = {
        PROVIDERS,
        isSearchEnabled,
        setSearchEnabled,
        getActiveProvider,
        setActiveProvider,
        getActiveProviders,
        toggleProvider,
        isProviderActive,
        getProviderKey,
        setProviderKey,
        performSearch,
        performMultiSearch,
        formatResultsForLLM,
    };

})(window.MDView);
