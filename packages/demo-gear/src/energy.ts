import { GearEntity } from './types.js'

export function getEnergy(gear: GearEntity): number {
  return (
    (1 / 4) *
    gear.radius ** 2 *
    gear.velocity ** 2 *
    gear.mass
  )
}
