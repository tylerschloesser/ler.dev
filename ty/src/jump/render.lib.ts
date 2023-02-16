import { Circle, Line, Rectangle } from './render.types'

export function renderCircle(
  context: CanvasRenderingContext2D,
  { p, r, color, method }: Circle,
) {
  context.beginPath()
  if (method === 'fill') {
    context.fillStyle = color.toString()
    context.arc(Math.round(p.x), Math.round(p.y), Math.round(r), 0, Math.PI * 2)
    context.fill()
  } else {
    // stroke
    context.strokeStyle = color.toString()
    context.lineWidth = 1
    context.arc(Math.round(p.x), Math.round(p.y), Math.round(r), 0, Math.PI * 2)
    context.stroke()
  }
}

export function renderRectangle(
  context: CanvasRenderingContext2D,
  rectangle: Rectangle,
) {
  throw Error('todo')
}

export function renderLine(
  context: CanvasRenderingContext2D,
  { a, b, color }: Line,
) {
  context.beginPath()
  context.strokeStyle = color.toString()
  context.moveTo(Math.round(a.x), Math.round(a.y))
  context.lineTo(Math.round(b.x), Math.round(b.y))
  context.stroke()
  context.closePath()
}
