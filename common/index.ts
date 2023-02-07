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

export const HydrateMessage = z.object({
  action: z.literal('hydrate'),
  payload: z.object({
    imageDataUrl: z.string().nullable(),
  }),
})
export type HydrateMessage = z.infer<typeof HydrateMessage>

export const SyncRequestMessage = z.object({
  action: z.literal('sync-request'),
  payload: z.null(),
})
export type SyncRequestMessage = z.infer<typeof SyncRequestMessage>

export const SyncResponseMessage = z.object({
  action: z.literal('sync-response'),
  payload: z.object({
    imageDataUrl: z.string().nullable(),
  }),
})
export type SyncResponseMessage = z.infer<typeof SyncResponseMessage>

export const WebSocketMessage = z.discriminatedUnion('action', [
  DrawRequest,
  PushRequest,
  HydrateMessage,
  SyncRequestMessage,
  SyncResponseMessage,
])

export type WebSocketMessage = z.infer<typeof WebSocketMessage>
