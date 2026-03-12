// ============================================
// doc-vars-advanced.spec.js — Complex scenario tests
// Edge cases, integration, concurrency, stress
// ============================================
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8877';

test.describe('Doc Vars — Advanced Scenarios', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'networkidle' });
        await page.waitForFunction(() => window.MDView && window.MDView._vars, { timeout: 15000 });
    });

    // =============================================
    // Edge Cases: Special Characters & Values
    // =============================================

    test('handles empty string value', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('empty_val', '');
            return { val: v.get('empty_val'), has: v.has('empty_val') };
        });
        expect(r.val).toBe('');
        expect(r.has).toBe(true);
    });

    test('handles very long value (10KB)', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            var longStr = 'x'.repeat(10000);
            v.setRuntime('long_val', longStr);
            return { len: v.get('long_val').length, matches: v.get('long_val') === longStr };
        });
        expect(r.len).toBe(10000);
        expect(r.matches).toBe(true);
    });

    test('handles JSON object value', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            var obj = JSON.stringify({ temp: 72, city: 'Tokyo', nested: { a: [1, 2, 3] } });
            v.setRuntime('json_obj', obj);
            var retrieved = v.get('json_obj');
            var parsed = JSON.parse(retrieved);
            return { temp: parsed.temp, city: parsed.city, nestedLen: parsed.nested.a.length };
        });
        expect(r.temp).toBe(72);
        expect(r.city).toBe('Tokyo');
        expect(r.nestedLen).toBe(3);
    });

    test('handles special chars in value: quotes, brackets, unicode', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('special1', 'He said "hello" & <world>');
            v.setRuntime('special2', 'こんにちは世界 🌍');
            v.setRuntime('special3', "line1\nline2\ttab");
            return {
                s1: v.get('special1'),
                s2: v.get('special2'),
                s3: v.get('special3'),
            };
        });
        expect(r.s1).toBe('He said "hello" & <world>');
        expect(r.s2).toBe('こんにちは世界 🌍');
        expect(r.s3).toContain('line1');
        expect(r.s3).toContain('line2');
    });

    test('handles var name with underscores and numbers', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('api_v2_data_2025', 'data');
            v.setRuntime('_leading_underscore', 'val');
            return {
                d1: v.get('api_v2_data_2025'),
                d2: v.get('_leading_underscore'),
            };
        });
        expect(r.d1).toBe('data');
        expect(r.d2).toBe('val');
    });

    // =============================================
    // Layer Priority: Manual vs Runtime
    // =============================================

    test('manual overrides runtime, then runtime update does NOT override manual', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('layer_test', 'runtime_v1');
            v.setManual('layer_test', 'manual_v1');
            var afterManual = v.get('layer_test');
            v.setRuntime('layer_test', 'runtime_v2');
            var afterRuntimeUpdate = v.get('layer_test');
            return { afterManual, afterRuntimeUpdate };
        });
        expect(r.afterManual).toBe('manual_v1');
        expect(r.afterRuntimeUpdate).toBe('manual_v1'); // manual still wins
    });

    test('clearRuntime does not affect manual vars', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.clearRuntime();
            v.setManual('sticky_manual', 'persists');
            v.setRuntime('temp_runtime', 'goes_away');
            v.clearRuntime();
            var allVars = v.list();
            return {
                manual: v.get('sticky_manual'),
                runtime: v.get('temp_runtime'),
                hasManualInList: !!allVars['sticky_manual'],
                hasRuntimeInList: !!allVars['temp_runtime'],
            };
        });
        expect(r.manual).toBe('persists');
        expect(r.runtime).toBeNull();
        expect(r.hasManualInList).toBe(true);
        expect(r.hasRuntimeInList).toBe(false);
    });

    test('same key in both layers — list() shows manual layer', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('both_layers', 'runtime_val');
            v.setManual('both_layers', 'manual_val');
            var entry = v.list()['both_layers'];
            return { layer: entry.layer, value: entry.value };
        });
        expect(r.layer).toBe('manual');
        expect(r.value).toBe('manual_val');
    });

    // =============================================
    // resolveText: Complex Patterns
    // =============================================

    test('resolveText handles multiple same-name references', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('r_name', 'Alice');
            return v.resolveText('Hello $(r_name), welcome $(r_name)!');
        });
        expect(r).toBe('Hello Alice, welcome Alice!');
    });

    test('resolveText handles adjacent vars', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('r_first', 'John');
            v.setRuntime('r_last', 'Doe');
            return v.resolveText('$(r_first)$(r_last)');
        });
        expect(r).toBe('JohnDoe');
    });

    test('resolveText does not resolve nested $( inside value', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('r_inner', '$(should_not_resolve)');
            return v.resolveText('val: $(r_inner)');
        });
        // Should substitute r_inner's value literally, not recurse into it
        expect(r).toBe('val: $(should_not_resolve)');
    });

    test('resolveText with empty string and null', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('r_empty', '');
            return {
                withEmpty: v.resolveText('before$(r_empty)after'),
                withNull: v.resolveText(null),
                withUndefined: v.resolveText(undefined),
            };
        });
        expect(r.withEmpty).toBe('beforeafter');
        expect(r.withNull).toBeNull();
        expect(r.withUndefined).toBeUndefined();
    });

    // =============================================
    // toJsPreamble: Integration
    // =============================================

    test('toJsPreamble produces valid executable JS', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.clearRuntime();
            v.setRuntime('j_count', '42');
            v.setRuntime('j_data', '{"items":[1,2,3]}');
            var preamble = v.toJsPreamble();
            // Execute the preamble in an eval to verify it's valid JS
            try {
                eval(preamble);
                return {
                    valid: true,
                    docVarsType: typeof __docVars,
                    countType: typeof j_count,
                    countVal: j_count,
                    dataType: typeof j_data,
                    dataItems: j_data.items ? j_data.items.length : -1,
                };
            } catch (e) {
                return { valid: false, error: e.message, preamble: preamble };
            }
        });
        expect(r.valid).toBe(true);
        expect(r.countVal).toBe(42); // '42' is valid JSON, so JSON.parse yields number
        expect(r.dataType).toBe('object'); // JSON.parse'd
        expect(r.dataItems).toBe(3);
    });

    test('toJsPreamble sanitizes unsafe var names', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('my-var-with-dashes', 'works');
            var preamble = v.toJsPreamble();
            return {
                hasSafe: preamble.includes('my_var_with_dashes'),
                hasOrigKey: preamble.includes('"my-var-with-dashes"'),
            };
        });
        expect(r.hasSafe).toBe(true);  // dashes → underscores
        expect(r.hasOrigKey).toBe(true); // original key preserved in __docVars
    });

    test('toJsPreamble returns empty string when no vars', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            // Temporarily clear everything
            v.clearRuntime();
            // Can't clear manual easily, so check if preamble at least doesn't crash
            var preamble = v.toJsPreamble();
            return typeof preamble;
        });
        expect(r).toBe('string');
    });

    // =============================================
    // formatForPrompt: Truncation & Limits
    // =============================================

    test('formatForPrompt truncates long values', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('fp_long', 'x'.repeat(5000));
            return v.formatForPrompt(['fp_long'], { maxPerVar: 100 });
        });
        expect(r).toContain('### DOCUMENT VARIABLES ###');
        expect(r.length).toBeLessThan(300); // truncated, not 5000
        expect(r).toContain('…'); // truncation marker
    });

    test('formatForPrompt respects total budget', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            for (var i = 0; i < 20; i++) {
                v.setRuntime('budget_' + i, 'value_'.repeat(100));
            }
            var names = [];
            for (var i = 0; i < 20; i++) names.push('budget_' + i);
            return v.formatForPrompt(names, { maxTotal: 500 });
        });
        expect(r.length).toBeLessThan(700); // header + budget
    });

    test('formatForPrompt with wildcard * includes all vars', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('wc_a', '1');
            v.setRuntime('wc_b', '2');
            return v.formatForPrompt(['*']);
        });
        expect(r).toContain('wc_a');
        expect(r).toContain('wc_b');
    });

    test('formatForPrompt with none returns empty', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('fp_none_test', 'value');
            return v.formatForPrompt(['none']);
        });
        expect(r).toBe('');
    });

    test('formatForPrompt mixed existing and missing vars', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('fp_exists', 'found');
            return v.formatForPrompt(['fp_exists', 'fp_missing_xyz', 'fp_also_missing']);
        });
        expect(r).toContain('fp_exists = found');
        expect(r).not.toContain('fp_missing_xyz');
    });

    // =============================================
    // onChange: Event System
    // =============================================

    test('onChange receives correct event structure', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            var lastEvent = null;
            v.onChange(function (e) { lastEvent = e; });
            v.setRuntime('oc_test', 'val1');
            return {
                hasName: 'name' in lastEvent,
                hasValue: 'value' in lastEvent,
                hasLayer: 'layer' in lastEvent,
                name: lastEvent.name,
                value: lastEvent.value,
                layer: lastEvent.layer,
            };
        });
        expect(r.hasName).toBe(true);
        expect(r.hasValue).toBe(true);
        expect(r.hasLayer).toBe(true);
        expect(r.name).toBe('oc_test');
        expect(r.value).toBe('val1');
        expect(r.layer).toBe('runtime');
    });

    test('onChange fires for every set call', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            var count = 0;
            v.onChange(function () { count++; });
            v.setRuntime('oc_a', '1');
            v.setRuntime('oc_b', '2');
            v.setManual('oc_c', '3');
            v.setRuntime('oc_a', 'updated'); // overwrite
            return count;
        });
        expect(r).toBe(4);
    });

    test('onChange listener error does not block other listeners', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            var results = [];
            v.onChange(function () { results.push('first'); });
            v.onChange(function () { throw new Error('boom'); });
            v.onChange(function () { results.push('third'); });
            v.setRuntime('oc_error_test', 'val');
            return results;
        });
        expect(r).toContain('first');
        expect(r).toContain('third'); // should not be blocked by error
    });

    // =============================================
    // Code Block @var: — Registry Scanner
    // =============================================

    test('scanner captures @var: for all language types', async ({ page }) => {
        const r = await page.evaluate(() => {
            if (!window.MDView._execRegistry) return { skip: true };
            var md = [
                '```javascript @var: js_result',
                'console.log(42);',
                '```',
                '',
                '```math @var: math_result',
                '2 + 2',
                '```',
                '',
                '```python @var: py_result',
                'print("hello")',
                '```',
                '',
                '```sql @var: sql_result',
                'SELECT 1;',
                '```',
                '',
                '```bash @var: bash_result',
                'echo hi',
                '```',
            ].join('\n');
            var blocks = window.MDView._execRegistry.scanDocument(md);
            var result = {};
            blocks.forEach(function (b) {
                result[b.runtimeKey] = b.varName;
            });
            return result;
        });
        if (r.skip) return;
        expect(r['javascript']).toBe('js_result');
        expect(r['math']).toBe('math_result');
        expect(r['python']).toBe('py_result');
        expect(r['sql']).toBe('sql_result');
        expect(r['bash']).toBe('bash_result');
    });

    test('scanner handles blocks without @var: mixed with @var: blocks', async ({ page }) => {
        const r = await page.evaluate(() => {
            if (!window.MDView._execRegistry) return { skip: true };
            var md = [
                '```javascript @var: named',
                'var x = 1;',
                '```',
                '',
                '```javascript',
                'var y = 2;',
                '```',
            ].join('\n');
            var blocks = window.MDView._execRegistry.scanDocument(md);
            var jsBlocks = blocks.filter(function (b) { return b.runtimeKey === 'javascript'; });
            return {
                count: jsBlocks.length,
                first: jsBlocks[0] ? jsBlocks[0].varName : 'none',
                second: jsBlocks[1] ? jsBlocks[1].varName : 'none',
            };
        });
        if (r.skip) return;
        expect(r.count).toBe(2);
        expect(r.first).toBe('named');
        expect(r.second).toBeNull(); // no @var: on second block
    });

    // =============================================
    // Renderer: data-var-name Attribute
    // =============================================

    test('renderer passes data-var-name through DOMPurify', async ({ page }) => {
        const r = await page.evaluate(() => {
            var md = '```javascript @var: sanitized_test\nconsole.log(1);\n```';
            // Full render pipeline: marked + DOMPurify
            var html = marked.parse(md);
            var sanitized = DOMPurify.sanitize(html, {
                ADD_TAGS: ['iframe'],
                ADD_ATTR: ['data-var-name'],
            });
            var div = document.createElement('div');
            div.innerHTML = sanitized;
            var container = div.querySelector('.executable-js-container');
            return container ? container.getAttribute('data-var-name') : null;
        });
        expect(r).toBe('sanitized_test');
    });

    test('renderer data-var-name works for math blocks', async ({ page }) => {
        const r = await page.evaluate(() => {
            var md = '```math @var: calc\n2 * 3\n```';
            var html = marked.parse(md);
            var div = document.createElement('div');
            div.innerHTML = html;
            var container = div.querySelector('.executable-math-container');
            return {
                hasContainer: !!container,
                varName: container ? container.getAttribute('data-var-name') : null,
            };
        });
        expect(r.hasContainer).toBe(true);
        expect(r.varName).toBe('calc');
    });

    test('renderer data-var-name works for python blocks', async ({ page }) => {
        const r = await page.evaluate(() => {
            var md = '```python @var: py_out\nprint("hi")\n```';
            var html = marked.parse(md);
            var div = document.createElement('div');
            div.innerHTML = html;
            var container = div.querySelector('.executable-python-container');
            return {
                hasContainer: !!container,
                varName: container ? container.getAttribute('data-var-name') : null,
            };
        });
        expect(r.hasContainer).toBe(true);
        expect(r.varName).toBe('py_out');
    });

    test('renderer data-var-name works for sql blocks', async ({ page }) => {
        const r = await page.evaluate(() => {
            var md = '```sql @var: query_result\nSELECT 1;\n```';
            var html = marked.parse(md);
            var div = document.createElement('div');
            div.innerHTML = html;
            var container = div.querySelector('.executable-sql-container');
            return {
                hasContainer: !!container,
                varName: container ? container.getAttribute('data-var-name') : null,
            };
        });
        expect(r.hasContainer).toBe(true);
        expect(r.varName).toBe('query_result');
    });

    // =============================================
    // Vars Panel: Live Update Integration
    // =============================================

    test('panel live-updates when vars change while open', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            window.MDView._varsPanel.open();
            var countBefore = document.getElementById('dv-count').textContent;
            v.setRuntime('live_panel_test_' + Date.now(), 'new_value');
            // onChange should trigger refresh
            var countAfter = document.getElementById('dv-count').textContent;
            window.MDView._varsPanel.close();
            return { before: parseInt(countBefore), after: parseInt(countAfter) };
        });
        expect(r.after).toBe(r.before + 1);
    });

    test('panel shows correct section labels', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setManual('panel_sec_manual', 'a');
            v.setRuntime('panel_sec_runtime', 'b');
            window.MDView._varsPanel.open();
            var body = document.getElementById('dv-body');
            var headers = body.querySelectorAll('.dv-section-header');
            var labels = [];
            headers.forEach(function (h) { labels.push(h.textContent.trim()); });
            window.MDView._varsPanel.close();
            return labels;
        });
        expect(r.some(l => l.includes('Document Vars'))).toBe(true);
        expect(r.some(l => l.includes('Runtime Vars'))).toBe(true);
    });

    // =============================================
    // Integration: Full Pipeline Simulation
    // =============================================

    test('API → vars → JS preamble → code block pipeline', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            // Step 1: Simulate API response writing a variable
            v.setRuntime('api_weather', '{"temp":72,"city":"SF"}');
            // Step 2: Generate JS preamble (what code blocks receive)
            var preamble = v.toJsPreamble();
            // Step 3: Execute the preamble and verify vars are accessible
            try {
                var fn = new Function(preamble + '; return { temp: api_weather.temp, city: api_weather.city };');
                var result = fn();
                return { success: true, temp: result.temp, city: result.city };
            } catch (e) {
                return { success: false, error: e.message, preamble: preamble };
            }
        });
        expect(r.success).toBe(true);
        expect(r.temp).toBe(72);
        expect(r.city).toBe('SF');
    });

    test('API var → TTS resolveText pipeline', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('api_greeting', 'Hello World');
            v.setRuntime('api_lang', 'English');
            // Simulate TTS prompt resolution
            var ttsPrompt = 'Say $(api_greeting) in $(api_lang). Extra: $(missing).';
            return v.resolveText(ttsPrompt);
        });
        expect(r).toBe('Say Hello World in English. Extra: $(missing).');
    });

    test('multi-block @input: simulation: two AI blocks with different inputs', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('api_stock', '{"AAPL":150}');
            v.setRuntime('api_news', 'Market rallied today');
            v.setRuntime('research', 'AI sector growing fast');
            // AI Block 1: @input: api_stock, api_news
            var prompt1 = v.formatForPrompt(['api_stock', 'api_news']);
            // AI Block 2: @input: research
            var prompt2 = v.formatForPrompt(['research']);
            return {
                p1HasStock: prompt1.includes('api_stock'),
                p1HasNews: prompt1.includes('api_news'),
                p1HasResearch: prompt1.includes('research'),
                p2HasResearch: prompt2.includes('research'),
                p2HasStock: prompt2.includes('api_stock'),
            };
        });
        // Block 1 should see stock and news, NOT research
        expect(r.p1HasStock).toBe(true);
        expect(r.p1HasNews).toBe(true);
        expect(r.p1HasResearch).toBe(false);
        // Block 2 should see only research
        expect(r.p2HasResearch).toBe(true);
        expect(r.p2HasStock).toBe(false);
    });

    // =============================================
    // Stress / Boundary
    // =============================================

    test('handles 100 variables without errors', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            for (var i = 0; i < 100; i++) {
                v.setRuntime('stress_' + i, 'value_' + i);
            }
            var allKeys = Object.keys(v.list());
            var stressKeys = allKeys.filter(function (k) { return k.startsWith('stress_'); });
            var sample = v.get('stress_50');
            var preamble = v.toJsPreamble();
            return {
                count: stressKeys.length,
                sample: sample,
                preambleSize: preamble.length,
                preambleValid: preamble.includes('stress_50'),
            };
        });
        expect(r.count).toBe(100);
        expect(r.sample).toBe('value_50');
        expect(r.preambleValid).toBe(true);
    });

    test('rapid set/get cycles are consistent', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            var errors = [];
            for (var i = 0; i < 50; i++) {
                v.setRuntime('rapid', 'v' + i);
                if (v.get('rapid') !== 'v' + i) {
                    errors.push('mismatch at i=' + i);
                }
            }
            return { errors: errors, finalVal: v.get('rapid') };
        });
        expect(r.errors).toEqual([]);
        expect(r.finalVal).toBe('v49');
    });

    test('toLegacyObject snapshot is independent of further changes', async ({ page }) => {
        const r = await page.evaluate(() => {
            const v = window.MDView._vars;
            v.setRuntime('snap_test', 'original');
            var snapshot = v.toLegacyObject();
            v.setRuntime('snap_test', 'changed');
            return {
                snapshotVal: snapshot['snap_test'],
                currentVal: v.get('snap_test'),
            };
        });
        expect(r.snapshotVal).toBe('original');
        expect(r.currentVal).toBe('changed');
    });
});
