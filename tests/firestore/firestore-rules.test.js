#!/usr/bin/env node
// ============================================
// firestore-rules.test.js — Validate firestore.rules structure
//
// Zero-dependency test: uses only node:assert and node:fs.
// Parses the rules file and checks that field lists, type
// validations, and security invariants match what the JS
// code actually writes to Firestore.
//
// Run:  node tests/firestore/firestore-rules.test.js
//       npm run test:firestore
// ============================================
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rulesPath = resolve(__dirname, '../../firestore.rules');
const rules = readFileSync(rulesPath, 'utf-8');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ✅ ${name}`);
    } catch (e) {
        failed++;
        console.log(`  ❌ ${name}`);
        console.log(`     ${e.message}`);
    }
}

/**
 * Extract all hasOnly([...]) field arrays from the rules text.
 * Returns an array of sorted field-name arrays.
 */
function extractHasOnlyLists() {
    const lists = [];
    // Match hasOnly(['field1', 'field2', ...]) — may span multiple lines
    const flat = rules.replace(/\n/g, ' ');
    const regex = /hasOnly\(\[([^\]]+)\]\)/g;
    let m;
    while ((m = regex.exec(flat)) !== null) {
        const fields = m[1]
            .split(',')
            .map(s => s.trim().replace(/['"]/g, ''))
            .filter(Boolean)
            .sort();
        lists.push(fields);
    }
    return lists;
}

console.log('\n🔥 Firestore Rules Validation\n');
console.log(`   Rules file: ${rulesPath}\n`);

// ── 1. File exists and is non-empty ─────────────────────────
test('Rules file exists and is non-empty', () => {
    assert.ok(rules.length > 0, 'firestore.rules is empty');
});

// ── 2. Field list checks ────────────────────────────────────
const allLists = extractHasOnlyLists();

test('Contains at least 3 hasOnly() field lists (quick create, secure create, update)', () => {
    assert.ok(allLists.length >= 3, `Found only ${allLists.length} hasOnly() lists, expected >= 3`);
});

// Expected field sets (sorted for comparison)
const QUICK_FIELDS = ['d', 't', 'view', 'wt'].sort();
const SECURE_FIELDS = ['d', 'salt', 'secure', 't', 'view', 'wt'].sort();
const UPDATE_FIELDS = ['d', 't', 'view', 'wt'].sort();

test('Quick share create rule allows fields: d, t, wt, view', () => {
    const found = allLists.some(l => JSON.stringify(l) === JSON.stringify(QUICK_FIELDS));
    assert.ok(found, `No hasOnly() list matches ${JSON.stringify(QUICK_FIELDS)}. Found: ${JSON.stringify(allLists)}`);
});

test('Secure share create rule allows fields: d, t, salt, secure, wt, view', () => {
    const found = allLists.some(l => JSON.stringify(l) === JSON.stringify(SECURE_FIELDS));
    assert.ok(found, `No hasOnly() list matches ${JSON.stringify(SECURE_FIELDS)}. Found: ${JSON.stringify(allLists)}`);
});

test('Update rule allows fields: d, t, wt, view', () => {
    // There should be at least TWO lists matching QUICK_FIELDS (create + update)
    const count = allLists.filter(l => JSON.stringify(l) === JSON.stringify(UPDATE_FIELDS)).length;
    assert.ok(count >= 2, `Expected at least 2 hasOnly() lists for ${JSON.stringify(UPDATE_FIELDS)} (create + update), found ${count}`);
});

// ── 3. validView() helper ───────────────────────────────────
test('validView() helper function exists', () => {
    assert.ok(rules.includes('function validView()'), 'Missing validView() function');
});

test('validView() restricts to ppt and preview', () => {
    assert.ok(rules.includes("'ppt'") || rules.includes('"ppt"'), 'validView() does not check for ppt');
    assert.ok(rules.includes("'preview'") || rules.includes('"preview"'), 'validView() does not check for preview');
});

test('validView() is called in create and update rules', () => {
    const callCount = (rules.match(/validView\(\)/g) || []).length;
    // Should be called at least 3 times: quick create, secure create, update
    assert.ok(callCount >= 3, `validView() called ${callCount} times, expected >= 3`);
});

// ── 4. Security invariants ──────────────────────────────────
test('Read is publicly allowed (allow read: if true)', () => {
    assert.ok(/allow\s+read\s*:\s*if\s+true/.test(rules), 'Missing: allow read: if true');
});

test('Delete is denied (allow delete: if false)', () => {
    assert.ok(/allow\s+delete\s*:\s*if\s+false/.test(rules), 'Missing: allow delete: if false');
});

test('Data field d has string type check', () => {
    assert.ok(rules.includes('request.resource.data.d is string'), 'Missing type check: d is string');
});

test('Timestamp field t has int type check', () => {
    assert.ok(rules.includes('request.resource.data.t is int'), 'Missing type check: t is int');
});

test('Write-token wt has string type check', () => {
    assert.ok(rules.includes('request.resource.data.wt is string'), 'Missing type check: wt is string');
});

// ── 5. Size limits ──────────────────────────────────────────
test('Data size limit exists (d.size() < 1048576 = 1 MB)', () => {
    assert.ok(rules.includes('d.size() < 1048576'), 'Missing data size limit: d.size() < 1048576');
});

test('Write-token minimum length (wt.size() >= 16)', () => {
    assert.ok(rules.includes('wt.size() >= 16'), 'Missing wt minimum length check');
});

test('Write-token maximum length (wt.size() <= 64)', () => {
    assert.ok(rules.includes('wt.size() <= 64'), 'Missing wt maximum length check');
});

// ── 6. Write-token ownership check ──────────────────────────
test('Update rule verifies write-token ownership (wt == resource.data.wt)', () => {
    assert.ok(
        rules.includes('request.resource.data.wt == resource.data.wt'),
        'Missing write-token ownership check in update rule'
    );
});

test('Update rule has legacy fallback for docs without wt', () => {
    assert.ok(
        /!\s*\(\s*'wt'\s+in\s+resource\.data\s*\)/.test(rules),
        'Missing legacy fallback: !(\'wt\' in resource.data)'
    );
});

// ── 7. Secure share specific fields ─────────────────────────
test('Secure share checks salt is string', () => {
    assert.ok(rules.includes('request.resource.data.salt is string'), 'Missing type check: salt is string');
});

test('Secure share checks secure == true', () => {
    assert.ok(rules.includes('request.resource.data.secure == true'), 'Missing check: secure == true');
});

// ── 8. Catch-all deny ───────────────────────────────────────
test('Default deny for other collections', () => {
    assert.ok(
        /match\s+\/\{document=\*\*\}/.test(rules) && /allow\s+read,\s*write\s*:\s*if\s+false/.test(rules),
        'Missing catch-all deny for other collections'
    );
});

// ── Results ─────────────────────────────────────────────────
console.log(`\n   ${passed} passed, ${failed} failed, ${passed + failed} total\n`);

if (failed > 0) {
    process.exit(1);
}
