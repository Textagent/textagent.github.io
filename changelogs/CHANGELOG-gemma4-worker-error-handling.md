# Gemma4 Worker — Unhandled Rejection Safety Net

- Added `unhandledrejection` listener at worker top level to route async throws to `postMessage({type:"error"})` instead of `worker.onerror`
- Wrapped message handler switch in try/catch
- Added null-checks for `Gemma4ForConditionalGeneration` + `Gemma4Processor` with readable error messages
- Root cause: browser evicted cached model (persistent storage not granted), re-download triggered uncaught async rejection
