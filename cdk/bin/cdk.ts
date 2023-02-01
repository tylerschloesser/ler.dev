import { App } from 'aws-cdk-lib'
import 'source-map-support/register'
import { DnsStack } from '../lib/dns-stack'
import { ProdStack } from '../lib/prod-stack'
import { StagingStack } from '../lib/staging-stack'

const app = new App()
const dnsStack = new DnsStack(app, 'LerDevDns')
const { rootZone, tyZone, stagingZone } = dnsStack
new ProdStack(app, 'LerDev', { rootZone, tyZone })
new StagingStack(app, 'StagingTyLerDev', { stagingZone })
