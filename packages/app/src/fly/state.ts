import { createNoise3D } from 'simplex-noise'
import { Milliseconds } from '../common/engine/index.js'

const noise3d = createNoise3D()

type Color = null | string

const config = {
  scale: {
    x: 0.01,
    y: 0.01,
    z: 0.00005,
  },
}

function get(
  col: number,
  row: number,
  timestamp: Milliseconds,
): Color {
  const hue = (() => {
    return ((timestamp / 1000) * 360 * (1 / 20)) % 360
  })()
  const lightness = (() => {
    const x = col * config.scale.x
    const y = row * config.scale.y
    const z = timestamp * config.scale.z
    const v = (noise3d(x, y, z) + 1) / 2
    return Math.floor(v * 20) * 3
  })()
  return `hsl(${hue}, 60%, ${lightness}%)`
}

export { get }
