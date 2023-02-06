import * as t from 'io-ts'
import { z } from 'zod'

export const Cell = t.type({
  x: t.number,
  y: t.number,
  color: t.string,
})

export const DrawPayload = t.type({
  cells: t.array(Cell),
})

export const DrawMessage = t.type({
  action: t.literal('draw'),
  payload: DrawPayload,
})

export const Message = t.exact(DrawMessage)

export const DrawRequest = z.object({
  action: z.literal('draw'),
  payload: z.object({
    cells: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
        color: z.string(),
      }),
    ),
  }),
})
