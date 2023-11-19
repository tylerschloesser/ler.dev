import { Color } from './color.js'
import { TILE_SIZE } from './const.js'

export function renderGrid({
  context,
  canvas,
}: {
  context: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
}): void {
  const tlx =
    Math.floor(-canvas.width / 2 / TILE_SIZE) * TILE_SIZE
  const tly =
    Math.floor(-canvas.height / 2 / TILE_SIZE) * TILE_SIZE
  const brx =
    Math.ceil(canvas.width / 2 / TILE_SIZE) * TILE_SIZE
  const bry =
    Math.ceil(canvas.height / 2 / TILE_SIZE) * TILE_SIZE

  context.beginPath()
  context.lineWidth = 1
  context.strokeStyle = Color.GridOdd
  for (
    let y = tly - TILE_SIZE;
    y < bry;
    y += TILE_SIZE * 2
  ) {
    context.moveTo(tlx, y)
    context.lineTo(brx, y)
  }
  for (
    let x = tlx - TILE_SIZE;
    x < brx;
    x += TILE_SIZE * 2
  ) {
    context.moveTo(x, tly)
    context.lineTo(x, bry)
  }
  context.stroke()
  context.closePath()

  context.beginPath()
  context.lineWidth = 1
  context.strokeStyle = Color.GridEven
  for (let y = tly; y < bry; y += TILE_SIZE * 2) {
    context.moveTo(tlx, y)
    context.lineTo(brx, y)
  }
  for (let x = tlx; x < brx; x += TILE_SIZE * 2) {
    context.moveTo(x, tly)
    context.lineTo(x, bry)
  }
  context.stroke()
  context.closePath()
}
