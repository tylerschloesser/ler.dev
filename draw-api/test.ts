import { handler } from './index'

const event: any = {
  requestContext: {
    connectionId: 'abc123',
  },
}

async function main() {
  await handler(event, null!, null!)
}

main()
