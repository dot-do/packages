---
name: "@dotdo/pg-protocol"
version: 0.1.1
description: The postgres client/server binary protocol, implemented in TypeScript
license: Apache-2.0
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - postgres
  - sql
  - database
  - wasm
  - pg-protocol
downloads:
  monthly: 15
published: "2026-01-22T15:58:58.577Z"
updated: "2026-01-24T15:49:19.517Z"
---

# @dotdo/pg-protocol

**PostgreSQL wire protocol for JavaScript.**

```typescript
import { serialize, Parser, messages } from '@dotdo/pg-protocol'

// Build protocol messages
const startup = serialize.startup({ user: 'postgres', database: 'mydb' })
const query = serialize.query('SELECT * FROM users')

// Parse responses
const parser = new Parser()
parser.parse(buffer, (msg) => {
  if (msg.name === 'dataRow') {
    console.log('Row:', msg.fields)
  }
})
```

## Why @dotdo/pg-protocol?

You're building database tooling. You need:

- Direct PostgreSQL communication (no client library overhead)
- Custom connection pooling (your way, not theirs)
- Protocol-level features (COPY, replication, SASL)
- Portable code (Node.js, Bun, Cloudflare Workers, browser)

**The old way:** Wrap an existing client. Fight its abstractions. Hope it works in your runtime.

**The pg-protocol way:** Raw protocol access. Build exactly what you need. Works everywhere JavaScript runs.

## What You Get

- **Full protocol support** - Startup, query, extended query, COPY, auth
- **Zero dependencies** - Just TypeScript
- **Streaming parser** - Process messages as they arrive
- **Platform agnostic** - ArrayBuffer-based, works anywhere
- **Type-safe** - Full TypeScript definitions

## Installation

```bash
npm install @dotdo/pg-protocol
```

## Quick Start

### Connect and Query

```typescript
import { serialize, Parser } from '@dotdo/pg-protocol'

// Create TCP connection (platform-specific)
const socket = await connect('localhost', 5432)

// Send startup message
await socket.write(serialize.startup({
  user: 'postgres',
  database: 'mydb'
}))

// Handle authentication
const parser = new Parser()

socket.on('data', (buffer) => {
  parser.parse(buffer, (msg) => {
    switch (msg.name) {
      case 'authenticationOk':
        // Authenticated - send query
        socket.write(serialize.query('SELECT 1'))
        break

      case 'dataRow':
        console.log('Row:', msg.fields)
        break

      case 'readyForQuery':
        console.log('Ready for next query')
        break

      case 'error':
        console.error('Error:', msg.message)
        break
    }
  })
})
```

### Extended Query Protocol

Prepared statements with parameters:

```typescript
// Parse (prepare) the statement
await socket.write(serialize.parse({
  name: 'get_user',
  text: 'SELECT * FROM users WHERE id = $1',
  types: []  // Let PostgreSQL infer types
}))

// Bind parameters
await socket.write(serialize.bind({
  portal: '',
  statement: 'get_user',
  values: ['user-123']
}))

// Execute
await socket.write(serialize.execute({ rows: 0 }))

// Sync to get results
await socket.write(serialize.sync())
```

### COPY Protocol

Bulk data transfer:

```typescript
// Start COPY
await socket.write(serialize.query('COPY users FROM STDIN'))

// Wait for copyInResponse
parser.parse(buffer, (msg) => {
  if (msg.name === 'copyInResponse') {
    // Send data chunks
    const chunk = Buffer.from('1\tAlice\n2\tBob\n')
    socket.write(serialize.copyData(chunk.buffer))

    // Signal completion
    socket.write(serialize.copyDone())
  }
})
```

## Message Types

### Client Messages (serialize.*)

| Method | Description |
|--------|-------------|
| `startup(opts)` | Connection startup with parameters |
| `password(pwd)` | Password authentication |
| `query(sql)` | Simple query |
| `parse(opts)` | Prepare statement |
| `bind(opts)` | Bind parameters |
| `execute(opts)` | Execute portal |
| `describe(opts)` | Describe statement/portal |
| `close(opts)` | Close statement/portal |
| `sync()` | Sync after extended query |
| `flush()` | Flush output |
| `end()` | Terminate connection |
| `copyData(data)` | COPY data chunk |
| `copyDone()` | COPY complete |
| `copyFail(msg)` | COPY failed |
| `cancel(pid, key)` | Cancel running query |

### Server Messages (via Parser)

| Message | Description |
|---------|-------------|
| `authenticationOk` | Authentication successful |
| `authenticationCleartextPassword` | Cleartext password requested |
| `authenticationMD5Password` | MD5 password requested |
| `authenticationSASL` | SASL auth requested |
| `parameterStatus` | Server parameter |
| `backendKeyData` | Process ID and secret key |
| `readyForQuery` | Ready for queries |
| `rowDescription` | Column metadata |
| `dataRow` | Row data |
| `commandComplete` | Command finished |
| `error` | Error response |
| `notice` | Notice/warning |
| `copyInResponse` | Ready for COPY data |
| `copyOutResponse` | Sending COPY data |
| `copyData` | COPY data chunk |
| `copyDone` | COPY complete |

## Authentication

### Cleartext Password

```typescript
parser.parse(buffer, (msg) => {
  if (msg.name === 'authenticationCleartextPassword') {
    socket.write(serialize.password('mysecretpassword'))
  }
})
```

### MD5 Password

```typescript
import { createHash } from 'crypto'

parser.parse(buffer, (msg) => {
  if (msg.name === 'authenticationMD5Password') {
    const salt = msg.salt  // 4 bytes
    const hash = md5(md5(password + user) + salt)
    socket.write(serialize.password('md5' + hash))
  }
})
```

### SASL (SCRAM-SHA-256)

```typescript
parser.parse(buffer, (msg) => {
  if (msg.name === 'authenticationSASL') {
    // msg.mechanisms = ['SCRAM-SHA-256']
    const clientFirst = buildClientFirst(nonce)
    socket.write(serialize.sendSASLInitialResponseMessage(
      'SCRAM-SHA-256',
      clientFirst
    ))
  }

  if (msg.name === 'authenticationSASLContinue') {
    const serverFirst = msg.data
    const clientFinal = buildClientFinal(serverFirst, password)
    socket.write(serialize.sendSCRAMClientFinalMessage(clientFinal))
  }

  if (msg.name === 'authenticationSASLFinal') {
    // Verify server signature
    const serverFinal = msg.data
    verifyServerSignature(serverFinal)
  }
})
```

## Streaming Parser

Process large result sets efficiently:

```typescript
const parser = new Parser()

// Parser handles partial messages automatically
socket.on('data', (chunk) => {
  // Chunk may contain partial messages
  // Parser buffers and emits complete messages
  parser.parse(chunk, (msg) => {
    if (msg.name === 'dataRow') {
      processRow(msg.fields)  // Process immediately, don't buffer
    }
  })
})
```

## Platform Usage

### Cloudflare Workers

```typescript
import { serialize, Parser } from '@dotdo/pg-protocol'

export default {
  async fetch(request, env) {
    const socket = await env.POSTGRES.connect()

    await socket.write(serialize.startup({
      user: env.PG_USER,
      database: env.PG_DATABASE
    }))

    // ... handle auth and queries
  }
}
```

### Node.js

```typescript
import { serialize, Parser } from '@dotdo/pg-protocol'
import { Socket } from 'net'

const socket = new Socket()
socket.connect(5432, 'localhost')

socket.on('connect', () => {
  socket.write(serialize.startup({ user: 'postgres', database: 'mydb' }))
})
```

### Browser (WebSocket proxy)

```typescript
import { serialize, Parser } from '@dotdo/pg-protocol'

const ws = new WebSocket('wss://proxy.example.com/pg')
const parser = new Parser()

ws.onopen = () => {
  ws.send(serialize.startup({ user: 'postgres', database: 'mydb' }))
}

ws.onmessage = (event) => {
  parser.parse(event.data, (msg) => {
    // Handle messages
  })
}
```

## Integration with postgres.do

pg-protocol powers the postgres.do internals:

```typescript
// This is how postgres.do Durable Objects communicate

import { serialize, Parser } from '@dotdo/pg-protocol'

// Internal DO-to-DO protocol communication
const response = await doStub.fetch('https://internal/query', {
  method: 'POST',
  body: serialize.query('SELECT * FROM users')
})

const parser = new Parser()
parser.parse(await response.arrayBuffer(), handleMessage)
```

## Performance

| Feature | Benefit |
|---------|---------|
| Zero-copy parsing | Minimal memory allocations |
| Streaming | Process as data arrives |
| ArrayBuffer | No Buffer/Uint8Array conversion |
| No dependencies | Small bundle size |

## Links

- [PostgreSQL Protocol Documentation](https://www.postgresql.org/docs/current/protocol.html)
- [GitHub](https://github.com/dot-do/postgres)
- Original: [brianc/node-postgres pg-protocol](https://github.com/brianc/node-postgres)

## Related Packages

- [`@dotdo/postgres`](../postgres) - Full PostgreSQL client
- [`@dotdo/pglite`](../pglite) - PostgreSQL in WASM
- [`@dotdo/pg-lake`](../pglake) - Distributed PostgreSQL

## Credits

Adapted from [Brian C's pg-protocol](https://github.com/brianc/node-postgres/tree/master/packages/pg-protocol) with modifications for universal JavaScript runtime support.

## License

Apache-2.0
