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

{{@Game: @engine: canvas2d @prebuilt: maths @prompt: Maths quiz for children}}

---

## ♟ Chess

{{@Game: @engine: canvas2d @prebuilt: chess @prompt: Chess game}}

---

## 🐍 Snake

{{@Game: @engine: canvas2d @prebuilt: snake @prompt: Snake game}}

---

## 🚀 Space Shooter

{{@Game: @engine: canvas2d @prebuilt: shooter @prompt: Space shooter}}

---

## 🏓 Pong

{{@Game: @engine: canvas2d @prebuilt: pong @prompt: Pong game}}

---

## 🧱 Breakout

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
  },
  // ─── Canvas 2D Games ───
  {
    name: 'Canvas 2D — Arcade Classics',
    category: 'games',
    icon: 'bi-joystick',
    description: 'AI-generated arcade games using HTML5 Canvas 2D — platformer, top-down shooter, rhythm, puzzle, tower defense',
    content: `# 🕹️ Canvas 2D — Arcade Classics

> Click **▶ Generate** on any card below to have AI build the game for you. Edit the prompt to customize!

---

## 🏃 Platformer

{{@Game:
  @engine: canvas2d
  @prompt: Build a side-scrolling platformer game. The player is a small character that can run left/right with arrow keys and jump with space bar. Generate procedural platforms at different heights. Add coins to collect, spikes to avoid, and a score counter. Use pixel-art style graphics with a gradient sky background. Add smooth camera scrolling that follows the player. Include 3 lives, particle effects when collecting coins, and a game over screen with restart option.
}}

---

## 🔫 Top-Down Shooter

{{@Game:
  @engine: canvas2d
  @prompt: Build a top-down twin-stick shooter game. Player moves with WASD keys and aims/shoots with mouse clicks. Enemies spawn from all edges of the screen in waves, each wave getting harder. Include 3 enemy types: slow tanks (red), fast runners (yellow), and ranged shooters (purple). Add power-ups that drop randomly: rapid fire, shield, and speed boost. Show wave number, score, and health bar. Use neon colors on a dark background with glow effects and particle explosions.
}}

---

## 🎵 Rhythm Tapper

{{@Game:
  @engine: canvas2d
  @prompt: Build a rhythm tapping game like Guitar Hero. Four colored lanes (D, F, J, K keys) with notes falling from top to bottom. Generate random note patterns that sync to a procedural beat. Show a hit zone at the bottom. Score: Perfect, Great, Miss with visual feedback. Include a combo counter that multiplies score, a progress bar, and flashy visual effects for perfect hits. Use vibrant neon colors on black background with pulse animations.
}}

---

## 🧩 Tile Match Puzzle

{{@Game:
  @engine: canvas2d
  @prompt: Build a tile matching puzzle game like Bejeweled or Candy Crush. Create an 8x8 grid with 5 different colored gem types (use emoji or simple shapes). Click to select a gem, then click an adjacent gem to swap. Match 3 or more in a row/column to score points. Matched gems disappear with animation, gems above fall down, new gems generate from the top. Add score counter, combo detection for chain reactions, and smooth swap/fall animations.
}}

---

## 🏰 Tower Defense

{{@Game:
  @engine: canvas2d
  @prompt: Build a tower defense game. Enemies follow a winding path from left to right. The player clicks to place towers adjacent to the path. Include 3 tower types: basic shooter (cheap, fast), cannon (expensive, splash damage), slow tower (slows enemies). Enemies come in waves with increasing health. Earn gold from kills, pay gold for towers. Show wave number, gold, and lives. When an enemy reaches the end, lose a life. Use clean, colorful graphics with projectile animations.
}}
`
  },
  // ─── Three.js 3D Games ───
  {
    name: 'Three.js — 3D Games',
    category: 'games',
    icon: 'bi-box',
    description: 'AI-generated 3D games using Three.js — racing, flying, FPS, dungeon crawler, planet explorer',
    content: `# 🎮 Three.js — 3D Games

> These games use **Three.js** for stunning 3D visuals. Click **▶ Generate** and wait for AI to build the full game.

---

## 🏎️ Endless Road Racer

{{@Game:
  @engine: threejs
  @prompt: Build a 3D endless road racing game. The camera is behind the car in third-person view. The car moves left/right with arrow keys to dodge obstacles on a straight road. The road has 3 lanes. Random obstacles (boxes, barriers) spawn ahead. Speed increases gradually over time. Include a speedometer HUD, distance traveled counter, and score. Add simple car model using box geometries with headlights (point lights). Road has lane markings, and there are trees/poles on the sides. Smooth ambient lighting with fog. Game over on collision with restart button.
}}

---

## ✈️ Sky Flyer

{{@Game:
  @engine: threejs
  @prompt: Build a 3D airplane flying game. The player controls a simple airplane (made of box/cylinder geometries) that flies forward automatically. Use arrow keys to steer up/down/left/right. Generate random floating rings to fly through for points. Add clouds (white spheres) as scenery. Include a score counter for rings collected, altitude meter, and speed indicator. Use a blue sky gradient background with directional sunlight. Add subtle camera shake and barrel roll animation when pressing Space. The plane should bank when turning.
}}

---

## 🔫 First-Person Maze

{{@Game:
  @engine: threejs
  @prompt: Build a 3D first-person maze exploration game. Generate a random maze using a grid-based algorithm (10x10). Player moves with WASD and looks around with mouse (pointer lock). The maze has textured walls (use repeating patterns or solid colors with slight variation). Place 5 collectible glowing orbs randomly in the maze. Add a minimap in the corner showing player position and visited areas. When all orbs are collected, show a victory screen with time taken. Use point lights near the player for a torch-like atmosphere, with ambient darkness.
}}

---

## 🏰 Dungeon Crawler

{{@Game:
  @engine: threejs
  @prompt: Build a 3D dungeon crawler with isometric-style camera (looking down at 45 degrees). WASD to move the player character (a simple humanoid shape). Generate rooms connected by corridors. Place enemies (red cubes that patrol) and treasure chests (gold boxes). Player attacks nearby enemies by pressing Space with a simple swing animation. Include health bar, gold counter, and a minimap. Use dark atmospheric lighting with torches (orange point lights) on dungeon walls. Rooms have different sizes and random layouts.
}}

---

## 🌍 Planet Explorer

{{@Game:
  @engine: threejs
  @prompt: Build a 3D planet exploration game. Render a small planet as a sphere with a terrain-like surface. The player character walks on the planet surface and gravity always pulls toward the planet center. Arrow keys to walk, Space to jump. Place collectible crystals (glowing geometric shapes) around the planet surface. Add a day/night cycle by rotating a directional light. Include a starfield background, atmosphere glow effect around the planet, and score counter for crystals collected. Camera orbits behind the player.
}}
`
  },
  // ─── P5.js Creative Games ───
  {
    name: 'P5.js — Creative & Art Games',
    category: 'games',
    icon: 'bi-palette',
    description: 'AI-generated creative games using P5.js — generative art, particle sandbox, flocking, music visualizer, gravity sim',
    content: `# 🎨 P5.js — Creative & Art Games

> P5.js excels at **creative coding**, generative art, and interactive visual experiences. Click **▶ Generate** to create!

---

## 🌊 Particle Sandbox

{{@Game:
  @engine: p5js
  @prompt: Build an interactive particle sandbox. Click and drag to create streams of particles. Particles should have gravity, bounce off the edges of the screen, and gradually fade out. Right-click to switch between particle types: fire (red/orange, floats up), water (blue, falls down), sparks (yellow, explodes outward). Include a particle count display. Use HSB color mode for smooth color transitions. Add trails using a semi-transparent background clear. Make it feel satisfying and fluid with hundreds of particles.
}}

---

## 🐦 Flocking Simulation

{{@Game:
  @engine: p5js
  @prompt: Build a flocking simulation (Boids algorithm). Start with 150 triangle-shaped birds that follow 3 rules: separation (avoid crowding), alignment (steer toward average heading), and cohesion (steer toward average position). Click to add a flock attractor point, right-click to add a predator (red dot that boids flee from). Add sliders for separation, alignment, and cohesion weights. Each boid leaves a short trail. Use a dark background with colorful boids that change hue based on their speed.
}}

---

## 🎵 Music Visualizer

{{@Game:
  @engine: p5js
  @prompt: Build an interactive music visualizer. Since no audio input is available, generate procedural rhythm data using sine waves at different frequencies to simulate beats. Visualize with: a circular waveform display in the center, radiating bars around it that pulse with the simulated beat, background particles that react to bass frequencies. Use HSB color palette that slowly cycles through the spectrum. Click to change visualization mode between: circular bars, waveform spiral, and particle explosion. Make it beautiful and hypnotic.
}}

---

## 🌀 Generative Art Canvas

{{@Game:
  @engine: p5js
  @prompt: Build a generative art tool. The canvas creates mesmerizing patterns using flow fields. Use Perlin noise to create a vector field that guides particles across the screen. Start with 1000 particles at random positions. Each particle follows the flow field and draws a line as it moves, using HSB colors based on its angle. Click anywhere to reset with a new random noise seed. Press 1-5 to switch between styles: flow field lines, spiraling circles, branching trees, maze-like paths, and constellation dots. Include a save button that downloads the canvas as PNG.
}}

---

## 🪐 Gravity Playground

{{@Game:
  @engine: p5js
  @prompt: Build a gravity simulation playground. Click to place massive bodies (planets/stars) with random sizes. Bodies attract each other with realistic gravitational force (F = G*m1*m2/r²). Right-click to launch small projectile particles with velocity based on drag direction and distance. Objects leave orbital trails that slowly fade. Include a mass slider for new objects, a toggle for showing force vectors, and a speed multiplier. Use a dark space background with glowing objects. Pressing R resets the simulation. Make planetary orbits and slingshot effects possible.
}}
`
  }
];
