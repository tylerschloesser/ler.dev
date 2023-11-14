import { App } from 'aws-cdk-lib'
import { DnsStack } from './dns-stack.js'
import { DrawApiStack } from './draw-api-stack.js'
import { ProdStack } from './prod-stack.js'
import { StagingStack } from './staging-stack.js'
import { capitalize, Stage } from './util.js'

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
