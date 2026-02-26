---
name: saaskit
version: 0.2.15
description: "**SaaS**kit.js from [SaaS.Dev](https://saas.dev) is a highly opinionated framework and abstraction layer for rapidly  creating, launching, and iterating on SaaS products like Apps, APIs, and Marketplaces."
license: MIT
downloads:
  monthly: 10372
published: "2021-08-14T13:31:10.943Z"
updated: "2021-11-08T17:04:28.918Z"
---

# **SaaS**kit.js

**SaaS**kit.js from [SaaS.Dev](https://saas.dev) is a highly opinionated framework and abstraction layer for rapidly 
creating, launching, and iterating on SaaS products like Apps, APIs, and Marketplaces.

With one simple command:

```bash
npx create-saaskit-app
```

You can create an app in seconds:

```javascript
export const app = {
  persona: 'Coder',
  problem: {
    villain: 'Jira',
    internal: 'Hates complex project management software',
    external: 'Needs a simple todo list',
    philosophical: 'Build vs Buy',
  },
  solution: 'Todos.Dev',
  brand: 'SaaS.Dev',
  offer: 'Simple Todo App',
  callToAction: {
    build: { users: 5, monthlyPrice: 0 },
    grow: { users: 25, monthlyPrice: 50 },
    scale: { users: 500, monthlyPrice: 500 },
  },
  failure: 'Endless complexity and lost customer relationships',
  success: {
    goal: 'Living a Productive and Fulfilling Life',
    transformation: { from: 'Endless Slog', to: 'Productive Rock Star' }
  },
  theme: {
    color: 'indigo',
    font: 'teko',
  },
  nouns: {
    todo: {
      name: 'string',
      assigned: 'user?',
      deadline: 'date?',
      description: 'markdown?',
      attachments: 'attachments?',
      tags: [app.nouns.tag],
      teams: [app.nouns.team],
      onCreate: (todo, {sendEmail}) => todo.assigned && sendEmail({
        to: todo.assigned.email,
        subject: `New Todo: ${todo}`,
        body: todo
      })
    },
    tag: {
      name: 'string',
    },
    team: {
      name: 'string',
      icon: 'icon',
      header: 'image',
      members: [app.nouns.user],
    },
    user: {
      name: 'string?',
      email: 'email',
      invitedBy: ctx => ctx.createdBy,
    },
  },
  experiments: [],
  integrations: [],
  plugins: [],
}

```