import Color from 'color'
import { Vec2 } from '../common/vec2'

export interface RenderCircleArgs {
  context: CanvasRenderingContext2D
  p: Vec2
  radius: number
  color: Color
  filled?: boolean
}

export function renderCircle({
  context,
  p,
  radius,
  color,
  filled = false,
}: RenderCircleArgs) {
  const { x, y } = p
  context.strokeStyle = color.toString()
  context.lineWidth = 2
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.stroke()
}

export function renderLine(
  context: CanvasRenderingContext2D,
  a: Vec2,
  b: Vec2,
  color: Color,
) {
  context.strokeStyle = color.toString()
  context.moveTo(a.x, a.y)
  context.lineTo(b.x, b.y)
  context.stroke()
}
