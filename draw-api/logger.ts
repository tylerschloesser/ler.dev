import winston from 'winston'

export const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.prettyPrint({
        colorize: true,
      }),
    }),
  ],
})
