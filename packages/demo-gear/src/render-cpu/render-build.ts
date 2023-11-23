import invariant from 'tiny-invariant'
import {
  AppState,
  BuildHand,
  ConnectionType,
  PartialGear,
} from '../types.js'
import { renderConnection } from './render-connection.js'

const partial: PartialGear = {
  angle: 0,
  position: {
    x: 0,
    y: 0,
  },
  radius: 0,
}

export function renderBuild(
  context: CanvasRenderingContext2D,
  state: AppState,
  build: BuildHand,
): void {
  if (!build?.position) {
    return
  }

  partial.position.x = build.position.x
  partial.position.y = build.position.y
  partial.radius = build.radius

  // renderGear(
  //   context,
  //   state,
  //   partial,
  //   build.valid ? Color.AddGearValid : Color.AddGearInvalid,
  // )

  const { world } = state
  for (const connection of build.connections) {
    const gear2 = world.gears[connection.gearId]
    invariant(gear2)

    partial.angle = gear2.angle

    renderConnection(
      context,
      state,
      connection.type,
      partial,
      gear2,
      build.valid,
      world.debugConnections,
    )
  }

  // if (build.chain && build.valid) {
  //   partial.angle = build.chain.angle
  //   renderConnection(
  //     context,
  //     state,
  //     ConnectionType.enum.Chain,
  //     partial,
  //     build.chain,
  //     true,
  //     world.debugConnections,
  //   )
  // }
}
