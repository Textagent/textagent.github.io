// ============================================
// doc-vars.js — Document Variables Façade
// Two-layer named variable store:
//   manual  — persisted vars from <!-- @variables -->
//   runtime — API/Translate/@var: outputs (session-scoped)
// ============================================
(function (M) {
    'use strict';

    var _manual = {};    // small scalars from @variables block
    var _runtime = {};   // API responses, @var: outputs — ephemeral
    var _listeners = [];

    function notify(name, value, layer) {
        for (var i = 0; i < _listeners.length; i++) {
            try { _listeners[i]({ name: name, value: value, layer: layer }); } catch (_) {}
        }
    }

    // ========================================
    // Core API
    // ========================================

    var api = {
        /**
         * Get a variable by name.  Manual (persisted) vars take priority.
         */
        get: function (name) {
            if (name in _manual) return _manual[name];
            if (name in _runtime) return _runtime[name];
            // Legacy fallback: check raw __API_VARS directly
            if (window.__API_VARS && name in window.__API_VARS) return window.__API_VARS[name];
            return null;
        },

        has: function (name) {
            return name in _manual || name in _runtime ||
                (window.__API_VARS && name in window.__API_VARS);
        },

        /**
         * Set a manual (persisted) variable — from @variables block.
         */
        setManual: function (name, value) {
            _manual[name] = value;
            notify(name, value, 'manual');
        },

        /**
         * Set a runtime variable — from API calls, @var: outputs.
         * Also syncs to legacy window.__API_VARS for backward compat.
         */
        setRuntime: function (name, value) {
            _runtime[name] = value;
            // Legacy sync — existing code may still read __API_VARS directly
            if (!window.__API_VARS) window.__API_VARS = {};
            window.__API_VARS[name] = value;
            notify(name, value, 'runtime');
        },

        /**
         * List all variables with their layer info.
         */
        list: function () {
            var all = {};
            // Runtime first, manual overrides
            for (var k in _runtime) {
                if (_runtime.hasOwnProperty(k)) {
                    all[k] = { value: _runtime[k], layer: 'runtime' };
                }
            }
            for (var k in _manual) {
                if (_manual.hasOwnProperty(k)) {
                    all[k] = { value: _manual[k], layer: 'manual' };
                }
            }
            return all;
        },

        clearRuntime: function () {
            // Also remove from legacy __API_VARS since setRuntime dual-writes there
            if (window.__API_VARS) {
                for (var k in _runtime) {
                    if (_runtime.hasOwnProperty(k)) {
                        delete window.__API_VARS[k];
                    }
                }
            }
            _runtime = {};
        },

        clearManual: function () {
            _manual = {};
        },

        // ========================================
        // Text resolution
        // ========================================

        /**
         * Replace $(name) patterns in text with var values.
         * Leaves unresolved $(name) intact.
         */
        resolveText: function (text) {
            if (!text) return text;
            return text.replace(/\$\(([a-zA-Z_]\w*)\)/g, function (match, name) {
                var val = api.get(name);
                return val !== null ? String(val) : match;
            });
        },

        // ========================================
        // JS sandbox injection
        // ========================================

        /**
         * Generate JS preamble that declares all vars for sandboxed code blocks.
         * Uses a single __docVars object + aliased top-level vars.
         */
        toJsPreamble: function () {
            var entries = api.toLegacyObject();
            var keys = Object.keys(entries);
            if (keys.length === 0) return '';

            var lines = ['var __docVars = ' + JSON.stringify(entries) + ';'];
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                var safe = k.replace(/[^a-zA-Z0-9_]/g, '_');
                var raw = entries[k];
                // Try to parse as JSON object/array, otherwise keep as string
                try {
                    JSON.parse(raw);
                    lines.push('var ' + safe + ' = JSON.parse(__docVars[' + JSON.stringify(k) + ']);');
                } catch (_) {
                    lines.push('var ' + safe + ' = __docVars[' + JSON.stringify(k) + '];');
                }
            }
            return lines.join('\n') + '\n';
        },

        // ========================================
        // AI prompt injection
        // ========================================

        /**
         * Format selected vars for AI prompt injection.
         * @param {string[]} names - var names to include (or ['*'] for all)
         * @param {object} [opts] - { maxPerVar, maxTotal }
         */
        formatForPrompt: function (names, opts) {
            opts = opts || {};
            var maxPerVar = opts.maxPerVar || 2000;
            var maxTotal = opts.maxTotal || 6000;

            // Resolve wildcard
            if (names.length === 1 && names[0] === '*') {
                names = Object.keys(api.list());
            }

            var lines = [];
            var total = 0;
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                if (name === 'none') return ''; // explicit opt-out
                var val = api.get(name);
                if (val === null) continue;
                var display = String(val);
                if (display.length > maxPerVar) {
                    display = display.substring(0, maxPerVar) + '…';
                }
                var line = name + ' = ' + display;
                if (total + line.length > maxTotal) break;
                lines.push(line);
                total += line.length;
            }

            if (lines.length === 0) return '';
            return '### DOCUMENT VARIABLES ###\n' + lines.join('\n') + '\n---\n';
        },

        // ========================================
        // Legacy compatibility
        // ========================================

        /**
         * Returns a plain object matching the old window.__API_VARS shape.
         */
        toLegacyObject: function () {
            var obj = {};
            // Start with actual __API_VARS (may have been set by legacy code)
            if (window.__API_VARS) {
                for (var k in window.__API_VARS) {
                    if (window.__API_VARS.hasOwnProperty(k)) {
                        obj[k] = window.__API_VARS[k];
                    }
                }
            }
            // Layer runtime over it
            for (var k in _runtime) {
                if (_runtime.hasOwnProperty(k)) obj[k] = _runtime[k];
            }
            // Manual wins
            for (var k in _manual) {
                if (_manual.hasOwnProperty(k)) obj[k] = _manual[k];
            }
            return obj;
        },

        // ========================================
        // Change listeners
        // ========================================

        onChange: function (fn) {
            if (typeof fn === 'function') _listeners.push(fn);
        },

        offChange: function (fn) {
            _listeners = _listeners.filter(function (f) { return f !== fn; });
        }
    };

    // Expose
    M._vars = api;

})(window.MDView);
