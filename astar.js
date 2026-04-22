// algorithms/astar.js
import { getNeighbors, heuristic, reconstructPath } from '../utils/helpers.js';

export function runAStar(g, start, end, rows, cols) {
  const visited  = [];
  const open     = [];
  const gScore   = {};
  const fScore   = {};
  const cameFrom = {};
  const closed   = {};

  const startKey = `${start.r},${start.c}`;
  gScore[startKey] = 0;
  fScore[startKey] = heuristic(start.r, start.c, end.r, end.c);
  open.push({ r: start.r, c: start.c, f: fScore[startKey] });

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const curr = open.shift();
    const key  = `${curr.r},${curr.c}`;
    if (closed[key]) continue;
    closed[key] = true;
    visited.push(curr);

    if (curr.r === end.r && curr.c === end.c) {
      return { visited, path: reconstructPath(cameFrom, key) };
    }

    for (const nb of getNeighbors(g, curr.r, curr.c, rows, cols)) {
      const nk = `${nb.r},${nb.c}`;
      if (closed[nk]) continue;
      const tentG = (gScore[key] || 0) + 1;
      if (tentG < (gScore[nk] ?? Infinity)) {
        cameFrom[nk] = key;
        gScore[nk]   = tentG;
        fScore[nk]   = tentG + heuristic(nb.r, nb.c, end.r, end.c);
        open.push({ r: nb.r, c: nb.c, f: fScore[nk] });
      }
    }
  }
  return { visited, path: [] };
}
