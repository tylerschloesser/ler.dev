import { Environment, Stack } from 'aws-cdk-lib'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import { IPublicHostedZone } from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'
import { CommonStackProps, DomainName, Region } from './types.js'

export interface CertificateStackProps extends CommonStackProps {
  zones: Record<DomainName, IPublicHostedZone>
  env: Omit<Required<Environment>, 'region'> & {
    region: Region.US_EAST_1
  }
}

export class CertificateStack extends Stack {
  public readonly certificates: Record<
    DomainName.LerDev | DomainName.TyLerDev | DomainName.StagingTyLerDev,
    Certificate
  >

  constructor(
    scope: Construct,
    id: string,
    { zones, ...props }: CertificateStackProps,
  ) {
    super(scope, id, props)

    const root = new Certificate(this, 'Certificate-LerDev', {
      domainName: DomainName.LerDev,
      subjectAlternativeNames: [DomainName.TyLerDev],
      validation: CertificateValidation.fromDnsMultiZone({
        [DomainName.LerDev]: zones[DomainName.LerDev],
        [DomainName.TyLerDev]: zones[DomainName.TyLerDev],
      }),
    })

    this.certificates = {
      [DomainName.LerDev]: root,
      [DomainName.TyLerDev]: root,
      [DomainName.StagingTyLerDev]: new Certificate(
        this,
        'Certificate-StagingLerDev',
        {
          domainName: DomainName.StagingTyLerDev,
          validation: CertificateValidation.fromDns(
            zones[DomainName.StagingTyLerDev],
          ),
        },
      ),
    }
  }
}
