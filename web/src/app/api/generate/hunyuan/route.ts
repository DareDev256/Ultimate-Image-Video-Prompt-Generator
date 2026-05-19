import { createFalVideoRoute, validateAspect, validateNumber } from '@/lib/fal-video-route';

export const runtime = 'nodejs';
export const maxDuration = 300;

const ASPECTS = ['16:9', '9:16', '1:1'] as const;
const RESOLUTIONS = ['540p', '720p'] as const;
const DURATIONS = [5, 10] as const;

/**
 * HunyuanVideo — Tencent's 13B open-source video model. Available on
 * fal.ai at ~$0.40/video. Model path `fal-ai/hunyuan-video` is documented
 * on fal.ai/models.
 */
export const POST = createFalVideoRoute({
  displayName: 'HunyuanVideo',
  model: 'fal-ai/hunyuan-video',
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
        num_inference_steps: 30,
        num_frames: duration * 24,
      },
    };
  },
});
