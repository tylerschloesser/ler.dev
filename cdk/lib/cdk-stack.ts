import { CfnElement, Stack, StackProps } from 'aws-cdk-lib'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import {
  ARecord,
  PublicHostedZone,
  RecordSet,
  RecordTarget,
  RecordType,
} from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const rootZone = new PublicHostedZone(this, 'PublicHostedZone', {
      zoneName: 'ler.dev',
    })

    const tyZone = new PublicHostedZone(this, 'TyLerDevPublicHostedZone', {
      zoneName: 'ty.ler.dev',
    })

    new RecordSet(this, 'TyLerDevNsRecord', {
      recordName: tyZone.zoneName,
      recordType: RecordType.NS,
      target: RecordTarget.fromValues(...tyZone.hostedZoneNameServers!),
      zone: rootZone,
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
        defaultRootObject: 'index.html',
        domainNames: ['ler.dev', 'ty.ler.dev'],
        certificate,
      },
    )

    new ARecord(this, 'LerDevAliasRecord', {
      zone: rootZone,
      target: RecordTarget.fromAlias(
        new CloudFrontTarget(publicAssetDistribution),
      ),
    })

    new ARecord(this, 'TyLerDevAliasRecord', {
      zone: tyZone,
      target: RecordTarget.fromAlias(
        new CloudFrontTarget(publicAssetDistribution),
      ),
    })
  }

  protected allocateLogicalId(cfnElement: CfnElement): string {
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
