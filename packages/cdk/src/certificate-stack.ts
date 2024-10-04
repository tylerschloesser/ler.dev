import { Stack, StackProps } from 'aws-cdk-lib'
import {
  Certificate,
  CertificateValidation,
  ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager'
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'

export class CertificateStack extends Stack {
  certificate: ICertificate
  constructor(
    scope: Construct,
    id: string,
    props?: StackProps,
  ) {
    super(scope, id, props)

    const hostedZone = PublicHostedZone.fromLookup(
      this,
      'HostedZone',
      { domainName: 'ler.dev' },
    )

    this.certificate = new Certificate(
      this,
      'Certificate',
      {
        domainName: 'ty.ler.dev',
        validation:
          CertificateValidation.fromDns(hostedZone),
      },
    )
  }
}
