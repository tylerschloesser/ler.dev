import {
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import {
  BucketDeployment,
  Source,
} from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export class MainStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: StackProps,
  ) {
    super(scope, id, props)

    const assetBucket = new Bucket(this, 'AssetBucket', {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    new BucketDeployment(this, 'AssetDeployment', {
      destinationBucket: assetBucket,
      sources: [
        Source.asset(
          join(
            dirname(fileURLToPath(import.meta.url)),
            '../../app/dist',
          ),
        ),
      ],
    })
  }
}
