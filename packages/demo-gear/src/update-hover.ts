import invariant from 'tiny-invariant'
import {
  AddGearHover,
  ApplyForceHover,
  ConnectionType,
  Gear,
  Hover,
  InvalidReasonType,
  Pointer,
  World,
} from './types.js'
import {
  addTeethConnections,
  iterateOverlappingGears,
} from './util.js'
import { Vec2 } from './vec2.js'

type UpdateHoverFn<T extends Hover> = (args: {
  pointer: Pointer
  hover: T
  world: World
}) => void

export const updateAddGearHover: UpdateHoverFn<
  AddGearHover
> = ({ hover, pointer, world }) => {
  // remove any previous connections, except for chain
  hover.connections = hover.connections.filter(
    (connection) =>
      connection.type !== ConnectionType.enum.Chain,
  )

  invariant(hover.connections.length <= 2)

  let chain: Gear | undefined
  if (hover.connections.length) {
    const first = hover.connections.at(0)
    invariant(first)
    chain = world.gears[first.gearId]
    invariant(chain)

    // if there are 2 connections, the second is from the
    // previous hover position, so only keep the first
    hover.connections = [first]
  }

  invariant(hover.connections.length <= 1)

  hover.valid = true
  hover.reasons = []

  for (const gear of iterateOverlappingGears(
    pointer.position,
    hover.radius,
    world,
  )) {
    if (
      hover.radius === 1 &&
      Vec2.equal(gear.position, pointer.position)
    ) {
      invariant(hover.valid)
      if (gear.radius === 1) {
        hover.connections.push({
          type: ConnectionType.enum.Chain,
          gearId: gear.id,
        })
        if (chain) {
          const dx = pointer.position.x - chain.position.x
          const dy = pointer.position.y - chain.position.y
          hover.valid =
            (dx === 0 || dy === 0) &&
            dx !== dy &&
            dx + dy > hover.radius + gear.radius
        }
        break
      } else {
        // we know this gear does not already have an attachment
        // because we already would've iterated over it

        hover.connections.push({
          type: ConnectionType.enum.Attached,
          gearId: gear.id,
        })
        break
      }
    }

    hover.valid = false
    hover.reasons.push({
      type: InvalidReasonType.Overlaps,
      gearId: gear.id,
    })
  }

  if (hover.valid) {
    addTeethConnections({
      pointer,
      hover,
      world,
    })
  }
}

export const updateApplyForceHover: UpdateHoverFn<
  ApplyForceHover
> = ({ hover, pointer }) => {
  if (pointer.down) {
    // TODO
  }
}
