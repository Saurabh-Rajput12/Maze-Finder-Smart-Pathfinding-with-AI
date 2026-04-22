// utils/grid.js
export const CELL = {
  EMPTY:   0,
  WALL:    1,
  START:   2,
  END:     3,
  VISITED: 4,
  PATH:    5,
  PLAYER:  6,
  ENEMY:   7,
};

export const COLORS = {
  [CELL.EMPTY]:   '#111827',
  [CELL.WALL]:    '#2a3348',
  wall_top:       '#3a4560',
  [CELL.START]:   '#34c77b',
  [CELL.END]:     '#e05263',
  [CELL.VISITED]: '#2563a8',
  visited_dark:   '#1b3a6b',
  [CELL.PATH]:    '#e8b830',
  path_shine:     'rgba(255,240,160,0.28)',
  [CELL.PLAYER]:  '#9b72e0',
  [CELL.ENEMY]:   '#e0703a',
  grid_line:      'rgba(30,40,64,0.5)',
};

export function initGrid(cols, rows) {
  const g = [];
  for (let r = 0; r < rows; r++) {
    g.push(new Array(cols).fill(CELL.EMPTY));
  }
  return g;
}

export function copyGrid(g) {
  return g.map(row => [...row]);
}

export function placeStartEnd(g, cols, rows, state) {
  const sc = 1,        sr = Math.floor(rows / 2);
  const ec = cols - 2, er = Math.floor(rows / 2);
  g[sr][sc] = CELL.START;
  g[er][ec] = CELL.END;
  state.startCell = { r: sr, c: sc };
  state.endCell   = { r: er, c: ec };
}

export function computeCellSize(cols, rows, wrapper) {
  const maxW = wrapper.clientWidth  - 32;
  const maxH = wrapper.clientHeight - 32;
  const byW  = Math.floor(maxW / cols);
  const byH  = Math.floor(maxH / rows);
  return Math.max(8, Math.min(40, byW, byH));
}

export function initCanvas(cvs, cols, rows, cs) {
  cvs.width  = cols * cs;
  cvs.height = rows * cs;
}
