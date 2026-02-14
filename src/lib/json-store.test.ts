import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { JsonStore } from './json-store';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const TEST_DIR = join(tmpdir(), `json-store-test-${Date.now()}`);

function makePath(name: string) {
  return join(TEST_DIR, name);
}

function ensureTestDir() {
  if (!existsSync(TEST_DIR)) mkdirSync(TEST_DIR, { recursive: true });
}

beforeEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
});

describe('JsonStore', () => {
  describe('load', () => {
    test('returns deep-cloned default when file does not exist', () => {
      const defaults = { items: [1, 2, 3], nested: { key: 'val' } };
      const store = new JsonStore(makePath('missing.json'), defaults, ensureTestDir);

      const result = store.load();

      expect(result).toEqual(defaults);
      // Must be a deep clone, not the same reference
      expect(result).not.toBe(defaults);
      expect(result.nested).not.toBe(defaults.nested);
      expect(result.items).not.toBe(defaults.items);
    });

    test('reads and parses existing JSON file', () => {
      ensureTestDir();
      const filePath = makePath('existing.json');
      const data = { name: 'test', count: 42 };
      require('fs').writeFileSync(filePath, JSON.stringify(data));

      const store = new JsonStore(filePath, { name: '', count: 0 }, ensureTestDir);
      const result = store.load();

      expect(result).toEqual(data);
    });

    test('creates directory via ensureDir callback', () => {
      const nestedPath = join(TEST_DIR, 'deep', 'nested', 'data.json');
      let ensureCalled = false;
      const ensureNested = () => {
        ensureCalled = true;
        mkdirSync(join(TEST_DIR, 'deep', 'nested'), { recursive: true });
      };

      const store = new JsonStore(nestedPath, { ok: true }, ensureNested);
      store.load();

      expect(ensureCalled).toBe(true);
    });
  });

  describe('save', () => {
    test('writes JSON to file with pretty formatting', () => {
      const filePath = makePath('save-test.json');
      const store = new JsonStore(filePath, {}, ensureTestDir);
      const data = { key: 'value', num: 7 };

      store.save(data);

      const raw = readFileSync(filePath, 'utf-8');
      expect(JSON.parse(raw)).toEqual(data);
      // Verify 2-space indentation (pretty print)
      expect(raw).toContain('  "key"');
    });

    test('overwrites existing data', () => {
      const filePath = makePath('overwrite.json');
      const store = new JsonStore(filePath, {}, ensureTestDir);

      store.save({ version: 1 });
      store.save({ version: 2 });

      const result = store.load();
      expect(result).toEqual({ version: 2 });
    });

    test('roundtrips complex nested structures', () => {
      const filePath = makePath('complex.json');
      const store = new JsonStore(filePath, {}, ensureTestDir);
      const complex = {
        tags: ['a', 'b'],
        meta: { created: '2026-01-01', settings: { dark: true } },
        count: 0,
      };

      store.save(complex);
      const loaded = store.load();

      expect(loaded).toEqual(complex);
    });
  });

  describe('exists', () => {
    test('returns false when file does not exist', () => {
      const store = new JsonStore(makePath('nope.json'), null, ensureTestDir);
      expect(store.exists()).toBe(false);
    });

    test('returns true after save', () => {
      const filePath = makePath('will-exist.json');
      const store = new JsonStore(filePath, {}, ensureTestDir);

      store.save({ created: true });

      expect(store.exists()).toBe(true);
    });
  });

  describe('default isolation', () => {
    test('multiple loads return independent copies', () => {
      const store = new JsonStore(makePath('iso.json'), { items: [] as string[] }, ensureTestDir);

      const a = store.load();
      a.items.push('mutated');
      const b = store.load();

      expect(b.items).toEqual([]);
    });
  });
});
