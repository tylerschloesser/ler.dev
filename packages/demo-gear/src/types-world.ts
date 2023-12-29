import * as z from 'zod'
import { derived } from './types-derived.js'
import { origin } from './types-origin.js'

export const world = z.strictObject({
  origin,
  derived,
})
export type World = z.infer<typeof world>
