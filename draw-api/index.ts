import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'

const dynamo = new DynamoDB({ region: 'us-west-2' })

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const { connectionId } = event.requestContext
  console.log('connectionId:', connectionId)

  const { DYNAMO_TABLE_NAME } = process.env
  if (!DYNAMO_TABLE_NAME) {
    throw Error(`missing DYNAMO_TABLE_NAME`)
  }

  console.log('DYNAMO_TABLE_NAME:', DYNAMO_TABLE_NAME)

  await dynamo.updateItem({
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      id: {
        S: 'test',
      },
    },
    UpdateExpression:
      'SET #ids = list_append(if_not_exists(#ids, :emptyList), :newIds)',
    ExpressionAttributeNames: {
      '#ids': 'connectionIds',
    },
    ExpressionAttributeValues: {
      ':newIds': {
        L: [{ S: connectionId }],
      },
      ':emptyList': {
        L: [],
      },
    },
  })

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hi',
    }),
  }
}
