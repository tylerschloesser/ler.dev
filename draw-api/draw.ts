import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'

const dynamo = new DynamoDB({ region: 'us-west-2' })

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const { connectionId } = event.requestContext
  console.log('event', event)
  console.log('connectionId:', connectionId)

  const { DYNAMO_TABLE_NAME } = process.env
  if (!DYNAMO_TABLE_NAME) {
    throw Error(`missing DYNAMO_TABLE_NAME`)
  }

  console.log('DYNAMO_TABLE_NAME:', DYNAMO_TABLE_NAME)

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
  console.log('item', item)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hi',
    }),
  }
}
