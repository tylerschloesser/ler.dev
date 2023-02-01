import { App } from 'aws-cdk-lib'
import 'source-map-support/register'
import { ProdStack } from '../lib/prod-stack'

const app = new App()
new ProdStack(app, 'LerDev')
