import {
  ApiGatewayManagementApiClient,
  GoneException,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { Grid } from '@ler.dev/common'
import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda'
import { memoize } from 'lodash'
import { promisify } from 'util'
import zlib from 'zlib'
import { logger, pretty } from './logger'

const inflate = promisify(zlib.inflate)
const deflate = promisify(zlib.deflate)

const dynamo = new DynamoDB({ region: 'us-west-2' })

export function transformEvent(event: APIGatewayProxyWebsocketEventV2) {
  return {
    connectionId: event.requestContext.connectionId,

    // Don't add the stage here, even though that's what's show in the docs...
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html
    callbackUrl: `https://${event.requestContext.domainName}`,
  }
}

export async function getRecord() {
  const DYNAMO_TABLE_NAME = process.env.DYNAMO_TABLE_NAME!
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
  logger.debug(`item: ${pretty(item)}`)
  // TODO strongly type this somehow
  // TODO filter out our own connection ID?
  const peerConnectionIds = item?.connectionIds?.SS ?? []

  const deflated = item?.grid?.S ?? null
  let grid: Grid | null = null
  if (deflated) {
    grid = Grid.parse(
      JSON.parse((await inflate(Buffer.from(deflated, 'base64'))).toString()),
    )
  }

  return {
    peerConnectionIds,
    grid,
  }
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
    logger.debug(`send error: ${pretty(error)}`)
    if (error instanceof GoneException) {
      // ignore for now
    } else {
      throw error
    }
  }
}
