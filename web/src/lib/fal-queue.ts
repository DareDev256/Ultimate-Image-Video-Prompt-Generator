/**
 * fal.ai queue-API helper.
 *
 * fal exposes a queue endpoint pattern shared across all hosted models:
 *   POST https://queue.fal.run/<model>                            → enqueues, returns request_id
 *   GET  https://queue.fal.run/<model>/requests/<id>/status       → polls status
 *   GET  https://queue.fal.run/<model>/requests/<id>              → final result when COMPLETED
 *
 * Used by /api/generate/seedance and /api/generate/veo. Same auth, same shape, two model IDs.
 */

const FAL_QUEUE_BASE = 'https://queue.fal.run';

export interface FalQueueOptions<TInput> {
  /** fal model path, e.g. 'bytedance/seedance-2.0/text-to-video' or 'fal-ai/veo3.1'. */
  model: string;
  /** Provider-specific input payload. */
  input: TInput;
  /** User-supplied fal API key (BYOK — no server free tier for video). */
  apiKey: string;
  /** Polling interval in ms. Default 5s — matches fal's recommended cadence. */
  intervalMs?: number;
  /** Max poll attempts before timing out. Default 60 (5min @ 5s). */
  maxAttempts?: number;
}

export interface FalQueueResult<TOutput> {
  output: TOutput;
  requestId: string;
}

export class FalQueueError extends Error {
  constructor(public readonly status: number, public readonly publicMessage: string) {
    super(publicMessage);
    this.name = 'FalQueueError';
  }
}

/** Generic error mapper — never leak upstream payloads to client. */
function mapStatus(upstreamStatus: number): { status: number; msg: string } {
  if (upstreamStatus === 401 || upstreamStatus === 403) return { status: 401, msg: 'Invalid API key' };
  if (upstreamStatus === 429) return { status: 429, msg: 'Rate limit exceeded' };
  return { status: 502, msg: 'Upstream generation failed' };
}

export async function falQueueGenerate<TInput, TOutput>(
  opts: FalQueueOptions<TInput>
): Promise<FalQueueResult<TOutput>> {
  const { model, input, apiKey, intervalMs = 5000, maxAttempts = 60 } = opts;
  const headers = {
    Authorization: `Key ${apiKey}`,
    'Content-Type': 'application/json',
  };

  // 1. Enqueue
  const submitRes = await fetch(`${FAL_QUEUE_BASE}/${model}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
  if (!submitRes.ok) {
    const { status, msg } = mapStatus(submitRes.status);
    const upstream = await submitRes.json().catch(() => ({}));
    console.error(`fal submit failed (${model}):`, submitRes.status, upstream);
    throw new FalQueueError(status, msg);
  }
  const submitData = (await submitRes.json()) as { request_id?: string };
  const requestId = submitData.request_id;
  if (!requestId) throw new FalQueueError(502, 'No request ID returned');

  // 2. Poll
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, intervalMs));

    const statusRes = await fetch(
      `${FAL_QUEUE_BASE}/${model}/requests/${requestId}/status`,
      { method: 'GET', headers: { Authorization: `Key ${apiKey}` } }
    );
    if (!statusRes.ok) {
      // Transient poll failure — try once more, then bail.
      if (attempt < maxAttempts - 1) continue;
      const { status, msg } = mapStatus(statusRes.status);
      throw new FalQueueError(status, msg);
    }
    const statusData = (await statusRes.json()) as { status?: string; queue_position?: number };

    if (statusData.status === 'COMPLETED') {
      const resultRes = await fetch(
        `${FAL_QUEUE_BASE}/${model}/requests/${requestId}`,
        { method: 'GET', headers: { Authorization: `Key ${apiKey}` } }
      );
      if (!resultRes.ok) {
        const { status, msg } = mapStatus(resultRes.status);
        throw new FalQueueError(status, msg);
      }
      const output = (await resultRes.json()) as TOutput;
      return { output, requestId };
    }
    if (statusData.status === 'FAILED' || statusData.status === 'ERROR') {
      throw new FalQueueError(500, 'Generation failed');
    }
    // Otherwise IN_QUEUE / IN_PROGRESS — keep polling.
  }

  throw new FalQueueError(504, 'Generation timed out');
}
