import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'bun:test';
import { mkdtempSync, rmSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { ImagePrompt } from '../types';

// ─── Test Isolation Strategy ─────────────────────────────────────────
// The storage modules compute CONFIG_DIR from os.homedir() at module
// load time. We set up a temp home directory BEFORE importing them,
// ensuring all file operations go to an isolated location. Between
// tests we wipe the .prompt-gen directory to reset state.
// ─────────────────────────────────────────────────────────────────────

const tempHome = mkdtempSync(join(tmpdir(), 'prompt-gen-test-'));
const configDir = join(tempHome, '.prompt-gen');

// Mock os.homedir before any storage module import
import { mock } from 'bun:test';
mock.module('os', () => ({
  homedir: () => tempHome,
}));

// Now import storage modules — they'll use our temp homedir
const { ensureConfigDir, loadConfig, saveConfig, getConfigDir } = await import('./config');
const { loadFavorites, saveFavorites, addFavorite, removeFavorite, getFavoritesForField } = await import('./favorites');
const { savePreset, loadPreset, listPresets, deletePreset } = await import('./presets');

beforeEach(() => {
  // Wipe the config directory between tests for full isolation
  rmSync(configDir, { recursive: true, force: true });
});

afterAll(() => {
  mock.restore();
  rmSync(tempHome, { recursive: true, force: true });
});

// ─── Config Module ───────────────────────────────────────────────────

describe('config', () => {
  test('ensureConfigDir creates .prompt-gen and presets directories', () => {
    ensureConfigDir();

    expect(existsSync(configDir)).toBe(true);
    expect(existsSync(join(configDir, 'presets'))).toBe(true);
  });

  test('loadConfig returns defaults when no config file exists', () => {
    const config = loadConfig();

    expect(config).toEqual({
      defaultPreset: 'standard',
      lastUsedTemplate: '',
    });
  });

  test('saveConfig writes and loadConfig reads back correctly', () => {
    const config = { defaultPreset: 'fashion', lastUsedTemplate: 'street' };

    saveConfig(config);
    const loaded = loadConfig();

    expect(loaded).toEqual(config);
  });

  test('saveConfig overwrites existing config', () => {
    saveConfig({ defaultPreset: 'quick', lastUsedTemplate: 'a' });
    saveConfig({ defaultPreset: 'full', lastUsedTemplate: 'b' });

    const loaded = loadConfig();
    expect(loaded.defaultPreset).toBe('full');
    expect(loaded.lastUsedTemplate).toBe('b');
  });

  test('getConfigDir returns path under homedir', () => {
    expect(getConfigDir()).toContain('.prompt-gen');
  });
});

// ─── Favorites Module ────────────────────────────────────────────────

describe('favorites', () => {
  test('loadFavorites returns empty object when no file exists', () => {
    expect(loadFavorites()).toEqual({});
  });

  test('addFavorite creates a new field entry', () => {
    addFavorite('lighting', 'neon glow');

    expect(getFavoritesForField('lighting')).toEqual(['neon glow']);
  });

  test('addFavorite adds to front (LIFO order)', () => {
    addFavorite('vibes', 'cyberpunk');
    addFavorite('vibes', 'noir');
    addFavorite('vibes', 'retro');

    expect(getFavoritesForField('vibes')).toEqual(['retro', 'noir', 'cyberpunk']);
  });

  test('addFavorite does not duplicate existing values', () => {
    addFavorite('mood', 'dark');
    addFavorite('mood', 'light');
    addFavorite('mood', 'dark'); // duplicate — should be ignored

    expect(getFavoritesForField('mood')).toEqual(['light', 'dark']);
  });

  test('addFavorite enforces max 10 items per field', () => {
    for (let i = 0; i < 15; i++) {
      addFavorite('styles', `style-${i}`);
    }

    const result = getFavoritesForField('styles');
    expect(result).toHaveLength(10);
    expect(result[0]).toBe('style-14');
    expect(result[9]).toBe('style-5');
  });

  test('removeFavorite removes a specific value', () => {
    addFavorite('camera', 'wide angle');
    addFavorite('camera', 'close up');
    addFavorite('camera', 'macro');

    removeFavorite('camera', 'close up');

    expect(getFavoritesForField('camera')).toEqual(['macro', 'wide angle']);
  });

  test('removeFavorite is a no-op for non-existent field', () => {
    removeFavorite('nonexistent', 'value');

    expect(loadFavorites()).toEqual({});
  });

  test('getFavoritesForField returns empty array for unknown field', () => {
    expect(getFavoritesForField('unknown_field')).toEqual([]);
  });

  test('saveFavorites persists data across loads', () => {
    const data = { hair: ['braids', 'curls'], mood: ['dark'] };
    saveFavorites(data);

    expect(loadFavorites()).toEqual(data);
  });

  test('multiple fields operate independently', () => {
    addFavorite('lighting', 'soft');
    addFavorite('atmosphere', 'foggy');
    addFavorite('lighting', 'harsh');

    removeFavorite('atmosphere', 'foggy');

    expect(getFavoritesForField('lighting')).toEqual(['harsh', 'soft']);
    expect(getFavoritesForField('atmosphere')).toEqual([]);
  });
});

// ─── Presets Module ──────────────────────────────────────────────────

describe('presets', () => {
  test('listPresets returns empty array when no presets exist', () => {
    expect(listPresets()).toEqual([]);
  });

  test('savePreset and loadPreset roundtrip correctly', () => {
    const prompt: ImagePrompt = {
      prompt_type: 'generate',
      subject: { description: 'cyberpunk warrior' },
      vibes: ['neon', 'dark'],
    };

    savePreset('cyber-test', prompt);
    const loaded = loadPreset('cyber-test');

    expect(loaded).toEqual(prompt);
  });

  test('loadPreset returns null for non-existent preset', () => {
    expect(loadPreset('does-not-exist')).toBeNull();
  });

  test('listPresets returns names without .json extension', () => {
    savePreset('street-photo', { prompt_type: 'generate' });
    savePreset('fashion-editorial', { prompt_type: 'generate' });

    const presets = listPresets();
    expect(presets).toContain('street-photo');
    expect(presets).toContain('fashion-editorial');
    expect(presets).toHaveLength(2);
    expect(presets.every(p => !p.includes('.json'))).toBe(true);
  });

  test('deletePreset removes the preset file', () => {
    savePreset('temp-preset', { prompt_type: 'edit' });
    expect(loadPreset('temp-preset')).not.toBeNull();

    const deleted = deletePreset('temp-preset');
    expect(deleted).toBe(true);
    expect(loadPreset('temp-preset')).toBeNull();
    expect(listPresets()).not.toContain('temp-preset');
  });

  test('deletePreset returns false for non-existent preset', () => {
    expect(deletePreset('phantom-preset')).toBe(false);
  });

  test('savePreset overwrites existing preset', () => {
    savePreset('evolving', { prompt_type: 'generate', subject: { description: 'v1' } });
    savePreset('evolving', { prompt_type: 'generate', subject: { description: 'v2' } });

    const loaded = loadPreset('evolving');
    expect(loaded?.subject?.description).toBe('v2');
  });

  test('savePreset handles complex nested prompts', () => {
    const complex: ImagePrompt = {
      prompt_type: 'generate',
      subject: {
        description: 'fashion model on runway',
        hair: { style: 'slicked back', structure: 'wet look' },
        clothing: { main_garment: 'haute couture gown', hardware: 'crystal beading' },
        accessories: { jewelry: 'statement earrings', footwear: 'platform heels' },
      },
      lighting: {
        primary_source: 'spotlight from above',
        primary_effect: 'dramatic shadows',
        ambient: 'dim warm glow',
      },
      atmosphere: { mood: 'electric', air_quality: 'hazy' },
      vibes: ['high fashion', 'editorial', 'avant-garde'],
      technical: { aspect_ratio: '3:4' },
    };

    savePreset('fashion-complex', complex);
    const loaded = loadPreset('fashion-complex');

    expect(loaded).toEqual(complex);
    expect(loaded?.subject?.hair?.style).toBe('slicked back');
    expect(loaded?.vibes).toHaveLength(3);
  });

  test('listPresets ignores non-json files', () => {
    ensureConfigDir();
    const presetsDir = join(getConfigDir(), 'presets');
    writeFileSync(join(presetsDir, 'readme.txt'), 'not a preset');
    writeFileSync(join(presetsDir, '.DS_Store'), '');

    savePreset('real-preset', { prompt_type: 'generate' });

    expect(listPresets()).toEqual(['real-preset']);
  });
});
