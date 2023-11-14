import { Stack, StackProps } from 'aws-cdk-lib'
import {
  IPublicHostedZone,
  PublicHostedZone,
  RecordSet,
  RecordTarget,
  RecordType,
} from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'
import invariant from 'tiny-invariant'
import { DomainName } from './types.js'

export class DnsStack extends Stack {
  readonly zones: Record<DomainName, IPublicHostedZone>

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    this.zones = {
      [DomainName.LerDev]: PublicHostedZone.fromLookup(
        this,
        'HostedZone-LerDev',
        {
          domainName: DomainName.LerDev,
        },
      ),
      [DomainName.TyLerDev]: PublicHostedZone.fromLookup(
        this,
        'HostedZone-TyLerDev',
        {
          domainName: DomainName.TyLerDev,
        },
      ),
      [DomainName.StagingTyLerDev]: new PublicHostedZone(
        this,
        'HostedZone-StagingTyLerDev',
        {
          zoneName: DomainName.StagingTyLerDev,
        },
      ),
      [DomainName.DrawApiTyLerDev]: new PublicHostedZone(
        this,
        'HostedZone-DrawApiTyLerDev',
        {
          zoneName: DomainName.DrawApiTyLerDev,
        },
      ),
      [DomainName.DrawApiStagingTyLerDev]: new PublicHostedZone(
        this,
        'HostedZone-DrawApiStagingTyLerDev',
        {
          zoneName: DomainName.DrawApiStagingTyLerDev,
        },
      ),
    }

    invariant(this.zones[DomainName.StagingTyLerDev].hostedZoneNameServers)
    new RecordSet(this, 'NsRecord-StagingTyLerDev', {
      recordName: DomainName.StagingTyLerDev,
      recordType: RecordType.NS,
      target: RecordTarget.fromValues(
        ...this.zones[DomainName.StagingTyLerDev].hostedZoneNameServers,
      ),
      zone: this.zones[DomainName.TyLerDev],
    })

    invariant(this.zones[DomainName.DrawApiTyLerDev].hostedZoneNameServers)
    new RecordSet(this, 'NsRecord-DrawApiTyLerDev', {
      recordName: DomainName.DrawApiTyLerDev,
      recordType: RecordType.NS,
      target: RecordTarget.fromValues(
        ...this.zones[DomainName.DrawApiTyLerDev].hostedZoneNameServers,
      ),
      zone: this.zones[DomainName.TyLerDev],
    })

    invariant(
      this.zones[DomainName.DrawApiStagingTyLerDev].hostedZoneNameServers,
    )
    new RecordSet(this, 'NsRecord-DrawApiStagingTyLerDev', {
      recordName: DomainName.DrawApiStagingTyLerDev,
      recordType: RecordType.NS,
      target: RecordTarget.fromValues(
        ...this.zones[DomainName.DrawApiStagingTyLerDev].hostedZoneNameServers,
      ),
      zone: this.zones[DomainName.StagingTyLerDev],
    })
  }
}
