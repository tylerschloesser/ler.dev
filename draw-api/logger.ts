import { MESSAGE } from 'triple-beam'
import winston, { format } from 'winston'

// So that multi-line logs are not split into multiple cloudwatch logs
// https://github.com/winstonjs/winston/issues/1895#issuecomment-1216079573
const replaceNewlinesWithCarriageReturns = format((info, _opts) => {
  console.log('replacing?')
  info[MESSAGE as any] = info[MESSAGE as any].replace(/\n/g, '\r')
  console.log(MESSAGE, JSON.stringify(info))
  return info
})

export const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      // log(info, callback) {
      //   console.log((MESSAGE as any)[info])
      //   callback()
      // },
      format: format.combine(
        format.prettyPrint({
          colorize: true,
        }),
        replaceNewlinesWithCarriageReturns(),
      ),
    }),
  ],
})
