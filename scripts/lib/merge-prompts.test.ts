import { describe, expect, test } from 'bun:test';
import { mergePrompts } from './merge-prompts';

const opts = { rangeStart: 10000, rangeEnd: 20000, slugPrefix: 'nano-banana-' };
const P = (id: number, text: string, extra: Record<string, unknown> = {}) => ({ id, slug: `nano-banana-${id - 10000}`, prompts: [text], ...extra });

describe('mergePrompts', () => {
  test('a new upstream No. 1 never takes an id that is already used', () => {
    const existing = [P(10001, 'old prompt one'), P(10002, 'old prompt two')];
    const fresh = [P(10001, 'brand new prompt')];
    const { merged, added } = mergePrompts(fresh, existing, opts);
    expect(added).toHaveLength(1);
    expect(added[0].id).toBe(10003);
    expect(added[0].slug).toBe('nano-banana-3');
    expect(new Set(merged.map((p) => p.id)).size).toBe(merged.length);
  });

  test('a prompt already in the library is skipped, by text or by youmindId', () => {
    const existing = [P(10001, 'Same  Prompt text', { youmindId: 77 })];
    const fresh = [P(10001, 'same prompt text'), P(10002, 'reworded upstream', { youmindId: '77' })];
    const { added } = mergePrompts(fresh, existing, opts);
    expect(added).toHaveLength(0);
  });

  test('refuses to write a library that already holds a duplicate id', () => {
    const existing = [P(10001, 'a'), P(10001, 'b')];
    expect(() => mergePrompts([], existing, opts)).toThrow(/duplicate id/);
  });
});
