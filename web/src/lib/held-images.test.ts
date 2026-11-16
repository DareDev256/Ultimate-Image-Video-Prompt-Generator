import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HELD_IMAGES, isHeldImage } from './held-images';
import { HOLO_CARDS } from '@/components/hero/holo-cards-manifest';
import feedCards from '@/data/feed-cards.json';

const WEB = join(import.meta.dir, '..', '..');
const showcase = JSON.parse(readFileSync(join(WEB, 'public', 'data', 'generated-showcase.json'), 'utf-8')) as {
  id: string;
  image: string;
}[];
const imageOf = new Map(showcase.map((s) => [s.id, s.image]));
const PERSON_OR_SUGGESTIVE = /celebr|famous|athlete|politic|suggestive/i;

describe('held images', () => {
  test('every feed card held for a real person or suggestive content is held on /showcase too', () => {
    const missing = (feedCards as { id: string; skip?: boolean; skipReason?: string }[])
      .filter((c) => c.skip && PERSON_OR_SUGGESTIVE.test(c.skipReason ?? ''))
      .map((c) => imageOf.get(c.id))
      .filter((img) => !isHeldImage(img));
    expect(missing).toEqual([]);
  });

  test('the desktop hero cloud carries none of them', () => {
    expect(HOLO_CARDS.filter((p) => isHeldImage(p))).toEqual([]);
  });

  test('each held path is a real file, so a typo cannot hold nothing', () => {
    const absent = Object.keys(HELD_IMAGES).filter((p) => !existsSync(join(WEB, 'public', p)));
    expect(absent).toEqual([]);
  });

  test('isHeldImage matches exact paths only', () => {
    expect(isHeldImage('/generated-inspiration/nano-banana-1.png')).toBe(true);
    expect(isHeldImage('/generated-inspiration/nano-banana-2.png')).toBe(false);
    expect(isHeldImage(undefined)).toBe(false);
    expect(isHeldImage('toString')).toBe(false);
  });
});
