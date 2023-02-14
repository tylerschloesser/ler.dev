import { RenderFn } from '../common/engine'
import { update } from './physics'
import { renderCircle } from './render.util'
import { state } from './state'

export const render: RenderFn = ({
  context,
  viewport,
  debug,
  timestamp,
  elapsed,
}) => {
  context.clearRect(0, 0, viewport.w, viewport.h)

  update({ timestamp, elapsed })

  const { zoom } = state.camera
  debug('camera.zoom', zoom.toFixed(2))
  context.scale(zoom, zoom)

  state.world.flags.forEach((flag) => {
    const { p, r, color } = flag
    renderCircle(context, p, r, color)
  })

  {
    const { p, r, color } = state.ball
    debug('ball.p', p.toString())
    renderCircle(context, p, r, color)
  }

  context.resetTransform()

  if (state.pointer) {
    renderCircle(context, state.pointer, 20, 'white')
  }

  if (state.drag?.a && state.drag.b) {
    context.beginPath()
    const { a, b } = state.drag
    context.moveTo(a.x, a.y)
    context.lineTo(b.x, b.y)
    context.stroke()
    context.closePath()
  }
}
