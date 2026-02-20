import { describe, expect, it } from 'bun:test';
import { generateJSON } from './json';
import { generateNaturalLanguage } from './natural';
import type { ImagePrompt } from '../types';

describe('JSON Generator', () => {
  describe('generateJSON', () => {
    it('should generate formatted JSON from a minimal prompt', () => {
      const prompt: ImagePrompt = { prompt_type: 'generate' };
      const result = generateJSON(prompt);
      expect(JSON.parse(result)).toEqual({ prompt_type: 'generate' });
    });

    it('should exclude undefined and null values', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: { description: 'A person', hair: undefined },
      };
      const result = JSON.parse(generateJSON(prompt));
      expect(result.subject).toEqual({ description: 'A person' });
      expect(result.subject.hair).toBeUndefined();
    });

    it('should handle nested objects', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        scene: { camera: { position: 'eye level', lens_mm: '50mm' } },
        lighting: { primary_source: 'soft window light' },
      };
      const result = JSON.parse(generateJSON(prompt));
      expect(result.scene.camera.position).toBe('eye level');
      expect(result.lighting.primary_source).toBe('soft window light');
    });

    it('should handle arrays in vibes field', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        vibes: ['cyberpunk', 'neon noir'],
      };
      const result = JSON.parse(generateJSON(prompt));
      expect(result.vibes).toEqual(['cyberpunk', 'neon noir']);
    });

    it('should remove empty nested objects', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: { hair: {}, face: {} },
      };
      const result = JSON.parse(generateJSON(prompt));
      expect(result.subject).toBeUndefined();
    });
  });

  describe('generateJSON compact mode', () => {
    it('should generate compact JSON without whitespace', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: { description: 'Test' },
      };
      const result = generateJSON(prompt, true);
      expect(result).not.toContain('\n');
      expect(result).not.toContain('  ');
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });
});

describe('Natural Language Generator', () => {
  it('should start with subject description and capitalize', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'a striking woman' },
    };
    const result = generateNaturalLanguage(prompt);
    expect(result).toStartWith('A striking woman');
    expect(result).toEndWith('.');
  });

  it('should include hair style with "with" prefix', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'A woman', hair: { style: 'long curls' } },
    };
    expect(generateNaturalLanguage(prompt)).toContain('with long curls');
  });

  it('should include clothing with "wearing" prefix', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'A model',
        clothing: { main_garment: 'leather jacket', hardware: 'silver zippers' },
      },
    };
    const result = generateNaturalLanguage(prompt);
    expect(result).toContain('wearing leather jacket');
    expect(result).toContain('with silver zippers');
  });

  it('should include environment location with "in" prefix', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'A person' },
      environment: { location: 'Tokyo alley' },
    };
    expect(generateNaturalLanguage(prompt)).toContain('in Tokyo alley');
  });

  it('should handle single vibe with "aesthetic" suffix', () => {
    const prompt: ImagePrompt = { prompt_type: 'generate', subject: { description: 'A scene' }, vibes: ['cyberpunk'] };
    expect(generateNaturalLanguage(prompt)).toContain('cyberpunk aesthetic');
  });

  it('should handle two vibes with "meets" connector', () => {
    const prompt: ImagePrompt = { prompt_type: 'generate', subject: { description: 'A scene' }, vibes: ['noir', 'retro'] };
    expect(generateNaturalLanguage(prompt)).toContain('noir meets retro energy');
  });

  it('should handle three+ vibes with "influences" suffix', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'A scene' },
      vibes: ['vintage', 'warm', 'nostalgic'],
    };
    expect(generateNaturalLanguage(prompt)).toContain('vintage, warm and nostalgic influences');
  });

  it('should include camera details', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'A portrait' },
      scene: { camera: { position: 'low angle', lens_mm: '35mm' } },
    };
    const result = generateNaturalLanguage(prompt);
    expect(result).toContain('shot from low angle');
    expect(result).toContain('35mm lens');
  });

  it('should handle comprehensive prompt with all elements', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'A striking woman',
        hair: { style: 'braids' },
        clothing: { main_garment: 'red dress' },
      },
      environment: { location: 'NYC subway' },
      lighting: { primary_source: 'flash', primary_effect: 'harsh' },
      atmosphere: { mood: 'tense' },
      vibes: ['Teller', 'Davidson'],
      technical: { aspect_ratio: '4:3' },
    };
    const result = generateNaturalLanguage(prompt);
    expect(result).toContain('A striking woman');
    expect(result).toContain('braids');
    expect(result).toContain('NYC subway');
    expect(result).toContain('flash');
    expect(result).toContain('4:3 aspect ratio');
  });

  it('should not have double periods', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'Test.' },
      atmosphere: { mood: 'calm.' },
    };
    expect(generateNaturalLanguage(prompt)).not.toContain('..');
  });

  it('should include accessories', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'A model',
        accessories: { hands: 'gloves', jewelry: 'chains', footwear: 'boots' },
      },
    };
    const result = generateNaturalLanguage(prompt);
    expect(result).toContain('gloves');
    expect(result).toContain('chains');
    expect(result).toContain('boots');
  });

  it('should not include "none" date stamps', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      film_texture: { date_stamp: 'none' },
    };
    expect(generateNaturalLanguage(prompt)).not.toContain('date stamp');
  });
});
