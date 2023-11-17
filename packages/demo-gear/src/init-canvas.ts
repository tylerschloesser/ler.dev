import invariant from 'tiny-invariant'
import { Color } from './color.js'
import { renderConnection } from './render-connection.js'
import { renderGear } from './render-gear.js'
import { renderGrid } from './render-grid.js'
import { renderHover } from './render-hover.js'
import { InitFn } from './types.js'
import { iterateConnections } from './util.js'

export const initCanvas: InitFn = (state) => {
  const { canvas, signal } = state

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

    for (const gear of Object.values(state.world.gears)) {
      renderGear({ gear, context })
    }

    for (const { gear1, gear2, type } of iterateConnections(
      state.world.gears,
    )) {
      renderConnection({
        gear1,
        gear2,
        type,
        context,
        valid: true,
        debug: state.world.debugConnections,
      })
    }

    renderHover({ context, state })

    window.requestAnimationFrame(render)
  }
  window.requestAnimationFrame(render)
}
