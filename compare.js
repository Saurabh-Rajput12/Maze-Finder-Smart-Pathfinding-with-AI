// modes/compare.js
import { CELL, copyGrid } from '../utils/grid.js';
import { sleep }          from '../utils/helpers.js';
import { runAlgorithm }   from './solver.js';

/**
 * Run two algorithms simultaneously on separate grid copies,
 * animating them in lockstep. Returns comparison stats.
 */
export async function runCompare(algoA, algoB, g, start, end, rows, cols, drawFn, state) {
  const gridA = copyGrid(g);
  const gridB = copyGrid(g);

  const resA = runAlgorithm(algoA, gridA, start, end, rows, cols);
  const resB = runAlgorithm(algoB, gridB, start, end, rows, cols);

  const maxVisited = Math.max(resA.visited.length, resB.visited.length);
  const delay = Math.max(2, Math.round(120 - state.animationSpeed * 1.18));

  // Animate visited cells in lockstep
  for (let i = 0; i < maxVisited; i++) {
    if (state.stopRequested) return null;

    if (i < resA.visited.length) {
      const { r, c } = resA.visited[i];
      if (gridA[r][c] !== CELL.START && gridA[r][c] !== CELL.END) gridA[r][c] = CELL.VISITED;
    }
    if (i < resB.visited.length) {
      const { r, c } = resB.visited[i];
      if (gridB[r][c] !== CELL.START && gridB[r][c] !== CELL.END) gridB[r][c] = CELL.VISITED;
    }

    if (i % Math.max(1, Math.floor(delay < 10 ? 4 : 1)) === 0) {
      drawFn(gridA, gridB);
      await sleep(delay);
    }
  }

  drawFn(gridA, gridB);
  await sleep(delay * 3);

  // Animate paths
  const maxPath = Math.max(resA.path.length, resB.path.length);
  for (let i = 0; i < maxPath; i++) {
    if (state.stopRequested) return null;
    if (i < resA.path.length) {
      const { r, c } = resA.path[i];
      if (gridA[r][c] !== CELL.START && gridA[r][c] !== CELL.END) gridA[r][c] = CELL.PATH;
    }
    if (i < resB.path.length) {
      const { r, c } = resB.path[i];
      if (gridB[r][c] !== CELL.START && gridB[r][c] !== CELL.END) gridB[r][c] = CELL.PATH;
    }
    drawFn(gridA, gridB);
    await sleep(Math.max(18, delay * 1.4));
  }

  drawFn(gridA, gridB);

  return {
    a: { algo: algoA, visited: resA.visited.length, path: resA.path.length, timeMs: resA.timeMs },
    b: { algo: algoB, visited: resB.visited.length, path: resB.path.length, timeMs: resB.timeMs },
  };
}
