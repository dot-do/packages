---
name: api.sb
version: 0.1.2
description: API SDK for AI, communications, payments, enrichment, and more
license: MIT
repository: "https://github.com/dotdo-io/api.sb"
homepage: "https://api.sb"
keywords:
  - api
  - ai
  - payments
  - communications
  - enrichment
  - sdk
  - typescript
downloads:
  monthly: 35
published: "2025-12-17T19:45:41.175Z"
updated: "2025-12-17T21:38:32.322Z"
---

# `api.sb` StartupBuilder API

TypeScript client and schemas for the db.sb API - AI generation, communications, enrichment, payments, compute, and more.

## Installation

```bash
npm install api.sb
# or
pnpm add api.sb
```

## CLI

The `api.sb` package includes a powerful CLI for quick access to all API features.

### Authentication

```bash
# Login with OAuth (opens browser)
npx api.sb login

# Logout
npx api.sb logout
```

### AI Commands

```bash
# Generate text
npx api.sb generate "Describe a startup idea for AI productivity"

# Generate a list
npx api.sb list "Top 5 programming languages for 2025"

# Write long-form content
npx api.sb write "Write a blog post about machine learning"
```

### Web Scraping

```bash
# Scrape a webpage
npx api.sb scrape https://example.com

# Take a screenshot
npx api.sb screenshot https://example.com

# Extract structured data
npx api.sb extract https://example.com '{"title": "string", "price": "number"}'
```

### Enrichment

```bash
# Search for people
npx api.sb search-people "Elon Musk"

# Search for companies
npx api.sb search-companies "SpaceX"

# Enrich person by email
npx api.sb enrich-person elon@tesla.com

# Enrich company by domain
npx api.sb enrich-company spacex.com
```

### Domains

```bash
# Check domain availability
npx api.sb check-domain startup.io
```

### Other Commands

```bash
# Check API health
npx api.sb health

# Get JSON output (add --json to any command)
npx api.sb generate "Hello world" --json

# Show help
npx api.sb --help
```

### Environment Variables

```bash
# Custom API endpoint
export API_SB_URL=https://your-api.example.com/rpc

# API key (alternative to OAuth login)
export API_SB_KEY=your_api_key
```

## Quick Start

```typescript
import { connect, api, db } from 'api.sb'

// Option 1: Explicit connection
const client = await connect()
const result = await client.generate('Describe a startup idea')

// Option 2: Proxy-based (auto-connects)
const result = await api.generate('Describe a startup idea')

// Option 3: Database operations
const startups = await db.startups.find()
```

## API Categories

### AI Functions

```typescript
// Generate structured output
const startup = await api.generate(
  'Create a startup idea for AI productivity',
  { schema: z.object({ name: z.string(), tagline: z.string() }) }
)

// Generate text/markdown
const content = await api.write('Write a blog post about AI agents')

// Generate lists
const ideas = await api.list('Top 10 startup ideas for 2025', { count: 10 })
const categories = await api.lists('Categorize programming languages by paradigm')

// Embeddings and search
await api.embed('Some text to embed', { store: true, id: 'doc-1' })
const results = await api.search('similar text query', { limit: 5 })

// Image generation
const image = await api.generateImage('A futuristic city skyline')

// Text-to-speech
const audio = await api.generateSpeech('Hello, welcome to our platform')

// Speech-to-text
const transcript = await api.transcribe(audioBuffer)
```

### Function Execution

Execute stored functions with 4 types: Code, Generative, Agentic, and Human.

```typescript
// Execute by ID
const result = await api.executeFunction({
  functionId: 'fn-123',
  input: { name: 'Acme Corp' }
})

// Execute by name
const result = await api.runFunction('enrichCompany', { domain: 'acme.com' })

// Human task operations
await api.claimTask({ roleId: 'role-123', humanId: 'human-456' })
await api.completeTask({ taskId: 'task-789', output: { approved: true }, status: 'completed' })
```

### Communications

```typescript
// Email (AWS SES)
await api.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello</h1>'
})

// SMS
await api.sendText({ to: '+1234567890', body: 'Your code is 1234' })
```

### Enrichment

```typescript
// Search people by name and company
const result = await api.searchPeople({
  firstName: 'Elon',
  lastName: 'Musk',
  organizationName: 'SpaceX'
})
console.log(result.people[0]?.email)  // Get email from name + company

// Search people with filters
const people = await api.searchPeople({
  domain: 'spacex.com',
  titles: ['CEO', 'CTO', 'Founder'],
  seniorities: ['executive', 'director'],
  departments: ['Engineering', 'Product'],
  locations: ['Los Angeles'],
  limit: 25,
  page: 1
})

// Search companies
const companies = await api.searchCompanies({
  name: 'SpaceX',
  industries: ['Aerospace'],
  locations: ['Los Angeles, CA'],
  employeeRanges: ['1001-5000', '5001-10000'],
  limit: 10
})

// Enrich person by email
const person = await api.enrichPerson({ email: 'elon@tesla.com' })
// Returns: { person: {...}, organization: {...} }

// Enrich company by domain
const company = await api.enrichCompany({ domain: 'spacex.com' })
// Returns: { id, name, domain, industry, estimatedNumEmployees, ... }

// Verify email
const status = await api.verifyEmail({ email: 'test@example.com' })
// Returns: { valid: boolean, status: 'valid' | 'invalid' | 'not_found' }
```

### Payments (Stripe)

```typescript
// Create customer
const customer = await api.createCustomer({ email: 'user@example.com' })

// Create subscription
const sub = await api.createSubscription({ customerId: 'cus_123', priceId: 'price_456' })

// Checkout session
const checkout = await api.createCheckout({
  priceId: 'price_456',
  successUrl: 'https://example.com/success',
  cancelUrl: 'https://example.com/cancel'
})
```

### Web Scraping

```typescript
// Scrape single URL
const page = await api.scrapeUrl('https://example.com')

// Crawl site
const pages = await api.crawlSite('https://example.com', { limit: 100 })

// Map site structure
const sitemap = await api.mapSite('https://example.com')
```

### Domains

```typescript
// Check availability
const available = await api.checkDomain('startup.ai')

// Register domain
await api.registerDomain({ name: 'startup.ai' })

// Set nameservers
await api.setNameservers('startup.ai', ['ns1.cloudflare.com', 'ns2.cloudflare.com'])
```

### Sandbox (Code Execution)

```typescript
// Run code in isolated sandbox
const result = await api.runJavaScript(`
  export default function(input) {
    return { greeting: 'Hello, ' + input.name }
  }
`)

// Run Python
const result = await api.runPython(`
def main(input):
    return {"result": input["x"] * 2}
`)

// Run Claude Code on a repository
const result = await api.runClaudeCode({
  repo: 'https://github.com/user/repo',
  task: 'Add unit tests for the auth module'
})
```

## Function Types

### Code Functions

Execute JavaScript, TypeScript, or Python code in a secure sandbox.

```typescript
// Schema
import { CodeEvaluateInput, CodeEvaluateOutput } from 'api.sb'

// Input
{
  module: 'myFunction',
  script: 'export default (input) => input.x * 2',
  language: 'typescript',
  entryPoint: 'default',
  args: { x: 21 },
  timeout: 30000
}

// Output
{
  success: true,
  result: 42,
  stdout: '',
  stderr: '',
  exitCode: 0,
  duration: 150
}
```

### Generative Functions

AI-powered generation with multiple modes.

```typescript
import { GenerativeMode, GenerativeFunctionConfig } from 'api.sb'

// Modes: 'generate' | 'write' | 'list' | 'lists' | 'image' | 'speech' | 'embed'

// Config
{
  mode: 'generate',
  promptTemplate: 'Create a {{type}} for {{company}}',
  systemPrompt: 'You are a business analyst',
  provider: 'default',  // 'default' | 'fast' | 'local' | 'cloud' | 'enterprise'
  model: 'auto',        // optional, uses best available
  temperature: 0.7,
  outputSchema: { type: 'object', properties: { ... } }
}
```

### Agentic Functions

AI agents with tool calling and iteration limits.

```typescript
import { AgenticFunctionConfig, AgenticFunctionOutput } from 'api.sb'

// Config
{
  systemPrompt: 'You are a research assistant...',
  provider: 'default',  // 'default' | 'fast' | 'powerful'
  maxIterations: 10,
  timeout: 120000,
  functionTools: ['fn-search', 'fn-summarize'],  // Other Functions as tools
  integrationTools: ['tool-email', 'tool-slack']  // Integration Tools
}

// Output includes full iteration history
{
  success: true,
  result: 'Research completed...',
  iterations: [
    { iteration: 1, thought: '...', toolCalls: [...] },
    { iteration: 2, response: '...' }
  ],
  totalIterations: 2,
  usage: { promptTokens: 1000, completionTokens: 500, totalTokens: 1500 }
}
```

### Human Functions

Create tasks for human workers with queue-based or direct assignment.

```typescript
import { HumanFunctionConfig, TaskStatus } from 'api.sb'

// Config
{
  assignmentMode: 'queue',        // or 'direct'
  roleId: 'role-reviewers',       // For queue mode
  assigneeId: 'human-123',        // For direct mode
  taskTemplate: 'Review {{document}} for {{company}}',
  priority: 'high',
  timeout: 86400000               // SLA: 24 hours
}

// Task statuses: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
```

## Database Operations

```typescript
import { db } from 'api.sb'

// Find all
const all = await db.startups.find()

// Find with query
const active = await db.startups.find({
  where: { status: { equals: 'active' } },
  limit: 10
})

// Find by ID
const startup = await db.startups.findByID({ id: '123' })

// Create
const newStartup = await db.startups.create({
  data: { name: 'Acme', description: 'AI platform' }
})

// Update
await db.startups.update({
  id: '123',
  data: { status: 'funded' }
})

// Delete
await db.startups.delete({ id: '123' })

// Count
const count = await db.startups.count({ where: { status: { equals: 'active' } } })
```

## Configuration

```typescript
import { connect } from 'api.sb'

// Custom URL
const api = await connect({ url: 'https://your-api.example.com/rpc' })

// Environment variable
// Set API_SB_URL=https://your-api.example.com/rpc
const api = await connect()
```

## WebSocket Connection

For real-time/streaming use cases:

```typescript
import { connectWs } from 'api.sb'

const { api, close } = await connectWs()

// Use api normally
const result = await api.generate('...')

// Close when done
close()
```

## TypeScript Types

All schemas are available as both Zod schemas and TypeScript types:

```typescript
import {
  // Function types
  FunctionType,
  FunctionExecuteInput,
  FunctionExecuteOutput,

  // Code
  CodeLanguage,
  CodeEvaluateInput,
  CodeEvaluateOutput,

  // Generative
  GenerativeMode,
  GenerativeProvider,
  GenerativeFunctionConfig,

  // Agentic
  AgenticProvider,
  AgenticToolDefinition,
  AgenticIteration,
  AgenticFunctionOutput,

  // Human
  AssignmentMode,
  TaskPriority,
  TaskStatus,
  HumanFunctionConfig,
  TaskCompleteInput,
  TaskClaimInput,

  // AI
  Prompt,
  GenerateOptions,
  ListOptions,
  WriteOptions,

  // Client
  ApiSbAPI,
  PayloadDBNamespace,
} from 'api.sb'
```

## License

MIT
