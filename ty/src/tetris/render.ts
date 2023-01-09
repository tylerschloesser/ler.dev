import { cloneDeep } from 'lodash'
import { RenderFn } from '../common/engine'
import { NUM_COLS, NUM_ROWS, state } from './state'

function update(timestamp: number) {
  if (state.piece.lastDrop === 0) {
    state.piece.lastDrop = timestamp
  }

  if (timestamp - state.piece.lastDrop > 1_000) {
    state.piece.lastDrop += 1_000
    state.piece.cells.forEach((cell) => {
      cell[0] = Math.min(cell[0] + 1, NUM_ROWS - 1)
    })
  }
}

export const render: RenderFn = ({ context, viewport, timestamp }) => {
  update(timestamp)
  const board = cloneDeep(state.board)

  state.piece.cells.forEach(([row, col]) => {
    board[row][col] = true
  })

  context.clearRect(0, 0, viewport.w, viewport.h)

  context.strokeStyle = 'white'
  context.fillStyle = 'white'
  context.beginPath()

  const padding = Math.min(viewport.w, viewport.h) * 0.05
  const size = Math.min(
    (viewport.w - padding * 2) / NUM_COLS,
    (viewport.h - padding * 2) / NUM_ROWS,
  )

  context.translate(padding, padding)

  context.translate(
    Math.max((viewport.w - size * NUM_COLS - padding * 2) / 2, 0),
    Math.max((viewport.h - size * NUM_ROWS - padding * 2) / 2, 0),
  )

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const value = board[row][col]
      const x = col * size
      const y = row * size
      const w = size
      const h = size
      if (value) {
        context.fillRect(x, y, w, h)
      } else {
        context.strokeRect(x, y, w, h)
      }
    }
  }
  context.closePath()
  context.resetTransform()
}
