import { Color } from './color.js'
import { renderAccelerate } from './render-accelerate.js'
import { renderBuild } from './render-build.js'
import { renderConnection } from './render-connection.js'
import { renderGear } from './render-gear.js'
import { renderGrid } from './render-grid.js'
import { AppState } from './types.js'
import { iterateConnections } from './util.js'

export function render(
  state: AppState,
  context: CanvasRenderingContext2D,
): void {
  const { canvas, tileSize } = state

  context.resetTransform()

  context.clearRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = Color.Background
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.translate(canvas.width / 2, canvas.height / 2)
  context.translate(
    -state.camera.position.x * tileSize,
    -state.camera.position.y * tileSize,
  )

  renderGrid(context, state)

  for (const gear of Object.values(state.world.gears)) {
    renderGear(context, gear)
  }

  for (const { gear1, gear2, type } of iterateConnections(
    state.world.gears,
  )) {
    renderConnection(
      context,
      type,
      gear1,
      gear2,
      true,
      state.world.debugConnections,
    )
  }

  if (state.pointer.active) {
    renderBuild(state, context)
    renderAccelerate(state, context)
  }
}
