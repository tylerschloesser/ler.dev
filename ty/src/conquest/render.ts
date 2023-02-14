import { RenderFn } from '../common/engine'
import { update } from './physics'
import { renderCircle } from './render.util'
import { state } from './state'

const renderWorld: RenderFn = ({ context }) => {
  state.world.flags.forEach((flag) => {
    const { p, r, color } = flag
    renderCircle(context, p, r, color)
  })
}

const renderPointer: RenderFn = ({ context }) => {
  if (state.pointer) {
    renderCircle(context, state.pointer, 20, 'white')
  }
}

const renderDrag: RenderFn = ({ context }) => {
  if (state.drag?.a && state.drag.b) {
    context.beginPath()
    const { a, b } = state.drag
    context.moveTo(a.x, a.y)
    context.lineTo(b.x, b.y)
    context.stroke()
    context.closePath()
  }
}

export const render: RenderFn = (args) => {
  const { context, viewport, debug, timestamp, elapsed } = args
  context.clearRect(0, 0, viewport.w, viewport.h)
  update({ timestamp, elapsed })

  const { zoom } = state.camera
  debug('camera.zoom', zoom.toFixed(2))
  context.scale(zoom, zoom)

  renderWorld(args)

  {
    const { p, r, color } = state.ball
    debug('ball.p', p.toString())
    renderCircle(context, p, r, color)
  }

  context.resetTransform()

  renderPointer(args)
  renderDrag(args)
}
