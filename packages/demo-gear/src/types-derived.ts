import * as z from 'zod'
import { entityId } from './types-entity.js'

//
// Tile
//

export const tileId = z.string()
export type TileId = z.infer<typeof tileId>

export const tile = z.strictObject({
  entityIds: z.array(entityId),
})
export type Tile = z.infer<typeof tile>

//
// Belt Path
//

// prettier-ignore
export const beltDirection = z.enum([
  'WestNorth',  // ┛
  'NorthEast',  // ┗
  'EastSouth',  // ┏
  'SouthWest',  // ┓
  'WestEast',   // ━
  'NorthSouth', // ┃
])
export type BeltDirection = z.infer<typeof beltDirection>

export const beltPathEntity = z.strictObject({
  id: entityId,
  direction: beltDirection,
  invert: z.boolean(),
})
export type BeltPathEntity = z.infer<typeof beltPathEntity>

export const beltPath = z.strictObject({
  entities: z.array(beltPathEntity),
  loop: z.boolean(),
})
export type BeltPath = z.infer<typeof beltPath>

export const derived = z.strictObject({
  tiles: z.record(tileId, tile),
  beltPaths: z.array(beltPath),
})
export type Derived = z.infer<typeof derived>
