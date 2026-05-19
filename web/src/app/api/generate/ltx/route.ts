import { createFalVideoRoute, validateAspect } from '@/lib/fal-video-route';

export const runtime = 'nodejs';
export const maxDuration = 300;

const ASPECTS = ['16:9', '9:16', '1:1'] as const;
const RESOLUTIONS = ['720p', '1080p'] as const;

/**
 * LTX-Video 2.0 — Lightricks' open-source DiT-based video model. Cheapest
 * hosted option at ~$0.04/sec. Released January 2026, 1080p–4K capable.
 * Verify the exact model path on fal.ai/models if needed.
 */
export const POST = createFalVideoRoute({
  displayName: 'LTX-Video 2.0',
  model: 'fal-ai/ltx-video-2.0',
  buildInput: ({ prompt, body }) => {
    const aspect = validateAspect(body.aspectRatio ?? '16:9', ASPECTS);
    if (!aspect) return { ok: false, error: `Invalid aspect ratio. Must be one of: ${ASPECTS.join(', ')}` };

    const resolution = validateAspect(body.resolution ?? '720p', RESOLUTIONS);
    if (!resolution) return { ok: false, error: `Invalid resolution. Must be one of: ${RESOLUTIONS.join(', ')}` };

    return {
      ok: true,
      input: {
        prompt,
        aspect_ratio: aspect,
        resolution,
      },
    };
  },
});
