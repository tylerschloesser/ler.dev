import { z } from 'zod'

export const DrawPayload = z.object({
  x: z.number(),
  y: z.number(),
  color: z.string(),
})

export const DrawMessage = z.object({
  action: z.literal('draw'),
  payload: DrawPayload,
})
export type DrawMessage = z.infer<typeof DrawMessage>

export const BatchDrawMessage = z.object({
  action: z.literal('batch-draw'),
  payload: z.array(DrawPayload),
})
export type BatchDrawMessage = z.infer<typeof BatchDrawMessage>

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
  BatchDrawMessage,
  PushRequest,
  SyncRequestMessage,
  SyncResponseMessage,
])

export type WebSocketMessage = z.infer<typeof WebSocketMessage>

export const DrawQueueMessage = BatchDrawMessage
export type DrawQueueMessage = BatchDrawMessage
