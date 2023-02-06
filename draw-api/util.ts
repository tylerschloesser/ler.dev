import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'

export type Handler<
  SideEffects,
  Context = Parameters<APIGatewayProxyWebsocketHandlerV2>[1],
  Callback = Parameters<APIGatewayProxyWebsocketHandlerV2>[2],
> = (
  event: Parameters<APIGatewayProxyWebsocketHandlerV2>[0],
  context?: Context,
  callback?: Callback,
  sideEffects?: SideEffects,
) => ReturnType<APIGatewayProxyWebsocketHandlerV2>
