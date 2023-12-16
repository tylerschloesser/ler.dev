import {
  applyForce,
  applyFriction,
} from './apply-torque.js'
import { TWO_PI } from './const.js'
import { tickBeltItems } from './tick-belt-items.js'
import { tickBuild } from './tick-build.js'
import { tickGear } from './tick-gear.js'
import {
  EntityType,
  HandType,
  IAppContext,
} from './types.js'
import { mod } from './util.js'

export function tick(
  context: IAppContext,
  elapsed: number,
) {
  const { world, hand } = context

  switch (hand?.type) {
    case HandType.ApplyForce: {
      if (hand.active && hand.gear) {
        const force =
          (hand.direction === 'ccw' ? -1 : 1) *
          hand.magnitude
        applyForce(hand.gear, force, elapsed, world)
      }
      break
    }
    case HandType.ApplyFriction: {
      if (hand.active && hand.gear) {
        applyFriction(
          hand.gear,
          hand.coeffecient,
          100, // TODO
          elapsed,
          world,
        )
      }
      break
    }
  }

  for (const entity of Object.values(world.entities)) {
    switch (entity.type) {
      case EntityType.enum.Gear: {
        tickGear(world, entity, elapsed)
        break
      }
    }
  }

  tickBeltItems(world, elapsed)

  const entities = [...Object.values(world.entities)]
  if (context.hand?.type === HandType.Build) {
    tickBuild(context, context.hand, elapsed)
    if (context.hand.valid) {
      // tick these as well, if valid
      entities.push(...Object.values(context.hand.entities))
    }
  }

  for (const entity of entities) {
    switch (entity.type) {
      case EntityType.enum.Gear: {
        entity.angle = mod(
          entity.angle +
            (entity.velocity / entity.radius) * elapsed,
          TWO_PI,
        )
        break
      }
      case EntityType.enum.Belt: {
        entity.offset = mod(
          entity.offset + entity.velocity * elapsed,
          1,
        )
        break
      }
    }
  }
}
