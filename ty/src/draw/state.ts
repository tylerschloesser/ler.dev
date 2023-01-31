import { times } from 'lodash'
import { createNoise3D } from 'simplex-noise'

const noise3d = createNoise3D()

type Color = null | string
type Grid = Color[][]

const GRID_COLS = 20
const GRID_ROWS = 20

const config = {
  scale: {
    x: 0.01,
    y: 0.01,
    z: 0.0001,
  },
}

function generate(): Grid {
  return times(GRID_COLS, (col) => {
    return times(GRID_ROWS, (row) => {
      const hue = (() => {
        return 0
      })()
      const lightness = (() => {
        const z = window.performance.now() * config.scale.z
        const x = col * config.scale.x
        const y = row * config.scale.y
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
