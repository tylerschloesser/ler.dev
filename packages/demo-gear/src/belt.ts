import invariant from 'tiny-invariant'
import {
  BeltDirection,
  BeltPath,
  Connection,
  ConnectionType,
  EntityType,
  World,
} from './types.js'

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

    for (const config of check) {
      const { dc, sr, dg } = config

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

      const multiplier = config.multiplier / gear.radius

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

// TODO get this to work
// export function updateAddBeltProgress(
//   hand: AddBeltHand,
//   elapsed: number,
// ): void {
//   if (
//     !hand.valid ||
//     hand.belts.length === 0 ||
//     !hand.motion
//   ) {
//     return
//   }
//
//   const {
//     motion: { source, accelerationMap },
//   } = hand
//
//   for (const belt of hand.belts) {
//     const multiplier = accelerationMap.get(belt)
//     invariant(multiplier !== undefined)
//
//     belt.velocity =
//       source.velocity * source.radius * multiplier
//     belt.offset = mod(
//       belt.offset + belt.velocity * elapsed,
//       1,
//     )
//   }
// }
