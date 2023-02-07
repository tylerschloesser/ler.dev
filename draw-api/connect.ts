import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'
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

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const { connectionId } = event.requestContext
  const { DYNAMO_TABLE_NAME } = validateEnv()
  logger.debug('event', event)
  logger.debug('connectionId:', connectionId)

  await addConnectionId({ connectionId, DYNAMO_TABLE_NAME })

  return {
    statusCode: 200,
  }
}
