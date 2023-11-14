import { SQS } from '@aws-sdk/client-sqs'
import { DrawQueueMessage } from '@ler.dev/common'
import { SQSHandler } from 'aws-lambda'
import { logger, pretty } from './logger.js'

const sqs = new SQS({ region: 'us-west-2' })

export const handler: SQSHandler = async (event) => {
  logger.info(`event: ${pretty(event)}`)

  event.Records.forEach((record) => {
    const message = DrawQueueMessage.parse(JSON.parse(record.body))
  })

  await sqs.deleteMessageBatch({
    QueueUrl: process.env.SQS_QUEUE_URL,
    Entries: event.Records.map((record) => ({
      Id: record.messageId,
      ReceiptHandle: record.receiptHandle,
    })),
  })
  logger.info('deleted all messages')
}
