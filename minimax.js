// algorithms/minimax.js
import { getNeighbors, heuristic } from '../utils/helpers.js';

/**
 * Minimax scoring function for adversarial mode.
 * Maximizing player = enemy (tries to block/catch player).
 * Minimizing player = human (tries to reach end).
 */
export function minimaxScore(g, playerPos, enemyPos, endPos, depth, isMaximizing, rows, cols) {
  const playerDist = heuristic(playerPos.r, playerPos.c, endPos.r, endPos.c);
  if (playerDist === 0) return -1000; // player wins
  if (depth === 0) {
    return heuristic(enemyPos.r, enemyPos.c, playerPos.r, playerPos.c) - playerDist * 2;
  }

  const enemyNbs = getNeighbors(g, enemyPos.r, enemyPos.c, rows, cols).filter(
    nb => nb.r !== playerPos.r || nb.c !== playerPos.c
  );

  if (isMaximizing) {
    let best = -Infinity;
    for (const nb of enemyNbs) {
      const score = minimaxScore(g, playerPos, nb, endPos, depth - 1, false, rows, cols);
      best = Math.max(best, score);
    }
    return best === -Infinity ? 0 : best;
  } else {
    const playerNbs = getNeighbors(g, playerPos.r, playerPos.c, rows, cols).filter(
      nb => nb.r !== enemyPos.r || nb.c !== enemyPos.c
    );
    let best = Infinity;
    for (const nb of playerNbs) {
      const score = minimaxScore(g, nb, enemyPos, endPos, depth - 1, true, rows, cols);
      best = Math.min(best, score);
    }
    return best === Infinity ? 0 : best;
  }
}

/**
 * Pick best enemy move using minimax.
 */
export function getBestEnemyMove(g, playerPos, enemyPos, endPos, depth, rows, cols) {
  const nbs = getNeighbors(g, enemyPos.r, enemyPos.c, rows, cols).filter(
    nb => !(nb.r === playerPos.r && nb.c === playerPos.c)
  );
  if (!nbs.length) return null;

  let bestScore = -Infinity;
  let bestMove  = nbs[0];

  for (const nb of nbs) {
    const score = minimaxScore(g, playerPos, nb, endPos, depth, false, rows, cols);
    if (score > bestScore) {
      bestScore = score;
      bestMove  = nb;
    }
  }
  return bestMove;
}
