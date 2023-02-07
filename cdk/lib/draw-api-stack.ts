import {
  DomainName,
  WebSocketApi,
  WebSocketStage,
} from '@aws-cdk/aws-apigatewayv2-alpha'
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { Duration, Stack, StackProps } from 'aws-cdk-lib'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import {
  ARecord,
  PublicHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53'
import { ApiGatewayv2DomainProperties } from 'aws-cdk-lib/aws-route53-targets'
import { Queue } from 'aws-cdk-lib/aws-sqs'
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

interface AsyncStuffProps {
  dynamoTable: Table
}

class AsyncStuff extends Construct {
  readonly queue: Queue
  constructor(scope: Construct, id: string, { dynamoTable }: AsyncStuffProps) {
    super(scope, id)

    this.queue = new Queue(this, 'DrawQueue')

    const handler = new NodejsFunction(this, `DrawQueueMessageHandler`, {
      entry: path.join(__dirname, '../../draw-api/queue-message-handler.ts'),
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        DYNAMO_TABLE_NAME: dynamoTable.tableName,
        SQS_QUEUE_URL: this.queue.queueUrl,
      },
      bundling: {
        sourceMap: true,
        minify: true,
      },
      runtime: Runtime.NODEJS_18_X,
    })
    dynamoTable.grantReadWriteData(handler.grantPrincipal)

    const eventSource = new SqsEventSource(this.queue, {
      batchSize: 10_000,
      maxBatchingWindow: Duration.seconds(5),
    })

    handler.addEventSource(eventSource)
  }
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

    const asyncStuff = new AsyncStuff(this, 'AsyncStuff', {
      dynamoTable,
    })

    const routeToConstructs: RouteToConstructs = Object.values(
      Route,
    ).reduce<RouteToConstructs>((acc, route) => {
      const idPrefix = upperFirst(camelCase(route))
      const handler = new NodejsFunction(this, `${idPrefix}Handler`, {
        entry: path.join(__dirname, `../../draw-api/${route}.ts`),
        environment: {
          NODE_OPTIONS: '--enable-source-maps',
          DYNAMO_TABLE_NAME: dynamoTable.tableName,
          SQS_QUEUE_URL: asyncStuff.queue.queueUrl,
        },
        bundling: {
          sourceMap: true,
          minify: true,
        },
        runtime: Runtime.NODEJS_18_X,
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

    asyncStuff.queue.grantSendMessages(
      routeToConstructs[Route.Draw].handler.grantPrincipal,
    )

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
