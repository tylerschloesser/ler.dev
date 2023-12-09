import invariant from 'tiny-invariant'
import { buildGear } from './build-gear.js'
import {
  BuildHand,
  EntityType,
  IAppContext,
} from './types.js'
import { incrementBuildVersion } from './util.js'

export function build(
  context: IAppContext,
  hand: BuildHand,
): void {
  invariant(hand.valid)
  for (const entity of Object.values(hand.entities)) {
    switch (entity.type) {
      case EntityType.enum.Gear: {
        buildGear(context, entity)
        break
      }
      default: {
        invariant(false, 'TODO')
      }
    }
  }

  incrementBuildVersion(context)
}
