import { SendMessageCommandInput, SQS } from '@aws-sdk/client-sqs'
import { DrawRequest } from 'common'
import * as util from './draw.util'
import { logger, pretty } from './logger'
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
    pretty({
      event,
      connectionId,
      callbackUrl,
      request,
    }),
  )

  const { peerConnectionIds } = await getRecord()
  logger.debug(pretty({ peerConnectionIds }))

  await Promise.all([
    ...peerConnectionIds.map((peerConnectionId) =>
      sendMessageToPeer({
        callbackUrl,
        peerConnectionId,
        message: JSON.stringify(request),
      }),
    ),
    (async () => {
      const input: SendMessageCommandInput = {
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify(request),
      }
      logger.debug(`sending sqs message: ${pretty(input)}`)
      await sqs.sendMessage(input)
      logger.debug('done sending message')
    })(),
  ])

  return {
    statusCode: 200,
  }
}
