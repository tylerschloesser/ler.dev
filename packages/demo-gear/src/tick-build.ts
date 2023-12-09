import invariant from 'tiny-invariant'
import { TWO_PI } from './const.js'
import { tempGetGear } from './temp.js'
import {
  BuildHand,
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
  tickBuildGear(context, gear, hand.valid, hand.chain)
}

export function tickBuildGear(
  context: IAppContext,
  gear: Gear,
  valid: boolean,
  chainFrom: Gear | null,
): void {
  let connection = gear.connections.at(0)

  if (valid && chainFrom) {
    // prioritize setting angle based on the chain
    // because chain gears require identical angles
    connection = gear.connections.find(
      (c) =>
        c.type !== ConnectionType.enum.Belt &&
        c.entityId === chainFrom?.id,
    )
    invariant(connection)
  }

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
