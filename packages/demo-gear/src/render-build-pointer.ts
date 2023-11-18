import invariant from 'tiny-invariant'
import { Color } from './color.js'
import { renderConnection } from './render-connection.js'
import { renderGear } from './render-gear.js'
import {
  AppState,
  BuildPointer,
  ConnectionType,
} from './types.js'

export function renderBuildPointer(
  state: AppState,
  pointer: BuildPointer,
  context: CanvasRenderingContext2D,
): void {
  if (!pointer.position) {
    return
  }
  renderGear({
    gear: {
      position: pointer.position,
      radius: pointer.radius,
      angle: 0,
    },
    tint: pointer.valid
      ? Color.AddGearValid
      : Color.AddGearInvalid,
    context,
  })

  const { world } = state
  for (const connection of pointer.connections) {
    const gear2 = world.gears[connection.gearId]
    invariant(gear2)

    renderConnection({
      context,
      gear1: {
        position: pointer.position,
        radius: pointer.radius,
        angle: gear2.angle,
      },
      gear2,
      type: connection.type,
      valid: pointer.valid,
      debug: world.debugConnections,
    })
  }

  if (pointer.chain && pointer.valid) {
    renderConnection({
      context,
      gear1: {
        position: pointer.position,
        radius: pointer.radius,
        angle: pointer.chain.angle,
      },
      gear2: pointer.chain,
      type: ConnectionType.enum.Chain,
      valid: true,
      debug: world.debugConnections,
    })
  }
}
