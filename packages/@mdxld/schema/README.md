---
name: "@mdxld/schema"
version: 0.1.0
description: A TypeScript package with latest Schema.org Schema Typings
license: Apache-2.0
repository: "https://github.com/mdxld/schema"
homepage: "https://mdxld.org"
keywords:
  - typescript
  - tsd
  - dts
  - schema.org
  - Semantic Web
  - semantic-web
  - Linked Data
  - linked-data
  - jsonld
  - JSON-LD
  - structured data
  - structured-data
downloads:
  monthly: 22
published: "2025-05-21T09:31:28.711Z"
updated: "2025-05-21T09:31:29.079Z"
---

[![Build Status](https://github.com/google/schema-dts/actions/workflows/ci.yml/badge.svg)](https://github.com/google/schema-dts/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/mdxld/schema/badge.svg?branch=main)](https://coveralls.io/github/mdxld/schema?branch=main)
[![schema-dts npm version](https://badge.fury.io/js/schema-dts.svg)](https://www.npmjs.com/package/schema-dts)

# @mdxld/schema

MDXLD TypeScript types for Schema.org vocabulary.

**schema-dts** provides TypeScript definitions for
[Schema.org](https://schema.org/) vocabulary in JSON-LD format. The typings are
exposed as complete sets of discriminated type unions, allowing for easy
completions and stricter validation.

![Example of Code Completion using schema-dts](https://raw.githubusercontent.com/mdxld/schema/HEAD/example-1.gif)


## Usage

To use the typings for your project, simply add the `@mdxld/schema` NPM package to
your project:

```command
npm install @mdxld/schema
```

Then you can use it by importing `"@mdxld/schema"`.

## Examples

### Defining Simple Properties

```ts
import type {Person} from '@mdxld/schema';

const inventor: Person = {
  $type: 'Person',
  name: 'Grace Hopper',
  disambiguatingDescription: 'American computer scientist',
  birthDate: '1906-12-09',
  deathDate: '1992-01-01',
  awards: [
    'Presidential Medal of Freedom',
    'National Medal of Technology and Innovation',
    'IEEE Emanuel R. Piore Award',
  ],
};
```

### Using 'Context'

JSON-LD requires a `"$context"` property to be set on the top-level JSON object,
to describe the URIs represeting the types and properties being referenced.
`@mdxld/schema` provides the `WithContext<T>` type to facilitate this.

```ts
import type {Organization, Thing, WithContext} from '@mdxld/schema';

export function JsonLd<T extends Thing>(json: WithContext<T>): string {
  return `<script type="application/ld+json">
${JSON.stringify(json)}
</script>`;
}

export const MY_ORG = JsonLd<Organization>({
  $context: 'https://schema.org',
  $type: 'Corporation',
  name: 'Google LLC',
});
```

### Graphs and IDs

JSON-LD supports `'$graph'` objects that have richer interconnected links
between the nodes. You can do that easily in `@mdxld/schema` by using the `Graph`
type.

Notice that any node can have an `$id` when defining it. And you can reference
the same node from different places by simply using an ID stub, for example
`{ '$id': 'https://my.site/about/#page }` below is an ID stub.

The example below shows potential JSON-LD for an About page. It includes
definitions of Alyssa P. Hacker (the author & subject of the page), the specific
page in this URL, and the website it belongs to. Some objects are still defined
as inline nested objects (e.g. Occupation), since they are only referenced by
their parent. Other objects are defined at the top-level with an `$id`, because
multiple nodes refer to them.

```ts
import type {Graph} from '@mdxld/schema';

const graph: Graph = {
  $context: 'https://schema.org',
  $graph: [
    {
      $type: 'Person',
      $id: 'https://my.site/#alyssa',
      name: 'Alyssa P. Hacker',
      hasOccupation: {
        $type: 'Occupation',
        name: 'LISP Hacker',
        qualifications: 'Knows LISP',
      },
      mainEntityOfPage: {$id: 'https://my.site/about/#page'},
      subjectOf: {$id: 'https://my.site/about/#page'},
    },
    {
      $type: 'AboutPage',
      $id: 'https://my.site/#site',
      url: 'https://my.site',
      name: "Alyssa P. Hacker's Website",
      inLanguage: 'en-US',
      description: 'The personal website of LISP legend Alyssa P. Hacker',
      mainEntity: {$id: 'https://my.site/#alyssa'},
    },
    {
      $type: 'WebPage',
      $id: 'https://my.site/about/#page',
      url: 'https://my.site/about/',
      name: "About | Alyssa P. Hacker's Website",
      inLanguage: 'en-US',
      isPartOf: {
        $id: 'https://my.site/#site',
      },
      about: {$id: 'https://my.site/#alyssa'},
      mainEntity: {$id: 'https://my.site/#alyssa'},
    },
  ],
};
```
