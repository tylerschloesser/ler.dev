import {
  ApiGatewayManagementApiClient,
  GoneException,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda'
import { memoize } from 'lodash'
import { logger } from './logger'

const dynamo = new DynamoDB({ region: 'us-west-2' })

export function transformEvent(event: APIGatewayProxyWebsocketEventV2) {
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

export async function getPeerConnectionIds() {
  const { DYNAMO_TABLE_NAME } = validateEnv()
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
  logger.debug('item', JSON.stringify(item, null, 2))
  // TODO strongly type this somehow
  return item?.connectionIds?.SS ?? []
}

const getClient = memoize(
  (callbackUrl: string) =>
    new ApiGatewayManagementApiClient({ endpoint: callbackUrl }),
)

export async function sendMessageToPeer({
  callbackUrl,
  peerConnectionId: peerConnectionId,
  message,
}: {
  callbackUrl: string
  peerConnectionId: string
  message: string
}) {
  const command = new PostToConnectionCommand({
    ConnectionId: peerConnectionId,
    Data: new TextEncoder().encode(message),
  })
  try {
    await getClient(callbackUrl).send(command)
  } catch (error) {
    logger.debug('send error', JSON.stringify(error, null, 2))
    if (error instanceof GoneException) {
      // ignore for now
    } else {
      throw error
    }
  }
}
