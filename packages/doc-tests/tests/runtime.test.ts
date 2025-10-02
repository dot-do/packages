import { describe, it, expect } from 'vitest'
import { createRuntime, linkEventSystem } from '../src/runtime'

describe('runtime', () => {
  describe('ai runtime', () => {
    it('should provide AI template functions', async () => {
      const runtime = createRuntime()

      const ideas = await runtime.ai.brainstormIdeas('test')
      expect(Array.isArray(ideas)).toBe(true)
      expect(ideas.length).toBeGreaterThan(0)
    })

    it('should provide embedding function', async () => {
      const runtime = createRuntime()

      const embedding = await runtime.ai.embed('hello world')
      expect(Array.isArray(embedding)).toBe(true)
      expect(embedding.length).toBe(768)
      expect(embedding.every((n) => typeof n === 'number')).toBe(true)
    })

    it('should support custom AI mocks', async () => {
      const runtime = createRuntime({
        ai: {
          customFunc: async () => 'custom result',
        },
      })

      const result = await runtime.ai.customFunc()
      expect(result).toBe('custom result')
    })
  })

  describe('db runtime', () => {
    it('should create and retrieve records', async () => {
      const runtime = createRuntime()

      const created = await runtime.db.users.create({
        name: 'John',
        email: 'john@example.com',
      })

      expect(created.id).toBeDefined()
      expect(created.name).toBe('John')

      const retrieved = await runtime.db.users.get(created.id as string)
      expect(retrieved).toEqual(created)
    })

    it('should update records', async () => {
      const runtime = createRuntime()

      const created = await runtime.db.users.create({ name: 'John' })
      const updated = await runtime.db.users.update(created.id as string, { name: 'Jane' })

      expect(updated.name).toBe('Jane')
      expect(updated.id).toBe(created.id)
    })

    it('should list records', async () => {
      const runtime = createRuntime()

      await runtime.db.users.create({ name: 'User 1' })
      await runtime.db.users.create({ name: 'User 2' })
      await runtime.db.users.create({ name: 'User 3' })

      const users = await runtime.db.users.list()
      expect(users.length).toBe(3)
    })

    it('should search records', async () => {
      const runtime = createRuntime()

      await runtime.db.users.create({ name: 'Alice', city: 'NYC' })
      await runtime.db.users.create({ name: 'Bob', city: 'LA' })

      const results = await runtime.db.users.search('NYC')
      expect(results.length).toBe(1)
      expect(results[0].name).toBe('Alice')
    })
  })

  describe('event system', () => {
    it('should register and send events', async () => {
      const runtime = createRuntime()
      linkEventSystem(runtime)

      let called = false
      let receivedData = null

      runtime.on('test.event', (data) => {
        called = true
        receivedData = data
        return { success: true }
      })

      const result = await runtime.send('test.event', { message: 'hello' })

      expect(called).toBe(true)
      expect(receivedData).toEqual({ message: 'hello' })
      expect(result.results[0]).toEqual({ success: true })
    })

    it('should handle multiple event handlers', async () => {
      const runtime = createRuntime()
      linkEventSystem(runtime)

      const calls: number[] = []

      runtime.on('multi.event', () => {
        calls.push(1)
        return 'first'
      })

      runtime.on('multi.event', () => {
        calls.push(2)
        return 'second'
      })

      const result = await runtime.send('multi.event')

      expect(calls).toEqual([1, 2])
      expect(result.results).toEqual(['first', 'second'])
    })
  })

  describe('scheduled tasks', () => {
    it('should register scheduled tasks', () => {
      const runtime = createRuntime()

      let called = false

      runtime.every('1 hour', () => {
        called = true
      })

      const schedules = (runtime.every as any).schedules
      expect(schedules.size).toBe(1)
      expect(schedules.has('1 hour')).toBe(true)
    })
  })
})
