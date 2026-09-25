import { App } from 'aws-cdk-lib'
import { ACCOUNT, REGION } from '../lib/config.ts'
import { GithubOidcStack } from '../lib/github-oidc-stack.ts'
import { SiteStack } from '../lib/site-stack.ts'

const app = new App()
const env = { account: ACCOUNT, region: REGION }

new GithubOidcStack(app, 'LerDevGithubOidc', { env })
new SiteStack(app, 'LerDevSite', { env })
