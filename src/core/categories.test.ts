import { describe, test, expect } from 'bun:test';
import {
  allCategories,
  categoryMap,
  coreCategory,
  cameraCategory,
  subjectDetailCategory,
  fashionCategory,
  environmentCategory,
  crowdCategory,
  lightingCategory,
  atmosphereCategory,
  compositionCategory,
  colorCategory,
  filmCategory,
  technicalCategory,
  vibesCategory,
  type CategoryDefinition,
  type FieldDefinition,
} from './categories';

describe('categories — data integrity', () => {
  test('allCategories contains exactly 13 categories', () => {
    expect(allCategories).toHaveLength(13);
  });

  test('categoryMap has same count as allCategories', () => {
    expect(categoryMap.size).toBe(allCategories.length);
  });

  test('every exported category is in allCategories', () => {
    const expected = [
      coreCategory, cameraCategory, subjectDetailCategory, fashionCategory,
      environmentCategory, crowdCategory, lightingCategory, atmosphereCategory,
      compositionCategory, colorCategory, filmCategory, technicalCategory, vibesCategory,
    ];
    for (const cat of expected) {
      expect(allCategories).toContain(cat);
    }
  });

  test('category names are unique', () => {
    const names = allCategories.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test('category emojis are unique', () => {
    const emojis = allCategories.map(c => c.emoji);
    expect(new Set(emojis).size).toBe(emojis.length);
  });

  test('categoryMap resolves every category by name', () => {
    for (const cat of allCategories) {
      expect(categoryMap.get(cat.name)).toBe(cat);
    }
  });

  test('categoryMap returns undefined for unknown name', () => {
    expect(categoryMap.get('nonexistent')).toBeUndefined();
  });
});

describe('categories — field structure', () => {
  const allFields: { category: string; field: FieldDefinition }[] = [];
  for (const cat of allCategories) {
    for (const f of cat.fields) {
      allFields.push({ category: cat.name, field: f });
    }
  }

  test('every category has at least one field', () => {
    for (const cat of allCategories) {
      expect(cat.fields.length).toBeGreaterThan(0);
    }
  });

  test('every field has a non-empty key', () => {
    for (const { category, field } of allFields) {
      expect(field.key.length, `${category}.${field.key}`).toBeGreaterThan(0);
    }
  });

  test('every field has a non-empty label', () => {
    for (const { category, field } of allFields) {
      expect(field.label.length, `${category}.${field.key}`).toBeGreaterThan(0);
    }
  });

  test('field keys are valid dot-notation paths', () => {
    const dotNotation = /^[a-z_]+(\.[a-z_]+)*$/;
    for (const { category, field } of allFields) {
      expect(field.key, `${category}: ${field.key}`).toMatch(dotNotation);
    }
  });

  test('no duplicate field keys across entire category set', () => {
    const keys = allFields.map(f => f.field.key);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    expect(dupes, `Duplicate keys: ${dupes.join(', ')}`).toEqual([]);
  });

  test('suggestions arrays are non-empty when present', () => {
    for (const { category, field } of allFields) {
      if (field.suggestions) {
        expect(field.suggestions.length, `${category}.${field.key}`).toBeGreaterThan(0);
      }
    }
  });

  test('suggestion strings are non-empty', () => {
    for (const { category, field } of allFields) {
      for (const s of field.suggestions ?? []) {
        expect(s.trim().length, `empty suggestion in ${category}.${field.key}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('categories — core category specifics', () => {
  test('core includes prompt_type field', () => {
    const keys = coreCategory.fields.map(f => f.key);
    expect(keys).toContain('prompt_type');
  });

  test('core includes subject.description field', () => {
    const keys = coreCategory.fields.map(f => f.key);
    expect(keys).toContain('subject.description');
  });

  test('prompt_type has generate and edit as suggestions', () => {
    const ptField = coreCategory.fields.find(f => f.key === 'prompt_type')!;
    expect(ptField.suggestions).toContain('generate');
    expect(ptField.suggestions).toContain('edit');
  });
});
