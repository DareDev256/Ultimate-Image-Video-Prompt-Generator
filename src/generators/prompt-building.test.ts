import { describe, test, expect } from 'bun:test';
import { generateJSON } from './json';
import { generateNaturalLanguage } from './natural';
import type { ImagePrompt } from '../types';

describe('prompt building: action vs body_position precedence', () => {
  test('action takes priority over body_position when both exist', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'A dancer',
        action: 'leaping through the air',
        body_position: 'crouching',
      },
    };

    const result = generateNaturalLanguage(prompt);

    expect(result).toContain('leaping through the air');
    expect(result).not.toContain('crouching');
  });

  test('body_position used only when action is absent', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'A figure',
        body_position: 'seated cross-legged',
      },
    };

    const result = generateNaturalLanguage(prompt);

    expect(result).toContain('seated cross-legged');
  });
});

describe('prompt building: section ordering in natural language', () => {
  test('subject appears before environment in output', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'A photographer' },
      environment: { location: 'a rooftop at sunset' },
    };

    const result = generateNaturalLanguage(prompt);
    const subjectIdx = result.indexOf('A photographer');
    const envIdx = result.indexOf('in a rooftop at sunset');

    expect(subjectIdx).toBeLessThan(envIdx);
  });

  test('camera details appear before lighting', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      scene: { camera: { position: 'overhead', lens_mm: '24mm' } },
      lighting: { primary_source: 'candlelight' },
    };

    const result = generateNaturalLanguage(prompt);
    const camIdx = result.indexOf('shot from overhead');
    const lightIdx = result.indexOf('candlelight');

    expect(camIdx).toBeLessThan(lightIdx);
  });

  test('vibes appear after atmosphere', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      atmosphere: { mood: 'melancholic' },
      vibes: ['lo-fi'],
    };

    const result = generateNaturalLanguage(prompt);
    const moodIdx = result.indexOf('melancholic');
    const vibeIdx = result.indexOf('lo-fi aesthetic');

    expect(moodIdx).toBeLessThan(vibeIdx);
  });
});

describe('prompt building: cleanObject deep nesting via JSON', () => {
  test('removes deeply nested empty objects', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        hair: {},
        face: {},
        clothing: {},
        accessories: {},
      },
    };

    const result = JSON.parse(generateJSON(prompt));

    // Subject itself becomes empty and should be removed
    expect(result.subject).toBeUndefined();
  });

  test('preserves boolean false if it existed in a mixed structure', () => {
    // While ImagePrompt fields are strings, cleanObject should handle any value
    const prompt = {
      prompt_type: 'generate' as const,
      subject: { description: 'test' },
      semantic_negatives: '',
    } satisfies ImagePrompt;

    const result = JSON.parse(generateJSON(prompt));

    // Empty string is a valid falsy value — should be preserved
    expect(result.semantic_negatives).toBe('');
  });

  test('handles prompt with all sections undefined gracefully', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: undefined,
      environment: undefined,
      lighting: undefined,
      atmosphere: undefined,
    };

    const result = JSON.parse(generateJSON(prompt));

    expect(result).toEqual({ prompt_type: 'generate' });
  });
});

describe('prompt building: natural language with special inputs', () => {
  test('handles unicode characters in subject', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: '東京の女性 with neon lights' },
    };

    const result = generateNaturalLanguage(prompt);

    expect(result).toContain('東京の女性');
    expect(result).toMatch(/\.$/);
  });

  test('handles very long descriptions without breaking', () => {
    const longDesc = 'A ' + 'very '.repeat(50) + 'tall person';
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: longDesc },
    };

    const result = generateNaturalLanguage(prompt);

    expect(result).toContain(longDesc);
    expect(result).toMatch(/^A/);
    expect(result).toMatch(/\.$/);
  });

  test('handles subject description that already ends with period', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'A person standing still.' },
      environment: { location: 'a park' },
    };

    const result = generateNaturalLanguage(prompt);

    expect(result).not.toContain('..');
    expect(result).toMatch(/\.$/);
  });
});

describe('prompt building: generator consistency', () => {
  const fullPrompt: ImagePrompt = {
    prompt_type: 'generate',
    subject: {
      description: 'A street photographer',
      hair: { style: 'short dreads' },
      clothing: { main_garment: 'cargo pants and hoodie' },
      action: 'kneeling to frame a shot',
      accessories: { hands: 'vintage film camera' },
    },
    environment: { location: 'a foggy bridge at dawn' },
    scene: { camera: { position: 'low angle', lens_mm: '35mm' } },
    lighting: { primary_source: 'diffused morning light' },
    atmosphere: { mood: 'contemplative', elements: 'mist rising from water' },
    vibes: ['Vivian Maier', 'street documentary'],
    technical: { aspect_ratio: '3:2' },
    color: { grade: 'desaturated cool tones' },
    film_texture: { grain: 'heavy grain', lens_quality: 'sharp center soft edges' },
  };

  test('JSON output contains all non-empty fields from input', () => {
    const result = JSON.parse(generateJSON(fullPrompt));

    expect(result.prompt_type).toBe('generate');
    expect(result.subject.description).toBe('A street photographer');
    expect(result.subject.hair.style).toBe('short dreads');
    expect(result.environment.location).toBe('a foggy bridge at dawn');
    expect(result.vibes).toEqual(['Vivian Maier', 'street documentary']);
    expect(result.technical.aspect_ratio).toBe('3:2');
  });

  test('natural language output references all key elements', () => {
    const result = generateNaturalLanguage(fullPrompt);

    expect(result).toContain('A street photographer');
    expect(result).toContain('short dreads');
    expect(result).toContain('cargo pants and hoodie');
    expect(result).toContain('kneeling to frame a shot');
    expect(result).toContain('vintage film camera');
    expect(result).toContain('a foggy bridge at dawn');
    expect(result).toContain('low angle');
    expect(result).toContain('35mm lens');
    expect(result).toContain('diffused morning light');
    expect(result).toContain('contemplative');
    expect(result).toContain('Vivian Maier meets street documentary energy');
    expect(result).toContain('3:2 aspect ratio');
    expect(result).toContain('desaturated cool tones');
    expect(result).toContain('heavy grain');
  });

  test('compact JSON is valid and equivalent to formatted JSON', () => {
    const formatted = JSON.parse(generateJSON(fullPrompt));
    const compact = JSON.parse(generateJSON(fullPrompt, true));

    expect(compact).toEqual(formatted);
  });
});

describe('prompt building: empty/minimal prompt handling', () => {
  test('natural language handles completely empty prompt', () => {
    const prompt: ImagePrompt = { prompt_type: 'generate' };

    const result = generateNaturalLanguage(prompt);

    // Should produce a valid string (just a period for empty parts joined)
    expect(typeof result).toBe('string');
    expect(result).toMatch(/\.$/);
  });

  test('JSON handles edit prompt type', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'edit',
      subject: { description: 'modify background color' },
    };

    const result = JSON.parse(generateJSON(prompt));

    expect(result.prompt_type).toBe('edit');
    expect(result.subject.description).toBe('modify background color');
  });

  test('natural language with only vibes produces valid output', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      vibes: ['synthwave', 'retro', 'neon', 'vaporwave'],
    };

    const result = generateNaturalLanguage(prompt);

    // 4 vibes → "influences" format
    // First word gets capitalized since vibes is the first section
    expect(result).toContain('Synthwave, retro, neon and vaporwave influences');
    expect(result).toMatch(/^[A-Z]/);
    expect(result).toMatch(/\.$/);
  });
});
