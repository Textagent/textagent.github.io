// ============================================
// templates/skills.js — Skills Templates
// Platform Skills content is lazy-loaded from platform-skill.md
// ============================================

// Lazy loader — fetches platform-skill.md only on first access, then caches
let _skillCache = null;
async function _loadSkillContent() {
  if (_skillCache !== null) return _skillCache;
  try {
    const resp = await fetch('platform-skill.md');
    _skillCache = resp.ok ? await resp.text() : '# TextAgent — Platform Skill Reference\n\n> Skills content could not be loaded.';
  } catch {
    _skillCache = '# TextAgent — Platform Skill Reference\n\n> Skills content could not be loaded.';
  }
  return _skillCache;
}

window.__MDV_TEMPLATES_SKILLS = [
  {
    name: 'Platform Skills Reference',
    category: 'skills',
    icon: 'bi-book',
    description: 'Complete reference of all TextAgent capabilities — feed this to any AI to generate rich templates',
    content: null,             // placeholder — filled lazily
    loadContent: _loadSkillContent
  }
];
