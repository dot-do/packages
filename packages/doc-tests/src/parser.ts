/**
 * Parse assertion comments from code blocks
 */

import type { Assertion } from './types'

const ASSERTION_PATTERNS = {
  // Matches: // => result.length > 0
  expression: /^\/\/\s*=>\s*(.+)$/,

  // Matches: // => { id: string, name: 'John' }
  shape: /^\/\/\s*=>\s*\{(.+)\}$/,

  // Matches: // expect: result.length > 0
  expect: /^\/\/\s*expect:\s*(.+)$/,

  // Matches: // type: string
  type: /^\/\/\s*type:\s*(.+)$/,
}

/**
 * Parse assertions from code string
 */
export function parseAssertions(code: string): Assertion[] {
  const lines = code.split('\n')
  const assertions: Assertion[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines and non-comment lines
    if (!line.startsWith('//')) {
      continue
    }

    // Try to match assertion patterns
    const assertion = parseAssertionLine(line, i + 1)
    if (assertion) {
      assertions.push(assertion)
    }
  }

  return assertions
}

/**
 * Parse a single assertion line
 */
function parseAssertionLine(line: string, lineNumber: number): Assertion | null {
  // Expression assertion: // => result.length > 0
  const expressionMatch = ASSERTION_PATTERNS.expression.exec(line)
  if (expressionMatch) {
    return {
      line: lineNumber,
      type: 'expression',
      expression: expressionMatch[1].trim(),
    }
  }

  // Shape assertion: // => { id: string, name: 'John' }
  const shapeMatch = ASSERTION_PATTERNS.shape.exec(line)
  if (shapeMatch) {
    const shapeStr = `{${shapeMatch[1]}}`
    return {
      line: lineNumber,
      type: 'shape',
      expression: shapeStr,
      shape: parseShape(shapeStr),
    }
  }

  // Expect assertion: // expect: result.length > 0
  const expectMatch = ASSERTION_PATTERNS.expect.exec(line)
  if (expectMatch) {
    return {
      line: lineNumber,
      type: 'expression',
      expression: expectMatch[1].trim(),
    }
  }

  // Type assertion: // type: string
  const typeMatch = ASSERTION_PATTERNS.type.exec(line)
  if (typeMatch) {
    return {
      line: lineNumber,
      type: 'type',
      expression: typeMatch[1].trim(),
    }
  }

  return null
}

/**
 * Parse object shape from string
 * e.g., "{ id: string, name: 'John', age: number }"
 */
function parseShape(shapeStr: string): Record<string, unknown> {
  try {
    // Remove comments and whitespace
    const cleaned = shapeStr.replace(/\/\/.*$/gm, '').trim()

    // Simple parser for shape syntax
    // This is a basic implementation - could be improved with a proper parser
    const shape: Record<string, unknown> = {}

    // Remove outer braces
    const content = cleaned.slice(1, -1).trim()

    // Split by commas (not in nested objects)
    const pairs = splitByComma(content)

    for (const pair of pairs) {
      const colonIndex = pair.indexOf(':')
      if (colonIndex === -1) continue

      const key = pair.slice(0, colonIndex).trim()
      const value = pair.slice(colonIndex + 1).trim()

      shape[key] = parseValue(value)
    }

    return shape
  } catch (error) {
    console.warn(`Failed to parse shape: ${shapeStr}`, error)
    return {}
  }
}

/**
 * Split string by comma, ignoring commas in nested objects/arrays
 */
function splitByComma(str: string): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0

  for (let i = 0; i < str.length; i++) {
    const char = str[i]

    if (char === '{' || char === '[') {
      depth++
    } else if (char === '}' || char === ']') {
      depth--
    } else if (char === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  if (current.trim()) {
    parts.push(current.trim())
  }

  return parts
}

/**
 * Parse a value from shape definition
 */
function parseValue(value: string): unknown {
  // String literal
  if (value.startsWith("'") || value.startsWith('"')) {
    return value.slice(1, -1)
  }

  // Number
  if (!isNaN(Number(value))) {
    return Number(value)
  }

  // Boolean
  if (value === 'true') return true
  if (value === 'false') return false

  // null/undefined
  if (value === 'null') return null
  if (value === 'undefined') return undefined

  // Type annotation (string, number, etc)
  // Return as-is for type checking
  return value
}

/**
 * Validate an assertion result
 */
export function validateAssertion(assertion: Assertion, context: Record<string, unknown>): boolean {
  try {
    switch (assertion.type) {
      case 'expression': {
        // Evaluate expression in context
        const result = evaluateExpression(assertion.expression, context)
        return !!result
      }

      case 'shape': {
        // Validate object shape
        const actual = extractValueFromContext(assertion.expression, context)
        return validateShape(actual, assertion.shape!)
      }

      case 'type': {
        // Validate type
        const actual = extractValueFromContext(assertion.expression, context)
        return validateType(actual, assertion.expression)
      }

      default:
        return false
    }
  } catch (error) {
    console.warn(`Assertion validation failed:`, assertion, error)
    return false
  }
}

/**
 * Evaluate JavaScript expression safely
 */
function evaluateExpression(expression: string, context: Record<string, unknown>): unknown {
  // Create function with context variables
  const contextKeys = Object.keys(context)
  const contextValues = Object.values(context)

  try {
    const func = new Function(...contextKeys, `return ${expression}`)
    return func(...contextValues)
  } catch (error) {
    throw new Error(`Failed to evaluate expression: ${expression}`)
  }
}

/**
 * Extract value from context using expression
 */
function extractValueFromContext(expression: string, context: Record<string, unknown>): unknown {
  // Simple property access (e.g., "result.data")
  const parts = expression.split('.')
  let value: any = context

  for (const part of parts) {
    if (value === null || value === undefined) return undefined
    value = value[part]
  }

  return value
}

/**
 * Validate object matches shape
 */
function validateShape(actual: unknown, shape: Record<string, unknown>): boolean {
  if (typeof actual !== 'object' || actual === null) {
    return false
  }

  const obj = actual as Record<string, unknown>

  for (const [key, expectedType] of Object.entries(shape)) {
    const actualValue = obj[key]

    // Type check
    if (typeof expectedType === 'string') {
      if (expectedType === 'string' && typeof actualValue !== 'string') return false
      if (expectedType === 'number' && typeof actualValue !== 'number') return false
      if (expectedType === 'boolean' && typeof actualValue !== 'boolean') return false
      if (expectedType === 'Date' && !(actualValue instanceof Date)) return false
      continue
    }

    // Value check
    if (actualValue !== expectedType) {
      return false
    }
  }

  return true
}

/**
 * Validate value matches type
 */
function validateType(actual: unknown, expectedType: string): boolean {
  const actualType = typeof actual

  if (expectedType === 'string') return actualType === 'string'
  if (expectedType === 'number') return actualType === 'number'
  if (expectedType === 'boolean') return actualType === 'boolean'
  if (expectedType === 'object') return actualType === 'object' && actual !== null
  if (expectedType === 'array') return Array.isArray(actual)
  if (expectedType === 'Date') return actual instanceof Date
  if (expectedType === 'null') return actual === null
  if (expectedType === 'undefined') return actual === undefined

  return false
}
