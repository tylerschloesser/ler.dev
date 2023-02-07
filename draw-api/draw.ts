import { SQS } from '@aws-sdk/client-sqs'
import { DrawRequest } from 'common'
import * as util from './draw.util'
import { logger } from './logger'
import { Handler } from './util'

const SIDE_EFFECTS = {
  getRecord: util.getRecord,
  sendMessageToPeer: util.sendMessageToPeer,
}

export type SideEffects = typeof SIDE_EFFECTS

const sqs = new SQS({ region: 'us-west-2' })

export const handler: Handler<SideEffects, unknown, unknown> = async (
  event,
  _context: unknown,
  _callback: unknown,
  { getRecord, sendMessageToPeer }: SideEffects = SIDE_EFFECTS,
) => {
  const { connectionId, callbackUrl } = util.transformEvent(event)
  const request = DrawRequest.parse(JSON.parse(event.body!))

  logger.debug(
    JSON.stringify({
      event,
      connectionId,
      callbackUrl,
      request,
    }),
  )

  const { peerConnectionIds } = await getRecord()
  logger.debug(JSON.stringify({ peerConnectionIds }))

  await Promise.all([
    ...peerConnectionIds.map((peerConnectionId) =>
      sendMessageToPeer({
        callbackUrl,
        peerConnectionId,
        message: JSON.stringify(request),
      }),
    ),
    sqs.sendMessage({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify(request),
    }),
  ])

  return {
    statusCode: 200,
  }
}