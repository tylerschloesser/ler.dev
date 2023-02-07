import { z } from 'zod'

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

export type DrawRequest = z.infer<typeof DrawRequest>
