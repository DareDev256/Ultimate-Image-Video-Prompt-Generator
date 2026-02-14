import { describe, test, expect } from 'bun:test';
import {
  packContents,
  presetPacks,
  getCategoriesForPreset,
  getCategoriesForPacks,
} from './packs';
import {
  builtInTemplates,
  getTemplate,
  listTemplates,
} from './templates';
import type { PackName, PresetPackName } from '../types';

describe('packContents', () => {
  test('every PackName key maps to a non-empty array', () => {
    const packNames: PackName[] = [
      'core', 'camera', 'subject-detail', 'fashion', 'environment',
      'crowd', 'lighting', 'atmosphere', 'composition', 'color', 'film', 'technical',
    ];
    for (const name of packNames) {
      expect(packContents[name]).toBeDefined();
      expect(packContents[name].length).toBeGreaterThan(0);
    }
  });

  test('core pack always includes "core" category', () => {
    expect(packContents['core']).toContain('core');
  });
});

describe('presetPacks', () => {
  test('every preset resolves to valid pack names', () => {
    const validPacks = new Set(Object.keys(packContents));
    for (const [preset, packs] of Object.entries(presetPacks)) {
      for (const pack of packs) {
        expect(validPacks.has(pack)).toBe(true);
      }
    }
  });

  test('quick preset is minimal (only core)', () => {
    expect(presetPacks['quick']).toEqual(['core']);
  });

  test('full preset includes all 12 packs', () => {
    expect(presetPacks['full'].length).toBe(12);
  });
});

describe('getCategoriesForPreset', () => {
  test('returns deduplicated categories', () => {
    const cats = getCategoriesForPreset('standard');
    const unique = new Set(cats);
    expect(cats.length).toBe(unique.size);
  });

  test('quick preset returns core categories', () => {
    const cats = getCategoriesForPreset('quick');
    expect(cats).toContain('core');
    expect(cats).toContain('vibes');
  });

  test('fashion preset includes fashion-specific packs', () => {
    const cats = getCategoriesForPreset('fashion');
    expect(cats).toContain('fashion');
    expect(cats).toContain('lighting');
    expect(cats).toContain('subject-detail');
  });

  test('full preset covers all possible categories', () => {
    const all = getCategoriesForPreset('full');
    // Every packContents value should be represented
    for (const cats of Object.values(packContents)) {
      for (const cat of cats) {
        expect(all).toContain(cat);
      }
    }
  });
});

describe('getCategoriesForPacks', () => {
  test('always includes core even when not explicitly requested', () => {
    const cats = getCategoriesForPacks(['camera']);
    expect(cats).toContain('core');
    expect(cats).toContain('vibes'); // core pack includes vibes
    expect(cats).toContain('camera');
  });

  test('deduplicates when core is passed explicitly', () => {
    const cats = getCategoriesForPacks(['core', 'camera']);
    const coreCount = cats.filter(c => c === 'core').length;
    expect(coreCount).toBe(1);
  });

  test('combines multiple packs', () => {
    const cats = getCategoriesForPacks(['lighting', 'film']);
    expect(cats).toContain('lighting');
    expect(cats).toContain('film');
    expect(cats).toContain('core'); // always present
  });
});

describe('templates', () => {
  test('builtInTemplates is non-empty', () => {
    expect(builtInTemplates.length).toBeGreaterThan(0);
  });

  test('every template has required fields', () => {
    for (const t of builtInTemplates) {
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.prompt_type).toBe('generate');
    }
  });

  test('every template has vibes array', () => {
    for (const t of builtInTemplates) {
      expect(Array.isArray(t.vibes)).toBe(true);
      expect(t.vibes!.length).toBeGreaterThan(0);
    }
  });

  test('template names are unique', () => {
    const names = builtInTemplates.map(t => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('getTemplate', () => {
  test('returns template by name', () => {
    const t = getTemplate('cinematic');
    expect(t).toBeDefined();
    expect(t!.name).toBe('cinematic');
    expect(t!.description).toBeTruthy();
  });

  test('returns undefined for unknown name', () => {
    expect(getTemplate('nonexistent-template')).toBeUndefined();
  });
});

describe('listTemplates', () => {
  test('returns name and description for each template', () => {
    const list = listTemplates();
    expect(list.length).toBe(builtInTemplates.length);
    for (const item of list) {
      expect(typeof item.name).toBe('string');
      expect(typeof item.description).toBe('string');
    }
  });

  test('does not leak full template data', () => {
    const list = listTemplates();
    for (const item of list) {
      // Should only have name + description, not prompt fields
      expect(Object.keys(item).sort()).toEqual(['description', 'name']);
    }
  });
});
