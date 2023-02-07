import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'
import { HydrateMessage, SyncRequestMessage, SyncResponseMessage } from 'common'
import { logger } from './logger'

const dynamo = new DynamoDB({ region: 'us-west-2' })

function validateEnv() {
  const { DYNAMO_TABLE_NAME } = process.env
  if (!DYNAMO_TABLE_NAME) {
    throw Error(`missing DYNAMO_TABLE_NAME`)
  }
  logger.debug('DYNAMO_TABLE_NAME:', DYNAMO_TABLE_NAME)
  return { DYNAMO_TABLE_NAME }
}

async function getImageDataUrl({
  DYNAMO_TABLE_NAME,
}: {
  DYNAMO_TABLE_NAME: string
}) {
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
  return item?.imageDataUrl?.S ?? null
}

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const { connectionId } = event.requestContext
  const callbackUrl = `https://${event.requestContext.domainName}`
  SyncRequestMessage.parse(JSON.parse(event.body!))
  const { DYNAMO_TABLE_NAME } = validateEnv()
  logger.debug('event', event)
  logger.debug('connectionId:', connectionId)

  const imageDataUrl = await getImageDataUrl({ DYNAMO_TABLE_NAME })
  const message: SyncResponseMessage = {
    action: 'sync-response',
    payload: {
      imageDataUrl,
    },
  }

  const client = new ApiGatewayManagementApiClient({ endpoint: callbackUrl })
  const command = new PostToConnectionCommand({
    ConnectionId: connectionId,
    Data: new TextEncoder().encode(JSON.stringify(message)),
  })
  await client.send(command)

  return {
    statusCode: 200,
  }
}
