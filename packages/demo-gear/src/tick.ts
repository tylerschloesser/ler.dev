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
        applyForce(
          gear,
          (behavior.direction === 'ccw' ? -1 : 1) *
            behavior.magnitude,
          elapsed,
          world,
        )
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
