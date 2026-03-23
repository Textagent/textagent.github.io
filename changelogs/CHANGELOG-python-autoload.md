# Changelog — Python Package Auto-Loading

## 2026-03-24

### What Changed
- **Auto-loading Python packages**: `exec-python.js` now uses `pyodide.loadPackagesFromImports(code)` to automatically detect and install any Pyodide-supported Python package before execution — no hardcoded package lists needed.
- **Matplotlib fix**: Previously, matplotlib import failed silently because the package was never loaded into the Pyodide runtime. Now it loads automatically.
- **Warning suppression**: Suppressed the `plt.show()` UserWarning ("non-GUI backend") since the AGG backend is required in-browser and charts are captured as inline PNG images.
- **Universal package support**: Any Pyodide-supported library (numpy, pandas, scipy, scikit-learn, sympy, networkx, etc.) now works without platform changes.

### Files Modified
- `js/exec-python.js` — replaced hardcoded matplotlib/numpy detection with universal `loadPackagesFromImports()` call; added `warnings.filterwarnings('ignore', '.*non-GUI backend.*')` for matplotlib AGG backend

### Impact
- Python code blocks in demo showcase and user documents now correctly load and render matplotlib charts
- Users can import any Pyodide-supported package without needing platform upgrades
- No more "non-GUI backend" warning cluttering chart output
