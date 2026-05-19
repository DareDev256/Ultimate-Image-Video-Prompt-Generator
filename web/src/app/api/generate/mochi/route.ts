import { createFalVideoRoute, validateAspect } from '@/lib/fal-video-route';

export const runtime = 'nodejs';
export const maxDuration = 300;

const ASPECTS = ['16:9'] as const;

/**
 * Mochi 1 — Genmo AI's 10B Apache 2.0-licensed video model. Available on
 * fal.ai. The most permissive licensing among open-source video models —
 * good pick if downstream commercial use matters.
 */
export const POST = createFalVideoRoute({
  displayName: 'Mochi 1',
  model: 'fal-ai/mochi-v1',
  buildInput: ({ prompt, body }) => {
    const aspect = validateAspect(body.aspectRatio ?? '16:9', ASPECTS);
    if (!aspect) return { ok: false, error: `Mochi 1 currently supports 16:9 only` };

    return {
      ok: true,
      input: {
        prompt,
        aspect_ratio: aspect,
        enable_prompt_expansion: typeof body.enablePromptExpansion === 'boolean' ? body.enablePromptExpansion : true,
      },
    };
  },
});
