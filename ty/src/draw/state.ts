import { create, times } from 'lodash'
import { createNoise3D, createNoise2D } from 'simplex-noise'

const noise3d = createNoise3D()
const noise2d = createNoise2D()

type Color = null | string
type Grid = Color[][]

const GRID_COLS = 100
const GRID_ROWS = 100

function generate(): Grid {
  return times(GRID_COLS, (col) => {
    return times(GRID_ROWS, (row) => {
      const hue = (() => {
        // const xyScale = 0.00005
        // const xy = window.performance.now() * xyScale
        // const v = (noise2d(xy, xy) + 1) / 2
        // return Math.floor(v * 360)
        return 0
      })()
      const lightness = (() => {
        const zScale = 0.0001
        const z = window.performance.now() * zScale

        const xyScale = 0.001
        const x = col * xyScale,
          y = row * xyScale
        const v = (noise3d(x, y, z) + 1) / 2
        return Math.floor(v * 20) * 4
      })()
      return `hsl(${hue}, 80%, ${lightness}%)`
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
