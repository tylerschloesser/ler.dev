import { App } from 'aws-cdk-lib'
import 'source-map-support/register'
import { CdkStack } from '../lib/cdk-stack'

const app = new App()
new CdkStack(app, 'ler-dev-cdk')
