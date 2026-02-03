import type { Config } from './types.js'

export const config: Config = {
  sources: [
    // Primary scopes
    { name: '@dotdo', type: 'scope', priority: 1 },
    { name: '@saaskit', type: 'scope', priority: 2 },
    { name: '@mdxui', type: 'scope', priority: 3 },
    { name: '@db4', type: 'scope', priority: 4 },
    { name: '@icetype', type: 'scope', priority: 5 },
    { name: '@mdxld', type: 'scope', priority: 6 },
    { name: '@mdxe', type: 'scope', priority: 7 },
    { name: '@mdxdb', type: 'scope', priority: 8 },
    { name: '@org.ai', type: 'scope', priority: 9 },
    { name: '@nathanclevenger', type: 'scope', priority: 10 },
    { name: '@graphdl', type: 'scope', priority: 11 },
    { name: '@mdx.do', type: 'scope', priority: 12 },
    // Catch-all for any packages under this maintainer
    { name: 'nathanclevenger', type: 'user', priority: 100 },
  ],
  excludedPackages: [],
  excludedScopes: [
    '@drivly',
    '@opentui',
  ],
  featuredPackages: [
    { name: '@dotdo/client', priority: 1 },
    { name: '@saaskit/core', priority: 2 },
  ],
  output: {
    tsvPath: './catalog.tsv',
    readmePath: './packages',
  },
}
