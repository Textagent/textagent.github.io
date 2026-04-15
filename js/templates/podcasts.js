// ============================================
// templates/podcasts.js — Podcast Templates
// Pre-built podcast scripts users can insert
// into the editor and convert to audio via TTS.
// ============================================
window.__MDV_TEMPLATES_PODCASTS = [
  {
    name: 'Podcast Collection — Tech & AI',
    category: 'podcasts',
    icon: 'bi-mic-fill',
    description: 'Ready-to-play podcast scripts on WebAssembly, Edge Computing, AI Agents, Local LLMs, and Multimodal AI',
    content: `# 🎙️ Podcast Collection — Tech & AI

> Click **🔊 TTS** on any section to hear it spoken aloud, or open the **Podcast Marketplace** (Tools → Podcasts) to browse and play all episodes with the full audio player.

---

## ⚡ WebAssembly: The Future of the Browser

**Host:** Sarah Chen · **Duration:** ~8 min

Welcome to Tech Forward. I'm Sarah Chen, and today we're exploring WebAssembly — the technology quietly revolutionizing what's possible in your browser.

WebAssembly, or WASM, is a binary instruction format designed as a portable compilation target. Think of it as a virtual processor that runs inside your browser at near-native speed.

Unlike JavaScript, which is interpreted and optimized at runtime, WebAssembly code arrives pre-compiled. The browser simply validates and executes it. This means compute-heavy tasks like video editing, 3D rendering, and machine learning can now run client-side without plugins.

Major applications are already leveraging this. Figma runs its entire design engine in WASM. Google Earth renders 3D terrain in real-time. AutoCAD brought their entire desktop application to the web.

The key breakthrough is the component model — a way for WASM modules to communicate across language boundaries. You can write a physics engine in Rust, a UI layer in TypeScript, and glue them together seamlessly.

Looking ahead, WASM is expanding beyond browsers. WASI — the WebAssembly System Interface — enables WASM to run on servers, edge functions, and even embedded devices. It's becoming a truly universal runtime.

That's all for today. Follow us for more deep dives into the technologies shaping our digital future.

---

## 🤖 AI Agents: From Chatbots to Digital Coworkers

**Host:** Dr. Anika Patel · **Duration:** ~9 min

Hello and welcome to AI Horizons. I'm Dr. Anika Patel, and today we're charting the evolution from simple chatbots to fully autonomous AI agents.

The chatbot era gave us pattern matching and scripted responses. You asked a question, it matched keywords, and returned a pre-written answer. Useful, but limited.

Then came large language models. Suddenly, AI could generate coherent, contextual responses to virtually any prompt. But they were still reactive — you push, they respond.

AI agents represent the next leap. An agent doesn't just respond — it reasons about goals, creates plans, uses tools, and executes multi-step workflows autonomously.

Consider a coding agent. You describe a feature. The agent breaks it into tasks, reads existing code to understand the architecture, writes implementation code, generates tests, runs them, debugs failures, and submits a pull request. All without further instruction.

The key technologies enabling this are chain-of-thought reasoning, tool use APIs, and memory systems. The agent thinks step by step, calls external tools like web browsers or code interpreters, and maintains context across long interactions.

The challenge ahead is reliability. Current agents succeed about 70 percent of the time on complex benchmarks. For enterprise adoption, that needs to reach 99 percent or higher.

That's our deep dive for today. Join us next week when we explore multi-agent systems.

---

## 💻 Running AI on Your Laptop: The Local LLM Revolution

**Host:** Jake Morrison · **Duration:** ~7 min

What's up everyone, Jake Morrison here with AI Unplugged.

Today I want to talk about something that seemed impossible just two years ago: running sophisticated AI models on your laptop, completely offline, with no cloud, no API keys, and no monthly bill.

The key innovation is quantization. Full-precision AI models use 32-bit floating point numbers for every parameter. A 70-billion parameter model would need 280 gigabytes of memory. That's not fitting on anyone's MacBook.

But researchers discovered you can reduce those 32-bit numbers to 4 bits — a factor of 8 reduction — with minimal quality loss. That 280 gigabyte model shrinks to 35 gigabytes. Now it fits in RAM.

Tools like llama.cpp, Ollama, and LM Studio have made running these quantized models trivially easy. Download a model, double-click, and you're chatting with an AI that rivals GPT-3.5 in capability.

The latest Apple Silicon chips are particularly well-suited for this. The unified memory architecture means the GPU and CPU share the same RAM pool. An M4 Max with 128 gigs of unified memory can run models that would require a dedicated GPU cluster just two years ago.

Privacy is the killer feature. Your data never leaves your machine. No terms of service, no data collection, no API logs.

That wraps up today's episode. Go try Ollama, download Llama 3, and experience the future of private AI. See you next week.
`
  },
  {
    name: 'Podcast Collection — Science & Education',
    category: 'podcasts',
    icon: 'bi-mortarboard-fill',
    description: 'Ready-to-play podcast scripts on Quantum Computing, CRISPR Gene Editing, Climate Tech, and Learning Science',
    content: `# 🎙️ Podcast Collection — Science & Education

> Click **🔊 TTS** on any section to hear it spoken aloud, or open the **Podcast Marketplace** (Tools → Podcasts) to browse and play all episodes with the full audio player.

---

## ⚛️ Quantum Computing: Beyond the Hype

**Host:** Professor Lisa Nakamura · **Duration:** ~9 min

Good morning. I'm Professor Lisa Nakamura, and this is Quantum Clarity — where we separate quantum reality from quantum hype.

Let's start with what quantum computers are not. They are not faster classical computers. They don't speed up every computation. They won't replace your laptop.

What they are is fundamentally different. Classical computers process bits — zeros and ones. Quantum computers process qubits — which can exist in a superposition of zero and one simultaneously. When you have many qubits entangled together, you can explore an exponentially vast space of possibilities in parallel.

This gives quantum computers an advantage for specific problems. Cryptography: Shor's algorithm can factor large numbers exponentially faster, threatening RSA encryption. Molecular simulation: modeling chemical reactions that would take classical supercomputers millions of years. Optimization: finding the best solution among billions of possibilities.

The error correction problem is the central challenge. Quantum states are extraordinarily fragile. A stray photon, a vibration, a tiny temperature fluctuation can collapse a superposition. This is why quantum computers operate at temperatures colder than outer space.

Realistic timeline: useful quantum advantage for drug discovery and materials science within 5 to 10 years. Breaking current encryption — likely 15 to 20 years, but post-quantum cryptography standards are already being deployed as a precaution.

Thank you for listening. Stay curious, stay skeptical.

---

## 🧬 CRISPR 3.0: Gene Editing Goes Mainstream

**Host:** Dr. Maya Thompson · **Duration:** ~8 min

This is The Gene Edition. I'm Dr. Maya Thompson, molecular biologist and your guide to the cutting edge of genetic medicine.

CRISPR burst onto the scene in 2012 as a revolutionary gene editing tool. Think of it as molecular scissors that can cut DNA at a precise location. But cutting DNA is crude — it's like editing a book by ripping out pages.

Base editing, developed by David Liu's lab, was the first refinement. Instead of cutting the double helix, it chemically converts one DNA letter to another. It's like using correction fluid — precise and clean.

Prime editing went further. It's been called "search and replace" for the genome. It can make any small edit — insertions, deletions, or substitutions — without ever cutting both strands of DNA. This dramatically reduces unwanted side effects.

The clinical results are extraordinary. Casgevy, the first approved CRISPR therapy, is curing sickle cell disease — a condition that has caused suffering for millions for centuries. One treatment, potentially a lifetime cure.

We are living through the most transformative era in medicine since antibiotics. That's not hyperbole — it's molecular biology.

Until next time, this is Dr. Maya Thompson. Edit responsibly.

---

## 🧠 How Your Brain Actually Learns

**Host:** Dr. Rebecca Foster · **Duration:** ~8 min

Good morning learners. I'm Dr. Rebecca Foster, cognitive scientist, and this is Brain Hacks — where we apply neuroscience to the art of learning.

Let me start with the biggest myth in education: learning styles. Visual, auditory, kinesthetic — it sounds intuitive, but decades of research have found no evidence that matching teaching to "learning styles" improves outcomes. What does work is multimodal learning — engaging multiple senses simultaneously.

Here are the techniques backed by the strongest evidence.

Spaced repetition. Instead of cramming all at once, distribute your practice over time. Review material at increasing intervals: one day, three days, one week, two weeks. This exploits the brain's reconsolidation process and produces dramatically more durable memories.

Active recall. Don't re-read your notes — close them and try to remember. This retrieval practice is uncomfortable because it feels harder. But that difficulty is the signal that learning is happening.

Sleep. During deep sleep, your brain replays the day's learning at high speed, consolidating short-term memories into long-term storage. Pulling an all-nighter before an exam quite literally prevents the brain from converting what you studied into lasting knowledge.

Final tip: teach what you learn. Explaining a concept to someone else forces you to organize, simplify, and fill gaps in your understanding. The act of teaching is the ultimate active recall exercise.

This has been Brain Hacks. Learn smarter, not harder.
`
  },
  {
    name: 'Podcast Collection — Business & Creative',
    category: 'podcasts',
    icon: 'bi-briefcase-fill',
    description: 'Ready-to-play podcast scripts on Startup Lessons, Remote Work, Digital Storytelling, and Design Systems',
    content: `# 🎙️ Podcast Collection — Business & Creative

> Click **🔊 TTS** on any section to hear it spoken aloud, or open the **Podcast Marketplace** (Tools → Podcasts) to browse and play all episodes with the full audio player.

---

## 🚀 Startup Lessons Nobody Teaches You

**Host:** Chris Walker · **Duration:** ~7 min

Hey founders. Chris Walker here with Startup Realities.

I've built three companies. One failed spectacularly. One was acqui-hired. One reached profitability. Here are the lessons nobody teaches you in startup school.

Lesson one: revenue solves everything. When you're burning cash, every problem feels existential. Cash in the bank buys time, and time is the one resource you can't manufacture. Get to revenue as fast as humanly possible, even if it's ugly.

Lesson two: hire slow, fire fast is terrible advice when taken literally. What it actually means is: be rigorous in hiring — but once someone is clearly not working out, don't agonize for months. Have the conversation quickly and kindly.

Lesson three: your first product will be wrong. That's not failure, it's data. The founders who succeed aren't the ones who guess right the first time — they're the ones who iterate fastest. Ship something in weeks, not months.

Lesson four: most startup advice is survivorship bias. The strategies that worked for one company in one market at one moment in time may be actively harmful in your situation. Be skeptical of universal rules.

Lesson five: burn rate is not just money — it's emotional energy. Founder burnout kills more startups than competition does. Build sustainable work rhythms. This is a marathon dressed up as a sprint.

Final lesson: the best startup strategy is survival. Stay alive long enough to find product-market fit, and everything else becomes solvable.

Good luck out there. Build something that matters.

---

## ✍️ The Art of Digital Storytelling

**Host:** Elena Vasquez · **Duration:** ~7 min

Hello storytellers. I'm Elena Vasquez, and this is Narrative Lab.

Story is the oldest technology. Before writing, before agriculture, before fire — humans were telling stories. Today, the medium has evolved, but the principles haven't.

Every great story needs three things: a character the audience cares about, a challenge that seems insurmountable, and a transformation that resonates emotionally.

Digital tools amplify these elements. Interactive storytelling lets the audience make choices, creating personal investment. Data journalism is storytelling with evidence. The Pudding creates visual essays that transform complex datasets into human narratives.

The tools available today are extraordinary. Markdown with embedded media. Interactive code that generates custom visualizations. AI that can help you brainstorm narrative structures, generate draft passages, and even create accompanying artwork.

But remember: tools serve story, never the other way around. If a fancy animation doesn't advance your narrative, cut it. The most powerful sentence in any writer's toolbox is still a simple, clear, human truth.

My advice for aspiring digital storytellers: start with the story. What is the one thing you want your audience to feel? Build outward from that emotional core.

This has been Narrative Lab. Go tell stories that matter.

---

## 🎨 Design Systems That Scale

**Host:** Tomás Almeida · **Duration:** ~8 min

Welcome to Pixel Perfect. I'm Tomás Almeida, and I've spent the last decade building design systems for companies from startups to Fortune 500s.

A design system is not a component library. Components are just the visible tip. Beneath the surface, a true design system includes design tokens — colors, spacing, typography — that encode your brand's visual DNA.

The most common mistake is starting too big. Teams build elaborate systems before they've validated the patterns. Start small. Document the patterns you're already using.

Design tokens are the foundation. Define them as platform-agnostic values — hex colors, pixel values, font stacks — then transform them to CSS custom properties, iOS values, Android resources, or whatever your platform needs. One source of truth, many outputs.

The adoption challenge is cultural, not technical. Engineers need to feel that the system makes their work faster, not slower. Designers need to feel that it enables creativity, not constrains it.

Maintenance is where systems die. Without a dedicated team — even just one person — a design system drifts. Components accumulate without review. Documentation goes stale. Entropy wins.

My rule of thumb: invest twenty percent of your design system effort in building, and eighty percent in documentation, education, and maintenance.

That's all for today. Build systems that serve people, and the pixels will follow.
`
  },
  {
    name: 'Custom Podcast Script — Blank',
    category: 'podcasts',
    icon: 'bi-pencil-square',
    description: 'A blank podcast script template — write your own content and use TTS to convert it to audio',
    content: `# 🎙️ My Podcast Episode

**Host:** Your Name  
**Topic:** Your Topic Here  
**Duration:** ~5 min

---

## Introduction

Hello and welcome to [Your Podcast Name]. I'm [Your Name], and today we're going to explore [topic].

[Write your introduction here — set the stage, hook the listener, and preview what's coming.]

---

## Main Content

### Point One

[Develop your first main point here. Include specific examples, data, or stories that make it concrete and memorable.]

### Point Two

[Develop your second main point. Build on the first one — show how the ideas connect.]

### Point Three

[Your third main point. This is often the most surprising or forward-looking insight.]

---

## Conclusion

[Wrap up with a clear takeaway. What should the listener remember? What should they do next?]

That's all for today. Thank you for listening, and we'll see you next time.

---

> **💡 Tip:** Select any section and click the **🔊 TTS** button in the formatting toolbar to hear it read aloud with natural AI voice. Or open **Tools → Podcasts** to use the full podcast player.
`
  }
];
