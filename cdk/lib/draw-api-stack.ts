import {
  DomainName,
  WebSocketApi,
  WebSocketStage,
} from '@aws-cdk/aws-apigatewayv2-alpha'
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { Stack, StackProps } from 'aws-cdk-lib'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import {
  ARecord,
  PublicHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53'
import { ApiGatewayv2DomainProperties } from 'aws-cdk-lib/aws-route53-targets'
import { Construct } from 'constructs'
import { camelCase, upperFirst } from 'lodash'
import * as path from 'path'
import { capitalize, Stage } from './util'

enum Route {
  Connect = 'connect',
  Disconnect = 'disconnect',
  Draw = 'draw',
  Push = 'push',
  SyncRequest = 'sync-request',
}

type RouteToConstructs = Record<
  Route,
  { integration: WebSocketLambdaIntegration; handler: NodejsFunction }
>

interface DrawApiStackProps extends StackProps {
  stage: Stage
  prodDrawApiZone: PublicHostedZone
  stagingDrawApiZone: PublicHostedZone
}

export class DrawApiStack extends Stack {
  constructor(scope: Construct, id: string, props: DrawApiStackProps) {
    super(scope, id, props)
    const { stage, prodDrawApiZone, stagingDrawApiZone } = props

    const dynamoTable = new Table(this, `${stage}DrawApiTable`, {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
    })

    const domainName = `draw-api.${
      stage === Stage.Staging ? 'staging.' : ''
    }ty.ler.dev`

    const hostedZone =
      stage === Stage.Staging ? stagingDrawApiZone : prodDrawApiZone

    const domain = new DomainName(this, 'WebSocketDomainName', {
      domainName,
      certificate: new Certificate(this, 'DrawApiCertificate', {
        domainName,
        validation: CertificateValidation.fromDns(hostedZone),
      }),
    })

    const routeToConstructs: RouteToConstructs = Object.values(
      Route,
    ).reduce<RouteToConstructs>((acc, route) => {
      const idPrefix = upperFirst(camelCase(route))
      const handler = new NodejsFunction(this, `${idPrefix}Handler`, {
        entry: path.join(__dirname, `../../draw-api/${route}.ts`),
        environment: {
          DYNAMO_TABLE_NAME: dynamoTable.tableName,
        },
        bundling: {
          sourceMap: true,
        },
      })
      dynamoTable.grantReadWriteData(handler.grantPrincipal)

      const integration = new WebSocketLambdaIntegration(
        `${idPrefix}Integration`,
        handler,
      )
      return {
        ...acc,
        [route]: { integration, handler },
      }
    }, {} as RouteToConstructs)

    const webSocketApi = new WebSocketApi(this, 'WebSocketApi', {
      apiName: `${capitalize(stage)}DrawWebSocketApi`,
      routeSelectionExpression: '$request.body.action',
      connectRouteOptions: {
        integration: routeToConstructs[Route.Connect].integration,
      },
      disconnectRouteOptions: {
        integration: routeToConstructs[Route.Disconnect].integration,
      },
    })

    const webSocketStage = new WebSocketStage(this, 'WebSocketStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
      domainMapping: {
        domainName: domain,
      },
    })

    Object.entries(routeToConstructs).forEach(
      ([route, { handler, integration }]) => {
        dynamoTable.grantReadWriteData(handler.grantPrincipal)
        webSocketStage.grantManagementApiAccess(handler.grantPrincipal)
        if (route === Route.Connect || route === Route.Disconnect) {
          // These are configured in the WebSocketApi construct
          return
        }
        webSocketApi.addRoute(route, {
          integration,
        })
      },
    )

    new ARecord(this, 'TyLerDevAliasRecord', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          domain.regionalDomainName,
          domain.regionalHostedZoneId,
        ),
      ),
    })
  }
}
