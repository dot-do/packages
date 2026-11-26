---
name: "@dotdo/pglite-react"
version: 0.2.33
description: Hooks for using PGlite
license: Apache-2.0
repository: "https://github.com/electric-sql/pglite"
homepage: "https://pglite.dev"
keywords:
  - postgres
  - sql
  - database
  - wasm
  - client
  - pglite
  - react
downloads:
  monthly: 12
published: "2026-01-24T15:50:10.012Z"
updated: "2026-01-24T15:50:10.211Z"
---

# PGlite React.js Hooks

This package implements React hooks for [PGLite](https://pglite.dev/) on top of the [live query plugin](https://pglite.dev/docs/live-queries). Full documentation is available at [pglite.dev/docs/framework-hooks](https://pglite.dev/docs/framework-hooks#react).

To install:

```sh
npm install @electric-sql/pglite-react
```

The hooks this package provides are:

- [PGliteProvider](https://pglite.dev/docs/framework-hooks/react#pgliteprovider): A Provider component to pass a PGlite instance to all child components for use with the other hooks.
- [usePGlite](https://pglite.dev/docs/framework-hooks/react#usepglite): Retrieve the provided PGlite instance.
- [makePGliteProvider](https://pglite.dev/docs/framework-hooks/react#makepgliteprovider): Create typed instances of `PGliteProvider` and `usePGlite`.
- [useLiveQuery](https://pglite.dev/docs/framework-hooks/react#uselivequery): Reactively re-render your component whenever the results of a live query change
- [useLiveIncrementalQuery](https://pglite.dev/docs/framework-hooks/react#useliveincrementalquery): Reactively re-render your component whenever the results of a live query change by offloading the diff to PGlite
