import { Color } from './color.js'
import { AppState } from './types.js'

export function renderGrid(
  context: CanvasRenderingContext2D,
  state: AppState,
): void {
  const { canvas, camera, tileSize } = state

  const vx = canvas.width / tileSize
  const vy = canvas.height / tileSize

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

  if (state.camera.zoom > 0.5) {
    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = Color.GridOdd
    for (let y = tly + 1; y < bry; y += 2) {
      context.moveTo(tlx * tileSize, y * tileSize)
      context.lineTo(brx * tileSize, y * tileSize)
    }
    for (let x = tlx + 1; x < brx; x += 2) {
      context.moveTo(x * tileSize, tly * tileSize)
      context.lineTo(x * tileSize, bry * tileSize)
    }
    context.stroke()
    context.closePath()
  }

  if (state.camera.zoom > 0.25) {
    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = Color.GridEven
    for (let y = tly; y <= bry; y += 2) {
      context.moveTo(tlx * tileSize, y * tileSize)
      context.lineTo(brx * tileSize, y * tileSize)
    }
    for (let x = tlx; x <= brx; x += 2) {
      context.moveTo(x * tileSize, tly * tileSize)
      context.lineTo(x * tileSize, bry * tileSize)
    }
    context.stroke()
    context.closePath()
  }
}
