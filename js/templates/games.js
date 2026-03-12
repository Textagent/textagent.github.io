// ============================================
// templates/games.js — Game Builder Templates
// ============================================
window.__MDV_TEMPLATES_GAMES = [
  {
    name: 'Games for Kids',
    category: 'games',
    icon: 'bi-controller',
    description: 'Pre-built games collection — Maths Quiz, Chess, Snake, Shooter, Pong, Breakout',
    content: `# 🎮 Games Collection

> All games below are **pre-built** and play instantly using the \\\`@prebuilt:\\\` field in the \\\`{{@Game:}}\\\` tag. You can also write your own \\\`@prompt:\\\` and click **▶ Generate** to create custom games with AI, or click **📋 Import** to paste your own HTML code.

---

## 🧠 Maths Quiz

\\\`\\\`\\\`
{{@Game: @engine: canvas2d @prebuilt: maths @prompt: Maths quiz for children}}
\\\`\\\`\\\`

{{@Game: @engine: canvas2d @prebuilt: maths @prompt: Maths quiz for children}}

---

## ♟ Chess

\\\`\\\`\\\`
{{@Game: @engine: canvas2d @prebuilt: chess @prompt: Chess game}}
\\\`\\\`\\\`

{{@Game: @engine: canvas2d @prebuilt: chess @prompt: Chess game}}

---

## 🐍 Snake

\\\`\\\`\\\`
{{@Game: @engine: canvas2d @prebuilt: snake @prompt: Snake game}}
\\\`\\\`\\\`

{{@Game: @engine: canvas2d @prebuilt: snake @prompt: Snake game}}

---

## 🚀 Space Shooter

\\\`\\\`\\\`
{{@Game: @engine: canvas2d @prebuilt: shooter @prompt: Space shooter}}
\\\`\\\`\\\`

{{@Game: @engine: canvas2d @prebuilt: shooter @prompt: Space shooter}}

---

## 🏓 Pong

\\\`\\\`\\\`
{{@Game: @engine: canvas2d @prebuilt: pong @prompt: Pong game}}
\\\`\\\`\\\`

{{@Game: @engine: canvas2d @prebuilt: pong @prompt: Pong game}}

---

## 🧱 Breakout

\\\`\\\`\\\`
{{@Game: @engine: canvas2d @prebuilt: breakout @prompt: Breakout game}}
\\\`\\\`\\\`

{{@Game: @engine: canvas2d @prebuilt: breakout @prompt: Breakout game}}

---

## 🛠 How to create your own

**Pre-built game** (instant):
\\\`\\\`\\\`
{{@Game: @engine: canvas2d @prebuilt: chess}}
\\\`\\\`\\\`

**AI-generated game** (click Generate):
\\\`\\\`\\\`
{{@Game: @engine: canvas2d @prompt: Build a maze game with arrow key controls}}
\\\`\\\`\\\`

**Multi-line tag** with all fields:
\\\`\\\`\\\`
{{@Game:
  @engine: threejs
  @model: gemini-flash
  @prompt: Build a 3D racing game with obstacles
}}
\\\`\\\`\\\`

| Field | Required | Description |
|-------|----------|-------------|
| \\\`@engine:\\\` | No | \\\`canvas2d\\\`, \\\`threejs\\\`, or \\\`p5js\\\` (default: threejs) |
| \\\`@prebuilt:\\\` | No | Pre-built game: \\\`chess\\\`, \\\`snake\\\`, \\\`shooter\\\`, \\\`pong\\\`, \\\`breakout\\\`, \\\`maths\\\` |
| \\\`@model:\\\` | No | AI model to use for generation |
| \\\`@prompt:\\\` | No | Game description for AI generation |
`
  }
];
