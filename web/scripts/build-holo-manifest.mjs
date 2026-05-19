#!/usr/bin/env node
// Rebuild src/components/hero/holo-cards-manifest.ts from the PNGs sitting in
// public/showcase + public/generated-inspiration. Run when adding new cards.

import { readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const webRoot = join(here, '..')
const showcase = readdirSync(join(webRoot, 'public/showcase'))
  .filter((f) => f.endsWith('.png'))
  .sort()
  .map((f) => `/showcase/${f}`)
const generated = readdirSync(join(webRoot, 'public/generated-inspiration'))
  .filter((f) => f.startsWith('nano-banana-') && f.endsWith('.png'))
  .sort()
  .map((f) => `/generated-inspiration/${f}`)
const cards = [...showcase, ...generated]
const out = [
  '// Auto-generated. Re-run scripts/build-holo-manifest.mjs to refresh.',
  'export const HOLO_CARDS: readonly string[] = [',
  ...cards.map((p) => `  ${JSON.stringify(p)},`),
  '] as const',
  '',
].join('\n')
writeFileSync(join(webRoot, 'src/components/hero/holo-cards-manifest.ts'), out)
console.log(`wrote ${cards.length} cards to holo-cards-manifest.ts`)
