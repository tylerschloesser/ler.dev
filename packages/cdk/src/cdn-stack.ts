import { Stack } from 'aws-cdk-lib'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import {
  Distribution,
  FunctionEventType,
  OriginAccessIdentity,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import {
  ARecord,
  IPublicHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import { camelCase, upperCase } from 'lodash-es'
import { DefaultToIndexHtmlFunction } from './default-to-index-html-function.js'
import { CommonStackProps } from './types.js'
import {
  WEBPACK_MANIFEST_FILE_NAME,
  getDefaultRootObject,
  getWebpackDistPath,
} from './webpack-manifest.js'

export interface CdnStackProps extends CommonStackProps {
  certificate: Certificate
  hostedZones: IPublicHostedZone[]
  bucketName: string
  domainNames: string[]
}

export class CdnStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    {
      certificate,
      hostedZones,
      bucketName,
      domainNames,
      ...props
    }: CdnStackProps,
  ) {
    super(scope, id, props)

    const bucket = new Bucket(this, 'Bucket', {
      bucketName,
    })

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity',
    )

    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            function: new DefaultToIndexHtmlFunction(
              this,
              'DefaultToIndexHtmlFunction',
            ),
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
        responseHeadersPolicy: new ResponseHeadersPolicy(
          this,
          'ResponseHeadersPolicy',
          {
            customHeadersBehavior: {
              customHeaders: [
                {
                  header: 'Cross-Origin-Opener-Policy',
                  value: 'same-origin',
                  override: false,
                },
                {
                  header: 'Cross-Origin-Embedder-Policy',
                  value: 'require-corp',
                  override: false,
                },
              ],
            },
          },
        ),
      },
      defaultRootObject: getDefaultRootObject(),
      domainNames,
      certificate,
    })

    new BucketDeployment(this, 'BucketDeployment', {
      sources: [
        Source.asset(getWebpackDistPath(), {
          exclude: [WEBPACK_MANIFEST_FILE_NAME],
        }),
      ],
      destinationBucket: bucket,
      prune: true,
    })

    for (const zone of hostedZones) {
      const id = `ARecord-${upperCase(camelCase(zone.zoneName))}`
      new ARecord(this, id, {
        zone,
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      })
    }
  }
}
