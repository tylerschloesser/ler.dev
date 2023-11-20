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
  const { canvas, camera, tileSize } = state

  context.resetTransform()

  const vx = canvas.width
  const vy = canvas.height

  context.clearRect(0, 0, vx, vy)
  context.fillStyle = Color.Background
  context.fillRect(0, 0, vx, vy)

  const tx = vx / 2 + -camera.position.x * tileSize
  const ty = vy / 2 + -camera.position.y * tileSize
  context.translate(tx, ty)

  renderGrid(context, state)

  for (const gear of Object.values(state.world.gears)) {
    renderGear(context, state, gear)
  }

  for (const { gear1, gear2, type } of iterateConnections(
    state.world.gears,
  )) {
    renderConnection(
      context,
      state,
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
