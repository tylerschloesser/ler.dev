import * as z from 'zod'
import { layerId, vec2 } from './types-common.js'

export const entityType = z.enum(['Gear', 'Chain', 'Belt'])
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
  layerId,

  velocity: z.number(),
  angle: z.number(),
})
export type GearEntity = z.infer<typeof gearEntity>
export const buildGearEntity = gearEntity.omit({ id: true })
export type BuildGearEntity = z.infer<
  typeof buildGearEntity
>

//
// Chain
//
export const chainEntity = baseEntity.extend({
  type: z.literal(entityType.enum.Chain),

  velocity: z.number(),
  offset: z.number(),
})

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
  layerId,

  items: z.array(beltItem),
  velocity: z.number(),
  offset: z.number(),
})
export type BeltEntity = z.infer<typeof beltEntity>
export const buildBeltEntity = beltEntity.omit({ id: true })
export type BuildBeltEntity = z.infer<
  typeof buildBeltEntity
>

//
// World
//

export const entity = z.discriminatedUnion('type', [
  gearEntity,
  beltEntity,
])
export type Entity = z.infer<typeof entity>

export const buildEntity = z.discriminatedUnion('type', [
  buildGearEntity,
  buildBeltEntity,
])
export type BuildEntity = z.infer<typeof buildEntity>
