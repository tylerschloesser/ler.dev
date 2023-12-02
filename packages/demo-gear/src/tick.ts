import {
  applyForce,
  applyFriction,
} from './apply-torque.js'
import { TWO_PI } from './const.js'
import {
  AppState,
  GearBehaviorType,
  HandType,
} from './types.js'

export function tick(state: AppState, elapsed: number) {
  const { world, hand } = state

  switch (hand?.type) {
    case HandType.ApplyForce: {
      if (hand.active && hand.gear) {
        const force =
          (hand.direction === 'ccw' ? -1 : 1) *
          hand.magnitude
        hand.runningEnergyDiff += applyForce(
          hand.gear,
          force,
          elapsed,
          world,
        )
      }
      break
    }
    case HandType.ApplyFriction: {
      if (hand.active && hand.gear) {
        hand.runningEnergyDiff += applyFriction(
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

  for (const gear of Object.values(world.gears)) {
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

  for (const gear of Object.values(world.gears)) {
    gear.angle =
      (gear.angle + gear.velocity * elapsed + TWO_PI) %
      TWO_PI
  }

  if (
    state.hand?.type === HandType.Build &&
    state.hand.gear
  ) {
    const { gear } = state.hand
    gear.angle =
      (gear.angle + gear.velocity * elapsed + TWO_PI) %
      TWO_PI
  }
}
