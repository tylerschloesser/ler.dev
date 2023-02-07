import { PushRequest } from 'common'
import { logger } from './logger'
import * as util from './push.util'
import { Handler } from './util'

const SIDE_EFFECTS = {
  getPeerConnectionIds: util.getPeerConnectionIds,
  sendMessageToPeer: util.sendMessageToPeer,
  updateGrid: util.updateGrid,
}

export type SideEffects = typeof SIDE_EFFECTS

export const handler: Handler<SideEffects, unknown, unknown> = async (
  event,
  _context: unknown,
  _callback: unknown,
  {
    updateGrid,
    getPeerConnectionIds,
    sendMessageToPeer,
  }: SideEffects = SIDE_EFFECTS,
) => {
  const { connectionId, callbackUrl } = util.transformEvent(event)
  const request = PushRequest.parse(JSON.parse(event.body!))

  logger.debug(
    JSON.stringify({
      event,
      connectionId,
      callbackUrl,
      request,
    }),
  )

  await updateGrid(request.payload.grid)

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