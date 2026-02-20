import { describe, test, expect } from 'bun:test';
import { builtInTemplates, getTemplate, listTemplates } from './templates';
import { generateNaturalLanguage } from '../generators/natural';
import { generateJSON } from '../generators/json';
import type { ImagePrompt, Template } from '../types';

/**
 * Template-through-pipeline integration tests.
 *
 * These verify that every built-in template produces meaningful output
 * when run through the generator pipeline. A template with a misplaced
 * field or wrong nesting would silently produce empty/degenerate output
 * without these tests catching it.
 */

/** Merge a template's fields into a minimal ImagePrompt */
function templateToPrompt(template: Template): ImagePrompt {
  const { name, description, ...fields } = template;
  return {
    prompt_type: 'generate',
    ...fields,
  } as ImagePrompt;
}

describe('template → natural language pipeline', () => {
  for (const template of builtInTemplates) {
    test(`${template.name}: produces non-trivial natural language output`, () => {
      const prompt = templateToPrompt(template);
      const result = generateNaturalLanguage(prompt);

      // Must be a real sentence, not just "."
      expect(result.length).toBeGreaterThan(10);
      expect(result).toMatch(/^[A-Z]/); // Capitalized
      expect(result).toMatch(/\.$/);    // Ends with period
    });

    test(`${template.name}: vibes appear in natural language`, () => {
      const prompt = templateToPrompt(template);
      const result = generateNaturalLanguage(prompt);

      // Every template has vibes — at least one should appear in output
      const hasAnyVibe = template.vibes!.some(v => result.includes(v));
      expect(hasAnyVibe).toBe(true);
    });
  }

  test('street-photo template includes camera and lighting details', () => {
    const prompt = templateToPrompt(getTemplate('street-photo')!);
    const result = generateNaturalLanguage(prompt);

    expect(result).toContain('waist height');
    expect(result).toContain('35mm lens');
    expect(result).toContain('harsh direct flash');
  });

  test('cinematic template includes atmosphere and color', () => {
    const prompt = templateToPrompt(getTemplate('cinematic')!);
    const result = generateNaturalLanguage(prompt);

    expect(result).toContain('narrative tension');
    expect(result).toContain('teal and orange or stylized');
  });

  test('documentary template preserves action field', () => {
    const prompt = templateToPrompt(getTemplate('documentary')!);
    const result = generateNaturalLanguage(prompt);

    // documentary has subject.action = 'engaged in real activity'
    // First letter gets capitalized since action is first non-empty section
    expect(result.toLowerCase()).toContain('engaged in real activity');
  });
});

describe('template → JSON pipeline', () => {
  for (const template of builtInTemplates) {
    test(`${template.name}: JSON roundtrips without data loss`, () => {
      const prompt = templateToPrompt(template);
      const json = generateJSON(prompt);
      const parsed = JSON.parse(json);

      // prompt_type always survives
      expect(parsed.prompt_type).toBe('generate');

      // vibes always survive (every template has them)
      expect(parsed.vibes).toEqual(template.vibes);
    });

    test(`${template.name}: compact JSON equals formatted JSON`, () => {
      const prompt = templateToPrompt(template);
      const formatted = JSON.parse(generateJSON(prompt));
      const compact = JSON.parse(generateJSON(prompt, true));

      expect(compact).toEqual(formatted);
    });
  }

  test('cleanObject preserves all street-photo nested fields', () => {
    const prompt = templateToPrompt(getTemplate('street-photo')!);
    const parsed = JSON.parse(generateJSON(prompt));

    // Verify deep nesting survived cleaning
    expect(parsed.scene.camera.position).toBe('waist height');
    expect(parsed.scene.camera.lens_mm).toBe('35mm');
    expect(parsed.scene.camera.psychological_intent).toBe('stolen moment, voyeuristic');
    expect(parsed.lighting.primary_source).toBe('harsh direct flash');
    expect(parsed.film_texture.grain).toBe('visible high ISO grain');
  });

  test('surreal template has no subject — JSON omits it', () => {
    const prompt = templateToPrompt(getTemplate('surreal')!);
    const parsed = JSON.parse(generateJSON(prompt));

    // surreal template has no subject field at all
    expect(parsed.subject).toBeUndefined();
    // but environment and lighting should be present
    expect(parsed.environment.location).toBe('impossible or transformed space');
    expect(parsed.lighting.quality).toBe('otherworldly');
  });
});

describe('template merging with user data', () => {
  test('user subject overrides template subject', () => {
    const template = getTemplate('studio-portrait')!;
    const { name, description, ...templateFields } = template;
    const merged: ImagePrompt = {
      prompt_type: 'generate',
      ...templateFields,
      subject: {
        ...templateFields.subject,
        description: 'A jazz musician',
        action: 'playing saxophone',
      },
    };

    const result = generateNaturalLanguage(merged);
    expect(result).toContain('A jazz musician');
    expect(result).toContain('playing saxophone');
    // Template camera should still be present
    expect(result).toContain('eye level');
    expect(result).toContain('85mm lens');
  });

  test('user vibes replace template vibes', () => {
    const template = getTemplate('cinematic')!;
    const prompt = templateToPrompt(template);
    const customPrompt: ImagePrompt = { ...prompt, vibes: ['cyberpunk'] };

    const result = generateNaturalLanguage(customPrompt);
    expect(result).toContain('cyberpunk aesthetic');
    // Original template vibes should be gone
    expect(result).not.toContain('Roger Deakins');
  });

  test('merging empty user sections does not clobber template data', () => {
    const template = getTemplate('fashion-editorial')!;
    const prompt = templateToPrompt(template);
    // Spread an empty subject onto a template that has subject fields
    const merged: ImagePrompt = {
      ...prompt,
      subject: { ...prompt.subject },
    };

    const json = JSON.parse(generateJSON(merged));
    expect(json.subject.body_position).toBe('dynamic, fashion pose');
    expect(json.subject.movement).toBe('frozen at peak of gesture');
  });
});

describe('template data integrity (deep)', () => {
  test('all templates have scene.camera or explicit scene fields', () => {
    // Templates that define scene should have camera data
    const withScene = builtInTemplates.filter(t => t.scene);
    expect(withScene.length).toBeGreaterThan(0);

    for (const t of withScene) {
      // If scene exists, effect_type or camera should be present
      const hasContent = t.scene!.effect_type || t.scene!.camera;
      expect(hasContent).toBeTruthy();
    }
  });

  test('no template has conflicting aspect ratios', () => {
    for (const t of builtInTemplates) {
      if (t.technical?.aspect_ratio && t.film_texture?.format) {
        // If both exist, they should be consistent or film_texture.format
        // should be a superset (e.g. "2.35:1 or 16:9" includes "2.35:1")
        const techRatio = t.technical.aspect_ratio;
        const filmFormat = t.film_texture.format;
        const isConsistent =
          filmFormat.includes(techRatio) || techRatio.includes(filmFormat);
        expect(isConsistent).toBe(true);
      }
    }
  });

  test('every template name is a valid slug (lowercase, hyphens only)', () => {
    for (const t of builtInTemplates) {
      expect(t.name).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  test('every template description is under 60 chars (fits in CLI menu)', () => {
    for (const t of builtInTemplates) {
      expect(t.description.length).toBeLessThanOrEqual(60);
    }
  });
});
