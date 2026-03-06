// ============================================
// templates.js — Template Picker Data + Modal Logic
// ============================================
(function (M) {
  'use strict';

  // Template data is split into category files under js/templates/
  // Each file sets window.__MDV_TEMPLATES_<CATEGORY> = [...]
  const MARKDOWN_TEMPLATES = [].concat(
    window.__MDV_TEMPLATES_DOCUMENTATION || [],
    window.__MDV_TEMPLATES_PROJECT || [],
    window.__MDV_TEMPLATES_TECHNICAL || [],
    window.__MDV_TEMPLATES_CREATIVE || [],
    window.__MDV_TEMPLATES_CODING || [],
    window.__MDV_TEMPLATES_MATHS || [],
    window.__MDV_TEMPLATES_PPT || [],
    window.__MDV_TEMPLATES_QUIZ || [],
    window.__MDV_TEMPLATES_TABLES || [],
    window.__MDV_TEMPLATES_AI || []
  );


  // --- Template Modal Logic ---
  const templateModal = document.getElementById('template-modal');
  const templateGrid = document.getElementById('template-grid');
  const templateSearchInput = document.getElementById('template-search-input');
  const templateCategories = document.getElementById('template-categories');
  const templateEmpty = document.getElementById('template-empty');
  const templateCloseBtn = document.getElementById('template-modal-close');
  const templateBtn = document.getElementById('template-btn');
  const mobileTemplateBtn = document.getElementById('mobile-template-btn');

  let activeTemplateCategory = 'all';

  function getCategoryIconClass(category) {
    switch (category) {
      case 'documentation': return 'doc';
      case 'project': return 'project';
      case 'technical': return 'technical';
      case 'creative': return 'creative';
      case 'coding': return 'technical';
      case 'maths': return 'doc';
      case 'ppt': return 'creative';
      case 'quiz': return 'project';
      case 'tables': return 'technical';
      case 'ai': return 'creative';
      default: return 'doc';
    }
  }

  function getCategoryIcon(category) {
    switch (category) {
      case 'documentation': return 'bi-book';
      case 'project': return 'bi-clipboard-check';
      case 'technical': return 'bi-cpu';
      case 'creative': return 'bi-brush';
      case 'coding': return 'bi-terminal';
      case 'maths': return 'bi-calculator';
      case 'ppt': return 'bi-easel';
      case 'quiz': return 'bi-patch-question';
      case 'tables': return 'bi-table';
      case 'ai': return 'bi-robot';
      default: return 'bi-file-earmark';
    }
  }

  function renderTemplateCards(templates) {
    templateGrid.innerHTML = '';
    if (templates.length === 0) {
      templateGrid.style.display = 'none';
      templateEmpty.style.display = 'flex';
      return;
    }
    templateGrid.style.display = 'grid';
    templateEmpty.style.display = 'none';

    templates.forEach((tpl, idx) => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.setAttribute('data-template-index', String(idx));
      card.setAttribute('title', 'Click to use this template');

      const preview = tpl.content.trim().split('\n').slice(0, 4).join('\n');

      card.innerHTML = `
      <div class="template-card-icon ${getCategoryIconClass(tpl.category)}">
        <i class="bi ${tpl.icon || getCategoryIcon(tpl.category)}"></i>
      </div>
      <div class="template-card-name">${tpl.name}</div>
      <div class="template-card-desc">${tpl.description}</div>
      <span class="template-card-tag ${tpl.category}">${tpl.category}</span>
      <div class="template-card-preview">${preview.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    `;

      templateGrid.appendChild(card);
    });
  }

  // Use event delegation on the grid for reliable click handling
  let _filteredTemplates = MARKDOWN_TEMPLATES;

  function filterTemplates() {
    const query = templateSearchInput.value.toLowerCase().trim();
    const category = activeTemplateCategory;

    _filteredTemplates = MARKDOWN_TEMPLATES.filter(tpl => {
      const matchCategory = category === 'all' || tpl.category === category;
      if (!matchCategory) return false;
      if (!query) return true;

      return tpl.name.toLowerCase().includes(query) ||
        tpl.description.toLowerCase().includes(query) ||
        tpl.category.toLowerCase().includes(query) ||
        tpl.content.toLowerCase().includes(query);
    });

    renderTemplateCards(_filteredTemplates);
  }

  // Event delegation: handle clicks on any template card
  if (templateGrid) {
    templateGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.template-card');
      if (!card) return;
      const idx = parseInt(card.getAttribute('data-template-index'), 10);
      if (isNaN(idx) || idx < 0 || idx >= _filteredTemplates.length) return;
      selectTemplate(_filteredTemplates[idx]);
    });
  }

  // ============================
  // Template Variable Engine
  // ============================

  /**
   * Built-in global variables — auto-resolved, no user input needed.
   */
  function resolveGlobalVariables(text) {
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const globals = {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      year: String(now.getFullYear()),
      month: months[now.getMonth()],
      day: days[now.getDay()],
      timestamp: now.toISOString(),
      uuid: crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now().toString(36)),
    };

    let result = text;
    for (const [key, val] of Object.entries(globals)) {
      result = result.replace(new RegExp('\\$\\(' + key + '\\)', 'g'), val);
    }
    return result;
  }

  /**
   * Generate a <!-- @variables --> markdown table from a template's variables array.
   */
  function generateVariableBlock(variables) {
    if (!variables || variables.length === 0) return '';

    let block = '<!-- @variables -->\n';
    block += '| Variable | Value | Description |\n';
    block += '|----------|-------|-------------|\n';
    for (const v of variables) {
      const name = v.name || '';
      const value = v.value || v.default || '';
      const desc = v.desc || v.description || '';
      block += `| ${name} | ${value} | ${desc} |\n`;
    }
    block += '<!-- @/variables -->\n\n';
    return block;
  }

  /**
   * Parse the @variables block from editor content and return { vars, contentWithoutBlock }.
   */
  function parseVariableBlock(text) {
    const regex = /<!--\s*@variables\s*-->\s*\n([\s\S]*?)<!--\s*@\/variables\s*-->\s*\n*/;
    const match = text.match(regex);
    if (!match) return { vars: {}, contentWithoutBlock: text, hasBlock: false };

    const tableText = match[1];
    const vars = {};

    // Parse markdown table rows (skip header + separator)
    const rows = tableText.trim().split('\n');
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row.startsWith('|')) continue;
      // Skip header and separator rows
      if (row.includes('Variable') && row.includes('Value')) continue;
      if (/^\|[\s-|]+\|$/.test(row)) continue;

      const cells = row.split('|').map(c => c.trim()).filter(c => c !== '');
      if (cells.length >= 2) {
        const varName = cells[0].trim();
        const varValue = cells[1].trim();
        if (varName && !varName.match(/^-+$/)) {
          vars[varName] = varValue;
        }
      }
    }

    const contentWithoutBlock = text.replace(regex, '');
    return { vars, contentWithoutBlock, hasBlock: true };
  }

  /**
   * Known global variable names — these are auto-resolved and should NOT
   * appear in the user-editable variable table.
   */
  const GLOBAL_VAR_NAMES = new Set(['date', 'time', 'year', 'month', 'day', 'timestamp', 'uuid']);

  /**
   * Scan text for all $(varName) patterns and return unique non-global variable names.
   */
  function scanForVariables(text) {
    const found = new Set();
    const re = /\$\(([a-zA-Z_]\w*)\)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const name = m[1];
      if (!GLOBAL_VAR_NAMES.has(name)) {
        found.add(name);
      }
    }
    return [...found];
  }

  /**
   * Apply template variables: parse the @variables block, replace all $(varName)
   * in the document, and remove the variable block.
   *
   * If NO block exists, auto-detect $(varName) patterns and generate the table
   * at the top so the user can fill in values, then click Vars again to apply.
   */
  function applyTemplateVariables() {
    const editor = M.markdownEditor;
    let text = editor.value;

    const { vars, contentWithoutBlock, hasBlock } = parseVariableBlock(text);

    if (!hasBlock) {
      // No variable block found — scan for $(varName) patterns
      const detected = scanForVariables(text);

      if (detected.length === 0) {
        // No variables at all — just resolve globals
        editor.value = resolveGlobalVariables(text);
        M.renderMarkdown();
        return false;
      }

      // Auto-generate the variable table at the top
      const autoVars = detected.map(name => ({ name, value: '', desc: '' }));
      const block = generateVariableBlock(autoVars);

      // Also resolve globals in the content (but keep $(localVars) as-is)
      editor.value = block + text;
      M.renderMarkdown();
      editor.scrollTop = 0;

      // Flash the button in a "waiting" state (amber pulse) so user knows to fill in values
      const btn = document.getElementById('apply-vars-btn');
      if (btn) {
        btn.classList.add('apply-vars-waiting');
        setTimeout(() => btn.classList.remove('apply-vars-waiting'), 3000);
      }
      return 'generated';
    }

    // Resolve local variables from the table
    let result = contentWithoutBlock;
    for (const [key, val] of Object.entries(vars)) {
      result = result.replace(new RegExp('\\$\\(' + key + '\\)', 'g'), val);
    }

    // Also resolve global built-ins
    result = resolveGlobalVariables(result);

    editor.value = result;
    M.renderMarkdown();
    editor.scrollTop = 0;
    return true;
  }

  function selectTemplate(tpl) {
    let content = tpl.content;

    // If the template defines variables, generate the block at the top
    if (tpl.variables && tpl.variables.length > 0) {
      content = generateVariableBlock(tpl.variables) + content;
    }

    // Resolve global built-in variables (date, time, etc.)
    content = resolveGlobalVariables(content);

    M.markdownEditor.value = content;
    M.renderMarkdown();
    closeTemplateModal();

    // Scroll editor to top
    M.markdownEditor.scrollTop = 0;
  }

  function openTemplateModal() {
    templateSearchInput.value = '';
    activeTemplateCategory = 'all';

    // Reset category buttons
    templateCategories.querySelectorAll('.template-cat-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === 'all');
    });

    renderTemplateCards(MARKDOWN_TEMPLATES);
    templateModal.style.display = 'flex';
    setTimeout(() => templateSearchInput.focus(), 100);
  }

  function closeTemplateModal() {
    templateModal.style.display = 'none';
  }

  // Wire up open/close
  if (templateBtn) {
    templateBtn.addEventListener('click', openTemplateModal);
  }
  if (mobileTemplateBtn) {
    mobileTemplateBtn.addEventListener('click', () => {
      M.closeMobileMenu();
      openTemplateModal();
    });
  }
  if (templateCloseBtn) {
    templateCloseBtn.addEventListener('click', closeTemplateModal);
  }

  // Close on overlay click
  if (templateModal) {
    templateModal.addEventListener('click', (e) => {
      if (e.target === templateModal) closeTemplateModal();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && templateModal && templateModal.style.display !== 'none') {
      closeTemplateModal();
    }
  });

  // Search input
  if (templateSearchInput) {
    templateSearchInput.addEventListener('input', filterTemplates);
  }

  // Category tabs
  if (templateCategories) {
    templateCategories.addEventListener('click', (e) => {
      const btn = e.target.closest('.template-cat-btn');
      if (!btn) return;

      activeTemplateCategory = btn.dataset.category;
      templateCategories.querySelectorAll('.template-cat-btn').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
      filterTemplates();
    });
  }

  // Wire up Apply Variables button
  const applyVarsBtn = document.getElementById('apply-vars-btn');
  if (applyVarsBtn) {
    applyVarsBtn.addEventListener('click', () => {
      const applied = applyTemplateVariables();
      if (applied) {
        applyVarsBtn.classList.add('apply-vars-success');
        setTimeout(() => applyVarsBtn.classList.remove('apply-vars-success'), 1500);
      }
    });
  }

  // Expose for other modules
  M.openTemplateModal = openTemplateModal;
  M.closeTemplateModal = closeTemplateModal;
  M.applyTemplateVariables = applyTemplateVariables;
  M.getDefaultContent = function () { return MARKDOWN_TEMPLATES[0].content; };

})(window.MDView);
