import { z } from 'zod'

export const Cell = z.object({
  x: z.number(),
  y: z.number(),
  color: z.string(),
})
export type Cell = z.infer<typeof Cell>

export const DrawRequest = z.object({
  action: z.literal('draw'),
  payload: z.object({
    cells: z.array(Cell),
  }),
})

export type DrawRequest = z.infer<typeof DrawRequest>

export const Grid = z.array(z.array(z.string()))
export type Grid = z.infer<typeof Grid>

export const PushRequest = z.object({
  action: z.literal('push'),
  payload: z.object({
    grid: Grid,
  }),
})

export type PushRequest = z.infer<typeof PushRequest>

export const SyncRequestMessage = z.object({
  action: z.literal('sync-request'),
  payload: z.null(),
})
export type SyncRequestMessage = z.infer<typeof SyncRequestMessage>

export const SyncResponseMessage = z.object({
  action: z.literal('sync-response'),
  payload: z.object({
    grid: z.nullable(Grid),
  }),
})
export type SyncResponseMessage = z.infer<typeof SyncResponseMessage>

export const WebSocketMessage = z.discriminatedUnion('action', [
  DrawRequest,
  PushRequest,
  SyncRequestMessage,
  SyncResponseMessage,
])

export type WebSocketMessage = z.infer<typeof WebSocketMessage>

export const DrawQueueMessage = DrawRequest
export type DrawQueueMessage = DrawRequest
