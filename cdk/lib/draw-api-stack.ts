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
import * as path from 'path'
import { capitalize, Stage } from './util'

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

    const webSocketApi = new WebSocketApi(this, 'WebSocketApi', {
      apiName: `${capitalize(stage)}DrawWebSocketApi`,
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          'ConnectIntegration',
          new NodejsFunction(this, 'ConnectHandler', {
            entry: path.join(__dirname, '../../draw-api/index.ts'),
            environment: {
              DYNAMO_TABLE_NAME: dynamoTable.tableName,
            },
          }),
        ),
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

    new WebSocketStage(this, 'WebSocketStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
      domainMapping: {
        domainName: domain,
      },
    })

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
