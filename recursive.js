// maze/recursive.js
import { CELL } from '../utils/grid.js';
import { shuffle } from '../utils/helpers.js';

export function generateRecursiveBacktracking(g, cols, rows) {
  // Fill all with walls
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      g[r][c] = CELL.WALL;

  function carve(r, c) {
    const dirs = shuffle([[0, 2], [0, -2], [2, 0], [-2, 0]]);
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && g[nr][nc] === CELL.WALL) {
        g[r + dr / 2][c + dc / 2] = CELL.EMPTY;
        g[nr][nc] = CELL.EMPTY;
        carve(nr, nc);
      }
    }
  }

  g[1][1] = CELL.EMPTY;
  carve(1, 1);

  // Open entry/exit
  g[0][1]           = CELL.EMPTY;
  g[rows - 1][cols - 2] = CELL.EMPTY;
}
