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

export const PushRequest = z.object({
  action: z.literal('push'),
  payload: z.object({
    imageDataUrl: z.string(),
  }),
})

export type PushRequest = z.infer<typeof PushRequest>
