import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi'
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'
import { DrawRequest } from 'common'
import * as util from './draw.util'

const SIDE_EFFECTS = {
  getPeerConnectionIds: util.getPeerConnectionIds,
  sendMessageToPeer: util.sendMessageToPeer,
}

export type SideEffects = typeof SIDE_EFFECTS

export type Handler<
  Context = Parameters<APIGatewayProxyWebsocketHandlerV2>[1],
  Callback = Parameters<APIGatewayProxyWebsocketHandlerV2>[2],
> = (
  event: Parameters<APIGatewayProxyWebsocketHandlerV2>[0],
  context: Context,
  callback: Callback,
  sideEffects: SideEffects,
) => ReturnType<APIGatewayProxyWebsocketHandlerV2>

export const handler: Handler<unknown, unknown> = async (
  event,
  _context: unknown,
  _callback: unknown,
  { getPeerConnectionIds, sendMessageToPeer }: SideEffects = SIDE_EFFECTS,
) => {
  const { connectionId, callbackUrl } = util.transformEvent(event)
  const request = DrawRequest.parse(JSON.parse(event.body!))

  console.debug(
    JSON.stringify({
      event,
      connectionId,
      callbackUrl,
      request,
    }),
  )

  const client = new ApiGatewayManagementApiClient({ endpoint: callbackUrl })
  const peerConnectionIds = await getPeerConnectionIds()
  console.debug(JSON.stringify({ peerConnectionIds }))

  await Promise.all(
    peerConnectionIds.map(async (peerConnectionId) => {
      await sendMessageToPeer(client, {
        peerConnectionId,
        message: JSON.stringify(request),
      })
    }),
  )

  return {
    statusCode: 200,
  }
}
