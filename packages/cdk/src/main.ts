import * as cdk from 'aws-cdk-lib'
import 'source-map-support/register'
import { CertificateStack } from './certificate-stack'
import { MainStack } from './main-stack'

const app = new cdk.App()
new MainStack(app, 'LerDev-Main')
new CertificateStack(app, 'LerDev-Certificate')
