import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'
import { DrawMessage } from 'common'
import { fold } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'

const dynamo = new DynamoDB({ region: 'us-west-2' })

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const { connectionId } = event.requestContext
  const domain = event.requestContext.domainName

  pipe(
    DrawMessage.decode(event.body),
    fold(
      (errors) => {
        console.log('decode error', JSON.stringify(errors, null, 2))
      },
      (message) => {
        console.log('decode successful')
        console.log(JSON.stringify(message))
      },
    ),
  )

  // Don't add the stage here, even though that's what's show in the docs...
  // https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html
  const callbackUrl = `https://${domain}`

  const client = new ApiGatewayManagementApiClient({ endpoint: callbackUrl })

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
  console.log('item', JSON.stringify(item, null, 2))

  const connectionIds = item!.connectionIds.L!.map((value) => value.S!)
  console.log('connectionIds', connectionIds)

  await Promise.all(
    connectionIds.map(async (id) => {
      const command = new PostToConnectionCommand({
        ConnectionId: id,
        Data: new TextEncoder().encode('hello'),
      })
      try {
        return await client.send(command)
      } catch (error) {
        // TODO GoneException means the client disconnected, which we ignore for now
        if (error.errorType !== 'GoneException') {
          throw error
        }
      }
    }),
  )

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hi',
    }),
  }
}
