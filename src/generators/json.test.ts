import { describe, test, expect } from 'bun:test';
import { generateJSON, generateCompactJSON } from './json';
import type { ImagePrompt } from '../types';

describe('generateJSON', () => {
  test('generates formatted JSON from minimal prompt', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'a cat' },
    };

    const result = generateJSON(prompt);
    const parsed = JSON.parse(result);

    expect(parsed.prompt_type).toBe('generate');
    expect(parsed.subject.description).toBe('a cat');
  });

  test('removes undefined values', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'a person',
        hair: undefined,
      },
    };

    const result = generateJSON(prompt);
    const parsed = JSON.parse(result);

    expect(parsed.subject.hair).toBeUndefined();
    expect('hair' in parsed.subject).toBe(false);
  });

  test('removes null values', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'a person',
        action: null as any,
      },
    };

    const result = generateJSON(prompt);
    const parsed = JSON.parse(result);

    expect('action' in parsed.subject).toBe(false);
  });

  test('removes empty objects', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'a person',
        hair: {},
      },
    };

    const result = generateJSON(prompt);
    const parsed = JSON.parse(result);

    expect('hair' in parsed.subject).toBe(false);
  });

  test('removes empty arrays', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      vibes: [],
    };

    const result = generateJSON(prompt);
    const parsed = JSON.parse(result);

    expect('vibes' in parsed).toBe(false);
  });

  test('preserves arrays with values', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      vibes: ['cyberpunk', 'neon'],
    };

    const result = generateJSON(prompt);
    const parsed = JSON.parse(result);

    expect(parsed.vibes).toEqual(['cyberpunk', 'neon']);
  });

  test('filters null/undefined from arrays', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      vibes: ['cyberpunk', null as any, 'neon', undefined as any],
    };

    const result = generateJSON(prompt);
    const parsed = JSON.parse(result);

    expect(parsed.vibes).toEqual(['cyberpunk', 'neon']);
  });

  test('handles deeply nested objects', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'fashion model',
        clothing: {
          main_garment: 'leather jacket',
          hardware: 'silver zippers',
        },
      },
      lighting: {
        primary_source: 'neon signs',
        primary_effect: 'rim lighting',
      },
    };

    const result = generateJSON(prompt);
    const parsed = JSON.parse(result);

    expect(parsed.subject.clothing.main_garment).toBe('leather jacket');
    expect(parsed.lighting.primary_effect).toBe('rim lighting');
  });

  test('outputs formatted JSON with 2-space indentation', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'test' },
    };

    const result = generateJSON(prompt);

    expect(result).toContain('  '); // Contains 2-space indentation
    expect(result).toContain('\n'); // Contains newlines
  });
});

describe('generateCompactJSON', () => {
  test('generates single-line JSON', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'a cat' },
    };

    const result = generateCompactJSON(prompt);

    expect(result).not.toContain('\n');
    expect(result).toBe('{"prompt_type":"generate","subject":{"description":"a cat"}}');
  });

  test('applies same cleaning as generateJSON', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'test',
        hair: undefined,
      },
      vibes: [],
    };

    const result = generateCompactJSON(prompt);
    const parsed = JSON.parse(result);

    expect('hair' in parsed.subject).toBe(false);
    expect('vibes' in parsed).toBe(false);
  });
});

describe('edge cases', () => {
  test('handles prompt with only prompt_type', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'edit',
    };

    const result = generateJSON(prompt);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({ prompt_type: 'edit' });
  });

  test('preserves falsy but valid values like empty strings', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: '', // empty string should be preserved
      },
    };

    const result = generateJSON(prompt);
    const parsed = JSON.parse(result);

    expect(parsed.subject.description).toBe('');
  });

  test('preserves number zero values', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      scene: {
        camera: {
          lens_mm: '0', // string "0" should be preserved
        },
      },
    };

    const result = generateJSON(prompt);
    const parsed = JSON.parse(result);

    expect(parsed.scene.camera.lens_mm).toBe('0');
  });
});
