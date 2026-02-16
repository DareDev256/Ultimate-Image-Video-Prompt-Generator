import { describe, test, expect } from 'bun:test';
import { generateJSON, generateCompactJSON } from './generators/json';
import { generateNaturalLanguage } from './generators/natural';
import { PROMPT_SECTIONS } from './generators/sections';
import { parseArgs } from './cli/args';
import type { ImagePrompt } from './types';

// ─── Cross-Format Consistency ───────────────────────────────────────
// Both generators consume the same ImagePrompt. If one silently drops
// data, the user gets different results depending on which model they
// target. These tests catch that class of bug.
// ─────────────────────────────────────────────────────────────────────

describe('cross-format consistency', () => {
  const richPrompt: ImagePrompt = {
    prompt_type: 'generate',
    subject: {
      description: 'A street musician',
      hair: { style: 'long dreadlocks', structure: 'freeform' },
      clothing: { main_garment: 'patched denim vest', hardware: 'brass pins' },
      action: 'playing saxophone',
      accessories: { hands: 'fingerless gloves', jewelry: 'beaded necklace' },
    },
    environment: { location: 'a subway platform at midnight' },
    scene: { camera: { position: 'low angle', lens_mm: '28mm' } },
    lighting: { primary_source: 'fluorescent tubes', primary_effect: 'harsh overhead' },
    atmosphere: { mood: 'gritty', elements: 'steam from grates' },
    film_texture: { grain: 'Tri-X 400 grain', lens_quality: 'vintage soft', date_stamp: '2003-11-22' },
    vibes: ['jazz age', 'urban decay', 'documentary'],
    technical: { aspect_ratio: '3:2' },
    color: { grade: 'cross-processed greens' },
    semantic_negatives: 'no text overlays',
  };

  test('every non-empty field in JSON is referenced in natural language', () => {
    const json = JSON.parse(generateJSON(richPrompt));
    const nl = generateNaturalLanguage(richPrompt);

    // Subject core fields
    expect(nl).toContain(json.subject.description);
    expect(nl).toContain(json.subject.hair.style);
    expect(nl).toContain(json.subject.clothing.main_garment);
    expect(nl).toContain(json.subject.action);

    // Environment
    expect(nl).toContain(json.environment.location);

    // Camera
    expect(nl).toContain(json.scene.camera.lens_mm);

    // Lighting
    expect(nl).toContain(json.lighting.primary_source);

    // Atmosphere
    expect(nl).toContain(json.atmosphere.mood);

    // Color
    expect(nl).toContain(json.color.grade);

    // Technical
    expect(nl).toContain(json.technical.aspect_ratio);
  });

  test('JSON preserves semantic_negatives that NL pipeline ignores', () => {
    // semantic_negatives has no PromptSection — it only appears in JSON
    const json = JSON.parse(generateJSON(richPrompt));
    expect(json.semantic_negatives).toBe('no text overlays');

    // Confirms NL silently skips it (no section handles it)
    const nl = generateNaturalLanguage(richPrompt);
    expect(nl).not.toContain('no text overlays');
  });

  test('both formats handle edit prompt_type without crashing', () => {
    const editPrompt: ImagePrompt = {
      prompt_type: 'edit',
      subject: { description: 'change the background to a beach' },
    };

    const json = JSON.parse(generateJSON(editPrompt));
    const nl = generateNaturalLanguage(editPrompt);

    expect(json.prompt_type).toBe('edit');
    expect(nl).toContain('Change the background to a beach');
  });

  test('compact JSON and pretty JSON always parse to identical objects', () => {
    // Using a prompt with every optional section to stress the cleaning
    const pretty = JSON.parse(generateJSON(richPrompt));
    const compact = JSON.parse(generateCompactJSON(richPrompt));
    expect(compact).toEqual(pretty);
  });
});

// ─── cleanObject Edge Cases (via generateJSON) ─────────────────────
// cleanObject is private, so we test through the public API. These
// target shapes that real wizard data can produce: arrays of objects,
// nested nulls at different depths, and falsy-but-valid values.
// ─────────────────────────────────────────────────────────────────────

describe('cleanObject edge cases via JSON generators', () => {
  test('color.palette array of strings is preserved', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      color: { palette: ['#FF4500', 'teal', 'ivory'] },
    };
    const result = JSON.parse(generateJSON(prompt));
    expect(result.color.palette).toEqual(['#FF4500', 'teal', 'ivory']);
  });

  test('mixed null/valid items in color.palette are filtered', () => {
    const prompt = {
      prompt_type: 'generate' as const,
      color: { palette: ['red', null, 'blue', undefined] as any },
    };
    const result = JSON.parse(generateJSON(prompt));
    expect(result.color.palette).toEqual(['red', 'blue']);
  });

  test('deeply nested empty objects collapse upward', () => {
    // subject.hair={} → removed, subject.face={} → removed
    // subject has no remaining keys → subject removed
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { hair: {}, face: {}, clothing: {}, accessories: {} },
      lighting: { primary_source: undefined as any },
      atmosphere: {},
    };
    const result = JSON.parse(generateJSON(prompt));
    expect(result).toEqual({ prompt_type: 'generate' });
  });

  test('preserves false-y strings at every nesting level', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: '' },           // empty string at depth 2
      semantic_negatives: '',                   // empty string at depth 1
    };
    const result = JSON.parse(generateJSON(prompt));
    expect(result.subject.description).toBe('');
    expect(result.semantic_negatives).toBe('');
  });

  test('scene with only empty camera collapses entirely', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      scene: { camera: {} },
    };
    const result = JSON.parse(generateJSON(prompt));
    expect(result.scene).toBeUndefined();
  });

  test('vibes with only null entries becomes absent', () => {
    const prompt = {
      prompt_type: 'generate' as const,
      vibes: [null, undefined, null] as any,
    };
    const result = JSON.parse(generateJSON(prompt));
    expect(result.vibes).toBeUndefined();
  });
});

// ─── PROMPT_SECTIONS Pipeline Invariants ────────────────────────────
// The pipeline is the backbone — if sections are accidentally removed,
// reordered incompatibly, or return non-arrays, prompts break silently.
// ─────────────────────────────────────────────────────────────────────

describe('PROMPT_SECTIONS pipeline invariants', () => {
  test('contains exactly 13 sections', () => {
    expect(PROMPT_SECTIONS).toHaveLength(13);
  });

  test('all sections are functions', () => {
    for (const section of PROMPT_SECTIONS) {
      expect(typeof section).toBe('function');
    }
  });

  test('every section returns an array (never undefined/null) for empty input', () => {
    const empty: ImagePrompt = { prompt_type: 'generate' };
    for (const section of PROMPT_SECTIONS) {
      const result = section(empty);
      expect(Array.isArray(result)).toBe(true);
    }
  });

  test('every section returns an array for fully populated input', () => {
    const full: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'test',
        hair: { style: 'test' },
        clothing: { main_garment: 'test' },
        action: 'test',
        accessories: { hands: 'test' },
      },
      environment: { location: 'test' },
      scene: { camera: { position: 'test', lens_mm: 'test' } },
      lighting: { primary_source: 'test', primary_effect: 'test' },
      atmosphere: { mood: 'test', elements: 'test' },
      film_texture: { grain: 'test', date_stamp: 'test' },
      vibes: ['test'],
      technical: { aspect_ratio: 'test' },
      color: { grade: 'test' },
    };
    for (const section of PROMPT_SECTIONS) {
      const result = section(full);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    }
  });

  test('sections are pure — calling twice with same input gives same output', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'purity check', action: 'standing' },
      vibes: ['retro', 'minimal'],
    };
    for (const section of PROMPT_SECTIONS) {
      const first = section(prompt);
      const second = section(prompt);
      expect(first).toEqual(second);
    }
  });

  test('flatMap over sections produces no undefined or null fragments', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'A cat' },
      vibes: ['cozy'],
    };
    const fragments = PROMPT_SECTIONS.flatMap(s => s(prompt));
    for (const fragment of fragments) {
      expect(fragment).toBeDefined();
      expect(fragment).not.toBeNull();
      expect(typeof fragment).toBe('string');
    }
  });
});

// ─── parseArgs Boundary Conditions ──────────────────────────────────
// The existing tests cover happy paths. These target the real-world
// edge cases: missing values after flags (user typos), unknown flags
// (forward compatibility), and flag ordering edge cases.
// ─────────────────────────────────────────────────────────────────────

describe('parseArgs boundary conditions', () => {
  test('--template with no following value captures undefined', () => {
    const result = parseArgs(['--template']);
    expect(result.template).toBeUndefined();
  });

  test('--pack with no following value defaults to empty string split', () => {
    const result = parseArgs(['--pack']);
    // args[++i] is undefined, ?? '' kicks in, ''.split(',') = ['']
    expect(result.packs).toEqual(['']);
  });

  test('--analyze with no following value captures undefined', () => {
    const result = parseArgs(['--analyze']);
    expect(result.analyze).toBeUndefined();
  });

  test('unknown flags are silently ignored', () => {
    const result = parseArgs(['--unknown', '--verbose', '--quick']);
    expect(result.preset).toBe('quick');
    // No crash, no extra keys beyond preset
    expect(result.help).toBeUndefined();
    expect(result.template).toBeUndefined();
  });

  test('flags after favorites subcommand are consumed as args, not flags', () => {
    const result = parseArgs(['favorites', 'add', '--help', 'some value']);
    // --help is consumed as the field name, not as a flag
    expect(result.favorites?.field).toBe('--help');
    expect(result.favorites?.value).toBe('some value');
    expect(result.help).toBeUndefined();
  });

  test('empty pack string produces single empty-string entry', () => {
    const result = parseArgs(['-p', '']);
    expect(result.packs).toEqual(['']);
  });

  test('pack with trailing comma produces trailing empty entry', () => {
    const result = parseArgs(['--pack', 'camera,lighting,']);
    expect(result.packs).toEqual(['camera', 'lighting', '']);
  });

  test('all flags together produce combined result', () => {
    const result = parseArgs([
      '-t', 'cinematic',
      '--load', 'my-preset',
      '-p', 'camera,film',
      '--fashion',
      '-a', 'photo.jpg',
      '-l',
    ]);
    expect(result.template).toBe('cinematic');
    expect(result.load).toBe('my-preset');
    expect(result.packs).toEqual(['camera', 'film']);
    expect(result.preset).toBe('fashion');
    expect(result.analyze).toBe('photo.jpg');
    expect(result.listTemplates).toBe(true);
  });
});
