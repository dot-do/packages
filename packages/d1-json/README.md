---
name: d1-json
version: 0.0.5
description: JSON CRUD + Search Functions for Cloudflare D1
license: MIT
repository: "https://github.com/nathanclevenger/d1-json"
homepage: "https://github.com/nathanclevenger/d1-json#readme"
downloads:
  monthly: 6
published: "2023-10-04T10:07:02.986Z"
updated: "2023-10-08T12:00:35.549Z"
---

# d1-json
JSON CRUD + Search Functions for Cloudflare D1

```bash
npm i d1-json
```

```javascript
import { DB } from 'd1-json'

export default {
  fetch: (req, env, ctx) => {
    const db = DB(env)
    const timestamp = Date.now()
    const { hostname, pathname, search } = new URL(url)
    const { colo, city, country, postalCode } = req.cf
    const headers = JSON.fromEntries(req.headers)
    const ip = headers['cf-ip']
    const event = { timestamp, url, method, ip, headers, colo, city, country, postalCode }
    ctx.waitUntil(db.logs.insert(event))
    return Response.json(event)
  }
}
```



