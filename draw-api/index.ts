import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  console.log('connectionId:', event.requestContext.connectionId)
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hi',
    }),
  }
}
