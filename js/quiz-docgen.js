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
        var re = /\{\{@?Quiz:\s*([\s\S]*?)\}\}/gi, m;
        while ((m = re.exec(src)) !== null) {
            if (inFence(m.index, fences)) continue;
            var body = m[1].trim(), lines = body.split('\n');
            var b = { title:'Quiz', subject:'General', difficulty:'Medium',
                      numQuestions:'10', chapter:'', questions:[], customCss:'',
                      userInfo:[], mode:'practice', start:m.index, end:m.index+m[0].length, raw:m[0] };
            var li = 0;
            while (li < lines.length) {
                var line = lines[li].trim(); li++;
                if (!line) continue;
                var mm;
                if ((mm = line.match(/^@subject:\s*(.+)/i)))   { b.subject     = mm[1].trim(); continue; }
                if ((mm = line.match(/^@difficulty:\s*(.+)/i))) { b.difficulty  = mm[1].trim(); continue; }
                if ((mm = line.match(/^@questions:\s*(\d+)/i))) { b.numQuestions= mm[1]; continue; }
                if ((mm = line.match(/^@css:\s*(.+)/i)))        { b.customCss   = mm[1].replace(/^"|"$/g,'').trim(); continue; }
                if ((mm = line.match(/^@mode:\s*(.+)/i)))       { b.mode = mm[1].trim().toLowerCase()==='test'?'test':'practice'; continue; }
                if ((mm = line.match(/^@userinfo:\s*(.+)/i)))  {
                    b.userInfo = mm[1].split(',').map(function(f){return f.trim().toLowerCase();}).filter(Boolean);
                    continue;
                }
                if ((mm = line.match(/^@chapter:\s*([\s\S]*)/i))) {
                    var chunks = [mm[1].trim()];
                    while (li < lines.length && !lines[li].trim().match(/^@/)) { chunks.push(lines[li].trim()); li++; }
                    b.chapter = chunks.join(' '); continue;
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

        // In test mode Next is always enabled; in practice mode must confirm answer first (Duolingo-style)
        var navDisabled = (b.mode === 'test') ? '' : 'disabled';

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
        var re = /\{\{@?Quiz:\s*([\s\S]*?)\}\}/gi;
        var result = '', last = 0, bi = 0, m;
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
            var cssStyle = b.customCss ? ' style="'+escHtml(b.customCss)+'"' : '';

            result += '<div class="quiz-dg-card" data-quiz-index="'+bi+'"'+cssStyle+'>' +
                '<div class="quiz-dg-header">'+
                  '<span class="quiz-dg-icon">📝</span>'+
                  '<span class="quiz-dg-title">'+escHtml(b.title)+'</span>'+
                  '<div class="quiz-dg-badges">'+
                    '<span class="quiz-dg-subj">'+escHtml(b.subject)+'</span>'+
                    '<span class="quiz-dg-diff" style="background:'+dc.bg+';color:'+dc.color+';border:1px solid '+dc.border+'">'+escHtml(b.difficulty)+'</span>'+
                    (hasQ?'<span class="quiz-dg-subj" style="border-color:#334155">'+b.questions.length+' Qs</span>':'')+
                    (b.mode==='test'?'<span class="quiz-dg-diff" style="background:#312e81;color:#a5b4fc;border:1px solid #4338ca">📝 Test</span>':'')+
                  '</div>'+
                  '<div class="quiz-dg-actions">'+
                    (!M.isFormFillMode && hasChapter?'<span class="quiz-dg-chapter-info">📖 '+b.chapter.length+' chars</span>':'')+
                    (!M.isFormFillMode && hasChapter?'<button class="quiz-dg-gen-btn" data-quiz-index="'+bi+'" type="button">🤖 Generate Questions</button>':'')+
                    (!M.isFormFillMode && hasQ?'<button class="quiz-dg-grade-btn" data-quiz-index="'+bi+'" type="button">📊 Grade Answers</button>':'')+
                    (M.formResponseKey || !M.isFormFillMode ? '<button class="quiz-dg-responses-btn" data-quiz-index="'+bi+'" type="button">📋 View Responses</button>' : '')+
                    (!M.isFormFillMode ? '<button class="quiz-dg-remove" data-quiz-index="'+bi+'" type="button" title="Remove quiz">✕</button>' : '')+
                  '</div>'+
                '</div>'+
                (hasQ ? buildPlayer(b, bi) :
                    '<div class="quiz-dg-empty">'+ (hasChapter
                        ? '📖 Chapter loaded ('+b.chapter.length+' chars). Click <strong>🤖 Generate Questions</strong> above.'
                        : '✏️ Add questions using the <strong>➕ Add Question</strong> button below, or paste a chapter using <code>@chapter:</code>') +
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
            btn.addEventListener('click', function(){
                var idx=parseInt(btn.getAttribute('data-quiz-index'));
                var blocks=parseBlocks(M.markdownEditor.value);
                var block=blocks[idx]; if(!block||!block.chapter) return;
                btn.textContent='⏳ Generating…'; btn.disabled=true;
                var model=(M.getCurrentAiModel&&M.getCurrentAiModel())||'gemini-flash';
                var prompt='You are an expert '+block.subject+' teacher.\n'+
                    'Read the chapter and generate exactly '+block.numQuestions+' questions at **'+block.difficulty+'** difficulty.\n\n'+
                    'Use a variety of question types. Mix these:\n'+
                    '@question[mcq]: text? | correct_answer | opt1,opt2,correct_answer,opt3\n'+
                    '@question[tf]: statement | true  or  false\n'+
                    '@question[fill]: The ___ is ... | answer\n'+
                    '@question[match]: A=1, B=2, C=3\n'+
                    '@question[order]: first,second,third,fourth\n'+
                    '@question[short]: brief question | keyword1,keyword2\n'+
                    '@question[essay]: open-ended question\n'+
                    '@question[likert]: statement to rate\n\n'+
                    'Output ONLY @question lines, one per line, no extra text.\n\nChapter:\n'+block.chapter;
                var cb=function(res){
                    var lines=res.split('\n').filter(function(l){return l.match(/^@question/i);});
                    if(!lines.length){btn.textContent='🤖 Generate Questions';btn.disabled=false;return;}
                    var t=M.markdownEditor.value;
                    var ins=blocks[idx].end-2;
                    M.markdownEditor.value=t.substring(0,ins)+'\n'+lines.join('\n')+'\n'+t.substring(ins);
                    if(M.debouncedRender) M.debouncedRender();
                    btn.textContent='🤖 Generate Questions'; btn.disabled=false;
                };
                if(M.requestAiTask)    M.requestAiTask({prompt:prompt,model:model},cb);
                else if(M.runAiPrompt) M.runAiPrompt({prompt:prompt,model:model},cb);
                else{btn.textContent='⚠ No AI model';btn.disabled=false;}
            });
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
            '{{Quiz: 🌍 Ultimate Science Challenge',
            '  @subject: Science',
            '  @difficulty: Medium',
            '  @mode: test',
            '  @userinfo: name, email',
            '  @css: --quiz-bg: linear-gradient(135deg, #0c1222 0%, #1a1a2e 100%); --quiz-header: linear-gradient(135deg, #16213e, #0f3460); --quiz-border: #0f3460; --quiz-accent: #e94560; --quiz-accent-bg: #1a1a2e; --quiz-btn-gradient: linear-gradient(135deg, #e94560, #0f3460);',
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
