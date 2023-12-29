import * as z from 'zod'
import { vec2 } from './types-common.js'

export const entityType = z.enum(['Gear', 'Belt'])
export type EntityType = z.infer<typeof entityType>

export const entityId = z.string()
export type EntityId = z.infer<typeof entityId>

export const baseEntity = z.strictObject({
  id: entityId,
  position: vec2,
  size: vec2,
})

//
// Gear
//

export const gearEntity = baseEntity.extend({
  type: z.literal(entityType.enum.Gear),

  chains: z.array(entityId),
  velocity: z.number(),
  angle: z.number(),
})
export type GearEntity = z.infer<typeof gearEntity>

//
// Belt
//

export const beltItem = z.tuple([
  z.literal('Fuel'),
  z.number(),
])
export type BeltItem = z.infer<typeof beltItem>

export const beltEntity = baseEntity.extend({
  type: z.literal(entityType.enum.Belt),

  items: z.array(beltItem),
  velocity: z.number(),
  offset: z.number(),
})
export type BeltEntity = z.infer<typeof beltEntity>

//
// World
//

export const entity = z.discriminatedUnion('type', [
  gearEntity,
  beltEntity,
])
export type Entity = z.infer<typeof entity>

export const buildEntity = z.discriminatedUnion('type', [
  gearEntity.omit({ id: true }),
  beltEntity.omit({ id: true }),
])
export type BuildEntity = z.infer<typeof buildEntity>
