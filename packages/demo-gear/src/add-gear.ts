import invariant from 'tiny-invariant'
import {
  IAppContext,
  ConnectionType,
  GearEntity,
  World,
  EntityType,
  EntityId,
  Entity,
} from './types.js'
import {
  getTotalMass,
  incrementBuildVersion,
  iterateGearTileIds,
} from './util.js'

export function addChainConnection(
  gear1: GearEntity,
  gear2: GearEntity,
  context: IAppContext,
): void {
  // TODO validate
  gear1.connections.push({
    type: ConnectionType.enum.Chain,
    entityId: gear2.id,
    multiplier: 1,
  })
  gear2.connections.push({
    type: ConnectionType.enum.Chain,
    entityId: gear1.id,
    multiplier: 1,
  })

  // TODO consolidate with add gear
  const totalMass = getTotalMass(gear1, context.world)
  for (const c of gear1.connections) {
    invariant(
      c.type !== ConnectionType.enum.Belt,
      'TODO support belt connections',
    )
    const neighbor = context.world.entities[c.entityId]
    invariant(neighbor?.type === EntityType.enum.Gear)
    conserveAngularMomentum(
      neighbor,
      context.world,
      totalMass - gear1.mass,
      totalMass,
    )
    break
  }

  incrementBuildVersion(context)
}

function getEntity(
  context: IAppContext,
  id: EntityId,
): Entity {
  const entity = context.world.entities[id]
  invariant(entity)
  return entity
}

export function addGear(
  gear: GearEntity,
  context: IAppContext,
): void {
  const { world } = context

  let attach: GearEntity | null = null
  for (const connection of gear.connections) {
    if (connection.type === ConnectionType.enum.Attach) {
      const entity = getEntity(context, connection.entityId)
      invariant(entity.type === EntityType.enum.Gear)
      invariant(attach === null)
      attach = entity
    }
  }

  invariant(world.entities[gear.id] === undefined)

  for (const connection of gear.connections) {
    invariant(
      connection.type !== ConnectionType.enum.Belt,
      'TODO support belt connections',
    )
    // add the a connection in the other direction
    const node = world.entities[connection.entityId]
    invariant(node)

    node.connections.push({
      type: connection.type,
      entityId: gear.id,
      multiplier: 1 / connection.multiplier,
    })
  }

  world.entities[gear.id] = gear

  for (const tileId of iterateGearTileIds(
    gear.center,
    gear.radius,
  )) {
    let tile = world.tiles[tileId]

    if (attach) {
      invariant(tile?.entityId === attach.id)
      tile.entityId = gear.id
    } else {
      invariant(tile === undefined)
      tile = world.tiles[tileId] = { entityId: gear.id }
    }
  }

  const totalMass = getTotalMass(gear, world)
  for (const c of gear.connections) {
    invariant(
      c.type !== ConnectionType.enum.Belt,
      'TODO support belt connections',
    )
    const neighbor = world.entities[c.entityId]
    invariant(neighbor?.type === EntityType.enum.Gear)
    conserveAngularMomentum(
      neighbor,
      world,
      totalMass - gear.mass,
      totalMass,
    )
    break
  }

  incrementBuildVersion(context)
}

function conserveAngularMomentum(
  root: GearEntity,
  world: World,
  totalMassBefore: number,
  totalMassAfter: number,
): void {
  invariant(totalMassAfter > totalMassBefore)

  root.velocity =
    root.velocity * (totalMassBefore / totalMassAfter)

  const seen = new Set<GearEntity>()
  const stack = new Array<{
    gear: GearEntity
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
      invariant(
        c.type !== ConnectionType.enum.Belt,
        'TODO support belt connections',
      )
      const neighbor = world.entities[c.entityId]
      invariant(neighbor?.type === EntityType.enum.Gear)

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
