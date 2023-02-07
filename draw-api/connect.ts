import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'
import { HydrateMessage } from 'common'
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

async function addConnectionId({
  connectionId,
  DYNAMO_TABLE_NAME,
}: {
  connectionId: string
  DYNAMO_TABLE_NAME: string
}) {
  await dynamo.updateItem({
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      id: {
        S: 'test',
      },
    },
    UpdateExpression: 'ADD connectionIds :ids',
    ExpressionAttributeValues: {
      ':ids': {
        SS: [connectionId],
      },
    },
  })
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

async function hydrateClient({
  DYNAMO_TABLE_NAME,
  connectionId,
  callbackUrl,
}: {
  DYNAMO_TABLE_NAME: string
  connectionId: string
  callbackUrl: string
}) {
  const imageDataUrl = await getImageDataUrl({ DYNAMO_TABLE_NAME })
  const message: HydrateMessage = {
    action: 'hydrate',
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
}

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const { connectionId } = event.requestContext
  const callbackUrl = `https://${event.requestContext.domainName}`
  const { DYNAMO_TABLE_NAME } = validateEnv()
  logger.debug('event', event)
  logger.debug('connectionId:', connectionId)

  await Promise.all([
    addConnectionId({ connectionId, DYNAMO_TABLE_NAME }),
    hydrateClient({ connectionId, DYNAMO_TABLE_NAME, callbackUrl }),
  ])

  return {
    statusCode: 200,
  }
}
