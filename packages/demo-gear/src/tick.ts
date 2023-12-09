import {
  applyForce,
  applyFriction,
} from './apply-torque.js'
import { TWO_PI } from './const.js'
import { tickBuild } from './tick-build.js'
import {
  EntityType,
  GearBehaviorType,
  GearEntity,
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

  for (const gear of Object.values(world.entities).filter(
    (entity): entity is GearEntity =>
      entity.type === EntityType.enum.Gear,
  )) {
    switch (gear.behavior?.type) {
      case GearBehaviorType.enum.Force: {
        const { behavior } = gear

        const sign = behavior.direction === 'ccw' ? -1 : 1
        const governer = behavior.governer * sign
        let stop: boolean
        if (sign === 1) {
          stop = gear.velocity > governer
        } else {
          stop = gear.velocity < governer
        }

        const diff = Math.abs(
          Math.abs(gear.velocity) - Math.abs(governer),
        )

        // TODO better define this magic number
        if (diff < 0.01) {
          break
        }

        if (stop) {
          // TODO chosen arbitrarily
          applyFriction(gear, 0.1, 1, elapsed, world)
        } else {
          applyForce(
            gear,
            sign * behavior.magnitude,
            elapsed,
            world,
          )
        }

        break
      }
      case GearBehaviorType.enum.Friction: {
        const { behavior } = gear
        applyFriction(
          gear,
          behavior.coeffecient,
          behavior.magnitude,
          elapsed,
          world,
        )
        break
      }
    }
  }

  for (const entity of Object.values(world.entities)) {
    switch (entity.type) {
      case EntityType.enum.Gear: {
        entity.angle = mod(
          entity.angle + entity.velocity * elapsed,
          TWO_PI,
        )
        break
      }
      case EntityType.enum.Belt:
      case EntityType.enum.BeltIntersection: {
        entity.offset = mod(
          entity.offset + entity.velocity * elapsed,
          1,
        )
        break
      }
    }
  }

  if (context.hand?.type === HandType.Build) {
    tickBuild(context, context.hand)
  }
}
