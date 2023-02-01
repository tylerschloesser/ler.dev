import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha'
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { Stack, StackProps } from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as path from 'path'
import { capitalize, Stage } from './util'

interface DrawApiStackProps extends StackProps {
  stage: Stage
}

export class DrawApiStack extends Stack {
  constructor(scope: Construct, id: string, props: DrawApiStackProps) {
    super(scope, id, props)
    const { stage } = props

    const webSocketApi = new WebSocketApi(this, 'WebSocketApi', {
      apiName: `${capitalize(stage)}DrawWebSocketApi`,
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          'ConnectIntegration',
          new NodejsFunction(this, 'ConnectHandler', {
            entry: path.join(__dirname, '../../draw-api/index.ts'),
          }),
        ),
      },
    })
    new WebSocketStage(this, 'WebSocketStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    })
  }
}
