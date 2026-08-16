/**
 * Generates web/src/lib/shot-grammar-terms.ts — the vocabulary the shot
 * scorer grades against.
 *
 * Two sources, in this order:
 *
 * 1. The seed dictionary in extract-patterns.ts, un-truncated. That script
 *    writes patterns.json for the UI and caps each bucket at the top 30 by
 *    frequency, which is right for a "popular terms" panel and wrong for a
 *    scorer — the tail is where the specific language lives. We take the
 *    whole seed list and keep the real corpus counts.
 *
 * 2. Phrases actually mined out of the corpus. The seed list is hand-written,
 *    so it only contains language somebody thought of in advance. Scoring
 *    1,427 working prompts against it left 182 long, well-specified English
 *    prompts reading as "flat" — they said "harsh flash", "grainy",
 *    "black mist filter", none of which were in the seed list. This pass
 *    finds frequent n-grams in the corpus and keeps the ones that carry an
 *    axis marker, so assignment stays explainable rather than guessed.
 *
 * Run:  bun run scripts/build-shot-grammar-terms.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const OUT = join(ROOT, 'web/src/lib/shot-grammar-terms.ts');
const IMAGE_PROMPTS = join(ROOT, 'web/public/data/image-prompts.json');
const VIDEO_PROMPTS = join(ROOT, 'web/public/data/video-prompts.json');

type Axis = 'subject' | 'setting' | 'light' | 'camera' | 'grade' | 'mood';
const AXES: Axis[] = ['subject', 'setting', 'light', 'camera', 'grade', 'mood'];

/** extract-patterns.ts bucket → scoring axis. */
const BUCKET_TO_AXIS: Record<string, Axis> = {
  subjects: 'subject',
  environments: 'setting',
  lighting: 'light',
  cameras: 'camera',
  colorGrades: 'grade',
  moods: 'mood',
  styles: 'mood',
  compositions: 'mood',
};

/**
 * A mined phrase joins an axis only if it contains one of these markers.
 * Anything unassignable is dropped rather than guessed at — a scorer that
 * silently invents axis membership is worse than a smaller vocabulary.
 */
const AXIS_MARKERS: Record<Axis, RegExp> = {
  subject: /\b(man|woman|girl|boy|child|person|people|model|figure|portrait of|cat|dog|animal|creature|character|product|food|hands?)\b/,
  setting: /\b(room|street|city|studio|interior|exterior|indoor|outdoor|background|backdrop|landscape|station|platform|shop|store|cafe|restaurant|bar|club|office|warehouse|forest|woods|beach|shore|coast|harbou?r|dock|pier|desert|mountain|(?<!depth of )field|meadow|road|highway|bridge|rooftop|roof|alley|yard|hall|market|park|garden|house|apartment|building|kitchen|bedroom|bathroom|corridor|hallway|wall|floor|landscape|cityscape|skyline)\b/,
  light: /\b(light|lighting|lit|flash|glow|glowing|shadow|shadows|backlit|rim|neon|sunlight|daylight|fluorescent|tungsten|softbox|golden hour|silhouette|highlight)\b/,
  camera: /\b(\d{2,3}mm|lens|angle|shot|close-?up|wide|telephoto|macro|pov|aerial|drone|handheld|tripod|depth of field|bokeh|focus|framing|crop|zoom|pan|tilt|dolly|tracking)\b/,
  grade: /\b(grade|graded|grading|film|stock|grain|grainy|saturat\w*|desaturat\w*|contrast|tone|tones|toned|colou?r|monochrome|sepia|teal|orange|pastel|muted|vivid|bleach|lut|kodak|fuji|cinestill|portra)\b/,
  mood: /\b(mood|moody|aesthetic|vibe|feel|feeling|atmosphere|atmospheric|style|styled|cinematic|editorial|documentary|dreamy|nostalgic|melancholic|serene|tense|eerie|whimsical|minimal\w*|retro|vintage|futuristic)\b/,
};

/** Words that are common in English before they are meaningful in a prompt. */
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'with', 'for',
  'is', 'are', 'was', 'were', 'be', 'been', 'by', 'as', 'that', 'this', 'it',
  'from', 'into', 'over', 'under', 'her', 'his', 'their', 'its', 'she', 'he',
  'they', 'you', 'your', 'has', 'have', 'but', 'not', 'no', 'all', 'more',
  'very', 'one', 'two', 'up', 'out', 'so', 'if', 'than', 'then', 'there',
  'image', 'photo', 'picture', 'prompt', 'create', 'generate', 'make', 'show',
]);

/**
 * Terms too generic to be evidence, even when frequent.
 * `raw` means RAW format in maybe a third of its 125 hits; counting it as a
 * colour-grade signal scores "a raw egg" as graded.
 */
const TOO_GENERIC = new Set([
  'raw', 'log', 'flat', 'clean', 'dark', 'warm', 'cool', 'soft', 'subtle',
  'depth', 'contrast', 'light', 'character', 'style', 'quality', 'detail',
  'color', 'colour', 'shot', 'scene', 'view', 'high', 'low', 'full', 'real',
  // Collides with "depth of field", which is a camera term, not a location.
  'field',
]);

function loadCorpus(): string[] {
  const out: string[] = [];
  for (const path of [IMAGE_PROMPTS, VIDEO_PROMPTS]) {
    const raw = JSON.parse(readFileSync(path, 'utf8'));
    const items: any[] = Array.isArray(raw)
      ? raw
      : (Object.values(raw).find(Array.isArray) as any[]) ?? [];
    for (const item of items) {
      const texts = Array.isArray(item?.prompts) ? item.prompts : [item?.prompt];
      for (const t of texts) if (typeof t === 'string' && t.trim()) out.push(t);
    }
  }
  return out;
}

/** Latin-script only. The corpus is bilingual and the vocabulary is English. */
function isLatin(s: string): boolean {
  return !/[　-鿿가-힯]/.test(s);
}

/** Read the seed dictionary out of extract-patterns.ts without executing it. */
function loadSeedBuckets(): Record<string, string[]> {
  const src = readFileSync(join(ROOT, 'scripts/extract-patterns.ts'), 'utf8');
  const body = src.slice(src.indexOf('const PATTERNS'));
  const buckets: Record<string, string[]> = {};
  const re = /(\w+):\s*\[([^\]]*)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const [, name, inner] = m;
    if (!BUCKET_TO_AXIS[name]) continue;
    buckets[name] = [...inner.matchAll(/'([^']+)'/g)]
      .map((x) => x[1].toLowerCase().trim())
      // The bucket body is matched textually, so a stray capture across a
      // line boundary is possible. A seed term must contain a letter.
      .filter((t) => /[a-z]/.test(t) && !/[\n\r]/.test(t));
  }
  return buckets;
}

function mineNgrams(corpus: string[], minCount: number): Map<string, number> {
  const counts = new Map<string, number>();
  for (const prompt of corpus) {
    if (!isLatin(prompt)) continue;
    const words = prompt
      .toLowerCase()
      .replace(/[^a-z0-9:\-\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    const seen = new Set<string>();
    for (let n = 1; n <= 3; n++) {
      for (let i = 0; i + n <= words.length; i++) {
        const gram = words.slice(i, i + n).join(' ').replace(/^[:\-\s]+|[:\-\s]+$/g, '');
        if (gram.length < 4 || gram.length > 34) continue;
        // Must read as a phrase: starts and ends alphanumeric, no stray
        // punctuation inside beyond a ratio colon or a hyphen. Structured
        // prompts ("Subject: young woman") otherwise leak the label colon
        // into the term and every axis grows a ": woman" duplicate.
        if (!/^[a-z0-9][a-z0-9 :\-]*[a-z0-9]$/.test(gram)) continue;
        const parts = gram.split(' ');
        if (STOPWORDS.has(parts[0]) || STOPWORDS.has(parts[parts.length - 1])) continue;
        if (parts.every((p) => STOPWORDS.has(p))) continue;
        seen.add(gram);
      }
    }
    // Count each phrase once per prompt: a prompt that repeats "lighting"
    // six times is not six pieces of evidence.
    for (const gram of seen) counts.set(gram, (counts.get(gram) ?? 0) + 1);
  }
  return new Map([...counts].filter(([, c]) => c >= minCount));
}

function main() {
  const corpus = loadCorpus();
  const latin = corpus.filter(isLatin);
  const seeds = loadSeedBuckets();

  // Real corpus counts for every term, seeded or mined.
  const lowered = latin.map((p) => p.toLowerCase());
  const countOf = (term: string) => lowered.reduce((n, p) => n + (p.includes(term) ? 1 : 0), 0);

  const byAxis: Record<Axis, Map<string, number>> = {
    subject: new Map(), setting: new Map(), light: new Map(),
    camera: new Map(), grade: new Map(), mood: new Map(),
  };

  let seeded = 0;
  for (const [bucket, terms] of Object.entries(seeds)) {
    const axis = BUCKET_TO_AXIS[bucket];
    for (const term of terms) {
      if (TOO_GENERIC.has(term)) continue;
      const c = countOf(term);
      if (c === 0) continue;
      byAxis[axis].set(term, Math.max(byAxis[axis].get(term) ?? 0, c));
      seeded++;
    }
  }

  let mined = 0;
  const ngrams = mineNgrams(latin, 8);
  for (const [gram, count] of ngrams) {
    if (TOO_GENERIC.has(gram)) continue;
    for (const axis of AXES) {
      if (!AXIS_MARKERS[axis].test(gram)) continue;
      // Don't let a mined phrase displace a seeded one; keep the higher count.
      if (!byAxis[axis].has(gram)) mined++;
      byAxis[axis].set(gram, Math.max(byAxis[axis].get(gram) ?? 0, count));
      break; // first matching axis wins — markers are ordered by specificity
    }
  }

  const axes: Record<string, { term: string; weight: number }[]> = {};
  for (const axis of AXES) {
    axes[axis] = [...byAxis[axis].entries()]
      .map(([term, count]) => ({ term, weight: Math.round(Math.log2(count + 1) * 100) / 100 }))
      .sort((a, b) => b.weight - a.weight || a.term.localeCompare(b.term));
  }

  const total = Object.values(axes).reduce((n, t) => n + t.length, 0);

  const banner = `// GENERATED by scripts/build-shot-grammar-terms.ts — do not edit by hand.
// ${total} terms across ${AXES.length} axes, from ${latin.length} Latin-script corpus prompts.
// Regenerate with: bun run scripts/build-shot-grammar-terms.ts
`;

  const markerSrc = Object.fromEntries(
    AXES.map((a) => [a, AXIS_MARKERS[a].source]),
  );

  const body = `
export interface ShotTerm {
  /** Lowercased phrase matched against the prompt. */
  term: string;
  /** log2(corpus frequency) — a common term outweighs a rare one without swamping it. */
  weight: number;
}

export const SHOT_TERMS: Record<string, ShotTerm[]> = ${JSON.stringify(axes, null, 2)};

/**
 * Broad category words per axis, used as a FLOOR when no vocabulary term
 * matches. The vocabulary is a closed list, so a prompt that specifies its
 * setting in words nobody happened to mine ("a rain-slicked harbour wall")
 * would otherwise score zero on an axis it clearly addressed. A marker hit
 * is weak evidence and scores as such; it never outranks a real term match.
 */
export const AXIS_MARKER_SOURCES: Record<string, string> = ${JSON.stringify(markerSrc, null, 2)};
`;

  writeFileSync(OUT, banner + body);
  console.log(`wrote ${OUT}`);
  console.log(`  corpus: ${corpus.length} prompts, ${latin.length} Latin-script`);
  console.log(`  ${seeded} seeded + ${mined} mined = ${total} terms`);
  for (const axis of AXES) {
    console.log(`  ${axis.padEnd(8)} ${String(axes[axis].length).padStart(4)}  top: ${axes[axis].slice(0, 3).map((t) => t.term).join(', ')}`);
  }
}

main();
