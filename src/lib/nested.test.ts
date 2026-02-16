import { describe, expect, test } from 'bun:test';
import { getNestedValue, setNestedValue } from './nested';

describe('getNestedValue', () => {
  test('returns top-level value', () => {
    expect(getNestedValue({ name: 'test' }, 'name')).toBe('test');
  });

  test('returns nested value with dot notation', () => {
    const obj = { subject: { description: 'portrait' } };
    expect(getNestedValue(obj, 'subject.description')).toBe('portrait');
  });

  test('returns deeply nested value', () => {
    const obj = { a: { b: { c: 42 } } };
    expect(getNestedValue(obj, 'a.b.c')).toBe(42);
  });

  test('returns undefined for missing path', () => {
    expect(getNestedValue({ a: 1 }, 'b')).toBeUndefined();
  });

  test('returns undefined for missing intermediate path', () => {
    expect(getNestedValue({ a: 1 }, 'b.c.d')).toBeUndefined();
  });

  test('returns undefined when traversing through null', () => {
    const obj = { a: null } as Record<string, unknown>;
    expect(getNestedValue(obj, 'a.b')).toBeUndefined();
  });

  test('returns array values', () => {
    const obj = { vibes: ['cinematic', 'moody'] };
    expect(getNestedValue(obj, 'vibes')).toEqual(['cinematic', 'moody']);
  });

  test('returns undefined for undefined root', () => {
    expect(getNestedValue(undefined, 'any.path')).toBeUndefined();
  });

  test('returns undefined for null root', () => {
    expect(getNestedValue(null, 'any.path')).toBeUndefined();
  });

  test('preserves falsy values (empty string, 0, false)', () => {
    const obj = { a: '', b: 0, c: false } as Record<string, unknown>;
    expect(getNestedValue(obj, 'a')).toBe('');
    expect(getNestedValue(obj, 'b')).toBe(0);
    expect(getNestedValue(obj, 'c')).toBe(false);
  });
});

describe('setNestedValue', () => {
  test('sets top-level value', () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, 'name', 'test');
    expect(obj.name).toBe('test');
  });

  test('sets nested value, creating intermediates', () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, 'subject.description', 'portrait');
    expect((obj.subject as Record<string, unknown>).description).toBe('portrait');
  });

  test('sets deeply nested value', () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, 'a.b.c', 42);
    expect(getNestedValue(obj, 'a.b.c')).toBe(42);
  });

  test('overwrites existing value', () => {
    const obj: Record<string, unknown> = { name: 'old' };
    setNestedValue(obj, 'name', 'new');
    expect(obj.name).toBe('new');
  });

  test('preserves sibling values', () => {
    const obj: Record<string, unknown> = { subject: { description: 'portrait', type: 'person' } };
    setNestedValue(obj, 'subject.description', 'landscape');
    expect(getNestedValue(obj, 'subject.description')).toBe('landscape');
    expect(getNestedValue(obj, 'subject.type')).toBe('person');
  });

  test('overwrites primitive intermediate with object', () => {
    const obj: Record<string, unknown> = { a: 'string-value' };
    setNestedValue(obj, 'a.b', 'nested');
    expect(getNestedValue(obj, 'a.b')).toBe('nested');
  });

  test('mutates existing intermediate object in place', () => {
    const hair = { style: 'braids' };
    const obj: Record<string, unknown> = { subject: { hair } };
    setNestedValue(obj, 'subject.hair.color', 'black');
    expect((obj.subject as any).hair).toBe(hair); // same reference
    expect(getNestedValue(obj, 'subject.hair.color')).toBe('black');
  });

  test('independent branches do not interfere', () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, 'lighting.source', 'flash');
    setNestedValue(obj, 'atmosphere.mood', 'dark');
    expect(getNestedValue(obj, 'lighting.source')).toBe('flash');
    expect(getNestedValue(obj, 'atmosphere.mood')).toBe('dark');
  });
});

describe('set + get roundtrip (wizard simulation)', () => {
  test('full ImagePrompt wizard pass sets and retrieves all fields', () => {
    const prompt: Record<string, unknown> = { prompt_type: 'generate' };

    setNestedValue(prompt, 'subject.description', 'A striking woman');
    setNestedValue(prompt, 'subject.hair.style', 'box braids');
    setNestedValue(prompt, 'subject.clothing.main_garment', 'trench coat');
    setNestedValue(prompt, 'scene.camera.position', 'eye level');
    setNestedValue(prompt, 'vibes', ['editorial', 'moody']);

    expect(getNestedValue(prompt, 'subject.description')).toBe('A striking woman');
    expect(getNestedValue(prompt, 'subject.hair.style')).toBe('box braids');
    expect(getNestedValue(prompt, 'subject.clothing.main_garment')).toBe('trench coat');
    expect(getNestedValue(prompt, 'scene.camera.position')).toBe('eye level');
    expect(getNestedValue(prompt, 'vibes')).toEqual(['editorial', 'moody']);
    expect(prompt.prompt_type).toBe('generate'); // untouched
  });
});
