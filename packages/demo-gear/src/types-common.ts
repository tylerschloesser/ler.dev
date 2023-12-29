import * as z from 'zod'
import { EntityId } from './types-entity.js'

export const vec2 = z.tuple([z.number(), z.number()])
export type Vec2 = z.infer<typeof vec2>

export type Either<L, R> =
  | { left: L; right: null }
  | { left: null; right: R }

export enum DerivedErrorType {
  BeltHasMoreThanTwoAdjacentBelts = 'belt-has-more-than-two-adjacent-belts',
}

export interface BeltHasMoreThanTwoAdjacentBeltsDerivedError {
  type: DerivedErrorType.BeltHasMoreThanTwoAdjacentBelts
  entityId: EntityId
}

export type DerivedError =
  BeltHasMoreThanTwoAdjacentBeltsDerivedError
