import {
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib'
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import {
  Distribution,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import {
  ARecord,
  PublicHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import {
  BucketDeployment,
  Source,
} from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

interface MainStackProps extends StackProps {
  certificate: ICertificate
}

export class MainStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: MainStackProps,
  ) {
    super(scope, id, props)
    const { certificate } = props

    const assetBucket = new Bucket(this, 'AssetBucket', {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    new BucketDeployment(this, 'AssetDeployment', {
      destinationBucket: assetBucket,
      sources: [
        Source.asset(
          join(
            dirname(fileURLToPath(import.meta.url)),
            '../../app/dist',
          ),
        ),
      ],
    })

    const hostedZone = PublicHostedZone.fromLookup(
      this,
      'HostedZone',
      { domainName: 'ty.ler.dev' },
    )

    const distribution = new Distribution(
      this,
      'Distribution',
      {
        defaultBehavior: {
          origin:
            S3BucketOrigin.withOriginAccessControl(
              assetBucket,
            ),
          viewerProtocolPolicy:
            ViewerProtocolPolicy.HTTPS_ONLY,
        },
        domainNames: ['ty.ler.dev'],
        certificate,
        defaultRootObject: 'index.html',
      },
    )

    new ARecord(this, 'ARecord', {
      target: RecordTarget.fromAlias(
        new CloudFrontTarget(distribution),
      ),
      zone: hostedZone,
    })
  }
}
