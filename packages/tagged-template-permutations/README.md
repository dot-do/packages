---
name: tagged-template-permutations
version: 0.1.4
description: Tagged Template Literal Function for Generating all Permutations of Arrays
license: MIT
repository: "https://github.com/nathanclevenger/tagged-template-permutations"
homepage: "https://github.com/nathanclevenger/tagged-template-permutations#readme"
keywords:
  - tagged
  - template
  - literal
  - permutations
  - array
downloads:
  monthly: 6
published: "2023-11-03T19:30:21.864Z"
updated: "2023-11-03T22:15:30.207Z"
---

#  Permutations - Tagged Template Literal

A utility to generate permutations and combinations from template literal expressions. Useful for generating a list of phrases or keywords with varying parts.

## Installation

To install `tagged-template-permutations`, use npm:

```bash
npm install tagged-template-permutations
```

Or using yarn:
```bash
yarn add tagged-template-permutations
```

## Usage

Import permutations in your TypeScript or JavaScript project:

```typescript
import { permutations } from 'tagged-template-permutations'

const roles: string[] = ['Founder', 'Builder'];
const types: string[] = ['Startup', 'Nonprofit'];

const results = permutations`${roles} of a ${types}`;
console.log(results);
// Output: ['Founder of a Startup', 'Founder of a Nonprofit', 'Builder of a Startup', 'Builder of a Nonprofit']
```

## API Reference

```typescript
permutations`<template literal>`
```

Generates a list of permutations based on the provided template literal.

- Template literals may contain arrays or strings.
- The function returns an array of strings with all unique permutations.
Contributing

We welcome contributions to the permutations package. 

License

This project is licensed under the MIT License.

Support

If you have any questions or issues, please open an issue on the GitHub repository issue tracker.

