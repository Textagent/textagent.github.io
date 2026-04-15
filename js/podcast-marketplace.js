// ============================================
// podcast-marketplace.js — Audio Podcast Marketplace
// Browse, play, and generate audio podcasts
// from markdown content using Kokoro TTS.
// ============================================
(function (M) {
    'use strict';

    // ── Podcast Catalog ──────────────────────────
    // Each podcast has: id, title, host, description, category, emoji, gradient, duration, script
    // Audio is generated on-demand from the script via Kokoro TTS.
    const PODCAST_CATALOG = [
        // ── Tech ──
        {
            id: 'tech-web-assembly',
            title: 'WebAssembly: The Future of the Browser',
            host: 'Sarah Chen',
            description: 'Deep dive into how WebAssembly is transforming web performance, enabling near-native speed for complex applications running entirely in the browser.',
            category: 'tech',
            emoji: '⚡',
            gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
            duration: '8 min',
            script: `Welcome to Tech Forward. I'm Sarah Chen, and today we're exploring WebAssembly — the technology quietly revolutionizing what's possible in your browser.\n\nWebAssembly, or WASM, is a binary instruction format designed as a portable compilation target. Think of it as a virtual processor that runs inside your browser at near-native speed.\n\nUnlike JavaScript, which is interpreted and optimized at runtime, WebAssembly code arrives pre-compiled. The browser simply validates and executes it. This means compute-heavy tasks like video editing, 3D rendering, and machine learning can now run client-side without plugins.\n\nMajor applications are already leveraging this. Figma runs its entire design engine in WASM. Google Earth renders 3D terrain in real-time. AutoCAD brought their entire desktop application to the web.\n\nThe key breakthrough is the component model — a way for WASM modules to communicate across language boundaries. You can write a physics engine in Rust, a UI layer in TypeScript, and glue them together seamlessly.\n\nLooking ahead, WASM is expanding beyond browsers. WASI — the WebAssembly System Interface — enables WASM to run on servers, edge functions, and even embedded devices. It's becoming a truly universal runtime.\n\nThat's all for today. Follow us for more deep dives into the technologies shaping our digital future.`
        },
        {
            id: 'tech-edge-computing',
            title: 'Edge Computing: Processing at the Speed of Light',
            host: 'Marcus Rivera',
            description: 'How moving computation closer to data sources is enabling real-time applications from autonomous vehicles to smart cities.',
            category: 'tech',
            emoji: '🌐',
            gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
            duration: '7 min',
            script: `Hey everyone, Marcus Rivera here with another episode of the Edge.\n\nToday we're talking about edge computing — the paradigm shift that moves processing power from centralized data centers to the physical location where data is generated.\n\nThe problem is simple: latency. When a self-driving car needs to make a split-second decision, it can't afford the 50 milliseconds round trip to a cloud server. The computation has to happen right there on the device.\n\nEdge computing solves this by distributing processing across a hierarchy. At the bottom, you have device-level computing — your smartphone's neural engine or an IoT sensor's microcontroller. In the middle, edge servers at cell towers and local data centers. At the top, the traditional cloud for heavy batch processing.\n\nThe results are dramatic. 5G networks combined with edge computing can deliver response times under 1 millisecond. That's fast enough for remote surgery, real-time industrial automation, and immersive augmented reality.\n\nMajor cloud providers are racing to build this infrastructure. AWS has Wavelength zones embedded in telecom networks. Microsoft's Azure Edge Zones bring compute to the 5G radio access network.\n\nThe next frontier is AI inference at the edge — running machine learning models directly on devices without any cloud connectivity. This is what powers real-time translation in your earbuds, on-device photo enhancement, and voice assistants that work offline.\n\nThanks for tuning in. Until next time, stay on the edge.`
        },
        // ── AI ──
        {
            id: 'ai-agents-future',
            title: 'AI Agents: From Chatbots to Digital Coworkers',
            host: 'Dr. Anika Patel',
            description: 'Exploring the evolution from simple chatbots to autonomous AI agents that can reason, plan, and execute complex multi-step tasks.',
            category: 'ai',
            emoji: '🤖',
            gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
            duration: '9 min',
            script: `Hello and welcome to AI Horizons. I'm Dr. Anika Patel, and today we're charting the evolution from simple chatbots to fully autonomous AI agents.\n\nThe chatbot era gave us pattern matching and scripted responses. You asked a question, it matched keywords, and returned a pre-written answer. Useful, but limited.\n\nThen came large language models. Suddenly, AI could generate coherent, contextual responses to virtually any prompt. But they were still reactive — you push, they respond.\n\nAI agents represent the next leap. An agent doesn't just respond — it reasons about goals, creates plans, uses tools, and executes multi-step workflows autonomously.\n\nConsider a coding agent. You describe a feature. The agent breaks it into tasks, reads existing code to understand the architecture, writes implementation code, generates tests, runs them, debugs failures, and submits a pull request. All without further instruction.\n\nThe key technologies enabling this are chain-of-thought reasoning, tool use APIs, and memory systems. The agent thinks step by step, calls external tools like web browsers or code interpreters, and maintains context across long interactions.\n\nWe're seeing this in practice. GitHub Copilot Workspace can implement entire features. Devin can handle software engineering tasks end to end. Google's Gemini agents can browse the web, analyze data, and draft reports.\n\nThe challenge ahead is reliability. Current agents succeed about 70 percent of the time on complex benchmarks. For enterprise adoption, that needs to reach 99 percent or higher.\n\nThat's our deep dive for today. Join us next week when we explore multi-agent systems — where teams of specialized AI agents collaborate on complex problems. Until then, I'm Dr. Anika Patel.`
        },
        {
            id: 'ai-local-models',
            title: 'Running AI on Your Laptop: The Local LLM Revolution',
            host: 'Jake Morrison',
            description: 'How quantization, pruning, and efficient architectures are making it possible to run powerful AI models entirely on consumer hardware.',
            category: 'ai',
            emoji: '💻',
            gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
            duration: '7 min',
            script: `What's up everyone, Jake Morrison here with AI Unplugged.\n\nToday I want to talk about something that seemed impossible just two years ago: running sophisticated AI models on your laptop, completely offline, with no cloud, no API keys, and no monthly bill.\n\nThe key innovation is quantization. Full-precision AI models use 32-bit floating point numbers for every parameter. A 70-billion parameter model would need 280 gigabytes of memory. That's not fitting on anyone's MacBook.\n\nBut researchers discovered you can reduce those 32-bit numbers to 4 bits — a factor of 8 reduction — with minimal quality loss. That 280 gigabyte model shrinks to 35 gigabytes. Now it fits in RAM.\n\nTools like llama.cpp, Ollama, and LM Studio have made running these quantized models trivially easy. Download a model, double-click, and you're chatting with an AI that rivals GPT-3.5 in capability.\n\nThe latest Apple Silicon chips are particularly well-suited for this. The unified memory architecture means the GPU and CPU share the same RAM pool. An M4 Max with 128 gigs of unified memory can run models that would require a dedicated GPU cluster just two years ago.\n\nPrivacy is the killer feature. Your data never leaves your machine. No terms of service, no data collection, no API logs.\n\nThe trade-off is speed. Local models generate about 20 to 40 tokens per second versus 80 or more from cloud APIs. But for many use cases — writing, coding, analysis — that's more than fast enough.\n\nThat wraps up today's episode. Go try Ollama, download Llama 3, and experience the future of private AI. See you next week.`
        },
        {
            id: 'ai-multimodal',
            title: 'Multimodal AI: When Models See, Hear, and Speak',
            host: 'Dr. Anika Patel',
            description: 'The convergence of vision, audio, and language understanding in single AI models is creating systems that perceive the world like humans do.',
            category: 'ai',
            emoji: '👁️',
            gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
            duration: '8 min',
            script: `Welcome back to AI Horizons. I'm Dr. Anika Patel, and today we're exploring multimodal AI — models that can simultaneously process text, images, audio, and video.\n\nFor years, AI was siloed. One model for text, another for images, a third for speech. Each was world-class in its domain but blind to the others.\n\nMultimodal models change this fundamentally. GPT-4 Vision can look at a photo of a whiteboard and transcribe the equations. Gemini can watch a video and answer questions about specific scenes. These models perceive the world through multiple senses simultaneously.\n\nThe architecture breakthrough was the transformer's flexibility. By encoding all modalities — pixels, audio samples, text tokens — into the same embedding space, a single transformer can reason across all of them.\n\nPractical applications are already transforming industries. Doctors upload X-rays and get AI-assisted diagnoses with natural language explanations. Engineers photograph mechanical failures and receive repair procedures. Students take photos of textbook problems and get step-by-step solutions.\n\nThe real magic happens when modalities combine. An AI that can see your screen, hear your voice, understand your context, and respond with both text and generated images. That's not science fiction — that's the current generation of AI assistants.\n\nNext frontier: real-time video understanding. Models that can watch a live video stream, understand spatial relationships, track objects, and provide continuous narration or guidance. Think AI sports commentators, real-time security analysis, or augmented reality navigation.\n\nThat's all for today. Keep your eyes, ears, and neural networks open. Until next time.`
        },
        // ── Science ──
        {
            id: 'sci-quantum',
            title: 'Quantum Computing: Beyond the Hype',
            host: 'Professor Lisa Nakamura',
            description: 'Separating quantum computing reality from science fiction — what these machines can actually do today and what remains decades away.',
            category: 'science',
            emoji: '⚛️',
            gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            duration: '9 min',
            script: `Good morning. I'm Professor Lisa Nakamura, and this is Quantum Clarity — where we separate quantum reality from quantum hype.\n\nLet's start with what quantum computers are not. They are not faster classical computers. They don't speed up every computation. They won't replace your laptop.\n\nWhat they are is fundamentally different. Classical computers process bits — zeros and ones. Quantum computers process qubits — which can exist in a superposition of zero and one simultaneously. When you have many qubits entangled together, you can explore an exponentially vast space of possibilities in parallel.\n\nThis gives quantum computers an advantage for specific problems. Cryptography: Shor's algorithm can factor large numbers exponentially faster, threatening RSA encryption. Molecular simulation: modeling chemical reactions that would take classical supercomputers millions of years. Optimization: finding the best solution among billions of possibilities.\n\nToday's quantum computers have between 50 and 1000 qubits. IBM's Condor processor reached 1121 qubits. But raw qubit count is misleading. What matters is error-corrected logical qubits. Current machines might need a thousand physical qubits to create one reliable logical qubit.\n\nThe error correction problem is the central challenge. Quantum states are extraordinarily fragile. A stray photon, a vibration, a tiny temperature fluctuation can collapse a superposition. This is why quantum computers operate at temperatures colder than outer space.\n\nRealistic timeline: useful quantum advantage for drug discovery and materials science within 5 to 10 years. Breaking current encryption — likely 15 to 20 years, but post-quantum cryptography standards are already being deployed as a precaution.\n\nMy advice: learn the fundamentals now, but don't hold your breath for quantum laptops. This is the transistor era of quantum computing — profound in the long run, but the smartphone moment is still far away.\n\nThank you for listening. Stay curious, stay skeptical.`
        },
        {
            id: 'sci-biotech',
            title: 'CRISPR 3.0: Gene Editing Goes Mainstream',
            host: 'Dr. Maya Thompson',
            description: 'The latest advances in gene editing technology — from base editing to prime editing — and how they are beginning to cure previously untreatable genetic diseases.',
            category: 'science',
            emoji: '🧬',
            gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
            duration: '8 min',
            script: `This is The Gene Edition. I'm Dr. Maya Thompson, molecular biologist and your guide to the cutting edge of genetic medicine.\n\nCRISPR burst onto the scene in 2012 as a revolutionary gene editing tool. Think of it as molecular scissors that can cut DNA at a precise location. But cutting DNA is crude — it's like editing a book by ripping out pages.\n\nBase editing, developed by David Liu's lab, was the first refinement. Instead of cutting the double helix, it chemically converts one DNA letter to another. It's like using correction fluid — precise and clean.\n\nPrime editing went further. It's been called "search and replace" for the genome. It can make any small edit — insertions, deletions, or substitutions — without ever cutting both strands of DNA. This dramatically reduces unwanted side effects.\n\nThe clinical results are extraordinary. Casgevy, the first approved CRISPR therapy, is curing sickle cell disease — a condition that has caused suffering for millions for centuries. One treatment, potentially a lifetime cure.\n\nIn-vivo editing is the next frontier. Instead of editing cells outside the body and transplanting them back, we deliver the editing machinery directly into a living patient. Intellia Therapeutics has shown this works in the liver, reducing a harmful protein by over 90 percent with a single infusion.\n\nThe cost remains a challenge. Current gene therapies cost one to three million dollars per patient. But as delivery methods improve and manufacturing scales, prices will fall dramatically — just as genome sequencing went from 3 billion dollars to 200 dollars.\n\nWe are living through the most transformative era in medicine since antibiotics. That's not hyperbole — it's molecular biology.\n\nUntil next time, this is Dr. Maya Thompson. Edit responsibly.`
        },
        // ── Business ──
        {
            id: 'biz-startup-lessons',
            title: 'Startup Lessons Nobody Teaches You',
            host: 'Chris Walker',
            description: 'Hard-won wisdom from failed and successful startups — the tactical, unglamorous truths about building companies that survive.',
            category: 'business',
            emoji: '🚀',
            gradient: 'linear-gradient(135deg, #f6d365, #fda085)',
            duration: '7 min',
            script: `Hey founders. Chris Walker here with Startup Realities.\n\nI've built three companies. One failed spectacularly. One was acqui-hired. One reached profitability. Here are the lessons nobody teaches you in startup school.\n\nLesson one: revenue solves everything. When you're burning cash, every problem feels existential. Cash in the bank buys time, and time is the one resource you can't manufacture. Get to revenue as fast as humanly possible, even if it's ugly.\n\nLesson two: hire slow, fire fast is terrible advice when taken literally. What it actually means is: be rigorous in hiring — but once someone is clearly not working out, don't agonize for months. Have the conversation quickly and kindly.\n\nLesson three: your first product will be wrong. That's not failure, it's data. The founders who succeed aren't the ones who guess right the first time — they're the ones who iterate fastest. Ship something in weeks, not months.\n\nLesson four: most startup advice is survivorship bias. The strategies that worked for one company in one market at one moment in time may be actively harmful in your situation. Be skeptical of universal rules.\n\nLesson five: burn rate is not just money — it's emotional energy. Founder burnout kills more startups than competition does. Build sustainable work rhythms. Take weekends. Exercise. This is a marathon dressed up as a sprint.\n\nLesson six: your competitors are probably struggling just as much as you are. From the outside, everyone looks like they have it figured out. They don't. Focus inward.\n\nFinal lesson: the best startup strategy is survival. Stay alive long enough to find product-market fit, and everything else becomes solvable.\n\nGood luck out there. Build something that matters.`
        },
        {
            id: 'biz-remote-work',
            title: 'The Future of Work is Hybrid — Here\'s How to Do It Right',
            host: 'Hannah Lee',
            description: 'Practical frameworks for building high-performing hybrid teams — from async communication to results-based management.',
            category: 'business',
            emoji: '🏢',
            gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
            duration: '7 min',
            script: `Welcome to Work Evolved. I'm Hannah Lee, and I help companies design hybrid work systems that actually work.\n\nThe debate about remote versus office is over. The answer is hybrid — but most companies are implementing it badly. They're treating hybrid as "some days remote, some days in office" without redesigning their processes. That's the worst of both worlds.\n\nHere's the framework I recommend. First, separate work into two categories: collaborative and focused. Collaborative work — brainstorming, relationship building, complex problem solving — is better in person. Focused work — writing, coding, analysis, deep thinking — is dramatically better remote.\n\nDesign your hybrid schedule around this distinction. Designate two or three collaborative days where the team is co-located. The remaining days are protected focus time — work from wherever you're most productive, with minimal meetings.\n\nSecond, make asynchronous communication your default. Write decisions down. Record presentations. Document meeting outcomes. If someone who wasn't in the room can't find the information, your communication system is broken.\n\nThird, measure results not presence. Hours in chairs is a terrible productivity metric. Define clear deliverables, track progress against them, and trust your team to manage their own time.\n\nFourth, invest in tooling. Great hybrid work requires great tools. High-quality video conferencing, collaborative documents, async video messages, and digital whiteboards aren't optional — they're infrastructure.\n\nThe companies getting this right are seeing higher productivity, better retention, and access to global talent. The companies still fighting about office mandates are losing their best people.\n\nThat's all for today. Design work around humans, not the other way around.`
        },
        // ── Creative ──
        {
            id: 'creative-storytelling',
            title: 'The Art of Digital Storytelling',
            host: 'Elena Vasquez',
            description: 'How to craft compelling narratives using modern digital tools — from interactive fiction to data-driven journalism to multimedia essays.',
            category: 'creative',
            emoji: '✍️',
            gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)',
            duration: '7 min',
            script: `Hello storytellers. I'm Elena Vasquez, and this is Narrative Lab.\n\nStory is the oldest technology. Before writing, before agriculture, before fire — humans were telling stories. Today, the medium has evolved, but the principles haven't.\n\nEvery great story needs three things: a character the audience cares about, a challenge that seems insurmountable, and a transformation that resonates emotionally.\n\nDigital tools amplify these elements. Interactive storytelling lets the audience make choices, creating personal investment. The New York Times' Snow Fall project proved that multimedia — text, video, animation, data visualization — woven together can create experiences that no single medium can match.\n\nData journalism is storytelling with evidence. The Pudding creates visual essays that transform complex datasets into human narratives. They don't just present charts — they guide you through a discovery.\n\nThe tools available today are extraordinary. Markdown with embedded media. Interactive code that generates custom visualizations. AI that can help you brainstorm narrative structures, generate draft passages, and even create accompanying artwork.\n\nBut remember: tools serve story, never the other way around. If a fancy animation doesn't advance your narrative, cut it. If a data visualization confuses rather than clarifies, simplify it. The most powerful sentence in any writer's toolbox is still a simple, clear, human truth.\n\nMy advice for aspiring digital storytellers: start with the story. What is the one thing you want your audience to feel? Build outward from that emotional core.\n\nThis has been Narrative Lab. Go tell stories that matter.`
        },
        {
            id: 'creative-design-systems',
            title: 'Design Systems That Scale',
            host: 'Tomás Almeida',
            description: 'Building and maintaining design systems that stay consistent across products, teams, and years — with real-world case studies.',
            category: 'creative',
            emoji: '🎨',
            gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
            duration: '8 min',
            script: `Welcome to Pixel Perfect. I'm Tomás Almeida, and I've spent the last decade building design systems for companies from startups to Fortune 500s.\n\nA design system is not a component library. Components are just the visible tip. Beneath the surface, a true design system includes design tokens — colors, spacing, typography — that encode your brand's visual DNA. It includes interaction patterns — how things animate, respond to hover, handle loading states. And it includes documentation — the why behind every decision.\n\nThe most common mistake is starting too big. Teams build elaborate systems before they've validated the patterns. Then reality hits: engineers need variations that weren't planned, designers want exceptions, and the system becomes a constraint rather than a tool.\n\nStart small. Document the patterns you're already using. Formalize the decisions you've already made. A design system should codify reality, not impose ideals.\n\nDesign tokens are the foundation. Define them as platform-agnostic values — hex colors, pixel values, font stacks — then transform them to CSS custom properties, iOS values, Android resources, or whatever your platform needs. One source of truth, many outputs.\n\nThe adoption challenge is cultural, not technical. Engineers need to feel that the system makes their work faster, not slower. Designers need to feel that it enables creativity, not constrains it. This means investing heavily in developer experience and designer education.\n\nMaintenance is where systems die. Without a dedicated team — even just one person — a design system drifts. Components accumulate without review. Documentation goes stale. Entropy wins.\n\nMy rule of thumb: invest twenty percent of your design system effort in building, and eighty percent in documentation, education, and maintenance.\n\nThat's all for today. Build systems that serve people, and the pixels will follow.`
        },
        // ── Education ──
        {
            id: 'edu-learning-science',
            title: 'How Your Brain Actually Learns',
            host: 'Dr. Rebecca Foster',
            description: 'The neuroscience of learning — evidence-based techniques for memory, comprehension, and skill acquisition that actually work.',
            category: 'education',
            emoji: '🧠',
            gradient: 'linear-gradient(135deg, #d299c2, #fef9d7)',
            duration: '8 min',
            script: `Good morning learners. I'm Dr. Rebecca Foster, cognitive scientist, and this is Brain Hacks — where we apply neuroscience to the art of learning.\n\nLet me start with the biggest myth in education: learning styles. Visual, auditory, kinesthetic — it sounds intuitive, but decades of research have found no evidence that matching teaching to "learning styles" improves outcomes. What does work is multimodal learning — engaging multiple senses simultaneously.\n\nHere are the techniques backed by the strongest evidence.\n\nSpaced repetition. Instead of cramming all at once, distribute your practice over time. Review material at increasing intervals: one day, three days, one week, two weeks. This exploits the brain's reconsolidation process and produces dramatically more durable memories.\n\nActive recall. Don't re-read your notes — close them and try to remember. This retrieval practice is uncomfortable because it feels harder. But that difficulty is the signal that learning is happening. Every time you successfully recall information, you strengthen the neural pathway.\n\nInterleaving. Don't practice one skill in isolation — mix different skills or topics together. This feels less efficient, but it builds flexible knowledge that transfers to new situations. Musicians who practice multiple pieces in random order outperform those who practice one piece at a time.\n\nSleep. During deep sleep, your brain replays the day's learning at high speed, consolidating short-term memories into long-term storage. Pulling an all-nighter before an exam quite literally prevents the brain from converting what you studied into lasting knowledge.\n\nFinal tip: teach what you learn. Explaining a concept to someone else — even an imaginary audience — forces you to organize, simplify, and fill gaps in your understanding. The act of teaching is the ultimate active recall exercise.\n\nThis has been Brain Hacks. Learn smarter, not harder.`
        },
        {
            id: 'edu-markdown-mastery',
            title: 'Markdown Mastery: Write Like a Developer',
            host: 'TextAgent Team',
            description: 'A comprehensive guide to Markdown — from basic syntax to advanced features like tables, diagrams, and executable code blocks.',
            category: 'education',
            emoji: '📝',
            gradient: 'linear-gradient(135deg, #c3cfe2, #f5f7fa)',
            duration: '6 min',
            script: `Welcome to the TextAgent podcast. Today we're going from Markdown beginner to power user.\n\nMarkdown was created by John Gruber in 2004 with a simple philosophy: a plain text format that's readable as-is but converts to beautiful HTML. It's now the universal language of documentation, README files, chat messages, and note-taking.\n\nLet's start with the essentials. Headings use hash marks — one hash for the biggest heading, down to six for the smallest. Paragraphs are separated by blank lines. Bold text uses double asterisks. Italic uses single asterisks.\n\nLinks use square brackets for the text and parentheses for the URL. Images are the same but with an exclamation mark prefix. Code uses backticks — single backticks for inline code, triple backticks for code blocks.\n\nLists are intuitive. Dashes or asterisks for bullet points. Numbers followed by periods for numbered lists. Indent to create nested sub-lists.\n\nNow the power features. Tables use pipes and dashes to create columns and rows. Mermaid code blocks create flowcharts, sequence diagrams, and more — entirely from text. Math expressions use dollar signs for LaTeX rendering.\n\nIn TextAgent specifically, you have executable code blocks. Add a Run button to JavaScript, Python, or Bash code. Use AI tags to generate content dynamically. Create interactive quizzes, forms, and charts — all from plain Markdown.\n\nThe beauty of Markdown is its portability. Your files work everywhere — GitHub, Obsidian, Notion, VS Code, and thousands of other tools. No vendor lock-in, no proprietary format.\n\nStart writing in Markdown today. Your future self will thank you.`
        },
        // ── More Tech ──
        {
            id: 'tech-rust-rise',
            title: 'Why Rust is Eating the World',
            host: 'David Park',
            description: 'From Linux kernel to web browsers, Rust is replacing C and C++ in critical infrastructure. Understanding why and what it means.',
            category: 'tech',
            emoji: '🦀',
            gradient: 'linear-gradient(135deg, #ff6b6b, #ffa07a)',
            duration: '7 min',
            script: `Hey everyone, David Park here with Code Culture.\n\nRust was voted the most loved programming language for eight years running on Stack Overflow. But popularity contests don't explain why the Linux kernel, Android, Windows, Chrome, Firefox, Discord, Cloudflare, and AWS are all adopting it. Let me explain what's actually happening.\n\nThe problem Rust solves is memory safety. About 70 percent of serious security vulnerabilities in large C and C++ codebases are memory safety bugs — buffer overflows, use-after-free, null pointer dereferences. These bugs have cost billions of dollars and enabled countless attacks.\n\nRust eliminates these bugs at compile time through its ownership system. Every piece of data has exactly one owner. When ownership is transferred, the previous reference becomes invalid. The compiler enforces this — if your code compiles, an entire class of bugs is impossible.\n\nThis isn't just theory. Google reported that after introducing Rust for new Android code, memory safety vulnerabilities dropped from 76 percent to 24 percent of all bugs. Microsoft found similar results in Windows components rewritten in Rust.\n\nThe trade-off is learning curve. Rust's borrow checker is notoriously strict. Code that seems perfectly logical gets rejected because the compiler sees a potential safety violation you didn't consider. Fighting the borrow checker is a rite of passage.\n\nBut once you internalize the ownership model, something remarkable happens. Your Rust code isn't just safe — it's fast. Zero-cost abstractions mean high-level code compiles to the same efficient machine code as hand-optimized C.\n\nRust isn't replacing everything. It's replacing the critical infrastructure layer where safety and performance intersect. For rapid prototyping and business logic, Python, TypeScript, and Go remain excellent choices.\n\nThat's Rust in a nutshell. Safe, fast, and here to stay.`
        },
        {
            id: 'tech-privacy',
            title: 'Privacy Engineering: Building Systems That Protect Users',
            host: 'Sarah Chen',
            description: 'Practical approaches to privacy-preserving engineering — from differential privacy to zero-knowledge proofs to on-device processing.',
            category: 'tech',
            emoji: '🔒',
            gradient: 'linear-gradient(135deg, #5ee7df, #b490ca)',
            duration: '8 min',
            script: `Welcome back to Tech Forward. I'm Sarah Chen, and today we're exploring privacy engineering — the discipline of building systems that protect user data by design, not as an afterthought.\n\nPrivacy engineering starts with a fundamental question: what data do we actually need? Most systems collect far more information than they use. A weather app doesn't need your contact list. A calculator doesn't need your location history. The first principle is data minimization — collect only what's essential.\n\nDifferential privacy is perhaps the most elegant privacy technology. It adds carefully calibrated noise to datasets, making it mathematically impossible to determine whether any individual's data was included. Apple uses this to learn typing patterns without knowing what any individual types.\n\nOn-device processing keeps data where it belongs — on the user's device. Apple's approach to photo analysis, Siri processing, and health data is a masterclass. Machine learning models run locally, results stay local, and only aggregated, anonymized insights ever touch a server.\n\nZero-knowledge proofs are the cryptographic magic trick. They let you prove you know something without revealing what you know. You can prove you're over 21 without revealing your birthday. You can prove you have sufficient funds without revealing your balance.\n\nEnd-to-end encryption ensures that even the service provider can't read user communications. Signal pioneered this with the Signal Protocol, now used by WhatsApp, Facebook Messenger, and Google Messages.\n\nThe business case for privacy is stronger than ever. Users increasingly choose products that respect their data. Regulations like GDPR and CCPA impose real penalties for violations. And the engineering cost of a data breach — both financial and reputational — dwarfs the cost of building privacy-first systems.\n\nBuild privacy in. Your users deserve it, and your business depends on it.\n\nThis has been Tech Forward. Until next time.`
        },
        // ── More Business ──
        {
            id: 'biz-open-source',
            title: 'Open Source Business Models That Actually Work',
            host: 'Chris Walker',
            description: 'How companies build sustainable businesses around open source software — from dual licensing to open core to managed services.',
            category: 'business',
            emoji: '🔓',
            gradient: 'linear-gradient(135deg, #fddb92, #d1fdff)',
            duration: '7 min',
            script: `Chris Walker here with another episode of Startup Realities. Today: how to make money giving software away for free.\n\nOpen source seems paradoxical. You spend millions developing software, then publish the source code for anyone to use, modify, and redistribute. How do you build a business around that?\n\nThe most popular model is open core. Your core product is open source, attracting a massive community of users. Enterprise features — authentication, audit logs, advanced analytics, support — are proprietary and paid. GitLab, Elastic, and Grafana all use this model.\n\nManaged services is the cloud-native approach. Running software is harder than writing it. Companies like Confluent with Kafka and MongoDB with Atlas offer fully managed cloud versions. You can run the open source version yourself, but most enterprises will happily pay for someone else to handle operations, scaling, backups, and security patches.\n\nDual licensing offers the code under both an open source license and a commercial license. If you're building a product that embeds the software, you need the commercial license. MySQL pioneered this approach, now owned by Oracle.\n\nSupport and services is the Red Hat model. The software is free. Enterprise-grade support, training, consulting, and certified distributions are paid. Red Hat generated billions in revenue before IBM acquired them.\n\nThe key insight across all models: open source is a distribution strategy, not a business model. It gets your software in front of millions of developers who become advocates within their organizations. The business model is what you build on top of that distribution.\n\nOne warning: your open source community is your most valuable asset. Mistreating it — restricting licenses, bait-and-switching features from open to proprietary — destroys trust and invites forks. Respect the community that built your distribution.\n\nBuild in the open. Monetize the value-add. Respect the community. That's the formula.`
        },
        // ── More Science ──
        {
            id: 'sci-climate-tech',
            title: 'Climate Technology: Solutions at Scale',
            host: 'Professor Lisa Nakamura',
            description: 'The technologies that could actually move the needle on climate change — from grid-scale batteries to direct air capture to sustainable aviation fuel.',
            category: 'science',
            emoji: '🌍',
            gradient: 'linear-gradient(135deg, #96fbc4, #f9f586)',
            duration: '9 min',
            script: `This is Quantum Clarity — today with a special episode on climate technology. I'm Professor Lisa Nakamura.\n\nClimate change is the defining challenge of our era. But unlike many global problems, this one has clear technical solutions. The question isn't whether we can solve it — it's whether we'll deploy solutions fast enough.\n\nLet's start with energy. Solar photovoltaic costs have dropped 99 percent since 1976. Wind power costs dropped 70 percent in the last decade. Renewable energy is now the cheapest source of new electricity generation in most of the world. This is no longer a technology problem — it's a deployment problem.\n\nThe bottleneck is storage. Solar produces power during the day; we need it at night. Wind is intermittent. Grid-scale batteries — primarily lithium iron phosphate — are scaling rapidly. But we also need long-duration storage: days to weeks. Iron-air batteries, compressed air, gravitational storage, and green hydrogen are all competing for this role.\n\nTransportation is electrifying rapidly. Electric vehicles reached 18 percent of global car sales in 2025. But cars are the easy part. Aviation and shipping are harder. Sustainable aviation fuel — produced from biological feedstocks or synthesized from captured carbon — is the leading solution for flights. For shipping, green ammonia and methanol are promising diesel replacements.\n\nDirect air capture — removing CO2 directly from the atmosphere — is the technology of last resort but increasingly necessary. Current costs are around 600 dollars per ton, but learning curves suggest this could reach 100 to 200 dollars per ton at scale.\n\nThe investment thesis is clear. Climate technology represents the largest market transition in human history — from a 5 trillion dollar per year fossil fuel economy to a renewable one. The companies that solve these problems will define the next industrial era.\n\nThe physics is clear. The technology exists. The economics are favorable. What we need is speed.\n\nThis has been a special edition of Quantum Clarity. Act now.`
        },
        // ── More Education ──
        {
            id: 'edu-open-source-learning',
            title: 'Learning to Code in 2026: A Roadmap',
            host: 'Jake Morrison',
            description: 'A practical, no-nonsense guide for beginners who want to go from zero to job-ready developer in the AI-assisted coding era.',
            category: 'education',
            emoji: '🗺️',
            gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
            duration: '8 min',
            script: `Jake Morrison here with AI Unplugged — but today we're going back to basics. If you're starting your coding journey in 2026, here's exactly how I'd approach it.\n\nFirst, ignore anyone who says AI will replace programmers. AI is the most powerful coding tool ever created. But tools amplify skill — they don't replace it. A person who understands programming fundamentals plus AI tools is ten times more productive than either alone.\n\nStart with one language. I recommend JavaScript or Python. JavaScript if you're drawn to web development and interactive applications. Python if you're interested in data science, AI, and automation. Both are excellent first languages with massive ecosystems.\n\nSpend weeks one through four on fundamentals: variables, functions, loops, conditionals, data structures. Don't use AI assistance during this phase. You need to build intuition for how programs think. Write bad code. Make mistakes. Debug by hand.\n\nWeeks five through eight: build projects. Not tutorials — projects. Build something you actually want to use. A personal website, a budget tracker, a bookmark manager. The struggle of starting from a blank file is where real learning happens.\n\nWeeks nine through twelve: introduce AI tools. GitHub Copilot, Cursor, or similar. Now that you understand the fundamentals, AI becomes a multiplier. It generates boilerplate, suggests implementations, explains errors. But you always review what it produces because you understand the code.\n\nContinuous learning: read other people's code on GitHub. Contribute to open source. Build in public — share your projects, write about what you're learning.\n\nThe most important skill in 2026 isn't any specific language or framework. It's the ability to learn quickly, think systematically, and communicate clearly. Code is just the medium.\n\nGood luck. The journey is worth it.`
        },
        // ── More Creative ──
        {
            id: 'creative-music-ai',
            title: 'AI and Music: Collaboration or Replacement?',
            host: 'Elena Vasquez',
            description: 'How AI music generation tools are changing composition, production, and the very definition of musical creativity.',
            category: 'creative',
            emoji: '🎵',
            gradient: 'linear-gradient(135deg, #f5af19, #f12711)',
            duration: '7 min',
            script: `Narrative Lab — special music edition. I'm Elena Vasquez.\n\nAI can now generate music that is indistinguishable from human compositions. Suno, Udio, and Google's MusicLM can produce full songs — lyrics, vocals, instrumentation, production — from a text prompt. Type "upbeat jazz piano with walking bass" and you get exactly that in seconds.\n\nThis raises profound questions. Is AI-generated music art? Who owns it? And what happens to human musicians?\n\nLet's separate the hype from reality. AI music tools are extraordinary for specific use cases: background music for videos, prototype melodies for songwriters, practice tracks for musicians, and accessibility — giving people with no musical training the ability to create.\n\nBut music is more than organized sound. It's emotional expression, cultural identity, shared experience. A song that moves you isn't just technically proficient — it carries the weight of a human life, a specific struggle, an authentic emotion.\n\nThe best analogy is photography. When cameras appeared, painters feared obsolescence. Instead, photography freed painting from representation, enabling impressionism, abstraction, and modern art. Painting didn't die — it evolved.\n\nSimilarly, AI won't replace musicians — it will change what we value in music. Technical virtuosity becomes less important when AI can play any passage perfectly. What becomes more valuable is authenticity, emotional truth, live performance, and the irreplaceable human story behind a song.\n\nMy prediction: AI becomes the most powerful instrument ever created. Like synthesizers, drum machines, and auto-tune before it, AI will birth entirely new genres and forms of expression. The musicians who embrace these tools while maintaining their artistic vision will create work we can't yet imagine.\n\nCreate fearlessly. The tools don't make the art — you do.`
        },
        // ── Multi-Speaker Conversations ──
        {
            id: 'conv-ai-debate',
            title: 'The Great AI Debate: Will AI Replace Developers?',
            host: 'Sarah Chen & Marcus Rivera',
            description: 'A lively two-host debate on whether AI coding assistants will replace software developers or become their most powerful tool.',
            category: 'ai',
            emoji: '🎙️',
            gradient: 'linear-gradient(135deg, #667eea, #f093fb)',
            duration: '10 min',
            speakers: { 'Sarah': 'af_bella', 'Marcus': 'am_adam' },
            script: `[Sarah] Welcome to Tech Forward Debates. I'm Sarah Chen, and today I'm joined by my co-host Marcus Rivera for a debate that's been raging across the industry. Marcus, the question is simple: will AI replace software developers?\n\n[Marcus] Thanks Sarah. And I'll take the provocative position here — I think within ten years, the vast majority of code will be written by AI, not humans. The trajectory is undeniable.\n\n[Sarah] Bold claim. Let's unpack it. What evidence are you seeing?\n\n[Marcus] Look at the benchmarks. In 2023, AI coding assistants could handle maybe 30 percent of coding tasks autonomously. By 2025, that jumped to over 60 percent on standard benchmarks. GitHub Copilot is already generating nearly 50 percent of code in files where it's active. And these tools are improving at a staggering rate.\n\n[Sarah] But benchmarks aren't reality. I've used these tools extensively, and they're fantastic for boilerplate and pattern matching. But ask them to architect a complex distributed system with specific performance constraints? They struggle. They hallucinate APIs that don't exist. They generate plausible but subtly wrong code.\n\n[Marcus] Fair point — today. But you're comparing current AI to the final form. That's like judging the automobile industry in 1905. The Model T was unreliable and slow, but within 20 years it transformed transportation. AI coding tools are in their Model T phase.\n\n[Sarah] Here's where I disagree fundamentally. Coding isn't just typing code — it's understanding requirements, making architectural decisions, navigating organizational politics, communicating with stakeholders, and maintaining systems over years. AI can accelerate the typing part, but that was never the bottleneck.\n\n[Marcus] I'd argue AI is already moving beyond just code generation. Agents can now read documentation, understand codebases, plan multi-step implementations, and even debug their own errors. Devin, Copilot Workspace — these are early but they're doing exactly what you described.\n\n[Sarah] Early and unreliable. Studies show AI agents complete complex software engineering tasks successfully about 15 to 25 percent of the time. In enterprise environments with legacy code, custom frameworks, and undocumented tribal knowledge? Even lower. We're decades away from AI that can replace an experienced staff engineer.\n\n[Marcus] I'll concede the timeline might be longer than ten years for complete replacement. But here's the economic argument: you don't need to replace developers entirely. If AI makes each developer three to five times more productive, companies need fewer developers. The demand for junior developers is already showing signs of declining.\n\n[Sarah] And that's the nuance people miss. AI won't eliminate development — it will change what developers do. Just like spreadsheets didn't eliminate accountants, they elevated the profession. Developers will spend less time on implementation details and more time on system design, user experience, and solving novel problems.\n\n[Marcus] So we actually agree more than we disagree. AI transforms the role rather than eliminating it.\n\n[Sarah] Exactly. My prediction: in ten years, every developer uses AI constantly, the average developer is far more productive, and the best developers are those who are excellent at directing AI — not those who memorize syntax. The profession evolves, but it survives.\n\n[Marcus] I'll buy that. And I'll add: the developers who refuse to adopt AI tools will be at a serious competitive disadvantage. Adaptation isn't optional.\n\n[Sarah] On that we completely agree. Thanks for the debate, Marcus. Listeners, what do you think? The future is being written — by humans and AI together.\n\n[Marcus] Until next time. Stay sharp, stay curious.`
        },
        {
            id: 'conv-startup-interview',
            title: 'Founder Stories: From Side Project to Series A',
            host: 'Hannah Lee & Chris Walker',
            description: 'Hannah interviews serial entrepreneur Chris Walker about the unglamorous reality of turning a weekend project into a funded startup.',
            category: 'business',
            emoji: '💬',
            gradient: 'linear-gradient(135deg, #f6d365, #66a6ff)',
            duration: '9 min',
            speakers: { 'Hannah': 'af_nova', 'Chris': 'am_eric' },
            script: `[Hannah] Welcome to Work Evolved. I'm Hannah Lee, and today I have a special guest — Chris Walker, founder of three companies and host of Startup Realities. Chris, thanks for coming on.\n\n[Chris] Thanks Hannah. Always good to be here. Though I should warn your listeners — my startup stories are more cautionary tales than success stories.\n\n[Hannah] That's exactly what makes them valuable. Let's start at the beginning. Your first company. What was the idea?\n\n[Chris] A social network for pet owners. I know, I know. It was 2014, everyone was building social networks. We called it PawPals. My co-founder and I built the MVP in three weeks while working our day jobs.\n\n[Hannah] Three weeks. That's fast. What happened?\n\n[Chris] We launched, got some traction — about five thousand users in the first month. The problem was engagement. People would sign up, post a photo of their dog, and then never come back. We had an acquisition problem disguised as a retention problem.\n\n[Hannah] What do you mean by that?\n\n[Chris] We thought we needed more users. So we spent months and most of our savings on marketing. What we actually needed was a reason for users to come back daily. A social network needs daily utility — like Facebook had the news feed, Instagram had the photo filter. We had nothing sticky.\n\n[Hannah] Looking back, what would you do differently?\n\n[Chris] Everything. I'd skip the social network entirely. But if I had to do it, I'd focus obsessively on daily active users before even thinking about growth. Two hundred daily active users who love your product is infinitely more valuable than fifty thousand signups who never return.\n\n[Hannah] Great insight. So PawPals didn't work out. What came next?\n\n[Chris] After licking my wounds for a few months, I started a developer tools company. A code review platform for small teams. This one was different — I actually talked to potential customers first.\n\n[Hannah] Novel concept for a founder!\n\n[Chris] You'd be amazed how many founders skip that step. I spent two months doing customer discovery — literally calling engineering managers and asking them about their code review process. The pain was real and specific. We built exactly what they described.\n\n[Hannah] And this one got funded?\n\n[Chris] Eventually. We bootstrapped for eight months, got to thirty thousand in monthly recurring revenue, and then raised a seed round. But here's the ugly truth nobody tells you — raising money didn't make my life easier. It made it harder.\n\n[Hannah] How so?\n\n[Chris] Suddenly I had a board. I had investors expecting quarterly updates and hockey-stick growth. The pressure to grow fast pushed us to hire too quickly. We went from five people who worked beautifully together to twenty people with communication problems, cultural clashes, and a burn rate that kept me up at night.\n\n[Hannah] What happened to that company?\n\n[Chris] We were acqui-hired by a bigger dev tools company. My investors got their money back, barely. My team got jobs. I got a two-year earn-out that felt like a prison sentence. Financially it was a wash. Emotionally, it was devastating.\n\n[Hannah] And yet you started a third company. What made you go back?\n\n[Chris] Honestly? I tried working a normal job for six months. I was miserable. The thing about being a founder — once you've experienced building something from nothing, working within someone else's vision feels suffocating. So I started again, but with completely different rules.\n\n[Hannah] What rules?\n\n[Chris] No venture capital. No co-founders this time. Profitability from day one. I chose a boring business — a SaaS tool for managing content calendars. Not sexy, but profitable. I kept costs near zero, used offshore contractors carefully, and focused on one metric: monthly recurring revenue.\n\n[Hannah] And where is that company today?\n\n[Chris] Profitable, growing steadily, and completely mine. No board meetings, no growth-at-all-costs pressure. I make more money than I did at any of my previous companies, and I work thirty-five hours a week. It took five years to get here, but it was worth every painful lesson along the way.\n\n[Hannah] That's a beautiful arc. Any final advice for aspiring founders?\n\n[Chris] Three things. First — talk to customers before writing any code. Second — profitability is a choice, not a milestone you achieve after scale. And third — the best startup strategy is building something you'd be happy running for ten years, not something you're hoping to exit in three.\n\n[Hannah] Chris Walker, thank you for the honesty. This has been Work Evolved.\n\n[Chris] Thanks Hannah. Go build something that matters.`
        },
        {
            id: 'conv-science-explained',
            title: 'Ask a Scientist: Quantum Entanglement Explained',
            host: 'Jake Morrison & Prof. Nakamura',
            description: 'Tech journalist Jake Morrison asks physicist Professor Nakamura to explain quantum entanglement in plain English — and she actually succeeds.',
            category: 'science',
            emoji: '🔬',
            gradient: 'linear-gradient(135deg, #43e97b, #a18cd1)',
            duration: '8 min',
            speakers: { 'Jake': 'am_puck', 'Professor': 'bf_emma' },
            script: `[Jake] Hey everyone, Jake Morrison here with a special crossover episode. I'm joined by Professor Lisa Nakamura from Quantum Clarity. Professor, I've been asked to understand quantum entanglement, and every explanation I've read makes me more confused. Help me.\n\n[Professor] Thank you Jake. And I promise — no equations. Let's start with what entanglement is not, because the popular descriptions are almost all wrong.\n\n[Jake] Please. Because I keep hearing "spooky action at a distance" and then my brain shuts off.\n\n[Professor] Einstein called it that because he thought it was impossible. But here's the simplest way to think about it. Imagine you have two coins that have been specially prepared. You flip them separately — one in Tokyo, one in New York. And every single time, if one lands heads, the other lands tails. Every time. Without fail. No matter the distance.\n\n[Jake] Okay, so they're connected somehow. Like they're communicating?\n\n[Professor] That's exactly what Einstein thought — and that's the wrong intuition. They're not communicating. There are no signals traveling between them. Instead, they were prepared together in a way that their outcomes are correlated. The correlation was established when they were together, not when they were measured.\n\n[Jake] So it's more like... if I put one red ball and one blue ball in two boxes, shuffle them, and send one box to Tokyo and one to New York. When I open my box and see red, I instantly know the other is blue. No spooky action required.\n\n[Professor] Excellent analogy! And that's actually what Einstein argued — he said entanglement is just like your colored balls. The properties were determined all along, we just didn't know which box had which ball. This is called a "hidden variables" theory.\n\n[Jake] But I'm guessing he was wrong?\n\n[Professor] He was. And this is where it gets genuinely strange. In 1964, physicist John Bell devised a test — now called Bell's theorem — that can distinguish between Einstein's hidden variables and true quantum entanglement. The test has been performed thousands of times, and quantum mechanics wins every time.\n\n[Jake] What's the difference between the colored balls and real entanglement?\n\n[Professor] With colored balls, the colors are fixed before you look — you just don't know which is which. With quantum particles, the properties genuinely don't exist until you measure them. It's not that we don't know the answer — the answer literally doesn't exist yet. The act of measurement creates the result.\n\n[Jake] Wait. So before I measure, the particle is... what? Both things at once?\n\n[Professor] In a sense, yes. It's in a superposition — a combination of all possible states. When you measure one entangled particle and it "chooses" a state, the other particle's state is instantly determined. Not because a signal was sent, but because they're part of a single quantum system that spans any distance.\n\n[Jake] My brain hurts, but in a good way. What's this actually useful for?\n\n[Professor] Three major applications. Quantum cryptography — you can use entanglement to create encryption keys that are physically impossible to intercept without detection. Quantum computing — entanglement between qubits is what gives quantum computers their exponential power. And quantum teleportation — not teleporting matter, but teleporting the quantum state of a particle to a distant location.\n\n[Jake] Quantum teleportation is real?\n\n[Professor] Very real. It's been demonstrated over distances of thousands of kilometers using satellites. China's Micius satellite teleported quantum states between ground stations over twelve hundred kilometers apart. But I must emphasize — it teleports information, not matter. No one is beaming up to the Enterprise anytime soon.\n\n[Jake] Professor Nakamura, thank you. I think I actually understand entanglement now. Or at least I understand that I can't fully understand it, which might be the same thing.\n\n[Professor] That's the right attitude, Jake. As Richard Feynman said — if you think you understand quantum mechanics, you don't understand quantum mechanics. But you can use it, and that's what matters.\n\n[Jake] Beautifully said. This has been a special crossover of AI Unplugged and Quantum Clarity. Until next time, folks.`
        },
    ];

    // ── Category metadata ────────────────────────
    const CATEGORIES = [
        { id: 'all', label: 'All', icon: 'bi-grid-3x3-gap' },
        { id: 'tech', label: 'Tech', icon: 'bi-cpu' },
        { id: 'ai', label: 'AI & ML', icon: 'bi-robot' },
        { id: 'science', label: 'Science', icon: 'bi-atom' },
        { id: 'business', label: 'Business', icon: 'bi-briefcase' },
        { id: 'creative', label: 'Creative', icon: 'bi-brush' },
        { id: 'education', label: 'Education', icon: 'bi-mortarboard' },
    ];

    // ── State ────────────────────────────────────
    let overlayEl = null;
    let currentCategory = 'all';
    let searchQuery = '';
    let favorites = new Set(JSON.parse(localStorage.getItem('podcast-favorites') || '[]'));
    let currentPodcast = null;
    let isPlaying = false;
    let audioElement = null;
    let playbackSpeed = 1;
    const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

    // ── Helpers ──────────────────────────────────
    function esc(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function saveFavorites() {
        localStorage.setItem('podcast-favorites', JSON.stringify([...favorites]));
    }

    /**
     * Parse a script with [SpeakerName] markers into segments.
     * Returns array of { speaker, voice, text } objects.
     * If no speakers map provided or no markers found, returns null (single-speaker mode).
     */
    function parseMultiSpeakerScript(script, speakersMap) {
        if (!speakersMap || Object.keys(speakersMap).length === 0) return null;

        // Match [SpeakerName] at start of lines or after paragraph breaks
        const segments = [];
        const regex = /\[([^\]]+)\]\s*/g;
        let lastIdx = 0;
        let lastSpeaker = null;
        let match;

        while ((match = regex.exec(script)) !== null) {
            // If there's text before this marker from the previous speaker, save it
            if (lastSpeaker !== null && match.index > lastIdx) {
                const text = script.substring(lastIdx, match.index).trim();
                if (text) {
                    segments.push({
                        speaker: lastSpeaker,
                        voice: speakersMap[lastSpeaker] || 'af_bella',
                        text: text
                    });
                }
            }
            lastSpeaker = match[1];
            lastIdx = match.index + match[0].length;
        }

        // Capture remaining text after last marker
        if (lastSpeaker !== null && lastIdx < script.length) {
            const text = script.substring(lastIdx).trim();
            if (text) {
                segments.push({
                    speaker: lastSpeaker,
                    voice: speakersMap[lastSpeaker] || 'af_bella',
                    text: text
                });
            }
        }

        return segments.length > 0 ? segments : null;
    }

    function filteredPodcasts() {
        return PODCAST_CATALOG.filter(p => {
            const catOk = currentCategory === 'all' || p.category === currentCategory;
            if (!catOk) return false;
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return p.title.toLowerCase().includes(q)
                || p.host.toLowerCase().includes(q)
                || p.description.toLowerCase().includes(q)
                || p.category.toLowerCase().includes(q);
        });
    }

    // ── Build UI ─────────────────────────────────
    function buildOverlay() {
        if (overlayEl) return;
        overlayEl = document.createElement('div');
        overlayEl.id = 'podcast-overlay';
        overlayEl.className = 'podcast-overlay';
        overlayEl.innerHTML = buildHTML();
        document.body.appendChild(overlayEl);
        wireEvents();
        renderCards();
    }

    function buildHTML() {
        const catChips = CATEGORIES.map(c =>
            `<button class="podcast-cat-chip${c.id === 'all' ? ' active' : ''}" data-cat="${c.id}"><i class="bi ${c.icon}"></i> ${c.label}</button>`
        ).join('');

        return `
        <div class="podcast-panel">
            <!-- Hero -->
            <div class="podcast-hero">
                <div class="podcast-hero-content">
                    <div class="podcast-hero-left">
                        <div class="podcast-hero-icon">🎙️</div>
                        <div>
                            <h2>Podcast Marketplace</h2>
                            <div class="podcast-hero-sub">${PODCAST_CATALOG.length} episodes · Generated with AI</div>
                        </div>
                    </div>
                    <button class="podcast-close-btn" id="podcast-close" title="Close"><i class="bi bi-x-lg"></i></button>
                </div>
            </div>

            <!-- Search -->
            <div class="podcast-search-bar">
                <i class="bi bi-search podcast-search-icon"></i>
                <input type="text" id="podcast-search" placeholder="Search podcasts, topics, hosts..." autocomplete="off" />
            </div>

            <!-- Categories -->
            <div class="podcast-categories" id="podcast-categories">${catChips}</div>

            <!-- Scrollable Content -->
            <div class="podcast-scroll" id="podcast-scroll">
                <!-- Create From Markdown -->
                <div class="podcast-create-bar" id="podcast-create-btn" title="Generate a podcast from your current markdown document">
                    <span class="podcast-create-icon">✨</span>
                    <div>
                        <div class="podcast-create-text">Create Podcast from Markdown</div>
                        <div class="podcast-create-hint">Convert your document to audio using AI Text-to-Speech</div>
                    </div>
                </div>

                <!-- Featured -->
                <div class="podcast-section-title" id="podcast-section-label">🔥 All Podcasts</div>
                <div class="podcast-grid" id="podcast-grid"></div>
                <div class="podcast-empty" id="podcast-empty">
                    <i class="bi bi-search"></i>
                    <div class="podcast-empty-text">No podcasts match your search</div>
                </div>
            </div>

            <!-- Sticky Player -->
            <div class="podcast-player" id="podcast-player">
                <div class="podcast-player-info">
                    <div class="podcast-player-cover" id="podcast-player-cover"></div>
                    <div class="podcast-player-meta">
                        <div class="podcast-player-title" id="podcast-player-title">—</div>
                        <div class="podcast-player-host" id="podcast-player-host">—</div>
                    </div>
                </div>
                <div class="podcast-player-controls">
                    <button class="podcast-ctrl-btn" id="podcast-back-15" title="Back 15s"><i class="bi bi-skip-start-fill"></i></button>
                    <button class="podcast-ctrl-btn play-main" id="podcast-play-btn" title="Play/Pause"><i class="bi bi-play-fill"></i></button>
                    <button class="podcast-ctrl-btn" id="podcast-fwd-15" title="Forward 15s"><i class="bi bi-skip-end-fill"></i></button>
                </div>
                <div class="podcast-player-progress">
                    <span class="podcast-progress-time" id="podcast-time-current">0:00</span>
                    <div class="podcast-progress-track" id="podcast-progress-track">
                        <div class="podcast-progress-fill" id="podcast-progress-fill"></div>
                        <div class="podcast-progress-thumb" id="podcast-progress-thumb"></div>
                    </div>
                    <span class="podcast-progress-time" id="podcast-time-total">0:00</span>
                </div>
                <div class="podcast-player-right">
                    <button class="podcast-speed-btn" id="podcast-speed-btn" title="Playback speed">1x</button>
                    <button class="podcast-ctrl-btn" id="podcast-vol-btn" title="Volume"><i class="bi bi-volume-up-fill"></i></button>
                    <input type="range" class="podcast-vol-slider" id="podcast-vol-slider" min="0" max="100" value="100" title="Volume">
                    <button class="podcast-ctrl-btn" id="podcast-transcript-btn" title="Insert transcript into editor"><i class="bi bi-file-earmark-text"></i></button>
                </div>
            </div>

            <!-- Generating Overlay -->
            <div class="podcast-generating" id="podcast-generating">
                <div class="podcast-generating-spinner"></div>
                <div class="podcast-generating-text" id="podcast-generating-text">Generating audio...</div>
            </div>
        </div>`;
    }

    // ── Render Cards ─────────────────────────────
    function renderCards() {
        const grid = overlayEl.querySelector('#podcast-grid');
        const empty = overlayEl.querySelector('#podcast-empty');
        const label = overlayEl.querySelector('#podcast-section-label');
        const pods = filteredPodcasts();

        if (pods.length === 0) {
            grid.style.display = 'none';
            empty.style.display = 'flex';
            return;
        }
        grid.style.display = 'grid';
        empty.style.display = 'none';

        const catLabel = currentCategory === 'all' ? 'All Podcasts' : CATEGORIES.find(c => c.id === currentCategory)?.label || 'Podcasts';
        label.textContent = (searchQuery ? '🔍 ' : '🔥 ') + catLabel + ` (${pods.length})`;

        grid.innerHTML = pods.map(p => {
            const isFav = favorites.has(p.id);
            const isNP = currentPodcast && currentPodcast.id === p.id;
            return `
            <div class="podcast-card${isNP ? ' now-playing' : ''}" data-id="${p.id}">
                <button class="podcast-card-fav${isFav ? ' faved' : ''}" data-fav="${p.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                    <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
                </button>
                <div class="podcast-card-cover">
                    <div class="podcast-card-cover-gradient" style="background: ${p.gradient}"></div>
                    <span class="podcast-card-cover-emoji">${p.emoji}</span>
                    <div class="podcast-card-play-overlay">
                        <button class="podcast-card-play-btn" data-play="${p.id}">▶</button>
                    </div>
                </div>
                <div class="podcast-card-body">
                    <div class="podcast-card-title">${esc(p.title)}</div>
                    <div class="podcast-card-host">${esc(p.host)}${isNP && isPlaying ? ' <span class="podcast-wave"><span class="podcast-wave-bar"></span><span class="podcast-wave-bar"></span><span class="podcast-wave-bar"></span><span class="podcast-wave-bar"></span><span class="podcast-wave-bar"></span></span>' : ''}</div>
                    <div class="podcast-card-desc">${esc(p.description)}</div>
                    <div class="podcast-card-meta">
                        <span class="podcast-card-badge">${p.category}</span>${p.speakers ? ' <span class="podcast-card-badge multi-speaker">🎙 Multi-Speaker</span>' : ''}
                        <span class="podcast-card-duration"><i class="bi bi-clock"></i> ${p.duration}</span>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    // ── Wire Events ──────────────────────────────
    function wireEvents() {
        // Close
        overlayEl.querySelector('#podcast-close').addEventListener('click', closeMarketplace);
        overlayEl.addEventListener('click', e => { if (e.target === overlayEl) closeMarketplace(); });
        document.addEventListener('keydown', function podEsc(e) {
            if (e.key === 'Escape' && overlayEl && overlayEl.classList.contains('active')) {
                closeMarketplace();
            }
        });

        // Search
        overlayEl.querySelector('#podcast-search').addEventListener('input', e => {
            searchQuery = e.target.value.trim();
            renderCards();
        });

        // Category chips
        overlayEl.querySelector('#podcast-categories').addEventListener('click', e => {
            const chip = e.target.closest('.podcast-cat-chip');
            if (!chip) return;
            currentCategory = chip.dataset.cat;
            overlayEl.querySelectorAll('.podcast-cat-chip').forEach(b => b.classList.toggle('active', b.dataset.cat === currentCategory));
            renderCards();
        });

        // Card clicks (event delegation)
        overlayEl.querySelector('#podcast-grid').addEventListener('click', e => {
            // Favorite button
            const favBtn = e.target.closest('[data-fav]');
            if (favBtn) {
                e.stopPropagation();
                const id = favBtn.dataset.fav;
                if (favorites.has(id)) { favorites.delete(id); } else { favorites.add(id); }
                saveFavorites();
                renderCards();
                return;
            }
            // Play button or card
            const card = e.target.closest('.podcast-card');
            if (card) {
                const id = card.dataset.id;
                const podcast = PODCAST_CATALOG.find(p => p.id === id);
                if (podcast) playPodcast(podcast);
            }
        });

        // Player controls
        overlayEl.querySelector('#podcast-play-btn').addEventListener('click', togglePlayPause);
        overlayEl.querySelector('#podcast-back-15').addEventListener('click', () => seekRelative(-15));
        overlayEl.querySelector('#podcast-fwd-15').addEventListener('click', () => seekRelative(15));
        overlayEl.querySelector('#podcast-speed-btn').addEventListener('click', cycleSpeed);
        overlayEl.querySelector('#podcast-vol-slider').addEventListener('input', e => {
            if (audioElement) audioElement.volume = e.target.value / 100;
        });
        overlayEl.querySelector('#podcast-vol-btn').addEventListener('click', () => {
            const slider = overlayEl.querySelector('#podcast-vol-slider');
            if (audioElement) {
                audioElement.muted = !audioElement.muted;
                overlayEl.querySelector('#podcast-vol-btn i').className = audioElement.muted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill';
            }
        });
        overlayEl.querySelector('#podcast-transcript-btn').addEventListener('click', insertTranscript);

        // Progress bar seek
        overlayEl.querySelector('#podcast-progress-track').addEventListener('click', e => {
            if (!audioElement || !audioElement.duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audioElement.currentTime = ratio * audioElement.duration;
        });

        // Create from markdown
        overlayEl.querySelector('#podcast-create-btn').addEventListener('click', createFromMarkdown);
    }

    // ── Audio Playback ───────────────────────────
    function playPodcast(podcast) {
        currentPodcast = podcast;
        isPlaying = false;

        // Update player UI
        const player = overlayEl.querySelector('#podcast-player');
        player.classList.add('active');
        overlayEl.querySelector('#podcast-player-title').textContent = podcast.title;
        overlayEl.querySelector('#podcast-player-host').textContent = podcast.host;
        overlayEl.querySelector('#podcast-player-cover').innerHTML = `<div style="width:100%;height:100%;background:${podcast.gradient};display:flex;align-items:center;justify-content:center;font-size:1.4rem">${podcast.emoji}</div>`;

        renderCards(); // update now-playing state

        // Generate audio from script using TTS
        generateAndPlay(podcast.script, podcast.speakers);
    }

    function generateAndPlay(text, speakersMap) {
        const genOverlay = overlayEl.querySelector('#podcast-generating');
        const genText = overlayEl.querySelector('#podcast-generating-text');

        // Stop any currently playing audio first
        if (M.tts) M.tts.stop();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();

        // ── Check for multi-speaker script ──
        const multiSegments = parseMultiSpeakerScript(text, speakersMap);
        const isMultiSpeaker = multiSegments && multiSegments.length > 1;

        if (isMultiSpeaker) {
            console.log(`[Podcast] 🎙 Multi-speaker mode — ${multiSegments.length} segments, voices: ${[...new Set(multiSegments.map(s => s.voice))].join(', ')}`);
        }

        // ── Strategy: Use M.tts.speak() or M.tts.speakMulti() ──
        if (M.tts) {
            genOverlay.classList.add('active');

            if (M.tts.isKokoroReady()) {
                genText.textContent = isMultiSpeaker
                    ? `⏳ Synthesizing ${multiSegments.length} speaker segments...`
                    : '⏳ Synthesizing with Kokoro TTS...';
            } else {
                genText.textContent = '⬇ Loading Kokoro TTS model (first time only)...';
            }

            // Dispatch to single or multi-speaker synthesis
            if (isMultiSpeaker && M.tts.speakMulti) {
                M.tts.speakMulti(multiSegments);
            } else {
                // Single speaker — strip [Speaker] markers if present
                const cleanText = text.replace(/\[([^\]]+)\]\s*/g, '');
                M.tts.speak(cleanText, null, 'en');
            }

            // Poll for playback to start (model load + synthesis), then dismiss overlay
            let pollCount = 0;
            const maxPolls = 300; // 150 seconds max wait
            const pollId = setInterval(() => {
                pollCount++;
                // Update status text as model loads
                if (!M.tts.isKokoroReady() && M.tts.isKokoroLoading()) {
                    genText.textContent = '⬇ Downloading Kokoro TTS model...';
                } else if (M.tts.isKokoroReady() && M.tts.isGenerating()) {
                    genText.textContent = isMultiSpeaker
                        ? `🎙 Synthesizing conversation...`
                        : '⏳ Synthesizing audio...';
                }

                // Check if audio started playing
                if (M.tts.isSpeaking()) {
                    clearInterval(pollId);
                    genOverlay.classList.remove('active');
                    isPlaying = true;
                    updatePlayButton();
                    renderCards();

                    // Estimate duration from word count (~2.8 words/sec for natural speech)
                    const wordCount = text.replace(/\[[^\]]+\]/g, '').split(/\s+/).length;
                    const estimatedDuration = wordCount / 2.8;
                    startProgressTracking(estimatedDuration);

                    // Monitor for playback end
                    monitorPlaybackEnd();
                    return;
                }

                // Timeout — fall back to enhanced Web Speech
                if (pollCount >= maxPolls) {
                    clearInterval(pollId);
                    genOverlay.classList.remove('active');
                    console.warn('[Podcast] Kokoro TTS timed out — falling back to Web Speech');
                    const cleanText = text.replace(/\[([^\]]+)\]\s*/g, '');
                    fallbackWebSpeech(cleanText);
                }
            }, 500);
        } else {
            // No TTS module at all — direct Web Speech fallback
            const cleanText = text.replace(/\[([^\]]+)\]\s*/g, '');
            fallbackWebSpeech(cleanText);
        }
    }

    function monitorPlaybackEnd() {
        // Poll for when TTS stops speaking → update UI
        const endPoll = setInterval(() => {
            if (!M.tts || !M.tts.isSpeaking()) {
                clearInterval(endPoll);
                isPlaying = false;
                updatePlayButton();
                renderCards();
            }
        }, 500);
    }

    function fallbackWebSpeech(text) {
        // Use Web Speech API as a fallback — select highest quality voice available
        if (!('speechSynthesis' in window)) {
            if (M.showToast) M.showToast('⚠️ No TTS engine available', 'error');
            return;
        }
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = playbackSpeed * 0.85; // Slightly slower for podcast feel
        utterance.pitch = 1.0;

        // Try to find the best-quality English voice
        const voices = window.speechSynthesis.getVoices();
        // Prefer voices with "Premium", "Enhanced", "Natural", or "Neural" in name
        const premiumVoice = voices.find(v =>
            v.lang.startsWith('en') && /premium|enhanced|natural|neural|samantha|daniel|karen|google/i.test(v.name)
        );
        const anyEnglishVoice = voices.find(v => v.lang.startsWith('en'));
        if (premiumVoice) {
            utterance.voice = premiumVoice;
            console.log(`[Podcast] Web Speech: using premium voice "${premiumVoice.name}"`);
        } else if (anyEnglishVoice) {
            utterance.voice = anyEnglishVoice;
            console.log(`[Podcast] Web Speech: using voice "${anyEnglishVoice.name}"`);
        }

        utterance.onend = () => {
            isPlaying = false;
            updatePlayButton();
            renderCards();
        };

        window.speechSynthesis.speak(utterance);
        isPlaying = true;
        updatePlayButton();
        renderCards();

        // Estimate duration for progress
        const estimatedDuration = text.split(/\s+/).length / 2.5; // ~2.5 words/sec
        startProgressTracking(estimatedDuration);
    }

    function startProgressTracking(duration) {
        const fill = overlayEl.querySelector('#podcast-progress-fill');
        const thumb = overlayEl.querySelector('#podcast-progress-thumb');
        const timeCurrent = overlayEl.querySelector('#podcast-time-current');
        const timeTotal = overlayEl.querySelector('#podcast-time-total');

        timeTotal.textContent = formatTime(duration);
        let startTime = Date.now();
        let paused = false;

        function update() {
            if (!isPlaying && !paused) return;
            const elapsed = (Date.now() - startTime) / 1000;
            const ratio = Math.min(1, elapsed / duration);
            fill.style.width = (ratio * 100) + '%';
            thumb.style.left = (ratio * 100) + '%';
            timeCurrent.textContent = formatTime(elapsed);

            if (ratio < 1 && isPlaying) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    function togglePlayPause() {
        if (!currentPodcast) return;

        if (isPlaying) {
            // Pause — stop all audio sources
            if (M.tts && M.tts.isSpeaking()) M.tts.stop();
            if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
                window.speechSynthesis.pause();
            }
            isPlaying = false;
        } else {
            // Resume
            if ('speechSynthesis' in window && window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
                isPlaying = true;
            } else if (currentPodcast && M.tts && M.tts.hasAudio()) {
                // Replay last Kokoro audio without re-synthesizing
                M.tts.playLastAudio();
                isPlaying = true;
                monitorPlaybackEnd();
            } else if (currentPodcast) {
                // Re-generate from scratch
                generateAndPlay(currentPodcast.script);
                return;
            }
        }
        updatePlayButton();
        renderCards();
    }

    function updatePlayButton() {
        const btn = overlayEl.querySelector('#podcast-play-btn i');
        if (btn) btn.className = isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill';
    }

    function seekRelative(seconds) {
        // For Web Speech, we can't seek, so just show a toast
        if (M.showToast) M.showToast(seconds > 0 ? '⏩ +15s' : '⏪ -15s', 'info');
    }

    function cycleSpeed() {
        const idx = SPEED_OPTIONS.indexOf(playbackSpeed);
        playbackSpeed = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
        overlayEl.querySelector('#podcast-speed-btn').textContent = playbackSpeed + 'x';
        if (audioElement) audioElement.playbackRate = playbackSpeed;
    }

    function insertTranscript() {
        if (!currentPodcast) return;
        const editor = M.markdownEditor;
        if (!editor) return;

        const transcript = `# 🎙️ ${currentPodcast.title}\n\n**Host:** ${currentPodcast.host}  \n**Category:** ${currentPodcast.category}  \n**Duration:** ${currentPodcast.duration}\n\n---\n\n${currentPodcast.script}\n`;

        // Close overlay and insert
        closeMarketplace();
        const start = editor.selectionStart;
        const before = editor.value.substring(0, start);
        const after = editor.value.substring(editor.selectionEnd);
        editor.value = before + transcript + after;
        editor.selectionStart = editor.selectionEnd = start + transcript.length;
        editor.dispatchEvent(new Event('input'));
        if (M.renderMarkdown) M.renderMarkdown();
        if (M.showToast) M.showToast('📝 Transcript inserted', 'success');
    }

    // ── Create from Markdown ─────────────────────
    function createFromMarkdown() {
        const editor = M.markdownEditor;
        if (!editor || !editor.value.trim()) {
            if (M.showToast) M.showToast('⚠️ No markdown content to convert', 'warning');
            return;
        }

        // Extract plain text from markdown (strip formatting)
        let text = editor.value;
        text = text.replace(/^#{1,6}\s+/gm, '');       // headings
        text = text.replace(/\*\*(.+?)\*\*/g, '$1');    // bold
        text = text.replace(/\*(.+?)\*/g, '$1');         // italic
        text = text.replace(/`{1,3}[^`]*`{1,3}/g, '');  // code
        text = text.replace(/!\[.*?\]\(.*?\)/g, '');     // images
        text = text.replace(/\[(.+?)\]\(.*?\)/g, '$1');  // links
        text = text.replace(/^[-*+]\s+/gm, '');          // bullets
        text = text.replace(/^\d+\.\s+/gm, '');          // numbers
        text = text.replace(/^>\s+/gm, '');              // quotes
        text = text.replace(/---+/g, '');                 // rulers
        text = text.replace(/\|.+\|/g, '');              // tables
        text = text.replace(/\n{3,}/g, '\n\n');          // excess newlines
        text = text.trim();

        if (text.length < 20) {
            if (M.showToast) M.showToast('⚠️ Not enough text content to generate a podcast', 'warning');
            return;
        }

        // Create a virtual podcast from the document
        const title = (editor.value.match(/^#\s+(.+)/m) || ['', 'My Document'])[1].trim();
        const customPodcast = {
            id: 'custom-' + Date.now(),
            title: title,
            host: 'TextAgent',
            description: 'Generated from your markdown document',
            category: 'education',
            emoji: '📄',
            gradient: 'linear-gradient(135deg, #58a6ff, #8b5cf6)',
            duration: Math.ceil(text.split(/\s+/).length / 150) + ' min',
            script: text.substring(0, 5000) // Limit to ~5000 chars for TTS
        };

        currentPodcast = customPodcast;
        const player = overlayEl.querySelector('#podcast-player');
        player.classList.add('active');
        overlayEl.querySelector('#podcast-player-title').textContent = customPodcast.title;
        overlayEl.querySelector('#podcast-player-host').textContent = 'Generated from your document';
        overlayEl.querySelector('#podcast-player-cover').innerHTML = `<div style="width:100%;height:100%;background:${customPodcast.gradient};display:flex;align-items:center;justify-content:center;font-size:1.4rem">${customPodcast.emoji}</div>`;

        generateAndPlay(customPodcast.script);
    }

    // ── Utility ──────────────────────────────────
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    // ── Open / Close ─────────────────────────────
    function openMarketplace() {
        buildOverlay();
        overlayEl.classList.add('active');
        setTimeout(() => overlayEl.querySelector('#podcast-search')?.focus(), 200);
    }

    function closeMarketplace() {
        if (overlayEl) overlayEl.classList.remove('active');
    }

    // ── Public API ───────────────────────────────
    M.openPodcastMarketplace = openMarketplace;
    M.closePodcastMarketplace = closeMarketplace;

    // ── Wire toolbar buttons ─────────────────────
    function wireButton(id) {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => {
            if (M.closeMobileMenu) M.closeMobileMenu();
            openMarketplace();
        });
    }
    wireButton('podcast-btn');
    wireButton('mobile-podcast-btn');
    wireButton('qab-podcast');

    console.log('[TextAgent] 🎙️ Podcast Marketplace loaded (' + PODCAST_CATALOG.length + ' episodes)');

})(window.MDView);
