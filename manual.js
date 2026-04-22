// modes/manual.js
import { CELL } from '../utils/grid.js';
import { heuristic } from '../utils/helpers.js';

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

export function initManual(g, state) {
  // Place player at start
  state.playerPos = { r: state.startCell.r, c: state.startCell.c };
  state.manualMoves = 0;
  state.manualWon   = false;
  state.manualLost  = false;
  g[state.playerPos.r][state.playerPos.c] = CELL.PLAYER;
}

export function handleManualKey(e, g, state, rows, cols, drawFn, onWin) {
  const dir = KEY_DIRS[e.key];
  if (!dir || state.manualWon || state.manualLost) return;

  const nr = state.playerPos.r + dir.dr;
  const nc = state.playerPos.c + dir.dc;

  if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;
  if (g[nr][nc] === CELL.WALL) return;

  // Clear old position (restore to visited trail or empty)
  g[state.playerPos.r][state.playerPos.c] = CELL.VISITED;

  const reached = (g[nr][nc] === CELL.END);
  state.playerPos = { r: nr, c: nc };
  state.manualMoves++;
  document.getElementById('stat-nodes').textContent = state.manualMoves;

  if (reached) {
    state.manualWon = true;
    g[nr][nc] = CELL.PLAYER;
    drawFn();
    onWin && onWin(state.manualMoves);
  } else {
    g[nr][nc] = CELL.PLAYER;
    drawFn();
  }
}

export function getManualHint(g, state, end, rows, cols) {
  // Return direction to move (based on Manhattan heuristic toward end)
  const { r, c } = state.playerPos;
  const candidates = [
    { dr: -1, dc: 0, label: '↑' },
    { dr:  1, dc: 0, label: '↓' },
    { dr:  0, dc: -1, label: '←' },
    { dr:  0, dc:  1, label: '→' },
  ].filter(({ dr, dc }) => {
    const nr = r + dr, nc = c + dc;
    return nr >= 0 && nr < rows && nc >= 0 && nc < cols && g[nr][nc] !== CELL.WALL;
  });

  if (!candidates.length) return null;

  candidates.sort((a, b) =>
    heuristic(r + a.dr, c + a.dc, end.r, end.c) -
    heuristic(r + b.dr, c + b.dc, end.r, end.c)
  );
  return candidates[0].label;
}
