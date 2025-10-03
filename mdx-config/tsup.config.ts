import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/parser.ts',
    'src/validators.ts',
    'src/cli.ts',
    'src/generators/index.ts',
    'src/schemas/index.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
})
