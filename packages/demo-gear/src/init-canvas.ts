import invariant from 'tiny-invariant'
import { Color } from './color.js'
import { HALF_PI, PI, TWO_PI } from './const.js'
import { renderConnection } from './render-connection.js'
import { renderGear } from './render-gear.js'
import { renderGrid } from './render-grid.js'
import { renderPointer } from './render-pointer.js'
import { InitCanvasFn } from './types.js'
import { iterateConnections } from './util.js'
import { Vec2 } from './vec2.js'

export const initCanvas: InitCanvasFn = ({
  canvas,
  pointer,
  signal,
  world,
}) => {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  const context = canvas.getContext('2d')
  invariant(context)

  function render() {
    if (signal.aborted) {
      return
    }

    invariant(context)

    context.resetTransform()

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = Color.Background
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.translate(canvas.width / 2, canvas.height / 2)

    renderGrid({ canvas, context })

    for (const gear of Object.values(world.gears)) {
      renderGear({ gear, context })
    }

    for (const { gear1, gear2, type } of iterateConnections(
      world.gears,
    )) {
      renderConnection({
        gear1,
        gear2,
        type,
        context,
        valid: true,
        debug: world.debugConnections,
      })
    }

    renderPointer({
      pointer: pointer.current,
      context,
      world,
    })

    window.requestAnimationFrame(render)
  }
  window.requestAnimationFrame(render)
}
