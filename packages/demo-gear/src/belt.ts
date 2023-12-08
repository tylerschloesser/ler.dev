import invariant from 'tiny-invariant'
import {
  AddBeltHand,
  Belt,
  BeltDirection,
  BeltPath,
  Connection,
  ConnectionType,
  EntityType,
  World,
} from './types.js'
import { mod } from './util.js'

export function addBelts(
  world: World,
  belts: Belt[],
): void {
  for (const belt of belts) {
    invariant(world.entities[belt.id] === undefined)
    world.entities[belt.id] = belt

    const path =
      belt.type === EntityType.enum.Belt
        ? belt.path
        : [belt.position]

    for (const position of path) {
      const { x, y } = position
      const tileId = `${x}.${y}`
      let tile = world.tiles[tileId]
      if (!tile) {
        tile = world.tiles[tileId] = {}
      }
      invariant(tile.entityId === undefined)
      tile.entityId = belt.id
    }

    for (const connection of belt.connections) {
      switch (connection.type) {
        case ConnectionType.enum.Adjacent: {
          const peer = world.entities[connection.entityId]
          invariant(peer)
          invariant(
            !peer.connections.find(
              (c) => c.entityId === belt.id,
            ),
          )
          peer.connections.push({
            type: ConnectionType.enum.Adjacent,
            entityId: belt.id,
            multiplier: 1 / connection.multiplier,
          })
          break
        }
        case ConnectionType.enum.Belt: {
          invariant(
            belts.find((b) => b.id === connection.entityId),
          )
          break
        }
        default: {
          invariant(false)
        }
      }
    }
  }
}

export function getBeltConnections(
  world: World,
  path: BeltPath,
  direction: BeltDirection,
): Connection[] {
  const connections: Connection[] = []

  for (const position of path) {
    let check
    switch (direction) {
      case 'x':
        check = [
          {
            // where is the tile we're going to check
            // relative to the cell position
            dc: { x: 0, y: -1 },

            // how to scale the gear radius when finding
            // the connection point
            sr: { x: 0, y: 1 },

            // how to adjust the gear position when
            // finding the connection point
            dg: { x: 0, y: 0 },
            multiplier: -1,
          },
          {
            dc: { x: 1, y: -1 },
            sr: { x: 0, y: 1 },
            dg: { x: -1, y: 0 },
            multiplier: -1,
          },
          {
            dc: { x: 0, y: 1 },
            sr: { x: 0, y: -1 },
            dg: { x: 0, y: -1 },
            multiplier: 1,
          },
          {
            dc: { x: 1, y: 1 },
            sr: { x: 0, y: -1 },
            dg: { x: -1, y: -1 },
            multiplier: 1,
          },
        ]
        break
      case 'y':
        check = [
          {
            dc: { x: -1, y: -1 },
            sr: { x: 1, y: 0 },
            dg: { x: 0, y: 0 },
            multiplier: 1,
          },
          {
            dc: { x: -1, y: 0 },
            sr: { x: 1, y: 0 },
            dg: { x: 0, y: -1 },
            multiplier: 1,
          },
          {
            dc: { x: 1, y: -1 },
            sr: { x: -1, y: 0 },
            dg: { x: -1, y: 0 },
            multiplier: -1,
          },
          {
            dc: { x: 1, y: 0 },
            sr: { x: -1, y: 0 },
            dg: { x: -1, y: -1 },
            multiplier: -1,
          },
        ]
        break
      default:
        invariant(false)
    }

    const cx = position.x
    const cy = position.y

    for (const { dc, sr, dg, multiplier } of check) {
      const tx = cx + dc.x
      const ty = cy + dc.y
      const tileId = `${tx}.${ty}`

      const tile = world.tiles[tileId]

      if (!tile?.entityId) {
        continue
      }

      const gear = world.entities[tile.entityId]
      if (gear?.type !== EntityType.enum.Gear) {
        continue
      }

      const gx = gear.center.x + dg.x + gear.radius * sr.x
      const gy = gear.center.y + dg.y + gear.radius * sr.y

      if (gx === cx && gy === cy) {
        if (
          // hacky way to check duplicates,
          // which happen because most points are checked twice
          // (both belt corners)
          !connections.find(
            (c) =>
              c.type === ConnectionType.enum.Adjacent &&
              c.entityId === gear.id &&
              c.multiplier === multiplier,
          )
        ) {
          connections.push({
            type: ConnectionType.enum.Adjacent,
            entityId: gear.id,
            multiplier,
          })
        }
      }
    }
  }

  return connections
}

export function updateAddBeltProgress(
  hand: AddBeltHand,
  elapsed: number,
): void {
  if (
    !hand.valid ||
    hand.belts.length === 0 ||
    !hand.motion
  ) {
    return
  }

  const {
    motion: { source, accelerationMap },
  } = hand

  for (const belt of hand.belts) {
    const multiplier = accelerationMap.get(belt)
    invariant(multiplier !== undefined)
    belt.offset = mod(
      belt.offset +
        source.velocity *
          source.radius *
          elapsed *
          multiplier,
      1,
    )
  }
}
