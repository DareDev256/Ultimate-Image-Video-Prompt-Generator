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
});
