import { RenderFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { update } from './physics'
import { renderCircle } from './render.util'
import { state } from './state'
import { Flag } from './types'

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
        let closest: { flag: Flag; dist: number; modifier: Vec2 } | null = null

        for (const modifier of [
          new Vec2(0, 0),
          new Vec2(state.world.size.x, 0),
          new Vec2(-state.world.size.x, 0),
          new Vec2(0, state.world.size.y),
          new Vec2(0, -state.world.size.y),
          new Vec2(state.world.size.x, state.world.size.y),
          new Vec2(-state.world.size.x, -state.world.size.y),
        ]) {
          for (let i = 0; i < state.world.flags.length; i++) {
            const flag = state.world.flags[i]
            const dist = state.ball.p.sub(modifier.add(flag.p)).length()
            if (dist < (closest?.dist ?? Number.POSITIVE_INFINITY)) {
              closest = { flag, dist, modifier }
            }
          }
        }

        if (closest) {
          context.strokeStyle = 'white'
          context.moveTo(
            state.ball.p.x + translate.x,
            state.ball.p.y + translate.y,
          )
          context.lineTo(
            closest.flag.p.x + translate.x + closest.modifier.x,
            closest.flag.p.y + translate.y + closest.modifier.y,
          )
          context.stroke()
        }
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
