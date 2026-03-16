// ============================================
// game-prebuilts.js — Pre-built Game HTML Library
// These games auto-play when using @prebuilt: in the Game tag
// ============================================
window.__GAME_PREBUILTS = {};

// ─── Chess ───
window.__GAME_PREBUILTS.chess = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><title>Chess</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:'Segoe UI',Arial,sans-serif;color:#e0e0e0}
h1{margin:12px 0 6px;font-size:24px;color:#e94560;text-shadow:0 0 15px rgba(233,69,96,0.4)}
#status{margin-bottom:10px;font-size:14px;color:#a0c4ff;min-height:20px}
#board{display:grid;grid-template-columns:repeat(8,clamp(36px,7vmin,64px));grid-template-rows:repeat(8,clamp(36px,7vmin,64px));border:3px solid #e94560;border-radius:6px;overflow:hidden;box-shadow:0 0 30px rgba(233,69,96,0.2),0 6px 24px rgba(0,0,0,0.5)}
.cell{display:flex;align-items:center;justify-content:center;font-size:clamp(24px,5.5vmin,42px);cursor:pointer;transition:background .15s;user-select:none}
.cell.light{background:#f0d9b5}.cell.dark{background:#b58863}
.cell.selected{background:#7ec8e3!important}
.cell.valid-move{background:rgba(126,200,227,0.5)!important;position:relative}
.cell.valid-move::after{content:'';position:absolute;width:25%;height:25%;background:rgba(126,200,227,0.7);border-radius:50%}
.cell.last-move{box-shadow:inset 0 0 0 3px rgba(233,69,96,0.5)}
.cell:hover{filter:brightness(1.1)}
#cap{margin-top:8px;display:flex;gap:16px;font-size:13px}
.cap-p{font-size:clamp(14px,3vmin,20px);letter-spacing:1px}
button{background:#e94560;color:#fff;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;margin-top:10px;transition:all .2s}
button:hover{background:#c73e54;transform:translateY(-1px)}
</style>
</head>
<body>
<h1>♟ Chess</h1>
<div id="status">White's turn — click a piece</div>
<div id="board"></div>
<div id="cap"><div>White: <span class="cap-p" id="cw"></span></div><div>Black: <span class="cap-p" id="cb"></span></div></div>
<button onclick="R()">↺ New Game</button>
<script>
var P={K:"♔",Q:"♕",R:"♖",B:"♗",N:"♘",P:"♙",k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟"};
var I="rnbqkbnr pppppppp ........ ........ ........ ........ PPPPPPPP RNBQKBNR".split(" ");
var b,t,s,v,lf,lt,cw,cb;
function R(){b=I.map(function(r){return r.split("")});t="w";s=null;v=[];lf=lt=null;cw=[];cb=[];D();document.getElementById("status").textContent="White's turn — click a piece"}
function W(p){return p>="A"&&p<="Z"}function isB(p){return p>="a"&&p<="z"}
function O(p){return t==="w"?W(p):isB(p)}function E(p){return t==="w"?isB(p):W(p)}
function ib(r,c){return r>=0&&r<8&&c>=0&&c<8}
function gm(r,c){var p=b[r][c],m=[],u=p.toUpperCase();
if(u==="P"){var d=W(p)?-1:1,sr=W(p)?6:1;if(ib(r+d,c)&&b[r+d][c]==="."){m.push([r+d,c]);if(r===sr&&b[r+2*d][c]===".")m.push([r+2*d,c])}[-1,1].forEach(function(dc){if(ib(r+d,c+dc)&&E(b[r+d][c+dc]))m.push([r+d,c+dc])})}
if(u==="R"||u==="Q"){[[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d){for(var i=1;i<8;i++){var nr=r+d[0]*i,nc=c+d[1]*i;if(!ib(nr,nc))break;if(O(b[nr][nc]))break;m.push([nr,nc]);if(E(b[nr][nc]))break}})}
if(u==="B"||u==="Q"){[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(d){for(var i=1;i<8;i++){var nr=r+d[0]*i,nc=c+d[1]*i;if(!ib(nr,nc))break;if(O(b[nr][nc]))break;m.push([nr,nc]);if(E(b[nr][nc]))break}})}
if(u==="N"){[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(function(d){var nr=r+d[0],nc=c+d[1];if(ib(nr,nc)&&!O(b[nr][nc]))m.push([nr,nc])})}
if(u==="K"){[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(function(d){var nr=r+d[0],nc=c+d[1];if(ib(nr,nc)&&!O(b[nr][nc]))m.push([nr,nc])})}
return m}
function mm(fr,fc,tr,tc){var cap=b[tr][tc];if(cap!=="."){if(W(cap))cb.push(cap);else cw.push(cap)}b[tr][tc]=b[fr][fc];b[fr][fc]=".";if(b[tr][tc]==="P"&&tr===0)b[tr][tc]="Q";if(b[tr][tc]==="p"&&tr===7)b[tr][tc]="q";lf=[fr,fc];lt=[tr,tc];t=t==="w"?"b":"w";var st=document.getElementById("status");st.textContent=(t==="w"?"White":"Black")+"'s turn";var wK=false,bK=false;for(var i=0;i<8;i++)for(var j=0;j<8;j++){if(b[i][j]==="K")wK=true;if(b[i][j]==="k")bK=true}if(!wK)st.textContent="🏆 Black wins!";if(!bK)st.textContent="🏆 White wins!"}
function cc(r,c){if(s){if(v.some(function(m){return m[0]===r&&m[1]===c})){mm(s[0],s[1],r,c);s=null;v=[];D();return}}if(b[r][c]!=="."&&O(b[r][c])){s=[r,c];v=gm(r,c)}else{s=null;v=[]}D()}
function D(){var el=document.getElementById("board");el.innerHTML="";for(var r=0;r<8;r++)for(var c=0;c<8;c++){var d=document.createElement("div");d.className="cell "+((r+c)%2===0?"light":"dark");if(s&&s[0]===r&&s[1]===c)d.classList.add("selected");if(v.some(function(m){return m[0]===r&&m[1]===c}))d.classList.add("valid-move");if((lf&&lf[0]===r&&lf[1]===c)||(lt&&lt[0]===r&&lt[1]===c))d.classList.add("last-move");var p=b[r][c];if(p!==".")d.textContent=P[p]||p;(function(row,col){d.addEventListener("click",function(){cc(row,col)})})(r,c);el.appendChild(d)}document.getElementById("cw").textContent=cw.map(function(p){return P[p]}).join("");document.getElementById("cb").textContent=cb.map(function(p){return P[p]}).join("")}
R();
<\/script>
</body>
</html>`;

// ─── Snake ───
window.__GAME_PREBUILTS.snake = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><title>Snake</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a2e;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:'Segoe UI',Arial,sans-serif;color:#e0e0e0;overflow:hidden}
h1{margin:10px 0 4px;font-size:22px;color:#10b981;text-shadow:0 0 15px rgba(16,185,129,0.4)}
#hud{display:flex;gap:24px;margin-bottom:8px;font-size:14px;color:#a0c4ff}
canvas{border:2px solid #10b981;border-radius:6px;box-shadow:0 0 30px rgba(16,185,129,0.15);display:block}
#msg{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;background:rgba(0,0,0,0.85);padding:24px 36px;border-radius:12px;border:2px solid #10b981;z-index:10;font-size:16px;color:#fff}
#msg h2{color:#10b981;margin-bottom:8px}
#msg small{color:#888}
button{background:#10b981;color:#fff;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;margin-top:10px}
</style>
</head>
<body>
<h1>🐍 Snake</h1>
<div id="hud"><span>Score: <span id="sc">0</span></span><span>Best: <span id="hi">0</span></span></div>
<canvas id="c"></canvas>
<div id="msg"><h2>🐍 Snake</h2><p>Arrow keys or WASD to move</p><small>Press any key or tap to start</small></div>
<script>
var c=document.getElementById("c"),x=c.getContext("2d"),G=20,W,H,cols,rows;
var snake,dir,ndir,food,score,best=0,running=false,dead=false,speed,timer;
try{best=parseInt(localStorage.getItem("snakeBest"))||0}catch(e){}
document.getElementById("hi").textContent=best;
function sz(){var s=Math.min(innerWidth-20,innerHeight-100,500);W=H=s;c.width=W;c.height=H;cols=Math.floor(W/G);rows=Math.floor(H/G)}
sz();addEventListener("resize",sz);
function init(){snake=[{x:Math.floor(cols/2),y:Math.floor(rows/2)}];dir={x:1,y:0};ndir={x:1,y:0};score=0;speed=120;dead=false;document.getElementById("sc").textContent=0;placeFood();if(timer)clearInterval(timer);timer=setInterval(tick,speed)}
function placeFood(){do{food={x:Math.floor(Math.random()*cols),y:Math.floor(Math.random()*rows)}}while(snake.some(function(s){return s.x===food.x&&s.y===food.y}))}
function tick(){if(dead)return;dir=ndir;var h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0||h.x>=cols||h.y<0||h.y>=rows||snake.some(function(s){return s.x===h.x&&s.y===h.y})){dead=true;if(score>best){best=score;try{localStorage.setItem("snakeBest",best)}catch(e){}document.getElementById("hi").textContent=best}document.getElementById("msg").style.display="";document.getElementById("msg").innerHTML="<h2>Game Over</h2><p>Score: "+score+"</p><button onclick='start()'>Play Again</button>";return}snake.unshift(h);if(h.x===food.x&&h.y===food.y){score++;document.getElementById("sc").textContent=score;placeFood();if(speed>50){speed-=2;clearInterval(timer);timer=setInterval(tick,speed)}}else{snake.pop()}draw()}
function draw(){x.fillStyle="#0a0a2e";x.fillRect(0,0,W,H);x.strokeStyle="rgba(16,185,129,0.08)";for(var i=0;i<cols;i++){x.beginPath();x.moveTo(i*G,0);x.lineTo(i*G,H);x.stroke()}for(var j=0;j<rows;j++){x.beginPath();x.moveTo(0,j*G);x.lineTo(W,j*G);x.stroke()}snake.forEach(function(s,i){var g=Math.max(0,1-i/snake.length*0.6);x.fillStyle="hsl(160,70%,"+(30+g*40)+"%)";x.shadowColor="#10b981";x.shadowBlur=i===0?12:4;x.beginPath();x.roundRect(s.x*G+1,s.y*G+1,G-2,G-2,4);x.fill();x.shadowBlur=0});x.fillStyle="#ef4444";x.shadowColor="#ef4444";x.shadowBlur=12;x.beginPath();x.arc(food.x*G+G/2,food.y*G+G/2,G/2-2,0,Math.PI*2);x.fill();x.shadowBlur=0}
function setDir(dx,dy){if(dx!==-dir.x||dy!==-dir.y){ndir={x:dx,y:dy}}}
addEventListener("keydown",function(e){if(!running){start();return}var k=e.key.toLowerCase();if(k==="arrowup"||k==="w")setDir(0,-1);else if(k==="arrowdown"||k==="s")setDir(0,1);else if(k==="arrowleft"||k==="a")setDir(-1,0);else if(k==="arrowright"||k==="d")setDir(1,0)});
c.addEventListener("click",function(){if(!running)start()});
var tx,ty;c.addEventListener("touchstart",function(e){if(!running){start();return}tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
c.addEventListener("touchend",function(e){var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>Math.abs(dy)){setDir(dx>0?1:-1,0)}else{setDir(0,dy>0?1:-1)}},{passive:true});
function start(){running=true;document.getElementById("msg").style.display="none";init();draw()}
draw();
<\/script>
</body>
</html>`;

// ─── Space Shooter ───
window.__GAME_PREBUILTS.shooter = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><title>Space Shooter</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a2e;overflow:hidden;font-family:Arial,sans-serif}
canvas{display:block}
#hud{position:fixed;top:10px;left:50%;transform:translateX(-50%);color:#0ff;font-size:16px;text-shadow:0 0 10px #0ff;z-index:10;display:flex;gap:24px}
#ins{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;text-align:center;font-size:15px;background:rgba(0,0,0,0.75);padding:20px 28px;border-radius:12px;border:1px solid #0ff;z-index:20;transition:opacity .8s}
.go{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#f44;font-size:32px;font-weight:bold;text-shadow:0 0 20px #f44;z-index:30;text-align:center;background:rgba(0,0,0,0.8);padding:24px 36px;border-radius:12px;border:2px solid #f44}
.go span{font-size:16px;color:#fff;display:block;margin-top:8px}
</style>
</head>
<body>
<div id="hud"><span>Score: <span id="score">0</span></span><span>Lives: <span id="lives">3</span></span></div>
<div id="ins">▲ Arrow keys to move · Space to shoot<br><small>Click or press any key to start</small></div>
<canvas id="c"></canvas>
<script>
var c=document.getElementById("c"),ctx=c.getContext("2d"),W,H,sc=0,lives=3,go=false,started=false;
var pl={x:0,y:0,w:40,h:30,spd:5};
var bul=[],en=[],par=[],stars=[];var keys={};
function sz(){W=c.width=innerWidth;H=c.height=innerHeight;pl.x=W/2;pl.y=H-60;stars=[];for(var i=0;i<80;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+.5,b:Math.random()})}
sz();addEventListener("resize",sz);
addEventListener("keydown",function(e){keys[e.key]=true;if(e.key===" ")e.preventDefault();if(!started)start()});
addEventListener("keyup",function(e){keys[e.key]=false});
c.addEventListener("click",function(){if(!started)start();if(go)restart()});
var ls=0;
function spEn(){if(Math.random()<.025&&en.length<12)en.push({x:Math.random()*(W-30)+15,y:-30,w:26,h:26,spd:1+Math.random()*2.5,col:"hsl("+(Math.random()*60+300)+",100%,60%)"})}
function ex(x,y,col){for(var i=0;i<15;i++){var a=Math.random()*Math.PI*2,sp=Math.random()*5+1;par.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,col:col})}}
function upd(){if(!started||go)return;
if(keys.ArrowLeft&&pl.x>20)pl.x-=pl.spd;if(keys.ArrowRight&&pl.x<W-20)pl.x+=pl.spd;
if(keys.ArrowUp&&pl.y>H/2)pl.y-=pl.spd;if(keys.ArrowDown&&pl.y<H-20)pl.y+=pl.spd;
if(keys[" "]&&Date.now()-ls>180){bul.push({x:pl.x,y:pl.y-20,spd:9});ls=Date.now()}
spEn();bul.forEach(function(b){b.y-=b.spd});en.forEach(function(e){e.y+=e.spd});
for(var i=bul.length-1;i>=0;i--){for(var j=en.length-1;j>=0;j--){var b=bul[i],e=en[j];if(b&&Math.abs(b.x-e.x)<20&&Math.abs(b.y-e.y)<20){ex(e.x,e.y,e.col);bul.splice(i,1);en.splice(j,1);sc+=10;document.getElementById("score").textContent=sc;break}}}
for(var k=en.length-1;k>=0;k--){if(en[k].y>H){en.splice(k,1);lives--;document.getElementById("lives").textContent=lives;if(lives<=0){go=true;var d=document.createElement("div");d.className="go";d.innerHTML="GAME OVER<span>Score: "+sc+"<br>Click to restart</span>";document.body.appendChild(d)}}}
par.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.life-=.03});par=par.filter(function(p){return p.life>0});bul=bul.filter(function(b){return b.y>-10})}
function drw(){ctx.fillStyle="rgba(10,10,46,0.3)";ctx.fillRect(0,0,W,H);
stars.forEach(function(s){s.y+=s.s*.5;if(s.y>H){s.y=0;s.x=Math.random()*W}s.b+=.02;ctx.fillStyle="rgba(255,255,255,"+(0.3+Math.sin(s.b)*.3)+")";ctx.fillRect(s.x,s.y,s.s,s.s)});
if(!started)return;
ctx.save();ctx.translate(pl.x,pl.y);ctx.fillStyle="#0ff";ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(-15,15);ctx.lineTo(15,15);ctx.closePath();ctx.fill();ctx.shadowColor="#0ff";ctx.shadowBlur=15;ctx.fill();ctx.restore();
bul.forEach(function(b){ctx.fillStyle="#ff0";ctx.shadowColor="#ff0";ctx.shadowBlur=8;ctx.fillRect(b.x-2,b.y,4,12);ctx.shadowBlur=0});
en.forEach(function(e){ctx.fillStyle=e.col;ctx.shadowColor=e.col;ctx.shadowBlur=10;ctx.fillRect(e.x-13,e.y-13,26,26);ctx.shadowBlur=0});
par.forEach(function(p){ctx.globalAlpha=p.life;ctx.fillStyle=p.col;ctx.fillRect(p.x-2,p.y-2,4,4);ctx.globalAlpha=1})}
function lp(){upd();drw();requestAnimationFrame(lp)}
function start(){started=true;document.getElementById("ins").style.opacity="0";setTimeout(function(){document.getElementById("ins").style.display="none"},800)}
function restart(){sc=0;lives=3;go=false;en=[];bul=[];par=[];document.getElementById("score").textContent="0";document.getElementById("lives").textContent="3";var g=document.querySelector(".go");if(g)g.remove()}
lp();
<\/script>
</body>
</html>`;

// ─── Pong ───
window.__GAME_PREBUILTS.pong = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><title>Pong</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:'Courier New',monospace;color:#fff;overflow:hidden}
canvas{border:2px solid #333;border-radius:4px;display:block}
#mode{margin-top:10px;display:flex;gap:8px}
button{background:#333;color:#0f0;border:1px solid #0f0;padding:5px 14px;border-radius:4px;cursor:pointer;font-family:inherit;font-size:12px;transition:all .2s}
button:hover,button.active{background:#0f0;color:#111}
#info{margin-top:8px;font-size:11px;color:#555}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="mode"><button id="b1p" class="active" onclick="setMode(true)">1 Player (AI)</button><button id="b2p" onclick="setMode(false)">2 Players</button></div>
<div id="info">P1: W/S · P2: ↑/↓ · First to 11 wins</div>
<script>
var c=document.getElementById("c"),x=c.getContext("2d"),W=600,H=400,ai=true;
c.width=W;c.height=H;
var pw=10,ph=70,bs=6;
var p1={y:H/2-ph/2,score:0},p2={y:H/2-ph/2,score:0};
var ball={x:W/2,y:H/2,vx:bs,vy:bs*(Math.random()-.5)*2};
var keys={};var won="";
addEventListener("keydown",function(e){keys[e.key]=true});
addEventListener("keyup",function(e){keys[e.key]=false});
function setMode(isAi){ai=isAi;document.getElementById("b1p").className=ai?"active":"";document.getElementById("b2p").className=ai?"":"active";resetBall();p1.score=p2.score=0;won=""}
function resetBall(){ball.x=W/2;ball.y=H/2;ball.vx=bs*(Math.random()>.5?1:-1);ball.vy=bs*(Math.random()-.5)*1.5}
function upd(){if(won)return;
if(keys.w&&p1.y>0)p1.y-=5;if(keys.s&&p1.y<H-ph)p1.y+=5;
if(ai){var ty=ball.y-ph/2;if(p2.y<ty-3)p2.y+=4;else if(p2.y>ty+3)p2.y-=4}else{if(keys.ArrowUp&&p2.y>0)p2.y-=5;if(keys.ArrowDown&&p2.y<H-ph)p2.y+=5}
ball.x+=ball.vx;ball.y+=ball.vy;
if(ball.y<=0||ball.y>=H){ball.vy*=-1;ball.y=ball.y<=0?0:H}
if(ball.x<=pw+5&&ball.y>=p1.y&&ball.y<=p1.y+ph){ball.vx=Math.abs(ball.vx)*1.05;ball.vy+=(ball.y-(p1.y+ph/2))*0.15}
if(ball.x>=W-pw-5&&ball.y>=p2.y&&ball.y<=p2.y+ph){ball.vx=-Math.abs(ball.vx)*1.05;ball.vy+=(ball.y-(p2.y+ph/2))*0.15}
if(ball.x<0){p2.score++;resetBall()}if(ball.x>W){p1.score++;resetBall()}
if(p1.score>=11)won="Player 1 Wins!";if(p2.score>=11)won=(ai?"AI":"Player 2")+" Wins!"}
function drw(){x.fillStyle="#111";x.fillRect(0,0,W,H);
x.setLineDash([8,8]);x.strokeStyle="#333";x.beginPath();x.moveTo(W/2,0);x.lineTo(W/2,H);x.stroke();x.setLineDash([]);
x.fillStyle="#0f0";x.shadowColor="#0f0";x.shadowBlur=8;
x.fillRect(5,p1.y,pw,ph);x.fillRect(W-pw-5,p2.y,pw,ph);
x.beginPath();x.arc(ball.x,ball.y,6,0,Math.PI*2);x.fill();x.shadowBlur=0;
x.font="32px 'Courier New'";x.textAlign="center";x.fillStyle="#333";x.fillText(p1.score,W/4,50);x.fillText(p2.score,3*W/4,50);
if(won){x.fillStyle="rgba(0,0,0,0.7)";x.fillRect(0,H/2-40,W,80);x.fillStyle="#0f0";x.font="28px 'Courier New'";x.fillText(won,W/2,H/2+10)}}
function lp(){upd();drw();requestAnimationFrame(lp)}lp();
<\/script>
</body>
</html>`;

// ─── Breakout ───
window.__GAME_PREBUILTS.breakout = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><title>Breakout</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:linear-gradient(180deg,#0f0c29,#302b63,#24243e);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Arial,sans-serif;color:#fff;overflow:hidden}
canvas{display:block;border-radius:8px;box-shadow:0 0 40px rgba(255,100,100,.15);cursor:none}
#hud{display:flex;gap:24px;margin-bottom:8px;font-size:14px;color:#f0f0f0}
#msg{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.85);padding:24px;border-radius:12px;border:2px solid #f59e0b;text-align:center;z-index:10}
#msg h2{color:#f59e0b;margin-bottom:6px}
</style>
</head>
<body>
<div id="hud"><span>Score: <span id="sc">0</span></span><span>Lives: <span id="lv">3</span></span></div>
<canvas id="c"></canvas>
<div id="msg"><h2>🧱 Breakout</h2><p>Move mouse to control paddle</p><p><small>Click to launch ball</small></p></div>
<script>
var c=document.getElementById("c"),x=c.getContext("2d"),W=500,H=600;c.width=W;c.height=H;
var cols=10,rows=5,bw=W/cols-4,bh=18,pad=2;
var paddle={x:W/2,w:80,h:12};
var ball={x:W/2,y:H-40,r:6,vx:0,vy:0,launched:false};
var bricks=[],score=0,lives=3,particles=[];
var colors=["#ef4444","#f97316","#eab308","#22c55e","#3b82f6"];
function initBricks(){bricks=[];for(var r=0;r<rows;r++)for(var cl=0;cl<cols;cl++)bricks.push({x:cl*(bw+pad*2)+pad+2,y:r*(bh+pad*2)+pad+40,w:bw,h:bh,col:colors[r],pts:(rows-r)*10,alive:true})}
initBricks();
c.addEventListener("mousemove",function(e){var r=c.getBoundingClientRect();paddle.x=e.clientX-r.left});
c.addEventListener("touchmove",function(e){e.preventDefault();var r=c.getBoundingClientRect();paddle.x=e.touches[0].clientX-r.left},{passive:false});
c.addEventListener("click",function(){if(!ball.launched){ball.launched=true;ball.vx=3*(Math.random()-.5);ball.vy=-5;document.getElementById("msg").style.display="none"}});
c.addEventListener("touchstart",function(){if(!ball.launched){ball.launched=true;ball.vx=3*(Math.random()-.5);ball.vy=-5;document.getElementById("msg").style.display="none"}},{passive:true});
function burst(bx,by,col){for(var i=0;i<8;i++){var a=Math.random()*Math.PI*2;particles.push({x:bx,y:by,vx:Math.cos(a)*3,vy:Math.sin(a)*3,life:1,col:col})}}
function upd(){if(!ball.launched){ball.x=paddle.x;ball.y=H-40;return}
ball.x+=ball.vx;ball.y+=ball.vy;
if(ball.x<ball.r||ball.x>W-ball.r)ball.vx*=-1;
if(ball.y<ball.r)ball.vy*=-1;
if(ball.y>H+20){lives--;document.getElementById("lv").textContent=lives;ball.launched=false;ball.vx=0;ball.vy=0;if(lives<=0){document.getElementById("msg").style.display="";document.getElementById("msg").innerHTML="<h2>Game Over</h2><p>Score: "+score+"</p><button onclick='restart()' style=\"background:#f59e0b;color:#000;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;margin-top:8px\">Play Again</button>";return}return}
var px=paddle.x-paddle.w/2,py=H-24;
if(ball.y+ball.r>=py&&ball.y-ball.r<=py+paddle.h&&ball.x>=px&&ball.x<=px+paddle.w){ball.vy=-Math.abs(ball.vy)*1.02;ball.vx+=(ball.x-paddle.x)*0.08}
var allDead=true;
bricks.forEach(function(b){if(!b.alive)return;allDead=false;if(ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){b.alive=false;ball.vy*=-1;score+=b.pts;document.getElementById("sc").textContent=score;burst(b.x+b.w/2,b.y+b.h/2,b.col)}});
if(allDead){document.getElementById("msg").style.display="";document.getElementById("msg").innerHTML="<h2>🏆 You Win!</h2><p>Score: "+score+"</p><button onclick='restart()' style=\"background:#22c55e;color:#fff;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;margin-top:8px\">Play Again</button>"}
particles.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.life-=.04});particles=particles.filter(function(p){return p.life>0})}
function drw(){x.clearRect(0,0,W,H);
bricks.forEach(function(b){if(!b.alive)return;x.fillStyle=b.col;x.shadowColor=b.col;x.shadowBlur=6;x.beginPath();x.roundRect(b.x,b.y,b.w,b.h,4);x.fill();x.shadowBlur=0});
x.fillStyle="#fff";x.shadowColor="#fff";x.shadowBlur=10;x.beginPath();x.roundRect(paddle.x-paddle.w/2,H-24,paddle.w,paddle.h,6);x.fill();
x.beginPath();x.arc(ball.x,ball.y,ball.r,0,Math.PI*2);x.fill();x.shadowBlur=0;
particles.forEach(function(p){x.globalAlpha=p.life;x.fillStyle=p.col;x.fillRect(p.x-2,p.y-2,4,4);x.globalAlpha=1})}
function lp(){upd();drw();requestAnimationFrame(lp)}
function restart(){score=0;lives=3;document.getElementById("sc").textContent=0;document.getElementById("lv").textContent=3;ball.launched=false;ball.vx=0;ball.vy=0;initBricks();document.getElementById("msg").style.display="";document.getElementById("msg").innerHTML="<h2>🧱 Breakout</h2><p>Move mouse to control paddle</p><p><small>Click to launch ball</small></p>"}
lp();
<\/script>
</body>
</html>`;

// ─── Maths Quiz (Kids) ───
window.__GAME_PREBUILTS.maths = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><title>Maths for Kids</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Segoe UI',Arial,sans-serif;color:#fff;overflow:hidden}
.card{background:rgba(255,255,255,0.15);backdrop-filter:blur(12px);border-radius:24px;padding:32px 40px;text-align:center;min-width:340px;max-width:420px;box-shadow:0 8px 40px rgba(0,0,0,0.2);border:2px solid rgba(255,255,255,0.2)}
h1{font-size:28px;margin-bottom:4px}
.sub{font-size:13px;opacity:0.8;margin-bottom:16px}
.stats{display:flex;justify-content:center;gap:20px;margin-bottom:16px;font-size:14px}
.stat{background:rgba(255,255,255,0.15);padding:6px 14px;border-radius:12px}
.stat b{display:block;font-size:20px}
.question{font-size:52px;font-weight:bold;margin:20px 0;text-shadow:0 4px 12px rgba(0,0,0,0.15);min-height:72px;letter-spacing:2px}
.choices{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
.choice{font-size:24px;font-weight:700;padding:16px;border-radius:16px;border:3px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;transition:all .2s;user-select:none}
.choice:hover{background:rgba(255,255,255,0.25);transform:translateY(-2px);border-color:rgba(255,255,255,0.6)}
.choice:active{transform:scale(0.95)}
.choice.correct{background:#10b981!important;border-color:#10b981!important;animation:pop .4s}
.choice.wrong{background:#ef4444!important;border-color:#ef4444!important;animation:shake .4s}
@keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
.feedback{font-size:36px;min-height:50px;margin-top:12px}
.timer-bar{width:100%;height:8px;background:rgba(255,255,255,0.15);border-radius:4px;margin-top:14px;overflow:hidden}
.timer-fill{height:100%;background:linear-gradient(90deg,#ef4444,#f59e0b,#10b981);border-radius:4px;transition:width .1s linear}
.level{margin-top:8px;font-size:12px;opacity:0.7}
.start-btn{font-size:20px;font-weight:700;padding:14px 36px;border-radius:16px;border:none;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;cursor:pointer;margin-top:16px;transition:all .2s;box-shadow:0 4px 16px rgba(0,0,0,0.2)}
.start-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.3)}
.diff-pills{display:flex;gap:8px;justify-content:center;margin-top:12px}
.pill{padding:6px 16px;border-radius:20px;border:2px solid rgba(255,255,255,0.3);background:transparent;color:#fff;cursor:pointer;font-size:13px;font-weight:600;transition:all .2s}
.pill.active{background:#fff;color:#764ba2}
.pill:hover{border-color:#fff}
</style>
</head>
<body>
<div class="card" id="card"></div>
<script>
var score=0,total=0,streak=0,bestStreak=0,level=1,diff="easy",tmr=null,timeLeft=100,playing=false;
var opSets={easy:["+","-"],medium:["+","-","×"],hard:["+","-","×","÷"]};
var rngs={easy:[1,10],medium:[1,20],hard:[1,50]};
var tpq={easy:120,medium:100,hard:70};
function showMenu(){
var h='<h1>🧠 Maths Quiz</h1><p class="sub">Fun maths for children!</p>';
h+='<p style="font-size:48px;margin:16px 0">📚</p>';
h+='<p style="font-size:14px;margin-bottom:8px">Choose difficulty:</p>';
h+='<div class="diff-pills">';
h+='<button class="pill'+(diff==="easy"?" active":"")+'" onclick="setD(\'easy\')">Easy</button>';
h+='<button class="pill'+(diff==="medium"?" active":"")+'" onclick="setD(\'medium\')">Medium</button>';
h+='<button class="pill'+(diff==="hard"?" active":"")+'" onclick="setD(\'hard\')">Hard</button>';
h+='</div>';
h+='<button class="start-btn" onclick="go()">▶ Start!</button>';
document.getElementById("card").innerHTML=h}
function setD(d){diff=d;showMenu()}
function go(){score=0;total=0;streak=0;bestStreak=0;level=1;playing=true;nxt()}
function ri(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function genQ(){var r=rngs[diff],o=opSets[diff][ri(0,opSets[diff].length-1)],a,b,ans;
if(o==="+"){a=ri(r[0],r[1]+level*2);b=ri(r[0],r[1]+level*2);ans=a+b}
else if(o==="-"){a=ri(r[0],r[1]+level*2);b=ri(r[0],a);ans=a-b}
else if(o==="×"){a=ri(1,Math.min(12,r[1]));b=ri(1,Math.min(12,r[1]));ans=a*b}
else{b=ri(1,Math.min(12,r[1]));ans=ri(1,Math.min(12,r[1]));a=b*ans;o="÷"}
return{a:a,b:b,op:o,ans:ans}}
function genC(ans){var c=[ans];while(c.length<4){var off=ri(1,Math.max(5,Math.abs(ans)));var v=Math.random()>.5?ans+off:ans-off;if(v<0)v=ans+off;if(c.indexOf(v)===-1)c.push(v)}for(var i=c.length-1;i>0;i--){var j=ri(0,i);var t=c[i];c[i]=c[j];c[j]=t}return c}
var cq=null;
function nxt(){if(tmr)clearInterval(tmr);cq=genQ();var ch=genC(cq.ans);timeLeft=tpq[diff];total++;level=Math.floor(score/5)+1;
var h='<h1>🧠 Maths Quiz</h1><div class="stats"><div class="stat"><b>'+score+'</b>Score</div><div class="stat"><b>'+total+'</b>Question</div><div class="stat"><b>'+streak+'🔥</b>Streak</div></div><div class="question">'+cq.a+' '+cq.op+' '+cq.b+' = ?</div><div class="choices">';
ch.forEach(function(v,i){h+='<button class="choice" id="c'+i+'" onclick="pick('+v+',this)">'+v+'</button>'});
h+='</div><div class="feedback" id="fb"></div><div class="timer-bar"><div class="timer-fill" id="tf" style="width:100%"></div></div><div class="level">Level '+level+' • '+diff.charAt(0).toUpperCase()+diff.slice(1)+'</div>';
document.getElementById("card").innerHTML=h;
tmr=setInterval(function(){timeLeft--;var p=Math.max(0,timeLeft/tpq[diff]*100);var tf=document.getElementById("tf");if(tf)tf.style.width=p+"%";if(timeLeft<=0){clearInterval(tmr);tout()}},100)}
function pick(v,btn){if(!playing)return;clearInterval(tmr);
document.querySelectorAll(".choice").forEach(function(b){b.style.pointerEvents="none"});
if(v===cq.ans){btn.classList.add("correct");score++;streak++;if(streak>bestStreak)bestStreak=streak;
var ms=["🌟 Great!","🚀 Amazing!","⭐ Super!","🎉 Yes!","👏 Wow!","🧠 Smart!"];
document.getElementById("fb").textContent=ms[ri(0,ms.length-1)]}else{btn.classList.add("wrong");streak=0;
document.querySelectorAll(".choice").forEach(function(b){if(parseInt(b.textContent)===cq.ans)b.classList.add("correct")});
document.getElementById("fb").textContent="❌ It was "+cq.ans}
setTimeout(function(){if(total>=20)fin();else nxt()},1200)}
function tout(){streak=0;document.getElementById("fb").textContent="⏰ Time up! Answer: "+cq.ans;
document.querySelectorAll(".choice").forEach(function(b){b.style.pointerEvents="none";if(parseInt(b.textContent)===cq.ans)b.classList.add("correct")});
setTimeout(function(){if(total>=20)fin();else nxt()},1500)}
function fin(){playing=false;var pct=Math.round(score/20*100);
var em=pct>=90?"🏆":pct>=70?"🌟":pct>=50?"😊":"💪";
var mg=pct>=90?"Outstanding!":pct>=70?"Great job!":pct>=50?"Good effort!":"Keep practising!";
document.getElementById("card").innerHTML='<div style="text-align:center"><p style="font-size:64px;margin-bottom:12px">'+em+'</p><h2 style="font-size:32px;margin-bottom:8px">'+mg+'</h2><p style="font-size:18px;margin:8px 0">'+score+' / 20 correct ('+pct+'%)</p><p style="font-size:14px;opacity:0.8">Best streak: '+bestStreak+' 🔥</p><button class="start-btn" onclick="showMenu()" style="margin-top:16px">🔁 Play Again</button></div>'}
showMenu();
<\/script>
</body>
</html>`;

// ─── Flappy Bird ───
window.__GAME_PREBUILTS.flappy = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><title>Flappy Bird</title>
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#1a1a2e;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;touch-action:none}
canvas{border-radius:12px;box-shadow:0 0 40px rgba(78,205,196,0.15),0 8px 32px rgba(0,0,0,0.4);cursor:pointer;max-width:100%;max-height:90vh}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
var cn=document.getElementById("c"),ctx=cn.getContext("2d");
var W=400,H=600;cn.width=W;cn.height=H;
var bird,pipes,particles,score,bestScore=0,playing=false,dead=false,frameCount=0;
var GRAVITY=0.45,FLAP=-7.5,PIPE_W=52,GAP=140,PIPE_SPEED=2.2,BIRD_R=14;

function init(){
bird={x:80,y:H/2,vy:0,angle:0,flapFrame:0};
pipes=[];particles=[];score=0;dead=false;frameCount=0;
playing=false;
}
init();

function addPipe(){
var minY=80,maxY=H-GAP-80;
var topH=Math.floor(Math.random()*(maxY-minY))+minY;
pipes.push({x:W+10,topH:topH,scored:false});
}

function flap(){
if(dead){init();return}
if(!playing)playing=true;
bird.vy=FLAP;
bird.flapFrame=8;
}

function spawnParticles(x,y,count,color){
for(var i=0;i<count;i++){
var a=Math.random()*Math.PI*2;
var sp=Math.random()*4+1;
particles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,maxLife:1,size:Math.random()*4+2,color:color||'#feca57'});
}}

function update(){
if(!playing||dead)return;
frameCount++;
// Bird physics
bird.vy+=GRAVITY;
bird.y+=bird.vy;
bird.angle=Math.min(Math.max(bird.vy*3,-30),90);
if(bird.flapFrame>0)bird.flapFrame--;

// Pipes
if(frameCount%90===0)addPipe();
for(var i=pipes.length-1;i>=0;i--){
var p=pipes[i];
p.x-=PIPE_SPEED;
// Score
if(!p.scored&&p.x+PIPE_W<bird.x){
p.scored=true;score++;
spawnParticles(bird.x,bird.y,6,'#4ecdc4');
}
// Collision
var bx=bird.x,by=bird.y,r=BIRD_R;
if(bx+r>p.x&&bx-r<p.x+PIPE_W){
if(by-r<p.topH||by+r>p.topH+GAP){
die();return;
}}
if(p.x<-PIPE_W)pipes.splice(i,1);
}
// Floor/ceiling
if(bird.y+BIRD_R>H||bird.y-BIRD_R<0){die()}
// Particles
for(var j=particles.length-1;j>=0;j--){
var pt=particles[j];
pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=0.08;
pt.life-=0.02;
if(pt.life<=0)particles.splice(j,1);
}
}

function die(){
dead=true;playing=false;
if(score>bestScore)bestScore=score;
spawnParticles(bird.x,bird.y,25,'#ff6b6b');
spawnParticles(bird.x,bird.y,15,'#feca57');
}

function drawBird(){
ctx.save();
ctx.translate(bird.x,bird.y);
ctx.rotate(bird.angle*Math.PI/180);
// Body
var grd=ctx.createRadialGradient(0,-2,4,0,0,BIRD_R);
grd.addColorStop(0,'#feca57');grd.addColorStop(1,'#f39c12');
ctx.fillStyle=grd;
ctx.beginPath();ctx.ellipse(0,0,BIRD_R,BIRD_R-2,0,0,Math.PI*2);ctx.fill();
// Wing
var wingY=bird.flapFrame>0?-6:2;
ctx.fillStyle='#e67e22';
ctx.beginPath();ctx.ellipse(-4,wingY,8,5,-.2,0,Math.PI*2);ctx.fill();
// Eye
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(6,-4,4.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#2d3436';
ctx.beginPath();ctx.arc(7,-4,2.5,0,Math.PI*2);ctx.fill();
// Beak
ctx.fillStyle='#e17055';
ctx.beginPath();ctx.moveTo(BIRD_R-2,-2);ctx.lineTo(BIRD_R+7,0);ctx.lineTo(BIRD_R-2,3);ctx.fill();
ctx.restore();
}

function draw(){
// Sky gradient
var sky=ctx.createLinearGradient(0,0,0,H);
sky.addColorStop(0,'#0c2461');sky.addColorStop(0.5,'#0a3d62');sky.addColorStop(1,'#38ada9');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

// Stars (subtle)
ctx.fillStyle='rgba(255,255,255,0.3)';
for(var s=0;s<20;s++){
var sx=(s*137+s*s*29)%W,sy=(s*89+s*s*13)%H;
ctx.fillRect(sx,sy,1.5,1.5);
}

// Pipes
pipes.forEach(function(p){
var pgrd=ctx.createLinearGradient(p.x,0,p.x+PIPE_W,0);
pgrd.addColorStop(0,'#00b894');pgrd.addColorStop(0.5,'#55efc4');pgrd.addColorStop(1,'#00b894');
ctx.fillStyle=pgrd;
// Top pipe
ctx.fillRect(p.x,0,PIPE_W,p.topH);
ctx.fillRect(p.x-4,p.topH-24,PIPE_W+8,24);
// Bottom pipe
ctx.fillRect(p.x,p.topH+GAP,PIPE_W,H-p.topH-GAP);
ctx.fillRect(p.x-4,p.topH+GAP,PIPE_W+8,24);
// Pipe border
ctx.strokeStyle='rgba(0,0,0,0.2)';ctx.lineWidth=2;
ctx.strokeRect(p.x,0,PIPE_W,p.topH);
ctx.strokeRect(p.x,p.topH+GAP,PIPE_W,H-p.topH-GAP);
});

// Particles
particles.forEach(function(pt){
ctx.globalAlpha=pt.life;
ctx.fillStyle=pt.color;
ctx.beginPath();ctx.arc(pt.x,pt.y,pt.size*pt.life,0,Math.PI*2);ctx.fill();
});
ctx.globalAlpha=1;

// Bird
drawBird();

// Score HUD
ctx.fillStyle='#fff';ctx.font='bold 48px "Segoe UI",sans-serif';
ctx.textAlign='center';ctx.textBaseline='top';
ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=8;
ctx.fillText(score,W/2,20);
ctx.shadowBlur=0;

// Best score
if(bestScore>0){
ctx.font='14px "Segoe UI",sans-serif';
ctx.fillStyle='rgba(255,255,255,0.6)';
ctx.fillText('Best: '+bestScore,W/2,72);
}

// Overlays
if(!playing&&!dead){
ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(0,0,W,H);
ctx.fillStyle='#feca57';ctx.font='bold 36px "Segoe UI",sans-serif';
ctx.textAlign='center';ctx.fillText('🐦 Flappy Bird',W/2,H/2-60);
ctx.fillStyle='#fff';ctx.font='16px "Segoe UI",sans-serif';
ctx.fillText('Tap or press Space to fly',W/2,H/2-10);
ctx.fillText('Avoid the pipes!',W/2,H/2+16);
ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='13px "Segoe UI",sans-serif';
ctx.fillText('Press any key or tap to start',W/2,H/2+60);
}

if(dead){
ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);
ctx.fillStyle='#ff6b6b';ctx.font='bold 36px "Segoe UI",sans-serif';
ctx.textAlign='center';ctx.fillText('Game Over',W/2,H/2-50);
ctx.fillStyle='#fff';ctx.font='22px "Segoe UI",sans-serif';
ctx.fillText('Score: '+score,W/2,H/2);
if(score>=bestScore&&score>0){
ctx.fillStyle='#feca57';ctx.font='16px "Segoe UI",sans-serif';
ctx.fillText('🏆 New Best!',W/2,H/2+30);
}
ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='14px "Segoe UI",sans-serif';
ctx.fillText('Tap or press to restart',W/2,H/2+70);
}
}

function loop(){update();draw();requestAnimationFrame(loop)}

cn.addEventListener('click',flap);
cn.addEventListener('touchstart',function(e){e.preventDefault();flap()},{passive:false});
document.addEventListener('keydown',function(e){if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();flap()}});

loop();
<\/script>
</body>
</html>`;

// ─── Runner ───
window.__GAME_PREBUILTS.runner = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><title>Dino Runner</title>
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#1a1a2e;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;touch-action:none}
canvas{border-radius:12px;box-shadow:0 0 40px rgba(116,185,255,0.15),0 8px 32px rgba(0,0,0,0.4);cursor:pointer;max-width:100%;max-height:90vh}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
var cn=document.getElementById("c"),ctx=cn.getContext("2d");
var W=600,H=300;cn.width=W;cn.height=H;
var GROUND=H-50,GRAVITY=0.6,JUMP_FORCE=-11;
var player,obstacles,particles,score,bestScore=0,speed,playing=false,dead=false,frameCount=0;

function init(){
player={x:60,y:GROUND,vy:0,w:24,h:32,onGround:true,ducking:false};
obstacles=[];particles=[];score=0;speed=4;dead=false;frameCount=0;playing=false;
}
init();

function jump(){
if(dead){init();return}
if(!playing)playing=true;
if(player.onGround){player.vy=JUMP_FORCE;player.onGround=false}
}

function spawnObs(){
var types=[
{w:16,h:30,color:'#ff6b6b'},
{w:16,h:20,color:'#feca57'},
{w:24,h:36,color:'#ff9f43'},
{w:12,h:16,color:'#a29bfe',flying:true}
];
var t=types[Math.floor(Math.random()*types.length)];
var o={x:W+20,y:t.flying?GROUND-60:GROUND,w:t.w,h:t.h,color:t.color};
if(t.flying)o.y=GROUND-50-Math.random()*30;
obstacles.push(o);
}

function spawnPart(x,y,n,col){
for(var i=0;i<n;i++){
var a=Math.random()*Math.PI*2,sp=Math.random()*3+1;
particles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,life:1,size:Math.random()*3+1,color:col||'#feca57'});
}
}

function update(){
if(!playing||dead)return;
frameCount++;
score++;
if(frameCount%200===0)speed+=0.3;

// Player physics
player.vy+=GRAVITY;
player.y+=player.vy;
if(player.y>=GROUND){player.y=GROUND;player.vy=0;player.onGround=true}

// Obstacles
var spawnRate=Math.max(40,90-Math.floor(speed*3));
if(frameCount%spawnRate===0)spawnObs();

for(var i=obstacles.length-1;i>=0;i--){
var o=obstacles[i];
o.x-=speed;
// Collision (AABB)
var px=player.x,py=player.y-player.h,pw=player.w,ph=player.h;
if(px+pw>o.x&&px<o.x+o.w&&py+ph>o.y-o.h&&py<o.y){
die();return;
}
if(o.x<-o.w)obstacles.splice(i,1);
}

// Score milestone particles
if(score%100===0&&score>0)spawnPart(player.x+12,player.y-20,8,'#4ecdc4');

// Particles
for(var j=particles.length-1;j>=0;j--){
var p=particles[j];
p.x+=p.vx;p.y+=p.vy;p.vy+=0.05;p.life-=0.025;
if(p.life<=0)particles.splice(j,1);
}
}

function die(){
dead=true;playing=false;
if(score>bestScore)bestScore=score;
spawnPart(player.x+12,player.y-16,20,'#ff6b6b');
}

function draw(){
// Background
var bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#0c2461');bg.addColorStop(0.7,'#1e3799');bg.addColorStop(1,'#0a3d62');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

// Ground
ctx.fillStyle='#2d3436';ctx.fillRect(0,GROUND,W,H-GROUND);
ctx.strokeStyle='#636e72';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(0,GROUND);ctx.lineTo(W,GROUND);ctx.stroke();
// Ground texture
ctx.fillStyle='#636e72';
for(var g=0;g<W;g+=12){
var gx=(g+frameCount*speed*0.5)%W;
ctx.fillRect(gx,GROUND+4,6,1);
}

// Obstacles
obstacles.forEach(function(o){
var og=ctx.createLinearGradient(o.x,o.y-o.h,o.x,o.y);
og.addColorStop(0,o.color);og.addColorStop(1,'rgba(0,0,0,0.3)');
ctx.fillStyle=og;
ctx.fillRect(o.x,o.y-o.h,o.w,o.h);
ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
ctx.strokeRect(o.x,o.y-o.h,o.w,o.h);
});

// Particles
particles.forEach(function(p){
ctx.globalAlpha=p.life;ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);ctx.fill();
});
ctx.globalAlpha=1;

// Player
var py=player.y,ph=player.h;
var pg=ctx.createLinearGradient(player.x,py-ph,player.x,py);
pg.addColorStop(0,'#74b9ff');pg.addColorStop(1,'#0984e3');
ctx.fillStyle=pg;
ctx.fillRect(player.x,py-ph,player.w,ph);
// Eye
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(player.x+18,py-ph+10,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#2d3436';
ctx.beginPath();ctx.arc(player.x+19,py-ph+10,2,0,Math.PI*2);ctx.fill();
// Running legs animation
if(playing&&!dead){
var legPhase=Math.sin(frameCount*0.3)*4;
ctx.strokeStyle='#74b9ff';ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(player.x+6,py);ctx.lineTo(player.x+6-legPhase,py+6);ctx.stroke();
ctx.beginPath();ctx.moveTo(player.x+18,py);ctx.lineTo(player.x+18+legPhase,py+6);ctx.stroke();
}

// HUD
ctx.fillStyle='#fff';ctx.font='bold 20px "Segoe UI",sans-serif';
ctx.textAlign='right';ctx.textBaseline='top';
ctx.fillText(Math.floor(score/10),W-15,12);
if(bestScore>0){ctx.font='12px "Segoe UI",sans-serif';ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fillText('Best: '+Math.floor(bestScore/10),W-15,36)}

// Overlays
ctx.textAlign='center';
if(!playing&&!dead){
ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(0,0,W,H);
ctx.fillStyle='#74b9ff';ctx.font='bold 28px "Segoe UI",sans-serif';
ctx.fillText('🏃 Dino Runner',W/2,H/2-50);
ctx.fillStyle='#fff';ctx.font='14px "Segoe UI",sans-serif';
ctx.fillText('Press Space or tap to jump',W/2,H/2-10);
ctx.fillText('Dodge the obstacles!',W/2,H/2+12);
ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='12px "Segoe UI",sans-serif';
ctx.fillText('Press any key or tap to start',W/2,H/2+50);
}
if(dead){
ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);
ctx.fillStyle='#ff6b6b';ctx.font='bold 28px "Segoe UI",sans-serif';
ctx.fillText('Game Over',W/2,H/2-40);
ctx.fillStyle='#fff';ctx.font='18px "Segoe UI",sans-serif';
ctx.fillText('Score: '+Math.floor(score/10),W/2,H/2);
if(score>=bestScore&&score>0){ctx.fillStyle='#feca57';ctx.font='14px "Segoe UI",sans-serif';ctx.fillText('🏆 New Best!',W/2,H/2+24)}
ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='12px "Segoe UI",sans-serif';ctx.fillText('Tap or press to restart',W/2,H/2+60);
}
}

function loop(){update();draw();requestAnimationFrame(loop)}

cn.addEventListener('click',jump);
cn.addEventListener('touchstart',function(e){e.preventDefault();jump()},{passive:false});
document.addEventListener('keydown',function(e){if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();jump()}});

loop();
<\/script>
</body>
</html>`;
