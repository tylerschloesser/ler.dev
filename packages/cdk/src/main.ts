import * as cdk from 'aws-cdk-lib'
import 'source-map-support/register'
import { CertificateStack } from './certificate-stack.js'
import { MainStack } from './main-stack.js'

const app = new cdk.App()

const ACCOUNT_ID = '063257577013'

const { certificate } = new CertificateStack(
  app,
  'LerDev-Certificate',
  {
    env: { region: 'us-east-1', account: ACCOUNT_ID },
    crossRegionReferences: true,
  },
)

new MainStack(app, 'LerDev-Main', {
  crossRegionReferences: true,
  env: { region: 'us-west-2', account: ACCOUNT_ID },
  certificate,
})
