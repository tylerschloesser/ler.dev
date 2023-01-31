type Color = null | string
type Grid = Color[][]

const GRID_COLS = 100
const GRID_ROWS = 100

const grid: Grid = new Array(GRID_COLS).fill(null).map(() =>
  new Array(GRID_ROWS).fill(null).map(() => {
    return `hsl(0, 80%, ${Math.floor(Math.random() * 80)}%)`
  }),
)

function set(col: number, row: number, color: Color) {
  grid[col][row] = color
}

function get(col: number, row: number): Color {
  return grid[col][row]
}

function size() {
  return {
    cols: grid.length,
    rows: grid[0].length,
  }
}

export const debug = {
  grid,
}

export { set, get, size }
