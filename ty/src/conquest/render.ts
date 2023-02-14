import Color from 'color'
import { RenderFn } from '../common/engine'
import { Vec2 } from '../common/vec2'
import { update } from './physics'
import { renderCircle, renderLine } from './render.util'
import { state } from './state'

const WHITE = new Color('white')

const renderWorld: RenderFn = ({ context, config }) => {
  for (let wx = -1; wx <= 1; wx++) {
    for (let wy = -1; wy <= 1; wy++) {
      const translate = new Vec2(
        wx * state.world.size.x,
        wy * state.world.size.y,
      ).sub(state.ball.p)

      // render flags
      state.world.flags.forEach((flag) => {
        const { p, r, color, progress } = flag
        if (progress > 0) {
          renderCircle({
            context,
            p: translate.add(p),
            radius: r,
            color: color.fade(1 - progress),
            filled: true,
          })
        }
        renderCircle({
          context,
          p: translate.add(p),
          radius: r,
          color: progress === 1 ? WHITE : color,
        })
      })

      // render border
      if (config.showDebug) {
        context.strokeStyle = WHITE.toString()
        const { x, y } = translate
        context.strokeRect(x, y, state.world.size.x, state.world.size.y)
      }

      // render ball
      {
        const { p, r, color } = state.ball
        renderCircle({
          context,
          p: translate.add(p),
          radius: r,
          color,
        })
      }

      if (state.closestFlagInfo) {
        const { index, modifier } = state.closestFlagInfo
        const flag = state.world.flags[index]
        renderLine(
          context,
          state.ball.p.add(translate),
          flag.p.add(modifier).add(translate),
          WHITE,
        )
      }
    }
  }
}

const renderPointer: RenderFn = ({ context }) => {
  if (state.pointer) {
    renderCircle({
      context,
      p: state.pointer,
      radius: 20,
      color: WHITE,
    })
  }
}

const renderDrag: RenderFn = ({ context }) => {
  if (state.drag?.a && state.drag.b) {
    const { a, b } = state.drag
    renderLine(context, a, b, WHITE)
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
