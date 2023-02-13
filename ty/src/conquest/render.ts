import { RenderFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { state } from './state'
import { Color } from './types'

function renderCircle(
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

export const render: RenderFn = ({ context, viewport }) => {
  context.clearRect(0, 0, viewport.w, viewport.h)

  state.world.flags.forEach((flag) => {
    const { p, r, color } = flag
    renderCircle(context, p, r, color)
  })

  if (state.pointer) {
    renderCircle(context, state.pointer, 20, 'white')
  }
}
