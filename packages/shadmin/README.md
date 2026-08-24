---
name: shadmin
version: 0.0.5
description: Modern admin UI library built with React 19 and shadcn/ui
license: MIT
repository: "https://github.com/nathanclevenger/shadmin"
homepage: "https://github.com/nathanclevenger/shadmin#readme"
keywords:
  - react
  - admin
  - ui
  - shadcn
  - components
  - cli
  - vite
downloads:
  monthly: 24
published: "2026-01-06T12:48:33.208Z"
updated: "2026-01-06T21:12:37.820Z"
---

# Shadmin

**A 100% API-compatible drop-in replacement for React Admin using ShadCN UI**

[![npm version](https://img.shields.io/npm/v/shadmin.svg)](https://www.npmjs.com/package/shadmin)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/nathanclevenger/shadmin/blob/main/LICENSE)

## Installation

```bash
npm install shadmin
```

## Usage

```tsx
import { Admin, Resource, List, Datagrid, TextField, DateField } from 'shadmin'

const PostList = () => (
  <List>
    <Datagrid>
      <TextField source="title" />
      <TextField source="author" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
)

export const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="posts" list={PostList} />
  </Admin>
)
```

## Features

- **Drop-in Replacement** - Change your import from `react-admin` to `shadmin`
- **Modern Aesthetics** - ShadCN components with Tailwind CSS
- **Lightweight Runtime** - No MUI overhead
- **React 19 Ready** - Built on the latest React with TanStack Query

## Documentation

For full documentation, examples, and API reference, visit the [GitHub repository](https://github.com/nathanclevenger/shadmin).

## License

MIT
