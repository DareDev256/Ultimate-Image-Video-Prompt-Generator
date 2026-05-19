/**
 * Shared factory for fal.ai-hosted video model routes.
 *
 * fal.ai exposes many open-source video models behind the same queue API
 * (Wan, Hunyuan, LTX, Mochi, plus the proprietary ones we already have).
 * Every route does the same dance — validate prompt + key, validate the
 * provider's specific param shape, submit + poll, return a video URL.
 *
 * Use this factory to keep per-model route files thin (≤20 lines each):
 *
 *   export const POST = createFalVideoRoute({
 *     displayName: 'Wan 2.6',
 *     model: 'fal-ai/wan-2.6/text-to-video',
 *     buildInput: ({ prompt, body }) => ({ prompt, ... }),
 *   });
 *
 * The factory enforces the standard request shape:
 *   { prompt: string, apiKey: string, ...modelSpecificFields }
 */

import { NextRequest, NextResponse } from 'next/server';
import { validatePrompt, validateApiKey } from '@/lib/validation';
import { falQueueGenerate, FalQueueError } from '@/lib/fal-queue';

interface FalVideoOutput {
  video?: { url: string };
  seed?: number;
}

/** Discriminated build result so TypeScript narrows cleanly. */
export type BuildInputResult =
  | { ok: true; input: Record<string, unknown> }
  | { ok: false; error: string; status?: number };

interface FalVideoRouteConfig {
  /** Human-readable name returned in success response. */
  displayName: string;
  /** fal.ai model path (e.g. 'fal-ai/wan-2.6/text-to-video'). */
  model: string;
  /** Build the input payload for fal from the validated request body. */
  buildInput: (ctx: {
    prompt: string;
    body: Record<string, unknown>;
  }) => BuildInputResult;
  /** Optional custom poll interval (ms). Default 5000. */
  intervalMs?: number;
  /** Optional custom max poll attempts. Default 60 (5 min). */
  maxAttempts?: number;
}

export function createFalVideoRoute(config: FalVideoRouteConfig) {
  return async function POST(request: NextRequest) {
    try {
      const body = (await request.json()) as Record<string, unknown>;
      const { prompt, apiKey } = body as { prompt?: unknown; apiKey?: unknown };

      const promptResult = validatePrompt(prompt);
      if (!promptResult.valid) return promptResult.error;

      const keyResult = validateApiKey(apiKey);
      if (!keyResult.valid) return keyResult.error;

      const built = config.buildInput({ prompt: promptResult.sanitized, body });
      if (!built.ok) {
        return NextResponse.json({ error: built.error }, { status: built.status ?? 400 });
      }

      const { output, requestId } = await falQueueGenerate<Record<string, unknown>, FalVideoOutput>({
        model: config.model,
        apiKey: keyResult.key,
        input: built.input,
        intervalMs: config.intervalMs,
        maxAttempts: config.maxAttempts,
      });

      const videoUrl = output.video?.url;
      if (!videoUrl) {
        return NextResponse.json({ error: 'No video URL in response' }, { status: 502 });
      }

      return NextResponse.json({
        videoUrl,
        taskId: requestId,
        seed: output.seed,
        model: config.displayName,
      });
    } catch (error) {
      if (error instanceof FalQueueError) {
        return NextResponse.json({ error: error.publicMessage }, { status: error.status });
      }
      console.error(`${config.displayName} generation error:`, error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

/** Common validators reusable across video routes. */
export function validateAspect(v: unknown, allowed: readonly string[]): string | null {
  if (typeof v !== 'string' || !allowed.includes(v)) return null;
  return v;
}

export function validateNumber(v: unknown, allowed: readonly number[]): number | null {
  if (typeof v !== 'number' || !allowed.includes(v)) return null;
  return v;
}
