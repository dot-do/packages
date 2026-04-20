---
name: "@dotdo/duckdb-types"
version: 0.1.0-rc.1
description: Shared TypeScript types for DuckDB packages
license: MIT
repository: "https://github.com/dotdo/duckdb"
homepage: "https://duck.do"
keywords:
  - duckdb
  - types
  - typescript
  - capnproto
  - schema
  - rpc
downloads:
  monthly: 10
published: "2026-01-23T18:27:05.360Z"
updated: "2026-01-23T18:27:05.626Z"
---

# @dotdo/duckdb-types

Shared TypeScript types and Cap'n Proto schemas for DuckDB packages.

## Installation

```bash
npm install @dotdo/duckdb-types
# or
pnpm add @dotdo/duckdb-types
```

## Overview

This package provides consolidated type definitions used across:

- **@dotdo/duckdb** - DuckDB WASM for Cloudflare Workers
- **duck.do** - Managed DuckDB analytics service client SDK

## Architecture

### Type Consolidation Strategy

All shared types are defined in this package (`@dotdo/duckdb-types`) and imported by consumer packages. This ensures:

1. **Single Source of Truth**: Type definitions exist in one place
2. **Consistent API**: All packages use the same type contracts
3. **Easy Maintenance**: Changes propagate to all consumers automatically
4. **Clear Dependencies**: Type flow is explicit and traceable

### Package Dependency Graph

```
@dotdo/duckdb-types (canonical types)
        ^                   ^
        |                   |
   @dotdo/duckdb        duck.do
   (WASM/Worker)      (Client SDK)
```

### Column Information: Two Type Variants

This package provides two distinct column information types that serve different purposes:

| Type | Field Type | Primary Use Case | Package |
|------|------------|------------------|---------|
| `SimpleColumnInfo` | `type: string` | WASM/Arrow layer, HTTP transport | `@dotdo/duckdb` |
| `ColumnInfo` | `type: DuckDBType` | Schema introspection, type-aware ops | `duck.do` |

**Why two types?**

- **SimpleColumnInfo**: DuckDB WASM and Arrow IPC return type information as strings (e.g., `"DECIMAL(10,2)"`). String types are simpler to serialize and compatible with any DuckDB type, including future types.

- **ColumnInfo**: Rich type information with structured `DuckDBType` allows access to type parameters (DECIMAL precision/scale, ARRAY element type) for type-aware data processing and schema introspection.

**Converting between types:**

```typescript
import { toSimpleColumnInfo, toColumnInfo } from '@dotdo/duckdb-types'

// ColumnInfo -> SimpleColumnInfo (for serialization)
const simple = toSimpleColumnInfo(richColumn)

// SimpleColumnInfo -> ColumnInfo (for type introspection)
const rich = toColumnInfo(simpleColumn)
```

### How Packages Use Types

**@dotdo/duckdb (WASM package):**
- Re-exports `SimpleColumnInfo` as the primary column type
- Uses string-based types for WASM/Arrow compatibility
- Provides conversion utilities for consumers needing rich types

**duck.do (Client SDK):**
- Re-exports `ColumnInfo` with full `DuckDBType` for schema introspection
- Extends core message types with SDK-specific operations (prepared statements, appenders)
- Uses `toColumnInfo()` to parse WASM responses into rich types

### Type Re-export Pattern

Both consumer packages follow a consistent pattern:

```typescript
// 1. Re-export canonical types
export type {
  ParameterValue,
  ErrorCode,
  ErrorInfo,
  // ... other types
} from '@dotdo/duckdb-types'

// 2. Re-export utilities
export {
  DuckDBError,
  ErrorCodes,
  normalizeError,
  // ... other utilities
} from '@dotdo/duckdb-types'

// 3. Extend with package-specific types
export interface PackageSpecificType {
  // ...
}
```

### Message Protocol Types

The WebSocket message protocol types are also consolidated here:

- **Core Messages** (`ClientMessage`, `ServerMessage`): Defined in `@dotdo/duckdb-types`
- **Extended Messages**: Consumer packages extend core types with SDK-specific operations

```typescript
// In duck.do/types.ts
import type { ClientMessage as CoreClientMessage } from '@dotdo/duckdb-types'

export type ClientMessage =
  | CoreClientMessage
  | PrepareMessage      // SDK-specific
  | AppenderMessage     // SDK-specific
```

## Exported Types

### DuckDB Type System

Types for representing DuckDB's internal type system:

```typescript
import {
  DuckDBTypeId,    // Type identifier union ('INTEGER', 'VARCHAR', 'DECIMAL', etc.)
  DuckDBType,      // Full type descriptor with parameters for complex types
  typeToString,    // Convert DuckDBType to string representation
  simpleType,      // Create a simple DuckDBType from a type ID
  parseType,       // Parse a string type to DuckDBType
} from '@dotdo/duckdb-types'

// Example: Create a DECIMAL type
const decimalType: DuckDBType = {
  id: 'DECIMAL',
  width: 18,
  scale: 4
}

// Example: Parse a type string
const listType = parseType('INTEGER[]') // { id: 'LIST', valueType: { id: 'INTEGER' } }
```

### Column Information

Types for schema introspection:

```typescript
import {
  ColumnInfo,              // Full column metadata with DuckDBType
  SimpleColumnInfo,        // Simple column info with string type
  SimpleColumnInfoExtended, // Simple column info with nullable flag
  toSimpleColumnInfo,      // Convert ColumnInfo to SimpleColumnInfo
  toColumnInfo,            // Convert SimpleColumnInfo to ColumnInfo
} from '@dotdo/duckdb-types'

const column: ColumnInfo = {
  name: 'user_id',
  type: { id: 'INTEGER' },
  nullable: false
}
```

### Parameter Values

Types for query parameter binding:

```typescript
import { ParameterValue } from '@dotdo/duckdb-types'

// Supported parameter types
const params: ParameterValue[] = [
  null,                    // SQL NULL
  true,                    // Boolean
  42,                      // Number
  BigInt(9007199254740993), // BigInt
  'hello',                 // String
  new Uint8Array([1,2,3]), // Binary
  new Date(),              // Date
  [1, 2, 3],               // Array
  { key: 'value' }         // Object
]
```

### Query Results

Types for query execution results:

```typescript
import {
  QueryMeta,         // Query metadata (columns, rowCount, timing)
  ExecuteResult,     // Result of INSERT/UPDATE/DELETE
  QueryResult,       // Full query result with rows and metadata
  SimpleQueryResult, // Simplified query result
  QueryChunk,        // Streaming chunk for large result sets
  QueryOptions,      // Query execution options
  StreamOptions,     // Streaming query options
} from '@dotdo/duckdb-types'

const result: QueryResult<{ id: number; name: string }> = {
  rows: [{ id: 1, name: 'Alice' }],
  meta: {
    columns: [
      { name: 'id', type: { id: 'INTEGER' }, nullable: false },
      { name: 'name', type: { id: 'VARCHAR' }, nullable: true }
    ],
    rowCount: 1,
    executionTimeMs: 5.2,
    queryId: 'q-123'
  }
}
```

### Error Handling

Comprehensive error types and utilities:

```typescript
import {
  ErrorCode,              // Error code union type
  ErrorCodes,             // Error codes as const object
  ErrorInfo,              // Structured error information
  DuckDBError,            // Custom error class
  isRetryableErrorCode,   // Check if error is retryable
  detectErrorCode,        // Detect error code from message
  getHttpStatusForErrorCode, // Map error code to HTTP status
  normalizeError,         // Normalize any error to DuckDBError
  isDuckDBError,          // Type guard for DuckDBError
  createDuckDBError,      // Create error with auto-detected code
} from '@dotdo/duckdb-types'

try {
  // ... query execution
} catch (error) {
  const duckError = normalizeError(error)
  console.log(duckError.code)      // 'SYNTAX_ERROR', 'TIMEOUT', etc.
  console.log(duckError.retryable) // true/false
  console.log(duckError.message)   // Human-readable message
}
```

### WebSocket Protocol

Types for the WebSocket messaging protocol:

```typescript
import {
  PROTOCOL_VERSION,      // Current protocol version ('1.0')

  // Client messages
  ClientMessage,
  QueryMessage,
  ExecuteMessage,
  StreamMessage,
  StreamAckMessage,
  CancelMessage,
  PingMessage,

  // Server messages
  ServerMessage,
  ResultMessage,
  ExecuteResultMessage,
  ChunkMessage,
  StreamEndMessage,
  ErrorMessage,
  PongMessage,

  // Type guards
  isQueryMessage,
  isResultMessage,
  isErrorMessage,
  // ... and more
} from '@dotdo/duckdb-types'
```

### HTTP Request/Response Types

Types for HTTP API communication:

```typescript
import {
  HttpQueryRequest,
  HttpExecuteRequest,
  HttpQueryResponse,
  HttpExecuteResponse,
  HttpErrorResponse,
} from '@dotdo/duckdb-types'
```

### Server and Table Information

Types for server status and schema introspection:

```typescript
import {
  ServerStatus,  // Server health and statistics
  TableInfo,     // Table metadata
} from '@dotdo/duckdb-types'
```

## Cap'n Proto Schemas (Reference Only)

This package includes Cap'n Proto schema files that define the data structures and RPC protocol. **These schemas are currently for reference and documentation purposes only** - the TypeScript types in this package are manually maintained and are the source of truth.

The `.capnp` files are included for:

1. **Documentation**: They provide a formal specification of the type system and RPC protocol
2. **Future use**: May be used for code generation or binary serialization in future versions
3. **Interoperability**: Enable potential implementations in other languages that support Cap'n Proto

### Schema Files

Located in the `schema/` directory:

#### duckdb.capnp

Core data types for DuckDB:

- `TypeId` - DuckDB type enumeration
- `DuckDBType` - Full type descriptor with parameters for complex types
- `Value` - Universal value container for all DuckDB types
- `ColumnInfo` - Column metadata
- `TableInfo` - Table metadata
- `QueryMeta` - Query execution metadata
- `ErrorInfo` - Structured error information
- `ServerStatus` - Server health information

#### rpc.capnp

RPC protocol definitions:

- `DuckDBService` - Main RPC interface with query, execute, stream methods
- `QueryStream` - Streaming result interface with backpressure support
- `Transaction` - Transaction interface with savepoints
- `ClientCallback` - Server-to-client notifications (progress, warnings)

### Note on Code Generation

These schemas are **not** currently used for automatic code generation. The TypeScript types exported from this package are manually defined to ensure optimal developer experience and TypeScript integration. If you need to use Cap'n Proto serialization, you would need to:

1. Install a Cap'n Proto compiler (`capnp`)
2. Generate code for your target language
3. Ensure compatibility with the manually-maintained TypeScript types

## Design Principles

### 1. Zero Type Duplication

All shared types are defined once in this package. Consumer packages:
- Import and re-export types (not redefine them)
- Extend types with package-specific additions using unions
- Use type aliases for backward compatibility when renaming

### 2. Explicit Type Boundaries

The package clearly separates:
- **Wire types** (for serialization): `SimpleColumnInfo`, string-based
- **Domain types** (for business logic): `ColumnInfo`, structured `DuckDBType`
- **Protocol types** (for communication): `ClientMessage`, `ServerMessage`

### 3. Conversion Functions

Bidirectional conversion functions bridge type boundaries:
- `toSimpleColumnInfo()` / `toColumnInfo()` - Column info conversion
- `parseType()` / `typeToString()` - Type string parsing
- `DuckDBError.fromErrorInfo()` / `toErrorInfo()` - Error serialization

### 4. Type Safety Across Boundaries

Type guards ensure safe message handling:
```typescript
if (isQueryMessage(msg)) {
  // TypeScript knows msg is QueryMessage
}
```

## Files and Exports

```
@dotdo/duckdb-types/
├── src/
│   └── index.ts          # All TypeScript type definitions
├── schema/
│   ├── duckdb.capnp      # Core data type schemas (reference)
│   └── rpc.capnp         # RPC protocol schemas (reference)
├── dist/
│   ├── index.js          # Compiled JavaScript
│   └── index.d.ts        # Type declarations
└── package.json
```

**Main export**: `@dotdo/duckdb-types` (all types and utilities)
**Schema export**: `@dotdo/duckdb-types/schema/*` (Cap'n Proto files)

## License

MIT
