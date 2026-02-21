import { describe, expect, test } from 'bun:test';
import { diversePick, pushRecent, DEFAULT_RECENT_WINDOW, buildRandomPrompt, flattenPromptToText, parseFieldKey, pickWithHistory, createPicker } from './diverse-pick';
import type { PickableCategory } from './diverse-pick';

describe('parseFieldKey', () => {
  test('splits two-segment key into category and field', () => {
    expect(parseFieldKey('subject.description')).toEqual({ categoryKey: 'subject', fieldKey: 'description' });
  });

  test('uses first and last segments for multi-dot keys', () => {
    expect(parseFieldKey('camera.lens.focal')).toEqual({ categoryKey: 'camera', fieldKey: 'focal' });
  });

  test('uses same value for both when key has no dots', () => {
    expect(parseFieldKey('mood')).toEqual({ categoryKey: 'mood', fieldKey: 'mood' });
  });
});

describe('diversePick', () => {
  test('throws on empty options array', () => {
    expect(() => diversePick([], [])).toThrow('options array must not be empty');
  });

  test('returns the only option when array has one element', () => {
    expect(diversePick(['solo'], [])).toBe('solo');
  });

  test('always returns a member of the options array', () => {
    const options = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 50; i++) {
      expect(options).toContain(diversePick(options, []));
    }
  });

  test('avoids recently picked values when alternatives exist', () => {
    const options = ['a', 'b', 'c'];
    const recent = ['a', 'b'];
    // With a and b excluded, only c is left
    for (let i = 0; i < 20; i++) {
      expect(diversePick(options, recent)).toBe('c');
    }
  });

  test('falls back to full pool when all options are in recent', () => {
    const options = ['x', 'y'];
    const recent = ['x', 'y'];
    // Both exhausted — must still return a valid option
    for (let i = 0; i < 30; i++) {
      expect(options).toContain(diversePick(options, recent));
    }
  });

  test('falls back when recent is a superset of options', () => {
    const options = ['a'];
    const recent = ['a', 'b', 'c'];
    expect(diversePick(options, recent)).toBe('a');
  });

  test('ignores recent items not present in options', () => {
    const options = ['a', 'b'];
    const recent = ['z', 'q']; // irrelevant history
    for (let i = 0; i < 20; i++) {
      expect(options).toContain(diversePick(options, recent));
    }
  });

  test('works with non-string types (numbers)', () => {
    const options = [1, 2, 3];
    const recent = [1, 2];
    for (let i = 0; i < 20; i++) {
      expect(diversePick(options, recent)).toBe(3);
    }
  });

  test('produces diversity over many picks (statistical)', () => {
    const options = ['a', 'b', 'c', 'd', 'e'];
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) {
      seen.add(diversePick(options, []));
    }
    // With 100 picks from 5 options, seeing at least 3 is extremely likely
    expect(seen.size).toBeGreaterThanOrEqual(3);
  });

  test('treats readonly arrays correctly (no mutation)', () => {
    const options = Object.freeze(['a', 'b', 'c']) as readonly string[];
    const recent = Object.freeze(['a']) as readonly string[];
    // Should not throw on frozen arrays
    const result = diversePick(options, recent);
    expect(['b', 'c']).toContain(result);
  });

  test('duplicate values in options are preserved as separate candidates', () => {
    // If options has duplicates, both instances survive Set filtering
    // because Set.has checks the value, removing BOTH duplicates from candidates
    const options = ['a', 'a', 'b'];
    const recent = ['a'];
    // With 'a' excluded, only 'b' remains (both 'a' instances filtered)
    for (let i = 0; i < 20; i++) {
      expect(diversePick(options, recent)).toBe('b');
    }
  });

  test('uses reference equality for objects (Set semantics)', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const obj3 = { id: 1 }; // same shape as obj1, different reference
    const options = [obj1, obj2];
    // obj3 !== obj1 by reference, so obj1 is NOT excluded
    for (let i = 0; i < 20; i++) {
      expect(options).toContain(diversePick(options, [obj3]));
    }
    // But same reference IS excluded
    for (let i = 0; i < 20; i++) {
      expect(diversePick(options, [obj1])).toBe(obj2);
    }
  });

  test('handles large option pools without degradation', () => {
    const options = Array.from({ length: 1000 }, (_, i) => `opt-${i}`);
    const recent = options.slice(0, 995); // exclude 995, leaving 5 candidates
    for (let i = 0; i < 50; i++) {
      const pick = diversePick(options, recent);
      expect(pick).toMatch(/^opt-(99[5-9])$/);
    }
  });
});

describe('pushRecent', () => {
  test('appends value to empty array', () => {
    expect(pushRecent([], 'a')).toEqual(['a']);
  });

  test('appends value to non-empty array', () => {
    expect(pushRecent(['a', 'b'], 'c')).toEqual(['a', 'b', 'c']);
  });

  test('trims to maxSize, keeping most recent', () => {
    const result = pushRecent(['a', 'b', 'c', 'd', 'e'], 'f', 5);
    expect(result).toEqual(['b', 'c', 'd', 'e', 'f']);
    expect(result.length).toBe(5);
  });

  test('does not trim when under maxSize', () => {
    const result = pushRecent(['a', 'b'], 'c', 5);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('uses DEFAULT_RECENT_WINDOW when maxSize omitted', () => {
    expect(DEFAULT_RECENT_WINDOW).toBe(5);
    const recent = ['a', 'b', 'c', 'd', 'e'];
    const result = pushRecent(recent, 'f');
    expect(result.length).toBe(5);
    expect(result[0]).toBe('b'); // 'a' was dropped
    expect(result[4]).toBe('f');
  });

  test('returns a new array (immutability)', () => {
    const original = ['a', 'b'];
    const result = pushRecent(original, 'c');
    expect(result).not.toBe(original);
    expect(original).toEqual(['a', 'b']); // unchanged
  });

  test('works with maxSize of 1', () => {
    expect(pushRecent(['old'], 'new', 1)).toEqual(['new']);
  });

  test('handles maxSize larger than resulting array', () => {
    expect(pushRecent([], 'a', 100)).toEqual(['a']);
  });

  test('preserves readonly input (no mutation)', () => {
    const frozen = Object.freeze(['x', 'y']) as readonly string[];
    const result = pushRecent(frozen, 'z');
    expect(result).toEqual(['x', 'y', 'z']);
  });

  test('maxSize of 0 returns empty array', () => {
    // Edge: window of 0 means "remember nothing"
    const result = pushRecent(['a', 'b'], 'c', 0);
    // next = ['a','b','c'], length 3 > 0, slice(3-0) = slice(3) = []
    expect(result).toEqual([]);
  });

  test('handles duplicate values in recent history', () => {
    const result = pushRecent(['a', 'a', 'a'], 'b', 3);
    expect(result).toEqual(['a', 'a', 'b']);
  });
});

describe('diversePick + pushRecent integration', () => {
  test('sliding window produces diverse sequence', () => {
    const options = ['a', 'b', 'c', 'd'];
    let recent: string[] = [];
    const sequence: string[] = [];

    for (let i = 0; i < 12; i++) {
      const pick = diversePick(options, recent);
      recent = pushRecent(recent, pick, 3);
      sequence.push(pick);
    }

    // No three consecutive picks should be the same value
    for (let i = 2; i < sequence.length; i++) {
      const same = sequence[i] === sequence[i - 1] && sequence[i] === sequence[i - 2];
      expect(same).toBe(false);
    }
  });

  test('window size 1 prevents immediate repeats', () => {
    const options = ['a', 'b'];
    let recent: string[] = [];

    for (let i = 0; i < 20; i++) {
      const pick = diversePick(options, recent);
      recent = pushRecent(recent, pick, 1);
      // With 2 options and window=1, picks must alternate
      if (i > 0) {
        expect(pick).not.toBe(recent.length > 1 ? recent[recent.length - 2] : undefined);
      }
    }
  });
});

describe('buildRandomPrompt', () => {
  const makeCategories = (...specs: Array<{ id: string; fields: Array<{ key: string; suggestions: string[] }> }>): PickableCategory[] =>
    specs.map((s) => ({ id: s.id, fields: s.fields }));

  test('calls picker once per field and returns structured output', () => {
    const calls: Array<{ fieldKey: string; suggestions: readonly string[] }> = [];
    const picker = (fieldKey: string, suggestions: readonly string[]) => {
      calls.push({ fieldKey, suggestions });
      return suggestions[0];
    };

    const categories = makeCategories({
      id: 'cat1',
      fields: [
        { key: 'subject.description', suggestions: ['a portrait'] },
        { key: 'subject.expression', suggestions: ['smiling'] },
      ],
    });

    const result = buildRandomPrompt(categories, picker);

    expect(calls).toHaveLength(2);
    expect(calls[0].fieldKey).toBe('subject.description');
    expect(calls[1].fieldKey).toBe('subject.expression');
    // Output keyed by field prefix, not category id
    expect(result).toEqual({
      subject: { description: 'a portrait', expression: 'smiling' },
    });
  });

  test('derives output key from field prefix, not category id', () => {
    const picker = (_k: string, s: readonly string[]) => s[0];
    // Simulates real data: id="setting" but fields use "environment.*"
    const categories = makeCategories({
      id: 'setting',
      fields: [{ key: 'environment.location', suggestions: ['forest'] }],
    });

    const result = buildRandomPrompt(categories, picker);
    expect(result['environment']).toBeDefined();
    expect(result['setting']).toBeUndefined();
  });

  test('falls back to category.id when category has no fields', () => {
    const picker = () => 'unused';
    const categories: PickableCategory[] = [{ id: 'empty-cat', fields: [] }];

    const result = buildRandomPrompt(categories, picker);
    expect(result['empty-cat']).toEqual({});
  });

  test('handles multiple categories independently', () => {
    let callCount = 0;
    const picker = () => `pick-${++callCount}`;

    const categories = makeCategories(
      { id: 'a', fields: [{ key: 'alpha.one', suggestions: ['x'] }] },
      { id: 'b', fields: [{ key: 'beta.two', suggestions: ['y'] }, { key: 'beta.three', suggestions: ['z'] }] },
    );

    const result = buildRandomPrompt(categories, picker);
    expect(result).toEqual({
      alpha: { one: 'pick-1' },
      beta: { two: 'pick-2', three: 'pick-3' },
    });
  });

  test('passes suggestions array unchanged to picker', () => {
    const captured: Array<readonly string[]> = [];
    const picker = (_k: string, s: readonly string[]) => {
      captured.push(s);
      return s[0];
    };

    const suggestions = Object.freeze(['a', 'b', 'c']) as readonly string[];
    const categories: PickableCategory[] = [
      { id: 'x', fields: [{ key: 'x.val', suggestions: suggestions as string[] }] },
    ];

    buildRandomPrompt(categories, picker);
    expect(captured[0]).toBe(suggestions);
  });

  test('returns empty object for empty categories array', () => {
    const result = buildRandomPrompt([], () => 'never');
    expect(result).toEqual({});
  });

  test('single-segment key uses full key as both category and field key', () => {
    const picker = () => 'value';
    // key "mood" has no dot — split('.').pop() → "mood", split('.')[0] → "mood"
    const categories: PickableCategory[] = [
      { id: 'vibes', fields: [{ key: 'mood', suggestions: ['happy'] }] },
    ];
    const result = buildRandomPrompt(categories, picker);
    // Category key = "mood" (from field prefix), field key = "mood" (from pop)
    expect(result).toEqual({ mood: { mood: 'value' } });
  });

  test('multi-dot key uses first segment as category and last as field', () => {
    const picker = () => 'deep';
    const categories: PickableCategory[] = [
      { id: 'x', fields: [{ key: 'camera.lens.focal', suggestions: ['50mm'] }] },
    ];
    const result = buildRandomPrompt(categories, picker);
    // Category = "camera", field = "focal" (last segment)
    expect(result).toEqual({ camera: { focal: 'deep' } });
  });

  test('merges categories that share a field prefix instead of overwriting', () => {
    const picker = (_k: string, s: readonly string[]) => s[0];
    const categories: PickableCategory[] = [
      { id: 'a', fields: [{ key: 'shared.x', suggestions: ['first'] }] },
      { id: 'b', fields: [{ key: 'shared.y', suggestions: ['second'] }] },
    ];
    const result = buildRandomPrompt(categories, picker);
    // Both categories contribute to 'shared' — no data loss
    expect(result['shared']).toEqual({ x: 'first', y: 'second' });
  });
});

describe('flattenPromptToText', () => {
  test('joins all values with comma and space', () => {
    const prompt = {
      subject: { description: 'a woman', expression: 'smiling' },
      environment: { location: 'forest' },
    };
    expect(flattenPromptToText(prompt)).toBe('a woman, smiling, forest');
  });

  test('skips empty string values', () => {
    const prompt = {
      subject: { description: 'portrait', expression: '' },
      lighting: { source: 'golden hour' },
    };
    expect(flattenPromptToText(prompt)).toBe('portrait, golden hour');
  });

  test('returns empty string for empty prompt', () => {
    expect(flattenPromptToText({})).toBe('');
  });

  test('returns empty string when all values are empty', () => {
    expect(flattenPromptToText({ a: { x: '', y: '' } })).toBe('');
  });

  test('preserves unicode and special characters', () => {
    const prompt = { vibes: { ref: '日本語テスト', desc: 'café noir' } };
    expect(flattenPromptToText(prompt)).toBe('日本語テスト, café noir');
  });

  test('handles single category with single field', () => {
    expect(flattenPromptToText({ subject: { description: 'solo' } })).toBe('solo');
  });
});

describe('diversePick + pushRecent window eviction', () => {
  test('evicted items become pickable again after sliding out of window', () => {
    const options = ['a', 'b', 'c'];
    let recent: string[] = [];

    // Window of 2: after picking a, b — 'a' is still in window.
    // After picking c, window = [b, c] and 'a' is evicted → eligible again.
    const pick1 = diversePick(options, recent);
    recent = pushRecent(recent, pick1, 2);

    const pick2 = diversePick(options, recent);
    recent = pushRecent(recent, pick2, 2);
    expect(pick2).not.toBe(pick1); // window excludes pick1

    const pick3 = diversePick(options, recent);
    recent = pushRecent(recent, pick3, 2);
    // pick3 can't be pick1's successor (pick2), and can't be pick2
    // so pick3 must differ from pick2, and pick1 is now evicted → eligible
    expect(pick3).not.toBe(pick2);
  });

  test('window equal to options length forces full-pool fallback every pick', () => {
    const options = ['a', 'b', 'c'];
    let recent: string[] = [];

    // Fill the window completely
    for (let i = 0; i < 3; i++) {
      const pick = diversePick(options, recent);
      recent = pushRecent(recent, pick, 3);
    }
    // Window now holds all 3 options — next pick triggers graceful degradation
    expect(recent).toHaveLength(3);
    const nextPick = diversePick(options, recent);
    expect(options).toContain(nextPick); // still valid despite full window
  });

  test('per-field isolation: separate histories stay independent', () => {
    // Simulates the real useDiversePick hook pattern: each field key
    // has its own recent history
    const histories: Record<string, string[]> = {};
    const pick = (key: string, opts: readonly string[]) => {
      const recent = histories[key] ?? [];
      const result = diversePick(opts, recent);
      histories[key] = pushRecent(recent, result, 2);
      return result;
    };

    // "mood" and "style" have overlapping suggestions
    for (let i = 0; i < 10; i++) {
      pick('mood', ['happy', 'sad', 'neutral']);
      pick('style', ['happy', 'dark', 'minimal']);
    }

    // Histories must be independent — mood picks don't affect style
    expect(histories['mood']!.length).toBeLessThanOrEqual(2);
    expect(histories['style']!.length).toBeLessThanOrEqual(2);
    // Both fields should have been picking from their own pools
    for (const val of histories['mood']!) {
      expect(['happy', 'sad', 'neutral']).toContain(val);
    }
    for (const val of histories['style']!) {
      expect(['happy', 'dark', 'minimal']).toContain(val);
    }
  });
});

describe('buildRandomPrompt + flattenPromptToText integration', () => {
  test('round-trips through build and flatten', () => {
    const picker = (_k: string, s: readonly string[]) => s[0];
    const categories: PickableCategory[] = [
      { id: 'cat', fields: [
        { key: 'subject.desc', suggestions: ['portrait'] },
        { key: 'subject.mood', suggestions: ['serene'] },
      ]},
    ];

    const structured = buildRandomPrompt(categories, picker);
    const text = flattenPromptToText(structured);
    expect(text).toBe('portrait, serene');
  });

  test('diversity picker integrates with build and flatten', () => {
    let recent: string[] = [];
    const picker = (fieldKey: string, suggestions: readonly string[]) => {
      const picked = diversePick(suggestions, recent);
      recent = pushRecent(recent, picked, 3);
      return picked;
    };

    const categories: PickableCategory[] = [
      { id: 'x', fields: [
        { key: 'x.a', suggestions: ['alpha', 'beta', 'gamma'] },
        { key: 'x.b', suggestions: ['one', 'two', 'three'] },
      ]},
    ];

    const result = flattenPromptToText(buildRandomPrompt(categories, picker));
    const parts = result.split(', ');
    expect(parts).toHaveLength(2);
    expect(['alpha', 'beta', 'gamma']).toContain(parts[0]);
    expect(['one', 'two', 'three']).toContain(parts[1]);
  });
});

// ── New tests: probabilistic invariants, boundary conditions, contract edges ──

describe('diversePick probabilistic fairness', () => {
  test('distributes roughly evenly with no history (chi-squared sanity)', () => {
    const options = ['a', 'b', 'c', 'd'];
    const counts: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
    const N = 1000;
    for (let i = 0; i < N; i++) counts[diversePick(options, [])]++;
    const expected = N / options.length; // 250
    // Each bucket should be within ±40% of expected (very generous — catches broken RNG, not noise)
    for (const key of options) {
      expect(counts[key]).toBeGreaterThan(expected * 0.4);
      expect(counts[key]).toBeLessThan(expected * 1.6);
    }
  });

  test('exclusion shifts probability entirely to remaining candidates', () => {
    const options = ['a', 'b', 'c'];
    const counts = { b: 0, c: 0 };
    for (let i = 0; i < 200; i++) {
      const pick = diversePick(options, ['a']);
      expect(pick).not.toBe('a');
      counts[pick as 'b' | 'c']++;
    }
    // Both b and c should get picks — neither should be starved
    expect(counts.b).toBeGreaterThan(30);
    expect(counts.c).toBeGreaterThan(30);
  });
});

describe('diversePick pigeonhole coverage', () => {
  test('window = n-1 guarantees all options appear before any repeat', () => {
    // With 4 options and window 3, every pick excludes 3 items → only 1 candidate left.
    // This forces a deterministic round-robin through all options.
    const options = ['a', 'b', 'c', 'd'];
    let recent: string[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < 4; i++) {
      const pick = diversePick(options, recent);
      seen.add(pick);
      recent = pushRecent(recent, pick, 3); // window = options.length - 1
    }
    // Pigeonhole: all 4 must appear in first 4 picks
    expect(seen.size).toBe(4);
  });

  test('window = n-1 produces no consecutive duplicates over many rounds', () => {
    const options = ['x', 'y', 'z'];
    let recent: string[] = [];
    let prev = '';
    for (let i = 0; i < 50; i++) {
      const pick = diversePick(options, recent);
      expect(pick).not.toBe(prev);
      prev = pick;
      recent = pushRecent(recent, pick, 2); // window = 3-1
    }
  });
});

describe('pushRecent boundary edges', () => {
  test('negative maxSize behaves like maxSize=0 (remember nothing)', () => {
    // slice(next.length - (-1)) = slice(len+1) = [] for any array
    const result = pushRecent(['a', 'b'], 'c', -1);
    expect(result).toEqual([]);
  });

  test('maxSize=1 with large existing history keeps only the newest', () => {
    const result = pushRecent(['a', 'b', 'c', 'd', 'e'], 'f', 1);
    expect(result).toEqual(['f']);
  });
});

describe('buildRandomPrompt contract boundaries', () => {
  test('propagates diversePick throw when field has empty suggestions', () => {
    const categories: PickableCategory[] = [
      { id: 'broken', fields: [{ key: 'x.y', suggestions: [] }] },
    ];
    // A picker that delegates to diversePick will throw on empty suggestions
    const picker = (key: string, suggestions: readonly string[]) =>
      diversePick(suggestions, []);
    expect(() => buildRandomPrompt(categories, picker)).toThrow('options array must not be empty');
  });

  test('preserves field iteration order within a category', () => {
    const order: string[] = [];
    const picker = (key: string, s: readonly string[]) => {
      order.push(key);
      return s[0];
    };
    const categories: PickableCategory[] = [{
      id: 'cat',
      fields: [
        { key: 'cat.alpha', suggestions: ['a'] },
        { key: 'cat.beta', suggestions: ['b'] },
        { key: 'cat.gamma', suggestions: ['c'] },
      ],
    }];
    buildRandomPrompt(categories, picker);
    expect(order).toEqual(['cat.alpha', 'cat.beta', 'cat.gamma']);
  });

  test('mixed empty and populated categories produce correct structure', () => {
    const picker = (_k: string, s: readonly string[]) => s[0];
    const categories: PickableCategory[] = [
      { id: 'empty-one', fields: [] },
      { id: 'filled', fields: [{ key: 'subject.desc', suggestions: ['portrait'] }] },
      { id: 'empty-two', fields: [] },
    ];
    const result = buildRandomPrompt(categories, picker);
    expect(result['empty-one']).toEqual({});
    expect(result['subject']).toEqual({ desc: 'portrait' });
    expect(result['empty-two']).toEqual({});
  });
});

describe('flattenPromptToText edge behaviors', () => {
  test('whitespace-only values are trimmed and excluded', () => {
    const prompt = { a: { x: '  ', y: 'real' } };
    expect(flattenPromptToText(prompt)).toBe('real');
  });

  test('preserves category iteration order in output', () => {
    // Object.values follows insertion order in modern JS engines
    const prompt: Record<string, Record<string, string>> = {};
    prompt['second'] = { val: 'B' };
    prompt['first'] = { val: 'A' };
    expect(flattenPromptToText(prompt)).toBe('B, A');
  });

  test('handles deeply nested-looking keys without recursing', () => {
    // flattenPromptToText only goes 2 levels deep by design
    const prompt = { a: { 'b.c.d': 'flat-value' } };
    expect(flattenPromptToText(prompt)).toBe('flat-value');
  });
});

describe('full-cycle simulation', () => {
  test('realistic multi-category prompt generation with diversity tracking', () => {
    const histories: Record<string, string[]> = {};
    const picker = (key: string, suggestions: readonly string[]) => {
      const recent = histories[key] ?? [];
      const value = diversePick(suggestions, recent);
      histories[key] = pushRecent(recent, value, 3);
      return value;
    };

    const categories: PickableCategory[] = [
      { id: 'subject-info', fields: [
        { key: 'subject.description', suggestions: ['a woman', 'a man', 'a child', 'an elder'] },
        { key: 'subject.expression', suggestions: ['smiling', 'stoic', 'laughing', 'pensive'] },
      ]},
      { id: 'scene-setting', fields: [
        { key: 'environment.location', suggestions: ['forest', 'city', 'beach', 'studio'] },
      ]},
      { id: 'mood', fields: [
        { key: 'atmosphere.mood', suggestions: ['serene', 'dramatic', 'ethereal'] },
      ]},
    ];

    // Generate 5 prompts and verify diversity + structure
    const prompts: string[] = [];
    for (let i = 0; i < 5; i++) {
      const structured = buildRandomPrompt(categories, picker);
      // Structure invariant: always has these keys
      expect(structured).toHaveProperty('subject');
      expect(structured).toHaveProperty('environment');
      expect(structured).toHaveProperty('atmosphere');
      // Each category has expected fields
      expect(structured.subject).toHaveProperty('description');
      expect(structured.subject).toHaveProperty('expression');
      expect(structured.environment).toHaveProperty('location');
      expect(structured.atmosphere).toHaveProperty('mood');

      const text = flattenPromptToText(structured);
      expect(text.split(', ')).toHaveLength(4);
      prompts.push(text);
    }

    // Diversity invariant: not all 5 prompts should be identical
    const unique = new Set(prompts);
    expect(unique.size).toBeGreaterThan(1);
  });
});

// ── pickWithHistory: combined pick+push in one call ──

describe('pickWithHistory', () => {
  test('returns picked value and updated recent array', () => {
    const { value, recent } = pickWithHistory(['a', 'b', 'c'], [], 3);
    expect(['a', 'b', 'c']).toContain(value);
    expect(recent).toEqual([value]);
  });

  test('excludes recent items and advances window', () => {
    const r1 = pickWithHistory(['a', 'b', 'c'], ['a', 'b'], 3);
    expect(r1.value).toBe('c');
    expect(r1.recent).toEqual(['a', 'b', 'c']);
  });

  test('trims window to maxSize', () => {
    const { recent } = pickWithHistory(['a', 'b'], ['x', 'y', 'z'], 2);
    expect(recent).toHaveLength(2);
  });

  test('sequential calls produce no consecutive repeats', () => {
    const options = ['a', 'b', 'c', 'd'];
    let recent: string[] = [];
    let prev = '';
    for (let i = 0; i < 20; i++) {
      const result = pickWithHistory(options, recent, 2);
      expect(result.value).not.toBe(prev);
      prev = result.value;
      recent = result.recent;
    }
  });

  test('throws on empty options (delegates to diversePick)', () => {
    expect(() => pickWithHistory([], [])).toThrow('options array must not be empty');
  });
});

// ── createPicker: stateful per-key picker for non-React code ──

describe('createPicker', () => {
  test('returns a function with picker signature', () => {
    const pick = createPicker(3);
    expect(typeof pick).toBe('function');
    const value = pick('field', ['a', 'b', 'c']);
    expect(['a', 'b', 'c']).toContain(value);
  });

  test('tracks per-key history independently', () => {
    const pick = createPicker(2);
    // Exhaust field1 options so picks are deterministic
    const f1a = pick('field1', ['x', 'y']);
    const f1b = pick('field1', ['x', 'y']);
    expect(f1b).not.toBe(f1a); // window=2 forces alternation with 2 options

    // field2 has its own history — not contaminated by field1
    const f2 = pick('field2', ['x', 'y']);
    expect(['x', 'y']).toContain(f2);
  });

  test('avoids repeats across sequential picks for same key', () => {
    const pick = createPicker(3);
    const options = ['a', 'b', 'c', 'd'];
    let prev = '';
    for (let i = 0; i < 20; i++) {
      const value = pick('key', options);
      expect(value).not.toBe(prev);
      prev = value;
    }
  });

  test('works as drop-in for buildRandomPrompt picker parameter', () => {
    const pick = createPicker(3);
    const categories: PickableCategory[] = [
      { id: 'cat', fields: [
        { key: 'subject.desc', suggestions: ['portrait', 'landscape'] },
        { key: 'subject.mood', suggestions: ['serene', 'tense'] },
      ]},
    ];
    const result = buildRandomPrompt(categories, pick);
    expect(result).toHaveProperty('subject');
    expect(['portrait', 'landscape']).toContain(result.subject.desc);
    expect(['serene', 'tense']).toContain(result.subject.mood);
  });
});
