import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'
import { logger, pretty } from './logger'

const dynamo = new DynamoDB({ region: 'us-west-2' })

export const handler: APIGatewayProxyWebsocketHandlerV2 =
  async (event) => {
    const { connectionId } = event.requestContext
    const DYNAMO_TABLE_NAME = process.env.DYNAMO_TABLE_NAME!

    logger.debug(
      pretty({
        event,
        connectionId,
        DYNAMO_TABLE_NAME,
      }),
    )

    logger.debug('deleting connection ID from dynamo')
    await dynamo.updateItem({
      TableName: DYNAMO_TABLE_NAME,
      Key: {
        id: {
          S: 'test',
        },
      },
      UpdateExpression: 'DELETE connectionIds :ids',
      ExpressionAttributeValues: {
        ':ids': {
          SS: [connectionId],
        },
      },
    })
    logger.debug('done')

    return {
      statusCode: 200,
    }
  }
