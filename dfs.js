// algorithms/dfs.js
import { getNeighbors, reconstructPath } from '../utils/helpers.js';

export function runDFS(g, start, end, rows, cols) {
  const visited  = [];
  const stack    = [{ r: start.r, c: start.c }];
  const seen     = {};
  const cameFrom = {};
  const startKey = `${start.r},${start.c}`;
  seen[startKey] = true;

  while (stack.length) {
    const curr = stack.pop();
    const key  = `${curr.r},${curr.c}`;
    visited.push(curr);

    if (curr.r === end.r && curr.c === end.c) {
      return { visited, path: reconstructPath(cameFrom, key) };
    }

    for (const nb of getNeighbors(g, curr.r, curr.c, rows, cols)) {
      const nk = `${nb.r},${nb.c}`;
      if (!seen[nk]) {
        seen[nk] = true;
        cameFrom[nk] = key;
        stack.push(nb);
      }
    }
  }
  return { visited, path: [] };
}
