import { describe, expect, test } from 'bun:test';
import { diversePick, pushRecent, DEFAULT_RECENT_WINDOW, buildRandomPrompt, flattenPromptToText } from './diverse-pick';
import type { PickableCategory } from './diverse-pick';

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
