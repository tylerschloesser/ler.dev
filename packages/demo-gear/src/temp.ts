import invariant from 'tiny-invariant'
import { BuildHand, EntityType, Gear } from './types.js'

export function tempGetGear(hand: BuildHand): Gear {
  const values = Object.values(hand)
  invariant(values.length === 1)
  const gear = values.at(0)
  invariant(gear.type === EntityType.enum.Gear)
  return gear
}

export function tempSetGear(
  hand: BuildHand,
  gear: Gear,
): void {
  invariant(Object.values(hand.entities).length === 1)
  hand.entities = { [gear.id]: gear }
}
