export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
}

export interface Logger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
}

export interface LoggerOptions {
  level?: LogLevel
  context?: LogContext
  formatter?: (level: LogLevel, message: string, context?: LogContext) => string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function defaultFormatter(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const contextStr = context ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const { level = 'info', context: baseContext = {}, formatter = defaultFormatter } = options

  const minLevel = LOG_LEVELS[level]

  function log(logLevel: LogLevel, message: string, context?: LogContext): void {
    if (LOG_LEVELS[logLevel] < minLevel) return

    const mergedContext = { ...baseContext, ...context }
    const formatted = formatter(logLevel, message, Object.keys(mergedContext).length > 0 ? mergedContext : undefined)

    switch (logLevel) {
      case 'debug':
      case 'info':
        console.log(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        break
    }
  }

  return {
    debug: (message, context) => log('debug', message, context),
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warn', message, context),
    error: (message, context) => log('error', message, context),
  }
}

// Default logger instance
export const logger = createLogger()
