// ============================================
// templates/skills.js — Skills Templates
// Platform Skills content is fetched from platform-skill.md
// ============================================

// Fetch content synchronously before templates.js reads it
const _resp = await fetch('platform-skill.md').catch(() => null);
const _skillContent = (_resp && _resp.ok) ? await _resp.text() : '# TextAgent — Platform Skill Reference\n\n> Skills content could not be loaded.';

window.__MDV_TEMPLATES_SKILLS = [
  {
    name: 'Platform Skills Reference',
    category: 'skills',
    icon: 'bi-book',
    description: 'Complete reference of all TextAgent capabilities — feed this to any AI to generate rich templates',
    content: _skillContent
  }
];
