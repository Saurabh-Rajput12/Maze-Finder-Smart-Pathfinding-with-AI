// modes/adversarial.js
import { CELL } from '../utils/grid.js';
import { getBestEnemyMove } from '../algorithms/minimax.js';
import { findSafeCell, heuristic } from '../utils/helpers.js';

const KEY_DIRS = {
  ArrowUp:    { dr: -1, dc:  0 },
  ArrowDown:  { dr:  1, dc:  0 },
  ArrowLeft:  { dr:  0, dc: -1 },
  ArrowRight: { dr:  0, dc:  1 },
  w: { dr: -1, dc:  0 },
  s: { dr:  1, dc:  0 },
  a: { dr:  0, dc: -1 },
  d: { dr:  0, dc:  1 },
};

export function initAdversarial(g, state, rows, cols) {
  // Place player at start
  state.playerPos = { r: state.startCell.r, c: state.startCell.c };
  g[state.playerPos.r][state.playerPos.c] = CELL.PLAYER;

  // Place enemy near end (opposite side)
  const preferR = Math.floor(rows / 2);
  const preferC = cols - 2;
  const enemyStart = findSafeCell(g, preferR, preferC, rows, cols) ||
                     { r: Math.floor(rows / 2), c: cols - 2 };
  state.enemyPos = { r: enemyStart.r, c: enemyStart.c };
  g[state.enemyPos.r][state.enemyPos.c] = CELL.ENEMY;

  state.advMoves   = 0;
  state.advWon     = false;
  state.advLost    = false;
  state.minimaxDepth = 3;
}

export function handleAdversarialKey(e, g, state, rows, cols, drawFn, onWin, onLose) {
  const dir = KEY_DIRS[e.key];
  if (!dir || state.advWon || state.advLost) return;

  // ── Player move ──────────────────────────────
  const nr = state.playerPos.r + dir.dr;
  const nc = state.playerPos.c + dir.dc;

  if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && g[nr][nc] !== CELL.WALL && g[nr][nc] !== CELL.ENEMY) {
    g[state.playerPos.r][state.playerPos.c] = CELL.EMPTY;

    const reachedEnd = (nr === state.endCell.r && nc === state.endCell.c);
    state.playerPos = { r: nr, c: nc };
    state.advMoves++;
    document.getElementById('stat-nodes').textContent = state.advMoves;

    if (reachedEnd) {
      state.advWon = true;
      g[nr][nc] = CELL.PLAYER;
      drawFn();
      onWin && onWin(state.advMoves);
      return;
    }
    g[nr][nc] = CELL.PLAYER;
  }

  // ── Enemy move (minimax) ─────────────────────
  const bestMove = getBestEnemyMove(
    g, state.playerPos, state.enemyPos, state.endCell,
    state.minimaxDepth, rows, cols
  );

  if (bestMove) {
    g[state.enemyPos.r][state.enemyPos.c] = CELL.EMPTY;
    state.enemyPos = { r: bestMove.r, c: bestMove.c };

    // Check collision
    if (state.enemyPos.r === state.playerPos.r && state.enemyPos.c === state.playerPos.c) {
      state.advLost = true;
      g[state.enemyPos.r][state.enemyPos.c] = CELL.ENEMY;
      drawFn();
      onLose && onLose(state.advMoves);
      return;
    }
    g[state.enemyPos.r][state.enemyPos.c] = CELL.ENEMY;
  }

  drawFn();
}

export function getEnemyDistance(state) {
  return heuristic(
    state.playerPos.r, state.playerPos.c,
    state.enemyPos.r,  state.enemyPos.c
  );
}
