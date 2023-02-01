import { Stack, StackProps } from 'aws-cdk-lib'
import {
  PublicHostedZone,
  RecordSet,
  RecordTarget,
  RecordType,
} from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'

export class DnsStack extends Stack {
  readonly rootZone: PublicHostedZone
  readonly tyZone: PublicHostedZone
  readonly stagingZone: PublicHostedZone

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    this.rootZone = new PublicHostedZone(this, 'PublicHostedZone', {
      zoneName: 'ler.dev',
    })

    this.tyZone = new PublicHostedZone(this, 'TyLerDevPublicHostedZone', {
      zoneName: 'ty.ler.dev',
    })

    new RecordSet(this, 'TyLerDevNsRecord', {
      recordName: this.tyZone.zoneName,
      recordType: RecordType.NS,
      target: RecordTarget.fromValues(...this.tyZone.hostedZoneNameServers!),
      zone: this.rootZone,
    })

    this.stagingZone = new PublicHostedZone(
      this,
      'StagingTyLerDevPublicHostedZone',
      {
        zoneName: 'staging.ty.ler.dev',
      },
    )

    new RecordSet(this, 'StagingTyLerDevNsRecord', {
      recordName: this.stagingZone.zoneName,
      recordType: RecordType.NS,
      target: RecordTarget.fromValues(
        ...this.stagingZone.hostedZoneNameServers!,
      ),
      zone: this.tyZone,
    })
  }
}
