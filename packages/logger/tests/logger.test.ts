import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createLogger, logger } from '../src/index'

describe('@dot-do/logger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a logger with default options', () => {
    const log = createLogger()
    expect(log).toBeDefined()
    expect(log.debug).toBeInstanceOf(Function)
    expect(log.info).toBeInstanceOf(Function)
    expect(log.warn).toBeInstanceOf(Function)
    expect(log.error).toBeInstanceOf(Function)
  })

  it('should log info messages', () => {
    const log = createLogger({ level: 'info' })
    log.info('Test message')
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO] Test message'))
  })

  it('should include context in log output', () => {
    const log = createLogger()
    log.info('User logged in', { userId: '123', ip: '127.0.0.1' })
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('userId'))
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('127.0.0.1'))
  })

  it('should respect log level filtering', () => {
    const log = createLogger({ level: 'warn' })
    log.debug('Debug message')
    log.info('Info message')
    log.warn('Warning message')

    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Debug'))
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Info'))
  })

  it('should merge base context with message context', () => {
    const log = createLogger({ context: { service: 'api', environment: 'production' } })
    log.info('Request received', { path: '/users', method: 'GET' })

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('service'))
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('api'))
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('path'))
  })

  it('should support custom formatter', () => {
    const customFormatter = (level: string, message: string) => `CUSTOM: ${level} - ${message}`
    const log = createLogger({ formatter: customFormatter })
    log.info('Test')

    expect(consoleSpy).toHaveBeenCalledWith('CUSTOM: info - Test')
  })

  it('should export a default logger instance', () => {
    expect(logger).toBeDefined()
    logger.info('Default logger works')
    expect(consoleSpy).toHaveBeenCalled()
  })
})
