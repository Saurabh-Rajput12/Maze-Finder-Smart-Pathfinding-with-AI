// algorithms/hillClimbing.js
import { getNeighbors, heuristic, reconstructPath } from '../utils/helpers.js';

export function runHillClimbing(g, start, end, rows, cols) {
  const visited  = [];
  const cameFrom = {};
  let curr = { r: start.r, c: start.c };
  const seen = {};
  const startKey = `${start.r},${start.c}`;
  seen[startKey] = true;
  let maxIter = rows * cols * 2;

  while (maxIter-- > 0) {
    visited.push({ ...curr });
    const key = `${curr.r},${curr.c}`;

    if (curr.r === end.r && curr.c === end.c) {
      return { visited, path: reconstructPath(cameFrom, key) };
    }

    const nbs = getNeighbors(g, curr.r, curr.c, rows, cols)
      .filter(nb => !seen[`${nb.r},${nb.c}`]);

    if (!nbs.length) break;

    nbs.sort((a, b) =>
      heuristic(a.r, a.c, end.r, end.c) - heuristic(b.r, b.c, end.r, end.c)
    );

    const best  = nbs[0];
    const bestH = heuristic(best.r, best.c, end.r, end.c);
    const currH = heuristic(curr.r, curr.c, end.r, end.c);

    if (bestH >= currH) {
      // Stuck — try random restart among nearby unvisited
      const nearby = nbs.filter(n => heuristic(n.r, n.c, end.r, end.c) <= currH + 2);
      if (!nearby.length) break;
      const pick = nearby[Math.floor(Math.random() * nearby.length)];
      const pk = `${pick.r},${pick.c}`;
      seen[pk] = true;
      cameFrom[pk] = key;
      curr = pick;
    } else {
      const bk = `${best.r},${best.c}`;
      seen[bk] = true;
      cameFrom[bk] = key;
      curr = best;
    }
  }
  return { visited, path: [] };
}
