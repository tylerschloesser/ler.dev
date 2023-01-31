import { times } from 'lodash'
import React from 'react'
import { Engine, InitFn, RenderFn } from '../common/engine'

const init: InitFn = () => {}

const NUM_ROWS = 100
const NUM_COLS = 100

const grid = times(NUM_ROWS, () =>
  times(NUM_COLS, () => {
    const hue = 0
    const saturation = 80
    const lightness = Math.random() * 80
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }),
)

const render: RenderFn = ({ context, viewport }) => {
  context.clearRect(0, 0, viewport.w, viewport.h)

  const cellSize = 5

  for (let row = 0; row < NUM_ROWS; row++) {
    for (let col = 0; col < NUM_COLS; col++) {
      context.fillStyle = grid[row][col]
      const x = col * cellSize
      const y = row * cellSize
      const w = cellSize
      const h = cellSize
      context.fillRect(x, y, w, h)
    }
  }
}

export function Draw() {
  return <Engine init={init} render={render} />
}
