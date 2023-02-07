import { DrawRequest } from 'common'
import * as util from './draw.util'
import { logger } from './logger'
import { updateGrid } from './push.util'
import { Handler } from './util'

const SIDE_EFFECTS = {
  getRecord: util.getRecord,
  sendMessageToPeer: util.sendMessageToPeer,
}

export type SideEffects = typeof SIDE_EFFECTS

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

  const { peerConnectionIds, grid } = await getRecord()
  logger.debug(JSON.stringify({ peerConnectionIds }))

  await Promise.all([
    ...peerConnectionIds.map(async (peerConnectionId) => {
      await sendMessageToPeer({
        callbackUrl,
        peerConnectionId,
        message: JSON.stringify(request),
      })
    }),
    // TODO push updates to list and resolve every second to fix race conditions?
    (async () => {
      if (grid) {
        request.payload.cells.forEach(({ x: col, y: row, color }) => {
          grid[row][col] = color
        })
        // TODO refactor this to not import from push.util.ts
        logger.info('updating grid')
        await updateGrid(grid)
      } else {
        // TODO shouldn't happen?
      }
    })(),
  ])

  return {
    statusCode: 200,
  }
}
