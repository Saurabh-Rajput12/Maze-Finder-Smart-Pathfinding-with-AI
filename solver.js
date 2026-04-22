// modes/solver.js
import { CELL, copyGrid } from '../utils/grid.js';
import { sleep } from '../utils/helpers.js';
import { runBFS }         from '../algorithms/bfs.js';
import { runDFS }         from '../algorithms/dfs.js';
import { runAStar }       from '../algorithms/astar.js';
import { runGreedy }      from '../algorithms/greedy.js';
import { runHillClimbing } from '../algorithms/hillClimbing.js';

export function runAlgorithm(algo, g, start, end, rows, cols) {
  const t0 = performance.now();
  let result;
  switch (algo) {
    case 'bfs':    result = runBFS(g, start, end, rows, cols);          break;
    case 'dfs':    result = runDFS(g, start, end, rows, cols);          break;
    case 'astar':  result = runAStar(g, start, end, rows, cols);        break;
    case 'greedy': result = runGreedy(g, start, end, rows, cols);       break;
    case 'hill':   result = runHillClimbing(g, start, end, rows, cols); break;
    default:       result = runBFS(g, start, end, rows, cols);
  }
  result.timeMs = performance.now() - t0;
  return result;
}

export function getDelay(speed) {
  // speed 1–100 → delay 200ms–1ms (inverted)
  return Math.max(1, Math.round(200 - speed * 1.98));
}

export async function animateResult(result, g, drawFn, state) {
  const { visited, path } = result;
  const delay = getDelay(state.animationSpeed);

  for (let i = 0; i < visited.length; i++) {
    if (state.stopRequested) return;
    const { r, c } = visited[i];
    if (g[r][c] !== CELL.START && g[r][c] !== CELL.END) {
      g[r][c] = CELL.VISITED;
    }
    state.visitedCount = i + 1;
    document.getElementById('stat-nodes').textContent = state.visitedCount;
    if (i % Math.max(1, Math.floor(delay < 10 ? 5 : 1)) === 0) {
      drawFn();
      await sleep(delay);
    }
  }

  drawFn();
  await sleep(delay * 2);

  for (let i = 0; i < path.length; i++) {
    if (state.stopRequested) return;
    const { r, c } = path[i];
    if (g[r][c] !== CELL.START && g[r][c] !== CELL.END) {
      g[r][c] = CELL.PATH;
    }
    state.pathLength = i + 1;
    document.getElementById('stat-path').textContent = state.pathLength;
    drawFn();
    await sleep(Math.max(20, delay * 1.5));
  }

  drawFn();
}
