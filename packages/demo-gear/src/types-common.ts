import * as z from 'zod'

export const vec2 = z.tuple([z.number(), z.number()])
export type Vec2 = z.infer<typeof vec2>
