import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi'
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'
import { DrawRequest } from 'common'
import {
  getPeerConnectionIds,
  sendMessageToPeer,
  transformEvent,
  validateEnv,
} from './draw.util'

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const { connectionId, callbackUrl } = transformEvent(event)
  const { DYNAMO_TABLE_NAME } = validateEnv()
  const request = DrawRequest.parse(JSON.parse(event.body!))

  console.debug(
    JSON.stringify({
      event,
      connectionId,
      callbackUrl,
      DYNAMO_TABLE_NAME,
      request,
    }),
  )

  const client = new ApiGatewayManagementApiClient({ endpoint: callbackUrl })
  const peerConnectionIds = await getPeerConnectionIds({ DYNAMO_TABLE_NAME })
  console.debug(JSON.stringify({ peerConnectionIds }))

  await Promise.all(
    peerConnectionIds.map(async (peerConnectionId) =>
      sendMessageToPeer(client, {
        peerConnectionId,
        message: JSON.stringify(request),
      }),
    ),
  )

  return {
    statusCode: 200,
  }
}
