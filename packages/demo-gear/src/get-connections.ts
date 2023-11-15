import invariant from 'tiny-invariant'
import {
  Connection,
  ConnectionType,
  GearId,
  Vec2,
  World,
} from './types.js'

export function getConnections({
  size,
  position,
  world,
}: {
  size: number
  position: Vec2
  world: World
}): Connection[] {
  const connections = new Set<GearId>()

  for (const delta of [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
  ]) {
    const point = {
      x: position.x + ((size - 1) / 2 + 1) * delta.x,
      y: position.y + ((size - 1) / 2 + 1) * delta.y,
    }
    const tileId = `${point.x}.${point.y}`
    const tile = world.tiles[tileId]
    if (!tile) {
      continue
    }

    // TODO handle not first gear ID
    const gearId = tile.gearIds[0]
    invariant(gearId)

    const gear = world.gears[gearId]
    invariant(gear)

    if (
      gear.position.x + -((gear.radius - 0.5) * delta.x) ===
        point.x &&
      gear.position.y + -((gear.radius - 0.5) * delta.y) ===
        point.y
    ) {
      connections.add(gearId)
    }
  }
  return [...connections].map((gearId) => ({
    type: ConnectionType.Teeth,
    gearId,
  }))
}
