// ============================================
// quiz-docgen.js — {{Quiz:}} DocGen Tag
// Event-delegation approach (no inline onclick)
// Supports: MCQ, True/False, Match, Fill-in-blank,
//           Short Answer, Ordering, Essay, Likert, Hotspot
// ============================================
(function (M) {
    'use strict';

    // ─── Helpers ──────────────────────────────────────────────────────────────
    function escHtml(str) {
        return String(str || '')
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    function getFencedRanges(text) {
        var ranges = [], m;
        var re = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1\s*$/gm;
        while ((m = re.exec(text)) !== null) ranges.push({ s: m.index, e: m.index + m[0].length });
        var inl = /`([^`\n]+)`/g;
        while ((m = inl.exec(text)) !== null) ranges.push({ s: m.index, e: m.index + m[0].length });
        return ranges;
    }
    function inFence(pos, ranges) {
        for (var i = 0; i < ranges.length; i++) if (pos >= ranges[i].s && pos < ranges[i].e) return true;
        return false;
    }
    function shuffleArr(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    // ─── Quiz Syntax Skill — injected into AI prompt for accurate generation ──
    var QUIZ_SYNTAX_SKILL = 'SKILL — TextAgent Quiz Syntax Reference:\n'
        + 'You MUST output ONLY @question lines using the EXACT formats below.\n'
        + 'No markdown, no explanation, no numbering, no extra text.\n'
        + 'CRITICAL: Every line MUST start with @question[type]: (with a COLON after the bracket).\n\n'
        + 'QUESTION TYPES — copy the EXACT pipe structure:\n\n'
        + '1. MCQ — THREE pipe-separated fields: question | correct_answer | four_comma_options\n'
        + '   @question[mcq]: What is the capital of France? | Paris | London,Paris,Berlin,Madrid\n'
        + '   PIPE 1 = question text\n'
        + '   PIPE 2 = the single correct answer (a short string)\n'
        + '   PIPE 3 = four options separated by commas (MUST include the correct answer)\n\n'
        + '2. TRUE/FALSE — TWO pipe-separated fields: statement | true_or_false\n'
        + '   @question[tf]: The Earth orbits the Sun | true\n'
        + '   PIPE 1 = statement, PIPE 2 = the word true or false\n\n'
        + '3. FILL — TWO pipe-separated fields: sentence_with_blank | answer\n'
        + '   @question[fill]: Water boils at ___ degrees Celsius | 100\n'
        + '   PIPE 1 = sentence with ___ as the blank, PIPE 2 = correct answer\n\n'
        + '4. MATCH — TWO pipe-separated fields: pairs | instruction\n'
        + '   @question[match]: H2O=Water, NaCl=Salt, CO2=Carbon Dioxide | Match chemicals to names\n'
        + '   PIPE 1 = Left=Right pairs separated by commas, PIPE 2 = instruction text\n\n'
        + '5. ORDER — TWO pipe-separated fields: items_in_correct_order | instruction\n'
        + '   @question[order]: Mercury,Venus,Earth,Mars | Order planets from Sun\n'
        + '   PIPE 1 = items in CORRECT order (comma separated), PIPE 2 = instruction\n\n'
        + '6. SHORT — TWO pipe-separated fields: question | keywords\n'
        + '   @question[short]: What gas do plants absorb? | carbon dioxide,co2\n\n'
        + '7. ESSAY — ONE field only (no pipes):\n'
        + '   @question[essay]: Explain the process of photosynthesis in detail.\n\n'
        + '8. LIKERT — ONE field only (no pipes):\n'
        + '   @question[likert]: I found this topic easy to understand\n\n'
        + 'CRITICAL RULES:\n'
        + '- ALWAYS include the COLON after the bracket: @question[mcq]: not @question[mcq]\n'
        + '- For mcq: EXACTLY 3 pipe sections. The SECOND pipe is the correct answer ALONE. The THIRD pipe has 4 comma-separated options.\n'
        + '- For tf: use @question[tf] NOT @question[mcq]. The answer is the word true or false only.\n'
        + '- Use a MIX of question types\n'
        + '- Each @question on its own single line — NO line breaks within a question\n'
        + '- Do NOT add numbering, bullets, explanations, or code fences';

    /**
     * Post-process AI-generated quiz lines to fix common syntax errors.
     * Handles: missing colons, missing type brackets, swapped MCQ pipes, etc.
     */
    function postProcessQuizLines(lines) {
        var fixed = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) continue;

            // Fix: @question[type] text -> @question[type]: text (missing colon)
            line = line.replace(/^(@question\[[a-z]+\])\s+(?!:)/i, '$1: ');
            // Fix: @question[type]| -> @question[type]: (pipe instead of colon)
            line = line.replace(/^(@question\[[a-z]+\])\|\s*/i, '$1: ');

            // Skip lines that still don't match @question or @hint
            if (!line.match(/^@(question|hint)/i)) continue;

            // Fix MCQ with swapped pipe format:
            // Wrong: question | opt1, opt2, opt3, opt4 | correct
            // Right: question | correct | opt1,opt2,opt3,opt4
            var mcqMatch = line.match(/^@question\[mcq\]:\s*(.+)$/i);
            if (mcqMatch) {
                var parts = mcqMatch[1].split('|').map(function(s){ return s.trim(); });
                if (parts.length >= 3) {
                    var question = parts[0];
                    var field2 = parts[1];
                    var field3 = parts[2];
                    // Detect swapped: if field2 has commas (options) and field3 doesn't (correct answer)
                    var f2commas = (field2.match(/,/g) || []).length;
                    var f3commas = (field3.match(/,/g) || []).length;
                    if (f2commas >= 2 && f3commas === 0) {
                        // Swapped — fix it
                        line = '@question[mcq]: ' + question + ' | ' + field3 + ' | ' + field2;
                    }
                } else if (parts.length === 2) {
                    // Only 2 pipes: question | opt1, opt2, opt3, opt4
                    // Try to extract correct from options (pick the first)
                    var opts = parts[1].split(',').map(function(s){ return s.trim(); });
                    if (opts.length >= 3) {
                        line = '@question[mcq]: ' + parts[0] + ' | ' + opts[0] + ' | ' + parts[1];
                    }
                }
            }

            fixed.push(line);
        }
        return fixed;
    }

    var DIFF_COLORS = {
        easy:   { bg:'#064e3b', color:'#6ee7b7', border:'#059669' },
        medium: { bg:'#1c1917', color:'#fbbf24', border:'#d97706' },
        hard:   { bg:'#4c0519', color:'#f9a8d4', border:'#be185d' }
    };
    var TYPE_LABELS = {
        mcq:'MCQ', tf:'True/False', match:'Match the Following',
        fill:'Fill-in-blank', short:'Short Answer', order:'Ordering',
        essay:'Essay', likert:'Likert Scale', hotspot:'Hotspot'
    };

    // ─── Question catalog for "Add Question" button ───────────────────────────
    var QUESTION_CATALOG = [
        { type:'mcq',     icon:'🔘', label:'Multiple Choice',  template:'@question[mcq]: Your question? | CorrectAnswer | Opt1,CorrectAnswer,Opt2,Opt3' },
        { type:'tf',      icon:'✅', label:'True / False',     template:'@question[tf]: Statement here | true' },
        { type:'fill',    icon:'✏️', label:'Fill in the Blank', template:'@question[fill]: The answer is ___ | answer' },
        { type:'match',   icon:'🔗', label:'Match the Following', template:'@question[match]: A=1, B=2, C=3 | Match these pairs' },
        { type:'order',   icon:'📋', label:'Ordering',         template:'@question[order]: First,Second,Third,Fourth | Put in correct order' },
        { type:'short',   icon:'💬', label:'Short Answer',     template:'@question[short]: Brief question here | keyword1,keyword2' },
        { type:'essay',   icon:'📝', label:'Essay',            template:'@question[essay]: Write about this topic in detail.' },
        { type:'likert',  icon:'⭐', label:'Likert Scale',     template:'@question[likert]: I found this topic easy to understand' },
        { type:'hotspot', icon:'📍', label:'Hotspot (Image)',  template:'@question[hotspot]: Click on the correct area' }
    ];

    // ─── Parser ───────────────────────────────────────────────────────────────
    function parseBlocks(src) {
        var blocks = [], fences = getFencedRanges(src);
        var re = /\{\{@?Quiz\s*:\s*([\s\S]*?)\}\}/gi, m;
        while ((m = re.exec(src)) !== null) {
            if (inFence(m.index, fences)) continue;
            var body = m[1].trim(), lines = body.split('\n');
            var b = { title:'Quiz', subject:'General', difficulty:'Medium',
                      numQuestions:'10', chapter:'', prompt:'', questions:[], customCss:'',
                      userInfo:[], mode:'practice', searchProviders:[], useMemory:[],
                      start:m.index, end:m.index+m[0].length, raw:m[0] };
            var li = 0;
            while (li < lines.length) {
                var line = lines[li].trim(); li++;
                if (!line) continue;
                var mm;
                if ((mm = line.match(/^@subject:\s*(.+)/i)))   { b.subject     = mm[1].trim(); continue; }
                if ((mm = line.match(/^@difficulty:\s*(.+)/i))) { b.difficulty  = mm[1].trim(); continue; }
                if ((mm = line.match(/^@questions:\s*(\d+)/i))) { b.numQuestions= mm[1]; continue; }
                // @field: css | ... (same format as forms — merge with @css:)
                if ((mm = line.match(/^@field:\s*css\s*\|\s*(.+)/i))) {
                    var fieldCss = mm[1].replace(/^"|"$/g,'').trim();
                    b.customCss = b.customCss ? b.customCss + '; ' + fieldCss : fieldCss;
                    continue;
                }
                if ((mm = line.match(/^@css:\s*(.+)/i)))        { var cssPart = mm[1].replace(/^"|"$/g,'').trim(); b.customCss = b.customCss ? b.customCss + '; ' + cssPart : cssPart; continue; }
                if ((mm = line.match(/^@mode:\s*(.+)/i)))       { b.mode = mm[1].trim().toLowerCase()==='test'?'test':'practice'; continue; }
                if ((mm = line.match(/^@search:\s*(.+)/i))) {
                    b.searchProviders = mm[1].split(',').map(function(s){return s.trim().toLowerCase();}).filter(Boolean);
                    continue;
                }
                if ((mm = line.match(/^@use:\s*(.+)/i))) {
                    b.useMemory = mm[1].split(',').map(function(s){return s.trim();}).filter(Boolean);
                    continue;
                }
                if ((mm = line.match(/^@userinfo:\s*(.+)/i)))  {
                    b.userInfo = mm[1].split(',').map(function(f){return f.trim().toLowerCase();}).filter(Boolean);
                    continue;
                }
                if ((mm = line.match(/^@chapter:\s*([\s\S]*)/i))) {
                    var chunks = [mm[1].trim()];
                    while (li < lines.length && !lines[li].trim().match(/^@/)) { chunks.push(lines[li].trim()); li++; }
                    b.chapter = chunks.join(' '); continue;
                }
                if ((mm = line.match(/^@prompt:\s*([\s\S]*)/i))) {
                    var pchunks = [mm[1].trim()];
                    while (li < lines.length && !lines[li].trim().match(/^@/)) { pchunks.push(lines[li].trim()); li++; }
                    b.prompt = pchunks.join(' '); continue;
                }
                if ((mm = line.match(/^@question(?:\[([a-z]+)\])?:\s*([\s\S]*)/i))) {
                    var qtype = (mm[1]||'mcq').toLowerCase(), rest = mm[2].trim();
                    var q = { type:qtype, raw:rest, hintItems:[] };
                    if (qtype === 'mcq') {
                        var p = rest.split('|').map(function(s){return s.trim();});
                        var opts = p[2] ? p[2].split(',').map(function(s){return s.trim();}) : [];
                        var corr = p[1]||opts[0]||'';
                        if (corr && opts.indexOf(corr)===-1) opts.push(corr);
                        q.text = p[0]; q.correct = corr; q.options = shuffleArr(opts.slice());
                    } else if (qtype === 'tf') {
                        var p2 = rest.split('|').map(function(s){return s.trim();});
                        q.text = p2[0]; q.correct = (p2[1]||'true').toLowerCase()==='true'?'true':'false';
                    } else if (qtype === 'match') {
                        var pipeI = rest.indexOf('|');
                        var pairsStr = pipeI>=0?rest.substring(0,pipeI).trim():rest;
                        q.text = pipeI>=0?rest.substring(pipeI+1).trim():'Match the following:';
                        q.pairs = pairsStr.split(',').map(function(p3){
                            var kv=p3.split('='); return {left:(kv[0]||'').trim(),right:(kv[1]||'').trim()};
                        }).filter(function(p4){return p4.left&&p4.right;});
                    } else if (qtype === 'fill') {
                        var p5 = rest.split('|').map(function(s){return s.trim();});
                        q.text = p5[0]; q.correct = p5[1]||'';
                    } else if (qtype === 'short') {
                        var p6 = rest.split('|').map(function(s){return s.trim();});
                        q.text = p6[0];
                        q.hints = p6[1]?p6[1].split(',').map(function(s){return s.trim().toLowerCase();}):[]; 
                    } else if (qtype === 'order') {
                        var p7 = rest.split('|');
                        q.items = p7[0].split(',').map(function(s){return s.trim();}).filter(Boolean);
                        q.text  = p7[1]?p7[1].trim():'Put these in the correct order:';
                        q.shuffled = shuffleArr(q.items.slice());
                    } else if (qtype === 'essay') {
                        var p8 = rest.split('|'); q.text = p8[0].trim(); q.guidance = p8[1]?p8[1].trim():'';
                    } else if (qtype === 'likert') {
                        var p9 = rest.split('|'); q.text = p9[0].trim();
                        q.scale = p9[1]?p9[1].split(',').map(function(s){return s.trim();})
                            :['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'];
                    } else if (qtype === 'hotspot') {
                        var p10 = rest.split('|'); q.text = p10[0].trim(); q.imgSrc = (p10[1]||'').trim();
                    } else {
                        q.type = 'mcq'; // fallback
                    }
                    b.questions.push(q); continue;
                }
                // @hint: attaches to the most recently parsed question
                if ((mm = line.match(/^@hint:\s*([\s\S]*)/i))) {
                    if (b.questions.length > 0) {
                        b.questions[b.questions.length-1].hintItems.push(mm[1].trim());
                    }
                    continue;
                }
                if (!b.title||b.title==='Quiz') if (!line.startsWith('@')) b.title = line;

            }
            blocks.push(b);
        }
        return blocks;
    }

    // ─── Per-block runtime state (stored outside DOM) ─────────────────────────
    var QUIZ_STATE = {};

    function getState(bi) {
        if (!QUIZ_STATE[bi]) QUIZ_STATE[bi] = { results:[], xp:0, lives:3, cur:0, matchSlots:{}, ordDrag:null };
        return QUIZ_STATE[bi];
    }

    // ─── Player rendering — data-* only, no onclick ───────────────────────────
    function buildQuestionHtml(q, qi, bi) {
        var html = '';
        switch (q.type) {
        case 'tf':
            html = '<div class="qd-tf">' +
                '<button class="qd-choice-tf" data-bi="'+bi+'" data-q="'+qi+'" data-val="true" data-correct="'+escHtml(q.correct)+'">✅ True</button>' +
                '<button class="qd-choice-tf" data-bi="'+bi+'" data-q="'+qi+'" data-val="false" data-correct="'+escHtml(q.correct)+'">❌ False</button>' +
                '</div>';
            break;
        case 'match':
            var rights = shuffleArr((q.pairs||[]).map(function(p){return p.right;}));
            html = '<div class="qd-match-cols">' +
                '<div class="qd-match-left">'+(q.pairs||[]).map(function(p,pi){
                    return '<div class="qd-match-left-item" data-pair="'+pi+'">'+escHtml(p.left)+'</div>';
                }).join('')+'</div>' +
                '<div class="qd-match-right">'+rights.map(function(r){
                    return '<div class="qd-match-right-item" draggable="true" data-bi="'+bi+'" data-q="'+qi+'" data-right="'+escHtml(r)+'">'+escHtml(r)+'</div>';
                }).join('')+'</div>' +
                '</div>' +
                '<div class="qd-match-slots" id="qd-slots-'+bi+'-'+qi+'">'+(q.pairs||[]).map(function(p,pi){
                    return '<div class="qd-match-slot">' +
                        '<span class="qd-slot-label">'+escHtml(p.left)+' →</span>' +
                        '<div class="qd-slot-drop" id="qd-slot-'+bi+'-'+qi+'-'+pi+'" data-bi="'+bi+'" data-q="'+qi+'" data-pi="'+pi+'"><span class="qd-slot-ph">Drop here</span></div>' +
                        '</div>';
                }).join('')+'</div>' +
                '<button class="qd-match-check-btn" data-bi="'+bi+'" data-q="'+qi+'" style="margin-top:10px">Check Match ✓</button>';
            break;
        case 'fill':
            html = '<div class="qd-fill-wrap">' +
                '<input class="qd-fill-input" id="qd-fill-'+bi+'-'+qi+'" type="text" placeholder="Type your answer…" data-bi="'+bi+'" data-q="'+qi+'" data-correct="'+escHtml(q.correct||'')+'"/>' +
                '<button class="qd-fill-btn" data-bi="'+bi+'" data-q="'+qi+'" data-action="checkfill">Check ✓</button>' +
                '</div>';
            break;
        case 'short':
            html = '<div class="qd-short-wrap">' +
                '<textarea class="qd-short-textarea" id="qd-short-'+bi+'-'+qi+'" placeholder="Write your answer…" rows="3"></textarea>' +
                '<button class="qd-short-save" data-bi="'+bi+'" data-q="'+qi+'" data-action="saveshort">Save Answer →</button>' +
                '</div>' +
                (!M.isFormFillMode && q.hints&&q.hints.length?'<div style="color:#64748b;font-size:.8em;margin-top:6px">💡 Keywords: '+escHtml(q.hints.join(', '))+'</div>':'');
            break;
        case 'order':
            html = '<div class="qd-order-list" id="qd-order-'+bi+'-'+qi+'">' +
                (q.shuffled||[]).map(function(item){
                    return '<div class="qd-order-item" draggable="true" data-bi="'+bi+'" data-q="'+qi+'" data-item="'+escHtml(item)+'">' +
                        '<span class="qd-ord-handle">⠿</span>'+escHtml(item)+'</div>';
                }).join('')+'</div>' +
                '<button class="qd-order-check-btn" data-bi="'+bi+'" data-q="'+qi+'" style="margin-top:10px">Check Order ✓</button>';
            break;
        case 'essay':
            html = '<div class="qd-short-wrap">' +
                (q.guidance?'<div style="color:#64748b;font-size:.85em;margin-bottom:8px">📝 '+escHtml(q.guidance)+'</div>':'')+
                '<textarea class="qd-short-textarea" id="qd-essay-'+bi+'-'+qi+'" placeholder="Write your detailed response…" rows="6"></textarea>' +
                '<button class="qd-short-save" data-bi="'+bi+'" data-q="'+qi+'" data-action="saveshort">Save Answer →</button>' +
                '</div>';
            break;
        case 'likert':
            html = '<div class="qd-likert">'+(q.scale||[]).map(function(label,si){
                return '<button class="qd-likert-btn" data-bi="'+bi+'" data-q="'+qi+'" data-val="'+(si+1)+'" data-label="'+escHtml(label)+'"><span>'+escHtml(label)+'</span></button>';
            }).join('')+'</div>';
            break;
        case 'hotspot':
            html = '<div class="qd-hotspot">' +
                (q.imgSrc
                    ? '<div style="position:relative;display:inline-block"><img src="'+escHtml(q.imgSrc)+'" class="qd-hotspot-img" data-bi="'+bi+'" data-q="'+qi+'" alt="Click the correct area"/><div id="qd-hs-marker-'+bi+'-'+qi+'" class="qd-hs-marker" style="display:none"></div></div>'
                    : '<input type="text" class="qd-fill-input" data-bi="'+bi+'" data-q="'+qi+'" placeholder="Paste image URL…" data-action="hotspoturl" style="margin-bottom:8px"/>') +
                '<button class="qd-short-save" data-bi="'+bi+'" data-q="'+qi+'" data-action="saveshort" style="display:block;margin-top:8px">Mark as Answered →</button>' +
                '</div>';
            break;
        default: // mcq
            html = '<div class="qd-choices">'+(q.options||[]).map(function(opt){
                return '<button class="qd-choice" data-bi="'+bi+'" data-q="'+qi+'" data-val="'+escHtml(opt)+'" data-correct="'+escHtml(q.correct||'')+'">'+escHtml(opt)+'</button>';
            }).join('')+'</div>';
        }
        // Append hints if any
        if (q.hintItems && q.hintItems.length > 0) {
            html += buildHintHtml(q.hintItems, bi, qi);
        }
        return html;
    }

    // ─── Hint rendering — auto-detect URLs, YouTube, and plain text ──────────
    function buildHintHtml(hintItems, bi, qi) {
        var content = hintItems.map(function(h) {
            // YouTube URL → embed
            var ytMatch = h.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
            if (ytMatch) {
                return '<div class="qd-hint-media"><iframe src="https://www.youtube.com/embed/'+escHtml(ytMatch[1])+'" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:8px;border:1px solid var(--quiz-input-border,#334155)"></iframe></div>';
            }
            // Image URL → img tag
            if (h.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i)) {
                return '<div class="qd-hint-media"><img src="'+escHtml(h)+'" alt="Hint image" style="max-width:100%;border-radius:8px;border:1px solid var(--quiz-input-border,#334155)"/></div>';
            }
            // Generic URL → clickable link
            if (h.match(/^https?:\/\//i)) {
                return '<div class="qd-hint-link"><a href="'+escHtml(h)+'" target="_blank" rel="noopener noreferrer">🔗 '+escHtml(h.length>60?h.substring(0,60)+'…':h)+'</a></div>';
            }
            // Plain text / markdown-like
            return '<div class="qd-hint-text">'+escHtml(h)+'</div>';
        }).join('');

        return '<details class="qd-hint-details" data-bi="'+bi+'" data-q="'+qi+'">' +
            '<summary class="qd-hint-toggle">💡 Show Hint</summary>' +
            '<div class="qd-hint-body">'+content+'</div>' +
            '</details>';
    }

    // ─── User Info field config ────────────────────────────────────────────────
    var DEFAULT_USERINFO = ['name', 'email'];
    var USERINFO_FIELDS = {
        name:  { icon:'👤', label:'Full Name',  placeholder:'Enter your name',  type:'text' },
        email: { icon:'📧', label:'Email',       placeholder:'Enter your email', type:'email' },
        id:    { icon:'🆔', label:'Student ID',  placeholder:'Enter your ID',    type:'text' },
        phone: { icon:'📱', label:'Phone',        placeholder:'Enter your phone', type:'tel' },
        class: { icon:'🏫', label:'Class/Section',placeholder:'e.g. 10-A',       type:'text' },
        roll:  { icon:'📋', label:'Roll Number',  placeholder:'Enter roll number',type:'text' }
    };

    function buildUserInfoScreen(fields, bi) {
        if (!fields || !fields.length) return '';
        var html = '<div class="qd-screen qd-userinfo-screen" data-bi="'+bi+'" id="qd-s'+bi+'-userinfo">';
        html += '<div class="qd-userinfo-header">📋 Enter Your Details</div>';
        html += '<div class="qd-userinfo-sub">Please fill in your information before starting the quiz.</div>';
        html += '<div class="qd-userinfo-fields">';
        fields.forEach(function(f) {
            var cfg = USERINFO_FIELDS[f] || { icon:'📝', label:f.charAt(0).toUpperCase()+f.slice(1), placeholder:'Enter '+f, type:'text' };
            html += '<div class="qd-userinfo-field">';
            html += '<label class="qd-userinfo-label">'+cfg.icon+' '+escHtml(cfg.label)+' <span class="qd-userinfo-req">*</span></label>';
            html += '<input class="qd-userinfo-input" type="'+cfg.type+'" data-bi="'+bi+'" data-field="'+escHtml(f)+'" placeholder="'+escHtml(cfg.placeholder)+'" required/>';
            html += '</div>';
        });
        html += '</div>';
        html += '<div class="qd-nav">';
        html += '<span></span>';
        html += '<button class="qd-btn qd-userinfo-start" data-bi="'+bi+'" data-action="startquiz" disabled>Start Quiz →</button>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    function buildPlayer(b, bi) {
        var questions = b.questions;
        if (!questions || !questions.length) return '';
        // @userinfo is mandatory — default to name + email if not specified
        var fields = (b.userInfo && b.userInfo.length > 0) ? b.userInfo : DEFAULT_USERINFO;
        // Creator previews freely; respondent (isFormFillMode) must fill user info first
        var isRespondent = !!M.isFormFillMode;
        QUIZ_STATE[bi] = { results:new Array(questions.length).fill(undefined), xp:0, lives:3, cur:0, matchSlots:{}, ordDrag:null, total:questions.length, questions:questions, userInfoFields:fields, userInfoData:{}, isRespondent:isRespondent, mode:b.mode||'practice' };

        // In test mode or for creator preview: Next is always enabled
        // Only respondents in practice mode must confirm answer first (Duolingo-style)
        var navDisabled = (!isRespondent || b.mode === 'test') ? '' : 'disabled';

        // User info intro screen — only shown for respondents
        var userInfoHtml = isRespondent ? buildUserInfoScreen(fields, bi) : '';

        var screens = questions.map(function(q,qi){
            var isLast = qi===questions.length-1;
            // For respondents: hide all questions (user info shows first)
            // For creator: show Q1 directly
            var hidden = isRespondent || qi > 0;
            return '<div class="qd-screen" data-bi="'+bi+'" id="qd-s'+bi+'-'+qi+'" '+(hidden?'style="display:none"':'')+'>'+
                '<div class="qd-meta">Question '+(qi+1)+' of '+questions.length+' <span class="qd-type-badge">'+escHtml(TYPE_LABELS[q.type]||q.type)+'</span></div>'+
                '<div class="qd-text">'+escHtml(q.text||'')+'</div>'+
                buildQuestionHtml(q, qi, bi)+
                '<div class="qd-fb" id="qd-fb'+bi+'-'+qi+'"></div>'+
                '<div class="qd-nav">'+
                  '<button class="qd-btn qd-prev" data-bi="'+bi+'" data-goto="'+(qi-1)+'" '+(qi===0?'disabled':'')+'>← Back</button>'+
                  (isLast
                    ? '<button class="qd-btn qd-next" id="qd-n'+bi+'-'+qi+'" data-bi="'+bi+'" data-goto="-1" '+navDisabled+'>Finish Quiz →</button>'
                    : '<button class="qd-btn qd-next" id="qd-n'+bi+'-'+qi+'" data-bi="'+bi+'" data-goto="'+(qi+1)+'" '+navDisabled+'>Next →</button>')+
                '</div>'+
                '</div>';
        }).join('');

        var doneScreen = '<div class="qd-complete" id="qd-done-'+bi+'" style="display:none">'+
            '<div class="qd-complete-score" id="qd-score-'+bi+'">—</div>'+
            '<div class="qd-complete-stars" id="qd-stars-'+bi+'">⭐⭐⭐</div>'+
            '<div class="qd-complete-msg"><span id="qd-done-xp-'+bi+'">XP earned</span></div>'+
            '<button class="qd-btn qd-submit" id="qd-submit-'+bi+'" data-bi="'+bi+'" data-action="submit" style="margin-top:14px;display:block;width:100%">🤖 Submit for AI Grading</button>'+
            '</div>';

        var isTest = (b.mode === 'test');
        return '<div class="quiz-dg-player" data-bi="'+bi+'" id="qd-player-'+bi+'">'+
            '<div class="qd-bar"'+(userInfoHtml?' style="display:none"':'')+' id="qd-bar-'+bi+'">'+
              (isTest ? '' : '<div class="qd-lives" id="qd-liv'+bi+'"></div>')+
              '<div class="qd-progress"><div class="qd-prog-fill" id="qd-prog'+bi+'" style="width:0%"></div></div>'+
              (isTest ? '<div class="qd-xp" style="opacity:0.5">📝 Test Mode</div>' : '<div class="qd-xp" id="qd-xp'+bi+'">⭐ 0 XP</div>')+
            '</div>'+
            userInfoHtml+
            '<div id="qd-screens-'+bi+'" '+(userInfoHtml?'style="display:none"':'')+'>'+screens+'</div>'+
            doneScreen+
            '</div>';
    }

    // ─── Transform markdown ───────────────────────────────────────────────────
    function transformQuizMarkdown(markdown) {
        var fences = getFencedRanges(markdown);
        var re = /\{\{@?Quiz\s*:\s*([\s\S]*?)\}\}/gi;
        var result = '', last = 0, bi = 0, m;

        // Build model dropdown options (same pattern as game-docgen)
        var models = window.AI_MODELS || {};
        var modelIds = Object.keys(models);
        var currentModel = (M.getCurrentAiModel ? M.getCurrentAiModel() : modelIds[0]) || modelIds[0];
        function buildModelOpts() {
            var opts = '';
            modelIds.forEach(function (id) {
                var mo = models[id];
                if (mo.isImageModel || mo.isTtsModel || mo.isSttModel) return;
                var name = mo.dropdownName || mo.label || id;
                var sel = id === currentModel ? ' selected' : '';
                opts += '<option value="' + id + '"' + sel + '>' + name + '</option>';
            });
            return opts;
        }
        var modelOptsHtml = buildModelOpts();

        // Search provider pill config (same as ai-docgen)
        var SEARCH_PILL_CONFIG = [
            { id: 'duckduckgo', icon: '🦆', label: 'DDG', title: 'DuckDuckGo · Free · No API key' },
            { id: 'brave', icon: '🦁', label: 'Brave', title: 'Brave Search · 2,000/month free' },
            { id: 'serper', icon: '🔎', label: 'Serper', title: 'Serper.dev · 2,500 queries free' },
            { id: 'tavily', icon: '🤖', label: 'Tavily', title: 'Tavily · AI-optimized · 1,000/month free' },
            { id: 'google_cse', icon: '🔍', label: 'Google', title: 'Google CSE · 100/day free' },
            { id: 'wikipedia', icon: '📖', label: 'Wiki', title: 'Wikipedia · Free encyclopedia' },
            { id: 'wikidata', icon: '📊', label: 'Wikidata', title: 'Wikidata · Free structured data' },
        ];
        function buildSearchPillsHtml(quizIndex, activeProviders) {
            var html = '<div class="quiz-dg-search-panel" data-quiz-index="'+quizIndex+'" style="display:none">' +
                '<div class="quiz-dg-search-pills">';
            SEARCH_PILL_CONFIG.forEach(function(p) {
                var isActive = activeProviders.indexOf(p.id) !== -1;
                html += '<label class="quiz-dg-search-pill'+(isActive?' active':'')+'" data-provider="'+p.id+'" title="'+p.title+'">' +
                    '<input type="checkbox" class="quiz-dg-search-check" value="'+p.id+'" data-quiz-index="'+quizIndex+'"'+(isActive?' checked':'')+'>' +
                    '<span class="quiz-dg-search-pill-label">'+p.icon+' '+p.label+'</span>' +
                    '</label>';
            });
            html += '</div></div>';
            return html;
        }

        while ((m = re.exec(markdown)) !== null) {
            if (inFence(m.index, fences)) continue;
            result += markdown.substring(last, m.index);
            var blocks = parseBlocks(m[0]);
            var b = blocks[0];
            if (!b) { last = m.index+m[0].length; continue; }

            var diff = b.difficulty.toLowerCase();
            var dc = DIFF_COLORS[diff]||DIFF_COLORS.medium;
            var hasQ = b.questions && b.questions.length > 0;
            var hasChapter = b.chapter && b.chapter.length > 10;
            var hasPrompt = b.prompt && b.prompt.length > 3;
            var hasSearch = b.searchProviders && b.searchProviders.length > 0;
            var hasMemory = b.useMemory && b.useMemory.length > 0;
            var canGenerate = hasChapter || hasPrompt;
            var cssStyle = b.customCss ? ' style="'+escHtml(b.customCss)+'"' : '';

            // AI prompt textarea for free-text quiz generation
            var promptAreaHtml = '';
            if (!M.isFormFillMode) {
                promptAreaHtml = '<div class="quiz-dg-prompt-area" data-quiz-index="'+bi+'">'
                    + '<textarea class="quiz-dg-prompt-input" data-quiz-index="'+bi+'" placeholder="Describe the quiz you want AI to create… e.g. 10 questions on World War 2, mix of MCQ and True/False, hard difficulty" rows="2">' + escHtml(b.prompt || '') + '</textarea>'
                    + (!canGenerate && !hasQ ? '<button class="quiz-dg-gen-btn quiz-dg-gen-prompt" data-quiz-index="'+bi+'" type="button" disabled>🤖 Generate with AI</button>' : '')
                    + '</div>';
            }

            result += '<div class="quiz-dg-card" data-quiz-index="'+bi+'"'+cssStyle+'>' +
                '<div class="quiz-dg-header">'+
                  '<span class="quiz-dg-icon">📝</span>'+
                  '<span class="quiz-dg-title">'+escHtml(b.title)+'</span>'+
                  '<div class="quiz-dg-badges">'+
                    '<span class="quiz-dg-subj">'+escHtml(b.subject)+'</span>'+
                    '<span class="quiz-dg-diff" style="background:'+dc.bg+';color:'+dc.color+';border:1px solid '+dc.border+'">'+escHtml(b.difficulty)+'</span>'+
                    (hasQ?'<span class="quiz-dg-subj" style="border-color:#334155">'+b.questions.length+' Qs</span>':'')+
                    (!M.isFormFillMode
                      ? '<button class="quiz-dg-mode-toggle" data-quiz-index="'+bi+'" data-mode="'+(b.mode||'practice')+'" type="button" title="Toggle Practice / Test mode">'+(b.mode==='test'?'📝 Test':'🎯 Practice')+'</button>'
                      : (b.mode==='test'?'<span class="quiz-dg-diff" style="background:#312e81;color:#a5b4fc;border:1px solid #4338ca">📝 Test</span>':''))+
                  '</div>'+
                  '<div class="quiz-dg-actions">'+
                    (!M.isFormFillMode ? '<button class="quiz-dg-search-btn'+(hasSearch?' active':'')+'" data-quiz-index="'+bi+'" type="button" title="Web search for source material">🔍'+(hasSearch?' '+b.searchProviders.length:'')+'</button>' : '')+
                    (!M.isFormFillMode ? '<button class="quiz-dg-memory-btn'+(hasMemory?' active':'')+'" data-quiz-index="'+bi+'" type="button" title="Memory context for source material">📚'+(hasMemory?' ✓':'')+'</button>' : '')+
                    (!M.isFormFillMode ? '<select class="quiz-dg-model-select" data-quiz-index="'+bi+'" title="AI model for generation">' + modelOptsHtml + '</select>' : '')+
                    (!M.isFormFillMode && hasChapter?'<span class="quiz-dg-chapter-info">📖 '+b.chapter.length+' chars</span>':'')+
                    (!M.isFormFillMode && canGenerate?'<button class="quiz-dg-gen-btn" data-quiz-index="'+bi+'" type="button">🤖 Generate Questions</button>':'')+
                    (!M.isFormFillMode && hasQ?'<button class="quiz-dg-grade-btn" data-quiz-index="'+bi+'" type="button">📊 Grade Answers</button>':'')+
                    (M.formResponseKey || !M.isFormFillMode ? '<button class="quiz-dg-responses-btn" data-quiz-index="'+bi+'" type="button">📋 View Responses</button>' : '')+
                    (!M.isFormFillMode ? '<button class="quiz-dg-remove" data-quiz-index="'+bi+'" type="button" title="Remove quiz">✕</button>' : '')+
                  '</div>'+
                '</div>'+
                buildSearchPillsHtml(bi, b.searchProviders || [])+
                '<div class="quiz-dg-memory-dropdown" data-quiz-index="'+bi+'" style="display:none">'+
                  '<div class="quiz-dg-memory-dropdown-header">📚 Memory Sources</div>'+
                  '<div class="quiz-dg-memory-source-list" data-quiz-index="'+bi+'"><span class="quiz-dg-memory-loading">Loading…</span></div>'+
                  '<div class="quiz-dg-memory-attach-row">'+
                    '<button class="quiz-dg-memory-attach-folder" data-quiz-index="'+bi+'" type="button" title="Attach folder">📂 Folder</button>'+
                    '<button class="quiz-dg-memory-attach-files" data-quiz-index="'+bi+'" type="button" title="Attach files">📄 Files</button>'+
                  '</div>'+
                '</div>'+
                promptAreaHtml+
                (hasQ ? buildPlayer(b, bi) :
                    '<div class="quiz-dg-empty">'+ (hasChapter
                        ? '📖 Chapter loaded ('+b.chapter.length+' chars). Click <strong>🤖 Generate Questions</strong> above.'
                        : hasPrompt
                        ? '🤖 AI prompt ready. Click <strong>🤖 Generate Questions</strong> to create your quiz.'
                        : '✏️ Describe your quiz in the prompt box above, or add questions manually with <strong>➕ Add Question</strong> below.') +
                    '</div>')+
                (!M.isFormFillMode ? '<div class="quiz-dg-add-wrap" data-quiz-index="'+bi+'">'+
                '<button class="quiz-dg-add-btn" data-quiz-index="'+bi+'" type="button">➕ Add Question</button>' : '<div class="quiz-dg-add-wrap" style="display:none">')+
                '<div class="quiz-dg-add-dropdown" data-quiz-index="'+bi+'" style="display:none">'+
                QUESTION_CATALOG.map(function(c){
                    return '<button class="quiz-dg-add-option" data-q-type="'+c.type+'" data-q-template="'+escHtml(c.template)+'" data-quiz-index="'+bi+'" type="button">'+
                        '<span class="quiz-dg-add-icon">'+c.icon+'</span>'+
                        '<span class="quiz-dg-add-label">'+escHtml(c.label)+'</span>'+
                        '<span class="quiz-dg-add-type">'+c.type+'</span>'+
                        '</button>';
                }).join('')+
                '</div>'+
                '</div>'+
                '<div class="quiz-dg-grade-result" data-quiz-index="'+bi+'" style="display:none"></div>'+
                '</div>';

            last = m.index+m[0].length; bi++;
        }
        return result + markdown.substring(last);
    }

    // ─── HUD helpers ──────────────────────────────────────────────────────────
    function updateHUD(bi) {
        var st = getState(bi);
        // Progress bar tracks current question position (how far the respondent has navigated)
        var progressPct = st.total > 0 ? ((st.cur + 1) / st.total * 100) : 0;
        var prog = document.getElementById('qd-prog'+bi); if(prog) prog.style.width = progressPct + '%';
        var xpEl = document.getElementById('qd-xp'+bi);   if(xpEl) xpEl.textContent='⭐ '+st.xp+' XP';
        var livEl= document.getElementById('qd-liv'+bi);  if(livEl) livEl.textContent='❤️'.repeat(st.lives)+'🖤'.repeat(3-st.lives);
    }
    function showFb(bi, qi, ok, msg) {
        var st = getState(bi);
        // In test mode, suppress inline feedback — just silently note the answer
        if (st.mode === 'test') return;
        var fb = document.getElementById('qd-fb'+bi+'-'+qi); if(!fb)return;
        fb.className = 'qd-fb-show '+(ok===true?'qd-ok':ok===false?'qd-no':'qd-noted');
        fb.innerHTML = msg;
    }


    function recordResult(bi, qi, ok, val) {
        var st = getState(bi);
        st.results[qi] = { ok:ok, val:val, q:st.questions[qi].text, type:st.questions[qi].type };
        if(st.mode !== 'test') {
            if(ok===true) st.xp+=10; else if(ok===false) st.lives=Math.max(0,st.lives-1);
        }
        updateHUD(bi);
        var nb = document.getElementById('qd-n'+bi+'-'+qi)||document.getElementById('qd-sub'+bi);
        if(nb) nb.disabled=false;
    }
    function gotoScreen(bi, qi) {
        var screens = document.querySelectorAll('.qd-screen[data-bi="'+bi+'"]');
        screens.forEach(function(s){ s.style.display='none'; });
        var t = document.getElementById('qd-s'+bi+'-'+qi); if(t) t.style.display='block';
        getState(bi).cur = qi;
        updateHUD(bi);
    }
    function showComplete(bi) {
        var st = getState(bi);
        var scored = st.results.filter(function(r){return r&&r.ok===true;}).length;
        var pending = st.results.filter(function(r){return r&&r.ok===null;}).length;
        var autoTotal = st.total - pending;
        if(st.mode === 'test') { st.xp = scored * 10; }
        // Hide question screens and HUD bar, but keep the player visible so
        // the done screen (which is a child of the player) can be displayed.
        var screensWrap = document.getElementById('qd-screens-'+bi); if(screensWrap) screensWrap.style.display='none';
        var bar = document.getElementById('qd-bar-'+bi); if(bar) bar.style.display='none';
        var uiScreen = document.getElementById('qd-s'+bi+'-userinfo'); if(uiScreen) uiScreen.style.display='none';
        var done   = document.getElementById('qd-done-'+bi);   if(done)   done.style.display='block';

        if(st.mode === 'test' && st.isRespondent) {
            // Respondent in test mode: no scores revealed — just "Test Complete"
            var scoreEl= document.getElementById('qd-score-'+bi); if(scoreEl) scoreEl.textContent='✅ Test Complete';
            var starsEl= document.getElementById('qd-stars-'+bi); if(starsEl) starsEl.textContent='';
            var xpEl   = document.getElementById('qd-done-xp-'+bi); if(xpEl) xpEl.textContent='Click below to submit your answers for evaluation.';
        } else {
            // Practice mode OR creator preview: show score + stars + XP
            var scoreEl= document.getElementById('qd-score-'+bi);
            if(scoreEl) scoreEl.textContent = pending > 0 ? scored+'/'+autoTotal+' auto-graded' : scored+'/'+st.total;
            var starsEl= document.getElementById('qd-stars-'+bi);
            if(starsEl){ var s=autoTotal>0?scored/autoTotal:0; starsEl.textContent=s>=0.9?'⭐⭐⭐⭐⭐':s>=0.7?'⭐⭐⭐⭐':s>=0.5?'⭐⭐⭐':s>=0.3?'⭐⭐':'⭐'; }
            var xpEl   = document.getElementById('qd-done-xp-'+bi);
            if(xpEl) xpEl.textContent = pending > 0 ? 'You earned '+st.xp+' XP! ('+pending+' answers pending manual review)' : 'You earned '+st.xp+' XP!';
            // Creator preview in test mode: show detailed breakdown
            if(st.mode === 'test' && !st.isRespondent) {
                var reviewHtml = '<div class="qd-test-review" style="margin-top:16px;text-align:left;width:100%">';
                reviewHtml += '<h4 style="margin:0 0 10px;color:#c4b5fd">📋 Results Breakdown</h4>';
                st.results.forEach(function(r,i){
                    if(!r) return;
                    var icon = r.ok===true ? '✅' : r.ok===null ? '📝' : '❌';
                    var qText = r.q || ('Question '+(i+1));
                    var bdrColor = r.ok===true ? '#22c55e' : r.ok===null ? '#eab308' : '#ef4444';
                    reviewHtml += '<div style="padding:8px 12px;margin-bottom:6px;border-radius:8px;background:rgba(255,255,255,0.05);border-left:3px solid '+bdrColor+'">';
                    reviewHtml += '<strong>' + icon + ' Q'+(i+1)+':</strong> '+escHtml(qText)+'<br>';
                    reviewHtml += '<span style="opacity:0.7;font-size:13px">Your answer: '+escHtml(r.val||'—')+'</span>';
                    if(r.ok===false && st.questions[i] && st.questions[i].correct) {
                        reviewHtml += '<br><span style="color:#86efac;font-size:13px">Correct: '+escHtml(st.questions[i].correct)+'</span>';
                    }
                    reviewHtml += '</div>';
                });
                reviewHtml += '</div>';
                var doneEl = document.getElementById('qd-done-'+bi);
                var existingReview = doneEl ? doneEl.querySelector('.qd-test-review') : null;
                if(existingReview) existingReview.remove();
                if(doneEl) { var submitBtn = doneEl.querySelector('.qd-submit'); if(submitBtn) doneEl.insertBefore(createElFromHtml(reviewHtml), submitBtn); else doneEl.insertAdjacentHTML('beforeend', reviewHtml); }
            }
        }
    }
    function createElFromHtml(html) { var d=document.createElement('div'); d.innerHTML=html; return d.firstChild; }
    function submitForGrading(bi) {
        var st = getState(bi);

        // ── Respondent guard: block submission if user info was not filled ────
        if (st.isRespondent) {
            var requiredFields = st.userInfoFields || DEFAULT_USERINFO;
            var missing = requiredFields.filter(function(f){ return !st.userInfoData || !st.userInfoData[f]; });
            if (missing.length) {
                // Force show user info screen again
                var player = document.getElementById('qd-player-'+bi); if(player) player.style.display='';
                var done = document.getElementById('qd-done-'+bi); if(done) done.style.display='none';
                var bar = document.getElementById('qd-bar-'+bi); if(bar) bar.style.display='none';
                // Hide all question screens
                document.querySelectorAll('.qd-screen[data-bi="'+bi+'"]').forEach(function(s){ s.style.display='none'; });
                // Show or rebuild user info screen
                var uiScreen = document.getElementById('qd-s'+bi+'-userinfo');
                if (uiScreen) { uiScreen.style.display='block'; }
                else {
                    // Rebuild user info screen if it was removed via DevTools
                    var tempDiv = document.createElement('div');
                    tempDiv.innerHTML = buildUserInfoScreen(requiredFields, bi);
                    var newScreen = tempDiv.firstChild;
                    player.insertBefore(newScreen, player.firstChild);
                    if (M.bindQuizPreviewActions) M.bindQuizPreviewActions(player);
                }
                if(M.showToast) M.showToast('Please fill in your details before submitting.','warning');
                return;
            }
        }

        var scored = st.results.filter(function(r){return r&&r.ok===true;}).length;
        var payload = st.results.map(function(r,i){
            var q = st.questions[i]||{};
            var correctAns = q.correct || (q.items ? q.items.join(', ') : '') || '';
            return {
                type: q.type,
                question: q.text || '(Q'+(i+1)+')',
                answer: r ? r.val : '(not answered)',
                correct: r ? r.ok : false,
                correctAnswer: correctAns
            };
        });
        window.__qdAnswers = window.__qdAnswers||{}; window.__qdAnswers[bi]=payload;
        var btn = document.getElementById('qd-submit-'+bi)||document.getElementById('qd-sub'+bi);
        if(btn){ btn.disabled=true; btn.textContent='✅ Submitted — your teacher will review'; }
        // Build submission data with user info if available
        var submitData = { answers:payload, score:scored, total:st.total, xp:st.xp, blockIndex:bi };
        if(st.userInfoData) {
            if(st.userInfoData.name)  submitData.studentName  = st.userInfoData.name;
            if(st.userInfoData.email) submitData.studentEmail = st.userInfoData.email;
            if(st.userInfoData.id)    submitData.studentId    = st.userInfoData.id;
            if(st.userInfoData.phone) submitData.studentPhone = st.userInfoData.phone;
            if(st.userInfoData['class']) submitData.studentClass = st.userInfoData['class'];
            if(st.userInfoData.roll)  submitData.studentRoll  = st.userInfoData.roll;
        }
        // Notify form-engine for Firestore response collection (creator→respondent flow)
        window.postMessage({ type:'textagent-quiz-submit', data:submitData }, '*');
        // Also notify quiz-grade handler for local AI grading
        window.dispatchEvent(new MessageEvent('message',{ data:{ type:'textagent-quiz-grade', blockIndex:bi, answers:payload, xp:st.xp, total:st.total } }));
    }

    // ─── DELEGATED EVENT BINDING — called after every render ─────────────────
    function bindQuizPreviewActions(container) {

        // ── User Info: validate inputs and enable Start Quiz button ─────────
        container.querySelectorAll('.qd-userinfo-input').forEach(function(inp){
            if(inp._qui) return; inp._qui=true;
            inp.addEventListener('input', function(){
                var bi=parseInt(inp.dataset.bi);
                var allInputs=container.querySelectorAll('.qd-userinfo-input[data-bi="'+bi+'"]');
                var startBtn=container.querySelector('.qd-userinfo-start[data-bi="'+bi+'"]');
                if(!startBtn) return;
                var allFilled=true;
                allInputs.forEach(function(i){
                    if(i.required && !i.value.trim()) allFilled=false;
                    var invalid = i.value.trim() && !i.checkValidity();
                    if(invalid) allFilled=false;
                    // Visual feedback for invalid inputs (e.g. email format)
                    i.style.borderColor = !i.value.trim() ? '' : invalid ? '#ef4444' : '#22c55e';
                    var errId = 'qd-err-'+i.dataset.bi+'-'+i.dataset.field;
                    var errEl = document.getElementById(errId);
                    if(invalid && !errEl) {
                        var msg = document.createElement('div');
                        msg.id = errId;
                        msg.style.cssText = 'color:#fca5a5;font-size:.78em;margin-top:3px';
                        msg.textContent = '⚠ Invalid ' + (i.dataset.field||'input');
                        i.parentNode.appendChild(msg);
                    } else if(!invalid && errEl) { errEl.remove(); }
                });
                startBtn.disabled=!allFilled;
            });
            // Allow Enter key to move to next field or start quiz
            inp.addEventListener('keydown', function(e){
                if(e.key!=='Enter') return;
                var bi=parseInt(inp.dataset.bi);
                var allInputs=Array.from(container.querySelectorAll('.qd-userinfo-input[data-bi="'+bi+'"]'));
                var idx=allInputs.indexOf(inp);
                if(idx<allInputs.length-1){ allInputs[idx+1].focus(); }
                else { var startBtn=container.querySelector('.qd-userinfo-start[data-bi="'+bi+'"]'); if(startBtn&&!startBtn.disabled) startBtn.click(); }
            });
        });

        // ── User Info: Start Quiz button ─────────────────────────────────────
        container.querySelectorAll('.qd-userinfo-start[data-action="startquiz"]').forEach(function(btn){
            if(btn._qus) return; btn._qus=true;
            btn.addEventListener('click', function(){
                if(btn.disabled) return;
                var bi=parseInt(btn.dataset.bi);
                var st=getState(bi);
                // Collect user info
                var allInputs=container.querySelectorAll('.qd-userinfo-input[data-bi="'+bi+'"]');
                var info={};
                allInputs.forEach(function(i){ info[i.dataset.field]=i.value.trim(); });
                st.userInfoData=info;
                // Hide user info screen, show progress bar & first question
                var uiScreen=document.getElementById('qd-s'+bi+'-userinfo');
                if(uiScreen) uiScreen.style.display='none';
                var bar=document.getElementById('qd-bar-'+bi);
                if(bar) bar.style.display='';
                var screensWrap=document.getElementById('qd-screens-'+bi);
                if(screensWrap) screensWrap.style.display='';
                gotoScreen(bi, 0);
            });
        });

        container.querySelectorAll('.qd-choice').forEach(function(btn){
            if(btn._qb) return; btn._qb=true;
            btn.addEventListener('click', function(){
                var bi=parseInt(btn.dataset.bi), qi=parseInt(btn.dataset.q);
                var st=getState(bi);
                var val=btn.dataset.val, corr=(btn.dataset.correct||'');
                var ok=val.toLowerCase()===corr.toLowerCase();
                if(st.mode === 'test') {
                    // Test mode: allow re-selection, no disable, neutral highlight
                    btn.parentNode.querySelectorAll('.qd-choice').forEach(function(b){ b.classList.remove('qd-selected'); });
                    btn.classList.add('qd-selected');
                    st.results[qi] = { ok:ok, val:val, q:st.questions[qi].text, type:st.questions[qi].type };
                    var nb = document.getElementById('qd-n'+bi+'-'+qi)||document.getElementById('qd-sub'+bi);
                    if(nb) nb.disabled=false;
                } else {
                    if(st.results[qi]!==undefined) return;
                    btn.parentNode.querySelectorAll('.qd-choice').forEach(function(b){
                        b.disabled=true;
                        if(b.dataset.val.toLowerCase()===corr.toLowerCase()) b.classList.add('qd-c');
                    });
                    if(!ok) btn.classList.add('qd-w');
                    showFb(bi,qi,ok,ok?'\u2705 Correct! Well done!':'\u274c Correct answer: <strong>'+escHtml(corr)+'</strong>');
                    recordResult(bi,qi,ok,val);
                }
            });
        });

        container.querySelectorAll('.qd-choice-tf').forEach(function(btn){
            if(btn._qtf) return; btn._qtf=true;
            btn.addEventListener('click', function(){
                var bi=parseInt(btn.dataset.bi), qi=parseInt(btn.dataset.q);
                var st=getState(bi);
                var val=btn.dataset.val, corr=btn.dataset.correct;
                var ok=val===corr;
                if(st.mode === 'test') {
                    // Test mode: allow re-selection
                    btn.parentNode.querySelectorAll('.qd-choice-tf').forEach(function(b){ b.classList.remove('qd-selected'); });
                    btn.classList.add('qd-selected');
                    st.results[qi] = { ok:ok, val:val, q:st.questions[qi].text, type:st.questions[qi].type };
                    var nb = document.getElementById('qd-n'+bi+'-'+qi)||document.getElementById('qd-sub'+bi);
                    if(nb) nb.disabled=false;
                } else {
                    if(st.results[qi]!==undefined) return;
                    btn.parentNode.querySelectorAll('.qd-choice-tf').forEach(function(b){
                        b.disabled=true; if(b.dataset.val===corr) b.classList.add('qd-c');
                    });
                    if(!ok) btn.classList.add('qd-w');
                    showFb(bi,qi,ok,ok?'\u2705 Correct! The statement is '+corr+'.':'\u274c The statement is <strong>'+corr+'</strong>.');
                    recordResult(bi,qi,ok,val);
                }
            });
        });

        // ── Fill-in-blank check button ─────────────────────────────────────────
        container.querySelectorAll('.qd-fill-btn[data-action="checkfill"]').forEach(function(btn){
            if(btn._qfb) return; btn._qfb=true;
            var bi=parseInt(btn.dataset.bi);
            var st=getState(bi);
            // In test mode, hide the Check button — answers auto-record on blur/Next
            if(st.mode === 'test') { btn.style.display='none'; }
            btn.addEventListener('click', function(){
                var bi=parseInt(btn.dataset.bi), qi=parseInt(btn.dataset.q);
                var st=getState(bi); if(st.results[qi]!==undefined) return;
                var inp=document.getElementById('qd-fill-'+bi+'-'+qi); if(!inp) return;
                var val=inp.value.trim(), corr=inp.dataset.correct||'';
                var ok=val.toLowerCase()===corr.toLowerCase();
                if(st.mode !== 'test') { inp.disabled=true; inp.classList.add(ok?'qd-c':'qd-w'); }
                showFb(bi,qi,ok,ok?'✅ Correct!':'❌ Answer: <strong>'+escHtml(corr)+'</strong>');
                recordResult(bi,qi,ok,val);
            });
        });
        // Test mode: auto-record fill-in-blank when user types (enable Next immediately)
        container.querySelectorAll('.qd-fill-input:not([data-action="hotspoturl"])').forEach(function(inp){
            if(inp._qfe) return; inp._qfe=true;
            var bi=parseInt(inp.dataset.bi||inp.id.split('-')[1]);
            var st=getState(bi);
            if(st.mode === 'test') {
                inp.addEventListener('input', function(){
                    var qi=parseInt(inp.dataset.q||inp.id.split('-')[2]);
                    var val=inp.value.trim();
                    if(val) {
                        // Test mode: record as pending (ok:null) for manual review by creator
                        st.results[qi] = { ok:null, val:val, q:st.questions[qi].text, type:st.questions[qi].type };
                        var nb = document.getElementById('qd-n'+bi+'-'+qi);
                        if(nb) nb.disabled=false;
                        updateHUD(bi);
                    }
                });
            }
            inp.addEventListener('keydown', function(e){
                if(e.key==='Enter'){ var btn=inp.parentNode.querySelector('.qd-fill-btn'); if(btn) btn.click(); }
            });
        });

        // ── Short answer / essay save button ───────────────────────────────────
        container.querySelectorAll('.qd-short-save[data-action="saveshort"]').forEach(function(btn){
            if(btn._qss) return; btn._qss=true;
            var bi0=parseInt(btn.dataset.bi), st0=getState(bi0);
            // In test mode, hide Save Answer — answers auto-record on Next
            if(st0.mode === 'test') { btn.style.display='none'; }
            btn.addEventListener('click', function(){
                var bi=parseInt(btn.dataset.bi), qi=parseInt(btn.dataset.q);
                var st=getState(bi); if(st.results[qi]!==undefined) return;
                var ta=document.getElementById('qd-short-'+bi+'-'+qi)||document.getElementById('qd-essay-'+bi+'-'+qi);
                var val=ta?ta.value.trim():'(hotspot marked)';
                if(ta&&!val){ showFb(bi,qi,null,'⚠ Please write your answer first.'); return; }
                if(ta) ta.disabled=true;
                showFb(bi,qi,null,'📝 Answer saved — will be AI-graded.');
                recordResult(bi,qi,null,val);
            });
        });

        // ── Likert buttons ─────────────────────────────────────────────────────
        container.querySelectorAll('.qd-likert-btn').forEach(function(btn){
            if(btn._qlb) return; btn._qlb=true;
            btn.addEventListener('click', function(){
                var bi=parseInt(btn.dataset.bi), qi=parseInt(btn.dataset.q);
                var st=getState(bi);
                if(st.mode === 'test') {
                    // Test mode: allow re-selection
                    btn.parentNode.querySelectorAll('.qd-likert-btn').forEach(function(b){ b.classList.remove('qd-likert-sel'); });
                    btn.classList.add('qd-likert-sel');
                    st.results[qi] = { ok:null, val:btn.dataset.label, q:st.questions[qi].text, type:st.questions[qi].type };
                    var nb = document.getElementById('qd-n'+bi+'-'+qi)||document.getElementById('qd-sub'+bi);
                    if(nb) nb.disabled=false;
                } else {
                    if(st.results[qi]!==undefined) return;
                    btn.parentNode.querySelectorAll('.qd-likert-btn').forEach(function(b){ b.disabled=true; b.classList.remove('qd-likert-sel'); });
                    btn.classList.add('qd-likert-sel');
                    showFb(bi,qi,null,'✔ Recorded: '+btn.dataset.label);
                    recordResult(bi,qi,null,btn.dataset.label);
                }
            });
        });

        // ── Match drag & drop ──────────────────────────────────────────────────
        var matchTouchSrc = null;
        container.querySelectorAll('.qd-match-right-item').forEach(function(el){
            if(el._qmd) return; el._qmd=true;
            el.addEventListener('dragstart', function(e){ e.dataTransfer.setData('text/plain', el.dataset.right||el.textContent.trim()); });
            // Touch support for match items
            el.addEventListener('touchstart', function(e){
                matchTouchSrc = el;
                el.style.opacity='0.5';
                e.preventDefault();
            }, {passive:false});
            el.addEventListener('touchend', function(e){
                if(!matchTouchSrc) return;
                var touch = e.changedTouches[0];
                var target = document.elementFromPoint(touch.clientX, touch.clientY);
                var slot = target ? target.closest('.qd-slot-drop') : null;
                if(slot) {
                    var text = matchTouchSrc.dataset.right || matchTouchSrc.textContent.trim();
                    slot.innerHTML='<span style="color:#a5b4fc;font-weight:600">'+escHtml(text)+'</span>';
                    var bi2=parseInt(slot.dataset.bi), qi2=parseInt(slot.dataset.q), pi2=parseInt(slot.dataset.pi);
                    var st2=getState(bi2); st2.matchSlots[qi2]=st2.matchSlots[qi2]||{}; st2.matchSlots[qi2][pi2]=text;
                }
                matchTouchSrc.style.opacity='';
                matchTouchSrc=null;
            });
        });
        container.querySelectorAll('.qd-slot-drop').forEach(function(drop){
            if(drop._qdd) return; drop._qdd=true;
            drop.addEventListener('dragover', function(e){ e.preventDefault(); drop.style.borderColor='#818cf8'; });
            drop.addEventListener('dragleave', function(){ drop.style.borderColor=''; });
            drop.addEventListener('drop', function(e){
                e.preventDefault(); drop.style.borderColor='';
                var text=e.dataTransfer.getData('text/plain');
                drop.innerHTML='<span style="color:#a5b4fc;font-weight:600">'+escHtml(text)+'</span>';
                var bi=parseInt(drop.dataset.bi), qi=parseInt(drop.dataset.q), pi=parseInt(drop.dataset.pi);
                var st=getState(bi); st.matchSlots[qi]=st.matchSlots[qi]||{}; st.matchSlots[qi][pi]=text;
            });
        });
        container.querySelectorAll('.qd-match-check-btn').forEach(function(btn){
            if(btn._qmc) return; btn._qmc=true;
            var bi0=parseInt(btn.dataset.bi), st0=getState(bi0);
            // In test mode, hide Check Match — answers auto-record on Next
            if(st0.mode === 'test') { btn.style.display='none'; }
            btn.addEventListener('click', function(){
                var bi=parseInt(btn.dataset.bi), qi=parseInt(btn.dataset.q);
                var st=getState(bi); if(st.results[qi]!==undefined) return;
                var slots=st.matchSlots[qi]||{};
                var questions=st.questions, pairs=(questions[qi]||{}).pairs||[];
                var filled=true, allOk=true;
                for(var pi=0;pi<pairs.length;pi++){
                    if(slots[pi]===undefined){filled=false;break;}
                    if(slots[pi].trim().toLowerCase()!==pairs[pi].right.trim().toLowerCase()) allOk=false;
                }
                if(!filled){ showFb(bi,qi,null,'⚠ Fill all slots before checking.'); return; }
                var msg=allOk?'✅ All pairs matched correctly!':'❌ Some pairs are incorrect. Check your answers.';
                showFb(bi,qi,allOk,msg);
                recordResult(bi,qi,allOk,JSON.stringify(slots));
            });
        });

        // ── Order drag & drop ──────────────────────────────────────────────────
        var dragSrc = null;
        var orderTouchSrc = null;
        container.querySelectorAll('.qd-order-item').forEach(function(el){
            if(el._qob) return; el._qob=true;
            el.addEventListener('dragstart', function(){ dragSrc=el; el.style.opacity='0.4'; });
            el.addEventListener('dragend',   function(){ el.style.opacity=''; dragSrc=null; });
            el.addEventListener('dragover',  function(e){ e.preventDefault(); });
            el.addEventListener('drop',      function(e){
                e.preventDefault();
                if(dragSrc&&dragSrc!==el){
                    var p=el.parentNode, nodes=Array.from(p.children);
                    var di=nodes.indexOf(dragSrc), ti=nodes.indexOf(el);
                    if(di<ti) p.insertBefore(dragSrc,el.nextSibling); else p.insertBefore(dragSrc,el);
                }
            });
            // Touch support for order items
            el.addEventListener('touchstart', function(e){
                orderTouchSrc=el;
                el.style.opacity='0.4';
                e.preventDefault();
            }, {passive:false});
            el.addEventListener('touchmove', function(e){
                e.preventDefault();
                var touch=e.touches[0];
                var target=document.elementFromPoint(touch.clientX, touch.clientY);
                var item=target?target.closest('.qd-order-item'):null;
                el.parentNode.querySelectorAll('.qd-order-item').forEach(function(i){i.style.borderColor='';});
                if(item&&item!==el) item.style.borderColor='#818cf8';
            }, {passive:false});
            el.addEventListener('touchend', function(e){
                if(!orderTouchSrc) return;
                var touch=e.changedTouches[0];
                var target=document.elementFromPoint(touch.clientX, touch.clientY);
                var item=target?target.closest('.qd-order-item'):null;
                if(item&&item!==orderTouchSrc){
                    var p=item.parentNode, nodes=Array.from(p.children);
                    var di=nodes.indexOf(orderTouchSrc), ti=nodes.indexOf(item);
                    if(di<ti) p.insertBefore(orderTouchSrc,item.nextSibling); else p.insertBefore(orderTouchSrc,item);
                }
                orderTouchSrc.style.opacity='';
                el.parentNode.querySelectorAll('.qd-order-item').forEach(function(i){i.style.borderColor='';});
                orderTouchSrc=null;
            });
        });
        container.querySelectorAll('.qd-order-check-btn').forEach(function(btn){
            if(btn._qoc) return; btn._qoc=true;
            var bi0=parseInt(btn.dataset.bi), st0=getState(bi0);
            // In test mode, hide Check Order — answers auto-record on Next
            if(st0.mode === 'test') { btn.style.display='none'; }
            btn.addEventListener('click', function(){
                var bi=parseInt(btn.dataset.bi), qi=parseInt(btn.dataset.q);
                var st=getState(bi); if(st.results[qi]!==undefined) return;
                var list=document.getElementById('qd-order-'+bi+'-'+qi); if(!list) return;
                var items=Array.from(list.children).map(function(el){return el.dataset.item||el.textContent.replace('⠿','').trim();});
                var correct=(st.questions[qi]||{}).items||[];
                var ok=items.length===correct.length&&items.every(function(v,i){return v.trim().toLowerCase()===correct[i].trim().toLowerCase();});
                list.querySelectorAll('.qd-order-item').forEach(function(el){el.draggable=false;});
                showFb(bi,qi,ok,ok?'✅ Correct order!':'❌ Correct order: <strong>'+correct.join(' → ')+'</strong>');
                recordResult(bi,qi,ok,items.join(','));
            });
        });

        // ── Hotspot image click ────────────────────────────────────────────────
        container.querySelectorAll('.qd-hotspot-img').forEach(function(img){
            if(img._qhb) return; img._qhb=true;
            img.addEventListener('click', function(e){
                var bi=parseInt(img.dataset.bi), qi=parseInt(img.dataset.q);
                var st=getState(bi); if(st.results[qi]!==undefined) return;
                var rect=img.getBoundingClientRect();
                var x=Math.round((e.clientX-rect.left)/rect.width*100);
                var y=Math.round((e.clientY-rect.top)/rect.height*100);
                var mk=document.getElementById('qd-hs-marker-'+bi+'-'+qi);
                if(mk){mk.style.display='block';mk.style.left=x+'%';mk.style.top=y+'%';}
                showFb(bi,qi,null,'📍 Marked at ('+x+'%, '+y+'%) — AI will verify.');
                recordResult(bi,qi,null,'hotspot:'+x+','+y);
            });
        });

        // ── Navigation: Next / Back buttons ───────────────────────────────────
        container.querySelectorAll('.qd-prev[data-bi],.qd-next[data-bi]').forEach(function(btn){
            if(btn._qnb) return; btn._qnb=true;
            btn.addEventListener('click', function(){
                if(btn.disabled) return;
                var bi=parseInt(btn.dataset.bi), qi=parseInt(btn.dataset.goto);
                var st=getState(bi);
                // In test mode, auto-record unanswered match/order/essay/short on Next
                if(st.mode === 'test') {
                    var curQi = st.cur;
                    if(st.results[curQi]===undefined) {
                        var q = st.questions[curQi];
                        if(q.type==='match') {
                            var slots=st.matchSlots[curQi]||{}, pairs=q.pairs||[], allOk=true, filled=true;
                            for(var pi=0;pi<pairs.length;pi++){ if(slots[pi]===undefined){filled=false;break;} if(slots[pi].trim().toLowerCase()!==pairs[pi].right.trim().toLowerCase()) allOk=false; }
                            if(filled) recordResult(bi,curQi,allOk,JSON.stringify(slots));
                            else { recordResult(bi,curQi,false,JSON.stringify(slots)); }
                        } else if(q.type==='order') {
                            var list=document.getElementById('qd-order-'+bi+'-'+curQi);
                            if(list){ var items=Array.from(list.children).map(function(el){return el.dataset.item||el.textContent.replace('\u283f','').trim();}); var correct=q.items||[]; var ok=items.length===correct.length&&items.every(function(v,i){return v.trim().toLowerCase()===correct[i].trim().toLowerCase();}); recordResult(bi,curQi,ok,items.join(',')); }
                        } else if(q.type==='essay'||q.type==='short') {
                            var ta=document.getElementById('qd-short-'+bi+'-'+curQi)||document.getElementById('qd-essay-'+bi+'-'+curQi);
                            var val=ta?ta.value.trim():'';
                            if(val) { recordResult(bi,curQi,null,val); } // Pending manual review by creator
                        } else if(q.type==='fill') {
                            var inp=document.getElementById('qd-fill-'+bi+'-'+curQi);
                            if(inp){ var val2=inp.value.trim(); if(val2){ recordResult(bi,curQi,null,val2); } } // Pending manual review
                        }
                    }
                    updateHUD(bi);
                }
                if(qi<0) { showComplete(bi); return; }
                gotoScreen(bi, qi);
            });
        });

        // ── Submit button ──────────────────────────────────────────────────────
        container.querySelectorAll('.qd-submit[data-action="submit"],.qd-btn.qd-submit[data-bi]').forEach(function(btn){
            if(btn._qsub) return; btn._qsub=true;
            btn.addEventListener('click', function(){
                if(btn.disabled) return;
                var bi=parseInt(btn.dataset.bi);
                submitForGrading(bi);
            });
        });

        // ── Mode toggle: Practice ↔ Test ────────────────────────────────────────
        container.querySelectorAll('.quiz-dg-mode-toggle').forEach(function(btn){
            if(btn._qmt) return; btn._qmt=true;
            btn.addEventListener('click', function(){
                var idx = parseInt(btn.getAttribute('data-quiz-index'));
                var currentMode = btn.dataset.mode || 'practice';
                var newMode = currentMode === 'test' ? 'practice' : 'test';

                // Update button
                btn.dataset.mode = newMode;
                btn.textContent = newMode === 'test' ? '📝 Test' : '🎯 Practice';

                // Sync @mode: in editor markdown
                var blocks = parseBlocks(M.markdownEditor.value);
                var block = blocks[idx]; if (!block) return;
                var t = M.markdownEditor.value;
                var blockContent = t.substring(block.start, block.end);
                var modeRe = /(@mode:\s*)\S+/i;
                if (modeRe.test(blockContent)) {
                    var updated = blockContent.replace(modeRe, '$1' + newMode);
                    M.markdownEditor.value = t.substring(0, block.start) + updated + t.substring(block.end);
                } else {
                    // Insert @mode: before closing }}
                    var insertPos = block.end - 2;
                    M.markdownEditor.value = t.substring(0, insertPos) + '\n  @mode: ' + newMode + '\n' + t.substring(insertPos);
                }
                if (M.debouncedRender) M.debouncedRender();
            });
        });

        // ── Card-level buttons: Remove, Generate, Grade ────────────────────────
        container.querySelectorAll('.quiz-dg-remove').forEach(function(btn){
            if(btn._qrb) return; btn._qrb=true;
            btn.addEventListener('click', function(){
                var idx=parseInt(btn.getAttribute('data-quiz-index'));
                var blocks=parseBlocks(M.markdownEditor.value);
                if(blocks[idx]){
                    var t=M.markdownEditor.value;
                    M.markdownEditor.value=t.substring(0,blocks[idx].start)+t.substring(blocks[idx].end);
                    if(M.debouncedRender) M.debouncedRender();
                }
            });
        });

        container.querySelectorAll('.quiz-dg-gen-btn').forEach(function(btn){
            if(btn._qgb) return; btn._qgb=true;
            btn.addEventListener('click', async function(){
                var idx=parseInt(btn.getAttribute('data-quiz-index'));
                var blocks=parseBlocks(M.markdownEditor.value);
                var block=blocks[idx]; if(!block) return;

                // Get prompt from textarea (may have been edited live)
                var card = btn.closest('.quiz-dg-card');
                var promptArea = card ? card.querySelector('.quiz-dg-prompt-input') : null;
                var userPrompt = promptArea ? promptArea.value.trim() : (block.prompt || '');
                var hasChapter = block.chapter && block.chapter.length > 10;
                var hasPrompt = userPrompt && userPrompt.length > 3;

                if (!hasChapter && !hasPrompt) {
                    if(M.showToast) M.showToast('⚠ Please describe the quiz you want, or paste chapter content using @chapter:', 'warning');
                    return;
                }

                btn.textContent='⏳ Generating…'; btn.disabled=true;

                // Use per-card model selector if available
                var modelSelect = card ? card.querySelector('.quiz-dg-model-select') : null;
                var perCardModel = modelSelect ? modelSelect.value : null;
                var originalModel = M.getCurrentAiModel ? M.getCurrentAiModel() : null;
                var model = perCardModel || originalModel || 'gemini-flash';

                // Switch model if per-card selection differs
                if (perCardModel && perCardModel !== originalModel && M.switchToModel) {
                    M.switchToModel(perCardModel);
                }

                // Check model readiness (trigger download/consent/API key if needed)
                var currentModelId = perCardModel || originalModel || model;
                var modelsCfg = window.AI_MODELS || {};
                var modelInfo = modelsCfg[currentModelId];
                if (modelInfo) {
                    if (modelInfo.isLocal && M._ai && M._ai.isLocalModel && M._ai.isLocalModel(currentModelId)) {
                        var ls = M._ai.getLocalState(currentModelId);
                        if (!ls.loaded && !ls.worker) {
                            var consentKey = (M.KEYS && M.KEYS.AI_CONSENTED_PREFIX ? M.KEYS.AI_CONSENTED_PREFIX : 'ai-consented-') + currentModelId;
                            var hasConsent = localStorage.getItem(consentKey);
                            if (hasConsent) {
                                M._ai.initAiWorker(currentModelId);
                            } else if (M.showModelDownloadPopup) {
                                M.showModelDownloadPopup(currentModelId);
                            }
                            btn.textContent='🤖 Generate Questions'; btn.disabled=false;
                            if(M.showToast) M.showToast('📦 Model needs to download first. Please click Generate again after the model is ready.', 'info');
                            return;
                        }
                    }
                    // Cloud model — check API key
                    var providers = M.getCloudProviders ? M.getCloudProviders() : {};
                    var cloudProvider = providers[currentModelId];
                    if (cloudProvider && !cloudProvider.getKey()) {
                        if (M.showApiKeyModal) M.showApiKeyModal(currentModelId);
                        btn.textContent='🤖 Generate Questions'; btn.disabled=false;
                        if(M.showToast) M.showToast('🔑 Please enter your API key for this model.', 'info');
                        return;
                    }
                }

                // ── Fetch web search context ──
                var searchContext = '';
                var searchPanel = card ? card.querySelector('.quiz-dg-search-panel') : null;
                if (searchPanel) {
                    var searchProviders = [];
                    searchPanel.querySelectorAll('.quiz-dg-search-check:checked').forEach(function(cb) {
                        searchProviders.push(cb.value);
                    });
                    if (searchProviders.length > 0 && M.webSearch) {
                        try {
                            btn.textContent='🔍 Searching…';
                            var searchQuery = userPrompt || block.subject + ' ' + block.title;
                            var searchResults = await M.webSearch.performMultiSearch(searchQuery, 5, searchProviders);
                            searchContext = M.webSearch.formatResultsForLLM(searchResults);
                        } catch(e) { console.warn('[Quiz] Search failed:', e); }
                    }
                }

                // ── Fetch memory context ──
                var memoryContext = '';
                if (block.useMemory && block.useMemory.length > 0 && block.useMemory.indexOf('none') === -1 && M._memory) {
                    try {
                        btn.textContent='📚 Getting context…';
                        var memQuery = userPrompt || block.subject + ' ' + block.title;
                        var memChunks = await M._memory.search(block.useMemory, memQuery, 5);
                        memoryContext = M._memory.formatForContext(memChunks);
                    } catch(e) { console.warn('[Quiz] Memory search failed:', e); }
                } else {
                    // Auto-discover memory sources from document if no explicit @use:
                    var editorText = M.markdownEditor.value;
                    var autoSources = [];
                    var memRegex = /\{\{Memory:[^}]*Name:\s*([^\s}]+)/gi;
                    var memMatch;
                    while ((memMatch = memRegex.exec(editorText)) !== null) {
                        var name = memMatch[1].replace(/[,}]/g, '').trim();
                        if (name && autoSources.indexOf(name) === -1) autoSources.push(name);
                    }
                    if (autoSources.length > 0 && M._memory) {
                        try {
                            btn.textContent='📚 Getting context…';
                            var autoQuery = userPrompt || block.subject + ' ' + block.title;
                            var autoChunks = await M._memory.search(autoSources, autoQuery, 5);
                            memoryContext = M._memory.formatForContext(autoChunks);
                        } catch(e) { /* auto-discover failed, proceed without */ }
                    }
                }

                btn.textContent='⏳ Generating…';

                // Build prompt with QUIZ_SYNTAX_SKILL injection
                var fullPrompt = QUIZ_SYNTAX_SKILL + '\n\n---\n\n';
                fullPrompt += 'You are an expert '+block.subject+' teacher.\n';
                fullPrompt += 'Generate exactly '+block.numQuestions+' questions at **'+block.difficulty+'** difficulty.\n\n';

                // Inject search results as source material
                if (searchContext) {
                    fullPrompt += 'WEB RESEARCH RESULTS (use as source material for questions):\n' + searchContext + '\n\n';
                }
                // Inject memory context as source material
                if (memoryContext) {
                    fullPrompt += 'RELEVANT CONTEXT FROM ATTACHED DOCUMENTS (use as source material for questions):\n' + memoryContext + '\n---\n\n';
                }

                if (hasChapter && hasPrompt) {
                    fullPrompt += 'USER INSTRUCTIONS: ' + userPrompt + '\n\n';
                    fullPrompt += 'SOURCE MATERIAL (generate questions from this):\n' + block.chapter;
                } else if (hasChapter) {
                    fullPrompt += 'Read the following chapter and generate questions from it.\n\n';
                    fullPrompt += 'Chapter:\n' + block.chapter;
                } else {
                    fullPrompt += 'Create a quiz based on this description:\n' + userPrompt;
                }

                function resetBtn() {
                    btn.textContent='🤖 Generate Questions'; btn.disabled=false;
                    if (perCardModel && perCardModel !== originalModel && originalModel && M.switchToModel) {
                        setTimeout(function(){ M.switchToModel(originalModel); }, 300);
                    }
                }

                function handleResult(res) {
                    var rawLines = res.split('\n');
                    var lines = postProcessQuizLines(rawLines);
                    if (!lines.length) {
                        resetBtn();
                        if(M.showToast) M.showToast('⚠ AI did not return valid questions. Try a different prompt or model.', 'warning');
                        return;
                    }
                    // Re-parse blocks (editor may have changed during generation)
                    var freshBlocks = parseBlocks(M.markdownEditor.value);
                    var freshBlock = freshBlocks[idx];
                    if (freshBlock) {
                        var t = M.markdownEditor.value;
                        var ins = freshBlock.end - 2;
                        M.markdownEditor.value = t.substring(0, ins) + '\n' + lines.join('\n') + '\n' + t.substring(ins);
                        if (M.debouncedRender) M.debouncedRender();
                    }
                    resetBtn();
                    if(M.showToast) M.showToast('✅ Generated ' + lines.filter(function(l){ return l.match(/^@question/i); }).length + ' questions!', 'success');
                }

                function handleError(err) {
                    console.error('🤖 [Quiz Generate] Error:', err);
                    resetBtn();
                    if(M.showToast) M.showToast('⚠ ' + (err.message || err || 'Generation failed. Check your AI model.'), 'warning');
                }

                // Try requestAiTask (Promise-based) first, fall back to callback-based
                if (M.requestAiTask) {
                    try {
                        var result = await M.requestAiTask({
                            taskType: 'generate',
                            context: '',
                            userPrompt: fullPrompt,
                            enableThinking: false,
                            silent: true
                        });
                        handleResult(result);
                    } catch(err) {
                        handleError(err);
                    }
                } else if (M.runAiPrompt) {
                    M.runAiPrompt({prompt: fullPrompt, model: model}, function(res) {
                        handleResult(res);
                    });
                } else {
                    resetBtn();
                    if(M.showToast) M.showToast('⚠ No AI model available. Please configure an AI model first.', 'warning');
                }
            });
        });

        // ── Model select: handle local model loading / API key prompts ───────
        container.querySelectorAll('.quiz-dg-model-select').forEach(function(sel){
            if(sel._qms) return; sel._qms=true;
            sel.addEventListener('change', function(){
                var modelId = this.value;
                if (!modelId) return;
                var models = window.AI_MODELS || {};
                var modelInfo = models[modelId];
                // Trigger local model download if needed
                if (modelInfo && modelInfo.isLocal && M._ai && M._ai.isLocalModel && M._ai.isLocalModel(modelId)) {
                    var ls = M._ai.getLocalState(modelId);
                    if (!ls.loaded && !ls.worker) {
                        var consentKey = M.KEYS.AI_CONSENTED_PREFIX + modelId;
                        var hasConsent = localStorage.getItem(consentKey);
                        if (hasConsent) { M._ai.initAiWorker(modelId); }
                        else if (M.showModelDownloadPopup) { M.showModelDownloadPopup(modelId); }
                    }
                }
                // Prompt for API key if cloud model needs one
                var providers = M.getCloudProviders ? M.getCloudProviders() : {};
                var cloudProvider = providers[modelId];
                if (cloudProvider && !cloudProvider.getKey()) {
                    M.showApiKeyModal(modelId);
                }
            });
        });

        // ── Search toggle: show/hide search pills panel ──────────────────────
        container.querySelectorAll('.quiz-dg-search-btn').forEach(function(btn){
            if(btn._qsb) return; btn._qsb=true;
            btn.addEventListener('click', function(e){
                e.stopPropagation();
                var card = this.closest('.quiz-dg-card');
                if (!card) return;
                var panel = card.querySelector('.quiz-dg-search-panel');
                if (panel) {
                    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                }
                // Hide memory dropdown if open
                var memDrop = card.querySelector('.quiz-dg-memory-dropdown');
                if (memDrop) memDrop.style.display = 'none';
            });
        });

        // ── Search pill checkbox: sync to editor @search: field ──────────────
        container.querySelectorAll('.quiz-dg-search-check').forEach(function(cb){
            if(cb._qsc) return; cb._qsc=true;
            cb.addEventListener('change', function(){
                var pill = this.closest('.quiz-dg-search-pill');
                if (pill) pill.classList.toggle('active', this.checked);
                // Count active and update button badge
                var card = this.closest('.quiz-dg-card');
                if (!card) return;
                var panel = card.querySelector('.quiz-dg-search-panel');
                var count = panel ? panel.querySelectorAll('.quiz-dg-search-check:checked').length : 0;
                var searchBtn = card.querySelector('.quiz-dg-search-btn');
                if (searchBtn) {
                    searchBtn.textContent = '🔍' + (count > 0 ? ' ' + count : '');
                    searchBtn.classList.toggle('active', count > 0);
                }
                // Sync to editor
                var idx = parseInt(this.dataset.quizIndex);
                var blocks = parseBlocks(M.markdownEditor.value);
                var block = blocks[idx]; if(!block) return;
                var t = M.markdownEditor.value;
                var inner = t.substring(block.start, block.end);
                // Remove existing @search: line
                inner = inner.replace(/^\s*@search:\s*.+$/mi, '').trim();
                // Build new search line
                var providers = [];
                panel.querySelectorAll('.quiz-dg-search-check:checked').forEach(function(c){ providers.push(c.value); });
                if (providers.length > 0) {
                    var searchLine = '  @search: ' + providers.join(', ');
                    // Insert after title line (first line)
                    var closeBraces = inner.lastIndexOf('}}');
                    if (closeBraces > 0) {
                        inner = inner.substring(0, closeBraces) + '\n' + searchLine + '\n' + inner.substring(closeBraces);
                    }
                }
                M.markdownEditor.value = t.substring(0, block.start) + inner + t.substring(block.end);
            });
        });

        // ── Helper: get current @use: sources for a quiz block ──────────────────
        function getQuizUseSources(quizIndex) {
            var blocks = parseBlocks(M.markdownEditor.value);
            if (quizIndex < blocks.length && blocks[quizIndex].useMemory) {
                return blocks[quizIndex].useMemory.slice();
            }
            return [];
        }
        // ── Helper: update @use: field in editor for a quiz block ────────────
        function updateQuizUseField(quizIndex, selectedSources) {
            var blocks = parseBlocks(M.markdownEditor.value);
            if (quizIndex >= blocks.length) return;
            var block = blocks[quizIndex];
            var t = M.markdownEditor.value;
            var inner = t.substring(block.start, block.end);
            // Remove existing @use: line
            inner = inner.replace(/^\s*@use:\s*.+$/mi, '').trim();
            // Build new @use: line
            if (selectedSources.length > 0) {
                var useLine = '  @use: ' + selectedSources.join(', ');
                var cb = inner.lastIndexOf('}}');
                if (cb > 0) {
                    inner = inner.substring(0, cb) + '\n' + useLine + '\n' + inner.substring(cb);
                }
            }
            M.markdownEditor.value = t.substring(0, block.start) + inner + t.substring(block.end);
            // Update button badge
            var card = container.querySelector('.quiz-dg-card[data-quiz-index="'+quizIndex+'"]');
            if (card) {
                var memBtn = card.querySelector('.quiz-dg-memory-btn');
                if (memBtn) {
                    memBtn.textContent = '📚' + (selectedSources.length > 0 ? ' ✓' : '');
                    memBtn.classList.toggle('active', selectedSources.length > 0);
                }
            }
        }
        // ── Helper: get doc Memory names ─────────────────────────────────────
        function getDocMemoryNames() {
            var text = M.markdownEditor ? M.markdownEditor.value : '';
            var names = [];
            var re = /\{\{@?Memory:[^}]*(?:@name|Name):\s*([^\s}]+)/gi;
            var m2;
            while ((m2 = re.exec(text)) !== null) {
                var n = m2[1].replace(/[,}]/g, '').trim();
                if (n && names.indexOf(n) === -1) names.push(n);
            }
            return names;
        }

        var _quizMemAttaching = false;

        // ── Memory toggle: show/hide memory source dropdown ──────────────────
        container.querySelectorAll('.quiz-dg-memory-btn').forEach(function(btn){
            if(btn._qmb) return; btn._qmb=true;
            btn.addEventListener('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                var card = this.closest('.quiz-dg-card');
                if (!card) return;
                var dropdown = card.querySelector('.quiz-dg-memory-dropdown');
                if (!dropdown) return;
                // Toggle
                var wasHidden = dropdown.style.display === 'none';
                dropdown.style.display = wasHidden ? 'block' : 'none';
                // Hide search panel if open
                var searchPanel = card.querySelector('.quiz-dg-search-panel');
                if (searchPanel) searchPanel.style.display = 'none';

                if (!wasHidden) return;

                // Populate memory sources list
                var sourceList = dropdown.querySelector('.quiz-dg-memory-source-list');
                if (!sourceList) return;
                sourceList.innerHTML = '<span class="quiz-dg-memory-loading">Loading…</span>';

                var idx = parseInt(card.dataset.quizIndex);
                var currentSources = getQuizUseSources(idx);
                var docNames = getDocMemoryNames();

                function renderSources(sources) {
                    var html = '';
                    sources.forEach(function(src) {
                        var name = typeof src === 'string' ? src : src.name;
                        var label = (typeof src === 'object' && src.displayName) ? src.displayName : name;
                        var badge = (typeof src === 'object' && src.origin === 'document') ? ' <small class="quiz-dg-mem-badge">doc</small>'
                            : (typeof src === 'object' && src.origin === 'stored') ? ' <small class="quiz-dg-mem-badge">saved</small>' : '';
                        var checked = currentSources.indexOf(name) !== -1 ? ' checked' : '';
                        html += '<label class="quiz-dg-memory-source'+(checked?' active':'')+'">' +
                            '<input type="checkbox" class="quiz-dg-memory-check" value="'+escHtml(name)+'" data-quiz-index="'+idx+'"'+checked+'>' +
                            ' '+escHtml(label)+badge +
                            '</label>';
                    });
                    sourceList.innerHTML = html || '<span class="quiz-dg-memory-loading">No sources available. Use 📂 Folder or 📄 Files below.</span>';
                    // Bind checkbox change handlers
                    sourceList.querySelectorAll('.quiz-dg-memory-check').forEach(function(mcb) {
                        mcb.addEventListener('change', function() {
                            var label = this.closest('.quiz-dg-memory-source');
                            if (label) label.classList.toggle('active', this.checked);
                            var selected = [];
                            sourceList.querySelectorAll('.quiz-dg-memory-check:checked').forEach(function(c){ selected.push(c.value); });
                            updateQuizUseField(idx, selected);
                        });
                    });
                }

                if (M._memory && M._memory.listAllSources) {
                    M._memory.listAllSources(docNames).then(function(sources) {
                        renderSources(sources);
                    }).catch(function() {
                        // Fallback: show workspace + doc names
                        var fallback = [{ name: 'workspace', origin: 'stored' }];
                        docNames.forEach(function(dn) { fallback.push({ name: dn, origin: 'document' }); });
                        renderSources(fallback);
                    });
                } else {
                    // No M._memory — show workspace + doc names as fallback
                    var fallback = [{ name: 'workspace', origin: 'stored' }];
                    docNames.forEach(function(dn) { fallback.push({ name: dn, origin: 'document' }); });
                    renderSources(fallback);
                }
            });
        });

        // Close memory dropdown on outside click
        document.addEventListener('click', function(e) {
            if (_quizMemAttaching) return;
            if (!e.target.closest('.quiz-dg-memory-dropdown') && !e.target.closest('.quiz-dg-memory-btn')) {
                container.querySelectorAll('.quiz-dg-memory-dropdown').forEach(function(d) { d.style.display = 'none'; });
            }
        });

        // ── Quick-attach Folder from quiz card ──────────────────────────────
        container.querySelectorAll('.quiz-dg-memory-attach-folder').forEach(function(btn){
            if(btn._qmaf) return; btn._qmaf=true;
            btn.addEventListener('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.quizIndex);
                if (!M._memory) { if(M.showToast) M.showToast('Memory engine not loaded yet.', 'warning'); return; }
                var tempName = 'folder-' + Date.now();
                btn.disabled = true;
                btn.textContent = '⏳ Scanning...';
                _quizMemAttaching = true;
                M._memory.attachFolder(tempName).then(function(info) {
                    var name = info.folderName.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9\-_]/g, '');
                    if (!name) name = tempName;
                    if(M.showToast) M.showToast('📚 Indexed ' + info.chunkCount + ' chunks from "' + info.folderName + '"', 'success');
                    var current = getQuizUseSources(idx);
                    if (current.indexOf(name) === -1) current.push(name);
                    updateQuizUseField(idx, current);
                    // Re-open dropdown to show new source
                    var card = container.querySelector('.quiz-dg-card[data-quiz-index="'+idx+'"]');
                    if (card) {
                        var memBtn = card.querySelector('.quiz-dg-memory-btn');
                        if (memBtn) { memBtn.click(); }
                    }
                }).catch(function(err) {
                    if (err.name !== 'AbortError' && M.showToast) M.showToast('Failed: ' + err.message, 'error');
                }).finally(function() {
                    _quizMemAttaching = false;
                    btn.disabled = false;
                    btn.textContent = '📂 Folder';
                });
            });
        });

        // ── Quick-attach Files from quiz card ───────────────────────────────
        container.querySelectorAll('.quiz-dg-memory-attach-files').forEach(function(btn){
            if(btn._qmafi) return; btn._qmafi=true;
            btn.addEventListener('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                var idx = parseInt(this.dataset.quizIndex);
                if (!M._memory) { if(M.showToast) M.showToast('Memory engine not loaded yet.', 'warning'); return; }
                var tempName = 'files-' + Math.random().toString(36).substring(2, 7);
                btn.disabled = true;
                btn.textContent = '⏳ Reading...';
                _quizMemAttaching = true;
                M._memory.attachFiles(tempName).then(function(info) {
                    var label = info.fileNames && info.fileNames.length > 0
                        ? info.fileNames.join(', ')
                        : tempName;
                    if(M.showToast) M.showToast('📚 Added ' + info.addedChunks + ' chunks from ' + label, 'success');
                    var current = getQuizUseSources(idx);
                    if (current.indexOf(tempName) === -1) current.push(tempName);
                    updateQuizUseField(idx, current);
                    var card = container.querySelector('.quiz-dg-card[data-quiz-index="'+idx+'"]');
                    if (card) {
                        var memBtn = card.querySelector('.quiz-dg-memory-btn');
                        if (memBtn) { memBtn.click(); }
                    }
                }).catch(function(err) {
                    if (err.name !== 'AbortError' && M.showToast) M.showToast('Failed: ' + err.message, 'error');
                }).finally(function() {
                    _quizMemAttaching = false;
                    btn.disabled = false;
                    btn.textContent = '📄 Files';
                });
            });
        });

        // ── Prompt textarea: sync to editor + enable Generate button ──────────
        container.querySelectorAll('.quiz-dg-prompt-input').forEach(function(ta){
            if(ta._qpi) return; ta._qpi=true;
            var syncTimer=null;
            ta.addEventListener('input', function(){
                var self=this;
                // Auto-resize
                self.style.height='auto'; self.style.height=self.scrollHeight+'px';
                // Enable/disable the inline Generate button (for prompt-only cards)
                var card=self.closest('.quiz-dg-card');
                if(card){
                    var inlineBtn=card.querySelector('.quiz-dg-gen-prompt');
                    if(inlineBtn) inlineBtn.disabled = self.value.trim().length < 4;
                    // Also enable header Generate button
                    var headerBtn=card.querySelector('.quiz-dg-gen-btn:not(.quiz-dg-gen-prompt)');
                    if(headerBtn) headerBtn.disabled = false;
                }
                // Sync @prompt: field to editor markdown (debounced)
                clearTimeout(syncTimer);
                syncTimer=setTimeout(function(){
                    var idx=parseInt(self.dataset.quizIndex);
                    var blocks=parseBlocks(M.markdownEditor.value);
                    var block=blocks[idx]; if(!block) return;
                    var t=M.markdownEditor.value;
                    var blockContent = t.substring(block.start, block.end);
                    var promptRe = /(?:^|\n)(\s*@prompt:\s*[^\n@]*(?:\n(?!\s*@)[^\n]*)*)/i;
                    var newPromptLine = '  @prompt: ' + self.value.trim();
                    if (promptRe.test(blockContent)) {
                        var updated = blockContent.replace(promptRe, '\n' + newPromptLine);
                        M.markdownEditor.value = t.substring(0, block.start) + updated + t.substring(block.end);
                    } else {
                        // Insert @prompt before closing }}
                        var insertPos = block.end - 2;
                        M.markdownEditor.value = t.substring(0, insertPos) + '\n' + newPromptLine + '\n' + t.substring(insertPos);
                    }
                }, 600);
            });
            // Auto-resize on load
            ta.style.height='auto'; ta.style.height=ta.scrollHeight+'px';
        });

        container.querySelectorAll('.quiz-dg-grade-btn').forEach(function(btn){
            if(btn._qgrb) return; btn._qgrb=true;
            btn.addEventListener('click', function(){
                var idx=parseInt(btn.getAttribute('data-quiz-index'));
                var answers=window.__qdAnswers&&window.__qdAnswers[idx];
                if(!answers){
                    if(M.showToast) M.showToast('⚠ Complete the quiz first, then click Submit for AI Grading.','warning');
                    return;
                }
                var blocks=parseBlocks(M.markdownEditor.value), block=blocks[idx]; if(!block) return;
                btn.textContent='⏳ Grading…'; btn.disabled=true;
                var model=(M.getCurrentAiModel&&M.getCurrentAiModel())||'gemini-flash';
                var prompt='You are an encouraging '+block.subject+' teacher. Grade this quiz (difficulty: '+block.difficulty+').\n\n'+
                    'For each question:\n✅ CORRECT / ❌ INCORRECT / 📝 NOTED\nIf wrong: correct answer + simple friendly explanation.\nFor short/essay/likert: brief personalised feedback.\n\n'+
                    'End with:\n**Score:** X / '+answers.length+'\n**Stars:** ⭐ (1-5)\n**Message:** 2 warm sentences\n\n'+
                    'Answers:\n'+JSON.stringify(answers,null,2);
                var cb=function(res){
                    var panel=document.querySelector('.quiz-dg-grade-result[data-quiz-index="'+idx+'"]');
                    if(panel){
                        var html=window.marked?marked.parse(res):res.replace(/\n/g,'<br>');
                        panel.innerHTML='<div class="quiz-dg-grade-inner"><div class="quiz-dg-grade-header">🤖 AI Feedback</div>'+html+'</div>';
                        panel.style.display='block';
                        panel.scrollIntoView({behavior:'smooth',block:'nearest'});
                    }
                    btn.textContent='📊 Grade Answers'; btn.disabled=false;
                };
                if(M.requestAiTask)    M.requestAiTask({prompt:prompt,model:model},cb);
                else if(M.runAiPrompt) M.runAiPrompt({prompt:prompt,model:model},cb);
                else{btn.textContent='⚠ No AI';btn.disabled=false;}
            });
        });

        // ── Add Question toggle ───────────────────────────────────────────────
        container.querySelectorAll('.quiz-dg-add-btn').forEach(function(btn){
            if(btn._qab) return; btn._qab=true;
            btn.addEventListener('click', function(e){
                e.stopPropagation();
                var idx=btn.getAttribute('data-quiz-index');
                var dd=container.querySelector('.quiz-dg-add-dropdown[data-quiz-index="'+idx+'"]');
                if(!dd) return;
                container.querySelectorAll('.quiz-dg-add-dropdown').forEach(function(d){ if(d!==dd) d.style.display='none'; });
                dd.style.display = dd.style.display==='none' ? 'grid' : 'none';
            });
        });

        // ── Add Question option click ─────────────────────────────────────────
        container.querySelectorAll('.quiz-dg-add-option').forEach(function(opt){
            if(opt._qao) return; opt._qao=true;
            opt.addEventListener('click', function(){
                var idx=parseInt(opt.getAttribute('data-quiz-index'));
                var template=opt.getAttribute('data-q-template');
                var blocks=parseBlocks(M.markdownEditor.value);
                if(!blocks[idx]) return;
                var text=M.markdownEditor.value;
                var insertPos=blocks[idx].end-2; // before }}
                var newLine='  '+template+'\n';
                M.markdownEditor.value=text.substring(0,insertPos)+newLine+text.substring(insertPos);
                if(M.debouncedRender) M.debouncedRender();
            });
        });

        // Close dropdown when clicking outside
        if(!container._quizAddCloseHandler){
            container._quizAddCloseHandler=true;
            document.addEventListener('click', function(){
                container.querySelectorAll('.quiz-dg-add-dropdown').forEach(function(d){ d.style.display='none'; });
            });
        }
    }

    // Listen for quiz-grade postMessage (from old html-autorun quizzes)
    window.addEventListener('message', function(e){
        if(!e.data||e.data.type!=='textagent-quiz-grade') return;
        window.__qdAnswers=window.__qdAnswers||{};
        window.__qdAnswers[e.data.blockIndex]=e.data.answers;
        if(M.showToast) M.showToast('✅ Quiz submitted ('+(e.data.xp||0)+' XP) — click 📊 Grade Answers for AI feedback','success');
        var gb=document.querySelector('.quiz-dg-grade-btn[data-quiz-index="'+e.data.blockIndex+'"]');
        if(gb){gb.style.background='linear-gradient(135deg,#059669,#0891b2)'; gb.style.fontWeight='800';}
    });

    // ─── Insert helper ────────────────────────────────────────────────────────
    function insertQuizTag(){
        if(!M.markdownEditor) return;
        var tmpl=[
            '{{Quiz: 🌍 Science Challenge (Dark)',
            '  @subject: Science',
            '  @field: css | --bg-primary: #0c1222; --bg-secondary: #1a1a2e; --text-primary: #e2e8f0; --border-color: #0f3460;',
            '  @css: --quiz-accent: #e94560; --quiz-accent-bg: #1a1a2e; --quiz-btn-gradient: linear-gradient(135deg, #e94560, #0f3460);',
            '  @difficulty: Medium',
            '  @mode: test',
            '  @userinfo: name, email',
            '  @question[mcq]: What is the chemical symbol for Gold? | Au | Ag,Au,Fe,Cu',
            '  @hint: Gold\'s symbol comes from the Latin word "Aurum"',
            '  @hint: https://en.wikipedia.org/wiki/Gold',
            '  @question[tf]: The speed of light is approximately 300,000 km/s | true',
            '  @hint: Light travels fast enough to circle Earth 7.5 times per second',
            '  @question[fill]: Water boils at ___ degrees Celsius at sea level | 100',
            '  @hint: Think about the Celsius scale — it was designed around water!',
            '  @hint: https://www.youtube.com/watch?v=UkRgRhTagtA',
            '  @question[match]: H2O=Water, NaCl=Salt, CO2=Carbon Dioxide, O2=Oxygen | Match formulas to names',
            '  @hint: These are common chemical compounds you encounter daily',
            '  @question[order]: Mercury,Venus,Earth,Mars,Jupiter | Order planets from Sun',
            '  @hint: My Very Excited Mother Just... (mnemonic)',
            '  @question[short]: Name two greenhouse gases. | carbon dioxide,methane,co2,ch4',
            '  @hint: One is produced by burning fossil fuels, the other by livestock',
            '  @question[essay]: Explain why the sky appears blue during the day.',
            '  @hint: It has to do with how sunlight interacts with Earth\'s atmosphere',
            '  @hint: https://en.wikipedia.org/wiki/Rayleigh_scattering',
            '  @question[likert]: I find science topics interesting and engaging',
            '  @question[mcq]: Which planet is known as the Red Planet? | Mars | Venus,Mars,Jupiter,Saturn',
            '  @hint: This planet has the largest volcano in the solar system — Olympus Mons',
            '}}',
            '',
            '{{Quiz: 🌍 Science Challenge (Light)',
            '  @subject: Science',
            '  @field: css | --bg-primary: #ffffff; --bg-secondary: #f8fafc; --text-primary: #0f172a; --border-color: #cbd5e1;',
            '  @css: --quiz-accent: #6366f1; --quiz-accent-bg: #eef2ff; --quiz-btn-gradient: linear-gradient(135deg, #6366f1, #8b5cf6); --quiz-correct: #16a34a; --quiz-correct-bg: #dcfce7; --quiz-correct-text: #166534; --quiz-wrong: #dc2626; --quiz-wrong-bg: #fee2e2; --quiz-wrong-text: #991b1b;',
            '  @difficulty: Medium',
            '  @mode: test',
            '  @userinfo: name, email',
            '  @question[mcq]: What is the chemical symbol for Gold? | Au | Ag,Au,Fe,Cu',
            '  @hint: Gold\'s symbol comes from the Latin word "Aurum"',
            '  @question[tf]: The speed of light is approximately 300,000 km/s | true',
            '  @hint: Light travels fast enough to circle Earth 7.5 times per second',
            '  @question[fill]: Water boils at ___ degrees Celsius at sea level | 100',
            '  @hint: Think about the Celsius scale — it was designed around water!',
            '  @question[mcq]: Which planet is known as the Red Planet? | Mars | Venus,Mars,Jupiter,Saturn',
            '  @hint: This planet has the largest volcano in the solar system — Olympus Mons',
            '}}'
        ].join('\n');
        var ed=M.markdownEditor, s=ed.selectionStart;
        ed.value=ed.value.substring(0,s)+tmpl+ed.value.substring(ed.selectionEnd);
        ed.selectionStart=ed.selectionEnd=s+tmpl.length;
        if(M.debouncedRender) M.debouncedRender();
    }


    // ─── Extra CSS (dynamic styles for complex types) ─────────────────────────
    var style=document.createElement('style');
    style.textContent=[
        '.qd-likert{display:flex;gap:6px;flex-wrap:wrap;}',
        '.qd-likert-btn{flex:1;min-width:80px;background:#0f172a;border:2px solid #334155;border-radius:10px;padding:10px 8px;cursor:pointer;color:#e2e8f0;font-size:.8em;font-weight:600;font-family:inherit;transition:all .2s;text-align:center;}',
        '.qd-likert-btn:hover:not(:disabled){border-color:#818cf8;background:#1e1b4b;}',
        '.qd-likert-btn.qd-likert-sel{border-color:#818cf8;background:#1e1b4b;color:#a5b4fc;}',
        '.qd-likert-btn:disabled{opacity:.6;cursor:not-allowed;}',
        '.qd-match-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}',
        '.qd-match-left-item,.qd-match-right-item{background:#0f172a;border:1.5px solid #334155;border-radius:8px;padding:10px 14px;font-size:.9em;color:#e2e8f0;margin:4px 0;}',
        '.qd-match-right-item{cursor:grab;border-style:dashed;color:#a5b4fc;}',
        '.qd-match-right-item:active{cursor:grabbing;}',
        '.qd-match-slots{display:flex;flex-direction:column;gap:6px;}',
        '.qd-match-slot{display:flex;align-items:center;gap:8px;}',
        '.qd-slot-label{color:#94a3b8;font-size:.85em;font-weight:600;min-width:80px;white-space:nowrap;}',
        '.qd-slot-drop{flex:1;background:#0f172a;border:2px dashed #4338ca;border-radius:8px;padding:10px 14px;font-size:.9em;min-height:40px;display:flex;align-items:center;transition:border-color .15s;}',
        '.qd-slot-ph{color:#475569;}',
        '.qd-order-list{display:flex;flex-direction:column;gap:6px;}',
        '.qd-order-item{background:#0f172a;border:1.5px solid #334155;border-radius:8px;padding:12px 14px;font-size:.9em;color:#e2e8f0;cursor:grab;display:flex;align-items:center;gap:10px;transition:all .2s;}',
        '.qd-order-item:hover{background:#1e293b;border-color:#818cf8;}',
        '.qd-order-item:active{cursor:grabbing;}',
        '.qd-ord-handle{color:#475569;font-size:1.1em;user-select:none;}',
        '.qd-hotspot-img{max-width:100%;border-radius:10px;cursor:crosshair;border:2px solid #334155;}',
        '.qd-hs-marker{position:absolute;width:20px;height:20px;background:#ef4444;border-radius:50%;transform:translate(-50%,-50%);border:3px solid #fff;pointer-events:none;}',
    ].join('');
    document.head.appendChild(style);

    // ─── Expose ───────────────────────────────────────────────────────────────
    M.transformQuizMarkdown  = transformQuizMarkdown;
    M.bindQuizPreviewActions = bindQuizPreviewActions;
    M.parseQuizBlocks        = parseBlocks;

    if(M.registerFormattingAction) M.registerFormattingAction('quiz-tag', insertQuizTag);
    var btn=document.getElementById('qab-quiz');
    if(btn) btn.addEventListener('click', insertQuizTag);

})(window.MDView);
