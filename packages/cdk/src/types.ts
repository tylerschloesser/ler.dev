import { Environment, StackProps } from 'aws-cdk-lib'

export enum Stage {
  Prod = 'prod',
  Staging = 'staging',
}

export enum Region {
  US_WEST_2 = 'us-west-2',
  US_EAST_1 = 'us-east-1',
}

export interface CommonStackProps extends StackProps {
  env: Omit<Required<Environment>, 'region'> & {
    region: Region
  }
}

export enum DomainName {
  LerDev = 'ler.dev',
  TyLerDev = 'ty.ler.dev',
  StagingTyLerDev = 'staging.ty.ler.dev',
  DrawApiTyLerDev = 'draw-api.ty.ler.dev',
  DrawApiStagingTyLerDev = 'draw-api.staging.ty.ler.dev',
}
