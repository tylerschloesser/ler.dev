import { SQS } from '@aws-sdk/client-sqs'
import { SQSHandler } from 'aws-lambda'
import { logger } from './logger'

const sqs = new SQS({ region: 'us-west-2' })

export const handler: SQSHandler = async (event) => {
  logger.info(event)
  await sqs.deleteMessageBatch({
    QueueUrl: process.env.SQS_QUEUE_URL,
    Entries: event.Records.map((record) => ({
      Id: record.messageId,
      ReceiptHandle: record.receiptHandle,
    })),
  })
  logger.info('deleted all messages')
}
