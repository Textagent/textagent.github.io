// ============================================
// game-tag.spec.js — {{Game:}} Tag Feature Tests
// ============================================
import { test, expect } from '@playwright/test';

// Pre-built chess game HTML — simulates what the AI would generate
const CHESS_GAME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Chess — AI Generated</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 100vh; font-family: 'Segoe UI', Arial, sans-serif; color: #e0e0e0;
}
h1 { margin: 16px 0 8px; font-size: 28px; color: #e94560; text-shadow: 0 0 20px rgba(233,69,96,0.4); }
#status { margin-bottom: 12px; font-size: 15px; color: #a0c4ff; min-height: 22px; }
#board {
  display: grid; grid-template-columns: repeat(8, 64px); grid-template-rows: repeat(8, 64px);
  border: 3px solid #e94560; border-radius: 6px; overflow: hidden;
  box-shadow: 0 0 40px rgba(233,69,96,0.2), 0 8px 32px rgba(0,0,0,0.5);
}
.cell {
  width: 64px; height: 64px; display: flex; align-items: center; justify-content: center;
  font-size: 42px; cursor: pointer; transition: background 0.15s; user-select: none;
}
.cell.light { background: #f0d9b5; }
.cell.dark  { background: #b58863; }
.cell.selected { background: #7ec8e3 !important; }
.cell.valid-move { background: rgba(126,200,227,0.5) !important; }
.cell.last-move { box-shadow: inset 0 0 0 3px rgba(233,69,96,0.5); }
.cell:hover { filter: brightness(1.1); }
#controls { margin-top: 16px; display: flex; gap: 12px; }
button {
  background: #e94560; color: #fff; border: none; padding: 8px 20px; border-radius: 6px;
  cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;
}
button:hover { background: #c73e54; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(233,69,96,0.3); }
#captured { margin-top: 12px; display: flex; gap: 20px; font-size: 14px; }
.cap-group { display: flex; align-items: center; gap: 4px; }
.cap-pieces { font-size: 22px; letter-spacing: 2px; }
</style>
</head>
<body>
<h1>♟ Chess</h1>
<div id="status">White's turn</div>
<div id="board"></div>
<div id="captured">
  <div class="cap-group"><span style="color:#ddd">Captured:</span> <span class="cap-pieces" id="cap-w"></span></div>
  <div class="cap-group"><span style="color:#555">Captured:</span> <span class="cap-pieces" id="cap-b"></span></div>
</div>
<div id="controls"><button onclick="resetGame()">↺ New Game</button></div>
<script>
var PIECES = {
  K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',
  k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'
};
var INIT = [
  'rnbqkbnr','pppppppp','........','........',
  '........','........','PPPPPPPP','RNBQKBNR'
];
var board, turn, selected, validMoves, lastFrom, lastTo, capturedW, capturedB;

function resetGame() {
  board = INIT.map(function(r){return r.split('')});
  turn = 'w'; selected = null; validMoves = [];
  lastFrom = null; lastTo = null;
  capturedW = []; capturedB = [];
  render();
  document.getElementById('status').textContent = "White\\'s turn";
}

function isWhite(p){ return p >= 'A' && p <= 'Z'; }
function isBlack(p){ return p >= 'a' && p <= 'z'; }
function isOwn(p){ return turn==='w' ? isWhite(p) : isBlack(p); }
function isEnemy(p){ return turn==='w' ? isBlack(p) : isWhite(p); }
function inBounds(r,c){ return r>=0 && r<8 && c>=0 && c<8; }

function getMoves(r,c) {
  var p = board[r][c], moves = [], t = p.toUpperCase();
  if (t === 'P') {
    var dir = isWhite(p) ? -1 : 1;
    var startRow = isWhite(p) ? 6 : 1;
    if (inBounds(r+dir,c) && board[r+dir][c]==='.') {
      moves.push([r+dir,c]);
      if (r===startRow && board[r+2*dir][c]==='.') moves.push([r+2*dir,c]);
    }
    [-1,1].forEach(function(dc){
      if (inBounds(r+dir,c+dc) && isEnemy(board[r+dir][c+dc])) moves.push([r+dir,c+dc]);
    });
  }
  if (t === 'R' || t === 'Q') {
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d){
      for(var i=1;i<8;i++){var nr=r+d[0]*i,nc=c+d[1]*i;
        if(!inBounds(nr,nc))break;if(isOwn(board[nr][nc]))break;
        moves.push([nr,nc]);if(isEnemy(board[nr][nc]))break;}
    });
  }
  if (t === 'B' || t === 'Q') {
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(d){
      for(var i=1;i<8;i++){var nr=r+d[0]*i,nc=c+d[1]*i;
        if(!inBounds(nr,nc))break;if(isOwn(board[nr][nc]))break;
        moves.push([nr,nc]);if(isEnemy(board[nr][nc]))break;}
    });
  }
  if (t === 'N') {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(function(d){
      var nr=r+d[0],nc=c+d[1];
      if(inBounds(nr,nc)&&!isOwn(board[nr][nc]))moves.push([nr,nc]);
    });
  }
  if (t === 'K') {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(function(d){
      var nr=r+d[0],nc=c+d[1];
      if(inBounds(nr,nc)&&!isOwn(board[nr][nc]))moves.push([nr,nc]);
    });
  }
  return moves;
}

function makeMove(fr,fc,tr,tc) {
  var captured = board[tr][tc];
  if (captured !== '.') {
    if (isWhite(captured)) capturedB.push(captured);
    else capturedW.push(captured);
  }
  board[tr][tc] = board[fr][fc];
  board[fr][fc] = '.';
  // Pawn promotion
  var p = board[tr][tc];
  if (p === 'P' && tr === 0) board[tr][tc] = 'Q';
  if (p === 'p' && tr === 7) board[tr][tc] = 'q';
  lastFrom = [fr,fc]; lastTo = [tr,tc];
  turn = turn === 'w' ? 'b' : 'w';
  var statusEl = document.getElementById('status');
  statusEl.textContent = (turn === 'w' ? "White" : "Black") + "\\'s turn";
  // Check for king capture (simple win)
  var wKing = false, bKing = false;
  for(var i=0;i<8;i++) for(var j=0;j<8;j++){
    if(board[i][j]==='K') wKing=true;
    if(board[i][j]==='k') bKing=true;
  }
  if (!wKing) statusEl.textContent = '🏆 Black wins! Click New Game to play again.';
  if (!bKing) statusEl.textContent = '🏆 White wins! Click New Game to play again.';
}

function cellClick(r,c) {
  if (selected) {
    var isValid = validMoves.some(function(m){return m[0]===r && m[1]===c});
    if (isValid) {
      makeMove(selected[0], selected[1], r, c);
      selected = null; validMoves = [];
      render(); return;
    }
  }
  if (board[r][c] !== '.' && isOwn(board[r][c])) {
    selected = [r,c];
    validMoves = getMoves(r,c);
  } else {
    selected = null; validMoves = [];
  }
  render();
}

function render() {
  var boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  for (var r=0; r<8; r++) {
    for (var c=0; c<8; c++) {
      var cell = document.createElement('div');
      cell.className = 'cell ' + ((r+c)%2===0 ? 'light' : 'dark');
      if (selected && selected[0]===r && selected[1]===c) cell.classList.add('selected');
      if (validMoves.some(function(m){return m[0]===r && m[1]===c})) cell.classList.add('valid-move');
      if ((lastFrom && lastFrom[0]===r && lastFrom[1]===c)||(lastTo && lastTo[0]===r && lastTo[1]===c))
        cell.classList.add('last-move');
      var p = board[r][c];
      if (p !== '.') cell.textContent = PIECES[p] || p;
      (function(row,col){ cell.addEventListener('click', function(){ cellClick(row,col); }); })(r,c);
      boardEl.appendChild(cell);
    }
  }
  document.getElementById('cap-w').textContent = capturedW.map(function(p){return PIECES[p]}).join('');
  document.getElementById('cap-b').textContent = capturedB.map(function(p){return PIECES[p]}).join('');
}

resetGame();
<\/script>
</body>
</html>`;

test.describe('Game Tag — Chess Demo', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView && w.MDView.currentViewMode === 'split'
                && w.MDView.formattingActions
                && w.MDView.formattingActions['game-tag'];
        });
        await page.locator('#markdown-editor').fill('');
        await page.waitForTimeout(200);
    });

    test('Game card renders with correct UI elements', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@Game:\n  @model: gemini-flash\n  @engine: canvas2d\n  @prompt: build a chess game\n}}'
        );
        await page.waitForTimeout(1000);

        // Card should appear in preview
        const card = page.locator('.ai-game-card');
        await expect(card).toBeVisible();

        // Header elements
        await expect(card.locator('.ai-game-icon')).toContainText('🎮');
        await expect(card.locator('.ai-game-label')).toContainText('Game Builder');
        await expect(card.locator('.ai-game-engine-badge')).toContainText('Canvas 2D');

        // Engine pills
        const pills = card.locator('.ai-game-engine-pill');
        await expect(pills).toHaveCount(3);
        await expect(pills.nth(1)).toHaveClass(/active/); // Canvas 2D is active

        // Buttons
        await expect(card.locator('.ai-game-generate')).toBeVisible();
        await expect(card.locator('.ai-game-remove')).toBeVisible();

        // Prompt
        const promptInput = card.locator('.ai-game-prompt-input');
        await expect(promptInput).toBeVisible();
        await expect(promptInput).toHaveValue('build a chess game');
    });

    test('Engine pill switching updates badge', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@Game:\n  @engine: threejs\n  @prompt: test game\n}}'
        );
        await page.waitForTimeout(1000);

        const card = page.locator('.ai-game-card');
        await expect(card.locator('.ai-game-engine-badge')).toContainText('Three.js');

        // Click Canvas 2D pill
        await card.locator('.ai-game-engine-pill[data-engine="canvas2d"]').click();
        await expect(card.locator('.ai-game-engine-badge')).toContainText('Canvas 2D');

        // Click P5.js pill
        await card.locator('.ai-game-engine-pill[data-engine="p5js"]').click();
        await expect(card.locator('.ai-game-engine-badge')).toContainText('P5.js');

        // Verify editor was updated
        const editorVal = await page.locator('#markdown-editor').inputValue();
        expect(editorVal).toContain('@engine: p5js');
    });

    test('Chess game plays inside iframe after injection', async ({ page }) => {
        // Insert a Game tag
        await page.locator('#markdown-editor').fill(
            '{{@Game:\n  @engine: canvas2d\n  @prompt: build a chess game\n}}'
        );
        await page.waitForTimeout(1000);

        // Inject pre-built chess game HTML (simulating AI generation)
        await page.evaluate((html) => {
            const preview = document.querySelector('.ai-game-preview[data-game-index="0"]');
            if (preview) {
                preview.style.display = '';
                preview.innerHTML = '';
                const iframe = document.createElement('iframe');
                iframe.className = 'ai-game-iframe';
                iframe.sandbox = 'allow-scripts';
                iframe.srcdoc = html;
                preview.appendChild(iframe);

                // Show Play/Export buttons
                const playBtn = document.querySelector('.ai-game-play[data-game-index="0"]');
                const exportBtn = document.querySelector('.ai-game-export[data-game-index="0"]');
                if (playBtn) playBtn.style.display = '';
                if (exportBtn) exportBtn.style.display = '';
            }
        }, CHESS_GAME_HTML);

        // Verify iframe appeared
        const iframe = page.locator('.ai-game-iframe');
        await expect(iframe).toBeVisible();

        // Wait for game to load inside iframe
        await page.waitForTimeout(2000);

        // Verify the chess board rendered inside the iframe
        const frame = iframe.contentFrame();
        await expect(frame.locator('#board')).toBeVisible();
        await expect(frame.locator('.cell')).toHaveCount(64); // 8x8 board
        await expect(frame.locator('#status')).toBeVisible();

        // Play a move — click e2 pawn (row 6, col 4)
        const e2 = frame.locator('.cell').nth(6 * 8 + 4);
        await e2.click();
        await page.waitForTimeout(300);

        // Should see valid move highlights
        const validMoves = frame.locator('.cell.valid-move');
        const validCount = await validMoves.count();
        expect(validCount).toBeGreaterThan(0); // e2 pawn has at least 1-2 valid moves

        // Click e4 (row 4, col 4) to move pawn
        const e4 = frame.locator('.cell').nth(4 * 8 + 4);
        await e4.click();
        await page.waitForTimeout(300);

        // Turn should switch to black
        await expect(frame.locator('#status')).toContainText('Black');

        // Play/Export buttons should be visible
        await expect(page.locator('.ai-game-play[data-game-index="0"]')).toBeVisible();
        await expect(page.locator('.ai-game-export[data-game-index="0"]')).toBeVisible();
    });

    test('Remove button deletes Game tag from editor', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            'Hello\n\n{{@Game:\n  @engine: threejs\n  @prompt: test\n}}\n\nWorld'
        );
        await page.waitForTimeout(1000);

        await expect(page.locator('.ai-game-card')).toBeVisible();

        // Click remove
        await page.locator('.ai-game-remove[data-game-index="0"]').click();
        await page.waitForTimeout(500);

        // Tag should be gone from editor
        const val = await page.locator('#markdown-editor').inputValue();
        expect(val).not.toContain('{{@Game:');
        expect(val).toContain('Hello');
        expect(val).toContain('World');
    });
});

test.describe('Game Tag — @prebuilt: Field & Import', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#markdown-editor', { state: 'visible' });
        await page.waitForFunction(() => {
            const w = /** @type {any} */ (window);
            return w.MDView && w.MDView.currentViewMode === 'split'
                && w.MDView.formattingActions
                && w.MDView.formattingActions['game-tag']
                && w.__GAME_PREBUILTS;
        });
        await page.locator('#markdown-editor').fill('');
        await page.waitForTimeout(200);
    });

    test('@prebuilt: chess auto-plays in iframe', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@Game: @engine: canvas2d @prebuilt: chess @prompt: Chess game}}'
        );
        await page.waitForTimeout(2000);

        // Card should be visible
        const card = page.locator('.ai-game-card');
        await expect(card).toBeVisible();

        // Engine badge should say Canvas 2D (not Three.js)
        await expect(card.locator('.ai-game-engine-badge')).toContainText('Canvas 2D');

        // Preview iframe should be auto-created for prebuilt
        const preview = page.locator('.ai-game-preview[data-game-index="0"]');
        await expect(preview).toBeVisible();

        const iframe = preview.locator('iframe');
        await expect(iframe).toBeVisible();

        // Play/Export/Fullscreen buttons should be visible
        await expect(card.locator('.ai-game-play')).toBeVisible();
        await expect(card.locator('.ai-game-export')).toBeVisible();
        await expect(card.locator('.ai-game-fullscreen')).toBeVisible();
    });

    test('@prebuilt: single-line tag parses all fields', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@Game: @engine: canvas2d @prebuilt: snake @prompt: Snake game}}'
        );
        await page.waitForTimeout(1500);

        const card = page.locator('.ai-game-card');
        await expect(card).toBeVisible();

        // Engine should be canvas2d, not default threejs
        await expect(card.locator('.ai-game-engine-badge')).toContainText('Canvas 2D');

        // Preview should auto-play (snake prebuilt exists)
        const preview = page.locator('.ai-game-preview[data-game-index="0"]');
        await expect(preview).toBeVisible();
    });

    test('Import button is visible on all game cards', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@Game: @engine: threejs @prompt: any game}}'
        );
        await page.waitForTimeout(1000);

        const importBtn = page.locator('.ai-game-import[data-game-index="0"]');
        await expect(importBtn).toBeVisible();
        await expect(importBtn).toContainText('Import');
    });

    test('Import modal opens and closes', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@Game: @engine: threejs @prompt: test}}'
        );
        await page.waitForTimeout(1000);

        // Click Import
        await page.locator('.ai-game-import[data-game-index="0"]').click();
        await page.waitForTimeout(300);

        // Modal should be visible
        const modal = page.locator('#game-import-modal');
        await expect(modal).toBeVisible();
        await expect(modal.locator('.ai-game-import-code')).toBeVisible();
        await expect(modal.locator('.ai-game-import-run')).toBeVisible();

        // Run button should be disabled when textarea is empty
        await expect(modal.locator('.ai-game-import-run')).toBeDisabled();

        // Close with X button
        await modal.locator('.ai-game-import-close').click();
        await page.waitForTimeout(300);
        await expect(modal).not.toBeVisible();
    });

    test('Import modal pre-fills with prebuilt game source', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@Game: @engine: canvas2d @prebuilt: chess @prompt: Chess}}'
        );
        await page.waitForTimeout(2000);

        // Click Import on the chess card
        await page.locator('.ai-game-import[data-game-index="0"]').click();
        await page.waitForTimeout(300);

        const modal = page.locator('#game-import-modal');
        await expect(modal).toBeVisible();

        // Header should show "View / Edit"
        await expect(modal.locator('.ai-game-import-header span')).toContainText('View / Edit');

        // Textarea should contain HTML (pre-filled with chess source)
        const code = await modal.locator('.ai-game-import-code').inputValue();
        expect(code.length).toBeGreaterThan(100);
        expect(code).toContain('<!DOCTYPE html>');

        // Run button should be enabled (code is pre-filled)
        await expect(modal.locator('.ai-game-import-run')).toBeEnabled();
    });

    test('Import modal accepts pasted HTML and runs game', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@Game: @engine: canvas2d @prompt: empty game}}'
        );
        await page.waitForTimeout(1000);

        // Click Import
        await page.locator('.ai-game-import[data-game-index="0"]').click();
        await page.waitForTimeout(300);

        const modal = page.locator('#game-import-modal');
        const textarea = modal.locator('.ai-game-import-code');
        const runBtn = modal.locator('.ai-game-import-run');

        // Paste simple HTML game
        const simpleGame = '<!DOCTYPE html><html><body><h1 id="test-game">Hello Game</h1></body></html>';
        await textarea.fill(simpleGame);
        await page.waitForTimeout(200);

        // Run button should now be enabled
        await expect(runBtn).toBeEnabled();

        // Click Run
        await runBtn.click();
        await page.waitForTimeout(1000);

        // Modal should close
        await expect(modal).not.toBeVisible();

        // Game should render in iframe
        const iframe = page.locator('.ai-game-preview[data-game-index="0"] iframe');
        await expect(iframe).toBeVisible();

        // Play/Export buttons should now be visible
        await expect(page.locator('.ai-game-play[data-game-index="0"]')).toBeVisible();
        await expect(page.locator('.ai-game-export[data-game-index="0"]')).toBeVisible();
    });

    test('Multiple prebuilt games render independently', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@Game: @engine: canvas2d @prebuilt: chess @prompt: Chess}}\n\n' +
            '{{@Game: @engine: canvas2d @prebuilt: snake @prompt: Snake}}'
        );
        await page.waitForTimeout(2000);

        // Both cards should exist
        const cards = page.locator('.ai-game-card');
        await expect(cards).toHaveCount(2);

        // Both should have preview iframes
        const preview0 = page.locator('.ai-game-preview[data-game-index="0"]');
        const preview1 = page.locator('.ai-game-preview[data-game-index="1"]');
        await expect(preview0).toBeVisible();
        await expect(preview1).toBeVisible();
        await expect(preview0.locator('iframe')).toBeVisible();
        await expect(preview1.locator('iframe')).toBeVisible();
    });

    test('Upload file label is present in Import modal', async ({ page }) => {
        await page.locator('#markdown-editor').fill(
            '{{@Game: @engine: threejs @prompt: test}}'
        );
        await page.waitForTimeout(1000);

        await page.locator('.ai-game-import[data-game-index="0"]').click();
        await page.waitForTimeout(300);

        const modal = page.locator('#game-import-modal');
        await expect(modal.locator('.ai-game-import-file-label')).toContainText('Upload File');
        await expect(modal.locator('.ai-game-import-file')).toHaveAttribute('accept', '.html,.htm');
    });
});
