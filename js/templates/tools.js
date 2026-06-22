// ============================================
// templates/tools.js — Tools Templates
// ============================================
window.__MDV_TEMPLATES_TOOLS = [
  {
    name: 'Calculator',
    category: 'tools',
    icon: 'bi-calculator',
    description: 'Interactive calculator widget — runs live in the preview',
    content: `# 🧮 Calculator

A working calculator with full **BODMAS** support — Brackets, Orders (powers), Division/Multiplication, Addition/Subtraction — all evaluated with correct precedence. Type or click; supports + − × ÷ ^ ( ), decimals, percent, sign-flip, and clear. **You can also paste a number or a full expression** (e.g. \`12*7+3\` or \`(2+3)^2\`) into the display.

A **history panel** on the right lists every calculation. Edit the expression *or* the number on either side of \`=\` and the row re-evaluates live — the latest result is pushed back to the main display.

\`\`\`html-autorun
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, "SF Pro", system-ui, sans-serif;
         background: #f1f3f5; color: #e2e8f0;
         display: flex; justify-content: center; align-items: flex-start;
         gap: 18px; padding: 24px; margin: 0; flex-wrap: wrap; }
  .calc { width: 280px; background: #1c1c1e; border-radius: 28px; padding: 18px 16px 22px;
          box-shadow: 0 10px 40px rgba(0,0,0,.25); }
  .history { width: 320px; background: #1c1c1e; border-radius: 28px; padding: 18px 18px 22px;
             box-shadow: 0 10px 40px rgba(0,0,0,.25); max-height: 540px;
             display: flex; flex-direction: column; color: #e2e8f0; }
  .history h3 { margin: 0 0 10px; font-size: 13px; letter-spacing: .06em;
                text-transform: uppercase; color: #8e8e93; display: flex;
                justify-content: space-between; align-items: center; }
  .history .clear-h { background: transparent; color: #ff453a; border: 0;
                      font-size: 12px; cursor: pointer; padding: 2px 6px; }
  .history .clear-h:hover { background: #2c2c2e; border-radius: 6px; }
  .history .list { flex: 1; overflow-y: auto; min-height: 60px; }
  .history .empty { color: #636366; font-size: 12px; padding: 8px 4px; }
  .row { display: flex; align-items: center; gap: 6px; padding: 6px 4px;
         border-bottom: 1px solid #2c2c2e; cursor: default; }
  .row:hover { background: #2c2c2e; border-radius: 8px; }
  .row .expr, .row .res { background: #2c2c2e; color: #e2e8f0; border: 1px solid #3a3a3c;
                          border-radius: 8px; padding: 6px 8px; font-size: 13px;
                          font-family: ui-monospace, "SF Mono", monospace; outline: none;
                          min-width: 0; }
  .row .expr { flex: 1 1 auto; }
  .row .res  { flex: 0 0 90px; text-align: right; font-weight: 600; color: #30d158; }
  .row .res.err { color: #ff453a; }
  .row .expr:focus, .row .res:focus { border-color: #ff9f0a; }
  .row .eq { color: #8e8e93; font-weight: 700; }
  .row .use { background: transparent; color: #8e8e93; border: 0; cursor: pointer;
              font-size: 14px; padding: 0 4px; }
  .row .use:hover { color: #ff9f0a; }

  .screen { padding: 18px 8px 14px; min-height: 110px; outline: none;
            display: flex; flex-direction: column; align-items: flex-end;
            justify-content: flex-end; cursor: text; user-select: text; }
  .screen .expr-line { color: #8e8e93; font-size: 18px; font-weight: 300;
                       text-align: right; min-height: 22px; line-height: 22px;
                       white-space: nowrap; overflow-x: auto; max-width: 100%;
                       outline: none; cursor: text; }
  .screen .expr-line:focus { color: #ffffff; }
  .screen .expr-line:empty::before { content: '\\200B'; }
  .screen .result-line { color: #fff; font-size: 56px; font-weight: 300;
                         line-height: 1.1; text-align: right; letter-spacing: -.5px;
                         white-space: nowrap; overflow-x: auto; max-width: 100%; }
  .hint { font-size: 11px; color: #636366; text-align: right;
          margin: 0 6px 10px 0; }

  .grid { display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 10px; padding: 0 4px; }
  .grid button { aspect-ratio: 1 / 1; border: 0; border-radius: 9999px;
                 font-size: 24px; font-weight: 400; cursor: pointer;
                 background: #333335; color: #ffffff;
                 display: flex; align-items: center; justify-content: center;
                 transition: filter .12s ease; padding: 0; }
  .grid button:active { filter: brightness(1.3); }
  .grid button.op  { background: #ff9f0a; color: #fff; font-size: 28px; font-weight: 500; }
  .grid button.eq  { background: #ff9f0a; color: #fff; font-size: 28px; font-weight: 500; }
  .grid button.fn  { background: #a5a5a5; color: #1c1c1e; }
  .grid button.zero { grid-column: span 2; aspect-ratio: auto;
                      border-radius: 9999px; justify-content: flex-start;
                      padding-left: 32px; }
  .pow { font-size: 18px; }
  .pow sup { font-size: 12px; vertical-align: super; }
</style>
</head>
<body>
  <div class="calc">
    <div class="screen" id="d">
      <div class="expr-line" id="expr-line" contenteditable="true" spellcheck="false" title="Click to edit and re-evaluate"></div>
      <div class="result-line" id="result-line" contenteditable="true" spellcheck="false" inputmode="decimal">0</div>
    </div>
    <div class="hint">Tip: paste a number or expression (e.g. 12*7+3)</div>
    <div class="grid">
      <button class="fn" data-bracket="(">(</button>
      <button class="fn" data-bracket=")">)</button>
      <button class="fn" data-op="^"><span class="pow">x<sup>y</sup></span></button>
      <button class="fn" data-act="back" title="Backspace">⌫</button>

      <button class="fn" data-act="clear">AC</button>
      <button class="fn" data-act="sign">±</button>
      <button class="fn" data-act="pct">%</button>
      <button class="op" data-op="/">÷</button>

      <button data-num="7">7</button>
      <button data-num="8">8</button>
      <button data-num="9">9</button>
      <button class="op" data-op="*">×</button>

      <button data-num="4">4</button>
      <button data-num="5">5</button>
      <button data-num="6">6</button>
      <button class="op" data-op="-">−</button>

      <button data-num="1">1</button>
      <button data-num="2">2</button>
      <button data-num="3">3</button>
      <button class="op" data-op="+">+</button>

      <button data-num="0" class="zero">0</button>
      <button data-num=".">.</button>
      <button class="eq" data-act="eq">=</button>
    </div>
  </div>

  <div class="history">
    <h3>History <button class="clear-h" id="clear-h" title="Clear history">Clear</button></h3>
    <div class="list" id="hist-list">
      <div class="empty">No calculations yet. Press = or paste an expression.</div>
    </div>
  </div>
<script>
  (function () {
    var d = document.getElementById('d');
    var exprLine = document.getElementById('expr-line');
    var resultLine = document.getElementById('result-line');
    var histListEl = document.getElementById('hist-list');
    var clearHBtn = document.getElementById('clear-h');
    var cur = '0', prev = null, op = null, justEvaled = false;
    var pending = false; // true after an operator: cur holds previous operand but display should not echo it
    var chain = [];   // chained operands/operators until =
    var history = []; // [{ expr, result }]

    function show() {
      // iOS-style 2-line display:
      //   top (small, dim)  = full expression as you type it
      //   bottom (big)      = live running result while typing, final result after =
      var topExpr, bottomNum;
      if (justEvaled && chain.length === 0) {
        // Just pressed =: top = "expr =", bottom = result
        var last = history[history.length - 1];
        topExpr   = last ? (last.expr + ' =') : '';
        bottomNum = cur;
      } else {
        // Typing — top shows the entire expression so far (chain + current operand).
        // Bottom shows a live partial-evaluation result; falls back to the current operand
        // when the expression isn't yet complete (e.g. half-open brackets, trailing operator).
        topExpr = chain.join('') + (pending ? '' : cur);
        var partial = pending ? chain.slice(0, -1).join('') : topExpr;
        var rv = partial ? safeEval(partial) : null;
        bottomNum = (rv === null || !isFinite(rv)) ? cur : String(rv);
      }
      if (exprLine) exprLine.textContent = topExpr;
      if (resultLine) resultLine.textContent = bottomNum;
    }

    // Normalize unicode operators (× ÷ − −) and strip whitespace
    function normalize(s) {
      return String(s)
        .replace(/[×✕✖]/g, '*')
        .replace(/[÷]/g, '/')
        .replace(/[−–—]/g, '-')
        .replace(/,/g, '')
        .replace(/\\s+/g, '');
    }

    // Strict allowlist: digits, . + - * / ( ) ^ only. No identifiers, no eval keywords.
    // ^ is exponent (we translate it to ** before eval to keep BODMAS precedence).
    var SAFE_EXPR = /^[-+*/().\\d^]+$/;

    // Returns a finite number or null
    function safeEval(expr) {
      // Normalize ^ → ** (JS exponent) and reject anything outside the allowlist
      var src = String(expr).replace(/\\^/g, '**');
      if (!SAFE_EXPR.test(expr)) return null;
      // Disallow runs of three+ identical operators or weird combos.
      // (** is fine because the only allowed ** sequence is the translated power op.)
      if (/[+/]{2,}|\\*{3,}|\\^{2,}/.test(expr)) return null;
      try {
        // eslint-disable-next-line no-new-func
        var r = Function('"use strict";return (' + src + ')')();
        return (typeof r === 'number' && isFinite(r)) ? r : null;
      } catch (_) { return null; }
    }

    function applyPasted(raw) {
      var s = normalize(raw);
      if (!s) return false;
      chain = [];
      // Pure number (incl. negative / decimal)
      if (/^-?\\d+(\\.\\d+)?$/.test(s)) {
        cur = s; prev = null; op = null; justEvaled = true; pending = false;
        addHistory(s, s);
        show();
        return true;
      }
      var r = safeEval(s);
      if (r === null) {
        cur = 'Error'; justEvaled = true; pending = false;
        addHistory(s, 'Error');
        show();
        return true;
      }
      cur = String(r); prev = null; op = null; justEvaled = true; pending = false;
      addHistory(s, String(r));
      show();
      return true;
    }

    // --- History ---
    function addHistory(expr, result) {
      // Merge with last entry if it's the same expression (avoid noisy duplicates)
      var last = history[history.length - 1];
      if (last && last.expr === expr && last.result === result) return;
      history.push({ expr: expr, result: result });
      renderHistory();
    }

    function renderHistory() {
      if (history.length === 0) {
        histListEl.innerHTML = '<div class="empty">No calculations yet. Press = or paste an expression.</div>';
        return;
      }
      var html = '';
      for (var i = history.length - 1; i >= 0; i--) {
        var h = history[i];
        var errCls = (h.result === 'Error') ? ' err' : '';
        html += '<div class="row" data-idx="' + i + '">' +
                '<span class="expr" contenteditable="true" spellcheck="false">' + escapeHtml(h.expr) + '</span>' +
                '<span class="eq">=</span>' +
                '<span class="res' + errCls + '" contenteditable="true" spellcheck="false">' + escapeHtml(h.result) + '</span>' +
                '<button class="use" title="Send to display">↩</button>' +
                '</div>';
      }
      histListEl.innerHTML = html;
    }

    function escapeHtml(s) {
      // Build entity strings dynamically — writing them as literals (&amp; etc.) in source
      // would get decoded by the markdown renderer when reading <pre><code> via textContent.
      var amp = String.fromCharCode(38) + 'amp;';
      var lt  = String.fromCharCode(38) + 'lt;';
      var gt  = String.fromCharCode(38) + 'gt;';
      var qt  = String.fromCharCode(38) + 'quot;';
      var ap  = String.fromCharCode(38) + '#39;';
      return String(s).replace(/[&<>"']/g, function (c) {
        return c === '&' ? amp : c === '<' ? lt : c === '>' ? gt : c === '"' ? qt : ap;
      });
    }

    // Re-evaluate when a row's expression OR result is edited
    histListEl.addEventListener('blur', function (e) {
      var t = e.target;
      var row = t.closest && t.closest('.row');
      if (!row) return;
      var idx = parseInt(row.getAttribute('data-idx'), 10);
      if (isNaN(idx) || !history[idx]) return;

      if (t.classList.contains('expr')) {
        var newExpr = (t.textContent || '').trim();
        history[idx].expr = newExpr;
        var s = normalize(newExpr);
        var r;
        if (/^-?\\d+(\\.\\d+)?$/.test(s)) r = s;
        else { var v = safeEval(s); r = (v === null) ? 'Error' : String(v); }
        history[idx].result = r;
      } else if (t.classList.contains('res')) {
        // Editing the result: trust it (lets user override) but flag non-numeric as Error
        var nr = (t.textContent || '').trim();
        history[idx].result = (nr === '' ? 'Error' : nr);
      } else {
        return;
      }
      renderHistory();
      // Push latest row's result to main display
      var latest = history[history.length - 1];
      if (latest && latest.result !== 'Error' && /^-?\\d+(\\.\\d+)?$/.test(latest.result)) {
        cur = latest.result; prev = null; op = null; chain = []; justEvaled = true; pending = false; show();
      }
    }, true);

    // Enter inside a row cell commits the edit (blur the field)
    histListEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.matches('.expr, .res')) {
        e.preventDefault();
        e.target.blur();
      }
    });

    // Click ↩ to push that row's result to the main display
    histListEl.addEventListener('click', function (e) {
      if (e.target.classList && e.target.classList.contains('use')) {
        var row = e.target.closest('.row');
        var idx = parseInt(row.getAttribute('data-idx'), 10);
        var h = history[idx];
        if (!h) return;
        if (h.result !== 'Error' && /^-?\\d+(\\.\\d+)?$/.test(h.result)) {
          cur = h.result; prev = null; op = null; chain = []; justEvaled = true; pending = false; show();
        }
      }
    });

    if (clearHBtn) clearHBtn.addEventListener('click', function () { history = []; renderHistory(); });

    function inputNum(n) {
      if (justEvaled) { cur = '0'; justEvaled = false; }
      pending = false;
      if (n === '.' && /\\.[^()]*$/.test(cur)) return; // dot already in current sub-operand
      cur = (cur === '0' && n !== '.') ? n : cur + n;
      show();
    }

    function inputBracket(b) {
      if (justEvaled) { cur = '0'; justEvaled = false; }
      pending = false;
      // Replace lone "0" when typing "(" so user can start fresh, but allow stacking parens.
      if (cur === '0' && b === '(') cur = '(';
      else cur = cur + b;
      show();
    }

    function backspace() {
      // If a pending operator is waiting, backspace cancels it (pop operator + restore operand)
      if (pending && chain.length >= 2) {
        chain.pop();
        cur = chain.pop();
        pending = false;
        justEvaled = false;
        show();
        return;
      }
      // After =, backspace just clears the result
      if (justEvaled) { cur = '0'; justEvaled = false; show(); return; }
      cur = cur.length > 1 ? cur.slice(0, -1) : '0';
      show();
    }

    function compute(a, b, o) {
      a = parseFloat(a); b = parseFloat(b);
      switch (o) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b === 0 ? 'Error' : a / b;
      }
      return b;
    }

    // Chain operands until = is pressed. The display keeps showing the
    // most recently typed number; the full expression is held in the chain
    // array (e.g. 33,+,43,+) and only collapsed on equals().
    function setOp(o) {
      // Append current operand + operator to the chain
      chain.push(cur);
      chain.push(o);
      op = o;
      prev = cur;
      justEvaled = true; // next digit replaces cur
      pending = true;    // hide cur from display until next operand starts
      show();
    }

    function equals() {
      if (chain.length === 0) {
        // Single number, no operator: just commit it (next digit replaces)
        justEvaled = true;
        return;
      }
      var fullChain = chain.concat([cur]);
      var expr = fullChain.join('');
      var r = safeEval(expr);
      var result;
      if (r === null || !isFinite(r)) result = 'Error';
      else result = String(r);
      cur = result; prev = null; op = null; chain = []; justEvaled = true; pending = false;
      addHistory(expr, cur);
      show();
    }

    document.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = b.getAttribute('data-num');
        var o = b.getAttribute('data-op');
        var a = b.getAttribute('data-act');
        var br = b.getAttribute('data-bracket');
        if (n !== null) inputNum(n);
        else if (br !== null) inputBracket(br);
        else if (o !== null) setOp(o);
        else if (a === 'eq') equals();
        else if (a === 'back') backspace();
        else if (a === 'clear') { cur = '0'; prev = null; op = null; chain = []; justEvaled = false; pending = false; show(); }
        else if (a === 'sign') { cur = String(parseFloat(cur) * -1); show(); }
        else if (a === 'pct')  { cur = String(parseFloat(cur) / 100); show(); }
      });
    });

    // Paste handler: number or expression from clipboard
    resultLine.addEventListener('paste', function (e) {
      e.preventDefault();
      var txt = (e.clipboardData || window.clipboardData).getData('text');
      applyPasted(txt);
    });

    // Pressing Enter inside the editable display evaluates its content
    resultLine.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyPasted(resultLine.textContent || '');
        resultLine.blur();
      }
    });

    // Re-evaluate when the user types directly into the display and tabs/clicks away
    resultLine.addEventListener('blur', function () {
      var raw = (resultLine.textContent || '').trim();
      if (raw && raw !== cur) applyPasted(raw);
    });

    // ---- Expression line is also editable ----
    function commitExprEdit() {
      var raw = (exprLine.textContent || '').replace(/=\\s*$/, '').trim();
      if (!raw) return;
      // Skip if the line already matches the latest history entry's "expr =" view
      // (i.e. user blurred without actually editing anything).
      var last = history[history.length - 1];
      if (last && last.expr === raw) return;
      applyPasted(raw);
    }
    exprLine.addEventListener('paste', function (e) {
      e.preventDefault();
      var txt = (e.clipboardData || window.clipboardData).getData('text');
      if (!txt) return;
      // Replace the line entirely and evaluate immediately — pasting a full
      // expression should not require a follow-up Enter/blur.
      applyPasted(txt);
      exprLine.blur();
    });
    exprLine.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitExprEdit();
        exprLine.blur();
      }
    });
    exprLine.addEventListener('blur', function () { commitExprEdit(); });

    // Global keyboard: skip when either line is focused so typing/editing works
    document.addEventListener('keydown', function (e) {
      if (document.activeElement === resultLine || document.activeElement === exprLine) return;
      if (/^[0-9]$/.test(e.key)) inputNum(e.key);
      else if (e.key === '.') inputNum('.');
      else if (e.key === '(' || e.key === ')') inputBracket(e.key);
      else if (e.key === '^') setOp('^');
      else if (['+','-','*','/'].indexOf(e.key) !== -1) setOp(e.key);
      else if (e.key === 'Backspace') backspace();
      else if (e.key === 'Enter' || e.key === '=') equals();
      else if (e.key === 'Escape') { cur = '0'; prev = null; op = null; chain = []; pending = false; show(); }
    });
  })();
</script>
</body>
</html>
\`\`\`
`
  }
];
