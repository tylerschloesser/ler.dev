import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'
import { logger, pretty } from './logger'

const dynamo = new DynamoDB({ region: 'us-west-2' })

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
  const DYNAMO_TABLE_NAME = process.env.DYNAMO_TABLE_NAME!
  logger.debug(pretty({ event, connectionId }))

  await addConnectionId({ connectionId, DYNAMO_TABLE_NAME })

  return {
    statusCode: 200,
  }
}
