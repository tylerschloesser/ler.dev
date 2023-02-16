import { Circle, Rectangle, RenderObject } from './render.types'

export function renderCircle(
  context: CanvasRenderingContext2D,
  { p, r, color, method }: Circle,
) {
  context.beginPath()
  if (method === 'fill') {
    context.fillStyle = color.toString()
    context.arc(p.x, p.y, r, 0, Math.PI * 2)
    context.fill()
  } else {
    // stroke
    context.strokeStyle = color.toString()
    context.lineWidth = 1
    context.arc(p.x, p.y, r, 0, Math.PI * 2)
    context.stroke()
  }
}

export function renderRectangle(
  context: CanvasRenderingContext2D,
  rectangle: Rectangle,
) {
  throw Error('todo')
}
