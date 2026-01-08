import type { PackName, PresetPackName } from '../types';

// Which categories are included in each pack
export const packContents: Record<PackName, string[]> = {
  'core': ['core', 'vibes'],
  'camera': ['camera'],
  'subject-detail': ['subject-detail'],
  'fashion': ['fashion'],
  'environment': ['environment'],
  'crowd': ['crowd'],
  'lighting': ['lighting'],
  'atmosphere': ['atmosphere'],
  'composition': ['composition'],
  'color': ['color'],
  'film': ['film'],
  'technical': ['technical']
};

// Preset pack combinations
export const presetPacks: Record<PresetPackName, PackName[]> = {
  'quick': ['core'],
  'standard': ['core', 'camera', 'lighting', 'atmosphere'],
  'full': ['core', 'camera', 'subject-detail', 'fashion', 'environment', 'crowd', 'lighting', 'atmosphere', 'composition', 'color', 'film', 'technical'],
  'fashion': ['core', 'camera', 'subject-detail', 'fashion', 'lighting'],
  'street': ['core', 'camera', 'environment', 'crowd', 'atmosphere', 'film']
};

// Get all category names for a preset
export function getCategoriesForPreset(preset: PresetPackName): string[] {
  const packs = presetPacks[preset];
  const categories = new Set<string>();

  for (const pack of packs) {
    for (const cat of packContents[pack]) {
      categories.add(cat);
    }
  }

  return Array.from(categories);
}

// Get categories for custom pack selection
export function getCategoriesForPacks(packs: PackName[]): string[] {
  const categories = new Set<string>();

  // Always include core
  for (const cat of packContents['core']) {
    categories.add(cat);
  }

  for (const pack of packs) {
    for (const cat of packContents[pack]) {
      categories.add(cat);
    }
  }

  return Array.from(categories);
}
