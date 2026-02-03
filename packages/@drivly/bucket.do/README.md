---
name: "@drivly/bucket.do"
version: 0.1.0
description: bucket.do API - JS/TS Client
downloads:
  monthly: 2
published: "2023-01-13T19:09:48.856Z"
updated: "2023-01-13T19:40:27.622Z"
---


# API Wrapper for bucket.do, from Drivly

## Installation

```bash
npm i @drivly/bucket.do
```

## Example

```ts
import { Bucket } from '@drivly/bucket.do'

const client = new Bucket('API_KEY')

const { results } = await client.list( /* ... */ )
```

## Documentation

[View TypeScript file](https://github.com/drivly/SDK/blob/main/bucket.do/index.ts)

## [Drivly Open](https://driv.ly/open) - [Accelerating Innovation through Open Source](https://blog.driv.ly/accelerating-innovation-through-open-source)

Our [Drivly Open Philosophy](https://philosophy.do) has these key principles:

1. [Build in Public](https://driv.ly/open/build-in-public)
2. [Create Amazing Developer Experiences](https://driv.ly/open/amazing-developer-experiences)
3. [Everything Must Have an API](https://driv.ly/open/everything-must-have-an-api)
4. [Communicate through APIs not Meetings](https://driv.ly/open/communicate-through-apis-not-meetings)
5. [APIs Should Do One Thing, and Do It Well](https://driv.ly/open/apis-do-one-thing)

### We're Hiring!

[Driv.ly](https://driv.ly) is [deconstructing the monolithic physical dealership](https://blog.driv.ly/deconstructing-the-monolithic-physical-dealership) into [simple APIs to buy and sell cars online](https://driv.ly), and we're funded by some of the [biggest names](https://twitter.com/TurnerNovak) in [automotive](https://fontinalis.com/team/#bill-ford) and [finance & insurance](https://www.detroit.vc)

Our entire infrastructure is built with [Cloudflare Workers](https://workers.do), [Durable Objects](https://durable.objects.do), [KV](https://kv.cf), [PubSub](https://pubsub.do), [R2](https://r2.do.cf), [Pages](https://pages.do), etc.  [If you love the Cloudflare Workers ecosystem as much as we do](https://driv.ly/loves/workers), we'd love to have you [join our team](https://careers.do/apply)!

