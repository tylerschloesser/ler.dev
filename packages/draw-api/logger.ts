import { MESSAGE } from 'triple-beam'
import { inspect } from 'util'
import winston, { format } from 'winston'

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
      log(info, next) {
        // fixes newlines in cloudwatch
        console.log(info[MESSAGE as any])
        next()
      },
      format: format.combine(format.simple()),
    }),
  ],
})
