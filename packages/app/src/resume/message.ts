import { z } from 'zod'
import { ZodVec2 } from './vec2'

export const MessageType = z.enum(['Init', 'Viewport'])
export type MessageType = z.infer<typeof MessageType>

export const InitMessage = z.strictObject({
  type: z.literal(MessageType.enum.Init),
  canvas: z.custom<OffscreenCanvas>(
    (value) => value instanceof OffscreenCanvas,
  ),
  viewport: ZodVec2,
})
export type InitMessage = z.infer<typeof InitMessage>

export const ViewportMessage = z.strictObject({
  type: z.literal(MessageType.enum.Viewport),
  viewport: ZodVec2,
})
export type ViewportMessage = z.infer<
  typeof ViewportMessage
>

export const Message = z.discriminatedUnion('type', [
  InitMessage,
  ViewportMessage,
])
export type Message = z.infer<typeof Message>
