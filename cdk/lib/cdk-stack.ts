import { Certificate } from '@aws-cdk/aws-certificatemanager'
import { Distribution, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront'
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins'
import {
  ARecord,
  PublicHostedZone,
  RecordTarget,
  TxtRecord,
} from '@aws-cdk/aws-route53'
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets'
import { Bucket } from '@aws-cdk/aws-s3'
import * as cdk from '@aws-cdk/core'

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const zone = new PublicHostedZone(this, 'PublicHostedZone', {
      zoneName: 'ler.dev',
    })

    new TxtRecord(this, 'TestTxtRecord', {
      values: ['meow'],
      zone,
    })

    const publicAssetBucket = new Bucket(this, 'PublicAssetBucket', {
      bucketName: 'ler-dev-public-assets-prod',
      publicReadAccess: true,
    })

    // cert must be in us-east-1, so I created it manually
    const certificate = Certificate.fromCertificateArn(
      this,
      'Certificate',
      'arn:aws:acm:us-east-1:063257577013:certificate/05fe35b3-5051-485f-9fd8-8a1cc74e75db',
    )

    const publicAssetDistribution = new Distribution(
      this,
      'PublicAssetDistribution',
      {
        defaultBehavior: {
          origin: new S3Origin(publicAssetBucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        domainNames: ['ler.dev'],
        certificate,
      },
    )

    new ARecord(this, 'LerDevAliasRecord', {
      zone,
      target: RecordTarget.fromAlias(
        new CloudFrontTarget(publicAssetDistribution),
      ),
    })
  }

  protected allocateLogicalId(cfnElement: cdk.CfnElement): string {
    const tokens = cfnElement.logicalId.split('.')
    const id = tokens[1]
    console.debug(tokens.join('.'))

    // for auto generated s3 bucket policies
    if (tokens[2] === 'Policy') {
      return `${id}${tokens[2]}`
    }

    // for auto generated cloudfront distribution origins
    if (tokens[2].startsWith('Origin')) {
      return `${id}${tokens[2]}`
    }

    return id
  }
}
