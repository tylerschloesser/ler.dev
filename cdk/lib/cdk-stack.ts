import { Stack, StackProps } from 'aws-cdk-lib'
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager'
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
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import * as path from 'path'

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
      bucketName: 'ler.dev',
      publicReadAccess: true,
    })

    const certificate = new DnsValidatedCertificate(this, 'Certificate', {
      domainName: 'ler.dev',
      subjectAlternativeNames: ['*.ler.dev'],
      hostedZone: rootZone,
      region: 'us-east-1',
    })

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

    new BucketDeployment(this, 'PublicAssetBucketDeployment', {
      sources: [Source.asset(path.join(__dirname, '../../ty/dist'))],
      destinationBucket: publicAssetBucket,
      distribution: publicAssetDistribution,
      distributionPaths: ['/index.html'],
    })

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
}
