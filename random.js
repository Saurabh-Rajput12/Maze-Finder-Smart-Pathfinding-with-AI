// maze/random.js
import { CELL } from '../utils/grid.js';

export function generateRandomWalls(g, cols, rows, difficulty) {
  const densities = { easy: 0.25, medium: 0.35, hard: 0.48 };
  const density   = densities[difficulty] || 0.3;

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      g[r][c] = Math.random() < density ? CELL.WALL : CELL.EMPTY;

  // Keep border clear
  for (let r = 0; r < rows; r++) {
    g[r][0]        = CELL.EMPTY;
    g[r][cols - 1] = CELL.EMPTY;
  }
  for (let c = 0; c < cols; c++) {
    g[0][c]        = CELL.EMPTY;
    g[rows - 1][c] = CELL.EMPTY;
  }
}
