import * as z from 'zod'
import { TileId } from './types.js'

export const vec2 = z.tuple([z.number(), z.number()])
export type Vec2 = z.infer<typeof vec2>

export const layerId = z.enum(['Layer1', 'Layer2', 'Both'])
export type LayerId = z.infer<typeof layerId>

export type Either<L, R> =
  | { left: L; right: null }
  | { left: null; right: R }

export const E = {
  left: <T>(value: T) => ({ left: value, right: null }),
  right: <T>(value: T) => ({ left: null, right: value }),
}

export enum AddEntityErrorType {
  BeltHasMoreThanTwoAdjacentBelts = 'belt-has-more-than-two-adjacent-belts',
  BeltOverlapsNonBelt = 'belt-overlaps-non-belt',
  OccupiedTile = 'occupied-tile',
}

export interface BeltHasMoreThanTwoAdjacentBeltsAddEntityError {
  type: AddEntityErrorType.BeltHasMoreThanTwoAdjacentBelts
  position: Vec2
}

export interface BeltOverlapsNonBeltAddEntityError {
  type: AddEntityErrorType.BeltOverlapsNonBelt
  position: Vec2
}

export interface OccupiedTileAddEntityError {
  type: AddEntityErrorType.OccupiedTile
  tileId: TileId
}

export type AddEntityError =
  | BeltHasMoreThanTwoAdjacentBeltsAddEntityError
  | BeltOverlapsNonBeltAddEntityError
  | OccupiedTileAddEntityError
