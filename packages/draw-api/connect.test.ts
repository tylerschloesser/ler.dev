import { execSync } from 'child_process'
import { handler } from './index'

const connectionId = execSync('openssl rand -base64 12').toString('utf8').trim()

console.log({ connectionId })

const event: any = {
  requestContext: {
    connectionId,
  },
}

async function main() {
  await handler(event, null!, null!)
}

main()
