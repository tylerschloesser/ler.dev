import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda'
import { DrawRequest } from 'common'
import { cloneDeep } from 'lodash'
import { handler, SideEffects } from './draw'

const TEST_EVENT: APIGatewayProxyWebsocketEventV2 = {
  requestContext: {
    routeKey: 'unused',
    messageId: 'unused',
    eventType: 'MESSAGE',
    extendedRequestId: 'unused',
    requestTime: 'unused',
    messageDirection: 'IN',
    stage: 'unused',
    connectedAt: -1,
    requestTimeEpoch: -1,
    requestId: 'unused',
    domainName: 'unused',
    connectionId: 'unused',
    apiId: 'unused',
  },
  isBase64Encoded: false,
}

describe('draw', () => {
  describe('handler', () => {
    it('works', async () => {
      const event = cloneDeep(TEST_EVENT)
      event.requestContext.connectionId = 'connectionId'
      event.requestContext.domainName = 'domainName'

      const drawRequest: DrawRequest = {
        action: 'draw',
        payload: {
          cells: [
            {
              x: 1,
              y: 2,
              color: 'pink',
            },
          ],
        },
      }
      event.body = JSON.stringify(drawRequest)

      const getPeerConnectionIds: jest.Mocked<
        SideEffects['getPeerConnectionIds']
      > = async () => {
        return ['a', 'b']
      }

      const sendMessageToPeer: jest.Mocked<
        SideEffects['sendMessageToPeer']
      > = async () => {}

      const sideEffects: SideEffects = {
        getPeerConnectionIds,
        sendMessageToPeer,
      }

      expect(await handler(event, null, null, sideEffects)).toEqual({
        statusCode: 200,
      })
    })
  })
})
