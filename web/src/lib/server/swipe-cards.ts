/**
 * Builds the swipe feed's cards on the server: the teaching copy in
 * src/data/feed-cards.json joined to the generated showcase image and the
 * prompt that made it. Only showcase entries whose image belongs to exactly
 * one prompt are eligible (10 images used to sit under two prompts each).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import feedCards from '@/data/feed-cards.json';
import type { SwipeCard } from '@/lib/swipe-types';

export interface ShowcaseEntry {
  id: string;
  image: string;
  rawPrompt: string;
  model: string;
  source: { name: string; url: string };
}

export interface CardCopy {
  id: string;
  ing: string;
  hit: string;
  why: string;
  subj: string[];
  skip?: boolean;
}

/** YouMind template slots: {argument name="x" default="y"} reads as y. */
export const fillSlots = (s: string) => s.replace(/\{argument name="[^"]*" default="([^"]*)"\}/g, '$1');

const PRE_MAX = 90;
const POST_MAX = 70;

export function snippet(raw: string, hit: string): { pre: string; hit: string; post: string } | null {
  const i = raw.indexOf(hit);
  if (i < 0) return null;
  let pre = raw.slice(0, i);
  let post = raw.slice(i + hit.length);
  if (pre.length > PRE_MAX) pre = '…' + pre.slice(pre.length - PRE_MAX).replace(/^\S*\s/, '');
  if (post.length > POST_MAX) post = post.slice(0, POST_MAX).replace(/\s\S*$/, '') + '…';
  return { pre: fillSlots(pre), hit: fillSlots(hit), post: fillSlots(post) };
}

let cache: SwipeCard[] | null = null;

export function loadSwipeCards(): SwipeCard[] {
  if (cache) return cache;
  const showcase = JSON.parse(
    readFileSync(join(process.cwd(), 'public', 'data', 'generated-showcase.json'), 'utf-8'),
  ) as ShowcaseEntry[];
  cache = buildSwipeCards(showcase, feedCards as CardCopy[]);
  return cache;
}

export function buildSwipeCards(showcase: ShowcaseEntry[], copy: CardCopy[]): SwipeCard[] {
  const imageUses = new Map<string, number>();
  for (const s of showcase) imageUses.set(s.image, (imageUses.get(s.image) ?? 0) + 1);
  const byId = new Map(showcase.map((s) => [s.id, s]));

  const out: SwipeCard[] = [];
  for (const c of copy) {
    if (c.skip) continue;
    const s = byId.get(c.id);
    if (!s || imageUses.get(s.image) !== 1) continue;
    const snip = snippet(s.rawPrompt, c.hit);
    if (!snip) continue;
    out.push({
      id: c.id,
      img: s.image,
      ing: c.ing,
      ...snip,
      why: c.why,
      subj: c.subj,
      by: s.source.name,
      byUrl: s.source.url,
      model: s.model,
      full: fillSlots(s.rawPrompt),
    });
  }
  return out;
}
