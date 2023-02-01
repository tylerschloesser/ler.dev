import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Stage } from './util'

interface DrawApiStackProps extends StackProps {
  stage: Stage
}

export class DrawApiStack extends Stack {
  constructor(scope: Construct, id: string, props: DrawApiStackProps) {
    super(scope, id, props)
  }
}
