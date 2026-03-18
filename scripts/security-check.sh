#!/bin/bash
# ============================================================
# security-check.sh — Pre-commit Security Guard for TextAgent
# ============================================================
# Run: bash scripts/security-check.sh
# Or:  npm run security
#
# Scans the staged (or all) JS/HTML files for known security
# anti-patterns. Returns exit code 1 if any CRITICAL issue is
# found, blocking the commit.
# ============================================================

set -euo pipefail

RED='\033[0;31m'
YEL='\033[0;33m'
GRN='\033[0;32m'
CYN='\033[0;36m'
DIM='\033[2m'
RST='\033[0m'

PASS=0
WARN=0
FAIL=0

SRC_DIRS="js/ public/ src/ index.html"
# If --staged flag, only check staged files
if [[ "${1:-}" == "--staged" ]]; then
    FILES=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null | grep -E '\.(js|html|mjs)$' || true)
    if [[ -z "$FILES" ]]; then
        echo -e "${GRN}✓ No JS/HTML files staged — skipping security check.${RST}"
        exit 0
    fi
    MODE="staged files"
else
    FILES=$(find $SRC_DIRS -type f \( -name '*.js' -o -name '*.html' -o -name '*.mjs' \) \
        ! -path '*/node_modules/*' ! -path '*/dist/*' ! -path '*/vendor/*' 2>/dev/null || true)
    MODE="full scan"
fi

echo ""
echo -e "${CYN}🛡️  TextAgent Security Check${RST} ${DIM}($MODE)${RST}"
echo -e "${DIM}─────────────────────────────────────────${RST}"

# ──────────────────────────────────────────────────
# Helper: check for a pattern in files
# Args: severity("CRITICAL"|"WARNING") label pattern [exclude_pattern]
# ──────────────────────────────────────────────────
check() {
    local severity="$1"
    local label="$2"
    local pattern="$3"
    local exclude="${4:-}"

    local matches
    if [[ -n "$exclude" ]]; then
        matches=$(echo "$FILES" | xargs grep -nHE "$pattern" 2>/dev/null | grep -vE "$exclude" || true)
    else
        matches=$(echo "$FILES" | xargs grep -nHE "$pattern" 2>/dev/null || true)
    fi

    if [[ -n "$matches" ]]; then
        local count
        count=$(echo "$matches" | wc -l | tr -d ' ')
        if [[ "$severity" == "CRITICAL" ]]; then
            echo -e "  ${RED}✖ CRITICAL:${RST} $label ${DIM}($count hit(s))${RST}"
            echo "$matches" | head -5 | while IFS= read -r line; do
                echo -e "    ${DIM}$line${RST}"
            done
            if [[ $count -gt 5 ]]; then
                echo -e "    ${DIM}... and $((count - 5)) more${RST}"
            fi
            FAIL=$((FAIL + 1))
        else
            echo -e "  ${YEL}⚠ WARNING:${RST}  $label ${DIM}($count hit(s))${RST}"
            echo "$matches" | head -3 | while IFS= read -r line; do
                echo -e "    ${DIM}$line${RST}"
            done
            WARN=$((WARN + 1))
        fi
    else
        echo -e "  ${GRN}✓${RST} $label"
        PASS=$((PASS + 1))
    fi
}

# ──────────────────────────────────────────────────
# 🔴 CRITICAL — Block commit
# ──────────────────────────────────────────────────

echo ""
echo -e "${RED}▸ Critical Checks${RST}"

# 1. Hardcoded secret keys (not Firebase client keys which are expected)
check "CRITICAL" \
    "No hardcoded secret/private keys" \
    "(PRIVATE.KEY|SECRET.KEY|sk-[a-zA-Z0-9]{20,}|-----BEGIN (RSA |EC )?PRIVATE KEY)" \
    "(PASTE_YOUR|placeholder|example|templates/|scripts/email|vendor/|\.test\.)"

# 2. API key sent via postMessage to iframes (cross-origin risk)
#    worker.postMessage({apiKey}) is SAFE (same-origin web worker)
#    contentWindow.postMessage({apiKey}, '*') is DANGEROUS
check "CRITICAL" \
    "No API keys in cross-origin postMessage" \
    "contentWindow\.postMessage.*apiKey|contentWindow\.postMessage.*api.key|postMessage.*set-api-key" \
    "(vendor/|\.test\.)"

# 3. eval() on user-supplied input (outside sandbox iframes)
check "WARNING" \
    "No direct eval() outside sandboxed context" \
    "[^a-zA-Z]eval\s*\(" \
    "(exec-sandbox\.js|templates/|vendor/|\.test\.|\.spec\.)"

# 4. document.write (XSS vector)
check "CRITICAL" \
    "No document.write() usage" \
    "document\.write\s*\(" \
    "(vendor/|\.test\.|\.spec\.)"

# 5. innerHTML with unsanitized template literals or variable concatenation
#    (Look for innerHTML = followed by non-DOMPurify content)
check "WARNING" \
    "innerHTML assignments reviewed for XSS" \
    "\.innerHTML\s*=\s*['\"\`]?[^'\"]*\\\$\{" \
    "(vendor/|\.test\.|\.spec\.)"

# ──────────────────────────────────────────────────
# 🟠 Important — Warn but don't block
# ──────────────────────────────────────────────────

echo ""
echo -e "${YEL}▸ Important Checks${RST}"

# 6. postMessage with wildcard '*' origin
check "WARNING" \
    "postMessage uses specific origin (not '*')" \
    "postMessage\([^)]+,\s*['\"]?\*['\"]?\s*\)" \
    "(vendor/|\.test\.|\.spec\.)"

# 7. addEventListener('message') without e.origin check
#    We look for message listeners that don't have origin in nearby lines
check "WARNING" \
    "postMessage listeners validate e.origin" \
    "addEventListener\(['\"]message['\"]" \
    "(vendor/|\.test\.|\.spec\.|speech-worker|tts-worker|voxtral-worker)"

# 8. fetch() with no-cors mode (can't verify response)
check "WARNING" \
    "fetch() calls avoid no-cors when possible" \
    "mode:\s*['\"]no-cors['\"]" \
    "(vendor/|\.test\.|\.spec\.)"

# 9. Sensitive data in console.log (API keys, tokens)
check "WARNING" \
    "No sensitive data in console.log" \
    "console\.(log|info|debug)\(.*([Aa]pi.?[Kk]ey|token|password|secret|credential)" \
    "(vendor/|\.test\.|\.spec\.)"

# ──────────────────────────────────────────────────
# 🟡 Best Practices
# ──────────────────────────────────────────────────

echo ""
echo -e "${CYN}▸ Best Practice Checks${RST}"

# 10. Verify DOMPurify is used on rendered markdown
check "WARNING" \
    "DOMPurify.sanitize present in renderer" \
    "DOMPurify\.sanitize" \
    ""
# Invert: it SHOULD exist — override result if no matches found
if ! echo "$FILES" | xargs grep -qE "DOMPurify\.sanitize" 2>/dev/null; then
    # Only warn if renderer.js is in scope
    if echo "$FILES" | grep -q "renderer.js"; then
        echo -e "  ${YEL}⚠ WARNING:${RST}  DOMPurify.sanitize NOT found in renderer — XSS risk"
        WARN=$((WARN + 1))
        PASS=$((PASS - 1))
    fi
fi

# 11. Firestore rules: verify delete is blocked
if [[ -f "firestore.rules" ]]; then
    if grep -q 'allow delete: if false' firestore.rules; then
        echo -e "  ${GRN}✓${RST} Firestore: delete blocked (allow delete: if false)"
        PASS=$((PASS + 1))
    else
        echo -e "  ${RED}✖ CRITICAL:${RST} Firestore: client deletes NOT blocked!"
        FAIL=$((FAIL + 1))
    fi

    if grep -q 'validView()' firestore.rules; then
        echo -e "  ${GRN}✓${RST} Firestore: view field validated (validView helper)"
        PASS=$((PASS + 1))
    else
        echo -e "  ${YEL}⚠ WARNING:${RST}  Firestore: view field not validated"
        WARN=$((WARN + 1))
    fi

    if grep -q "'wt'" firestore.rules; then
        echo -e "  ${GRN}✓${RST} Firestore: write-token (wt) enforced"
        PASS=$((PASS + 1))
    else
        echo -e "  ${RED}✖ CRITICAL:${RST} Firestore: write-token (wt) NOT in rules"
        FAIL=$((FAIL + 1))
    fi
fi

# 12. Sandbox attribute on executable iframes
check "WARNING" \
    "Executable iframes use sandbox attribute" \
    "sandbox.*allow-scripts" \
    "(vendor/|\.test\.|\.spec\.)"
# Invert check: it should exist
if ! echo "$FILES" | xargs grep -qE "sandbox.*allow-scripts" 2>/dev/null; then
    if echo "$FILES" | grep -q "exec-sandbox.js"; then
        echo -e "  ${YEL}⚠ WARNING:${RST}  sandbox='allow-scripts' NOT found in exec-sandbox"
        WARN=$((WARN + 1))
        PASS=$((PASS - 1))
    fi
fi

# 13. CAPTCHA on email endpoint
if echo "$FILES" | xargs grep -qE "captchaToken|turnstile" 2>/dev/null; then
    echo -e "  ${GRN}✓${RST} Email endpoint: CAPTCHA token present"
    PASS=$((PASS + 1))
else
    if echo "$FILES" | grep -q "cloud-share.js"; then
        echo -e "  ${YEL}⚠ WARNING:${RST}  No CAPTCHA token found in email flow"
        WARN=$((WARN + 1))
    fi
fi

# ──────────────────────────────────────────────────
# Summary
# ──────────────────────────────────────────────────

echo ""
echo -e "${DIM}─────────────────────────────────────────${RST}"
echo -e "  ${GRN}✓ $PASS passed${RST}  ${YEL}⚠ $WARN warnings${RST}  ${RED}✖ $FAIL critical${RST}"
echo ""

if [[ $FAIL -gt 0 ]]; then
    echo -e "${RED}❌ COMMIT BLOCKED — fix $FAIL critical issue(s) above.${RST}"
    echo ""
    exit 1
fi

if [[ $WARN -gt 0 ]]; then
    echo -e "${YEL}⚠  $WARN warning(s) — review before shipping.${RST}"
    echo ""
fi

echo -e "${GRN}✅ Security check passed.${RST}"
echo ""
exit 0
