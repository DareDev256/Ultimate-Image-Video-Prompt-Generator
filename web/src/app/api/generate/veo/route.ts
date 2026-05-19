import { NextRequest, NextResponse } from 'next/server';
import { validatePrompt, validateApiKey } from '@/lib/validation';
import { falQueueGenerate, FalQueueError } from '@/lib/fal-queue';

export const runtime = 'nodejs';
export const maxDuration = 300;

const VALID_DURATIONS = [4, 6, 8] as const;
const VALID_ASPECT_RATIOS = ['16:9', '9:16', '1:1'] as const;
const VALID_RESOLUTIONS = ['720p', '1080p'] as const;
const VALID_TIERS = ['pro', 'fast'] as const;

type ValidDuration = (typeof VALID_DURATIONS)[number];
type ValidAspect = (typeof VALID_ASPECT_RATIOS)[number];
type ValidResolution = (typeof VALID_RESOLUTIONS)[number];
type ValidTier = (typeof VALID_TIERS)[number];

function isDuration(v: unknown): v is ValidDuration {
  return typeof v === 'number' && (VALID_DURATIONS as readonly number[]).includes(v);
}
function isAspect(v: unknown): v is ValidAspect {
  return typeof v === 'string' && (VALID_ASPECT_RATIOS as readonly string[]).includes(v);
}
function isResolution(v: unknown): v is ValidResolution {
  return typeof v === 'string' && (VALID_RESOLUTIONS as readonly string[]).includes(v);
}
function isTier(v: unknown): v is ValidTier {
  return typeof v === 'string' && (VALID_TIERS as readonly string[]).includes(v);
}

interface VeoInput {
  prompt: string;
  duration: string;            // Veo expects "4s" / "6s" / "8s"
  aspect_ratio: string;
  resolution: string;
  generate_audio: boolean;
}

interface VeoOutput {
  video?: { url: string };
  seed?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, apiKey } = body;
    const duration = body.duration ?? 8;
    const aspectRatio = body.aspectRatio ?? '16:9';
    const resolution = body.resolution ?? '1080p';
    const tier = body.tier ?? 'pro';
    const generateAudio = body.generateAudio ?? true; // Veo's headline feature

    const promptResult = validatePrompt(prompt);
    if (!promptResult.valid) return promptResult.error;

    const keyResult = validateApiKey(apiKey);
    if (!keyResult.valid) return keyResult.error;

    if (!isDuration(duration)) {
      return NextResponse.json(
        { error: `Invalid duration. Must be one of: ${VALID_DURATIONS.join(', ')} seconds` },
        { status: 400 }
      );
    }
    if (!isAspect(aspectRatio)) {
      return NextResponse.json(
        { error: `Invalid aspect ratio. Must be one of: ${VALID_ASPECT_RATIOS.join(', ')}` },
        { status: 400 }
      );
    }
    if (!isResolution(resolution)) {
      return NextResponse.json(
        { error: `Invalid resolution. Must be one of: ${VALID_RESOLUTIONS.join(', ')}` },
        { status: 400 }
      );
    }
    if (!isTier(tier)) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${VALID_TIERS.join(', ')}` },
        { status: 400 }
      );
    }

    // Pro = max quality (1080p, native audio); Fast = budget tier.
    const model = tier === 'fast' ? 'fal-ai/veo3.1/fast' : 'fal-ai/veo3.1';

    const { output, requestId } = await falQueueGenerate<VeoInput, VeoOutput>({
      model,
      apiKey: keyResult.key,
      input: {
        prompt: promptResult.sanitized,
        duration: `${duration}s`,
        aspect_ratio: aspectRatio,
        resolution,
        generate_audio: generateAudio,
      },
    });

    const videoUrl = output.video?.url;
    if (!videoUrl) {
      return NextResponse.json({ error: 'No video URL in response' }, { status: 502 });
    }

    return NextResponse.json({
      videoUrl,
      taskId: requestId,
      duration,
      seed: output.seed,
      model: tier === 'fast' ? 'Veo 3.1 Fast' : 'Veo 3.1',
      hasAudio: generateAudio,
    });
  } catch (error) {
    if (error instanceof FalQueueError) {
      return NextResponse.json({ error: error.publicMessage }, { status: error.status });
    }
    console.error('Veo generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
