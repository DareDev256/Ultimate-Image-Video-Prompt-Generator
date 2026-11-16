import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { buildSwipeCards, fillSlots, loadSwipeCards, snippet } from './swipe-cards';

// The loader reads public/data relative to the app root (Next runs from web/);
// the repo-root `bun test` runs from one level up.
process.chdir(join(import.meta.dir, '..', '..', '..'));

describe('swipe cards', () => {
  test('every live card has its highlighted phrase inside its own prompt', () => {
    const cards = loadSwipeCards();
    expect(cards.length).toBeGreaterThan(50);
    for (const c of cards) {
      expect(c.full).toContain(c.hit);
      expect(c.subj).toHaveLength(3);
    }
  });

  test('no two cards share an image (a shared image shows the wrong prompt)', () => {
    const imgs = loadSwipeCards().map((c) => c.img);
    expect(new Set(imgs).size).toBe(imgs.length);
  });

  test('an image attached to two prompts is dropped from the feed', () => {
    const src = { name: '@a', url: 'https://x.com/a' };
    const showcase = [
      { id: 'g1', image: '/i/1.png', rawPrompt: 'shot on 35mm film', model: 'M', source: src },
      { id: 'g2', image: '/i/1.png', rawPrompt: 'a watercolor map', model: 'M', source: src },
      { id: 'g3', image: '/i/3.png', rawPrompt: 'hard top key light', model: 'M', source: src },
    ];
    const copy = [
      { id: 'g1', ing: 'Lens', hit: '35mm film', why: 'w', subj: ['a', 'b', 'c'] },
      { id: 'g3', ing: 'Light', hit: 'hard top key light', why: 'w', subj: ['a', 'b', 'c'] },
    ];
    expect(buildSwipeCards(showcase, copy).map((c) => c.id)).toEqual(['g3']);
  });

  test('snippet trims long context at word boundaries and keeps the hit whole', () => {
    const raw = 'word '.repeat(80) + 'THE MOVE' + ' tail'.repeat(60);
    const s = snippet(raw, 'THE MOVE')!;
    expect(s.hit).toBe('THE MOVE');
    expect(s.pre.startsWith('…')).toBe(true);
    expect(s.pre.length).toBeLessThanOrEqual(92);
    expect(s.post.endsWith('…')).toBe(true);
    expect(snippet(raw, 'not there')).toBeNull();
  });

  test('template slots read as their default', () => {
    expect(fillSlots('a {argument name="brand" default="Acme"} can')).toBe('a Acme can');
  });
});
