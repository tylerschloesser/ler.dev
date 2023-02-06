import { DrawRequest } from 'common'
import * as util from './draw.util'
import { logger } from './logger'
import { Handler } from './util'

const SIDE_EFFECTS = {
  getPeerConnectionIds: util.getPeerConnectionIds,
  sendMessageToPeer: util.sendMessageToPeer,
}

export type SideEffects = typeof SIDE_EFFECTS

export const handler: Handler<SideEffects, unknown, unknown> = async (
  event,
  _context: unknown,
  _callback: unknown,
  { getPeerConnectionIds, sendMessageToPeer }: SideEffects = SIDE_EFFECTS,
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

  const peerConnectionIds = await getPeerConnectionIds()
  logger.debug(JSON.stringify({ peerConnectionIds }))

  await Promise.all(
    peerConnectionIds.map(async (peerConnectionId) => {
      await sendMessageToPeer({
        callbackUrl,
        peerConnectionId,
        message: JSON.stringify(request),
      })
    }),
  )

  return {
    statusCode: 200,
  }
}
