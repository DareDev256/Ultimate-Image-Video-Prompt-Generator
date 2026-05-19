import { createFalVideoRoute, validateAspect, validateNumber } from '@/lib/fal-video-route';

export const runtime = 'nodejs';
export const maxDuration = 300;

const ASPECTS = ['16:9', '9:16', '1:1'] as const;
const RESOLUTIONS = ['480p', '720p'] as const;
const DURATIONS = [5] as const;

/**
 * Wan 2.6 — Alibaba's open-source MoE video model. Available on fal.ai at
 * ~$0.05/sec. NOTE: confirm `fal-ai/wan-2.6/text-to-video` model path —
 * fal model IDs sometimes shift. Check fal.ai/models if 502s appear.
 */
export const POST = createFalVideoRoute({
  displayName: 'Wan 2.6',
  model: 'fal-ai/wan-2.6/text-to-video',
  buildInput: ({ prompt, body }) => {
    const aspect = validateAspect(body.aspectRatio ?? '16:9', ASPECTS);
    if (!aspect) return { ok: false, error: `Invalid aspect ratio. Must be one of: ${ASPECTS.join(', ')}` };

    const resolution = validateAspect(body.resolution ?? '720p', RESOLUTIONS);
    if (!resolution) return { ok: false, error: `Invalid resolution. Must be one of: ${RESOLUTIONS.join(', ')}` };

    const duration = validateNumber(body.duration ?? 5, DURATIONS);
    if (duration === null) return { ok: false, error: `Invalid duration. Must be one of: ${DURATIONS.join(', ')}` };

    return {
      ok: true,
      input: {
        prompt,
        aspect_ratio: aspect,
        resolution,
        num_frames: duration * 24,
      },
    };
  },
});
