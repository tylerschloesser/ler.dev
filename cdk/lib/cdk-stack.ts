import { PublicHostedZone, TxtRecord } from '@aws-cdk/aws-route53'
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

    new Bucket(this, 'PublicAssetBucket', {
      bucketName: 'ler-dev-public-assets-prod',
      publicReadAccess: true,
    })
  }

  protected allocateLogicalId(cfnElement: cdk.CfnElement): string {
    const tokens = cfnElement.logicalId.split('.')
    const id = tokens[1]

    // for auto generated s3 bucket policies
    if (tokens[2] === 'Policy') {
      return `${id}Policy`
    }

    return id
  }
}
