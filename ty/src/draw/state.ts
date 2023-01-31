import { times } from 'lodash'
import { createNoise3D } from 'simplex-noise'

const noise = createNoise3D()

type Color = null | string
type Grid = Color[][]

const GRID_COLS = 100
const GRID_ROWS = 100

function generate(): Grid {
  return times(GRID_COLS, (col) => {
    return times(GRID_ROWS, (row) => {
      const zScale = 0.0001
      const z = window.performance.now() * zScale

      const xyScale = 0.001
      const x = col * xyScale,
        y = row * xyScale
      const v = (noise(x, y, z) + 1) / 2
      return `hsl(0, 80%, ${Math.floor(v * 80)}%)`
    })
  })
}

let grid = generate()

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
  reset() {
    grid = generate()
  },
}

export { set, get, size }
