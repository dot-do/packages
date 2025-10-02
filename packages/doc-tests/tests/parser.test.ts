import { describe, it, expect } from 'vitest'
import { parseAssertions } from '../src/parser'

describe('parser', () => {
  it('should parse expression assertions', () => {
    const code = `
const result = 10
// => result > 5
// => result === 10
    `

    const assertions = parseAssertions(code)

    expect(assertions).toHaveLength(2)
    expect(assertions[0].type).toBe('expression')
    expect(assertions[0].expression).toBe('result > 5')
    expect(assertions[1].expression).toBe('result === 10')
  })

  it('should parse shape assertions', () => {
    const code = `
const user = { id: 1, name: 'John' }
// => { id: number, name: string }
    `

    const assertions = parseAssertions(code)

    expect(assertions).toHaveLength(1)
    expect(assertions[0].type).toBe('shape')
    expect(assertions[0].shape).toBeDefined()
  })

  it('should parse expect: syntax', () => {
    const code = `
const value = true
// expect: value === true
    `

    const assertions = parseAssertions(code)

    expect(assertions).toHaveLength(1)
    expect(assertions[0].type).toBe('expression')
    expect(assertions[0].expression).toBe('value === true')
  })

  it('should parse type assertions', () => {
    const code = `
const text = "hello"
// type: string
    `

    const assertions = parseAssertions(code)

    expect(assertions).toHaveLength(1)
    expect(assertions[0].type).toBe('type')
    expect(assertions[0].expression).toBe('string')
  })

  it('should ignore non-assertion comments', () => {
    const code = `
const x = 1
// This is a regular comment
/* Block comment */
// => x === 1
    `

    const assertions = parseAssertions(code)

    expect(assertions).toHaveLength(1)
    expect(assertions[0].expression).toBe('x === 1')
  })
})
