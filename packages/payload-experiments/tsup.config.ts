import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'collections/index': 'src/collections/index.ts',
    'lib/index': 'src/lib/index.ts',
    'components/index': 'src/components/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['payload', 'react', 'next'],
  treeshake: true,
  splitting: false,
})
