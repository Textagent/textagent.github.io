# Demo Videos Build Fix
- Copied 9 demo WebP videos to public/assets/demos/ so Vite includes them in production build
- Root cause: assets/demos/ was outside publicDir (public/), so vite build did not copy them to dist/
