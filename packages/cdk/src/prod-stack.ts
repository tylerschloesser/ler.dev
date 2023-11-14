import { Stack, StackProps } from 'aws-cdk-lib'
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager'
import {
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import {
  ARecord,
  PublicHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import { getAssetPath, getDefaultRootObject } from './util.js'

interface ProdStackProps extends StackProps {
  rootZone: PublicHostedZone
  tyZone: PublicHostedZone
}

export class ProdStack extends Stack {
  constructor(scope: Construct, id: string, props: ProdStackProps) {
    super(scope, id, props)
    const { rootZone, tyZone } = props

    const bucket = new Bucket(this, 'Bucket', {
      bucketName: 'ler.dev',
    })

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity',
    )

    const certificate = new DnsValidatedCertificate(this, 'Certificate', {
      domainName: 'ler.dev',
      subjectAlternativeNames: ['*.ler.dev'],
      hostedZone: rootZone,
      region: 'us-east-1',
    })

    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: getDefaultRootObject(),
      domainNames: ['ler.dev', 'ty.ler.dev'],
      certificate,
      errorResponses: [
        {
          // HACK support paths by converting S3 403s to 200s
          // and always serving the root index.html
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: `/${getDefaultRootObject()}`,
        },
      ],
    })

    new BucketDeployment(this, 'BucketDeployment', {
      sources: [
        Source.asset(getAssetPath(), {
          exclude: ['manifest.json'],
        }),
      ],
      destinationBucket: bucket,
    })

    new ARecord(this, 'LerDevAliasRecord', {
      zone: rootZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    })

    new ARecord(this, 'TyLerDevAliasRecord', {
      zone: tyZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    })
  }
}
