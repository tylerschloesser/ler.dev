import * as z from 'zod'
import { derived } from './types-derived.js'
import { origin } from './types-origin.js'

export const world = z.strictObject({
  origin,
  derived,
  nextEntityId: z.number(),
})
export type World = z.infer<typeof world>
