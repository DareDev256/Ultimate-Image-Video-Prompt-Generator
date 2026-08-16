#!/usr/bin/env bun
/**
 * Backfills the `origin` field on prompts that never got one.
 *
 * Why this was needed
 * -------------------
 * Three fetchers write the corpus and only one of them stamped where a prompt
 * came from. `fetch-x-curated-prompts.ts` sets `origin: { repo, repoUrl }`;
 * `fetch-nano-banana-prompts.ts` and `fetch-prompts.ts` never did. The result
 * was 1,180 of 1,427 prompts carrying an author but no source repository.
 *
 * That is not a cosmetic gap. The largest block — the 1,180 `nano-banana-*`
 * entries — comes from a CC BY 4.0 corpus, and CC BY requires the licence to
 * be identified alongside the credit. You cannot identify a licence for a
 * repository you did not record. The /sources page and the README both build
 * from this data, so both were silently under-reporting.
 *
 * Assignment is by id block, which is how the fetchers allocate:
 *
 *   10000+  fetch-nano-banana-prompts.ts   → YouMind-OpenLab   (CC BY 4.0)
 *   20000+  fetch-x-curated-prompts.ts     → Anil-matcha       (already stamped)
 *   30000+  fetch-x-curated-prompts.ts     → ZeroLu            (already stamped)
 *   40000+  fetch-x-curated-prompts.ts     → ImgEdify          (already stamped)
 *   video   fetch-prompts.ts               → songguoxs         (no licence)
 *
 * Idempotent: an entry that already has an origin is left alone.
 *
 * Run:  bun run scripts/backfill-origin.ts [--dry]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const DATA = join(ROOT, 'web/public/data');
const dry = process.argv.includes('--dry');

interface Origin {
  repo: string;
  repoUrl: string;
  license: string;
  licenseUrl: string | null;
}

const YOUMIND: Origin = {
  repo: 'YouMind-OpenLab/awesome-nano-banana-pro-prompts',
  repoUrl: 'https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
};

const SONGGUOXS_VIDEO: Origin = {
  repo: 'songguoxs/awesome-video-prompts',
  repoUrl: 'https://github.com/songguoxs/awesome-video-prompts',
  license: 'No stated licence',
  licenseUrl: null,
};

/** Licences for the repos the X-curated fetcher already stamps. */
const KNOWN_LICENSES: Record<string, { license: string; licenseUrl: string | null }> = {
  'Anil-matcha/Awesome-GPT-Image-2-API-Prompts': { license: 'No stated licence', licenseUrl: null },
  'ZeroLu/awesome-gpt-image': { license: 'MIT', licenseUrl: 'https://github.com/ZeroLu/awesome-gpt-image/blob/main/LICENSE' },
  'ImgEdify/Awesome-GPT4o-Image-Prompts': { license: 'MIT', licenseUrl: 'https://github.com/ImgEdify/Awesome-GPT4o-Image-Prompts/blob/main/LICENSE' },
  'songguoxs/gpt4o-image-prompts': { license: 'No stated licence', licenseUrl: null },
  [YOUMIND.repo]: { license: YOUMIND.license, licenseUrl: YOUMIND.licenseUrl },
  [SONGGUOXS_VIDEO.repo]: { license: SONGGUOXS_VIDEO.license, licenseUrl: SONGGUOXS_VIDEO.licenseUrl },
};

function stampFile(file: string, fallback: Origin) {
  const path = join(DATA, file);
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const items: any[] = Array.isArray(raw) ? raw : (Object.values(raw).find(Array.isArray) as any[]);

  let stamped = 0;
  let enriched = 0;

  for (const item of items) {
    if (!item.origin?.repo) {
      item.origin = { ...fallback };
      stamped++;
      continue;
    }
    // Existing origin: add the licence fields if they are missing.
    const known = KNOWN_LICENSES[item.origin.repo];
    if (known && !item.origin.license) {
      item.origin.license = known.license;
      item.origin.licenseUrl = known.licenseUrl;
      enriched++;
    }
  }

  if (!dry) writeFileSync(path, JSON.stringify(raw, null, 2) + '\n');
  console.log(`${file}: ${items.length} entries — ${stamped} stamped, ${enriched} licence-enriched${dry ? ' (dry run)' : ''}`);
  return items;
}

const image = stampFile('image-prompts.json', YOUMIND);
const video = stampFile('video-prompts.json', SONGGUOXS_VIDEO);

const counts = new Map<string, number>();
for (const it of [...image, ...video]) {
  const key = `${it.origin.repo} [${it.origin.license}]`;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}
console.log('\nprovenance after backfill:');
for (const [repo, n] of [...counts].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(5)}  ${repo}`);
}
