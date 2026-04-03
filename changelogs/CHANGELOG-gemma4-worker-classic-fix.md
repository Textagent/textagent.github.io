# Fix: Gemma 4 Worker Init — classic worker type + error handling

- ai-assistant.js: read `workerType` from model config (default: module); Gemma 4 workers must be classic, not module workers, because Vite dev mode intercepts module worker imports and fails to resolve external CDN URLs via its module bundler
- ai-models.js: added `workerType: "classic"` to gemma4-e2b and gemma4-e4b configs
- ai-worker-gemma4.js: added unhandledrejection handler, try/catch in message handler, null-checks for Gemma4 classes with readable error messages
