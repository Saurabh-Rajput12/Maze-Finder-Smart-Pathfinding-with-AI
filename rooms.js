// maze/rooms.js
import { CELL } from '../utils/grid.js';

export function generateRooms(g, cols, rows, difficulty) {
  const numRooms = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 9;

  // Fill all with walls
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      g[r][c] = CELL.WALL;

  // Carve rooms
  for (let i = 0; i < numRooms; i++) {
    const rw = 3 + Math.floor(Math.random() * 4);
    const rh = 3 + Math.floor(Math.random() * 3);
    const rr = 1 + Math.floor(Math.random() * (rows - rh - 2));
    const rc = 1 + Math.floor(Math.random() * (cols - rw - 2));
    for (let r = rr; r < rr + rh; r++)
      for (let c = rc; c < rc + rw; c++)
        g[r][c] = CELL.EMPTY;
  }

  // Carve horizontal corridors
  for (let r = 1; r < rows - 1; r += 2)
    for (let c = 1; c < cols - 1; c += 4)
      if (Math.random() < 0.5) g[r][c] = CELL.EMPTY;

  // Carve vertical corridors
  for (let r = 1; r < rows - 1; r += 4)
    for (let c = 1; c < cols - 1; c += 2)
      if (Math.random() < 0.5) g[r][c] = CELL.EMPTY;
}
