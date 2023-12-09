import invariant from 'tiny-invariant'
import { TWO_PI } from './const.js'
import { tempGetGear } from './temp.js'
import {
  BuildHand,
  Connection,
  ConnectionType,
  EntityType,
  Gear,
  IAppContext,
} from './types.js'

export function tickBuild(
  context: IAppContext,
  hand: BuildHand,
): void {
  const gear = tempGetGear(hand)
  tickBuildGear(context, gear, hand.valid)
}

// prioritize setting angle based on the chain
// because chain gears require identical angles
function getPrioritizedFirstConnection(
  gear: Gear,
): Connection | null {
  let other: Connection | null = null
  for (const connection of gear.connections) {
    if (connection.type === ConnectionType.enum.Chain) {
      return connection
    } else if (other !== null) {
      other = connection
    }
  }
  return other
}

export function tickBuildGear(
  context: IAppContext,
  gear: Gear,
  valid: boolean,
): void {
  let connection = getPrioritizedFirstConnection(gear)
  if (valid && connection) {
    invariant(
      connection.type !== ConnectionType.enum.Belt,
      'TODO support belt connections',
    )

    // if valid, we can check any connected gear to get the angle
    const neighbor =
      context.world.entities[connection.entityId]
    invariant(neighbor?.type === EntityType.enum.Gear)

    switch (connection.type) {
      case ConnectionType.enum.Attach:
      case ConnectionType.enum.Chain:
        gear.angle = neighbor.angle
        break
      case ConnectionType.enum.Adjacent:
        gear.angle =
          (TWO_PI - neighbor.angle) *
          (neighbor.radius / gear.radius)
        break
    }
  } else {
    gear.angle = 0
  }
}
