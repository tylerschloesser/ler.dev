import { PublicHostedZone } from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new PublicHostedZone(this, 'PublicHostedZone', {
      zoneName: 'ler.dev',
    })
  }

  protected allocateLogicalId(cfnElement: cdk.CfnElement): string {
    return cfnElement.logicalId.split('.')[1];
  }
}
