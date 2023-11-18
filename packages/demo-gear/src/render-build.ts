import invariant from 'tiny-invariant'
import { Color } from './color.js'
import { renderConnection } from './render-connection.js'
import { renderGear } from './render-gear.js'
import { AppState, ConnectionType } from './types.js'

export function renderBuild(
  state: AppState,
  context: CanvasRenderingContext2D,
): void {
  const { build } = state
  if (!build?.position) {
    return
  }
  renderGear({
    gear: {
      position: build.position,
      radius: build.radius,
      angle: 0,
    },
    tint: build.valid
      ? Color.AddGearValid
      : Color.AddGearInvalid,
    context,
  })

  const { world } = state
  for (const connection of build.connections) {
    const gear2 = world.gears[connection.gearId]
    invariant(gear2)

    renderConnection({
      context,
      gear1: {
        position: build.position,
        radius: build.radius,
        angle: gear2.angle,
      },
      gear2,
      type: connection.type,
      valid: build.valid,
      debug: world.debugConnections,
    })
  }

  if (build.chain && build.valid) {
    renderConnection({
      context,
      gear1: {
        position: build.position,
        radius: build.radius,
        angle: build.chain.angle,
      },
      gear2: build.chain,
      type: ConnectionType.enum.Chain,
      valid: true,
      debug: world.debugConnections,
    })
  }
}
