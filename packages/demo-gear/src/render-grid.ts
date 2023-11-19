import { Color } from './color.js'
import { TILE_SIZE } from './const.js'
import { AppState } from './types.js'

export function renderGrid(
  context: CanvasRenderingContext2D,
  state: AppState,
): void {
  const { canvas, camera } = state

  const vx = canvas.width / TILE_SIZE
  const vy = canvas.height / TILE_SIZE

  const tlx = Math.floor(
    Math.floor((camera.position.x - vx / 2) / 2) * 2,
  )
  const tly = Math.floor(
    Math.floor((camera.position.y - vy / 2) / 2) * 2,
  )
  const brx = Math.ceil(
    Math.ceil((camera.position.x + vx / 2) / 2) * 2,
  )
  const bry = Math.ceil(
    Math.ceil((camera.position.y + vy / 2) / 2) * 2,
  )

  context.beginPath()
  context.lineWidth = 1
  context.strokeStyle = Color.GridOdd
  for (let y = tly + 1; y < bry; y += 2) {
    context.moveTo(tlx * TILE_SIZE, y * TILE_SIZE)
    context.lineTo(brx * TILE_SIZE, y * TILE_SIZE)
  }
  for (let x = tlx + 1; x < brx; x += 2) {
    context.moveTo(x * TILE_SIZE, tly * TILE_SIZE)
    context.lineTo(x * TILE_SIZE, bry * TILE_SIZE)
  }
  context.stroke()
  context.closePath()

  context.beginPath()
  context.lineWidth = 1
  context.strokeStyle = Color.GridEven
  for (let y = tly; y <= bry; y += 2) {
    context.moveTo(tlx * TILE_SIZE, y * TILE_SIZE)
    context.lineTo(brx * TILE_SIZE, y * TILE_SIZE)
  }
  for (let x = tlx; x <= brx; x += 2) {
    context.moveTo(x * TILE_SIZE, tly * TILE_SIZE)
    context.lineTo(x * TILE_SIZE, bry * TILE_SIZE)
  }
  context.stroke()
  context.closePath()
}
