// ============================================
// llm-memory.js — LLM Memory Converter Modal
// ============================================
(function (M) {
  'use strict';

// ==============================================
// LLM MEMORY CONVERTER
// ==============================================

const MEMORY_TEMPLATES = {
standard: {
  name: "Standard Memory",
  prefix: "<context>\n<memory_document>\n",
  suffix: "\n</memory_document>\n</context>",
  sectionWrap: (title, content) => `<section name="${title}">\n${content}\n</section>`,
},
system: {
  name: "System Prompt Block",
  prefix: "<user_context>\nThe following is structured memory about the user and their projects:\n\n",
  suffix: "\n</user_context>",
  sectionWrap: (title, content) => `## ${title}\n${content}\n`,
},
openai: {
  name: "OpenAI Custom Instructions",
  prefix: "# About Me & My Projects\n\n",
  suffix: "",
  sectionWrap: (title, content) => `## ${title}\n${content}\n`,
},
raw: {
  name: "Raw Structured",
  prefix: "---BEGIN CONTEXT---\n",
  suffix: "\n---END CONTEXT---",
  sectionWrap: (title, content) => `[${title.toUpperCase()}]\n${content}\n`,
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
let output = t.prefix;

if (meta.title || meta.author || meta.tags) {
  let metaBlock = "<metadata>\n";
  if (meta.title) metaBlock += `  title: ${meta.title}\n`;
  if (meta.author) metaBlock += `  author: ${meta.author}\n`;
  if (meta.tags) metaBlock += `  tags: ${meta.tags}\n`;
  metaBlock += `  generated: ${new Date().toISOString().split("T")[0]}\n`;
  metaBlock += `  format: llm-memory-v1\n`;
  metaBlock += "</metadata>\n\n";
  output += metaBlock;
}

if (meta.summary) {
  output += `<summary>\n${meta.summary}\n</summary>\n\n`;
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

let memoryTemplate = 'standard';
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
return generateMemoryOutput(markdownEditor.value, memoryTemplate, getMemoryMeta());
}

function updateMemoryStats() {
const md = markdownEditor.value;
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
  const compressed = compressData(output);
  const key = await generateEncryptionKey();
  const encrypted = await encryptData(key, compressed);
  const dataString = uint8ArrayToBase64Url(encrypted);
  const keyString = await keyToBase64Url(key);

  let shareUrl;
  try {
    const docRef = await db.collection('shares').add({
      d: dataString,
      t: Date.now()
    });
    shareUrl = `${SHARE_BASE_URL}#id=${docRef.id}&k=${keyString}`;
  } catch (fbError) {
    console.warn('Firebase unavailable, using URL fallback:', fbError);
    shareUrl = `${SHARE_BASE_URL}#d=${dataString}&k=${keyString}`;
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
    get: function() { return memoryModalOpen; },
    set: function(v) { memoryModalOpen = v; }
  });
  M.openMemoryModal = openMemoryModal;
  M.closeMemoryModal = closeMemoryModal;

})(window.MDView);
