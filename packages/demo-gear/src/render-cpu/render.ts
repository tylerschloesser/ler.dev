import { AppState, HandType } from '../types.js'
import { iterateConnections } from '../util.js'
import { renderAccelerate } from './render-accelerate.js'
import { renderBuild } from './render-build.js'
import { renderConnection } from './render-connection.js'
import { renderGear } from './render-gear.js'
import { renderGrid } from './render-grid.js'

export function render(
  state: AppState,
  context: CanvasRenderingContext2D,
): void {
  const { canvas, camera, tileSize, hand } = state

  context.resetTransform()

  const vx = state.viewport.size.x
  const vy = state.viewport.size.y

  context.clearRect(0, 0, vx, vy)

  const tx = vx / 2 + -camera.position.x * tileSize
  const ty = vy / 2 + -camera.position.y * tileSize
  context.translate(tx, ty)

  renderGrid(context, state)

  // for (const gear of Object.values(state.world.gears)) {
  //   renderGear(context, state, gear)
  // }

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

  switch (hand?.type) {
    case HandType.Build: {
      renderBuild(context, state, hand)
      break
    }
    case HandType.Accelerate: {
      renderAccelerate(context, state, hand)
      break
    }
  }
}
