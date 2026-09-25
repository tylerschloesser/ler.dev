import { CfnOutput, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as rum from 'aws-cdk-lib/aws-rum'
import * as s3 from 'aws-cdk-lib/aws-s3'
import type { Construct } from 'constructs'
import {
  APEX_DOMAIN,
  APEX_ZONE_ID,
  APP_MONITOR_NAME,
  DEPLOY_ROLE_NAME,
  SITE_DOMAIN,
  SITE_ZONE_ID,
} from './config.ts'

// Viewer-request function:
// - apex (ler.dev) → 301 to https://ty.ler.dev, preserving path + query
// - paths whose last segment has no extension → /index.html (SPA routing)
const viewerRequestCode = `
function handler(event) {
  var request = event.request
  var host = request.headers.host && request.headers.host.value
  if (host === '${APEX_DOMAIN}') {
    var parts = []
    var qs = request.querystring
    for (var key in qs) {
      var entry = qs[key]
      var values = entry.multiValue ? entry.multiValue : [entry]
      for (var i = 0; i < values.length; i++) {
        parts.push(values[i].value === '' ? key : key + '=' + values[i].value)
      }
    }
    var location = 'https://${SITE_DOMAIN}' + request.uri + (parts.length ? '?' + parts.join('&') : '')
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: location } },
    }
  }
  var last = request.uri.substring(request.uri.lastIndexOf('/') + 1)
  if (last.indexOf('.') === -1) {
    request.uri = '/index.html'
  }
  return request
}
`

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    const apexZone = route53.HostedZone.fromHostedZoneAttributes(this, 'ApexZone', {
      hostedZoneId: APEX_ZONE_ID,
      zoneName: APEX_DOMAIN,
    })
    const siteZone = route53.HostedZone.fromHostedZoneAttributes(this, 'SiteZone', {
      hostedZoneId: SITE_ZONE_ID,
      zoneName: SITE_DOMAIN,
    })

    const bucket = new s3.Bucket(this, 'Bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: SITE_DOMAIN,
      subjectAlternativeNames: [APEX_DOMAIN],
      validation: acm.CertificateValidation.fromDnsMultiZone({
        [SITE_DOMAIN]: siteZone,
        [APEX_DOMAIN]: apexZone,
      }),
    })

    const viewerRequest = new cloudfront.Function(this, 'ViewerRequest', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromInline(viewerRequestCode),
    })

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      domainNames: [SITE_DOMAIN, APEX_DOMAIN],
      certificate,
      defaultRootObject: 'index.html',
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        functionAssociations: [
          { function: viewerRequest, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
        ],
      },
    })

    const target = route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    for (const [id, zone] of [
      ['Site', siteZone],
      ['Apex', apexZone],
    ] as const) {
      new route53.ARecord(this, `${id}A`, { zone, target })
      new route53.AaaaRecord(this, `${id}Aaaa`, { zone, target })
    }

    const appMonitorArn = `arn:aws:rum:${this.region}:${this.account}:appmonitor/${APP_MONITOR_NAME}`
    const appMonitor = new rum.CfnAppMonitor(this, 'AppMonitor', {
      name: APP_MONITOR_NAME,
      domain: SITE_DOMAIN,
      cwLogEnabled: false,
      appMonitorConfiguration: {
        allowCookies: true,
        enableXRay: false,
        sessionSampleRate: 1,
        telemetries: ['errors', 'performance', 'http'],
      },
      // Unauthenticated ingestion (no Cognito); the web client uses `signing: false`.
      resourcePolicy: {
        policyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: 'rum:PutRumEvents',
              Resource: appMonitorArn,
            },
          ],
        }),
      },
    })

    // Created by LerDevGithubOidc.
    const deployRole = iam.Role.fromRoleName(this, 'DeployRole', DEPLOY_ROLE_NAME)
    bucket.grantReadWrite(deployRole)
    bucket.grantDelete(deployRole)
    distribution.grantCreateInvalidation(deployRole)
    deployRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ['cloudfront:GetInvalidation'],
        resources: [distribution.distributionArn],
      }),
    )

    new CfnOutput(this, 'BucketName', { value: bucket.bucketName })
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId })
    new CfnOutput(this, 'AppMonitorId', { value: appMonitor.attrId })
  }
}
