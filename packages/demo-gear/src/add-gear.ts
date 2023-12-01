import invariant from 'tiny-invariant'
import {
  AppState,
  ConnectionType,
  Gear,
  PartialGear,
  World,
} from './types.js'
import { getTotalMass, iterateGearTileIds } from './util.js'

export function addChainConnection(
  gear1: Gear,
  gear2: Gear,
  _state: AppState,
): void {
  // TODO validate
  gear1.connections.push({
    type: ConnectionType.enum.Chain,
    gearId: gear2.id,
  })
  gear2.connections.push({
    type: ConnectionType.enum.Chain,
    gearId: gear1.id,
  })
}

export function addGear(
  partial: PartialGear,
  _chain: Gear | null, // TODO remove this
  attach: Gear | null,
  state: AppState,
): void {
  const { world } = state

  const { position, radius, connections, angle } = partial

  const gearId = `${position.x}.${position.y}.${radius}`
  invariant(world.gears[gearId] === undefined)

  for (const connection of connections) {
    // add the a connection in the other direction
    const node = world.gears[connection.gearId]
    invariant(node)
    node.connections.push({
      type: connection.type,
      gearId,
    })
  }

  const mass = Math.PI * radius ** 2

  const gear: Gear = {
    id: gearId,
    position: {
      x: position.x,
      y: position.y,
    },
    radius,
    mass,
    angle,
    velocity: 0,
    connections,
  }

  world.gears[gear.id] = gear

  for (const tileId of iterateGearTileIds(
    position,
    radius,
  )) {
    let tile = world.tiles[tileId]

    if (attach) {
      invariant(tile?.gearId)
      invariant(tile?.attachedGearId === undefined)
      tile.attachedGearId = gearId
    } else {
      invariant(tile === undefined)
      tile = world.tiles[tileId] = { gearId }
    }
  }

  const totalMass = getTotalMass(gear, world)
  for (const c of gear.connections) {
    const neighbor = world.gears[c.gearId]
    invariant(neighbor)
    conserveAngularMomentum(
      neighbor,
      world,
      totalMass - mass,
      totalMass,
    )
    break
  }
}

function conserveAngularMomentum(
  root: Gear,
  world: World,
  totalMassBefore: number,
  totalMassAfter: number,
): void {
  invariant(totalMassAfter > totalMassBefore)

  root.velocity =
    root.velocity * (totalMassBefore / totalMassAfter)

  const seen = new Set<Gear>()
  const stack = new Array<{
    gear: Gear
    multiplier: number
  }>({
    gear: root,
    multiplier: 1,
  })

  while (stack.length) {
    const tail = stack.pop()
    invariant(tail)

    if (seen.has(tail.gear)) {
      continue
    }
    seen.add(tail.gear)

    for (const c of tail.gear.connections) {
      const neighbor = world.gears[c.gearId]
      invariant(neighbor)

      let neighborMultiplier: number
      switch (c.type) {
        case ConnectionType.enum.Adjacent:
          neighborMultiplier =
            (tail.gear.radius / neighbor.radius) * -1
          break
        case ConnectionType.enum.Chain:
          neighborMultiplier = 1
          break
        case ConnectionType.enum.Attach:
          neighborMultiplier = 1
          break
      }

      const multiplier =
        tail.multiplier * neighborMultiplier
      neighbor.velocity = root.velocity * multiplier
      stack.push({ gear: neighbor, multiplier })
    }
  }
}
