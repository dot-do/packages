---
name: ai-list
version: 0.1.4
description: AI-Powered List Generation Tagged Template Literal (using OpenAI GPT4 / GPT3.5)
license: MIT
repository: "https://github.com/nathanclevenger/ai-functions"
homepage: "https://github.com/nathanclevenger/ai-functions#readme"
keywords:
  - ai
  - tagged
  - template
  - gpt
  - list
downloads:
  monthly: 18
published: "2023-11-03T21:23:49.529Z"
updated: "2023-11-03T22:16:28.131Z"
---

# `ai-list`: AI-Powered List Generation

```bash
npm install ai-list
```

or

```bash
yarn add ai-list
```

Then you can use it simply:

```javascript
import { AI } from 'ai-list'

const { list, gpt } = AI({ apiKey = 'OPENAI_API_KEY' })

const things = await list`fun things to do in Miami`
console.log(things)
```

or with Async iterators:

```javascript
for await (const thing of list`fun things to do in Miami`) {
  console.log(thing)
}
```

Or in a more complex example:

```javascript
const listBlogPosts = (count, topic) => list`${count} blog post titles about ${topic}`
const writeBlogPost = title => gpt`write a blog post in markdown starting with "# ${title}"`

async function* writeBlog(count, topic) {
  for await (const title of listBlogPosts(count, topic)) {
    const content = await writeBlogPost(title)
    yield { title, content }
  }
}

for await (const post of writeBlog(25, 'future of car sales')) {
  console.log({ post })
}
```







