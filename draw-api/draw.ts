import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import {
  APIGatewayProxyWebsocketEventV2,
  APIGatewayProxyWebsocketHandlerV2,
} from 'aws-lambda'
import { DrawRequest } from 'common'

const dynamo = new DynamoDB({ region: 'us-west-2' })

function transformEvent(event: APIGatewayProxyWebsocketEventV2) {
  return {
    connectionId: event.requestContext.connectionId,

    // Don't add the stage here, even though that's what's show in the docs...
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html
    callbackUrl: `https://${event.requestContext.domainName}`,
  }
}

function validateEnv() {
  const { DYNAMO_TABLE_NAME } = process.env
  if (!DYNAMO_TABLE_NAME) {
    throw Error(`missing DYNAMO_TABLE_NAME`)
  }
  return { DYNAMO_TABLE_NAME }
}

async function getPeerConnectionIds({ DYNAMO_TABLE_NAME }) {
  const item = (
    await dynamo.getItem({
      TableName: DYNAMO_TABLE_NAME,
      Key: {
        id: {
          S: 'test',
        },
      },
    })
  ).Item
  console.log('item', JSON.stringify(item, null, 2))
  return item!.connectionIds.L!.map((value) => value.S!)
}

async function sendMessageToPeer(
  client: ApiGatewayManagementApiClient,
  {
    peerConnectionId: peerConnectionId,
    message,
  }: { peerConnectionId: string; message: string },
) {
  const command = new PostToConnectionCommand({
    ConnectionId: peerConnectionId,
    Data: new TextEncoder().encode(message),
  })
  try {
    return await client.send(command)
  } catch (error) {
    console.log('send error', JSON.stringify(error, null, 2))
    // TODO GoneException means the client disconnected, which we ignore for now
    if (error.errorType !== 'GoneException') {
      throw error
    }
  }
}

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
