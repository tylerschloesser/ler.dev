import { RenderFn } from '../common/engine'
import { NUM_COLS, NUM_ROWS, state } from './state'

export const render: RenderFn = ({ context, viewport }) => {
  const { board } = state

  context.clearRect(0, 0, viewport.w, viewport.h)

  context.translate(10, 10)
  context.strokeStyle = 'white'
  context.fillStyle = 'white'
  context.beginPath()

  const size = Math.min(viewport.w / NUM_COLS, viewport.h / NUM_ROWS)

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
