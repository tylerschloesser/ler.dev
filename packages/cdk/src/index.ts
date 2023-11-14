import { App } from 'aws-cdk-lib'
import { CdnStack } from './cdn-stack.js'
import { CertificateStack } from './certificate-stack.js'
import { DnsStack } from './dns-stack.js'
import { DrawApiStack } from './draw-api-stack.js'
import { DomainName, Region, Stage } from './types.js'

const STACK_ID_PREFIX: string = 'LerDev'
const ACCOUNT_ID: string = '063257577013'

function stackId(...parts: string[]): string {
  return [STACK_ID_PREFIX, ...parts].join('-')
}

function stackProps<
  R extends Region,
  T extends { region: R },
>({ region, ...props }: T) {
  return {
    env: {
      account: ACCOUNT_ID,
      region,
    },
    crossRegionReferences: true,
    ...props,
  }
}

const app = new App()

const { zones } = new DnsStack(
  app,
  stackId('DNS'),
  stackProps({
    region: Region.US_WEST_2,
  }),
)

const { certificates } = new CertificateStack(
  app,
  stackId('Certificate'),
  stackProps({
    zones,
    region: Region.US_EAST_1,
  }),
)

new CdnStack(
  app,
  stackId('Prod', 'CDN'),
  stackProps({
    bucketName: DomainName.TyLerDev,
    hostedZones: [
      zones[DomainName.LerDev],
      zones[DomainName.TyLerDev],
    ],
    certificate: certificates[DomainName.LerDev],
    domainNames: [DomainName.LerDev, DomainName.TyLerDev],
    region: Region.US_WEST_2,
  }),
)

new CdnStack(
  app,
  stackId('Staging', 'CDN'),
  stackProps({
    bucketName: DomainName.StagingTyLerDev,
    hostedZones: [zones[DomainName.StagingTyLerDev]],
    certificate: certificates[DomainName.StagingTyLerDev],
    domainNames: [DomainName.StagingTyLerDev],
    region: Region.US_WEST_2,
  }),
)

new DrawApiStack(
  app,
  stackId('Prod', 'DrawApi'),
  stackProps({
    stage: Stage.Prod,
    domainName: DomainName.DrawApiTyLerDev,
    hostedZone: zones[DomainName.DrawApiTyLerDev],
    region: Region.US_WEST_2,
  }),
)

new DrawApiStack(
  app,
  stackId('Staging', 'DrawApi'),
  stackProps({
    stage: Stage.Staging,
    domainName: DomainName.DrawApiStagingTyLerDev,
    hostedZone: zones[DomainName.DrawApiStagingTyLerDev],
    region: Region.US_WEST_2,
  }),
)
