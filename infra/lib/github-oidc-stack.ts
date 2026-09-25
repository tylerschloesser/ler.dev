import { Stack, type StackProps } from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'
import type { Construct } from 'constructs'
import { DEPLOY_ROLE_NAME, GITHUB_OIDC_PROVIDER_ARN, GITHUB_REPO } from './config.ts'

// Role assumed by GitHub Actions (push to main only). Lets CI run `cdk deploy`
// via the CDK bootstrap roles; LerDevSite grants it bucket + invalidation access.
export class GithubOidcStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    // Shared, pre-existing provider: import, never create.
    const provider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GithubProvider',
      GITHUB_OIDC_PROVIDER_ARN,
    )

    const role = new iam.Role(this, 'DeployRole', {
      roleName: DEPLOY_ROLE_NAME,
      assumedBy: new iam.OpenIdConnectPrincipal(provider, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${GITHUB_REPO}:ref:refs/heads/main`,
        },
      }),
    })

    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: ['deploy', 'file-publishing', 'lookup'].map(
          (kind) => `arn:aws:iam::${this.account}:role/cdk-hnb659fds-${kind}-role-${this.account}-${this.region}`,
        ),
      }),
    )
  }
}
