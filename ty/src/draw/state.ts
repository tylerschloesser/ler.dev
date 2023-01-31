import { createNoise2D } from 'simplex-noise'

const noise2d = createNoise2D()

type Color = null | string

const config = {
  scale: {
    x: 0.01,
    y: 0.01,
  },
}

function generate(col: number, row: number): Color {
  const hue = (() => {
    return 0
  })()
  const lightness = (() => {
    const x = col * config.scale.x
    const y = row * config.scale.y
    const v = (noise2d(x, y) + 1) / 2
    return Math.floor(v * 20) * 4
  })()
  return `hsl(${hue}, 80%, ${lightness}%)`
}

const cache = new Map<string, Color>()

function get(col: number, row: number): Color {
  const key = `${col}.${row}`
  let value = cache.get(key)
  if (value) {
    return value
  }
  value = generate(col, row)
  cache.set(key, value)
  return value
}

export { get }
