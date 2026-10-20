---
name: mongo-rpc
version: 0.1.0
description: MongoDB RPC Client for Edge Proxy, Caching, and Connection Pooling
license: MIT
repository: "https://github.com/nathanclevenger/mongo-rpc"
homepage: "https://github.com/nathanclevenger/mongo-rpc#readme"
keywords:
  - mongo
  - mongodb
  - rpc
  - proxy
  - cache
  - db
downloads:
  monthly: 10
published: "2023-10-07T09:22:57.486Z"
updated: "2023-10-07T09:22:57.740Z"
---

# mongo-rpc: MongoDB RPC Client for Edge Proxy, Caching, and Connection Pooling

```javascript
import { MongoRemoteClient } from 'mongo-rpc'

const client = MongoRemoteClient({ cluster: 'demo', apiKey: 'testing123' })

const findResults = await client.db('test').collection('test').find({}).sort({_id: -1}).limit(100).toArray()
const insertResults = await client.db('test2').collection('test2').insertOne({ test: 123 })

console.log({ findResults, insertResults })
```