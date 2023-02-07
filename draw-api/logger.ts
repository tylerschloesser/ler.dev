import { MESSAGE } from 'triple-beam'
import { inspect } from 'util'
import winston, { format } from 'winston'

// So that multi-line logs are not split into multiple cloudwatch logs
// https://github.com/winstonjs/winston/issues/1895#issuecomment-1216079573
const replaceNewlinesWithCarriageReturns = format((info, _opts) => {
  let message = info[MESSAGE as any]
  if (typeof message === 'string') {
    message = message.replace(/\n/g, '\r')
    info[MESSAGE as any] = message
  }
  return info
})

export function pretty(obj: any) {
  return inspect(obj, {
    depth: 4,
    colors: true,
    compact: 0,
  })
}

export const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.simple(),
        replaceNewlinesWithCarriageReturns(),
      ),
    }),
  ],
})
