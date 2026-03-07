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
            keyStorageKey: 'md-viewer-brave-api-key',
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
            keyStorageKey: 'md-viewer-serper-api-key',
            dialogTitle: 'Connect to Serper.dev',
            dialogDesc: 'Enter your free Serper.dev API key for Google search results.',
            dialogPlaceholder: 'Your Serper API key...',
            dialogLink: 'https://serper.dev/',
            dialogLinkText: 'serper.dev',
        },
    };

    // --- State ---
    let searchEnabled = localStorage.getItem('md-viewer-search-enabled') === 'true';
    let activeProvider = localStorage.getItem('md-viewer-search-provider') || 'duckduckgo';

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
        localStorage.setItem('md-viewer-search-enabled', searchEnabled ? 'true' : 'false');
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
            localStorage.setItem('md-viewer-search-provider', providerId);
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
    // Uses the DuckDuckGo HTML search and extracts results
    // via a CORS proxy (api.allorigins.win) since DDG doesn't have a public JSON API
    async function searchDuckDuckGo(query, maxResults) {
        const encoded = encodeURIComponent(query);
        // Use DuckDuckGo's lite (HTML) version via a CORS proxy
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://lite.duckduckgo.com/lite/?q=' + encoded)}`;

        const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error('DuckDuckGo search failed: HTTP ' + response.status);

        const html = await response.text();
        return parseDuckDuckGoHTML(html, maxResults);
    }

    function parseDuckDuckGoHTML(html, maxResults) {
        const results = [];
        // DDG lite returns results in <a class="result-link"> and <td class="result-snippet">
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Find result links
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

        // Fallback: if no result-link class, try table-based layout
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
                    // Try to find adjacent text as a snippet
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
