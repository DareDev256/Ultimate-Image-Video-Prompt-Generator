import type { ModelType } from '@/context/WizardContext';

/** Human-readable display names keyed by model ID. */
export const MODEL_NAMES: Record<ModelType, string> = {
  'nano-banana': 'Nano Banana',
  openai: 'DALL-E 3',
  kling: 'Kling',
};

/** Brand colors per model — used for badges, glows, and progress indicators. */
export const MODEL_COLORS: Record<ModelType, string> = {
  'nano-banana': '#00d4ff',
  openai: '#00ff88',
  kling: '#ff00aa',
};

const VALID_MODELS = new Set<string>(Object.keys(MODEL_NAMES));

/** Type guard: narrows an unknown string to `ModelType`. */
export function isValidModel(id: string | undefined): id is ModelType {
  return typeof id === 'string' && VALID_MODELS.has(id);
}
