import { TILE_SIZE } from './const.js'

export function renderGrid({
  context,
  canvas,
}: {
  context: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
}): void {
  let grid = {
    tl: {
      x:
        Math.floor(-canvas.width / 2 / TILE_SIZE) *
        TILE_SIZE,
      y:
        Math.floor(-canvas.height / 2 / TILE_SIZE) *
        TILE_SIZE,
    },
    br: {
      x:
        Math.ceil(canvas.width / 2 / TILE_SIZE) * TILE_SIZE,
      y:
        Math.ceil(canvas.height / 2 / TILE_SIZE) *
        TILE_SIZE,
    },
  }

  context.beginPath()
  context.lineWidth = 1
  context.strokeStyle = 'hsl(0, 0%, 10%)'
  for (let y = grid.tl.y; y < grid.br.y; y += TILE_SIZE) {
    context.moveTo(grid.tl.x, y)
    context.lineTo(grid.br.x, y)
  }
  for (let x = grid.tl.x; x < grid.br.x; x += TILE_SIZE) {
    context.moveTo(x, grid.tl.y)
    context.lineTo(x, grid.br.y)
  }
  context.stroke()
  context.closePath()
}
