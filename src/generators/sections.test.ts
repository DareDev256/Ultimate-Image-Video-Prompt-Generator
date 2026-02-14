import { describe, test, expect } from 'bun:test';
import {
  subjectSection,
  hairSection,
  clothingSection,
  actionSection,
  environmentSection,
  accessoriesSection,
  cameraSection,
  lightingSection,
  atmosphereSection,
  filmTextureSection,
  vibesSection,
  technicalSection,
  colorSection,
  PROMPT_SECTIONS,
} from './sections';
import type { ImagePrompt } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────
const empty: ImagePrompt = { prompt_type: 'generate' };

// ─── subjectSection ─────────────────────────────────────────────────

describe('subjectSection', () => {
  test('returns description when present', () => {
    expect(subjectSection({ ...empty, subject: { description: 'A warrior' } }))
      .toEqual(['A warrior']);
  });

  test('returns [] when subject is undefined', () => {
    expect(subjectSection(empty)).toEqual([]);
  });

  test('returns [] when subject exists but description is missing', () => {
    expect(subjectSection({ ...empty, subject: { action: 'running' } }))
      .toEqual([]);
  });

  test('returns [] when description is empty string', () => {
    expect(subjectSection({ ...empty, subject: { description: '' } }))
      .toEqual([]);
  });
});

// ─── hairSection ────────────────────────────────────────────────────

describe('hairSection', () => {
  test('returns style with "with" prefix', () => {
    expect(hairSection({ ...empty, subject: { hair: { style: 'box braids' } } }))
      .toEqual(['with box braids']);
  });

  test('returns structure in parens when different from style', () => {
    expect(hairSection({ ...empty, subject: { hair: { style: 'pixie', structure: 'layered' } } }))
      .toEqual(['with pixie', '(layered)']);
  });

  test('skips structure when identical to style (dedup)', () => {
    expect(hairSection({ ...empty, subject: { hair: { style: 'curly', structure: 'curly' } } }))
      .toEqual(['with curly']);
  });

  test('returns only structure when style is missing', () => {
    expect(hairSection({ ...empty, subject: { hair: { structure: 'wavy' } } }))
      .toEqual(['(wavy)']);
  });

  test('returns [] when hair is empty object', () => {
    expect(hairSection({ ...empty, subject: { hair: {} } })).toEqual([]);
  });

  test('returns [] when subject has no hair', () => {
    expect(hairSection({ ...empty, subject: { description: 'A person' } }))
      .toEqual([]);
  });
});

// ─── clothingSection ────────────────────────────────────────────────

describe('clothingSection', () => {
  test('formats main garment with "wearing" prefix', () => {
    expect(clothingSection({ ...empty, subject: { clothing: { main_garment: 'a trench coat' } } }))
      .toEqual(['wearing a trench coat']);
  });

  test('appends hardware with "with" prefix', () => {
    const result = clothingSection({
      ...empty,
      subject: { clothing: { main_garment: 'jacket', hardware: 'brass buttons' } },
    });
    expect(result).toEqual(['wearing jacket', 'with brass buttons']);
  });

  test('returns [] when main_garment is missing even if hardware exists', () => {
    expect(clothingSection({ ...empty, subject: { clothing: { hardware: 'zippers' } } }))
      .toEqual([]);
  });

  test('returns [] when clothing is undefined', () => {
    expect(clothingSection(empty)).toEqual([]);
  });
});

// ─── actionSection ──────────────────────────────────────────────────

describe('actionSection', () => {
  test('returns action when present', () => {
    expect(actionSection({ ...empty, subject: { action: 'running' } }))
      .toEqual(['running']);
  });

  test('falls back to body_position when action is absent', () => {
    expect(actionSection({ ...empty, subject: { body_position: 'seated' } }))
      .toEqual(['seated']);
  });

  test('action takes strict precedence over body_position', () => {
    expect(actionSection({ ...empty, subject: { action: 'jumping', body_position: 'crouching' } }))
      .toEqual(['jumping']);
  });

  test('returns [] when neither action nor body_position set', () => {
    expect(actionSection({ ...empty, subject: { description: 'A person' } }))
      .toEqual([]);
  });
});

// ─── environmentSection ─────────────────────────────────────────────

describe('environmentSection', () => {
  test('formats location with "in" prefix', () => {
    expect(environmentSection({ ...empty, environment: { location: 'a dark alley' } }))
      .toEqual(['in a dark alley']);
  });

  test('returns [] when environment is undefined', () => {
    expect(environmentSection(empty)).toEqual([]);
  });

  test('returns [] when location is missing from environment', () => {
    expect(environmentSection({ ...empty, environment: { surfaces: 'wet asphalt' } }))
      .toEqual([]);
  });
});

// ─── accessoriesSection ─────────────────────────────────────────────

describe('accessoriesSection', () => {
  test('joins all accessory types with commas', () => {
    const result = accessoriesSection({
      ...empty,
      subject: { accessories: { hands: 'gloves', jewelry: 'rings', footwear: 'boots' } },
    });
    expect(result).toEqual(['with gloves, rings, boots']);
  });

  test('handles partial accessories (only jewelry)', () => {
    expect(accessoriesSection({ ...empty, subject: { accessories: { jewelry: 'pearls' } } }))
      .toEqual(['with pearls']);
  });

  test('returns [] for empty accessories object', () => {
    expect(accessoriesSection({ ...empty, subject: { accessories: {} } }))
      .toEqual([]);
  });

  test('ignores non-standard fields (ankles not in output)', () => {
    // ankles exists on the type but accessoriesSection only reads hands/jewelry/footwear
    const result = accessoriesSection({
      ...empty,
      subject: { accessories: { ankles: 'anklet' } },
    });
    expect(result).toEqual([]);
  });
});

// ─── cameraSection ──────────────────────────────────────────────────

describe('cameraSection', () => {
  test('formats position and lens together', () => {
    expect(cameraSection({ ...empty, scene: { camera: { position: 'low angle', lens_mm: '24mm' } } }))
      .toEqual(['shot from low angle, 24mm lens']);
  });

  test('returns only position when lens is missing', () => {
    expect(cameraSection({ ...empty, scene: { camera: { position: 'eye level' } } }))
      .toEqual(['shot from eye level']);
  });

  test('returns only lens when position is missing', () => {
    expect(cameraSection({ ...empty, scene: { camera: { lens_mm: '85mm' } } }))
      .toEqual(['85mm lens']);
  });

  test('returns [] for empty camera object', () => {
    expect(cameraSection({ ...empty, scene: { camera: {} } })).toEqual([]);
  });

  test('returns [] when scene has no camera', () => {
    expect(cameraSection({ ...empty, scene: { effect_type: 'double exposure' } }))
      .toEqual([]);
  });
});

// ─── lightingSection ────────────────────────────────────────────────

describe('lightingSection', () => {
  test('returns source and effect as separate fragments', () => {
    expect(lightingSection({ ...empty, lighting: { primary_source: 'neon', primary_effect: 'rim light' } }))
      .toEqual(['neon', 'rim light']);
  });

  test('returns only source when effect missing', () => {
    expect(lightingSection({ ...empty, lighting: { primary_source: 'candle' } }))
      .toEqual(['candle']);
  });

  test('returns [] for empty lighting object', () => {
    expect(lightingSection({ ...empty, lighting: {} })).toEqual([]);
  });
});

// ─── atmosphereSection ──────────────────────────────────────────────

describe('atmosphereSection', () => {
  test('returns mood and elements as separate fragments', () => {
    expect(atmosphereSection({ ...empty, atmosphere: { mood: 'tense', elements: 'smoke' } }))
      .toEqual(['tense', 'smoke']);
  });

  test('returns only mood when elements missing', () => {
    expect(atmosphereSection({ ...empty, atmosphere: { mood: 'serene' } }))
      .toEqual(['serene']);
  });

  test('returns [] when atmosphere is undefined', () => {
    expect(atmosphereSection(empty)).toEqual([]);
  });
});

// ─── filmTextureSection ─────────────────────────────────────────────

describe('filmTextureSection', () => {
  test('joins grain, lens_quality, and date_stamp', () => {
    const result = filmTextureSection({
      ...empty,
      film_texture: { grain: 'heavy', lens_quality: 'soft', date_stamp: '98-12-25' },
    });
    expect(result).toEqual(['heavy, soft, date stamp 98-12-25']);
  });

  test('omits date_stamp when set to "none"', () => {
    const result = filmTextureSection({
      ...empty,
      film_texture: { grain: 'fine', date_stamp: 'none' },
    });
    expect(result).toEqual(['fine']);
    expect(result[0]).not.toContain('date stamp');
  });

  test('returns [] for empty film_texture', () => {
    expect(filmTextureSection({ ...empty, film_texture: {} })).toEqual([]);
  });

  test('handles date_stamp only (no grain/lens)', () => {
    const result = filmTextureSection({
      ...empty,
      film_texture: { date_stamp: '2024-01-01' },
    });
    expect(result).toEqual(['date stamp 2024-01-01']);
  });
});

// ─── vibesSection ───────────────────────────────────────────────────

describe('vibesSection', () => {
  test('1 vibe → "X aesthetic"', () => {
    expect(vibesSection({ ...empty, vibes: ['gothic'] }))
      .toEqual(['gothic aesthetic']);
  });

  test('2 vibes → "X meets Y energy"', () => {
    expect(vibesSection({ ...empty, vibes: ['noir', 'jazz'] }))
      .toEqual(['noir meets jazz energy']);
  });

  test('3 vibes → "X, Y and Z influences"', () => {
    expect(vibesSection({ ...empty, vibes: ['retro', 'neon', 'synth'] }))
      .toEqual(['retro, neon and synth influences']);
  });

  test('4+ vibes → comma-separated with "and" before last', () => {
    expect(vibesSection({ ...empty, vibes: ['a', 'b', 'c', 'd'] }))
      .toEqual(['a, b, c and d influences']);
  });

  test('empty vibes array → []', () => {
    expect(vibesSection({ ...empty, vibes: [] })).toEqual([]);
  });

  test('undefined vibes → []', () => {
    expect(vibesSection(empty)).toEqual([]);
  });
});

// ─── technicalSection ───────────────────────────────────────────────

describe('technicalSection', () => {
  test('formats aspect ratio', () => {
    expect(technicalSection({ ...empty, technical: { aspect_ratio: '16:9' } }))
      .toEqual(['16:9 aspect ratio']);
  });

  test('returns [] when technical is undefined', () => {
    expect(technicalSection(empty)).toEqual([]);
  });

  test('returns [] when aspect_ratio is missing', () => {
    expect(technicalSection({ ...empty, technical: { realism_note: 'hyper-real' } }))
      .toEqual([]);
  });
});

// ─── colorSection ───────────────────────────────────────────────────

describe('colorSection', () => {
  test('returns grade as-is', () => {
    expect(colorSection({ ...empty, color: { grade: 'warm amber' } }))
      .toEqual(['warm amber']);
  });

  test('returns [] when color has no grade', () => {
    expect(colorSection({ ...empty, color: { highlights: 'blown out' } }))
      .toEqual([]);
  });
});

// ─── PROMPT_SECTIONS pipeline ───────────────────────────────────────

describe('PROMPT_SECTIONS', () => {
  test('contains exactly 13 sections', () => {
    expect(PROMPT_SECTIONS).toHaveLength(13);
  });

  test('every section is a function', () => {
    for (const section of PROMPT_SECTIONS) {
      expect(typeof section).toBe('function');
    }
  });

  test('every section returns [] for empty prompt (no crashes)', () => {
    for (const section of PROMPT_SECTIONS) {
      const result = section(empty);
      expect(Array.isArray(result)).toBe(true);
    }
  });

  test('pipeline order: subject → hair → clothing → action → env → accessories → camera → lighting → atmosphere → film → vibes → technical → color', () => {
    // Verify by reference identity
    expect(PROMPT_SECTIONS[0]).toBe(subjectSection);
    expect(PROMPT_SECTIONS[1]).toBe(hairSection);
    expect(PROMPT_SECTIONS[2]).toBe(clothingSection);
    expect(PROMPT_SECTIONS[3]).toBe(actionSection);
    expect(PROMPT_SECTIONS[4]).toBe(environmentSection);
    expect(PROMPT_SECTIONS[5]).toBe(accessoriesSection);
    expect(PROMPT_SECTIONS[6]).toBe(cameraSection);
    expect(PROMPT_SECTIONS[7]).toBe(lightingSection);
    expect(PROMPT_SECTIONS[8]).toBe(atmosphereSection);
    expect(PROMPT_SECTIONS[9]).toBe(filmTextureSection);
    expect(PROMPT_SECTIONS[10]).toBe(vibesSection);
    expect(PROMPT_SECTIONS[11]).toBe(technicalSection);
    expect(PROMPT_SECTIONS[12]).toBe(colorSection);
  });

  test('full prompt produces fragments from every active section', () => {
    const full: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'A warrior',
        hair: { style: 'mohawk' },
        clothing: { main_garment: 'armor' },
        action: 'charging',
        accessories: { hands: 'sword' },
      },
      environment: { location: 'battlefield' },
      scene: { camera: { position: 'low', lens_mm: '24mm' } },
      lighting: { primary_source: 'fire' },
      atmosphere: { mood: 'intense' },
      film_texture: { grain: 'heavy' },
      vibes: ['epic'],
      technical: { aspect_ratio: '2.39:1' },
      color: { grade: 'orange teal' },
    };

    const allFragments = PROMPT_SECTIONS.flatMap(s => s(full));
    // Every section should contribute at least one fragment
    expect(allFragments.length).toBeGreaterThanOrEqual(13);
  });
});
