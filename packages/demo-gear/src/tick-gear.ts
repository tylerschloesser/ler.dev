import {
  applyForce,
  applyFriction,
} from './apply-torque.js'
import {
  GearBehaviorType,
  GearEntity,
  World,
} from './types.js'

export function tickGear(
  world: World,
  gear: GearEntity,
  elapsed: number,
): void {
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
        applyFriction(world, gear, 0.1, 1, elapsed)
      } else {
        applyForce(
          world,
          gear,
          sign * behavior.magnitude,
          elapsed,
        )
      }

      break
    }
    case GearBehaviorType.enum.Friction: {
      const { behavior } = gear
      applyFriction(
        world,
        gear,
        behavior.coeffecient,
        behavior.magnitude,
        elapsed,
      )
      break
    }
  }
}
