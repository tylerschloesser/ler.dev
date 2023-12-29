import * as z from 'zod'
import { entity, entityId } from './types-entity.js'

export const origin = z.strictObject({
  entities: z.record(entityId, entity),
})
export type Origin = z.infer<typeof origin>
