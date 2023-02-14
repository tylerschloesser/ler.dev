import { Vec2 } from '../common/vec2'
import { Color } from './types'

export function renderCircle(
  context: CanvasRenderingContext2D,
  p: Vec2,
  radius: number,
  color: Color,
) {
  const { x, y } = p
  context.strokeStyle = color
  context.lineWidth = 2
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.stroke()
}
