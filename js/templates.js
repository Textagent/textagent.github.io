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

  function selectTemplate(tpl) {
    // Replace $(date) placeholders with current date
    const today = new Date().toISOString().split('T')[0];
    const content = tpl.content.replace(/\$\(date\)/g, today);

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


  // Expose for other modules
  M.openTemplateModal = openTemplateModal;
  M.closeTemplateModal = closeTemplateModal;
  M.getDefaultContent = function () { return MARKDOWN_TEMPLATES[0].content; };

})(window.MDView);
