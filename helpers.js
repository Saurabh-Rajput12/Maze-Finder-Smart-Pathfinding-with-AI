// utils/helpers.js
import { CELL } from './grid.js';

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getNeighbors(g, r, c, rows, cols, allowDiag = false) {
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  if (allowDiag) dirs.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
  const ns = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && g[nr][nc] !== CELL.WALL) {
      ns.push({ r: nr, c: nc });
    }
  }
  return ns;
}

export function heuristic(r1, c1, r2, c2) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

export function reconstructPath(cameFrom, endKey) {
  const path = [];
  let key = endKey;
  while (cameFrom[key]) {
    const [r, c] = key.split(',').map(Number);
    path.unshift({ r, c });
    key = cameFrom[key];
  }
  return path;
}

export function findSafeCell(g, preferR, preferC, rows, cols) {
  if (g[preferR][preferC] === CELL.EMPTY) return { r: preferR, c: preferC };
  for (let r = 1; r < rows - 1; r++) {
    for (let c = cols - 2; c > cols / 2; c--) {
      if (g[r][c] === CELL.EMPTY) return { r, c };
    }
  }
  return null;
}
