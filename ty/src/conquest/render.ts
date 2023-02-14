import { RenderFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { update } from './physics'
import { renderCircle } from './render.util'
import { state } from './state'

const renderWorld: RenderFn = ({ context, config }) => {
  for (let wx = -1; wx <= 1; wx++) {
    for (let wy = -1; wy <= 1; wy++) {
      const translate = new Vec2(
        wx * state.world.size.x,
        wy * state.world.size.y,
      ).sub(state.ball.p)

      // render flags
      state.world.flags.forEach((flag) => {
        const { p, r, color } = flag
        renderCircle(context, translate.add(p), r, color)
      })

      // render border
      if (config.showDebug) {
        context.strokeStyle = 'white'
        const { x, y } = translate
        context.strokeRect(x, y, state.world.size.x, state.world.size.y)
      }

      // render ball
      {
        const { p, r, color } = state.ball
        renderCircle(context, translate.add(p), r, color)
      }

      {
        let closestFlag = state.world.flags[0]
        let closestDist = state.ball.p.sub(closestFlag.p).length()
        for (let i = 1; i < state.world.flags.length; i++) {
          const dist = state.ball.p.sub(state.world.flags[i].p).length()
          if (dist < closestDist) {
            closestDist = dist
            closestFlag = state.world.flags[i]
          }
        }
        context.strokeStyle = 'white'
        context.moveTo(
          state.ball.p.x + translate.x,
          state.ball.p.y + translate.y,
        )
        context.lineTo(
          closestFlag.p.x + translate.x,
          closestFlag.p.y + translate.y,
        )
        context.stroke()
      }
    }
  }
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
  const { context, viewport, timestamp, elapsed, debug } = args
  context.clearRect(0, 0, viewport.w, viewport.h)
  update({ timestamp, elapsed })

  const { zoom } = state.camera
  debug('zoom', zoom.toFixed(2))
  context.translate(viewport.w / 2, viewport.h / 2)
  context.scale(zoom, zoom)
  renderWorld(args)

  context.resetTransform()

  renderPointer(args)
  renderDrag(args)
}
