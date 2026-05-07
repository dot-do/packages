---
name: node-yaml-file
version: 0.1.0
description: Simple YAML Read/Write to Files for NodeJS
license: MIT
repository: "https://github.com/nathanclevenger/yaml-file"
homepage: "https://github.com/nathanclevenger/yaml-file#readme"
keywords:
  - yaml
  - file
  - node
downloads:
  monthly: 5
published: "2023-10-28T16:31:33.597Z"
updated: "2023-10-28T16:31:33.815Z"
---

# yaml-file

Simple YAML Read/Write to Files for NodeJS

## Installation

```bash
npm install node-yaml-file
```
or
```bash
yarn add node-yaml-file
```

## Usage

```javascript
import yaml from 'node-yaml-file'

const data = await yaml.read('path/to/data.yaml')
console.log(data)

await yaml.write('path/to/hello.yaml', { hello: 'world' })
```