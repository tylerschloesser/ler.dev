import winston, { format } from 'winston'

const MESSAGE = Symbol.for('message') as any

// So that multi-line logs are not split into multiple cloudwatch logs
// https://github.com/winstonjs/winston/issues/1895#issuecomment-1216079573
const replaceNewlinesWithCarriageReturns = format((info, _opts) => {
  info[MESSAGE] = info[MESSAGE].replace(/\n/g, '\r')
  return info
})

export const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.prettyPrint({
          colorize: true,
        }),
        replaceNewlinesWithCarriageReturns(),
      ),
    }),
  ],
})
