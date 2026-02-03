---
name: "@drivly/commerce"
version: 0.1.1
description: Drivly Commerce SDK
license: MIT
repository: "ssh://git@github.com/drivly/commerce"
homepage: "https://github.com/drivly/commerce#readme"
downloads:
  monthly: 41
published: "2023-12-01T16:17:33.394Z"
updated: "2024-02-29T20:38:43.709Z"
---

# Drivly Commerce SDK (@drivly/commerce)

The Drivly Commerce SDK is a TypeScript library for interacting with the Drivly Commerce API.

## Installation

Install the package via npm:

```bash
npm install @drivly/commerce
```

or yarn:

```bash
yarn add @drivly/commerce
```

## Usage

First, import the SDK:

```typescript
import { SDK } from '@drivly/commerce'
```

Then, create an instance of the SDK:

```typescript
const { commerce } = SDK({ apiKey: 'your-api-key', environment: 'sandbox' })
```

Please replace `'your-api-key'` with your actual API key, or omit if the `DRIVLY_API_KEY` environment variable is set.  The `DRIVLY_ENV` environment variable could also be set to either 'sandbox' or 'production'

You can now use the `sdk` instance to interact with the API. For example, to fetch all consumers:

```typescript
const consumers = await commerce.consumers.find()
```

## API

The SDK provides the following normalized collections for commerce:

- `consumers`
- `buyers`
- `deals`
- `vehicles`
- `listings`
- `taxesAndFees`
- `dmvFees`
- `fees`
- `locations`
- `companies`
- `addresses`
- `preApprovals`
- `creditApplications`
- `insurancePolicies`
- `insuranceQuotes`
- `serviceQuotes`
- `serviceOrders`
- `contacts`
- `attachments`
- `webhooks`
- `tenants`
- `trades`
- `brands`
- `documents`

As well as the following normalized collections for crm:

- `leads`
- `leadEvents`
- `trades`
- `preApprovals`
- `searches`
- `vehicles`
- `vdpEmails`
- `calls`
- `meetings`
- `messages`
- `templates`
- `holidays`
- `quietHours`
- `definitions`
- `salesReps`
- `webEvents`

Each collection has the following methods:

- `find()`: Fetch all items.
- `findOne(id: string)`: Fetch a single item by its ID.
- `create(data: object)`: Create a new item.
- `update(id: string, data: object)`: Update an existing item.
- `delete(id: string)`: Delete an item.

## Contributing

Contributions are welcome. Please submit a pull request or create an issue to discuss your changes.

## License

This project is licensed under the MIT License.

## [🚀 We're hiring!](https://careers.do/apply)

[Driv.ly](https://driv.ly) is simple APIs to buy & sell cars online, funded by some of the [biggest names](https://twitter.com/TurnerNovak) in [automotive](https://fontinalis.com/team/#bill-ford) and [finance & insurance](https://www.detroit.vc)

We're building our entire infrastructure on Cloudflare Workers, Durable Objects, KV, R2, and PubSub. If you're as passionate about these transformational technologies as we are, we'd love for you to join our rapidly-growing team.
