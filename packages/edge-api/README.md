---
name: edge-api
version: 0.1.70
description: Simplified Edge API Router with JWT Auth, Logging, and Database
license: MIT
repository: "https://github.com/nathanclevenger/edge-api"
homepage: "https://github.com/nathanclevenger/edge-api#readme"
downloads:
  monthly: 212
published: "2023-06-08T09:29:19.116Z"
updated: "2024-05-14T15:14:26.583Z"
---

# edge-api

Simplified Edge API Router with JWT Auth, Logging, and Database.  

```javascript
import { API, error } from 'edge-api'

const api = API()

api
  // .all('*', withUser, withDB({ database: 'API' }))
  .get('/', () => ({ hello: 'api' }))
  .get('/:resource', ({ resource }) => ({ resource }))
  .get('/:resource/:id+', ({ resource, id }) => ({ resource, id }))
  .all('*', () => error(404))

export default api
```