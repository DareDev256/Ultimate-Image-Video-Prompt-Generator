#!/usr/bin/env bun
/**
 * Search the local prompt corpus and return matches WITH their credit.
 *
 * Every result carries the author and the upstream repo it came from. That
 * is not decoration — these prompts were written by named people and two of
 * the source repos carry licence terms that require the attribution to
 * travel with the text. A search tool that strips it launders the credit.
 *
 * Usage:
 *   bun run skill/scripts/search.ts "neon portrait"
 *   bun run skill/scripts/search.ts --limit 10 --video "drone shot"
 *   bun run skill/scripts/search.ts --json "film grain"
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { scoreShot } from '../../web/src/lib/shot-grammar';

const ROOT = join(import.meta.dir, '../..');

interface Entry {
  id: number;
  title: string;
  prompts: string[];
  tags?: string[];
  model?: string;
  source?: { name: string; url: string };
  origin?: { repo: string; repoUrl: string };
}

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string, fallback: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const limit = Math.max(1, Math.min(25, parseInt(opt('limit', '5'), 10) || 5));
const query = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--limit').join(' ').trim();

if (!query) {
  console.error('No query given.');
  process.exit(2);
}

function load(file: string): Entry[] {
  const raw = JSON.parse(readFileSync(join(ROOT, 'web/public/data', file), 'utf8'));
  return Array.isArray(raw) ? raw : ((Object.values(raw).find(Array.isArray) as Entry[]) ?? []);
}

const entries = flag('video')
  ? load('video-prompts.json')
  : flag('image')
    ? load('image-prompts.json')
    : [...load('image-prompts.json'), ...load('video-prompts.json')];

const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

/** Title and tag hits outrank body hits — a match in the title is what the prompt is *about*. */
function relevance(e: Entry): number {
  const title = (e.title ?? '').toLowerCase();
  const tags = (e.tags ?? []).join(' ').toLowerCase();
  const body = (e.prompts ?? []).join(' ').toLowerCase();
  let n = 0;
  for (const t of terms) {
    if (title.includes(t)) n += 5;
    if (tags.includes(t)) n += 3;
    if (body.includes(t)) n += 1;
  }
  return n;
}

const ranked = entries
  .map((e) => ({ entry: e, rel: relevance(e) }))
  .filter((r) => r.rel > 0)
  .sort((a, b) => b.rel - a.rel)
  .slice(0, limit)
  .map(({ entry, rel }) => {
    const text = entry.prompts?.[0] ?? '';
    return {
      title: entry.title,
      model: entry.model,
      relevance: rel,
      shotScore: scoreShot(text).total,
      prompt: text,
      credit: {
        author: entry.source?.name ?? null,
        authorUrl: entry.source?.url ?? null,
        repo: entry.origin?.repo ?? null,
        repoUrl: entry.origin?.repoUrl ?? null,
      },
    };
  });

if (flag('json')) {
  console.log(JSON.stringify(ranked, null, 2));
  process.exit(0);
}

if (ranked.length === 0) {
  console.log(`No matches for "${query}" in ${entries.length} prompts.`);
  process.exit(0);
}

console.log(`${ranked.length} of ${entries.length} prompts match "${query}"\n`);
for (const r of ranked) {
  console.log(`── ${r.title}${r.model ? `  [${r.model}]` : ''}  ·  shot score ${r.shotScore}/30`);
  console.log(`${r.prompt.slice(0, 400)}${r.prompt.length > 400 ? '…' : ''}`);
  const by = r.credit.author ? `by ${r.credit.author}` : 'author unrecorded';
  console.log(`   ${by}${r.credit.authorUrl ? ` (${r.credit.authorUrl})` : ''}`);
  if (r.credit.repo) console.log(`   via ${r.credit.repo}`);
  console.log('');
}
console.log('Keep the credit line when you reuse one of these.');
