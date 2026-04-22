// maze/spiral.js
import { CELL } from '../utils/grid.js';

export function generateSpiral(g, cols, rows) {
  let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
  const step = 2;

  while (top < bottom && left < right) {
    for (let c = left; c <= right; c++)  g[top][c]    = CELL.WALL;
    for (let r = top; r <= bottom; r++)  g[r][right]  = CELL.WALL;
    for (let c = right; c >= left; c--)  g[bottom][c] = CELL.WALL;
    for (let r = bottom; r >= top; r--)  g[r][left]   = CELL.WALL;
    top    += step;
    bottom -= step;
    left   += step;
    right  -= step;
  }

  // Open random gaps so maze is solvable
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (g[r][c] === CELL.WALL && Math.random() < 0.25)
        g[r][c] = CELL.EMPTY;
}
