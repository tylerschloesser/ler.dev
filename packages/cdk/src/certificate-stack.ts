import { Stack, StackProps } from 'aws-cdk-lib'
import {
  Certificate,
  CertificateValidation,
  ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager'
import { Construct } from 'constructs'

export class CertificateStack extends Stack {
  certificate: ICertificate
  constructor(
    scope: Construct,
    id: string,
    props?: StackProps,
  ) {
    super(scope, id, props)
    this.certificate = new Certificate(
      this,
      'Certificate',
      {
        domainName: 'ty.ler.dev',
        validation: CertificateValidation.fromDns(),
      },
    )
  }
}
