#!/usr/bin/env bun
/**
 * Fetch GPT-Image-2 / Nano Banana 2 prompts curated from X (Twitter) and the community.
 *
 * Sources (all share the same `### Title` + `**Prompt:**` + `**Source:**` markdown shape):
 *   - https://github.com/Anil-matcha/Awesome-GPT-Image-2-API-Prompts (id 20000+)
 *   - https://github.com/ZeroLu/awesome-gpt-image                    (id 30000+)
 *   - https://github.com/ImgEdify/Awesome-GPT4o-Image-Prompts        (id 40000+)
 *
 * Output: merged into web/public/data/image-prompts.json (preserves existing entries by id).
 *
 * v2.0 build — 2026-04-28.
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(__dirname, '../web/public/data');
const EXISTING_PROMPTS_FILE = join(OUTPUT_DIR, 'image-prompts.json');
const META_FILE = join(OUTPUT_DIR, 'meta.json');

interface ParsedPrompt {
  id: number;
  slug: string;
  title: string;
  source: { name: string; url: string };
  model: string;
  images: string[];
  prompts: string[];
  tags: string[];
  coverImage: string | null;
  category: string;
  language?: string;
  publishedDate?: string;
  youmindId?: number | null;
  generatedImage?: string;
  origin?: { repo: string; repoUrl: string };
}

interface SourceConfig {
  name: string;
  repo: string;
  repoUrl: string;
  readmeUrl: string;
  defaultModel: string;
  idOffset: number;
  slugPrefix: string;
}

const SOURCES: SourceConfig[] = [
  {
    name: 'Anil-matcha',
    repo: 'Anil-matcha/Awesome-GPT-Image-2-API-Prompts',
    repoUrl: 'https://github.com/Anil-matcha/Awesome-GPT-Image-2-API-Prompts',
    readmeUrl: 'https://raw.githubusercontent.com/Anil-matcha/Awesome-GPT-Image-2-API-Prompts/main/README.md',
    defaultModel: 'GPT-Image-2',
    idOffset: 20000,
    slugPrefix: 'gpt-image-2-anil',
  },
  {
    name: 'ZeroLu',
    repo: 'ZeroLu/awesome-gpt-image',
    repoUrl: 'https://github.com/ZeroLu/awesome-gpt-image',
    readmeUrl: 'https://raw.githubusercontent.com/ZeroLu/awesome-gpt-image/main/README.md',
    defaultModel: 'GPT-Image-2',
    idOffset: 30000,
    slugPrefix: 'gpt-image-2-x',
  },
  {
    name: 'ImgEdify',
    repo: 'ImgEdify/Awesome-GPT4o-Image-Prompts',
    repoUrl: 'https://github.com/ImgEdify/Awesome-GPT4o-Image-Prompts',
    readmeUrl: 'https://raw.githubusercontent.com/ImgEdify/Awesome-GPT4o-Image-Prompts/main/README.md',
    defaultModel: 'GPT-4o Image',
    idOffset: 40000,
    slugPrefix: 'gpt4o-image',
  },
];

function generateTags(title: string, promptText: string, category: string): string[] {
  const tags = new Set<string>();
  if (category && category !== 'general') tags.add(category);

  const combined = (title + ' ' + promptText).toLowerCase();

  if (combined.includes('anime') || combined.includes('manga')) tags.add('anime');
  if (combined.includes('3d') || combined.includes('render')) tags.add('3d');
  if (combined.includes('pixel')) tags.add('pixel-art');
  if (combined.includes('watercolor')) tags.add('watercolor');
  if (combined.includes('oil paint')) tags.add('oil-painting');
  if (combined.includes('photograph') || combined.includes('photo') || combined.includes('film')) tags.add('photography');
  if (combined.includes('cinematic')) tags.add('cinematic');
  if (combined.includes('minimalis')) tags.add('minimalism');
  if (combined.includes('cyberpunk')) tags.add('cyberpunk');
  if (combined.includes('vintage') || combined.includes('retro')) tags.add('vintage');
  if (combined.includes('portrait')) tags.add('portrait');
  if (combined.includes('character')) tags.add('character');
  if (combined.includes('landscape')) tags.add('landscape');
  if (combined.includes('food') || combined.includes('drink')) tags.add('food');
  if (combined.includes('animal') || combined.includes('cat') || combined.includes('dog')) tags.add('animal');
  if (combined.includes('architecture') || combined.includes('building')) tags.add('architecture');
  if (combined.includes('logo')) tags.add('logo');
  if (combined.includes('icon')) tags.add('icon');
  if (combined.includes('poster') || combined.includes('flyer')) tags.add('poster');
  if (combined.includes('typography') || combined.includes('text')) tags.add('typography');
  if (combined.includes('infographic')) tags.add('infographic');
  if (combined.includes('ui') || combined.includes('mockup')) tags.add('ui-mockup');
  if (combined.includes('game')) tags.add('game');

  return Array.from(tags).slice(0, 5);
}

function inferCategory(sectionHeader: string, title: string): string {
  const haystack = (sectionHeader + ' ' + title).toLowerCase();
  if (haystack.includes('portrait') || haystack.includes('photograph')) return 'photography';
  if (haystack.includes('poster') || haystack.includes('illustration')) return 'poster';
  if (haystack.includes('game') || haystack.includes('entertainment')) return 'game-asset';
  if (haystack.includes('ui') || haystack.includes('mockup')) return 'ui-mockup';
  if (haystack.includes('character') || haystack.includes('reference sheet')) return 'character';
  if (haystack.includes('typography') || haystack.includes('infographic')) return 'infographic';
  if (haystack.includes('image editing') || haystack.includes('style transfer')) return 'edit';
  if (haystack.includes('video') || haystack.includes('animation')) return 'animation';
  if (haystack.includes('social media')) return 'social-media';
  return 'general';
}

interface ParseOptions {
  source: SourceConfig;
  markdown: string;
}

function parseReadme({ source, markdown }: ParseOptions): ParsedPrompt[] {
  const prompts: ParsedPrompt[] = [];

  // Build section map (## headers) → for category inference per block.
  const sections: { line: number; header: string }[] = [];
  const lines = markdown.split('\n');
  lines.forEach((line, idx) => {
    if (line.startsWith('## ') && !line.startsWith('## [')) {
      sections.push({ line: idx, header: line.slice(3).trim() });
    }
  });
  function sectionForLine(lineNo: number): string {
    let current = 'general';
    for (const s of sections) {
      if (s.line > lineNo) break;
      current = s.header;
    }
    return current;
  }

  // Split on `^### ` (start-of-line h3). slice(1) drops content before first h3.
  const segments = markdown.split(/\n### /);
  // The first segment is everything before the first ### so skip it.
  // Subsequent segments start with the title text.

  let counter = 0;
  let runningLine = 0; // approximate line counter for section lookup
  // Pre-compute char-offset → line map for accurate section attribution
  const lineStartOffsets: number[] = [0];
  for (let i = 0; i < markdown.length; i++) {
    if (markdown[i] === '\n') lineStartOffsets.push(i + 1);
  }
  function lineForOffset(off: number): number {
    // binary search
    let lo = 0;
    let hi = lineStartOffsets.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStartOffsets[mid] <= off) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }

  let cursor = 0;
  // Re-walk segments using indexOf so we know each block's char offset.
  const splitMarker = '\n### ';
  cursor = markdown.indexOf('### ');
  if (cursor !== 0 && cursor !== -1) {
    // Move cursor to first ### at start-of-line (handle case where doc opens with H1/H2).
    const firstSol = markdown.indexOf('\n### ');
    cursor = firstSol === -1 ? markdown.indexOf('### ') : firstSol + 1;
  }

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    const offset = (() => {
      // Find position of this segment in markdown — search forward from running cursor.
      const idx = markdown.indexOf(splitMarker + segment.slice(0, 80), cursor);
      if (idx === -1) return cursor;
      cursor = idx + splitMarker.length + segment.length;
      return idx + 1; // +1 to skip the leading \n
    })();
    void runningLine;

    const newlineIdx = segment.indexOf('\n');
    if (newlineIdx === -1) continue;
    const rawTitle = segment.slice(0, newlineIdx).trim();
    const body = segment.slice(newlineIdx + 1);

    // Skip TOC link headings (### [Foo](#foo)) and obvious non-prompt sections.
    if (rawTitle.startsWith('[')) continue;
    if (/^(resources|contributing|click here|table of contents|why|api usage|languages?)/i.test(rawTitle)) continue;

    // Find prompt text — multiple supported shapes:
    //   1. **Prompt:** ```text\n...\n``` (Anil-matcha, ZeroLu)
    //   2. **Prompt Text:** `...` (ImgEdify — single backtick wrap, may span lines)
    //   3. Fallback: first fenced code block in body
    let promptText = '';
    const promptLabelMatch = body.match(/\*\*Prompt:\*\*\s*\n+```(?:[a-zA-Z]*)?\n([\s\S]*?)\n?```/);
    if (promptLabelMatch) {
      promptText = promptLabelMatch[1].trim();
    } else {
      const promptTextMatch = body.match(/\*\*Prompt Text:\*\*\s*`([\s\S]*?)`(?=\n|\s*-\s|$)/);
      if (promptTextMatch) {
        promptText = promptTextMatch[1].trim();
      } else {
        const fallback = body.match(/```(?:[a-zA-Z]*)?\n([\s\S]*?)\n?```/);
        if (fallback) promptText = fallback[1].trim();
      }
    }
    if (!promptText || promptText.length < 20) continue;

    // Extract attribution — try **Source:** first (Anil/ZeroLu), then **Author:** (ImgEdify),
    // then any [name](url) on a line containing "by". Take the LAST author link
    // (some entries chain "Source: [orig] | [republisher]").
    let sourceName = `via ${source.name}`;
    let sourceUrl = source.repoUrl;
    const attrMatch =
      body.match(/\*\*?Source:?\*\*?\s*([^\n]+)/i) ||
      body.match(/\*\*?Author:?\*\*?\s*([^\n]+)/i);
    if (attrMatch) {
      const linkMatches = Array.from(attrMatch[1].matchAll(/\[([^\]]+)\]\(([^)]+)\)/g));
      if (linkMatches.length > 0) {
        const last = linkMatches[linkMatches.length - 1];
        const rawName = last[1].replace(/^@/, '');
        sourceName = rawName.startsWith('http') ? `via ${source.name}` : `@${rawName}`;
        sourceUrl = last[2];
      }
    }

    // Image extraction (skip badges / shields)
    const images: string[] = [];
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["']/g;
    let imgMatch;
    while ((imgMatch = imgTagRegex.exec(body)) !== null) {
      const url = imgMatch[1];
      if (!url.includes('shields.io') && !url.includes('badge') && !url.startsWith('assets/')) {
        images.push(url);
      }
    }
    const mdImageRegex = /!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g;
    let mdMatch;
    while ((mdMatch = mdImageRegex.exec(body)) !== null) {
      const url = mdMatch[1];
      if (!images.includes(url) && !url.includes('shields.io') && !url.includes('badge')) {
        images.push(url);
      }
    }

    const sectionHeader = sectionForLine(lineForOffset(offset));
    const category = inferCategory(sectionHeader, rawTitle);
    const tags = generateTags(rawTitle, promptText, category);

    counter++;
    const id = source.idOffset + counter;
    const slug = `${source.slugPrefix}-${counter}`;

    let model = source.defaultModel;
    if (/nano banana 2/i.test(body) && /gpt-image/i.test(body)) {
      model = 'GPT-Image-2 / Nano Banana 2';
    }

    prompts.push({
      id,
      slug,
      title: rawTitle.length > 120 ? rawTitle.substring(0, 117) + '...' : rawTitle,
      source: { name: sourceName, url: sourceUrl },
      model,
      images,
      prompts: [promptText],
      tags,
      coverImage: images[0] || null,
      category,
      origin: { repo: source.repo, repoUrl: source.repoUrl },
    });
  }

  return prompts;
}

async function fetchSource(source: SourceConfig): Promise<ParsedPrompt[]> {
  console.log(`📥 Fetching ${source.repo}...`);
  const response = await fetch(source.readmeUrl);
  if (!response.ok) {
    console.error(`   ❌ Failed (${response.status}) — skipping`);
    return [];
  }
  const markdown = await response.text();
  console.log(`   Downloaded ${(markdown.length / 1024).toFixed(1)}KB`);
  const parsed = parseReadme({ source, markdown });
  console.log(`   ✅ Parsed ${parsed.length} prompts`);
  return parsed;
}

async function main() {
  console.log('🚀 Fetching X-curated GPT-Image-2 / GPT-4o prompts (3 sources)...\n');

  const allNew: ParsedPrompt[] = [];
  for (const source of SOURCES) {
    const parsed = await fetchSource(source);
    allNew.push(...parsed);
  }

  console.log(`\n📊 Parsed ${allNew.length} new prompts across ${SOURCES.length} sources`);

  // Load existing prompts
  let existingPrompts: ParsedPrompt[] = [];
  if (existsSync(EXISTING_PROMPTS_FILE)) {
    const existingData = readFileSync(EXISTING_PROMPTS_FILE, 'utf-8');
    existingPrompts = JSON.parse(existingData);
    console.log(`📂 Loaded ${existingPrompts.length} existing prompts`);
  }

  // Strip any prior runs of these sources by id range, so re-runs are idempotent.
  const newRanges = SOURCES.map((s) => [s.idOffset, s.idOffset + 9999] as const);
  const filteredExisting = existingPrompts.filter((p) => {
    return !newRanges.some(([min, max]) => p.id >= min && p.id <= max);
  });
  if (filteredExisting.length !== existingPrompts.length) {
    console.log(`🧹 Removed ${existingPrompts.length - filteredExisting.length} stale entries from prior runs`);
  }

  const merged = [...allNew, ...filteredExisting];
  console.log(`\n📦 Total after merge: ${merged.length}`);

  writeFileSync(EXISTING_PROMPTS_FILE, JSON.stringify(merged, null, 2));
  console.log(`   ✅ Wrote ${EXISTING_PROMPTS_FILE}`);

  // Update meta.json (preserve previous source list, add new ones)
  let meta: {
    lastFetched?: string;
    imagePromptsCount?: number;
    videoPromptsCount?: number;
    sources?: { imagePrompts?: string[]; videoPrompts?: string };
  } = {};
  if (existsSync(META_FILE)) {
    meta = JSON.parse(readFileSync(META_FILE, 'utf-8'));
  }
  const allImageSources = new Set<string>([
    ...(meta.sources?.imagePrompts ?? []),
    ...SOURCES.map((s) => s.repoUrl),
  ]);
  meta = {
    lastFetched: new Date().toISOString(),
    imagePromptsCount: merged.length,
    videoPromptsCount: meta.videoPromptsCount ?? 50,
    sources: {
      imagePrompts: Array.from(allImageSources),
      videoPrompts: meta.sources?.videoPrompts ?? 'https://github.com/songguoxs/awesome-video-prompts',
    },
  };
  writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
  console.log(`   ✅ Updated ${META_FILE}`);

  console.log('\n✨ Done.');
  for (const source of SOURCES) {
    const count = allNew.filter((p) => p.id >= source.idOffset && p.id < source.idOffset + 10000).length;
    console.log(`   ${source.name.padEnd(15)} ${count} prompts`);
  }
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
