import * as cdk from 'aws-cdk-lib'
import 'source-map-support/register'
import { CertificateStack } from './certificate-stack'
import { MainStack } from './main-stack'

const app = new cdk.App()

new CertificateStack(app, 'LerDev-Certificate', {
  env: {
    region: 'us-east-1',
  },
  crossRegionReferences: true,
})

new MainStack(app, 'LerDev-Main', {
  crossRegionReferences: true,
  env: {
    region: 'us-west-2',
  },
})
