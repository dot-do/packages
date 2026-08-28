---
name: services.studio
version: 0.1.0
description: TypeScript SDK for services.studio, services.delivery, and api.services, - a graph database API for occupational data, schemas, and integrations
license: MIT
repository: "https://github.com/nathanclevenger/api.services"
homepage: "https://api.services"
keywords:
  - api
  - graph
  - database
  - onet
  - occupation
  - skills
  - schema.org
  - zapier
  - gs1
  - naics
  - typescript
  - sdk
downloads:
  monthly: 14
published: "2025-10-01T17:59:55.378Z"
updated: "2025-10-01T17:59:55.584Z"
---

# services.studio

TypeScript SDK for [services.studio](https://services.studio), [services.delivery](https://services.delivery), and [api.services](https://api.services) - a graph database API connecting occupational data, industry classifications, software integrations, and semantic vocabularies.

## Overview

api.services provides a unified graph API for:

- **O*NET** - 1,000+ occupations with occupational data from the u.s. department of labor's o*net database
- **NAICS** - Industry classifications with north american industry classification system - hierarchical industry taxonomy
- **Schema.org** - 900+ types, 1,500+ properties with semantic web vocabulary for structured data
- **Zapier** - 6,000+ apps with software integration platform data
- **GS1** - Business steps, dispositions, events with supply chain vocabulary from gs1 standards
- **APQC** - Process framework with business process taxonomy
- **BLS** - Wage and employment statistics with bureau of labor statistics employment and wage data

## Installation

```bash
npm install services.studio
# or
pnpm add services.studio
# or
yarn add services.studio
```

## Quick Start

```typescript
import { createClient } from 'services.studio'

const client = createClient({
  baseUrl: 'https://api.services', // optional - can also use services.studio or services.delivery
  apiKey: 'your-api-key', // optional, for mutations
})

// Get an entity by ID
const occupation = await client.get('Software_Developers')
console.log(occupation.thing.name) // "Software Developers"
console.log(occupation.links.skills) // { "Programming": "https://api.services/Programming", ... }

// Search entities
const results = await client.search('machine learning', {
  type: 'Occupation',
  limit: 10,
})

// List entities by type
const skills = await client.list({
  ns: 'onet',
  type: 'Skill',
  limit: 100,
})

// Traverse relationships
const skillEntities = await client.getRelated(occupation, 'skills')
```

## High-Level API

### Fetching Entities

```typescript
// Get by ID (spaces converted to underscores automatically)
const entity = await client.get('Software_Developers')

// Get as markdown
const markdown = await client.getMarkdown('Software_Developers')
```

### Searching & Listing

```typescript
// Full-text search
const results = await client.search('artificial intelligence', {
  ns: 'onet',
  type: 'Occupation',
  limit: 20,
})

// List with filters
const occupations = await client.list({
  ns: 'onet',
  type: 'Occupation',
  limit: 100,
  offset: 0,
})
```

### Navigating Relationships

```typescript
const occupation = await client.get('Software_Developers')

// Get related entities by relationship type
const skills = await client.getRelated(occupation, 'skills')
const education = await client.getRelated(occupation, 'educationRequirements')
const tasks = await client.getRelated(occupation, 'responsibilities')

// Access raw relationship URLs
occupation.links.skills // { "Programming": "https://...", "Critical Thinking": "https://..." }
```

### Discovering the API

```typescript
// Get all available types and namespaces
const metadata = await client.getMetadata()

console.log(metadata.types) // { "Occupation": "https://api.services/Occupation", ... }
console.log(metadata.namespaces) // { "onet": "https://api.services/onet", ... }
```

## Entity Types

### O*NET Entities (`onet` namespace)

Occupational data from the U.S. Department of Labor's O*NET database.

- **Occupation** - Job roles with detailed occupational profiles from O*NET (e.g., Software Developers, Registered Nurses)
- **Skill** - Basic and cross-functional skills required by occupations (e.g., Programming, Critical Thinking, Active Listening)
- **Ability** - Enduring cognitive, physical, psychomotor, and sensory attributes (e.g., Deductive Reasoning, Manual Dexterity)
- **Knowledge** - Organized sets of principles and facts required for work (e.g., Computers and Electronics, Mathematics, Medicine)
- **Task** - Specific work activities performed in occupations (e.g., "Develop software applications")
- **Tool** - Physical tools, machinery, and equipment used in occupations
- **Activity** - Generalized, intermediate, and detailed work activities (e.g., Making Decisions, Documenting Information)
- **Interest** - RIASEC interest areas (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
- **WorkContext** - Physical and social work conditions (e.g., Indoors, Face-to-Face Discussions, Consequence of Error)
- **WorkStyle** - Work styles and personal characteristics (e.g., Attention to Detail, Dependability, Stress Tolerance)
- **Education** - Education levels and requirements (e.g., Bachelor's Degree, Post-Secondary Certificate)
- **JobZone** - Job preparation levels (1-5) and alternate job titles
- **Career** - Career transition paths between occupations
- **AlternateTitle** - Alternative job titles for occupations (e.g., "Software Engineer", "Applications Developer")
- **Experience** - Work experience requirements and categories
- **Training** - Training programs mapped to CIP (Classification of Instructional Programs) codes

**Key Relationships:**
- `skills` - Required skills
- `abilities` - Required abilities
- `knowledgeRequirements` - Required knowledge areas
- `responsibilities` - Tasks performed
- `tool` - Tools and technologies used
- `workPerformed` - Work activities
- `occupationalCategory` - Interest areas
- `workLocation` - Work context/conditions
- `educationRequirements` - Education and training
- `experienceRequirements` - Work experience needed
- `industryServed` - Industries employing this occupation
- `relatedLink` - Career transition paths
- `sameAs` - Alternate job titles

### NAICS Entities (`naics` namespace)

North American Industry Classification System - hierarchical industry taxonomy.

- **Industry** - Hierarchical industry classifications from sector (2-digit) to national industry (6-digit)

**Key Relationships:**
- `subClassOf` - Parent industry
- `hasPart` - Child industries
- `occupation` - Occupations in industry

### Zapier Entities (`zapier` namespace)

Software integration platform data.

- **Software** - Software applications from Zapier and O*NET (e.g., Gmail, Slack, Salesforce, Microsoft Excel)
- **Noun** - Data object types across applications (e.g., Contact, Task, Deal, Message, Lead)
- **Trigger** - Events that initiate automation workflows (e.g., "New Email", "Message Posted", "New Lead")
- **Action** - Operations performed in workflows (e.g., "Send Email", "Create Task", "Update Record")
- **Search** - Operations to find and retrieve records (e.g., "Find Contact", "Search Files")
- **Field** - Input/output fields with types and validation rules (e.g., "email", "subject", "due_date")
- **FieldMapping** - Semantic equivalence mappings between fields across different applications

**Key Relationships:**
- `trigger` - Available triggers
- `action` - Available actions
- `search` - Available searches
- `noun` - Data object types
- `field` - Input/output fields

### Schema.org Entities (`schema` namespace)

Semantic web vocabulary for structured data.

- **SchemaType** - Semantic type definitions (nouns) for structured data (e.g., Person, Organization, Product, Event)
- **Property** - Attribute and relationship definitions (e.g., name, address, startDate, author)
- **Verb** - Semantic action/verb definitions from Schema.org and GS1 (e.g., CreateAction, SearchAction, receiving, shipping)

**Key Relationships:**
- `subClassOf` - Parent type(s)
- `domainIncludes` - Properties applicable to this type
- `rangeIncludes` - Expected value types for properties
- `inverseOf` - Inverse property relationships

### GS1 Entities (`gs1` namespace)

Supply chain vocabulary from GS1 standards.

- **Step** - Standardized business process steps (e.g., receiving, packing, shipping, storing, commissioning)
- **Disposition** - Product business states (e.g., active, in_transit, recalled, damaged, expired)
- **Event** - EPCIS event types capturing supply chain events (e.g., ObjectEvent, AggregationEvent)
- **Dimension** - EPCIS event dimensions capturing the 5W+H (What, When, Where, Why, Who, How)

**Key Relationships:**


### BLS Entities (`bls` namespace)

Bureau of Labor Statistics employment and wage data.

- **WageData** - Employment and wage statistics by occupation and location from BLS Occupational Employment and Wage Statistics (OEWS)

**Key Relationships:**



## Examples

### Get Occupation Skills

```typescript
const occupation = await client.get('Software_Developers')

// Get skill URLs
const skillUrls = occupation.links.skills
// { "Programming": "https://api.services/Programming", ... }

// Fetch skill entities
const skills = await client.getRelated(occupation, 'skills')

console.log(`${occupation.thing.name} requires:`)
skills.forEach(skill => {
  console.log(`- ${skill.thing.name}`)
})
```

### Search Occupations

```typescript
// Find AI-related occupations
const aiOccupations = await client.search('artificial intelligence', {
  ns: 'onet',
  type: 'Occupation',
  limit: 10,
})

aiOccupations.things.forEach(({ thing }) => {
  console.log(`${thing.name}: ${thing.description}`)
})
```

### Explore Schema.org Types

```typescript
// Get all types
const metadata = await client.getMetadata()
const typeUrls = metadata.types

// Get a specific type with relationships
const personType = await client.get('Person')
console.log(personType.links.subClassOf) // Parent types
console.log(personType.links.domainIncludes) // Properties applicable to Person
```

### Find Related Zapier Apps

```typescript
// Get an app
const gmail = await client.get('Gmail')

// Get triggers
const triggers = await client.getRelated(gmail, 'trigger')
triggers.forEach(t => console.log(`Trigger: ${t.thing.name}`))

// Get actions
const actions = await client.getRelated(gmail, 'action')
actions.forEach(a => console.log(`Action: ${a.thing.name}`))
```

### Industry-Occupation Linkage

```typescript
// Get an industry
const industry = await client.get('Software_Publishers')

// Find occupations in this industry
const occupations = await client.getRelated(industry, 'occupation')
occupations.forEach(occ => {
  console.log(`${occ.thing.name}`)
})
```

### Career Path Analysis

```typescript
// Get career transitions from an occupation
const occupation = await client.get('Software_Developers')
const careerPaths = await client.getRelated(occupation, 'relatedLink')

console.log('Potential career transitions:')
careerPaths.forEach(path => {
  console.log(`→ ${path.thing.name}`)
})
```

### Generate Markdown Documentation

```typescript
// Get entity as markdown with YAML frontmatter
const markdown = await client.getMarkdown('Software_Developers')

// Save to file
import { writeFile } from 'fs/promises'
await writeFile('software-developers.md', markdown)
```

## API Reference

### `createClient(config?: ApiServicesConfig): ApiServicesClient`

Creates a new API client instance.

**Parameters:**
- `config.baseUrl?: string` - API base URL (default: `https://api.services`)
- `config.apiKey?: string` - API key for authenticated requests (required for mutations)
- `config.headers?: Record<string, string>` - Additional HTTP headers

**Returns:** `ApiServicesClient`

**Example:**
```typescript
const client = createClient({
  baseUrl: 'https://api.services',
  apiKey: process.env.API_KEY,
  headers: {
    'User-Agent': 'my-app/1.0',
  },
})
```

---

### `client.get(id: string): Promise<ThingResponse>`

Fetches an entity by ID. Spaces in IDs are automatically converted to underscores.

**Parameters:**
- `id: string` - Entity ID (with spaces or underscores)

**Returns:** `Promise<ThingResponse>`

**Example:**
```typescript
// Both work the same
const entity1 = await client.get('Software Developers')
const entity2 = await client.get('Software_Developers')
```

---

### `client.list(options?: ListOptions): Promise<ListResponse>`

Lists entities with optional filters and pagination.

**Parameters:**
- `options.ns?: string` - Filter by namespace (`'onet'`, `'schema'`, `'zapier'`, etc.)
- `options.type?: string` - Filter by type (`'Occupation'`, `'Skill'`, `'Action'`, etc.)
- `options.limit?: number` - Maximum results per page (default: 100)
- `options.offset?: number` - Pagination offset (default: 0)

**Returns:** `Promise<ListResponse>`

**Example:**
```typescript
// List all O*NET occupations
const occupations = await client.list({
  ns: 'onet',
  type: 'Occupation',
  limit: 50,
  offset: 0,
})

// List Schema.org types
const types = await client.list({
  ns: 'schema',
  type: 'SchemaType',
})
```

---

### `client.search(query: string, options?: SearchOptions): Promise<SearchResponse>`

Searches entities using full-text or vector search.

**Parameters:**
- `query: string` - Search query
- `options.ns?: string` - Filter by namespace
- `options.type?: string` - Filter by type
- `options.limit?: number` - Maximum results (default: 20)

**Returns:** `Promise<SearchResponse>`

**Example:**
```typescript
// Search across all namespaces
const results = await client.search('project management')

// Search specific entity type
const occupations = await client.search('nursing', {
  ns: 'onet',
  type: 'Occupation',
  limit: 10,
})
```

---

### `client.getMetadata(): Promise<Metadata>`

Gets API metadata including available types, namespaces, and root links.

**Returns:** `Promise<Metadata>`

**Example:**
```typescript
const metadata = await client.getMetadata()

// Available entity types with URLs
console.log(metadata.types)
// { "Occupation": "https://api.services/Occupation", ... }

// Available namespaces with URLs
console.log(metadata.namespaces)
// { "onet": "https://api.services/onet", ... }
```

---

### `client.getMarkdown(id: string): Promise<string>`

Fetches an entity rendered as Markdown with YAML frontmatter.

**Parameters:**
- `id: string` - Entity ID

**Returns:** `Promise<string>` - Markdown content

**Example:**
```typescript
const markdown = await client.getMarkdown('Software_Developers')
console.log(markdown)
// ---
// title: Software Developers
// type: Occupation
// ---
//
// ## Description
// ...
```

---

### `client.getRelated(entity: ThingResponse, relationshipType: string): Promise<ThingResponse[]>`

Helper to fetch related entities by relationship type.

**Parameters:**
- `entity: ThingResponse` - Source entity
- `relationshipType: string` - Relationship type key from `entity.links`

**Returns:** `Promise<ThingResponse[]>` - Array of related entities

**Example:**
```typescript
const occupation = await client.get('Software_Developers')

// Get all related skills
const skills = await client.getRelated(occupation, 'skills')

// Get education requirements
const education = await client.getRelated(occupation, 'educationRequirements')

// Get tasks/responsibilities
const tasks = await client.getRelated(occupation, 'responsibilities')
```

## TypeScript Types

### `Thing`

Core entity representation.

```typescript
interface Thing {
  $id: string           // Full URL identifier
  name: string          // Human-readable name
  description: string   // Description or definition
  $context: string      // Namespace context URL
  $type: string         // Schema.org type
  [key: string]: any    // Additional entity-specific properties
}
```

### `ThingResponse`

Entity with its relationships.

```typescript
interface ThingResponse {
  thing: Thing
  links: Record<string, Record<string, string>>
}
```

The `links` object groups relationships by type. Each relationship type maps IDs to URLs:

```typescript
{
  "skills": {
    "Programming": "https://api.services/Programming",
    "Critical Thinking": "https://api.services/Critical_Thinking"
  },
  "educationRequirements": {
    "Bachelor's Degree": "https://api.services/Bachelor's_Degree"
  }
}
```

### `ListResponse`

Paginated list of entities.

```typescript
interface ListResponse {
  things: ThingResponse[]
  links: {
    home: string
    next?: string      // Next page URL
    prev?: string      // Previous page URL
    first: string      // First page URL
    last?: string      // Last page URL
  }
}
```

### `SearchResponse`

Search results.

```typescript
interface SearchResponse {
  query: string
  things: ThingResponse[]
  exact: boolean         // Whether exact match found
  related?: Record<string, Record<string, string>>  // Related entities by type
}
```

### `Metadata`

API metadata and discovery.

```typescript
interface Metadata {
  $id: string
  $context: string
  $type: string
  types: Record<string, string>        // { TypeName: URL }
  namespaces: Record<string, string>   // { namespace: URL }
}
```

## Common Relationship Types

### O*NET

- `skills` - Required skills
- `abilities` - Required abilities
- `knowledgeRequirements` - Required knowledge areas
- `responsibilities` - Tasks performed
- `tool` - Tools and technologies used
- `workPerformed` - Work activities
- `occupationalCategory` - Interest areas
- `workLocation` - Work context/conditions
- `educationRequirements` - Education and training
- `experienceRequirements` - Work experience needed
- `industryServed` - Industries employing this occupation
- `relatedLink` - Career transition paths
- `sameAs` - Alternate job titles

### Schema.org

- `subClassOf` - Parent type(s)
- `domainIncludes` - Properties applicable to this type
- `rangeIncludes` - Expected value types for properties
- `inverseOf` - Inverse property relationships

### NAICS

- `subClassOf` - Parent industry
- `hasPart` - Child industries
- `occupation` - Occupations in industry

### Zapier

- `trigger` - Available triggers
- `action` - Available actions
- `search` - Available searches
- `noun` - Data object types
- `field` - Input/output fields


## License

MIT

## Links

- [API Documentation](https://api.services)
- [GitHub Repository](https://github.com/nathanclevenger/api.services)
- [Report Issues](https://github.com/nathanclevenger/api.services/issues)
