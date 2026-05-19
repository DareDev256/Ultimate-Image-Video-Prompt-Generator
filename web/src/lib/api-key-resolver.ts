/**
 * Maps a wizard `ModelType` to the localStorage slot that holds its API key.
 *
 * The 6 fal-hosted video models (Seedance, Veo, Wan, Hunyuan, LTX, Mochi) all
 * share a single `falApiKey` slot — one paste from the user unlocks all of
 * them. Direct-API models (Gemini, OpenAI, Kling) use their own slot.
 */

import type { ModelType } from '@/context/WizardContext';

const FAL_HOSTED: ReadonlySet<ModelType> = new Set([
  'seedance',
  'veo',
  'wan',
  'hunyuan',
  'ltx',
  'mochi',
]);

/** Returns the localStorage key name where the relevant API key lives. */
export function apiKeyStorageSlot(model: ModelType): string {
  if (FAL_HOSTED.has(model)) return 'falApiKey';
  return `${model}ApiKey`;
}

/** Reads the user's API key for the given model from localStorage (browser only). */
export function readApiKey(model: ModelType): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(apiKeyStorageSlot(model));
}

/** Whether this model supports the server-side free tier (no key required). */
export function modelHasFreeTier(model: ModelType): boolean {
  return model === 'nano-banana';
}
