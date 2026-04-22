// algorithms/greedy.js
import { getNeighbors, heuristic, reconstructPath } from '../utils/helpers.js';

export function runGreedy(g, start, end, rows, cols) {
  const visited  = [];
  const open     = [{ r: start.r, c: start.c, h: heuristic(start.r, start.c, end.r, end.c) }];
  const seen     = {};
  const cameFrom = {};
  const startKey = `${start.r},${start.c}`;
  seen[startKey] = true;

  while (open.length) {
    open.sort((a, b) => a.h - b.h);
    const curr = open.shift();
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
        open.push({ r: nb.r, c: nb.c, h: heuristic(nb.r, nb.c, end.r, end.c) });
      }
    }
  }
  return { visited, path: [] };
}
