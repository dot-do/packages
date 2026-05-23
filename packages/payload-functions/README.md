---
name: payload-functions
version: 0.0.1-beta.5
description: Convenience Functions for Rapid Development of Payload CMS Apps
license: MIT
downloads:
  monthly: 38
published: "2023-11-02T09:37:29.270Z"
updated: "2023-11-02T11:29:21.068Z"
---

# `payload-functions`

This package is still very early in development, and the API is not yet stable.

```bash
yarn add payload-functions
```

## Usage

```typescript
import { $Context, Json5, Text } from 'payload-fields'

export default $: $Context => ({
  Nodes: {
    name: Text,
    subjectOf: [ $.Edges.subject ],
    objectOf: [ $.Edges.object ],
    data: Json5,
  },
  Edges: {
    name: ({ subject, predicate, object }) => `${subject.name} ${predicate} ${object.name}`,
    subject: $.Edges.subject,
    predicate: Text,
    object: $.Edges.object,
    data: Json5,
  },
})



```