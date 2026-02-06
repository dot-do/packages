---
name: db.mdx
version: 0.0.18
description: A simple database
license: MIT
repository: "https://github.com/ai-primitives/core"
homepage: "https://github.com/ai-primitives/core/tree/main/packages/db.mdx"
downloads:
  monthly: 45
published: "2024-12-06T20:08:00.982Z"
updated: "2024-12-06T21:43:47.301Z"
---

# mdxdb

A simple database

## Input

```mdx
---
title: My Document
tags: [ai, database]
---

export const myFunction = (a: number, b: number) => a * b

# {title}

- idea 1
- idea 2
- idea 3

<Counter />
```

## Output

```javascript
export default {
  data: {
    title: 'My Document',
    tags: ['ai', 'database'],
  },
  content: '# My Document\n\n- idea 1\n- idea 2\n- idea 3\n\n<Counter/>',
  exports: {
    myFunction: (a: number, b: number) => a * b
  },
  Component: data => (
    <div>
      <h1>{title}</h1>
      <ul>
        <li>idea 1</li>
        <li>idea 2</li>
        <li>idea 3</li>
      </ul>
    </div>
    <Counter/>
  )
}
```
