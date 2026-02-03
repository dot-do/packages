import { generateCatalog } from './catalog-generator.js'

async function main() {
  try {
    await generateCatalog()
    process.exit(0)
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

main()
