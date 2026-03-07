// ============================================
// llm-memory.js — LLM Memory Converter Modal
// ============================================
(function (M) {
  'use strict';

  // ==============================================
  // LLM MEMORY CONVERTER
  // ==============================================

  const MEMORY_TEMPLATES = {
    xml: {
      name: "XML",
      desc: "Structured XML tags — ideal for Claude, system prompts",
      type: "text",
      prefix: "<context>\n",
      suffix: "\n</context>",
      metaWrap: (meta) => {
        let s = "<metadata>\n";
        if (meta.title) s += `  <title>${meta.title}</title>\n`;
        if (meta.author) s += `  <author>${meta.author}</author>\n`;
        if (meta.tags) s += `  <tags>${meta.tags}</tags>\n`;
        s += `  <generated>${new Date().toISOString().split("T")[0]}</generated>\n`;
        s += "</metadata>\n";
        return s;
      },
      summaryWrap: (summary) => `<summary>${summary}</summary>\n`,
      sectionWrap: (title, content) => `<section name="${title}">\n${content}\n</section>`,
    },
    json: {
      name: "JSON",
      desc: "Structured JSON — easy to parse and inject via API",
      type: "json",
    },
    compact: {
      name: "Compact JSON",
      desc: "Minified JSON — saves tokens for large contexts",
      type: "compact",
    },
    markdown: {
      name: "Markdown",
      desc: "Clean markdown — universal, works with any LLM",
      type: "text",
      prefix: "",
      suffix: "",
      metaWrap: (meta) => {
        let s = "---\n";
        if (meta.title) s += `title: ${meta.title}\n`;
        if (meta.author) s += `author: ${meta.author}\n`;
        if (meta.tags) s += `tags: ${meta.tags}\n`;
        s += `generated: ${new Date().toISOString().split("T")[0]}\n`;
        s += "---\n\n";
        return s;
      },
      summaryWrap: (summary) => `> ${summary}\n\n`,
      sectionWrap: (title, content) => `## ${title}\n${content}`,
    },
    plaintext: {
      name: "Plain Text",
      desc: "No formatting — simple, readable text",
      type: "text",
      prefix: "",
      suffix: "",
      metaWrap: (meta) => {
        let parts = [];
        if (meta.title) parts.push(`Title: ${meta.title}`);
        if (meta.author) parts.push(`Author: ${meta.author}`);
        if (meta.tags) parts.push(`Tags: ${meta.tags}`);
        parts.push(`Generated: ${new Date().toISOString().split("T")[0]}`);
        return parts.join(" | ") + "\n\n";
      },
      summaryWrap: (summary) => `Summary: ${summary}\n\n`,
      sectionWrap: (title, content) => `${title.toUpperCase()}\n${'-'.repeat(title.length)}\n${content}`,
    },
  };

  function parseMarkdownToSections(md) {
    const lines = md.split("\n");
    const sections = [];
    let currentSection = null;
    let currentContent = [];
    for (const line of lines) {
      const h1 = line.match(/^#\s+(.+)/);
      const h2 = line.match(/^##\s+(.+)/);
      if (h1 || h2) {
        if (currentSection) {
          sections.push({ title: currentSection, content: currentContent.join("\n").trim() });
        }
        currentSection = (h1 || h2)[1];
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    if (currentSection) {
      sections.push({ title: currentSection, content: currentContent.join("\n").trim() });
    }
    return sections;
  }

  function generateMemoryOutput(md, templateKey, meta) {
    const t = MEMORY_TEMPLATES[templateKey];
    const sections = parseMarkdownToSections(md);

    // --- JSON formats ---
    if (t.type === "json" || t.type === "compact") {
      const obj = {};
      if (meta.title || meta.author || meta.tags) {
        obj.metadata = {};
        if (meta.title) obj.metadata.title = meta.title;
        if (meta.author) obj.metadata.author = meta.author;
        if (meta.tags) obj.metadata.tags = meta.tags;
        obj.metadata.generated = new Date().toISOString().split("T")[0];
      }
      if (meta.summary) obj.summary = meta.summary;
      obj.sections = sections.filter(s => s.content).map(s => ({
        title: s.title,
        content: s.content
      }));
      if (t.type === "compact") {
        // Abbreviated keys, minified
        const c = {};
        if (obj.metadata) {
          c.m = {};
          if (obj.metadata.title) c.m.t = obj.metadata.title;
          if (obj.metadata.author) c.m.a = obj.metadata.author;
          if (obj.metadata.tags) c.m.g = obj.metadata.tags;
          c.m.d = obj.metadata.generated;
        }
        if (obj.summary) c.s = obj.summary;
        c.c = obj.sections.map(s => [s.title, s.content]);
        return JSON.stringify(c);
      }
      return JSON.stringify(obj, null, 2);
    }

    // --- Text formats (XML, Markdown, Plain Text) ---
    let output = t.prefix;

    if (meta.title || meta.author || meta.tags) {
      output += t.metaWrap(meta);
    }

    if (meta.summary) {
      output += t.summaryWrap(meta.summary);
    }

    for (const sec of sections) {
      if (sec.content) {
        output += t.sectionWrap(sec.title, sec.content) + "\n";
      }
    }

    output += t.suffix;
    return output.trim();
  }

  // --- Memory Modal UI ---
  const memoryModal = document.getElementById('memory-modal');
  const memoryCloseBtn = document.getElementById('memory-modal-close');
  const memoryOutputPre = document.getElementById('memory-output-pre');
  const memoryOutputLabel = document.getElementById('memory-output-label');
  const memoryCopyOutputBtn = document.getElementById('memory-copy-output');
  const memoryCopyBlockBtn = document.getElementById('memory-copy-block');
  const memoryDownloadMd = document.getElementById('memory-download-md');
  const memoryDownloadTxt = document.getElementById('memory-download-txt');
  const memoryGenLink = document.getElementById('memory-gen-link');
  const memoryShareResult = document.getElementById('memory-share-result');
  const memoryToggleApi = document.getElementById('memory-toggle-api');
  const memoryApiExample = document.getElementById('memory-api-example');

  let memoryTemplate = 'xml';
  let memoryModalOpen = false;

  function getMemoryMeta() {
    return {
      title: document.getElementById('memory-meta-title').value.trim(),
      author: document.getElementById('memory-meta-author').value.trim(),
      tags: document.getElementById('memory-meta-tags').value.trim(),
      summary: document.getElementById('memory-meta-summary').value.trim(),
    };
  }

  function getCurrentMemoryOutput() {
    return generateMemoryOutput(M.markdownEditor.value, memoryTemplate, getMemoryMeta());
  }

  function updateMemoryStats() {
    const md = M.markdownEditor.value;
    const output = getCurrentMemoryOutput();
    const wordCount = md.split(/\s+/).filter(Boolean).length;
    const tokenEstimate = Math.round(output.split(/\s+/).filter(Boolean).length * 1.3);
    const sectionCount = parseMarkdownToSections(md).length;

    document.getElementById('memory-word-count').textContent = wordCount + ' words';
    document.getElementById('memory-token-count').textContent = '~' + tokenEstimate + ' tokens';
    document.getElementById('memory-section-count').textContent = sectionCount + ' sections';

    const sizeLabel = document.getElementById('memory-size-label');
    if (tokenEstimate < 2000) {
      sizeLabel.textContent = 'compact';
      sizeLabel.className = 'memory-size-compact';
    } else if (tokenEstimate < 8000) {
      sizeLabel.textContent = 'medium';
      sizeLabel.className = 'memory-size-medium';
    } else {
      sizeLabel.textContent = 'large';
      sizeLabel.className = 'memory-size-large';
    }
  }

  function refreshMemoryOutput() {
    const output = getCurrentMemoryOutput();
    memoryOutputPre.textContent = output;
    memoryOutputLabel.textContent = 'Generated Memory · ' + MEMORY_TEMPLATES[memoryTemplate].name;
    updateMemoryStats();
  }

  function openMemoryModal() {
    memoryModal.style.display = 'flex';
    memoryModalOpen = true;
    refreshMemoryOutput();
  }

  function closeMemoryModal() {
    memoryModal.style.display = 'none';
    memoryModalOpen = false;
  }

  // Open from export dropdown
  const exportLlmBtn = document.getElementById('export-llm-memory');
  if (exportLlmBtn) {
    exportLlmBtn.addEventListener('click', openMemoryModal);
  }
  const mobileExportLlm = document.getElementById('mobile-export-llm-memory');
  if (mobileExportLlm) {
    mobileExportLlm.addEventListener('click', () => {
      // Close mobile menu
      const mobilePanel = document.getElementById('mobile-menu-panel');
      const mobileOverlay = document.getElementById('mobile-menu-overlay');
      if (mobilePanel) mobilePanel.classList.remove('show');
      if (mobileOverlay) mobileOverlay.classList.remove('show');
      openMemoryModal();
    });
  }

  // Close
  memoryCloseBtn.addEventListener('click', closeMemoryModal);
  memoryModal.addEventListener('click', (e) => {
    if (e.target === memoryModal) closeMemoryModal();
  });

  // Tabs
  document.querySelectorAll('.memory-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.memory-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.memory-tab-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const tabId = 'memory-tab-' + this.dataset.tab;
      document.getElementById(tabId).classList.add('active');

      if (this.dataset.tab === 'output' || this.dataset.tab === 'share') {
        refreshMemoryOutput();
      }
    });
  });

  // Template selection
  document.querySelectorAll('.memory-template-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.memory-template-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      memoryTemplate = this.dataset.template;
      refreshMemoryOutput();
    });
  });

  // Metadata fields → live refresh
  ['memory-meta-title', 'memory-meta-author', 'memory-meta-tags', 'memory-meta-summary'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', refreshMemoryOutput);
  });

  // Copy helpers
  function memoryCopyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const origHtml = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = origHtml;
      }, 2000);
    }).catch(() => { });
  }

  memoryCopyOutputBtn.addEventListener('click', () => {
    memoryCopyText(getCurrentMemoryOutput(), memoryCopyOutputBtn);
  });

  memoryCopyBlockBtn.addEventListener('click', () => {
    memoryCopyText(getCurrentMemoryOutput(), memoryCopyBlockBtn);
  });

  // Download
  function memoryDownload(ext) {
    const output = getCurrentMemoryOutput();
    const meta = getMemoryMeta();
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memory-${meta.title || "context"}-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  memoryDownloadMd.addEventListener('click', () => memoryDownload('md'));
  memoryDownloadTxt.addEventListener('click', () => memoryDownload('txt'));

  // Generate shareable link (uses existing Firebase + encryption infra)
  memoryGenLink.addEventListener('click', async () => {
    const output = getCurrentMemoryOutput();
    if (!output.trim()) {
      memoryShareResult.style.display = 'block';
      memoryShareResult.className = 'error';
      memoryShareResult.innerHTML = 'Nothing to share — editor is empty.';
      return;
    }

    // Show loading state
    memoryGenLink.disabled = true;
    memoryGenLink.textContent = 'Generating...';

    try {
      // Compress → Encrypt → Upload to Firebase (same flow as main share)
      const compressed = M.compressData(output);
      const key = await M.generateEncryptionKey();
      const encrypted = await M.encryptData(key, compressed);
      const dataString = M.uint8ArrayToBase64Url(encrypted);
      const keyString = await M.keyToBase64Url(key);

      let shareUrl;
      try {
        const docRef = await M.db.collection('shares').add({
          d: dataString,
          t: Date.now()
        });
        shareUrl = `${M.SHARE_BASE_URL}#id=${docRef.id}&k=${keyString}`;
      } catch (fbError) {
        console.warn('Firebase unavailable, using URL fallback:', fbError);
        shareUrl = `${M.SHARE_BASE_URL}#d=${dataString}&k=${keyString}`;
        if (shareUrl.length > 65000) {
          throw new Error('Content too large to share via URL. Use download or copy.');
        }
      }

      memoryShareResult.style.display = 'flex';
      memoryShareResult.className = 'success';
      memoryShareResult.innerHTML = `<input readonly value="${shareUrl}"><button class="memory-action-btn" id="memory-copy-link"><i class="bi bi-clipboard"></i> Copy</button>`;
      document.getElementById('memory-copy-link').addEventListener('click', function () {
        memoryCopyText(shareUrl, this);
      });
    } catch (err) {
      memoryShareResult.style.display = 'block';
      memoryShareResult.className = 'error';
      memoryShareResult.innerHTML = 'Failed to generate link: ' + err.message;
    } finally {
      memoryGenLink.disabled = false;
      memoryGenLink.textContent = 'Generate Link';
    }
  });

  // API example toggle
  memoryToggleApi.addEventListener('click', () => {
    const showing = memoryApiExample.style.display !== 'none';
    memoryApiExample.style.display = showing ? 'none' : 'block';
    memoryToggleApi.textContent = showing ? 'Show Code' : 'Hide Code';
  });

  // Expose for other modules
  M.memoryModalOpen = false;
  Object.defineProperty(M, "memoryModalOpen", {
    get: function () { return memoryModalOpen; },
    set: function (v) { memoryModalOpen = v; }
  });
  M.openMemoryModal = openMemoryModal;
  M.closeMemoryModal = closeMemoryModal;

})(window.MDView);
