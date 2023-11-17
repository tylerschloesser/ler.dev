import invariant from 'tiny-invariant'
import { HALF_PI, PI, TWO_PI } from './const.js'
import {
  AddGearHover,
  ConnectionType,
  Gear,
  GearId,
  Pointer,
  SimpleVec2,
  World,
} from './types.js'
import { Vec2 } from './vec2.js'

export function* iterateConnections(
  gears: Record<GearId, Gear>,
) {
  const seen = new Map<string, ConnectionType>()
  for (const gear of Object.values(gears)) {
    for (const connection of gear.connections) {
      const id = [gear.id, connection.gearId]
        .sort()
        .join('.')
      if (seen.has(id)) {
        // sanity check the connection type
        invariant(seen.get(id) === connection.type)
        continue
      }
      seen.set(id, connection.type)

      const peer = gears[connection.gearId]
      invariant(peer)

      yield {
        gear1: gear,
        gear2: peer,
        type: connection.type,
      }
    }
  }
}

export function* iterateNetwork(root: Gear, world: World) {
  const seen = new Set<Gear>()
  const stack = new Array<Gear>(root)

  while (stack.length) {
    const node = stack.pop()
    invariant(node)
    if (seen.has(node)) {
      continue
    }
    seen.add(node)

    yield node

    const { connections } = node
    connections.forEach((connection) => {
      const neighbor = world.gears[connection.gearId]
      invariant(neighbor)
      stack.push(neighbor)
    })
  }
}

export function* iterateGearTileIds(
  position: SimpleVec2,
  radius: number,
) {
  for (let x = -radius; x < radius; x++) {
    for (let y = -radius; y < radius; y++) {
      invariant(x === Math.floor(x))
      invariant(y === Math.floor(y))
      const tileId = `${position.x + x}.${position.y + y}`
      yield tileId
    }
  }
}

export function* iterateGearTiles(
  position: SimpleVec2,
  radius: number,
  world: World,
) {
  for (const tileId of iterateGearTileIds(
    position,
    radius,
  )) {
    const tile = world.tiles[tileId]
    if (tile) {
      yield tile
    }
  }
}

export function* iterateOverlappingGears(
  position: SimpleVec2,
  radius: number,
  world: World,
) {
  const seen = new Set<GearId>()

  for (const tile of iterateGearTiles(
    position,
    radius,
    world,
  )) {
    if (
      tile.attachedGearId &&
      !seen.has(tile.attachedGearId)
    ) {
      seen.add(tile.attachedGearId)
      const attachedGear = world.gears[tile.attachedGearId]
      invariant(attachedGear)
      yield attachedGear
    }

    if (!seen.has(tile.gearId)) {
      const gear = world.gears[tile.gearId]
      invariant(gear)
      yield gear
    }
    seen.add(tile.gearId)
  }
}

function* iterateAdjacentGears({
  pointer,
  hover,
  world,
}: {
  pointer: Pointer
  hover: AddGearHover
  world: World
}) {
  const v = new Vec2(hover.radius, 0)
  for (const angle of [0, HALF_PI, PI, PI + HALF_PI]) {
    const point = v.rotate(angle).floor()

    const { x, y } = pointer.position.add(
      v.add(0.5).rotate(angle).floor(),
    )
    const tileId = `${x}.${y}`
    const tile = world.tiles[tileId]

    if (!tile) {
      continue
    }

    // ignore attached gears

    const gear = world.gears[tile.gearId]
    invariant(gear)

    if (
      Vec2.equal(
        new Vec2(gear.position).add(
          new Vec2(gear.radius).rotate(TWO_PI - angle),
        ),
        point,
      )
    ) {
      yield gear.id
    }
  }
}

export function addTeethConnections({
  pointer,
  hover,
  world,
}: {
  pointer: Pointer
  hover: AddGearHover
  world: World
}): void {
  const { connections } = hover
  if (connections.length > 0) {
    return
  }

  for (const gearId of iterateAdjacentGears({
    pointer,
    hover,
    world,
  })) {
    connections.push({
      type: ConnectionType.enum.Teeth,
      gearId,
    })
  }
}
