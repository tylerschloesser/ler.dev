import * as z from 'zod'

export const vec2 = z.tuple([z.number(), z.number()])
export type Vec2 = z.infer<typeof vec2>

export type Either<L, R> =
  | { left: L; right: null }
  | { left: null; right: R }

export enum AddEntityErrorType {
  BeltHasMoreThanTwoAdjacentBelts = 'belt-has-more-than-two-adjacent-belts',
  BeltOverlapsNonBelt = 'belt-overlaps-non-belt',
}

export interface BeltHasMoreThanTwoAdjacentBeltsAddEntityError {
  type: AddEntityErrorType.BeltHasMoreThanTwoAdjacentBelts
  position: Vec2
}

export interface BeltOverlapsNonBeltAddEntityError {
  type: AddEntityErrorType.BeltOverlapsNonBelt
  position: Vec2
}

export type AddEntityError =
  | BeltHasMoreThanTwoAdjacentBeltsAddEntityError
  | BeltOverlapsNonBeltAddEntityError
