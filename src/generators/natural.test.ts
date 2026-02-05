import { describe, test, expect } from 'bun:test';
import { generateNaturalLanguage } from './natural';
import type { ImagePrompt } from '../types';

describe('generateNaturalLanguage', () => {
  describe('subject handling', () => {
    test('starts with subject description', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: { description: 'A young woman with striking features' },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toMatch(/^A young woman with striking features/);
    });

    test('includes hair details', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: {
          description: 'A model',
          hair: {
            style: 'long wavy hair',
            structure: 'layered',
          },
        },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('with long wavy hair');
      expect(result).toContain('(layered)');
    });

    test('skips hair structure when same as style', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: {
          description: 'A model',
          hair: {
            style: 'curly',
            structure: 'curly',
          },
        },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('with curly');
      expect(result).not.toContain('(curly)');
    });

    test('includes clothing details', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: {
          description: 'A person',
          clothing: {
            main_garment: 'a vintage leather jacket',
            hardware: 'silver buckles',
          },
        },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('wearing a vintage leather jacket');
      expect(result).toContain('with silver buckles');
    });

    test('includes action when present', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: {
          description: 'A dancer',
          action: 'spinning gracefully',
        },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('spinning gracefully');
    });

    test('uses body_position as fallback when no action', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: {
          description: 'A model',
          body_position: 'leaning against a wall',
        },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('leaning against a wall');
    });

    test('includes accessories', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: {
          description: 'A person',
          accessories: {
            hands: 'holding a camera',
            jewelry: 'gold rings',
            footwear: 'white sneakers',
          },
        },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('with holding a camera, gold rings, white sneakers');
    });
  });

  describe('environment handling', () => {
    test('includes location', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        environment: { location: 'a neon-lit Tokyo alley' },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('in a neon-lit Tokyo alley');
    });
  });

  describe('camera handling', () => {
    test('includes camera position and lens', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        scene: {
          camera: {
            position: 'eye level',
            lens_mm: '85mm',
          },
        },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('shot from eye level');
      expect(result).toContain('85mm lens');
    });
  });

  describe('lighting handling', () => {
    test('includes lighting source and effect', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        lighting: {
          primary_source: 'golden hour sunlight',
          primary_effect: 'rim lighting',
        },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('golden hour sunlight');
      expect(result).toContain('rim lighting');
    });
  });

  describe('atmosphere handling', () => {
    test('includes mood and elements', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        atmosphere: {
          mood: 'mysterious and ethereal',
          elements: 'light fog',
        },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('mysterious and ethereal');
      expect(result).toContain('light fog');
    });
  });

  describe('film texture handling', () => {
    test('includes grain and lens quality', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        film_texture: {
          grain: 'fine film grain',
          lens_quality: 'slightly soft focus',
        },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('fine film grain');
      expect(result).toContain('slightly soft focus');
    });

    test('includes date stamp when not "none"', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        film_texture: {
          date_stamp: '1999-08-15',
        },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('date stamp 1999-08-15');
    });

    test('excludes date stamp when set to "none"', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        film_texture: {
          date_stamp: 'none',
        },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).not.toContain('date stamp');
    });
  });

  describe('vibes handling', () => {
    test('handles single vibe', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        vibes: ['cyberpunk'],
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('cyberpunk aesthetic');
    });

    test('handles two vibes', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        vibes: ['cyberpunk', 'noir'],
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('cyberpunk meets noir energy');
    });

    test('handles three or more vibes', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        vibes: ['cyberpunk', 'noir', 'vintage'],
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('cyberpunk, noir and vintage influences');
    });

    test('handles empty vibes array gracefully', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        vibes: [],
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).not.toContain('aesthetic');
      expect(result).not.toContain('energy');
      expect(result).not.toContain('influences');
    });
  });

  describe('technical handling', () => {
    test('includes aspect ratio', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        technical: { aspect_ratio: '16:9' },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('16:9 aspect ratio');
    });
  });

  describe('color handling', () => {
    test('includes color grade', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        color: { grade: 'warm tones with teal shadows' },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('warm tones with teal shadows');
    });
  });

  describe('formatting', () => {
    test('capitalizes first letter', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: { description: 'a cat' },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toMatch(/^A/);
    });

    test('ends with period', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: { description: 'A cat' },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toMatch(/\.$/);
    });

    test('does not create double periods', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: { description: 'A cat.' },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).not.toContain('..');
    });

    test('handles empty prompt gracefully', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
      };

      const result = generateNaturalLanguage(prompt);

      // Should at least have a period and be properly capitalized
      expect(result).toMatch(/\.$/);
    });
  });

  describe('full integration', () => {
    test('generates cohesive natural language from full prompt', () => {
      const prompt: ImagePrompt = {
        prompt_type: 'generate',
        subject: {
          description: 'A fashion model',
          hair: { style: 'platinum blonde pixie cut' },
          clothing: {
            main_garment: 'an oversized blazer',
            hardware: 'gold buttons',
          },
          action: 'walking confidently',
        },
        environment: { location: 'a rain-soaked city street' },
        lighting: {
          primary_source: 'neon signs',
          primary_effect: 'colorful reflections',
        },
        atmosphere: { mood: 'cinematic' },
        vibes: ['blade runner', 'high fashion'],
        technical: { aspect_ratio: '2.39:1' },
      };

      const result = generateNaturalLanguage(prompt);

      expect(result).toContain('A fashion model');
      expect(result).toContain('with platinum blonde pixie cut');
      expect(result).toContain('wearing an oversized blazer');
      expect(result).toContain('walking confidently');
      expect(result).toContain('in a rain-soaked city street');
      expect(result).toContain('neon signs');
      expect(result).toContain('cinematic');
      expect(result).toContain('blade runner meets high fashion energy');
      expect(result).toContain('2.39:1 aspect ratio');
      expect(result.charAt(0)).toBe('A');
      expect(result.endsWith('.')).toBe(true);
    });
  });
});
