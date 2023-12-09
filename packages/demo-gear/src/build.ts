import invariant from 'tiny-invariant'
import { addChainConnection, addGear } from './add-gear.js'
import { tempGetGear } from './temp.js'
import {
  BuildHand,
  Entity,
  EntityType,
  IAppContext,
} from './types.js'

export function executeBuild(
  context: IAppContext,
  hand: BuildHand,
): void {
  if (!hand.valid) {
    return
  }

  const handGear = tempGetGear(hand)

  const { center: position } = handGear
  const tileId = `${position.x}.${position.y}`
  const tile = context.world.tiles[tileId]

  let gear: Entity | undefined
  if (tile?.entityId) {
    gear = context.world.entities[tile.entityId]
  }
  invariant(!gear || gear?.type === EntityType.enum.Gear)

  if (gear?.radius === 1) {
    if (hand.chain) {
      invariant(gear !== hand.chain)

      if (gear.velocity === 0) {
        gear.angle = hand.chain.angle
      } else if (hand.chain.velocity === 0) {
        hand.chain.angle = gear.angle
      } else {
        // Doesn't work at the moment because need to propogate
        // chain angle
        invariant(
          false,
          'TODO allow two spinning gears to be connected by chain',
        )
      }

      addChainConnection(gear, hand.chain, context)

      hand.chain = null
    } else {
      hand.chain = gear
    }
  } else {
    addGear(handGear, gear ?? null, context)
    hand.chain = null
  }
}
