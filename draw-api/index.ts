import { APIGatewayProxyResult } from 'aws-lambda'

export const handler = async (): Promise<APIGatewayProxyResult> => {
  console.log('connected!')
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hi',
    }),
  }
}
