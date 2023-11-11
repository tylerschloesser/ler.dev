import { App } from 'aws-cdk-lib'
import 'source-map-support/register'
import { DnsStack } from '../lib/dns-stack'
import { DrawApiStack } from '../lib/draw-api-stack'
import { ProdStack } from '../lib/prod-stack'
import { StagingStack } from '../lib/staging-stack'
import { capitalize, Stage } from '../lib/util'

const app = new App()
const dnsStack = new DnsStack(app, 'LerDevDns')
const { rootZone, tyZone, stagingZone, prodDrawApiZone, stagingDrawApiZone } =
  dnsStack
new ProdStack(app, 'LerDev', { rootZone, tyZone })
new StagingStack(app, 'StagingTyLerDev', { stagingZone })

Object.values(Stage).forEach((stage) => {
  new DrawApiStack(app, `${capitalize(stage)}DrawApi`, {
    stage,
    prodDrawApiZone,
    stagingDrawApiZone,
  })
})