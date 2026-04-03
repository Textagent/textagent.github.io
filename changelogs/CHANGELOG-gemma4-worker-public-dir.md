# Fix: Move ai-worker-gemma4.js to public/

All other AI workers live in public/ so Vite copies them to dist/ for production.
ai-worker-gemma4.js was mistakenly created at the repo root — works on localhost
(Vite dev serves root files) but 404s on production GitHub Pages build.
