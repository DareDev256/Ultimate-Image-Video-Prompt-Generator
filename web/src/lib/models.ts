import type { ModelType } from '@/context/WizardContext';

/** Human-readable display names keyed by model ID. */
export const MODEL_NAMES: Record<ModelType, string> = {
  'nano-banana': 'Nano Banana Pro',
  openai: 'GPT-Image-2',
  kling: 'Kling 3.0',
  seedance: 'Seedance 2.0',
  veo: 'Veo 3.1',
  wan: 'Wan 2.6',
  hunyuan: 'HunyuanVideo',
  ltx: 'LTX-Video 2.0',
  mochi: 'Mochi 1',
};

/** Provider badges — under the model name in UI. */
export const MODEL_PROVIDERS: Record<ModelType, string> = {
  'nano-banana': 'Google · Gemini 3 Pro',
  openai: 'OpenAI',
  kling: 'Kuaishou',
  seedance: 'ByteDance · via fal.ai',
  veo: 'Google DeepMind · via fal.ai',
  wan: 'Alibaba · open-source · via fal.ai',
  hunyuan: 'Tencent · open-source · via fal.ai',
  ltx: 'Lightricks · open-source · via fal.ai',
  mochi: 'Genmo · Apache 2.0 · via fal.ai',
};

/** Whether the model produces video (vs image). Drives wizard category routing. */
export const MODEL_KIND: Record<ModelType, 'image' | 'video'> = {
  'nano-banana': 'image',
  openai: 'image',
  kling: 'video',
  seedance: 'video',
  veo: 'video',
  wan: 'video',
  hunyuan: 'video',
  ltx: 'video',
  mochi: 'video',
};

/** Brand colors per model — used for badges, glows, and progress indicators. */
export const MODEL_COLORS: Record<ModelType, string> = {
  'nano-banana': '#00d4ff',   // electric cyan — Google
  openai: '#00ff88',           // hot green — OpenAI
  kling: '#ff00aa',            // hot magenta — Kling
  seedance: '#ffb300',         // amber — ByteDance / Seedance
  veo: '#7c4dff',              // deep violet — Veo / DeepMind
  wan: '#ff7e29',              // burnt orange — Wan / Alibaba
  hunyuan: '#3acaff',           // ice blue — Hunyuan / Tencent
  ltx: '#a3ff5b',              // electric lime — LTX / Lightricks
  mochi: '#ff5cc0',             // soft pink — Mochi / Genmo
};

const VALID_MODELS = new Set<string>(Object.keys(MODEL_NAMES));

/** Type guard: narrows an unknown string to `ModelType`. */
export function isValidModel(id: string | undefined): id is ModelType {
  return typeof id === 'string' && VALID_MODELS.has(id);
}

/** Convenience: is this model a video generator? */
export function isVideoModel(id: ModelType): boolean {
  return MODEL_KIND[id] === 'video';
}
