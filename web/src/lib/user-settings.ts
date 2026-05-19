/**
 * User-tunable defaults persisted to `localStorage`.
 *
 * The app already stores per-provider API keys under `<id>ApiKey`. This module
 * adds *generation defaults* — size/quality/aspect/duration/audio — that the
 * wizard and quick mode read at submit-time so users don't have to re-pick
 * every shoot.
 *
 * All values are best-effort: a missing or malformed entry falls back to the
 * provider default. Server-side routes still validate inputs — settings are
 * just convenience.
 */

import type { ModelType } from '@/context/WizardContext';

/** localStorage key namespace. Bump if shape changes incompatibly. */
const STORAGE_KEY = 'uipg.user-settings.v1';

/* ─── Image-model defaults ─── */
export interface ImageModelDefaults {
  size: string;    // '1024x1024', '1536x1024', etc.
  quality: string; // model-specific (low/medium/high/auto for GPT-Image-2; n/a for Nano Banana)
}

/* ─── Video-model defaults ─── */
export interface VideoModelDefaults {
  aspectRatio: '16:9' | '9:16' | '1:1';
  duration: number;        // seconds
  resolution?: string;     // '720p' / '1080p' / etc
  tier?: 'pro' | 'fast';   // Seedance/Veo
  generateAudio?: boolean; // Veo
}

export type ModelDefaults = ImageModelDefaults | VideoModelDefaults;

export interface UserSettings {
  defaults: Partial<Record<ModelType, ModelDefaults>>;
}

/** Per-model factory defaults — used when nothing is in localStorage. */
export const FACTORY_DEFAULTS: Record<ModelType, ModelDefaults> = {
  'nano-banana': { size: '1024x1024', quality: 'auto' },
  openai: { size: '1024x1024', quality: 'high' },
  kling: { aspectRatio: '16:9', duration: 5 },
  seedance: { aspectRatio: '16:9', duration: 5, resolution: '1080p', tier: 'pro' },
  veo: { aspectRatio: '16:9', duration: 8, resolution: '1080p', tier: 'pro', generateAudio: true },
  wan: { aspectRatio: '16:9', duration: 5, resolution: '720p' },
  hunyuan: { aspectRatio: '16:9', duration: 5, resolution: '720p' },
  ltx: { aspectRatio: '16:9', duration: 5, resolution: '720p' },
  mochi: { aspectRatio: '16:9', duration: 5 },
};

/** Per-model UI option lists. Keep in sync with the matching API route validators. */
export const OPTIONS: Record<ModelType, Record<string, readonly (string | number | boolean)[]>> = {
  'nano-banana': {
    size: ['1024x1024'] as const,
    quality: ['auto'] as const,
  },
  openai: {
    size: ['1024x1024', '1536x1024', '1024x1536', '2048x2048'] as const,
    quality: ['low', 'medium', 'high', 'auto'] as const,
  },
  kling: {
    aspectRatio: ['16:9', '9:16', '1:1'] as const,
    duration: [5, 10] as const,
  },
  seedance: {
    aspectRatio: ['16:9', '9:16', '1:1'] as const,
    duration: [5, 10] as const,
    resolution: ['720p', '1080p'] as const,
    tier: ['pro', 'fast'] as const,
  },
  veo: {
    aspectRatio: ['16:9', '9:16', '1:1'] as const,
    duration: [4, 6, 8] as const,
    resolution: ['720p', '1080p'] as const,
    tier: ['pro', 'fast'] as const,
    generateAudio: [true, false] as const,
  },
  wan: {
    aspectRatio: ['16:9', '9:16', '1:1'] as const,
    duration: [5] as const,
    resolution: ['480p', '720p'] as const,
  },
  hunyuan: {
    aspectRatio: ['16:9', '9:16', '1:1'] as const,
    duration: [5, 10] as const,
    resolution: ['540p', '720p'] as const,
  },
  ltx: {
    aspectRatio: ['16:9', '9:16', '1:1'] as const,
    resolution: ['720p', '1080p'] as const,
  },
  mochi: {
    aspectRatio: ['16:9'] as const,
  },
};

export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return { defaults: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { defaults: {} };
    const parsed = JSON.parse(raw) as UserSettings;
    return parsed?.defaults ? parsed : { defaults: {} };
  } catch {
    return { defaults: {} };
  }
}

export function saveSettings(s: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // localStorage full or unavailable — silently fall back
  }
}

export function resetSettings(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Read the effective defaults for a model (user override → factory). */
export function getModelDefaults<T extends ModelDefaults = ModelDefaults>(model: ModelType): T {
  const stored = loadSettings();
  const userOverride = stored.defaults[model];
  return { ...(FACTORY_DEFAULTS[model] as T), ...(userOverride as T | undefined) };
}

/** Persist a partial update for one model. */
export function setModelDefaults(model: ModelType, patch: Partial<ModelDefaults>): void {
  const current = loadSettings();
  const next: UserSettings = {
    ...current,
    defaults: {
      ...current.defaults,
      [model]: { ...FACTORY_DEFAULTS[model], ...current.defaults[model], ...patch },
    },
  };
  saveSettings(next);
}
