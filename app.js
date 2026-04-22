// app.js — Main entry point
import { CELL, COLORS, initGrid, copyGrid, placeStartEnd, computeCellSize, initCanvas } from './utils/grid.js';
import { sleep } from './utils/helpers.js';

import { generateRecursiveBacktracking } from './maze/recursive.js';
import { generateRandomWalls }           from './maze/random.js';
import { generateSpiral }                from './maze/spiral.js';
import { generateRooms }                 from './maze/rooms.js';

import { runAlgorithm, animateResult }   from './modes/solver.js';
import { runCompare }                    from './modes/compare.js';
import { initManual, handleManualKey, getManualHint }                   from './modes/manual.js';
import { initAdversarial, handleAdversarialKey, getEnemyDistance }      from './modes/adversarial.js';

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  mode:           'solver',   // solver | compare | manual | adversarial
  algo:           'bfs',
  algoA:          'bfs',
  algoB:          'astar',
  mazeType:       'recursive',
  difficulty:     'medium',
  animationSpeed: 50,
  rows: 25, cols: 35,
  grid: null,
  startCell: null, endCell: null,
  playerPos: null, enemyPos: null,
  running:        false,
  stopRequested:  false,
  visitedCount:   0,
  pathLength:     0,
  manualMoves:    0, manualWon: false, manualLost: false,
  advMoves:       0, advWon: false, advLost: false,
  minimaxDepth:   3,
};

// ─── Canvas setup ─────────────────────────────────────────────────────────────
const wrapper = document.getElementById('canvas-wrapper');
const cvs     = document.getElementById('maze-canvas');
const ctx     = cvs.getContext('2d');

// Compare mode uses two side-by-side canvases
const cvsA = document.getElementById('maze-canvas-a');
const cvsB = document.getElementById('maze-canvas-b');
const ctxA = cvsA ? cvsA.getContext('2d') : null;
const ctxB = cvsB ? cvsB.getContext('2d') : null;

let CS = 18; // cell size in px

// ─── Drawing ──────────────────────────────────────────────────────────────────
function drawGrid(grid, context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const v = grid[r][c];
      const x = c * CS, y = r * CS;

      // Base fill
      context.fillStyle = COLORS[v] ?? COLORS[CELL.EMPTY];
      context.fillRect(x, y, CS, CS);

      // Wall top highlight
      if (v === CELL.WALL && CS >= 10) {
        context.fillStyle = COLORS.wall_top;
        context.fillRect(x, y, CS, 2);
      }

      // Path shimmer
      if (v === CELL.PATH && CS >= 10) {
        context.fillStyle = COLORS.path_shine;
        context.fillRect(x, y, CS, Math.ceil(CS * 0.4));
      }

      // Cell labels (start/end)
      if (CS >= 14) {
        if (v === CELL.START) { drawLabel(context, x, y, 'S'); }
        if (v === CELL.END)   { drawLabel(context, x, y, 'E'); }
        if (v === CELL.PLAYER){ drawLabel(context, x, y, '●'); }
        if (v === CELL.ENEMY) { drawLabel(context, x, y, '▲'); }
      }

      // Grid lines (subtle)
      if (CS >= 12) {
        context.strokeStyle = COLORS.grid_line;
        context.lineWidth   = 0.5;
        context.strokeRect(x + 0.5, y + 0.5, CS - 1, CS - 1);
      }
    }
  }
}

function drawLabel(ctx, x, y, label) {
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font      = `bold ${Math.round(CS * 0.55)}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + CS / 2, y + CS / 2);
}

function draw() {
  drawGrid(state.grid, ctx, cvs);
}

function drawCompare(gridA, gridB) {
  if (ctxA && ctxB) {
    drawGrid(gridA, ctxA, cvsA);
    drawGrid(gridB, ctxB, cvsB);
  }
}

// ─── Maze generation ──────────────────────────────────────────────────────────
function generateMaze() {
  state.grid = initGrid(state.cols, state.rows);
  const g = state.grid;

  switch (state.mazeType) {
    case 'recursive': generateRecursiveBacktracking(g, state.cols, state.rows); break;
    case 'random':    generateRandomWalls(g, state.cols, state.rows, state.difficulty); break;
    case 'spiral':    generateSpiral(g, state.cols, state.rows); break;
    case 'rooms':     generateRooms(g, state.cols, state.rows, state.difficulty); break;
    default:          generateRecursiveBacktracking(g, state.cols, state.rows);
  }

  placeStartEnd(g, state.cols, state.rows, state);
  resetStats();
  draw();
}

function resetStats() {
  state.visitedCount = 0;
  state.pathLength   = 0;
  state.manualMoves  = 0;
  state.manualWon    = state.manualLost   = false;
  state.advMoves     = 0;
  state.advWon       = state.advLost      = false;
  state.stopRequested = false;

  setEl('stat-nodes', '0');
  setEl('stat-path',  '0');
  setEl('stat-time',  '0');
  setEl('status-msg', '');
  document.getElementById('compare-results')?.classList.add('hidden');
  document.getElementById('overlay-msg')?.classList.add('hidden');
}

// ─── Canvas resize ────────────────────────────────────────────────────────────
function resizeCanvas() {
  CS = computeCellSize(state.cols, state.rows, wrapper);
  initCanvas(cvs, state.cols, state.rows, CS);
  if (ctxA) initCanvas(cvsA, state.cols, state.rows, CS);
  if (ctxB) initCanvas(cvsB, state.cols, state.rows, CS);
  if (state.grid) draw();
}

// ─── Mode UI switching ────────────────────────────────────────────────────────
function switchMode(newMode) {
  state.mode = newMode;
  stopAnimation();
  resetStats();

  // Hide/show panels
  document.getElementById('panel-solver').classList.toggle('hidden',      newMode !== 'solver');
  document.getElementById('panel-compare').classList.toggle('hidden',     newMode !== 'compare');
  document.getElementById('panel-manual').classList.toggle('hidden',      newMode !== 'manual' && newMode !== 'adversarial');
  document.getElementById('compare-canvases').classList.toggle('hidden',  newMode !== 'compare');
  document.getElementById('maze-canvas').classList.toggle('hidden',       newMode === 'compare');

  document.querySelectorAll('.mode-tab').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.mode === newMode)
  );

  if (newMode === 'manual') {
    initManual(state.grid, state);
    draw();
    setEl('status-msg', 'Use arrow keys or WASD to navigate');
  } else if (newMode === 'adversarial') {
    initAdversarial(state.grid, state, state.rows, state.cols);
    draw();
    setEl('status-msg', 'Reach the exit before the enemy catches you!');
  } else if (newMode === 'compare') {
    generateMaze();
    resizeCanvas();
    if (ctxA) drawGrid(state.grid, ctxA, cvsA);
    if (ctxB) drawGrid(state.grid, ctxB, cvsB);
  } else {
    generateMaze();
  }
}

// ─── Run controls ─────────────────────────────────────────────────────────────
async function runSolver() {
  if (state.running) return;
  state.running = true;
  state.stopRequested = false;
  setEl('status-msg', 'Running…');

  // Reset visited/path cells (keep walls/start/end)
  for (let r = 0; r < state.rows; r++)
    for (let c = 0; c < state.cols; c++)
      if (state.grid[r][c] === CELL.VISITED || state.grid[r][c] === CELL.PATH)
        state.grid[r][c] = CELL.EMPTY;
  draw();

  const t0 = performance.now();
  const result = runAlgorithm(state.algo, state.grid, state.startCell, state.endCell, state.rows, state.cols);
  const elapsed = (performance.now() - t0).toFixed(1);
  setEl('stat-time', elapsed + 'ms');

  await animateResult(result, state.grid, draw, state);

  if (!state.stopRequested) {
    const found = result.path.length > 0;
    setEl('status-msg', found ? `Path found! ${result.path.length} steps` : 'No path found');
    setEl('stat-nodes', result.visited.length);
    setEl('stat-path',  result.path.length);
  }
  state.running = false;
}

async function runCompareMode() {
  if (state.running) return;
  state.running = true;
  state.stopRequested = false;

  const gA = copyGrid(state.grid);
  const gB = copyGrid(state.grid);

  setEl('status-msg', `Comparing ${state.algoA.toUpperCase()} vs ${state.algoB.toUpperCase()}…`);

  const results = await runCompare(
    state.algoA, state.algoB,
    state.grid, state.startCell, state.endCell,
    state.rows, state.cols,
    drawCompare, state
  );

  if (results && !state.stopRequested) {
    showCompareResults(results);
    setEl('status-msg', 'Comparison complete');
  }
  state.running = false;
}

function showCompareResults(res) {
  const panel = document.getElementById('compare-results');
  if (!panel) return;
  panel.classList.remove('hidden');

  const winner = res.a.path.length && (!res.b.path.length || res.a.path.length <= res.b.path.length)
    ? 'a' : 'b';

  ['a', 'b'].forEach(k => {
    const r = res[k];
    setEl(`cmp-${k}-algo`,    r.algo.toUpperCase());
    setEl(`cmp-${k}-nodes`,   r.visited);
    setEl(`cmp-${k}-path`,    r.path || '—');
    setEl(`cmp-${k}-time`,    r.timeMs.toFixed(2) + 'ms');
    document.getElementById(`cmp-${k}`)?.classList.toggle('winner', k === winner);
  });
}

function stopAnimation() {
  state.stopRequested = true;
  state.running = false;
}

// ─── Keyboard handler ─────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  const movementKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'];
  if (!movementKeys.includes(e.key)) return;

  if (state.mode === 'manual') {
    e.preventDefault();
    handleManualKey(e, state.grid, state, state.rows, state.cols, draw,
      (moves) => showOverlay('🎉 You Win!', `Reached the exit in ${moves} moves`),
    );
  } else if (state.mode === 'adversarial') {
    e.preventDefault();
    handleAdversarialKey(e, state.grid, state, state.rows, state.cols, draw,
      (moves) => showOverlay('🎉 You Escaped!', `Reached exit in ${moves} moves`),
      (moves) => showOverlay('💀 Caught!', `The enemy caught you after ${moves} moves`),
    );

    const dist = getEnemyDistance(state);
    setEl('stat-nodes', state.advMoves);
    if (dist <= 3) setEl('status-msg', '⚠️ Enemy is close!');
    else           setEl('status-msg', `Enemy distance: ${dist}`);
  }
});

function showOverlay(title, msg) {
  const el = document.getElementById('overlay-msg');
  if (!el) return;
  el.classList.remove('hidden');
  setEl('overlay-title', title);
  setEl('overlay-body',  msg);
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function bindSelect(id, stateKey) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = state[stateKey];
  el.addEventListener('change', () => { state[stateKey] = el.value; });
}

function bindRange(id, stateKey, labelId) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = state[stateKey];
  el.addEventListener('input', () => {
    state[stateKey] = Number(el.value);
    if (labelId) setEl(labelId, el.value);
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  // Bind mode tabs
  document.querySelectorAll('.mode-tab').forEach(btn =>
    btn.addEventListener('click', () => switchMode(btn.dataset.mode))
  );

  // Bind controls
  bindSelect('select-algo',       'algo');
  bindSelect('select-algo-a',     'algoA');
  bindSelect('select-algo-b',     'algoB');
  bindSelect('select-maze',       'mazeType');
  bindSelect('select-difficulty', 'difficulty');
  bindRange ('range-speed',       'animationSpeed', 'label-speed');
  bindRange ('range-speed-cmp',   'animationSpeed', 'label-speed-cmp');
  bindRange ('range-rows',        'rows',           'label-rows');
  bindRange ('range-cols',        'cols',           'label-cols');

  // Bind buttons
  document.getElementById('btn-generate')?.addEventListener('click', () => {
    stopAnimation();
    generateMaze();
    if (state.mode === 'manual') {
      initManual(state.grid, state); draw();
    } else if (state.mode === 'adversarial') {
      initAdversarial(state.grid, state, state.rows, state.cols); draw();
    }
  });

  document.getElementById('btn-run-cmp')?.addEventListener('click', () => {
    if (state.mode === 'compare') runCompareMode();
  });
  document.querySelector('.btn-stop-cmp')?.addEventListener('click', stopAnimation);

  document.getElementById('btn-run')?.addEventListener('click', () => {
    if (state.mode === 'solver')  runSolver();
    if (state.mode === 'compare') runCompareMode();
  });

  document.getElementById('btn-stop')?.addEventListener('click', stopAnimation);

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    stopAnimation();
    generateMaze();
    if (state.mode === 'manual') { initManual(state.grid, state); draw(); }
    if (state.mode === 'adversarial') { initAdversarial(state.grid, state, state.rows, state.cols); draw(); }
  });

  document.getElementById('btn-hint')?.addEventListener('click', () => {
    if (state.mode === 'manual') {
      const hint = getManualHint(state.grid, state, state.endCell, state.rows, state.cols);
      setEl('status-msg', hint ? `Hint: go ${hint}` : 'No hint available');
    }
  });

  document.getElementById('overlay-close')?.addEventListener('click', () => {
    document.getElementById('overlay-msg')?.classList.add('hidden');
  });

  // Resize
  window.addEventListener('resize', () => { resizeCanvas(); draw(); });

  // Initial setup
  resizeCanvas();
  generateMaze();
  switchMode('solver');
}

document.addEventListener('DOMContentLoaded', init);
