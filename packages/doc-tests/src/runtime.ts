/**
 * Mock runtime environment for testing documentation code
 */

import type {
  Runtime,
  AIRuntime,
  DBRuntime,
  OnFunction,
  SendFunction,
  EveryFunction,
  APIRuntime,
  EventHandler,
  ScheduledHandler,
} from './types'

/**
 * Create a sandboxed runtime environment with mocks
 */
export function createRuntime(customMocks: Partial<Runtime> = {}): Runtime {
  const runtime: Runtime = {
    ai: createAIRuntime(customMocks.ai),
    db: createDBRuntime(customMocks.db),
    on: createOnFunction(),
    send: createSendFunction(),
    every: createEveryFunction(),
    api: customMocks.api || createAPIRuntime(),
  }

  return runtime
}

/**
 * Create mock AI runtime
 */
function createAIRuntime(custom: Partial<AIRuntime> = {}): AIRuntime {
  const defaultMocks: AIRuntime = {
    // Brainstorm ideas
    brainstormIdeas: async (prompt: string) => {
      return Array.from({ length: 10 }, (_, i) => `Idea ${i + 1}: ${prompt}`)
    },

    // Define lean canvas
    defineLeanCanvas: async (data: any) => {
      return {
        productName: data.productName || 'Product',
        problem: ['Problem 1', 'Problem 2', 'Problem 3'],
        solution: ['Solution 1', 'Solution 2', 'Solution 3'],
        uniqueValueProposition: 'Unique value proposition',
        unfairAdvantage: 'Unfair advantage',
        customerSegments: ['Segment 1', 'Segment 2'],
        keyMetrics: ['Metric 1', 'Metric 2'],
        channels: ['Channel 1', 'Channel 2'],
        costStructure: ['Cost 1', 'Cost 2'],
        revenueStreams: ['Revenue 1', 'Revenue 2'],
      }
    },

    // Research
    research: async (query: any) => {
      return `Research results for: ${JSON.stringify(query)}`
    },

    // Extract data
    extract: async (content: string, schema: any) => {
      return { extracted: true, content, schema }
    },

    // Generate text
    generate: async (prompt: string) => {
      return `Generated response for: ${prompt}`
    },

    // Generate embedding
    embed: async (text: string) => {
      // Return mock 768-dimensional embedding
      return Array.from({ length: 768 }, () => Math.random())
    },

    // Custom AI functions
    ...custom,
  }

  return new Proxy(defaultMocks, {
    get(target, prop: string) {
      if (prop in target) {
        return target[prop]
      }

      // Return generic mock for unknown AI functions
      return async (...args: any[]) => {
        return { function: prop, args, result: 'mock response' }
      }
    },
  })
}

/**
 * Create mock database runtime
 */
function createDBRuntime(custom: Record<string, any> = {}): DBRuntime {
  // In-memory database storage
  const store = new Map<string, Map<string, Record<string, unknown>>>()

  const createTableOperations = (tableName: string) => ({
    create: async (data: Record<string, unknown>) => {
      if (!store.has(tableName)) {
        store.set(tableName, new Map())
      }

      const table = store.get(tableName)!
      const id = data.id as string || `${tableName}-${Date.now()}`
      const record = {
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      table.set(id, record)
      return record
    },

    get: async (id: string) => {
      const table = store.get(tableName)
      return table?.get(id) || null
    },

    update: async (id: string, data: Record<string, unknown>) => {
      const table = store.get(tableName)
      const existing = table?.get(id)

      if (!existing) {
        throw new Error(`Record ${id} not found in ${tableName}`)
      }

      const updated = {
        ...existing,
        ...data,
        id,
        updatedAt: new Date(),
      }

      table!.set(id, updated)
      return updated
    },

    delete: async (id: string) => {
      const table = store.get(tableName)
      return table?.delete(id) || false
    },

    list: async (options: { limit?: number; offset?: number } = {}) => {
      const table = store.get(tableName)
      if (!table) return []

      const records = Array.from(table.values())
      const offset = options.offset || 0
      const limit = options.limit || records.length

      return records.slice(offset, offset + limit)
    },

    search: async (query: string) => {
      const table = store.get(tableName)
      if (!table) return []

      // Simple search implementation
      return Array.from(table.values()).filter((record) => {
        return JSON.stringify(record).toLowerCase().includes(query.toLowerCase())
      })
    },
  })

  return new Proxy({} as DBRuntime, {
    get(target, tableName: string) {
      // Return custom table operations if provided
      if (custom[tableName]) {
        return custom[tableName]
      }

      // Return mock table operations
      return createTableOperations(tableName)
    },
  })
}

/**
 * Create mock event registration function
 */
function createOnFunction(): OnFunction {
  const handlers = new Map<string, EventHandler[]>()

  const on: OnFunction = (event: string, handler: EventHandler) => {
    if (!handlers.has(event)) {
      handlers.set(event, [])
    }
    handlers.get(event)!.push(handler)
  }

  // Attach handlers map for testing
  ;(on as any).handlers = handlers

  return on
}

/**
 * Create mock event send function
 */
function createSendFunction(): SendFunction {
  const send: SendFunction = async (event: string, data?: any) => {
    // Get handlers for this event (from on function)
    const onFunc = (send as any).onFunc as OnFunction
    const handlers = (onFunc as any).handlers?.get(event) || []

    const results: any[] = []
    const context: Record<string, unknown> = {}

    for (const handler of handlers) {
      try {
        const result = await handler(data, context)
        results.push(result)
      } catch (error) {
        results.push({ error: error instanceof Error ? error.message : String(error) })
      }
    }

    return { results, context }
  }

  return send
}

/**
 * Create mock scheduled task function
 */
function createEveryFunction(): EveryFunction {
  const schedules = new Map<string, ScheduledHandler>()

  const every: EveryFunction = (schedule: string, handler: ScheduledHandler) => {
    schedules.set(schedule, handler)
  }

  // Attach schedules map for testing
  ;(every as any).schedules = schedules

  return every
}

/**
 * Create mock API runtime
 */
function createAPIRuntime(): APIRuntime {
  return {
    get: async (url: string, options?: RequestInit) => {
      return new Response(JSON.stringify({ method: 'GET', url, options }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    },

    post: async (url: string, body?: any, options?: RequestInit) => {
      return new Response(JSON.stringify({ method: 'POST', url, body, options }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    },

    put: async (url: string, body?: any, options?: RequestInit) => {
      return new Response(JSON.stringify({ method: 'PUT', url, body, options }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    },

    delete: async (url: string, options?: RequestInit) => {
      return new Response(JSON.stringify({ method: 'DELETE', url, options }), {
        status: 204,
        headers: { 'Content-Type': 'application/json' },
      })
    },
  }
}

/**
 * Link send and on functions (needed for event system to work)
 */
export function linkEventSystem(runtime: Runtime): void {
  ;(runtime.send as any).onFunc = runtime.on
}
