import { resolve } from 'node:path'

import { createLogger, format, transports } from 'winston'

import { getOrCreateUserSubDir } from './utils/system'

const logsDir = import.meta.env.MODE === 'production'
  ? getOrCreateUserSubDir('logs')
  : resolve(process.cwd(), 'logs')

const resolveByLogs = (...paths: string[]) => {
  const now = new Date()
  return resolve(
    logsDir,
    `${
      now
        .toLocaleDateString()
        .replaceAll('/', '-')
    } ${now.getHours()}`,
    ...paths
  )
}

export const logger = createLogger({
  level: 'info',
  format: format.json(),
  defaultMeta: {
    env: import.meta.env.MODE,
    version: import.meta.env.VITE_APP_VERSION
  },
  transports: [
    new transports.File({
      filename: resolveByLogs('error.log'),
      level: 'error'
    }),
    new transports.File({
      filename: resolveByLogs('warn.log'),
      level: 'warn'
    }),
    new transports.File({ filename: 'combined.log' })
  ]
})

if (import.meta.env.MODE !== 'production') {
  logger.add(new transports.Console({ format: format.simple() }))
}
