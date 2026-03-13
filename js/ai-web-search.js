// ============================================
// ai-web-search.js — Web Search for AI Assistant
// Supports DuckDuckGo (free), Brave Search, Serper.dev
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
    };

    // --- State ---
    let searchEnabled = localStorage.getItem(M.KEYS.SEARCH_ENABLED) === 'true';
    let activeProvider = localStorage.getItem(M.KEYS.SEARCH_PROVIDER) || 'duckduckgo';

    // --- Public API ---

    /**
     * Check if web search is enabled.
     */
    function isSearchEnabled() {
        return searchEnabled;
    }

    /**
     * Toggle search on/off.
     */
    function setSearchEnabled(enabled) {
        searchEnabled = !!enabled;
        localStorage.setItem(M.KEYS.SEARCH_ENABLED, searchEnabled ? 'true' : 'false');
    }

    /**
     * Get the active search provider id.
     */
    function getActiveProvider() {
        return activeProvider;
    }

    /**
     * Set the active search provider.
     */
    function setActiveProvider(providerId) {
        if (PROVIDERS[providerId]) {
            activeProvider = providerId;
            localStorage.setItem(M.KEYS.SEARCH_PROVIDER, providerId);
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
     * Format search results into a context string for LLM injection.
     */
    function formatResultsForLLM(results) {
        if (!results || results.length === 0) return '';
        let context = '[Web Search Results]\n';
        results.forEach((r, i) => {
            context += `${i + 1}. ${r.title}\n   ${r.snippet}\n   Source: ${r.url}\n\n`;
        });
        return context.trim();
    }

    // --- DuckDuckGo (free, no API key) ---
    // Uses DuckDuckGo Instant Answer API (returns JSON with CORS headers, no proxy needed)
    async function searchDuckDuckGo(query, maxResults) {
        const encoded = encodeURIComponent(query);

        // Primary: DuckDuckGo Instant Answer API (no CORS proxy needed)
        const apiUrl = `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`;

        const response = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error('DuckDuckGo search failed: HTTP ' + response.status);

        const data = await response.json();
        return parseDuckDuckGoJSON(data, maxResults);
    }

    function parseDuckDuckGoJSON(data, maxResults) {
        const results = [];

        // Abstract (main result from Wikipedia etc.)
        if (data.Abstract && data.AbstractURL) {
            results.push({
                title: data.Heading || data.AbstractSource || 'Result',
                url: data.AbstractURL,
                snippet: data.Abstract,
            });
        }

        // Related topics
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
                // Some topics are groups with sub-topics
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

        // Definition
        if (results.length < maxResults && data.Definition && data.DefinitionURL) {
            results.push({
                title: 'Definition — ' + (data.DefinitionSource || ''),
                url: data.DefinitionURL,
                snippet: data.Definition,
            });
        }

        // Answer (instant answer)
        if (results.length < maxResults && data.Answer) {
            results.push({
                title: 'Instant Answer',
                url: data.AbstractURL || 'https://duckduckgo.com/?q=' + encodeURIComponent(data.Heading || ''),
                snippet: typeof data.Answer === 'string' ? data.Answer : JSON.stringify(data.Answer),
            });
        }

        // Fallback: if DDG returned no structured results, try CORS proxy for HTML scraping
        if (results.length === 0) {
            return searchDuckDuckGoFallback(data._query || '', maxResults);
        }

        return results;
    }

    // Fallback: try CORS proxies for HTML scraping (legacy approach)
    async function searchDuckDuckGoFallback(query, maxResults) {
        if (!query) return [];
        const encoded = encodeURIComponent(query);
        const proxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent('https://lite.duckduckgo.com/lite/?q=' + encoded)}`,
            `https://corsproxy.io/?url=${encodeURIComponent('https://lite.duckduckgo.com/lite/?q=' + encoded)}`,
        ];

        for (const proxyUrl of proxies) {
            try {
                const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
                if (!response.ok) continue;
                const html = await response.text();
                const parsed = parseDuckDuckGoHTML(html, maxResults);
                if (parsed.length > 0) return parsed;
            } catch (_) { /* try next proxy */ }
        }
        return [];
    }

    function parseDuckDuckGoHTML(html, maxResults) {
        const results = [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const links = doc.querySelectorAll('a.result-link');
        const snippets = doc.querySelectorAll('td.result-snippet');

        for (let i = 0; i < Math.min(links.length, maxResults); i++) {
            const link = links[i];
            const snippet = snippets[i];
            const url = link.getAttribute('href') || '';
            const title = (link.textContent || '').trim();
            const snippetText = snippet ? (snippet.textContent || '').trim() : '';

            if (url && title && !url.startsWith('//duckduckgo.com')) {
                results.push({ title, url, snippet: snippetText });
            }
        }

        if (results.length === 0) {
            const allLinks = doc.querySelectorAll('a[href]');
            const seenUrls = new Set();
            allLinks.forEach(a => {
                if (results.length >= maxResults) return;
                const href = a.getAttribute('href') || '';
                const text = (a.textContent || '').trim();
                if (href.startsWith('http') && text.length > 5 &&
                    !href.includes('duckduckgo.com') && !seenUrls.has(href)) {
                    seenUrls.add(href);
                    const parentTd = a.closest('td');
                    const nextTd = parentTd ? parentTd.nextElementSibling : null;
                    const snippet = nextTd ? (nextTd.textContent || '').trim().substring(0, 200) : '';
                    results.push({ title: text, url: href, snippet });
                }
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

    // --- Expose Module ---
    M.webSearch = {
        PROVIDERS,
        isSearchEnabled,
        setSearchEnabled,
        getActiveProvider,
        setActiveProvider,
        getProviderKey,
        setProviderKey,
        performSearch,
        formatResultsForLLM,
    };

})(window.MDView);
